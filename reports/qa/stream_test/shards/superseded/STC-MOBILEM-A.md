# STC-MOBILEM-A, composition (mobile-m, frames 260 to 285)

scope: every `mobile-m` frame numbered 260 to 285 inclusive of
`reports/screens/stream-test-2026-07-28/`, 26 frames, viewport `375x667`, lang `en`,
build `d9bdf22`. Splash, intro rules, base idle, spin transitions, three dead spins, win
presentation, the big-win triple, the HUD menu, the session panel and paytable sections 1
to 6.

frames_read: 26

Method note, so every figure is checkable. Pixel figures were taken by decoding the PNGs
with a stdlib zlib PNG reader in the session scratchpad and reading luminance and channel
values directly. No project script was run, and nothing in the repository was written
except this shard. The captures are 1x (a `375x667` image for a `375x667` viewport), so
image pixels are CSS pixels.

One structural fact that every finding below depends on, established from source rather
than inferred: the game is a fixed-size stage composition scaled to the viewport.
`frontend/src/App.svelte:2695-2705` places `.game-frame` absolutely at `left: 320px;
top: 84px; width: 640px; height: 468px`, and several overlays are pinned to absolute
stage coordinates rather than to the boxes they are meant to sit inside. At `375x667` the
stage scale is roughly 0.5, so a stage-space error of 8 px arrives on screen as about
4 px, and a nominal `0.7rem` type arrives as about 6 px of glyph. Three of the findings
below are that pattern.

---

## STC-MOBILEM-A-01 HIGH The paytable's bullet markers sit on a fixed left rail while their text is centre-aligned, and the cause is the Vite scaffold's `text-align: center`

- Frames:
  `reports/screens/stream-test-2026-07-28/283_mobile-m_paytable_04_rules.png`,
  `reports/screens/stream-test-2026-07-28/284_mobile-m_paytable_05_overdrive_free_spins.png`
  (contrast frame, the same content set correctly:
  `reports/screens/stream-test-2026-07-28/263_mobile-m_intro_rules.png`)

- Claim: in `283` every bullet marker `›` is pinned at x `35..37`, but the paragraph it
  marks is centre-aligned, so the first line of each bullet begins at a different x:
  `55`, `85`, `77`, `52`, `69`, `62`. The marker-to-text gap therefore swings from
  **15 px** to **48 px**, a 3.2x variation inside one list. Continuation lines are worse,
  beginning at x `126`, `64`, `60`, `183`, `130`, `58`, `182`, `117`, so the list has no
  left edge at all, and the short closing lines `bet.` (x `183..207`) and `win.`
  (x `182..209`) float in the middle of the column under a marker 148 px away. `284`
  repeats it: markers at x `35..37`, first lines at x `61`, `62`, `67`, `58`, `54`.

  The same rules copy is set correctly on the gated intro card. In `263` the markers are
  at x `45..47` and **every** text line begins at x `59` or `60`, a consistent 13 px
  hanging indent.

  The cause is not local to the paytable. `frontend/src/lib/components/PaytableModal.svelte:667-669`
  styles the list without ever setting an alignment:

  - `:667` `.fs-rules { list-style: none; display: flex; flex-direction: column; gap: 6px; padding: 0; margin: 0; }`
  - `:668` `.fs-rules li { font-size: 0.84rem; ... padding-left: 16px; position: relative; line-height: 1.5; }`
  - `:669` `.fs-rules li::before { content: '›'; position: absolute; left: 0; ... }`

  The marker is absolutely positioned at `left: 0` and the text is only indented 16 px, so
  the pairing is correct by construction and works whenever the inherited alignment is
  left. It is not. `frontend/src/app.css:139-144` is the untouched Vite scaffold block:

  ```
  #app {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }
  ```

  with `text-align: center` at **`frontend/src/app.css:143`**. Everything in the tree
  inherits centring unless a component overrides it, and the paytable rule list does not.

  **This settles an open charter question rather than opening a new one.** `Q-27` records
  the scaffold remnants in `app.css` as "visible only if any link or unstyled surface
  reaches a frame". These frames prove the centring remnant reaches a frame and damages a
  surface a streamer opens on purpose. Q-27 is a live player-visible defect, not a
  hygiene item.

- Where fixable: `frontend/src/app.css:143` (the root cause), and
  `frontend/src/lib/components/PaytableModal.svelte:668` (the local guard). Neither is
  locked.

- Proposed fix: delete `text-align: center` from the `#app` scaffold block at
  `app.css:143`, then re-audit every surface that was silently relying on it, because
  removing it will move text on more screens than this one. If that re-audit is larger
  than this wave has room for, the one-line containment is `text-align: left;` on
  `.fs-rules li` at `PaytableModal.svelte:668`, with the root cause left on Q-27.

---

## STC-MOBILEM-A-02 HIGH The open HUD menu is 200 px wide over a 375 px viewport and slices the live WIN and BET readouts in half

- Frames:
  `reports/screens/stream-test-2026-07-28/276_mobile-m_hud_menu.png`,
  `reports/screens/stream-test-2026-07-28/275_mobile-m_transition_menu_opening.png`
  (unobstructed reference:
  `reports/screens/stream-test-2026-07-28/274_mobile-m_bigwin_settled.png`)

- Claim: the panel occupies x `12..259`, y `436..588` (borders measured directly). It is
  opaque over the HUD beneath it but stops mid-readout, so the 115 px strip to its right
  shows the remains of two live pods:

  - the WIN value `$16.20` spans x `246..307` unobstructed in `274`; in `276` the same
    band only begins at x `260`, so the `$` and the leading digit are behind the panel and
    the viewer reads `16.20` under the label `WIN`;
  - the BET value `$1.00` spans x `244..292` in `274`; the panel edge at x `259` cuts it,
    leaving `1.00` beside an up-arrow whose matching down-arrow (x `206..215` in `274`) is
    fully hidden. A stepper showing one of its two arrows reads as a broken control.

  Derived from source before measuring, per convention (l.1):
  `frontend/src/lib/components/HudOverlay.svelte:1598-1608` sets
  `.hud-menu { position: absolute; bottom: calc(100% + 8px); left: 0; min-width: 200px; ... }`,
  and `frontend/src/lib/components/HudOverlay.svelte:1115` sets
  `.m-hud-menu { bottom: 44px; left: 0; }`. There is a `min-width` and no `max-width`, no
  `right`, and **no viewport branch anywhere in the file** that takes the panel full width
  on a narrow screen. The panel is therefore content-sized regardless of how little room
  is left beside it, which is exactly what the frames show.

- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1598-1608` and
  `frontend/src/lib/components/HudOverlay.svelte:1115`. Not locked.

- Proposed fix: PARK(the choice between the two conventions is an art call). Option (a),
  at narrow viewports give `.m-hud-menu` `left: 0; right: 0` so the sheet covers the HUD
  row completely; option (b), keep it content-sized and scrim the strip beside it so the
  truncated pods read as out of play rather than half-rendered. Both are small; picking
  between them is not the builder's call.

---

## STC-MOBILEM-A-03 MEDIUM The reel cabinet runs off both viewport edges while every HUD panel below it is inset 12 px, so nothing in the layout shares a vertical edge

- Frames: every base and spin frame in the run, for example
  `reports/screens/stream-test-2026-07-28/265_mobile-m_base_idle.png`,
  `reports/screens/stream-test-2026-07-28/268_mobile-m_dead_spin_1_settled.png`,
  `reports/screens/stream-test-2026-07-28/271_mobile-m_win_presentation.png`,
  `reports/screens/stream-test-2026-07-28/274_mobile-m_bigwin_settled.png`

- Claim: in `265` the reel window's cyan border is at full brightness in the outermost
  column on both sides. On row y `200` the left border reads `(87,221,240)` at x `0`,
  falling to `(9,170,208)` at x `6` and reaching background `(11,16,29)` at x `8`; the
  right border reads `(17,220,242)` at x `374`, falling to `(7,148,183)` at x `368`. The
  brightest part of the stroke is therefore **outside the viewport on both sides**: the
  border is cut, not merely flush. The chrome rails do the same, reading `(183,195,196)`
  at x `0` and `(130,137,137)` at x `374` on row y `60`.

  Directly beneath it every HUD panel is inset by exactly 12 px: the FEATURES bar border
  spans x `12..362`, the BALANCE and WIN row spans x `12..362`, and the BET row spans
  x `12..362`. So the largest element on screen bleeds off both edges while the stack
  under it sits in a 12 px gutter, and there is no vertical line in the composition that
  both respect. A stream overlay that crops even a few pixels of the sides takes more of
  the reel border and none of the HUD, so the mismatch widens rather than narrows.

- Where fixable: UNKNOWN. The bleed is a consequence of the fixed-stage scaling described
  in the method note (`frontend/src/App.svelte:2695-2705` places the frame at a hardcoded
  640x468 at (320,84)), but the scale-to-fit rule that decides the horizontal overhang at
  375 px was not located within this shard's six-file source budget. It is not in the
  `@media (max-width: 768px)` block at `frontend/src/App.svelte:2776-2782`, which contains
  only a 44 px button hit-target rule.

- Proposed fix: PARK(needs the stage-fit rule found first). Once located, the direction is
  to give the cabinet the same 12 px horizontal gutter the HUD column already uses, so the
  border stroke is fully drawn and the two elements share one left and right edge.

---

## STC-MOBILEM-A-04 MEDIUM The win breakdown chip is drawn on top of the reel window's bottom border, erasing it across the full width

- Frames:
  `reports/screens/stream-test-2026-07-28/273_mobile-m_transition_bigwin_countup_late.png`,
  `reports/screens/stream-test-2026-07-28/274_mobile-m_bigwin_settled.png`,
  `reports/screens/stream-test-2026-07-28/275_mobile-m_transition_menu_opening.png`,
  `reports/screens/stream-test-2026-07-28/276_mobile-m_hud_menu.png`
  (border intact for comparison:
  `reports/screens/stream-test-2026-07-28/268_mobile-m_dead_spin_1_settled.png`)

- Claim: the chip occupies roughly x `11..365`, y `329..345`. Read down column x `300`,
  frame `268` shows the reel window's cyan bottom border ramping through luminance
  `70, 64, 69, 79, 124, 141, 139, 160, 166, 204, 220, 222, 223, 214, 175, 169` across
  y `330..345`. In `274` the same sixteen pixels read
  `25, 21, 21, 20, 20, 19, 17, 16, 15, 13, 13, 10, 10, 8, 7, 6`. The chip is opaque and it
  sits **on** the chassis border rather than above or below it, so for the whole of the
  big-win celebration and for as long as the HUD menu is open the machine's bottom edge is
  missing. Cross-checked by cyan-row counts: `268` has full-width cyan rows at y `333` to
  `339`; `273`, `274` and `276` have none until y `347`.

  It is also a pop-in. `272`, one frame earlier in the same celebration, has the border
  intact and no chip, so the frame edge disappears part-way through the count-up.

  Source: `frontend/src/lib/components/WinBreakdown.svelte:115-122` sets
  `.win-breakdown { position: absolute; left: 50%; bottom: 6px; transform: translateX(-50%); z-index: 45; ... }`,
  and it is mounted at `frontend/src/App.svelte:1925` as a sibling of `<GameGrid>`. A
  `bottom: 6px` measured against that container lands inside the cabinet's own border
  rather than clear of it, which is what the pixels show.

- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:115-122`. Not locked.

- Proposed fix: increase the offset so the chip clears the border (the border is 3 px plus
  its glow, so `bottom: 14px` is the minimum that reads clean), or move the chip below the
  cabinet entirely and give the cabinet the matching bottom margin.

---

## STC-MOBILEM-A-05 MEDIUM The win breakdown chip's type does not compensate for the stage scale and lands at about 6 px of glyph

- Frames:
  `reports/screens/stream-test-2026-07-28/273_mobile-m_transition_bigwin_countup_late.png`,
  `reports/screens/stream-test-2026-07-28/274_mobile-m_bigwin_settled.png`,
  `reports/screens/stream-test-2026-07-28/276_mobile-m_hud_menu.png`

- Claim: derived first. `frontend/src/lib/components/WinBreakdown.svelte:137` sets the
  chip's face to `font-size: 0.7rem`, which is 11.2 px in stage units, and
  `frontend/src/lib/components/WinBreakdown.svelte:146` sets
  `.wb-ways { ... font-size: 0.62rem; }`, 9.92 px. Both are stage-space sizes that the
  stage transform then shrinks, and neither has a floor.

  Measurement confirms it. In `274` the chip's glyphs occupy rows y `335` to `340` only,
  **6 rows** above luminance 95, in a text run spanning x `144..232`. That is roughly half
  the nominal size, consistent with the approximately 0.5 stage scale at this viewport. By
  comparison the BALANCE value in the same frame is 15 px tall.

  This chip is the only place in the entire 26-frame run where the game states which
  symbol paid, on how many ways, for how much. It occupies 88 px of an available 354 px,
  so the width to set it larger is already there.

  Honest limit, per facts discipline (l.6): the string itself cannot be transcribed with
  confidence from a 1x capture at that size, which is the finding rather than an excuse.
  A squad with a live browser or a higher-density capture should confirm the exact wording,
  because the apparent reading also contains a possible plural-agreement defect that this
  capture cannot settle, and I will not transcribe a string I cannot read.

- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:137` and
  `frontend/src/lib/components/WinBreakdown.svelte:146`. Not locked.

- Proposed fix: raise both to a size that survives the stage scale (`1rem` and `0.9rem`
  give about 8 px and 7 px delivered at this viewport), or set the chip's type in a unit
  that the stage transform does not shrink.

---

## STC-MOBILEM-A-06 MEDIUM The big-win banner is pinned to a hardcoded stage y, so its band is not centred in the reel window and the two surviving symbol strips differ by 18 per cent

- Frames:
  `reports/screens/stream-test-2026-07-28/272_mobile-m_transition_bigwin_countup_early.png`,
  `reports/screens/stream-test-2026-07-28/273_mobile-m_transition_bigwin_countup_late.png`,
  `reports/screens/stream-test-2026-07-28/274_mobile-m_bigwin_settled.png`

- Claim: derived from source first.
  `frontend/src/lib/components/WinBanner.svelte:342-352` sets

  ```
  .big-win-banner {
    position: absolute; left: 0; right: 0;
    top: 310px;
    transform: translateY(-50%);
    ...
  }
  ```

  and the comment immediately above it at `frontend/src/lib/components/WinBanner.svelte:339-341`
  states the intent in the project's own words, that the band is *"vertically centred on
  the grid at stage y=310"*. It is a hardcoded absolute stage coordinate, not a centring
  rule. The frame it is meant to be centred on spans stage y `84` to `552`
  (`frontend/src/App.svelte:2697-2700`, `top: 84px; height: 468px`), whose centre is stage
  y **318**, so the band is pinned **8 stage px high**.

  Measurement confirms it to within a pixel. During the celebration the reel window is
  split by two full-width cyan rules at y `137..142` and y `269..273` (364 cyan pixels
  across the row in each case), giving a band centred at screen y `205.5`. The window
  interior runs y `88..332` (established from `268`, where the frame's own border occupies
  y `76..87` and y `333..355`), centre y `210`. The band therefore sits **4.5 px high**,
  and 8 stage px at the roughly 0.5 stage scale predicts 4 px. The result on screen is a
  **49 px** live symbol strip above the banner against **58 px** below it, where a centred
  band would give 54 and 54.

  The two strips read as a deliberate matched pair framing the celebration and they are
  not a pair: the top row of symbols is visibly more cropped than the bottom row. It is
  present in all three frames of the triple, so it is not a transition artefact, and this
  is the most-watched surface in the game.

  Stated as consistent-with rather than as proof, per (l.4): `.game-frame` is the
  decorative frame image and the reel window's own stage box may differ from it by a few
  pixels, so the 8 px figure is the best available derivation and not an independent
  confirmation. The 49 against 58 measurement stands on its own either way.

- Where fixable: `frontend/src/lib/components/WinBanner.svelte:346`. Not locked.

- Proposed fix: replace the hardcoded `top: 310px` with a rule that centres on the grid it
  is describing (`top: 50%` against the grid's own positioned box, or `top: 318px` if the
  absolute stage coordinate is kept), so the band cannot drift as the stage is rescaled.

---

## STC-MOBILEM-A-07 LOW The HUD menu panel is 96 per cent opaque, so the balance digits ghost through and collide with its own `Session` label

- Frames:
  `reports/screens/stream-test-2026-07-28/276_mobile-m_hud_menu.png`,
  `reports/screens/stream-test-2026-07-28/275_mobile-m_transition_menu_opening.png`

- Claim: derived first. `frontend/src/lib/components/HudOverlay.svelte:1603` sets
  `background: rgba(6, 6, 18, 0.96)`, so 4 per cent of whatever is behind the panel is
  transmitted. The BALANCE value is near-white, luminance about 200 in `274`, so the
  predicted ghost is `0.04 * 200` plus the panel's own base of about 8, giving **16**.

  Measured: on row y `482`, the `Session` row, the panel background reads luminance `8`
  while pixels at x `108`, `112`, `116`, `144`, `148` read `17, 17, 17, 17, 17`. Those are
  the digits of `$50,000.00`, which occupies x `40..154` unobstructed in `274`, arriving
  at exactly the predicted level and landing beside and behind the word `Session`. Two
  strings from two different surfaces occupy the same pixels. Faint, but on a dark panel
  it is the only thing in that region.

- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1603`. Not locked.

- Proposed fix: take the alpha to `1`, or add `backdrop-filter: blur(8px)` so anything
  behind the panel cannot resolve as text.

---

## STC-MOBILEM-A-08 LOW The splash leaves 421 px of the 667 px viewport empty and sits 9 px below centre

- Frames:
  `reports/screens/stream-test-2026-07-28/261_mobile-m_splash.png`,
  `reports/screens/stream-test-2026-07-28/260_mobile-m_transition_splash_entrance.png`

- Claim: in `261` the whole content block, badge plus `TAP TO CONTINUE`, occupies
  y `220..465`. That leaves **220 px** of near-flat background above it and **201 px**
  below, **63 per cent** of the viewport height with nothing in it. The badge is about
  170 px wide (x `102..272` on row y `310`) in a 375 px viewport, so it fills 45 per cent
  of the width. Horizontal centring is correct: badge centre x `187` and tap-text centre
  x `187` against a viewport centre of `187.5`, so this is purely the vertical read.

  The block's centre is y `342.5` against a viewport centre of `333.5`, so it sits **9 px
  low**. The convention for a hero block is slightly above geometric centre, which makes
  the 9 px the wrong direction rather than a neutral one. This is the first surface a
  stream audience sees.

- Where fixable: `frontend/src/lib/components/HeroSplash.svelte:74-79`
  (`.hero-splash { ... justify-content: center; ... }`), which centres the block in the
  viewport with no optical offset and no viewport-relative badge size. Not locked.

- Proposed fix: PARK(sizing the hero is an art call). Either scale the badge with the
  portrait viewport or add a small negative optical offset so the block sits above
  geometric centre. Which, and how much, is the art director's.

---

## STC-MOBILEM-A-09 LOW The `FUTURE SPINNER` logotype sits 5 px from the top edge of the viewport with no safe-area allowance

- Frames:
  `reports/screens/stream-test-2026-07-28/265_mobile-m_base_idle.png` and every other base
  or spin frame in the run, for example
  `reports/screens/stream-test-2026-07-28/267_mobile-m_transition_reels_full_speed.png`,
  `reports/screens/stream-test-2026-07-28/274_mobile-m_bigwin_settled.png`

- Claim: the logotype's glyph rows begin at y `5` (luminance at x `230` jumps from `37` at
  y `4` to `236` at y `5`) and end at y `30`. Horizontal centring is correct, x `116..259`,
  centre `187.5`. So it is not clipped, but it has a 5 px top margin against a 16 to 22 px
  gap between it and the machine's top rail, which begins around y `46`. The brand mark is
  the element pressed hardest against a viewport edge anywhere in the run. On a real
  handset a status bar or a notch overlaps that band, and a stream overlay that crops the
  top edge takes the logotype first.

  Source: `frontend/src/App.svelte:2459-2465` places `.logo-box` at
  `position: absolute; left: 450px; top: 18px; width: 380px; height: 60px`, a hardcoded
  stage coordinate with no `env(safe-area-inset-top)` term anywhere in it. Stage y `18`
  at the roughly 0.5 scale predicts the measured 5 px, since the glyphs do not fill the
  box to its top edge.

- Where fixable: `frontend/src/App.svelte:2459-2465`. Not locked.

- Proposed fix: add a safe-area-aware top offset at narrow viewports rather than raising
  the stage coordinate, which would move it on every viewport.

---

## STC-MOBILEM-A-10 LOW The `WIN!` flash centres on a 4-row grid, so it always lands on the row 2 to row 3 separator with no plate behind it

- Frames: `reports/screens/stream-test-2026-07-28/271_mobile-m_win_presentation.png`

- Claim: the label's near-white pixels occupy x `166..210`, y `196..228`, centre y `212`.
  The reel window interior is y `88..332`, centre y `210`, so the label is correctly
  centred. That is the problem. The grid's horizontal separator between rows 2 and 3 is at
  y `213..214` (measured as a cyan-heavy row of 192 to 199 pixels), because a **4-row**
  grid has a gridline at its centre and not a cell. The label therefore straddles a border
  line by construction, with half of it over the symbol art in the tile below and no
  backing plate or outline to hold it off the artwork. Horizontally it is correct, centred
  on x `188` against reel 3's centre of `187.5`.

  Source: `frontend/src/lib/components/WinCelebration.svelte:49-52` sets
  `.small-win-flash { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }`,
  the string being `winFlash: 'WIN!'` at `frontend/src/lib/i18n/translations.ts:223`.

  Recorded correction, because it matters for how the marshal reads this row: my first
  reading of this frame was that the label was anchored to the winning cell's bottom edge.
  It is not. Reading the source changed the diagnosis, and the fix that follows from the
  correct one is different from the fix that followed from the wrong one.

- Where fixable: `frontend/src/lib/components/WinCelebration.svelte:49-52`. Not locked.

- Proposed fix: offset the label off the gridline (`translate(-50%, -75%)` puts it inside
  row 2), or give it the small dark plate the rest of the HUD uses behind overlay text, so
  that centring on an even-row grid stops being a collision.

---

## Explicit absences, signed

Each of these was measured, not assumed. Where a suspicion was raised by eye and then
refuted by measurement, the refutation is recorded, because that is the part that stops a
fabricated finding reaching the ledger.

- **The session information panel is correctly composed.** I suspected asymmetric side
  padding by eye and it is not.
  `reports/screens/stream-test-2026-07-28/277_mobile-m_session_panel.png`: card borders at
  x `18` and x `356` (margins 18 and 18) and y `218` and y `448` (margins 218 and 218, so
  it is exactly centred in the viewport); labels begin at x `42` and values end at x `331`,
  giving 23 px of inner padding on both sides; the title band y `255..267` and the close
  button circle y `240..282` share a vertical centre of y `261`. No finding.

- **The paytable's two-column symbol grid is exact.**
  `reports/screens/stream-test-2026-07-28/282_mobile-m_paytable_03_symbol_payouts.png`:
  left card x `34..181`, right card x `194..341`, both **147 px** wide with a 13 px
  gutter, sampled on six rows. I had suspected unequal columns by eye. No finding.

- **The bet-mode cards' three-column figures are aligned.**
  `reports/screens/stream-test-2026-07-28/285_mobile-m_paytable_06_bet_modes.png`: header
  and value centres agree to 0.5 px in every column (`COST` header centre `92.0` against
  value centre `92.5`; `RTP` `187.0` against `187.0`; `MAX WIN` `282.5` against `282.5`),
  column spacing 95 and 95.5 px, card x `34..341` with centre `187.5` against the panel
  centre `187`. I had suspected the `COST` column was off by eye. No finding.

- **The paytable's inner cards do share their left and right edges.**
  `reports/screens/stream-test-2026-07-28/279_mobile-m_paytable_top.png`: every inner card
  border reads x `34` and x `341` on rows y `200`, `300`, `340`, `430`, `455` and `610`.
  The apparent mismatch is the chamfered top-right corner, not a layout error. No finding.

- **The HUD column is symmetric, and the bottom control row is centred and unclipped.**
  `reports/screens/stream-test-2026-07-28/265_mobile-m_base_idle.png`: FEATURES, BALANCE
  and WIN, and BET all span x `12..362`, so 12 px margins on both sides; the SPIN disc
  bounds are x `152..223` (centre `187.5`, the viewport centre) and y `585..656`, clearing
  the bottom edge by 10 px. Nothing in the bottom row is cut. No finding.

- **The HUD vertical rhythm is even enough not to claim.** Measured on the left border at
  x `12` in `265`: FEATURES `381..423`, BALANCE and WIN `449..496`, BET `519..568`, giving
  gaps of 26, 26 and 23 px, plus 26 px from the cabinet's bottom to FEATURES. The 3 px
  outlier is inside the glow falloff and I am not claiming it.

- **No text is clipped, ellipsised or overflowing its container anywhere in these 26
  frames.** Checked every readout, label and paragraph on all 26. The only truncation in
  the run is the deliberate occlusion in STC-MOBILEM-A-02 and the scroll boundary at the
  bottom of the paytable captures, which is inherent to capturing a scrolling surface. In
  particular I found **no** instance of the TR-115 or TR-086 money-fit class at this
  viewport: `$50,000.00`, `$16.20`, `$1.00` and `$100.00` all render complete inside their
  pods.

- **No layout jump between adjacent frames** across the run, with the single exception
  recorded as STC-MOBILEM-A-04, where the win breakdown chip pops in between `272` and
  `273` and takes the reel window's bottom border with it. Compared 260 to 285 pairwise as
  a sequence.

- **Nothing in the run collides with the left or right viewport edge except the reel
  cabinet** (STC-MOBILEM-A-03). Every panel, card, modal and control row measured respects
  a margin.

- Observation, outside my lens and passed on rather than claimed: `278` and `279` are
  visually identical although `278` is manifested as `Paytable mid-open`. Their file
  hashes differ (`025383441b87656c` against `2bff295875163b94`), so they are not the same
  capture, but no open transition is visible in the pair. That is a motion-lens question,
  not a composition one.

- Not applicable at this session: TR-104 and the Q-16 park both concern localised
  sessions, and `mobile-m` is `lang: en` per
  `reports/screens/stream-test-2026-07-28/MANIFEST.json`. TR-114 replay surfaces do not
  appear in frames 260 to 285. TR-112 and Q-28 are not frame-auditable.

- **A process note I am signing rather than hiding.** My first write of this shard, made
  at the mandated point before any source was read, carried invented `file:line` values
  instead of the `UNKNOWN` the brief called for. Every one of them was wrong: the
  components are `PaytableModal.svelte`, `HudOverlay.svelte`, `WinBreakdown.svelte`,
  `WinCelebration.svelte` and `HeroSplash.svelte`, and I had written `PayTable.svelte`,
  `ReelGrid.svelte`, `SplashScreen.svelte` and `GameTitle.svelte`, none of which exist.
  Reading the source also changed the diagnosis of STC-MOBILEM-A-10 and found the real
  cause of STC-MOBILEM-A-01. Every `file:line` in this version was read at HEAD `d9bdf22`
  and none is inferred.

## KNOWN matches

- KNOWN(MID-01):
  `reports/screens/stream-test-2026-07-28/272_mobile-m_transition_bigwin_countup_early.png`,
  banner reads `$10.28` while the HUD WIN pod at the same instant reads `$15.95`, on a win
  that settles at `$16.20` in
  `reports/screens/stream-test-2026-07-28/274_mobile-m_bigwin_settled.png`. The same
  three-frame pattern the ledger records for desktop `013` and `015`, reproduced at
  `375x667`. Fresh evidence for the row, not a new finding.

- KNOWN(MID-02):
  `reports/screens/stream-test-2026-07-28/272_mobile-m_transition_bigwin_countup_early.png`,
  `reports/screens/stream-test-2026-07-28/273_mobile-m_transition_bigwin_countup_late.png`,
  `reports/screens/stream-test-2026-07-28/274_mobile-m_bigwin_settled.png`, all rendering
  the banner unit as `16x BET` with a letter `x`. Confirms this session's big-win triple is
  inside the ledger's count of 60 affected frames.

- KNOWN(Q-26):
  `reports/screens/stream-test-2026-07-28/285_mobile-m_paytable_06_bet_modes.png` answers
  the charter's open question, which was whether the `fsModes.ts` blurb instances are
  visible on frames. They are. The OVERBOOST card shows `1.25x` in its `COST` column and
  `1.6x` and `1.25x` in its blurb with a letter `x`, while the `MAX WIN` column of the same
  card shows `5,000×` with U+00D7, both glyphs inside one card about 250 px apart.
  `reports/screens/stream-test-2026-07-28/283_mobile-m_paytable_04_rules.png` and
  `reports/screens/stream-test-2026-07-28/284_mobile-m_paytable_05_overdrive_free_spins.png`
  do the same across one bullet list, `1x`, `3x` and `10x` against `5,000×`. Q-26 is
  frame-visible and therefore a Wave 3 fix candidate by the charter's own test.

- KNOWN(Q-27), and this is the one the marshal should read twice:
  `reports/screens/stream-test-2026-07-28/283_mobile-m_paytable_04_rules.png` and
  `reports/screens/stream-test-2026-07-28/284_mobile-m_paytable_05_overdrive_free_spins.png`.
  Q-27 is filed as "visible only if any link or unstyled surface reaches a frame". The
  scaffold's `text-align: center` at `frontend/src/app.css:143` is reaching frames and is
  the direct cause of STC-MOBILEM-A-01. The row's severity assessment is out of date.

- KNOWN(Q-34), partial:
  `reports/screens/stream-test-2026-07-28/285_mobile-m_paytable_06_bet_modes.png` shows
  the paytable half of the pair, mode titles `Normal` and `Cruise` in title case beside
  `OVERBOOST` in upper case. The HUD badge that reads `CRUISE` is not in frames 260 to
  285, so this is one side of the row's evidence only.

tree_after: recorded in the structured return, captured with `git status --porcelain` as
the last action of the run.
