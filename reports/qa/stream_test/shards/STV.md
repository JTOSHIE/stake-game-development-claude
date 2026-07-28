# STV, voice lens (English strings judged as written prose, desktop frames)

scope: The desktop (en) session's text surfaces per assignment: splash, intro rules, hud menu, session panel, the nine paytable frames, autoplay menu, features menu, both buy dialogs, feature entry card, max win celebration, plus their transition frames. Material read as text: the `en` block and `SOCIAL_OVERRIDES` in `frontend/src/lib/i18n/translations.ts`, the English `featureI18n` block (same file), and the English values in `frontend/src/lib/i18n/prose.ts`. Judged against `docs/QUALITY_CHARTER.md` sections 1 to 3; my lens is the ungated remainder of the machine-tell list (register drift, over-explanation, casing drift within and across neighbouring surfaces, non-idiomatic English).
frames_read: 27

## STV-01 HIGH The win ticker renders `1 ways`

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/030_desktop_transition_paytable_closing.png (`L3  x4  1 ways  $0.20`), /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/039_desktop_feature_entry_card.png (`L2  x5  1 ways  $0.80`)
- Claim: The win breakdown ticker under the reels hardcodes the plural: `<span class="wb-ways">{current.ways} ways</span>` at `frontend/src/lib/components/WinBreakdown.svelte:94`, so a one-way win reads `1 ways`. Two of my 27 frames show it, so it is common in ordinary play, cycling every 1.4 s through every win presentation. `8 ways` on 018 is fine; the singular case was never handled. Plain grammar error on a persistent in-play surface; fails the inspection test outright.
- Where fixable: frontend/src/lib/components/WinBreakdown.svelte:94 (not locked)
- Proposed fix: `{current.ways} {current.ways === 1 ? 'way' : 'ways'}` now; note the `ways` literal itself is hardcoded English inside the Q-16/Q-32 park, so the parked locale job should carry a pluralising key rather than a bare noun.

## STV-02 HIGH Paytable scatter card is titled `SCAT` while the same modal writes `SCATTER` in full

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/020_desktop_paytable_top.png, 021_desktop_paytable_01_match_symbols_on_adjacent_reels_st.png, 023_desktop_paytable_03_symbol_payouts.png
- Claim: The scatter symbol card renders `SCAT` as its title. Directly beside it the wild card reads `Substitutes for all symbols except SCATTER`, the rules bullet reads `WILD substitutes for all symbols except SCATTER.`, and the win ticker renders `t('symbolScatter')` = `SCATTER` (translations.ts:279). One truncated dev-style name in a modal that spells the same symbol out in full three times; in English `SCAT` is also an unfortunate word on its own. Source: `{ name: 'SCAT', file: 'scatter', ... }` at `frontend/src/lib/components/PaytableModal.svelte:74` (comparisons at :87 and :227).
- Where fixable: frontend/src/lib/components/PaytableModal.svelte:74, :87, :227 (not locked)
- Proposed fix: keep the internal id but render the card title through `$tr('symbolScatter')` (the card previously held a short-note fill measured at PaytableModal.svelte:479, so re-check fit after the rename).

## STV-03 HIGH The malfunction clause appears twice in one modal in two different forms

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/024_desktop_paytable_04_rules.png (`Malfunctions void all pays and plays.`), 028_desktop_paytable_08_responsible_play.png and 029_desktop_paytable_09_disclaimer.png (`Malfunction voids all wins and plays.`)
- Claim: The same legal sentence is authored twice with different number and a different noun: `rulesMalfunction: 'Malfunctions void all pays and plays.'` (prose.ts:114) in the RULES list, and `disclaimerBody: 'Malfunction voids all wins and plays. ...'` (prose.ts:118) five headings later in the same scrolling modal. A reviewer reading the paytable top to bottom meets both. The social layer adds a third form, `'Malfunctions void all wins and plays.'` (prose.ts:197), against the social disclaimer's `'Malfunction voids all prizes and plays.'` (prose.ts:211), so the clause exists in four wordings across two modes. Only happens when nobody read the surface whole.
- Where fixable: frontend/src/lib/i18n/prose.ts:114, :118, :197, :211, plus the fifteen translated pairs in prose.locales.ts (not locked)
- Proposed fix: PARK(one wording must be chosen and swept through two keys in sixteen locales plus two social overrides; sized like TR-104, larger than small)

## STV-04 HIGH `TAP TO CONTINUE` on desktop, beside a surface that says `Press ... or hit Enter`

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/002_desktop_splash.png and 001_desktop_transition_splash_entrance.png (`TAP TO CONTINUE`), 039_desktop_feature_entry_card.png (`TAP TO CONTINUE` on the feature entry button), 050_desktop_maxwin_celebration.png (`PRESS COLLECT OR HIT ENTER TO CONTINUE`)
- Claim: The interaction verb is mobile on two desktop surfaces and keyboard-aware on a third. `splashPressAnywhere: 'TAP TO CONTINUE'` (translations.ts:1557) and `featureContinue: 'TAP TO CONTINUE'` (translations.ts:1548) both render to a mouse-driven session, on the first screen of the game and at the feature trigger, the two moments every stream shows. Meanwhile `maxWinHint: 'Press COLLECT or hit Enter to continue'` (prose.ts:83) knows about keyboards, and mixes two verbs, formal `Press` and colloquial `hit`, for the same action inside one sentence. The key name (`splashPressAnywhere`) and its CSS class (`press-prompt`, HeroSplash.svelte:70) both say press; the value drifted to TAP. That is three registers for one instruction across three surfaces of one session.
- Where fixable: frontend/src/lib/i18n/translations.ts:1548, :1557 (plus fifteen sibling values each, several of which already translate as press, e.g. Arabic), frontend/src/lib/i18n/prose.ts:83 (not locked)
- Proposed fix: PARK(one pointer-neutral instruction, e.g. PRESS TO CONTINUE / Press COLLECT or Enter to continue, swept through three keys in sixteen locales; the wording is an art call)

## STV-05 HIGH The max win cap is stated against `total bet` on one surface and `base bet` on two others

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/024_desktop_paytable_04_rules.png (`Maximum win per spin is capped at 5,000x your total bet.`), 035_desktop_dialog_buy_overdrive.png and 037_desktop_dialog_nitro_overdrive.png (`MAX WIN` `5,000x base bet`), 026_desktop_paytable_06_bet_modes.png (`Max win is quoted against the base bet.`)
- Claim: `rulesMaxWin: 'Maximum win per spin is capped at 5,000× your total bet.'` (prose.ts:113) against `maxWinFootnote`: `'Max win is quoted against the base bet.'` (`frontend/src/lib/config/fsModes.ts:191`) and the buy dialog stat `5,000× base bet` (BuyBonus.svelte:133 comment records the base-bet decision as ROUND 4 item 4). Under OVERBOOST the two terms denote different amounts (the debit is 1.25x while the base is 1.0x), so this is not only register drift, the two rules statements can disagree by 25 percent. Also a register note on the footnote itself: `quoted against` is trading-desk English, not player English.
- Where fixable: frontend/src/lib/i18n/prose.ts:113 plus fifteen siblings; fsModes.ts:190-191 (not locked)
- Proposed fix: PARK and escalate per convention (l.8): which figure is specified must be ruled on before the words are aligned; then align `rulesMaxWin` to the ruled term in sixteen locales.

## STV-06 MEDIUM `Continue` is the game's one sentence-case CTA, two screens after an all-caps one

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/004_desktop_intro_rules.png and 003_desktop_transition_splash_to_rules.png
- Claim: The intro rules button renders `Continue` (`introContinue: 'Continue'`, translations.ts:1556, rendered at IntroSplash.svelte:35). Every other CTA in the captured session is capitals: `TAP TO CONTINUE` (the immediately preceding screen), `COLLECT`, `BUY`, `CANCEL`, `SELECT`, `ACTIVATE`, `BET MODES`, and the resume dialog's own `CONTINUE` (`resumeContinue`, translations.ts:214). Same word, two casings, adjacent screens; charter class 4/7, which KNOWN_OPEN records as gated nowhere with frames as the instrument.
- Where fixable: frontend/src/lib/i18n/translations.ts:1556 and fifteen siblings, or a `text-transform` on `.intro-continue` in IntroSplash.svelte (not locked)
- Proposed fix: uppercase the rendered button via CSS in IntroSplash.svelte so all sixteen locale values are lifted at once, matching the CTA family.

## STV-07 MEDIUM One three-item menu mixes `PAYTABLE` with `Session` and `Mute`

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/017_desktop_hud_menu.png
- Claim: The hamburger menu renders `PAYTABLE` (via `$tr('paytable')` = `'PAYTABLE'`, translations.ts:271) directly above the literals `Session` and `Mute` (HudOverlay.svelte:428-432, repeated at :546-575, :655-659, :817-821), with `MUSIC` and `SOUND` slider labels in capitals below. Two casing conventions inside a five-line menu, charter class 7. The `Session` and `Mute` literals themselves are inside the Q-16 park (localisation), and the charter's 4.2d verification row records the `Session` casing as STILL_PRESENT under that park, so this entry is the frame evidence plus the note that the casing half is fixable without touching the park.
- Where fixable: frontend/src/lib/components/HudOverlay.svelte:428-432 and the three sibling layout branches (not locked)
- Proposed fix: apply the menu's casing convention in CSS on `.hud-menu-item` (or capitalise the two literals) now; the keying of the literals rides with the Q-16 park.

## STV-08 MEDIUM The same mode set is `SPIN MODES` in the menu and `BET MODES` one button later

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/033_desktop_features_menu.png and 032_desktop_transition_features_menu_opening.png (section `SPIN MODES`, footer button `BET MODES`), 026_desktop_paytable_06_bet_modes.png (heading `BET MODES`)
- Claim: One panel names its mode section `SPIN MODES` (`$tr('hudSpinModes')` = `'SPIN MODES'`, translations.ts:232, FeatureMenu.svelte:353) while its own footer button reads `BET MODES` (`$tr('betModesHeading')`, translations.ts:276, FeatureMenu.svelte:509) and opens a paytable section headed `Bet Modes` (PaytableModal.svelte:302, CSS-uppercased) listing the same cards. A player is asked to hold two names for one concept across one click. Reads as two authors, which is the machine tell.
- Where fixable: frontend/src/lib/components/FeatureMenu.svelte:353 or :509 plus PaytableModal.svelte:302; keys in translations.ts:232/:276 (not locked)
- Proposed fix: pick one term (BET MODES already carries the social override pair GET FEATURES / PLAY MODES) and retire the other key from these two surfaces; sixteen-locale value change on whichever key moves, so PARK(term choice is an owner call) if not ruled quickly.

## STV-09 MEDIUM The OVERBOOST blurb is spec register, then repeats its own cost line

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/033_desktop_features_menu.png, 032_desktop_transition_features_menu_opening.png, 026_desktop_paytable_06_bet_modes.png
- Claim: `modeOverboostBlurb: 'Double-chance: about 1.6x the feature trigger rate. Debits 1.25x every spin while ON.'` (prose.ts:90). `Debits` is bank-ledger vocabulary, `while ON` is device-manual capitals, `about` is a hedge inside a stat, and `Double-chance` hyphenates what the industry writes as two words. The card then restates the cost immediately below the blurb: `1.25× per spin while ON · $1.25` (FeatureMenu.svelte:422), so `while ON` appears twice in a 60 px card. That the register was not a deliberate voice choice is shown by the social variant, which says the same thing in plain English: `'Costs 1.25x every spin while ON.'` (prose.ts:189).
- Where fixable: frontend/src/lib/i18n/prose.ts:90 plus fifteen siblings (not locked)
- Proposed fix: PARK(rewrite of one blurb in sixteen locales rides best with the Q-26 x-glyph sweep already scheduled for these same strings)

## STV-10 MEDIUM `Buy a rich entry` is not idiomatic English

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/026_desktop_paytable_06_bet_modes.png, 037_desktop_dialog_nitro_overdrive.png
- Claim: `modeSuperBlurb: 'Buy a rich entry with the Overdrive meter pre-revved to 5x.'` (prose.ts:94). `pre-revved` is good on-theme voice; `a rich entry` is not a thing an English-speaking copywriter calls a bonus buy, it reads like an internal maths term (a high-value entry state) surfacing to the player. Renders on the paytable card and as the first line of the NITRO OVERDRIVE buy dialog.
- Where fixable: frontend/src/lib/i18n/prose.ts:94 plus fifteen siblings and the social variant at prose.ts:192 (not locked)
- Proposed fix: PARK(one line, sixteen locales, wording is an art call; candidate: Buy a boosted entry with the Overdrive meter pre-revved to 5x)

## STV-11 MEDIUM The scatter rules bullet misdescribes the award and disagrees with its neighbours on style

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/024_desktop_paytable_04_rules.png
- Claim: `rulesScatterMult: '3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.'` (prose.ts:112). Three defects in one bullet. (1) `apply a ... multiplier to your total bet win` is wrong as a description: the specification pays an instant 1x/3x/10x of total bet (featureI18n says it correctly at translations.ts:1540, `pay an instant 1×, 3× or 10× total bet`), and `your total bet win` is not an English noun phrase. (2) `SCATTERs` (capitals plus lowercase plural s) sits one bullet under `SCATTER` and two screens from `Scatters` (translations.ts:1540), three spellings of one symbol. (3) This bullet uses Oxford commas (`3, 4, or 5`) while the Overdrive bullets in the same modal do not (`3, 4 or 5`), two punctuation habits in one document.
- Where fixable: frontend/src/lib/i18n/prose.ts:112 plus fifteen siblings and the social variant at prose.ts:195 (not locked)
- Proposed fix: PARK and escalate the description half per convention (l.8) since it restates a pay rule; align spelling and comma habit in the same sweep.

## STV-12 MEDIUM The ticker writes `x5` where the paytable writes `5×`

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/018_desktop_session_panel.png and 030_desktop_transition_paytable_closing.png and 039_desktop_feature_entry_card.png (ticker `x5` / `x4`), 020_desktop_paytable_top.png (paytable rows `3×`, `4×`, `5×`)
- Claim: n-of-a-kind is rendered `x{current.kind}` with a letter x, prefix form, at `frontend/src/lib/components/WinBreakdown.svelte:93`, while the paytable renders the same concept as `3×`/`4×`/`5×` with U+00D7, suffix form (PaytableModal.svelte:233-235). Same quantity, two glyphs and two orders, both on screen within one session. This is charter class 5's x-versus-multiplication-sign form on a surface Q-26 does not cover (Q-26 is the fsModes blurbs).
- Where fixable: frontend/src/lib/components/WinBreakdown.svelte:93 (not locked)
- Proposed fix: render `{current.kind}×` (suffix, U+00D7) to match the paytable; one line.

## STV-13 MEDIUM The buy flow's verbs drift: `ACTIVATE` opens a dialog whose action is `BUY`

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/033_desktop_features_menu.png (`ACTIVATE` on the Buy Overdrive card), 035_desktop_dialog_buy_overdrive.png (`BUY` / `CANCEL`)
- Claim: The purchase chain reads `Buy Overdrive` (card title) then `ACTIVATE` (`$tr('hudActivate')`, FeatureMenu.svelte:498) then `BUY` (`buyConfirm`, translations.ts:1538). `ACTIVATE` is the toggle verb this same panel uses for OVERBOOST's no-dialog switch; borrowing it for a priced purchase blurs the one distinction the panel is built around, and the verb changes mid-flow. A person writing the flow deliberately would put the commercial verb on the commercial button.
- Where fixable: frontend/src/lib/components/FeatureMenu.svelte:498 (not locked); `buyFeature` = `'BUY FEATURE'` (translations.ts:1536) already exists in sixteen locales
- Proposed fix: render the buy-kind cards' button through the existing `buyFeature`/`buyConfirm` vocabulary (`BUY`), keeping `ACTIVATE` for toggles; social override GET already covers the stake.us side.

## STV-14 LOW The ways diagram caption reads as specification prose

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/020_desktop_paytable_top.png, 021 and 022 siblings
- Claim: `waysDiagramCaption: 'Reels 1, 2 and 3 hold the same symbol (highlighted), which is a match read left to right from reel 1. Reels 4 and 5 are not required.'` (prose.ts:98). `hold`, the bracketed aside, and `a match read left to right` are spec-sheet constructions; a caption written for a player would say something like: The same symbol on reels 1, 2 and 3 pays as a match from reel 1. Reels 4 and 5 are not needed.
- Where fixable: frontend/src/lib/i18n/prose.ts:98 plus fifteen siblings (not locked)
- Proposed fix: PARK(cosmetic rewrite, sixteen locales; batch with the other prose rewrites above)

## STV-15 LOW A times-times-times chain in the symbol values rule

- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/024_desktop_paytable_04_rules.png
- Claim: `rulesSymbolValues: 'Symbol values shown are per matching way; the total is that value times the number of ways times your bet.'` (prose.ts:110). Accurate, but `that value times the number of ways times your bet` stacks two `times` in one clause, which is the over-explaining register the charter's inspection test names. `value × ways × bet` or a two-clause sentence reads deliberate.
- Where fixable: frontend/src/lib/i18n/prose.ts:110 plus fifteen siblings and the social variant at prose.ts:194 (not locked)
- Proposed fix: PARK(cosmetic rewrite, sixteen locales; batch with STV-14)

## Explicit absences, signed

- The session panel (018), autoplay menu labels (031), interface guide entries (027, 028) and the responsible play paragraph (028) read consistent and deliberate under this lens; no new voice findings there beyond the KNOWN rows below.
- The mixed casing of the mode names themselves (`Normal`, `Cruise`, `Buy Overdrive` beside `OVERBOOST`, `NITRO OVERDRIVE`, frames 026/033) was checked and is NOT reported: the capitals are stylised proper nouns fixed by the specification (CLAUDE.md True game facts; charter Q-34 analysis reaches the same verdict).
- The `H1`/`M3`/`L2` symbol ids on paytable cards and the ticker were checked and are NOT reported: WinBreakdown.svelte:15-17 records the ids as a deliberate, locale-stable choice, applied consistently across both surfaces. `SCAT` (STV-02) is the one member of that family that is neither the id convention nor the full word.

## KNOWN matches

- KNOWN(Q-26): /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/026_desktop_paytable_06_bet_modes.png, 033_desktop_features_menu.png, 037_desktop_dialog_nitro_overdrive.png. `about 1.6x`, `Debits 1.25x`, `pre-revved to 5x` render with letter x while the same card/footer/dialog carry U+00D7 (`1.25×`, `1×, 3× or 10×`). The strings now live in prose.ts:88-94 rather than fsModes.ts, so the Q-26 fix should be pointed at prose.ts and prose.locales.ts.
- KNOWN(Q-16 park): parked hardcoded strings confirmed VISIBLE on the desktop en frames: `Session` and `Mute` (017), `Stop on win` / `Single win limit` / `Stop on feature` / `Loss limit` / `SPINS` (031), `PRESS COLLECT OR HIT ENTER TO CONTINUE` (050), `Scatters` table header and paytable section headers (024, 020-029). Note for the marshal: several of these now have keys in prose.ts (stopOnWin etc., maxWinHint), so part of the park may be overtaken by the prose layer; an en-only session cannot distinguish keyed from hardcoded, only the de/ar squads can.
- KNOWN(Q-34): only the lowercase side is in my frame set (`Cruise`, frames 026 and 033); the `CRUISE` HUD badge surface is not among my assigned frames, so no fresh cross-surface pair from this shard.
- KNOWN(Q-07): the infinity glyph on 031's autoplay spin list, allowlisted, not a finding.

tree_after: `?? reports/qa/stream_test/shards/` (the one line `git status --porcelain` printed after this shard was written; it is my own shard's directory, under the expected reports/qa/stream_test/ path, and nothing else is dirty)
