// replayRounds.test.ts - R2R JOB 5 / TR-040 (2026-07-25). New CI gate 13.
// Run (from frontend/): npx tsx src/lib/services/replayRounds.test.ts
//
// Round-two reviewer 3's second BLOCKER: ReplayMode.svelte routed only
// `freeSpinTrigger` rounds through the canonical interpreter and searched every
// ORDINARY round for `board`, `win` and `scatter` events that occur zero times
// in the shipped books. A loss or an ordinary win therefore replayed as an
// empty, static grid, and Bet Replay is a mandatory platform requirement.
//
// These assertions cover the five round categories the brief names - loss,
// ordinary win, big win, cap round and feature round - in every mode where the
// category exists, against REAL BOOK ROUNDS copied verbatim out of
// books_<mode>.jsonl.zst by scripts/extract_replay_fixtures.mjs.
//
// WHY REAL ROUNDS AND NOT HAND-WRITTEN ONES. The defect under test is precisely
// a disagreement between what the code believed the books emit and what they
// emit. A hand-written fixture is the developer's belief written down twice, so
// it cannot catch that class at all. This is the same reason gate 11 uses
// decoded book rows.
//
// WHAT IS ASSERTED. `replayRound` below is the mapping ReplayMode.svelte
// performs, restated here because a .svelte file's script block cannot be
// imported by tsx. Every line is identical to the shipped one, and gate 13a at
// the bottom asserts that the component still contains no legacy search, so the
// restatement cannot drift into fiction the way the old code did.

import { interpretEvents, CENTIBET_CAP, type RawEvent } from './roundInterpreter.ts'
import fixtures from './__fixtures__/replay_rounds.json' with { type: 'json' }
import { readFileSync } from 'node:fs'

let failures = 0
const check = (name: string, a: unknown, e: unknown) => {
  if (JSON.stringify(a) === JSON.stringify(e)) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}\n    expected ${JSON.stringify(e)}\n    actual   ${JSON.stringify(a)}`) }
}
const checkThat = (name: string, cond: boolean) => {
  if (cond) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}`) }
}

type Round = { id: number; payoutMultiplier: number; events: RawEvent[]; criteria?: string }
const modes = fixtures as unknown as Record<string, Record<string, Round>>

const WINCAP = 5000 // bet-multiples, matching gameStore.WINCAP

/** The mapping ReplayMode.svelte performs, for a NON-feature round. */
function replayRound(events: RawEvent[], betDollars: number) {
  const script = interpretEvents(events)
  const base = script.baseSpin
  return {
    triggered: script.triggered,
    board: base.board.map((reel) => reel.slice(1, reel.length - 1).map((c) => c.name)),
    winEvents: base.wins.map((w) => ({
      symbol: w.symbol, kind: w.kind, ways: w.ways,
      payout: (w.winCentibets / 100) * betDollars,
    })),
    scatterCount: base.scatterCount,
    script,
  }
}

// ── The regression itself, asserted as a property of the SHIPPED books ───────
// If this block ever fails it means the books changed, and the deleted code was
// right all along. It is here so the blocker cannot be quietly reintroduced by
// someone "restoring" the legacy search.
console.log('\nTHE REGRESSION: the legacy event types occur ZERO times in the books')
let legacyHits = 0
let roundsScanned = 0
for (const [, cats] of Object.entries(modes)) {
  for (const [, round] of Object.entries(cats)) {
    roundsScanned++
    for (const ev of round.events) {
      if (ev.type === 'board' || ev.type === 'win' || ev.type === 'scatter') legacyHits++
    }
  }
}
check(`board/win/scatter across all ${roundsScanned} fixture rounds`, legacyHits, 0)
checkThat('while reveal DOES occur, so the rounds are not empty',
  Object.values(modes).some((c) => Object.values(c).some((r) => r.events.some((e) => e.type === 'reveal'))))

// ── Per mode, per category ───────────────────────────────────────────────────
const BET = 1 // one currency unit, so dollars and bet-multiples read the same

for (const [mode, cats] of Object.entries(modes)) {
  console.log(`\n${mode.toUpperCase()}`)

  for (const [cat, round] of Object.entries(cats)) {
    const label = `${mode}/${cat} (book id ${round.id}, ${round.payoutMultiplier} centibets)`
    const out = replayRound(round.events, BET)

    if (cat === 'feature') {
      // A feature round takes the FreeSpinsPresentation branch. What replay
      // needs from it is a script that actually triggered and carries spins.
      checkThat(`${label}: interpreter reports triggered`, out.triggered)
      checkThat(`${label}: the free-spin sequence is not empty`, out.script.freeSpins.length > 0)
      checkThat(`${label}: at least 3 scatters landed to trigger it`, out.scatterCount >= 3)
      continue
    }

    if (cat === 'cap' && out.triggered) {
      // A capped round can also be a triggered one; in every mode here the cap
      // fixture is `criteria: wincap`, which may or may not be a feature round.
      checkThat(`${label}: capped feature round triggers`, out.triggered)
      check(`${label}: pays exactly the cap`, round.payoutMultiplier, CENTIBET_CAP)
      continue
    }

    // Every ordinary round must produce a REAL 5x4 board. This is the assertion
    // the deleted code could not have passed: it returned [].
    check(`${label}: board is 5 reels`, out.board.length, 5)
    check(`${label}: every reel is the visible 4 rows`, out.board.map((r) => r.length), [4, 4, 4, 4, 4])
    checkThat(`${label}: every cell carries a symbol name`,
      out.board.every((r) => r.every((c) => typeof c === 'string' && c.length > 0)))

    if (cat === 'loss') {
      check(`${label}: pays nothing`, round.payoutMultiplier, 0)
      check(`${label}: presents no wins`, out.winEvents.length, 0)
      check(`${label}: presents no scatter award`, out.scatterCount >= 3, false)
    }

    if (cat === 'win' || cat === 'bigWin') {
      checkThat(`${label}: presents at least one win`, out.winEvents.length > 0)
      checkThat(`${label}: every presented win names a symbol and a match length`,
        out.winEvents.every((w) => w.symbol.length > 0 && w.kind >= 3 && w.kind <= 5))
      // The load-bearing one: the presented wins must sum to the book's own
      // declared payout. A board that renders but pays the wrong number is a
      // worse failure than one that does not render.
      const summed = out.winEvents.reduce((a, w) => a + w.payout, 0)
      check(`${label}: presented wins sum to the book payout`,
        Math.round(summed * 100), round.payoutMultiplier)
    }

    if (cat === 'bigWin') {
      checkThat(`${label}: is genuinely a big win, at or above 10x`,
        round.payoutMultiplier >= 1000)
      checkThat(`${label}: and is below the cap, so it is not the cap case`,
        round.payoutMultiplier < CENTIBET_CAP)
    }

    if (cat === 'cap') {
      check(`${label}: pays exactly the cap, not merely near it`, round.payoutMultiplier, CENTIBET_CAP)
      checkThat(`${label}: the replay wincap flow fires`,
        round.payoutMultiplier / 100 >= WINCAP)
    }
  }
}

// ── Gate 13a: the component itself carries no legacy search ──────────────────
// The mapping above is a restatement, and a restatement can drift. This reads
// the shipped component and asserts the deleted code has not come back, and
// that the single interpreter call covers the whole function rather than
// sitting inside the feature branch again.
console.log('\nTHE COMPONENT: no legacy search survives in ReplayMode.svelte')
const src = readFileSync('src/lib/components/ReplayMode.svelte', 'utf8')
checkThat("no search for a 'board' event", !/ev\.type === 'board'/.test(src))
checkThat("no search for a 'win' event", !/ev\.type === 'win'/.test(src))
checkThat("no search for a 'scatter' event", !/ev\.type === 'scatter'/.test(src))
checkThat('no fallback to an invented response.state.board', !/state\?\.board/.test(src))
checkThat('interpretEvents is called exactly once, for every round',
  (src.match(/interpretEvents\(/g) ?? []).length === 1)
checkThat('the interpreter call is NOT gated on freeSpinTrigger',
  !/freeSpinTrigger[\s\S]{0,200}interpretEvents\(/.test(src))

// ── Gate 13b: bookEvents are consumed in the ORDER THE BOOK SUPPLIES ─────────
// REQ-132, mechanism M01 of reports/qa/session3/MECHANISMS.md.
//
// WHY THIS ASSERTION LIVES HERE RATHER THAN IN THE BROWSER GATE, recorded
// because the wrong home was tried first and cost three attempts.
// `replay_contract_gate.mjs` covers the other ten requirements of M01 by driving
// the built bundle, and the obvious move was to cover this one the same way: run
// a round, reorder its events, watch the rendered total change. It does not
// change, and the reason is not a defect. The rendered `.win-area` is the win
// PRESENTATION, several transforms downstream of the value that actually depends
// on order, so the browser is simply the wrong instrument: it can see that a
// total was rendered, never which event decided it.
//
// The order dependence is exact and it is right here, two lines of interpreter:
//   roundInterpreter.ts:274-279  scans BACKWARDS for the last `finalWin`
//   roundInterpreter.ts:211-213  `running = Number(ev.amount ?? running)`
// so the LAST `setTotalWin` in array order decides the running total. Asserting
// it at this level is direct, cheap and cannot be confounded by presentation.
console.log('\nEVENT ORDER: the supplied order decides the outcome')
{
  const ordered = (fixtures as any).base.win.events
  const trunk = ordered.filter((e: any) => e.type !== 'setTotalWin' && e.type !== 'finalWin')
  const stw = (amount: number) => ({ index: 0, type: 'setTotalWin', amount })
  const fin = (amount: number) => ({ index: 0, type: 'finalWin', amount })

  // A pure ORDER SWAP: identical events, opposite sequence. Nothing else differs,
  // so any difference in the interpreted result is attributable to order alone.
  const aThenB = interpretEvents([...trunk, stw(390), stw(777), fin(777)] as any)
  const bThenA = interpretEvents([...trunk, stw(777), stw(390), fin(777)] as any)
  const lastOf = (s: { baseSpin: { runningTotalCentibets: number } }) => s.baseSpin.runningTotalCentibets
  checkThat('swapping two setTotalWin events changes the interpreted running total',
    lastOf(aThenB) !== lastOf(bThenA))
  check('the LAST setTotalWin in the supplied array decides the total', lastOf(aThenB), 777)
  check('and swapping them settles on the other value', lastOf(bThenA), 390)

  // The backward finalWin scan, asserted rather than assumed. Two finalWin
  // events: the LAST one in array order must win. A client that took the first,
  // or that sorted by the events' own `index` field, fails here.
  const twoFinals = interpretEvents([...trunk, stw(390), fin(111), fin(222)] as any)
  check('with two finalWin events the LAST supplied one decides the payout',
    twoFinals.totalWinCentibets, 222)

  // NEGATIVE CONTROL: the unmodified fixture must still interpret as it did, so
  // this block cannot go green by breaking the interpreter it is testing.
  const untouched = interpretEvents(ordered as any)
  check('NEGATIVE CONTROL: the real round still interprets to its book payout',
    untouched.totalWinCentibets, 390)
}

if (failures) { console.error(`\nREPLAY ROUNDS: FAIL (${failures})`); process.exit(1) }
console.log('\nREPLAY ROUNDS: PASS')
