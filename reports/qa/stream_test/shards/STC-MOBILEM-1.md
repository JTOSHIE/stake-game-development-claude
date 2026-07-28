# STC-MOBILEM-1, COMPOSITION (mobile-m, frames 260 to 277, 1600px upscaled)

supersedes: STC-MOBILEM-A.md (frames 260 to 277 of its 260 to 285 scope; frames 278 to 285
belong to a sibling re-run squad. STC-MOBILEM-B.md covers 286 to 311 and is entirely outside
this scope, so nothing in it is reconciled here.)

scope: the 18 `mobile-m` frames numbered 260 to 277 inclusive, read from
`/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`, native viewport `375x667`,
lang `en`. Every upscaled frame measures `899x1600`, confirmed by `ffprobe`, so the upscale
factor is `1600 / 667 = 2.3988`. **Every pixel figure below is in UPSCALED pixels unless it is
explicitly labelled native.** Native equivalents are `upscaled / 2.3988`.

frames_read: 18

**Method, and its one validation.** Frames were decoded to raw RGB with
`ffmpeg -f rawvideo -pix_fmt rgb24` and scanned in pure Python for luminance runs and bounding
boxes. No file was written anywhere except this shard. Thresholds are quoted with every figure,
because a soft glow moves an edge and a claim that does not say where it cut is not checkable.

The method is calibrated against a known quantity rather than trusted: `.p-spin` is declared
`width: 72px; height: 72px` at `frontend/src/lib/components/HudOverlay.svelte:2108-2109`, and
the measured SPIN disc in frame 265 is 173 by 172 upscaled, `173 / 2.3988 = 72.1` native. **The
method is good to about 0.1 native pixels on a solid fill.** It is NOT good on a soft or
gradient edge, and the section "Draft claims refuted before this shard was finalised" below is
what happened when I forgot that.

---

## STC-MOBILEM-1-01 HIGH The win breakdown chip is drawn opaquely over the reel window's bottom rail and erases 94.6 per cent of it, and it survives into the menu frames

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/273_mobile-m_transition_bigwin_countup_late.png`,
  `274_mobile-m_bigwin_settled.png`, `275_mobile-m_transition_menu_opening.png`,
  `276_mobile-m_hud_menu.png`.

- Claim: the reel window's bottom neon rail is the brightest single graphic element in the
  layout. The chip is painted over it.

  Row profile across the full width, sampled every 60 pixels, luminance:

  | y | frame 268, no chip | frame 273, chip |
  |---|---|---|
  | 815 | `197, 214, 212, 212 ... 212, 214` | `196, 24, 22, 19, 17, 15, 84, 12 ... 12` |
  | 820 | `169, 225, 222, 222 ... 223, 224` | `169, 20, 18, 16, 14, 11, 10, 9 ... 9` |
  | 825 | `101, 186, 185, 184 ... 185, 186` | `101, 15, 14, 12, 10, 8, 7, 7 ... 7` |

  Thresholded at 90, row `y=820` returns **one run `(0, 898)` in frame 268 and two runs
  `(0, 28)` and `(879, 898)` in frame 273**. The rail's peak, luminance 222, is reduced to
  luminance 9.

  **The chip blanks x 29 to 878: 850 of 899 pixels, 94.6 per cent, 354 of 375 native pixels.**
  The rail survives only as two 28 pixel stubs at the extreme left and right, which reads worse
  than losing it cleanly.

  It is not transient. The chip is still on screen, still reading `L3  x4  1ways  $0.20`, in
  frames 275 and 276, with the menu open, long after the win it describes.

- Resolution note: VISIBLE AT BOTH. The native pass caught the phenomenon at MEDIUM
  (`STC-MOBILEM-A-04`); the 94.6 per cent figure and the 222 to 9 luminance collapse are NEW AT
  1600PX, and on that evidence the severity is raised to HIGH.

- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:117` (`bottom: 6px`) with
  `:119` (`z-index: 45`). The `z-index` is what puts it over the cabinet frame rather than
  under it. Not locked.

- Proposed fix: move the chip below the rail, or drop it under the frame in the stacking order.
  A 6 pixel offset from the container's bottom edge lands exactly on the rail; either the offset
  or the `z-index` has to change, and changing the offset preserves the frame.

---

## STC-MOBILEM-1-02 HIGH The big win banner is edge to edge by design, and the consequence nobody costed is that it severs the reel cabinet's side rails into two disconnected segments

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/272_mobile-m_transition_bigwin_countup_early.png`,
  `273_mobile-m_transition_bigwin_countup_late.png`, `274_mobile-m_bigwin_settled.png`.

- Claim: every HUD panel in this layout is inset 28 upscaled pixels, 11.7 native, from each
  viewport edge. The banner is not. It runs to `x=0` and `x=898`, over the cabinet's own left
  and right rails, so the frame breaks in half for the whole celebration.

  Vertical rail scan, threshold 35:

  | column | frame 268, no banner | frame 273, banner |
  |---|---|---|
  | `x=6`, left rail | continuous `y` 190 to 839 | `y` 190 to 385, **gone 386 to 639**, `y` 640 to 839 |
  | `x=892`, right rail | continuous `y` 190 to 839 | `y` 190 to 351, **gone 352 to 639**, `y` 640 to 839 |

  **254 pixels of the left rail and 288 pixels of the right rail are blanked, 106 and 120
  native pixels**, and the two blanked spans do not start at the same height, differing by 34
  pixels.

  Confirmed at the edge itself. Row `y=500`, luminance at `x` 0, 2, 5, 10 and 890, 895, 898:
  frame 265 reads `183, 167, 150, 133` and `137, 152, 158`; frame 272 reads `22, 22, 22, 22`
  and `17, 17, 17`. The banner's fill reaches the literal first and last column of the viewport.

  **The edge-to-edge is deliberate and it is written down**, which changes what a fix may do.
  `frontend/src/lib/components/WinBanner.svelte:354-356` carries the comment *"a horizontal
  band, not a card ... edge to edge reads as a strip, not a plate"*. The intent is on the
  record. What is not on the record is that at 375 native pixels the strip is wider than the
  cabinet and cuts the cabinet's frame in two, which is a different thing from reading as a
  strip.

  The band measures `y` 331 to 655, 324 pixels, **50 per cent of the 650 pixel reel window
  height**, taken at a luminance step greater than 12 at `x=200`.

- Resolution note: NEW AT 1600PX. The rails are 2 to 3 native pixels wide at the very edge of a
  375 pixel viewport; at roughly 334 image tokens they are not resolvable, so the native pass
  could not have seen them break. It found the band's vertical placement (`STC-MOBILEM-A-06`),
  which is a different defect on the same element.

- Where fixable: `frontend/src/lib/components/WinBanner.svelte:344-348`
  (`left: 0; right: 0; top: 310px; transform: translateY(-50%); width: 100%`). Not locked.

- Proposed fix: PARK(the edge-to-edge read is a stated art decision at `:354-356` and the
  builder does not get to reverse it). Two options for the owner: (a) keep the band full width
  but let the two rail columns punch through it, so the strip reads as a strip and the cabinet
  stays whole; (b) inset the band to the cabinet's inner edge and accept a plate. Option (a)
  preserves the recorded intent and is a mask, not a redesign.

---

## STC-MOBILEM-1-03 HIGH Mid spin the reel window is empty across reels 1 to 3 and the scene background shows through the cabinet

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/266_mobile-m_transition_reels_accelerating.png`.

- Claim: in the accelerating frame the cabinet interior across roughly `x` 25 to 540, `y` 470 to
  800 carries no symbols and no cell backgrounds. What is drawn there instead is the scene: the
  magenta chevron graphics and the vertical rain streaks of the background plate, read straight
  through the reel window. Reels 1, 2 and 3 show three, two and one symbol respectively while
  reels 4 and 5 are full, so the lower left of the board is simply absent and the room behind it
  is showing.

  A reel strip is continuous and never shows a hole. A hole that shows the scene through it is
  the cabinet with no backing.

- Resolution note: VISIBLE AT BOTH. This is a large area defect and a thumbnail carries it;
  **the native mobile-m squad nonetheless missed it entirely.** The ledger's cluster 1 lists
  `STC-DESKTOP-A-01`, `STC-LAPTOP-A-02`, `STC-MOBILEL-A-01`, `STC-MOBILES-A-01`,
  `STC-STRETCH-A-01` and six motion-lens siblings, and no mobile-m shard. mobile-m has it too,
  so **cluster 1 now covers this viewport as well and the ledger's "seven viewports" is low by
  one.**

- Where fixable: UNKNOWN. `grep -rn "reel-window"` over `frontend/src/lib` returns nothing, so
  the container is named something else and I did not spend a seventh source file finding it.
  The cluster 1 owner already holds this surface across five other viewports and will have the
  path; this shard adds the viewport, not the diagnosis.

- Proposed fix: PARK(deferred to cluster 1's owner, who holds the same defect on five other
  viewports and should fix it once).

---

## STC-MOBILEM-1-04 HIGH The session panel's close glyph sits exactly half its own width to the right of its button's centre

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/277_mobile-m_session_panel.png`.

- Claim: measured three independent ways, because the first two agreed and I no longer trust
  agreement on its own.

  1. Bounding box of the button's disc, threshold 24: `(686, 576, 798, 678)`, centre
     `x = 742`. Bounding box of the `X` glyph, threshold 40: `(752, 613, 784, 645)`, centre
     `x = 768`.
  2. Luminance profile across `y=627`: modal background at 12 until `x=680`, then a flat
     plateau at **31 from `x=686` to `x=797`**, back to 12 by `x=806`. Plateau centre 741.5.
     The glyph spikes to 199 and 217 at `x=764` and `x=770`.
  3. Circle check. If the plateau is a disc centred at `(741.5, 627)` with radius 52.75, its
     half-height at `x=700` is 32.6 and at `x=790` is 20.7, predicting `y` 594 to 660 and 606
     to 648. Measured: `y` 596 to 656 and 608 to 650. **The plateau is that circle**, and
     `52.75 * 2 / 2.3988 = 44.0` native, which is the declared button size to the pixel.

  So the button is right and the icon is not. **The glyph centre is 26.5 upscaled pixels, 11.0
  native pixels, right of the button centre.** The glyph box is `1.1em` at `font-size: 20px`,
  which is 22 native pixels, so **the offset is exactly half the glyph's own width, and the
  glyph box's left edge sits on the button's centre line.** That is not a rounding error, it is
  a centring that did not happen.

- Resolution note: NEW AT 1600PX. The whole control is 44 native pixels; an 11 native pixel
  offset inside it is under two thumbnail pixels.

- Where fixable: `frontend/src/lib/components/SessionPanel.svelte:195`
  (`.sp-close-glyph { width: 1.1em; height: 1.1em; display: block; margin: 0 auto; }`) against
  `:197-206` (`.sp-sheet-close`, `width: 44px; height: 44px`, with no `display: flex` and no
  `place-items`). The `margin: 0 auto` is not resolving against the button box. Not locked.

- Proposed fix: `display: grid; place-items: center` on `.sp-sheet-close` and drop the
  `margin: 0 auto`. One rule, and it makes the centring structural rather than dependent on how
  the UA resolves auto margins on a replaced element inside a button.

---

## STC-MOBILEM-1-05 MEDIUM The HUD menu's rows are 32.5 native pixels tall, below the 44 pixel floor this project holds elsewhere

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/276_mobile-m_hud_menu.png`.

- Claim: vertical scan at `x=320`, threshold 22, returns the panel's top border at `y` 1046 to
  1047 and the divider above `Mute` at `y` 1202 to 1203. `PAYTABLE` and `Session` share that 156
  pixel band, so each row is **78 upscaled, 32.5 native pixels**.

  Confirmed from source rather than left as a measurement:
  `frontend/src/lib/components/HudOverlay.svelte:1612` is `padding: 0.5rem 0.9rem` and `:1617`
  is `font-size: 0.8rem`, so the row computes to `8 + (12.8 * 1.2) + 8 = 31.4` native pixels
  against a measured 32.5. **The measurement and the specification agree to about one pixel.**

  The project's own floor is written down twice in the files this shard touched:
  `SessionPanel.svelte:198-199` says *"44px, not a smaller icon button size, a real touch
  target, same floor this project holds every interactive element to"*, and
  `HudOverlay.svelte:2039-2040` says *">=44px touch-target floor with headroom"*. Two of the
  three entries in the primary navigation menu do not meet it.

- Resolution note: NEW AT 1600PX. An 11 native pixel shortfall on a 44 pixel target is under
  five thumbnail pixels.

- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1612`. Not locked.

- Proposed fix: `padding: 0.85rem 0.9rem`, which takes the row to 44.4 native pixels and leaves
  the horizontal padding, and therefore the left edge in `STC-MOBILEM-1-11`, untouched.

---

## STC-MOBILEM-1-06 MEDIUM The BET pod carries a 137 native pixel dead gap between its label and its first control

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/265_mobile-m_base_idle.png`,
  and every base and win frame in the range, 264 to 274.

- Claim: row scan at `y=1305`, threshold 28, returns the pod's left border at `(28,31)`, the
  `BET` glyphs at `(63,86) (88,105) (119,125)`, the down stepper at `(453,558)`, the `$1.00`
  glyphs from 585 to 702, the up stepper at `(729,834)` and the right border at `(868,870)`.

  `BET` ends at `x=125`; the next thing on the row starts at `x=453`. **328 upscaled, 137 native
  pixels of nothing, inside an 842 pixel pod: 39 per cent of the control's width is empty**, and
  it is 36 per cent of the whole screen width.

- Resolution note: VISIBLE AT BOTH. The native pass did not report it and it is large enough
  that it should have been caught at either resolution.

- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1977`
  (`.p-bet-row { display: flex; align-items: center; gap: 10px; }`) and the markup at `:401-419`,
  where `.p-stat-label` and `.p-bet-row` are the two children of `.p-bet-stat` and the free
  space all lands between them. Not locked.

- Proposed fix: stack `BET` above its value the way `BALANCE` and `WIN` do in the row directly
  above it. That closes the gap and makes the three pods one family instead of two.

---

## STC-MOBILEM-1-07 MEDIUM A hard full width tonal seam where the scene layer stops and the HUD panel starts

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/265_mobile-m_base_idle.png`,
  and every base and win frame in the range, 264 to 276.

- Claim: the scene is visible behind the FEATURES bar and stops dead at `y = 1040` upscaled,
  native `y = 433`, with no border, no gradient and no highlight to explain the change.

  | x | y=1030 | y=1035 | y=1038 | y=1042 | y=1050 |
  |---|---|---|---|---|---|
  | 60 | 34 | 29 | 23 | 11 | 12 |
  | 300 | 38 | 33 | 27 | 12 | 13 |
  | 700 | 75 | 73 | 58 | 15 | 14 |
  | 860 | 69 | 70 | 54 | 13 | 13 |

  The drop is complete inside 4 upscaled pixels, under 2 native, at every column sampled, and it
  is a fall of one half to three quarters of the luminance. It reads as a composite seam rather
  than as a designed panel edge.

- Resolution note: VISIBLE AT BOTH.

- Where fixable: UNKNOWN. The seam is the boundary between the scene layer and the HUD's own
  background, and `.p-hud` at `frontend/src/lib/components/HudOverlay.svelte:1863` is one side
  of it, but which element draws the upper side was not established inside this pass's source
  budget.

- Proposed fix: fade the scene out over 24 to 32 pixels at that boundary, or give the HUD a
  deliberate top edge, a rule or an inner highlight, so the change is stated rather than left as
  an artefact.

---

## STC-MOBILEM-1-08 MEDIUM The `WIN!` flash centres on a four row grid, so it always lands in the row 2 to row 3 gutter and on the row 3 border

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/271_mobile-m_win_presentation.png`.

- Claim: bounding box of `WIN!`, threshold 120: `(380, 460, 529, 515)`. The grid, from the cyan
  cell borders in frame 276 at `x=25`, puts the row 2 cell's lower edge at about `y = 500` and
  the **row 3 cell's top border at `y` 513 to 517**. So the label starts inside the row 2 cell,
  crosses the gutter, and its lower edge lands on a lit cyan rule with no plate behind it.

  Horizontally it is fine: `WIN!` centres at `x = 454.5` against a column 3 centre of `x = 451`.

  The mechanism is in the source and is exactly what the native pass inferred from the picture:
  `frontend/src/lib/components/WinCelebration.svelte:51-53` is
  `position: absolute; top: 50%; transform: translate(-50%, -50%)`. **On an even row count, 50
  per cent of the grid is a gutter, never a cell.**

- Resolution note: VISIBLE AT BOTH. The native pass caught it at LOW (`STC-MOBILEM-A-10`) and
  its diagnosis was right; the measurement is new and makes the collision with the row 3 border
  explicit, so the severity is raised to MEDIUM.

- Where fixable: `frontend/src/lib/components/WinCelebration.svelte:51-53`. Not locked.

- Proposed fix: anchor the flash to the winning cell's own box rather than to the grid centre,
  and give it a backing plate so it can never sit on a rule.

---

## STC-MOBILEM-1-09 MEDIUM The big win banner's shock ring is not clipped to the band and overdraws the reel rows above and below it

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/272_mobile-m_transition_bigwin_countup_early.png`.

- Claim: a faint ring is drawn as part of the count up, centred at approximately `(450, 505)`
  with a radius of about 205 pixels. The band it belongs to spans `y` 331 to 655. **The ring's
  arcs are visible outside the band at both ends**, crossing the row 1 cells at about `y` 300 to
  331 and the row 4 cells at about `y` 655 to 710, so a celebration ornament is painted over
  live symbols.

  Stated honestly: the ring's radius here is read by eye rather than thresholded, because its
  contrast against the cell fills is close to the noise in the scene layer behind it. **That the
  arcs cross the band boundary is visible without measurement; the radius figure is approximate
  and is labelled as such.**

  The mechanism is in the source: `frontend/src/lib/components/WinBanner.svelte:351` is
  `overflow: visible` on the banner container, and the ring asset is
  `.../ui/particles/shock_ring.png` at `:255`.

- Resolution note: NEW AT 1600PX. The ring is close to invisible at thumbnail scale.

- Where fixable: `frontend/src/lib/components/WinBanner.svelte:351`. Not locked.

- Proposed fix: PARK(`overflow: visible` at `:351` is almost certainly load bearing for the
  particle fountain declared at `:126` and the coin layer at `:467`, so clipping the container
  would break a different effect. The ring alone needs bounding, not the container.)

---

## STC-MOBILEM-1-10 LOW The layout has no safe area allowance at either end: the logotype is 5.0 native pixels from the top, the SPIN button 9.6 native from the bottom

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/265_mobile-m_base_idle.png`,
  and every in play frame in the range, 264 to 276.

- Claim: column scan at `x=430` gives luminance 12 at `y=4` and `y=8`, then **196 at `y=12`**.
  The logotype's first ink is at `y = 12` upscaled, `12 / 2.3988 = 5.0` native pixels from the
  top edge.

  At the other end, column scan at `x=450` gives 168 at `y=1570`, 141 at `y=1575`, 21 at
  `y=1580`. The SPIN disc's fill ends at about `y = 1577`, **23 upscaled, 9.6 native pixels**
  from the bottom edge. Nothing is clipped in this capture, but on any handset with a notch or a
  home indicator both would be.

- Resolution note: VISIBLE AT BOTH for the top; the native pass found it (`STC-MOBILEM-A-09`)
  and its 5px figure is reproduced here exactly. NEW AT 1600PX for the bottom clearance.

- Where fixable: the top is `frontend/src/App.svelte:2459-2465` **per the superseded shard, not
  re-verified in this pass** (`grep -n "game-title"` on `App.svelte` returns nothing, so the
  selector is named something else and I did not spend a seventh source file on it). The bottom
  is inside `.p-hud` / `.p-controls-row`, `frontend/src/lib/components/HudOverlay.svelte:1863`
  and `:2023`, whose comment at `:1872` already claims `.p-controls-row` is pinned *"to the true
  bottom safe-area"*; the frame says 9.6 native pixels, so whatever that claim rests on is not
  producing an inset here. Not locked.

- Proposed fix: add `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` with
  fallbacks, and check the `:1872` claim, which currently reads as true and measures as not.

---

## STC-MOBILEM-1-11 LOW The HUD menu's labels and its slider labels share a CSS left edge but not an optical one

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/276_mobile-m_hud_menu.png`.

- Claim: first ink per row, threshold 80:

  | row | y | first ink |
  |---|---|---|
  | `PAYTABLE` | 1088 | `x = 67` |
  | `Session` | 1165 | `x = 69` |
  | `Mute` | 1246 | `x = 67` |
  | `MUSIC` | 1310 | `x = 76` |
  | `SOUND` | 1368 | `x = 75` |

  **The boxes are correct and the ink is not.** `.hud-menu-item` is `padding: 0.5rem 0.9rem`
  (`frontend/src/lib/components/HudOverlay.svelte:1612`) and `.audio-row` is
  `padding: 0.3rem 0.9rem` (`:1694`): the same `0.9rem` left inset, so the two families' content
  boxes start at the same `x`. The 9 upscaled, 3.8 native pixel difference is left side bearing,
  because `.audio-label` at `:1697-1701` is `var(--fs-font-display)` at `0.5rem` with
  `letter-spacing: 0.12em` while the menu items inherit the body face at `0.8rem`.

  **I originally wrote this up as a layout misalignment, on the argument that `Mute` and `MUSIC`
  start with the same `M` so side bearing was controlled for. That argument is void**: they are
  not the same `M`, they are two faces at two sizes. Kept at LOW as an optical alignment
  question, which is what it actually is.

- Resolution note: NEW AT 1600PX.

- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1694` (add a small negative
  `text-indent` or reduce `.audio-row`'s left padding by the measured 4 native pixels). Not
  locked.

- Proposed fix: PARK(optical alignment across two faces is an art call, and a 4 native pixel
  nudge hard-coded against one font is the kind of fix that rots at the next font change).

---

## STC-MOBILEM-1-12 LOW Casing drifts three ways inside one menu panel

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/276_mobile-m_hud_menu.png`,
  `275_mobile-m_transition_menu_opening.png`.

- Claim: in one 246 native pixel panel the five labels read `PAYTABLE`, `Session`, `Mute`,
  `MUSIC`, `SOUND`: upper, title, title, upper, upper, on five stacked siblings.

  The cause is that casing is carried in the literals for two of them and in CSS for the others.
  `Session` is a hardcoded literal at `frontend/src/lib/components/HudOverlay.svelte:546`,
  `PAYTABLE` comes from `{$tr('paytable')}` at `:545` so its casing lives in the locale files,
  and `MUSIC` / `SOUND` are uppercased in CSS by `.audio-label`, which sits in the same rule
  block as the `letter-spacing` at `:1697-1701`.

  Recorded outside the composition lens only because `KNOWN_OPEN.md` states plainly that
  *cross-surface capitalisation and button casing (charter classes 4 and 7) are gated nowhere;
  the frames are the instrument*. It is **not** `Q-34`, which is `Cruise` against `CRUISE` across
  surfaces; this is inside one panel.

- Resolution note: NEW AT 1600PX. At 334 tokens `Session` and `SESSION` are the same smudge.

- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:545-547` (the literals) and
  `:1697` (`.audio-label`). Not locked.

- Proposed fix: PARK(the direction is an art call, exactly as `Q-34` is). Whichever way it goes,
  set it in the CSS rather than in the literals, so the next label added inherits it.

---

## Draft claims refuted before this shard was finalised

The brief says a native-resolution claim that does not survive is a false positive worth as much
as a finding. The same has to apply to this squad's own claims, so the three I wrote into the
first draft of this file and then killed are recorded rather than quietly deleted. All three
were killed by going to the specification, which is convention (l.1) and (l.2) working exactly
as written.

**DRAFT-A, REFUTED. "The HUD menu panel is about 69 per cent opaque, so the balance figure reads
through it and lands on the menu's own labels", drafted at STREAM.** I solved a two-pixel
composite for alpha and got 0.688. **The sample pixel at `(150, 1157)` in frame 276 was not a
ghosted balance digit. It was an anti-aliased stroke of the menu's own word `Session`**, whose
glyph runs at `y=1165` are `(68,88) (91,129) (134,150) (155,157) (161,164) (177,186) (198,201)`
and cover `x=150` directly. Re-measured properly, over the 78 columns where frame 265 carries
digit ink at `y=1157` and frame 276 is behind the panel: **the digits composite to luminance 13
to 16, mean 15, against a panel background of 7 to 8.** Eight luminance units out of 255. That
is a ghost, not text. `.hud-menu` is `background: rgba(6, 6, 18, 0.96)` at
`HudOverlay.svelte:1603`, and 0.96 predicts `0.96*7.4 + 0.04*228 = 16.2` against a measured 15
to 16. **The native pass's 96 per cent was exactly right and its LOW rating was exactly right.**
I would have promoted a correct LOW to a wrong STREAM.

**DRAFT-B, REFUTED. "The four secondary controls are at most 43.8 native pixels across, below
the 44 pixel floor", drafted at HIGH.** I measured the visible discs at 100 to 105 upscaled and
treated that as an upper bound on the button box. It is not.
`frontend/src/lib/components/HudOverlay.svelte:2043-2046` declares `.p-round-btn` at
`width: 48px; height: 48px; min-width: 48px; min-height: 48px`, and `:2039-2040` comments
*">=44px touch-target floor with headroom"*. The button is 48 native, 115 upscaled. The disc
measures smaller because `:2050` is
`background: radial-gradient(circle at 36% 28%, #1a2636, #060b16 72%)`, so **the fill reaches
`#060b16`, luminance 11, before the box ends, and the outer ring of every button is
indistinguishable from the page at luminance 12.** The controls meet the floor. Only the menu
rows do not, and that half survives as `STC-MOBILEM-1-05`.

**DRAFT-C, REFUTED. "The four secondary controls sit 1.5 to 3.4 native pixels left of the SPIN
axis", drafted at LOW with an error bar.** Measured centre sums were 892 and 882.5 against an
expected 899, consistently left. The cause is the same gradient: `circle at 36% 28%` puts the
bright core at 36 per cent of the button's width, so **a luminance centroid sits about 16
upscaled pixels left of the geometric centre on every button identically**, which is the size
and the direction of the whole observed effect. The layout is symmetric by construction:
`.p-controls-row` is `justify-content: space-between` at `:2027`, both `.p-controls-side` are
`flex: 1 1 0` at `:2035`, and the last one is `justify-content: flex-end` at `:2037`. There is
no offset to fix.

---

## Native pass reconciliation

Every finding in `shards/superseded/STC-MOBILEM-A.md` that falls inside frames 260 to 277.

**`STC-MOBILEM-A-01` HIGH, paytable bullet markers against centred text.** OUT OF RANGE, its
frames are the paytable set 279 to 288. Belongs to the sibling squad holding 278 to 285. Not
reconciled here.

**`STC-MOBILEM-A-02` HIGH, the open HUD menu is 200px wide over a 375px viewport and slices the
live WIN and BET readouts in half.** **REFINED.** The slicing is confirmed: the panel's right
edge is at `x = 620` in frame 276, `$16.20` in the WIN pod renders as `16.20` with the `$`
behind the panel, and `$1.00` in the BET pod renders as `.00`. **The width figure is wrong, and
I can now say where it came from.** The panel spans `x` 30 to 620, which is 590 upscaled and
**246 native pixels**. `frontend/src/lib/components/HudOverlay.svelte:1602` declares
`min-width: 200px`, so 200 is the floor, not the rendered box; the sliders make it wider. It
matters: 246 of 375 is **66 per cent of the viewport**, not 53 per cent, which changes what a
fix has to do.

**`STC-MOBILEM-A-03` MEDIUM, the reel cabinet bleeds off both edges while every HUD panel is
inset 12px, so nothing shares a vertical edge.** **CONFIRMED, to the decimal.** Magenta border
scan at `y=965` puts the FEATURES bar at `x` 28 to 870; the same at `y=1305` puts the BET pod at
28 to 870; the BALANCE pod at `y=1135` is 29 to 440. Inset `28 / 2.3988 = 11.7` native, which is
the 12 reported. The cabinet's rails read bright at `x=4` and `x=894`, 2 native pixels from each
edge. Exactly as recorded.

**`STC-MOBILEM-A-04` MEDIUM, the win breakdown chip erases the reel window's bottom border
across the full width.** **CONFIRMED, and quantified.** See `STC-MOBILEM-1-01`: 850 of 899
pixels, 94.6 per cent, rail peak 222 to 9. "Full width" turns out to be very nearly literal.
Severity raised to HIGH on that evidence and on the chip surviving into frames 275 and 276.

**`STC-MOBILEM-A-05` MEDIUM, the chip's type does not compensate for the stage scale and lands
at about 6px of glyph.** **CONFIRMED.** In frame 273 the chip's glyph band at `x=450` runs `y`
803 to 818, 15 upscaled, **6.3 native pixels**, against "about 6px".
`frontend/src/lib/components/WinBreakdown.svelte:136` is `font-size: 0.7rem` and `:146` is
`0.62rem` for `.wb-ways`, neither of which compensates for anything. A claim made at thumbnail
scale that survives exact measurement, and that is worth saying as loudly as a refutation.

**`STC-MOBILEM-A-06` MEDIUM, the banner is pinned to a hardcoded stage y so its band is not
centred and the two surviving symbol strips differ by 18 per cent.** **REFINED.** The mechanism
is confirmed at source: `frontend/src/lib/components/WinBanner.svelte:346` is `top: 310px`, a
literal, with `transform: translateY(-50%)` at `:347`. The magnitude is understated. The band
measures `y` 331 to 655, centre 493; the reel window measures `y` 190 to 839, centre 514.5, so
the band sits **21.5 upscaled, 9 native pixels above the window's centre**. The surviving strips
measure `y` 218 to 331 above, 113 pixels, and `y` 655 to 800 below, 145 pixels: a **28 per cent
difference, not 18 per cent.** The diagnosis stands; the number does not.

**`STC-MOBILEM-A-07` LOW, the menu panel is 96 per cent opaque so the balance digits ghost
through and collide with its own `Session` label.** **CONFIRMED, and this is the most important
line in this shard.** The figure is exact: `HudOverlay.svelte:1603` is
`background: rgba(6, 6, 18, 0.96)`. The severity is right: re-measured over 78 digit-ink
columns, the ghost arrives at luminance 15 against a panel at 7, eight units out of 255. **This
re-run drafted a promotion of this row to STREAM on a contaminated sample and then refuted
itself**; the full account is DRAFT-A above. A native-resolution pass got this exactly right and
the higher-resolution pass nearly made it worse.

**`STC-MOBILEM-A-08` LOW, the splash leaves 421px of the 667px viewport empty and sits 9px below
centre.** **CONFIRMED on substance, figure not re-derived.** Frames 260 and 261 do carry a large
empty lower field below `TAP TO CONTINUE` and the block does sit low. I could not re-derive the
9px honestly: the splash's animated background streaks defeat a luminance bounding box, a
threshold 45 box over frame 261 returning `(0, 91, 657, 1384)`, contaminated at `x=0` and
`y=91`. The figure is neither confirmed nor refuted and is recorded that way rather than nodded
through.

**`STC-MOBILEM-A-09` LOW, the logotype sits 5px from the top edge with no safe-area
allowance.** **CONFIRMED exactly.** Column scan at `x=430` finds first ink at `y = 12` upscaled,
`12 / 2.3988 = 5.0` native. Carried above as part of `STC-MOBILEM-1-10`, which extends it to the
bottom edge.

**`STC-MOBILEM-A-10` LOW, the `WIN!` flash centres on a 4-row grid so it lands on the row 2 to
row 3 separator with no plate behind it.** **CONFIRMED, and the inferred mechanism is exactly
right.** Measured box `(380, 460, 529, 515)` against a row 3 top border at `y` 513 to 517, and
`frontend/src/lib/components/WinCelebration.svelte:51-53` is `top: 50%` with
`translate(-50%, -50%)`. Severity raised to MEDIUM because the label's lower edge sits on a lit
rule, which the native pass could not have seen. Carried above as `STC-MOBILEM-1-08`.

**Summary for frames 260 to 277.** Nine native findings in range. **Zero refuted. Six confirmed**
(A-03, A-04, A-05, A-07, A-09, A-10, four of them to the decimal or to the exact source value).
**Two refined with corrected figures** (A-02's width, A-06's 18 per cent). **One confirmed on
substance with its figure left open** (A-08). **The native pass did not over-claim once on this
viewport.** Where it was wrong it was wrong by understating, and the one row this re-run tried to
promote turned out to be the row the native pass had exactly right. Eight of the twelve findings
above are new; three drafted findings were refuted by this squad and are recorded above.

---

## Explicit absences, signed

Each was checked by measurement or against source, not by looking. The check is given so the
signature means something.

- **The reel grid is regular. No unequal cells, no clipped column, no row drift.** Cyan cell
  border scans in frame 276: column 1's left border reads `x` 21 to 23 in row 1 (`y=290`) and
  `x` 21 to 23 in row 4 (`y=727`); its right border reads 182 to 185 and 182 to 186 in the same
  two rows. Vertical scan at `x=25` puts row 1's top at 225, row 3's at 515 and row 4's at 661,
  so the row pitch is 145 and 146. **I had suspected from the picture that rows 2 to 4 were
  wider than row 1 and clipped at the frame; refuted**, and recorded so it is not rediscovered.

- **The session information modal is correctly aligned in every axis, and it is the best
  composed surface in the range.** All five row labels begin at `x = 101`; all five values end
  at `x = 795` or `796`; the modal spans `x` 44 to 853, gutters 44 and 46; it spans `y` 513 to
  1074, so 513 above and 526 below, 2.7 native pixels off vertical centre. The title's left edge,
  102, matches the labels' 101. Only its close glyph is wrong (`STC-MOBILEM-1-04`).

- **The intro rules card does not clip, does not scroll and is not off centre.** Card gutters 42
  and 42; heading, body and `Continue` all centre on the card's own centre at `x = 450`; the card
  sits 281 above and 285 below in a 1600 pixel viewport. Frames 262 and 263.

- **The HUD panel stack is internally symmetric.** FEATURES bar, BALANCE plus WIN row and BET pod
  all begin at `x` 28 to 29 and end at `x` 868 to 870.

- **The top and bottom cabinet chrome bars are the same height**, 40 and 39 pixels (`y` 126 to
  165 and 847 to 885 at `x=450`). I had suspected the top was thicker; refuted.

- **The BET stepper is symmetric about its value.** Down stepper ends at `x=558`, `$1.00` starts
  at 585; `$1.00` ends at 702, up stepper starts at 729. **27 pixels each side, exactly.** Pod
  insets 35 left, 36 right. The dead space in `STC-MOBILEM-1-06` is all in one place.

- **The bottom control row is symmetric and its buttons meet the 44 pixel floor.** See DRAFT-B
  and DRAFT-C above: `.p-round-btn` is 48 by 48 and `.p-controls-row` is `space-between` with
  equal-flex sides. Both of my suspicions here were wrong and both are written up rather than
  dropped.

- **No money string is clipped, ellipsised or overflowing anywhere in frames 260 to 277**, so
  `TR-115` / `TR-086` is NOT re-observed on this viewport at this magnitude. `$50,000.00`,
  `$16.20`, `$3.90`, `$1.00`, `$5.00`, `$20.10` and `+$15.10` all render complete. The only money
  string cut is cut by the menu panel overlaying it, which is a stacking fault
  (`STC-MOBILEM-A-02`) and not a fit fault.

- **No modal in this range exceeds its viewport and nothing in this range is a scrolling box
  hiding its own content.** The rules card, the HUD menu and the session panel are each smaller
  than the screen and fully visible. The scroll-box class of the ledger's clusters 2 and 3 is on
  the buy dialog and the paytable, frames 278 and up, outside this range.

- **The `×` convention is honoured on the intro rules card**, so `Q-26` is not re-observed there:
  frame 263 reads `1×`, `3×`, `10×`, `+1×` and `100×` with the multiplication sign, the glyph
  sitting at mid height and narrower than an `x`. That makes the banner's `16x BET` in frames 272
  to 274 a disagreement inside one session rather than an isolated slip, which is `MID-02` below.

- **What I did NOT check, named rather than implied:** colour and contrast, font identity and
  kerning, animation timing between consecutive frames, and the frames outside 260 to 277, which
  I did not open. The where-fixable for `STC-MOBILEM-1-03` and `STC-MOBILEM-1-07` is UNKNOWN
  because the source budget ran out at six files, and that is stated at each rather than filled
  with a plausible path.

---

## KNOWN matches

- **KNOWN(MID-01)**, the banner count up and the HUD WIN pod showing different amounts at the
  same moment. Fresh evidence for the mobile-m session, which the ledger's frame list does not
  yet name:
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/272_mobile-m_transition_bigwin_countup_early.png`
  shows the banner at **`$10.28`** while the HUD WIN pod reads **`$15.95`**, on a win that
  settles at **`$16.20`** in `274_mobile-m_bigwin_settled.png`. The two readouts disagree by
  **`$5.67`** at that instant. The desktop frame the ledger cites, `013`, reads `$10.29` and
  `$15.95`; mobile-m lands one cent lower on the banner, which is the same animation sampled a
  fraction earlier. The pattern reproduces on this viewport exactly as the ledger predicts.

- **KNOWN(MID-02)**, the win banner writing the multiplier with a letter `x`. Fresh evidence:
  `272_mobile-m_transition_bigwin_countup_early.png`,
  `273_mobile-m_transition_bigwin_countup_late.png` and `274_mobile-m_bigwin_settled.png` all
  render **`16x BET`** with the `x` on the baseline at full x height, against
  `263_mobile-m_intro_rules.png` in the same session rendering `1×`, `3×`, `10×` and `100×` with
  the mid height multiplication sign. Three more of the 60 frames the ledger counts.

- No other row of `KNOWN_OPEN.md` is matched in frames 260 to 277. `TR-104` needs a localised
  session and this is `en`. `TR-114` needs a replay surface. `Q-16`'s parked strings are on the
  autoplay panel and the paytable, outside this range. `Q-34`'s `Cruise` against `CRUISE` needs
  the features menu and the HUD badge, also outside this range; `STC-MOBILEM-1-12` is a different
  casing defect on a different surface and is filed as new rather than folded into `Q-34`.

---

tree_after:

```
?? reports/qa/stream_test/shards/STC-MOBILEL-1.md
?? reports/qa/stream_test/shards/STC-MOBILEL-2.md
?? reports/qa/stream_test/shards/STC-MOBILEL-3.md
?? reports/qa/stream_test/shards/STC-MOBILEM-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-2.md
?? reports/qa/stream_test/shards/STC-POPOUTS-3.md
?? reports/qa/stream_test/shards/STM-MOBILEL.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STT-MOBILEL-1.md
?? reports/qa/stream_test/shards/STT-MOBILEL-2.md
?? reports/qa/stream_test/shards/STT-MOBILEM-1.md
?? reports/qa/stream_test/shards/STT-MOBILEM-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-1.md
?? reports/qa/stream_test/shards/STT-POPOUTS-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-3.md
?? reports/qa/stream_test/shards/STT-MOBILEL-3.md
```

**Every line is `??`, untracked. Nothing shows as MODIFIED or DELETED, so this squad dirtied
nothing.** One of those lines, `STC-MOBILEM-1.md`, is mine; the rest belong to sibling squads
and are not this shard's concern. The committed evidence directory
`reports/screens/stream-test-2026-07-28/` was read from and never written to; all measurement
was done against `.evidence-scratch/stream-test-upscaled-1600/` and all analysis ran through
`python3` on stdin so that no scratch file was created either.
