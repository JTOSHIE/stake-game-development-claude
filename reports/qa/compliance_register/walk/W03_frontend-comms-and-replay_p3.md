# W03: walk 9 requirements on the frontend-comms-and-replay surface (part 3 of 6)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-070 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:42` | A player-reachable sound mute or disable control. |
| REQ-071 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:43` | Spacebar keypress triggers the bet or spin action. |
| REQ-072 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:44` | Autoplay must sit behind an explicit confirmation step, so a single click can never start a run of consecutive bets. |
| REQ-073 | ARTEFACT | NO | `approval_guidelines_front_end_communication.md:46` | Ship with no network or console errors, and no game outcome information logged where a player could read it ahead of the animation. |
| REQ-074 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:47` | Observed play, including paid combinations, must match the published rules and paytable exactly. |
| REQ-075 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:48` | The game must render and calculate correctly under every supported currency and language combination, not only the default pair. |
| REQ-076 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:49` | In turbo or fastplay, win amounts, winning combinations and popups must remain readable rather than being skipped or flashed. |
| REQ-077 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:19` | Parse replay query parameters at boot and enter a replay mode that loads the identified round, honouring currency, language, social mode and bet size parameters. |
| REQ-078 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:25` | Bet Replay must be implemented and working in the submitted build; absence is a rejection. Restated upstream at lines 29 and 33. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-070

- source: `approval_guidelines_front_end_communication.md:42`
- platform text, verbatim: "The UI must include an option to disable sounds."
- what it requires: A player-reachable sound mute or disable control.

### REQ-071

- source: `approval_guidelines_front_end_communication.md:43`
- platform text, verbatim: "The spacebar must be mapped to the bet button."
- what it requires: Spacebar keypress triggers the bet or spin action.

### REQ-072

- source: `approval_guidelines_front_end_communication.md:44`
- platform text, verbatim: "If an ‘autoplay’ feature is present, the player must confirm the autoplay action, games are not allowed to automatically place consecutive bets with one click."
- what it requires: Autoplay must sit behind an explicit confirmation step, so a single click can never start a run of consecutive bets.

### REQ-073

- source: `approval_guidelines_front_end_communication.md:46`
- platform text, verbatim: "Check the network tab to ensure no errors or game information is being logged."
- what it requires: Ship with no network or console errors, and no game outcome information logged where a player could read it ahead of the animation.

### REQ-074

- source: `approval_guidelines_front_end_communication.md:47`
- platform text, verbatim: "Playtest the game to verify it behaves as described in the rules (e.g., validating payout combinations)."
- what it requires: Observed play, including paid combinations, must match the published rules and paytable exactly.

### REQ-075

- source: `approval_guidelines_front_end_communication.md:48`
- platform text, verbatim: "Game will be tested with various combinations of currencies and languages."
- what it requires: The game must render and calculate correctly under every supported currency and language combination, not only the default pair.

### REQ-076

- source: `approval_guidelines_front_end_communication.md:49`
- platform text, verbatim: "If the game has a ‘fastplay’ option: wins amounts, winning symbol combinations and pop-up information and must still be legible to player."
- what it requires: In turbo or fastplay, win amounts, winning combinations and popups must remain readable rather than being skipped or flashed.

### REQ-077

- source: `approval_guidelines_game_replay_requirements.md:19`
- platform text, verbatim: "Games must accept a set of query parameters that place the game into replay mode, loading a specific round based on its mode and event ID, along with parameters to configure currency, language, social mode, and bet sizing."
- what it requires: Parse replay query parameters at boot and enter a replay mode that loads the identified round, honouring currency, language, social mode and bet size parameters.

### REQ-078

- source: `approval_guidelines_game_replay_requirements.md:25`
- platform text, verbatim: "Bet Replay is now a mandatory requirement for all games seeking approval."
- what it requires: Bet Replay must be implemented and working in the submitted build; absence is a rejection. Restated upstream at lines 29 and 33.

