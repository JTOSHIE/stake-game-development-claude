<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: math_game_state_structure_force_files
- resolved_url: https://stake-engine.com/docs/math/game-state-structure/force-files
- fetched: 2026-08-11
- rendered_via: headless chromium (Playwright), document.querySelector('main').innerText, direct transport from the owner's machine.

---
Custom Defined Events

Every betmode will have a corresponding force_record_<betmode>.json. This file records the book-id corresponding to a custom defined search key. Anytime self.record() is called where

def record(self, description: dict) -> None:
    self.temp_wins.append(description)
    self.temp_wins.append(self.book_id)


The current simulation number will be appended to the description/key if it exists, otherwise a new dictionary entry is made based on the description passed to the record() function. For example, we may want to keep track of how many Scatter symbols caused a freegame trigger. Which will be useful for later analysis to investigate the frequency of any custom defined event. In the freespin trigger executable function for example,

def run_freespin_from_base(self, scatter_key: str = "scatter") -> None:
    self.record(
        {
            "kind": self.count_special_symbols(scatter_key),
            "symbol": scatter_key,
            "gametype": self.gametype,
        }
    )
    self.update_freespin_amount()
    self.run_freespin()


This will ultimately output a force_record_<betmode>.json with the entries:

[
    {
        "search": {
            "gametype": "basegame",
            "kind": 5,
            "symbol": "scatter"
        },
        "timesTriggered": 22134,
        "bookIds": [
            7,
            12,
            ....
        ]
    },
    {
        "search": {
            "gametype": "basegame",
            "kind": 6,
            "symbol": "scatter"
        },
        "timesTriggered": 1196,
        "bookIds": [
            9,
            10
            ...
        ]
    },
    ...
]

Summary force file

Once all simulations have been completed, a force.json file is produced, which contains all unique search fields and keys. The intended use for this file is for prototyping, where a drop-down menu, or something of the sort can be created for all possible search conditions.

Accounting for discarded simulations

The record() function does not directly append the key/book-id to the force file. This action is only performed once a simulation has completed and is accepted. This is to ensure that keys/ids are not prematurely added if a simulation is rejected. Therefore keys and corresponding simulation ids are appended to self.temp_wins and self.temp_wins before being finalized within the imprint_wins() function within src/state/state.py. Keys must be unique, and book-ids are not repeated within keys, though the same book-id may appear within several keys.
