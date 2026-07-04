# File: game_config.py
# Game: Lumen by We Roll Spinners
# Purpose: Complete static game configuration for LUMEN, a four-mode release
#          built on the GLOW METER free-spin engine. Grid, paytable, symbol
#          tiers, reel definitions, win mechanics, free-spin triggers, and the
#          four bet modes (surface, deepdive, bloom, abyssalbloom). Optimiser
#          parameters live in game_optimization.py.
#
# THEME
# -----
# Lumen is a deep-ocean bioluminescence skin. The symbol IDs and reels are
# carried over verbatim from the validated Future Spinner ways engine (H1..L3,
# W, S) so the mathematics is proven; the theme is presentation only. The low
# symbol L3 is the "glow orb" that feeds the signature Glow Meter.
#
# FEATURE: GLOW METER FREE SPINS
# ------------------------------
# * Trigger: 3, 4 or 5 scatters in the base game award 8, 12 or 16 free spins
#   AND still pay the instant scatter award of 1x, 3x or 10x total bet.
# * Glow Meter: the free-spin round starts at multiplier 1x. After every free
#   spin the meter rises from TWO sources, applied from the NEXT spin onward
#   (never retroactive):
#       (a) +1x if the spin won anything (the Overdrive behaviour), PLUS
#       (b) +N where N = the number of L3 "glow orb" symbols on that free-spin
#           board (L3 still pays as a normal L3 too).
#   The meter applies to all subsequent free-spin wins (ways wins and scatter
#   pays alike). It never resets during the round and is not retroactive. The
#   base game meter is always 1x.
# * Retrigger: 3 or more scatters during free spins award +5 free spins and pay
#   their instant scatter award multiplied by the current meter.
# * Win cap: 10,000x total per round, hard, all modes.
# * The whole feature resolves inside ONE stateless book round (meter set to 1
#   in reset_book, never reset mid-round).
#
# RTP BUDGET (target 96.3500% every mode; final split reported in README)
# -----------------------------------------------------------------------
# All four modes target 96.35% RTP. The fence splits mirror the validated
# Future Spinner package (surface = base fences, deepdive = ante/double-chance
# fences, bloom = bonus-buy fences, abyssalbloom = super-buy rich-entry fences),
# with every wincap fence retargeted to the 10,000x cap.

import os
from src.config.config import Config
from src.config.distributions import Distribution
from src.config.betmode import BetMode


_BASE_RTP = 0.9635    # Shared RTP target across all four bet modes
_WINCAP = 10000.0     # Maximum payout multiplier (x bet amount), hard cap all modes


class GameConfig(Config):
    """
    Complete static configuration for Lumen (Glow Meter Free Spins).

    Grid topology
    -------------
    5 reels x 4 rows = 20 symbol positions. Ways-to-win: 4^5 = 1,024.

    Symbol tiers (10 symbols total, carried from the proven ways engine)
    -------------------------------------------------------------------
    Ultra-Premium : H1  Anglerfish
    Premium       : H2  Nautilus
    Mid-High      : M1  Jellyfish  |  M2  Manta Ray
    Mid           : M3  Seahorse   |  L1  Coral
    Low           : L2  Kelp       |  L3  Glow Orb (feeds the Glow Meter)
    Special       : W  Wild (substitutes, no independent pay)
                    S  Scatter (instant pay + free-spin trigger)

    Design targets
    --------------
    RTP        : 96.3500% (all four modes)
    Max win    : 10,000x bet
    Grid       : 5x4, 1,024 ways
    """

    _instance = None  # Singleton holder

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        super().__init__()

        # -- Identity ----------------------------------------------------------
        self.game_id = "lumen"
        self.provider_name = "We Roll Spinners"
        self.game_name = "Lumen"
        self.working_name = "Lumen"
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

        # -- Paytable (UNCHANGED from the validated ways engine) ---------------
        # Format: {(match_count, symbol_id): payout_per_way}. Final ways win =
        # paytable_value x ways_count x bet, then x the Glow Meter during free
        # spins. Wild (W) is a pure substitute (no paytable entry); Scatter (S)
        # pays via scatter_multiplier_table.
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
        # No per-symbol multiplier wilds: the Glow Meter is a game-level (global)
        # multiplier applied via the "global" ways strategy.
        self.special_symbols = {
            "wild": ["W"],
            "scatter": ["S"],
            "multiplier": [],
        }

        # -- Scatter multiplier table (instant pays, UNCHANGED) ----------------
        # Awards are multiples of TOTAL BET, paid on the spin the scatters land.
        # During free spins these are multiplied by the current Glow Meter.
        self.scatter_multiplier_table = {
            3: 1.0,   # 3 scatters -> 1x total bet
            4: 3.0,   # 4 scatters -> 3x total bet
            5: 10.0,  # 5 scatters -> 10x total bet
        }

        # -- Free-spin triggers ------------------------------------------------
        # basegame: 3/4/5 scatters award 8/12/16 free spins. free-spin draws are
        # natural and scatters can stack (6+ on a 5x4 grid), so every count from
        # 3 up to the 20-cell maximum is mapped (6+ awards the 5-scatter amount).
        # freegame retrigger is a flat +5 for any 3+ scatters. The minimum key
        # (3) is also the resample threshold used by draw_board() for non-forced
        # base criteria, preventing accidental triggers there.
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
        # FR0    : free-game strip (currently identical to BR0).
        # BRWCAP : H1/Wild heavy wincap strip (base trigger draw).
        # FRWCAP : H1/Wild heavy wincap strip used inside free spins so a forced
        #          wincap round can reach exactly 10,000x with the Glow Meter.
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
        _reels_std = {
            self.basegame_type: {"BR0": 1},
            self.freegame_type: {"FR0": 1},
        }
        # Wincap: force the trigger on BR0, then rack up 10,000x inside free
        # spins on the H1/Wild heavy FRWCAP strip.
        _wincap_strip_fg = "FRWCAP" if "FRWCAP" in self.reels else "FR0"
        _reels_wincap = {
            self.basegame_type: {"BR0": 1},
            self.freegame_type: {_wincap_strip_fg: 1},
        }

        # -- Surface-mode conditions (base profile, cost 1.0x) ----------------
        wincap_condition = {
            "reel_weights": _reels_wincap,
            "force_wincap": True,
            "force_freegame": True,
            "scatter_triggers": {3: 60, 4: 30, 5: 10},
        }
        freegame_base_condition = {
            "reel_weights": _reels_std,
            "force_wincap": False,
            "force_freegame": True,
            "scatter_triggers": {3: 75, 4: 20, 5: 5},
        }
        zerowin_condition = {
            "reel_weights": _reels_std,
            "force_wincap": False,
            "force_freegame": False,
        }
        basegame_condition = {
            "reel_weights": _reels_std,
            "force_wincap": False,
            "force_freegame": False,
        }

        # -- Deepdive-mode conditions (ante / double-chance, cost 1.5x) --------
        # Same reels, same feature, same 10,000x cap as surface; ~2x the trigger
        # rate. The ante funds a heavier free-game fence, so ordinary base ways
        # wins are lighter (authentic ante profile).
        freegame_ante_condition = {
            "reel_weights": _reels_std,
            "force_wincap": False,
            "force_freegame": True,
            "scatter_triggers": {3: 75, 4: 20, 5: 5},
        }
        wincap_ante_condition = {
            "reel_weights": _reels_wincap,
            "force_wincap": True,
            "force_freegame": True,
            "scatter_triggers": {3: 60, 4: 30, 5: 10},
        }

        # -- Bloom-mode conditions (bonus buy, cost 100.0x) -------------------
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

        # -- Abyssalbloom-mode conditions (super buy, richest entry, 300.0x) --
        freegame_super_condition = {
            "reel_weights": _reels_std, "force_wincap": False, "force_freegame": True,
            "scatter_triggers": {3: 5, 4: 25, 5: 70},
        }
        wincap_super_condition = {
            "reel_weights": _reels_wincap, "force_wincap": True, "force_freegame": True,
            "scatter_triggers": {3: 5, 4: 25, 5: 70},
        }

        _maxwin = int(_WINCAP)

        # -- Bet modes ---------------------------------------------------------
        self.bet_modes = [
            # SURFACE MODE (base profile, cost 1.0x) --------------------------
            BetMode(
                name="surface",
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
            # DEEPDIVE MODE (ante / double-chance, cost 1.5x) -----------------
            BetMode(
                name="deepdive",
                cost=1.5,
                rtp=self.rtp,
                max_win=_maxwin,
                auto_close_disabled=False,
                is_feature=True,
                is_buybonus=False,
                distributions=[
                    Distribution(
                        criteria="wincap",
                        quota=0.003,
                        win_criteria=float(_maxwin),
                        conditions=wincap_ante_condition,
                    ),
                    Distribution(
                        criteria="freegame",
                        quota=0.30,
                        conditions=freegame_ante_condition,
                    ),
                    Distribution(
                        criteria="0",
                        quota=0.25,
                        win_criteria=0.0,
                        conditions=zerowin_condition,
                    ),
                    Distribution(
                        criteria="basegame",
                        quota=0.447,
                        conditions=basegame_condition,
                    ),
                ],
            ),
            # BLOOM MODE (bonus buy, cost 100.0x) -----------------------------
            BetMode(
                name="bloom",
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
            # ABYSSALBLOOM MODE (super buy, richest entry, cost 300.0x) -------
            BetMode(
                name="abyssalbloom",
                cost=300.0,
                rtp=self.rtp,
                max_win=_maxwin,
                auto_close_disabled=False,
                is_feature=False,
                is_buybonus=True,
                distributions=[
                    Distribution(
                        criteria="wincap",
                        quota=0.02,
                        win_criteria=float(_maxwin),
                        conditions=wincap_super_condition,
                    ),
                    Distribution(
                        criteria="freegame",
                        quota=0.98,
                        conditions=freegame_super_condition,
                    ),
                ],
            ),
        ]
