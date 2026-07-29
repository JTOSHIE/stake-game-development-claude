<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: math_source_files_win_manager
- resolved_url: https://stake-engine.com/docs/math/source-files/win-manager
- fetched: 2026-07-29
- rendered_via: headless chromium (Playwright 1.61.1), document.querySelector('main').innerText.
  A plain fetch returns only "Loading...", because the docs site is client rendered.
  The nav sidebar is chrome and is EXCLUDED: capturing document.body added about 1020
  chars of navigation to every page and would have read as a platform-wide change.
- page_title: Math Source Files Win Manager - API Documentation
- chars: 2846
- sha256: 11150305e127726892907782ce3d20494204198fef38ae6439707cf6d7614d5d
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

Wallet Manger

When a set of simulations are setup and executed through the src/state/run_sims() function, a new instance of the WinManager class is spawned. This class is responsible for tracking basegame and freegame wins for single simulation rounds (when running run_spin()), and also for cumulative win amounts for a given BetMode.

class WinManager:
    def __init__(self, base_game_mode, free_game_mode):
        self.base_game_mode = base_game_mode
        self.free_game_mode = free_game_mode

        self.total_cumulative_wins = 0
        self.cumulative_base_wins = 0
        self.cumulative_free_wins = 0

        self.running_bet_win = 0.0

        self.basegame_wins = 0.0
        self.freegame_wins = 0.0

        self.spin_win = 0.0
        self.tumble_win = 0.0

Cumulative wins

The cumulative win-amounts are useful in the terminal printouts to quickly check the RTP splits for a given multiprocessing thread. These cumulative values are updated each time a simulation is run and successfully passed, within state.imprint_wins() basegame and freegame win amounts are updated using win_manager.update_end_round_wins().

total_cumulative_wins incorporate wins from all game-types on a single betmode level, while cumulative_base_wins and cumulative_free_wins track the cumulative win amounts for the basegame and freegame respectively.

Spin-level wins

The running_bet_win tracks wins from the basegame and freegame modes and continuously increases during simulation steps. The final running_bet_win value will equal the payout multiplier basegame_wins and freegame_winsare single simulation level parameters which are reset when run_spin() is called. These values are subsequently used for the lookUpTableSegmented files, which helps to identify the contribution of different game-types to the final payout multiplier.

The spin_win property tracks the win for a given reveal event. So for example is reset for each spin within a freegame. Finally the tumble_win property is used for tracking wins where there are consecutive win events within a single reveal, most commonly seen within tumbling/cascading games. We may want to keep track of the cumulative win amount resulting from multiple tumble events to update win-banners or apply multipliers at the end of the sequence.

Update functions

There are several WinManager update functions used to update and reset the spin_win and gametype wins. The running_bet_win property does not need to be called explicitly, nor does the cumulative_wins (as this is called when the simulation is accepted and saved). The gametype should be updated explicitly though when the basegame actions have concluded, as well as at the end of each freegame spin (if applicable). This can be seen the sample gamestate.run_spin() game files:

self.win_manager.update_gametype_wins(self.gametype)

