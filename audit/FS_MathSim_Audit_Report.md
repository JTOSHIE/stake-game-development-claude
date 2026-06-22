# Future Spinner — Maths and Simulation Deep Audit (Read-Only)

**Game:** Future Spinner
**Provider:** We Roll Spinners (Joshua Thompson, JTOSHIE)
**Platform:** Stake Engine (Carrot RGS)
**Audit type:** Independent, read-only verification of the locked maths model and published simulation artifacts. Nothing under `games/future_spinner/` was modified.

---

## 1. Header

| Field | Value |
|-------|-------|
| Audit date | 22 June 2026 |
| Repo commit | `6c1ee31482275a53374092ca4c276b0c7ab0f73d` |
| Python | 3.11.15 |
| Packages | numpy 2.4.6, pandas 3.0.3, matplotlib 3.11.0, scipy 1.17.1 |
| Analysis scripts | `audit/analyze.py`, `audit/check_config.py` (re-runnable end to end) |

### Locked artifacts present and their verified SHA-256 hashes

| File | Bytes | SHA-256 |
|------|------:|---------|
| `library/publish_files/lookUpTable_base_0.csv` | 1,996,051 | `04c027b7fad49b5156c3a4dd95285adc441983ceff1fed2bbbb2502c58439470` |
| `library/publish_files/lookUpTable_bonus_0.csv` | 989 | `2da35dda8a0df4beda762ef626180fccdad09da21ec5244bf4568f3cf7c32aa2` |
| `library/publish_files/game_metadata.json` | 500 | `b1a8e47a80e6a5dd704b2ca84626fc0945e2cc969aeb45b85955a17beab1f6dc` |

### Artifacts the prompt expected but that are absent in this repo

The prompt assumed `books_base.jsonl.zst` and `index.json` in `library/publish_files/`. Neither is present. The publish directory contains only the two lookup tables and `game_metadata.json`, plus `library/statistics_summary.json` and `library/future_spinner_full_statistics.xlsx`. This changes how several steps were run and is flagged throughout. The lookup table is the authoritative RTP source (the prompt confirms this), so the centrepiece RTP validation is unaffected.

---

## 2. Verdict summary (Steps 1 to 10)

| Step | Area | Verdict | Headline |
|------|------|---------|----------|
| 1 | File integrity | PARTIAL PASS | LUTs parse cleanly and pair to a 100,000-row distribution; no `index.json` manifest exists to hash-match against, and no books to pair (recorded, not a maths fault). |
| 2 | RTP validation | PASS | Computed RTP is exactly 96.3500%, zero deviation from the claim. |
| 3 | Statistical metrics | PASS | Hit rate, zero-win, max win, volatility, scatter rate and scatter average all match the claims. |
| 4 | Distribution and charts | PASS | Three charts generated; distribution confirms medium-high volatility. |
| 5 | Paytable and reels | PASS | 1,024 ways, paytable monotonic and matching the PAR sheet, reels uniform with no dead symbols. |
| 6 | Model correctness | PASS | Stateless, wincap configured at 5,000x and applied by the SDK; one piece of dead safety-cap code noted. |
| 7 | PAR cross-validation | PASS (1 minor note) | Every quantitative claim matches; one win-distribution boundary bucket is approximate. |
| 8 | Stake format compliance | PASS (with caveat) | LUT schema and scale separation are correct; the full publish bundle (books, index) should be confirmed present at submission. |
| 9 | Reproducibility | SKIPPED | RTP is optimiser-produced over a deliberately mis-calibrated raw pool, so a no-optimiser re-sim cannot reproduce it by construction; LUT computation is authoritative. |
| 10 | Edge cases | PASS | No outcome exceeds 5,000x; weights partition to 100%; the 5,000x tail is genuinely reachable. |

**Overall: the backend maths is sound and the published distribution yields the claimed 96.3500% RTP.** See Section 9 for issues and Section 10 for the bottom line.

---

## 3. Metric verification table

| Metric | Claimed | Computed | Difference | Result |
|--------|--------:|---------:|-----------:|:------:|
| RTP | 96.3500% | 96.3500% | -0.0000 pp | MATCH |
| Hit rate (win > 0) | 33.57% | 33.5724% | +0.0024 pp | MATCH |
| Zero-win probability | 66.43% | 66.4276% | -0.0024 pp | MATCH |
| Hit + zero (partition) | 100% | 100.0000% | 0.0000 pp | MATCH |
| Maximum win | 5,000x | 5,000.00x | 0.00x | MATCH |
| Volatility (weighted SD) | 16.26x | 16.2599x | -0.0001x | MATCH |
| Mean payout per spin | 0.9635x | 0.9635x | 0.0000x | MATCH |
| Avg win per winning spin | 2.87x | 2.8699x | -0.0001x | MATCH |
| Scatter trigger rate | 6.21% | 6.2125% | +0.0025 pp | MATCH |
| Scatter average win | 95.1x | 95.073x | -0.027x | MATCH |
| Total LUT weight | 1,125,899,906,782,849 | 1,125,899,906,782,849 | 0 | MATCH |
| LUT entries | 100,000 | 100,000 | 0 | MATCH |

Scatter trigger rate and scatter average win are taken from `library/statistics_summary.json` (the SDK's weighted summary over the same optimised distribution), because per-round scatter labelling requires the books, which are not published in this repo. The LUT alone carries `[id, weight, payout]` with no criteria column, so scatter rounds cannot be isolated from the LUT directly. Method stated for transparency.

---

## 4. RTP validation detail (centrepiece)

### Schema discovered from the data (not assumed)

`lookUpTable_base_0.csv` has three unlabelled integer columns:

```
column 0 = simulation_id   (0 .. 99,999)
column 1 = weight          (integer probability weight from the optimiser)
column 2 = payout          (total round win in centibets, i.e. bet-multiple x 100)
```

Example rows: `0,64097884,390` is id 0, weight 64,097,884, payout 3.90x. `1,18697699120,0` is a zero-win round carrying a large weight.

### Formula

Payout is already in centibets (book scale x100) and base-mode cost is 1.0 bet (`statistics_summary.json -> cost_mapping.base = 1.0`). The probability-weighted RTP is:

```
RTP = ( Σ_i  weight_i × payout_i ) / ( Σ_i weight_i × 100 )
```

computed with exact Python integer arithmetic (weights and payouts are integers) and a final `fractions.Fraction` division, so the fourth decimal is exact rather than float-rounded.

### Result

```
Σ weight                = 1,125,899,906,782,849
Σ (weight × payout)     = (exact integer, see audit_results.json)
RTP                     = 96.3500%   (claim 96.3500%, deviation -0.0000 pp)
```

The deviation is below the 0.0001 pp flag threshold. PASS.

### Base versus scatter decomposition

From the SDK fence configuration (`statistics_summary.json -> mode_fence_info.base`) plus the wincap quota:

| Component | RTP contribution |
|-----------|-----------------:|
| Basegame (ways-to-win) | 71.35% |
| Scatter multiplier | 20.00% |
| Wincap events (5,000x) | 5.00% |
| **Total** | **96.35%** |

The three components sum to exactly 96.35%, matching PAR sheet section 7. (A full per-round books decomposition was not possible without the books file; this fence decomposition is the SDK's own and is internally consistent with the total.)

### Cross-check against the books

Skipped: `books_base.jsonl.zst` is not present in the repo, so the books-versus-LUT per-round payout cross-check could not be run. Recorded as a gap, not a fault. The LUT is the artifact the RGS serves and it is internally complete and self-consistent (entries, weights, payouts all parse and yield the exact target RTP).

---

## 5. Distribution analysis

### Win-multiplier bucket table (weighted)

| Bucket | Probability | RTP contribution | LUT rows |
|--------|------------:|-----------------:|---------:|
| 0 (no win) | 66.4276% | 0.0000 pp | 40,000 |
| 0 to 1x | 18.5251% | 11.0089 pp | 19,560 |
| 1 to 2x | 9.9879% | 12.7214 pp | 11,499 |
| 2 to 5x | 1.1427% | 3.8648 pp | 14,913 |
| 5 to 10x | 1.1678% | 8.5682 pp | 8,165 |
| 10 to 50x | 2.6858% | 51.1748 pp | 5,653 |
| 50 to 100x | 0.0575% | 3.5097 pp | 99 |
| 100 to 500x | 0.0045% | 0.5022 pp | 11 |
| 500 to 5,000x | 0.0010% | 5.0000 pp | 100 |

Probabilities sum to 100% and RTP contributions sum to 96.35 pp. Note the 40,000 zero-payout rows carry 66.43% of the weight (consistent with the 40% forced zero-win quota plus naturally zero spins), and the 500 to 5,000x bucket is exactly 100 rows carrying 5.00 pp of RTP (the 1-in-100,000 wincap quota, weight-scaled).

### Charts (saved to `audit/charts/`)

- `01_payout_distribution.png` — weighted payout-multiplier histogram, log-log, winning spins.
- `02_bucket_chart.png` — probability (log) and RTP contribution per bucket.
- `03_cumulative_rtp.png` — cumulative RTP-contribution curve (volatility profile).

### Volatility prose

The distribution strongly supports the medium-high volatility classification. Two thirds of spins (66.43%) return nothing, and a further ~28.5% return between 0 and 2x, so the great majority of outcomes are small or zero. Meanwhile a thin tail does the heavy lifting: the 10 to 50x bucket alone contributes 51.2 pp of the 96.35 pp RTP, and the top 1% of outcomes by weight account for roughly 36.5% of all RTP. A weighted standard deviation of 16.26x against a mean of 0.96x (a coefficient of variation near 17) is squarely in medium-high territory: frequent dry spells punctuated by rare, large positive-skew events, with a hard 5,000x ceiling. This matches the design intent and the PAR sheet narrative.

---

## 6. Paytable, reel-strip, and model findings

### Paytable (game_config.py, lines 172 to 217)

Matches PAR sheet section 2 value-for-value across all 24 entries. All values positive. Monotonic by tier at every match length (H1 >= H2 >= M1 >= M2 >= M3 >= L1 >= L2 >= L3) and monotonic by match within every symbol (5-of >= 4-of >= 3-of). Every referenced symbol is valid.

### Ways-to-win

`num_reels = 5`, `num_rows = [4,4,4,4,4]`, so 4^5 = 1,024 ways. Matches the config, `game_metadata.json` (`waysToWin: 1024`), and the PAR sheet.

### Reel strips (reels/BR0.csv, reels/BRWCAP.csv)

- **BR0**: 65 positions per reel across 5 reels, all symbols valid, and the per-reel composition is uniform across all five reels at exactly H1=2, H2=3, M1=5, M2=6, M3=8, L1=10, L2=12, L3=14, W=3, S=2. This matches PAR sheet section 3 exactly. Every paying symbol and both specials appear, so there are no dead or unreachable symbols.
- **BRWCAP** (forced wincap strip): 65 positions, only H1, L3 and W. This is a high-pay and wild heavy strip whose purpose is to drive the 5,000x ceiling when H1 lands across many rows. Consistent with the design comment in game_config.py.

### Scatter logic

`scatter_multiplier_table = {3: 1.0, 4: 3.0, 5: 10.0}`, monotonic, paying from anywhere on the grid as an instant, same-spin (stateless) award that stacks additively with ways wins. This matches PAR sheet section 2. See NOTE 1 about stale comments that still reference the older 5/15/50 values.

### Model correctness (gamestate.py, game_executables/game_calculation.py, run.py)

- **Statelessness confirmed.** `freeGameWins` is always 0.0 and the code comments it as a stateless game. `run_freespin()` exists as an SDK hook but is never called during normal play. The scatter award is resolved within the triggering spin. No jackpot, gamble, double-or-nothing, continuation, or early-cashout logic exists anywhere in the game files.
- **Wincap.** The ceiling is configured as `_WINCAP = 5000.0` (`self.wincap`), and the SDK's inherited `evaluate_wincap()` is invoked in the evaluation flow (`game_calculation.py`), with a `wincap_triggered` guard that suppresses further awards once the cap is reached. The data confirms enforcement: the maximum payout in the LUT is exactly 500,000 centibets (5,000.00x) and nothing exceeds it.
- **Payout scale.** Payouts are integers in centibets throughout the book and LUT; the evaluation comments work consistently in centibets (for example 50.0x ways = 5,000 centibets). No float accumulation is used in the published payout column (the LUT stores integers), so there is no float-precision hazard in the served data.

---

## 7. PAR sheet cross-validation

Every quantitative claim in `FUTURE_SPINNER_PAR_SHEET.md` was checked against the independently computed values.

| PAR claim | PAR value | Computed | Result |
|-----------|----------:|---------:|:------:|
| Achieved RTP (s1, s7, s12) | 96.3500% | 96.3500% | MATCH |
| Grid / ways (s1) | 5x4, 1,024 | 5x4, 1,024 | MATCH |
| Wincap (s1, s12) | 5,000x | 5,000.00x max | MATCH |
| Full paytable (s2) | 24 values | identical | MATCH |
| Scatter table (s2) | 1.0 / 3.0 / 10.0 | 1.0 / 3.0 / 10.0 | MATCH |
| Reel composition (s3) | counts per reel | identical, uniform | MATCH |
| Symbol hit/avg/count (s4) | 24 rows | match statistics_summary | MATCH |
| Scatter hit rate (s5) | 1-in-16.1 (6.21%) | 6.2125% | MATCH |
| Scatter avg win (s5) | 95.1x | 95.073x | MATCH |
| Scatter sim count (s5) | 6,478 | 6,478 | MATCH |
| Spins with win (s6) | 33,570 (33.57%) | 33.5724% | MATCH |
| Zero-payout spins (s6) | 66,430 (66.43%) | 66.4276% | MATCH |
| Avg win per spin (s6, s9) | 0.9635x | 0.9635x | MATCH |
| Avg win per winning spin (s6) | 2.87x | 2.8699x | MATCH |
| RTP breakdown (s7) | 71.35 / 20.00 / 5.00 | sums to 96.35 | MATCH |
| Standard deviation (s9) | 16.26x | 16.2599x | MATCH |
| Total LUT weight (s10) | 1,125,899,906,782,849 | identical | MATCH |
| LUT entries (s10) | 100,000 | 100,000 | MATCH |
| Win distribution (s8) | tier table | see note below | MINOR NOTE |

**All twelve GLI-11 sections are present and complete** (sections 1 through 12 in the PAR sheet: overview, paytable, reel frequencies, combination hit frequencies, scatter statistics, win frequency, RTP breakdown, win distribution, volatility, distribution design, bonus buy, regulatory notes).

**Minor note on section 8 (win distribution):** the PAR sheet's coarse tier table lists 0 to 1x as 18.94% and 1 to 5x as 10.72%, whereas the LUT gives 18.53% and 11.13% for the same ranges (cumulative at 1x: 84.95% computed vs 85.37% stated, a 0.42 pp difference). This is a boundary-inclusivity or rounding choice at exactly the 1.00x mark (there is a meaningful mass of outcomes paying exactly 1.0x, for example the 3-scatter award), not a maths error. Every headline metric, the percentile table, and the RTP all match exactly.

---

## 8. Stake Engine format compliance

- **Lookup table schema** `[id, weight, payout_centibets]` is the standard Stake Engine optimised LUT format. It parses cleanly with 100,000 rows.
- **Scale separation** is correct and consistent: the maths and book layer uses the x100 (centibet) scale, while the wallet layer uses the x1,000,000 (micros) scale (confirmed in the frontend `rgsService.ts`, `CURRENCY_SCALE = 1_000_000`). The two are kept distinct, as Stake's currency model requires.
- **`game_metadata.json`** is well formed and consistent with the model (grid 5x4, ways 1,024, rtpTarget 96.35, stateless true, modes base).
- **Caveat:** no `index.json` publish manifest and no `books_base.jsonl.zst` are present in this repo, and no Stake Engine SDK example files were found to diff against. The lookup tables themselves are compliant, but a reviewer should confirm the complete publish bundle (books and index manifest with hashes) is assembled and hash-checked at the actual submission step, since those files could not be audited here.

---

## 9. Issues found

### NOTE 1 (QUALITY): stale 5/15/50 comments for the scatter table
`game_config.py` lines 249 to 251 and `game_executables/game_calculation.py` line 684 still describe the scatter award as 5x / 15x / 50x ("jackpot feature"), but the live `scatter_multiplier_table` is 1.0 / 3.0 / 10.0, which is what the PAR sheet and the served data use. The comments are misleading but have no effect on the maths. Worth tidying for certification readability. (The locked frontend `PaytableModal.svelte` also still advertises 5x/15x/50x to players, which is a separate front-end discrepancy already outside this maths audit's scope but worth flagging to the team.)

### NOTE 2 (QUALITY): dead safety-cap code
`gamestate.py` defines `accept()` (line 248) which rejects any payout above 10,000 centibets (100x), explicitly lower than the production wincap. A repository-wide search shows `accept()` is never called, so it did not constrain the published 5,000x outcomes (the LUT genuinely contains 100 outcomes at exactly 5,000x). It is harmless dead code, but the comment says it "should be raised to the production wincap value or removed entirely"; doing so would remove a latent foot-gun.

### NOTE 3 (NOTE): PAR section 8 boundary bucket
As described in Section 7, the win-distribution tier table is approximate at the 1.00x boundary (about 0.42 pp). Cosmetic; all headline metrics match.

### NOTE 4 (NOTE): bonus mode present in artifacts but not in metadata modes
`lookUpTable_bonus_0.csv` exists (100 entries) and `game_metadata.json` lists `modes: ["base"]` only, while the PAR sheet section 11 documents a bonus-buy mode at 100x cost. The bonus LUT computes to a mean of 100.535x at 100x cost (about 100.54% RTP over only 100 sampled entries, which is a tiny, non-representative sample and not the production bonus distribution). If bonus buy is intended to ship, the metadata modes list and a full bonus distribution need attention; if it is not shipping (the front end exposes no bonus buy), the stray bonus artifact and PAR section 11 are informational only. Flagged for the team to resolve intent.

### No BLOCKERS found.
Nothing in the maths model or the published base distribution would fail submission on correctness grounds.

---

## 10. Bottom line (plain language)

**Is the backend maths sound and submission-ready? Yes, for the base game.**

The published base lookup table yields exactly the claimed 96.3500% RTP, computed independently with exact integer arithmetic. Every headline statistic the PAR sheet claims (hit rate 33.57%, zero-win 66.43%, volatility 16.26x, maximum win 5,000x, scatter rate 6.21%, scatter average 95.1x, total LUT weight, entry count) reproduces from the real data. The paytable, reel strips and 1,024 ways are internally consistent and match the PAR sheet. The model is stateless with a correctly configured and data-confirmed 5,000x ceiling, and there is no jackpot, gamble or carry-over logic. All twelve GLI-11 PAR sections are present.

Before final submission, three housekeeping items are worth closing, none of which affect the maths: (1) tidy the stale 5/15/50 scatter comments and the matching front-end paytable text so player-facing and code documentation agree with the actual 1/3/10 awards; (2) remove or raise the unused `accept()` safety cap; and (3) decide the bonus-buy intent and, if shipping, supply a full bonus distribution and add it to the metadata modes. Separately, confirm the complete publish bundle (the books file and an `index.json` manifest with hashes) is assembled and hash-verified at the submission step, since those files were not present in this repo to audit.

---

## Methodology and reproducibility

- `audit/analyze.py` computes the RTP, hit rate, zero-win, max, volatility, buckets, cumulative curve, bonus RTP, and SHA-256 hashes, and writes `audit/audit_results.json` and the three charts.
- `audit/check_config.py` validates ways, reel strips, paytable monotonicity and the scatter table, and writes `audit/config_results.json`.
- Both scripts run end to end and read only from `games/future_spinner/`. No scratch decompression was needed (no compressed books exist). The `audit/scratch/` directory was created per the brief but is empty.

## Step 9 (reproducibility) — why skipped

The game's RTP is not a property of the raw simulation pool; it is produced by the PigFarm Rust optimiser assigning weights to a deliberately mis-calibrated pool (game_config.py states the raw pool RTP is calibrated to roughly 200 to 300 percent of target so the optimiser can converge). A fresh book-generation run without the optimiser therefore cannot reproduce 96.35% by construction, and re-running the optimiser is both explicitly excluded by the brief and operationally heavy and risky (Rust build, writes into the publish path). The Step 2 lookup-table computation is the authoritative RTP validation and it passes exactly, so the reproducibility sanity check adds no assurance here and is skipped with this reason recorded.
