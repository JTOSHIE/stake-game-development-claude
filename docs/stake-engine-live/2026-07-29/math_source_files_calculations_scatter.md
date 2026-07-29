<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: math_source_files_calculations_scatter
- resolved_url: https://stake-engine.com/docs/math/source-files/calculations/scatter
- fetched: 2026-07-29
- rendered_via: headless chromium (Playwright 1.61.1), document.querySelector('main').innerText.
  A plain fetch returns only "Loading...", because the docs site is client rendered.
  The nav sidebar is chrome and is EXCLUDED: capturing document.body added about 1020
  chars of navigation to every page and would have read as a platform-wide change.
- page_title: Math Source Files Calculations Scatter - API Documentation
- chars: 1824
- sha256: 95ac2aaab5f57af4f723d8dc786d0ef24459c0d6271910bdcdf14c80ec26e7d2
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

Scatter Pays

Scatter-pays (pay-anywhere) games award wins based on the total number of like-symbols appearing on the game board. Symbols do not have to be arranged in any order. Typically a minimum of 8 like-symbols (or Wilds) are required to count as a win, though these values can be defined in the GameConfig class. Since it is possible for up to num_rows * num_columns winning symbols to occur, it is common to define a particular payout range. For example 8-kind pays p1 9-kind to pay p2, 10-12 kind to pay p3 and 12+ symbols pay p4 etc… Instead of manually including all possible pay combinations in config.paytable there is a convert_range_table() function in the Config class which takes in a symbol range, name and payout amount which is used to generate all config.paytable entries. This pay group should be of the format:

paygroup = {
    ((min_combination[int], max_combination[int]), name[str]) : payout[float],
    ... 
}


Ranges defined in min_combination and max_combination are inclusive, so for example if the 8-kind payout for symbol H1 pays 10x, this would be written as: ((8,8),H1): 10.

Often (though not always) Scatter pays games are also cascading/tumbling. Within the scatter sample game for example, while there are still winning combinations, the board is tumbled, wins are evaluated for the new board, the wallet manager is updated and relevant events are emitted:

while self.win_data["totalWin"] > 0 and not (self.wincap_triggered):
    self.tumble_game_board()
    self.win_data = self.get_scatterpay_wins(record_wins=True)
    self.win_manager.update_spinwin(self.win_data["totalWin"])
    self.emit_tumble_win_events()


The Scatter pay evaluation function also checks for multiplier and wild attributes attached to symbols. Wild symbols can contribute to wins for any number of symbols.
