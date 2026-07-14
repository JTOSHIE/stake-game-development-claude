# Session Report: ITEM 3, JOB 3b math self-audit

- **Date:** 2026-07-14
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/math-selfaudit-item3` (off `main`, independent of ITEMS 0-2).
- **Source:** `FS_NextWorkOrder_2026-07-14_Prompt.md`, ITEM 3.

## What changed this pass

**`reports/qa/math_selfaudit_2026-07-14.md`** (new): walks every criterion on
`docs/stake-engine-live/math-verification.md` (the captured approval page) in
its own order, against numbers recomputed fresh from the shipped
`lookUpTable_*.csv` files - not copied from `MATH_VALIDATION.md` or any prior
report.

**`scripts/math_selfaudit_risk_metrics.py`** (new): `scripts/validate_math.py`
already covers RTP, hit rate, SD, wincap odds and the P(>=5000x) tail gate,
but does **not** compute two metrics the approval page explicitly names -
CVaR (normalized) and ETL (>=40x-cost liability) - so this pass implements
them fresh from the page's own prose definitions, plus a win-range gap scan
and a most-likely-single-outcome dominance check (the page's other two
"other considerations" items that also weren't previously automated
anywhere in the repo).

## Real findings

1. **All numeric criteria PASS**, most with wide margins - full table in the
   report. Worth calling out specifically: cross-mode RTP spread is exactly
   0.0000pp (identical to 6dp across all five modes); every mode's max-win
   odds are 40x-100,000x more frequent than the 1-in-10,000,000 floor; CVaR
   and ETL (newly computed) both sit well under their 3-star limits (worst
   case, antelite, at ~26% of the CVaR ceiling and ~74% of the ETL ceiling).
2. **A real, disclosed gap-scan finding**: `bonus` and `super` (the two
   guaranteed-feature buy modes) have wide empty payout bands between their
   typical feature-payout range and the 5,000x cap (six and eight
   consecutive empty buckets respectively, on a log-ish "times cost" scale).
   `base`/`cruise`/`antelite` only show a single empty bucket immediately
   below the wincap - expected, since the wincap is a discrete, separately
   modelled outcome, not a continuous tail. The buy-tier gap is different in
   kind: it reflects the reward structure being naturally lumpy at the high
   end for a guaranteed-feature buy, not necessarily a defect, but it is
   exactly the shape of gap the approval page's own wording calls out for
   reviewer attention. Recorded as a disclosure for Fable/owner judgement,
   not resolved or dismissed either way - the underlying maths is locked and
   already through prior review, so this pass's job was to surface it
   accurately, not to propose a fix.
3. **100,000 simulations per mode meets the approval page's stated floor
   exactly, not the upper end of its 100k-1M range** - noted rather than
   silently treated as automatically sufficient just because it's not a
   failure.
4. **The second ETL definition, "Liability (ETL, P(>10000))"**, is trivially
   0.0 for every mode, since the shipped 5,000x hard cap never reaches the
   >10,000x threshold that metric needs - stated explicitly so it doesn't
   read as an omission.

## Verification

- `python3 scripts/validate_math.py` re-run fresh this pass (not reused from
  an earlier session's output): all five modes 96.350000% RTP, every existing
  cross-check passes.
- `python3 scripts/math_selfaudit_risk_metrics.py` (new) run fresh against
  the same shipped CSVs, producing every CVaR/ETL/gap/dominance number in the
  report.
- Grepped both new files for em/en dashes: zero matches.
- This pass only **reads** `games/future_spinner/library/publish_files/*.csv`
  - never writes to the locked package. Locked files confirmed untouched:
  `git diff --stat -- frontend/src/lib/services/rgsService.ts frontend/src/lib/stores/gameStore.ts games/future_spinner/ .claude/settings.json` is empty.

## Not done this pass (flagged, not silent)

- The bonus/super win-range gap finding is disclosed, not resolved - any fix
  would touch locked maths and needs its own sanctioned pass and design
  judgement, out of scope for an audit report.
- `math_selfaudit_risk_metrics.py`'s CVaR/ETL formulas are a first
  implementation (no prior committed version existed to check them against)
  - built directly from the approval page's own definitions, but not
  independently cross-validated against a second, different implementation.

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** walked the
  approval page's own criteria list in its own order rather than reorganising
  around this repo's existing report structure, so the audit reads as a
  direct point-by-point response to what Stake actually asks reviewers to
  check. Implemented the two genuinely-missing metrics (CVaR, ETL) rather
  than noting them as "not computed" and stopping there, since the page gives
  exact formulas and the shipped CSVs have everything needed to compute them.
- **Alternatives rejected:** treating the 100,000-simulation-per-mode figure
  as unremarkable since it's not a failure (rejected - it's exactly at the
  stated floor, worth a reader knowing that rather than assuming headroom
  that doesn't exist); smoothing over the bonus/super gap-scan finding as
  "expected for a buy mode" without flagging it (rejected - the approval
  page explicitly calls this class of gap out, so an audit that quietly
  waves it away isn't doing its job).
- **Files touched:** `reports/qa/math_selfaudit_2026-07-14.md` (new),
  `scripts/math_selfaudit_risk_metrics.py` (new), `FS_NextWorkOrder_2026-07-14_Prompt.md`
  (saved verbatim on this branch too, per convention), this report + its
  dated archive copy. Locked files untouched (read-only against the shipped
  CSVs throughout).
- **Open threads:** ITEM 4 (JOB 9b social-mode audit) and the sanctioned
  locked pass (books regeneration) remain. ITEM 0's two flagged findings and
  ITEM 2's win-count-up tier question still await review on their own open
  branches/PRs.
