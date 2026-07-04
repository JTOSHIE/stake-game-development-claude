// betMode.ts — non-locked store for the selected bet mode.
//
// The buy UI writes 'bonus' here immediately before placing a bonus-buy spin,
// and resets to the standing mode afterwards. The Ante toggle writes 'ante' as
// the standing mode for normal spins. The locked rgsService.play() reads this
// (sanctioned additive change) to include the mode in the wallet play request,
// so the server applies the mode cost (base 1.0x, ante 1.5x, bonus 100.0x).
// Default 'base' keeps every existing base spin behaving exactly as before.

import { writable } from 'svelte/store'

export type BetMode = 'base' | 'ante' | 'bonus'

export const selectedBetMode = writable<BetMode>('base')

/** Ante / Double-Chance cost multiplier (matches the maths mode cost). */
export const ANTE_COST = 1.5

// Ante toggle. When on, ordinary spins are placed in 'ante' mode: cost 1.5x for
// ~2x the free-spin trigger rate. Persisted so the choice survives a reload,
// like other player preferences.
const ANTE_KEY = 'fs_ante_enabled'
const _initialAnte =
  typeof localStorage !== 'undefined' && localStorage.getItem(ANTE_KEY) === '1'

export const anteEnabled = writable<boolean>(_initialAnte)

anteEnabled.subscribe((on) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ANTE_KEY, on ? '1' : '0')
    }
  } catch {
    /* private-mode / storage disabled: preference simply not persisted */
  }
})
