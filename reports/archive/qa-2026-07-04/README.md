# Archived QA artefacts (2026-07-04 soak run)

Moved out of `reports/qa/` in the 2026-07-08 hygiene pass. These are the original
2026-07-04 `qa_soak.mjs` run's logs, committed 2026-07-07 (commit `2d2e32d`, "feat(fe):
Build Diet v2") explicitly as historical evidence, not current verification - that
commit's own message says a fresh run was still owed once FeatureMath v2 shipped.

They predate:
- The B1 HUD reskin (`.spin-btn` selector went stale after this run).
- FeatureMath v2 (only base/bonus existed when this ran; five modes ship now).
- The Wiring Integrity Audit's cost-integrity/cost-visibility/buy-affordability-boundary
  gates (`qa_soak.mjs` has grown three more output files since -
  `cost-integrity-result.json`, `cost-visibility-result.json`,
  `buy-affordability-boundary-result.json` - that don't exist in this archive since they
  didn't exist yet at this run).

A fresh `npm run qa:soak` run stays owed, gated on audio per the standing sequencing
(Fable's 2026-07-07 verdict, section 4). When it lands, its output goes to
`reports/qa/` fresh; this folder stays as the historical record of the last full run.
