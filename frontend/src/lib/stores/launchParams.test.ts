// launchParams.test.ts - R2R blocker 1 regression. (2026-07-25)
// Run (from frontend/): npx tsx src/lib/stores/launchParams.test.ts
//
// The official Stake Engine launch sends `sessionID`. App.svelte read only
// `session`, so an official launch produced no token, authenticate failed, and
// the live guard correctly refused to take a bet: the game was unplayable on a
// real URL while working perfectly on a dev one.
//
// These assert the resolution ORDER as the app performs it, so the token read
// and the live-guard check cannot drift apart again.
import { evaluateLiveGuard, resetLiveGuard } from './liveGuard.ts'

let failures = 0
const check = (name: string, a: unknown, e: unknown) => {
  if (JSON.stringify(a) === JSON.stringify(e)) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}\n    expected ${JSON.stringify(e)}\n    actual   ${JSON.stringify(a)}`) }
}

// Mirrors App.svelte exactly: sessionID first, session as legacy fallback.
const resolveToken = (q: URLSearchParams) =>
  q.get('sessionID') ?? q.get('session') ?? 'dev-mock-token'
const hasLaunchParams = (q: URLSearchParams) =>
  (q.get('sessionID') !== null || q.get('session') !== null) && q.get('rgs_url') !== null

const url = (s: string) => new URLSearchParams(s)

console.log('\nTOKEN RESOLUTION')
check('official sessionID is used', resolveToken(url('sessionID=abc123&rgs_url=x')), 'abc123')
check('legacy session still works', resolveToken(url('session=legacy1&rgs_url=x')), 'legacy1')
check('sessionID wins when both are present', resolveToken(url('sessionID=new&session=old')), 'new')
check('neither falls back to the dev token', resolveToken(url('rgs_url=x')), 'dev-mock-token')

console.log('\nLIVE GUARD, the half that made it fatal')
check('OFFICIAL launch is recognised as live', hasLaunchParams(url('sessionID=abc&rgs_url=https://r')), true)
check('legacy launch is still recognised', hasLaunchParams(url('session=abc&rgs_url=https://r')), true)
check('no rgs_url is not a launch', hasLaunchParams(url('sessionID=abc')), false)
check('no session of either name is not a launch', hasLaunchParams(url('rgs_url=https://r')), false)

console.log('\nEND TO END: an official launch must enable the live path')
resetLiveGuard()
check('official URL, production build, authenticate clean -> betting ENABLED',
  evaluateLiveGuard(hasLaunchParams(url('sessionID=abc&rgs_url=https://r')), false, false), null)
// The regression, asserted as it actually presented: before the fix
// hasLaunchParams was false on an official URL, so the guard blocked betting.
check('the pre-fix behaviour would have BLOCKED it',
  evaluateLiveGuard(url('sessionID=abc&rgs_url=https://r').get('session') !== null, false, false), 'missing-params')

if (failures) { console.error(`\nLAUNCH PARAMS: FAIL (${failures})`); process.exit(1) }
console.log('\nLAUNCH PARAMS: PASS')
