# FUTURE SPINNER - Probability Accounting Report (PAR Sheet)

**Game:** Future Spinner
**Provider:** We Roll Spinners
**Report Date:** 2026-07-03 (FeatureMath v2 update: 2026-07-07)
**Feature:** OVERDRIVE FREE SPINS (five bet modes: Normal, Cruise, OVERBOOST,
Buy Overdrive, NITRO OVERDRIVE)
**Simulation Basis:** 100,000 rounds per mode (Stake Engine SDK v1)
**Optimiser:** PigFarm Rust, all five modes converged to 96.3500% RTP

**FeatureMath v2 note:** base and bonus are the original 2026-07-03 release,
byte-identical (lookUpTable_base_0.csv / lookUpTable_bonus_0.csv hashes
unchanged - see section 9). cruise, antelite (OVERBOOST) and super (NITRO
OVERDRIVE) are new in this update.

---

## 1. GAME OVERVIEW

| Parameter              | Value                                     |
|------------------------|-------------------------------------------|
| Grid                   | 5 reels x 4 rows (20 symbol positions)    |
| Win mechanic           | Ways-to-win (up to 4^5 = 1,024 ways)     |
| Bet modes              | Five: Normal (base, 1.0x), Cruise (cruise, 1.0x), OVERBOOST (antelite, 1.25x), Buy Overdrive (bonus, 100.0x), NITRO OVERDRIVE (super, 400.0x) |
| Target RTP             | 96.35% (every mode)                       |
| Achieved RTP            | 96.350000% independently recomputed, every mode (see section 9) |
| Wincap                 | 5,000x bet (hard, every mode)             |
| Volatility (base)      | Medium-High, weighted SD 17.28x           |
| Min bet                | $0.10                                     |
| Max bet                | $100.00                                   |
| Feature                | Overdrive Free Spins with progressive multiplier |

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
- **Bonus buy:** the bet mode "bonus" (Buy Overdrive, cost 100.0x) guarantees a
  3+ scatter trigger spin.
- **NITRO OVERDRIVE (FeatureMath v2):** the bet mode "super" (cost 400.0x)
  guarantees a 3+ scatter trigger AND pre-revs the Overdrive meter to **5x**
  at the feature's first free spin (every other mode starts at 1x). The meter
  then climbs +1x per winning free spin exactly as in every other mode. This
  is a per-mode meter initialisation applied at the feature start each round
  and reset to 1 by reset_book every round, so it remains fully stateless -
  independently confirmed from the shipped books: every one of 100,000 super
  rounds shows the free-spin globalMult sequence starting at exactly 5, with
  no value carrying across rounds.
- **Win cap:** 5,000x total per round, hard, every mode.
- **Stateless:** the entire feature resolves inside a single book round; no
  state is carried between rounds, including the NITRO OVERDRIVE pre-rev.

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

## 6a. CRUISE MODE STATISTICS (cost 1.0x) - FeatureMath v2

Low-volatility standing mode: same price and RTP as Normal, but a smoother
ride - more frequent, smaller base wins and a rarer, thinner-tailed feature.
Ported verbatim from the validated `claude/gap-analysis` library (same fence
recipe, freshly generated into the shipping package).

| Metric                              | Value                    |
|-------------------------------------|--------------------------|
| RTP (independently recomputed)      | 96.350000%               |
| Hit rate (win > 0)                  | 43.86%                   |
| Volatility (weighted SD)            | 11.29x (vs 17.28x Normal)|
| Maximum win                         | 5,000x bet               |
| Wincap frequency                    | 1 in 250,000             |
| Unique payouts                      | 5,837                    |

---

## 6b. OVERBOOST MODE STATISTICS (mode id "antelite", cost 1.25x) - FeatureMath v2

Double-chance: +25% cost for roughly 1.6x the free-spin trigger rate. Same
reels, same feature, same 5,000x cap as Normal. Ported verbatim from the
validated `claude/gap-analysis` library.

| Metric                              | Value                    |
|-------------------------------------|--------------------------|
| RTP (independently recomputed)      | 96.350000%               |
| Cost                                | 1.25x bet                |
| Hit rate (win > 0)                  | 29.44%                   |
| Volatility (weighted SD)            | 20.32x                   |
| Maximum win                         | 5,000x bet               |
| Wincap frequency                    | 1 in 80,000              |
| Unique payouts                      | 14,814                   |

---

## 6c. NITRO OVERDRIVE MODE STATISTICS (mode id "super", cost 400.0x) - FeatureMath v2

Guaranteed 3+ scatter trigger (the same standard bonus conditions as Buy
Overdrive); the richness comes from the Overdrive meter pre-revving to **5x**
at the feature's first free spin, not from extra scatters. Validated in the
`games/future_spinner_super` sibling prototype before this drop-in; converged
first try in the shipping package, no fence re-tuning needed.

| Metric                              | Value                    |
|-------------------------------------|--------------------------|
| RTP (independently recomputed)      | 96.350000%               |
| Cost                                | 400.0x bet               |
| Trigger rate                        | 100% (guaranteed)        |
| Average bought outcome              | 385.40x bet              |
| Volatility (weighted SD)            | 539.16x                  |
| Maximum win                         | 5,000x bet               |
| Wincap frequency                    | 1 in 250                 |
| P(>=5,000x), cost-scaled            | 3.20e-3 (limit 1e-2)      |
| Unique payouts                      | 46,049                   |
| Statelessness proof                 | all 100,000 books show the free-spin meter starting at exactly 5, no cross-round carry |

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

**FeatureMath v2 (2026-07-07):** base and bonus rows below are UNCHANGED from
the original 2026-07-03 generation - re-verified byte-identical before and
after this update. index.json and game_metadata.json were hand-updated to add
the three new modes (their hashes below reflect the five-mode file) and are
re-derived, not independently meaningful for byte-identity.

| File | SHA-256 |
|------|---------|
| index.json (five-mode) | 8857dbc027c5e2ceb0b2e39ec0a7dd05bc63272938dc8db515cdf7422d6f1aac |
| game_metadata.json (five-mode) | 51e7dceeacd41fd292e769b75383ac8c77f726e8f275b1808ad898d99d9abc38 |
| lookUpTable_base_0.csv (unchanged) | 7aa435857dcac59756f96b21dd128c58a9e3ed538b647c9056cebeee25e71990 |
| lookUpTable_bonus_0.csv (unchanged) | a77241f1a2e6606bebe94b5e6bb86bc6dda957732316d4962cffc199731d50cd |
| lookUpTable_cruise_0.csv (new, v2) | da3e45c577866d7357f6b1e83b9a2d14e406d2daf24b662e1a55003e2ed5de01 |
| lookUpTable_antelite_0.csv (new, v2) | 150a6d243dcca205a7b9aff1c25c6ce5e3b31c634ac58f7b7e72274e4a054b15 |
| lookUpTable_super_0.csv (new, v2) | 2e94fe04ad0c44a69789f871b1c969e2c36021ce4db1c25bb328c8ee3dd4330e |
| books_base.jsonl.zst | b86c8bb484523a53b8a42db6dbaef0bc26c51843077b5f06d01f492c40d39331 |
| books_bonus.jsonl.zst | a38d2b8f5da04ac4f401f33bcdfbbcde56f6b661bcc0f7ad50e518763dd9bbb9 |
| books_cruise.jsonl.zst (new, v2) | 7b5a1ddcfcdfde76a2f286a36992df5f9e8632cf9cfdc442fcc71dfd3fcc5b24 |
| books_antelite.jsonl.zst (new, v2) | 9e5e8a0ad24f00383a6497f7debdf1ecaf46145d7f23f7d5d345e86ffd381377 |
| books_super.jsonl.zst (new, v2) | c079226d718cab54825b91d5fdab631d7d2f8dd542f432e9b7b6ec7d57347445 |

*As with the original base/bonus books, the new books_*.jsonl.zst files are
regenerable build artifacts (`games/future_spinner/run.py`), gitignored per
`**/library/**`, not committed to source control; only the lookUpTable CSVs
and the two JSON config files are force-tracked, matching existing precedent.*

---

## 10. FIVE-MODE DECLARATION (FeatureMath v2)

Future Spinner ships exactly five bet modes:

- **Normal** (mode id `base`, cost 1.0x): standard play. The Overdrive Free
  Spins feature triggers on 3+ scatters at a rate of about 1 in 185 base spins.
- **Cruise** (mode id `cruise`, cost 1.0x): a lower-volatility standing mode,
  same RTP, more frequent smaller wins.
- **OVERBOOST** (mode id `antelite`, cost 1.25x): double-chance, roughly 1.6x
  the free-spin trigger rate.
- **Buy Overdrive** (mode id `bonus`, cost 100.0x): a buy that guarantees entry
  to the Overdrive Free Spins feature.
- **NITRO OVERDRIVE** (mode id `super`, cost 400.0x): a buy that guarantees
  entry AND pre-revs the Overdrive meter to 5x at the feature's first free
  spin (see section 2 and 6c).

All five modes are stateless (each round resolves independently inside one
book round, including the NITRO OVERDRIVE pre-rev), share the 1,024-way base
game and paytable, enforce the same 5,000x win cap, and independently
recompute to 96.3500% RTP with 0.0000pp cross-mode spread. There is no
jackpot, gamble, or continuation mechanic. The scatter awards are 1x/3x/10x
instant plus 8/12/16 free spins on 3/4/5 scatters, with a progressive
Overdrive multiplier during the feature.

---

## 11. REGULATORY COMPLIANCE NOTES

- **RTP:** 96.3500% in every mode (four decimal places), satisfying the 0.5%
  cross-mode tolerance rule (measured spread 0.0000pp across all five).
- **Wincap:** hard 5,000x cap enforced at the engine level; no simulated round
  in any mode exceeds it (independently confirmed by scanning every book).
- **Stateless:** the whole Overdrive feature, including the NITRO OVERDRIVE
  pre-rev, resolves within a single book round; no state carries between
  rounds (independently confirmed: every NITRO OVERDRIVE round's free-spin
  meter starts at exactly 5, with no cross-round carry).
- **No progressive jackpot, gamble, or continuation mechanic.**
- **Buy Overdrive:** the 100x buy returns 96.35% RTP (average outcome
  96.35x), matching every other mode's RTP.
- **NITRO OVERDRIVE:** the 400x buy returns 96.35% RTP (average outcome
  385.40x); tail risk P(>=5,000x) is 3.20e-3 cost-scaled, under the 1e-2 gate.
- Jurisdictions that disable feature buys hide the Buy Overdrive and NITRO
  OVERDRIVE modes (frontend scope).

---

*Generated by Stake Engine Math SDK | We Roll Spinners | Future Spinner v1.2 (Overdrive Free Spins, FeatureMath v2)*
