# STC-MOBILES-1, COMPOSITION (mobile-s, frames 312 to 329, 1600px upscaled)
supersedes: STC-MOBILES-A.md (frames 312 to 337; frames 330 to 337 belong to a sibling squad and are untouched here)
scope: every `mobile-s` frame numbered 312 to 329 inclusive, 18 frames, covering the splash entrance and splash, the splash to rules transition, the intro rules card, the rules to base transition, base idle, both spin transitions, the three dead spins, the win presentation, the big win triple, the HUD menu opening and settled, and the session panel.
frames_read: 18

**Measurement basis, stated once so every figure below can be checked.** Native viewport
is 320x568. The upscaled frames are 901x1600, so the scale factor is 1600/568 = **2.8156**.
Every figure is given in pixels of the UPSCALED frame first, with the native equivalent in
brackets. Pixels were decoded from the PNGs with a scratch zlib/PNG reader in the session
scratchpad, not estimated by eye. Where a claim rests on a colour, the RGB triple is
transcribed verbatim.

**Two findings were withdrawn at the source-location step and are recorded as withdrawals
rather than deleted.** In both cases the source states the intent, the measurement was a
proxy for something else, and convention (l.2) makes the specification the authority. See
the signed absences. A third was downgraded for the same reason. This is the point of the
re-run working in both directions.

---

## STC-MOBILES-1-01 STREAM The big win band is full bleed at 320px: it covers the reel frame's rails at both edges and hides the middle two of four grid rows
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/324_mobile-s_transition_bigwin_countup_early.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/325_mobile-s_transition_bigwin_countup_late.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/326_mobile-s_bigwin_settled.png`
- Claim: on `326` the band's upper neon rule is at y=314 and its lower rule at y=576, a height of **262 px (93 px native)**, and both rules run the full width of the frame: the pixel at x=0,y=314 reads `(1, 241, 243)` and the pixel at x=900,y=314 reads `(1, 241, 242)`, and at y=576 both ends read `(0, 252, 252)`. The reel window's own vertical neon border, measured on `317`, sits at x=51 and x=847, so the band **overshoots the window it is drawn inside by 51 px on the left and 53 px on the right (18 px native each side)** and runs out over the metal side rails to the viewport boundary.

  The rails are covered, not dimmed, and the comparison proves it. At y=422, which is inside the band, frame `317` reads `(226, 229, 230)` at x=0, `(225, 228, 230)` at x=5 and `(107, 114, 117)` at x=880. At the same three pixels frame `324` reads `(12, 32, 46)`, `(12, 33, 45)` and `(12, 19, 34)`, and `326` reads `(12, 33, 46)`, `(12, 32, 46)` and `(13, 20, 34)`. A dim would scale the rail's luminance; this replaces it.

  Vertically the band sits **inside** the reel window, spanning native y=111.5 to y=204.6 of a window whose four tile rows on `326` are bounded at y=206, 325, 452, 578 and 715 (upscaled, measured on the reel 3 column at x=512). Rows 2 and 3 are therefore entirely behind the band and rows 1 and 4 are left as two detached strips, at the most watched moment in the game, on the narrowest viewport the project declares support for.

  **The intent is declared and the declaration is the reason this is parked, not dismissed.** `frontend/src/lib/components/WinBanner.svelte:339-341` records the band as a *"full-width neon band, stage edge to edge, vertically centred on the grid at stage y=310"* attributed to OWNER AUDIT ROUND 2 item 2, and `:502-506` records the band's outer background as *"still spans the full 1280 stage-coordinate width (bleeding past the cropped portrait viewport's edges either side, same as every other LAYOUT_SPEC stage element)"*. What that comment goes on to fix at `:513` is the CONTENT row only: the `@media (max-width: 500px)` block restacks the tier label, amount and multiplier and never touches the band's extent. So the narrow-viewport case was looked at, and the question of whether a sanctioned full bleed may cover the frame chrome and half the grid at 320x568 was not the question being answered.
- Resolution note: VISIBLE AT BOTH
- Where fixable: `frontend/src/lib/components/WinBanner.svelte:342-352` (`.big-win-banner`, the `left: 0; right: 0; width: 100%; top: 310px` rule) and `frontend/src/lib/components/WinBanner.svelte:513-515` (the existing `@media (max-width: 500px)` block, which is where a band-extent override would go). Not locked.
- Proposed fix: PARK(the full bleed is a recorded owner decision on a celebration surface, so narrowing it at 320px is the same art call and belongs to the owner). Options for the owner: (a) leave as is; (b) inset the band to the reel window's inner width inside the existing 500px breakpoint so it cannot cover the frame chrome; (c) reduce `.tier-big .fs-face`'s `min-height` at short viewports so the band hides one grid row rather than two.

## STC-MOBILES-1-02 HIGH The win line detail strip is painted over the reel window's own bottom border, and its type measures 4.3px native cap height
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/325_mobile-s_transition_bigwin_countup_late.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/326_mobile-s_bigwin_settled.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/327_mobile-s_transition_menu_opening.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/328_mobile-s_hud_menu.png`
- Claim: the strip renders `M2  x5  8 ways  $16.20` on `326` and `L3  x4  1 ways  $0.20` on `325`, `327` and `328`. Measured at x=200 on `326` it occupies **y=700 to y=739** (native y=248.6 to 262.5), and its glyph ink occupies **y=716 to y=728**, a cap height of **12 px, which is 4.3 px native**.

  **The part the native pass could not see.** The clean frame `320` carries no strip, and at the same column x=200 the reel window's cyan bottom border rises from y=710, peaks at `(191, 231, 246)` across y=728 to y=730, and fades out by y=742. The strip's band on `326` is y=700 to 739. The strip is therefore drawn **over the peak of the window's own bottom border**, breaking that border across its full span, and its top edge also cuts the last 7 px of the row 4 tiles. It is not sitting in a gap between the window edge and the chrome rail; there is no gap there, there is a border, and the strip is on top of it.

  Horizontally the strip runs x=82 to x=824 (native 29 to 293), so it also does not share an edge with anything: the reel window's neon borders are at x=51 and x=847 and the tile block starts at x=75.

  Derived from source and it closes. `frontend/src/lib/components/WinBreakdown.svelte:114-118` places it with `position: absolute; left: 50%; bottom: 6px; transform: translateX(-50%)` inside the scaled grid, so its distance from the window's bottom edge is 6 stage px shrunk by the stage scale, which is why it lands on the border rather than below it. The type is `font-size: 0.7rem` at `:136` with `.wb-ways` at `0.62rem` at `:146`, and the whole element sits inside `.grid-scale`, `frontend/src/App.svelte:2768-2773`, which is itself inside the stage transform `transform: scale(var(--S, 1))` at `frontend/src/App.svelte:2200` fed by `--S` at `:1706`. A fixed rem size inside two nested scale transforms is how 11.2 CSS px becomes 4.3 device px.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:114-122` for the placement and `:136` plus `:146` for the type size. Not locked.
- Proposed fix: move the strip out of the scaled grid so its type is set in real pixels, give it a floor of about 11 px native at narrow viewports, and anchor it below the frame rather than 6 stage px above the window's own bottom edge. Four pixels of cap height survives neither a stream encoder nor a viewer, and the slot it is given cannot hold anything larger.

## STC-MOBILES-1-03 HIGH The HUD menu panel leaves a 48px native strip of undimmed HUD lit down its right side, and is inset 12px on the left against 61px on the right
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/327_mobile-s_transition_menu_opening.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/328_mobile-s_hud_menu.png`
- Claim: on `328` the panel's borders measure **x=34 and x=730** and **y=951 to y=1378**, so the panel is 696 px wide (**247 px native**). The BALANCE and WIN pod row on `317` measures x=34 to x=866 and the BET row measures x=37 to x=863, both **832 px wide (295 px native)**. A vertical strip of **136 px (48 px native)** of the HUD is therefore left uncovered down the panel's right side, and it is not dimmed: the WIN pod's magenta right border at x=866 and the right end of the `$16.20` figure are at full strength beside the panel, and the BET row's `+` stepper plate (x=701 to 825 on `317`) is left lit and tappable beside a menu that is meant to be modal.

  Stated as composition rather than as behaviour: the panel is inset **34 px (12 px native)** from the left viewport edge, matching the HUD's own gutter exactly, and **171 px (61 px native)** from the right, matching nothing. The panel's right edge lands two thirds of the way across the WIN pod, so the pod is cut in half by an overlay edge.

  Derived: `.hud-menu` is `position: absolute; left: 0; min-width: 200px` with **no `right`** at `frontend/src/lib/components/HudOverlay.svelte:1598-1608`, and the portrait override at `:1115` is `.m-hud-menu { bottom: 44px; left: 0 }`, which sets the vertical anchor and leaves the width to the content. A panel whose width is content-driven and whose left edge is pinned cannot align its right edge with anything.
- Resolution note: VISIBLE AT BOTH
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1598-1608` (`.hud-menu`) and `:1115` (`.m-hud-menu`). Not locked.
- Proposed fix: in the portrait rule set `right: 0` alongside `left: 0` so the menu spans the same inset as the HUD rows it covers, which removes both the bisected pod and the lit control beside it in one property.

## STC-MOBILES-1-04 HIGH The HUD menu's controls are below every touch minimum, and the project's own 44px floor is scoped to a component that does not contain them
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/327_mobile-s_transition_menu_opening.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/328_mobile-s_hud_menu.png`
- Claim: measured on `328` across the panel's text column, the five ink bands are `PAYTABLE` y=985 to 1011, `Session` y=1073 to 1101, `Mute` y=1169 to 1197, `MUSIC` y=1251 to 1267 and `SOUND` y=1318 to 1334. The pitch from `PAYTABLE` to `Session` is **88 px (31.3 px native)**. Adjacent rows cannot overlap, so the pitch is a hard upper bound on each row's hit height: **31 px native**, against the 44 px Apple HIG minimum and the 48 dp Material minimum.

  The derivation closes to a tenth of a pixel and that is what makes it certain rather than probable. `.hud-menu-item` is `padding: 0.5rem 0.9rem; font-size: 0.8rem` at `frontend/src/lib/components/HudOverlay.svelte:1609-1619`. At a 16px root that is 12.8 px of text on a normal line box (about 15.4 px) plus 16 px of padding, so **31.4 px**. Measured 31.3.

  The volume thumbs are worse. The `MUSIC` thumb's painted disc measures **x=386 to 413 and y=1245 to 1272**, a lit core of **28 px, which is 9.9 px native**, inside a box declared as `width: 12px; height: 12px` with a 1px dark border at `frontend/src/lib/components/HudOverlay.svelte:1724-1734` (`::-webkit-slider-thumb`) and again immediately below it for `::-moz-range-thumb`. Twelve declared, ten lit, against a 44 px floor. The track itself is `height: 4px` at `:1713`.

  **The finding that outlives the pixels.** `frontend/src/App.svelte:2776-2781` declares exactly the right rule: `@media (max-width: 768px) { button { min-height: 44px; min-width: 44px } }`. It never reaches these controls. Svelte scopes a component's `<style>` block to that component's own markup, the menu items are `<button>` elements declared in `HudOverlay.svelte` (`:428`, `:429`, `:546`, `:547`, `:655`, `:817` and siblings), and `App.svelte` carries no `:global(button)`: its only `:global` rules are the reset at `:2136`, `body` at `:2142` and `.warm-mount` at `:2172`. So the project has a 44 px touch floor, believes it holds, and it is scoped to the wrong component. `SessionPanel.svelte:196-200` sets its close button to 44 px explicitly with a comment calling it *"the same floor this project holds every interactive element to"*, and that is the one that holds, because it was written locally.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1609-1619` (`.hud-menu-item` padding), `:1724-1745` (both slider thumb rules) and `frontend/src/App.svelte:2776-2781` (the 44px floor that needs to be `:global` or moved into a shared stylesheet). Not locked.
- Proposed fix: make the 44 px floor global rather than component-scoped, then re-check every component for controls that were relying on it; separately raise the slider thumb to at least 24 px native with a padded hit area, or replace the sliders with stepped buttons at this width. Per convention (p), whatever holds the floor afterwards should be proved by a seeded violation, because a floor that has never been seen to fail is what produced this.

## STC-MOBILES-1-05 LOW The declared chrome bleed is larger than its own description at 320px: the whole side rail is off screen, not the outer corners
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/316_mobile-s_transition_rules_to_base.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/317_mobile-s_base_idle.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/318_mobile-s_transition_reels_accelerating.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/319_mobile-s_transition_reels_full_speed.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/320_mobile-s_dead_spin_1_settled.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/321_mobile-s_dead_spin_2_settled.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/322_mobile-s_dead_spin_3_settled.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/323_mobile-s_win_presentation.png`
- Claim: on `317` every element below the reel window shares one gutter. The BALANCE pod's teal border is at **x=34** and the WIN pod's magenta border at **x=866**; the FEATURES bar's magenta border is at **x=34 and x=866**; the BET panel's border is at **x=37 and x=863**. That is **12 px native on both sides**, held to within one pixel across three rows. The reel frame assembly holds none of it: at y=140, inside the top bracket, the luminance ramp across the first eight columns reads **`167, 170, 192, 213, 217, 219, 221, 221`**, still rising at x=0, and at y=450 the pixel at x=0 reads `(182, 182, 181)`, solid metal, with x=900 reading `(115, 115, 115)`.

  **This was drafted at MEDIUM and the source demoted it.** `frontend/src/App.svelte:778-780` states the intent in terms: *"The frame's own decorative outer edge (wider than the grid by design) extends slightly past the viewport at its outer corners as a result - a deliberate, common "chrome bleed" treatment, not a bug."* The bleed is declared, so it is not a defect and I am not calling it one.

  What survives, at LOW, is that the declaration and the measurement describe different amounts. *"Slightly past the viewport at its outer corners"* is not what 320x568 produces: the rail is off screen down the frame's whole height, from y=118 to y=783 upscaled (**236 px native**), at both edges, with the top bracket's ornament bisected mid-gradient. The declaration was written against wider phones, the effect scales with how far the crop goes, and 320px is the widest crop the game supports. Worth an owner glance to confirm the sanction still covers it; not worth a fix on its own.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/App.svelte:778-780` is the declaration; the geometry is the portrait crop at `frontend/src/App.svelte:917-970` (`portraitAvailableCanvasH`, `computePortraitCanvasScale`, `computePortraitCrop`). Not locked.
- Proposed fix: PARK(the bleed is declared intentional; only its magnitude at the narrowest supported viewport is in question, and that is an art call). If the owner wants it bounded, cap the horizontal crop so at most the outer corner ornament leaves the viewport.

## STC-MOBILES-1-06 MEDIUM The HUD menu panel is not opaque, and at full resolution the readouts behind it are legible through it
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/327_mobile-s_transition_menu_opening.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/328_mobile-s_hud_menu.png`
- Claim: the panel's own background measures `(6, 7, 18)` at x=400,y=965 and `(7, 6, 18)` at x=600,y=1150. At pixels where `317` carries the `$50,000.00` glyph strokes at `(204, 255, 255)`, frame `328` reads `(14, 16, 27)`. At pixels where `317` carries the yellow `$1.00` bet value at `(229, 220, 163)` and `(255, 243, 179)`, frame `328` reads `(16, 16, 23)` and `(15, 15, 23)`. At rows where `317` is dark, `328` returns exactly the base `(6, 7, 18)`, so the elevation tracks the content behind it and is not a gradient in the panel.

  Derived first: `.hud-menu` sets `background: rgba(6, 6, 18, 0.96)` at `frontend/src/lib/components/HudOverlay.svelte:1602`, so the prediction for the `$50,000.00` stroke is `0.04 * 204 + 6 = 14.2`. Measured **14**. The mechanism is exactly as specified.

  **The disposition is what the re-run changes.** The native pass measured the same thing and withdrew it as *"invisible at 1x"*, filing the residue at LOW. At 1600px the ghosts of `$50,000.00`, `WIN` and `$1.00` are readable as shapes under the `PAYTABLE`, `Session` and `MUSIC` rows, and a streamed frame is never presented at 1x: it is scaled up to the viewer's display, which is exactly the operation performed on these frames. A near-black modal carrying a legible ghost of a five-figure currency string is a machine tell under the standing mandate.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1602`. Not locked.
- Proposed fix: take the alpha to 1, or add a `backdrop-filter: blur()` so the layer behind cannot be resolved as text. One character either way.

## STC-MOBILES-1-07 MEDIUM The `WIN!` label is centred on a four-row grid, so it lands on the row 2 / row 3 seam by construction
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/323_mobile-s_win_presentation.png`
- Claim: the label's ink measures **x=406 to 497, y=430 to 458**. The reel 3 tile boundaries on the same frame, measured at x=512 clear of the glyphs, are at **y=206, 325, 452, 578** with the window's inner bottom at y=715. The label therefore sits **22 px above and 6 px below the row 2 / row 3 boundary at y=452**, so the boundary line runs through the lower fifth of the glyphs, and horizontally it lies directly over the piston symbol's lower body with no plate, no outline and no clear space, with a cyan win line passing through the same cell.

  The root cause is structural rather than a bad offset. `.small-win-flash` is `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)` at `frontend/src/lib/components/WinCelebration.svelte:40-54`, so the label is centred on the reel window. The window's vertical centre is `(206 + 715) / 2 = 460.5`, and the row 2 / row 3 boundary is at 452: with an **even** number of rows the window's centre always falls on a row seam, so a label centred on the window can never avoid one. The grid is 5x4, per `games/future_spinner/game_config.py`'s `num_reels = 5` and the four-row window this project's own worked example cites, so this is permanent, not a property of this spin.

  Cap height is 28 px (**10 px native**), which is legible, so this is placement and not size.
- Resolution note: VISIBLE AT BOTH
- Where fixable: `frontend/src/lib/components/WinCelebration.svelte:40-54`. Not locked.
- Proposed fix: give the label a small dark plate so it can survive whatever it lands on, and offset it by half a row height so a centred label on an even-row grid sits inside a cell rather than on a seam.

## STC-MOBILES-1-08 MEDIUM The `Session information` heading is centred 24.5px native left of its own panel's centre
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/329_mobile-s_session_panel.png`
- Claim: the panel's teal borders measure **x=46 and x=854**, so its centre is **x=450**. The heading's two lines measure `Session` at x=273 to 489 and `information` at x=225 to 537, and both centre on **x=381**, which is **69 px left, 24.5 px native**. Everything else in the panel is dead symmetric and that is what makes the heading read as a mistake: margins 46 px left and 46 px right, top margin 471 px against a bottom margin of 472 px, close button inset 63 px from the top and 63 px from the right, data rows inset 64 px left and 61 px right.

  Derived: `.sp-sheet-head` is `display: flex; align-items: center; justify-content: space-between` at `frontend/src/lib/components/SessionPanel.svelte:190-193`, putting the `<h2>` (`:100`) and the 44 px close button (`:196-200`) in one row, so the h2 centres its text in the remainder rather than in the panel. Predicted offset is half the button, **22 px**; measured **24.5 px**, the residual being the flex gap.

  There is also room, so the offset is not forced: the close button's disc starts at x=656 and a heading centred on x=450 would end at x=606.
- Resolution note: VISIBLE AT BOTH
- Where fixable: `frontend/src/lib/components/SessionPanel.svelte:190-193`. Not locked.
- Proposed fix: take the close button out of the header's flow (`position: absolute` in the sheet's top right) so the heading centres on the panel.

## STC-MOBILES-1-09 MEDIUM The reel frame and the FEATURES bar are separated by about 3px native, because the portrait height budget is declared with zero breathing gap
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/317_mobile-s_base_idle.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/320_mobile-s_dead_spin_1_settled.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/323_mobile-s_win_presentation.png`
- Claim: on `317` the FEATURES bar's magenta top border peaks at **y=796** (`(138, 36, 119)` at x=450, `(156, 33, 124)` at x=120). The reel frame's bottom metal rail is still painted at y=784, reading `(137, 116, 137)` at x=450. The clear span between them is **under 10 px, about 3 px native**, and the two elements read as touching.

  For comparison in the same layout: the BALANCE and WIN pods are separated by 24 px (**8.5 px native**), the side gutters are 34 px (**12 px native**), and the FEATURES bar's own bottom border at y=917 clears the scene seam at y=940 by 23 px (**8 px native**). The one join with no space is between the two largest elements on the stage.

  The source states the cause plainly rather than leaving it to be inferred. `frontend/src/App.svelte:824-829` computes the portrait vertical budget from *"conservative, content-derived minimums (not guesses): the wordmark's own line-height, and the portrait HUD's content-only height **with zero breathing gap** (FeatureMenu's 44px trigger + its 8px margin, .p-hud's 20px vertical padding, the stats+bet top-group at 114px, and a 72px controls row)"*. A budget built with zero breathing gap produces a layout with zero breathing gap; the 8 px trigger margin is then the only separation available and it is consumed by the frame's own bleed.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/App.svelte:820-836` (the portrait height budget constants) and the `.p-fm-entry` margin that budget names, in `frontend/src/lib/components/HudOverlay.svelte`. Not locked.
- Proposed fix: put one 8 px native gap into the budget between the frame and the FEATURES bar and let the grid scale absorb it, so the stage's largest join carries at least the separation the pod row already has.

## STC-MOBILES-1-10 MEDIUM The BET row carries a 94px native dead span between its label and its controls
- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/317_mobile-s_base_idle.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/318_mobile-s_transition_reels_accelerating.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/319_mobile-s_transition_reels_full_speed.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/320_mobile-s_dead_spin_1_settled.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/321_mobile-s_dead_spin_2_settled.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/322_mobile-s_dead_spin_3_settled.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/323_mobile-s_win_presentation.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/324_mobile-s_transition_bigwin_countup_early.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/325_mobile-s_transition_bigwin_countup_late.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/326_mobile-s_bigwin_settled.png`
- Claim: on `317` the BET panel's border runs x=37 to x=863. Inside it the `BET` label's ink is **x=76 to 154**, the down stepper plate is **x=376 to 501**, the `$1.00` value is **x=528 to 670** and the up stepper plate is **x=701 to 825**. Every other separation inside the panel is 27 to 39 px; the one between the label and the first control is **222 px, which is 79 px native to the plate and about 94 px native to the chevron glyph itself**, roughly **a quarter of the viewport width**, containing nothing.

  The imbalance is not only the gap. The stepper group's centre is x=600.5 against a panel centre of x=450, so the control cluster sits **150 px (53 px native) right of the panel it lives in**, while the BALANCE and WIN pods directly above centre their label and value on their own pod centres to within 2 px. Three stacked pods, two centred and one not.

  Derived: `.p-bet-stat` is `width: 100%` with `justify-content: space-between` and `gap: 16px` at `frontend/src/lib/components/HudOverlay.svelte:1946-1957`, which at 320 px throws the whole surplus into a single gap, and the comment at `:1953-1956` records the gap being opened from 10 px deliberately *"for a more generous, full-width feel"* without a narrow-viewport check.

  **CONSOLIDATION NOTE FOR THE MARSHAL, so this is not double counted.** This is the same defect as `STC-MOBILES-B-07`, which measured 97 px native on frames `341`, `358`, `359` and `363` and reached the same source lines independently. Those frames are a sibling squad's. It is recorded here because it is present on ten of my eighteen frames and the sibling's range would leave the base game itself unevidenced. Merge the two rows; do not count both.
- Resolution note: VISIBLE AT BOTH
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1946-1957`. Not locked.
- Proposed fix: below a narrow breakpoint centre the label and the stepper group as one block (`justify-content: center` with a fixed gap), matching the two centred pods above it.

---

## Native pass reconciliation

Reconciled against `reports/qa/stream_test/shards/superseded/STC-MOBILES-A.md`, which
covered frames 312 to 337. Its findings on frames **330 to 337** (A-02, A-05, A-10) fall
outside my range and belong to a sibling squad; I have not opened those frames and I take
no position on them. `STC-MOBILES-B.md` covers frames 338 to 363 and is wholly outside my
range, with the single exception noted at STC-MOBILES-1-10.

| Native finding | Verdict | Note |
|---|---|---|
| A-01 STREAM reel window transparent mid-spin | **CONFIRMED** | Frame `318` at 1600px: reels 1, 2 and 3 carry 3, 1 and 1 tiles of four, and the unoccupied cells carry no backing plate, so the scene backdrop's magenta chevron and its vertical rain streaks are visible straight through the reel window across a contiguous region of roughly 310 x 370 px (110 x 130 px native). Reels 4 and 5 are full, so the void is asymmetric and does not read as a designed reveal; `320`, `321` and `322` show all twenty cells plated. Full resolution adds nothing to the diagnosis and takes nothing away. The claim is right in every part. |
| A-02 HIGH paytable ways diagram clipped both ends | **out of range** | Frames 331 to 333, sibling squad. |
| A-03 HIGH HUD menu narrower than the rows it covers | **CONFIRMED** | Independent measurement: panel x=34 to 730 (247 px native) against a HUD row of x=34 to 866 (295 px native), leaving 48 px native uncovered. The native pass said 246, 295 and 49. Agreement within one native pixel on all three. Carried forward as STC-MOBILES-1-03, with the same source lines reached independently. |
| A-03's embedded translucency sub-claim, filed at LOW | **REFINED** | Mechanism and arithmetic reproduce exactly: `rgba(6, 6, 18, 0.96)` at `HudOverlay.svelte:1602` predicts 14.2 for the `$50,000.00` stroke and the frame reads 14. What does not survive is the disposition. It was filed at LOW as *"detectable only by pixel inspection"* with a companion absence calling it *"invisible at 1x"*; at 1600px the ghosts are readable as shapes, and a streamed frame is never presented at 1x. Promoted and split out as STC-MOBILES-1-06 at MEDIUM. |
| A-04 MEDIUM session title 24.5px left of panel centre | **CONFIRMED** | Measured independently: panel borders x=46 and x=854, centre 450; both title lines centre on x=381; offset 69 px, **24.5 px native**. The native figure reproduces to the decimal, and so does its derivation (half a 44 px button plus the flex gap). The cleanest confirmation in the set. Carried forward as STC-MOBILES-1-08. |
| A-05 MEDIUM paytable RULES list centred under left-pinned markers | **out of range** | Frame 335, sibling squad. |
| A-06 MEDIUM hard full-width seam cuts the backdrop | **CONFIRMED** | The seam is at upscaled y=940/941, native y=333.8/334.2, matching the native pass's *"56 at y=333 to 14 at y=334"*. Verified at both ends of the width rather than the middle only: at x=20 the pixel goes `(56, 47, 64)` to `(17, 18, 31)` and at x=880 `(23, 49, 58)` to `(10, 19, 29)`, in a single upscaled row pair, with no rule, gradient or shadow between. Present on every base frame in my range. |
| A-07 MEDIUM win line detail at 5px cap height in a 13px gap | **REFINED** | The type is smaller than reported and the slot is not a gap. Cap height measures 12 upscaled px, **4.3 px native, not 5**. The band the native pass described as an empty 13 px slot between the window edge and the chrome rail is not empty: the clean frame `320` shows the window's cyan bottom border peaking at `(191, 231, 246)` inside it, and the strip is painted over that peak, breaking the border across its span. Restated as STC-MOBILES-1-02, with the source located (`WinBreakdown.svelte:114-122`, `:136`, `:146`) which the native pass left UNKNOWN. |
| A-08 MEDIUM big win band covers the middle half and severs the rails, PARK | **CONFIRMED** | Every element reproduces with tighter figures: band rules at y=314 and y=576 (native 111.5 to 204.6, against *"about y=114 to y=202"*), full width confirmed by `(1, 241, 243)` at x=0 and `(1, 241, 242)` at x=900, and the rails covered rather than dimmed, `(226, 229, 230)` on `317` against `(12, 32, 46)` on `324` at the same pixel. The PARK disposition is kept and its evidence strengthened: the `@media (max-width: 500px)` block at `WinBanner.svelte:513` restyles the band's CONTENT and never its extent, so the narrow case was looked at and this question was not the one answered. Severity raised to STREAM at STC-MOBILES-1-01 on the lens definition alone, since a watching audience does see half the grid disappear; disposition unchanged. |
| A-09 LOW SPIN disc clears the bottom edge by 10px against 22px | **CONFIRMED** | Measured on `317`: the SPIN disc's lowest lit row is y=1571, a clearance of 29 px (**10.3 px native**); the small discs bottom out at y=1532, a clearance of 68 px (**24.2 px native**). The native pass said 10 and 22; the second is 24 by my threshold and the difference is threshold noise on a soft edge, not a disagreement. Not re-raised as a finding of mine because the native row already carries it correctly. |
| A-10 LOW Overdrive table pushed left in its rule | **out of range** | Frame 336, sibling squad. |
| A-11 LOW `WIN!` label unplated and crossing its own win line | **CONFIRMED**, and refined into a stronger claim | The qualitative claim is right in every part and it was under-stated. Adding the measurement it lacked: ink x=406 to 497, y=430 to 458 against tile boundaries at y=325 and y=452. Adding the root cause it lacked: `.small-win-flash` centres on the reel window (`WinCelebration.svelte:40-54`), the window's centre is y=460.5, and with an **even** row count the window centre always falls on a row seam, so the collision is structural rather than an unlucky offset. Carried forward as STC-MOBILES-1-07 at MEDIUM rather than LOW. |

**The native pass's signed absences, checked in my range.**

- *"Nothing is clipped by the VIEWPORT edge on any base game surface"*: **REFUTED as
  written.** The absence enumerates the pod row, the BET row, the control discs and the
  title, all of which do clear the edge, and does not check the reel frame chrome, which
  does not: the luminance ramp across x=0 to 7 at y=140 on `317` is `167, 170, 192, 213,
  217, 219, 221, 221`, still rising at the edge. The frame is at the edge for its whole
  height. That said, the source declares the bleed intentional
  (`frontend/src/App.svelte:778-780`), so what the absence got wrong is the observation,
  not the disposition. Recorded at LOW as STC-MOBILES-1-05.
- *"The HUD menu panel is NOT meaningfully translucent ... invisible at 1x"*: **REFINED**,
  see the A-03 sub-claim row above and STC-MOBILES-1-06.
- *"The splash is not off balance"*: **CONFIRMED.** I drafted a 14.5 px native offset
  against it and withdrew that draft at the source step; see the withdrawals below. The
  native pass was right.
- *"The intro rules card is symmetric"*: **CONFIRMED.** I drafted a vertical padding
  asymmetry against it and withdrew that draft at the source step; see the withdrawals
  below. The native pass was right, and it is now derived as well as measured.
- *"No money display fit failure at this viewport"*: **CONFIRMED** for my range,
  independently, see my own absences below.
- *"No layout jump across the settled run. 320, 321 and 322 are geometrically identical"*:
  **CONFIRMED.** Sampling every third pixel of all three frames, `320` against `322`
  differs at 0.09 per cent of samples and `320` against `321` at 1.05 per cent, all of it
  in the animated rain and glow, none of it structural.
- *"316 is geometrically identical to 317"*: **CONFIRMED**, 0.99 per cent of sampled
  pixels differ, all in the rain layer.
- *"The session panel's data rows are symmetric"*: **CONFIRMED**, label ink starts at
  x=110 and value ink ends at x=793 within borders at x=46 and x=854, insets of 64 and
  61 px (22.7 and 21.7 px native).
- *"No replay surface appeared"*: **CONFIRMED**, nothing in frames 312 to 329 is a replay
  surface.

---

## Explicit absences, signed

**Withdrawn at the source-location step, recorded rather than deleted.** Two IDs are
retired and must not be reused. In both cases the specification states the intent, my
measurement was a proxy for a different quantity, and convention (l.2) makes a measurement
that disagrees with the specification a broken measurement until proven otherwise.

- **STC-MOBILES-1-11, WITHDRAWN. The intro rules card's vertical padding is NOT
  asymmetric.** Drafted at LOW on the measurement that `315`'s card has 104 px (37 px
  native) above the heading's ink and 83 px (29.5 px native) below the button's ink.
  `frontend/src/lib/components/IntroSplash.svelte:70` declares `padding: 1.8rem 1.6rem`,
  which is 28.8 CSS px at both ends, and the card sits in the untransformed portrait
  wrapper so 1 CSS px is 1 device px. The measured **foot** figure of 29.5 matches the
  declared 28.8 to 0.7 px; the 37 px head figure is the `<h2>`'s half-leading above its cap
  height, which is type metrics and not padding. The padding is symmetric. Withdrawn.
  What survives, and is signed clean below, is that the card is not a hidden scroll box.
- **STC-MOBILES-1-12, WITHDRAWN. The splash block is NOT off centre.** Drafted at LOW on a
  14.5 px native downward offset, taken from the logo's bright core at a fixed threshold
  against the prompt's ink. `frontend/src/lib/components/HeroSplash.svelte:74-80` declares
  `display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 1.4rem`, so the container centres its children by construction, and the emblem's
  layout box is `width: min(62vw, 380px); aspect-ratio: 1 / 1` (`:91-94`), a square whose
  bounds I cannot recover from a frame because the emblem's glow and its transparent
  margin both fall inside it. A glow-core-versus-ink comparison is not a measurement of the
  layout box and cannot overturn `justify-content: center`. Withdrawn. This makes the
  native pass's own absence CONFIRMED rather than merely unchallenged.
- **STC-MOBILES-1-05 was DOWNGRADED from MEDIUM to LOW** by
  `frontend/src/App.svelte:778-780`, which declares the chrome bleed intentional. The
  observation survives, the defect framing does not.

**Checked and clean.**

- **No money display is clipped, ellipsised or overflowed anywhere in my range.** Checked
  `$50,000.00`, `$0.00`, `$3.90`, `$15.95`, `$16.20`, `$1.00`, `$5.00`, `$20.10`,
  `+$15.10`, `$10.28` and `$0.20` on frames `317`, `320`, `321`, `322`, `323`, `324`,
  `325`, `326` and `329`. The widest is `$50,000.00`, ink x=73 to 396 inside a pod interior
  of x=34 to 438, clearing by 39 and 42 px (14 and 15 px native). Nothing in the
  TR-115 / TR-086 class on `mobile-s` frames 312 to 329.
- **The BALANCE and WIN pods are correctly composed and I looked hard at them.** Borders
  x=34 to 438 and x=462 to 866, both **404 px wide to the pixel**. Both labels ink from
  y=1005 to 1027 and both values from y=1056 to 1101, so they share two baselines exactly.
  Both labels and both values centre on their own pod centres to within 1.5 px.
- **The FEATURES bar is correctly composed.** Border x=34 to 866, matching the pod row's
  gutter; content ink centres on x=448.5 against a bar centre of x=450; bar height 122 px
  (**43 px native**), an adequate touch target. Its crowding against the frame above it is
  STC-MOBILES-1-09 and is a property of the budget, not of the bar.
- **The bottom control row is symmetric within measurement error and I am NOT reporting
  it.** Thresholded at a fixed luminance on `320` the five discs span x=34 to 162, 192 to
  298, 329 to 579, 586 to 714 and 743 to 873, which reads as a 34 px left gutter against a
  27 px right one. Using disc CENTRES instead, which is robust to the turbo disc being
  dimmed in its idle state, the outermost centres are x=98 and x=808, midpoint x=453
  against a frame centre of x=450.5: an offset of **0.9 px native**. The apparent gutter
  asymmetry is an artefact of thresholding discs of different brightness. Recorded rather
  than reported, because a 3 px claim that dissolves under a better estimator is exactly
  the false positive this re-run exists to remove.
- **The `MUSIC` and `SOUND` labels are indented 12 px (4.3 px native) further than the
  menu items above them** (ink starts x=90 and x=84 against x=78 for `PAYTABLE`, `Session`
  and `Mute`, all flat-stemmed capitals in the same family, so side bearing does not
  explain the direction). Measured, judged too small for a row, recorded so the absence is
  honest rather than silent.
- **The session panel modal does not exceed its viewport and is not a scrolling box.**
  Borders x=46 to 854 and y=471 to 1128 inside a 901 x 1600 frame; margins 46 / 46 / 471 /
  472. All five data rows and the heading are simultaneously visible; no content is cut.
- **The intro rules card is a scroll box that does not need to scroll here, and the
  popout-s cluster 5 collision is NOT present at this viewport.** Derived and measured
  agree: `IntroSplash.svelte:67-69` caps the card at `max-height: calc(100dvh - 2rem)`
  with `overflow-y: auto`, which is **536 px** at 568 px tall, and the card measures 1397
  upscaled px, **496 px native**. It fits with 40 px to spare, so nothing is hidden. On
  `315` the last body line ends at y=1244 and the `Continue` button starts at y=1301, a
  clear 57 px (20 px native): the button does not overlap its own copy. Recorded
  explicitly because three squads reported that collision on `popout-s` and a reader may
  reasonably expect it to generalise. It does not, at this viewport.
- **Reel 5 sitting about 5 px native above reels 1 to 4 on `319` is a reel still in
  motion, not a misalignment, and I am not reporting it.** The frame is labelled full
  speed, reels stop in sequence, and `320`, `321` and `322` show all five columns sharing
  one row grid.
- **Frame `327`'s menu region is pixel-identical to `328`'s**: across 33,319 sampled
  points inside the panel rectangle, zero differ by more than 30 on any channel. The frame
  the manifest calls the menu mid-open carries a fully open menu. There is therefore **no
  intermediate composition state in that transition for me to judge**, and I record that
  rather than sign coverage of geometry that was never captured. Same shape as
  `STC-MOBILES-B-13`; it belongs to the motion lens, flagged not claimed.
- **Frame `314` was read and carries nothing new.** It is a genuine mid-fade: the rules
  card is composited over a blurred base game at the same geometry it settles to on `315`.
  No transitional layout state, no collision.
- **Not checked, and named rather than left implied**: colour contrast ratios, font
  identification, glyph-level typography, motion residue between frames, audio, and any
  surface outside `mobile-s` frames 312 to 329. Those are other lenses and other squads.

## KNOWN matches

- **KNOWN(MID-01)**, fresh evidence at 1600px:
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/324_mobile-s_transition_bigwin_countup_early.png`
  renders the banner at `$10.28` while the HUD WIN pod already reads `$15.95`, on a win
  that settles at `$16.20` in
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/326_mobile-s_bigwin_settled.png`,
  where both read `$16.20`. Both figures are unambiguous at this resolution. The
  `mobile-s` instance of the ledger's desktop `013` / `015` pattern.
- **KNOWN(MID-02)**, fresh evidence at 1600px: the unit renders as `16x BET` on `324`,
  `325` and `326`. At 1600px the `x` is unambiguously a baseline lowercase letter at digit
  x-height, not a raised multiplication sign, which is the observation the native
  thumbnails could not support.
- **KNOWN(Q-26), flagged rather than asserted.** The superseded shard recorded
  `315_mobile-s_intro_rules.png` as using the letter form. At 1600px the marks in
  `1x, 3x or 10x`, `+1x` and `100x` on that card render as small centred marks at mid
  height, visually unlike the baseline letter on the big win banner in the same session.
  Glyph identification is the typography lens's call and I am not making it. Recorded so
  the marshal knows the native reading of this one frame is worth re-checking; not a
  finding of mine.
- No match to **TR-104** (English session, so the hardcoded-English claim is untestable
  here), **TR-115 / TR-086** (signed absent above), **TR-114** (no replay surface),
  **Q-27**, **Q-34** or **Q-07** in frames 312 to 329.

tree_after: verbatim `git status --porcelain` at the end of this run. Nothing MODIFIED, nothing DELETED, 27 lines, every one an untracked shard. Only `STC-MOBILES-1.md` is mine; the other 26 belong to sibling squads and are not my concern. The tree was not dirtied.
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
