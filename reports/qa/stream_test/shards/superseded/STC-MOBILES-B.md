# STC-MOBILES-B, composition (mobile-s, 320x568, frames 338 to 363)

scope: every `mobile-s` frame numbered 338 to 363 inclusive, 26 frames, covering paytable
sections 07 to 09, the paytable close, the autoplay menu, the FEATURES menu, both buy
confirm dialogs, the feature entry card, the six feature-run interval frames, the feature
exit, the max win celebration and the post-collect return.
frames_read: 26

Measurements below are device pixels read out of the named PNG by decoding it directly, so
every figure is checkable against the frame it cites. Source line numbers were read at
HEAD `d9bdf22`.

## STC-MOBILES-B-01 STREAM The buy confirm dialog shows a price and no way to accept it: the sticky stats row pins to the bottom of the scroll box and pushes CONFIRM and CANCEL below the fold, while slicing the body copy above it

- Frames: `reports/screens/stream-test-2026-07-28/346_mobile-s_dialog_buy_overdrive.png`,
  `reports/screens/stream-test-2026-07-28/348_mobile-s_dialog_nitro_overdrive.png`,
  `reports/screens/stream-test-2026-07-28/345_mobile-s_transition_dialog_buy_overdrive_opening.png`,
  `reports/screens/stream-test-2026-07-28/347_mobile-s_transition_dialog_nitro_overdrive_opening.png`
- Claim: on `346` the `WHAT YOU GET` paragraph reads
  `The Overdrive meter starts at 1x and rises +1x after every winning` and the next line is
  cut horizontally through its letterforms by the top edge of the `PRICE` / `RTP` /
  `MAX WIN` strip. `348` is cut the same way after `The Overdrive meter starts at 1x`.
  There is no fade and no mask at the cut, so it reads as clipping, not as scrolling.
  Below the strip there is no button at all. Decoding `346` row by row between the strip
  and the dialog's lower border (which is the 274-pixel-wide bright rule at row `539`),
  every row from `510` to `538` carries at most **15** pixels above luma 60 across
  x `10` to `310`: no `CONFIRM`, no `CANCEL`, nothing. A purchase dialog stating
  `$100.00` (`346`) and `$400.00` (`348`) is on screen with no visible way to accept or
  dismiss it.
- Root cause, read from source rather than guessed: `.buy-stats-row` is
  `position: sticky; bottom: 0; z-index: 2` at
  `frontend/src/lib/components/BuyBonus.svelte:234-237`, added deliberately by R12 so the
  per-mode cost, RTP and max win disclosure could not fall below the fold. The
  `.buy-actions` row holding `buyCancel` and `buyConfirm` is at
  `frontend/src/lib/components/BuyBonus.svelte:141-146`, which is AFTER the stats row in
  document order, so the sticky row now pins itself to the bottom of the
  `max-height: 90dvh; overflow-y: auto` box (`:174`) and the action row is what falls below
  the fold instead. The fix for one disclosure problem created a worse one at the smallest
  viewport, and the comment at `:213-222` records the reasoning without noticing the
  consequence.
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:234-237` and
  `frontend/src/lib/components/BuyBonus.svelte:141-146` (not locked)
- Proposed fix: pin the stats row and the action row together as one sticky footer, that
  is, wrap `.buy-stats-row` and `.buy-actions` in a single `position: sticky; bottom: 0`
  container, so the compliance disclosure and the controls are both always on screen. Small
  and structural rather than a value tweak.

## STC-MOBILES-B-02 HIGH The max win overlay instructs a 320x568 touch player to `HIT ENTER`

- Frames: `reports/screens/stream-test-2026-07-28/361_mobile-s_maxwin_celebration.png`,
  `reports/screens/stream-test-2026-07-28/360_mobile-s_transition_maxwin_overlay_fade.png`
- Claim: the line under the `COLLECT` button reads `PRESS COLLECT OR HIT ENTER TO CONTINUE`
  on a 320x568 portrait viewport, which is a phone. There is no Enter key. It is the only
  instruction on the game's single most-watched surface and half of it does not apply to
  the device it is being rendered for. The string is
  `maxWinHint:  'Press COLLECT or hit Enter to continue'` at
  `frontend/src/lib/i18n/prose.ts:83`, rendered unconditionally at
  `frontend/src/lib/components/MaxWinCelebration.svelte:166`. This is a different defect
  from the recorded one: `KNOWN_OPEN.md` row `Q-16 park` records this string as hardcoded
  English, which is about locale; its inapplicability at a touch viewport is recorded
  nowhere.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:166` and
  `frontend/src/lib/i18n/prose.ts:83` (not locked)
- Proposed fix: add a pointer-coarse variant of the key and select it at `:166`, so a touch
  viewport reads `Press COLLECT to continue` and only a keyboard device is told about
  Enter. Note the sixteen-locale cost, which is why it may want to ride with the Q-16 park
  rather than be fixed alone.

## STC-MOBILES-B-03 HIGH The bet stepper's `-` and `+` buttons in the FEATURES menu sit 14 px apart on the horizontal axis

- Frames: `reports/screens/stream-test-2026-07-28/344_mobile-s_features_menu.png`,
  `reports/screens/stream-test-2026-07-28/343_mobile-s_transition_features_menu_opening.png`
- Claim: decoding `344`, the `-` button's border box spans x `209` to `252` on rows `127`
  to `156`, and the `+` button's border box spans x `223` to `266` on rows `168` to `197`.
  Both boxes are exactly **44 px wide and 30 px tall**, they are the obvious matched pair,
  they are stacked one above the other, and the `+` is offset **14 px to the right** of the
  `-`. Neither their left edges, nor their right edges, nor their centres line up.
- Root cause: the block is not two rows. It is ONE flex row with `flex-wrap: wrap` at
  `frontend/src/lib/components/FeatureMenu.svelte:847`, holding, in order, the spin cost,
  the `BET` label, the `-` button, the value and the `+` button
  (`FeatureMenu.svelte:334-343`). At 320 px it wraps, and `.fm-betval` carries
  `margin-left: auto; min-width: 84px; text-align: right`
  (`frontend/src/lib/components/FeatureMenu.svelte:861-864`), which on the wrapped second
  line pushes the value and the `+` after it to a different offset from wherever the `-`
  happened to land on the first line. The alignment is therefore accidental at every
  width where this row wraps, not just this one.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:847` and
  `frontend/src/lib/components/FeatureMenu.svelte:861-864` (not locked)
- Proposed fix: below a breakpoint, lay `.fm-betbar > .fs-face` out as an explicit two-row
  grid with the stepper in a fixed final column, so the pair always shares one vertical
  axis regardless of how the labels beside them measure.

## STC-MOBILES-B-04 HIGH The autoplay menu is the only overlay in the game that does not dim what is behind it, and the four overlays in this run use four different backdrop strengths

- Frames: `reports/screens/stream-test-2026-07-28/342_mobile-s_autoplay_menu.png`
- Claim: measured mean luma of the `FUTURE SPINNER` wordmark block (x `91` to `229`, rows
  `0` to `30`) and of the SPIN button block (x `140` to `180`, rows `495` to `545`), across
  the four overlay frames and one overlay-free control:

  | Frame | wordmark mean | wordmark peak | SPIN button mean |
  |---|---|---|---|
  | `359_mobile-s_post_feature_base.png` (no overlay, control) | `114.2` | `250.7` | `111.2` |
  | `342_mobile-s_autoplay_menu.png` | `114.2` | `250.7` | `111.2` |
  | `346_mobile-s_dialog_buy_overdrive.png` | `68.9` | `170.0` | `30.0` |
  | `344_mobile-s_features_menu.png` | `20.1` | `31.7` | `17.2` |
  | `361_mobile-s_maxwin_celebration.png` | `16.6` | `20.7` | `17.3` |

  The autoplay row is **identical to the no-overlay control to one decimal place on both
  measures**: the autoplay menu applies exactly zero dimming. The panel is anchored hard
  right, so a bright, half-cropped strip of live game runs down the left of the frame and
  the composition has two competing focal points. The remaining three overlays disagree
  with each other as well, at `68.9`, `20.1` and `16.6`, so the game has four different
  answers to the same question.
- Root cause: the FEATURES menu wraps itself in the shared scrim class,
  `class="fm fs-scrim"` at `frontend/src/lib/components/FeatureMenu.svelte:299` with
  `backdrop-filter: blur(3px)` at `frontend/src/lib/components/FeatureMenu.svelte:697`. The
  autoplay menu has no scrim element at all: it is a bare `.auto-menu` inside the HUD at
  `frontend/src/lib/components/HudOverlay.svelte:502` (portrait) and `:738` (compact).
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:502` and `:738`, against
  the pattern at `frontend/src/lib/components/FeatureMenu.svelte:299,697` (not locked)
- Proposed fix: decide once whether the autoplay menu is a modal or a popover. If modal,
  give it `.fs-scrim` like the FEATURES menu. If popover, that is defensible, but then the
  three surviving backdrop strengths still need reconciling to one value.

## STC-MOBILES-B-05 HIGH `TOTAL WIN $2.80` is displayed directly above `WIN $5,000.00`

- Frames: `reports/screens/stream-test-2026-07-28/363_mobile-s_post_collect_base.png`,
  `reports/screens/stream-test-2026-07-28/362_mobile-s_transition_maxwin_collect_fade.png`
- Claim: two win readouts sit in adjacent HUD rows about 40 px apart. The upper pod is
  labelled `TOTAL WIN` and reads `$2.80`; the lower pod is labelled `WIN` and reads
  `$5,000.00`. The word `TOTAL` sits above the smaller of the two figures, so the label
  hierarchy contradicts the values. On a 320 px viewport both are inside one glance, and a
  viewer reads the pair as a fault in the money display whatever the two concepts actually
  are. The `TOTAL WIN` pod is `frontend/src/lib/components/BonusInstrumentColumn.svelte:71-74`
  (`{$tr('totalWin')}` beside `totalWinLabel`); the `WIN` pod is the portrait stat row in
  `HudOverlay.svelte`.
- Where fixable: `frontend/src/lib/components/BonusInstrumentColumn.svelte:72` for a
  relabel, or the portrait stat row in `frontend/src/lib/components/HudOverlay.svelte` for
  suppression (neither locked)
- Proposed fix: PARK(the labels are the problem, not the arithmetic. Options: rename the
  feature pod to `FEATURE WIN`, or suppress the round `WIN` pod while a feature total is on
  screen. It changes what a player reads at a money surface, so it is an owner call per
  convention (l.8).)

## STC-MOBILES-B-06 MEDIUM The two feature pods' values are 6 px out of baseline because only the left label wraps

- Frames: `reports/screens/stream-test-2026-07-28/350_mobile-s_feature_entry_card.png`,
  `reports/screens/stream-test-2026-07-28/349_mobile-s_transition_feature_entry_fade.png`,
  `reports/screens/stream-test-2026-07-28/352_mobile-s_feature_run_1.png` through
  `reports/screens/stream-test-2026-07-28/357_mobile-s_feature_run_6.png`,
  `reports/screens/stream-test-2026-07-28/362_mobile-s_transition_maxwin_collect_fade.png`,
  `reports/screens/stream-test-2026-07-28/363_mobile-s_post_collect_base.png`
- Claim: decoding `350`, the cyan value `16` occupies rows `309` to `319` and the gold value
  `$10.80` beside it occupies rows `301` to `313`. The two values in a matched pod pair do
  not share a baseline; `16` sits about **6 px lower**. The cause is visible in the same
  frame: at 320 px the left label `OVERDRIVE FREE SPINS` wraps to two lines and the right
  label `TOTAL WIN` does not.
- Root cause: `.pm-cell` is a column flex with `justify-content: center`
  (`frontend/src/lib/components/BonusInstrumentColumn.svelte:236-238`), so each cell centres
  its own label-plus-value stack independently inside a shared row height, and `.pm-label`
  is explicitly allowed to wrap at
  `frontend/src/lib/components/BonusInstrumentColumn.svelte:254-256`. The wrap is
  deliberate and correct; nothing then re-aligns the values.
- Where fixable: `frontend/src/lib/components/BonusInstrumentColumn.svelte:236-238` and
  `:247-259` (not locked)
- Proposed fix: give `.pm-label` a `min-height` of two lines at this breakpoint, or switch
  `.pm-cell` to `justify-content: space-between` so the values bottom-align. One property.

## STC-MOBILES-B-07 MEDIUM The BET pod carries 97 px of dead space, nearly a third of the viewport width, between its label and its controls

- Frames: `reports/screens/stream-test-2026-07-28/359_mobile-s_post_feature_base.png`,
  `reports/screens/stream-test-2026-07-28/341_mobile-s_transition_paytable_closing.png`,
  `reports/screens/stream-test-2026-07-28/358_mobile-s_transition_feature_exit.png`,
  `reports/screens/stream-test-2026-07-28/363_mobile-s_post_collect_base.png`
- Claim: decoding `359` across the BET pod's band (its border rules are rows `414` and
  `475`), the content columns are `28-35`, `38-44`, `47-54` (the three glyphs of `BET`),
  then nothing at all until `151-160` (the down chevron), `189-237` (`$1.00`) and `266-275`
  (the up chevron). That is a **97 px** empty span inside a single bordered pod on a 320 px
  screen. The two pods directly above it, `BALANCE` and `WIN`, are centred blocks with even
  side space, so the BET pod reads as a different and unfinished layout in the same stack.
  It is present on every base frame in this range.
- Root cause: `.p-bet-stat` is `width: 100%` with `justify-content: space-between` at
  `frontend/src/lib/components/HudOverlay.svelte:1946-1952`, which at 320 px throws the
  whole surplus into one gap. The comment at `:1953-1955` records the gap being opened up
  deliberately from 10 px, for a full-width feel, without a narrow-viewport check.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1946-1957` (not locked)
- Proposed fix: below a breakpoint, centre the label and the stepper group as one block
  (`justify-content: center` with a fixed gap), matching the centred pods above it.

## STC-MOBILES-B-08 MEDIUM Paytable scroll content is sliced through mid-glyph with no fade or mask, at both ends of the scroll box

- Frames: `reports/screens/stream-test-2026-07-28/340_mobile-s_paytable_09_disclaimer.png`,
  `reports/screens/stream-test-2026-07-28/338_mobile-s_paytable_07_interface_guide.png`,
  `reports/screens/stream-test-2026-07-28/339_mobile-s_paytable_08_responsible_play.png`
- Claim: on `340` the first visible line of body copy, `loss limit you choose is reached, and can`,
  is cut horizontally through the middle of its letterforms at the sticky `PAYTABLE`
  header's lower rule (the full-width rule decodes at row `102`; the partial line occupies
  only rows `112` to `121`). At the other end, on `338` the card headed `Autoplay` and on
  `339` the word `Future` are both cut the same way at the scroll box's lower boundary: the
  panel's own bottom border decodes at row `544` on all three frames, with rows `547`
  onward empty, so this is the panel clipping its content, not the viewport clipping the
  panel. A hard edge through the waist of a line of text reads as breakage rather than as
  scrolling.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:593-594`
  (`.fs-pt-body { overflow-y: auto; ... }`, which carries no mask) (not locked)
- Proposed fix: add a short top and bottom `mask-image: linear-gradient(...)` to
  `.fs-pt-body` so lines fade out at the mask instead of being bisected.

## STC-MOBILES-B-09 MEDIUM Body copy is centred in two paytable sections and left aligned in the one before them

- Frames: `reports/screens/stream-test-2026-07-28/338_mobile-s_paytable_07_interface_guide.png`,
  `reports/screens/stream-test-2026-07-28/339_mobile-s_paytable_08_responsible_play.png`,
  `reports/screens/stream-test-2026-07-28/340_mobile-s_paytable_09_disclaimer.png`
- Claim: `INTERFACE GUIDE` (`338`) sets every card's body text left aligned against a hard
  left margin. The very next sections, `RESPONSIBLE PLAY` and `DISCLAIMER` (`339`, `340`),
  set multi-line body paragraphs centred, so both edges of a twelve-line legal paragraph go
  ragged in a column about 250 px wide. Scrolling one continuous panel and having the text
  alignment change under you is a composition break, and centred long-form legal copy is
  not something a top studio ships.
- Root cause: the paytable inherits a centred alignment, and only the guide opts out.
  `.fs-guide-text` sets `text-align: left` explicitly at
  `frontend/src/lib/components/PaytableModal.svelte:778`, while `.fs-disc`, which renders
  both prose sections (`:397` and `:409`), sets no alignment at all and simply inherits the
  centre: `frontend/src/lib/components/PaytableModal.svelte:789`.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:789` (not locked)
- Proposed fix: add `text-align: left` to `.fs-disc`. One property, and it makes the guide
  and the prose agree instead of the guide being the exception.

## STC-MOBILES-B-10 MEDIUM The FEATURES menu's third mode card is clipped to a bare sliver by the sticky footer

- Frames: `reports/screens/stream-test-2026-07-28/344_mobile-s_features_menu.png`,
  `reports/screens/stream-test-2026-07-28/343_mobile-s_transition_features_menu_opening.png`
- Claim: below the `Normal` and `Cruise` cards the next card's top rounded edge shows as a
  thin empty strip and everything inside it is hidden behind the
  `All modes · RTP 96.35%` / `BET MODES` footer. There is no scrollbar and no fade, so it
  reads as a card that failed to render rather than as more content below the fold. Three of
  the game's five modes are invisible at this viewport with no affordance saying so.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:352`, the `.fm-cards`
  scroll list (its CSS comment records that the internal scroll is load-bearing, which is
  the mechanism, not the defect) (not locked)
- Proposed fix: mask the list at its lower edge and clip at a whole-card boundary, or show
  a scroll cue, so the sliver never appears.

## STC-MOBILES-B-11 MEDIUM The max win celebration's halo is an ellipse whose edge crosses the frame at portrait aspect

- Frames: `reports/screens/stream-test-2026-07-28/361_mobile-s_maxwin_celebration.png`,
  `reports/screens/stream-test-2026-07-28/360_mobile-s_transition_maxwin_overlay_fade.png`
- Claim: a soft curved boundary sweeps across the frame from the lower left toward the
  upper right, leaving the corners outside it flat, so the lit area's optical centre is up
  and to the right of the text block it is meant to be lighting and the arc itself reads as
  a stray shape on the most-watched surface in the game.
- Root cause: `.c1-halo` is `position: absolute; inset: -10%; border-radius: 50%` at
  `frontend/src/lib/components/MaxWinCelebration.svelte:206-210`, filled with a
  `conic-gradient` (`:211-221`). On a 320x568 box, `inset: -10%` gives a 384 by 682 box and
  `border-radius: 50%` makes that an ELLIPSE, not a circle, so its boundary passes inside
  all four corners of the viewport and is visible. The conic gradient's bright sectors are
  why it reads as a one-sided sweep. The backdrop gradient at `:194-198` is
  `ellipse at center` with default farthest-corner sizing and does cover the box, so it is
  not the cause.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:206-210` (not
  locked)
- Proposed fix: size the halo as a square from the larger dimension, for example
  `width: 140vmax; height: 140vmax; inset: auto; left: 50%; top: 50%; transform: translate(-50%, -50%)`,
  so it is always a circle that overreaches the frame and its edge is never on screen.

## STC-MOBILES-B-12 MEDIUM The six frames the manifest calls the feature in flight all show the undismissed entry gate, so mobile-s has no captured coverage of the feature reels

- Frames: `reports/screens/stream-test-2026-07-28/352_mobile-s_feature_run_1.png` through
  `reports/screens/stream-test-2026-07-28/357_mobile-s_feature_run_6.png`
- Claim: `MANIFEST.json` describes these six as `Overdrive free spins in flight, interval
  frame 1 of 6` and so on. All six instead show the entry card with `+16 FREE SPINS` and
  `TAP TO CONTINUE` still on screen, matching `350_mobile-s_feature_entry_card.png`. The app
  is live behind the gate: the win strip under the reels alternates between
  `L2 x5 8 ways $0.60` and `SCATTER x5 8 ways $12.00` across the six, and their file hashes
  all differ, so these are six real captures of a stuck state rather than six copies. Two
  readings are open and the frames cannot separate them: either the capture never dismissed
  the gate at this viewport, or the `TAP TO CONTINUE` gate is not dismissible at 320x568.
  Either way the audit has zero evidence for the mobile-s feature surface, which is where a
  stream audience spends its attention.
- Where fixable: UNKNOWN (the capture harness, which this squad is barred from running, or
  the entry gate's hit area)
- Proposed fix: re-capture the mobile-s feature leg after establishing which reading holds.
  If the gate is genuinely unhittable at this viewport that is a separate and much worse
  finding than a capture gap.

## STC-MOBILES-B-13 MEDIUM Six transition frames in this range are visually indistinguishable from their settled neighbours

- Frames: `reports/screens/stream-test-2026-07-28/341_mobile-s_transition_paytable_closing.png`,
  `reports/screens/stream-test-2026-07-28/343_mobile-s_transition_features_menu_opening.png`,
  `reports/screens/stream-test-2026-07-28/345_mobile-s_transition_dialog_buy_overdrive_opening.png`,
  `reports/screens/stream-test-2026-07-28/347_mobile-s_transition_dialog_nitro_overdrive_opening.png`,
  `reports/screens/stream-test-2026-07-28/349_mobile-s_transition_feature_entry_fade.png`,
  `reports/screens/stream-test-2026-07-28/351_mobile-s_transition_feature_starting.png`
- Claim: `343` is indistinguishable from `344`, `345` from `346`, `347` from `348`, `349`
  from `350` and `351` from `350`. Their file hashes differ, so they are distinct captures
  of what look like identical states, not duplicates. `341`, labelled `Paytable mid-close`,
  shows a fully settled base game with no paytable, no scrim and no trace of a closing
  panel. Judged as a sequence, the mobile-s overlays appear to snap rather than animate.
  Against that, `360` and `362` in the same run ARE genuinely mid-transition, so the
  capture is capable of catching one. The two readings, no enter animation at this viewport
  versus a sample point outside the animation window, cannot be separated from the frames
  alone; note that `BuyBonus.svelte:182` gives the buy modal a `0.28s` pop animation, so at
  least that one does animate and the sample missed it.
- Where fixable: UNKNOWN (capture timing, not a rendering surface, unless the FEATURES and
  entry-card overlays are confirmed to have no enter animation)
- Proposed fix: sample transitions at a fixed offset inside each overlay's declared
  duration, and record which overlays genuinely have no enter animation at this viewport.

## STC-MOBILES-B-14 LOW The feature exit transition shows a fully empty 5x4 grid inside a lit reel frame

- Frames: `reports/screens/stream-test-2026-07-28/362_mobile-s_transition_maxwin_collect_fade.png`
- Claim: with the max win overlay fading out, the reel window contains no symbols at all,
  only faint ghosts and a yellow bloom, while the frame's border is at full intensity. The
  empty window is about 40 per cent of the viewport height. Held for even a few frames on
  stream, a lit frame around nothing reads as a load failure.
- Where fixable: UNKNOWN
- Proposed fix: hold the previous board underneath the overlay until the next board is
  ready, so the reel window is never empty behind a lit frame.

## Explicit absences, signed

- **Viewport edge collisions of interactive controls.** Checked every base and feature frame
  in the range (`341`, `349` to `359`, `362`, `363`) for a control touching or crossing the
  320 px left or right boundary or the 568 px bottom. None does. Decoding `359`, the BET pod
  rules run to x `310` and the wordmark spans x `91` to `229`, centred on `160`. The only
  content that meets a boundary is text inside the paytable's own scroll box, reported as
  STC-MOBILES-B-08, and the paytable panel is NOT off-viewport: its bottom border decodes at
  row `544` on `338`, `339` and `340` alike, with rows `547` to `567` empty. An earlier draft
  of this shard said `338` and `339` were cut by the viewport edge; the measurement refuted
  that and the claim was corrected rather than kept.
- **Wordmark clearance at the top edge.** Checked `359`. The topmost lit row of the
  `FUTURE SPINNER` wordmark is row `5`, so there is a 5 px margin to the viewport top. Tight,
  and worth an art call, but it is clearance and not a collision, so it is not written as a
  finding.
- **Horizontal centring of the celebration surfaces.** Checked `350`, `360`, `361` and the
  entry card frames. `MAX WIN REACHED!`, the `5,000` figure, the star row and the `COLLECT`
  button all share one centre axis, and the feature entry card is centred in the reel
  window. The max win problem is the halo shape (STC-MOBILES-B-11), not the type.
- **Asymmetric side padding on the paytable panel.** Checked `338`, `339`, `340`. Matching
  left and right margins against the viewport on all three; the gold rail down the left is a
  deliberate one-sided accent, consistent across all three sections, not a padding error.
- **Bottom control row spacing.** Checked `341`, `358`, `359`, `363`. The five controls are
  distributed with `SPIN` on the viewport centre axis and the outer two icons keeping equal
  margins to the left and right edges. No finding.
- **HUD crowding severe enough to squeeze the reels below usability.** The four-row stack
  below the reel window is tight at this viewport, but the reel window still holds the full
  5x4 grid with legible symbols in every base and feature frame checked. Watched, not
  written up.
- **Clipping inside the anchored autoplay popover.** Checked `342`. The panel is hard right
  by design as a popover anchored to the autoplay control, and nothing inside it is clipped.
  Its problem is the missing scrim (STC-MOBILES-B-04), not its geometry.
- **A suspected copy defect that measurement refuted, recorded so nobody re-raises it.** On
  `343` and `344` the Cruise card appeared to read `A smoother ride. more frequent smaller
  wins`, a sentence opening in lower case. It is not: the source is
  `modeCruiseBlurb: 'A smoother ride: more frequent smaller wins, same 96.35% RTP.'` at
  `frontend/src/lib/i18n/prose.ts:88`, a COLON that renders small at 320 px. Not a finding.
- **The dialog body showing the live reels through it.** On `348` a row of bright symbols
  appears low in the frame and read at first as the board showing through the dialog. It
  could equally be `.buy-preview`, the dialog's own symbol grid at
  `frontend/src/lib/components/BuyBonus.svelte:111-119`, or the scrimmed board below the
  modal's lower border. The frame cannot separate the two, so no claim is made; only the
  measured absence of any button between the stats strip and the border is claimed, under
  STC-MOBILES-B-01.

## KNOWN matches

- KNOWN(Q-07): `reports/screens/stream-test-2026-07-28/342_mobile-s_autoplay_menu.png`, the
  infinite autoplay option renders `∞` visibly smaller and in a different face from the
  `10` / `25` / `50` / `100` above it. Allowlisted as a deliberate system font fallback, so
  this is evidence only and no finding is opened.
- KNOWN(Q-16 park): `reports/screens/stream-test-2026-07-28/361_mobile-s_maxwin_celebration.png`
  renders the parked string `PRESS COLLECT OR HIT ENTER TO CONTINUE`;
  `reports/screens/stream-test-2026-07-28/338_mobile-s_paytable_07_interface_guide.png`
  renders `INTERFACE GUIDE`, `Spin`, `Increase Bet`, `Decrease Bet`, `Features` and
  `Autoplay`; `reports/screens/stream-test-2026-07-28/339_mobile-s_paytable_08_responsible_play.png`
  renders `RESPONSIBLE PLAY` and `DISCLAIMER`;
  `reports/screens/stream-test-2026-07-28/342_mobile-s_autoplay_menu.png` renders
  `Stop on win`, `Single win limit`, `Stop on feature`, `Loss limit` and `Spins`
  (`HudOverlay.svelte:513` writes that separator as a bare literal `Spins`). All are parked
  English on an English session, so they are visible-parked-string evidence rather than
  findings. Recorded because the park's urgency was said to depend on which parked strings
  actually reach a frame.
- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/344_mobile-s_features_menu.png` and
  `reports/screens/stream-test-2026-07-28/346_mobile-s_dialog_buy_overdrive.png` render the
  letter `x` as a multiplier in `1x, 3x or 10x total bet` and `rises +1x`, inside the
  `WHAT YOU GET` prose. Same class as the row; note that `FeatureMenu.svelte:372,427,480`
  correctly write `{m.cost}×` with U+00D7, so the drift here is in the prose layer.

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

**LOUD: a committed evidence PNG is MODIFIED in the working tree.**
`reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png` shows as ` M`, not
untracked. It is not mine: it is a `popout-s` frame, outside this squad's 338 to 363
`mobile-s` range, and this squad only read files and wrote its own shard. This is the
convention (h.1) failure mode exactly, a committed evidence file overwritten by something
that ran during the wave. It should be restored from HEAD and whatever wrote it should be
identified before the marshal consolidates, because evidence a re-run can overwrite is not
evidence. Every other line is an untracked shard, mine plus sixteen belonging to other
squads.
