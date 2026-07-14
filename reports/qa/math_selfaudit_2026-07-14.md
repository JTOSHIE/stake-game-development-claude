# Math self-audit, 2026-07-14

ITEM 3 of the 2026-07-14 work order (JOB 3b). Walks every criterion on
stake-engine.com/docs/approval-guidelines/math-verification (captured
2026-07-04, `docs/stake-engine-live/math-verification.md`) against numbers
independently recomputed fresh from the shipped `lookUpTable_*.csv` files, in
the order the page lists them. Every number below comes from
`scripts/validate_math.py` (existing, re-run fresh this pass) or
`scripts/math_selfaudit_risk_metrics.py` (new this pass, for the two metrics
`validate_math.py` did not previously compute: CVaR and ETL). Both scripts
are committed and re-runnable - nothing here is a one-off manual claim.

Target rating per CLAUDE.md: **3 stars.** All limits quoted below are the
3-star column from the captured approval page.

## Summary statistics

### "Verify the mode cost is correctly represented in the game rules for each mode"

| Mode | Cost | Shown in `PaytableModal.svelte`'s Bet Modes section |
|---|---|---|
| Normal (base) | 1.0x | `1x · $1.00` (at $1 bet) |
| Cruise | 1.0x | `1x · $1.00` |
| OVERBOOST (antelite) | 1.25x | `1.25x · $1.25` |
| Buy Overdrive (bonus) | 100x | `100x · $100.00` |
| NITRO OVERDRIVE (super) | 400x | `400x · $400.00` |

**PASS** - matches `config/fsModes.ts`'s `FS_MODES[].cost` exactly (the single
source of truth both the FEATURES menu and the paytable render from), which
in turn matches `game_config.py`'s `BetMode(cost=...)` values per mode.

### "The calculated RTP must be within 90.0%-96.70%. For multiple modes, all must fall within a 0.5% variation"

| Mode | RTP (recomputed fresh) |
|---|---|
| base | 96.350000% |
| cruise | 96.350000% |
| antelite | 96.350000% |
| bonus | 96.350000% |
| super | 96.350000% |

**PASS** - every mode is within the 90.0%-96.70% band, and the cross-mode
spread is 0.0000pp (all five modes identical to 6dp), far inside the 0.5%
tolerance.

### "Ensure the maximum win amount matches the description in the game rules for each mode"

Every mode's shipped table caps at exactly 5,000x (`max win 5000x` in
`validate_math.py`'s per-mode output); `PaytableModal.svelte` states "Max Win
5,000x" both globally and now per-mode (ITEM 1, this work order). **PASS.**

### "The maximum win must be realistically obtainable (typically more frequent than 1 in 10,000,000)"

| Mode | Max-win odds |
|---|---|
| base | 1 in 100,000 |
| cruise | 1 in 250,000 |
| antelite | 1 in 80,000 |
| bonus | 1 in 1,000 |
| super | 1 in 250 |

**PASS** - every mode's wincap is far more frequent than the 1-in-10,000,000
floor; the least frequent (cruise, 1 in 250,000) is still 40x more obtainable
than the limit.

### "For slot-type games, run 100,000-1,000,000 simulations..."

100,000 rows per mode (`rows 100,000` in `validate_math.py`'s output, all
five modes). **Meets the stated floor exactly, not the upper end of the
100k-1M range** - flagging as worth noting rather than silently treating
100k as automatically sufficient, though it is the documented minimum, not a
shortfall against it.

### "A reasonable portion of simulations should yield paying results"

| Mode | Hit rate (non-zero-payout rate) |
|---|---|
| base | 29.11% |
| cruise | 43.86% |
| antelite | 29.44% |
| bonus | 100.00% |
| super | 100.00% |

**PASS** - none remotely close to the page's "90,000 non-paying out of
100,000" rejection example (i.e. <=10% hit rate); the lowest (base, 29.11%)
is still roughly 3x that floor. bonus/super hit 100% by design (every
buy-tier round guarantees the feature, which always pays at least the
1x/3x/10x instant scatter award).

### "The hit-rate of the most likely single simulation should not be overwhelmingly dominant"

| Mode | Most-likely single outcome's weighted share |
|---|---|
| base | 0.387% |
| cruise | 0.772% |
| antelite | 0.550% |
| bonus | 0.041% |
| super | 0.028% |

**PASS, comfortably** - no mode's single most common result exceeds 1% of
total weight; nothing close to "overwhelmingly dominant."

## Other considerations

### "Non-zero wins should align with industry standards (<1 in 20 bets, or more frequent)"

Reading the page's own hit-rate figures above (29.11%-100%), every mode
clears 1-in-20 (5%) by a wide margin - the tightest (base) is still roughly
6x more frequent than the floor. **PASS.**

### "For BASE modes (1.0x cost), the standard deviation should be within industry norms"

Base (1.0x cost) SD = **17.28x**. 3-star band is 0.6-60.0. **PASS**, sitting
comfortably mid-band (cruise, also 1.0x cost as the other standing mode, is
11.29x - lower-volatility by design, also well within band).

### "List the number of non-zero weight payouts. Zero-weight payouts should not dominate"

| Mode | Unique non-zero payouts | Zero-payout rate |
|---|---|---|
| base | 10,930 | 70.89% |
| cruise | 5,837 | 56.14% |
| antelite | 14,814 | 70.56% |
| bonus | 37,193 | 0.00% |
| super | 46,049 | 0.00% |

Payout diversity is high across every mode (thousands of distinct non-zero
values). Zero-payout rate is the complement of the hit rate above (already
assessed as reasonable); it does not "dominate" in the sense of crowding out
paying diversity - non-zero unique payout counts are large and don't cluster
on a handful of values. **PASS.**

### "Inspect hit-rates for win-ranges to avoid gaps"

Bucketed every mode's payouts on a log-ish scale (in "times cost" units) and
looked for empty bands:

| Mode | Empty buckets found |
|---|---|
| base | `[2500-5000)x` only |
| cruise | `[2500-5000)x` only |
| antelite | `[5000-5001)x` only (an exact-boundary artefact, not a real gap) |
| bonus | `[100-250)x`, `[250-500)x`, `[500-1000)x`, `[1000-2500)x`, `[2500-5000)x`, `[5000-5001)x` |
| super | `[20-50)x` through `[5000-5001)x` (eight consecutive buckets) |

**Read plainly, not glossed over**: base/cruise/antelite's single empty
bucket is exactly what you'd expect either side of a discrete wincap outcome
(5,000x is a special, separately-modelled result, not part of a continuous
tail) - not a real gap. **bonus and super show a genuinely wide empty band**
between their typical feature payout range and the 5,000x cap. This reflects
the buy-tier reward structure being naturally lumpy at the high end (a
guaranteed-feature buy's payout comes from the Overdrive meter/ways-win
combination, not a smooth continuum extending to the cap) rather than a
coding defect - but it is exactly the kind of gap the approval page's own
wording flags for reviewer attention ("intermediate wins should exist between
small payouts and the maximum payout amount"). **Flagging this for Fable/the
owner's judgement, not silently calling it compliant** - the shipped maths is
locked and already through prior review passes, so this is a disclosure, not
a proposal to change anything.

## Risk-limit criteria (3-star column)

| Criterion | 3-star limit | Worst mode | Value | Verdict |
|---|---|---|---|---|
| Maximum Payout Multiplier | 100,000x | all | 5,000x | PASS, 20x headroom |
| Maximum Cost Multiplier | 1,500x | super | 400x | PASS |
| Base (1.0x) SD | 0.6-60.0 | base/cruise | 17.28x / 11.29x | PASS |
| P(>=5000x), cost-scaled | 1e-2 | super | 3.20e-3 (raw 4.00e-3 x 0.8 scale, 200<=cost<500 tier) | PASS |
| Risk Limits (CVaR, normalized) | 800 | antelite | 205.7 | PASS |
| Liability (ETL, >=40x cost) | 0.9 | antelite | 0.6654 | PASS |

Full per-mode CVaR/ETL (all computed fresh this pass,
`scripts/math_selfaudit_risk_metrics.py`):

| Mode | CVaR (normalized) | ETL (>=40x cost, normalized) |
|---|---|---|
| base | 182.4 | 0.5239 |
| cruise | 111.1 | 0.3351 |
| antelite | 205.7 | 0.6654 |
| bonus | 50.0 | 0.0519 |
| super | 12.5 | 0.0000 (threshold 16,000x cost; the 5,000x hard cap never reaches it) |

All comfortably under the 800/0.9 limits, worst case (antelite) at roughly a
quarter of the CVaR ceiling and about 74% of the ETL ceiling. **PASS across
the board** - antelite is the mode to watch if any future maths change is
ever proposed, since it carries the highest tail-risk concentration of the
five, but it is not close to either limit today.

The page's second ETL definition, "Liability (ETL, P(>10000))" (limit 0.8),
is **trivially 0.0 for every mode** - the shipped hard cap is 5,000x, which
never reaches the >10,000x threshold that metric is defined against. Noted
explicitly rather than silently omitted.

## Not computed / marginal items, disclosed

- The 100,000-simulation floor is met exactly, not exceeded - see above.
- The bonus/super win-range gaps above are real and worth a second pair of
  eyes, even though they read as an artefact of the reward structure rather
  than a defect.
- CVaR/ETL had no prior committed implementation in this repo before this
  pass (`validate_math.py` does not compute them) - `scripts/
  math_selfaudit_risk_metrics.py` is new, and its formulas (worst-0.1%-tail
  weighted average for CVaR, RTP-share-from->=40x-cost wins for ETL) are
  built directly from the approval page's own prose definitions, not
  independently cross-checked against a second source - flagged as a
  first-implementation, not a re-verification of an existing one.

## Verification

- `python3 scripts/validate_math.py` re-run fresh this pass: all five modes
  96.350000% RTP, all existing cross-checks pass.
- `python3 scripts/math_selfaudit_risk_metrics.py` (new) run fresh against
  the same shipped CSVs: CVaR/ETL/gap-scan/dominance numbers above.
- Locked files confirmed untouched (this pass only reads
  `games/future_spinner/library/publish_files/*.csv`, never writes to them):
  `git diff --stat -- frontend/src/lib/services/rgsService.ts frontend/src/lib/stores/gameStore.ts games/future_spinner/ .claude/settings.json` is empty.
