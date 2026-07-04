# FUTURE SPINNER: CODE-MECHANIC VARIANTS

Australian English, no em/en dashes. Companion to `docs/MASTER_TEMPLATE.md`.

Bet modes are config-only and selectable within ONE package (see the 11-mode library).
Feature MECHANICS are different: they live in the game's spin logic (gamestate +
game_calculation), so each mechanic is a SEPARATE game package, not a runtime toggle. For a
template, a mechanic variant = a themed fork with the mechanic swapped in. The Stake Engine
SDK ships a WORKING sample game for every core mechanic, which is the proven basis:

| Mechanic | SDK sample game | Win engine |
|---|---|---|
| Ways-to-win (our base) | `games/0_0_ways` | `src/calculations/ways.py` |
| Cluster pays | `games/0_0_cluster` | `src/calculations/cluster.py` |
| Paylines | `games/0_0_lines` | `src/calculations/lines.py` |
| Scatter / pay-anywhere | `games/0_0_scatter` | `src/calculations/scatter.py` |
| Expanding / multiplier wilds | `games/0_0_expwilds` | ways + symbol multipliers |
| Tumble / cascade | built-in `src/calculations/tumble.py` | any engine, looped |

All forks are siblings of the locked `future_spinner` (no lock exception needed). Each needs
its own maths regeneration + validation (the mechanic changes the win distribution, so the
optimiser fences are re-tuned to hold 96.3500% RTP).

---

## 1. Multiplier Wilds (BUILT: `games/future_spinner_multiwild`)

Wilds carry a random multiplier when they land in free spins; the wild multiplier drives the
feature (in place of the Overdrive meter). The exact recipe (proven, this fork):

- `game_config.py`: `special_symbols["multiplier"] = ["W"]`; add a weighted value table
  `wild_mult_values = {2:50, 3:30, 5:15, 10:5}`.
- `gamestate.py`: `assign_special_sym_function` returns `{"W": [self.assign_wild_multiplier]}`;
  the callback assigns `symbol.assign_attribute({"multiplier": get_random_outcome(...)})` in
  the free game only.
- `game_executables/game_calculation.py`: `Ways.get_ways_data(..., multiplier_strategy="symbol")`
  (the engine supports `symbol` / `board` / `global`, NOT a combined mode - so this variant
  uses wild multipliers instead of the global meter).
- Retune: wild multipliers raise the free-game RTP sharply (raw base ~82% vs ~34%), so the
  optimiser down-weights to hold 96.35%.

Status: mechanic runs; maths generated + validated for base + bonus (see the fork's README).

---

## 2. Tumble / Cascade (recipe)

Winning symbols explode and are replaced by symbols dropping from above; consecutive wins on
one spin. Fully supported by the built-in engine.

- Basis: `src/calculations/tumble.py` (`Tumble.tumble_board`) + `Executables.tumble_game_board`
  / `emit_tumble_win_events` (`src/executables/...`).
- `gamestate.run_spin`: after evaluating a win, loop: while the board has a win, call the
  tumble executable to drop/refill, re-evaluate, accumulate, until no win. A per-spin
  multiplier trail (common with tumbles) can reuse the Overdrive-meter pattern.
- Retune: cascades raise hit-driven RTP; rebalance the base-ways fence down.
- Fork: copy future_spinner, change `game_id`, add the tumble loop, regenerate + validate.

---

## 3. Cluster pays (recipe)

Wins are groups of 5+ connected matching symbols (not ways/lines). A different game feel.

- Basis: the whole `games/0_0_cluster` sample (win_type "cluster", `Cluster.get_clusters`).
- `game_config.py`: `self.win_type = "cluster"`; redefine the paytable by cluster SIZE (not
  match length); typically a larger grid (e.g. 6x6 or 7x7) suits clusters better than 5x4.
- `game_calculation.py`: call the Cluster engine instead of Ways; wire `explode` for optional
  tumbles.
- Retune from scratch (cluster distributions differ a lot from ways).
- Fork: adapt `0_0_cluster` to our symbols/theme, or fork future_spinner and swap the engine.

---

## 4. Paylines / Scatter-pays (recipes)

- Paylines: adapt `games/0_0_lines` - define `config.paylines` and call `Lines.get_lines`.
  Paylines are more dated than ways; lower priority.
- Scatter / pay-anywhere: adapt `games/0_0_scatter` - `Scatter.get_scatterpay_wins` counts a
  symbol anywhere on the grid. Pairs well with tumbles (Sweet-Bonanza style).

---

## Not possible (stateless platform rule)

Jackpots, gamble/double-up, cross-round collection/persistence, continuation, early cashout.
The Overdrive meter (and any in-round meter) is the compliant "persistence": it resets each round.

## How to add a mechanic to the template

1. Copy `games/future_spinner` to `games/future_spinner_<mechanic>` (sibling; not locked).
   Delete its `library/`.
2. Change `game_id`; swap the mechanic per the recipe above (or adapt the matching `0_0_*` sample).
3. Regenerate the modes you want and re-tune the optimiser fences to hold 96.3500% RTP.
4. Validate with a per-mode RTP/SD/tail recompute (as `scripts/validate_math.py` does).
5. Add the frontend presentation for the new mechanic (its own interpreter + win display).

Each mechanic variant is a focused build (maths + frontend). The maths is the now-or-never part
per game; the frontend is iterable.
