# W19: walk 9 requirements on the rgs-technical surface (part 1 of 2)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-111 | ARTEFACT | YES | `rgs.md:35` | Call /wallet/authenticate on first load and before any play, balance or end-round call; do not issue those three before authenticate has returned. |
| REQ-112 | ARTEFACT | YES | `rgs.md:37` | Every round opened by /wallet/play is closed by /wallet/end-round once the round, including its animations, has finished. |
| REQ-113 | ARTEFACT | YES | `rgs_wallet.md:26` | On load, inspect the round object from authenticate and resume an active round rather than starting fresh; rgs.md:41 names round.event as the resume position. |
| REQ-114 | ARTEFACT | YES | `rgs.md:45` | Read sessionID, lang, device and rgs_url from the launch URL query string and drive both RGS calls and display from them. |
| REQ-115 | ARTEFACT | NO | `rgs.md:51` | Include the launch sessionID in the body of every RGS request the game makes. |
| REQ-116 | ARTEFACT | NO | `rgs.md:54` | Take the RGS base URL from the rgs_url query parameter at runtime; no build-time or constant RGS host anywhere in the shipped bundle. |
| REQ-117 | ARTEFACT | YES | `rgs.md:57` | Interpret lang as a two-letter ISO 639-1 code when selecting the display language (the page then lists 16 supported codes plus 'da'). |
| REQ-118 | ARTEFACT | YES | `rgs.md:80` | Send and receive all money as integer micros at 1e6 scale, converting only for display; a $1 bet is the integer 1000000 (rgs.md:88). |
| REQ-119 | ARTEFACT | NO | `rgs.md:90` | Keep currency out of round logic, bet arithmetic and outcome selection; it may change only formatting. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-111

- source: `rgs.md:35`
- platform text, verbatim: "All flows require the /wallet/authenticate API to be called when the game first loads. This authorizes the sessionID to be used by the /wallet/play, /wallet/balance and /wallet/end-round endpoints." (trimmed from a longer single line; the sentence that follows states the 400 ERR_IS consequence)
- what it requires: Call /wallet/authenticate on first load and before any play, balance or end-round call; do not issue those three before authenticate has returned.

### REQ-112

- source: `rgs.md:37`
- platform text, verbatim: "This flow takes creates a round and will close the round after all animations have been complete. It accomplishes this by calling the /wallet/play API and then calling the /wallet/end-round API when the round is complete."
- what it requires: Every round opened by /wallet/play is closed by /wallet/end-round once the round, including its animations, has finished.

### REQ-113

- source: `rgs_wallet.md:26`
- platform text, verbatim: "The round returned may represent a currently active or the last completed round. Frontends should continue the round if it remains active."
- what it requires: On load, inspect the round object from authenticate and resume an active round rather than starting fresh; rgs.md:41 names round.event as the resume position.

### REQ-114

- source: `rgs.md:45`
- platform text, verbatim: "Games are hosted under a predefined URL. Providers should use the parameters below to interact with the RGS on behalf of the user and correctly display game information."
- what it requires: Read sessionID, lang, device and rgs_url from the launch URL query string and drive both RGS calls and display from them.

### REQ-115

- source: `rgs.md:51`
- platform text, verbatim: "sessionID Unique session ID for the player. Required for all requests made by the game." (table cells on one source line, tab rendered here as a single space)
- what it requires: Include the launch sessionID in the body of every RGS request the game makes.

### REQ-116

- source: `rgs.md:54`
- platform text, verbatim: "This URL should not be hardcoded, as it may change dynamically." (trimmed from the rgs_url table row on the same line)
- what it requires: Take the RGS base URL from the rgs_url query parameter at runtime; no build-time or constant RGS host anywhere in the shipped bundle.

### REQ-117

- source: `rgs.md:57`
- platform text, verbatim: "The lang parameter should be an ISO 639-1 language code."
- what it requires: Interpret lang as a two-letter ISO 639-1 code when selecting the display language (the page then lists 16 supported codes plus 'da').

### REQ-118

- source: `rgs.md:80`
- platform text, verbatim: "Monetary values in the Stake Engine are integers with six decimal places of precision:"
- what it requires: Send and receive all money as integer micros at 1e6 scale, converting only for display; a $1 bet is the integer 1000000 (rgs.md:88).

### REQ-119

- source: `rgs.md:90`
- platform text, verbatim: "Currency impacts only the display layer; it does not affect gameplay logic."
- what it requires: Keep currency out of round logic, bet arithmetic and outcome selection; it may change only formatting.

