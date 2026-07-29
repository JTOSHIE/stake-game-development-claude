# W05: walk 9 requirements on the frontend-comms-and-replay surface (part 5 of 6)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-088 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:116,118-122` | Recommended, not stated as a must: in replay hide balance, play buttons, bet amount selector and autoplay settings, and keep win amount, replay controls, replay bet amount and currency display. The betting-control half of this is separately mandatory at R3-42. |
| REQ-089 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:127` | Branch into replay mode on the presence of replay=true in the URL. Introduced by line 125, "Your game must handle the following in replay mode:". |
| REQ-090 | ARTEFACT | NO | `approval_guidelines_game_replay_requirements.md:128` | Issue the replay fetch using the values taken from the query string, not defaults or hardcoded values. |
| REQ-091 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:129` | A visible loading indicator covers the fetch window. |
| REQ-092 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:130` | Once data has loaded, show a Play control that the viewer presses to begin the replay. |
| REQ-093 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:131` | Every betting control, including bet size, spin and buy, is hidden or non-functional in replay. Restated upstream at line 110. |
| REQ-094 | ARTEFACT | NO | `approval_guidelines_game_replay_requirements.md:132` | Replay makes no authenticate, play, end-round or wallet calls; only the public replay endpoint is touched. |
| REQ-095 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:133` | Replay drives the complete animation and audio pipeline, not a reduced or static presentation. Restated upstream at line 108. |
| REQ-096 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:134` | Present all three figures in replay: the bet cost, the payout, and the win amount. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-088

- source: `approval_guidelines_game_replay_requirements.md:116,118-122`
- platform text, verbatim: "We recommend implementing a slimmed-down UI for replay mode: Hide/Remove Keep/Show Balance display Win amount Play buttons Replay controls Bet amount selector Replay bet amount Autoplay settings Currency display" (line 116 and the table at lines 118 to 122 joined with single spaces; upstream separators are tabs)
- what it requires: Recommended, not stated as a must: in replay hide balance, play buttons, bet amount selector and autoplay settings, and keep win amount, replay controls, replay bet amount and currency display. The betting-control half of this is separately mandatory at R3-42.

### REQ-089

- source: `approval_guidelines_game_replay_requirements.md:127`
- platform text, verbatim: "Detect replay mode — Check for replay=true query param"
- what it requires: Branch into replay mode on the presence of replay=true in the URL. Introduced by line 125, "Your game must handle the following in replay mode:".

### REQ-090

- source: `approval_guidelines_game_replay_requirements.md:128`
- platform text, verbatim: "Fetch replay data — Call the RGS endpoint with correct parameters"
- what it requires: Issue the replay fetch using the values taken from the query string, not defaults or hardcoded values.

### REQ-091

- source: `approval_guidelines_game_replay_requirements.md:129`
- platform text, verbatim: "Show loading state — Display a loader while fetching"
- what it requires: A visible loading indicator covers the fetch window.

### REQ-092

- source: `approval_guidelines_game_replay_requirements.md:130`
- platform text, verbatim: "Display “Play” button — Prompt the user to start the replay"
- what it requires: Once data has loaded, show a Play control that the viewer presses to begin the replay.

### REQ-093

- source: `approval_guidelines_game_replay_requirements.md:131`
- platform text, verbatim: "Disable betting UI — Hide or disable all bet controls"
- what it requires: Every betting control, including bet size, spin and buy, is hidden or non-functional in replay. Restated upstream at line 110.

### REQ-094

- source: `approval_guidelines_game_replay_requirements.md:132`
- platform text, verbatim: "Disable session calls — Do not make any authenticated API calls"
- what it requires: Replay makes no authenticate, play, end-round or wallet calls; only the public replay endpoint is touched.

### REQ-095

- source: `approval_guidelines_game_replay_requirements.md:133`
- platform text, verbatim: "Play full animation — Show all animations, sounds, and results"
- what it requires: Replay drives the complete animation and audio pipeline, not a reduced or static presentation. Restated upstream at line 108.

### REQ-096

- source: `approval_guidelines_game_replay_requirements.md:134`
- platform text, verbatim: "Show results — Display bet cost, payout, and win amount"
- what it requires: Present all three figures in replay: the bet cost, the payout, and the win amount.

