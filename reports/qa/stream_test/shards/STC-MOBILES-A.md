# STC-MOBILES-A, COMPOSITION (mobile-s, 320x568, frames 312 to 337)
scope: every `mobile-s` frame numbered 312 to 337 inclusive, 26 frames, covering splash, intro rules, base idle, spin transitions, three dead spins, win presentation, the big win triple, the HUD menu, the session panel and paytable views 1 to 6.
frames_read: 26

Method note, so the figures can be checked. Every pixel figure below was measured off
the committed PNG with a scratch decoder, not estimated by eye. Three of this shard's
first-pass observations were REFUTED by that measurement and have been withdrawn rather
than softened; they are listed under the signed absences so the withdrawal is on the
record. Where a measurement is quoted, the derivation from source is quoted beside it,
per convention (l.1) and (l.2).

## STC-MOBILES-A-01 STREAM The reel window goes transparent mid-spin: the scene background is visible straight through unbacked cells
- Frames: `reports/screens/stream-test-2026-07-28/318_mobile-s_transition_reels_accelerating.png`
- Claim: at about 250ms after the spin press, columns 1, 2 and 3 of the five by four grid carry **3, 2 and 1** tiles respectively out of four, and every remaining cell in those columns has no tile AND no backing plate. The scene backdrop is visible directly through the reel window, identifiable by its magenta chevron and its vertical rain streaks, over a contiguous region of roughly 110px by 130px, about a third of the window. Columns 4 and 5 are full, so the hole is not symmetric and does not read as a designed reveal. The settled frames `320`, `321` and `322` show all twenty cells plated, which is the comparison that makes this a fault rather than a style. This is on screen during the acceleration of every spin, which is why it is STREAM and not HIGH.
- Where fixable: `frontend/src/lib/components/GameGrid.svelte:1144` renders the backing as `<img class="tile-plate" ...>` INSIDE the tile, so a cell with no tile has no plate by construction. Not locked.
- Proposed fix: give the grid its own cell backing layer underneath the tile layer, so the window is opaque regardless of tile occupancy.

## STC-MOBILES-A-02 HIGH The paytable ways-to-win diagram is clipped at BOTH ends and the `1` chip's numeral is cut away entirely, on the one surface whose caption depends on it
- Frames: `reports/screens/stream-test-2026-07-28/331_mobile-s_paytable_top.png`, `reports/screens/stream-test-2026-07-28/332_mobile-s_paytable_01_match_symbols_on_adjacent_reels_st.png`, `reports/screens/stream-test-2026-07-28/333_mobile-s_paytable_02_ways_to_win.png`
- Claim: the chip row `1 2 3 4 5` overflows its container at 320px. The leftmost chip is sliced at the container edge with its numeral `1` not rendered at all, and the rightmost chip is sliced through the numeral `5`. The caption immediately beneath reads `Reels 1, 2 and 3 hold the same symbol (highlighted), which is a match read left to right from reel 1.`, so the prose names a chip the viewer cannot see. There is no scrollbar, no fade mask and no affordance, so it reads as a broken container.

  Derived, then measured. At this width the narrow override `.fs-way-cell { width: 40px }` and `.fs-way-arrow { font-size: 1.05rem; padding: 0 4px }` (`frontend/src/lib/components/PaytableModal.svelte:806-807`) plus `.fs-ways-diagram > .fs-face { padding: 12px 8px }` (`:808`) require `5*40 + 4*(16.8+8) + 16` = **about 315px**. The panel measures x=12 to x=306 and `.fs-pt-body { padding: 14px 16px 20px }` (`:798`) leaves a content box of **about 262px**. Overflow about 53px, about 26px lost each side, which is two thirds of a 40px chip: exactly the missing `1`.

  **The finding that outlives the pixels**: `PaytableModal.svelte:800-805` carries a comment recording that this exact defect was found and fixed on 2026-07-14, in these words, that the diagram *"overflowed at 390-430px viewports, cropping the outer cells"*, and it was closed by shrinking the cells once. One step down was not enough for 320px, and the row that recorded the fix did not re-check the narrowest supported viewport. `body { min-width: 320px }` at `frontend/src/app.css:124-127` is the project's own statement that 320px is supported.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:806-808`. Not locked.
- Proposed fix: add a narrower breakpoint (cells to about 30px, arrow padding to 2px, face padding to 4px) or let the row wrap; a one-off shrink has now failed twice, so size the cells from the container rather than from a breakpoint guess.

## STC-MOBILES-A-03 HIGH The HUD menu panel is narrower than the rows it covers, so it bisects the WIN pod and leaves a live BET control lit beside it
- Frames: `reports/screens/stream-test-2026-07-28/327_mobile-s_transition_menu_opening.png`, `reports/screens/stream-test-2026-07-28/328_mobile-s_hud_menu.png`
- Claim: in `328` the menu panel spans x=12 to x=258, **246px**, while the BALANCE and WIN pod row and the BET row beneath it both span x=12 to x=307, **295px**. A **49px** vertical strip of the HUD is therefore left uncovered down the panel's right side, and it is not dimmed: at y=380 it carries the magenta WIN pod border and part of the `$16.20` figure at full brightness (measured luminance 191 to 222 at x=262 to x=266), and at y=460 it carries the whole BET increment control, yellow border and cyan arrow intact. A menu that cuts a pod in half and leaves a tappable control glowing beside it reads as an overlay that missed.

  A second, much smaller fault in the same rule, stated at its true size: `.hud-menu` sets `background: rgba(6, 6, 18, 0.96)`, so the pods bleed through the panel at 4 per cent. Derivation predicts `0.04 * 222 + 7` = **15.9**; measurement inside the panel reads **16** against a panel background of **7**. Real, exactly as specified, and detectable only by pixel inspection, so it is LOW and is recorded here rather than as its own row.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1598-1608` (`.hud-menu`, the `min-width: 200px` and the `0.96` alpha) and `:1115` (`.m-hud-menu { bottom: 44px; left: 0 }`). Not locked.
- Proposed fix: at narrow viewports pin the menu to the same inset as the HUD rows (`left: 0; right: 0`) so it cannot bisect a pod, and take the alpha to 1.

## STC-MOBILES-A-04 MEDIUM The `Session information` title sits 24.5px left of its panel's centre
- Frames: `reports/screens/stream-test-2026-07-28/329_mobile-s_session_panel.png`
- Claim: the panel's borders measure x=16 and x=303, so its centre is **x=159.5**. The two title lines measure x=80 to x=190, so they centre on **x=135**, **24.5px** left. The five data rows below are inset 23px on the left and 24px on the right, dead symmetric, which is what makes the title's offset read as a mistake rather than a style.

  Derived from source: `.sp-sheet-head { display: flex; align-items: center; justify-content: space-between }` (`frontend/src/lib/components/SessionPanel.svelte:190-192`) puts the `<h2>` (`:100`) and the 44px close button (`:197-199`) in one row, and the h2 then centres its text within the remainder rather than within the panel. Predicted offset is half the button plus half the gap, **22 to 26px**. Measured 24.5.
- Where fixable: `frontend/src/lib/components/SessionPanel.svelte:190-192`. Not locked.
- Proposed fix: take the close button out of the flow (`position: absolute` in the panel's top right) so the title centres on the panel.

## STC-MOBILES-A-05 MEDIUM The paytable RULES list has no left edge at all: the copy is centred while all six markers are pinned left
- Frames: `reports/screens/stream-test-2026-07-28/335_mobile-s_paytable_04_rules.png`
- Claim: every one of the six `>` markers measures at x=32, dead aligned. The text they mark is centred, so no two lines share a left edge. Measured first-line starts: **48, 57, 48, 52, 51, 57**. Measured last-line starts: **77, 114, 102, 102, 79, 147**. Every line, long or short, centres on **x=167**. A marker column pinned to a ragged centred paragraph is a list that reads as broken formatting, and centred running copy in a rules list is itself a machine tell under the standing mandate.

  Root cause, and it matters more than this frame. `.fs-rules li` sets `padding-left: 16px` with the marker at `left: 0` (`frontend/src/lib/components/PaytableModal.svelte:667-669`) and sets **no** `text-align`, so it inherits `center` from the Vite scaffold rule `#app { text-align: center }` at `frontend/src/app.css:143`. The derivation closes exactly: content box centre 159, plus half the 16px one-sided padding, gives **167**, the measured figure. This is charter row **Q-27**, which KNOWN_OPEN records as *"Visible only if any link or unstyled surface reaches a frame"*. It has reached a frame, on two components, so the row's premise needs revising.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:668` for the local fix; `frontend/src/app.css:143` for the class. Neither locked.
- Proposed fix: add `text-align: left` to `.fs-rules li` now, and treat the scaffold `#app` block as a class to sweep rather than a dormant remnant, since inherited centring cannot be found by reading the components that suffer it.

## STC-MOBILES-A-06 MEDIUM A hard full-width seam cuts the scene backdrop off in a single pixel row, on every base game frame
- Frames: `reports/screens/stream-test-2026-07-28/317_mobile-s_base_idle.png`, `reports/screens/stream-test-2026-07-28/320_mobile-s_dead_spin_1_settled.png`, `reports/screens/stream-test-2026-07-28/323_mobile-s_win_presentation.png`, `reports/screens/stream-test-2026-07-28/326_mobile-s_bigwin_settled.png`
- Claim: the mean luminance of the full 320px row falls from **56 at y=333 to 14 at y=334**, a factor of four in one pixel row, and the same figures appear on all four frames listed, so the seam is static rather than an artefact of any one moment. Spot samples across the width confirm it is not a local edge: at x=3 the pixel goes `(69, 73, 87)` to `(10, 14, 25)`, at x=160 `(35, 45, 65)` to `(14, 12, 28)`, at x=316 `(29, 64, 71)` to `(8, 13, 25)`. The backdrop art simply stops, dead straight, with no fade, no rule and no panel edge to explain it, about 59 per cent of the way down the frame. It is the kind of line a viewer does not consciously read but does see, and it is what tells them the backdrop is a picture that ran out rather than a world the reels sit in.
- Where fixable: UNKNOWN. Not investigated: the six source file budget was spent on findings 01 to 05. Likely the backdrop layer's height or object-fit in `App.svelte` or `SceneGroup.svelte`, neither locked.
- Proposed fix: extend the backdrop to the full height, or feather its lower edge into the HUD field so the cut is not a line.

## STC-MOBILES-A-07 MEDIUM The win line detail is set at about 5px cap height in a 13px gap
- Frames: `reports/screens/stream-test-2026-07-28/327_mobile-s_transition_menu_opening.png`, `reports/screens/stream-test-2026-07-28/328_mobile-s_hud_menu.png`, `reports/screens/stream-test-2026-07-28/325_mobile-s_transition_bigwin_countup_late.png`, `reports/screens/stream-test-2026-07-28/326_mobile-s_bigwin_settled.png`
- Claim: the line reading `L3 x4 1 ways $0.20` occupies rows **y=254 to y=258**, a cap height of **5px**, and it is squeezed into the **13px** band between the reel window's inner bottom edge at y=250 and the frame's chrome rail at y=263. Five pixels is below any legibility floor, and on a stream it will survive neither the encoder nor the viewer. The element is not cramped by accident of content: the slot it is given is 13px tall, so nothing larger could fit there.
- Where fixable: UNKNOWN. Not investigated within the file budget.
- Proposed fix: give the line its own row inside the reel window with a minimum type size at narrow viewports, or drop it below the frame entirely at this width.

## STC-MOBILES-A-08 MEDIUM The big win band covers the middle half of the grid and severs the reel frame's rails at this viewport, PARK
- Frames: `reports/screens/stream-test-2026-07-28/324_mobile-s_transition_bigwin_countup_early.png`, `reports/screens/stream-test-2026-07-28/325_mobile-s_transition_bigwin_countup_late.png`, `reports/screens/stream-test-2026-07-28/326_mobile-s_bigwin_settled.png`
- Claim: the band reaches x=0 and x=319 and runs from about **y=114 to y=202**, about 89px. At y=150 the reel frame's left rail measures luminance **25 to 27** across x=0 to x=19 in `324` against **226** at the same pixels in `317`, so the rail is not dimmed but covered. The band sits inside the reel window vertically, so it hides the middle two rows of the four row grid and leaves the top and bottom rows as two detached strips, at the most watched moment in the game.

  **Stated as a question, not as a defect, because the specification says it is intended.** `frontend/src/lib/components/WinBanner.svelte:4` and `:339` both record the band as a *"full-width neon band"* attributed to OWNER AUDIT ROUND 2, item 2. The full bleed is therefore sanctioned. What was not decided, because 320x568 was presumably not the frame it was decided against, is whether a sanctioned full-bleed band may cover the frame and the middle of the grid at the narrowest supported viewport.
- Where fixable: `frontend/src/lib/components/WinBanner.svelte:339-350` (`.c1-band`). Not locked.
- Proposed fix: PARK(the full bleed is an owner decision on a celebration surface, so narrowing it at 320px is the same art call and belongs to the owner). Options: (a) leave as is; (b) inset the band to the frame's inner width below 500px; (c) shrink the band's height at short viewports so it covers one grid row rather than two.

## STC-MOBILES-A-09 LOW The SPIN disc clears the bottom edge by 10px where its own row-mates clear it by 22px
- Frames: `reports/screens/stream-test-2026-07-28/317_mobile-s_base_idle.png`
- Claim: measured on the settled frame, the SPIN disc spans y=486 to y=557 and the small discs span y=498 to y=545. Both are centred on y=521.5, so the row is centre aligned and the difference is purely the difference in diameter: bottom clearance **10px** for the primary control against **22px** for the four secondary ones. It is not a fault of alignment, and it is recorded at LOW for one reason: 10px is inside the crop margin of a typical stream overlay frame, so the game's main button is the element most likely to lose its edge to someone else's layout.
- Where fixable: UNKNOWN. Not investigated within the file budget; the mobile control row is in `HudOverlay.svelte`, not locked.
- Proposed fix: add about 12px of bottom padding to the control row below 600px of height, so the largest disc keeps the same clearance as the small ones.

## STC-MOBILES-A-10 LOW The Overdrive table's header block is flush with the left end of its rule and 25px short of the right end
- Frames: `reports/screens/stream-test-2026-07-28/336_mobile-s_paytable_05_overdrive_free_spins.png`
- Claim: the divider rule under the headers runs **x=31 to x=288**. `SCATTERS` begins at **x=31**, flush, while `INSTANT AWARD` ends at **x=263**, **25px** short. The three columns' values centre on **67.5, 142.5 and 234.5**; three equal columns across that rule would centre on 73.8, 159.5 and 245.2, so every column sits left of where an even distribution would put it, by 6, 17 and 11px respectively. The table reads as pushed left inside its own rule.
- Where fixable: UNKNOWN. `.fs-trig` is at `frontend/src/lib/components/PaytableModal.svelte:672-680`; the column widths were not traced within the file budget. Not locked.
- Proposed fix: give the three columns equal width, or equal outer padding, so the header block and the rule share a centre.

## STC-MOBILES-A-11 LOW The `WIN!` label is unplated and crosses the win line it belongs to
- Frames: `reports/screens/stream-test-2026-07-28/323_mobile-s_win_presentation.png`
- Claim: the label is drawn over a grid cell with no backing plate and no outline, the cyan win line passes through it, and it is positioned on a cell boundary rather than on a cell centre or the window centre, so it competes with both the line and the symbol art beneath it and reads as dropped in rather than placed.
- Where fixable: UNKNOWN. Not investigated within the file budget.
- Proposed fix: give the label a small dark plate and anchor it to the win line's midpoint or the window centre.

## Explicit absences, signed

**Withdrawn after measurement.** These were in this shard's first-pass draft and the pixels refuted them. Recorded so the withdrawal is auditable rather than invisible.

- **The paytable panel's margins are NOT asymmetric.** Drafted as a finding on a visual read. Measured: the panel's left rail is at x=12 to x=18 and its right border at x=305 to x=306, on `331`, `335` and `337` alike, so the insets are 12px left and 13px right inside a 320px viewport. Symmetric. Withdrawn.
- **The HUD menu panel is NOT meaningfully translucent.** Drafted as a HIGH finding claiming the balance and win figures read through the menu. Measured: inside the panel the underlying digits reach luminance 16 against a panel background of 7, where the same digits read 222 on `317`. That is a 4 per cent bleed, matching the specified `rgba(6, 6, 18, 0.96)` to one luminance level, and it is invisible at 1x. The headline claim was wrong; the residue is recorded at its true size inside STC-MOBILES-A-03.
- **There is no pale sweep highlight on the win line strip.** Drafted as a finding claiming a light grey pill out-brightened the win figure on `325` and `326`. Measured: `326` and `327` have byte-identical luminance profiles across rows 244 to 269, and the bright band at rows 263 to 269 is the reel frame's own chrome rail, present on every frame. Withdrawn. What survives is the 5px type, at STC-MOBILES-A-07.
- **The bottom control row is not misaligned.** Drafted as a crowding finding on estimated figures of 7px and 28px. Measured: the discs are centred on a shared y=521.5 and the clearances are 10px and 22px. The alignment claim is withdrawn; what survives is the 10px crop-margin point, at LOW, at STC-MOBILES-A-09.

**Checked and clean.**

- **Nothing is clipped by the VIEWPORT edge on any base game surface.** Checked `317`, `318`, `319`, `320`, `321`, `322`, `323`, `324`, `325`, `326`. The pod row and the BET row both measure x=12 to x=307, the control discs measure y=486 to y=557 at the deepest, and the title's first lit row is y=5. Everything sits inside 320x568 with margin to spare. The only element that touches an edge deliberately is the big win band, at STC-MOBILES-A-08.
- **No money display fit failure at this viewport** (the TR-115 and TR-086 class). `$50,000.00`, `$0.00`, `$3.90`, `$16.20`, `$1.00`, `$5.00`, `$20.10` and `+$15.10` all render complete with no ellipsis, no clipping and no overflow, across `317`, `320`, `321`, `322`, `323`, `324`, `325`, `326` and `329`. `$50,000.00` is the widest and it fits its pod. Signed for `mobile-s` frames 312 to 337 only.
- **The splash is not off balance.** Checked `312` and `313`. The logo and `TAP TO CONTINUE` form one group whose optical centre falls within a few pixels of the viewport centre, and the bands above and below it are close enough in height that neither reads as a dead region.
- **The intro rules card is symmetric.** Checked `314` and `315`. The card is horizontally centred, its title and `Continue` button both centre on the card centre, its bullet markers and their text share one left edge, and it clears the viewport top and bottom on both frames. Note for the marshal: this card's bullets are left aligned, so whatever centres the paytable's list at STC-MOBILES-A-05 is overridden here and the two rules surfaces disagree with each other.
- **No layout jump across the settled run.** `320`, `321` and `322` are geometrically identical to each other.
- **No mid-transition layout shift on either transition that brackets a settled state I hold.** `316` is geometrically identical to `317`, and `330` to `331`, so neither transition introduces a position the settled frame then corrects.
- **The session panel's data rows are symmetric**, inset 23px left and 24px right within a panel measuring x=16 to x=303, which is the measurement that isolates STC-MOBILES-A-04 to the title alone.
- **No replay surface appeared** (the TR-114 class), so nothing to add to that row from this shard.

## KNOWN matches
- KNOWN(MID-01): `reports/screens/stream-test-2026-07-28/324_mobile-s_transition_bigwin_countup_early.png` shows the banner at `$10.28` while the HUD WIN pod already reads `$15.95`, and `326_mobile-s_bigwin_settled.png` shows both at `$16.20`. The `mobile-s` instance of the pattern the ledger records for desktop `013` and `015`, and it confirms the divergence is viewport independent.
- KNOWN(MID-02): `reports/screens/stream-test-2026-07-28/324_mobile-s_transition_bigwin_countup_early.png`, `325_mobile-s_transition_bigwin_countup_late.png` and `326_mobile-s_bigwin_settled.png` all render the unit as `16x BET` with a letter x.
- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/336_mobile-s_paytable_05_overdrive_free_spins.png` renders the INSTANT AWARD column as `1x`, `3x`, `10x` while `335_mobile-s_paytable_04_rules.png`, the section immediately above it on the SAME scrolling panel, renders the same three quantities with the multiplication sign. `337_mobile-s_paytable_06_bet_modes.png` carries both forms in one row, `COST 1x` beside `MAX WIN 5,000x` with the sign, and `315_mobile-s_intro_rules.png` uses the letter form. Two adjacent sections of one panel disagreeing is stronger evidence than the config-file instances the row currently enumerates. Glyph identification here is read off rendered frames rather than source, so this is offered as evidence for the class, not as a new codepoint claim.
- KNOWN(Q-27): `reports/screens/stream-test-2026-07-28/335_mobile-s_paytable_04_rules.png` and `329_mobile-s_session_panel.png`. The scaffold rule `#app { text-align: center }` at `frontend/src/app.css:143` is the inherited cause of both STC-MOBILES-A-05 and, together with the flex header, STC-MOBILES-A-04. The row currently reads *"Visible only if any link or unstyled surface reaches a frame"*; on the evidence of these two frames the scaffold block is reaching finished surfaces through inheritance, and the row's premise wants revising rather than the row simply being closed.
- KNOWN(Q-34): `reports/screens/stream-test-2026-07-28/337_mobile-s_paytable_06_bet_modes.png` renders the mode name as `Cruise` in title case on the bet modes card. The HUD badge half of that pair does not appear in frames 312 to 337, so this is one side of the row only.

tree_after: verbatim `git status --porcelain` at the end of this run. Nothing MODIFIED, nothing DELETED. Every line is an untracked shard; only the third is mine, the rest belong to other squads.
```
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
