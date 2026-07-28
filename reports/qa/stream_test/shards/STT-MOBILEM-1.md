# STT-MOBILEM-1, typography (mobile-m, frames 260 to 277, 1600px upscaled)
supersedes: STT-MOBILEM-A.md (partially: that shard spans 260 to 285, this squad re-reads 260 to 277)
scope: the 18 `mobile-m` frames numbered 260 to 277 inclusive, native viewport 375x667, lang `en`, read from `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`. Frames 278 to 285, the other part of STT-MOBILEM-A's span, belong to a sibling squad and are not opened here. STT-MOBILEM-B spans 286 to 311 and is wholly outside this range.
frames_read: 18

**Method, stated because it changed two answers.** Every frame was opened once at 1600px. Six
regions were then re-magnified with `sips` into the session scratchpad (never into
`reports/screens/`, which is write-once) to settle claims that turn on letterform detail: the
session panel value column, the HUD money row, the intro rules multiplier prose, the big-win
banner lockup, the win-line strip on two frames, and the HUD menu label stack. **Two claims
died at that step and are recorded in the absences rather than filed**: a suspected second
numeral face, and a suspected letter `x` in the intro rules prose. Both looked real in the
whole-frame view at 1600px and both were wrong. That is the same trap the native pass fell into
from the other direction, and it is why the re-magnification was done before the shard was
written rather than after. The shard was written to disk complete from the frames alone, then
source-checked; the source pass changed the mechanism recorded at finding 04 and confirmed the
other three.

---

## STT-MOBILEM-1-01 STREAM The big-win banner states an amount and a multiplier that contradict each other for the whole count-up

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/272_mobile-m_transition_bigwin_countup_early.png` (the defect), `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/273_mobile-m_transition_bigwin_countup_late.png` and `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/274_mobile-m_bigwin_settled.png` (the settled control)
- Claim: on frame `272` one banner lockup, three lines, reads `BIG WIN` / `$10.28` / `16x BET`, with the BET pod on the same frame reading `$1.00`. At a `$1.00` bet, `$10.28` is `10.28x`, which rounds to `10x`, not `16x`. Frames `273` and `274` are the control and they agree: `$16.20` beside `16x BET`, and `16.20 / 1.00 = 16.2`, rounding to `16`. So the multiplier is arithmetically correct only once the amount has caught up with it.
  **The source confirms the derivation rather than discovering it.** `frontend/src/lib/components/WinBanner.svelte:158` assigns `shownMultiplier = mult` once, with `mult` the FINAL bet multiple, inside `showBanner()`. The amount is then animated separately at `frontend/src/lib/components/WinBanner.svelte:171`, `displayAmount = winDollars * (1 - Math.pow(1 - progress, 3))`, over `const duration = TIER_COUNT_UP_MS[t]` at `:166`. `frontend/src/lib/components/WinBanner.svelte:205` builds the label from the static value, `` $: multLabel = `${Math.round(shownMultiplier)}x` ``, and `:304` renders amount and multiplier as siblings in one block, `` <div class="c1-mult fs-num">{multLabel} {multUnitLabel}</div> ``. One value counts, its sibling does not, and nothing reconciles them.
  This is not `MID-01`, which is the banner disagreeing with the HUD WIN pod, a different pair of surfaces. This is the banner disagreeing with itself, inside one centred three-line lockup, at the most-watched moment in the game. It is not `MID-02` either, which is the glyph in that same string. The two figures are eight characters apart on a 375px screen and a viewer doing the obvious arithmetic gets a different answer from each.
- Resolution note: VISIBLE AT BOTH. The native pass transcribed both strings on this frame (`STT-MOBILEM-A` quotes `$ 10.28` at its finding 09 and `16x BET` at its KNOWN(MID-02)) and did not put them together, so this is a missed reading rather than an unresolvable one.
- Where fixable: `frontend/src/lib/components/WinBanner.svelte:158`, `:166`, `:171` and `:205` (not locked)
- Proposed fix: PARK(the choice is the same art call `MID-01` already carries, and it should be ruled once for both). Two coherent options for the owner: drive `shownMultiplier` from the same eased progress as `displayAmount` so the pair counts up together, or hide the `.c1-mult` line until the count-up completes so the multiplier is only ever asserted against the figure it describes. Option two is one condition and cannot reopen TR-089.

## STT-MOBILEM-1-02 HIGH The HUD menu panel is 200px wide on a 375px viewport, so its edge falls inside two money strings, and it is not opaque enough to hide the pod beneath it

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/275_mobile-m_transition_menu_opening.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/276_mobile-m_hud_menu.png`
- Claim: frame `276` is the settled state, so this is not a transition artefact. Three collisions are legible at 1600px:
  1. The panel's right edge falls inside two money strings rather than between elements. The WIN pod's `$16.20` is split so the `$` sits behind the panel and is dimmed while `16.20` sits outside it and is bright; the BET pod's `$1.00` is split the same way, with the audio slider readout `50%` landing immediately beside the split `$`. A viewer with the menu open sees `16.20` and `1.00` as unmarked bare numbers with a half-erased currency symbol.
  2. The pod label `BALANCE` reads through the panel and its ghost collides with the menu item `PAYTABLE`.
  3. The value `$50,000.00` reads through the panel and its ghost runs out of the right side of the menu item `Session`.
  **The mechanism is in two declarations, both at `frontend/src/lib/components/HudOverlay.svelte:1598-1608`.** `min-width: 200px` at `:1602` is 53 per cent of a 375px viewport, which is what puts the edge in the middle of the money row; `background: rgba(6, 6, 18, 0.96)` at `:1603` leaves 4 per cent transmission, which is enough for a glowing white numeral string to ghost through. Neither the `.c-hud-menu` override at `:2230-2231` nor the `.p-hud-menu` override at `:2145-2146` changes the width or the background; both only reposition.
- Resolution note: NEW AT 1600PX. At roughly 334 image tokens the panel read as an opaque dark card, the ghost type is below the threshold at which text separates from panel texture, and the split `$` is a two-pixel feature natively. The native pass read this exact pair of frames for its finding 03 and signed no occlusion or legibility claim on them.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1602` and `:1603` (not locked)
- Proposed fix: take `background` to a fully opaque value so nothing reads through, and constrain the panel to end on a component boundary at narrow widths (either full bleed to the pod row's edge, or a `max-width` that stops short of the WIN pod) so the edge can never land inside a money string.

## STT-MOBILEM-1-03 HIGH The first screen of the game names the 100x mode `Bonus Buy`, a third name for a product that already has two

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/263_mobile-m_intro_rules.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/262_mobile-m_transition_splash_to_rules.png`
- Claim: the fourth bullet of the intro rules card reads verbatim `Bonus Buy: pay 100× your bet to start the feature immediately.`, from `frontend/src/lib/i18n/translations.ts:1554`, `` rulesOverdriveBuy: 'Bonus Buy: pay 100× your bet to start the feature immediately.' ``. The mode it names is called something else everywhere else: `frontend/src/lib/i18n/prose.ts:91` is `` modeBonusLabel: 'Buy Overdrive' `` and the social override at `frontend/src/lib/i18n/prose.ts:190` is `` modeBonusLabel: 'Get Overdrive' ``. **One purchasable product, three player-visible names**, and the one on the card every player is forced through before the first spin is the one that matches neither of the others.
  The same string is authored generically in every locale rather than as a product name, which is how the divergence got in and how wide the fix is: `frontend/src/lib/i18n/translations.ts:1580` is `شراء البونص`, `:1606` is `Bonuskauf`, `:1632` is `Compra de bono`. A sibling string carries it a second time at `frontend/src/lib/i18n/translations.ts:1555`, `` rulesOverdriveModes: 'Base game and Bonus Buy both return 96.35% RTP. Maximum win 5,000× bet.' ``, which does not render on this card in this range but is the same defect.
  Recorded as a naming finding rather than a casing one: these are not one string in two casings, they are three names for one product, which is the harder version of the defect the standing mandate's inspection test describes. The marshal may prefer to file it under the voice lens; it is reported here because frame `263` is in this squad's range and no shard in the set names it. The counter-instances are on frames `292` to `296`, outside this range, so the other side of the pair is cited from source rather than claimed from a frame.
- Resolution note: VISIBLE AT BOTH. The bullet was legible at native and the native pass quoted a neighbouring bullet from the same card verbatim at its finding 10.
- Where fixable: `frontend/src/lib/i18n/translations.ts:1554` and `:1555`, plus the same two keys in the remaining fifteen locales, and `frontend/src/lib/i18n/prose.ts:91` and `:190` if the direction of the fix is to change the mode label instead (not locked)
- Proposed fix: PARK(which of the three names wins is an owner call, and the social override means the answer is not simply "use the mode label"). The mechanical shape either way: one name, routed from one key, referenced by the intro card rather than restated in it. Whichever is chosen, the edit is sixteen locales wide because the intro string is translated in all of them.

## STT-MOBILEM-1-04 MEDIUM The win-line strip sets one four-field string in two type sizes, four colours and one field-only letter spacing

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/273_mobile-m_transition_bigwin_countup_late.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/274_mobile-m_bigwin_settled.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/275_mobile-m_transition_menu_opening.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/276_mobile-m_hud_menu.png`
- Claim: the strip renders `L3  x4  1 ways  $0.20` on `273`, `275` and `276`, and `M3  x5  8 ways  $16.00` on `274`. It is one horizontal string on one baseline, and its four fields are typeset four different ways:
  - **Two type sizes.** `frontend/src/lib/components/WinBreakdown.svelte:136` sets the strip at `font-size: 0.7rem; font-weight: 700;` while `frontend/src/lib/components/WinBreakdown.svelte:146` sets `.wb-ways` alone at `font-size: 0.62rem`. So `8 ways` is set 11 per cent smaller than the `M3`, `x5` and `$16.00` beside it, on the same line, for no expressed reason. This is what makes the ways field the mushiest part of the strip on the frames.
  - **Four colours.** `frontend/src/lib/components/WinBreakdown.svelte:144-147`: `.wb-symbol` accent, `.wb-count` white at 70 per cent, `.wb-ways` a cyan and white mix, `.wb-pay` gold. Four colours in a string of about fifteen characters.
  - **Letter spacing on one field only.** `frontend/src/lib/components/WinBreakdown.svelte:144` gives `.wb-symbol` `letter-spacing: 0.05em`; the other three fields have none.
  - **No narrow-viewport branch.** The `<style>` block carries no media query touching size, so 375x667 gets the same `0.7rem` as every other viewport while the surfaces around it scale down. On the frames the strip is by a wide margin the smallest player-visible string on screen, and the brand numeral face carries a slashed zero, so at that size `$0.20` and `$16.00` have to be inferred from context rather than read.
  **The caveat is stated rather than hidden**, per convention (l.2): the 1600px frames are an upscale, so blur at this size is partly the resample and not wholly the render, and the legibility half of this claim is therefore reported as observation supported by the authored size rather than as a measurement. The size relationship, the colour count and the two-size split are not affected by any resample and are cited above from source.
  Not a duplicate of `STT-MOBILEM-A` finding 01, which reports the glyph and the plural on this surface and says nothing about its size, its colour count or its internal size split.
- Resolution note: NEW AT 1600PX for the two-size split and the four-colour count; VISIBLE AT BOTH for the strip being the smallest string on screen.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:136`, `:144`, `:146` and `:147` (not locked)
- Proposed fix: delete the `font-size` override on `.wb-ways` at `:146` so the string has one size, and reduce to two colours (one for the symbol and count, one for the money) so a win line reads as one statement rather than four. Consider a size step at the narrow breakpoint in the same pass, since the strip does not currently have one.

---

## Native pass reconciliation

Against `reports/qa/stream_test/shards/superseded/STT-MOBILEM-A.md`, which spans frames 260 to
285. Six of its eleven findings are wholly outside frames 260 to 277 and belong to the sibling
squad holding 278 to 285; they are named and left alone rather than silently skipped.

`reports/qa/stream_test/shards/superseded/STT-MOBILEM-B.md` spans frames 286 to 311, entirely
outside this range. **Nothing in that shard is reconciled here** and no verdict on any of its
nine findings should be read into this shard's silence.

| Native finding | Verdict |
|---|---|
| **A-01** win strip `x4` and `1 ways` | **CONFIRMED.** Both halves survive re-magnification. Frame `273` reads `L3  x4  1 ways  $0.20`, frame `274` reads `M3  x5  8 ways  $16.00`. The `x` sits on the baseline and reaches about two thirds of digit height, which at 1600px is separable from the vertically centred `×` in the intro prose on frame `263`; the native pass asserted the glyph from source and could not have separated them by eye. Source re-read confirms `frontend/src/lib/components/WinBreakdown.svelte:93` is `` <span class="wb-count">x{current.kind}</span> `` and `:94` is `` <span class="wb-ways">{current.ways} ways</span> ``. The shard cited `:92` for the count; the count span is at **`:93`** and `:92` is the symbol span. Trivial, corrected for the marshal. |
| **A-02** `SCAT` and five forms of the scatter term | **Partly in range, partly out.** The `SCAT` card is on frames `281` and `282`, outside this range. The in-range instance is frame `263`, where `Scatters` is capitalised mid-sentence in bullets 1 and 3 while `free spins` beside it is lower case: **CONFIRMED** for that half. |
| **A-03** HUD menu three casings and two modal title conventions | **CONFIRMED, REFINED twice.** (1) The heading says *three different casings*; there are **two conventions across three items**: `PAYTABLE` upper case, `Session` and `Mute` both sentence case, with `MUSIC` and `SOUND` upper case beneath. Three items disagreeing is right; three casings is not. (2) The modal title half is confirmed from a different pair of frames than the shard used: frame `277` titles the session modal `Session information` and frame `263` titles the intro modal `OVERDRIVE FREE SPINS`. Re-magnified, **both titles are the same type family**; they differ in casing and tracking, not in face. The shard's paytable title frame `279` is out of this range. Source: the render sites at `frontend/src/lib/components/HudOverlay.svelte:655-658` are as the shard states, and the hardcoded `Session` literal at `:656` is real; note it is repeated in all four viewport branches, at `:429`, `:547`, `:656` and `:818`, so the fix is four sites and not one. |
| **A-04** paytable bullets centred, scaffold `text-align: center` | **Out of range for the defect** (frames `283`, `284`). The in-range half is the CONTROL, frame `263`, and it **CONFIRMS**: the intro card's four bullets are left aligned with the `›` markers hanging clear of the first line, so the same list pattern is demonstrably typeset two ways in one build. |
| **A-05** `SCATTERs` | Out of range (frame `283`). No verdict. |
| **A-06** five bet-mode names, three casings | Out of range (frame `285`). No verdict. Note for the marshal: finding 03 above adds a name that shard's enumeration does not carry. |
| **A-07** symbol payout column mixes precisions | Out of range (frames `281`, `282`). No verdict. |
| **A-08** `Continue` is title case where every action label is upper case | **CONFIRMED.** Frame `263` renders `Continue`; frames `264` through `274` render `SPIN`, `MAX` and `FEATURES` upper case, and frames `260` and `261` render `TAP TO CONTINUE` upper case, which is the same word in the same role two screens earlier. Re-magnified, the button label is the same family as the rest of the card; the apparent family break at whole-frame view is tracking and weight, and that suspicion is retracted here rather than filed. |
| **A-09** banner `$` to first digit gap | **CONFIRMED, REFINED.** The gap is unambiguous at 1600px: on frame `274` the space between `$` and `1` is visibly wider than the space between `6` and `.`, and the leading `1` carries slack on both sides, which is what a 0.834em box around a 0.391em glyph predicts. **The refinement is that the shard's stated variation is a derivation and not an observation.** All three in-range frames lead with the digit `1` (`$10.28`, `$16.20`, `$16.20`), so this frame set contains no counter-example and cannot demonstrate that the gap changes with the value. The derivation is sound; the frames do not evidence it, and the shard reads as though they do. |
| **A-10** serial comma disagreement | **Partly in range.** Frame `263` **CONFIRMS** its half verbatim: `3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1×, 3× or 10× total bet.`, no serial comma in either list. The paytable half is frame `283`, out of range. |
| **A-11** one paytable header cyan | Out of range (frames `279` to `285`). No verdict. |
| **A retraction 1**: "the paytable writes the multiplier with a letter `x`" | **The retraction is CORRECT and this squad independently reproduced the mistake before catching it.** The paytable frames are out of range, but the same prose class is in range on frame `263`, and at whole-frame 1600px view `instant 1x, 3× or 10×` read as a mixed pair. Re-magnified, all of `1×`, `3×`, `10×`, `+1×` and `100×` on that card sit clear of the baseline at the digits' optical centre, which is `×` and not a lower-case `x`. **Filing that would have been a false positive at 1600px, not only at native.** The class is real and its confirmed instances in range are the banner unit (MID-02) and the win strip (A-01), both of which put the glyph on the baseline. |
| **A retraction 2**: "the in-grid `WIN!` callout is not in the brand face" | **The retraction is CORRECT.** Frame `271` is in range. At 1600px the callout's `W`, `I` and `N` match the display face used by `BIG WIN` on frames `272` to `274`; the apparent narrowness at thumbnail scale is absence of tracking, exactly as the shard concluded. No family break. |
| **A KNOWN(MID-01)** | **CONFIRMED**, fresh evidence below. |
| **A KNOWN(MID-02)** | **CONFIRMED**, fresh evidence below, and now frame-verifiable rather than source-asserted. |
| **A KNOWN(Q-26), KNOWN(Q-27)** | Out of range (frames `283`, `284`, `285`). No verdict. |
| **A KNOWN(Q-16 park)** | **Partly CONFIRMED.** The in-range parked string is `Mute` on frames `275` and `276`. The paytable section headers cited are out of range. |

**No finding of the superseded shard that falls inside frames 260 to 277 is REFUTED.** That is
a signed claim and it is the honest outcome: the native pass's in-range work stands, its two
self-retractions were both right, and the re-run's corrections to it are the two refinements at
A-03 and A-09, the `:92`/`:93` line correction at A-01, and four findings it did not carry.

---

## Explicit absences, signed

Each of the following was looked for across all 18 frames; those marked re-magnified were
additionally checked on a `sips` crop written to the session scratchpad.

- **No second type family anywhere in range.** Re-magnified on the intro rules card (`263`,
  heading against body against button label) and on the session panel (`277`, heading against
  row labels against values). Every string in range resolves to the one squared geometric brand
  family, varying only by size, weight and tracking. **The whole-frame view suggested otherwise
  on the `Continue` button and it was wrong**; the button is the same face with letter spacing
  applied. No system font leakage, no tofu, no notdef box, no fallback glyph. Q-07's allowlisted
  infinity mark is on the autoplay panel, frame `290`, out of range.
- **No second numeral face.** Re-magnified specifically to test a suspicion raised at whole-frame
  view that the BET pod used a different zero from the BALANCE pod. **Refuted.** Every numeral in
  range carries the same slashed zero: `$50,000.00`, `$16.20` and `$0.00` in the pods (`264` to
  `277`), `$1.00` in the BET stepper (`264` to `277`), `$16.20` and `$10.28` in the banner (`272`
  to `274`), `00:00:21`, `$5.00`, `$20.10` and `+$15.10` in the session panel (`277`), `10×` in
  the intro prose (`263`), and `50%` and `80%` in the menu (`275`, `276`). One face, one zero
  design, one set of digit shapes.
- **No numeral shimmy on any non-`.fs-num` surface.** `$50,000.00` holds identical glyph
  positions in the BALANCE pod across frames `264` to `277`; `$1.00` holds identical positions in
  the BET pod across the same run; `50%` and `80%` are identical on `275` and `276`. The WIN pod
  steps `$0.00`, `$3.90`, `$15.95`, `$16.20` across `270`, `271`, `272`, `273` with no change in
  digit advance, which is consistent with the `font-variant-numeric: tabular-nums` the strip's
  own `.fs-num` rule uses at `frontend/src/lib/components/WinBreakdown.svelte:142`. The only
  count-up caught mid-flight in range is the `.fs-num` banner on `272`, which is TR-089's closed
  surface and excluded by instruction.
- **No clipped, ellipsised, truncated or overflowing NON-money string.** No `...`, no truncation
  marker, no text crossing its own container edge on any of the 18 frames. Checked the intro
  card's four bullets and wrapped heading (`262`, `263`), the five session panel rows (`277`),
  the HUD menu stack (`275`, `276`), the `FEATURES` bar (`264` to `276`), the button cluster
  (`264` to `277`) and the win-line strip (`273` to `276`). The strip's fields are small
  (finding 04) but complete: none is cut and none runs past the bar.
- **No em dash or en dash in player-visible prose.** Checked every prose surface in range: the
  four intro rules bullets (`262`, `263`), the five session panel row labels (`277`), the HUD
  menu (`275`, `276`) and the two splash frames (`260`, `261`). The only rule-shaped marks in
  range are the `+` in `+1×` and `+5` on frame `263` and in `+$15.10` on frame `277`, all plus
  signs and all correct.
- **No mixed straight and curly quotes.** No apostrophe and no quotation mark appears in any
  player-visible string across the 18 frames, so the class cannot be violated in this range. The
  only punctuation present is the comma, the full stop, the colon in `Bonus Buy:` and
  `00:00:21`, the `›` bullet marker and the `%` sign.
- **No double space.** Checked on re-magnified crops of the intro bullets (`263`) and the session
  panel rows (`277`), plus whole-frame on `275` and `276`. The one wide-looking gap, between
  `Net` and `result` on frame `277`, is the optical gap of a `t` followed by an `r` and measures
  the same as the gaps in `Time played` and `Total won` directly above it. Not filed.
- **No decimal or currency format disagreement on one screen.** Frame `277` is the densest test
  and carries `$5.00`, `$20.10`, `+$15.10`, `$50,000.00`, `$16.20` and `$1.00` in one view. Every
  one is `$`, a comma-grouped integer part, a full stop and exactly two decimals. The leading `+`
  on `Net result` is a signed-delta convention, not a second format. Frame `263`'s multipliers
  `1×`, `3×`, `10×`, `+1×` and `100×` are integers throughout, and frame `274`'s banner unit
  `16x` is likewise an integer, so no precision disagreement exists in range. The count-up
  disagreement filed at finding 01 is a VALUE disagreement, not a format one, and is filed as
  such.
- **No money-display fit failure, so no fresh TR-115 / TR-086 evidence from this range.** The
  largest figure in range is `$50,000.00` and it sits inside the BALANCE pod with clear margin on
  both sides on every frame from `264` to `277`. `$16.20`, `$15.95`, `$10.28`, `$5.00`, `$3.90`,
  `$1.00`, `$0.20` and `$0.00` all fit their containers. The split `$` on frames `275` and `276`
  is an overlay landing on top of a pod, filed at finding 02 as occlusion, and it is explicitly
  NOT offered as fit-failure evidence.
- **No placeholder, lorem, `TODO`, `undefined`, `NaN`, `null` or unresolved `{token}`** on any of
  the 18 frames.
- **No letter-spacing or weight difference between two instances of one component.** The two
  money pods on `265` share label size, tracking, weight and treatment; the two stepper buttons
  on the BET row are identical; the four intro bullets share one marker, one indent and one body
  size; the five session panel rows share one label size and one right-aligned value column,
  verified on the re-magnified crop. The one intra-component split found is inside the win strip
  and is filed at finding 04.
- **No text tearing, double-drawn or half-composited string on any transition frame.** Checked
  all eight in range: `260`, `262`, `264`, `266`, `267`, `272`, `273` and `275`. Every string is
  fully composited.
- **No TR-104 defect exercised.** This session is `lang: en`, so `BIG WIN` and `x BET` in English
  on frames `272` to `274` is correct here. The row needs the `de` and `ar` squads.
- **No TR-114 replay ghost pod.** No replay surface appears in frames 260 to 277.
- **No Q-34 evidence available.** The features menu, the buy dialogs and the HUD mode badge are
  all outside frames 260 to 277, so this range cannot speak to `Cruise` against `CRUISE`.

## KNOWN matches

- **KNOWN(MID-01)**, fresh evidence:
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/272_mobile-m_transition_bigwin_countup_early.png`
  renders the banner at `$10.28` while the HUD WIN pod on the same frame renders `$15.95`, on a
  win that settles at `$16.20` per
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/274_mobile-m_bigwin_settled.png`.
  The two readouts differ by `$5.67` at that instant. The ledger's derivation for desktop frame
  `013` predicts `$15.96` in the pod at a banner reading of `$10.29`; `mobile-m` reproduces it one
  cent lower on both sides, so the divergence is viewport independent and the derivation holds at
  a second viewport.
- **KNOWN(MID-02)**, fresh evidence and an upgrade in evidence quality:
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/272_mobile-m_transition_bigwin_countup_early.png`,
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/273_mobile-m_transition_bigwin_countup_late.png`,
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/274_mobile-m_bigwin_settled.png`.
  All three render the unit as `16x BET` from `frontend/src/lib/components/WinBanner.svelte:205`.
  **At 1600px, re-magnified, the glyph is decidable from the frame rather than only from source**:
  the `x` sits on the baseline with the digits and reaches roughly two thirds of their height,
  which is a lower-case letter; the `×` in `1×, 3× or 10×` on frame `263` sits clear of the
  baseline at the digits' optical centre. The ledger's MID-02 could cite only source. This range
  now carries the visual proof beside it.
- **KNOWN(Q-16 park)**:
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/275_mobile-m_transition_menu_opening.png`
  and `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/276_mobile-m_hud_menu.png`
  render the parked hardcoded `Mute`. Recorded per the row's instruction that stream visibility is
  what the park wants evidenced; this session is `en`, so nothing is mis-rendered here. Adjacent,
  and raised by the superseded shard rather than new here: the hardcoded `Session` literal on the
  same panel is not in the park's enumeration, and it occurs four times, at
  `frontend/src/lib/components/HudOverlay.svelte:429`, `:547`, `:656` and `:818`.
- **KNOWN(TR-089)**: not a finding, recorded as the carve-out being correctly exercised. The
  `.fs-num` per-digit boxes are visible on the banner amount on frames `272` to `274` and are
  excluded by instruction. Finding 01 concerns the banner's VALUES and A-09's `$` gap concerns
  constant spacing; neither is shimmy and neither is offered as one.

tree_after: verbatim `git status --porcelain` output is recorded in the structured return. Every
line is `??`, untracked. NOTHING shows as MODIFIED and NOTHING shows as DELETED. The only path
this squad wrote inside the repository is
`reports/qa/stream_test/shards/STT-MOBILEM-1.md`; every other row is another squad's shard. The
six re-magnified crops were written to the session scratchpad outside the repository and are not
in the tree.
