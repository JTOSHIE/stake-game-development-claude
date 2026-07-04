# LUMEN - Probability Accounting Report (PAR Sheet)

**Game:** Lumen (side project)
**Studio:** Claude (built with the shared math-sdk)
**Report Date:** 2026-07-05
**Feature:** THE BLOOM free spins with the dual-fed GLOW meter
**Basis:** 100,000 rounds per mode (Stake Engine SDK), PigFarm Rust optimiser
Australian English, no em/en dashes.

---

## 1. Overview

| Parameter | Value |
|---|---|
| Grid | 5 reels x 4 rows (20 positions) |
| Win mechanic | Ways-to-win, 4^5 = 1,024 ways |
| RTP | 96.3500% (all four modes; cross-mode spread 0.0000pp) |
| Max win | 10,000x total bet (hard cap, all modes) |
| Volatility | High |
| Bet modes | Surface 1.0x, Deep Dive 1.5x, The Bloom 100x buy, Abyssal Bloom 300x buy |
| Stateless | Yes - the whole feature resolves inside one book round |

## 2. THE BLOOM + the GLOW meter (signature mechanic)

- 3/4/5 Spore scatters award 8/12/16 free spins and pay an instant 1x/3x/10x total bet.
- The **GLOW meter** starts at x1 and multiplies every free-spin win. It rises from TWO sources
  each free spin (applied to subsequent spins, not retroactive):
  1. **+1 after any winning free spin** (the abyss brightens), plus
  2. **+1 per L3 "glow orb"** on that free-spin board (you gather light).
  It never resets during the feature. Independently confirmed stateless from the books (meter = 1
  at the start of every round; 2,999/3,000 sampled rounds show a jump > 1, proving the orb-feeding).
- Retrigger: 3+ scatters award +5 spins and pay the instant award x the current GLOW.
- Hard 10,000x cap.

## 3. Validated per-mode statistics (RTP recomputed independently from the shipped lookUpTables)

| Mode | Cost | RTP | SD (x bet) | Max win | Wincap odds | Notes |
|---|---|---|---|---|---|---|
| Surface | 1.0x | 96.349999% | 24.7x | 10,000x | 1 in 200,000 | trigger 1 in 185, avg triggered win 79.5x |
| Deep Dive | 1.5x | 96.349999% | 31.4x | 10,000x | 1 in 133,333 | ~2x trigger (1 in 92), avg 112.3x |
| The Bloom | 100x | 96.350000% | 290.3x | 10,000x | 1 in 2,000 | guaranteed feature |
| Abyssal Bloom | 300x | 96.350000% | 607.0x | 10,000x | 1 in 667 | rich guaranteed entry |

Cross-mode RTP spread **0.0000pp** (within the 0.5% rule). Paytable (per way): H1 22/6/1.5, H2
10/3/0.8, M1 5/1.5/0.45, M2 4/1/0.3, M3 2/0.6/0.2, L1 1.5/0.45/0.15, L2 0.8/0.25/0.10,
L3 0.65/0.20/0.08 (5/4/3 of a kind).

## 4. Compliance

Stateless (feature resolves in one book round; no jackpot, gamble, continuation, cross-round
state). RTP 96.3500% in-band (90.0-96.70%); all modes within 0.5%. Max win a hard 10,000x. Original
IP; the GLOW meter is an original fusion of two mechanics. Buy modes (Bloom, Abyssal Bloom) must be
jurisdiction-gated where feature buys are banned; Deep Dive (ante-style) gated where ante bets are
restricted.

## 5. Build note

Built as a sibling package `games/lumen/`, isolated from `future_spinner`. The dual-fed GLOW meter
converged to exact RTP on the first fence configuration (the future_spinner base/ante/bonus/superbuy
fence splits transferred cleanly to the 10,000x cap; the faster meter gives the optimiser a wider
outcome range and the buy modes retain enough small outcomes to pull the weighted mean to target).
