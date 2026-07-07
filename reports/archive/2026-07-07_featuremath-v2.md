# Session Report: FeatureMath v2 - NITRO OVERDRIVE + OVERBOOST into the locked package

- **Date:** 2026-07-07
- **Model / effort:** Claude Opus 4.8 (1M context), High.
- **Branch:** `claude/featuremath-v2` (off up-to-date `main`, in a dedicated worktree).
- **Source:** `FS_FeatureMath_v2_Prompt.md` (repo root, cleared to run per PR #39), executed
  end to end exactly as written, with the owner sanction confirmed (relayed via Fable):
  lift `Edit(games/future_spinner/**)` / `Write(games/future_spinner/**)` for this session
  only, working-tree edit of `.claude/settings.json`, restored with a verified-empty diff
  before this commit. Ship name: **NITRO OVERDRIVE** (400x super buy). Antelite rebadged
  **OVERBOOST** (display name only; mode id unchanged).

## What this delivers

Adds three new modes to the shipped `games/future_spinner` package (which previously
shipped only `base` + `bonus`), reaching the full five-mode menu the frontend (`fsModes.ts`,
PR #32) was already built to serve:

- **Cruise** (mode id `cruise`, cost 1.0x) - low-volatility standing mode. Fences ported
  verbatim from the validated `claude/gap-analysis` library.
- **OVERBOOST** (mode id `antelite`, cost 1.25x) - double-chance, ~1.6x trigger rate.
  Fences ported verbatim from `claude/gap-analysis`.
- **NITRO OVERDRIVE** (mode id `super`, cost 400.0x) - guaranteed trigger with the
  Overdrive meter pre-revved to 5x at the feature's first free spin. Recipe applied
  verbatim from the validated `games/future_spinner_super` sibling prototype
  (`SUPER_PROTOTYPE_FINDINGS.md`, branch `claude/fs-super-prototype`).

### The recipe (exactly as the brief specified)
- `gamestate.py`: added `_overdrive_start_meter()` (returns 5 for `super`, 1 otherwise) and
  applied it in `run_freespin` immediately after `reset_fs_spin()`.
- `game_config.py`: added the `freegame_ante_condition`/`wincap_ante_condition` conditions
  and the three new `BetMode` blocks (cruise, antelite, super), appended after the existing
  `base`/`bonus` blocks. **Zero lines changed inside the existing base/bonus blocks** -
  confirmed by diff (pure addition, no deletions).
- `game_optimization.py`: added the `cruise`/`antelite`/`super` opt_params blocks, same
  guarantee - base/bonus blocks untouched.
- `run.py`: **generates ONLY the three new modes this run.** `OptimizationSetup(config)`
  runs first against the FULL 5-mode config (it needs every mode's wincap present to build
  `opt_params` without a KeyError), then `config.bet_modes` is narrowed to
  `["cruise","antelite","super"]` before `create_books`/`generate_configs`/the optimiser run,
  so base and bonus are never simulated, never touched, and their published lookup tables
  are the literal same files as before this session.

### Merge into the shipping package
`index.json` and `game_metadata.json` were hand-composed after generation: base and bonus's
entries carried over byte-for-byte from the pre-v2 files; cruise/antelite/super's entries
added from this run's output. `game_metadata.json` also gained `modeDisplayNames`
(OVERBOOST, NITRO OVERDRIVE), a `cruiseMode`/`overboost`/`nitroOverdrive` info block each,
and a version bump to 1.2.0.

## Verification (independent, from the shipped tables - zero trust in the optimiser)

Extended `scripts/validate_math.py` (the main analysis loop was already generic per-mode;
only `STATED` facts and the cross-check section were extended) and ran it against the
final five-mode `publish_files`:

| mode | cost | RTP (recomputed) | SD | max win | wincap odds | tail (cost-scaled) |
|---|---|---|---|---|---|---|
| base (Normal) | 1.0x | **96.350000%** | 17.28x | 5,000x | 1 in 100,000 | 1.0e-5 |
| cruise (Cruise) | 1.0x | **96.350000%** | 11.29x | 5,000x | 1 in 250,000 | 4.0e-6 |
| antelite (OVERBOOST) | 1.25x | **96.350000%** | 20.32x | 5,000x | 1 in 80,000 | 1.25e-5 |
| bonus (Buy Overdrive) | 100.0x | **96.350000%** | 206.63x | 5,000x | 1 in 1,000 | 1.0e-3 |
| super (NITRO OVERDRIVE) | 400.0x | **96.350000%** | 539.16x | 5,000x | 1 in 250 | 3.2e-3 (limit 1e-2) |

- **All five modes recompute to exactly 96.350000%** (4dp), cross-mode spread 0.0000pp.
- **base/bonus byte-identical**: `lookUpTable_base_0.csv` / `lookUpTable_bonus_0.csv` hashes
  re-verified unchanged (`7aa4358...`, `a77241f...`) at three checkpoints - before generation,
  immediately after, and after the follow-on analytics regeneration below.
- **5,000x cap holds**: independently scanned every book; max `payoutMultiplier` seen across
  all 100,000 `super` rounds is exactly 5000.00x, zero rounds above cap.
- **Statelessness proven from the real shipped books** (not the prototype): decoded all
  100,000 `books_super.jsonl.zst` rounds by tracing each event's `gameType` context; the
  distinct set of free-spin-start `globalMult` values across every round is exactly `{5}` -
  every round independently pre-revs to 5 and climbs +1 per winning spin, with zero
  cross-round carry.
- **Tail gate passes**: `super`'s P(>=5000x) is 4.00e-3 raw, 3.20e-3 cost-scaled (cost 400 ->
  scale 0.8), under the 1e-2 limit - matching the prototype almost exactly.

## Two things the brief's literal text got wrong (corrected during execution, documented for
the record - both already flagged in the brief's own SCOPE-correction section, restated here
because they materially changed how the run was executed)

1. **"Generate ONLY super"** (an older sentence in the GENERATION section) undercounted the
   scope: the shipping package on `main` had only `base`+`bonus`, so cruise and antelite also
   had to be generated fresh this run, not just super. The brief's own corrected SCOPE
   section and Fable's ratification both say "add exactly three modes" - that is what ran.
2. **`docs/MASTER_TEMPLATE.md`** does not exist on `main` (it is `claude/gap-analysis`-only
   reference material, consistent with Fable's guard that the 11-mode library never enters
   the shipping package). Introducing it here would have violated that guard, so this
   definition-of-done item was skipped rather than force-created.

## Side-effects handled

- `optimization_program/src/setup.toml` (a shared Rust-optimiser working file, overwritten
  with whichever mode ran last - ended the run showing `bet_type = "super"`) was restored to
  its pre-run committed value; it carries no semantic meaning (every optimiser invocation
  overwrites it for whatever mode it is currently processing) and is not part of the recipe.
- `future_spinner_full_statistics.xlsx` / `statistics_summary.json`: the `run.py` analytics
  step ran against the narrowed 3-mode config, so these were regenerated covering only
  cruise/antelite/super. Re-ran `create_stat_sheet` a second time against the FULL 5-mode
  config (read-only against the already-generated lookup tables/books - does not resimulate
  or reoptimise anything) to produce a complete five-mode analytics report, then re-verified
  base/bonus's lookup tables were still byte-identical afterward.

## Docs updated
- `games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md`: five-mode header, the NITRO OVERDRIVE
  mechanic note (section 2), three new per-mode statistics sections (6a/6b/6c), the extended
  hash table (section 9, with an explicit note on which rows are unchanged vs new), renamed
  "FIVE-MODE DECLARATION" (section 10), and updated compliance notes (section 11).
- `scripts/validate_math.py`: extended `STATED` + the cross-check section for the three new
  modes; the main per-mode analysis loop needed no change (already generic via `index.json`).

## Needs owner / Fable attention
- **Fable's independent recomputation is still owed** on this v2 output in the locked
  package (per the ratified protocol - Fable recomputes on the shipped result, not the
  prototype). Everything needed is in this commit: the shipped tables, the PAR sheet, and
  this report.
- **Frontend follow-on is a SEPARATE, unlocked commit** (not yet done as of this report) -
  flip `available: true` for `cruise`/`overboost`/`super` in `frontend/src/lib/config/fsModes.ts`
  and set the `super` label to NITRO OVERDRIVE, per the brief's explicit instruction to keep
  this as its own commit outside the lock.
- **Submission-risk items** (Fable's list, still open): REVIEW_EVENTS/bet-replay per-mode IDs
  for the three new modes; dossier + paytable copy five-mode update including the NITRO
  OVERDRIVE pre-rev disclosure; QA re-soak covering all five live modes; the external audit
  pack refresh (still pending audio).
- **Audio** remains the top creative blocker, unaffected by this session.

## FOR THE NEXT SESSION
- **Model/effort:** Opus 4.8 (1M), High. **Approach:** executed the corrected, cleared brief
  in an isolated worktree; ran a cheap dev-scale dry run first to catch pipeline errors before
  committing to the full 300k-sim production run; narrowed `config.bet_modes` post-
  `OptimizationSetup` so the SDK pipeline only ever touched the three new modes; hand-merged
  `index.json`/`game_metadata.json` rather than risk re-running the optimiser against
  base/bonus (which would almost certainly change their tables non-byte-identically, even
  with unchanged fences, since the Rust search is stochastic).
- **Alternatives rejected:** running the full 5-mode pipeline together (rejected - risks
  base/bonus losing byte-identity to the optimiser's stochastic search); regenerating
  `docs/MASTER_TEMPLATE.md` on main (rejected - violates Fable's reference-only guard for the
  11-mode library); leaving the stray 3-mode-only analytics files as-is (rejected - silently
  drops base/bonus from the human-readable stats report; regenerated properly instead).
- **Files touched:** `games/future_spinner/{gamestate.py, game_config.py,
  game_optimization.py, run.py, FUTURE_SPINNER_PAR_SHEET.md}`,
  `games/future_spinner/library/publish_files/{index.json, game_metadata.json,
  lookUpTable_cruise_0.csv, lookUpTable_antelite_0.csv, lookUpTable_super_0.csv}`,
  `games/future_spinner/library/{future_spinner_full_statistics.xlsx,
  statistics_summary.json}`, `scripts/validate_math.py`. `.claude/settings.json` diff
  verified empty. `books_{cruise,antelite,super}.jsonl.zst` generated locally
  (17-149MB each) but NOT committed - gitignored per `**/library/**`, matching the existing
  base/bonus precedent; fully regenerable via `run.py`.
- **Open threads:** the frontend placeholder flip (separate commit, next); Fable's
  independent recomputation; the submission-risk closeouts above; audio.
