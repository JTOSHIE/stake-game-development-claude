# STL-AR-B, localisation, all five channels (ar-desktop, frames 494 to 519)

scope: the `ar-desktop` session, viewport 1200x675, lang `ar`, frames 494 through 519
inclusive. Paytable sections 07 to 09, paytable close, autoplay menu, features menu open
and settled, both buy confirm dialogs open and settled, feature entry, six feature run
frames, feature exit, post feature base, and the full max win overlay sequence. 26 frames,
every one opened.

frames_read: 26

Australian English, no em dashes and no en dashes.

---

## STL-AR-B-01 STREAM The max win overlay prints its multiplier and its unit in LTR order, so the biggest moment in the game reads backwards in Arabic

- Frames: `reports/screens/stream-test-2026-07-28/517_ar-desktop_maxwin_celebration.png`,
  `reports/screens/stream-test-2026-07-28/516_ar-desktop_transition_maxwin_overlay_fade.png`

- Claim: the headline pair renders as three separate boxes laid out left to right:
  the numeral `5,000` in large yellow Orbitron occupying roughly x415 to x730, then a
  small orange multiplier glyph at about x743, then the translated unit `رهان` at about
  x765 to x790. Arabic is read right to left, so the first token an Arabic viewer's eye
  lands on is `رهان`, then the multiplier glyph, then `5,000`. The line therefore reads
  **`رهان` then `x` then `5,000`**, that is *bet times 5,000*, rather than *5,000x bet*.
  Correct RTL composition would put `5,000` and its multiplier at the RIGHT and `رهان`
  to their left.

  **The same frame contains the control that proves this is an element-order fault and
  not a font or text fault.** The continue hint at the foot of the same overlay,
  `اضغط على تحصيل أو ENTER للمتابعة`, is a single text node containing one Latin run, and
  it resolves CORRECTLY: the Arabic clause sits at the right, `ENTER` in the middle,
  `للمتابعة` at the left, which is exactly right to left order. So the browser's own bidi
  algorithm handles the string case properly, and the defect is purely that the amount and
  its unit are separate DOM boxes laid out by an unmirrored LTR flow. That distinction is
  what the RTL park in `KNOWN_OPEN.md` needs: `dir` and logical properties are not
  cosmetic here, they are the difference between a correct headline and an inverted one.

  This is the 5,000x cap celebration, held on screen, the single most-watched frame the
  title produces.

- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:150-160`, the
  `.c1-max-multwrap` row, which lays out exactly three siblings in source order:
  `<span class="c1-max-mult fs-num">5,000</span>` (`:155`), `<span class="c1-max-x">×</span>`
  (`:155`), and `<span class="c1-max-betlabel">{t($locale, 'bet', localeMode)}</span>`
  (`:159`). The unit is correctly keyed and correctly renders `رهان`; only the box order is
  wrong. Compounded by the absent document direction at `frontend/index.html:2`, verified
  as `<html lang="en">` with no `dir` attribute.

- Proposed fix: PARK(the correct fix is the RTL pass the park already describes, not a
  local patch). The narrow interim, if the owner wants this one frame right before the
  pass lands, is `direction: rtl` on the `.c1-max-multwrap` flex row only, which reverses
  the three boxes and touches no other surface. Cite frame 517 in the park so it is
  evidenced rather than abstract.

---

## STL-AR-B-02 HIGH The paytable's Responsible Play section renders its entire body paragraph in English under an Arabic heading

- Frames: `reports/screens/stream-test-2026-07-28/495_ar-desktop_paytable_08__.png`,
  `reports/screens/stream-test-2026-07-28/496_ar-desktop_paytable_09__.png`

- Claim: the heading is correctly translated, `اللعب المسؤول`, and the two lines beneath it
  are 100 per cent English, centred, at full paragraph width:
  `Autoplay can be set to stop automatically on any win, when the Overdrive feature
  triggers, or once a loss limit you choose is reached, and can always be stopped manually
  at any time. A session summary (time played, spins, net result) is available from the
  menu.`

  **This is NOT the Q-16 park.** Q-16 enumerates paytable section HEADERS
  (`Responsible Play` among them) and that header is now translated. The BODY under it is
  a separate string, it is not in Q-16's enumeration, and it is the single largest block
  of untranslated English on any frame in this session. Every neighbouring block on the
  same frame is Arabic, including the disclaimer paragraph directly below it, so the
  English is not a stylistic choice, it is a missed key.

  Responsible-play copy is also the one paragraph on the surface a jurisdiction reviewer
  is most likely to read, which makes an untranslated version worse than a merely untidy
  one.

- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:396` renders the heading
  through the locale layer as `{$tr('responsiblePlayHeading')}`, keyed at
  `frontend/src/lib/i18n/prose.ts:107` (`responsiblePlayHeading: 'Responsible Play'`).
  The body immediately below, from `PaytableModal.svelte:398`, is raw English markup prose
  with no `$tr` call at all. **Heading keyed, body not, two lines apart in the same file.**

- Proposed fix: key the body string the same way its own heading already is, and add the
  sixteen locale values. Note for the gate owner: this is precisely the shape
  `KNOWN_OPEN.md` records `locale_completeness_check.mjs` as blind to, markup prose between
  tags rather than a quoted literal, which is the same form convention (p) records the dash
  gate failing on twice. A seeded-violation self-test for the locale gate should use this
  string.

---

## STL-AR-B-03 HIGH The win information bar prints the English word `ways` on the main game surface, on 13 of the 26 frames in this shard

- Frames: `reports/screens/stream-test-2026-07-28/497_ar-desktop_transition_paytable_closing.png`
  (`L3  x4  1 ways  $0.20`),
  `498_ar-desktop_autoplay_menu.png` (`M3  x5  8 ways  $16.00`),
  `505_ar-desktop_transition_feature_entry_fade.png`,
  `506_ar-desktop_feature_entry_card.png`,
  `507_ar-desktop_transition_feature_starting.png`,
  `511_ar-desktop_feature_run_4.png`,
  `512_ar-desktop_feature_run_5.png`,
  `513_ar-desktop_feature_run_6.png` (all `L2  x5  1 ways  $0.80`),
  `508_ar-desktop_feature_run_1.png`,
  `509_ar-desktop_feature_run_2.png`,
  `510_ar-desktop_feature_run_3.png`,
  `514_ar-desktop_transition_feature_exit.png`,
  `515_ar-desktop_post_feature_base.png` (all `سكاتر  x5  5 ways  $10.00`),
  `519_ar-desktop_post_collect_base.png` (`M3  x3  1 ways  $0.20`)

- Claim: the strip under the reels renders `ways` in English on every frame that shows a
  win, on the primary play surface, while the symbol name beside it in the same strip IS
  translated (`سكاتر` on frames 508 to 515). One localised token and one English token,
  eight pixels apart, in the same 10px strip. The mixture is the tell: the surface was
  routed through the locale layer and this one word was not.

  Two further faults on the same string, both visible:
  1. **Plural agreement is broken even in English**: frames 497, 505 to 507, 511 to 513
     and 519 all read `1 ways`.
  2. **The strip keeps LTR element order.** Reading right to left, an Arabic viewer meets
     `$0.20` first, then `1 ways`, then `x4`, then the symbol name last. The intended
     reading sequence is exactly reversed, and on frames 508 to 515 the leading token
     `سكاتر` is at the far LEFT of a strip whose reader starts at the right.

- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:94`, verbatim:
  `<span class="wb-ways">{current.ways} ways</span>`. **The line directly above it, `:92`,
  is `<span class="wb-symbol">{symbolLabel(current.symbol, $tr)}</span>`, which DOES take
  `$tr` and is why `سكاتر` renders correctly two spans away.** One span routed through the
  locale layer, the next not, in the same four-line block.

- Proposed fix: **a `ways` key already exists.** `frontend/src/lib/i18n/prose.ts:116`
  carries `waysLabel: 'WAYS TO WIN'` and `:210` carries `waysLabel: 'WAYS'`, and
  `PaytableModal.svelte:37` already consumes it as `$tr('waysLabel')`. So the paytable was
  keyed and the win breakdown was not, from the same key. Route `WinBreakdown.svelte:94`
  through a plural-aware form of that existing key (English `way` / `ways`, Arabic singular,
  dual and plural), which also closes the `1 ways` agreement bug. Small and unlocked. The
  element order is the RTL park.

---

## STL-AR-B-04 HIGH The features menu carries five distinct untranslated English strings, three of them full sentences

- Frames: `reports/screens/stream-test-2026-07-28/500_ar-desktop_features_menu.png`,
  `reports/screens/stream-test-2026-07-28/499_ar-desktop_transition_features_menu_opening.png`

- Claim: on a frame whose headings, mode names, buttons and blurbs are otherwise Arabic
  (`الميزات`, `أوضاع اللف`, `شراء الميزات`, `عادي`, `كروز`, `نشط`, `اختيار`, `إيقاف`,
  `تفعيل`, `أوضاع الرهان`), the following render in English:

  | String, verbatim | Where on the frame |
  |---|---|
  | `1× bet` | cost line, Normal card, lower left |
  | `1× bet` | cost line, Cruise card, lower left |
  | `1.25× bet` | cost line, OVERBOOST card, upper right |
  | `1.25× per spin while ON · $1.25` | OVERBOOST card, full line, bold yellow |
  | `100× · $100.00` | cost line, Buy Overdrive card, upper right |
  | `All modes · RTP 96.35%` | menu footer, lower left |
  | `HIGH` | volatility badge, OVERBOOST card |
  | `VERY HIGH` | volatility badge, Buy Overdrive card |

  Two additional English runs sit INSIDE otherwise-Arabic sentences: `Overdrive Free Spins`
  and `SCATTER` in the Normal card blurb
  (`لعب قياسي. تُفعّل Overdrive Free Spins عند ظهور 3+ رموز SCATTER.`), and
  `Overdrive Free Spins` again in the Buy Overdrive blurb.

  `1.25× per spin while ON · $1.25` and `All modes · RTP 96.35%` are complete English
  sentences on a localised frame and neither is in the Q-16 enumeration. The volatility
  badges are the worst of the set for a stream, because `HIGH` and `VERY HIGH` are the two
  words a viewer scans for when deciding whether to buy.

- Where fixable, every site pinned in `frontend/src/lib/components/FeatureMenu.svelte`:
  - `:372` and `:427`, both verbatim
    `<span class="fm-cost fs-num">{m.cost}× {$isSocial ? 'per spin' : 'bet'}</span>`.
    The social branch and the real-money branch are BOTH hardcoded English, which is the
    identical two-social-branches-no-locale-route shape `KNOWN_OPEN.md` records for TR-104
    at `WinBanner.svelte:195-197`. Same defect, different component.
  - `:480`, `<span class="fm-cost fs-num">{m.cost}× · {price(m.cost)}</span>`.
  - `:413` and `:473`, `<span class="fm-vol">{m.volatility}</span>`, taking the raw
    `volatility` field straight from `frontend/src/lib/config/fsModes.ts` with no key.
  - `:422`, `<p class="fm-enh-effect">{m.cost}× per spin while ON · ...</p>`.
  - `:508`, `<span class="fm-rtp">All modes · RTP {FS_RTP_LABEL}</span>`.
  The blurb strings are keyed already (`:416` is `{$tr(m.blurbKey)}`, which is why the
  Arabic blurbs render); the English inside them is inside the Arabic VALUES, so it is a
  translation-content fix in `frontend/src/lib/i18n/`, not a code fix. Neither file is
  locked (the lock covers `games/future_spinner/**`, not `frontend/src/lib/config/`).

- Proposed fix: PARK(this is a multi-string, sixteen-locale change across two files, the
  same size as TR-104 and larger than small). It belongs in the same pass as TR-104 rather
  than being done piecemeal, and this shard's evidence should be attached to that row.

---

## STL-AR-B-05 HIGH Both buy confirm dialogs render the max win stat as `5,000× base bet` in English, and it wraps mid-phrase inside its pod

- Frames: `reports/screens/stream-test-2026-07-28/502_ar-desktop_dialog_buy_overdrive.png`,
  `reports/screens/stream-test-2026-07-28/504_ar-desktop_dialog_nitro_overdrive.png`,
  `reports/screens/stream-test-2026-07-28/501_ar-desktop_transition_dialog_buy_overdrive_opening.png`,
  `reports/screens/stream-test-2026-07-28/503_ar-desktop_transition_dialog_nitro_overdrive_opening.png`

- Claim: the third stat pod is labelled in Arabic, `أقصى فوز`, and its VALUE reads
  `5,000× base bet` in English. The pod is too narrow for it, so it breaks across two lines
  as `5,000× base` on line one and `bet` alone on line two, while the two pods beside it
  (`السعر` `$100.00` / `$400.00`, and `RTP` `96.35%`) are single-line and vertically
  centred. The result is a three-pod row in which one pod is two lines tall and the other
  two are one, so the row's baselines do not align and the pod visibly overhangs its
  divider.

  This is the money-confirmation dialog, the surface where the player commits `$100.00` or
  `$400.00`, so an English orphan word in the max win field is the worst possible place
  for one.

- Where fixable: `frontend/src/lib/config/fsModes.ts:158`, verbatim:
  ``return social ? `${FS_MAX_WIN_LABEL} base play` : `${FS_MAX_WIN_LABEL} base bet` ``.
  Both branches hardcode English with no locale route, and `fsModes.ts:147` states in its
  own comment that this value is *"Used by the two buy confirmation dialogs"*, which is
  exactly the two dialogs on frames 502 and 504. The multiplier half is fine:
  `FS_MAX_WIN_LABEL` is `'5,000×'` at `fsModes.ts:139` with the correct U+00D7, so only the
  two English words are at fault. Not locked.

- Proposed fix: key `base bet` / `base play` so the translated value can be shorter than
  the English, and give the stat pod a fit-or-shrink rule so it cannot two-line while its
  siblings stay at one. **Note for the marshal**: `fsModes.ts:182-191` carries a comment
  recording that *"The first attempt at TR-037 moved 'base bet' from the value into the
  label"* and was reverted, so this string has already been moved once. Whoever fixes it
  should read that note first rather than repeating the reverted move.

---

## STL-AR-B-06 MEDIUM The paytable modal is composed left to right throughout, so every Arabic row starts at the wrong edge and trails 800 pixels of empty card

- Frames: `reports/screens/stream-test-2026-07-28/494_ar-desktop_paytable_07__.png`,
  `reports/screens/stream-test-2026-07-28/495_ar-desktop_paytable_08__.png`,
  `reports/screens/stream-test-2026-07-28/496_ar-desktop_paytable_09__.png`

- Claim: recorded specifically as the evidence the RTL park asks for, on the most
  text-dense surface in the game.

  1. **Modal chrome is mirrored wrong.** The title `جدول الدفع` sits at the TOP LEFT
     (about x68 to x172) and the close control at the TOP RIGHT (about x1108). In RTL the
     title belongs at the right and the dismiss at the left. Frames 494, 495, 496.
  2. **Interface Guide rows are left-aligned inside full-width cards.** On frame 494 each
     card spans about x78 to x1122, the icon sits at about x120 and the Arabic title and
     description begin at about x160 and end by about x400 at the longest. That leaves
     roughly 720 to 900 pixels of empty card to the RIGHT of every row, which is precisely
     where an Arabic reader's eye starts. Six rows in a column, all of them starting in
     dead space.
  3. **The stat pods put the Latin token first.** On frames 495 and 496 the RTP pod
     renders `RTP` at the left of its own Arabic qualifier, and the value `96.35%` at the
     opposite end of the pod from the label, so the pod is read label-last.
  4. **The disclaimer's Arabic and English runs interleave badly at the wrap.** The final
     Arabic clause and the trademark sentence share a line and break mid-sentence, giving
     `... خادم اللعبة عن بُعد Future Spinner™ and We Roll` on one line and
     `Spinners™ are trademarks of We Roll Spinners. © 2026 We Roll Spinners. All rights
     reserved.` on the next.

- Where fixable: `frontend/index.html:2`, verified this run as `<html lang="en">` with no
  `dir` attribute, and a repository-wide grep for `dir=` and `direction:` across
  `frontend/src/**/*.{svelte,ts,css}` returns nothing, which confirms KNOWN_OPEN's RTL row
  from source rather than from inference. The surface itself is
  `frontend/src/lib/components/PaytableModal.svelte`.

- Proposed fix: PARK(the RTL pass is a tree-wide change, well beyond small). Attach these
  four frame citations to the RTL row so it stops being abstract.

---

## STL-AR-B-07 MEDIUM The features menu bet row shows the same amount in two different currency formats, side by side, in one row

- Frames: `reports/screens/stream-test-2026-07-28/500_ar-desktop_features_menu.png`,
  `reports/screens/stream-test-2026-07-28/499_ar-desktop_transition_features_menu_opening.png`

- Claim: the bet row at the top of the features menu contains, left to right: the
  per-spin cost rendered `1.00$` with the dollar sign AFTER the digits at about x373 to
  x407, the Arabic labels `تكلفة اللفة` and `رهان`, the minus control, then the bet
  readout rendered `$1.00` with the dollar sign BEFORE the digits at about x727 to x775,
  then the plus control. **One row, one currency, one value, two different symbol
  positions.** The charter's own inspection test names "decimal or currency formats that
  disagree" as a machine-tell, and here the two disagreeing formats are 320 pixels apart
  on the same line.

  The cause is visible rather than inferred: the left one sits inside an Arabic RTL text
  run and the right one sits in its own numeric element, so the currency symbol is
  reordered in one and not the other.

- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte`, the bet row above the
  `أوضاع اللف` section. I did not pin the exact line within this shard's file budget; the
  component is named and the row is the first element inside the menu panel. Not locked.

- Proposed fix: wrap every formatted currency value in an element carrying
  `dir="ltr"` and `unicode-bidi: isolate`, so a money string renders identically whichever
  run it sits inside. That is a small, self-contained change and it fixes the class rather
  than this instance.

---

## STL-AR-B-08 MEDIUM Two mode blurbs break their multiplier across the line, leaving a bare Latin `X` and an orphaned numeral

- Frames: `reports/screens/stream-test-2026-07-28/500_ar-desktop_features_menu.png`,
  `reports/screens/stream-test-2026-07-28/499_ar-desktop_transition_features_menu_opening.png`,
  `reports/screens/stream-test-2026-07-28/504_ar-desktop_dialog_nitro_overdrive.png`,
  `reports/screens/stream-test-2026-07-28/503_ar-desktop_transition_dialog_nitro_overdrive_opening.png`

- Claim, two instances:

  1. **OVERBOOST blurb, frames 499 and 500.** The Arabic body renders as one long line
     carrying a bare uppercase Latin `X` mid-sentence, between `تفعيله` and `من`, detached
     from any numeral; and the trailing numeral `1.6` wraps onto a SECOND line by itself
     at the far left (about x371 to x388), orphaned from the `نحو` that introduces it at
     the end of line one. A two-line block whose entire second line is the three
     characters `1.6`.
  2. **NITRO OVERDRIVE blurb, frames 503 and 504.** The line
     `اشترِ دخولًا غنيًا مع عداد Overdrive 5 مسبقًا مرفوعًا` renders with the numeral `5`
     adjacent to `Overdrive` near the middle of the line and a bare lowercase Latin `x`
     stranded at the far LEFT end of the same line, immediately before the full stop, with
     the whole Arabic clause between them. The multiplier `5x` is therefore split into two
     fragments at opposite ends of the line.

  Both are the same underlying fault: a Latin multiplier suffix sitting loose in an Arabic
  RTL run gets reordered away from the number it modifies. Neither reads as anything a
  human wrote.

- Where fixable: the Arabic VALUES of the blurb keys consumed at
  `frontend/src/lib/components/FeatureMenu.svelte:416` (`{$tr(m.blurbKey)}`), which live
  under `frontend/src/lib/i18n/`. The key names come from
  `frontend/src/lib/config/fsModes.ts`. Neither is locked; the lock covers
  `games/future_spinner/**`, not `frontend/src/lib/config/`.

- Proposed fix: bind each numeric multiplier and its suffix into one bidi-isolated span
  (`<span dir="ltr">1.6x</span>`), or at minimum wrap the numeral and suffix in
  U+2066 / U+2069 isolates inside the translated string so the pair can neither split nor
  reorder. Same mechanism as STL-AR-B-07, so fix them together.

---

## STL-AR-B-09 MEDIUM The Overdrive counter pod's Arabic label fills the pod edge to edge with no clearance, where its two siblings have generous margins

- Frames: `reports/screens/stream-test-2026-07-28/505_ar-desktop_transition_feature_entry_fade.png`,
  `506_ar-desktop_feature_entry_card.png`,
  `507_ar-desktop_transition_feature_starting.png`,
  `508_ar-desktop_feature_run_1.png`,
  `509_ar-desktop_feature_run_2.png`,
  `510_ar-desktop_feature_run_3.png`,
  `511_ar-desktop_feature_run_4.png`,
  `512_ar-desktop_feature_run_5.png`,
  `513_ar-desktop_feature_run_6.png`,
  `518_ar-desktop_transition_maxwin_collect_fade.png`,
  `519_ar-desktop_post_collect_base.png`

- Claim: the three right-hand meter pods share one width, about x938 to x1185. The top
  pod's label `لفات أوفردرايف المجانية` runs from about x955 to about x1175, so it
  consumes essentially the whole inner width and leaves single-digit pixel clearance at the
  left. The two pods below it, `إجمالي الفوز` and `المضاعف`, occupy roughly a third and a
  fifth of the same width respectively. The top label is the longest translated string in
  the HUD and it is the one the fit was not checked against; it is one word away from
  clipping and it is on screen for the whole feature.

  This is the classic longer-than-English failure: the English source is short enough that
  the pod was never tested at pressure.

- Where fixable: `frontend/src/lib/components/HudOverlay.svelte` free-spins meter pod, the
  `.fs-meter-label` width and font-size rule.

- Proposed fix: PARK-adjacent, but small on its own: shorten the Arabic value to
  `اللفات المجانية` (the `أوفردرايف` is already carried by the surrounding context) or add
  a `clamp()` font-size on the label so any locale's longest string fits. Prefer the
  string change, since it is one locale value and no layout risk. Note it belongs to the
  same class as TR-115/TR-086 (fit failures) even though the overflow here is a label
  rather than money, so JOB 3's shared fit mechanism should cover labels too.

---

## STL-AR-B-10 LOW The autoplay panel keeps checkbox-before-label order, so every control sits on the wrong side of its Arabic text

- Frames: `reports/screens/stream-test-2026-07-28/498_ar-desktop_autoplay_menu.png`

- Claim: the four stop-condition rows render their checkbox at about x986 and their
  right-aligned Arabic label from about x1010 to the panel's right edge at about x1155.
  In RTL the control belongs on the RIGHT of the label, where the reader's eye reaches it
  first. The rows remain legible, which is why this is LOW rather than higher, but on a
  panel whose labels are all correctly translated (`التوقف عند الفوز`,
  `حد الفوز الواحد`, `التوقف عند الميزة`, `حد الخسارة`) the unmirrored controls are the
  only thing that says the surface was not localised so much as translated.

- Where fixable: `frontend/src/lib/components/HudOverlay.svelte`, the autoplay panel rows
  immediately preceding the `Spins` separator at `:513` (and its two duplicates at `:749`
  and `:955`); and the missing `dir` at `frontend/index.html:2`.

- Proposed fix: covered by the RTL park. Cite this frame under it.

---

## Explicit absences, signed

Each of these is a claim I am signing, with what I checked in order to be able to sign it.

- **No money readout in my 26 frames is clipped, ellipsised or overflowing.** I read the
  balance, win and bet pods on every frame that shows the HUD (497, 498, 505 to 515, 518,
  519) and the price pods on 501 to 504. Longest values observed were `$50,000.00` in the
  balance pod and `$5,000.00` in the win pod on 518 and 519; both sit inside their pods
  with clearance. So **TR-115 / TR-086 has NO fresh evidence from this shard**, and I am
  saying that explicitly rather than by omission. (The one fit failure I did find, the
  `5,000x base bet` two-line break in STL-AR-B-05, is a label wrap, not a money readout.)

- **No English string appears on the max win overlay itself apart from the key name
  `ENTER`.** I read frames 516 and 517 in full. The headline `أقصى فوز تم الوصول!`, the
  button `تحصيل` and the continue hint `اضغط على تحصيل أو ENTER للمتابعة` are all Arabic.
  `ENTER` is a keyboard key name and I am not reporting it. This means **Q-16's
  `Press COLLECT or hit Enter to continue` is fully overtaken by the prose layer**, see
  the Q-16 answer below.

- **No placeholder, no untranslated key id, and no raw interpolation token (`{0}`, `%s`,
  `undefined`, `NaN`) appears on any of my 26 frames.** Checked every text run on every
  frame.

- **No Eastern Arabic numerals appear anywhere, and I am NOT reporting that as a defect.**
  Every numeral on all 26 frames is Western (`5,000`, `96.35%`, `16`, `$50,000.00`).
  Latin-digit presentation is the dominant convention for Gulf and Levant gaming surfaces
  and is internally consistent across all 26 frames, so this is a deliberate-looking
  choice, not a drift. Recorded because the lens asked and because a later reviewer should
  not spend the finding twice.

- **Currency format is `$` before the amount with `,` thousands and `.` decimals on every
  HUD pod.** That is a Latin convention on an Arabic session, but it is the format the
  RGS-supplied USD demo currency implies and it is consistent across every frame that
  shows money. I am NOT raising it as its own finding. The one place the format is NOT
  consistent is STL-AR-B-07, and that is raised there.

- **The max win multiplier glyph on frames 516 and 517 is NOT a MID-02 instance, and the
  ledger over-counts here.** I could not resolve U+0078 `x` from U+00D7 `×` at 1200x675, so
  rather than guess I derived it from the specification per convention (l.1):
  `frontend/src/lib/components/MaxWinCelebration.svelte:155` is
  `<span class="c1-max-x">×</span>`, the correct U+00D7, with a comment above it recording
  the Q-12 change that put it there. **So frames 516 and 517 are clean on the glyph.**
  MID-02's frame count says its 60 frames are *"every session's big-win triple plus its
  max-win frames"*; for this session's max-win frames that clause is wrong, because the
  max-win overlay is a different component from `WinBanner.svelte:205` and it was already
  fixed. Flagged for the marshal so the count is corrected before consolidation rather than
  after.
- **The `1x` multiplier meter on frames 505 to 513, 518 and 519 remains unresolved and I am
  NOT claiming it.** I did not locate its source within this shard's file budget. Recorded
  as open rather than dropped. **Unsolved beats wrongly solved.**

- **Q-34 (`Cruise` versus `CRUISE` casing) is not observable on this session.** The mode
  renders `كروز` on frames 499 and 500 and Arabic has no letter case, so the class cannot
  be seen here. Checked; not applicable.

- **Q-27 (Vite scaffold CSS remnants) is not observable on my frames.** No link, no
  unstyled surface and no `#242424` background region reaches frames 494 to 519. Checked
  every frame; nothing to report either way.

- **Frames 495 and 496 are pixel-identical in content.** `paytable_08` and `paytable_09`
  show the same scrolled-to-bottom state, so the ninth paytable capture adds nothing. That
  is a capture-harness observation, outside my lens, recorded once so the marshal knows it
  was seen and not mistaken for two distinct surfaces.

---

## THE Q-16 ANSWER (the assigned question)

Q-16 records about 35 hardcoded English keys. An Arabic session can tell a keyed string
from a hardcoded one because a keyed string renders Arabic here. Taking only the Q-16
strings that are VISIBLE in frames 494 to 519:

### Still English, so genuinely hardcoded AND visible. This raises the park's urgency.

| Q-16 string | Frame | Rendered as |
|---|---|---|
| `Spins` | `498_ar-desktop_autoplay_menu.png` | `SPINS`, uppercase, as the section header above the `10` / `25` / `50` / `100` / `∞` count list, on a panel whose four checkbox labels are ALL correctly Arabic. It is the only English word on that panel, which makes it the most conspicuous single word on the surface. |

**That is the whole list from my range: exactly one.** Confirmed hardcoded at source, and
it is hardcoded **three times**: `frontend/src/lib/components/HudOverlay.svelte:513`, `:749`
and `:955` are each verbatim `<div class="auto-menu-sep">Spins</div>`. Three copies of one
string means any fix that keys only the copy that happens to render leaves two behind, and
a locale gate reading literals will report the file clean once one is keyed. Worth stating
in the park.

### Now renders translated, so already overtaken by the prose layer. The park is smaller than recorded.

| Q-16 string | Frame | Renders as |
|---|---|---|
| `Stop on win` | `498_ar-desktop_autoplay_menu.png` | `التوقف عند الفوز` |
| `Loss limit` | `498_ar-desktop_autoplay_menu.png` | `حد الخسارة` |
| (sibling, single win limit) | `498_ar-desktop_autoplay_menu.png` | `حد الفوز الواحد` |
| (sibling, stop on feature) | `498_ar-desktop_autoplay_menu.png` | `التوقف عند الميزة` |
| `Interface Guide` | `494_ar-desktop_paytable_07__.png` | `دليل الواجهة`, and all six of its rows too: `دوران`, `زيادة الرهان`, `خفض الرهان`, `الميزات`, `اللعب التلقائي`, `القائمة`, plus `توربو` and `أقصى رهان` on frames 495 and 496 |
| `Responsible Play` | `495` and `496_ar-desktop_paytable_0*.png` | `اللعب المسؤول` **heading only. Its BODY is still fully English, and that is STL-AR-B-02, a finding Q-16 does not cover.** |
| `Disclaimer` | `495` and `496_ar-desktop_paytable_0*.png` | `إخلاء المسؤولية`, with an Arabic body |
| `Press COLLECT or hit Enter to continue` | `516` and `517_ar-desktop_maxwin_*.png` | `اضغط على تحصيل أو ENTER للمتابعة` |

### Q-16 strings I cannot speak to, because their frames are outside my range

`Session` (session panel, frame 485), `Symbol Payouts` (paytable frames 487 to 493),
`Mute` / `Unmute` (HUD menu, frame 484), and all aria labels, which are not frame-visible
by definition. Another squad holds 468 to 493. **I am naming these rather than letting
silence imply I checked them.**

### The reading the park needs

Of the Q-16 strings visible in frames 494 to 519, **eight now render translated and one
does not**. On this evidence the Q-16 park is materially smaller than its "about 35 keys"
figure records, and the prose layer has been quietly absorbing it.

**But the park's shape is wrong in a way that matters more than its size.** Q-16 was
compiled as a list of LABELS: headers, button captions, panel titles. The English that
actually survives on these frames is mostly not labels. It is BODY COPY and COST LINES that
Q-16 never enumerated: the entire Responsible Play paragraph (STL-AR-B-02), five separate
strings in the features menu including two full English sentences (STL-AR-B-04),
`5,000x base bet` in both buy dialogs (STL-AR-B-05), and `ways` on 13 of my 26 frames
(STL-AR-B-03). Measured by characters of English visible to an Arabic player, the strings
Q-16 does NOT list outweigh the one it does list by a wide margin.

This is the same failure the ledger records against Q-26 at MID-02: **a parked list that
calls itself complete, compiled by an instrument that searched one layer.** Q-16 evidently
enumerated label sites. Re-derive it from the frames rather than from the old list before
the park is either closed or sized.

---

## KNOWN matches

- KNOWN(Q-16): `reports/screens/stream-test-2026-07-28/498_ar-desktop_autoplay_menu.png`,
  `SPINS` still renders in English on the Arabic autoplay panel. The only Q-16 string in my
  range still hardcoded; full accounting in the Q-16 answer above.
- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/500_ar-desktop_features_menu.png`
  and `504_ar-desktop_dialog_nitro_overdrive.png` confirm the `fsModes.ts` blurbs carrying
  the `1.6` / `1.25` / `5` multipliers ARE player-visible on captured frames, which is the
  condition Q-26 set for promoting itself to a Wave 3 fix candidate. The glyph itself I
  could not resolve at this resolution; the VISIBILITY is confirmed.
- KNOWN(RTL): frames
  `494_ar-desktop_paytable_07__.png`, `495_ar-desktop_paytable_08__.png`,
  `496_ar-desktop_paytable_09__.png`, `497_ar-desktop_transition_paytable_closing.png`,
  `498_ar-desktop_autoplay_menu.png`, `508` through `515` (win info strip),
  `516_ar-desktop_transition_maxwin_overlay_fade.png` and
  `517_ar-desktop_maxwin_celebration.png`. These are the specific frames the park asked
  for. Frame 517 is the strongest single piece of evidence in the set, because the same
  frame carries a correctly-resolved bidi string beside an inverted element row, which
  isolates the fault to layout rather than text.
- KNOWN(MID-02): **NOT a match, and a correction to the ledger.**
  `516_ar-desktop_transition_maxwin_overlay_fade.png` and
  `517_ar-desktop_maxwin_celebration.png` are max-win frames, which MID-02's frame count
  includes, but the glyph on this surface is the correct U+00D7 per
  `MaxWinCelebration.svelte:155`. MID-02's 60-frame figure should be re-derived before
  consolidation. See the signed absence above.
- KNOWN(TR-104): no evidence from this shard. The win banner frames for this session are
  480 to 482, outside my range.
- KNOWN(MID-01): no evidence from this shard. Same reason.

---

tree_after: `git status --porcelain`, run as the last action of this shard, output verbatim.
**Every line is `??`, untracked. Nothing shows as MODIFIED and nothing shows as DELETED.**
One line is my own shard; the other 30 are other squads' shards, which are not mine and not
my problem.

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
?? reports/qa/stream_test/shards/STT-POPOUTL-A.md
?? reports/qa/stream_test/shards/STT-POPOUTL-B.md
?? reports/qa/stream_test/shards/STT-POPOUTS-A.md
?? reports/qa/stream_test/shards/STT-POPOUTS-B.md
?? reports/qa/stream_test/shards/STV-REST.md
```
