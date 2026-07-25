// sessionRecovery.test.ts - R11 / TR-017 (2026-07-25).
// Run (from frontend/): npx tsx src/lib/stores/sessionRecovery.test.ts
//
// The recovery logic is exercised against a stubbed platform surface rather
// than the real one, because the branch that matters most - a pending_end round
// waiting to be credited - cannot be produced on demand against a live RGS. The
// stub returns exactly the shapes rgsService's own interfaces declare.

import { get } from 'svelte/store'

// A stub platform, injected. ES module exports are read-only bindings, so the
// real functions cannot be replaced in place; recoverSession takes the three
// calls it makes as a parameter instead, defaulting to the real ones.
const calls: string[] = []
let authRound: unknown = undefined
const endRoundBalance = 250
let authThrows: Error | null = null

import { recoverSession, activeRound, resetSessionRecovery } from './sessionRecovery.ts'
import { balance } from './gameStore.ts'

const stub = {
  parseSessionParams: () => { calls.push('parseSessionParams'); return { sessionID: 's', rgs_url: 'https://x' } },
  authenticate: async () => {
    calls.push('authenticate')
    if (authThrows) throw authThrows
    return { balance: 100, minBet: 0.1, maxBet: 100, stepBet: 0.1, betLevels: [1], round: authRound }
  },
  endRound: async (_p: unknown, roundId: string) => {
    calls.push(`endRound:${roundId}`)
    return { balance: endRoundBalance, roundId }
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

console.log('\nNO ROUND IN PROGRESS: nothing to do')
resetSessionRecovery(); calls.length = 0; authRound = undefined
check('reports none', (await recoverSession(false, stub)).kind, 'none')
check('  after asking', calls, ['parseSessionParams', 'authenticate'])
check('  and records no active round', get(activeRound), null)

console.log('\nPENDING_END: the money branch. Settle it and take the balance.')
resetSessionRecovery(); calls.length = 0
authRound = { roundId: 'r-77', state: 'pending_end' }
balance.set(0)
const settled = await recoverSession(false, stub)
check('reports settled', settled.kind, 'settled')
check('  for the right round', (settled as { roundId: string }).roundId, 'r-77')
check('  calls endRound with that round id', calls.includes('endRound:r-77'), true)
check('  and adopts the authoritative balance', get(balance), 250)
check('  clearing the active round once settled', get(activeRound), null)

console.log('\nOPEN: surfaced, NOT guessed at')
resetSessionRecovery(); calls.length = 0
authRound = { roundId: 'r-88', state: 'open' }
const open = await recoverSession(false, stub)
check('is parked rather than resolved', open.kind, 'open-round-parked')
check('  and does NOT call endRound', calls.some((c) => c.startsWith('endRound')), false)
check('  while surfacing the round', get(activeRound), { roundId: 'r-88', state: 'open' })

console.log('\nFAILURE: never blocks the player from reaching the game')
resetSessionRecovery(); calls.length = 0
authThrows = new Error('network down')
const failed = await recoverSession(false, stub)
check('resolves rather than throwing', failed.kind, 'failed')
check('  carrying the reason', (failed as { error: string }).error, 'network down')
authThrows = null

if (failures) { console.error(`\nSESSION RECOVERY: FAIL (${failures})`); process.exit(1) }
console.log('\nSESSION RECOVERY: PASS')
