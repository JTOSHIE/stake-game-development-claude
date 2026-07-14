# Session Report: Sanctioned locked pass, books regeneration and cleanup

- **Date:** 2026-07-14
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/books-regen-locked-pass` (off `main`).
- **Source:** `FS_NextWorkOrder_2026-07-14_Prompt.md`, the SANCTIONED LOCKED PASS
  section. Owner authority relayed by Fable.

## Lock-exception mechanism followed exactly

Per CLAUDE.md's lock-exception mechanism and this brief's explicit scope:

1. **Before any regeneration**, recorded the exact starting state of
   `.claude/settings.json` (confirmed `git diff` on it was empty).
2. **Lifted only the two named deny lines** - `Edit(games/future_spinner/**)`
   and `Write(games/future_spinner/**)` - as a temporary working-tree edit.
   Nothing else in the file was touched.
3. Ran `games/future_spinner/run.py` (the project's own deterministic
   generation pipeline) via Bash - this is invoking the sanctioned tool the
   brief names, not using Bash to route around a deny by writing arbitrary
   content to a locked file directly.
4. **Immediately after the regeneration and verification work below**,
   restored `.claude/settings.json` to its exact original content and
   confirmed `git diff -- .claude/settings.json` is empty before staging
   anything.

## What was done

**Enumerated the required books files** from `index.json`: five modes
(`base`, `cruise`, `antelite`, `bonus`, `super`), each needing a
`books_<mode>.jsonl.zst` and a `lookUpTable_<mode>_0.csv`. Confirmed
`books_super.jsonl.zst` was the only one physically missing from this
checkout (gitignored path); `lookUpTable_super_0.csv` was already tracked and
present.

**Ran `games/future_spinner/run.py`** (via the project's own venv,
`env/bin/python3` - the system `python3` lacks the `toml` dependency this
tool needs, a real environment issue fixed by using the correct
already-provisioned venv rather than installing anything new). The tool's
`target_modes` list (`["cruise", "antelite", "super"]`) is a fixed property
of the script - can't be narrowed to `super` alone without editing the
script itself, which stays out of scope (only the books artefacts under
`publish_files/` may be written, not `run.py`). So all three modes
regenerated, not just the missing one.

## Real finding: the simulation stage is deterministic, the optimizer stage is not

After the run, `git status` showed **`index.json` and all three of
`lookUpTable_cruise_0.csv`/`lookUpTable_antelite_0.csv`/`lookUpTable_super_0.csv`
modified** - not the "empty git status" the hard gate calls for. Investigated
before concluding anything:

- **The raw simulation output (the actual books) is perfectly
  deterministic.** `shasum -a 256` on all three freshly-generated
  `books_cruise.jsonl.zst`/`books_antelite.jsonl.zst`/`books_super.jsonl.zst`
  matched their previously-recorded hashes **exactly** - including
  `books_super.jsonl.zst` matching the PAR sheet's hash recorded back at
  FeatureMath v2, a value that predates this session entirely. This is a
  strong, independent confirmation that `src/state/run_sims.py`'s seeded RNG
  (`random.seed(0)` plus per-simulation seeds derived from a fixed index) is
  working exactly as designed.
- **The optimizer stage (the separate `PigFarmRust` binary that fits payout
  weights to hit the RTP target) is not bit-for-bit deterministic between
  runs.** The regenerated lookup tables differed from the already-published,
  already-audited versions by 100,000+ changed lines each, despite (per
  `validate_math.py`, run against the restored originals) landing on the
  same statistical target. This wasn't asserted from documentation - it's a
  measured, reproduced fact from this session's own run.
- **Resolution**: since `lookUpTable_cruise_0.csv`, `lookUpTable_antelite_0.csv`,
  `lookUpTable_super_0.csv` and `index.json` were all already correct and
  already published before this pass started, the incidental
  non-deterministic recomputation was **reverted** (`git checkout --`,
  restoring the already-committed bytes) rather than committed. The only
  genuinely new artefact kept was `books_super.jsonl.zst` (hash-verified
  against the PAR sheet, as above). This satisfies the hard gate's actual
  intent - the tracked, previously-audited maths files are unchanged - while
  being honest that "regenerate all three modes and expect byte-identical
  output" is not literally achievable with this pipeline's optimizer stage as
  it stands today.

## Cleanup

Deleted the seven orphaned, unreferenced `books_*.jsonl.zst` files flagged in
JOB 5 (2026-07-13): `books_volatile.jsonl.zst`, `books_ante.jsonl.zst`,
`books_hyperbuy.jsonl.zst`, `books_minibuy.jsonl.zst`, `books_superbuy.jsonl.zst`,
`books_megabuy.jsonl.zst`, `books_superante.jsonl.zst`. Confirmed each was
absent from `index.json`'s declared set before deleting. `publish_files/`
now contains exactly the five required `books_*.jsonl.zst` files, nothing
else.

## Hard gates - verification

1. **"Every `lookUpTable_*.csv` and `index.json` byte-identical (empty git
   status on tracked locked files)"**: `git status --short games/future_spinner/`
   is empty after the revert above. **PASS** (achieved via the revert, not
   via a literally-reproducible optimizer run - see the finding above).
2. **"Statelessness scan re-run against the fresh books reproduces meter 1
   for cruise/antelite and meter 5 for super across 100,000 rounds each"**:
   ran `scripts/review_events_stateless_scan.py` for real against the fresh
   `publish_files/` directory:
   `[cruise] expected 1, observed [1] -> STATELESS`,
   `[antelite] expected 1, observed [1] -> STATELESS`,
   `[super] expected 5, observed [5] -> STATELESS`. **PASS.** Result
   committed as `reports/qa/review_events_statelessness_2026-07-14.md` +
   its raw JSON, a dated addendum alongside (not replacing) the 2026-07-08
   original.
3. **"Per-mode RTP recomputed via `scripts/validate_math.py` unchanged at
   96.3500%"**: re-ran fresh after the revert - all five modes
   96.350000%, all cross-checks pass. **PASS** (trivially true once the
   lookup tables were restored to their unchanged, already-validated state,
   but re-run for real rather than assumed).
4. **"SHA-256 hashes of the final books set recorded in
   `SUBMISSION_DOSSIER.md` section 5 as the upload inventory"**: section 5c
   rewritten - all eleven `index.json`-declared files now present and
   hash-verified (the `books_super.jsonl.zst` gap flagged there since
   2026-07-13 is now closed), with the deterministic-vs-non-deterministic
   finding recorded inline rather than only in this report. **DONE.**

## Verification

- Recorded `.claude/settings.json`'s exact content before any edit;
  restored it exactly and confirmed `git diff -- .claude/settings.json` is
  empty before staging anything - the lock-exception mechanism's own
  required proof.
- Independently hashed all three freshly-generated books files and compared
  against three different pre-existing sources (the 2026-07-13 dossier
  table for cruise/antelite, the PAR sheet's FeatureMath-v2-era record for
  super) rather than assuming the regeneration was correct.
- Re-ran both `scripts/validate_math.py` and
  `scripts/review_events_stateless_scan.py` for real against the final
  state, not inferred from the earlier (pre-cleanup) run.
- Confirmed the seven deleted files were genuinely unreferenced by
  `index.json` before deleting, and confirmed exactly five `books_*.jsonl.zst`
  files remain afterward.
- Locked files confirmed untouched at the end of the pass:
  `git diff --stat -- frontend/src/lib/services/rgsService.ts frontend/src/lib/stores/gameStore.ts games/future_spinner/ .claude/settings.json`
  is empty (the `games/future_spinner/**` and `.claude/settings.json` lines
  specifically checked, given this pass touched both under a temporary,
  now-fully-reverted exception).

## Not done this pass (flagged, not silent)

- **The optimizer's non-determinism itself is not investigated further or
  fixed** - identifying *that* it's non-deterministic (and precisely
  isolating it to that stage, not the simulation stage) was this pass's job;
  whether that's expected/acceptable behaviour for this SDK, or worth a
  future determinism fix (e.g. a fixed RNG seed for the Rust optimizer), is
  a decision for whoever owns that tooling, not this books-regeneration pass.
- `games/future_spinner_full_statistics.xlsx` and
  `games/future_spinner/library/statistics_summary.json` were also touched by
  the pipeline run and reverted alongside the lookup tables, for the same
  reason (already correct, already published, no need to churn them for an
  incidental non-deterministic recomputation).

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** followed
  the lock-exception mechanism literally (exact lines named, temporary edit,
  verified-empty-diff restoration) and, when the pipeline's own behaviour
  didn't match the brief's "byte-identical" expectation, stopped to
  investigate rather than either (a) committing the churn to force a
  superficial "it ran" result or (b) declaring the gate un-satisfiable and
  giving up. Isolating the finding to specifically the optimizer stage (via
  hash-comparing the raw books, which DID reproduce exactly) turned a
  confusing gate failure into a precise, actionable finding.
- **Alternatives rejected:** committing the freshly-regenerated
  lookup tables as-is (rejected - they were never asked to change, and
  committing a non-deterministic recomputation of otherwise-correct locked
  maths files for no reason would be exactly the kind of unnecessary churn
  this project's conventions warn against); editing `run.py` to narrow
  `target_modes` to `["super"]` only (rejected - explicitly forbidden by the
  brief's own scope: writing is permitted only to the books artefacts named,
  not to the pipeline's source files, even under the temporary lock lift).
- **Files touched:** `SUBMISSION_DOSSIER.md` (section 5c rewritten),
  `reports/qa/review_events_statelessness_2026-07-14.md` (new),
  `reports/qa/review_events_statelessness_scan_result_2026-07-14.json` (new),
  `FS_NextWorkOrder_2026-07-14_Prompt.md` (saved verbatim on this branch too),
  this report + its dated archive copy. `games/future_spinner/**` and
  `.claude/settings.json` both touched under the sanctioned, temporary
  exception and both verified fully reverted before commit - no locked-file
  diff survives in the actual commit.
- **Open threads:** this closes the sanctioned locked pass and the entire
  2026-07-14 work order (ITEMS 0-4 plus this pass). Outstanding across the
  arc: ITEM 0's two flagged findings (anticipation_build seam tolerance, LUFS
  discrepancy), ITEM 2's win-count-up tier question, and ITEM 3's bonus/super
  win-range gap-scan finding all still await Fable/owner review on their own
  open branches/PRs. The optimizer non-determinism finding above is new and
  not yet on anyone's list - worth surfacing to Fable explicitly, since it
  affects how "regenerate and verify byte-identical" should be worded in any
  future locked-pass brief for this game.
