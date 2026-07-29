# W06: walk 5 requirements on the frontend-comms-and-replay surface (part 6 of 6)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-097 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:135` | A Play Again control that restarts the same replay from the beginning. Restated upstream at line 112. |
| REQ-098 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:136` | A user-facing error state when the replay fetch fails, rather than a blank screen or a silent hang. |
| REQ-099 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:137` | No control or path anywhere in replay mode can begin a real-money session. |
| REQ-160 | PROCESS | NO | `approval_guidelines_game_replay_requirements.md:140,142-146` | Be ready to hand the reviewer, for each of the five bet modes, event IDs covering normal win, big win, win cap, zero-payout loss and bonus trigger. Foreshadowed upstream at line 32. |
| REQ-161 | PROCESS | NO | `approval_guidelines_game_replay_requirements.md:148` | Exercise replay on max-win and rare-feature event IDs before submission, and record that it was done. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-097

- source: `approval_guidelines_game_replay_requirements.md:135`
- platform text, verbatim: "Add “Play Again” button — Allow rewatching the replay"
- what it requires: A Play Again control that restarts the same replay from the beginning. Restated upstream at line 112.

### REQ-098

- source: `approval_guidelines_game_replay_requirements.md:136`
- platform text, verbatim: "Handle errors — Show an appropriate message if replay data fails to load"
- what it requires: A user-facing error state when the replay fetch fails, rather than a blank screen or a silent hang.

### REQ-099

- source: `approval_guidelines_game_replay_requirements.md:137`
- platform text, verbatim: "Prevent session transition — No way to start normal play from replay"
- what it requires: No control or path anywhere in replay mode can begin a real-money session.

### REQ-160

- source: `approval_guidelines_game_replay_requirements.md:140,142-146`
- platform text, verbatim: "During game review, you may be asked to provide event IDs for different scenarios for every bet mode: Normal win Big win Win cap (max win) Loss (zero payout) Bonus round trigger (if applicable)" (line 140 and the list at lines 142 to 146 joined with single spaces)
- what it requires: Be ready to hand the reviewer, for each of the five bet modes, event IDs covering normal win, big win, win cap, zero-payout loss and bonus trigger. Foreshadowed upstream at line 32.

### REQ-161

- source: `approval_guidelines_game_replay_requirements.md:148`
- platform text, verbatim: "Make sure to test edge cases like max wins and rare bonus features before submitting for review."
- what it requires: Exercise replay on max-win and rare-feature event IDs before submission, and record that it was done.

