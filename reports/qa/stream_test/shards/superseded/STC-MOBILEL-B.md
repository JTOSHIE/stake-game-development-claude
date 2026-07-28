# STC-MOBILEL-B, COMPOSITION (mobile-l, 425x812, frames 234 to 259)
scope: every `mobile-l` frame numbered 234 to 259 inclusive, 26 frames, from `234_mobile-l_paytable_07_interface_guide.png` through `259_mobile-l_post_collect_base.png`. All opened once each with the Read tool.
frames_read: 26

Pixel figures below were sampled from the PNGs themselves at native 425x812 by
decoding the files in memory, not eyeballed, except where the text says
otherwise. Viewport columns run 0 to 424 and rows 0 to 811. Strings are
transcribed verbatim in backticks.

## STC-MOBILEL-B-01 STREAM The FEATURES menu bet stepper wraps, stranding `+` on a second row 156 px from its own `-`

- Frames: `reports/screens/stream-test-2026-07-28/240_mobile-l_features_menu.png`, `reports/screens/stream-test-2026-07-28/239_mobile-l_transition_features_menu_opening.png`
- Claim: the top card of the FEATURES panel lays out as one row, `SPIN COST` `$1.00` `BET` `[-]` `$1.00`, and then the increment button `[+]` falls onto a SECOND row at the opposite end of the card. Sampled from `240`: the `[-]` button's border box spans x=213 to x=256 and y=143 to y=170, centre `(234.5, 156.5)`; the `[+]` button's border box spans x=59 to x=99 and y=184 to y=212, centre `(79, 198)`. The pair a player reads as one control is therefore **155.5 px apart horizontally and 41.5 px apart vertically**, with the value they drive, `$1.00`, sampled at x=322 to x=364 on the first row. The wrap leaves about **285 x 28 px of empty card interior** to the right of `[+]` (card inner borders sampled at x=41 and x=384). Nothing else in the panel wraps, and this is the panel's first card, the one carrying its only bright border, and the card a streamer reads before every bonus buy. It does not read as a two row design; it reads as a broken row.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:847` (`.fm-betbar > .fs-face { flex-direction: row; align-items: center; gap: 0.7rem; padding: 8px 16px; flex-wrap: wrap; }`) together with `frontend/src/lib/components/FeatureMenu.svelte:861` (`.fm-betval { margin-left: auto; min-width: 84px; ... }`). Markup at `frontend/src/lib/components/FeatureMenu.svelte:341-343`. The `.fm-panel--mini` variant at `:760-769` shrinks this row for the mini player, so the shrunk path exists; mobile-l does not take it (`miniPlayer` is the mini player prop, `:63`, `:314`).
- Proposed fix: wrap `[-]` `$1.00` `[+]` in one `flex-shrink: 0` group so the trio can never split, and let `.fm-spin-cost` shrink or drop `{$tr('bet')}` below about 480 px instead.

## STC-MOBILEL-B-02 HIGH The autoplay popover is anchored to its button, so at 425 px it sits with a 12 px right gutter against a 193 px left one

- Frames: `reports/screens/stream-test-2026-07-28/238_mobile-l_autoplay_menu.png`
- Claim: the popover's borders sample at **x=193 (left), x=412 (right), y=293 (top), y=733 (bottom)**, so it is 220 px wide on a 425 px viewport with a **left gutter of 193 px and a right gutter of 12 px**. Every other overlay in this session is symmetric: the FEATURES panel's borders sample at x=17 and x=407 in `240` (17 px each side), and the paytable modal and buy dialogs read the same way. This one surface is positioned against its anchor button rather than composed against the viewport, and at this width the anchor is the rightmost control, so the panel is pushed hard into the edge. It also lands across the live reel grid from y=293 down, so `Stop on win`, `Single win limit`, `Stop on feature` and `Loss limit` are read against moving symbols rather than a neutral field.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:2145` and `:2147` (`.p-hud-menu, .p-auto-menu { position: absolute; bottom: calc(100% + 8px); z-index: 65; left: auto; right: auto; transform: none; }` then `.p-auto-menu { right: 0; }`), overriding the centred base rule at `frontend/src/lib/components/HudOverlay.svelte:1770-1783`. The same pattern repeats for the compact landscape layout at `:2230` and `:2232`.
- Proposed fix: below about 500 px, drop the portrait override and let the panel centre on the viewport with the same gutters the other overlays use, or keep `right: 0` but position it against the HUD row rather than the button.

## STC-MOBILEL-B-03 HIGH On the max win overlay the HUD underneath stays legible and its `FEATURES` label lands 11 px below the overlay's own subtitle

- Frames: `reports/screens/stream-test-2026-07-28/257_mobile-l_maxwin_celebration.png`, `reports/screens/stream-test-2026-07-28/256_mobile-l_transition_maxwin_overlay_fade.png`
- Claim: the celebration's own line `PRESS COLLECT OR HIT ENTER TO CONTINUE` occupies rows y=528 to y=534, and the HUD's `FEATURES` button label is still readable through the backdrop at rows y=545 to y=551, an **11 px gap** between two text lines from two different layers, the lower of which is a control the overlay has disabled. Measured across x=150 to x=290: the ghost band peaks at a summed RGB of `190` against a local floor of `127`, a span of `63`, while the celebration's own subtitle on the same axis peaks at `465` against `132`. Faint, but I read the word `FEATURES` off the frame. Further down the same frame the ghosted `$50,000.00`, `$50,000.00` and `$1.00` HUD rows and the `FUTURE SPINNER` wordmark are all still readable. This is the most watched surface in the game and the layer behind it has not gone away.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:193-198`, the backdrop `background: radial-gradient(ellipse at center, rgba(20, 8, 50, 0.97) 0%, rgba(6, 4, 20, 0.99) 100%)`. The 0.97 stop at the centre is what lets the HUD through.
- Proposed fix: take the centre stop to 1.0, or hide the HUD outright while `.c1-max` is mounted so nothing from the layer below can register at all.

## STC-MOBILEL-B-04 MEDIUM The max win celebration fills about a third of the portrait viewport

- Frames: `reports/screens/stream-test-2026-07-28/257_mobile-l_maxwin_celebration.png`, `reports/screens/stream-test-2026-07-28/256_mobile-l_transition_maxwin_overlay_fade.png`
- Claim: the whole content group, the three stars through `MAX WIN` / `REACHED!` / `5,000` `×BET` / the `COLLECT` button / `PRESS COLLECT OR HIT ENTER TO CONTINUE`, runs from about y=270 to y=534 of 812, about **33 per cent of the viewport height**. Sampled bright content rows are y=308 to 337 (`MAX WIN`), y=348 to 377 (`REACHED!`) and y=467 to 475 plus y=505 to 513 (the `COLLECT` button's top and bottom borders). Above y=270 and below y=534 there is nothing but particles and the bleed-through of STC-MOBILEL-B-03. The overlay is centred and correct on a 16:9 stage; at 425x812 it reads as a landscape composition dropped unchanged into a portrait viewport, with two thirds of the screen doing no work at the biggest moment in the game.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:188-192` (`.c1-max { display: flex; align-items: center; justify-content: center; }`) and the type sizes below it.
- Proposed fix: PARK(the amount of extra scale, and whether to distribute rather than scale, is an art call). Two options for the owner: scale the whole group up at narrow portrait widths so it occupies more of the height, or keep the group's size and distribute it, wordmark high, `COLLECT` low, so the emptiness becomes structure rather than surplus.

## STC-MOBILEL-B-05 MEDIUM Both scroll regions cut their content mid glyph against a hard opaque edge; there is no mask anywhere in the tree

- Frames: `reports/screens/stream-test-2026-07-28/234_mobile-l_paytable_07_interface_guide.png`, `reports/screens/stream-test-2026-07-28/235_mobile-l_paytable_08_responsible_play.png`, `reports/screens/stream-test-2026-07-28/236_mobile-l_paytable_09_disclaimer.png`, `reports/screens/stream-test-2026-07-28/240_mobile-l_features_menu.png`
- Claim: in `234` the last interface guide card is sliced horizontally through the x height of the word `Turbo`, leaving roughly the top 60 per cent of the glyphs above the modal's opaque bottom edge. In `235` and `236` the top of the scroll viewport shows an orphan sliver of the previous card, roughly 25 px tall, cut clean under the opaque `PAYTABLE` header. In `240` the sticky footer carrying `All modes · RTP 96.35%` and `BET MODES` overlaps the `Buy Overdrive` card, so `Buy a guaranteed Overdrive` / `Free Spins entry.` runs to within about 10 px of the footer divider and that card's bottom border is never visible at this viewport. `grep -rn "mask-image" frontend/src/` returns **nothing**, so no scroll boundary in the game has a fade or mask: every one of them is a hard opaque cut, and that is what reads as unfinished, not the scrolling.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:593-603` (`.fs-pt-body { overflow-y: auto; ... }`) and `frontend/src/lib/components/FeatureMenu.svelte:875` onward (`.fm-cards { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 14px 20px; ... }`), with the FEATURES footer's `position: sticky` at `frontend/src/lib/components/BuyBonus.svelte:230` as the same pattern on the buy dialog.
- Proposed fix: add a short `mask-image: linear-gradient(...)` fade at the top and bottom of both scroll viewports and enough trailing padding that a cut cannot land inside a line of type.

## STC-MOBILEL-B-06 LOW The reel machine and the control stack are inset by different amounts, so their outer edges step by 4 px down the whole page

- Frames: `reports/screens/stream-test-2026-07-28/255_mobile-l_post_feature_base.png`, `reports/screens/stream-test-2026-07-28/237_mobile-l_transition_paytable_closing.png`
- Claim: in `255` the reel frame's neon border samples at **x=8 and x=418** (gutters of about 8 px and about 6 px), while the FEATURES pill at y=548, the BALANCE and WIN pods at y=618 and the BET row at y=690 every one of them samples at **x=12 and x=413** (gutters of 12 px and 11 px). The two full width edges that run the length of the screen are therefore about **4 px apart on the left and about 5 px on the right**, a visible step rather than one clean margin. The reel machine also sits about 1 px right of the viewport centre (measured centre 213 against a true centre of 212) where the control stack sits on it (measured 212.5).
- Where fixable: `frontend/src/App.svelte:2319` (`.canvas-slot.portrait`) against the HUD slot at `frontend/src/App.svelte:2387` (`.native-hud-slot.portrait`) and `.p-hud`'s own padding in `frontend/src/lib/components/HudOverlay.svelte`. The exact padding declarations were not pinned within this run's source budget; the two insets are set independently, which is the shape of the defect.
- Proposed fix: drive both slots from one gutter custom property.

## STC-MOBILEL-B-07 LOW The layout has no safe area at either end: 5 px above the wordmark, 7 px below the SPIN button

- Frames: `reports/screens/stream-test-2026-07-28/255_mobile-l_post_feature_base.png`, `reports/screens/stream-test-2026-07-28/237_mobile-l_transition_paytable_closing.png`, `reports/screens/stream-test-2026-07-28/259_mobile-l_post_collect_base.png`
- Claim: in `255` the `FUTURE SPINNER` wordmark's topmost lit row samples at **y=5** and the SPIN button's lowest lit row at **y=804** on a viewport whose last row is 811, so the composition clears the top edge by 5 px and the bottom by 7 px. That is not an asymmetry, it is the absence of any inset at all at both ends: the source sets it literally, `padding: 4px 0 2px` on the wordmark. On a real handset the notch and the home indicator both sit inside that, and in a stream overlay's cropped frame the wordmark and the SPIN button are the first two things lost.
- Where fixable: `frontend/src/App.svelte:2427-2433` (`.portrait-wordmark { flex: 0 0 auto; padding: 4px 0 2px; ... }`) for the top, and the portrait HUD's bottom padding in `frontend/src/lib/components/HudOverlay.svelte` for the bottom.
- Proposed fix: add `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` to the two paddings with a small non zero floor.

## STC-MOBILEL-B-08 LOW The portrait screen shake's 7 px amplitude is larger than the reel machine's own 6 px right gutter

- Frames: `reports/screens/stream-test-2026-07-28/258_mobile-l_transition_maxwin_collect_fade.png`, against `reports/screens/stream-test-2026-07-28/259_mobile-l_post_collect_base.png`
- Claim: **stated first so it is not mistaken for a defect it is not.** Frame `258` catches the whole surface translated 5 px to the left, confirmed on four independent landmarks (BALANCE pod left border 12 to 7, BALANCE pod right border 208 to 203, WIN pod right border 412 to 407, SPIN button centre 213 to 208). That is the documented screen shake, `screen-shake-portrait` at `frontend/src/App.svelte:2228-2237`, whose 60 per cent keyframe is `translate(-5px, 4px)`, fired correctly on a max win by `triggerShake()` at `frontend/src/App.svelte:506-512`. **It is behaving as designed and I am not reporting it as a defect.** What IS a finding is the amplitude against the gutter: the keyframes reach `translate(-7px, 5px)` and `translate(7px, -5px)`, while the reel frame's measured gutters at this viewport are about 8 px left and about 6 px right (see STC-MOBILEL-B-06). At the `+7px` extreme the reel machine therefore reaches or passes the right viewport edge. The 5 px displacement actually captured in `258` already closes the left gutter from 8 px to 3 px. The amplitude was chosen for a wide stage and never re-derived against the 425 px gutter.
- Where fixable: `frontend/src/App.svelte:2228-2234` (the `screen-shake-portrait` keyframes).
- Proposed fix: express the amplitude as a custom property and clamp it below the smaller gutter at narrow widths, for example `min(7px, var(--gutter) - 2px)`.

## STC-MOBILEL-B-09 LOW A 63 px empty band sits between the reel machine and the FEATURES button in base mode and is decorated only in feature mode

- Frames: `reports/screens/stream-test-2026-07-28/237_mobile-l_transition_paytable_closing.png`, `reports/screens/stream-test-2026-07-28/255_mobile-l_post_feature_base.png`, compared against `reports/screens/stream-test-2026-07-28/245_mobile-l_transition_feature_entry_fade.png`
- Claim: sampled down the control stack's left border column in `255`, the reel machine's lower chrome ends at y=466 and the FEATURES pill begins at y=529, a gap of **63 px**, against gaps of **24 px** (FEATURES to BALANCE, 567 to 591), **16 px** (BALANCE to BET, 645 to 661) and about **30 px** (BET to the control row). One gap at roughly three times the rhythm of its neighbours. The honest reading, recorded because it cuts against calling this a hole: `.canvas-slot.portrait` is `flex: 1 1 0` (`frontend/src/App.svelte:2319`), the reel machine is width bound at this viewport, and the surplus height is split roughly evenly above and below it (about 70 px above, 63 px below), so this is centring rather than a layout bug, and the source comment at `frontend/src/App.svelte:2387` shows a much larger dead band in this region was already found and fixed. What remains a composition observation is that in feature mode (`245` through `253`) the same band carries the flame jet decoration and in base mode it carries nothing, so the two modes differ by a void.
- Where fixable: `frontend/src/App.svelte:2319-2330` (`.canvas-slot.portrait`), with `frontend/src/lib/components/FlameJets.svelte` as the element that fills the band in feature mode.
- Proposed fix: PARK(deciding whether the band wants an occupant in base mode is an art call, not a mechanical one).

## STC-MOBILEL-B-10 LOW Both buy dialogs orphan the single word `bet?` onto its own centred line

- Frames: `reports/screens/stream-test-2026-07-28/242_mobile-l_dialog_buy_overdrive.png`, `reports/screens/stream-test-2026-07-28/241_mobile-l_transition_dialog_buy_overdrive_opening.png`, `reports/screens/stream-test-2026-07-28/244_mobile-l_dialog_nitro_overdrive.png`, `reports/screens/stream-test-2026-07-28/243_mobile-l_transition_dialog_nitro_overdrive_opening.png`
- Claim: the subtitle sets as `Start Overdrive Free Spins now at 100× your` across a full width first line with `bet?` alone on the second, and identically as `Start Overdrive Free Spins now at 400× your` / `bet?` on the NITRO dialog. A one word second line directly under the dialog's title is the classic orphan and it sits at the most looked at point of the surface.
- Where fixable: `frontend/src/lib/i18n/translations.ts:1537` (`buyConfirmBody: 'Start Overdrive Free Spins now at {cost}× your bet?'`), rendered at `frontend/src/lib/components/BuyBonus.svelte:101` into `.buy-desc`.
- Proposed fix: a non breaking space between `your` and `bet?` will not help on its own, since it would move two words down; reduce `.buy-desc`'s max width by a few per cent so it breaks evenly, and check the same string in the other fifteen locales before landing it.

## STC-MOBILEL-B-11 LOW The `PRICE` / `RTP` / `MAX WIN` row loses its shared baseline because only the third cell wraps

- Frames: `reports/screens/stream-test-2026-07-28/242_mobile-l_dialog_buy_overdrive.png`, `reports/screens/stream-test-2026-07-28/244_mobile-l_dialog_nitro_overdrive.png`
- Claim: `PRICE` reads `$100.00` (and `$400.00` on NITRO) on one line, `RTP` reads `96.35%` on one line, and `MAX WIN` reads `5,000×` with `base bet` wrapping to a second line, so the three values no longer sit on one baseline row and the row's internal bottom padding is visibly larger under the two single line cells than under the wrapped one. Each cell is `flex: 1` of a pod about 352 px wide, so about 117 px, which `5,000× base bet` at `0.92rem` cannot hold. This is the same class as TR-037, recorded in `frontend/src/lib/config/fsModes.ts:161-163`, which split the phrase precisely so the figure would not clip on the mode cards; the buy dialog still renders the whole phrase as one value.
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:131-135` and `:234-241` (`.buy-stat { flex: 1; ... }`), with the string built by `maxWinVsBaseBetLabel()` at `frontend/src/lib/config/fsModes.ts:157-159`.
- Proposed fix: apply the TR-037 split here too, `5,000×` as the value and `base bet` as a smaller qualifier line that every cell reserves space for, so all three cells are the same height whether or not they use it.

## STC-MOBILEL-B-12 LOW The win info strip is squeezed into a band about 16 px tall inside the reel frame's inner bottom edge

- Frames: `reports/screens/stream-test-2026-07-28/255_mobile-l_post_feature_base.png`, `reports/screens/stream-test-2026-07-28/254_mobile-l_transition_feature_exit.png`, `reports/screens/stream-test-2026-07-28/247_mobile-l_transition_feature_starting.png`
- Claim: the strip reading `L2  x5  1ways  $0.60` in `255` and `SCATTER  x5  5 ways  $10.00` in `254` and `247` sits between the bottom symbol row, ending at about y=417, and the frame's inner border at about y=433. Clearance above the type is roughly 7 px and below it roughly 3 px, so the line is both tight and off centre in its own band, against a bright cyan border on the tighter side.
- Where fixable: UNKNOWN. Not located within this run's source budget; the strip renders inside the reel stage, so `frontend/src/lib/components/GameGrid.svelte` is the first place to look.
- Proposed fix: centre the strip in its band and add a few pixels of bottom inset to the reel viewport.

## Explicit absences, signed

- **Viewport edge collisions in the settled base layout**: checked in `237`, `254`, `255`, `259`. Nothing in the settled base layout is clipped by a viewport edge. The nearest approaches are the 5 px and 7 px clearances recorded as STC-MOBILEL-B-07; the SPIN button is fully inside the frame in every base frame in my range.
- **Bottom control row symmetry**: checked by sampling row y=766 in `255` and `259`. The SPIN button's circle samples at x=175 to x=251, centre **213**, against a true viewport centre of 212, so the row's anchor is centred to within 1 px. The flanking glyph runs (about x=27 to 45 and x=84 to 98 on the left, x=317 to 346 and x=379 to 391 on the right) suggest the right pair sits about 4 px inside the mirror of the left pair, but those runs are glyph extents rather than button chrome and the `MAX` label is text where the other four are circles, so **the measurement is not clean enough to support a finding and I am not raising one**.
- **Modal gutter symmetry**: checked in `234`, `235`, `236`, `239`, `240`, `241`, `242`, `243`, `244`. The FEATURES panel samples at x=17 and x=407 (17 px each side) and the paytable modal and both buy dialogs read the same way. The autoplay popover is the only asymmetrically placed overlay in my range and is raised as STC-MOBILEL-B-02.
- **The autoplay option list is NOT cut off, and I checked because I first thought it was.** The `SPINS` values sample at rows y=523 to 534 (`10`), 567 to 578 (`25`), 611 to 622 (`50`), 655 to 666 (`100`) and 703 to 710 (`∞`), a clean 44 px pitch with the `∞` on pitch to within 2 px, and the panel's bottom border samples at y=733, leaving **23 px below the last option**. The `∞` glyph is short because `∞` has no ascender or descender, not because it is clipped. No finding.
- **HUD crowding at 425x812**: checked in every base and feature frame in my range. The HUD stack does not crowd or overlap at this viewport; the composition problem in that region is the opposite one, raised as STC-MOBILEL-B-09.
- **The left hand yellow rail on the paytable and FEATURES panels** (`234`, `235`, `236`, `239`, `240`) runs at effectively full panel height in all five frames while the content is clearly scrolled. If it is a scroll indicator it is not tracking; if it is a decorative border it is correct. I did not settle which, so per convention (l.6) this is PARKED as an observation and NOT raised as a finding.
- **Frames 248 to 253, the six `feature_run` frames, do not show the feature.** All six render the same Overdrive entry card with `+16 FREE SPINS` and `TAP TO CONTINUE` that `245`, `246` and `247` already show; only the cycling win info strip changes between them (`L2  x5  1ways  $0.60` in `245`, `246`, `250`, `251`, `252`, and `SCATTER  x5  5 ways  $10.00` in `247`, `248`, `249`, `253`). **I therefore make no composition claim about the in flight Overdrive free spins layout at 425x812, because no frame in my range shows it.** Recorded so my silence on that surface is not read as a pass.
- **Frame `259_mobile-l_post_collect_base.png` is not a base frame.** The manifest note reads `Back to base after collect, balance settled`; the frame renders another Overdrive entry card with `+8 FREE SPINS` and `TAP TO CONTINUE`. A scope limitation, not a composition finding.
- **Four `transition` frames in my range are indistinguishable from their settled neighbours**: `237` (manifest note `Paytable mid-close`) shows no paytable and no scrim at all, `239` matches `240`, `241` matches `242`, `243` matches `244`, and `245` matches `246`. A missed frame is not proof that an animation does not exist, so I raise no finding about transition timing. I record it because it means **I could not judge the composition of any mid open or mid close state in my range.** The one transition frame that did catch motion, `258`, is accounted for in STC-MOBILEL-B-08.
- **Frames `235` and `236` are visually identical**, so paytable section 09 `DISCLAIMER` never appears scrolled to the top of its own viewport. Both sections fit one screen, so this is not a composition defect and no finding is raised.

## KNOWN matches

- **No KNOWN row and neither MID finding matched in my range.** Checked, rather than assumed: TR-104 (`BIG WIN` and `x BET` in English on a localised session) does not apply, my session is `en`. TR-115 / TR-086 (money display fit failures) does not apply, every money readout in my 26 frames sits inside its container without clipping, ellipsis or overflow (`$50,000.00`, `$5,000.00`, `$363.89`, `$318.64`, `$100.00`, `$400.00`, `$16.20`, `$10.80`, `$2.80`, `$1.00`, `$0.60`, `$0.20`, `$0.00`). TR-114 (replay ghost pod) does not apply, no replay surface appears in my range. Q-34 (`Cruise` against `CRUISE`) is visible as `Cruise` on the FEATURES card in `239` and `240`, but no HUD badge appears in the same frames so I have no cross surface pair to evidence, and it is not a composition finding in any case. MID-01 (banner and HUD pod disagreeing mid count up) does not appear; no big win count up frame falls in my range. MID-02 (`16x BET` with a letter `x`) does not appear; the only banner style unit in my range is `×BET` on the max win overlay in `256` and `257`.

tree_after: `git status --porcelain` at close of run, verbatim. Nothing MODIFIED, nothing DELETED. Every line is an untracked shard; only the first is mine, the rest belong to other squads.

```
?? reports/qa/stream_test/shards/STC-MOBILEL-B.md
?? reports/qa/stream_test/shards/STC-MOBILEM-A.md
?? reports/qa/stream_test/shards/STC-MOBILEM-B.md
?? reports/qa/stream_test/shards/STC-MOBILES-A.md
?? reports/qa/stream_test/shards/STC-MOBILES-B.md
?? reports/qa/stream_test/shards/STC-STRETCH-A.md
?? reports/qa/stream_test/shards/STC-STRETCH-B.md
?? reports/qa/stream_test/shards/STL-DE-A.md
?? reports/qa/stream_test/shards/STL-DE-B.md
?? reports/qa/stream_test/shards/STM-DESKTOP.md
?? reports/qa/stream_test/shards/STM-LAPTOP.md
?? reports/qa/stream_test/shards/STM-MOBILEM.md
?? reports/qa/stream_test/shards/STM-MOBILES.md
?? reports/qa/stream_test/shards/STM-POPOUTL.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STM-STRETCH.md
?? reports/qa/stream_test/shards/STT-DESKTOP-A.md
?? reports/qa/stream_test/shards/STT-DESKTOP-B.md
?? reports/qa/stream_test/shards/STT-LAPTOP-A.md
?? reports/qa/stream_test/shards/STT-LAPTOP-B.md
?? reports/qa/stream_test/shards/STT-POPOUTL-B.md
?? reports/qa/stream_test/shards/STT-POPOUTS-A.md
?? reports/qa/stream_test/shards/STT-POPOUTS-B.md
```
