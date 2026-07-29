<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: math_source_files_calculations_board
- resolved_url: https://stake-engine.com/docs/math/source-files/calculations/board
- fetched: 2026-07-29
- rendered_via: headless chromium (Playwright 1.61.1), document.querySelector('main').innerText.
  A plain fetch returns only "Loading...", because the docs site is client rendered.
  The nav sidebar is chrome and is EXCLUDED: capturing document.body added about 1020
  chars of navigation to every page and would have read as a platform-wide change.
- page_title: Math Source Files Calculations Board - API Documentation
- chars: 2354
- sha256: de872a009a67986ebdde0ea912b377db6a0220b0c9064be84262e67d6b330eda
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

Game Board

The Board class inherits the GeneraGameState class and handles the generation of game boards. Most commonly used is the create_board_reelstrips() function. Which selects a reelset as defined in the BetMode.Distribution.conditions class. For each reel a random stopping position is chosen with uniform probability on the range [0,len(reelstrip[reel])-1]. For each reelstop a 2D list of Symbol objects are created and attached to the GameState object.

Additionally, special symbol information is included (special_symbols_on_board) along with the reelstop values (reel_positions), padding symbols directly above and below the active board (padding_positions) and which reelstrip-id was used.

The is also an anticipation field which is used for adding a delay to reel reveals if the number of Scatters required for trigging the freegame is almost satisfied. This is an array of values initialized to 0 and counting upwards in +1 value increments. For example if 3 Scatter symbols are needed to trigger the freegame and there are Scatters revealed on reels 0 and 1, the array would take the form (for a 5 reel game):

self.anticipation = [0, 0, 1, 2, 3]


If the selected reel_pos + the length of the board is greater than the total reelstrip length, the stopping position is wrapped around to the 0 index:

 self.reelstrip[reel][(reel_pos - 1) % len(self.reelstrip[reel])]


The reelset used is drawn from the weighted possible reelstrips as defined in the BetMode.betmode.distributions.conditions class (and hence is a required field in the BetMode object):

    self.reelstrip_id = get_random_outcome(
        self.get_current_distribution_conditions()["reel_weights"][self.gametype]
    )


Specific stopping positions can also be forced given a reelstrip-id and integer stopping values from force_board_from_reelstrips(). If no integer value are provided for a reel, a random position is chosen. This function is typically used in conjunction with executables.force_special_board, which will search a reelstrip for a particular symbol name and randomly select a specified number of stopping positions, chosen to land on a randomly selected board row.

Additionally the Board class handled symbol generation, displaying the current .board in the terminal, and retrieving symbol positions and properties as defined in config.special_symbols.
