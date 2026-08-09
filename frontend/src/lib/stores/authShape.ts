// authShape.ts
//
// Did the authenticate response actually carry a session?
//
// THE DEFECT THIS EXISTS FOR. `rgsService.authenticate` defaults every missing
// field to zero (`raw.balance?.amount ?? 0`, `config.minBet ?? 0`,
// `(config.betLevels ?? []).map(...)`) and nothing validates the response SHAPE.
// A platform answering 200 with `{}` therefore produced a session that looked
// perfectly ordinary and was empty: balance $0.00, the spin control disabled,
// and NO BANNER OF ANY KIND. Measured on the shipped build: live-guard-banner
// null, recovery-banner null, spin disabled true. A mute dead game with nothing
// on screen telling the player why, which is the one state R2/TR-010 exists to
// prevent.
//
// WHY THIS IS A SEPARATE STORE RATHER THAN A WIDER `authErrored`, and it is the
// whole reason this landed as a redesign. The obvious fix is to fold the shape
// check into the `authErrored` argument of `evaluateLiveGuard`. That flag also
// raises `bettingDisabled`, and `bettingDisabled` is NOT banner-only:
// App.svelte gates SESSION RECOVERY on it (`if (!get(bettingDisabled))`), and
// recovery is what calls `endRound` and credits the payout of a round the
// platform is still holding open.
//
// So folding the check in would have stranded real money. A player who staked
// their last funds authenticates with balance 0 and, on a platform that sends no
// bet ladder, with an empty `betLevels` too. That session is indistinguishable
// from `{}` on the fields the guard can see, and disabling it would have skipped
// settlement for a round that was genuinely open. Measured before choosing:
// with a broke player holding an open round, settlement runs today and credits
// them, `end-round CALLS: 1` and `BALANCE $25.00`.
//
// `minBet` is the field that separates the two cases, and only a caller holding
// the WHOLE response can see it. `sessionRecovery.ts` is that caller: it is not
// locked, it already calls `authenticate` on every live launch, and it already
// reads minBet, maxBet, betLevels and round. So the judgement is made there and
// published here, and the guard is re-evaluated AFTER settlement rather than
// before it.
//
// 2026-08-10.

import { writable } from 'svelte/store'

/**
 * True when the authenticate response carried nothing that could describe a
 * session: no bet envelope, no ladder, no balance and no open round.
 *
 * Deliberately NOT "the balance is zero". A broke player is a valid live
 * session and must keep settlement, autoplay stop-conditions and every other
 * behaviour a live session has.
 */
export const authPublishedNothing = writable<boolean>(false)

/**
 * The shape test, exported so it can be asserted directly rather than only
 * through a browser.
 *
 * A session is REAL if any one of these is present. Any single one of them is
 * something a platform can only have sent deliberately.
 */
export function publishedNothing(auth: {
  minBet?: number
  maxBet?: number
  betLevels?: readonly number[] | null
  balance?: number
  round?: unknown
} | null | undefined): boolean {
  if (!auth) return true
  const has = (n: unknown): boolean => typeof n === 'number' && Number.isFinite(n) && n > 0
  return !(
    has(auth.minBet)
    || has(auth.maxBet)
    || (auth.betLevels?.length ?? 0) > 0
    || has(auth.balance)
    || (auth.round !== null && auth.round !== undefined)
  )
}
