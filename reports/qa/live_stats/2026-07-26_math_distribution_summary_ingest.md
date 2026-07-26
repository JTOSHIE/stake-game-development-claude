# Stake Engine Math Distribution and Summary, ingested 2026-07-26

Track: `track/screenshot-analyst`, duty 6 and first-session assignment (C).

## Source, and why it is quotable

The owner supplied `Math Distribution & Summary .docx` on `~/Desktop` (note the
space before the extension in the real filename). It is a Word export of the
live Stake Engine dashboard page for
`stake-engine.com/teams/we-roll-spinners/games/future-spinner`, Math tab,
Version 1, plus the Bets tab beneath it.

Convention (m) requires an external document to physically exist before work
cites it. It does: the file is on the owner's Desktop, which
`.claude/settings.json` lists under `additionalDirectories`, and it was read
directly rather than described. Its Bets table is committed as structured data
at `reports/qa/live_stats/2026-07-26_bets_page_eur_base_50_rows.json`.

The document is NOT an independent second source for the platform figures also
visible in captures. Convention (l.4): the docx and
`reports/screens/screenshot-analyst-2026-07-26/09_eur_win_321750_x32175_balance_58950000.png`
render the same dashboard page for the same session, and its top row 14:10:32
matches the document's row 1 exactly. Agreement between them confirms
transcription, nothing more.

## The brief's question: has SPIN information changed

**No.** Every figure the platform publishes that the repository also asserts
agrees. Quoted verbatim from the document, checked against
`CLAUDE.md` "True game facts" and `frontend/src/lib/config/fsModes.ts`:

| platform figure | document | repository | agree |
| --- | --- | --- | --- |
| RTP, all five modes | `96.35%` | 96.3500% at 4dp, CLAUDE.md:249 | yes |
| max win | `MAX 5,000x` every mode | 5,000x hard cap every mode, CLAUDE.md:250 | yes |
| base hit rate | `HIT 29.11%` | 29.11%, CLAUDE.md:251 | yes |
| base volatility | `Std Dev 17.2841`, `Volatility 17.28 HIGH` | weighted SD 17.28x, CLAUDE.md:251 | yes |
| rounds per mode | `Outcomes 100,000`, `Simulation Count 100000` | 100,000 per mode, CLAUDE.md:250 | yes |
| wincap frequency | `Max Win Hit-Rate 100000.0006` | 1 in 100,000, CLAUDE.md:252 | yes |
| `base` cost | `base 1x` | `cost: 1.0`, fsModes.ts:63 | yes |
| `cruise` cost | `cruise 1x` | `cost: 1.0`, fsModes.ts:72 | yes |
| `antelite` cost | `antelite 1.25x` | `cost: 1.25`, fsModes.ts:85 | yes |
| `bonus` cost | `bonus 100x` | `cost: 100`, fsModes.ts:97 | yes |
| `super` cost | `super 400x` | `cost: 400`, fsModes.ts:107 | yes |

The five mode costs in the brief's duty 4 (base 1x, cruise 1x, antelite 1.25x,
bonus 100x, super 400x) are therefore confirmed against the platform's own
published figures as well as against the shipped config.

## What the document adds that the repository does not already carry

New, and worth promoting into `GAME_FACTS.md` by the integrator if it wants
them (this track does not write that file):

- Per-mode hit rate beyond `base`: `cruise HIT 43.86%`, `antelite HIT 29.44%`,
  `bonus HIT 100.00%`, `super HIT 100.00%`.
- Per-mode break-even column: `base B/E 97.0%`, `cruise 95.9%`,
  `antelite 97.3%`, `bonus 76.5%`, `super 71.8%`.
- Per-mode volatility band: `base HIGH`, `cruise MEDIUM`, `antelite HIGH`,
  `bonus LOW`, `super LOW`. All five read `Compliant`.
- Streak figures: `Avg Spins Between Any Win 3 spins`, `Worst-Case Zero Streak
  20 spins` at 1 in 1,000, `Avg spins between profit 33 spins`, `Worst-Case Loss
  Streak 224 spins` at 1 in 1,000.
- Outcome breakdown: `Dead 70.9%`, `Sub-bet 26.1%`, `Win 3.0%`.
- Bet-level compliance headroom, quoted as `achieved / limit`:
  `Max Payout Multiplier 5,000.0/ 25,000.0` at 2 star and `5,000.0/ 100,000.0`
  at 3 star; `Cost Multiplier 400.0/ 1,000.0` at 2 star and `400.0/ 1,500.0` at
  3 star; `Max Bet Cost 80,000.0/ 100,000.0` at 2 star and
  `400,000.0/ 500,000.0` at 3 star; `Tail Probability (5,000x) 0.003/ 0.010`;
  `Risk Limit (CVaR) 205.710/ 700.000`; `Expected Tail Liability (ETL Sum)
  0.641/ 1.300`. Every constraint is inside its limit at both star levels.
- `Compliance per mode (base) 6/6`, all six checks passing, including
  `Cross-Mode RTP Consistency ... Result: 0.00% variance`.

Note the `Cost Multiplier 400.0` row: the platform reads the game's top cost
multiplier as 400, which is `super`. That is the platform agreeing that `super`
costs 400x, from a different part of its own product to the Bets page.

## Anomaly raised, not ruled on

`Zero Payout Count 50564` sits in the same property table as
`Probability of Zero Win (%) 70.8870` and `Simulation Count 100000`. Taken at
face value the count implies 50.564%, and the two do not reconcile.

The likely explanation is that the count is over unweighted simulation rows
while the probability is weighted, which the neighbouring
`Non-Zero Weight Count 100000` and `Most Probable Simulation Hit-Rate (%)
258.6861` both hint at. This track does not rule on it: convention (l.8) sends
anything touching the maths package to the owner and Fable as a question with
evidence attached, and that is what this paragraph is. It is logged as SA-011 in
`docs/records/screenshots/FINDINGS_LEDGER.md`.

`Zero Rate 70.89%` in the Detailed Metrics block agrees with the 70.8870%
probability, so whichever reading is right, two of the three published figures
already agree with each other and with `CLAUDE.md`.

## Bets tab, reconciled

Fifty rows, all mode `base`, all COST `EUR 1,000.00`, all status `Settled`,
window 14:09:25 to 14:10:32 local.

    sum of COST column        EUR  50,000.00
    sum of PAYOUT             EUR 362,290.00
    net                       EUR +312,290.00
    zero-payout rows          36
    paying rows               14
    largest multiplier        x321.75

Checks run, all clean:

- No payout above 5,000x bet. Largest is x321.75.
- No debit disagreeing with its mode cost. Every row is `base` at 1.0x and every
  COST reads 1,000.00, so COST and debit coincide for this set.
- No settlement gap. Zero rows in any state other than `Settled`.
- Every stated MULT equals payout divided by COST to within 0.005 across all
  fifty rows, checked programmatically.

No RTP verdict is issued and none may be inferred from the net figure above.
Fifty rows carry no inferential weight against a 100,000 round certification,
and the committed statistics note stands: RTP is not verifiable by play.
