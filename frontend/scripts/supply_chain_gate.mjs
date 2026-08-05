// supply_chain_gate.mjs, Session 8 (2026-08-04). S2-C049, S2-C051, and the
// scannable half of S2-C048.
//
// WHAT THIS IS
// ------------
// One instrument over ONE input: frontend/package-lock.json, resolved. Four
// independent properties of the production dependency closure, plus the
// vulnerability scan, plus a dated artefact a reviewer can open.
//
// The three rows fold together because they read the same file at the same
// point in the same job. They are not three instruments.
//
// WHY LOCKFILE ONLY, stated because a reader will ask
// --------------------------------------------------
// S2-C048 also mentions scanning the built bundle. That is deliberately NOT
// here. dist_hygiene_gate.mjs already walks dist and already carries S2-C052's
// dev-hook scan, and a second dist walker in a second script is the duplication
// this project keeps recording and then deleting. dist belongs to that gate;
// the lockfile belongs to this one.
//
// WHAT THIS REFUSES TO CLAIM
// --------------------------
// (1) IT IS NOT AN ANTI-MALWARE SCAN, and S2-C048 asked for one.
//
//     For a genuine anti-malware pass the honest convention (p) seed is the
//     EICAR test string planted and OBSERVED DETECTED. That is what EICAR is
//     for. There is no scanner on this runner: clamscan, clamdscan and
//     freshclam are all absent locally. With no scanner there is nothing for
//     EICAR to be detected by, so a step that walks a directory, matches
//     nothing and prints PASS would have NO SEED THAT COULD MAKE IT RED.
//
//     That is the exact failure convention (p) exists to prevent, and shipping
//     a walk labelled "anti-malware" with nothing behind it would put a false
//     compliance claim into a submission record. Installing ClamAV is a real
//     option, but it costs a new apt binary and a signature download on every
//     run against a 15 minute job timeout, and a signature database is
//     non-deterministic by design. That is its own decision and its own commit.
//
//     What IS shipped instead is named for what it actually measures. The
//     install-hook check below is the highest-value npm supply-chain control
//     available offline, and it converts `npm ci --ignore-scripts` from a flag
//     someone remembered to type into a property that is checked.
//
// (2) THE PINNED LICENCE TEXT DOES NOT EXIST, and S2-C051 asked for its hash.
//
//     The row says to fetch the LICENCE text at the pinned commit rather than
//     trust the package.json field. There is no such text. Measured: all four
//     candidate paths (LICENSE, LICENCE, LICENSE.md, COPYING) return 404 at
//     df9e126d, GitHub's own licence detector reports null for the repository,
//     and the installed package directory contains none, which is evidence
//     rather than a packing artefact because npm always includes those names.
//     The repository already recorded this at
//     docs/records/tooling/TOOL_VETTING_2026-07.md:15, "ISC declared, no
//     LICENSE file".
//
//     So the only licence assertion available for that one dependency is the
//     field the row says not to trust. Rather than fetch nothing and record a
//     hash of it, this gate PINS THE REF instead: the recorded commit is
//     asserted against the lockfile, so the pin moving underneath a stale
//     record goes red. That is the defect in the form it can actually occur,
//     and it needs no network.
//
// Run (from frontend/):  node scripts/supply_chain_gate.mjs
// Self-test:             node scripts/supply_chain_gate.mjs --self-test

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { evidenceDir, announceEvidenceMode } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const LOCK = join(ROOT, 'package-lock.json')
const SELF_TEST = process.argv.includes('--self-test')
const QA = evidenceDir('reports', 'qa')
announceEvidenceMode('supply_chain_gate')

const failures = []
const check = (name, cond, detail = '') => {
  if (!cond) failures.push({ name, detail })
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond || !detail ? '' : `  ${detail}`}`)
}

/**
 * Every production entry of a resolved lockfile, keyed by its node_modules path.
 * `dev: true` entries are excluded: they never reach a player, and including
 * them would make the licence allowlist argue about build tooling.
 */
function prodPackages(lock) {
  return Object.entries(lock.packages || {})
    .filter(([path, meta]) => path && !meta.dev)
    .map(([path, meta]) => ({ path, ...meta }))
}

// ── Property 1: licences ─────────────────────────────────────────────────────
//
// The allowlist is permissive-only. Everything the closure ships today is in
// it (measured: MIT 63, ISC 2, BSD-3-Clause 1, OFL-1.1 1, across 67 production
// entries). Apache-2.0 and BSD-2-Clause are included although nothing uses them
// yet, because they are unambiguously permissive and their absence would turn a
// routine dependency bump into a spurious red. Anything copyleft is out, which
// is the class this exists to catch: a GPL or AGPL dependency reaching a
// commercial bundle is a licensing incident, not a style question.
const LICENCE_ALLOWLIST = ['MIT', 'ISC', 'BSD-3-Clause', 'BSD-2-Clause', 'OFL-1.1', 'Apache-2.0', '0BSD']

function licenceViolations(lock, allowlist = LICENCE_ALLOWLIST) {
  const out = []
  for (const pkg of prodPackages(lock)) {
    const declared = pkg.license
    if (!declared) {
      out.push({ path: pkg.path, why: 'declares no licence at all' })
      continue
    }
    if (!allowlist.includes(declared)) {
      out.push({ path: pkg.path, why: `declares ${declared}, which is not in the allowlist` })
    }
  }
  return out
}

// ── Property 2: install hooks ────────────────────────────────────────────────
//
// An install hook runs arbitrary code on every `npm install` on every machine
// that touches this project, which is how the npm supply-chain compromises of
// the last several years have actually executed. CI already passes
// --ignore-scripts; this asserts that no production dependency WANTS to run one,
// so the flag is a checked property rather than an inherited habit, and a
// developer running a plain `npm install` locally is covered too.
function installHookViolations(lock) {
  return prodPackages(lock)
    .filter((pkg) => pkg.hasInstallScript === true)
    .map((pkg) => ({ path: pkg.path, why: 'declares an install hook (preinstall/install/postinstall)' }))
}

// ── Property 3: integrity hashes, with the one exception NAMED ───────────────
//
// Every registry tarball carries an SRI hash, so a package without one did not
// come from the registry. Today exactly one production package has no integrity
// field, and it is named here rather than filtered silently: naming it means a
// SECOND unhashed package is a red, which is the whole point. A blanket "ignore
// packages without integrity" would have hidden it.
const INTEGRITY_EXCEPTIONS = new Map([
  ['node_modules/stake-engine',
   'the first-party RGS client, resolved from git rather than the registry, so it has no '
     + 'registry tarball and therefore no SRI hash. Its pin is asserted separately below.'],
])

function integrityViolations(lock, exceptions = INTEGRITY_EXCEPTIONS) {
  const out = []
  for (const pkg of prodPackages(lock)) {
    if (pkg.integrity) continue
    if (pkg.link === true) continue
    if (exceptions.has(pkg.path)) continue
    out.push({ path: pkg.path, why: `has no integrity hash and is not a named exception (resolved: ${pkg.resolved || 'none'})` })
  }
  return out
}

// ── Property 4: the git dependency's pin has not moved ───────────────────────
//
// This is what replaces the licence-text hash the row asked for and that does
// not exist. A git dependency is the one entry with no SRI hash, so the pin IS
// its integrity: if the ref changes, different code arrives under the same
// version, and nothing else in this repository would notice.
const PINNED_REFS = new Map([
  ['node_modules/stake-engine', 'df9e126d79b3fe1ef353f4fac9c1699cd79a4d3e'],
])

function pinViolations(lock, pins = PINNED_REFS) {
  const out = []
  const byPath = new Map(prodPackages(lock).map((p) => [p.path, p]))
  for (const [path, expected] of pins) {
    const pkg = byPath.get(path)
    if (!pkg) {
      out.push({ path, why: 'recorded as a pinned git dependency but absent from the production closure' })
      continue
    }
    const actual = (pkg.resolved || '').split('#')[1] || ''
    if (actual !== expected) {
      out.push({ path, why: `pinned ref recorded as ${expected}, lockfile resolves ${actual || '(none)'}` })
    }
  }
  return out
}

// ── The vulnerability scan, S2-C049 ──────────────────────────────────────────
//
// NOT DETERMINISTIC OVER HEAD, and that is stated rather than hidden. Every
// other gate in checks.yml is a function of the tree; this one is a function of
// the tree AND the advisory database at the moment it runs, so a package can
// turn this red with no repo change when an advisory is re-rated. That is the
// correct behaviour for a vulnerability scan and it is why the artefact below
// records a MOMENT, in the past tense, rather than a property.
//
// It needs the registry. With no network `npm audit` errors rather than
// passing, so it fails closed.
function runAudit(cwd) {
  try {
    const out = execFileSync('npm', ['audit', '--omit=dev', '--audit-level=high'],
      { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] })
    return { exitCode: 0, output: out }
  } catch (err) {
    return {
      exitCode: typeof err.status === 'number' ? err.status : 1,
      output: `${err.stdout || ''}${err.stderr || ''}`,
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
const lock = JSON.parse(readFileSync(LOCK, 'utf-8'))
const prodCount = prodPackages(lock).length

console.log(`SUPPLY CHAIN GATE${SELF_TEST ? ' SELF-TEST' : ''}`)
console.log(`  lockfileVersion ${lock.lockfileVersion}, ${prodCount} production entries`)

const licences = licenceViolations(lock)
check('every production licence is in the allowlist', licences.length === 0,
  licences.map((v) => `${v.path}: ${v.why}`).join('; '))

const hooks = installHookViolations(lock)
check('no production dependency declares an install hook', hooks.length === 0,
  hooks.map((v) => `${v.path}: ${v.why}`).join('; '))

const integrity = integrityViolations(lock)
check('every production dependency has an integrity hash or is a named exception',
  integrity.length === 0, integrity.map((v) => `${v.path}: ${v.why}`).join('; '))

const pins = pinViolations(lock)
check('every pinned git dependency is at its recorded commit', pins.length === 0,
  pins.map((v) => `${v.path}: ${v.why}`).join('; '))

const audit = runAudit(ROOT)
check('npm audit reports no high or critical advisory in the production closure',
  audit.exitCode === 0, audit.output.split('\n').filter((l) => l.trim()).slice(0, 6).join(' | '))

// ── Convention (p) ───────────────────────────────────────────────────────────
//
// Every predicate above is a pure function of a parsed lockfile, so each seed
// plants a MUTATED COPY and never touches frontend/. The forms planted are the
// forms these defects really arrive in: a real copyleft SPDX id, a real install
// hook flag, a deleted integrity field, a moved git ref.
//
// Each table carries its own negative control, because a seed proving a
// predicate can say no proves nothing on its own: it also has to say yes to the
// real tree, and the real tree is what the control feeds it.
const clone = () => JSON.parse(JSON.stringify(lock))
const firstProdPath = prodPackages(lock).find((p) => p.integrity)?.path

if (!firstProdPath) {
  console.error('SELF-TEST ANCHOR LOST: no production package with an integrity hash, so the')
  console.error('seeds below would mutate nothing and silently test nothing.')
  process.exit(2)
}

const SEEDS = [
  ['a real copyleft licence on a real production package, the form a licensing incident arrives in',
   true, () => { const l = clone(); l.packages[firstProdPath].license = 'GPL-3.0'; return licenceViolations(l) }],
  ['a production package declaring no licence at all',
   true, () => { const l = clone(); delete l.packages[firstProdPath].license; return licenceViolations(l) }],
  ['NEGATIVE CONTROL: the real lockfile, all production licences, must survive',
   false, () => licenceViolations(clone())],

  ['a production package that wants to run an install hook',
   true, () => { const l = clone(); l.packages[firstProdPath].hasInstallScript = true; return installHookViolations(l) }],
  ['NEGATIVE CONTROL: the real lockfile declares no install hook',
   false, () => installHookViolations(clone())],

  ['a production package whose integrity hash has been removed',
   true, () => { const l = clone(); delete l.packages[firstProdPath].integrity; return integrityViolations(l) }],
  ['NEGATIVE CONTROL: the named git exception must NOT be flagged',
   false, () => integrityViolations(clone())],
  ['the named exception withdrawn, proving it is doing real work rather than matching nothing',
   true, () => integrityViolations(clone(), new Map())],

  ['the git pin moved underneath the recorded commit, which is what a git dependency has instead of a hash',
   true, () => {
     const l = clone()
     const p = l.packages['node_modules/stake-engine']
     if (!p) return []
     p.resolved = p.resolved.replace(/#.*$/, '#0000000000000000000000000000000000000000')
     return pinViolations(l)
   }],
  ['NEGATIVE CONTROL: the real lockfile is at the recorded pin',
   false, () => pinViolations(clone())],
]

const seeded = SEEDS.map(([why, shouldFlag, run]) => ({ why, ok: (run().length > 0) === shouldFlag }))
for (const s of seeded) console.log(`  ${s.ok ? 'caught' : 'MISSED'}  seeded: ${s.why}`)
check('the lockfile scans can actually fail', seeded.every((s) => s.ok))

// The audit predicate is not a pure function, so its seed is a real `npm audit`
// run against a real vulnerable package in a temp directory. minimist@1.2.0
// carries GHSA-vh95-rmgr-6w4m, a critical prototype pollution advisory.
// NEEDS NETWORK, like the real run it is proving.
if (SELF_TEST) {
  const dir = mkdtempSync(join(tmpdir(), 'supply-chain-seed-'))
  try {
    writeFileSync(join(dir, 'package.json'),
      JSON.stringify({ name: 'seed', version: '1.0.0', dependencies: { minimist: '1.2.0' } }, null, 2))
    writeFileSync(join(dir, 'package-lock.json'), JSON.stringify({
      name: 'seed', version: '1.0.0', lockfileVersion: 3, requires: true,
      packages: {
        '': { name: 'seed', version: '1.0.0', dependencies: { minimist: '1.2.0' } },
        'node_modules/minimist': {
          version: '1.2.0',
          resolved: 'https://registry.npmjs.org/minimist/-/minimist-1.2.0.tgz',
          integrity: 'sha512-7Wl+Jz+IGWuSdgsQEJ4JunV0si/iMhg42MnQQG6h1R6TNeVenp4U9x5CC5v/gYqz/fENLQITAWXidNtVL0NNbw==',
          license: 'MIT',
        },
      },
    }, null, 2))
    const seedAudit = runAudit(dir)
    const caught = seedAudit.exitCode !== 0 && /critical|high/i.test(seedAudit.output)
    console.log(`  ${caught ? 'caught' : 'MISSED'}  seeded: a real production dependency carrying a real critical advisory`)
    check('the vulnerability scan can actually fail', caught,
      `npm audit on a seeded minimist@1.2.0 exited ${seedAudit.exitCode}. If this is a network `
        + 'failure the gate has correctly failed closed rather than passing blind.')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

// ── The artefact, S2-C049 and S2-C051 ────────────────────────────────────────
//
// Convention (h.1): written through evidenceDir, so a plain run lands in
// .evidence-scratch/ and only FS_WRITE_EVIDENCE=1 regenerates committed
// evidence. Convention (s): every changing value is derived at run time and the
// record is dated in the past tense, so it cannot become false.
const measuredAt = new Date().toISOString()
const inventory = prodPackages(lock).map((p) => ({
  path: p.path,
  version: p.version,
  license: p.license || null,
  resolved: p.resolved || null,
  integrity: p.integrity ? p.integrity.split('-')[0] : null,
}))

writeFileSync(join(QA, `supply_chain_${measuredAt.slice(0, 10)}.json`), JSON.stringify({
  generated: measuredAt.slice(0, 10),
  measuredAt,
  rows: 'S2-C049, S2-C051, and the scannable half of S2-C048',
  lockfileVersion: lock.lockfileVersion,
  productionEntries: prodCount,
  licenceAllowlist: LICENCE_ALLOWLIST,
  licenceCounts: inventory.reduce((acc, p) => {
    const k = p.license || '(none)'
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {}),
  integrityExceptions: [...INTEGRITY_EXCEPTIONS].map(([path, why]) => ({ path, why })),
  pinnedRefs: [...PINNED_REFS].map(([path, ref]) => ({ path, ref })),
  audit: {
    command: 'npm audit --omit=dev --audit-level=high',
    exitCode: audit.exitCode,
    note: 'A function of the advisory database at the moment above, not of the tree. '
      + 'This records a moment, not a property.',
  },
  notShipped: {
    antiMalware: 'S2-C048 asked for an anti-malware pass. No scanner exists on this runner, so '
      + 'the only honest convention (p) seed, EICAR observed detected, is impossible. A walk that '
      + 'matches nothing and prints PASS would be a false compliance claim. Not shipped, and the '
      + 'install-hook and integrity checks above are what IS honestly measurable offline.',
    pinnedLicenceText: 'S2-C051 asked for the LICENCE text at the pinned commit. There is none: '
      + 'LICENSE, LICENCE, LICENSE.md and COPYING all 404 at that commit, GitHub reports the '
      + 'repository licence as null, and docs/records/tooling/TOOL_VETTING_2026-07.md:15 already '
      + 'recorded "ISC declared, no LICENSE file". The pin is asserted instead.',
    distScan: 'The bundle half of S2-C048 belongs to dist_hygiene_gate.mjs, which already walks '
      + 'dist and carries S2-C052. Two dist walkers would be duplication.',
  },
  inventory,
  pass: failures.length === 0,
  failures,
}, null, 2))

if (failures.length) {
  console.error(`\nSUPPLY CHAIN GATE: FAIL (${failures.length})`)
  for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
  process.exit(1)
}
console.log(`\nSUPPLY CHAIN GATE: PASS (${prodCount} production entries)`)
