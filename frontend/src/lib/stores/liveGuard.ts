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

import { writable, derived } from 'svelte/store'

export type LiveGuardReason = null | 'missing-params' | 'auth-failed'

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
