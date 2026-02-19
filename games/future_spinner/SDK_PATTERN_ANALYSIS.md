# SDK Pattern Analysis
## Future Spinner — Implementation Blueprint
**Source:** `games/0_0_lines/` (lines game) + `games/0_0_ways/` (ways game) + full `src/` traversal
**Analyst:** Claude Code — February 2026

---

## Table of Contents
1. [GameConfig — Class Hierarchy & Required Fields](#1-gameconfig)
2. [GameState — Methods & Spin Flow](#2-gamestate)
3. [game_calculation.py — Function Inventory](#3-game_calculation)
4. [run.py — Parameter Reference](#4-runpy)
5. [Event Types — Exact JSON Format](#5-event-types)
6. [Lookup Table CSV — Column Spec](#6-lookup-table-csv)
7. [Books .jsonl — Record Schema](#7-books-jsonl)
8. [index.json — Full Schema](#8-indexjson)
9. [Supporting Output Files](#9-supporting-output-files)
10. [Future Spinner Implementation Notes](#10-future-spinner-notes)

---

## 1. GameConfig

### 1.1 Class Hierarchy

```
src/config/config.py  →  Config          (base — sets defaults)
games/<game>/game_config.py  →  GameConfig(Config)   (game-specific overrides)
```

`GameConfig` is a **singleton** (enforced via `__new__`):
```python
class GameConfig(Config):
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

### 1.2 Required Fields (must be set in `__init__`)

| Field | Type | Example | Notes |
|---|---|---|---|
| `game_id` | `str` | `"0_0_lines"` | Used for all path construction |
| `provider_number` | `int` | `0` | Written to `config.json` |
| `working_name` | `str` | `"Sample Lines Game"` | Human-readable name |
| `wincap` | `float` | `5000.0` | Maximum payout multiplier |
| `win_type` | `str` | `"lines"` or `"ways"` | Controls which calculation class to use |
| `rtp` | `float` | `0.9700` | Must be < 1.0 |
| `num_reels` | `int` | `5` | Number of columns |
| `num_rows` | `list[int]` | `[3,3,3,3,3]` | Rows per reel — length must equal `num_reels` |
| `paytable` | `dict` | `{(5,"H1"): 50}` | See §1.3 |
| `special_symbols` | `dict` | `{"wild":["W"],"scatter":["S"],"multiplier":["W"]}` | Used by Board and Executables |
| `freespin_triggers` | `dict` | `{"basegame":{3:8},"freegame":{2:3}}` | Scatter count → free-spin count |
| `anticipation_triggers` | `dict` | `{"basegame":2,"freegame":1}` | Scatter count that starts reel anticipation |
| `include_padding` | `bool` | `True` | Adds top/bottom symbols to board events |
| `reels` | `dict` | `{"BR0": [[...],[...],[...],[...],[...]]}` | Loaded via `read_reels_csv()` |
| `padding_reels` | `dict` | `{basegame_type: reels["BR0"]}` | Used for the FE config reel-padding section |
| `bet_modes` | `list[BetMode]` | — | See §1.4 |
| `construct_paths()` | call | — | **Must be called after `game_id` is set** |

### 1.3 Paytable Format

```python
# Key: (match_count: int, symbol_id: str) → payout_multiplier: float
# Payout is expressed as a multiple of the bet amount
# Values are stored as floats, converted to int×100 in events (i.e. 0.5x → 50 units)
self.paytable = {
    (5, "W"):  50,     # 5-of-a-kind Wild pays 50× bet
    (4, "W"):  20,
    (3, "W"):  10,
    (5, "H1"): 50,
    (4, "H1"): 20,
    (3, "H1"): 10,
    (5, "L1"): 5,
    (4, "L1"): 1,
    (3, "L1"): 0.5,    # fractional payout — allowed
}
```

**Ways-game note:** For ways, the base paytable value is multiplied by the number of winning
ways at runtime: `win = config.paytable[(kind, symbol)] * ways_count`.

### 1.4 BetMode / Distribution Structure

```python
from src.config.betmode import BetMode
from src.config.distributions import Distribution

BetMode(
    name="base",               # str — must match keys in opt_params
    cost=1.0,                  # float — relative bet cost (1.0 = standard)
    rtp=self.rtp,              # float — target RTP for this mode
    max_win=5000,              # float — wincap for this mode
    auto_close_disabled=False, # bool — controls RGS auto-close behaviour
    is_feature=True,           # bool — True for "base" modes
    is_buybonus=False,         # bool — True for buy-bonus modes
    distributions=[
        Distribution(
            criteria="wincap",       # str — label used by optimizer + force files
            quota=0.001,             # float — fraction of sims assigned this criteria
            win_criteria=5000.0,     # float|None — sim must match this payout exactly
            conditions={
                "reel_weights": {
                    "basegame": {"BR0": 1},     # reelstrip_id → weight
                    "freegame": {"FR0": 1, "FRWCAP": 5},
                },
                "force_wincap": True,
                "force_freegame": True,
                "scatter_triggers": {3: 50, 4: 20, 5: 5},  # scatter count → weight
                "mult_values": {
                    "basegame": {1: 1},
                    "freegame": {2: 60, 3: 80, ...},         # mult value → weight
                },
            },
        ),
        Distribution(criteria="freegame", quota=0.1, conditions={...}),
        Distribution(criteria="0",        quota=0.4, win_criteria=0.0, conditions={...}),
        Distribution(criteria="basegame", quota=0.5, conditions={...}),
    ],
)
```

**Distribution `conditions` required keys:**
- `reel_weights` — **always required** (enforced by `Distribution.verify_and_set_conditions`)
- `force_wincap` — defaults to `False` if omitted
- `force_freegame` — defaults to `False` if omitted

**Quota rules:**
- All quota values within a BetMode must sum to 1.0 (or be auto-balanced by the runner)
- Alternatively use `fixed_amt=N` instead of `quota` for exact simulation counts

### 1.5 Win Levels (used by setWin / freeSpinEnd events)

Defined in `Config.__init__`, two tables: `"standard"` and `"endFeature"`:

```python
self.win_levels = {
    "standard": {
        1: (0,     0.1),
        2: (0.1,   1.0),
        3: (1.0,   2.0),
        4: (2.0,   5.0),
        5: (5.0,   15.0),
        6: (15.0,  30.0),
        7: (30.0,  50.0),
        8: (50.0,  100.0),
        9: (100.0, wincap),
        10:(wincap, inf),
    },
    "endFeature": { 1:(0,1), 2:(1,5), 3:(5,10), 4:(10,20), 5:(20,50),
                    6:(50,100), 7:(100,500), 8:(500,2000), 9:(2000,wincap), 10:(wincap,inf) }
}
```

### 1.6 Path Construction

`construct_paths()` sets:
- `self.reels_path` → `games/<game_id>/reels/`
- `self.library_path` → `games/<game_id>/library/`
- `self.publish_path` → `games/<game_id>/library/publish_files/`

All paths derived from `src/config/paths.py`:
```python
PATH_TO_GAMES = os.path.join(PROJECT_PATH, "games")
```

### 1.7 Reel CSV Format

Columns = reels, rows = symbols in order from top to bottom of strip.
Each row is comma-separated symbol IDs:

```
L1,H3,L5,L4,L3
H1,H3,H4,L2,L5
S,S,S,S,S
...
```

- Symbol strings are sanitised: non-alphanumeric characters stripped, must be non-empty
- Number of columns must equal `num_reels`
- All symbols must appear in the paytable or `special_symbols` (validated by `validate_reel_symbols`)

---

## 2. GameState

### 2.1 Full Inheritance Chain

```
src/config/config.py           Config
src/state/state.py             GeneralGameState(ABC)
src/state/state_conditions.py  Conditions(GeneralGameState)
src/calculations/board.py      Board(Conditions) ← not explicit; Board extends GeneralGameState
src/calculations/tumble.py     Tumble(Board)
src/executables/executables.py Executables(Conditions, Tumble)
games/<game>/game_calculations.py  GameCalculations(Executables)   ← pass-through or overrides
games/<game>/game_executables.py   GameExecutables(GameCalculations) ← adds evaluate_*_board()
games/<game>/game_override.py      GameStateOverride(GameExecutables) ← custom reset/repeat logic
games/<game>/gamestate.py          GameState(GameStateOverride)    ← run_spin / run_freespin
```

> **For Future Spinner** with the `game_executables/` package structure:
> `GameState` → `GameCalculation` (in `game_executables/game_calculation.py`) → `Executables`

### 2.2 Abstract Methods (must be implemented)

| Method | Signature | Called by |
|---|---|---|
| `run_spin` | `(self, sim: int, simulation_seed=None) -> None` | `run_sims()` in state.py |
| `run_freespin` | `(self) -> None` | `run_freespin_from_base()` in executables.py |
| `assign_special_sym_function` | `(self) -> None` | `__init__` of GeneralGameState |

**`run_freespin` is not required for stateless bonus games.** A minimal stub must still exist or
the abstract base class will raise. Override with `pass` or implement a minimal no-op.

### 2.3 `run_spin()` Canonical Flow (lines / ways)

```python
def run_spin(self, sim, simulation_seed=None):
    self.reset_seed(sim)          # Seeds RNG with sim number for reproducibility
    self.repeat = True
    while self.repeat:
        self.reset_book()         # Clears board, events, win counters, final_win=0
        self.draw_board(emit_event=True)  # Draws board, emits "reveal" event

        # Win evaluation (emit winInfo, setWin, setTotalWin)
        self.evaluate_ways_board()   # or evaluate_lines_board()

        # Optional: check scatter and trigger free spins
        if self.check_fs_condition() and self.check_freespin_entry():
            self.run_freespin_from_base()

        # Resolve final payout, emit finalWin
        self.evaluate_finalwin()

        # Check if criteria constraints were met; set self.repeat=True to retry
        self.check_repeat()

    self.imprint_wins()           # Commit book to library, record force keys
```

### 2.4 `run_freespin()` Canonical Flow

```python
def run_freespin(self):
    self.reset_fs_spin()          # Sets gametype=freegame, fs=0
    while self.fs < self.tot_fs:
        self.update_freespin()    # Emits updateFreeSpin, increments fs counter
        self.draw_board(emit_event=True)
        self.evaluate_ways_board()
        if self.check_fs_condition():
            self.update_fs_retrigger_amt()  # Emits freeSpinRetrigger
        self.win_manager.update_gametype_wins(self.gametype)
    self.end_freespin()           # Emits freeSpinEnd
```

### 2.5 Key State Variables

| Variable | Set by | Purpose |
|---|---|---|
| `self.sim` | `reset_seed()` | Current simulation index |
| `self.criteria` | `run_sims()` | Active distribution criteria (`"basegame"`, `"freegame"`, etc.) |
| `self.betmode` | `run_sims()` | Active BetMode name (`"base"`, `"bonus"`) |
| `self.gametype` | `reset_book()` / `reset_fs_spin()` | `"basegame"` or `"freegame"` |
| `self.board` | `create_board_reelstrips()` | `list[list[Symbol]]` — `[reel][row]` |
| `self.repeat` | `check_repeat()` | `True` = retry spin; `False` = accept |
| `self.final_win` | `update_final_win()` | Total payout multiplier for this sim |
| `self.wincap_triggered` | `evaluate_wincap()` | Stops further processing at wincap |
| `self.tot_fs` | `update_freespin_amount()` | Total free spins to play |
| `self.fs` | `update_freespin()` | Current free spin number |
| `self.win_data` | `evaluate_*_board()` | `{"totalWin": float, "wins": [...]}`|
| `self.special_syms_on_board` | `get_special_symbols_on_board()` | `{"scatter": [{"reel":R,"row":r},...], "wild":[...]}` |
| `self.book` | `reset_book()` | Current `Book` object — accumulates events |
| `self.anticipation` | `create_board_reelstrips()` | `list[int]` length=num_reels — reel anticipation levels |

### 2.6 `draw_board()` Behaviour

```python
def draw_board(self, emit_event: bool = True, trigger_symbol: str = "scatter"):
```

- If `force_freegame=True` AND `gametype==basegame`:
  draws scatter count from `scatter_triggers` weights, forces that many scatters onto board
- If `force_freegame=False` AND `gametype==basegame`:
  draws random board, **retries** if it accidentally hits freespin scatter threshold
- If `gametype==freegame`: draws freely from reelstrip
- Always emits `"reveal"` event when `emit_event=True`

### 2.7 `check_repeat()` Logic

Default (in `state.py`):
```python
def check_repeat(self):
    if self.repeat is False:
        win_criteria = self.get_current_betmode_distributions().get_win_criteria()
        if win_criteria is not None and self.final_win != win_criteria:
            self.repeat = True          # Retry if win doesn't match exact target
        if conditions["force_freegame"] and not self.triggered_freegame:
            self.repeat = True          # Retry if freegame wasn't triggered
    self.repeat_count += 1
```

Games can extend this in `game_override.py` to add custom repeat logic.

### 2.8 `assign_special_sym_function()`

Used to attach runtime attributes to symbols as they are created:

```python
def assign_special_sym_function(self):
    self.special_symbol_functions = {
        "W": [self.assign_mult_property],  # function called on every W symbol
    }
```

For symbols with no runtime attributes, return an empty dict:
```python
def assign_special_sym_function(self):
    self.special_symbol_functions = {}
```

---

## 3. game_calculation.py

### 3.1 Position in the Chain

`game_calculation.py` sits immediately above `src/executables/executables.py`.
In the example games this is split across two files (`game_calculations.py` + `game_executables.py`).
For Future Spinner both are merged into `game_executables/game_calculation.py`.

### 3.2 SDK Calculation Classes Available

#### `Ways` — `src/calculations/ways.py`

```python
Ways.get_ways_data(config, board,
    wild_key="wild",
    global_multiplier=1,
    multiplier_key="multiplier",
    multiplier_strategy="symbol"   # "symbol" | "board" | "global"
) → {"totalWin": float, "wins": [...]}
```

Each win entry:
```python
{
    "symbol": "H1",
    "kind": 5,
    "win": 120.0,              # after multiplier
    "positions": [{"reel": 0, "row": 1}, ...],
    "meta": {
        "ways": 16,            # number of ways this win counts
        "globalMult": 1,
        "winWithoutMult": 120.0,
        "symbolMult": 0,
    }
}
```

```python
Ways.emit_wayswin_events(gamestate)   # calls win_info_event, evaluate_wincap, set_win_event, set_total_event
Ways.record_ways_wins(gamestate)      # writes force file entries
```

#### `Lines` — `src/calculations/lines.py`

```python
Lines.get_lines(board, config,
    wild_key="wild",
    wild_sym="W",
    multiplier_method="symbol",
    global_multiplier=1
) → {"totalWin": float, "wins": [...]}
```

Each win entry:
```python
{
    "symbol": "L2",
    "kind": 3,
    "win": 30.0,
    "positions": [{"reel": 0, "row": 1}, ...],
    "meta": {
        "lineIndex": 18,        # which payline index (1-based from config.paylines)
        "multiplier": 1,
        "winWithoutMult": 30.0,
        "globalMult": 1,
        "lineMultiplier": 1,
    }
}
```

```python
Lines.emit_linewin_events(gamestate)
Lines.record_lines_wins(gamestate)
```

#### `Scatter` — `src/calculations/scatter.py`

```python
Scatter.get_scatterpay_wins(config, board,
    wild_key="wild",
    multiplier_key="multiplier",
    global_multiplier=1
) → {"totalWin": float, "wins": [...]}
```

Each win entry:
```python
{
    "symbol": "H1",
    "win": 50.0,
    "positions": [{"reel": R, "row": r}, ...],
    "meta": {
        "globalMult": 1,
        "clusterMult": 1,
        "winWithoutMult": 50.0,
        "overlay": {"reel": R, "row": r}  # position for win-amount display
    }
}
```

```python
Scatter.record_scatter_wins(gamestate)
```

### 3.3 Multiplier Strategies (`src/wins/multiplier_strategy.py`)

```python
apply_mult(board, strategy, win_amount, global_multiplier, positions)
# strategy = "global"   → win × global_multiplier
# strategy = "symbol"   → win × sum(symbol.multiplier) for winning positions
# strategy = "combined" → win × sym_mult × global_multiplier
# Returns (final_win: float, applied_multiplier: int)
```

### 3.4 Standard `evaluate_ways_board()` Implementation

```python
def evaluate_ways_board(self):
    self.win_data = Ways.get_ways_data(self.config, self.board)
    if self.win_data["totalWin"] > 0:
        Ways.record_ways_wins(self)
        self.win_manager.update_spinwin(self.win_data["totalWin"])
    Ways.emit_wayswin_events(self)
```

---

## 4. run.py

### 4.1 Parameter Reference

```python
# ── Threading ──────────────────────────────────────────────
num_threads  = 10       # Python multiprocessing processes
rust_threads = 20       # Threads used by the Rust optimization engine
batching_size = 5000    # Sims per batch per thread (controls temp file size)

# ── Compression ────────────────────────────────────────────
compression = True      # True → books output as .jsonl.zst
                        # False → books output as .json or .jsonl
profiling = False       # True → generates a flame-graph; forces num_threads=1

# ── Simulation counts per bet-mode ─────────────────────────
num_sim_args = {
    "base":  int(1e4),  # 10,000 sims for base mode
    "bonus": int(1e4),  # 10,000 sims for bonus mode
}
# Constraint: num_sims % (num_threads * batching_size) == 0
# When sims > batch * batch, this constraint is enforced by assertion

# ── Pipeline switches ──────────────────────────────────────
run_conditions = {
    "run_sims":          True,   # Generate book files
    "run_optimization":  True,   # Run Rust optimization → produces lookUpTable_*_0.csv
    "run_analysis":      True,   # Generate Excel statistics file
    "run_format_checks": True,   # Verify output format integrity
}
```

### 4.2 Full Pipeline Call Sequence

```python
config     = GameConfig()
gamestate  = GameState(config)

# 1. Simulate → writes books_*.jsonl.zst, lookUpTable_*.csv, force_record_*.json
create_books(gamestate, config, num_sim_args, batching_size, num_threads, compression, profiling)

# 2. Config generation → writes config.json, config_fe_*.json, math_config.json, index.json
generate_configs(gamestate)

# 3. Optimization → produces lookUpTable_*_0.csv (the published lookup)
OptimizationExecution().run_all_modes(config, target_modes, rust_threads)

# 4. Re-generate configs post-optimization (updates SHA hashes)
generate_configs(gamestate)

# 5. Analytics → writes Excel stats sheet
create_stat_sheet(gamestate, custom_keys=[{"symbol": "scatter"}])

# 6. Format verification
execute_all_tests(config)
```

### 4.3 Sim Allocation

`get_sim_splits()` distributes simulation count across criteria using quota weights.
`assign_sim_criteria()` randomly shuffles the assignment.
Each simulation is assigned one criteria from its BetMode's `distributions` list.

---

## 5. Event Types

All events are stored in `book.events` as an ordered list. Each event has an `"index"` field
(0-based integer, sequential). Win amounts are stored as **integer centibets** (multiply by 100).

### 5.1 `reveal`
Emitted at the start of every spin or free spin. Always event index 0 per spin phase.

```json
{
    "index": 0,
    "type": "reveal",
    "board": [
        [{"name": "H1"}, {"name": "L2"}, {"name": "L3"}, {"name": "H4"}, {"name": "L2"}],
        ... one sub-array per reel ...
    ],
    "paddingPositions": [131, 13, 182, 169, 68],
    "gameType": "basegame",
    "anticipation": [0, 0, 0, 1, 2]
}
```

**Notes:**
- `board` is `[reel][row]` — outer array = columns (reels), inner = rows top-to-bottom
- When `include_padding=True`, each reel sub-array has `num_rows + 2` entries (top + board + bottom)
- Symbol objects: `{"name": "H1"}` for normal symbols; `{"name": "S", "scatter": true}` for special
- `paddingPositions` = reel stop position index for each reel (used by FE for animation)
- `anticipation` = per-reel integer; 0 = no anticipation, >0 = delay level

### 5.2 `winInfo`
Emitted after `evaluate_*_board()` when `spin_win > 0`.

```json
{
    "index": 1,
    "type": "winInfo",
    "totalWin": 30,
    "wins": [
        {
            "symbol": "L2",
            "kind": 3,
            "win": 30,
            "positions": [{"reel": 0, "row": 1}, {"reel": 1, "row": 1}, {"reel": 2, "row": 3}],
            "meta": {
                "lineIndex": 18,
                "multiplier": 1,
                "winWithoutMult": 30,
                "globalMult": 1,
                "lineMultiplier": 1
            }
        }
    ]
}
```

**Meta for ways wins** (no `lineIndex`):
```json
"meta": {
    "ways": 16,
    "globalMult": 1,
    "winWithoutMult": 120,
    "symbolMult": 0
}
```

**Amounts:** All `win` / `totalWin` values are in centibets (× 100), capped at `wincap × 100`.
Row positions are offset +1 when `include_padding=True` to account for top padding symbol.

### 5.3 `setWin`
Emitted after `winInfo` — updates the spin win ticker.

```json
{
    "index": 2,
    "type": "setWin",
    "amount": 30,
    "winLevel": 2
}
```

`winLevel` lookup uses `config.win_levels["standard"]` (1–10 scale).

### 5.4 `setTotalWin`
Emitted after every `evaluate_*_board()`, even on zero-win spins.

```json
{
    "index": 3,
    "type": "setTotalWin",
    "amount": 30
}
```

`amount` is the **cumulative** running total across all spins in the round (centibets).

### 5.5 `finalWin`
Emitted by `evaluate_finalwin()` → the definitive payout for this game round.

```json
{
    "index": 4,
    "type": "finalWin",
    "amount": 2870
}
```

### 5.6 `freeSpinTrigger`
Emitted when scatter triggers free spins from basegame.

```json
{
    "index": 5,
    "type": "freeSpinTrigger",
    "totalFs": 8,
    "positions": [
        {"reel": 0, "row": 2},
        {"reel": 2, "row": 1},
        {"reel": 4, "row": 3}
    ]
}
```

`positions` = scatter symbol grid positions (row offset +1 if padding enabled).

### 5.7 `freeSpinRetrigger`
Emitted when scatter re-triggers during free spins.

```json
{
    "index": 6,
    "type": "freeSpinRetrigger",
    "totalFs": 15,
    "positions": [{"reel": 2, "row": 1}, {"reel": 3, "row": 3}]
}
```

`totalFs` = updated total (existing remaining + new spins added).

### 5.8 `updateFreeSpin`
Emitted at the start of each free spin, before the reveal.

```json
{
    "index": 0,
    "type": "updateFreeSpin",
    "amount": 0,
    "total": 8
}
```

`amount` = current spin number (0-based), `total` = total spins awarded.

### 5.9 `freeSpinEnd`
Emitted when all free spins are exhausted.

```json
{
    "index": 7,
    "type": "freeSpinEnd",
    "amount": 2870,
    "winLevel": 5
}
```

`amount` = total centibets won during freegame phase.
`winLevel` uses `config.win_levels["endFeature"]`.

### 5.10 `wincap`
Emitted when cumulative win reaches `config.wincap`. Stops further processing.

```json
{
    "index": 8,
    "type": "wincap",
    "amount": 500000
}
```

`amount` = `wincap × 100`.

### 5.11 `enterBonus`
Emitted to signal explicit bonus entry (optional — not used in 0_0_lines).

```json
{
    "index": 9,
    "type": "enterBonus",
    "reason": "scatter"
}
```

### 5.12 `updateGlobalMult`
Emitted when a global multiplier increments (tumble / progressive games).

```json
{
    "type": "updateGlobalMult",
    "globalMult": 3
}
```

### 5.13 Tumble Events (not used in Future Spinner — documented for completeness)

| Type | Key Fields |
|---|---|
| `tumbleBoard` | `newSymbols: [[{name:...},...],...]`, `explodingSymbols: [{reel, row},...]` |
| `setTumbleWin` | `amount: int` |
| `updateTumbleWin` | `amount: int` |

### 5.14 Minimal Zero-Win Spin Event Sequence

```json
[
    {"index": 0, "type": "reveal",      "board": [...], "paddingPositions": [...], ...},
    {"index": 1, "type": "setTotalWin", "amount": 0},
    {"index": 2, "type": "finalWin",    "amount": 0}
]
```

### 5.15 Full Base-Game Win + Free Spin Trigger Sequence

```
reveal → winInfo → setWin → setTotalWin → finalWin →
freeSpinTrigger → updateFreeSpin →
[repeat for each free spin:] reveal → [winInfo → setWin] → setTotalWin →
[optional: freeSpinRetrigger → updateFreeSpin] →
freeSpinEnd → finalWin
```

---

## 6. Lookup Table CSV

### 6.1 Main Lookup Table (`lookUpTable_<mode>.csv`)

Written by `make_lookup_tables()`. Three columns, no header:

```
<sim_id>, <weight>, <payout_centibets>
```

Example:
```
0,199895486317,0
1,6403033885,20
2,695476438,140
3,6403033885,20
4,2777507435,300
```

| Column | Type | Description |
|---|---|---|
| col 0 | `int` | Simulation ID (0-based) |
| col 1 | `int` | Selection weight (large integer — relative probability) |
| col 2 | `int` | Payout in centibets (multiplier × 100) |

The published version (`lookUpTable_<mode>_0.csv`) is a copy produced after optimization.
The optimization engine may reorder rows or adjust weights to hit the RTP target.

### 6.2 Segmented Lookup Table (`lookUpTableSegmented_<mode>.csv`)

Written by `make_lookup_pay_split()`. Four columns, no header:

```
<sim_id>, <criteria>, <basegame_win>, <freegame_win>
```

Example:
```
0,0,0.0,0.0
1,basegame,0.2,0.0
2,freegame,0.0,1.4
3,basegame,0.2,0.0
```

| Column | Type | Description |
|---|---|---|
| col 0 | `int` | Simulation ID |
| col 1 | `str` | Distribution criteria (`"basegame"`, `"freegame"`, `"wincap"`, `"0"`) |
| col 2 | `float` | Basegame win (× bet) |
| col 3 | `float` | Freegame win (× bet) |

---

## 7. Books .jsonl

### 7.1 File Format

- One JSON object per line (JSONL format)
- Compressed with zstandard (`.jsonl.zst`) when `compression=True`
- One record per simulation

### 7.2 Record Schema

```json
{
    "id":              0,
    "payoutMultiplier": 0,
    "events": [ ... ],
    "criteria":        "0",
    "baseGameWins":    0.0,
    "freeGameWins":    0.0
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `int` | Simulation index (0-based) |
| `payoutMultiplier` | `int` | Total payout in centibets (`final_win × 100`), integer |
| `events` | `array` | Ordered array of event objects (see §5) |
| `criteria` | `str` | Distribution criteria this sim was assigned (`"basegame"`, `"freegame"`, `"wincap"`, `"0"`) |
| `baseGameWins` | `float` | Basegame contribution to total payout (× bet) |
| `freeGameWins` | `float` | Freegame contribution to total payout (× bet) |

### 7.3 Correspondence with `Book` class

```python
class Book:
    id                  → "id"
    payout_multiplier   → "payoutMultiplier"  (int(round(value * 100, 0)))
    events              → "events"
    criteria            → "criteria"
    basegame_wins       → "baseGameWins"
    freegame_wins       → "freeGameWins"
```

---

## 8. index.json

Located at `library/publish_files/index.json`. Written by `make_index_config()`.
This is the file the RGS uses to locate published math assets on AWS.

```json
{
    "modes": [
        {
            "name":    "base",
            "cost":    1.0,
            "events":  "books_base.jsonl.zst",
            "weights": "lookUpTable_base_0.csv"
        },
        {
            "name":    "bonus",
            "cost":    100.0,
            "events":  "books_bonus.jsonl.zst",
            "weights": "lookUpTable_bonus_0.csv"
        }
    ]
}
```

| Field | Source |
|---|---|
| `name` | `BetMode._name` |
| `cost` | `BetMode._cost` |
| `events` | `booksFile.file` from `config.json` — always `books_<mode>.jsonl.zst` |
| `weights` | `tables[0].file` from `config.json` — always `lookUpTable_<mode>_0.csv` |

---

## 9. Supporting Output Files

### 9.1 `config.json` (Backend Config)

Located at `library/configs/config.json`. Written by `make_be_config()`.

```json
{
    "workingName": "Sample Lines Game",
    "frontendConfig": {"file": "fe_config.json", "sha256": "..."},
    "gameID": "0_0_lines",
    "rtp": 97.0,
    "betDenomination": 1000,
    "minDenomination": 10,
    "providerNumber": 0,
    "standardForceFile": {"file": "force.json", "sha256": "..."},
    "bookShelfConfig": [
        {
            "name": "base",
            "tables": [{"file": "lookUpTable_base_0.csv", "sha256": "..."}],
            "cost": 1.0,
            "rtp": 0.97,
            "std": 10.74,
            "bookLength": 10000,
            "feature": true,
            "autoEndRoundDisabled": false,
            "buyBonus": false,
            "maxWin": 5000,
            "booksFile": {"file": "books_base.jsonl.zst", "sha256": "..."},
            "forceFile":  {"file": "force_record_base.json", "sha256": "..."}
        }
    ]
}
```

**Notes:**
- `rtp` is stored as a percentage (e.g. `97.0`, not `0.97`)
- `betDenomination` = `min_denomination × 100 × 100` (e.g. 0.1 → 1000)
- `minDenomination` = `min_denomination × 100` (e.g. 0.1 → 10)
- `std` = standard deviation of win distribution, normalised by cost
- `bookLength` = number of simulation records

### 9.2 `force.json` (Force-Play Lookup)

Located at `library/forces/force.json`. A flat index of all observable force conditions.

```json
{
    "base": {
        "gametype": ["basegame", "freegame"],
        "kind": ["3", "4", "5"],
        "symbol": ["H1", "H2", "L1", "scatter", "W", ...],
        "mult": ["1", "2", "3", ...]
    }
}
```

### 9.3 `force_record_<mode>.json` (Force Records)

Located at `library/forces/force_record_<mode>.json`. Used by optimizer to find examples.

```json
[
    {
        "search": [
            {"name": "gametype", "value": "basegame"},
            {"name": "kind",     "value": "3"},
            {"name": "mult",     "value": "1"},
            {"name": "symbol",   "value": "L4"}
        ],
        "timesTriggered": 991,
        "bookIds": [1, 3, 5, 11, ...]
    }
]
```

### 9.4 `event_config_<mode>.json`

One example of each event type seen across all simulations. Used for FE integration reference.
Automatically generated from `write_library_events()`.

---

## 10. Future Spinner Implementation Notes

### 10.1 Stateless Scatter Bonus — Architecture Decision

Future Spinner's bonus is a **single-spin instant scatter multiplier** with no free-spin round.
This has the following implications:

1. **`run_freespin()` is not needed.** Implement as a stub or omit entirely.
   However, `GeneralGameState` declares it `@abstractmethod`, so provide a minimal:
   ```python
   def run_freespin(self):
       pass   # Future Spinner: no free-spin round
   ```

2. **`freespin_triggers` must still be defined** (used by `draw_board()` to avoid accidental
   scatter blocking). Set to empty dicts or minimal values:
   ```python
   self.freespin_triggers = {
       self.basegame_type: {99: 1},   # Threshold unreachable on 5-reel grid
       self.freegame_type: {99: 1},
   }
   self.anticipation_triggers = {
       self.basegame_type: 99,
       self.freegame_type: 99,
   }
   ```

3. **Distribution conditions:** Do NOT set `force_freegame=True` on any distribution.
   This prevents `draw_board()` from forcing scatter counts and prevents `check_repeat()`
   from rejecting spins that don't trigger free spins.

4. **Scatter evaluation** happens inside `run_spin()` directly:
   ```python
   def run_spin(self, sim, simulation_seed=None):
       self.reset_seed(sim)
       self.repeat = True
       while self.repeat:
           self.reset_book()
           self.draw_board(emit_event=True)
           self.evaluate_ways_board()
           self.evaluate_scatter_multiplier()   # custom — reads scatter count, adds win
           self.win_manager.update_gametype_wins(self.gametype)
           self.evaluate_finalwin()
           self.check_repeat()
       self.imprint_wins()
   ```

5. **`evaluate_scatter_multiplier()` implementation** must:
   - Count `self.special_syms_on_board["scatter"]`
   - Look up `self.config.scatter_multiplier_table`
   - Call `self.win_manager.update_spinwin(scatter_win)` to add the award
   - Emit a custom event (e.g. `"winInfo"` or a custom `"scatterWin"` type)
   - Call `self.record({"kind": count, "symbol": "scatter", "gametype": self.gametype})`
     for force-file indexing

### 10.2 Ways Count Verification

Grid 5 reels × 4 rows: `4^5 = 1,024 ways`. No code change needed — `Ways.get_ways_data()`
calculates ways dynamically from `config.num_rows`.

### 10.3 `game_executables/` Package Import Path

Since `game_calculation.py` lives in a sub-package, `gamestate.py` imports it as:
```python
from game_executables.game_calculation import GameCalculation
class GameState(GameCalculation): ...
```

`run.py` must add the game directory to `sys.path`:
```python
sys.path.insert(0, os.path.dirname(__file__))
```

### 10.4 Reel Strip Files Required

Before `run.py` can execute, the following files must exist:
```
games/future_spinner/reels/BR0.csv   ← base-game reel strip
games/future_spinner/reels/FR0.csv   ← bonus/feature reel strip (if needed)
```

Format: 5 comma-separated columns, one row per reel position.
Symbol IDs: `H2 H1 M1 M2 M3 L1 L2 L3 W S` — all 10 symbols.

### 10.5 `opt_params` Requirement

`generate_configs()` → `make_temp_math_config()` iterates `gamestate.config.opt_params`.
If `opt_params` is not defined before `generate_configs()` is called, it will fail.

Either:
- Create a `game_optimization.py` with an `OptimizationSetup` class
- Or set `config.opt_params` directly in `game_config.py`

Minimum stub for a two-mode game:
```python
self.opt_params = {
    "base":  {"conditions": {}, "scaling": [], "parameters": {}, "distribution_bias": []},
    "bonus": {"conditions": {}, "scaling": [], "parameters": {}, "distribution_bias": []},
}
```

### 10.6 `padding_reels` Required by `generate_configs()`

`make_fe_config()` iterates `config.padding_reels`. Must be set:
```python
self.padding_reels = {
    self.basegame_type: self.reels["BR0"],
}
```

### 10.7 `provider_name` Required by FE Config

`make_fe_config()` reads `config.provider_name`. Not set in the constructor template.
Add to `game_config.py`:
```python
self.provider_name = "We Roll Spinners"
self.game_name = "Future Spinner"
```

---

*End of SDK Pattern Analysis — Future Spinner Implementation Blueprint*
