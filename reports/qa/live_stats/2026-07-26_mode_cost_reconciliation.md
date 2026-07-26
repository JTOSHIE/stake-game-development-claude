# Live mode-cost reconciliation, 2026-07-26

Track: `track/screenshot-analyst`. Duty 4 (between-frame arithmetic) and duty 6
(stats intake). Every figure below is read verbatim off a committed capture and
every path is given, per convention (l.3).

## What is being proved

`frontend/src/lib/config/fsModes.ts:59-113` declares the cost multiplier of each
mode: `base` 1.0, `cruise` 1.0, `antelite` 1.25, `bonus` 100, `super` 400.
`frontend/src/lib/stores/buyAffordability.ts:61-63` turns that into the debit:
`Math.round(betDisplay * (MODE_COST[mode] ?? 1) * CURRENCY_SCALE)`.

That is the specification, and per convention (l.1) it is the authority. The
work here is (l.2) confirmation: does the real wallet, on the live Stake Engine
RGS, move by exactly that amount. It is answered by differencing the BALANCE
readout between two captures and comparing against the debits and credits the
Bets panel lists between them.

## The result in one line

Four of the five modes are confirmed to the cent by a wallet delta. `cruise` is
confirmed at display level only, by inference from two other results, and its
wallet delta remains unmeasured.

| mode | declared cost | proven by | residual |
| --- | --- | --- | --- |
| `base` | 1.00x | session panel, 524 spins | 0.00 |
| `cruise` | 1.00x | display level only, one balance anchor | not measured |
| `antelite` | 1.25x | frames 03 to 04 | 0.00 |
| `bonus` | 100x | frames 41 to 42 | 0.00 |
| `super` | 400x | frames 46 to 48 | 0.00 |

Updated 2026-07-26 after the owner's second intake supplied the first `cruise`
capture and fifty `cruise` Bets rows. The `cruise` section below is rewritten;
nothing else in this document changed.

## base, 1.0x

Frame `reports/screens/dtt-live-2026-07-26/41_session_524_base_spins_balance_reconciles.png`.
Session information panel, read verbatim: Time played 00:16:18, Spins 524,
Total wagered $524,000.00, Total won $441,330.00, Net result -$82,670.00. HUD
BET $1,000.00.

    524 spins x $1,000.00 = $524,000.00   equals Total wagered exactly
    $441,330.00 - $524,000.00 = -$82,670.00   equals Net result exactly

Corroborated by
`reports/screens/screenshot-analyst-2026-07-26/06_session_panel_44_spins_wagered_880_net_plus_48240.png`:
Spins 44, Total wagered $880.00, Total won $1,362.40, Net result +$482.40, HUD
BET $20.00. 44 x $20.00 = $880.00, and 1,362.40 - 880.00 = 482.40. Both exact.

## antelite, 1.25x

The decisive pair. Frames, both in
`reports/screens/screenshot-analyst-2026-07-26/`:

- `03_freespins_12_intro_balance_82154_bet_1250.png`, BALANCE $821.54, HUD BET
  $12.50, OVERBOOST badge lit, newest Bets row 12:13:48.
- `04_freespins_8_intro_balance_156604_proves_1250_debits.png`, BALANCE
  $1,566.04, HUD BET $12.50, OVERBOOST badge lit, newest Bets row 12:15:42.

Twelve `antelite` rows fall between them, read verbatim off frame 04:

    12:15:27 +$6.10   12:15:28 +$3.00   12:15:30 +$2.00   12:15:31 $0.00
    12:15:33 $0.00    12:15:34 +$3.40   12:15:35 $0.00    12:15:37 $0.00
    12:15:38 $0.00    12:15:39 +$5.30   12:15:41 $0.00    12:15:42 +$916.00

Both frames are mid-animation, which the arithmetic has to carry rather than
ignore: the RGS settles a whole round at once and the client animates it
afterwards, so the newest row's credit is in the wallet before it is on screen,
or not yet, depending on where the animation has reached. Modelling frame 03 as
"the 12:13:48 credit of +$874.70 not yet applied" and frame 04 as "the 12:13:48
credit applied, the 12:15:42 credit of +$916.00 not yet applied":

    821.54  +  874.70  +  19.80  -  150.00  =  1,566.04

where 19.80 is the eleven settled credits from 12:15:27 to 12:15:39 and 150.00
is twelve debits. The observed balance is $1,566.04. The residual is 0.00.

    150.00 / 12 = 12.50 per spin = 1.25 x the $10.00 bet level

The competing hypothesis, that the debit is the $10.00 the Bets page COST column
shows, requires 12 x 10.00 = 120.00 and leaves a residual of 30.00. It is
refuted.

**Second window, independent row set.** Frame
`01_hud_bet_1250_overboost_on_balance_103474.png` (BALANCE $1,034.74, taken
before any `antelite` row exists, newest row 12:11:57 `base`) to frame 03
(BALANCE $821.54). Forty rows are legible across frames 02 and 03; the seven
seconds from 12:13:16 to 12:13:22 are not visible in any capture, so that
segment carries `n` unknown rows and `c` unknown credits. Solving:

    at 12.50 per spin:  c - 12.5n = -59.30   satisfied by n=6, c=15.70 or n=7, c=28.20
    at 10.00 per spin:  c - 10n   = -159.30  needs n=16 in a 7 second gap, or c<0

The observed row cadence elsewhere in this session is one row per 1 to 2
seconds, so n is 5 to 7. The 10.00 hypothesis has no admissible solution. The
12.50 hypothesis has two, both ordinary.

Per convention (l.4) the two windows are NOT fully independent: they share frame
03. What they do not share is the row set, and the second window refutes the
10.00 hypothesis on a cadence argument the first window never uses.

## bonus, 100x

Frames `reports/screens/dtt-live-2026-07-26/41_...png` (BALANCE $49,917,330.00)
to `42_after_three_bonus_buys_balance_reconciles.png` (BALANCE $49,972,875.00).
Observed delta +$55,545.00.

Rows between, read verbatim off frame 42, with the HUD BET at $1,000.00 for the
`base` rows and $500.00 for the three buys:

    06:21:10 base  +$310.00      06:21:12 base  $0.00
    06:21:14 base  $0.00         06:21:15 base  $0.00
    06:21:17 base  $0.00
    06:21:41 bonus +$44,760.00   06:22:00 bonus +$21,125.00
    06:22:20 bonus +$144,350.00

    debits  = 5 x $1,000.00  +  3 x (100 x $500.00)  =  $5,000.00 + $150,000.00 = $155,000.00
    credits = 310 + 44,760 + 21,125 + 144,350                                   = $210,545.00
    net     = 210,545.00 - 155,000.00                                           = +$55,545.00

Residual 0.00.

## super, 400x

Frames `reports/screens/dtt-live-2026-07-26/46_TR068_win_57215_while_balance_falls_142785.png`
(BALANCE $49,830,090.00) to `48_final_balance_48916485_reconciles_exactly.png`
(BALANCE $48,916,485.00). Observed delta -$913,605.00.

Rows between, read verbatim off frame 48, HUD BET $500.00 for the first two and
$1,000.00 for the last two:

    06:23:59 super +$72,800.00    06:24:31 super +$50,395.00
    06:24:51 super +$60,270.00    06:25:18 super +$102,930.00

    debits  = 2 x (400 x $500.00) + 2 x (400 x $1,000.00) = $400,000.00 + $800,000.00 = $1,200,000.00
    credits = 72,800 + 50,395 + 60,270 + 102,930                                      =   $286,395.00
    net     = 286,395.00 - 1,200,000.00                                               =  -$913,605.00

Residual 0.00.

Single-round corroboration inside frame 46 alone: the row 06:23:26 `super` pays
+$57,215.00 at a $500.00 bet level, and 400 x 500 - 57,215 = 142,785, which is
the balance fall the frame's own filename records and TR-068 was raised about.

## cruise, 1.0x, CONFIRMED AT DISPLAY LEVEL, wallet delta not measured

The owner's second intake supplied
`reports/screens/screenshot-analyst-2026-07-26/12_cruise_badge_bet_1000_matches_cost_column.png`,
the first `cruise` evidence in the repository, plus fifty `cruise` rows in the
updated `Math Distribution & Summary .docx` spanning 15:01:56 to 15:03:37 at two
bet levels.

In the capture, read verbatim: HUD BALANCE `EUR 921.50`, WIN `EUR 0.00`, BET
`EUR 10.00`, the `CRUISE` badge lit above the BET box, and every Bets row
reading `cruise EUR 10.00`.

The argument, and it is an argument rather than a measurement:

    the HUD BET box renders the EFFECTIVE debit          established at SA-001
    the platform COST column carries the BET LEVEL       established at SA-002
    both read EUR 10.00 in this frame
    therefore effective debit equals bet level, so the multiplier is 1.0

Corroborating detail across the fifty docx rows: every MULT equals payout
divided by COST, and both bet levels present, `EUR 1.00` and `EUR 10.00`, behave
identically. Neither of those is independent of the argument above, and per
convention (l.4) that is said rather than implied.

**What is still missing is a wallet delta.** The other four modes were proven by
differencing two BALANCE readouts across a known row set. `cruise` has exactly
one balance anchor, `EUR 921.50`, and no second frame, so the differencing
cannot be done. This is the last remaining gap in the mode-cost table, and one
short `cruise` run with a session panel captured before and after closes it
properly.

## What the COST column actually means

Across all three non-unit modes the platform Bets page COST column reads the BET
LEVEL, never the effective debit:

| frame | mode | COST column | true debit | ratio |
| --- | --- | --- | --- | --- |
| `screenshot-analyst-2026-07-26/02_...png` | antelite | $10.00 | $12.50 | 1.25 |
| `dtt-live-2026-07-26/43_...png` | bonus | $500.00 | $50,000.00 | 100 |
| `dtt-live-2026-07-26/48_...png` | super | $1,000.00 | $400,000.00 | 400 |

This is one consistent platform convention, not a per-mode fault, and the bet
detail drawer visible in `dtt-live-2026-07-26/48_...png` carries `Cost (USD)`
and `Cost multiplier` as separate fields, which is where the multiplier is
expected to appear. The consequence to keep in view is that the MULT column is
therefore against the bet level too: an `antelite` row reading x91.60 is x73.28
against what the player actually spent.
