<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: math_game_state_structure_wins
- resolved_url: https://stake-engine.com/docs/math/game-state-structure/wins
- fetched: 2026-07-29
- rendered_via: headless chromium (Playwright 1.61.1), document.querySelector('main').innerText.
  A plain fetch returns only "Loading...", because the docs site is client rendered.
  The nav sidebar is chrome and is EXCLUDED: capturing document.body added about 1020
  chars of navigation to every page and would have read as a platform-wide change.
- page_title: Math Game State Structure Wins - API Documentation
- chars: 4131
- sha256: d6e7ef13639c74ea22cdc794699127b1e3b5710f40b2adfafc465aecac6fe1b0
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

Win calculations

There are several built-in win methods included in the engine:

Lines pays
Ways pays
Cluster pays
Scatter pays

Irrespective of the win method applied, win information is stored in the gamestate object win_data:

 win_data = {
    'totalWin': [float],
    'wins': [List[Dict]]
 }


This initialized win_data structure is the return value for all provided win calculation functions. If using the predefined win events, the dictionary items within wins must contain the “position” key to account for modifying the row number if needed for the padding symbols. All wins information for the current game board should be included in this structure. Such as all winning symbol combinations, win amounts and positions. The built-in functions also include a `meta’ key which includes any additional information which the front-end may need to display. For the win-lines, as an example this appears as:

'wins': {
    'symbol': 'H1',
    'kind': 5,
    'win': 300,
    'positions': [{'reel':1, 'row':1}, ...],
    'meta':{
        'lineIndex': 12,
        'multiplier': 10,
        'winWithoutMult': 30,
        'globalMult': 1,
        'lineMultiplier': 10
    }
}


This additional information includes any symbol or global multiplier values applied, the base win amount, and the lineIndex, as defined in config.paylines = {[], ...}

Multiplier methods

For generality all win methods utilize functions from the wins/multiplier_strategy file. By calling apply_mult() with a specified strategy (global, symbol, combined), base win amount and winning symbol positions, total win amounts are returned inclusive of any global multipliers or symbol multipliers. By default, if the combined or symbol strategy is used, multiplier values are added together from winning symbol positions, where the symbol object contains the multiplier attribute.

Overlay values

The cluster and scatter pay sample games, there is an overlay key included ine win_data “meta” tag of the structure:

'meta': {
    ...
    'overlay': {'reel': [int], 'row': [int]}
}


This position is calculated as the board position closest to the centre-of-mass of winning clusters.

Wallet manager

When writing game logic, the intent is to have a clear separation of logic, events and wins for clarity. The wins are all handled through a WalletManager class, which will handle outcomes from single spins while also keeping track of total cumulative win amount for RTP calculations, as well as which gametype the wins arise from.

This can be seen in a typical gamestate run_spin() function where wins are calculated, the wallet is updated and corresponding win events are emitted:

self.win_data = self.get_lines()
self.win_manager.update_spinwin(self.win_data["totalWin"])
self.emit_linewin_events()


Within a single spin there are wallet manager values associated with:

spin_win
This is the win associated with a specific reveal event. If the freegame is entered, this value is reset for each new spin.
Updated using wallet_manager.update_spinwin(win_amount: float)
running_bet_win
This is the cumulative win amount for a simulation. The final value which the running_bet_win is updated with should match the payout_multiplier for that simulation.
This value is automatically updated with the wallet_manager.set_spinwin(win_amount: float) method.
basegame_wins/freegame_wins
This value is updated once all basegame actions are completed, or at the end of each freegame spin.
Updated using wallet_manager.update_gametype_wins(self.gametype)
Important! As part of the final payout verification self.final_win and sum(self.basegame_wins + self.freegame_wins) must match. If these two payouts do not match a RuntimeError is raised.
This is useful for game analysis and applying the correct parameters to the optimization algorithm.
Cumulative simulation wins
total_cumulative_wins, cumulative_base_wins and cumulative_free_wins wins are updated at the end of each simulation. This value is used to display the runtime RTP for all simulations when printed in the terminal.
Updated using wallet_manager.update_end_round_wins() within the imprint_wins function.
