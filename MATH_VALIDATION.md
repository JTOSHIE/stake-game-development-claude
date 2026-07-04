# Future Spinner - math validation

Independent recomputation of the headline maths **from the shipped lookup tables**
(`games/future_spinner/library/publish_files/lookUpTable_<mode>_0.csv`), with zero trust in
the PAR, gated against Stake Engine's compliance rubric. This is the pre-submission proof that
the published tables actually deliver the stated maths. Australian English, no em dashes.

Re-run any time: `python3 scripts/validate_math.py` (stdlib only; exits non-zero on a hard
compliance fail). It also runs automatically in CI via `.github/workflows/validate-math.yml`
whenever the lookup tables, `index.json`, or the script change, so a non-compliant table
fails the build. Last run 2026-07-04 - **ALL CHECKS PASS**.

## Verified results (recomputed from the tables)

| Metric | Base (cost 1x) | Bonus (cost 100x) | Stated | Match |
|---|---|---|---|---|
| RTP | **96.350000%** | **96.350000%** | 96.3500% | yes |
| Hit rate | **29.11%** | 100.00% | base 29.11% | yes |
| Std dev (volatility, bet-multiples) | **17.28x** | **206.63x** | 17.28 / 206.63 | yes |
| Max win | **5000x** | **5000x** | 5000x | yes |
| Max-win odds | **1 in 100,000** | **1 in 1,000** | 1-in-100k / 1-in-1k | yes |
| Rows (simulations) | 100,000 | 100,000 | 100,000 | yes |
| Unique payouts | 10,930 | 37,193 | - | - |
| Zero-payout rate | 70.89% | 0.00% | - | - |
| Min non-zero win | 0.08x | 1.4x | - | - |
| Cross-mode RTP variation | 0.0000% (both exactly 96.35%) | | <= 0.5% | yes |

Notes: the bonus buy has **no zero-payout outcome** (100% hit rate; min return 1.4x on the 100x
cost), which is why `REPLAY_TEST_EVENTS.md` lists no bonus "loss" event.

## Compliance rubric (all PASS)

- RTP within 90-98% (both 96.35%).
- Cross-mode RTP variation <= 0.5% (0.0000%).
- Base hit rate within 5-33% (29.11%).
- >= 100,000 outcomes per mode (100,000).
- >= 10 unique payouts (10,930 / 37,193).
- Zero-payout rate <= 90% (70.89% base).
- Max win reachable, odds <= 1 in 20,000,000 (1 in 100,000 / 1,000).

## Method

`scripts/validate_math.py` reads `index.json` for each mode's `cost` + `weights` file, then over
`sim_id,weight,payout` rows (payout = multiplier x100) computes, with integer weight sums to avoid
float drift: RTP = `sum(weight*payout)/sum(weight)/100/cost`; hit rate = weight fraction with
payout>0; weighted variance -> SD in bet-multiples; max-win odds = `sum(weight)/sum(weight at max
payout)`. It mirrors how the community LUT analyzer (mnemoo/tools) and StakeCLI's compliance check
read the same file, so our gate matches what the platform would compute. See `docs/TOOLING_REVIEW.md`.
