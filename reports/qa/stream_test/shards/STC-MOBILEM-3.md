# STC-MOBILEM-3, COMPOSITION (mobile-m, frames 295 to 311, 1600px upscaled)

supersedes: STC-MOBILEM-B.md (partially: that shard spans 286 to 311 and this one re-reads
its 295 to 311 tail at full resolution). STC-MOBILEM-A.md spans 260 to 285 and is entirely
outside this range; nothing in it is reconciled here.

scope: the `mobile-m` frames numbered 295 to 311 inclusive, 17 frames, read from
`/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`, which is the committed
set at `reports/screens/stream-test-2026-07-28/` resampled to 1600px height. Native
viewport `375x667`, lang `en`, build `d9bdf22` per
`reports/screens/stream-test-2026-07-28/MANIFEST.json`.

frames_read: 17

**Measurement basis, stated once so no figure below is read as more precise than it is.**
Every upscaled frame is `899x1600`, confirmed with `sips` on
`296_mobile-m_dialog_nitro_overdrive.png`. The scale factor from native is
`1600 / 667 = 2.3988`, so one native pixel is 2.399 upscaled pixels and every upscaled
figure below is divided by 2.399 to give its native equivalent. **All pixel figures in this
shard are upscaled-frame pixels unless the native value is given beside them.** Edges were
read off the rendered frame and are good to about plus or minus 3 upscaled pixels, which is
about 1.3 native pixels; where a claim needed better than that, the region was cropped with
`sips` into the session scratchpad and enlarged, and the shard says so at the point of use.
No image tooling (`PIL`, `numpy`, ImageMagick) exists on this machine, so no figure here
came from a pixel-exact automated read.

Frames covered, in order: `295_mobile-m_transition_dialog_nitro_overdrive_opening.png`,
`296_mobile-m_dialog_nitro_overdrive.png`, `297_mobile-m_transition_feature_entry_fade.png`,
`298_mobile-m_feature_entry_card.png`, `299_mobile-m_transition_feature_starting.png`,
`300_mobile-m_feature_run_1.png` through `305_mobile-m_feature_run_6.png`,
`306_mobile-m_transition_feature_exit.png`, `307_mobile-m_post_feature_base.png`,
`308_mobile-m_transition_maxwin_overlay_fade.png`, `309_mobile-m_maxwin_celebration.png`,
`310_mobile-m_transition_maxwin_collect_fade.png`, `311_mobile-m_post_collect_base.png`.

---

## STC-MOBILEM-3-01 HIGH The feature entry headline is drawn straight across the speedometer dial, not below it

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/298_mobile-m_feature_entry_card.png`,
  and the identical collision on
  `297_mobile-m_transition_feature_entry_fade.png`,
  `299_mobile-m_transition_feature_starting.png`,
  `300_mobile-m_feature_run_1.png`, `301_mobile-m_feature_run_2.png`,
  `302_mobile-m_feature_run_3.png`, `303_mobile-m_feature_run_4.png`,
  `304_mobile-m_feature_run_5.png`, `305_mobile-m_feature_run_6.png` and
  `311_mobile-m_post_collect_base.png`, all in the same directory. Ten of the seventeen
  frames in this range carry it.
- Claim: on `298` the gauge's outer gold ring occupies `x 317` to `x 583` and `y 353` to
  `y 614`. The gold headline `+16 FREE SPINS` occupies `x 238` to `x 662` with its cap band
  from `y 561` to its baseline at `y 593`. **The entire cap band of the headline lies inside
  the dial**: measured from the top of the caps to the dial's lower rim the overlap is
  `53` upscaled px, which is **22 native px**, and the dial is 266 upscaled px wide against
  a headline 424 upscaled px wide, so the whole gauge sits behind the middle of the string.
  Settled on an enlargement rather than by eye: the region `x 225..685, y 340..640` was
  cropped and resampled to 1400px wide, and at that scale the dial's lower silver bezel, its
  gold rim and its lower `0` marker all read through the counters of `E`, `S`, `P`, `I` and
  `N`, and the bezel arc passes between the two strokes of the `E` in `FREE`. `311` is the
  same collision with `+8 FREE SPINS` at `x 250` to `x 650`.

  Beside it, the primary control is equally tight: the `TAP TO CONTINUE` pill occupies
  `x 268..632, y 632..765` and the reel window's bottom border is at `y 778`, a clearance of
  `13` upscaled px, **5.4 native px**.

  **This supersedes the native pass's reading of the same surface.** `STC-MOBILEM-B-11`
  recorded *about 4px from the gauge's lower rim to the cap height of `+16 FREE SPINS`*,
  that is a four native pixel GAP. There is no gap. The sign is reversed and the magnitude
  is five times larger.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/FreeSpinsPresentation.svelte:581-583`
  (`.entry-gauge-wrap`) against `frontend/src/lib/components/FreeSpinsPresentation.svelte:645-648`
  (`.entry-bottom-group`). Not locked.
- Proposed fix: **the source names the gap in its own comment and the comment is the
  diagnosis.** `:641-644` records that the round-3 fix put the award text and the continue
  gate into one flex column *so the award text and the continue button stack with a real,
  guaranteed gap - they can never overlap regardless of the button's own height or the
  viewport's aspect ratio, unlike two independent bottom:N% elements.* That guarantee covers
  the two elements INSIDE `.entry-bottom-group` and nothing else. The gauge is not in the
  group: `.entry-gauge-wrap` is a `240px` square in normal flow while `.entry-bottom-group`
  is `position: absolute; bottom: 2%`, so on a short portrait stage the fixed-size gauge and
  the bottom-anchored group are exactly the two independently positioned elements the fix
  set out to eliminate, one layer up. Fix by bringing the gauge into the same flex column so
  one flow guarantees all three gaps, or by making the gauge's `240px` size relative to the
  stage height so it cannot reach the bottom group at this aspect.

## STC-MOBILEM-3-02 HIGH The max win unit is three sizes, three colours and three baselines in one lockup

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/309_mobile-m_maxwin_celebration.png`,
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/308_mobile-m_transition_maxwin_overlay_fade.png`.
- Claim: settled on an enlargement, the region `x 150..770, y 755..885` of `309` cropped and
  resampled to 1500px wide. `5,000` runs `x 175.6` to `x 587.3` with its baseline at
  `y 870.7` and a cap height of `93` upscaled px (**38.7 native px**). The multiplication
  glyph runs `x 606.7` to `x 629.4` with its baseline at `y 844`. `BET` runs `x 646` to
  `x 722.5` with its baseline at `y 856`.

  So the three parts of one lockup sit on **three different baselines**, `870.7`, `844` and
  `856`; the glyph is `12` upscaled px (**5 native px**) above `BET`'s baseline even though
  the two are one unit; and the three parts carry three different fills, bright yellow for
  the figure, amber for the glyph and a dull orange for `BET`. The horizontal gaps are
  `19.4` upscaled px (**8.1 native px**) from the figure to the glyph and `16.6` upscaled px
  (**6.9 native px**) from the glyph to `BET`, against a 38.7 native px cap height, so the
  unit reads as jammed onto the end of the number.

  **The native pass had the substance and the wrong figures.** `STC-MOBILEM-B-18` claimed
  *about 4px and about 2px*; measured at full resolution they are 8.1 and 6.9 native px. It
  also could not see the baseline split, which is the part that makes the lockup read as
  assembled rather than set. No multiplication-glyph claim is made here: at this size the
  glyph is not separable from a letter `x` by eye, and `STC-MOBILEM-B` already refuted that
  reading from source for this surface.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:295-300`
  (`.c1-max-multwrap`), `:309-315` (`.c1-max-x`), `:316-323` (`.c1-max-betlabel`) and the
  narrow-viewport overrides at `:367-369`. Not locked.
- Proposed fix: **source confirms the derivation exactly, and the container's own rule is
  dead.** `.c1-max-multwrap:296-298` is `display: flex; align-items: baseline; gap: 0.1em`,
  but BOTH children override that with `align-self: flex-end` (`:312` and `:320`) and each
  then applies a DIFFERENT bottom padding in its own em, `padding-bottom: 0.12em` at `:313`
  against `padding-bottom: 0.28em` at `:321`. So the two boxes are bottom-aligned rather
  than baseline-aligned, and at the `max-width: 500px` breakpoint their font sizes are `24px`
  and `13px` (`:368`, `:369`), which puts different descender space under each. A larger
  glyph bottom-aligned beside a smaller one sits with its baseline HIGHER, which is exactly
  the direction and roughly the magnitude measured (5 native px, `×` above `BET`). Fix by
  deleting both `align-self: flex-end` declarations and both `padding-bottom` values so the
  container's declared `align-items: baseline` actually takes effect, which is what the rule
  at `:297` says was intended. Separately, `gap: 0.1em` at `:298` resolves against the
  WRAPPER's inherited font size, not the `50px` numeral's, so the gap does not scale with
  the figure; express it against the numeral instead.

## STC-MOBILEM-3-03 HIGH The buy confirm dialog closes on a 27 native px dead band, and the SPIN button behind it bleeds through its bottom border

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/296_mobile-m_dialog_nitro_overdrive.png`,
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/295_mobile-m_transition_dialog_nitro_overdrive_opening.png`.
- Claim: on `296` the dialog occupies `x 30..870, y 85..1505`, that is 350 by 592 native px
  of a 375 by 667 native viewport, 89 per cent of the viewport height. Its last content is
  the three-column strip `PRICE` `$400.00`, `RTP` `96.35%`, `MAX WIN` `5,000×` `base bet`,
  whose magenta bottom border is at `y 1440`. Between that border and the dialog's own
  bottom edge at `y 1505` there is a band of `65` upscaled px, **27 native px**, containing
  nothing. No `CONFIRM`, no `CANCEL`, no close control and no scroll affordance appears
  anywhere in the frame. The dialog is at scroll position zero, since the hero icon and the
  title are both fully visible.

  **New at this resolution**: the `SPIN` label of the button behind the modal reads through
  at `x 400..510, y 1478..1512`, and the dialog's own bottom border at `y 1505` passes
  through the middle of the word. So the one legible piece of text in the dialog's dead band
  belongs to a control the dialog is covering, and it is cut in half by the dialog's frame.
  At 334 image tokens that region is roughly four pixels tall and could not have been read.

  Same surface as `STC-MOBILEM-B-01` and as the ledger's Cluster 2 (`STC-LAPTOP-B-01`,
  `STC-MOBILES-B-01`, `STC-POPOUTL-B-01`, `STC-POPOUTS-B-01`, `STT-LAPTOP-B-01`,
  `STT-POPOUTS-B-01`), which is the most corroborated modal finding in the set.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:224-233` (`.buy-stats-row`,
  `position: sticky; bottom: 0; z-index: 2`) and `frontend/src/lib/components/BuyBonus.svelte:247`
  (`.buy-actions`, the last block in the scroll flow), inside the scroll box declared at
  `frontend/src/lib/components/BuyBonus.svelte:174` (`max-height: 90dvh; overflow-y: auto`).
  Not locked.
- Proposed fix: as `STC-MOBILEM-B-01` proposed and this shard confirms from the same source,
  put `.buy-actions` into the same sticky footer as `.buy-stats-row`, or give it its own
  `position: sticky; bottom: 0` beneath it, so the price and the two decisions are always on
  screen together and only the descriptive body scrolls. The `SPIN` bleed-through is a
  separate lever and is not in this file: the modal is opaque (`:175-176`), so the label is
  reading through the BACKDROP outside the modal's own box, which means the backdrop's
  opacity rather than the modal's. Recorded as needing the backdrop rule
  (`frontend/src/lib/components/BuyBonus.svelte:168-169`, `.buy-backdrop`) checked before a
  fix is proposed, rather than guessed at here.

## STC-MOBILEM-3-04 MEDIUM The feature pod pair puts its two values on different baselines, because only the left label wraps

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/298_mobile-m_feature_entry_card.png`,
  `311_mobile-m_post_collect_base.png`, `310_mobile-m_transition_maxwin_collect_fade.png`,
  and `297`, `299`, `300` to `305` in the same directory.
- Claim: on `298` the two pods of the feature row are geometrically equal, `x 30..440` and
  `x 458..872`, sharing top and bottom edges. Their CONTENT is not. `OVERDRIVE FREE SPINS`
  wraps to two lines (`OVERDRIVE FREE` / `SPINS`) with its block top at `y 900`; `TOTAL WIN`
  is one line with its top at `y 915`. The values below them therefore land at different
  heights: `16` has its cap band at `y 978..1008` and `$10.80` at `y 962..992`, a baseline
  offset of `16` upscaled px, **6.7 native px**, between two numbers a viewer reads as a
  pair. `311` repeats it with `8` against `$2.80`, `310` with `8` against `$2.80`.

  `STC-MOBILEM-B`'s signed absence states *no baseline offset figure is claimed because I
  could not measure one to better than a few pixels*. At 1600px it is measurable, and it is
  larger than "a few pixels" at native scale. Recorded so the honest native-resolution
  refusal is now answered rather than left open.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/BonusInstrumentColumn.svelte:232-240`
  (`.pm-cell`) and `frontend/src/lib/components/BonusInstrumentColumn.svelte:247-259`
  (`.pm-label`). Not locked.
- Proposed fix: **the source comment shows the wrap was decided and the consequence was
  not.** `.pm-label:255-257` reads *let it wrap onto a second line rather than
  force-nowrap/overflow; the cell has no fixed height so it grows*, and `.pm-cell:233-238`
  is `flex: 1 1 0; flex-direction: column; justify-content: center`. Each cell therefore
  centres its OWN label-plus-value column independently, so a cell whose label takes two
  lines pushes its value down relative to its single-line sibling. The cheapest fix that
  keeps the wrap is `min-height: 2.4em` on `.pm-label` (two lines at the declared
  `line-height: 1.2` at `:257`), so both cells reserve the same label height and the two
  values land on one line. The structural fix is to make `.pm-strip` a two-row grid with the
  labels in row one and the values in row two, which holds however many lines a translated
  label takes.

## STC-MOBILEM-3-05 MEDIUM The board module changes height and vertical position between the feature skin and the base skin, so the reel window steps on feature exit

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/305_mobile-m_feature_run_6.png`
  and `311_mobile-m_post_collect_base.png` (feature skin) against
  `307_mobile-m_post_feature_base.png` and `306_mobile-m_transition_feature_exit.png`
  (base skin), all in the same directory.
- Claim: the board is not the same size in the two skins. On the feature skin (`311`) the
  top rail occupies `y 100..145` and the reel window's neon frame ends at `y 800`. On the
  base skin (`307`) the top rail occupies `y 118..162` and the neon frame ends at `y 835`.
  The module's top therefore moves `18` upscaled px (**7.5 native px**) and its bottom moves
  `35` upscaled px (**14.6 native px**) between two consecutive states, while the HUD below
  holds station exactly: the `BALANCE` pod's top edge is at `y 1063` in both.

  The mechanism is visible in the frames rather than inferred. The row between the board and
  the balance pods is not the same row in the two states: the feature pod pair occupies
  `y 895..1040`, `145` upscaled px tall, and the base `FEATURES` bar occupies `y 920..1013`,
  `93` upscaled px tall. The board absorbs the `52` upscaled px (**21.7 native px**)
  difference by growing, so ending the feature visibly resizes the reel window rather than
  only reskinning it.

  **The specification confirms the measurement to within half a native pixel, which is the
  order convention (l.1) and (l.2) require.** `frontend/src/App.svelte:2387` makes
  `.native-hud-slot.portrait` **CONTENT-SIZED, not stretched**, and the canvas is sized from
  what is left after the wordmark and that content-driven HUD height
  (`frontend/src/App.svelte:830-838`, `PORTRAIT_WORDMARK_H = 28`, `PORTRAIT_HUD_MIN_H = 290`
  described in its own comment as *a FLOOR, not the answer*, having *drifted twice*). So the
  board is the remainder, and any change in HUD content height moves it by exactly that
  amount. Predicted board displacement = the HUD row difference = **21.7 native px**.
  Measured board displacement = 7.5 native px at the top plus 14.6 at the bottom =
  **22.1 native px**. The measurement confirmed the derivation rather than discovering it.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/App.svelte:2387` onwards (`.native-hud-slot.portrait`) with
  the canvas sizing constants at `frontend/src/App.svelte:830-838`. Not locked.
- Proposed fix: reserve one fixed height for the swap slot that carries the feature pod
  strip in one state and the `FEATURES` bar in the other, so the canvas remainder is
  constant across the two, or size the canvas from the MAXIMUM of the two HUD heights rather
  than from whichever is currently mounted. Either way the board stops resizing on a state
  change it has nothing to do with.

## STC-MOBILEM-3-06 MEDIUM The win-detail strip is a 15 native px band carrying about 7 native px of type, and three quarters of it is dead

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/307_mobile-m_post_feature_base.png`,
  `306_mobile-m_transition_feature_exit.png`, `311_mobile-m_post_collect_base.png`, and
  `297` through `305` in the same directory.
- Claim: on `307` the strip is a band at `y 793..830`, `37` upscaled px tall, which is
  **15.4 native px**, running the full inner width `x 30..870`. Its content
  `L2  xS  1ways  $0.80` has a cap height of about `17` upscaled px, **7.1 native px**, and
  spans `x 352..560`. So the band gives 24 per cent of its width to content and the other 76
  per cent is empty, while the type inside it is set at roughly a third of the cap height of
  the `BET` label directly below it. The band's bottom clears the neon frame's inner edge by
  about `5` upscaled px (**2 native px**), so it is hard against the frame with no room to
  grow.

  Independent corroboration from a sibling range: `STC-MOBILEM-A-05` reports the same strip
  landing at about 6 native px of glyph on frames 260 to 285, which this squad did not open.

  **Source gives the numbers and they match.** `frontend/src/lib/components/WinBreakdown.svelte:136`
  sets the strip's type at `font-size: 0.7rem`, which is `11.2px` at a 16px root; a cap
  height of roughly 0.7 of the em is **7.8 native px**, against my measured 7.1. The `ways`
  token is smaller still at `font-size: 0.62rem` (`frontend/src/lib/components/WinBreakdown.svelte:146`),
  `9.9px`, which is where `STC-MOBILEM-A-05`'s "about 6px of glyph" comes from. **A third
  thing falls out of the same rule and belongs to this lens**:
  `frontend/src/lib/components/WinBreakdown.svelte:131` is
  `gap: 10px; padding: 6px 16px 6px 18px`, so the strip's own left and right padding differ
  by `2px` on a strip whose content is centred and which reads as symmetric.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:136` and `:146` for the
  type size, `frontend/src/lib/components/WinBreakdown.svelte:131` for the uneven padding.
  Not locked.
- Proposed fix: take the strip to a size that survives a phone viewport (the `BET` label
  directly below it in the same frame is roughly three times its cap height, which is the
  available comparison), bring `.wb-ways` to the same size as its siblings rather than
  smaller, and make `:131` `padding: 6px 16px` so the two sides agree. The `1ways` plural in
  the same string is `STC-MOBILEM-B-08`'s and is confirmed above, not re-filed here.

## STC-MOBILEM-3-07 MEDIUM During the collect fade the whole game surface is displaced left AND down, and the reel frame's left border reaches the viewport edge

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/310_mobile-m_transition_maxwin_collect_fade.png`,
  against its settled neighbours `309_mobile-m_maxwin_celebration.png`,
  `307_mobile-m_post_feature_base.png` and `311_mobile-m_post_collect_base.png`.
- Claim: measured against the two settled frames that bracket it, all in the same
  directory. `BALANCE` pod left edge: `x 30` on `307` and `311`, `x 14` on `310`. `WIN` pod
  right edge: `x 872` on `307` and `311`, `x 860` on `310`. Bottom row leftmost button left
  edge: `x 28` on `307`, `x 18` on `310`. `FUTURE SPINNER` wordmark: `y 15..62` on `307` and
  `311`, `y 28..72` on `310`.

  So the surface is about `15` upscaled px (**6 native px**) LEFT and about `13` upscaled px
  (**5 native px**) DOWN of where it sits in the frames either side of it, and the visible
  consequences are two: a vertical strip of raw scene background about `11` upscaled px
  (**4.6 native px**) wide is uncovered down the right edge for the full height of the
  viewport, and the reel frame's left neon border reaches `x 0` and is cut by the left edge,
  where on `307` and `311` it sits at `x 12`.

  **The scale claim needs correcting.** `STC-MOBILEM-B-09` reports the surface drawn *about
  2% larger*. Measured at 1600px the left edge moves 16 upscaled px and the right edge 12,
  so the width grows by about `4` upscaled px, **1.7 native px**, which is about 1 per cent
  and is within twice my stated error bar. The DISPLACEMENT is unambiguous and repeatable
  across four independent element edges; the enlargement is at the limit of what this
  evidence supports and should be quoted as "about 1 per cent, possibly none" rather than as
  2 per cent. The vertical component was not in the native reading at all.
- Resolution note: VISIBLE AT BOTH
- Where fixable: UNKNOWN, and deliberately left there. Searched
  `frontend/src/App.svelte` and `frontend/src/lib/components/GameGrid.svelte` for a
  max-win-conditional transform on the game surface (`maxWinActive`, `max-win-active`,
  `isMaxWin`): **no hit in either file**. `frontend/src/lib/components/MaxWinCelebration.svelte`
  is the only surface mounted at that moment and its own transforms are on the overlay, not
  on the game beneath it, so the mechanism is not where the obvious candidate would put it.
  Per convention (l.6), parked rather than guessed.
- Proposed fix: PARK(the displacement is confirmed but its cause is not located, and naming
  a wrong file would send a fixer to the wrong place. What is now established and was not
  before: the displacement has a vertical component, so a horizontal-only transform-origin
  theory does not cover it, and the enlargement is about 1 per cent rather than 2, so a
  scale-driven explanation has less to work with than the native pass assumed.)

## STC-MOBILEM-3-08 WITHDRAWN, not a finding: the bottom control row is symmetric by construction

**This id is retired rather than reused, and the reason is recorded rather than deleted.**
This shard's frame pass measured the bottom control row's left gutter at `28.2` upscaled px
against a right gutter of `37.2`, a difference of `9` upscaled px (**3.75 native px**), on
an enlargement of the control band of `307`, and was about to file it LOW.

**Source refutes it, and the specification outranks the measurement.**
`frontend/src/lib/components/HudOverlay.svelte:1885` gives `.p-hud` a symmetric
`padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px))`.
`frontend/src/lib/components/HudOverlay.svelte:2023-2028` makes `.p-controls-row`
`display: flex; justify-content: space-between; gap: 10px`, and
`frontend/src/lib/components/HudOverlay.svelte:2030-2036` gives both `.p-controls-side`
groups `flex: 1 1 0`, so the two sides are equal by construction and `space-between` has no
slack to distribute. Critically,
`frontend/src/lib/components/HudOverlay.svelte:2037` is
`.p-controls-side:last-child { justify-content: flex-end; }`, which is exactly the rule
whose absence would have produced the asymmetry I measured. It is present. The row is
symmetric.

The measurement is explained without a defect: `.p-round-btn`
(`frontend/src/lib/components/HudOverlay.svelte:2041-2050`) is a `48px` box, which is
`115.1` upscaled px, and I read `112.6`, so I was reading about `1.25` upscaled px inside
the true box edge on each side of a button whose chrome is a
`radial-gradient(circle at 36% 28%, #1a2636, #060b16 72%)` fading into a near-identical
ground. A soft edge read by eye is not a 3 native px layout fault.

Convention (l.2) is explicit that **a measurement disagreeing with the specification is a
broken measurement until proven otherwise**, and this one is. Recorded here in full rather
than silently dropped, because a squad that quietly deletes its own near-miss teaches the
next squad nothing.

## STC-MOBILEM-3-09 LOW The buy dialog's stats strip is chamfered on three corners and square on the fourth

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/296_mobile-m_dialog_nitro_overdrive.png`,
  `295_mobile-m_transition_dialog_nitro_overdrive_opening.png`.
- Claim: on `296` the `WHAT YOU GET` panel runs `x 88..812` and the row of five symbol tiles
  runs `x 88..812`, so the dialog's content column is unambiguous. The
  `PRICE` / `RTP` / `MAX WIN` strip reads as sitting about `12` upscaled px (**5 native px**)
  right of that column at its top and bottom while reaching it in the middle, which at first
  reads as a strip nudged right.

  **Source says what it actually is, and it is better than the frame reading.**
  `frontend/src/lib/components/BuyBonus.svelte:228` clips the strip with
  `clip-path: polygon(0 12%, 3% 0, 97% 0, 100% 12%, 100% 100%, 3% 100%, 0 88%)`. Walking the
  points: the top-left is chamfered (`0 12%` to `3% 0`), the top-right is chamfered
  (`97% 0` to `100% 12%`), the bottom-left is chamfered (`3% 100%` to `0 88%`), and the
  **bottom-right is a square corner at `100% 100%`**. Three of the four corners are cut and
  the fourth is not, on a tech-panel shape whose whole visual idea is that its corners are
  cut. The `3%` inset is `21.7` upscaled px (**9 native px**) at this width, which is why the
  strip appeared inset at its top and bottom and flush at its middle.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:228`. Not locked.
- Proposed fix: one line. Either close the shape symmetrically, `polygon(0 12%, 3% 0, 97% 0,
  100% 12%, 100% 88%, 97% 100%, 3% 100%, 0 88%)`, so all four corners are chamfered, or drop
  to two chamfers on one diagonal deliberately and record that as the intent. Three-of-four
  is the one reading that cannot be defended as a choice.

---

## Native pass reconciliation

**Against `shards/superseded/STC-MOBILEM-A.md`: nothing to reconcile.** That shard's scope
is frames 260 to 285 and its ten findings (`A-01` through `A-10`) all cite frames in that
range. Not one falls inside 295 to 311. Those belong to a sibling squad and are ignored
here, per the brief. The one place its work touches mine is `A-05` (the win breakdown chip
at about 6px of glyph), which my `3-06` independently corroborates from different frames;
that is corroboration, not a reconciliation verdict, and I claim no verdict on `A-05`.

**Against `shards/superseded/STC-MOBILEM-B.md`**, whose scope is 286 to 311. Five of its
twenty findings (`B-02`, `B-05`, `B-12`, `B-13`, and the `294` half of `B-20`) cite only
frames 286 to 294, which are a sibling squad's in this re-run. They are named and skipped,
not judged. The remaining fifteen are below.

### REFUTED

- **`B-14` MEDIUM, "`MAX` is the only control in the bottom row without button chrome": REFUTED.**
  The claim is that `MAX` is *the word `MAX` in gold with no ring, no fill and no border ...
  bare text sitting in the gap where its circle should be*. It is not. On an enlargement of
  the control band of `307` (`y 1420..1570`, full width, resampled to 1500px), `MAX` sits on
  a dark circular disc of the same fill, the same subtle rim highlight and the **same
  diameter, `112.6` upscaled px**, as the menu, turbo and autoplay buttons either side of
  it. The four small buttons measure 112.6, 112.7, 112.7 and 112.6 upscaled px across. The
  only thing that distinguishes `MAX` is that its glyphs are gold where the others are cyan,
  which is a colour question and not the chrome question the finding asks.

  **Why the native pass got it wrong is worth recording**, because it is the whole argument
  for this re-run: the disc is a very dark grey on a very dark ground, and at 334 image
  tokens the whole control row is about 25 pixels tall, so a dark disc under bright glyphs
  and a bare label under bright glyphs are the same picture. The finding was a reasonable
  reading of an unresolvable image. It must not reach the ledger.

### REFINED

- **`B-11` MEDIUM, "the feature entry card's stack is bottom heavy and its tightest gap is
  at the headline": REFINED, and the refinement reverses its sign.** The native reading gave
  *about 4px from the gauge's lower rim to the cap height of `+16 FREE SPINS`* and concluded
  the two *read as touching*. At 1600px there is no gap at all: the headline's entire cap
  band lies inside the dial, a 22 native px overlap, with the dial's bezel and its `0`
  marker reading through the letterforms. Filed as `STC-MOBILEM-3-01` and escalated from
  MEDIUM to HIGH. The rest of `B-11`, the bottom-heavy stack, stands: measured on `298` the
  card's top padding is roughly 3.5 times its bottom padding, consistent with the native
  figure.

- **`B-18` LOW, "the max win figure and its unit are set with almost no space between them":
  REFINED.** The substance holds. The FIGURES do not: measured on an enlargement the gaps
  are `8.1` and `6.9` native px, not the *about 4px and about 2px* claimed. The native pass
  also could not see the part that matters most, which is that the glyph and `BET` sit on
  two different baselines `5` native px apart at two different sizes in two different
  colours. Filed with the corrected measurements as `STC-MOBILEM-3-02` and escalated from
  LOW to HIGH.

- **`B-09` MEDIUM, "the whole game surface scales up and shifts left during the collect
  fade": REFINED.** The shift is confirmed and is larger and more directional than reported:
  about 6 native px left and, not previously noted, about 5 native px DOWN. The scale claim
  of *about 2%* is not supported: at 1600px the width change measures about 1.7 native px,
  about 1 per cent, which is within twice my error bar. Restated as
  `STC-MOBILEM-3-07`. `B-09`'s reasoning that the transform origin is not the surface centre
  survives; its arithmetic does not.

- **`B-16` LOW, "the reel frame's rails run to the viewport edge while every other element
  is inset": REFINED, one clause refuted.** The disparity is real and confirmed: on `307`
  the HUD pods, the `FEATURES` bar and the `BET` row are inset `30` upscaled px
  (**12.5 native px**) while the rail's grey end caps reach `x 8` on the left and `x 890` on
  the right, an inset of about `3.3` and `3.75` native px. But the clause *their grey end
  caps reach the viewport's left and right edges, so the caps are bisected by the frame
  boundary* is wrong. They are not bisected. There is a 3 native px margin on both sides and
  the caps are whole. The severity is unchanged at LOW; the description needs correcting
  before it reaches the ledger, because "bisected" and "3px of margin" are different
  defects. The one frame in this range where a board edge IS cut is `310`, and that is
  `STC-MOBILEM-3-07`, not this.

- **`B-19` LOW, "the base surface is top tight and bottom loose": REFINED, one clause
  refuted.** The gutter claim is confirmed almost exactly: on `307` the wordmark's top is at
  `y 15` (**6.3 native px** of top gutter) and the control row's lower edge is at `y 1543`
  (**23.8 native px** of bottom gutter), a difference of 17.5 native px against the native
  pass's 17. The second clause, *the wordmark's script underline is partly overlapped by the
  reel frame's top rail*, is refuted: on `307` the wordmark and its flourish end at about
  `y 75` and the top rail begins at `y 118`, a clearance of `43` upscaled px
  (**18 native px**); on the feature skin (`298`) the rail begins at `y 100` and the
  clearance is still `25` upscaled px (**10.4 native px**). Nothing overlaps.

### CONFIRMED

- **`B-01` HIGH, buy confirm dialog with no visible `CONFIRM` or `CANCEL`: CONFIRMED** on
  `295` and `296` (its other two frames, `293` and `294`, are outside this range). The
  settled dialog runs `y 85..1505`, its last content ends at `y 1440`, and the band between
  is empty. Extended with the `SPIN` bleed-through as `STC-MOBILEM-3-03`.
- **`B-03` HIGH, the max win scrim is not opaque and the HUD reads through it: CONFIRMED**
  on `308` and `309`, and now measurable: on `309` a `$50,000.00`-shaped string ghosts at
  `x 95..375, y 1140..1175` and a `$5,000.00`-shaped string at `x 545..780` on the same
  line, with a `$1.00`-shaped string at `x 590..690, y 1290..1315`. All three are legible as
  money, not merely as shapes. **A false positive was avoided here and is recorded**: at
  1600px the celebration reads as though its backdrop were an ellipse that fails to cover
  the portrait viewport, with a hard arc across the top and bottom and the base HUD sitting
  outside it. It is not. The dark ground covers the full frame and the arc belongs to the
  bright halo layer, which is `B-10`'s finding, not a coverage failure. No new finding was
  filed for it.
- **`B-04` HIGH, two win readouts one above the other showing different amounts: CONFIRMED**
  on `297` to `305` (`TOTAL WIN` `$10.80` above `WIN` `$0.00`) and on `310` and `311`
  (`TOTAL WIN` `$2.80` above `WIN` `$5,000.00`). Every figure is unambiguously legible at
  1600px and none is mid count-up across the six consecutive frames.
- **`B-06` HIGH, the max win overlay tells a 375px touch viewport to hit Enter: CONFIRMED**
  on `308` and `309`. The caption reads `PRESS COLLECT OR HIT ENTER TO CONTINUE` and is
  fully legible. Adding one composition measurement the native pass did not have: on `309`
  line one runs `x 120..780`, that is `660` upscaled px or **275 native px** of a 375 native
  px viewport, leaving **21 native px** clear of each edge, and it orphans the single word
  `CONTINUE` onto line two at `x 355..545`.
- **`B-07` HIGH, seven frames captioned as the feature in flight all show the static entry
  gate: CONFIRMED**, and it is the single most consequential thing about this frame set.
  `299` through `305` all render the identical entry card, title `OVERDRIVE FREE SPINS`, the
  gauge, `+16 FREE SPINS`, the gold `TAP TO CONTINUE` pill, and the pod reading `16`
  throughout. `311`, captioned `Back to base after collect, balance settled`, shows a second
  entry card reading `+8 FREE SPINS`. **This range contains no frame of the Overdrive
  feature actually spinning at `375x667`**, so nothing in this shard can speak to how the
  feature composes in flight. Signed as an absence below as well as confirmed here.
- **`B-08` HIGH, the win line strip prints `1 ways`: CONFIRMED, and the frame now carries
  it.** The native pass held the frame reading at low confidence *because the strip is set
  at roughly 7px cap height* and leaned on source. At 1600px the strip is directly readable:
  `302`, `303`, `304`, `307` and `311` all read `1ways` with the `1` and the word set tight
  against each other, and `299` and `305` read `5 ways` as the plural control. The frame
  reading no longer needs the source to stand up.
- **`B-10` MEDIUM, the max win headline is lit unevenly across its own length: CONFIRMED**
  on `308` and `309`. On `309` the left half of `REACHED!` sits on a dark purple ground and
  its right half on a bright teal one, and the boundary between the two is a discernible arc
  crossing the frame, not a soft falloff. On `308` the same arc is at a different angle,
  which supports the native pass's diagnosis of a rotating layer rather than a static
  miscentring. Adding one measurement: on `309` the arc crosses the left edge at about
  `y 235` and the right edge at about `y 340`, and its lower counterpart crosses at about
  `y 1200` and `y 1180`, so the bright field is tilted by roughly 100 upscaled px across the
  frame width.
- **`B-15` MEDIUM, the balance readout does not move across the whole run: CONFIRMED** as an
  observation on the six frames in this range that show it (`306`, `307`, `310`, `311` and
  the celebration ghosts on `308`, `309`): `BALANCE` reads exactly `$50,000.00` on every
  one, including `311` where `WIN` reads `$5,000.00`. Its park stands and its caveat stands:
  stills cannot separate a game defect from a harness wallet stub, and the likely fix site
  is LOCKED. No verdict on the cause is offered here either.
- **`B-17` LOW, the buy dialog's stat strip is unbalanced because only its third column
  wraps: CONFIRMED** on `295` and `296`. `PRICE` `$400.00` and `RTP` `96.35%` are one line,
  `MAX WIN` is `5,000×` with `base bet` on a second line, so the third column is two lines
  tall against one, leaving dead space under the first two values. Measured at 1600px the
  second line's baseline sits `50` upscaled px (**21 native px**) below the shared first
  baseline and clears the strip's own bottom border by only `20` upscaled px
  (**8 native px**).
- **`B-20` LOW, sibling buy dialogs disagree on title casing: CONFIRMED for the half in this
  range.** `296` renders `NITRO OVERDRIVE` in upper case. Its pair, `294` rendering
  `Buy Overdrive` in title case, is outside this range and was not opened, so this shard
  evidences one side only and cannot close the comparison.

---

## Explicit absences, signed

Signed by STC-MOBILEM-3 for the seventeen frames listed under scope, at 1600px. Each line
says what was checked, so the absence is checkable rather than asserted.

- **No frame in this range shows the Overdrive feature actually spinning.** `299` through
  `305` and `311` are all the entry gate (`B-07`, confirmed above). **Any claim that the
  free spins surface composes correctly at `375x667` is unsupported by this capture**, and
  this shard makes no such claim. This is the largest gap in my coverage and it is a capture
  gap, not something a re-read at any resolution can close.
- **No modal in this range exceeds its viewport.** Checked the only modal present, the buy
  confirm dialog on `295` and `296`: it occupies `y 85..1505` of 1600, so it clears the top
  by `85` upscaled px (**35 native px**) and the bottom by `95` upscaled px
  (**40 native px**), and `x 30..870` clears left and right by `30` and `29` upscaled px.
  It is nowhere cut by the viewport. Its failure is internal (`3-03`, `3-09`, `B-01`,
  `B-17`), not overflow.
- **No panel in this range has become a scrolling box hiding its own content in a way this
  shard can see.** The paytable, which is where the ledger's Cluster 3 lives, is frames 279
  to 288 and is outside this range; no paytable frame was opened. The buy dialog's internal
  scroll is `B-01`'s mechanism and is confirmed above rather than re-derived. **Cluster 3 is
  neither confirmed nor refuted by this shard.**
- **No text, numeral or icon is bisected by the left or right viewport edge on sixteen of
  the seventeen frames.** Checked the leftmost and rightmost 30 upscaled px band of every
  frame. The one exception is `310`, filed as `3-07`, where the reel frame's left neon
  border reaches `x 0` and a strip of scene background is uncovered on the right. No frame
  in this range shows a horizontal scrollbar.
- **Every control in this range is above any reasonable touch minimum.** Measured: the four
  small HUD buttons are `112.6` upscaled px across, **47 native px**; the `SPIN` button is
  `178.6` upscaled px, **74 native px**; the `COLLECT` button on `309` is `426 x 95`
  upscaled px, **178 x 40 native px**; the `TAP TO CONTINUE` pill on `298` is `364 x 133`
  upscaled px, **152 x 55 native px**. Nothing is too small to hit. The one control-sized
  concern in the range is the reverse: no control at all in the buy dialog (`3-03`).
- **The two side-by-side pod pairs are equal in width and share their top and bottom edges**
  on every frame that shows them. Checked `297` to `307`, `310` and `311`: `BALANCE`
  `x 30..440` against `WIN` `x 458..872`, and the feature pair on the same grid. The pods'
  GEOMETRY is sound; the defect is in their content alignment (`3-04`).
- **No money string in this range overflows, ellipsises, clips or wraps inside its own
  container**, so no fresh instance of KNOWN rows **TR-115** or **TR-086** is recorded here.
  Checked every money readout in the range at 1600px: `BALANCE` `$50,000.00`, `WIN` at
  `$0.00`, `$324.86`, `$363.89` and `$5,000.00`, `TOTAL WIN` at `$10.80` and `$2.80`, `BET`
  `$1.00`, `PRICE` `$400.00`, `MAX WIN` `5,000×`, and the win strip amounts `$0.80`, `$0.20`
  and `$10.00`. Every one sits inside its pod with clear side padding on both sides. The
  `5,000× base bet` wrap in the buy strip is a wrap of a compound label, not of a money
  string, and is `B-17`.
- **No replay surface and no ghost pod appears in this range**, so KNOWN row **TR-114** is
  not exercised. Checked all seventeen frames for a replay banner, a replay URL state or a
  pod rendered without a value; none present.
- **No localised surface appears in this range.** The session is `lang: en` per
  MANIFEST.json, so KNOWN row **TR-104** can be neither confirmed nor refuted here.
- **No stock Vite scaffold styling reaches any of these seventeen frames**, so KNOWN row
  **Q-27** is not exercised. Checked for a stock indigo link colour, a `#242424` ground and
  scaffold body centring: every surface in the range is themed.
- **No placeholder or error string survives on any frame in this range.** Checked all
  seventeen at 1600px for `lorem`, `TODO`, `TBD`, `undefined`, `NaN`, `null`,
  `[object Object]`, `%s`, `{0}` and empty brace pairs. None present.
- **Neither MID-01 nor MID-02 is observable in this range.** MID-01's and MID-02's surface
  is the win banner, and the `mobile-m` big-win triple is frames `272` to `274`, which
  belong to another squad and were not opened. No win banner appears in frames 295 to 311.
- **KNOWN row Q-07, the infinity glyph, does not appear in this range.** The autoplay panel
  is frame `290`, outside it.
- **The bottom control row is symmetric and is NOT a finding**, notwithstanding a 3.75
  native px reading that said otherwise. The full working, including why the measurement was
  wrong, is under the withdrawn `STC-MOBILEM-3-08` above. Named here as well so a reader
  scanning only the absences does not have to find it.
- **No `dir`, RTL or logical-property question arises in this range**, this being an English
  session.
- **Two things this shard could NOT check, named so the coverage claim is honest.** First,
  the in-flight free spins surface, per the first absence above: it is not in the capture.
  Second, the SPIN bleed-through mechanism in `3-03`: the modal itself is opaque
  (`frontend/src/lib/components/BuyBonus.svelte:175-176`) so the label must be reading
  through the backdrop, and the backdrop rule was not read within the step 3 budget. The
  observation is frame-solid; the cause is not, and it is written that way.

## KNOWN matches

- **KNOWN(Q-26)**, fresh evidence at 1600px:
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/296_mobile-m_dialog_nitro_overdrive.png`
  and `295_mobile-m_transition_dialog_nitro_overdrive_opening.png` render
  `Buy a rich entry with the Overdrive meter pre-revved to 5x.` At 1600px the `x` in `5x` is
  clearly a full-height baseline letter, while the `1×`, `3×`, `10×` and `+1×` in the two
  paragraphs directly beneath it are clearly the shorter, vertically centred multiplication
  sign. **The two glyphs are side by side in one paragraph block and at full resolution the
  difference is obvious**, which is the row's own test for whether the survivors are
  player-visible. They are, on a phone-width buy dialog. No claim is made about
  `Start Overdrive Free Spins now at 400× your bet?` in the same frame: `STC-MOBILEM-B`
  refuted that reading from source (`translations.ts:1537` carries U+00D7) and this shard
  accepts that refutation rather than re-litigating it from pixels.
- **KNOWN(Q-16 park)**, fresh evidence:
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/309_mobile-m_maxwin_celebration.png`
  and `308_mobile-m_transition_maxwin_overlay_fade.png` render
  `PRESS COLLECT OR HIT ENTER TO CONTINUE` on the max win overlay, one of the two strings
  the row names as visible-on-stream. This session is `en` so it reads correctly; recorded
  as visibility evidence per the row's instruction that visibility changes the park's
  urgency. Note that `STC-MOBILEM-B`'s third correction to the row applies:
  `prose.ts:83` is the English value of a translated key, not a hardcoded literal, so this
  string's real defect is `B-06`'s and not Q-16's.
- **No match against TR-104, TR-114, TR-115, TR-086, TR-112, Q-28, Q-34, Q-07, MID-01 or
  MID-02** in this range. Each is accounted for in the absences above.

## A note on frame `188`, which the superseded shard flagged LOUD

`STC-MOBILEM-B` closed with a LOUD section reporting
`M reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png`, a MODIFIED
committed evidence PNG, and asked the marshal to restore it from HEAD.

**It is no longer modified.** `git status --porcelain` at the close of this run, transcribed
verbatim below, shows nothing MODIFIED and nothing DELETED anywhere in the tree. Frame `188`
does not appear. Stating only what that supports: the file now matches HEAD. Whether it was
restored, and whether any Wave 2 squad judged it while it was dirty, is not visible from
here and is still the marshal's question. This shard neither opened `188` nor touched it.

tree_after:

```
?? reports/qa/stream_test/shards/STC-MOBILEL-1.md
?? reports/qa/stream_test/shards/STC-MOBILEL-2.md
?? reports/qa/stream_test/shards/STC-MOBILEL-3.md
?? reports/qa/stream_test/shards/STC-MOBILEM-1.md
?? reports/qa/stream_test/shards/STC-MOBILEM-2.md
?? reports/qa/stream_test/shards/STC-MOBILEM-3.md
?? reports/qa/stream_test/shards/STC-MOBILES-2.md
?? reports/qa/stream_test/shards/STC-POPOUTS-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-2.md
?? reports/qa/stream_test/shards/STC-POPOUTS-3.md
?? reports/qa/stream_test/shards/STM-MOBILEL.md
?? reports/qa/stream_test/shards/STM-MOBILEM.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STT-MOBILEL-1.md
?? reports/qa/stream_test/shards/STT-MOBILEL-2.md
?? reports/qa/stream_test/shards/STT-MOBILEL-3.md
?? reports/qa/stream_test/shards/STT-MOBILEM-1.md
?? reports/qa/stream_test/shards/STT-MOBILEM-2.md
?? reports/qa/stream_test/shards/STT-MOBILEM-3.md
?? reports/qa/stream_test/shards/STT-MOBILES-1.md
?? reports/qa/stream_test/shards/STT-MOBILES-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-1.md
?? reports/qa/stream_test/shards/STT-POPOUTS-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-3.md
```

**Nothing is MODIFIED and nothing is DELETED. The tree is clean.** All twenty-four entries
are untracked shards. `reports/qa/stream_test/shards/STC-MOBILEM-3.md` is this squad's, and
it is the only file this squad wrote anywhere. The other twenty-three belong to sibling
squads in this re-run and were not touched. No project script was run; the only commands
issued against the repository were `ls`, `grep`, `sed -n`, `git status --porcelain`, a
`python3` read of `MANIFEST.json`, and `sips` reads that wrote their output to the session
scratchpad outside the repository. Nothing was written to `reports/screens/`.
