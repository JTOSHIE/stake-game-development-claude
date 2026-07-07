# Session Report: Pass B — CellModifier + telemetry wiring + PF determinism test + Collection Meter recovery

- **Date:** 2026-07-07
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/compliance-rg-passb` (off up-to-date `main` at time of resume, in a
  dedicated worktree at `/Users/jt/math-sdk-rgb`), merged forward onto
  `claude/fix-buy-tier-billing` (PR #44, then still open) before wiring telemetry so this
  work builds on the corrected generic `handleBuy`, not the bug it fixed.
- **Source:** continuation of the orphaned-branch recovery started with "Pass A"
  (`reports/archive/2026-07-07_compliance-rg-pass-a.md`, PR #43). Everything here is
  hand-picked from the same orphaned `claude/compliance-rg` branch, which turned out on
  inspection to be a large, stale fork of the old 11-mode template-library era (it also
  contains `future_spinner_bigwin`/`multiwild`/`rtp94` sibling packages and a batch of
  unrelated GameGrid.svelte motion-tuning reverts) - confirmed via `git diff --stat
  main claude/compliance-rg` before touching anything, which is why this and Pass A were
  both scoped as hand-picked recoveries rather than a raw branch merge: merging wholesale
  would have silently regressed motion-polish and reel-feel work already shipped on `main`
  since that branch diverged.

## What this delivers

### 1. Per-cell modifier overlay (CellModifier + cellMultipliers)
- New files, copied verbatim: `frontend/src/lib/components/CellModifier.svelte` (a
  mechanic-agnostic badge component - a future per-cell mechanic like multiplier wilds or
  symbol upgrades adds DATA, not a new presentation pipeline) and
  `frontend/src/lib/stores/cellMultipliers.ts` (the store it reads).
- `frontend/src/lib/services/roundInterpreter.ts`: appended (purely additive, nothing
  existing touched) `CellMultiplier`, `collectCellMultipliers`, `cellMultipliersFromEvents`
  - derives per-cell wild-multiplier badge data from a round's raw events.
- `frontend/src/lib/components/GameGrid.svelte`: **hand-integrated, not diff-applied.**
  `claude/compliance-rg`'s version of this file also carried a large batch of unrelated
  particle/timing/squash-tuning reverts alongside the CellModifier markup (confirmed via
  `git diff main claude/compliance-rg -- .../GameGrid.svelte`), so the raw diff was
  discarded and only the CellModifier-specific lines were re-created by hand: the import,
  the `cellMultipliers.set([])` clear on `animateSpin`, the `cell-mod-overlay` markup block
  after the pixi canvas, and its CSS. Every other line in the current shipped GameGrid.svelte
  is unchanged.
- `frontend/src/App.svelte`: in `handleSpin`, after `scatterCount.set(...)`, added the
  `cellMultipliers.set(rawEvents ? cellMultipliersFromEvents(rawEvents) : [])` wiring so a
  live/replay round with wild-multiplier events (a future mechanic - the shipped Overdrive
  package has none today) surfaces badges automatically; standard base play is
  unaffected (empty list -> no badges rendered).

### 2. Telemetry wiring
- `frontend/src/lib/services/telemetry.ts` + `docs/TELEMETRY_TAXONOMY.md`: carried over
  from the parked state (already corrected in an earlier pass to align `WIN_TIERS` with the
  shipped C1 celebration thresholds - BIG>=10x/MEGA>=30x/EPIC>=100x/MAX=5000x - rather than
  the original prototype's mismatched 20/200/1000 thresholds).
- `frontend/src/App.svelte`: added `configureTelemetry`/`setTelemetrySink(bufferSink(...))`
  dev-only registration, and `track()` calls for `spin` (in `handleSpin`), `buy` (in
  `handleBuy`, tagged with the actual clicked tier - correct now that the buy-tier billing
  fix threads the real mode through), `win` (both handlers, using the corrected win-tier
  thresholds), and `wincap` (`handleSpin`). The emitter is a no-op until a sink is
  registered (production wires a vendor sink separately) and never touches the outcome
  path, so it cannot affect provably-fair reconstruction.

### 3. PF readiness determinism test
- `frontend/src/lib/services/roundInterpreter.determinism.test.ts` + `docs/PF_READINESS.md`:
  carried over from the parked state, re-verified against the current `roundInterpreter.ts`
  (now with the additive CellModifier functions) - still **58/58 samples deterministic**.

### 4. Collection Meter (`future_spinner_collect`) sibling-package recovery
- Recovered the full `games/future_spinner_collect/` directory (maths config, gamestate,
  reels, shipped lookup tables) from `claude/compliance-rg` - a **sibling** package
  (`games/future_spinner_collect/**`, not `games/future_spinner/**`), so nothing here
  touched the lock or needed a lock exception.
- It is explicitly a "feature-primitive prototype (NOT for release)" per its own README: a
  stateless Collection Meter (coin-collect) bonus layered on the Overdrive engine, where L3
  carries a random cash value during free spins that accumulates into a pot paid at
  `end_freespin`.
- Wrote `games/future_spinner_collect/COLLECT_PROTOTYPE_FINDINGS.md`, independently
  recomputing RTP/weighted SD/max win/hit rate/wincap odds directly from the shipped
  `lookUpTable_{base,bonus}_0.csv` files (same method `scripts/validate_math.py` uses for
  the shipped package) - **the README's claimed numbers matched exactly**: base
  96.3499998474% (SD 17.17x, hit rate 29.11%, wincap 1 in 100,000), bonus 96.3499999943%
  (SD 214.37x, hit rate 100%, wincap 1 in 1,000), both capped at exactly 5,000.00x.
- **Flagged, not silently skipped**: the README's event-level statelessness claim ("exactly
  one `collectPayout` per book", "coin values sum to the payout") was verified at
  generation time against the raw books, which are gitignored and were not part of this
  recovery - this pass did not regenerate them, so that specific claim is inherited from
  the original documentation, not independently re-derived here. Documented as the next
  step before any sanctioned regen into the locked package.

## Verification
- `npm run build`: clean.
- `npx svelte-check`: clean (only the same 6 pre-existing `node_modules` errors present on
  `main`).
- `npx tsx roundInterpreter.determinism.test.ts`: 58/58 samples deterministic (unaffected by
  the additive CellModifier functions).
- Playwright, dev server on a throwaway port: confirmed zero visual regression on a normal
  base spin (screenshot `reports/screens/compliance-rg-passb/02_after_spin_with_wilds_no_badges.png`
  - a round with wild symbols present shows no badges, correct, since the shipped package
  has no per-cell-multiplier mechanic yet) and confirmed the telemetry buffer
  (`window.__telemetry`) populates correctly after a spin: a `spin` event
  (`costMicros: 1000000` for a $1.00 bet) followed by a `win` event
  (`winMicros: 2900000, multiple: 2.9, tier: "small"`), both with correct integer-micros
  values.
- Independently re-verified the identical 403 console errors on this build also occur on
  unmodified `main` (via `git stash` + a baseline dev server) - pre-existing, unrelated to
  this session's changes.
- Locked files confirmed untouched throughout (`git diff --stat` against `rgsService.ts`,
  `gameStore.ts`, `games/future_spinner/` is empty).

## Needs owner / Fable attention
- Curated mock samples for a multiplier-wild demo round still don't exist in
  `sample_rounds.json` (flagged in the parked state already) - CellModifier has nothing to
  visually demo in dev/mock mode until either a curated sample is authored or a real
  multiplier-wild mechanic ships. Not a regression; the shipped Overdrive package doesn't
  use this mechanic today.
- `future_spinner_collect` remains a not-for-release sibling prototype. If it is ever
  sanctioned for a real regen (like NITRO OVERDRIVE before it), the event-level
  statelessness re-proof noted above is the outstanding independent-verification gap.
- PR #43 (compliance-rg Pass A) is still open, not yet merged.
- The two LUMEN-parity items (music/SFX volume sliders, paytable Interface Guide) are still
  open, not yet started.
- Audio remains with Fable.

## FOR THE NEXT SESSION
- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** treated
  `claude/compliance-rg` purely as a source to hand-pick specific, self-contained pieces
  from (never merged or diffed wholesale) after discovering via `git diff --stat` that it
  diverged from a much older, since-superseded era of the project; merged forward onto the
  (at-the-time still open) buy-tier-billing fix branch before wiring telemetry so the new
  `track({type:'buy'})` call reads the corrected per-tier mode/cost rather than rebuilding
  this wiring twice.
- **Alternatives rejected:** applying `claude/compliance-rg`'s `GameGrid.svelte` diff
  directly (rejected - it silently reverts particle/timing tuning from motion-polish-v2/
  reel-feel-v3 that has shipped on `main` since); regenerating `future_spinner_collect`'s
  books to close the statelessness-verification gap in this same pass (rejected as
  out-of-scope effort for a not-for-release prototype recovery - flagged instead for the
  next session that considers sanctioning it).
- **Files touched:** `frontend/src/lib/components/{CellModifier.svelte (new), GameGrid.svelte}`,
  `frontend/src/lib/stores/cellMultipliers.ts` (new), `frontend/src/lib/services/{roundInterpreter.ts,
  telemetry.ts (new), roundInterpreter.determinism.test.ts (new)}`, `frontend/src/App.svelte`,
  `docs/{TELEMETRY_TAXONOMY.md, PF_READINESS.md}` (new), `games/future_spinner_collect/**`
  (new sibling package + new `COLLECT_PROTOTYPE_FINDINGS.md`), this report.
  `frontend/dist` build noise restored to `HEAD` before commit. Locked files confirmed
  untouched.
- **Open threads:** PR #43 (Pass A) still open; the LUMEN-parity items; audio; the
  Collection Meter statelessness re-proof if it is ever sanctioned for promotion.
