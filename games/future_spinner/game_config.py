# File: game_config.py
# Game: Future Spinner by We Roll Spinners
# Purpose: Complete static game configuration for the two-mode OVERDRIVE FREE
#          SPINS release. Grid, paytable, symbol tiers, reel definitions, win
#          mechanics, free-spin triggers, and the two bet modes (base + bonus
#          buy). Optimiser parameters live in game_optimization.py.
#
# FEATURE: OVERDRIVE FREE SPINS
# -----------------------------
# * Trigger: 3, 4 or 5 scatters in the base game award 8, 12 or 16 free spins
#   AND still pay the instant scatter award of 1x, 3x or 10x total bet.
# * Overdrive meter: the bonus starts at multiplier 1x. After every WINNING free
#   spin the multiplier increases by +1x and applies to all subsequent free-spin
#   wins (ways wins and scatter pays alike). It never resets during the bonus and
#   is not retroactive. No cap beyond the round win cap.
# * Retrigger: 3 or more scatters during free spins award +5 free spins and pay
#   their instant scatter award multiplied by the current Overdrive multiplier.
# * Bonus buy: second bet mode "bonus", cost 100.0x, guarantees a 3+ scatter
#   trigger spin.
# * Win cap: 5,000x total per round, hard, both modes.
# * The whole feature resolves inside ONE stateless book round.
#
# RTP BUDGET (target 96.3500% both modes; final split reported in the PAR sheet)
# -----------------------------------------------------------------------------
# BASE MODE (cost 1.0x): the freegame fence bundles the instant scatter pays
#   (~0.04) and the free-spin winnings (~0.34) because both occur in the same
#   forced-trigger rounds.
#   wincap    0.0500   maximum-win rounds (free spins reaching 5,000x)
#   freegame  0.3800   instant scatter pays + free-spin winnings
#   basegame  0.5335   base ways-to-win outcomes
#   0         0.0000   zero-win spins
#   TOTAL     0.9635
# BONUS MODE (cost 100.0x): guaranteed trigger.
#   wincap    0.0500
#   freegame  0.9135
#   TOTAL     0.9635
#
# TRIGGER RATE: free spins are designed to trigger roughly once per 150 to 220
#   base spins. Base criteria "0" and "basegame" use force_freegame=False, and
#   draw_board() resamples any board holding 3+ scatters (the minimum
#   freespin_triggers key), so accidental triggers never occur there. Every
#   trigger comes from the forced "freegame"/"wincap" criteria, giving precise
#   control of the trigger rate through the freegame fence hit-rate.

import os
from src.config.config import Config
from src.config.distributions import Distribution
from src.config.betmode import BetMode


_BASE_RTP = 0.9635   # Shared RTP target across both bet modes
_WINCAP = 5000.0     # Maximum payout multiplier (x bet amount), hard cap both modes


class GameConfig(Config):
    """
    Complete static configuration for Future Spinner (Overdrive Free Spins).

    Grid topology
    -------------
    5 reels x 4 rows = 20 symbol positions. Ways-to-win: 4^5 = 1,024.

    Symbol tiers (10 symbols total)
    -------------------------------
    Ultra-Premium : H1  Spinning Rim
    Premium       : H2  Turbocharger
    Mid-High      : M1  Car Grille  |  M2  Exhaust Pipe
    Mid           : M3  Steering Wheel  |  L1  Lug Nut
    Low           : L2  Spark Plug  |  L3  Piston
    Special       : W  Wild (substitutes, no independent pay)
                    S  Scatter (instant pay + free-spin trigger)

    Design targets
    --------------
    RTP        : 96.3500% (both modes)
    Volatility : Medium-High
    Max win    : 5,000x bet
    Min bet    : 0.10
    Max bet    : 100.00
    """

    _instance = None  # Singleton holder

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        super().__init__()

        # -- Identity ----------------------------------------------------------
        self.game_id = "future_spinner"
        self.provider_name = "We Roll Spinners"
        self.game_name = "Future Spinner"
        self.working_name = "Future Spinner"
        self.provider_number = 0

        # -- Core math parameters ----------------------------------------------
        self.rtp = _BASE_RTP
        self.wincap = _WINCAP
        self.win_type = "ways"

        # -- Denomination ------------------------------------------------------
        self.min_denomination = 0.10
        self.bet_levels = [0.10, 0.20, 0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00]

        self.construct_paths()

        # -- Grid dimensions ---------------------------------------------------
        self.num_reels = 5
        self.num_rows = [4] * self.num_reels

        # -- Paytable (UNCHANGED from the validated base package) --------------
        # Format: {(match_count, symbol_id): payout_per_way}. Final ways win =
        # paytable_value x ways_count x bet, then x the Overdrive multiplier
        # during free spins. Wild (W) is a pure substitute (no paytable entry);
        # Scatter (S) pays via scatter_multiplier_table.
        self.paytable = {
            (5, "H1"): 22.0, (4, "H1"): 6.0, (3, "H1"): 1.5,
            (5, "H2"): 10.0, (4, "H2"): 3.0, (3, "H2"): 0.8,
            (5, "M1"): 5.0,  (4, "M1"): 1.5, (3, "M1"): 0.45,
            (5, "M2"): 4.0,  (4, "M2"): 1.0, (3, "M2"): 0.3,
            (5, "M3"): 2.0,  (4, "M3"): 0.6, (3, "M3"): 0.2,
            (5, "L1"): 1.5,  (4, "L1"): 0.45, (3, "L1"): 0.15,
            (5, "L2"): 0.8,  (4, "L2"): 0.25, (3, "L2"): 0.10,
            (5, "L3"): 0.65, (4, "L3"): 0.20, (3, "L3"): 0.08,
        }

        # -- Special symbols ---------------------------------------------------
        # No symbol-multiplier wilds: the Overdrive multiplier is a game-level
        # (global) multiplier applied via the "global" ways strategy.
        self.special_symbols = {
            "wild": ["W"],
            "scatter": ["S"],
            "multiplier": [],
        }

        # -- Scatter multiplier table (instant pays, UNCHANGED) ----------------
        # Awards are multiples of TOTAL BET, paid on the spin the scatters land.
        # During free spins these are multiplied by the current Overdrive meter.
        self.scatter_multiplier_table = {
            3: 1.0,   # 3 scatters -> 1x total bet
            4: 3.0,   # 4 scatters -> 3x total bet
            5: 10.0,  # 5 scatters -> 10x total bet
        }

        # -- Free-spin triggers ------------------------------------------------
        # basegame: 3/4/5 scatters award 8/12/16 free spins. The base trigger is
        # forced to exactly 3/4/5 distinct-reel scatters, but free-spin draws are
        # natural and scatters can stack, giving 6+ on a 5x4 grid, so every count
        # from 3 up to the 20-cell maximum is mapped (6+ awards the 5-scatter
        # amount). freegame retrigger is a flat +5 for any 3+ scatters.
        # The minimum key (3) is also the resample threshold used by draw_board()
        # for non-forced base criteria, preventing accidental triggers there.
        _MAX_SCATTERS = self.num_reels * max(self.num_rows)  # 5 x 4 = 20
        _base_award = {3: 8, 4: 12, 5: 16}
        self.freespin_triggers = {
            self.basegame_type: {
                n: _base_award.get(n, 16) for n in range(3, _MAX_SCATTERS + 1)
            },
            self.freegame_type: {n: 5 for n in range(3, _MAX_SCATTERS + 1)},
        }

        # anticipation on the final reel when a trigger is one scatter away.
        self.anticipation_triggers = {
            self.basegame_type: 3,
            self.freegame_type: 3,
        }

        # -- Padding -----------------------------------------------------------
        self.include_padding = True

        # -- Reel strips -------------------------------------------------------
        # BR0    : base-game strip.
        # FR0    : free-game strip (currently identical to BR0; kept separate so
        #          the free game can be tuned independently later).
        # BRWCAP : H1/Wild heavy wincap strip (base trigger draw).
        # FRWCAP : H1/Wild heavy wincap strip used inside free spins so a forced
        #          wincap round can reach exactly 5,000x with the Overdrive meter.
        _reel_files = {
            "BR0": "BR0.csv",
            "FR0": "FR0.csv",
            "BRWCAP": "BRWCAP.csv",
            "FRWCAP": "FRWCAP.csv",
        }
        self.reels = {}
        for reel_id, filename in _reel_files.items():
            reel_path = os.path.join(self.reels_path, filename)
            if os.path.exists(reel_path):
                self.reels[reel_id] = self.read_reels_csv(reel_path)

        # -- Padding reels (required by make_fe_config) ------------------------
        self.padding_reels = {}
        if "BR0" in self.reels:
            self.padding_reels[self.basegame_type] = self.reels["BR0"]
            self.padding_reels[self.freegame_type] = self.reels.get("FR0", self.reels["BR0"])

        # -- Reel weight helpers ----------------------------------------------
        # Every condition supplies reel weights for BOTH gametypes: the base
        # reveal uses basegame_type, the free spins use freegame_type.
        _reels_std = {
            self.basegame_type: {"BR0": 1},
            self.freegame_type: {"FR0": 1},
        }
        # Wincap: force the trigger on BR0, then rack up 5,000x inside free spins
        # on the H1/Wild heavy FRWCAP strip.
        _wincap_strip_fg = "FRWCAP" if "FRWCAP" in self.reels else "FR0"
        _reels_wincap = {
            self.basegame_type: {"BR0": 1},
            self.freegame_type: {_wincap_strip_fg: 1},
        }

        # -- Base-mode conditions ---------------------------------------------
        # wincap: forces a trigger and drives free spins to the 5,000x cap.
        wincap_condition = {
            "reel_weights": _reels_wincap,
            "force_wincap": True,
            "force_freegame": True,
            "scatter_triggers": {3: 60, 4: 30, 5: 10},
        }
        # freegame: the standard free-spin trigger. scatter_triggers weight the
        # 3/4/5 entry distribution (8/12/16 spins). Instant pay + free spins.
        freegame_base_condition = {
            "reel_weights": _reels_std,
            "force_wincap": False,
            "force_freegame": True,
            "scatter_triggers": {3: 75, 4: 20, 5: 5},
        }
        # 0: zero-win base spins. force_freegame=False -> draw_board resamples any
        # board with 3+ scatters, so no accidental trigger.
        zerowin_condition = {
            "reel_weights": _reels_std,
            "force_wincap": False,
            "force_freegame": False,
        }
        # basegame: ordinary ways outcomes, no forced trigger.
        basegame_condition = {
            "reel_weights": _reels_std,
            "force_wincap": False,
            "force_freegame": False,
        }

        # -- Bonus-mode conditions --------------------------------------------
        # Guaranteed trigger, weighted toward higher scatter counts to justify
        # the 100x buy price. wincap variant drives the cap in-bonus.
        freegame_bonus_condition = {
            "reel_weights": _reels_std,
            "force_wincap": False,
            "force_freegame": True,
            "scatter_triggers": {3: 55, 4: 30, 5: 15},
        }
        wincap_bonus_condition = {
            "reel_weights": _reels_wincap,
            "force_wincap": True,
            "force_freegame": True,
            "scatter_triggers": {3: 50, 4: 30, 5: 20},
        }

        _maxwin = int(_WINCAP)

        # -- Bet modes ---------------------------------------------------------
        self.bet_modes = [
            # BASE MODE (cost 1.0x) -------------------------------------------
            BetMode(
                name="base",
                cost=1.0,
                rtp=self.rtp,
                max_win=_maxwin,
                auto_close_disabled=False,
                is_feature=True,
                is_buybonus=False,
                distributions=[
                    Distribution(
                        criteria="wincap",
                        quota=0.002,
                        win_criteria=float(_maxwin),
                        conditions=wincap_condition,
                    ),
                    Distribution(
                        criteria="freegame",
                        quota=0.15,
                        conditions=freegame_base_condition,
                    ),
                    Distribution(
                        criteria="0",
                        quota=0.36,
                        win_criteria=0.0,
                        conditions=zerowin_condition,
                    ),
                    Distribution(
                        criteria="basegame",
                        quota=0.488,
                        conditions=basegame_condition,
                    ),
                ],
            ),
            # BONUS MODE / BUY (cost 100.0x) ----------------------------------
            BetMode(
                name="bonus",
                cost=100.0,
                rtp=self.rtp,
                max_win=_maxwin,
                auto_close_disabled=False,
                is_feature=False,
                is_buybonus=True,
                distributions=[
                    Distribution(
                        criteria="wincap",
                        quota=0.004,
                        win_criteria=float(_maxwin),
                        conditions=wincap_bonus_condition,
                    ),
                    Distribution(
                        criteria="freegame",
                        quota=0.996,
                        conditions=freegame_bonus_condition,
                    ),
                ],
            ),
        ]
