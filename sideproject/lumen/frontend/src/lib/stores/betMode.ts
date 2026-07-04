// betMode.ts — non-locked store for the selected bet mode + the template mode library.
//
// The locked rgsService.play() reads `selectedBetMode` (sanctioned additive change) and
// includes it in the wallet play request, so the SERVER applies that mode's cost. For a
// standing spin the app sets selectedBetMode = the chosen standing mode; for a buy it sets
// the chosen buy mode just before the spin, then resets to the standing mode. Default 'base'
// keeps every existing base spin behaving exactly as before.

import { writable, derived } from 'svelte/store'

// Full 11-mode template library (all 96.35% RTP, 5,000x cap; see docs/MASTER_TEMPLATE.md).
export type StandingMode = 'base' | 'cruise' | 'antelite' | 'ante' | 'volatile' | 'superante'
export type BuyMode = 'minibuy' | 'bonus' | 'superbuy' | 'megabuy' | 'hyperbuy'
export type BetMode = StandingMode | BuyMode

/** Cost multiplier per mode (matches the maths mode costs). */
export const MODE_COST: Record<BetMode, number> = {
  base: 1.0, cruise: 1.0, antelite: 1.25, ante: 1.5, volatile: 1.0, superante: 2.0,
  minibuy: 80, bonus: 100, superbuy: 300, megabuy: 500, hyperbuy: 1000,
}

/** Standing modes (reels spin normally); id, short label, cost, one-line character. */
export const STANDING_MODES: { id: StandingMode; label: string; cost: number; note: string }[] = [
  { id: 'cruise',    label: 'CRUISE',     cost: 1.0,  note: 'low volatility' },
  { id: 'base',      label: 'NORMAL',     cost: 1.0,  note: 'standard game' },
  { id: 'antelite',  label: 'ANTE +25%',  cost: 1.25, note: '~1.6x trigger' },
  { id: 'ante',      label: 'DOUBLE',     cost: 1.5,  note: '~2x trigger' },
  { id: 'volatile',  label: 'VOLATILE',   cost: 1.0,  note: 'high volatility' },
  { id: 'superante', label: 'SUPER ANTE', cost: 2.0,  note: '~3x trigger' },
]

/** Buy tiers (guaranteed feature entry). */
export const BUY_MODES: { id: BuyMode; label: string; cost: number; note: string }[] = [
  { id: 'minibuy',  label: 'MINI',  cost: 80,   note: 'weak entry' },
  { id: 'bonus',    label: 'BUY',   cost: 100,  note: 'standard' },
  { id: 'superbuy', label: 'SUPER', cost: 300,  note: 'rich entry' },
  { id: 'megabuy',  label: 'MEGA',  cost: 500,  note: 'richest' },
  { id: 'hyperbuy', label: 'HYPER', cost: 1000, note: 'richest' },
]

export const selectedBetMode = writable<BetMode>('base')

// The standing mode used for normal (non-buy) spins. Persisted like a player preference.
const KEY = 'fs_standing_mode'
const _stored = (typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) as StandingMode | null
const _valid = STANDING_MODES.some((m) => m.id === _stored)

export const standingMode = writable<StandingMode>(_valid ? (_stored as StandingMode) : 'base')

standingMode.subscribe((m) => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, m)
  } catch {
    /* storage disabled: preference simply not persisted */
  }
})

// Backward-compat for the production Ante toggle: on == the standing mode is 'ante'.
export const anteEnabled = derived(standingMode, ($m) => $m === 'ante')
export function toggleAnte(): void {
  standingMode.update((m) => (m === 'ante' ? 'base' : 'ante'))
}

/** Ante cost multiplier (kept for existing imports). */
export const ANTE_COST = MODE_COST.ante
