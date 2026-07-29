# W02: walk 9 requirements on the frontend-comms-and-replay surface (part 2 of 6)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-061 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:32` | A complete paytable covering every paying symbol and every paying combination length. |
| REQ-062 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:33` | Enumerate every obtainable value of special symbols, for example scatter instant-pay values and meter multiplier values, in the info surface. |
| REQ-063 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:34` | Document the trigger condition and the award for each feature entry path, in the form of an explicit scatter-count to spins-awarded statement. |
| REQ-064 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:36` | A UI guide section that names each button and says what it does. |
| REQ-065 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:37` | A working bet-size control in the main game UI. |
| REQ-066 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:38` | The bet ladder must be driven by the levels in the authenticate response, and every returned level must be selectable, not a hardcoded ladder. |
| REQ-067 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:39` | Show the live balance in the normal-play UI, updating with wagers and wins. |
| REQ-068 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:40` | Any round with a payout above zero must present its final win amount legibly. |
| REQ-069 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:41` | Multi-win rounds must tally up on screen across the winning actions and land exactly on the round's final payout multiplier. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-061

- source: `approval_guidelines_front_end_communication.md:32`
- platform text, verbatim: "Payout amounts for all symbol combinations must be presented."
- what it requires: A complete paytable covering every paying symbol and every paying combination length.

### REQ-062

- source: `approval_guidelines_front_end_communication.md:33`
- platform text, verbatim: "If the game includes special symbols (e.g., cash prizes or multipliers), list all obtainable values."
- what it requires: Enumerate every obtainable value of special symbols, for example scatter instant-pay values and meter multiplier values, in the info surface.

### REQ-063

- source: `approval_guidelines_front_end_communication.md:34`
- platform text, verbatim: "For feature modes (e.g., triggered by Scatter symbols), describe how to access them. Example: “3 Scatters award 10 free spins; 4 Scatters award 15 spins …”"
- what it requires: Document the trigger condition and the award for each feature entry path, in the form of an explicit scatter-count to spins-awarded statement.

### REQ-064

- source: `approval_guidelines_front_end_communication.md:36`
- platform text, verbatim: "Game must include a User Interface guide, briefly describing the functionality of UI buttons."
- what it requires: A UI guide section that names each button and says what it does.

### REQ-065

- source: `approval_guidelines_front_end_communication.md:37`
- platform text, verbatim: "The game must allow players to change the bet size."
- what it requires: A working bet-size control in the main game UI.

### REQ-066

- source: `approval_guidelines_front_end_communication.md:38`
- platform text, verbatim: "Player must be able to use all bet-levels returned within RGS auth/ response."
- what it requires: The bet ladder must be driven by the levels in the authenticate response, and every returned level must be selectable, not a hardcoded ladder.

### REQ-067

- source: `approval_guidelines_front_end_communication.md:39`
- platform text, verbatim: "The player’s current balance must be displayed."
- what it requires: Show the live balance in the normal-play UI, updating with wagers and wins.

### REQ-068

- source: `approval_guidelines_front_end_communication.md:40`
- platform text, verbatim: "Final win amounts must be clearly shown for non-zero payout results."
- what it requires: Any round with a payout above zero must present its final win amount legibly.

### REQ-069

- source: `approval_guidelines_front_end_communication.md:41`
- platform text, verbatim: "If an outcome contains multiple winning actions, the payout amount must incrementally update to match the final payout multiplier."
- what it requires: Multi-win rounds must tally up on screen across the winning actions and land exactly on the round's final payout multiplier.

