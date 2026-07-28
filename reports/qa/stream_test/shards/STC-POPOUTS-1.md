# STC-POPOUTS-1, composition (Popout S, frames 157 to 173, 1600px upscaled)
supersedes: STC-POPOUTS-A.md, for the part of its range that falls in frames 157 to 173. STC-POPOUTS-B.md covers frames 183 to 207 and does not intersect this range at all.
scope: `popout-s` frames 157 to 173 inclusive, 17 frames, read from `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`. Session `Popout S`, viewport `400x225`, lang `en`, per `reports/screens/stream-test-2026-07-28/MANIFEST.json`.
frames_read: 17

MEASUREMENT CONVENTION. Every pixel figure below is in the UPSCALED frame, which is
`2844 x 1600`. The native viewport is `400 x 225`, so the scale factor is `7.11` and one
native pixel is 7.11 upscaled pixels. Where a figure decides whether something is a
defect I give both. Frame centre is x `1422`, y `800`. Figures were taken by decoding
each PNG to raw RGB and scanning it, not by eye, so the numbers are reproducible;
threshold and window are stated wherever the answer depends on them.

## STC-POPOUTS-1-01 STREAM The reel window goes transparent mid spin and the street scene shows through the board
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/163_popout-s_transition_reels_accelerating.png`
- Claim: while reels 1, 2 and 3 are clearing, what fills the space they vacate is the
  scene backdrop, not the reel window's own panel. The car bonnet, the road surface, the
  pink neon chevrons and the city signage are all readable INSIDE the neon reel frame,
  across roughly x `710` to `1560` and y `355` to `1130`, about `850 x 775` px, which is
  30 per cent of the frame width and 48 per cent of its height. Reels 4 and 5 hold opaque
  tiles at the same instant, so the frame shows an opaque half and a see through half
  side by side. The neon border and the metallic rails render correctly around it, which
  is exactly what makes it read as a hole rather than as a designed reveal.
- Resolution note: VISIBLE AT BOTH
- Where fixable: UNKNOWN. This is the eleven squad cluster 1 in `LEDGER.md`; the
  superseded native shard recorded UNKNOWN for it as well, and I did not spend source
  budget re-deriving what eleven squads have already reported.
- Proposed fix: PARK(which layer owns the cell backing, the cell or the reel strip, is
  the open question and it is already parked in cluster 1).

## STC-POPOUTS-1-02 STREAM The HUD menu's first item is the PAYTABLE, and at this viewport it is entirely above the top edge of the screen
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/173_popout-s_hud_menu.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/172_popout-s_transition_menu_opening.png`
- Claim: the panel occupies x `334` to `1738` and its fill runs from row `0`. Its two
  BOTTOM corners are rounded and its bottom edge is drawn at y `1223`; its top has no
  edge, no radius and no border, because it is off screen. The menu markup at
  `HudOverlay.svelte:546-575` renders SIX items in this variant, in order:
  `{$tr('paytable')}`, `Session`, the turbo row, the auto row, `setMaxBet`, and the mute
  row. The frame shows FIVE: `Session`, `Speed`, `AUTO`, `MAX BET`, `Mute`. The missing
  one is the first, the paytable.
  It is not merely clipped, it is gone: scanning the panel interior x `434` to `1700`
  across y `0` to `107`, the maximum pixel value sum is `58` out of `765`, which is flat
  panel fill, and the first glyph pixels in the panel are `Session`'s cap tops at y
  `107`. There is no partial letterform anywhere above `Session`. The paytable is a
  jurisdictional surface, so an entire menu row disappearing at the platform's own
  mini player size is worth more than a layout note.
- Resolution note: VISIBLE AT BOTH that the panel reaches the top edge. NEW AT 1600PX
  that no glyph remnant survives above `Session`, which is what separates "the first row
  is half cut" from "the first row is not on screen at all".
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1598-1607`. The panel is
  `position: absolute; bottom: calc(100% + 8px); left: 0;` with `overflow: hidden` and
  **no `max-height` and no `overflow-y`**, so it grows upward without limit and the
  viewport clips it. The item itself is `frontend/src/lib/components/HudOverlay.svelte:546`.
- Proposed fix: `max-height: calc(100dvh - 44px - 16px); overflow-y: auto;` on
  `.hud-menu`, which is what the native pass proposed and what
  `IntroSplash.svelte:68-69` already does for the rules card. Confirm afterwards that
  the paytable row is reachable, because a scroll box whose first row starts above the
  fold still needs a scroll affordance (cluster 3).

## STC-POPOUTS-1-03 STREAM The splash's own call to action is rendered off the bottom of the viewport, so the first surface a viewer sees carries no instruction
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/158_popout-s_splash.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/157_popout-s_transition_splash_entrance.png`
- Claim: `HeroSplash.svelte:70` renders `<div class="press-prompt">{t($locale,
  'splashPressAnywhere', mode)}</div>` as the second child of the splash. It does not
  appear anywhere in either frame. Measured at threshold 120, the logo mark's bright
  pixels occupy x `768` to `2068` and y `7` to `1359`; below y `1359` the frame is empty
  to the bottom edge, `241` px of nothing, and the brightest pixel in that band is
  backdrop noise. The arithmetic says where the prompt went: `.hero-splash` is a centred
  column flex with `gap: 1.4rem` and `overflow: hidden`
  (`HeroSplash.svelte:74-87`), and `.emblem-stage` is `width: min(62vw, 380px);
  aspect-ratio: 1 / 1` (`HeroSplash.svelte:90-94`). At `400 x 225`, `62vw` is `248` px, so
  the stage alone is `248` px tall in a `225` px viewport. Stage plus gap plus prompt is
  about `286` px of content centred in `225`, which puts the prompt's top at about native
  y `240`, fifteen pixels below the bottom of the screen, and `overflow: hidden` removes
  the evidence.
  The same arithmetic explains the mark's position: it lands `1.0` native px from the
  top edge and `33.9` native px from the bottom, a `34` to `1` asymmetry on an element
  that is horizontally centred to `4` upscaled px, which is half a native pixel. One axis
  is exact and the other is not centred at all.
- Resolution note: VISIBLE AT BOTH that the band below the mark is empty. NEW AT 1600PX
  that the horizontal centring is exact to half a native pixel, which is the evidence
  that the vertical offset is a clipped overflow and not an art choice.
- Where fixable: `frontend/src/lib/components/HeroSplash.svelte:90-94` (`.emblem-stage`
  sizing) with `frontend/src/lib/components/HeroSplash.svelte:74-87` (`.hero-splash`
  centring and `overflow: hidden`). Not locked.
- Proposed fix: clamp the stage on the short axis as well as the long one, for example
  `width: min(62vw, 62vh, 380px)`, so the stage plus gap plus prompt fits `100dvh` and
  the prompt is on screen. Then re-capture the splash: a hero screen whose only
  instruction is below the fold is a first-impression defect, not a polish item.

## STC-POPOUTS-1-04 STREAM The intro rules Continue button is drawn over its own body copy
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/160_popout-s_intro_rules.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/159_popout-s_transition_splash_to_rules.png`
- Claim: the `Continue` button occupies about x `849` to `1997`, y `1127` to `1418`, and
  the second bullet runs underneath it. What is readable is `all later w`, then the
  button, then `ring the`, with `feature.` on the line below, so a `1148` px wide bite is
  taken out of two consecutive text lines. This is the first interactive screen in the
  game and it is gated before the first spin, so every viewer sees it.
  The source records that this surface was already fixed once for this exact viewport.
  `IntroSplash.svelte:52-65` documents R14: at `400x225` the card was 399 px tall in a
  225 px viewport and the button was below the fold and genuinely unreachable. The fix
  capped the card and made the button `position: sticky; bottom: 0`. That made the button
  REACHABLE and left it PAINTED OVER the copy, because `align-self: center`
  (`IntroSplash.svelte:130`) keeps it a centred pill rather than a full width footer row,
  so the scrolling text passes under it on both sides and behind it in the middle.
- Resolution note: VISIBLE AT BOTH
- Where fixable: `frontend/src/lib/components/IntroSplash.svelte:125-130`. Not locked.
- Proposed fix: make the sticky element a full width footer row that carries the card's
  own opaque background across the full content width, so the copy is scrolled clear of
  it rather than hidden under it. Remove `align-self: center` and centre the label inside
  a full width row instead.

## STC-POPOUTS-1-05 HIGH The browser's own default focus ring ships on the primary controls, and it does not clear when the control comes to rest
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/163_popout-s_transition_reels_accelerating.png`, `.../164_popout-s_transition_reels_full_speed.png`, `.../165_popout-s_dead_spin_1_settled.png`, `.../166_popout-s_dead_spin_2_settled.png`, `.../167_popout-s_dead_spin_3_settled.png`, `.../168_popout-s_win_presentation.png`, `.../169_popout-s_transition_bigwin_countup_early.png`, `.../170_popout-s_transition_bigwin_countup_late.png`, `.../171_popout-s_bigwin_settled.png`, `.../172_popout-s_transition_menu_opening.png`, `.../173_popout-s_hud_menu.png` (all under `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`)
- Claim: sampled at `(2472, 1450)` and `(2478, 1450)`, just outside the spin control's
  own cyan stroke, the pixels read `(224, 235, 249)` then `(0, 95, 204)` on frames `163`,
  `165`, `168` and `171`, and `(7, 69, 77)` then `(1, 193, 199)`, which is the control's
  own border and the bar behind it, on frame `162`. `rgb(0, 95, 204)` is Chrome's
  `-webkit-focus-ring-color`, and the white outer stroke beside it is the second half of
  that two tone ring. So a user agent focus ring appears on the spin control the moment
  it is first pressed and is still there, pixel for pixel, on every settled frame that
  follows: the spin button region of frames `165` and `167` is IDENTICAL, `0` of `27,750`
  sampled pixels differ at any threshold. In frame `173` the same pair `(0, 95, 204)` /
  white appears at `(336, 1450)` on the menu button and is gone from the spin control, so
  the ring is following focus, not decorating a state.
  The measurement confirms a derivation rather than discovering it, per convention (l.2):
  `frontend/src/app.css:160-163` is `button:focus, button:focus-visible { outline: 4px
  auto -webkit-focus-ring-color; }`. The `:focus` half is why it survives a mouse press,
  and the declared colour is exactly the colour measured.
  **This widens charter row Q-27.** `KNOWN_OPEN.md` enumerates the Vite scaffold
  remnants in `app.css` as "stock indigo link colours, `background-color: #242424`,
  scaffold body centring" and calls that visible "only if any link or unstyled surface
  reaches a frame". The focus ring is a fourth scaffold remnant from the same block, it
  is not in that enumeration, and it reaches nine of my seventeen frames. This is the
  same shape as MID-02 widening Q-26: a row written to record an incomplete sweep was
  itself incompletely swept.
- Resolution note: NEW AT 1600PX. The native pass saw a ring on the two spin transition
  frames and recorded at LOW that it was absent at rest, which the colour probe refutes.
  At native the ring is a 1 px lighter edge on a 4 px border.
- Where fixable: `frontend/src/app.css:160-163`. Not locked.
- Proposed fix: delete the whole scaffold block `app.css:146-163` (`button`,
  `button:hover` with its `#646cff`, and the focus rule), since the game styles every
  button itself, and re append Q-27 with this instance so the row's enumeration is
  complete. If any focus ring is wanted, use the project's own pattern, which already
  exists at `HudOverlay.svelte:1057-1060` (`:focus-visible` with `outline: 2px solid
  var(--sig-cyan)`).

## STC-POPOUTS-1-06 HIGH The HUD menu panel is a fixed 200 px box, so its left padding is 106 px and its right padding is 829 px
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/173_popout-s_hud_menu.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/172_popout-s_transition_menu_opening.png`
- Claim: the panel's fill runs x `334` to `1738`, an inner width of `1404` px, which is
  `197.5` native px. Every label begins at x `440`, so left padding is `106` px. The
  longest label, `MAX BET`, ends at x `909`, so right padding is `829` px. The ratio is
  `7.8` to `1`, and the content occupies `33` per cent of the panel's width. The rest is
  flat unlit fill sitting over the board.
  The width is not content driven: `.hud-menu` declares `min-width: 200px`
  (`HudOverlay.svelte:1602`) and the measured `197.5` native px is that minimum less its
  border, so the panel is at its floor and the emptiness is the floor being too wide for
  this viewport rather than the labels being short.
  Second order effect from the same number: the panel covers x `334` to `1738` of a reel
  frame that spans about `554` to `2300`, leaving a `562` px sliver of board visible on
  the right, roughly one symbol column. It neither clears the board nor covers it.
- Resolution note: NEW AT 1600PX. At native the panel is 197 px wide and its labels are
  4 to 5 px tall; a 106 against 829 padding ratio is 15 against 117 native px and the
  right hand figure is indistinguishable from "the panel is wide".
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1598-1607`, specifically
  the `min-width: 200px` at `:1602`. Not locked.
- Proposed fix: make `min-width` responsive, for example `min-width: min(200px, 60vw)`,
  in the same short viewport branch that the `max-height` fix from finding 02 needs. One
  media block can carry both.

## STC-POPOUTS-1-07 HIGH One of five menu rows is indented exactly 28 native px past the other four, and the two rows that carry icons put them on opposite sides of the label
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/173_popout-s_hud_menu.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/172_popout-s_transition_menu_opening.png`
- Claim: measured left edges, threshold sum 200, in the upscaled frame: `Session` `440`,
  `AUTO` `440`, `MAX BET` `440`, `Mute` `440`, and `Speed` `640`. The indent is `200`
  upscaled px, which is `28.13` native px. `Speed`'s icon occupies x `454` to `544`, so
  even the icon does not sit on the shared `440` edge; the row aligns with nothing.
  `Mute` inverts the convention: its label runs `440` to `682` and its speaker icon
  follows at `768` to `832`. One five item menu therefore uses a leading icon, a trailing
  icon and no icon at all, and the single column edge it has is broken by the one row
  that is meant to be the most legible.
  The derivation matches the measurement to a tenth of a pixel, per convention (l.2):
  `.m-turbo-item` is `display: flex; gap: 0.5rem` (`HudOverlay.svelte:1632-1636`) and
  `.m-turbo-bolt` is `width: 20px` (`HudOverlay.svelte:1637`), so the label is displaced
  by `20 + 8 = 28` px inside the shared `0.9rem` row padding. Measured `28.13`.
  A smaller companion figure, recorded because it is exact rather than because it is
  large: the label baselines are `Session` `178`, `AUTO` `662`, `MAX BET` `889`, `Mute`
  `1131`. Three of the four gaps are `242` px and one, `AUTO` to `MAX BET`, is `227`.
- Resolution note: VISIBLE AT BOTH. The native pass measured `x=62` for the four aligned
  labels and `x=90` for `Speed` and got both right; my `440` and `640` are `61.9` and
  `90.0` native. This is the clearest case in my range of a native claim that survives
  full resolution intact.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1609-1619`
  (`.hud-menu-item`) and `:1632-1637` (`.m-turbo-item`, `.m-turbo-bolt`). Not locked.
- Proposed fix: give every `.hud-menu-item` a fixed 28 px leading icon slot, empty on the
  rows that have no icon, and move `Mute`'s speaker into that same slot. One shared
  gutter, one column edge, and the `Speed` row stops being the exception.

## STC-POPOUTS-1-08 HIGH The turbo row's state cue degrades at this viewport to a single 3 px bar at the panel edge, which is the one part of it the source did not intend to carry the message
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/173_popout-s_hud_menu.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/172_popout-s_transition_menu_opening.png`
- Claim: a warm bar occupies x `340` to `375`, y `264` to `503`, `35 x 239` px, sitting
  `6` px inside the panel's left fill edge with nothing else on that row until the
  lightning icon at x `454`. Its peak colour is `(69, 54, 49)`, a sum of `172` out of
  `765`. There is no counterpart anywhere to its right: across y `264` to `503` the
  brightest column between x `960` and `1738` sums to `49`, which is panel fill and the
  panel's own right edge. Its vertical centre, `383.5`, matches the `Speed` row's content
  centre, `384.5`, so it belongs to that row.
  It is `.m-turbo-item[data-speed="normal"] { background: rgba(0, 0, 0, 0.22); box-shadow:
  inset 3px 0 0 rgba(255, 200, 150, 0.26); }` at `HudOverlay.svelte:1640-1642`. The bar
  is the `inset 3px` leading edge, and `35` upscaled px is `4.9` native px, which is that
  3 px plus antialiasing.
  **The defect is that the row fill it is supposed to sit inside is invisible here.**
  `HudOverlay.svelte:1622-1631` records the design decision in its own words: the
  intensity was moved off the bolt and onto the row because a cue on the bolt alone
  measured `1.014:1` and `1.030:1` of contrast, and "a cue that only a measuring
  instrument can find is not clearly distinguishable at a glance". But the row fill is
  `rgba(0, 0, 0, 0.22)` laid over `.hud-menu`'s `rgba(6, 6, 18, 0.96)`
  (`HudOverlay.svelte:1603`), which is black over near black. So at this viewport the
  whole cue collapses back to the leading edge, and what a viewer sees is a stray warm
  tick against the panel wall. The fix that was applied to stop the cue being
  instrument only has itself become instrument only in the `normal` state.
  I record plainly that my own first reading of this, before I opened the source, was
  that it was a clipped border fragment. It is not; it is deliberate, and it is failing.
- Resolution note: NEW AT 1600PX. At native this is a 5 x 34 px warm smudge at the panel
  edge, indistinguishable from a border highlight.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1640-1642`, with the
  intent recorded at `:1622-1631`. Not locked.
- Proposed fix: give the `normal` tier a fill that is actually lighter than the panel it
  sits on rather than a 22 per cent black over a 96 per cent black panel, or drop the
  `normal` tier's fill and leading edge entirely so the row reads as plain until turbo is
  engaged. Either way, re-measure the adjacent state contrast at `400x225` and not only
  at desktop, because that is the viewport where the current answer fails.

## STC-POPOUTS-1-09 HIGH The win line detail strip is set at about 3.7 native px of glyph height, is unreadable at 1600 px, and consumes the reel frame's bottom padding
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/170_popout-s_transition_bigwin_countup_late.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/171_popout-s_bigwin_settled.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/173_popout-s_hud_menu.png`
- Claim: a dark rounded strip runs from about x `660` to `2230`, with its top highlight
  stroke at y `1116` and its content band at y `1128` to `1179`. Its glyph strokes
  measure `26` to `30` px, which is `3.7` to `4.2` native px. It carries four separate
  fields in three colours. **Upscaling cannot add detail that was never captured, so a
  string that is unresolvable in the upscale was rendered below any legibility
  threshold**: I can see that there are four fields and that one is gold and one is cyan,
  and I cannot transcribe a single one of them, which is the finding rather than a
  limitation of it.
  Placement compounds it. `.wb` is `position: absolute; bottom: 6px`
  (`WinBreakdown.svelte:115-117`), so the strip sits in the gap between the bottom row of
  cells and the reel frame's neon inner edge. Measured, the neon inner edge begins at y
  `1184` and the strip's fill ends at about y `1180`: `4` px of clearance, half a native
  pixel. The frame's internal padding is fully consumed on that one side and untouched on
  the other three.
- Resolution note: NEW AT 1600PX for the measurement. The strip's existence was VISIBLE
  AT BOTH.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:117` (`bottom: 6px`),
  `:136` (`font-size: 0.7rem`) and `:146` (`.wb-ways` at `font-size: 0.62rem`). There is
  no short viewport branch in that file. Not locked.
- Proposed fix: hide the breakdown below a minimum viewport height rather than shrinking
  it further, which is what the native pass proposed and what the measurement supports:
  at `0.62rem` on this stage scale the smallest field is under 4 native px and no font
  size change recovers that. The information is already in the HUD's WIN pod.

## STC-POPOUTS-1-10 HIGH The big win band hides two of the four grid rows and its hairlines cut the reel frame's side rails, so the frame reads as two disconnected pieces
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/169_popout-s_transition_bigwin_countup_early.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/170_popout-s_transition_bigwin_countup_late.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/171_popout-s_bigwin_settled.png`
- Claim: measured on frame `171` at x `60`, well outside the reel frame, the band's two
  cyan hairlines are at y `348` and y `915`, so the band is `567` px tall, 35 per cent of
  the frame height, and it reaches both viewport edges: at y `348` the pixel at x `0` is
  `(15, 69, 81)` and at x `2843` it is `(13, 90, 103)`.
  **Full bleed is sanctioned and is not the finding.** `WinBanner.svelte:339-341` records
  it as an owner audit round 2 decision, in its own words a "full-width neon band, stage
  edge to edge... no longer a centred box, so reels stay visible above and below".
  The finding is that the stated goal does not survive this viewport. Grid rows 2 and 3
  of 4 are entirely inside `348..915`, so what stays visible above and below is one row
  each. And because the band is edge to edge while the reel frame is not, the two
  hairlines pass straight through the frame's metallic side rails and continue off both
  edges, so for the whole celebration the machine reads as a top fragment and a bottom
  fragment with a strip laid across the middle. Outside the frame the band is flat fill:
  about `554 x 567` px on the left and `540 x 567` px on the right, roughly `620,000` px
  or 13 per cent of the frame, carrying nothing but a few particles.
- Resolution note: VISIBLE AT BOTH for the band bisecting the machine. NEW AT 1600PX for
  the hairlines cutting the rails and for the two flanks being measurable.
- Where fixable: `frontend/src/lib/components/WinBanner.svelte:342-352`
  (`.big-win-banner`, `left: 0; right: 0; top: 310px; width: 100%`). Not locked.
- Proposed fix: PARK(the band's shape is an owner decision with its reasoning on the
  record, so the direction is an art call, not a mechanical one). Two options for the
  owner: (a) inset the band to the reel frame's own width at short viewports so its
  hairlines terminate on the rails instead of crossing them; (b) reduce the band's height
  at short viewports so it covers one grid row rather than two, which is what "reels stay
  visible above and below" asks for. Option (b) preserves the sanctioned edge to edge
  read; option (a) does not.

## STC-POPOUTS-1-11 MEDIUM The reel frame clears the top of the viewport by 1 native px and the control bar by half a native pixel, while 1094 px of backdrop sits unused either side
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/162_popout-s_base_idle.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/164_popout-s_transition_reels_full_speed.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/161_popout-s_transition_rules_to_base.png`
- Claim: the reel frame's metallic bound runs y `7` to `1284`. The control bar's top edge
  is at about y `1288`, measured as the row where the bar's cyan rule falls away at x
  `1400`. So the frame clears the top of the screen by `7` px, which is `1.0` native px,
  and clears the control bar by `4` px, which is `0.6` native px. Horizontally it leaves
  about `554` px of bare backdrop on the left and `540` on the right, `1094` px of
  surplus, 38 per cent of the frame width. The board has been scaled until the vertical
  axis has no clearance at all while more than a third of the width goes unused, which is
  the signature of a fit rule that stopped at a width constraint.
- Resolution note: NEW AT 1600PX. A 7 px gap is one native pixel and cannot be told from
  a clean bleed in a 120 to 334 token image.
- Where fixable: UNKNOWN. I spent my six source files on findings 02 through 09 and did
  not locate the stage fit rule.
- Proposed fix: PARK(needs the stage fit rule located first; the honest statement is the
  measurement, not a guess at the declaration that produced it).

## STC-POPOUTS-1-12 MEDIUM The on board WIN! callout has no plate and lands one pixel off the cell border beneath it
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/168_popout-s_win_presentation.png`
- Claim: the callout `WIN!` occupies x `1289` to `1515`, y `600` to `654`, `226 x 54` px.
  It has no plate, no halo and no backing; it is type laid directly on the grid, over the
  piston tile in column 3 row 2. Probing the column at x `1400`, the glyph pixels run to
  y `652` and the highlighted cell's top border begins at y `655`, peaking `(5, 233, 233)`
  at y `657`: **3 px of clearance, which is 0.4 native px.** Its centre, x `1402`, is `20`
  px left of the frame centre `1422`.
  It also carries no figure. The amount `$3.90` appears only in the control bar's WIN pod
  at the far right of the frame, so the element in the middle of the board announces that
  a win happened and does not say what it was worth.
- Resolution note: NEW AT 1600PX for the 3 px clearance and for the absence of a plate.
  The callout itself was VISIBLE AT BOTH.
- Where fixable: UNKNOWN. `lib/i18n/translations.ts:223` holds the string
  (`winFlash: 'WIN!'`); I did not locate its component within my six file budget.
- Proposed fix: give the callout a backing plate and offset it clear of the cell border
  it currently sits on, or fold the amount into it so the largest surface in the game
  carries the figure the moment exists to show.

## STC-POPOUTS-1-13 MEDIUM Non winning cells dim to near zero during the win presentation, so the board reads as mostly empty for the whole of every win
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/168_popout-s_win_presentation.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/170_popout-s_transition_bigwin_countup_late.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/171_popout-s_bigwin_settled.png`
- Claim: on frame `168`, seven of the twenty cells are highlighted and the other thirteen
  are dimmed to the point that their symbols are only just separable from the cell fill;
  the hexagon at column 1 row 3, the gauge at column 3 row 4 and the ID card at column 4
  row 4 are ghosts. On `170` and `171` it is stronger: of the ten cells not hidden by the
  celebration band, one is lit and nine are near black, so the board the celebration is
  celebrating is visually empty behind it. A dim of this depth turns the game's largest
  surface into dead area for the duration of every win, which is the opposite of what a
  win presentation is for.
- Resolution note: NEW AT 1600PX. At thumbnail scale the dimmed cells simply read as
  dark, and the residual symbol detail that proves they are drawn rather than cleared is
  not resolvable.
- Where fixable: UNKNOWN
- Proposed fix: PARK(the dim depth is an art call). State the intended floor as a
  measured opacity and check it at this viewport, because the surrounding scene is
  brighter here than the cell fill and that is what makes the dimmed cells read as holes.

## STC-POPOUTS-1-14 MEDIUM The control bar's two end margins differ by a factor of 2.1
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/162_popout-s_base_idle.png`
- Claim: scanning row y `1440`, the settings button's magenta stroke peaks `(101, 2, 106)`
  at x `32` and its outer edge is x `27`; the spin button's cyan stroke peaks
  `(1, 193, 198)` at x `2784` and its outer edge is x `2787`. So the left margin is `27`
  px and the right margin is `57` px, `3.8` against `8.0` native px on a row that reads
  as one edge to edge strip. The vertical margins are tight in the same way: the settings
  button's lower edge sits about `21` px above the viewport bottom.
  I state the size honestly: `4` native px of difference is small, and this is recorded
  at MEDIUM for that reason, not at HIGH. It is included because it is exact and because
  it is free to fix once the bar is being touched for anything else.
- Resolution note: NEW AT 1600PX. Both margins are under 8 native px.
- Where fixable: UNKNOWN
- Proposed fix: PARK(needs the bar's padding declaration located; not worth a source
  file of its own at this severity).

## STC-POPOUTS-1-15 MEDIUM Three consecutive dead spins land the identical twenty symbols, and the frame labelled full speed is already 96 per cent of the settled result
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/165_popout-s_dead_spin_1_settled.png`, `.../166_popout-s_dead_spin_2_settled.png`, `.../167_popout-s_dead_spin_3_settled.png`, `.../164_popout-s_transition_reels_full_speed.png`
- Claim: comparing the reel window per column, at difference threshold 40 and sample step
  2, the percentage of pixels that change is:

  | column | 164 to 165 | 165 to 166 | 166 to 167 |
  |---|---|---|---|
  | 1 | 0.25 | 0.53 | 0.53 |
  | 2 | 0.01 | 0.12 | 0.08 |
  | 3 | 0.00 | 0.01 | 0.01 |
  | 4 | 0.01 | 0.00 | 0.00 |
  | 5 | 9.22 | 0.00 | 0.00 |

  So dead spins 1, 2 and 3 land the same twenty symbols in the same twenty cells; the
  residual half per cent in column 1 is the animated glow on the wheel symbol. And at the
  frame the manifest calls "Reels at full speed", four of the five reels have ALREADY
  stopped on their final symbols and only reel 5 is still moving. A viewer watching three
  spins in a row sees the same board three times.
- Resolution note: VISIBLE AT BOTH that the boards repeat. NEW AT 1600PX for the per
  column decomposition, which is what separates "reel 5 was still moving" from "nothing
  moved".
- Where fixable: UNKNOWN
- Proposed fix: PARK(the capture harness's round feed must be checked before this is
  called a rendering defect; a fixed demo feed would produce exactly this).

## STC-POPOUTS-1-16 MEDIUM The first board a viewer sees is twenty copies of one symbol, drawn at a different symbol scale from every later board
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/162_popout-s_base_idle.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/161_popout-s_transition_rules_to_base.png`
- Claim: in base idle, straight after the rules gate is dismissed and before the first
  spin, all twenty cells carry the identical piston symbol. Each cell is about `267 x 233`
  px and the piston inside it is about `64 x 142` px, so the symbol covers about `10` per
  cent of its cell. On `164_popout-s_transition_reels_full_speed.png` the same cells carry
  eight different symbols at roughly `170 x 170` px, about `47` per cent of the cell. So
  the idle board is not merely repetitive, it is drawn at a different and much smaller
  symbol scale, which is what turns "an odd board" into "a placeholder grid".
- Resolution note: NEW AT 1600PX. The repetition was VISIBLE AT BOTH; the two different
  symbol scales, which is the part that makes the diagnosis, needs the upscale.
- Where fixable: UNKNOWN
- Proposed fix: PARK(same precondition as finding 15: establish whether the idle board
  comes from a real feed or a default array before treating the scale difference as a
  rendering defect).

## STC-POPOUTS-1-17 LOW The menu's mid open transition frame is pixel identical to the settled menu
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/172_popout-s_transition_menu_opening.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/173_popout-s_hud_menu.png`
- Claim: across the panel region x `334` to `1738`, y `0` to `1230`, sampled at step 3,
  `0` of `191,470` pixels differ by more than `8`, and the maximum delta anywhere is `8`,
  which is resampling noise. The frame the manifest labels "HUD menu mid-open" shows a
  fully open panel identical to the settled state. Recorded at LOW and under composition
  only because it means every composition claim in findings 02, 06, 07 and 08 holds for
  both frames rather than one; the timing question belongs to the motion lens.
- Resolution note: NEW AT 1600PX
- Where fixable: UNKNOWN
- Proposed fix: PARK(belongs to a motion lens, not this one).

## STC-POPOUTS-1-18 LOW The celebration ring is an unskinned hairline circle that leaves the band on both sides
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/169_popout-s_transition_bigwin_countup_early.png`
- Claim: a single hairline circle about `700` px across is centred near x `1415`, y `625`.
  Its top crosses the band's upper hairline at y `348` and reaches into the top row of
  symbols; its bottom crosses the lower hairline at y `915` and reaches into the bottom
  row. It is drawn in a desaturated grey that appears nowhere else in the celebration and
  it passes behind `BIG WIN` and through `16x BET`. It is on the count up early frame and
  not on the settled one, so it is a transient. An expanding ring that leaves its own band
  on both sides, in a colour the band does not use, reads as an effect primitive that was
  never skinned.
- Resolution note: NEW AT 1600PX. The ring is a sub pixel grey stroke at native.
- Where fixable: UNKNOWN
- Proposed fix: PARK(one frame of a transient; hand to the motion lens with this
  measurement attached rather than treating it as a static composition defect).

## Native pass reconciliation

`STC-POPOUTS-B.md` covers frames 183 to 207 and does not intersect my range at all, so
none of its thirteen findings is mine to reconcile. From `STC-POPOUTS-A.md`, findings
A-02, A-05, A-09, A-10, A-12 and A-13 sit on frames 174 to 182 and belong to a sibling
squad; A-10 cites frame `160` only as a comparison and its subject is frame `180`, so it
too is out of range. The thirteen that fall inside 157 to 173 are below.

**A-01, the intro rules Continue button over the body copy: CONFIRMED.** The occlusion is
present at full resolution exactly as described, `1148` px of button across two text
lines, and the source confirms the mechanism they named. See my 04.

**A-03, the splash mark 1 px from the top with 34 px of empty frame below: CONFIRMED to
the pixel, and REFINED.** Measured at threshold 120 the mark occupies y `7` to `1359`,
which is native `1.0` to `191.1`: their `1` px top and `34` px bottom are both exact. My
own first visual estimate before measuring was `54` and `289` upscaled, and it was wrong;
the native pass's numbers are the right ones. The refinement is what belongs in that
34 px band: `HeroSplash.svelte:70` renders a `press-prompt` call to action that is not on
screen in either frame, so the empty band is not empty space, it is a missing element.
That upgrades the finding from HIGH to STREAM. See my 03.

**A-04, the HUD menu cut off with its first item entirely off screen and unreachable:
CONFIRMED, and REFINED by naming the item.** Their panel bounds `x=45..245, y=0..177`
measure at full resolution as `334..1738` and `0..1223`, which is native `47..244` and
`0..172`: agreement to within 2 native px on every edge. The item that is off screen is
the paytable, `HudOverlay.svelte:546`, and I can add the evidence that it is FULLY off
screen rather than half cut: across the panel interior above `Session` the maximum pixel
sum is `58` of `765`, so there is no partial letterform anywhere. See my 02.

**A-06, the Speed row's left edge: CONFIRMED, exactly.** Their measured `Session x=62`
and `Speed x=90` are my `440` and `640` upscaled, which are `61.9` and `90.0` native, and
their `28 px` indent is my `28.13`. Their reading of the cause is also right, and the
source arithmetic gives the same number independently: `20` px bolt plus `0.5rem` gap is
`28` px. This is the strongest survival in my range. See my 07.

**A-07, the big win banner as a full bleed band that bisects the reel machine: CONFIRMED,
and REFINED.** The band measures `348` to `915` and reaches both edges. The refinement is
that full bleed is not a defect: `WinBanner.svelte:339-341` records it as an owner audit
round 2 decision with its reasoning. What is reportable is that the decision's own stated
goal, reels visible above and below, degrades here to one row of four each way, and that
the band's hairlines cut the reel frame's metallic side rails. See my 10.

**A-08, the two HUD readout pods using different label to value gaps: CONFIRMED to one
decimal place.** Independently re-measured on frame `162` at threshold sum 210 across
y `1380..1500`: `BAL` native `88.3..104.9`, `$50K` `121.2..156.7`, `WIN` `177.2..191.8`,
`$0.00` `202.0..239.9`, against their `88..104`, `121..156`, `177..191`, `202..239`. The
derived gaps are `16.3` inside the balance pod, `10.1` inside the win pod and `20.5`
between the pods, against their `16`, `10` and `20`. Their conclusion, that the separator
is only about 4 px wider than the wider internal gap so proximity does not group the
pods, holds. I did not re-report it as a finding of my own because it survives unchanged
and re-reporting it would double count it in the ledger.

**A-11, the WIN! callout: CONFIRMED IN PART and REFUTED IN PART.** Confirmed: no plate,
no halo, drawn over symbol art, and I can add that it clears the cell border beneath it
by `3` px, which is `0.4` native px. **Refuted, first clause:** it is not drawn "across
its own win line". The callout's bbox is x `1289..1515`, y `600..654`; the diagonal win
line runs from about `(1436, 270)` to `(1706, 725)` and therefore sits at x `1648` at the
callout's mid height, `133` px clear of its right edge. Sampling x `1516..1720` across the
callout's y band finds a single win line pixel. **Refuted, second clause:** it is not "set
smaller than the HUD's own WIN label". `WIN!` occupies `226` px for four glyphs, `56.5` px
each; the HUD's `WIN` occupies `1260..1364`, `104` px for three glyphs, `34.7` px each. The
callout is about 63 per cent larger per glyph, not smaller. Both refuted clauses are the
kind of claim a thumbnail invites: at 400x225 the win line and the callout are a few
pixels apart and read as touching. See my 12.

**A-14, the reel window unchanged across full speed and all three settled dead spins:
CONFIRMED for the three dead spins, REFUTED for the full speed frame.** Per column at
threshold 40, `164` to `165` changes column 5 by `9.22` per cent while columns 1 to 4
change by `0.25`, `0.01`, `0.00` and `0.01`. So reel 5 was still moving at "full speed"
and the frame is not identical to the settled result. `165` to `166` and `166` to `167`
change no column by more than `0.53` per cent, so those three are the same board. Their
finding is right in substance and its frame list is one frame too long. See my 15.

**A-15, the reel window losing its cell backing during acceleration: CONFIRMED.** See my
01.

**A-16, mixed casing inside one five item menu column: CONFIRMED.** The menu reads
`Session`, `Speed`, `AUTO`, `MAX BET`, `Mute` at full resolution, so two sentence case,
two upper case, one sentence case. I did not re-report it because it is a typography and
voice claim rather than a composition one and it survives unchanged.

**A-17, the win breakdown strip too small to resolve: CONFIRMED, and REFINED with a
figure.** Glyph strokes measure `26` to `30` upscaled px, which is `3.7` to `4.2` native
px, and the strip clears the neon inner edge by `4` upscaled px. Their proposed fix, hide
it below a minimum viewport height rather than shrink it, is the one the measurement
supports. See my 09.

**A-18, the splash entrance frame indistinguishable from the settled splash: CONFIRMED,
with a refinement that strengthens it.** Whole frame at step 4, `0.41` per cent of pixels
differ by more than 8 with a maximum delta of `106`, so they are not byte identical. But
restricted to the logo region and threshold 40, only `0.002` per cent differ; the
difference is entirely in the backdrop, `0.655` per cent in the left band and `0.255` per
cent in the right. So the hero mark, which is what the entrance animates, is unchanged
between "mid entrance, about 600ms after load" and the settled state.

**A-19, a focus ring on the spin control during both spin transitions AND NOT AT REST:
REFUTED on its central clause, and materially understated.** They state the ring is
"absent from ... `165_popout-s_dead_spin_1_settled.png`". It is present. Probing
`(2472, 1450)` and `(2478, 1450)`: frame `163` reads `(224, 235, 249)` then `(0, 95, 204)`;
frame `165` reads `(224, 235, 249)` then `(0, 95, 204)`, identical; frame `162`, before
any press, reads `(7, 69, 77)` then `(1, 193, 199)`, which is the control's own stroke.
The spin button region of frames `165` and `167` differs by `0` pixels out of `27,750`
sampled. The ring is on nine of my seventeen frames on the spin control and on the menu
button in the other two, and `rgb(0, 95, 204)` is Chrome's `-webkit-focus-ring-color`,
declared at `app.css:162`. Their own proposed fix, use `:focus-visible` rather than
`:focus`, turns out to be exactly right and now has a file and a line: `app.css:160` is
`button:focus, button:focus-visible`. Recorded at LOW natively, this is HIGH and it
widens charter row Q-27. See my 05.

## Explicit absences, signed

**Two claims I made and then withdrew after measuring them.** Both were in my own first
draft, written from the frames before any pixel probe, and both are recorded here rather
than deleted, because a shard that only shows its survivors is not evidence of a
discipline.

1. *"The big win band's internal vertical padding is 50 px above the tier label against
   30 px below the unit line."* WITHDRAWN. Measured: the band runs y `348` to `915`,
   `BIG WIN`'s cap top is y `413` and `16x BET`'s glyph bottom is y `838`, so the padding
   is `65` above and `77` below, a `12` px difference which is `1.7` native px. The
   content block's centre is y `625.5` against a band centre of `631.5`. The band is
   vertically balanced and my eye was wrong about which way it was out.
2. *"An orphaned amber arc is clipped against the menu panel's left inner edge."*
   WITHDRAWN AS DIAGNOSED and rewritten as finding 08. It is neither orphaned nor
   clipped nor an arc: it is a straight `inset 3px 0 0` leading edge declared at
   `HudOverlay.svelte:1642`, `35` upscaled px wide, which is 3 px plus antialiasing. The
   real defect is a different one and it is smaller in extent and larger in meaning.

**Checked and found sound, so that the absence is a claim rather than a silence:**

- **Horizontal centring, everywhere I could measure it.** The splash mark's centre is
  x `1418` against a frame centre of `1422`, half a native pixel. The three big win
  content lines centre on `1415.5`, `1421.5` and `1418`. The reel frame centres on about
  `1429`. Every one of these is inside one native pixel and none is a finding. The
  vertical axis is where this build's composition fails, consistently, on four separate
  surfaces (splash, reel frame, menu panel, rules card), and it fails the same way each
  time: an element sized for a taller viewport, centred, and then clipped.
- **The grid's internal padding inside the neon frame**, on frames `162`, `164`, `165`,
  `166` and `167`: the first cell clears the neon inner edge by about `18` px on the left
  and the last by about `17` on the right, and the top and bottom clear by about `13`
  each. Symmetric within measurement error. Not a finding.
- **The bet stepper's symmetry about its own value** on frame `162`: the down control
  spans about `1806..1999` and the up control about `2262..2431`, against a value `$1.00`
  at about `2010..2250`. Gaps of about `11` and `12` px. Not a finding at this viewport.
  Recorded because the sibling shard reports the FEATURES menu stepper as grossly
  asymmetric (`STC-POPOUTS-B-05`) and the HUD stepper, which is a different instance of
  the same pattern, is not.
- **No money figure in my range is clipped, ellipsised or overflowing its pod.** `$50K`,
  `$0.00`, `$1.00`, `$3.90`, `$15.94`, `$10.27`, `$16.20` all render complete with
  clearance inside their pods, so `TR-115 / TR-086` is not re-observed on frames 157 to
  173.
- **No horizontal scrolling box, sliced glyph or hidden-content panel in my range.** The
  paytable frames where cluster 3 lives are `176` to `182`, outside this range. The one
  panel in my range that overflows, the HUD menu, overflows upward and off screen rather
  than into a scroll box, which is finding 02 and is a different failure.

**Not swept by me, named so nobody assumes coverage:** the reel window transparency's
owning layer (finding 01), the stage fit rule behind finding 11, the `winFlash` callout's
component (finding 12), the dim depth behind finding 13 and the control bar's padding
declaration behind finding 14 all carry `Where fixable: UNKNOWN`. I read six source files
and stopped, per the brief. Audio, timing, accessibility and the localised sessions are
outside this lens entirely.

## KNOWN matches

- **KNOWN(MID-01).** The banner count up and the HUD WIN pod show different amounts at
  the same moment. Fresh evidence at this viewport:
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/169_popout-s_transition_bigwin_countup_early.png`
  reads `$10.27` in the banner and `$15.94` in the HUD WIN pod on a win that settles at
  `$16.20`. `LEDGER.md` predicted the popout-s pair as frames `169` and `171` and gave
  the desktop instance as `$10.29` against `$15.95`; the popout-s instance is one cent
  lower on both, which is the same divergence sampled a fraction of a frame earlier. The
  settled frame,
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/171_popout-s_bigwin_settled.png`,
  reads `$16.20` in both. Not a new finding.
- **KNOWN(MID-02).** The win banner writes the multiplier with a letter `x`. Fresh
  evidence: the unit line reads `16x BET` on
  `.../169_popout-s_transition_bigwin_countup_early.png`,
  `.../170_popout-s_transition_bigwin_countup_late.png` and
  `.../171_popout-s_bigwin_settled.png`, all three legible at 1600 px. Not a new finding.
- **KNOWN(Q-27), widened.** My finding 05 lives in the same Vite scaffold block in
  `app.css` that Q-27 records, at `app.css:160-163`, and Q-27's enumeration does not
  contain it. Reported as a finding rather than only as a KNOWN because the point is that
  the row's list is incomplete, which is the same shape as MID-02 widening Q-26. The
  neighbouring `button:hover { border-color: #646cff; }` at `app.css:158-159` is a fifth
  scaffold remnant from the same block and is also absent from Q-27's list, though I saw
  no hover state on any frame in my range so I do not claim it is player visible.
- **NOT a KNOWN match, stated so the ledger does not merge them:** `TR-104` concerns the
  banner's tier label and unit rendering in English on German and Arabic sessions. My
  range is the English session, where `BIG WIN` and `BET` are correct, so `TR-104` is not
  observable here and nothing in my findings should be folded into it.

tree_after:
```
?? reports/qa/stream_test/shards/STC-MOBILEL-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-2.md
?? reports/qa/stream_test/shards/STC-POPOUTS-3.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STT-POPOUTS-1.md
?? reports/qa/stream_test/shards/STT-POPOUTS-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-3.md
```
Every line is `??`, untracked. Nothing shows as MODIFIED or DELETED, so this squad
dirtied nothing. `STC-POPOUTS-1.md` is mine; the other seven are sibling squads' shards
written concurrently and are not mine to touch. `reports/screens/` is untouched, and no
project script was run: every figure above came from reading the PNGs directly.
