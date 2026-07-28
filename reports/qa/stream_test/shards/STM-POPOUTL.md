# STM-POPOUTL, motion residue (popout-l, frames 105 to 156)

scope: every `popout-l` frame whose filename contains `transition_`, 18 of them: 105, 107, 109, 111, 112, 117, 118, 120, 123, 134, 136, 138, 140, 142, 144, 151, 153, 155. Settled endpoints opened for comparison and not counted against the set: 106, 108, 110, 113, 116, 119, 121, 124, 135, 137, 139, 141, 143, 145, 150, 152, 154, 156. Viewport 800x450, lang en, build `d9bdf22`. All frame paths below are relative to `reports/screens/stream-test-2026-07-28/`.
frames_read: 18

## STM-POPOUTL-01 STREAM The reel window is transparent at spin start, and the street shows through the board

- Frames: `111_popout-l_transition_reels_accelerating.png`. Endpoints that do not contain the state: `110_popout-l_base_idle.png`, `112_popout-l_transition_reels_full_speed.png`.
- Claim: at the moment the manifest calls `Reels accelerating, about 250ms after spin press`, reels 1, 2 and 3 have vacated cells, and those cells are not merely empty, they are transparent. The car roof, the windscreen, the wet road, the magenta neon and the rain of the scene layer are all plainly visible INSIDE the reel window, framed by the lit bezel. Reel 1 carries three symbols and one hole, reel 2 two symbols and two holes, reel 3 one symbol and three holes, while reels 4 and 5 still hold their four pre-spin symbols each. The cell plate travels with the symbol, `background: rgba(28, 29, 46, 0.88)` on `.symbol-cell`, so a cell with no symbol has no plate either and the board reads as a window onto the street. Neither endpoint has a single transparent cell. This is the opening 250 ms of every spin, in the busiest part of the frame.
- Where fixable: `frontend/src/lib/components/GameGrid.svelte:1203` (`.grid-container`, the 616x412 reel viewport) and `:1228` (`.symbol-col`, described in its own comment at `:1227` as *a fixed viewport that clips its travelling strip*). Both set `overflow: hidden` and neither sets any `background`, so whatever the strip does not cover falls through to the scene. Not locked.
- Proposed fix: give `.grid-container` an opaque background in the plate tone, for example the `rgba(28, 29, 46, 1)` that `.symbol-cell` already uses at `:1259`, so a gap in the strip shows the inside of the machine rather than the city.

## STM-POPOUTL-02 STREAM Collect on max win returns the player to a board that is still held at a fifth opacity, with the win glow still on it

- Frames: `155_popout-l_transition_maxwin_collect_fade.png`. Endpoints: `154_popout-l_maxwin_celebration.png` (overlay opaque over the board), `156_popout-l_post_collect_base.png` (board present at normal brightness under the next entry card).
- Claim: after COLLECT is pressed, the overlay has cleared from every layer except the board. The reel window is black with a large diffuse gold glow in it, and the twenty symbols and the win lines survive only as ghosts. Everything around the board is already fully settled and at full brightness, measured on flat regions against the following settled frame `156`: balance pod `202c3c` against `212d3d`, city backdrop `16202a` against `17202a`, title strip `4c6d6d` against `4c6d6d`. So the dismissal completed everywhere except inside the bezel, which is simultaneously blanked and left glowing. Neither endpoint contains an empty gold board. This is the frame immediately after the biggest event the game has.
- Where fixable: `frontend/src/lib/components/GameGrid.svelte:757` and `:758`. The MAX-WIN HOLD re-arms its own teardown while the cap is live, `if (get(isWincap)) { winBurstTimer = armWinBurstTeardown(); return }`, which is correct for the hold itself and is documented at `:745` to `:756`. Nothing clears the hold when the celebration is COLLECTED: the only other route out is `_resetToIdle()` at `:773`, which runs on the next spin. So the dim state, `.symbol-img.loser-dim` at `:1525` with `opacity: 0.2 !important; filter: grayscale(0.6) brightness(0.62) !important`, survives the overlay it was hiding behind. Not locked.
- Proposed fix: clear the hold on collect as well as on the next spin, by running the teardown body once when `isWincap` falls, so the board is restored under the fading overlay rather than after it.

## STM-POPOUTL-03 HIGH The shock ring is painted on top of the BIG WIN banner, and the code says it should be behind

- Frames: `117_popout-l_transition_bigwin_countup_early.png`. Endpoints without it: `118_popout-l_transition_bigwin_countup_late.png`, `119_popout-l_bigwin_settled.png`.
- Claim: a large circular stroke, about 140 px across on an 800 px frame, is painted over the banner. It crosses the banner's dark fill on both sides of the amount and passes through the band that carries `$10.28`. The frame proves the ordering rather than assuming it: the teal win lines that drop from the reels are OCCLUDED by the same banner fill, so the fill is opaque, and anything visible on top of it is above it. The ring is absent from `118` and `119`, so the celebration passes through a state neither endpoint contains.
- Where fixable: `frontend/src/lib/components/WinBanner.svelte:451`. `.c1-shockwave` is given `z-index: 1`, while the plate that follows it inside the same `.c1-plate-wrap` is `.fs-plate` at `:357`, `position: relative` with no `z-index` at all. A positioned element with `z-index: auto` paints below one with a positive `z-index`, so the ring wins. The comment immediately above, `:447` to `:449`, states the intent as the opposite: the ring is scaled per tier *so it feels proportionate to the plate it's bursting behind*. Not locked.
- Proposed fix: change `.c1-shockwave` to `z-index: 0`. It precedes the plate in the markup at `:251` to `:259`, so at `0` it paints in tree order, behind. Give `.fs-plate` an explicit `z-index: 2` if the wrapper's other layers need to stay ordered.

## STM-POPOUTL-04 HIGH The spin control shows a featureless dark blob for the whole of the spin

- Frames: `111_popout-l_transition_reels_accelerating.png`, `112_popout-l_transition_reels_full_speed.png`. Endpoint: `113_popout-l_dead_spin_1_settled.png`.
- Claim: through both mid-spin frames the glyph in the primary control is a dark disc with a pointed spur on its upper right and a bite out of its lower right. It is not a stop square, not a pause bar, not a ring or arc that reads as a spinner and not the play triangle: it is a shape with no name. The settled frame shows a clean play triangle in the same button, so the blob is the spin state itself rather than a one-instant morph, since it is present both about 250 ms after the press and again later at what the manifest calls full speed. This is the largest single element in the control bar.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:919`, the swapped-in glyph `<svg class="glyph arrows" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M18 3v5h-5"/></svg>`, shown by `:1549`. Its style at `:1538` to `:1540` is a 30 px box with `stroke-width:5` and `filter:drop-shadow(0 0 6px var(--acc))`. A stroke of 5 on a 24 viewBox rendered at 30 px is a quarter of the icon's width, and a 6 px shadow on a 30 px icon fills what little hole the arc leaves, so at this viewport the circular arrow closes up into a disc. Not locked.
- Proposed fix: halve `stroke-width` to about `2.5` and reduce the drop shadow to about `2px` on `.glyph.arrows` only, so the arc keeps its counter at small sizes. Worth checking the same glyph on the mobile skins at `:2128` and `:2362`, which reuse it.

## STM-POPOUTL-05 HIGH The frame captured at full speed is the settled board, with no motion treatment of any kind

- Frames: `112_popout-l_transition_reels_full_speed.png`. Endpoint: `113_popout-l_dead_spin_1_settled.png`.
- Claim: over the reel region (`x` 255 to 525, `y` 60 to 280) the mean absolute difference between the full-speed frame and the settled frame is `1/255` per channel. Every one of the twenty symbols is the same symbol, in the same grid position, at the same sharpness. There is no blur, no vertical smear, no sub-cell offset and no part-symbol at the window edge. At the same moment the control is still in the state described in STM-POPOUTL-04, so the game presents as spinning while showing a fully resolved, perfectly aligned board. Recorded honestly beside it, because it bears on the reading: `113`, `114` and `115` are three different dead spins and their boards are identical to each other at the same `1/255`, so the board does not change across the three captured base spins either. That weakens any inference about what the reels did between captures. It does not weaken the claim about what is on screen in `112`.
- Where fixable: UNKNOWN. The velocity treatment exists and is wired: `.tile-inner` at `frontend/src/lib/components/GameGrid.svelte:1264` carries `transform: scaleY(var(--ts, 1))` and `opacity: var(--ta, 1)`, described at `:1262` as *velocity stretch/alpha come from per-reel CSS vars set on the strip*. The frame shows both at rest. A single still cannot separate "the strip had already landed" from "the stretch was never applied", and a second capture inside the spin would settle it.
- Proposed fix: PARK(needs one more capture inside the spin before anything is changed; the mechanism is present and may simply have finished).

## STM-POPOUTL-06 MEDIUM The HUD menu and the paytable have no entrance animation at all, while every neighbouring surface has one

- Frames: `120_popout-l_transition_menu_opening.png`, `123_popout-l_transition_paytable_opening.png`, and, with cause not established, `105_popout-l_transition_splash_entrance.png`, `109_popout-l_transition_rules_to_base.png`, `134_popout-l_transition_paytable_closing.png`, `151_popout-l_transition_feature_exit.png`.
- Claim: each of these six is its own endpoint. `120`, called `HUD menu mid-open`, is EXACTLY equal to `121` over the menu panel region, mean `0` and maximum `0`. `123`, called `Paytable mid-open`, differs from `124` by mean `0` and maximum `1`. `105` differs from `106` by a whole-frame mean of `0/255` and `0/255` over the logo region. `109` samples identical to the settled base `110` on all four probes taken (balance pod `1f2c3b`, spin button `03787e`, city `17202a`, reel bezel `30a3b0`). `134` and `151` likewise sample equal to their settled successors within `1/255`. For the first two the source settles the question rather than leaving it to timing: the menu panel `.hud-menu` at `HudOverlay.svelte:1598` to `:1608` declares no `animation` and no `transition`, and `PaytableModal.svelte` contains no `animation:` property, no CSS `transition:` on the panel and no Svelte transition directive anywhere. They snap. Against that, `136`, `138` and `140` each differ from their settled frame by a uniform edge halo consistent with a scale that is nearly complete (means `6,6,5`, `10,7,9`, `9,6,8`), and the max win overlay animates too, so a viewer sees the two most-opened surfaces in the game arrive with a hard cut while everything beside them eases in.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1598` and `frontend/src/lib/components/PaytableModal.svelte` (panel root). Not locked. Recorded for the marshal rather than as part of this finding: the capture harness shoots these two after `settle(page, 160)` at `frontend/scripts/stream_test_capture.mjs:299` and `settle(page, 200)` at `:315`, so even a short animation would have finished; the source is what makes the pop a fact rather than an inference.
- Proposed fix: a 120 to 160 ms scale-and-fade on both, matching the treatment the features menu and the buy dialogs already carry, so the modal family behaves as one.

## STM-POPOUTL-07 MEDIUM The frame labelled entry card dismissing shows the card fully up, and so do all six feature-run frames

- Frames: `144_popout-l_transition_feature_starting.png`. Context: `142`, `143`, `145` through `150`.
- Claim: the manifest note for `144` is `Feature starting, entry card dismissing`. The card is not dismissing: it is at full opacity, and `144` differs from the settled entry card `143` by a mean of `2/255` and from `145` by `3/255`, both at the scene idle animation floor measured elsewhere in this session. The `TAP TO CONTINUE` region samples a near-constant `e8c523` to `ebc723` across `143`, `144`, `145`, `146`, `147`, `148`, `149` and `150`, and only clears at `151`. The six run frames are spaced `settle(page, 2200)` apart, so the card stood for upwards of thirteen seconds after the continue click was issued. Either the click never landed or the control did not respond, and the frames cannot separate the two. What the frames do establish is that this session contains no picture of the feature running and none of the card leaving, so the feature entry transition is unaudited rather than clean.
- Where fixable: `frontend/scripts/stream_test_capture.mjs:409` issues the click through `clickLive`, defined at `:193` to `:203`, which swallows any click failure with `.catch(() => {})` and returns `true` regardless, and the call site does not read the return value. A click that never landed is therefore reported as a success and produces exactly this frame run. Not locked, and not the game.
- Proposed fix: have `clickLive` return the real outcome and assert the card is gone before shooting the dismissal frame, so a stuck gate fails the capture instead of quietly filling seven frames with the same picture.

## STM-POPOUTL-08 MEDIUM The max win overlay's own instruction line lands on a still-legible HUD during the fade-in

- Frames: `153_popout-l_transition_maxwin_overlay_fade.png`. Endpoints without it: `152_popout-l_post_feature_base.png` (no overlay), `154_popout-l_maxwin_celebration.png` (overlay opaque, same region measured black).
- Claim: in the transition frame the balance readout `$50,00` and the label `BALANCE` are legible under the celebration, as are the three bars of the menu button, and the overlay's own line `PRESS COLLECT OR HIT ENTER TO CONTINUE` runs along the same baseline as the balance digits and starts about 20 px to their right, so the row reads as one interleaved string of two unrelated messages. Measured rather than eyeballed: over the balance text region the luma range is 45 to 154 in `153` against 18 to 240 unobstructed in `110`, so roughly half the contrast is still coming through, while the same region in the settled `154` is flat black. The celebration headline and the COLLECT button are already at full strength in the same frame, so this is not "everything is halfway", it is the content arriving before the backdrop it needs.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:201`, the backdrop `animation: c1-fadein 0.55s ease both`, against `:251`, the content `animation: c1-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both` whose keyframes at `:253` to `:256` reach `opacity: 1` at 60 per cent of the timeline on a back-out curve. The content is therefore fully opaque at roughly 0.36 s while the backdrop is still part way through 0.55 s of a plain `ease`. Not locked.
- Proposed fix: hold the content's opacity to the backdrop's, either by moving the fade to a shared parent or by making `c1-enter` animate transform only and letting `c1-fadein` own opacity for both.

## STM-POPOUTL-09 LOW The max win multiplier is set as three different treatments in one lockup, and disagrees with the banner on the glyph as well

- Frames: `153_popout-l_transition_maxwin_overlay_fade.png`, endpoint `154_popout-l_maxwin_celebration.png`.
- Claim: `5,000` is drawn large in gold, the multiplication sign is orange at under half that size and dropped onto a different vertical alignment, and `BET` is smaller again and dimmer, with almost no space between the sign and the `B` while a wide gap sits between `5,000` and the sign. Verified in source rather than measured off the frame: `.c1-max-mult` is `font-size: 96px` in `--sig-gold` (`MaxWinCelebration.svelte:301`), `.c1-max-x` is `font-size: 46px` in `--sig-orange` with `align-self: flex-end; padding-bottom: 0.12em` (`:308`) overriding the wrapper's own `align-items: baseline` (`:295`), and `.c1-max-betlabel` is `font-size: 22px` in `--sig-orange` at 72 per cent (`:316`). The wrapper's single `gap: 0.1em` resolves once and is applied to both joints, which is why the spacing reads uneven between glyphs that differ four to one in size. Recorded beside it because it corrects an assumption that looked obvious from the frame: this surface writes the sign CORRECTLY as `×`, U+00D7, at `:155`, so it is not an instance of MID-02; the win banner two surfaces earlier writes the same quantity as `16x BET` with a letter `x`. The two celebration surfaces therefore disagree on the glyph AND on the typographic treatment of the same lockup.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:295` to `:320`. Not locked.
- Proposed fix: set the sign and the label at one size and one colour and give the two joints their own spacing, so `× BET` reads as one unit rather than as two spans that happen to be adjacent.

## Explicit absences, signed

- **No z-order fault on the paytable, the features menu or either buy dialog.** Checked `123` against `124`, `136` against `137`, `138` against `139` and `140` against `141` by amplified difference image. In every case the difference is a uniform outline halo around every edge of the panel and its text, the signature of a small scale or translate, not of a surface drawn into the wrong layer. Nothing of the game behind is painted above the panel in any of the four.
- **No backdrop blur applied to the wrong layer anywhere in the set.** Looked on all eighteen frames for a blurred region whose boundary does not follow the surface that owns it. None found.
- **No scrim rate mismatch on the rules card at `107`.** The impression of one was checked and is refuted: the top bar reads `122122` in the transition against `375154` unscrimmed at `110` and `071616` fully scrimmed at `108`, putting the scrim about 77 to 81 per cent of the way to its settled value while the card is close to solid. The two are in step. The reel bezel and the cell grid ARE visible through the card at `107`, which is what a cross-fade looks like, and is not reported.
- **No dimming change through the big win count-up.** The impression that the HUD dimmed at `117` and recovered at `118` was measured and refuted: the balance pod reads `1f2b3b`, `1f2b3b`, `1f2c3b`, `1f2c3b` across `116`, `117`, `118`, `119`, and the character and city probes move by at most `2/255`. Signed as not a finding.
- **The shock ring in STM-POPOUTL-03 is NOT off palette.** It looked grey in the frame, so the asset was checked before the claim was written: `frontend/public/assets/themes/future-spinner/ui/particles/shock_ring.png` is 128x128 RGBA and averages `083232`, a dark teal. The grey reading is the ring at low alpha over a dark plate. Only the stacking order is reported.
- **No ghost of a dismissed surface on the paytable close `134` or the feature exit `151`.** Both sample equal to the settled base on the balance pod, the city backdrop and the title strip. That is the reverse of STM-POPOUTL-02, and it is why that one is reported: the game clears its overlays cleanly everywhere except the max win collect.
- **No text sharing pixels with other text anywhere except STM-POPOUTL-08**, and that one is adjacency on a shared baseline rather than literal overprint, which is why it is worded that way. Checked all eighteen frames, including the banner over the reels at `117` and `118`, the panels over the HUD at `136`, `138` and `140`, and the entry card over the board at `142` and `144`.
- **No element caught mid-teleport, and no element drawn twice at two positions.** Nothing in the set shows a component outside the span between its two endpoints.
- **Out of lens, recorded for the marshal rather than claimed as mine.** The balance pod reads `$50,000.00` in every frame from `110` through `156`, across the whole session including a big win, a bought feature and a max win, measured by direct sample rather than by eye, while the WIN pod does move (`$0.00`, `$3.90`, `$15.95`, `$16.20`, `$319.22`, `$363.89`, `$5,000.00`). Also out of lens: `156` is captioned `Back to base after collect` and shows an Overdrive free spins entry card reading `+8 FREE SPINS`, not the base game. Neither is a motion-residue finding and neither is written up as one.

## KNOWN matches

- KNOWN(MID-01): `117_popout-l_transition_bigwin_countup_early.png`, banner reads `$10.28` while the HUD WIN pod reads `$15.95`, on a win that settles at `$16.20` in `118` and `119`. Fresh evidence for the popout-l pair the ledger already names; the ledger's transcribed figure for the desktop sibling is `$10.29`, this session's popout-l figure is `$10.28`.
- KNOWN(MID-02): `117_popout-l_transition_bigwin_countup_early.png` and `118_popout-l_transition_bigwin_countup_late.png` render `16x BET` with the letter `x`. Correction offered to the ledger, not a new finding: MID-02's frame count includes *its max-win frames*, and on this session the max win overlay is a different component that writes `×` correctly at `MaxWinCelebration.svelte:155`. If the banner is beneath the overlay on those frames the count may still hold, but the visible `5,000×BET` on `153` and `154` is not MID-02.
- KNOWN(Q-16 park): `153_popout-l_transition_maxwin_overlay_fade.png` carries the parked hardcoded English string `PRESS COLLECT OR HIT ENTER TO CONTINUE` on a stream-visible surface. This session is `en`, so the park's urgency is unchanged by it; recorded so the frame exists in the register.

tree_after: `git status --porcelain` at the end of the run, verbatim. Every line is `??`, untracked. Nothing MODIFIED, nothing DELETED. My own shard is `reports/qa/stream_test/shards/STM-POPOUTL.md`; the other 34 lines are other squads' shards, which are not mine and not my problem.

```
?? reports/qa/stream_test/shards/STC-MOBILEL-B.md
?? reports/qa/stream_test/shards/STC-MOBILEM-A.md
?? reports/qa/stream_test/shards/STC-MOBILEM-B.md
?? reports/qa/stream_test/shards/STC-MOBILES-A.md
?? reports/qa/stream_test/shards/STC-MOBILES-B.md
?? reports/qa/stream_test/shards/STC-STRETCH-A.md
?? reports/qa/stream_test/shards/STC-STRETCH-B.md
?? reports/qa/stream_test/shards/STL-AR-A.md
?? reports/qa/stream_test/shards/STL-AR-B.md
?? reports/qa/stream_test/shards/STL-DE-A.md
?? reports/qa/stream_test/shards/STL-DE-B.md
?? reports/qa/stream_test/shards/STM-DESKTOP.md
?? reports/qa/stream_test/shards/STM-LAPTOP.md
?? reports/qa/stream_test/shards/STM-MOBILEL.md
?? reports/qa/stream_test/shards/STM-MOBILEM.md
?? reports/qa/stream_test/shards/STM-MOBILES.md
?? reports/qa/stream_test/shards/STM-POPOUTL.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STM-STRETCH.md
?? reports/qa/stream_test/shards/STT-DESKTOP-A.md
?? reports/qa/stream_test/shards/STT-DESKTOP-B.md
?? reports/qa/stream_test/shards/STT-LAPTOP-A.md
?? reports/qa/stream_test/shards/STT-LAPTOP-B.md
?? reports/qa/stream_test/shards/STT-MOBILEL-A.md
?? reports/qa/stream_test/shards/STT-MOBILEL-B.md
?? reports/qa/stream_test/shards/STT-MOBILEM-A.md
?? reports/qa/stream_test/shards/STT-MOBILEM-B.md
?? reports/qa/stream_test/shards/STT-MOBILES-A.md
?? reports/qa/stream_test/shards/STT-MOBILES-B.md
?? reports/qa/stream_test/shards/STT-POPOUTL-A.md
?? reports/qa/stream_test/shards/STT-POPOUTL-B.md
?? reports/qa/stream_test/shards/STT-POPOUTS-A.md
?? reports/qa/stream_test/shards/STT-POPOUTS-B.md
?? reports/qa/stream_test/shards/STT-STRETCH-A.md
?? reports/qa/stream_test/shards/STV-REST.md
```
