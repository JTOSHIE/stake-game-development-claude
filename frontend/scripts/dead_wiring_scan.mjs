// dead_wiring_scan.mjs - Fable ruling 10 (2026-07-26).
//
// Permanent guard for the "silent UI-to-wallet gap" class: state that a control
// writes and nothing ever reads. Two real defects had exactly this shape:
//
//   standingMode (2026-07-07) - selecting Cruise or toggling OVERBOOST wrote a
//     store that handleSpin never read; the spin request was hardcoded to
//     mode: 'base'. Found by a manual wiring audit, not by any gate.
//   buy-tier billing (2026-07-07) - the clicked mode was dispatched and then
//     discarded by the handler.
//
// Both were caught by a human reading the data path. This makes the general
// shape statically detectable, which was the last open row in the armour table
// in reports/qa/fresh_eyes_review_2026-07-26.md.
//
// WHAT IT CHECKS. Every `export const X = writable|derived|readable(...)` in
// src/, then whether any REACHABLE production file reads it. A read is any of:
//   $X            Svelte auto-subscription
//   get(X)        svelte/store get
//   derived(X     or derived([... X ...]    store composition
//   X.subscribe(  manual subscription
//
// The derived() forms matter: a naive scan that only looks for $X and get(X)
// false-flags jurisdictionFlags, which is genuinely read at
// responsibleGambling.ts:31 via derived(jurisdictionFlags, ...). Getting that
// wrong once is how a guard loses its credibility, so it is covered by a
// regression case in EXPECTED_ALIVE below.
//
// REACHABILITY (R043 PHASE 3d, fresh-context major 7). "Production file" used
// to mean every non-test file under src/, which reports a store ALIVE when its
// only reader is itself dead code: LoadingScreen.svelte is imported by nothing,
// so a read inside it is a read the shipped product never performs. Readers now
// count only if their file is REACHABLE from the shipped entry (src/main.ts,
// the one input Vite builds; c1preview.html is a dev-only page and deliberately
// not an entry here), walking static and dynamic imports. A liveness claim that
// includes unreachable readers is the same defect one level up.
//
// Test files are excluded as readers on purpose: a store read only by its own
// test is still dead in the shipped product.
//
// Run (from frontend/): node scripts/dead_wiring_scan.mjs
//                       node scripts/dead_wiring_scan.mjs --self-test

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, resolve, posix } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const SRC = resolve(here, '..', 'src')

/**
 * Known-dead stores, allowlisted with a reason. Anything here is a finding that
 * has been ruled on and consciously deferred, NOT a pass. Removing an entry
 * should make the scan go quiet; adding one requires a reason.
 */
const ALLOWLIST = {
  // Fable ruling 9 (2026-07-26): dead inside the hard-locked gameStore.ts.
  // Recorded in CLAUDE.md LOCKED_FILE_DEBTS, rides the next sanctioned pass.
  betIndex:       'locked gameStore.ts, LOCKED_FILE_DEBTS',
  buyBonusActive: 'locked gameStore.ts, LOCKED_FILE_DEBTS',
  canSetMaxBet:   'locked gameStore.ts, LOCKED_FILE_DEBTS',
  sessionStats:   'locked gameStore.ts, LOCKED_FILE_DEBTS',
  // R5/TR-013 (2026-07-25): became unread when both bet surfaces moved onto
  // stores/betLadder.ts. It is NOT merely dead, it was WRONG: it indexes the
  // hardcoded BET_LEVELS, so off the authenticated ladder it returned true and
  // enabled a "+" that dropped the bet to 0.10. Locked, so it cannot be deleted
  // here. Leaving it unread is strictly safer than leaving it wired.
  canIncreaseBet: 'locked gameStore.ts, LOCKED_FILE_DEBTS',
  // R8/TR-016 (2026-07-25): became unread when the confirm dialog moved to the
  // per-tier check. Like canIncreaseBet it was not merely dead but WRONG: it is
  // `bal >= bet * 100` for every tier, so at the 400x tier it enabled CONFIRM
  // beside a correctly displayed 400x price. Locked, so it cannot be deleted.
  canBuyBonus:    'locked gameStore.ts, LOCKED_FILE_DEBTS',
  // Read by scripts/modal_safety_proof.mjs to assert WHICH surface is blocking.
  // Diagnostics rather than product state; kept because a proof that can only
  // see a boolean cannot show which registration fired.
  openModalIds:   'read by modal_safety_proof.mjs, diagnostics not product state',
  // R11/TR-035b (2026-07-25). lastRecovery is the diagnostic the DTT session
  // captures. activeRound WAS allowlisted beside it ("consumer decided at the
  // DTT session") and its entry retired 2026-08-10 (R043 PHASE 3d): the
  // reachability rewrite showed it is now genuinely read by reachable
  // production code, so the exemption had rusted into exactly the silent
  // excuse fresh-context major 35 warned about, and an entry that no longer
  // matches is deleted rather than kept as armour.
  lastRecovery:   'recovery diagnostic, captured at the DTT session',
  // R043 PHASE 3d, the finding the reachability rewrite exists to see
  // (fresh-context major 7): assetLoadProgress is written by GameGrid at
  // asset-ready and read ONLY by LoadingScreen.svelte, which nothing imports.
  // That is not an accident but recorded history: App.svelte:303-314 documents
  // the boot moving to one surface and "LoadingScreen is REMOVED", and
  // splash_calm_gate.mjs:144 confirms it is no longer rendered. The store, the
  // component file and GameGrid's write are retired plumbing; delete all three
  // together on a hygiene pass rather than wiring a reader to dead glass.
  assetLoadProgress: 'only reader is the removed LoadingScreen.svelte (App.svelte:303-314); delete with it',
  // Fable ruling 7 (2026-07-26): write-only replay store, ReplayMode renders
  // from parallel locals. Real finding, explicitly deferred to post-launch as
  // elegance under the section 1 bar. Bet Replay is compliance-bearing and is
  // not being touched before submission.
  replayParams:   'write-only, post-launch (ruling 7)',
  replayResponse: 'write-only, post-launch (ruling 7)',
  replayPhase:    'write-only, post-launch (ruling 7)',
  replayError:    'write-only, post-launch (ruling 7)',
}

/** Stores that must always resolve as ALIVE. Regression cases for the scanner. */
const EXPECTED_ALIVE = [
  'jurisdictionFlags', // read via derived() only - the naive-scan false positive
  'currencyCode',
  'isSocial',
]

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(svelte|ts)$/.test(name)) out.push(p)
  }
  return out
}

const isTest = (f) => /\.test\./.test(f)

/**
 * Static + dynamic import specifiers in one body. Relative only: package and
 * virtual imports cannot reach src/ files, which is all liveness cares about.
 */
export function importSpecifiers(body) {
  const out = []
  for (const m of body.matchAll(/import\s+[^'"()]*?from\s*['"]([^'"]+)['"]/g)) out.push(m[1])
  for (const m of body.matchAll(/import\s*['"]([^'"]+)['"]/g)) out.push(m[1])
  for (const m of body.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) out.push(m[1])
  for (const m of body.matchAll(/export\s+[^'"]*?from\s*['"]([^'"]+)['"]/g)) out.push(m[1])
  return out.filter((s) => s.startsWith('.'))
}

/**
 * Resolve a relative specifier against the importing file, over an in-memory
 * file map keyed by POSIX-relative paths. Tries the Vite resolution order this
 * tree actually uses: exact, .ts, .svelte, /index.ts.
 */
export function resolveSpecifier(fromRel, spec, fileSet) {
  const base = posix.normalize(posix.join(posix.dirname(fromRel), spec))
  for (const cand of [base, `${base}.ts`, `${base}.svelte`, `${base}/index.ts`]) {
    if (fileSet.has(cand)) return cand
  }
  return null
}

/**
 * BFS the import graph from the entries. Returns the reachable subset of the
 * file map's keys.
 */
export function reachableFrom(entries, fileMap) {
  const fileSet = new Set(fileMap.keys())
  const seen = new Set()
  const queue = entries.filter((e) => fileSet.has(e))
  while (queue.length) {
    const cur = queue.shift()
    if (seen.has(cur)) continue
    seen.add(cur)
    for (const spec of importSpecifiers(fileMap.get(cur))) {
      const dep = resolveSpecifier(cur, spec, fileSet)
      if (dep && !seen.has(dep)) queue.push(dep)
    }
  }
  return seen
}

export function isReadIn(name, body) {
  const n = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return (
    new RegExp(`\\$${n}\\b`).test(body) ||
    new RegExp(`\\bget\\(\\s*${n}\\s*\\)`).test(body) ||
    new RegExp(`derived\\(\\s*${n}\\b`).test(body) ||
    new RegExp(`derived\\(\\s*\\[[^\\]]*\\b${n}\\b`).test(body) ||
    new RegExp(`\\b${n}\\.subscribe\\b`).test(body)
  )
}

/**
 * The whole analysis over an in-memory tree, so the self-test can drive it
 * with a seeded one. `fileMap` keys are POSIX paths relative to the tree root;
 * `entries` name the shipped entry modules.
 */
export function analyse(fileMap, entries) {
  const production = [...fileMap.keys()].filter((f) => !isTest(f))
  const reachable = reachableFrom(entries, fileMap)

  const stores = new Map()
  for (const f of production) {
    const re = /export\s+const\s+(\w+)\s*=\s*(writable|derived|readable)\b/g
    let m
    while ((m = re.exec(fileMap.get(f)))) stores.set(m[1], { file: f, kind: m[2] })
  }

  const dead = []
  const alive = new Set()
  for (const [name, meta] of stores) {
    let readers = 0
    for (const f of production) {
      if (!reachable.has(f)) continue
      if (f === meta.file) {
        // The defining file counts as a reader only if it reads the store
        // beyond defining it; a `derived(X, ...)` sibling in the same module
        // is caught by the same read forms on the remaining text.
        const body = fileMap.get(f).replace(
          new RegExp(`export\\s+const\\s+${name}\\s*=\\s*(writable|derived|readable)`), '')
        if (isReadIn(name, body)) readers++
        continue
      }
      if (isReadIn(name, fileMap.get(f))) readers++
    }
    if (readers > 0) alive.add(name)
    else dead.push({ name, ...meta })
  }
  return { stores, alive, dead, reachable, production }
}

// ── self-test, convention (p) ────────────────────────────────────────────────
//
// The seed is the exact shape major 7 names: a store whose ONLY reader is a
// file nothing imports. The pre-3d scan reported it ALIVE; this one must
// report it dead. The negative control is the same store read by a file the
// entry actually imports.
if (process.argv.includes('--self-test')) {
  const seeded = new Map([
    ['main.ts', "import App from './App.svelte'\n"],
    ['App.svelte', "<script>import { used } from './stores'\nconsole.log($used)</script>\n"],
    ['stores.ts', "import { writable } from 'svelte/store'\nexport const used = writable(0)\nexport const orphan = writable(0)\n"],
    // The unreachable reader: imported by NOTHING, reads the orphan store.
    ['LoadingScreen.svelte', "<script>import { orphan } from './stores'\nconsole.log($orphan)</script>\n"],
  ])
  const r1 = analyse(seeded, ['main.ts'])
  const caught = r1.dead.some((d) => d.name === 'orphan')
  console.log(`  ${caught ? 'caught ' : 'MISSED '} seeded: a store whose only reader is an unreachable file scans as dead`)

  const control = new Map(seeded)
  control.set('App.svelte', "<script>import { used, orphan } from './stores'\nconsole.log($used, $orphan)</script>\n")
  const r2 = analyse(control, ['main.ts'])
  const clean = r2.alive.has('orphan') && r2.alive.has('used')
  console.log(`  ${clean ? 'clean  ' : 'FALSE+ '} negative control: the same store read by a REACHABLE file scans as alive`)

  // The derived()-composition read form, the naive-scan regression, must
  // survive the reachability rewrite too.
  const derivedCase = new Map([
    ['main.ts', "import './a'\n"],
    ['a.ts', "import { flags } from './b'\nimport { derived } from 'svelte/store'\nexport const view = derived(flags, (f) => f)\n"],
    ['b.ts', "import { writable } from 'svelte/store'\nexport const flags = writable({})\n"],
  ])
  const r3 = analyse(derivedCase, ['main.ts'])
  const derivedAlive = r3.alive.has('flags')
  console.log(`  ${derivedAlive ? 'clean  ' : 'FALSE+ '} negative control: a derived()-only read still counts`)

  if (!caught || !clean || !derivedAlive) {
    console.error('\nDEAD WIRING SCAN SELF-TEST: FAIL')
    process.exit(1)
  }
  console.log('\nDEAD WIRING SCAN SELF-TEST: PASS (unreachable reader caught, reachable reads alive)')
  process.exit(0)
}

// ── the real run ─────────────────────────────────────────────────────────────
const files = walk(SRC)
const fileMap = new Map(files.map((f) => [
  posix.join(...relative(SRC, f).split(/[\\/]/)), readFileSync(f, 'utf-8'),
]))
const { stores, alive, dead, reachable, production } = analyse(fileMap, ['main.ts'])

const failures = []
for (const name of EXPECTED_ALIVE) {
  if (stores.has(name) && !alive.has(name)) {
    failures.push(`REGRESSION: ${name} is expected to be read but scanned as dead. The scanner is wrong, not the code. Check the read forms in isReadIn().`)
  }
}

const unexpected = dead.filter((d) => !(d.name in ALLOWLIST))
const known = dead.filter((d) => d.name in ALLOWLIST)

console.log(`DEAD WIRING SCAN`)
console.log(`  ${stores.size} exported stores, ${alive.size} read, ${dead.length} unread`)
console.log(`  reachability: ${reachable.size} of ${production.length} production files reachable from main.ts`)
if (known.length) {
  console.log(`\n  known and allowlisted (${known.length}):`)
  for (const d of known) {
    console.log(`    ${d.name.padEnd(18)} ${ALLOWLIST[d.name]}`)
  }
}
if (unexpected.length) {
  console.error(`\n  UNEXPECTED unread stores (${unexpected.length}):`)
  for (const d of unexpected) {
    console.error(`    ${d.name.padEnd(18)} ${d.kind.padEnd(9)} src/${d.file}`)
  }
  failures.push(`${unexpected.length} store(s) written but never read by a reachable file. This is the standingMode shape: a control that looks wired and is not. Either wire it, remove it, or allowlist it with a reason.`)
}

if (failures.length) {
  console.error('\nDEAD WIRING SCAN: FAIL')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log('\nDEAD WIRING SCAN: PASS')
