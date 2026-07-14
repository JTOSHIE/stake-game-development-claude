// roundInterpreter.test.ts — exact-total gate over the curated sample rounds.
// Run: npx tsx src/lib/services/roundInterpreter.test.ts
//
// For every sample round, the sum of all presented win events, capped at the
// win cap, must equal the round payoutMultiplier EXACTLY (integer centibets,
// no float drift). A mismatch means the presentation would lie about the maths.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import {
  interpretRound,
  sumPresentedWins,
  CENTIBET_CAP,
  type BookRound,
} from './roundInterpreter.ts'

const here = dirname(fileURLToPath(import.meta.url))
const samplesPath = resolve(here, '../mock/sample_rounds.json')
const samples: Array<{ mode: string; category: string; round: BookRound }> = JSON.parse(
  readFileSync(samplesPath, 'utf-8'),
)

let pass = 0
const failures: string[] = []
const catSeen = new Set<string>()

for (const s of samples) {
  catSeen.add(`${s.mode}/${s.category}`)
  const script = interpretRound(s.round)
  const summed = Math.min(sumPresentedWins(script), CENTIBET_CAP)
  const expected = s.round.payoutMultiplier
  if (summed === expected) {
    pass++
  } else {
    failures.push(
      `round ${s.round.id} (${s.mode}/${s.category}): summed=${summed} expected=${expected} diff=${summed - expected}`,
    )
  }
}

console.log(`Sample rounds: ${samples.length}`)
console.log(`Categories: ${[...catSeen].sort().join(', ')}`)
console.log(`Exact-total gate PASS: ${pass}/${samples.length}`)
if (failures.length) {
  console.error('FAILURES:')
  for (const f of failures) console.error('  ' + f)
  process.exit(1)
}
// Structural spot checks on a triggered round
const trig = samples.find((s) => interpretRound(s.round).triggered)
if (trig) {
  const sc = interpretRound(trig.round)
  console.log(
    `sample triggered round ${sc.roundId}: initialFs=${sc.initialFreeSpins} ` +
      `totalFsAwarded=${sc.totalFreeSpinsAwarded} freeSpins=${sc.freeSpins.length} ` +
      `finalMeter=${sc.finalMeter} instantScatter=${sc.instantScatterCentibets} ` +
      `total=${sc.totalWinCentibets}`,
  )
  // meter must be non-decreasing and increment only after winning spins
  let meterOk = true
  let m = 1
  for (const fs of sc.freeSpins) {
    if (fs.meterBefore !== m) meterOk = false
    const shouldInc = fs.spinWinCentibets > 0
    if (shouldInc && fs.meterAfter !== m + 1) meterOk = false
    if (!shouldInc && fs.meterAfter !== m) meterOk = false
    m = fs.meterAfter
  }
  console.log(`meter progression well-formed: ${meterOk}`)
  if (!meterOk) process.exit(1)
}

// NITRO DEV FUEL (2026-07-15): every curated `super` sample must present its
// meter starting at 5x (pre-revved per FeatureMath v2), not the interpreter's
// naive 1x default - this is the exact gap the meter-seeding fix (pre-scan
// for the first free-spin win's meta.globalMult) closes. Checks meterBefore
// on the FIRST free spin specifically, since that's the one v1 of the
// interpreter always got wrong regardless of mode.
const superSamples = samples.filter((s) => s.mode === 'super')
if (superSamples.length === 0) {
  console.error('FAIL: no curated super samples found (expected NITRO DEV FUEL pool)')
  process.exit(1)
}
let superMeterOk = true
for (const s of superSamples) {
  const script = interpretRound(s.round)
  const firstFs = script.freeSpins[0]
  if (!firstFs || firstFs.meterBefore < 5) {
    superMeterOk = false
    console.error(
      `FAIL: super/${s.category} (round ${s.round.id}) meterBefore on first free spin = ` +
        `${firstFs?.meterBefore ?? 'undefined'}, expected >= 5`,
    )
  }
}
console.log(`super samples: ${superSamples.length}, all start >=5x meter: ${superMeterOk}`)
if (!superMeterOk) process.exit(1)

console.log('ALL INTERPRETER GATES PASS')
