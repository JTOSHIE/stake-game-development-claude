# File: game_executables/game_calculation.py
# Game: Future Spinner by We Roll Spinners
# Purpose: Spin calculation logic for Future Spinner — 5×4 ways-to-win grid with
#          a stateless instant scatter multiplier.
#
# This module has two layers:
#
#   Layer 1 — Standalone pure functions
#   -------------------------------------
#   evaluate_ways_to_win()    works on raw list[list[str]] boards
#   check_scatter()           counts scatter symbols, looks up multiplier
#   build_events()            serialises one spin to SDK-format events list
#   calculate_total_payout()  integer-arithmetic centibets total
#
#   These four functions are callable without any SDK state and are used
#   directly by the __main__ test block and by the GameCalculation class below.
#
#   Layer 2 — SDK-compatible GameCalculation class
#   ------------------------------------------------
#   evaluate_ways_board()         — SDK instance method (uses Ways + win_manager)
#   evaluate_scatter_multiplier() — SDK instance method (uses win_manager + events)
#
#   The class integrates with the full SDK pipeline (Books, WinManager, force
#   files, optimiser).  The standalone functions are its computational core.

from __future__ import annotations

import json
import os
import sys
from typing import List

# -- SDK path resolution -------------------------------------------------------
# When this file is executed directly (e.g. `python game_calculation.py` for
# the __main__ test block), Python adds only the script's own directory to
# sys.path, making `src.*` imports fail.  The block below resolves the SDK
# root (3 levels up: game_executables/ → future_spinner/ → games/ → math-sdk/)
# and inserts it if not already present.  This is a no-op when the SDK is
# installed as an editable package via `pip install -e .`.
_SDK_ROOT = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")
)
if _SDK_ROOT not in sys.path:
    sys.path.insert(0, _SDK_ROOT)

# SDK imports are only needed when running inside the full simulation pipeline.
# When this file is executed directly for testing (no venv / no zstandard),
# we fall back to lightweight stubs so that the four standalone pure functions
# and the __main__ block run without the full SDK present.
try:
    from src.executables.executables import Executables
    from src.calculations.ways import Ways
    from src.events.events import (
        win_info_event,
        set_win_event,
        set_total_event,
    )
    _SDK_AVAILABLE = True
except ImportError:
    _SDK_AVAILABLE = False

    class Executables:  # type: ignore[no-redef]
        """Minimal stub — used only when SDK is not importable."""

    Ways = None  # type: ignore[assignment]
    win_info_event = set_win_event = set_total_event = None  # type: ignore[assignment]


# -- Module-level constants ----------------------------------------------------

# Scatter multiplier table: {count → total-bet multiplier}
# 0-2 scatters → no award; 3-5 scatters → instant multiplier on that spin.
_SCATTER_MULTIPLIER_TABLE: dict[int, int] = {3: 5, 4: 15, 5: 50}


# ═════════════════════════════════════════════════════════════════════════════
# LAYER 1 — Standalone pure functions
# ═════════════════════════════════════════════════════════════════════════════


def evaluate_ways_to_win(
    board: List[List[str]],
    paytable: dict,
    wild_symbol: str = "W",
) -> List[dict]:
    """
    Evaluate all ways-to-win combinations on a 5×4 reel grid.

    Parameters
    ----------
    board : list[list[str]]
        ``board[reel][row]`` — 5 reels, 4 rows each.  Symbol names are plain
        strings (e.g. ``"H1"``, ``"W"``, ``"S"``).
    paytable : dict
        ``{(kind, symbol_name): payout_per_way_float}`` — mirrors
        ``GameConfig.paytable``.  Wild and Scatter are NOT keys; Wild is a
        substitute, Scatter is handled by ``check_scatter()``.
    wild_symbol : str
        Symbol name for the Wild (default ``"W"``).

    Returns
    -------
    list[dict]
        One entry per distinct winning symbol:

        .. code-block:: python

            {
                "symbol":            str,   # winning symbol name
                "count":             int,   # contributing reels (3, 4, or 5)
                "payout_multiplier": float, # total win in bet-multiples
                "positions":         list,  # [{"reel": int, "row": int}, ...]
            }

    Ways rule
    ---------
    A win is formed strictly left-to-right.  For each **regular** (non-Wild)
    symbol *S* present on **reel 0**:

    * Per reel, compute ``reel_contribution = count(S) + count(Wild)``.
    * Multiply contributions across consecutive reels until a reel contains
      neither *S* nor Wild (chain broken).
    * ``total_ways = ∏ reel_contributions``
    * ``win = paytable[(kind, S)] × total_ways``

    Only symbols that appear on reel 0 can begin a win (Wild-only reel 0 does
    not start wins for symbols absent from reel 0).  This mirrors the SDK
    ``Ways.get_ways_data()`` behaviour exactly.

    Examples
    --------
    ::

        board = [
            ["H1", "S",  "L2", "L1"],   # reel 0
            ["H1", "W",  "S",  "M2"],   # reel 1: H1 + Wild → contribution = 2
            ["H1", "M3", "S",  "L2"],   # reel 2
            ["L3", "M1", "H2", "L1"],   # reel 3: no H1, no Wild → chain breaks
            ["L2", "M2", "H1", "L3"],   # reel 4: H1 here but unreachable
        ]
        result = evaluate_ways_to_win(board, PAYTABLE)
        # → [{"symbol": "H1", "count": 3, "payout_multiplier": 50.0, ...}]
        #   ways = 1×2×1 = 2;  win = 25.0 × 2 = 50.0×
    """
    num_reels = len(board)

    # -- Pre-compute Wild positions per reel -----------------------------------
    # Stored as a list of position-dicts so they can be appended directly to the
    # winning positions list without further filtering.
    wild_by_reel: List[List[dict]] = [
        [{"reel": reel, "row": row}
         for row, sym in enumerate(board[reel])
         if sym == wild_symbol]
        for reel in range(num_reels)
    ]

    # -- Identify regular symbols present on reel 0 ----------------------------
    # Wilds on reel 0 are excluded: they contribute to OTHER symbols' wins but
    # never start an independent win (no Wild entry in the paytable).
    reel0_symbols = {sym for sym in board[0] if sym != wild_symbol}

    wins: List[dict] = []

    for symbol in reel0_symbols:
        kind      = 0   # number of consecutive contributing reels
        ways      = 1   # product of per-reel contributions
        positions: List[dict] = []

        for reel in range(num_reels):
            # Regular-symbol positions on this reel
            sym_pos = [
                {"reel": reel, "row": row}
                for row, sym in enumerate(board[reel])
                if sym == symbol
            ]

            # Reel contribution = matching regular symbols + wilds
            reel_count = len(sym_pos) + len(wild_by_reel[reel])

            if reel_count == 0:
                break   # chain broken — no further reels contribute

            kind      += 1
            ways      *= reel_count
            positions.extend(sym_pos)
            positions.extend(wild_by_reel[reel])

        # Only record a win if the (kind, symbol) key exists in the paytable
        # (requires at least 3 contributing reels with a valid paytable entry)
        if (kind, symbol) in paytable:
            payout_per_way = paytable[(kind, symbol)]
            total_payout   = round(payout_per_way * ways, 2)
            wins.append(
                {
                    "symbol":            symbol,
                    "count":             kind,
                    "payout_multiplier": total_payout,
                    "positions":         positions,
                }
            )

    return wins


# -----------------------------------------------------------------------------


def check_scatter(
    board: List[List[str]],
    scatter_symbol: str = "S",
) -> dict:
    """
    Count scatter symbols anywhere on the board and return the multiplier award.

    The scatter is **stateless**: it pays a fixed total-bet multiplier on the
    spin it lands and never triggers a free-spin round.  Counts below 3 yield
    no award (``multiplier = 0``).

    Parameters
    ----------
    board : list[list[str]]
        ``board[reel][row]`` — 5 reels, 4 rows each.
    scatter_symbol : str
        Symbol name for the Scatter (default ``"S"``).

    Returns
    -------
    dict ::

        {
            "count":      int,  # total scatter symbols on board  (0 – 5)
            "multiplier": int,  # total-bet multiplier to award
                                # 0  if count < 3
                                # 5  if count == 3
                                # 15 if count == 4
                                # 50 if count == 5
        }

    Multiplier table
    ----------------
    The values match the scatter bonus described in README.md and the
    ``scatter_multiplier_table`` stored in ``GameConfig``.

    Examples
    --------
    ::

        check_scatter(board_with_3_scatters)
        # → {"count": 3, "multiplier": 5}

        check_scatter(board_with_2_scatters)
        # → {"count": 2, "multiplier": 0}

        check_scatter(board_with_5_scatters)
        # → {"count": 5, "multiplier": 50}
    """
    count = sum(
        1
        for reel in board
        for sym  in reel
        if sym == scatter_symbol
    )

    return {
        "count":      count,
        "multiplier": _SCATTER_MULTIPLIER_TABLE.get(count, 0),
    }


# -----------------------------------------------------------------------------


def build_events(
    board: List[List[str]],
    line_wins: List[dict],
    scatter_result: dict,
    total_win_multiplier: float,
) -> List[dict]:
    """
    Build an ordered list of SDK-format events describing one complete spin.

    The event schema matches the StakeEngine RGS format documented in
    ``SDK_PATTERN_ANALYSIS.md`` §4 and ``src/events/event_constants.py``.
    All monetary amounts are encoded as **centibets** (bet-multiples × 100,
    rounded to the nearest integer).

    Parameters
    ----------
    board : list[list[str]]
        ``board[reel][row]`` — raw board of symbol-name strings.
    line_wins : list[dict]
        Output of ``evaluate_ways_to_win()``.  Each entry has keys
        ``symbol``, ``count``, ``payout_multiplier``, ``positions``.
    scatter_result : dict
        Output of ``check_scatter()``.  Keys: ``count``, ``multiplier``.
    total_win_multiplier : float
        Total spin payout in bet-multiples (ways wins + scatter win combined).
        Example: 55.0 for a 55× win.  Used for ``setTotalWin`` / ``finalWin``.

    Returns
    -------
    list[dict]
        Zero-indexed ordered event sequence.  Events are:

        ==================  ==================================================
        Event type          Emitted when
        ==================  ==================================================
        ``reveal``          Always (index 0)
        ``winInfo``         line_wins is non-empty
        ``setWin``          After ways win (if any) and/or after scatter win
        ``scatterInfo``     scatter_result["multiplier"] > 0  (custom event)
        ``setTotalWin``     Always
        ``finalWin``        Always (last event)
        ==================  ==================================================

        ``scatterInfo`` is a game-level extension not in the base SDK
        ``EventConstants``; the front end must handle it separately.

    Amount encoding
    ---------------
    *   All amounts → ``int(round(value * 100))``
    *   ``total_win_multiplier`` 55.0 → 5500 centibets
    *   Scatter 5× → 500 centibets
    *   Ways win 50.0× → 5000 centibets

    Event detail
    ------------
    ``reveal``
        Board as ``[[{"name": sym}, ...], ...]``.  ``gameType`` fixed to
        ``"basegame"`` (Future Spinner has no free-spin round).

    ``winInfo``
        ``totalWin`` in centibets; ``wins`` array mirrors SDK
        ``Ways.get_ways_data()`` output with ``kind`` (== ``count``),
        ``win`` in centibets, ``positions``, and ``meta`` sub-dict.

    ``setWin``
        Running spin-win ticker after the most recent award.  After ways: ways
        total only.  After scatter: full ways + scatter total.

    ``scatterInfo``
        Custom scatter event — ``count``, ``multiplier`` (raw bet-multiple),
        ``win`` in centibets, ``positions`` of all scatter symbols on board.

    ``setTotalWin`` / ``finalWin``
        Both use ``total_win_multiplier`` converted to centibets.
    """
    events: List[dict] = []
    idx = 0

    # -- 1. reveal -------------------------------------------------------------
    board_client = [
        [{"name": sym} for sym in reel]
        for reel in board
    ]
    events.append(
        {
            "index":    idx,
            "type":     "reveal",
            "board":    board_client,
            "gameType": "basegame",
        }
    )
    idx += 1

    # -- 2. winInfo + setWin (ways wins) ---------------------------------------
    if line_wins:
        # Convert each win to SDK winInfo format:
        #   count → kind  (SDK uses "kind", standalone uses "count")
        #   payout_multiplier (float bet-multiple) → win (int centibets)
        wins_sdk = [
            {
                "symbol":    w["symbol"],
                "kind":      w["count"],
                "win":       int(round(w["payout_multiplier"] * 100)),
                "positions": w["positions"],
                "meta": {
                    # 'ways' mirrors SDK Ways meta; here it equals the
                    # total ways count (= payout_multiplier / paytable_unit)
                    "ways":           w["count"],
                    "globalMult":     1,
                    "winWithoutMult": int(round(w["payout_multiplier"] * 100)),
                    "symbolMult":     0,
                },
            }
            for w in line_wins
        ]
        ways_total_centibets = sum(e["win"] for e in wins_sdk)

        events.append(
            {
                "index":    idx,
                "type":     "winInfo",
                "totalWin": ways_total_centibets,
                "wins":     wins_sdk,
            }
        )
        idx += 1

        # setWin — shows running spin-win after ways evaluation only
        events.append(
            {
                "index":    idx,
                "type":     "setWin",
                "amount":   ways_total_centibets,
                "winLevel": "standard",
            }
        )
        idx += 1

    # -- 3. scatterInfo + setWin (scatter award) -------------------------------
    if scatter_result["multiplier"] > 0:
        # Gather scatter symbol positions directly from the board string grid.
        # (The board uses "S" as the scatter symbol name.)
        scatter_positions = [
            {"reel": reel, "row": row}
            for reel, reel_syms in enumerate(board)
            for row,  sym      in enumerate(reel_syms)
            if sym == "S"
        ]
        scatter_centibets = scatter_result["multiplier"] * 100  # int × int

        # Custom event type — not in SDK EventConstants; front end must handle.
        events.append(
            {
                "index":      idx,
                "type":       "scatterInfo",
                "count":      scatter_result["count"],
                "multiplier": scatter_result["multiplier"],
                "win":        scatter_centibets,
                "positions":  scatter_positions,
            }
        )
        idx += 1

        # setWin — updated total after scatter is added (ways + scatter)
        total_centibets = int(round(total_win_multiplier * 100))
        events.append(
            {
                "index":    idx,
                "type":     "setWin",
                "amount":   total_centibets,
                "winLevel": "standard",
            }
        )
        idx += 1

    # -- 4. setTotalWin --------------------------------------------------------
    # Always emitted; amount may be 0 for a losing spin.
    total_centibets = int(round(total_win_multiplier * 100))
    events.append(
        {
            "index":  idx,
            "type":   "setTotalWin",
            "amount": total_centibets,
        }
    )
    idx += 1

    # -- 5. finalWin -----------------------------------------------------------
    events.append(
        {
            "index":  idx,
            "type":   "finalWin",
            "amount": total_centibets,
        }
    )

    return events


# -----------------------------------------------------------------------------


def calculate_total_payout(
    line_wins: List[dict],
    scatter_result: dict,
) -> int:
    """
    Calculate total spin payout in centibets using integer arithmetic only.

    Parameters
    ----------
    line_wins : list[dict]
        Output of ``evaluate_ways_to_win()``.  Each entry must have a
        ``"payout_multiplier"`` key (float, bet-multiples).
    scatter_result : dict
        Output of ``check_scatter()``.  Must have a ``"multiplier"`` key
        (int, bet-multiples: 0, 5, 15, or 50).

    Returns
    -------
    int
        Total payout in **centibets** (bet-multiples × 100).

        Examples::

            50.0× ways + 5× scatter  → 5000 + 500  = 5500
             0.0× ways + 0× scatter  →    0 +   0  =    0
             1.5× ways + 0× scatter  →  150 +   0  =  150
            25.0× ways + 15× scatter → 2500 + 1500 = 4000

    Algorithm
    ---------
    1. Each line win's ``payout_multiplier`` (float) is individually converted
       to centibets via ``int(round(payout_multiplier × 100))``.  Rounding
       per-win before summing minimises cumulative floating-point error while
       keeping all addition in integer space.
    2. The scatter multiplier is already an integer; centibets = multiplier × 100
       (pure integer multiplication, no floating-point involved).
    3. Both integer quantities are added with standard Python integer addition.

    No floating-point addition is performed after the per-win conversion step.

    Note
    ----
    The wincap (5,000× bet) is **not** applied here; it is enforced upstream by
    the SDK's ``WinManager`` and ``update_final_win()`` in the simulation
    pipeline.
    """
    # Step 1: convert each ways win to centibets individually, then sum integers
    line_centibets: int = sum(
        int(round(w["payout_multiplier"] * 100))
        for w in line_wins
    )

    # Step 2: scatter multiplier is an integer; × 100 is integer multiplication
    scatter_centibets: int = scatter_result["multiplier"] * 100

    # Step 3: integer addition only
    return line_centibets + scatter_centibets


# ═════════════════════════════════════════════════════════════════════════════
# LAYER 2 — SDK-compatible GameCalculation class
# ═════════════════════════════════════════════════════════════════════════════


class GameCalculation(Executables):
    """
    Core spin calculation layer for Future Spinner.

    Inherits universal executable methods from the SDK's ``Executables`` base
    class and provides two instance methods that drive each spin:

    * ``evaluate_ways_board()``         — ways-to-win evaluation via SDK
    * ``evaluate_scatter_multiplier()`` — stateless scatter multiplier

    The standalone functions in this module (``evaluate_ways_to_win`` etc.)
    implement the same mathematics without SDK state and are used for testing
    and verification via the ``__main__`` block below.

    Inheritance chain (bottom-up)
    ------------------------------
    ::

        GeneralGameState → Conditions → Board → Tumble → Executables
            → GameCalculation → GameState

    Win type
    --------
    Ways-to-win: 5 reels × 4 rows = 4⁵ = 1,024 ways.

    Bonus
    -----
    Instant scatter multiplier — stateless, no free-spin state:
        3 S → 5×  total bet
        4 S → 15× total bet
        5 S → 50× total bet
    """

    def evaluate_ways_board(self) -> None:
        """
        Evaluate ways-to-win wins on the current board, record results, and emit
        the corresponding SDK events.

        Uses the SDK ``Ways`` static helper, which works on the full SDK
        ``Symbol`` object board (``self.board``) and resolves wild substitution,
        symbol multipliers, and positional metadata internally.

        Flow
        ----
        1. ``Ways.get_ways_data()``     — compute all ways wins; returns
           ``{"totalWin": float, "wins": [...]}`` in bet-multiples.
        2. If totalWin > 0:
           * ``Ways.record_ways_wins()`` — register in force-file recorder for
             the optimiser.
           * ``win_manager.update_spinwin()`` — add to ``spin_win`` and
             ``running_bet_win`` simultaneously.
        3. ``Ways.emit_wayswin_events()`` — emit ``winInfo`` → ``evaluate_wincap``
           → ``setWin`` → ``setTotalWin`` events (``setTotalWin`` is emitted
           unconditionally, even on a zero-win board, to keep the client's
           running total in sync).

        Note
        ----
        ``running_bet_win`` is updated inside ``update_spinwin()`` so that
        ``setTotalWin`` reflects the current spin total at emission time.
        """
        self.win_data = Ways.get_ways_data(self.config, self.board)
        if self.win_data["totalWin"] > 0:
            Ways.record_ways_wins(self)
            self.win_manager.update_spinwin(self.win_data["totalWin"])
        Ways.emit_wayswin_events(self)

    def evaluate_scatter_multiplier(self) -> None:
        """
        Award the instant scatter multiplier win and emit the corresponding events.

        Design
        ------
        The scatter (S) is fully **stateless**: it pays a fixed bet-multiplier
        the moment it lands and never triggers a free-spin round.  This method
        is called after ``evaluate_ways_board()`` on every spin.

        Scatter multiplier table (from ``GameConfig.scatter_multiplier_table``):

        ========= =============
        Scatters  Award
        ========= =============
        0 – 2     No award
        3         5×  total bet
        4         15× total bet
        5         50× total bet
        ========= =============

        ``triggered_freegame`` and ``force_freegame``
        ----------------------------------------------
        Distributions with ``criteria="scatter"`` are configured with
        ``force_freegame=True`` in ``GameConfig``.  ``check_repeat()`` sets
        ``repeat=True`` if ``triggered_freegame`` is still ``False`` at loop
        exit.  To prevent infinite resampling:

        * ``self.triggered_freegame = True`` is set **before** any early return,
          as soon as a qualifying scatter count (≥ 3) is detected.
        * This flag is set even when ``wincap_triggered`` prevents an actual win.

        Wincap guard
        ------------
        If ``evaluate_ways_board()`` already pushed the running total to
        wincap, no additional win is awarded.  ``triggered_freegame`` and the
        force-file record are both still set for correctness.

        Event flow (scatter win awarded, wincap not pre-triggered)
        -----------------------------------------------------------
        ::

            winInfo      ← scatter win breakdown (custom positions + amount)
            [wincap]     ← only if this scatter win hits the cap
            setWin       ← cumulative spin_win (skipped if wincap)
            setTotalWin  ← running_bet_win (ways + scatter combined)
        """
        scatter_count = self.count_special_symbols("scatter")

        # Counts 0-2: no qualifying scatter — return with no side-effects.
        # Non-scatter criteria use force_freegame=False so triggered_freegame
        # is irrelevant; scatter criteria always force ≥3 scatter symbols via
        # draw_board(), so this branch is only reached for criteria "wincap",
        # "0", and "basegame" when random scatter happen to land at low counts.
        if scatter_count not in self.config.scatter_multiplier_table:
            return

        # -- Must set triggered_freegame BEFORE any further early return --------
        # Satisfies check_repeat()'s force_freegame guard for scatter criteria.
        self.triggered_freegame = True

        # -- Record for force file / optimiser ---------------------------------
        # Always record regardless of wincap state so the optimiser sees the
        # true scatter-count distribution without gaps from early exits.
        self.record(
            {
                "kind":     scatter_count,
                "symbol":   "scatter",
                "gametype": self.gametype,
            }
        )

        # -- Wincap guard ------------------------------------------------------
        # triggered_freegame and the force-file record are both set above.
        if self.wincap_triggered:
            return

        # -- Award scatter win -------------------------------------------------
        # Multiplier is an integer (5, 15, or 50) expressed in bet-multiples.
        # In SDK terms: 1.0 cost-unit == 1.0 bet-unit, so multiplier == win.
        multiplier   = self.config.scatter_multiplier_table[scatter_count]
        scatter_win  = float(multiplier)

        # Build win_data in the shape win_info_event() expects.
        # positions come from special_syms_on_board (populated by draw_board).
        # The +1 row padding offset is applied inside win_info_event() automatically.
        scatter_positions = list(self.special_syms_on_board["scatter"])
        self.win_data = {
            "totalWin": scatter_win,
            "wins": [
                {
                    "symbol":   "S",
                    "kind":     scatter_count,
                    "win":      scatter_win,
                    "positions": scatter_positions,
                    "meta": {
                        # Reuse "ways" key with scatter count for event-schema
                        # consistency with the ways-win meta shape.
                        "ways":           scatter_count,
                        "globalMult":     1,
                        "winWithoutMult": scatter_win,
                        "symbolMult":     0,
                    },
                }
            ],
        }

        # Accumulate into spin_win AND running_bet_win simultaneously.
        # After this call, set_total_event() will reflect ways + scatter total.
        self.win_manager.update_spinwin(scatter_win)

        # Emit the scatter win event sequence
        win_info_event(self)     # winInfo     — scatter win positions + amount
        self.evaluate_wincap()   # [wincap]    — emitted only if now triggered
        set_win_event(self)      # setWin      — cumulative spin_win (skipped if wincap)
        set_total_event(self)    # setTotalWin — running bet win (ways + scatter)


# ═════════════════════════════════════════════════════════════════════════════
# __main__ — self-contained test block
# ═════════════════════════════════════════════════════════════════════════════
#
# Run directly:
#   python game_executables/game_calculation.py
#
# No SDK imports required — only the four standalone functions are exercised.
# ═════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":

    # -- Paytable --------------------------------------------------------------
    # Mirrors GameConfig.paytable.  Values are per-way bet-multiples.
    PAYTABLE = {
        # H1 Spinning Rim
        (5, "H1"): 400.0, (4, "H1"): 100.0, (3, "H1"):  25.0,
        # H2 Turbocharger
        (5, "H2"): 200.0, (4, "H2"):  60.0, (3, "H2"):  15.0,
        # M1 Car Grille
        (5, "M1"): 100.0, (4, "M1"):  30.0, (3, "M1"):   8.0,
        # M2 Exhaust Pipe
        (5, "M2"):  70.0, (4, "M2"):  20.0, (3, "M2"):   6.0,
        # M3 Steering Wheel
        (5, "M3"):  40.0, (4, "M3"):  12.0, (3, "M3"):   4.0,
        # L1 Lug Nut
        (5, "L1"):  25.0, (4, "L1"):   8.0, (3, "L1"):   3.0,
        # L2 Spark Plug
        (5, "L2"):  15.0, (4, "L2"):   5.0, (3, "L2"):   2.0,
        # L3 Piston
        (5, "L3"):  12.0, (4, "L3"):   4.0, (3, "L3"):   1.5,
    }

    # -- Test board ------------------------------------------------------------
    #
    # board[reel][row] - 5 reels, 4 rows.  Visual layout (top row = row 0):
    #
    #   Row 0 | H1   H1   H1   L3   L2
    #   Row 1 |  S    W   M3   M1   M2
    #   Row 2 | L2    S    S   H2   H1
    #   Row 3 | L1   M2   L2   L1   L3
    #
    # Expected ways wins
    # ------------------
    #   H1 (kind=3):
    #       reel 0 -> 1 H1 + 0 W = 1
    #       reel 1 -> 1 H1 + 1 W = 2  (Wild on row 1 adds to reel contribution)
    #       reel 2 -> 1 H1 + 0 W = 1
    #       reel 3 -> 0 H1 + 0 W = 0  (chain breaks here)
    #       ways = 1 x 2 x 1 = 2
    #       win  = paytable[(3, "H1")] x 2 = 25.0 x 2 = 50.0x
    #
    #   L2 (kind=3):
    #       reel 0 -> 1 L2 + 0 W = 1  (L2 on row 2)
    #       reel 1 -> 0 L2 + 1 W = 1  (no L2, but Wild on row 1 bridges the gap)
    #       reel 2 -> 1 L2 + 0 W = 1  (L2 on row 3)
    #       reel 3 -> 0 L2 + 0 W = 0  (chain breaks here)
    #       ways = 1 x 1 x 1 = 1
    #       win  = paytable[(3, "L2")] x 1 = 2.0 x 1 = 2.0x
    #
    # Expected scatter
    # ----------------
    #   S count: reel0/row1=1, reel1/row2=1, reel2/row2=1 -> total = 3
    #   multiplier = 5x
    #
    # Expected totals
    # ---------------
    #   H1 win:      50.0x  ->  5000 centibets
    #   L2 win:       2.0x  ->   200 centibets
    #   Ways total:  52.0x  ->  5200 centibets
    #   Scatter win:  5.0x  ->   500 centibets
    #   Grand total: 57.0x  ->  5700 centibets

    TEST_BOARD = [
        ["H1", "S",  "L2", "L1"],  # reel 0
        ["H1", "W",  "S",  "M2"],  # reel 1  (Wild on row 1)
        ["H1", "M3", "S",  "L2"],  # reel 2
        ["L3", "M1", "H2", "L1"],  # reel 3  (no H1 / no Wild → chain breaks)
        ["L2", "M2", "H1", "L3"],  # reel 4  (H1 present but unreachable)
    ]

    SEP = "-" * 60

    # -- Step 1: evaluate ways-to-win ------------------------------------------
    print(SEP)
    print("STEP 1 - evaluate_ways_to_win()")
    print(SEP)
    line_wins = evaluate_ways_to_win(TEST_BOARD, PAYTABLE, wild_symbol="W")
    if line_wins:
        for w in line_wins:
            print(
                f"  {w['symbol']} x{w['count']}  |  "
                f"kind={w['count']}  |  "
                f"payout={w['payout_multiplier']}x  |  "
                f"positions={w['positions']}"
            )
    else:
        print("  (no ways wins)")

    # -- Step 2: check scatter -------------------------------------------------
    print()
    print(SEP)
    print("STEP 2 - check_scatter()")
    print(SEP)
    scatter_result = check_scatter(TEST_BOARD, scatter_symbol="S")
    print(
        f"  count={scatter_result['count']}  "
        f"multiplier={scatter_result['multiplier']}x"
    )

    # -- Step 3: calculate total payout ----------------------------------------
    print()
    print(SEP)
    print("STEP 3 - calculate_total_payout()")
    print(SEP)
    total_centibets     = calculate_total_payout(line_wins, scatter_result)
    total_multiplier    = total_centibets / 100          # for display only
    print(f"  {total_centibets} centibets  ({total_multiplier}x bet)")

    # -- Step 4: build events --------------------------------------------------
    print()
    print(SEP)
    print("STEP 4 - build_events()")
    print(SEP)
    events = build_events(
        board                = TEST_BOARD,
        line_wins            = line_wins,
        scatter_result       = scatter_result,
        total_win_multiplier = total_multiplier,
    )
    print(f"  {len(events)} events generated:")
    for ev in events:
        ev_type = ev["type"]
        if ev_type == "reveal":
            print(f"  [{ev['index']}] {ev_type:<14} gameType={ev['gameType']}")
        elif ev_type == "winInfo":
            syms = ", ".join(f"{w['symbol']}x{w['kind']}" for w in ev["wins"])
            print(f"  [{ev['index']}] {ev_type:<14} totalWin={ev['totalWin']} centibets  wins=[{syms}]")
        elif ev_type == "scatterInfo":
            print(
                f"  [{ev['index']}] {ev_type:<14} count={ev['count']}  "
                f"multiplier={ev['multiplier']}x  win={ev['win']} centibets"
            )
        elif ev_type in ("setWin", "setTotalWin", "finalWin"):
            print(f"  [{ev['index']}] {ev_type:<14} amount={ev['amount']} centibets")
        else:
            print(f"  [{ev['index']}] {ev_type}")

    # -- Step 5: full events JSON ----------------------------------------------
    print()
    print(SEP)
    print("STEP 5 - Full events JSON")
    print(SEP)
    print(json.dumps(events, indent=2))

    # -- Step 6: assertions ----------------------------------------------------
    print()
    print(SEP)
    print("STEP 6 - Assertions")
    print(SEP)

    # ---- ways wins -----------------------------------------------------------
    # Board produces two wins:
    #   H1 x3: reels 0-1-2, ways=2 (Wild on reel 1 doubles contribution), win=50.0x
    #   L2 x3: reels 0-1-2, ways=1 (Wild on reel 1 bridges the gap),       win= 2.0x
    wins_by_symbol = {w["symbol"]: w for w in line_wins}
    assert len(line_wins) == 2,                           "Expected 2 ways wins (H1 and L2)"
    assert "H1" in wins_by_symbol,                        "Expected H1 win"
    assert "L2" in wins_by_symbol,                        "Expected L2 win (bridged by Wild)"
    assert wins_by_symbol["H1"]["count"]             == 3,    "H1 kind must be 3"
    assert wins_by_symbol["H1"]["payout_multiplier"] == 50.0, "H1 win: 25.0 x 2 ways = 50.0x"
    assert wins_by_symbol["L2"]["count"]             == 3,    "L2 kind must be 3"
    assert wins_by_symbol["L2"]["payout_multiplier"] == 2.0,  "L2 win: 2.0 x 1 way  =  2.0x"

    # ---- scatter -------------------------------------------------------------
    assert scatter_result["count"]      == 3,            "Expected 3 scatter symbols"
    assert scatter_result["multiplier"] == 5,            "Expected 5x multiplier for 3 scatters"

    # ---- total payout --------------------------------------------------------
    # 5000 (H1) + 200 (L2) + 500 (scatter) = 5700 centibets
    assert total_centibets == 5700,                      "Expected 5700 centibets"
    assert isinstance(total_centibets, int),             "calculate_total_payout must return int"

    # ---- event structure -----------------------------------------------------
    event_types = [ev["type"] for ev in events]
    assert event_types[0]  == "reveal",                  "First event must be reveal"
    assert event_types[-1] == "finalWin",                "Last event must be finalWin"
    assert "winInfo"     in event_types,                 "winInfo must be present"
    assert "scatterInfo" in event_types,                 "scatterInfo must be present"
    assert "setTotalWin" in event_types,                 "setTotalWin must be present"

    # ---- event amounts -------------------------------------------------------
    final_ev   = next(ev for ev in events if ev["type"] == "finalWin")
    total_ev   = next(ev for ev in events if ev["type"] == "setTotalWin")
    scatter_ev = next(ev for ev in events if ev["type"] == "scatterInfo")
    assert final_ev["amount"]       == 5700,             "finalWin must be 5700 centibets"
    assert total_ev["amount"]       == 5700,             "setTotalWin must be 5700 centibets"
    assert scatter_ev["win"]        == 500,              "scatter win must be 500 centibets (5x100)"
    assert scatter_ev["count"]      == 3,                "scatter event count must be 3"
    assert scatter_ev["multiplier"] == 5,                "scatter event multiplier must be 5"

    # ---- index continuity ----------------------------------------------------
    for i, ev in enumerate(events):
        assert ev["index"] == i,                         f"Event index mismatch at position {i}"

    print("  All assertions passed.")
    print()
    print("  Summary:")
    print(f"    H1 ways win : {wins_by_symbol['H1']['payout_multiplier']}x  (kind=3, 2 ways)")
    print(f"    L2 ways win : {wins_by_symbol['L2']['payout_multiplier']}x  (kind=3, 1 way via Wild)")
    print(f"    Scatter win : {scatter_result['multiplier']}x  ({scatter_result['count']} scatters)")
    print(f"    Total       : {total_centibets} centibets  ({total_multiplier}x bet)")
    print()
