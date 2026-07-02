# File: run.py
# Game: Future Spinner by We Roll Spinners
# Purpose: Simulation runner for the two-mode OVERDRIVE FREE SPINS package.
#          Wires GameConfig + GameState + OptimizationSetup, runs the full
#          pipeline (books, configs, optimiser, analytics) for both bet modes.
#
# Toggle PRODUCTION below to switch between development and production settings.

import sys
import os

# -- Path setup: works regardless of working directory -------------------------
_GAME_DIR = os.path.dirname(os.path.abspath(__file__))
_SDK_ROOT = os.path.normpath(os.path.join(_GAME_DIR, "..", ".."))
for _p in (_GAME_DIR, _SDK_ROOT):
    if _p not in sys.path:
        sys.path.insert(0, _p)

# -- Toggle: False = development, True = production ----------------------------
PRODUCTION = True

# -- Imports -------------------------------------------------------------------
from gamestate import GameState                                          # noqa: E402
from game_config import GameConfig                                       # noqa: E402
from game_optimization import OptimizationSetup                          # noqa: E402
from optimization_program.run_script import OptimizationExecution        # noqa: E402
from utils.game_analytics.run_analysis import create_stat_sheet          # noqa: E402
from src.state.run_sims import create_books                              # noqa: E402
from src.write_data.write_configs import generate_configs               # noqa: E402

# -- Entry point ---------------------------------------------------------------
if __name__ == "__main__":

    rtp_target = 96.35
    target_modes = ["base", "bonus"]

    if PRODUCTION:
        num_threads = 10
        rust_threads = 20
        batching_size = 5000
        compression = True
        num_sim_args = {
            "base":  100_000,
            "bonus": 100_000,
        }
        run_conditions = {
            "run_sims": True,
            "run_optimization": True,
            "run_analysis": True,
        }
    else:
        num_threads = 1
        rust_threads = 4
        batching_size = 100
        compression = False
        num_sim_args = {
            "base":  100,
            "bonus": 100,
        }
        run_conditions = {
            "run_sims": True,
            "run_optimization": False,
            "run_analysis": False,
        }

    profiling = False

    print("=" * 60)
    print("FUTURE SPINNER - We Roll Spinners - Overdrive Free Spins")
    print(f"Mode: {'PRODUCTION' if PRODUCTION else 'DEVELOPMENT'}")
    print(f"RTP Target: {rtp_target}%  Modes: {target_modes}")
    print("=" * 60)

    config = GameConfig()
    gamestate = GameState(config)

    # Optimiser parameters must be set before generate_configs writes the math
    # config, and before the optimiser runs.
    if run_conditions["run_optimization"] or run_conditions["run_analysis"]:
        OptimizationSetup(config)

    # 1. Simulate both modes -> books_*.jsonl.zst, lookUpTable_*.csv, force files
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

    # 2. Config generation -> config.json, fe_config, math_config, index.json
    generate_configs(gamestate)

    # 3. Optimisation for both modes -> weighted lookUpTable_*_0.csv
    if run_conditions["run_optimization"]:
        OptimizationExecution().run_all_modes(config, target_modes, rust_threads)
        generate_configs(gamestate)   # regenerate to refresh hashes

    # 4. Analytics -> statistics_summary.json + XLSX (both modes)
    if run_conditions["run_analysis"]:
        custom_keys = [{"symbol": "scatter"}]
        create_stat_sheet(gamestate, custom_keys=custom_keys)
