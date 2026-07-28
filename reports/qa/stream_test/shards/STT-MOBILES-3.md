# STT-MOBILES-3, typography (mobile-s, frames 347 to 363, 1600px upscaled)

supersedes: STT-MOBILES-B.md (partially. That shard's scope was 338 to 363; this
shard re-runs 347 to 363 only. Frames 338 to 346 of STT-MOBILES-B belong to a
sibling re-run squad and are untouched here.)

scope: the 17 `mobile-s` frames numbered 347 to 363 inclusive, viewport 320x568,
lang `en`, read from
`/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`, which is the
committed set at `reports/screens/stream-test-2026-07-28/` resampled to 1600px
height. Frame numbering is identical in both directories. Nothing was written to
`reports/screens/`.

frames_read: 17

CARRY-FORWARD NOTE FOR THE MARSHAL. The findings section below carries only what
is NEW at 1600px or materially changed. Every STT-MOBILES-B finding marked
CONFIRMED in the reconciliation section stands unchanged and must be consolidated
under its ORIGINAL id, not dropped because the native shard was superseded. Three
verdicts are REFINED, one contains an outright REFUTED half, and one carries a
severity change from LOW to MEDIUM. In each case the text below is the operative
one.

TWO OF MY OWN PIXEL READINGS WERE REFUTED BY SOURCE IN STEP 3 AND ARE CORRECTED
IN PLACE, not quietly dropped: the win strip does carry a space in `1 ways`, and
the max win separator mechanism is `tabular-nums`, not TR-089's per-digit boxes.
Both corrections are marked where they occur.

---

## STT-MOBILES-3-01 HIGH The win-line strip prints raw internal symbol codes, because the lookup written to prevent exactly that maps all eight paying symbols to themselves

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/349_mobile-s_transition_feature_entry_fade.png`,
  `.../350_mobile-s_feature_entry_card.png`,
  `.../354_mobile-s_feature_run_3.png`,
  `.../355_mobile-s_feature_run_4.png`,
  `.../356_mobile-s_feature_run_5.png`,
  `.../359_mobile-s_post_feature_base.png` (six frames rendering a token of the
  shape `L2`), `.../363_mobile-s_post_collect_base.png` (rendering `M3`), against
  `.../351_mobile-s_transition_feature_starting.png`,
  `.../352_mobile-s_feature_run_1.png`,
  `.../353_mobile-s_feature_run_2.png`,
  `.../357_mobile-s_feature_run_6.png`,
  `.../358_mobile-s_transition_feature_exit.png` (five frames rendering the word
  `SCATTER`).
- Claim: the per-win readout under the reels names its symbol with the maths
  package's internal reel-strip code when the symbol is a paying tile, and with an
  English word when it is the scatter. Across my seventeen frames the first token
  is `L2` on six, `M3` on one and `SCATTER` on five.

  The source shows this is not an oversight in the wiring but an unfinished
  table. `frontend/src/lib/components/WinBreakdown.svelte:15-18`:

  ```
  const SYMBOL_IDS: Record<string, string> = {
    H1: 'H1', H2: 'H2', M1: 'M1', M2: 'M2', M3: 'M3',
    L1: 'L1', L2: 'L2', L3: 'L3',
  }
  ```

  Every one of the eight entries maps a code to itself. The lookup exists, is
  populated, is consulted, and is a no-op. `:19-24` then routes only the two
  special symbols through the translation layer:

  ```
  if (id === 'W') return t('symbolWild')
  if (id === 'S') return t('symbolScatter')
  return SYMBOL_IDS[id] ?? raw
  ```

  which is why `SCATTER` is a word and `L2` is not. The comment immediately above
  the table at `:14` reads `tr layer like every other player-visible word`, so the
  intent is recorded in the file and only half executed. This is a placeholder
  that survived, which the standing mandate names explicitly in its machine-tell
  list, painted under the reels for the whole of every win.

  Signed as a rendered-pixel reading of the FIRST TOKEN ONLY. The money figure at
  the end of the same strip is not reliably separable even at 1600px and is not
  transcribed anywhere in this shard.
- Resolution note: NEW AT 1600PX. At native 320x568 the strip's glyph band is
  about five device pixels tall. The superseded native shard reached this same
  component (STT-MOBILES-B-08) and reported `M3` and `L2` as ordinary content,
  because at thumbnail scale a code and a word are the same grey smear.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:15-18` for the
  identity table, `:19-24` for `symbolLabel`, `:92` for the render site. Not
  locked.
- Proposed fix: give the eight paying symbols real display names through the same
  `tr` layer that already serves `symbolWild` and `symbolScatter`, so the table
  stops being an identity map. If the project has not yet decided on player-facing
  names for H1 to L3, PARK the naming and suppress the token rather than shipping
  the code, because a code on screen is worse than no token.

---

## STT-MOBILES-3-02 MEDIUM The two feature HUD pods put their values on different baselines, because each cell stacks independently and only one label wraps

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/349_mobile-s_transition_feature_entry_fade.png`,
  `.../350_mobile-s_feature_entry_card.png`,
  `.../351_mobile-s_transition_feature_starting.png`,
  `.../352_mobile-s_feature_run_1.png` through
  `.../357_mobile-s_feature_run_6.png`,
  `.../362_mobile-s_transition_maxwin_collect_fade.png`,
  `.../363_mobile-s_post_collect_base.png`
- Claim: the pod pair below the reel window sets `OVERDRIVE FREE SPINS` on the
  left and `TOTAL WIN` on the right. At 320px the left label wraps to two lines,
  `OVERDRIVE FREE` and then an orphaned `SPINS`, while the right label fits one
  line. The two values then sit at different heights: on
  `.../350_mobile-s_feature_entry_card.png` the value `16` is roughly one third of
  its own cap height lower than `$10.80` beside it, and on
  `.../363_mobile-s_post_collect_base.png` the value `8` is the same distance
  lower than `$2.80`. Same component, same size, same row, and a viewer reads a
  step where there should be a line.

  The mechanism is in the markup. `frontend/src/lib/components/BonusInstrumentColumn.svelte:66-75`
  puts each label and value inside its own `.pm-cell`:

  ```
  <div class="pm-cell" data-testid="odometer">
    <span class="pm-label">{$tr('overdriveFreeSpins')}</span>
    <span class="pm-value cyan">{spinsRemaining}</span>
  </div>
  ```

  and the sibling cell at `:71-74` does the same for `totalWin`. The two cells are
  independent stacks inside `.pm-strip` (`:219`), each with its own
  `align-items: center` (`.pm-cell`, `:232`, with the rule at `:237`), so a label
  that wraps grows only its own cell and pushes only its own value down. Nothing
  in the file makes the label row a shared track.
- Resolution note: NEW AT 1600PX. A five to six device pixel baseline step at
  native capture scale is inside the noise of a 242-token thumbnail.
- Where fixable: `frontend/src/lib/components/BonusInstrumentColumn.svelte:219`
  (`.pm-strip`), `:232` and `:237` (`.pm-cell`), `:247` (`.pm-label`), with the
  markup at `:66-75`. Not locked.
- Proposed fix: make `.pm-strip` a two-row grid with the labels on row one and the
  values on row two, so a wrapped label grows the label track for both cells and
  the values stay on one baseline. A `min-height` of two lines on `.pm-label` is
  the one-property version and would also work.

---

## STT-MOBILES-3-03 MEDIUM The feature's own name is cased four ways, and one authored sentence capitalises one game noun while lower-casing the other

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/347_mobile-s_transition_dialog_nitro_overdrive_opening.png`,
  `.../348_mobile-s_dialog_nitro_overdrive.png` (two treatments on one card),
  `.../350_mobile-s_feature_entry_card.png`,
  `.../363_mobile-s_post_collect_base.png` (the two remaining treatments)
- Claim: on the NITRO OVERDRIVE buy card the prose line reads `Start Overdrive
  Free Spins now at 400x your bet?` in title case, and four lines below it inside
  the same bordered box the same feature is called `free spins` in lower case,
  within `3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1x,
  3x or 10x total bet.` That sentence raises `Scatters` to an initial capital
  while lower-casing `free spins`.

  The opposite convention is in the source, in a sibling string in the same block.
  `frontend/src/lib/i18n/prose.ts:86`:

  ```
  modeNormalBlurb:    'Standard play. Overdrive Free Spins trigger on 3+ scatters.'
  ```

  Title case on the feature, lower case on the scatter. So the two nouns are cased
  in opposite directions in two strings that sit in one block and render on
  adjacent surfaces. There is no styling rule that could reconcile them, because
  the casing is written into the literals.

  Two further treatments appear on the feature entry card: the reel-window title
  is `OVERDRIVE FREE SPINS` in cyan with wide tracking, and the HUD pod label
  directly beneath it is `OVERDRIVE FREE SPINS` again, at the same instant on the
  same screen, in mauve at a visibly tighter tracking and heavier weight, wrapped
  to two lines. Four renderings of one name across seventeen frames, two of them
  simultaneous and two of them six words apart.
- Resolution note: NEW AT 1600PX. Body copy in a 320px dialog is not readable at
  all at native capture scale, so no native pass could have compared these
  strings.
- Where fixable: `frontend/src/lib/i18n/prose.ts:86` (`modeNormalBlurb`) and
  `:94` (`modeSuperBlurb`) are the two verified literals; the `WHAT YOU GET`
  bullet carrying `Scatters ... free spins` is not in `prose.ts` and per KNOWN_OPEN
  Q-26 lives in `frontend/src/lib/config/fsModes.ts`, UNKNOWN at line precision. The
  simultaneous duplicate rendering is
  `frontend/src/lib/components/FreeSpinsPresentation.svelte:120` for the in-reel
  title against
  `frontend/src/lib/components/BonusInstrumentColumn.svelte:68` for the pod label.
  None locked.
- Proposed fix: PARK(the direction is a brand naming call, and it is the same
  ruling STT-MOBILES-B-02 and KNOWN_OPEN Q-34 already want; three rulings on
  casing should be one). The mechanical half needs no ruling: the two strings on
  the buy card must at least agree with each other.
- NOTE RAISED, NOT CLAIMED, found while locating the above:
  `frontend/src/lib/components/FreeSpinsPresentation.svelte:120` reads
  ``` $: entryTitleText = isNitroEntry ? 'NITRO OVERDRIVE' : t(lang, 'overdriveFreeSpins', mode) ```
  so the NITRO branch of the feature entry title is a hardcoded English literal
  that bypasses the locale route the other branch uses. That is the TR-104 shape
  on a new surface. It is a LOCALISATION finding on a lens and a session that
  cannot judge it, so it is handed to the `de` and `ar` squads rather than
  counted here.

---

## STT-MOBILES-3-04 MEDIUM `tabular-nums` on the max win hero gives the thousands comma a full figure advance, so `5,000` reads with a gap either side of the separator

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/361_mobile-s_maxwin_celebration.png`,
  `.../360_mobile-s_transition_maxwin_overlay_fade.png`, against
  `.../348_mobile-s_dialog_nitro_overdrive.png` and
  `.../347_mobile-s_transition_dialog_nitro_overdrive_opening.png`
- Claim: on the held MAX WIN celebration the separator in `5,000` occupies a slot
  about the width of a digit. Measured off
  `.../361_mobile-s_maxwin_celebration.png` at 1600px, the gap between the `5` and
  the comma and the gap between the comma and the first `0` are each roughly twice
  the gap between adjacent zeros, so the hero figure reads as `5 , 000`. The same
  string `5,000x` in the buy dialog stats strip on
  `.../348_mobile-s_dialog_nitro_overdrive.png` sets its comma with normal
  proportional spacing. One session, one figure, two spacings, and the loose one
  is on the biggest surface in the game.

  MECHANISM, AND A CORRECTION TO MY OWN FIRST WRITE-UP. I attributed this to
  TR-089's per-digit 0.834em box mechanism. That is WRONG and the source refutes
  it. `frontend/src/lib/components/MaxWinCelebration.svelte:239` is:

  ```
  .fs-num { font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }
  ```

  and the hero at `:155` is
  ``` <span class="c1-max-mult fs-num">5,000</span><span class="c1-max-x">×</span> ```.
  So the mechanism is the OpenType `tnum` feature, which in this face gives the
  comma a figure-width advance along with the digits. Same symptom, different
  cause, and the fix is different too, which is why the correction matters rather
  than being cosmetic.

  THIS IS NOT THE TR-089 CARVE-OUT, on either reading. TR-089 closes `.fs-num`
  shimmy during the win count-up. This is static separator spacing on a figure
  that never animates: `5,000` is a hardcoded literal at `:155`, not a bound
  value, so there is no count-up here at all and tabular figures buy nothing.
- Resolution note: NEW AT 1600PX. The comma is about two device pixels wide at
  native capture scale.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:155` (the
  hero span) and `:239` (the `.fs-num` rule). Not locked.
- Proposed fix: drop `fs-num` from `.c1-max-mult` at `:155`. The figure is a
  static literal, tabular alignment has nothing to align against, and removing the
  class restores the face's proportional comma. This is a smaller and safer change
  than altering the shared `.fs-num` rule, which five components declare
  independently and which the count-up surfaces genuinely need.

---

## Native pass reconciliation

Reconciled against `reports/qa/stream_test/shards/superseded/STT-MOBILES-B.md`,
scope frames 338 to 363. Verdicts cover only findings with evidence inside 347 to
363.

`reports/qa/stream_test/shards/superseded/STT-MOBILES-A.md` covers frames 312 to
337, entirely outside my range. **All twelve STT-MOBILES-A findings belong to a
sibling squad and are NOT reconciled here.** Named so the gap is visible rather
than silent: A-01, A-02, A-03, A-04, A-05, A-06, A-07, A-08, A-09, A-10, A-11,
A-12. I note only that A-05 and A-06 concern the same `WinBreakdown` strip my
3-01 reaches, so whoever consolidates should expect them to converge.

- **STT-MOBILES-B-01** (`5,000×BET` as one unbroken token, the sign set near twice
  the size of `BET`), frames 360 and 361, inside my range. **CONFIRMED.** At
  1600px the three spans are unambiguously one token: no optical space between the
  numerals and the sign, none between the sign and `BET`. The size claim is
  confirmed as visible and not merely computed, the sign overshooting the cap
  height of `BET` by roughly its own half-height. Source at
  `MaxWinCelebration.svelte:155` and `:158` matches the quoted markup exactly. One
  addition, not a correction: there are THREE sizes in the lockup, since the
  numerals are larger again than the sign, and the three sit on three different
  optical centres.

- **STT-MOBILES-B-02** (five bet-mode display names disagree on case; the same
  dialog renders `Buy Overdrive` then `NITRO OVERDRIVE`). **REFINED.** The half
  inside my range is confirmed twice over: frames 347 and 348 render
  `NITRO OVERDRIVE` in unambiguous upper case at 1600px, and
  `frontend/src/lib/i18n/prose.ts:91-93` carries `modeBonusLabel: 'Buy Overdrive'`
  against `modeSuperLabel: 'NITRO OVERDRIVE'`, which I read independently. The
  contrasting `Buy Overdrive` FRAME is 345 and 346, outside my range, so the
  rendered half of the pairing is the sibling squad's to confirm. The finding
  spans two ranges and should not be consolidated on my evidence alone.

- **STT-MOBILES-B-03** (FEATURES bet bar wraps, `$1.00` printed twice at two
  sizes), frames 343 and 344. **Outside my range.** No verdict.

- **STT-MOBILES-B-04** (buy dialog `MAX WIN` stat wraps to three lines beside two
  one-line siblings), frames 347 and 348 inside my range. **CONFIRMED.** On frame
  348 the strip reads `PRICE` `$400.00`, `RTP` `96.35%`, `MAX WIN` `5,000x` then
  `base` then `bet`: three lines against one and one, and the three values share
  no baseline. Two refinements, neither contradicting it. First, the native shard
  transcribed the price as `$100.00` because it read frame 346; on frame 348, the
  NITRO tier, it is `$400.00`, and the wrap is identical at both, so the defect is
  not price-length dependent and the proposed narrow-viewport font step must be
  sized for the wider price. Second, the wrap is what drives the strip's height,
  and the strip's height is what causes the body clipping filed separately as
  B-07, so B-04 and the buy-dialog half of B-07 are ONE mechanism and should be
  consolidated as one row.

- **STT-MOBILES-B-05** (`Features` heading against `FEATURES` in its own body
  copy), primary frame 338, outside my range. **Partially reconcilable only, no
  verdict on the whole.** The corroborating half inside my range is confirmed: the
  base HUD control reads `FEATURES` in upper case on
  `.../358_mobile-s_transition_feature_exit.png` and
  `.../359_mobile-s_post_feature_base.png`. The `Features` heading is on frame
  338.

- **STT-MOBILES-B-06** (the copyright and trademark glyphs falling back to another
  family), frame 340. **Outside my range.** No verdict. Recorded rather than
  omitted because it is exactly the class this re-run exists to judge and my range
  does not contain the frame that carries it, so someone must be asked to.

- **STT-MOBILES-B-07** (scrolling panels clip prose mid-glyph, no fade mask).
  **REFINED, WITH ONE HALF REFUTED.** The half inside my range is the buy dialog,
  frames 347 and 348. CONFIRMED for the BOTTOM boundary: on both frames the line
  `The Overdrive meter starts at 1x and rises +1x after every winning` is followed
  by a second line reduced to roughly its top third, guillotined flat against the
  magenta rule of the stats strip, with no fade and no scroll affordance.
  **REFUTED for the top boundary.** The native claim is that the `WHAT YOU GET`
  box "clips a line at the top and another at the bottom". At 1600px there is no
  top clip on either frame: the box's first content is the heading
  `WHAT YOU GET`, rendered whole with clear space above it, and the first body
  line below it is whole as well. The top-clip half is a native-resolution false
  positive and must not reach the ledger. The bottom-clip half stands and is real.

- **STT-MOBILES-B-08** (win-line readout illegible, unconditional plural, letter
  `x`), frames 349 to 359 and 363 inside my range. **REFINED. Four parts, four
  verdicts.**
  1. Unconditional plural: **CONFIRMED, and the native transcription was right
     where mine was wrong.** `WinBreakdown.svelte:94` is
     ``` <span class="wb-ways">{current.ways} ways</span> ```, so a one-way win
     renders `1 ways`. My own pixel reading at 1600px suggested the numeral and
     the word were unspaced, `1ways`. **That reading was wrong**, an artefact of
     the `1` glyph's side bearing, and the source refutes it. The plural is the
     defect; the spacing is not, and no spacing claim should reach the ledger.
  2. Letter `x` rather than the multiplication sign: **CONFIRMED AT SOURCE, NOT
     CONFIRMABLE FROM PIXELS.** `WinBreakdown.svelte:93` is
     ``` <span class="wb-count">x{current.kind}</span> ```, an ASCII `x`, read
     independently by me. The glyph itself is NOT distinguishable from U+00D7 at
     1600px, and any squad claiming to have read it off these frames is
     over-claiming. Worth flagging to the marshal: this is a third site of the
     MID-02 class, outside both `fsModes.ts` and `WinBanner.svelte`, which is
     further evidence for MID-02's own point that Q-26's enumeration is
     incomplete.
  3. Illegibility: **REFINED, and the native shard overstated its own
     measurement.** It writes that "at 6x magnification the letterforms are still
     not separable". At 1600px the tokens `SCATTER`, `L2`, `M3` and `ways` ARE
     separable. The core finding stands, because 1600px is an upscale no player
     ever gets and the strip is genuinely too small at 320x568, but the specific
     "not separable at magnification" claim is wrong as written.
  4. The transcribed money figures: **STRUCK.** The native shard puts
     `M3 x5 8 ways $16.20` and `L2 x5 1 ways $2.00` into its claim as read
     figures. The money field is not resolvable even at 1600px; what I read on
     frame 359 does not match `$2.00` and I decline to offer a replacement,
     because I cannot resolve it either. Those two figures should be removed from
     the claim rather than carried forward as transcriptions.

     The separability the native pass did not have is precisely what produced my
     STT-MOBILES-3-01, which it could not have seen.

- **STT-MOBILES-B-09** (`HIT ENTER` on a touch viewport; upper-casing destroys the
  authored emphasis), frames 360 and 361, inside my range. **CONFIRMED, WITH A
  SEVERITY CHANGE FROM LOW TO MEDIUM AND ONE ADDITION.** The line renders
  `PRESS COLLECT OR HIT ENTER TO CONTINUE` across two lines on both frames. The
  addition, which is the reason for the change: **this same session already
  renders the correct touch idiom.** The feature entry card on frames 350, 351,
  352 to 357 and 363 reads `TAP TO CONTINUE`. So the game holds two continue
  prompts at one viewport, one addressed to a finger and one to a keyboard, eleven
  frames apart, and the fix needs no new string written, only the idiom the
  product already uses. A defect the product has solved once and then contradicted
  is not LOW. Separately, at 1600px the hint's grey is low enough against the
  particle field that parts of the second line are hard to read even at upscale,
  which no native pass could have judged.

---

## Explicit absences, signed

Signed against my seventeen frames only, 347 to 363, at 1600px. Each line says
what was looked at, so the absence is checkable rather than asserted.

- **No non-brand font leak and no system-default fallback on any of the seventeen
  frames.** The session runs a consistent two-family system: a squared display
  face for headings, control labels, pod labels and every numeric readout, and a
  rounded techno face for dialog body prose. Checked on every heading
  (`NITRO OVERDRIVE`, `WHAT YOU GET`, `MAX WIN REACHED!`), every control label
  (`COLLECT`, `SPIN`, `MAX`, `FEATURES`, `TAP TO CONTINUE`), every pod label and
  every numeral in range. The fallback STT-MOBILES-B-06 reports is on frame 340,
  which my range does not contain, so this absence does not contradict it.
- **No currency or decimal format disagreement anywhere in the range.** Every
  money figure across all seventeen frames uses a leading `$` with no space, a
  comma thousands separator and exactly two decimals: `$400.00`, `$50,000.00`,
  `$10.80`, `$2.80`, `$1.00`, `$0.00`, `$325.35`, `$363.89`, `$5,000.00`. Checked
  pod by pod on frames 349, 350, 358, 359, 362 and 363, and cell by cell on the
  buy dialog stats strip on 347 and 348. The single percentage, `96.35%`, sets no
  space before the sign, and there is no second percentage in range to disagree
  with it.
- **No mixed straight and curly quotation marks, because there are no quotation
  marks at all** on any of the seventeen frames. Checked all dialog prose, all
  headings and the max win hint.
- **No em dash and no en dash in any player-visible string in range.** Checked
  every prose line on frames 347, 348, 360 and 361, which are the only frames in
  range carrying sentences.
- **No double space visible in any rendered string.** Checked the four prose lines
  on the buy card and the two lines of the max win hint. Signed as a rendered
  reading with a stated limit: a doubled space is not always separable from
  tracking even at 1600px, and this is one of the two places where upscale is
  still not source.
- **No ellipsis and no truncation marker anywhere in range.** No string in the
  seventeen frames terminates in a three-dot or single-glyph ellipsis.
- **No money-display fit failure in range, so nothing here is fresh evidence for
  TR-115 / TR-086.** `$50,000.00` is the longest money figure in the session and
  it fits its pod with clear side bearing on frames 349 to 357, 358, 359, 362 and
  363. `$400.00` fits its stat cell on 347 and 348, though close to the divider
  rule. The only string in range that fails to fit is `5,000x base bet`, which is
  a multiplier plus a noun phrase and not money, and is reconciled under B-04.
- **No numeral width change through a count-up, and I sign NO claim in either
  direction about count-up shimmy on this session.** My range contains no count-up
  sequence: the big-win count-up frames are 324 to 326, a sibling squad's. The only
  consecutive numeric change in range is the `WIN` pod from `$325.35` on frame 358
  to `$363.89` on frame 359, which is two settled rounds rather than two frames of
  one animation. Those two figures do occupy the same advance width with the `$`
  at the same x, which is consistent with the tabular setting but is not a shimmy
  test and is not offered as one.
- **No text reflow between a transition frame and its settled frame.** Checked
  three pairs: 347 against 348 (buy dialog mid-open against held, type identical
  in size, position and line breaks), 349 against 350 (entry card mid-fade against
  held), and 362 against 363 (collect fade against post-collect, where the whole
  layout is scaled by roughly one and a half per cent mid-transition and no string
  rewraps or changes line count through it).
- **Not signed, recorded as unresolved per convention (l.6):** whether the buy
  dialog's stat values (`$400.00`, `96.35%`) are set in the same family as the HUD
  money readouts. They appear at different sizes on different screens and I could
  not settle it at 1600px. I am recording it as unresolved rather than claiming
  either answer, and it is the one typography question in my range that a higher
  upscale or a DOM read would close.

---

## KNOWN matches

- **KNOWN(Q-26)**, with fresh evidence and a sharper instance than the row
  describes. Frames
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/348_mobile-s_dialog_nitro_overdrive.png`
  and `.../347_mobile-s_transition_dialog_nitro_overdrive_opening.png`. The NITRO
  OVERDRIVE buy card carries the row's class inside one bordered box, three lines
  apart: `frontend/src/lib/i18n/prose.ts:94` is
  ``` modeSuperBlurb: 'Buy a rich entry with the Overdrive meter pre-revved to 5x.' ```,
  the letter `x` the row enumerates, rendering directly below a paragraph writing
  `1x, 3x or 10x total bet` and directly below the prose `400x your bet?`. The
  value this adds to the row is that the class is not only spread across surfaces:
  it is visible in a single view on a single card, which lifts it from a
  consistency item to something a viewer can see without comparing screens. Glyph
  identity per instance is a source reading, not a pixel reading.

- **KNOWN(Q-16 park)**, fresh evidence that a parked string is on stream. Frames
  `.../360_mobile-s_transition_maxwin_overlay_fade.png` and
  `.../361_mobile-s_maxwin_celebration.png` render
  `PRESS COLLECT OR HIT ENTER TO CONTINUE`, one of the strings the Q-16 park
  enumerates. The park stays parked; this is the visibility evidence the row asks
  for. The other defects in that same string, the keyboard idiom on a touch
  viewport and the casing, are NOT the park and are reconciled under B-09.

- **No KNOWN(TR-115 / TR-086) match in range.** Stated rather than omitted: I
  looked for money fit failures specifically and found none, per the absences.

- **No KNOWN(MID-01) and no KNOWN(MID-02) match in range.** MID-01 needs the
  big-win count-up triple and MID-02 needs the win banner unit; neither surface is
  on frames 347 to 363. The max win hero on 360 and 361 is `MaxWinCelebration`,
  which MID-02 records as already corrected to U+00D7 under Q-12, and
  `MaxWinCelebration.svelte:155` confirms it renders `×`. My finding there is the
  separator spacing, not the glyph. Related but filed under B-08 above rather than
  as a KNOWN: `WinBreakdown.svelte:93` is a THIRD site of the MID-02 letter-`x`
  class, in neither of the two files MID-02 names.

- **No KNOWN(TR-104), KNOWN(TR-114), KNOWN(Q-27), KNOWN(Q-34) or KNOWN(Q-07) match
  in range.** TR-104 needs a localised big-win banner; TR-114 needs a replay
  surface; Q-27 needs a link or unstyled surface and none reaches these frames;
  Q-34 needs `Cruise` against `CRUISE` and neither string is in range; Q-07's
  infinity glyph is on the autoplay panel, frame 342.

---

## Source files opened in STEP 3

Six, within budget, all read as text by `grep -n` and `sed -n` ranges and none
executed: `WinBreakdown.svelte`, `MaxWinCelebration.svelte`,
`BonusInstrumentColumn.svelte`, `FreeSpinsPresentation.svelte`, `i18n/prose.ts`,
and `config/fsModes.ts` (grep only, nothing located). No project script was run.
No locked path was read or written. Every `file:line` above was read by me at the
current working tree except the four the superseded shard supplies for
`BuyBonus.svelte`, which are cited as attested by that squad and labelled so.
