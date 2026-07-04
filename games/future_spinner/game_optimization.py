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
            "cruise": {
                # Low-volatility (cost 1.0x, same 96.35% RTP as base): most of the
                # return sits in a frequent base-ways fence (hr 2.3 ~ 43% hit rate),
                # the feature is rarer (hr 260) and the 5,000x tail is thinner
                # (wincap rtp 0.02 vs base 0.05). Small-win dresses + a low
                # mean-to-median band tighten the distribution. Fences sum to 0.9635.
                "conditions": {
                    "wincap": ConstructConditions(
                        rtp=0.02, av_win=wincaps["cruise"], search_conditions=wincaps["cruise"]
                    ).return_dict(),
                    "0": ConstructConditions(
                        rtp=0.0, av_win=0, search_conditions=0
                    ).return_dict(),
                    "freegame": ConstructConditions(
                        rtp=0.18, hr=260, search_conditions={"symbol": "scatter"}
                    ).return_dict(),
                    "basegame": ConstructConditions(rtp=0.7635, hr=2.3).return_dict(),
                },
                "scaling": ConstructScaling(
                    [
                        {"criteria": "basegame", "scale_factor": 1.4,
                         "win_range": (0.5, 3), "probability": 1.0},
                        {"criteria": "basegame", "scale_factor": 1.2,
                         "win_range": (3, 8), "probability": 1.0},
                        {"criteria": "freegame", "scale_factor": 0.7,
                         "win_range": (200, 4000), "probability": 1.0},
                    ]
                ).return_dict(),
                "parameters": ConstructParameters(
                    num_show=5000,
                    num_per_fence=10000,
                    min_m2m=2,
                    max_m2m=4,
                    pmb_rtp=1.0,
                    sim_trials=5000,
                    test_spins=[50, 100, 200],
                    test_weights=[0.3, 0.4, 0.3],
                    score_type="rtp",
                ).return_dict(),
                "distribution_bias": ConstructFenceBias(
                    applied_criteria=["basegame"],
                    bias_ranges=[(0.5, 3.0)],
                    bias_weights=[0.5],
                ).return_dict(),
            },
            "ante": {
                # Double-Chance (cost 1.5x): identical free-spin outcome to base
                # (av_win = 0.76 x 92.5 = 70.3, same as base 0.38 x 185) but at
                # ~twice the trigger rate (hr 92.5 vs 185). The heavier freegame
                # fence is funded by a lighter basegame fence. Fences sum to 0.9635.
                "conditions": {
                    "wincap": ConstructConditions(
                        rtp=0.05, av_win=wincaps["ante"], search_conditions=wincaps["ante"]
                    ).return_dict(),
                    "0": ConstructConditions(
                        rtp=0.0, av_win=0, search_conditions=0
                    ).return_dict(),
                    "freegame": ConstructConditions(
                        rtp=0.76, hr=92.5, search_conditions={"symbol": "scatter"}
                    ).return_dict(),
                    "basegame": ConstructConditions(rtp=0.1535, hr=3.5).return_dict(),
                },
                "scaling": ConstructScaling(
                    [
                        {"criteria": "basegame", "scale_factor": 1.2,
                         "win_range": (1, 5), "probability": 1.0},
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
            "volatile": {
                # High volatility (cost 1.0x, same 96.35% RTP): more return in the
                # rare feature + a fatter 5,000x tail (wincap 0.10), fewer base wins.
                "conditions": {
                    "wincap": ConstructConditions(
                        rtp=0.10, av_win=wincaps["volatile"], search_conditions=wincaps["volatile"]
                    ).return_dict(),
                    "0": ConstructConditions(rtp=0.0, av_win=0, search_conditions=0).return_dict(),
                    "freegame": ConstructConditions(
                        rtp=0.55, hr=185, search_conditions={"symbol": "scatter"}
                    ).return_dict(),
                    "basegame": ConstructConditions(rtp=0.3135, hr=3.5).return_dict(),
                },
                "scaling": ConstructScaling(
                    [
                        {"criteria": "basegame", "scale_factor": 0.8,
                         "win_range": (0.5, 3), "probability": 1.0},
                        {"criteria": "freegame", "scale_factor": 1.3,
                         "win_range": (500, 4000), "probability": 1.0},
                    ]
                ).return_dict(),
                "parameters": ConstructParameters(
                    num_show=5000, num_per_fence=10000, min_m2m=6, max_m2m=14,
                    pmb_rtp=1.0, sim_trials=5000, test_spins=[50, 100, 200],
                    test_weights=[0.3, 0.4, 0.3], score_type="rtp",
                ).return_dict(),
            },
            "antelite": {
                # Market-centre ante (cost 1.25x, ~1.6x trigger, hr 115).
                "conditions": {
                    "wincap": ConstructConditions(
                        rtp=0.05, av_win=wincaps["antelite"], search_conditions=wincaps["antelite"]
                    ).return_dict(),
                    "0": ConstructConditions(rtp=0.0, av_win=0, search_conditions=0).return_dict(),
                    "freegame": ConstructConditions(
                        rtp=0.608, hr=115, search_conditions={"symbol": "scatter"}
                    ).return_dict(),
                    "basegame": ConstructConditions(rtp=0.3055, hr=3.5).return_dict(),
                },
                "scaling": ConstructScaling(
                    [
                        {"criteria": "basegame", "scale_factor": 1.2,
                         "win_range": (1, 5), "probability": 1.0},
                        {"criteria": "freegame", "scale_factor": 1.2,
                         "win_range": (20, 80), "probability": 1.0},
                    ]
                ).return_dict(),
                "parameters": ConstructParameters(
                    num_show=5000, num_per_fence=10000, min_m2m=4, max_m2m=8,
                    pmb_rtp=1.0, sim_trials=5000, test_spins=[50, 100, 200],
                    test_weights=[0.3, 0.4, 0.3], score_type="rtp",
                ).return_dict(),
            },
            "superante": {
                # Heavy ante (cost 2.0x, ~3x trigger, hr 62): feature more frequent
                # and a touch smaller, funded by a lighter base game.
                "conditions": {
                    "wincap": ConstructConditions(
                        rtp=0.05, av_win=wincaps["superante"], search_conditions=wincaps["superante"]
                    ).return_dict(),
                    "0": ConstructConditions(rtp=0.0, av_win=0, search_conditions=0).return_dict(),
                    "freegame": ConstructConditions(
                        rtp=0.80, hr=62, search_conditions={"symbol": "scatter"}
                    ).return_dict(),
                    "basegame": ConstructConditions(rtp=0.1135, hr=3.5).return_dict(),
                },
                "scaling": ConstructScaling(
                    [
                        {"criteria": "freegame", "scale_factor": 1.2,
                         "win_range": (10, 60), "probability": 1.0},
                    ]
                ).return_dict(),
                "parameters": ConstructParameters(
                    num_show=5000, num_per_fence=10000, min_m2m=4, max_m2m=8,
                    pmb_rtp=1.0, sim_trials=5000, test_spins=[30, 60, 120],
                    test_weights=[0.4, 0.4, 0.2], score_type="rtp",
                ).return_dict(),
            },
            "minibuy": {
                # Cheapest guaranteed feature (3-scatter weighted), honest floor 80x.
                "conditions": {
                    "wincap": ConstructConditions(
                        rtp=0.05, av_win=wincaps["minibuy"], search_conditions=wincaps["minibuy"]
                    ).return_dict(),
                    "freegame": ConstructConditions(rtp=0.9135, hr="x").return_dict(),
                },
                "scaling": ConstructScaling(
                    [
                        {"criteria": "freegame", "scale_factor": 1.1,
                         "win_range": (10, 60), "probability": 1.0},
                        {"criteria": "freegame", "scale_factor": 0.8,
                         "win_range": (1000, 4000), "probability": 1.0},
                    ]
                ).return_dict(),
                "parameters": ConstructParameters(
                    num_show=5000, num_per_fence=10000, min_m2m=4, max_m2m=8,
                    pmb_rtp=1.0, sim_trials=5000, test_spins=[10, 20, 50],
                    test_weights=[0.6, 0.2, 0.2], score_type="rtp",
                ).return_dict(),
            },
            "superbuy": {
                # Richest guaranteed feature (4/5-scatter weighted), 300x.
                "conditions": {
                    "wincap": ConstructConditions(
                        rtp=0.05, av_win=wincaps["superbuy"], search_conditions=wincaps["superbuy"]
                    ).return_dict(),
                    "freegame": ConstructConditions(rtp=0.9135, hr="x").return_dict(),
                },
                "scaling": ConstructScaling(
                    [{"criteria": "freegame", "scale_factor": 1.1,
                      "win_range": (100, 500), "probability": 1.0}]
                ).return_dict(),
                "parameters": ConstructParameters(
                    num_show=5000, num_per_fence=10000, min_m2m=4, max_m2m=10,
                    pmb_rtp=1.0, sim_trials=5000, test_spins=[10, 20, 50],
                    test_weights=[0.6, 0.2, 0.2], score_type="rtp",
                ).return_dict(),
            },
            "megabuy": {
                # 500x buy - maps the ceiling (tail gate loosens: cost>=500 scale 0.5).
                "conditions": {
                    "wincap": ConstructConditions(
                        rtp=0.05, av_win=wincaps["megabuy"], search_conditions=wincaps["megabuy"]
                    ).return_dict(),
                    "freegame": ConstructConditions(rtp=0.9135, hr="x").return_dict(),
                },
                "scaling": ConstructScaling(
                    [{"criteria": "freegame", "scale_factor": 1.1,
                      "win_range": (200, 1000), "probability": 1.0}]
                ).return_dict(),
                "parameters": ConstructParameters(
                    num_show=5000, num_per_fence=10000, min_m2m=4, max_m2m=12,
                    pmb_rtp=1.0, sim_trials=5000, test_spins=[10, 20, 50],
                    test_weights=[0.6, 0.2, 0.2], score_type="rtp",
                ).return_dict(),
            },
            "hyperbuy": {
                # 1000x buy - the top of the cost-multiplier range (tier-1 ceiling).
                "conditions": {
                    "wincap": ConstructConditions(
                        rtp=0.05, av_win=wincaps["hyperbuy"], search_conditions=wincaps["hyperbuy"]
                    ).return_dict(),
                    "freegame": ConstructConditions(rtp=0.9135, hr="x").return_dict(),
                },
                "scaling": ConstructScaling(
                    [{"criteria": "freegame", "scale_factor": 1.1,
                      "win_range": (400, 2000), "probability": 1.0}]
                ).return_dict(),
                "parameters": ConstructParameters(
                    num_show=5000, num_per_fence=10000, min_m2m=4, max_m2m=14,
                    pmb_rtp=1.0, sim_trials=5000, test_spins=[10, 20, 50],
                    test_weights=[0.6, 0.2, 0.2], score_type="rtp",
                ).return_dict(),
            },
        }

        verify_optimization_input(self.game_config, self.game_config.opt_params)
