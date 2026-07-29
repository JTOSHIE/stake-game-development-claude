# W04: walk 9 requirements on the frontend-comms-and-replay surface (part 4 of 6)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-079 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:58,60` | Replay must load and play with no session and no authorisation, so a shared public URL works for a viewer who is not logged in. |
| REQ-080 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:68-73` | Read and use all six required query parameters: replay, game, version, mode, event, rgs_url. |
| REQ-081 | ARTEFACT | UNKNOWN | `approval_guidelines_game_replay_requirements.md:74-78` | Accept the five optional parameters and apply them where present: currency, amount, lang, device, social; behave sanely when they are absent. |
| REQ-082 | ARTEFACT | NO | `approval_guidelines_game_replay_requirements.md:81` | The front end fetches replay state from the RGS itself rather than reconstructing or embedding it locally. |
| REQ-083 | ARTEFACT | NO | `approval_guidelines_game_replay_requirements.md:84` | Build the replay request as a GET on exactly that path shape, with rgs_url taken from the query parameter and the four path segments in that order. |
| REQ-084 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:97-99` | Consume the response fields as specified: derive total payout from payoutMultiplier, derive bet cost from costMultiplier, and drive the animation from state. |
| REQ-085 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:105` | Fetch the round data on load, with no click or input needed to start loading. |
| REQ-086 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:109` | The replayed outcome must be presented identically to the original live round, not a summary or an approximation of it. |
| REQ-087 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:113` | After the replay finishes, the win amount and outcome stay on screen rather than clearing back to an idle board. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-079

- source: `approval_guidelines_game_replay_requirements.md:58,60`
- platform text, verbatim: "PLAYER SESSION IS NOT REQUIRED FOR VIEWING BET REPLAY! Players can view Bet Replay without an active session or authorization. This means replay URLs can be shared publicly (e.g., on social media, in chat, etc.)." (lines 58 and 60 joined with a single space)
- what it requires: Replay must load and play with no session and no authorisation, so a shared public URL works for a viewer who is not logged in.

### REQ-080

- source: `approval_guidelines_game_replay_requirements.md:68-73`
- platform text, verbatim: "replay Yes Always true when in replay mode game Yes Game ID version Yes Math version of the game (e.g., 1, 2) mode Yes Bet mode event Yes Unique simulation ID to replay rgs_url Yes RGS server URL to fetch replay data from" (six table rows joined with single spaces; upstream separators are tabs)
- what it requires: Read and use all six required query parameters: replay, game, version, mode, event, rgs_url.

### REQ-081

- source: `approval_guidelines_game_replay_requirements.md:74-78`
- platform text, verbatim: "currency No Currency code amount No Bet amount in units lang No Language code device No Device type social No Social mode (true/false)" (five table rows joined with single spaces; upstream separators are tabs)
- what it requires: Accept the five optional parameters and apply them where present: currency, amount, lang, device, social; behave sanely when they are absent.

### REQ-082

- source: `approval_guidelines_game_replay_requirements.md:81`
- platform text, verbatim: "After parsing the query parameters, your game must fetch the replay state from the RGS server."
- what it requires: The front end fetches replay state from the RGS itself rather than reconstructing or embedding it locally.

### REQ-083

- source: `approval_guidelines_game_replay_requirements.md:84`
- platform text, verbatim: "GET {rgs_url}/bet/replay/{game}/{version}/{mode}/{event}"
- what it requires: Build the replay request as a GET on exactly that path shape, with rgs_url taken from the query parameter and the four path segments in that order.

### REQ-084

- source: `approval_guidelines_game_replay_requirements.md:97-99`
- platform text, verbatim: "payoutMultiplier float Multiplier for calculating total payout costMultiplier float Multiplier for calculating bet cost state object Game-specific state for replay animation" (three table rows joined with single spaces; upstream separators are tabs)
- what it requires: Consume the response fields as specified: derive total payout from payoutMultiplier, derive bet cost from costMultiplier, and drive the animation from state.

### REQ-085

- source: `approval_guidelines_game_replay_requirements.md:105`
- platform text, verbatim: "Auto-load without interaction — The game should load the event data automatically"
- what it requires: Fetch the round data on load, with no click or input needed to start loading.

### REQ-086

- source: `approval_guidelines_game_replay_requirements.md:109`
- platform text, verbatim: "Display results — Show the final outcome exactly as the player saw it"
- what it requires: The replayed outcome must be presented identically to the original live round, not a summary or an approximation of it.

### REQ-087

- source: `approval_guidelines_game_replay_requirements.md:113`
- platform text, verbatim: "Display final results — Keep the win amount and outcome visible"
- what it requires: After the replay finishes, the win amount and outcome stay on screen rather than clearing back to an idle board.

