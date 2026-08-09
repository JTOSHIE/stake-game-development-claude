// liveGuard.ts - production mock containment. Non-locked. (R2/TR-010, 2026-07-25)
//
// THE DEFECT
//
// rgsService.initRGS() sets `_rgsMode = false` on BOTH branches of its failure
// handling: when launch params are absent (the dev case, correct) and when a
// real authenticate call fails (the live case). spin() then reads
//
//     if (_rgsMode && _sessionParams) { ...live... }
//     return _mockSpin(req)
//
// so a production player whose session failed to authenticate would silently be
// served the MOCK: fabricated boards, fabricated wins, and no wallet behind any
// of it. The balance on screen would move. Nothing would reach the RGS.
//
// rgsService.ts is locked and out of scope for this run, so the fallthrough
// cannot be removed at source. It is made UNREACHABLE BY A PLAYER instead: this
// module decides whether the session is one we are willing to take bets on, and
// every bet-placing control is gated on it.
//
// THE RULE, stated as a positive requirement rather than a list of failures:
// in a production build, betting is enabled ONLY when the launch parameters are
// present AND authenticate did not report an error. Anything else disables
// betting and says so to the player. Absence of evidence that we are live is
// treated as evidence that we are not.
//
// In a development build the mock is the point, so the guard never engages.

import { writable, derived, get } from 'svelte/store'

/**
 * `settle-failed` is set by sessionRecovery, never by evaluateLiveGuard: it is
 * discovered AFTER the boot decision, when a recovered round's end-round call
 * fails. The session authenticated fine, so the guard's own inputs say nothing
 * is wrong. What IS wrong is that the platform is still holding an open round
 * this client could not close, and betting on top of that is exactly what the
 * other two reasons already prohibit. 2026-08-10.
 */
export type LiveGuardReason = null | 'missing-params' | 'auth-failed' | 'settle-failed' | 'wallet-stalled'

/** Why betting is disabled, or null when it is not. */
export const liveGuardReason = writable<LiveGuardReason>(null)

/** True when no bet may be placed by any route. */
export const bettingDisabled = derived(liveGuardReason, ($r) => $r !== null)

/**
 * Decide once, at boot, after initRGS has settled.
 *
 * @param hasLaunchParams whether the launch URL carried a real session
 * @param authErrored     whether initRGS surfaced an error message
 * @param isDev           import.meta.env.DEV, passed in so this stays testable
 */
export function evaluateLiveGuard(
  hasLaunchParams: boolean,
  authErrored: boolean,
  isDev: boolean,
): LiveGuardReason {
  // A RUNTIME REASON ALREADY OBSERVED IS NEVER CLEARED HERE.
  //
  // This function decides at BOOT from what initRGS reported. It knows nothing
  // about a wallet request that stalled, or a recovered round whose settle
  // failed, and both of those are set elsewhere and can already be in place when
  // it runs.
  //
  // Letting it write null over `wallet-stalled` re-enables betting on a session
  // whose `_rgsMode` is false, and `spin()` then falls through to `_mockSpin()`:
  // the exact mock-containment defect this module exists to prevent. Measured by
  // the verifying agent, not assumed: with this guard removed, a stalled
  // authenticate re-enabled betting for 15s and a spin in that window paid a
  // FABRICATED 12.30 with no wallet request at all.
  //
  // `settle-failed` is included for the same reason: the platform is still
  // holding a round this client could not close.
  //
  // Deliberately narrow. It refuses to clear only the RUNTIME reasons; the two
  // boot reasons stay fully re-evaluable, which is what liveGuard.test.ts
  // asserts by calling this repeatedly without a reset in between.
  const runtime = get(liveGuardReason)
  if (runtime === 'wallet-stalled' || runtime === 'settle-failed') return runtime

  if (isDev) {
    liveGuardReason.set(null)
    return null
  }
  const reason: LiveGuardReason = authErrored
    ? 'auth-failed'
    : hasLaunchParams
      ? null
      : 'missing-params'
  liveGuardReason.set(reason)
  return reason
}

/** Test helper. Not used by production code. */
export function resetLiveGuard(): void {
  liveGuardReason.set(null)
}
