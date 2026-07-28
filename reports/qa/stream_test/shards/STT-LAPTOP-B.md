# STT-LAPTOP-B, TYPOGRAPHY (laptop session, frames 079 to 104)

scope: every `laptop` session frame numbered 079 to 104 inclusive, 26 frames, viewport
`1024x576`, lang `en`, per `reports/screens/stream-test-2026-07-28/MANIFEST.json`. Every
one opened with the Read tool and looked at. No frame outside the range was opened.

frames_read: 26

**A CORRECTION NOTICE, AT THE TOP WHERE IT CANNOT BE MISSED.** My first pass, written
from the frames alone before any source was read, claimed a letter `x` on four surfaces:
the HUD `MULTIPLIER` pod, the paytable `MAX WIN` pod, the max win celebration unit, and
the features menu cost lines. **All four were wrong.** Each of those four renders
`×` (U+00D7), verified by codepoint: `BonusInstrumentColumn.svelte:105`
(`{multiplier}×`, hexdump `c3 97`), `fsModes.ts:139` (`FS_MAX_WIN_LABEL = '5,000×'`),
`MaxWinCelebration.svelte:155` (`<span class="c1-max-x">×</span>`), and
`FeatureMenu.svelte:372, 422, 427, 480` (`{m.cost}×`). At the sizes these render on a
`1024x576` frame, `×` and `x` are not reliably distinguishable by eye, and I distinguished
them wrongly four times out of four. **No claim below asserts a codepoint from a rendered
frame.** Every glyph claim that survives is anchored to a `file:line` and a codepoint, and
the frames are cited only for what they show, which is that two forms appear together.
This also means I have **withdrawn a KNOWN(MID-02) match** I had recorded against frames
`101` and `102`: that surface uses `×`, so it is not MID-02.

---

## STT-LAPTOP-B-01 STREAM The buy confirm dialog shows no CONFIRM and no CANCEL control, and the NITRO variant has its symbol strip cut in half

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/087_laptop_dialog_buy_overdrive.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/089_laptop_dialog_nitro_overdrive.png`, and both opening transitions `086_laptop_transition_dialog_buy_overdrive_opening.png` and `088_laptop_transition_dialog_nitro_overdrive_opening.png`.

- Claim: on both settled buy dialogs the card's magenta bottom border sits immediately
  under the three-up stat strip (`PRICE` / `RTP` / `MAX WIN`) and there is no `CONFIRM`
  and no `CANCEL` anywhere in the card. The controls exist in the markup:
  `BuyBonus.svelte:141-146` renders `<div class="buy-actions">` holding
  `<button class="buy-cancel">` and `<button class="buy-confirm" data-testid="buy-confirm">`
  directly after the stat row at `:135`. So what the frames show is the card exceeding the
  `1024x576` viewport, not a dialog built without buttons. The sizing rule is
  `BuyBonus.svelte:174`, `width: min(94vw, 460px); max-height: 90dvh; overflow-y: auto`.
  The NITRO variant carries one extra paragraph and the extra height is visible as damage:
  in `087` the five symbol tiles above the stat strip render whole, in `089` the same five
  tiles are bisected horizontally by the strip. A viewer watching a streamer open NITRO
  OVERDRIVE sees a row of half symbols and a purchase confirmation with nothing to confirm
  with. The modal does scroll, so the buttons are reachable, but no scroll affordance is
  visible in either frame.

- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:174` (the height budget) and `frontend/src/lib/components/BuyBonus.svelte:141-146` (the actions row that falls below it). Not locked.

- Proposed fix: PARK(a height budget that holds at 576px across two variants of different
  content length is a layout decision, not a small edit). Reported outside the typography
  lens because it is STREAM grade and a stream-lens audit that saw this and said nothing
  would be the worse error.

---

## STT-LAPTOP-B-02 HIGH Charter row Q-26 names the wrong file, so the letter-`x` class it tracks is unactionable as written, and there are six live literals rather than four

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/084_laptop_transition_features_menu_opening.png`, `085_laptop_features_menu.png` (the OVERBOOST card), `088_laptop_transition_dialog_nitro_overdrive_opening.png`, `089_laptop_dialog_nitro_overdrive.png` (the NITRO dialog).

- Claim: `KNOWN_OPEN.md` row **Q-26** reads *"Multiplication sign as letter `x` in
  `fsModes.ts` blurbs (`1.6x`, `1.25x` twice, `5x`)"*. `fsModes.ts` no longer contains any
  of them in player-visible code. `grep -n "[0-9]x" frontend/src/lib/config/fsModes.ts`
  returns exactly four hits and all four are **comment prose**: lines `145`, `146`, `152`
  and `163`. A Wave 3 fixer following the row to that file would find only commentary and
  could reasonably close the row as already done.

  The blurbs moved to `frontend/src/lib/i18n/prose.ts` and the letter `x` moved with them.
  Six live literals, not four, because the real-money and social branches each carry their
  own copy:

  | Line | Literal, verbatim |
  |---|---|
  | `prose.ts:90` | ``modeOverboostBlurb: 'Double-chance: about 1.6x the feature trigger rate. Debits 1.25x every spin while ON.'`` |
  | `prose.ts:94` | ``modeSuperBlurb: 'Buy a rich entry with the Overdrive meter pre-revved to 5x.'`` |
  | `prose.ts:189` | ``modeOverboostBlurb: 'Double-chance: about 1.6x the feature trigger rate. Costs 1.25x every spin while ON.'`` |
  | `prose.ts:192` | ``modeSuperBlurb: 'Get a rich entry with the Overdrive meter pre-revved to 5x.'`` |

  **What the frames add, and it is the part that matters**: both glyphs render on the same
  card at the same moment. On `085` the OVERBOOST card shows the blurb `Debits 1.25x every
  spin while ON.` (`prose.ts:90`) about 30px above its own cost line `1.25× per spin while
  ON · $1.25` (`FeatureMenu.svelte:422`, `{m.cost}× per spin while ON`). One card, one
  number, two glyphs. On `089` the NITRO dialog shows `pre-revved to 5x.` (`prose.ts:94`)
  three lines above `starts at 1× and rises +1×` (`translations.ts:1540-1541`). This is
  not a cross-screen inconsistency a player would have to remember; it is a same-glance
  contradiction.

  One further instance outside both Q-26 and MID-02, recorded with its caveat:
  `WinBreakdown.svelte:93` renders the win-line count as `<span class="wb-count">x{current.kind}</span>`,
  an ASCII `x` (byte `0x78`), visible as `x5` on `082`, `x4` on `083` and `x3` on `104`.
  The caveat is that `x5` there means "five of a kind" rather than a multiplication, so
  whether it belongs to the class is an art call rather than a mechanical one.

- Where fixable: `frontend/src/lib/i18n/prose.ts:90,94,189,192` (not locked), plus the row text in `docs/QUALITY_CHARTER.md` (Q-26, cited at `KNOWN_OPEN.md` line 20 as `QUALITY_CHARTER.md:198`). `frontend/src/lib/components/WinBreakdown.svelte:93` for the caption instance.

- Proposed fix: change the four prose literals to `×`, and rewrite Q-26 to cite
  `prose.ts` with the correct count. MID-02 already records that Q-26's enumeration was
  built by searching the config and prose layers and not the components; this shard adds
  that it is now not even pointing at the right config file.

---

## STT-LAPTOP-B-03 MEDIUM `5,000× base bet` wraps to two lines in the buy dialog MAX WIN pod, orphaning `bet`, in a place where the same fit failure was already found and fixed elsewhere

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/086_laptop_transition_dialog_buy_overdrive_opening.png`, `087_laptop_dialog_buy_overdrive.png`, `088_laptop_transition_dialog_nitro_overdrive_opening.png`, `089_laptop_dialog_nitro_overdrive.png`.

- Claim: in the three-up stat strip the `PRICE` value (`$100.00`, `$400.00`) and the `RTP`
  value (`96.35%`) each occupy one line, while the `MAX WIN` value breaks as
  `5,000× base` on line one with an orphaned `bet` on line two. The three cells therefore
  do not share a baseline and the strip reads as three boxes of two different heights.
  The value comes from `fsModes.ts:158`,
  ``return social ? `${FS_MAX_WIN_LABEL} base play` : `${FS_MAX_WIN_LABEL} base bet` ``,
  rendered at `BuyBonus.svelte:135`.

  **The same string has already failed the same way on another surface, and the record
  says so**: `PaytableModal.svelte:334-335` carries the comment *"Rendering "5,000x base
  bet" as the value clipped it to "5,000x ba..." on every card, hiding the very"*, and
  `fsModes.ts:163` repeats it as *"and clipped it to "5,000x ba..." on every card at
  1280x720"*. The paytable was fixed by shortening its value to `FS_MAX_WIN_LABEL`. The
  buy dialog kept the long form and now wraps instead of clipping, which is the same
  defect wearing a different coat. This is a multiplier plus two words rather than a
  currency amount, so it is not the TR-115 / TR-086 money-fit class.

- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:135` (the consumer) or `frontend/src/lib/config/fsModes.ts:158` (the label builder). Neither locked.

- Proposed fix: give the three stat cells a fixed height with the value vertically
  centred so a wrap cannot break the baseline, and move `base bet` into the label
  (`MAX WIN VS BASE BET`) so the value stays one token. Note that `fsModes.ts:182` records
  that moving `base bet` into the label was tried once before under TR-037, so read that
  note before repeating the attempt.

---

## STT-LAPTOP-B-04 MEDIUM The win-line caption reads `1 ways` for a single way, from an unconditional hardcoded plural

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/083_laptop_autoplay_menu.png` (`L3  x4  1 ways  $0.20`), `090_laptop_transition_feature_entry_fade.png`, `091_laptop_feature_entry_card.png`, `092_laptop_transition_feature_starting.png`, `096_laptop_feature_run_4.png`, `097_laptop_feature_run_5.png`, `100_laptop_post_feature_base.png` (all `L2  x5  1ways  $0.80`), `104_laptop_post_collect_base.png` (`M3  x3  1ways  $0.20`). Eight of my 26 frames.

- Claim: `WinBreakdown.svelte:94` is
  ``<span class="wb-ways">{current.ways} ways</span>``. The noun is a bare literal with no
  plural rule, so a single-way win prints `1 ways`. The same caption prints correctly at
  higher counts (`8 ways` on `082_laptop_transition_paytable_closing.png`, `5 ways` on
  `093_laptop_feature_run_1.png`), which is what makes the singular case read as
  machine-generated rather than as a house style. Recorded beside it: the literal is also
  **hardcoded English** on a player-visible surface, and it is not among the roughly 35
  keys the Q-16 park enumerates, so it is a survivor of that list as well as a grammar
  defect.

- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:94`. Not locked.

- Proposed fix: `{current.ways} {current.ways === 1 ? 'way' : 'ways'}` as the immediate
  correction, and add the noun to the locale table so the string stops being a second
  Q-16 survivor.

---

## STT-LAPTOP-B-05 MEDIUM The same term takes two casings across two surfaces, and three casings inside one dialog block

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/086_laptop_transition_dialog_buy_overdrive_opening.png`, `087_laptop_dialog_buy_overdrive.png`, `088_laptop_transition_dialog_nitro_overdrive_opening.png`, `089_laptop_dialog_nitro_overdrive.png`, against `084_laptop_transition_features_menu_opening.png` and `085_laptop_features_menu.png`.

- Claim: the trigger symbol is capitalised on one surface and not on the other.
  `translations.ts:1540` reads
  ``rulesOverdriveTrigger: '3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1×, 3× or 10× total bet.'``
  with a capital `S`, and it renders in the buy dialog on `087` and `089`. `prose.ts:86`
  reads ``modeNormalBlurb: 'Standard play. Overdrive Free Spins trigger on 3+ scatters.'``
  with a lower case `s`, and it renders on the features menu on `085`. The two surfaces are
  two clicks apart. `translations.ts:1542` repeats the capital form
  (`'3 or more Scatters during free spins award +5 free spins.'`).

  Inside the one `WHAT YOU GET` block on `087` the feature itself is named three ways in
  four lines: `Buy a guaranteed Overdrive Free Spins entry.` (title case), then
  `award 8, 12 or 16 free spins` (lower case plural), then `after every winning free spin`
  (lower case singular). This is the machine-tell the standing mandate names in its own
  words, *capitalisation that changes between two screens showing the same word*.

- Where fixable: `frontend/src/lib/i18n/translations.ts:1540,1542` and `frontend/src/lib/i18n/prose.ts:86`. Neither locked, but `translations.ts` carries sixteen locale copies of each key, so see the fix note.

- Proposed fix: settle one house rule (`Overdrive Free Spins` as the proper noun,
  `scatters` and `free spins` lower case as common nouns) and apply it. Small in the
  English source; PARK(the sixteen-locale sweep of the same decision is TR-091 sized).

---

## STT-LAPTOP-B-06 MEDIUM The interface guide writes the same referent two ways in one list, and neither matches its own row title

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/079_laptop_paytable_07_interface_guide.png`.

- Claim: two rows of one list share a sentence shape and capitalise the referent
  differently. `prose.ts:129` is
  ``guideFeaturesDesc: 'Open the FEATURES menu to pick a bet mode or buy the feature.'``
  and `prose.ts:133` is
  ``guideMenuDesc: 'Open the menu for the paytable and sound settings.'``. On the frame
  these sit four rows apart under row titles rendered as `Features` and `Menu`, so neither
  body matches its own heading and the two bodies do not match each other. The social
  branch repeats the uppercase form at `prose.ts:204`.

- Where fixable: `frontend/src/lib/i18n/prose.ts:129,133` and the social copy at `:204`. Not locked.

- Proposed fix: write both referents to match their row titles (`Features menu`, `Menu`),
  or both in uppercase. Either is defensible; mixing them in one list is not.

---

## STT-LAPTOP-B-07 MEDIUM A CSS uppercase transform on the max win hint destroys the deliberate key-name capitalisation inside the string

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/101_laptop_transition_maxwin_overlay_fade.png`, `102_laptop_maxwin_celebration.png`.

- Claim: the frames render `PRESS COLLECT OR HIT ENTER TO CONTINUE` in flat uppercase.
  The source string is `prose.ts:83`,
  ``maxWinHint: 'Press COLLECT or hit Enter to continue'``, in which the capitals on
  `COLLECT` and `Enter` are load-bearing: they name the on-screen button and the keyboard
  key and separate them from the surrounding prose. `MaxWinCelebration.svelte:355` applies
  `text-transform: uppercase` to `.c1-hint`, which erases that distinction, so every word
  now carries equal weight and reads as a key name. The evidence that the transform is the
  cause and not the string is on the same overlay: the button beside it is labelled
  `COLLECT`, and in the hint `COLLECT` is now indistinguishable from `PRESS`.

- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:355`. Not locked.

- Proposed fix: drop `text-transform: uppercase` from `.c1-hint` and let the authored
  casing render, keeping the letter-spacing. One property.

---

## STT-LAPTOP-B-08 MEDIUM The `BUY FEATURES` section header lands exactly on the scroll boundary and renders horizontally bisected at the panel's resting position

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/085_laptop_features_menu.png` (phase `state`, the settled menu), same damage already present mid-open in `084_laptop_transition_features_menu_opening.png`.

- Claim: at the resting scroll position on a `1024x576` viewport, the gold section header
  `BUY FEATURES` (`FeatureMenu.svelte:459`, ``{$tr('buyFeaturesHeading')}``) renders with
  only the top part of its glyphs visible, cut horizontally by the bottom edge of the
  scrolling card list. The mechanism is the scroll container, `FeatureMenu.svelte:873-877`,
  `.fm-cards { flex: 1 1 auto; min-height: 0; overflow-y: auto; ... }`, with the footer
  below it at `:1001` as a `flex-shrink: 0` sibling rather than an overlay. So this is a
  scroll boundary and not an occlusion bug, which is why it is filed at MEDIUM rather than
  higher. It is still a defect on the inspection test: the panel a player opens to buy the
  feature greets them with half a word, the two buy tiers are entirely below the fold, and
  the thin scrollbar (`scrollbar-width: thin`, `:878`) is not visible in either frame, so
  nothing on screen says there is more. This is a non-money string, so it is not
  TR-115 / TR-086.

- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:873-877`. Not locked.

- Proposed fix: add `scroll-padding-block-end` plus a bottom padding on `.fm-cards` sized
  to about one card, so the boundary never lands mid-glyph and a partial card always shows
  as the scroll cue instead of a bisected heading.

---

## STT-LAPTOP-B-09 MEDIUM The two continue gates disagree in verb and register, and one uses a touch verb on a mouse-and-keyboard viewport

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/090_laptop_transition_feature_entry_fade.png`, `091_laptop_feature_entry_card.png`, `092_laptop_transition_feature_starting.png`, `093_laptop_feature_run_1.png`, `094_laptop_feature_run_2.png`, `095_laptop_feature_run_3.png`, `096_laptop_feature_run_4.png`, `097_laptop_feature_run_5.png`, `098_laptop_feature_run_6.png`, `104_laptop_post_collect_base.png` (ten frames, all `TAP TO CONTINUE`), against `101_laptop_transition_maxwin_overlay_fade.png` and `102_laptop_maxwin_celebration.png` (`PRESS COLLECT OR HIT ENTER TO CONTINUE`).

- Claim: the game has exactly two explicit continue gates and they are written by two
  different hands. `translations.ts:1548` is ``featureContinue: 'TAP TO CONTINUE'``, a
  three-word all-caps button label using the touch verb `TAP`, rendered at
  `FreeSpinsPresentation.svelte:475` on a `1024x576` laptop session whose input devices are
  a mouse and a keyboard. `prose.ts:83` is
  ``maxWinHint: 'Press COLLECT or hit Enter to continue'``, a seven-word hint using
  `PRESS` and naming a keyboard key. Nothing in the frames distinguishes the two
  interactions. The component's own comments call the first gate a
  **`CLICK TO CONTINUE` gate** three times (`FreeSpinsPresentation.svelte:207`, `:462`,
  `:663`) and cite an owner audit for it, so the source itself does not agree with the
  string it ships.

- Where fixable: `frontend/src/lib/i18n/translations.ts:1548` for the English value; the same key exists in all sixteen locales and every one of them uses a touch verb (`TIPPEN` de `:1600`, `TOCA` es `:1626`, `KOSKETTAMALLA` fi `:1652`, `TOUCHEZ` fr `:1678`, and so on). Not locked.

- Proposed fix: PARK(a verb change here is a sixteen-locale key change on a celebration
  surface, which is the TR-104 and TR-091 size class, and choosing between `PRESS`,
  `CLICK` and a device-conditional string is an art call). Note for the owner that the
  component comments already say `CLICK`, so the intended word may simply never have
  reached the locale table.

---

## STT-LAPTOP-B-10 LOW The max win celebration is a third unit form for the max win, beyond the two the ROUND 4 ruling reconciled

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/101_laptop_transition_maxwin_overlay_fade.png`, `102_laptop_maxwin_celebration.png`, against `080_laptop_paytable_08_responsible_play.png` and `087_laptop_dialog_buy_overdrive.png`.

- Claim: the same figure carries three unit forms across three surfaces. The paytable pod
  writes `5,000×` (`fsModes.ts:139` via `PaytableModal.svelte:389`), the buy dialog writes
  `5,000× base bet` (`fsModes.ts:158` via `BuyBonus.svelte:135`), and the celebration
  writes `5,000×` followed by a separate `BET` label
  (`MaxWinCelebration.svelte:155` then `:159`). **Filed at LOW deliberately**, because the
  divergence between the first two is a recorded owner ruling, not drift:
  `fsModes.ts:145-152` states that a bare `5,000x` beside a 100x or 400x cost *"invites the
  reading '5,000x the 400x I just paid'"* and that market convention *"keeps the short
  'MAX WIN 5,000x' form"* on the paytable. What that ruling does not cover is the third
  form. The celebration's `BET` is a different unit noun again (total bet, not base bet)
  and it appears on the single most-watched surface in the game.

- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:155-159`. Not locked.

- Proposed fix: PARK(this is an owner call, since the two-form split is already a ruling
  and the question is only whether the celebration should join one side or stay a third).
  Raise it as a numbered comms item rather than picking a side.

---

## STT-LAPTOP-B-11 LOW The features menu prints the bet twice on one row, at two sizes and two weights, with no gutter before the adjacent label

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/084_laptop_transition_features_menu_opening.png`, `085_laptop_features_menu.png`.

- Claim: the bet row reads `SPIN COST $1.00 BET  [-]  $1.00  [+]`. The same figure
  `$1.00` appears twice on one line about 240px apart, once small and gold
  (`FeatureMenu.svelte:334`,
  ``<span class="fm-spin-cost">{$tr('hudSpinCost')} <span class="fs-num">{currentSpinCost}</span></span>``,
  fed by `:80` `currentSpinCost = formatBalance(spinCostMicros($betAmount, $standingMode), cur)`)
  and once larger and white in the stepper. The gold instance sits hard against the
  following `BET` label with a gutter visibly narrower than the one between `SPIN COST`
  and its own value, so at a glance the row reads `$1.00 BET` as one token. Two renderings
  of one number on one row is what the inspection test asks about.

- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:334`. Not locked.

- Proposed fix: add an explicit gutter before the `BET` label, and either drop the
  duplicated `SPIN COST` figure while the standing mode costs 1x or give it the stepper
  value's size so the repetition reads as deliberate.

---

## STT-LAPTOP-B-12 LOW A stale source comment describes a defect on the line below it that no longer exists, on the exact class Wave 3 is sweeping

- Frames: none. Source-only, found while verifying `101` and `102`.

- Claim: `MaxWinCelebration.svelte:151-154` is a four-line comment reading *"A letter `x`
  here while the paytable, the mode cards and the feature menu all write the multiplication
  sign `×` ... QUALITY_CHARTER.md Q-12"*, and the line it annotates, `:155`, is
  ``<span class="c1-max-mult fs-num">5,000</span><span class="c1-max-x">×</span>``, which
  is already `×`. The comment describes the pre-fix state as though it were current. Not
  player-visible and so not a stream defect, but it is on the same class as
  STT-LAPTOP-B-02 and it misleads in the same direction: this comment plus Q-26's stale
  file citation are two independent pointers that would send a Wave 3 fixer to the wrong
  places. Ledger MID-02 cites these same lines as evidence of the project's convention,
  which is fair, but a reader who opens the file expecting an unfixed `x` will not find one.

- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:151-154`. Not locked.

- Proposed fix: reword to past tense (*"Was a letter `x`; changed to `×` under Q-12"*), so
  the comment records the decision rather than describing a state that has gone.

---

## Explicit absences, signed

I looked for each of the following across all 26 frames and did not find it. These are
claims and I am signing them.

- **No em dash and no en dash in any player-visible string on any of the 26 frames.** The
  paytable `RESPONSIBLE PLAY` and `DISCLAIMER` blocks (`080`, `081`) are the longest prose
  in the range and carry only commas, full stops and one pair of round brackets,
  `(time played, spins, net result)`. The features menu footer and the OVERBOOST cost line
  use a middle dot, `All modes · RTP 96.35%` and `1.25× per spin while ON · $1.25`, which
  is a separator and not a dash. The hyphen in `Double-chance:` is a hyphen.
- **No mixed straight and curly quotation marks.** No apostrophe and no quotation mark of
  either kind appears anywhere in the 26 frames, which I can state positively rather than
  as an absence of evidence: I checked every prose block for one and there is none to be
  inconsistent about.
- **No visible double space** in any prose block, checked on the two long paytable blocks
  (`080`, `081`), the two buy dialog `WHAT YOU GET` blocks (`086` to `089`) and the six
  interface guide row descriptions (`079`). The only wide inter-token gaps in the range
  are in the win-line caption strip, which is a four-token layout rather than prose; the
  one caption defect I can defend is filed as STT-LAPTOP-B-04.
- **No system font leakage and no fallback glyph in a foreign family**, with one
  allowlisted exception: the `∞` on the autoplay spin-count list (`083`), which is charter
  row Q-07, reviewed and kept, and therefore not a finding. Everything else in the range
  renders in the brand face, including the `©` and the two `™` marks in the disclaimer
  (`080`, `081`) and the `×` on four surfaces.
- **No numeral shimmy on any non-`.fs-num` surface.** The `BALANCE` readout reads
  `$50,000.00` at identical width and identical glyph positions across `082`, `083`,
  `090` to `098`, `099`, `100`, `103` and `104`; the base-game `WIN` pod moves from
  `$353.01` (`099`) to `$363.89` (`100`) with the decimal point and the `$` holding
  position. The right-rail `TOTAL WIN` pod holds `$10.80` across `090` to `098` without
  moving. Recorded as a limitation rather than a clean pass: the six `feature_run` frames
  are a degenerate sample for this check, because the feature never started (see below),
  so no in-feature meter actually counted in front of the camera.
- **No money pod clipped, ellipsised or overflowing anywhere in this range**, so I have no
  fresh TR-115 / TR-086 evidence to add. The widest money strings that appear are
  `$50,000.00` in the `BALANCE` pod and `$5,000.00` in the `WIN` pod (`103`, `104`); both
  sit inside their pods with visible margin on each side. The one fit failure I did find is
  on a non-money string and is filed as STT-LAPTOP-B-03.
- **No placeholder string, no `undefined`, no `NaN`, no `%s`, no `{0}`, no `TODO` and no
  `Lorem`** on any of the 26 frames.
- **The currency format is internally consistent on every surface in the range**: always a
  leading `$`, always a comma thousands separator above 999, always exactly two decimals.
  Every figure in the range conforms: `$0.00`, `$0.20`, `$0.80`, `$1.00`, `$2.80`,
  `$10.00`, `$10.80`, `$16.00`, `$16.20`, `$100.00`, `$353.01`, `$363.89`, `$400.00`,
  `$5,000.00`, `$50,000.00`. The percentage format is likewise consistent, `96.35%` on
  `080`, `081`, `084`, `085`, `086`, `087`, `088` and `089`.
- **The mixed casing of the five mode names is not a defect and I am deliberately not
  filing it.** `Normal`, `Cruise`, `OVERBOOST`, `Buy Overdrive` and `NITRO OVERDRIVE`
  appear side by side on `085`, `087` and `089` in three different casings, but `CLAUDE.md`
  (True game facts, five-mode package) names them in exactly those casings, so this is
  canonical branding rather than drift. Checked, sourced, and not filed.
- **No letter-spacing or weight difference between two instances of one component.** The
  three right-rail plates (`OVERDRIVE FREE SPINS`, `TOTAL WIN`, `MULTIPLIER`) share one
  label treatment across `090` to `098`, `103` and `104`; the three buy dialog stat cells
  share one label treatment across `086` to `089`; the four gold paytable section headers
  (`INTERFACE GUIDE` on `079`, `RESPONSIBLE PLAY` and `DISCLAIMER` on `080` and `081`)
  share one. The only within-component divergence I found is the two-line wrap in
  STT-LAPTOP-B-03, which is a fit failure rather than a style difference.

Two observations outside my lens that I saw and am recording so nobody has to rediscover
them.

- **`081_laptop_paytable_09_disclaimer.png` is identical in content to
  `080_laptop_paytable_08_responsible_play.png`.** Both show the same scroll position with
  `RESPONSIBLE PLAY` and `DISCLAIMER` visible together. The capture's section anchoring for
  the last two paytable sections resolves to the same place, so frame `081` carries no
  information `080` does not. A capture-harness matter, not a rendering one.
- **The six `feature_run` frames `093` to `098` do not show the feature running.** All six
  show the `+16 FREE SPINS` entry card with `TAP TO CONTINUE` still up, and `104`, whose
  manifest note reads `Back to base after collect, balance settled`, shows a
  `+8 FREE SPINS` entry card instead. The capture advanced on a timer without dismissing
  the gate, so the in-flight free-spins typography in this session was never photographed
  and nobody has audited it. Worth a recapture with the gate dismissed.

## KNOWN matches

- KNOWN(Q-26): `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/085_laptop_features_menu.png` and `084_laptop_transition_features_menu_opening.png`. The OVERBOOST card renders its blurb `Debits 1.25x every spin while ON.` about 30px above its own cost line `1.25× per spin while ON · $1.25`. Fresh evidence, and stronger than "visible on frames": both glyph forms of the same number are on one card in one glance. See STT-LAPTOP-B-02 for the correction to the row's cited file.
- KNOWN(Q-26): `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/089_laptop_dialog_nitro_overdrive.png` and `088_laptop_transition_dialog_nitro_overdrive_opening.png`. `Buy a rich entry with the Overdrive meter pre-revved to 5x.` sits three lines above `The Overdrive meter starts at 1× and rises +1× after every winning free spin`, so one card writes one meter with both glyphs.
- KNOWN(Q-07): `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/083_laptop_autoplay_menu.png`. The `∞` option on the autoplay spin-count list renders in a fallback family, exactly as the row describes. Reviewed and kept, so recorded as seen and not filed.
- KNOWN(Q-34, one half only): `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/085_laptop_features_menu.png` shows the `Cruise` title-case half of the pair on the features menu card. No `CRUISE` HUD badge appears in frames 079 to 104, so the contradiction cannot be evidenced from this range alone.
- KNOWN(Q-16, visibility note): the parked hardcoded English strings visible in my range are `Stop on win`, `Single win limit`, `Stop on feature`, `Loss limit` and `SPINS` on `083_laptop_autoplay_menu.png`; `INTERFACE GUIDE` on `079_laptop_paytable_07_interface_guide.png`; `RESPONSIBLE PLAY` and `DISCLAIMER` on `080` and `081`; and `PRESS COLLECT OR HIT ENTER TO CONTINUE` on `101` and `102`. This is an `en` session, so the park's urgency is unchanged by these frames; recorded only so the de and ar squads' lists can be cross-checked against a confirmed English baseline. STT-LAPTOP-B-04 adds one string to the class that the park does not enumerate.
- **WITHDRAWN, KNOWN(MID-02)**: my first pass recorded frames `101_laptop_transition_maxwin_overlay_fade.png` and `102_laptop_maxwin_celebration.png` as MID-02 evidence, reading the max win unit as a letter `x`. `MaxWinCelebration.svelte:155` is `×` (U+00D7). The match is withdrawn. No frame in 079 to 104 shows the MID-02 surface: the big-win banner triple for this session is `065` to `067`, outside my range.
- No KNOWN(MID-01) match: the banner-versus-pod count-up divergence needs the big-win
  count-up frames, which for this session are `065` and `067` and belong to another squad.
- No KNOWN(TR-104), KNOWN(TR-114) or KNOWN(TR-112) match in this range: TR-104 needs a
  localised session and mine is `en`, TR-114 needs a replay surface and none appears, and
  TR-112 is not frame-auditable.

tree_after:

**LOUD: A COMMITTED EVIDENCE FRAME IS SHOWING AS MODIFIED.** `git status --porcelain` run
from `/Users/jt/math-sdk` at the end of my run reports
`M reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png`. That is a
tracked capture frame, and it has been rewritten in the working tree. **It was not me**:
my only write this run was this shard, and the only frames I opened were `079` to `104` of
the `laptop` session, all read-only. This is the shape of convention (h.1) / SA-012, the
write-once evidence rule, where a script or a re-run overwrites committed evidence in
place. Frame `188` belongs to the `popout-s` session, so the marshal should treat every
`popout-s` finding cited against `188` as resting on a frame that no longer matches HEAD,
and should restore it from HEAD (`git checkout -- reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png`)
before any consolidation, exactly as the four anticipation PNGs were restored on
2026-07-26. I have not restored it myself, because it is not mine and a second writer
touching another squad's evidence mid-wave is the failure this rule exists to prevent.

Also worth the marshal's eye, though not an error on its face: **no `STT-LAPTOP-A.md` is
on disk**, so the other half of this session's typography sweep (frames 053 to 078) has
either not finished or was lost. Per convention (q) as amended, a squad that died silently
and a squad that found nothing produce identical output, so this wants confirming rather
than assuming.

Verbatim output, nothing removed:

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

`?? reports/qa/stream_test/shards/STT-LAPTOP-B.md` is mine and is the only file I wrote.
The other `??` rows are other squads' shards. Nothing shows as DELETED. One row shows as
MODIFIED and it is called out above.
