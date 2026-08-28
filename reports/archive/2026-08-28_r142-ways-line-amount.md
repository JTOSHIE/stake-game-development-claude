
---

# R142 - THE FOOTER IS RIGHT, AND THE MISMATCH IS A DEV HARNESS ARTEFACT (2026-08-28)

Sole live brief, unattended, review lane, "read first, patch only if the live path
is wrong". Brief saved verbatim at `reports/briefs/FS_R142_WaysLineAmount_Prompt.md`
per convention (f). Booted from `main` at `972006b1`, which carries R140 (PR #179
merged before this session opened).

**VERDICT: production is correct and NO code changed. No PR.** The footer is
neither paytable-at-unit-stake nor double-counting ways, so the brief's step 4
does not apply. Its step 5 does: the surfaces diverge only under the DEV-only
`?mockCategory=` harness, which is proven absent from the shipped bundle.

## 1. The footer

`frontend/src/lib/components/WinBreakdown.svelte`, which cycles `$activeWins` and
paints `symbol / xkind / n ways / amount`. The amount is
`formatWin(Math.round(current.payout * CURRENCY_SCALE), ...)` - it renders
`payout` and multiplies by nothing.

## 2. The number is right, and it is right by the maths package's own formula

`games/future_spinner/game_config.py:116` states the rule: **paytable_value x
ways_count x bet**, then x the Overdrive multiplier during free spins. Its
paytable has `(5, "M3"): 2.0`.

So the brief's own example, M3 x5 with 2 ways at bet $100:
**2.0 x 2 x 100 = $400.00.** The painted figure is exactly correct.

**Verified against the shipped books rather than argued.** Decompressing
`books_base.jsonl.zst` and recomputing every ways-win in the first 6,000 rounds:
**13,613 wins checked, and the engine's own `win` field equals
paytable x ways x meter x 100 in all but 10 of them.** All 10 exceptions read
exactly 500000 centibets, which is the 5,000x cap clamping the award - correct
behaviour, not a mismatch.

**No double-count is structurally possible.** `roundInterpreter.ts:193` takes
`winCentibets` straight from the engine's `w.win`, which its own type comment
calls the "meter-applied award"; the ways factor and the meter are already inside
it. `rgsService.ts:862` then converts once, `payout: (w.winCentibets / 100) *
betDollars`, and `WinEvent.payout` is typed `// dollars`. The footer multiplies by
neither ways nor meter. All three production writers of `activeWins` use that one
formula: `rgsService._parsePlayResponse`, `App.svelte:745` (the feature-resume
path) and `ReplayMode.svelte:409`.

## 3. The fixture, bet = $100

Driven through the live stores at bet $100, read after the count-up has settled so
nothing is caught mid-flight, with the banner's 3600ms auto-dismiss suppressed so
the band could actually be read (the R133 trap - a first pass caught the 66x band
mid-count-up at $6,493.94 and would have recorded a false discrepancy):

| case | engine | footer | HUD WIN | banner | banner x | feature column x |
|---|---|---|---|---|---|---|
| M3 x5, 2 ways, meter 1 | 400 cb | **$400.00** | **WIN $400.00** | none | - (4x is below the 10x floor) | n/a, base spin |
| M3 x5, 2 ways, meter 3 | 1200 cb | **$1,200.00** | **WIN $1,200.00** | BIG WIN $1,200.00 | **12x** | **x3, label only** |
| H1 x5, 3 ways, meter 1 | 6600 cb | **$6,600.00** | **WIN $6,600.00** | MEGA WIN $6,600.00 | **66x** | n/a, base spin |

Every surface agrees. Bet echo read `BET $100.00` throughout, 0 console errors.
Tiers are `BIG_WIN_THRESHOLD = 10`, `MEGA = 30`, `EPIC = 100`, so the 4x case
correctly shows no banner at all.

**The feature column multiplier IS independent, and that is the one claim worth
proving rather than reading.** `FreeSpinsPresentation.svelte:573` prints
`fmt(currentSpin.spinWinCentibets)` and then, only when the meter exceeds 1, a
SIBLING span `x{currentSpin.meterBefore}`. `fmt` is
`(cb / 100) * $betAmount` with no meter term anywhere in it, so the badge annotates
the amount and never multiplies it. Checked on real `books_bonus` rounds carrying a
live meter:

| round row | engine win | paytable x ways | x meter | column prints | if it double-applied |
|---|---|---|---|---|---|
| L3 x5, 2 ways, meter 2 | 260 cb | 130 cb | 260 | **$260.00** | $520.00 |
| L2 x3, 4 ways, meter 2 | 80 cb | 40 cb | 80 | **$80.00** | $160.00 |
| L3 x4, 6 ways, meter 3 | 360 cb | 120 cb | 360 | **$360.00** | $1,080.00 |
| L2 x3, 3 ways, meter 3 | 90 cb | 30 cb | 90 | **$90.00** | $270.00 |

The meter is applied exactly once, by the engine, and labelled by the column.

## 4. Not applicable

The footer is not paytable-at-unit-stake and does not double-count xN, so no
formatter was touched. **Zero source files changed this session.**

## 5. What DOES diverge, and it is the dev harness

Under `?mockCategory=` the footer and the HUD describe **different rounds**:

| `?mockCategory=` | footer | HUD WIN |
|---|---|---|
| `base_win_large` | nothing painted | **WIN $1,620.00** |
| `base_win_mid` | L2 x5 2 ways **$160.00** | **WIN $390.00** |
| `base_win_small` | nothing painted | **WIN $20.00** |

**THE CAUSE, read rather than guessed.** `App.svelte:1716-1726` is a DEV-only
block: it draws a SECOND, independent curated round from
`roundProvider.serveCategory` / `serveMockRound` and overrides the HUD total with
`(round.payoutMultiplier / 100) * bet`. Two lines later `activeWins.set(result.winEvents)`
still carries the FIRST round - the one `rgsService._mockSpin` generated. Both
figures are internally correct; they are answers about different spins. The block
runs on every dev spin rather than only under `?mockCategory=`, because
`App.svelte:1679` clears `lastRoundEvents` before each spin and `_mockSpin` never
publishes it, so the `!get(lastRoundEvents)` guard is always open in mock mode.

**IT CANNOT REACH A PLAYER, and that is proven rather than asserted.** The
production bundle carries no reference to `serveMockRound`, `serveCategory`,
`roundProvider`, `mockCategory`, or any sample category name, and
`sample_rounds.json` is not shipped. **Positive control on the same grep: the
bundle DOES contain `winCentibets`**, so the search works and the bundle is the
real one. The block is `import.meta.env.DEV`-gated and is eliminated at build.

Per the fence - "do not fix mock-only fixtures if production `recordSpinResult`
already matches" - it is recorded and left alone. If the owner ever wants the dev
harness self-consistent, the fix is one line in that block: derive `activeWins`
from the same `round` the total came from, rather than from `result`.

## Three instrument failures of mine, all caught by controls

Worth recording because two of them produced confident wrong tables first.

1. **A 12-spin loop reported 0 wins on every spin.** With a 29.11% base hit rate
   that is a 1.6% outcome, which is what made me check. The control (does the
   balance move?) showed 11 of the 12 spins never happened: bet $100 against a
   $100 balance zeroes the wallet on spin one and `canAffordSpin` correctly blocks
   the rest.
2. **A funded rerun then reported $240.00 on 19 consecutive spins**, footer and HUD
   disagreeing every time. Nineteen identical draws is not a distribution. A
   per-spin trace showed spins 2 and 3 never ran at all - `isSpinning` stayed
   false and the board never changed - so the table was one stale round repeated.
   The real finding was reached instead by forcing ONE spin per page load.
3. **My HUD selector matched the BET pod**, reporting `$100.00` as the HUD win in
   the first fixture. `data-testid="hud-win"` exists; a heuristic that searched for
   dollar-shaped text found the wrong element first.

The pattern is the one this project keeps paying for: **an implausible uniformity
is an instrument fault until a control says otherwise.**

## FOR THE NEXT SESSION

Model and effort: Opus 5, high effort. No subagents; the question was a read plus
two measurements.

Approach: derive the answer from the specification first (convention (l.1)) - the
paytable and `game_config.py`'s own formula give $400.00 in one line - then confirm
against the shipped books and only then look at the screen. That order is what made
the brief's premise answerable without patching anything.

Alternatives rejected: patching the footer formatter (it is correct); fixing the dev
harness (out of fence, and production is unaffected).

Files touched: `reports/briefs/FS_R142_WaysLineAmount_Prompt.md`, this report and
its dated archive. **No source file changed, so there is no PR** - this is
record-only material and commits direct to main under convention (t.1).

Open threads: the dev-harness divergence above, left deliberately. The owner
preview was NOT refreshed by a code change because there was none; rule 12's
trigger (landing a change on main) is met only by this record commit.
