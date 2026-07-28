# STC-MOBILEM-2, COMPOSITION (stream-test-2026-07-28, frames 278 to 294, 1600px upscaled)
supersedes: STC-MOBILEM-A.md (its frames 283 to 285 only) and STC-MOBILEM-B.md (its frames 286 to 294 only)
scope: the `mobile-m` frames numbered 278 to 294 inclusive, 17 frames, read from
`/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`. Native viewport
`375x667`; the upscaled frames are `899x1600`, so the scale factor is
**`1600 / 667 = 2.3988`** and every pixel figure below that is labelled "upscaled" divides
by 2.3988 to give CSS pixels. Frames 260 to 277 belong to a sibling squad and were not
opened; frames 295 to 311 likewise.
frames_read: 17

**Method note, because the brief asks for measurement rather than impression.** After the
single visual pass over all 17 frames, geometry was read back numerically from the same
PNGs with `ffmpeg -f rawvideo -pix_fmt rgb24` and a pure-python sampler, so every
coordinate below is a measured pixel column or row rather than an eyeballed one. Four
things I had written down from the visual pass did not survive that check and are recorded
as refuted in my own working, not carried forward: a suspected clipping of the `SPIN`
button at the viewport bottom (it closes at y `1575`, 25px clear), a suspected asymmetric
bottom control row (margins are `28` left and `29` right), a suspected misalignment of the
buy dialog's stat strip against the card above it (both borders are at x `88` and x `812`),
and a suspected asymmetric header rule in the modals (it is a fading gradient, not a short
line).

---

## STC-MOBILEM-2-01 HIGH The interface guide's icon tiles are one size but their icons run from 26px to 88px, so a third of the column reads as empty plates

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/286_mobile-m_paytable_07_interface_guide.png`
  (committed original: `reports/screens/stream-test-2026-07-28/286_mobile-m_paytable_07_interface_guide.png`)
- Claim: the guide is a vertical stack of six identical rows, each with a square icon plate
  of the same size, measured at about **`126px` wide upscaled (`52.5px` native)**, running
  from x `126` to x `252` upscaled. The artwork inside those identical plates is not
  normalised. Measured at each icon's widest row:

  | Row | Icon width, upscaled | Native | Fill of plate |
  |---|---|---|---|
  | `Spin` | `78` (x `152..229`) | 32.5 | 62% |
  | `Increase Bet` | `72` (x `153..224`) | 30.0 | 57% |
  | `Decrease Bet` | `72` (x `153..224`) | 30.0 | 57% |
  | `Features` | `88` (x `145..232`) | 36.7 | 70% |
  | `Autoplay` | `26` (x `171..196`) | 10.8 | **21%** |

  The `Autoplay` glyph is **3.4 times narrower** than the `Features` glyph inside a plate
  of exactly the same size, so scrolling this section shows four reasonably filled plates
  and then one that reads as an empty tile with a speck in it. The `Menu` row below it is
  the same shape. A player reading the interface guide is reading a legend, so an icon that
  does not match the size of the control it is explaining is the one thing this surface
  must not do.
- Resolution note: NEW AT 1600PX. At the native `375px` width the whole plate is 52px and
  the `Autoplay` glyph is 11px; the difference between an 11px glyph and a 37px glyph
  inside a 52px plate is not resolvable at the ~334-token thumbnail the native pass
  received, and neither superseded shard records it.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:747` (the glyph box) and
  the six source assets listed at `frontend/src/lib/components/PaytableModal.svelte:113-118`
  (`spin_button.png`, `btn_bet_plus.png`, `btn_bet_minus.png`, `feature_button.png`,
  `btn_autoplay.png`, `btn_menu.png`). Not locked. **The layout is already correct and is
  not the defect.** `frontend/src/lib/components/PaytableModal.svelte:736-746` sets a
  `56px` square plate and `:747` sets `.fs-guide-img { width: 44px; height: 44px;
  object-fit: contain; }`, so all six glyph boxes are identical by construction. Identical
  `contain` boxes cannot produce an 11px render and a 37px render from equally cropped
  sources, so the variance is in the transparent margin baked into the PNGs themselves. The
  generator is named in this file's own comment at
  `frontend/src/lib/components/PaytableModal.svelte:121` and `:129` as
  `regen_interface_guide_icons.mjs`.
- Proposed fix: trim each source capture to its own subject bounding box at generation time
  so `object-fit: contain` has nothing but subject to fit, which is the correct place
  because the plates are already uniform. The one-line containment, if the assets are not
  being regenerated this wave, is a per-icon `transform: scale()` correction beside `:747`,
  and it should be recorded as a stopgap.

---

## STC-MOBILEM-2-02 HIGH Two stacked cards in the FEATURES panel do not share a left text edge, and are out by 29px

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/292_mobile-m_features_menu.png`,
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/291_mobile-m_transition_features_menu_opening.png`
  (committed originals: `reports/screens/stream-test-2026-07-28/292_mobile-m_features_menu.png`,
  `.../291_mobile-m_transition_features_menu_opening.png`)
- Claim: the SPIN MODES card and the OVERBOOST card are siblings in one column and their
  outer borders DO align, both at x `91..95` upscaled. Their inner text columns do not.
  Measured on the first ink of each element's own row:

  | Element | First ink, x upscaled | Native | Padding from card border |
  |---|---|---|---|
  | `Normal` heading (y `685`) | `158` | 65.9 | `65` upscaled, 27 native |
  | `Standard play.` body (y `755`) | `158` | 65.9 | `65` upscaled, 27 native |
  | `OVERBOOST` heading (y `1135`) | `129` | 53.8 | `36` upscaled, 15 native |
  | `Double-chance: about 1.6x the` body (y `1190`) | `129` | 53.8 | `36` upscaled, 15 native |

  So two cards stacked 100px apart in the same panel indent their content by **`27px` and
  `15px` native respectively**, a `12px` step on a `375px` screen. The eye reads a column
  of cards down its left edge, and this one has a kink in it. The same panel's footer text
  `All modes . RTP 96.35%` starts further left again.
- Resolution note: NEW AT 1600PX. A 12px native step between two text columns 100px apart
  vertically is roughly one glyph width and is not judgeable at thumbnail scale;
  `STC-MOBILEM-B` read this panel and reported the stepper wrap (B-02) but not this.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:919-922` against
  `frontend/src/lib/components/FeatureMenu.svelte:903`. Not locked. **The source gives the
  exact figure my measurement found.** `:903` sets
  `.fm-card > .fs-face { flex-direction: row; align-items: center; gap: 0.85rem; padding: 12px 14px; }`,
  so a plain card such as OVERBOOST indents its content `14px`. `:918` sets
  `.fm-paired-face { ... padding: 12px 14px !important; ... }`, the same `14px`, and then
  `:919-922` sets `.fm-paired-opt { flex: 1 1 0; min-width: 0; display: flex;
  flex-direction: column; gap: 0.4rem; padding: 0 12px; text-align: left; }`, which adds a
  further `12px` inside each column of the Normal/Cruise card only. `14 + 12 = 26` against
  `14`, a **`12px` difference**, and the frame measures `12.1px`. Derivation and
  measurement agree to a tenth of a pixel.
- Proposed fix: drop the horizontal component of `.fm-paired-opt`'s padding at `:922`
  (`padding: 0 12px` becomes `padding: 0`) and let the divider gap come from the
  `border-right` at `:923` plus a `gap` on the face, or subtract the same `12px` from
  `.fm-paired-face`'s own padding at `:918` so the two cards land on one edge.

---

## STC-MOBILEM-2-03 HIGH The paytable's scroll box slices its last row through the middle of the glyphs, and the one element that looks like a scroll indicator never moves

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/280_mobile-m_paytable_01_match_symbols_on_adjacent_reels_st.png`,
  `.../281_mobile-m_paytable_02_ways_to_win.png`,
  `.../282_mobile-m_paytable_03_symbol_payouts.png`,
  `.../284_mobile-m_paytable_05_overdrive_free_spins.png`,
  `.../285_mobile-m_paytable_06_bet_modes.png`,
  `.../286_mobile-m_paytable_07_interface_guide.png`
  (committed originals: the same filenames under `reports/screens/stream-test-2026-07-28/`)
- Claim: the panel is a closed shape whose bottom chrome is measured at y `1530..1534`
  upscaled, spanning x `62..862`, and identical in every frame checked (`279`, `286`,
  `287`). Content simply stops at that line with a hard cut and nothing else:

  - `280`: the two symbol payout cards are cut with their captions half drawn, the
    ascenders of `Wil...` and `SCAT` present and the x-height and baseline gone.
  - `285`: the OVERBOOST blurb is cut mid-line through `trigger rate. Orbits 1.25x every spin while`.
  - `286`: the `Menu` row is cut through `Open the menu for the`.
  - `284`: the `BUY FEATURE` `$100.00` strip, the only priced call to action inside the
    paytable, is cut with its bottom border missing.

  There is no fade, no mask and no gradient at that edge. There is also no scroll
  affordance VISIBLE on any of the nine captured paytable frames, though one is declared:
  `frontend/src/lib/components/PaytableModal.svelte:599-603` styles an `8px`
  accent-tinted scrollbar on the scroll box, and it does not read at this viewport on any
  frame in the set. Stated that way deliberately, because "there is no scrollbar in the
  CSS" would have been wrong. And there is one element that makes the absence worse: a
  saturated gold rail at
  x `40..51` upscaled, spanning y `102..1496` (**`1395px`, 87 per cent of the frame
  height**), sits just inside the panel's left border and reads exactly like a scrollbar
  thumb pinned at full length. It is inert. Measured across four captured scroll positions,
  the top of the paytable (`279`), the rules section (`283`), the bottom of the paytable
  (`288`) and the FEATURES panel (`292`), its extent is `102..1496` in all three paytable
  frames and `136..1463` in the features panel, that is, it tracks the panel and not the
  scroll. So the panel's only scroll-shaped element is decoration, and its real scroll state
  is signalled by nothing at all.
- Resolution note: NEW AT 1600PX for the glyph slicing (whether a caption is cut through
  its x-height or merely ends is not resolvable at thumbnail scale) and VISIBLE AT BOTH for
  the gold rail's existence, though its inertness across scroll positions is a measurement
  the native pass could not have made.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:593-603` (`.fs-pt-body`,
  which is `overflow-y: auto` with `padding: 20px 30px 30px` and carries no `mask-image`)
  and `frontend/src/lib/components/PaytableModal.svelte:563` for the rail, which is
  `.fs-pt-panel .fs-rail { top: 16px; bottom: 16px; width: 4px; box-shadow: 0 0 10px var(--sig-gold); }`
  over the base rule at `:513`, mounted at `:169`. Not locked. **The source confirms the
  rail is chrome and confirms my measurement of it:** `top: 16px; bottom: 16px` against a
  panel measured at y `26.7..639.5` native predicts a rail at y `42.7..623.5` native, that
  is `102.4..1495.7` upscaled, and the frames measure `102..1496`.
- Proposed fix: add a bottom `mask-image` fade to `.fs-pt-body` at `:593` so text degrades
  rather than being guillotined, and either drive `.fs-rail` from `scrollTop` so it becomes
  the scroll indicator it already resembles, or move it outside the scroll box so it stops
  implying one. Note for whoever takes it: `.fs-rail` is shared chrome from the B1
  vocabulary (see the file header comment at `:3`), so changing its behaviour here and not
  in its siblings would itself be an inconsistency; the mask is the safe half.

---

## STC-MOBILEM-2-04 MEDIUM The BET control is 37 per cent empty box between its label and its first button

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/289_mobile-m_transition_paytable_closing.png`
  (committed original: `reports/screens/stream-test-2026-07-28/289_mobile-m_transition_paytable_closing.png`)
- Claim: the bet row is a bordered box measured at x `29..870` upscaled, the same `29px`
  gutter every other HUD element uses. Inside it, sampled along its vertical centre
  y `1305`:

  | Element | x upscaled | Native |
  |---|---|---|
  | box left border | `29` | 12.1 |
  | `BET` label ink | `65..124` | 27.1 to 51.7 |
  | **nothing** | `125..454` | 52.1 to 189.4 |
  | decrement button plate | `455..555` | 189.7 to 231.4 |
  | `$1.00` ink | `585..702` | 243.9 to 292.6 |
  | increment button plate | `727..835` | 303.1 to 348.1 |
  | box right border | `870` | 362.7 |

  The void between the label and the first control is **`330px` upscaled, `138px`
  native**, which is **37 per cent of the 375px viewport width** and 39 per cent of the
  control's own width, and it is bounded on all four sides by the control's own border so
  it reads as a box with its middle missing rather than as breathing room. The interior
  luminance across that span is a flat 20 to 26 of 255 with no ink at all. Every other HUD
  element on the frame is a filled pod: `BALANCE` x `29..440`, `WIN` x `461..869`,
  `FEATURES` x `29..870`. This is the only one with a hole in it.
- Resolution note: VISIBLE AT BOTH. The void is large enough to have been visible at native
  resolution; neither superseded shard records it, and the measurement is what makes it
  arguable rather than a matter of taste.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1952`, inside `.p-bet-stat`
  at `frontend/src/lib/components/HudOverlay.svelte:1946-1965`. Not locked. The rule is
  `display: flex; justify-content: space-between; gap: 16px; padding: 8px 14px; width: 100%`,
  with exactly two flex children, the `BET` label at `:402` and the stepper group at
  `:403-411`. `space-between` on two children is what puts the whole remainder in the
  middle. **The source's own numbers reproduce the frame:** `padding: 8px 14px` is `33.6px`
  upscaled, so the label's first ink is predicted at x `29 + 34 = 63` and measures `65`,
  and the group's right edge is predicted at x `870 - 34 = 836` and measures `835`.
- Proposed fix: change `justify-content: space-between` at `:1952` to `center` with the
  existing `gap: 16px` doing the spacing, or keep `space-between` and put the `$1.00` value
  in the middle as its own flex child so all three thirds carry ink. The row already has a
  `min-height: 52px` and its own full width by deliberate choice (the comment at
  `frontend/src/lib/components/HudOverlay.svelte:396-400` records why), so the space is
  there on purpose and only its distribution is wrong.

---

## STC-MOBILEM-2-05 MEDIUM The autoplay panel runs two alignment systems, left-anchored above the divider and centred below it

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/290_mobile-m_autoplay_menu.png`
  (committed original: `reports/screens/stream-test-2026-07-28/290_mobile-m_autoplay_menu.png`)
- Claim: the panel is measured at x `344..869` upscaled (`143.4..362.3` native), so its
  centre line is x `606.5` upscaled. Above the divider, the four option rows are
  left-anchored: the checkboxes are `43x43` upscaled squares whose left edge is x `386` in
  every row, an inset of `42px` upscaled from the panel border, with labels running right
  from x `455`. Below the divider, the `SPINS` column is centred on the panel: `100` is
  measured at x `575..644`, centre `609.5`, within `3px` of the panel centre `606.5`, and
  `SPINS`, `10`, `25`, `50` and the infinity row are all on the same centre. So one panel,
  `1020px` tall upscaled, changes its alignment contract halfway down, and the divider is
  the visible seam where it happens. Neither half is wrong on its own; the two together
  read as two components that were never reconciled.
- Resolution note: NEW AT 1600PX. Distinguishing a left-aligned block from a centred block
  when both are inside a 222px-wide native panel requires resolving the left edges of six
  short strings, which the thumbnail did not carry; `STC-MOBILEM-B-05` read this frame and
  reported the anchoring and the translucency, not this.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1795` against
  `frontend/src/lib/components/HudOverlay.svelte:1800-1802`. Not locked. The spins rows are
  `.auto-menu-item` at `:1785-1796`, which is `display: block; width: 100%;` with
  **`text-align: center`** at `:1795`. The option rows are `.auto-menu-toggle` at
  `:1800-1811`, which is `display: flex; align-items: center; gap: 10px`, so they are
  left-anchored by construction. Two rules, one panel, two contracts.
- Proposed fix: change `text-align: center` at `:1795` to `left` and give
  `.auto-menu-item` the same `1rem` horizontal padding the toggle already has at `:1804`,
  so both halves share one left edge. Centring the toggles instead would be worse, because
  a checkbox column reads off a shared left edge.

---

## STC-MOBILEM-2-06 MEDIUM The paytable uses two incompatible corner languages in one scroll

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/282_mobile-m_paytable_03_symbol_payouts.png`,
  `.../284_mobile-m_paytable_05_overdrive_free_spins.png`,
  `.../285_mobile-m_paytable_06_bet_modes.png`,
  `.../286_mobile-m_paytable_07_interface_guide.png`,
  `.../287_mobile-m_paytable_08_responsible_play.png`
  (committed originals: the same filenames under `reports/screens/stream-test-2026-07-28/`)
- Claim: everything in this modal except one section is drawn with the game's chamfered
  corner: the outer panel, the `WILD`/`SCAT`/`H1`/`H2` symbol cards in `282`, the `Normal`,
  `Cruise` and `OVERBOOST` mode cards in `285`, the `BUY FEATURE  $100.00` strip in `284`
  and the `MAX WIN  5,000x` strip in `287` all cut their top-right and bottom-left corners
  on a 45 degree bevel. The `INTERFACE GUIDE` section in `286` does not: its six row cards
  and the six icon plates inside them are plain rounded rectangles with a uniform radius on
  all four corners and no bevel anywhere. A player scrolling from `SYMBOL PAYOUTS` to
  `INTERFACE GUIDE` to `RESPONSIBLE PLAY` passes chamfer, then radius, then chamfer again,
  inside one panel. This is the iconography-from-two-families machine-tell the standing
  mandate names, applied to corners.
- Resolution note: NEW AT 1600PX. A 45 degree bevel across roughly 20 native pixels of a
  card corner is not distinguishable from a corner radius at thumbnail scale.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:734` and
  `frontend/src/lib/components/PaytableModal.svelte:745`, against
  `frontend/src/lib/components/PaytableModal.svelte:490` and `:507`. Not locked. The
  chamfer is literal in the source:
  `clip-path: polygon(0 0, calc(100% - 13px) 0, 100% 13px, 100% 100%, 13px 100%, 0 calc(100% - 13px))`
  at `:490` and the same shape at `12px` at `:507`. The guide section instead uses
  `.fs-guide-row { ... border-radius: 10px; }` at `:734` and
  `.fs-guide-icon { ... border-radius: 8px; }` at `:745`, with no `clip-path` anywhere in
  that block. So the two vocabularies are not a rendering artefact, they are two different
  properties on two different classes in one file.
- Proposed fix: apply the `:507` clip-path polygon to `.fs-guide-row` and drop its
  `border-radius`, and do the same for `.fs-guide-icon` at a smaller corner, so the guide
  section joins the chrome vocabulary the file header at `:3` and `:432` says this modal
  was rebuilt on.

---

## STC-MOBILEM-2-07 MEDIUM The disclaimer is twelve lines of centred running prose, and the containment proposed for the bullet list would not reach it

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/287_mobile-m_paytable_08_responsible_play.png`,
  `.../288_mobile-m_paytable_09_disclaimer.png`
  (committed originals: `reports/screens/stream-test-2026-07-28/287_mobile-m_paytable_08_responsible_play.png`,
  `.../288_mobile-m_paytable_09_disclaimer.png`)
- Claim: the `RESPONSIBLE PLAY` body is six lines and the `DISCLAIMER` body is twelve, and
  both are centre-aligned running prose, so neither has a left edge and the reader has to
  hunt for the start of every line. The widest disclaimer line reaches x `104` to `797`
  upscaled and the narrowest, `Roll Spinners. All rights reserved.`, sits at roughly
  `160..710`, so successive line starts move by up to `56px` upscaled (`23px` native)
  inside one paragraph. Compliance prose is the one body of text on the surface a reviewer
  will read word by word.

  This is the same root cause as the confirmed `STC-MOBILEM-A-01` (the inherited
  `text-align: center`), and it is reported separately for one reason: A-01's stated
  containment fix is `text-align: left` on `.fs-rules li`, which is the bullet list only.
  These two paragraphs are not in that list and would be left centred by that fix, so the
  class would read as closed while the longest prose block in the game still had the
  defect.
- Resolution note: VISIBLE AT BOTH for the centring; NEW AT 1600PX for the measurement of
  how far the line starts travel.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:789`, with the root at
  `frontend/src/app.css:143`. Not locked. Both paragraphs are `.fs-disc`, mounted at
  `frontend/src/lib/components/PaytableModal.svelte:397` (responsible play) and `:409`
  (disclaimer), and the rule at `:789` is
  `.fs-disc { font-size: 0.72rem; line-height: 1.55; color: rgba(255, 255, 255, 0.5); margin: 0; }`
  with **no `text-align` at all**, so it inherits the scaffold centring A-01 identified. It
  is a different selector from `.fs-rules li` at `:668`, which is the point of filing this
  separately.
- Proposed fix: fix it at the root (`frontend/src/app.css:143`) rather than per class, or
  if the root is deferred, add `text-align: left` to `.fs-disc` at `:789` at the same time
  as `.fs-rules li` at `:668`, and enumerate every other prose selector in this file before
  calling the class closed. `.fs-caption` at `:647` and `.fs-sym-note` at `:664` set
  `text-align: center` explicitly and are captions rather than running prose, so those two
  are deliberate and should be left alone; that distinction is exactly what an
  enumerate-first sweep is for.

---

## STC-MOBILEM-2-08 MEDIUM The FEATURES panel's bet steppers are a 30px touch target in a file that sets a 44px floor in four other places, and its own mini variant compensates while the full one does not

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/292_mobile-m_features_menu.png`,
  `.../291_mobile-m_transition_features_menu_opening.png`
  (committed originals: `reports/screens/stream-test-2026-07-28/292_mobile-m_features_menu.png`,
  `.../291_mobile-m_transition_features_menu_opening.png`)
- Claim: the `-` and `+` buttons in the bet bar measure **`71` and `70` pixels tall
  upscaled, `29.6` and `29.2` native**, from border to border (`-` at y `320..391`, `+` at
  y `419..489`). The source agrees exactly: `.fm-step` at
  `frontend/src/lib/components/FeatureMenu.svelte:855` is `width: 30px; height: 30px`. That
  is **`14px` under the 44px floor**, and the floor is this project's own standard rather
  than an imported one: the same file sets `min-height: 44px` at `:628` and at `:1049`, and
  `frontend/src/lib/components/HudOverlay.svelte:396-400` gives the BET row its own
  full-width row in a comment that says in terms it was done so the steppers would not be
  *"below the touch-target floor"*.

  **The decisive part is that the fix already exists in the same file and was applied to the
  wrong variant.** `frontend/src/lib/components/FeatureMenu.svelte:769` sets
  `.fm-panel--mini .fm-step::after { content: ''; position: absolute; inset: -9px; }`,
  which takes the mini panel's `26px` stepper (`:766-767`) out to `26 + 18 = 44px` of hit
  area. There is no `::after` on the full panel's `.fm-step`. So the SMALL variant of the
  control clears the floor and the LARGE one does not. The same pattern is used correctly
  on the HUD at `frontend/src/lib/components/HudOverlay.svelte:1194`
  (`.m-bet-step::after { content: ''; position: absolute; inset: -10px; }`).

  The `SELECT`, `ACTIVE` and `OFF` chips beside them share the shape of the problem:
  `.fm-select, .fm-activate, .fm-toggle` at
  `frontend/src/lib/components/FeatureMenu.svelte:964-966` sets `min-width: 86px` and
  `padding: 0.42rem 0.7rem` with no `min-height`, and they measure about `25px` native tall
  on the frame.

  For contrast, and as the controls this session gets right, the four round HUD buttons on
  `289` measure `116px` upscaled (`48.4px` native) in both axes and the `SPIN` disc measures
  `172x173` upscaled (`71.7px` native).
- Resolution note: NEW AT 1600PX. Measuring a 30px native control to the pixel is not
  possible on a thumbnail.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:855` and
  `frontend/src/lib/components/FeatureMenu.svelte:964-966`, with the working pattern to copy
  at `frontend/src/lib/components/FeatureMenu.svelte:769`. Not locked.
- Proposed fix: add `.fm-step::after { content: ''; position: absolute; inset: -7px; }`
  alongside the existing `position: relative` treatment the mini variant already uses, which
  takes `30px` to `44px` without moving a single pixel of the visual design, and give
  `.fm-select, .fm-activate, .fm-toggle` at `:964` a `min-height: 44px` to match `:628` and
  `:1049` in the same file.
- **CORRECTION TO MY OWN VISUAL PASS, recorded rather than quietly dropped.** I had this
  finding written with the autoplay checkbox as its worst case, measured at `43x43`
  upscaled (`17.9px` native) on frame `290`. The source refutes that half:
  `frontend/src/lib/components/HudOverlay.svelte:1800-1811` gives `.auto-menu-toggle` a
  `min-height: 44px` on the whole row, and the `20x20` input at `:1813-1818` sits inside it,
  so the hit area is the row and passes. The checkbox is a visual-weight observation at
  most and is withdrawn from this finding. A frame cannot show a hit area; this is the case
  where checking the source changed the answer rather than merely annotating it.
- **UNRESOLVED, stated rather than smoothed over.** My pixel read puts the stepper's WIDTH
  at `108` upscaled (`45px` native, borders at x `504..507` and `609..612`), while `:855`
  declares `width: 30px`. The height agrees to a tenth of a pixel and the width does not,
  and I have not resolved why. The finding therefore rests on the height alone, which is the
  failing axis and is corroborated two independent ways.

---

## Native pass reconciliation

Only findings whose frame lists fall inside 278 to 294 are adjudicated. Everything else in
`STC-MOBILEM-A.md` and `STC-MOBILEM-B.md` belongs to a sibling squad and is deliberately
left alone: from A that is A-02, A-03, A-04, A-05, A-06, A-07, A-08, A-09 and A-10, all of
whose frame lists are 260 to 277 or 285 and below in sections I did not open; from B that is
B-03, B-04, B-06, B-07, B-09, B-10, B-11 and B-18, all of whose frame lists are 295 to 311.

| Native id | Verdict | Note |
|---|---|---|
| STC-MOBILEM-A-01 | **CONFIRMED**, refined | Reproduced to the pixel. Markers pinned at x `86..90` upscaled (`35.9..37.5` native, against A-01's `35..37`); first-line text starts at x `136`, `205`, `187`, `129`, `165`, `148` upscaled, which is `56.7`, `85.5`, `78.0`, `53.8`, `68.8`, `61.7` native against A-01's `55`, `85`, `77`, `52`, `69`, `62`. Agreement is within 1.7px on every one of the six. REFINEMENT: the damage is not only the ragged hanging indent. The bullet paragraphs' optical centres measure `471`, `465`, `469`, `472`, `465`, `465` upscaled, mean `468`, while the section headings `RULES` and `OVERDRIVE FREE SPINS` both centre on `447`, and the panel's own content box centres on `450`. So the whole bullet block sits **`21px` upscaled (`8.8px` native) to the right of every heading above it**, because the marker column adds left padding that is not mirrored on the right. A reader sees a list that is both ragged and off-centre relative to its own heading. |
| STC-MOBILEM-B-01 | **CONFIRMED**, refined | Reproduced and hardened. The dialog's magenta chrome measures: top border y `79..82`, stats strip top border y `1264..1267`, stats strip bottom border y `1456..1457`, dialog bottom border y `1517..1520`, all at x `450` upscaled. The band between the strip and the dialog's bottom border, y `1458..1516` upscaled (`607.8..632.0` native, **`24px` native tall**), was sampled at fourteen x positions across two rows and returned luminance **exactly `10` at every one of the 28 samples**: a flat, empty, uninterrupted band. There is no `CONFIRM`, no `CANCEL` and no ink of any kind below the price. B-01's severity call of HIGH rather than STREAM, on the ground that the modal scrolls so the buttons are reachable, stands. |
| STC-MOBILEM-B-02 | **CONFIRMED** | Reproduced to the pixel. `-` button at x `505..611`, y `320..391` upscaled = `210.5..254.7`, `133.4..163.0` native, against B-02's `212..256`, `133..165`. `+` button at x `662..766`, y `419..489` upscaled = `276.0..319.3`, `174.7..203.9` native, against B-02's `276..320`, `173..206`. Every one of the eight bounds agrees within 2.1 native px. The two halves of one stepper are `98.5px` upscaled (`41px` native) apart vertically and their boxes do not overlap on any row. |
| STC-MOBILEM-B-05 | **CONFIRMED**, refined | The panel measures x `344..869` upscaled = `143.4..362.3` native, against B-05's `145..367`, and it is right anchored. TWO REFINEMENTS. First, the right gutter is `30px` upscaled = **`12.5px` native, not the `8px` B-05 states**, and `12.5px` is exactly the gutter every other HUD element uses (`BALANCE` pod left border x `29`, `FEATURES` pill x `29..870`), so the panel is correctly gutter-aligned and B-05's "hard against the right edge" reading overstates it. Second, the translucency is real and lands where B-05 says (`FEATURES` at y `965`, `$16.20` at y `1158`, `$1.00` at y `1307` upscaled, all inside the panel), but its strength is now measured: against a flat panel ground of luminance `12` to `14`, the show-through modulates the surface by about **`6` of 255 luminance levels**, where the same glyphs on the unobstructed frame `289` swing from `17` to `222`. So it is a faint shadow-detail ghost, not a legible overlay, and after stream encoding it may not survive at all. The finding is real; the phrase "reads through it" is stronger than the pixels support. |
| STC-MOBILEM-B-12 | **REFUTED** | The claim is that on `286` the panel "has no bottom at all" and its "border and stripe run off the bottom of the frame", against `287` where both terminate. Both halves are false at full resolution. The panel's bottom chrome is a bright band at y `1530..1534` upscaled spanning x `62..862`, and it is present in `279`, `286` AND `287` with **bit-identical luminance values** (`1530:87 1531:170 1532:176 1533:191 1534:175 1535:78` at x `450` in all three; `1530:97 1531:190 1532:196 1533:213 1534:191 1535:65` at x `700` in all three). It is panel chrome and not background: sampled at x `10`, `25` and `880`, all outside the panel's x `35..864` border, the same rows read luminance `1`. The gold stripe likewise terminates at y `1496` upscaled in `279`, `283`, `286`, `287` and `288`, identically. So the panel is a closed shape on `286` exactly as on `287`, and `286` is `1534/2.3988 = 639.5` native at its lowest, `27px` inside the `667px` viewport. B-12's derived arithmetic is refuted with it: the panel does not "finish at about y=690, 23px below the bottom of the screen", it finishes at y `639.5`, so `max-height: 662px` is not what is binding here. What IS true on `286`, and is reported above as STC-MOBILEM-2-03, is that the last row is sliced by the panel's own bottom edge with no mask; that is a clipping defect, not a panel running off the screen, and the two want different fixes. |
| STC-MOBILEM-B-13 | **CONFIRMED** | Observed independently before reading the shard. `287` and `288` present the same `MAX WIN 5,000x` strip, the same `RESPONSIBLE PLAY` block and the same `DISCLAIMER` ending on `Roll Spinners. All rights reserved.` at the same y, so two of the paytable's nine section targets are the same view. Adds nothing to B-13's account, including its scroll-clamping diagnosis. |
| STC-MOBILEM-B-14 | **REFUTED** | The claim is that `MAX` is "the word `MAX` in gold with no ring, no fill and no border", the only control in the row without chrome. It has the same chrome as its neighbours. Sampled along y `1483` upscaled, the menu button's disc runs x `28..143` (`116px`), the `MAX` disc runs x `622..737` (`116px`) and the autoplay disc runs x `755..870` (`115px`), and their fills are the same colour to within two levels per channel: menu `(18,24,35),(19,25,37)` at its first two interior columns, `MAX` `(17,23,35),(19,26,38)`. Neither the menu button nor the autoplay button carries a brighter rim stroke in this frame either, so the "four circles with chrome and one bare label" reading does not hold in either direction. The one visible ring in the set is the autoplay button's ACTIVE ring on frame `290`, which is a state and not the resting chrome. At native the disc is a luminance-24 fill on a luminance-5 ground across 48 native px, which is precisely the kind of low-contrast large shape a thumbnail loses, so the native pass had a reasonable read of a bad image. It is still a false positive and must not reach the ledger. |
| STC-MOBILEM-B-15 | **NOT ADJUDICATED** | The claim is cross-frame (the balance never moves across the whole run) and only one of its frames, `289`, is in my range. `289` reads `$50,000.00`, consistent with the claim, but a single frame cannot confirm or refute a claim about change over time. Left to the squad holding the rest of its frame list. |
| STC-MOBILEM-B-16 | **CONFIRMED** | Measured on `289`: the reel cabinet's top rail at y `140` upscaled spans x `0..898`, and its bottom rail at y `875` spans x `0..898`, that is, both reach the viewport's left and right edges and their end caps are bisected by the frame boundary. Every HUD element below is inset: `FEATURES` pill x `29..870`, `BALANCE` pod left border x `29`, `WIN` pod right border x `869`, `BET` box x `29..870`. B-16's "about 8px" inset is `29px` upscaled = **`12.1px` native**, so the figure is refined upward but the finding is exactly as described. |
| STC-MOBILEM-B-17 | **CONFIRMED** | The strip's borders measure y `1264..1267` (top) and `1456..1457` (bottom) upscaled, `527.3..607.0` native, and only the `MAX WIN` column carries a second line (`base bet`), leaving the area under `$100.00` and `96.35%` empty while the full-height column rules at x `325` and `570` frame that emptiness. Matches B-17's account including its cause. |
| STC-MOBILEM-B-19 | **REFUTED as stated, CONFIRMED in direction, and the figures are wrong by more than half** | B-19 claims a `5px` top gutter against a `22px` bottom gutter, "about 17px off centre". The top figure is right: the `FUTURE SPINNER` wordmark's first ink is at y `12` upscaled = **`5.0px` native**. The bottom figure is not. `22px` native is where the four small round buttons end (y `1546` upscaled = `644.5` native), but they are not the lowest element: the `SPIN` disc is, and it closes at y `1575` upscaled = **`656.6px` native**, leaving a bottom gutter of **`10.4px` native**, not 22. So the real framing is `5.0` top against `10.4` bottom, a `5.4px` asymmetry rather than a `17px` one, which is a different-sized problem and arguably not one at all at this viewport. B-19's second clause, that the wordmark's underline is overlapped by the reel frame's top rail, is separately supportable: the wordmark's ink runs to y `199` upscaled and the top rail begins at y `118` upscaled, so they do overlap. Recorded as refuted on its headline figure. |
| STC-MOBILEM-B-20 | **CONFIRMED**, partially in range | Only the `294` half of the frame list is mine (`296` is a sibling's). `294` titles the dialog `Buy Overdrive` in title case, and `292` in the same range shows `Normal` and `Cruise` in title case beside `OVERBOOST` in upper case, exactly as B-20 describes. Its LOW filing and its PARK, on the ground that the split may be a deliberate tone escalation, are both reasonable and I add nothing. |

---

## Explicit absences, signed

Signed against 17 frames read once each at `899x1600`, with the numeric re-reads listed in
the method note. The following were checked and are NOT present, so this is a claim and not
a silence:

1. **No element is cut off by the viewport edge on any of the 17 frames.** Checked
   specifically because the composition brief names it first, and because I had written
   down two suspected instances during the visual pass and both failed measurement. The
   `SPIN` disc closes at y `1575` of `1600` (`25px` clear, `10.4px` native). The paytable
   panel closes at y `1534` of `1600`. The buy dialog closes at y `1520` of `1600` and its
   left and right borders are at x `27` and `871` of `899`. The autoplay panel closes at
   x `869` of `899`. The features panel's right border is at x `864` of `899`. The only
   elements that reach x `0` and x `898` are the reel cabinet rails, which is the confirmed
   `STC-MOBILEM-B-16` and is a margin defect rather than a clipping one.
2. **The bottom control row is symmetric.** Left margin to the menu disc `28px` upscaled,
   right margin from the autoplay disc `29px`; the five discs measure `116`, `116` (turbo,
   read through a dimmer fill), `172` (SPIN), `116` and `115`. No baseline defect: the four
   small discs share a centre at y `1488` upscaled and the SPIN disc, being larger, centres
   at y `1489.5`, within 1.5px.
3. **The BALANCE and WIN pods are correctly paired.** Left borders x `29` and `461`, right
   borders x `440` and `869`, so widths `412` and `409` (a `3px` upscaled, `1.2px` native
   difference), gap `20`, outer gutters `29` and `30`. Labels and values share their rows.
   No fit failure: `$50,000.00` and `$16.20` both sit well inside their pods, so
   KNOWN row TR-115 / TR-086 is NOT observable on any frame in my range.
4. **The buy dialog's internal columns align.** I suspected during the visual pass that the
   stats strip was inset relative to the card and tile row above it. It is not: the
   `WHAT YOU GET` card's borders measure x `88` and `813`, the symbol tile row's outer edges
   x `88` and `812`, and the stats strip's borders x `89` and `812`. The apparent inset is
   the strip's chamfered top-left corner. Refuted in my own working and recorded here rather
   than reported.
5. **The modals' horizontal rules are not asymmetric.** I suspected the header rule under
   `FEATURES` stopped short on the right. Sampling it shows a smooth luminance ramp from
   `75` at x `56` to `25` at x `856` before the panel border at x `860`, that is, a
   deliberate fading gradient reaching the full width, not a short line. Refuted in my own
   working.
6. **The paytable's outer panel gutters are symmetric.** Panel borders at x `35` and `864`
   of `899`, so `35` each side. The inner card sits at x `82..819`, insets `47` and `45`.
   The gold rail consumes part of the left gutter but leaves `31px` upscaled of clear space
   against `39px` on the right, a `3.3px` native difference, which is below anything I am
   willing to call a defect. Recorded so the rail finding above is understood to rest on its
   inertness and not on crowding.
7. **No modal exceeds the viewport it opens in.** All four modals in range (paytable,
   autoplay, features, buy) close inside `899x1600` on all four sides, measured.
8. **No dead region beyond the two reported.** The only flat, ink-free areas measured are
   the BET control's interior void (reported, `2-04`) and the buy dialog's band below the
   stats strip (the confirmed `B-01`). The `SPINS` list, the mode cards, the symbol payout
   grid and the interface guide rows are all filled to their padding.
9. **Not swept by me, and named so nobody assumes otherwise:** the win-line detail strip on
   frame `289` (`M3  x5  8 ways  $16.00`) is the surface of `STC-MOBILEM-A-04` and `A-05`,
   whose frame lists are `271` to `274` and therefore a sibling's. Frame `289` corroborates
   both (the strip is drawn across the reel window's bottom edge, and its glyphs are about
   `14px` upscaled = `5.8px` native) and is offered as extra evidence rather than as a new
   finding. Also not swept: motion residue, typography, localisation and voice, none of
   which is my lens.
10. **Source read in step 3, and one citation I did not verify myself.** Three files, all
    by `grep -n` and bounded `sed -n` ranges rather than whole reads:
    `frontend/src/lib/components/PaytableModal.svelte`,
    `frontend/src/lib/components/FeatureMenu.svelte` and
    `frontend/src/lib/components/HudOverlay.svelte`. **`frontend/src/app.css:143` is cited
    in finding 2-07 on the authority of `STC-MOBILEM-A-01`, not on my own reading**, because
    I did not open `app.css`. Anyone acting on 2-07 should confirm that line first. No
    locked path was opened: `rgsService.ts`, `gameStore.ts` and `games/future_spinner/**`
    were not read and are not implicated by any finding here.

---

## KNOWN matches

- **KNOWN(Q-34)**: `.../292_mobile-m_features_menu.png` and `.../291_mobile-m_transition_features_menu_opening.png`
  render `Normal` and `Cruise` in title case beside `OVERBOOST` in upper case in one list,
  and `.../285_mobile-m_paytable_06_bet_modes.png` repeats the same three casings in the
  paytable. Fresh evidence for the row; adjacent to the superseded `STC-MOBILEM-B-20`,
  which already distinguishes the two correctly.
- **KNOWN(Q-26)**: `.../281_mobile-m_paytable_02_ways_to_win.png` and
  `.../282_mobile-m_paytable_03_symbol_payouts.png` render the SCATTER blurb as
  `3 / 4 / 5 = 1x / 3x / 10x + 8 / 12 / 16 free spins` with a letter `x`, and
  `.../285_mobile-m_paytable_06_bet_modes.png` renders `1.25x` in the OVERBOOST cost cell.
  Fresh frame evidence that the Q-26 class reaches the paytable, which is a component and
  not `fsModes.ts`, matching MID-02's point that Q-26's enumeration is incomplete. Out of my
  lens; recorded as evidence only.
- **KNOWN(Q-16 park)**: the parked hardcoded English strings visible on frames in my range
  are, verbatim: `Stop on win`, `Single win limit`, `Stop on feature`, `Loss limit`,
  `SPINS` on `.../290_mobile-m_autoplay_menu.png`; and `Symbol Payouts`, `Interface Guide`,
  `Responsible Play`, `Disclaimer` (as `SYMBOL PAYOUTS`, `INTERFACE GUIDE`,
  `RESPONSIBLE PLAY`, `DISCLAIMER`) on `.../282`, `.../286`, `.../287` and `.../288`. All
  five autoplay strings and all four paytable headers are on stream-visible surfaces at this
  viewport. The park stays parked; the visibility is recorded because KNOWN_OPEN asks for it.
- **KNOWN(Q-07)**: the infinity glyph on the autoplay panel's last row
  (`.../290_mobile-m_autoplay_menu.png`) renders in a fallback face and is visibly smaller
  than the numerals above it. Allowlisted, reviewed and kept. Not a finding, recorded so it
  is not re-raised.
- **MID-01 and MID-02**: neither is observable in my frame range. Both live on the big-win
  banner, frames `272` to `274` for this session, which are a sibling squad's. No frame from
  `278` to `294` carries the banner or a count-up.
- **TR-104, TR-114, TR-115 / TR-086, TR-112, Q-27, Q-28, TR-089**: no observation in range.
  TR-115 / TR-086 checked explicitly, see absence 3.

tree_after:

```
?? reports/qa/stream_test/shards/STC-MOBILEL-1.md
?? reports/qa/stream_test/shards/STC-MOBILEL-2.md
?? reports/qa/stream_test/shards/STC-MOBILEL-3.md
?? reports/qa/stream_test/shards/STC-MOBILEM-1.md
?? reports/qa/stream_test/shards/STC-MOBILEM-2.md
?? reports/qa/stream_test/shards/STC-MOBILEM-3.md
?? reports/qa/stream_test/shards/STC-POPOUTS-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-2.md
?? reports/qa/stream_test/shards/STC-POPOUTS-3.md
?? reports/qa/stream_test/shards/STM-MOBILEL.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STT-MOBILEL-1.md
?? reports/qa/stream_test/shards/STT-MOBILEL-2.md
?? reports/qa/stream_test/shards/STT-MOBILEL-3.md
?? reports/qa/stream_test/shards/STT-MOBILEM-1.md
?? reports/qa/stream_test/shards/STT-MOBILEM-2.md
?? reports/qa/stream_test/shards/STT-MOBILEM-3.md
?? reports/qa/stream_test/shards/STT-POPOUTS-1.md
?? reports/qa/stream_test/shards/STT-POPOUTS-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-3.md
```

**Every line is `??`, that is, a new untracked file. There is no `M` and no `D`, so this
squad dirtied nothing.** The nineteen shards other than
`reports/qa/stream_test/shards/STC-MOBILEM-2.md` are sibling squads' and are not mine.
`reports/screens/` is untouched, which matters because
`STC-MOBILEM-B.md` closes with a LOUD notice that a committed evidence frame was MODIFIED
during the native wave; nothing of that kind recurred here. My working files (the ffmpeg
sampler and its probes) were written to the session scratchpad outside the repository and
so cannot appear above.
