# W01: walk 9 requirements on the frontend-comms-and-replay surface (part 1 of 6)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-052 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:22` | Every shipped audio and visual asset must be original to this title, with no web-sdk sample-game backgrounds, symbols or animations remaining anywhere in the bundle. |
| REQ-053 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:23` | No broken or missing textures, sprites, fonts or animation states in any reachable game state. |
| REQ-054 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:24` | The game board must render undistorted in Stake's mini-player modal, that is at a small viewport size, not only at desktop and mobile sizes. |
| REQ-055 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:25` | Responsive layout across common phone and tablet viewports, with every control still reachable and operable while the viewport scales. |
| REQ-056 | ARTEFACT | NO | `approval_guidelines_front_end_communication.md:26` | No image or font may be fetched from any host other than the Stake Engine CDN; assets ship inside the uploaded bundle and are served from it. |
| REQ-057 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:28` | An in-game info or rules surface reachable from the UI that documents every rule of the game. |
| REQ-058 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:29` | For each of the five bet modes, state its cost multiplier and what the purchase actually buys, in the info surface. |
| REQ-059 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:30` | Display the RTP figure to the player, per mode where modes differ in the player's view. |
| REQ-060 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:31` | Show the max win cap for every mode in the player-facing information. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-052

- source: `approval_guidelines_front_end_communication.md:22`
- platform text, verbatim: "Submitted games must use unique audio and visual assets. Assest such as backgrounds, symbols and/or animations provided with the web-sdk sample games will not be approved for publication."
- what it requires: Every shipped audio and visual asset must be original to this title, with no web-sdk sample-game backgrounds, symbols or animations remaining anywhere in the bundle.

### REQ-053

- source: `approval_guidelines_front_end_communication.md:23`
- platform text, verbatim: "Ensure the game is free of visual bugs, including broken or missing assets or animations."
- what it requires: No broken or missing textures, sprites, fonts or animation states in any reachable game state.

### REQ-054

- source: `approval_guidelines_front_end_communication.md:24`
- platform text, verbatim: "Games must support this small view without the active game board been visibly distorted." (normative clause of the "Popout view support" bullet)
- what it requires: The game board must render undistorted in Stake's mini-player modal, that is at a small viewport size, not only at desktop and mobile sizes.

### REQ-055

- source: `approval_guidelines_front_end_communication.md:25`
- platform text, verbatim: "The game must support mobile view for commonly used devices, with all UI functionality remaining usable during screen scaling."
- what it requires: Responsive layout across common phone and tablet viewports, with every control still reachable and operable while the viewport scales.

### REQ-056

- source: `approval_guidelines_front_end_communication.md:26`
- platform text, verbatim: "All images and fonts must be loaded from the Stake Engine Content Delivery Network (CDN)."
- what it requires: No image or font may be fetched from any host other than the Stake Engine CDN; assets ship inside the uploaded bundle and are served from it.

### REQ-057

- source: `approval_guidelines_front_end_communication.md:28`
- platform text, verbatim: "Game information must be accessible from the UI, including a detailed description of all game rules."
- what it requires: An in-game info or rules surface reachable from the UI that documents every rule of the game.

### REQ-058

- source: `approval_guidelines_front_end_communication.md:29`
- platform text, verbatim: "If multiple game modes are available, provide a description of the cost of each bet and the actions being purchased."
- what it requires: For each of the five bet modes, state its cost multiplier and what the purchase actually buys, in the info surface.

### REQ-059

- source: `approval_guidelines_front_end_communication.md:30`
- platform text, verbatim: "The RTP of the game (and each mode, if applicable) must be clearly communicated to the player."
- what it requires: Display the RTP figure to the player, per mode where modes differ in the player's view.

### REQ-060

- source: `approval_guidelines_front_end_communication.md:31`
- platform text, verbatim: "The maximum win amount for each mode must be clearly displayed."
- what it requires: Show the max win cap for every mode in the player-facing information.

