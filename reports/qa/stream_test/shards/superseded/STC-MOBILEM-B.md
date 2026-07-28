# STC-MOBILEM-B, COMPOSITION (mobile-m, frames 286 to 311)

scope: every frame of the `mobile-m` session numbered 286 to 311 inclusive, 26 frames,
viewport `375x667`, lang `en`, build `d9bdf22`. Frames 260 to 285 belong to another squad
and were not opened.
frames_read: 26

Frames covered, in order: `286_mobile-m_paytable_07_interface_guide.png`,
`287_mobile-m_paytable_08_responsible_play.png`, `288_mobile-m_paytable_09_disclaimer.png`,
`289_mobile-m_transition_paytable_closing.png`, `290_mobile-m_autoplay_menu.png`,
`291_mobile-m_transition_features_menu_opening.png`, `292_mobile-m_features_menu.png`,
`293_mobile-m_transition_dialog_buy_overdrive_opening.png`,
`294_mobile-m_dialog_buy_overdrive.png`,
`295_mobile-m_transition_dialog_nitro_overdrive_opening.png`,
`296_mobile-m_dialog_nitro_overdrive.png`, `297_mobile-m_transition_feature_entry_fade.png`,
`298_mobile-m_feature_entry_card.png`, `299_mobile-m_transition_feature_starting.png`,
`300_mobile-m_feature_run_1.png` through `305_mobile-m_feature_run_6.png`,
`306_mobile-m_transition_feature_exit.png`, `307_mobile-m_post_feature_base.png`,
`308_mobile-m_transition_maxwin_overlay_fade.png`, `309_mobile-m_maxwin_celebration.png`,
`310_mobile-m_transition_maxwin_collect_fade.png`, `311_mobile-m_post_collect_base.png`.

A note on measurement, so no figure here is read as more precise than it is. Pixel
positions are read off the rendered frame at 1:1 and are stated as approximate where they
are approximate. Every `file:line` below was read from source after all 26 frames were
looked at, per the mandated order. Where source settled a question the frame could not,
the shard says so rather than leaving the frame reading standing.

---

## STC-MOBILEM-B-01 HIGH The buy confirm dialog's CONFIRM and CANCEL sit below the fold at this viewport, pushed there by the sticky disclosure row

- Frames: `reports/screens/stream-test-2026-07-28/294_mobile-m_dialog_buy_overdrive.png`,
  `reports/screens/stream-test-2026-07-28/296_mobile-m_dialog_nitro_overdrive.png`, plus the
  mid-open transitions `293_mobile-m_transition_dialog_buy_overdrive_opening.png` and
  `295_mobile-m_transition_dialog_nitro_overdrive_opening.png`.
- Claim: at `375x667` the settled buy dialog runs from about y=25 to a magenta bottom border
  at about y=630, and its last visible content is the three column strip `PRICE` `$100.00`,
  `RTP` `96.35%`, `MAX WIN` `5,000× base bet`, ending at about y=605. Between the strip and
  the border there is nothing, and no accept or dismiss control is on screen. `296` is the
  same dialog at `$400.00` with the same absence. The dialog is at scroll position zero,
  since the hero icon and the title are both fully visible, so this is the first thing a
  player sees: a purchase prompt naming a real price with no visible way to take it or
  leave it.

  **Source settles the mechanism, and it is an unintended consequence of an earlier fix.**
  `frontend/src/lib/components/BuyBonus.svelte:174` caps the modal at
  `width: min(94vw, 460px); max-height: 90dvh; overflow-y: auto`, so at 667px the modal is
  about 600px tall and scrolls internally. The actions live at
  `frontend/src/lib/components/BuyBonus.svelte:141-147` (`.buy-actions`, styled at `:248`),
  which is the LAST block in the scroll flow. Directly above them,
  `frontend/src/lib/components/BuyBonus.svelte:231-233` pins the stats row with
  `position: sticky; bottom: 0`. The comment at
  `frontend/src/lib/components/BuyBonus.svelte:215-218` records exactly why: R12 found the
  disclosure row *sat BELOW THE FOLD: measured out of view at 360x600 and at compact
  landscape 812x375*, and sticking it to the bottom of the scroll box fixed that. It also
  guaranteed that the sticky row permanently occupies the fold, so whatever is below it in
  the flow can never be the thing at the bottom of the visible box. That is now
  `.buy-actions`. The R12 fix moved the below-the-fold problem from the disclosure onto the
  primary action rather than removing it.

  Because the modal scrolls, the buttons are reachable, so this is HIGH and not STREAM. It
  is still a modal that opens showing no way out.
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:231-233` and
  `frontend/src/lib/components/BuyBonus.svelte:141-147` (not locked).
- Proposed fix: put `.buy-actions` inside the same sticky footer as `.buy-stats-row`, or
  give `.buy-actions` its own `position: sticky; bottom: 0` below it, so the disclosure and
  the actions are both always on screen and only the descriptive body scrolls.

## STC-MOBILEM-B-02 HIGH The FEATURES menu bet stepper wraps, putting minus and plus on different rows

- Frames: `reports/screens/stream-test-2026-07-28/292_mobile-m_features_menu.png`,
  `reports/screens/stream-test-2026-07-28/291_mobile-m_transition_features_menu_opening.png`.
- Claim: the spin cost pod renders as two rows. Row one is `SPIN COST` `$1.00` `BET`
  followed by the `-` button at about x=212 to 256, y=133 to 165. Row two carries the value
  `$1.00` at about x=218 to 266, y=181 to 198 and the `+` button at about x=276 to 320,
  y=173 to 206. The two halves of one stepper share neither a row, a vertical centre, nor a
  right edge: the `-` button sits about 79px in from the pod's right edge and the `+` button
  about 15px in, a 64px difference on a control that is symmetric by definition. The pod's
  lower left quadrant, roughly x=50 to 205 by y=170 to 210, is empty.

  Source confirms it is a wrap and not a layout choice.
  `frontend/src/lib/components/FeatureMenu.svelte:847` sets
  `.fm-betbar > .fs-face { flex-direction: row; align-items: center; gap: 0.7rem;
  padding: 8px 16px; flex-wrap: wrap; }`. The five children at
  `frontend/src/lib/components/FeatureMenu.svelte:334-343` (`fm-spin-cost`, `fm-betlabel`,
  `fm-step`, `fm-betval`, `fm-step`) exceed the available width at 375px and wrap between
  the two steppers. The mini panel variant already knows this is wrong and sets
  `flex-wrap: nowrap` at `frontend/src/lib/components/FeatureMenu.svelte:761`; the full
  panel was never given the same treatment. The bonus buy menu is one of the most looked at
  surfaces on a slot stream.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:847` (not locked).
- Proposed fix: set `flex-wrap: nowrap` to match `:761`, or wrap the three stepper children
  at `:341-343` in one flex child so the group wraps intact instead of splitting.

## STC-MOBILEM-B-03 HIGH The max win scrim is not opaque, so the HUD reads through it and collides with the caption

- Frames: `reports/screens/stream-test-2026-07-28/309_mobile-m_maxwin_celebration.png`,
  `reports/screens/stream-test-2026-07-28/308_mobile-m_transition_maxwin_overlay_fade.png`.
- Claim: the game surface beneath the celebration is legible through it. The
  `FUTURE SPINNER` wordmark ghosts at about y=12, a `$50,000.00` shaped string ghosts at
  about y=478 on the left at about x=45 to 145 and again on the right at about x=235 to 330,
  and a `$1.00` shaped string ghosts at about y=545. The overlay's own caption
  `PRESS COLLECT OR HIT ENTER TO CONTINUE` occupies y=445 to y=472, so three text layers
  stack inside the band y=440 to y=560, directly under the `COLLECT` button, which is where
  a viewer's eye is at the most watched moment in the game.

  Source gives the exact figures. `frontend/src/lib/components/MaxWinCelebration.svelte:194-198`
  sets the backdrop to
  `radial-gradient(ellipse at center, rgba(20, 8, 50, 0.97) 0%, rgba(6, 4, 20, 0.99) 100%)`.
  The centre stop is **alpha 0.97**, so 3% of the board and HUD composites through in
  exactly the middle band where the content sits, and the edge stop at 0.99 lets 1% through
  everywhere else. Against a bright white balance readout on a dark ground, 3% is enough to
  read the shape, which is what the frames show.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:194-198` (not locked).
- Proposed fix: take the centre stop to `rgba(20, 8, 50, 1)` and the outer to
  `rgba(6, 4, 20, 1)`, so the celebration is opaque once faded in. The fade at `:201` still
  provides the ease-in, so nothing is lost by removing the residual transparency.

## STC-MOBILEM-B-04 HIGH Two win readouts sit one above the other showing different amounts at the same moment

- Frames: `reports/screens/stream-test-2026-07-28/298_mobile-m_feature_entry_card.png` and
  every frame from `297` to `305` (`TOTAL WIN` `$10.80` directly above `WIN` `$0.00`);
  `reports/screens/stream-test-2026-07-28/311_mobile-m_post_collect_base.png` and
  `310_mobile-m_transition_maxwin_collect_fade.png` (`TOTAL WIN` `$2.80` directly above
  `WIN` `$5,000.00`).
- Claim: during and after the feature the HUD carries four pods in two rows: `OVERDRIVE FREE
  SPINS` with its counter and `TOTAL WIN` with its amount on row one, `BALANCE` and `WIN` on
  row two. In frames `297` to `305` the feature entry gate is up celebrating a trigger,
  `TOTAL WIN` reads `$10.80` and the `WIN` pod immediately below reads `$0.00`. In `310` and
  `311`, after the 5,000x cap has been collected, `TOTAL WIN` reads `$2.80` and `WIN`
  immediately below reads `$5,000.00`, a gap of `$4,997.20`. Neither state is mid count-up:
  both figures are at rest across six consecutive captured frames. Whatever the two pods
  each mean, a viewer reads two adjacent boxes both labelled with a win and disagreeing.

  **This is the same CLASS as ledger MID-01 but it is not MID-01**: a different component
  pair (feature total pod against HUD win pod, not banner against HUD win pod), a different
  mechanism (values at rest, not two count-up clocks of different duration), and none of
  MID-01's frames are in this range. Recorded as new so the marshal can merge it into
  MID-01's class deliberately rather than by accident. It escalates to STREAM if the two
  pods are intended to show the same quantity.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte`, the feature HUD pod row
  (exact line not located within the step 3 budget; the file is not locked).
- Proposed fix: PARK(what the base WIN pod should read while a feature total pod is on
  screen is an art call of the same shape as MID-01's, and MID-01 was parked for the owner
  for that reason. Options: hide the base WIN pod while the feature HUD row is mounted;
  mirror the feature total into it; or relabel one of the two so the pair cannot be read as
  the same quantity.)

## STC-MOBILEM-B-05 HIGH The autoplay panel is a right anchored dropdown at a phone width and slices the balance mid string

- Frames: `reports/screens/stream-test-2026-07-28/290_mobile-m_autoplay_menu.png`.
- Claim: the autoplay panel occupies about x=145 to x=367 of a 375px viewport, that is 59%
  of the width, hard against the right edge with an 8px gutter and 145px of untouched game
  on its left. Two consequences, both visible in the one frame. First, the panel's left edge
  lands in the middle of the `BALANCE` pod's value, so the readout on screen is `$50,000.0`
  cut at the last glyph, which reads as a truncated number rather than as an occlusion.
  Second, the panel is translucent: the magenta `FEATURES` bar and its border read through
  it at about y=388 to y=418, a `$16.20` shaped string reads through at about y=478, and a
  `$1.00` shaped string reads through at about y=545, landing between the panel's own list
  rows `100` at y=516 and the infinity row at y=562. The panel also carries no title, so the
  surface identifies itself only by its contents.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:502` (`.auto-menu
  .p-auto-menu`) and `frontend/src/lib/components/HudOverlay.svelte:738` (`.auto-menu
  .c-auto-menu`), with the anchoring and background rules in the same file's style block
  (not locked).
- Proposed fix: at narrow widths make the panel a full width sheet with an opaque ground
  rather than the right anchored translucent dropdown it currently is at every width.

## STC-MOBILEM-B-06 HIGH The max win overlay instructs a 375px touch viewport to hit a key it does not have

- Frames: `reports/screens/stream-test-2026-07-28/309_mobile-m_maxwin_celebration.png`,
  `reports/screens/stream-test-2026-07-28/308_mobile-m_transition_maxwin_overlay_fade.png`.
- Claim: the caption under the `COLLECT` button reads
  `PRESS COLLECT OR HIT ENTER TO CONTINUE`. The source literal is
  `frontend/src/lib/i18n/prose.ts:83`, `maxWinHint:  'Press COLLECT or hit Enter to
  continue'`, rendered at `frontend/src/lib/components/MaxWinCelebration.svelte:166` and
  upper-cased by the surface. The session viewport is `375x667`, a phone. There is no Enter
  key, so half the instruction on the game's biggest celebration surface is inapplicable to
  the device it is being shown on.
- Where fixable: `frontend/src/lib/i18n/prose.ts:83` for the literal, or
  `frontend/src/lib/components/MaxWinCelebration.svelte:166` for a device conditional
  (neither locked). The same key exists translated at
  `frontend/src/lib/i18n/prose.locales.ts:38` and `:114`, so a wording change is a
  sixteen-locale change.
- Proposed fix: PARK(the wording change is small but it is a sixteen-locale key edit, which
  KNOWN row TR-104 already sizes as larger than small. Options: branch the hint on pointer
  type so touch gets a collect-only line, which needs no new translations for the touch
  case; or reword to a device neutral form and re-translate all sixteen.)

## STC-MOBILEM-B-07 HIGH Seven frames captioned as the feature in flight all show the static entry gate

- Frames: `reports/screens/stream-test-2026-07-28/300_mobile-m_feature_run_1.png` through
  `305_mobile-m_feature_run_6.png`, and
  `reports/screens/stream-test-2026-07-28/299_mobile-m_transition_feature_starting.png`.
  Also `reports/screens/stream-test-2026-07-28/311_mobile-m_post_collect_base.png`.
- Claim: MANIFEST.json captions `300` to `305` as `Overdrive free spins in flight, interval
  frame N of 6` and `299` as `Feature starting, entry card dismissing`. All seven render the
  identical entry card: the title `OVERDRIVE FREE SPINS`, the gauge, `+16 FREE SPINS` and
  the gold `TAP TO CONTINUE` button, with the `OVERDRIVE FREE SPINS` pod reading `16`
  unchanged across all seven. The seven files are not byte identical (their md5 sums all
  differ, because the background particle field animates and the win line ticker cycles
  between `SCATTER  x5  5 ways  $10.00` and the L2 line) but the composition, the state and
  every readout are the same in all seven. `311`, captioned `Back to base after collect,
  balance settled`, is likewise not base: it shows a second entry card reading
  `+8 FREE SPINS`. **The mobile-m set therefore contains no frame of the feature actually
  spinning**, and any claim that the feature composes correctly at `375x667` is unsupported
  by this capture. Two readings and stills cannot separate them: either the harness never
  delivered the tap, or the entry gate does not accept the tap at this viewport. The second
  reading is a hard functional block and would be STREAM.
- Where fixable: not a source defect until the two readings are separated. The capture leg
  is in the stream test harness, not in `frontend/src`.
- Proposed fix: PARK(re-capture the mobile-m feature leg before anything is concluded. If
  the gate is genuinely not accepting the tap at 375px that is a separate and larger
  finding, and it would also invalidate the mobile-l and mobile-s feature legs, which should
  be checked for the same signature.)

## STC-MOBILEM-B-08 HIGH The win line strip prints `1 ways`, unpluralised, on every single-way win

- Frames: `reports/screens/stream-test-2026-07-28/311_mobile-m_post_collect_base.png`,
  `reports/screens/stream-test-2026-07-28/307_mobile-m_post_feature_base.png`,
  `302_mobile-m_feature_run_3.png`, `303_mobile-m_feature_run_4.png`,
  `304_mobile-m_feature_run_5.png`. Plural controls for contrast:
  `289_mobile-m_transition_paytable_closing.png` reads `M3  x5  8 ways  $16.00` and
  `299`/`305` read `SCATTER  x5  5 ways  $10.00`.
- Claim: **the frame reading was held at low confidence because the strip is set at roughly
  7px cap height, and source settled it.**
  `frontend/src/lib/components/WinBreakdown.svelte:94` is
  `<span class="wb-ways">{current.ways} ways</span>`, an unconditional plural with no
  singular branch, so every win that pays on exactly one way prints `1 ways`. This is the
  machine-tell class the standing mandate names, on a strip that is on screen for the whole
  of every win presentation. Two further facts from the same line, recorded because they are
  free: the word `ways` is a bare English literal rather than a `$tr` key, so it is a
  hardcoded-English instance that KNOWN row Q-16's enumeration does not name; and this file
  is not one of the two the Q-26 style sweep searched.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:94` (not locked).
- Proposed fix: branch on the count, for example
  `{current.ways} {current.ways === 1 ? 'way' : 'ways'}`, and preferably move both forms
  behind `$tr` keys so the string stops being English-only at the same time.

## STC-MOBILEM-B-09 MEDIUM The whole game surface scales up and shifts left during the collect fade

- Frames: `reports/screens/stream-test-2026-07-28/310_mobile-m_transition_maxwin_collect_fade.png`,
  against its neighbours `309_mobile-m_maxwin_celebration.png` and
  `311_mobile-m_post_collect_base.png`.
- Claim: in `310` the entire surface, HUD and button row included, is drawn about 2% larger
  and offset left compared with `307` and `311`. The `SPIN` button centre moves from about
  x=187 in `307` and `311` to about x=182 in `310`. The left gutter closes to about 2px
  while the right gutter stays at about 7px, so the enlarged layout is not centred: the
  transform origin is not the surface centre. A layout that is fine alone but jumps between
  two adjacent frames is the sequence failure this lens is for, and here it jumps
  asymmetrically, which is what makes it read as a fault rather than as a zoom.
- Where fixable: UNKNOWN. Not located within the step 3 budget; the candidate is the
  celebration exit transform, since `frontend/src/lib/components/MaxWinCelebration.svelte`
  is the only surface mounted at that moment, but the transform seen here is applied to the
  game surface beneath rather than to the overlay.
- Proposed fix: set the transform origin to the surface centre, or scale only the
  celebration layer and leave the HUD and control row alone.

## STC-MOBILEM-B-10 MEDIUM The max win headline is lit unevenly across its own length

- Frames: `reports/screens/stream-test-2026-07-28/309_mobile-m_maxwin_celebration.png`,
  `reports/screens/stream-test-2026-07-28/308_mobile-m_transition_maxwin_overlay_fade.png`.
- Claim: in both captured frames the bright lens shaped field has its optical centre at
  roughly x=250, y=330 while the content column, `MAX WIN REACHED!`, `5,000× BET`,
  `COLLECT` and the caption, is centred on the viewport at x=187. The roughly 60px offset is
  about 16% of the viewport width and it is visible: the left half of `REACHED!`, whose left
  edge is at about x=62, sits on the dark ground outside the lens while its right half sits
  on the bright field, so the headline is lit unevenly across its own length and the
  brightest part of the frame is empty background to its right.

  **Source narrows the cause and rules out the obvious suspect.** The backdrop at
  `frontend/src/lib/components/MaxWinCelebration.svelte:194-198` is
  `radial-gradient(ellipse at center, ...)`, which is symmetric about the viewport centre
  and therefore cannot produce this. The off-centre field must come from the rotating halo
  ring layer that begins at `frontend/src/lib/components/MaxWinCelebration.svelte:205`. That
  reframes the finding: it is not a static miscentring but a rotating element whose ellipse,
  at a 375x667 portrait aspect, sweeps a bright band that is off-axis at most angles. Two
  independently captured moments both landed off-axis, which is what makes it worth
  recording rather than dismissing as one unlucky frame.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:205` onwards, the
  rotating halo ring block (not locked).
- Proposed fix: constrain the halo's radius to the narrow axis at portrait aspects so it
  cannot exceed the frame, or stop rotating it at narrow widths, so the content column is
  always the brightest part of the composition.

## STC-MOBILEM-B-11 MEDIUM The feature entry card's stack is bottom heavy and its tightest gap is at the headline

- Frames: `reports/screens/stream-test-2026-07-28/298_mobile-m_feature_entry_card.png`,
  and the same card in `297`, `299`, `300` to `305` and `311`.
- Claim: inside the card region, which runs from about y=78 to about y=322, the vertical
  distribution is roughly 37px above the title `OVERDRIVE FREE SPINS`, about 22px from the
  title to the gauge, about 4px from the gauge's lower rim to the cap height of
  `+16 FREE SPINS`, about 18px to the `TAP TO CONTINUE` button, and about 10px below the
  button to the card's lower edge. Top padding is therefore roughly 3.7 times the bottom
  padding on a stack that is otherwise centred, and the one gap a designer would open up,
  between the hero gauge and the hero number, is the smallest on the card at about 4px. The
  gauge and the gold headline read as touching at this size.
- Where fixable: UNKNOWN. Not located within the step 3 budget; the candidate is
  `frontend/src/lib/components/FreeSpinsPresentation.svelte` (not locked), which is the only
  component named for this surface.
- Proposed fix: even the card's outer vertical padding and open the gauge-to-count gap to at
  least the title-to-gauge gap.

## STC-MOBILEM-B-12 MEDIUM The paytable panel's fixed 662px cap exceeds the space available at a 667px viewport, so it is cut by the screen edge

- Frames: `reports/screens/stream-test-2026-07-28/286_mobile-m_paytable_07_interface_guide.png`,
  against `reports/screens/stream-test-2026-07-28/287_mobile-m_paytable_08_responsible_play.png`.
- Claim: on `287` the panel is a closed shape: its border and its gold left stripe both
  terminate at about y=645, leaving a 22px gutter above the viewport bottom. On `286` the
  same panel has no bottom at all. Its border and stripe run off the bottom of the frame and
  the last interface row, `Menu` with the body line `Open the menu for the`, is bisected by
  the viewport edge at y=667 with no bottom border, no fade and no visible scroll
  affordance. Two adjacent frames of the same panel therefore show two different frames of
  the panel: one that is a card and one that is an open ended column.

  Source gives the number. `frontend/src/lib/components/PaytableModal.svelte:549` sets
  `max-height: 662px`, a hardcoded pixel cap, with `overflow-y: auto` at
  `frontend/src/lib/components/PaytableModal.svelte:594`. The session viewport is **667px
  tall** and the panel's top edge is at about y=28, so a panel allowed to reach 662px
  finishes at about y=690, which is **23px below the bottom of the screen**. The panel's own
  bottom chrome is therefore off-screen whenever a section is long enough to reach the cap,
  and on-screen whenever it is not, which is exactly the difference between `286` and `287`.
  A cap of 662 against a viewport of 667 is a five pixel margin that any device shorter than
  a 667px logical height will also fail.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:549` (not locked).
- Proposed fix: replace the fixed `max-height: 662px` with a viewport relative cap that
  accounts for the top offset, for example `max-height: min(662px, calc(100dvh - 56px))`, so
  the panel's bottom border is always inside the screen.

## STC-MOBILEM-B-13 MEDIUM Two consecutive paytable section frames land on the same view

- Frames: `reports/screens/stream-test-2026-07-28/287_mobile-m_paytable_08_responsible_play.png`,
  `reports/screens/stream-test-2026-07-28/288_mobile-m_paytable_09_disclaimer.png`.
- Claim: the two frames are not byte identical (md5 `755d1d470046146db1af8892625b84c8` and
  `21b0307edb830063ae28a249c05442a0`, differing in the animated background behind the panel)
  but their panel content, scroll position and composition are the same: both show the
  `MAX WIN` `5,000×` pod, then `RESPONSIBLE PLAY`, then `DISCLAIMER` ending on
  `Roll Spinners. All rights reserved.` at the same y. So navigating from section 08 to
  section 09 produces no visible change at this viewport: two of the paytable's nine section
  targets are indistinguishable. The cause is ordinary scroll clamping inside the
  `overflow-y: auto` box at `frontend/src/lib/components/PaytableModal.svelte:594`, the
  content below `RESPONSIBLE PLAY` being shorter than the box, but the player-visible effect
  is a navigation control that appears not to work.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:594` (not locked).
- Proposed fix: PARK(small, but the direction is a design call: either pad the scroll
  container's tail so every anchor can reach the top, or mark the active section in the
  navigation so a clamped jump still gives feedback.)

## STC-MOBILEM-B-14 MEDIUM `MAX` is the only control in the bottom row without button chrome

- Frames: `reports/screens/stream-test-2026-07-28/289_mobile-m_transition_paytable_closing.png`,
  `307_mobile-m_post_feature_base.png`, `306_mobile-m_transition_feature_exit.png`, and every
  base and feature frame in the range that shows the control row (`297` to `305`, `310`,
  `311`).
- Claim: the bottom control row reads, left to right: a circular menu button with a visible
  ring at about x=36, a circular turbo button with a ring at about x=92, the large circular
  `SPIN` button at about x=187, the word `MAX` in gold with no ring, no fill and no border at
  about x=282, and a circular autoplay button with a ring at about x=338. Four of the five
  controls are circles with chrome and the fifth is bare text sitting in the gap where its
  circle should be, so the row's rhythm breaks at the fourth position and `MAX` does not read
  as pressable next to its four neighbours. In frame `290` the autoplay button is shown in
  its active state with a cyan ring, which makes the missing ring on `MAX` more obvious
  rather than less.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte`, the bottom control row
  (exact line not located within the step 3 budget; the file is not locked).
- Proposed fix: give `MAX` the same circular chrome as its row-mates, or record explicitly
  that the bare label is the intended affordance so it stops being rediscovered.

## STC-MOBILEM-B-15 MEDIUM The balance readout does not move across the whole run, including a collected 5,000x cap

- Frames: `reports/screens/stream-test-2026-07-28/289_mobile-m_transition_paytable_closing.png`
  (`BALANCE` `$50,000.00`, `WIN` `$16.20`), `306` (`$50,000.00`, `WIN` `$324.86`), `307`
  (`$50,000.00`, `WIN` `$363.89`), `310` and `311` (`$50,000.00`, `WIN` `$5,000.00`).
- Claim: `BALANCE` reads exactly `$50,000.00` on all eleven frames in this range that show
  it, including frame `311`, which MANIFEST.json captions `Back to base after collect,
  balance settled` and which shows `WIN` `$5,000.00`. On stream a balance that does not move
  while wins land is the first thing a chat notices. **Stated with its caveat and not
  over-claimed**: this is outside the composition lens, and stills cannot distinguish a game
  defect from a capture harness whose wallet stub returns a constant balance. MANIFEST.json
  does record real wallet traffic (`authenticate` 40, `play` 70, `endRound` 70). Handed to
  the money lens rather than ruled on here, per the facts discipline.
- Where fixable: UNKNOWN, and deliberately not investigated: the balance path runs through
  `frontend/src/lib/stores/gameStore.ts` and `frontend/src/lib/services/rgsService.ts`, both
  LOCKED.
- Proposed fix: PARK(needs the money lens and the harness configuration before any fix is
  proposed. Do not act on this row from frames alone, and note the likely fix site is
  LOCKED.)

## STC-MOBILEM-B-16 LOW The reel frame's rails run to the viewport edge while every other element is inset

- Frames: `reports/screens/stream-test-2026-07-28/307_mobile-m_post_feature_base.png`,
  `306_mobile-m_transition_feature_exit.png`,
  `289_mobile-m_transition_paytable_closing.png`, and the feature frames `297` to `305`.
- Claim: the symbol grid, the `FEATURES` bar, the `BALANCE` and `WIN` pods and the `BET` row
  all sit about 8px in from each viewport edge. The reel frame's top rail at about y=45 to
  y=62 and its bottom rail at about y=348 to y=365 are wider than that and their grey end
  caps reach the viewport's left and right edges, so the caps are bisected by the frame
  boundary rather than sitting inside a margin like everything else on the screen. In a
  stream overlay's cropped frame this is the element that will be cut first.
- Where fixable: UNKNOWN. Not located within the step 3 budget; the candidate is the reel
  frame chrome in `frontend/src/lib/components/GameGrid.svelte` or `SceneGroup.svelte`
  (neither locked).
- Proposed fix: bring the rails inside the same 8px inset as the rest of the surface at
  narrow widths.

## STC-MOBILEM-B-17 LOW The buy dialog's three column stat strip is unbalanced because only its third column wraps

- Frames: `reports/screens/stream-test-2026-07-28/294_mobile-m_dialog_buy_overdrive.png`,
  `296_mobile-m_dialog_nitro_overdrive.png`, `293`, `295`.
- Claim: the strip carries `PRICE` `$100.00`, `RTP` `96.35%` and `MAX WIN` `5,000×` with
  `base bet` on a second line. The three values share their first baseline at about y=568,
  but only the third column has a second line at about y=590, so the strip is two lines tall
  on the right and one line tall on the left, leaving about 30px of dead space under
  `$100.00` and `96.35%`. The strip's own padding is uneven as a result: about 17px above
  the labels and about 7px below `base bet`. The wrapping value comes from
  `maxWinVsBaseBetLabel($isSocial)` at
  `frontend/src/lib/components/BuyBonus.svelte:127`, rendered into `.buy-stat` at
  `frontend/src/lib/components/BuyBonus.svelte:236`, which is `flex: 1` and so gets a third
  of a 460px-capped modal that is only about 352px wide at this viewport.
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:236` and `:127` (not locked).
- Proposed fix: keep `5,000× base bet` on one line at this width, or give all three columns
  the same two line structure so the strip's baselines stay even.

## STC-MOBILEM-B-18 LOW The max win figure and its unit are set with almost no space between them

- Frames: `reports/screens/stream-test-2026-07-28/309_mobile-m_maxwin_celebration.png`,
  `308_mobile-m_transition_maxwin_overlay_fade.png`.
- Claim: `5,000` is set at roughly 40px cap height ending at about x=250. The multiplication
  glyph begins at about x=254 and `BET` at about x=266, so the gaps are about 4px and about
  2px at that type size. The unit reads as jammed against both the number and its own second
  word, and at a glance the group reads as one run-on token rather than as a figure with a
  unit.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:156` and its
  surrounding unit markup (not locked).
- Proposed fix: add explicit horizontal spacing around the unit on this surface.

## STC-MOBILEM-B-19 LOW The base surface is top tight and bottom loose

- Frames: `reports/screens/stream-test-2026-07-28/289_mobile-m_transition_paytable_closing.png`,
  `306`, `307`, and the feature frames `297` to `305`, `311`.
- Claim: the `FUTURE SPINNER` wordmark begins at about y=5, so the surface has about a 5px
  top gutter, while the bottom control row ends at about y=645, a gutter of about 22px. The
  vertical framing of the whole game is therefore about 17px off centre with the wordmark
  nearly touching the top edge. On the same frames the wordmark's script underline is partly
  overlapped by the reel frame's top rail at about y=45.
- Where fixable: UNKNOWN. Not located within the step 3 budget; the outer layout is in
  `frontend/src/App.svelte` (not locked).
- Proposed fix: even the outer vertical padding at this breakpoint, and give the wordmark
  clearance from the reel frame's top rail.

## STC-MOBILEM-B-20 LOW Sibling buy dialogs disagree on title casing

- Frames: `reports/screens/stream-test-2026-07-28/294_mobile-m_dialog_buy_overdrive.png`
  (title `Buy Overdrive`), `296_mobile-m_dialog_nitro_overdrive.png` (title
  `NITRO OVERDRIVE`).
- Claim: the same dialog component titles one mode in title case and the other in upper
  case. The features menu in `292` shows the same split across its cards: `Normal` and
  `Cruise` in title case, `OVERBOOST` in upper case. This is adjacent to KNOWN row Q-34,
  which records `Cruise` against `CRUISE`, but it is not the same instance: Q-34 is one word
  rendered two ways on two surfaces, and this is five mode names rendered two ways on one
  surface. It may well be a deliberate escalation of tone for the premium modes, which is
  why it is filed LOW and as a question rather than as a defect.
- Where fixable: the mode label keys resolved through
  `frontend/src/lib/config/fsModes.ts:75-115` (`labelKey` per mode) into
  `frontend/src/lib/i18n/prose.ts`. `fsModes.ts` is not locked;
  `games/future_spinner/**` is, and is not involved.
- Proposed fix: PARK(art call. Either the mode names carry their intended casing and the
  split is deliberate, in which case record it so it stops being rediscovered, or they
  should be unified.)

---

## Explicit absences, signed

Signed by STC-MOBILEM-B for the 26 frames listed under scope. Each line states what was
checked, so the absence is checkable rather than asserted.

- **No money string in this range overflows, ellipsises, clips or wraps inside its own
  container**, so there is no fresh instance of KNOWN rows TR-115 or TR-086 here. Checked
  every money readout that appears: `BALANCE` `$50,000.00`, `WIN` at `$0.00`, `$16.20`,
  `$324.86`, `$363.89` and `$5,000.00`, `TOTAL WIN` at `$10.80` and `$2.80`, `BET` `$1.00`,
  `SPIN COST` `$1.00`, `PRICE` `$100.00` and `$400.00`, `MAX WIN` `5,000×`, and the win line
  strip amounts `$16.00`, `$10.00`, `$0.80` and `$0.20`. Every one sits inside its pod with
  clear side padding. The single case where a money string is cut, the `$50,000.0` in frame
  `290`, is occlusion by the autoplay panel and is filed as B-05, not as a fit failure.
- **No replay surface and no ghost pod appears in this range**, so KNOWN row TR-114 is not
  exercised. Checked: none of the 26 frames shows a replay banner, a replay URL state, or a
  pod without a value.
- **No localised surface appears in this range.** The session is `lang: en` per
  MANIFEST.json, so KNOWN row TR-104, which is about German and Arabic, cannot be observed
  here and is neither confirmed nor refuted by this shard.
- **No stock Vite scaffold styling reaches any of these 26 frames**, so KNOWN row Q-27 is
  not exercised. Checked: no anchor styled with the stock indigo link colour, no `#242424`
  ground, no scaffold-centred body. Every surface in the range is themed.
- **No placeholder or error string survives on any of the 26 frames.** Checked every frame
  for `lorem`, `TODO`, `TBD`, `undefined`, `NaN`, `null`, `[object Object]`, `%s`, `{0}` and
  empty brace pairs. None present.
- **Nothing is clipped by the LEFT or RIGHT viewport edge on any of the 26 frames** other
  than the two cases filed above (B-05, the autoplay panel over the balance, and B-16, the
  reel frame rails). Checked the leftmost and rightmost 12px band of every frame: no text,
  no numeral and no icon is bisected there, and no frame shows a horizontal scrollbar or a
  horizontally clipped panel.
- **The paytable body copy in frames `286`, `287` and `288` is fully inside the panel's side
  padding on every line.** No line reaches either panel border, no word is broken mid-word,
  and no line is orphaned to a single word. The failure in the paytable is vertical only
  (B-12, B-13).
- **The five bottom-row controls hold one consistent vertical centre on every frame that
  shows them.** Checked `289`, `297` to `307`, `310` and `311`: the menu, turbo, `SPIN`,
  `MAX` and autoplay controls share a centre line at about y=620 in every unscaled frame.
  The `MAX` defect is chrome, not alignment (B-14).
- **The two side-by-side pod pairs are equal in width and share their top and bottom
  edges.** Checked `BALANCE` against `WIN` and `OVERDRIVE FREE SPINS` against `TOTAL WIN` in
  frames `289`, `297` to `307`, `310` and `311`: both pairs are about 177px and 176px wide
  against each other and both share a common box. The imbalance in the feature pair is in
  label line count and value type size, not in geometry, and no baseline offset figure is
  claimed because I could not measure one to better than a few pixels.
- **Neither MID-01 nor MID-02 is observable in this range.** MID-01's surface is the win
  banner count-up against the HUD win pod and MID-02's is the banner's `16x BET` unit; the
  mobile-m big-win triple is frames `272` to `274`, which belong to another squad and were
  not opened. No win banner appears in frames 286 to 311. B-04 is deliberately filed as a
  new id for the reasons written into it.
- **KNOWN row Q-07, the infinity glyph, is present and is not being reported as a finding.**
  Frame `290` shows the infinity option at the foot of the autoplay spin list
  (`frontend/src/lib/components/HudOverlay.svelte:518`); the row records it as reviewed,
  kept and allowlisted.
- **No multiplication-glyph defect was claimed on the buy dialogs**, because source refutes
  the frame reading rather than supporting it: `frontend/src/lib/i18n/translations.ts:1537`
  is `buyConfirmBody: 'Start Overdrive Free Spins now at {cost}× your bet?'` with U+00D7, and
  `frontend/src/lib/components/FeatureMenu.svelte:372,427,480` all use `×`. The letter-x
  instances visible on these frames are the mode blurbs only, recorded under KNOWN(Q-26)
  below.

## KNOWN matches

- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/292_mobile-m_features_menu.png` and
  `291_mobile-m_transition_features_menu_opening.png` render
  `Double-chance: about 1.6x the feature trigger rate. Debits 1.25x every spin while ON.`;
  `reports/screens/stream-test-2026-07-28/296_mobile-m_dialog_nitro_overdrive.png` and
  `295` render `Buy a rich entry with the Overdrive meter pre-revved to 5x.` The row asks
  whether the survivors are visible on frames: **they are, on two separate surfaces at the
  standard phone width**, which makes it a Wave 3 fix candidate by the row's own test.

  **The row's file is wrong, and it matters because a fixer searching that file finds
  nothing.** Q-26 says the instances are *in `fsModes.ts` blurbs*. They are not.
  `frontend/src/lib/config/fsModes.ts:95` and `:115` hold only `blurbKey:
  'modeOverboostBlurb'` and `blurbKey: 'modeSuperBlurb'`, pointers. The literals are at
  `frontend/src/lib/i18n/prose.ts:90` and `:94` (real money) and `frontend/src/lib/i18n/prose.ts:189`
  and `:192` (social). The COUNT the row gives is right, four instances of `1.6x`, `1.25x`
  twice and `5x`; only the location is wrong. Q-26 also has a locale dimension the row does
  not mention, since the same keys exist in `frontend/src/lib/i18n/prose.locales.ts`.

- KNOWN(Q-34): `reports/screens/stream-test-2026-07-28/292_mobile-m_features_menu.png`
  renders the mode names `Normal` and `Cruise` in title case on the features menu, which is
  the lower-case half of the row's pair. No HUD mode badge appears in frames 286 to 311, so
  this shard evidences one side of Q-34 only and cannot confirm the `CRUISE` half.

- KNOWN(Q-16 park): `reports/screens/stream-test-2026-07-28/290_mobile-m_autoplay_menu.png`
  shows the parked autoplay labels on a stream frame: `Stop on win`, `Single win limit`,
  `Stop on feature`, `Loss limit` and the header `SPINS`.
  `286_mobile-m_paytable_07_interface_guide.png`, `287` and `288` show the parked paytable
  headers `INTERFACE GUIDE`, `RESPONSIBLE PLAY` and `DISCLAIMER`, plus the interface guide
  row labels `Spin`, `Increase Bet`, `Decrease Bet`, `Features`, `Autoplay` and `Menu`. `308`
  and `309` show `PRESS COLLECT OR HIT ENTER TO CONTINUE`. This session is `en`, so the
  strings read correctly; recorded as visibility evidence for the park, per the row's
  instruction that visibility changes its urgency.

  **Three corrections to the row's own enumeration, all checkable, recorded because this is
  the same failure shape MID-02 named: a parked list that calls itself complete and is
  not.**
  1. The row enumerates the autoplay labels as `Stop on win`, `Loss limit`, `Spins`,
     `Session`. Frame `290` also shows `Single win limit` and `Stop on feature`, neither of
     which the row names.
  2. Of those autoplay labels, only `Spins` is actually a bare literal:
     `frontend/src/lib/components/HudOverlay.svelte:513` and `:749` are
     `<div class="auto-menu-sep">Spins</div>`. `Stop on win`, `Single win limit`,
     `Stop on feature` and `Loss limit` are routed through `$tr` at
     `frontend/src/lib/components/HudOverlay.svelte:503, 504, 508, 509`. Whether those
     `$tr` values differ per locale is not visible from an `en` session and is not claimed
     here; what is claimed is that they are not bare literals, so the row's description of
     them is wrong even if the outcome turns out the same.
  3. The row lists `Press COLLECT or hit Enter to continue` as hardcoded English. It is
     not. `frontend/src/lib/i18n/prose.ts:83` is the English value of a translated key, and
     `frontend/src/lib/i18n/prose.locales.ts:38` and `:114` carry Arabic and German values
     for `maxWinHint`. The string has a real defect, but it is B-06's defect, not Q-16's,
     and closing Q-16 would not touch it.

## LOUD: a committed evidence frame is MODIFIED in the working tree

`git status --porcelain` at the end of this run reports
`M reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png`.

**A committed evidence PNG has been modified.** Stating plainly what is and is not known:

- It is **not this squad's doing**. Frame `188` is a `popout-s` frame, outside the 286 to
  311 range, and it was never opened here. This squad's only write was its own shard at
  `reports/qa/stream_test/shards/STC-MOBILEM-B.md`, and it ran no project script.
- Nothing was done about it. It was **not** restored, reverted, checked out or touched, per
  the read-only rule and per multi-track rule 11's instruction that a session finding
  unexpected state in someone else's tree reports it rather than putting it back.
- This is the exact signature of the failure `CLAUDE.md` convention **(h.1)** records under
  SA-012: a proof or gate script writing into a committed evidence directory, so that a
  casual re-run silently modifies committed evidence. That convention names
  `anticipation_proof.mjs`, `layout_fit_gate.mjs` and `contrast_gate.mjs` as scripts that do
  this. Convention (h.1) also states the consequence that matters here: **evidence that a
  casual re-run can overwrite is not evidence**.
- **Consequence for this wave**: if `188` was rewritten after the capture, then at least one
  frame of the stream test evidence set no longer matches what was captured at `d9bdf22`,
  and any squad that judged `188` judged a frame that may not be the captured one. The
  marshal should establish whether the modification predates or postdates the Wave 2 squads
  before consolidating, and should restore `188` from HEAD.

tree_after:

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

`STC-MOBILEM-B.md` is this squad's shard, untracked, as expected. The other sixteen shards
are other squads' and are not this squad's to touch. Nothing shows as DELETED. The one
MODIFIED entry is the frame above.
