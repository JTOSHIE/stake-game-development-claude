# STM-POPOUTS, motion residue (popout-s, frames 157 to 207)

scope: every `popout-s` frame whose filename contains `transition_`, 18 of them
(157, 159, 161, 163, 164, 169, 170, 172, 175, 186, 187, 189, 191, 193, 195, 202,
204, 206). Plus 19 settled endpoint frames opened for comparison and not counted
against the assigned set: 158, 160, 162, 165, 168, 171, 173, 176, 185, 188, 190,
192, 194, 196, 197, 201, 203, 205, 207. Frames 197 and 201 were opened beyond the
immediate endpoints because the immediate endpoint of 195 (frame 196) turned out
to be unusable as an endpoint, see STM-POPOUTS-07.

frames_read: 37 (18 assigned, 19 endpoints)

Measurement note, so every figure below can be rechecked. Colour figures are area
averages of a stated crop box, taken with `ffmpeg -vf "crop=W:H:X:Y,scale=1:1:flags=area"`
piped to `od -An -tu1`, in RGB 0 to 255. PSNR figures are `ffmpeg -lavfi psnr`
whole frame or over a stated crop. Border positions are the index of the first and
last pixel in a one pixel line satisfying `r>110 and b>110 and g<r-40`. No file in
the repository was written except this shard.

Step 3 note, recorded rather than hidden. This shard was written complete at the
end of step 2 with `Where fixable: UNKNOWN` on the frontend rows, then rewritten
here with the source located. The rewrite changed three things beyond adding
`file:line`, and each is a correction of my own step 2 claim:

1. the FEATURES section label row was written at HIGH on the belief that the panel
   footer painted over it. Source shows the footer is `flex-shrink: 0` in a flex
   column and does not overlap; the label is clipped by the scrolling card list at
   its own boundary, which is ordinary scroll behaviour. It is now the LOWEST row,
   STM-POPOUTS-11, and severity order required renumbering the rows between;
2. the Q-26 candidate on the FEATURES multipliers is REFUTED from source. The menu
   writes the multiplication sign, not a letter x. The candidate existed only
   because the glyph is not resolvable at `400x225`, which is why it was recorded
   as a candidate rather than as a KNOWN match;
3. STM-POPOUTS-02 gained a derived mechanism that the frame then confirms, per
   convention (l.2).

## STM-POPOUTS-01 STREAM The rules gate paints its `Continue` button on top of its own body text

- Frames: `reports/screens/stream-test-2026-07-28/159_popout-s_transition_splash_to_rules.png`.
  Settled endpoint, which shows the same defect: `reports/screens/stream-test-2026-07-28/160_popout-s_intro_rules.png`.
- Claim: on the mandatory pre-first-spin rules card at `400x225`, the cyan `Continue`
  pill is drawn over the third line of the second bullet. The bullet reads, across
  its four lines, `The Overdrive meter starts at 1x and rises`, `+1x after every
  winning free spin, multiplying`, then a line of which only `all later w` at the
  left and `ing` at the right survive because the button covers the middle, then
  `feature.`. The word `feature.` on the final line sits immediately left of the
  button and is legible; the words between `all later w` and `ing` are not on
  screen at all. This is text rendered over text on the first interactive surface
  a player and a stream audience meet.
  The mechanism is in the source and is a side effect of a correct earlier fix.
  `frontend/src/lib/components/IntroSplash.svelte:126-130` makes the button
  `position: sticky; bottom: 0` with `align-self: center`, so it is a
  content-width pill pinned to the bottom of a scrolling card. The comment at
  `:128` states the intent, *Opaque, because card content scrolls underneath this
  button*, and the button is indeed opaque. What is not opaque is the rest of the
  line: because the pill is centred and only as wide as its own label, the text
  scrolling underneath is masked in the middle and visible at both ends. The R14
  note at `:52-66` records that this sticky pattern was added specifically to make
  the card usable at `400x225`, so the surface the fix targeted is the surface the
  side effect lands on.
  Recorded honestly: this is present in the transition frame AND in its settled
  endpoint 160, so it is not a transition artefact. It is reported because it is on
  an assigned frame and it is the worst thing in the set.
- Where fixable: `frontend/src/lib/components/IntroSplash.svelte:125-131` (not locked).
- Proposed fix: give the sticky footer a full-width opaque bar rather than a
  content-width pill, by wrapping the button in a sticky `div` that spans the card
  and carries the card's own background, and moving `position: sticky; bottom: 0`
  onto that wrapper while the button keeps `align-self: center`. One element and a
  two-property move; the R14 guarantee (button on screen at every scroll position)
  is preserved.

## STM-POPOUTS-02 STREAM The max win collect leaves the winning board still blooming gold under a reel-shaped wash, with nothing of the overlay left

- Frames: `reports/screens/stream-test-2026-07-28/206_popout-s_transition_maxwin_collect_fade.png`.
  Endpoints: `205_popout-s_maxwin_celebration.png` before, `207_popout-s_post_collect_base.png`
  after. Base reference: `203_popout-s_post_feature_base.png`.
- Claim: at the moment after `COLLECT` is pressed, the reel window interior is
  filled with a saturated yellow olive field while the overlay's own content has
  already been removed in full. A 40x40 box centred on the reel window at
  `crop=40:40:177:70` averages `99, 87, 14` in frame 206, against `132, 92, 84` in
  the settled celebration 205, `53, 52, 56` in the settled frame after 207, and
  `24, 58, 74` on the same box in the base game 203. The blue channel collapses to
  `14` out of 255, which is why it reads on screen as a murky olive rectangle where
  the reels are. Under it no symbol in the window is legible. Whole frame PSNR 206
  against 207 is `11.95 dB`, the largest gap of any transition-to-endpoint pair in
  the set.
  Two things make this a residue rather than a fade. First, none of `MAX WIN
  REACHED!`, `5,000` or `COLLECT` is present anywhere in frame 206, so the surface
  the wash belongs to is gone while its colour is not; a second box higher in the
  same window, `crop=30:30:105:30`, reads `20, 18, 13` in 206 against `187, 115, 159`
  in 205. Second, the wash is clipped to the reel window interior, whereas in 205
  the overlay covers the whole frame, so what remains is not the overlay at reduced
  opacity but a separate reel-scoped layer that outlives it.
  Derived from source first, and the frame then confirms it. The wash is the win
  presentation, not the celebration. `frontend/src/lib/components/GameGrid.svelte:1522`
  applies `plate-bloom-pulse` to every winning cell, and that keyframe
  (`:1510-1521`) drives `inset 0 0 30px 6px` of the cell's own `--plate-tint` at its
  50 per cent stop, which is a full-cell fill, on a `0.6s ease-in-out infinite`
  loop. The teardown that would strip it, `armWinBurstTeardown` at
  `GameGrid.svelte:757-768`, opens with `if (get(isWincap)) { winBurstTimer =
  armWinBurstTeardown(); return }`, so on a capped round it re-arms every 4000 ms
  instead of clearing, indefinitely. Its own comment at `:745-755` records why the
  re-arm was added on 2026-07-28: without it the board was dismantled underneath
  the celebration. The unhandled case is the other side of that, the moment the
  celebration is dismissed while the flag is still set. Meanwhile
  `frontend/src/lib/components/MaxWinCelebration.svelte:201` carries only
  `animation: c1-fadein 0.55s ease both`, an entry animation with no exit
  counterpart, so on collect the overlay is removed in a single frame and the
  still-blooming board is revealed rather than crossfaded to. The manifest calls
  206 an *overlay mid-fade-out*; there is no fade-out to be mid-way through.
- Where fixable: `frontend/src/lib/components/GameGrid.svelte:757-759` and
  `frontend/src/lib/components/MaxWinCelebration.svelte:201` (neither locked).
- Proposed fix: PARK(two changes, and the second is an art call. The mechanical
  half is to clear the bloom on the collect event rather than only on the
  `isWincap` re-arm, so the wincap hold ends when the player ends it; that is a
  small change at `GameGrid.svelte:757-759` plus a collect hook. The other half,
  whether the overlay should fade out at all rather than cut, changes what is seen
  at the single most-watched moment in the game and belongs to the owner. Do not
  add an exit fade without deciding the first half, or the wash simply becomes
  visible for longer.)

## STM-POPOUTS-03 HIGH The buy confirm dialog shows a fragment of its question and no action controls at all

- Frames: `reports/screens/stream-test-2026-07-28/189_popout-s_transition_dialog_buy_overdrive_opening.png`,
  `reports/screens/stream-test-2026-07-28/191_popout-s_transition_dialog_nitro_overdrive_opening.png`.
  Settled endpoints, which show the same defect: `190_popout-s_dialog_buy_overdrive.png`,
  `192_popout-s_dialog_nitro_overdrive.png`.
- Claim: below the `PRICE` / `RTP` / `MAX WIN` stats box the confirmation question
  survives only as its last fragment, with the tops of the letterforms cut. Frames
  189 and 190 show `bet?` and nothing else of the question; frames 191 and 192 show
  `your bet?` and nothing else. Source gives the whole sentence the player is meant
  to read: `frontend/src/lib/i18n/translations.ts:1537` sets
  `buyConfirmBody: 'Start Overdrive Free Spins now at {cost}× your bet?'`, rendered
  at `frontend/src/lib/components/BuyBonus.svelte:101`. So at `400x225` the player
  is shown the last two words of an eight-word question.
  This is not the viewport clipping the dialog. Scanning for the panel's magenta
  border gives, in the column at `x=200`, a top edge at `y=10` and a bottom edge at
  `y=214` in frame 189, and `y=11` / `y=212` in frame 190; in the row at `y=110`,
  a left edge at `x=10` and a right edge at `x=389` in 189, and `x=12` / `x=387` in
  190. The panel therefore ends about ten pixels short of the bottom of the
  `400x225` viewport, and the question is being cut inside the dialog's own layout.
  No `CONFIRM` or `CANCEL` control is rendered. Between the question fragment and
  the panel's bottom border there is nothing: `crop=50:12:65:194` averages `9, 9, 29`
  and `crop=50:12:295:194` averages `8, 8, 27` in both 189 and 190, which is the
  panel's own dark fill.
  The mechanism is the same class as STM-POPOUTS-01 and, again, the shadow of a
  correct earlier fix. `BuyBonus.svelte:174` caps the modal at
  `max-height: 90dvh; overflow-y: auto`, which at 225 px is about 202 px and matches
  the 203 px panel measured above. `BuyBonus.svelte:224-233` then pins the
  disclosure row with `position: sticky; bottom: 0; z-index: 2`, and its R12 comment
  states plainly that this is a compliance requirement rather than a preference. But
  `.buy-actions`, the row carrying cancel and confirm, is DOM-later at
  `BuyBonus.svelte:141-147` and is not sticky (`:247`, `margin-top: 16px` and
  nothing else). So the disclosure row is guaranteed on screen and the buttons that
  act on it are guaranteed to be pushed below the fold at short viewports. A player
  at this viewport is shown a price and half a question with no visible way to
  accept or decline.
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:141-147`,
  `:224-233` and `:247` (not locked).
- Proposed fix: wrap `.buy-stats-row` and `.buy-actions` in one sticky footer
  element carrying the `bottom: 0` and the opaque background, so the disclosure and
  the controls that act on it are pinned together; and let the question paragraph
  scroll above it rather than under it. Then add the `400x225` case to whatever
  gate covers R12, because R12's own note names `360x600` and `812x375` and this
  viewport is smaller than both.

## STM-POPOUTS-04 HIGH A COMMITTED EVIDENCE PNG HAS BEEN OVERWRITTEN IN THE WORKING TREE WHILE THIS WAVE WAS READING IT

**Read this row first. It is not a rendering defect and it is the most urgent thing
in this shard. Convention (h.1) is being violated live, during the audit that
convention exists to protect.**

- Frames: `reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png`
  (the file that was overwritten), `reports/screens/stream-test-2026-07-28/187_popout-s_transition_features_menu_opening.png`
  (the transition it invalidates).
- Claim: `git status --porcelain` at the close of this run reports
  `M reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png`. The
  file is MODIFIED, not untracked. The two versions are not the same image and not
  the same kind of image:

  | | committed blob at HEAD | working tree file |
  |---|---|---|
  | dimensions | `400 x 225` | `2340 x 330` |
  | bytes | `59,295` | `91,803` |
  | IDAT block size | `4096` | `16384` |
  | extra chunks | none | `sRGB`, `eXIf` |
  | mtime | n/a | `2026-07-28 23:53:41` |

  The committed blob was read with `git show HEAD:<path>` piped to a parser, so
  nothing was written to disk to establish this. Its IHDR parses to `400 225` and
  its chunk list is `IHDR` then bare `4096`-byte `IDAT`s, which is byte-for-byte the
  shape of every neighbouring frame: `187` is `400x225`, `56,954` bytes, `4096`-byte
  IDATs, no `sRGB`, no `eXIf`. So the COMMITTED frame is a correct popout-s capture
  and the WORKING TREE file is a foreign image sitting on top of it.
  Timing puts it inside this wave. `187` has mtime `2026-07-28 20:06:38` and `189`
  has `20:06:39`, both from the capture run; the replacement carries
  `2026-07-28 23:53:41`, three hours and forty-seven minutes later. Every other one
  of the 51 popout-s frames is still `400x225`; a sweep returns exactly one row,
  `ODD: 2340,330 188_popout-s_features_menu.png`. HEAD is currently
  `0b2efdb test(stream): Wave 2 composition shards, nine of sixteen half-sessions`,
  a Wave 2 commit, so the overwrite happened after the shard work began.
  Two consequences, and the second is the one that matters beyond this shard.
  First, locally: the FEATURES menu open transition (187) cannot be judged against
  its endpoint, because what is on disk as the endpoint is not a render of that
  surface at that viewport. Probing the working tree file at the coordinates that
  carry content in every other popout-s frame returns pure `0, 0, 0` at all four
  points tested. STM-POPOUTS-11 is filed as unresolvable for exactly this reason.
  Second, across the wave: every squad reading this frame from disk right now is
  reading the wrong image, and none of them will know unless they run
  `git status`. An audit whose inputs mutate mid-flight cannot sign anything, and
  the squads that read `188` before this was noticed have no way to tell whether
  they saw the committed frame or the replacement.
  This is the SA-012 failure recurring. `CLAUDE.md` convention (h.1) records it in
  these words: *Evidence that a casual re-run can overwrite is not evidence.* The
  original case was `anticipation_proof.mjs` screenshotting straight into a
  committed directory and silently modifying four PNGs. The same shape has happened
  again, to a frame this audit depends on.
  What this squad did NOT do, stated so the record is unambiguous: it did not
  restore the file, did not `git checkout` it, did not touch it in any way. It is
  read-only against the repository bar its own shard, and a restore is the marshal's
  call, not a discovery squad's. The file is left exactly as found.
- Where fixable: not frontend. `reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png`
  and whatever wrote it.
- Proposed fix: PARK, and escalate ahead of every other row in this shard. In order:
  (1) find the writer, since a 2340x330 image with `eXIf` and `sRGB` chunks is not
  the capture harness and something in this wave produced it; (2) restore the frame
  from HEAD, which is intact, so nothing is lost if this is done promptly;
  (3) before the marshal consolidates, run `git status --porcelain` over
  `reports/screens/` and a manifest-versus-file geometry check across all 519 frames,
  because this one was found by accident while checking something else and there is
  no reason to believe it is the only one.

<!-- Numbering note: this row kept its number through the step 3 rewrite even
     though its claim changed completely, because renumbering it would have
     broken the severity order twice in one document. Its severity is unchanged
     at HIGH: nothing here is player visible, and the scale in the brief is a
     visibility scale. Its URGENCY is higher than its severity, which is why the
     row says so in words rather than by inflating the tag. -->


## STM-POPOUTS-05 MEDIUM The frame captured as the full speed spin already shows four of five reels on the final outcome

- Frames: `reports/screens/stream-test-2026-07-28/164_popout-s_transition_reels_full_speed.png`.
  Endpoints: `162_popout-s_base_idle.png` before, `165_popout-s_dead_spin_1_settled.png`
  after. Control: `163_popout-s_transition_reels_accelerating.png`.
- Claim: per reel column, over `crop=43:138:X:22` with `X` at 90, 133, 176, 219 and
  262, PSNR of frame 164 against the settled outcome 165 is reel 1 `33.45 dB`,
  reel 2 `39.50 dB`, reel 3 `40.07 dB`, reel 4 `34.99 dB`, reel 5 `18.36 dB`. The
  same measurement for the accelerating frame 163 against 165 is `15.45`, `15.24`,
  `16.08`, `19.08` and `20.88 dB`. The 15 to 21 dB band is what genuinely different
  reel content scores here; 33 to 40 dB is the same symbols in the same cells with
  only the animated scene glow behind them differing. So at the instant the manifest
  calls `Reels at full speed`, reels 1 to 4 are already displaying the settled result
  and only reel 5 is still moving.
  What follows for a viewer, and for this audit: the popout-s session contains no
  frame of the reels genuinely at speed, so whether the spin carries motion blur
  cannot be judged from it, and neither 163 nor 164 shows any. Four fifths of the
  outcome is on screen at the point the capture believed the spin was at full speed.
- Where fixable: UNKNOWN. Not investigated in step 3; the capture side has to be
  settled before a source question is even well posed.
- Proposed fix: PARK(two separate questions live here, a capture timing one and a
  reel motion one, and the second cannot be answered without a frame that catches
  the reels moving. Re-capture with an earlier trigger before ruling on blur.)

## STM-POPOUTS-06 MEDIUM The splash to rules crossfade shows the base game behind the card, not the splash

- Frames: `reports/screens/stream-test-2026-07-28/159_popout-s_transition_splash_to_rules.png`.
  Endpoints: `158_popout-s_splash.png` before, `160_popout-s_intro_rules.png` after.
  Reference: `162_popout-s_base_idle.png`.
- Claim: the manifest calls 159 a `Mid-fade between splash and rules card`. What is
  behind the incoming card is the base game HUD, at roughly a fifth of its settled
  brightness, and the splash is already entirely gone. At the spin button pod,
  `crop=22:20:361:193`, frame 159 averages `14, 32, 47` against `5, 6, 13` on the
  splash 158, `8, 9, 27` on the settled rules card 160 and `39, 112, 121` on the base
  game 162; taking 158 and 160 as the floor that puts the HUD at about 22 per cent of
  its settled luminance. At the bet pod, `crop=26:16:292:195`, 159 averages
  `22, 20, 27` against `7, 10, 22` on 158, `8, 9, 28` on 160 and `77, 68, 36` on 162,
  about 20 per cent by the same method. Whole frame PSNR 159 against 160 is `20.56 dB`.
  The settled rules card 160 shows none of it, so the scrim reaches full opacity only
  after the card has arrived: `IntroSplash.svelte:46-49` sets the backdrop to
  `rgba(0, 0, 0, 0.86)` with `animation: intro-fade-in 0.35s ease both`, and at 20
  per cent through that fade the game behind is exactly this visible. A viewer meets
  a brief glimpse of the reels and the bet controls in the gap between the splash
  leaving and the mandatory rules gate landing, which is a state neither endpoint
  contains.
- Where fixable: `frontend/src/lib/components/IntroSplash.svelte:46-49` (not locked)
  for the fade; the ordering of splash teardown against rules mount was not traced
  and is UNKNOWN.
- Proposed fix: PARK(a 350 ms scrim fade over a game that is already mounted is
  normal, so the fix is a sequencing decision rather than a CSS one: either hold the
  splash until the rules backdrop is opaque, or start the rules backdrop opaque.
  Which one is right depends on the intended first-load choreography, which is not
  recorded anywhere this squad found.)

## STM-POPOUTS-07 MEDIUM The Overdrive entry card is never dismissed, so the transition named for its dismissal and all six in flight frames show the same gate

- Frames: `reports/screens/stream-test-2026-07-28/195_popout-s_transition_feature_starting.png`
  and `reports/screens/stream-test-2026-07-28/193_popout-s_transition_feature_entry_fade.png`.
  Endpoints and further evidence: `194_popout-s_feature_entry_card.png`,
  `196_popout-s_feature_run_1.png`, `197_popout-s_feature_run_2.png`,
  `201_popout-s_feature_run_6.png`.
- Claim: 193 is captured as `Feature entry overlay mid-fade`, 195 as `Feature
  starting, entry card dismissing`, and 196 to 201 as `Overdrive free spins in
  flight, interval frame N of 6`. Every one of them renders the same undismissed
  card: `OVERDRIVE FREE SPINS`, `+16 FREE SPINS` and `TAP TO CONTINUE`. Whole frame
  PSNR is `30.41 dB` for 193 against 194, `26.45 dB` for 195 against 196 and
  `29.85 dB` for 196 against 201, all inside the band the animated scene alone
  produces between any two popout-s frames of the same surface.
  The feature did run at some point, because `202_popout-s_transition_feature_exit.png`
  shows the base frame restored with `WIN` at `$319.45`. It simply ran after the six
  frames that were supposed to record it. So there is no residue to judge at 195,
  and the session carries no evidence of the Overdrive meter or the free spin
  counter moving. The gate itself is real and intended:
  `frontend/src/lib/components/FreeSpinsPresentation.svelte:222-232` holds on
  `awaitingContinue` until the player acts, with `skipContinueGate` at `:36` as the
  only bypass.
- Where fixable: not a frontend defect. The capture set / harness sequencing.
- Proposed fix: PARK(the capture must press the continue gate, or set
  `skipContinueGate`, before starting the interval timer. Until re-captured, the
  popout-s feature run is unswept rather than clean, and should be recorded that way
  so a squad that found nothing is not confused with a squad that saw nothing.)

## STM-POPOUTS-08 MEDIUM The feature HUD column runs off the right edge at 400x225 and its figures are cut mid-value

- Frames: `reports/screens/stream-test-2026-07-28/193_popout-s_transition_feature_entry_fade.png`,
  `reports/screens/stream-test-2026-07-28/195_popout-s_transition_feature_starting.png`,
  `reports/screens/stream-test-2026-07-28/206_popout-s_transition_maxwin_collect_fade.png`.
  Endpoints: `194_popout-s_feature_entry_card.png`, `196_popout-s_feature_run_1.png`,
  `205_popout-s_maxwin_celebration.png`, `207_popout-s_post_collect_base.png`.
- Claim: the right hand feature panel and the circular Overdrive gauge above it both
  extend past `x=400` and are cut by the viewport edge. The three label rows read as
  `OVERDRIVE FR`, `TOTAL W` and `MULTIPL` with the remainder off screen, and the
  total win value is cut mid figure: it reads as `$10.6` in 193 and 195 and as `$2.8`
  in 206, in each case with the following characters missing rather than abbreviated
  or ellipsised. Transcription caveat, stated rather than hidden: these strings are
  at the limit of legibility in a `400x225` render and the label truncation points
  are firmer than the exact digits.
  This is present in the settled endpoints as well as the transition frames, so it is
  a fit failure rather than a residue; it is reported because it is on three assigned
  frames and because a value cut mid figure is a different failure from the
  abbreviation class in TR-115 / TR-086.
- Where fixable: `frontend/src/lib/components/BonusInstrumentColumn.svelte` is the
  surface (`:68` and `:94` render the `overdriveFreeSpins` label), but the width and
  overflow rules were not traced in step 3, so the exact line is UNKNOWN.
- Proposed fix: UNKNOWN pending the layout trace. Likely the same fit-or-abbreviate
  mechanism as final-mile JOB 3 rather than a local change, so it may belong to that
  job rather than to a fix of its own.

## STM-POPOUTS-09 MEDIUM Three casings in one HUD menu view

- Frames: `reports/screens/stream-test-2026-07-28/172_popout-s_transition_menu_opening.png`.
  Settled endpoint, which shows the same: `173_popout-s_hud_menu.png`.
- Claim: the five items of the HUD menu, top to bottom, read `Session`, `Speed`,
  `AUTO`, `MAX BET`, `Mute`. Sentence case, all caps and sentence case again, in one
  panel, in one view, with no grouping rule that separates them. This is the
  charter's own machine tell list, button casing that drifts, inside a single surface
  rather than across two screens. Off lens and settled state, reported because it is
  on an assigned frame.
- Where fixable: UNKNOWN. `frontend/src/lib/components/HudOverlay.svelte` is the
  host (the bet ladder and autoplay menu were ported into it per CLAUDE.md), but the
  step 3 budget was spent on the two STREAM rows and the file was not opened.
- Proposed fix: UNKNOWN. Note for the marshal: this is the same shape as charter row
  Q-34 (`Cruise` against `CRUISE`) but a different instance, so it is a new
  observation for that class rather than a KNOWN match to that row.

## STM-POPOUTS-10 LOW The buy confirm dialog overshoots its settled size on open

- Frames: `reports/screens/stream-test-2026-07-28/189_popout-s_transition_dialog_buy_overdrive_opening.png`,
  `reports/screens/stream-test-2026-07-28/191_popout-s_transition_dialog_nitro_overdrive_opening.png`.
  Endpoints: `190_popout-s_dialog_buy_overdrive.png`, `192_popout-s_dialog_nitro_overdrive.png`.
- Claim: scanning for the magenta border, the two transition frames are identical to
  each other at `x` from `10` to `389` and `y` from `10` to `215`, that is `380x206`;
  the two settled frames are identical to each other at `x` from `12` to `387` and
  `y` from `11` to `213`, that is `376x203`. So the panel is `4` pixels wider and `3`
  pixels taller mid-open than at rest, about `1.1` per cent and `1.5` per cent, or
  `2` pixels per side. That the two different dialogs give byte-identical edges makes
  this systematic rather than capture jitter, and source confirms it is deliberate:
  `frontend/src/lib/components/BuyBonus.svelte:182` runs
  `animation: buy-pop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)`, whose `1.56` control
  point is an overshoot easing by construction.
  At `400x225` a viewer will not see two pixels. It is recorded because it is the
  only measured overshoot in the set, because it explains the `18.13 dB` and
  `17.97 dB` whole frame PSNR between these pairs which would otherwise read as a
  much larger change, and because signing the absence of pops honestly meant
  measuring the one that exists.
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:182` (not locked).
- Proposed fix: none. This is intended easing and is correct. Recorded as measured,
  not as a defect.

## STM-POPOUTS-11 LOW A FEATURES section label is bisected at the card list's scroll boundary

- Frames: `reports/screens/stream-test-2026-07-28/187_popout-s_transition_features_menu_opening.png`.
- Claim: below the `OVERBOOST` row, the `BUY FEATURES` section label
  (`frontend/src/lib/components/FeatureMenu.svelte:459`, class `.fm-section-label`)
  has its lower half cut, immediately above the footer strip carrying
  `All modes · RTP 96.35%` and the `BET MODES` button. Only the upper halves of the
  letterforms show, so the label reads as a row of broken glyphs.
  Correction to this squad's own step 2 claim, recorded rather than quietly fixed.
  This was written at HIGH on the belief that the footer painted over the label.
  Source refutes that: `.fm-foot` at `FeatureMenu.svelte:1001-1005` is
  `flex-shrink: 0` in a flex column and sits below the list, and `.fm-cards` at
  `:873-877` is `flex: 1 1 auto; min-height: 0; overflow-y: auto`. The label is
  clipped by its own scroll container at the container's edge, which is what every
  scrolling list does. It is therefore probably not a defect at all, and is kept at
  LOW as an observation only because at `400x225` the visible list is about two and a
  half rows tall, so a bisected label is what a viewer meets on opening rather than
  something they scroll into.
  The settled endpoint that would normally confirm the at-rest scroll position,
  frame 188, is unusable, see STM-POPOUTS-04, so whether this is the resting state
  cannot be established from this session.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:873-877` (not
  locked), if anything is to be done at all.
- Proposed fix: PARK(do nothing without the missing endpoint. If the resting scroll
  position does bisect a label, the cheap treatment is scroll padding or a mask fade
  at the list's lower edge; but a scrolling list clipping its content is normal and
  this may be a non-finding.)

## Explicit absences, signed

Signed by STM-POPOUTS. Each line names what was checked, so the absence is
falsifiable rather than a shrug.

- **No z-order inversion was found in any transition.** Every transition frame was
  compared against the settled frames either side of it for a surface appearing in
  front of something it sits behind when settled. The menu (172 against 173), the
  paytable open (175 against 176), the paytable close (186 against 185), the two
  dialogs (189 against 190, 191 against 192) and the feature exit (202 against 203)
  all keep the same stacking in the transition frame as in the endpoint. The only
  layering fault found is STM-POPOUTS-02, and that is a persisting fill rather than
  an inverted order.
- **No backdrop blur applied to the wrong layer was found.** The four modal surfaces
  in the set (rules card, paytable, features panel, buy dialog) were checked for a
  blur landing on the modal instead of the backdrop, or on the backdrop of the wrong
  surface. Text and border edges inside every modal are sharp in both the transition
  and the settled frame. The rules backdrop does declare
  `backdrop-filter: blur(3px)` at `IntroSplash.svelte:47`, and it is on the backdrop
  where it belongs, not on the card.
- **No scrim opacity overshoot was found on the buy dialogs, contrary to first
  impression.** The apparent difference in how much of the FEATURES panel shows
  through 190 but not 189 was tested and does not exist: `crop=16:12:52:199`,
  `crop=16:12:192:199` and `crop=16:12:332:199` return `9,9,29`, `9,9,27` and
  `8,8,26` in 189 against `9,9,29`, `9,9,28` and `8,8,26` in 190, and
  `crop=60:10:170:15` returns `11,11,32` in both. The whole frame PSNR gap between
  the pair is explained by STM-POPOUTS-10's two pixel scale shift, not by scrim
  opacity. Recorded because the wrong reading was the intuitive one.
- **No element caught mid-teleport was found.** Every transition frame was checked
  for an element at a position neither endpoint places it at. The largest positional
  delta measured anywhere in the set is the two pixel dialog overshoot at
  STM-POPOUTS-10. Nothing jumps.
- **No shadow, glow or backdrop left behind by a moved element was found.** Checked
  specifically on the HUD menu slide (172 against 173), the paytable open (175
  against 176) and the feature entry card (193 against 194), which are the three
  surfaces in the set that move rather than fade.
- **No residue was found in the splash entrance.** Frame 157, captured at about
  600 ms after load, scores `36.77 dB` whole frame PSNR against the settled splash
  158, the highest of any transition-to-endpoint pair except the paytable open. There
  is no visible entrance state left at 600 ms and nothing is caught part way.
- **Four transitions caught nothing because they had already settled**, and this is
  a statement about the capture rather than about the build. Whole frame PSNR against
  their endpoints: paytable open 175 against 176 `54.95 dB`, rules to base 161
  against 162 `27.05 dB`, menu open 172 against 173 `28.91 dB`, and the paytable
  close 186 which contains no trace of the paytable at all. None of these four can
  be signed clean; they are UNJUDGED, and STM-POPOUTS makes no claim about them
  either way.
- **The big win banner geometry is not a residue.** The full width band that cuts
  across the reel window in 169 and 170 is present identically in the settled frame
  171: `crop=8:20:1:80` reads `12,41,53` in 169 and `11,38,51` in both 170 and 171,
  and `crop=8:20:390:80` reads `11,18,32` in 169 and `12,18,32` in 170 and 171. The
  circular disc that carries the figure in 169 and is gone by 170 reads as a scale-in
  of the banner rather than a fault, and is not claimed as one.
- **No text over text was found anywhere except STM-POPOUTS-01.** Every frame in the
  set was read for overlapping strings; the rules card is the only instance.
- **No ghost of a dismissed surface was found except STM-POPOUTS-02.** Checked on
  every dismissal in the set: paytable close (186), feature exit (202), max win
  collect (206). 186 and 202 are clean, with no trace of the surface that left.

## KNOWN matches

- KNOWN(MID-01): `reports/screens/stream-test-2026-07-28/169_popout-s_transition_bigwin_countup_early.png`
  shows the banner at `$10.27` while the HUD `WIN` pod already reads `$15.94`, on a
  win that settles at `$16.20` in `171_popout-s_bigwin_settled.png`. The ledger
  predicted this exact triple at `169`/`171` popout-s. The desktop instance it was
  derived from reads `$10.29` and `$15.95`; the popout-s pair reads one cent lower on
  each, which is consistent with the same two clocks sampled a hair earlier. Last
  digit transcription at `400x225` is at the limit of legibility and is flagged as
  such rather than asserted.
- KNOWN(MID-02): `reports/screens/stream-test-2026-07-28/169_popout-s_transition_bigwin_countup_early.png`
  and `170_popout-s_transition_bigwin_countup_late.png` both render the unit as
  `16x BET` with a letter x, as does the settled `171_popout-s_bigwin_settled.png`.
  Beside it in the same session the buy dialogs write `5,000` and `{cost}×` with the
  multiplication sign, per `translations.ts:1537` and `FeatureMenu.svelte:372`, so
  the two conventions appear within four surfaces of each other.
- KNOWN(TR-115 / TR-086): the money pods abbreviate rather than fit. `BAL` reads
  `$50K` in every base frame of the session including `162`, `171`, `186`, `202`,
  `203`, `206` and `207`, and on the max win the `WIN` pod reads `$5K` in
  `206_popout-s_transition_maxwin_collect_fade.png`. The stream consequence, recorded
  as fresh evidence for the row rather than as a new finding: across the collect in
  `206` and `207` the balance reads `$50K` on both sides of a `$5,000` credit, so the
  single largest payout in the game produces no visible change in the balance pod.
  Whether the balance store moved cannot be determined from frames, and is not
  claimed.
- KNOWN(Q-26) candidate, REFUTED in step 3, recorded so nobody re-raises it.
  `reports/screens/stream-test-2026-07-28/187_popout-s_transition_features_menu_opening.png`
  appeared to write the mode multipliers as `1x bet` and `1.25x bet` with a letter x.
  Source says otherwise: `frontend/src/lib/components/FeatureMenu.svelte:372` and
  `:427` render `{m.cost}× {$isSocial ? 'per spin' : 'bet'}` and `:480` renders
  `{m.cost}× · {price(m.cost)}`, all with U+00D7. The FEATURES menu is not a Q-26
  survivor. The candidate existed only because the glyph is not resolvable at
  `400x225`, and this is exactly why it was filed as a candidate rather than as a
  match.

tree_after:

**LOUDLY: there is a MODIFIED line in this output, and it is a committed evidence
PNG, not a shard. See STM-POPOUTS-04.** `git status --porcelain` from
`/Users/jt/math-sdk`, verbatim:

```
 M reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png
?? reports/qa/stream_test/shards/STC-MOBILEL-B.md
?? reports/qa/stream_test/shards/STC-MOBILEM-B.md
?? reports/qa/stream_test/shards/STC-MOBILES-A.md
?? reports/qa/stream_test/shards/STC-MOBILES-B.md
?? reports/qa/stream_test/shards/STC-STRETCH-A.md
?? reports/qa/stream_test/shards/STC-STRETCH-B.md
?? reports/qa/stream_test/shards/STM-DESKTOP.md
?? reports/qa/stream_test/shards/STM-LAPTOP.md
?? reports/qa/stream_test/shards/STM-MOBILEM.md
?? reports/qa/stream_test/shards/STM-MOBILES.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STM-STRETCH.md
?? reports/qa/stream_test/shards/STT-DESKTOP-A.md
?? reports/qa/stream_test/shards/STT-DESKTOP-B.md
?? reports/qa/stream_test/shards/STT-LAPTOP-B.md
?? reports/qa/stream_test/shards/STT-POPOUTS-A.md
?? reports/qa/stream_test/shards/STT-POPOUTS-B.md
```

Reading of that output. `?? reports/qa/stream_test/shards/STM-POPOUTS.md` is this
squad's own shard, untracked, as expected. The other sixteen `??` shard rows belong
to other squads and are not this squad's business. There are no DELETED entries.
There is exactly one MODIFIED entry and it is not a shard: it is a committed
evidence frame inside the capture set this wave is auditing. Nothing in this
squad's run wrote to it; this squad wrote one file, its own shard, and used
`git show HEAD:<path>` piped to a parser rather than checking anything out in order
to inspect the committed version without touching the working tree.
