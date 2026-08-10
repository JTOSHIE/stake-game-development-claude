# THE REQUIREMENTS REGISTER

**Built 2026-07-29 by JOB 1a of `reports/briefs/FS_SESSION2_AUDIT_ONE_Prompt.md`.** This
register did not previously exist in the repository. It is assembled from the first COMPLETE
capture of the live platform docs, 64 of 64 pages rendered, committed at
`docs/stake-engine-live/2026-07-29/`.

Australian English, no em dashes or en dashes in this document's own prose. Quoted platform
text is verbatim per convention (l.7) and carries whatever punctuation upstream used.

## How to read this, and what it is NOT

**The platform docs are the authority. This project's own documents are not.** That division
decides the whole structure below, and it was arrived at after a first marshal got it wrong.

- **232 consolidated PLATFORM requirements** are the register. They come from 254 raw rows
  enumerated by 7 squads against the captured pages.
- **179 PROJECT_CLAIM rows**, from `COMPLIANCE_WATCH.md` and `SUBMISSION_DOSSIER.md`, are
  NOT requirements. They are the project's claims ABOUT its compliance, which is precisely
  what JOB 1b tests. They are listed separately at `PROJECT_CLAIMS.md` and must never be
  counted as requirements: doing so would let the project's own assertion that it complies
  become evidence that it complies.

**The de-duplication is PROVISIONAL**, per `docs/skills/AGENT_BUDGET_AND_SCHEDULING.md` 4.4.
Text similarity clustering in the main loop is the right first pass and is wrong about
roughly a quarter of its fusions. Every consolidated row below carries its constituent shard
row ids so a fusion can be split rather than rediscovered. **A corroboration count here is a
hypothesis, not evidence.**

## The counts

| | Count |
|---|---|
| Live pages captured | 64 of 64 rendered |
| Raw platform requirement rows | 254 |
| **Consolidated platform requirements** | **232** |
| ARTEFACT, needs an implementation path AND a proof path | 148 |
| PROCESS, needs a proof path or a tracker row | 46 |
| MATHS, EXCLUDED: locked package, wants its own sanction | 31 |
| STUDIO, EXCLUDED: no obligation on the build | 7 |
| **JOB 1b walk set** | **194** |
| Player visible | 135 |
| Project claims to be tested against the register | 179 |

**The MATHS exclusion follows `docs/skills/FULL_AUDIT_METHOD.md` section 5**: the maths
package is locked and wants its own audit pass with its own sanction. The 31 rows are
enumerated and kept here so that pass does not begin by re-deriving them.

## What the corpus is known to be missing

- **`https://stake-engine.com/docs-content/distribution_optimization.pdf`**, linked from the
  docs navigation, is a binary and was not captured.
- **The `changelog` slug no longer exists.** It resolved to
  `https://stake-engine.com/docs/updates`, which is absent from the current navigation. Its
  2026-07-04 capture was already 88 characters and already recorded `looks_real: false`.
- **The payments page is NOT missing**, contrary to the brief that commissioned this work.
  `COMPLIANCE_WATCH.md:434` says NOT YET MIRRORED and `COMPLIANCE_WATCH.md:447` says
  MIRRORED 2026-07-25, thirteen lines apart in the same document. The file exists at
  `docs/stake-engine-live/2026-07-25/payments.md` and was committed in `b440145` at 17:22
  on 2026-07-25, thirty four minutes AFTER `d1b5b83` wrote the NOT YET MIRRORED line at
  16:48. Line 434 is stale and is ledgered as a JOB 3 finding.

## THE REGISTER

`obligation_on` is ARTEFACT, PROCESS, MATHS or STUDIO. `vis` is whether a player could see
whether it is satisfied. `corrob` is how many raw shard rows fused into this one, and is
PROVISIONAL.

| REQ | obligation | vis | source | requirement | corrob | shard rows |
|---|---|---|---|---|---|---|
| REQ-001 | ARTEFACT | YES | `approval_guidelines.md:18` | The shipped game must be functional, clear, communicative of what is happening, and technically performant, because these are the stated inspection axes. | 1 | R1-02 |
| REQ-002 | ARTEFACT | YES | `approval_guidelines.md:23` | Ship no jackpot, no gamble/double-up, no continuation of a prior round, and no early cashout control. | 1 | R1-05 |
| REQ-003 | ARTEFACT | YES | `approval_guidelines.md:24` | Every shipped asset and the game title must be clear of third-party IP; the team name carries the same obligation on the studio side. | 1 | R1-06 |
| REQ-004 | ARTEFACT | YES | `approval_guidelines.md:26` | No Stake marks, logos or Stake-themed motifs anywhere in shipped art, audio or text. | 1 | R1-08 |
| REQ-005 | ARTEFACT | YES | `approval_guidelines.md:27` | Content and finish must clear a subjective reviewer bar for taste and quality; there is no objective threshold to satisfy. | 1 | R1-09 |
| REQ-006 | ARTEFACT | YES | `approval_guidelines.md:28` | No child or child-like characters and no art, theme or tone that would appeal to minors. | 1 | R1-10 |
| REQ-007 | ARTEFACT | YES | `approval_guidelines.md:29` | Meet the social language requirements, since stake.us consideration is automatic and conditional on them. | 1 | R1-11 |
| REQ-008 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:18` | The rules/info popup must carry a disclaimer about how the game operates. | 1 | R1-18 |
| REQ-009 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:18` | Either reproduce the platform template disclaimer or write one that clearly conveys the same message; wording may differ, meaning may not. | 1 | R1-19 |
| REQ-010 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:22` | The disclaimer must convey that a malfunction voids all wins and plays. | 1 | R1-20 |
| REQ-011 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:22` | The disclaimer must convey that a consistent internet connection is required. | 1 | R1-21 |
| REQ-012 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:22` | The disclaimer must tell the player to reload the game after a disconnection to finish incomplete rounds. | 1 | R1-22 |
| REQ-013 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:22` | The disclaimer must convey that expected return is a long-run figure. | 1 | R1-23 |
| REQ-014 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:22` | The disclaimer must convey that the display is illustrative and models no physical machine. | 1 | R1-24 |
| REQ-015 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:22` | The disclaimer must convey that the RGS response, not the frontend, settles winnings. | 1 | R1-25 |
| REQ-016 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:22` | **RESOLVED ON THE PLATFORM'S OWN WORDS, 2026-07-29, JOB 4 of `reports/briefs/FS_CURRENCY_SERIAL_Prompt.md`. NOT EXPLICITLY MANDATED.** Method not guess, and the words are quoted rather than characterised, per convention (l.7), all from the 2026-07-29 capture. **The line itself**, the closing sentence of the platform's template at `approval_guidelines_general_disclaimer.md:22`: *"TM and © 2026 Stake Engine."* **The mandate sentence**, `:18`, and it is scoped to game operation: *"The game rules/information popup must include a brief disclaimer regarding game operation."* **The sentence that makes the template optional**, also `:18`: *"You are able to use our template disclaimer, or your own, so long as the same message is clearly conveyed."* So what binds is the MESSAGE about game operation; the template is one permitted way of conveying it, and a trademark and copyright attribution asserts nothing about game operation. **The platform's own restriction points the same way**, `approval_guidelines.md:26` verbatim: *"Game assets cannot include material with Stake™ branding or themes."* **Consequence: the brief's override condition ("if the platform explicitly mandates the TM line in-game") is NOT met**, so `CLAUDE.md`'s standing rule, "No Stake branding in shipped assets or text. Original IP only.", is not overridden and continues to govern. **Shipped position, verified 2026-07-29 by direct read:** no Stake attribution reaches a player in any of the sixteen locales; `frontend/src/lib/i18n/prose.ts:118` and `:211` carry the six message elements (REQ-010 to REQ-015) in the studio's own wording, and `frontend/src/lib/components/PaytableModal.svelte:62-64` appends the studio's own marks instead. **ONE OWNER QUESTION IS PARKED and no interpretation is shipped for it:** the platform never says whether it EXPECTS the attribution despite not requiring it, and a reviewer's expectation is not derivable from the text. | 1 | R1-26 |
| REQ-017 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:18` | For stake.us release, none of the listed restricted phrases may appear anywhere in the game, including rules text, images and UI elements, not just copy. | 1 | R1-27 |
| REQ-018 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:20` | Read the social=true/false URL query parameter and serve social-safe phrasing when it is true; the sweeps_<lang> language-file naming is a recommendation, not stated as mandatory. | 1 | R1-28 |
| REQ-019 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:25` | In social mode, never render "win feature"; use "play feature". Restated at line 60 with the same replacement. | 2 | R1-29, R1-30 |
| REQ-020 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:27` | In social mode, never render "paid out". Replacement given as "win" here and as "won" at line 57; upstream disagrees with itself. | 2 | R1-31, R1-33 |
| REQ-021 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:28` | In social mode, never render "stake"; use "play amount". | 7 | R1-32, R1-36, R1-44, R1-46, R1-52, R1-53, R1-59 |
| REQ-022 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:30` | In social mode, never render "betting"; use "play" or "playing". Restated at line 54 as "playing" alone. | 1 | R1-34 |
| REQ-023 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:31` | In social mode, never render "total bet". Replacement given as "total play" here and as "play" at line 55. | 1 | R1-35 |
| REQ-024 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:33` | In social mode, never render "bets"; use "plays". | 2 | R1-37, R1-47 |
| REQ-025 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:34` | In social mode, never render "cash"; use "coins". | 3 | R1-38, R1-43, R1-54 |
| REQ-026 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:35` | In social mode, never render "payer"; use "winner". | 1 | R1-39 |
| REQ-027 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:36` | In social mode, never render "pay"; use "win". | 1 | R1-40 |
| REQ-028 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:37` | In social mode, never render "pays"; use "wins". | 1 | R1-41 |
| REQ-029 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:38` | In social mode, never render "paid"; use "won". | 1 | R1-42 |
| REQ-030 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:41` | In social mode, never render "bought"; use "instantly triggered". | 1 | R1-45 |
| REQ-031 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:44` | In social mode, never render "rebet"; use "respin". | 1 | R1-48 |
| REQ-032 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:45` | In social mode, never render "cost of"; use "can be played for". | 1 | R1-49 |
| REQ-033 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:46` | In social mode, never render "credit"; use "balance". | 2 | R1-50, R1-61 |
| REQ-034 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:47` | In social mode, never render "buy bonus"; use "get bonus". | 2 | R1-51, R1-56 |
| REQ-035 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:51` | In social mode, never render "withdraw"; use "redeem". | 1 | R1-55 |
| REQ-036 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:53` | In social mode, never render "be awarded to player's accounts"; use "appear in player's accounts". Curly apostrophe is upstream. | 1 | R1-57 |
| REQ-037 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:58` | In social mode, never render "place your bets"; use "come and play" or "join in the game". | 1 | R1-58 |
| REQ-038 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:62` | In social mode, never render "currency"; use "token". | 1 | R1-60 |
| REQ-039 | ARTEFACT | YES | `approval_guidelines_math_verification.md:29` | State each mode's cost in the in-game rules and make it match the maths package cost for that mode. | 1 | R2-05 |
| REQ-040 | ARTEFACT | YES | `approval_guidelines_math_verification.md:30` | Make the max win figure printed in the game rules equal the maths package max win, per mode. | 1 | R2-08 |
| REQ-041 | ARTEFACT | YES | `approval_guidelines_math_verification.md:69` | Never submit a bet above 500,000 USD, so the bet ladder and any buy cost must stay at or under that ceiling or the round errors with 400. | 1 | R2-38 |
| REQ-042 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:23` | 3-star rating only: the build must read as studio quality on creativity, uniqueness and detail, which is the gate to the looser 3-star maths limits and to featured placement. | 1 | R2-43 |
| REQ-043 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:26` | 2-star rating only: the build must show considerable creativity or originality plus strong development quality, with polish allowed to trail established studios. | 1 | R2-44 |
| REQ-044 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:36` | Provide enough gameplay depth that a player keeps betting past the first spin or two; shallow depth is a named cause of a 1-star or lower rating. | 1 | R2-46 |
| REQ-045 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:37` | Do not ship generic machine-made looking assets: no default fonts, plain gradients, emoji icons or border effects standing in for real art. | 1 | R2-47 |
| REQ-046 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:38` | Keep one coherent art style across every surface and hold animation quality up; mismatched styles are a named cause of a low rating. | 1 | R2-48 |
| REQ-047 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:39` | Ship at least one real bonus mode plus additional mechanics; their absence is a named cause of a low rating. | 1 | R2-49 |
| REQ-048 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:44` | 3-star rating only: verify rendering across a range of devices and screen sizes, with no lag and no low-quality audio. | 1 | R2-50 |
| REQ-049 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:45` | 3-star rating only: keep the shipped bundle small, with no oversized assets slowing first load. | 1 | R2-51 |
| REQ-050 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:46` | 3-star rating only: animations and art must be clean, cohesive and professionally executed. | 1 | R2-52 |
| REQ-051 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:47` | 3-star rating and Burst-category games only: the concept itself must have depth and execution, benchmarked upstream against Cut n Crash, Angry Balls and Drop the Boss. Does not bind a non-Burst slot submission. | 1 | R2-53 |
| REQ-052 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:22` | Every shipped audio and visual asset must be original to this title, with no web-sdk sample-game backgrounds, symbols or animations remaining anywhere in the bundle. | 1 | R3-01 |
| REQ-053 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:23` | No broken or missing textures, sprites, fonts or animation states in any reachable game state. | 1 | R3-02 |
| REQ-054 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:24` | The game board must render undistorted in Stake's mini-player modal, that is at a small viewport size, not only at desktop and mobile sizes. | 1 | R3-03 |
| REQ-055 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:25` | Responsive layout across common phone and tablet viewports, with every control still reachable and operable while the viewport scales. | 1 | R3-04 |
| REQ-056 | ARTEFACT | NO | `approval_guidelines_front_end_communication.md:26` | No image or font may be fetched from any host other than the Stake Engine CDN; assets ship inside the uploaded bundle and are served from it. | 1 | R3-05 |
| REQ-057 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:28` | An in-game info or rules surface reachable from the UI that documents every rule of the game. | 1 | R3-06 |
| REQ-058 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:29` | For each of the five bet modes, state its cost multiplier and what the purchase actually buys, in the info surface. | 1 | R3-07 |
| REQ-059 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:30` | Display the RTP figure to the player, per mode where modes differ in the player's view. | 1 | R3-08 |
| REQ-060 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:31` | Show the max win cap for every mode in the player-facing information. | 1 | R3-09 |
| REQ-061 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:32` | A complete paytable covering every paying symbol and every paying combination length. | 1 | R3-10 |
| REQ-062 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:33` | Enumerate every obtainable value of special symbols, for example scatter instant-pay values and meter multiplier values, in the info surface. | 1 | R3-11 |
| REQ-063 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:34` | Document the trigger condition and the award for each feature entry path, in the form of an explicit scatter-count to spins-awarded statement. | 1 | R3-12 |
| REQ-064 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:36` | A UI guide section that names each button and says what it does. | 1 | R3-13 |
| REQ-065 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:37` | A working bet-size control in the main game UI. | 1 | R3-14 |
| REQ-066 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:38` | The bet ladder must be driven by the levels in the authenticate response, and every returned level must be selectable, not a hardcoded ladder. | 1 | R3-15 |
| REQ-067 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:39` | Show the live balance in the normal-play UI, updating with wagers and wins. | 1 | R3-16 |
| REQ-068 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:40` | Any round with a payout above zero must present its final win amount legibly. | 1 | R3-17 |
| REQ-069 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:41` | Multi-win rounds must tally up on screen across the winning actions and land exactly on the round's final payout multiplier. | 1 | R3-18 |
| REQ-070 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:42` | A player-reachable sound mute or disable control. | 1 | R3-19 |
| REQ-071 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:43` | Spacebar keypress triggers the bet or spin action. | 1 | R3-20 |
| REQ-072 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:44` | Autoplay must sit behind an explicit confirmation step, so a single click can never start a run of consecutive bets. | 1 | R3-21 |
| REQ-073 | ARTEFACT | NO | `approval_guidelines_front_end_communication.md:46` | Ship with no network or console errors, and no game outcome information logged where a player could read it ahead of the animation. | 1 | R3-22 |
| REQ-074 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:47` | Observed play, including paid combinations, must match the published rules and paytable exactly. | 1 | R3-23 |
| REQ-075 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:48` | The game must render and calculate correctly under every supported currency and language combination, not only the default pair. | 1 | R3-24 |
| REQ-076 | ARTEFACT | YES | `approval_guidelines_front_end_communication.md:49` | In turbo or fastplay, win amounts, winning combinations and popups must remain readable rather than being skipped or flashed. | 1 | R3-25 |
| REQ-077 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:19` | Parse replay query parameters at boot and enter a replay mode that loads the identified round, honouring currency, language, social mode and bet size parameters. | 1 | R3-26 |
| REQ-078 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:25` | Bet Replay must be implemented and working in the submitted build; absence is a rejection. Restated upstream at lines 29 and 33. | 1 | R3-27 |
| REQ-079 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:58,60` | Replay must load and play with no session and no authorisation, so a shared public URL works for a viewer who is not logged in. | 1 | R3-28 |
| REQ-080 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:68-73` | Read and use all six required query parameters: replay, game, version, mode, event, rgs_url. | 1 | R3-29 |
| REQ-081 | ARTEFACT | UNKNOWN | `approval_guidelines_game_replay_requirements.md:74-78` | Accept the five optional parameters and apply them where present: currency, amount, lang, device, social; behave sanely when they are absent. | 1 | R3-30 |
| REQ-082 | ARTEFACT | NO | `approval_guidelines_game_replay_requirements.md:81` | The front end fetches replay state from the RGS itself rather than reconstructing or embedding it locally. | 1 | R3-31 |
| REQ-083 | ARTEFACT | NO | `approval_guidelines_game_replay_requirements.md:84` | Build the replay request as a GET on exactly that path shape, with rgs_url taken from the query parameter and the four path segments in that order. | 1 | R3-32 |
| REQ-084 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:97-99` | Consume the response fields as specified: derive total payout from payoutMultiplier, derive bet cost from costMultiplier, and drive the animation from state. | 1 | R3-33 |
| REQ-085 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:105` | Fetch the round data on load, with no click or input needed to start loading. | 1 | R3-34 |
| REQ-086 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:109` | The replayed outcome must be presented identically to the original live round, not a summary or an approximation of it. | 1 | R3-35 |
| REQ-087 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:113` | After the replay finishes, the win amount and outcome stay on screen rather than clearing back to an idle board. | 1 | R3-36 |
| REQ-088 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:116,118-122` | Recommended, not stated as a must: in replay hide balance, play buttons, bet amount selector and autoplay settings, and keep win amount, replay controls, replay bet amount and currency display. The betting-control half of this is separately mandatory at R3-42. | 1 | R3-37 |
| REQ-089 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:127` | Branch into replay mode on the presence of replay=true in the URL. Introduced by line 125, "Your game must handle the following in replay mode:". | 1 | R3-38 |
| REQ-090 | ARTEFACT | NO | `approval_guidelines_game_replay_requirements.md:128` | Issue the replay fetch using the values taken from the query string, not defaults or hardcoded values. | 1 | R3-39 |
| REQ-091 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:129` | A visible loading indicator covers the fetch window. | 1 | R3-40 |
| REQ-092 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:130` | Once data has loaded, show a Play control that the viewer presses to begin the replay. | 1 | R3-41 |
| REQ-093 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:131` | Every betting control, including bet size, spin and buy, is hidden or non-functional in replay. Restated upstream at line 110. | 1 | R3-42 |
| REQ-094 | ARTEFACT | NO | `approval_guidelines_game_replay_requirements.md:132` | Replay makes no authenticate, play, end-round or wallet calls; only the public replay endpoint is touched. | 1 | R3-43 |
| REQ-095 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:133` | Replay drives the complete animation and audio pipeline, not a reduced or static presentation. Restated upstream at line 108. | 1 | R3-44 |
| REQ-096 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:134` | Present all three figures in replay: the bet cost, the payout, and the win amount. | 1 | R3-45 |
| REQ-097 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:135` | A Play Again control that restarts the same replay from the beginning. Restated upstream at line 112. | 1 | R3-46 |
| REQ-098 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:136` | A user-facing error state when the replay fetch fails, rather than a blank screen or a silent hang. | 1 | R3-47 |
| REQ-099 | ARTEFACT | YES | `approval_guidelines_game_replay_requirements.md:137` | No control or path anywhere in replay mode can begin a real-money session. | 1 | R3-48 |
| REQ-100 | ARTEFACT | NO | `approval_guidelines_rgs_communication.md:18` | All auth and all bet/wallet traffic goes to the Stake Engine RGS and nowhere else; no second transport, no studio-side wallet or session service. | 1 | R4-01 |
| REQ-101 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:21` | The bet ladder shown to the player is driven by the authenticate response for the session currency, not by hardcoded levels; a default bet outside the authenticated set must not be offered. Two consecutive sentences of one capture line. | 1 | R4-02 |
| REQ-102 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:22` | Plus/minus stepping and any typed or slider bet value must land on multiples permitted by `minStep` from the authenticate config. | 1 | R4-03 |
| REQ-103 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:23` | The RGS minimum and maximum must both be reachable in the UI (min bet and max bet selectable), at the values the RGS gave. | 1 | R4-04 |
| REQ-104 | ARTEFACT | NO | `approval_guidelines_rgs_communication.md:25` | Ship only static assets; zero runtime requests to any external host, including external font, CDN, analytics or image hosts. The same line names external font downloads as the common failure and notes they log console errors. | 1 | R4-05 |
| REQ-105 | ARTEFACT | NO | `approval_guidelines_rgs_communication.md:27` | Read the RGS host from the `rgs_url` query parameter at load and call that host; no hardcoded or environment-baked endpoint. | 1 | R4-06 |
| REQ-106 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:30` | English (`en`) must be present and complete; other languages are optional, so no other locale is required for approval. | 1 | R4-07 |
| REQ-107 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:30` | Passing any unsupported language code (the capture lists ar, de, en, es, fi, fr, hi, id, ja, ko, po, pt, ru, tr, zh, vi at lines 33 to 49) must fall back cleanly to readable English, never to blank, mojibake or raw key strings. | 1 | R4-08 |
| REQ-108 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:51` | The table at lines 51 to 100 is the display specification for every supported currency: for each currency code the game must render the platform's exact display token, on the platform's side of the amount (prefix for USD, CAD, JPY and most others; suffix for DKK, PLN, VND, CLP, ARS, SAR, ILS, AED, TND, OMR, QAR, XGC, XSC, XEC), matching the Example column. Header row, upstream tabs rendered as single spaces. | 1 | R4-09 |
| REQ-109 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:54` | Some currencies are specified with NO minor units in the Example column (JPY ¥10, IDR Rp10, KRW ₩10, VND 10 ₫, CLP 10 CLP at lines 54, 60, 61, 66, 68), so the amount formatter's decimal count is per currency and not globally two. Single table row, upstream tabs rendered as single spaces. | 1 | R4-10 |
| REQ-110 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:99 and :100` | Two distinct currency codes, XSC and XEC, share one display token "SC" as a suffix with two decimals and a space before the token; the game must not derive the display token by assuming a one-to-one code-to-symbol mapping, and must not print the raw code. Two adjacent table rows quoted separately, upstream tabs rendered as single spaces. | 1 | R4-11 |
| REQ-111 | ARTEFACT | YES | `rgs.md:35` | Call /wallet/authenticate on first load and before any play, balance or end-round call; do not issue those three before authenticate has returned. | 1 | R5-01 |
| REQ-112 | ARTEFACT | YES | `rgs.md:37` | Every round opened by /wallet/play is closed by /wallet/end-round once the round, including its animations, has finished. | 1 | R5-02 |
| REQ-113 | ARTEFACT | YES | `rgs_wallet.md:26` | On load, inspect the round object from authenticate and resume an active round rather than starting fresh; rgs.md:41 names round.event as the resume position. | 1 | R5-03 |
| REQ-114 | ARTEFACT | YES | `rgs.md:45` | Read sessionID, lang, device and rgs_url from the launch URL query string and drive both RGS calls and display from them. | 1 | R5-04 |
| REQ-115 | ARTEFACT | NO | `rgs.md:51` | Include the launch sessionID in the body of every RGS request the game makes. | 1 | R5-05 |
| REQ-116 | ARTEFACT | NO | `rgs.md:54` | Take the RGS base URL from the rgs_url query parameter at runtime; no build-time or constant RGS host anywhere in the shipped bundle. | 1 | R5-06 |
| REQ-117 | ARTEFACT | YES | `rgs.md:57` | Interpret lang as a two-letter ISO 639-1 code when selecting the display language (the page then lists 16 supported codes plus 'da'). | 1 | R5-07 |
| REQ-118 | ARTEFACT | YES | `rgs.md:80` | Send and receive all money as integer micros at 1e6 scale, converting only for display; a $1 bet is the integer 1000000 (rgs.md:88). | 1 | R5-08 |
| REQ-119 | ARTEFACT | NO | `rgs.md:90` | Keep currency out of round logic, bet arithmetic and outcome selection; it may change only formatting. | 1 | R5-09 |
| REQ-120 | ARTEFACT | YES | `rgs.md:144` | Format displayed balances with the platform's per-currency symbol, decimal count and symbol placement (the CurrencyMeta table at rgs.md:204 to 257), falling back to code-after-amount for unknown codes. Normative force is weaker than the other rows here: the page offers the functions as help rather than mandating them, and the obligation is the display format they produce. | 1 | R5-10 |
| REQ-121 | ARTEFACT | YES | `rgs.md:288` | Clamp every wager the game can submit to the authenticated minBet and maxBet, not to a hardcoded ladder. | 1 | R5-11 |
| REQ-122 | ARTEFACT | YES | `rgs.md:289` | Every submittable bet is an exact integer multiple of the authenticated stepBet. | 1 | R5-12 |
| REQ-123 | ARTEFACT | YES | `rgs.md:291` | Drive the player-facing bet ladder from the betLevels array in the authenticate response. | 1 | R5-13 |
| REQ-124 | ARTEFACT | YES | `rgs.md:295` | Offer bet levels starting at $0.01, $0.02, $0.05 and $0.10 rather than a $0.10 floor. | 1 | R5-14 |
| REQ-125 | ARTEFACT | YES | `rgs.md:295` | Determine the game's minimum win multiplier and render win amounts with 3 decimal places if it is >= 0.1x, 4 if it is below. | 1 | R5-15 |
| REQ-126 | ARTEFACT | YES | `rgs.md:297` | Show the extra decimal places only while the base bet is under $0.10; above that, use normal currency precision. | 1 | R5-16 |
| REQ-127 | ARTEFACT | YES | `rgs.md:297` | In-game win readouts must show the exact win amount with no rounding; the balance readout may stay at 2 decimal places. | 1 | R5-17 |
| REQ-128 | ARTEFACT | YES | `rgs.md:319 and rgs.md:321` | Compute and present the cost of a play as base bet times the selected bet mode's cost multiplier, and expect the wallet to debit that amount. | 1 | R5-18 |
| REQ-129 | ARTEFACT | NO | `rgs_wallet.md:81-85` | The play request body carries amount (integer micros), sessionID and mode, so the selected bet mode must reach the RGS on every play. Note the page gives an explicit POST path for authenticate, balance, end-round and /bet/event but none for play. | 1 | R5-20 |
| REQ-130 | ARTEFACT | YES | `rgs_example.md:33` | A winning round is not paid until the frontend itself calls /end-round; the game must call it rather than assume the RGS settles automatically. | 1 | R5-21 |
| REQ-131 | ARTEFACT | YES | `rgs_example.md:57` | A Vite-built frontend must set base to "./" so the bundle resolves its assets relative to the hosted game path. | 1 | R5-23 |
| REQ-132 | ARTEFACT | YES | `front_end_flowchart.md:22` | The client must play back the round's bookEvents strictly in the order the book supplies them, resolving each one before starting the next, so no later event (for example a win presentation) is shown ahead of an earlier one (for example the spin or reveal). | 1 | R6-01 |
| REQ-133 | ARTEFACT | YES | `terms.md:363+365` | The shipped game must be fully functional at the activation date, with no non-working feature or dead control. | 1 | R9-01 |
| REQ-134 | ARTEFACT | UNKNOWN | `terms.md:363+367` | Build to every written Stake Engine technical specification, and treat later written specs as binding on the shipped game. | 1 | R9-02 |
| REQ-135 | ARTEFACT | NO | `terms.md:363+369` | The game's runtime behaviour must match the documentation handed to Carrot, so the docs and the build cannot diverge. | 1 | R9-03 |
| REQ-136 | ARTEFACT | NO | `terms.md:363+371` | Ship free of malware and of defects affecting proper functioning, and actually run anti-virus and anti-malware screening over the artefact before submission. | 1 | R9-04 |
| REQ-137 | ARTEFACT | YES | `terms.md:363+373` | No Prohibited Content anywhere in the game, including references to it; see R9-06 for the definition that binds this. | 1 | R9-05 |
| REQ-138 | ARTEFACT | YES | `terms.md:112` | Audit every shipped string, symbol, sound and marketing asset against these four categories, including third-party IP infringement. | 1 | R9-06 |
| REQ-139 | ARTEFACT | NO | `terms.md:363+375` | Run and record a security pass over the shipped bundle and its dependencies, and remove what it finds. | 1 | R9-07 |
| REQ-140 | ARTEFACT | YES | `terms.md:363+377` | What the player sees on the reels, in win presentation and on the paytable must be the same event the maths package emitted, with no drift between the two. | 1 | R9-08 |
| REQ-141 | ARTEFACT | YES | `terms.md:363+379` | The submitted title must be materially distinct from anything already uploaded, not a reskin; also blocks submitting a second near-identical build of our own. | 1 | R9-09 |
| REQ-142 | ARTEFACT | YES | `terms.md:263+273` | Nothing in the shipped game may embarrass Carrot or Stake; this is the clause a machine-generated-looking string, a placeholder or an off-brand asset would be judged under. | 1 | R9-10 |
| REQ-143 | ARTEFACT | NO | `terms.md:355` | Prove no GPL or other copyleft dependency is bundled into, compiled with or linked to the shipped build, and that every third-party licence in the tree is complied with. | 1 | R9-11 |
| REQ-144 | ARTEFACT | NO | `terms.md:353` | Same conformance obligation as R9-03, stated as a warranty with a remedy: on written notice we must change the game to match the documentation. | 1 | R9-12 |
| REQ-145 | ARTEFACT | NO | `terms.md:301+305` | The game's software must not obstruct the operator's source-of-funds and identity checks, so wallet and session handling has to leave those platform processes intact. | 1 | R9-13 |
| REQ-146 | ARTEFACT | NO | `terms.md:666` | The shipped game must not collect, store or transmit player personal data to us: no studio-side analytics, telemetry or logging endpoint carrying player data. | 1 | R9-14 |
| REQ-147 | ARTEFACT | YES | `giveaway_terms.md:46` | The submitted game must be original, guideline-compliant, non-infringing and free of unlawful, offensive or defamatory content; the competition rules re-impose the terms' content standard as an entry condition. | 1 | R9-32 |
| REQ-148 | ARTEFACT | YES | `giveaway_terms.md:80` | An entry that reads as produced by unauthorised automated tooling, AI generation or plagiarism can be disqualified on SUSPICION, so machine-generated tells in shipped strings and assets are a disqualification risk, not merely a quality one. | 1 | R9-33 |
| REQ-149 | PROCESS | NO | `approval_guidelines.md:18` | Name the exact frontend build and maths version in the approval request, and expect approval to bind to that pair only. | 1 | R1-01 |
| REQ-150 | PROCESS | NO | `approval_guidelines.md:20` | Write and submit a short theme-and-mechanics blurb alongside the approval request. | 1 | R1-03 |
| REQ-151 | PROCESS | NO | `approval_guidelines.md:32` | Submit only a finished build; work-in-progress submissions are out of order. | 1 | R1-12 |
| REQ-152 | PROCESS | NO | `approval_guidelines.md:34` | Treat the maths model, the mode list and the gameplay mechanics as frozen at approval; post-approval changes are limited to minor visual fixes. | 1 | R1-13 |
| REQ-153 | PROCESS | NO | `approval_guidelines_submission_checklist.md:18` | Clear every requirement before submitting; a partial submission is held rather than reviewed. | 1 | R1-14 |
| REQ-154 | PROCESS | NO | `approval_guidelines_submission_checklist.md:28` | The itemised approval criteria are behind a platform login and are NOT in this capture. The actual checklist items are UNKNOWN to this register and must be retrieved from a logged-in session before any squad claims coverage of them. | 1 | R1-15 |
| REQ-155 | PROCESS | NO | `approval_guidelines_submission_checklist.md:24` | Retrieve the criteria list that applies to this team's own trust level, because the applicable set is not fixed across teams. | 1 | R1-16 |
| REQ-156 | PROCESS | NO | `approval_guidelines_submission_checklist.md:32,34,35` | The build must average at least 1 star over three independent reviewers across design, gameplay and maths compliance, or it is rejected. | 1 | R1-17 |
| REQ-157 | PROCESS | NO | `approval_guidelines_math_verification.md:24` | Treat the two size caps as publish-time blockers, so the size check happens before upload rather than after a failed publish. | 1 | R2-03 |
| REQ-158 | PROCESS | NO | `approval_guidelines_math_verification.md:38` | Report the count of non-zero weight payouts as part of the submitted maths evidence. | 1 | R2-15 |
| REQ-159 | PROCESS | NO | `approval_guidelines_game_quality_rankings.md:31` | A 1-star outcome blocks publication and forces a rework and resubmission cycle, so the submission must clear 1 star to ship at all. | 1 | R2-45 |
| REQ-160 | PROCESS | NO | `approval_guidelines_game_replay_requirements.md:140,142-146` | Be ready to hand the reviewer, for each of the five bet modes, event IDs covering normal win, big win, win cap, zero-payout loss and bonus trigger. Foreshadowed upstream at line 32. | 1 | R3-49 |
| REQ-161 | PROCESS | NO | `approval_guidelines_game_replay_requirements.md:148` | Exercise replay on max-win and rare-feature event IDs before submission, and record that it was done. | 1 | R3-50 |
| REQ-162 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:18` | Every submission package includes the tile source assets; the platform composes the tile from them, so the submission is incomplete without them. | 1 | R4-12 |
| REQ-163 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:22 to :26` | Exactly three assets are required per tile: background, foreground and provider logo. Spans capture lines 22, 24, 25 and 26, joined with single spaces. | 1 | R4-14 |
| REQ-164 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:28` | Background plus foreground must total 3MB or less as a pair; the provider logo is not named in this cap. | 1 | R4-15 |
| REQ-165 | PROCESS | YES | `approval_guidelines_game_tile_requirements.md:31` | The background asset must depict the game's environment or setting, not a logo, a symbol sheet or a flat colour field. | 1 | R4-16 |
| REQ-166 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:32` | Background is delivered as a high resolution PNG or JPG; either is acceptable for this asset only. | 1 | R4-17 |
| REQ-167 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:33` | Name the background file `<GameTitle>-BG.<ext>`, game title first, `-BG` suffix, real extension. | 1 | R4-18 |
| REQ-168 | PROCESS | YES | `approval_guidelines_game_tile_requirements.md:35` | The foreground asset must be a single representative character or hero item, cut out from any scene. | 1 | R4-19 |
| REQ-169 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:36` | Foreground is delivered as a high resolution PNG with a genuine alpha channel; JPG is not permitted for this asset. | 1 | R4-20 |
| REQ-170 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:37` | Name the foreground file `<GameTitle>-FG.png`. | 1 | R4-21 |
| REQ-171 | PROCESS | YES | `approval_guidelines_game_tile_requirements.md:39` | Supply the studio's official provider logo, not the game logo or a wordmark variant. | 1 | R4-22 |
| REQ-172 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:40` | Provider logo is delivered as a high resolution PNG with a genuine alpha channel (same clause as R4-20 but stated for the logo asset). | 1 | R4-23 |
| REQ-173 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:41` | Name the logo file `<ProviderName>-Logo.png`, provider name first, `-Logo` suffix. | 1 | R4-24 |
| REQ-174 | PROCESS | YES | `approval_guidelines_game_tile_requirements.md:42` | The provider logo must stay readable when scaled down to tile size, so thin strokes and small type in the logo are a defect. | 1 | R4-25 |
| REQ-175 | PROCESS | UNKNOWN | `approval_guidelines_game_tile_requirements.md:16 to :43` | Tile pixel geometry is NOT stated anywhere in this capture: no pixel dimensions, no aspect ratio, no minimum resolution number, no safe area, no colour space. The only size-adjacent clauses are "High resolution" (lines 32, 36, 40) and the 3MB combined cap (line 28). Any specific tile geometry figure must come from another source, not from this page. | 1 | R4-26 |
| REQ-176 | PROCESS | NO | `rgs_example.md:68` | At submission, upload the contents of dist/ (not the folder itself) into the platform's frontend files slot. | 1 | R5-24 |
| REQ-177 | PROCESS | NO | `terms.md:295` | Budget for a fix-or-workaround loop during acceptance testing, at our own cost. | 1 | R9-16 |
| REQ-178 | PROCESS | NO | `terms.md:293` | Written notification to Carrot the moment we detect a defect, including ones we find ourselves after submission. | 1 | R9-17 |
| REQ-179 | PROCESS | NO | `terms.md:157` | Submission is an upload to the platform for assessment against criteria Carrot sets and can change. | 1 | R9-18 |
| REQ-180 | PROCESS | NO | `terms.md:167` | Do not treat an upload, a passing gate or a portal state as acceptance; only Carrot's written notice is acceptance. | 1 | R9-19 |
| REQ-181 | PROCESS | NO | `terms.md:189` | Deliver object code within 3 days of acceptance, and any updated object code within 10 days of finishing a modification or new version. | 1 | R9-20 |
| REQ-182 | PROCESS | NO | `terms.md:191` | Keep the source deliverable on 3 days' notice, in a buildable state as of the request date. | 1 | R9-21 |
| REQ-183 | PROCESS | NO | `terms.md:227` | Produce and hand over integration, operation and ongoing-management documentation; this is the same Game Documentation the artefact must conform to under R9-03 and R9-12. | 1 | R9-22 |
| REQ-184 | PROCESS | NO | `terms.md:279` | Staff and fund pre-launch integration and functional testing ourselves. | 1 | R9-23 |
| REQ-185 | PROCESS | NO | `terms.md:283` | Every test obligation in the agreement is a cross-OS and cross-browser matrix, not a single-browser run. | 1 | R9-24 |
| REQ-186 | PROCESS | NO | `terms.md:397+403` | Complete identity and verification document submission, otherwise no fee is payable however well the game performs. | 1 | R9-25 |
| REQ-187 | PROCESS | NO | `terms.md:179` | Grant Carrot continuous real-time access to the development environment, which in practice means the repository and build environment must be presentable at any moment. | 1 | R9-26 |
| REQ-188 | PROCESS | NO | `terms.md:255` | Fund and supply whatever the certification and jurisdictional-approval process asks for, where the requirement stems from our own design. | 1 | R9-27 |
| REQ-189 | PROCESS | NO | `terms.md:385` | On any notified breach of the clause 7.1a) game standards, remediate immediately at our cost; failure to satisfy Carrot leads to deactivation and licence termination under 7.1c). | 1 | R9-28 |
| REQ-190 | PROCESS | NO | `privacy.md:34+36-41` | At registration the studio must supply these six items, including an explicit 18-or-over confirmation and a declaration of individual-developer or authorised-company-representative status, plus a link to the GitHub repository. | 1 | R9-30 |
| REQ-191 | PROCESS | NO | `giveaway_terms.md:40` | Three entry steps, all completed before the Closing Date: hold an account, build the game on the platform, and submit it through the platform's own submission process. | 1 | R9-34 |
| REQ-192 | PROCESS | NO | `giveaway_terms.md:25` | Hard submission deadline for competition eligibility, 11:59pm AEDT 1 August 2026; entries after it are not considered, and the Promoter may move the date by publishing an update. | 1 | R9-35 |
| REQ-193 | PROCESS | NO | `giveaway_terms.md:42` | Prize eligibility requires the platform's own rating of at least 3 stars, awarded at Stake Engine's sole discretion across quality, originality, playability, technical execution and commercial potential; line 44 adds that each game must independently achieve it. | 1 | R9-36 |
| REQ-194 | PROCESS | NO | `payments.md:81` | Register exactly one payout wallet on the team settings page; without it no payout can be made. | 1 | R9-38 |
| REQ-195 | MATHS | UNKNOWN | `approval_guidelines.md:23` | The maths package must produce each round independently, with no carry-over of outcome state between bets. | 1 | R1-04 |
| REQ-196 | MATHS | NO | `approval_guidelines_math_verification.md:21` | Keep every published events file (.jsonl.zst) under 4.2GB, which bounds simulation count and per-event payload size. | 1 | R2-01 |
| REQ-197 | MATHS | NO | `approval_guidelines_math_verification.md:22` | Cap total events per game mode at 10,000,000, counted across the mode's whole books set. | 1 | R2-02 |
| REQ-198 | MATHS | NO | `approval_guidelines_math_verification.md:26` | Supply summary statistics and hit-rate tables that stand up to review as conventional for a chance-based casino game and that do not misrepresent the game. | 1 | R2-04 |
| REQ-199 | MATHS | NO | `approval_guidelines_math_verification.md:30` | Land the calculated RTP of the locked package inside the band 90.0 per cent to 96.70 per cent. | 1 | R2-06 |
| REQ-200 | MATHS | NO | `approval_guidelines_math_verification.md:30` | Hold every mode's RTP within 0.5 per cent of the others. Upstream's own worked example uses 97 per cent, which sits above the band quoted in R2-06; the tension is upstream's, quoted as found, not resolved here. | 1 | R2-07 |
| REQ-201 | MATHS | NO | `approval_guidelines_math_verification.md:31` | Weight the max win so its probability is typically better than 1 in 10,000,000, judged against the payout size. | 1 | R2-09 |
| REQ-202 | MATHS | NO | `approval_guidelines_math_verification.md:32` | Generate between 100,000 and 1,000,000 simulations per slot mode so a single player session does not see repeated outcomes. | 1 | R2-10 |
| REQ-203 | MATHS | UNKNOWN | `approval_guidelines_math_verification.md:33` | Keep the non-paying share of the simulation set well below the 90 per cent example given, which is named as grounds for rejection. | 1 | R2-11 |
| REQ-204 | MATHS | YES | `approval_guidelines_math_verification.md:34` | Stop any single book outcome dominating the weights where the presentation implies varied results. | 1 | R2-12 |
| REQ-205 | MATHS | UNKNOWN | `approval_guidelines_math_verification.md:36` | Achieve a non-zero win hit rate of better than 1 in 20 bets. | 1 | R2-13 |
| REQ-206 | MATHS | NO | `approval_guidelines_math_verification.md:37` | Keep the standard deviation of any 1x cost base mode inside conventional slot volatility, bounded numerically by the per-tier SD limits below. | 1 | R2-14 |
| REQ-207 | MATHS | NO | `approval_guidelines_math_verification.md:38` | Ensure zero-weight payout rows are not the bulk of the supplied simulation set. | 1 | R2-16 |
| REQ-208 | MATHS | UNKNOWN | `approval_guidelines_math_verification.md:39` | Check the win-range distribution for holes and make intermediate win bands reachable between small wins and the max win. | 1 | R2-17 |
| REQ-209 | MATHS | NO | `approval_guidelines_math_verification.md:45` | 2-star games only: total exposure must not exceed 10,000,000 dollars. | 2 | R2-18, R2-28 |
| REQ-210 | MATHS | YES | `approval_guidelines_math_verification.md:46` | 2-star games only: max win multiplier must not exceed 25,000x. | 2 | R2-19, R2-29 |
| REQ-211 | MATHS | YES | `approval_guidelines_math_verification.md:47` | 2-star games only: the highest bet cost offered must not exceed 100,000 dollars. | 2 | R2-20, R2-30 |
| REQ-212 | MATHS | YES | `approval_guidelines_math_verification.md:48` | 2-star games only: no purchasable mode may cost more than 1,000x the base bet. | 2 | R2-21, R2-31 |
| REQ-213 | MATHS | NO | `approval_guidelines_math_verification.md:49` | 2-star games only: base mode standard deviation must be at least 0.6. | 2 | R2-22, R2-32 |
| REQ-214 | MATHS | NO | `approval_guidelines_math_verification.md:50` | 2-star games only: base mode standard deviation must not exceed 50.0. | 2 | R2-23, R2-33 |
| REQ-215 | MATHS | NO | `approval_guidelines_math_verification.md:51` | 2-star games only: cumulative probability of a payout at or above 5000x must not exceed 1e-2, and at or above 10000x must not exceed 8e-2, after the high-cost scaling in R2-40. | 1 | R2-24 |
| REQ-216 | MATHS | NO | `approval_guidelines_math_verification.md:52` | 2-star games only: CVaR must not exceed 700. | 2 | R2-25, R2-35 |
| REQ-217 | MATHS | NO | `approval_guidelines_math_verification.md:53` | 2-star games only: expected tail liability from wins above 40x bet must not exceed 0.8. | 3 | R2-26, R2-36, R2-37 |
| REQ-218 | MATHS | NO | `approval_guidelines_math_verification.md:54` | 2-star games only: expected tail liability measured on the above-10000x tail must not exceed 0.6. | 1 | R2-27 |
| REQ-219 | MATHS | NO | `approval_guidelines_math_verification.md:64` | 3-star games only: cumulative probability at or above 5000x must not exceed 1e-2, and at or above 10000x must not exceed 2e-2, which is stricter than the 2-star 8e-2. | 1 | R2-34 |
| REQ-220 | MATHS | NO | `approval_guidelines_math_verification.md:73` | Compute P(>=5000x) and P(>=10000x) for every mode and compare the worst mode, not an average, against the tier limit. | 1 | R2-39 |
| REQ-221 | MATHS | NO | `approval_guidelines_math_verification.md:75-77` | Scale the measured tail probability of a high-cost mode by 0.2, 0.5 or 0.8 according to its cost multiplier band before testing it against the tier limit. | 1 | R2-40 |
| REQ-222 | MATHS | NO | `approval_guidelines_math_verification.md:83` | Compute and report both the normalised CVaR (CVaR divided by bet cost) and the un-normalised CVaR over the worst 0.1 per cent of outcomes. | 1 | R2-41 |
| REQ-223 | MATHS | NO | `approval_guidelines_math_verification.md:87` | Compute ETL as the share of total RTP coming from wins at or above 40x the cost multiplier, falling back to the above-10,000x threshold where 40x does not apply. | 1 | R2-42 |
| REQ-224 | MATHS | NO | `rgs.md:341` | The published math files must match the platform's file-format specification exactly; format errors block publication. Both captures end on this same sentence (also rgs_wallet.md:151); the format itself is not stated on these pages. | 1 | R5-19 |
| REQ-225 | MATHS | NO | `rgs_example.md:39-43` | The publication set must include the Zstandard-compressed simulation results, the matching lookup table, and index.json, which the page marks as required. | 1 | R5-22 |
| REQ-226 | STUDIO | NO | `approval_guidelines.md:25` | Be able to show the game is an original design and is not a purchased or licensed title already live elsewhere. | 1 | R1-07 |
| REQ-227 | STUDIO | YES | `approval_guidelines_game_tile_requirements.md:20` | A quality expectation on the supplied artwork rather than a measurable limit: the assets must read as professional and appealing, and the same line warns low-quality artwork costs player trust and engagement. | 1 | R4-13 |
| REQ-228 | STUDIO | UNKNOWN | `terms.md:213` | Listed rather than folded into R9-29 because it is a branding rule: once the title is licensed, the studio cannot use that name or a confusable variant for its own corporate name, marks or domains. | 1 | R9-15 |
| REQ-229 | STUDIO | NO | `terms.md:345` | SUMMARY ROW for terms.md. A grep of terms.md finds 100 lines carrying shall / must / will not / may not, of which 60 carry a Developer-directed normative. R9-01 to R9-28 above enumerate 27 of them as ARTEFACT or PROCESS and R9-15 as a content-adjacent branding rule, leaving roughly 32 Developer-directed clauses that are purely commercial or legal and place nothing on the shipped build: the exclusive perpetual licence grant and its scope (4.4 to 4.12), no competing or derivative game and no third-party distribution (5.1a i to iv), new-game right of first refusal (5.2), exclusivity to the Websites (4.14), mutual and developer warranties of capacity, authority, licences and lawful conduct (6.1, 6.2 i to v and viii), fee mechanics including the USD $1,000 accrual threshold, USDT payment and developer-borne tax (Key Definitions line 33, 8.1), IP enforcement and notification (9), infringement and general indemnities (10), liability and the no-class-action covenant (11), confidentiality and return or destruction of Confidential Information (12), right of first offer on any IPR sale (13), term, termination, suspension and step-in (14), data-protection allocation other than R9-14 (15.1, 15.3 to 15.11, which sit on Carrot), governing law and dispute escalation (16), notices, anti-bribery, assignment, and the one-year post-term insurance obligation (17, 17.16). None of these can be violated by the artefact's content or strings. | 1 | R9-29 |
| REQ-230 | STUDIO | NO | `privacy.md:56` | SUMMARY ROW for privacy.md. COUNT OF STUDIO OBLIGATIONS ON US: ZERO. Every operative statement on this page is first-person Carrot Gaming ("we collect", "we use this data to", "We do not share", "We use strong security practices", "We retain your data only as long as necessary"), i.e. obligations on Carrot Gaming Pty Ltd as controller, plus a GDPR rights list the studio may exercise by contacting support@stake-engine.com. The page is about DEVELOPER personal data, never player data; it places nothing on the artefact and nothing on our company beyond the registration items at R9-30. | 1 | R9-31 |
| REQ-231 | STUDIO | NO | `giveaway_terms.md:34` | SUMMARY ROW for giveaway_terms.md. NINE remaining lines carry a normative marker and are commercial or legal obligations on the entrant rather than on the build: lines 21 (agreement to the Rules, the Terms and the Privacy Policy, with the Rules prevailing on inconsistency), 30 (entries after the Closing Date not considered), 34 and 36 (18-plus, account, Excluded Territories, ineligible persons, void entries), 44 (each game independently rated, restating R9-36), 54 (consent to the winner's name or username being announced), 64 and 68 (prize non-transferable, and all taxes, duties, levies, import and customs costs the winner's sole responsibility), 72 (non-exclusive perpetual royalty-free promotional licence over the entry including game name and screenshots, plus an originality warranty and indemnity) and 92 (void where prohibited, Victorian law and jurisdiction). None can be violated by the artefact's content or strings. | 1 | R9-37 |
| REQ-232 | STUDIO | NO | `payments.md:18` | SUMMARY ROW for payments.md. SEVEN operative lines, all commercial elections or platform-side mechanics on the studio's revenue rather than on the build: the per-team model election and its next-month effective date (line 18), the two models and rates, 10% of actual GGR or 7.5% of expected GGR (lines 20 to 22), the GGR formula "GGR = Total Bets − Total Wins Paid to Players" (line 26), carried-forward negative balance with no time limit and no out-of-pocket payment to Stake (lines 33, 43 to 46), that debt carried into the 7.5% model must still be earned off (line 57), and the payout cycle, first of the month with funds within 12 hours (line 82). NOTED FOR THE MARSHAL, not raised as a row: line 83 reads "We pay out any amount above $0.00 — even $0.10", while terms.md:395 sets a USD $1,000 accrual threshold below which nothing is paid and the amount rolls over. The two documents state different payout floors; this shard records both quotes and does not resolve them. | 1 | R9-39 |

## ADDENDUM 2026-08-10, R043 close-out: rows moved by the run, and one superseded source page

The register above stands as built against the 2026-07-29 capture; this dated addendum
records what the R043 run changed rather than rewriting history.

**Requirements moved by this run:**

| REQ | Was | Now | Evidence |
|---|---|---|---|
| REQ-095 (replay drives the complete animation AND AUDIO pipeline) | Walk W05 found the audio half reduced: only GameGrid's own reel cues fired, the win sound and wincap cue never, and a feature replay skipped its triggering spin | **SATISFIED**: the win-presentation and wincap cues fire at live play's own call points, and a feature replay animates its triggering spin (scatter lands audible) through the same pipeline | `frontend/scripts/r043_replay_audio_proof.mjs`, 10 assertions on the shipped bundle plus seeded self-test; frames and cue trace at `reports/screens/r043-replay-audio/` |
| REQ-112 / REQ-130 (every round closed by end-round; the game itself settles) | Satisfied for the success path; the FAILURE path refunded the stake on screen while the RGS held the round open (blocker B12) | **SATISFIED INCLUDING THE FAILURE MODE**: a settle failure now fails closed, the debit is never refunded on assumption, the settle-failed guard blocks betting, and the reload path settles through the idempotent end-round leg | `frontend/scripts/r043_settle_failure_proof.mjs`, 17 assertions; `sessionRecovery.resyncAfterSpinRejection` |
| REQ-113 (resume an active round from authenticate) | Satisfied at boot | Unchanged at boot, and now ALSO the recovery surface for a mid-session settle failure, per the pinned-client derivation in `sessionRecovery.ts` | same proof, scenario B |

**One source page superseded.** Every `approval_guidelines_math_verification.md` citation
above (REQ-210 to REQ-223 among others) cites the 2026-07-29 capture of a page the
platform REWROTE by 2026-08-10: the new capture at
`docs/stake-engine-live/2026-08-10/approval_guidelines_math_verification.md` publishes a
Critical Tests table, bet-level template caps and per-rating CVaR and tail figures that
the old page did not state (COMPLIANCE_WATCH.md, 2026-08-10 entry, STOP item 1). The
maths rows of this register need re-enumeration against the new page in Fable's
verification round; they are not edited here because each cites its capture by date and
stands as a true record of that capture.
