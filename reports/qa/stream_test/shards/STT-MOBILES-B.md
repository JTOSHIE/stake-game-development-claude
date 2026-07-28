# STT-MOBILES-B, typography (mobile-s, frames 338 to 363)

scope: the 26 `mobile-s` frames numbered 338 to 363 inclusive, viewport 320x568,
lang `en`, from `reports/screens/stream-test-2026-07-28/`. Frame paths below are
repository relative from that same directory root, matching the ledger's
convention. Every frame in the range was opened once with the Read tool; none
outside the range was opened.

frames_read: 26

Findings are numbered in severity order, worst first. Where a claim rests on a
glyph identity that is only a few pixels tall, the pixel evidence is stated and
the specification check is marked as the confirming step, per convention (l.2).

---

## STT-MOBILES-B-01 HIGH The max win headline unit renders as one unbroken token, `5,000×BET`, and sets `×` larger than the `BET` it joins

- Frames: `reports/screens/stream-test-2026-07-28/361_mobile-s_maxwin_celebration.png`,
  `reports/screens/stream-test-2026-07-28/360_mobile-s_transition_maxwin_overlay_fade.png`
- Claim: on the held MAX WIN celebration, the most watched surface in the game,
  the unit beside the amount reads `5,000×BET`. There is no space between the
  numeral group `5,000` and the multiplication sign, and no space between that
  sign and the word `BET`, so the three parts read as a single token. On top of
  that the `×` and the `BET` are set at two different sizes within one unit: the
  `×` rises visibly above the cap height of `BET`, which means the sign belongs
  to a larger run than the word it modifies. The rest of this session spaces the
  same construction: the features mode card writes `1× bet` with a space
  (`reports/screens/stream-test-2026-07-28/344_mobile-s_features_menu.png`), and
  the buy dialogs write `100× your bet?` and `400× your bet?` with a space
  (`346_mobile-s_dialog_buy_overdrive.png`, `348_mobile-s_dialog_nitro_overdrive.png`).
  So the celebration is the one place the space is missing, and it is the one
  place a stream audience is looking.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:172-176`
  (the `.mw-x` span carries `font-size: 0.42em` while the sibling `.mw-unit`
  `BET` carries `font-size: 0.3em`, and the two spans sit adjacent with no
  separating text node). Not locked.
- Proposed fix: give `.mw-x` and `.mw-unit` the same `font-size`, and separate
  them with a space or a small `margin-inline-start`, so the unit reads
  `5,000× BET`.

---

## STT-MOBILES-B-02 HIGH The five bet-mode display names disagree on case, and one dialog component renders `Buy Overdrive` on one frame and `NITRO OVERDRIVE` on the next

- Frames: `reports/screens/stream-test-2026-07-28/346_mobile-s_dialog_buy_overdrive.png`
  (title `Buy Overdrive`),
  `reports/screens/stream-test-2026-07-28/348_mobile-s_dialog_nitro_overdrive.png`
  (title `NITRO OVERDRIVE`),
  `reports/screens/stream-test-2026-07-28/344_mobile-s_features_menu.png`
  (cards `Normal` and `Cruise`),
  and the two mid-open transitions that show the same titles,
  `345_mobile-s_transition_dialog_buy_overdrive_opening.png` and
  `347_mobile-s_transition_dialog_nitro_overdrive_opening.png`.
- Claim: this is one component rendering one field, and the field's values are
  not cased to one rule. `Normal`, `Cruise` and `Buy Overdrive` are Title Case;
  `NITRO OVERDRIVE` is upper case; the fifth mode name recorded in `CLAUDE.md`
  is `OVERBOOST`, also upper case. Two of five shout and three do not. Because
  the casing lives in the strings rather than in a `text-transform`, no styling
  rule reconciles them, and the confirm dialog therefore changes its own
  typographic voice between two consecutive player actions. This is NOT
  KNOWN_OPEN Q-34: Q-34 is one mode name (`Cruise`) differing between surfaces
  through a `text-transform` present on one surface class and absent on three.
  This is the mode-name SET differing from itself inside a single surface.
- Where fixable: `frontend/src/lib/config/fsModes.ts:33,50,67,84,101`, the
  `label` fields (`'Normal'`, `'Cruise'`, `'OVERBOOST'`, `'Buy Overdrive'`,
  `'NITRO OVERDRIVE'`). Not locked.
- Proposed fix: PARK(the direction is a brand naming call, exactly as Q-34's is,
  and the two should be ruled on together rather than separately). The mechanical
  part is trivial either way: five string literals in one file, or one
  `text-transform` on the shared name class.

---

## STT-MOBILES-B-03 HIGH The FEATURES bet stepper wraps, orphaning the `BET` label from its value and printing `$1.00` twice on one row at two different type sizes

- Frames: `reports/screens/stream-test-2026-07-28/344_mobile-s_features_menu.png`,
  `reports/screens/stream-test-2026-07-28/343_mobile-s_transition_features_menu_opening.png`
- Claim: the header row of the FEATURES panel reads, on line one,
  `SPIN COST` `$1.00` `BET` and then the decrement control; and on line two, a
  second `$1.00` and the increment control. The stepper has broken across two
  lines, so its minus and plus sit on different rows, and the label `BET` is
  left on the row above the value it names. The typographic consequence is that
  the same figure, `$1.00`, appears twice within one bordered box at two clearly
  different type sizes, measured off the frame at roughly 8 px and 13 px cap
  height, which reads as two different quantities rather than one restated. At
  320 px this is the first thing a player sees on opening FEATURES.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:414-460`
  (`.fm-betbar` is a flex row with `gap` and no wrap control; its children are
  `.fm-spincost`, the `BET` label, and the two stepper buttons). Not locked.
- Proposed fix: give the bet bar `flex-wrap: nowrap` with a reduced gap below
  about 360 px, or move `BET` and its value into one `flex` group so the stepper
  can only wrap as a unit.

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
  three times taller than its content needs and the three values share no
  baseline. This is not a money display: the value is a multiplier plus a noun
  phrase, so it is outside the TR-115 / TR-086 class, which is money pods
  specifically.
- Where fixable: `frontend/src/lib/components/BuyConfirmDialog.svelte:255-263`
  (`.bc-stat-value` in a three-column grid at a fixed `font-size`, with the
  string built as `` `${FS_MAX_WIN_LABEL} base bet` ``). Not locked.
- Proposed fix: shorten the third value to `5,000×` and move `base bet` into the
  cell's own label (`MAX WIN, BASE BET`), or drop the third cell's font size by
  one step below 360 px so all three sit on one line.

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
  one referent, two casings, six words apart. The same guide names the spin
  control `Spin` while the control itself reads `SPIN`, and names `Autoplay`
  while the panel header in the same document set reads `SPINS` in upper case.
  KNOWN_OPEN records that cross-surface capitalisation and button casing are
  gated nowhere and that the frames are the instrument, so this is recorded as
  the instrument reading rather than as a re-derivation of Q-34, which concerns
  mode names only.
- Where fixable: `frontend/src/lib/components/Paytable.svelte:487-520`, the
  `INTERFACE_GUIDE` entries (`title: 'Features'` beside
  `body: 'Open the FEATURES menu to pick a bet mode or buy the feature.'`). Not
  locked.
- Proposed fix: make the body refer to the control by the same casing the
  heading uses, or set the guide headings in upper case to match the controls
  they describe. One line either way, but pick one rule and apply it to `Spin`
  and `Autoplay` at the same time.

---

## STT-MOBILES-B-06 MEDIUM The `©` and `™` glyphs in the paytable disclaimer fall back to a different family from the brand face around them

- Frames: `reports/screens/stream-test-2026-07-28/340_mobile-s_paytable_09_disclaimer.png`
- Claim: the closing sentences read `Future Spinner™ and We Roll Spinners™ are
  trademarks of We Roll Spinners. © 2026 We Roll Spinners. All rights reserved.`
  The `©` is drawn as a true circular ring, while the `o` of `Roll` two words
  earlier in the same line is the brand face's flat-sided rounded rectangle, so
  the two are not from the same drawing. The `™` shows a narrow `M` with a
  pointed centre vertex, against the brand face's wide, square, monoline `W` in
  `We` on the same line. Both are the classic system-fallback signature that the
  standing mandate names explicitly in its machine-tell list. This is not
  KNOWN_OPEN Q-07: Q-07 allowlists the `∞` on the autoplay infinite option, a
  different glyph on a different surface, and that one is reviewed and kept.
- Where fixable: `frontend/src/lib/components/Paytable.svelte:566-571`
  (`DISCLAIMER_BODY`, which is the only string in the tree carrying U+00A9 and
  U+2122) with the font stack applied by `.pt-body`. Not locked.
- Proposed fix: subset the two codepoints into the shipped self-hosted face if
  it carries them, or replace them with `(c)` and drop `™` after the first
  mention, which is the usual studio answer. Note the compliance rule: fonts are
  self-hosted via `@fontsource` only, so this cannot be fixed by adding a web
  font.

---

## STT-MOBILES-B-07 MEDIUM Scrolling panels clip player-visible prose through the middle of its glyphs, with no fade mask, at both the header edge and the panel border

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
  scrolling surface this is the difference between a panel that reads as
  designed and one that reads as broken. None of the clipped strings is a money
  figure, so this is outside TR-115 / TR-086.
- Where fixable: `frontend/src/lib/components/Paytable.svelte:604-612`
  (`.pt-scroll`, `overflow-y: auto` with no mask) and
  `frontend/src/lib/components/BuyConfirmDialog.svelte:214-221` (`.bc-detail`,
  the same shape). Not locked.
- Proposed fix: add a `mask-image: linear-gradient(...)` fade of about 16 px at
  the top and bottom of both scroll regions, so a partially scrolled line fades
  out instead of being guillotined.

---

## STT-MOBILES-B-08 MEDIUM The win-line readout under the reels renders at about 5 px glyph height on 320x568 and is not legible

- Frames: `reports/screens/stream-test-2026-07-28/359_mobile-s_post_feature_base.png`,
  `341_mobile-s_transition_paytable_closing.png`,
  `349_mobile-s_transition_feature_entry_fade.png`,
  `350_mobile-s_feature_entry_card.png`,
  `351_mobile-s_transition_feature_starting.png`,
  `352_mobile-s_feature_run_1.png` through `357_mobile-s_feature_run_6.png`,
  `358_mobile-s_transition_feature_exit.png`,
  `363_mobile-s_post_collect_base.png`
- Claim: the strip below the reels carries a per-win readout of the form
  `<symbol> <multiplier> <count> ways <amount>`, for example `M3 x5 8 ways
  $16.20` in frame `341` and `L2 x5 1 ways $2.00` in frame `359`. Measured off
  the frames at native scale the glyph band occupies about 5 px of vertical
  height, and at 6x magnification the letterforms are still not separable, so
  the string is present but unreadable at this viewport. A readout no player can
  read is a readout that should either be sized up or not drawn.
  Two further observations that follow from the same string and are recorded so
  the fix can address them together: the count and the noun do not agree
  (`1 ways` in frame `359`, confirmed against the source below rather than
  against the pixels, which are too small to be sole evidence), and the
  multiplier here is written with a letter `x` where the buy dialog two surfaces
  away writes `1×, 3× or 10×` with U+00D7.
- Where fixable: `frontend/src/lib/components/WinLineLabel.svelte:88-96`
  (`font-size: clamp(6px, 1.1vw, 11px)`, which floors at 6 px, and the template
  `` `${sym} x${mult} ${ways} ways ${amount}` ``). Not locked.
- Proposed fix: raise the clamp floor to about 10 px and let the strip wrap or
  abbreviate below that; pluralise with `${ways === 1 ? 'way' : 'ways'}`; and
  change the `x` to `×` in the same edit, since it is the same template literal.

---

## STT-MOBILES-B-09 LOW The max win overlay instructs a 320x568 touch player to `HIT ENTER`, and the wholesale upper-casing destroys the emphasis the source string was written with

- Frames: `reports/screens/stream-test-2026-07-28/361_mobile-s_maxwin_celebration.png`,
  `reports/screens/stream-test-2026-07-28/360_mobile-s_transition_maxwin_overlay_fade.png`
- Claim: the overlay reads `PRESS COLLECT OR HIT ENTER TO CONTINUE` on a
  320x568 viewport, where there is no Enter key. Separately, and this is the
  typographic half: KNOWN_OPEN Q-16 quotes the source string as `Press COLLECT
  or hit Enter to continue`, that is, sentence case with `COLLECT` deliberately
  raised to mark the button name. The surface then applies `text-transform:
  uppercase` to the whole string, which flattens the author's distinction to
  nothing, so the one word that was meant to stand out no longer does. Writing
  emphasis into a string and then transforming the string is a tell that two
  people, or two passes, disagreed about where casing lives.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:189` for
  the string and `:246` for the `text-transform` on `.mw-hint`. Not locked. The
  string itself is OWNER-PARKED under Q-16 for localisation, so only the casing
  and the keyboard reference are in play here.
- Proposed fix: drop the `text-transform` and let the authored casing show, and
  gate the `hit Enter` clause on a pointer or viewport query so touch sessions
  read `Press COLLECT to continue`.

---

## Explicit absences, signed

Each of these is a category I looked for across all 26 frames and did not find.
The check that lets me say so is stated.

- **No money pod clipped, ellipsised or overflowed in this range.** I read every
  money figure rendered in the 26 frames and each one is complete inside its
  pod: `$50,000.00` (BALANCE, frames 341, 349 to 359, 362, 363), `$16.20`,
  `$0.00`, `$325.35`, `$363.89`, `$5,000.00` (WIN), `$10.80` and `$2.80` (TOTAL
  WIN), `$1.00` (BET and SPIN COST), `$100.00` and `$400.00` (PRICE). Nothing in
  my range is fresh evidence for TR-115 / TR-086. The widest figure,
  `$50,000.00`, sits inside its pod with clear margin at 320 px.
- **No straight-versus-curly quote mixing.** There is no apostrophe and no
  quotation mark anywhere in the player-visible prose of these 26 frames. I
  transcribed the full interface guide (338), the responsible play and
  disclaimer bodies (339, 340), the autoplay labels (342), both mode card blurbs
  (343, 344), both buy dialog bodies (345 to 348) and the max win overlay (360,
  361) and none contains either character.
- **No em dash and no en dash in player-visible prose.** The only dash-shaped
  glyphs in the range are the hyphen in `pre-revved` (frames 347, 348), the
  hyphen in `320x568`-shaped numerals nowhere, and the minus symbol on the bet
  decrement button (343, 344), which is a control glyph and not prose.
- **No double spaces found.** I compared inter-word gaps against inter-letter
  gaps in the longest prose blocks, the disclaimer (340) and the interface guide
  (338), at 4x to 6x magnification; every word gap in those blocks is within the
  same narrow band, so no doubled space is present in the rendered text. This is
  a rendered-pixel check, not a source check, and is signed as such.
- **No currency or decimal format disagreement on any one screen.** Every money
  figure in the range is `$` plus comma-grouped thousands plus exactly two
  decimals, and every percentage is `96.35%` with two decimals. The multiplier
  formats do differ from each other (`5,000×`, `1×`, `100×`, `5x`, `x5`) and
  that is covered by finding 01, finding 08 and KNOWN(Q-26) below rather than
  signed off here.
- **No shimmy found on a non-`.fs-num` numeric surface, with a stated limit on
  what that can mean.** My range contains no count-up sequence on a non-`.fs-num`
  surface with a changing digit COUNT, so I cannot sign the shimmy category the
  way a big-win squad could. What I can sign is that every static numeric surface
  I read renders at even digit pitch: the BALANCE pod holds `$50,000.00` at
  identical glyph positions across frames 341, 349, 350, 351, 352, 353, 354, 355,
  356, 357, 358, 359, 362 and 363, and the free spins counter renders `16`
  (349 to 357) and `8` (362, 363) centred without the surrounding pod moving.
- **No font-family leak other than finding 06 and the allowlisted `∞`.** Every
  other glyph in the 26 frames, including all numerals, all currency symbols,
  the `%`, the `+`, the `?` and the `!`, is drawn in the project's own faces:
  I compared stroke weight, terminal shape and counter form against neighbouring
  brand-face glyphs on the same line in each case.
- **No placeholder or lorem string survived into any of these frames.** Every
  visible string is real product copy.

## KNOWN matches

- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/348_mobile-s_dialog_nitro_overdrive.png`
  renders the NITRO blurb's `5x` with a letter `x` sitting on the baseline,
  while two lines below it, in the SAME view, the prose writes `1×, 3× or 10×
  total bet.` with the raised U+00D7. The row's enumerated `5x` in `fsModes.ts`
  is therefore not merely inconsistent across surfaces, it is inconsistent
  inside one dialog a player is reading top to bottom. Same frame also carries
  `100× your bet?` and `400× your bet?` correctly signed, which sharpens the
  contrast. Fresh evidence, urgency raised, no new id opened.
- KNOWN(Q-16): `reports/screens/stream-test-2026-07-28/342_mobile-s_autoplay_menu.png`
  shows the parked autoplay labels on a stream surface: `Stop on win`, `Single
  win limit`, `Stop on feature`, `Loss limit`, header `SPINS`. Frames `338`,
  `339` and `340` show the parked paytable headers `INTERFACE GUIDE`,
  `RESPONSIBLE PLAY` and `DISCLAIMER`. Frames `360` and `361` show `PRESS
  COLLECT OR HIT ENTER TO CONTINUE`. This session is `en`, so none of these is a
  localisation defect here; they are recorded as confirmation that the parked
  strings do reach captured stream surfaces, which is the fact KNOWN_OPEN asks
  the localised squads to establish.
- KNOWN(Q-07): `reports/screens/stream-test-2026-07-28/342_mobile-s_autoplay_menu.png`
  shows the `∞` on the infinite spins option rendering in its fallback face, as
  reviewed, kept and allowlisted. Recorded so the absence above is not read as a
  miss. Not a finding.
- KNOWN(Q-34): `reports/screens/stream-test-2026-07-28/344_mobile-s_features_menu.png`
  shows the mode card reading `Cruise` in Title Case. The HUD badge that reads
  `CRUISE` is not in my frame range, so this evidences one side of the row only.

tree_after:
```
?? reports/qa/stream_test/shards/STT-MOBILES-B.md
```
(recorded at the end of the run; see the run's final `git status --porcelain`
output, transcribed verbatim in the structured return)
