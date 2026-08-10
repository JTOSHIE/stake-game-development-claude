// evidence_hygiene_gate.mjs
//
// CONVENTION (h.1) AS A GATE RATHER THAN AS A HABIT. R042 TASK A7.
//
// THE RULE. Proof and gate scripts write to SCRATCH. Committed evidence
// directories are written only by a job that explicitly says it is regenerating
// evidence, which `evidencePaths.mjs` expresses as FS_WRITE_EVIDENCE=1.
//
// WHY A GATE. The convention was written in July after four committed capture
// files were found silently rewritten by a re-run, and two scripts were migrated
// onto `evidenceDir()` at the time. THREE WERE MISSED, and nothing noticed for a
// fortnight: on 2026-08-10 a review pass dirtied EIGHTEEN committed evidence
// files simply by running `social_string_conformance.mjs`. Evidence a casual run
// can overwrite is not evidence, and a convention with no instrument is a
// convention that decays at exactly the rate people forget it.
//
// WHAT IT CHECKS, and why statically. The honest end-to-end test is "run every
// gate and see whether `git status` is still clean", but those gates drive
// browsers and take minutes, so nobody would run it and CI would not either.
// This asserts the PROPERTY THAT MAKES IT TRUE instead: no script builds a
// literal path into a committed evidence directory. That is checkable in
// milliseconds and cannot be satisfied by accident.
//
// Convention (p):
//   node scripts/evidence_hygiene_gate.mjs --self-test
//   node scripts/evidence_hygiene_gate.mjs
//
// Reads only; writes nothing outside a temp dir it removes.

import { readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SCRIPTS = join(ROOT, 'scripts')

/**
 * A path expression that reaches a COMMITTED evidence directory.
 *
 * Matches the shapes actually used in this tree: `join(__dirname, '..', '..',
 * 'reports', 'screens', ...)` and the same with 'qa', in any quoting, plus the
 * string forms `'reports/screens/...'` and `"../../reports/qa"`.
 *
 * `evidenceDir('reports', 'screens', ...)` is the CORRECT form and is not
 * matched, because the offending shape is the one that walks up from __dirname
 * or embeds the path in a string literal.
 */
const COMMITTED_WRITE = [
  /join\(\s*__dirname[^)]*['"]reports['"]\s*,\s*['"](screens|qa)['"]/,
  /['"]\.\.\/\.\.\/reports\/(screens|qa)/,
]

/**
 * A bare `'reports/qa/...'` string is only an offence when the line is BUILDING
 * AN OUTPUT PATH. The first draft flagged
 *   supersedes: 'reports/qa/social_string_conformance_2026-07-14b.json'
 * in a metadata block, which names a file it does not write, and put a gate that
 * had just been migrated back onto its own baseline. A rule that cannot tell a
 * citation from a write is a rule that teaches people to ignore it.
 */
const BARE_PATH = /['"](\.\/)?reports\/(screens|qa)\//
const LOOKS_LIKE_OUTPUT = /(writeFileSync|screenshot|mkdirSync|_DIR\s*=|OUT\s*=|path:\s*)/

/** Named exemptions, each with a reason. */
const ALLOW = new Set([
  // The helper itself must name the real tree; that is its whole job.
  'lib/evidencePaths.mjs',
  // This gate quotes the offending shapes in order to detect them.
  'evidence_hygiene_gate.mjs',
  // Kit build writes the OWNER'S upload folder, not repository evidence.
  'kit_build.mjs',
])

export function offendersIn(src) {
  const out = []
  for (const [i, line] of src.split('\n').entries()) {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue          // comments describe, they do not write
    let hit = COMMITTED_WRITE.some((re) => re.test(line))
    if (!hit && BARE_PATH.test(line) && LOOKS_LIKE_OUTPUT.test(line)) hit = true
    if (hit) out.push({ line: i + 1, text: line.trim().slice(0, 120) })
  }
  return out
}

function walk(dir, rel = '') {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name
    if (e.isDirectory()) { out.push(...walk(join(dir, e.name), r)); continue }
    if (e.name.endsWith('.mjs') || e.name.endsWith('.js')) out.push([r, join(dir, e.name)])
  }
  return out
}

// ── self-test ────────────────────────────────────────────────────────────────
if (process.argv.includes('--self-test')) {
  const tmp = mkdtempSync(join(tmpdir(), 'evhyg-'))
  const CASES = [
    ['the exact shape that dirtied 18 files: join(__dirname) up into reports/screens', true,
      "const SCREENS_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'social-dom-conformance')"],
    ['the same shape into reports/qa', true,
      "const OUT_DIR = join(__dirname, '..', '..', 'reports', 'qa')"],
    ['a relative string form', true,
      "const OUT = '../../reports/screens/foo'"],
    ['NEGATIVE CONTROL: the correct evidenceDir form must pass', false,
      "const OUT_DIR = evidenceDir('reports', 'qa')"],
    ['NEGATIVE CONTROL: a COMMENT describing the old path must pass, or every '
      + 'migrated file would fail on its own explanation', false,
      "// used to write to join(__dirname, '..', '..', 'reports', 'screens')"],
    ['NEGATIVE CONTROL: a scratch path must pass', false,
      "const OUT = join(ROOT, '.scratch', 'r042')"],
    ['NEGATIVE CONTROL: METADATA CITING a committed evidence file must pass. The '
      + 'first draft flagged this and put a just-migrated gate back on its own '
      + 'baseline, which is how a gate teaches people to ignore it', false,
      "  supersedes: 'reports/qa/social_string_conformance_2026-07-14b.json',"],
    ['a bare reports/qa string that IS an output path is still caught', true,
      "  writeFileSync('reports/qa/out.json', body)"],
  ]
  let bad = 0
  for (const [why, shouldFlag, line] of CASES) {
    const p = join(tmp, 'c.mjs')
    writeFileSync(p, line + '\n')
    const flagged = offendersIn(readFileSync(p, 'utf8')).length > 0
    const ok = flagged === shouldFlag
    if (!ok) bad++
    console.log(`  ${ok ? 'caught ' : 'MISSED '} seeded: ${why}`)
  }
  rmSync(tmp, { recursive: true, force: true })
  const seeded = CASES.filter((c) => c[1]).length
  console.log(bad === 0
    ? `\nEVIDENCE HYGIENE SELF-TEST: PASS (${seeded} seeded, ${CASES.length - seeded} negative controls)`
    : `\nEVIDENCE HYGIENE SELF-TEST: FAIL (${bad})`)
  process.exit(bad === 0 ? 0 : 1)
}

// ── run ──────────────────────────────────────────────────────────────────────
//
// A FROZEN RATCHET, not a clean sheet, and the honesty matters more than a green
// tick. Turning this on found FAR more than R042 A7's three gates: a long tail of
// one-off proof scripts, most written for a single pass and never re-run, all
// still pointing at committed evidence. Fixing every one of them in this session
// would be a different job from the one that was briefed, and landing the gate
// red would breach rule 10.
//
// So the existing set is FROZEN and the list ONLY SHRINKS. Anything new fails
// immediately, which is the property that matters: the class cannot grow while
// the tail is worked off. Checked in BOTH directions, so a script that is fixed
// without burning its entry also fails, and the baseline cannot rust into a
// blanket exemption.
//
// THE THREE R042 A7 MIGRATED ARE DELIBERATELY ABSENT from the baseline:
// social_string_conformance, social_dom_conformance and locale_prose_conformance
// are the ones that actually run often enough to dirty a tree, and they are the
// reason this gate exists.
const BASELINE = new Set(JSON.parse(readFileSync(join(SCRIPTS, 'evidence_hygiene_baseline.json'), 'utf8')).frozen)

const all = walk(SCRIPTS)
const found = []
for (const [rel, abs] of all) {
  if (ALLOW.has(rel)) continue
  for (const o of offendersIn(readFileSync(abs, 'utf8'))) found.push({ rel, ...o })
}
const foundFiles = new Set(found.map((f) => f.rel))

if (process.argv.includes('--freeze')) {
  writeFileSync(join(SCRIPTS, 'evidence_hygiene_baseline.json'), JSON.stringify({
    _what: 'Scripts that still write into a committed evidence directory. THIS LIST ONLY SHRINKS.',
    _rule: 'convention (h.1); use evidenceDir() from scripts/lib/evidencePaths.mjs',
    frozen_count: foundFiles.size,
    frozen: [...foundFiles].sort(),
  }, null, 2) + '\n')
  console.log(`EVIDENCE HYGIENE: froze ${foundFiles.size} script(s)`)
  process.exit(0)
}

const added = [...foundFiles].filter((f) => !BASELINE.has(f))
const rusted = [...BASELINE].filter((f) => !foundFiles.has(f))

console.log(`EVIDENCE HYGIENE: ${all.length} script(s) scanned, ${foundFiles.size} still writing to committed evidence, ${BASELINE.size} frozen`)

let failed = false
if (added.length) {
  failed = true
  console.error('\nEVIDENCE HYGIENE: FAIL, a NEW script writes into a COMMITTED evidence directory')
  for (const f of found.filter((x) => added.includes(x.rel))) {
    console.error(`  ${f.rel}:${f.line}\n      ${f.text}`)
  }
  console.error('\nUse evidenceDir(...) from scripts/lib/evidencePaths.mjs. A plain run must')
  console.error('leave the working tree clean; FS_WRITE_EVIDENCE=1 is the deliberate opt-in.')
}
if (rusted.length) {
  failed = true
  console.error('\nEVIDENCE HYGIENE: FAIL, a frozen entry no longer matches, so the ratchet has rusted:')
  for (const f of rusted) console.error(`  ${f} was fixed without burning its baseline entry`)
}
if (failed) process.exit(1)
console.log(`\nEVIDENCE HYGIENE: PASS (${BASELINE.size} frozen, and the list only shrinks)`)
