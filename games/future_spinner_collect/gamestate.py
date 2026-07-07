# File: gamestate.py
# Game: Future Spinner COLLECT by We Roll Spinners
# Purpose: GameState class driving per-round simulation for the OVERDRIVE FREE
#          SPINS feature PLUS a stateless COLLECTION METER (coin-collect) bonus.
#
# This is a sibling fork of games/future_spinner (the locked base package). It
# keeps the Overdrive global-multiplier free-spin engine verbatim and layers a
# Hacksaw / Pragmatic style coin-collect mechanic on top of the free-spin round.
#
# COLLECTION METER (new, stateless)
# ---------------------------------
#   The low symbol L3 doubles as the "collect coin". Whenever an L3 lands DURING
#   FREE SPINS it carries a random cash value (a multiple of TOTAL BET, drawn
#   from GameConfig.collect_values; a 0 draw means a blank/plain L3). Every coin
#   value seen across the free-spin round ACCUMULATES into an in-round pot. At
#   the END of the free-spin round the pot is PAID OUT as part of the free-game
#   win. The pot is initialised per round in reset_book and reset every round,
#   so the whole feature resolves inside ONE stateless book round. Coin values
#   are flat multiples of total bet and are NOT scaled by the Overdrive meter.
#
# Round flow (SDK pipeline, run_spin(sim, seed))
# ----------------------------------------------
#   reset_book (Overdrive meter = 1x, collect pot = 0) -> draw base board ->
#   evaluate base ways -> instant scatter award -> assign base wins ->
#   if 3+ scatters: run the Overdrive free-spin round (accumulating the collect
#   pot) and PAY THE POT at end_freespin -> finalWin (capped at 5,000x) ->
#   check criteria -> imprint.

from game_executables.game_calculation import GameCalculation
from src.calculations.statistics import get_random_outcome


class GameState(GameCalculation):
    """
    Per-round simulation controller for Future Spinner COLLECT.

    Inheritance: GeneralGameState -> Conditions -> Board -> Tumble ->
    Executables -> GameCalculation -> GameState.
    """

    # -- Per-round state ------------------------------------------------------

    def reset_book(self) -> None:
        """Reset per-round state, then initialise the (stateless) collect pot.

        The pot starts at 0 for every book round and is only ever added to
        during that round's free spins, so no state leaks across rounds.
        """
        super().reset_book()
        self.collect_pot = 0.0

    # -- Special-symbol callbacks --------------------------------------------

    def assign_special_sym_function(self) -> None:
        """Tag each free-spin L3 with a random collect value.

        create_symbol() calls this for every L3 the moment it is drawn. Base
        L3s are left plain (no value) so the coin-collect mechanic only lives in
        free spins. The Overdrive multiplier remains a game-level global (no wild
        symbol multiplier), so the ways engine keeps using the 'global' strategy.
        """
        self.special_symbol_functions = {"L3": [self.assign_collect_value]}

    def assign_collect_value(self, symbol) -> None:
        """Assign a random collect value to an L3, free spins only.

        A 0 draw leaves the symbol plain (no 'prize' attribute), so only coins
        with a real value participate in the pot. Non-zero values are stored on
        the symbol's 'prize' attribute (a multiple of total bet).
        """
        if self.gametype != self.config.basegame_type:
            value = get_random_outcome(self.config.collect_values)
            if value > 0:
                symbol.assign_attribute({"prize": value})

    # -- Collection-meter accumulation + payout ------------------------------

    def accumulate_collect_pot(self) -> None:
        """Add every collect coin on the CURRENT free-spin board to the pot.

        Each free-spin board is redrawn, so coins from previous spins are gone;
        we simply add this spin's coin values to the running pot. Emits a
        lightweight 'collect' event recording the coins that landed and the new
        pot total (values in centibets, matching the SDK convention).
        """
        spin_coins = []
        spin_total = 0.0
        for reel, _ in enumerate(self.board):
            for row, _ in enumerate(self.board[reel]):
                sym = self.board[reel][row]
                if sym.check_attribute("prize") and sym.get_attribute("prize"):
                    value = sym.get_attribute("prize")
                    spin_total += value
                    spin_coins.append(
                        {"reel": reel, "row": row, "value": int(round(value * 100))}
                    )

        if spin_total > 0:
            self.collect_pot += spin_total
            self.book.add_event(
                {
                    "index": len(self.book.events),
                    "type": "collect",
                    "coins": spin_coins,
                    "potValue": int(round(self.collect_pot * 100)),
                }
            )

    def end_freespin(self) -> None:
        """Pay the accumulated collect pot, then emit the freegame-end event.

        The pot is booked into the free-game win bucket so base + free totals
        stay consistent with running_bet_win (the SDK asserts this in
        update_final_win). We reset the spin-win accumulator first so the last
        free spin's win (already rolled into freegame_wins inside run_freespin)
        is not double counted, add the pot via update_spinwin (which updates both
        spin_win and running_bet_win), let evaluate_wincap cap it if needed, then
        roll the pot into the freegame bucket. The final-win step caps the total
        at 5,000x.
        """
        if self.collect_pot > 0:
            self.win_manager.reset_spin_win()
            self.win_manager.update_spinwin(self.collect_pot)
            self.book.add_event(
                {
                    "index": len(self.book.events),
                    "type": "collectPayout",
                    "amount": int(round(self.collect_pot * 100)),
                }
            )
            self.evaluate_wincap()
            self.win_manager.update_gametype_wins(self.gametype)

        super().end_freespin()

    # -- Round drivers --------------------------------------------------------

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

            # Base ways wins (Overdrive meter is 1x in the base game). Base L3s
            # carry no collect value, so no pot is accrued in the base game.
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
        """Run the Overdrive free-spin round, accumulating the collect pot.

        Identical to the base Overdrive free-spin loop, with one addition: after
        each reveal we accumulate any collect coins on the board into the pot.
        The pot is paid once, at end_freespin.
        """
        # reset_fs_spin: gametype -> freegame, fs -> 0, triggered_freegame True,
        # spin win reset. The Overdrive meter (global_multiplier) was set to 1 by
        # reset_book and is deliberately NOT reset here.
        self.reset_fs_spin()

        while self.fs < self.tot_fs:
            self.update_freespin()          # advance spin counter, reset spin win

            self.draw_board(emit_event=True)

            # Ways wins multiplied by the current Overdrive meter.
            self.evaluate_ways_board()

            # Instant scatter award multiplied by the current Overdrive meter.
            self.evaluate_scatter_multiplier()

            # COLLECT: add this spin's coin values to the in-round pot.
            self.accumulate_collect_pot()

            # Retrigger: 3+ scatters award a flat +5 spins.
            if self.check_fs_condition():
                self.update_fs_retrigger_amt()

            # Roll this spin's win into the free-game bucket.
            self.win_manager.update_gametype_wins(self.gametype)

            # Stop the round immediately if the win cap was reached this spin.
            if self.wincap_triggered:
                break

            # Overdrive meter climbs by +1x after every WINNING free spin. This
            # applies from the NEXT spin onward (not retroactive). The pot pays at
            # round end, so a coin alone does not advance the meter; the meter
            # still climbs on any ways/scatter win as in the base game.
            if self.win_manager.spin_win > 0:
                self.update_global_mult()

        # Pay the accumulated collect pot as part of the free-game win.
        self.end_freespin()
