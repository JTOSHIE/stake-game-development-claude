// betLadder.ts - the single bet-changing model, driven by the AUTHENTICATED
// bet levels. Non-locked. (R5 / TR-013, 2026-07-25)
//
// WHY THIS EXISTS
//
// Two surfaces changed the bet and they did not agree.
//
//   - HudOverlay.svelte drove from `rgsBetLevels` (what the RGS authenticate
//     response actually returned) with the hardcoded ladder as fallback. Right.
//   - FeatureMenu.svelte imported increaseBet/decreaseBet/canIncreaseBet from
//     gameStore.ts, which operate on the hardcoded `BET_LEVELS` array only.
//     Wrong whenever the platform's ladder differs from ours, which is the
//     normal case for any currency that is not USD-shaped: a JPY or KRW ladder
//     is three orders of magnitude larger, and jurisdictions carry their own.
//
// THE FAILURE, BY CALCULATION RATHER THAN BY MEASUREMENT
//
// With a bet the RGS supplied that is not in the hardcoded array,
// `BET_LEVELS.indexOf($bet)` is -1. gameStore.increaseBet then evaluates
// `idx < BET_LEVELS.length - 1` as `-1 < 9`, true, and returns
// `BET_LEVELS[idx + 1]`, which is `BET_LEVELS[0]`, 0.10. So pressing "+" in the
// FEATURES menu did not raise the bet, it DROPPED it to the minimum. Pressing
// "-" hit `idx > 0`, false, and silently did nothing. `canIncreaseBet` returned
// true throughout, so the control was enabled and the player could reach it.
//
// gameStore.ts is locked, so the fix cannot go there. This module is the shared
// non-locked model both surfaces now use, which also removes the duplicated
// ladder logic that let the two drift apart in the first place. The now-unused
// gameStore bet actions are recorded in CLAUDE.md's LOCKED_FILE_DEBTS.

import { derived, get } from 'svelte/store'
import { betAmount, balance, BET_LEVELS } from './gameStore'
import { rgsBetLevels } from './rgsBetLevels'

/**
 * The ladder in force: what the platform authenticated us with, or the built-in
 * ladder when the RGS supplied none (mock and dev runs). Never a third source.
 */
export const activeBetLevels = derived(rgsBetLevels, ($levels) =>
  $levels.length > 0 ? $levels : BET_LEVELS,
)

/** Closest ladder level to an arbitrary value, used to snap an off-ladder bet. */
export function nearestLevel(levels: number[], value: number): number {
  return levels.reduce(
    (best, lvl) => (Math.abs(lvl - value) < Math.abs(best - value) ? lvl : best),
    levels[0],
  )
}

/**
 * Index of the current bet on the active ladder, or -1 when the bet is off
 * ladder. Every guard below requires `> -1` precisely so the off-ladder case
 * cannot fall through into an arithmetic accident, which is the defect above.
 */
export const betLevelIndex = derived(
  [activeBetLevels, betAmount],
  ([$levels, $bet]) => $levels.indexOf($bet),
)

export const canIncreaseBetLevel = derived(
  [activeBetLevels, betLevelIndex, balance],
  ([$levels, $idx, $bal]) => $idx > -1 && $idx < $levels.length - 1 && $levels[$idx + 1] <= $bal,
)

export const canDecreaseBetLevel = derived(betLevelIndex, ($idx) => $idx > 0)

/** Highest affordable level, matching the affordability guard the + arrow uses. */
export const maxAffordableLevel = derived(
  [activeBetLevels, balance],
  ([$levels, $bal]) => {
    const affordable = $levels.filter((l) => l <= $bal)
    return affordable.length ? affordable[affordable.length - 1] : $levels[0]
  },
)

export const canSetMaxBetLevel = derived(
  [betLevelIndex, betAmount, maxAffordableLevel],
  ([$idx, $bet, $max]) => $idx > -1 && $bet !== $max,
)

export function increaseBetLevel(): void {
  const levels = get(activeBetLevels)
  const bal = get(balance)
  const idx = levels.indexOf(get(betAmount))
  if (idx > -1 && idx < levels.length - 1 && levels[idx + 1] <= bal) {
    betAmount.set(levels[idx + 1])
  }
}

export function decreaseBetLevel(): void {
  const levels = get(activeBetLevels)
  const idx = levels.indexOf(get(betAmount))
  if (idx > 0) betAmount.set(levels[idx - 1])
}

export function setMaxBetLevel(): void {
  const max = get(maxAffordableLevel)
  if (get(betAmount) !== max) betAmount.set(max)
}

/**
 * Set the bet to a level the player picked out of the denomination panel.
 *
 * THE ONLY WAY A LEVEL CAN BE SET DIRECTLY, and it refuses anything that is not
 * ON the active ladder. That refusal is what makes the platform's `minStep`
 * hold without this module ever reading `minStep`: every value the panel can
 * offer came out of `activeBetLevels`, which is the authenticate response's own
 * `betLevels` (or the built-in ladder in mock and dev), so a selection is by
 * construction a value the platform authorised. Nothing here synthesises an
 * amount, rounds one, or interpolates between two levels, which are the three
 * ways a stepper normally produces an off-ladder bet.
 *
 * Affordability is deliberately NOT enforced here. The `+` arrow refuses to
 * climb past what the balance covers, because holding a key should not walk a
 * player into an unaffordable bet by accident; picking a specific number out of
 * a list is a different act, and a player who selects one they cannot currently
 * afford should see the SPIN button disabled rather than have the panel
 * silently substitute a smaller figure. `canSpin` already handles that.
 *
 * Returns true when it moved the bet.
 */
export function setBetLevel(level: number): boolean {
  const levels = get(activeBetLevels)
  if (!levels.includes(level)) return false
  if (get(betAmount) === level) return false
  betAmount.set(level)
  return true
}

/**
 * Snap an off-ladder bet onto the active ladder. Called once when the ladder
 * arrives from the RGS, so the player never sits on an amount the platform did
 * not authorise. Returns true when it moved the bet.
 */
export function snapBetToLadder(): boolean {
  const levels = get(activeBetLevels)
  const bet = get(betAmount)
  if (levels.length === 0 || levels.includes(bet)) return false
  betAmount.set(nearestLevel(levels, bet))
  return true
}
