// scatterCount.test.ts, R152. A presented scatter count is the VISIBLE count.
//
// `reveal` carries one padding row above and one below each reel (convention (l)'s worked
// example). roundInterpreter.countScatters counted all six rows, so Bet Replay's WinDisplay
// printed "3 SCATTERS: 8 FREE SPINS + 1× BET" on a 1.2x round that did not trigger (base book
// id 46: 2 visible scatters, 1 in padding) and "4 SCATTERS: 12 FREE SPINS + 3× BET" on a round
// that awarded 8 spins and 1x (id 1397: 3 visible, 1 in padding). Over the five published books
// the padded count disagrees with freeSpinTrigger on 9,505 of 500,000 rows; the visible count on 0.
//
// Run (from frontend/): npx tsx src/lib/services/scatterCount.test.ts
import { readFileSync } from 'node:fs'
import { interpretEvents, type RawEvent } from './roundInterpreter'

let failures = 0
const ok = (cond: boolean, msg: string) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${msg}`); if (!cond) failures++ }
const cell = (n: string) => ({ name: n, ...(n === 'S' ? { scatter: true } : {}), ...(n === 'W' ? { wild: true } : {}) })
const reveal = (rows: string[][]): RawEvent => ({ type: 'reveal', gameType: 'basegame', board: rows.map((r) => r.map(cell)) } as unknown as RawEvent)

console.log('SEEDED (the id 46 shape): 2 visible scatters and 1 in a padding row')
const seeded = interpretEvents([reveal([
  ['S', 'L1', 'L2', 'L3', 'M1', 'L1'],   // row 0 is padding
  ['L1', 'S', 'L2', 'L3', 'M1', 'L1'],
  ['L1', 'L2', 'S', 'L3', 'M1', 'L1'],
  ['L1', 'L2', 'L3', 'M1', 'M2', 'L1'],
  ['L1', 'L2', 'L3', 'M1', 'M2', 'L1'],
])])
ok(seeded.baseSpin.scatterCount === 2, `a padding-row scatter is not counted (got ${seeded.baseSpin.scatterCount}, want 2)`)

console.log('CONTROL: 3 visible scatters, none in padding, still reads 3')
const control = interpretEvents([reveal([
  ['L1', 'S', 'L2', 'L3', 'M1', 'L1'],
  ['L1', 'L2', 'S', 'L3', 'M1', 'L1'],
  ['L1', 'L2', 'L3', 'S', 'M1', 'L1'],
  ['L1', 'L2', 'L3', 'M1', 'M2', 'L1'],
  ['L1', 'L2', 'L3', 'M1', 'M2', 'L1'],
])])
ok(control.baseSpin.scatterCount === 3, `visible scatters are all counted (got ${control.baseSpin.scatterCount})`)

console.log('EVERY COMMITTED FIXTURE ROUND: count >= 3 exactly when the round triggered')
const fx = JSON.parse(readFileSync(new URL('./__fixtures__/replay_rounds.json', import.meta.url), 'utf-8')) as
  Record<string, Record<string, { id: number; events: RawEvent[] }>>
let n = 0
for (const [mode, cats] of Object.entries(fx)) {
  for (const [cat, round] of Object.entries(cats)) {
    const s = interpretEvents(round.events)
    const rev = round.events.find((e) => e.type === 'reveal') as unknown as { board: Array<Array<{ name: string }>> }
    const visible = rev.board.reduce((k, reel) => k + reel.slice(1, -1).filter((c) => c.name === 'S').length, 0)
    ok(s.baseSpin.scatterCount === visible && (visible >= 3) === s.triggered,
      `${mode}/${cat} (id ${round.id}): count ${s.baseSpin.scatterCount}, visible ${visible}, triggered ${s.triggered}`)
    n++
  }
}
ok(n > 0, `${n} fixture rounds checked (an empty loop is not a pass)`)

if (failures) { console.error(`\nSCATTER COUNT: FAIL (${failures})`); process.exit(1) }
console.log('\nSCATTER COUNT: PASS')
