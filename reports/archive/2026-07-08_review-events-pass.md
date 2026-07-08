# Session Report: REVIEW_EVENTS pass - statelessness proof + five-mode replay event IDs

- **Date:** 2026-07-08
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/review-events-pass` (off up-to-date `main`, in a dedicated worktree at
  `/Users/jt/math-sdk-reviewevents`).
- **Source:** Fable's 2026-07-07 verdict, sequencing item after the dossier/copy update:
  "commit the statelessness artefact... proving cruise/antelite/super are stateless from
  the actual shipped books, and the per-mode Bet Replay event IDs for cruise/antelite/super."

## Lock exception used (per convention e)
Regenerating cruise/antelite/super's book files required running `games/future_spinner/run.py`,
which writes into the locked `games/future_spinner/**` path - the books themselves are
gitignored build artifacts, not present on disk in a fresh worktree. Asked the user for
explicit sanction before proceeding (not something already covered by the standing
autonomy posture, since it's outside the deny-rule boundary); user approved. Temporarily
removed the `Edit(games/future_spinner/**)`/`Write(games/future_spinner/**)` deny lines in
`.claude/settings.json` (working-tree only), ran a standalone runner (outside the locked
path, never committed) that reproduces `run.py`'s exact import/config setup but restricts
`run_conditions` to `run_sims` only (no re-optimisation, no analytics) - avoiding the real
risk that re-running the Rust optimiser's stochastic search could produce a *different*
`lookUpTable_*_0.csv` than the one already committed and validated. Restored
`.claude/settings.json` immediately after regenerating the books; `git diff .claude/settings.json`
verified empty before this commit.

## What this delivers

### Books regenerated and independently verified byte-identical
Ran the books-only regeneration (100,000 rounds x 3 modes, ~52 seconds). **All three
resulting `books_{cruise,antelite,super}.jsonl.zst` files hash byte-identical (SHA-256) to
the ones originally generated during FeatureMath v2 and recorded in
`FUTURE_SPINNER_PAR_SHEET.md`'s hash table** - a pure, deterministic reproduction, not a
new simulation or a re-derivation of the maths. The three `lookUpTable_*_0.csv` files were
also confirmed byte-for-byte unchanged before and after (diffed against a pre-run backup).

### Statelessness artefact (new, committed)
`scripts/review_events_stateless_scan.py`: decodes each mode's books and, for every round,
finds the first free-spin winning event and reads its `meta.globalMult` - the Overdrive
meter's value at that point. Since the meter is set once at feature-start
(`gamestate._overdrive_start_meter()`) and only ever increments afterward (never resets
mid-round, never carries across rounds), the distinct set of these values across all
100,000 rounds proves both statelessness (no cross-round drift) and correctness (the
constant matches the coded expectation). **Result: cruise -> `{1}`, antelite -> `{1}`,
super -> `{5}` - all three STATELESS**, generalising the one-off manual analysis
FeatureMath v2 did for `super` alone into a reusable script, and extending it to
cruise/antelite for the first time. Coverage caveat recorded explicitly, not glossed over:
a round with zero free-spin wins throughout contributes no data point, so coverage scales
with each mode's free-spin win rate (cruise 6.1%, antelite 24.25%, super 100.0% given its
guaranteed, richer feature). Output summary: `reports/qa/review_events_statelessness_2026-07-08.md`
+ raw `reports/qa/review_events_statelessness_scan_result.json`.

### Per-mode Bet Replay event IDs (REPLAY_TEST_EVENTS.md)
Extended the existing base/bonus-only table to all five modes. Real sim IDs found by
scanning the lookup tables (normal win / big win / win cap bands) and, for cruise/antelite
(which - unlike bonus/super - are not guaranteed triggers), scanning their books for a
round containing a `freeSpinTrigger` event: cruise sim 11, antelite sim 1 (both happen to
coincide with each mode's own "big win" row - a genuine trigger-plus-big-win round, called
out explicitly so it doesn't read as a mistake). Super mirrors bonus: no loss row (both
guarantee a trigger). Updated the replay URL template's mode enum and the local-mock
reproduction table, explicitly noting cruise/antelite/super have no curated
`sample_rounds.json` entries yet (a previously-flagged, unrelated limitation - does not
affect the real per-mode replay path, which reads the actual shipped books regardless).

### SUBMISSION_DOSSIER.md updated
Marked the REVIEW_EVENTS pass DONE in sections 6, 7 and the inventory table (row 10),
replacing the "still owed" language from the prior pass with what actually landed and
where the evidence lives.

## Verification
- All three regenerated books hash-verified byte-identical to the PAR-sheet-recorded
  hashes (see above) - the core integrity check for this entire pass.
- All three lookup tables confirmed unchanged (diff empty) before/after.
- `scripts/review_events_stateless_scan.py` run to completion: `STATELESSNESS SCAN: ALL
  PASS`.
- `.claude/settings.json` diff verified empty (lock fully restored) before this commit.
- No frontend/src changes in this pass, so no build/svelte-check/test-suite re-run was
  needed - this pass is Python analysis + docs only.
- The regenerated `.jsonl.zst` book files themselves remain gitignored (`**/library/**`)
  and are not part of this commit, consistent with existing precedent.

## Needs owner / Fable attention
- None blocking. The REVIEW_EVENTS pass is complete per Fable's own sequencing.
- Next up per Fable's sequencing: the hygiene pass (Collection Meter relocation to a
  reference branch, `FeatureButton.svelte`/`ControlBar.svelte` removal, the five stale
  `.spin-btn`-selector scripts, HANDOVER supersession, prompt archive, explicit-paths
  CLAUDE.md line, QA log archive). QA re-soak stays gated on audio.

## FOR THE NEXT SESSION
- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** treated the book
  regeneration as requiring an explicit sanction (asked before proceeding, since writing to
  `games/future_spinner/**` is outside the standing autonomy posture's boundary - the deny
  rules); minimised risk by writing a standalone runner outside the locked path that only
  invokes `create_books` (never the stochastic optimiser), and independently verified byte-
  identity before treating the regenerated books as trustworthy inputs for the statelessness
  script and the replay event IDs.
- **Alternatives rejected:** running the full `run.py` (including `run_optimization`)
  (rejected - the Rust optimiser's search is stochastic, so re-running it risked producing
  a *different*, still-valid-but-not-identical `lookUpTable_*_0.csv` than the committed
  one, which would have been an unsanctioned drift in the shipped maths, not a
  reproduction); silently proceeding without asking for the lock exception (rejected - this
  is squarely outside the autonomy posture's boundary per CLAUDE.md's own lock-exception
  mechanism, which requires an explicit brief naming the deny lines to lift).
- **Files touched:** `scripts/review_events_stateless_scan.py` (new),
  `reports/qa/review_events_statelessness_2026-07-08.md` (new),
  `reports/qa/review_events_statelessness_scan_result.json` (new), `REPLAY_TEST_EVENTS.md`,
  `SUBMISSION_DOSSIER.md`, this report. `.claude/settings.json` diff verified empty. Locked
  files (`rgsService.ts`, `gameStore.ts`, `games/future_spinner/` tracked content) confirmed
  untouched; the regenerated book files are gitignored and not part of this commit.
- **Open threads:** the hygiene pass (expanded scope per Fable's ruling); audio (still the
  one open creative blocker); QA re-soak (gated on audio).
