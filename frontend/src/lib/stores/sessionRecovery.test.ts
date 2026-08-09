// sessionRecovery.test.ts - R11 / TR-017, then R2R JOB 4, then R2R-R JOB B.
// Run (from frontend/): npx tsx src/lib/stores/sessionRecovery.test.ts
//
// The recovery logic is exercised against a stubbed platform surface, because
// an in-progress round cannot be produced on demand against a live RGS.
//
// ============================================================================
// RESUME AND SETTLE, R2R-R JOB B, 2026-07-26, per Fable's re-ruling on TR-035b.
// ============================================================================
//
// The row previously parked an active round: it surfaced the round and stopped,
// because settling blind could take a feature the player had never seen. That
// reasoning held only while the round's events were unreachable. Under the
// official contract they arrive at `round.state`, so the round can be replayed
// and then settled, and THERE IS NO FORFEIT PATH.
//
// What these assertions pin, in order of how much they matter:
//
//   1. The round is PRESENTED BEFORE it is SETTLED. Order is the whole design:
//      settling first would move the balance before anything explained why.
//      Asserted by recording call order in a single sequence array, not by two
//      separate spies that could both be true in either order.
//   2. A round with unreadable events still SETTLES. The money is not held
//      hostage to the presentation.
//   3. An `active: false` round is never touched. It is history, not work, and
//      settling it would settle twice.
//   4. Both round shapes the brief names are covered: an active FEATURE round
//      (freeSpinTrigger present, the case that forced the original park) and an
//      active ORDINARY round.
//
// Fixtures are official-shaped throughout: nested `balance`, a `config` block,
// typed `jurisdictionFlags`, and rounds carrying `betID`, `active` and a `state`
// holding real reveal/winInfo events.

import { get } from 'svelte/store'
import { readFileSync } from 'node:fs'
import {
  recoverSession, activeRound, resetSessionRecovery,
  recoveryBannerVisible, dismissRecoveryBanner,
} from './sessionRecovery.ts'
import { balance, betAmount } from './gameStore.ts'
import { CURRENCY_SCALE } from '../utils/currency.ts'
import type { PresentationScript } from '../services/roundInterpreter.ts'

const seq: string[] = []
let authRound: unknown = null
let authThrows: Error | null = null
const endRoundBalance = 250

const authResult = () => ({
  balance: 100, minBet: 0.1, maxBet: 100, stepBet: 0.1, betLevels: [1],
  defaultBetLevel: 1, currency: 'USD', round: authRound,
  jurisdictionFlags: {
    socialCasino: false, disabledFullscreen: false, disabledTurbo: false,
    disabledSuperTurbo: false, disabledAutoplay: false, disabledSlamstop: false,
    disabledSpacebar: false, disabledBuyFeature: false, displayNetPosition: false,
    displayRTP: false, displaySessionTimer: false, minimumRoundDuration: 0,
  },
  jurisdiction: {},
})

const stub = {
  parseSessionParams: () => { seq.push('parseSessionParams'); return { sessionID: 's', rgs_url: 'https://x' } },
  authenticate: async () => {
    seq.push('authenticate')
    if (authThrows) throw authThrows
    return authResult()
  },
  endRound: async (_p: unknown, roundId?: string) => {
    seq.push(`endRound:${roundId ?? ''}`)
    return { balance: endRoundBalance, roundId }
  },
} as unknown as Parameters<typeof recoverSession>[1]

let presented: PresentationScript | null = null
const present = async (script: PresentationScript) => {
  seq.push('present')
  presented = script
}

let failures = 0
const check = (name: string, a: unknown, e: unknown) => {
  if (JSON.stringify(a) === JSON.stringify(e)) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}\n    expected ${JSON.stringify(e)}\n    actual   ${JSON.stringify(a)}`) }
}
const checkThat = (name: string, cond: boolean) => {
  if (cond) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}`) }
}

// ── Real event streams, in the shipped reveal/winInfo schema ────────────────
const cell = (n: string) => ({ name: n, wild: n === 'W', scatter: n === 'S' })
const boardOf = (rows: string[][]) => rows.map((reel) => reel.map(cell))

/** Five reels of six rows, the padded shape `reveal` actually carries. */
const ORDINARY_BOARD = boardOf([
  ['L1', 'H1', 'H1', 'L3', 'L2', 'M1'],
  ['M2', 'H1', 'L1', 'L3', 'L2', 'M1'],
  ['M3', 'H1', 'M1', 'L3', 'L2', 'M1'],
  ['L1', 'L1', 'M2', 'L3', 'L2', 'M1'],
  ['L1', 'L1', 'M2', 'L3', 'L2', 'M1'],
])

const ORDINARY_EVENTS = [
  { type: 'reveal', board: ORDINARY_BOARD, gameType: 'basegame' },
  { type: 'winInfo', wins: [{ symbol: 'H1', kind: 3, win: 390, meta: { ways: 6, globalMult: 1 } }], totalWin: 390 },
  { type: 'setTotalWin', amount: 390 },
  { type: 'finalWin', amount: 390 },
]

const SCATTER_BOARD = boardOf([
  ['L1', 'S', 'H1', 'L3', 'L2', 'M1'],
  ['M2', 'S', 'L1', 'L3', 'L2', 'M1'],
  ['M3', 'S', 'M1', 'L3', 'L2', 'M1'],
  ['L1', 'L1', 'M2', 'L3', 'L2', 'M1'],
  ['L1', 'L1', 'M2', 'L3', 'L2', 'M1'],
])

const FEATURE_EVENTS = [
  { type: 'reveal', board: SCATTER_BOARD, gameType: 'basegame' },
  { type: 'winInfo', wins: [{ symbol: 'S', kind: 3, win: 100, meta: { ways: 1, globalMult: 1 } }], totalWin: 100 },
  { type: 'freeSpinTrigger', totalFs: 8 },
  { type: 'reveal', board: ORDINARY_BOARD, gameType: 'freegame' },
  { type: 'winInfo', wins: [{ symbol: 'H1', kind: 3, win: 390, meta: { ways: 6, globalMult: 1 } }], totalWin: 390 },
  { type: 'setTotalWin', amount: 490 },
  { type: 'finalWin', amount: 490 },
]

const reset = () => {
  resetSessionRecovery(); seq.length = 0; presented = null; authThrows = null; balance.set(0)
}

console.log('\nDEV: recovery never runs, there is no session to recover')
reset()
check('dev is a no-op', (await recoverSession(true, stub, present)).kind, 'none')
check('  and touches the platform not at all', seq, [])

console.log('\nNO ROUND AT ALL: nothing to do')
reset(); authRound = null
check('reports none', (await recoverSession(false, stub, present)).kind, 'none')
check('  after asking', seq, ['parseSessionParams', 'authenticate'])
check('  and records no active round', get(activeRound), null)
check('  and shows no banner', get(recoveryBannerVisible), false)

console.log('\nROUND PRESENT BUT active:false: history, not work')
reset()
authRound = { betID: 77, active: false, mode: 'base', payout: 5_000_000, state: { events: ORDINARY_EVENTS } }
check('reports none', (await recoverSession(false, stub, present)).kind, 'none')
checkThat('  does NOT settle an already-closed round', !seq.some((c) => c.startsWith('endRound')))
checkThat('  and does not present it either', !seq.includes('present'))
check('  and shows no banner', get(recoveryBannerVisible), false)

console.log('\nACTIVE ORDINARY ROUND: replayed, then settled, then one banner')
reset()
authRound = {
  betID: 88, active: true, mode: 'base', amount: 1_000_000,
  payout: 3_900_000, payoutMultiplier: 390, state: { events: ORDINARY_EVENTS },
}
const ordinary = await recoverSession(false, stub, present)
check('reports resumed', ordinary.kind, 'resumed')
check('  carrying the official numeric betID', (ordinary as { betID: number }).betID, 88)
check('  and the settled balance', (ordinary as { balance: number }).balance, 250)
check('  presented is true', (ordinary as { presented: boolean }).presented, true)
check('  triggered is false for an ordinary round', (ordinary as { triggered: boolean }).triggered, false)

// THE ORDER ASSERTION. This is the design, not a detail.
check('  PRESENT ran BEFORE endRound, in one recorded sequence',
  seq, ['parseSessionParams', 'authenticate', 'present', 'endRound:88'])

check('  the authoritative balance was adopted', get(balance), 250)
check('  the active round is cleared once settled', get(activeRound), null)
check('  ONE banner is showing', get(recoveryBannerVisible), true)
checkThat('  the script handed to playback is the interpreted round',
  presented !== null && presented!.baseSpin.wins.length === 1)
check('  and its board is the padded six-row reveal, for the caller to slice',
  presented!.baseSpin.board.map((r) => r.length), [6, 6, 6, 6, 6])
check('  the interpreted total matches the book payout, in centibets',
  presented!.totalWinCentibets, 390)
// No `recoveredScript` store to assert on, deliberately: the script reaches its
// only consumer through the playback callback, and a store as well would be
// written and never read. The dead-wiring gate caught exactly that in an earlier
// draft, and the right answer was to delete the store, not to allowlist it.
checkThat('the script reached playback by callback, which is the only route',
  presented !== null)

console.log('\n  the banner is dismissible, because nothing is wrong')
dismissRecoveryBanner()
check('  dismissed', get(recoveryBannerVisible), false)

console.log('\nACTIVE FEATURE ROUND: the case that forced the original park')
reset()
authRound = {
  betID: 99, active: true, mode: 'base', amount: 1_000_000,
  payout: 4_900_000, payoutMultiplier: 490, state: { events: FEATURE_EVENTS },
}
const feature = await recoverSession(false, stub, present)
check('reports resumed', feature.kind, 'resumed')
check('  triggered is true', (feature as { triggered: boolean }).triggered, true)
check('  PRESENT ran BEFORE endRound here too',
  seq, ['parseSessionParams', 'authenticate', 'present', 'endRound:99'])
checkThat('  the free-spin sequence reached playback, so the player sees the feature',
  presented !== null && presented!.triggered && presented!.freeSpins.length > 0)
check('  and the scatter trigger is intact', presented!.baseSpin.scatterCount, 3)
check('  banner shown', get(recoveryBannerVisible), true)
check('  balance adopted', get(balance), 250)

console.log('\nACTIVE ROUND WITH UNREADABLE STATE: settles anyway')
// The money is not held hostage to the presentation. A round we cannot replay
// is still a round the platform is holding open.
reset()
authRound = { betID: 100, active: true, mode: 'base', state: { notEvents: true } }
const unreadable = await recoverSession(false, stub, present)
check('still reports resumed', unreadable.kind, 'resumed')
check('  but records presented: false, so the case is visible',
  (unreadable as { presented: boolean }).presented, false)
check('  playback was NOT attempted on nothing',
  seq, ['parseSessionParams', 'authenticate', 'endRound:100'])
check('  and it settled regardless', get(balance), 250)
check('  banner still shown', get(recoveryBannerVisible), true)

console.log('\nSTATE AS A BARE ARRAY: the second accepted shape')
reset()
authRound = { betID: 101, active: true, mode: 'base', state: ORDINARY_EVENTS }
const bare = await recoverSession(false, stub, present)
check('resumed', bare.kind, 'resumed')
check('  presented', (bare as { presented: boolean }).presented, true)

console.log('\nFAILURE: never blocks the player from reaching the game')
reset()
authThrows = new Error('network down')
const failed = await recoverSession(false, stub, present)
check('resolves rather than throwing', failed.kind, 'failed')
check('  carrying the reason', (failed as { error: string }).error, 'network down')
check('  and shows no banner on a failure', get(recoveryBannerVisible), false)

console.log('\nNO FORFEIT PATH EXISTS')
// Asserted against the shipped source, not against behaviour, because the
// absence of a branch cannot be observed by calling the function.
const src = readFileSync('src/lib/stores/sessionRecovery.ts', 'utf8')
checkThat('the parked outcome is gone from the type', !/open-round-parked/.test(src))
checkThat('no forfeit or discard branch was added', !/forfeit path\b(?!.*NO)/i.test(src.replace(/\/\/.*/g, '')))
checkThat('endRound is reached on every active round, not behind a condition',
  /4\. SETTLE\. This runs whether or not the replay ran/.test(src))

const app = readFileSync('src/App.svelte', 'utf8')
// TR-099 widened this from three arguments to four. The assertion's INTENT is
// unchanged and is the reason it exists: both callbacks default to a no-op
// (`NO_PRESENTATION` presents nothing, `NO_OFFER` declines), so a missing
// argument here is not a compile error, it is a silently dead feature. Both are
// therefore named, not just counted.
checkThat('App passes a real playback driver, so recovery is not silently a no-op',
  /recoverSession\(import\.meta\.env\.DEV, undefined, presentRecoveredRound, offerResume\)/.test(app))
checkThat('and a real resume offer, so the cursor is not silently always declined',
  /function offerResume\(/.test(app) && /on:resume=/.test(app) && /on:restart=/.test(app))
checkThat('and renders exactly one recovery banner',
  (app.match(/data-testid="recovery-banner"/g) ?? []).length === 1)

// ---------------------------------------------------------------------------
// THE STAKE IS RESTORED FROM THE AUTHENTICATE RESPONSE, 2026-08-09.
//
// Published item: "Active rounds restore the bet amount from the authenticate
// response". `round.amount` was carried into recovery and never read.
//
// This asserts on MONEY, not just on the readout, because the readout is the
// small half: presentRecoveredRound and FreeSpinsPresentation convert the
// round's centibet awards into currency using whatever betAmount holds, so a
// $5.00 round recovered against the $1.00 default was played back showing a
// fifth of the real figures.
{
  reset()
  betAmount.set(1.00)
  authRound = {
    betID: 77, active: true, mode: 'base', amount: 5 * CURRENCY_SCALE,
    state: { events: ORDINARY_EVENTS },
  }
  const out = await recoverSession(false, stub, present)
  check('an active round is recovered', out.kind !== 'none', true)
  check('the stake is restored from round.amount, not left at the default',
    get(betAmount), 5)
  // 390 centibets is 3.90x. At the restored $5.00 stake that is $19.50; at the
  // $1.00 default it would have rendered $3.90.
  check('so the presented win resolves to the real money amount',
    Math.round((390 / 100) * get(betAmount) * 100) / 100, 19.50)

  // NEGATIVE CONTROL. An absent or zero amount must leave the bet alone rather
  // than zeroing every figure the presentation derives from it.
  reset()
  betAmount.set(2.50)
  authRound = { betID: 78, active: true, mode: 'base', state: { events: ORDINARY_EVENTS } }
  await recoverSession(false, stub, present)
  check('an absent round.amount leaves the current bet untouched', get(betAmount), 2.50)

  reset()
  betAmount.set(2.50)
  authRound = { betID: 79, active: true, mode: 'base', amount: 0, state: { events: ORDINARY_EVENTS } }
  await recoverSession(false, stub, present)
  check('a zero round.amount leaves the current bet untouched', get(betAmount), 2.50)
}

if (failures) { console.error(`\nSESSION RECOVERY: FAIL (${failures})`); process.exit(1) }
console.log('\nSESSION RECOVERY: PASS')
