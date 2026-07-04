# FUTURE SPINNER - Probability Accounting Report (PAR Sheet)

**Game:** Future Spinner
**Provider:** We Roll Spinners
**Report Date:** 2026-07-05
**Feature:** OVERDRIVE FREE SPINS (template library of 11 bet modes, see section 1A)
**Simulation Basis:** 100,000 rounds per mode (Stake Engine SDK v1)
**Optimiser:** PigFarm Rust, all eleven modes converged to 96.3500% RTP

---

## 1. GAME OVERVIEW

| Parameter              | Value                                     |
|------------------------|-------------------------------------------|
| Grid                   | 5 reels x 4 rows (20 symbol positions)    |
| Win mechanic           | Ways-to-win (up to 4^5 = 1,024 ways)     |
| Bet modes              | Template library of 11 (see section 1A); a shipped skin selects a subset |
| Target RTP             | 96.35% (every mode, cross-mode variation 0.0000%) |
| Wincap                 | 5,000x bet (hard, all modes)              |
| Volatility range       | SD 11.10x (cruise) to 969x (hyperbuy)     |
| Min bet                | $0.10                                     |
| Max bet                | $100.00                                   |
| Feature                | Overdrive Free Spins with progressive multiplier |

---

## 1A. MODE LIBRARY (template; every mode 96.3500% RTP, 5,000x cap)

This game is a reusable template. All eleven modes below are generated and independently
validated (`scripts/validate_math.py`) at the same 96.3500% RTP (cross-mode variation 0.0000%,
within the 0.5% rule) and share the 5,000x cap. A shipped skin selects a subset; the remaining
modes stay available in the library.

| Mode | Type | Cost | Volatility SD | Character |
|---|---|---|---|---|
| cruise    | standing | 1.0x   | 11.10x | low-vol, frequent small wins (hit 43.9%) |
| base      | standing | 1.0x   | 17.28x | standard game (hit 29.1%) |
| antelite  | standing | 1.25x  | 20.31x | +25% for ~1.6x trigger rate |
| ante      | standing | 1.5x   | 23.26x | +50% for ~2x trigger rate (Double Chance) |
| volatile  | standing | 1.0x   | 24.28x | high-vol: more feature + tail, fewer base wins |
| superante | standing | 2.0x   | 26.41x | 2x for ~3x trigger rate (heavy ante) |
| minibuy   | buy      | 80x    | 178x   | cheapest guaranteed entry (3-scatter weighted) |
| bonus     | buy      | 100x   | 206.63x| standard guaranteed entry |
| superbuy  | buy      | 300x   | 407x   | rich guaranteed entry (4/5-scatter) |
| megabuy   | buy      | 500x   | 633x   | richest entry |
| hyperbuy  | buy      | 1000x  | 969x   | richest entry, top of the cost range |

Sections 5, 5A, 5B below give the detailed per-mode statistics and RTP fence budgets for the
core modes (base, cruise, ante, bonus); the remaining modes follow the same construction (same
reels, feature and cap; only the fence RTP split, hit-rate and cost differ).

---

## 2. THE OVERDRIVE FREE SPINS FEATURE

- **Trigger:** 3, 4 or 5 scatters in the base game award 8, 12 or 16 free spins
  AND pay the instant scatter award of 1x, 3x or 10x total bet.
- **Overdrive meter:** the free-spin round starts at multiplier 1x. After every
  WINNING free spin the meter increases by +1x and applies to all subsequent
  free-spin wins (ways wins and scatter pays alike). It never resets during the
  round and is not retroactive. There is no cap on the meter beyond the round
  win cap.
- **Retrigger:** 3 or more scatters during free spins award +5 free spins and
  pay their instant scatter award multiplied by the current Overdrive meter.
- **Bonus buy:** the second bet mode "bonus" (cost 100.0x) guarantees a 3+
  scatter trigger spin.
- **Win cap:** 5,000x total per round, hard, both modes.
- **Stateless:** the entire feature resolves inside a single book round; no
  state is carried between rounds.

---

## 3. PAYTABLE (per-way multipliers x bet)

*Final ways payout = paytable value x ways count x bet, then x the Overdrive
meter during free spins. Capped at 5,000x bet per round.*

| Match | H1 (Spinning Rim) | H2 (Turbocharger) | M1 (Car Grille) | M2 (Exhaust Pipe) | M3 (Steering Wheel) | L1 (Lug Nut) | L2 (Spark Plug) | L3 (Piston) |
|-------|------------------:|------------------:|----------------:|------------------:|--------------------:|-------------:|----------------:|------------:|
| 5-of  |             22.00 |             10.00 |            5.00 |              4.00 |                2.00 |         1.50 |            0.80 |        0.65 |
| 4-of  |              6.00 |              3.00 |            1.50 |              1.00 |                0.60 |         0.45 |            0.25 |        0.20 |
| 3-of  |              1.50 |              0.80 |            0.45 |              0.30 |                0.20 |         0.15 |            0.10 |        0.08 |

**Wild (W):** Substitutes for all pay symbols. No independent pay.
**Scatter (S):** Instant pay and free-spin trigger (see below). Does not
participate in the ways calculation.

### Scatter table (instant pays and free-spin awards)

| Scatters | Instant pay (x total bet) | Free spins awarded (base trigger) |
|---------:|--------------------------:|----------------------------------:|
| 3        |                      1.0x |                                 8 |
| 4        |                      3.0x |                                12 |
| 5        |                     10.0x |                                16 |
| 3+ (retrigger, in free spins) | award x current meter | +5 |

*During free spins the instant scatter pay is multiplied by the current
Overdrive meter. 6+ scatters can appear on a free-spin board (scatters stack);
they pay the 5-scatter award and retrigger +5 spins.*

---

## 4. REEL STRIP FREQUENCIES

*BR0 base strip and FR0 free-game strip, 65 positions per reel, uniform across
all 5 reels. FR0 is currently identical to BR0. BRWCAP and FRWCAP are H1/Wild
heavy strips used to force wincap rounds.*

| Symbol | Name            | Count / Reel | Density |
|--------|-----------------|:------------:|--------:|
| H1     | Spinning Rim    |      2       |   3.1%  |
| H2     | Turbocharger    |      3       |   4.6%  |
| M1     | Car Grille      |      5       |   7.7%  |
| M2     | Exhaust Pipe    |      6       |   9.2%  |
| M3     | Steering Wheel  |      8       |  12.3%  |
| L1     | Lug Nut         |     10       |  15.4%  |
| L2     | Spark Plug      |     12       |  18.5%  |
| L3     | Piston          |     14       |  21.5%  |
| W      | Wild            |      3       |   4.6%  |
| S      | Scatter         |      2       |   3.1%  |

---

## 5. BASE MODE STATISTICS (cost 1.0x)

| Metric                              | Value                    |
|-------------------------------------|--------------------------|
| RTP                                 | 96.3500% (10dp 96.3499998727%) |
| Hit rate (win > 0)                  | 29.11%                   |
| Zero-win rate                       | 70.89%                   |
| Volatility (weighted SD)            | 17.28x                   |
| Maximum win                         | 5,000x bet               |
| Free-spin trigger rate              | 1 in 184.7 (0.5415%)     |
| Average triggered-round win         | 79.40x bet               |
| Wincap frequency                    | 1 in 100,000 (0.001%)    |

### Trigger distribution (share of triggers)

| Free spins awarded | Scatters | Share of triggers |
|-------------------:|---------:|------------------:|
| 8                  | 3        |            86.37% |
| 12                 | 4        |            12.78% |
| 16                 | 5        |             0.85% |

### RTP budget split (base mode, weighted)

| Component                                   | RTP contribution |
|---------------------------------------------|-----------------:|
| Base ways (non-feature rounds)              |          53.3500% |
| Overdrive free-spin rounds (instant scatter pays plus free-spin winnings) | 38.0000% |
| Wincap rounds (5,000x)                       |           5.0000% |
| **Total**                                    |     **96.3500%** |

---

## 5A. CRUISE / LOW-VOLATILITY MODE STATISTICS (cost 1.0x)

Cruise is a stateless standing bet mode at the same 1.0x cost and 96.35% RTP as base,
tuned for a smoother ride: most of the return sits in frequent base-ways wins, the
feature is rarer and the 5,000x tail is thinner. Same reels, same feature, same cap.

| Metric                              | Value                    |
|-------------------------------------|--------------------------|
| Cost                                | 1.0x base bet            |
| RTP                                 | 96.3500% (96.34999985%)  |
| Hit rate (win > 0)                  | 43.86%                   |
| Volatility (weighted SD)            | 11.10x (vs base 17.28x)  |
| Zero-payout rate                    | 56.14% (vs base 70.89%)  |
| Max win                             | 5,000x bet               |
| Wincap frequency                    | 1 in 250,000             |
| P(win >= 5,000x)                     | 4.0e-06                  |
| Simulations                         | 100,000                  |

### RTP budget split (cruise mode, weighted)

| Component                                   | RTP contribution |
|---------------------------------------------|-----------------:|
| Base ways (frequent, hr ~2.3)               |          76.3500% |
| Overdrive free-spin rounds (rarer, hr 260)  |          18.0000% |
| Wincap rounds (5,000x, thin tail)           |           2.0000% |
| **Total**                                    |     **96.3500%** |

Independently recomputed from the shipped `lookUpTable_cruise_0.csv` by
`scripts/validate_math.py`: RTP 96.350000%, SD 11.10x (below base, confirming lower
volatility), cross-mode variation 0.0000%.

---

## 5B. ANTE / DOUBLE-CHANCE MODE STATISTICS (cost 1.5x)

Ante is a stateless standing bet mode: the reels spin normally (it is not a buy),
but at 1.5x the base cost the free-spin trigger rate is roughly doubled. The feature
itself is identical to base (same reels, same Overdrive meter, same 5,000x cap); the
heavier free-game fence is funded by a lighter base-ways fence.

| Metric                              | Value                    |
|-------------------------------------|--------------------------|
| Cost                                | 1.5x base bet            |
| RTP                                 | 96.3500% (96.34999985%)  |
| Hit rate (win > 0)                  | 29.65%                   |
| Free-spin trigger rate              | 1 in 92.4 (2.0x the base 1 in 184.7) |
| Volatility (weighted SD)            | 23.26x                   |
| Max win                             | 5,000x bet               |
| Wincap frequency                    | 1 in 66,667              |
| P(win >= 5,000x)                     | 1.5e-05                  |
| Simulations                         | 100,000                  |

### RTP budget split (ante mode, weighted, as fractions of the 1.5x cost)

| Component                                   | RTP contribution |
|---------------------------------------------|-----------------:|
| Base ways (non-feature rounds)              |          15.3500% |
| Overdrive free-spin rounds (instant scatter pays plus free-spin winnings) | 76.0000% |
| Wincap rounds (5,000x)                       |           5.0000% |
| **Total**                                    |     **96.3500%** |

Independently recomputed from the shipped `lookUpTable_ante_0.csv` by
`scripts/validate_math.py`: RTP 96.350000%, cross-mode variation 0.0000% vs base
and bonus, all Stake star-tier risk gates pass.

---

## 6. BONUS BUY MODE STATISTICS (cost 100.0x)

The bonus buy guarantees a 3+ scatter trigger, weighted toward higher scatter
counts than the base game to justify the 100x price. The average bought outcome
returns 96.35x, i.e. an RTP of 96.35% at the 100x cost.

| Metric                              | Value                    |
|-------------------------------------|--------------------------|
| RTP                                 | 96.3500% (10dp 96.3499999962%) |
| Cost                                | 100.0x bet               |
| Trigger rate                        | 100% (guaranteed)        |
| Average bought outcome              | 96.35x bet               |
| Volatility (weighted SD)            | 206.63x                  |
| Maximum win                         | 5,000x bet               |
| Wincap frequency                    | 1 in 1,000 (0.100%)      |

### Bonus entry distribution (share of triggers)

| Free spins awarded | Scatters | Share of triggers |
|-------------------:|---------:|------------------:|
| 8                  | 3        |            76.56% |
| 12                 | 4        |            16.37% |
| 16                 | 5        |             7.07% |

### RTP budget split (bonus mode, weighted)

| Component                                   | RTP contribution |
|---------------------------------------------|-----------------:|
| Overdrive free-spin rounds (incl instant pays) |         91.3500% |
| Wincap rounds (5,000x)                       |           5.0000% |
| **Total**                                    |     **96.3500%** |

---

## 7. SYMBOL COMBINATION FREQUENCIES

*Raw simulation frequencies across all simulated base-mode spins (base game and
free spins combined), 100,000 rounds. Averages are per winning combination and
include the Overdrive multiplier applied during free spins, which is why higher
tiers can show elevated averages.*

| Combination | Hit Rate (1-in-N) | Avg Win (x bet) | Sim Count |
|-------------|------------------:|----------------:|----------:|
| H1 x 5      |             244.7 |           71.9x |       391 |
| H1 x 4      |             133.4 |           94.2x |       787 |
| H1 x 3      |             147.8 |          117.6x |       750 |
| H2 x 5      |             172.8 |          107.7x |       653 |
| H2 x 4      |              67.1 |           96.4x |     1,468 |
| H2 x 3      |              54.5 |          110.9x |     1,846 |
| M1 x 5      |              46.8 |          104.1x |     2,279 |
| M1 x 4      |              31.4 |           82.3x |     2,993 |
| M1 x 3      |              46.9 |           84.1x |     2,056 |
| M2 x 5      |              32.2 |           92.2x |     3,202 |
| M2 x 4      |              24.4 |           84.4x |     4,336 |
| M2 x 3      |              30.9 |           81.9x |     3,318 |
| M3 x 5      |              19.2 |           90.1x |     5,032 |
| M3 x 4      |              18.8 |           95.2x |     5,389 |
| M3 x 3      |              27.9 |           87.1x |     3,609 |
| L1 x 5      |               9.1 |           89.5x |    11,549 |
| L1 x 4      |              10.1 |          101.0x |    10,664 |
| L1 x 3      |              10.6 |           98.1x |     9,926 |
| L2 x 5      |              11.1 |           91.8x |     9,363 |
| L2 x 4      |              17.1 |           94.7x |     5,823 |
| L2 x 3      |              29.5 |           80.8x |     3,554 |
| L3 x 5      |               7.7 |           91.2x |    12,843 |
| L3 x 4      |              12.1 |          104.0x |     8,643 |
| L3 x 3      |              25.2 |          110.6x |     4,175 |

---

## 8. VOLATILITY

| Metric                       | Base mode           | Bonus mode          |
|------------------------------|---------------------|---------------------|
| Weighted standard deviation  | 17.28x              | 206.63x             |
| Hit rate                     | 29.11%              | 100% (guaranteed)   |
| Maximum win                  | 5,000x              | 5,000x              |
| Classification               | Medium-High         | High (feature buy)  |

*Base-mode volatility of 17.28x against a mean of 0.9635x reflects the rare but
large Overdrive free-spin rounds and the 5,000x cap. The bonus buy is far more
volatile because every purchase enters the feature and outcomes range widely up
to the cap.*

---

## 9. PROVABLE ARTEFACTS AND VERIFICATION

Both lookup tables were independently recomputed with exact integer arithmetic
(fractions.Fraction) and both equal 96.3500% at four decimal places. The books
match the lookup tables positionally by id and as sorted multisets in both
modes; the maximum win is exactly 5,000.00x with zero rounds above the cap in
either mode; the simulation is deterministic (fixed seeds reproduce identical
payouts). A round-shape audit of freegame-containing books confirmed correct
trigger counts, retriggers, Overdrive multiplier progression (+1 only after
winning spins, applied to subsequent wins), instant scatter pays, and that the
total payout equals the recorded payout multiplier in every sampled round.

| File | SHA-256 |
|------|---------|
| index.json | 63c64048508a35940aa5fc5124489ceb9d1c774737411b3bd726779babb85107 |
| game_metadata.json | 771fe87b78256626d9eb626bbdaee7ba9683dc5fd5e9b891063b00eb461164b3 |
| lookUpTable_base_0.csv | 7aa435857dcac59756f96b21dd128c58a9e3ed538b647c9056cebeee25e71990 |
| lookUpTable_bonus_0.csv | a77241f1a2e6606bebe94b5e6bb86bc6dda957732316d4962cffc199731d50cd |
| books_base.jsonl.zst | b86c8bb484523a53b8a42db6dbaef0bc26c51843077b5f06d01f492c40d39331 |
| books_bonus.jsonl.zst | a38d2b8f5da04ac4f401f33bcdfbbcde56f6b661bcc0f7ad50e518763dd9bbb9 |

---

## 10. MODE DECLARATION (template library)

Future Spinner is a template carrying a library of eleven validated bet modes (section 1A):
six standing modes (cruise, base, antelite, ante, volatile, superante) and a five-tier buy
ladder (minibuy 80x, bonus 100x, superbuy 300x, megabuy 500x, hyperbuy 1000x). A shipped skin
declares the subset it ships.

All modes are stateless (each round resolves independently inside one book
round), share the 1,024-way base game and paytable, enforce the same 5,000x win
cap, and return 96.3500% RTP (cross-mode variation 0.0000%, within the 0.5% rule).
There is no jackpot, gamble, or continuation mechanic. The scatter awards are
1x/3x/10x instant plus 8/12/16 free spins on 3/4/5 scatters, with a progressive
Overdrive multiplier during the feature.

---

## 11. REGULATORY COMPLIANCE NOTES

- **RTP:** 96.3500% in all three modes (four decimal places), satisfying the 0.5%
  tolerance rule.
- **Wincap:** hard 5,000x cap enforced at the engine level; no simulated round
  in any mode exceeds it.
- **Stateless:** the whole Overdrive feature resolves within a single book
  round; no state carries between rounds.
- **No progressive jackpot, gamble, or continuation mechanic.**
- **Ante / Double-Chance:** the 1.5x mode returns 96.35% RTP with roughly double
  the trigger rate. It is not a buy (reels spin normally). Jurisdictions that
  restrict ante-style bets can gate it in the frontend.
- **Bonus buy:** the 100x buy returns 96.35% RTP (average outcome 96.35x),
  matching the base-mode RTP. Jurisdictions that disable feature buys hide the
  bonus mode (frontend scope).

---

*Generated by Stake Engine Math SDK | We Roll Spinners | Future Spinner v1.4 (Overdrive Free Spins, 11-mode template library)*
