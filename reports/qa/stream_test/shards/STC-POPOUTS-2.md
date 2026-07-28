# STC-POPOUTS-2, composition (popout-s, frames 174 to 190, 1600px upscaled)
supersedes: STC-POPOUTS-A.md (its frames 174 to 182 only) and STC-POPOUTS-B.md (its frames 183 to 190 only)
scope: the `popout-s` frames numbered 174 to 190 inclusive, 17 frames, session `Popout S`, viewport `400x225`, lang `en`. Read from `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`, which is the committed set at `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/` resampled to 1600px height.
frames_read: 17

**Measurement basis, stated once so every figure below is checkable.** The
upscaled frames are `2844x1600` for a `400x225` CSS viewport (`MANIFEST.json`,
every row in my range), so the scale factor is exactly **7.11 upscaled px per CSS
px** on both axes. Every figure below is given in **upscaled pixels of the 1600px
frames**, with the CSS-pixel equivalent in brackets.

**Every figure in this shard was read off the raster by a decoder, not by eye.**
The frames were converted with `sips -s format bmp` and sampled per pixel; edges
are reported as the run of pixels above a stated luminance threshold. This matters
because **five claims I formed by eye at 1600px did not survive that check and
have been withdrawn**, and they are listed by name at the end rather than quietly
dropped. Where a figure below is derived from source as well as measured, both are
given, per convention (l.1) and (l.2).

---

## STC-POPOUTS-2-01 HIGH The buy confirm dialog is fully visible on all four sides, is 28 per cent empty, and still renders no title and no buttons: they are painted over by a sticky strip rather than pushed below a fold

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/190_popout-s_dialog_buy_overdrive.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/189_popout-s_transition_dialog_buy_overdrive_opening.png`
- Claim: measured on `190`. The dialog's magenta border encloses `x = 84` to
  `x = 2759` and `y = 78` to `y = 1521`, so **all four borders are on screen** and
  the box is `1443` upscaled px (`203` CSS px) tall. The gutters are `84`, `84`,
  `78`, `78` upscaled px, which is centred on both axes to inside a pixel.
  Its visible content is: **`301` upscaled px (`42.3` CSS px) of completely empty
  dialog**, then the symbol preview (first ink row `y = 391`), then the three
  column stat strip (magenta borders at rows `760..773` and `1328..1335`), then
  the text `bet?` (ink rows `1334..1400`), then **`109` upscaled px (`15.3` CSS
  px) of empty dialog** to the bottom border. That is **`410` of `1443` upscaled
  px, 28.4 per cent of the dialog, carrying nothing**, and there is no title, no
  full question, no `CONFIRM` and no `CANCEL` anywhere inside it.
  **`bet?` is complete and unclipped**, question mark included.
  **The mechanism is in the source and it is not a fold.**
  `frontend/src/lib/components/BuyBonus.svelte:224-232` makes the stat strip
  `position: sticky; bottom: 0; z-index: 2` with an **opaque** fill
  (`background: linear-gradient(180deg, #1a2236, #080c16)`), inside `.buy-modal`
  at `:170-174`, which is `max-height: 90dvh; overflow-y: auto; padding: 22px 24px
  24px`. At a 225 px viewport `90dvh` is `202.5` px and the padding takes `46`,
  leaving about **`156` px of content box** for a title (`:100`), a paragraph
  (`:101`), a four line what-you-get block (`:103-108`), a preview grid
  (`:110-117`), the strip (`:118-136`), an optional warning (`:138-140`) and the
  action row (`:141-146`). `.buy-actions` is the **last child in DOM order**, so it
  is precisely the content that a strip stuck to `bottom: 0` with an opaque fill
  overpaints. The strip's own comment at `:218-223` records that it was made
  sticky deliberately, to keep a disclosure on screen, and that *the opaque
  background is required*. **The fix that keeps the disclosure and the fix that
  reveals the buttons are the same rule, in opposite directions, which is why this
  is not a padding tweak.**
- Resolution note: NEW AT 1600PX (that all four borders are on screen, that `bet?`
  is intact, and the 28.4 per cent void are none of them resolvable at 400x225)
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:224-232` (the sticky
  strip) against `:141-146` (the action row) and `:170-174` (the modal box). Not
  locked.
- Proposed fix: move `.buy-actions` out of `.buy-modal`'s scroll region into a
  non-scrolling footer of the modal, so the strip can keep `position: sticky;
  bottom: 0` against the SCROLL region while the buttons sit below the whole of
  it; and clamp the `22px 24px 24px` padding and the leading block below about
  480 px of viewport height so the dialog does not open on `42` CSS px of nothing.

## STC-POPOUTS-2-02 HIGH The HUD row's padding is 4 px on the left, 8 px on the right and 0 px on the bottom, and the source says exactly why

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/186_popout-s_transition_paytable_closing.png`
- Claim: measured on `186`. The leftmost control's border begins at `x = 30`
  upscaled (**`4.2` CSS px** from the viewport's left edge). The spin button's
  border ends at `x = 2787` upscaled, leaving `56` upscaled px (**`7.9` CSS px**)
  on the right. Vertically the spin button's chrome ends at `y = 1595`, **`4`
  upscaled px (`0.6` CSS px) from the frame's last row**, while the menu button
  beside it ends at `y = 1569`, `30` upscaled px (`4.2` CSS px) clear.
  **Derived from the specification first, and the derivation lands on the
  measurement.** `frontend/src/App.svelte:2098` gives the row
  `.native-hud-slot.mini-player { flex-direction: row; align-items: center; gap:
  4px; padding: 0 4px; }`, and
  `frontend/src/lib/components/HudOverlay.svelte:1094` gives the strip inside it
  `.m-hud { ... height: 44px; padding: 0 4px 0 2px; }`. `.m-hud` is the **second**
  flex item in that row (its own comment at `:1091-1093` says so: *the slot is a
  row shared with FeatureMenu's mini trigger*), so its `2px` left padding is
  shadowed by the trigger that precedes it and only the slot's `4px` applies on
  the left, while on the right the slot's `4px` and `.m-hud`'s `4px` **stack**.
  Predicted: `4` CSS px left, `8` CSS px right. Measured: `4.2` and `7.9`.
  Top and bottom are `0` in both rules, and `.m-round-btn` is `36px`
  (`HudOverlay.svelte:1107-1109`) centred in a `44px` row, which predicts the
  `4` CSS px under the menu button and the `0` under the full-height spin button.
  Measured `4.2` and `0.6`.
  **So the row is asymmetric by construction on one axis and has no breathing
  room at all on the other**, and the most-watched control in the game terminates
  on the viewport's last row.
- Resolution note: NEW AT 1600PX (a 4 px against 8 px difference is 4 native px
  and the 0.6 px bottom clearance is under one native pixel)
- Where fixable: `frontend/src/App.svelte:2098` and
  `frontend/src/lib/components/HudOverlay.svelte:1094`. Neither locked.
- Proposed fix: drop `.m-hud`'s own horizontal padding to `0` and let the slot own
  the inset, so the two ends resolve from one rule; and give the slot a small
  bottom padding so the spin button's chrome is not the viewport's last row.

## STC-POPOUTS-2-03 MEDIUM Paytable section 01 ends on a bare 1364 px stub that closes nothing, and it is the frame the native pass offered as its clean control

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/177_popout-s_paytable_01_match_symbols_on_adjacent_reels_st.png`
- Claim: the superseded shard signed this frame as the clean one: *frame `177` is
  clean: its text ends at `y=192` and rows `211..213` carry the content card's own
  bottom border, which is what the other five should look like.* Measured at
  1600px, that terminal line is **not a card border**. The panel's own bottom
  border occupies rows `1526..1536` and spans the full panel width. Above it, at
  **rows `1499` to `1525`**, sits a separate bright run from **`x = 696` to
  `x = 2060`**, `1364` upscaled px (`192` CSS px) wide. The content card it sits
  inside has borders at `x = 241..255` and `x = 2588..2602`, an outer width of
  `2361` upscaled px (`332` CSS px). **The stub is inset `441` upscaled px
  (`62` CSS px) from the card's left border and `528` upscaled px (`74` CSS px)
  from its right, so it neither spans the card nor is centred on it.** It is a
  sliced fragment of the next section's furniture, and on screen it is a stray
  rule floating above the panel's real bottom edge.
  The consequence for the ledger is that the clean control in the native pass's
  argument is not clean, so `176` through `182` are seven for seven rather than
  five of seven.
  There is no `mask-image` and no `scroll-margin` on `.fs-pt-body`
  (`frontend/src/lib/components/PaytableModal.svelte:593-601`, which is
  `overflow-y: auto; padding: 20px 30px 30px; display: flex; flex-direction:
  column; gap: 22px`, overridden to `padding: 14px 16px 20px; gap: 16px` by the
  `@media (max-width: 500px)` block at `:798`), so a section anchor lands wherever
  the scroll offset puts it and a card can be clipped to its own top border.
- Resolution note: NEW AT 1600PX (at 400x225 the stub is 4 native px tall and its
  extent cannot be told from the card's)
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:593-601` and
  `:798`. Not locked.
- Proposed fix: add `scroll-margin-bottom` to the section cards so an anchor
  cannot leave one clipped to its border, and add the bottom `mask-image` fade the
  sibling findings already ask for, so any clip reads as continuation.

## STC-POPOUTS-2-04 MEDIUM The FEATURES menu's OVERBOOST row carries a 718 px void through its middle, which is the bet stepper's failure repeating in a second row of the same component

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/188_popout-s_features_menu.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/187_popout-s_transition_features_menu_opening.png`
- Claim: measured on `188` along the row's centre line. The `HIGH` pill's right
  border is at `x = 1115` upscaled and the first ink of `1.25x bet` is at
  `x = 1833` upscaled, so the row carries **`718` upscaled px (`101` CSS px) of
  empty space through its centre, 25 per cent of the whole 400 CSS px canvas**.
  The row directly above it draws an explicit vertical divider at `x = 1424`
  upscaled in the equivalent gap, so that row's space reads as a column break;
  OVERBOOST has no divider and its space reads as a layout that stopped.
  The mechanism is the same one the superseded shard found once, in a different
  row: `frontend/src/lib/components/FeatureMenu.svelte:903` lays the card out as
  `.fm-card > .fs-face { flex-direction: row; align-items: center; gap: 0.85rem;
  padding: 12px 14px; }` and `:926` gives `.fm-card-main { flex: 1; min-width: 0;
  text-align: left; }`, so the label group absorbs every spare pixel and the
  action group is pinned right. **One instance is a layout; two is a class**, and
  the class is that this component distributes slack instead of grouping.
- Resolution note: VISIBLE AT BOTH for the void, NEW AT 1600PX for the figure and
  for the comparison against the divider in the row above
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:903` and `:926`.
  Not locked.
- Proposed fix: cap `.fm-card-main`'s growth, or carry the same midpoint divider
  the paired card uses, so the gap reads as a column break rather than as absence.

---

## Withdrawn during verification, recorded rather than deleted

Five claims I formed by eye at 1600px were killed by the pixel check before this
shard was finalised. They are listed because a squad that only ever reports what
survived cannot be audited on its own error rate.

1. **Session panel top and bottom borders on screen (`174`).** WITHDRAWN. I read
   a top stroke at about `y = 14`. There is none: at `x = 1422` the panel's fill
   runs `y = 0` to `y = 1599` unbroken, and the only border pixels in rows `0..3`
   and `1596..1599` are the corner arc tips at `x ≈ 184..187` and
   `x ≈ 2655..2659`. The native pass was right and I was wrong. See the
   reconciliation of A-05.
2. **Buy dialog off centre vertically (`190`).** WITHDRAWN. Measured gutters are
   `84`/`84` horizontal and `78`/`78` vertical. The dialog is centred on both axes.
3. **FEATURES panel bottom border off screen (`187`, `188`).** WITHDRAWN. The
   bottom border is present, just very faint: rows `1565..1569` at
   `lum ≈ 12..15` against `1..3` outside. The panel closes on all four sides,
   with gutters of `55` left, `63` right, `38` top and `30` upscaled px bottom.
4. **Bet steppers too small to hit (`186`).** WITHDRAWN as a hit-target claim.
   `.m-bet-step` is `24px x 30px` (`HudOverlay.svelte:1183-1185`, and my
   measurement of `171 x 214` upscaled is `24.0 x 30.1` CSS px, exact), but
   `:1194` gives it `::after { inset: -10px }`, a **44 px effective target**, and
   the comment records that the effective box was measured rather than assumed.
   `HudOverlay.svelte:1036-1044` further records that Popout S is deliberately
   excluded from the touch-target audit, with the reason stated. The visual size
   step across the row (`36`, `36`, `24x30`, `44`) is deliberate hierarchy, not a
   defect, and reporting it would have been a false positive.
5. **The reel assembly off centre (`186`).** WITHDRAWN. The bright bezel runs
   `x = 556..2288` at `y = 400`, centre `1422.0` against the frame's own `1421.5`.
   Centred to half a pixel. This one is reported as corroboration under B-11
   instead.

---

## Native pass reconciliation

The superseded shards are `STC-POPOUTS-A.md` (frames 157 to 182) and
`STC-POPOUTS-B.md` (frames 183 to 207). My range is 174 to 190, so I reconcile
**A-02, A-05, A-09, A-10, A-12, A-13** and **B-01, B-03, B-04, B-05, B-06 (part),
B-09, B-11 (part)**. Everything else in both shards is outside my frames and
belongs to a sibling squad: A-01, A-03, A-04, A-06, A-07, A-08, A-11, A-14 to
A-19, and B-02, B-07, B-08, B-10, B-12, B-13. I have not opened those frames and
I say nothing about them.

| Native id | Verdict | One line |
|---|---|---|
| STC-POPOUTS-A-02 | REFINED | Slicing confirmed on all five; the clean control frame is not clean. |
| STC-POPOUTS-A-05 | CONFIRMED | Verified to the pixel, including the claim I had initially doubted. |
| STC-POPOUTS-A-09 | CONFIRMED | The rail still coincides with no edge on the surface. |
| STC-POPOUTS-A-10 | REFINED | Marker orphaned, and the hanging indent is not constant between the two items. |
| STC-POPOUTS-A-12 | CONFIRMED | Independently measured at `11.0` CSS px against their `11 px`. |
| STC-POPOUTS-A-13 | CONFIRMED | Independently measured at `8.0` CSS px against their `8 px`. |
| STC-POPOUTS-B-01 | REFINED | No buttons and no title confirmed; the stated mechanism refuted and replaced. |
| STC-POPOUTS-B-03 | CONFIRMED | All three frames, and `185` is the compliance surface. |
| STC-POPOUTS-B-04 | CONFIRMED | Three of five modes, header decapitated, still illegible at full resolution. |
| STC-POPOUTS-B-05 | CONFIRMED | Re-measured glyph to glyph; reproduces their ratio to within 12 per cent. |
| STC-POPOUTS-B-06 | PART IN RANGE | Only the two-button reference state is in my frames. |
| STC-POPOUTS-B-09 | REFINED | The composition complaint stands; the finding's own title is refuted. |
| STC-POPOUTS-B-11 | CONFIRMED (part) | Centring verified independently on my own frame. |

**A-02, REFINED.** The slicing claim is confirmed on all five frames it names, and
1600px makes it worse: on `180` the guillotined line is the third rule with every
descender removed; on `182` the sliced object is a **money figure**, the `$1.00`
under `COST`; on `179` it is a symbol's own name label. The claim about `181` is
confirmed exactly, with nothing on the surface saying a third scatter row exists.
**The control case does not survive.** A-02 offers `177` as the clean
counter-example whose bottom rows carry the content card's own bottom border. At
1600px those rows carry a `1364` upscaled px stub inside a `2361` upscaled px
card, inset unequally on both sides, above the panel's real border at rows
`1526..1536`. Raised as STC-POPOUTS-2-03, because a finding that names a clean
control has to have one, and this makes the paytable seven for seven.

**A-05, CONFIRMED, and I had it wrong first.** I read the panel's top border as
being on screen at 1600px and wrote that into a draft of this shard. The decoder
says otherwise and the native pass is exactly right. Verified: the panel's
vertical border strokes stand at `x = 143..147` and `x = 2696..2700`, giving
gutters of `143` and `143` upscaled px (`20.1` and `20.1` CSS px), which matches
their `x=20` and `x=379` and their derivation of `width: min(90vw, 360px)` at
`SessionPanel.svelte:179`. At `x = 1422` the panel's fill runs from `y = 0` to
`y = 1599` with **no horizontal border stroke at either end**, and the only border
pixels in rows `0..3` and `1596..1599` are the corner arc tips at `x ≈ 184..187`
and `x ≈ 2655..2659`. **The top and bottom borders are off screen and all four
corners are sliced, exactly as written.** A modal inset `20` CSS px on one axis and
`0` on the other. Their proposed `max-height` plus `overflow-y: auto` is the right
fix and I withdraw the doubt I had recorded against it.

**A-09, CONFIRMED.** On every paytable frame in my range the gold rail is the most
conspicuous vertical line in the modal and its two ends coincide with no other
edge: not the panel's borders, not the title's cap height, not the close control,
not the content card's top border, not the content clip. At 1600px the rail's
terminations carry a glow that makes an end-row measurement threshold dependent, so
I take their source derivation (`top: 16px; bottom: 16px` at
`PaytableModal.svelte:563`) as the authority for the numbers rather than asserting
my own. The compositional claim needs no re-measurement to hold.

**A-10, REFINED.** Confirmed and extended, with figures the native pass could not
have had. On `180` the two `›` markers stand at `x = 253..276` and `x = 254..276`,
so they are on one edge. Their first text glyphs begin at `x = 476` and `x = 438`.
The marker-to-text gap is therefore **`199` upscaled px (`28.0` CSS px) on the
first rule and `161` upscaled px (`22.6` CSS px) on the second, a `38` upscaled px
(`5.3` CSS px) difference**. The hanging indent is not merely too large, **it is
not constant between two items of the same list**, because the copy is centred
while the marker is absolutely positioned. That strengthens their diagnosis and
their one-line fix (`text-align: left` on `.fs-rules li`,
`PaytableModal.svelte:668`) rather than changing it.

**A-12, CONFIRMED to the pixel.** Measured independently on `176`: the `P` of
`PAYTABLE` begins at `x = 319` upscaled and the content card's left border stands
at `x = 241..255` upscaled, so the heading sits **`78` upscaled px, `11.0` CSS px,
inside the card edge directly beneath it**. Their figure is `11 px`. The card
itself is inset `127` upscaled px (`17.9` CSS px) left and `129` upscaled px
(`18.1` CSS px) right of the panel, matching their *18 px left and 19 px right and
symmetric to a pixel of border width*. Their derivation of the `26` against `16`
padding split under `@media (max-width: 500px)` is the right cause.

**A-13, CONFIRMED to the pixel.** On `179` the left card's `WILD` label has its
first ink row at `y = 1450` and the right card's label at `y = 1507`, a step of
**`57` upscaled px, `8.0` CSS px**, against their measured `8 px`. Two independent
readings at two resolutions agree. Their cost claim is confirmed and is sharper at
full resolution: with the panel's bottom border at rows `1522..1536`, `WILD` shows
about `70` upscaled px of ink and clears intact, while the right card's label shows
**about `13` upscaled px, roughly a fifth of a cap height**, before it is cut. One
row of two cards, cropped at two different points of its own layout.

**B-01, REFINED, and the replacement mechanism is better than the original.** The
headline is confirmed: `189` and `190` state `$100.00` and render **no `CONFIRM`,
no `CANCEL` and no title**. **The stated mechanism for the body text is refuted.**
B-01 says *a line of body text that is bisected horizontally through its
letterforms. The visible fragment is `bet?` in frame `190`*. Measured, `bet?`
occupies ink rows `1334..1400` and is **complete**, with `109` upscaled px
(`15.3` CSS px) of empty dialog beneath it and the dialog's own magenta bottom
border on screen at rows `1509..1521`. Nothing is bisected and nothing is below a
viewport fold: **the whole dialog box is visible and the buttons are not in it.**
The cause, located in source rather than inferred, is
`BuyBonus.svelte:224-232`: the stat strip is `position: sticky; bottom: 0;
z-index: 2` with an **opaque** fill, and `.buy-actions` at `:141-146` is the last
child in DOM order, so the strip is pinned exactly over the content that ought to
carry the buttons. Their proposed fix (pin `.buy-actions` as a footer) is still
the right move, but for a different reason than the one recorded, and the strip's
own comment at `:218-223` shows the stickiness was itself a deliberate fix for a
disclosure requirement, so it must not simply be removed. Raised with the void
figures as STC-POPOUTS-2-01.

**B-03, CONFIRMED.** All three frames hold. On `185` the last disclaimer line,
`plays and does not guarantee any result in a single`, is cut through its
letterforms with every descender removed and the sentence has no ending, on the
surface that carries the game's compliance text, with no scrollbar, fade or
chevron anywhere in the frame. On `184` the body ends on the orphan `menu.` with
effectively no clearance. On `183` exactly one interface guide card is complete and
the second is reduced to a bare rounded top border with nothing inside it. Their
*header block that consumes roughly half of the 225px height* is confirmed as the
right order: the panel's content card top border is at `y = 718..733` upscaled
(`101` CSS px down the frame), matching their predicted `y=100` and measured
`y=101`, against a panel of about `201` CSS px.

**B-04, CONFIRMED.** On `188` the menu shows `Normal`, `Cruise` and `OVERBOOST`
and no fourth or fifth mode, against a `MANIFEST.json` note of `FEATURES menu, all
five modes and their prices`. The next section's header is reduced to the top band
of its glyphs, resting on the footer rule, and **at 1600px it is still not legible
as a string**, which is worth recording: full resolution does not rescue it, so a
viewer cannot tell what is being hidden. `187` shows the identical clipping mid
open, so it is not a transition artefact, exactly as they say.

**B-05, CONFIRMED.** Re-measured on `188` at 1600px, glyph to glyph so the
comparison is like for like with their second pass. The minus glyph occupies
`x = 1172..1229`, the value `$1.00` occupies `x = 2030..2285`, and the plus glyph
occupies `x = 2459..2517`. The clear gap on the minus side is **`801` upscaled px
(`112.7` CSS px)** and on the plus side **`174` upscaled px (`24.5` CSS px)**, a
ratio of **`4.6` to `1`** against their `116` px, `28` px and `4.1` to `1`.
Independent re-measurement at a different resolution reproduces their figure to
within 12 per cent. Measured control box to value the disparity is larger still,
`693` against `67` upscaled px (`97.5` against `9.4` CSS px, `10.3` to `1`),
because the minus glyph sits centred in a `273` upscaled px wide button. Their
`margin-left: auto` diagnosis at `FeatureMenu.svelte:861-862` is the mechanism,
and STC-POPOUTS-2-04 shows it is a class rather than an instance.

**B-06, PART IN RANGE.** Only frame `186` of the frames this finding cites is
mine. I confirm what that frame contributes: the HUD's left cluster carries **two**
controls, at `x = 30..282` and `x = 329..580` upscaled, both `36` CSS px
(`HudOverlay.svelte:1107-1109` declares `36px`, measured `35.6` and `35.4`). The
one-control frames are `193` to `207`, which belong to a sibling squad, so I can
neither confirm nor refute the lateral shift itself and I do not.

**B-09, REFINED. The composition complaint stands and the finding's own title is
refuted.** On `190` the three values `$100.00`, `96.35%` and `5,000x` occupy ink
rows `981..1079`, `989..1066` and `989..1079`. **They share a baseline**, at about
`y = 1066`, with the `$` glyph and the thousands comma overshooting to `1079`,
which is normal type behaviour and not a break. So *so no value shares a baseline*
is not what the frame shows, and their proposed `align-items: baseline` would
change nothing. What is real is the consequence they describe next: only the third
column wraps, to `base bet` at rows `1144..1223`, so columns one and two carry
about **`78` upscaled px of dead band beneath their values** inside a strip
`568` upscaled px tall, and the strip reads bottom heavy on its right third. The
fix has to address the wrap, not the alignment.

**B-11, CONFIRMED on my frame, and strengthened.** Of the three frames cited only
`186` is mine. Their pixel proof of geometric centring was taken on `203`; I
verified it independently on `186` at a different resolution, and it holds: the
cabinet's bright bezel runs `x = 556..2288` upscaled at `y = 400` and
`x = 561..2283` at `y = 700`, giving a centre of `1422.0` against the frame's own
`1421.5`. **Centred to half an upscaled pixel, which is a fourteenth of a CSS
pixel.** The weighting observation also holds on my frame: the band left of the
cabinet carries the character and the car, both reading as subjects, while the
band to the right is gradient and light rays. Their LOW and their PARK are both
right.

---

## Explicit absences, signed

These are claims, and here is what was checked to support each. Everything below
was checked with the decoder, not by eye, unless it says otherwise.

- **Nothing in frames 174 to 190 is cut by the LEFT viewport edge.** Session panel
  border at `x = 143` on `174`; paytable panel border at `x = 114` on `175` to
  `186`; FEATURES panel border at `x = 55` on `187` and `188`; buy dialog border
  at `x = 84` on `189` and `190`; the HUD's leftmost control at `x = 30` on `186`,
  which is the subject of STC-POPOUTS-2-02 and is not a cut.
- **Nothing in frames 174 to 190 is cut by the RIGHT viewport edge.** Session
  panel `x = 2700`, paytable `x = 2731`, FEATURES `x = 2780`, dialog `x = 2759`,
  spin button `x = 2787`, all inside `2843`.
- **Nothing is cut by the TOP viewport edge except the session panel's own frame**
  (A-05, confirmed above). Paytable top border rows `64..85`, FEATURES `31..56`,
  dialog `78..90`.
- **Nothing is cut by the BOTTOM viewport edge except the session panel's own
  frame** (A-05). Paytable bottom border rows `1526..1536` on `177`, `1522..1536`
  on `179`; FEATURES bottom border rows `1565..1569`; dialog bottom border rows
  `1509..1521`; the HUD's spin button ends at `1595` of `1599`, which is flush
  rather than cut and is reported under STC-POPOUTS-2-02.
- **Only one modal in my range exceeds its viewport, and it is the session panel.**
  The paytable, FEATURES and buy dialog all close on all four borders.
- **The FEATURES panel's own gutters are near symmetric and are not a finding.**
  Measured `55` left, `63` right, `38` top, `30` upscaled px bottom, which is
  `7.7`, `8.9`, `5.3` and `4.2` CSS px. Checked because I suspected otherwise.
- **The two halves of the mirrored `Normal` / `Cruise` row are NOT a finding.**
  Checked, because I had drafted one. The divider sits at `x = 1424` upscaled
  against a frame centre of `1421.5`, and the two cells are `1290` and `1284`
  upscaled px. The left cell's content begins about `20` to `26` upscaled px
  (`2.7` to `3.7` CSS px) further inside its boundary than the right cell's, but
  the two boundaries are different kinds of edge (a card border against a hairline
  divider), the active radio carries a glow that contaminates its measured extent,
  and the residual is inside my tolerance. **Not reported.**
- **The three-column stat strips are internally aligned.** Checked header centres
  against value centres on `181`, `182` and `190`: every pair sits within about
  `20` upscaled px (`3` CSS px), and the values share a baseline in each. No
  column-alignment finding in my range.
- **The reel assembly is centred.** Verified on `186`, figures under B-11.
- **I did not audit colour, contrast, typography, glyph choice, casing, motion,
  timing or copy.** Where those surfaces are visible in my frames I have deferred
  to the lens that owns them and said so.
- **I did not open any frame outside 174 to 190.** Frames 157 to 173 and 191 to
  207 belong to sibling squads and every statement above about them is a statement
  about the superseded shards' text, not about their rasters.
- **I did not run any project script.** The only tooling used was `sips` to
  transcode the upscaled PNGs to BMP in the session scratchpad, plus a scratchpad
  Python reader. Nothing under `scripts/` was executed and nothing was written
  outside this shard and the scratchpad.

---

## KNOWN matches

- **KNOWN(TR-115 / TR-086)**, money display fit as one class. Fresh evidence:
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/186_popout-s_transition_paytable_closing.png`
  carries three money readouts in one HUD row in three different formats,
  `$50K` for the balance beside `$16.20` for the win and `$1.00` for the bet, so
  the abbreviate-on-overflow rule fires on one readout and not on its two
  neighbours in the same row at the same instant. The mechanism is named in
  source at `frontend/src/lib/components/HudOverlay.svelte:605`,
  `use:fitMoney={{ full: balanceLabel, compact: balanceCompact }}`, which is
  exactly the shared fit-or-abbreviate concern KNOWN_OPEN maps to final-mile
  JOB 3. Second instance:
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/182_popout-s_paytable_06_bet_modes.png`,
  where the object the panel edge slices is a money figure.
- **KNOWN(Q-26)**, the multiplication sign written as a letter `x`. Fresh evidence
  that the class is visible on stream frames, which is what KNOWN_OPEN asks for:
  `181` (`1x`, `3x` in the trigger table), `182` (`5,000x` under `MAX WIN`), `188`
  (`1x bet`, `1.25x bet`) and `190` (`5,000x`), all under
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`. **The glyph
  call itself belongs to the typography lens and I do not make it**; what I record
  is that four surfaces carrying the quantity are on stream frames in my range.
- **KNOWN(Q-34)**, one mode named `Cruise` on some surfaces and `CRUISE` on
  others. Fresh evidence for the title-case half:
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/188_popout-s_features_menu.png`
  and `187_popout-s_transition_features_menu_opening.png` render `Normal` and
  `Cruise` in title case in the same row where `OVERBOOST` is upper case. The HUD
  badge carrying the other half is on frames outside my range, so I evidence one
  side only.
- **No match to MID-01.** The big-win count-up frames for this session are `169`
  to `171`, outside my range.
- **No match to MID-02.** The win banner does not appear in frames 174 to 190.
- **No match to TR-104, TR-114, TR-112, Q-16, Q-27, Q-28 or Q-07** in my range:
  this is an `en` session with no win banner, no replay surface and no autoplay
  panel in these seventeen frames.

tree_after:

```
?? reports/qa/stream_test/shards/STC-MOBILEL-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-2.md
?? reports/qa/stream_test/shards/STC-POPOUTS-3.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STT-MOBILEL-1.md
?? reports/qa/stream_test/shards/STT-MOBILEL-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-1.md
?? reports/qa/stream_test/shards/STT-POPOUTS-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-3.md
```

**Every line is `??`, untracked. Nothing shows as MODIFIED or DELETED, so this
squad dirtied nothing.** `STC-POPOUTS-2.md` is mine; the other nine are sibling
squads' shards and are not my concern. The committed evidence directory
`reports/screens/` does not appear, which is the check that matters most given
convention (h.1): it was read from and never written to.
