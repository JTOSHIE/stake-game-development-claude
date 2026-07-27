// betSelector.test.ts - the denomination picker's model (owner's order, 2026-07-28).
//
// The panel's whole safety property is that it can only ever express a value
// the platform already authorised. That property lives in `setBetLevel()` and
// in `activeBetLevels`, not in the markup, so it is tested here rather than in
// a browser.
//
// THE LADDER IS DELIBERATELY UNUSUAL. A USD-shaped ladder would pass almost any
// implementation, including a hardcoded one, which is exactly how R5/TR-013
// shipped: the arrows drove a hardcoded `BET_LEVELS` and nobody noticed until a
// non-USD ladder made `indexOf` return -1. These cases use a ladder that shares
// no value with the built-in one, has an irregular (non-doubling) progression,
// and is three orders of magnitude larger.
//
// Run (from frontend/): npx tsx src/lib/stores/betSelector.test.ts

import { get } from 'svelte/store'
import { betAmount, balance, BET_LEVELS } from './gameStore'
import { rgsBetLevels } from './rgsBetLevels'
import { activeBetLevels, setBetLevel, snapBetToLadder } from './betLadder'

let failures = 0
function check(name: string, actual: unknown, expected: unknown): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) {
    failures++
    console.error(`  FAIL ${name}\n    expected ${JSON.stringify(expected)}\n    actual   ${JSON.stringify(actual)}`)
  } else {
    console.log(`  ok   ${name}`)
  }
}

// An authenticate ladder that is nothing like ours: irregular steps, a currency
// three orders of magnitude larger, and not one value in common with BET_LEVELS.
const ODD_LADDER = [250, 750, 1500, 3000, 7500, 12_500, 40_000, 90_000]

console.log('\nTHE PANEL IS DRIVEN BY THE AUTHENTICATE LADDER, NOT BY OURS')
rgsBetLevels.set(ODD_LADDER)
balance.set(10_000_000)

check('the active ladder IS the authenticated one', get(activeBetLevels), ODD_LADDER)
check('and shares no value with the built-in ladder',
  ODD_LADDER.filter((l) => BET_LEVELS.includes(l)), [])
check('the panel would render one button per authorised level',
  get(activeBetLevels).length, ODD_LADDER.length)

console.log('\nONE TAP REACHES ANY LEVEL, WHICH IS THE POINT OF THE PANEL')
betAmount.set(ODD_LADDER[0])
check('starting at the minimum', get(betAmount), 250)
check('one tap to the MAXIMUM returns true', setBetLevel(90_000), true)
check('and the bet is the maximum, with no intermediate steps', get(betAmount), 90_000)
check('one tap back to the MINIMUM', setBetLevel(250), true)
check('lands exactly on it', get(betAmount), 250)
check('a middle level is reachable directly', setBetLevel(7_500), true)
check('and lands exactly', get(betAmount), 7_500)

console.log('\nMINSTEP HOLDS BY CONSTRUCTION: NOTHING OFF THE LADDER CAN BE SET')
// The three shapes an off-ladder value actually takes in this codebase: a value
// from OUR ladder, a value BETWEEN two authorised levels, and a rounded one.
check('a value from the built-in ladder is REFUSED', setBetLevel(1.0), false)
check('the bet did not move', get(betAmount), 7_500)
check('a value BETWEEN two authorised levels is REFUSED', setBetLevel(5_000), false)
check('the bet did not move', get(betAmount), 7_500)
check('a near-miss on an authorised level is REFUSED', setBetLevel(7_499), false)
check('the bet did not move', get(betAmount), 7_500)
check('zero is REFUSED', setBetLevel(0), false)
check('a negative is REFUSED', setBetLevel(-250), false)
check('the bet is still exactly where the player put it', get(betAmount), 7_500)

console.log('\nRE-SELECTING THE CURRENT LEVEL IS A NO-OP, SO THE PANEL CANNOT CHURN THE STORE')
check('selecting the level already set returns false', setBetLevel(7_500), false)
check('and the bet is unchanged', get(betAmount), 7_500)

console.log('\nAN UNAFFORDABLE LEVEL IS STILL SELECTABLE, AND THAT IS DELIBERATE')
// The `+` arrow refuses to climb past the balance, because holding a key should
// not walk a player into an unaffordable bet. Picking a specific number out of
// a list is a different act; the panel dims it and `canSpin` refuses the spin.
balance.set(1_000)
check('balance is below the top of the ladder', get(balance) < 90_000, true)
check('the top level can still be chosen', setBetLevel(90_000), true)
check('and it is set, for canSpin to refuse rather than the panel to hide',
  get(betAmount), 90_000)

console.log('\nA SHORT LADDER STILL WORKS, SINCE A JURISDICTION MAY SEND ONE')
const TINY = [5, 10]
rgsBetLevels.set(TINY)
balance.set(1_000)
betAmount.set(5)
check('two levels is a legal ladder', get(activeBetLevels), TINY)
check('min to max is one tap', setBetLevel(10), true)
check('and lands', get(betAmount), 10)
check('a value from the PREVIOUS ladder is refused once the ladder changes',
  setBetLevel(7_500), false)
check('the bet is unchanged', get(betAmount), 10)

console.log('\nTHE MOCK AND DEV FALLBACK IS THE BUILT-IN LADDER, NOT AN EMPTY PANEL')
rgsBetLevels.set([])
check('with no RGS ladder the active ladder falls back', get(activeBetLevels), BET_LEVELS)
betAmount.set(BET_LEVELS[0])
check('and a built-in level is selectable again', setBetLevel(BET_LEVELS[2]), true)
check('landing on it', get(betAmount), BET_LEVELS[2])

console.log('\nTHE SNAP STILL OWNS THE OFF-LADDER CASE, WHICH THE PANEL DOES NOT DUPLICATE')
rgsBetLevels.set(ODD_LADDER)
betAmount.set(6_000)   // off ladder, as it would be the moment a new ladder lands
check('an off-ladder bet is detected', get(activeBetLevels).includes(6_000), false)
check('snapping moves it', snapBetToLadder(), true)
check('onto the nearest authorised level', get(betAmount), 7_500)

console.log('')
if (failures > 0) {
  console.error(`BET SELECTOR MODEL: FAIL (${failures})`)
  process.exit(1)
}
console.log('BET SELECTOR MODEL: PASS (the panel can only ever express an authorised level)')
process.exit(0)
