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
// src/, then whether any production file reads it. A read is any of:
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
// Test files are excluded as readers on purpose: a store read only by its own
// test is still dead in the shipped product.
//
// Run (from frontend/): node scripts/dead_wiring_scan.mjs

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, resolve } from 'node:path'

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
  // R11/TR-017b (2026-07-25). Written by recoverSession and deliberately not
  // consumed yet. WHAT CONSUMES activeRound IS THE PARKED QUESTION: acting on an
  // open round could forfeit an unseen feature, so the build surfaces it and
  // stops until the DTT session says what the platform expects
  // (docs/staging/DTT_SESSION_RECOVERY_VERIFICATION.md, step 3). lastRecovery is
  // the diagnostic the same session captures. Wiring either to a consumer now
  // would mean choosing the answer before observing it.
  activeRound:    'surfaced for TR-017b, consumer decided at the DTT session',
  lastRecovery:   'recovery diagnostic, captured at the DTT session',
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

const files = walk(SRC)
const text = new Map(files.map((f) => [f, readFileSync(f, 'utf-8')]))
const isTest = (f) => /\.test\./.test(f)
const production = files.filter((f) => !isTest(f))

const stores = new Map()
for (const f of production) {
  const re = /export\s+const\s+(\w+)\s*=\s*(writable|derived|readable)\b/g
  let m
  while ((m = re.exec(text.get(f)))) stores.set(m[1], { file: f, kind: m[2] })
}

function isReadIn(name, body) {
  const n = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return (
    new RegExp(`\\$${n}\\b`).test(body) ||
    new RegExp(`\\bget\\(\\s*${n}\\s*\\)`).test(body) ||
    new RegExp(`derived\\(\\s*${n}\\b`).test(body) ||
    new RegExp(`derived\\(\\s*\\[[^\\]]*\\b${n}\\b`).test(body) ||
    new RegExp(`\\b${n}\\.subscribe\\b`).test(body)
  )
}

const dead = []
const alive = new Set()
for (const [name, meta] of stores) {
  let readers = 0
  for (const f of production) {
    if (isReadIn(name, text.get(f))) readers++
  }
  if (readers > 0) alive.add(name)
  else dead.push({ name, ...meta })
}

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
if (known.length) {
  console.log(`\n  known and allowlisted (${known.length}):`)
  for (const d of known) {
    console.log(`    ${d.name.padEnd(18)} ${ALLOWLIST[d.name]}`)
  }
}
if (unexpected.length) {
  console.error(`\n  UNEXPECTED unread stores (${unexpected.length}):`)
  for (const d of unexpected) {
    console.error(`    ${d.name.padEnd(18)} ${d.kind.padEnd(9)} ${relative(resolve(here, '..'), d.file)}`)
  }
  failures.push(`${unexpected.length} store(s) written but never read. This is the standingMode shape: a control that looks wired and is not. Either wire it, remove it, or allowlist it with a reason.`)
}

if (failures.length) {
  console.error('\nDEAD WIRING SCAN: FAIL')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log('\nDEAD WIRING SCAN: PASS')
