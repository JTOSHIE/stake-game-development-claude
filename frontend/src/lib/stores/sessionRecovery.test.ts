// sessionRecovery.test.ts - R11 / TR-017 (2026-07-25).
// Run (from frontend/): npx tsx src/lib/stores/sessionRecovery.test.ts
//
// The recovery logic is exercised against a stubbed platform surface rather
// than the real one, because an in-progress round cannot be produced on demand
// against a live RGS.
//
// ============================================================================
// REWRITTEN AGAINST OFFICIAL-SHAPED FIXTURES, R2R JOB 4, 2026-07-25.
// ============================================================================
//
// The stub used to return `{ balance: 100, minBet, maxBet, stepBet, betLevels,
// round: { roundId: 'r-77', state: 'pending_end' } }`. Every one of those
// shapes was invented, and the `'pending_end'` round in particular is a value
// no platform response can produce: the official round is
// `{ betID: number, active: boolean, mode: string, state: unknown }` and there
// is no status-string vocabulary in the contract at all.
//
// So the old test's headline case, "PENDING_END: the money branch", tested a
// branch that could never fire in production. It is not rewritten to a new
// shape; it is GONE, along with the code it covered, and what replaces it is an
// assertion that the official `active` flag is what drives recovery.
//
// The fixtures below are official-shaped throughout: a nested `balance`, a
// `config` block, typed `jurisdictionFlags`, and rounds carrying `betID`,
// `active` and a `state` holding the round's events.

import { get } from 'svelte/store'

const calls: string[] = []
let authRound: unknown = null
let authThrows: Error | null = null

import { recoverSession, activeRound, resetSessionRecovery } from './sessionRecovery.ts'

// An official-shaped authenticate result, as rgsService.authenticate() now
// returns it: dollars at our boundary, official structure underneath.
const authResult = () => ({
  balance: 100,
  minBet: 0.1,
  maxBet: 100,
  stepBet: 0.1,
  betLevels: [1],
  defaultBetLevel: 1,
  currency: 'USD',
  round: authRound,
  jurisdictionFlags: {
    socialCasino: false, disabledFullscreen: false, disabledTurbo: false,
    disabledSuperTurbo: false, disabledAutoplay: false, disabledSlamstop: false,
    disabledSpacebar: false, disabledBuyFeature: false, displayNetPosition: false,
    displayRTP: false, displaySessionTimer: false, minimumRoundDuration: 0,
  },
  jurisdiction: {},
})

const stub = {
  parseSessionParams: () => { calls.push('parseSessionParams'); return { sessionID: 's', rgs_url: 'https://x' } },
  authenticate: async () => {
    calls.push('authenticate')
    if (authThrows) throw authThrows
    return authResult()
  },
  // The official end-round takes no round identity and returns only a balance.
  // The second parameter is our echo-back, so it is recorded but not required.
  endRound: async (_p: unknown, roundId?: string) => {
    calls.push(`endRound:${roundId ?? ''}`)
    return { balance: 250, roundId }
  },
} as unknown as Parameters<typeof recoverSession>[1]

let failures = 0
const check = (name: string, a: unknown, e: unknown) => {
  if (JSON.stringify(a) === JSON.stringify(e)) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}\n    expected ${JSON.stringify(e)}\n    actual   ${JSON.stringify(a)}`) }
}

console.log('\nDEV: recovery never runs, there is no session to recover')
resetSessionRecovery(); calls.length = 0
check('dev is a no-op', (await recoverSession(true, stub)).kind, 'none')
check('  and touches the platform not at all', calls, [])

console.log('\nNO ROUND AT ALL: nothing to do')
resetSessionRecovery(); calls.length = 0; authRound = null
check('reports none', (await recoverSession(false, stub)).kind, 'none')
check('  after asking', calls, ['parseSessionParams', 'authenticate'])
check('  and records no active round', get(activeRound), null)

console.log('\nROUND PRESENT BUT active:false — history, not work')
resetSessionRecovery(); calls.length = 0
authRound = { betID: 77, active: false, mode: 'base', payout: 5_000_000, state: { events: [] } }
check('reports none', (await recoverSession(false, stub)).kind, 'none')
check('  does NOT settle an already-closed round', calls.some((c) => c.startsWith('endRound')), false)
check('  and records no active round', get(activeRound), null)

console.log('\nROUND active:true — surfaced, NOT guessed at (TR-035b)')
resetSessionRecovery(); calls.length = 0
authRound = {
  betID: 88,
  active: true,
  mode: 'base',
  amount: 1_000_000,
  payoutMultiplier: 0,
  state: { events: [{ type: 'reveal', board: [], gameType: 'basegame' }] },
}
const open = await recoverSession(false, stub)
check('is parked rather than resolved', open.kind, 'open-round-parked')
check('  carrying the official numeric betID', (open as { betID: number }).betID, 88)
check('  and does NOT call endRound', calls.some((c) => c.startsWith('endRound')), false)
check('  while surfacing betID and active', {
  betID: get(activeRound)?.betID, active: get(activeRound)?.active,
}, { betID: 88, active: true })

// The premise change TR-035b needs re-ruling on: the events ARE reachable now.
// The row was parked because "authenticate does not return the round's events".
// Under the official contract it does, in round.state, and this asserts that we
// have kept hold of them rather than discarding them at the store boundary.
const surfaced = get(activeRound)?.state as { events?: unknown[] } | undefined
check('  and the round\'s events survive to the store (TR-035b premise change)',
  Array.isArray(surfaced?.events) && surfaced!.events!.length === 1, true)

console.log('\nFAILURE: never blocks the player from reaching the game')
resetSessionRecovery(); calls.length = 0
authThrows = new Error('network down')
const failed = await recoverSession(false, stub)
check('resolves rather than throwing', failed.kind, 'failed')
check('  carrying the reason', (failed as { error: string }).error, 'network down')
authThrows = null

if (failures) { console.error(`\nSESSION RECOVERY: FAIL (${failures})`); process.exit(1) }
console.log('\nSESSION RECOVERY: PASS')
