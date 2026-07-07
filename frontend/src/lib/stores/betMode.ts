// betMode.ts — non-locked store for the selected bet mode.
//
// The buy UI writes 'bonus' here immediately before placing a bonus-buy spin,
// and resets to 'base' afterwards. The locked rgsService.play() reads this
// (sanctioned additive change) to include the mode in the wallet play request.
// Default 'base' keeps every existing base spin behaving exactly as before.

import { writable } from 'svelte/store'

// Covers every serverMode in config/fsModes.ts. FeatureMath v2 (2026-07-07)
// shipped all five modes' maths and the FEATURES menu exposes all five as
// live, selectable controls (none are "coming soon" placeholders any more).
// The locked rgsService reads selectedBetMode; its default stays 'base',
// unchanged. `selectedBetMode` is correctly threaded through for both buy
// tiers (handleBuy) and standing/enhancer modes (handleSpin, fixed 2026-07-07
// per the Wiring Integrity Audit - see reports/qa/wiring_integrity_audit_2026-07-07.md).
export type BetMode = 'base' | 'bonus' | 'cruise' | 'antelite' | 'super'

export const selectedBetMode = writable<BetMode>('base')

// Selected standing (base) mode. FeatureMenu.svelte's selectStanding()/
// toggleEnhancer() write this; App.svelte's handleSpin() reads it (fixed
// 2026-07-07 - previously a dead-end store, see the Wiring Integrity Audit
// report for the original finding) and computes the real per-mode cost from
// MODE_COST[$standingMode], so OVERBOOST's 1.25x is a genuine per-spin debit
// while the toggle is ON, not just a display figure.
export const standingMode = writable<BetMode>('base')
