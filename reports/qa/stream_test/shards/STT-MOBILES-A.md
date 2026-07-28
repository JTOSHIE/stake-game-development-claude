# STT-MOBILES-A, typography (mobile-s, frames 312 to 337)
scope: every `mobile-s` frame numbered 312 to 337 inclusive, viewport 320x568, lang en, per `reports/screens/stream-test-2026-07-28/MANIFEST.json`. 26 frames, all opened.
frames_read: 26

## STT-MOBILES-A-01 HIGH The paytable pluralises an all-caps word with a lower-case `s`: `SCATTERs`

- Frames: `reports/screens/stream-test-2026-07-28/335_mobile-s_paytable_04_rules.png`
- Claim: the rules bullet renders `3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.` The trailing `s` is lower case and sits at x height against seven capitals, and it is visible at 1:1 in the frame. Nothing in the component transforms case (`.fs-rules li` at `frontend/src/lib/components/PaytableModal.svelte:668` sets no `text-transform`), so the string is rendered exactly as authored. A plural formed by bolting a lower-case letter onto an all-caps word is the machine-generated tell the standing mandate names, on the surface a reviewer opens first.
- Where fixable: `frontend/src/lib/i18n/prose.ts:112` (real money) and `frontend/src/lib/i18n/prose.ts:195` (social), both reading `'3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.'` / `'...total play prize.'`. English only: `grep -rn "SCATTERs" frontend/src/lib/i18n/` returns exactly these two lines, so no localised value carries it.
- Proposed fix: `SCATTERs` to `SCATTERS` in both lines, taken together with A-02 so the whole surface lands on one name.

## STT-MOBILES-A-02 HIGH One symbol is named five different ways inside a single paytable modal

- Frames: `reports/screens/stream-test-2026-07-28/333_mobile-s_paytable_02_ways_to_win.png`, `reports/screens/stream-test-2026-07-28/334_mobile-s_paytable_03_symbol_payouts.png`, `reports/screens/stream-test-2026-07-28/335_mobile-s_paytable_04_rules.png`, `reports/screens/stream-test-2026-07-28/336_mobile-s_paytable_05_overdrive_free_spins.png`, `reports/screens/stream-test-2026-07-28/337_mobile-s_paytable_06_bet_modes.png`, plus `reports/screens/stream-test-2026-07-28/315_mobile-s_intro_rules.png`.
- Claim: a viewer scrolling one modal passes five spellings of the scatter symbol, in this order.
  - `SCAT`, the symbol card title (frames 333, 334). Not clipped and not ellipsised: the glyphs end cleanly inside a card wide enough for more, so this is the literal string. Source `frontend/src/lib/components/PaytableModal.svelte:74`, `{ name: 'SCAT', file: 'scatter', ... }`.
  - `SCATTER`, on the card immediately beside it: `Substitutes for all symbols except SCATTER` (frames 333, 334). Source `frontend/src/lib/i18n/prose.ts:100`.
  - `SCATTERs`, the rules bullet (frame 335, and A-01 above).
  - `Scatters`, two sections later: `3 or more Scatters during free spins award +5 free spins.` (frame 336). Source `frontend/src/lib/i18n/translations.ts:1542`. The free-spins table header is also authored `Scatters` at `frontend/src/lib/components/PaytableModal.svelte:259` and only reads as caps on screen because `text-transform: uppercase` is set on the header rule at `:674`.
  - `scatters`, one section later: `Standard play. Overdrive Free Spins trigger on 3+ scatters.` (frame 337). Source `frontend/src/lib/i18n/prose.ts:86`.
  The gated intro card adds a sixth setting of the same content, `3, 4 or 5 Scatters award 8, 12 or 16 free spins` (frame 315, `frontend/src/lib/i18n/translations.ts:1540`). Capitalisation that changes between two screens showing the same word is named in the standing mandate's inspection test; here it changes five times inside one surface.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:74` and `:259`, `frontend/src/lib/i18n/prose.ts:86,100,112,195`, `frontend/src/lib/i18n/translations.ts:1540,1542`.
- Proposed fix: pick one player-facing name and sweep. `SCATTER` singular and `SCATTERS` plural in caps is what most of the surface already does; `SCAT` in particular reads as a maths-package symbol id that escaped to the player. PARK(the sixteen-locale half: `prose.ts` and `translations.ts` values exist per locale, so the sweep is larger than small once it leaves English).

## STT-MOBILES-A-03 HIGH The ways-to-win reel strip overflows its panel and slices the numerals `1` and `5`

- Frames: `reports/screens/stream-test-2026-07-28/330_mobile-s_transition_paytable_opening.png`, `reports/screens/stream-test-2026-07-28/331_mobile-s_paytable_top.png`, `reports/screens/stream-test-2026-07-28/332_mobile-s_paytable_01_match_symbols_on_adjacent_reels_st.png`, `reports/screens/stream-test-2026-07-28/333_mobile-s_paytable_02_ways_to_win.png`.
- Claim: the five reel chips `1` to `5` plus four arrows are wider than the bevelled plate that holds them at 320px. The plate's own left and right borders cross the outer chips, so the digit `1` is cut down its stem and the digit `5` is cut through its bowl, and both chips lose part of their rounded outline. The caption beneath is intact and reads `Reels 1, 2 and 3 hold the same symbol (highlighted), which is a match read left to right from reel 1. Reels 4 and 5 are not required.`, so the caption names two reels the diagram above it does not fully show. This is a non-money string, so it is outside the TR-115 / TR-086 money-fit class. The arithmetic: at `max-width: 500px` the cells are `40px` and the arrows `1.05rem` with `0 4px` padding (`frontend/src/lib/components/PaytableModal.svelte:806-807`), which is 5 x 40 plus 4 x about 24.8, about 299px, plus the plate's `12px 8px` padding at `:808`, about 315px, against a modal content box of about 288px at a 320px viewport (`.fs-pt-body` padding `14px 16px` at `:798`). **The component already carries a comment recording this exact defect being fixed once**, at `:800-805`, for 390 to 430px viewports; the media query stops at 500px and there is no step for 320px, so the fix did not reach the narrowest supported width.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:797-809` (the `@media (max-width: 500px)` block).
- Proposed fix: add a narrower step (about `max-width: 360px`) taking `.fs-way-cell` to about 30px and the arrow padding to `0 2px`, or size the cells from a `clamp()` so the strip cannot exceed the plate at any width.

## STT-MOBILES-A-04 HIGH The paytable bullet lists are centre aligned, inheriting the Vite scaffold's `text-align: center`

- Frames: `reports/screens/stream-test-2026-07-28/335_mobile-s_paytable_04_rules.png` and `reports/screens/stream-test-2026-07-28/336_mobile-s_paytable_05_overdrive_free_spins.png`, against `reports/screens/stream-test-2026-07-28/315_mobile-s_intro_rules.png`.
- Claim: on the gated intro card the `›` marker sits flush left and the paragraph is left aligned with a hanging indent, so every continuation line starts on one left edge. In the paytable the identical pattern is centred: the marker stays flush left while the text is centre aligned, so the first line of `Symbol values shown are per matching way; the total is that value times the number of ways times your bet.` starts about 25px right of its own marker and its four lines each begin at a different x. Every paytable bullet does this, including `Wins pay left to right on adjacent reels starting from reel 1.` and `3 or more Scatters during free spins award +5 free spins.` A hanging bullet marker beside centred body text is a machine-generated tell, and the two surfaces disagree on identical content.
  The cause is inherited, not local: `.fs-rules` and `.fs-rules li` (`frontend/src/lib/components/PaytableModal.svelte:667-669`) declare no `text-align` at all, so they inherit `#app { ... text-align: center; }` at `frontend/src/app.css:139-143`, which is stock Vite scaffold CSS. `IntroSplash.svelte:97` sets `text-align: left` on its own list and therefore escapes it. **This is charter row Q-27 reaching a player-visible frame**: Q-27 records the scaffold remnants in `app.css` and says they are visible only if an unstyled surface reaches a frame. It has, and it is setting the paytable's prose.
- Where fixable: `frontend/src/app.css:143` (the scaffold `text-align: center`), or locally at `frontend/src/lib/components/PaytableModal.svelte:667`.
- Proposed fix: add `text-align: left` to `.fs-rules` for the immediate fix. Removing `text-align: center` from `frontend/src/app.css:143` is the real fix and closes half of Q-27, but it changes alignment on every surface that has been silently relying on it, so it needs a frame sweep rather than a one-line edit: PARK(the `app.css` half, pending a full-surface re-capture).

## STT-MOBILES-A-05 HIGH The win-line detail strip renders at about 3 device pixels and cannot be read

- Frames: `reports/screens/stream-test-2026-07-28/325_mobile-s_transition_bigwin_countup_late.png`, `reports/screens/stream-test-2026-07-28/326_mobile-s_bigwin_settled.png`, `reports/screens/stream-test-2026-07-28/327_mobile-s_transition_menu_opening.png`, `reports/screens/stream-test-2026-07-28/328_mobile-s_hud_menu.png`.
- Claim: the strip across the foot of the reel frame carries four tokens (symbol id, multiplier, ways count, money amount). At 320x568 only the first resolves, as `L3`; the yellow money amount at the right, which is the whole point of the strip, is an unreadable blob at 1:1 and stays unreadable enlarged 20x off the PNG. Its glyphs stand under half the height of the `$1.00` in the BET pod in the same frame.
  The mechanism is a scale, not a font size. `WinBreakdown.svelte` sets `font-size: 0.7rem` on the plate face and `0.62rem` on `.wb-ways` (`frontend/src/lib/components/WinBreakdown.svelte:136,146`), which are 11.2px and 9.9px, entirely reasonable. But the strip lives inside `.canvas-inner.portrait`, a fixed `1280px` stage scaled inline (`frontend/src/App.svelte:2347-2354`), so at a 320px viewport the scale is about 0.25 and those become about 2.8 and 2.5 device pixels. `App.svelte:2356-2358` states in its own comment that the native-DOM HUD region was moved out of the canvas precisely so its *fonts and touch targets render at their own CSS px, independent of S*. The win breakdown never made that move and is the one text surface left inside the scaled stage.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:136,146` and `frontend/src/App.svelte:2347-2354`.
- Proposed fix: PARK(moving the strip out of the scaled canvas is a layout change, not a small one). The cheap interim is to size this component's text in inverse-scaled units (for example `calc(0.7rem / var(--S, 1))` capped) so it holds a legible floor at narrow widths.

## STT-MOBILES-A-06 HIGH The win strip prints `1 ways`

- Frames: `reports/screens/stream-test-2026-07-28/325_mobile-s_transition_bigwin_countup_late.png`, `reports/screens/stream-test-2026-07-28/326_mobile-s_bigwin_settled.png`, `reports/screens/stream-test-2026-07-28/327_mobile-s_transition_menu_opening.png`, `reports/screens/stream-test-2026-07-28/328_mobile-s_hud_menu.png`.
- Claim: the template is `{current.ways} ways` with no plural handling, at `frontend/src/lib/components/WinBreakdown.svelte:94`, so a single-way win renders `1 ways`. The frames confirm it: the strip on the settled big win reads a ways token of `1` followed by `ways`. Unlike A-05 this is not viewport dependent; it renders on every viewport on every one-way win, and it is the classic untranslated-plural tell. The neighbouring token at `:93` is `x{current.kind}`, an ASCII `x` on a numeric surface outside `fsModes.ts`, which is the same class charter row Q-26 enumerates and the same gap MID-02 records that enumeration as having.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:94`.
- Proposed fix: `{current.ways} {current.ways === 1 ? 'way' : 'ways'}`, or a plural-aware `$tr` key if the strip is to be localised. Note the string is currently hardcoded English either way.

## STT-MOBILES-A-07 MEDIUM The HUD menu mixes sentence case and all caps between adjacent rows of one list

- Frames: `reports/screens/stream-test-2026-07-28/327_mobile-s_transition_menu_opening.png`, `reports/screens/stream-test-2026-07-28/328_mobile-s_hud_menu.png`.
- Claim: the menu holds `PAYTABLE`, then directly beneath it at the same size in the same class, `Session`, then below the divider `Mute`, then the two slider labels `MUSIC` and `SOUND`. One list, two casing conventions, with the two that disagree on consecutive rows. The cause is that one row is a translated value and the others are hardcoded: `frontend/src/lib/components/HudOverlay.svelte:428` renders `{$tr('paytable')}`, whose English value is `'PAYTABLE'` (`frontend/src/lib/i18n/translations.ts:271`), while `:429` hardcodes `Session` and `:432` hardcodes `Mute`/`Unmute`. The same pattern is repeated in all four layout variants of the component, at `:428-432`, `:546-575`, `:655-659` and `:817-821`. `.hud-menu-item` (`:1609-1619`) declares neither `letter-spacing` nor `text-transform`, so the difference is purely the authored case; the wider look of `PAYTABLE` on screen is the caps, not extra tracking.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:429,432` and their three siblings at `:547,575`, `:656,659`, `:818,821`.
- Proposed fix: one `text-transform: uppercase` on `.hud-menu-item` at `:1609` normalises all four variants in one property and survives future rows. `Session` and `Mute`/`Unmute` are also on the Q-16 park list as hardcoded English, so the string edit belongs with that park, while the CSS fix does not have to wait for it.

## STT-MOBILES-A-08 MEDIUM Bet mode names disagree on case inside one list

- Frames: `reports/screens/stream-test-2026-07-28/337_mobile-s_paytable_06_bet_modes.png`
- Claim: the `BET MODES` section stacks three cards titled `Normal`, `Cruise` and `OVERBOOST`, two title case and one all caps, at one size in one list, with all three on screen at once. `.fs-mode-name` (`frontend/src/lib/components/PaytableModal.svelte:700`) sets no `text-transform`, so the names disagree at source: `frontend/src/lib/i18n/prose.ts:85,87,89,91,93` reads `'Normal'`, `'Cruise'`, `'OVERBOOST'`, `'Buy Overdrive'`, `'NITRO OVERDRIVE'`. This is NOT charter row Q-34: Q-34 is one name rendered two ways by a `text-transform` present on one surface class and absent on three. This is five display strings that were never cased to one convention.
- Where fixable: `frontend/src/lib/i18n/prose.ts:85,87,89,91,93` (and the social variants below them).
- Proposed fix: an art call, but pick one. A single `text-transform: uppercase` on `.fs-mode-name` would make all five read as caps everywhere and close Q-34 in the same stroke without touching sixteen locales; casing the strings down to title case instead is the other direction and is a multi-locale edit.

## STT-MOBILES-A-09 MEDIUM Symbol payout figures mix decimal precision on one screen

- Frames: `reports/screens/stream-test-2026-07-28/334_mobile-s_paytable_03_symbol_payouts.png`
- Claim: the H1 card lists `1.5`, `6`, `22` and the H2 card beside it lists `0.8`, `3`, `10`. Six figures of one kind, two adjacent cards, right aligned so the mismatch stacks down the column at one decimal place and at none. A decimal format that disagrees with another figure on the same screen is named in the standing mandate's inspection test. The values are raw JS number literals at `frontend/src/lib/components/PaytableModal.svelte:75-82` and are printed unformatted, so the column will show zero, one and two decimal places once scrolled to the low symbols. Worth noting while the row is open: `:81` and `:82` author `0.10` and `0.20`, which JavaScript renders as `0.1` and `0.2`, so even the authored two-decimal intent is lost at render.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:75-82` (data) and `:663` (`.fs-pay-val`, the render site).
- Proposed fix: format the payout at render to a fixed precision, for example two decimal places for values under 1 and the natural form above, applied once so no card can disagree with its neighbour.

## STT-MOBILES-A-10 MEDIUM Modal title and button casing drift across surfaces

- Frames: `reports/screens/stream-test-2026-07-28/329_mobile-s_session_panel.png`, `reports/screens/stream-test-2026-07-28/331_mobile-s_paytable_top.png`, `reports/screens/stream-test-2026-07-28/315_mobile-s_intro_rules.png`, `reports/screens/stream-test-2026-07-28/313_mobile-s_splash.png`, `reports/screens/stream-test-2026-07-28/317_mobile-s_base_idle.png`.
- Claim: two conventions run side by side.
  - Modal titles: `Session information` is sentence case and untracked (frame 329), while `PAYTABLE` (frame 331), `OVERDRIVE FREE SPINS` (frame 315), `RULES`, `SYMBOL PAYOUTS`, `WAYS TO WIN` and `BET MODES` (frames 331 to 337) are all caps and tracked. The paytable title and the section headings get their case from CSS (`frontend/src/lib/components/PaytableModal.svelte:578` on `.fs-pt-title` and `:608` on `.fs-heading`, both `text-transform: uppercase`); the session panel has no equivalent, so one modal in the set is titled a different way from every other.
  - Buttons: the intro card's call to action is `Continue` in title case (frame 315), the splash's is `TAP TO CONTINUE` in all caps (frame 313), and the primary controls are `SPIN` and `MAX` in all caps (frame 317). Button casing that drifts is named in the standing mandate's inspection test.
- Where fixable: the session panel title is UNKNOWN (not located; it is not in `PaytableModal.svelte`). The intro button is `frontend/src/lib/components/IntroSplash.svelte:35`, keyed `introContinue`.
- Proposed fix: all caps and tracked for modal titles and for buttons, matching the majority of shipped surfaces; `Session information` and `Continue` are the two outliers, and both can be done with `text-transform` rather than string edits, so neither touches a locale file.

## STT-MOBILES-A-11 MEDIUM The same rule sentence is punctuated two ways on two surfaces

- Frames: `reports/screens/stream-test-2026-07-28/315_mobile-s_intro_rules.png` and `reports/screens/stream-test-2026-07-28/335_mobile-s_paytable_04_rules.png`.
- Claim: the intro card writes `3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1×, 3× or 10× total bet.` with no serial comma (`frontend/src/lib/i18n/translations.ts:1540`). The paytable writes the same fact as `3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.` with a serial comma in both lists (`frontend/src/lib/i18n/prose.ts:112`). Frame 331's caption also uses the non-serial form (`Reels 1, 2 and 3 hold the same symbol`), so the paytable rules bullet is the single outlier, and the project's house style is Australian English, which takes the non-serial form.
- Where fixable: `frontend/src/lib/i18n/prose.ts:112` and `:195`.
- Proposed fix: drop the two serial commas in each of those two lines, in the same edit as A-01, so all three surfaces agree.

## STT-MOBILES-A-12 LOW The in-reel `WIN!` callout carries no tracking, unlike every other uppercase label on the same frame

- Frames: `reports/screens/stream-test-2026-07-28/323_mobile-s_win_presentation.png`
- Claim: the callout drawn over the reels reads `WIN!` with its letters effectively touching, while `BALANCE`, `WIN`, `BET`, `FEATURES`, `SPIN` and `MAX` in the same frame all carry visible tracking, and the HUD's own `WIN` pod label shows the same word tracked at `letter-spacing: .18em` (`frontend/src/lib/components/HudOverlay.svelte:1328`). `.small-win-flash` (`frontend/src/lib/components/WinCelebration.svelte:40`, string at `:35` from key `winFlash`, `frontend/src/lib/i18n/translations.ts:223`) sets `font-family: var(--fs-font-display)` and `font-weight: 900` but declares no `letter-spacing`. Two instances of one word, one component apart, set differently. No family claim is made: the glow bloom on the callout means the face cannot be identified from the capture, and the declared family is the brand display face.
- Where fixable: `frontend/src/lib/components/WinCelebration.svelte:40`.
- Proposed fix: add `letter-spacing: 0.12em` to `.small-win-flash` so the callout matches the HUD treatment of the same word.

## Explicit absences, signed

- **Money pod clipping (TR-115 / TR-086): none observed in this range.** The balance pod holds `$50,000.00` with clearance at 320px on frames 317 and 320 to 328; the win pod holds `$0.00`, `$3.90`, `$15.95` and `$16.20`; the bet pod holds `$1.00`. Every money figure in frames 312 to 337 fitted its container with margin. The widest string this session produced was `$50,000.00`, so the class is unexercised at this viewport rather than absent from the product.
- **System font leakage: none identified.** Two faces are in use, a squarish display face for the wordmark, HUD labels and numerals, and a rounded techno face for body prose, and both are used where expected. The close glyph on the paytable (frame 331) and on the session panel (frame 329) were compared at 10x and are the same mark, drawn as an SVG path rather than a glyph in both cases (`frontend/src/lib/components/PaytableModal.svelte:587-591`), so neither can fall back. Note the limit of the instrument: `x` (U+0078) and `×` (U+00D7) render as near identical small crosses in this face at these sizes, so **no glyph-identity claim is made from pixels anywhere in this shard**; where a shard string is transcribed from a frame it uses `x`, and where it is transcribed from source it uses the codepoint the source holds.
- **Ellipsised or overflowing text other than A-03: none found.** Every other string across the 26 frames terminates cleanly with no ellipsis and no cut glyph, including the long paytable captions, the six rules bullets and the three mode blurbs.
- **Curly and straight quote mixing: not observable.** No apostrophe and no quotation mark appears anywhere in the 26 frames. The prose punctuation present is full stops, commas, semicolons, colons, parentheses, slashes and plus signs only.
- **Em dashes and en dashes in player-visible prose: none.** Checked every prose surface in the range: splash, intro rules card, HUD, win strip, menu, session panel, and paytable sections 1 to 6. No horizontal stroke of any length appears in any player-visible string.
- **Double spaces: none detected.** Word gaps on the intro card, the paytable bullets and the mode blurbs are uniform at every size captured.
- **Numeral width shimmy outside `.fs-num`: none observed.** The settled HUD readouts across frames 317 and 320 to 322 hold `$50,000.00` at identical width and identical glyph positions, and the bet pod holds `$1.00` unchanged across all 26 frames. The session panel counters (frame 329) appear once and cannot be compared frame to frame. The banner count-up on frames 324 to 326 is the fixed `.fs-num` mechanism and is excluded per TR-089.
- **Localisation casing: not testable in this range.** All 26 frames are `lang: en` per `MANIFEST.json`, so TR-104 and the Q-16 park cannot be exercised here beyond noting which parked strings are visible (see the KNOWN entry below).

## KNOWN matches

- KNOWN(MID-01): `reports/screens/stream-test-2026-07-28/324_mobile-s_transition_bigwin_countup_early.png`, the banner reads `$10.28` while the HUD WIN pod already reads `$15.95`, on a win that settles at `$16.20` in `reports/screens/stream-test-2026-07-28/326_mobile-s_bigwin_settled.png`. The mobile-s triple reproduces the desktop `013` / `015` pattern to within a cent of the ledger's derivation.
- KNOWN(MID-02): `reports/screens/stream-test-2026-07-28/324_mobile-s_transition_bigwin_countup_early.png`, `325_mobile-s_transition_bigwin_countup_late.png` and `326_mobile-s_bigwin_settled.png` all render the banner unit as `16x BET`, the mark set at x height and lighter than the adjacent caps.
- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/337_mobile-s_paytable_06_bet_modes.png` puts both conventions on one card, `COST 1x` beside `MAX WIN 5,000×` (`FS_MAX_WIN_LABEL = '5,000×'`, `frontend/src/lib/config/fsModes.ts:139`). Q-26 asked whether the class was visible on frames: it is, twice per mode card and three mode cards per screen. Adding to MID-02's point that Q-26's enumeration is incomplete, `frontend/src/lib/components/WinBreakdown.svelte:93` renders `x{current.kind}` with an ASCII `x` and is a sixth instance outside `fsModes.ts`.
- KNOWN(Q-27): `reports/screens/stream-test-2026-07-28/335_mobile-s_paytable_04_rules.png` and `336_mobile-s_paytable_05_overdrive_free_spins.png`. Q-27 records the Vite scaffold remnants in `app.css` as *visible only if any link or unstyled surface reaches a frame*. The scaffold `text-align: center` at `frontend/src/app.css:143` is setting the paytable's rules prose on these frames, so the row is now frame-evidenced. Written up as A-04 because the visible defect is new; the source row is Q-27's.
- KNOWN(Q-34): `reports/screens/stream-test-2026-07-28/337_mobile-s_paytable_06_bet_modes.png` confirms the paytable half of the row, `Cruise` in title case. The `CRUISE` HUD badge is not in this frame range, so only one side is evidenced here.
- KNOWN(Q-16 park): `reports/screens/stream-test-2026-07-28/327_mobile-s_transition_menu_opening.png` and `328_mobile-s_hud_menu.png` show the parked hardcoded strings `Mute` and `Session` on a stream-visible surface. This is an `en` session, so the park's urgency is unchanged by it; recorded so the de and ar squads' visibility lists have a matching English reference.

tree_after: `git status --porcelain`, verbatim. Every line is `??` (untracked). Nothing shows as MODIFIED or DELETED. One line is this squad's shard; the other 34 are other squads' shards, which are not mine.
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
