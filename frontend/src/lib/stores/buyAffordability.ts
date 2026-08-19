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
import { CURRENCY_SCALE } from '../utils/currency'
import { standingMode, type BetMode } from './betMode'

/** Cost multiplier for a buy tier, from the single source of truth. */
export function modeCostFor(mode: BetMode): number {
  return MODE_COST[mode] ?? 100
}

/**
 * What one round in `mode` actually costs, in INTEGER MICROS.
 *
 * Added JOB 3(f) / TR-068 (2026-07-26). The ruling requires the new FEATURE
 * PRICE line on a bought round's result banner to be "driven by the same
 * integer-micros cost source as the confirm dialog", and the only way to make
 * that literally true rather than merely intended is for there to be one
 * source. This expression previously existed five times over: in
 * `BuyBonus.svelte`, in `App.handleBuy`, in `App.handleSpin`, in
 * `HudOverlay`'s effective-cost readout and in `FeatureMenu`'s current-spin
 * cost. Five copies of a money calculation is five chances for a price the
 * player is quoted to disagree with the price they are charged, which is
 * precisely the class of defect TR-016 found in the affordability gate and the
 * reason this module exists at all.
 *
 * CLAUDE.md's integer-micros rule, verbatim: "All currency maths uses integer
 * micros. Never multiply dollars by a multiplier directly." The rounding
 * happens once, here, against the scaled value, so a bet of 0.10 at 400x cannot
 * land a hair off 40.00 in one caller and exactly on it in another.
 *
 * The default multiplier is 1 rather than 100: this function answers "what does
 * a round in this mode cost", and an unrecognised mode is a base spin, not a
 * bonus buy. Callers that specifically want a BUY tier's price pass a buy mode.
 */
export function spinCostMicros(betDisplay: number, mode: BetMode): number {
  return Math.round(betDisplay * (MODE_COST[mode] ?? 1) * CURRENCY_SCALE)
}

function balanceCovers(balDisplay: number, betDisplay: number, mode: BetMode): boolean {
  return Math.round(balDisplay * CURRENCY_SCALE) >= spinCostMicros(betDisplay, mode)
}

/**
 * Whether THIS tier is affordable and startable right now. Mirrors the
 * conditions gameStore.canBuyBonus intended (balance, not spinning, not
 * loading), but against the tier's real cost in integer micros, the same
 * figure handleSpin debits. A display-dollar multiply here previously
 * disagreed with spinCostMicros on the same module.
 */
export const canAffordMode = derived(
  [balance, betAmount, isSpinning, isLoading],
  ([$bal, $bet, $spinning, $loading]) =>
    (mode: BetMode): boolean =>
      balanceCovers($bal, $bet, mode) && !$spinning && !$loading,
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
    (mode: BetMode): number => {
      const shortfallMicros = spinCostMicros($bet, mode) - Math.round($bal * CURRENCY_SCALE)
      return Math.max(0, shortfallMicros / CURRENCY_SCALE)
    },
)

/**
 * Whether the current standing mode's next spin is affordable.
 *
 * gameStore.canSpin is locked at `$bal >= $bet` (1x). handleSpin debits
 * spinCostMicros, so OVERBOOST at 1.25x could leave the SPIN button enabled
 * and then no-op. This is the non-locked gate the button and the spacebar
 * both read, the same pattern TR-016 used for buy tiers.
 */
export const canAffordSpin = derived(
  [balance, betAmount, isSpinning, isLoading, standingMode],
  ([$bal, $bet, $spinning, $loading, $mode]) =>
    balanceCovers($bal, $bet, $mode) && !$spinning && !$loading,
)
