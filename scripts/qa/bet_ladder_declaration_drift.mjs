// bet_ladder_declaration_drift.mjs: the three places this game declares its bet
// ladder must agree, and no one of them may be widened alone.
//
// Built 2026-07-29 from `reports/briefs/FS_CURRENCY_SERIAL_Prompt.md`, JOB 3,
// INSTEAD OF exercising the lock sanction that brief granted. The derivation is
// at `reports/qa/session4b/REQ124_LADDER_DERIVATION.md`.
//
// WHY THIS EXISTS
// ---------------
// REQ-124 asks new submissions to offer bet levels from $0.01. This game offers
// a $0.10 floor. The obvious fix is to widen the ladder, and the obvious place
// to widen it is whichever file the person doing it happens to open. There are
// THREE, they are in three languages, and nothing until now checked that they
// still agreed:
//
//   games/future_spinner/game_config.py:106            self.bet_levels
//   games/future_spinner/library/publish_files/game_metadata.json
//                                                      betLevels, minBet,
//                                                      maxBet, stepBet
//   frontend/src/lib/stores/gameStore.ts:7             BET_LEVELS
//
// The first two are inside a LOCKED path. The third is not. So the cheapest edit
// is also the wrong one: widening only `gameStore.ts:7` turns a naive gate green
// while the SUBMITTED package still declares `minBet 0.1`, and it silently
// falsifies `gameStore.ts:6`'s own comment, which says the frontend array
// "matches game_config.py bet_levels". A reviewer reads the published metadata,
// not the Svelte constant.
//
// This gate exists so that park is safe to leave in place. It goes red on any
// one-sided widening, in either direction, from any of the three files.
//
// IT IS READ-ONLY AGAINST THE LOCKED PACKAGE. Both locked files are parsed as
// TEXT and JSON, exactly as `frontend/scripts/currency_scale_drift.test.mjs`
// already parses the locked `rgsService.ts`. Nothing here writes, and no lock
// sanction is required to run it.
//
// ARITHMETIC IN INTEGER CENTS, never in floats, per CLAUDE.md's integer micros
// rule. `0.1 + 0.2 !== 0.3` is exactly the class of bug a money gate must not
// itself contain, and `1.0 % 0.1` is 0.09999999999999995 rather than 0.
//
// Run:
//   node scripts/qa/bet_ladder_declaration_drift.mjs
//   node scripts/qa/bet_ladder_declaration_drift.mjs --self-test

import { readFileSync, writeFileSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '..', '..')

const PATHS = {
  config:   'games/future_spinner/game_config.py',
  metadata: 'games/future_spinner/library/publish_files/game_metadata.json',
  store:    'frontend/src/lib/stores/gameStore.ts',
}

/** Dollars to integer cents. The only conversion in this file. */
const cents = (n) => Math.round(Number(n) * 100)

/** `self.bet_levels = [0.10, 0.20, ...]` out of the python config. */
export function parsePythonLadder(text) {
  const m = /^\s*self\.bet_levels\s*=\s*\[([^\]]*)\]/m.exec(text)
  if (!m) throw new Error(`${PATHS.config}: no 'self.bet_levels = [...]' declaration found`)
  return m[1].split(',').map((s) => s.trim()).filter(Boolean).map(cents)
}

/** `export const BET_LEVELS = [0.10, 0.20, ...]` out of the Svelte store. */
export function parseStoreLadder(text) {
  const m = /^\s*export\s+const\s+BET_LEVELS\s*=\s*\[([^\]]*)\]/m.exec(text)
  if (!m) throw new Error(`${PATHS.store}: no 'export const BET_LEVELS = [...]' declaration found`)
  return m[1].split(',').map((s) => s.trim()).filter(Boolean).map(cents)
}

const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])
const show = (l) => `[${l.map((c) => (c / 100).toFixed(2)).join(', ')}]`

export function check(pyText, metaJson, storeText) {
  const failures = []
  const fail = (m) => failures.push(m)

  const py = parsePythonLadder(pyText)
  const store = parseStoreLadder(storeText)
  const meta = (metaJson.betLevels ?? []).map(cents)

  if (!py.length) fail(`${PATHS.config}: bet_levels is empty`)
  if (!meta.length) fail(`${PATHS.metadata}: betLevels is empty`)
  if (!store.length) fail(`${PATHS.store}: BET_LEVELS is empty`)

  // 1. The three declarations are the same list, in the same order.
  if (!same(py, meta)) {
    fail(`the maths config and the PUBLISHED package disagree:\n`
      + `      ${PATHS.config} bet_levels   ${show(py)}\n`
      + `      ${PATHS.metadata} betLevels  ${show(meta)}`)
  }
  if (!same(py, store)) {
    fail(`the maths config and the frontend fallback disagree:\n`
      + `      ${PATHS.config} bet_levels   ${show(py)}\n`
      + `      ${PATHS.store} BET_LEVELS    ${show(store)}\n`
      + `      (${PATHS.store}:6 states in terms that it "matches game_config.py bet_levels")`)
  }

  // 2. The published bounds agree with the published ladder. A minBet that is
  //    not the first level is what a platform reviewer would read as the floor,
  //    so it is checked against the ladder rather than assumed to follow it.
  if (metaJson.minBet !== undefined && cents(metaJson.minBet) !== meta[0]) {
    fail(`${PATHS.metadata}: minBet ${metaJson.minBet} is not the first betLevel ${(meta[0] / 100).toFixed(2)}`)
  }
  if (metaJson.maxBet !== undefined && cents(metaJson.maxBet) !== meta[meta.length - 1]) {
    fail(`${PATHS.metadata}: maxBet ${metaJson.maxBet} is not the last betLevel ${(meta[meta.length - 1] / 100).toFixed(2)}`)
  }

  // 3. The platform's own divisibility rule, quoted from
  //    docs/stake-engine-live/2026-07-29/rgs.md:288:
  //      "The bet must be divisible by stepBet."
  //    This is the check that actually bites on a sub-dime widening: adding
  //    $0.01 to the ladder while leaving stepBet at 0.10 declares a level the
  //    platform's own rule forbids the player from betting.
  if (metaJson.stepBet !== undefined) {
    const step = cents(metaJson.stepBet)
    if (step <= 0) fail(`${PATHS.metadata}: stepBet ${metaJson.stepBet} is not positive`)
    else {
      const bad = meta.filter((c) => c % step !== 0)
      if (bad.length) {
        fail(`${PATHS.metadata}: ${show(bad)} not divisible by stepBet ${metaJson.stepBet}. `
          + `The platform requires "The bet must be divisible by stepBet" (rgs.md:288), `
          + `so widening the ladder below the step declares a level a player cannot bet.`)
      }
    }
  }

  // 4. Ascending and duplicate-free, because betLadder.ts indexes this list and
  //    an out-of-order or duplicated level makes "+" and "-" non-monotonic.
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] <= meta[i - 1]) {
      fail(`${PATHS.metadata}: betLevels is not strictly ascending at index ${i} `
        + `(${(meta[i - 1] / 100).toFixed(2)} then ${(meta[i] / 100).toFixed(2)})`)
      break
    }
  }

  return { failures, ladder: meta }
}

function readAll(root) {
  return {
    pyText:    readFileSync(join(root, PATHS.config), 'utf-8'),
    metaJson:  JSON.parse(readFileSync(join(root, PATHS.metadata), 'utf-8')),
    storeText: readFileSync(join(root, PATHS.store), 'utf-8'),
  }
}

// ---------------------------------------------------------------------------
// SEEDED SELF-TEST, convention (p)
// ---------------------------------------------------------------------------
// The defect this gate exists to catch is a ONE-SIDED WIDENING, and seed 1 is
// precisely the edit the lock sanction would have produced had it been taken:
// $0.01 added to the maths config alone. Seed 2 is the cheaper and more likely
// version, the frontend constant alone, which is the one a session avoiding the
// lock would reach for. Both are the real form, not an invented one.

const SEEDS = [
  {
    name: 'seed 1, the sanctioned edit taken alone: $0.01 added to game_config.py only',
    apply: (f) => ({ ...f, pyText: f.pyText.replace('self.bet_levels = [0.10,', 'self.bet_levels = [0.01, 0.10,') }),
    expect: /game_config\.py bet_levels/,
  },
  {
    name: 'seed 2, the cheap edit: $0.01 added to the frontend constant only',
    apply: (f) => ({ ...f, storeText: f.storeText.replace('export const BET_LEVELS = [0.10,', 'export const BET_LEVELS = [0.01, 0.10,') }),
    expect: /frontend fallback disagree/,
  },
  {
    name: 'seed 3, all three widened but stepBet left at 0.10, so the level is unbettable',
    apply: (f) => ({
      pyText:    f.pyText.replace('self.bet_levels = [0.10,', 'self.bet_levels = [0.01, 0.10,'),
      storeText: f.storeText.replace('export const BET_LEVELS = [0.10,', 'export const BET_LEVELS = [0.01, 0.10,'),
      metaJson:  { ...f.metaJson, betLevels: [0.01, ...f.metaJson.betLevels], minBet: 0.01 },
    }),
    expect: /divisible by stepBet/,
  },
  {
    name: 'seed 4, minBet no longer the first level',
    apply: (f) => ({ ...f, metaJson: { ...f.metaJson, minBet: 0.5 } }),
    expect: /minBet .* is not the first betLevel/,
  },
  {
    name: 'seed 5, the published ladder reordered, which breaks the + and - controls',
    apply: (f) => ({ ...f, metaJson: { ...f.metaJson, betLevels: [0.1, 0.5, 0.2, 1.0, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0] } }),
    expect: /not strictly ascending|disagree/,
  },
]

function selfTest() {
  const files = readAll(REPO)
  const problems = []
  let passed = 0

  // PAIRED POSITIVE for the whole set: unmutated must be green.
  const base = check(files.pyText, files.metaJson, files.storeText)
  if (base.failures.length === 0) { passed++; console.log(`  PASS  paired positive: the real tree is green, ladder ${show(base.ladder)}`) }
  else problems.push(`the real tree is NOT green: ${base.failures.join(' | ')}`)

  for (const seed of SEEDS) {
    const before = JSON.stringify(files)
    const mutated = seed.apply(files)
    if (JSON.stringify(mutated) === before) {
      problems.push(`${seed.name}: the mutation changed nothing, so this seed tested nothing`)
      continue
    }
    let res
    try { res = check(mutated.pyText, mutated.metaJson, mutated.storeText) }
    catch (e) { res = { failures: [String(e.message)] } }
    const text = res.failures.join(' | ')
    if (res.failures.length && seed.expect.test(text)) {
      passed++
      console.log(`  PASS  ${seed.name}`)
      console.log(`          gate went red: ${text.split('\n')[0].slice(0, 100)}`)
    } else if (!res.failures.length) {
      problems.push(`${seed.name}: THE GATE STAYED GREEN over a planted defect`)
    } else {
      problems.push(`${seed.name}: gate went red on the wrong thing: ${text.slice(0, 120)}`)
    }
  }

  // NEGATIVE CONTROL with its paired positive: a change that is NOT a drift must
  // not fire. Widening all three consistently, with stepBet moved to match, is a
  // legitimate REQ-124 fix and the gate must stay green on it, or it would block
  // the very change it exists to make safe.
  const legit = {
    pyText:    files.pyText.replace('self.bet_levels = [0.10,', 'self.bet_levels = [0.01, 0.02, 0.05, 0.10,'),
    storeText: files.storeText.replace('export const BET_LEVELS = [0.10,', 'export const BET_LEVELS = [0.01, 0.02, 0.05, 0.10,'),
    metaJson:  { ...files.metaJson, betLevels: [0.01, 0.02, 0.05, ...files.metaJson.betLevels], minBet: 0.01, stepBet: 0.01 },
  }
  const legitRes = check(legit.pyText, legit.metaJson, legit.storeText)
  if (legitRes.failures.length === 0) { passed++; console.log('  PASS  negative control: a CONSISTENT REQ-124 widening across all three stays green') }
  else problems.push(`negative control: a consistent widening was rejected, so the gate blocks the fix it exists to protect: ${legitRes.failures.join(' | ')}`)

  console.log('')
  if (problems.length) {
    console.error(`bet ladder declaration drift SELF-TEST FAILED, ${problems.length} problem(s):`)
    for (const p of problems) console.error(`  - ${p}`)
    process.exit(1)
  }
  console.log(`bet ladder declaration drift self-test: ${passed} checks passed, ${SEEDS.length} seeded defects all caught.`)
}

function main() {
  if (process.argv.includes('--self-test')) return selfTest()
  const files = readAll(REPO)
  const { failures, ladder } = check(files.pyText, files.metaJson, files.storeText)
  if (failures.length === 0) {
    console.log(`bet ladder declaration drift: PASS`)
    console.log(`  one ladder, three declarations agreeing: ${show(ladder)}`)
    console.log(`  ${PATHS.config}, ${PATHS.metadata}, ${PATHS.store}`)
    console.log(`  REQ-124 is PARKED at this 0.10 floor, see reports/qa/session4b/REQ124_LADDER_DERIVATION.md`)
    return
  }
  console.error('bet ladder declaration drift: FAIL')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

main()
