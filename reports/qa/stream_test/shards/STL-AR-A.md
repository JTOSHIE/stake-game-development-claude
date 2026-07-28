# STL-AR-A, localisation, all five channels (ar-desktop, frames 468 to 493)

scope: every frame of the `ar-desktop` session numbered 468 to 493 inclusive, 26 frames,
covering splash, intro rules, base idle, spin transitions, three dead spins, a standard
win, the big win triple, the HUD menu, the session panel and paytable sections top
through bet modes. Viewport 1200x675, lang `ar`, build HEAD `d9bdf22`.
frames_read: 26

## STL-AR-A-01 STREAM The win-line detail strip renders the English word `ways`, a raw internal symbol code and an ASCII `x`, under the reels, for the whole of every win

- Frames:
  `reports/screens/stream-test-2026-07-28/482_ar-desktop_bigwin_settled.png`,
  `reports/screens/stream-test-2026-07-28/481_ar-desktop_transition_bigwin_countup_late.png`,
  `reports/screens/stream-test-2026-07-28/483_ar-desktop_transition_menu_opening.png`,
  `reports/screens/stream-test-2026-07-28/484_ar-desktop_hud_menu.png`,
  `reports/screens/stream-test-2026-07-28/485_ar-desktop_session_panel.png`
- Claim: frame `482` renders the strip beneath the grid as `M3   x5   8 ways   $16.00`.
  Frame `481` renders `L3   x4   1 ways   $0.20`. The same strip is still on screen,
  unchanged, behind the HUD menu on `483` and `484` (`... ways   $0.20`) and behind the
  session panel on `485` (`M3   x5   8 ways   $16.00`). Three failures in one short string,
  on an `ar` session, all confirmed at source:
  1. `ways` is a hardcoded English literal.
     `frontend/src/lib/components/WinBreakdown.svelte:94` reads
     `<span class="wb-ways">{current.ways} ways</span>`. It is not one of the strings Q-16
     enumerates.
  2. `M3` and `L3` are internal symbol identifiers presented as the symbol's name.
     `frontend/src/lib/components/WinBreakdown.svelte:92` calls
     `symbolLabel(current.symbol, $tr)`, and that helper is declared at
     `frontend/src/lib/components/WinBreakdown.svelte:19` as
     `(raw: string, t: (k: 'symbolWild' | 'symbolScatter') => string)`, so it can translate
     exactly two symbols and every paying symbol falls through raw. A player has no way to
     map `M3` to the muzzle-flash symbol, and the standing mandate names surviving
     developer strings explicitly as a machine-tell.
  3. `x5` and `x4` use the ASCII letter `x` (U+0078), not `×` (U+00D7).
     `frontend/src/lib/components/WinBreakdown.svelte:93` reads
     `<span class="wb-count">x{current.kind}</span>`. This is the Q-26 / MID-02 class on a
     surface neither enumerates: MID-02 names `WinBanner.svelte:205` as the fifth instance
     and Q-26 names four in `fsModes.ts`. `WinBreakdown.svelte:93` is a sixth, in neither
     file, which means MID-02's own widening of Q-26 is itself still short by one file.
  Severity is STREAM rather than HIGH because this is not a menu a viewer has to open. It
  sits under the reels for the whole of every win presentation, which is exactly the moment
  the audience is looking.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:92`, `:93`, `:94` and the
  helper at `:19`. Not locked.
- Proposed fix: parts 1 and 3 are small, key the `ways` word and change `x` to `×` in the
  same edit. Part 2 is PARK(a symbol display-name map is ten names across sixteen locales,
  and the same map is what `PaytableModal.svelte:73` and `:74` need for STL-AR-A-03, so it
  should be specified once and shared rather than added twice).

## STL-AR-A-02 HIGH The paytable ships a complete untranslated English sentence, an English `Max Win` label and an English `Scatters` column header, and none of the three is in Q-16's enumeration

- Frames:
  `reports/screens/stream-test-2026-07-28/493_ar-desktop_paytable_06_bet_modes.png`,
  `reports/screens/stream-test-2026-07-28/492_ar-desktop_paytable_05__.png`,
  `reports/screens/stream-test-2026-07-28/491_ar-desktop_paytable_04__.png`
- Claim: three English strings on an `ar` session that Q-16's "about 35 keys" list does not
  contain, each traced to its literal:
  - `Max win is quoted against the base bet.` A complete English sentence, centred at
    approximately (600, 469) on frame `493`, directly under the five bet-mode cards, with
    translated Arabic above it and the translated heading `دليل الواجهة` below it. Source:
    `frontend/src/lib/config/fsModes.ts:190-191`, `maxWinFootnote(social)` returning
    `'Max win is quoted against the base play amount.'` or
    `'Max win is quoted against the base bet.'` with no locale route at all.
  - `MAX WIN`. The third stat label on all five bet-mode cards on frames `492` and `493`.
    Source: `frontend/src/lib/config/fsModes.ts:174-176`, `maxWinStatLabel()` returning the
    literal `'Max Win'`, uppercased on screen by the card CSS. The label BESIDE it,
    `التكلفة`, is keyed: `frontend/src/lib/components/PaytableModal.svelte:315` calls
    `{$tr('costLabel')}`. So one keyed label and one hardcoded one sit in the same
    three-column row, five times over, and the ar value `costLabel: 'التكلفة'` already
    exists at `frontend/src/lib/i18n/prose.locales.ts:56`.
  - `SCATTERS`. The first column header of the free-spins award table on frames `491` and
    `492`, sitting between the translated `دورات مجانية` and `جائزة فورية`. Source, and this
    is the sharpest single line in this shard,
    `frontend/src/lib/components/PaytableModal.svelte:259`:
    `<tr><th>Scatters</th><th>{$tr('colFreeSpins')}</th><th>{$tr('colInstantAward')}</th></tr>`
    Three sibling `<th>` on one line: two routed through the prose layer, one a bare
    literal. The two keyed siblings have ar values at
    `frontend/src/lib/i18n/prose.locales.ts:54` and `:55`; there is no `colScatters` key
    anywhere in that file, so the third column was never keyed rather than keyed and
    forgotten.
  The finding that matters more than the strings: **Q-16's enumeration is incomplete**, in
  exactly the way MID-02 recorded Q-26 to be. Q-16 lists autoplay labels, paytable *section
  headers*, one max-win overlay line, `Mute`/`Unmute` and aria labels. It does not reach
  table column headers, card stat labels, or free English sentences in body copy. The park
  is therefore larger than recorded, and an English session could never have said so.
- Where fixable: `frontend/src/lib/config/fsModes.ts:174-176` and `:188-192`;
  `frontend/src/lib/components/PaytableModal.svelte:259`;
  `frontend/src/lib/i18n/prose.locales.ts` (add `colScatters` to all sixteen blocks). None
  locked.
- Proposed fix: the `Scatters` header is small, add one key beside its two existing
  siblings. `maxWinStatLabel()` and `maxWinFootnote()` are PARK(sixteen locales times two
  social branches, sized like TR-091, and they should move in the same change as TR-104's
  `x BET` since both live in the same "quoted against the bet" wording family).

## STL-AR-A-03 HIGH The feature carries one name in Arabic and another in English inside one document, and five bet-mode names take three different localisation treatments on one row

- Frames:
  `reports/screens/stream-test-2026-07-28/492_ar-desktop_paytable_05__.png`,
  `reports/screens/stream-test-2026-07-28/493_ar-desktop_paytable_06_bet_modes.png`,
  `reports/screens/stream-test-2026-07-28/491_ar-desktop_paytable_04__.png`,
  `reports/screens/stream-test-2026-07-28/489_ar-desktop_paytable_02__.png`,
  `reports/screens/stream-test-2026-07-28/490_ar-desktop_paytable_03__.png`,
  `reports/screens/stream-test-2026-07-28/471_ar-desktop_intro_rules.png`
- Claim: the same feature carries two names inside one document.
  - The section heading is `لفات أوفردرايف المجانية` on frames `491`, `492` and on the intro
    rules card `471`, transliterating Overdrive and translating "free spins".
  - The bet-mode card blurbs write it as `Overdrive Free Spins` in Latin script on frames
    `492` and `493`: card 1 (`عادي`) ends `... تُفعّل Overdrive Free Spins عند ظهور 3+ رموز
    SCATTER.` and card 4 (`شراء Overdrive`) reads
    `اشتر دخولاً مضمونًا إلى Overdrive Free Spins.` Both are on frame `493` at the same
    instant as nothing reading `أوفردرايف`.
  The five mode names on that one row take three treatments: fully translated (`عادي`,
  `كروز`), fully English (`OVERBOOST`, `NITRO OVERDRIVE`), and half and half
  (`شراء Overdrive`).
  Symbol naming does the same. The paytable cards are titled `WILD` and `SCAT` on frames
  `487` to `490`, `SCAT` being an abbreviation of an internal code rather than a word in any
  language. Source: `frontend/src/lib/components/PaytableModal.svelte:73` and `:74` declare
  `{ name: 'WILD', ... }` and `{ name: 'SCAT', ... }` as literals in a local array, rendered
  raw at `frontend/src/lib/components/PaytableModal.svelte:226` as
  `<span class="fs-sym-name">{sym.name}</span>`. **The ar values already exist and are not
  used**: `symbolWild: 'وايلد'` at `frontend/src/lib/i18n/translations.ts:361` and
  `symbolScatter: 'سكاتر'` at `:362`. Meanwhile the prose beneath the cards uses a THIRD
  form, the English `SCATTER` embedded inside the Arabic translation itself:
  `frontend/src/lib/i18n/prose.locales.ts:53` reads
  `wildSubstitutes: 'يحل محل جميع الرموز باستثناء SCATTER'`. And the free-spin bullets on
  `471`, `491` and `492` use a fourth, the Arabic transliteration `رموز سكاتر`. Four names
  for one symbol, three of them on the same screen.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:73`, `:74`, `:226`;
  `frontend/src/lib/i18n/prose.locales.ts:53` and its fifteen siblings;
  `frontend/src/lib/i18n/translations.ts:361-362` (the unused keys). Mode names live in
  `frontend/src/lib/config/fsModes.ts` via `m.labelKey`, which IS keyed
  (`PaytableModal.svelte:308` calls `{$tr(m.labelKey)}`), so the three-way split is in the
  translated VALUES, not in the wiring.
- Proposed fix: PARK(this is a naming-policy call, not a mechanical one). The owner has to
  decide once whether feature and mode names are untranslatable brand marks or localisable
  copy, because the codebase currently does both and the paytable shows both at once. Two
  parts are small whichever way it goes: point `PaytableModal.svelte:226` at the two keys
  that already exist, and stop `SCAT` being a player-facing string in any locale.

## STL-AR-A-04 HIGH Two currency formats render on one panel at the same instant

- Frames: `reports/screens/stream-test-2026-07-28/485_ar-desktop_session_panel.png`
- Claim: the session panel on frame `485` prints five rows. Two are currency-suffixed and
  locale-formatted, `إجمالي الرهان` = `5.00 US$` and `إجمالي الفوز` = `20.10 US$`. The row
  immediately below them, `النتيجة الصافية`, is currency-prefixed and hand-formatted,
  `+$15.10`. Adjacent rows, one panel, same class of figure, two conventions. The arithmetic
  is correct (`20.10 - 5.00 = 15.10`), so this is presentation only, which is what makes it a
  pure formatting defect rather than a money bug.
  `US$` is what `Intl.NumberFormat` emits for USD under an `ar` locale; `$15.10` is not. The
  rest of the session is on the second convention: the HUD pods behind this very panel read
  `$50,000.00`, `$16.20` and `$1.00` on frame `485`; the buy-feature bar reads `$100.00` on
  `491` and `492`; the mode cards read `$1.00`, `$1.25`, `$100.00` and `$400.00` on `493`. So
  exactly two rows in twenty-six frames use the localised formatter, and they sit next to a
  row that does not.
  `frontend/src/lib/utils/currency.ts` carries both mechanisms in one file: an
  `Intl.NumberFormat` currency path at `:145-146`, `:214-215` and `:318-319`, plain
  `toLocaleString` paths at `:190`, `:201`, `:305` and `:311`, and a
  `` `${code} ${amount.toLocaleString(localeTag, compact)}` `` path at `:325`. Which exported
  helper each of the five session rows calls is UNKNOWN; I did not read the call sites.
- Where fixable: `frontend/src/lib/utils/currency.ts` (the divergent formatters, not locked).
  The session panel's per-row call sites: UNKNOWN.
- Proposed fix: pick one formatter and route all six surfaces through it. TR-115 / TR-086
  already maps money display to a shared fit-or-abbreviate mechanism in final-mile JOB 3, and
  a single money formatter is the thing both findings actually want, so this belongs in that
  mechanism rather than in its own pass.

## STL-AR-A-05 MEDIUM RTL evidence pack: the specific frames where unchanged LTR flow visibly harms the Arabic read

Recorded against KNOWN_OPEN's RTL row, which asks the ar squad for frames rather than
abstraction. This is not a new claim that the app lacks `dir`; it is the evidence that row
needs. Mechanism re-confirmed at source: a grep across `frontend/src` and `frontend/index.html`
for `dir=`, `direction: rtl` and `documentElement.lang` returns nothing.

- Frames, and the specific harm on each:
  - `473_ar-desktop_base_idle.png`, unchanged on `474` through `482` and `485`: the HUD
    control row runs `الرصيد` (`$50,000.00`), then `ربح` (`$0.00`), then `رهان` (`$1.00`),
    left to right, with the bet stepper and then the spin button `دوران` at the far right.
    An Arabic reader entering from the right meets bet, then win, then balance, the reverse
    of the intended order, and meets the primary action before the readouts rather than
    after them.
  - `483_ar-desktop_transition_menu_opening.png` and `484_ar-desktop_hud_menu.png`: every
    menu item (`جدول الدفع`, `Session`, `Mute`) is flush LEFT in a panel about 230 px wide,
    so each Arabic label ends far short of the panel's right edge and the eye starts on empty
    space. The two audio sliders put the Arabic label (`الموسيقى`, `الصوت`) on the left, the
    track filling left to right, and the readout (`50%`, `80%`) on the right, the mirror of
    the Arabic scan.
  - `485_ar-desktop_session_panel.png`: all five rows put the Arabic label on the LEFT and
    the value on the RIGHT, so the reader meets `00:00:22` before `مدة اللعب`, `5` before
    `اللفات`, and so on for all five. The title `معلومات الجلسة` is top-left and the close
    `X` is top-right, both on the wrong side.
  - `487` through `493`: the paytable title `جدول الدفع` is pinned top-left and the close `X`
    top-right on every one of the seven paytable frames.
  - `491_ar-desktop_paytable_04__.png` and `492_ar-desktop_paytable_05__.png`: the free-spins
    award table's columns run `SCATTERS`, then `دورات مجانية`, then `جائزة فورية` left to
    right, and the whole table is anchored to the panel's left edge, ending at about x 490 in
    a content area running to about x 1125, so roughly 630 px of dead space sits on the side
    an Arabic reader starts from. The markup at
    `frontend/src/lib/components/PaytableModal.svelte:259` writes the three `<th>` in that
    order with no logical-property or `dir` treatment.
  - `490_ar-desktop_paytable_03__.png` and `491_ar-desktop_paytable_04__.png`: the rules
    bullets are CENTRE-aligned while their `›` markers are pinned at about x 80. Measured on
    frame `491`, bullet 3 (`... يحل رمز WILD ...`) begins at about x 455, so its marker sits
    about 375 px away from the word it introduces and on the far side of the line from where
    the Arabic starts. Bullet 1 is about 370 px away. The marker is both detached and on the
    wrong side.
  - `493_ar-desktop_paytable_06_bet_modes.png`: the interface-guide rows put the icon on the
    left and left-align the Arabic (`دوران`, `ابدأ دورة بالرهان الحالي.`) beside it.
  - `491` and `492`: the buy-feature bar puts `شراء الميزة` on the left and `$100.00` on the
    right.
  - `480`, `481`, `482`: the win banner puts the tier `فوز كبير` on the left and the unit on
    the right, the mirror of the Arabic reading order, at the most-watched moment in the game.
  Inside the one paytable panel the Arabic is left-aligned in the interface guide, centred in
  the rules, and neither in the tables. There is no right-aligned Arabic anywhere in the 26
  frames.
- Claim, stated precisely so the park is not over-claimed: the text engine is doing its job.
  Bidi resolves correctly inside runs, evidenced by the sentence-final full stop landing at
  the LEFT of `SCATTER.` on `490` and `491`, by `ربح!` placing its bang at the left on `479`,
  and by the mode-card blurbs on `493` wrapping right to left correctly across two lines.
  **The failure is entirely in the box layout**: block order, alignment, marker side, icon
  side, table column order and panel chrome are all still LTR. That is the exact shape
  KNOWN_OPEN's RTL row predicts from "no `dir` attribute, no logical properties anywhere",
  and it is why the defect survives despite the strings being correct.
- Where fixable: tree-wide. `frontend/index.html:2` (`lang="en"`) is where the locale would
  have to reach the document, and every component that lays out a row would need physical
  properties migrated to logical ones. Not locked, but not localised either.
- Proposed fix: PARK(a tree-wide conversion, far larger than small). The evidence above is
  what the park needs; the fix is not this session's.

## STL-AR-A-06 MEDIUM Arabic headings and buttons inherit Latin tracked-caps letter-spacing, so cursive joins render with gaps

- Frames:
  `reports/screens/stream-test-2026-07-28/471_ar-desktop_intro_rules.png`,
  `reports/screens/stream-test-2026-07-28/485_ar-desktop_session_panel.png`,
  `reports/screens/stream-test-2026-07-28/487_ar-desktop_paytable_top.png`,
  `reports/screens/stream-test-2026-07-28/492_ar-desktop_paytable_05__.png`
- Claim: the rules-card confirm button on frame `471` renders `متابعة` with a visible gap
  between every glyph. Arabic supplies exactly one natural break in that word, after the
  non-joining `ا`; the frame shows roughly five. The same treatment is on the rules-card
  heading `لفات أوفردرايف المجانية` (`471`, `492`), the session panel title `معلومات الجلسة`
  (`485`) and the paytable title `جدول الدفع` (`487` and every paytable frame).
  Confirmed at source. `frontend/src/lib/components/PaytableModal.svelte:574-578` declares
  `.fs-pt-title { font-size: 1.35rem; font-weight: 900; letter-spacing: 0.2em;
  text-transform: uppercase; ... }`, and eleven further tracked declarations sit in the same
  file at `:427` (0.02em), `:607` (0.16em), `:624` (0.22em), `:659` (0.08em), `:662`
  (0.05em), `:674` (0.1em), `:685` (0.12em), `:700` (0.04em), `:702` (0.1em), `:713` (0.1em),
  `:772` (0.08em), `:779` (0.02em) and `:786` (0.12em). There is no `[lang="ar"]`, `:lang(ar)`
  or `direction`-scoped reset anywhere in `frontend/src`. The Latin headers on those same
  surfaces (`SCATTERS`, `BET MODES`, `MAX WIN`, `RTP`) are a deliberate tracked-caps display
  choice and read as intended; the Arabic inherits the same declaration, where it is not a
  style choice but a break in the script. The closest English equivalent is s p a c e d
  body text.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:574-578` and the twelve
  sibling declarations listed above. Not locked.
- Proposed fix: add one locale-scoped block resetting `letter-spacing: normal` for Arabic on
  the heading, button and label classes, rather than editing each declaration. Small.

## STL-AR-A-07 MEDIUM The max win is written `5,000×` and `5000×` on the same visible screen, from two different files

- Frames:
  `reports/screens/stream-test-2026-07-28/491_ar-desktop_paytable_04__.png`,
  `reports/screens/stream-test-2026-07-28/492_ar-desktop_paytable_05__.png`,
  `reports/screens/stream-test-2026-07-28/493_ar-desktop_paytable_06_bet_modes.png`
- Claim: on frame `491` the rules bullet reads
  `أقصى فوز في الدورة الواحدة محدود بـ 5,000× من إجمالي رهانك.` with a grouped `5,000×`, and
  the RTP bullet lower on the SAME frame reads
  `اللعبة الأساسية وشراء البونص يمنحان نسبة عائد 96.35٪. أقصى فوز 5000× الرهان.` with an
  ungrouped `5000×`. Both are on screen simultaneously on `491`, and both again on `492`. The
  bet-mode cards on `492` and `493` print `5,000×` in the `MAX WIN` column, so the ungrouped
  form is the odd one out of three.
  Source, exact: `frontend/src/lib/i18n/translations.ts:1581` is the ar
  `rulesOverdriveModes` and carries `أقصى فوز 5000× الرهان.` The English sibling at
  `frontend/src/lib/i18n/translations.ts:1555` carries `Maximum win 5,000× bet.`, and the
  card value comes from `frontend/src/lib/config/fsModes.ts:139`,
  `export const FS_MAX_WIN_LABEL = '5,000×'`. So the missing separator is in the ar
  translation value, not in the renderer. It is a class rather than a one-off: `pl` at
  `frontend/src/lib/i18n/translations.ts:1815` and `ru` at `:1867` both drop it too.
- Where fixable: `frontend/src/lib/i18n/translations.ts:1581` (and `:1815`, `:1867` for the
  same class). Not locked.
- Proposed fix: add the group separator so all three surfaces agree. Three characters.

## STL-AR-A-08 LOW The scatter card's award line wraps so a bare `/` orphans onto the second line and the free-spin counts split across the break

- Frames:
  `reports/screens/stream-test-2026-07-28/489_ar-desktop_paytable_02__.png`,
  `reports/screens/stream-test-2026-07-28/488_ar-desktop_paytable_01__1_.png`,
  `reports/screens/stream-test-2026-07-28/490_ar-desktop_paytable_03__.png`
- Claim: the `SCAT` card renders across two lines as
  line 1 `3 / 4 / 5 = 1× / 3× / 10× + 8` and
  line 2 `/ 12 / 16 دورة مجانية`.
  The award set `8 / 12 / 16` is broken across the wrap, so `8` is stranded on line 1 reading
  as though it belonged to `+ 8`, and line 2 opens with a bare `/`. A reader lands on
  `... 10× + 8` and has to reconstruct that the 8 belongs to the free-spin counts on the next
  line, not to the instant award before it.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:227-230`, the
  `{#if sym.name === 'SCAT'}` branch that composes the card body. The exact literal line:
  UNKNOWN, I located the branch but did not read it.
- Proposed fix: bind the award set with non-breaking spaces, or drop the spaces around the
  slashes so `8/12/16` cannot break. Small.

## STL-AR-A-09 LOW Arabic punctuation is inconsistent between the two translation files, source-cited rather than frame-visible

- Frames: none in my range. This one is cited from source only and is flagged as such because
  the string it names sits on the max win overlay, frame `517`, outside 468 to 493.
- Claim: `frontend/src/lib/i18n/translations.ts:342` reads
  `wincap: 'الفوز الأقصى, 5,000×!'`, using an ASCII comma `,` inside Arabic prose, while
  `frontend/src/lib/i18n/prose.locales.ts:50` uses the Arabic comma `،` in the same locale
  (`تُحتسب كل مواضع الرموز المتطابقة، بدون خطوط دفع ثابتة.`), and that Arabic comma renders
  correctly on frame `487`. The same file also shows the two percent conventions are split
  the right way round for Arabic but not consistently applied:
  `frontend/src/lib/i18n/translations.ts:1581` correctly uses the Arabic percent `٪`
  (`96.35٪`), while frames `483` and `484` render the audio sliders as `50%` and `80%` with
  the ASCII `%`, which is a formatter output rather than a translated string.
- Where fixable: `frontend/src/lib/i18n/translations.ts:342` for the comma. The slider
  percent formatter: UNKNOWN.
- Proposed fix: one character for the comma. The percent sign is PARK(deciding whether `٪`
  or `%` is the house convention for ar is an owner call, and it has to be made once for both
  files rather than per string).

## STL-AR-A-10 LOW Every numeral on the Arabic session is a Western digit with Latin grouping and decimal marks

- Frames: all 26, representatively
  `reports/screens/stream-test-2026-07-28/487_ar-desktop_paytable_top.png` (`1,024`),
  `reports/screens/stream-test-2026-07-28/493_ar-desktop_paytable_06_bet_modes.png` (`96.35%`),
  `reports/screens/stream-test-2026-07-28/484_ar-desktop_hud_menu.png` (`50%`, `80%`),
  `reports/screens/stream-test-2026-07-28/473_ar-desktop_base_idle.png` (`$50,000.00`)
- Claim: no Eastern Arabic-Indic digit (`٠١٢٣٤٥٦٧٨٩`) renders anywhere in the 26 frames.
  Grouping is `,` and the decimal mark is `.` throughout, the Latin convention rather than
  the `٬` and `٫` used in several `ar` locales. Recorded as a DECISION TO CONFIRM rather than
  asserted as a defect: Western digits with Latin separators are the majority convention on
  Gulf-facing gaming and finance surfaces, and a game whose wallet reports USD has a
  reasonable case for them. It is listed because the audit should know a choice was made, and
  because it is not recorded anywhere as a choice.
- Where fixable: `frontend/src/lib/utils/currency.ts` (the `localeTag` passed to every
  formatter is where a numbering-system subtag would go). Not locked.
- Proposed fix: PARK(an owner call on the target `ar` market, not a builder call). Record the
  answer either way so it becomes a decision rather than a default.

## Q-16 audit, the assigned question: which parked strings are still English on a localised frame

The park lists roughly 35 hardcoded English keys. An English session cannot tell a keyed
string from a hardcoded one. This session can. Every row below is decided from a frame, and
the source line is given where I found it.

### Still English, and VISIBLE on stream frames (these raise the park's urgency)

| Q-16 string | Frame | What renders, and the literal |
|---|---|---|
| `Session` | `484_ar-desktop_hud_menu.png`, `483_ar-desktop_transition_menu_opening.png` | Renders `Session` in English as the second HUD menu item, directly beneath the fully translated `جدول الدفع` and directly above `Mute`. The panel it opens is itself titled `معلومات الجلسة` on frame `485`, so the menu item is English while the surface behind it is Arabic. Literal at `frontend/src/lib/components/HudOverlay.svelte:429`, and **duplicated verbatim three more times** at `:547`, `:656` and `:818`, so the fix is four call sites, not one. |
| `Mute` | `484_ar-desktop_hud_menu.png`, `483_ar-desktop_transition_menu_opening.png` | Renders `Mute` in English as the third HUD menu item, immediately above the two fully translated audio sliders `الموسيقى` and `الصوت`. Literal at `frontend/src/lib/components/HudOverlay.svelte:432`, `{$isMuted ? 'Unmute' : 'Mute'}`, duplicated at `:575`, `:659` and `:821`. The frames are unmuted, so only the `Mute` half is frame-evidenced; the `Unmute` half is proved from source. |
| `BET MODES`, as a paytable section header sibling | `492_ar-desktop_paytable_05__.png`, `493_ar-desktop_paytable_06_bet_modes.png` | Renders `BET MODES` in English as a full-width centred section heading, in the same slot and the same tracked-caps treatment as the translated headings `دفعات الرموز`, `القواعد`, `لفات أوفردرايف المجانية` and `دليل الواجهة` above and below it. Q-16 says "and siblings", so this is a Q-16 row. |

**The single most useful thing this session can tell the park about `BET MODES`: it is NOT
an unkeyed string.** The key exists and is fully translated. `betModesHeading` is declared at
`frontend/src/lib/i18n/translations.ts:115`, and its ar value `'أوضاع الرهان'` sits at
`frontend/src/lib/i18n/translations.ts:359` beside `'EINSATZMODI'`, `'MODOS DE APUESTA'`,
`'PANOSTILAT'`, `'MODES DE MISE'`, `'MODE TARUHAN'` and the rest of the sixteen. It is
already USED, correctly, at `frontend/src/lib/components/FeatureMenu.svelte:509`
(`{$tr('betModesHeading')}`). The paytable simply does not call it:
`frontend/src/lib/components/PaytableModal.svelte:302` reads
`<h3 class="fs-heading" ...>{$isSocial ? 'Play Modes' : 'Bet Modes'}</h3>`.
So this Q-16 row is a **one-line call-site fix, not a sixteen-locale key addition**, and it
should be lifted out of the park rather than left in it. It is also a warning about the park's
shape: the park is sized as "about 35 keys, about 560 translated values", and at least one of
those 35 needs no key and no values at all.

### Already overtaken by the prose layer (the park is smaller than recorded by these)

| Q-16 string | Frame | What renders instead |
|---|---|---|
| `Symbol Payouts` | `487_ar-desktop_paytable_top.png`, `488`, `489`, `490` | `دفعات الرموز`, translated. Key confirmed at `frontend/src/lib/i18n/prose.locales.ts:52`, `symbolPayoutsHeading`. |
| `Interface Guide` | `493_ar-desktop_paytable_06_bet_modes.png` | `دليل الواجهة`, translated. Key at `frontend/src/lib/i18n/prose.locales.ts:57`, `interfaceGuideHeading`. |
| paytable rules header | `490_ar-desktop_paytable_03__.png`, `491` | `القواعد`, translated. Key at `frontend/src/lib/i18n/translations.ts:353`. |
| free-spins section header | `491_ar-desktop_paytable_04__.png`, `492`, and the intro card `471` | `لفات أوفردرايف المجانية`, translated. |
| ways-to-win header and body | `487_ar-desktop_paytable_top.png`, `488`, `489` | `طرق الفوز`, plus the body `تُحتسب كل مواضع الرموز المتطابقة، بدون خطوط دفع ثابتة.` at `frontend/src/lib/i18n/prose.locales.ts:50` and the diagram caption at `:51`. |
| free-spins table columns 2 and 3 | `491`, `492` | `دورات مجانية` and `جائزة فورية`, keyed at `frontend/src/lib/i18n/prose.locales.ts:54` and `:55`. Column 1 is NOT, see STL-AR-A-02. |
| cost label on the mode cards | `492`, `493` | `التكلفة`, keyed at `frontend/src/lib/i18n/prose.locales.ts:56`. |
| session panel | `485_ar-desktop_session_panel.png` | Title `معلومات الجلسة` and all five row labels `مدة اللعب`, `اللفات`, `إجمالي الرهان`, `إجمالي الفوز`, `النتيجة الصافية`, all translated. |
| buy-feature bar label | `491_ar-desktop_paytable_04__.png`, `492` | `شراء الميزة`, translated. |
| splash continue hint | `469_ar-desktop_splash.png`, `468` | `اضغط للمتابعة`, translated. |
| rules-card confirm button | `471_ar-desktop_intro_rules.png` | `متابعة`, translated. |
| HUD pod labels, max pill, spin label | `473_ar-desktop_base_idle.png` | `الرصيد`, `ربح`, `رهان`, `الأقصى`, `دوران`, all translated. |
| features pill | `473_ar-desktop_base_idle.png` | `الميزات`, translated. |
| audio slider labels | `484_ar-desktop_hud_menu.png` | `الموسيقى`, `الصوت`, translated. |
| win callout | `479_ar-desktop_win_presentation.png` | `ربح!`, translated, with the bang correctly at the left. |
| mode names 1 and 2 | `492`, `493` | `عادي`, `كروز`, translated via `{$tr(m.labelKey)}` at `PaytableModal.svelte:308`. |
| win banner tier | `482_ar-desktop_bigwin_settled.png` | Arabic `فوز كبير`. Already established as TR-104's closed half; listed only to complete the sweep. |

### Not decidable from this frame range

`Stop on win`, `Loss limit` and `Spins` (the autoplay panel labels) sit on frame `498`, and
`Press COLLECT or hit Enter to continue` sits on the max win overlay at frame `517`. Both are
outside 468 to 493 and belong to another squad. `Unmute` is proved from source but not from a
frame. Aria labels are not frame-decidable at all.

### The conclusion the park needs

The park is **both smaller and larger than recorded, and larger is the more important half.**

Smaller, in two distinct ways. Sixteen surfaces Q-16 would have predicted to render English
now render Arabic, so the prose layer has genuinely overtaken a real share of the list, and
the paytable section headers in particular are largely done. And separately, `BET MODES` is
keyed, translated into all sixteen locales, and already used correctly elsewhere, so it
carries none of the cost the park attributes to it.

Larger, and this is what should move the park's priority. Three parked strings are still
English on surfaces a streamer opens routinely (`Session`, `Mute`, `BET MODES`), and `Session`
and `Mute` each exist FOUR times in `HudOverlay.svelte`, so the park under-counts its own call
sites. Beyond that, STL-AR-A-01 and STL-AR-A-02 found four more player-visible English strings
that Q-16's enumeration does not contain at all (`ways`, `Max win is quoted against the base
bet.`, `Scatters`, `Max Win`), and one of them, `ways`, is on screen during every win rather
than behind a menu.

A park whose list has been partly cleared without the list being updated, which counts one
already-keyed string as needing sixteen values, which misses three of four duplicate call
sites, and which never reached table headers or body sentences, is the same failure MID-02
recorded against Q-26: an enumeration that calls itself complete and is not. Re-derive it from
the component tree before the park is next reviewed, and re-derive it from a NON-ENGLISH
session, because an English one cannot see the difference by construction.

## Explicit absences, signed

- **No clipped, ellipsised or overflowing Arabic string.** I checked every text container in
  all 26 frames for a `…`, a hard cut at a container edge, or a glyph crossing its border. The
  HUD pod labels and values on `473` to `485`, the mode-card titles and blurbs on `492` and
  `493`, the session panel rows on `485`, the rules bullets on `490` and `491` and the menu
  items on `483` and `484` all sit inside their boxes. This is the category I expected to have
  most of, and the frames explain why it is empty: Arabic here is consistently SHORTER than
  the English it replaces, so it leaves the dead space recorded in STL-AR-A-05 rather than
  overflowing. The bottom-of-frame cuts on `487` and `488` are the scroll fold, not clipping,
  confirmed by the same content appearing complete on `489` and `490`. TR-115 / TR-086's
  money-pod fit class did not reproduce on this session at this viewport.
- **No mis-rendered, disconnected or missing Arabic glyph.** Every Arabic string in the 26
  frames is correctly shaped and joined; no isolated-form runs, no tofu boxes, no reversed
  glyph order inside a word, no Latin fallback face on Arabic text. The letter-spacing in
  STL-AR-A-06 is a gap between correctly joined glyphs, not a shaping failure, and is reported
  as spacing for that reason. Q-07's allowlisted infinity glyph does not appear in this range.
- **No bidi mangling inside a text run.** I looked specifically for the classic failures: a
  sentence-final full stop stranded on the wrong side, a number sequence reversed, a Latin
  term reordered out of position. None occurred. `SCATTER.` on `490` and `491` places its full
  stop correctly at the left; `ربح!` on `479` places its bang correctly at the left;
  `00:00:22` on `485` and `96.35` on `491` read correctly; the two-line blurbs on `493` wrap
  right to left correctly. The one wrap defect I did find, STL-AR-A-08, is a break-point
  problem, not a direction problem. This absence is load-bearing for STL-AR-A-05: it is what
  lets that finding say the defect is in the layout and not in the text engine.
- **No motion or composition problem unique to this locale.** The splash entrance (`468`), the
  splash-to-rules fade (`470`), the rules-to-base fade (`472`), the reel acceleration (`474`)
  and full speed (`475`), the menu open (`483`) and the paytable open (`486`) all compose the
  way an LTR session would, and nothing in them is driven by string length. The reels fill
  left to right on `474` and the ways diagram runs `1 → 2 → 3 → 4 → 5` left to right on `487`,
  which is CORRECT and not a defect: the Arabic copy says so explicitly on the same frame
  (`طابِق الرموز على بكرات متجاورة بدءًا من البكرة 1 (من اليسار إلى اليمين).` and the diagram
  caption at `frontend/src/lib/i18n/prose.locales.ts:51`), so the copy, the diagram and the
  maths agree, and a mirrored reel order would have contradicted all three.
- **No date renders anywhere in the 26 frames**, so the date-format channel of this lens has
  nothing to report. `00:00:22` on `485` is an elapsed duration, not a date, and is
  format-neutral.
- **`RTP` is deliberately NOT reported as an English-on-localised finding.** It renders in
  Latin on all five mode cards on `492` and `493` from the literal at
  `frontend/src/lib/components/PaytableModal.svelte:325`, but the ar translation itself keeps
  the term in Latin at `frontend/src/lib/i18n/prose.locales.ts:58`
  (`rtpAllModes: 'RTP (جميع الأوضاع الـ5)'`), so the project has already decided RTP is a term
  of art rather than a missing key. Signed as a non-finding so nobody re-opens it, and so the
  contrast with `Max Win` on the very next stat, which has no such defence, is on the record.
- **Handed on rather than claimed, because it is another squad's lens**: three pairs in my
  range are pixel-identical where the manifest says one is a transition and the other a
  settled state. `483` (`transition_menu_opening`) against `484` (`hud_menu`), `486`
  (`transition_paytable_opening`) against `487` (`paytable_top`), and `476` against `477`
  (`dead_spin_1_settled` against `dead_spin_2_settled`, identical boards down to the symbol).
  I opened no finding, because these are capture-timing or motion questions rather than
  localisation ones, but a transition frame identical to its settled frame is either a capture
  defect or a missing animation and somebody should decide which.

## KNOWN matches

- KNOWN(TR-104): `reports/screens/stream-test-2026-07-28/482_ar-desktop_bigwin_settled.png`,
  `481_ar-desktop_transition_bigwin_countup_late.png`,
  `480_ar-desktop_transition_bigwin_countup_early.png`. The tier renders Arabic `فوز كبير` and
  the unit renders `16x BET` in English on all three. Fresh ar-desktop evidence for the open
  half; not re-reported as new, per the brief.
- KNOWN(MID-01):
  `reports/screens/stream-test-2026-07-28/480_ar-desktop_transition_bigwin_countup_early.png`.
  The banner reads `$10.29` while the HUD `ربح` pod already reads `$15.95`, on a win that
  settles at `$16.20` on `481` and `482`. This is the ar-desktop sibling of the `013`/`015`
  pattern the ledger says exists in every session, and it reproduces to the cent: the ledger
  derived a pod reading of `$15.96` for a banner of `$10.29`, and this frame reads `$15.95`,
  the same one-cent agreement the desktop frame gave.
- KNOWN(MID-02): `reports/screens/stream-test-2026-07-28/480`, `481` and `482`
  (`_ar-desktop_transition_bigwin_countup_early.png`,
  `_ar-desktop_transition_bigwin_countup_late.png`, `_ar-desktop_bigwin_settled.png`). The
  banner unit renders `16x BET` with the ASCII letter `x`. Note beside it: STL-AR-A-01 found a
  SIXTH instance of the same class at
  `frontend/src/lib/components/WinBreakdown.svelte:93`, which is in neither `fsModes.ts` nor
  `WinBanner.svelte`, so MID-02's own widening of Q-26 is itself still one file short.
- KNOWN(Q-26):
  `reports/screens/stream-test-2026-07-28/493_ar-desktop_paytable_06_bet_modes.png` and
  `492_ar-desktop_paytable_05__.png`. The `OVERBOOST` card blurb renders `1.6` and `1.25` each
  followed by a Latin multiplier letter, and the `NITRO OVERDRIVE` card blurb renders `5`
  followed by one, matching Q-26's enumeration of `1.6x`, `1.25x` twice and `5x` in the
  `fsModes.ts` blurbs. Q-26 records these as "Wave 3 fix candidate if visible on frames": they
  are visible, on two frames, at a stream viewport.
- KNOWN(Q-16): see the dedicated Q-16 section above, which is the assigned question and
  carries the frame-by-frame decision for every string this range could decide, plus the
  `betModesHeading` finding that shrinks one row of the park to a one-line fix.
- KNOWN(RTL): see STL-AR-A-05, which is the frame evidence KNOWN_OPEN's RTL row asks the ar
  squad to supply, with the mechanism re-confirmed by a source grep returning no `dir=`, no
  `direction: rtl` and no `documentElement.lang` anywhere in `frontend/src` or
  `frontend/index.html`.
- KNOWN(Q-34): NOT observable on this session, recorded so its absence here is not read as
  evidence it is fixed. The mode reads `كروز` on the paytable cards (`492`, `493`), and Arabic
  has no letter case, so the `Cruise` against `CRUISE` split Q-34 records cannot be seen on an
  Arabic frame in either direction.

tree_after: `git status --porcelain`, run at the end of this squad's run, verbatim:

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

Every line is `??`, untracked. **Nothing is MODIFIED and nothing is DELETED.** One of the 33
lines is mine (`STL-AR-A.md`); the other 32 are other squads' shards, which are not mine and
not my problem. No source file, no evidence directory and no committed file was touched by
this squad; the only write was the shard at the assigned path.
