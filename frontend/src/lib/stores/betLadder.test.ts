// betLadder.test.ts - R5 / TR-013 (2026-07-25).
//
// Proves the defect that was shipped, and proves it is fixed. The first two
// cases reproduce the old gameStore behaviour arithmetically against the
// hardcoded ladder, so the regression is documented as a calculation rather
// than as a recollection.
//
// Run (from frontend/): npx tsx src/lib/stores/betLadder.test.ts

import { get } from 'svelte/store'
import { betAmount, balance, BET_LEVELS } from './gameStore'
import { rgsBetLevels } from './rgsBetLevels'
import { rgsBetConfig } from './rgsBetConfig'
import {
  activeBetLevels, betLevelIndex, canIncreaseBetLevel, canDecreaseBetLevel,
  canSetMaxBetLevel, maxAffordableLevel, increaseBetLevel, decreaseBetLevel,
  setMaxBetLevel, snapBetToLadder, nearestLevel,
} from './betLadder'

let failures = 0
function check(name: string, actual: unknown, expected: unknown): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) { failures++; console.error(`  FAIL ${name}\n    expected ${JSON.stringify(expected)}\n    actual   ${JSON.stringify(actual)}`) }
  else console.log(`  ok   ${name}`)
}

// A realistic non-USD-shaped ladder, the case the hardcoded array cannot serve.
const JPY_LADDER = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]

console.log('\nTHE SHIPPED DEFECT, reproduced arithmetically against the hardcoded ladder')
{
  // gameStore.increaseBet: idx = BET_LEVELS.indexOf(bet); if (idx < len-1 && BET_LEVELS[idx+1] <= bal) return BET_LEVELS[idx+1]
  const offLadderBet = 1000
  const idx = BET_LEVELS.indexOf(offLadderBet)
  check('an RGS bet is absent from the hardcoded ladder', idx, -1)
  // -1 < 9 is true, and BET_LEVELS[-1 + 1] is BET_LEVELS[0]
  const whatPlusWouldHaveDone = idx < BET_LEVELS.length - 1 ? BET_LEVELS[idx + 1] : offLadderBet
  check('"+" DROPPED the bet to the ladder minimum', whatPlusWouldHaveDone, 0.10)
  const whatMinusWouldHaveDone = idx > 0 ? BET_LEVELS[idx - 1] : offLadderBet
  check('"-" silently did nothing', whatMinusWouldHaveDone, offLadderBet)
}

console.log('\nFIXED: the shared model drives from the authenticated ladder')
rgsBetLevels.set(JPY_LADDER)
balance.set(1_000_000)

check('active ladder is the authenticated one', get(activeBetLevels), JPY_LADDER)

betAmount.set(1000)
check('index resolves on the authenticated ladder', get(betLevelIndex), 3)
increaseBetLevel()
check('"+" moves UP one authenticated level', get(betAmount), 2000)
decreaseBetLevel()
check('"-" moves back down one level', get(betAmount), 1000)

// Boundaries.
betAmount.set(JPY_LADDER[0])
check('cannot decrease below the floor', get(canDecreaseBetLevel), false)
decreaseBetLevel()
check('floor bet is unchanged by "-"', get(betAmount), JPY_LADDER[0])

betAmount.set(100000)
check('cannot increase above the ceiling', get(canIncreaseBetLevel), false)
increaseBetLevel()
check('ceiling bet is unchanged by "+"', get(betAmount), 100000)

// Affordability, the same guard the arrow uses.
balance.set(3000)
betAmount.set(2000)
check('max affordable level respects balance', get(maxAffordableLevel), 2000)
check('cannot increase beyond what balance covers', get(canIncreaseBetLevel), false)
check('already at max, so MAX is a no-op', get(canSetMaxBetLevel), false)
balance.set(60000)
check('MAX becomes available as balance rises', get(canSetMaxBetLevel), true)
setMaxBetLevel()
check('MAX picks the highest affordable level', get(betAmount), 50000)

// Off-ladder snap.
betAmount.set(1234)
check('off-ladder bet has index -1', get(betLevelIndex), -1)
check('every guard refuses to act off ladder', [get(canIncreaseBetLevel), get(canDecreaseBetLevel), get(canSetMaxBetLevel)], [false, false, false])
check('snap reports that it moved the bet', snapBetToLadder(), true)
check('snap lands on the nearest authenticated level', get(betAmount), 1000)
check('snap is idempotent', snapBetToLadder(), false)

check('nearestLevel picks the closest, not the lower', nearestLevel(JPY_LADDER, 1600), 2000)

console.log('\nFALLBACK: no authenticated ladder means the built-in one')
rgsBetLevels.set([])
check('falls back to BET_LEVELS', get(activeBetLevels), BET_LEVELS)
balance.set(1000)
betAmount.set(1.00)
increaseBetLevel()
check('fallback ladder still steps correctly', get(betAmount), 2.00)

// ---------------------------------------------------------------------------
// THE FALLBACK LADDER RESPECTS THE PLATFORM ENVELOPE, 2026-08-09.
//
// When the authenticate response omits betLevels, the built-in ladder stands in.
// It is OUR ladder, and the platform may still have declared minBet/maxBet.
// Measured against a stubbed platform sending minBet 20 with no betLevels: seven
// of the ten fallback rungs were below the minimum, selectable, and the real
// play() put an amount on the wire under the platform's own declared floor.
{
  rgsBetLevels.set([])
  rgsBetConfig.set({ minBet: 20, maxBet: 2000, stepBet: 20, defaultBetLevel: 100 })
  const levels = get(activeBetLevels)
  check('no fallback rung sits below the platform minimum',
    levels.filter((l) => l < 20).length, 0)
  check('and none above the maximum', levels.filter((l) => l > 2000).length, 0)

  // NEGATIVE CONTROL 1. An authenticated ladder is used verbatim and is NEVER
  // filtered: the platform's own levels are authoritative even if they look odd.
  rgsBetLevels.set([0.01, 5000])
  check('an authenticated ladder is never filtered', get(activeBetLevels).length, 2)

  // NEGATIVE CONTROL 2. No envelope declared means no filtering.
  rgsBetLevels.set([])
  rgsBetConfig.set({ minBet: 0, maxBet: 0, stepBet: 0, defaultBetLevel: 0 })
  check('with no envelope the fallback is untouched', get(activeBetLevels), BET_LEVELS)

  // NEGATIVE CONTROL 3. An envelope that excludes everything must not leave the
  // player with NO selectable bet, which would be worse than the defect.
  rgsBetConfig.set({ minBet: 9e9, maxBet: 9e9, stepBet: 0, defaultBetLevel: 0 })
  check('an impossible envelope keeps the fallback rather than emptying it',
    get(activeBetLevels), BET_LEVELS)

  rgsBetLevels.set([])
  rgsBetConfig.set({ minBet: 0, maxBet: 0, stepBet: 0, defaultBetLevel: 0 })
}

if (failures) { console.error(`\nBET LADDER: FAIL (${failures})`); process.exit(1) }
console.log('\nBET LADDER: PASS')
