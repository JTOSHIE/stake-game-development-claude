// modalGuard.test.ts + buyAffordability - R8 / TR-016 (2026-07-25).
// Run (from frontend/): npx tsx src/lib/stores/modalGuard.test.ts

import { get } from 'svelte/store'
import { setModalOpen, anyModalOpen, openModalIds, resetModalGuard } from './modalGuard.ts'
import { canAffordMode, shortfallFor, modeCostFor, canAffordSpin } from './buyAffordability.ts'
import { standingMode } from './betMode.ts'
import { balance, betAmount, isSpinning, isLoading } from './gameStore.ts'

let failures = 0
function check(name: string, actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) === JSON.stringify(expected)) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}\n    expected ${JSON.stringify(expected)}\n    actual   ${JSON.stringify(actual)}`) }
}

console.log('\nMODAL GUARD')
resetModalGuard()
check('nothing open at rest', get(anyModalOpen), false)

setModalOpen('buy-confirm', true)
check('one surface opens the guard', get(anyModalOpen), true)
check('the open id is reported', get(openModalIds), ['buy-confirm'])

// Independence matters: closing one surface must not unblock while another is open.
setModalOpen('reality-check', true)
check('two surfaces tracked independently', get(openModalIds), ['buy-confirm', 'reality-check'])
setModalOpen('buy-confirm', false)
check('closing one leaves the other blocking', get(anyModalOpen), true)
check('only the remaining id is reported', get(openModalIds), ['reality-check'])
setModalOpen('reality-check', false)
check('closing the last one clears the guard', get(anyModalOpen), false)

// Reactive statements re-run with unchanged values; that must be free and safe.
setModalOpen('feature-menu', true)
setModalOpen('feature-menu', true)
setModalOpen('feature-menu', false)
check('repeat opens do not leak a registration', get(anyModalOpen), false)
setModalOpen('never-opened', false)
check('closing something never opened is harmless', get(anyModalOpen), false)

console.log('\nBUY AFFORDABILITY, per tier rather than a flat 100x')
resetModalGuard()
isSpinning.set(false)
isLoading.set(false)
betAmount.set(1.00)

check('bonus costs 100x', modeCostFor('bonus'), 100)
check('super costs 400x', modeCostFor('super'), 400)

// THE SHIPPED DEFECT: gameStore.canBuyBonus is `bal >= bet * 100` for EVERY
// tier. At balance 150 and bet 1.00 it returned true, so the confirm button was
// enabled beside a correctly displayed 400.00 price.
balance.set(150)
check('the old flat gate would have said yes to super', 150 >= 1.00 * 100, true)
check('per-tier gate correctly refuses super at 150', get(canAffordMode)('super'), false)
check('per-tier gate still allows bonus at 150', get(canAffordMode)('bonus'), true)
check('shortfall for super is reported', get(shortfallFor)('super'), 250)
check('no shortfall for an affordable tier', get(shortfallFor)('bonus'), 0)

balance.set(400)
check('super becomes affordable at exactly its price', get(canAffordMode)('super'), true)
check('shortfall clears at exactly the price', get(shortfallFor)('super'), 0)

balance.set(399.99)
check('one cent short is refused', get(canAffordMode)('super'), false)

// The bet multiplies the price, so the ladder moves affordability too.
balance.set(400)
betAmount.set(2.00)
check('doubling the bet doubles the price and refuses', get(canAffordMode)('super'), false)
check('shortfall tracks the bet', get(shortfallFor)('super'), 400)

// The other conditions canBuyBonus intended are preserved.
betAmount.set(1.00)
balance.set(1000)
isSpinning.set(true)
check('never affordable mid-spin', get(canAffordMode)('super'), false)
isSpinning.set(false)
isLoading.set(true)
check('never affordable while loading', get(canAffordMode)('super'), false)
isLoading.set(false)
check('affordable again once idle', get(canAffordMode)('super'), true)

// C-spin-afford / C-afford-float, stand-back 2026-08-15. OVERBOOST is 1.25x.
// Locked canSpin would return true at 1.10 / bet 1.00; the debit is 1.25.
standingMode.set('antelite')
balance.set(1.10)
betAmount.set(1.00)
isSpinning.set(false)
isLoading.set(false)
check('OVERBOOST at 1.10 with bet 1.00 is not affordable', get(canAffordMode)('antelite'), false)
check('and canAffordSpin agrees with that debit', get(canAffordSpin), false)
balance.set(1.25)
check('OVERBOOST at exactly 1.25 is affordable', get(canAffordMode)('antelite'), true)
check('and canAffordSpin is true at exact price', get(canAffordSpin), true)
standingMode.set('base')
balance.set(1.00)
check('base spin at 1.00 / bet 1.00 stays affordable', get(canAffordSpin), true)

if (failures) { console.error(`\nMODAL GUARD + AFFORDABILITY: FAIL (${failures})`); process.exit(1) }
console.log('\nMODAL GUARD + AFFORDABILITY: PASS')
