<!-- Stake Engine submission checklist, first capture -->
- topic: submission-checklist
- resolved_url: https://stake-engine.com/docs/approval-guidelines/submission-checklist?team=we-roll-spinners
- fetched: 2026-08-09
- rendered_via: owner's browser, transcribed by the owner into chat and mirrored here
- looks_real: true

# Submission Checklist, as published

**THIS PAGE WAS RECORDED AS UNCAPTURABLE AND IT IS NOT.** `COMPLIANCE_WATCH.md`'s
`submission-checklist` bullet says the criteria list is login-gated and that every capture
attempt stored the login wall. The owner reached it on 2026-08-09 at a `/docs/` URL carrying a
`?team=` parameter, and it rendered as an ordinary documentation page. **That is the artefact
this project has been waiting on**: the 58 item texts in
`docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md` rested on a single owner
transcription with no mirror, and rule 16 marked them REPORTED for exactly that reason.

**THE PUBLISHED PAGE CARRIES 51 ITEMS. OUR SELF-ASSESSMENT CARRIES 58.** Both numbers are
recorded here rather than reconciled by guesswork, because the page states its own caveat:

> "The checklist below is the criteria applied to a new team. Requirements may vary once your
> team builds a track record, so your own review checklist can differ slightly."

So the docs page is the GENERIC criteria and the portal's per-game panel, which is where the
0 of 58 counter lives, may carry more. **Do not overwrite 58 with 51.** They are two different
artefacts and the difference is the finding.

**ONE PUBLISHED REQUIREMENT HAD NEVER BEEN ASSESSED BY US**, found by diffing this capture
against our rows: **"Game should not contain the Stake Engine Loader"**, a PreCheck. It is
assessed and PASSES; see the self-assessment row.

## The items, verbatim, by section


### PreChecks
- [ ] Game authenticates with RGS sucessfully on game launch
- [ ] Game authentication fails correctly with an invalid rgs_url
- [ ] Clicking on the bet button sends a successful play request to RGS
- [ ] Game should not contain the Stake Engine Loader

### Compliance
- [ ] Game title is unique and does not use restricted terms
- [ ] Game assets and imagery do not contain offensive or inappropriate content
- [ ] Game is sufficiently distinct from existing titles and series

### Thumbnail
- [ ] Game thumbnail meets Stake artwork guidelines

### BetLevels
- [ ] Game dynamically uses all betting parameters from the authenticate response
- [ ] Active rounds restore the bet amount from the authenticate response

### Currency
- [ ] Game supports and displays currencies correctly
- [ ] Game displays sub-cent payouts correctly

### RGSrequests
- [ ] Zero-win bets do not send an end-round request to the RGS
- [ ] Insufficient balance bets do not send a play request to the RGS

### Frontend
- [ ] Main game frame should not be scrollable
- [ ] Space bar should be bound to the bet button

### GameRules
- [ ] RTP and Max Win are clearly stated within the game rules
- [ ] Payout information per symbol must be clearly communicated
- [ ] Win combinations are displayed in the game rules
- [ ] Game modes include description and cost information
- [ ] Free game and re-trigger conditions are clearly displayed in the game rules
- [ ] General disclaimer is included in the game information

### AutoPlay
- [ ] Auto-bet requires a confirmation step before starting
- [ ] High cost bet modes require confirmation before activation

### Responsive
- [ ] Game functions correctly on Desktop/Laptop
- [ ] Game functions correctly on Popout S/L
- [ ] Game functions correctly on Mobile
- [ ] Double tap to zoom is disabled on mobile
- [ ] User interaction guide is included in the game information

### Sounds
- [ ] Game provides an option to disable sounds

### Language
- [ ] Game supports English language
- [ ] Invalid language parameters do not break game display
- [ ] Check 5 wins for each game mode against the Game Rules
- [ ] If Mystery Mode is present, numerical values representing chances or probabilities are accurate

### StakeUS
- [ ] Is the game compliant with the required translations for a social game?
- [ ] Game supports SC and GC currencies and values do not display a dollar prefix
- [ ] Game mode naming follows Social Mode terminology guidelines
- [ ] Replay window does not contain restricted words
- [ ] English is the only supported language in Social Mode

### Replay
- [ ] Supports replay urls, loads and plays desired event
- [ ] Supports all optional parameters like currency, language, amount
- [ ] Replay allows replaying the event again after completion
- [ ] UI clearly displays bet cost and applied multiplier
- [ ] Supports Replays in Popout S view

### Final
- [ ] Game has bet-level templates applied
- [ ] Provably Fair and Replay are enabled
- [ ] Front and Math requests are approved
- [ ] Game is posted in the stake-engine-game-approved channel
- [ ] Game works correctly on older mobile devices (Android and IOS)
- [ ] Approval request is closed after the game is live and emojis are added to slack notification
- [ ] Game Released

## What happens after submission, verbatim

Three independent reviewers are assigned. Each rates the game from 0 to 3 stars across design,
gameplay and math compliance. Ratings stay hidden until all three are in.

- Average of 1 star or more: approved for production.
- Average below 1 star: rejected, with feedback, and may be resubmitted after addressing it.

The page states the review "can be as quick as a couple of hours" and that an incomplete or
non-compliant submission "blows out that timeline and can take weeks".

## THE PRE-SUBMISSION GATE, captured the same day and NOT part of the 51

The approval screen runs its own five automated checks before it will let a submission start.
All five were green on 2026-08-09:

- **Game thumbnail**, "Thumbnail is set."
- **Front version published**, "Latest front version: v4"
- **Math version published**, "Latest math version: v1"
- **Math validation**, "All modes passed validation."
- **Betlevel validation**, "Valid betlevel template found."

**TWO CONSTRAINTS ON THE SAME SCREEN THAT CHANGE HOW A SUBMISSION SHOULD BE TIMED**, quoted
because they are the kind of thing that is expensive to learn late:

> "First-time publishers are limited to one active review until their first game goes live on
> Stake. This ensures any feedback from your initial review can be applied across future
> submissions before they enter the queue. Once approved, the limit increases to five
> concurrent reviews."

> "The review queue is shared across all teams. Submissions that fail basic checks take
> reviewer time away from other games and may result in your request being deprioritised."

**So there is exactly ONE attempt available, and a failed basic check costs queue position as
well as the slot.** The five gates above are necessary and not sufficient: they prove files
exist and validate, not that the RIGHT files were published. **Confirm the live build's console
line names the intended commit before starting a submission**, per OWNER_CHECKLIST item 3.
