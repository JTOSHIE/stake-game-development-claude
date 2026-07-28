# STC-STRETCH-A, COMPOSITION (stretch, frames 364 to 389)

scope: every frame of the `stretch` session numbered 364 to 389 inclusive, 26 frames,
viewport `1920x800`, lang `en`, per `reports/screens/stream-test-2026-07-28/MANIFEST.json`.
No frame outside the range was opened.

frames_read: 26

**THE STAGE ARITHMETIC, derived first, because every measurement below depends on it.**
`frontend/src/App.svelte:752-753` fixes the design surface at `STAGE_W = 1280`,
`STAGE_H = 720`, and `App.svelte:748` gives the scale as `S = min(vw/1280, vh/720)`. At
`1920x800` that is `min(1.5, 1.1111) = 1.1111`, so the stage renders `1422x800`: it fills
the height exactly and letterboxes about `249 px` on each side. `App.svelte:770` records
that the reel frame is *only 640 of those 1280 units*, that is half the stage.
Confirmation rather than discovery, per convention (l.2): `PaytableModal.svelte:547` sets
`max-width: 1178px`, which predicts a rendered panel of `1178 x 1.1111 = 1309 px` starting
at `x 305`; the frames measure about `1308 px` starting at about `x 305`. Rendered
coordinates below are stated to the nearest few pixels; stage units are exact where cited
from source.

PIL was not available on this machine, so no frame was measured programmatically. Every
coordinate is read off the rendered frame and is written as approximate. Figures taken
from source are cited to `file:line` and are exact.

## STC-STRETCH-A-01 STREAM The reel window renders no cells at all mid-spin and the street scene shows through the grid

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/370_stretch_transition_reels_accelerating.png`
- Claim: at the manifest's `Reels accelerating, about 250ms after spin press`, reel 1
  carries three symbols with its fourth row empty, reel 2 carries two, reel 3 carries one,
  and reels 4 and 5 still carry the five idle pistons of
  `369_stretch_base_idle.png`. The empty region, roughly `x 675 to 1015` by
  `y 330 to 548`, is not a dark cell and not a blur: the cell backing plates are absent
  with the symbols, and the background scene reads straight through, the car's windscreen
  and roofline and the wet road visible inside the reel window.

  Derived from the specification, not from the picture. `GameGrid.svelte:74` declares
  ``` const STRIP = ROWS + 3 ``` with the comment `// 7 slots: [buf, r0..r3, buf, buf]`,
  so the travelling strip carries exactly **one** buffer slot above the four visible rows
  and two below. `GameGrid.svelte:75` sets `REST_Y = -VIS_OFFSET * TILE` with the value
  `-104` written in its own comment, and `GameGrid.svelte:1133` applies that as
  `transform: translateY({REST_Y}px)` on `.reel-strip`. One buffer slot above the window
  means any downward translate greater than one tile, about `104 px`, moves slot 0 past
  the window top and leaves the bottom of the window with **no rendered cell**, because
  `GameGrid.svelte:1134` iterates a fixed `Array(STRIP)` rather than wrapping. The frame
  matches the derivation column by column: reel 1 is short by one row, reel 2 by two, reel
  3 by three, which is a staggered drop of one, two and three tiles against a one tile
  buffer.

  The next frame, `371_stretch_transition_reels_full_speed.png`, is a completely full and
  completely sharp grid, so the sequence a viewer sees jumps from a see-through board
  straight to a settled board. On stream this is the car appearing to drive through the
  reels at the start of every spin.
- Where fixable: `frontend/src/lib/components/GameGrid.svelte:74` (`STRIP = ROWS + 3`),
  `:75` (`REST_Y`), `:1133-1134` (the strip transform and the fixed-length each block).
  Not locked.
- Proposed fix: raise the leading buffer so the strip covers the largest translate the
  spin start uses (`STRIP = ROWS + 6` with three slots above), or clamp the drop translate
  to at most one tile. Either keeps the window covered at every phase.

## STC-STRETCH-A-02 HIGH Every paytable rules bullet has its marker stranded at the far left with its text floating centred, about 390 px away

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/386_stretch_paytable_03_symbol_payouts.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/387_stretch_paytable_04_rules.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/388_stretch_paytable_05_overdrive_free_spins.png`
- Claim: in `387` the six `RULES` bullets and the five `OVERDRIVE FREE SPINS` bullets all
  draw their `›` marker at about `x 345`, hard against the panel's content edge, while the
  bullet text is centred on the panel at about `x 960`. The first rule,
  `Wins pay left to right on adjacent reels starting from reel 1.`, runs from about
  `x 733` to `x 1207`, so its marker sits about `390 px` left of the word it introduces,
  with nothing between. Eleven markers in `387` form a lonely vertical column at the left
  edge of an otherwise centred panel. Same shape in `386` at the `RULES` block and in
  `388` at the free spins block.

  Mechanism: `PaytableModal.svelte:668-669` gives the list item
  `padding-left: 16px; position: relative` and pins the marker with
  `li::before { content: '›'; position: absolute; left: 0; }`, which is correct for
  left-aligned text and wrong for centred text, because the marker is anchored to the
  container edge while the text is not. Neither `.fs-rules` nor `.fs-rules li`
  (`PaytableModal.svelte:667-668`) sets `text-align`, so the centring is inherited. The
  only `text-align: center` I located in the inherited chain is the **Vite scaffold `#app`
  rule at `frontend/src/app.css:138-144`**, `#app { max-width: 1280px; margin: 0 auto;
  padding: 2rem; text-align: center; }`, which is the block KNOWN_OPEN row **Q-27** already
  records as scaffold remnant. See the KNOWN section: Q-27's stated visibility is
  understated. I did not run a browser to confirm the cascade, so the mechanism is stated
  as probable and the observation is stated as certain, per convention (l.6).
- Where fixable: `frontend/src/app.css:143` (remove the scaffold `text-align: center`), or
  defensively `frontend/src/lib/components/PaytableModal.svelte:667` (add
  `text-align: left` to `.fs-rules`). Neither is locked.
- Proposed fix: delete the scaffold `#app` rule at `app.css:138-144` outright, then add
  `text-align: left` to `.fs-rules` so the list is correct regardless of what it inherits.

## STC-STRETCH-A-03 HIGH The OVERDRIVE FREE SPINS table is left aligned under a centred heading, leaving a dead rectangle about 745 by 170 beside it

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/387_stretch_paytable_04_rules.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/388_stretch_paytable_05_overdrive_free_spins.png`
- Claim: the heading `OVERDRIVE FREE SPINS` centres on about `x 960`. The table it heads,
  columns `SCATTERS`, `FREE SPINS`, `INSTANT AWARD` with rows `3 / 8 / 1x`, `4 / 12 / 3x`,
  `5 / 16 / 10x`, spans only about `x 345` to `x 830`, centring on about `x 587`. Heading
  and table are about `373 px` apart on the horizontal. Everything right of the table,
  roughly `x 830 to 1575` by `y 365 to 535` in `387` and `y 145 to 310` in `388`, is empty
  panel: about `745` by `170`, a region larger than the table itself, sitting directly
  under a heading that points at its middle.

  Mechanism, exactly: `PaytableModal.svelte:672` is
  ``` .fs-trig { width: 100%; max-width: 440px; border-collapse: collapse; ... } ``` with
  **no `margin-inline: auto`**. A block with `max-width` and no auto margin hugs the left
  edge of its container. The heading `.fs-heading` at `PaytableModal.svelte:605-609` sets
  no `text-align`, so it takes the inherited centre from `app.css:143`. One element opting
  out of the inherited centring and one not is the whole defect.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:672`. Not locked.
- Proposed fix: add `margin-inline: auto` to `.fs-trig` so the table sits under its own
  heading. One declaration.

## STC-STRETCH-A-04 HIGH The big win band bisects reel rows 2 and 3 through the symbols and cuts the FEATURES control in half

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/376_stretch_transition_bigwin_countup_early.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/377_stretch_transition_bigwin_countup_late.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/378_stretch_bigwin_settled.png`
- Claim: **the band's full-stage width is deliberate and is not the finding.**
  `WinBanner.svelte:339-341` states the intent in its own comment, *full-width neon band,
  stage edge to edge, vertically centred on the grid at stage y=310 - no longer a centred
  box, so reels stay visible above and below*, and `WinBanner.svelte:342-352` implements it
  as `position: absolute; left: 0; right: 0; top: 310px; transform: translateY(-50%);
  width: 100%`. I checked the intent before judging the result, and the result does not
  meet it.

  The band occupies about `y 283` to `y 400` rendered, that is stage `y 257.5` to `y 362.5`
  about the declared centre of `310`. The grid's four rows in stage units run about
  `139.5`, `228`, `316.5`, `405` to `493.5`. So the band's edges land in the **middle of
  row 2 and the middle of row 3**, not on a row boundary: it eats the lower part of row 2
  and the upper part of row 3, leaving half symbols above and below its rules. The comment's
  goal of reels staying visible is met only for rows 1 and 4. The cyan win lines are cut
  with them: in `376` they run into the band's top edge and re-emerge below it.

  Second collision, not covered by the intent at all: the `FEATURES` pill at about
  `x 1325 to 1480`, `y 265 to 313` is bisected. Only the top arc of its magenta border shows
  above the band's cyan rule, in `376`, `377` and `378` alike.
- Where fixable: `frontend/src/lib/components/WinBanner.svelte:342-352` (band geometry).
  Not locked.
- Proposed fix: move the band's centre from stage `y 310` to a row boundary, stage
  `y 316.5`, and cap its height to one row pitch, so it covers exactly one row rather than
  halving two; and either raise the `FEATURES` pill above the band or fade it out for the
  band's duration.

## STC-STRETCH-A-05 HIGH The BET MODES grid resolves to four columns for five modes, leaving a dead region about 920 by 185 with the caption centred over the hole

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/389_stretch_paytable_06_bet_modes.png`
- Claim: row 1 carries `Normal`, `Cruise`, `OVERBOOST`, `Buy Overdrive` across about `x 345`
  to `x 1578`. Row 2 carries `NITRO OVERDRIVE` alone, about `x 345` to `x 640`. The rest of
  row 2, roughly `x 655 to 1578` by `y 370 to 555`, is empty: about `920` by `185`. The
  caption `Max win is quoted against the base bet.` then renders centred at about `x 960`,
  `y 603`, placing it under the empty region rather than under the cards it annotates.

  Derived: `PaytableModal.svelte:690` is
  ``` .fs-mode-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; } ```
  The paytable body's content width is about `1108` stage units (panel `1178` at
  `:547` less the `20px 30px 30px` body padding at `:600` and the panel inset). With
  `minmax(230px, 1fr)` and `gap: 14px`, `auto-fill` seats `floor((1108 + 14) / 244) = 4`
  columns. Five items in four columns is three empty cells. A `230px` floor is what forces
  four; the five modes want five tracks and there is width for them.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:690`. Not locked.
- Proposed fix: replace `auto-fill` with an explicit `repeat(5, 1fr)` above a width
  breakpoint so the five modes occupy one row, and left align the caption
  (`.fs-caption`, `PaytableModal.svelte:647`) to the grid rather than centring it.

## STC-STRETCH-A-06 MEDIUM Six symbol cards in one row, three different label baselines

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/384_stretch_paytable_01_match_symbols_on_adjacent_reels_st.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/385_stretch_paytable_02_ways_to_win.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/386_stretch_paytable_03_symbol_payouts.png`
- Claim: in `386` the first card row holds `WILD`, `SCAT`, `H1`, `H2`, `M1`, `M2`. The four
  right hand name labels sit at about `y 271`; `WILD` sits at about `y 285` and `SCAT` at
  about `y 293`. Three baselines across one row of six cards, a spread of about `22 px`.
  The art above follows: the `H1` wheel, `H2` canister, `M1` gauge and `M2` coil centre at
  about `y 211` while the `WILD` disc centres at about `y 228` and the `SCAT` burst at about
  `y 232`. The second row, `M3`, `L1`, `L2`, `L3`, is internally consistent at about
  `y 519`, which is what makes the first row read as wrong rather than as a style. Same
  offsets in `384` and `385`.

  `PaytableModal.svelte:657` sets `.fs-sym-card img { width: 78px; height: 78px;
  object-fit: contain; }`, so the art box is already fixed and is not the cause. The card
  face at `PaytableModal.svelte:656` is
  ``` .fs-sym-card > .fs-face { padding: 14px 10px; gap: 6px; align-items: center; } ```
  a column flex with a `6px` gap and no fixed row track, so a card whose art renders with
  different internal padding, or whose name row wraps, pushes everything beneath it. `WILD`
  and `SCAT` are the two cards carrying a `.fs-sym-note` (`:664`) instead of the three
  `.fs-pay-row` lines (`:661`), which is the difference between them and their four
  neighbours.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:656` and `:657`. Not
  locked.
- Proposed fix: give the card face an explicit grid with fixed art and name tracks
  (`grid-template-rows: 78px auto 1fr`) so the name row starts at the same offset in every
  card whatever sits below it.

## STC-STRETCH-A-07 MEDIUM The OVERBOOST bet mode card sits about 8 to 10 px higher than its three row mates

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/389_stretch_paytable_06_bet_modes.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/388_stretch_paytable_05_overdrive_free_spins.png`
- Claim: in `389` the four row 1 cards share a top edge at about `y 148` and none of their
  contents share a baseline. The `COST` / `RTP` / `MAX WIN` label strip reads at about
  `y 231` in `Normal`, `Cruise` and `Buy Overdrive`, and about `y 223` in `OVERBOOST`. The
  divider under each card title follows, about `y 215` against about `y 205`; the titles
  themselves about `y 192` against about `y 182`. Bottom margins diverge the other way:
  `OVERBOOST`'s body copy ends at about `y 333`, `Normal` and `Cruise` at about `y 325`,
  `Buy Overdrive` at about `y 317`, against a shared card bottom of about `y 355`. Four
  cards on a shared top edge finishing on four different bottom margins.

  `PaytableModal.svelte:699` is
  ``` .fs-mode-card-name-row { display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap; } ```
  The `flex-wrap: wrap` with no fixed height is the mechanism: a longer name row takes a
  different height and every row beneath it moves. **The casing itself is correct and is
  not a finding**: `CLAUDE.md` records the five mode names as `Normal`, `Cruise`,
  `OVERBOOST`, `Buy Overdrive` and `NITRO OVERDRIVE`, so the two uppercase names are the
  specification, not drift.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:699` and `:695-697`.
  Not locked.
- Proposed fix: set a `min-height` on `.fs-mode-card-name-row` equal to two lines, and give
  `.fs-mode-card > .fs-face` `justify-content: space-between` so the body copy bottom aligns
  across the row.

## STC-STRETCH-A-08 MEDIUM The symbol payout grid resolves to six columns for ten symbols, leaving a two cell hole

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/385_stretch_paytable_02_ways_to_win.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/386_stretch_paytable_03_symbol_payouts.png`
- Claim: ten symbols in a six wide grid gives six then four, so the last two cells of row 2
  are empty. In `386` that region is about `x 1177 to 1575` by `y 393 to 632`, roughly
  `398` by `239`, inside a bordered section beside four populated cards.
  `PaytableModal.svelte:650` is
  ``` .fs-sym-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; } ```
  and `floor((1108 + 12) / 162) = 6`. A five wide grid gives five and five and fills both
  rows exactly at this width. Same root as STC-STRETCH-A-05: the column count is chosen by
  what fits rather than by what divides the item count.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:650`. Not locked.
- Proposed fix: use an explicit `repeat(5, 1fr)` above a width breakpoint, keeping the
  existing `auto-fill` fallback below it and the `120px` narrow override at `:799`.

## STC-STRETCH-A-09 MEDIUM Paytable containers stretch to the full panel width while their contents stay narrow, so several bordered boxes are mostly empty

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/383_stretch_paytable_top.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/384_stretch_paytable_01_match_symbols_on_adjacent_reels_st.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/388_stretch_paytable_05_overdrive_free_spins.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/389_stretch_paytable_06_bet_modes.png`
- Claim: three instances of one pattern. In `383` the `WAYS TO WIN` box runs about `x 345`
  to `x 1575`, about `1230 px`, holding a chip row `1 → 2 → 3 → 4 → 5` spanning only about
  `x 723` to `x 1197`, about `474 px`: the bordered box is about `39%` filled. In `388` the
  `BUY FEATURE` bar (`PaytableModal.svelte:683-684`,
  `.fs-buy { align-self: stretch }` with `justify-content: space-between`) runs the same
  `1230 px` with `BUY FEATURE` at about `x 363` and `$100.00` ending at about `x 1554`, so
  roughly `1000 px` of flat purple sits between two short strings. In `389` the
  `INTERFACE GUIDE` row runs the same `1230 px` holding an icon plus `Spin` plus
  `Start a spin at the current bet.` occupying only about `x 360` to `x 663`. At this
  viewport these read as containers waiting for content rather than as generous spacing.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:600` (the `.fs-pt-body`
  padding and gap) and `:683-684`. Not locked.
- Proposed fix: cap the paytable body's inner content column with a `max-width` of about
  `1000px` and `margin-inline: auto`, so the boxes stop growing past the width their
  contents were designed for.

## STC-STRETCH-A-10 MEDIUM One panel, two alignment systems: centred body copy above, left aligned body copy below

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/383_stretch_paytable_top.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/389_stretch_paytable_06_bet_modes.png`
- Claim: in `383` the lead sentence `Match symbols on adjacent reels starting from reel 1
  (left to right).` is left aligned at about `x 365`, while the caption directly below the
  chip row, `Reels 1, 2 and 3 hold the same symbol (highlighted), which is a match read left
  to right from reel 1. Reels 4 and 5 are not required.`, is centred at about `x 960`. In
  `389` the `INTERFACE GUIDE` row is left aligned at about `x 360` while the caption
  `Max win is quoted against the base bet.` above it is centred at about `x 960`. Same
  panel, same text role, two alignments, and the switch is marked by nothing.

  The source shows the patchwork directly: `PaytableModal.svelte:778` sets
  `.fs-guide-text { ... text-align: left; }` as an explicit override, while `:647`
  (`.fs-caption`) and `:664` (`.fs-sym-note`) explicitly set `center` and `.fs-rules`
  (`:667`) sets nothing at all. Three different postures toward alignment in one
  stylesheet is what produces three different results on one panel.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:647`, `:664`, `:667`,
  `:778`, with the inherited default at `frontend/src/app.css:143`. Not locked.
- Proposed fix: set one explicit alignment on `.fs-pt-body` and delete the per-element
  overrides. Left is the safer choice because it also fixes STC-STRETCH-A-02 and -03.

## STC-STRETCH-A-11 MEDIUM The big win amount plate is sized in `vw` inside a fixed-size scaled stage, so its share of the band changes with window width

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/376_stretch_transition_bigwin_countup_early.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/377_stretch_transition_bigwin_countup_late.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/378_stretch_bigwin_settled.png`
- Claim: `WinBanner.svelte:406-407` sizes the amount plate as
  ``` width: min(46vw, 640px); ... max-width: min(46vw, 640px); ```
  `vw` is a viewport unit; every other element on this surface is in stage units inside the
  fixed `1280x720` surface of `App.svelte:752-753`. The two do not track each other. At the
  `stretch` viewport `46vw = 883px`, so the `640px` arm wins and the plate is `640` of the
  band's `1280` stage units, **50%**. At the `Desktop` session's `1200x675` it is
  `46 x 12 = 552` units, **43%**. At `Popout S` `400x225` it is `184` units, **14%**. Same
  component, same band, three different internal proportions, none of them chosen. Since
  `.c1-amount` also carries the autofit action that scales the font to its box
  (`WinBanner.svelte:398-402`), the amount's rendered size relative to the band moves with
  it. My frames can only witness the `50%` case; the arithmetic is derived from source per
  convention (l.1) and the other sessions' frames belong to other squads.
- Where fixable: `frontend/src/lib/components/WinBanner.svelte:406-407`. Not locked.
- Proposed fix: replace `min(46vw, 640px)` with a stage-unit value, `640px` flat or a
  percentage of the band, so the plate holds one proportion at every viewport.

## STC-STRETCH-A-12 MEDIUM The HUD menu opens over the win breakdown and bisects it mid string

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/379_stretch_transition_menu_opening.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/380_stretch_hud_menu.png`
- Claim: the menu panel (`PAYTABLE`, `Session`, `Mute`, `MUSIC 50%`, `SOUND 80%`) occupies
  about `x 680 to 955` by `y 462 to 632`. The win breakdown bar beneath it runs about
  `x 675` to `x 1235` at about `y 558`. The panel's right edge lands part way through that
  bar's text, so `380` shows `ways  $16.00` with the leading symbol code and count hidden,
  and `379` shows `ways  $0.20`. A truncated money string is what a viewer sees.
  `WinBreakdown.svelte:115-119` puts the bar at `position: absolute; ... z-index: 45`, and
  the desktop menu at `HudOverlay.svelte:816` sits above it, so the menu wins the stack and
  slices the bar rather than replacing it. The panel's internal padding is also uneven,
  about `16 px` above `PAYTABLE` against about `8 px` below the `SOUND` row.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:812-816` (the desktop menu)
  and `frontend/src/lib/components/WinBreakdown.svelte:115-119` (the bar's stacking).
  Neither is locked.
- Proposed fix: hide the win breakdown while `showMenu` is true (the flag already exists at
  `HudOverlay.svelte:125`), so the bar is suppressed rather than sliced.

## STC-STRETCH-A-13 MEDIUM The control cluster's optical centre sits about 60 px right of the reel frame's centre

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/369_stretch_base_idle.png`
- Claim: the reel frame centres on about `x 960`, which `App.svelte:801` states is true by
  construction. The control row does not. Its leftmost element, the round turbo button,
  starts at about `x 505`; its rightmost, the reset circle, ends at about `x 1534`; so the
  cluster centres at about `x 1020`, about `60 px` right of the frame. The near miss on the
  left is the tell: the HUD panel's left edge at about `x 590` sits about `15 px` outside
  the frame's left edge at about `x 605`, close enough to read as an intended alignment and
  far enough to read as a failed one, while on the right the cluster overshoots the frame by
  about `219 px`. Two dominant horizontal masses stacked directly on each other, not
  sharing a centre line.
- Where fixable: UNKNOWN. The desktop control row is inside
  `frontend/src/lib/components/HudOverlay.svelte` (the `fs-` branch around `:812`), but I
  did not locate the rule that positions the cluster within my source budget. Not locked.
- Proposed fix: centre the whole cluster, spin and reset circles included, on the stage
  centre, or align the HUD panel's left edge exactly to the frame's so the offset reads as
  deliberate.

## STC-STRETCH-A-14 MEDIUM The `WIN!` label lands on top of the symbol it is celebrating and on the win line

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/375_stretch_win_presentation.png`
- Claim: `WIN!` renders at about `x 900 to 1022`, `y 318 to 362`, the grid's fixed centre.
  The winning piston in row 2 column 3 occupies about `x 930 to 990`, `y 270 to 330`, so the
  label's cap height cuts the bottom of that symbol. The win line polyline running from
  about `(965, 205)` to about `(1075, 375)` passes through the same band. Separately, cells
  off the win are dimmed hard enough that fourteen of twenty read as flat dark rectangles,
  so at the moment of a win about seventy per cent of the board goes to near black. The
  label is placed by grid geometry rather than by what is under it.
- Where fixable: UNKNOWN. Rendered by `WinCelebration.svelte` or `WinDisplay.svelte` by
  name; not opened, source budget spent. Neither is locked.
- Proposed fix: offset the label to whichever grid row carries no winning cell, or give it
  a backing plate so it stops reading as printed over the symbol art.

## STC-STRETCH-A-15 MEDIUM Three consecutive settled spins show an identical board

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/371_stretch_transition_reels_full_speed.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/372_stretch_dead_spin_1_settled.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/373_stretch_dead_spin_2_settled.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/374_stretch_dead_spin_3_settled.png`
- Claim: the manifest labels `372`, `373` and `374` `Dead spin 1 of 3 settled`,
  `Dead spin 2 of 3 settled` and `Dead spin 3 of 3 settled`, three separate spins. All three
  render the identical twenty symbol board, cell for cell, and so does `371`, captured at
  full spin speed. Row 1 left to right in all four: coil, red canister, piston, gold hex
  nut, piston. Rows 2 to 4 match cell for cell. **Stated precisely: it is the BOARD that is
  identical, not the file.** `md5` on the four PNGs returns four different digests
  (`4bf159f9...`, `9c62cd56...`, `4fb4e027...`, `83d61d96...`) because the rain and the
  scene animate behind the grid, so the frames are genuinely four captures and the board
  identity is a real observation rather than a duplicated file. Judged as a sequence, which
  is what a viewer sees, three spins landing on exactly the same board is the most obviously
  wrong thing in this run after finding 01.
- Where fixable: UNKNOWN. Not a layout surface.
- Proposed fix: PARK(the cause must be established before a fix: it may be the capture
  harness replaying one round rather than the game repeating a board, and those want
  different fixes. Flagging for the marshal because it crosses squad lenses.)

## STC-STRETCH-A-16 MEDIUM One bet mode card writes `400x` and `5,000×` beside each other, and a third surface writes `x5`

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/389_stretch_paytable_06_bet_modes.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/378_stretch_bigwin_settled.png`
- Claim: on the `NITRO OVERDRIVE` card the `COST` cell reads `400x` with the ASCII letter and
  the `MAX WIN` cell reads `5,000×` with U+00D7, about `150 px` apart on the same line. Same
  split on all five cards: `1x` / `5,000×` on `Normal`, `1x` / `5,000×` on `Cruise`,
  `1.25x` / `5,000×` on `OVERBOOST`, `100x` / `5,000×` on `Buy Overdrive`.

  A third surface, not in Q-26's enumeration and not `WinBanner.svelte:205`:
  `frontend/src/lib/components/WinBreakdown.svelte:93` builds the count as
  ``` <span class="wb-count">x{current.kind}</span> ``` with the ASCII letter, which is the
  `x5` visible on frame `378` and `x4` on `377`. Recorded separately from KNOWN(Q-26) below
  because Q-26 names four blurb instances in `fsModes.ts` and these are neither: the mode
  `COST` cells are tabular, and `WinBreakdown.svelte` is a component. This is the same shape
  of miss MID-02 records, a row written to catch an incomplete sweep being itself
  incompletely swept, now with a third and fourth survivor.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:93` (not locked), plus
  wherever the mode `COST` cell is composed. `games/future_spinner/**` is LOCKED, but the
  mode costs render from `frontend/src/lib/config/fsModes.ts`, which is not.
- Proposed fix: change the ASCII `x` to `×` at `WinBreakdown.svelte:93` and in the cost cell
  composition, and widen Q-26's enumeration from the two files it searched to the whole
  `frontend/src` tree.

## STC-STRETCH-A-17 MEDIUM The win breakdown reads `1 ways` and its unit is a hardcoded English literal

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/377_stretch_transition_bigwin_countup_late.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/379_stretch_transition_menu_opening.png`
- Claim: frame `377` renders the breakdown as `L3  x4  1 ways  $0.20`. `1 ways` is
  ungrammatical, on the surface that appears at the end of every winning spin.
  `WinBreakdown.svelte:94` is
  ``` <span class="wb-ways">{current.ways} ways</span> ``` : the count is interpolated and
  the word ` ways` is an English literal beside it with no plural rule and no locale route.
  That literal shape, a bare literal beside an interpolation, is the exact blind spot
  `KNOWN_OPEN.md` records for `locale_completeness_check.mjs`, so no gate will report it.
  Adjacent to this lens rather than inside it; recorded because it is on my frames and
  because the gate cannot see it.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:94`. Not locked.
- Proposed fix: route through the vocabulary layer with a plural form, `{$tr('waysCount',
  { n: current.ways })}`, which fixes the grammar and the sixteen-locale gap in one change.

## STC-STRETCH-A-18 LOW The paytable's scroll container slices text through the middle of the glyphs at its bottom edge

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/383_stretch_paytable_top.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/385_stretch_paytable_02_ways_to_win.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/388_stretch_paytable_05_overdrive_free_spins.png`
- Claim: at about `y 768` the panel ends with a hard edge that cuts whatever is there in
  half. In `383` the `SCAT` card's second line `/ 12 / 16 free spins` is sliced through the
  x-height; in `385` the `4x  0.6` payout row; in `388` the `Normal` card's
  `Spins trigger on 3+ scatters.` A cut edge is normal for a scroller; a cut through
  letterforms with no fade and no mask is what makes it read as clipped rather than as
  scrolled, and `PaytableModal.svelte:548` (`max-height: 662px`) means this viewport meets
  it on every section.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:596-600` (`.fs-pt-body`,
  `overflow-y: auto`). Not locked.
- Proposed fix: add a short `mask-image` fade at the scroll container's bottom edge so the
  cut reads as continuation.

## STC-STRETCH-A-19 LOW The interface block sits high in the design surface: about 15 px above the title, about 83 px empty below the controls

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/369_stretch_base_idle.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/372_stretch_dead_spin_1_settled.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/374_stretch_dead_spin_3_settled.png`
- Claim: in `369` the `FUTURE SPINNER` title's glyph tops sit at about `y 15`, so clearance
  to the top edge is about `15 px`. The lowest interface element, the SPIN ring, bottoms out
  at about `y 717`, leaving about `83 px` below. The block centres at about `y 366` against
  a viewport centre of `400`, and the two margins differ by a factor of about five and a
  half. The title reads as pinned to the edge rather than framed, and it is the first thing
  a stream overlay's crop would take.

  **Corrected after the source pass, and reported at LOW because of it.** This is NOT
  introduced by the stretch viewport. `App.svelte:748` scales by `min(vw/1280, vh/720)`,
  which at `1920x800` is height-limited, so the `720`-unit stage fills the `800 px` height
  exactly and the vertical framing here is the framing at every viewport. In stage units the
  clearances are about `13.5` above and about `75` below, and they are constants of the
  design surface. My frames witness it; they do not make it a stretch defect.
- Where fixable: `frontend/src/App.svelte:2185-2200` (the `1280x720` stage and its child
  offsets). Not locked.
- Proposed fix: PARK(a design-surface change affects every viewport and every prior capture
  set, so it is larger than small and is an art call, not a mechanical one.)

## STC-STRETCH-A-20 LOW The splash hero occupies about a quarter of the rendered stage

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/364_stretch_transition_splash_entrance.png`,
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/365_stretch_splash.png`
- Claim: the `WE ROLL SPINNERS` badge spans about `x 790` to `x 1130`, about `340 px`, which
  is about `24%` of the `1422 px` rendered stage and about `18%` of the `1920 px` viewport.
  `TAP TO CONTINUE` sits at about `y 623`, centred. Either side there is about `790 px` of
  near black carrying only faint speed streaks. The badge is competently centred,
  horizontally on about `x 960` and vertically with the tap prompt at a group centre of
  about `y 417` against a viewport centre of `400`, so the composition is not wrong so much
  as under scaled: the first surface a viewer sees at `1920x800` is a small badge in a large
  empty field.
- Where fixable: `frontend/src/lib/components/HeroSplash.svelte` (not opened, source budget
  spent). Not locked.
- Proposed fix: PARK(scale is an art call). If taken, cap the badge on the shorter viewport
  dimension with a higher ceiling so wide-short viewports get a larger mark.

## STC-STRETCH-A-21 LOW Two frames labelled as mid transition show a fully settled surface

- Frames:
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/364_stretch_transition_splash_entrance.png`
  against `365_stretch_splash.png`, and
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/382_stretch_transition_paytable_opening.png`
  against `383_stretch_paytable_top.png`
- Claim: the manifest describes `364` as `Splash mid-entrance, about 600ms after load` and
  `382` as `Paytable mid-open`. Both render at full opacity, full scale and full position,
  visually indistinguishable from their settled siblings except for background streak
  positions in the splash pair. The files are genuinely distinct captures, `md5`
  `f3ef1a1a...` against `e19927f2...` for the paytable pair, so this is a timing result and
  not a duplicated file. The consequence for this audit is that there is no transition state
  in the range for this lens to assess on those two surfaces, which means my pass says
  nothing about how they arrive. Recorded so the gap is on the record rather than read as a
  pass.
- Where fixable: UNKNOWN. A capture harness question, not a frontend one.
- Proposed fix: PARK(for the harness owner: sample the transition earlier, or declare these
  two surfaces as having no captured transition.)

## Explicit absences, signed

Signed for all 26 frames of `stretch` `364` to `389`, viewport `1920x800`, lang `en`.

- **No element is cut off by the left, right or top viewport edge on any frame in the
  range.** Checked on every frame: the title band, all four reel frame brackets, the
  `FEATURES` pill, the HUD panel and both circular buttons, the big win band's two end
  labels, and the paytable panel's four corners and its `X` control. The only hard cut is
  the paytable's own scroll edge at the bottom, reported as STC-STRETCH-A-18, and the two
  occlusions reported as STC-STRETCH-A-04 and -12, which are overlays rather than edge
  clipping.
- **No money readout clips, ellipsises or overflows its pod anywhere in the range.**
  `$50,000.00` in `BALANCE`, `$0.00`, `$3.90`, `$15.95` and `$16.20` in `WIN`, `$1.00` in
  `BET` all sit inside their pods with visible side padding across frames `369` to `381`;
  the band amounts `$10.69` and `$16.20` sit well inside a plate that
  `WinBanner.svelte:406` sizes at `640` stage units against an amount about `260 px` wide.
  So **TR-115 / TR-086 is not re-observed on this shard's frames.** This shard is not
  evidence either way at other magnitudes: the `640`-unit plate has about `2.4x` the width
  the widest amount here needs, so the fit failure would appear at larger figures than any
  frame in this range carries.
- **No replay surface appears in the range**, so TR-114 is neither confirmed nor
  contradicted here. Checked all 26 frames for a replay pod or replay banner.
- **Q-34 cannot be corroborated from this shard.** `Cruise` appears in title case on the bet
  modes card in `389`; no HUD mode badge renders on any frame in the range, because the
  session runs in base mode throughout `364` to `389`, so there is no `CRUISE` to compare it
  against here.
- **Q-16 park is not evidenced by this shard.** This is an `en` session, so the English
  strings visible in `380` (`PAYTABLE`, `Session`, `Mute`, `MUSIC`, `SOUND`) and `383` to
  `389` (`SYMBOL PAYOUTS`, `RULES`, `INTERFACE GUIDE`, `BET MODES`) carry no localisation
  signal. Listed only so the de and ar squads know these surfaces are on stream frames. The
  one string I did open a row for, ` ways` at STC-STRETCH-A-17, is opened for its grammar,
  which is wrong in English too.
- **No autoplay panel and no infinity glyph appears in the range**, so Q-07 is untouched.
  The autoplay menu is frame `394`, outside this shard.
- **No numeric shimmy can be judged from stills**, so TR-089's open question about other
  numeric surfaces is not answered by this shard in either direction.
- **No asymmetric padding on the two modal surfaces that most invite it.** The intro rules
  card in `367` centres on about `x 959`, `y 399` against a viewport centre of `960, 400`,
  with about `29 px` left and `28 px` right inner padding. The session information dialog in
  `381` centres on about `x 960`, `y 398`, with about `25 px` left and `26 px` right. Both
  correct, recorded as correct.
- **The symbol card gutters are even.** Across the six card row in `386`: about
  `18, 18, 18, 19, 18` px. Not a finding.
- **The big win band's own two labels are symmetric.** `BIG WIN` about `195 px` from the
  band's left edge and `16x BET` about `195 px` from its right edge, in `376`, `377` and
  `378` alike. The band's faults are its vertical placement and what it covers, reported as
  STC-STRETCH-A-04, not its internal padding.
- **The left and right letterbox bands are not bare.** `App.svelte:818` records that the
  scene elements are *native-DOM elements below the canvas, not part of the 1280 canvas*,
  and the frames confirm it: the city art reaches `x 0` and `x 1920` on every in-game frame,
  so the roughly `249 px` of stage letterbox on each side carries painted scene. I looked
  for this specifically because a bare band would have been the largest finding available at
  this viewport, and it is not there.

## KNOWN matches

- KNOWN(MID-01): `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/376_stretch_transition_bigwin_countup_early.png` shows the band reading `$10.69` while the HUD `WIN` pod reads `$15.95`, on a win settling at `$16.20` in `377` and `378`. This is the `stretch` session's instance of the three frame pattern MID-01 predicts in every session, and it lands within a few cents of the ledger's `013` figures (`$10.29` / `$15.95`).
- KNOWN(MID-02): `376_stretch_transition_bigwin_countup_early.png`, `377_stretch_transition_bigwin_countup_late.png` and `378_stretch_bigwin_settled.png` all render the unit as `16x BET` with the ASCII letter, per `WinBanner.svelte:205`.
- KNOWN(Q-26): `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/389_stretch_paytable_06_bet_modes.png` renders all four enumerated `fsModes.ts` blurb instances on one screen: `about 1.6x the feature trigger rate`, `Debits 1.25x every spin while ON.`, `1.25x` in the `OVERBOOST` cost cell, and `meter pre-revved to 5x.` Q-26 is therefore confirmed player-visible on a stream frame, which the row records as the condition for it being a Wave 3 fix candidate. The tabular `COST` cells and `WinBreakdown.svelte:93` are logged separately at STC-STRETCH-A-16 because they are outside the row's enumeration.
- KNOWN(Q-26): `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/387_stretch_paytable_04_rules.png` mixes both glyphs inside a single view: `1x`, `3x`, `10x` in the `INSTANT AWARD` column and `a 1x, 3x, or 10x multiplier` in the rules copy, against `capped at 5,000× your total bet`, `pay 100× your bet` and `Maximum win 5,000× bet` in the same panel.
- KNOWN(Q-27), **and the row's stated visibility is understated, which the marshal should carry forward.** Q-27 records the Vite scaffold remnants in `app.css` as `Visible only if any link or unstyled surface reaches a frame`. That is true of the indigo link colour at `app.css:115` and the `#242424` background at `:105`, neither of which appears on my frames. It is not true of the fourth remnant. `app.css:138-144` is the scaffold `#app { max-width: 1280px; margin: 0 auto; padding: 2rem; text-align: center; }`, and its `text-align: center` is the most probable source of the inherited centring behind STC-STRETCH-A-02, STC-STRETCH-A-03 and STC-STRETCH-A-10, which are the two HIGH findings and one MEDIUM on the most-inspected non-game surface in the title. Fresh evidence: `387_stretch_paytable_04_rules.png` and `383_stretch_paytable_top.png`. Stated as probable rather than proven because I did not run a browser to confirm the cascade; the observation on the frames is certain either way, and confirming the cascade is one devtools read.

tree_after:

**READ THIS LINE FIRST: A COMMITTED EVIDENCE PNG IS MODIFIED IN THE WORKING TREE.**
`git status --porcelain` reports `M reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png`.
That is a tracked frame in the committed capture set, dirtied during this wave. It is
**not mine**: frame `188` is `popout-s`, outside my assigned range of `364` to `389`, and
this squad ran no project script and issued no write outside its own shard. This is the
exact failure convention **(h.1)** was written for, and the exact shape of **SA-012**, where
`anticipation_proof.mjs` screenshotted straight into a committed evidence directory and
silently modified four PNGs. Evidence a casual re-run can overwrite is not evidence. The
marshal should restore it from HEAD (`git checkout -- reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png`)
and establish which squad or script wrote it **before** consolidating, because if `188` was
rewritten then any shard that judged it judged a frame that is no longer the one at
`d9bdf22`.

Verbatim output:

```
 M reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png
?? reports/qa/stream_test/shards/STC-MOBILEL-B.md
?? reports/qa/stream_test/shards/STC-MOBILEM-B.md
?? reports/qa/stream_test/shards/STC-MOBILES-A.md
?? reports/qa/stream_test/shards/STC-MOBILES-B.md
?? reports/qa/stream_test/shards/STC-STRETCH-A.md
?? reports/qa/stream_test/shards/STC-STRETCH-B.md
?? reports/qa/stream_test/shards/STM-DESKTOP.md
?? reports/qa/stream_test/shards/STM-LAPTOP.md
?? reports/qa/stream_test/shards/STM-MOBILEM.md
?? reports/qa/stream_test/shards/STM-MOBILES.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STM-STRETCH.md
?? reports/qa/stream_test/shards/STT-DESKTOP-A.md
?? reports/qa/stream_test/shards/STT-DESKTOP-B.md
?? reports/qa/stream_test/shards/STT-LAPTOP-B.md
?? reports/qa/stream_test/shards/STT-POPOUTS-A.md
?? reports/qa/stream_test/shards/STT-POPOUTS-B.md
```

`?? reports/qa/stream_test/shards/STC-STRETCH-A.md` is mine, untracked, as expected. The
other sixteen `??` rows are other squads' shards, not mine and not my problem. Nothing is
DELETED.
