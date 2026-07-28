# STT-STRETCH-A, typography (stretch, frames 364 to 389)

scope: every frame of the `stretch` session numbered 364 to 389 inclusive, viewport
`1920x800`, lang `en`, per `reports/screens/stream-test-2026-07-28/MANIFEST.json`. 26 frames,
all opened once each with the Read tool. No frame outside the range was opened.

frames_read: 26

## STT-STRETCH-A-01 HIGH The word "scatter" is set six different ways, five of them in a single view

- Frames:
  - `reports/screens/stream-test-2026-07-28/386_stretch_paytable_03_symbol_payouts.png`
  - `reports/screens/stream-test-2026-07-28/387_stretch_paytable_04_rules.png`
  - `reports/screens/stream-test-2026-07-28/384_stretch_paytable_01_match_symbols_on_adjacent_reels_st.png`
  - `reports/screens/stream-test-2026-07-28/385_stretch_paytable_02_ways_to_win.png`
  - `reports/screens/stream-test-2026-07-28/388_stretch_paytable_05_overdrive_free_spins.png`
  - `reports/screens/stream-test-2026-07-28/389_stretch_paytable_06_bet_modes.png`
- Claim: one term, six renderings, all player-visible inside the same paytable overlay.
  1. `SCAT`, the symbol card title (frames `384`, `385`, `386`). An unexplained four-letter
     truncation presented to the player as the symbol's name.
  2. `SCATTER`, the wild card body on the card immediately to its left in the same row:
     `Substitutes for all symbols except` / `SCATTER` (frames `384`, `385`, `386`). The
     abbreviated and the spelled-out form are therefore side by side in one view.
  3. `SCATTER` again, in the rules bullet `WILD substitutes for all symbols except SCATTER.`
     (frames `386`, `387`).
  4. `SCATTERs`, with a lowercase plural `s` bolted onto an uppercase word, in
     `3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.`
     (frame `387`).
  5. `SCATTERS`, the trigger table column header beside `FREE SPINS` and `INSTANT AWARD`
     (frames `387`, `388`).
  6. `Scatters` title case in `3 or more Scatters during free spins award +5 free spins.`
     (frames `387`, `388`); lowercase `scatter` in
     `The scatter build runs shorter on a retrigger than on the entry, because the feature is already secured.`
     (frames `387`, `388`); lowercase plural `scatters` in the Normal mode blurb
     `Standard play. Overdrive Free Spins trigger on 3+ scatters.` (frame `389`).

  Frame `387` alone carries `SCATTER`, `SCATTERs`, `SCATTERS`, `Scatters` and `scatter`
  simultaneously. `SCATTERs` is the worst of them: a case break inside one word is the exact
  machine-tell the standing mandate names.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:74` (`{ name: 'SCAT', file: 'scatter', ... }`, rendered as the card title at `:226`); `frontend/src/lib/i18n/prose.ts:100` (`wildSubstitutes`), `:111` (`rulesWildSub`), `:112` (`rulesScatterMult`, the `SCATTERs`), `:86` (`modeNormalBlurb`, `3+ scatters`). The parallel social-branch copies are at `frontend/src/lib/i18n/prose.ts:195` and `frontend/src/lib/i18n/prose.locales.ts`. None locked.
- Proposed fix: settle on `Scatter` / `Scatters` for prose and `SCATTER` for all-caps labels, change `rulesScatterMult`'s `SCATTERs` to `Scatters`, and set the symbol card name to `SCATTER`. `PaytableModal.svelte:87` maps `SCAT: 'tier-s'` and `:227` branches on `sym.name === 'SCAT'`, so the rename touches three lines in one file.

## STT-STRETCH-A-02 HIGH Bet mode names mix Title Case and ALL CAPS inside one card grid

- Frames:
  - `reports/screens/stream-test-2026-07-28/389_stretch_paytable_06_bet_modes.png`
  - `reports/screens/stream-test-2026-07-28/388_stretch_paytable_05_overdrive_free_spins.png`
- Claim: the five mode cards under `BET MODES` read, left to right and then wrapping,
  `Normal`, `Cruise`, `OVERBOOST`, `Buy Overdrive`, `NITRO OVERDRIVE`. Three are Title Case
  and two are ALL CAPS, in one grid, at one type size, in one component. The casing is stored
  in the strings themselves, not applied by a transform, which is confirmed at source: the
  five literals sit on consecutive lines of the same table. That distinguishes this from
  KNOWN row **Q-34**, which is about `Cruise` versus `CRUISE` across two different surfaces
  via a `text-transform` present on one class and absent on three. Same family, different
  defect, needs its own fix.
- Where fixable: `frontend/src/lib/i18n/prose.ts:84` `modeNormalLabel: 'Normal'`, `:86` `modeCruiseLabel: 'Cruise'`, `:88` `modeOverboostLabel: 'OVERBOOST'`, `:90` `modeBonusLabel: 'Buy Overdrive'`, `:92` `modeSuperLabel: 'NITRO OVERDRIVE'`. Sixteen locale copies carry the same split, for example `frontend/src/lib/i18n/prose.locales.ts:43` and `:119` (`modeOverboostLabel: 'OVERBOOST'`). Not locked.
- Proposed fix: normalise all five stored labels to one casing (Title Case is the majority, three of five, and it is what the paytable card already styles for) and let any surface that wants shouting apply `text-transform: uppercase`. Note the same change must be swept across the locale table, so it is small per file but wide.

## STT-STRETCH-A-03 HIGH The HUD menu shouts its first item and whispers the next two

- Frames:
  - `reports/screens/stream-test-2026-07-28/380_stretch_hud_menu.png`
  - `reports/screens/stream-test-2026-07-28/379_stretch_transition_menu_opening.png`
- Claim: the three menu rows read, top to bottom, `PAYTABLE`, `Session`, `Mute`. One
  uppercase, two title case, stacked, same size, same colour, same face, about 36 px apart.
  The two slider labels below return to uppercase: `MUSIC` and `SOUND`, with `50%` and `80%`.
  So the panel runs uppercase, title case, title case, uppercase, uppercase. This is the
  flagship's main menu and a streamer opens it on camera. The split has an obvious cause at
  source: row one is a translated key whose value is uppercase, rows two and three are
  hardcoded English literals typed in title case.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:428` (`{$tr('paytable')}`, whose value is `'PAYTABLE'` at `frontend/src/lib/i18n/translations.ts:271`), `:429` (hardcoded `Session`), `:432` (hardcoded `{$isMuted ? 'Unmute' : 'Mute'}`). The compact variant repeats it at `HudOverlay.svelte:546` and `:547`. Not locked.
- Proposed fix: one casing for the three rows. Uppercase matches `MUSIC` / `SOUND` and the `PAYTABLE` overlay title, so uppercase is the cheaper direction. Note that fixing the casing here also lands inside the **Q-16** parked set (`Session`, `Mute`, `Unmute` are hardcoded English at those exact lines), so route the wording change through whoever owns that park rather than localising it unilaterally.

## STT-STRETCH-A-04 HIGH One purchase carries three different names in a single view

- Frames:
  - `reports/screens/stream-test-2026-07-28/388_stretch_paytable_05_overdrive_free_spins.png`
  - `reports/screens/stream-test-2026-07-28/387_stretch_paytable_04_rules.png`
  - `reports/screens/stream-test-2026-07-28/389_stretch_paytable_06_bet_modes.png`
- Claim: frame `388` shows all three at once, top to bottom, inside one scroll view: the
  bullet `Bonus Buy: pay 100× your bet to start the feature immediately.`, then the price bar
  `BUY FEATURE` with `$100.00`, then the mode card `Buy Overdrive` whose `COST` cell reads
  `100x` and `$100.00`. One 100x purchase, three names, three casings, one screen. Frame
  `387` carries the first two together and frame `389` carries the card.
- Where fixable: `frontend/src/lib/i18n/prose.ts:90` (`modeBonusLabel: 'Buy Overdrive'`) and the `Bonus Buy:` and `BUY FEATURE` strings in the same prose table, rendered by `frontend/src/lib/components/PaytableModal.svelte`. Not locked.
- Proposed fix: use `Buy Overdrive` in all three places; it is the name the project's own mode table uses and the one the features menu shows.

## STT-STRETCH-A-05 HIGH Paytable bullet markers are orphaned in the left margin while their text is centred

- Frames:
  - `reports/screens/stream-test-2026-07-28/387_stretch_paytable_04_rules.png`
  - `reports/screens/stream-test-2026-07-28/386_stretch_paytable_03_symbol_payouts.png`
  - `reports/screens/stream-test-2026-07-28/388_stretch_paytable_05_overdrive_free_spins.png`
- Claim: in the `RULES` list and the `OVERDRIVE FREE SPINS` list, the `›` chevron markers sit
  at roughly x=345, hard against the panel's left edge, while every bullet's text is centred
  in a 1270 px wide panel. On frame `387` that leaves eleven chevrons stranded in the margin
  with 250 to 390 px of empty space between each marker and the sentence it belongs to. It
  reads as a list that lost its layout.

  The cause is exact: the marker is absolutely positioned at the list item's left edge while
  the item is full width and its text is centred by an inherited `text-align: center`, so the
  16 px of reserved indent never sits next to the text.

  The same marker is used correctly elsewhere in the build: the intro rules card
  (`367_stretch_intro_rules.png`) sets the identical chevron directly beside left-aligned
  text. One instance of the pattern is right and the other is broken, which is what makes it
  a defect rather than a style choice.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:668` (`.fs-rules li { ... padding-left: 16px; position: relative; }`) and `:669` (`.fs-rules li::before { content: '›'; position: absolute; left: 0; }`), against the centring the section inherits. Not locked.
- Proposed fix: add `text-align: left;` to `.fs-rules li` at `:668`, or give the list `width: fit-content; margin-inline: auto;` so the marker travels with the text.

## STT-STRETCH-A-06 HIGH The win-line readout prints `1 ways`

- Frames:
  - `reports/screens/stream-test-2026-07-28/377_stretch_transition_bigwin_countup_late.png`
  - `reports/screens/stream-test-2026-07-28/378_stretch_bigwin_settled.png`
- Claim: the win-line strip under the reels reads `L3  x4  1 ways  $0.20` on frame `377` and
  `M3  x5  8 ways  $16.00` on frame `378`. The plural is unconditional, so a single-way win
  is announced to the player as `1 ways`. It is one of the two lines that make up the `$16.20`
  big win this session celebrates, so it is on screen during the most-watched moment in the
  capture set.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:94`, `<span class="wb-ways">{current.ways} ways</span>`. Not locked.
- Proposed fix: `{current.ways} {current.ways === 1 ? 'way' : 'ways'}`, or drop the word for a single way. One line.

## STT-STRETCH-A-07 MEDIUM The match count is written `x5` with a letter in one place and `5×` with a multiplication sign in the other

- Frames:
  - `reports/screens/stream-test-2026-07-28/378_stretch_bigwin_settled.png`
  - `reports/screens/stream-test-2026-07-28/377_stretch_transition_bigwin_countup_late.png`
  - `reports/screens/stream-test-2026-07-28/386_stretch_paytable_03_symbol_payouts.png`
- Claim: the win-line readout writes the match count as a PREFIX with an ASCII letter,
  `M3  x5` and `L3  x4` (frames `378`, `377`), built at source as `x{current.kind}`. The
  paytable writes the identical quantity as a SUFFIX with the multiplication sign, `3×`,
  `4×`, `5×` on every symbol card (frame `386`), hardcoded as `3×`/`4×`/`5×` at source. Same
  concept, same game, both order and glyph reversed, and the player is expected to read the
  readout against the paytable to check a win. The glyph half of this belongs to the class
  KNOWN row **Q-26** and ledger entry **MID-02** enumerate; the ORDER half is new and is not
  in either.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:93`, `<span class="wb-count">x{current.kind}</span>`, against `frontend/src/lib/components/PaytableModal.svelte:234-236` (`<span class="fs-pay-count">3×</span>` and siblings). Not locked.
- Proposed fix: change `WinBreakdown.svelte:93` to `{current.kind}×`, matching the paytable in both order and glyph. One line, and it closes a Q-26 class instance at the same time.

## STT-STRETCH-A-08 MEDIUM Paytable payouts are printed as raw numbers, so decimal places change within one card

- Frames:
  - `reports/screens/stream-test-2026-07-28/386_stretch_paytable_03_symbol_payouts.png`
  - `reports/screens/stream-test-2026-07-28/385_stretch_paytable_02_ways_to_win.png`
- Claim: frame `386` shows all eight paying symbols at once. Read down each card:
  `H1` `1.5` / `6` / `22`; `H2` `0.8` / `3` / `10`; `M1` `0.45` / `1.5` / `5`;
  `M2` `0.3` / `1` / `4`; `M3` `0.2` / `0.6` / `2`; `L1` `0.15` / `0.45` / `1.5`;
  `L2` `0.1` / `0.25` / `0.8`; `L3` `0.08` / `0.2` / `0.65`.
  Precision changes inside a single card: `L3` runs two decimals, one decimal, two decimals;
  `L2` runs one, two, one; `M2` runs one, zero, zero. The column is right-aligned rather than
  decimal-aligned, so on `L3` the `8` of `0.08` sits directly above the `2` of `0.2`, and on
  `H1` the `5` of `1.5` sits above the `2` of `22`.

  Derived rather than guessed: the values are stored as JavaScript numbers and interpolated
  raw, so a stored `0.20` can only ever print as `0.2`. The project's own paytable statement
  in `CLAUDE.md` writes that figure as `0.20` ("H1 22/6/1.5 down to L3 0.65/0.20/0.08"), which
  confirms this is a display formatting defect and not a data one.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:234-236`, `{sym.pays[2] ?? '-'}` and siblings, against the source array at `:75-82`. Not locked.
- Proposed fix: interpolate `sym.pays[n].toFixed(2)` (or a shared money formatter) at `:234-236`, and decimal-align the column by giving `.fs-pay-val` a tabular treatment. Three lines plus one CSS rule.

## STT-STRETCH-A-09 MEDIUM The interface guide names the spin button `Spin` while the button says `SPIN`

- Frames:
  - `reports/screens/stream-test-2026-07-28/389_stretch_paytable_06_bet_modes.png`
  - `reports/screens/stream-test-2026-07-28/369_stretch_base_idle.png`
- Claim: the `INTERFACE GUIDE` row on frame `389` reads `Spin` with the body
  `Start a spin at the current bet.` The control it documents carries the label `SPIN`,
  uppercase, under the play arrow on frame `369` and on every base-game frame in the range.
  The same word, two casings, on the one surface whose entire job is to name that control.
  The guide's sibling rows are stored the same way (`Increase Bet`, `Decrease Bet`,
  `Features`, `Autoplay`), so the whole guide drifts from the controls it describes; `Features`
  against the `FEATURES` button on frame `369` is the second instance visible in my range.
- Where fixable: `frontend/src/lib/i18n/prose.ts:122` (`guideSpinName: 'Spin'`) and the sibling `guide*Name` keys immediately below it, against `frontend/src/lib/i18n/translations.ts` where the control labels are stored uppercase. Not locked.
- Proposed fix: apply `text-transform: uppercase` to the guide's name element in `PaytableModal.svelte` rather than editing sixteen locales; that is one CSS line and it cannot drift again.

## STT-STRETCH-A-10 MEDIUM Modal titles run in three different casings across three dialogs

- Frames:
  - `reports/screens/stream-test-2026-07-28/367_stretch_intro_rules.png`
  - `reports/screens/stream-test-2026-07-28/381_stretch_session_panel.png`
  - `reports/screens/stream-test-2026-07-28/383_stretch_paytable_top.png`
- Claim: three overlays reached in one uninterrupted session title themselves
  `OVERDRIVE FREE SPINS` (uppercase, letterspaced, cyan, frame `367`),
  `Session information` (sentence case, cyan, frame `381`) and `PAYTABLE` (uppercase,
  letterspaced, amber, frame `383`). Two of three uppercase, one sentence case; the sentence
  case one is also the only title left-aligned beside a round close button rather than
  centred.
- Where fixable: `frontend/src/lib/components/SessionPanel.svelte` (the `Session information` heading), against `frontend/src/lib/components/IntroSplash.svelte` and `frontend/src/lib/components/PaytableModal.svelte`. Exact line in SessionPanel not read; treat as UNKNOWN-precise. Not locked.
- Proposed fix: one casing rule for overlay titles. Uppercase is the majority and matches the section headers (`WAYS TO WIN`, `SYMBOL PAYOUTS`, `RULES`, `BET MODES`, `INTERFACE GUIDE`).

## STT-STRETCH-A-11 MEDIUM The banner sets `$16.20` with a detached dollar sign while the HUD pod sets the same figure tight, at the same instant

- Frames:
  - `reports/screens/stream-test-2026-07-28/378_stretch_bigwin_settled.png`
  - `reports/screens/stream-test-2026-07-28/377_stretch_transition_bigwin_countup_late.png`
  - `reports/screens/stream-test-2026-07-28/376_stretch_transition_bigwin_countup_early.png`
- Claim: on frame `378` the big win banner reads `$16.20` with a clear gap between the `$`
  and the `1`, while the HUD `WIN` pod on the same frame reads the identical string `$16.20`
  with the `$` tight against the `1`. The same amount is set two ways, simultaneously, on one
  screen. Frames `377` and `376` show the same gap (`$ 16.20`, `$ 10.69`).

  **Derived from source before measuring, per convention (l.1).** `WinBanner.svelte:414` sets
  `.c1-amount .c1-digit { display: inline-block; width: 0.834em; text-align: center; }`, and
  the component's own comment at `:295-297` records the measured Orbitron advances as
  `834 391 830 826 730 830 820 660 834 828` of 1000. A `1` therefore occupies `0.391em`
  centred in a `0.834em` box, leaving `(0.834 - 0.391) / 2 = 0.2215em` of dead space on each
  side. At the banner's rendered size that predicts roughly 20 px of air to the left of the
  leading `1`, which is what the frame shows. The HUD pod does not box its digits, so it
  renders the identical string with no gap.

  **This is not the digit shimmy that KNOWN row TR-089 closed, and I am not reporting
  shimmy.** It is a static side effect of that fix, on the leading-digit case. The comment at
  `:298-300` shows the author considered the currency symbol and separators deliberately
  ("boxing the currency symbol and separators too would space them oddly") but the leading
  `1` produces the same oddity from the other direction. Recorded separately so the marshal
  can decide whether the closed mechanism is meant to own this.
- Where fixable: `frontend/src/lib/components/WinBanner.svelte:414` (the 0.834em digit box) and `:301-302` (the per-character split). Not locked.
- Proposed fix: PARK(the steadiness of the count-up is gated by `win_countup_steady_gate.mjs` and any change to the box risks reopening TR-089). If it is taken, the low-risk option is a negative left margin on a leading boxed digit, or shipping a subsetted Orbitron with a real `tnum` feature so the boxes are not needed at all; both are larger than a one-line edit and neither should be done without re-running that gate.

## STT-STRETCH-A-12 MEDIUM The intro card's `Continue` button is the only title-case button in the session

- Frames:
  - `reports/screens/stream-test-2026-07-28/367_stretch_intro_rules.png`
  - `reports/screens/stream-test-2026-07-28/369_stretch_base_idle.png`
  - `reports/screens/stream-test-2026-07-28/387_stretch_paytable_04_rules.png`
- Claim: the gated intro card's only control reads `Continue`, title case, on frame `367`.
  Every other button label captured in the range is uppercase: `FEATURES`, `MAX` and `SPIN`
  on frame `369`, `BUY FEATURE` on frame `387`, `PAYTABLE` on frame `380`, and
  `TAP TO CONTINUE` on frame `365`. `Continue` is the first button a player ever presses, so
  the drift is established before the base game is seen. The splash and the card also use the
  same verb in two casings, `TAP TO CONTINUE` then `Continue`, about two seconds apart.
- Where fixable: `frontend/src/lib/i18n/translations.ts:1556` (`introContinue: 'Continue'`), rendered at `frontend/src/lib/components/IntroSplash.svelte:35`. Sixteen locales carry a sibling (for example `:1582` Arabic, `:1608` German). Not locked.
- Proposed fix: add `text-transform: uppercase` to `.intro-continue` in `IntroSplash.svelte` rather than editing sixteen locale strings. One CSS line, and it keeps the localised words intact.

## STT-STRETCH-A-13 LOW The same rule sentence carries a serial comma on one surface and not on the other

- Frames:
  - `reports/screens/stream-test-2026-07-28/367_stretch_intro_rules.png`
  - `reports/screens/stream-test-2026-07-28/387_stretch_paytable_04_rules.png`
- Claim: the intro card writes
  `3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1×, 3× or 10× total bet.`
  with no serial comma. The paytable writes
  `3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.`
  with a serial comma in both lists. Two surfaces, the same fact, two punctuation styles, and
  the project's declared house style is Australian English, which does not take the serial
  comma in either list.
- Where fixable: `frontend/src/lib/i18n/prose.ts:112` (`rulesScatterMult`), plus its social-branch twin at `:195`. Not locked.
- Proposed fix: drop the two serial commas at `:112` and `:195`. Note the same edit is the natural home for the `SCATTERs` fix in STT-STRETCH-A-01, so do them together.

## STT-STRETCH-A-14 LOW The scatter card's payout string wraps onto a line that begins with a slash

- Frames:
  - `reports/screens/stream-test-2026-07-28/385_stretch_paytable_02_ways_to_win.png`
  - `reports/screens/stream-test-2026-07-28/386_stretch_paytable_03_symbol_payouts.png`
- Claim: the `SCAT` card body wraps as `3 / 4 / 5 = 1× / 3× / 10× + 8` on line one and
  `/ 12 / 16 free spins` on line two, so the second line opens with a separator and the
  `8 / 12 / 16` group is broken across the fold. The source string is a single flat line, so
  the break point is whatever the card width happens to give.
- Where fixable: `frontend/src/lib/i18n/prose.ts:117`, `scatterSummary: '3 / 4 / 5 = 1× / 3× / 10× + 8 / 12 / 16 free spins'`, rendered at `frontend/src/lib/components/PaytableModal.svelte:228`. Not locked.
- Proposed fix: put non-breaking spaces inside each `a / b / c` group at `:117`, so the string can only break between groups.

## STT-STRETCH-A-15 LOW The `BET` pod right-aligns its label while `BALANCE` and `WIN` centre theirs

- Frames:
  - `reports/screens/stream-test-2026-07-28/369_stretch_base_idle.png`
  - `reports/screens/stream-test-2026-07-28/372_stretch_dead_spin_1_settled.png`
  - `reports/screens/stream-test-2026-07-28/375_stretch_win_presentation.png`
  - `reports/screens/stream-test-2026-07-28/378_stretch_bigwin_settled.png`
- Claim: across the four frames above, the micro-labels `BALANCE` and `WIN` sit on the same
  horizontal centre as the values beneath them, while `BET` sits hard against the right edge
  of its own pod. Three instances of one component, two centred and one not. Observed by eye
  first, then confirmed at source rather than left as an impression: the landscape HUD sets
  `.fs-bet .fs-face{align-items:flex-end;padding-right:14px;}` and
  `.fs-bet .fs-label,.fs-bet .fs-value{text-align:right;width:100%;}`, and neither rule has a
  `.fs-balance` or `.fs-win` counterpart. The component comment above the markup states the
  intent as "value right-aligned"; the LABEL was carried along with it, which is the part
  that does not match its siblings.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1315` and `:1343`. Not locked.
- Proposed fix: narrow `:1343` to `.fs-bet .fs-value{text-align:right;width:100%;}` so the label keeps the shared centring, leaving the deliberate value alignment untouched. One line.

## Explicit absences, signed

- **No system-font leakage, and no fallback or missing glyph.** Every player-visible string
  across the 26 frames renders in one of two brand faces: a squarish display face for titles,
  labels and figures (`PAYTABLE`, `BALANCE`, `$50,000.00`, `OVERDRIVE FREE SPINS`) and a
  rounded techno face for prose (the rules bullets, the mode blurbs, the session rows). I
  found no glyph set in a visibly different family, no tofu box, no notdef. The `Continue`
  button on frame `367` was the one candidate I examined closely for a family change; I
  concluded it is the same face at a heavier weight on a light fill, so I reported it as a
  casing finding only (STT-STRETCH-A-12) and did not claim a family difference.
- **No mixed straight and curly quotes.** There is not a single apostrophe or quotation mark
  in any player-visible string in the 26 frames. I read every prose string on frames `366`,
  `367`, `382` through `389`, and the session panel on `381`; none contains `'`, `’`, `"` or
  `“`. The class cannot be violated because the characters do not occur in this range.
- **No em dashes and no en dashes in player-visible prose.** Every dash I found is a hyphen
  joining a compound: `Double-chance`, `pre-revved`, `Time played`. Checked on frames `366`,
  `367`, `382` to `389`.
- **No double spaces detectable.** At the paytable body size a double space would be about
  6 px, which is resolvable at this capture width, and I did not see one in any prose string
  on frames `366`, `367`, `382` to `389`. Signed at that limit: a double space in a smaller
  string, for example the win-line readout on `377`, would be near the resolution floor and I
  cannot rule it out there.
- **No string clipped, ellipsised or overflowing its container.** No `...` or `…` appears
  anywhere in the range. The paytable content cut at the panel edge on frames `382`, `383`
  and `388` is cut by the overlay's own scroll viewport with more content below, which is the
  scroll container working, not a clip; frames `384` to `389` show the same content complete
  after scrolling.
- **No money-display fit failure, so no fresh TR-115 / TR-086 evidence from this shard.** The
  widest money string in the range is `$50,000.00` in the `BALANCE` pod, present on 15 of the
  26 frames, and it sits inside its pod with clear margin at `1920x800`. `$100.00`, `$400.00`,
  `$20.10`, `+$15.10`, `$16.20`, `$3.90`, `$0.20` and `$1.00` all fit. Nothing in my range
  clips, ellipsises or overflows a money container.
- **Numeral width during a count-up: not testable from this range, and not claimed.** The only
  count-up captured is the win banner, which KNOWN row TR-089 rules out as a finding surface.
  No other numeric readout in the range was captured twice mid-animation: the balance reads
  `$50,000.00` identically on every frame it appears, so I have no evidence either way about a
  balance-tick shimmy, and I am not asserting its absence.
- **TR-104 not applicable to this shard.** The `stretch` session is `lang: en` per the
  manifest, so `BIG WIN` and `16x BET` in English on frames `376`, `377` and `378` is correct
  behaviour here rather than the localisation defect TR-104 describes.
- **Q-07, Q-27 and TR-114 not observable in this range.** The autoplay infinity glyph is on
  frame `394`, outside my range. No hyperlink or unstyled surface appears in any of the 26
  frames, so no Vite scaffold link colour is exposed. No replay surface appears.
- **Q-16 parked strings that ARE visible on my frames**, recorded because the register asks
  for the visibility, not because this en session makes them a defect: `SYMBOL PAYOUTS`
  (frames `382` to `386`), `INTERFACE GUIDE` (frame `389`), `Session` and `Mute` (frames
  `379`, `380`, hardcoded at `HudOverlay.svelte:429` and `:432`).
- **Symbol codes as player-facing names: checked, and NOT reported as a finding.** The
  paytable labels six of its eight paying symbols `H1`, `H2`, `M1`, `M2`, `M3`, `L1`, `L2`,
  `L3` (frames `385`, `386`) and the win-line readout uses the same codes (`L3` on `377`,
  `M3` on `378`). The two surfaces agree, so it is a deliberate scheme rather than a leak, and
  it is out of scope for a consistency lens. Flagged here only so the next reader knows it was
  seen and ruled on rather than missed. `SCAT` is different and IS reported, because its own
  neighbours spell the word out.

## KNOWN matches

- KNOWN(MID-01): `reports/screens/stream-test-2026-07-28/376_stretch_transition_bigwin_countup_early.png`, banner reads `$10.69` while the HUD `WIN` pod reads `$15.95` at the same instant, on a win that settles at `$16.20` in `378_stretch_bigwin_settled.png`; the stretch session reproduces the ledger's three-frame pattern exactly.
- KNOWN(MID-02): `reports/screens/stream-test-2026-07-28/376_stretch_transition_bigwin_countup_early.png`, `377_stretch_transition_bigwin_countup_late.png` and `378_stretch_bigwin_settled.png` all render the banner unit as `16x BET` with the ASCII letter.
- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/389_stretch_paytable_06_bet_modes.png` renders `Double-chance: about 1.6x the feature trigger rate. Debits 1.25x every spin while ON.` and `Buy a rich entry with the Overdrive meter pre-revved to 5x.` at full card size; frame `388` shows the same two cards partially. Source confirmed at `frontend/src/lib/i18n/prose.ts:90` and `:94`. The register asked whether the `fsModes.ts` blurb instances are visible on frames: they are, in the paytable, so Q-26 is player-visible and not merely a source-level row. Recorded beside it: `prose.ts:117` `scatterSummary` uses the correct `×`, so the two glyphs sit four lines apart in the same table.
- KNOWN(Q-34), partial evidence only: `reports/screens/stream-test-2026-07-28/389_stretch_paytable_06_bet_modes.png` and `388_stretch_paytable_05_overdrive_free_spins.png` show the paytable side of the pair, `Cruise` in title case. The `CRUISE` HUD badge is not present in frames 364 to 389, so this shard evidences one half of Q-34 only. See STT-STRETCH-A-02 for the separate, source-level casing split among the mode names themselves, which Q-34 does not cover.

tree_after: `git status --porcelain` at the end of the run, verbatim. Every line is untracked
(`??`). Nothing shows as MODIFIED or DELETED. Only `STT-STRETCH-A.md` is mine; the other 34
are other squads' shards.

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
