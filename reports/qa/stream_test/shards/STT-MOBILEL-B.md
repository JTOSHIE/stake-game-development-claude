# STT-MOBILEL-B, typography (mobile-l, 425x812, en, frames 234 to 259)

scope: every `mobile-l` frame numbered 234 to 259 inclusive, 26 frames, covering paytable
sections 07 to 09, the paytable close, the autoplay menu, the FEATURES menu and its
opening transition, both buy confirm dialogs and their opening transitions, the feature
entry card, the six feature-run interval frames, the feature exit, post-feature base, the
max win overlay and its two transitions, and post-collect base.
frames_read: 26

Frame paths below are relative to `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/`.
Source paths are relative to `/Users/jt/math-sdk/frontend/src/`.

## STT-MOBILEL-B-01 HIGH The win-line readout never singularises, and prints `1 ways`

- Frames: `245_mobile-l_transition_feature_entry_fade.png`, `246_mobile-l_feature_entry_card.png`, `250_mobile-l_feature_run_3.png`, `251_mobile-l_feature_run_4.png`, `252_mobile-l_feature_run_5.png`, `255_mobile-l_post_feature_base.png`, `259_mobile-l_post_collect_base.png`
- Claim: the strip under the reels reads `L2  x5  1 ways  $0.60` in frames `245`, `246`, `250`, `251`, `252` and `255`, and `M3  x3  1 ways  $0.20` in frame `259`. The same strip reads `8 ways` in `237_mobile-l_transition_paytable_closing.png` and `5 ways` in `247_mobile-l_transition_feature_starting.png`, so the word is pluralised unconditionally rather than by count. The source is `lib/components/WinBreakdown.svelte:94`, ``` <span class="wb-ways">{current.ways} ways</span> ```: the plural is baked into the literal. `1 ways` is the plainest machine-generated tell in the whole frame set and it is on the reels, not buried in a menu.
- Note for the marshal, recorded here rather than as its own row so it is not lost: that literal ` ways` is also hardcoded English, sitting two lines below the same file's own comment at `lib/components/WinBreakdown.svelte:10-14` explaining that WILD and SCATTER were moved out of exactly this component into the `tr` layer because they were invisible to the locale gate. The pass that moved them left ` ways` behind in the same element group, and `KNOWN_OPEN.md:30-32` records that a literal beside an interpolation is precisely what `locale_completeness_check.mjs` cannot see. It is not enumerated in the `Q-16 park` list. It will render English on the German and Arabic frames, so it belongs to the de and ar squads to confirm; only the pluralisation is claimed here.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:94` (not locked)
- Proposed fix: route the count through the `tr` layer with a singular and plural key, or at minimum `{current.ways === 1 ? 'way' : 'ways'}` at that line.

## STT-MOBILEL-B-02 HIGH Internal symbol ids `L2` and `M3` render to the player in the same readout that names the scatter `SCATTER`

- Frames: `237_mobile-l_transition_paytable_closing.png`, `245_mobile-l_transition_feature_entry_fade.png`, `246_mobile-l_feature_entry_card.png`, `247_mobile-l_transition_feature_starting.png`, `248_mobile-l_feature_run_1.png`, `249_mobile-l_feature_run_2.png`, `250_mobile-l_feature_run_3.png`, `251_mobile-l_feature_run_4.png`, `252_mobile-l_feature_run_5.png`, `253_mobile-l_feature_run_6.png`, `254_mobile-l_transition_feature_exit.png`, `255_mobile-l_post_feature_base.png`, `259_mobile-l_post_collect_base.png`
- Claim: the readout names the winning symbol `M3` in frames `237` and `259`, `L2` in frames `245`, `246`, `250`, `251`, `252` and `255`, and `SCATTER` in frames `247`, `248`, `249`, `253` and `254`. One component, two registers: a real display name for one symbol and the raw maths-package identifier for the other eight. `lib/components/WinBreakdown.svelte:15-18` is the mechanism, a map whose every value is its own key: ``` H1: 'H1', H2: 'H2', M1: 'M1', M2: 'M2', M3: 'M3', L1: 'L1', L2: 'L2', L3: 'L3' ```, while `:21-22` returns a translated word for `W` and `S` alone. The map is therefore a no-op that exists only to make the identity pass-through look deliberate. `M3` and `L2` are internal tier ids the player has never been given a key for, and they appear on the reels for the whole win presentation.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:15-24` and `:92` (not locked)
- Proposed fix: fill `SYMBOL_IDS` with the display names the paytable already shows for those eight symbols, so `SCATTER` stops being the only symbol in the game with a name.

## STT-MOBILEL-B-03 HIGH The max win overlay tells a 425px touch player to `HIT ENTER`, while the feature overlay in the same session says `TAP TO CONTINUE`

- Frames: `256_mobile-l_transition_maxwin_overlay_fade.png`, `257_mobile-l_maxwin_celebration.png`; contrasted with `245_mobile-l_transition_feature_entry_fade.png`, `246_mobile-l_feature_entry_card.png`, `259_mobile-l_post_collect_base.png`
- Claim: frame `257` renders `PRESS COLLECT OR HIT ENTER TO CONTINUE` beneath the `COLLECT` button on a viewport of `425x812`, which is a phone. The feature entry overlay in the same session, frames `246` and `259`, renders `TAP TO CONTINUE`. Two continue-gates, one session, one device, contradictory input idioms, and one of them names a key the device does not have. The string is `lib/i18n/prose.ts:83`, ``` maxWinHint: 'Press COLLECT or hit Enter to continue' ```, with no viewport or pointer branch anywhere near it. Note the casing as well: the string data is mixed case and it reaches the screen in full capitals, so `COLLECT` and `Enter` are typeset identically to the words around them despite being capitalised in the source for emphasis that the render then discards.
- Note for the marshal: `KNOWN_OPEN.md:19` lists this exact string under the `Q-16 park`, but that row is about it being hardcoded English. This finding is a different defect in the same string: it is wrong for the device in English, and it disagrees with its own sibling overlay. It should not be folded into the park.
- Where fixable: `frontend/src/lib/i18n/prose.ts:83` for the wording, and `frontend/src/lib/components/MaxWinCelebration.svelte:166` where it is rendered (neither locked)
- Proposed fix: branch the hint on pointer capability, or use a device-neutral `COLLECT TO CONTINUE` on both surfaces, which also drops a key name out of sixteen locales.

## STT-MOBILEL-B-04 HIGH The two stacked HUD pod rows set their labels and values in different sizes, weights and tracking

- Frames: `245_mobile-l_transition_feature_entry_fade.png`, `246_mobile-l_feature_entry_card.png`, `247_mobile-l_transition_feature_starting.png`, `248_mobile-l_feature_run_1.png`, `249_mobile-l_feature_run_2.png`, `250_mobile-l_feature_run_3.png`, `251_mobile-l_feature_run_4.png`, `252_mobile-l_feature_run_5.png`, `253_mobile-l_feature_run_6.png`, `258_mobile-l_transition_maxwin_collect_fade.png`, `259_mobile-l_post_collect_base.png`
- Claim: during the feature, two rows of pods sit directly on top of each other and read as one component in two typographies. The upper row, `OVERDRIVE FREE SPINS` and `TOTAL WIN`, is `lib/components/BonusInstrumentColumn.svelte:247-251`: `font-size: 11px`, `font-weight: 700`, `letter-spacing: 0.08em`. The lower row, `BALANCE`, `WIN` and `BET`, is `lib/components/HudOverlay.svelte:1326-1328`: `font-size:.52rem` (**8.32px** at the 16px root), `font-weight:700`, `letter-spacing:.18em`. That is **11px against 8.32px** and **0.08em against 0.18em**, a factor of **2.25** in tracking, on two label rows separated by about eight pixels of gap. The values disagree too: `.pm-value` is `font-size: 15px; font-weight: 800` (`BonusInstrumentColumn.svelte:260-264`) against `.fs-value` at `calc(1.02rem * var(--autofit-scale, 1))`, so **16.32px**, `font-weight:700` (`HudOverlay.svelte:1330-1336`). With `font-synthesis: none` set at `app.css:104` and only Orbitron 400, 700 and 900 loaded (`main.ts:2-4`), the 800 request resolves to the 900 face while the 700 resolves to 700, so the two rows of figures are in genuinely different weights and not merely different declarations.
- Where fixable: `frontend/src/lib/components/BonusInstrumentColumn.svelte:247-264` and `frontend/src/lib/components/HudOverlay.svelte:1326-1336` (neither locked)
- Proposed fix: promote one pod-label and one pod-value rule to shared tokens and have both components consume them, rather than two components each declaring their own idea of the same chrome.

## STT-MOBILEL-B-05 MEDIUM The max win unit is set as `×BET` with no word space before the unit

- Frames: `256_mobile-l_transition_maxwin_overlay_fade.png`, `257_mobile-l_maxwin_celebration.png`
- Claim: frame `257` renders the cap as `5,000` in large gold digits, then the multiplication sign, then `BET`, with the sign butted against the `B` so the unit reads as one token. `lib/components/MaxWinCelebration.svelte:155` and `:159` put the three parts in three sibling spans with no space between them; `:295-300` makes the wrapper `display: flex` with `gap: 0.1em`, which both discards the whitespace text nodes in the markup and applies the identical **0.1em** separation between the figure and the sign as between the sign and the unit. At the label's 22px (`:316-318`) that is about **2px**, well under a word space, so `×` and `BET` read as `×BET`. `LEDGER.md:61` records the sibling celebration surface, the win banner, rendering `16x BET` with a space, so the two celebration surfaces space the identical construction differently as well as, per MID-02, glyphing it differently.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:295-300` (not locked)
- Proposed fix: raise the wrapper `gap` to about `0.35em`, or give `.c1-max-betlabel` its own `margin-left`, so the space falls between the sign and the unit rather than being shared equally with the figure.

## STT-MOBILEL-B-06 MEDIUM The win-line readout writes the count multiplier with a letter `x`, on a third file neither Q-26 nor MID-02 enumerates

- Frames: `237_mobile-l_transition_paytable_closing.png`, `245_mobile-l_transition_feature_entry_fade.png`, `247_mobile-l_transition_feature_starting.png`, `254_mobile-l_transition_feature_exit.png`, `259_mobile-l_post_collect_base.png`
- Claim: the readout reads `M3  x5  8 ways  $16.00` in frame `237`, `L2  x5  1 ways  $0.60` in frame `245`, `SCATTER  x5  5 ways  $10.00` in frames `247` and `254`, and `M3  x3  1 ways  $0.20` in frame `259`. The source is `lib/components/WinBreakdown.svelte:93`, ``` <span class="wb-count">x{current.kind}</span> ```, an ASCII `x` (U+0078), on a surface that sits about forty pixels from `1× bet` and `100× · $100.00` in the FEATURES menu (frame `240`), which use U+00D7. `KNOWN_OPEN.md:20` (`Q-26`) enumerates only `fsModes.ts`, and `LEDGER.md:63-73` (MID-02) adds only `WinBanner.svelte:205`, so this is a **third** file in a class that has now twice been declared enumerated. Same shape as MID-02's own point: the sweep list keeps being narrower than the class.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:93` (not locked)
- Proposed fix: change the literal to `×` (U+00D7, which Orbitron carries, per the comment at `MaxWinCelebration.svelte:151-154`), and widen `Q-26`'s enumeration to a tree-wide sweep rather than the file list it currently names.

## STT-MOBILEL-B-07 MEDIUM `scatters` and `Scatters`, one tap apart, from two different string files

- Frames: `240_mobile-l_features_menu.png`, `241_mobile-l_transition_dialog_buy_overdrive_opening.png`, `242_mobile-l_dialog_buy_overdrive.png`, `243_mobile-l_transition_dialog_nitro_overdrive_opening.png`, `244_mobile-l_dialog_nitro_overdrive.png`
- Claim: frame `240` reads `Standard play. Overdrive Free Spins trigger on 3+ scatters.` with a lowercase `scatters`; the source is `lib/i18n/prose.ts:86`. Frame `242`, one tap away from that card, reads `3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1×, 3× or 10× total bet.` with a capital `Scatters`; the source is `lib/i18n/translations.ts:1540`. Two files, two casings of the game's own symbol name, both on the buy path. The same sentence in `242` also carries `free spins` lowercase one line under `Overdrive Free Spins entry.`, so the feature's own name is capitalised and decapitalised inside one panel.
- Where fixable: `frontend/src/lib/i18n/prose.ts:86` and `frontend/src/lib/i18n/translations.ts:1540` (neither locked)
- Proposed fix: settle one rule (proper noun `Free Spins` for the feature, lowercase `scatters` for the symbol count) and sweep both string files together; note that a fix in one file only reproduces the split.

## STT-MOBILEL-B-08 MEDIUM The two buy tiers are named in two different cases, in adjacent lines of one string block

- Frames: `241_mobile-l_transition_dialog_buy_overdrive_opening.png`, `242_mobile-l_dialog_buy_overdrive.png`, `243_mobile-l_transition_dialog_nitro_overdrive_opening.png`, `244_mobile-l_dialog_nitro_overdrive.png`, `239_mobile-l_transition_features_menu_opening.png`, `240_mobile-l_features_menu.png`
- Claim: one component, the buy confirm dialog, titles itself `Buy Overdrive` in Title Case in frame `242` and `NITRO OVERDRIVE` in wide-tracked capitals in frame `244`. These are the game's two buy tiers and they are the two the player chooses between. The case sits in the string data, in four lines of one block: `lib/i18n/prose.ts:85` `'Normal'`, `:87` `'Cruise'`, `:91` `'Buy Overdrive'`, `:93` `'NITRO OVERDRIVE'`. Frame `240` shows all of it at once, with `Normal`, `Cruise`, `OVERBOOST` and `Buy Overdrive` as mode titles on one scroll view.
- Counter-evidence, recorded because it changes the disposition and I found it after the frames: `lib/components/HudOverlay.svelte:1360-1361` states, in a comment dated 2026-07-28 under TR-092, that *OVERBOOST and NITRO OVERDRIVE are unaffected: they are already capitals in the specification*. So the split is a recorded decision, not an oversight, and this is an art call for the owner rather than a defect to sweep. Reported at MEDIUM on that basis rather than HIGH.
- Where fixable: `frontend/src/lib/i18n/prose.ts:85-93` (not locked)
- Proposed fix: PARK(the direction is an art call the same size as Q-34's). Two options: treat all five mode names as brand names in capitals, which makes the badge, the card and the dialog agree everywhere; or keep the capitals for the two performance tiers only and accept that the two buy tiers are typeset differently from each other, which is what ships today and is what frames `242` and `244` show.

## STT-MOBILEL-B-09 MEDIUM The FEATURES header bet row overflows and drops the `+` control onto its own line

- Frames: `239_mobile-l_transition_features_menu_opening.png`, `240_mobile-l_features_menu.png`
- Claim: the header row of the FEATURES panel reads `SPIN COST $1.00`, `BET`, the `-` button, `$1.00`, and then wraps, leaving the `+` button alone on a second line at the far left of the panel, directly under `SPIN COST`. It is in the settled frame `240`, not only in the transition, so it is not a mid-animation artefact. The two halves of one stepper end up at opposite corners of the box, with the `-` at the top right and the `+` at the bottom left.
- Recorded here because it is on my frames; it is a layout wrap rather than a pure typography defect, so the marshal should expect a duplicate row from the layout lens and keep whichever is better evidenced.
- Where fixable: UNKNOWN (not located; the source budget went to the eight findings above)
- Proposed fix: let the `SPIN COST` cluster shrink, or give the stepper its own full-width row below the label at narrow widths.

## STT-MOBILEL-B-10 LOW The paytable interface guide writes `Features` and `FEATURES` inside one card

- Frames: `234_mobile-l_paytable_07_interface_guide.png`, `237_mobile-l_transition_paytable_closing.png`, `254_mobile-l_transition_feature_exit.png`, `255_mobile-l_post_feature_base.png`
- Claim: the card in frame `234` titles the row `Features` and then describes it as `Open the FEATURES menu to pick a bet mode or buy the feature.` two lines below, so one word appears in two casings inside one card. The strings are adjacent: `lib/i18n/prose.ts:128` `guideFeaturesName: 'Features'` and `:129` `guideFeaturesDesc: 'Open the FEATURES menu to pick a bet mode or buy the feature.'`. The control itself is labelled `FEATURES` on the HUD in frames `237`, `254` and `255`, so the body copy matches the control and the title does not. Defensible as a deliberate "name the on-screen control in capitals" convention, which is why it is LOW, except that the neighbouring rows do not follow it: `guideAutoplayName: 'Autoplay'` at `:130` and `guideMenuName: 'Menu'` at `:132` are described at `:131` and `:133` without capitalising their own names.
- Where fixable: `frontend/src/lib/i18n/prose.ts:128-133` (not locked)
- Proposed fix: title the row `FEATURES` to match the control it documents, or drop the capitals in the body copy, and apply whichever is chosen to all seven guide rows.

## STT-MOBILEL-B-11 LOW The `MAX WIN` cell of the buy dialog stat row wraps to two lines and loses baseline alignment with `PRICE` and `RTP`

- Frames: `241_mobile-l_transition_dialog_buy_overdrive_opening.png`, `242_mobile-l_dialog_buy_overdrive.png`, `243_mobile-l_transition_dialog_nitro_overdrive_opening.png`, `244_mobile-l_dialog_nitro_overdrive.png`
- Claim: the three-cell stat row renders `PRICE $100.00`, `RTP 96.35%` and `MAX WIN 5,000× base bet`, and only the third value wraps, to `5,000×` over `base bet`. The two-line value makes that cell taller than its neighbours, so the three values no longer share a baseline and the divider rules run past the two single-line cells. Identical in the 400x dialog, frames `243` and `244`, where the price reads `$400.00`.
- Where fixable: UNKNOWN (not located; the source budget went to the eight findings above)
- Proposed fix: set the third value on one line at a smaller size, or move the unit into the label as `MAX WIN (BASE BET)` so all three cells carry a single-line value.

## Explicit absences, signed

- **WITHDRAWN, and recorded rather than deleted: there is no font-family divergence anywhere in this build, so my first reading of frame `238` was wrong.** From the render alone I judged the autoplay option labels `Stop on win`, `Single win limit`, `Stop on feature` and `Loss limit` to be set in a face other than the brand one, and wrote it into the first version of this shard as a candidate needing CSS confirmation. The source refutes it. `grep -rn "font-family" frontend/src` returns **nothing** that is not one of two tokens or `inherit`; both tokens begin with Orbitron (`app.css:97` `--fs-font-display: 'Orbitron', system-ui, sans-serif` and `:98` `--fs-font-numeric: 'Orbitron', 'Courier New', monospace`); `:99` sets the display token on `:root` so everything inherits it; and `main.ts:2-4` self-hosts Orbitron 400, 700 and 900 and nothing else. `.auto-menu-toggle` at `HudOverlay.svelte:1800-1812` declares no family and therefore inherits Orbitron like every other label. What misled me is that the labels are the only lowercase sentence-case run at that size in the interface, and Orbitron's lowercase reads much less like the brand than its capitals do. **No system font leakage, no fallback glyph in another family, and no brand face substitution, in any of the 26 frames.**
- **No STREAM-severity typography defect in this frame set.** I looked for one specifically. The celebration surfaces (`256`, `257`), the feature entry card (`245`, `246`) and the persistent HUD all carry brand-face type at the sizes an audience actually reads. The two nearest misses are `PRESS COLLECT OR HIT ENTER TO CONTINUE` on frame `257`, which is legible but low-contrast and small, and `1 ways` on frame `245`, which is about seven pixels tall. Neither would stop a viewer who was not looking for it.
- **No ellipsised or truncated string, money or otherwise, in any of the 26 frames.** Checked every label and value in `234` to `259`, including the long ones: `OVERDRIVE FREE SPINS` (pod label, `245`), `PRESS COLLECT OR HIT ENTER TO CONTINUE` (`257`), `Open the FEATURES menu to pick a bet mode or buy the feature.` (`234`) and the full disclaimer paragraph (`235`, `236`). Nothing carries an ellipsis and nothing is cut mid-glyph by a container edge. The two cases that look like truncation are not: the `Turbo` card at the foot of frame `234` is cut by the paytable scroll viewport, which is a scroll position, and the `Buy Overdrive` and `MAX WIN` values wrap rather than clip.
- **No money-pod fit failure, so nothing to add to KNOWN(TR-115 / TR-086) from this shard.** At `425x812` every money surface fits its pod: `$50,000.00` in BALANCE across `237`, `245` to `255`, `258` and `259`; `$5,000.00` in WIN on `258` and `259`; `$363.89` on `255`; `$318.64` on `254`; `$100.00` and `$400.00` in the dialog price cells on `242` and `244`. The widest string in the set, `$50,000.00`, clears its pod on every frame that carries it.
- **No mixed straight and curly quotation marks, and no apostrophes at all.** There is no quoted text and no possessive or contraction anywhere in the 26 frames. The closest characters are the colon in `Double-chance:` (`240`) and the question mark in `Start Overdrive Free Spins now at 100× your bet?` (`242`). The category is empty because these surfaces carry none of the characters, not because they were not looked for.
- **No em dash and no en dash in player-visible prose in this set.** Checked the two long prose surfaces where one would live, the responsible play and disclaimer block (`235`, `236`) and the mode blurbs (`240`), plus both dialogs' copy (`242`, `244`). Every dash rendered is a hyphen inside a compound: `Double-chance`, `pre-revved`. The clause separator in use is the middle dot, `All modes · RTP 96.35%` and `100× · $100.00` on frame `240`, not a dash.
- **No double space claimed, and the category is signed rather than reported.** The only candidate is the win-line readout, whose tokens `M3`, `x5`, `8 ways` and `$16.00` are widely separated on frame `237`. A render cannot distinguish a literal double space from a flex gap or padding, and `WinBreakdown.svelte:92-94` shows them as three sibling spans, so the separation is layout and not a character. Checked and found not to be a double space.
- **No currency or decimal format disagreement on any single screen.** Every money figure across the 26 frames is `$` then a comma-grouped integer part then exactly two decimals: `$50,000.00`, `$5,000.00`, `$363.89`, `$318.64`, `$16.20`, `$16.00`, `$10.80`, `$10.00`, `$2.80`, `$1.25`, `$1.00`, `$0.60`, `$0.20`, `$0.00`, `$100.00`, `$400.00`. No figure drops its cents, no figure carries three decimals, and no figure uses a different grouping separator. The percentages agree with each other as well: `96.35%` on frames `235`, `236`, `240`, `242` and `244`.
- **No count-up digit shimmy on a non-`.fs-num` surface observable in this range, and the TR-089 carve-out never had to be applied.** The frames that would show it are not mine: my six feature-run interval frames (`248` to `253`) all sit on a settled `TOTAL WIN $10.80`, and no two consecutive frames in `234` to `259` capture one figure mid-animation at two values. The one width-stability check available, `$50,000.00` in the BALANCE pod, holds identical glyph positions across `237`, `245`, `246`, `248` to `255`, `258` and `259`. Recorded so the marshal does not read this as "checked and clean": the mechanism for a shimmy is present in source (`app.css:85-89` records that Orbitron ships no OpenType features, so the `font-variant-numeric: tabular-nums` on `HudOverlay.svelte:1335` and `BonusInstrumentColumn.svelte:265` is inert while Orbitron is loaded, and only the `.fs-num` per-digit boxes actually hold width), but **these frames do not evidence it** and I am not claiming from source what the frames do not show. The big-win count-up frames of this session are `220` to `222` and belong to another squad.
- **KNOWN(Q-07), seen and correctly not reported.** The infinity glyph `∞` on the autoplay spin-count list, frame `238_mobile-l_autoplay_menu.png`, renders in a different face from the numerals `10`, `25`, `50` and `100` above it. `KNOWN_OPEN.md:24` records this as reviewed, kept and allowlisted, so it is not a finding and is not counted as one.
- **No KNOWN(TR-104) instance available on these frames.** This session is `lang: en` per `MANIFEST.json`, so the German and Arabic banner leak that row describes cannot appear here, and no win banner appears in `234` to `259` at all.
- **No KNOWN(MID-01) and no KNOWN(MID-02) instance.** Both live on the big-win banner and the HUD WIN pod during the banner count-up, frames `220` to `222` of this session, outside my range. Neither surface appears in `234` to `259`: the max win overlay on `256` and `257` is `MaxWinCelebration`, a different component, whose multiplication sign is a correct U+00D7 at `MaxWinCelebration.svelte:155`. Its spacing defect is reported separately as `STT-MOBILEL-B-05` and deliberately not folded into MID-02.
- **Two capture oddities checked and not reported as typography, because they are not.** `235_mobile-l_paytable_08_responsible_play.png` and `236_mobile-l_paytable_09_disclaimer.png` show the identical scroll position despite the manifest naming two different sections, and `248` through `253`, the six feature-run intervals, all still show the undismissed `TAP TO CONTINUE` entry card rather than spins in flight. Those belong to whoever holds the capture-fidelity lens.

## KNOWN matches

- KNOWN(Q-26): `240_mobile-l_features_menu.png` and `239_mobile-l_transition_features_menu_opening.png`. The OVERBOOST card carries `Double-chance: about 1.6x the feature trigger rate. Debits 1.25x every spin while ON.` and `1.25x per spin while ON · $1.25` with a letter `x`, in the same card as `1.25× bet` with the sign, and two cards from `100× · $100.00`.
- KNOWN(Q-26): `243_mobile-l_transition_dialog_nitro_overdrive_opening.png` and `244_mobile-l_dialog_nitro_overdrive.png`. `Buy a rich entry with the Overdrive meter pre-revved to 5x.` sits three lines above `and pay an instant 1×, 3× or 10× total bet.` and one line below `Start Overdrive Free Spins now at 400× your bet?`, so the letter and the sign appear four times in one panel.
- **Correction to Q-26's own text, offered with the evidence.** `KNOWN_OPEN.md:20` locates these strings in `fsModes.ts`. They are not there. They are at `frontend/src/lib/i18n/prose.ts:90` (`modeOverboostBlurb`) and `:94` (`modeSuperBlurb`), and the row's count is short as well as its path: the **social** branch carries its own copies at `prose.ts:189` (`Costs 1.25x every spin while ON`) and `:192` (`Get a rich entry with the Overdrive meter pre-revved to 5x`), which the real-money frames of this session do not show but which are the same defect on the other branch. Anyone fixing Q-26 from its written path will find nothing there.
- KNOWN(Q-34), the card side only: `240_mobile-l_features_menu.png` shows the mode card titled `Cruise` in Title Case. The `CRUISE` HUD badge is not in this frame range. Noted for the marshal: `HudOverlay.svelte:1354-1361` records the badge's `text-transform: uppercase` being **removed** on 2026-07-28 under TR-092 for exactly this reason, so this row may already be closed at HEAD `d9bdf22` and my frame evidences only the half that was always correct.
- KNOWN(Q-07): `238_mobile-l_autoplay_menu.png`, the `∞` option renders in a fallback face. Allowlisted, listed as evidence only.

tree_after:

`git status --porcelain`, verbatim, at the close of this run. Every line is `??`,
untracked. **Nothing shows as modified and nothing shows as deleted.** One line is my
shard; the other 32 are other squads' shards, which are not mine and not my problem.

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
?? reports/qa/stream_test/shards/STT-POPOUTL-A.md
?? reports/qa/stream_test/shards/STT-POPOUTL-B.md
?? reports/qa/stream_test/shards/STT-POPOUTS-A.md
?? reports/qa/stream_test/shards/STT-POPOUTS-B.md
?? reports/qa/stream_test/shards/STV-REST.md
```
