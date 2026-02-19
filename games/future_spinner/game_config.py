# File: game_config.py
# Game: Future Spinner by We Roll Spinners
# Purpose: Complete static game configuration — grid, paytable, symbol tiers,
#          reel definitions, win mechanics, bet modes, distributions, and
#          optimizer parameters. This is the single source of truth for all
#          math inputs to the simulation pipeline.

import os
from src.config.config import Config
from src.config.distributions import Distribution
from src.config.betmode import BetMode


# ── RTP Budget Breakdown ──────────────────────────────────────────────────────
#
# Target RTP: 96.35% (0.9635)
#
# The RTP is split across four simulation criteria in the BASE mode and two
# in the BONUS (buy-bonus) mode. These fractions are initial design estimates
# used to seed the optimizer — they will be refined once reel strips are tuned.
#
# BASE MODE (cost = 1× bet):
#   ┌────────────────┬────────┬──────────────────────────────────────────────┐
#   │ Criteria       │  RTP   │ Description                                  │
#   ├────────────────┼────────┼──────────────────────────────────────────────┤
#   │ wincap         │ 0.0500 │ Rare maximum-win outcomes (≥5000×)           │
#   │ scatter        │ 0.2000 │ Spins with 3–5 scatter symbols (instant mult)│
#   │ 0              │ 0.0000 │ Zero-win spins (no payout to player)         │
#   │ basegame       │ 0.7135 │ All other winning outcomes (ways-to-win)     │
#   │ TOTAL          │ 0.9635 │                                              │
#   └────────────────┴────────┴──────────────────────────────────────────────┘
#
# BONUS MODE (cost = 100× bet, buy-bonus):
#   ┌────────────────┬────────┬──────────────────────────────────────────────┐
#   │ Criteria       │  RTP   │ Description                                  │
#   ├────────────────┼────────┼──────────────────────────────────────────────┤
#   │ wincap         │ 0.0500 │ Maximum-win outcomes                         │
#   │ scatter        │ 0.9135 │ Guaranteed scatter-multiplier spins          │
#   │ TOTAL          │ 0.9635 │                                              │
#   └────────────────┴────────┴──────────────────────────────────────────────┘
#
# VOLATILITY NOTE:
#   40% zero-win quota on base produces medium-high volatility.
#   Premium symbols (H1/H2) are sparse (weight 2–3/65) so 5-of-kind H1
#   wins are rare, but their 400× per-way value drives the tail. The wincap
#   at 5000× is achievable when H1 lands across multiple rows (≥13 ways).
# ─────────────────────────────────────────────────────────────────────────────

# ── Simulator Trigger Architecture for Stateless Scatter ─────────────────────
#
# Future Spinner has NO free-spin round. The scatter (S) awards an instant
# multiplier on the same spin it lands — it is "stateless". This conflicts
# with the SDK's standard freegame trigger flow. The workaround:
#
#   1. scatter distribution: force_freegame=True
#      draw_board() sees force_freegame=True and forces scatter symbols via
#      scatter_triggers weights. This guarantees 3/4/5 scatters on the board.
#
#   2. gamestate.py responsibility: after evaluate_scatter_multiplier() detects
#      scatters and awards the multiplier, it must set:
#        self.triggered_freegame = True
#      Without this, check_repeat() sees force_freegame=True and
#      triggered_freegame=False, treats the spin as failed, and retries forever.
#
#   3. basegame / wincap / 0 distributions: force_freegame=False
#      draw_board() draws freely. freespin_triggers threshold is set to 99
#      (unreachable on a 5×4 grid, max 5 scatters) so the SDK's while-loop
#      guard never fires. Scatters may still land naturally on these spins.
# ─────────────────────────────────────────────────────────────────────────────

_BASE_RTP  = 0.9635   # Shared RTP across both bet modes
_WINCAP    = 5000.0   # Maximum payout multiplier (× bet amount)


class GameConfig(Config):
    """
    Complete static configuration for Future Spinner.

    Grid topology
    ─────────────
    5 reels × 4 rows = 20 symbol positions
    Ways-to-win: 4^5 = 1,024 (any symbol in any row on consecutive reels,
    left-to-right, multiplied across all matching rows per reel)

    Symbol tiers (10 symbols total)
    ────────────────────────────────
    Ultra-Premium : H1  Spinning Rim
    Premium       : H2  Turbocharger
    Mid-High      : M1  Car Grille  |  M2  Exhaust Pipe
    Mid           : M3  Steering Wheel  |  L1  Lug Nut
    Low           : L2  Spark Plug  |  L3  Piston
    Special       : W   Wild (substitutes, no independent pay)
                    S   Scatter (instant multiplier, stateless)

    Design targets
    ──────────────
    RTP       : 96.35%
    Volatility: Medium-High
    Max win   : 5,000× bet
    Min bet   : 0.10
    Max bet   : 100.00
    """

    _instance = None  # Singleton holder

    def __new__(cls):
        """Enforce singleton — only one GameConfig instance exists per process."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        super().__init__()

        # ── Identity ──────────────────────────────────────────────────────────
        # game_id determines all output directory paths via construct_paths().
        # Must be a filesystem-safe string with no spaces.
        self.game_id        = "future_spinner"
        self.provider_name  = "We Roll Spinners"     # Required by make_fe_config()
        self.game_name      = "Future Spinner"        # Required by make_fe_config()
        self.working_name   = "Future Spinner"        # Human label in config.json
        self.provider_number = 0                      # Integer provider ID for RGS

        # ── Core Math Parameters ──────────────────────────────────────────────
        self.rtp     = _BASE_RTP   # 0.9635 — used by BetMode and optimizer assertions
        self.wincap  = _WINCAP     # 5,000× — payout ceiling enforced at runtime
        self.win_type = "ways"     # Informational; actual calc uses evaluate_ways_board()

        # ── Denomination ──────────────────────────────────────────────────────
        # min_denomination drives betDenomination and minDenomination in config.json:
        #   betDenomination  = int(0.10 × 100 × 100) = 1000 (internal currency units)
        #   minDenomination  = int(0.10 × 100)        =   10
        self.min_denomination = 0.10

        # Bet level ladder (frontend reference — not used directly by SDK math).
        # 10 levels from 0.10 to 100.00, reflecting typical operator requirement.
        self.bet_levels = [0.10, 0.20, 0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00]

        # ── Paths ─────────────────────────────────────────────────────────────
        # Must be called immediately after game_id is set. Creates:
        #   self.reels_path   → games/future_spinner/reels/
        #   self.library_path → games/future_spinner/library/
        #   self.publish_path → games/future_spinner/library/publish_files/
        self.construct_paths()

        # ── Grid Dimensions ───────────────────────────────────────────────────
        # 5 reels, each showing 4 rows → 4^5 = 1,024 ways.
        # num_rows is a per-reel list, enabling variable-row grids if needed later.
        self.num_reels = 5
        self.num_rows  = [4] * self.num_reels   # [4, 4, 4, 4, 4]

        # ── Paytable ──────────────────────────────────────────────────────────
        # Format: {(match_count: int, symbol_id: str): payout_per_way: float}
        #
        # Values are the multiplier of the bet PER MATCHING WAY. The final payout
        # for a winning spin is: paytable_value × ways_count × bet_amount.
        #
        # Example: H1 five-of-a-kind with 2 H1s per reel on all 5 reels:
        #   ways = 2×2×2×2×2 = 32; payout = 400 × 32 = 12,800× bet.
        #   Capped at wincap = 5,000× bet.
        #
        # Wild (W) is NOT in the paytable — it is a pure substitute symbol.
        # Scatter (S) is NOT in the paytable — it pays via scatter_multiplier_table.
        #
        # Symbol tier ordering (high → low) mirrors designer intent:
        #   higher paytable values for symbols with lower reel frequency.
        #
        # Frequency weights for reference (used when designing reel strips):
        #   H1=2, H2=3, M1=5, M2=6, M3=8, L1=10, L2=12, L3=14, W=3, S=2
        #   Total weight per reel position ≈ 65

        self.paytable = {
            # ── Tier 1: Ultra-Premium ─────────────────────────────────────────
            # H1 Spinning Rim — rarity weight 2/65 ≈ 3.1%; rarest pay symbol.
            # H1_5 = 22× per way: on BRWCAP strip (H1+W ~77% density per reel),
            # expected ways ≈ 277, producing wins well above the 5000× wincap.
            # On BR0 strip, H1+W ≈ 5/65 density → typical single-way H1 win = 22×.
            # Values are ~18× lower than the original design; raw pool RTP is now
            # calibrated to ~200-300% of target (needed for PigFarm optimizer
            # convergence). Original values were 18× too large, causing the
            # basegame-fence avg_win (2.5×) to be unreachable by the pool.
            (5, "H1"): 22.0,
            (4, "H1"):  6.0,
            (3, "H1"):  1.5,

            # ── Tier 2: Premium ───────────────────────────────────────────────
            (5, "H2"): 10.0,
            (4, "H2"):  3.0,
            (3, "H2"):  0.8,

            # ── Tier 3: Mid-High ─────────────────────────────────────────────
            (5, "M1"):  5.0,
            (4, "M1"):  1.5,
            (3, "M1"):  0.45,

            (5, "M2"):  4.0,
            (4, "M2"):  1.0,
            (3, "M2"):  0.3,

            # ── Tier 4: Mid ───────────────────────────────────────────────────
            (5, "M3"):  2.0,
            (4, "M3"):  0.6,
            (3, "M3"):  0.2,

            (5, "L1"):  1.5,
            (4, "L1"):  0.45,
            (3, "L1"):  0.15,

            # ── Tier 5: Low ───────────────────────────────────────────────────
            (5, "L2"):  0.8,
            (4, "L2"):  0.25,
            (3, "L2"):  0.10,

            (5, "L3"):  0.65,
            (4, "L3"):  0.20,
            (3, "L3"):  0.08,
        }

        # ── Special Symbols ───────────────────────────────────────────────────
        # The SDK tracks each key as a category of special symbol. The Board class
        # builds self.special_syms_on_board with one list per key.
        #
        # "wild"      : W substitutes for all paying symbols (H1/H2/M1-M3/L1-L3).
        #               Wild participation in ways is handled automatically by
        #               Ways.get_ways_data() — no paytable entry needed.
        #
        # "scatter"   : S triggers instant multiplier. Tracked separately so
        #               count_special_symbols("scatter") can be called in gamestate.
        #               NOT passed through ways calculation (pure scatter logic).
        #
        # "multiplier": Empty list — Future Spinner Wilds carry no multiplier
        #               attribute. Leaving this key present (with empty list)
        #               avoids potential KeyError in any SDK code that checks for it.
        self.special_symbols = {
            "wild":       ["W"],
            "scatter":    ["S"],
            "multiplier": [],       # No multiplier wilds in Future Spinner
        }

        # ── Scatter Multiplier Table ──────────────────────────────────────────
        # Custom config field consumed by GameState.evaluate_scatter_multiplier().
        # The scatter is STATELESS: the multiplier is applied immediately on the
        # spin where scatters land. No free-spin round is triggered.
        #
        # Awards are expressed as multiples of the TOTAL BET (not per-way).
        # They stack additively with any ways-to-win wins on the same spin.
        #
        # Design rationale:
        #   3 scatters: 5× total bet   — mild award, expected ~once per 2,000 spins
        #   4 scatters: 15× total bet  — solid award, expected ~once per 15,000 spins
        #   5 scatters: 50× total bet  — jackpot feature, expected ~once per 100,000 spins
        #
        # These frequencies are estimates based on SCATTER weight 2/65 per reel.
        # Probability of 3 scatters on 5 reels: C(5,3)×(2/65)^3×(63/65)^2 ≈ 0.00046
        self.scatter_multiplier_table = {
            3:  1.0,   # 3 scatters anywhere on the 5×4 grid → 1× total bet
            4:  3.0,   # 4 scatters anywhere                 → 3× total bet
            5: 10.0,   # 5 scatters anywhere (one per reel)  → 10× total bet
            # Reduced from 5/15/50 so that some 3-scatter spins (1× award +
            # zero ways-to-win) produce a total win below the scatter fence
            # avg_win = 4.0 (= hr 20 × rtp 0.20).  The PigFarm optimizer
            # requires wins both above AND below avg_win to form positive and
            # negative pigs; original values ensured every scatter spin paid
            # ≥ 5× — always above the 4.0 target — causing an infinite loop.
        }

        # ── Freespin Trigger Thresholds ───────────────────────────────────────
        # Future Spinner has NO free-spin round. These thresholds are set to 99
        # (impossible on a 5-reel grid where max scatter count = 5) to prevent
        # the SDK's draw_board() from ever retrying boards due to scatter counts.
        #
        # The SDK draw_board() has this guard when force_freegame=False:
        #   while count_special_symbols("scatter") >= min(freespin_triggers[gametype]):
        #       create_board_reelstrips()
        # With min = 99, this while-loop condition is never true → free draw.
        #
        # Both gametype keys are required to avoid KeyError if the freegame_type
        # is ever referenced during initialization (reset_fs_spin() in __init__).
        self.freespin_triggers = {
            self.basegame_type: {99: 1},   # Unreachable threshold — free draw
            self.freegame_type: {99: 1},   # Defensive — Future Spinner has no freegame
        }

        # anticipation_triggers: threshold for reel-delay animation.
        # Set to 99 for same reason — scatter anticipation is not applicable
        # since scatters don't trigger a freegame in this title.
        self.anticipation_triggers = {
            self.basegame_type: 99,
            self.freegame_type: 99,
        }

        # ── Padding ───────────────────────────────────────────────────────────
        # When True, each reel in the board reveal event includes one symbol
        # above (top) and below (bottom) the visible rows. The FE uses these
        # for reel-stop animations. Row indices in win events are offset +1.
        self.include_padding = True

        # ── Reel Strips ───────────────────────────────────────────────────────
        # CSV files in games/future_spinner/reels/. Each file has 5 columns
        # (one per reel) and N rows (symbols top-to-bottom of the strip).
        #
        # Frequency design target (per reel position):
        #   H1:2, H2:3, M1:5, M2:6, M3:8, L1:10, L2:12, L3:14, W:3, S:2
        #   Total weight ≈ 65; strip length should be ≈ 65 or a multiple.
        #
        # BR0 — Base game reel strip (used for all base+bonus distributions)
        # (FR0 reserved for a freegame strip if a feature is added in future)
        #
        # If CSV files don't exist yet, self.reels[key] is simply not populated.
        # The simulation cannot run until at least BR0.csv exists.
        _reel_files = {
            "BR0":   "BR0.csv",     # Base-game strip — required before running
            "BRWCAP": "BRWCAP.csv", # Wincap strip — H1/Wild heavy, forces 5000x outcomes
        }
        self.reels = {}
        for reel_id, filename in _reel_files.items():
            reel_path = os.path.join(self.reels_path, filename)
            if os.path.exists(reel_path):
                self.reels[reel_id] = self.read_reels_csv(reel_path)

        # ── Padding Reels ─────────────────────────────────────────────────────
        # Required by make_fe_config() — maps gametype → reel strip for the
        # frontend padding symbol configuration. Must be populated after
        # self.reels is built. Uses the base-game strip for both types since
        # Future Spinner has no dedicated freegame strip.
        self.padding_reels = {}
        if "BR0" in self.reels:
            self.padding_reels[self.basegame_type] = self.reels["BR0"]
            self.padding_reels[self.freegame_type] = self.reels["BR0"]

        # ── Bet Mode Conditions ───────────────────────────────────────────────
        # Each condition dict is passed to a Distribution object and consumed
        # by draw_board() and check_repeat() during simulation.
        #
        # Required key: "reel_weights" — maps gametype → {reel_strip_id: weight}
        # Optional keys the SDK checks: "force_freegame", "force_wincap",
        #   "scatter_triggers", "mult_values"
        #
        # reel_weights includes BOTH gametypes defensively — even though Future
        # Spinner never enters freegame, reset_fs_spin() during __init__ sets
        # gametype=freegame_type, and a stray draw_board() call before the first
        # run_spin() would otherwise KeyError on the missing gametype key.

        _base_reels_both = {
            self.basegame_type: {"BR0": 1},
            self.freegame_type: {"BR0": 1},   # Fallback — no dedicated freegame strip
        }

        # ── Wincap reel weights ───────────────────────────────────────────────
        # BRWCAP is a high-density H1/Wild strip (76.9% coverage per position).
        # Using it for the wincap criteria ensures check_repeat() can satisfy
        # win_criteria=5000.0 within a very small number of retries.
        # BRWCAP is only used when the game config has loaded the file; falls
        # back to BR0 if BRWCAP.csv is absent.
        _wincap_strip = "BRWCAP" if "BRWCAP" in self.reels else "BR0"
        _wincap_reels = {
            self.basegame_type: {_wincap_strip: 1},
            self.freegame_type: {_wincap_strip: 1},
        }

        # ── Condition: wincap ─────────────────────────────────────────────────
        # Applied to 0.1% of base spins and 0.1% of bonus spins.
        # These are the extreme-win tail outcomes (≥ 5,000× bet).
        # win_criteria=5000.0 forces check_repeat() to reject any sim whose
        # final_win ≠ exactly 5,000× bet (the wincap).
        # BRWCAP strip makes 5000× achievable in ≤ 3 retries on average.
        wincap_condition = {
            "reel_weights":   _wincap_reels,
            "force_wincap":   True,    # Advisory flag for game_override logic
            "force_freegame": False,   # No scatter-forcing
        }

        # ── Condition: scatter ────────────────────────────────────────────────
        # Applied to 5% of base spins and 99.9% of bonus spins.
        # force_freegame=True instructs draw_board() to use force_special_board(),
        # which guarantees the requested number of scatter symbols appear.
        # scatter_triggers weights: {count: weight} → RNG selects scatter count.
        #
        # CRITICAL: gamestate.py must set self.triggered_freegame = True after
        # processing the scatter multiplier, otherwise check_repeat() will reject
        # every spin in this criteria (see module-level architecture note).
        #
        # Base game scatter distribution (5% of spins):
        #   70% chance of 3 scatters (5× award) → expected contribution ≈ 0.70×5×0.05 = 0.175×
        #   20% chance of 4 scatters (15× award) → 0.20×15×0.05 = 0.15×
        #   10% chance of 5 scatters (50× award) → 0.10×50×0.05 = 0.25×
        #   Plus expected ways wins on same spin.
        scatter_base_condition = {
            "reel_weights":    _base_reels_both,
            "force_wincap":    False,
            "force_freegame":  True,   # Activates scatter-count forcing in draw_board()
            "scatter_triggers": {
                3: 70,   # 70% weight → 3 scatters → 5× total bet
                4: 20,   # 20% weight → 4 scatters → 15× total bet
                5: 10,   # 10% weight → 5 scatters → 50× total bet
            },
        }

        # Bonus buy scatter distribution (99.9% of bonus spins):
        # Bonus players pay 100× for guaranteed scatter access. Shift weight
        # toward higher scatter counts to justify the buy cost vs. base game.
        scatter_bonus_condition = {
            "reel_weights":    _base_reels_both,
            "force_wincap":    False,
            "force_freegame":  True,
            "scatter_triggers": {
                3: 60,   # 60% → 3 scatters (5× bet)
                4: 25,   # 25% → 4 scatters (15× bet)   ← higher than base
                5: 15,   # 15% → 5 scatters (50× bet)   ← higher than base
            },
        }

        # ── Condition: 0 (zero-win) ───────────────────────────────────────────
        # Applied to 40.0% of base spins. Forces simulations that contribute
        # nothing to RTP — essential for calibrating overall hit rate.
        # win_criteria=0.0 tells check_repeat() to reject any spin with a win.
        # 40% zero-win quota is appropriate for medium-high volatility.
        zerowin_condition = {
            "reel_weights":   _base_reels_both,
            "force_wincap":   False,
            "force_freegame": False,
        }

        # ── Condition: basegame ───────────────────────────────────────────────
        # Applied to 54.9% of base spins. No forcing — free draw from BR0.
        # Captures the full range of naturally-occurring ways-to-win outcomes.
        # Scatters may land naturally on these spins (see scatter handling in
        # gamestate.py); they will still award the multiplier when they do.
        # The optimizer shapes the win distribution within this criteria.
        basegame_condition = {
            "reel_weights":   _base_reels_both,
            "force_wincap":   False,
            "force_freegame": False,
        }

        # ── Maximum Wins per Mode ─────────────────────────────────────────────
        # Both modes share the same wincap. Kept as a dict for readability
        # when constructing BetMode objects below.
        _mode_maxwins = {
            "base":  int(_WINCAP),   # 5000
            "bonus": int(_WINCAP),   # 5000
        }

        # ── Bet Modes ─────────────────────────────────────────────────────────
        self.bet_modes = [

            # ── BASE MODE ─────────────────────────────────────────────────────
            # Standard single-spin play at 1× bet cost.
            # is_feature=True: this is the "main" mode (standard RGS behaviour).
            # is_buybonus=False: not a purchase mode.
            #
            # Distribution quota breakdown (must sum to 1.0):
            #   wincap    0.001  →   100 sims per 100,000 (extreme wins)
            #   scatter   0.050  → 5,000 sims per 100,000 (scatter feature spins)
            #   0         0.400  →40,000 sims per 100,000 (zero-win spins)
            #   basegame  0.549  →54,900 sims per 100,000 (regular winning spins)
            #   TOTAL     1.000
            BetMode(
                name="base",
                cost=1.0,
                rtp=self.rtp,                    # 0.9635
                max_win=_mode_maxwins["base"],   # 5000
                auto_close_disabled=False,       # RGS auto-closes zero-win rounds
                is_feature=True,
                is_buybonus=False,
                distributions=[
                    Distribution(
                        criteria="wincap",
                        quota=0.001,
                        win_criteria=float(_mode_maxwins["base"]),  # Must hit exactly 5000×
                        conditions=wincap_condition,
                    ),
                    Distribution(
                        criteria="scatter",
                        quota=0.050,
                        # No win_criteria — scatter award varies by count (5/15/50×)
                        conditions=scatter_base_condition,
                    ),
                    Distribution(
                        criteria="0",
                        quota=0.400,
                        win_criteria=0.0,           # Must produce zero payout
                        conditions=zerowin_condition,
                    ),
                    Distribution(
                        criteria="basegame",
                        quota=0.549,
                        # No win_criteria — accepts any non-zero, non-wincap outcome
                        conditions=basegame_condition,
                    ),
                ],
            ),

            # ── BONUS MODE (Buy-Bonus) ────────────────────────────────────────
            # Player pays 100× bet to enter guaranteed scatter-multiplier spin.
            # Cost ratio 100× reflects: base scatter hit rate ~1/2000 spins ×
            # ~3× expected award relative to bet × some buy-bonus premium.
            # is_feature=False: this mode is not the "main" game loop.
            # is_buybonus=True: RGS displays this as a purchase option.
            #
            # Distribution quota breakdown:
            #   wincap   0.001  → wincap hits within bonus context
            #   scatter  0.999  → nearly all bonus spins are scatter events
            #   TOTAL    1.000
            BetMode(
                name="bonus",
                cost=100.0,
                rtp=self.rtp,                     # 0.9635 — same RTP as base
                max_win=_mode_maxwins["bonus"],   # 5000
                auto_close_disabled=False,
                is_feature=False,
                is_buybonus=True,
                distributions=[
                    Distribution(
                        criteria="wincap",
                        quota=0.001,
                        win_criteria=float(_mode_maxwins["bonus"]),
                        conditions=wincap_condition,
                    ),
                    Distribution(
                        criteria="scatter",
                        quota=0.999,
                        conditions=scatter_bonus_condition,
                    ),
                ],
            ),
        ]

        # ── Optimizer Parameters (opt_params) ─────────────────────────────────
        # Consumed by generate_configs() → make_temp_math_config() to produce
        # math_config.json, which the Rust optimization engine reads.
        #
        # Structure per mode:
        #   conditions       : one entry per distribution criteria; RTPs must
        #                      sum to betmode RTP (enforced by verify_optimization_input)
        #   scaling          : win-range scaling factors for distribution shaping
        #   parameters       : optimization run hyperparameters
        #   distribution_bias: optional bias toward specific win ranges
        #
        # Condition dict format (matches ConstructConditions.return_dict()):
        #   search_range : (min_win, max_win) for optimizer win-range search;
        #                  (-1, -1) means "use force_search key instead"
        #   force_search : {field_name: value} to find book entries by event tag
        #   rtp          : RTP contribution from this criteria (float)
        #   av_win       : average payout for outcomes in this criteria (optional)
        #   hr           : hit rate — avg spins between outcomes in criteria (optional)
        #
        # RTP CONSTRAINT: all condition RTPs per mode MUST sum to mode RTP.
        #   Base:  0.0500 + 0.2000 + 0.0000 + 0.7135 = 0.9635 ✓
        #   Bonus: 0.0500 + 0.9135               = 0.9635 ✓
        #
        # NOTE: If OptimizationSetup(config) is called in run.py, it WILL
        # overwrite self.opt_params with its own values. These values here are
        # used when optimization is disabled (run_optimization=False) and when
        # generate_configs() is called without a prior OptimizationSetup call.
        # Create game_optimization.py to define refined opt_params for the Rust
        # optimizer once reel strips are finalised.

        _wincaps = {bm.get_name(): bm.get_wincap() for bm in self.bet_modes}

        self.opt_params = {

            # ── Base Mode Optimizer Config ─────────────────────────────────────
            "base": {
                "conditions": {

                    # wincap: target the maximum-win tail.
                    # av_win = 5000 (exact wincap value); rtp=0.05 implies
                    # ~1-in-100,000 actual hit rate contributing 5% of total RTP.
                    "wincap": {
                        "search_range": (_wincaps["base"], _wincaps["base"]),
                        "force_search": {},            # Locate by exact win amount
                        "rtp":    0.0500,
                        "av_win": float(_wincaps["base"]),   # 5000.0
                    },

                    # scatter: locate outcomes containing scatter-triggered events.
                    # hr=20 → optimizer expects ~1 in 20 simulations in this
                    # criteria to have scatter wins (within the forced 5% quota).
                    # av_win = rtp/hr per spin roughly; actual value set by optimizer.
                    "scatter": {
                        "search_range": (-1, -1),
                        "force_search": {"symbol": "scatter"},   # Match force-file key
                        "rtp":  0.2000,
                        "hr":   20.0,
                    },

                    # 0 (zero-win): no contribution to RTP; optimizer skips these
                    # when targeting payout distribution shaping.
                    "0": {
                        "search_range": (0.0, 0.0),
                        "force_search": {},
                        "rtp":    0.0000,
                        "av_win": 0.0,
                    },

                    # basegame: the bulk of the ways-to-win outcomes.
                    # hr=3.5 → roughly 1 in 3.5 basegame spins has a win.
                    # With quota 0.549, basegame forms the backbone of the RTP.
                    "basegame": {
                        "search_range": (-1, -1),
                        "force_search": {},
                        "rtp":  0.7135,
                        "hr":   3.5,
                    },
                },

                # Scaling: biases the optimizer toward specific win ranges.
                # scale_factor > 1.0 → try to show MORE outcomes in this range.
                # scale_factor < 1.0 → try to show FEWER outcomes in this range.
                "scaling": [
                    # Boost small basegame wins (1–5×) — increases hit frequency,
                    # supports medium-high volatility profile.
                    {"criteria": "basegame", "scale_factor": 1.2,
                     "win_range": (1.0, 5.0),    "probability": 1.0},
                    # Boost medium basegame wins (10–30×) — gives satisfying
                    # mid-range wins and visible excitement moments.
                    {"criteria": "basegame", "scale_factor": 1.5,
                     "win_range": (10.0, 30.0),  "probability": 1.0},
                    # Slightly over-represent small scatter wins (5–15×) so the
                    # 3-scatter outcome appears regularly in the book.
                    {"criteria": "scatter",  "scale_factor": 1.3,
                     "win_range": (5.0, 15.0),   "probability": 1.0},
                    # Under-represent very large scatter wins (50–200×) to
                    # control variance within the medium-high target band.
                    {"criteria": "scatter",  "scale_factor": 0.8,
                     "win_range": (50.0, 200.0), "probability": 1.0},
                ],

                # Optimizer hyperparameters.
                # num_show_pigs     : selected outcomes per fence (≤ pool size)
                # num_pigs_per_fence: candidate pool per fence
                # min/max_mean_to_median: acceptable range for win distribution shape
                # pmb_rtp           : probability mass balance RTP weight
                # simulation_trials : Monte Carlo trials per optimization step
                # test_spins        : session lengths used to score distributions
                # test_spins_weights: relative importance of each session length
                # score_type        : "rtp" — optimize toward exact RTP target
                # max_trial_dist    : maximum distribution candidates per iteration
                #
                # These values are calibrated for 10k–100k sim pools and complete
                # in 2–5 minutes on a 4-core machine with 20 Rust threads.
                "parameters": {
                    "num_show_pigs":       1000,
                    "num_pigs_per_fence":  2000,
                    "min_mean_to_median":     4,
                    "max_mean_to_median":     8,
                    "pmb_rtp":              1.0,
                    "simulation_trials":    500,
                    "test_spins":        [50, 100, 200],
                    "test_spins_weights": [0.3, 0.4, 0.3],
                    "score_type":         "rtp",
                    "max_trial_dist":        10,
                },

                # Distribution bias: nudge the optimizer to over-represent
                # basegame wins in the 2–5× range (small but satisfying hits).
                "distribution_bias": [
                    {"criteria": "basegame", "range": (2.0, 5.0), "prob": 0.4},
                ],
            },

            # ── Bonus Mode Optimizer Config ────────────────────────────────────
            "bonus": {
                "conditions": {

                    # wincap: same as base — extreme tail within bonus context.
                    "wincap": {
                        "search_range": (_wincaps["bonus"], _wincaps["bonus"]),
                        "force_search": {},
                        "rtp":    0.0500,
                        "av_win": float(_wincaps["bonus"]),
                    },

                    # scatter: nearly all bonus spins hit scatter (quota=0.999).
                    # hr=5.0 → very high hit frequency (forced scatter every ~5 spins
                    # within bonus pool); av_win ≈ rtp×hr per event.
                    "scatter": {
                        "search_range": (-1, -1),
                        "force_search": {"symbol": "scatter"},
                        "rtp":  0.9135,
                        "hr":   5.0,
                    },
                },

                "scaling": [
                    # For bonus mode, focus on shaping the scatter win distribution.
                    # Slightly boost lower-range scatter awards (5–15×) for frequency.
                    {"criteria": "scatter", "scale_factor": 1.2,
                     "win_range": (5.0, 15.0),    "probability": 1.0},
                    # Reduce over-representation of mid-scatter awards (50–200×).
                    {"criteria": "scatter", "scale_factor": 0.8,
                     "win_range": (50.0, 200.0),  "probability": 1.0},
                    # Preserve high-scatter wins (200–500×) at natural frequency —
                    # these are the headline wins bonus players are buying for.
                    {"criteria": "scatter", "scale_factor": 1.5,
                     "win_range": (200.0, 500.0), "probability": 1.0},
                ],

                "parameters": {
                    "num_show_pigs":       1000,
                    "num_pigs_per_fence":  2000,
                    "min_mean_to_median":     4,
                    "max_mean_to_median":     8,
                    "pmb_rtp":              1.0,
                    "simulation_trials":    500,
                    # Bonus sessions are shorter (player buys individual spins),
                    # so weight short session counts more heavily.
                    "test_spins":        [10, 20, 50],
                    "test_spins_weights": [0.6, 0.2, 0.2],
                    "score_type":         "rtp",
                    "max_trial_dist":        10,
                },

                # Bonus bias: push scatter wins toward the 10–50× range —
                # the "sweet spot" that justifies the buy-bonus cost to players.
                "distribution_bias": [
                    {"criteria": "scatter", "range": (10.0, 50.0), "prob": 0.3},
                ],
            },
        }
