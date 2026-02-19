# File: gamestate.py
# Game: Future Spinner by We Roll Spinners
# Purpose: GameState class — drives per-spin simulation flow.
#
# Architecture
# ------------
# This class has two operational modes that share a single codebase:
#
#   SDK pipeline mode
#   -----------------
#   Called by the SDK's run_sims() as: run_spin(sim_index, simulation_seed)
#   Uses draw_board() (reel strips), SDK WinManager, Book / imprint pipeline.
#   Results are stored in self.library and written to JSONL / CSV outputs.
#   No return value.
#
#   Standalone mode
#   ---------------
#   Called directly as: run_spin() or run_spin(mode='base')
#   Uses generate_board() (symbol weights), standalone pure functions from
#   game_calculation.py, and builds a simulation record dict in-process.
#   Returns: {id, payoutMultiplier, events, criteria, baseGameWins, freeGameWins}
#
# The two modes are distinguished by a sentinel object (_STANDALONE) used as
# the default for the `sim` parameter.  When the SDK passes a positional
# integer, `sim` is that integer (never _STANDALONE).  When called as
# run_spin() or run_spin(mode=...), `sim` stays as _STANDALONE.

from __future__ import annotations

import random
from typing import Optional

from game_executables.game_calculation import (
    GameCalculation,
    evaluate_ways_to_win,
    check_scatter,
    build_events,
    calculate_total_payout,
)


# ── Sentinel ──────────────────────────────────────────────────────────────────
# Used as the default for `sim` to reliably detect standalone calls.
# Unlike None or 0, this object can never be a valid SDK sim index.
_STANDALONE = object()


class GameState(GameCalculation):
    """
    Per-spin simulation controller for Future Spinner.

    Inherits the full SDK computation stack via GameCalculation:

        GeneralGameState -> Conditions -> Board -> Tumble -> Executables
            -> GameCalculation -> GameState

    SDK Spin flow  (called by run_sims)
    ------------------------------------
    1. draw_board()                  -- draw from BR0 reel strip, or force a
                                        scatter board when criteria="scatter"
    2. evaluate_ways_board()         -- left-to-right 1,024-ways evaluation;
                                        emits winInfo / setWin / setTotalWin
    3. evaluate_scatter_multiplier() -- instant scatter award (3-5 scatters);
                                        emits winInfo / setWin / setTotalWin;
                                        sets triggered_freegame = True
    4. update_gametype_wins()        -- rolls spin_win into basegame bucket
    5. evaluate_finalwin()           -- computes final payout, emits finalWin
    6. check_repeat()                -- resamples if spin fails its distribution
                                        criteria (zero-win guard also applied)

    Standalone Spin flow  (called as run_spin() or run_spin(mode='base'))
    ----------------------------------------------------------------------
    1. generate_board()              -- weighted-random 5x4 board (no strips)
    2. evaluate_ways_to_win()        -- pure-function ways calculation
    3. check_scatter()               -- pure-function scatter count + multiplier
    4. calculate_total_payout()      -- integer centibets total
    5. build_events()                -- SDK-format event list
    6. Returns simulation record dict

    Criteria quick-reference (SDK mode)
    ------------------------------------
    betmode "base":
        wincap   -- force_wincap=True; final win must equal wincap (5,000x)
        scatter  -- force_freegame=True; 3-5 scatter symbols forced on board
        0        -- win_criteria=0.0; spin must resolve with zero win
        basegame -- no win_criteria; any non-zero win accepted

    betmode "bonus" (buy-bonus):
        wincap   -- same as base wincap
        scatter  -- force_freegame=True; higher scatter quota (quota=0.999)

    Symbol roster
    -------------
    H1 Spinning Rim | H2 Turbocharger | M1 Car Grille | M2 Exhaust Pipe
    M3 Steering Wheel | L1 Lug Nut | L2 Spark Plug | L3 Piston
    W Wild (substitute, no independent pay)
    S Scatter (instant multiplier: 3->5x, 4->15x, 5->50x total bet)
    """

    # ── Symbol frequency weights for standalone board generation ──────────────
    #
    # Used by generate_board() when the reel strips (BR0.csv) are not yet
    # available or when running in standalone mode.
    #
    # Values approximate target reel strip frequencies (total = 65 per position).
    # Lower-tier symbols are more frequent; high-value symbols are rarer.
    #
    # These weights directly influence the standalone RTP — they are NOT used
    # by the SDK pipeline (which reads from the actual reel strips).
    _DEFAULT_SYMBOL_WEIGHTS: dict[str, int] = {
        "H1":  2,   # Spinning Rim   — rarest; highest paytable value
        "H2":  3,   # Turbocharger
        "M1":  5,   # Car Grille
        "M2":  6,   # Exhaust Pipe
        "M3":  8,   # Steering Wheel
        "L1": 10,   # Lug Nut
        "L2": 12,   # Spark Plug
        "L3": 14,   # Piston         — most common; lowest paytable value
        "W":   3,   # Wild           — substitutes all pay symbols
        "S":   2,   # Scatter        — triggers instant multiplier
        #       --
        #       65  total per reel position
    }

    # ── Initialisation ────────────────────────────────────────────────────────

    def __init__(self, config) -> None:
        """
        Initialise the game state for Future Spinner.

        Parameters
        ----------
        config : GameConfig
            Fully constructed GameConfig singleton.  All paytable values,
            scatter multiplier table, reel strips, and bet modes are read
            from this object.

        Initialisation steps
        --------------------
        1. Calls ``super().__init__(config)`` which runs the full SDK chain:
               OutputFiles, WinManager, symbol_map, assign_special_sym_function,
               reset_seed, reset_book, reset_fs_spin.
        2. Registers the symbol weights for standalone board generation.
           If ``config`` defines a ``symbol_weights`` attribute it is used;
           otherwise ``_DEFAULT_SYMBOL_WEIGHTS`` applies.
        3. Initialises the standalone spin counter used for simulation IDs.

        Notes
        -----
        The random board generator (``generate_board``) uses ``random.choices``
        with the symbol weight list.  The SDK pipeline uses ``draw_board``
        (reel strips) and manages its own RNG via ``reset_seed``.
        """
        super().__init__(config)

        # Symbol weights for generate_board() — prefer config-defined weights
        # if present, otherwise fall back to the class-level defaults.
        self._symbol_weights: dict[str, int] = getattr(
            config, "symbol_weights", self._DEFAULT_SYMBOL_WEIGHTS
        )

        # Standalone spin counter — provides sequential IDs for records
        # returned by run_spin(mode=...).  Not used by the SDK pipeline.
        self._standalone_spin_count: int = 0

    # ── SDK abstract method implementations ───────────────────────────────────

    def assign_special_sym_function(self) -> None:
        """
        Register per-symbol creation callbacks.

        Wild (W)
            Pure substitute; handled automatically by ``Ways.get_ways_data()``.
            No per-symbol creation callback is needed.

        Scatter (S)
            Stateless; the board module tags it via ``defn.special`` flags.
            No per-symbol creation side-effects are needed.

        Setting ``special_symbol_functions = {}`` is the correct no-op
        implementation — ``GeneralGameState.__init__`` will call this method
        and expects the attribute to exist afterward.
        """
        self.special_symbol_functions = {}

    def run_freespin(self) -> None:
        """
        No-op stub — Future Spinner has no free-spin round.

        Required by ``GeneralGameState``'s ``@abstractmethod`` contract.  The
        scatter bonus is a stateless single-spin multiplier resolved entirely
        inside ``run_spin``; ``run_freespin`` is never called during normal
        simulation.
        """
        pass

    # ── Board generation (standalone) ─────────────────────────────────────────

    def generate_board(self) -> list[list[str]]:
        """
        Generate a 5x4 grid of symbols using weighted random selection.

        This method is used by standalone ``run_spin(mode=...)`` calls and by
        the ``__main__`` test block in ``game_calculation.py``.  The SDK
        pipeline uses ``draw_board()`` (reel strips) instead.

        Parameters
        ----------
        None.  Symbol weights are read from ``self._symbol_weights``, which is
        set during ``__init__`` to ``config.symbol_weights`` (if defined) or to
        the class-level ``_DEFAULT_SYMBOL_WEIGHTS``.

        Returns
        -------
        list[list[str]]
            ``board[col][row]`` — 5 columns (reels), 4 rows each.
            Each cell is a symbol name string, e.g. ``"H1"``, ``"W"``, ``"S"``.

        Implementation notes
        --------------------
        *   ``random.choices`` draws ``k=4`` symbols **with replacement** for
            each reel, using the integer weights to bias the selection.
        *   Symbols are drawn independently per reel; there is no correlation
            between reels (unlike reel strips which have positional patterns).
        *   The same symbol CAN appear in multiple rows of the same reel
            (stacked), including Wild and Scatter.

        Example
        -------
        ::

            gs = GameState(config)
            board = gs.generate_board()
            # board[0] = ["H1", "L3", "M2", "S"]   <- reel 0, 4 rows
            # board[1] = ["W",  "H2", "L1", "M3"]  <- reel 1
            # ...
        """
        symbols = list(self._symbol_weights.keys())
        weights = list(self._symbol_weights.values())

        return [
            random.choices(symbols, weights=weights, k=4)
            for _ in range(self.config.num_reels)   # 5 reels
        ]

    # ── Simulation acceptance filter ──────────────────────────────────────────

    def accept(self, simulation: dict) -> bool:
        """
        Determine whether a simulation record should be retained.

        The SDK calls this method (or an equivalent filter) during book
        generation to reject anomalous records before writing.  This
        implementation is also used by standalone callers to validate records
        returned by ``run_spin(mode=...)``.

        Parameters
        ----------
        simulation : dict
            A simulation record in Book format:
            ``{id, payoutMultiplier, events, criteria, baseGameWins, freeGameWins}``.
            ``payoutMultiplier`` is an integer in **centibets** (bet-mult × 100).

        Returns
        -------
        bool
            ``True``  — simulation is valid; include in output.
            ``False`` — simulation is anomalous; discard.

        Acceptance criteria
        -------------------
        *   **Safety cap**: reject any spin whose ``payoutMultiplier`` exceeds
            10,000 centibets (100× bet).  This cap is intentionally lower than
            the production wincap (5,000× = 500,000 centibets) to filter out
            potential arithmetic errors or corrupted records during development.
        *   All other spins — including zero-win spins — are accepted.

        Note
        ----
        In the SDK pipeline, ``check_repeat()`` is the primary filter for
        distribution-criteria compliance.  ``accept()`` is an additional
        safety layer for standalone use.  Once reel strips are calibrated and
        the optimiser is run, this cap should be raised to the production
        wincap value (500,000 centibets) or removed entirely.
        """
        return simulation["payoutMultiplier"] <= 10_000

    # ── Spin execution (dual mode) ─────────────────────────────────────────────

    def run_spin(
        self,
        sim=_STANDALONE,
        simulation_seed=None,
        mode: str = "base",
    ):
        """
        Execute one complete spin in either SDK pipeline or standalone mode.

        Mode detection
        --------------
        The ``sim`` parameter uses ``_STANDALONE`` (a module-level sentinel
        object) as its default.  This is the ONLY reliable way to distinguish
        the two calling conventions without inspecting a fragile runtime state:

        *   ``run_spin(sim_index, seed)`` — SDK call; ``sim`` is an ``int``.
        *   ``run_spin()`` or ``run_spin(mode='base')`` — standalone call;
            ``sim`` is ``_STANDALONE``.

        Why not check ``sim == 0`` or ``simulation_seed is None``?
        The SDK legitimately calls ``run_spin(0, None)`` for simulation index 0
        when no explicit seeds are provided.  Using a sentinel avoids that
        collision entirely.

        SDK pipeline mode  [sim is an int]
        -----------------------------------
        Parameters
            sim : int
                Simulation index; passed to ``reset_seed()`` which sets
                ``random.seed(sim + 1)`` for full reproducibility.
            simulation_seed : optional
                Explicit seed override; if not None, overrides the sim-based
                seed via ``reset_seed(sim, seed_override=simulation_seed)``.

        Flow:
            reset_seed → repeat loop {
                reset_book → draw_board (reel strips or forced scatter board)
                → evaluate_ways_board → evaluate_scatter_multiplier
                → update_gametype_wins → evaluate_finalwin → check_repeat
            } → imprint_wins

        Returns:
            None.  Results are stored in ``self.library`` and written to disk
            by the SDK's thread / book pipeline.

        Standalone mode  [sim is _STANDALONE]
        --------------------------------------
        Parameters
            mode : str
                Distribution criteria label for the returned record.
                Matches the ``criteria`` field in SDK Book format.
                Default: ``"base"``.

        Flow:
            generate_board → evaluate_ways_to_win → check_scatter
            → calculate_total_payout → build_events

        Returns:
            dict — simulation record in Book.to_json() format:

            .. code-block:: python

                {
                    "id":               int,    # sequential spin counter
                    "payoutMultiplier": int,    # total win in centibets (x100)
                    "events":           list,   # ordered SDK-format events
                    "criteria":         str,    # the `mode` argument
                    "baseGameWins":     float,  # win in bet-multiples
                    "freeGameWins":     float,  # always 0.0 (stateless game)
                }

        Raises
        ------
        RuntimeError
            If the SDK pipeline enters an infinite repeat loop (detected by
            ``check_current_repeat_count()`` in the base class, which emits a
            warning after 1,000 iterations).
        """
        if sim is _STANDALONE:
            return self._run_standalone(mode)

        # ── SDK pipeline ──────────────────────────────────────────────────────
        self.reset_seed(sim, simulation_seed)
        self.repeat = True
        while self.repeat:
            self.reset_book()

            # draw_board detects the current distribution's force_freegame flag:
            #   force_freegame=True  -> force the number of scatter symbols
            #                          specified by scatter_triggers
            #   force_freegame=False -> draw normally and resample while
            #                          scatter count >= freespin_triggers threshold
            #                          (threshold = 99 = unreachable, so no
            #                           resampling occurs in practice)
            self.draw_board(emit_event=True)

            # Ways-to-win: finds all left-to-right symbol matches including
            # Wild substitution; emits winInfo / setWin / setTotalWin events
            self.evaluate_ways_board()

            # Scatter multiplier: counts S symbols, looks up multiplier table,
            # awards win, emits winInfo / setWin / setTotalWin, and crucially
            # sets self.triggered_freegame = True for scatter-criteria spins
            self.evaluate_scatter_multiplier()

            # Assign all spin wins to the basegame bucket (no freegame exists)
            self.win_manager.update_gametype_wins(self.gametype)

            # Compute final payout (capped at wincap) and emit finalWin event
            self.evaluate_finalwin()

            # Check distribution criteria; sets self.repeat = True to resample
            # if this spin does not satisfy its assigned criteria
            self.check_repeat()

        # Store the accepted simulation in self.library and record force events
        self.imprint_wins()

    def _run_standalone(self, mode: str = "base") -> dict:
        """
        Execute a standalone spin using pure functions and return a record dict.

        Called internally by ``run_spin()`` when invoked without a positional
        ``sim`` argument.  Uses ``generate_board()`` (symbol weights) rather
        than ``draw_board()`` (reel strips), and calls the standalone pure
        functions from ``game_calculation.py`` rather than the SDK pipeline.

        Parameters
        ----------
        mode : str
            Criteria label for the returned record (default ``"base"``).

        Returns
        -------
        dict
            Simulation record in ``Book.to_json()`` format.  Fields:

            id : int
                Monotonically increasing standalone spin counter starting at 1.
                Provides a unique ID without requiring an external sim index.
            payoutMultiplier : int
                Total spin win in centibets (bet-multiples × 100).
                Examples: 5500 for 55×, 0 for a losing spin.
            events : list[dict]
                Ordered event sequence: reveal, [winInfo, setWin], [scatterInfo,
                setWin], setTotalWin, finalWin.
            criteria : str
                The ``mode`` argument (e.g. ``"base"`` or ``"scatter"``).
            baseGameWins : float
                Total win in bet-multiples (not centibets).
                Examples: 55.0 for 55×, 0.0 for a losing spin.
            freeGameWins : float
                Always ``0.0`` — Future Spinner has no free-spin round.

        Notes
        -----
        *   The standalone spin counter (``_standalone_spin_count``) is
            incremented before the spin runs so that IDs start at 1.
        *   The paytable is read from ``self.config.paytable`` (dict of
            ``{(kind, symbol): float}``), which is fully populated by
            ``GameConfig.__init__``.
        *   The scatter multiplier table is read from
            ``self.config.scatter_multiplier_table``
            (``{3: 5, 4: 15, 5: 50}``).
        *   ``calculate_total_payout`` uses integer arithmetic only
            (per-win rounding before summing), so ``payoutMultiplier`` is
            always an exact integer.
        *   ``baseGameWins = payoutMultiplier / 100`` — a float rounded to 2
            decimal places, matching the ``Book.basegame_wins`` field format.
        """
        self._standalone_spin_count += 1

        # 1. Generate a fresh board from symbol weights
        board = self.generate_board()

        # 2. Evaluate ways-to-win (left-to-right, Wild substitution)
        line_wins = evaluate_ways_to_win(
            board,
            self.config.paytable,
            wild_symbol=self.config.special_symbols["wild"][0],
        )

        # 3. Count scatter symbols and look up the instant multiplier
        scatter_result = check_scatter(
            board,
            scatter_symbol=self.config.special_symbols["scatter"][0],
        )

        # 4. Compute total payout in centibets using integer arithmetic only
        total_centibets: int = calculate_total_payout(line_wins, scatter_result)

        # 5. Convert to bet-multiples for display and for building events
        total_multiplier: float = total_centibets / 100

        # 6. Build ordered SDK-format event list
        events = build_events(
            board                = board,
            line_wins            = line_wins,
            scatter_result       = scatter_result,
            total_win_multiplier = total_multiplier,
        )

        # 7. Assemble simulation record in Book.to_json() format
        simulation = {
            "id":               self._standalone_spin_count,
            "payoutMultiplier": total_centibets,              # int centibets
            "events":           events,
            "criteria":         mode,
            "baseGameWins":     round(total_multiplier, 2),   # float bet-multiples
            "freeGameWins":     0.0,                          # always zero
        }

        return simulation

    # ── Distribution criteria override ────────────────────────────────────────

    def check_repeat(self) -> None:
        """
        Extend the base ``check_repeat()`` to enforce a zero-win guard on the
        ``basegame`` criteria bucket.

        Problem
        -------
        The ``basegame`` distribution has no ``win_criteria`` (it is ``None``).
        The base ``check_repeat()`` accepts any spin whose ``final_win`` does
        not violate an explicit ``win_criteria`` constraint.  Without this
        override, a zero-win spin assigned to ``basegame`` would pass — it
        would leak into the wrong bucket, inflating the zero-win proportion
        and degrading RTP accuracy.

        Solution
        --------
        After the parent check passes (``repeat is False``), if the current
        distribution has ``win_criteria = None`` AND ``final_win == 0``,
        set ``repeat = True`` to force a resample.  Zero-win spins are
        captured exclusively by the ``"0"`` distribution (``win_criteria=0.0``).

        This mirrors the ``check_repeat()`` override pattern used in the
        ``0_0_lines`` reference game (``game_override.py``).

        Note
        ----
        This guard does NOT apply to the ``"0"`` distribution itself, which
        has ``win_criteria=0.0`` (not ``None``) and is therefore handled by
        the base class equality check ``final_win != win_criteria``.
        """
        super().check_repeat()
        if self.repeat is False:
            win_criteria = self.get_current_betmode_distributions().get_win_criteria()
            if win_criteria is None and self.final_win == 0:
                self.repeat = True
