// responsibleGambling.test.ts — compliance gate for the RG autoplay logic.
// Run: npx tsx src/lib/stores/responsibleGambling.test.ts
//
// Verifies the autoplay STOP CONDITIONS, the minimum-spin-interval enforcement,
// and session accounting - the pieces a regulator checks. Pure logic, no DOM.

import {
  autoplayLimits, defaultAutoplayLimits, autoplayShouldStop,
  rgSpinDelay, rgRecordSpin, rgResetSession, rgNetMicros, rgJurisdiction,
  rgAllowedAutoplayCounts, rgClampAutoplayCount, rgInfiniteAutoplayAllowed,
} from './responsibleGambling.ts'
import { speedTier, cycleSpeed, forceNormalSpeed } from './speedMode.ts'
import { isTurbo } from './gameStore.ts'
import { jurisdictionFlags } from './jurisdiction.ts'
import { get } from 'svelte/store'

const M = 1_000_000 // one currency unit in micros
let pass = 0
const fail: string[] = []
function check(name: string, cond: boolean) {
  if (cond) pass++
  else fail.push(name)
}

// --- stop on any win ---
rgResetSession()
autoplayLimits.set({ ...defaultAutoplayLimits, stopOnFeature: false, stopOnAnyWin: true })
check('stopOnAnyWin: stops on a win', autoplayShouldStop({ winMicros: 5 * M, betMicros: M, triggered: false }).stop === true)
check('stopOnAnyWin: continues on a loss', autoplayShouldStop({ winMicros: 0, betMicros: M, triggered: false }).stop === false)

// --- single win limit (x total bet) ---
autoplayLimits.set({ ...defaultAutoplayLimits, stopOnFeature: false, singleWinLimitMult: 20 })
check('singleWinLimit: stops at >= 20x', autoplayShouldStop({ winMicros: 20 * M, betMicros: M, triggered: false }).stop === true)
check('singleWinLimit: continues below 20x', autoplayShouldStop({ winMicros: 19 * M, betMicros: M, triggered: false }).stop === false)

// --- stop on feature ---
autoplayLimits.set({ ...defaultAutoplayLimits, stopOnFeature: true })
check('stopOnFeature: stops when triggered', autoplayShouldStop({ winMicros: 0, betMicros: M, triggered: true }).stop === true)
check('stopOnFeature: continues when not', autoplayShouldStop({ winMicros: 0, betMicros: M, triggered: false }).stop === false)

// --- loss limit (session net) ---
rgResetSession()
autoplayLimits.set({ ...defaultAutoplayLimits, stopOnFeature: false, lossLimitMicros: 10 * M })
rgRecordSpin(6 * M, 0) // -6
rgRecordSpin(6 * M, 0) // -12  -> past the 10 limit
check('lossLimit: net is -12', get(rgNetMicros) === -12 * M)
check('lossLimit: stops once loss >= 10', autoplayShouldStop({ winMicros: 0, betMicros: M, triggered: false }).stop === true)

// --- session accounting ---
rgResetSession()
rgRecordSpin(2 * M, 5 * M) // wager 2, win 5 -> net +3
check('session: net +3 after a winning spin', get(rgNetMicros) === 3 * M)

// --- minimum spin interval ---
jurisdictionFlags.set({ minSpinMs: 2500 })
check('minSpin: raises a short delay to 2500', rgSpinDelay(800) === 2500)
check('minSpin: leaves a longer delay alone', rgSpinDelay(6000) === 6000)
jurisdictionFlags.set({}) // no min -> passthrough
check('minSpin: no floor when unset', rgSpinDelay(800) === 800)

// --- Wiring Integrity Audit, item 3(i): the platform manual has no general
// minimum spin interval (only UKGC-specific jurisdictions do), so Stake
// sessions with no jurisdiction data must see a literal 0ms floor - not just
// "whatever delay was requested happens to pass through unchanged" (the check
// above), but the resolved floor value itself must be exactly 0. ---
jurisdictionFlags.set({}) // default, permissive state (no authenticate jurisdiction data)
check('minSpin: resolves to a literal 0ms floor with no jurisdiction data (native game feel, no platform-wide floor)', get(rgJurisdiction).minSpinMs === 0)
jurisdictionFlags.set({ minSpinMs: 2500 })
check('minSpin: floor only ever raises above 0 when a jurisdiction flag explicitly sets it (UKGC-style)', get(rgJurisdiction).minSpinMs === 2500)
jurisdictionFlags.set({})

// --- R7/TR-015: jurisdiction ENFORCEMENT, not just derivation --------------
// Every flag below was derived correctly before this pass and then ignored by
// every consumer. These assertions exist because "the store has the right
// value" is not the compliance claim; "the player cannot do the banned thing"
// is.

const AUTO_OPTIONS = [10, 25, 50, 100]

// Uncapped market: everything on offer, including infinite.
jurisdictionFlags.set({})
check('uncapped: all autoplay counts offered', JSON.stringify(rgAllowedAutoplayCounts(AUTO_OPTIONS)) === JSON.stringify(AUTO_OPTIONS))
check('uncapped: infinite autoplay allowed', get(rgInfiniteAutoplayAllowed) === true)
check('uncapped: count is not clamped', rgClampAutoplayCount(100) === 100)

// Capped market: options above the cap must not be offered OR startable.
jurisdictionFlags.set({ maxAutoplaySpins: 25 })
check('capped at 25: only 10 and 25 offered', JSON.stringify(rgAllowedAutoplayCounts(AUTO_OPTIONS)) === JSON.stringify([10, 25]))
check('capped at 25: infinite is withdrawn', get(rgInfiniteAutoplayAllowed) === false)
check('capped at 25: a request for 100 clamps to 25', rgClampAutoplayCount(100) === 25)
check('capped at 25: a legal request is untouched', rgClampAutoplayCount(10) === 10)

// A cap below every offered option must still leave autoplay reachable.
jurisdictionFlags.set({ maxAutoplaySpins: 5 })
check('cap below every option: the cap itself is offered', JSON.stringify(rgAllowedAutoplayCounts(AUTO_OPTIONS)) === JSON.stringify([5]))
check('cap below every option: request clamps to the cap', rgClampAutoplayCount(10) === 5)

// Turbo ban. Previously turboDisabled had ZERO readers: the flag was correct
// and the control cycled anyway.
jurisdictionFlags.set({})
forceNormalSpeed()
cycleSpeed()
check('no ban: speed cycles to turbo', get(speedTier) === 'turbo')
check('no ban: locked isTurbo stays in sync', get(isTurbo) === true)

jurisdictionFlags.set({ disabledTurbo: true })
check('explicit ban: flag derives', get(rgJurisdiction).turboDisabled === true)
check('explicit ban: a late-arriving ban resets the speed already chosen', get(speedTier) === 'normal')
check('explicit ban: locked isTurbo reset too', get(isTurbo) === false)
cycleSpeed()
check('explicit ban: cycleSpeed cannot reach turbo', get(speedTier) === 'normal')

// A minimum spin duration implies the fast-play ban.
jurisdictionFlags.set({ minSpinMs: 2500 })
check('minSpinMs implies turboDisabled', get(rgJurisdiction).turboDisabled === true)
cycleSpeed()
check('minSpinMs: speed stays normal', get(speedTier) === 'normal')
check('minSpinMs: autoplay delay is raised to the minimum', rgSpinDelay(300) === 2500)
check('minSpinMs: a longer delay is left alone', rgSpinDelay(4000) === 4000)

jurisdictionFlags.set({})

console.log('='.repeat(64))
console.log('RESPONSIBLE GAMBLING: autoplay stop-conditions + limits + enforcement')
console.log('='.repeat(64))
console.log(`checks passed: ${pass}`)
if (fail.length) {
  console.log('\nFAILURES:')
  for (const f of fail) console.log('  - ' + f)
  console.log('\nRG LOGIC: FAIL')
  process.exit(1)
}
console.log('\nRG LOGIC: PASS')
