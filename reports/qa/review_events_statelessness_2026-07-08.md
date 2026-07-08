# REVIEW_EVENTS pass: statelessness scan (cruise / antelite / super)

- **Date:** 2026-07-08
- **Script:** `scripts/review_events_stateless_scan.py`
- **Raw output:** `reports/qa/review_events_statelessness_scan_result.json`
- **Purpose:** Fable's standing directive (2026-07-07 verdict item 2) - close the
  statelessness-verification gap FeatureMath v2 left for cruise/antelite (only `super` was
  independently proven stateless from its books at the time; cruise/antelite were ported
  verbatim from an already-validated library and not re-checked this specific way).

## Method

Every round's Overdrive meter is set once at the free-spin feature's start
(`gamestate.py`'s `_overdrive_start_meter()`, called from `run_freespin()` before the
free-spin loop begins) and only ever increments afterward (+1 per winning free spin,
never resets mid-round, never carries across rounds - `reset_book()` sets it back to 1
every time). This means: **the first winning free spin's `meta.globalMult` in every round
equals that round's starting meter value.** The distinct set of these values across all
100,000 rounds per mode proves two things at once:
1. **Statelessness** - if state leaked between rounds, this set would show drift/spread
   instead of collapsing to a single constant.
2. **Correctness** - the constant itself should be 1 for cruise/antelite (no pre-rev) and
   5 for super (NITRO OVERDRIVE's pre-rev), matching `gamestate.py`'s own logic.

This generalises the manual analysis originally done for `super` alone during FeatureMath
v2 (`reports/archive/2026-07-07_featuremath-v2.md`) into a reusable, committed script, and
extends it to cruise/antelite for the first time.

## Books used

Regenerated 2026-07-08 via `games/future_spinner/run.py` (run_sims only - no
re-optimisation, so the stochastic optimiser search could not introduce any drift from the
shipped lookup tables) under a temporary, owner-sanctioned lock exception (restored before
this commit, verified-empty diff). **Independently confirmed byte-identical** (SHA-256) to
the books originally generated during FeatureMath v2 and recorded in
`FUTURE_SPINNER_PAR_SHEET.md` section 9/10's hash table:

| File | SHA-256 (regenerated == PAR sheet recorded) |
|---|---|
| `books_cruise.jsonl.zst` | `7b5a1ddcfcdfde76a2f286a36992df5f9e8632cf9cfdc442fcc71dfd3fcc5b24` |
| `books_antelite.jsonl.zst` | `9e5e8a0ad24f00383a6497f7debdf1ecaf46145d7f23f7d5d345e86ffd381377` |
| `books_super.jsonl.zst` | `c079226d718cab54825b91d5fdab631d7d2f8dd542f432e9b7b6ec7d57347445` |

The three `lookUpTable_{cruise,antelite,super}_0.csv` files were also confirmed byte-for-byte
unchanged (diff empty) before and after regeneration - this pass is a pure read/analysis of
already-shipped, already-validated maths, not a new simulation or a re-derivation.

## Results

| Mode | Expected start meter | Observed distinct values | Rounds sampled (had >=1 free-spin win) | Result |
|---|---|---|---|---|
| Cruise | 1 | `{1}` | 6,100 / 100,000 (6.1%) | **STATELESS** |
| Antelite (OVERBOOST) | 1 | `{1}` | 24,249 / 100,000 (24.25%) | **STATELESS** |
| Super (NITRO OVERDRIVE) | 5 | `{5}` | 99,998 / 100,000 (100.0%) | **STATELESS** |

All three modes: exactly one distinct starting-meter value observed across every sampled
round, matching `gamestate.py`'s coded expectation exactly. No cross-round carry in any
mode.

## Coverage caveat (flagged, not glossed over)

A round whose free-spin sequence never wins contributes no data point to this specific
check (there is no dedicated "meter-at-feature-start" event independent of a win). Coverage
scales with each mode's free-spin win rate: cruise (low-volatility, low trigger-adjacent
win density) samples only 6.1% of its rounds this way; antelite samples 24.25%; super
(guaranteed trigger, richest feature) samples effectively all of them (99,998/100,000 - the
2 uncovered rounds are ones whose entire free-spin sequence happened to be a total loss,
which is itself an expected, non-anomalous outcome, not a data gap in the proof).

## Conclusion

Cruise, antelite and super are all independently confirmed stateless from their actual
shipped books, closing the item flagged in `SUBMISSION_DOSSIER.md` section 6. Combined
with the per-mode Bet Replay event IDs added to `REPLAY_TEST_EVENTS.md` in this same pass,
the REVIEW_EVENTS pass Fable's 2026-07-07 verdict named is complete.
