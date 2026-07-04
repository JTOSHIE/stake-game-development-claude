# Future Spinner COLLECT

**Studio:** We Roll Spinners
**Platform:** Stake Engine
**Status:** feature-primitive prototype (NOT for release) — sibling fork of the
locked `games/future_spinner` package. Nothing in the locked package was
modified; this is a standalone experiment in `games/future_spinner_collect/`.

A stateless **Collection Meter** (coin-collect) bonus layered on top of the
Overdrive Free Spins engine.

---

## Grid & Mechanics

| Property | Value |
|---|---|
| Grid size | 5 reels x 4 rows |
| Win type | Ways-to-win |
| Ways count | 1,024 (4^5) |
| RTP | **96.3500%** both modes |
| Win cap | 5,000x bet (hard, both modes) |
| Bet modes | `base` (cost 1.0x), `bonus` buy (cost 100.0x) |

---

## Feature 1 — Overdrive Free Spins (inherited, unchanged)

3/4/5 scatters award 8/12/16 free spins and pay an instant 1x/3x/10x total bet.
During free spins an Overdrive meter starts at 1x and rises +1x after every
winning spin, applied to all subsequent free-spin wins (ways and scatter pays),
never resetting, not retroactive. 3+ scatters in free spins retrigger +5 spins.
The bonus buy guarantees a 3+ trigger.

## Feature 2 — Collection Meter (NEW, stateless coin-collect)

The low symbol **L3 doubles as the collect coin**. It keeps its ordinary ways
paytable entry (it still pays ways wins) and, additionally, when it lands
**during free spins**, it carries a random cash value — a multiple of TOTAL BET
drawn from `GameConfig.collect_values`:

| Coin value | Weight |
|---|---|
| 0 (blank L3, no value) | 84 |
| 1x | 8 |
| 2x | 4 |
| 5x | 2 |
| 15x | 1 |
| 50x | 1 |

Every coin value seen across the free-spin round **accumulates into an in-round
pot**, and the pot is **paid out at the END of the free-spin round** as part of
the free-game win. The pot is initialised to 0 in `reset_book` and reset every
round, so the whole feature resolves inside **one stateless book round** — no
state carries across rounds. Coin values are flat multiples of total bet and are
NOT scaled by the Overdrive meter.

L3 is a common reel symbol (~21.5% of each strip, ~4.3 per board), so the coin
distribution is deliberately dominated by the 0 (blank) outcome to keep the
aggregate pot modest enough that the freegame fence still converges to target.

### How the pot accumulates and pays (key code, `gamestate.py`)

```python
def assign_special_sym_function(self):
    # create_symbol() tags each free-spin L3 with a random value
    self.special_symbol_functions = {"L3": [self.assign_collect_value]}

def assign_collect_value(self, symbol):
    if self.gametype != self.config.basegame_type:      # free spins only
        value = get_random_outcome(self.config.collect_values)
        if value > 0:
            symbol.assign_attribute({"prize": value})   # non-zero coins only

def accumulate_collect_pot(self):                        # called each free spin
    for reel in self.board:
        for sym in reel:
            if sym.check_attribute("prize") and sym.get_attribute("prize"):
                self.collect_pot += sym.get_attribute("prize")
    # ... emits a "collect" event with the running potValue

def end_freespin(self):                                  # pay once, at round end
    if self.collect_pot > 0:
        self.win_manager.reset_spin_win()                # avoid double-count
        self.win_manager.update_spinwin(self.collect_pot)  # -> running_bet_win
        # ... emits "collectPayout"
        self.evaluate_wincap()                           # cap at 5,000x
        self.win_manager.update_gametype_wins(self.gametype)  # -> freegame bucket
    super().end_freespin()
```

`reset_book` sets `self.collect_pot = 0.0` after `super().reset_book()`. The pot
is booked into the free-game win so `basegame_wins + freegame_wins` stays equal
to `running_bet_win` (the SDK asserts this in `update_final_win`).

New book events: `collect` (per free spin coins land, with running `potValue`)
and `collectPayout` (once, immediately before `freeSpinEnd`). Amounts are in
centibets.

---

## Validated results (100,000 rounds per mode, optimised lookup tables)

| Mode | Cost | RTP (4dp) | RTP (10dp) | Weighted SD | Max win | Hit rate |
|---|---|---|---|---|---|---|
| base  | 1.0x   | 96.3500% | 96.3499998474% | 17.17x  | 5,000x | 29.11% |
| bonus | 100.0x | 96.3500% | 96.3499999943% | 214.37x | 5,000x | 100% |

RTP computed directly from `library/publish_files/lookUpTable_{base,bonus}_0.csv`
as `sum(weight * payout) / sum(weight) / 100 / cost`.

Statelessness verified on the generated books: exactly one `collectPayout` per
book (never multiple, so the pot never carries across rounds), and the sum of
all coin values always equals the payout amount. Base rounds that never enter
free spins carry no collect events at all.

No fence retune was needed: the existing `base` freegame fence (rtp 0.38, hr 185)
and `bonus` freegame fence (rtp 0.9135) still converge with the added pot — the
optimiser reweights the book pool to hit target. The `collect_values` weighting
(heavy 0) is the knob that keeps the pot within convergence range.

---

## Files (all under `games/future_spinner_collect/`, siblings only — nothing locked touched)

```
game_config.py       — added special_symbols["collect"]=["L3"], collect_values{},
                        trimmed bet_modes to {base, bonus}
game_optimization.py — wincaps -> defaultdict fallback, opt_params filtered to kept modes
gamestate.py         — reset_book (pot init), assign_collect_value callback,
                        accumulate_collect_pot, end_freespin (pot payout), run_freespin
game_executables/game_calculation.py — unchanged from base (ways "global" strategy)
run.py               — inherited (full 11-mode runner); a 2-mode scratch runner was
                        used for generation
```

To regenerate: point a runner's `_GAME_DIR` at `future_spinner_collect` and run
`./env/bin/python <runner> base,bonus` from the repo root using the `env` venv.
