# STM-MOBILES, motion residue (mobile-s, frames 312 to 363, 1600px upscaled)
supersedes: shards/superseded/STM-MOBILES.md
scope: every `transition_` frame of the `mobile-s` session, 18 of 18. Settled neighbours 313, 315, 317, 326, 328, 331, 344, 346, 348, 350, 352, 359, 361, 363 opened for comparison and not counted against the set.
frames_read: 18

Read from `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`. Frame paths
below are given in the committed directory, which is what a later reader will check, and
the two directories are the same captures at different sample rates. Pixel measurements
are taken on the NATIVE 320x568 captures so they are in real device pixels.

**One finding of my own did not survive my own source pass and was withdrawn before this
file was final. It is recorded under the absences rather than deleted.**

## STM-MOBILES-01 STREAM The rules card fades in at element opacity, so the live balance and the reels read through its own body copy

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/314_mobile-s_transition_splash_to_rules.png`. Neighbours: `313_mobile-s_splash.png` before, `315_mobile-s_intro_rules.png` after, `317_mobile-s_base_idle.png` for the background identity.
- Claim: at the midpoint of the splash to rules fade the whole base game is painted behind the card at close to full strength and reads straight through the card's own text. Legible through the card, transcribed from the frame: `FUTURE SPINNER`, `BALANCE`, `$50,000.00`, `WIN`, `$0.00`, `BET`, `$1.00`, `MAX`, `SPIN` and `FEATURES`, plus the reel window's cyan neon border and its symbol tiles.

  The collisions are specific. The card's line `Bonus Buy: pay 100× your bet` is drawn directly across the `$50,000.00` and `$0.00` pods. The card's line `3, 4 or 5 Scatters award 8, 12` is drawn across the reel window's neon border and two rows of symbol tiles. The settled neighbour `315` shows what the surface should be: an opaque card over a blurred backdrop with nothing behind it legible.

  Derived from the source, and it explains why the superseded pass called the card opaque. The card's BACKGROUND is fully opaque, `background: linear-gradient(160deg, #0c0c22 0%, #08081a 100%)` with no alpha (`frontend/src/lib/components/IntroSplash.svelte:72`). What is not opaque is the ELEMENT: `animation: intro-card-in 0.4s cubic-bezier(0.34, 1.2, 0.4, 1) both` (`:79`) runs `from { opacity: 0; transform: scale(0.92); }` (`:148`), and element opacity makes an opaque background translucent for the whole of that 0.4 s. Meanwhile the scrim behind it, `background: rgba(0, 0, 0, 0.86)` (`:46`) under `animation: intro-fade-in 0.35s ease both` (`:147`), is barely applied, because `ease` is slow out of the gate. So a partly transparent card sits over an undimmed base game, and the player's balance is underneath the rules text on the first transition of the game.
- Resolution note: VISIBLE AT BOTH (the superseded pass saw the frame and identified the background correctly; what it could not resolve is that the readouts pass THROUGH the card rather than around it, which is why it recorded the card as `already fully opaque`)
- Where fixable: `frontend/src/lib/components/IntroSplash.svelte:79` and `:148` against `:46` and `:147`. Not locked.
- Proposed fix: front-load the scrim and hold the card back behind it, for example `intro-fade-in 0.18s ease-out both` at `:147` plus a `0.12s` delay on `intro-card-in` at `:79`, so the dim is down before the card becomes legible. Two values, no structural change.

## STM-MOBILES-02 STREAM The SPIN button's glyph renders as a solid black blob for the whole of every spin, because a fill rule targets the wrong element

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/318_mobile-s_transition_reels_accelerating.png` and `319_mobile-s_transition_reels_full_speed.png`. Neighbour: `317_mobile-s_base_idle.png`.
- Claim: at rest the button carries a clean play triangle. On both spin frames the glyph is a solid black amorphous shape, a filled disc with a wedge bitten out of the upper right, with no readable form at all. The shape is IDENTICAL on `318` (`about 250ms after spin press`) and `319` (`full speed`), so it is a static blob rather than a state caught between two frames. The word `SPIN` under it stays crisp on all three frames, so this is the icon and not a paint failure of the button.

  Derived exactly, and the derivation also explains why it does not move. The spinning glyph is two OPEN paths meant to be stroked, `<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M18 3v5h-5"/>` (`frontend/src/lib/components/HudOverlay.svelte:478`). The portrait rule sets fill on every path inside any glyph, `.p-spin .glyph path { fill: #04070f; }` (`:2126`), and the rule that is supposed to undo it sets `fill: none; stroke: #04070f; stroke-width: 2;` on the `<svg>` element rather than on its paths, `.p-spin .glyph.arrows { display: none; fill: none; ... }` (`:2127`). A rule matching the path directly beats a value inherited from its parent, so the paths keep `fill: #04070f` and never receive a stroke. The 300 degree arc fills as a disc with a wedge missing and the arrowhead fills as the small triangle at the upper right: the blob in the frames, in `#04070f`, which is the near black measured on them.

  The fullscreen branch does it correctly, `.fs-spin .glyph.arrows path{fill:none;stroke:var(--acc);stroke-width:5;...}` (`:1539`), which is the proof that the portrait branch is a mistake rather than a style. The compact branch has the identical defect at `:2360` and `:2361`. Portrait also omits the rotation the fullscreen branch applies at `:1549`, which is why the blob is static.
- Resolution note: NEW AT 1600PX (the glyph is about 7 px on the native capture; at thumbnail scale a blob and a triangle are the same handful of dark pixels)
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:2126-2127`, and the same pair at `:2360-2361`. Not locked.
- Proposed fix: narrow the fill rule to the play glyph and move the stroke onto the paths, mirroring `:1537` and `:1539` exactly: `.p-spin .glyph.play path { fill: #04070f; }` plus `.p-spin .glyph.arrows path { fill: none; stroke: #04070f; stroke-width: 2; }`. Repeat for `.c-spin`. Convention (p) applies: the seeded violation is a filled arc, and the gate must go red on it.

## STM-MOBILES-03 STREAM The reel window empties on the drop and the scene art shows through the board

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/318_mobile-s_transition_reels_accelerating.png`. Neighbours: `317_mobile-s_base_idle.png`, `319_mobile-s_transition_reels_full_speed.png`.
- Claim: about 250 ms after the spin press the tile strips do not cover the window. Reel 1 carries three tiles, reel 2 carries two, reel 3 carries one, and reels 4 and 5 still carry all four of the idle pistons unchanged from `317`. That is fourteen tiles present and **six** cells bare. Where the tiles are absent there is nothing at all, not a dark cell, and the scene backdrop is visible inside the neon frame: the magenta chevron road marking and the rain streaks read clearly through the middle and lower left of the board.
- Resolution note: VISIBLE AT BOTH
- Where fixable: `frontend/src/lib/components/GameGrid.svelte:498` (`const DROP_H = 520`) and `:74` (`const STRIP = ROWS + 3`), **carried forward from the superseded shard's own derivation rather than re-derived here**, because the source budget went to the findings that had no location at all. Not locked.
- Proposed fix: as the superseded shard proposes, either cap `DROP_H` so the strip can cover the window from its release point, or raise `STRIP` to 9 and seed the two extra slots. Its second option keeps the drop's travel and therefore its feel.
- Cross reference: the mobile-s instance of the ledger's Cluster 1.

## STM-MOBILES-04 STREAM The max win collect leaves the win lines and a gold celebration glow painted over an emptied board

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/362_mobile-s_transition_maxwin_collect_fade.png`. Neighbours: `361_mobile-s_maxwin_celebration.png` before, `363_mobile-s_post_collect_base.png` after.
- Claim: after COLLECT is pressed on the `5,000` max win, all twenty symbol tiles are gone from the reel window, but the window is not blank. Still painted on it are the complete set of cyan win-line polylines from the round just collected, the faint outlines of all twenty tile slots, at least two ghost symbols including the `W` wild at the left of row 2, and a broad olive and gold glow centred in the window. The neon frame, the corner rails and the whole HUD are at full brightness around this.

  Neither neighbour contains it: `361` has the celebration over the board and `363` has a legible dimmed board behind the free spins entry card. SSIM `362` against `363` is `0.389`, the largest gap of any transition and settled pair in the session.
- Resolution note: VISIBLE AT BOTH (the superseded pass saw the frame; it described the window as blank black, which full resolution refutes, see the reconciliation)
- Where fixable: UNKNOWN. The win-line layer's owner was not located within the six file source budget.
- Proposed fix: UNKNOWN. The shape of it is that the win-line and glow layers must be torn down on the same signal that clears the tiles, rather than on a later one.
- Cross reference: the ledger's Cluster 4, previously corroborated by `STM-DESKTOP-02`, `STM-POPOUTL-02` and `STM-POPOUTS-02`. This adds mobile-s as a fourth viewport.

## STM-MOBILES-05 HIGH The HUD menu panel is translucent, so its labels are drawn on top of legible money readouts

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/327_mobile-s_transition_menu_opening.png`. Neighbour: `328_mobile-s_hud_menu.png`, which is the same at SSIM `0.975`, so this is not a transition fault.
- Claim: the panel covers the BALANCE and WIN pods and their contents read straight through it. The menu item `PAYTABLE` is drawn directly on top of the word `BALANCE`, which remains legible between and behind its letters. The menu item `Session` is drawn directly on top of `$50,000.00`, and the trailing `00.00` is legible to the right of the word. `WIN` is legible under the panel.

  The sharpest instance: the panel's right edge falls BETWEEN the `2` and the final `0` of `$16.20`, so `$16.2` renders dimmed under the panel while the trailing `0` renders at full magenta brightness outside it. One numeral of a money readout is bright and the rest of the same numeral group is not.

  The bet increase control `▲` also stays fully lit immediately to the right of the open panel, so a live control sits beside an open menu with no scrim between them.

  Derived: `.hud-menu { background: rgba(6, 6, 18, 0.96); }` (`frontend/src/lib/components/HudOverlay.svelte:1603`). Four per cent of a glowing numeral on near black is exactly the readable ghost the frames carry, and the same rule declares no `transition`, which is the pop the superseded shard reports separately.
- Resolution note: NEW AT 1600PX (the superseded pass resolved the ghosting; the split numeral and the `PAYTABLE` over `BALANCE` collision are new at this resolution)
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1603`. Not locked.
- Proposed fix: take the alpha to `1`, or drop the panel onto an opaque token. One value. Separately add a scrim behind the menu so no control beside it reads as live.

## STM-MOBILES-06 HIGH `5,000×BET` on the max win hero: the multiplier and the unit collide, in three type sizes

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/360_mobile-s_transition_maxwin_overlay_fade.png` and `361_mobile-s_maxwin_celebration.png`.
- Claim: the unit line renders as one collided token, `5,000×BET`, with no word space between the multiplication sign and the unit, in three different sizes: the `×` is roughly double the cap height of the `BET` beside it and under half the height of the `5,000` before it.

  Derived: the three spans are siblings in one flex row, `<span class="c1-max-mult fs-num">5,000</span><span class="c1-max-x">×</span>` (`frontend/src/lib/components/MaxWinCelebration.svelte:155`) and `<span class="c1-max-betlabel">{t($locale, 'bet', localeMode)}</span>` (`:159`), inside `.c1-max-multwrap { display: flex; align-items: baseline; gap: 0.1em; margin-top: 4px; }` (`:295-300`). The single `gap: 0.1em` resolves against the CONTAINER's font size and is applied identically to both gaps, so the gap that should be a word space between a symbol and a word is the same hairline as the gap between a numeral and its own operator. The three sizes are declared at `:302`, `:310` and `:317` (96, 46 and 22 px) and again for portrait at `:367-369` (50, 24 and 13 px). Both `.c1-max-x` and `.c1-max-betlabel` also override the row's `align-items: baseline` with `align-self: flex-end` (`:313`, `:320`), which is why the pair sits low against the numerals rather than on a shared baseline.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:295-300`, with `:313` and `:320`. Not locked.
- Proposed fix: give `.c1-max-betlabel` its own leading space, for example `margin-left: 0.35em` on `:316`, so the two gaps stop being the same measurement, and drop the two `align-self: flex-end` overrides so the row's declared baseline alignment actually applies.
- Cross reference: exactly the shape of the ledger's `STL-DE-B-02` (`5,000×EINSATZ`, unit collided with multiplier, no separating space), which was recorded as a German finding. It is not a German finding: the English surface has it too, from the same two rules, so the fix is in the shared template and not in a locale.

## STM-MOBILES-07 HIGH `+16 FREE SPINS` collides with the speedometer above it on the feature entry card

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/349_mobile-s_transition_feature_entry_fade.png` and `351_mobile-s_transition_feature_starting.png`. Neighbours: `350_mobile-s_feature_entry_card.png`, `352_mobile-s_feature_run_1.png`, and `363_mobile-s_post_collect_base.png` where the same card reads `+8 FREE SPINS`.
- Claim: the headline's cap height overlaps the lower third of the speedometer graphic, so the chrome bezel and the dial face run through the letters of `FREE SPINS`. There is clear space below the headline before the `TAP TO CONTINUE` button, so this is an overlap upward, not a shortage of room.

  Derived, and the history is the point. The award line is `<div class="entry-burst-text">+{script.initialFreeSpins} {t(lang, 'freeSpins', mode)}</div>` (`frontend/src/lib/components/FreeSpinsPresentation.svelte:468`) inside `.entry-bottom-group` (`:467`), and the comment immediately above it (`:460-466`) records an OWNER AUDIT ROUND 3 change that moved the award text and the continue gate into one flex column **anchored to the card's lower border**, precisely so they could not overlap each other. The gauge it now collides with is fixed at `width: 240px; height: 240px` (`:581-582`) and centred. On a 320 px viewport the card interior is not tall enough to hold a fixed 240 px dial and a bottom anchored group without them meeting, so the Round 3 fix closed the downward collision and opened an upward one at the smallest viewport.
- Resolution note: VISIBLE AT BOTH
- Where fixable: `frontend/src/lib/components/FreeSpinsPresentation.svelte:581-582` against `:467-468`. Not locked.
- Proposed fix: scale the gauge with the card rather than pinning it at 240 px, for example `width: min(240px, 42vh)`, so the fixed element yields at the viewport where the collision happens. Do not move the bottom group: it is anchored deliberately and moving it re-opens the defect Round 3 closed.

## STM-MOBILES-08 MEDIUM Celebration particles are seeded with no exclusion zone, so one reads as a full stop before `MAX WIN` and one fuses with a crown star

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/360_mobile-s_transition_maxwin_overlay_fade.png`. Neighbour: `361_mobile-s_maxwin_celebration.png`.
- Claim: on `360` a magenta particle sits on the baseline in the gap immediately left of the `M` of `MAX WIN`, so the headline reads as `.MAX WIN`. A gold particle sits directly beneath the third of the three crown stars and, being the same gold with a gold glow, fuses with it into a single smooth bulb: two correct five pointed stars beside one shape that reads as a light bulb. A cluster of cyan and white particles sits against the right edge of the `COLLECT` button and breaks its silhouette; two of them are still there on the settled `361`.

  **Stacking is NOT the fault, and my own first draft of this finding said it was.** `.c1-particle-layer` is `z-index: 1` (`frontend/src/lib/components/MaxWinCelebration.svelte:227`) under `.c1-max-content` at `z-index: 2` (`:244`), so the particles are correctly behind the content. The fault is placement: `makeParticles(90)` (`:73-74`) seeds ninety particles at uniform random `left:{p.x}%; top:{p.y}%` across the whole overlay (`:116-117`) with no exclusion zone around the content column, and each carries `box-shadow:0 0 {size}px {color}` (`:123`), so a particle landing behind a glyph does not hide behind it, it bleeds around it.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:73-74` (the seeding), with `:116-117` and `:123`. Not locked.
- Proposed fix: reject seeds that fall inside the content column's box when generating, or bias `p.x` away from the centre band, so the ninety particles cannot land on the headline, the figure, the crown or the call to action. A rejection test in `makeParticles` is a few lines and needs no change to the render.

## STM-MOBILES-09 MEDIUM The max win scrim is not opaque, so the balance, bet and MAX readouts stay legible under the celebration

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/360_mobile-s_transition_maxwin_overlay_fade.png`. Neighbour: `361_mobile-s_maxwin_celebration.png`.
- Claim: the base HUD reads through the celebration on both frames. `$50,` of the balance, `BET`, `$1.00` and `MAX` are all legible, and the low contrast grey line `PRESS COLLECT OR HIT ENTER TO CONTINUE` is drawn in the band between the ghost balance row and the ghost bet row.

  Derived: `.c1-max` is `background: radial-gradient(ellipse at center, rgba(20, 8, 50, 0.97) 0%, rgba(6, 4, 20, 0.99) 100%)` (`frontend/src/lib/components/MaxWinCelebration.svelte:194-198`). One to three per cent of a glowing readout on near black, which is the same mechanism and almost the same number as `.hud-menu`'s `0.96` in STM-MOBILES-05, so the two are one class rather than two incidents.

  **Recorded because my own first draft got the mechanism wrong.** I read the visible oval as the scrim failing to reach the corners. It is not: the scrim is full bleed and slightly MORE opaque at the edges than the centre. The oval is the rotating `.c1-halo`, `position: absolute; inset: -10%; border-radius: 50%` with a conic gradient (`:206-215`), which on a portrait viewport is a tall ellipse that does not reach the corners. That is designed, it is why the lit region moves between `360` and `361`, and it is not a defect.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:194-198`. Not locked.
- Proposed fix: take both stops to alpha `1`, since the gradient is doing colour work and not transparency work, and nothing behind the max win overlay should be visible at all.

## STM-MOBILES-10 MEDIUM Two win figures contradict each other on screen after the collect

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/362_mobile-s_transition_maxwin_collect_fade.png`. Neighbour: `363_mobile-s_post_collect_base.png` carries the same three figures.
- Claim: the feature pod reads `TOTAL WIN` `$2.80` directly above the HUD pod reading `WIN` `$5,000.00`, and `BALANCE` reads `$50,000.00`, unchanged from the first frame of the session. A pod labelled TOTAL WIN showing one four hundredth of the pod labelled WIN immediately beneath it, at the moment a max win is collected and with the balance not moving, is three readouts a viewer cannot reconcile.
- Resolution note: NEW AT 1600PX
- Where fixable: UNKNOWN. Two independent meters, and which one is mislabelled is a product question rather than a CSS one.
- Proposed fix: PARK(the two meters are correct for their own scopes; what is wrong is that `TOTAL WIN` reads as the larger of the two and is not, so this is a labelling decision for the owner). Note for the marshal: the static `$50,000.00` balance runs the whole session across every spin and every win, which is outside this lens and is raised rather than claimed.

## STM-MOBILES-11 MEDIUM The BIG WIN band runs full bleed and severs the reel window's frame for the whole celebration

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/324_mobile-s_transition_bigwin_countup_early.png` and `325_mobile-s_transition_bigwin_countup_late.png`. Neighbour: `326_mobile-s_bigwin_settled.png`, which has it too.
- Claim: the band carrying `BIG WIN`, the count-up figure and `16x BET` spans the full viewport width, edge to edge, and passes over the reel window's cyan neon border AND its silver corner rails. The frame that surrounds the board is cut into two disconnected pieces, a top piece and a bottom piece, for the entire celebration. No other overlay in the game crosses that frame.

  Derived: the banner root is `position: absolute; left: 0; right: 0; width: 100%; z-index: 100;` (`frontend/src/lib/components/WinBanner.svelte:343-349`), so it stretches to its positioning ancestor's full width and sits above the board chrome. The frames show that ancestor is the stage rather than the board.
- Resolution note: VISIBLE AT BOTH
- Where fixable: `frontend/src/lib/components/WinBanner.svelte:343-349`. Not locked.
- Proposed fix: inset the band to the reel window's own width, or raise the frame and corner rails above `z-index: 100` so the band passes behind them. The second keeps the band's full bleed look and still leaves the board framed.

## STM-MOBILES-12 MEDIUM The win-line detail strip is unreadable at this viewport and straddles the reel window's bottom border

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/325_mobile-s_transition_bigwin_countup_late.png`, `327_mobile-s_transition_menu_opening.png`, `349_mobile-s_transition_feature_entry_fade.png`, `351_mobile-s_transition_feature_starting.png`, `358_mobile-s_transition_feature_exit.png`.
- Claim: the strip's glyphs are about 5 px tall on the native capture. Enlarged three times from the 1600px upscale they still do not fully resolve, while the neon rails immediately above and below them in the same crop are crisp, so this is glyph size and not sampling. What can be read is `L3`, `x4`, `1 ways` and a dollar amount on `325` and `327`, and `SCATTER`, `x5`, `5 ways` and a dollar amount on `351` and `358`. The amounts cannot be transcribed with confidence, and that is the finding: this is the only string on the screen that cannot be read.

  The bar is also drawn over the bottom of the bottom symbol row with its lower edge meeting the window's inner border, so it sits half on the board and half on the frame.
- Resolution note: NEW AT 1600PX
- Where fixable: UNKNOWN. The strip's own rule was not located within the six file source budget; it is not in `GameGrid.svelte`'s win payload shape at `:709`, which carries `{ symbol, kind, ways, payout }`, the four fields the strip renders.
- Proposed fix: UNKNOWN pending the rule. Note that the same surface is independently reported by the ledger's `STL-AR-A-01` for rendering the English word `ways`, a raw internal symbol code and an ASCII `x`, which the mobile-s frames corroborate: `L3` and `SCATTER` are internal codes and `x4` and `x5` are ASCII.

## STM-MOBILES-13 MEDIUM The buy confirm dialog's sticky stats strip slices the body copy through the middle of its glyphs

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/345_mobile-s_transition_dialog_buy_overdrive_opening.png` and `347_mobile-s_transition_dialog_nitro_overdrive_opening.png`. Neighbours `346` and `348` carry the same.
- Claim: the `PRICE` `RTP` `MAX WIN` strip's top edge cuts the body line that follows `The Overdrive meter starts at 1×` horizontally through the middle of its x-height, so the reader sees the top half of a line of glyphs and nothing below it, with no scroll affordance and no fade. It is a hard opaque edge across live text, on the surface that takes the player's money.
- Resolution note: VISIBLE AT BOTH
- Where fixable: UNKNOWN. The superseded shard located the modal box at `frontend/src/lib/components/BuyBonus.svelte:174`; the strip's own rule was not located within the six file source budget.
- Proposed fix: UNKNOWN. The shape of it is a bottom padding on the scroll box equal to the strip's height, plus a fade mask, so text can never end under the strip.
- Cross reference: the ledger's Clusters 2 and 3, same mechanism.

## Native pass reconciliation

Every finding in `shards/superseded/STM-MOBILES.md` falls inside my range, since that shard
covered the identical 18 frames. None belongs to a sibling squad. All thirteen are ruled on
below, plus its eight signed absences, because a signed absence is a claim too.

- **STM-MOBILES-01 (native) STREAM, empty reel rows on the drop: CONFIRMED, with one arithmetic correction.** The staircase is exactly as recorded: reel 1 three tiles, reel 2 two, reel 3 one, reels 4 and 5 untouched at four. The count is wrong. Fourteen tiles are present, so **six** cells are bare, not the seven the shard states. The derivation, the mechanism and the severity all stand; only the number needs correcting before it reaches the ledger.
- **STM-MOBILES-02 (native) HIGH, `the reel window reads as a blank black rectangle`: REFINED, and the description is refuted.** The window on `362` is not blank. At full resolution it carries the complete set of cyan win-line polylines from the collected round, the outlines of all twenty tile slots, at least two ghost symbols including the `W`, and a broad olive and gold glow. The viewer-facing claim, that the board goes dark at the most watched moment, survives; the words `blank`, `black` and `rectangle` do not, and the correct classification is celebration residue over an emptied board, the ledger's Cluster 4, rather than a lighting problem. Restated as STM-MOBILES-04 above. This matters for disposition: the native shard's PARK, an art call about flare brightness, does not address residue.
- **STM-MOBILES-03 (native) HIGH, the rules scrim trails its card: CONFIRMED in mechanism, one sentence REFUTED, severity raised.** The background identification and the scrim-trails-card derivation are right. The sentence `The card itself is already fully opaque with crisp text` is REFUTED: the base game reads THROUGH the card body, and `$50,000.00` and `$0.00` sit under the card's own line `Bonus Buy: pay 100× your bet`. The source says why, and the native pass had the line in hand without drawing the conclusion: `intro-card-in` animates ELEMENT opacity from `0` (`IntroSplash.svelte:148`), which makes the opaque `:72` background translucent for the whole 0.4 s. That makes this text over text on the first transition of the game, so HIGH becomes STREAM. Restated as STM-MOBILES-01 above.
- **STM-MOBILES-04 (native) HIGH, every `feature_run` frame still shows the undismissed entry card: CONFIRMED, and now measured.** SSIM between `351_mobile-s_transition_feature_starting.png` and `352_mobile-s_feature_run_1.png` is **0.999845**, so the two frames are the same image to three decimal places. The frame captioned `entry card dismissing` contains no dismissal. This remains the most consequential finding either pass produced, because it means the feature run is unaudited in every session.
- **STM-MOBILES-05 (native) HIGH, HUD menu panel not opaque: CONFIRMED and REFINED.** Confirmed including `rgba(6, 6, 18, 0.96)` at `HudOverlay.svelte:1603` and the sub-claim that the bet increase `▲` stays lit beside the open panel. Refined with three details the native pass could not resolve: `PAYTABLE` is drawn on top of `BALANCE`, `Session` is drawn on top of `$50,000.00`, and the panel edge splits `$16.20` so `$16.2` is dimmed under the panel while the trailing `0` renders at full brightness outside it. Restated as STM-MOBILES-05 above.
- **STM-MOBILES-06 (native) MEDIUM, seven aimed captures land on an endpoint: CONFIRMED in substance, and a method warning is added.** Measured SSIM against the settled neighbour: `330`/`331` **0.999989**, `351`/`352` **0.999845**, `316`/`317` **0.993910**, `349`/`350` **0.993154**, `325`/`326` **0.991092**, `358`/`359` **0.986157**, `312`/`313` **0.980793**, `327`/`328` **0.975196**.

  The warning concerns one pair the shard names. `343` against `344` measures **0.866879**, which reads as a large difference and would have let me contradict the shard. Direct measurement refutes that reading: the whole features panel is displaced by exactly **one pixel** (`x 14..17, y 49..518` on `343` against `x 15..18, y 50..517` on `344`). A one pixel uniform shift of a high contrast full screen panel is enough to halve an SSIM. The shard's reading of that pair is right and SSIM alone would have misled me. Recorded so no later pass uses SSIM as a pop detector.
- **STM-MOBILES-07 (native) MEDIUM, falling tiles carry no motion cue: CONFIRMED, and extended.** Every symbol on `319` is as crisp as the same symbol on the settled `317`. One detail the native pass did not record: on `319` reels 1 to 4 are grid aligned while reel 5 alone is offset by roughly half a tile and shows a fifth partial tile clipped by the window's bottom edge, so at the frame captioned `full speed` four of five reels sit on the grid. Separately, these are the two frames carrying my STM-MOBILES-02, which the native pass could not resolve.
- **STM-MOBILES-08 (native) MEDIUM, buy dialog body copy re-wraps between the mid-open and settled frames: REFUTED.** This is a false positive from thumbnail resolution. At 1600px the paragraph wraps IDENTICALLY on both frames: `3, 4 or 5 Scatters award 8, 12 or` / `16 free spins and pay an instant` / `1x, 3x or 10x total bet.` on `345`, and the same three lines with the same break points on `346`. The word `16` does not move. The only difference is a small uniform vertical displacement of the whole dialog, which is the `buy-pop` scale entrance the shard itself derived. **The proposed `scrollbar-gutter: stable` fix must not be applied on this evidence**, and the shard's own honest `hypothesis, not a derivation` caveat is what makes this correction cheap rather than embarrassing.
- **STM-MOBILES-09 (native) MEDIUM, `Buy Overdrive` against `NITRO OVERDRIVE`: CONFIRMED.** Both strings verbatim on `345`/`346` and `347`/`348`, one tap apart, under the matching sub lines `Start Overdrive Free Spins now at 100x your bet?` and `Start Overdrive Free Spins now at 400x your bet?`. The features menu on `343`/`344` renders `Normal` and `Cruise` in title case, so the upper case title is one of four.
- **STM-MOBILES-10 (native) LOW, HUD menu mixes cases: CONFIRMED.** `PAYTABLE`, `Session`, `Mute`, `MUSIC`, `SOUND` all verbatim on `327` and `328`.
- **STM-MOBILES-11 (native) LOW, ways diagram clipped: CONFIRMED and REFINED, it is worse than recorded.** BOTH ends of the chip row are cut, not only the right. The `1` chip is sliced by the panel's LEFT border, showing only its right edge, and the `5` chip is sliced by the right border. What a player sees is `) → 2 → 3 → 4 → 5(`, so two of the five reels the caption names are unreadable, not one.
- **STM-MOBILES-12 (native) LOW, features menu bet stepper wraps: CONFIRMED.** `SPIN COST`, `$1.00`, `BET` and the `-` control on the first row, `$1.00` and the `+` control on the second.
- **STM-MOBILES-13 (native) LOW, no Overdrive multiplier readout in portrait: CONFIRMED as observed.** `349`, `350`, `351` and `352` carry exactly two pods, `OVERDRIVE FREE SPINS` and `TOTAL WIN`. The shard's own caveat stands: because of native STM-MOBILES-04 no frame of an actual free spin exists, so nothing here rules out a compact readout appearing once the run starts.

Its eight signed absences, ruled on:

- **`No ghost of a dismissed surface anywhere`: REFUTED.** `362` carries the win lines and the gold glow of the collected celebration over an emptied board (STM-MOBILES-04 above). The same shard's own finding 02 describes that frame, so the absence contradicts a finding two pages above it. Additionally `349` and `351` still carry the previous base game's win-line detail strip under the feature entry card.
- **`No text over text caused by a transition`: REFUTED.** `314` is a second and worse instance than `327`, and the native pass missed it precisely because it recorded the rules card as opaque (STM-MOBILES-01 above).
- **`No celebration mispositioned mid animation`, `360 differs from 361 only by a uniform scale down`: REFUTED in part.** `360` additionally contains a crown star fused with a gold particle into a smooth bulb, which a uniform scale cannot produce. The same absence dismisses particles over the headline as `the design`; at full resolution one of them sits in the gap against the `M` of `MAX WIN` so the line reads `.MAX WIN`, which is not a design intent anyone chose (STM-MOBILES-08 above). The absence's z-order reasoning was nonetheless right and mine was wrong, see that finding.
- **`No element caught mid teleport on the HUD`, naming `362`: CONFIRMED, after I measured the opposite and then refuted myself.** See the withdrawal in the absences below. The displacement is real and it is the intended screen shake, so the absence stands as written.
- **`No wrong z order caught mid transition`: CONFIRMED.** Stacking order matches the settled neighbour on all 18 frames, and the source agrees on the one case I doubted (`MaxWinCelebration.svelte:227` against `:244`). The z problems both passes found are alpha and layer-membership problems, not ordering ones.
- **`No misplaced backdrop blur`: CONFIRMED.** Nothing on any of the 18 frames shows a blur anchored to a layer that has moved.
- **`No shadow or glow left behind by a moved element`: CONFIRMED.** Panel glows, neon borders and drop shadows track their panels on `314`, `345`, `347` and `360`.
- **`Nothing found on 312`: CONFIRMED.** SSIM `312` against `313` is `0.980793` and the only differences are the looping speed line streaks. No entrance state exists on that frame.

## Explicit absences, signed

Categories I looked for on all 18 frames and did not find, plus one finding of my own I
withdrew. I am signing all of these.

- **WITHDRAWN, my own STEP 2 finding that the control row teleports during the collect fade.** The measurement was real and is kept: on the native captures the yellow `MAX` label occupies exactly `x 217..246, y 519..526` on ELEVEN frames of this session (`317`, `324`, `349`, `350`, `351`, `352`, `358`, `359`, `363`, in both themes) and on `362` alone occupies `x 212..241, y 522..529`, five pixels left and three down, the same 29 px wide; the magenta SPIN disc moves with it, centre `157.0` against `161.5`. **The source refutes the finding.** `App.svelte:1701` puts `class:shake={shakeActive}` on the stage, `:2223` runs `.game-wrapper.shake { animation: screen-shake 0.42s ease-in-out; }`, and the portrait keyframes at `:2228` step through `translate(-7px, 5px)`, `translate(7px, -5px)`, `translate(-5px, 4px)`, `translate(5px, -3px)`. My measured `(-5, +3)` sits between the 60 and 80 per cent steps, so the measurement CONFIRMS the derivation rather than discovering a defect, per convention (l.2). The shake is deliberate, fires at `$winMultiplier >= 10` (`App.svelte:510`) and is documented at `:497-499`. Recorded rather than deleted because a five pixel displacement measured against eleven controls is exactly the kind of finding that would have gone into the ledger unchallenged.
- **No element left at the wrong SIZE mid transition.** Checked on the four scale entrances, `314`, `345`, `347` and `360`, by comparing panel widths against the settled neighbour. Every panel that is a different size from its neighbour is uniformly so, glow and border included.
- **No duplicated surface, no double-painted panel and no second copy of a modal.** On every overlay frame there is exactly one instance of each surface. Nothing is drawn twice at two offsets.
- **No torn or half-painted panel background.** Every panel background on the 18 frames is complete to its own border. The frame edges I report as severed, STM-MOBILES-11, are a full-bleed band drawn correctly over chrome it should not cross, not a paint failure.
- **No stale count-up left mid-flight after its surface settled.** The count-up disagreements on `324` and `362` are between two DIFFERENT meters, MID-01 and STM-MOBILES-10; no single meter is caught frozen part way.
- **No feature run frame audited, because none exists.** Signed as an absence of EVIDENCE, not of defects. `351` and `352` are the same image at SSIM `0.999845` and both show the undismissed entry card, so the Overdrive free spins run, the meter climb and the retrigger are unobserved at this viewport. Anything a marshal reads from these frames about the feature in flight is unsupported.
- **No transition captured at all for the paytable open.** `330` against `331` is SSIM `0.999989`. Whatever that surface does on the way in, no frame in this set contains it, so I can neither report nor clear it.
- **I did not judge timing.** No claim above rests on a millisecond. Every one rests on what is painted in a frame a viewer would see.

## KNOWN matches

- **KNOWN(MID-01)**: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/324_mobile-s_transition_bigwin_countup_early.png`. The banner reads `$10.28` while the HUD WIN pod reads `$15.95` at the same instant, on a win that settles at `$16.20` in `326_mobile-s_bigwin_settled.png`. Fresh evidence at mobile-s for the desktop `013`/`015` pattern; the banner figure lands one cent from the desktop instance, so the same two durations are in play at this viewport.
- **KNOWN(MID-02)**: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/324_mobile-s_transition_bigwin_countup_early.png`, `325_mobile-s_transition_bigwin_countup_late.png` and settled `326_mobile-s_bigwin_settled.png`, all rendering the unit as `16x BET`. Three more of the sixty frames the ledger counts. I could not settle the glyph from the raster, because the banner's `x` is small and raised and therefore looks like a `×`, so I settled it from the specification per convention (l.1): `frontend/src/lib/components/WinBanner.svelte:205` reads ``$: multLabel = `${Math.round(shownMultiplier)}x` ``, an ASCII U+0078. MID-02 is exact and the raster ambiguity is recorded so no later pass mistakes it for a refutation.
- **KNOWN(Q-26)**: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/347_mobile-s_transition_dialog_nitro_overdrive_opening.png` and settled `348_mobile-s_dialog_nitro_overdrive.png`. KNOWN_OPEN calls Q-26 a `Wave 3 fix candidate if visible on frames`. It is visible, and it is worse than the row implies. The NITRO dialog writes `5x` with a full height baseline letter `x` in the line `Buy a rich entry with the Overdrive meter pre-revved to 5x.`, and FOUR LINES BELOW writes `1x, 3x or 10x total bet.` with the small raised multiplication sign `×`. Both forms are in one panel, in one view, without scrolling, so this is not a class of scattered instances but a visible contradiction inside a single dialog.
- **KNOWN(TR-115 / TR-086)**: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/345_mobile-s_transition_dialog_buy_overdrive_opening.png` and `347_mobile-s_transition_dialog_nitro_overdrive_opening.png`. The MAX WIN cell of the dialog footer breaks `5,000x base bet` across three lines as `5,000x`, then `base`, then `bet`, inside a cell about 90 px wide. Money display fit failure at 320 px, in the class mapped to final mile JOB 3.
- **KNOWN(Q-16 park)**: recorded as evidence only, since this is an `en` session and therefore does not change the park's urgency the way the de and ar frames will. Parked English strings on my frames: `PRESS COLLECT OR HIT ENTER TO CONTINUE` fills two full lines under the COLLECT button on `360_mobile-s_transition_maxwin_overlay_fade.png`, and `Mute`, `MUSIC` and `SOUND` are on `327_mobile-s_transition_menu_opening.png`.
- **KNOWN(Q-34), partial**: `343_mobile-s_transition_features_menu_opening.png` renders the mode name as `Cruise` in title case. The `CRUISE` HUD badge the row pairs it with is not on any of my 18 frames, so I can evidence one half of the disagreement and not the other.

tree_after:
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
?? reports/qa/stream_test/shards/STM-MOBILES.md
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

Recorded verbatim from `git status --porcelain` at the end of this run. **Every line is `??`,
untracked. Nothing shows as MODIFIED and nothing as DELETED, so this run did not dirty the
tree.** All 28 lines are squad shards, mine among them; the other 27 belong to sibling
squads and are not my business.

Worth recording beside it, because the superseded shard raised it loudly: that pass reported
` M reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png`, a committed
evidence frame modified in the working tree. **It is no longer modified.** The tree is clean
of that overwrite at the time of this run. Whether it was restored or the cause was removed
is not something I can tell from `git status`, and I have not touched it either way.
