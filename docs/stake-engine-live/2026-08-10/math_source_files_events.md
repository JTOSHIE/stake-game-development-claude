<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: math_source_files_events
- resolved_url: https://stake-engine.com/docs/math/source-files/events
- fetched: 2026-08-10
- rendered_via: headless chromium (Playwright), document.querySelector('main').innerText.
  Transport note for this pass: page requests were carried by node (undici
  ProxyAgent) through the run environment agent proxy, because chromium
  cannot speak to it directly; the rendered DOM and the origin are unchanged.
  The nav sidebar is chrome and is EXCLUDED, as in every prior pass.
- page_title: Math Source Files Events - API Documentation
- chars: 2497
- sha256: e3a0c20750936263d991e919b284517ba855e7976e1d39160bf621334287a7df
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

Events Module Documentation
Overview

The events.py module defines reusable game events that modify the gamestate and log significant actions. These events ensure proper tracking of game states and facilitate structured client communication.

Functions
json_ready_sym(symbol, special_attributes)

Purpose: Converts a symbol object into a dictionary suitable for JSON serialization, including only specified attributes.

Parameters:

symbol (object): The symbol object to convert.
special_attributes (list): A list of attribute names to include if they are not False.
reveal_event(gamestate)

Purpose: Logs the initial board state, including padding symbols if enabled.

fs_trigger_event(gamestate, include_padding_index, basegame_trigger, freegame_trigger)

Purpose: Logs the triggering of free spins, whether from the base game or a retrigger event.

Assertions:

Either basegame_trigger or freegame_trigger must be True, not both.
gamestate.tot_fs must be greater than 0.
set_win_event(gamestate, winlevel_key='standard')

Purpose: Updates the cumulative win amount for a single outcome.

set_total_event(gamestate)

Purpose: Updates the total win amount for a betting round, including all free spins.

set_tumble_event(gamestate)

Purpose: Logs wins from consecutive tumbles.

wincap_event(gamestate)

Purpose: Emits an event when the maximum win amount is reached, stopping further spins.

win_info_event(gamestate, include_padding_index=True)

Purpose: Logs winning symbol positions and their win amounts, adjusting for padding if enabled.

update_tumble_win_event(gamestate)

Purpose: Updates the banner for tumble win amounts.

update_freespin_event(gamestate)

Purpose: Logs the current and total free spins remaining.

freespin_end_event(gamestate, winlevel_key='endFeature')

Purpose: Logs the end of a free spin feature and assigns the final win level.

final_win_event(gamestate)

Purpose: Logs the final payout multiplier at the end of a simulation.

update_global_mult_event(gamestate)

Purpose: Logs changes to the global multiplier.

tumble_board_event(gamestate)

Purpose: Logs symbol positions removed during a tumble and their replacements.

Usage Notes
Each function appends an event dictionary to gamestate.book['events'].
Deep copies ensure that modifications do not affect past event states.
Events provide structured output suitable for UI updates and analytics.

This module is essential for maintaining a transparent, trackable game state across different game mechanics.
