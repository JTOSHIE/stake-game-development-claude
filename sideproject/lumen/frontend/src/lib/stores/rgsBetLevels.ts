// rgsBetLevels.ts — non-locked store for RGS-provided bet levels.
//
// The locked rgsService.initRGS() fetches the bet levels from the wallet
// authenticate response but does not retain them. Per the owner-sanctioned
// passthrough (FS_BetLevels_Blocked.md, Option A), initRGS now writes the
// already-fetched levels here so non-locked components can consume them.
//
// Shape: number[] of bet amounts in display currency units (dollars), the
// same shape and units as BET_LEVELS in gameStore. rgsService already converts
// the raw micros values to display units via microsToDisplay before the values
// reach this store, so no further mapping is required by consumers.
//
// Empty array means "no RGS levels available" (mock/dev mode or auth failure),
// in which case consumers fall back to the built-in BET_LEVELS defaults.

import { writable } from 'svelte/store'

export const rgsBetLevels = writable<number[]>([])
