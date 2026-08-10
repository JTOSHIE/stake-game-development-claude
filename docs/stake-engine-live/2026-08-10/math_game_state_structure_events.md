<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: math_game_state_structure_events
- resolved_url: https://stake-engine.com/docs/math/game-state-structure/events
- fetched: 2026-08-10
- rendered_via: headless chromium (Playwright), document.querySelector('main').innerText.
  Transport note for this pass: page requests were carried by node (undici
  ProxyAgent) through the run environment agent proxy, because chromium
  cannot speak to it directly; the rendered DOM and the origin are unchanged.
  The nav sidebar is chrome and is EXCLUDED, as in every prior pass.
- page_title: Math Game State Structure Events - API Documentation
- chars: 1712
- sha256: 46ae32cc95d14743c6288e8789b7a7f1676b8c1b3442be01ad14ef6606bdaddd
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

Game Event Structures

Events are the JSON objects returned from the RGS play/ API and make up the vast majority of data with a game’s library. Events contain all information required by the front-end to display the current state of the game. Anything not contained within or implied by the events cannot be shown to the player. For a typical game this includes, but is not limited to

Active game-board symbols
Freespin counters
Win counters
Symbol win information
Multipliers
Special symbol actions
…

The events are crucial as all events need to be handled by the front-end. The user is free to determine their event structure, though to follow the example games, all events have the format,

event = {
    "index": [int],
    "type": [str],
    "<field_1>": [T],
    ...
    "<field_n>": [T]
}


"index" keeps track of the current number of events in a simulation, "type" is a unique keyword used to identify an event and is generally a one-word description. "fields" are strings who’s corresponding value can have any data-type, as required. Once constructed, the event is appended to the book, “events” field”:

gamestate.book.add_event(event)


Events are handled separately in the gamestate to game calculations or executables. They are imported explicitly and not attached to the gamestate object. Once the math-engine has made the appropriate board transformation or action, the event should be emitted immediately, as it will provide a snapshot of the current state of the game. For example:

 from src.Events.Events import update_freespin_event
 run_spin():
    ...
    update_freespin_event(self)
    ....


These events should be sent anytime new information needs to be communicated to the player.
