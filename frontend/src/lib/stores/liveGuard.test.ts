// liveGuard.test.ts - R2 / TR-010 (2026-07-25).
// Run (from frontend/): npx tsx src/lib/stores/liveGuard.test.ts
import { get } from 'svelte/store'
import { evaluateLiveGuard, bettingDisabled, liveGuardReason, liveGuardMessageKey, resetLiveGuard } from './liveGuard.ts'

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

// ---------------------------------------------------------------------------
// A RUNTIME REASON SURVIVES A BOOT RE-EVALUATION, 2026-08-10.
//
// evaluateLiveGuard decides from what initRGS reported. It knows nothing about a
// wallet request that stalled, or a recovered round whose settle failed, and
// both are set elsewhere and can already be in place when it runs.
//
// THIS IS THE DANGEROUS ONE. Letting a boot re-evaluation write null over
// 'wallet-stalled' re-enables betting on a session whose _rgsMode is false, and
// spin() then falls through to _mockSpin(): the mock-containment defect this
// module exists to prevent. The verifying agent measured it with the guard
// removed, and a spin in that window paid a FABRICATED 12.30 with no wallet
// request at all.
{
  liveGuardReason.set('wallet-stalled')
  evaluateLiveGuard(true, false, false)   // a boot decision that would say "fine"
  check('a stall is not cleared by a healthy re-evaluation',
    get(liveGuardReason), 'wallet-stalled')
  check('so betting stays blocked', get(bettingDisabled), true)

  liveGuardReason.set('settle-failed')
  evaluateLiveGuard(true, false, false)
  check('an unsettled round is not cleared either',
    get(liveGuardReason), 'settle-failed')

  // NEGATIVE CONTROLS. The stickiness must be NARROW: the two BOOT reasons stay
  // fully re-evaluable, or a transient auth failure would wedge the game for the
  // rest of the session.
  liveGuardReason.set('auth-failed')
  evaluateLiveGuard(true, false, false)
  check('a boot reason IS re-evaluable and clears', get(liveGuardReason), null)

  liveGuardReason.set('missing-params')
  evaluateLiveGuard(true, false, false)
  check('and so is the other one', get(liveGuardReason), null)

  liveGuardReason.set(null)
  evaluateLiveGuard(true, true, false)
  check('a fresh auth failure still blocks', get(liveGuardReason), 'auth-failed')
  liveGuardReason.set(null)
}

// ── R041 / Q4: the blocked session must state the RIGHT cause ────────────────
//
// Every blocked reason used to render `errSessionUnavailable`, whose middle
// sentence is "Your session could not be verified". For the two RUNTIME reasons
// that sentence is FALSE: the session authenticated, and it was the settle or
// the wallet round trip that failed. Asserted here rather than in a browser
// because the map is a pure derived store, which is the whole reason it lives
// in this file instead of in App.svelte's markup.
console.log('\nR041: the banner names the cause that actually happened')
{
  const cases: Array<[string, string]> = [
    ['settle-failed',  'errRoundIncomplete'],
    ['wallet-stalled', 'errRoundIncomplete'],
    ['auth-failed',    'errSessionUnavailable'],
    ['missing-params', 'errSessionUnavailable'],
  ]
  for (const [reason, key] of cases) {
    liveGuardReason.set(reason as never)
    check(`${reason} renders ${key}`, get(liveGuardMessageKey), key)
  }
  // NEGATIVE CONTROL. A fifth reason added later must not silently inherit
  // whichever banner happens to be in the template: the default is the auth
  // wording, and a maintainer who adds a runtime reason has to come here.
  liveGuardReason.set(null)
  check('and the unblocked state still resolves to a real key',
    get(liveGuardMessageKey), 'errSessionUnavailable')
  // The two must be DIFFERENT strings, or the whole fix is decorative.
  check('the two banners are genuinely different keys',
    'errRoundIncomplete' !== 'errSessionUnavailable', true)
  liveGuardReason.set(null)
}

if (failures) { console.error(`\nLIVE GUARD: FAIL (${failures})`); process.exit(1) }
console.log('\nLIVE GUARD: PASS')
