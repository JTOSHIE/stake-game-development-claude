# Submission Checklist (the fifty-one), captured 2026-08-13

- **Source URL**: `https://stake-engine.com/docs/approval-guidelines/submission-checklist?team=we-roll-spinners`
- **Capture method**: application browser pane, logged-in portal session (the R053 flow's
  origin approval), page text extracted from the rendered `<main>` element on 2026-08-13.
- **State at capture**: every box unticked, 0 of 51, matching the R056 brief's "currently
  0/51". No box was ticked this session; ticking is the owner's.
- **Transcription rule**: the checklist items and section headings below are VERBATIM,
  including the platform's own spelling ("sucessfully", "Approval requests is closed",
  "emoji's"), casing ("RGS requests", "Final approval checklist") and punctuation. Item
  numbers in square brackets are OURS, added for reference by the mapping table at
  `docs/records/GUIDELINES_51_MAPPING_2026-08-13.md`; the page itself is unnumbered.
- **Counts by section**: PreChecks 4, Compliance Checks 3, Game Thumbnail 1, RGS
  Requirements 6 (Bet Levels 2, Currency Support 2, RGS requests 2), Frontend
  Requirements 2, Game Rules 6, Auto Play 2, Responsive Checks 5, Sounds / Music 1,
  Multiple Language Support 4, Jurisdiction Requirements (Stake.US) 5, Replay Support 5,
  Final approval checklist 7. Total 51.

The page frames the checklist with: "Use this checklist before submitting your game for
approval." and "The checklist below is the criteria applied to a new team. Requirements
may vary once your team builds a track record, so your own review checklist can differ
slightly."

## PreChecks

- [01] Game authenticates with RGS sucessfully on game launch
- [02] Game authentication fails correctly with an invalid rgs_url
- [03] Clicking on the bet button sends a successful play request to RGS
- [04] Game should not contain the Stake Engine Loader

## Compliance Checks

- [05] Game title is unique and does not use restricted terms
- [06] Game assets and imagery do not contain offensive or inappropriate content
- [07] Game is sufficiently distinct from existing titles and series

## Game Thumbnail

- [08] Game thumbnail meets Stake artwork guidelines

## RGS Requirements

### Bet Levels

- [09] Game dynamically uses all betting parameters from the authenticate response
- [10] Active rounds restore the bet amount from the authenticate response

### Currency Support

- [11] Game supports and displays currencies correctly
- [12] Game displays sub-cent payouts correctly

### RGS requests

- [13] Zero-win bets do not send an end-round request to the RGS
- [14] Insufficient balance bets do not send a play request to the RGS

## Frontend Requirements

- [15] Main game frame should not be scrollable
- [16] Space bar should be bound to the bet button

## Game Rules

- [17] RTP and Max Win are clearly stated within the game rules
- [18] Payout information per symbol must be clearly communicated
- [19] Win combinations are displayed in the game rules
- [20] Game modes include description and cost information
- [21] Free game and re-trigger conditions are clearly displayed in the game rules
- [22] General disclaimer is included in the game information

## Auto Play

- [23] Auto-bet requires a confirmation step before starting
- [24] High cost bet modes require confirmation before activation

## Responsive Checks

- [25] Game functions correctly on Desktop/Laptop
- [26] Game functions correctly on Popout S/L
- [27] Game functions correctly on Mobile
- [28] Double tap to zoom is disabled on mobile
- [29] User interaction guide is included in the game information

## Sounds / Music

- [30] Game provides an option to disable sounds

## Multiple Language Support

- [31] Game supports English language
- [32] Invalid language parameters do not break game display
- [33] Check 5 wins for each game mode against the Game Rules
- [34] If Mystery Mode is present in the game, any numerical values representing chances or probabilities are accurate

## Jurisdiction Requirements

### Stake.US

- [35] Is the game compliant with the required translations for a social game?
- [36] Game supports SC and GC currencies & values do not display a "$" prefix
- [37] Game mode naming follows Social Mode terminology guidelines
- [38] Replay window does not contain restricted words
- [39] English is the only supported language in Social Mode

## Replay Support

- [40] Supports replay urls, loads and plays desired event
- [41] Supports all optional parameters like, currency, language, amount
- [42] Replay allows replaying the event again after completion
- [43] UI clearly displays bet cost and applied multiplier
- [44] Supports Replays in Popout S view

## Final approval checklist

- [45] Game has bet-level templates applied
- [46] Provably Fair and Replay are enabled
- [47] Front and Math requests are approved
- [48] Game is posted in the stake-engine-game-approved channel
- [49] Game works correctly on older mobile devices (Android and IOS)
- [50] Approval requests is closed after the game is live & emoji's are added to slack notification
- [51] Game Released

## Adjacent page state recorded at the same capture

The game's approval landing page (`/teams/we-roll-spinners/games/future-spinner/approval`)
showed its PRE-SUBMISSION CHECKLIST all green at capture time: "Thumbnail is set.",
"Latest front version: v9" (published 23 hours before capture, so the owner's upload of
the restaged bundle landed), "Latest math version: v1", "All modes passed validation.",
"Valid betlevel template found." The "Begin Submission" control was NOT operated.
