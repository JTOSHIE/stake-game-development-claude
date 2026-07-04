# future_spinner_multiwild — multiplier-wilds mechanic variant (template proof)

A themed fork of `future_spinner` demonstrating a CODE mechanic swap: Wilds carry a random
multiplier (2x/3x/5x/10x, weighted) when they land in free spins, and the wild multiplier
drives the feature (via the ways `"symbol"` multiplier strategy) in place of the Overdrive
meter. Proves that a mechanic variant is a sibling fork (no lock exception) with its maths
re-tuned to hold RTP.

Changes vs the base skin (see `docs/MECHANIC_VARIANTS.md` for the full recipe):
- `game_config.py`: `special_symbols["multiplier"] = ["W"]` + `wild_mult_values`.
- `gamestate.py`: `assign_special_sym_function` -> Wild multiplier callback (free spins only).
- `game_executables/game_calculation.py`: ways `multiplier_strategy="symbol"`.

Validated at 96.3500% RTP (proof modes base + bonus):

| Mode | Cost | RTP | SD | Max win | Wincap odds |
|---|---|---|---|---|---|
| base  | 1.0x | 96.3500% | 17.1x  | 5,000x | 1 in 100,000 |
| bonus | 100x | 96.3500% | 226.8x | 5,000x | 1 in 1,000 |

The wild multipliers raise the raw free-game RTP sharply (~82% vs ~34%); the optimiser
re-tunes to 96.35%. Frontend presentation for the new mechanic (wild-multiplier display) is a
separate pass. Not the shipped game - a template demonstration.
