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
// Flags are supplied by the platform via the authenticate passthrough; unknown
// flags default to the permissive (off) behaviour.
export interface RgJurisdiction {
  rgEnabled: boolean // master switch for the RG UI (session panel, reality checks)
  autoplayDisabled: boolean // some markets ban autoplay entirely (e.g. UK real-money)
  minSpinMs: number // minimum spin/round duration (UK: 2500)
  turboDisabled: boolean // fast-play banned where min spin applies
  realityCheckMs: number // reality-check reminder interval (0 = off)
  maxAutoplaySpins: number // cap on autoplay count (Infinity = uncapped)
}

export const rgJurisdiction = derived(jurisdictionFlags, ($f): RgJurisdiction => ({
  rgEnabled: $f.rgEnabled === true || $f.minSpinMs != null || $f.realityCheckMs != null,
  autoplayDisabled: $f.disabledAutoplay === true,
  minSpinMs: typeof $f.minSpinMs === 'number' ? $f.minSpinMs : 0,
  turboDisabled: $f.disabledTurbo === true || (typeof $f.minSpinMs === 'number' && $f.minSpinMs > 0),
  realityCheckMs: typeof $f.realityCheckMs === 'number' ? $f.realityCheckMs : 0,
  maxAutoplaySpins: typeof $f.maxAutoplaySpins === 'number' ? $f.maxAutoplaySpins : Infinity,
}))

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
