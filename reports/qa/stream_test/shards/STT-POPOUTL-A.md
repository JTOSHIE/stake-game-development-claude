# STT-POPOUTL-A, typography (popout-l, frames 105 to 130)

scope: every `popout-l` frame numbered 105 to 130 inclusive, 26 frames, viewport
`800x450`, lang `en`, build `d9bdf22`. Splash, intro rules card, base idle, spin
transitions, three dead spins, win presentation, the big win triple, HUD menu,
session panel and paytable sections `top` through `06_bet_modes`.
frames_read: 26

Measurement note: pixel figures below are glyph ink extents read off the PNG at
native `800x450` with a luminance threshold, quoted as `x` and `y` in frame
coordinates. Zoom crops used for glyph identification were written to the session
scratchpad, not to the repository.

**The headline of this shard is that KNOWN_OPEN row Q-27 is wrong about its own
visibility.** The row records the Vite scaffold remnants in `app.css` as
"visible only if any link or unstyled surface reaches a frame". One of those
remnants, `#app { text-align: center }` at
`frontend/src/app.css:139-143`, is inherited by the whole application tree and is
the direct cause of STT-POPOUTL-A-01 and STT-POPOUTL-A-08 below. It is on screen
in nine of my 26 frames. Both findings are written out in full rather than
collapsed into a KNOWN line, because the row states the class is not
frame-auditable and these frames disprove that; the marshal should feel free to
fold them back under Q-27, but with the severity these frames establish.

## STT-POPOUTL-A-01 STREAM Paytable bullet markers are pinned to the left margin while their text is centred, leaving gaps of up to 206 px

- Frames: `reports/screens/stream-test-2026-07-28/128_popout-l_paytable_04_rules.png`, `reports/screens/stream-test-2026-07-28/129_popout-l_paytable_05_overdrive_free_spins.png`
- Claim: on the paytable the `›` bullet marker is drawn at a fixed `x66` to `x68`
  on every row while the bullet's own text is centre-aligned in the panel, so the
  marker and the text it belongs to are separated by a gap that changes on every
  line. Measured first-glyph starts on `128`, top to bottom: `x195`, `x88`,
  `x220`, `x107`, `x200`, `x274`. The last of those is the bullet
  `Malfunctions void all pays and plays.`, whose marker sits **206 px** from its
  first letter, a quarter of the 800 px viewport. On `129` the same pattern gives
  `x80`, `x197`, `x93`, `x180`.

  The same list treatment on the intro rules card is correct and is the control:
  on `reports/screens/stream-test-2026-07-28/108_popout-l_intro_rules.png` the
  marker is at `x188` to `x190` and the text starts at `x203` on all four
  bullets, a constant 13 px gutter, left-aligned.

  Cause, derived from source and then confirmed by the control frame:
  `frontend/src/lib/components/PaytableModal.svelte:667-669` sets
  `.fs-rules li { padding-left: 16px; position: relative }` with an absolutely
  positioned `::before` at `left: 0`, which is correct and would give a 16 px
  gutter. It sets no `text-align`, so the list inherits `text-align: center` from
  the Vite scaffold rule `#app { ... text-align: center }` at
  `frontend/src/app.css:139-143`. The intro rules card escapes because
  `frontend/src/lib/components/IntroSplash.svelte:97` declares `text-align: left`
  on its own list. One component overrides the scaffold and the other does not,
  which is exactly the shape of the difference the two frames show.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:668` (add
  `text-align: left` to `.fs-rules li`), and the root cause at
  `frontend/src/app.css:139-143`. Neither is locked.
- Proposed fix: delete `text-align: center` from the `#app` scaffold block and
  re-run the layout gates, which fixes this and STT-POPOUTL-A-08 together. If the
  root removal is judged too broad for one pass, add `text-align: left` to
  `.fs-rules li` as the local patch and leave the scaffold row open.

## STT-POPOUTL-A-02 HIGH The word "scatter" is set five different ways, three of them on one screen

- Frames: `reports/screens/stream-test-2026-07-28/129_popout-l_paytable_05_overdrive_free_spins.png`, `reports/screens/stream-test-2026-07-28/128_popout-l_paytable_04_rules.png`, `reports/screens/stream-test-2026-07-28/127_popout-l_paytable_03_symbol_payouts.png`, `reports/screens/stream-test-2026-07-28/130_popout-l_paytable_06_bet_modes.png`, `reports/screens/stream-test-2026-07-28/108_popout-l_intro_rules.png`
- Claim: frame `129` alone carries three casings. Its table header renders
  `SCATTERS`; its second bullet reads `3 or more Scatters during free spins award
  +5 free spins.`; its third bullet reads `The scatter build runs shorter on a
  retrigger than on the entry, because the feature is already secured.` All caps,
  Title Case and lower case, one word, one screen, no rule distinguishing them.

  Across the session the count is five: `SCATTERS` (`129` header), `Scatters`
  (`129` bullet 2, `108` bullets 1 and 3), `scatter` (`129` bullet 3), `SCATTER`
  (`128` bullet 3, `WILD substitutes for all symbols except SCATTER.`, and the
  WILD card body on `127`, `Substitutes for all symbols except SCATTER`), and
  `SCAT` (`127` symbol card label). Frame `130` adds `scatters` lower case in the
  Normal blurb, `Standard play. Overdrive Free Spins trigger on 3+ scatters.`

  The literals, so the fix is a string edit and not a guess:
  `frontend/src/lib/i18n/translations.ts:1540` `Scatters`,
  `:1542` `Scatters`, `:1543` `scatter`;
  `frontend/src/lib/i18n/prose.ts:100` `SCATTER`, `:86` `scatters`.
  The header is not a literal: `PaytableModal.svelte:258` writes
  `<th>Scatters</th>` and `.fs-trig th` at
  `PaytableModal.svelte:674` applies `text-transform: uppercase`, so the same
  Title Case source string renders all caps three lines above a bullet that
  renders it Title Case.

  The charter names cross-surface capitalisation as a machine-tell and
  KNOWN_OPEN records that it is gated nowhere, so the frames are the only
  instrument that sees this.
- Where fixable: `frontend/src/lib/i18n/translations.ts:1540,1542,1543`,
  `frontend/src/lib/i18n/prose.ts:86,100`,
  `frontend/src/lib/components/PaytableModal.svelte:258`. None locked.
- Proposed fix: choose one player-facing form (`Scatter` / `Scatters`) and one
  symbol-code form (`SCAT`), then sweep those six sites. PARK(the sweep is
  sixteen locales wide if the same drift exists in the other fifteen, which this
  `en` shard cannot see) if the marshal wants the non-English rows checked first.

## STT-POPOUTL-A-03 HIGH `SCATTERs`, an all-caps word carrying a lower case plural suffix, in player-visible prose

- Frames: `reports/screens/stream-test-2026-07-28/128_popout-l_paytable_04_rules.png`
- Claim: the fourth rules bullet reads verbatim
  `3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total
  bet win.` The plural `s` is lower case against a fully capitalised stem. Read
  at 4x zoom to confirm it is not a rendering artefact. This is the most legible
  machine-tell in the 26 frames: no typesetter produces `SCATTERs`.
  The literal is `frontend/src/lib/i18n/prose.ts:112`, and the social variant at
  `frontend/src/lib/i18n/prose.ts:195` carries the identical defect
  (`... to your total play prize.`), so a fix that touches only one of them
  leaves the other shipping.
- Where fixable: `frontend/src/lib/i18n/prose.ts:112` and
  `frontend/src/lib/i18n/prose.ts:195`. Not locked.
- Proposed fix: rewrite both literals to the single chosen form from
  STT-POPOUTL-A-02, for example
  `3, 4 or 5 Scatters anywhere apply a 1×, 3× or 10× multiplier to your total bet win.`,
  which also closes STT-POPOUTL-A-12.

## STT-POPOUTL-A-04 HIGH The HUD menu sets one item in all caps and its two siblings in Title Case

- Frames: `reports/screens/stream-test-2026-07-28/121_popout-l_hud_menu.png`, `reports/screens/stream-test-2026-07-28/120_popout-l_transition_menu_opening.png`
- Claim: the three menu items in one list read `PAYTABLE`, `Session` and `Mute`.
  Measured glyph bands, all sharing a left edge at `x72`: `PAYTABLE` `y242` to
  `y250`, `Session` `y273` to `y282`, `Mute` `y307` to `y314`. Same size, same
  face, same list, two casings.

  The cause is that one item is localised and the others are not.
  `frontend/src/lib/components/HudOverlay.svelte:428` renders
  `{$tr('paytable')}`, whose English value is
  `frontend/src/lib/i18n/translations.ts:271` `'PAYTABLE'`, all caps; line `429`
  renders the bare literal `Session`. The same pair is duplicated at
  `HudOverlay.svelte:546-547`, `:655-656` and `:817-818`, so any fix has to touch
  four copies of the menu, not one.

  The destination heading disagrees as well: `PAYTABLE` opens a panel titled
  `PAYTABLE`, `Session` opens a panel titled `Session information`
  (`reports/screens/stream-test-2026-07-28/122_popout-l_session_panel.png`).
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:429,547,656,818`
  and `frontend/src/lib/i18n/translations.ts:271`. Not locked. The hardcoded
  `Session` literal is also a Q-16 park member.
- Proposed fix: route `Session` and `Mute` through `$tr` like `paytable`, and set
  one casing across the three keys. Raising the two to all caps matches
  `PAYTABLE`, its own panel title, and every section header in the game, but the
  direction is an art call.

## STT-POPOUTL-A-05 HIGH The win-line detail strip is rendered at a 5 px glyph band and is illegible

- Frames: `reports/screens/stream-test-2026-07-28/118_popout-l_transition_bigwin_countup_late.png`, `reports/screens/stream-test-2026-07-28/119_popout-l_bigwin_settled.png`, `reports/screens/stream-test-2026-07-28/120_popout-l_transition_menu_opening.png`, `reports/screens/stream-test-2026-07-28/121_popout-l_hud_menu.png`
- Claim: the strip under the reel frame that names the winning line has its
  entire ink between `y258` and `y262` on frame `118`, with the majority of glyph
  bodies confined to `y259` to `y261`: a body height of **3 px** and a total
  glyph band of **5 px** at the `800x450` popout viewport. Segmented runs on that
  row are `x369-376`, `x382-388`, `x394`, `x397-409`, `x414-422`, `x424-431`. A
  per-pixel dump of `x366` to `x434` resolves to noise; no glyph is identifiable
  at native resolution. The string reads approximately `L3  x4  1 ways  $0.22`
  only at 8x magnification.

  Derived: `frontend/src/lib/components/WinBreakdown.svelte:136` sets the strip
  at `font-size: 0.7rem` with `:146` `.wb-ways { font-size: 0.62rem }`. The stage
  is authored at 1280x720 and scaled to the viewport, so at `800x450` those
  become about 7.0 px and 6.2 px of real pixels, which is what the 5 px ink band
  measures. Nothing clamps the strip at small viewports.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:136,146`. Not
  locked.
- Proposed fix: floor the strip with `max(0.7rem, 11px)` style sizing, or hide
  the breakdown below a stage-scale threshold rather than shrinking it past
  legibility.

## STT-POPOUTL-A-06 MEDIUM The `WIN!` flash is sized in `vw` inside a scaled stage and set 200 weight units heavier than every neighbouring display string

- Frames: `reports/screens/stream-test-2026-07-28/116_popout-l_win_presentation.png`
- Claim: the `WIN!` drawn over the reels occupies `x374` to `x425`, `y145` to
  `y177`. Its `W` reads as strongly oblique strokes with pointed apexes and a
  central vertex near cap height, where every other `W` in the session is a
  squared `W` with near-vertical outer strokes and a low central vertex:
  `WAYS TO WIN` on `reports/screens/stream-test-2026-07-28/124_popout-l_paytable_top.png`,
  `BIG WIN` on `reports/screens/stream-test-2026-07-28/118_popout-l_transition_bigwin_countup_late.png`
  and `reports/screens/stream-test-2026-07-28/119_popout-l_bigwin_settled.png`,
  `WILD` on `reports/screens/stream-test-2026-07-28/126_popout-l_paytable_02_ways_to_win.png`.

  **I checked the family before claiming one, and it is not a family swap.**
  `frontend/src/lib/components/WinCelebration.svelte:56` sets
  `font-family: var(--fs-font-display)`, which is
  `'Orbitron', system-ui, sans-serif` at `frontend/src/app.css:97`, and
  `frontend/src/main.ts:2-4` self-hosts Orbitron 400, 700 and 900, so the
  requested weight exists and nothing should fall back. Per convention (l.6) I am
  parking the family question rather than filling it with a plausible answer: at
  a 22 px cap height under `text-shadow: 0 0 3px, 0 0 18px, 0 0 35px`
  (`WinCelebration.svelte:60-63`) the glow closes the counters, and I cannot
  separate "different face" from "Orbitron Black bloomed shut" from one sample.

  What does survive as a defect, from source rather than from the pixels:
  `WinCelebration.svelte:57` sizes the flash
  `font-size: clamp(2rem, 6vw, 3.5rem)` while every other display string in the
  stage is sized in `rem`. `vw` resolves against the real viewport and is then
  scaled again by the stage transform, so the flash double-counts viewport width:
  at 1200x675 it lands on the 3.5rem clamp and renders about 52 px, at 800x450 it
  computes 48 px and renders about 30 px. The one word a player sees on every
  winning spin therefore changes size relative to everything around it as the
  window changes, which no other type in the game does.
  `WinCelebration.svelte:58` also sets `font-weight: 900` where the surrounding
  display surfaces run at 700.
- Where fixable: `frontend/src/lib/components/WinCelebration.svelte:57` (the
  `vw` unit), `:58` (the weight), `:60-63` (the glow radii). Not locked.
- Proposed fix: replace `6vw` with a `rem` value so the flash scales with the
  stage like its neighbours, and tighten the outer glow so the letterforms keep
  their counters at small viewports. Then re-capture and settle the family
  question from a clean frame.

## STT-POPOUTL-A-07 MEDIUM Four symbol cards in one row carry their captions on three different baselines

- Frames: `reports/screens/stream-test-2026-07-28/126_popout-l_paytable_02_ways_to_win.png`, `reports/screens/stream-test-2026-07-28/127_popout-l_paytable_03_symbol_payouts.png`
- Claim: measured near-white caption ink in the first `SYMBOL PAYOUTS` row of
  `126`: `H1` and `H2` both occupy `y406` to `y414`; `WILD` occupies `y419` to
  `y427`, 13 px lower; `SCAT` starts at `y426`. Three baselines in one row of
  four cards of one component. The cards share a top edge and the symbol art box
  is fixed at 78x78 (`PaytableModal.svelte:658`), so the drift comes from the
  caption being a plain flex child of
  `PaytableModal.svelte:657` `.fs-sym-card > .fs-face { padding: 14px 10px;
  gap: 6px; align-items: center; }` rather than being anchored, so cards whose
  content differs in height place their caption at a different offset. The
  comment at `PaytableModal.svelte:468-480` records an earlier fix to the same
  two cards, `WILD` and `SCAT`, for the fill height; the caption position was not
  covered by it.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:657`. Not
  locked.
- Proposed fix: give the symbol art plus caption a fixed-height block, or push
  the note to the bottom with `margin-top: auto` so the caption sits at a
  constant offset in every card of a row.

## STT-POPOUTL-A-08 MEDIUM The HUD WIN pod re-centres during its own count-up, so every digit slides

- Frames: `reports/screens/stream-test-2026-07-28/116_popout-l_win_presentation.png`, `reports/screens/stream-test-2026-07-28/117_popout-l_transition_bigwin_countup_early.png`, `reports/screens/stream-test-2026-07-28/119_popout-l_bigwin_settled.png`
- Claim: `$3.90` on frame `116` occupies `x301` to `x349`; `$16.20` on frame
  `119` occupies `x298` to `x352`. Adding one character moves every character
  already on screen 3 px left. Within the six-character phase the string still
  wanders: `$15.95` on `117` sits at `x299` to `x353` and `$16.20` on `118` and
  `119` at `x298` to `x352`, the same 55 px advance translated by 1 px.

  This is not the `.fs-num` surface. The banner amount beside it is steady, as
  TR-089 fixed it to be: its per-digit boxes measure
  `(352,370) (379,387) (396,413) (417,421) (424,442) (446,464)` on `118` and
  `119` and `(352,370) (379,387) (396,414) (418,421) (425,443) (447,465)` on
  `117`. The HUD pod runs a second, independent count-up (KNOWN(MID-01) below)
  and did not get the same treatment. KNOWN_OPEN TR-089 states that any other
  numeric surface that shimmies is a new finding.

  Cause: `frontend/src/lib/components/HudOverlay.svelte:1331-1338` `.fs-value`
  declares `font-variant-numeric: tabular-nums`, which
  `frontend/src/app.css:86-87` already records as a no-op behind Orbitron, and
  declares no alignment. Only the bet pod is aligned, at
  `HudOverlay.svelte:1343` `.fs-bet .fs-label, .fs-bet .fs-value { text-align:
  right }`. The balance and win pods therefore fall through to the inherited Vite
  scaffold `#app { text-align: center }` at `frontend/src/app.css:143`, the same
  rule that causes STT-POPOUTL-A-01, so the readout re-centres whenever its
  character count changes.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1331-1343` and
  `frontend/src/app.css:143`. Not locked.
- Proposed fix: give the balance and win pods the same explicit alignment the bet
  pod already has, so a changing character count grows the string in one
  direction instead of moving every glyph.

## STT-POPOUTL-A-09 MEDIUM The same call to action is set `TAP TO CONTINUE` on one surface and `Continue` on the next

- Frames: `reports/screens/stream-test-2026-07-28/105_popout-l_transition_splash_entrance.png`, `reports/screens/stream-test-2026-07-28/106_popout-l_splash.png`, `reports/screens/stream-test-2026-07-28/107_popout-l_transition_splash_to_rules.png`, `reports/screens/stream-test-2026-07-28/108_popout-l_intro_rules.png`
- Claim: the splash prompt reads `TAP TO CONTINUE`, all caps with wide tracking
  (`frontend/src/lib/i18n/translations.ts:1557` `splashPressAnywhere`). The very
  next surface, one click later, puts the same verb on its primary button as
  `Continue`, Title Case, no tracking
  (`frontend/src/lib/i18n/translations.ts:1556` `introContinue`, rendered at
  `frontend/src/lib/components/IntroSplash.svelte:35`). A third key,
  `featureContinue` at `translations.ts:1548`, is `TAP TO CONTINUE` again. Two
  casings of one word on two consecutive screens in the first ten seconds of the
  session. The charter names button casing drift explicitly.
- Where fixable: `frontend/src/lib/i18n/translations.ts:1556`. Not locked.
- Proposed fix: set `introContinue` to `CONTINUE` to match the all-caps treatment
  the game uses on `MAX`, on every section header and on the other two continue
  keys, or lowercase all three. Sixteen locales carry the same key, so the change
  is small but wide.

## STT-POPOUTL-A-10 MEDIUM One bet-mode card in a grid of four is all caps while its siblings are Title Case

- Frames: `reports/screens/stream-test-2026-07-28/130_popout-l_paytable_06_bet_modes.png`
- Claim: the `BET MODES` grid titles read `Normal`, `Cruise`, `Buy Overdrive` and
  `OVERBOOST`. Four cards, one component, two casings, and the odd one out is not
  distinguished by anything else on the card. The literals sit in one adjacent
  block: `frontend/src/lib/i18n/prose.ts:85` `'Normal'`, `:87` `'Cruise'`,
  `:89` `'OVERBOOST'`, `:91` `'Buy Overdrive'`, `:93` `'NITRO OVERDRIVE'`, so
  three Title Case and two all caps were written into the same list.
  This is adjacent to KNOWN_OPEN Q-34 but is not the same defect: Q-34 records
  one mode reading `Cruise` on three surfaces and `CRUISE` on the HUD badge,
  whereas this is casing drift between siblings inside a single grid on a single
  screen.
- Where fixable: `frontend/src/lib/i18n/prose.ts:85-93`. Not locked.
- Proposed fix: normalise the five mode labels to one casing at the point they
  are rendered, which also gives Q-34 a single place to be settled instead of
  four.

## STT-POPOUTL-A-11 MEDIUM One panel heading is sentence case among eight all-caps headings

- Frames: `reports/screens/stream-test-2026-07-28/122_popout-l_session_panel.png`
- Claim: the session panel is titled `Session information`
  (`frontend/src/lib/i18n/translations.ts:246` `rgSessionTitle`). Every other
  heading in the session renders all caps: `PAYTABLE` (`123` to `130`),
  `OVERDRIVE FREE SPINS` (`108`, `129`), `WAYS TO WIN` (`124`, `126`),
  `SYMBOL PAYOUTS` (`126`, `127`), `RULES` (`128`), `BET MODES` (`130`), plus the
  HUD pod labels `BALANCE`, `WIN` and `BET`. The paytable headings get there by
  CSS, not by their literals: `PaytableModal.svelte:605-611` `.fs-heading`
  applies `text-transform: uppercase` to Title Case sources such as
  `prose.ts:99` `'Symbol Payouts'`. The session panel title carries no equivalent
  transform, so one heading in nine breaks the system.
- Where fixable: `frontend/src/lib/i18n/translations.ts:246`, or the session
  panel's title rule in
  `frontend/src/lib/components/SessionPanel.svelte`. Not locked.
- Proposed fix: add the same `text-transform: uppercase` and tracking the
  paytable headings use, rather than editing the literal in sixteen locales.

## STT-POPOUTL-A-12 MEDIUM The same rule is punctuated with a serial comma on one surface and without it on another

- Frames: `reports/screens/stream-test-2026-07-28/108_popout-l_intro_rules.png`, `reports/screens/stream-test-2026-07-28/128_popout-l_paytable_04_rules.png`
- Claim: the intro rules card states
  `3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1×, 3× or
  10× total bet.` (`frontend/src/lib/i18n/translations.ts:1540`). The paytable
  states the same rule as
  `3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total
  bet win.` (`frontend/src/lib/i18n/prose.ts:112`). Two lists, four coordinating
  conjunctions, opposite serial-comma policy, in one product. The repository's
  own house style is Australian English, which takes no serial comma, so the
  paytable string is the outlier.
- Where fixable: `frontend/src/lib/i18n/prose.ts:112` and `:195`. Not locked.
- Proposed fix: drop the two serial commas in the paytable strings, in the same
  edit as STT-POPOUTL-A-03.

## STT-POPOUTL-A-13 LOW The win-line strip reads `1 ways` and writes its count multiplier with a letter `x`

- Frames: `reports/screens/stream-test-2026-07-28/118_popout-l_transition_bigwin_countup_late.png`, `reports/screens/stream-test-2026-07-28/120_popout-l_transition_menu_opening.png`, `reports/screens/stream-test-2026-07-28/121_popout-l_hud_menu.png`
- Claim: `frontend/src/lib/components/WinBreakdown.svelte:94` builds the ways
  count as `{current.ways} ways`, an unconditional plural, so a single-way win
  renders `1 ways`, which is what the strip shows on all three frames.
  `WinBreakdown.svelte:93` builds the adjacent count as
  ``` `x{current.kind}` ``` with an ASCII `x`, which is a further member of the
  MID-02 / Q-26 class in a component rather than in `fsModes.ts`, and a further
  counter-example to Q-26's claim that its enumeration is complete. Both strings
  are also hardcoded English, so both are Q-16 park members.
  Recorded at LOW only because neither is legible at native resolution until
  STT-POPOUTL-A-05 is fixed; the transcription carries that caveat.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:93-94`. Not
  locked.
- Proposed fix: pluralise on the count (`1 way` / `2 ways`) and change the `x` to
  `×`, and route both through the vocabulary layer while the file is open.

## STT-POPOUTL-A-14 LOW The buy feature is called `Bonus Buy` in prose and `Buy Overdrive` as a mode title

- Frames: `reports/screens/stream-test-2026-07-28/108_popout-l_intro_rules.png`, `reports/screens/stream-test-2026-07-28/129_popout-l_paytable_05_overdrive_free_spins.png`, `reports/screens/stream-test-2026-07-28/130_popout-l_paytable_06_bet_modes.png`
- Claim: the intro rules card and the paytable both end on the bullet
  `Bonus Buy: pay 100× your bet to start the feature immediately.`
  (`frontend/src/lib/i18n/translations.ts:1554`), and the sibling string at
  `:1555` reads `Base game and Bonus Buy both return 96.35% RTP. Maximum win
  5,000× bet.`, while the `BET MODES` grid names the same 100x product
  `Buy Overdrive` (`frontend/src/lib/i18n/prose.ts:91`). Naming rather than
  casing, so it sits at the edge of this lens, but it is the same class of drift
  and a player reading both surfaces has to work out they are one feature.
- Where fixable: `frontend/src/lib/i18n/translations.ts:1554,1555`. Not locked.
- Proposed fix: use `Buy Overdrive` in the two prose strings so the name matches
  the mode card and the buy dialog.

## STT-POPOUTL-A-15 LOW Decimal places disagree between figures in one payout column

- Frames: `reports/screens/stream-test-2026-07-28/127_popout-l_paytable_03_symbol_payouts.png`
- Claim: the `H1` card lists `1.5`, `6`, `22` and the `H2` card lists `0.8`, `3`,
  `10` in the same column position on the same screen, so one-decimal and
  no-decimal treatments sit side by side. Recorded at LOW because trailing-zero
  suppression is a defensible house style, but the lens names disagreeing decimal
  formats on one screen and this is one.
- Where fixable: UNKNOWN (the payout values are rendered by
  `frontend/src/lib/components/PaytableModal.svelte`; I did not locate the
  formatter within this pass's source budget).
- Proposed fix: either pad every payout to one decimal place, or record the
  suppression as intended so it stops being re-found.

## Explicit absences, signed

- **No money display clipped, ellipsised or overflowed in any of the 26 frames.**
  I read every money string in the set at native resolution and the tight ones at
  7x: `$50,000.00`, `$0.00`, `$3.90`, `$15.95`, `$16.20`, `$1.00`, `$5.00`,
  `$20.10`, `+$15.10`, `$1.25`, `$100.00`, `$0.22`. The bet pod `$1.00` on
  `110_popout-l_base_idle.png` is the tightest, sitting between two stepper
  buttons, and at 7x it clears both. So this shard contributes **no** fresh
  evidence to TR-115 / TR-086 at the `800x450` viewport.
- **No en dash and no em dash in any player-visible prose in the 26 frames.** The
  prose blocks on `108`, `124`, `125`, `128`, `129` and `130` were read at 4x to
  9x. The only dash-like marks in the set are the `›` bullet chevrons and the `/`
  separators on the `SCAT` card.
- **No quotation marks or apostrophes appear anywhere in the 26 frames**, so
  there is no straight-versus-curly mix to find here. Signed as an absence rather
  than as a pass: the surfaces in this range simply carry no quoted or possessive
  text.
- **No double space observed** in the prose blocks read at magnification. Stated
  with its limit: consecutive spaces collapse in HTML rendering, so a frame
  cannot evidence a double space in the source either way, and this absence is
  worth less than the others.
- **No system font leak found in any prose, heading or numeral surface.** I
  specifically checked the paytable's white lead line against its cyan sub-line
  on `124` at 6x, expecting a family mix, and they are the same face at two
  weights; the heading and the body on `108` are likewise one family. Source
  agrees: `frontend/src/app.css:97-98` points both display and numeric tokens at
  self-hosted Orbitron and `frontend/src/main.ts:2-4` loads 400, 700 and 900.
  The `WIN!` shape difference at STT-POPOUTL-A-06 is parked rather than claimed
  as a leak, for the reason written there.
- **No letter `x` standing in for `×` on the paytable or on the visible part of
  the bet-mode cards.** Measured: on `128` the `×` after `1` is `y229` to `y234`
  against a digit band of `y226` to `y235`, i.e. 60 per cent of digit height and
  raised to the maths axis; on `130` the glyph after `1`, `1.25`, `100` and
  `5,000` is 5 px against 8 px digits and sits one pixel clear of the digit
  baseline. Those are multiplication signs.
  **Recorded precisely so the marshal does not over-read this**: Q-26's actual
  survivors in `prose.ts` are inside the mode BLURBS, for example
  `frontend/src/lib/i18n/prose.ts:90` `about 1.6x the feature trigger rate.
  Debits 1.25x every spin while ON.`, and on frame `130` the OVERBOOST and Buy
  Overdrive blurbs fall below the visible edge of the scroll capture. So this
  shard neither confirms nor refutes Q-26 on the mode cards; it only establishes
  that the cost and max-win figures above the blurb are correct. The letter `x`
  I did find is the win banner's, KNOWN(MID-02), plus a new one at
  STT-POPOUTL-A-13.
- **No shimmy on the banner count-up.** The `.fs-num` per-digit boxes hold across
  `117`, `118` and `119` to within 1 px, which is TR-089 working, and per the
  register that is not a finding. The shimmy at STT-POPOUTL-A-08 is the HUD pod,
  a different surface.
- **The content cut off at the bottom of `125`, `126`, `128` and `130` is the
  scroll position of the capture, not a clipped string.** Each of those frames is
  a scroll step through one long paytable and the cut falls at the modal's
  visible edge, so I have not counted it as an overflow defect.
- **Nothing found on `109`, `111`, `112`, `113`, `114`, `115` and `123`.** Those
  seven frames are spin transitions, dead spins and a modal mid-open; their only
  text is the HUD row already covered, and the HUD pod labels `BALANCE`, `WIN`
  and `BET` measure the same 8 px cap band (`y397` to `y404` for the first two,
  `y385` to `y392` for `BET`, which sits above its stepper row by design) with
  values on a common `y414` to `y427` band on every one of them.

## KNOWN matches

- KNOWN(MID-01): `reports/screens/stream-test-2026-07-28/117_popout-l_transition_bigwin_countup_early.png` shows the banner reading `$10.28` while the HUD WIN pod already reads `$15.95`, on a win that settles at `$16.20` in `reports/screens/stream-test-2026-07-28/119_popout-l_bigwin_settled.png`. Fresh evidence at `800x450`, the same three-frame pattern the ledger predicted for this session.
- KNOWN(MID-02): `reports/screens/stream-test-2026-07-28/117_popout-l_transition_bigwin_countup_early.png`, `reports/screens/stream-test-2026-07-28/118_popout-l_transition_bigwin_countup_late.png` and `reports/screens/stream-test-2026-07-28/119_popout-l_bigwin_settled.png` all render `16x BET` with an ASCII letter. Measured on `119`: the digits `1` and `6` occupy `y165` to `y170` and the following glyph occupies `y166` to `y170`, so it is 83 per cent of digit height and shares the digits' baseline, where the true `×` on `128` is 60 per cent of digit height and raised off it. Same role, two characters, one frame apart in one session.
- KNOWN(Q-27): `reports/screens/stream-test-2026-07-28/128_popout-l_paytable_04_rules.png` and `reports/screens/stream-test-2026-07-28/119_popout-l_bigwin_settled.png` are the first frames to show the Vite scaffold `text-align: center` at `frontend/src/app.css:143` reaching a player surface. The row's stated condition, "visible only if any link or unstyled surface reaches a frame", is wrong: it is inherited application-wide and drives STT-POPOUTL-A-01 and STT-POPOUTL-A-08. The row needs re-rating from "small" to at least HIGH.
- KNOWN(Q-16 park): the parked hardcoded-English strings visible in this range are `Session` and `Mute` on `121` (`HudOverlay.svelte:429` and siblings), the `<th>Scatters</th>` column header on `129` (`PaytableModal.svelte:258`), and the `ways` unit on `118` (`WinBreakdown.svelte:94`). Recorded so the de and ar squads' visibility list has an `en` cross-check; the park's urgency is unchanged by an `en` session.

tree_after: see the shard's owning session; run at close, recorded in the structured return.
