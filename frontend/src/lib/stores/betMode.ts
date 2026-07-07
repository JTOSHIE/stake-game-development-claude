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
// unchanged. `selectedBetMode` IS correctly threaded through for buy tiers
// (handleBuy sets it before every buy spin) - see the Wiring Integrity Audit
// (reports/qa/wiring_integrity_audit_2026-07-07.md) for the standingMode gap
// below, which is NOT yet wired the same way.
export type BetMode = 'base' | 'bonus' | 'cruise' | 'antelite' | 'super'

export const selectedBetMode = writable<BetMode>('base')

// Selected standing (base) mode. WARNING (Wiring Integrity Audit finding,
// 2026-07-07): FeatureMenu.svelte's selectStanding()/toggleEnhancer() write
// this store, and the UI shows an ACTIVE/ON badge reflecting it, but
// App.svelte's handleSpin() does NOT read it - every normal spin hardcodes
// mode 'base' regardless of this store's value. Selecting Cruise or toggling
// OVERBOOST currently changes the FEATURES menu's own display state only; it
// has zero effect on the actual spin request/cost. See the audit report
// (reports/qa/wiring_integrity_audit_2026-07-07.md) before assuming this is
// wired - it is flagged there, not fixed, pending an explicit go-ahead.
export const standingMode = writable<BetMode>('base')
