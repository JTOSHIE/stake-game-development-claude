// responsibleGambling.test.ts — compliance gate for the RG autoplay logic.
// Run: npx tsx src/lib/stores/responsibleGambling.test.ts
//
// Verifies the autoplay STOP CONDITIONS, the minimum-spin-interval enforcement,
// and session accounting - the pieces a regulator checks. Pure logic, no DOM.

import {
  autoplayLimits, defaultAutoplayLimits, autoplayShouldStop,
  rgSpinDelay, rgRecordSpin, rgResetSession, rgNetMicros,
} from './responsibleGambling.ts'
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

console.log('='.repeat(64))
console.log('RESPONSIBLE GAMBLING: autoplay stop-conditions + limits')
console.log('='.repeat(64))
console.log(`checks passed: ${pass}`)
if (fail.length) {
  console.log('\nFAILURES:')
  for (const f of fail) console.log('  - ' + f)
  console.log('\nRG LOGIC: FAIL')
  process.exit(1)
}
console.log('\nRG LOGIC: PASS')
