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
console.log('ALL INTERPRETER GATES PASS')
