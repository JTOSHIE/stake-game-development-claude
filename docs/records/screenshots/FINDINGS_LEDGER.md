# Screenshot analyst findings ledger

Owned by `track/screenshot-analyst`. This track never writes
`REVIEW_TRACKER.md`; the integrator promotes rows from here.

Every row is tagged DEFECT, ANOMALY or NOT-A-DEFECT, carries one line of
reasoning, a severity, and the capture paths that are its evidence. NOT-A-DEFECT
rows are kept rather than deleted: a question that has been answered and closed
is worth as much to the next reviewer as an open one, and several of these are
answers to questions the owner actually asked.

Severity scale: HIGH blocks submission, MEDIUM must be resolved before
submission, LOW is cosmetic but still binds under THE STANDING MANDATE, which
has no minor-defer category. PROCESS rows are about how the work is run rather
than about the game.

---

## SA-001  NOT-A-DEFECT  severity n/a  THE ANTELITE QUESTION, part 1

**The HUD BET readout DOES show the 1.25x effective figure while OVERBOOST is
toggled on.** Frame 01 reads BET `$12.50` against a `$10.00` bet level, and
frames 03 and 04 read the same `$12.50` with the `OVERBOOST` badge lit. The
brief's condition for a DEFECT finding, a HUD readout not showing the effective
figure, is not met.

Specification agrees: `HudOverlay.svelte:228` computes
`effectiveCost = spinCostMicros($betAmount, $standingMode)` and line 257 formats
that, not `$betAmount`, into the BET plate. The comment at lines 222 to 227
states the intent in exactly the owner's terms.

Evidence `reports/screens/screenshot-analyst-2026-07-26/01_hud_bet_1250_overboost_on_balance_103474.png`,
`03_freespins_12_intro_balance_82154_bet_1250.png`,
`04_freespins_8_intro_balance_156604_proves_1250_debits.png`.

## SA-002  ANOMALY  severity MEDIUM  THE ANTELITE QUESTION, part 2, the surface

**The owner's observation matches the Stake Engine dashboard Bets page, not our
HUD.** Its COST column reads `$10.00` on every `antelite` row while the true
debit is `$12.50`. The same column reads `$500.00` on a `bonus` row whose debit
is `$50,000.00` and `$1,000.00` on a `super` row whose debit is `$400,000.00`,
so this is one platform convention (COST carries the bet level) applied
uniformly, not an `antelite` fault and not something our frontend renders.

Not ours to fix, and raised rather than ruled on per convention (l.8). What the
integrator should decide is whether it needs saying to the platform before
submission, because a reviewer reading the Bets page alone will underestimate
spend on every non-unit mode. The platform's own bet detail drawer carries
`Cost (USD)` and `Cost multiplier` as separate fields, which is where the
distinction is presumably meant to live.

Evidence `reports/screens/screenshot-analyst-2026-07-26/02_bets_page_antelite_cost_1000_not_effective_1250.png`,
`reports/screens/dtt-live-2026-07-26/43_bets_panel_bonus_rows_cost_column.png`,
`reports/screens/dtt-live-2026-07-26/48_final_balance_48916485_reconciles_exactly.png`.

## SA-003  NOT-A-DEFECT  severity n/a  THE ANTELITE QUESTION, part 3, the debits

**Every `antelite` balance delta proves an exact 1.25x debit.** Frames 03 to 04
close to a residual of 0.00 at `$12.50` per spin and fail by `$30.00` at
`$10.00`. Frames 01 to 03 admit `$12.50` and refute `$10.00`, which would need
sixteen rows in a seven second gap against an observed cadence of one row per
one to two seconds. The wallet is charging what the HUD shows.

Working in `reports/qa/live_stats/2026-07-26_mode_cost_reconciliation.md`.
Evidence as SA-001.

## SA-004  NOT-A-DEFECT  severity n/a  `bonus` debits exactly 100x

Frames 41 to 42 close to a residual of 0.00 with three buys at
`100 x $500.00` and five `base` spins at `$1,000.00`, against an observed delta
of `+$55,545.00`.

Evidence `reports/screens/dtt-live-2026-07-26/41_session_524_base_spins_balance_reconciles.png`,
`42_after_three_bonus_buys_balance_reconciles.png`.

## SA-005  NOT-A-DEFECT  severity n/a  `super` debits exactly 400x

Frames 46 to 48 close to a residual of 0.00 across four `super` rounds, against
an observed delta of `-$913,605.00`. Single-round corroboration inside frame 46:
`400 x 500 - 57,215 = 142,785`, the fall TR-068 was raised about.

Evidence `reports/screens/dtt-live-2026-07-26/46_TR068_win_57215_while_balance_falls_142785.png`,
`48_final_balance_48916485_reconciles_exactly.png`.

## SA-006  ANOMALY  severity LOW  `cruise` cost is unproven by any capture

No capture in `reports/screens/` shows a `cruise` row in the Bets panel or a
`cruise` badge on the HUD, so four of five modes are confirmed live and the
fifth is not. There is no reason to doubt it: `fsModes.ts:72` declares 1.0 and
the platform Math page lists `cruise 1x`. It is recorded as unproven rather than
assumed, per convention (l.6).

Closing it costs one short `cruise` autospin run with a session panel captured
before and after.

Evidence: absence. Searched all 54 committed capture sets.

## SA-007  ANOMALY  severity LOW  the platform MULT column is against the bet level

Consequence of SA-002, recorded separately because it is the figure a reviewer
is most likely to quote. An `antelite` row reading `x91.60` is `x73.28` against
what the player actually spent. No cap is breached in either reading: the
largest multiplier anywhere in the evidence is `x321.75`, and even a 5,000x row
on `antelite` would be 4,000x against spend.

Evidence `reports/screens/screenshot-analyst-2026-07-26/04_freespins_8_intro_balance_156604_proves_1250_debits.png`.

## SA-008  ANOMALY  severity LOW  win-line strip sits on the reel frame border

The per-line win strip under the reels (`L1 x5 2ways $50.00`, `L3 x4 1ways
$2.00`) renders on the reel frame's bottom border rather than clear of it. It is
legible in both frames and nothing is cut off, so this is crowding rather than
clipping. Tagged ANOMALY rather than DEFECT for that reason, and left at LOW
because the STANDING MANDATE removes the minor-defer category but keeps severity
as the ordering key.

The measurement duty 5 asks for was not taken: the overlap was read at display
size, not at the capture's native resolution. Whoever picks this up should
measure it properly before deciding.

Evidence `reports/screens/screenshot-analyst-2026-07-26/03_freespins_12_intro_balance_82154_bet_1250.png`,
`04_freespins_8_intro_balance_156604_proves_1250_debits.png`.

## SA-009  NOT-A-DEFECT  severity n/a  em dash in the platform Bets MULT column

Every zero-payout row renders an em dash. It is the Stake Engine dashboard's own
glyph in the dashboard's own panel, outside our source tree and outside the
repository's dash gate, so it is not a regression of the 2026-07-26 style purge.
Recorded because it is visible in captures of our game page and someone will
otherwise raise it.

Evidence `reports/screens/screenshot-analyst-2026-07-26/02_bets_page_antelite_cost_1000_not_effective_1250.png`.

## SA-010  NOT-A-DEFECT  severity n/a  EUR frames are not closeable, and that is expected

Frames 07, 08 and 09 are three separate EUR windows with no shared balance
anchor and no opening balance in evidence, so their timeline cannot be
reconciled. That is a property of what was captured, not a discrepancy. The
frames are internally consistent and are catalogued as such. No forced answer is
offered, per convention (l.6).

Evidence `reports/screens/screenshot-analyst-2026-07-26/07_eur_base_bet_1000_active_row_balance_49105000.png`,
`08_eur_mega_win_95200_95x_bet_balance_43816000.png`,
`09_eur_win_321750_x32175_balance_58950000.png`.

## SA-011  ANOMALY  severity MEDIUM  two platform statistics do not reconcile

The Stake Engine Math page property table carries `Simulation Count 100000`,
`Zero Payout Count 50564` and `Probability of Zero Win (%) 70.8870` together.
At face value the count implies 50.564%, and the two disagree by twenty points.

The likely explanation is weighted versus unweighted counting, which the
neighbouring `Non-Zero Weight Count 100000` and `Most Probable Simulation
Hit-Rate (%) 258.6861` both hint at. This track does not rule on it: convention
(l.8) sends anything touching the maths package to the owner and Fable as a
question with evidence attached. Note that `Zero Rate 70.89%` elsewhere on the
same page agrees with the probability, so two of the three published figures are
already mutually consistent and consistent with `CLAUDE.md:251`.

Evidence `Math Distribution & Summary .docx` on the owner's Desktop, ingested at
`reports/qa/live_stats/2026-07-26_math_distribution_summary_ingest.md`.

## SA-012  DEFECT  severity MEDIUM  committed evidence has been altered on disk

Four capture files in `reports/screens/scatter-anticipation/` differ from what is
committed at `HEAD`, as uncommitted working-tree modifications:

    trigger_3.png          worktree 819,124 bytes   HEAD 786,834 bytes
    trigger_4.png          worktree 822,658 bytes   HEAD 790,841 bytes
    trigger_5.png          worktree 825,216 bytes   HEAD 793,768 bytes
    trigger_5-reduced.png  worktree 838,151 bytes   HEAD 793,714 bytes

All four are still 1280 by 720, so this is a re-render of the same frames rather
than a resize. The modification timestamp is 2026-07-26 01:11:23, which predates
this session; this track did not make them and has not committed them.

Tagged DEFECT because evidence integrity is the point of `reports/screens/`:
convention (h) exists so an independent verifier can review rendering from the
repository, and that only works if the file in the repository is the file that
was captured. A silent re-render breaks the property whether or not the new
image is better.

It needs an owner or integrator decision, not a unilateral one: either commit
them as a new dated capture set with the reason recorded, or restore them with
`git checkout -- reports/screens/scatter-anticipation/`. This track cannot do
either, because that path is outside its manifest by design.

## SA-013  PROCESS  severity HIGH for the integrator  manifest collision, CI will fail

`docs/records/tracks/screenshot-analyst.manifest` declares
`reports/qa/live_stats/**`, which sits inside `track/quality-sweep`'s
`reports/qa/**`. The two manifests are therefore not disjoint, and
`node scripts/qa/locked_paths_gate.mjs --check-disjoint` fails as soon as this
track commits a file there, which it now has. Measured output is in the session
report.

It is not resolvable from this branch. The owner named `reports/qa/live_stats/**`
for duty 6, so narrowing it here would silently discard an assigned scope, and
`quality-sweep.manifest` is another track's file and out of scope for this
branch, so editing it would fail the very scope check it exists to enforce.

MULTI-TRACK rule 3 says overlap forces SEQUENCE, not a merge policy. It is free
to fix today because `track/quality-sweep` has zero commits and has not started.
Either narrow its `reports/qa/**` to the gate outputs it actually writes, or
record a sequence decision. One line on `main`, by the integrator.

## SA-014  NOT-A-DEFECT  severity n/a  HUD WIN lags its settled row, by design

Two readings that look like disagreements and are not:

- HUD WIN reads `$0.00` during a feature while the `TOTAL WIN` panel carries the
  running total. Consistent across frames 03 and 04, so it is behaviour: the HUD
  figure populates on round settle, the panel carries the feature's own tally.
- Frame 42 reads WIN `$142,184.65` against a settled row of `+$144,350.00`. That
  is the HUD count-up caught mid-flight, the documented behaviour at
  `HudOverlay.svelte:263`, and the balance in the same frame already carries the
  full credit, which the 41 to 42 reconciliation confirms to the cent.

Evidence `reports/screens/screenshot-analyst-2026-07-26/03_...png`, `04_...png`,
`reports/screens/dtt-live-2026-07-26/42_after_three_bonus_buys_balance_reconciles.png`.

## SA-015  ANOMALY  severity LOW  a second maths package sits on the capture machine

`games/future_spinner_super/` exists untracked in the working tree, carrying its
own `game_config.py`, `gamestate.py`, `reels/` and `library/`. It is a second
maths package beside the shipping one, which `CLAUDE.md:209-218` says belongs on
its own branch and never on `main`, because that is the stale-artefact misread
that has previously cost a star at external audit.

It is untracked, so it is not on `main` and convention (o) keeps it out of the
staging bundle, which is built from a fresh clone. Contained, therefore, and
raised only because it lives on the machine the captures are taken from. Out of
this track's scope to move.

## SA-016  PROCESS  severity LOW  macOS capture filenames carry U+202F

Fifteen of the seventy-six loose PNG filenames on `~/Desktop` use a narrow
no-break space (U+202F) before `pm` or `am` rather than an ordinary space, which
is what current macOS writes. Any intake tooling that globs on `" pm.png"` will
silently miss them, and this pass hit exactly that: one capture failed to open by
its apparent path and had to be resolved through a glob.

Recorded so the next session of this track does not rediscover it.

---

## Summary for the integrator

| tag | count | rows |
| --- | --- | --- |
| DEFECT | 1 | SA-012 |
| ANOMALY | 6 | SA-002, SA-006, SA-007, SA-008, SA-011, SA-015 |
| NOT-A-DEFECT | 7 | SA-001, SA-003, SA-004, SA-005, SA-009, SA-010, SA-014 |
| PROCESS | 2 | SA-013, SA-016 |

**Wanting a decision before anything else:** SA-013, because CI on this pull
request fails until it is made, and it is one line while `track/quality-sweep`
is still unstarted.

**Wanting an owner or Fable ruling:** SA-002 and SA-007 (whether the platform
COST and MULT convention needs raising with the platform before submission),
SA-011 (a maths-adjacent statistics question, escalated per (l.8) rather than
answered), and SA-012 (restore or recommit the altered evidence).

**The owner's question, answered:** the HUD is right, the debits are right, and
the surface that disagrees is the platform's Bets page. SA-001, SA-002, SA-003.
