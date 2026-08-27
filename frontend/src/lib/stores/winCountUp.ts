// winCountUp.ts: ONE count-up clock for the win figure.
//
// MID-01, ruled by Fable and carried by `reports/briefs/FS_TRUE_FIXDOWN_Prompt.md`:
// "banner and WIN pod driven from one shared count-up source, with frame-level
// equality asserted".
//
// WHAT WAS WRONG, measured at HEAD before this module existed.
// -----------------------------------------------------------
// Two components animated the SAME number, `$winAmount`, on two independent
// requestAnimationFrame loops with two independent duration rules and identical
// easing:
//
//   WinBanner.svelte:79   TIER_COUNT_UP_MS = { big: 1400, mega: 2000, epic: 2800 }
//   HudOverlay.svelte:312 min(800, 400 + min(400, multiplier * 8))
//
// Both eased on `1 - (1 - p)^3`, so the curves had the same SHAPE and different
// LENGTHS, which is the worst case: the two readouts diverge smoothly rather
// than obviously, and every frame in between shows a player two different
// dollar amounts for one win.
//
// The worked instance in the brief is a big-tier win at 16x: the banner runs
// 1400ms, the HUD runs 400 + 16*8 = 528ms. The HUD therefore settles on the
// final figure 872ms before the celebration reaches it. At the epic tier it is
// far wider: the banner runs 2800ms against a HUD saturated at its 800ms
// ceiling, so the HUD reveals the number a full two seconds early.
//
// THE PLAYER-VISIBLE HARM is not the disagreement, it is the ORDER. The HUD WIN
// pod finishes first and reveals the total the celebration exists to reveal, so
// the banner counts up to a number the player has already read.
//
// THE FIX, and why it is shaped this way.
// ---------------------------------------
// Equality is made STRUCTURAL rather than asserted between two implementations.
// There is one tween engine (`createWinCountUp`), one duration rule
// (`countUpDurationMs`), and one shared instance (`sharedWinCountUp`) driven
// from `$winAmount` by this module rather than by either component. Both the
// App-level WinBanner and the HUD WIN pod are pure READERS of that instance, so
// they cannot disagree on any frame: there is only one number.
//
// THE ONE FIGURE THAT IS DELIBERATELY NOT SHARED. App.svelte mounts a SECOND
// WinBanner for the feature-end celebration (App.svelte:1956) driven by
// FreeSpinsPresentation's own settled total, `liveEndBannerAmount`, precisely
// because `$winAmount` is still un-settled for the whole feature (see
// App.svelte's settleRound() deferral). That banner animates a DIFFERENT number
// from the HUD by design, and forcing it onto the shared instance would have
// made the HUD show a feature total it is deliberately withholding. It gets its
// own instance from the same factory, so it shares the engine and the duration
// rule while keeping its own value. One clock IMPLEMENTATION, one duration
// RULE, two values only where the two values are the point.
//
// Duration below the big-win threshold is the HUD's existing curve, unchanged,
// so ordinary wins tick exactly as they did. At and above it, the celebration's
// tier duration governs both surfaces, which is the half that closes the defect.

import { get, writable, type Readable } from 'svelte/store'
import { winAmount, betAmount, isWincap } from './gameStore'

// Tier thresholds, in multiples of total bet. These were duplicated in
// WinBanner.svelte:32-34; this is now the single declaration and WinBanner
// imports them. soundService.ts:406 refers to them by name in a comment.
export const BIG_WIN_THRESHOLD = 10
export const MEGA_WIN_THRESHOLD = 30
export const EPIC_WIN_THRESHOLD = 100

export type WinTier = 'big' | 'mega' | 'epic'

/** Celebration tier for a bet multiple at or above BIG_WIN_THRESHOLD. */
export function winCountUpTier(multiplier: number): WinTier {
  if (multiplier >= EPIC_WIN_THRESHOLD) return 'epic'
  if (multiplier >= MEGA_WIN_THRESHOLD) return 'mega'
  return 'big'
}

/** Celebration count-up lengths, previously WinBanner.svelte:79. */
export const TIER_COUNT_UP_MS: Record<WinTier, number> = { big: 1400, mega: 2000, epic: 2800 }

// The HUD's own curve for ordinary sub-10x wins, previously HudOverlay.svelte:302-303.
// A 400ms floor rising to an 800ms ceiling, saturating at 50x so a large win
// does not drag the readout out.
const HUD_COUNTUP_MIN_MS = 400
const HUD_COUNTUP_MAX_MS = 800

/**
 * THE single duration rule for the win count-up, in milliseconds.
 *
 * At or above BIG_WIN_THRESHOLD the celebration's tier length governs, so the
 * HUD trails the banner instead of pre-empting it. Below it, the HUD's own
 * curve is unchanged: no banner is raised there, so there is nothing to match.
 */
export function countUpDurationMs(multiplier: number): number {
  if (multiplier >= BIG_WIN_THRESHOLD) return TIER_COUNT_UP_MS[winCountUpTier(multiplier)]
  return Math.min(
    HUD_COUNTUP_MAX_MS,
    HUD_COUNTUP_MIN_MS + Math.min(HUD_COUNTUP_MAX_MS - HUD_COUNTUP_MIN_MS, multiplier * 8),
  )
}

/** The shared easing. Cubic ease-out, as both former loops used. */
export function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3)
}

/**
 * THE PROGRESS CLAMP, and it is clamped at BOTH ends deliberately.
 *
 * WHAT WENT WRONG, measured rather than reasoned about. Both money count-ups in this
 * codebase computed progress as `Math.min(elapsed / duration, 1)`, which bounds the TOP
 * and leaves the BOTTOM open. `startTime` is taken with `performance.now()` when the
 * tween is created, while `tick()` is handed the requestAnimationFrame timestamp, which
 * is the time the FRAME began. When a tween is created during a long frame, that frame
 * timestamp can PRECEDE the captured start, elapsed goes negative, and a negative
 * progress passes straight through.
 *
 * `easeOutCubic` then makes it worse rather than better: it is cubic, so it AMPLIFIES a
 * small negative by about three times. A lead of roughly 24ms, one and a half frames at
 * 60fps, became a rendered value of about -2.6% of the round total.
 *
 * AND THE HARM SCALES WITH THE WIN, which is what made this worth a pass of its own. The
 * same lead renders -$0.10 on a 15x round, -$22.17 on an 830x round, and about -$130 at
 * the 5000x cap. R132 saw the 15x case, recorded it as a shared easing artefact, and did
 * not pursue it; R133 measured the 830x case at -$21.35 on the HUD pod beside -$22.17 on
 * the banner, in six of seven bonus rounds. It is one defect, and it is largest on
 * exactly the wins a player cares most about.
 *
 * Returns 1 for a non-positive or non-finite duration, so a caller cannot divide by zero
 * into an infinity, and 0 for a negative or NaN elapsed.
 */
export function countUpProgress(elapsedMs: number, durationMs: number): number {
  if (!(durationMs > 0)) return 1
  const progress = elapsedMs / durationMs
  // Written as a negated comparison rather than Math.max so that NaN lands on 0 too.
  if (!(progress > 0)) return 0
  return progress < 1 ? progress : 1
}

/**
 * THE SECOND GUARANTEE, and it is deliberately not the same one.
 *
 * The clamp above fixes the cause that was found. This fixes the CLASS: whatever a future
 * caller does to a tween, no money surface reading through this module renders below
 * zero. A single defect can be fixed at its cause; a guarantee has to hold against the
 * next mistake as well, and the two together are what let the report claim a player never
 * sees a negative win rather than that one arithmetic bug was corrected.
 *
 * The comparison is written this way on purpose: NaN and -0 both fall to 0.
 */
export function nonNegativeMoney(value: number): number {
  return value > 0 ? value : 0
}

export interface WinCountUp extends Readable<number> {
  /**
   * Tween up to `target` over the duration `multiplier` implies, or over
   * `durationOverrideMs` when the caller's tier is not derivable from the
   * multiplier.
   *
   * The override exists for exactly one caller and it is not a convenience.
   * WinBanner's explicit-trigger path floors its tier at 'big' for ANY feature
   * outcome, including one under 10x, so that a modest feature still gets a
   * real celebration. Deriving its duration from the multiplier would have run
   * a 3x feature-end banner at 424ms instead of 1400ms and dismissed it a
   * second early. The tier governs there; the multiplier governs everywhere else.
   */
  to(target: number, multiplier: number, durationOverrideMs?: number): void
  /** Cancel any tween and show `value` immediately. */
  snap(value: number): void
  /** Cancel any tween, leaving the current value in place. */
  cancel(): void
}

/**
 * One tween engine. Every animated win figure in the game comes from here, so
 * there is exactly one easing and one frame loop in the codebase.
 *
 * Falls back to snapping where requestAnimationFrame does not exist, so the
 * module is safe to import under tsx and any non-browser context.
 */
export function createWinCountUp(): WinCountUp {
  const value = writable(0)
  let frame: number | null = null

  function cancel(): void {
    if (frame !== null && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(frame)
    frame = null
  }

  function snap(next: number): void {
    cancel()
    value.set(nonNegativeMoney(next))
  }

  function to(target: number, multiplier: number, durationOverrideMs?: number): void {
    cancel()
    if (typeof requestAnimationFrame === 'undefined' || typeof performance === 'undefined') {
      value.set(nonNegativeMoney(target))
      return
    }
    const start = get(value)
    const startTime = performance.now()
    const duration = durationOverrideMs ?? countUpDurationMs(multiplier)

    function tick(now: number): void {
      const progress = countUpProgress(now - startTime, duration)
      value.set(nonNegativeMoney(start + (target - start) * easeOutCubic(progress)))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        value.set(nonNegativeMoney(target))
        frame = null
      }
    }
    frame = requestAnimationFrame(tick)
  }

  return { subscribe: value.subscribe, to, snap, cancel }
}

/**
 * THE shared instance, for the `$winAmount` figure.
 *
 * Driven here rather than by either component, so no component owns the clock
 * and no two components can start it differently. HudOverlay's WIN pod and the
 * App-level WinBanner both read it.
 */
export const sharedWinCountUp = createWinCountUp()

// Reset snaps, increases tween. Carried unchanged from HudOverlay.svelte:330-340:
// a new spin zeroes `$winAmount`, and zeroing should be instant rather than a
// count DOWN through the previous win.
//
// THE BET MULTIPLE IS COMPUTED HERE RATHER THAN READ FROM `winMultiplier`, and
// that is not a style preference. `winMultiplier` is a DERIVED store
// (gameStore.ts:82-85, `$bet > 0 ? $win / $bet : 0`), and a derived store is not
// guaranteed to have recomputed at the instant this subscriber runs: whether it
// has depends on subscription order, which depends on which components happen to
// be mounted. Reading it here returned a STALE multiplier of 0 on the first run
// of `win_countup_sync_gate.mjs`, so every tier ran the 400ms floor instead of
// its tier length: the two surfaces agreed perfectly, on the wrong duration.
//
// `betAmount` is a plain writable, so `get()` on it is always current, and
// `next / bet` is the same closed form gameStore.ts:84 declares. The gate now
// asserts the observed duration against the tier, so this cannot regress quietly.
// ── R132: A ONE-SHOT DURATION OVERRIDE FOR THE NEXT RISE ────────────────────
//
// WHY IT EXISTS. A feature-end celebration always counts over a TIER length,
// because WinBanner calls `ownCountUp.to(v, mult, TIER_COUNT_UP_MS[t])` and
// `winCountUpTier()` floors at 'big'. The HUD pod, driven from here, uses
// `countUpDurationMs(multiplier)` instead - and BELOW the big-win threshold that
// is the short 400..800ms curve. The two agreed while the pod was not counting
// during a feature at all. R132 made the pod count with the celebration, which
// exposed the gap: on a feature paying under 10x the pod FINISHES FIRST and
// shows the round total while the banner is still counting towards it.
//
//     multiplier   pod    banner   pod finishes early by
//        2x        416ms  1400ms        984ms
//        9x        472ms  1400ms        928ms
//       10x+      1400ms  1400ms          0ms
//
// That is a spoiler, and it is exactly the class OWNER AUDIT ROUND 2 set out to
// prevent, so the pod must borrow the celebration's own length for that rise.
// One-shot rather than a mode: it is consumed by the next rise and cleared, so
// nothing can leave the pod permanently on a feature duration.
let nextRiseDurationMs: number | null = null
/** Make the NEXT rise of the shared count-up take exactly `ms`. Consumed once. */
export function setNextRiseDurationMs(ms: number | null): void {
  nextRiseDurationMs = ms != null && ms > 0 ? ms : null
}

let lastWinAmountSeen = 0
winAmount.subscribe((next) => {
  const previous = lastWinAmountSeen
  lastWinAmountSeen = next
  const override = nextRiseDurationMs
  nextRiseDurationMs = null
  if (next > previous) {
    const bet = get(betAmount)
    sharedWinCountUp.to(next, bet > 0 ? next / bet : 0, override ?? undefined)
  } else {
    sharedWinCountUp.snap(next)
  }
})

// MAX-WIN HOLD (owner's order, 2026-07-28), carried unchanged from
// HudOverlay.svelte:355-359 and its reasoning kept because it is not obvious.
// A capped round settles and raises the celebration in the same beat that
// starts this count-up, so the figure went on ticking underneath an opaque
// overlay the owner has ruled must hold with nothing moving behind it.
//
// Snapped rather than paused: the figure is already settled, the tween is
// presentation of a number that is not in doubt, and there is no player to show
// it to while the overlay covers it. Snapping also ends the frame loop rather
// than leaving it running for a hold that is allowed to last forever.
isWincap.subscribe((capped) => {
  if (capped) sharedWinCountUp.snap(get(winAmount))
})
