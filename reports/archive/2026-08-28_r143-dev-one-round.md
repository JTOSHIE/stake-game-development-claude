
---

# R143 - ONE ROUND DRIVES EVERY SURFACE, AND ONLY IN DEV (2026-08-28)

Sole live brief, unattended, review lane. Brief saved verbatim at
`reports/briefs/FS_R143_DevHudOneRound_Prompt.md` per convention (f). Booted from
`main` at `55663aec`, which carries R142's record.

**One file changed, `frontend/src/App.svelte`, 39 insertions and 7 deletions, and
most of the insertion is the comment explaining why.**

## WORKSTREAM 1: the two draws

R142 already named this, so it is restated once rather than re-theorised. On a
standing local spin `App.svelte:1694` takes `result` from `spin()`, which in mock
mode is rgsService's own `_mockSpin` round parsed by `_parsePlayResponse`. Two
lines later the DEV block at `App.svelte:1714-1723` served a **second,
independent** curated round from `roundProvider.serveMockRound` /
`serveCategory` and took only its total,
`servedTotalWin = (round.payoutMultiplier / 100) * bet`, while
`App.svelte:1727-1729` still set `boardSymbols`, `activeWins` and `scatterCount`
from `result`. The footer therefore painted one round's ways lines beside another
round's HUD total. Both numbers were internally correct and they answered
different questions. It fired on every dev spin rather than only under
`?mockCategory=`, because `App.svelte:1679` clears `lastRoundEvents` before each
spin and `_mockSpin` never publishes it, so the `!get(lastRoundEvents)` guard was
always open in mock mode.

## WORKSTREAM 2: one round

**The change is to capture the served round's own base spin, and nothing else.**
The DEV block now also keeps `servedBase = scriptFromEvents(round.events).baseSpin`,
and the three surfaces read from it when it exists:

```
const presentedBoard = servedBase ? <slice the padding off servedBase.board> : result.board
const presentedWins  = servedBase ? servedBase.wins.map(w => ({ ...w, payout: (w.winCentibets / 100) * bet })) : result.winEvents
scatterCount.set(servedBase ? servedBase.scatterCount : (result.scatterEvent?.count ?? 0))
```

**No third writer and no new formula, which the brief asked for explicitly.**
`scriptFromEvents` is the same local helper the live path calls three lines below
at `App.svelte:1744`. The `slice(1, reel.length - 1)` padding drop is the one
`rgsService._parsePlayResponse` and the feature-resume path at `App.svelte:745`
both use. The conversion `(winCentibets / 100) * bet` is already written in both
of those places; this is its third identical use, not a fourth convention.

**LIVE PLAY CANNOT REACH IT, and that is structural rather than argued.**
`servedBase` is assigned only inside the pre-existing
`import.meta.env.DEV && !get(lastRoundEvents)` guard. A live round always leaves
`lastRoundEvents` populated (`rgsService.ts:789`), so on the live path both new
locals are null and the expressions fall through to `result.board` and
`result.winEvents` - byte-identical behaviour to before this session. Verified on
the built bundle rather than asserted: **zero occurrences of `serveMockRound`,
`serveCategory`, `roundProvider`, `mockCategory`, `sample_rounds` or the new
`servedBase` symbol**, with `winCentibets` found by the same grep as a positive
control so the search is known to work.

## WORKSTREAM 3: fixtures

One spin per page load, each carrying its own control - the click only counts if
the button was enabled AND `isSpinning` actually went true AND the balance moved.
That discipline is R142's lesson paid forward: its loop reported nineteen
identical rows because spins two onward never ran and it re-read one stale round.

| fixture | footer | HUD WIN | agree |
|---|---|---|---|
| bet $1, funded, random round | $1.20 | $1.20 | **yes** |
| `?mockCategory=base_win_mid`, bet $100 | $390.00 | $390.00 | **yes** (was $160.00 vs $390.00) |
| `?mockCategory=base_win_mid`, bet $1 | $3.90 | $3.90 | **yes** |
| `?mockCategory=base_win_large`, bet $100 | $1,620.00 | $1,620.00 | **yes**, BIG banner at 16x |
| `?mockCategory=base_loss`, bet $100 | empty | $0.00 | **yes** |
| $100 bet on a $0 wallet | nothing painted | $0.00 | **yes**, spin button disabled, no stale footer |

Banner behaviour is unchanged and correct: 16.2x raises BIG, and nothing below
the 10x floor raises anything.

**A TRIGGER ROUND STILL SHOWS A SMALLER FOOTER THAN HUD, AND THAT IS RIGHT.**
On `trigger_3` the footer reads **$280.00** while settlement defers until the
feature ends. That is not the old defect returning: **$280.00 is exactly that
sample's own base-spin total** - L1 x4 at 180 centibets plus the three-scatter 1x
award at 100 centibets - while the round's `payoutMultiplier` is 1935 centibets,
**$1,935.00**, including the free spins. One round, two correct figures, and the
brief forbids syncing them ("do not sync by copying the footer into the HUD if
the engine total includes more than the current line"). The base footer is also
covered by the Overdrive entry prompt while that is on screen: a hit test at the
footer's centre returns `entry-continue`, so the two numbers are not even visible
together.

The same applies to the multi-group case in the look-pass below: the footer
CYCLES group by group and showed `M3 x5 8 ways $1,600.00` of a $1,620.00 round.
The sum of its groups is what equals the HUD, which is what was measured.

## WORKSTREAM 4: QA

- **1280 look-pass**: `?mockCategory=base_win_large` at bet $100 - footer groups
  sum **$1,620.00**, HUD reads **WIN $1,620.00**, bet echo `BET $100.00`,
  multiplier 16.2x, BIG banner. Screenshot at
  `reports/screens/r143-dev-one-round/look-1280-ways-win.png`.
- **Reduced motion**: footer $390.00 equals HUD $390.00, hero on
  `hero_crossed_idle_6f.png` with **0 animations**, `background-position-x: 0px`,
  `.char-layer` **0 animations**. Screenshot beside it.
- **R138 float and R140 strips untouched**: `hero_float_proof.mjs` **PASS**, every
  section, run against this branch.
- **Static gates**: **82/82 green** on the committed tree, and the browser matrix
  run locally before push.
- 0 console errors and 0 page errors across every fixture and both look-passes.

Fence held: `HeroIdle.svelte`, `SceneGroup.svelte`, `rgsService.ts`,
`gameStore.ts` and `games/future_spinner/` are all **0 files changed**. No maths,
hero, art, audio or kit touched; locked files stayed locked.

## FOR THE NEXT SESSION

Model and effort: Opus 5, high effort. No subagents; the diagnosis was already
done by R142 and the change is one branch of one block.

Approach: read R142's record first, confirm the two draws at file:line, then make
the smallest change that lets both surfaces read one parsed round, and prove the
live path cannot reach it by grepping the built bundle with a positive control.

Alternatives rejected: deriving board and wins from `script` unconditionally
(provably identical on the live path, but it moves live data flow for no gain and
the fence says dev/mock only, so gating makes it structurally impossible to
affect production); copying the footer sum into the HUD (forbidden by the brief,
and wrong on trigger rounds where the engine total legitimately exceeds the base
lines); changing `rgsService`'s mock to serve curated rounds (locked file).

Files touched: `frontend/src/App.svelte`, the brief save,
`reports/screens/r143-dev-one-round/`, this report and its dated archive.

Open threads: none from this brief. The buy path at `App.svelte:846-853` carries
the same shape of DEV block but does NOT have the defect, because it computes its
script immediately afterwards and drives the whole presentation from it; it was
read and deliberately left alone. **The close's own note stands: this does not
replace the frontend kit rebuild Stake still needs**, which now wants R141's
0-degree needle and R140's dense strips together.
0-degree needle and R140's dense strips together.

### Remote CI, rule 10, verified after the push

Run **33309043081** on `435053e9`:
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/33309043081
**completed SUCCESS, 30 of 30 jobs green**, with no non-success job in the list.
PR #180 is open on the review lane. Local before the push, on the commit that was
pushed rather than an earlier tree: static **82/82** and the browser matrix
**28/28**. This paragraph is itself a commit and therefore postdates the run it
quotes; per the R131 lesson that chase has no fixed point, so it is verified by
SHA in the past tense and stops here.
