# File: gamestate.py
# Game: Future Spinner by We Roll Spinners
# Purpose: GameState class driving per-round simulation for the OVERDRIVE FREE
#          SPINS feature. Implements the standard SDK ways + freegame flow.
#
# Round flow (SDK pipeline, run_spin(sim, seed))
# ----------------------------------------------
#   reset_book -> draw base board -> evaluate base ways (Overdrive meter = 1x)
#   -> pay instant scatter award (1x/3x/10x at meter 1x) -> assign base wins
#   -> if 3+ scatters: run the Overdrive free-spin round
#   -> finalWin (capped at 5,000x) -> check criteria -> imprint.
#
# Free-spin round (run_freespin)
# ------------------------------
#   The Overdrive meter starts at 1x. For each of the awarded spins: draw a
#   free-game board, evaluate ways and the instant scatter award BOTH multiplied
#   by the current meter, retrigger +5 spins on 3+ scatters, then, if the spin
#   won anything, raise the meter by +1x for all subsequent spins. The meter
#   never resets during the round and is not retroactive. The round stops early
#   if the 5,000x cap is reached.

from game_executables.game_calculation import GameCalculation


class GameState(GameCalculation):
    """
    Per-round simulation controller for Future Spinner (Overdrive Free Spins).

    Inheritance: GeneralGameState -> Conditions -> Board -> Tumble ->
    Executables -> GameCalculation -> GameState.
    """

    def assign_special_sym_function(self) -> None:
        """No per-symbol creation callbacks. The Overdrive multiplier is a
        game-level (global) multiplier, not a symbol attribute, so Wild carries
        no multiplier property and this map is intentionally empty."""
        self.special_symbol_functions = {}

    def _overdrive_start_meter(self) -> int:
        """Starting Overdrive meter for the current bet mode. The super buy
        pre-revs to 5x; every other mode starts at 1x. Stateless: applied at the
        feature start each round, reset to 1 by reset_book every round."""
        try:
            name = self.get_current_betmode().get_name()
        except Exception:
            return 1
        return 5 if name == "super" else 1

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

            # Base ways wins (Overdrive meter is 1x in the base game).
            self.evaluate_ways_board()

            # Instant scatter award (1x/3x/10x total bet), meter 1x in base game.
            self.evaluate_scatter_multiplier()

            # Roll the base spin win into the base-game bucket.
            self.win_manager.update_gametype_wins(self.gametype)

            # Trigger the Overdrive free spins if enough scatters landed.
            if self.check_fs_condition() and self.check_freespin_entry():
                self.run_freespin_from_base()

            # Final payout (capped at wincap) and criteria check.
            self.evaluate_finalwin()
            self.check_repeat()

        self.imprint_wins()

    def run_freespin(self) -> None:
        """Run the Overdrive free-spin round with a progressive win multiplier."""
        # reset_fs_spin: gametype -> freegame, fs -> 0, triggered_freegame True,
        # spin win reset. The Overdrive meter (global_multiplier) was set to 1 by
        # reset_book and is deliberately NOT reset here, so it starts at 1x and
        # persists across the round.
        self.reset_fs_spin()

        # Super buy pre-revs the Overdrive meter to its starting value so every
        # free spin is multiplied from the first (stateless; reset_book returns
        # it to 1 each round). Base/bonus start at 1x.
        _start_meter = self._overdrive_start_meter()
        if _start_meter > 1:
            self.global_multiplier = _start_meter

        while self.fs < self.tot_fs:
            self.update_freespin()          # advance spin counter, reset spin win

            self.draw_board(emit_event=True)

            # Ways wins multiplied by the current Overdrive meter.
            self.evaluate_ways_board()

            # Instant scatter award multiplied by the current Overdrive meter.
            self.evaluate_scatter_multiplier()

            # Retrigger: 3+ scatters award a flat +5 spins.
            if self.check_fs_condition():
                self.update_fs_retrigger_amt()

            # Roll this spin's win into the free-game bucket.
            self.win_manager.update_gametype_wins(self.gametype)

            # Stop the round immediately if the win cap was reached this spin.
            if self.wincap_triggered:
                break

            # Overdrive meter climbs by +1x after every WINNING free spin. This
            # applies from the NEXT spin onward (not retroactive).
            if self.win_manager.spin_win > 0:
                self.update_global_mult()

        self.end_freespin()
