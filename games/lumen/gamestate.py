# File: gamestate.py
# Game: Lumen by We Roll Spinners
# Purpose: GameState class driving per-round simulation for the GLOW METER FREE
#          SPINS feature. Implements the standard SDK ways + freegame flow with a
#          progressive multiplier fed by BOTH winning spins AND L3 "glow orbs".
#
# Round flow (SDK pipeline, run_spin(sim, seed))
# ----------------------------------------------
#   reset_book (Glow Meter = 1x) -> draw base board -> evaluate base ways
#   (meter = 1x) -> pay instant scatter award (1x/3x/10x at meter 1x) -> assign
#   base wins -> if 3+ scatters: run the Glow free-spin round -> finalWin
#   (capped at 10,000x) -> check criteria -> imprint.
#
# Free-spin round (run_freespin)
# ------------------------------
#   The Glow Meter starts at 1x. For each awarded spin: draw a free-game board,
#   evaluate ways and the instant scatter award BOTH multiplied by the current
#   meter, retrigger +5 spins on 3+ scatters, then raise the meter for all
#   SUBSEQUENT spins by:
#       (a) +1x if the spin won anything, PLUS
#       (b) +N where N = the number of L3 "glow orbs" on that free-spin board.
#   The meter never resets during the round and is not retroactive. The round
#   stops early if the 10,000x cap is reached. The whole feature resolves inside
#   ONE stateless book round (meter is set to 1 in reset_book, never reset here).

from game_executables.game_calculation import GameCalculation
from src.events.events import update_global_mult_event

_GLOW_SYMBOL = "L3"  # the "glow orb" low symbol that feeds the Glow Meter


class GameState(GameCalculation):
    """
    Per-round simulation controller for Lumen (Glow Meter Free Spins).

    Inheritance: GeneralGameState -> Conditions -> Board -> Tumble ->
    Executables -> GameCalculation -> GameState.
    """

    def assign_special_sym_function(self) -> None:
        """No per-symbol creation callbacks. The Glow Meter is a game-level
        (global) multiplier, not a symbol attribute, so Wild carries no
        multiplier property and this map is intentionally empty."""
        self.special_symbol_functions = {}

    def run_spin(self, sim, simulation_seed=None) -> None:
        """Execute one full base round, entering free spins on a 3+ scatter trigger."""
        self.reset_seed(sim, simulation_seed)
        self.repeat = True
        while self.repeat:
            self.reset_book()

            # Base reveal. Forced-trigger criteria ("freegame"/"wincap") place
            # 3/4/5 scatters; non-forced criteria ("0"/"basegame") resample away
            # any board with 3+ scatters, so they never trigger the feature.
            self.draw_board(emit_event=True)

            # Base ways wins (Glow Meter is 1x in the base game).
            self.evaluate_ways_board()

            # Instant scatter award (1x/3x/10x total bet), meter 1x in base game.
            self.evaluate_scatter_multiplier()

            # Roll the base spin win into the base-game bucket.
            self.win_manager.update_gametype_wins(self.gametype)

            # Trigger the Glow free spins if enough scatters landed.
            if self.check_fs_condition() and self.check_freespin_entry():
                self.run_freespin_from_base()

            # Final payout (capped at wincap) and criteria check.
            self.evaluate_finalwin()
            self.check_repeat()

        self.imprint_wins()

    def update_glow_meter(self, spin_win: float) -> None:
        """Raise the Glow Meter for all SUBSEQUENT free spins.

        The meter climbs by two sources evaluated on the free-spin board that
        was just resolved (applied from the NEXT spin onward, never retroactive):
            (a) +1 if this spin won anything (the Overdrive behaviour), PLUS
            (b) +N where N = the number of L3 "glow orbs" on this board.
        L3 still pays as a normal L3 in the ways evaluation above; the count here
        is an independent board scan (like count_special_symbols). A single
        update_global_mult event is emitted with the new meter value so the
        increment is fully auditable from the book.
        """
        glow_orbs = self.count_symbols_on_board(_GLOW_SYMBOL)
        win_bump = 1 if spin_win > 0 else 0
        increment = glow_orbs + win_bump
        if increment > 0:
            self.global_multiplier += increment
            update_global_mult_event(self)

    def run_freespin(self) -> None:
        """Run the Glow free-spin round with a progressive win multiplier."""
        # reset_fs_spin: gametype -> freegame, fs -> 0, triggered_freegame True,
        # spin win reset. The Glow Meter (global_multiplier) was set to 1 by
        # reset_book and is deliberately NOT reset here, so it starts at 1x and
        # persists across the round.
        self.reset_fs_spin()

        while self.fs < self.tot_fs:
            self.update_freespin()          # advance spin counter, reset spin win

            self.draw_board(emit_event=True)

            # Ways wins multiplied by the current Glow Meter.
            self.evaluate_ways_board()

            # Instant scatter award multiplied by the current Glow Meter.
            self.evaluate_scatter_multiplier()

            # Retrigger: 3+ scatters award a flat +5 spins.
            if self.check_fs_condition():
                self.update_fs_retrigger_amt()

            # Roll this spin's win into the free-game bucket.
            self.win_manager.update_gametype_wins(self.gametype)

            # Stop the round immediately if the win cap was reached this spin.
            if self.wincap_triggered:
                break

            # Glow Meter climbs after every free spin from TWO sources: +1 for a
            # winning spin AND +1 per L3 "glow orb" on the board. Applies from
            # the NEXT spin onward (not retroactive).
            self.update_glow_meter(self.win_manager.spin_win)

        self.end_freespin()
