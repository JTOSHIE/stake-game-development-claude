# STT-DESKTOP-B, typography (desktop, frames 027 to 052)

scope: Every frame of the `desktop` session (1200x675, lang en) numbered 027 to 052 inclusive, 26 frames: the last three paytable sections, the paytable close transition, the autoplay menu, the features menu and its opening transition, both buy dialogs and their opening transitions, the feature entry card and its two transitions, the six feature-run interval frames, the feature exit, post-feature base, the max win overlay fade, the max win celebration, the collect fade and post-collect base. Lens: case, weight, spacing, family, numeral behaviour, clipping, quote and dash hygiene, currency and decimal agreement.
frames_read: 26

A note the marshal should read before the findings. My step 2 shard carried nine findings written from the frames alone. Step 3 read the source and **refuted four of them**, including two rated HIGH. They are written out under "Refuted by source" below rather than deleted, because a squad that quietly drops a claim it made is indistinguishable from a squad that never made it, and the refutations are the most useful thing in this shard for the next lens that looks at these surfaces. In particular, **I withdraw a KNOWN(MID-02) match on frames 049 and 050**: the max win overlay writes U+00D7, not the ASCII letter, so MID-02's stated frame count should not be extended to the max-win frames on my evidence.

## STT-DESKTOP-B-01 HIGH The max win celebration sets one unit in three type sizes on two baselines

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/049_desktop_transition_maxwin_overlay_fade.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/050_desktop_maxwin_celebration.png
- Claim: The celebration figure is built from three adjacent spans, `frontend/src/lib/components/MaxWinCelebration.svelte:155` and `:159`, and each is given its own size and its own vertical treatment:
  - `.c1-max-mult` `font-size: 96px`, `font-weight: 900` (`MaxWinCelebration.svelte:301-307`)
  - `.c1-max-x` `font-size: 46px`, no `letter-spacing`, `align-self: flex-end`, `padding-bottom: 0.12em` (`:309-315`)
  - `.c1-max-betlabel` `font-size: 22px`, `letter-spacing: 0.2em`, `align-self: flex-end`, `padding-bottom: 0.28em` (`:316-323`)

  So the `×` is 48 per cent of the numeral and 209 per cent of the word beside it, the word carries 0.2em of tracking and the `×` carries none, and the two are bottom-aligned with **different** `padding-bottom` values (`0.12em` against `0.28em`) inside a container whose `align-items` is `baseline` (`:295-300`), so they do not sit on a shared baseline. The separator between them is a `gap: 0.1em` on a 96px flex container rather than a word space, which at these sizes closes to a hairline. On screen it reads as `5,000` `x` `BET` in three sizes crammed together, and it is the centre of the single most-watched frame the game produces.
- Where fixable: frontend/src/lib/components/MaxWinCelebration.svelte:155-159 (markup) and :295-323 (the three rules). Not locked.
- Proposed fix: set the `×` and the `BET` label at one size with one `letter-spacing` and one `padding-bottom`, and give the wrap a real word space (raise `gap` to about `0.25em`) so the unit reads as one token.

## STT-DESKTOP-B-02 HIGH The buy dialog's two buttons are the only buttons in the session with no tracking, no case rule and no size of their own

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/034_desktop_transition_dialog_buy_overdrive_opening.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/035_desktop_dialog_buy_overdrive.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/036_desktop_transition_dialog_nitro_overdrive_opening.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/037_desktop_dialog_nitro_overdrive.png
- Claim: `.buy-cancel, .buy-confirm` is `flex: 1; padding: 10px; border-radius: 8px; cursor: pointer; font-family: var(--fs-font-display); font-weight: 700;` and nothing else (`frontend/src/lib/components/BuyBonus.svelte:248`). No `letter-spacing`, no `text-transform`, **no `font-size`**. Every comparable button in my frames carries all three:
  - `.fm-select, .fm-activate, .fm-toggle`: `font-size: 0.66rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase` (`frontend/src/lib/components/FeatureMenu.svelte:964-966`), which is `SELECT`, `OFF`, `ACTIVATE` on frame 033
  - `.c1-collect`: `font-size: 18px; letter-spacing: 0.22em` (`frontend/src/lib/components/MaxWinCelebration.svelte:331-332`), which is `COLLECT` on frame 050
  - and `BuyBonus.svelte:159`, a button in the very same file, carries `letter-spacing: 1px`

  With `font-size` unset the two buttons fall through to the **Vite scaffold** `button` rule at `frontend/src/app.css:145-158` (`font-size: 1em`, `font-weight: 500`, `background-color: #1a1a1a`, and a `#646cff` hover border), so they render at roughly 16px against 10.6px and 18px for every other button, in weight 700 against 800 and 900, with zero tracking against 0.08em and 0.22em. That combination is why they read on the frame as a different typeface from everything around them. It is on the screen where the player parts with 100 or 400 times their bet.
- Where fixable: frontend/src/lib/components/BuyBonus.svelte:248, and the scaffold block at frontend/src/app.css:145-158. Neither locked.
- Proposed fix: give `.buy-cancel, .buy-confirm` the `.fm-select` values (`font-size`, `font-weight: 800`, `letter-spacing: 0.08em`, `text-transform: uppercase`) so the whole button family matches, and retire the scaffold `button` block per Q-27 rather than leaving live components inheriting from it.

## STT-DESKTOP-B-03 MEDIUM TR-037's max-win fit fix was applied to the paytable cards and not swept to the buy dialogs, where the same phrase now wraps mid-noun

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/034_desktop_transition_dialog_buy_overdrive_opening.png, 035_desktop_dialog_buy_overdrive.png, 036_desktop_transition_dialog_nitro_overdrive_opening.png, 037_desktop_dialog_nitro_overdrive.png
- Claim: In the dialog's three-cell stat strip the values are `$100.00` (or `$400.00`), `96.35%` and `5,000× base bet`. The third wraps to `5,000× base` on line one and `bet` alone on line two, splitting the noun phrase, making the third cell two lines deep against one-line siblings and breaking the strip's baseline.

  This is the exact shape TR-037 already diagnosed and fixed elsewhere. `frontend/src/lib/config/fsModes.ts:161-170` records it: *the per-mode cards rendered the whole phrase as the VALUE and clipped it to "5,000x ba..." on every card at 1280x720*, and the fix was to move the qualifier into the stat LABEL and leave the bare figure as the value, which `frontend/src/lib/components/PaytableModal.svelte:334-338` implements. The buy dialog was not changed with it: `frontend/src/lib/components/BuyBonus.svelte:131-134` still puts `t(..., 'hudMaxWin', ...)` in `.buy-stat-label` and the whole `maxWinVsBaseBetLabel()` phrase in the value span. Same defect class, same figure, one surface fixed and one not.
- Where fixable: frontend/src/lib/components/BuyBonus.svelte:131-134 (not locked)
- Proposed fix: apply the TR-037 shape here too, qualifier into the label (`MAX WIN, BASE BET`) and the bare `5,000×` as the value, so the two surfaces share one solution instead of two.

## STT-DESKTOP-B-04 MEDIUM The autoplay panel's four option labels disagree on weight, tracking and case with the header directly beneath them

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/031_desktop_autoplay_menu.png
- Claim: `.auto-menu-toggle` is `font-size: 0.82rem; letter-spacing: 0.02em` with **no `font-weight`**, so it renders at Orbitron 400, sentence case, effectively untracked (`frontend/src/lib/components/HudOverlay.svelte:1800-1812`, markup at `:945-951`). Immediately below it in the same panel, `SPINS` is `font-size: .46rem; font-weight: 800; letter-spacing: .14em` (`HudOverlay.svelte:1542`), and the HUD labels below that are `font-weight: 800` at `letter-spacing: .02em` and above (`:1417`). Orbitron 400 is the only place in my 26 frames where the lightest loaded weight (`frontend/src/main.ts:2-4` loads 400, 700 and 900) is used for a body label, and at 13px sentence case it does not read as the same face as anything around it. Four labels, in the panel a streamer opens on camera to arm autoplay.
- Where fixable: frontend/src/lib/components/HudOverlay.svelte:1800-1812 (not locked). The same block is repeated across the layout branches at `:503`, `:739` and `:945`, all sharing this one class.
- Proposed fix: add `font-weight: 700` and raise `letter-spacing` to the panel's own `0.08em` to `0.14em` band, so the options match their own section header.

## STT-DESKTOP-B-05 MEDIUM The features panel's spin-cost figure is set so small, so heavy and so glowing that it reads as a struck-out price

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/032_desktop_transition_features_menu_opening.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/033_desktop_features_menu.png
- Claim: On the panel's top bar the same amount, `$1.00`, is rendered twice about 300 px apart in two very different treatments. The spin-cost instance is `.fm-spin-cost .fs-num`: `font-weight: 800`, `text-shadow: 0 0 4px var(--sig-gold)`, inside a parent set to `font-size: 0.62rem` (`frontend/src/lib/components/FeatureMenu.svelte:848-852`, markup `:334`). The bet instance is `.fm-betval`: `font-size: 0.98rem; font-weight: 900` with a 3px shadow (`:861-864`, markup `:344`). At the captured 1200x675 the 0.62rem instance is about 10px, and at weight 800 with a 4px gold bloom its glyphs merge into a single bright horizontal mass; on both frames I first read it as a strikethrough through the price. I checked and there is **no `line-through` anywhere in `frontend/src`**, so it is not a decoration, it is the size, weight and glow combination destroying the figure. A price that reads as struck out is worse than a price that is merely small.
- Where fixable: frontend/src/lib/components/FeatureMenu.svelte:848-852 (not locked)
- Proposed fix: raise `.fm-spin-cost` off 0.62rem (0.72rem clears it), drop the `.fs-num` weight to 700 and cut the gold `text-shadow` to 2px, so the figure resolves as digits.

## STT-DESKTOP-B-06 MEDIUM The `FUTURE SPINNER` wordmark is cut by the top of the viewport in most base and feature frames and is not cut in two others

- Frames cut: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/030_desktop_transition_paytable_closing.png, 038_desktop_transition_feature_entry_fade.png, 039_desktop_feature_entry_card.png, 040_desktop_transition_feature_starting.png, 041_desktop_feature_run_1.png, 042_desktop_feature_run_2.png, 043_desktop_feature_run_3.png, 044_desktop_feature_run_4.png, 045_desktop_feature_run_5.png, 046_desktop_feature_run_6.png, 047_desktop_transition_feature_exit.png, 048_desktop_post_feature_base.png. Frames NOT cut: 051_desktop_transition_maxwin_collect_fade.png, 052_desktop_post_collect_base.png. All under /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/
- Claim: In the twelve frames listed as cut the wordmark sits flush against the top edge of the canvas with the tops of its tall letters and the whole of its glow truncated. In 051 and 052, the same session at the same 1200x675 viewport, the identical wordmark sits roughly 20 px lower with full clearance and the reel frame beneath it is correspondingly lower. So the stage's vertical placement is not constant within one session at one viewport, and in the higher of the two placements the game's own title is trimmed. Recorded from the typography lens because the visible symptom is a truncated wordmark; the cause is a stage-placement variance and the layout lens may own the fix.
- Where fixable: frontend/src/App.svelte:1796 (`.logo-box` markup) and :2459 (its rule), with the vertical crop reasoning at :812-902. Not locked.
- Proposed fix: PARK(the two placements need reconciling before either is called correct, and the crop block at App.svelte:812-902 records measured reasoning that a typography squad should not overrule from twelve frames)

## STT-DESKTOP-B-07 LOW Two Interface Guide cards restate their own name in a second casing

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/027_desktop_paytable_07_interface_guide.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/028_desktop_paytable_08_responsible_play.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/029_desktop_paytable_09_disclaimer.png
- Claim: The card titled `Features` describes itself as `guideFeaturesDesc: 'Open the FEATURES menu to pick a bet mode or buy the feature.'` (`frontend/src/lib/i18n/prose.ts:129`), so the same word appears twice on one card in two casings. The card titled `Turbo` describes `guideTurboDesc: 'Speed up spins. The bolt brightens at each of the three speeds: normal, turbo, super turbo.'` (`prose.ts:135`), the same word again in two casings on one card. The other six cards on the surface (`Spin`, `Increase Bet`, `Decrease Bet`, `Autoplay`, `Menu`, `Max Bet`) never restate their own name, so the two that do are outliers rather than a convention. The social variant repeats the pattern (`prose.ts:204`).
- Where fixable: frontend/src/lib/i18n/prose.ts:129 and :135, plus the fifteen translated siblings each and the social variant at :204 (not locked)
- Proposed fix: drop the restatement rather than re-case it: `Open the menu to pick a bet mode or buy the feature.` This avoids a sixteen-locale casing decision and shortens both strings.

## STT-DESKTOP-B-08 LOW The meter plate's label carries no fit protection while the value directly beneath it does

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/038_desktop_transition_feature_entry_fade.png, 039_desktop_feature_entry_card.png, 040 through 046, 051_desktop_transition_maxwin_collect_fade.png, 052_desktop_post_collect_base.png (all under the same directory)
- Claim: `.plate-value` is explicitly protected: `max-width: 230px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis`, with a comment recording why (`frontend/src/lib/components/BonusInstrumentColumn.svelte:202-215`). `.plate-label` directly above it has `font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase` and **no width, wrap or overflow rule at all** (`:195-201`). On the English frames `OVERDRIVE FREE SPINS` already fills the plate to within a few pixels of both edges, so the longest label in the component is sitting at the limit with nothing to catch it. My frames are en only, so I claim tightness rather than failure; the de and ar squads hold the frames that would show it break.
- Where fixable: frontend/src/lib/components/BonusInstrumentColumn.svelte:195-201 (not locked)
- Proposed fix: give `.plate-label` the same `max-width` and one deliberate behaviour (either two-line wrap with a reserved second line, or a small tracking reduction), so the label and the value fail the same way instead of one failing silently.

## Refuted by source, recorded rather than deleted

These four were written into my step 2 shard from the frames and are **withdrawn** after step 3. Each is recorded with what killed it, so no later squad re-derives it from the same frames.

- **"The buy dialog buttons and the autoplay labels are a system font leaking through."** WRONG. `frontend/src/app.css:97-99` sets `--fs-font-display: 'Orbitron', system-ui, sans-serif` and applies it at the root, Orbitron is self-hosted at `frontend/src/main.ts:2-4` (weights 400, 700, 900), `button` inherits it via `app.css:152`, and `BuyBonus.svelte:248` names the token explicitly. Everything on my frames is Orbitron. What I read as a family change is the weight, tracking, case and size divergence now written up as STT-DESKTOP-B-02 and STT-DESKTOP-B-04.
- **"The max win overlay writes the multiplier with an ASCII `x`, so it is fresh KNOWN(MID-02) evidence."** WRONG, and this one matters most. `frontend/src/lib/components/MaxWinCelebration.svelte:155` is `<span class="c1-max-x">×</span>`, U+00D7, and the comment at `:151-154` records that this surface was changed to the multiplication sign under Q-12. **I withdraw the KNOWN(MID-02) match on frames 049 and 050.** MID-02's own text says the max-win frames carry its surface; on the desktop session's max-win frames they do not, and the marshal should not extend MID-02's 60-frame count on my evidence without re-checking which component the other sessions render.
- **"The HUD `MULTIPLIER` pod writes `1x` with a letter."** WRONG. `frontend/src/lib/components/BonusInstrumentColumn.svelte:105` is `{multiplier}×`, U+00D7 at `font-size: 30px`. It reads as a small baseline `x` at that size, which is a rendering impression, not a glyph defect.
- **"The 5,000x cap is written three ways across three surfaces and that is drift."** WRONG. `frontend/src/lib/config/fsModes.ts:141-155` is an explicit OWNER AUDIT ROUND 4 ruling that the qualified form (`5,000× base bet`) is used only where the cap sits beside a cost multiplier, and that the bare form is *deliberately* kept on the in-feature element and the paytable's general row, with the reason stated (a bare `5,000x` beside a 400x price invites `5,000x the 400x I just paid`). `FS_MAX_WIN_LABEL = '5,000×'` at `:139` carries U+00D7 into all three surfaces, so the mark does not drift either. A recorded ruling, followed correctly.

## Explicit absences, signed

Each was checked across all 26 frames and yields nothing, and I am signing that.

- **No em dash and no en dash in any player-visible string.** Every dash on my frames is a hyphen inside a compound (`Double-chance`, `pre-revved`, frames 032, 033, 036, 037); the list and stat separators are middots (`All modes · RTP 96.35%` and `1.25× per spin while ON · $1.25` on 033, `100× · $100.00` on 032 and 033).
- **No mixed straight and curly quotation marks.** No apostrophe and no quotation mark of any kind appears in any player-visible string on any of my 26 frames, including the full disclaimer paragraph on 028 and 029 and the three-paragraph `WHAT YOU GET` block on 034 to 037. The class cannot be violated where the character never occurs, and across these 26 frames it never occurs.
- **No double space found.** Checked the prose blocks on 027, 028, 029 and 034 to 037 gap by gap at full render size; the centred setting of the disclaimer would show an inserted space as a widened gap and none is present.
- **Currency and decimal format is uniform.** Every money figure on my 26 frames is `$`, comma thousands separator, exactly two decimals: `$50,000.00`, `$5,000.00`, `$400.00`, `$363.89`, `$321.70`, `$100.00`, `$16.20`, `$10.80`, `$10.00`, `$2.80`, `$1.25`, `$1.00`, `$0.80`, `$0.20`, `$0.00`. No figure disagrees with another on any screen it shares. The percentages agree too: `96.35%` on 028, 029, 032, 033 and 034 to 037, always two decimals.
- **No numeral-width shimmy claimable from this shard, in either direction.** My range contains no count-up on any surface. The only repeated numeric readouts across consecutive frames are static: `MULTIPLIER 1×` and `OVERDRIVE FREE SPINS 16` and `TOTAL WIN $10.80` hold unchanged across 038 to 046, and the WIN pod changes only between two settled spins (`$321.70` on 047, `$363.89` on 048), which is a value change and not an animation. I can neither confirm nor deny shimmy on a non-`.fs-num` surface and I am saying so rather than implying I cleared it.
- **No money pod clipping, ellipsis or overflow observed, so no fresh TR-115 / TR-086 evidence from this shard.** `$50,000.00` in the BALANCE pod, the widest money string in the session, sits inside its container with clearance on 030, 031, 038 to 048, 051 and 052; `$5,000.00` in the WIN pod on 051 and 052 likewise; `$400.00` in the PRICE cell on 036 and 037 likewise. Noted for the class rather than as evidence: the mechanism that would produce the failure is present and commented at `frontend/src/lib/components/BonusInstrumentColumn.svelte:210-215`, where `.plate-value` clips with an ellipsis because *large-win totals (up to the 5,000x wincap) can outgrow the plate at the nominal 30px size*. My frames never reach a total large enough to trigger it.
- **The paytable stat pods fit.** `RTP (ALL 5 MODES)` `96.35%` and `MAX WIN` `5,000×` on 028 and 029 both sit inside their pods with clearance.
- **Not re-reported, per STV's deliberate absences.** The mixed casing of the mode names (`Normal`, `Cruise` beside `OVERBOOST`, `NITRO OVERDRIVE`, frames 032, 033, 036, 037) and the `H1` / `M3` / `L2` symbol ids in the win ticker (frames 030, 031, 048, 052) were both seen and both left alone as specified.
- **Checked and NOT reported:** `OVERDRIVE FREE SPINS` in capitals on the entry card and the meter plate against `Overdrive Free Spins` in title case in the buy dialog prose. Every plate and pod label in the game is capitals (`BALANCE`, `WIN`, `BET`, `TOTAL WIN`, `MULTIPLIER`, `PRICE`, `RTP`, `MAX WIN`), applied through `text-transform: uppercase` on the label class (`BonusInstrumentColumn.svelte:200`), and a celebration headline in capitals is the same convention. This is a display convention, not casing drift, and it is not the Q-34 shape.
- **Out of my lens, recorded so it is not lost.** Frames 041 to 046, which the manifest describes as `Overdrive free spins in flight, interval frame 1 of 6` through `6 of 6`, all show the unchanged entry card overlay with `TAP TO CONTINUE` still on it, so the six interval frames captured no in-flight feature. Frame 052, described as `Back to base after collect, balance settled`, shows a fresh feature entry card reading `+8 FREE SPINS`. `BALANCE` reads `$50,000.00` on every one of my 26 frames that shows it, including after a `$5,000.00` win on 051 and 052. Frame 033, described as `FEATURES menu, all five modes and their prices`, shows four modes, with the `Buy Overdrive` card cut by the panel's scroll edge and NITRO OVERDRIVE below the fold. Frame 029 is pixel-identical to 028, both showing the paytable clamped at its scroll bottom. I make no typography claim on any of these.

## KNOWN matches

- KNOWN(Q-26): /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/032_desktop_transition_features_menu_opening.png and 033_desktop_features_menu.png show `about 1.6x the feature trigger rate. Debits 1.25x every spin while ON.` two lines above that same card's own `1.25× per spin while ON · $1.25` set with U+00D7; 036_desktop_transition_dialog_nitro_overdrive_opening.png and 037_desktop_dialog_nitro_overdrive.png show `pre-revved to 5x.` inside the same text box as `1×, 3× or 10× total bet` set with U+00D7. Two glyph forms inside one card and inside one text box, four fresh frames.
- KNOWN(Q-27): /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/034 to 037, the four buy dialog frames. KNOWN_OPEN records Q-27 as *visible only if any link or unstyled surface reaches a frame*. It does: `.buy-cancel, .buy-confirm` sets no `font-size`, so the Vite scaffold `button` block at `frontend/src/app.css:145-158` is live on the purchase dialog. Q-27 is no longer only latent, and these four frames are the evidence.
- KNOWN(STV-01): `1 ways` on 030, 038, 039, 040, 044, 045, 046, 048 and 052. Nine further frames beyond STV's two, so the singular case is far more common in ordinary play than that shard could show.
- KNOWN(STV-12): ticker prefix `x4` on 030, `x5` on 031 and 038 to 046 and 048, `x3` on 052, against the paytable's suffix `3×` form. Thirteen fresh frames.
- KNOWN(STV-04): `TAP TO CONTINUE` on 038, 039, 040, 041, 042, 043, 044, 045, 046 and 052; `PRESS COLLECT OR HIT ENTER TO CONTINUE` on 049 and 050. The mobile verb is on screen for the whole feature entry and the whole feature run.
- KNOWN(STV-11): `3, 4 or 5 Scatters award 8, 12 or 16 free spins` on 034, 035, 036 and 037, the title-case member of STV-11's three spellings of one symbol.
- KNOWN(Q-07): the infinity glyph at the foot of the autoplay spin list on 031, allowlisted, not a finding.
- KNOWN(Q-16 park), parked hardcoded English confirmed visible on my frames: `Stop on win`, `Single win limit`, `Stop on feature`, `Loss limit` and `SPINS` on 031; `PRESS COLLECT OR HIT ENTER TO CONTINUE` on 049 and 050; the paytable section headers `INTERFACE GUIDE` on 027 and `RESPONSIBLE PLAY` and `DISCLAIMER` on 028 and 029.
- KNOWN(MID-02): **withdrawn for my frames.** See "Refuted by source" above. No MID-01 match either: my range contains no big-win count-up, and the WIN against TOTAL WIN divergence on 051 and 052 is a different pair of readouts from the one MID-01 names.

tree_after: `git status --porcelain` at the end of my run, verbatim

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

**SAYING THIS LOUDLY, AS INSTRUCTED. A COMMITTED EVIDENCE FRAME IS MODIFIED IN THE WORKING TREE:**

```
 M reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png
```

**This is not mine.** My assigned range is the desktop session, frames 027 to 052, and I opened those 26 PNGs with a read tool and wrote exactly one file, `reports/qa/stream_test/shards/STT-DESKTOP-B.md`. Frame 188 is a `popout-s` frame and I never touched it.

**It is the failure convention (h.1) exists to prevent** (SA-012, CI triage session, 2026-07-26): *evidence that a casual re-run can overwrite is not evidence*, and the recorded precedent is a proof script that screenshotted straight into a committed evidence directory and silently modified four committed PNGs. The audit's whole instrument is this capture set, and a frame in it has changed under the audit. **Nothing downstream should treat frame 188 as the build-`d9bdf22` capture until it is restored from HEAD and the writer is identified.** A squad holding that frame may have judged the modified file rather than the captured one.

The marshal should, before consolidating: restore it with `git checkout -- reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png`, diff the restored file against the modified one to see whether the pixels actually changed or only the mtime, and find which agent or script wrote it. No shard should be trusted on frame 188 until that is answered.

Nothing shows as DELETED. Every other entry is untracked, all of them shards under the expected `reports/qa/stream_test/shards/` path, sixteen of which are other squads' and not mine.
