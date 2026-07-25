// responsibleGambling.ts — jurisdiction-flag-driven responsible-gambling module.
//
// Reusable across skins: the whole layer is off by default (so the crypto/Stake
// model is unaffected) and switches on per-flag from the RGS authenticate response
// (jurisdictionFlags). It provides: (1) autoplay STOP CONDITIONS beyond a bare
// count, (2) a minimum spin interval + optional autoplay ban (UKGC, enforced May
// 2026), (3) session tracking (time, spins, net) + reality-check reminders.
// Money is integer micros throughout.

import { writable, derived, get } from 'svelte/store'
import { jurisdictionFlags } from './jurisdiction'

// ── Jurisdiction-derived RG configuration ───────────────────────────────────
//
// RETYPED TO THE OFFICIAL FLAGS, R2R JOB 4 / TR-042, 2026-07-25.
//
// Round-two reviewer 3's fourth finding, and it was exactly right. This derived
// store read `minSpinMs`, `realityCheckMs`, `maxAutoplaySpins` and
// `mandatorySessionDisplay`. NONE of those is a field of the official
// `JurisdictionFlags`, so no platform response has ever set one, and the whole
// RG layer was permanently in its permissive default on a real session. The
// tests passed because they injected the same four invented properties: a test
// that supplies the property the code invented proves only that the code can
// read its own invention.
//
// The official twelve, transcribed in rgsService.ts as
// `OfficialJurisdictionFlags`, are:
//
//   socialCasino, disabledFullscreen, disabledTurbo, disabledSuperTurbo,
//   disabledAutoplay, disabledSlamstop, disabledSpacebar, disabledBuyFeature,
//   displayNetPosition, displayRTP, displaySessionTimer, minimumRoundDuration
//
// MAPPING, each with its reasoning rather than a guess:
//
//   minSpinMs            -> minimumRoundDuration. The official numeric
//                           equivalent, same meaning and same unit
//                           (milliseconds), so the UK 2,500 ms rule now has a
//                           real field behind it for the first time.
//   maxAutoplaySpins     -> NO official equivalent. The official contract can
//                           disable autoplay outright (disabledAutoplay) but
//                           cannot cap it. The cap therefore becomes what it
//                           always effectively was, uncapped, unless a caller
//                           passes a count. Kept in the interface because the
//                           autoplay UI's own count still flows through it.
//   realityCheckMs       -> NO official equivalent. Reality checks are not a
//                           platform-driven feature at the pin. Held at 0
//                           (off), which is exactly what a live session did
//                           anyway; nothing regresses.
//   mandatorySessionDisplay -> displaySessionTimer. The official flag that
//                           requires the session display to be on screen.
//   rgEnabled            -> derived from the real flags now, rather than from
//                           two fields that never arrived.
//
// The two with no official equivalent are NOT deleted, because both are read by
// the autoplay and session UI and deleting them would spread this change across
// components for no gain. They are pinned to their permissive values with the
// reason stated, so nobody re-wires them to an invented flag again.

export interface RgJurisdiction {
  rgEnabled: boolean // master switch for the RG UI (session panel, reality checks)
  autoplayDisabled: boolean // some markets ban autoplay entirely (e.g. UK real-money)
  minSpinMs: number // minimum round duration, from official minimumRoundDuration
  turboDisabled: boolean // fast-play banned where min spin applies
  realityCheckMs: number // no official flag at the pin; always 0 (off)
  maxAutoplaySpins: number // no official flag at the pin; always Infinity
  mandatorySessionDisplay: boolean // from official displaySessionTimer
  // The official flags with no prior representation here at all. Added so the
  // controls they govern can be wired to them rather than to nothing.
  superTurboDisabled: boolean // disabledSuperTurbo, read by speedMode.cycleSpeed
  slamStopDisabled: boolean // disabledSlamstop, read by App.svelte's slam handler
  spacebarDisabled: boolean // disabledSpacebar, read by App.svelte's key handler
  // ── NO CONSUMER YET, and said so rather than left ambiguous ──────────────
  //
  // R7/TR-015's finding was a flag that was derived correctly and read by
  // nobody. Three of the flags below are in that state on purpose rather than
  // by oversight, and the difference is worth writing down: the enforcement
  // flags above all have readers, and these three describe affordances this
  // game does not currently offer.
  //
  //   fullscreenDisabled  the game has no fullscreen control of its own; the
  //                       platform frame owns that chrome. Nothing to disable.
  //   displayRTP          the RTP is shown UNCONDITIONALLY in the paytable,
  //                       which is the stricter behaviour. A flag that can only
  //                       ask us to show it has nothing to change.
  //   displayNetPosition  the session panel already shows net position whenever
  //                       the RG layer is on. Same reasoning.
  //
  // If any of the three ever needs to gate something, it is already derived and
  // waiting. They are listed here so a future reader does not have to work out
  // whether their silence is a bug.
  fullscreenDisabled: boolean // disabledFullscreen, no consumer, see above
  displayRTP: boolean // displayRTP, no consumer, see above
  displayNetPosition: boolean // displayNetPosition, no consumer, see above
  socialCasino: boolean // socialCasino, read by stores/socialMode.isSocial
}

export const rgJurisdiction = derived(jurisdictionFlags, ($f): RgJurisdiction => {
  const minSpinMs = typeof $f.minimumRoundDuration === 'number' ? $f.minimumRoundDuration : 0
  return {
    // Any operative restriction switches the RG layer on. Reading a set of real
    // flags rather than the presence of two invented ones.
    rgEnabled:
      minSpinMs > 0 ||
      $f.disabledAutoplay === true ||
      $f.displaySessionTimer === true ||
      $f.displayNetPosition === true,
    autoplayDisabled: $f.disabledAutoplay === true,
    minSpinMs,
    turboDisabled: $f.disabledTurbo === true || minSpinMs > 0,
    // No official flag. Held at the permissive value with the reason above.
    realityCheckMs: 0,
    maxAutoplaySpins: Infinity,
    mandatorySessionDisplay: $f.displaySessionTimer === true,
    superTurboDisabled: $f.disabledSuperTurbo === true,
    slamStopDisabled: $f.disabledSlamstop === true,
    spacebarDisabled: $f.disabledSpacebar === true,
    fullscreenDisabled: $f.disabledFullscreen === true,
    displayRTP: $f.displayRTP === true,
    displayNetPosition: $f.displayNetPosition === true,
    socialCasino: $f.socialCasino === true,
  }
})

// ── Session panel on-demand visibility (2026-07-14c) ─────────────────────────
// Set by the HUD menu's "Session" item (all three layout modes), read by
// SessionPanel.svelte to show its on-demand sheet - same shared-store pattern
// gameStore.ts's showPaytable already uses for PaytableModal, just homed here
// since it's RG-domain state, not core game state (gameStore.ts is locked).
export const showSessionPanel = writable<boolean>(false)

// ── Autoplay stop-condition config (set when the player starts autoplay) ─────
export interface AutoplayLimits {
  count: number // number of spins (0 = until stopped)
  stopOnAnyWin: boolean
  singleWinLimitMult: number // stop if a single win >= this x total bet (0 = off)
  stopOnFeature: boolean // stop when free spins trigger
  lossLimitMicros: number // stop if cumulative session loss reaches this (0 = off)
}

export const defaultAutoplayLimits: AutoplayLimits = {
  count: 10,
  stopOnAnyWin: false,
  singleWinLimitMult: 0,
  stopOnFeature: true, // sensible default: surface the feature to the player
  lossLimitMicros: 0,
}

export const autoplayLimits = writable<AutoplayLimits>({ ...defaultAutoplayLimits })

// ── Session tracking (integer micros) ───────────────────────────────────────
export interface RgSession {
  startMs: number // monotonic session start (performance.now)
  lastCheckMs: number // last reality-check acknowledgement
  spins: number
  wageredMicros: number
  wonMicros: number
}
const now = (): number => (typeof performance !== 'undefined' ? performance.now() : 0)

export const rgSession = writable<RgSession>({
  startMs: now(),
  lastCheckMs: now(),
  spins: 0,
  wageredMicros: 0,
  wonMicros: 0,
})

/** Net position this session (won - wagered), integer micros (negative = loss). */
export const rgNetMicros = derived(rgSession, ($s) => $s.wonMicros - $s.wageredMicros)

/** Record a resolved round into the session. Call once per spin/buy. */
export function rgRecordSpin(costMicros: number, winMicros: number): void {
  rgSession.update((s) => ({
    ...s,
    spins: s.spins + 1,
    wageredMicros: s.wageredMicros + Math.max(0, Math.round(costMicros)),
    wonMicros: s.wonMicros + Math.max(0, Math.round(winMicros)),
  }))
}

/** Reset the session (new authenticate / new player session). */
export function rgResetSession(): void {
  rgSession.set({ startMs: now(), lastCheckMs: now(), spins: 0, wageredMicros: 0, wonMicros: 0 })
}

// ── Autoplay stop decision ──────────────────────────────────────────────────
export interface AutoplaySpinContext {
  winMicros: number
  betMicros: number // BASE bet (single-win limit is x total bet)
  triggered: boolean // free spins triggered this round
}

/** Decide whether autoplay must stop after this round. Reason is player-facing. */
export function autoplayShouldStop(ctx: AutoplaySpinContext): { stop: boolean; reason?: string } {
  const lim = get(autoplayLimits)
  if (lim.stopOnFeature && ctx.triggered) return { stop: true, reason: 'feature triggered' }
  if (lim.stopOnAnyWin && ctx.winMicros > 0) return { stop: true, reason: 'win' }
  if (lim.singleWinLimitMult > 0 && ctx.betMicros > 0 && ctx.winMicros >= lim.singleWinLimitMult * ctx.betMicros)
    return { stop: true, reason: `single win >= ${lim.singleWinLimitMult}x` }
  if (lim.lossLimitMicros > 0 && get(rgNetMicros) <= -lim.lossLimitMicros)
    return { stop: true, reason: 'loss limit reached' }
  return { stop: false }
}

/**
 * The autoplay counts a player may actually choose.
 *
 * R7/TR-015 (2026-07-25): `maxAutoplaySpins` previously gated only the infinite
 * option, so a market capping autoplay at 25 still offered 50 and 100 and the
 * player could start them. Options above the cap are removed, and if the cap
 * falls below every offered option the cap itself is offered so autoplay stays
 * reachable at a legal count rather than silently disappearing.
 */
export function rgAllowedAutoplayCounts(
  options: number[],
  cap: number = get(rgJurisdiction).maxAutoplaySpins,
): number[] {
  if (!Number.isFinite(cap)) return [...options]
  const allowed = options.filter((n) => n <= cap)
  return allowed.length ? allowed : [cap]
}

/**
 * Clamp a requested autoplay count to the jurisdiction cap. Belt and braces.
 *
 * R2R JOB 4 / TR-042: `cap` is now an explicit optional parameter, matching
 * `rgAllowedAutoplayCounts` above. At the pinned official contract the store's
 * cap is always Infinity, because no official flag caps autoplay, so without a
 * parameter this function and its sibling would be untestable and would quietly
 * become dead code. The capping LOGIC is correct and worth keeping intact for
 * the day a cap flag exists; what changed is that it is no longer fed by a flag
 * name we invented.
 */
export function rgClampAutoplayCount(
  count: number,
  cap: number = get(rgJurisdiction).maxAutoplaySpins,
): number {
  if (!Number.isFinite(cap)) return count
  return Math.min(count, cap)
}

/** True when the infinite autoplay option may be offered at all. */
export const rgInfiniteAutoplayAllowed = derived(
  rgJurisdiction,
  ($j) => !Number.isFinite($j.maxAutoplaySpins),
)

/** Enforce the jurisdiction minimum spin interval on a requested autoplay delay. */
export function rgSpinDelay(requestedMs: number): number {
  return Math.max(requestedMs, get(rgJurisdiction).minSpinMs)
}

/** True when a reality-check reminder is due (interval elapsed since last ack). */
export const realityCheckDue = derived([rgSession, rgJurisdiction], ([$s, $j]) => {
  if (!$j.realityCheckMs) return false
  return now() - $s.lastCheckMs >= $j.realityCheckMs
})

/** Acknowledge a reality check (resets the timer). */
export function ackRealityCheck(): void {
  rgSession.update((s) => ({ ...s, lastCheckMs: now() }))
}
