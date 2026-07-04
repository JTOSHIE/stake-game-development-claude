# future_spinner_rtp94 — RTP preset variant (template proof)

A fork of `future_spinner` demonstrating the **RTP-preset** template axis. Many operators and
jurisdictions want the same game at a different certified RTP (e.g. 94% / 95% / 96% / 96.5%).
This is a config-only change: set `_BASE_RTP` and rebalance the optimiser fences to sum to the
new target; the reels, paytable and feature are unchanged.

Change vs the 96.35% skin:
- `game_config.py`: `_BASE_RTP = 0.9400`.
- `game_optimization.py`: base `basegame` fence 0.5335 -> 0.51; bonus `freegame` 0.9135 -> 0.89
  (each mode's fences now sum to 0.94).

Validated (proof modes base + bonus):

| Mode | Cost | RTP | SD |
|---|---|---|---|
| base  | 1.0x | 94.0000% | 17.2x  |
| bonus | 100x | 94.0000% | 212.6x |

The RTP band is 90.0-96.70%, so presets anywhere in that range are available the same way.
Volatility is barely affected (SD ~unchanged); the lower RTP just returns less on average. Pick
the preset per skin/operator at generation. Not the shipped game - a template demonstration.
