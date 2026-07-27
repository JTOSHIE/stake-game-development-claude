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

**RULING, 2026-07-28: DECLINED. The convention is not raised with the platform before
submission.** Relayed by the owner as Fable's ruling on comms 020 decision 5.

**A note on how this is recorded, per convention (l.7).** The verbatim ruling text was not
supplied to this session, so what follows is NOT a quotation of Fable and is not presented as
one. It is the case the repository's own evidence makes for the decision, written so a future
reader can see the decision was supported rather than merely asserted. If the verbatim
reasoning is supplied later, it supersedes this paragraph.

**What the evidence supports.**

1. **It is not our defect to report.** The COST column carries the bet level for every studio
   and every mode on the platform, and the platform publishes `costMultiplier` as its own
   separate field in the authenticate response. Ours is one of many games rendering into a
   convention that predates it.
2. **Nothing is understated to the player by OUR surfaces**, which is the part that would
   have made this urgent. The HUD BET plate renders the effective debit, the FEATURES header
   states `SPIN COST` beside `BET`, each mode card states its own multiplier and cash price,
   and the buy confirm dialog states the same price the card does. A player is told what a
   spin costs, in our chrome, before they spend.
3. **No limit is breached under either reading.** The 5,000x cap is measured against the bet
   level by both the platform and our own `WINCAP`, so the MULT column reading against the
   level rather than the spend changes no compliance figure.
4. **The money path is proven correct independently of the display**: four HUD balances
   reconciled to the cent across base, 100x and 400x, and three sessions solved for their
   opening balance twice, once under each competing reading, giving exact round openings under
   the true per-mode costs and nothing round under the alternative.

**What DECLINED does not mean.** It does not mean the observation was wrong or is discarded.
`docs/records/MONEY_DISPLAY_EXPLAINED.md` remains the owner-facing page, `GAME_FACTS.md`
section 3a remains the statement of record, and `SUBMISSION_DOSSIER.md` section 9d carries it
into the submission documents. If a reviewer raises it, the answer is already written and
evidenced. The decision is only that we do not open it with the platform first.

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

## SA-006  ANOMALY  severity LOW  `cruise` cost, now confirmed at display level

**UPDATED 2026-07-26, second intake.** The gap this row opened is mostly closed.

*As first written:* no capture in `reports/screens/` showed a `cruise` row in the
Bets panel or a `cruise` badge on the HUD, so four of five modes were confirmed
live and the fifth was not. Recorded as unproven rather than assumed, per
convention (l.6).

*Now:* the owner supplied
`reports/screens/screenshot-analyst-2026-07-26/12_cruise_badge_bet_1000_matches_cost_column.png`,
the first `cruise` evidence in the repository, and an updated
`Math Distribution & Summary .docx` carrying fifty `cruise` Bets rows at two bet
levels. In the capture the HUD BET reads `EUR 10.00` with the `CRUISE` badge lit
and the COST column reads `EUR 10.00`.

That closes the cost multiplier by a chain of two already-established results
rather than by a new measurement: the HUD renders the effective debit (SA-001)
and the COST column carries the bet level (SA-002), so the two being equal means
`cruise` resolves at 1.0. Across all fifty docx rows every MULT equals payout
over COST, and both bet levels present, `EUR 1.00` and `EUR 10.00`, behave the
same way.

**What is still not measured:** a wallet delta. Every other mode was proven by
differencing two BALANCE readouts; `cruise` has one balance anchor, `EUR 921.50`,
and no second. The inference above is sound but it is inference, and convention
(l.4) says to say which results it leans on rather than present it as
independent. One short `cruise` run with a session panel before and after still
closes it properly, and it is now the only such gap left.

Evidence `reports/screens/screenshot-analyst-2026-07-26/12_cruise_badge_bet_1000_matches_cost_column.png`,
`reports/qa/live_stats/2026-07-26b_bets_page_all_modes_126_rows.json`.

## SA-007  ANOMALY  severity LOW  the platform MULT column is against the bet level

**RULING, 2026-07-28: DECLINED. The convention is not raised with the platform before
submission.** Relayed by the owner as Fable's ruling on comms 020 decision 5.

**A note on how this is recorded, per convention (l.7).** The verbatim ruling text was not
supplied to this session, so what follows is NOT a quotation of Fable and is not presented as
one. It is the case the repository's own evidence makes for the decision, written so a future
reader can see the decision was supported rather than merely asserted. If the verbatim
reasoning is supplied later, it supersedes this paragraph.

**What the evidence supports.**

1. **It is not our defect to report.** The COST column carries the bet level for every studio
   and every mode on the platform, and the platform publishes `costMultiplier` as its own
   separate field in the authenticate response. Ours is one of many games rendering into a
   convention that predates it.
2. **Nothing is understated to the player by OUR surfaces**, which is the part that would
   have made this urgent. The HUD BET plate renders the effective debit, the FEATURES header
   states `SPIN COST` beside `BET`, each mode card states its own multiplier and cash price,
   and the buy confirm dialog states the same price the card does. A player is told what a
   spin costs, in our chrome, before they spend.
3. **No limit is breached under either reading.** The 5,000x cap is measured against the bet
   level by both the platform and our own `WINCAP`, so the MULT column reading against the
   level rather than the spend changes no compliance figure.
4. **The money path is proven correct independently of the display**: four HUD balances
   reconciled to the cent across base, 100x and 400x, and three sessions solved for their
   opening balance twice, once under each competing reading, giving exact round openings under
   the true per-mode costs and nothing round under the alternative.

**What DECLINED does not mean.** It does not mean the observation was wrong or is discarded.
`docs/records/MONEY_DISPLAY_EXPLAINED.md` remains the owner-facing page, `GAME_FACTS.md`
section 3a remains the statement of record, and `SUBMISSION_DOSSIER.md` section 9d carries it
into the submission documents. If a reviewer raises it, the answer is already written and
evidenced. The decision is only that we do not open it with the platform first.

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

**RESOLVED AND LANDED 2026-07-26**, by the integrator, as commit `4f5ab47`
"docs(JOB 4, SA-012): the modified evidence, restored and ruled on". The four
files were restored from `HEAD`, and the cause was found: `anticipation_proof.mjs`
line 19 pointed its screenshot output at the committed evidence directory
itself, so every re-run of the proof script rewrote committed evidence in place.

The ruling generalises further than this row did. A new convention (h.1) now
says proof and gate scripts write to scratch paths only, and committed evidence
directories are never written outside a job that explicitly regenerates
evidence. The integrator records the same pattern in `layout_fit_gate` and
`contrast_gate`, with migrating those writers noted as open work.

Closed, and better closed than this row asked for: this track reported an
altered file, and the answer found the mechanism that alters files.

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

**RESOLVED AND LANDED 2026-07-26**, by the integrator, as commit `e73b18f`
"fix(JOB 3, SA-013): quality-sweep releases the analyst's live_stats subtree".
`quality-sweep.manifest` now reads `reports/qa/*` in place of `reports/qa/**`.
Because `*` matches exactly one path segment, that covers every gate output
written directly into `reports/qa/` while excluding every subtree, `live_stats`
included.

Verified rather than assumed: `main` was merged into this branch and the gate
re-run.

    node scripts/qa/locked_paths_gate.mjs --check-disjoint
      DISJOINT: 3 manifest(s), 2518 tracked file(s), 0 file collision(s), 0 shared glob(s)

Closed. Nothing further is needed from this row.

## SA-017  NOT-A-DEFECT  severity n/a  the 5,000x wincap fired live, exactly at the cap

The single most significant event in the evidence base, and the first time the
repository has caught it. A `super` round at a `EUR 750.00` bet level paid
`EUR 3,750,000.00`, and `3,750,000 / 750 = 5,000.00` exactly. The platform's own
row reads `x5000.00`.

At the cap, not through it. `WINCAP` is 5,000 at `gameStore.ts:8` and
`CLAUDE.md:250` calls it a hard cap in every mode. Duty 6's anomaly test is "any
payout above 5,000x bet"; nothing anywhere in the 126 ingested rows exceeds it,
and this row lands on it.

Worth noting what the cap is measured against, because it matters for a buy
tier: 5,000x is against the BET LEVEL, so this round paid 12.5x what it actually
cost (`3,750,000 / (400 x 750)`). Both `gameStore.ts:158` and
`roundInterpreter.ts:265` compute the wincap flag against the bet level, so the
game and the platform agree.

Evidence `reports/screens/screenshot-analyst-2026-07-26/10_eur_max_win_3750000_exactly_5000x_at_bet_750.png`,
`11_bets_panel_super_5000x_wincap_row_and_buy_tiers.png`.

## SA-018  ANOMALY  severity MEDIUM  no capture of the max-win celebration exists

The wincap has now demonstrably fired in live play, and the repository has no
capture of `MaxWinCelebration.svelte` on screen anywhere. Frame 10 is the
aftermath: reels at rest, `WIN EUR 3,750,000.00` in the HUD, no overlay, taken
twelve seconds after the round settled.

Specification says it should have shown. `App.svelte:362` and `:618` both
describe the overlay as already showing, reactive to `$isWincap`, and
`$isWincap` is set against the bet level, which this round cleared exactly. So
the expected reading of frame 10 is that the overlay fired and was collected
inside those twelve seconds.

**That is inference, not observation, and it is not good enough for a
submission-facing claim.** Per convention (l.6) it is parked rather than
concluded either way. The fix is one capture: hit or replay a wincap round and
photograph the overlay before pressing COLLECT. Bet Replay is mandatory and
already working (`reports/screens/dtt-live-2026-07-26/37_REPLAY_WORKING_event_52121_with_disclaimer.png`),
and `ReplayMode.svelte:266` renders the same component, so the round can be
replayed from its event id rather than waited for again.

Evidence `reports/screens/screenshot-analyst-2026-07-26/10_eur_max_win_3750000_exactly_5000x_at_bet_750.png`.

## SA-019  ANOMALY  severity LOW  scene visible through unfilled reel cells mid-spin

In the `cruise` capture, taken mid-spin, reels 1 and 2 are populated, reel 3
holds two symbols and reels 4 and 5 hold one each, and the city scene behind the
game is visible through the cells not yet filled. Reels populating left to right
is ordinary; the question is whether the reel viewport is meant to be
translucent while it does so.

Not called a DEFECT, because there is no settled-state capture at the same
viewport to compare against, and the game's whole aesthetic is a translucent
neon frame over a city scene. What makes it worth a row is that the idle board
in frame 10 is fully opaque across all twenty cells, so the two states do
differ, and a reviewer scrubbing a spin will see the difference.

One settled-state capture at the same viewport settles it.

Evidence `reports/screens/screenshot-analyst-2026-07-26/12_cruise_badge_bet_1000_matches_cost_column.png`,
compared against `10_eur_max_win_3750000_exactly_5000x_at_bet_750.png`.

## SA-020  NOT-A-DEFECT  severity n/a  the authenticated bet ladder is live, confirmed

The second intake's rows carry bet levels of `EUR 450.00`, `EUR 500.00`,
`EUR 750.00` and `EUR 1,000.00`. None of those is in the hardcoded fallback
ladder, which is `[0.10, 0.20, 0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00,
100.00]` at `gameStore.ts:7` and tops out at 100.

So the game is driving from `rgsBetLevels`, the authenticated ladder, and not
from the hardcoded array. That is a positive live confirmation of the R5/TR-013
fix, which moved both bet-changing surfaces onto the non-locked
`stores/betLadder.ts` precisely so a non-USD-shaped ladder could not send
`indexOf` to -1 and drop the bet to the minimum. The failure mode recorded in
`CLAUDE.md` under LOCKED_FILE_DEBTS is not reachable in these sessions, and now
there is evidence of that rather than only a unit test.

Evidence `reports/qa/live_stats/2026-07-26b_bets_page_all_modes_126_rows.json`,
`reports/screens/screenshot-analyst-2026-07-26/11_bets_panel_super_5000x_wincap_row_and_buy_tiers.png`.

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

# Round 3, 2026-07-27 intake

## SA-021  DEFECT  severity HIGH  the mini strip cuts the BALANCE without an ellipsis, and the remainder reads as a smaller number

**A player holding EUR 479,710.00 is shown `BAL €479`.**

Frame `reports/screens/screenshot-analyst-2026-07-27/04_DEFECT_popout_s_balance_479710_renders_as_479.png`,
2026-07-27 02:31:05. The same wallet reads `€479,710.00` in
`05_narrow_pane_balance_479710_in_full_bet_1250.png` eleven seconds later and in
`03_desktop_v1_background_in_game_balance_479710_bet_1250.png` twenty four
seconds earlier, so the value is not in doubt and the difference is the profile.

**Measured on the shipped bundle rather than read off the picture.** Rebuilt at
355 by 226 with the owner's own balance through an intercepted authenticate:

    element text        "€479.7K"      <- the compact form was produced correctly
    data-fit-mode       compact
    data-fit-px         9.00           <- already at MINI_LEGIBLE_FLOOR_PX
    clientWidth         25
    scrollWidth         42             <- 17px of the string has nowhere to go

`frontend/src/lib/components/HudOverlay.svelte:989` sets
`.m-stat-value { overflow: hidden }` and the comment above it at `:984` states
there is deliberately no `text-overflow: ellipsis`, on the reasoning that the value is
shrunk and then abbreviated before anything is lost. **There is no third step.**
When the abbreviated form also fails to fit, `fitMoney` returns without another
lever and the box cuts the string in silence.

**Why this is worse than a truncation.** `formatBalanceCompact` truncates rather
than rounds precisely so an abbreviation can only ever understate
(`utils/currency.ts:238` and its comment). Cutting at the box edge breaks that
guarantee's whole point in a different way: `€479` is not an understatement a
player can recognise as one, it is a complete looking number three orders of
magnitude low. The same fault at
`reports/screens/live-round2-2026-07-26/08_DEFECT_popout_s_stage_small_and_right_anchored.png`
renders `€512.29` as `BAL €512.2`, which is the more dangerous form again.

**It is a REGRESSION WINDOW, not a reopened TR-066.** TR-066 is correctly closed
at 400 by 225, the profile Fable's ruling named, and this measurement confirms it:
at 400 wide the balance renders `€479.7K` whole with `clientWidth` 50 against
`scrollWidth` 50. The cut appears below about 390 css px and worsens as the pane
narrows. `mini_player_proof.mjs` tests one viewport, 400 by 225, so the class it
proves closed is closed only at that exact width.

    viewport width   rendered      clientW/scrollW   visible
    400              €479.7K       50 / 50           whole
    390              €479.7K       44 / 44           whole
    380              €479.7K       39 / 42           cut
    370              €479.7K       33 / 42           cut
    355              €479.7K       25 / 42           cut, reads as "€479"
    330              €479.7K       12 / 42           cut, reads as "€4"

**Escalated, not ruled on**, per convention (l.8): it is player money display.
The options are the same shape as TR-066's were and this track does not pick
between them: give the strip a fourth step below abbreviation; widen the balance
slot at the expense of WIN below 390px; or set a minimum pane width for the
profile. Any of them needs the proof widened past a single viewport first, per
convention (p), or the next narrowing will do this again.

Evidence `reports/screens/screenshot-analyst-2026-07-27/04_DEFECT_popout_s_balance_479710_renders_as_479.png`,
`05_narrow_pane_balance_479710_in_full_bet_1250.png`,
`annotated/A4_the_one_real_display_defect.png`,
`repro/repro_355x226_balance_479710_eur.png` and its two siblings,
`reports/screens/live-round2-2026-07-26/08_DEFECT_popout_s_stage_small_and_right_anchored.png`.

## SA-022  DEFECT  severity HIGH  Bet Replay renders player money with no separators and no currency symbol, and overflows its plate

`reports/screens/live-round2-2026-07-26/01_replay_22975_celebration_multiplier_5000x_win_3750000.png`
shows the neon instrument plate reading `MULTIPLIER  5000.0x` and
`WIN  3750000.00`. Both values render wider than the plate boxes that contain
them and spill across the pod art; the win figure also sits on the plate's top
edge rather than inside its window.

**The source, found by derivation rather than by eye.**
`frontend/src/lib/components/WinPod.svelte:5-6`:

    $: multText = $winMultiplier > 0 ? `${$winMultiplier.toFixed(1)}×` : ''
    $: amtText  = $winAmount > 0 ? $winAmount.toFixed(2) : ''

That is the **only** money `.toFixed(2)` anywhere in `frontend/src`; every other
occurrence in the tree is a CSS transform or a data attribute. It bypasses
`formatBalance`, so it carries no locale separators, no currency symbol and no
platform display metadata. In the same view the `MEGA WIN!!!` banner beside it
renders through `formatBalance` (`WinBanner.svelte:198`) and shows
`...0,000.00` with separators, so two money figures disagree about their own
format inside one frame. That is the STANDING MANDATE's inspection test failing
on its own named example, "decimal or currency formats that disagree".

The zones are fixed at `width: 99px` with `white-space: nowrap` and no fit
action (`WinPod.svelte:72` and `:92`), and their coordinates are commented
`(from Manus QC)`, so this is Manus era layout that the in-house pipeline never
revisited.

**Where it is reachable.** `WinPod` has exactly one consumer,
`ReplayMode.svelte:290`. It renders in **Bet Replay and nowhere else**. Bet
Replay is mandatory under the platform's own requirements and it is a surface a
reviewer will open deliberately, on a bet chosen for being large, which is
precisely the input that overflows the zone.

Severity HIGH for that reason rather than for the pixel count: the worse the win
being demonstrated, the worse this looks.

Escalated per (l.8), money display. Not fixed here; this track does not write
`frontend/`.

## SA-023  ANOMALY  severity LOW  a stray stroke is baked into the shipped car sprite

A hard dark near vertical stroke runs down the car's rear quarter panel in
`reports/screens/screenshot-analyst-2026-07-27/03_desktop_v1_background_in_game_balance_479710_bet_1250.png`,
crossing both the gold trim line and the magenta underglow and stopping dead in
the middle of the panel.

Not a compositing artefact of the live build: it is in the shipped asset.
`frontend/public/assets/themes/future-spinner/ui/scene_car.png`, 2840 by 1000
RGBA, carries it at column x 1864, a continuous darker than neighbours run from
y 263 to y 554, which is 29 per cent of the sprite height.

Tagged ANOMALY rather than DEFECT because it is not this track's call whether it
is a designed shut line or a leftover from the enhancement pass. Against it being
designed: a shut line follows the body contour and terminates at a panel edge,
and this one is straight and stops mid panel; and it crosses two lighting
elements that a real panel gap would sit under. The asset's own generation record
(`CLAUDE.md`, Assets) measures the enhanced car's bounding box as identical to the
original's, so nobody was looking at interior detail.

One question for the owner or the art owner, and it costs nothing to answer.

## SA-024  NOT-A-DEFECT  severity n/a  SA-002 is no longer an inference, the platform publishes the cost multiplier itself

`reports/screens/live-shapes-2026-07-26/04_authenticate_response_jurisdiction_TOP_LEVEL.png`
shows the platform's own authenticate response carrying a per mode table, two
entries of which are legible:

    "mode": "bonus",  "costMultiplier": 100, "maxBet": 1000000000
    "mode": "super",  "costMultiplier": 400, "maxBet": 1000000000

So the platform holds the bet **level** and the **cost multiplier** as two
separate fields, and renders the first of them in the Bets page COST column. That
converts `SA-002` from "one platform convention applied uniformly, inferred from
three modes agreeing" into an observed property of the payload, and it is the
answer the owner's question actually needed.

`reports/screens/screenshot-analyst-2026-07-27/02_play_response_antelite_amount_1000000000_is_bet_level_hud_1250.png`
completes it from the other end: `"amount": 1000000000` with `"mode":
"antelite"` while the HUD reads `€1,250.00` in the same frame.

Recorded as its own row rather than folded into `SA-002` because `SA-002` is
awaiting a Fable ruling and its evidence base changing is exactly the sort of
thing a ruling needs to be told about.

## SA-025  NOT-A-DEFECT  severity n/a  the max win overlay's thousands separator renders as a baseline square

`reports/screens/live-round2-2026-07-26/02_MAX_WIN_REACHED_overlay_5000x_bet_collect.png`
reads `5.000` `x` `BET` at a glance, which a European player would read as five.

It is a comma. `MaxWinCelebration.svelte:103` is the literal string `5,000`, with
no locale formatting anywhere near it, so no other glyph is reachable. Orbitron,
the brand display face, draws U+002C at this size as a square block sitting on
the baseline with no descending tail, which is what the capture shows at
sixteen times magnification.

Recorded rather than dropped for the same reason `SA-009` was: it looks like a
defect, someone will raise it, and the answer should already be written down. If
the owner decides the ambiguity is worth removing, that is a typography choice
about the display face, not a formatting bug.

## SA-026  ANOMALY  severity LOW  the Overdrive background variant is a magenta shift, and it is unproven in live play

Two halves, both from measurement.

**The variant is real and is the same city.** Measured on the shipped assets:
`bg_base.jpg` mean RGB `(56.23, 77.84, 97.32)` against `bg_overdrive.jpg`
`(56.90, 65.57, 97.12)`. The rendered proofs in
`reports/screens/background-adopted-2026-07-27/` differ over 489,162 of 810,000
pixels, so the crossfade is wired and the two states are genuinely different
frames.

**It is hotter in magenta, not in red.** The difference is almost entirely green
removed, 15.8 per cent of it, with red up 1.2 per cent and blue flat. Red minus
blue is `-41.09` before and `-40.22` after, unchanged to within one unit. The
brief's phrase was "same city, hotter light"; the first half is confirmed, the
second is true only in the magenta direction. A design call, raised rather than
ruled on.

**Not proven live.** No capture in this intake shows the Overdrive variant in
game: free spins appear in none of the eight new frames. Proven in the asset and
in the offline render, unproven in play. One paired capture closes it, same
window and same size, one frame in base play and one during Overdrive Free Spins.

## SA-018  UPDATED AND CLOSED 2026-07-26  the max win celebration now has a capture

This row recorded that the wincap had demonstrably fired in live play and that
the repository held no capture of `MaxWinCelebration.svelte` on screen anywhere,
and it named the fix: replay the wincap round from its event id and photograph
the overlay before pressing COLLECT.

**That is exactly what happened.** `reports/screens/live-round2-2026-07-26/02_MAX_WIN_REACHED_overlay_5000x_bet_collect.png`,
2026-07-26 19:59:41, is the overlay on screen with `MAX WIN REACHED!`, the
`5,000` `x` `BET` figure and the un pressed `COLLECT` button, from a Bet Replay
of `super` event 22975 at amount 750 EUR. A second capture of the same overlay
exists at `reports/screens/replay-blocker/05_super_wincap_maxwin_celebration.png`.

Closed. The inference this row refused to accept is now an observation.

## SA-008  UPDATED 2026-07-27  the win strip measurement, taken at last

This row recorded that the per line win strip renders on the reel frame's bottom
border and that "the measurement duty 5 asks for was not taken".

Taken now, at native capture resolution, on
`reports/screens/screenshot-analyst-2026-07-27/08_local_dev_v1_background_win_21228_bet_100.png`:
the strip's lower edge and the reel frame's inner neon border are coincident, and
the silver frame rail begins about 16 native px below that, which is roughly
8 css px at this capture's scale. The strip text `M2  x3  1 ways  $0.30` is clear
of every edge and nothing is cut off.

So the row's own reading was right: crowding, not clipping. It stays ANOMALY at
LOW with a measurement behind it instead of an impression.

---

## Summary for the integrator

Updated 2026-07-27, round 3.

| tag | count | rows |
| --- | --- | --- |
| DEFECT | 3 | **SA-021 (HIGH, open)**, **SA-022 (HIGH, open)**, SA-012 (resolved) |
| ANOMALY | 9 | SA-002, SA-006, SA-007, SA-008, SA-011, SA-015, SA-019, **SA-023**, **SA-026** |
| NOT-A-DEFECT | 12 | SA-001, SA-003, SA-004, SA-005, SA-009, SA-010, SA-014, SA-017, SA-018 (closed), SA-020, **SA-024**, **SA-025** |
| PROCESS | 2 | SA-013 (resolved), SA-016 |

**PROMOTE FIRST, both new, both HIGH, both player money display and therefore
both escalated under convention (l.8) rather than ruled on here:**

- **SA-021**, the mini strip cuts the BALANCE without an ellipsis below about
  390 css px, so `EUR 479,710.00` renders as `EUR 479`. Reproduced from the
  shipped bundle with the failing measurement recorded. TR-066 is correctly
  closed at the one viewport it was proven at, 400 by 225; this is the window
  below it, and the proof tests one width.
- **SA-022**, `WinPod.svelte` renders player money with `.toFixed(2)`, the only
  money `.toFixed` left in `frontend/src`, so Bet Replay shows
  `3750000.00` with no separators and no currency symbol, overflowing a fixed
  99px Manus era zone, beside a banner that formats correctly in the same frame.
  Bet Replay is a mandatory surface and the defect scales with the size of the
  win being demonstrated.

**Closed this round:** SA-018, by
`reports/screens/live-round2-2026-07-26/02_MAX_WIN_REACHED_overlay_5000x_bet_collect.png`,
which is the capture that row asked for, obtained the way that row proposed.

**Closed previously, by the integrator:** SA-013 as `e73b18f`; SA-012 as
`4f5ab47`.

**Wanting an owner or Fable ruling:** SA-002 and SA-007 (whether the platform
COST and MULT convention needs raising with the platform before submission,
now with SA-024's stronger evidence behind it), SA-011 (a maths-adjacent
statistics question), SA-023 (is the stroke on the car a shut line or a
leftover), SA-026 (is a magenta shift the intended Overdrive reading).

**Wanting one capture each, and cheap:** SA-006 (a `cruise` session panel before
and after, still the only mode never proven by a wallet delta), SA-019 (a
settled-state frame at the `cruise` viewport), SA-026 (one paired base and
Overdrive frame at the same window size), and the open `02:27:04 to 02:30:41`
leg of this round's timeline (a Bets panel with COST and PAYOUT visible beside
the BALANCE readout).

**The owner's question, answered again and this time from the platform's own
payload:** the HUD is right, the debits are right, and the surface that
disagrees is the platform's Bets page, which renders the bet LEVEL because the
platform stores level and cost multiplier as two separate fields. SA-001,
SA-002, SA-003, SA-024, and the owner-facing page at
`docs/records/MONEY_DISPLAY_EXPLAINED.md`.

**The headline from round 3:** three independent sessions, at three bet levels,
on two days, each close to a residual of 0.00 against a round platform opening
balance under the true per-mode costs, and to an arbitrary one under the COST
column reading. The bet size is not the defect. The balance readout in the
smallest popout is.
