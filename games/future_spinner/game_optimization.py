"""Optimisation setup for Future Spinner (Overdrive Free Spins, two modes).

Amends game_config.opt_params, consumed by generate_configs to write the
math_config.json the Rust optimiser reads. Fence RTPs must sum to the mode RTP
(0.9635), which verify_optimization_input enforces.

Base mode (cost 1.0x):
    wincap    rtp 0.0500  av_win 5000       search = exact 5000x
    0         rtp 0.0000  av_win 0          search = exact 0
    freegame  rtp 0.3800  hr 185            search = {"symbol": "scatter"}
    basegame  rtp 0.5335  hr 3.5
    -> 0.9635. freegame hr 185 sets the ~1-in-185 trigger rate; its av_win
       (rtp x hr = 70.3x) is what the optimiser targets across the free-spin
       pool, which spans small outcomes to the 5,000x cap via the Overdrive
       meter.

Bonus mode (cost 100.0x, guaranteed trigger):
    wincap    rtp 0.0500  av_win 5000
    freegame  rtp 0.9135  hr "x"  (always-on criteria)
    -> 0.9635. Average bonus outcome ~96.35x, i.e. RTP 96.35% at the 100x price.
"""

from optimization_program.optimization_config import (
    ConstructScaling,
    ConstructParameters,
    ConstructConditions,
    ConstructFenceBias,
    verify_optimization_input,
)


class OptimizationSetup:
    """Game specific optimisation setup for the two-mode package."""

    def __init__(self, game_config):
        self.game_config = game_config
        wincaps = {bm.get_name(): bm.get_wincap() for bm in game_config.bet_modes}

        self.game_config.opt_params = {
            "base": {
                "conditions": {
                    "wincap": ConstructConditions(
                        rtp=0.05, av_win=wincaps["base"], search_conditions=wincaps["base"]
                    ).return_dict(),
                    "0": ConstructConditions(
                        rtp=0.0, av_win=0, search_conditions=0
                    ).return_dict(),
                    "freegame": ConstructConditions(
                        rtp=0.38, hr=185, search_conditions={"symbol": "scatter"}
                    ).return_dict(),
                    "basegame": ConstructConditions(rtp=0.5335, hr=3.5).return_dict(),
                },
                "scaling": ConstructScaling(
                    [
                        {"criteria": "basegame", "scale_factor": 1.2,
                         "win_range": (1, 5), "probability": 1.0},
                        {"criteria": "basegame", "scale_factor": 1.5,
                         "win_range": (10, 30), "probability": 1.0},
                        {"criteria": "freegame", "scale_factor": 1.2,
                         "win_range": (20, 80), "probability": 1.0},
                        {"criteria": "freegame", "scale_factor": 0.8,
                         "win_range": (1000, 4000), "probability": 1.0},
                    ]
                ).return_dict(),
                "parameters": ConstructParameters(
                    num_show=5000,
                    num_per_fence=10000,
                    min_m2m=4,
                    max_m2m=8,
                    pmb_rtp=1.0,
                    sim_trials=5000,
                    test_spins=[50, 100, 200],
                    test_weights=[0.3, 0.4, 0.3],
                    score_type="rtp",
                ).return_dict(),
                "distribution_bias": ConstructFenceBias(
                    applied_criteria=["basegame"],
                    bias_ranges=[(1.0, 5.0)],
                    bias_weights=[0.4],
                ).return_dict(),
            },
            "bonus": {
                "conditions": {
                    "wincap": ConstructConditions(
                        rtp=0.05, av_win=wincaps["bonus"], search_conditions=wincaps["bonus"]
                    ).return_dict(),
                    "freegame": ConstructConditions(rtp=0.9135, hr="x").return_dict(),
                },
                "scaling": ConstructScaling(
                    [
                        {"criteria": "freegame", "scale_factor": 1.1,
                         "win_range": (20, 100), "probability": 1.0},
                        {"criteria": "freegame", "scale_factor": 0.8,
                         "win_range": (1000, 4000), "probability": 1.0},
                    ]
                ).return_dict(),
                "parameters": ConstructParameters(
                    num_show=5000,
                    num_per_fence=10000,
                    min_m2m=4,
                    max_m2m=8,
                    pmb_rtp=1.0,
                    sim_trials=5000,
                    test_spins=[10, 20, 50],
                    test_weights=[0.6, 0.2, 0.2],
                    score_type="rtp",
                ).return_dict(),
            },
        }

        verify_optimization_input(self.game_config, self.game_config.opt_params)
