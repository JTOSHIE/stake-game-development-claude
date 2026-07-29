<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: math_game_state_structure_setup_configs
- resolved_url: https://stake-engine.com/docs/math/game-state-structure/setup/configs
- fetched: 2026-07-29
- rendered_via: headless chromium (Playwright 1.61.1), document.querySelector('main').innerText.
  A plain fetch returns only "Loading...", because the docs site is client rendered.
  The nav sidebar is chrome and is EXCLUDED: capturing document.body added about 1020
  chars of navigation to every page and would have read as a platform-wide change.
- page_title: Math Game State Structure Setup Configs - API Documentation
- chars: 4225
- sha256: c68895887b0af4e419bc36bb57df765d15293e69d3fe5cd855c23e86164d0768
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

Game Configuration Files

The GameState object requires certain parameters to be specified, and should be manually filled out for each new game. These elements are all defined in the __init__ function. Full details of the expected inputs and data-types are given in the config info section.

General aspects of the game setup which should be considered when creating a game_config.py are:

Game-types

Several parts of the engine such as win amount verification, special symbol triggers/attributes and win-levels require the engine to know if the current state of the game is in the basegame or freegame. For example it is common to perform a weighted draw of some value:

#Within game config:
self.multiplier_values = {
   "basegame":{1:100, 2:50, 3: 10}, 
   "freegame":{2:20, 3:50, 5: 20, 10:10, 20:1}}
....
#Within gamestate:
multiplier = get_random_outcome(self.config.multiplier_values[self.gametype])


Typically special rules apply when the player enters a freegame. The configuration file allows the user to specify the key corresponding to each gametype. By default this is set to basegame and freegame respectively. All simulations will start in the basegame mode unless otherwise specified, and the transition to the freegame state is handled in the default reset_fs_spin() function, which is called as soon as the run_freespin() function is entered.

Reels

Most games will use distinct reelstrips for different game-types. It is commonplace for game-modes to have multiple possible reels per mode. One method of adjusting the overall RTP of a game is to have a multiple reelstrips with varying RTP, which can be selected from a weighted draw when calling self.create_board_from_reelstrips(). Reelstrips are stored as a dictionary in the self.config.reels object. The reelstrip key and csv file name should be specified:

reels = {"BR0": "BR0.csv", "FR0": "FR0.csv"}
self.reels = {}
for r, f in reels.items():
    self.reels[r] = self.read_reels_csv(str.join("/", [self.reels_path, f]))


Reelstrip weightings are required distribution conditions. An example of using multiple reelstrips for each gametype can be applied as:

conditions={
    "reel_weights": {self.basegame_type: {"BR0": 2, "BR1": 1}, self.freegame_type: {"FR0":5, "FR1": 1}},
},

Scatter triggers and Anticipation

Freegame entry from the basegame or retriggers in the freegame should be specified in the format {num_scatters: num_spins},

self.freespin_triggers = {
    self.basegame_type: {3: 10, 4: 15, 5: 20},
    self.freegame_type: {2: 4, 3: 6, 4: 8, 5: 10},
}

Symbol initialization

A symbol is determined to be valid if the name exists either in self.paytable or in self.special_symbols. If a symbol that does not exist in either of these fields is detected when loading reelstrips, a RuntimeError is raised.

Symbol values

Winning symbols are determined from the self.paytable dictionary object in the game configuration. The expected format is:

self.paytable = {
    (kind[int], name[str]): value[float],
    ...
}


Where kind is the number of winning symbols. For cascading games, or other circumstances where multiple winning symbol numbers pay the same about, for example in the scatter pays example game where 13+ symbols pay the same amount, self.pay_group can be defined. By then calling self.paytable = self.convert_range_table(pay_group) a paytable of the expected format is generated. The format of the pay-group objects (inclusive of both values in the kind-range) is given as:

self.pay_group = {
    ((min_kind[int],max_kind[int]), name[str]): value[float],
    ...
}

Special symbols

Special symbol attributes are assigned based on names appearing in self.special_symbols = {attribute[str]: [name[str], ...]}. Multiple symbols can share attributes and multiple attributes can be applied to the same symbol. Most games will at least have a wild and scatter attribute. Once the symbol is initialized, the value of the attribute is accessed through symbol.attribute or symbol.get_attribute(attribute) see Symbols for more information regarding symbol object structures. By default the attribute is set to True, unless otherwise overridden using the gamestate.special_symbol_functions, defined in the gamestate override.
