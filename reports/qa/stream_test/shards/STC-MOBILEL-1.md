# STC-MOBILEL-1, composition (mobile-l, frames 208 to 225, 1600px upscaled)
supersedes: STC-MOBILEL-A.md (partially: its scope is 208 to 233, this shard re-reads 208 to 225 of it). STC-MOBILEL-B.md is scoped 234 to 259 and does not overlap this range at all.
scope: every `mobile-l` frame numbered 208 to 225 inclusive, viewport `425x812`, lang `en`, 18 frames, each opened exactly once from `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`
frames_read: 18

**Units.** Every pixel figure below is in the UPSCALED frame unless it is explicitly
labelled native. The upscaled frames are `837x1600` against a native viewport of `425x812`,
so the scale factor is `1600 / 812 = 1.9704` and a native figure is the upscaled one divided
by that. Where a figure is load bearing it comes from a luminance scan of the frame decoded
to raw pixels, not from reading the image by eye, and each scan is described so it can be
repeated.

**Two of this shard's own claims were refuted against the source in step 3 and have been
corrected in place rather than quietly dropped**: the win strip's chamfer (finding 11) and
its edge alignment. Both are recorded under absences so the correction is visible.

## STC-MOBILEL-1-01 STREAM The reel window empties into holes on spin start and the scene plate reads straight through the lit board
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/214_mobile-l_transition_reels_accelerating.png`
- Claim: `MANIFEST.json` calls this frame `Reels accelerating, about 250ms after spin press`. At that moment reel 1 carries three tiles, reel 2 carries two and reel 3 carries exactly one (the gold hex in row 1), while reels 4 and 5 still carry the full settled board of piston tiles from `213_mobile-l_base_idle.png`. Reel 3 is empty from its single tile's lower edge down to the frame's inner bottom, a see-through void about `425` tall and `160` wide, and the voids in reels 1, 2 and 3 are contiguous. Through it the parallax city plate, its rain streaks, a magenta chevron decoration at about `x 30 to 180, y 680 to 800` and a small teal glow at about `x 310 to 330, y 780 to 790` are all separately identifiable INSIDE the lit cyan frame. The following frame `215_mobile-l_transition_reels_full_speed.png` shows the window full, so the outgoing board is cleared before the incoming strip covers the window, and every spin passes through this state.
- Resolution note: VISIBLE AT BOTH
- Where fixable: `frontend/src/lib/components/GameGrid.svelte:1224-1230` (`.symbol-col` is a fixed viewport that clips its travelling `.reel-strip`; the strip is short of four tiles per reel while the offsets animate). Not locked. Note for the marshal: the native pass put this at `ReelsCanvas.svelte:404-433`, and **there is no file named `ReelsCanvas.svelte` anywhere under `frontend/src`**.
- Proposed fix: hold the settled board beneath the incoming strip until the strip covers the window, or pad the strip so no reel is ever short of four tiles.

## STC-MOBILEL-1-02 STREAM The BIG WIN band erases half of the reel window's neon frame on both sides, for the whole celebration
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/220_mobile-l_transition_bigwin_countup_early.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/221_mobile-l_transition_bigwin_countup_late.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/222_mobile-l_bigwin_settled.png`
- Claim: the celebration band is drawn OVER the reel window's own neon border rather than inside it, and cuts that border into two disconnected segments.

  Measured by scanning column `x = 4` from `y = 240` to `y = 900` for luminance above `110`:

  | Frame | bright runs at `x = 4` | bright runs at `x = 834` |
  |---|---|---|
  | `216_mobile-l_dead_spin_1_settled.png` (control, no band) | `(262, 856)`, one continuous run | `(261, 855)`, one continuous run |
  | `222_mobile-l_bigwin_settled.png` | `(262, 397)` and `(695, 856)` | `(261, 397)` and `(695, 855)` |

  On the settled board the frame's left stroke is a single unbroken run `595` tall. Under the
  band it becomes two runs with `y = 398` to `y = 694` dark: **`297` upscaled, `150.7` native
  px, `49.9 per cent` of the stroke's height, erased on the left, and the same `297` erased
  on the right**. The two gaps are identical to the pixel, which is what identifies the cause
  as one full-width band rather than a glow falloff.

  The band's top edge at `y = 398` also falls inside the row 1 tiles, whose lower boundary
  sits at about `y = 410` on the settled frames, so on `220`, `221` and `222` the bottom edge
  and bottom corners of all five row 1 tiles are not drawn while they are drawn on `216`,
  `217` and `218`.

  On stream the result is that the glowing outline which defines the machine breaks into a
  top piece and a bottom piece at the most-watched moment in the game.
- Resolution note: NEW AT 1600PX. The native pass opened these three frames and signed the opposite: *"Checked whether the banner band is placed off centre or crops the grid unevenly... Judged deliberate. No composition finding."*
- Where fixable: `frontend/src/lib/components/WinBanner.svelte:342-352` (`.big-win-banner` is `position: absolute; left: 0; right: 0; top: 310px; width: 100%; z-index: 100`), against `frontend/src/lib/components/GameGrid.svelte:1204-1214` (`.grid-container` carries the frame as a `box-shadow`, which paints below `z-index: 100`). Neither is locked.
- Proposed fix: **PARK, but only on the direction, not on whether.** The band's full width is deliberate and is recorded as such at `WinBanner.svelte:339-341`: *"full-width neon band, stage edge to edge... no longer a centred box, so reels stay visible above and below"*, which is an owner audit round 2 decision. What that decision did not consider is that it severs the frame's outline, and that is the defect. Two ways out, and the choice is an art call: raise the grid frame's stroke above `z-index: 100` so the outline stays continuous through the band, or inset the band by the frame's stroke width so it stops short of it. The second keeps the band's edge-to-edge reading almost intact and is the cheaper change.

## STC-MOBILEL-1-03 HIGH The reel window's neon frame is cut off by BOTH viewport edges, and the two sides are cut by different amounts
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/212_mobile-l_transition_rules_to_base.png`, `213_mobile-l_base_idle.png`, `214_mobile-l_transition_reels_accelerating.png`, `215_mobile-l_transition_reels_full_speed.png`, `216_mobile-l_dead_spin_1_settled.png`, `217_mobile-l_dead_spin_2_settled.png`, `218_mobile-l_dead_spin_3_settled.png`, `219_mobile-l_win_presentation.png` (all in the upscaled directory above)
- Claim: the frame is not inset from the viewport. Its glow reaches column `0` and column `836`, and its brightest column IS the boundary column, which is the signature of a stroke whose centreline sits at or beyond the edge.

  Luminance across `y = 760` on `216_mobile-l_dead_spin_1_settled.png`, left edge first:

  `x 0..17 = 184, 178, 162, 159, 155, 151, 140, 138, 136, 136, 136, 135, 134, 131, 127, 115, 102, 60`, then `18` from `x = 18` inward.

  Right edge, same row: `18` out to `x = 816`, then `20, 21, 22, 23, 65, 107, 120, 133, 136, 139, 140, 141, 140, 141, 144, 146, 156, 159, 161, 161` at `x 817..836`.

  A complete glow peaks on its centreline and decays on both sides. This one decays in one
  direction only, at both edges, so the outer half of the stroke is off screen on each side.
  The peaks also differ, `184` on the left against `161` on the right, so the machine is not
  merely full bleed, it is off centre: more of the left stroke is lost than the right.

  For reference the page background at the same columns outside the frame band reads
  `L(0) = 20` at `y = 150` and `L(0) = 25` at `y = 1000` on `213`, so the bright edge columns
  are the frame and not the scene.
- Resolution note: NEW AT 1600PX. The native pass signed the opposite as an explicit absence: *"The reel frame comes closest, sitting a few pixels inside both side edges on `213` through `222`, but it is inset on both sides by the same amount and nothing crosses."* Both halves of that sentence fail at full resolution: it is not inset, and the two sides do not match.
- Where fixable: `frontend/src/lib/components/GameGrid.svelte:1204-1214`. `.grid-container` is a FIXED `width: 616px; height: 412px` box whose neon is `box-shadow: 0 0 40px rgba(0,100,255,0.25), 0 0 80px rgba(80,0,180,0.15)`, so up to `80` px of glow is painted OUTSIDE the box. Scaled down to a `425` px viewport that glow has nowhere to go. Not locked.
- Proposed fix: give the machine a horizontal margin at least as wide as the scaled outer glow radius at this breakpoint, so the whole stroke is inside the viewport; and centre it, since the two sides currently differ.

## STC-MOBILEL-1-04 HIGH The win breakdown strip removes 95 per cent of the reel frame's bottom stroke
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/221_mobile-l_transition_bigwin_countup_late.png`, `222_mobile-l_bigwin_settled.png`, `223_mobile-l_transition_menu_opening.png`, `224_mobile-l_hud_menu.png`
- Claim: the strip carrying `L3  x4  1 ways  $0.20` on `221`, `223` and `224` and `M3  x5  8 ways  $16.00` on `222` does not merely touch the frame's bottom stroke, it removes it.

  Full-width scans for luminance above `110`:

  | Row | `216` (no win) | `219` (a win, no strip) | `222` (strip) | `224` (strip, no band) |
  |---|---|---|---|---|
  | `y = 840` | `(0, 836)` | `(0, 836)` | `(0, 23)` plus text ink | `(0, 23)` plus text ink |
  | `y = 848` | `(0, 836)` | `(0, 836)` | `(0, 23)`, `(818, 836)` | `(0, 23)`, `(818, 836)` |
  | `y = 852` | `(0, 836)` | `(0, 836)` | `(0, 26)`, `(818, 836)` | `(0, 26)`, `(818, 836)` |

  At `y = 852` the surviving neon is `27` columns at the left and `19` at the right:
  **`791` of `837` columns, `94.5 per cent` of the reel window's bottom stroke, is gone
  whenever a win line is being enumerated.**

  The attribution is nailed down by the two controls in that table rather than asserted.
  `219` is a win presentation with lit symbols, win lines and `WIN $3.90` in the HUD, and its
  bottom stroke is intact across all `837` columns, so this is not a general "win mode"
  dimming. `224` carries the strip with no big win band on screen and reproduces `222`'s
  numbers to within two columns, so it is not finding 02's band either. The strip is the only
  element present on all and only the affected frames.
- Resolution note: VISIBLE AT BOTH, materially REFINED. The native pass recorded *"Its lower edge runs into the cyan frame stroke rather than clearing it, so the strip and the frame share pixels"*, which describes a collision. It is not a collision, it is an occlusion of `94.5 per cent` of the stroke, and that is why this is HIGH here rather than MEDIUM there.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:114-121` (`.win-breakdown { position: absolute; left: 50%; bottom: 6px; transform: translateX(-50%); z-index: 45 }`, positioned against the reel frame's padding box so it sits over the border rather than above it). Not locked. Note for the marshal: the native pass put this in `WinLineInfo.svelte`, and **there is no file of that name anywhere under `frontend/src`**. A second note, recorded because it is unresolved: the strip's rendered width is far larger than its own CSS predicts (the element is content sized with `white-space: nowrap` at `WinBreakdown.svelte:132`, yet the affected span is about `790` upscaled px), so something in its containing block is stretching it. The occlusion measurement stands on its own regardless; the width mechanism is PARKED and should be confirmed before the fix is written.
- Proposed fix: inset the strip by the frame's border and glow width, or float it below the machine in the empty band that already exists there.

## STC-MOBILEL-1-05 HIGH The HUD menu panel's right edge lands in the middle of the bet decrement chevron
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/223_mobile-l_transition_menu_opening.png`, `224_mobile-l_hud_menu.png`
- Claim: the panel's right border measures at `x = 509` to `510` (luminance scans at `y = 1200` and `y = 1420` both put the panel fill ending and the exposed HUD beginning there). The bet decrement chevron's cyan ink measures at `x = 449` to `518` at `y = 1358` on `224`. The glyph therefore straddles the panel edge: the part at `x 449..509` is dimmed behind the translucent panel and the part at `x 510..518` is at full brightness beside it, so one control is drawn in two brightnesses with a hard vertical seam through it. The increase chevron beside it is untouched, so the two ends of one stepper do not match. There is also no backdrop scrim: `WIN` `$16.20`, `$1.00`, `FEATURES`, `SPIN` and `MAX` all stay at full brightness, so nothing marks the panel as a layer.
- Resolution note: VISIBLE AT BOTH
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1598-1608` (`.hud-menu` is `position: absolute; bottom: calc(100% + 8px); left: 0; min-width: 200px` with no scrim element and no viewport-relative maximum), with the portrait variant's anchoring at `frontend/src/lib/components/HudOverlay.svelte:2145-2146`. Not locked. Note: the native pass cited `:1495-1515` for this block; the block is at `:1598-1608` at HEAD.
- Proposed fix: dim the HUD behind the panel, and size or anchor the panel so its edge lands in a gutter between controls rather than across one.

## STC-MOBILEL-1-06 HIGH The balance label and the balance figure read through the menu panel and overlap its own rows
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/223_mobile-l_transition_menu_opening.png`, `224_mobile-l_hud_menu.png`
- Claim: the panel fill is translucent enough that the covered `BALANCE` pod stays legible through it. `BALANCE` reads through on the `PAYTABLE` row and `$50,000.00` reads through on the `Session` row. At full resolution the two are not side by side: the ghosted figure begins at about `x = 100` while the word `Session` occupies `x 52..168`, so the currency figure runs THROUGH the menu item rather than sitting to its right, and one line of the menu shows a label and a money amount sharing glyph space. `224` is typed `state` in `MANIFEST.json`, so this is the settled panel and not a mid-fade artefact.
- Resolution note: VISIBLE AT BOTH, REFINED. The native pass had the figure *"immediately to the right of the word `Session` and on the same baseline"*; at `1600px` it overlaps the word instead, which is worse rather than better.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1602`, `background: rgba(6, 6, 18, 0.96)` over an unblurred backdrop. Not locked. Note: the native pass quoted this value as `rgba(10, 14, 22, 0.92)` at `:1499`; neither the value nor the line is what is in the tree at HEAD, though the diagnosis (a translucent fill over an unblurred backdrop) is right.
- Proposed fix: make the panel opaque, or put a blur or a solid plate behind it, so nothing beneath it is legible. `0.96` is close enough to opaque that the remaining `4 per cent` buys nothing.

## STC-MOBILEL-1-07 MEDIUM Every row in the HUD menu is below the minimum touch target, and the volume handles are about 9 native px across
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/224_mobile-l_hud_menu.png`
- Claim: text ink bands measured in the panel's label column (`x 52..300`, luminance above `95`):

  | Row | ink band | pitch to next |
  |---|---|---|
  | `PAYTABLE` | `1170..1187` | `63` |
  | `Session` | `1233..1250` | `67` |
  | `Mute` | `1300..1317` | `52` |
  | `MUSIC` | `1352..1370` | `51` |
  | `SOUND` | `1403..1414` | |

  Row pitch is an upper bound on row height, because adjacent rows cannot overlap. The
  largest pitch in the list is `67`, which is **`34.0` native px**, and the two slider rows
  are at `51` and `52`, which is **`25.9` and `26.4` native px**. Against the `44` px minimum
  that both Apple's and Google's mobile guidance set, no row in this menu reaches the floor
  and the slider rows sit at about `59 per cent` of it.

  The measurement agrees with the source to under a pixel, which is the check that it is
  real rather than a scan artefact: `HudOverlay.svelte:1610-1617` gives `.hud-menu-item`
  `padding: 0.5rem 0.9rem` and `font-size: 0.8rem`, so `8 + 8` px of padding around a
  `12.8` px line box predicts about `31` to `32` native px, against `32.0` measured for the
  `PAYTABLE` row.

  The `MUSIC` slider handle's bright core measures `x 271..288` by `y 1353..1368`, which is
  **`9.1` by `8.1` native px**, on a control the player is expected to drag.
- Resolution note: NEW AT 1600PX. A row pitch of `51` to `67` upscaled is `26` to `34` native px; at the scale the native pass read, individual rows inside a `200` px panel are not separable well enough to measure a pitch, and that pass raised no hit-target finding anywhere in its 26 frames.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1609-1619` (`.hud-menu-item`, the `padding: 0.5rem 0.9rem` at `:1612`) and the volume row and range thumb rules in the same block. Not locked.
- Proposed fix: raise the menu item and volume row hit areas to at least `44` native px and enlarge the slider thumb, at this breakpoint at minimum.

## STC-MOBILEL-1-08 MEDIUM The reel machine and the HUD stack sit on two different vertical margins, so the page's outer edge steps part way down
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/213_mobile-l_base_idle.png`, `216_mobile-l_dead_spin_1_settled.png`, `217_mobile-l_dead_spin_2_settled.png`, `218_mobile-l_dead_spin_3_settled.png`
- Claim: measured on `213`, the `BALANCE` and `WIN` pods span `x 23..813` at `y = 1218` and the `BET` panel spans `x 24..812` at `y = 1357`, so the HUD column is inset about `24` upscaled, `12.2` native px, on each side. The reel machine's tile grid ends at about `x = 820` on the right (the backdrop value `18` runs out to `x = 816` and the glow begins climbing at `x = 817`), an inset of about `17` upscaled, `8.6` native px, and its frame glow then runs off the edge entirely per finding 03. The two strongest vertical edges on the page differ by about `3.6` native px and neither lines up with the other, on a portrait layout where they are stacked directly one above the other and read as one column.
- Resolution note: NEW AT 1600PX in this frame range. A sibling squad's `STC-MOBILEL-B-06` reports the same class from frames `234` to `259` as a `4 px` step. Those frames are outside this range and are not mine to reconcile, but the agreement is worth the marshal's attention because the two measurements come from different frames.
- Where fixable: `frontend/src/lib/components/GameGrid.svelte:1204-1214` (fixed `616x412` machine box) against `frontend/src/lib/components/HudOverlay.svelte:1598` and the HUD's own gutter rules. Not locked.
- Proposed fix: drive both from one gutter token so the machine and the HUD share one outer margin at every breakpoint.

## STC-MOBILEL-1-09 MEDIUM The `WIN!` caption is unplated, overlaps the symbol above it and hangs past its own cell's bottom edge
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/219_mobile-l_win_presentation.png`
- Claim: the caption is rendered as bare white type with no plate, pill, outline or shadow, directly on the reel window at the foot of the reel 3 row 2 cell. Its cap tops meet the lower edge of the lit piston symbol drawn in the same cell, with no clear space between the glyphs and the art, and its lower half extends past that cell's bottom boundary into the row below, so the caption sits across a grid line rather than inside a cell. It is also crossed by the cyan win line leaving the same cell, so glyphs and line share pixels. Every other text element on this surface (`BALANCE`, `WIN`, `BET`, `FEATURES`, the breakdown strip) sits on a plate.

  Beside it, the highlight set and the win line disagree. Eight cells carry the cyan winning
  highlight and its orange particle burst, including reel 1 row 4 at the bottom left, but the
  polyline drawn over them runs reel 1 row 1 to reel 2 row 1 to reel 3 row 1, then diagonally
  down to reel 4 row 3 and across to reel 5 row 3. Reel 1 row 4 is lit and untouched by any
  line, and the diagonal leg crosses two unlit cells on the way. A viewer reading the line to
  find out what won is given a different set from the one the highlights give.
- Resolution note: VISIBLE AT BOTH for the caption (the native pass raised it as `STC-MOBILEL-A-08`); NEW AT 1600PX for the highlight versus polyline mismatch, which needs the individual cell borders to be resolvable.
- Where fixable: UNKNOWN for the caption (its literal was not located within this pass's six-file budget; `WinCelebration.svelte` and `WinDisplay.svelte` are the untried candidates). The highlight and line are drawn from `frontend/src/lib/components/GameGrid.svelte`. Not locked.
- Proposed fix: plate the caption or place it clear of the winning cells; and either draw one polyline per contributing way or drop the polyline and rely on the cell highlight alone.

## STC-MOBILEL-1-10 MEDIUM The big win ring overflows its own band and is drawn across the bottom row of symbol tiles
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/220_mobile-l_transition_bigwin_countup_early.png`
- Claim: the thin decorative ring behind the amount is not contained by the celebration band. The band's lower edge is at `y = 694` (finding 02's measurement of where the frame stroke resumes) and the ring's lower arc is still being drawn at about `y = 745`, about `51` upscaled or `26` native px below it, crossing the reel 2, reel 3 and reel 4 row 4 tiles. The ring is also not circular in the frame: its horizontal extent is about `415` and its vertical about `355`, so it reads as a flattened ellipse rather than the circle the composition implies.
- Resolution note: NEW AT 1600PX. The ring is a thin low-contrast stroke; at native scale it does not resolve as a distinct element at all, which is why the native pass's banner-geometry absence considered only the band.
- Where fixable: `frontend/src/lib/components/WinBanner.svelte:451` (`position: absolute; top: 50%; left: 50%; pointer-events: none; z-index: 1`, the ring layer inside `.big-win-banner`, whose parent has `overflow: visible` at `:351`). Not locked.
- Proposed fix: clip the ring to the band, or size it so it terminates inside it; and confirm whether the ellipse is intended, since the band's own height is what is squashing it.

## STC-MOBILEL-1-11 LOW The win breakdown plate is about three quarters empty and carries the smallest type in the interface
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/221_mobile-l_transition_bigwin_countup_late.png`, `222_mobile-l_bigwin_settled.png`, `223_mobile-l_transition_menu_opening.png`, `224_mobile-l_hud_menu.png`
- Claim: the plate's content `M3  x5  8 ways  $16.00` occupies about `190` upscaled px of a bar whose affected span is about `790`, so roughly three quarters of it is empty, and it is set at `font-size: 0.7rem` with the `ways` field at `0.62rem` (`WinBreakdown.svelte:135` and `:146`), which is `11.2` and `9.9` native px, the smallest type anywhere on this surface. The combination reads as an unfinished bar rather than a designed one.
- Resolution note: NEW AT 1600PX for the fill ratio; the type sizes are from source.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:114-146`. Not locked.
- Proposed fix: PARK(pending the width mechanism noted under finding 04. Until it is known why the plate renders far wider than its own content-sized CSS predicts, sizing it to its content and raising its type are the same fix as finding 04's and should be made once, not twice.)
- **Correction to this shard's own first draft, recorded rather than deleted:** the draft also claimed the plate's two ends were finished differently, a chamfered right against a square left. That is REFUTED by `WinBreakdown.svelte:125`, whose `clip-path: polygon(0 0, calc(100% - 13px) 0, 100% 13px, 100% 100%, 13px 100%, 0 calc(100% - 13px))` chamfers the top-right and the bottom-left, a deliberate rotationally symmetric treatment shared across the project's `fs-plate` primitive. The frame shows exactly that; reading only the top edge is what made it look one-ended. The draft's edge-alignment clause is also withdrawn: the plate misses the HUD gutter and the tile grid's edge by about `1.5` and `2` native px respectively, which is too small to call a defect honestly.

## STC-MOBILEL-1-12 MEDIUM Three casing conventions in one five-item menu list
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/223_mobile-l_transition_menu_opening.png`, `224_mobile-l_hud_menu.png`
- Claim: the HUD menu's items share one left edge at `x = 52`, one type size and one visual weight, and read top to bottom `PAYTABLE`, `Session`, `Mute`, then `MUSIC` and `SOUND` as the two slider labels. That is upper case, then title case, then title case, then upper case twice, inside a single list in one view. This is charter class 4 (capitalisation that changes between two surfaces showing the same kind of word) occurring WITHIN one surface rather than across two, which is a stronger version of the same defect than `Q-34` records.

  The source shows exactly why it drifted, which is the useful part. At
  `HudOverlay.svelte:428-431` the first item is `{$tr('paytable')}`, routed through the locale
  table, while `Session` on `:429` and the mute label on `:431` are hardcoded literals in the
  markup. One item's casing is owned by a translation file and two are owned by the component,
  so nothing was ever in a position to compare them. The same three lines repeat at `:546-548`,
  `:655-658` and `:817-820` for the other layout variants, so the fix is four places, not one.
- Resolution note: NEW AT 1600PX. Distinguishing `Session` from `SESSION` needs the x-height of the lowercase letters to resolve, which is the class of detail the native pass could not read; it listed these five strings only as locale-park visibility evidence.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:428-431`, `:546-548`, `:655-658`, `:817-820`, plus the `paytable` locale value. Not locked. (The locale value itself was not opened, so its exact casing is stated as rendered, not as sourced.)
- Proposed fix: pick one casing for the item list and apply it to all three items in all four variants. The slider labels are a different rank and may legitimately differ, but the three items may not differ from each other. Note that this is the same string set `KNOWN_OPEN`'s `Q-16 park` lists as hardcoded English, so the casing decision and the eventual locale routing should land in one edit rather than two.

## STC-MOBILEL-1-13 LOW The intro rules `Continue` button is under the minimum touch height
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/211_mobile-l_intro_rules.png`
- Claim: the button's bright fill measures `y 1064..1143` by `x 260..578`, which is `80` by `319` upscaled and **`40.6` by `161.9` native px**. The height is `3.4` native px under the `44` px minimum. It is wide enough to be easy to hit in practice, which is why this is LOW rather than higher, but it is the first interactive control in the game and it does not meet the floor. The measurement matches the source: `IntroSplash.svelte:122` overrides the base padding to `0.6rem 1.2rem` at this breakpoint, and `9.6 + 9.6` px around a `0.9rem` line box predicts about `40` native px.
- Resolution note: NEW AT 1600PX. A `3.4` native px shortfall is under two upscaled pixels at native scale.
- Where fixable: `frontend/src/lib/components/IntroSplash.svelte:122` (the breakpoint override `.intro-continue { padding: 0.6rem 1.2rem; }`), against the base rule at `:125-139`. Not locked. Note: the native pass cited `IntroRules.svelte` for this card and **there is no file of that name anywhere under `frontend/src`**; the card is `IntroSplash.svelte`.
- Proposed fix: raise the vertical padding in that override so the control clears `44` native px.

## STC-MOBILEL-1-14 LOW The bet pod carries a 183 native px dead gap between its label and its controls
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/213_mobile-l_base_idle.png`, `216_mobile-l_dead_spin_1_settled.png`, `217_mobile-l_dead_spin_2_settled.png`, `218_mobile-l_dead_spin_3_settled.png`, `219_mobile-l_win_presentation.png`, `222_mobile-l_bigwin_settled.png`
- Claim: the `BET` label ends at about `x = 110` and the decrement chevron's button does not begin until about `x = 471`, a gap of `361` upscaled, **`183` native px**, about `46 per cent` of the pod's width. The two pods directly above it fill their width with a centred label over a centred figure, so the row below them is the one HUD element in the stack with a hole in it.
- Resolution note: VISIBLE AT BOTH (the native pass raised it as `STC-MOBILEL-A-13` at "roughly 190 device pixels"; measured, it is `183`).
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte` (the bet row's `justify-content: space-between`). The file is confirmed; the exact line was NOT confirmed within this pass's six-file budget, so it is not cited. Not locked.
- Proposed fix: PARK(a label-left, control-right split is a conventional pattern and the gap is a consequence of it; whether the value and stepper cluster should instead centre in the pod is an art call about how the row reads beside the two pods above it).

## Native pass reconciliation

Reconciled against `STC-MOBILEL-A.md`, whose scope is frames `208` to `233`. Its findings
`A-04`, `A-05`, `A-09` and `A-10` cite only frames `231`, `232`, `233`, `227`, `228` and
`230`, which are outside this shard's range and belong to a sibling squad; they are listed
below as OUT OF RANGE and are not judged. `STC-MOBILEL-B.md` is scoped `234` to `259` and has
no overlap with this range at all, so nothing in it is reconciled here.

**The re-run's yield is in the absences as much as in the findings.** Two of the native
pass's signed absences are wrong at full resolution and each was hiding a real defect: the
reel frame is clipped by both viewport edges (03) and the big win band erases half that frame
(02). A third absence reached the right conclusion by reasoning that does not hold. Two of
its FINDINGS are refuted outright.

**A separate reliability problem, which the marshal needs before acting on any superseded
shard.** Three of `STC-MOBILEL-A`'s `Where fixable` targets name files that do not exist
anywhere under `frontend/src`: `ReelsCanvas.svelte` (`A-01`), `WinLineInfo.svelte` (`A-06`)
and `IntroRules.svelte` (its intro rules absence). Two more cite line numbers and a CSS value
that are not what is at HEAD: `A-02` at `HudOverlay.svelte:1495-1515` against the real
`:1598-1608`, and `A-03` quoting `background: rgba(10, 14, 22, 0.92)` at `:1499` against the
real `rgba(6, 6, 18, 0.96)` at `:1602`. The DIAGNOSES in those rows are sound and are
confirmed below; the LOCATIONS are not, and were evidently not opened. Every `Where fixable`
in this shard was read at HEAD before it was written, and the two that could not be are
marked UNKNOWN or left uncited rather than guessed.

| Native id | Verdict | Note |
|---|---|---|
| `A-01` reel window empties on spin start | **CONFIRMED** | Re-read on `214` at `1600px`. The per-reel tile counts (3, 2, 1, 4, 4) are exactly as recorded, and the scene plate, its rain streaks, a magenta chevron and a teal glow are separately identifiable through the void, which the native pass could only describe in aggregate. Carried forward as `STC-MOBILEL-1-01` with a corrected file. |
| `A-02` menu panel slices a bet control and covers the balance pod | **REFINED** | The bisection is real and measured: the panel's right border is at `x = 509` and the chevron's ink spans `x 449..518`. Two supporting claims do not survive. The balance pod is NOT "entirely covered": both its label and its figure are legible through the panel, which is `A-03` and is what makes the overlap harmful rather than untidy. And "the two frames are pixel identical" is false: a sample of every 997th byte of the two decoded frames (4,030 samples) found 532 differing, about `13 per cent`. The conclusion that `224` is a settled state still holds, because `MANIFEST.json` types `224` as `state`, but it holds on the manifest and not on the identity claim. Carried forward as `STC-MOBILEL-1-05`. |
| `A-03` balance digits read through the panel | **REFINED** | Confirmed, and worse than recorded. The ghosted `$50,000.00` begins at about `x = 100` while `Session` occupies `x 52..168`, so it runs through the word rather than sitting beside it. Carried forward as `STC-MOBILEL-1-06`. |
| `A-04` paytable bullet markers float unattached | OUT OF RANGE | Frames `231`, `232`. Sibling squad's. |
| `A-05` `COST` column alignment on bet mode cards | OUT OF RANGE | Frame `233`. Sibling squad's. |
| `A-06` win breakdown strip collides with the frame's bottom border | **REFINED** | The direction of the claim is wrong in a way that changes its severity. The strip does not "run into" the stroke and "share pixels" with it, it removes it: at `y = 852` the control frames `216` and `219` are bright across all `837` columns and `222` and `224` are bright only at `x 0..26` and `x 818..836`, so `94.5 per cent` of the bottom stroke is gone. Raised from MEDIUM to HIGH and carried forward as `STC-MOBILEL-1-04`. The strip's small type and empty width are split out as `STC-MOBILEL-1-11`. |
| `A-07` session modal close button overhangs the panel's right margin | **REFUTED** | Both halves fail on measurement. The modal's borders are at `x = 64..66` and `x = 770..774`. The title's left ink is at `x = 110`, an inset of `45` upscaled or `22.8` native px. The close disc's fill runs `x 633..728` at `y = 659` (luminance `35` against a modal fill of `17`), so its right edge is inset `43.5` upscaled or **`22.1` native px**. The header's two ends share one margin to within `0.7` native px, not `23` against `14`. The value column's right ink edge is at `x = 726`, so the disc's right edge sits `2.5` upscaled or `1.3` native px outside it, inside the sidebearing of the rightmost numerals, not the "roughly 8 pixels" of overhang claimed. There is no misaligned header on this modal. The disc also measures about `97` upscaled, `49.2` native px across, which clears the `44` px touch minimum. |
| `A-08` `WIN!` caption drawn bare over a lit symbol and its own win line | **CONFIRMED** | Re-read on `219`. Confirmed and extended: the caption also hangs past its cell's bottom boundary into the row below, and the highlight set and the polyline disagree about which cells won. Carried forward as `STC-MOBILEL-1-09`. |
| `A-09` paytable scroll region fades at the bottom and clips at the top | OUT OF RANGE | Frames `227`, `228`, `230`. Sibling squad's. |
| `A-10` `BUY FEATURE` bar padding | OUT OF RANGE | Frame `232`. Sibling squad's. |
| `A-11` `MAX` carries no ring chrome while the other three secondary controls do | **REFUTED** | Luminance across `y = 1510` on `213` shows a container behind `MAX` of the same kind and size as the one behind the turbo button. Turbo: background `7` at `x 126..132`, then a fill of `18` to `23` from `x = 138` to about `x = 222`, glyph spiking to `108`. `MAX`: background `8` to `10` at `x 596..608`, then a fill of `15` to `27` from about `x = 614` to `x = 700`, letterforms spiking to `129`, `141`, `154`, `118`, `154`. Both discs are about `85` upscaled across. `MAX` is not "bare yellow type with no comparable container"; it is set on the same dark disc as its siblings. A fill of `20` against a background of `8` is not separable at thumbnail scale, which is how this candidate looked real. |
| `A-12` at full spin speed four reels sit on the settled grid and only the fifth is off it | **CONFIRMED** | Re-read on `215`. Reels 1 to 4 sit on the settled row grid of `216` with four whole tiles each and shared horizontal boundaries; reel 5 alone is offset and is the only column showing a part tile at the top and the bottom of the window. Not re-raised as a separate id here: the native pass parked it for the motion squad's reading and that park is the right disposition, so it is confirmed rather than duplicated. |
| `A-13` bet pod dead gap of roughly 190 device pixels | **CONFIRMED** | Measured at `361` upscaled, `183` native px, against the estimate of `190`. Carried forward unchanged in severity and disposition as `STC-MOBILEL-1-14`. |
| `A` absence, *"viewport edge collisions and clipping, other than those reported... the reel frame comes closest, sitting a few pixels inside both side edges... but it is inset on both sides by the same amount and nothing crosses"* | **REFUTED** | The reel frame's glow peaks at column `0` and at column `836` and decays inward only, at both edges, so the outer half of the stroke is off screen on each. The peaks are unequal, `184` left against `161` right, so the two sides are not inset by the same amount, they are cropped by different amounts. Raised as `STC-MOBILEL-1-03`. The source agrees: `.grid-container` is a fixed `616x412` box with up to `80` px of `box-shadow` painted outside it (`GameGrid.svelte:1204-1214`). |
| `A` absence, *"big win banner geometry... judged deliberate. No composition finding."* | **REFUTED** | The band erases `297` upscaled px, `150.7` native px, `49.9 per cent` of the reel frame's side strokes on both sides simultaneously, and its top edge crops the row 1 tiles. Raised as `STC-MOBILEL-1-02`, at STREAM. The band's full width IS deliberate, and `WinBanner.svelte:339-341` records the decision, so the absence was half right; what nobody checked is what the band does to the frame it crosses. |
| `A` absence, *"intro rules card... the heading, bullet markers and bullet text share one left edge"* | **REFINED** | The stated reason is false and the conclusion is right. On `211` the heading's left ink is at `x = 98`, the bullet markers at `x = 90` and the bullet body text further right again, so three different left edges span about `14` native px. They do not share one edge. No finding is raised, because a centred display heading over a hanging-indent list is conventional and the card is symmetric in the ways that matter: its borders measure `x ~34` and `x ~803`, giving equal gutters, and the heading's centre sits `1.3` native px from the card's. The absence should have been signed on the card's symmetry, not on a shared left edge that is not there. Separately, this pass raises `STC-MOBILEL-1-13` against the same card's `Continue` button, which the native absence also cleared. |
| `A` absence, *"money fit at this viewport... no currency figure is clipped, ellipsised or overflowing"* | **CONFIRMED** | Re-checked at `1600px` across `213` to `225`. `$50,000.00`, `$0.00`, `$3.90`, `$16.20`, `$1.00`, `$10.27`, `$15.95`, `$5.00`, `$20.10`, `+$15.10` and `$0.20` all sit inside their containers with clear space. This range still adds no fresh `mobile-l` evidence to `TR-115` / `TR-086`. |
| `A` absence, *"sequence jumps across adjacent frames... the HUD block holds the same geometry across `213` to `222`"* | **CONFIRMED** | Re-checked. The `FEATURES`, `BALANCE`/`WIN`, `BET` and control rows hold position across all ten frames, including through the big win banner. Nothing reflows. |
| `A` absence, *"splash composition, `208` and `209`"* | **CONFIRMED** | Re-checked at `1600px`. The mark spans about `x 232..612` and `TAP TO CONTINUE` about `x 253..587`, both centred on the viewport's `x = 418.5` to within about `2` native px, with the group sitting marginally below the vertical centre. The judgement that this is a deliberate genre-standard splash stands, and so does the observation that the fields above and below it are large and empty. No finding. |
| `A` absence, *"session modal centring, `225`"* | **CONFIRMED, and now the whole modal is clear** | Borders at `x = 64..66` and `x = 770..774` give equal gutters of about `33` native px. With `A-07` refuted, this modal carries no composition finding at all at full resolution. |

## Explicit absences, signed

Signed for the 18 frames named under scope, each opened exactly once from the upscaled
directory. Where an absence rests on a measurement rather than on looking, the scan is stated
so it can be repeated.

- **Viewport edge collisions, beyond finding 03.** Checked every frame for content touching or crossing the `837x1600` bounds. The only element that crosses is the reel frame's neon stroke, which is finding 03. The wordmark `FUTURE SPINNER` clears the top edge by about `10` upscaled, `5` native px, and the `SPIN` button clears the bottom by about `22` upscaled, `11` native px; both are tight and both belong to the layout's no-safe-area class, which a sibling shard records as `STC-MOBILEL-B-07` from frames outside this range. Neither is cut, so neither is raised here. No text, pod, badge or control is clipped by a viewport edge anywhere in `208` to `225`.
- **Panels that have become scrolling boxes.** None in this range. The intro rules card on `210` and `211` fits its content with the `Continue` button fully visible and about `25` native px of card below it, and the session modal on `225` shows all five of its rows with the close button reachable. The scroll-box failures the ledger's Cluster 2 and Cluster 3 describe are on the paytable and buy dialogs, which are frames `226` and later and are not in this range.
- **Modals exceeding the viewport they open in.** Neither modal in this range does. The rules card spans about `y 397..1194` of `1600` and the session modal `y 571..1024`, both with clearance at top and bottom.
- **Symbol grid geometry.** Checked the five columns and four rows on `212`, `213`, `215`, `216`, `217` and `218` for equal column widths and gutters. Columns measure about `162` wide on a `162` pitch with `2` px gutters, and the outer tiles sit about `6` px inside the frame's inner edge on both sides. Consistent. No finding.
- **Bottom control row balance.** Checked the five controls' centres on `213`: about `70`, `181`, `419`, `655`, `766`. The first is `70` from the left edge and the last is `71` from the right; the gap from the left inner control to `SPIN` is `238` and from `SPIN` to the right inner control is `236`. The row is symmetric about the `SPIN` axis to within about `1` native px, and per the refutation of `A-11` all four secondary controls carry the same disc. No finding.
- **Session modal row alignment.** Checked all five label and value pairs on `225`. Labels share `x = 110`, values share a right ink edge of `x = 726`, and the row pitch runs `55`, `53`, `56`, `53` upscaled, a spread of `1.5` native px. The values are set in a different face and a larger size than the labels, so their ink boxes start `2` to `3` px above the labels' on the rows whose values open with `$` or `+`; that is fully accounted for by those glyphs overshooting cap height, so it is NOT a baseline defect and is deliberately not raised. This is the kind of candidate this re-run exists to kill as well as to find.
- **Bet stepper hit targets.** Measured on `213`: the decrement and increment buttons are each about `86` by `85` upscaled, `43.6` by `43.1` native px, at the `44` px floor rather than under it. Not raised. The controls that are under it are in finding 07.
- **HUD menu panel internal padding.** Checked on `224`. Labels start at `x = 52` against a panel left border at about `x = 24`, and the `50%` and `80%` values right-align at about `x = 482` against a panel right border at `x = 509`. `28` against `27` upscaled, about `0.5` native px apart. Symmetric. The panel's internal padding is not a finding; where it sits, what it lets through and how big its rows are, are findings 05, 06 and 07.
- **Volume slider values against handle positions.** `MUSIC 50%` places its handle centre at about `x = 280` on a track running `150` to `405`, where `50 per cent` predicts `277.5`; `SOUND 80%` places its at about `x = 348` where `80 per cent` predicts `354`. Both within a few upscaled px of their stated value. No mismatch between readout and control. No finding.
- **Two of this shard's own draft claims, withdrawn.** The win plate's "one chamfered end, one square end" is refuted by `WinBreakdown.svelte:125`, whose `clip-path` chamfers the top-right and bottom-left as a deliberate rotationally symmetric pair. Its edge misalignment against the HUD gutter and the tile grid measures `1.5` and `2` native px, too small to call. Both are recorded under finding 11 rather than deleted, because a re-run that only ever adds findings is not checking itself.
- **Out of lens, recorded so a later squad does not rediscover it, and NOT numbered here.** `216`, `217` and `218` are captioned `Dead spin 1 of 3`, `2 of 3` and `3 of 3` in `MANIFEST.json` and show what appears to be an identical 20-symbol board in all three. `BALANCE` reads `$50,000.00` unchanged across `213` and every frame through `225`, including after `WIN $3.90` on `219` and `WIN $16.20` on `222`, while the session panel on `225` reports `Spins 5`, `Total wagered $5.00`, `Total won $20.10` and `Net result +$15.10`. Three identical boards in a row is the signature of a deterministic capture harness rather than of a game defect, and a static balance beside a moving session total may be the same thing, so this is recorded as an observation with its caveat rather than asserted as a finding. It belongs to whichever squad or verifier holds state and money. The native pass recorded the same observation in its own absences, so this corroborates the OBSERVATION and is not a second finding.
- **Out of lens, second item.** On `214` and `215` the `SPIN` control's glyph changes to a stop shape while its label still reads `SPIN`, and from `214` onward the button carries a light ring that is absent on `213` and persists through every later frame in this range. Both are visible on stream; neither is a composition claim and neither is numbered here.
- **What this shard does NOT cover.** Typography beyond the casing call in finding 12, motion residue, localisation, audio and accessibility. Frames `226` to `259` of this session are not mine and were not opened. Six source files were opened in step 3 (`HudOverlay.svelte`, `GameGrid.svelte`, `WinBanner.svelte`, `WinBreakdown.svelte`, `IntroSplash.svelte`, plus an existence check on `SessionPanel.svelte`); the `WIN!` caption's owner and the bet row's `justify-content` line were not reached inside that budget and are marked accordingly rather than guessed.

## KNOWN matches

- KNOWN(MID-01): `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/220_mobile-l_transition_bigwin_countup_early.png` renders the banner at `$10.27` while the HUD `WIN` pod already reads `$15.95`, on a win that settles at `$16.20` in `222_mobile-l_bigwin_settled.png`. Fresh evidence at full resolution that the two readouts are separately legible and separately wrong at the same instant; the `mobile-l` instance of the pattern the ledger records for desktop, laptop, popout-l and popout-s.
- KNOWN(MID-02): `220_mobile-l_transition_bigwin_countup_early.png`, `221_mobile-l_transition_bigwin_countup_late.png` and `222_mobile-l_bigwin_settled.png` all render `16x BET` with the ASCII letter `x`. At `1600px` the glyph is unambiguous: it is a lower-case `x` at the same stroke weight and x-height as the capitals beside it, not a raised multiplication sign.
- KNOWN(Q-16 park): `223_mobile-l_transition_menu_opening.png` and `224_mobile-l_hud_menu.png` show the parked hardcoded English on stream at this viewport: `PAYTABLE`, `Session`, `Mute`, `MUSIC`, `SOUND`. The source confirms the shape of the park at `HudOverlay.svelte:429` and `:431`, where `Session` and the mute label are markup literals while `PAYTABLE` on `:428` is routed through `$tr('paytable')`. Recorded as visibility evidence only; the row stays parked. Finding 12 is a casing defect in the same strings and is separate from the park.
- Recorded here rather than as a new id, because it belongs to a sibling squad's surface: `221`, `222`, `223` and `224` render the win breakdown as `L3  x4  1 ways  $0.20` and `M3  x5  8 ways  $16.00`, carrying a raw internal symbol code (`L3`, `M3`), an ASCII `x`, and `1 ways`. `WinBreakdown.svelte:94` builds the last of those as `{current.ways} ways` with no singular branch. `STL-AR-A-01` reports the same strip from the Arabic session.

tree_after: (see below)

`git status --porcelain`, verbatim:

```
?? reports/qa/stream_test/shards/STC-MOBILEL-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-2.md
?? reports/qa/stream_test/shards/STC-POPOUTS-3.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STT-MOBILEL-1.md
?? reports/qa/stream_test/shards/STT-POPOUTS-1.md
?? reports/qa/stream_test/shards/STT-POPOUTS-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-3.md
```

Every line is `??`, untracked. **Nothing is MODIFIED and nothing is DELETED, so this squad
did not dirty the tree.** The one path this squad wrote is `STC-MOBILEL-1.md`. The other
eight are sibling squads' shards and are not this squad's. `reports/screens/` is untouched,
and the scratch BMP decodes used for the luminance scans were written to the session
scratchpad outside the repository, which is why they do not appear here.
