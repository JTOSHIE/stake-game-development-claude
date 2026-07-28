# STM-DESKTOP, motion residue (desktop session, frames 001 to 051)

scope: Every frame of the `desktop` session whose filename contains `transition_`, 18 of them: 001, 003, 005, 007, 008, 013, 014, 016, 019, 030, 032, 034, 036, 038, 040, 047, 049, 051. Each was judged against the settled frames either side, which were opened as comparison and do not count against the set: 002, 004, 006, 012, 015, 017, 020, 021, 029, 031, 033, 035, 037, 039, 041, 048, 050, 052. MANIFEST.json read first for what each frame is meant to show. Lens: two surfaces overlapping wrongly, pops, mid-teleport, wrong opacity, mid-transition z-order, ghosts of dismissed surfaces, orphaned glow or backdrop, backdrop blur on the wrong layer, text over text.
frames_read: 18 assigned, plus 18 settled comparison frames, 36 opened in total.

## STM-DESKTOP-01 STREAM The reel window goes see-through during reel acceleration and the scene art shows through the grid

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/007_desktop_transition_reels_accelerating.png (endpoints /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/006_desktop_base_idle.png and /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/008_desktop_transition_reels_full_speed.png)
- Claim: The manifest calls 007 `Reels accelerating, about 250ms after spin press`. In it the reel viewport has no fill of its own, so wherever the travelling strip leaves a gap the parallax scene is painted straight through the grid: the car roofline, the wet road and the magenta neon triangle of the street scene are visible inside the reel window across the middle and lower part of reels 2, 3 and 4, and reel 3 is empty from below its top symbol all the way down. Reels 4 and 5 still hold the idle piston column, so the see-through region sits directly beside fully painted cells and reads as a hole, not as an effect. Neither endpoint contains it: 006 and 008 both have all twenty cells opaque. The source confirms the mechanism rather than the frame merely suggesting it: the only fill in the whole stack is on the tile, `background: rgba(28, 29, 46, 0.88)` at `GameGrid.svelte:1259`, while `.grid-container` (`GameGrid.svelte:1204-1215`) and `.symbol-col` (`GameGrid.svelte:1225-1233`) declare no `background` at all, only geometry, `overflow: hidden` and a box shadow. Every spin in the game passes through this, which is why it is STREAM and not HIGH.
- Where fixable: frontend/src/lib/components/GameGrid.svelte:1225-1233 (`.symbol-col`), or :1204-1215 (`.grid-container`); not locked
- Proposed fix: add an opaque fill to `.symbol-col`, matching the tile plate at full alpha, so a gap in the strip reveals the reel window and never the scene.

## STM-DESKTOP-02 STREAM Pressing COLLECT on the max win reveals an empty reel window with the win lines and the celebration glow still painted over nothing

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/051_desktop_transition_maxwin_collect_fade.png (endpoints /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/050_desktop_maxwin_celebration.png and /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/052_desktop_post_collect_base.png)
- Claim: The manifest calls 051 `Collect pressed, overlay mid-fade-out`. The overlay has gone completely, and what it uncovers is a blank reel window: no symbols, no cell backings, only faint ghost outlines (a `W` at about x 500 y 260 and two dim battery silhouettes) plus the previous round's teal win connector lines still drawn diagonally across an empty grid, and a warm amber bloom still glowing at the centre of the window after the surface that produced it has been dismissed. That is two residues at once from the hunt list: a ghost of a dismissed surface still painted, and a glow whose owner has gone. Neither endpoint contains it: 050 is the full celebration and 052 shows a populated grid under the Overdrive entry card. The HUD around it is fully settled at `WIN` `$5,000.00`, so the blank window is not a load state, it is the reveal after the biggest moment in the game. The missing cell backings are the same root cause as STM-DESKTOP-01: with the strip emptied there is nothing behind it, because the fill lives only on the tile (`GameGrid.svelte:1259`).
- Where fixable: frontend/src/lib/components/GameGrid.svelte:1225-1233 for the empty window; the residual connector overlay and the bloom are UNKNOWN (not traced to a line in this pass)
- Proposed fix: fill `.symbol-col` per STM-DESKTOP-01, and clear the win connector overlay and the celebration bloom with the celebration surface rather than after it, holding the last settled board underneath until the next surface is ready.

## STM-DESKTOP-03 HIGH The whole stage is displaced upward part way through the paytable and never comes back, clipping the game wordmark for the rest of the session

- Frames: displaced on /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/030_desktop_transition_paytable_closing.png, 032_desktop_transition_features_menu_opening.png, 034_desktop_transition_dialog_buy_overdrive_opening.png, 036_desktop_transition_dialog_nitro_overdrive_opening.png, 038_desktop_transition_feature_entry_fade.png, 040_desktop_transition_feature_starting.png, 047_desktop_transition_feature_exit.png, 051_desktop_transition_maxwin_collect_fade.png. Not displaced on 001, 003, 005, 007, 008, 013, 014, 016, 019. Settled corroboration: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/020_desktop_paytable_top.png (not displaced) against 021_desktop_paytable_01_match_symbols_on_adjacent_reels_st.png (displaced), and 006_desktop_base_idle.png against 031_desktop_autoplay_menu.png, 048_desktop_post_feature_base.png and 052_desktop_post_collect_base.png.
- Claim: In 006 and every frame up to 020 the `FUTURE SPINNER` wordmark sits fully inside the frame with clear space above it, and the viewport ends at the base of the HUD bar. From 021 onward the same wordmark is cut by the top edge of the viewport with its upper portion missing, the reel frame and HUD sit higher, and a strip of road carrying a magenta glow band appears along the bottom edge that appears in no earlier frame. The same displacement is measurable on the paytable itself: the `PAYTABLE` header and its close control sit visibly lower in 020 than in 021 and 029, and in 029 the modal's own bottom border becomes visible where in 020 it ran off the screen. The trigger sits between 020 and 021, that is the first scroll of the paytable body, and closing the paytable does not undo it: 030, 031, 047, 048, 051 and 052 all still carry it, so a viewer sees the game's own logo clipped for the entire remainder of the session. The mechanism is in source: the paytable body is `overflow-y: auto` at `PaytableModal.svelte:593-594` with no `overscroll-behavior`, so a scroll that reaches the end chains to the document, and the document is scrollable because the Vite scaffold `body` rule survives at `app.css:122-128` with `min-height: 100vh` and `display: flex` beside `#app { padding: 2rem }` at `app.css:139-144`, which makes the document taller than the viewport.
- Where fixable: frontend/src/app.css:122-128 and :139-144, plus frontend/src/lib/components/PaytableModal.svelte:593-594; not locked
- Proposed fix: `overscroll-behavior: contain` on `.fs-pt-body` (and on every other `overflow-y: auto` panel), and remove the scaffold `body`/`#app` rules so the document cannot exceed the viewport. NOTE FOR THE MARSHAL: this is the same `app.css` scaffold remnant as charter row **Q-27**, which KNOWN_OPEN records as *visible only if any link or unstyled surface reaches a frame*. That assessment understates it. The scaffold body centring is player-visible in its own right, on every frame from 021 to the end of the session, and it should be re-rated rather than left as a cosmetic remnant. I am filing it as a new row rather than KNOWN(Q-27) because the observed defect is not what Q-27 describes.

## STM-DESKTOP-04 HIGH The buy confirm dialog opens with no blur and a weaker scrim, so the background pops back into focus and the live HUD reads around the dialog edges

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/034_desktop_transition_dialog_buy_overdrive_opening.png and /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/036_desktop_transition_dialog_nitro_overdrive_opening.png (endpoints 033_desktop_features_menu.png, 035_desktop_dialog_buy_overdrive.png, 037_desktop_dialog_nitro_overdrive.png)
- Claim: 033, the FEATURES panel this dialog is opened from, blurs and darkens the background until the robot, the car and the reel frame are unreadable shapes. 034 and 036, the very next frames, carry no blur and a visibly lighter scrim: the robot, the car, the city signage, the reel frame, the `FEATURES` pill and the HUD are all sharp, and the FEATURES panel itself has vanished rather than remaining behind its own child dialog. So at the instant a priced purchase dialog appears the whole scene pops from heavily blurred to fully sharp. The consequence shows at the dialog's own edges: the `BET` pod is sliced by the dialog's right edge and hangs out from behind it still reading `BET` and `$1.00`, and a fragment of the HUD menu control shows at the left edge. The two treatments are one line apart in kind: `.fm` is `background: rgba(0, 0, 0, 0.82)` plus `backdrop-filter: blur(3px)` at `FeatureMenu.svelte:696-697`, while `.buy-backdrop` is `background: rgba(0, 0, 0, 0.6)` with no `backdrop-filter` at `BuyBonus.svelte:165-166`. A dialog asking for `$100.00` (034/035) and `$400.00` (036/037) is the last surface in the game that should read as pasted onto a live screen.
- Where fixable: frontend/src/lib/components/BuyBonus.svelte:165-166; not locked
- Proposed fix: match `.buy-backdrop` to `.fm`, that is `rgba(0, 0, 0, 0.82)` plus `backdrop-filter: blur(3px)`, and keep the parent FEATURES panel mounted behind the dialog rather than unmounting it.

## STM-DESKTOP-05 HIGH The intro rules card arrives at full opacity over a completely unblurred game, then the blur snaps on

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/003_desktop_transition_splash_to_rules.png and /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/005_desktop_transition_rules_to_base.png (endpoints 002_desktop_splash.png, 004_desktop_intro_rules.png, 006_desktop_base_idle.png)
- Claim: In 003 the `OVERDRIVE FREE SPINS` card is fully arrived: heading, all four bullets and the `Continue` button at full legibility, card at its final position. Behind it the game is completely unblurred, `FUTURE SPINNER` readable, the reel frame's metal and neon crisp, the HUD pods reading `$50,000.00`, `$0.00` and `$1.00` at full sharpness. In the settled endpoint 004 every one of those is blurred past legibility. The card body is still slightly translucent in 003 (the reel frame reads through it) while the blur is at zero, so the two are not on one timeline. The same step change happens on the way out: 005, captured as `Mid-fade between rules and base game`, has no card, no scrim and no blur and is indistinguishable from the settled 006. The paytable does not behave this way, 019 already carries the full blur at `Paytable mid-open`, so this is one surface out of step with the rest of the game, on the second screen of the session. Source: `.intro-backdrop` carries `background: rgba(0, 0, 0, 0.86)` and `backdrop-filter: blur(3px)` with `animation: intro-fade-in 0.35s ease both` (`IntroSplash.svelte:45-49`), while the card runs its own separate `intro-card-in 0.4s` (`IntroSplash.svelte:79`), and the keyframes at `:147-148` animate only `opacity` and `transform`, never the filter.
- Where fixable: frontend/src/lib/components/IntroSplash.svelte:41-50, :79, :147-148; not locked
- Proposed fix: drive the scrim and the card from one timeline of the same duration and easing, and animate the blur radius explicitly rather than relying on the backdrop element's opacity to carry it.

## STM-DESKTOP-06 MEDIUM The HUD menu panel is the one panel in the game with no backdrop treatment, and it occludes the live win ticker mid-cycle

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/016_desktop_transition_menu_opening.png (settled endpoint /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/017_desktop_hud_menu.png)
- Claim: The panel carrying `PAYTABLE`, `Session`, `Mute`, `MUSIC` `50%` and `SOUND` `80%` is dropped over the bottom left of the live reel grid with no scrim and no blur: `.hud-menu` is `background: rgba(6, 6, 18, 0.96)` with no `backdrop-filter` at `HudOverlay.svelte:1598-1607`. Every other panel in the game blurs what is behind it, `IntroSplash.svelte:47`, `PaytableModal.svelte:456` and `FeatureMenu.svelte:697` all at `blur(3px)`, so this is a fourth modal treatment in one session and the only one that does not separate itself from the game. At the residual 4 per cent alpha the reel grid behind it reads faintly through, and the panel cuts the live win breakdown ticker in half: the ticker's strip resumes immediately past the panel's right edge still cycling `ways` `$0.20`, so a running readout is half hidden by a menu. The panel also overlaps the top edge of the HUD control bar. Reported from 016 because that is my assigned frame; identical in the settled 017, so it is a standing property, not a mid-open artefact.
- Where fixable: frontend/src/lib/components/HudOverlay.svelte:1598-1607; not locked
- Proposed fix: add `backdrop-filter: blur(3px)` to `.hud-menu` to match the other three panels, and raise the anchor so the panel clears the HUD bar and the ticker strip.

## STM-DESKTOP-07 MEDIUM The win breakdown ticker keeps cycling the previous spin under the blocking feature entry gate, and disagrees with the HUD WIN pod at that moment

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/038_desktop_transition_feature_entry_fade.png and /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/040_desktop_transition_feature_starting.png (settled endpoints 039_desktop_feature_entry_card.png and 041_desktop_feature_run_1.png)
- Claim: With the `OVERDRIVE FREE SPINS` `+16 FREE SPINS` `TAP TO CONTINUE` gate up and blocking input, the ticker strip at the foot of the reel window is still live underneath it. It reads `L2  x5  1 ways  $0.80` on 038, 039 and 040, and has advanced to `SCATTER  x5  5 ways  $10.00` by 041, so it is animating behind a modal the player cannot dismiss without a click. At the same instant the HUD `WIN` pod reads `$0.00` and the feature pod reads `TOTAL WIN` `$10.80`, so three surfaces on one screen carry three different figures for the round just played. This is the shape of MID-01 on a different pair of surfaces, and is filed separately because MID-01 is specifically the banner count-up against the HUD pod.
- Where fixable: UNKNOWN (the ticker component is `frontend/src/lib/components/WinBreakdown.svelte`; the mount condition was not traced in this pass)
- Proposed fix: stop the ticker and hide its strip while a blocking overlay is mounted, and resume it only on the surface whose figures it belongs to.

## STM-DESKTOP-08 MEDIUM The max win backdrop passes through a desaturated khaki wash with a hard radial edge, a colour in neither endpoint nor the palette

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/049_desktop_transition_maxwin_overlay_fade.png (settled endpoint /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/050_desktop_maxwin_celebration.png)
- Claim: In the settled 050 the celebration backdrop is a dark navy field with a soft magenta to teal sweep on the left, on palette. In 049, captured as `Max win overlay mid-fade-in`, roughly the upper right half of the screen is a flat desaturated olive khaki wedge with a hard boundary running down through the right of `REACHED!` and past the `5,000`, washing the whole frame several stops lighter. The colour appears in no other frame of the session. The source names the cause: `.c1-halo` is a full-overlay `conic-gradient` at `MaxWinCelebration.svelte:206-222` rotating once every six seconds (`c1-halo-spin 6s linear infinite`, :223), whose stops place `--sig-gold` at 18 per cent directly beside `--sig-cyan` at 22 per cent. Gold beside cyan is what mixes to olive, and the gradient's `transparent 60%` stop is the hard radial boundary. Judged as what a viewer sees rather than as a millisecond: this is the entry to the biggest celebration in the game and it washes the screen khaki on the way in, then again on every six-second rotation while the overlay is held.
- Where fixable: frontend/src/lib/components/MaxWinCelebration.svelte:206-222; not locked
- Proposed fix: separate the gold and cyan stops with a transparent stop, or drop cyan from the halo, so no rotation of the conic gradient produces an off-palette intermediate.

## STM-DESKTOP-09 MEDIUM The FEATURES panel cuts the fourth mode card in half and never shows the fifth, with no scroll affordance

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/032_desktop_transition_features_menu_opening.png (settled endpoint /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/033_desktop_features_menu.png)
- Claim: The manifest declares 033 as `FEATURES menu, all five modes and their prices`. Four appear, `Normal`, `Cruise`, `OVERBOOST` and `Buy Overdrive`, and the `Buy Overdrive` card is sliced horizontally by the panel's scroll edge immediately under `Buy a guaranteed Overdrive Free Spins entry.` with its bottom border cut off; `NITRO OVERDRIVE` does not appear at all, though the game's own buy dialog for it exists at 036 and 037 priced `$400.00`. No scrollbar or fade indicates there is more below. `.fm-panel` is capped at `max-height: 88%` then `88dvh` (`FeatureMenu.svelte:706-707`), which at this viewport is about 594 px and matches the observed cut. Identical in the transition frame 032 and the settled 033, so it is not a mid-open artefact.
- Where fixable: frontend/src/lib/components/FeatureMenu.svelte:703-712; not locked
- Proposed fix: add a fade mask and a visible scroll affordance at the cut, or raise the cap and tighten the card rhythm so all five modes are reachable without a hidden scroll.

## STM-DESKTOP-10 MEDIUM The autoplay panel covers the FEATURES button and leaves it reading `FE`

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/031_desktop_autoplay_menu.png (settled frame, opened as the endpoint for 030; compare 030_desktop_transition_paytable_closing.png where the same button reads `FEATURES` in full)
- Claim: The autoplay panel carrying `Stop on win`, `Single win limit`, `Stop on feature`, `Loss limit` and `SPINS` is anchored at the right edge and its left edge lands part way across the `FEATURES` pill, so the pill's icon and the letters `FE` protrude from underneath the panel while the rest of the word is covered. A truncated word sticking out from under an overlapping panel is a two-surfaces-overlapping-wrongly tell. Recorded from a settled frame deliberately, because the session carries no autoplay transition capture and this therefore cannot be dismissed as mid animation.
- Where fixable: UNKNOWN (the autoplay panel and the FEATURES pill both live in `frontend/src/lib/components/HudOverlay.svelte`; the anchor rule was not traced in this pass)
- Proposed fix: hide or shift the FEATURES pill while the autoplay panel is open, or narrow the panel so it clears the pill.

## STM-DESKTOP-11 LOW The FEATURES header shows the spin cost with a rule struck through it, beside an identical unstruck price

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/032_desktop_transition_features_menu_opening.png (settled endpoint /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/033_desktop_features_menu.png)
- Claim: The panel's top row renders `SPIN COST` then `$1.00` with a horizontal rule crossing the digits, then `BET`, the decrement control, and `$1.00` again in the same gold without a rule. On `Normal` the spin cost and the bet are the same number, so the surface reads as a price crossed out and replaced by itself. Stated honestly and not over-claimed: `grep -rn "line-through" frontend/src` returns nothing, so this is NOT a `text-decoration` strikethrough and the rule is most likely a divider or border from a neighbouring element passing behind the value at `FeatureMenu.svelte:334` / `:848-852`. Graded LOW for that reason. What a viewer sees is still a struck-through price, so it wants a look at the rendered element rather than a dismissal.
- Where fixable: frontend/src/lib/components/FeatureMenu.svelte:842-852 (the bet-selector row that carries the spin cost); not locked
- Proposed fix: inspect the row's borders and dividers at this width and move the rule clear of the numeral, or render the cost once when it equals the bet.

## STM-DESKTOP-12 LOW At the frame captured as full speed the board is pin sharp and exactly grid aligned

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/008_desktop_transition_reels_full_speed.png (compare 007_desktop_transition_reels_accelerating.png, which does show per-reel vertical offset, and 006_desktop_base_idle.png)
- Claim: 008 is captured as `Reels at full speed`. All twenty cells are aligned to the grid, every symbol is sharp, and there is no blur, no vertical stretch and no partially visible cell anywhere in the window, so the frame is indistinguishable from a settled board except that the turbo, MAX and FEATURES controls are dimmed. Five reels at independent phases landing simultaneously aligned is improbable enough to be worth a check of whether the strip translates continuously at speed. Note that a velocity treatment does exist in source (`.tile-inner` is described at `GameGrid.svelte:1264-1266` as carrying the velocity stretch and alpha), so the question is whether it is reaching this state rather than whether it exists. Graded LOW because one frame cannot settle it, but it is the frame the manifest chose to represent full speed.
- Where fixable: frontend/src/lib/components/GameGrid.svelte:1264 onward (`.tile-inner` velocity stretch); not locked
- Proposed fix: confirm the stretch and alpha are applied at peak velocity; if they are, raise the amount so a paused stream frame reads as motion.

## STM-DESKTOP-13 LOW The frame captured as back to base after collect is not base, the feature chrome and an entry card have returned

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/052_desktop_post_collect_base.png, as the declared endpoint of /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/051_desktop_transition_maxwin_collect_fade.png
- Claim: The manifest declares 052 as `Back to base after collect, balance settled`. It shows the Overdrive theme, the side pods `OVERDRIVE FREE SPINS` `8`, `TOTAL WIN` `$2.80` and `MULTIPLIER` `1x`, and a fresh `OVERDRIVE FREE SPINS` `+8 FREE SPINS` `TAP TO CONTINUE` gate, with the HUD at `WIN` `$5,000.00`. So the declared destination of the transition I was asked to judge is not the state that arrives, and 051 has no endpoint in this capture set. Recorded factually and not ruled on: whether a round capped at 5,000x should hand back eight more free spins is a maths and compliance question, and per convention (l.8) it goes to the owner and Fable rather than being decided here.
- Where fixable: UNKNOWN
- Proposed fix: PARK(escalate the cap behaviour per (l.8); separately recapture a true post-collect base frame so 051 has an endpoint to be judged against)

## Explicit absences, signed

- **WITHDRAWN AFTER READING SOURCE: the big win sparkles and shockwave ring over the banner are deliberate, not a z-order fault.** I recorded a candidate finding at step 2 that the particles and the grey ring in `013_desktop_transition_bigwin_countup_early.png` were reel-layer output painted over the banner band. They are not. Both are the banner's own children: the ring is `shock_ring.png` rendered by `WinBanner.svelte:254-258` with `.c1-shockwave` at `z-index: 1` (`:450-457`), whose comment at `:447-449` states it is meant to burst behind the plate, and the sparkles are `.c1-coin-layer` at `z-index: 4` (`:467`), mounted at `:262`. Sitting over the band is what they are built to do. Signed as an absence rather than quietly dropped, because the step-2 shard claimed it.
- **No text rendered over text anywhere in the 18 transition frames.** Checked every overlay boundary in 003, 016, 019, 030, 032, 034, 036, 038, 040, 049 and 051. The closest case is 016, where the `Mute` row sits above the win ticker's strip, but the ticker's glyphs stop clear of the panel and resume past its right edge, so the collision is surface on surface, not glyph on glyph, and is reported as STM-DESKTOP-06.
- **No element caught mid teleport.** Every surface that appears in a transition frame is at, or within a few pixels of, its settled position: 003 against 004, 013 and 014 against 015, 034 against 035, 036 against 037, 038 and 040 against 039. Nothing sat part way between two anchors or at a position neither endpoint uses. The one large positional discrepancy in the set is not a teleport but the persistent stage displacement, STM-DESKTOP-03.
- **No torn or half-applied theme transform in any of the 18 frames.** Where the frame changes theme (base teal to Overdrive red and green, 040 to 047), the reel frame, its corner brackets, the HUD tint, the spin button ring and the scene lighting all change together; no frame shows one surface themed and another not.
- **The balance readout cannot be judged from these frames and I am not claiming it clean.** `BALANCE` reads `$50,000.00` on every base and feature frame in the set, so TR-089's open question about whether any other numeric surface shimmies is untestable here. Recorded as unanswerable rather than as absent.
- **Frames 001 against 002, 016 against 017, 019 against 020, 032 against 033, 034 against 035, 036 against 037, and 038 and 040 against 039 are visually settled**, that is, the capture landed after the animation completed. I judged them as content rather than inventing motion claims from them, and where a settled property was wrong I said so and marked it standing rather than transitional (06, 09, 11).
- **The mixed casing of the mode names and the `H1`/`M3`/`L2` symbol ids were not re-reported**, per the STV shard's two deliberate absences.

## KNOWN matches

- KNOWN(MID-01): /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/013_desktop_transition_bigwin_countup_early.png. Fresh confirmation from this squad's own read: the banner reads `$10.29` while the HUD `WIN` pod reads `$15.95` at the same instant, on a win that settles at `$16.20` in 015_desktop_bigwin_settled.png. The motion-lens observation to add is that 014_desktop_transition_bigwin_countup_late.png already shows the banner at the final `$16.20`, so the divergence is confined to the early part of the count-up exactly as the ledger derives.
- KNOWN(MID-02): /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/013_desktop_transition_bigwin_countup_early.png and 014_desktop_transition_bigwin_countup_late.png, both rendering `16x BET` with the letter x. Also on 049_desktop_transition_maxwin_overlay_fade.png as `x BET` beside `5,000`, so a transition frame of the max win surface carries the same glyph.
- KNOWN(STV-01): /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/014_desktop_transition_bigwin_countup_late.png (`L3  x4  1 ways  $0.20`), 038_desktop_transition_feature_entry_fade.png and 040_desktop_transition_feature_starting.png (`L2  x5  1 ways  $0.80`). Three further transition frames carrying `1 ways`.
- KNOWN(STV-12): the same three frames render the kind as `x4` and `x5`, letter x and prefix form, against the paytable's `3×`/`4×`/`5×`.
- KNOWN(STV-04): /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/001_desktop_transition_splash_entrance.png (`TAP TO CONTINUE`), 038 and 040 (`TAP TO CONTINUE` on the feature entry gate), 049_desktop_transition_maxwin_overlay_fade.png (`PRESS COLLECT OR HIT ENTER TO CONTINUE`). Fresh transition-frame evidence for all three registers.
- KNOWN(STV-06): /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/003_desktop_transition_splash_to_rules.png renders `Continue` in sentence case one screen after 001's `TAP TO CONTINUE`.
- KNOWN(STV-08): /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/032_desktop_transition_features_menu_opening.png carries `SPIN MODES` as the section heading and `BET MODES` as its own footer button in one view.
- KNOWN(Q-26): /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/032_desktop_transition_features_menu_opening.png renders `about 1.6x`, `Debits 1.25x` and `same 96.35% RTP.` with a letter x while the same card's cost row twelve lines below reads `1.25× per spin while ON · $1.25` with U+00D7. Both glyphs in one card.
- KNOWN(Q-16 park): parked hardcoded English confirmed on transition frames: `Session` and `Mute` on 016_desktop_transition_menu_opening.png, `PRESS COLLECT OR HIT ENTER TO CONTINUE` on 049_desktop_transition_maxwin_overlay_fade.png.
- RELATED, NOT A MATCH (Q-27): see the marshal note in STM-DESKTOP-03. The `app.css` Vite scaffold remnant is the mechanism behind a stage displacement that Q-27's own description does not cover, so it is filed as a new row and Q-27 should be re-rated rather than treated as already holding this.

tree_after: `git status --porcelain` at the end of this run, verbatim:

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

**LOUD: ONE COMMITTED EVIDENCE FILE IS MODIFIED, AND IT IS NOT A SHARD.**
`reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png` shows as
` M`, that is MODIFIED in the working tree against HEAD `d9bdf22`. It is a
committed capture frame, it belongs to the popout-s session, and it is the exact
class of event convention **(h.1)** exists to prevent: *evidence that a casual
re-run can overwrite is not evidence.* This squad did not touch it. My only write
this run was `reports/qa/stream_test/shards/STM-DESKTOP.md`; I ran no project
script, nothing under `scripts/`, no `npm run`, no gate, no proof and no capture
harness, and I opened every frame read-only with the Read tool. Something else in
this wave has written into the committed capture directory, most likely a squad
that invoked a script which regenerates frames.

**What the marshal must do before consolidating**, because a modified frame
poisons every claim cited against it: restore it from HEAD
(`git checkout -- reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png`)
and treat any finding citing frame 188 as citing an unknown image until the squad
that produced it re-confirms against the restored file. Nothing else shows as
MODIFIED or DELETED. Every other line is an untracked shard, mine plus fifteen
other squads', which are not mine and not my problem.
