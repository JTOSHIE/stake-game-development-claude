// betMode.ts — non-locked store for the selected bet mode.
//
// The locked rgsService.play() reads `selectedBetMode` (sanctioned additive
// change) and includes it in the wallet play request, so the SERVER applies
// that mode's cost. For a standing spin the app sets selectedBetMode = the
// chosen standing mode; for a buy it sets the chosen buy mode just before the
// spin, then resets to the standing mode. Default 'surface' keeps every base
// spin behaving as the LUMEN base game.
//
// LUMEN aligns to its FOUR maths modes (games/lumen): surface / deepdive /
// bloom / abyssalbloom. The mode data (labels, costs, blurbs) lives in ONE
// place — src/lib/config/lumenModes.ts — and this store derives from it, so
// adding/removing a mode is a single-file edit there.

import { writable, derived } from 'svelte/store'
import { LUMEN_MODES, MODE_COST as CONFIG_MODE_COST, type LumenModeId } from '../config/lumenModes'

// Selectable bet modes = LUMEN's four maths modes.
export type BetMode = LumenModeId
/** Standing modes (reels spin normally). deepdive is the enhancer variant. */
export type StandingMode = 'surface' | 'deepdive'
/** Buy tiers (guaranteed feature entry). */
export type BuyMode = 'bloom' | 'abyssalbloom'

/** Cost multiplier per mode (matches the maths mode costs, via the config). */
export const MODE_COST: Record<BetMode, number> = CONFIG_MODE_COST

// Valid standing-mode ids (surface + any enhancer), derived from the config.
const STANDING_IDS: StandingMode[] = LUMEN_MODES
  .filter((m) => m.kind === 'standing' || m.kind === 'enhancer')
  .map((m) => m.id as StandingMode)

export const selectedBetMode = writable<BetMode>('surface')

// The standing mode used for normal (non-buy) spins. Persisted like a player
// preference. 'surface' = base game; 'deepdive' = the Deep Dive enhancer ON.
const KEY = 'lumen_standing_mode'
const _stored = (typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) as StandingMode | null
const _valid = STANDING_IDS.includes(_stored as StandingMode)

export const standingMode = writable<StandingMode>(_valid ? (_stored as StandingMode) : 'surface')

standingMode.subscribe((m) => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, m)
  } catch {
    /* storage disabled: preference simply not persisted */
  }
})

// The Deep Dive enhancer is a persistent toggle: ON => standing mode 'deepdive',
// OFF => 'surface'. (anteEnabled / toggleAnte keep the historical API names so
// the existing AnteToggle component keeps working unchanged.)
export const anteEnabled = derived(standingMode, ($m) => $m === 'deepdive')
export function toggleAnte(): void {
  standingMode.update((m) => (m === 'deepdive' ? 'surface' : 'deepdive'))
}

/** Deep Dive (enhancer) cost multiplier (kept for existing imports). */
export const ANTE_COST = MODE_COST.deepdive
