# Future Spinner

**Studio:** We Roll Spinners
**Platform:** Stake Engine
**Theme:** Cyberpunk automotive

---

## Grid & Mechanics

| Property | Value |
|---|---|
| Grid size | 5 reels × 4 rows |
| Win type | Ways-to-win |
| Ways count | **1,024** (4⁵) |
| RTP target | **96.35 %** |
| Win cap | 5,000× bet |

---

## Symbol Roster

### Pay Symbols

| Tier | Symbol ID | Name |
|---|---|---|
| Low | `L3` | Piston |
| Low | `L1` | Lug Nut |
| Low | `L2` | Spark Plug |
| Mid | `M3` | Steering Wheel |
| Mid | `M2` | Exhaust Pipe |
| Mid | `M1` | Car Grille |
| High | `H1` | Spinning Rim |
| High | `H2` | Turbocharger |

### Special Symbols

| Symbol ID | Name | Behaviour |
|---|---|---|
| `W` | Wild | Substitutes for all pay symbols |
| `S` | Scatter | Instant multiplier award (see Bonus Feature) |

---

## Bonus Feature — Instant Scatter Multiplier

The scatter is **stateless**: it pays an instant multiplier on the spin it
lands and does **not** trigger a free-spin round.

| Scatter count | Award |
|---|---|
| 3 | 2× total bet |
| 4 | 10× total bet |
| 5 | 50× total bet |

Scatter awards stack with ways-to-win wins from the same spin.
There is no persistent bonus state between rounds.

---

## File Structure

```
games/future_spinner/
├── README.md                          — this file
├── __init__.py                        — package marker
├── run.py                             — simulation entry point
├── game_config.py                     — GameConfig (grid, paytable, reels, bet modes)
├── gamestate.py                       — GameState (per-spin flow controller)
└── game_executables/
    ├── __init__.py                    — package marker
    └── game_calculation.py            — ways evaluation + scatter multiplier logic
```

---

## Development Status

- [ ] Reel strips (`reels/BR0.csv`, `reels/FR0.csv`) — pending math design
- [ ] Paytable calibration to hit 96.35 % RTP
- [ ] Scatter multiplier table finalisation
- [ ] Full simulation run and optimisation pass
- [ ] Format verification (`make run GAME=future_spinner`)
