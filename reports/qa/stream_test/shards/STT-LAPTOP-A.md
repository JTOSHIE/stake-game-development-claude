# STT-LAPTOP-A, typography (laptop, frames 053 to 078)

scope: every frame of the `laptop` session numbered 053 to 078 inclusive, 26 frames, viewport `1024x576`, lang `en`, build HEAD `d9bdf22`. Frames 079 to 104 of the same session belong to another squad and were not opened.
frames_read: 26

A note on method, recorded because it changed a finding. This shard's step-2 draft opened with a STREAM claim that the `WIN!` overlay on frame `064` was rendering in a system fallback face. Step 3 refuted it at source: `frontend/src/lib/components/WinCelebration.svelte:55` sets `font-family: var(--fs-font-display)` explicitly, and `frontend/src/main.ts:2-4` self-hosts Orbitron at 400, 700 and 900, so the family cannot fall through. The real divergence is letter-spacing, and it is reported at its true severity as STT-LAPTOP-A-05. The withdrawn claim is stated here rather than deleted, per (l.6).

## STT-LAPTOP-A-01 HIGH The scatter symbol is written six ways, five of them inside one frame, including `SCATTERs`

- Frames: `reports/screens/stream-test-2026-07-28/076_laptop_paytable_04_rules.png` (five of the six at one scroll position), `reports/screens/stream-test-2026-07-28/073_laptop_paytable_01_match_symbols_on_adjacent_reels_st.png`, `reports/screens/stream-test-2026-07-28/075_laptop_paytable_03_symbol_payouts.png`, `reports/screens/stream-test-2026-07-28/077_laptop_paytable_05_overdrive_free_spins.png`, `reports/screens/stream-test-2026-07-28/056_laptop_intro_rules.png`, `reports/screens/stream-test-2026-07-28/078_laptop_paytable_06_bet_modes.png`
- Claim: one symbol, six renderings, transcribed verbatim from the frames:
  - `SCAT`, the symbol card title (frames 073, 075)
  - `SCATTER`, in `Substitutes for all symbols except SCATTER` and `WILD substitutes for all symbols except SCATTER.` (frames 073, 075, 076)
  - `SCATTERs`, in `3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.` (frame 076)
  - `SCATTERS`, the award table column header (frames 076, 077)
  - `Scatters`, in `3 or more Scatters during free spins award +5 free spins.` (frames 076, 077) and `3, 4 or 5 Scatters award 8, 12 or 16 free spins` (frame 056)
  - `scatter` / `scatters`, in `The scatter build runs shorter on a retrigger than on the entry, because the feature is already secured.` (frames 076, 077) and `Overdrive Free Spins trigger on 3+ scatters.` (frame 078)

  Frame `076` carries `SCATTER`, `SCATTERs`, `SCATTERS`, `Scatters` and `scatter` simultaneously, within a 300 px vertical band, with no scrolling between them. `SCATTERs` is the worst token: it is not a casing choice but a caps-locked word with a lowercase plural welded on, which is precisely the machine-tell the standing mandate names. Separately `SCAT` is a truncation shown as a card title while the card two columns to its left spells the same symbol `SCATTER` in its own body.
- Where fixable: `frontend/src/lib/i18n/prose.ts:112` (`rulesScatterMult`, the `SCATTERs` token) and its social twin `frontend/src/lib/i18n/prose.ts:195`; `frontend/src/lib/components/PaytableModal.svelte:74` (`{ name: 'SCAT', file: 'scatter', ... }`); `frontend/src/lib/i18n/translations.ts:1540`, `:1542`, `:1543` (`Scatters`, `Scatters`, `The scatter build`); `frontend/src/lib/i18n/prose.ts:86` (`3+ scatters`); `frontend/src/lib/i18n/translations.ts:279` already holds the correct `symbolScatter: 'SCATTER'`. None locked.
- Proposed fix: `SCATTERs` becomes `SCATTERS` at `prose.ts:112` and `:195`, a two-character edit that closes the worst of it on its own. `PaytableModal.svelte:74` takes `$tr('symbolScatter')` rather than the literal `'SCAT'`, which is already the correct string at `translations.ts:279`. The prose casing then needs one ruling and one sweep across the sixteen locales, which is PARK(sixteen-locale prose sweep, sized like TR-091) if the owner wants the prose normalised too.

## STT-LAPTOP-A-02 HIGH Paytable bullet markers are stranded at the panel's left edge while their text is centred, and the cause is the Vite scaffold rule Q-27 already records

- Frames: `reports/screens/stream-test-2026-07-28/075_laptop_paytable_03_symbol_payouts.png`, `reports/screens/stream-test-2026-07-28/076_laptop_paytable_04_rules.png`, `reports/screens/stream-test-2026-07-28/077_laptop_paytable_05_overdrive_free_spins.png`
- Claim: in the `RULES` and `OVERDRIVE FREE SPINS` blocks, every bullet row draws its `›` marker hard against the panel's left inner edge at about x 68 of a 1024 px frame, while the row's own text is centred in the panel. On frame `075` the row `Wins pay left to right on adjacent reels starting from reel 1.` begins at about x 352, leaving about 284 px of nothing between the marker and the text it belongs to. On frame `076` the shortest row, `Malfunctions void all pays and plays.`, begins at about x 411, a gap of about 343 px. Eleven bullet rows across the three frames show it. The block reads as stray glyphs in a margin rather than as a list.
  The same `›` marker on the intro rules card, `056_laptop_intro_rules.png`, sits about 8 px from left-aligned text and reads correctly, so the failure is specific to the paytable.
  Root cause, from source rather than inferred: `frontend/src/lib/components/PaytableModal.svelte:668-669` sets `.fs-rules li { padding-left: 16px; position: relative }` with `li::before { content: '›'; position: absolute; left: 0 }`, which is correct on its own. The centring is inherited from `frontend/src/app.css:139-144`, the untouched Vite scaffold `#app { max-width: 1280px; margin: 0 auto; padding: 2rem; text-align: center; }`. The absolutely positioned marker does not move with the centred text, so the two separate.
  This is the frame evidence KNOWN_OPEN row **Q-27** asks for. Q-27 says the scaffold remnants are *visible only if any link or unstyled surface reaches a frame*; the scaffold centring reaches three frames in this shard, on a surface a streamer opens.
- Where fixable: `frontend/src/app.css:143` (`text-align: center` inside the `#app` scaffold block) is the root cause; `frontend/src/lib/components/PaytableModal.svelte:667-669` is where it can be contained. Neither locked.
- Proposed fix: add `text-align: left` to `.fs-rules li` at `PaytableModal.svelte:668` to contain it now, and delete the scaffold `#app` block at `app.css:139-144` under Q-27, which is the fix that stops it reappearing elsewhere. Deleting the scaffold rule alone should be re-proofed against every panel, since other surfaces may be relying on the inherited centring.

## STT-LAPTOP-A-03 HIGH Bet-mode card titles mix title case and all caps within one row of one component

- Frames: `reports/screens/stream-test-2026-07-28/078_laptop_paytable_06_bet_modes.png`, `reports/screens/stream-test-2026-07-28/077_laptop_paytable_05_overdrive_free_spins.png`
- Claim: the five bet-mode cards are rendered by one component with identical geometry, identical `COST` / `RTP` / `MAX WIN` sub-labels and identical title type size, and are titled `Normal`, `Cruise`, `OVERBOOST`, `Buy Overdrive`, `NITRO OVERDRIVE`. Three title case, two all caps. On frame `078` `Cruise`, `OVERBOOST` and `Buy Overdrive` sit adjacent in one horizontal row, so this is one glance rather than a comparison across screens; the two caps titles also read heavier and wider because the face's capitals carry more ink at the same weight.
  This is not Q-34. Q-34 is one mode's name differing between the paytable and the HUD badge through a `text-transform`. Here five sibling literals disagree with each other on one surface with no transform involved.
- Where fixable: `frontend/src/lib/i18n/prose.ts:85`, `:87`, `:89`, `:91`, `:93` (`modeNormalLabel: 'Normal'`, `modeCruiseLabel: 'Cruise'`, `modeOverboostLabel: 'OVERBOOST'`, `modeBonusLabel: 'Buy Overdrive'`, `modeSuperLabel: 'NITRO OVERDRIVE'`), plus the social override `frontend/src/lib/i18n/prose.ts:190` (`modeBonusLabel: 'Get Overdrive'`). Not locked. `frontend/src/lib/config/fsModes.ts:71-115` holds only the `labelKey` references, not the strings.
- Proposed fix: settle the direction as an art call, then normalise all five literals in `prose.ts` to it. One-line-per-mode edit once the direction is chosen; PARK only if the owner wants the caps names kept as branding, in which case say so on the row.

## STT-LAPTOP-A-04 HIGH The HUD menu sets three of its own items in two casings

- Frames: `reports/screens/stream-test-2026-07-28/069_laptop_hud_menu.png`, `reports/screens/stream-test-2026-07-28/068_laptop_transition_menu_opening.png`
- Claim: the menu opened from the HUD hamburger lists `PAYTABLE`, `Session`, `Mute`, then the slider rows `MUSIC` and `SOUND`. The first three are three rows of one item component, `.hud-menu-item`, at the same size, weight, colour and left inset, and the first is all caps while the two below it are sentence case. The two slider labels are all caps and letter-spaced. Three casings in a five-row panel about 190 px tall.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:428` renders `{$tr('paytable')}`, which is `'PAYTABLE'` at `frontend/src/lib/i18n/translations.ts:271`; `:429` hardcodes `Session`; `:431-432` hardcodes `{$isMuted ? 'Unmute' : 'Mute'}`. The same triple repeats in the component's other three layout branches at `:546-547`/`:574-575`, `:655-656`/`:658-659` and `:817-818`/`:820-821`, so a fix must touch all four. Not locked. `Session`, `Mute` and `Unmute` are also on the Q-16 owner-parked hardcoded-English list, so this finding and that park meet in the same literals.
- Proposed fix: one casing rule for `.hud-menu-item` labels. If the direction is all caps, `text-transform: uppercase` on `.hud-menu-item` is a one-property fix covering all four branches at once and is the safer edit while those three literals stay parked for localisation.

## STT-LAPTOP-A-05 MEDIUM The small-win `WIN!` is the only display string in the game set without letter-spacing, so it reads as a foreign face beside every other one

- Frames: `reports/screens/stream-test-2026-07-28/064_laptop_win_presentation.png`
- Claim: the overlay string `WIN!` is set at `font-weight: 900` with no `letter-spacing`, at `clamp(2rem, 6vw, 3.5rem)`, so about 40 px tall on this viewport. Every other display string in the same frame and in its sibling surfaces is tracked: the HUD pod labels `BALANCE`, `WIN`, `BET` are letter-spaced, the paytable headings are letter-spaced, and the big-win tier label `BIG WIN` on `065_laptop_transition_bigwin_countup_early.png` is the same 900 weight at `letter-spacing: .18em`. The word `WIN` therefore appears twice in frame `064` at two different trackings, about 240 px apart vertically. At 900 weight with zero tracking the squared capitals close up and lose the open rhythm that tracking gives every other display string, which is why the overlay reads as a different typeface at a glance even though it is not one.
  Stated explicitly so the marshal does not re-derive it: this is NOT a font-family leak. `frontend/src/lib/components/WinCelebration.svelte:55` sets `font-family: var(--fs-font-display)` and `frontend/src/main.ts:2-4` self-hosts Orbitron 400, 700 and 900, so no weight can fall through to `system-ui`. The family hypothesis was raised from the frame and refuted at source.
- Where fixable: `frontend/src/lib/components/WinCelebration.svelte:40-64` (`.small-win-flash`), against `frontend/src/lib/components/WinBanner.svelte:393` (`.c1-tier-label { ... font-weight: 900; letter-spacing: .18em; ... }`) as the reference. Not locked.
- Proposed fix: add `letter-spacing: .18em` to `.small-win-flash` to match `.c1-tier-label`, and re-check the horizontal centring afterwards since tracking adds a trailing space to the advance width.

## STT-LAPTOP-A-06 MEDIUM The win ticker writes the match length as `x4` while the paytable writes the same quantity as `3×`

- Frames: `reports/screens/stream-test-2026-07-28/066_laptop_transition_bigwin_countup_late.png` (`L3  x4  1 ways  $0.20`), `reports/screens/stream-test-2026-07-28/067_laptop_bigwin_settled.png` (`M3  x5  8 ways  $16.00`), and persisting behind `069_laptop_hud_menu.png` and `070_laptop_session_panel.png`; against `reports/screens/stream-test-2026-07-28/073_laptop_paytable_01_match_symbols_on_adjacent_reels_st.png` and `075_laptop_paytable_03_symbol_payouts.png` (`3×`, `4×`, `5×`)
- Claim: the number of matching reels is written `x4` and `x5` on the ticker, with a full-height baseline ASCII letter `x` placed BEFORE the count, and written `3×`, `4×`, `5×` on all ten symbol cards, with the small raised multiplication sign placed AFTER the count. Same quantity, reversed operand order, different glyph, on two surfaces the player sees within one spin of each other. The ticker form also disagrees with the win banner's `16x BET`, which is at least suffix form.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:93`, `<span class="wb-count">x{current.kind}</span>`. Not locked. The paytable side is already correct.
- Proposed fix: change line 93 to `<span class="wb-count">{current.kind}×</span>`, matching the paytable's order and glyph.

## STT-LAPTOP-A-07 MEDIUM Engine tier codes are shown to players as symbol names, on the paytable and on the live win ticker

- Frames: `reports/screens/stream-test-2026-07-28/074_laptop_paytable_02_ways_to_win.png`, `reports/screens/stream-test-2026-07-28/075_laptop_paytable_03_symbol_payouts.png`, `reports/screens/stream-test-2026-07-28/073_laptop_paytable_01_match_symbols_on_adjacent_reels_st.png`, `reports/screens/stream-test-2026-07-28/066_laptop_transition_bigwin_countup_late.png`, `reports/screens/stream-test-2026-07-28/067_laptop_bigwin_settled.png`
- Claim: the ten symbol cards are titled `WILD`, `SCAT`, `H1`, `H2`, `M1`, `M2`, `M3`, `L1`, `L2`, `L3`. Eight of the ten are the maths package's high/mid/low tier codes rather than names of the artwork sitting directly above them (a wheel, a nitro can, a gauge, a coil, a headlight, a hex nut, a capacitor, a piston). The same codes reach the live win ticker as `L3` and `M3`. A viewer reading the paytable on stream sees a table of internal identifiers beside finished art. Raised from the typography lens because it is what these frames show; the disposition is a copy and art call.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:73-82` (the `SYMBOLS` array literal), and `frontend/src/lib/components/WinBreakdown.svelte:19` (`symbolLabel`, which maps only `symbolWild` and `symbolScatter` and passes every other raw code straight through). Not locked.
- Proposed fix: PARK(naming eight symbols is an owner decision, not a mechanical edit). The wiring is small once the names exist: `symbolLabel` gains eight keys and the `SYMBOLS` array reads them.

## STT-LAPTOP-A-08 MEDIUM The `BET` pod right-aligns its label and value while the sibling `BALANCE` and `WIN` pods centre theirs

- Frames: `reports/screens/stream-test-2026-07-28/058_laptop_base_idle.png`, and identically on `057_laptop_transition_rules_to_base.png`, `061_laptop_dead_spin_1_settled.png`, `062_laptop_dead_spin_2_settled.png`, `063_laptop_dead_spin_3_settled.png`, `064_laptop_win_presentation.png`, `065_laptop_transition_bigwin_countup_early.png`, `066_laptop_transition_bigwin_countup_late.png`, `067_laptop_bigwin_settled.png`
- Claim: the three readout pods are one component with the same chamfer, outline and coloured accent rail. `BALANCE` / `$50,000.00` are centred in their pod and `WIN` / `$0.00` are centred in theirs. `BET` / `$1.00` are pushed to the right edge: on frame `058` the pod spans about x 665 to x 760, pod centre about x 712, and the `$1.00` run is centred at about x 728, roughly 16 px right of centre on a pod about 95 px wide, leaving the left third of the pod empty while the other two pods have balanced margins. Present in every base-game frame in this shard.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1343`, `.fs-bet .fs-label,.fs-bet .fs-value{text-align:right;width:100%;}`, a bet-only override of the shared centred rule. Not locked.
- Proposed fix: check first whether the override exists to clear the cost-visibility mode badge documented in the comment immediately below it at `HudOverlay.svelte:1345-1346`. If the badge is the reason, reserve the space only while a badge is mounted; if not, delete line 1343 so all three pods centre.

## STT-LAPTOP-A-09 MEDIUM Sentence case leaks into an all-caps interface at the intro button and the session dialog title

- Frames: `reports/screens/stream-test-2026-07-28/056_laptop_intro_rules.png` (`Continue`), `reports/screens/stream-test-2026-07-28/070_laptop_session_panel.png` (`Session information`), against `054_laptop_splash.png` (`TAP TO CONTINUE`), `072_laptop_paytable_top.png` (`PAYTABLE`), `058_laptop_base_idle.png` (`MAX`, `SPIN`, `FEATURES`) and `076_laptop_paytable_04_rules.png` (`BUY FEATURE`)
- Claim: every actionable label and every panel title in the game chrome is all caps and letter-spaced: `TAP TO CONTINUE`, `MAX`, `SPIN`, `FEATURES`, `PAYTABLE`, `BUY FEATURE`, `RULES`, `WAYS TO WIN`, `SYMBOL PAYOUTS`, `BET MODES`, `INTERFACE GUIDE`, `OVERDRIVE FREE SPINS`. Two exceptions sit on high-traffic surfaces: the only button on the gated intro card reads `Continue` in title case with no tracking, and the session dialog title reads `Session information` in sentence case while the intro card's own title on the same viewport is `OVERDRIVE FREE SPINS` in tracked caps. The word CONTINUE therefore appears in two casings on two consecutive surfaces: `TAP TO CONTINUE` on the splash, `Continue` on the card the splash leads to.
- Where fixable: `frontend/src/lib/i18n/translations.ts:1556` (`introContinue: 'Continue'`), `frontend/src/lib/i18n/translations.ts:246` (`rgSessionTitle: 'Session information'`), against `frontend/src/lib/i18n/translations.ts:1557` (`splashPressAnywhere: 'TAP TO CONTINUE'`) and `:271` (`paytable: 'PAYTABLE'`). Not locked.
- Proposed fix: apply the chrome casing to both, ideally by `text-transform: uppercase` on the button and dialog-title classes rather than by editing sixteen locales' literals, since several locales have no case distinction.

## STT-LAPTOP-A-10 MEDIUM The win ticker prints `1 ways`

- Frames: `reports/screens/stream-test-2026-07-28/066_laptop_transition_bigwin_countup_late.png`, persisting behind `068_laptop_transition_menu_opening.png` and `069_laptop_hud_menu.png`
- Claim: the ticker reads `L3  x4  1 ways  $0.20`. The count is `1` and the noun is pluralised. The sibling row on `067_laptop_bigwin_settled.png` reads `M3  x5  8 ways  $16.00`, so the string concatenates the count with a fixed `ways` and never singularises. A single-way win is the commonest win shape in a 1,024-ways game, so this is on screen often.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:94`, `<span class="wb-ways">{current.ways} ways</span>`. Not locked.
- Proposed fix: `{current.ways} {current.ways === 1 ? 'way' : 'ways'}`, noting the string is currently hardcoded English and so joins the Q-16 park class if it is localised at the same time.

## STT-LAPTOP-A-11 LOW The same sentence uses the serial comma on the paytable and omits it on the intro rules card

- Frames: `reports/screens/stream-test-2026-07-28/076_laptop_paytable_04_rules.png` against `reports/screens/stream-test-2026-07-28/056_laptop_intro_rules.png`
- Claim: the paytable writes `3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.` The intro rules card writes the same rule as `3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1×, 3× or 10× total bet.` Four serial commas present on one surface and four absent on the other, in the same enumeration of the same three quantities. Australian English convention omits it; the two surfaces disagree either way.
- Where fixable: `frontend/src/lib/i18n/prose.ts:112` and its social twin `:195` carry the serial commas; `frontend/src/lib/i18n/translations.ts:1540` carries the version without. Not locked.
- Proposed fix: drop the two serial commas at `prose.ts:112` and `:195` to match the rules card and the rest of the English prose.

## STT-LAPTOP-A-12 LOW The same purchase is called `Bonus Buy`, `BUY FEATURE` and `Buy Overdrive`

- Frames: `reports/screens/stream-test-2026-07-28/076_laptop_paytable_04_rules.png` (the first two, about 40 px apart), `reports/screens/stream-test-2026-07-28/077_laptop_paytable_05_overdrive_free_spins.png`, `reports/screens/stream-test-2026-07-28/078_laptop_paytable_06_bet_modes.png` (the third), `reports/screens/stream-test-2026-07-28/056_laptop_intro_rules.png` (`Bonus Buy` again)
- Claim: on frame `076` the bullet `Bonus Buy: pay 100× your bet to start the feature immediately.` sits directly above a row labelled `BUY FEATURE` priced `$100.00`, which is the same product at the same price, and the bet-mode card for it two sections later is titled `Buy Overdrive`. Three names, two casings, one purchase, all reachable within one scroll of the paytable.
- Where fixable: `frontend/src/lib/i18n/translations.ts:1554` and `:1555` (`Bonus Buy`), `frontend/src/lib/i18n/translations.ts:1536` (`buyFeature: 'BUY FEATURE'`), `frontend/src/lib/i18n/prose.ts:91` (`modeBonusLabel: 'Buy Overdrive'`). Not locked.
- Proposed fix: settle one product name and apply it to the prose, the row label and the mode card. Note `translations.ts:1536` also holds `buyConfirmTitle: 'BUY OVERDRIVE FREE SPINS'`, a fourth phrasing, so the sweep should include it.

## STT-LAPTOP-A-13 LOW The splash instructs `TAP TO CONTINUE` on a 1024x576 pointer session

- Frames: `reports/screens/stream-test-2026-07-28/053_laptop_transition_splash_entrance.png`, `reports/screens/stream-test-2026-07-28/054_laptop_splash.png`
- Claim: the only instruction on the first surface a viewer sees reads `TAP TO CONTINUE`, unconditionally, on the `Laptop` session whose viewport is `1024x576` per `reports/screens/stream-test-2026-07-28/MANIFEST.json`. A touch verb on a desktop-class viewport driven by a pointer. Recorded as adjacent to this lens rather than central to it: the defect is the word, not its setting.
- Where fixable: `frontend/src/lib/i18n/translations.ts:1557` (`splashPressAnywhere: 'TAP TO CONTINUE'`) and `:1548` (`featureContinue: 'TAP TO CONTINUE'`), across sixteen locales. Not locked.
- Proposed fix: PARK(an input-aware verb touches sixteen locales and two keys). A single neutral string such as `PRESS TO CONTINUE` would close it without a per-input branch, but it is still a sixteen-locale copy change.

## Explicit absences, signed

Each of the following was looked for across all 26 frames and is claimed absent, with what was checked to be able to say it.

- **Nothing in this shard is rated STREAM.** The one STREAM-grade defect present in my frames is MID-01, which is already on the ledger and is recorded below as a KNOWN match rather than as a new finding. Every new finding above is HIGH or lower, deliberately, and the two candidates I considered promoting (the `WIN!` overlay and the orphaned paytable bullets) are held at MEDIUM and HIGH respectively because neither is on screen during the reel-watching majority of a stream.
- **No money-pod fit failure, so this shard carries no fresh TR-115 / TR-086 evidence.** The `BALANCE`, `WIN` and `BET` pods were inspected at 5x magnification on `058`, `061` through `067` and `070`. The widest value reached is `$50,000.00`, which sits inside its pod with margin on both sides; `$16.20`, `$15.96` and `$1.00` likewise. Nothing clipped, ellipsised or overflowed. The paytable price `$100.00`, the mode costs `$1.00`, `$1.25`, `$100.00` and `$400.00`, and the session panel figures `$5.00`, `$20.10` and `+$15.10` all fit their containers. This is a negative observation at these magnitudes only: this shard never saw a five-figure win, so it neither confirms nor refutes TR-115 at large magnitudes.
- **No clipped, ellipsised or overflowing NON-money string in any settled frame.** The longest strings were checked individually at magnification: `Symbol values shown are per matching way; the total is that value times the number of ways times your bet.` (075, 076), `The Overdrive meter starts at 1× and rises +1× after every winning free spin, multiplying all later wins. It never resets during the feature.` (056, 076, 077), `The scatter build runs shorter on a retrigger than on the entry, because the feature is already secured.` (076, 077), all four bet-mode blurbs (078), `Substitutes for all symbols except SCATTER` (073, 075), `Reels 1, 2 and 3 hold the same symbol (highlighted), which is a match read left to right from reel 1. Reels 4 and 5 are not required.` (072, 073). All wrap and none truncates. The apparent cut of the WILD card body on `071` and `072` is the paytable's own scroll boundary during the opening transition, and the same card renders complete on `073` and `075`, so it is not a finding.
- **No mixed straight and curly quotation marks, and no apostrophes at all.** No frame in this range renders a quotation mark or an apostrophe: the English prose on these surfaces is written without possessives or contractions throughout, checked line by line on 056, 070, 072, 073, 075, 076, 077 and 078. There is therefore no straight-versus-curly conflict to report on these frames.
- **No em dash and no en dash in player-visible prose.** Every dash rendered in these 26 frames is a hyphen inside a compound: `Double-chance` and `pre-revved` on 078, and nothing else. Checked at 3x or greater magnification on 056, 072, 073, 075, 076, 077 and 078.
- **No double space detected.** The wide gaps in the win ticker (`L3`, `x4`, `1 ways`, `$0.20` on 066 and 067) are gaps between separately laid-out spans, not repeated space characters: the four gaps in one row are of visibly different widths, which a doubled space could not produce, and the source at `WinBreakdown.svelte:91-95` confirms four sibling spans under a flex `gap: 10px`. No doubled space found in any prose block.
- **No tofu, no fallback box and no missing glyph.** Every character rendered in these frames draws, including `×`, `›`, `+`, `%`, `$`, `:` and the slashed `0`. KNOWN_OPEN Q-07's allowlisted infinity glyph does not appear in this range: the autoplay panel is frame `083`, outside it.
- **No font-family leak.** Raised as a hypothesis from frame `064` and refuted at source: `WinCelebration.svelte:55` sets the display token explicitly, `app.css:97-98` defines exactly the two permitted stacks, and `main.ts:2-4` self-hosts Orbitron 400, 700 and 900, so no weight used on these surfaces can fall through to `system-ui`. Recorded so no downstream squad re-raises it from the same frame.
- **No numeral shimmy claim can be made about the balance readout, because the balance never changed.** `BALANCE` reads `$50,000.00` identically on 057, 058, 061, 062, 063, 064, 065, 066, 067, 068, 069 and 070, across three settled dead spins and a settled big win. There is no pair of frames in this shard in which a non-count-up numeric surface changes value, so the "does any other numeric surface shimmy" question is UNTESTED here rather than answered in the negative. The per-digit count-up boxes on 065 and 066 are TR-089's fixed mechanism and are correctly not reported as shimmy.
- **No letter-spacing or weight difference between two instances of one component**, beyond the casing findings above and STT-LAPTOP-A-05. The three HUD pod labels share tracking and weight; the six paytable section headings `WAYS TO WIN`, `SYMBOL PAYOUTS`, `RULES`, `OVERDRIVE FREE SPINS`, `BET MODES`, `INTERFACE GUIDE` share size, colour, weight and tracking; the five bet-mode cards share their `COST` / `RTP` / `MAX WIN` sub-label treatment exactly; the ten symbol cards share their `3×` / `4×` / `5×` row treatment exactly.
- **No decimal or currency format disagreement, after checking the case that looked like one.** The symbol payout column mixes `22`, `10`, `6`, `5`, `4`, `3`, `2`, `1.5`, `0.8`, `0.65`, `0.45`, `0.3`, `0.25`, `0.2`, `0.15`, `0.1`, `0.08`. This is one consistent rule, trailing zeros stripped, applied to all 24 values on frames 074 and 075, so it is not a disagreement. Currency is `$` prefix, exactly two decimals, thousands comma, everywhere it appears (`$50,000.00`, `$16.20`, `$16.00`, `$3.90`, `$0.20`, `$0.00`, `$1.00`, `$1.25`, `$100.00`, `$400.00`, `$5.00`, `$20.10`, `+$15.10`). Percentages are `96.35%` on all five mode cards and in the prose. The cap is `5,000×` on all five cards and in both prose statements. The clock is `00:00:22`.
- **No RTL or locale defect**, because this session is `lang: en` per `MANIFEST.json` and no localised surface appears in the range.

## KNOWN matches

- KNOWN(MID-01): `reports/screens/stream-test-2026-07-28/065_laptop_transition_bigwin_countup_early.png`, the banner count-up reads `$10.29` while the HUD `WIN` pod already reads `$15.96`, on a win that settles at `$16.20` on `067_laptop_bigwin_settled.png` (where both agree). The laptop instance the ledger predicted at `065`/`067`, confirmed on frame.
- KNOWN(MID-02): `reports/screens/stream-test-2026-07-28/065_laptop_transition_bigwin_countup_early.png`, `066_laptop_transition_bigwin_countup_late.png`, `067_laptop_bigwin_settled.png`, all rendering `16x BET` with a full-height baseline ASCII `x` against an all-caps `BET`, while the paytable on `076` renders the same class of quantity as `1×`, `3×`, `10×` with the raised multiplication sign.
- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/078_laptop_paytable_06_bet_modes.png` and `077_laptop_paytable_05_overdrive_free_spins.png`. This is the frame evidence the row says decides whether it is fixed, and it is worse on frame than on paper: the OVERBOOST card carries `Double-chance: about 1.6x the feature trigger rate. Debits 1.25x every spin while ON.` in its blurb while its own `COST` cell about 55 px above reads `1.25×`, so the letter and the sign sit inside one card on the same figure `1.25`. The NITRO OVERDRIVE card does the same, blurb `pre-revved to 5x.` against `400×` and `5,000×` in its own stat row.
  **A correction for the marshal, offered rather than assumed.** Q-26 locates these instances in `fsModes.ts`. At HEAD `d9bdf22` they are not there: `frontend/src/lib/config/fsModes.ts:71-115` holds only `labelKey` and `blurbKey` references, and the literals are at `frontend/src/lib/i18n/prose.ts:90` (`1.6x`, `1.25x`) and `:94` (`5x`), with social twins at `:189` and `:192`. The blurbs moved to the i18n layer and the row was not updated, which is the same shape of stale enumeration MID-02 records against Q-26 from the other direction.
- KNOWN(Q-27): `reports/screens/stream-test-2026-07-28/075_laptop_paytable_03_symbol_payouts.png`, `076_laptop_paytable_04_rules.png`, `077_laptop_paytable_05_overdrive_free_spins.png`. Q-27 says the Vite scaffold remnants in `app.css` are visible only if an unstyled surface reaches a frame. The scaffold `text-align: center` at `frontend/src/app.css:143` reaches three frames here and is the root cause of STT-LAPTOP-A-02. Q-27 is no longer hypothetical.
- KNOWN(Q-16 park): the parked hardcoded-English strings VISIBLE on frames in this shard are `Session` and `Mute` (`069_laptop_hud_menu.png`, `068_laptop_transition_menu_opening.png`) and the paytable section headers `SYMBOL PAYOUTS`, `RULES` and `INTERFACE GUIDE` (`072`, `075`, `076`, `078`). Recorded because Q-16 asks which parked strings actually reach a frame; this is an `en` session, so it changes the park's urgency only via the de and ar squads.
- KNOWN(TR-089): `reports/screens/stream-test-2026-07-28/065_laptop_transition_bigwin_countup_early.png`, `066_laptop_transition_bigwin_countup_late.png`. The per-digit boxes are visible and holding. Recorded as observed, not as a finding.

tree_after: `git status --porcelain` at the end of this run, verbatim. Every line is `??` (untracked). Nothing is MODIFIED and nothing is DELETED. `STT-LAPTOP-A.md` is this squad's own shard; the other 33 are other squads' shards, not this squad's to touch.

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
?? reports/qa/stream_test/shards/STT-STRETCH-A.md
?? reports/qa/stream_test/shards/STV-REST.md
```
