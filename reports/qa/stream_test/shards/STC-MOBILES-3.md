# STC-MOBILES-3, COMPOSITION (mobile-s, frames 347 to 363, 1600px upscaled)
supersedes: STC-MOBILES-B.md (the frames 347 to 363 portion only; STC-MOBILES-A.md covers 312 to 337 and is entirely outside this range)
scope: `mobile-s` frames 347 to 363 inclusive, 17 frames, native viewport 320x568, read at 901x1600 (scale factor 2.8169)
frames_read: 17

All pixel figures are in the UPSCALED 901x1600 frame unless a native equivalent
is given beside them; native equals upscaled divided by 2.8169. Every geometric
claim below was decoded from the PNG rather than eyeballed, and three claims my
own first pass made by eye did not survive that decode. They are recorded as
refutations in the absences section rather than quietly dropped.

## STC-MOBILES-3-01 STREAM The NITRO OVERDRIVE buy confirm dialog states a price and offers no CONFIRM and no CANCEL anywhere in the viewport

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/348_mobile-s_dialog_nitro_overdrive.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/347_mobile-s_transition_dialog_nitro_overdrive_opening.png`
- Claim: the dialog panel occupies x 27..873, y 82..1516, that is 300x509 native inside a 320x568 viewport, so it fits with symmetric margins and the failure is not a modal overflowing its viewport. Inside it there is no action row. The stats strip's magenta top rule sits at rows 1158 to 1160 and the strip's last content, the word `bet`, ends at row 1402. Rows 1406 to 1446 carry nothing above luminance 90. From row 1450 to row 1505 the only bright content inside the dialog frame is the interface behind it showing through: five separate runs at row 1450 at x `95..200`, `257..349`, `436..492`, `562..602`, which are the HUD dock icons. The dialog's own bottom rule is at rows 1518 to 1519. A player is shown `PRICE` `$400.00` with no way to accept or decline it.
- Resolution note: VISIBLE AT BOTH
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:174` (`.buy-modal { width: min(94vw, 460px); max-height: 90dvh; overflow-y: auto; }`, so the whole modal is the scroll box), `:230-232` (`.buy-stats-row { position: sticky; bottom: 0; z-index: 2; }` with an opaque `background: linear-gradient(180deg, #1a2236, #080c16)` at `:228`), and `:141-144` (`.buy-actions` with `.buy-cancel` and `.buy-confirm`). The actions row comes AFTER the sticky strip in DOM order, so `bottom: 0` pins the strip to the bottom of the scroll viewport and parks both buttons permanently below it. Not locked.
- Proposed fix: make `.buy-modal` a flex column with a non-scrolling footer holding `.buy-actions`, and give only the body between header and footer `overflow-y: auto`. The stats strip can then stay sticky to the bottom of the BODY, which satisfies the R12 disclosure requirement recorded in the comment at `:213-223` without consuming the action row.

## STC-MOBILES-3-02 STREAM The buy dialog's body copy is sliced through the middle of a line by the stats strip, with no scroll affordance and nothing below it reachable

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/348_mobile-s_dialog_nitro_overdrive.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/347_mobile-s_transition_dialog_nitro_overdrive_opening.png`
- Claim: the last fully rendered body line is `The Overdrive meter starts at 1×`, occupying rows 1102 to 1128. The next line begins its ascenders at about row 1150 and the strip's opaque top rule at row 1158 cuts it: rows 1130 to 1150 hold zero pixels above luminance 90 and row 1154 holds 25, so what reaches the player is the anti-aliased tops of the glyphs, about 8 rows (2.8 native px) of a line whose full height is about 34 rows (12 native px). Everything after that line is unreachable. There is no scrollbar, no fade and no mask, so the panel gives no cue that content continues: `grep -rn "mask-image" frontend/src/` returns nothing, which the mobile-l squad already recorded, so this is a class rather than an instance.
- Resolution note: VISIBLE AT BOTH, but that the cut lands mid glyph rather than between lines is NEW AT 1600PX
- Where fixable: same rules as finding 01, `frontend/src/lib/components/BuyBonus.svelte:174` and `:230-232`. Not locked.
- Proposed fix: the footer split in finding 01 removes the slice as a side effect, because the strip stops overlapping the scrolling body. Add a `mask-image` top and bottom fade on the scrolling body so a cut line always reads as more content rather than as a rendering fault.

## STC-MOBILES-3-03 HIGH The buy dialog's MAX WIN stat breaks its unit across two extra lines, so one column is four times the height of its siblings

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/348_mobile-s_dialog_nitro_overdrive.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/347_mobile-s_transition_dialog_nitro_overdrive_opening.png`
- Claim: the strip presents `PRICE` / `RTP` / `MAX WIN`. The value row occupies rows 1246 to 1282 and carries `$400.00`, `96.35%` and `5,000×`. The MAX WIN column then continues with `base` on rows 1310 to 1338 and `bet` on rows 1374 to 1402. The gap between `base` and `bet` is 36 rows (12.8 native px), wider than the line gap inside the body copy above, so the single unit `base bet` reads as two further stacked values. The MAX WIN column is 157 rows tall (55.7 native px) against 37 rows (13.1 native px) for PRICE and RTP. The strip's height is set by that wrap, and the strip's height is what pushes the action row off the panel in finding 01.
- Resolution note: NEW AT 1600PX (at 242-token thumbnail scale the strip resolves as one band and neither the wrap nor the oversized inter-word gap is readable)
- Where fixable: `frontend/src/lib/config/fsModes.ts:157-159` (`maxWinVsBaseBetLabel` returns `` `${FS_MAX_WIN_LABEL} base bet` ``) rendered into `frontend/src/lib/components/BuyBonus.svelte:135` inside `.buy-stat` at `:238-241`, which is `flex: 1` of a three-way split, about 93 native px wide. Neither locked.
- Proposed fix: hard-space the unit (`5,000× base bet`) so it wraps as a block rather than word by word, and let `.buy-stat` labels wrap while values do not. Note `fsModes.ts:150-152` already records the ruling that the short `MAX WIN 5,000x` form is used where the figure sits alone; a narrow-viewport branch to that short form is the other option and is a one-line change.

## STC-MOBILES-3-04 STREAM The max win celebration's lit field is a hard-edged oval that does not cover the viewport, leaving flat near-black outside it

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/361_mobile-s_maxwin_celebration.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/360_mobile-s_transition_maxwin_overlay_fade.png`
- Claim: the boundary is a step, not a falloff. Down column x=120 the luminance holds 50 to 51 to row 1260 and reads 10 at row 1270. Down column x=750 it holds 39 to 40 to row 1360 and reads 9 at row 1370. Across row y=1350 it reads 9 at x=440, 18 at x=440 to 480, then 50 from x=480. That is a factor of five inside 10 rows, at most 3.5 native px. Outside the oval the frame is flat: row y=200 across x 100 to 500 measures a uniform luminance of 10 to 12, so the whole top of the screen sits outside the lit field. At 320x568 the most-watched surface in the game is therefore an off-centre oval with a visible crisp rim, sitting on dead black.
- Resolution note: VISIBLE AT BOTH as a vignette; that the rim is a hard clip rather than a soft falloff is NEW AT 1600PX, and it is the detail that changes the fix
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:206-223`, `.c1-halo { position: absolute; inset: -10%; border-radius: 50%; background: conic-gradient(...); }`. `border-radius: 50%` on a box 120 per cent of a 320x568 viewport is an ellipse of 384x682 whose clip is antialiased over about one pixel, which is exactly the measured step. Not locked.
- Proposed fix: replace the `border-radius` clip with a feathered `mask-image: radial-gradient(closest-side, #000 55%, transparent 100%)` so the halo fades out instead of being cut, and size the box from the larger viewport axis (`width: 200vmax; height: 200vmax; aspect-ratio: 1`) so portrait cannot put the rim inside the frame. This would be the first `mask-image` in `frontend/src/`.

## STC-MOBILES-3-05 MEDIUM The max win hero figure and its unit are set on three different baselines, inside a wrapper that declares baseline alignment

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/361_mobile-s_maxwin_celebration.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/360_mobile-s_transition_maxwin_overlay_fade.png`
- Claim: the hero reads `5,000×BET`. Decoded bounding boxes: the final `0` of `5,000` occupies x 520..617, y 774..875, a cap height of 101 rows (35.9 native px) with its baseline at row 875. The `×` occupies x 630..658, y 825..852, a cap height of 27 rows (9.6 native px) with its baseline at row 852. `BET` occupies x 673..770, y 840..866, a cap height of 26 rows (9.2 native px) with its baseline at row 866. Three baselines, 875, 866 and 852, spread across 23 rows (8.2 native px) inside what is presented as one lockup. Horizontally the gutter from the numeral to the `×` is 13px (4.6 native px) and from the `×` to the `B` is 15px (5.3 native px), so the unit's own internal gap is the wider of the two and the eye groups `5,000×` while `BET` floats. This is the English instance of the surface the localisation squad reported as `5,000×EINSATZ` (`STL-DE-B-02`).
- Resolution note: NEW AT 1600PX (a 9px baseline offset on a 9.6px glyph is not resolvable at 242 tokens)
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:295-299` declares `.c1-max-multwrap { display: flex; align-items: baseline; gap: 0.1em; }`, and then both children opt out of it: `:309-315` `.c1-max-x { align-self: flex-end; padding-bottom: 0.12em; }` at `font-size: 46px`, and `:316-323` `.c1-max-betlabel { align-self: flex-end; padding-bottom: 0.28em; }` at `font-size: 22px`. Two different `align-self` overrides with two different paddings on two different font sizes produce exactly three baselines. Not locked.
- Proposed fix: delete both `align-self: flex-end` declarations and both `padding-bottom` values and let the wrapper's own `align-items: baseline` do the work, which is what it was written to do; then widen the gutter between the numeral and the unit group (wrap `×` and `BET` in one span with `gap: 0.35em` from the numeral) so the unit does not read as glued to the number.

## STC-MOBILES-3-06 STREAM The feature entry card's award headline is drawn on top of the speedometer graphic rather than below it

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/350_mobile-s_feature_entry_card.png`, `349_mobile-s_transition_feature_entry_fade.png`, `351_mobile-s_transition_feature_starting.png`, `352_mobile-s_feature_run_1.png`, `353_mobile-s_feature_run_2.png`, `354_mobile-s_feature_run_3.png`, `355_mobile-s_feature_run_4.png`, `356_mobile-s_feature_run_5.png`, `357_mobile-s_feature_run_6.png`, `363_mobile-s_post_collect_base.png`, all in `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`
- Claim: decoded on frame 350. The speedometer's silver bezel occupies x 349..551, y 327..535. The headline `+16 FREE SPINS` occupies x 282..618, y 490..521. The headline's entire 32-row height (11.4 native px) lies inside the gauge's vertical extent, so the glyphs sit on the gauge's lower bezel, and at 337px the headline is wider than the gauge's 203px, so `FREE` crosses the bezel's left arc and `SPINS` its right arc with the silver reading between the letterforms. The `TAP TO CONTINUE` pill starts at row 552, only 17 rows (6.0 native px) clear of the gauge. Frame 363 shows the identical overlap with `+8 FREE SPINS`. Ten of my seventeen frames carry it.
- Resolution note: VISIBLE AT BOTH as crowding; that the headline sits INSIDE the gauge's bounding box rather than beneath it is NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/FreeSpinsPresentation.svelte:650-652`, `.entry-bottom-group { position: absolute; left: 0; right: 0; bottom: 2%; display: flex; flex-direction: column; gap: 14px; }`, against `:581-583` `.entry-gauge-wrap { position: relative; width: 240px; height: 240px; }`. The comment at `:645-649` states the intent plainly: the award text and the button were put in one flex column so they "can never overlap regardless of the button's own height or the viewport's aspect ratio". That guarantee holds and the frames confirm it. It only ever covered those two elements: the gauge is a separate, in-flow, fixed 240x240 box and the bottom group is absolutely positioned, so there is no flow relationship between them and nothing prevents the gauge from reaching down into the group. Not locked.
- Proposed fix: extend the same guarantee one element outward. Put `.entry-gauge-wrap`, `.entry-title` and `.entry-bottom-group` in a single flex column on `.fs-entry-stage` so the gap between the gauge and the award is structural rather than positional, and size the gauge as `min(240px, 26vh)` so it cannot consume the card at 568px height.

## STC-MOBILES-3-07 HIGH The win-detail strip under the reels renders at 4.6px native cap height, unreadable, for the whole of every win

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/359_mobile-s_post_feature_base.png`, `358_mobile-s_transition_feature_exit.png`, `350_mobile-s_feature_entry_card.png`, `349_mobile-s_transition_feature_entry_fade.png`, `351_mobile-s_transition_feature_starting.png` through `357_mobile-s_feature_run_6.png`, `363_mobile-s_post_collect_base.png`, all in `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`
- Claim: decoded on frame 359. The strip's text occupies rows 716 to 728 across x 200..699, a cap height of 13 rows, that is **4.6 native px**. For scale, on the same screen the `FEATURES` button label measures 28 rows (9.9 native px) and the `BALANCE` pod label 27 rows, so the strip is set at under half the smallest other label in the interface while carrying live win information. Content as far as it resolves even at 1600px: frame 358 `SCATTER  x5  5 ways  $12.00`, frame 359 `L2  x5  1ways  $2.00`, frame 350 `L2  x5  1ways  $0.60`, frame 363 `M3  x3  1ways  $2.00`. Those transcriptions are offered with the caveat that the finding IS the illegibility: the superseded native pass read the same two strings as `L2 x5 8 ways $0.60` and `SCATTER x5 8 ways $12.00`, and two careful readers disagreeing on the ways count of the same pixels is the strongest available evidence that no player can read it.
- Resolution note: NEW AT 1600PX (at 242 tokens the strip is one or two pixel rows; it cannot be measured or transcribed at all)
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:136` (`.fs-face { font-size: 0.7rem; }`) and `:146` (`.wb-ways { font-size: 0.62rem; }`). The absolute type size is the problem in combination with the stage scale: `FreeSpinsPresentation.svelte:668-672` records that the LAYOUT_SPEC 1280x720 stage "portrait scales down well below 1:1 (as low as ~0.58x measured on iPhone 14 portrait)", and mobile-s is narrower still, so a fixed 0.62rem lands at about 4 to 5 native px. Not locked.
- Proposed fix: size this strip from the viewport rather than from the stage, `font-size: max(11px, 0.62rem)` with the strip lifted out of the scaled stage, or drop the strip entirely below a width threshold rather than shipping an unreadable one. A strip nobody can read is worse than no strip, because it reads as a rendering fault.

## STC-MOBILES-3-08 HIGH The portrait HUD is an opaque slab covering the bottom 41 per cent of the screen, meeting the artwork on a hard full-width edge

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/359_mobile-s_post_feature_base.png`, `350_mobile-s_feature_entry_card.png`, `363_mobile-s_post_collect_base.png`, and every other frame in the range showing the base or feature interface (349, 351 to 358, 362)
- Claim: at column x=880 the luminance reads 52 to 55 at row 938 and 17 to 20 at row 941, a drop of a factor of three inside 3 rows (about 1 native px). The identical cut is at row 938 in frames 350, 359 and 363, so it is a fixed layout boundary and not a transition artefact, and the same cut is at column x=20 where `rgb(72,76,104)` becomes `rgb(11,18,30)`. Native y is 333 of 568, that is 58.6 per cent down the screen; below it the field is flat `rgb(8,16,27)` for 234 native px, 41 per cent of the screen height. The seam runs the whole 901px width with no bevel, rule or feather, and it passes between two rows of HUD pods that carry the same weight and border language, so the upper pair reads as sitting on artwork and the lower pair on nothing.
- Resolution note: VISIBLE AT BOTH as a tonal change; that the boundary is a hard 1 native px step is NEW AT 1600PX, and it is what makes this a composition defect rather than a colour one
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1887`, `.p-hud { background: linear-gradient(180deg, rgba(6, 9, 20, 0.92), rgba(4, 6, 14, 0.98)); }` on a panel that is `flex: 1 1 auto` (`:1878`) and therefore grows to the viewport bottom. The backdrop itself is intact underneath and is NOT the cause: `App.svelte:2545-2560` renders `.bg-still` at `width: 100vw; height: 100vh; object-fit: cover`, so the artwork continues behind the slab. Not locked.
- Proposed fix: feather the panel's top edge, either by starting the gradient at `rgba(6,9,20,0)` for its first 24px or with a `mask-image` top fade, so the HUD meets the artwork instead of guillotining it; or, if the hard edge is wanted, make it deliberate with a hairline accent rule at the seam so it reads as a chassis edge rather than as the background running out.

## STC-MOBILES-3-09 MEDIUM The two feature-mode HUD pods centre their content independently, so the two figures presented as a matched pair are 5.7 native px out of baseline

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/350_mobile-s_feature_entry_card.png`, `349_mobile-s_transition_feature_entry_fade.png`, `351` through `357`, `362_mobile-s_transition_maxwin_collect_fade.png`, `363_mobile-s_post_collect_base.png`, same directory
- Claim: decoded on frame 350. The left pod's content, `OVERDRIVE FREE` / `SPINS` / `16`, occupies y 783..901. The right pod's content, `TOTAL WIN` / `$10.80`, occupies y 800..885. The two blocks agree on their vertical centre to half a pixel, 842.0 against 842.5, which shows each pod is centring its own content correctly in isolation. But the left label wraps to two lines and the right does not, so the two VALUE figures land on different baselines: `16` bottoms out at row 901 and `$10.80` at row 885, a 16 row (5.7 native px) offset between two numbers in identical containers at the same height.
- Resolution note: NEW AT 1600PX (5.7 native px on a figure 15 native px tall is below the resolvable threshold at 242 tokens)
- Where fixable: `frontend/src/lib/components/BonusInstrumentColumn.svelte:232-238`, `.pm-cell { flex: 1 1 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }`. Each cell centres its own label plus value column, so a label that wraps in one cell and not the other necessarily displaces the values. Not locked.
- Proposed fix: make `.pm-strip` (`:220-231`) a two-column grid with two explicit rows and let the cells participate in it, so the label row and the value row are shared across both cells; or give `.pm-label` a two-line `min-height` so the wrap cannot change the value's position. The first is the real fix and survives a third cell.

## STC-MOBILES-3-10 LOW The whole interface translates 4.3 native px left and 3.9 native px down during the collect fade

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/362_mobile-s_transition_maxwin_collect_fade.png`, against `358_mobile-s_transition_feature_exit.png`, `359_mobile-s_post_feature_base.png` and `363_mobile-s_post_collect_base.png` as controls
- Claim: three independent landmarks move together and keep their widths, so this is a translation and not a reflow or a rescale.

  | Landmark | 358 / 359 / 363 | 362 | delta |
  |---|---|---|---|
  | wordmark bbox x | 246..653 (w 407) | 234..641 (w 407) | 12 left |
  | `MAX` label bbox | x 609..694 (w 85), y 1460..1483 | x 597..681 (w 84), y 1471..1494 | 12 left, 11 down |
  | menu icon bbox | x 76..125, y 1451..1489 | x 66..111, y 1462..1497 | 10 left, 11 down |

  That is 12px left and 11px down, or 4.3 x 3.9 native px.
- Resolution note: NEW AT 1600PX
- Where fixable: UNKNOWN. Not traced to source, deliberately: see the fix note.
- Proposed fix: PARK(a single frame cannot distinguish a deliberate impact shake on COLLECT from an unintended reflow, and both fit the evidence exactly. Recorded as a measurement so the motion-residue lens or a source pass can settle it cheaply, not asserted as a defect.)

## Native pass reconciliation

`STC-MOBILES-B.md` covers frames 338 to 363. Its findings that fall inside 347 to 363 are reconciled below. `STC-MOBILES-A.md` covers 312 to 337, entirely outside this range, so A-01 through A-11 belong to a sibling squad and are not adjudicated here; two of them are noted at the end because they describe the same defect CLASS as findings here, seen on their own frames.

- **B-01 STREAM, buy confirm dialog has no reachable CONFIRM or CANCEL** (frames 345, 346, 347, 348): **CONFIRMED** for 347 and 348 at full resolution, and the mechanism it named is right. Refined only by adding the source citation and the measurement that no action row exists in the panel at all, plus the observation that the space where it should sit is filled by the HUD dock bleeding through. Carried forward as finding 01.
- **B-02 HIGH, the max win overlay instructs a touch player to `HIT ENTER`** (frames 360, 361): **CONFIRMED**. The string `PRESS COLLECT OR HIT ENTER TO CONTINUE` renders on rows 1109 to 1190 of frame 361 on a 320x568 viewport. Outside this squad's lens (copy, not composition) but confirmed as present.
- **B-05 HIGH, `TOTAL WIN $2.80` displayed directly above `WIN $5,000.00`** (frames 362, 363): **CONFIRMED**. Both frames show the upper pod labelled `TOTAL WIN` reading `$2.80` and the lower pod labelled `WIN` reading `$5,000.00` within one glance.
- **B-06 MEDIUM, the two feature pods' values are 6px out of baseline because only the left label wraps** (frames 349, 350, 352 to 357, 362, 363): **CONFIRMED and REFINED**. The offset measures 16 upscaled rows, that is 5.7 native px, not 6. More usefully, the re-run establishes that the pods are NOT individually miscentred: both content blocks share a vertical centre to half a pixel (842.0 against 842.5), so the fault is a missing shared row grid rather than a centring bug, which changes the fix. Source added: `BonusInstrumentColumn.svelte:232-238`. Carried forward as finding 09.
- **B-07 MEDIUM, the BET pod carries 97px of dead space between its label and its controls** (frames 341, 358, 359, 363): **CONFIRMED** on 359 to within one pixel. The three glyphs of `BET` occupy x 77..100, 107..126 and 132..154; the next content of any kind is the down-stepper chevron at x 425..453. The gap is 271 upscaled px, that is **96.2 native px**, against B-07's 97.
- **B-11 MEDIUM, the max win halo is an ellipse whose edge crosses the frame** (frames 360, 361): **CONFIRMED as to the shape, REFINED as to its nature and therefore its severity.** B-11 describes "a soft curved boundary". At 1600px it is not soft: the luminance steps by a factor of five inside at most 3.5 native px (column x=120 reads 51 at row 1260 and 10 at row 1270; column x=750 reads 40 at row 1360 and 9 at row 1370). B-11's root cause is right and the reason is now visible in it: `border-radius: 50%` clips, it does not fade. Raised from MEDIUM to STREAM as finding 04, because a crisp rim across the most-watched surface is a different defect from a soft vignette.
- **B-12 MEDIUM, the six in-flight frames all show the undismissed entry gate** (frames 352 to 357): **CONFIRMED**. All six carry `+16 FREE SPINS` and `TAP TO CONTINUE` and are otherwise identical to 350. One detail **REFINED**: B-12 transcribes the alternating win strip as `L2 x5 8 ways $0.60` and `SCATTER x5 8 ways $12.00`; at 1600px I read `L2  x5  1ways  $0.60` and `SCATTER  x5  5 ways  $10.00`. Neither reading should be trusted, and the disagreement is not a defect in either pass: the strip's cap height is 4.6 native px, which is finding 07.
- **B-13 MEDIUM, transition frames indistinguishable from their settled neighbours** (frames 341, 343, 345, 347, 349, 351): **CONFIRMED** for the three pairs inside this range. 347 against 348, 349 against 350 and 351 against 350 are visually identical at 1600px; the only decodable difference across 349 to 357 is the win-detail strip's content alternating.
- **B-14 LOW, the feature exit transition shows a fully empty grid inside a lit reel frame** (frame 362): **CONFIRMED**. The reel window carries no symbols, only ghosts and a yellow bloom, while the frame border is at full intensity.
- **Out of range, belonging to a sibling squad:** B-03 and B-10 (frames 343, 344), B-04 (342), B-08 and B-09 (paytable frames below 347). Not adjudicated.
- **Sibling-squad class matches, recorded so the marshal does not count them twice:** `STC-MOBILES-A-06` ("a hard full-width seam cuts the scene backdrop off in a single pixel row") is the same defect as finding 08 seen on frames 312 to 337; the re-run adds that the seam is the top edge of `.p-hud`'s own background and not the backdrop ending, since `App.svelte:2545-2560` covers the full viewport. `STC-MOBILES-A-07` ("the win line detail is set at about 5px cap height") is the same defect as finding 07; the re-run measures it at 4.6 native px and cites the source.

## Explicit absences, signed

Each of these was measured, not assumed. Three of them refute a claim my own first visual pass had made, which is why they are here.

1. **The bottom control row is aligned. No finding.** Decoded on frame 359: the SPIN disc down column x=456 spans rows 1362 to 1577, centre 1469.5; the menu icon's three bars down column x=100 span rows 1450 to 1490, centre 1470.0; the `MAX` label bounding box is y 1460..1483, centre 1471.5; the refresh arc down column x=810 spans rows 1462 to 1483, centre 1472.5. All five controls sit within 3 upscaled px, 1.1 native px, of one horizontal centre line. My first pass called this misaligned by eye; it is not.
2. **No control in this range is below the 44 native px touch floor. No finding.** SPIN disc 216 upscaled diameter (76.7 native); the four small circles 135 to 140 upscaled from chord geometry at rows 1420 and 1500 (48 to 50 native); the BET steppers 125 upscaled (44.4 native); `TAP TO CONTINUE` 288x128 upscaled (102x45 native); `COLLECT` x 202..698 by y 952..1078, 497x127 upscaled (176x45 native).
3. **The full-width elements of the base HUD share their left and right edges. No finding.** Probed at low threshold rather than by silhouette: the FEATURES button border at x 34..866 (row y=855), the BALANCE and WIN pod row at x 34..866 (row y=1050), the BET box at x 34..866 (rows 1166 and 1340). Left inset 35, right inset 35, symmetric to a pixel. My first pass read a 24px stagger between the FEATURES button and the pods; that was a luminance-threshold artefact and is refuted.
4. **The buy dialog does not exceed its viewport and its margins are symmetric. No finding.** Panel x 27..873, y 82..1516: left margin 27, right 28, top 82, bottom 84, in a 901x1600 frame. The defect in findings 01 to 03 is internal to a panel that fits correctly.
5. **The max win overlay is correctly centred. No finding.** `MAX WIN` centre x 451.0, `REACHED!` centre x 453.0, the three crown stars centre x 450.0, the COLLECT button centre x 450.0, against a viewport centre of 450.0. All within 3 upscaled px (1.1 native). My first pass called `REACHED!` 24px off-centre; the decode refutes it, and the apparent offset was the `!` glyph's glow.
6. **WITHDRAWN DRAFT CLAIM: there is no visible HUD ghost under the max win scrim.** This shard's first draft carried a HIGH finding that the celebration left the interface legible beneath it. It is wrong and it is withdrawn rather than softened. `MaxWinCelebration.svelte:194-197` sets the backdrop to `radial-gradient(ellipse at center, rgba(20, 8, 50, 0.97) 0%, rgba(6, 4, 20, 0.99) 100%)`, so a 1 to 3 per cent residue is mathematically present. Measured, using frame 359 as the uncovered control to build a glyph mask and then reading frame 361 at exactly those coordinates, the residue is **3 luminance units at both the median and the p90 in every band tested**: the BET readout band x 520..690 y 1230..1290 (glyph median 51 against non-glyph 48), the BALANCE band x 70..410 y 1055..1105 (79 against 77), the MAX label band x 600..700 y 1455..1490 (13 against 10). An offset search across dx and dy from -20 to +20 found no interior maximum; every high score sat on the search boundary, which is the signature of a smooth halo gradient and not of a glyph match. The bright pixels I had read as ghost text are the halo and the bokeh particles. Recorded in full because a native-resolution false positive and a 1600px false positive cost the ledger the same.
7. **Nothing in this range is clipped by the left, right or top viewport edge. No finding.** No measured bounding box touches x=0 or x=900, and the wordmark's top edge is row 14, 5.0 native px of clearance. In particular the blue arc visible below the buy dialog in frames 347 and 348 is the SPIN disc showing past the modal, not a clipped control: it ends at rows 1571 and 1572 respectively, 28 upscaled px (10 native px) clear of the frame bottom.
8. **Not swept by this squad, named rather than left implied:** colour and contrast, typography as such (glyph shapes, letter spacing, font fallback), motion residue, string content, localisation and audio. Where a composition finding above touches a string, the string is quoted as evidence for the geometry, not adjudicated.

## KNOWN matches

- **KNOWN(Q-26)**, fresh evidence at `mobile-s`. Frames `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/347_mobile-s_transition_dialog_nitro_overdrive_opening.png` and `348_mobile-s_dialog_nitro_overdrive.png` render `Overdrive meter pre-revved to 5x.` with a letter `x` in the same view as the sibling lines `1×, 3× or 10× total bet`, which use U+00D7. That is precisely the `5x` instance Q-26 enumerates in `fsModes.ts`, now shown to be player-visible on a shipped mobile surface rather than only present in config.
- **KNOWN(TR-115 / TR-086), adjacency rather than an instance.** Finding 03 is a fit failure on a money and stat display, which is the class TR-115 and TR-086 map to final-mile JOB 3. It is recorded as adjacent rather than folded in, because the failure mode here is a three-line wrap that changes the panel's height, not a clip or an ellipsis, and a fit-or-abbreviate mechanism would not on its own restore the action row.
- **MID-01: not observable in this range.** The `mobile-s` big win triple is frames 324 to 326, outside 347 to 363, and no frame here renders the win banner beside the HUD WIN pod. No claim either way.
- **MID-02: not observable in this range.** No frame here renders the win banner's `16x BET` unit. The `×` on the max win hero at frames 360 and 361 is already U+00D7 (`MaxWinCelebration.svelte:155`), consistent with the Q-12 fix recorded there, so this surface is not a MID-02 instance.
- **Corroboration, not a KNOWN_OPEN row:** the win-detail strip in finding 07 carries a raw internal symbol code (`L2`, `M3`), an ASCII `x` and the unspaced `1ways`. That is the same surface `STL-AR-A-01` reports from the Arabic session, reached here from the composition side.

tree_after: `git status --porcelain`, verbatim. Every line is `??`, untracked. Nothing
is MODIFIED and nothing is DELETED, so this squad dirtied nothing. The only line that
is mine is `STC-MOBILES-3.md`; the other 26 belong to sibling squads.

```
?? reports/qa/stream_test/shards/STC-MOBILEL-1.md
?? reports/qa/stream_test/shards/STC-MOBILEL-2.md
?? reports/qa/stream_test/shards/STC-MOBILEL-3.md
?? reports/qa/stream_test/shards/STC-MOBILEM-1.md
?? reports/qa/stream_test/shards/STC-MOBILEM-2.md
?? reports/qa/stream_test/shards/STC-MOBILEM-3.md
?? reports/qa/stream_test/shards/STC-MOBILES-1.md
?? reports/qa/stream_test/shards/STC-MOBILES-2.md
?? reports/qa/stream_test/shards/STC-MOBILES-3.md
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
?? reports/qa/stream_test/shards/STT-MOBILES-3.md
?? reports/qa/stream_test/shards/STT-POPOUTS-1.md
?? reports/qa/stream_test/shards/STT-POPOUTS-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-3.md
```
