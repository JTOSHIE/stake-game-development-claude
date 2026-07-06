# Super buy (400x, 5x pre-revved GLOW) — prototype findings

Prototype in a SIBLING package (`games/future_spinner_super`), so the locked
shipped package was never touched. Purpose: de-risk the D3 super buy before any
sanctioned locked regen. Result: **the mechanic works and converges cleanly.**

## The mechanic
- New bet mode `super`, cost **400.0x**, `is_buybonus=True`, guaranteed 3+ trigger
  (standard bonus conditions — richness comes from the pre-rev, not extra scatters).
- The Overdrive/GLOW meter is **pre-revved to 5x at the feature start** for this
  mode only (a per-mode starting value set right after `reset_fs_spin()` in
  `gamestate.run_freespin`; base game stays 1x; other modes start at 1x).
- Optimiser fences identical in shape to the other buys: `wincap` rtp 0.05 +
  always-on `freegame` rtp 0.9135 = 0.9635; the 400x cost scales the mean to
  0.9635 x 400 = 385.4x. Dress centred on the pre-revved feature body (win_range
  150..800), m2m 4..12, wincap quota 0.03.

## Independent validation (recomputed from the SHIPPED lookup table, not trusting the optimiser)
| mode | cost | RTP (recomputed) | mean | SD | max win | wincap odds | tail (cost-scaled) |
|---|---|---|---|---|---|---|---|
| base  | 1.0x   | 96.350000% | 0.9635x | 17.16x | 5,000x | 1 in 100,000 | 1.0e-5 |
| bonus | 100.0x | 96.350000% | 96.35x  | 215.18x | 5,000x | 1 in 1,000  | 1.0e-3 |
| super | 400.0x | 96.350000% | 385.40x | 500.01x | 5,000x | 1 in 250    | 3.2e-3 (limit 1e-2) |

- Super RTP is **96.3500% at 4dp**, within 0.0000pp of base (0.5% parity rule met).
- Max win exactly 5,000x (book `payoutMultiplier` max = 500000 in x100 units = 5000.00x).
- Tail P(>=5000x) cost-scaled 3.2e-3, well under the 1e-2 gate (cost 400 -> scale 0.8).
- Volatility SD ~500x: a genuine "super" tier (2.3x the bonus buy's swing), avg
  bought outcome 385.4x, cap 1 in 250.

## Statelessness — proven from the books
Decoding the super books, every round shows `globalMult = [1, 5, 6, 7, 8, ...]`:
the `1` is the base-game portion (correctly unmultiplied), then the feature
**starts at 5** and climbs +1 per winning free spin. Each round independently
resets to that pattern (different rounds peak at 10, 19, 11, ... then reset),
so there is **no cross-round carry**: `reset_book` returns the meter to 1 every
round and the feature pre-revs to 5 at its own start. Stateless by construction.

## Conclusion
The 400x / 5x-pre-rev super buy is feasible, compliant (96.3500%, 5,000x cap,
tail-safe, stateless) and de-risked. The eventual sanctioned regen into the
locked `games/future_spinner` package is now a mechanical drop-in of this exact
recipe (new mode + the 4-line gamestate pre-rev + the `super` opt block), plus a
ship name for the mode. No fence re-tuning was needed — it converged first try.
