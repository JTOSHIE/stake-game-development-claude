// rgsService.parse.test.ts - R1a scope (a) fixture proof (2026-07-25).
//
// Proves the live event handling is aligned to the canonical reveal/winInfo
// schema, against REAL DECODED BOOK ROWS rather than hand-written events. The
// fixtures in __fixtures__/live_rounds.json were decoded straight out of the
// shipped `books_base.jsonl.zst`: a loss, a base win and a feature trigger.
//
// The first assertions are the regression itself. The parser this pass replaced
// looked for `board`, `win` and `scatter` events. Those types do not occur in a
// single shipped round, so on a live round it returned an empty board with no
// wins and no scatter, and a player would have watched a dead grid. That is
// asserted here as a property of the fixtures, so the defect cannot quietly come
// back by someone reintroducing the legacy shape.
//
// Run (from frontend/): npx tsx src/lib/services/rgsService.parse.test.ts

import { interpretEvents, type RawEvent } from './roundInterpreter'
import fixtures from './__fixtures__/live_rounds.json'

let failures = 0
function check(name: string, actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) === JSON.stringify(expected)) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}\n    expected ${JSON.stringify(expected)}\n    actual   ${JSON.stringify(actual)}`) }
}
function checkThat(name: string, cond: boolean): void {
  if (cond) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}`) }
}

type Fixture = { id: number; payoutMultiplier: number; events: RawEvent[] }
const rounds = fixtures as unknown as Record<string, Fixture>

// The mapping under test, mirroring _parsePlayResponse exactly. rgsService is
// locked and its parser is not exported, so the mapping is restated here; every
// line is identical to the shipped one and the fixtures are the shared input.
function mapRound(events: RawEvent[], betDollars: number) {
  const script = interpretEvents(events)
  const base = script.baseSpin
  return {
    board: base.board.map((reel) => reel.slice(1, reel.length - 1).map((c) => c.name)),
    winEvents: base.wins.map((w) => ({
      symbol: w.symbol, kind: w.kind, ways: w.ways,
      payout: (w.winCentibets / 100) * betDollars,
    })),
    scatterEvent: base.scatterCount >= 3
      ? {
          count: base.scatterCount,
          multiplier: script.instantScatterCentibets / 100,
          award: (script.instantScatterCentibets / 100) * betDollars,
        }
      : null,
    script,
  }
}

console.log('\nTHE SCHEMA MISMATCH, asserted against the shipped book')
for (const [label, round] of Object.entries(rounds)) {
  const types = new Set(round.events.map((e) => e.type))
  checkThat(`${label}: carries the canonical 'reveal' event`, types.has('reveal'))
  checkThat(`${label}: carries NO legacy 'board' event`, !types.has('board'))
  checkThat(`${label}: carries NO legacy 'win' event`, !types.has('win'))
  checkThat(`${label}: carries NO legacy 'scatter' event`, !types.has('scatter'))
}

console.log('\nBOARD: six rows in the book, four visible after padding is stripped')
for (const [label, round] of Object.entries(rounds)) {
  const reveal = round.events.find((e) => e.type === 'reveal') as { board?: unknown[][] } | undefined
  checkThat(`${label}: book reveal is 5 reels`, reveal?.board?.length === 5)
  checkThat(`${label}: book reveal is 6 rows per reel (4 visible + 2 padding)`,
    (reveal?.board ?? []).every((r) => r.length === 6))
  const out = mapRound(round.events, 1.0)
  check(`${label}: mapped board is 5 reels`, out.board.length, 5)
  checkThat(`${label}: mapped board is 4 rows per reel`, out.board.every((r) => r.length === 4))
  checkThat(`${label}: every mapped cell is a symbol name, never an object`,
    out.board.every((r) => r.every((c) => typeof c === 'string' && c.length > 0)))
  // The visible window must be the book's rows 1..4, not 0..3 and not 2..5.
  const raw = (reveal!.board as Array<Array<{ name: string }>>)
  check(`${label}: reel 0 visible window equals book rows 1 to 4`,
    out.board[0], raw[0].slice(1, 5).map((c) => c.name))
}

console.log('\nWINS AND SCATTER, against the round the book actually recorded')
{
  const loss = mapRound(rounds.loss.events, 1.0)
  check('loss: no wins presented', loss.winEvents.length, 0)
  check('loss: no scatter event', loss.scatterEvent, null)
  check('loss: book payoutMultiplier is zero', rounds.loss.payoutMultiplier, 0)

  const win = mapRound(rounds.win.events, 1.0)
  checkThat('win: at least one win presented', win.winEvents.length > 0)
  checkThat('win: every win names a symbol', win.winEvents.every((w) => w.symbol.length > 0))
  checkThat('win: every win pays a positive amount', win.winEvents.every((w) => w.payout > 0))

  const trig = mapRound(rounds.trigger.events, 1.0)
  checkThat('trigger: scatter event is presented', trig.scatterEvent !== null)
  checkThat('trigger: scatter count is 3 or more', (trig.scatterEvent?.count ?? 0) >= 3)
  // The retracted six-scatter claim came from counting padding cells. On the
  // VISIBLE window the maximum is 5, because there are five reels.
  checkThat('trigger: scatter count never exceeds 5, the number of reels',
    (trig.scatterEvent?.count ?? 0) <= 5)
  checkThat('trigger: the round is flagged as triggering free spins', trig.script.triggered === true)
}

console.log('\nTOTALS reconcile to the book, which is the money-path claim')
for (const [label, round] of Object.entries(rounds)) {
  const out = mapRound(round.events, 1.0)
  check(`${label}: interpreter total equals the book payoutMultiplier`,
    out.script.totalWinCentibets, round.payoutMultiplier)
}

// Bet scaling: payouts are bet-multiples, so doubling the bet doubles the money.
{
  const one = mapRound(rounds.win.events, 1.0)
  const two = mapRound(rounds.win.events, 2.0)
  check('doubling the bet doubles every win payout',
    two.winEvents.map((w) => w.payout), one.winEvents.map((w) => w.payout * 2))
  check('doubling the bet does not change the board',
    two.board, one.board)
}

if (failures) { console.error(`\nRGS PARSE ALIGNMENT: FAIL (${failures})`); process.exit(1) }
console.log('\nRGS PARSE ALIGNMENT: PASS')
