# future_spinner_bigwin — higher max-win cap variant (template proof)

A fork of `future_spinner` demonstrating the **higher max-win cap** template axis. The
only design change is `_WINCAP = 25000.0` (vs 5,000x in the base skin); everything else
(reels, paytable, Overdrive feature, mode fences) is identical. This proves that raising
the cap is a one-line change plus a regeneration, and shows the tradeoff.

This proof skin ships three modes (base, bonus, superbuy); the full library applies the
same way. Independently validated at 96.3500% RTP:

| Mode | Cost | RTP | SD (25kx) | SD (5kx base skin) | Max win | Wincap odds |
|---|---|---|---|---|---|---|
| base     | 1.0x | 96.3500% | 36x  | 17.3x  | 25,000x | 1 in 500,000 |
| bonus    | 100x | 96.3500% | 381x | 206.6x | 25,000x | 1 in 5,000 |
| superbuy | 300x | 96.3500% | 668x | 407x   | 25,000x | 1 in 1,667 |

Finding: a higher cap holds RTP at 96.35% but ~doubles volatility (more of the return
sits in a rarer, larger tail) and gives a bigger headline max win. It is a
marketing/positioning choice, not a functional requirement (the 5,000x buy ladder is
already complete). Choose the cap per skin at generation time.

Build: `env/bin/python <scratch>/run_bigwin.py base,bonus,superbuy` (the fork trims its
bet_modes/opt_params to the shipped three; extend for more). Not the shipped game.
