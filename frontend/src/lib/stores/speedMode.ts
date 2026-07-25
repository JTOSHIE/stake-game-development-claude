// speedMode.ts — non-locked speed-tier store layered on top of the existing
// (locked) gameStore.isTurbo boolean.
//
// LAYOUT_SPEC's "Speed tiers Normal, Turbo, Super Turbo" needs a third state
// that gameStore.ts cannot gain without a lock exception. speedTier is the
// source of truth for the TURBO control's three-way cycle; isTurbo (locked,
// already read everywhere reel timing is halved) is kept in sync so every
// existing turbo consumer keeps working unchanged. GameGrid additionally
// reads speedTier directly for the extra Super Turbo reduction.

import { writable, get } from 'svelte/store'
import { isTurbo } from './gameStore'
import { rgJurisdiction } from './responsibleGambling'

export type SpeedTier = 'normal' | 'turbo' | 'super'

export const speedTier = writable<SpeedTier>('normal')

const NEXT: Record<SpeedTier, SpeedTier> = {
  normal: 'turbo',
  turbo:  'super',
  super:  'normal',
}

/**
 * Force Normal speed. Used to enforce a jurisdiction turbo ban.
 * Keeps the locked `isTurbo` boolean in sync, as cycleSpeed does.
 */
export function forceNormalSpeed(): void {
  speedTier.set('normal')
  isTurbo.set(false)
}

/**
 * Cycle Normal -> Turbo -> Super Turbo -> Normal, keeping isTurbo in sync.
 *
 * R7/TR-015 (2026-07-25): `turboDisabled` had ZERO readers anywhere in the
 * codebase. The flag was derived correctly and then ignored, so in a market
 * that bans fast play the control still cycled and the round still ran at 2x or
 * 4x. Enforced here rather than only in the markup, so no future caller can
 * reach a banned speed by calling this directly.
 */
export function cycleSpeed(): void {
  if (get(rgJurisdiction).turboDisabled) {
    forceNormalSpeed()
    return
  }
  speedTier.update((tier) => {
    const next = NEXT[tier]
    isTurbo.set(next !== 'normal')
    return next
  })
}

// The flags arrive with the authenticate response, which can land AFTER the
// player has already selected Turbo. Without this, a ban that arrives late is
// never applied to the speed already chosen.
rgJurisdiction.subscribe(($j) => {
  if ($j.turboDisabled && get(speedTier) !== 'normal') forceNormalSpeed()
})
