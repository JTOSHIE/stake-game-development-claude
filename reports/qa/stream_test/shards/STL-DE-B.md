# STL-DE-B, localisation, all five channels on a non-English session (de-desktop, frames 442 to 467)
scope: every `de-desktop` frame numbered 442 to 467 inclusive, 26 frames, viewport 1200x675, lang `de`, build HEAD `d9bdf22`. No frame outside the range was opened.
frames_read: 26

## STL-DE-B-01 STREAM The whole Responsible Play paragraph renders in English under a German heading on the German paytable
- Frames: `reports/screens/stream-test-2026-07-28/443_de-desktop_paytable_08_verantwortungsvolles_spielen.png`, `reports/screens/stream-test-2026-07-28/444_de-desktop_paytable_09_haftungsausschluss.png`
- Claim: the section heading is correctly translated to `VERANTWORTUNGSVOLLES SPIELEN`, and the body directly beneath it is unlocalised English, verbatim: `Autoplay can be set to stop automatically on any win, when the Overdrive feature triggers, or once a loss limit you choose is reached, and can always be stopped manually at any time. A session summary (time played, spins, net result) is available from the menu.` It is two full sentences, 47 words, set as the widest text block on the panel, and it sits immediately above the `HAFTUNGSAUSSCHLUSS` paragraph which IS fully translated German, so the two are side by side in one view and the contrast is unmissable. This is the single largest English artefact anywhere in the 26 frames.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:398`. The heading two lines above it at `:396` is keyed, `{$tr('responsiblePlayHeading')}`, and the body at `:398` is a raw literal opening `Autoplay can be set to stop automatically on any win, when the`. Confirmed against the prose layer: `frontend/src/lib/i18n/prose.ts:46-49` declares `'responsiblePlayHeading' | 'disclaimerHeading'` and `'disclaimerBody'` in the key union and has NO `responsiblePlayBody`, so the sibling disclaimer paragraph is keyed at `prose.ts:118` and this one was never given a key at all. Not locked. **This is also the recorded gate blind spot in the flesh**: it is markup prose between tags, which KNOWN_OPEN's blind-spot list and convention (p)'s worked example both name as the form the checkers cannot see.
- Proposed fix: add `responsiblePlayBody` to the key union at `prose.ts:46-49` with sixteen values and swap `PaytableModal.svelte:398` to `{$tr('responsiblePlayBody')}`. PARK(sixteen-locale copy task) on the translation itself, but the key and the call site are a small mechanical change and should not wait for it.

## STL-DE-B-02 STREAM On the max win hero the unit collides with the multiplier: `5,000×EINSATZ` with no separating space
- Frames: `reports/screens/stream-test-2026-07-28/464_de-desktop_transition_maxwin_overlay_fade.png`, `reports/screens/stream-test-2026-07-28/465_de-desktop_maxwin_celebration.png`
- Claim: the hero figure renders as `5,000×EINSATZ`. The multiplication sign is set small and low against the 5,000 and the German unit word begins in the very next pixel column, with zero gap, so the glyph reads as part of the word. The German unit `EINSATZ` is 7 characters against the English `BET` at 3, and the label is letter-spaced, so the run is more than twice as wide as the English one and it is the crowding that exposes the missing space. This is the 5,000x cap celebration, the most-watched single surface in the game, held for the full duration of the overlay.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:295-299`. The cause is exact and it is CSS, not copy: `.c1-max-multwrap { display: flex; align-items: baseline; gap: 0.1em; }`. The markup at `:155-159` writes `<span class="c1-max-mult fs-num">5,000</span><span class="c1-max-x">×</span>` and then, after an HTML comment, `<span class="c1-max-betlabel">{t($locale, 'bet', localeMode)}</span>`. `display: flex` discards the whitespace text node the markup newline would otherwise have provided, so the ONLY separation is `gap: 0.1em`, which at the unit's own type size is one or two pixels. Not locked. Note for the marshal: the unit here IS correctly localised through `t()`, so this is a different defect from TR-104's open half, which is the win banner's untranslated `x BET`.
- Proposed fix: raise the gap between the `×` and the unit to about `0.28em`, or set a per-child `margin-inline-start` on `.c1-max-betlabel` only so the `5,000` and the `×` stay tight. Verify at the longest locale value rather than at `BET`.

## STL-DE-B-03 HIGH The FEATURES menu carries five separate English strings on the German session, one of them a full sentence
- Frames: `reports/screens/stream-test-2026-07-28/448_de-desktop_features_menu.png`, `reports/screens/stream-test-2026-07-28/447_de-desktop_transition_features_menu_opening.png`
- Claim: on a panel whose own chrome is correctly German (`DREHMODI`, `FEATURES KAUFEN`, `EINSATZMODI`, `WÄHLEN`, `AKTIV`, `AUS`, `Overdrive kaufen`), these render in English:
  1. the panel footer, verbatim `All modes · RTP 96.35%`, which directly contradicts the paytable's own correctly translated `RTP (ALLE 5 MODI)` on frame 443;
  2. the OVERBOOST cost line, verbatim `1.25× per spin while ON · $1.25`, a complete English sentence sitting one line under the German blurb `Doppelte Chance: ca. 1.6x höhere Auslöserate. Zieht 1.25x pro Drehung ab, solange AN.`, so the same card says `ON` and `AN` for the same state in adjacent lines;
  3. the Normal card cost label `1× bet`;
  4. the Cruise card cost label `1× bet` and the OVERBOOST card cost label `1.25× bet`, where `bet` should be `Einsatz`, which the HUD pod on frame 445 already renders correctly as `EINSATZ`;
  5. the volatility badges `HIGH` on OVERBOOST and `VERY HIGH` on `Overdrive kaufen`.
  None of these five is in the Q-16 enumeration, so they are additional to the park rather than instances of it.
- Where fixable: all five located, none locked.
  1. `frontend/src/lib/components/FeatureMenu.svelte:508`, `<span class="fm-rtp">All modes · RTP {FS_RTP_LABEL}</span>`, a literal beside an interpolation;
  2. `frontend/src/lib/components/FeatureMenu.svelte:422`, `<p class="fm-enh-effect">{m.cost}× per spin while ON · <span class="fs-num">{price(m.cost)}</span></p>`, literals on both sides of an interpolation;
  3. and 4. `frontend/src/lib/components/FeatureMenu.svelte:372` and `frontend/src/lib/components/FeatureMenu.svelte:427`, both `<span class="fm-cost fs-num">{m.cost}× {$isSocial ? 'per spin' : 'bet'}</span>`, where the social ternary already exists and the locale route does not;
  5. `frontend/src/lib/config/fsModes.ts:50`, the type `volatility: 'Low' | 'High' | 'Very High' | 'Extreme'`, and its use at `frontend/src/lib/config/fsModes.ts:104`, `volatility: 'Very High'`. The badge renders the raw union member, so the type IS the display string.
- Proposed fix: route all five through the prose layer, and change `fsModes.ts:50` from a display string union to a token union (`'low' | 'high' | 'veryHigh' | 'extreme'`) resolved by key at render, so a volatility label can never again be shipped by a type declaration. **Every one of the five is a literal adjacent to or inside an interpolation, which is precisely the shape KNOWN_OPEN records `locale_completeness_check.mjs` as blind to**, so the gate must get a seeded-violation case in these exact forms per convention (p) before it may report PASS on this class.

## STL-DE-B-04 HIGH The buy dialogs' max win figure is English AND wraps to two lines, breaking the three-column stat row
- Frames: `reports/screens/stream-test-2026-07-28/450_de-desktop_dialog_buy_overdrive.png`, `reports/screens/stream-test-2026-07-28/452_de-desktop_dialog_nitro_overdrive.png`, `reports/screens/stream-test-2026-07-28/449_de-desktop_transition_dialog_buy_overdrive_opening.png`, `reports/screens/stream-test-2026-07-28/451_de-desktop_transition_dialog_nitro_overdrive_opening.png`
- Claim: the third stat column's header is correctly German, `MAX. GEWINN`, and its value renders `5,000× base bet` in English, which then wraps mid-phrase so the column reads `5,000× base` on line one and `bet` on line two. The other two columns, `PREIS` `$100.00` and `RTP` `96.35%`, are single-line, so the row is one line tall in two columns and two lines tall in the third and the baselines do not line up. The same defect is on the NITRO dialog with `PREIS` `$400.00`. This is a money surface: it is the panel a player reads before spending 100x or 400x their stake.
- Where fixable: `frontend/src/lib/config/fsModes.ts:158`, verbatim: `` return social ? `${FS_MAX_WIN_LABEL} base play` : `${FS_MAX_WIN_LABEL} base bet` ``. The social branch is handled and the locale branch is not, the same one-sided pattern as STL-DE-B-03 items 3 and 4 and as TR-104. Rendered by `frontend/src/lib/components/BuyBonus.svelte`. Neither locked. Worth recording beside it: `fsModes.ts:182-191` carries a comment about a first attempt at TR-037 that moved `base bet` between the label and the value, so this string has been moved once already without being keyed.
- Proposed fix: key the unit and give the stat value `white-space: nowrap` with a size step down, the treatment `.fm-cost` already has at `frontend/src/lib/components/FeatureMenu.svelte:963` (`white-space: nowrap`), so the mechanism exists in the codebase and only needs applying here.

## STL-DE-B-05 HIGH The buy confirm dialogs are taller than the German copy allows and their action buttons are cut off at the panel edge
- Frames: `reports/screens/stream-test-2026-07-28/452_de-desktop_dialog_nitro_overdrive.png` (worst), `reports/screens/stream-test-2026-07-28/450_de-desktop_dialog_buy_overdrive.png`, `reports/screens/stream-test-2026-07-28/451_de-desktop_transition_dialog_nitro_overdrive_opening.png`
- Claim: on frame 452 the two action controls are reduced to slivers at the very bottom edge of the panel: the cancel button shows only the top few pixels of its outline and the pink confirm button shows only the top of its fill, with neither `ABBRECHEN` nor `KAUFEN` legible at all. On frame 450 the same two buttons are cut roughly in half, with the tops of `ABBRECHEN` and `KAUFEN` readable and their lower halves outside the panel. The German body copy is what pushes the panel over: the question wraps to two lines (`Overdrive Freispiele jetzt für das 400-fache deines Einsatzes starten?`), the closing paragraph runs to four lines (`Der Overdrive-Zähler startet bei 1× und steigt nach jedem gewonnenen Freispiel um 1×, was alle folgenden Gewinne multipliziert. Er wird während des Features nie zurückgesetzt.`), and NITRO adds a further two-line paragraph that Buy Overdrive does not have, which is exactly why NITRO is the worse of the two. A player cannot see the button they are being asked to press to spend `$400.00`.
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:174`, verbatim: `width: min(94vw, 460px); max-height: 90dvh; overflow-y: auto;`. The scroller is the WHOLE PANEL, so the action row scrolls with the body instead of being pinned, and at 675px viewport `90dvh` is 607px against a German content height that exceeds it. The panel opens scrolled to the top, so the buttons start below the fold and a player has to discover that the confirm dialog scrolls. Not locked. Recorded honestly: this is a general fit failure that any locale with longer copy will hit, and German is the locale in this capture set that hits it.
- Proposed fix: move `overflow-y: auto` off the panel and onto the body region only, so the header and the action row sit outside the scroller and the buttons are always on screen. Small, and it fixes every locale at once.

## STL-DE-B-06 HIGH The autoplay panel's `SPINS` heading is still hardcoded English while every label around it is translated
- Frames: `reports/screens/stream-test-2026-07-28/446_de-desktop_autoplay_menu.png`
- Claim: on one panel, four checkbox labels render correct German, `Stopp bei Gewinn`, `Einzelgewinnlimit`, `Stopp bei Feature` and `Verlustlimit`, and the section heading directly beneath them renders `SPINS` in English. German is `DREHUNGEN`. The heading is the only English word in the panel, set in the accent colour and centred, so it is the element the eye lands on. This is a Q-16 parked string that has NOT been overtaken by the prose layer and IS visible on a stream frame, which is the specific evidence the park was waiting on.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:513`, `frontend/src/lib/components/HudOverlay.svelte:749` and `frontend/src/lib/components/HudOverlay.svelte:955`, all three identical: `<div class="auto-menu-sep">Spins</div>`. Not locked. **The string is hardcoded three times, once per responsive layout**, which matters for the fix and for the park's count: Q-16 counts it as one key and the tree carries three call sites, so a partial fix would leave the English on some viewports and not others and nothing in the build would say so.
- Proposed fix: one key, sixteen values, and change all three call sites in the same edit. Grep for `auto-menu-sep` to confirm three and only three before and after.

## STL-DE-B-07 HIGH The win-line readout renders the English word `ways`, and disagrees with itself in number
- Frames: `reports/screens/stream-test-2026-07-28/445_de-desktop_transition_paytable_closing.png` (`L3  x4  1 ways  $0.20`), `reports/screens/stream-test-2026-07-28/446_de-desktop_autoplay_menu.png` (`M3  x5  8 ways  $16.00`), `reports/screens/stream-test-2026-07-28/453_de-desktop_transition_feature_entry_fade.png`, `reports/screens/stream-test-2026-07-28/454_de-desktop_feature_entry_card.png`, `reports/screens/stream-test-2026-07-28/455_de-desktop_transition_feature_starting.png`, `reports/screens/stream-test-2026-07-28/459_de-desktop_feature_run_4.png`, `reports/screens/stream-test-2026-07-28/460_de-desktop_feature_run_5.png`, `reports/screens/stream-test-2026-07-28/461_de-desktop_feature_run_6.png`, `reports/screens/stream-test-2026-07-28/463_de-desktop_post_feature_base.png`, `reports/screens/stream-test-2026-07-28/467_de-desktop_post_collect_base.png` (`M3  x3  1 ways  $0.20`), and `456`, `457`, `458`, `462` (`SCATTER  x5  5 ways  $10.00`)
- Claim: the win-line strip under the reels writes the unit as `ways` in English on 14 of the 26 frames in this range. The German session already has the translation: the paytable's own section is captured as `437_de-desktop_paytable_02_gewinnwege.png`, so the game says `Gewinnwege` in one place and `ways` in another for the same quantity. Separately, and in English too, the string reads `1 ways` on frames 445, 453, 454, 455, 459, 460, 461, 463 and 467: a hardcoded plural with no singular branch, which no top studio ships.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:94`, verbatim: `<span class="wb-ways">{current.ways} ways</span>`. Not locked. Both halves of the finding are in that one line: the literal `ways` is hardcoded English, and there is no singular branch on `{current.ways}`, so `1 ways` is what the component is written to produce. Note that the paytable already holds the correct localised term through `$tr('waysLabel')` at `frontend/src/lib/components/PaytableModal.svelte:37`, so the translation exists in the project and this surface simply does not call it.
- Proposed fix: `{current.ways} {$tr(current.ways === 1 ? 'wayLabelSingular' : 'waysLabel')}`, adding the singular key. `waysLabel` already exists, so most of the work is done.

## STL-DE-B-08 MEDIUM The max win overlay tells the player to press a button that does not exist by that name
- Frames: `reports/screens/stream-test-2026-07-28/465_de-desktop_maxwin_celebration.png`, `reports/screens/stream-test-2026-07-28/464_de-desktop_transition_maxwin_overlay_fade.png`
- Claim: the button reads `EINSAMMELN` and the hint line 40 pixels beneath it reads `DRÜCKE SAMMELN ODER ENTER, UM FORTZUFAHREN`. Two different German verbs, `EINSAMMELN` and `SAMMELN`, for the same single action, in the same view, 40 pixels apart. In English both surfaces read `COLLECT`, so this defect exists only in the localised copy and is invisible on an English session. Worth recording alongside it as the good news: the hint sentence itself IS translated, so Q-16's `Press COLLECT or hit Enter to continue` has been overtaken by the prose layer, and what survives is a consistency error inside the translation rather than a missing one.
- Where fixable: `frontend/src/lib/i18n/prose.ts`, the `de` values for the two keys `collect` and `maxWinHint`. Both are real keys: the English source strings are `maxWinHint: 'Press COLLECT or hit Enter to continue'` at `frontend/src/lib/i18n/prose.ts:83`, and the two call sites are `frontend/src/lib/components/MaxWinCelebration.svelte:163` (`{t($locale, 'collect', localeMode)}`) and `frontend/src/lib/components/MaxWinCelebration.svelte:167` (`{t($locale, 'maxWinHint', localeMode)}`). Not locked. This is a defect in the translated VALUES, not in the wiring, which is why it is invisible to any gate that only checks whether a key exists.
- Proposed fix: change the German `maxWinHint` value so its verb is exactly the German `collect` value, and check the other fifteen locales for the same drift. The mechanical check is cheap and worth adding: assert that each locale's `maxWinHint` contains that same locale's `collect` value as a substring, seeded per convention (p) with the current German pair, which must fail.

## STL-DE-B-09 MEDIUM Every number, currency and percentage on the German session uses English formatting conventions
- Frames: `reports/screens/stream-test-2026-07-28/445_de-desktop_transition_paytable_closing.png` (`$50,000.00`, `$16.20`, `$1.00`), `reports/screens/stream-test-2026-07-28/443_de-desktop_paytable_08_verantwortungsvolles_spielen.png` (`96.35%`, `5,000x`), `reports/screens/stream-test-2026-07-28/450_de-desktop_dialog_buy_overdrive.png` (`$100.00`, `96.35%`, `5,000×`), `reports/screens/stream-test-2026-07-28/452_de-desktop_dialog_nitro_overdrive.png` (`$400.00`), `reports/screens/stream-test-2026-07-28/465_de-desktop_maxwin_celebration.png` (`5,000×`), `reports/screens/stream-test-2026-07-28/466_de-desktop_transition_maxwin_collect_fade.png` (`$5,000.00`), `reports/screens/stream-test-2026-07-28/448_de-desktop_features_menu.png` (`96.35%`, `1.25×`, `1.6x`)
- Claim: German convention is a full stop for the thousands group, a comma for the decimal, a space before the percent sign, and the currency symbol trailing. The German session renders the opposite on every figure it displays: `$50,000.00` where `50.000,00 $` is expected, `96.35%` where `96,35 %` is expected, `5,000×` and `5,000x` where `5.000×` is expected, `1.25×` and `1.6x` where `1,25×` and `1,6×` are expected. The strings are translated and the numbers inside them are not, so the localisation is half done in a way a German viewer reads instantly. Noted honestly: the wallet currency is USD from the RGS, so the SYMBOL is arguably correct; the separators and the percent spacing are not, and they are independent of currency.
- Where fixable: UNKNOWN. This squad did not locate the shared money and percentage formatters within its STEP 3 budget and will not name a file it has not read. What IS pinned: the `5,000` grouping is baked into a display constant, `FS_MAX_WIN_LABEL` at `frontend/src/lib/config/fsModes.ts:139` per the LEDGER's own citation, and `frontend/src/lib/config/fsModes.ts:137` describes it as the shared max win label identical across all modes, so at least that one figure is a literal rather than a formatter call and cannot be fixed by changing a formatter.
- Proposed fix: PARK(this is a formatter-layer decision with a compliance edge, since a jurisdiction may mandate a display format). Two options for the owner: (a) drive all numeric display through `Intl.NumberFormat` with the active locale, which fixes all sixteen at once; (b) declare English numeric formatting deliberate and uniform across locales and record the decision, so it stops reading as an oversight.

## STL-DE-B-10 MEDIUM The German disclaimer paragraph ends in an English sentence
- Frames: `reports/screens/stream-test-2026-07-28/443_de-desktop_paytable_08_verantwortungsvolles_spielen.png`, `reports/screens/stream-test-2026-07-28/444_de-desktop_paytable_09_haftungsausschluss.png`
- Claim: the `HAFTUNGSAUSSCHLUSS` body is correct German for six lines and then, without a paragraph break, continues in English: `Future Spinner™ and We Roll Spinners™ are trademarks of We Roll Spinners. © 2026 We Roll Spinners. All rights reserved.` A trademark line staying in English is defensible; running it into the middle of a German sentence flow with no separation is not, and `All rights reserved.` in particular has an ordinary German rendering (`Alle Rechte vorbehalten.`) that the rest of the paragraph would lead a reader to expect.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:63-64`, verbatim: `+ ' Future Spinner™ and We Roll Spinners™ are trademarks of We Roll Spinners.'` then `+ ' © 2026 We Roll Spinners. All rights reserved.'`. Not locked. The mechanism is now exact and it is worse than "a key was missed": the component takes the correctly translated `disclaimerBody` (`frontend/src/lib/i18n/prose.ts:118`, which ends at `not from events shown in the web browser.` and contains no trademark text) and CONCATENATES two hardcoded English sentences onto the end of it. A translated string is being extended with untranslated text at the call site, so no amount of translation work on `disclaimerBody` can ever fix it.
- Proposed fix: move the two literals into their own key rendered as a separate smaller line beneath the body, translating `All rights reserved.` and leaving the marks and the copyright symbol untranslated. **Flag for the marshal beyond this frame: string concatenation onto a translated value is a class, not an instance, and it defeats every key-existence gate. It is worth one grep of the tree for `+ '` adjacent to a `$tr(` or `t(` result.**

## STL-DE-B-11 MEDIUM The German spin-button label sits on the button's bottom rim
- Frames: `reports/screens/stream-test-2026-07-28/445_de-desktop_transition_paytable_closing.png`, `reports/screens/stream-test-2026-07-28/446_de-desktop_autoplay_menu.png`, `reports/screens/stream-test-2026-07-28/453_de-desktop_transition_feature_entry_fade.png`, `reports/screens/stream-test-2026-07-28/454_de-desktop_feature_entry_card.png`, `reports/screens/stream-test-2026-07-28/463_de-desktop_post_feature_base.png`, `reports/screens/stream-test-2026-07-28/467_de-desktop_post_collect_base.png`, and `455` to `462`
- Claim: the circular spin control renders `DREHEN` beneath its play triangle, and the word is pushed down onto the ring itself, so the glyph tops touch the triangle and the baseline sits on the button's inner border rather than inside the clear area. `DREHEN` is 6 characters against the English `SPIN` at 4, so the label is about 50 per cent wider and the type has nowhere to go inside a fixed-diameter circle. It is on screen in every base and feature frame in the range, which is 14 of 26, so a viewer sees it for most of the session.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:921`, `<span class="txt">{$tr('spin')}</span>`, with the sibling layout at `frontend/src/lib/components/HudOverlay.svelte:479`, `<span class="p-spin-txt">{$tr('spin')}</span>`. Not locked. The string itself is correctly keyed, so this is purely a fit failure and not a translation gap. The geometry is deliberate and pinned: `frontend/src/lib/components/HudOverlay.svelte:1519` records the control as a fixed `x1027 top562, 84` diameter locked in `docs/HUD_SPEC.md`, and `frontend/src/lib/components/HudOverlay.svelte:1199` states in its own words that SPIN never shrinks. So the circle cannot move and the type must.
- Proposed fix: step the label font size and letter spacing down when the resolved string is longer than four characters, inside `.txt` and `.p-spin-txt` only. The diameter, the spec and the 44px touch target are all untouched by that, which is what makes it safe against the pinned geometry.

## STL-DE-B-12 LOW Two of eight control-guide rows keep English titles beside six translated siblings
- Frames: `reports/screens/stream-test-2026-07-28/442_de-desktop_paytable_07_bedienelemente.png`
- Claim: under the correctly translated `BEDIENELEMENTE` heading, the eight rows title as `Drehen`, `Einsatz erhöhen`, `Einsatz verringern`, `Features`, `Autoplay`, `Menü`, `Turbo`, `Max. Einsatz`. `Features` and `Autoplay` are the two English titles in the set. Recorded at LOW and with the counter-argument attached rather than suppressed: `Autoplay` and `Turbo` are both established German gaming loanwords, and `Features` matches the on-reel button which itself reads `FEATURES` on frame 445, so the row may well be a deliberate match to the control it documents. If it is deliberate it should be recorded as such, because a reviewer reading the panel cannot tell a decision from an omission.
- Where fixable: UNKNOWN. The control-guide rows are rendered from `frontend/src/lib/components/PaytableModal.svelte`, but this squad did not read the row definitions and will not cite a line it has not seen. The rows ARE keyed, since their six German siblings and all eight bodies render translated on frame `442`, so the values live in `frontend/src/lib/i18n/prose.ts` rather than in the component.
- Proposed fix: leave as is and record the loanword decision in the charter so it reads as a decision, or translate `Features` to `Funktionen` and rename the on-reel button with it. Do not change one without the other.

## THE Q-16 ANSWER, which of the parked strings are still English on a localised frame

Assigned to this squad alone. KNOWN_OPEN's Q-16 park (charter 4.3) lists about 35
hardcoded English keys. An English session cannot separate a keyed string from a
hardcoded one. This session can. Verdict per string, from the 26 frames in this range
only, with the frame cited for each.

**STILL ENGLISH, genuinely hardcoded and visible on stream. The park's urgency goes UP for these.**

| Q-16 string | Renders as | Frame |
|---|---|---|
| `Spins` (autoplay panel) | `SPINS`, English, expected `DREHUNGEN` | `446_de-desktop_autoplay_menu.png` |
| `Responsible Play` BODY (the heading is keyed, the body is not) | the full English paragraph transcribed in STL-DE-B-01 | `443_de-desktop_paytable_08_verantwortungsvolles_spielen.png`, `444_de-desktop_paytable_09_haftungsausschluss.png` |

**ALREADY OVERTAKEN by the prose layer. These render translated, so the park is SMALLER than recorded.**

| Q-16 string | Renders as | Frame |
|---|---|---|
| `Stop on win` | `Stopp bei Gewinn` | `446_de-desktop_autoplay_menu.png` |
| `Loss limit` | `Verlustlimit` | `446_de-desktop_autoplay_menu.png` |
| Autoplay sibling, stop on feature | `Stopp bei Feature` | `446_de-desktop_autoplay_menu.png` |
| Autoplay sibling, single win limit | `Einzelgewinnlimit` | `446_de-desktop_autoplay_menu.png` |
| `Interface Guide` (paytable header) | `BEDIENELEMENTE` | `442_de-desktop_paytable_07_bedienelemente.png` |
| `Responsible Play` (paytable header only) | `VERANTWORTUNGSVOLLES SPIELEN` | `443_de-desktop_paytable_08_verantwortungsvolles_spielen.png` |
| `Disclaimer` (paytable header) | `HAFTUNGSAUSSCHLUSS` | `443_de-desktop_paytable_08_verantwortungsvolles_spielen.png` |
| `Disclaimer` body | German for six lines, English only in the trademark tail, see STL-DE-B-10 | `443`, `444` |
| `Press COLLECT or hit Enter to continue` | `DRÜCKE SAMMELN ODER ENTER, UM FORTZUFAHREN` | `465_de-desktop_maxwin_celebration.png`, `464_de-desktop_transition_maxwin_overlay_fade.png` |
| Paytable interface-row bodies (all eight) | full German, for example `Startet eine Drehung mit dem aktuellen Einsatz.` | `442_de-desktop_paytable_07_bedienelemente.png` |
| Paytable stat labels | `RTP (ALLE 5 MODI)`, `MAX. GEWINN` | `443_de-desktop_paytable_08_verantwortungsvolles_spielen.png` |

**NOT OBSERVABLE from this range. Signed as unknown rather than guessed.**

- `Session` (autoplay panel): the session panel is frame `433`, outside this range. The autoplay panel on frame `446` does not carry it.
- `Symbol Payouts` (paytable header): frame `438`, outside this range. The capture filename is `438_de-desktop_paytable_03_symbolauszahlungen.png`, which SUGGESTS it is translated, but a filename is not a rendering and this squad did not open the frame, so it is recorded as unknown.
- `Mute` / `Unmute`: the sound controls live in the HUD menu, frame `432`, outside this range. Not on any frame here.
- aria labels: not rendered as pixels; not frame-auditable by any squad.

**NET EFFECT ON THE PARK.** Of the Q-16 items this range could see, nine render
translated and two do not. The park as written overstates the hardcoded set for the
autoplay and paytable headers, which the prose layer has since taken. It UNDERSTATES the
problem in one specific and worse way: `Responsible Play` is listed as a HEADER, and the
header is fixed while an entire English PARAGRAPH beneath it is not, which is a
categorically larger artefact than any label on the list. Separately, this squad found
**eight English strings on localised frames that Q-16 does not enumerate at all**
(`All modes · RTP 96.35%`, `1.25× per spin while ON · $1.25`, `1× bet`, `1.25× bet`,
`HIGH`, `VERY HIGH`, `base bet`, `ways`), so the park's own count of about 35 keys was
built from an incomplete search, in the same way MID-02 records Q-26's enumeration being
incomplete. The park should be re-derived from the tree rather than extended by hand.

**SOURCE CONFIRMATION, added in STEP 3, so the frame verdicts above are corroborated by
an independent input rather than by a second reading of the same pixels** (convention
l.4). Every verdict below was reached from the FRAMES first and checked afterwards.

- `Spins` STILL ENGLISH: confirmed hardcoded, and worse than recorded. It is
  `<div class="auto-menu-sep">Spins</div>` at `frontend/src/lib/components/HudOverlay.svelte:513`,
  `:749` AND `:955`. **Three call sites, not one.** Q-16's count of about 35 keys is
  therefore understated on this row alone.
- `Responsible Play` body STILL ENGLISH: confirmed. `frontend/src/lib/components/PaytableModal.svelte:396`
  calls `{$tr('responsiblePlayHeading')}` and `:398` is a bare literal, and
  `frontend/src/lib/i18n/prose.ts:46-49` has no `responsiblePlayBody` in its key union at
  all, so the key was never created rather than created and unused.
- `Press COLLECT or hit Enter to continue` OVERTAKEN: confirmed. It is a real key,
  `maxWinHint` at `frontend/src/lib/i18n/prose.ts:83`, called at
  `frontend/src/lib/components/MaxWinCelebration.svelte:167`. Q-16 can drop this row.
- `Disclaimer` body OVERTAKEN but incompletely: confirmed. `disclaimerBody` is keyed at
  `frontend/src/lib/i18n/prose.ts:118` and ends at `not from events shown in the web
  browser.`, and `frontend/src/lib/components/PaytableModal.svelte:63-64` concatenates two
  untranslated English sentences onto it. See STL-DE-B-10.
- The eight strings Q-16 does not enumerate are all located and cited in
  STL-DE-B-03, 04 and 07 above, at `FeatureMenu.svelte:372`, `:422`, `:427`, `:508`,
  `fsModes.ts:50`, `:104`, `:158` and `WinBreakdown.svelte:94`.

## Explicit absences, signed

- **No Arabic evidence in this shard, and none was possible.** Lens channel (3) asks for
  specific frames where unchanged LTR flow harms the Arabic read. Every frame in this
  range is `lang: de` per `MANIFEST.json`. This squad opened no `ar-desktop` frame and
  signs that it contributes nothing to the RTL park either way. The RTL row stays with
  whichever squad holds frames `468` and above.
- **No mojibake, no missing glyphs, no tofu boxes anywhere in 26 frames.** German
  diacritics render correctly in the brand face at every size checked: `Öffnet`,
  `erhöhen`, `WÄHLEN`, `Auslöserate`, `zurückgesetzt`, `DRÜCKE`, `Menü`, `gemäß`
  including the eszett. No fallback-font leak was observed on any German string.
- **No truncation with an ellipsis anywhere in the range.** Fit failures here are wraps
  (STL-DE-B-04), overflows past a panel edge (STL-DE-B-05) and a label riding a rim
  (STL-DE-B-11). Nothing was cut with a trailing `...`, so TR-115 and TR-086's
  ellipsis shape does not appear on the German session in this range.
- **No money pod clipped or overflowed.** `GUTHABEN`, `GEWINN` and `EINSATZ` pods were
  checked on every base and feature frame; the widest value observed was `$50,000.00`
  on frame `445` and it sits inside its pod with margin. The German pod LABELS are
  longer than the English ones and all three still fit.
- **No untranslated string found on the base game HUD chrome.** `GUTHABEN`, `GEWINN`,
  `EINSATZ`, `OVERDRIVE FREISPIELE`, `GESAMTGEWINN`, `MULTIPLIKATOR`, `TIPPEN ZUM
  FORTFAHREN`, `+16 FREISPIELE`, `MAX. GEWINN ERREICHT!` and `EINSAMMELN` are all
  correct German. The English on this session is concentrated in three places, the
  features menu, the buy dialogs, and the win-line strip, and nowhere else in these 26
  frames.
- **No motion or transition artefact that exists only in German was found.** The four
  transition frames in range (`445`, `447`, `449`, `451`, `453`, `455`, `462`, `464`,
  `466`) were each checked against their settled sibling. Composition problems found
  (STL-DE-B-04, 05, 11) are present in the SETTLED state too, so they are layout under
  longer copy, not motion.
- **Two observations recorded outside this lens, so no squad assumes another caught
  them.** (i) Frames `443` and `444` are pixel-identical despite being manifested as two
  different paytable sections (`Paytable section` note on both); both sections fit one
  viewport, so the two scroll anchors land in the same place and one of the two captures
  carries no new information. (ii) The feature entry card with `TIPPEN ZUM FORTFAHREN`
  is still on screen across `456` through `461`, all six frames manifested as
  `Overdrive free spins in flight`, so the six in-flight captures show no free spin
  actually running. Both are cross-locale and neither is a localisation finding; they
  belong to the capture-integrity and flow lenses.

## KNOWN matches
- KNOWN(Q-16): `reports/screens/stream-test-2026-07-28/446_de-desktop_autoplay_menu.png`, the parked `Spins` label renders `SPINS` in English beside four translated siblings. Full per-string verdict in the Q-16 section above.
- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/448_de-desktop_features_menu.png`, the OVERBOOST card writes `ca. 1.6x höhere Auslöserate` and `Zieht 1.25x pro Drehung ab` with the letter `x` in its blurb while the SAME card's cost badge two lines away writes `1.25× bet` with U+00D7, so the glyph disagreement is visible inside one card at one moment. Also `reports/screens/stream-test-2026-07-28/452_de-desktop_dialog_nitro_overdrive.png`, `schon auf 5x hochgedreht`, which is Q-26's fourth enumerated instance, now confirmed player-visible. Q-26 records it needs frame visibility to become a Wave 3 fix candidate: it has it.
- KNOWN(Q-34): `reports/screens/stream-test-2026-07-28/448_de-desktop_features_menu.png`, the mode reads `Cruise` in sentence case on the features menu card, which is the lower-case half of the pair Q-34 describes.
- KNOWN(TR-104): `reports/screens/stream-test-2026-07-28/465_de-desktop_maxwin_celebration.png` is the max win surface, and its unit IS translated to `EINSATZ` here, so this frame is evidence about the max win overlay specifically, not about the win banner. The open half of TR-104 concerns `WinBanner.svelte` and its frames are `428` to `430`, outside this range. Recorded so the marshal does not read STL-DE-B-02 as a duplicate of TR-104: they are different components, and the defect here is spacing, not language.
- No match found for TR-114, TR-112, Q-07, Q-27, Q-28, TR-089, MID-01 or MID-02 on any frame in this range. MID-01 and MID-02 both live on the big-win triple, frames `428` to `430` for this session, which is another squad's range.

tree_after:

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
?? reports/qa/stream_test/shards/STT-POPOUTL-A.md
?? reports/qa/stream_test/shards/STT-POPOUTL-B.md
?? reports/qa/stream_test/shards/STT-POPOUTS-A.md
?? reports/qa/stream_test/shards/STT-POPOUTS-B.md
?? reports/qa/stream_test/shards/STV-REST.md
```

**Clean. 32 entries, every one untracked (`??`), every one a squad shard under
`reports/qa/stream_test/shards/`. NOTHING is MODIFIED and NOTHING is DELETED.** One of
the 32 is this squad's own file, `STL-DE-B.md`; the other 31 belong to other squads and
are not this squad's to read or touch. No repository file outside this squad's single
permitted shard path was written, and no project script was run at any point: STEP 3 used
only `grep -n` and `sed -n` line ranges against source read as text.
