# STC-POPOUTS-3, composition (popout-s, frames 191 to 207, 1600px upscaled)
supersedes: STC-POPOUTS-B.md (the part of it covering frames 191 to 207; frames 183 to 190 of that shard, and the whole of STC-POPOUTS-A.md, belong to sibling squads and are named as out of range below)
scope: the `popout-s` frames numbered 191 to 207 inclusive, 17 frames, session `Popout S`, native viewport `400x225`, lang `en`, read from `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`
frames_read: 17

**HOW THE FIGURES IN THIS SHARD WERE TAKEN, so they can be checked.** Every upscaled
frame is `2844x1600` against a native CSS viewport of `400x225`, so one CSS pixel is
`1600 / 225 = 7.111` upscaled pixels. **All pixel figures below are in the upscaled
`2844x1600` frame unless a CSS-pixel equivalent is given beside them.** They were read by
inflating the PNG IDAT stream and unfiltering it in plain Python, then sampling the raster
directly. That is a different decode path from the superseded shard's two (a raster read at
1x, and an ffmpeg rgb24 dump), so where this shard agrees with a figure in
`STC-POPOUTS-B.md` the agreement is from an independent input in the sense convention
(l.4) requires. No project script was run and nothing under `reports/screens/` was written.

## STC-POPOUTS-3-01 STREAM The Overdrive instrument column is cut by the right viewport edge, and the cut lands inside the money value

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/193_popout-s_transition_feature_entry_fade.png`, `194_popout-s_feature_entry_card.png`, `195_popout-s_transition_feature_starting.png`, `196_popout-s_feature_run_1.png`, `197_popout-s_feature_run_2.png`, `198_popout-s_feature_run_3.png`, `199_popout-s_feature_run_4.png`, `200_popout-s_feature_run_5.png`, `201_popout-s_feature_run_6.png`, `206_popout-s_transition_maxwin_collect_fade.png`, `207_popout-s_post_collect_base.png` (all in the upscaled directory)
- Claim: in `194` the **final pixel column of the raster, x `2843`**, carries live ink in
  twelve separate vertical runs. Classified by colour, they are: `y 121..165` in
  `(148,167,188)`, the tachometer's brushed bezel; `y 696..703`, `y 896..903` and
  `y 1095..1102` in `(47,202,204)`, `(47,196,201)` and `(47,189,195)`, the three instrument
  plates' cyan edges; and **`y 974..1039` in `(255,213,74)`, which is the yellow of the
  TOTAL WIN numeral**. So the cut does not merely graze the panel, it passes through a
  money figure: the value reads `$10.6` and then the frame ends, with the following glyph
  severed down its stroke. The three labels render as `OVERDRIVE FR`, `TOTAL W` and
  `MULTIPLI`. `206` and `207` show the same column with the value reading `$2.8`.
  The tachometer above the plates is bisected by the same edge and shows roughly its left
  half. This is a settled state, not a transition artefact: `194`, `196` to `201` and `207`
  are all `phase: state` in `reports/screens/stream-test-2026-07-28/MANIFEST.json`.
- Resolution note: VISIBLE AT BOTH. The clipping itself was legible natively and the
  superseded shard reported it. What is NEW AT 1600PX is the colour identification of the
  ink in the last column, which is what turns "the panel is tight against the edge" into
  "a dollar value is severed mid glyph".
- Where fixable: **VERIFIED AFTER THE WRITE.**
  `frontend/src/lib/components/BonusInstrumentColumn.svelte:113-120`, `.instrument-column`,
  ``position: absolute; left: 1000px; top: 96px; width: 262px; z-index: 60``, with the
  comment at `:111-112` stating the intended bounds as *x 1000..1262* in as many words;
  and `frontend/src/App.svelte:747-752` for the stage transform. Neither locked.
- Proposed fix: PARK(the mechanism is contested and guessing it would put a wrong cause in
  the ledger). `STC-POPOUTS-B-02` derives that the column's declared right edge should land
  at native x `394.4` of `400`, which contradicts eleven frames; that contradiction must be
  resolved by measuring the effective transform live before the column is relaid.

## STC-POPOUTS-3-02 STREAM The NITRO OVERDRIVE buy dialog states a `$400.00` price and contains no CONFIRM, no CANCEL, no close control and no title anywhere inside its own border

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/192_popout-s_dialog_nitro_overdrive.png`, `191_popout-s_transition_dialog_nitro_overdrive_opening.png`
- Claim: measured on `192`. The dialog's magenta border encloses `x 85..2758` and
  `y 80..1519`, so the modal itself is **exactly symmetric in the viewport**: left margin
  `85`, right margin `85` (`2843 - 2758`), top margin `80`, bottom margin `80`
  (`1599 - 1519`). Inside it there are exactly three things: a symbol tile, a three column
  stat strip whose magenta bracket encloses `x 264..2579`, `y 761..1335`, and the text
  `your bet?`.
  - **Below the stat strip, the only ink in the entire dialog is `your bet?`**, occupying
    `x 1180..1664`, `y 1336..1426`. Every row from `y 1432` down to the dialog's own bottom
    border at `y 1515` is empty across the full `x 95..2748` span: **83 upscaled px, 11.7
    CSS px, of nothing where the action row belongs.**
  - **Above the symbol tile there is no title.** Rows `y 190` to `y 380` carry **zero**
    pixels brighter than 200 anywhere across `x 95..2748`. The first ink below the border
    glow is the tile itself at `y 389`.
  - The consequence is that `192` and its sibling `190_popout-s_dialog_buy_overdrive.png`
    are the same composition distinguished only by `$400.00` against `$100.00`: nothing in
    either frame names the mode being bought, and nothing in either frame offers a way to
    accept or decline it.
- Resolution note: VISIBLE AT BOTH for the headline. NEW AT 1600PX for the two negative
  measurements, which are the part that matters: at native the missing controls could be
  argued to be dim or antialiased away, and at 1600px they are demonstrably not rendered.
- Where fixable: **VERIFIED AFTER THE WRITE, against the file rather than carried forward
  from the superseded shard.** `frontend/src/lib/components/BuyBonus.svelte:170-174` is
  `.buy-modal`, ``width: min(94vw, 460px); max-height: 90dvh; overflow-y: auto; padding:
  22px 24px 24px``; the action row's markup is `:141-146` (`.buy-actions` holding
  `.buy-cancel` and `.buy-confirm`) and its rule is `:247`,
  ``display: flex; gap: 10px; margin-top: 16px``, an ordinary in-flow child of the scroll
  box with nothing pinning it. At `225px` of viewport height `90dvh` is about `202px` and
  the stack above the action row is a title, a paragraph, a what-you-get block, a symbol
  preview and the three column strip, so the row is below the fold and the only affordance
  saying so is the platform's overlay scrollbar. Not locked.
- Proposed fix: lift `.buy-actions` out of the scroll region as a pinned footer of
  `.buy-modal` so both buttons are on screen at every viewport height, and clamp the modal's
  padding and fixed type steps below about 480px of viewport height so the title survives too.

## STC-POPOUTS-3-03 STREAM The spin control's outline is cut by the bottom viewport edge, which the native pass signed as an absence

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/203_popout-s_post_feature_base.png`, `206_popout-s_transition_maxwin_collect_fade.png`
- Claim: in `203`, the **final pixel row of the raster, `y 1599`**, carries a run of
  **166 px of pure `(255,255,255)` from `x 2548` to `x 2713`**, centred under the spin
  control (whose body spans roughly `x 2474..2787` at `y 1445`). The run is the **same 166
  px wide at `y 1597`**, so the stroke it belongs to has not begun to close when the
  viewport ends: a rounded rect's bottom arc narrows toward zero, and this one is still at
  full width on the last row available to it. The control's white outline therefore
  terminates at or beyond the frame boundary rather than inside it. `206` shows content in
  the same final row at `x 2460..2730`. For comparison, in `207` the lowest lit row under
  the same control is `y 1592`, which is **7 px, one CSS pixel**, of clearance: even the
  frame that is not cut has none.
  In the same bar the left icon button's bottom border sits at `y 1570`, so the two ends of
  the control bar do not share a bottom edge and the discrepancy of at least **29 px
  (4.1 CSS px)** falls entirely on the control the player presses most.
- Resolution note: NEW AT 1600PX. A two-native-pixel overrun is a sub-pixel event in a
  120-to-334-token thumbnail; it is not resolvable there, which is precisely why the native
  pass signed the opposite (see the reconciliation section).
- Where fixable: **LOCATED AFTER THE WRITE.**
  `frontend/src/lib/components/HudOverlay.svelte:1077`, the `.m-hud` profile in force at
  this viewport (its `.m-spin` at `:1208` is `width: 44px; height: 40px; border-radius:
  10px`, a rounded rect, which is what the frames show and which rules out the circular
  `.fs-spin` at `:1524`, `.p-spin` at `:2106` and `.c-spin` at `:2344`). The rule reads
  ``height: 44px; padding: 0 4px 0 2px;`` and **declares no bottom padding at all**. The
  arithmetic then closes exactly: a `40px` control centred in a `44px` bar has `2px` below
  it, `.m-spin::after` at `:1215` is ``inset: -3px``, which extends the control's own box
  `3px` past its edge on every side, and `.m-spin`'s ``box-shadow: 0 0 12px`` at `:1213`
  extends further still. The bar's bottom edge is the viewport's bottom edge, so anything
  the control paints beyond `2px` has nowhere to go. Not locked.
- Proposed fix: give `.m-hud` a bottom padding at least equal to the control's overflow,
  `padding: 0 4px 3px 2px` as the minimum and more if the glow is to be preserved, or drop
  the `::after` extension and grow `.m-spin` itself so the hit target is the painted box.
  Either way the bar's height must then account for it.

## STC-POPOUTS-3-04 HIGH The max win unit does not sit on the numeral's baseline, and the native pass refuted exactly this claim on a mismeasurement

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/205_popout-s_maxwin_celebration.png`, `204_popout-s_transition_maxwin_overlay_fade.png`
- Claim: measured on `205` by column scan, so descenders are separated from baselines
  rather than folded into a bounding box.
  - The final `0` of `5,000`, sampled at columns `x 1640` through `x 1780`, occupies
    `y 739..995` in every one of them. **The numeral's baseline is `y 995`.**
  - `BET`, sampled at columns `x 2000` through `x 2135`, occupies `y 905..971` in every one
    of them. **The unit's baseline is `y 971`.**
  - **The unit therefore sits 24 px, 3.4 CSS px, above the numeral's baseline**, on a
    surface whose whole job is one line of type.
  - The `×` between them occupies `y 868..936`, so its foot is a further **35 px** above
    `BET`'s baseline: three glyph runs on one line, three different bottom edges.
  - Horizontally the numeral's yellow ends at `x 1838`, the `×` runs `x 1886..1955` and
    `BET` starts at about `x 1995`. The gaps are **48 px** and **40 px**, so the
    multiplication sign is very nearly equidistant between the number and the word and
    binds to neither.
  - **Why the native pass got the opposite answer.** `STC-POPOUTS-B-07` recorded, as a
    withdrawn candidate, that *the unit is NOT set at mid height (the unit's ink runs y 122
    to 146 against the numeral's 104 to 145, so the two baselines agree to within about
    1px)*. Converting mine to that 400px space: the numeral's full yellow bounding box does
    run to `y 1038`, which is `146.0`, and the unit's to `y 971`, which is `136.6`. But
    `1038` is **the comma's descender in `5,000`**, not the digits' baseline; the digits
    stop at `995`, which is `139.9`. The native figure compared a descender against a
    baseline and concluded they agreed. They do not.
- Resolution note: NEW AT 1600PX. A 24 px offset here is 3.4 native pixels and under 2
  pixels at thumbnail scale, and separating a comma's descender from a digit baseline needs
  the column scan that only full resolution allows.
- Where fixable: **VERIFIED AFTER THE WRITE.**
  `frontend/src/lib/components/MaxWinCelebration.svelte:309` (`.c1-max-x`) and `:316`
  (`.c1-max-betlabel`), against `:295-300` (`.c1-max-multwrap`, whose `:297` really does
  declare ``align-items: baseline``) and `:365-369` (the `@media (max-width: 500px)` branch,
  which is in force at `400px` and sets `.c1-max-mult` to `50px`, `.c1-max-x` to `24px` and
  `.c1-max-betlabel` to `13px`). The markup is `:155` and `:159`. Not locked.
- Proposed fix: drop `align-self: flex-end` from `.c1-max-x` and `.c1-max-betlabel` and let
  the container's declared `align-items: baseline` do the work, replacing the two `em`
  `padding-bottom` values with one shared `px` nudge if an optical correction is still
  wanted. This is the same two rules `STC-POPOUTS-B-13` names; the third leg, the unit
  against the NUMERAL, is what this entry adds.

## STC-POPOUTS-3-05 HIGH The max win celebration has no container and clears the top of the viewport by 7 CSS px, with top and bottom margins in a 1:2 ratio

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/205_popout-s_maxwin_celebration.png`, `204_popout-s_transition_maxwin_overlay_fade.png`
- Claim: in `205` the first near-white title pixel is on row **`y 50`** of `1600`, which is
  **7.0 CSS px** of clearance above `MAX WIN REACHED!` on a `225` px viewport. The COLLECT
  button's blue outline ends at **`y 1501`**, leaving **98 px, 13.8 CSS px** below it. A
  vertically centred block in the same frame would carry `74 px` on each side, so the whole
  lockup sits **24 px high of centre** and the top margin is **half** the bottom one on a
  surface with no panel, no plate and no border to explain the difference. The celebration
  fills `y 50..1501`, **90.7 per cent of the frame height**, edge to edge with the viewport
  and no container of its own.
  Recorded explicitly so it is not re-raised: **the title is NOT clipped.** Rows `y 0`
  through `y 49` carry zero near-white pixels in `204` and zero in `205`.
- Resolution note: NEW AT 1600PX for the figures and the 1:2 ratio; the "is it clipped"
  question is VISIBLE AT BOTH and the answer is no in both.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:367-369`, the
  `@media (max-width: 500px)` branch, which already reduces the type steps and is the
  natural place to reduce them further. Not locked.
- Proposed fix: reduce the headline and lockup steps in the narrow branch until the stack
  clears both edges by the same amount, which would also let the continue hint back on
  screen (`STC-POPOUTS-B-08`).

## STC-POPOUTS-3-06 HIGH The buy dialog's stat strip is painted over the confirmation question, leaving only its last line

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/192_popout-s_dialog_nitro_overdrive.png`, `191_popout-s_transition_dialog_nitro_overdrive_opening.png`
- Claim: the stat strip's magenta bracket ends at `y 1330..1335` in `192`. The visible text
  `your bet?` begins at `y 1336`, **one pixel row below it**. The question the dialog exists
  to ask is a centred paragraph whose earlier lines are behind the strip, and the player is
  shown its final two words.
  **A refinement that matters, because it changes the mechanism**: the native pass described
  this line as *bisected horizontally through its letterforms*. At 1600px it is not.
  The ink at `y 1336` runs `x 1442..1664` and the ink at `y 1348` runs `x 1180..1663`: the
  later start on the left is `your`, which is all x-height, and the earlier start on the
  right is the ascenders of `b` and `t` and the `?`. That is ordinary, uncut typesetting.
  **The line is complete; the lines above it are absent.** The defect is occlusion and a
  scroll box, not a glyph slice.
- Resolution note: NEW AT 1600PX. At thumbnail scale a ragged ink top reads as a slice; only
  at full resolution can the ascender pattern be separated from a clip edge.
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:170-174`, the same
  `.buy-modal` scroll box as `STC-POPOUTS-3-02`. Not locked.
- Proposed fix: same fix as `STC-POPOUTS-3-02`. Pinning the action row and clamping the type
  steps returns the paragraph to the visible area; nothing separate is needed.

## STC-POPOUTS-3-07 MEDIUM The win breakdown strip is a 60 px band whose type collapses to 2.0 to 2.8 CSS px, so a live readout renders as texture

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/203_popout-s_post_feature_base.png` (measured), and the same strip in `193`, `194`, `195`, `196`, `197`, `198`, `199`, `200`, `201`, `202` and `207`
- Claim: measured on `203` at `x 1000`. The strip's dark bar runs **`y 1125..1185`**,
  **60 px, 8.4 CSS px tall**, wedged between the reel window's cyan inner border (which ends
  at `y 1120`) and the cabinet bevel (which begins at about `y 1188`). Inside that band:
  - the money value's glyph box is `x 1504..1580`, **`y 1139..1158`, a cap height of 20 px
    = 2.8 CSS px**;
  - the cyan run to its left is `x 1259..1419`, **`y 1145..1158`, a cap height of 14 px
    = 2.0 CSS px**.
  At 2 CSS pixels the strings are not resolvable even in the upscaled frame: I can see that
  the strip reads `<symbol> x<n> <n> ways $0.00` in shape, and I cannot transcribe the
  symbol code with confidence. A readout no one can read, painted across the full width of
  the playfield for the whole session, is a decorative band that the layout still budgets a
  line of type for.
- Resolution note: NEW AT 1600PX. The native pass could see the strip and reported it as
  *far below anything else on the card*; the figure that turns that into an actionable
  threshold, 2.0 to 2.8 CSS px, is only available at full resolution, and it is the figure
  that says the fix is not "make it bigger" but "give it a band or remove it".
- Where fixable: **LOCATED AFTER THE WRITE, and the derivation confirms the measurement
  rather than the other way round, per convention (l.2).**
  `frontend/src/lib/components/WinBreakdown.svelte:89-95` is the markup (verified: the four
  spans are `{symbolLabel(...)}`, `` x{current.kind} ``, `` {current.ways} ways `` and
  `{payLabel}`), and `:114-120` is the rule, ``position: absolute; left: 50%; bottom: 6px;
  transform: translateX(-50%); z-index: 45``, which pins it inside the grid. The type sizes
  are `:136`, ``font-size: 0.7rem``, and `:146`, ``font-size: 0.62rem``. **Derived**: the
  stage is `1280` wide (`frontend/src/App.svelte:752`) with `S = min(vw/1280, vh/720)`
  (`:748`), which at `400x225` is `0.3125`, so `0.7rem` = `11.2px` renders at **3.5 CSS px**
  and `0.62rem` = `9.92px` renders at **3.1 CSS px**. Cap height is about `0.72` of that:
  **2.5 and 2.2 CSS px predicted, against 2.8 and 2.0 measured.** The specification and the
  frame agree, so this is not a rendering fault, it is a type step that was never clamped
  for this viewport. `STC-POPOUTS-B-12`'s third pass located the component; the line numbers
  and the derivation here were verified against the file. Not locked.
- Proposed fix: clamp the strip's type to an absolute floor rather than a `rem` step that
  the stage transform scales away, for example `font-size: max(0.62rem, 30px)` in stage
  units so it lands near `9px` on screen; or below about 500px of viewport width drop the
  strip and surface the same information in the HUD WIN pod. Fitting it into whatever the
  cabinet bevel leaves is what produced the 60 px band.

## STC-POPOUTS-3-08 MEDIUM The stat strip's third column carries a second line the other two leave blank, so a third of the strip is dead

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/192_popout-s_dialog_nitro_overdrive.png`, `191_popout-s_transition_dialog_nitro_overdrive_opening.png`
- Claim: in `192` the strip runs `PRICE` / `$400.00`, `RTP` / `96.35%`, `MAX WIN` /
  `5,000x` `base bet`. The three first-line values sit in ink bands `y 982..1074`
  (`$400.00`, whose extra depth is the `$`), `y 990..1066` (`96.35%`) and `y 990..1079`
  (`5,000x`, whose extra depth is the comma), so **they do share a baseline**. What they do
  not share is a line count: `base bet` occupies `y 1144..1223` in column three alone, and
  columns one and two hold nothing at all in that band. The strip's lower third is two
  thirds empty and its visual weight hangs off its right edge.
- Resolution note: NEW AT 1600PX in one specific direction. The superseded entry's title
  reads *so no value shares a baseline*; at 1600px the first-line values do share one and
  the defect is the unmatched second line. The finding survives, its stated mechanism is
  narrowed.
- Where fixable: **VERIFIED AFTER THE WRITE.** `frontend/src/lib/components/BuyBonus.svelte:122-136`
  is the strip's markup, three equal `.buy-stat` cells whose third value is
  `{maxWinVsBaseBetLabel($isSocial)}` at `:135` with no wrap control; the `.buy-stats-row`
  rule is `:224`, ``display: flex; align-items: stretch; justify-content: space-between``.
  `align-items: stretch` is the property doing it: the cells are stretched, so nothing
  shares a baseline by construction and a wrap in one cell simply grows that cell. Not locked.
- Proposed fix: set the value row to `align-items: baseline` and render the third value on
  one line at a reduced step, or give all three columns a deliberate two line pattern so the
  wrap is the design rather than one column's accident.

## STC-POPOUTS-3-09 MEDIUM The playfield is fully occluded by the entry gate for every captured state of the running feature, and again after collect

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/196_popout-s_feature_run_1.png`, `197_popout-s_feature_run_2.png`, `198_popout-s_feature_run_3.png`, `199_popout-s_feature_run_4.png`, `200_popout-s_feature_run_5.png`, `201_popout-s_feature_run_6.png`, `207_popout-s_post_collect_base.png`, with `193`, `194` and `195` as the frames where that composition is correct
- Claim: `MANIFEST.json` describes `196` to `201` as `Overdrive free spins in flight,
  interval frame 1 of 6` through `6 of 6`. All six render the entry gate instead: the same
  `OVERDRIVE FREE SPINS` heading, the same tachometer, the same `+16 FREE SPINS`, the same
  `TAP TO CONTINUE` and the same `WIN $0.00` in the HUD. `207`, whose note is `Back to base
  after collect, balance settled`, shows the same card reading `+8 FREE SPINS` over a HUD
  reading `BAL $50K` and `WIN $5K`.
  The composition consequence, which is this lens's part of it: for seven of my seventeen
  frames the reel window is a black rectangle behind a modal, and the only element on screen
  carrying live figures is the instrument column that `STC-POPOUTS-3-01` shows is cut off.
  **The running feature's layout at `400x225` is unevidenced by this session and must not be
  recorded as swept.** Whether the gate is unpassable at this viewport or the capture never
  dismissed it cannot be told from the frames, and I am not choosing.
- Resolution note: VISIBLE AT BOTH.
- Where fixable: UNKNOWN. If the gate is genuinely unpassable at `400x225` the cause is
  likely the same scroll-box class as `STC-POPOUTS-3-02`; if it is a capture gap it belongs
  to the harness and not to the frontend.
- Proposed fix: PARK(needs a re-run of the popout-s feature leg before any layout claim
  about the running feature can be made). The re-run should establish first whether
  `TAP TO CONTINUE` responds at this viewport.

## STC-POPOUTS-3-10 MEDIUM After COLLECT the reel window is an empty amber rectangle while the instrument column still reads live figures

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/206_popout-s_transition_maxwin_collect_fade.png`
- Claim: the reel window in `206` holds no symbols. It is a diffuse amber wash with ghost
  outlines of a `W` and a few cells and two faint win-line strokes, occupying the full
  cabinet interior, which is roughly `x 612..2231` by `y 190..1190`, about **40 per cent of
  the frame area**, reading as a surface that failed to draw. Meanwhile the instrument
  column to its right still prints `8` free spins remaining and `$2.8` total, and the HUD
  prints `WIN $5K`, so a dead board sits beside three live readouts in the same frame.
- Resolution note: VISIBLE AT BOTH. Noted here from the composition side; the residue
  question is the motion lens's and LEDGER cluster 4 already holds it.
- Where fixable: UNKNOWN.
- Proposed fix: PARK(the correct end state of the board after a max win collect is a design
  decision, and cluster 4 already has three motion-lens shards on the same transition).

## Native pass reconciliation

Against `/Users/jt/math-sdk/reports/qa/stream_test/shards/superseded/STC-POPOUTS-B.md`,
which covers frames 183 to 207. Findings whose frames fall wholly outside 191 to 207 belong
to a sibling squad and are named as out of range rather than judged.

**`STC-POPOUTS-A.md` in full is OUT OF RANGE.** It scopes frames 157 to 182 and none of its
nineteen findings touch a frame I read. One is worth flagging to the marshal as a
cross-range corroboration rather than a verdict: `STC-POPOUTS-A-17` reports the win
breakdown strip as too small to resolve on frames `170` and siblings, which is the same
component and the same defect as my `STC-POPOUTS-3-07` on frames `193` to `207`. Two
squads, two frame ranges, one strip.

| Native id | Verdict | Note |
|---|---|---|
| `STC-POPOUTS-B-01` | **REFINED** | Headline CONFIRMED and hardened: on `192` the only ink below the stat strip is `your bet?` at `x 1180..1664`, `y 1336..1426`, and rows `1432` to the dialog's bottom border at `1515` are empty across the full width; rows `190` to `380` are empty too, so there is no title. The entry says the buttons and title are *not legible*; at 1600px they are **not rendered in the frame at all**, which is a stronger claim and a different one. REFINED further on mechanism: the entry describes the body line as *bisected horizontally through its letterforms*, and it is not (see `STC-POPOUTS-3-06`). |
| `STC-POPOUTS-B-02` | **CONFIRMED** | Independently, from a third decode path. In `194` the final column `x 2843` carries live ink in twelve runs, and the run at `y 974..1039` is `(255,213,74)`, the TOTAL WIN yellow. The entry's third-pass label transcription `OVERDRIVE FR`, `TOTAL W`, `MULTIPLI` and value `$10.6` is confirmed exactly at 1600px. The derivation-versus-frame contradiction the entry records is untouched by this pass and remains open. |
| `STC-POPOUTS-B-06` | **CONFIRMED** | `202` and `203` carry two icon buttons at the left of the HUD; `193` to `201`, `206` and `207` carry one. The claim is exactly as described in my frames. I did not re-derive the magnitude of the lateral shift, so the entry's *roughly 50px* estimate is neither confirmed nor disputed here. |
| `STC-POPOUTS-B-07` | **CONFIRMED on the centring, REFUTED on its third withdrawn candidate** | The centring is corroborated from an independent input to better than half a pixel of the native scale: my title block centres on upscaled `x 1428`, which is `200.8` in 400-space against the entry's `200.5`; my `5,000` numeral centres on upscaled `x 1225`, which is `172.3` against the entry's `172.0`. The clearance figure is corroborated too: numeral yellow ends at `x 1838` (`258.5`) and the unit's first ink is `x 1886` (`265.2`), against the entry's `258` and `265`. **But refutation 3's second half does not survive.** The entry withdrew *the unit sits at mid height rather than on the baseline* on the ground that *the two baselines agree to within about 1px*, comparing the numeral's bounding box bottom (`145`/`146` in 400-space) against the unit's (`146`). That numeral bottom is **the comma's descender**. The digits stop at upscaled `y 995`, which is `139.9`, and `BET` stops at `971`, which is `136.6`: a real **3.4 CSS px** offset. The withdrawn claim was true and was withdrawn on a mismeasurement. Reported as `STC-POPOUTS-3-04`. |
| `STC-POPOUTS-B-08` | **CONFIRMED** | No hint line renders below `COLLECT` in `204` or `205`. My COLLECT outline bottom measures upscaled `y 1501`, which is `211.1` of `225`, against the entry's `208` read on the button edge rather than its outline; the difference is the outline and does not affect the finding. |
| `STC-POPOUTS-B-09` | **REFINED** | The finding survives; its stated mechanism is narrowed. The entry's title is *so no value shares a baseline*. At 1600px the three first-line values sit at `y 982..1074`, `990..1066` and `990..1079`, whose differences are entirely the `$` and the comma, so **they do share a baseline**. The defect is the unmatched second line `base bet` at `y 1144..1223` in column three alone. Reported as `STC-POPOUTS-3-08`. |
| `STC-POPOUTS-B-10` | **CONFIRMED** | All six of `196` to `201` render the entry gate, and `207` renders it again reading `+8 FREE SPINS`. Reported as `STC-POPOUTS-3-09`, including the entry's refusal to choose between an unpassable gate and a capture gap, which I share. |
| `STC-POPOUTS-B-11` | **CONFIRMED** | Corroborated from a different feature of the same frame: the entry measured the cabinet's outer bright bezel in `203` at `x 78..321`, centre `199.5`. I measured the reel window's cyan **inner** border at `y 900` at upscaled `x 612..2231`, centre `1421.5`, which is `199.95` in 400-space against the frame's own `199.5`. Two different edges, same answer: the cabinet is centred and the imbalance is the scene's mass, exactly as the entry says. |
| `STC-POPOUTS-B-12` | **CONFIRMED and REFINED** | The strip is present in every frame the entry names that falls in my range. Refined with the figure the entry lacked: the band is **60 upscaled px, 8.4 CSS px** tall and the type inside it is **14 to 20 px cap height, 2.0 to 2.8 CSS px**. At that size I cannot transcribe the symbol token even from the upscaled raster, so the entry's transcription `SCATTER ×3 4 ways $0.00` is recorded as its reading and not independently confirmed by mine. Reported as `STC-POPOUTS-3-07`. |
| `STC-POPOUTS-B-13` | **CONFIRMED** | Independently and to about one native pixel. The entry's third pass read `×` at about `y 120..132` and `BET` at about `y 126..136` in 400-space. Mine, by column scan on the upscaled raster: `×` at `y 868..936`, which is `122.1..131.6`, and `BET` at `y 905..971`, which is `127.3..136.6`. Two glyph runs, two sizes, two bottom edges, confirmed. |
| `STC-POPOUTS-B-03`, `-04`, `-05` | **OUT OF RANGE** | Frames `183` to `188`. A sibling squad's. |

### The signed absence that does not survive

`STC-POPOUTS-B` signs: *No element is cut by the BOTTOM edge of the viewport. The HUD bar
is fully inside the frame on `186`, `193` to `203`, `206` and `207`.*

**REFUTED, on `203`.** The final pixel row `y 1599` carries 166 px of pure `(255,255,255)`
from `x 2548` to `x 2713`, under the spin control, and the run is the same width at
`y 1597`. Whatever stroke that is, it does not close inside the viewport. Reported as
`STC-POPOUTS-3-03`. This is the class of thing the sight gate exists for: a two-native-pixel
overrun cannot be seen at thumbnail scale, and signing its absence from thumbnails was not
a claim that pass could support.

Two of the same shard's other signed absences **survive at 1600px and are confirmed here**:
*no element cut by the TOP edge* (my first near-white title pixel in `205` is row `y 50`,
which is `7.03` of `225`, against the entry's `7`, and rows `0` to `49` are empty in both
`204` and `205`), and *no element cut by the LEFT edge* (nothing reaches column `x 0` in any
of my seventeen frames).

## Explicit absences, signed

Each of these is a claim, so each says what was checked.

- **No element is cut by the TOP edge of the viewport in any of my seventeen frames.** The
  tightest case is `MAX WIN REACHED!` in `204` and `205`; rows `y 0` to `y 49` of both carry
  zero pixels above the near-white threshold, and the first title ink is row `y 50`. The
  dialog border in `191` and `192` starts at `y 80`. The cabinet's top bracket in `193` to
  `203`, `206` and `207` starts below `y 20` in the upscaled frame but is never cut.
- **No element is cut by the LEFT edge.** Column `x 0` was checked on `192`, `194`, `203`,
  `205` and `206`; the leftmost control in the HUD bar keeps its margin in every base,
  feature and post-collect frame, and the dialog's own left border sits at `x 85`.
- **The control bar's outer padding is NOT asymmetric, and I am withdrawing a candidate
  finding that said it was.** By eye and on a first row scan of `203` the left end appeared
  to begin at `x 19` against a right end at `x 2787`, which would be `2.7` against `7.9`
  CSS px. On `207`, whose left cluster carries one button rather than two, the same scan
  gives `x 44` against `x 2789`: `6.2` against `7.6` CSS px, a difference of `1.4` CSS px.
  The `x 19` figure in `203` is the magenta button's outer **glow**, not its border. The
  bar is close enough to symmetric that I will not claim otherwise. Recorded so nobody
  re-raises it. **Postscript from the source pass, which cuts the other way and is recorded
  rather than used to reinstate the finding**: `frontend/src/lib/components/HudOverlay.svelte:1077`
  declares `.m-hud` as ``padding: 0 4px 0 2px``, so the bar's outer padding IS asymmetric,
  by `2` CSS px. That is real but it is **not what I measured and not what I could have
  measured**: `2` CSS px is `14` upscaled px and it sits inside the button's own glow. A
  finding has to be evidenced by the frames this squad was given, so it stays withdrawn and
  is handed to the marshal as a source observation.
- **The reel cabinet is horizontally centred.** Measured independently of the native pass,
  on a different edge; see the `STC-POPOUTS-B-11` row above. `199.95` against `199.5`.
- **The buy dialog's own frame is symmetric on all four sides.** `192`: margins `85`, `85`,
  `80`, `80` in the upscaled frame. Its stat strip is centred inside it too, inset `173` px
  from the dialog's inner edge on both sides. The dialog's composition failure is entirely
  vertical overflow, not lateral misplacement, and saying so keeps the fix pointed at the
  scroll box.
- **No two pieces of text overlap or double draw in any of my seventeen frames.** The only
  occlusions present are the stat strip over the dialog paragraph (`STC-POPOUTS-3-06`) and
  the entry card over the reel window (`STC-POPOUTS-3-09`), and both are reported under
  their own ids as occlusion rather than as text collision.
- **The `Press COLLECT or hit Enter to continue` string that charter row Q-16 enumerates as
  a visible hardcoded English string on the max win overlay is NOT on screen at this
  viewport.** `204` and `205` render exactly three things: the title, the `5,000×BET` lockup
  and the `COLLECT` button. Recorded because the de and ar squads are asked which parked
  strings are visible on stream frames, and at `400x225` this one is not.
- **MID-01 is not observable in my frame range.** The popout-s big win count-up triple is
  frames `169`, `170` and `171`, which belong to a sibling squad. I did not open them.
- **TR-114, the replay ghost pod, does not appear** in any of frames `191` to `207`.
- **TR-104 cannot be judged from my frames.** They are an English session, so the
  hardcoded-English tier label and unit are indistinguishable from correct output here.
- **Q-27 is not observable from my frames.** No link and no unstyled surface reaches any of
  the seventeen, so neither the indigo link colour nor the `#242424` body background can be
  judged from them.
- **Q-34 cannot be judged from my frames.** No mode name renders on any of the seventeen:
  the buy dialog carries no title (`STC-POPOUTS-3-02`), which is itself why.

## KNOWN matches

- **KNOWN(TR-115 / TR-086)**, money display fit class. Fresh evidence:
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/206_popout-s_transition_maxwin_collect_fade.png`
  and `207_popout-s_post_collect_base.png` render the HUD as `BAL $50K` beside `WIN $5K`,
  while `202_popout-s_transition_feature_exit.png` renders `WIN $319.45` and
  `203_popout-s_post_feature_base.png` renders `WIN $363.89`. One pod, one session, four
  frames apart, switching between an abbreviated format and a two-decimal one, **with the
  abbreviation landing on the largest win the game can pay**: the 5,000x cap on a `$1.00`
  bet is `$5,000.00` and the pod prints `$5K` in the same frame family where the overlay is
  announcing it in full. No new id opened; mapped to final-mile JOB 3.
- **KNOWN(Q-26)**, multiplication glyph class. Fresh evidence:
  `192_popout-s_dialog_nitro_overdrive.png` and
  `191_popout-s_transition_dialog_nitro_overdrive_opening.png` render the max win stat as
  `5,000x`, while `205_popout-s_maxwin_celebration.png` renders the same quantity as
  `5,000×`. Two surfaces, one session, two glyphs for one quantity. No new id opened.
- **KNOWN(Q-16 park)**, visibility note rather than a match. See the absence above: the
  string the park names on the max win overlay is not rendered at `400x225`, so this
  viewport contributes nothing to the park's urgency and says so.
- **MID-02: NOT matched on my frames, and the enumeration should be re-checked.** MID-02
  states its surface is *every session's big-win triple plus its max-win frames*, which
  would include `204` and `205`. At 1600px the glyph on `205` occupies `y 868..936` against
  a `BET` baseline of `y 971` and a numeral baseline of `y 995`, sitting on the maths axis
  well above both, which is U+00D7 placement and not an ASCII `x` sitting on the baseline;
  and `STC-POPOUTS-B-13` quotes the source as `<span class="c1-max-x">×</span>` at
  `frontend/src/lib/components/MaxWinCelebration.svelte:155`, the surface the LEDGER records
  as already fixed to `×` under Q-12. **So the max-win frames are not MID-02 frames**, and
  MID-02's count of 60 affected frames, which includes them, is likely overstated. Flagged
  for the marshal rather than opened as an id, since MID-02's core claim about
  `WinBanner.svelte:205` is untouched by this and my range holds no win banner.

tree_after: `git status --porcelain`, run from the repository root after this write,
verbatim:

```
?? reports/qa/stream_test/shards/STC-MOBILEL-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-2.md
?? reports/qa/stream_test/shards/STC-POPOUTS-3.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STT-POPOUTS-1.md
?? reports/qa/stream_test/shards/STT-POPOUTS-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-3.md
```

Eight untracked shard files: `STC-POPOUTS-3.md` is mine, the other seven belong to sibling
squads and are not my concern. **Nothing shows as MODIFIED and nothing shows as DELETED.**
No tracked file in the repository was touched by this squad, nothing was written into
`reports/screens/`, and no project script was run. The five source files opened in step 3
(`BuyBonus.svelte`, `MaxWinCelebration.svelte`, `HudOverlay.svelte`, `WinBreakdown.svelte`,
`BonusInstrumentColumn.svelte`) were read only, through `grep -n` and `sed -n` ranges.
