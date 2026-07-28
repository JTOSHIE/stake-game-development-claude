# STT-MOBILEL-A, typography (Mobile L, 425x812, en, frames 208 to 233)
scope: every frame of the `mobile-l` session numbered 208 to 233 inclusive, 26 frames, opened once each with the Read tool
frames_read: 26

## STT-MOBILEL-A-01 HIGH The HUD menu mixes upper case and title case across four items in one list
- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/223_mobile-l_transition_menu_opening.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/224_mobile-l_hud_menu.png
- Claim: the menu that opens from the burger button stacks, top to bottom, `PAYTABLE` in tracked upper case, `Session` in title case, `Mute` in title case, then the two slider labels `MUSIC` and `SOUND` in tracked upper case again. Four adjacent rows of one component, two casings, alternating. The first item is localised and its English value is the upper case literal `PAYTABLE` (`frontend/src/lib/i18n/translations.ts:271`), while the two below it are hardcoded title case literals in the markup. `PAYTABLE` and `Session` also carry visibly different letter-spacing within about 30 vertical pixels of each other.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:428-432`, and the same three-line block is repeated verbatim at `:546-575`, `:655-659` and `:817-821` for the four layout variants, so a fix that changes one place fixes a quarter of the surfaces. The literals are `Session` (`:429`, `:547`, `:656`, `:818`) and `{$isMuted ? 'Unmute' : 'Mute'}` (`:432`, `:575`, `:659`, `:821`).
- Proposed fix: route `Session` and `Mute`/`Unmute` through `$tr` with upper case English values to match `paytable`, in all four blocks.

## STT-MOBILEL-A-02 HIGH The paytable rules print `SCATTERs`, an all-caps word with a lower case plural
- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/231_mobile-l_paytable_04_rules.png
- Claim: the RULES bullet renders the literal `3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.` The trailing `s` is lower case on an otherwise fully capitalised word. The block that renders it carries no `text-transform`, so the string reaches the player exactly as written: `.fs-rules li` at `frontend/src/lib/components/PaytableModal.svelte:668` sets only `font-size`, `color`, `padding-left`, `position` and `line-height`. The social variant of the same string has the same defect (`...to your total play prize.`).
- Stated plainly for the marshal, per the facts discipline: I did NOT resolve the lower case `s` by eye at the 425 pixel capture width. The specification is the evidence and the frame is where it renders, which is the correct order. On a 1200 pixel desktop frame it would be plain to a reviewer, which is why this is graded HIGH rather than LOW.
- Where fixable: `frontend/src/lib/i18n/prose.ts:112` and `frontend/src/lib/i18n/prose.ts:195` (the social branch).
- Proposed fix: change `SCATTERs` to `SCATTERS` in both literals, then check the fifteen locale variants in `frontend/src/lib/i18n/prose.locales.ts` for the same shape.

## STT-MOBILEL-A-03 HIGH The scatter symbol is named `SCAT`, `SCATTER`, `SCATTERs` and `Scatters` across four strings, two of them side by side
- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/228_mobile-l_paytable_01_match_symbols_on_adjacent_reels_st.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/230_mobile-l_paytable_03_symbol_payouts.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/231_mobile-l_paytable_04_rules.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/211_mobile-l_intro_rules.png
- Claim: in the SYMBOL PAYOUTS grid the two cards sit in one row. The left card is titled `WILD` and its body reads `Substitutes for all symbols except SCATTER`. The right card, touching it, is titled `SCAT`. The full word and the four-letter form are therefore on screen simultaneously, about 130 horizontal pixels apart. The RULES section then writes `SCATTERs`, and the pre-spin rules card writes `3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1×, 3× or 10× total bet.` in title case. Four forms of one symbol name. `SCAT` reads as a truncated string rather than a name, which is precisely the machine-tell the standing mandate names.
- Where fixable: the card title is the data literal `{ name: 'SCAT', file: 'scatter', pays: [...] }` at `frontend/src/lib/components/PaytableModal.svelte:74`, rendered as `{sym.name}` at `:226` and used as a branch key at `:87` and `:227`, so the name doubles as an identifier and cannot simply be edited in place. The full form already exists as `symbolScatter: 'SCATTER'` at `frontend/src/lib/i18n/translations.ts:279`. The title case instance is `rulesOverdriveTrigger` at `frontend/src/lib/i18n/translations.ts:1540`.
- Proposed fix: give `SYMBOLS` a separate display field so `name` stays the key and the card title renders `SCATTER` from `symbolScatter`, then settle one casing for the word in prose across the two rule strings.

## STT-MOBILEL-A-04 MEDIUM Payout figures in one column carry zero, one and two decimal places
- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/229_mobile-l_paytable_02_ways_to_win.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/230_mobile-l_paytable_03_symbol_payouts.png
- Claim: the H1 card lists `1.5`, `6`, `22` down one right-aligned column; H2 lists `0.8`, `3`, `10`; M1 lists `0.45`, `1.5`; M2 lists `0.3`, `1`. Within a single card the decimal precision changes row to row, and across the four cards visible on frame `230` the same column shows two decimal places (`0.45`), one (`1.5`, `0.8`, `0.3`) and none (`6`, `22`, `3`, `10`, `1`). Every figure is the same quantity, a per-way payout, so nothing in the data justifies the change. The cause is that the raw JavaScript number is printed with no formatter: `{sym.pays[2] ?? '-'}` at `PaytableModal.svelte:234`. The source array makes it worse further down the table than the frames reach, because `0.10` and `0.20` are number literals and will print as `0.1` and `0.2`.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:71-80` (the `SYMBOLS` pay arrays) and the three render sites at `:234`, `:235`, `:236`.
- Proposed fix: print through one formatter at the three render sites, either fixed two decimal places throughout or consistent trailing-zero trimming, so the column reads as one set.

## STT-MOBILEL-A-05 MEDIUM Bet mode names mix title case and all caps inside one card stack
- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/233_mobile-l_paytable_06_bet_modes.png
- Claim: the BET MODES section stacks three cards whose titles read `Normal`, `Cruise` and `OVERBOOST`, top to bottom, in that order. Two title case, one all caps, in the same component at the same size. The five display names in the source are `'Normal'`, `'Cruise'`, `'OVERBOOST'`, `'Buy Overdrive'` and `'NITRO OVERDRIVE'`, so the casing is carried in the strings rather than applied by the card. This is adjacent to ledger row Q-34 but is not the same observation: Q-34 records one word rendering two ways on different surfaces through a `text-transform` present on one class and absent on three, whereas here three sibling instances of one component disagree with each other inside a single view.
- Where fixable: `frontend/src/lib/i18n/prose.ts:85,87,88,90,92`.
- Proposed fix: normalise the display names to one casing at the card, so the source strings can keep whatever form the maths package uses without the player seeing the difference. The direction is an art call and sits with the same owner decision as Q-34.

## STT-MOBILEL-A-06 MEDIUM The win detail strip reads `1 ways`, and writes its match count with a letter `x` while the rest of the build uses `×`
- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/221_mobile-l_transition_bigwin_countup_late.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/223_mobile-l_transition_menu_opening.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/224_mobile-l_hud_menu.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/222_mobile-l_bigwin_settled.png
- Claim: the strip under the reels reads `L3   x4   1 ways   $0.20` in frames `221`, `223` and `224`, and `M3   x5   8 ways   $16.00` in frame `222`. The singular case is not handled, so the game prints `1 ways` to the player. The source is `<span class="wb-count">x{current.kind}</span>` and `<span class="wb-ways">{current.ways} ways</span>`: an ASCII `x` prefix and an unconditional plural. This matters more than its size suggests because the paytable, the mode cards and the trigger table all correctly use U+00D7 (verified below), so this strip and the win banner are the two surfaces still using the letter.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:93-94`.
- Proposed fix: `×{current.kind}` and `{current.ways} {current.ways === 1 ? 'way' : 'ways'}`, ideally through the prose layer so the fifteen other locales get the same treatment rather than an English-only literal.

## STT-MOBILEL-A-07 MEDIUM The session panel heading is the only panel heading in sentence case and body face
- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/225_mobile-l_session_panel.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/227_mobile-l_paytable_top.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/231_mobile-l_paytable_04_rules.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/211_mobile-l_intro_rules.png
- Claim: every other panel or section heading in this session is set in the tracked upper case display treatment: `PAYTABLE`, `WAYS TO WIN`, `SYMBOL PAYOUTS`, `RULES`, `OVERDRIVE FREE SPINS`, `BET MODES`, and the pre-spin card's `OVERDRIVE FREE SPINS`. The session panel alone is headed `Session information`, sentence case, untracked, in the body face. Its five row labels render `Time played`, `Spins`, `Total wagered`, `Total won` and `Net result` in sentence case, where the HUD's own pod labels visible behind the same overlay are `BALANCE`, `WIN` and `BET`.
- Where fixable: `frontend/src/lib/i18n/translations.ts:246` (`rgSessionTitle: 'Session information'`) and `:247` onward for the row labels, rendered at `frontend/src/lib/components/SessionPanel.svelte:100` and `:113`.
- Proposed fix: set the panel heading in the same display treatment and casing as `paytable`, and settle one casing for the row labels against the HUD pod labels.

## STT-MOBILEL-A-08 MEDIUM The rules gate button is title case where every other button on the surface is upper case
- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/211_mobile-l_intro_rules.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/209_mobile-l_splash.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/213_mobile-l_base_idle.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/232_mobile-l_paytable_05_overdrive_free_spins.png
- Claim: the pre-spin rules card's primary action reads `Continue`. Every other action on the surface is upper case: `SPIN`, `MAX`, `FEATURES`, `BET`, `BUY FEATURE`, and the splash call to action `TAP TO CONTINUE`. The splash instance is the sharp one, because the same verb appears as `TAP TO CONTINUE` on frame `209` and as `Continue` two surfaces later, inside the first thirty seconds a viewer sees.
- Where fixable: `frontend/src/lib/i18n/translations.ts:1556` (`introContinue: 'Continue'`), rendered at `frontend/src/lib/components/IntroSplash.svelte:34`.
- Proposed fix: PARK(the direction is an art call and it is the same decision as Q-34 and A-05: either all buttons upper case, or a stated title case convention for dialog actions. Whichever way it goes, `TAP TO CONTINUE` and `Continue` must stop disagreeing about the same verb.)

## STT-MOBILEL-A-09 LOW The same rule sentence is punctuated with and without a serial comma on two surfaces
- Frames: /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/211_mobile-l_intro_rules.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/231_mobile-l_paytable_04_rules.png
- Claim: the pre-spin card writes `3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1×, 3× or 10× total bet.` with no serial comma in either list. The paytable RULES section writes the same rule as `3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.` with a serial comma in both lists. Two house styles in one product, on two surfaces a player can open within a minute of each other.
- Where fixable: `frontend/src/lib/i18n/translations.ts:1540` against `frontend/src/lib/i18n/prose.ts:112`.
- Proposed fix: pick one, Australian English convention is no serial comma, and apply it to both literals and to their locale siblings.

## Explicit absences, signed

- **A finding I wrote in the step 2 shard and then REFUTED against source, recorded rather than quietly dropped.** I read the paytable trigger table and the symbol payout counts on frames `228` to `232` as using the ASCII letter `x` (`1x / 3x / 10x`, `3x / 4x / 5x`), which would have been a mixed-glyph finding inside a single view. It is not true. The source is `×` throughout: `TRIGGER_TABLE` awards are `'1×'`, `'3×'`, `'10×'` at `frontend/src/lib/components/PaytableModal.svelte:95-97`; the payout counts are literal `3×`, `4×`, `5×` at `:234-236`; the SCAT card summary is `scatterSummary: '3 / 4 / 5 = 1× / 3× / 10× + 8 / 12 / 16 free spins'` at `frontend/src/lib/i18n/prose.ts:117`; the mode COST cell is `{m.cost}×` at `PaytableModal.svelte:321`; and MAX WIN is `FS_MAX_WIN_LABEL = '5,000×'` at `frontend/src/lib/config/fsModes.ts:139`. **The paytable is clean on this class.** At 425 pixels a U+00D7 at that size is not reliably distinguishable from a lower case `x` by eye, which is the honest reason the frame alone was not enough. The surviving letter-`x` instances in my range are exactly three, all separately accounted for: `WinBreakdown.svelte:93` (A-06 above), the win banner unit (KNOWN(MID-02)) and the mode blurbs (KNOWN(Q-26)).
- **No money pod clipped, ellipsised or overflowed** anywhere in frames 208 to 233. Checked at every magnitude the session reached: `$50,000.00` in the BALANCE pod, `$0.00`, `$3.90`, `$15.95` and `$16.20` in the WIN pod, `$1.00` in the bet value, `$100.00` in the BUY FEATURE row, `$5.00`, `$20.10` and `+$15.10` in the session panel, and `$0.20` and `$16.00` in the win detail strip. Every one sits inside its container with margin. So no KNOWN(TR-115 / TR-086) evidence from this shard, which is worth recording because 425x812 is the narrowest viewport before the two mobile sessions below it.
- **No em dash and no en dash in any player-visible prose** across the 26 frames. The only horizontal marks in prose are true hyphens, in `Double-chance` and in the parenthetical `(left to right)`. Checked the rules card, all nine paytable views in range, the session panel and every HUD label.
- **No mixed straight and curly quotes**, because no quotation mark and no apostrophe appears anywhere in the 26 frames. There is no possessive and no contraction in any player-visible string in this range, so the class could not be exercised here. That is not the same as clean by design, and I am not claiming the stronger thing.
- **No placeholder string survived**: no `lorem`, `TODO`, `undefined`, `NaN`, `null`, `%s`, `{0}` or untranslated key path on any of the 26 frames.
- **No numeral shimmy on a non-count-up surface.** The BALANCE readout holds `$50,000.00` with glyph positions identical to the pixel across frames `213`, `216`, `217`, `218`, `219`, `220`, `221`, `222` and `225`, and the bet value holds `$1.00` identically across the same run. The banner count-up (`220` at `$10.27`, `221` and `222` at `$16.20`) is the `.fs-num` per-digit mechanism and is excluded per TR-089. The WIN pod steps `$0.00` to `$3.90` to `$15.95` to `$16.20` without the surrounding pod or its label moving.
- **No fallback glyph in a foreign family observed.** Every glyph rendered in the range is Latin, digits, `$`, `%`, `+`, `:`, `,`, `.`, `/`, `×` and the `›` chevron used as a bullet (`PaytableModal.svelte:669`), and all of them render in the surrounding face.
- **One thing I could not resolve, and have therefore NOT written as a finding.** The `WIN!` overlay drawn over the reels in frame `219` sits at a size and weight I could not match to the display face with confidence at the 425 pixel capture width. I do not claim it is system font leakage and I do not claim it is clean. It wants a magnified look or a source check before anyone rules on it. Given that my one confident-looking glyph reading in this shard turned out to be wrong (the refutation above), I am deliberately not guessing at this one.
- **Double spaces**: none detected, but this absence is weak and I am marking it weak. The paytable prose and the rules card are centre-aligned, which hides a doubled space in the justification, and at 425 pixels a single extra space is at the edge of the capture's resolution. Treat this class as unswept rather than clean.
- **Q-34 itself was not re-observed**: no HUD badge reading `CRUISE` appears in frames 208 to 233, because the session never leaves the `Normal` mode in this range. A-05 is a neighbouring observation, not the row.

## KNOWN matches
- KNOWN(MID-01): /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/220_mobile-l_transition_bigwin_countup_early.png, the banner reads `$10.27` while the HUD WIN pod reads `$15.95` at the same instant, on a win that settles at `$16.20` in /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/222_mobile-l_bigwin_settled.png. The mobile-l triple confirms the pattern the ledger predicted for every session.
- KNOWN(MID-02): /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/220_mobile-l_transition_bigwin_countup_early.png, /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/221_mobile-l_transition_bigwin_countup_late.png and /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/222_mobile-l_bigwin_settled.png all render the unit as `16x BET` with the ASCII letter.
- KNOWN(Q-26): /Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/233_mobile-l_paytable_06_bet_modes.png renders the OVERBOOST blurb `Double-chance: about 1.6x the feature trigger rate. Debits 1.25x every spin while ON.`, confirming the row's strings are player-visible on a stream frame. **A correction the marshal should carry into the row**: Q-26 records these as living in `fsModes.ts`. They do not. `modeOverboostBlurb` is at `frontend/src/lib/i18n/prose.ts:89` and `modeSuperBlurb`, which holds the row's `5x`, is at `frontend/src/lib/i18n/prose.ts:93`. `fsModes.ts` holds only the `blurbKey` references (`:75`, `:85`). A sweep pointed at the file the row names would find nothing and could close the row falsely.
- KNOWN(TR-104): not applicable to this shard. The mobile-l session is `lang: en` per MANIFEST.json, so the English `BIG WIN` and `16x BET` on frames `220` to `222` are correct rather than evidence.

tree_after: `git status --porcelain`, verbatim. All 32 entries are untracked (`??`) squad shards. Nothing is MODIFIED and nothing is DELETED. Only one of these is mine, `STT-MOBILEL-A.md`; the rest belong to other squads.
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
