#!/usr/bin/env python3
"""Multi-mode build runner for Lumen. Simulates ALL named modes first (so every
raw lookup table exists for generate_configs), then optimises each.

Usage:  env/bin/python games/lumen/run_modes.py mode1,mode2[,...]
"""
import sys, os
_GAME_DIR = os.path.join(os.getcwd(), "games", "lumen")
for _p in (_GAME_DIR, os.getcwd()):
    if _p not in sys.path:
        sys.path.insert(0, _p)
from gamestate import GameState
from game_config import GameConfig
from game_optimization import OptimizationSetup
from optimization_program.run_script import OptimizationExecution
from src.state.run_sims import create_books
from src.write_data.write_configs import generate_configs

if __name__ == "__main__":
    modes = sys.argv[1].split(",")
    nsims = int(sys.argv[2]) if len(sys.argv) > 2 else 100_000
    config = GameConfig(); gamestate = GameState(config); OptimizationSetup(config)
    print(f"== building {modes} @ {nsims} sims ==", flush=True)
    create_books(gamestate, config, {m: nsims for m in modes}, 5000, 10, True, False)
    generate_configs(gamestate)
    OptimizationExecution().run_all_modes(config, modes, 20)
    generate_configs(gamestate)
    print("== DONE ==", flush=True)
