// speedMode.ts — non-locked speed-tier store layered on top of the existing
// (locked) gameStore.isTurbo boolean.
//
// LAYOUT_SPEC's "Speed tiers Normal, Turbo, Super Turbo" needs a third state
// that gameStore.ts cannot gain without a lock exception. speedTier is the
// source of truth for the TURBO control's three-way cycle; isTurbo (locked,
// already read everywhere reel timing is halved) is kept in sync so every
// existing turbo consumer keeps working unchanged. GameGrid additionally
// reads speedTier directly for the extra Super Turbo reduction.

import { writable } from 'svelte/store'
import { isTurbo } from './gameStore'

export type SpeedTier = 'normal' | 'turbo' | 'super'

export const speedTier = writable<SpeedTier>('normal')

const NEXT: Record<SpeedTier, SpeedTier> = {
  normal: 'turbo',
  turbo:  'super',
  super:  'normal',
}

/** Cycle Normal -> Turbo -> Super Turbo -> Normal, keeping isTurbo in sync. */
export function cycleSpeed(): void {
  speedTier.update((tier) => {
    const next = NEXT[tier]
    isTurbo.set(next !== 'normal')
    return next
  })
}
