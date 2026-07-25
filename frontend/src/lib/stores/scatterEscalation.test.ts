// scatterEscalation.test.ts - the anticipation integrity gate.
// Run (from frontend/): npx tsx src/lib/stores/scatterEscalation.test.ts
//
// The fixtures are REAL per-reel scatter placements decoded from the shipped
// books, chosen to cover the cases the measurement showed actually occur,
// including the 0.5% of rounds that land two scatters on one reel.

import {
  escalationFor, pulseLevelFor, holdMsFor, pulseMsFor, scaledHoldMs, scaledPulseMs,
  flameIntensityFor, PULSE_LEVELS, HOLD_FLOOR_MS, PULSE_FLOOR_MS,
  type EscalationLevel,
} from './scatterEscalation.ts'
import fixtures from './__fixtures__/scatter_rounds.json'

let failures = 0
const check = (name: string, a: unknown, e: unknown) => {
  if (JSON.stringify(a) === JSON.stringify(e)) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}\n    expected ${JSON.stringify(e)}\n    actual   ${JSON.stringify(a)}`) }
}
const REELS = 5

/** Replays a round exactly as the spin loop does: reel by reel, visible state only. */
function replay(perReel: number[]): EscalationLevel[] {
  const levels: EscalationLevel[] = []
  let landed = 0
  for (let r = 0; r < REELS; r++) {
    landed += perReel[r]
    levels.push(escalationFor(landed, REELS - 1 - r))
  }
  return levels
}

console.log('\nTHE INTEGRITY PROPERTY')
// The strongest statement available: the function cannot consult the outcome,
// because the outcome is not among its arguments. Two rounds that look identical
// so far MUST escalate identically, however they end.
{
  const earlyTwo = [1, 1, 0, 0, 0]   // dies at two
  const earlyThree = [1, 1, 1, 0, 0] // goes on to trigger
  const a = replay(earlyTwo).slice(0, 2)
  const b = replay(earlyThree).slice(0, 2)
  check('two rounds identical so far escalate identically', a, b)
  check('  even though one triggers and one does not', [earlyTwo.reduce((x, y) => x + y), earlyThree.reduce((x, y) => x + y)], [2, 3])
  check('escalationFor takes exactly two arguments', escalationFor.length, 2)
}

console.log('\nTHE LADDER')
check('below two scatters there is nothing', escalationFor(0, 4), 0)
check('one scatter is not anticipation', escalationFor(1, 3), 0)
check('two down with reels moving opens it', escalationFor(2, 3), 1)
check('two down with NO reels left clears', escalationFor(2, 0), 0)
check('three down, no reels left, is SECURED', escalationFor(3, 0), 2)
check('three down with reels moving climbs', escalationFor(3, 1), 3)
check('four down, no reels left, pulses', escalationFor(4, 0), 4)
check('four down with reels moving is near full', escalationFor(4, 1), 5)
check('five down erupts', escalationFor(5, 0), 6)
check('more than five cannot exceed the top', escalationFor(6, 0), 6)

console.log('\nREAL ROUNDS, decoded from the shipped books')
{
  const f = fixtures as Record<string, { id: number; perReel: number[] }>

  check(`dies at two (book id ${f.dies_at_two.id})`, replay(f.dies_at_two.perReel), [0, 0, 0, 1, 0])
  // The build opens on reel 3 and clears on reel 4 having never secured. That is
  // the honest 35.5% case: real tension that genuinely did not pay off.

  check(`secured on the LAST reel (id ${f.secured_on_last.id})`, replay(f.secured_on_last.perReel), [0, 1, 1, 1, 2])
  // 46.2% of triggers do this. Secured and resolve land on the same beat, which
  // is why the sequence is state driven rather than a timeline.

  check(`secured early (id ${f.secured_early.id})`, replay(f.secured_early.perReel), [0, 1, 3, 3, 2])
  // Level 3 sustains across the two remaining reels ("three down, still
  // turning"), then the gauge SETTLES to 2 at rest, which is the level three
  // scatters actually justify. The gauge tells the truth once the round stops
  // pushing it.

  check(`four scatters (id ${f.four.id})`, replay(f.four.perReel), [0, 1, 3, 5, 4])
  check(`five scatters (id ${f.five.id})`, replay(f.five.perReel), [0, 1, 3, 5, 6])

  // The case that would have broken an incrementing ladder.
  check(`two scatters on ONE reel (id ${f.double_on_one_reel.id})`, replay(f.double_on_one_reel.perReel), [0, 1, 1, 1, 0])
  const jump = escalationFor(0 + 3, 2)  // 1 -> 3 in a single stop is reachable
  check('a level may jump by more than one in a single stop', jump, 3)
}

console.log('\nPULSES FIRE ON THE TRANSITION, NOT ON THE RESTING STATE')
check('an ordinary stop earns no pulse', pulseLevelFor(1, 2), null)
check('crossing to three fires SECURED', pulseLevelFor(2, 3), 2)
check('crossing to four fires the fourth beat', pulseLevelFor(3, 4), 4)
check('crossing to five erupts', pulseLevelFor(4, 5), 6)
check('a stop that adds nothing fires nothing', pulseLevelFor(3, 3), null)
check('SECURED fires on reel 2 for book round 78, not at the end', pulseLevelFor(2, 3), 2)
// The double-scatter reel: one stop takes the count 1 -> 3 and must still
// celebrate securing the bonus.
check('a jump from one to three still fires SECURED', pulseLevelFor(1, 3), 2)
check('a jump from two to four fires the FOURTH beat, the higher one', pulseLevelFor(2, 4), 4)
check('a jump from three to five erupts', pulseLevelFor(3, 5), 6)

console.log('\nTURBO SHORTENS, NEVER SKIPS')
for (const [tier, f] of Object.entries({ normal: 1, turbo: 0.5, super: 0.16 })) {
  for (const lvl of [1, 3, 5] as EscalationLevel[]) {
    const ms = scaledHoldMs(lvl, f)
    if (ms < HOLD_FLOOR_MS) { failures++; console.error(`  FAIL ${tier} hold level ${lvl} = ${ms}ms, below the ${HOLD_FLOOR_MS}ms floor`) }
  }
  for (const lvl of [2, 4, 6] as EscalationLevel[]) {
    const ms = scaledPulseMs(lvl, f)
    if (ms < PULSE_FLOOR_MS) { failures++; console.error(`  FAIL ${tier} pulse level ${lvl} = ${ms}ms, below the ${PULSE_FLOOR_MS}ms floor`) }
  }
  console.log(`  ok   ${tier}: every hold >= ${HOLD_FLOOR_MS}ms and every pulse >= ${PULSE_FLOOR_MS}ms`)
}
check('super turbo still holds the floor rather than vanishing', scaledHoldMs(1, 0.16), 300)
check('and its pulses still register', scaledPulseMs(2, 0.16), 180)

console.log('\nUNIFORM TIMING, the no-tell property')
// A hold must depend on the LEVEL alone. If it varied by what was coming, the
// duration itself would leak the outcome to an attentive player.
check('level 3 has one duration, whatever follows', holdMsFor(3), 1000)
check('sustained levels are the only ones with holds', [1, 3, 5].map(holdMsFor), [900, 1000, 1100])
check('pulse levels have no sustained hold', [2, 4, 6].map((l) => holdMsFor(l as EscalationLevel)), [0, 0, 0])
check('sustained levels fire no pulse', [1, 3, 5].map((l) => pulseMsFor(l as EscalationLevel)), [0, 0, 0])
check('pulse levels are exactly 2, 4, 6', [...PULSE_LEVELS].sort(), [2, 4, 6])

console.log('\nTHE FLAME GAUGE')
check('jets are dark before the bonus is secured', [0, 1].map((l) => flameIntensityFor(l as EscalationLevel)), [0, 0])
check('they ignite low exactly at SECURED', flameIntensityFor(2), 0.35)
{
  const ramp = ([2, 3, 4, 5, 6] as EscalationLevel[]).map(flameIntensityFor)
  check('and rise monotonically to full', ramp.every((v, i) => i === 0 || v > ramp[i - 1]), true)
  check('topping out at 1', ramp[ramp.length - 1], 1)
}

if (failures) { console.error(`\nSCATTER ESCALATION: FAIL (${failures})`); process.exit(1) }
console.log('\nSCATTER ESCALATION: PASS')
