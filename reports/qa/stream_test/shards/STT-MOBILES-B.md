# STT-MOBILES-B, typography (mobile-s, frames 338 to 363)

scope: the 26 `mobile-s` frames numbered 338 to 363 inclusive, viewport 320x568,
lang `en`, from `reports/screens/stream-test-2026-07-28/`. Frame paths below are
repository relative, matching the ledger's convention. Every frame in the range
was opened once with the Read tool; no frame outside the range was opened.

frames_read: 26

Findings are numbered in severity order, worst first. Every `file:line` below was
read at HEAD `d9bdf22` after the frames were judged, so the frame is the
observation and the source is the confirmation, per convention (l.2). Where a
claim rests only on rendered pixels it says so.

---

## STT-MOBILES-B-01 HIGH The max win headline unit renders as one unbroken token, `5,000×BET`, and sets the `×` at nearly twice the size of the `BET` it joins

- Frames: `reports/screens/stream-test-2026-07-28/361_mobile-s_maxwin_celebration.png`,
  `reports/screens/stream-test-2026-07-28/360_mobile-s_transition_maxwin_overlay_fade.png`
- Claim: on the held MAX WIN celebration, the most watched surface in the game,
  the unit beside the amount reads `5,000×BET` as a single token. The three
  spans are adjacent in the markup with no separating text node, and the only
  thing between them is a flex `gap: 0.1em`, which at this viewport is under two
  pixels and reads as no space at all:

  ```
  <span class="c1-max-mult fs-num">5,000</span><span class="c1-max-x">×</span>
  <span class="c1-max-betlabel">{t($locale, 'bet', localeMode)}</span>
  ```

  On top of that the two halves of the unit are set at two sizes. Under the
  narrow-viewport rule that this session is captured at, `@media (max-width:
  500px)`, the sizes are `.c1-max-mult` `50px`, `.c1-max-x` `24px` and
  `.c1-max-betlabel` `13px`. So the multiplication sign is `1.85` times the
  height of the word it modifies, which is why on the frame the `×` visibly
  overshoots the cap height of `BET`.

  Every other multiplier unit in this session spaces itself correctly, so the
  celebration is the one place it is missing: the features mode cards build
  ``` `{m.cost}× {$isSocial ? 'per spin' : 'bet'}` ``` with a space
  (`344_mobile-s_features_menu.png`, rendering `1× bet`), and the buy dialogs
  render `100× your bet?` and `400× your bet?`
  (`346_mobile-s_dialog_buy_overdrive.png`,
  `348_mobile-s_dialog_nitro_overdrive.png`).
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:155` and
  `:158` for the markup, `:298` for `gap: 0.1em`, and `:367-369` for the three
  narrow-viewport sizes. Not locked.
- Proposed fix: raise `.c1-max-betlabel` to the same size as `.c1-max-x` in both
  the base rule and the `max-width: 500px` rule, and widen the wrap `gap` to
  about `0.35em`, so the unit reads `5,000× BET`.

---

## STT-MOBILES-B-02 HIGH The five bet-mode display names disagree on case, and the same dialog renders `Buy Overdrive` on one frame and `NITRO OVERDRIVE` on the next

- Frames: `reports/screens/stream-test-2026-07-28/346_mobile-s_dialog_buy_overdrive.png`
  (title `Buy Overdrive`),
  `reports/screens/stream-test-2026-07-28/348_mobile-s_dialog_nitro_overdrive.png`
  (title `NITRO OVERDRIVE`),
  `reports/screens/stream-test-2026-07-28/344_mobile-s_features_menu.png`
  (cards `Normal` and `Cruise`), plus the two mid-open transitions showing the
  same two titles,
  `345_mobile-s_transition_dialog_buy_overdrive_opening.png` and
  `347_mobile-s_transition_dialog_nitro_overdrive_opening.png`.
- Claim: this is one component rendering one field, and the field's values are
  not cased to one rule. The five literals sit together in one block:

  | Source | Literal |
  |---|---|
  | `prose.ts:87` | `'Cruise'` |
  | `prose.ts:89` | `'OVERBOOST'` |
  | `prose.ts:91` | `'Buy Overdrive'` |
  | `prose.ts:93` | `'NITRO OVERDRIVE'` |

  plus `modeNormalLabel` on the line above `:86`. Three are Title Case and two
  are upper case. Because the casing lives in the strings rather than in a
  `text-transform`, no styling rule reconciles them, and the buy confirm dialog
  therefore changes its own typographic voice between two consecutive player
  actions.

  This is NOT KNOWN_OPEN Q-34. Q-34 is one mode name (`Cruise`) differing
  BETWEEN surfaces through a `text-transform` present on one surface class and
  absent on three. This is the mode-name SET disagreeing with itself INSIDE one
  surface, and fixing Q-34 in either direction would not touch it.
- Where fixable: `frontend/src/lib/i18n/prose.ts:87,89,91,93` and the
  `modeNormalLabel` line above `:86`, with the same five keys repeated in the
  social block from `:189` and in all sixteen locales in
  `frontend/src/lib/i18n/prose.locales.ts`. Not locked.
- Proposed fix: PARK(the direction is a brand naming call, exactly as Q-34's is,
  and the two want one ruling rather than two). The mechanical part is trivial
  either way: five literals per locale block, or one `text-transform` on the
  shared mode-name class with the literals normalised to Title Case first.

---

## STT-MOBILES-B-03 HIGH The FEATURES bet bar is set to wrap, so at 320 px the stepper splits across two rows, `BET` is orphaned from its value, and `$1.00` prints twice at two sizes

- Frames: `reports/screens/stream-test-2026-07-28/344_mobile-s_features_menu.png`,
  `reports/screens/stream-test-2026-07-28/343_mobile-s_transition_features_menu_opening.png`
- Claim: the header row of the FEATURES panel reads, on line one, `SPIN COST`
  `$1.00` `BET` and then the decrement control; and on line two, a second
  `$1.00` and the increment control. The minus and plus of one stepper are on
  different rows and the label `BET` sits on the row above the value it names.
  The typographic consequence is that one bordered box shows the same figure,
  `$1.00`, twice at two clearly different type sizes; measured off the frame the
  upper figure is about six tenths the height of the lower one, which reads as
  two different quantities rather than one restated. At 320 px this is the first
  thing a player sees on opening FEATURES.

  The cause is one declaration: `.fm-betbar > .fs-face { flex-direction: row;
  align-items: center; gap: 0.7rem; padding: 8px 16px; flex-wrap: wrap; }`. The
  codebase already contains the correct rule for its other panel size,
  `.fm-panel--mini .fm-betbar > .fs-face { flex-wrap: nowrap; gap: 0.4rem;
  padding: 2px 8px; }`, so the fix is a pattern the file already uses and not a
  new idea.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:847`, with the
  working precedent at `:760-761`. Not locked.
- Proposed fix: set `flex-wrap: nowrap` on `.fm-betbar > .fs-face` and drop the
  gap to about `0.4rem` below 360 px, mirroring the `--mini` rule that already
  works.

---

## STT-MOBILES-B-04 MEDIUM The buy dialog `MAX WIN` stat wraps to three lines beside two one-line siblings

- Frames: `reports/screens/stream-test-2026-07-28/346_mobile-s_dialog_buy_overdrive.png`,
  `reports/screens/stream-test-2026-07-28/348_mobile-s_dialog_nitro_overdrive.png`,
  and both mid-open transitions,
  `345_mobile-s_transition_dialog_buy_overdrive_opening.png`,
  `347_mobile-s_transition_dialog_nitro_overdrive_opening.png`
- Claim: the three-cell stat strip reads `PRICE` `$100.00`, `RTP` `96.35%` and
  `MAX WIN` `5,000× base bet`. The first two values occupy one line each; the
  third breaks into three, `5,000×` then `base` then `bet`, so the strip is
  about three times taller than it needs to be and its three values share no
  baseline. The value is built by
  ``` return social ? `${FS_MAX_WIN_LABEL} base play` : `${FS_MAX_WIN_LABEL} base bet` ```
  from `FS_MAX_WIN_LABEL = '5,000×'`, and all three cells render at one fixed
  `font-size: 0.92rem` with no narrow-viewport step.

  This is not a money display: the value is a multiplier plus a noun phrase, so
  it sits outside the TR-115 / TR-086 class, which is money pods specifically.
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:135` for the value
  and `:240` for `.buy-stat-val { font-size: 0.92rem }`; the string is built at
  `frontend/src/lib/config/fsModes.ts:158` from `:139`. Not locked.
- Proposed fix: put `base bet` into the cell's label (`MAX WIN, BASE BET`) so
  the value is just `5,000×`, or add a narrow-viewport step on `.buy-stat-val`
  so all three values fit one line each below 360 px.

---

## STT-MOBILES-B-05 MEDIUM The paytable interface guide names the FEATURES menu twice in one card, once as `Features` and once as `FEATURES`

- Frames: `reports/screens/stream-test-2026-07-28/338_mobile-s_paytable_07_interface_guide.png`.
  Corroborating surfaces in range: the base HUD button reads `FEATURES` in
  `341_mobile-s_transition_paytable_closing.png`,
  `358_mobile-s_transition_feature_exit.png` and
  `359_mobile-s_post_feature_base.png`; the menu's own title reads `FEATURES` in
  `344_mobile-s_features_menu.png`.
- Claim: the card heading is `Features` and the very next line of its own body
  is `Open the FEATURES menu to pick a bet mode or buy the feature.` One card,
  one referent, two casings, six words apart. The two literals are adjacent in
  the source: `guideFeaturesName:  'Features'` then `guideFeaturesDesc:  'Open
  the FEATURES menu to pick a bet mode or buy the feature.'` The same guide
  names the spin control `Spin` (`guideSpinName`) while the control itself reads
  `SPIN` on every base frame, and names `Autoplay` (`guideAutoplayName`) while
  the panel that opens reads `SPINS` in upper case
  (`342_mobile-s_autoplay_menu.png`). The social variant repeats the same
  mismatch.

  KNOWN_OPEN records that cross-surface capitalisation and button casing are
  gated nowhere and that the frames are the instrument, so this is the
  instrument reading rather than a re-derivation of Q-34, which concerns mode
  names only.
- Where fixable: `frontend/src/lib/i18n/prose.ts:128` and `:129`, with `:122`
  and `:130` for the sibling control names and `:204` for the social variant.
  Not locked.
- Proposed fix: make the body refer to the control in the same casing the
  heading uses, or upper-case the guide headings to match the controls they
  describe. One rule, applied to `Spin`, `Features` and `Autoplay` together.

---

## STT-MOBILES-B-06 MEDIUM The `©` and `™` glyphs in the paytable disclaimer fall back to a different family from the brand face around them

- Frames: `reports/screens/stream-test-2026-07-28/340_mobile-s_paytable_09_disclaimer.png`
- Claim: the closing sentences read `Future Spinner™ and We Roll Spinners™ are
  trademarks of We Roll Spinners. © 2026 We Roll Spinners. All rights reserved.`
  On the frame the `©` is drawn as a true circular ring, while the `o` of `Roll`
  two words earlier on the same line is the brand face's flat-sided rounded
  rectangle, so the two are not from the same drawing. The `™` shows a narrow
  `M` with a pointed centre vertex against the brand face's wide, square,
  monoline `W` in `We` on the same line. Both are the system-fallback signature
  that the standing mandate names explicitly in its machine-tell list.

  The two codepoints are hardcoded as escapes and are the only U+00A9 and
  U+2122 in `frontend/src`:

  ```
  + ' Future Spinner™ and We Roll Spinners™ are trademarks of We Roll Spinners.'
  + ' © 2026 We Roll Spinners. All rights reserved.'
  ```

  The glyph-family judgement is a rendered-pixel comparison, signed as such; the
  codepoints are source-confirmed.

  This is not KNOWN_OPEN Q-07: Q-07 allowlists the `∞` on the autoplay infinite
  option, a different glyph on a different surface, reviewed and kept.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:62-63`. Not
  locked.
- Proposed fix: check the shipped `@fontsource` subset for U+00A9 and U+2122 and
  widen the subset if the face carries them; if it does not, drop `™` after
  first mention and set the notice line in a face that does. Compliance note:
  fonts are self-hosted via `@fontsource` only, so this cannot be fixed by
  adding an external web font.

---

## STT-MOBILES-B-07 MEDIUM Scrolling panels clip player-visible prose through the middle of its glyphs, with no fade mask

- Frames: `reports/screens/stream-test-2026-07-28/340_mobile-s_paytable_09_disclaimer.png`
  (the line `loss limit you choose is reached, and can` is sliced horizontally
  just under the sticky `PAYTABLE` header rule, leaving only the lower half of
  every glyph),
  `reports/screens/stream-test-2026-07-28/338_mobile-s_paytable_07_interface_guide.png`
  (the heading `Autoplay` is cut through its descenders by the panel's own
  bottom border, which runs straight through the `p` and the `y`),
  `reports/screens/stream-test-2026-07-28/346_mobile-s_dialog_buy_overdrive.png`
  and `348_mobile-s_dialog_nitro_overdrive.png` (the `WHAT YOU GET` box clips a
  line at the top and another at the bottom, the lower one landing directly on
  the magenta rule of the stats strip).
- Claim: at every one of these boundaries a string is cut mid-glyph rather than
  faded or masked, so half-letters sit hard against a border line. On a
  scrolling surface that is the difference between a panel that reads as
  designed and one that reads as broken. None of the clipped strings is a money
  figure, so this is outside TR-115 / TR-086.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:594`
  (`overflow-y: auto` on the scroll region, with no `mask-image`). The
  equivalent scroll region in `frontend/src/lib/components/BuyBonus.svelte` was
  not located line-precisely: UNKNOWN for that half. Neither file is locked.
- Proposed fix: add a `mask-image: linear-gradient(...)` fade of about 16 px at
  the top and bottom of both scroll regions, so a partially scrolled line fades
  out instead of being guillotined.

---

## STT-MOBILES-B-08 MEDIUM The win-line readout under the reels is illegible at 320x568, and the string it renders has an unconditional plural and a letter `x`

- Frames: `reports/screens/stream-test-2026-07-28/359_mobile-s_post_feature_base.png`,
  `341_mobile-s_transition_paytable_closing.png`,
  `349_mobile-s_transition_feature_entry_fade.png`,
  `350_mobile-s_feature_entry_card.png`,
  `351_mobile-s_transition_feature_starting.png`,
  `352_mobile-s_feature_run_1.png` through `357_mobile-s_feature_run_6.png`,
  `358_mobile-s_transition_feature_exit.png`,
  `363_mobile-s_post_collect_base.png`
- Claim: the strip below the reels carries a per-win readout, for example
  `M3 x5 8 ways $16.20` in frame `341` and `L2 x5 1 ways $2.00` in frame `359`.
  Measured off the frames at native scale the glyph band occupies about five
  pixels of vertical height, and at 6x magnification the letterforms are still
  not separable, so the string is present and unreadable. A readout no player
  can read should be sized up or not drawn.

  Two defects inside that same string, both source-confirmed rather than read
  off pixels too small to be sole evidence:

  1. The plural is unconditional. `<span class="wb-ways">{current.ways} ways</span>`
     has no singular branch, so a one-way win renders `1 ways`, which is what
     frame `359` shows.
  2. The multiplier is a letter `x`, not U+00D7:
     `<span class="wb-count">x{current.kind}</span>`. Two surfaces away the buy
     dialog writes `1×, 3× or 10×` correctly, so the two disagree.

  The declared sizes are `font-size: 0.7rem` on the plate face and `0.62rem` on
  `.wb-ways`; the rendered five pixels is smaller than either implies, so the
  strip is being scaled down by an ancestor. That ancestor was not identified,
  and the mechanism is therefore stated as measured rather than derived.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:94` (plural),
  `:93` (the `x`), `:136` and `:146` (the two font sizes). The ancestor scale:
  UNKNOWN. Not locked.
- Proposed fix: pluralise with `{current.ways === 1 ? 'way' : 'ways'}` and
  change `x{current.kind}` to `×{current.kind}` in the same edit, since they are
  two adjacent lines; then either raise the plate's font size under a narrow
  viewport rule or suppress the strip below about 400 px, once the ancestor
  scale is identified.

---

## STT-MOBILES-B-09 LOW The max win overlay tells a 320x568 touch player to `HIT ENTER`, and the wholesale upper-casing destroys the emphasis the source string was written with

- Frames: `reports/screens/stream-test-2026-07-28/361_mobile-s_maxwin_celebration.png`,
  `reports/screens/stream-test-2026-07-28/360_mobile-s_transition_maxwin_overlay_fade.png`
- Claim: the overlay reads `PRESS COLLECT OR HIT ENTER TO CONTINUE` on a
  320x568 viewport, where there is no Enter key. The source string is
  `maxWinHint:  'Press COLLECT or hit Enter to continue'`, that is, sentence
  case with `COLLECT` deliberately raised to mark the button name, and the
  surface then applies `text-transform: uppercase` to the whole line, which
  flattens the author's distinction to nothing. Writing emphasis into a string
  and then transforming the string is a tell that two passes disagreed about
  where casing lives. The keyboard route the hint describes is real on desktop
  (`if (show && e.key === 'Enter') collect()`), which is why the string exists,
  but nothing narrows it for touch.
- Where fixable: `frontend/src/lib/i18n/prose.ts:83` for the string,
  `frontend/src/lib/components/MaxWinCelebration.svelte:355` for the
  `text-transform: uppercase` on `.c1-hint`, and `:79` for the Enter handler the
  hint describes. Not locked. The string itself is OWNER-PARKED under Q-16 for
  localisation, so only the casing and the keyboard reference are in play here.
- Proposed fix: drop the `text-transform` so the authored casing shows, and gate
  the `hit Enter` clause on a pointer or viewport query so touch sessions read
  `Press COLLECT to continue`.

---

## Explicit absences, signed

Each of these is a category I looked for across all 26 frames and did not find.
The check that lets me say so is stated.

- **No money pod clipped, ellipsised or overflowed in this range.** I read every
  money figure rendered in the 26 frames and each is complete inside its pod:
  `$50,000.00` (BALANCE, frames 341, 349 to 359, 362, 363), `$16.20`, `$0.00`,
  `$325.35`, `$363.89`, `$5,000.00` (WIN), `$10.80` and `$2.80` (TOTAL WIN),
  `$1.00` (BET and SPIN COST), `$100.00` and `$400.00` (PRICE). The widest,
  `$50,000.00`, sits inside its pod with clear margin at 320 px. Nothing in my
  range is fresh evidence for TR-115 / TR-086.
- **No straight-versus-curly quote mixing.** There is no apostrophe and no
  quotation mark anywhere in the player-visible prose of these 26 frames. I
  transcribed the full interface guide (338), the responsible play and
  disclaimer bodies (339, 340), the autoplay labels (342), both mode card blurbs
  (343, 344), both buy dialog bodies (345 to 348) and the max win overlay (360,
  361), and none contains either character.
- **No em dash and no en dash in player-visible prose.** The only dash-shaped
  glyphs in the range are the hyphen in `pre-revved` (frames 347, 348) and the
  minus symbol on the bet decrement button (343, 344), which is a control glyph
  and not prose.
- **No double spaces found.** I compared inter-word gaps against inter-letter
  gaps in the two longest prose blocks, the disclaimer (340) and the interface
  guide (338), at 4x to 6x magnification; every word gap in those blocks falls
  in one narrow band, so no doubled space is present in the rendered text. This
  is a rendered-pixel check, not a source check, and is signed as such.
- **No currency or decimal format disagreement on any one screen.** Every money
  figure in the range is `$` plus comma-grouped thousands plus exactly two
  decimals, and every percentage is `96.35%` with two decimals. The multiplier
  formats do differ from each other (`5,000×`, `1×`, `100×`, `5x`, `x5`), and
  that is carried by findings 01 and 08 and by KNOWN(Q-26) below rather than
  signed off here.
- **A sentence-case error I suspected and retracted.** The Cruise card blurb
  looked on first read like `A smoother ride. more frequent smaller wins`, a
  full stop followed by a lower-case word. Magnified 5x it is a colon, and
  `prose.ts:88` confirms `'A smoother ride: more frequent smaller wins, same
  96.35% RTP.'` Recorded because a squad that reports only what it kept is not
  showing its working.
- **No shimmy found on a non-`.fs-num` numeric surface, with a stated limit on
  what that can mean.** My range contains no count-up on a non-`.fs-num` surface
  with a changing digit COUNT, so I cannot sign the shimmy category the way a
  big-win squad could, and I am not claiming to. What I can sign is that every
  static numeric surface I read holds even digit pitch: the BALANCE pod holds
  `$50,000.00` at identical glyph positions across frames 341, 349, 350, 351,
  352, 353, 354, 355, 356, 357, 358, 359, 362 and 363, and the free spins
  counter renders `16` (349 to 357) and `8` (362, 363) centred without the
  surrounding pod moving.
- **No font-family leak other than finding 06 and the allowlisted `∞`.** Every
  other glyph in the 26 frames, including all numerals, the currency symbols,
  the `%`, the `+`, the `?` and the `!`, is drawn in the project's own faces. I
  compared stroke weight, terminal shape and counter form against neighbouring
  brand-face glyphs on the same line in each case.
- **No letter-spacing or weight difference between two instances of one
  component.** The two buy confirm dialogs (346, 348) match each other on
  tracking and weight in every element except the title casing already reported
  as finding 02; the two mode cards (344) match each other; the nine paytable
  section headers visible across 338, 339 and 340 share one tracking.
- **No placeholder or lorem string survived into any of these frames.** Every
  visible string is real product copy.

## KNOWN matches

- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/348_mobile-s_dialog_nitro_overdrive.png`
  renders the NITRO blurb's `5x` with a letter `x` sitting on the baseline,
  while two lines below it, in the SAME view, the prose writes `1×, 3× or 10×
  total bet.` with the raised U+00D7, and the same dialog's own subtitle writes
  `400× your bet?`. So the row's defect is not merely cross-surface: a player
  reading one dialog top to bottom sees both glyphs.

  **Fresh evidence that corrects the row's own text, offered to the marshal
  rather than opened as a new id.** Q-26 states the survivors are *in
  `fsModes.ts`*. They are not. `frontend/src/lib/config/fsModes.ts` contains no
  letter-`x` multiplier at all; its `FS_MAX_WIN_LABEL` at `:139` is `'5,000×'`,
  correctly signed. The real locations are
  `frontend/src/lib/i18n/prose.ts:90` (`1.6x` and `1.25x`, two in one string),
  `:94` (`5x`), and the social duplicate at `:189` (`1.6x` and `1.25x` again),
  plus every locale copy in `frontend/src/lib/i18n/prose.locales.ts`, of which
  `:44`, `:120`, `:196` and `:272` are four. That is the same shape as MID-02:
  a row written to record an incomplete sweep is itself pointed at the wrong
  file, so anyone fixing it from the row alone would search a file with nothing
  in it and close the row.
- KNOWN(Q-16): `reports/screens/stream-test-2026-07-28/342_mobile-s_autoplay_menu.png`
  shows the parked autoplay labels on a stream surface: `Stop on win`, `Single
  win limit`, `Stop on feature`, `Loss limit`, header `SPINS`. Frames `338`,
  `339` and `340` show the parked paytable headers `INTERFACE GUIDE`,
  `RESPONSIBLE PLAY` and `DISCLAIMER`. Frames `360` and `361` show `PRESS
  COLLECT OR HIT ENTER TO CONTINUE`. This session is `en`, so none is a
  localisation defect here; they are recorded as confirmation that the parked
  strings do reach captured stream surfaces, which is the fact KNOWN_OPEN asks
  the localised squads to establish.
- KNOWN(Q-07): `reports/screens/stream-test-2026-07-28/342_mobile-s_autoplay_menu.png`
  shows the `∞` on the infinite spins option rendering in its fallback face, as
  reviewed, kept and allowlisted. Recorded so the font-family absence above is
  not read as a miss. Not a finding.
- KNOWN(Q-34): `reports/screens/stream-test-2026-07-28/344_mobile-s_features_menu.png`
  shows the mode card reading `Cruise` in Title Case. The HUD badge that reads
  `CRUISE` is not in my frame range, so this evidences one side of the row only.

tree_after: transcribed verbatim in the structured return for this squad. At the
time of writing, the only entry attributable to this squad is its own untracked
shard at `reports/qa/stream_test/shards/STT-MOBILES-B.md`; no tracked file was
modified or deleted by this run.
