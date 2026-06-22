# Future Spinner, Independent Re-Simulation and Reproducibility Report

**Game:** Future Spinner
**Provider:** We Roll Spinners (Joshua Thompson, JTOSHIE)
**Platform:** Stake Engine (Carrot RGS)
**Type:** Sandboxed re-run of the full simulation pipeline, comparing the freshly generated bundle to the committed artifacts. Nothing under `games/future_spinner/` was modified; all outputs landed in `/tmp/fs_resim/`.

---

## 1. Header

| Field | Value |
|-------|-------|
| Date | 22 June 2026 |
| Repo commit | `93435cd` (HEAD at run time) |
| Sandbox path | `/tmp/fs_resim/` |
| Committed LUT SHA-256 (before) | `04c027b7fad49b5156c3a4dd95285adc441983ceff1fed2bbbb2502c58439470` |
| Committed LUT SHA-256 (after) | `04c027b7fad49b5156c3a4dd95285adc441983ceff1fed2bbbb2502c58439470` |
| Hashes match | YES. The committed lookup table was never touched. |
| Python | 3.11.15 |
| Scripts | `audit/resim_compare.py`, `audit/convergence.py` (re-runnable) |

The before-hash and after-hash of `games/future_spinner/library/publish_files/lookUpTable_base_0.csv` are identical, and `git diff games/future_spinner/` is empty, proving the real artifacts were not altered by the re-simulation.

---

## 2. Did the pipeline run, at what scale, deterministic?

**Yes.** The full production pipeline (`games/future_spinner/run.py`, `PRODUCTION = True`) ran end to end in the sandbox:

1. **Simulation** (`create_books`): 100,000 base-game spins across 10 Python threads (plus 100,000 bonus spins, required by `generate_configs`). The raw pool RTP per thread reported between roughly 3x and 11x, confirming the deliberately over-calibrated raw pool that the optimiser then down-weights to target.
2. **Config generation** (`generate_configs`): wrote `config.json`, the front-end config, `math_config.json`, and `index.json`.
3. **Optimisation** (`OptimizationExecution`): the Rust PigFarm optimiser built the wincap, scatter, 0 and basegame fences, ran 20 Rust threads to completion, and wrote the weighted `lookUpTable_base_0.csv`.
4. **Analytics**: wrote `statistics_summary.json` and the XLSX statistics workbook.

**Determinism status, two layers:**
- **Simulation is deterministic.** Each spin uses `random.seed(sim + 1)`. The freshly generated per-round payouts are byte-for-byte identical to the committed lookup table's payout column across all 100,000 rounds (verified, see Section 3).
- **The optimiser is stochastic.** It builds random initial distributions, so the weights it assigns differ from run to run (fresh total weight 1,125,899,906,783,855 versus committed 1,125,899,906,782,849, a difference of about 1,000 parts in 1.13e15). Both converge to the same target RTP. This is expected and is why the fresh LUT is not byte-identical to the committed one despite identical payouts.

**One environment fix was required** (recorded under the three-strike rule, strike 1): the SDK utility `utils/get_file_hash.py` used a Python 3.12-only nested same-quote f-string that is a syntax error under this environment's Python 3.11. It was patched in the sandbox copy only (a single-quote change, `arg.split('/')`), which is SDK framework code outside `games/future_spinner/` and outside the real repo. No game logic was changed. After the fix the pipeline ran cleanly on the first attempt.

---

## 3. Claimed versus re-simulated metrics

Computed from the freshly generated sandbox `publish_files/lookUpTable_base_0.csv` using the same exact-integer method as the audit (RTP = Σ(weight × payout) / (Σweight × 100)).

| Metric | Claimed | Re-simulated | Difference | Interpretation |
|--------|--------:|-------------:|-----------:|----------------|
| RTP | 96.3500% | 96.3500% | -0.0000 pp | Exact. The optimiser independently re-converged to the target. |
| Hit rate (win > 0) | 33.57% | 33.5724% | +0.0024 pp | Match (same fence partition). |
| Zero-win | 66.43% | 66.4276% | -0.0024 pp | Match. |
| Maximum win | 5,000x | 5,000.00x | 0.00x | Exact; confirmed in both the LUT and the books. |
| Volatility (weighted SD) | 16.26x | 16.31x | +0.05x | Within optimiser weighting variance. |
| Scatter trigger rate | 6.21% | 6.38% | +0.17 pp | Stochastic optimiser re-weighting of scatter rounds (see note). |
| Scatter average win | 95.1x | 95.86x | +0.76x | Same cause as above. |

**Interpretation of the differences.** RTP, hit rate, zero-win and maximum win match to four decimals or exactly, because they are pinned by the deterministic simulation and the optimiser's RTP target plus the forced fences. The volatility and the two scatter figures differ by small amounts that come entirely from the optimiser assigning slightly different weights to the same set of rounds on this run. The deterministic, weight-independent scatter evidence reproduces exactly: the raw scatter sim count is 6,478 in both runs, and the scatter award factors are identical (Section 7). None of the differences indicate a fault. The committed lookup table is the exact-validated source of truth (the audit confirmed it computes to 96.3500% precisely); a fresh optimiser pass simply lands on a statistically equivalent weighting.

### Books versus LUT cross-check (the check the audit could not do)

The books were absent from the repo during the read-only audit, so the per-round cross-check could not be run then. It can now, from the freshly generated bundle:

- `books_base.jsonl.zst` decompressed cleanly to **100,000 rounds** (book id range 0 to 99,999).
- The **sorted multiset of book `payoutMultiplier` values equals the LUT payout column exactly**, and they also align **positionally by id** (book id is 0-based and maps one-to-one to the LUT rows).
- The maximum book payout is **500,000 centibets (5,000.00x)** and **no round exceeds it**, confirming the win cap directly in the freshly simulated rounds.

---

## 4. Reproducibility verdict

**Yes. Re-playing the spins reproduces the published figures.** An independent, from-scratch run of the configured game regenerates the identical set of 100,000 round payouts, and an independent optimiser pass re-converges to exactly 96.3500% RTP with a 5,000x maximum. Every headline metric matches; the only differences are small, expected consequences of the optimiser's stochastic weighting and do not affect the validated published artifacts.

---

## 5. Bundle assembly and hash consistency

The sandbox run produced the **complete publish bundle**, which the repo previously lacked:

| File | SHA-256 (fresh sandbox) |
|------|-------------------------|
| `index.json` | `63c64048508a35940aa5fc5124489ceb9d1c774737411b3bd726779babb85107` |
| `lookUpTable_base_0.csv` | `43d62d23a36d427a17eda09249a1748b56a595755a20909c0ccbfdee3d1c70b7` |
| `books_base.jsonl.zst` | `a646825de53c53144e6451265cec045108d4a0155d3780b4cd390f1b15bbacf7` |

`index.json` is internally consistent: it lists the `base` mode (cost 1.0, events `books_base.jsonl.zst`, weights `lookUpTable_base_0.csv`) and the `bonus` mode (cost 100.0), and every file it references exists and parses. The bundle can therefore be assembled and hash-verified from the configuration. (Hashes are run-specific because the optimiser weights are stochastic; the structure and internal references are stable.)

---

## 6. Convergence result (Step 4)

A 5,000,000-spin Monte-Carlo replay was run by sampling rounds from the validated committed lookup table in proportion to their weights, which is exactly how the served game draws outcomes. Chart: `audit/charts/04_convergence_rtp.png`.

| Quantity | Result | Target |
|----------|-------:|-------:|
| Empirical RTP (5,000,000 spins) | 96.0725% | 96.3500% |
| Empirical hit rate | 33.585% | 33.57% |
| Empirical maximum | 5,000.0x | 5,000x |

The empirical RTP lands 0.28 pp below target, which is well within one standard error for this distribution: with a payout standard deviation of 16.26x over 5,000,000 spins, the standard error of the mean is about 16.26 / sqrt(5,000,000) which is roughly 0.73 pp. The variance is dominated by the rare 1-in-100,000 wincap events (about 50 expected in 5,000,000 spins, Poisson-noisy), which alone move the RTP by several tenths of a percentage point. The running-RTP curve trends toward 96.35% as the sample grows. The exact, noise-free RTP is the weighted enumeration in Section 3 (96.3500%); this Monte-Carlo replay is a sanity check and is consistent with it.

---

## 7. Scatter award factors the re-simulation reproduces

Extracted directly from the freshly simulated `books_base.jsonl.zst` scatter win events:

| Scatters on board | Award in the served data |
|------------------:|-------------------------:|
| 3 | 100 centibets = **1.0x** total bet |
| 4 | 300 centibets = **3.0x** total bet |
| 5 | 1,000 centibets = **10.0x** total bet |

The re-simulation confirms the served scatter factors are **1x / 3x / 10x**, matching `game_config.py` and PAR sheet section 2. They are **not** 5x / 15x / 50x. The 5/15/50 values survive only in stale code comments and, importantly, in the player-facing frontend `PaytableModal` (which advertises "3x = 5x, 4x = 15x, 5x = 50x"). That front-end text should be reconciled to the true served values of 1x / 3x / 10x before submission, so players are not shown awards the game does not pay.

---

## 8. Bottom line for the compliance file

**An independent re-simulation confirms the game behaves as the published maths and PAR sheet claim.** Running the full pipeline from scratch in an isolated sandbox regenerated the identical 100,000 round payouts (the simulation is deterministic), and an independent run of the Rust optimiser re-converged to exactly 96.3500% RTP with a hard 5,000x ceiling. The freshly generated books match the lookup table round for round, with no payout exceeding the cap, which is the bundle-level cross-check the earlier read-only audit could not perform. The full publish bundle (books, lookup table, index manifest) assembles and hash-verifies from the configuration. The only re-run differences (volatility 16.31x versus 16.26x, scatter rate 6.38% versus 6.21%, scatter average 95.86x versus 95.1x) are small and attributable to the optimiser's stochastic weighting, not to any error; the committed lookup table remains the exact-validated source of truth.

One action item, unchanged from the audit and reconfirmed here from live data: the player-facing paytable shows scatter awards of 5x / 15x / 50x, but the game actually pays 1x / 3x / 10x. Reconcile the frontend display to the true served factors before submission. This is a front-end display matter, not a maths fault.

The committed lookup table SHA-256 is unchanged from before the run, and `git diff games/future_spinner/` is empty: nothing real was touched.
