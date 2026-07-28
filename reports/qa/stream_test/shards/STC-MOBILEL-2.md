# STC-MOBILEL-2, COMPOSITION (mobile-l, 425x812, frames 226 to 242, 1600px upscaled)
supersedes: STC-MOBILEL-A.md (its frames 226 to 233) and STC-MOBILEL-B.md (its frames 234 to 242)
scope: every `mobile-l` frame numbered 226 to 242 inclusive, 17 frames, read from `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`, each opened exactly once
frames_read: 17

All pixel figures below were sampled from the upscaled PNGs by decoding them to
raw RGB and measuring, not eyeballed. **Figures are given in pixels of the
UPSCALED frame (837 x 1600) with the native 425x812 equivalent stated beside
them.** The scale factor is 1600 / 812 = 1.97044, so 1 native px = 1.97 upscaled
px. Strings are transcribed verbatim in backticks.

Two findings this squad drafted after its frame pass were REFUTED by its own
re-test during source location and are recorded under absences rather than
deleted, because a near miss that leaves no trace teaches nothing.

---

## STC-MOBILEL-2-01 HIGH The Vite scaffold's `#app { text-align: center }` is still in the tree, and it is what centres the paytable's prose

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/231_mobile-l_paytable_04_rules.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/232_mobile-l_paytable_05_overdrive_free_spins.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/235_mobile-l_paytable_08_responsible_play.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/236_mobile-l_paytable_09_disclaimer.png`
- Claim: `frontend/src/app.css:139-143` still carries the unmodified Vite scaffold rule

  ```
  #app {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }
  ```

  `grep -rn "#app" frontend/src` returns **exactly one hit**, this one, so nothing
  overrides it, and `frontend/index.html:22` is `<div id="app"></div>`, the mount
  point for the whole game. `text-align` is an inherited property, so it reaches
  every text node in the application that does not reset it. The paytable does not
  reset it: `.fs-pt-body` (`frontend/src/lib/components/PaytableModal.svelte:593-601`)
  sets no `text-align`, `.fs-rules li` (`:668`) sets none, and `.fs-disc` (`:789`)
  sets none. The only four `text-align: center` declarations in `PaytableModal.svelte`
  are on `.fs-caption` (`:647`), `.fs-sym-note` (`:664`), `.fs-trig td` (`:678`) and
  `.fs-mode-card > .fs-face` (`:696`), none of them an ancestor of the rules list or
  the disclaimer. **The scaffold rule is the source of the centring.**

  What it costs on screen, measured:

  1. **The `DISCLAIMER` sets twelve consecutive lines of body copy centred**, ragged
     on both margins, beginning `Malfunction voids all wins and plays. A stable internet`
     and ending `Spinners. All rights reserved.` The `RESPONSIBLE PLAY` paragraph
     above it does the same over five lines. This is the longest continuous block of
     prose in the game and the block a compliance reviewer reads word by word.
  2. **It is the root cause of the superseded `STC-MOBILEL-A-04`**, the floating
     bullet markers, which that shard attributed to a `.rule-item` / `.pt-section`
     pair that does not exist under those names. The real mechanism is
     `.fs-rules li { padding-left: 16px; position: relative }` with
     `.fs-rules li::before { content: '›'; position: absolute; left: 0 }` at
     `PaytableModal.svelte:668-669` inheriting the scaffold's centring, so the marker
     is pinned and the text is not.

  The layout does not inherit the same rule's `padding: 2rem` or `max-width: 1280px`,
  because the game shell escapes the box (the reel frame reaches column 0 on `237`),
  which is exactly why the remnant survived: it is invisible in every way except the
  one that is inherited.
- Resolution note: VISIBLE AT BOTH for the centring itself. NEW AT 1600PX for the
  attribution, which is what makes it actionable: `STC-MOBILEL-A-04` reported the
  symptom at native scale and named a wrong owner for it.
- Where fixable: `frontend/src/app.css:139-143`. Not locked.
- Proposed fix: delete the scaffold `#app` rule outright, since none of its four
  declarations is doing wanted work, and set `text-align` explicitly on the surfaces
  that genuinely want centring. Landing it needs a sweep of every text surface,
  because an unknown number of them are currently relying on the inheritance, so this
  is a one line deletion with a real regression surface behind it. Escalates
  KNOWN_OPEN row **Q-27**, which sizes the scaffold remnants as "Visible only if any
  link or unstyled surface reaches a frame": the centring reaches every prose frame
  in this session and owns a HIGH composition finding.

## STC-MOBILEL-2-02 MEDIUM The paytable's close button is 38 x 38 CSS px, under the 44 px touch floor the same file honours elsewhere

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/227_mobile-l_paytable_top.png` (and unchanged on `226`, `228` to `236`)
- Claim: the close control's lit ring measures **x=675 to 748, y=187 to 261** upscaled,
  that is 74 x 75 upscaled px = **37.6 x 38.1 native px**. Source agrees to the
  half pixel: `frontend/src/lib/components/PaytableModal.svelte:584` is
  `.fs-pt-close { width: 38px; height: 38px; padding: 3px; border: none; cursor: pointer; flex-shrink: 0; }`.
  It is not wrapped in a larger hit surface, unlike the autoplay rows (see absences),
  so 38 x 38 is the whole target. The project already applies the 44 px floor and says
  so in its own comments: `HudOverlay.svelte:2039-2040` reads *"Every round control
  button: 48x48 real box (>=44px touch-target floor with headroom)"*, and
  `.auto-menu-item` (`HudOverlay.svelte:1785-1788`) and `.auto-menu-toggle` (`:1800-1811`)
  both carry `min-height: 44px`. This one control is 26 per cent short of a floor the
  rest of the interface holds, and it is the only way out of a full screen modal on
  the narrowest viewport that ships.
- Resolution note: NEW AT 1600PX. A 38 px against 44 px difference is 6 native px,
  which is under three upscaled pixels in a 460 token native capture; neither
  superseded shard raised a hit target anywhere.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:584`. Not locked.
- Proposed fix: take `width` and `height` to 44px, or keep the 38px chrome and add
  `padding: 6px; box-sizing: content-box` so the box reaches 44 without the ring
  growing. Check the same class on the FEATURES panel's close control, which reads
  the same size on `240`.

## STC-MOBILEL-2-03 MEDIUM The INTERFACE GUIDE artwork varies 10.6 times in drawn area inside identical 44 px boxes, so two rows read as empty plates

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/234_mobile-l_paytable_07_interface_guide.png`
- Claim: the CSS is uniform and correct.
  `frontend/src/lib/components/PaytableModal.svelte:736-746` gives every tile
  `width: 56px; height: 56px`, and `:747` gives every image
  `.fs-guide-img { width: 44px; height: 44px; object-fit: contain; }`. The artwork
  inside those identical boxes is not uniform. Measured glyph bounding boxes on `234`,
  upscaled then native, with the tile measured at 110 x 97 upscaled px:

  | Row | Asset (`PaytableModal.svelte`) | Glyph bbox, upscaled | Native | Area, upscaled px squared |
  |---|---|---|---|---|
  | `Spin` | `spin_button.png` (`:113`) | 57 x 57 | 28.9 x 28.9 | 3,249 |
  | `Increase Bet` | `btn_bet_plus.png` (`:114`) | 57 x 29 | 28.9 x 14.7 | 1,653 |
  | `Decrease Bet` | `btn_bet_minus.png` (`:115`) | 57 x 28 | 28.9 x 14.2 | 1,596 |
  | `Features` | `feature_button.png` (`:116`) | 71 x 48 | 36.0 x 24.4 | 3,408 |
  | `Autoplay` | `btn_autoplay.png` (`:117`) | **16 x 20** | **8.1 x 10.2** | **320** |
  | `Menu` | `btn_menu.png` (`:118`) | 24 x 24 | 12.2 x 12.2 | 576 |

  `btn_autoplay.png` draws its mark at **8.1 x 10.2 native px inside a 44 x 44 CSS px
  box**, occupying 320 upscaled px squared against `feature_button.png`'s 3,408, a
  ratio of **10.6 to 1**. Because `object-fit: contain` scales to fit rather than to
  the ink, an asset with a large transparent margin renders small and nothing in the
  layout compensates. In a vertical stack of six identically framed tiles read as one
  list, two of the six are near empty. `feature_button.png` is additionally the only
  one rendering as a multi colour raster thumbnail rather than a flat single colour
  glyph, so the column mixes two icon families as well as two optical weights.
- Resolution note: NEW AT 1600PX. The `Autoplay` mark is 8 x 10 native px; relative
  icon weight is not resolvable in a native `mobile-l` capture at all.
- Where fixable: the asset artwork, not the CSS. The six files are named at
  `frontend/src/lib/components/PaytableModal.svelte:113-118`; `:747` is already
  correct and should not be changed.
- Proposed fix: re-export `btn_autoplay.png` and `btn_menu.png` (and check
  `btn_bet_plus.png` / `btn_bet_minus.png`, which are half height) so every guide
  asset fills a common optical box, rather than adding per icon scale overrides in
  CSS, which would leave the assets inconsistent for every other consumer.

## STC-MOBILEL-2-04 MEDIUM The paired `Normal` / `Cruise` card starts its two columns at 26 px and 12 px, so the pair does not read as a pair

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/240_mobile-l_features_menu.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/239_mobile-l_transition_features_menu_opening.png`
- Claim: the card's borders sample at **x=78 to 82** and **x=757 to 761** upscaled, and
  the divider between the two options sits on its midline. The left column's leading
  element, the `Normal` radio, samples at **x=133**, an inset of **51 upscaled px =
  25.9 native px** from the card's inner border. The right column's leading element,
  the `Cruise` radio, samples at **x=446**, an inset of **27 upscaled px = 13.7 native
  px** from the divider. The source gives the exact figures and the exact reason:
  `frontend/src/lib/components/FeatureMenu.svelte:918` is
  `.fm-paired-face { flex-direction: row !important; align-items: stretch !important; padding: 12px 14px !important; gap: 0 !important; }`
  and `:919-922` is
  `.fm-paired-opt { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 0.4rem; padding: 0 12px; text-align: left; }`,
  with the divider drawn by `:923`,
  `.fm-paired-opt:first-child { border-right: 1px solid rgba(255, 255, 255, 0.12); }`.
  So the outer leading inset is `14 + 12 = 26px` and the inner one is `12px` alone,
  because `gap: 0` gives the divider no clearance of its own. **26 against 12, a factor
  of 2.2**, measured on screen as 25.9 against 13.7 native px, the 1.7 px difference
  being the 1 px divider plus the antialiased edge of the radio dot. On the one card
  in the panel built as a symmetric two up comparison, `Normal` and `Cruise` do not
  begin at the same distance from the edge each sits against.
- Resolution note: NEW AT 1600PX. The difference is 12.2 native px measured between
  element edges that are 1 to 2 native px wide.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:918-922`. Not locked.
- Proposed fix: move the horizontal padding entirely onto the options so both leading
  insets are the same number: `.fm-paired-face { padding: 12px 0 !important; }` with
  `.fm-paired-opt { padding: 0 26px; }`. That keeps the outer inset at its current 26px
  and lifts the inner one to match, rather than shrinking the outer, which would tighten
  a card that is already the widest in the panel.

## STC-MOBILEL-2-05 LOW Two lit vertical bands frame the buy dialog at the viewport edges, and I could not determine what lights them

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/242_mobile-l_dialog_buy_overdrive.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/241_mobile-l_transition_dialog_buy_overdrive_opening.png`
- Claim: **stated first so it is not mistaken for a defect it is not.** The strip itself
  is by design. `frontend/src/lib/components/BuyBonus.svelte:174` is
  `width: min(94vw, 460px)`, so at 425 native px the dialog is 399.5 native px wide,
  leaving `3vw` = 12.75 native px at each edge. I measured the dialog's magenta border
  at **x=25 and x=810** upscaled, a width of 399 native px. **The geometry matches the
  specification and is not a finding.**
  What is a finding is the brightness of those two strips. At `y=800` in `242` the strip
  reads `(90, 140, 179)` at `x=0`, `(56, 72, 120)` at `x=10` and `(71, 78, 127)` at
  `x=20`, against the dialog's own fill of `(10, 10, 31)`. Read down the column `x=10`
  it is structured rather than flat: `(26, 28, 49)` at `y=180`, a steady blue
  `(56, 71, 117)` from `y=300` through `y=900`, then a magenta `(55, 17, 58)` from
  `y=1020` through `y=1380`. The same column in `240`, with the FEATURES panel open and
  no dialog over it, reads `(3, 32, 37)`. **Opening the dialog made the uncovered edge
  strip about 3.4 times brighter than it was**, and the dialog's backdrop is
  `.buy-backdrop { background: rgba(0, 0, 0, 0.6) }` (`BuyBonus.svelte:165-166`), which
  can only darken. Something else is lighting it. The two candidates I could not
  separate from the frames are `.buy-modal`'s own
  `box-shadow: 0 0 34px rgba(255, 46, 196, 0.5), 0 0 70px rgba(138, 92, 255, 0.22)`
  (`BuyBonus.svelte:178`), whose 70 px violet blur reaches well past the 12.75 px strip,
  and the FEATURES panel's own glow showing through the 0.6 scrim. The colour changing
  with `y` fits the second and not the first; the magnitude fits the first.
- Resolution note: NEW AT 1600PX. `STC-MOBILEL-B`'s absence list treats every modal in
  this range as cleanly gutter symmetric, which it is; the brightness of the gutter is
  the part a native capture cannot carry.
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:165-166` (the scrim) and
  `:178` (the shadows), neither locked.
- Proposed fix: PARK(the mechanism is not established and guessing at it would put an
  unverified cause into the ledger, which is what convention (l.6) exists to stop). The
  cheap diagnostic for whoever picks it up: drop the `70px` violet shadow to `0` in a
  scratch build and re-measure `x=10, y=800`. If the strip stays lit, it is the panel
  through the scrim and the scrim wants raising; if it darkens, it is the shadow and the
  modal wants `overflow: hidden` on its backdrop.

---

## Native pass reconciliation

Two superseded shards overlap my range. `STC-MOBILEL-A` covers frames 208 to 233, so
its findings on 226 to 233 are mine to reconcile; `STC-MOBILEL-B` covers 234 to 259,
so its findings on 234 to 242 are mine. Everything else in both belongs to a sibling
squad and is named as out of range rather than guessed at.

**Summary: 7 CONFIRMED, 3 REFINED, 2 REFUTED, 12 out of range.**

### From STC-MOBILEL-A (frames 226 to 233 only)

- **A-01, A-02, A-03, A-06, A-07, A-08, A-11, A-12, A-13: OUTSIDE MY RANGE.** Their
  cited frames are `213` to `225`. Not reconciled, not mine.
  One measurement offered as fresh evidence rather than as a verdict: **A-13**'s dead
  gap in the bet pod reproduces on `237`, which IS in my range. The `BET` label's last
  lit column is **x=107** and the next lit element in the bar is **x=504**, on a bar
  spanning x=25 to x=811. Crediting the stepper button's unlit border back to about
  x=473, the empty span is at least **366 upscaled px = 186 native px of a 399 native
  px bar**, 47 per cent of it. A-13 said "roughly 190 device pixels". **Confirmed to
  within 4 native px on a frame A-13 did not cite.**
- **A-04 (frames 231, 232), the paytable bullets: CONFIRMED, with sharper figures and a
  corrected owner.** In `231` the `›` marker samples at **x=73 to 77 on every one of the
  six items**, while the first lit column of the text varies: `x=108` for both
  `Symbol values shown are per matching way;` and `3, 4, or 5 SCATTERs anywhere apply a 1×, 3×,`,
  `x=128` for `Maximum win per spin is capped at 5,000×`, `x=146` for
  `WILD substitutes for all symbols except`, `x=157` for
  `Wins pay left to right on adjacent reels`, `x=171` for
  `Malfunctions void all pays and plays.` The marker to text gap is therefore
  **31, 31, 51, 69, 80 and 94 upscaled px = 15.7, 15.7, 25.9, 35.0, 40.6 and 47.7
  native px**, a **3.0 times spread inside one six item list**. A-04 estimated "roughly
  17" to "roughly 46"; the true range is 15.7 to 47.7, so its worst case is slightly
  worse than reported. **A-04's `Where fixable` is wrong**: there is no `.rule-item` and
  no `.pt-section` in `PaytableModal.svelte`. The real pair is `.fs-rules li` and
  `.fs-rules li::before` at `PaytableModal.svelte:668-669`, and the centring they
  inherit comes from `app.css:143`, which is my STC-MOBILEL-2-01.
- **A-05 (frame 233), the `COST` column allegedly left aligned under a centred header:
  REFUTED.** Measured on the `Normal` card of `233`, glyph group extents and midpoints,
  upscaled:

  | Column | Header | Header centre | Value | Value centre | Offset |
  |---|---|---|---|---|---|
  | `COST` | x=171 to 226 | 198.5 | `1x` x=192 to 211 | 201.5 | +3.0 px = **1.5 native px** |
  | `COST` second line | | 198.5 | `$1.00` x=173 to 229 | 201.0 | +2.5 px = **1.3 native px** |
  | `RTP` | x=397 to 440 | 418.5 | `96.35%` x=369 to 468 | 418.5 | 0.0 px |
  | `MAX WIN` | x=587 to 684 | 635.5 | `5,000×` x=591 to 681 | 636.0 | +0.5 px = 0.3 native px |

  A-05 claimed the two stacked cost values are "flush left" and sit "roughly 10 device
  pixels left of the header's centre". They are centred, and the residual is **1.5
  native px to the RIGHT**: wrong by about a factor of seven in magnitude and wrong in
  direction. All three columns are centred to within 1.5 native px of their headers.
  **This is a native resolution false positive and it must not reach the ledger.**
- **A-09 (frames 227, 228, 230), "the scroll region fades at the bottom and hard clips
  at the top": REFINED, with its bottom half REFUTED.** The top clip half is correct
  and I confirm it: on `228` the intro card's top border and both top corners cut flush
  against the header rule at y=292 to 298, and on `230` the `SYMBOL PAYOUTS` heading
  meets the same hard line. **There is no bottom fade.** Measured on `234`, the word
  `Turbo` at the very bottom of the scroll region has per row peak luminances of 151,
  197, 243, 244, 255, 252, 255, 255, 255, 255, 255, 255, 255, 255, 252 across rows
  y=1433 to 1447, and the panel's opaque bottom border then occupies y=1448 to 1451.
  The `Menu` title mid panel, same style, peaks at 255 as well. **The type is at full
  brightness in the last row before the cut**, so nothing is fading it; the leading 151
  and 197 are the antialiased tops of the glyphs. A-09 read the SCAT card's muted tan
  body copy on `227` as a fade when it is a colour difference. This matters because
  A-09 and B-05 contradict each other on the same mechanism, and B-05's
  `grep -rn "mask-image" frontend/src/` returning nothing is the reading that survives
  at full resolution.
- **A-10 (frame 232), the `BUY FEATURE` bar's padding: REFUTED.** Measured on the bar's
  own row, y=1270: the bar's left border occupies **x=70 to 74** and its right border
  **x=764 to 769**. The label `BUY FEATURE` begins at **x=114**, 44 upscaled px from the
  bar's outer left edge. The price `$100.00` ends at **x=725**, 44 upscaled px from the
  bar's outer right edge. **The two insets are equal to the pixel, 44 upscaled px =
  22.3 native px each.** A-10 claimed "roughly 21 device pixels" against "roughly 11";
  the 21 is right, the 11 is wrong by a factor of two, and the asymmetry it reports does
  not exist. **Second native resolution false positive.**

### From STC-MOBILEL-B (frames 234 to 242 only)

- **B-03, B-04, B-08, B-12: OUTSIDE MY RANGE.** Their cited frames are `247` and `254`
  to `259`. Not reconciled, not mine.
- **B-01 (frames 239, 240), the FEATURES bet stepper wrap: CONFIRMED independently and
  to within half a native pixel.** I found this on my own frame pass before reading the
  shard. Measured on `240`: the `[-]` button's border box spans **x=418 to 507** with
  its left border running **y=288 to 329**, centre (462.5, 308.5); the `[+]` button's
  border box spans **x=112 to 199** with its left border running **y=373 to 405**,
  centre (155.5, 389). Centre separation is **307 upscaled px = 155.8 native px
  horizontally** and **80.5 upscaled px = 40.9 native px vertically**, against B-01's
  155.5 and 41.5. The bar spans **y=260 to 413** at its left border x=76, and the
  second row holds nothing but the `[+]`, leaving **x=199 to 765 by y=355 to 413**,
  about **287 x 29 native px of empty card**, against B-01's "about 285 x 28 px". Two
  independent measurements of the same geometry agreeing to half a native pixel.
  **Severity STREAM stands and this remains the worst thing in my range.**
- **B-02 (frame 238), the autoplay popover anchored hard right: CONFIRMED.** The panel's
  fill boundary samples at **x=383 and x=810** upscaled = **194.4 and 411.1 native px**,
  a left gutter of **194 native px** against a right gutter of **13 native px** on a 425
  px viewport, against B-02's 193 and 12. Its top edge sits between y=525 and y=556
  upscaled, well inside the reel window, so the four option labels are read over the
  board exactly as reported.
- **B-05 (frames 234, 235, 236, 240), scroll regions cut mid glyph with no mask:
  CONFIRMED, REFINED with the exact cut row, and WIDENED.** On `234` the word `Turbo`
  occupies rows **y=1433 to 1447** and the panel's opaque bottom border occupies
  **y=1448 to 1451**, so the glyphs are severed at y=1447 at **full luminance 255**.
  B-05's "roughly the top 60 per cent of the glyphs" is the right order. The class is
  wider than B-05's four frames: on `230` the `M1` card shows `3x` `0.45` and `4x` `1.5`
  and its `5x` row is gone entirely; on `231` the bullet
  `3 or more Scatters during free spins award` is severed at the same border; on `232`
  the first `BET MODES` card is cut about 35 upscaled px after it begins; on `233` the
  fourth bet mode card is cut the same way. **Nine of my ten paytable frames slice
  content at the panel's bottom border.** One correction to B-05's framing: the scroll
  region is not affordance free in source. `PaytableModal.svelte:602-603` styles an
  8 px `::-webkit-scrollbar` with a themed thumb, and `:599-600` sets
  `scrollbar-width: thin`. **That scrollbar appears in none of my ten paytable frames**,
  which is consistent with an overlay scrollbar that only paints while scrolling, so
  the affordance exists in code and not on screen at any moment a capture caught. The
  fade is what is genuinely absent.
- **B-06 (frames 255, 237), reel machine and control stack inset differently: REFINED,
  and the defect is four times larger than reported.** B-06 sampled the reel frame at
  x=8 and x=418 native and called those the border. Measured on `237`, which B-06 also
  cites and which is in my range, at row y=600: the left edge reads `(86, 221, 240)` at
  **x=0**, `(17, 220, 239)` at x=3, and stays above G=150 to x=15, then falls to
  `(9, 66, 76)` at x=18 before the cell border at x=21 and the cell fill
  `(10, 34, 46)` from x=24. The right edge is dark `(11, 15, 28)` from x=806 to x=818,
  then `(9, 79, 102)` at x=821 and bright cyan `(10, 176, 214)` rising to
  `(19, 214, 236)` from x=824 to **x=836**, the last column of the frame. **The reel
  frame's lit border therefore occupies column 0 and column 836: the gutter is 0 native
  px on both sides, not 8 and 6.** What B-06 measured is the INNER edge of a border
  stroke about 16 upscaled px = 8 native px thick, which at native scale is one to two
  pixels wide and not separable from the fill. Against it, the control stack is
  genuinely inset: the `BALANCE` pod's cyan border samples x=34 to 399 and the `WIN`
  pod's magenta border x=437 to 803, margins of **17.3 and 16.8 native px**. So the
  step between the two full width edges is **0 against 17 native px, not "about 4 px"**.
  B-06's conclusion is right and its measurement understated it by a factor of four.
- **B-07 (frames 255, 237, 259), no safe area at either end: CONFIRMED on `237`.** The
  `FUTURE SPINNER` wordmark's bounding box on `237` is **x=276 to 562, y=9 to 70**, so
  its topmost lit row is **9 upscaled px = 4.6 native px** from the top of the viewport.
  The `SPIN` disc sampled down its own centre column x=418 spans **y=1438 to 1580**, so
  its lowest lit row is **19 upscaled px = 9.6 native px** from the bottom. B-07
  reported 5 px and 7 px on `255`. Same defect, same order. One figure B-07 did not
  have: below the wordmark there are **96 upscaled px = 48.7 native px** of empty
  background before the next element at y=166, so the wordmark carries 4.6 native px
  above it against 48.7 below it.
- **B-09 (frames 237, 255, 245), the 63 px empty band: CONFIRMED on `237`.** The reel
  machine's lower chrome and the FEATURES pill are separated by **124 upscaled px = 63
  native px**, against the 22 to 37 upscaled px = 11 to 19 native px gaps separating
  every other pair in the control stack. B-09's own counter argument, that
  `.canvas-slot.portrait` is `flex: 1 1 0` and the surplus is being centred rather than
  left as a hole, is the reading I would also reach, so I confirm the figure without
  reopening the judgement.
- **B-10 (frames 241, 242 in my range), `bet?` orphaned: CONFIRMED.** Both frames set
  the subtitle as `Start Overdrive Free Spins now at 100× your` on a full width first
  line with `bet?` alone and centred on the second, directly under the title
  `Buy Overdrive`. Frames `243` and `244`, the NITRO pair B-10 also cites, are outside
  my range.
- **B-11 (frame 242 in my range), the `PRICE` / `RTP` / `MAX WIN` row losing its
  baseline: CONFIRMED.** `PRICE` reads `$100.00` on one line, `RTP` reads `96.35%` on
  one line, and `MAX WIN` reads `5,000×` with `base bet` wrapped to a second line, so
  the third cell is two lines deep and the strip's internal bottom padding is visibly
  larger under the two single line cells. Frame `244` is outside my range.

---

## Explicit absences, signed

Signed for the 17 frames under scope, each opened once at 1600px and, wherever a claim
depended on a figure, measured from the decoded pixels.

- **I DREW AND THEN REFUTED MY OWN FINDING that the HUD `WIN` pod paints over the
  autoplay panel.** Recorded in full because it is the exact error this re-run exists to
  catch and I made it. After the frame pass I had measured the autoplay panel's fill as
  perfectly flat at luminance 17 across `x=430..540, y=1215..1252` in `238`, and found
  maxima of 168 and 149 in neighbouring windows, and read those as the pod's `$16.20`
  and `WIN` arriving through the panel. **They are the panel's own text.**
  `HudOverlay.svelte:1791` sets `.auto-menu-item { color: #ffc832 }`, whose luminance is
  `(255 + 200 + 50) / 3 = 168.3`, and my window had caught the `50` option. The decisive
  re-test scans the maximum luminance across the panel's full width `x=390..805` row by
  row: at `y=1225` through `y=1250`, where `237` reads **236** with RGB
  `(255, 199, 255)` for `$16.20`, frame `238` reads a maximum of **23** with RGB
  `(18, 16, 37)`. At `y=1185` to `1195`, where `237`'s `WIN` label reads 152 to 155,
  `238` reads 21. The only bright pixels anywhere in the band are `(254, 198, 50)` at
  `y=1205` to `1225`, which is `#ffc832`. The arithmetic agrees: `.auto-menu` is
  `background: rgba(10, 10, 30, 0.97)` (`HudOverlay.svelte:1775`), so a 190 luminance
  glyph beneath it would composite to about **22**, not 168. **The autoplay panel covers
  the HUD completely and correctly.** No finding. Note for the marshal: this is a
  different panel from `STC-MOBILEL-A-03`, which reports genuine bleed on the HUD MENU
  panel at `rgba(10, 14, 22, 0.92)` on frames `223` and `224`, outside my range and not
  affected by this refutation.
- **I ALSO DREW AND THEN REFUTED a touch target finding on the autoplay checkboxes.**
  They measure **36 x 35 upscaled = 18.3 x 17.8 native px** (bounding box x=415 to 450,
  y=617 to 651 on `238`), which matches `HudOverlay.svelte:1815-1816`,
  `.auto-menu-toggle input { width: 20px; height: 20px }`. That is the visible box only.
  The markup at `HudOverlay.svelte:503-509` wraps each input in a `<label>` carrying
  `.auto-menu-toggle`, which is `min-height: 44px; padding: 0.5rem 1rem` at `:1800-1811`
  inside a panel of `min-width: 220px` at `:1782`. **The tap target is the whole 220 x 44
  CSS px row and is compliant.** No finding. The paytable close button, STC-MOBILEL-2-02,
  survives precisely because it has no such wrapper.
- **Modal centring in the viewport.** Measured rather than eyeballed. The paytable panel
  in `227` samples at **x=34 and x=803** (margins 34 and 33 upscaled = 17.3 and 16.8
  native px) and **y=147 and y=1452** (margins 147 and 147 upscaled, identical to the
  pixel). The buy dialog in `242` samples at **x=25 and x=810** (margins 25 and 26) and
  **y=180 and y=1418** (margins 180 and 181). Both modals are centred to within one
  upscaled pixel in both axes. No finding.
- **Cluster 2, the buy confirm dialog with no reachable CONFIRM or CANCEL, does NOT
  reproduce at mobile-l.** In `242` the `CANCEL` and `BUY` buttons are both fully drawn,
  both inside the dialog and both inside the viewport, with the dialog's own bottom
  border 51 upscaled px below them at y=1418. The dialog needs no scrolling at 425x812.
  Stated explicitly because six squads reported that cluster at other viewports and its
  absence here is a fact rather than an omission.
- **The symbol payout card grid aligns.** Measured on `230` at row y=760: the left
  card's borders sample x=70 to 74 and x=404 to 407, the right card's x=431 to 435 and
  x=765 to 769, so the cards are 337 and 338 upscaled px wide with a 24 px gutter, both
  flush with the section rule that samples x=71 to 769 in `232`. Row edges align
  exactly: both cards' bottom borders fall at y=692 to 695 and both following cards' top
  borders at y=719 to 723. I opened this specifically because the left card first looked
  taller to me. It is not. No finding, and `STC-MOBILEL-A`'s absence on the same grid is
  upheld.
- **The OVERDRIVE FREE SPINS table.** `STC-MOBILEL-A`'s completing pass raised its own
  candidate here and refuted it; I re-tested at 1600px and **its refutation holds**. The
  row rules sample x=71 to 769, centre 420. The header block spans `SCATTERS` x=94 to
  235, `FREE SPINS` x=289 to 444, `INSTANT AWARD` x=510 to 730, so the block's outer
  extent is x=94 to 730, centre **412**, which is **8 upscaled px = 4.1 native px** left
  of the rules' centre. The column centres are 164.5, 366.5 and 620, spacings of 202 and
  253.5 upscaled px, exactly the content sized asymmetry A's note predicted. A 4.1 native
  px offset on a 354 native px rule is inside what I am willing to call centred. **No
  finding raised, and the prior refutation is upheld rather than quietly dropped.**
- **The `BUY FEATURE` bar's padding** is equal to the pixel; see the A-10 reconciliation.
  No finding.
- **The bottom control row in `237` is centred.** The `SPIN` disc samples x=336 to 502,
  centre **419**, against a viewport centre of 418. The leftmost control's lit run begins
  at x=27 and the rightmost ends at x=803, margins of 27 and 33 upscaled px = 13.7 and
  16.8 native px. Those runs are chrome extents read at a threshold rather than button
  boxes, and a 3 native px difference read off a soft edged circle is not clean enough to
  support a finding, so I raise none.
- **The autoplay option list is not clipped.** Checked because the `∞` looked short. The
  five options sit at y=1042, 1130, 1216, 1302 and 1391 upscaled, a pitch of 88, 86, 86
  and 89 px, and the panel's bottom border is 43 upscaled px = 22 native px below the
  last one. The `∞` is short because it has no ascender or descender. This is KNOWN(Q-07)
  and allowlisted. No finding.
- **Money fit at this viewport.** No currency figure in my 17 frames is clipped,
  ellipsised or overflowing: `$50,000.00` sits inside the `BALANCE` pod with the pod's
  border at x=34 and x=399 and the digits at x=72 to 362, `$16.20` inside the `WIN` pod,
  `$100.00` inside both the paytable `BUY FEATURE` bar and the buy dialog's `PRICE` cell,
  `$1.00` and `$1.25` on the FEATURES cards. **This run adds no fresh mobile-l evidence
  to TR-115 / TR-086**, and I state that rather than leaving silence to be read either
  way.
- **Cluster 1, the reel window going transparent mid spin, cannot be judged from my
  range.** My 17 frames contain no spin transition; the only base game frames are `237`
  and `238`, both settled on a completed win. I make no claim about it.
- **The win detail strip in `237` reads `M3  x5  8 ways  $16.00` while the `WIN` pod 210
  upscaled px below it reads `$16.20`.** I checked this because two money figures within
  one screen height is the MID-01 shape. It is not: the strip is prefixed
  `M3  x5  8 ways`, which labels it as one symbol's contribution rather than the round
  total, and this is a settled frame rather than a count up. **Not raised**, recorded so
  my silence is a decision rather than a miss.
- **Duplicate captures.** All four transition and settled pairs in my range are byte
  different: sha256 prefixes `226` `7417a3e493` against `227` `70495c1ab8`, `235`
  `e00f0ccd7d` against `236` `8c3c0736a4`, `239` `6fc72aff57` against `240` `3bb3f919fc`,
  `241` `82582e4602` against `242` `7f261a8a09`. They are nevertheless compositionally
  indistinguishable to my eye, so **I could not judge any mid open or mid close state in
  my range** and I raise no transition finding. `235` and `236` are identical in content
  because the paytable is already at maximum scroll in both, which is a capture artefact
  and not a defect.
- **`MAX` chrome.** `MAX` is set as bare amber type where its three sibling circles carry
  ring chrome; that is `STC-MOBILEL-A-11`, whose cited frames are outside my range, and
  I do not renumber it.

## KNOWN matches

- **KNOWN(Q-27), with the row's severity escalated.** The scaffold remnants are not
  "visible only if any link or unstyled surface reaches a frame". `app.css:139-143`'s
  `text-align: center` is inherited by every prose surface in the game and owns
  STC-MOBILEL-2-01 above and the true cause of `STC-MOBILEL-A-04`. Evidence frames
  `231`, `232`, `235`, `236`.
- **KNOWN(Q-26)**, fresh evidence at 1600px:
  `240_mobile-l_features_menu.png` and `239_mobile-l_transition_features_menu_opening.png`
  put both glyphs **inside one card**: the OVERBOOST blurb reads
  `Double-chance: about 1.6x the feature trigger rate. Debits 1.25x every spin while ON.`
  with the ASCII letter, and the same card's right column reads `1.25× bet` with the
  sign, about 500 upscaled px apart. `233_mobile-l_paytable_06_bet_modes.png` carries
  `1.25x` beside `5,000×` in one three column row, and
  `232_mobile-l_paytable_05_overdrive_free_spins.png` carries
  `Bonus Buy: pay 100× your bet` with the sign. The row stays open; this is evidence,
  not a new finding.
- **KNOWN(Q-07)**: the `∞` option on `238_mobile-l_autoplay_menu.png`. Allowlisted,
  reviewed and kept, so not a finding. Pitch measured under absences.
- **KNOWN(Q-16 park)**, visibility evidence at this viewport:
  `238_mobile-l_autoplay_menu.png` shows `Stop on win`, `Single win limit`,
  `Stop on feature`, `Loss limit` and `SPINS`, the last of these hardcoded in markup at
  `HudOverlay.svelte:513` as `<div class="auto-menu-sep">Spins</div>` rather than routed
  through `$tr`. `230`, `234`, `235` and `236` show `SYMBOL PAYOUTS`,
  `INTERFACE GUIDE`, `RESPONSIBLE PLAY` and `DISCLAIMER`. This is an `en` session, so
  the park's urgency is unchanged by it. The row stays parked.
- **KNOWN(Q-34)**: `233_mobile-l_paytable_06_bet_modes.png` and
  `240_mobile-l_features_menu.png` both render the mode name as `Cruise`, the non
  uppercased side of the row. No HUD badge appears in my range, so I have no cross
  surface pair and add nothing beyond confirming which side these two surfaces sit on.
- **MID-01 and MID-02 do not appear in my range.** Checked rather than assumed: no big
  win banner and no count up frame falls in 226 to 242, and the only multiplier bearing
  units in my frames are `1×`, `3×`, `10×`, `100×`, `5,000×` and `1.25× bet`, all with
  the sign, plus the Q-26 instances above.
- **TR-104 and TR-114 do not apply.** TR-104 is a localised session finding and this
  session is `en`; no replay surface appears in my range.

tree_after: see the block at the close of this run, reproduced verbatim in the squad's
structured return.
