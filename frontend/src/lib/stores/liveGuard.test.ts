// liveGuard.test.ts - R2 / TR-010 (2026-07-25).
// Run (from frontend/): npx tsx src/lib/stores/liveGuard.test.ts
import { get } from 'svelte/store'
import { evaluateLiveGuard, bettingDisabled, liveGuardReason, resetLiveGuard } from './liveGuard.ts'

let failures = 0
const check = (name: string, a: unknown, e: unknown) => {
  if (JSON.stringify(a) === JSON.stringify(e)) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}\n    expected ${JSON.stringify(e)}\n    actual   ${JSON.stringify(a)}`) }
}

console.log('\nPRODUCTION: betting requires positive evidence of a live session')
resetLiveGuard()
check('params present, auth clean -> betting allowed', evaluateLiveGuard(true, false, false), null)
check('  and the store agrees', get(bettingDisabled), false)

check('auth FAILED -> betting disabled', evaluateLiveGuard(true, true, false), 'auth-failed')
check('  and the store agrees', get(bettingDisabled), true)

check('params MISSING -> betting disabled', evaluateLiveGuard(false, false, false), 'missing-params')
check('both wrong -> the auth failure is reported', evaluateLiveGuard(false, true, false), 'auth-failed')

console.log('\nDEVELOPMENT: the mock is the point, so the guard never engages')
check('dev, params missing -> allowed', evaluateLiveGuard(false, false, true), null)
check('dev, auth failed -> allowed', evaluateLiveGuard(true, true, true), null)
check('  and the store agrees', get(bettingDisabled), false)

console.log('\nTHE DEFECT THIS PREVENTS')
// rgsService sets _rgsMode = false on BOTH the dev no-params branch and a real
// auth failure, then spin() falls through to _mockSpin(). In production that
// served fabricated wins against no wallet. The guard makes it unreachable.
resetLiveGuard()
evaluateLiveGuard(true, true, false)
check('a production auth failure blocks every bet route', get(bettingDisabled), true)
check('and names the reason for the player-facing banner', get(liveGuardReason), 'auth-failed')

if (failures) { console.error(`\nLIVE GUARD: FAIL (${failures})`); process.exit(1) }
console.log('\nLIVE GUARD: PASS')
