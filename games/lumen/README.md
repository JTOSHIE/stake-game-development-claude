# Lumen - Glow Meter Free Spins

Lumen is a 5x4, 1,024-ways slot by We Roll Spinners. It is a sibling maths
package to Future Spinner, built on the same proven ways engine and reels
(symbol IDs H1, H2, M1, M2, M3, L1, L2, L3, W, S are unchanged) with a deep-ocean
bioluminescence theme. The theme is presentation only; the mathematics is the
validated ways engine plus one new signature mechanic, the **Glow Meter**.

## The game

- Grid: 5 reels x 4 rows, 1,024 ways to win.
- Wild (W) substitutes for all paying symbols. Scatter (S) pays an instant
  1x / 3x / 10x total-bet award on 3 / 4 / 5 scatters and triggers the feature.
- Free spins: 3 / 4 / 5 scatters award 8 / 12 / 16 free spins.
- Max win: 10,000x total bet, hard cap in every mode.
- RTP: 96.3500% in every mode.

## Signature mechanic: the Glow Meter

The low symbol **L3 is the "glow orb"**. It still pays as a normal L3 in the
ways evaluation, but during free spins it also feeds a progressive multiplier
that applies to every subsequent free-spin win (ways wins and scatter pays
alike).

The meter starts at **1x** at the start of every free-spin round and rises after
each free spin from **two** sources, applied from the **next** spin onward (never
retroactive, never reset mid-round):

- **+1** if the spin won anything (the Overdrive behaviour), PLUS
- **+N** where N = the number of L3 glow orbs on that free-spin board.

So after a spin the meter increases by `L3_count + (1 if spin_win > 0 else 0)`.
The base game meter is always 1x. The whole feature resolves inside one stateless
book round: the meter is set to 1 in `reset_book` and is never carried across
rounds. 3+ scatters during free spins retrigger +5 spins and pay their instant
award at the current meter.

### `run_freespin` (gamestate.py)

```python
def update_glow_meter(self, spin_win: float) -> None:
    """Raise the Glow Meter for all SUBSEQUENT free spins: +1 for a winning
    spin AND +1 per L3 glow orb on the board. Never retroactive; a single
    update_global_mult event records the new meter value."""
    glow_orbs = self.count_symbols_on_board(_GLOW_SYMBOL)   # L3
    win_bump = 1 if spin_win > 0 else 0
    increment = glow_orbs + win_bump
    if increment > 0:
        self.global_multiplier += increment
        update_global_mult_event(self)

def run_freespin(self) -> None:
    self.reset_fs_spin()                      # meter (global_multiplier) stays 1
    while self.fs < self.tot_fs:
        self.update_freespin()
        self.draw_board(emit_event=True)
        self.evaluate_ways_board()            # ways wins x current meter
        self.evaluate_scatter_multiplier()    # instant award x current meter
        if self.check_fs_condition():
            self.update_fs_retrigger_amt()    # 3+ scatters -> +5 spins
        self.win_manager.update_gametype_wins(self.gametype)
        if self.wincap_triggered:
            break
        self.update_glow_meter(self.win_manager.spin_win)   # +1 win + L3 count
    self.end_freespin()
```

The Glow Meter reuses the SDK global-multiplier plumbing (`global_multiplier`
with the ways `multiplier_strategy="global"`), so ways wins and scatter pays are
both scaled correctly, and every change emits an `updateGlobalMult` event for the
front end and for auditing.

## Bet modes

Four stateless modes, all targeting 96.3500% RTP with a 10,000x cap. The fence
splits mirror the validated Future Spinner package.

| Mode | Cost | Profile | Feature entry |
| --- | --- | --- | --- |
| `surface` | 1.0x | base ways game | natural 3+ scatter trigger |
| `deepdive` | 1.5x | ante / double-chance (~2x trigger rate) | natural 3+ scatter trigger |
| `bloom` | 100.0x | bonus buy | guaranteed 3+ scatter |
| `abyssalbloom` | 300.0x | super buy (richest, 4/5-scatter weighted) | guaranteed 3+ scatter |

## Validated numbers (100,000 simulations per mode, Rust-optimised)

RTP is recomputed independently from `library/publish_files/lookUpTable_<mode>_0.csv`
as `sum(weight * payout) / sum(weight) / 100 / cost`.

| Mode | Cost | RTP (4dp) | RTP (10dp) | Hit rate | Volatility (SD, x-bet) | Max win | Wincap odds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `surface` | 1.0x | 96.3500% | 96.3499993458% | 29.11% | 24.65x | 10,000x | 1 in 200,000 |
| `deepdive` | 1.5x | 96.3500% | 96.3499992102% | 29.65% | 31.36x | 10,000x | 1 in 133,333 |
| `bloom` | 100.0x | 96.3500% | 96.3499999600% | 100.00% | 290.34x | 10,000x | 1 in 2,000 |
| `abyssalbloom` | 300.0x | 96.3500% | 96.3499999723% | 100.00% | 606.99x | 10,000x | 1 in 667 |

Cross-mode RTP spread: 0.0000 pp (all four land on 96.3500% at 4dp, well inside
the 0.5% band).

Additional base-mode figures:

- `surface`: free-spin trigger rate 1 in 185 (0.5410%), average triggered-round
  win 79.5x.
- `deepdive`: free-spin trigger rate 1 in 92 (1.0818%), average triggered-round
  win 112.3x, i.e. roughly twice the surface trigger rate for the +50% ante cost.

### Glow Meter verification (from the optimised books)

- Stateless: every free-spin round's first `winInfo` reports `meta.globalMult = 1`
  before any `updateGlobalMult` event, i.e. the meter starts at 1x each round and
  never carries state across rounds.
- L3-fed: 100% of rounds that ran the meter show at least one single-spin meter
  increment greater than +1, which is only possible from the L3 glow-orb count
  (a win-only bump is exactly +1). Counts: surface 15,180 / 15,180 meter rounds,
  bloom 99,956 / 99,956, abyssalbloom 99,786 / 99,786.

## Build / regenerate

```bash
# from repo root, four modes at production sim counts
./env/bin/python games/lumen/run_modes.py surface,deepdive,bloom,abyssalbloom 100000
# or the standard runner (PRODUCTION = True)
./env/bin/python games/lumen/run.py
```

Pipeline: `create_books` (all four modes) -> `generate_configs` ->
`OptimizationExecution` (Rust PigFarm) -> `generate_configs`. Outputs land in
`games/lumen/library/` (`books/`, `lookup_tables/`, `publish_files/`, `configs/`,
`forces/`).

## Files

- `game_config.py` - identity (`game_id="lumen"`), grid, paytable, `_WINCAP=10000.0`,
  the four bet modes and their conditions/distributions.
- `game_optimization.py` - optimiser fences per mode (each summing to 0.9635,
  every wincap fence targeting 10,000x).
- `gamestate.py` - the Glow Meter (`update_glow_meter` + `run_freespin`).
- `game_executables/game_calculation.py` - ways evaluation and the instant
  scatter award (global multiplier strategy), unchanged from the base engine.
- `run.py` / `run_modes.py` - runners.
