# Session Report: ITEM D, math self-audit correction

- **Date:** 2026-07-14
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/math-audit-correction-itemD` (off `main`, independent
  of ITEMS A/B/C).
- **Source:** `FS_FollowUpWorkOrder_2026-07-14b_Prompt.md`, ITEM D - Fable's
  correction to ITEM 3's flagged win-range-gap finding.

## What was actually wrong

ITEM 3's win-range gap scan bucketed every mode's payouts uniformly in
"times cost" units and reported that `bonus` and `super` showed a
"genuinely wide empty band" between their typical feature payout and the
5,000x cap. **That finding was itself a measurement bug, not a maths
finding.** For a high-cost buy-tier mode, the mode's own maximum achievable
ratio is cap/cost - 5,000/100 = 50x cost for `bonus`, 5,000/400 = 12.5x cost
for `super`. Every bucket edge above that ratio is empty **by construction**
- the payout distribution can never reach a "times cost" value the cap
itself doesn't allow, no matter how well the real, achievable range is
covered. The original pass measured an arithmetically impossible range and
reported the result as a coverage gap.

## What changed this pass

**`scripts/math_selfaudit_risk_metrics.py`**: buy-tier modes (`bonus`,
`super`) are now bucketed in **bet-multiple units** (the raw payout column,
never divided by cost) instead of times-cost units - the actual 0-5,000x
range every mode shares regardless of its own cost, since the cap itself is
expressed in bet-multiple terms. `base`/`cruise`/`antelite` (1.0x/1.0x/1.25x
cost) keep times-cost bucketing, since at cost close to 1 the two are nearly
identical - the bug specifically affected the two modes where cost and bet
diverge sharply.

**`reports/qa/math_selfaudit_2026-07-14.md`**: replaced the win-range-gap
section entirely. New content: an explanation of what was wrong and why,
the full corrected bet-multiple band table for both `bonus` and `super`
(every bucket from just above the mode's designed floor through to the
5,000x wincap bucket, all carrying real weight), and the criterion reframed
as **PASS for all five modes** rather than a flagged concern. Also removed
the now-stale "worth a second pair of eyes" note from the report's own
"not computed / marginal" section, since this is resolved, not still open.

## Real result: continuous coverage confirmed

| Bucket (x bet) | bonus weight | super weight |
|---|---|---|
| [0-0.5) | 0 | 0 |
| [0.5-1) | 0 | 0 |
| [1-2) | 1,030,562,982,609 | 0 |
| [2-5) | 14,465,639,638,970 | 299,801,797,768 |
| ... (every intermediate bucket carries real weight) | | |
| [2500-5000) | 6,233,404,531 | 2,909,689,331,730 |
| [5000-5001) (wincap) | 1,125,899,906,800 | 4,503,599,625,484 |

The only empty bands are below each mode's own designed floor
(`bonus`'s minimum non-zero win is 1.4x per `validate_math.py`, `super`'s is
2.3x) - not a gap, the same kind of expected non-coverage as
`base`/`cruise`/`antelite`'s single empty bucket immediately below their own
wincap.

## Verification

- Ran the corrected `math_selfaudit_risk_metrics.py` for real against the
  same shipped CSVs, not asserted from the formula change alone.
- Cross-checked the new floor buckets against `validate_math.py`'s
  independently-reported `min non-zero` figures (1.4x bonus, 2.3x super)
  rather than assuming the empty low buckets were correct.
- Grepped both changed files for em/en dashes: zero matches.
- This pass only reads `games/future_spinner/library/publish_files/*.csv` -
  no locked-file writes. Locked files confirmed untouched:
  `git diff --stat -- frontend/src/lib/services/rgsService.ts frontend/src/lib/stores/gameStore.ts games/future_spinner/ .claude/settings.json`
  is empty.

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** traced
  the original finding back to its exact arithmetic (cap/cost per mode)
  before deciding how to fix the bucketing, rather than just widening the
  bucket range or lowering the threshold until it looked better - the fix
  needed to change WHAT was measured (bet-multiple vs times-cost), not just
  how strictly it was judged.
- **Alternatives rejected:** simply removing the high-cost-mode bucket
  checks entirely (rejected - the underlying question, "are there
  unobtainable win ranges," is real and worth answering correctly for every
  mode, not skipped for the two where the original method broke down);
  keeping times-cost bucketing but only for the sub-cap range (rejected -
  bet-multiple bucketing is the more direct, honest measure of what the
  approval page is actually asking about, not a patched version of the
  wrong measurement).
- **Files touched:** `scripts/math_selfaudit_risk_metrics.py` (bet-multiple
  bucketing for buy modes), `reports/qa/math_selfaudit_2026-07-14.md`
  (win-range-gap section replaced, criterion reframed as PASS), this report
  + its dated archive copy. Locked files untouched (read-only throughout).
- **Open threads:** ITEM E (record corrections: LUFS note in the session
  report, CLAUDE.md optimiser-non-determinism line) remains, then starting
  the dev server for the owner's play-test.
