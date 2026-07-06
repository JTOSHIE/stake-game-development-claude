// betMode.ts — non-locked store for the selected bet mode.
//
// The buy UI writes 'bonus' here immediately before placing a bonus-buy spin,
// and resets to 'base' afterwards. The locked rgsService.play() reads this
// (sanctioned additive change) to include the mode in the wallet play request.
// Default 'base' keeps every existing base spin behaving exactly as before.

import { writable } from 'svelte/store'

// Widened forward-looking to cover every serverMode in config/fsModes.ts. Only
// the two live modes ('base', 'bonus') are ever written at runtime today; the
// other three ('cruise', 'antelite', 'super') exist so the FEATURES menu and
// its config type-check against the full set before their maths ships. The
// locked rgsService reads selectedBetMode; its default stays 'base', unchanged.
export type BetMode = 'base' | 'bonus' | 'cruise' | 'antelite' | 'super'

export const selectedBetMode = writable<BetMode>('base')

// Selected standing (base) mode. Additive, for template completeness - only
// meaningful once Cruise ships; default 'base' keeps today's behaviour.
export const standingMode = writable<BetMode>('base')
