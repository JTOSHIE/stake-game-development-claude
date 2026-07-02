# FUTURE SPINNER - Probability Accounting Report (PAR Sheet)

**Game:** Future Spinner
**Provider:** We Roll Spinners
**Report Date:** 2026-07-03
**Simulation Basis:** 100,000 base-game spins (Stake Engine SDK v1)
**Optimiser:** PigFarm Rust, converged to 96.3500% RTP (0.0000% deviation)

---

## 1. GAME OVERVIEW

| Parameter              | Value                                   |
|------------------------|-----------------------------------------|
| Grid                   | 5 reels × 4 rows (20 symbol positions)  |
| Win mechanic           | Ways-to-win (up to 4^5 = 1,024 ways)   |
| Target RTP             | 96.35%                                  |
| Achieved RTP           | 96.3500%                                |
| Wincap                 | 5,000× bet                              |
| Volatility             | Medium-High                             |
| Min bet                | $0.10                                   |
| Max bet                | $100.00                                 |
| Special feature        | Instant Scatter Multiplier (stateless)  |
| Bonus buy              | No: base game only, single mode         |

---

## 2. PAYTABLE (per-way multipliers × bet)

*Final payout = paytable value × ways count × bet amount. Capped at 5,000× bet.*

| Match | H1 (Spinning Rim) | H2 (Turbocharger) | M1 (Car Grille) | M2 (Exhaust Pipe) | M3 (Steering Wheel) | L1 (Lug Nut) | L2 (Spark Plug) | L3 (Piston) |
|-------|------------------:|------------------:|----------------:|------------------:|--------------------:|-------------:|----------------:|------------:|
| 5-of  |             22.00 |             10.00 |            5.00 |              4.00 |                2.00 |         1.50 |            0.80 |        0.65 |
| 4-of  |              6.00 |              3.00 |            1.50 |              1.00 |                0.60 |         0.45 |            0.25 |        0.20 |
| 3-of  |              1.50 |              0.80 |            0.45 |              0.30 |                0.20 |         0.15 |            0.10 |        0.08 |

**Wild (W):** Substitutes for all pay symbols. No independent pay.
**Scatter (S):** Instant multiplier, pays below. Does not participate in ways calculation.

### Scatter Multiplier Table

| Scatters on board | Award (× total bet) |
|------------------:|--------------------:|
| 3 (any position)  |                1.0× |
| 4 (any position)  |                3.0× |
| 5 (one per reel)  |               10.0× |

*Scatter award stacks additively with any ways-to-win win on the same spin.*

---

## 3. REEL STRIP FREQUENCIES

*BR0 reel strip, 65 positions per reel, uniform across all 5 reels.*

| Symbol | Name            | Count / Reel | Density | P(≥1 visible / spin) | Avg visible / spin |
|--------|-----------------|:------------:|--------:|---------------------:|-------------------:|
| H1     | Spinning Rim    |      2       |   3.1%  |               46.0%  |               0.62 |
| H2     | Turbocharger    |      3       |   4.6%  |               59.8%  |               0.92 |
| M1     | Car Grille      |      5       |   7.7%  |               78.5%  |               1.54 |
| M2     | Exhaust Pipe    |      6       |   9.2%  |               84.7%  |               1.85 |
| M3     | Steering Wheel  |      8       |  12.3%  |               91.9%  |               2.46 |
| L1     | Lug Nut         |     10       |  15.4%  |               96.5%  |               3.08 |
| L2     | Spark Plug      |     12       |  18.5%  |               98.6%  |               3.69 |
| L3     | Piston          |     14       |  21.5%  |               99.5%  |               4.31 |
| W      | Wild            |      3       |   4.6%  |               59.8%  |               0.92 |
| S      | Scatter         |      2       |   3.1%  |               46.0%  |               0.62 |

*P(≥1 visible / spin) = 1 − (1 − density)^(4 rows) per reel, product across 5 reels.*
*Avg visible = 5 reels × 4 rows × density per position.*

---

## 4. SYMBOL COMBINATION HIT FREQUENCIES

*From 100,000 simulated base-game spins with optimised weights (canonical base-only publish run).*

| Combination | Hit Rate (1-in-N) | Frequency (%) | Avg Win (× bet) | Sim Count |
|-------------|------------------:|:-------------:|----------------:|----------:|
| H1 × 5      |           859.5   |    0.116%     |         192.1×  |       141 |
| H1 × 4      |           360.4   |    0.277%     |          72.8×  |       297 |
| H1 × 3      |           305.2   |    0.328%     |         180.8×  |       289 |
| H2 × 5      |           528.2   |    0.189%     |          77.1×  |       234 |
| H2 × 4      |           209.8   |    0.477%     |         102.5×  |       539 |
| H2 × 3      |           139.5   |    0.717%     |          89.7×  |       708 |
| M1 × 5      |           112.9   |    0.885%     |          92.9×  |       885 |
| M1 × 4      |            88.4   |    1.131%     |          84.8×  |     1,137 |
| M1 × 3      |           108.9   |    0.918%     |         112.0×  |       786 |
| M2 × 5      |            92.3   |    1.084%     |          77.5×  |     1,196 |
| M2 × 4      |            62.0   |    1.612%     |          88.0×  |     1,682 |
| M2 × 3      |            82.4   |    1.213%     |         104.4×  |     1,253 |
| M3 × 5      |            54.1   |    1.849%     |         103.0×  |     1,884 |
| M3 × 4      |            41.2   |    2.425%     |          74.4×  |     2,087 |
| M3 × 3      |            67.1   |    1.490%     |          76.5×  |     1,414 |
| L1 × 5      |            19.7   |    5.079%     |          89.8×  |     4,573 |
| L1 × 4      |            22.3   |    4.491%     |          93.0×  |     4,324 |
| L1 × 3      |            23.5   |    4.247%     |          95.0×  |     4,405 |
| L2 × 5      |            25.4   |    3.938%     |          85.2×  |     3,562 |
| L2 × 4      |            35.9   |    2.788%     |         104.7×  |     2,401 |
| L2 × 3      |            73.3   |    1.364%     |         126.1×  |     1,403 |
| L3 × 5      |            19.0   |    5.254%     |          83.6×  |     4,965 |
| L3 × 4      |            27.2   |    3.682%     |         104.7×  |     3,483 |
| L3 × 3      |            65.6   |    1.525%     |          96.8×  |     1,629 |

> **Note on Avg Win column:** Higher-order matches (×3/×4) can show elevated average wins because
> the ways multiplier dominates when multiple rows of the same symbol land simultaneously.
> The win per way is always lower for ×3 and ×4 than ×5 (see paytable above).
>
> Sim Count is the raw number of simulated rounds landing each combination, identical to the
> prior canonical run (the underlying per-round payouts are byte-identical). Hit Rate and Avg Win
> are weighted figures and shift slightly between optimiser runs at fixed RTP (see Section 9).

---

## 5. SCATTER FEATURE STATISTICS

| Metric                           | Value              |
|-----------------------------------|--------------------|
| Scatter hit rate (all spins)     | 1-in-15.7  (6.37%) |
| Scatter spin count (100k sample) | 6,478 spins        |
| Average scatter win              | 97.6× bet          |
| Forced scatter quota (base)      | 5.0% of spins      |
| Scatter 3-count weight           | 70% → 1.0× award  |
| Scatter 4-count weight           | 20% → 3.0× award  |
| Scatter 5-count weight           | 10% → 10.0× award |

*6.37% observed scatter rate vs 5.0% forced quota: the excess reflects scatters landing
naturally on basegame and wincap spins.*

---

## 6. WIN FREQUENCY TABLE

| Metric                              | Value                  |
|-------------------------------------|------------------------|
| Total spins simulated               | 100,000                |
| Spins with any win (win > 0)        | 33,572 (33.57%)        |
| Spins with zero payout              | 66,428 (66.43%)        |
| Overall hit rate                    | 1-in-3.0 spins         |
| Average win per spin (all spins)    | 0.9635× bet            |
| Average win per winning spin        | 2.87× bet              |
| Maximum win recorded                | 5,000× bet (wincap)    |

---

## 7. RTP BREAKDOWN

| Component              | Fence       | Hit Rate     | RTP Contribution | % of Total RTP |
|------------------------|-------------|:------------:|:----------------:|:--------------:|
| Ways-to-win line wins  | basegame    | 1-in-3.5     |      71.35%      |     74.07%     |
| Scatter multiplier     | scatter     | 1-in-20      |      20.00%      |     20.76%     |
| Wincap events (5,000×) | wincap      | 1-in-100,000 |       5.00%      |      5.19%     |
| Zero-win spins         | 0           | -            |       0.00%      |      0.00%     |
| **TOTAL**              |             |              |   **96.35%**     |   **100.00%**  |

*RTP verified by optimiser: 96.3500% (0.0000% deviation from target).*

---

## 8. WIN DISTRIBUTION

*Based on 100,000 optimised base-game spins (weighted LUT, canonical base-only publish run).*

| Win Tier      | % of Spins | Cumulative % |
|---------------|:----------:|:------------:|
| 0× (no win)   |   66.43%   |    66.43%    |
| 0×-1×         |   16.80%   |    83.22%    |
| 1×-5×         |   12.75%   |    95.98%    |
| 5×-20×        |    3.09%   |    99.07%    |
| 20×-100×      |    0.93%   |    99.99%    |
| 100×+         |    0.01%   |   100.00%    |

**Maximum win:** 5,000× bet (wincap)
**Wincap frequency:** 1-in-100,000 spins (0.001%)

### Payout Percentiles

| Percentile | Payout  |
|:----------:|--------:|
| P10        |  0.00×  |
| P25        |  0.00×  |
| P50        |  0.00×  |
| P75        |  0.60×  |
| P90        |  1.21×  |
| P95        |  3.15×  |
| P99        | 19.40×  |

---

## 9. VOLATILITY METRICS

| Metric                       | Value               |
|------------------------------|---------------------|
| Mean payout per spin         | 0.9635×             |
| Median payout per spin       | 0.00× (>50% zero)   |
| Standard deviation           | 16.23×              |
| Mean / Median ratio          | N/A (median = 0)    |
| Hit rate (win > 0)           | 33.57% (1-in-3.0)   |
| Zero-win spin quota          | 40.0% forced + natural |
| Volatility classification    | **Medium-High**     |

*Volatility rationale: 66% zero-win rate creates significant dry spells, while the
5,000× wincap and scatter multipliers provide strong positive-skew tail events.
Standard deviation of 16.23× against a mean of 0.96× confirms medium-high variance.*

---

## 10. DISTRIBUTION DESIGN PARAMETERS

| Parameter                    | Value           |
|------------------------------|-----------------|
| Simulation pool size (base)  | 100,000 spins   |
| LUT entries                  | 100,000         |
| Total LUT weight             | 1,125,899,906,781,129 |
| Zero-win quota (forced)      | 40.0%           |
| Scatter quota (forced)       | 5.0%            |
| Wincap quota (forced)        | 0.1%            |
| Basegame quota (free draw)   | 54.9%           |
| Optimiser threads            | 20 (Rust)       |
| Simulation threads           | 10 (Python)     |

---

## 11. SINGLE MODE DECLARATION

Future Spinner ships exactly one bet mode: base, cost 1.0× bet. It is stateless with an
instant scatter multiplier resolved entirely within the spin that triggers it. There is no
free spin round, no bonus game, no feature buy, no gamble feature and no continuation
mechanic of any kind. The published bundle (`index.json`, `game_metadata.json`,
`lookUpTable_base_0.csv`, `books_base.jsonl.zst`) contains base-mode artefacts only.

---

## 12. REGULATORY COMPLIANCE NOTES

- **RTP achieved:** 96.3500%, matching the 96.35% declared target.
- **Wincap enforced:** All payouts are capped at 5,000× bet at the engine level. No simulated outcome exceeds this value.
- **Zero-win policy:** The `auto_close_disabled` flag is `False`, so zero-win rounds are automatically closed by the RGS without player interaction required.
- **Scatter mechanic:** The scatter multiplier is resolved entirely within the same spin it is triggered (stateless). No free-spin rounds or deferred awards exist in this title.
- **No progressive jackpot:** This title has no progressive contribution or jackpot mechanic.
- **Single mode:** This title ships exactly one bet mode. See Section 11.

---

*Generated by Stake Engine Math SDK | We Roll Spinners | Future Spinner v1.0*
