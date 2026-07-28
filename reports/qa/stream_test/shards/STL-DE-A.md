# STL-DE-A, localisation, all five channels (de-desktop, frames 416 to 441)

scope: every `de-desktop` frame numbered 416 to 441 inclusive, 26 frames, viewport
1200x675, `lang: de` per `reports/screens/stream-test-2026-07-28/MANIFEST.json`.
frames_read: 26

Session covered: splash entrance, splash, splash to rules, rules card, rules to base,
base idle, two spin transitions, three dead spins, win presentation, big win count-up
early and late, big win settled, menu opening, HUD menu, session panel, paytable opening
and paytable sections 01 to 06.

Frame paths below are abbreviated after the first use in each finding; every one lives
under `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/`.

---

## STL-DE-A-01 STREAM The German paytable states the max win twice in one view with two different thousands separators, so one line reads as `5` and the other as `5000`

- Frames:
  - `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/439_de-desktop_paytable_04_regeln.png`
  - `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/440_de-desktop_paytable_05_overdrive_freispiele.png`
  - `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/441_de-desktop_paytable_06_bet_modes.png`
  - `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/434_de-desktop_transition_paytable_opening.png`
  - `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/435_de-desktop_paytable_top.png`
  - `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/436_de-desktop_paytable_01_kombiniere_gleiche_symbole_auf_ben.png`
  - `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/437_de-desktop_paytable_02_gewinnwege.png`
  - `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/438_de-desktop_paytable_03_symbolauszahlungen.png`

- Claim: frame `439` carries both of these lines in a single scroll view, five rows apart:

  `Der Maximalgewinn pro Drehung ist auf 5,000× deinen Gesamteinsatz begrenzt.`

  `Basisspiel und Bonuskauf zahlen beide 96,35 % RTP. Maximalgewinn 5.000× Einsatz.`

  The same quantity is written `5,000×` on the first line and `5.000×` on the second. In
  German the comma is the DECIMAL separator and the full stop is the thousands separator,
  so the first line states the cap as five times the total bet and the second as five
  thousand times. They differ by a factor of 1000 and they are on screen together.

  **Both strings are hand-written German translation data, so this is not an interpolation
  accident, it is two German values disagreeing with each other.**
  `frontend/src/lib/i18n/prose.locales.ts:142` is
  `rulesMaxWin: 'Der Maximalgewinn pro Drehung ist auf 5,000× deinen Gesamteinsatz begrenzt.'`
  and `frontend/src/lib/i18n/translations.ts:1607` is
  `rulesOverdriveModes: 'Basisspiel und Bonuskauf zahlen beide 96,35 % RTP. Maximalgewinn 5.000× Einsatz.'`.
  A third German value, `translations.ts:425` `wincap: 'MAXIMALER GEWINN, 5.000×!'`, agrees
  with the second. So the German locale writes this one figure correctly in two places and
  incorrectly in one, and the incorrect one is the rules line that states the cap.

  Beside that, the shared constant that feeds the mode cards has no locale route at all:
  `frontend/src/lib/config/fsModes.ts:139` is `export const FS_MAX_WIN_LABEL = '5,000×'`,
  a single en-US literal, and it renders in the `MAX WIN` cell of all five mode cards on
  frames `440` and `441` as `5,000×`. Frame `440` therefore shows the correct `5.000×` in
  prose and the incorrect `5,000×` four times in cards, without scrolling.

  Same class, same frames: `frontend/src/lib/components/PaytableModal.svelte:193` hardcodes
  the ways count as the literal `<span class="fs-ways-num fs-num">1,024</span>`, which
  renders on frames `434`, `435`, `436` and `437` directly above the German label
  `GEWINNWEGE`. German writes `1.024`; read as German, `1,024` is one point zero two four.
  And the symbol payout cells on `436`, `437` and `438` (`1.5`, `0.8`, `0.45`, `0.3`, `0.2`,
  `0.15`, `0.1`, `0.08`, `0.65`, `0.25`, `0.6`) all use the en-US dot decimal in a document
  whose own prose writes `96,35 %`.

- Where fixable: `frontend/src/lib/i18n/prose.locales.ts:142` (the wrong German value);
  `frontend/src/lib/config/fsModes.ts:139` and `:138` (the two en-US shared constants);
  `frontend/src/lib/components/PaytableModal.svelte:193` (the hardcoded `1,024`). None
  locked.

- Proposed fix: correct `prose.locales.ts:142` to `5.000×` immediately, which is a
  one-character edit that removes the self-contradiction and the 1000-fold misread. Then
  PARK(the wider job) for the shared constants: `FS_MAX_WIN_LABEL`, `FS_RTP_LABEL` and the
  `1,024` literal all need to become locale-formatted values rather than en-US strings, and
  that is a sixteen-locale change across the paytable and the buy dialogs, sized like
  TR-091 rather than small.

---

## STL-DE-A-02 HIGH A complete untranslated English sentence renders in the middle of the German paytable

- Frames: `441_de-desktop_paytable_06_bet_modes.png`

- Claim: centred directly beneath the five bet-mode cards, between the German card blurbs
  and the German section heading `BEDIENELEMENTE`, the paytable renders:

  `Max win is quoted against the base bet.`

  This is not a jargon token or a loanword. It is a full English sentence in sentence case
  inside a German document, and it is the only English sentence on the surface, so it reads
  as an untranslated leftover rather than a deliberate borrowing.

  The source is `frontend/src/lib/config/fsModes.ts:189-193`:

  ```
  export function maxWinFootnote(social: boolean): string {
    return social
      ? 'Max win is quoted against the base play amount.'
      : 'Max win is quoted against the base bet.'
  }
  ```

  Hardcoded English on BOTH social branches with no locale route, rendered at
  `frontend/src/lib/components/PaytableModal.svelte:350` as `{maxWinFootnote($isSocial)}`.
  **That is exactly TR-104's shape**, and exactly the gate blind spot KNOWN_OPEN records:
  `locale_completeness_check.mjs` cannot see a script-block literal rendered through a
  variable. It is NOT in the Q-16 park's enumeration, which lists section headers and
  control labels but no prose sentence on this surface.

- Where fixable: `frontend/src/lib/config/fsModes.ts:189-193`, rendered at
  `frontend/src/lib/components/PaytableModal.svelte:350`. Neither locked.

- Proposed fix: give both branches prose keys and translate across the sixteen locales, the
  same treatment the neighbouring `REGELN` bullets already have in `prose.locales.ts`.

---

## STL-DE-A-03 HIGH The win-line breakdown strip renders `ways` in English on every winning spin, and reads `1 ways` when there is one way

- Frames:
  - `429_de-desktop_transition_bigwin_countup_late.png`
  - `430_de-desktop_bigwin_settled.png`

- Claim: the strip under the reel frame reads, verbatim:

  frame `429`: `L3   x4   1 ways   $0.20`

  frame `430`: `M3   x5   8 ways   $16.00`

  The source is `frontend/src/lib/components/WinBreakdown.svelte:94`:
  `<span class="wb-ways">{current.ways} ways</span>`. Hardcoded English noun concatenated
  onto a count, with no locale key and no singular form.

  `ways` is English on a German session. The paytable on frames `434` to `437` proves the
  translated term exists and is `GEWINNWEGE`, and the German rules bullet on frame `438`
  uses `Gewinnweg` and `Gewinnwege` in running prose, so this surface disagrees with the
  paytable about the name of the game's central mechanic.

  Two further defects in the same string, both visible in the transcription above: `1 ways`
  is ungrammatical in English as well as untranslated, because the noun is a fixed literal;
  and the count prefix at `WinBreakdown.svelte:93` is `<span class="wb-count">x{current.kind}</span>`,
  the ASCII letter `x` U+0078, on a surface whose own paytable writes `1× / 3× / 10×` with
  U+00D7 two frames earlier.

  This strip is on screen for every winning spin, not only big wins, so it is the most
  frequently repeated English string in the German session.

- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:93-94`. Not locked.

- Proposed fix: key the unit with a plural rule per locale (`1 Gewinnweg` / `8 Gewinnwege`)
  and change `x` at line 93 to `×`. The glyph half is a one-character edit; the plural half
  needs a sixteen-locale pair of values.

---

## STL-DE-A-04 HIGH One German session displays money in two different conventions, both visible in a single frame, because four call sites omit the locale argument that two others pass

- Frames: `433_de-desktop_session_panel.png`

- Claim: the session panel `Sitzungsinformationen` renders five rows:

  `Spielzeit` `00:00:22`
  `Drehungen` `5`
  `Gesamteinsatz` `5,00 $`
  `Gesamtgewinn` `20,10 $`
  `Nettoergebnis` `+$15.10`

  Two of the three money rows use the German convention (comma decimal, trailing symbol) and
  the third, `Nettoergebnis`, uses the en-US convention (leading `$`, dot decimal). Adjacent
  rows, one panel.

  **The cause is one missing argument, and the file proves it against itself.**
  `frontend/src/lib/components/SessionPanel.svelte:114-115` call
  `formatBalance($rgSession.wageredMicros, cur, $locale)` and
  `formatBalance($rgSession.wonMicros, cur, $locale)`, WITH the locale. Line 70 is
  `$: netLabel = (net >= 0 ? '+' : '-') + formatBalance(Math.abs(net), cur)`, WITHOUT it.
  `formatBalance` is declared at `frontend/src/lib/utils/currency.ts:172` and formats through
  `amount.toLocaleString(localeTag, ...)` at `:190` and `:201`, so an omitted `localeTag`
  falls back to the default and renders en-US.

  The same omission is why the whole HUD is en-US:
  `frontend/src/lib/components/HudOverlay.svelte:287`, `:288` and `:366` all call
  `formatBalance(..., $currencyCode || 'USD')` with no third argument, which is why the pods
  behind the panel in frame `433` read `$50,000.00`, `$16.20` and `$1.00` under the German
  labels `GUTHABEN`, `GEWINN` and `EINSATZ`. Frame `433` alone therefore carries three
  surfaces disagreeing about how this game writes money, with the German-correct form on
  exactly one of them.

  `SessionPanel.svelte:129` then feeds the same unlocalised `netLabel` into the
  responsible-gaming reality-check body, so the defect propagates into compliance text.

  The figures themselves are consistent (`20,10` minus `5,00` is `15,10`), so this is a
  formatting split rather than an arithmetic one.

- Where fixable: `frontend/src/lib/components/SessionPanel.svelte:70` and
  `frontend/src/lib/components/HudOverlay.svelte:287,288,366`. `formatBalance` itself is
  correct at `frontend/src/lib/utils/currency.ts:172`. None locked.

- Proposed fix: pass `$locale` as the third argument at all four sites, matching
  `SessionPanel.svelte:114-115`. Then make the argument required rather than optional in
  `currency.ts:172` so the next call site cannot forget it, which is what let four of them
  drift from two.

---

## STL-DE-A-05 HIGH `BET MODES` and `MAX WIN` render in English on the German paytable, beside the translated `KOSTEN`

- Frames:
  - `441_de-desktop_paytable_06_bet_modes.png`
  - `440_de-desktop_paytable_05_overdrive_freispiele.png`

- Claim: two separate hardcoded English strings on one surface.

  **The section header.** Frame `441` renders `BET MODES` as the section heading with the
  German `BEDIENELEMENTE` heading in the same view below it, and frame `440` renders it
  directly under the German `FEATURE KAUFEN` bar. Source is
  `frontend/src/lib/components/PaytableModal.svelte:302`:
  `<h3 class="fs-heading" ...>{$isSocial ? 'Play Modes' : 'Bet Modes'}</h3>`. Hardcoded
  English on both social branches, no locale route. This is a sibling of the paytable
  section headers the Q-16 park enumerates, so it is reported under KNOWN(Q-16) below as
  well as here for its source.

  **The column header.** Each mode card carries `KOSTEN`, `RTP`, `MAX WIN`. On frame `441`
  all five cards (`Normal`, `Cruise`, `OVERBOOST`, `Overdrive kaufen`, `NITRO OVERDRIVE`)
  show it. `KOSTEN` is translated German, `RTP` is a universal abbreviation, `MAX WIN` is
  English; German would be `MAX. GEWINN` or `HÖCHSTGEWINN`. Source is
  `frontend/src/lib/config/fsModes.ts:177-179`:

  ```
  export function maxWinStatLabel(): string {
    return 'Max Win'
  }
  ```

  rendered at `frontend/src/lib/components/PaytableModal.svelte:337` and uppercased by CSS.
  **This one is NOT in the Q-16 park's enumeration.** The park lists autoplay labels,
  paytable SECTION headers, the max win overlay line and `Mute`/`Unmute`; a column header
  inside a mode card is none of those. Note that a translated key for the same words already
  exists at `frontend/src/lib/i18n/translations.ts:229` (`hudMaxWin: 'MAX WIN'`) for the
  in-feature HUD field, so the paytable is the surface that never got wired to it.

- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:302` and
  `frontend/src/lib/config/fsModes.ts:177-179` (rendered at `PaytableModal.svelte:337`).
  Neither locked.

- Proposed fix: key both. The column header can reuse the existing `hudMaxWin` key rather
  than adding a seventeenth value, which also removes a second source of truth for the same
  two words.

---

## STL-DE-A-06 HIGH German is the only one of the sixteen locales that left `FEATURES` untranslated, and it is on the permanently visible HUD

- Frames: sixteen of my twenty-six frames carry it. Clearest:
  `421_de-desktop_base_idle.png`, `420_de-desktop_transition_rules_to_base.png`,
  `424_de-desktop_dead_spin_1_settled.png`, `425_de-desktop_dead_spin_2_settled.png`,
  `426_de-desktop_dead_spin_3_settled.png`, `427_de-desktop_win_presentation.png`,
  `428_de-desktop_transition_bigwin_countup_early.png`,
  `429_de-desktop_transition_bigwin_countup_late.png`, `430_de-desktop_bigwin_settled.png`,
  `431_de-desktop_transition_menu_opening.png`, `432_de-desktop_hud_menu.png`,
  `433_de-desktop_session_panel.png`, `418_de-desktop_transition_splash_to_rules.png`,
  `419_de-desktop_intro_rules.png`, `422_de-desktop_transition_reels_accelerating.png`,
  `423_de-desktop_transition_reels_full_speed.png`.

- Claim: the pill button to the right of the reel frame reads `FEATURES` in every one of
  those frames, while every other permanent HUD label is translated (`GUTHABEN`, `GEWINN`,
  `EINSATZ`, `DREHEN`).

  **This is a keyed string whose German VALUE was left as the English one.** The component
  is correct: `frontend/src/lib/components/FeatureMenu.svelte:179` and `:283` both render
  `{$tr('hudFeatures')}`. The data is not.
  `frontend/src/lib/i18n/translations.ts:396` is the German block's
  `hudFeatures: 'FEATURES'`. Every other non-English locale in the same file translated it:
  `:313` ar `'الميزات'`, `:479` es `'FUNCIONES'`, `:562` fi `'OMINAISUUDET'`, `:645` fr
  `'FONCTIONS'`, `:728` hi `'फ़ीचर'`, `:811` id `'FITUR'`, `:894` ja `'フィーチャー'`, `:977`
  ko `'피처'`, `:1060` pl `'FUNKCJE'`, `:1143` pt `'RECURSOS'`, `:1226` ru `'ФУНКЦИИ'`,
  `:1309` tr `'ÖZELLİKLER'`, `:1392` vi `'TÍNH NĂNG'`, `:1475` zh `'功能'`.

  Fifteen locales translated, German did not. That removes the "it is an accepted German
  loanword" defence: even the two locales that chose a transliteration (`フィーチャー`,
  `피처`) changed the script. German alone ships the English word verbatim, which is an
  omission rather than a style decision. Because a completeness gate that compares a value
  to its English source would see a match, nothing catches it.

- Where fixable: `frontend/src/lib/i18n/translations.ts:396`. Not locked.

- Proposed fix: set the de value to `FUNKTIONEN`. One-word data edit, no component change.
  If the owner deliberately wants `FEATURES` on de, record that beside the value so the next
  audit does not reopen it.

---

## STL-DE-A-07 MEDIUM The same feature is named `OVERDRIVE FREISPIELE` in the paytable's headings and `Overdrive Free Spins` inside the paytable's own German blurbs

- Frames:
  - `440_de-desktop_paytable_05_overdrive_freispiele.png` (heading and first blurb in ONE view)
  - `439_de-desktop_paytable_04_regeln.png` (heading)
  - `441_de-desktop_paytable_06_bet_modes.png` (blurbs)
  - `419_de-desktop_intro_rules.png` (rules card heading)

- Claim: the German rules card (`419`) and the German paytable heading (`439`, `440`) both
  name the feature `OVERDRIVE FREISPIELE`. Two bet-mode blurbs name it in English inside an
  otherwise German sentence:

  `Standardspiel. Overdrive Free Spins starten bei 3+ Scatter.`

  `Kaufe einen garantierten Einstieg in Overdrive Free Spins.`

  Both are German translation data that kept the English feature name:
  `frontend/src/lib/i18n/prose.locales.ts:116` `modeNormalBlurb` and `:122` `modeBonusBlurb`.
  Frame `440` carries the heading and the first blurb in the same view, so no scrolling is
  needed to see one document use two names for one feature.

- Where fixable: `frontend/src/lib/i18n/prose.locales.ts:116,122`. Not locked.

- Proposed fix: replace the English feature name inside the two German blurbs with
  `Overdrive Freispiele`, matching the heading. Two data edits. Sweep the other fifteen
  locales for the same shape while the file is open, because a blurb that kept an English
  proper noun is unlikely to be a German-only slip.

---

## STL-DE-A-08 MEDIUM The RTP figure is written two ways in one view: `96,35 %` in the prose and `96.35%` in the cards

- Frames:
  - `440_de-desktop_paytable_05_overdrive_freispiele.png` (both forms in a single view)
  - `441_de-desktop_paytable_06_bet_modes.png`
  - `431_de-desktop_transition_menu_opening.png`
  - `432_de-desktop_hud_menu.png`

- Claim: frame `440` carries the German prose bullet
  `Basisspiel und Bonuskauf zahlen beide 96,35 % RTP. Maximalgewinn 5.000× Einsatz.`
  (`frontend/src/lib/i18n/translations.ts:1607`) and, about eighty pixels below it, four
  bet-mode cards whose `RTP` cells each read `96.35%`, from the en-US constant
  `frontend/src/lib/config/fsModes.ts:138` `export const FS_RTP_LABEL = '96.35%'`.

  German writes `96,35 %`, comma decimal and a space before the sign. The prose gets it
  right and the shared constant does not, in the same view, for the same number. Frame `441`
  repeats it across five cards and again in running German prose:
  `Ruhigere Fahrt: häufigere kleinere Gewinne, unverändert 96.35% RTP.`

  A third convention exists: the audio sliders in the HUD menu (frames `431`, `432`) render
  `50%` and `80%` with no space, so the app ships at least two percent conventions and
  neither matches the German prose.

- Where fixable: `frontend/src/lib/config/fsModes.ts:138`. Not locked.

- Proposed fix: same shared locale-aware formatter as STL-DE-A-01; percent is one of its
  cases. PARK(it is the same sixteen-locale job as STL-DE-A-01's second half and should be
  done once, not twice).

---

## STL-DE-A-09 LOW `Scatters` renders as an English plural in the Overdrive table header, between two keyed German headers, on the same line of markup

- Frames:
  - `439_de-desktop_paytable_04_regeln.png`
  - `440_de-desktop_paytable_05_overdrive_freispiele.png`

- Claim: the three-column Overdrive table header renders
  `SCATTERS`   `FREISPIELE`   `SOFORTPRÄMIE`.

  `frontend/src/lib/components/PaytableModal.svelte:259` is
  `<tr><th>Scatters</th><th>{$tr('colFreeSpins')}</th><th>{$tr('colInstantAward')}</th></tr>`.
  Two of the three headers on that one line go through `$tr` and the first is a bare English
  literal, which is as clean a demonstration of the class as this audit will find.

  German uses `Scatter` unchanged as the plural, or `SCATTER-SYMBOLE`. The project's own
  German prose on the same frame confirms it, writing `3, 4 oder 5 SCATTER` and `3 oder mehr
  Scatter` with no `-S`, so the header disagrees with the body text three lines below it.

  Graded LOW because a single trailing `s` on an accepted loanword is a tell rather than
  something a viewer reads as English.

- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:259`. Not locked.

- Proposed fix: add a `colScatters` key beside the two that already exist and use it.
  Genuinely small: one key, sixteen values, one markup change.

---

## STL-DE-A-10 LOW The German spin label `DREHEN` fills the circular spin button edge to edge, with no visible padding to the ring

- Frames:
  - `421_de-desktop_base_idle.png`
  - `424_de-desktop_dead_spin_1_settled.png`
  - `425_de-desktop_dead_spin_2_settled.png`
  - `426_de-desktop_dead_spin_3_settled.png`

- Claim: the label `DREHEN` sits in the lower part of the circular spin control and its
  outer glyphs reach the button's inner ring stroke, so the word occupies the full chord
  available to it. `DREHEN` is six characters against the English `SPIN`'s four in a
  fixed-diameter control, so the fit margin the English enjoys does not exist here.

  Stated as observed rather than measured: nothing is CLIPPED in these four frames, the word
  is fully legible, and the finding is that the margin has been consumed, which makes any
  longer locale value or any smaller viewport the failure case. I did not open the English
  frames, which belong to another squad, so I have not compared the two directly.

- Where fixable: UNKNOWN. I did not locate the spin-button label source within this shard's
  source budget, and I will not guess at a line number.

- Proposed fix: PARK(needs the en frames and the small-viewport de frames side by side
  before a size is chosen; this is TR-115's fit-or-abbreviate class applied to a label rather
  than to a money pod).

---

## Q-16 ANSWER: which parked strings are still English on a localised frame, and which the prose layer has overtaken

This is the question assigned to STL-DE-A alone. Every row below cites a frame I opened and,
where I found it, the source line. Rows the park lists that fall outside frames 416 to 441
are listed as NOT EVALUATED rather than guessed, per the facts discipline.

**STILL ENGLISH, genuinely hardcoded and visible on a German frame. These RAISE the park's urgency.**

| Parked string | Renders as | Frame | Source |
|---|---|---|---|
| `Session` (HUD menu item) | `Session` | `432_de-desktop_hud_menu.png`, also `431` | `frontend/src/lib/components/HudOverlay.svelte:429,547,656,818`, four hardcoded copies, one per layout template |
| `Mute` | `Mute` | `432_de-desktop_hud_menu.png`, also `431` | `frontend/src/lib/components/HudOverlay.svelte:432,575,659,821`, `{$isMuted ? 'Unmute' : 'Mute'}`, four copies |
| paytable section header, sibling of the enumerated four | `BET MODES` | `441_de-desktop_paytable_06_bet_modes.png`, also `440` | `frontend/src/lib/components/PaytableModal.svelte:302`, `{$isSocial ? 'Play Modes' : 'Bet Modes'}` |

The HUD menu on frame `432` is the sharpest single piece of evidence in this shard: four
menu rows, `GEWINNTABELLE` translated and in caps, then `Session` and `Mute` in English
title case, then `MUSIK` and `TON` translated and in caps. The park is not abstract; it is
three rows of one open menu, and the casing break makes the two hardcoded rows visually
obvious even to a reader with no German.

Two source-level notes that matter to the park's cost. First, `Session` and `Mute` each
exist as FOUR hardcoded copies in `HudOverlay.svelte` (one per layout template), so the park
is larger in edits than it is in distinct strings. Second, `Mute`/`Unmute` and `Bet Modes`
are both written as ternaries inside markup, which is precisely the shape KNOWN_OPEN records
`locale_completeness_check.mjs` cannot see, so no gate will report progress on them.

**NOW TRANSLATED. The prose layer has overtaken the park, so the park is SMALLER than recorded.**

| Parked string | Renders as | Frame |
|---|---|---|
| `Symbol Payouts` | `SYMBOLAUSZAHLUNGEN` | `438_de-desktop_paytable_03_symbolauszahlungen.png`, also `434`, `435`, `436`, `437` |
| `Interface Guide` | `BEDIENELEMENTE` | `441_de-desktop_paytable_06_bet_modes.png` |

Also translated, and worth recording because they are the same header class the park
describes even where it did not name them individually: `GEWINNTABELLE` (frames `434` to
`441`), `GEWINNWEGE` (`434` to `437`), `REGELN` (`438`, `439`), `OVERDRIVE FREISPIELE`
(`419`, `439`, `440`), `FEATURE KAUFEN` (`440`), `Sitzungsinformationen` (`433`), and the
control-guide entry `Drehen` with its German description `Startet eine Drehung mit dem
aktuellen Einsatz.` (`441`).

**NOT EVALUATED, outside frames 416 to 441. I make no claim in either direction.**

- Autoplay panel labels `Stop on win`, `Loss limit`, `Spins`. The autoplay menu is
  `446_de-desktop_autoplay_menu.png`, outside my range.
- `Responsible Play` and `Disclaimer` headers. Frames `443` and `444`, outside my range.
- `Press COLLECT or hit Enter to continue`. The max win overlay,
  `465_de-desktop_maxwin_celebration.png`, outside my range.
- Aria labels. Not frame-auditable at all.

A LEAD, offered as a lead and explicitly not as a finding, for whichever squad holds 442 to
444: `MANIFEST.json` records those three captures with the surface slugs
`paytable_07_bedienelemente`, `paytable_08_verantwortungsvolles_spielen` and
`paytable_09_haftungsausschluss`. The harness derives those slugs from the rendered heading
text, so they SUGGEST that `Responsible Play` and `Disclaimer` are also translated now. I did
not open those frames and I am not claiming it.

**NET EFFECT ON THE PARK.** Of the park's named strings that reach frames 416 to 441, two are
translated and three are still English, so the park shrinks on the paytable headers and holds
on the HUD menu. But the park's SIZE is understated in the other direction: frames 416 to 441
carry four player-visible English strings the park never enumerated, one of them a complete
English sentence:

- `Max win is quoted against the base bet.` (STL-DE-A-02, `fsModes.ts:189-193`)
- `MAX WIN` on five mode cards (STL-DE-A-05, `fsModes.ts:177-179`)
- `ways` on every winning spin (STL-DE-A-03, `WinBreakdown.svelte:94`)
- `Scatters` as a table header (STL-DE-A-09, `PaytableModal.svelte:259`)

plus a fifth of a different kind, `FEATURES` (STL-DE-A-06), which is keyed but whose German
VALUE is the untranslated English while fifteen other locales translated it. A source grep
for hardcoded literals would never find that one, because it is not hardcoded.

The park's list should be rebuilt from a localised render rather than from a source grep. A
source grep is what produced a list that misses a full English sentence sitting in the middle
of the paytable, and it structurally cannot find a locale whose value was left as English.

---

## Explicit absences, signed

I am signing each of these. Each names what I checked in order to be able to say it.

1. **No German string in my 26 frames is clipped, ellipsised or overflowing its container.**
   Checked every text-bearing element on every frame: the three HUD pod labels `GUTHABEN`,
   `GEWINN` and `EINSATZ` and their values; the rules card heading and its four bullets on
   frames `418` and `419`; the `Weiter` button; the HUD menu's five rows on `431` and `432`;
   the session panel's five label/value pairs and the title `Sitzungsinformationen` on `433`;
   every paytable heading, table header, symbol card, mode card blurb and rules bullet on
   `434` to `441`. The single tight fit is STL-DE-A-10, and nothing there is actually cut off.
   The longest German strings on the set, `SOFORTPRÄMIE`, `SYMBOLAUSZAHLUNGEN`,
   `Sitzungsinformationen` and the three-line `NITRO OVERDRIVE` blurb, all fit with margin.

2. **No mojibake, no tofu boxes, no font fallback on German diacritics.** Orbitron carries
   the umlauts and the eszett on every frame that needs them: `außer` (`436`, `437`, `438`),
   `zurückgesetzt` (`419`, `439`, `440`), `SOFORTPRÄMIE` (`439`, `440`), `Auslöserate`
   (`441`), `ungültig` (`439`), `häufigere` (`441`), `zusätzliche` (`419`, `439`, `440`),
   `Zähler` (`419`, `439`, `440`). Every one renders in the brand face with no glyph
   substitution and no baseline shift.

3. **No RTL or `dir` finding in this shard.** German is left to right, so channel 3 of my
   lens has no subject in a de session. The KNOWN_OPEN RTL row is the ar squad's to evidence
   and I have added nothing to it.

4. **No date is rendered on any of my 26 frames**, so locale date format is unevaluated
   rather than passed. The only time-shaped value is `Spielzeit 00:00:22` on frame `433`,
   an elapsed duration in `HH:MM:SS`, which is convention-neutral.

5. **No motion or composition problem exists only in the German locale across the nine
   transition frames I hold** (`416`, `418`, `420`, `422`, `423`, `428`, `429`, `431`, `434`).
   Checked that the mid-fade rules card on `418` holds the same box, the same four bullets
   and the same button position as the settled `419`; that the two reel-spin frames `422` and
   `423` carry no text that could reflow; that the menu at `431` is at the same geometry as
   the settled `432`; and that the paytable at `434` matches the settled `435` line for line.
   Nothing reflows, jumps or reorders because the strings are German.

6. **The win banner tier label IS correctly localised and I have not opened a new id for it.**
   Frames `428`, `429` and `430` read `GROSSER GEWINN`, correctly uppercased German
   (`Großer` uppercases to `GROSSER`, which is right). The English `16x BET` beside it is the
   open half of TR-104 and appears below as a KNOWN match only.

7. **I did not open any frame outside 416 to 441**, and every claim above cites a frame I
   opened. I read no English-session frame, so every comparison to English in this shard is
   either drawn from the German frame itself, from the source, or is explicitly flagged as
   not compared.

8. **One thing I saw and am deliberately NOT claiming as locale-specific**, recorded so the
   next reader does not think I missed it: on frames `438`, `439` and `440` the paytable's
   rules bullets place the `›` marker hard against the left edge of the panel while the
   bullet text is centred in the panel, so the marker is orphaned from its text and a
   two-line bullet's second line has no relationship to it at all. That is a list-layout
   choice, not a translation-length effect, and it would look the same in English. It belongs
   to whichever squad holds the English paytable frames.

9. **I ran no project script.** Every source fact above came from `grep -n` or `sed -n` line
   ranges read as text, across eight files: `fsModes.ts`, `PaytableModal.svelte`,
   `WinBreakdown.svelte`, `HudOverlay.svelte`, `SessionPanel.svelte`, `currency.ts`,
   `FeatureMenu.svelte` and the two i18n data files. No locked path was read into a claim and
   none was written.

---

## KNOWN matches

- KNOWN(TR-104): `428_de-desktop_transition_bigwin_countup_early.png`,
  `429_de-desktop_transition_bigwin_countup_late.png`, `430_de-desktop_bigwin_settled.png`.
  The tier label reads the correctly localised `GROSSER GEWINN` while the unit beside it
  reads `16x BET` in English. Fresh German evidence for the open half; no new id opened.
- KNOWN(MID-01): `428_de-desktop_transition_bigwin_countup_early.png` reads banner `$10.29`
  against the HUD `GEWINN` pod `$15.95` at the same instant, on a win that settles at
  `$16.20` in `429` and `430`. The de-desktop instance of the pattern the ledger predicts,
  matching the ledger's cent-exact derivation for the English `013` frame.
- KNOWN(MID-02): `428`, `429` and `430` render `16x BET` with the ASCII letter `x`, U+0078.
- KNOWN(Q-26): `441_de-desktop_paytable_06_bet_modes.png` renders `ca. 1.6x höhere
  Auslöserate`, `Zieht 1.25x pro Drehung ab`, `1.25x` in the OVERBOOST `KOSTEN` cell and
  `auf 5x hochgedreht` in the NITRO OVERDRIVE blurb, all with the ASCII letter `x`, in the
  same view as `5,000×` and in the same document as `1× / 3× / 10×` on frames `436` to `440`.
  Also **two instances OUTSIDE the two files Q-26 enumerates, exactly as MID-02 predicted the
  class would be**: the symbol-card multiplier column reads `3x`, `4x`, `5x` on frames `436`,
  `437` and `438`, and the win-line strip reads `x4` and `x5` on frames `429` and `430`, the
  latter pinned to `frontend/src/lib/components/WinBreakdown.svelte:93`.
- KNOWN(Q-16 park): the three still-English and two now-translated rows are tabulated in full
  in the Q-16 ANSWER section above, each with its frame and, where found, its source line.
  Rows stay parked per the park's own instruction; the section records what changes their
  urgency in both directions.
- KNOWN(Q-34): `441_de-desktop_paytable_06_bet_modes.png` renders `Cruise` in title case on
  the paytable mode card, alongside `Normal` and `Overdrive kaufen` in title case and
  `OVERBOOST` and `NITRO OVERDRIVE` in caps. The HUD badge is not in my frame set, so I
  cannot show the `CRUISE` half; this is the paytable half only.

---

tree_after:

```
?? reports/qa/stream_test/shards/STC-MOBILEL-B.md
?? reports/qa/stream_test/shards/STC-MOBILEM-A.md
?? reports/qa/stream_test/shards/STC-MOBILEM-B.md
?? reports/qa/stream_test/shards/STC-MOBILES-A.md
?? reports/qa/stream_test/shards/STC-MOBILES-B.md
?? reports/qa/stream_test/shards/STC-STRETCH-A.md
?? reports/qa/stream_test/shards/STC-STRETCH-B.md
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
?? reports/qa/stream_test/shards/STT-POPOUTL-B.md
?? reports/qa/stream_test/shards/STT-POPOUTS-A.md
?? reports/qa/stream_test/shards/STT-POPOUTS-B.md
```

Recorded verbatim from `git status --porcelain` at the end of the run. Twenty-four entries,
all untracked (`??`). Mine is `reports/qa/stream_test/shards/STL-DE-A.md`; the other
twenty-three are other squads' shards, which are not mine and not my problem. **Nothing in
the tree shows as MODIFIED or DELETED.** No tracked file changed during my run.
