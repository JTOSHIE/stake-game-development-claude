// betMode.ts — non-locked store for the selected bet mode.
//
// The buy UI writes 'bonus' here immediately before placing a bonus-buy spin,
// and resets to 'base' afterwards. The locked rgsService.play() reads this
// (sanctioned additive change) to include the mode in the wallet play request.
// Default 'base' keeps every existing base spin behaving exactly as before.

import { writable } from 'svelte/store'

export type BetMode = 'base' | 'bonus'

export const selectedBetMode = writable<BetMode>('base')
