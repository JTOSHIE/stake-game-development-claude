# File: run.py
# Game: Future Spinner by We Roll Spinners
# Purpose: Simulation runner — entry point that wires together GameConfig and
#          GameState, runs the book-generation pipeline, and optionally runs
#          optimisation and analytics passes.
#
# Usage (from SDK root):
#   python3 games/future_spinner/run.py
#
# Toggle PRODUCTION below to switch between development and production settings.

import sys
import os

# ── Path setup — works regardless of working directory ────────────────────────
_GAME_DIR = os.path.dirname(os.path.abspath(__file__))
_SDK_ROOT  = os.path.normpath(os.path.join(_GAME_DIR, "..", ".."))

for _p in (_GAME_DIR, _SDK_ROOT):
    if _p not in sys.path:
        sys.path.insert(0, _p)

# ── Toggle: False = development, True = production ────────────────────────────
PRODUCTION = True

# ── Imports ───────────────────────────────────────────────────────────────────
from gamestate import GameState                                   # noqa: E402
from game_config import GameConfig                                # noqa: E402
from optimization_program.run_script import OptimizationExecution # noqa: E402
from utils.game_analytics.retrieve_game_information import GameInformation  # noqa: E402
from utils.game_analytics.print_all_results import PrintJSON, PrintXLSX     # noqa: E402
from src.state.run_sims import create_books                       # noqa: E402
from src.write_data.write_configs import generate_configs         # noqa: E402

# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":

    # -- Game identity ---------------------------------------------------------
    game_name  = "future_spinner"
    rtp_target = 96.35
    mode_list  = ["base"]

    # -- Pipeline parameters: driven by PRODUCTION flag -----------------------
    if PRODUCTION:
        num_threads   = 10          # Python multiprocessing workers
        rust_threads  = 20          # Rust optimiser threads
        batching_size = 5000        # Sims per batch per thread (10000 < 5000^2, no divisibility constraint)
        compression   = True        # Write .jsonl.zst (zstandard)
        num_sim_args  = {
            "base":  100_000,       # Full production — 100 k base-game simulations
            "bonus": 100_000,       # Required for generate_configs()
        }
        run_conditions = {
            "run_sims":         True,
            "run_optimization": True,
            "run_analysis":     True,
        }
    else:
        num_threads   = 1           # Single-threaded for fast iteration
        rust_threads  = 4
        batching_size = 100         # 100 % (1 * 100) == 0 - satisfies SDK constraint
        compression   = False       # Plain .jsonl for easy inspection
        num_sim_args  = {
            "base":  100,           # 100 sims — quick smoke-test
            "bonus": 100,           # 100 sims — needed for generate_configs()
        }
        run_conditions = {
            "run_sims":         True,
            "run_optimization": False,
            "run_analysis":     False,
        }

    profiling    = False
    target_modes = mode_list

    # -- Header ----------------------------------------------------------------
    print("=" * 60)
    print("FUTURE SPINNER - We Roll Spinners")
    print(f"Mode: {'PRODUCTION' if PRODUCTION else 'DEVELOPMENT'}")
    print(f"RTP Target: {rtp_target}%")
    print("=" * 60)

    # -- Pipeline --------------------------------------------------------------
    config    = GameConfig()
    gamestate = GameState(config)

    # 1. Simulate -> writes books_*.jsonl[.zst], lookUpTable_*.csv, force_record_*.json
    if run_conditions["run_sims"]:
        create_books(
            gamestate,
            config,
            num_sim_args,
            batching_size,
            num_threads,
            compression,
            profiling,
        )

    # 2. Config generation -> writes config.json, fe_config.json, index.json
    generate_configs(gamestate)

    # 3. Optimisation -> produces lookUpTable_*_0.csv targeting rtp_target
    if run_conditions["run_optimization"]:
        OptimizationExecution().run_all_modes(config, target_modes, rust_threads)
        generate_configs(gamestate)   # re-generate to update SHA hashes

    # 4. Analytics -> writes Excel statistics sheet
    if run_conditions["run_analysis"]:
        custom_keys = [{"symbol": "scatter"}]
        game_obj = GameInformation(gamestate, custom_keys=custom_keys, modes_to_analyse=["base"])
        game_obj.all_modes = ["base"]   # restrict XLSX to analysed modes only
        PrintJSON(game_obj)
        PrintXLSX(game_obj)
