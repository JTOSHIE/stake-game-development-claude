// buyAffordability.ts - per-tier buy affordability, non-locked. (R8/TR-016)
//
// THE DEFECT
//
// gameStore.ts's `canBuyBonus` is hardcoded to `$bal >= $bet * 100`. That is the
// Buy Overdrive cost. NITRO OVERDRIVE costs 400x. So for the 400x tier the gate
// answered a question about a different, cheaper product:
//
//   bet 1.00, balance 150.00, tier super (400x, price 400.00)
//   canBuyBonus -> 150 >= 100 -> TRUE, and the CONFIRM button was enabled
//
// The modal displayed the correct 400.00 price beside a confirm button that had
// only checked whether the player could afford 100.00.
//
// Today the FEATURES menu's own `$balance < $betAmount * m.cost` guard blocks
// first, so the wrong gate is compensated and not reachable by a player. That is
// exactly how it was recorded in CLAUDE.md's LOCKED_FILE_DEBTS. But "unreachable
// because a different check happens to run first" is one refactor away from
// being reachable, and it is a money-path check, so it gets a correct
// implementation of its own rather than a comment.
//
// gameStore.ts is locked, so the fix cannot go there. This module is the single
// non-locked truth, used by BOTH the FEATURES menu card and the confirm dialog,
// so the two cannot disagree about whether a tier is affordable.

import { derived } from 'svelte/store'
import { balance, betAmount, isSpinning, isLoading } from './gameStore'
import { MODE_COST } from '../config/fsModes'
import type { BetMode } from './betMode'

/** Cost multiplier for a buy tier, from the single source of truth. */
export function modeCostFor(mode: BetMode): number {
  return MODE_COST[mode] ?? 100
}

/**
 * Whether THIS tier is affordable and startable right now. Mirrors the
 * conditions gameStore.canBuyBonus intended (balance, not spinning, not
 * loading), but against the tier's real cost.
 */
export const canAffordMode = derived(
  [balance, betAmount, isSpinning, isLoading],
  ([$bal, $bet, $spinning, $loading]) =>
    (mode: BetMode): boolean =>
      $bal >= $bet * modeCostFor(mode) && !$spinning && !$loading,
)

/**
 * How much more the player needs for this tier, in display units, or 0 when it
 * is already affordable. Lets the UI say WHY a tier is unavailable instead of
 * presenting a dead control, which is the owner's 2026-07-26 observation that
 * NITRO was "not always selectable" with no explanation.
 */
export const shortfallFor = derived(
  [balance, betAmount],
  ([$bal, $bet]) =>
    (mode: BetMode): number => Math.max(0, $bet * modeCostFor(mode) - $bal),
)
