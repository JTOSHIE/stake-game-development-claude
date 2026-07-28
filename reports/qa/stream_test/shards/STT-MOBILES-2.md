# STT-MOBILES-2, TYPOGRAPHY (mobile-s, frames 330 to 346, 1600px upscaled)
supersedes: STT-MOBILES-A.md and STT-MOBILES-B.md (partial: this squad holds frames 330 to 346, which is the tail of A's 312 to 337 and the head of B's 338 to 363)
scope: `mobile-s` frames 330 to 346 inclusive, 17 frames, read from `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`. Native viewport 320x568, lang `en`.
frames_read: 17

Order of work followed as briefed: all 17 frames opened once each, shard written complete, then source located. Every `file:line` below was read with `grep -n` or a short `sed -n` range after the frame pass, never before. No project script was run and nothing under `reports/screens/` was written.

## STT-MOBILES-2-01 HIGH The word "scatter" is written six different ways inside one paytable

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/333_mobile-s_paytable_02_ways_to_win.png`, `.../334_mobile-s_paytable_03_symbol_payouts.png`, `.../335_mobile-s_paytable_04_rules.png`, `.../336_mobile-s_paytable_05_overdrive_free_spins.png`, `.../337_mobile-s_paytable_06_bet_modes.png`, `.../346_mobile-s_dialog_buy_overdrive.png`
- Claim: one entity, six renderings, all reachable in one scroll plus one tap.
  1. `SCAT` (symbol card title, frames 333 and 334), `frontend/src/lib/components/PaytableModal.svelte:74`, `{ name: 'SCAT', file: 'scatter', pays: [null, null, null, null, null] }`
  2. `SCATTER` (`Substitutes for all symbols except SCATTER`, frames 333 and 334), `frontend/src/lib/i18n/prose.ts:100`
  3. `SCATTERs` (`3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.`, frame 335), `frontend/src/lib/i18n/prose.ts:112`
  4. `SCATTERS` (table column header, frames 335 and 336)
  5. `Scatters` (`3 or more Scatters during free spins award +5 free spins.`, frame 336; and `3, 4 or 5 Scatters award 8, 12 or 16 free spins`, frame 346)
  6. `scatters` (`Standard play. Overdrive Free Spins trigger on 3+ scatters.`, frame 337), `frontend/src/lib/i18n/prose.ts:86`
  Items 3 and 4 sit about 400 upscaled pixels apart on frame 335, so the caps drift is visible without scrolling. `SCATTERs`, a lowercase plural welded onto an all-caps word, is the machine tell the standing mandate names.
  A display-name key already exists and is unused by the card: `symbolScatter: 'SCATTER'` at `frontend/src/lib/i18n/translations.ts:279`, present in every locale block.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:74`, `frontend/src/lib/i18n/prose.ts:86,100,112` and the social duplicates from `:189`
- Proposed fix: render the card title from the existing `symbolScatter` key rather than the hardcoded `'SCAT'`, and sweep the prose to one plural form. PARK(the sixteen-locale half: `prose.ts` values exist per locale, so once the sweep leaves English it stops being small).

## STT-MOBILES-2-02 HIGH Raw internal symbol codes are the player-visible symbol names

- Frames: `.../333_mobile-s_paytable_02_ways_to_win.png`, `.../334_mobile-s_paytable_03_symbol_payouts.png`
- Claim: the symbol payout cards title their symbols `SCAT`, `H1` and `H2`, beside a first card correctly titled `WILD`. `SCAT` is not a truncation: the card is wide enough for `SCATTER`, since `SCAT` occupies about 130 of the card's roughly 340 upscaled pixels of inner width and the glyphs terminate cleanly. `H1` and `H2` are the maths package's internal identifiers, presented to the player as the names of a wheel and a nitrous bottle. Source confirms they are authored literals, not derived labels: `frontend/src/lib/components/PaytableModal.svelte:74-76` reads `{ name: 'SCAT', ... }`, `{ name: 'H1', ... }`, `{ name: 'H2', ... }`, and the surface renders `sym.name` directly.
  Scope note, stated rather than assumed: `PaytableModal.svelte:74-76` are the first three of a list, so the remaining symbols below the fold carry the same shape and this is a class, not three instances.
- Resolution note: NEW AT 1600PX (at 242 image tokens the card titles were two or three unresolvable glyphs)
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:74-76` and the rest of that list
- Proposed fix: add a display-name field to each entry and render that. The maths package is LOCKED, so the map belongs in the frontend, and for the scatter the key already exists at `frontend/src/lib/i18n/translations.ts:279`.

## STT-MOBILES-2-03 STREAM The win detail strip under the reels renders at roughly four device pixels

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/341_mobile-s_transition_paytable_closing.png`
- Claim: the strip below the reel window carries four tokens, a symbol code, a multiplier, a ways count and a money amount. Measured on the upscale its cap height is about 11px against a frame height of 1600px. The frame is a 2.817x resample of a 320x568 capture, so the shipped cap height is about 3.9px. For comparison the `BET` label in the same frame measures about 28px on the upscale, about 10px shipped. The strip is therefore about one third the size of the smallest other label in the interface and is not readable on a phone, nor on a stream where the phone view is one panel of a layout. It carries the whole explanation of why the player was just paid.
  **The illegibility is demonstrated rather than asserted.** The superseded native shard `STT-MOBILES-B-08` transcribes this same frame's symbol token as `M3`; reading the same strip at 1600px this squad transcribes it as `H2`. Two independent readers of one string disagree on both characters. Neither reading is signed here, and the disagreement is the evidence.
  The mechanism is a scale, not a font size, per `STT-MOBILES-A-05`: the plate declares `font-size: 0.7rem` and `0.62rem` (`frontend/src/lib/components/WinBreakdown.svelte:136,146`), both reasonable, but the component sits inside the inline-scaled `1280px` stage at `frontend/src/App.svelte:2347-2354`, where a 320px viewport gives a scale of about 0.25.
- Resolution note: NEW AT 1600PX (at native the strip was an undifferentiated smear; what is new is being able to measure it and to show two readers disagreeing on its content)
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:136,146` and `frontend/src/App.svelte:2347-2354`
- Proposed fix: PARK(moving the strip out of the scaled stage, as the HUD region already was, is a layout change and not a small one). The cheap interim is inverse-scaled units with a legible floor, for example `calc(0.7rem / var(--S, 1))` capped.

## STT-MOBILES-2-04 HIGH Body prose is sliced horizontally through the middle of its glyphs at every scroll boundary

- Frames: `.../331_mobile-s_paytable_top.png`, `.../338_mobile-s_paytable_07_interface_guide.png`, `.../339_mobile-s_paytable_08_responsible_play.png`, `.../340_mobile-s_paytable_09_disclaimer.png`, `.../345_mobile-s_transition_dialog_buy_overdrive_opening.png`, `.../346_mobile-s_dialog_buy_overdrive.png`
- Claim: five instances in one frame range, no fade, no mask, no scroll affordance.
  - Frame 340, the worst: `loss limit you choose is reached, and can` is cut horizontally at about its x-height by the sticky `PAYTABLE` header rule, so the top halves of the letters are painted and the bottoms are not.
  - Frames 345 and 346: `free spins, multiplying all later wins.` is cut at about mid x-height by the sticky `PRICE / RTP / MAX WIN` strip, on a purchase confirmation dialog.
  - Frame 338: the row title `Autoplay` loses its `y` descender to the panel edge and reads `Autoplau`.
  - Frame 339: `shown in the web browser. Future` is cut mid-glyph at the panel edge.
  - Frame 331: `required.` is cut mid-glyph at the panel edge.
  Source confirms there is no mask on either scroll region: `frontend/src/lib/components/PaytableModal.svelte:593-594` is `.fs-pt-body { overflow-y: auto; ... }` and `frontend/src/lib/components/BuyBonus.svelte:174` is `width: min(94vw, 460px); max-height: 90dvh; overflow-y: auto;`. `grep -n "mask-image" lib/components/BuyBonus.svelte` returns nothing.
- Resolution note: NEW AT 1600PX (a half-height glyph and a small glyph are the same blur at 242 image tokens)
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:593-594` and `frontend/src/lib/components/BuyBonus.svelte:174`. This fills the half the superseded shard left UNKNOWN.
- Proposed fix: a `mask-image` linear-gradient fade of about 16px at the top and bottom of both scroll regions, and an opaque background on the sticky header and the sticky footer so content cannot pass under a transparent bar.

## STT-MOBILES-2-05 MEDIUM Decimal places disagree inside one paytable column

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/334_mobile-s_paytable_03_symbol_payouts.png`
- Claim: the `H1` card reads `3× 1.5`, `4× 6`, `5× 22` and the `H2` card beside it reads `3× 0.8`, `4× 3`, `5× 10`. Within a single three-row column the values carry one decimal place and then none. Source confirms the figures are printed unformatted: `frontend/src/lib/components/PaytableModal.svelte:233-235` renders `<span class="fs-pay-val fs-num">{sym.pays[2] ?? '-'}</span>` and siblings, straight from the number literals at `:75-76`, so the column shows whatever JavaScript's default number stringification gives.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:75-76` and the rest of that list (data), `:233-235` (render site), `:663` (`.fs-pay-val`)
- Proposed fix: one formatter at the render site, applied to every card so no two can disagree.

## STT-MOBILES-2-06 HIGH The serial comma is present on one surface and absent on another for the same sentence

- Frames: `.../335_mobile-s_paytable_04_rules.png` against `.../345_mobile-s_transition_dialog_buy_overdrive_opening.png` and `.../346_mobile-s_dialog_buy_overdrive.png`
- Claim: two statements of one rule, punctuated to two house styles, one tap apart.
  - Frame 335: `3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.` (`frontend/src/lib/i18n/prose.ts:112`)
  - Frame 346: `3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1×, 3× or 10× total bet.`
  Four list commas differ across the pair. Frame 331's own caption also uses the non-serial form, `Reels 1, 2 and 3 hold the same symbol`, and the project's standard is Australian English, which takes the non-serial form. The paytable rules bullet is the single outlier.
- Resolution note: NEW AT 1600PX (comma presence is not resolvable at 242 image tokens)
- Where fixable: `frontend/src/lib/i18n/prose.ts:112` and the social duplicate `:195`
- Proposed fix: drop the two serial commas in each of those two lines, in the same edit as finding 01's `SCATTERs`.

## STT-MOBILES-2-07 HIGH The malfunction compliance line is worded two different ways in one modal, and the two branches disagree in opposite directions

- Frames: `.../335_mobile-s_paytable_04_rules.png`, `.../339_mobile-s_paytable_08_responsible_play.png`, `.../340_mobile-s_paytable_09_disclaimer.png`
- Claim: the paytable states the malfunction rule twice, in two forms, about three screens apart in one scroll.
  - Rules bullet, frame 335: `Malfunctions void all pays and plays.` (`frontend/src/lib/i18n/prose.ts:114`)
  - Disclaimer paragraph, frames 339 and 340: `Malfunction voids all wins and plays.` (`frontend/src/lib/i18n/prose.ts:118`)
  Plural subject against singular, and `pays` against `wins`. These are not synonyms in this game: the paytable's own rule two distinguishes a per-way symbol value from the total. A compliance sentence appearing twice in one document in two forms is what a jurisdiction reviewer photographs.
  **Found while locating the fix, and recorded because it is worse, though it is NOT frame-evidenced by this en session.** The social branch inverts the pair rather than fixing it: `prose.ts:197` is `Malfunctions void all wins and plays.` and `prose.ts:211` opens `Malfunction voids all prizes and plays.` So the social branch, whose whole purpose is to keep money words off the surface, keeps `wins` in the rules bullet while substituting `prizes` in the disclaimer beside it. That is a social-conformance question, not a typography one, and it is handed over rather than claimed.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/i18n/prose.ts:114` and `:118`, with `:197` and `:211` for the social branch
- Proposed fix: one string used twice, or the rule stated once. Escalate per CLAUDE.md convention (l.8): disclosure wording is the owner's to pick, not the builder's.

## STT-MOBILES-2-08 MEDIUM Body copy alternates between centred and left aligned inside one modal, including thirteen lines of centred legal prose

- Frames: `.../331`, `.../332`, `.../335`, `.../336`, `.../338`, `.../339`, `.../340`, `.../343`, `.../344`, `.../346`
- Claim: the paytable's own sections do not agree on alignment. The intro copy is centred (331). The `RULES` and `OVERDRIVE FREE SPINS` bullets are centred (335, 336). The `INTERFACE GUIDE` rows are left aligned (338). `RESPONSIBLE PLAY` and `DISCLAIMER`, the two longest prose blocks in the game at eight and thirteen lines, are centred (339, 340). The features menu blurbs are left aligned (343, 344). The buy dialog centres its question and left aligns its body (346). Centred setting on a thirteen-line legal paragraph is the most visible instance: every line has a different left edge, so there is no reading axis at all.
  The cause is inherited, not authored. `.fs-rules` and `.fs-rules li` (`frontend/src/lib/components/PaytableModal.svelte:667-668`) declare no `text-align`, so they inherit `#app { ... text-align: center; }` at `frontend/src/app.css:139-143`, which is stock Vite scaffold CSS. The two sections that escape do so because they opt out explicitly: `.fs-guide-text` sets `text-align: left` at `:778`, and `.fs-caption` sets `text-align: center` at `:647`. So the modal contains one explicit left, one explicit centre, and a majority that never chose.
- Resolution note: NEW AT 1600PX (alignment of a ragged block is not judgeable at thumbnail scale, where every short line looks centred)
- Where fixable: `frontend/src/app.css:143` (the scaffold declaration, which is charter row **Q-27** reaching a player-visible frame), or locally at `frontend/src/lib/components/PaytableModal.svelte:667`
- Proposed fix: `text-align: left` on `.fs-rules` and on the prose blocks is the safe immediate fix. Removing `text-align: center` from `app.css:143` is the real fix and closes half of Q-27, but it changes every surface silently relying on it: PARK(the `app.css` half, pending a full-surface re-capture).

## STT-MOBILES-2-09 MEDIUM Bullet markers hang detached from centred list text, at a different distance per item

- Frames: `.../335_mobile-s_paytable_04_rules.png`, `.../336_mobile-s_paytable_05_overdrive_free_spins.png`
- Claim: `frontend/src/lib/components/PaytableModal.svelte:668-669` sets `.fs-rules li { padding-left: 16px; position: relative; }` with `.fs-rules li::before { content: '›'; position: absolute; left: 0; }`, so the marker is pinned at the item's left edge while the text is centred by the inherited rule in finding 08. The measured consequence: on frame 335 the first bullet's text starts at about x=133 on the upscale and the second bullet's at about x=160, a 27px difference between two adjacent markers in one list; on frame 336 the range is about x=133 to x=153. The markers read as loose punctuation rather than as a list, and no item's continuation lines hang to its marker.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:667-669`
- Proposed fix: left align the item text so the hanging marker works as designed. This is the same one-property fix as finding 08 and they should be done together.

## STT-MOBILES-2-10 MEDIUM Two numeral treatments in one view: the autoplay counts fall back to the body face while the money pods behind them use the numeric face

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/342_mobile-s_autoplay_menu.png`
- Claim: on this one frame the autoplay spin counts `10`, `25`, `50` and `100` render with a plain unslashed zero, while the balance pod visible beside the open panel renders `$50,00` with the slashed zero of the numeric face and the bet pod behind it renders `$1.00` the same way. Every other numeric surface across these 17 frames uses the slashed zero: `1,024` (331), `0.8` and `10` (334), `5,000×` and `$1.00` (337), `2026` (340), `$50,000.00` and `$16.20` (341), `$100.00` (346).
  **Source confirms the mechanism.** `.auto-menu-item` at `frontend/src/lib/components/HudOverlay.svelte:1785-1797` declares `font-size: 1rem` and no `font-family` at all, so the option list inherits the ambient face. Every other numeric surface in the same component sets it explicitly: `frontend/src/lib/components/HudOverlay.svelte:1080`, `:1327`, `:1332`, `:1354`, `:1417`, `:1510` and `:1542` all read `font-family: var(--fs-font-numeric)`. The autoplay option list is the one numeric surface in the component that never asked for the numeric face.
  The same missing declaration is the mechanism behind KNOWN_OPEN **Q-07**, the allowlisted `∞` fallback, whose button is `.auto-menu-item` at `:518`, `:754` and `:960`. Q-07 stays allowlisted; the point here is that the fallback is not confined to the one glyph that was reviewed and kept, it is on every digit in that menu.
- Resolution note: NEW AT 1600PX (a zero slash is about one shipped pixel; it does not exist at 242 image tokens)
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1785`
- Proposed fix: add `font-family: var(--fs-font-numeric);` to `.auto-menu-item`. Check the `∞` after doing so, since Q-07's allowlisted fallback is a consequence of this same omission and the ruling was made on the current rendering.

## STT-MOBILES-2-11 MEDIUM The words "bet" and "features" change case between surfaces that name each other

- Frames: `.../338_mobile-s_paytable_07_interface_guide.png`, `.../341_mobile-s_transition_paytable_closing.png`, `.../343_mobile-s_transition_features_menu_opening.png`, `.../344_mobile-s_features_menu.png`
- Claim: two halves, one new.
  - The interface guide exists to name the controls and does not match them. Frame 338 titles the row `Features` and its own body six words later says `Open the FEATURES menu to pick a bet mode or buy the feature.`, and the button it describes reads `FEATURES` (frame 341). Source: `frontend/src/lib/i18n/prose.ts:128` and `:129`, adjacent literals.
  - **New in this range:** frames 343 and 344 carry `BET` (top row label), `bet` (`1× bet` on both mode cards) and `BET MODES` (footer button) inside one panel, three casings of one word within about 800 upscaled pixels of vertical space.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/i18n/prose.ts:128,129` for the guide half, with `:122` and `:130` for the sibling control names and `:204` for the social variant. The features panel half is `frontend/src/lib/components/FeatureMenu.svelte`, class not located: UNKNOWN to the line.
- Proposed fix: one rule for how a control is named in prose, applied to `Spin`, `Features` and `Autoplay` together; and one casing for `bet` inside the features panel.

## STT-MOBILES-2-12 MEDIUM Mode names mix Title Case and all caps inside one list

- Frames: `.../337_mobile-s_paytable_06_bet_modes.png`, `.../343`, `.../344_mobile-s_features_menu.png`, `.../346_mobile-s_dialog_buy_overdrive.png`
- Claim: the `BET MODES` list renders `Normal`, then `Cruise`, then `OVERBOOST` down one scroll (frame 337); the features menu renders `Normal` and `Cruise` in Title Case (343, 344); the buy dialog titles itself `Buy Overdrive` (346). The casing lives in the strings, not in a `text-transform`: `frontend/src/lib/i18n/prose.ts:85,87,89,91,93` hold `'Normal'`, `'Cruise'`, `'OVERBOOST'`, `'Buy Overdrive'`, `'NITRO OVERDRIVE'`, and `.fs-mode-name` at `frontend/src/lib/components/PaytableModal.svelte:700` sets `letter-spacing: 0.04em` and no `text-transform`. Three Title Case, two all caps, one component, one list.
- Resolution note: VISIBLE AT BOTH (word shape survives thumbnail scale, so the native pass could have seen this one, and did)
- Where fixable: `frontend/src/lib/i18n/prose.ts:85,87,89,91,93`, the social duplicates from `:189`, and every locale copy; or one `text-transform` on `.fs-mode-name` at `frontend/src/lib/components/PaytableModal.svelte:700`
- Proposed fix: this is adjacent to KNOWN_OPEN **Q-34** but is not it. Q-34 is one mode reading `Cruise` on three surfaces and `CRUISE` on a fourth through a `text-transform` present on one class and absent on three; this is five mode names that disagree with each other on one surface, which no `text-transform` change resolves in the string layer. PARK(the direction is a brand naming call, and it wants the same ruling as Q-34 rather than a second one).

## STT-MOBILES-2-13 MEDIUM The copyright symbol is orphaned at a line end, away from its year

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/340_mobile-s_paytable_09_disclaimer.png`
- Claim: the notice sets as `trademarks of We Roll Spinners. ©` / `2026 We Roll Spinners. All rights` / `reserved.` The mark ends one line and its year begins the next, so `©` reads as belonging to the preceding sentence, and `reserved.` is left alone on a third line. Source: `frontend/src/lib/components/PaytableModal.svelte:64` appends `' © 2026 We Roll Spinners. All rights reserved.'` with ordinary spaces throughout, so nothing binds the pair.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:64`
- Proposed fix: a non-breaking space between `©` and `2026`.

## STT-MOBILES-2-14 HIGH The ways-to-win reel diagram is clipped at both ends, losing the digits its own caption refers to

- Frames: `.../330_mobile-s_transition_paytable_opening.png`, `.../331_mobile-s_paytable_top.png`, `.../332_mobile-s_paytable_01_match_symbols_on_adjacent_reels_st.png`, `.../333_mobile-s_paytable_02_ways_to_win.png`
- Claim: the diagram is a five-chip strip `1 → 2 → 3 → 4 → 5` (`frontend/src/lib/components/PaytableModal.svelte:207`, `<div class="fs-way-cell" class:matched={i < 3}>{reelNum}</div>`). At 320px the strip is wider than the plate that holds it, so the plate's own borders cross the outer chips. Chip five keeps only the left part of its `5`. Chip one is cut so far that no legible part of its `1` survives: at 1600px the leftmost element is a bare arc of the chip outline. The caption directly beneath reads `Reels 1, 2 and 3 hold the same symbol (highlighted), which is a match read left to right from reel 1. Reels 4 and 5 are not required.`, so the prose names two reels the diagram does not show.
  The narrow-viewport rule stops one step short: `.fs-way-cell { width: 40px; height: 40px; font-size: 0.95rem; }` at `frontend/src/lib/components/PaytableModal.svelte:806` sits inside the `@media (max-width: 500px)` block, and there is no further step for 320px.
  This is a non-money string clipping, so it is a new finding rather than TR-115 / TR-086.
- Resolution note: VISIBLE AT BOTH for the overflow; NEW AT 1600PX for the severity, since the native pass reported the `1` as cut down its stem and at full resolution there is no readable digit there at all
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:806` (and the `@media (max-width: 500px)` block around `:798-809`)
- Proposed fix: add a narrower step at about `max-width: 360px` taking the cell to about 30px, or size the cells from a `clamp()` so the strip cannot exceed the plate at any width.

## STT-MOBILES-2-15 MEDIUM The scatter award string wraps onto a line that begins with a slash

- Frames: `.../333_mobile-s_paytable_02_ways_to_win.png`, `.../334_mobile-s_paytable_03_symbol_payouts.png`
- Claim: the `SCAT` card sets `3 / 4 / 5 = 1× / 3× / 10× + 8 / 12 / 16 free spins` and wraps it as `3 / 4 / 5 = 1× / 3×` / `/ 10× + 8 / 12 / 16` / `free spins`. Line two opens with a bare `/`, which reads as a typo rather than as a separator, and the `+` joining two unrelated awards sits mid-line with no visual break. The identical content is a clean three-column table two sections later on frame 336, so the game already has the better rendering of it.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:227` (the `{#if sym.name === 'SCAT'}` branch that builds this card's body). Not read line-precisely beyond the branch point.
- Proposed fix: set the card as separate labelled lines, or bind each group with non-breaking spaces so a wrap cannot land on a separator.

## STT-MOBILES-2-16 MEDIUM The mode description measure is so narrow it produces one-word lines

- Frames: `.../343_mobile-s_transition_features_menu_opening.png`, `.../344_mobile-s_features_menu.png`
- Claim: the two mode columns are about 12 characters wide at 320px. The left column sets `Standard` / `play.` / `Overdrive` / `Free Spins` / `trigger on 3+` / `scatters.`, with `play.` alone on line two; the right sets `A smoother` / `ride: more` / `frequent` / `smaller wins,` / `same` / `96.35% RTP.`, with `same` alone on line five. Six lines each for a one-sentence blurb, with a rag that changes direction three times.
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte`, mode card class not located: UNKNOWN to the line. The panel is not locked.
- Proposed fix: stack the two mode cards vertically below a threshold width so each blurb gets the full panel measure.

## STT-MOBILES-2-17 MEDIUM The MAX WIN unit breaks one word per line

- Frames: `.../345_mobile-s_transition_dialog_buy_overdrive_opening.png`, `.../346_mobile-s_dialog_buy_overdrive.png`
- Claim: the buy dialog's third stat cell sets `5,000× base bet` as `5,000×` / `base` / `bet`, three lines for three words, making the cell about three times the height of `PRICE` and `RTP` beside it, destroying the row's shared baseline and dragging the strip down over the dialog's action row. The neighbouring `$100.00` fits on one line, so this is the unit string and not the figure. A non-money string, hence a new finding rather than TR-115 / TR-086, though it shares the strip with that class.
  Source: the value comes from `frontend/src/lib/components/BuyBonus.svelte:135`, `{maxWinVsBaseBetLabel($isSocial)}`, and all three cells render at one fixed `font-size: 0.92rem` with no narrow-viewport step (`frontend/src/lib/components/BuyBonus.svelte:240`).
- Resolution note: NEW AT 1600PX
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:132,135,240`
- Proposed fix: move the unit into the label (`MAX WIN, BASE BET`) so the value is just `5,000×`, or add a narrow-viewport step on `.buy-stat-val`.

## STT-MOBILES-2-18 WITHDRAWN AT STEP 3, kept as a record rather than renumbered away

At step 2 this id read "One stat row, three values, two weights and two colours" on frames 345 and 346, claiming `$100.00` was set in a heavier weight and a shorter cap height than `96.35%` and `5,000×` beside it. **Source refutes the weight and the size half of that claim.** `frontend/src/lib/components/BuyBonus.svelte:240` sets `.buy-stat-val { color: #cfe9ff; font-weight: 700; font-size: 0.92rem; font-variant-numeric: tabular-nums; }` and `:241` sets `.buy-stat-val.gold { color: #ffd54a; text-shadow: 0 0 8px rgba(255, 213, 74, 0.5); }`. The gold modifier changes colour and adds a glow and changes nothing else, so the weight and the size are identical across all three cells and the apparent heaviness is the glow. It is a deliberate emphasis modifier applied to the price, which is the right cell to emphasise. **This was a false positive and it is withdrawn.** Recorded rather than deleted, because a re-run whose only output is additions has not done the job it was called for.

## STT-MOBILES-2-19 LOW The SELECT button overflows its column while its sibling ACTIVE does not

- Frames: `.../343_mobile-s_transition_features_menu_opening.png`, `.../344_mobile-s_features_menu.png`
- Claim: on the two-column mode card the left column's `ACTIVE` chip is fully drawn inside its column with its border closed on all four sides, while the right column's `SELECT` button runs to the card's inner edge with its right border and rounded corner unpainted, so the button appears to run off the card. The label glyphs `SELECT` are complete; it is the button box that is cut.
- Resolution note: NEW AT 1600PX (a one-pixel border at 320px is not present at 242 image tokens)
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte`, mode card action class not located: UNKNOWN to the line. Not locked.
- Proposed fix: give the mode card inner padding the action row respects, or let the button shrink rather than overflow.

## Native pass reconciliation

Both superseded shards were read AFTER the frame pass. Findings outside frames 330 to 346 belong to sibling squads and are named as such rather than judged.

**STT-MOBILES-A (frames 312 to 337; the overlap with this squad is 330 to 337).**

- **A-01 `SCATTERs`, frame 335. CONFIRMED.** At 1600px the lowercase `s` is unambiguous against seven capitals, and `prose.ts:112` holds the literal. The native pass called this one correctly.
- **A-02 five namings of the scatter, frames 333 to 337. CONFIRMED and REFINED.** All five survive at full resolution. The refinement: A-02 had to reach outside the paytable to frame 315 for its sixth setting, and it does not need to. `Scatters` appears again on the buy dialog at frame 346, inside this squad's range, so the sixth rendering is reachable from the paytable in one tap and the claim does not depend on the gated intro card.
- **A-03 ways strip clipped, frames 330 to 333. CONFIRMED and REFINED.** The overflow is real and the arithmetic in A-03 holds. The refinement is severity: A-03 says the digit `1` is *cut down its stem* and the `5` *cut through its bowl*. At full resolution the `5` matches that description and the `1` does not: nothing legible of it remains, only an arc of the chip outline. The defect is worse than the native pass could see, which is the direction a re-run is supposed to be able to move a finding in.
- **A-04 centred bullet lists, frames 335 and 336. CONFIRMED and WIDENED.** The mechanism A-04 identified, inheritance from the Vite scaffold `text-align: center` at `app.css:143`, is right and is re-verified. Widened here as finding 08: the same inheritance is setting the eight-line `RESPONSIBLE PLAY` paragraph and the thirteen-line `DISCLAIMER` on frames 339 and 340, which are outside A's range and are far more visible than the bullets, and finding 09 measures the marker offsets A-04 described.
- **A-05 win strip illegible. OUT OF THIS SQUAD'S RANGE** (frames 325 to 328), but the same surface appears at frame 341 in range and **CONFIRMED** there, with A-05's scale mechanism adopted into finding 03.
- **A-06 `1 ways`. OUT OF RANGE** (frames 325 to 328). Source re-verified in passing: `WinBreakdown.svelte:94` is `{current.ways} ways` with no singular branch. Frame 341 shows `8 ways`, so the range contains no counterexample and no confirmation.
- **A-07 HUD menu casing. OUT OF RANGE** (frames 327, 328).
- **A-08 mode name casing, frame 337. CONFIRMED.** Carried as finding 12, with A-08's `prose.ts:85,87,89,91,93` citation re-verified and its argument that this is not Q-34 accepted.
- **A-09 payout decimal precision, frame 334. CONFIRMED.** Carried as finding 05. A-09's additional note that `0.10` and `0.20` at `:81-82` render as `0.1` and `0.2` is below the fold in every frame in this range, so it is neither confirmed nor refuted here.
- **A-10 modal title and button casing. PARTIALLY IN RANGE.** Only frame 331 is in range, and its half is CONFIRMED: `PAYTABLE` is all caps and tracked. The session panel, splash and intro comparisons are frames 313, 315 and 329, outside this range.
- **A-11 serial comma, frames 315 and 335. CONFIRMED and REFINED.** The refinement matters for the row's strength: A-11's pair straddles the gated intro card at frame 315, which a viewer sees once. The same disagreement exists entirely inside the in-play surfaces, paytable frame 335 against buy dialog frame 346, so it is reachable at any moment and not only at first launch. Carried as finding 06.
- **A-12 `WIN!` tracking. OUT OF RANGE** (frame 323).

**STT-MOBILES-B (frames 338 to 363; the overlap with this squad is 338 to 346).**

- **B-01 `5,000×BET` on the max win hero. OUT OF RANGE** (frames 360, 361).
- **B-02 mode name casing, frames 344 to 348. CONFIRMED for the in-range half.** Frames 344, 345 and 346 confirm `Normal`, `Cruise` and `Buy Overdrive` in Title Case; the `NITRO OVERDRIVE` counterpart is frame 348, outside this range, so within range the all-caps side is evidenced by `OVERBOOST` on frame 337 instead. The finding stands either way.
- **B-03 FEATURES bet bar wrap, frames 343 and 344. CONFIRMED on the observation, REFINED on the classification.** The wrap is real: `BET` sits on line one beside the minus and its `$1.00` on line two beside the plus, and `flex-wrap: wrap` at `FeatureMenu.svelte:847` is the cause with the working `nowrap` precedent at `:760-761`. B-03's measured claim that the upper `$1.00` is about six tenths the height of the lower is CONFIRMED at 1600px, where the two measure about 26px and about 40px, a ratio of 0.65. The refinement: B-03 filed this as a new typography finding, and this squad files it as **KNOWN(TR-115 / TR-086)** with these frames as fresh evidence, because it is a money display failing to fit its container, which is that row's stated class.
- **B-04 `MAX WIN` three-line wrap, frames 345 and 346. CONFIRMED.** Carried as finding 17, with B-04's source citations re-verified at `BuyBonus.svelte:135` and `:240`.
- **B-05 `Features` against `FEATURES`, frame 338. CONFIRMED.** Carried as the first half of finding 11, with `prose.ts:128,129` re-verified as adjacent literals.
- **B-06 `©` and `™` falling back to another family, frame 340. SPLIT: half CONFIRMED, half REFUTED as unsupportable.**
  - The `©` half is CONFIRMED. At 1600px the mark is a true circular ring, while the `o` of `Roll` two words away on the same line is the flat-sided rounded form of the surrounding face. Two different drawings, side by side, judged from pixels and signed as such.
  - **The `™` half is REFUTED.** B-06 claims the `™` shows *a narrow `M` with a pointed centre vertex* against the brand face's square monoline `W`. That claim cannot be supported. The `™` is a superscript at roughly 6 shipped pixels tall, so its interior vertex occupies well under one pixel; there is no vertex there to be pointed or flat. Upscaling cannot recover it either, because the upscale is a resample of the same capture and adds no information. A native-resolution pass had even less to work with. The `™` may well be falling back, and the codepoints at `PaytableModal.svelte:63` are correctly cited, but **the stated evidence for the `™` does not exist at any resolution derived from this capture** and the claim must not reach the ledger in that form. If it matters, it is settled by reading the shipped `@fontsource` subset for U+2122, not by looking at a frame.
- **B-07 prose sliced mid-glyph, frames 338, 340, 346. CONFIRMED and COMPLETED.** All three in-range instances reproduce at full resolution, and two more are added at frames 331 and 339. B-07 left the `BuyBonus` scroll region UNKNOWN; it is `frontend/src/lib/components/BuyBonus.svelte:174`, `max-height: 90dvh; overflow-y: auto;` with no `mask-image` anywhere in the file. Carried as finding 04.
- **B-08 win strip illegible plus `1 ways` plus letter `x`, frame 341 in range. CONFIRMED on the defect, with one transcription REFUTED.** The strip is illegible at 1600px exactly as claimed, and `WinBreakdown.svelte:93-94` confirms both `x{current.kind}` with ASCII U+0078 and the unconditional `{current.ways} ways`. **The refutation is B-08's transcription of frame 341 as `M3 x5 8 ways $16.20`.** Read at 1600px this squad transcribes the symbol token as `H2`, not `M3`. Neither reading is signed. The correct handling is that the strip's CONTENT is not transcribable from this capture by anyone, so no shard should quote it as though it were, and the disagreement between two independent readers is now the best available evidence that the strip is unreadable. Finding 03 states it that way.
- **B-09 `HIT ENTER` on a touch viewport. OUT OF RANGE** (frames 360, 361).

## Explicit absences, signed

Claims, with what was checked to be able to make them. All 17 frames were opened once each at 1600px and every player-visible string in them was read word by word.

- **No mixed straight and curly quotes.** Not one apostrophe and not one quotation mark appears in any player-visible string across the 17 frames. Read in full: the paytable intro copy, the ways caption, the WILD and SCAT card bodies, the six rules bullets, the three Overdrive bullets, the two mode blurbs on the bet modes card, the five interface guide rows, the responsible play paragraph, the entire disclaimer paragraph, the four autoplay labels, the two features menu blurbs and the buy dialog's three body paragraphs. The prose contains no possessives and no contractions, so the class is absent rather than merely consistent.
- **No em dash and no en dash in any player-visible string.** Same read. The separators in use are the comma, the full stop, the semicolon in `Symbol values shown are per matching way; the total is that value times the number of ways times your bet.` (335), the colon in `A smoother ride: more frequent smaller wins, same 96.35% RTP.` (337) and one middle dot in `All modes · RTP 96.35%` (343, 344). No hyphen appears either.
- **No double spaces found.** Checked on the centred blocks in particular, where a doubled space shows as an uneven gap on an otherwise even line: frames 339 and 340 (the two longest paragraphs at eight and thirteen lines), 335, 336 and 331.
- **Currency format agrees everywhere it appears.** `$1.00` (337, 341, 343, 344), `$16.20` (341), `$50,000.00` (341), `$100.00` (345, 346): symbol prefix, comma thousands, full stop decimal, always two decimal places. No disagreement. The decimal disagreement in finding 05 is on payout multipliers, not on currency.
- **Percentage format agrees everywhere.** `96.35%` on frames 337 (twice), 343, 344, 345 and 346, always two decimal places, no space before the sign.
- **The multiplication sign is correct on every surface in this range that renders at a legible size.** Checked and source-confirmed rather than eyeballed: `frontend/src/lib/components/PaytableModal.svelte:233-235` writes `3×`, `4×`, `5×` with U+00D7, and `prose.ts:112` writes `1×, 3×, or 10×`. So MID-02's and Q-26's ASCII `x` is NOT present on the paytable, the bet modes card, the features menu or the buy dialog in frames 330 to 346. It IS present on the one surface too small to judge by eye, and that is recorded as a KNOWN match below rather than signed off here.
- **TR-089 is not engaged in this frame range.** There is no win count-up between frames 330 and 346, so no animated `.fs-num` surface appears. `fs-num` is present as a static class on the paytable payout values (`PaytableModal.svelte:233-235`) and shows no irregular digit pitch. No other numeric surface in the range shows shimmy, and there is no numeric animation in the set to shimmy: the balance and win pods hold `$50,000.00` and `$16.20` unchanged across frames 341 and 342.
- **No ellipsised string.** No `…` and no `...` appears anywhere in the 17 frames. Every clipping in this shard is a hard cut, which is a different and worse failure than an honest ellipsis.
- **No placeholder or lorem string.** Every visible string is real product copy.
- **One step-two finding withdrawn at step three**, recorded at `STT-MOBILES-2-18` above: a claimed weight and size difference in the buy dialog stat row is refuted by `BuyBonus.svelte:240-241`, where the gold modifier changes colour and glow only.

## KNOWN matches

- **KNOWN(TR-115 / TR-086)**, money display fit failure, fresh evidence at two places:
  - `.../337_mobile-s_paytable_06_bet_modes.png`: on both the `Normal` and `Cruise` cards the three-column stat row `COST / RTP / MAX WIN` sets `1×`, `96.35%`, `5,000×`, and the cost cell's currency figure `$1.00` then drops to a fourth line of its own, left aligned under the `COST` label while the `1×` above it is centred. The grid breaks in the money cell and only in the money cell.
  - `.../343` and `.../344_mobile-s_features_menu.png`: the bet control row wraps so the label `BET` sits on line one beside the minus button and its value `$1.00` on line two beside the plus button, separating a label from the figure it labels and printing `$1.00` twice in one bordered box at two sizes (about 26px and about 40px on the upscale). Cause `frontend/src/lib/components/FeatureMenu.svelte:847`, `flex-wrap: wrap`, with the correct `flex-wrap: nowrap` already present for the mini panel at `:760-761`.
- **KNOWN(Q-26)**, the letter `x` where the game elsewhere uses `×`, fresh evidence and a correction of the row's scope: `.../341_mobile-s_transition_paytable_closing.png` renders the win detail strip whose multiplier token is built at `frontend/src/lib/components/WinBreakdown.svelte:93` as `x{current.kind}`, an ASCII U+0078 outside `fsModes.ts`. Q-26's enumeration names `fsModes.ts` as the location of the survivors; this instance is in a component, which is the same shape of gap MID-02 records. Recorded as a KNOWN match with fresh evidence, not as a new id.
- **KNOWN(Q-27)**, Vite scaffold CSS reaching a player-visible frame: `frontend/src/app.css:139-143` `#app { ... text-align: center; }` is what centres the paytable's rules bullets and its two long legal paragraphs on frames 331, 335, 336, 339 and 340. Q-27 says the remnants are visible *only if any link or unstyled surface reaches a frame*; five frames in this range are that surface. The visible defect is written up as findings 08 and 09; the source row is Q-27's.
- **KNOWN(Q-34)**, one side only: `.../337`, `.../343` and `.../344` show `Cruise` in Title Case on the paytable and on the features menu. The `CRUISE` HUD badge is not in this frame range, so this evidences the lower-case side of the row and not the transform side.
- **KNOWN(Q-07)**, allowlisted and not a finding: `.../342_mobile-s_autoplay_menu.png` shows the infinite autoplay option's `∞` in a fallback face, smaller and lighter than the sibling numerals. Recorded as fresh evidence of the kept behaviour. Note for the marshal, since it bears on the ruling rather than on the row: the mechanism is that `.auto-menu-item` at `frontend/src/lib/components/HudOverlay.svelte:1785` declares no `font-family` at all, so the fallback is not confined to the one glyph that was reviewed. See finding 10.
- **KNOWN(Q-16 park)**, hardcoded English visible on stream frames, which the park asks to have evidenced: `Stop on win`, `Single win limit`, `Stop on feature`, `Loss limit` and `SPINS` on `.../342`; `SYMBOL PAYOUTS` on `.../334`, `INTERFACE GUIDE` on `.../338`, `RESPONSIBLE PLAY` and `DISCLAIMER` on `.../339` and `.../340`. This is an `en` session, so none is a defect here; they are recorded because the park's urgency depends on whether the strings reach a frame, and all nine do.
- **MID-01 and MID-02: not present in this range.** Frames 330 to 346 carry no win banner and no big win count-up. This session's big win triple is frames 324 to 326, which belongs to a sibling squad.

tree_after: `git status --porcelain`, verbatim. Every line is `??`, untracked. **Nothing reads as MODIFIED and nothing reads as DELETED, so this squad did not dirty the tree.** One line is this squad's own shard; the other 23 belong to sibling squads and are not this squad's to touch. The only file written anywhere in the repository by this squad is `reports/qa/stream_test/shards/STT-MOBILES-2.md`.

```
?? reports/qa/stream_test/shards/STC-MOBILEL-1.md
?? reports/qa/stream_test/shards/STC-MOBILEL-2.md
?? reports/qa/stream_test/shards/STC-MOBILEL-3.md
?? reports/qa/stream_test/shards/STC-MOBILEM-1.md
?? reports/qa/stream_test/shards/STC-MOBILEM-2.md
?? reports/qa/stream_test/shards/STC-MOBILEM-3.md
?? reports/qa/stream_test/shards/STC-MOBILES-2.md
?? reports/qa/stream_test/shards/STC-POPOUTS-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-2.md
?? reports/qa/stream_test/shards/STC-POPOUTS-3.md
?? reports/qa/stream_test/shards/STM-MOBILEL.md
?? reports/qa/stream_test/shards/STM-MOBILEM.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STT-MOBILEL-1.md
?? reports/qa/stream_test/shards/STT-MOBILEL-2.md
?? reports/qa/stream_test/shards/STT-MOBILEL-3.md
?? reports/qa/stream_test/shards/STT-MOBILEM-1.md
?? reports/qa/stream_test/shards/STT-MOBILEM-2.md
?? reports/qa/stream_test/shards/STT-MOBILEM-3.md
?? reports/qa/stream_test/shards/STT-MOBILES-1.md
?? reports/qa/stream_test/shards/STT-MOBILES-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-1.md
?? reports/qa/stream_test/shards/STT-POPOUTS-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-3.md
```
