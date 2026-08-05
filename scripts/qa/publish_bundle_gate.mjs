#!/usr/bin/env node
//
// publish_bundle_gate.mjs: the math bundle is COMPLETE, not merely present.
//
// S2-C075. The step this replaces, at .github/workflows/publish-stake-engine.yml,
// was one line:
//
//     test -f "$MATH_PATH/index.json" || { echo "::error::..."; exit 1; }
//     echo "math bundle OK: $MATH_PATH"
//
// The EXISTENCE of index.json stood in for the bundle being complete, and the
// next steps then hand that directory to `stakecli upload --type math`.
//
// WHY THAT IS SEVERE RATHER THAN UNTIDY, measured rather than argued.
// .gitignore:9 is `**/library/**`, so the bundle directory is ignored wholesale.
// `git ls-files` over it returns index.json, game_metadata.json and the five
// lookUpTable CSVs, and NOT the five books_*.jsonl.zst files. So on a fresh
// checkout, which is what a CI runner has, the directory contains a
// complete-looking index.json naming five modes and NONE of the events files it
// names. `test -f index.json` returns 0, the step prints "math bundle OK", and an
// incomplete bundle goes up.
//
// WHAT THIS GATE DOES. Parses index.json, walks `modes`, and requires every
// `events` and every `weights` path it names to exist and to be non-empty. Fails
// with the full list rather than the first miss, because a publish operator wants
// to know what to fetch, not to rediscover it one run at a time.
//
// WHAT IT DELIBERATELY DOES NOT DO. It does not check the CONTENTS of the books,
// their row counts, their RTP or their hashes. scripts/validate_math.py owns that
// and owns it properly. This gate answers exactly one question, the one the
// workflow was asking and getting wrong: is everything index.json promises
// actually here.
//
// games/future_spinner/** is a LOCKED PATH. This gate READS it and never writes
// there. The self-test builds its fixtures under a temp directory and the seeds
// are NEVER produced by removing real files from the bundle.
//
// USAGE
//   node scripts/qa/publish_bundle_gate.mjs [bundle-dir]
//   node scripts/qa/publish_bundle_gate.mjs --self-test
//
import { existsSync, statSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..', '..')
const DEFAULT_BUNDLE = join(REPO, 'games', 'future_spinner', 'library', 'publish_files')

/**
 * Check one bundle directory.
 *
 * Returns { ok, missing[], checked, modes } and never throws for a bundle
 * problem: an unreadable or unparseable index.json is a FINDING, not a crash,
 * because a crash in CI reads as an infrastructure fault rather than as a bad
 * bundle and gets retried instead of fixed.
 */
export function checkBundle(dir) {
  const missing = []
  const indexPath = join(dir, 'index.json')

  if (!existsSync(indexPath)) {
    return { ok: false, missing: [{ kind: 'index', mode: '-', file: 'index.json', why: 'not found' }], checked: 0, modes: 0 }
  }

  let index
  try {
    index = JSON.parse(readFileSync(indexPath, 'utf-8'))
  } catch (err) {
    return { ok: false, missing: [{ kind: 'index', mode: '-', file: 'index.json', why: `unparseable: ${err.message}` }], checked: 0, modes: 0 }
  }

  const modes = Array.isArray(index.modes) ? index.modes : null
  if (!modes || modes.length === 0) {
    // An index with no modes would otherwise pass vacuously, which is the same
    // unfalsifiable shape as the check this gate replaces.
    return { ok: false, missing: [{ kind: 'index', mode: '-', file: 'index.json', why: 'names no modes, so it promises nothing and cannot be verified' }], checked: 0, modes: 0 }
  }

  let checked = 0
  for (const mode of modes) {
    const name = mode.name || '(unnamed)'
    for (const kind of ['events', 'weights']) {
      const rel = mode[kind]
      if (!rel) {
        missing.push({ kind, mode: name, file: '(not named)', why: `index.json names no ${kind} for this mode` })
        continue
      }
      checked++
      const abs = join(dir, rel)
      if (!existsSync(abs)) {
        missing.push({ kind, mode: name, file: rel, why: 'not found' })
        continue
      }
      // Zero bytes is the other real form. A truncated or touched-into-existence
      // placeholder satisfies `test -f` exactly as well as the real thing does.
      if (statSync(abs).size === 0) {
        missing.push({ kind, mode: name, file: rel, why: 'present but ZERO BYTES' })
      }
    }
  }

  return { ok: missing.length === 0, missing, checked, modes: modes.length }
}

function report(dir, result) {
  if (result.ok) {
    console.log(`PUBLISH BUNDLE GATE: PASS (${result.modes} mode(s), ${result.checked} file(s) named by index.json, all present and non-empty)`)
    console.log(`  bundle: ${dir}`)
    return
  }
  console.error(`::error::math bundle incomplete: ${result.missing.length} file(s) named by index.json are missing from ${dir}`)
  for (const m of result.missing) {
    console.error(`  mode ${String(m.mode).padEnd(10)} ${String(m.kind).padEnd(8)} ${String(m.file).padEnd(28)} ${m.why}`)
  }
  console.error('')
  console.error('The bundle directory is gitignored (.gitignore:9, **/library/**), so a fresh')
  console.error('checkout does NOT carry the books files. If this is a CI runner, that is the')
  console.error('expected state and the open question is how the books reach it: see')
  console.error('reports/qa/session9/OWNER_PARK_PROPOSALS.md. Uploading anyway would publish a')
  console.error('bundle whose index.json promises five modes it does not ship.')
}

// ── convention (p): the seeded self-test ─────────────────────────────────────
//
// THE SEED IS NOT CONTRIVED. "A complete-looking index.json naming five modes
// with the events files absent" is LITERALLY the state of the real bundle
// directory on a fresh checkout, which is what the runner has. The fixture just
// reproduces it somewhere this gate is allowed to write.

function writeFixture(root, name, { omit = [], zero = [], index } = {}) {
  const dir = join(root, name)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.json'), JSON.stringify(index, null, 2))
  for (const mode of index.modes || []) {
    for (const kind of ['events', 'weights']) {
      const rel = mode[kind]
      if (!rel || omit.includes(rel)) continue
      writeFileSync(join(dir, rel), zero.includes(rel) ? '' : 'x')
    }
  }
  return dir
}

function selfTest() {
  const root = mkdtempSync(join(tmpdir(), 'publish-bundle-gate-'))
  const results = []
  const check = (name, pass, detail) => {
    results.push(pass)
    console.log(`  ${pass ? 'pass' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
  }

  console.log('PUBLISH BUNDLE GATE SELF-TEST')
  console.log(`  fixtures under ${root}`)
  console.log('  the real bundle directory is never written to by this mode')
  console.log('')

  // The real index.json's shape, so the fixtures exercise the parse this gate
  // will actually perform rather than a shape invented for the test.
  const INDEX = {
    modes: [
      { name: 'base', cost: 1.0, events: 'books_base.jsonl.zst', weights: 'lookUpTable_base_0.csv' },
      { name: 'cruise', cost: 1.0, events: 'books_cruise.jsonl.zst', weights: 'lookUpTable_cruise_0.csv' },
      { name: 'antelite', cost: 1.25, events: 'books_antelite.jsonl.zst', weights: 'lookUpTable_antelite_0.csv' },
      { name: 'bonus', cost: 100.0, events: 'books_bonus.jsonl.zst', weights: 'lookUpTable_bonus_0.csv' },
      { name: 'super', cost: 400.0, events: 'books_super.jsonl.zst', weights: 'lookUpTable_super_0.csv' },
    ],
  }
  const EVENTS = INDEX.modes.map((m) => m.events)

  // CONTROL 1 first. A gate that always fails would "catch" every seed below.
  const complete = checkBundle(writeFixture(root, 'complete', { index: INDEX }))
  check('CONTROL a complete bundle PASSES', complete.ok === true,
    `${complete.modes} modes, ${complete.checked} files checked`)

  // SEED 1: THE STATE OF A FRESH CHECKOUT. index.json names five modes and not
  // one events file is there. This is the defect the old `test -f` passed.
  const noEvents = checkBundle(writeFixture(root, 'missing_events', { index: INDEX, omit: EVENTS }))
  check('SEED all five events files absent is CAUGHT', noEvents.ok === false && noEvents.missing.length === 5,
    `${noEvents.missing.length} finding(s)`)
  check('SEED and every missing mode is NAMED', EVENTS.every((f) => noEvents.missing.some((m) => m.file === f)),
    noEvents.missing.map((m) => m.mode).join(', '))

  // SEED 2: one weights file gone. Proves the gate is not only looking at events.
  const oneWeight = checkBundle(writeFixture(root, 'missing_one_weight', { index: INDEX, omit: ['lookUpTable_super_0.csv'] }))
  check('SEED a single missing weights file is CAUGHT', oneWeight.ok === false && oneWeight.missing.length === 1,
    oneWeight.missing[0] ? `${oneWeight.missing[0].mode}/${oneWeight.missing[0].file}` : 'not caught')

  // SEED 3: present but zero bytes, which satisfies `test -f` exactly as well as
  // a real file does. This is the form a truncated fetch or a `touch` produces.
  const zeroByte = checkBundle(writeFixture(root, 'zero_byte_events', { index: INDEX, zero: ['books_bonus.jsonl.zst'] }))
  check('SEED a zero-byte events file is CAUGHT', zeroByte.ok === false && /ZERO BYTES/.test(zeroByte.missing[0]?.why || ''),
    zeroByte.missing[0]?.why || 'not caught')

  // SEED 4: an index that promises nothing must not pass vacuously.
  const emptyIndex = checkBundle(writeFixture(root, 'empty_index', { index: { modes: [] } }))
  check('SEED an index naming no modes is CAUGHT', emptyIndex.ok === false,
    emptyIndex.missing[0]?.why || 'not caught')

  // SEED 5: the old check's entire predicate. index.json missing.
  const noIndex = checkBundle(join(root, 'does_not_exist'))
  check('SEED a missing index.json is CAUGHT', noIndex.ok === false, noIndex.missing[0]?.why || 'not caught')

  // CONTROL 2: the seeds are SPECIFIC. Removing one weights file must not report
  // the events files as missing too.
  check('CONTROL the single-weight seed implicates only that file',
    oneWeight.missing.every((m) => m.kind === 'weights'),
    oneWeight.missing.map((m) => m.kind).join(', '))

  rmSync(root, { recursive: true, force: true })

  const failed = results.filter((r) => !r).length
  console.log('')
  console.log(`PUBLISH BUNDLE GATE SELF-TEST: ${failed ? 'FAIL' : 'PASS'} `
    + `(${results.length - failed}/${results.length}, 6 seeds, 2 paired controls)`)
  return failed === 0
}

const argv = process.argv.slice(2)
if (argv.includes('--self-test')) {
  process.exit(selfTest() ? 0 : 1)
}

const bundleDir = argv.find((a) => !a.startsWith('--')) || DEFAULT_BUNDLE
const result = checkBundle(bundleDir)
report(bundleDir, result)
process.exit(result.ok ? 0 : 1)
