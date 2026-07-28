# STM-MOBILES, motion residue (mobile-s, 320x568, frames 312 to 362)
scope: every `transition_` frame of the `mobile-s` session, 18 of 18 covered. Settled endpoints 313, 315, 316, 317, 320, 323, 326, 328, 331, 340, 342, 344, 346, 348, 350, 352, 353, 357, 359, 361, 363 opened for comparison and not counted against the set, plus two cross-session controls, 041 (Desktop) and 248 (Mobile L).
frames_read: 18

Note on numbering: findings were written in severity order after the frame pass, then renumbered once when the source pass changed two severities. Nothing was dropped. STM-MOBILES-01 of the first write is now STM-MOBILES-02, downgraded to HIGH because the source shows the dip is deliberate; the old STM-MOBILES-02 is now STM-MOBILES-01, promoted because its mechanism derives exactly.

## STM-MOBILES-01 STREAM Three of the four reel rows are empty at the start of every spin, and the scene backdrop shows straight through the reel window
- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/318_mobile-s_transition_reels_accelerating.png`. Endpoints: `317_mobile-s_base_idle.png` before, `319_mobile-s_transition_reels_full_speed.png` and `320_mobile-s_dead_spin_1_settled.png` after.
- Claim: about 250 ms after the spin press, seven of the twenty grid cells carry no tile at all, not a dark tile and not a symbol, and the purple and pink scene backdrop is visible straight through the reel window. The filled cells form a staircase down the reels: reel 1 holds three rows, reel 2 holds two, reel 3 holds one, and reels 4 and 5 still hold all four of the idle symbols from `317`. The gaps are at the bottom of the window in every case. Both endpoints have a completely full window, so the transition passes through a state neither endpoint contains.

  Derived from the source first, per convention (l.1). The tile strip is `STRIP = ROWS + 3` = **7** slots (`frontend/src/lib/components/GameGrid.svelte:74`) of `TILE = CELL_H + GAP` = **104 px** (`:72`), so the strip is **728 px** tall. The reel window is `CANVAS_H` = **412 px** (`:67`). Drop mode releases the strip from `startY = REST_Y - DROP_H` = `-104 - 520` = **-624 px** (`GameGrid.svelte:498-500`). At that position the strip spans container y **-624 to +104**, so it covers only the top **104 px** of a 412 px window: **rows 1, 2 and 3 are empty and the backdrop is exposed**. The window is not fully covered until `728 + y >= 412`, that is `y >= -316`. With `y(f) = -624 + 520f²` (`:507`), that is `f = 0.7696`, so the hole is on screen for **77 per cent of the fall**: about **308 ms** of the 400 ms `FALL` (`:499`), or about **200 ms** in turbo at `FALL = 260`. The staircase in the frame is the per-column `delayMs` stagger (`:487`).

  **The frame confirms the derivation.** At the captured instant reel 3 shows exactly one covered row, reel 2 exactly two and reel 1 exactly three, which is the covered count `floor((728 + y) / 104)` at three successive stagger offsets, and the gaps sit at the bottom of the window, which is the direction the geometry predicts. Measurement confirmed the derivation rather than discovering it, per (l.2).

  This is every spin, every round, on the surface a slot audience watches for the entire broadcast.
- Where fixable: `frontend/src/lib/components/GameGrid.svelte:498` (`const DROP_H = 520`) and `:74` (`const STRIP = ROWS + 3`). Not locked.
- Proposed fix: the strip must be able to cover the window from its release point. Either cap the drop at `DROP_H = STRIP * TILE - CANVAS_H - VIS_OFFSET * TILE` = **212 px**, or raise `STRIP` to **9** so `9 * 104 = 936 >= 412 + 520` and seat the two extra slots with fillers in the existing `_dropReel` seeding loop at `:492-495`. The second keeps the drop's current travel and therefore its current feel.

## STM-MOBILES-02 HIGH The reel window reads as a blank black rectangle for a beat straight after the max win collect
- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/362_mobile-s_transition_maxwin_collect_fade.png`. Endpoints: `361_mobile-s_maxwin_celebration.png` before, `363_mobile-s_post_collect_base.png` after.
- Claim: at the sampled instant after COLLECT is pressed on the `5,000` max win, the reel window is an empty dark panel. No symbol is legible: only a dull yellow glow at centre right and two or three ghost outlines at very low opacity, one of them the `W` wild. The reel frame, its neon border and the whole HUD are at full brightness around it, and the HUD reads `WIN $5,000.00`, `BALANCE $50,000.00`, `TOTAL WIN $2.80`, `OVERDRIVE FREE SPINS 8`. Neither endpoint contains an empty reel window: `361` has the celebration over it, `363` has a legible dimmed board behind the free spins entry card.

  The mechanism is in source and it is deliberate, which is recorded rather than glossed. The board goes to `.fs-reel-pending { opacity: 0.28; filter: blur(3px) saturate(0.5); }` over a 160 ms transition (`frontend/src/lib/components/FreeSpinsPresentation.svelte:553-554`), and the entry sequence's `stage-dip` lays a further `background: #000` at `opacity: 0.55` over the whole stage (`:576-579`). Multiplied, the board sits at about **0.126** of its normal luminance. The entry card's own content is still invisible at that stage: the gauge wrap and the title are both `opacity: 0; transform: scale(0.4)` until `stage-gauge` (`:582-586` and `:621-625`). The only thing painted over the dip at that moment is `entry-scatter-flare` (`:571-573`), and the dull yellow blob in the frame is it.

  So the finding is not that the dip is unintended. It is that **at 320x568 the flare that is meant to carry the dip is too small and too dull to carry it**, so the beat reads as a rendering fault rather than as a dramatic pause, at the single most-watched moment this game will ever put on a stream. The severity is what a viewer sees, and a viewer sees the reels go black.
- Where fixable: `frontend/src/lib/components/FreeSpinsPresentation.svelte:553-554`, `:571-579`, `:582-586`. Not locked.
- Proposed fix: PARK(art call, and it is a celebration surface). The options for the owner: hold the board at `.fs-reel-pending` without the additional `stage-dip` black on portrait viewports; or scale `entry-scatter-flare` with the viewport so the dip is always covered by something bright; or shorten the flare stage so the gauge arrives while the board is still legible.

## STM-MOBILES-03 HIGH The rules gate's scrim trails its card, so the base game is briefly lit at full brightness behind an opaque modal
- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/314_mobile-s_transition_splash_to_rules.png`. Endpoints: `313_mobile-s_splash.png` before, `315_mobile-s_intro_rules.png` after.
- Claim: the manifest calls this frame `Mid-fade between splash and rules card`. What is behind the card is not the splash. It is the base game, at close to full brightness: `FUTURE SPINNER` reads clearly at the top, and the bottom HUD shows `$1.00`, `MAX` and the `SPIN` button, with the balance and bet pods legible down both sides of the card. In the settled endpoint `315` that same background is dimmed almost to black. The card itself is already fully opaque with crisp text.

  Derived: the two are separate animations on separate elements with different durations and different curves. The scrim is `animation: intro-fade-in 0.35s ease both` over `background: rgba(0, 0, 0, 0.86)` (`frontend/src/lib/components/IntroSplash.svelte:46-49`), and the card is `animation: intro-card-in 0.4s cubic-bezier(0.34, 1.2, 0.4, 1) both` from `opacity: 0; transform: scale(0.92)` (`:79`, `:148`). `ease` is slow out of the gate, so at t = 100 ms the scrim has delivered roughly a fifth of its 0.86 alpha while the card's own opacity is already most of the way to 1. The card leads and the scrim trails, by construction. The card is also drawn wider in `314` than in `315`, roughly `x 8..312` against `x 15..305`, which is the `1.2` overshoot in the card's bezier and is correct behaviour, not a fault.
- Where fixable: `frontend/src/lib/components/IntroSplash.svelte:49` against `:79`. Not locked.
- Proposed fix: shorten and front-load the scrim, for example `animation: intro-fade-in 0.18s ease-out both`, so the dim is effectively down before the card becomes legible. One-line change.

## STM-MOBILES-04 HIGH Every `feature_run` frame in the whole capture set still shows the undismissed entry card, so the Overdrive free spins run is unaudited in all ten sessions
- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/351_mobile-s_transition_feature_starting.png`, which the manifest calls `Feature starting, entry card dismissing`. Endpoints and controls: `350_mobile-s_feature_entry_card.png`, `352_mobile-s_feature_run_1.png`, `353_mobile-s_feature_run_2.png`, `357_mobile-s_feature_run_6.png`, plus `041_desktop_feature_run_1.png` and `248_mobile-l_feature_run_1.png`.
- Claim: `350`, `351`, `352`, `353` and `357` are indistinguishable. All five show the entry card at full opacity with `OVERDRIVE FREE SPINS`, `+16 FREE SPINS` and `TAP TO CONTINUE`, the pods reading `OVERDRIVE FREE SPINS 16` and `TOTAL WIN $10.80`, and the win strip reading `SCATTER x5 5 ways $12.00`. The frame labelled `entry card dismissing` shows no dismissal, and the six frames labelled `Overdrive free spins in flight, interval frame 1 of 6` through `6 of 6` show no free spin.

  The two cross-session controls prove it is not a mobile-s problem: `041_desktop_feature_run_1.png` and `248_mobile-l_feature_run_1.png` both show the same undismissed `TAP TO CONTINUE` card. The harness never cleared the gate in any session, so the eight frames per session meant to capture the feature, **eighty across the set**, all capture the same pre-tap card. The feature did eventually run, because `358_mobile-s_transition_feature_exit.png` reads `WIN $325.35`, so the run happened between `357` and `358` and was never photographed.

  **The Overdrive free spins presentation, the meter climb and the retrigger are unaudited by this capture set in every session.** A marshal reading these filenames would otherwise conclude the feature had been swept. The component has a `skipContinueGate` prop for exactly this purpose (`frontend/src/lib/components/FreeSpinsPresentation.svelte:36`, honoured at `:223`), which `App.svelte:1726` already passes for the warm path, so the harness has a supported way in and did not use it.
- Where fixable: the capture harness, not the frontend. The supported entry point is `frontend/src/lib/components/FreeSpinsPresentation.svelte:36` (`export let skipContinueGate = false`).
- Proposed fix: the harness must dispatch the continue tap, or drive the presentation with `skipContinueGate`, and assert the card has gone before it starts the interval timer. Re-capture the feature run for at least one session before the feature is called swept.

## STM-MOBILES-05 HIGH The HUD menu panel is not opaque, so balance and win digits ghost through the menu labels
- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/327_mobile-s_transition_menu_opening.png`. Endpoint: `328_mobile-s_hud_menu.png`.
- Claim: the menu panel covers the BALANCE and WIN pods and the pod contents are legible straight through it. On the row carrying the menu item `Session`, the balance figure shows through as `00.00` to the right of the word and the win figure shows through as `$16.2` in its pink pod colour, both crossing the menu's own text. This is text rendered over text on a control surface.

  Derived: `.hud-menu { background: rgba(6, 6, 18, 0.96); }` (`frontend/src/lib/components/HudOverlay.svelte:1603`). Four per cent of a glowing pink numeral on near-black is exactly the faint but readable ghost the frames show, and the pods carry text glow which is what pushes it over the threshold. It is not transition only: the same bleed is at identical strength in the settled endpoint `328`, so the panel background is under specified rather than mid animation.

  Two further z problems on the same frame, from the same cause: the controls behind the menu are not dimmed at all, and the bet increase control `▲` stays fully lit and visible beside the panel at roughly `x 275, y 445`, so a live control sits alongside an open menu.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1603`. Not locked.
- Proposed fix: make the alpha `1` on `.hud-menu`, or drop the panel onto an opaque token. One-value change. Separately, add a scrim behind the menu so no control behind it reads as live.

## STM-MOBILES-06 MEDIUM Overlays pop: seven captures deliberately aimed mid transition land on an endpoint state
- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/327_mobile-s_transition_menu_opening.png` against `328_mobile-s_hud_menu.png`; `330_mobile-s_transition_paytable_opening.png` against `331_mobile-s_paytable_top.png`; `341_mobile-s_transition_paytable_closing.png` against `340_mobile-s_paytable_09_disclaimer.png` and `342_mobile-s_autoplay_menu.png`; `343_mobile-s_transition_features_menu_opening.png` against `344_mobile-s_features_menu.png`; `349_mobile-s_transition_feature_entry_fade.png` against `350_mobile-s_feature_entry_card.png`; `316_mobile-s_transition_rules_to_base.png` against `317_mobile-s_base_idle.png`.
- Claim: seven frames captured on purpose at `mid-open`, `mid-close` and `mid-fade` land on an endpoint state. `330` and `331` are indistinguishable. `343` and `344` differ only in the fill of the `BET MODES` button. `349` and `350` are indistinguishable. `341`, captured as `Paytable mid-close`, contains no trace of the paytable whatsoever and is the settled base game. `316`, captured as `Mid-fade between rules and base game`, contains no trace of the rules card and is identical to `317`. Timing is approximate by nature and one such frame would prove nothing, but seven aimed captures across six different surfaces all landing on an endpoint is a pattern, and it says these overlays appear and disappear without an entrance or an exit a viewer can see. Against this, `314`, `345` and `360` do show genuine mid states, so the harness is capable of catching one, which is what makes the seven meaningful.

  Corroborated from source rather than from the frames alone: the surfaces that DO show a mid state are the ones that carry an entrance, `IntroSplash.svelte:49,79` and `BuyBonus.svelte:167,180`. The paytable, the HUD menu and the features menu carry no equivalent enter or leave transition.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1598-1608` (`.hud-menu`, no transition declared), `frontend/src/lib/components/PaytableModal.svelte`, `frontend/src/lib/components/FeatureMenu.svelte`. None locked.
- Proposed fix: give the menu, the paytable and the features menu the same enter and leave pair the buy dialog already uses at `BuyBonus.svelte:167,180-182`, about 200 ms, so the whole game shares one overlay motion vocabulary.

## STM-MOBILES-07 MEDIUM Falling tiles carry no motion cue at all, because the drop path never writes the stretch and alpha the cruise path uses
- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/318_mobile-s_transition_reels_accelerating.png` and `319_mobile-s_transition_reels_full_speed.png`. Endpoints: `317_mobile-s_base_idle.png` and `320_mobile-s_dead_spin_1_settled.png`.
- Claim: `319` is captured as `Reels at full speed` and all twenty symbols are crisp, fully drawn and unstretched, indistinguishable in rendering from the settled frames. Derived: the motion cue is two CSS custom properties, `--ts` (a vertical stretch up to `1.18`) and `--ta` (an alpha down to `0.66`), written from the per-reel velocity in `_positionStrip` (`frontend/src/lib/components/GameGrid.svelte:350-351`) and consumed at `:1272-1273` as `transform: scaleY(var(--ts, 1)); opacity: var(--ta, 1);`. **`_dropReel` never calls `_positionStrip`** (`:486-516`): it writes `strip.style.transform` directly at `:500` and `:508`. So on the drop path both properties fall through to their CSS defaults of `1` and `1`, and the falling tiles render at full opacity with no stretch, exactly as they do at rest. The blur band the code comments describe at `:215-216` and `:554-556` is built and then not applied on this path.

  Correction recorded honestly: the first write of this shard claimed the reels do not translate at all. That was wrong, and the source is why it is now known to be wrong. The strip does translate, at `:346` and `:508`. What is missing is the blur, not the movement.
- Where fixable: `frontend/src/lib/components/GameGrid.svelte:486-516`, against `:350-351`. Not locked.
- Proposed fix: in `_dropReel`'s `fall` loop, set `--ts` and `--ta` from the instantaneous fall speed the same way `_positionStrip` does, or call `_positionStrip` from the drop path so the two spin modes share one motion cue.

## STM-MOBILES-08 MEDIUM The buy dialog's body copy re-wraps between the mid-open frame and the settled frame
- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/345_mobile-s_transition_dialog_buy_overdrive_opening.png` against endpoint `346_mobile-s_dialog_buy_overdrive.png`, and `347_mobile-s_transition_dialog_nitro_overdrive_opening.png` against endpoint `348_mobile-s_dialog_nitro_overdrive.png`.
- Claim: in `345` the third body line breaks as `3, 4 or 5 Scatters award 8, 12 or` with `16 free spins and pay an instant` following. In the settled `346` the same paragraph breaks as `3, 4 or 5 Scatters award 8, 12 or 16` with `free spins and pay an instant` following. The word `16` jumps a line as the dialog finishes opening, so the whole paragraph re-shuffles in front of the player. `347` against `348` shows the same behaviour, with the clip point of the body text moving between the two frames.

  **The obvious explanation is ruled out at source and the honest answer is that the cause is not yet located.** The entrance is `@keyframes buy-pop { from { opacity: 0; transform: scale(0.86); } to { opacity: 1; transform: scale(1); } }` (`frontend/src/lib/components/BuyBonus.svelte:182`), and a transform cannot reflow text: line breaks are computed at layout width, which the scale does not touch. The width is static at `width: min(94vw, 460px)` (`:174`). The remaining candidate on that same line is `overflow-y: auto`: if the vertical scrollbar toggles as late content settles, for instance when the 88 px header art at `:183` finishes decoding and changes the content height, the content box narrows by the scrollbar width and the paragraph re-wraps. That is a hypothesis, not a derivation, and it is written as one per (l.6).
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:174`. Not locked.
- Proposed fix: add `scrollbar-gutter: stable` to `.buy-modal` so the gutter is reserved and no late toggle can reflow the copy, then re-capture to confirm. If the reflow survives that, the cause is elsewhere and the item goes back open rather than being called fixed.

## STM-MOBILES-09 MEDIUM Two sibling buy dialogs one tap apart title themselves in different cases, `Buy Overdrive` and `NITRO OVERDRIVE`
- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/345_mobile-s_transition_dialog_buy_overdrive_opening.png` and `347_mobile-s_transition_dialog_nitro_overdrive_opening.png`. Endpoints `346` and `348` carry the same strings.
- Claim: out of lens, recorded because both frames are mine. The confirm dialog for the `bonus` mode titles itself `Buy Overdrive` in title case and the dialog for the `super` mode titles itself `NITRO OVERDRIVE` in full upper case, in the same component, one tap apart, under identical sub lines `Start Overdrive Free Spins now at 100x your bet?` and `Start Overdrive Free Spins now at 400x your bet?`. The features menu at `344` renders its mode names in title case, `Normal` and `Cruise`, which puts the upper case one in a minority of three. The source is `frontend/src/lib/i18n/prose.ts:91` (`modeBonusLabel: 'Buy Overdrive'`) against `:93` (`modeSuperLabel: 'NITRO OVERDRIVE'`). `FreeSpinsPresentation.svelte:120` hardcodes `'NITRO OVERDRIVE'` a second time, outside the locale table. This is the charter's cross surface capitalisation class and it is a different row from Q-34, which is about `Cruise` against `CRUISE` on one mode.
- Where fixable: `frontend/src/lib/i18n/prose.ts:91,93`, plus the hardcoded duplicate at `frontend/src/lib/components/FreeSpinsPresentation.svelte:120`. Neither locked.
- Proposed fix: PARK(sizing, not difficulty). Lowering `modeSuperLabel` to title case touches all sixteen locales, since `prose.locales.ts` repeats `'NITRO OVERDRIVE'` at `:47`, `:123`, `:199`, `:275` and siblings; raising `modeBonusLabel` is one line. The direction is an art call, so it goes to the owner rather than being picked here.

## STM-MOBILES-10 LOW The HUD menu mixes upper case and title case in one five item panel
- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/327_mobile-s_transition_menu_opening.png`. Endpoint `328_mobile-s_hud_menu.png` is identical.
- Claim: out of lens, recorded because the frame is mine. The menu reads `PAYTABLE` in upper case, then `Session` and `Mute` in title case, then `MUSIC` and `SOUND` in upper case as slider labels: five labels and two treatments in one panel about 150 px tall. `PAYTABLE` comes from the locale table (`frontend/src/lib/i18n/translations.ts:271`), while `Session` is a hardcoded literal on the markup (`frontend/src/lib/components/HudOverlay.svelte:547` for the portrait menu, repeated at `:428`, `:655` and `:817` for the other three layouts). Charter class 4. Not covered by Q-16, which parks `Mute` and `Unmute` for being hardcoded English rather than for their casing.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1609` (`.hud-menu-item`), or the strings at `translations.ts:271` and `HudOverlay.svelte:428,547,655,817`. Not locked.
- Proposed fix: one `text-transform` on `.hud-menu-item` so the panel cannot drift again, rather than editing five strings in four layout branches.

## STM-MOBILES-11 LOW The paytable's ways to win diagram is clipped by the panel edge at 320 px, losing the fifth reel chip
- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/330_mobile-s_transition_paytable_opening.png`. Endpoint `331_mobile-s_paytable_top.png` is identical.
- Claim: out of lens, recorded because the frame is mine. The chip row that illustrates the ways mechanic reads `1 → 2 → 3 → 4 → 5`, and the `5` chip is cut vertically by the panel's right border, showing about half a glyph. The caption directly below reads `Reels 1, 2 and 3 hold the same symbol (highlighted), which is a match read left to right from reel 1. Reels 4 and 5 are not required.`, so the clipped chip is one of the two the caption points at. This is the diagram that teaches the game's core mechanic and at this width it is visibly truncated.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte`, exact line UNKNOWN, the chip row rule was not located within the source budget.
- Proposed fix: shrink the chip and arrow scale below about 360 px, or let the row scroll horizontally inside its own `overflow-x` container.

## STM-MOBILES-12 LOW The features menu bet stepper wraps to two rows at 320 px, splitting minus from plus and from the value
- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/343_mobile-s_transition_features_menu_opening.png`. Endpoint `344_mobile-s_features_menu.png` is identical.
- Claim: out of lens, recorded because the frame is mine. The row renders as `SPIN COST $1.00  BET` with the `-` control alone on the first line, and `$1.00` with the `+` control on a second line below it. The decrement and the increment of one stepper end up on different rows with the value beside only one of them, which reads as two separate controls rather than one. The wrap is declared: `.fm-betbar > .fs-face { flex-direction: row; align-items: center; gap: 0.7rem; padding: 8px 16px; flex-wrap: wrap; }` (`frontend/src/lib/components/FeatureMenu.svelte:847`), and the sibling rule at `:761` uses `flex-wrap: nowrap`, so the two rules disagree about the same class of row.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:847`. Not locked.
- Proposed fix: keep the stepper controls and the value in one non wrapping group and let the `SPIN COST` label wrap instead.

## STM-MOBILES-13 LOW The Overdrive multiplier has no readout on this viewport, which is deliberate and is raised as a question rather than a defect
- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/351_mobile-s_transition_feature_starting.png` and `349_mobile-s_transition_feature_entry_fade.png`. Control: `041_desktop_feature_run_1.png`.
- Claim: at 320x568 the feature HUD carries exactly two pods, `OVERDRIVE FREE SPINS 16` and `TOTAL WIN $10.80`. The desktop frame at the same point of the same round carries three, the third being `MULTIPLIER 1x`. **This is intended and it is recorded in the source**, so it is not being reported as a bug: `frontend/src/lib/components/BonusInstrumentColumn.svelte:15-17` states that portrait shows exactly two fields and that the multiplier is `a landscape-only centrepiece per the brief`, repeated at `:57-60` as an owner-audit relayout decision. The question raised, and it is only a question: the Overdrive meter is the mechanic the rules card in `315` spends a whole paragraph on, portrait mobile is a common stream layout, and in portrait the player watches a meter climb they cannot see. Caveat recorded honestly: because of STM-MOBILES-04 no frame of an actual free spin exists in any session, so it cannot be ruled out that a compact readout appears once the run starts, and that uncertainty is itself a consequence of the capture gap.
- Where fixable: `frontend/src/lib/components/BonusInstrumentColumn.svelte:56-70` (the `compact` branch). Not locked.
- Proposed fix: none proposed. Confirm against a real feature run first, then put it to the owner as a question, since the current state is a recorded decision and (l.8) applies.

## Explicit absences, signed

Each of these is a category I looked for on all 18 frames and did not find. I am signing the absence.

- **No ghost of a dismissed surface anywhere.** `316` after the rules card, `341` after the paytable and `358` after the feature all contain zero residue of the surface just dismissed: no faint copy, no leftover scrim, no orphaned shadow, no stale pod. The failure on this project is the opposite one, surfaces that appear and vanish with no transition at all, which is STM-MOBILES-06.
- **No wrong z order caught mid transition.** On every one of the 18 frames the stacking matches the settled endpoint either side: banner above reels on `324` and `325`, dialog above features menu on `345` and `347`, entry card above reels on `349` and `351`, celebration above everything on `360`, menu above HUD on `327`. The one z problem I did find, STM-MOBILES-05, is present at identical strength in its settled endpoint and is therefore not a transition fault.
- **No misplaced backdrop blur.** Checked on every overlay frame, `314`, `327`, `330`, `343`, `345`, `347`, `349`, `360` and `362`. The only `backdrop-filter` on an overlay in this build is `blur(3px)` on the rules scrim (`IntroSplash.svelte:47`), and on `314` it is correctly anchored to the scrim rather than to a layer that has moved. The related failure I did find, a dim applied ahead of the content it belongs to, is STM-MOBILES-02.
- **No element caught mid teleport on the HUD.** Across `318`, `319`, `324`, `325`, `358` and `362` the BALANCE, WIN, BET and SPIN elements hold identical positions to their settled endpoints. Nothing jumps between the transition frame and either endpoint. Count-up values change, which is expected, and the disagreement between two of them is the already tracked MID-01 below.
- **No shadow or glow left behind by a moved element.** Checked specifically on the three scale entrances, `314`, `345`, `347` and `360`. In every case the panel glow, the neon border and the drop shadow track the panel geometry frame for frame. The card in `314` is a different size from its endpoint and its glow is that same different size.
- **No text over text caused by a transition.** The one instance of text over text, `327`, is a fixed panel alpha of `0.96` present in the settled state, reported as STM-MOBILES-05.
- **No celebration mispositioned mid animation.** `360` differs from `361` only by a uniform scale down. `MAX WIN REACHED!`, the `5,000` figure, the three stars and the COLLECT button hold their relative positions and their common horizontal centre. I checked specifically for the headline drifting off centre against the button, and for the particle field occluding the figure: particles cross the headline in both frames, which is the design.
- **Nothing found on `312`.** The splash entrance frame at about 600 ms is already fully settled: logo, wheel and `TAP TO CONTINUE` all at final opacity and final position, matching `313` except for the decorative speed line streaks, which differ between the two because they are a looping effect rather than an entrance. No entrance state was caught, which is consistent with STM-MOBILES-06 but too weak alone to be evidence, so it is recorded here rather than as a finding.

## KNOWN matches

- KNOWN(MID-01): `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/324_mobile-s_transition_bigwin_countup_early.png`, the banner reads `$10.28` while the HUD WIN pod reads `$15.95` at the same instant, on a win that settles at `$16.20` in `326_mobile-s_bigwin_settled.png`. This is the mobile-s instance of the desktop `013`/`015` pattern, and its banner figure lands one cent from the desktop one, so the same two durations are in play at this viewport.
- KNOWN(MID-02): `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/324_mobile-s_transition_bigwin_countup_early.png` and `325_mobile-s_transition_bigwin_countup_late.png`, both render the unit as `16x BET` with the ASCII letter `x`, not `×`. Two more of the sixty frames the ledger counts.
- KNOWN(TR-115 / TR-086): `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/345_mobile-s_transition_dialog_buy_overdrive_opening.png` and `347_mobile-s_transition_dialog_nitro_overdrive_opening.png`, the MAX WIN cell of the dialog footer breaks `5,000x base bet` across three lines as `5,000x` then `base` then `bet` inside a cell about 90 px wide. Money display fit failure at 320 px, in the class mapped to final mile JOB 3.
- KNOWN(Q-16 park): the parked English strings are frame visible at this viewport, recorded as evidence although this session is `en`, so it does not change the park's urgency the way the de and ar squads' frames will. `PRESS COLLECT OR HIT ENTER TO CONTINUE` fills two full lines under the COLLECT button on `360_mobile-s_transition_maxwin_overlay_fade.png`, and `Mute` and the `PAYTABLE` menu item are both on `327_mobile-s_transition_menu_opening.png`.

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

**LOUD: A COMMITTED EVIDENCE FRAME IS MODIFIED IN THE WORKING TREE.**

`reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png` shows as ` M`.
It went from **59,295 bytes at HEAD to 91,803 bytes on disk** (`git diff --stat`
reports `Bin 59295 -> 91803 bytes`). A committed capture frame has been overwritten
during this wave.

It is **not mine**. Frame 188 is a `popout-s` state frame and is outside my assigned
set of 18 `mobile-s` transition frames; my only write this run was
`reports/qa/stream_test/shards/STM-MOBILES.md`, and I opened frames with the Read
tool only. I have **not** restored it, because that is a write outside my one
permitted path and because whoever overwrote it should be identified before the
evidence is reset.

This is convention **(h.1)** exactly, the SA-012 case: *evidence that a casual re-run
can overwrite is not evidence*. The named repeat offenders in CLAUDE.md are
`frontend/scripts/anticipation_proof.mjs`, `layout_fit_gate.mjs` and
`contrast_gate.mjs`, all of which screenshot straight into committed directories.
A byte count that grew by 55 per cent says this frame was re-rendered, not corrupted.

For the marshal: **any finding another squad has written against frame 188 is now
citing a file that no longer matches HEAD**, so that citation cannot be checked by a
later reader. Restore it with `git checkout -- reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png`
before consolidating, and establish which run wrote it.

Every other line above is a squad shard, untracked, which is expected. Nothing is DELETED.
