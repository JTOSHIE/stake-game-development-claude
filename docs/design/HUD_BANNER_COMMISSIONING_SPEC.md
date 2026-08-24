# HUD BANNER PANEL — commissioning spec and implementation blueprint

**R103 WORKSTREAM 4.** The bottom control banner is the ONE surface in the live HUD where art
can land without touching a control, a coordinate, a touch target, an accessible name or a
localised string. This is the spec for the missing asset and the blueprint for using it.

**Everything below was measured this session, not carried forward.**

---

## 1. The target, verified

`.fs-panel` in `HudOverlay.svelte`. Geometry is derived in CSS from tokens rather than hand-set,
so the numbers were recomputed from the token arithmetic and checked against the locked spec:

```
--fs-x-slab = --fs-x-max - --fs-row-gap        = 297 - 16  = 281
--fs-w-slab = --fs-x-step + --fs-w-step + gap - x-slab
            = 939 + 44 + 16 - 281              = 718
```

`docs/HUD_SPEC.md` states `left:281px; top:560px; width:718px; height:88px`. **Both agree, so
718x88 is confirmed rather than assumed.**

| Property | Value | Why it matters to the artist |
|---|---|---|
| Box | **718 x 88** stage px at the 1280x720 design surface | aspect **8.159**, a long shallow slab |
| Position | left 281, top 560 | spans one gap before MAX to one gap after the bet steppers |
| Corner | `border-radius: 18px` | the element clips its own background, so square art is fine |
| Depth | `z-index: 59` | every control sits at 61 or above, ON TOP of this |
| Interaction | **`pointer-events: none`** | it can never be clicked, so no touch target and no accessible name apply |
| Outside it | TURBO on the left, SPIN and AUTO on the right | deliberately outside the slab; do not extend the art to cover them |

**Delivery masters:** 1436x176 at 2x, or 2154x264 at 3x. Transparent PNG. The 18px radius may be
carried in the alpha or left square; CSS clips either way.

## 2. The constraint that is easy to miss

**The panel's border and glow are keyed to `--acc`, and `--acc` CHANGES SKIN.**

```
--acc: var(--sig-cyan);                                    /* base */
.fs-hud--overdrive { --acc: var(--sig-pink); ... }         /* Overdrive */
```

So the live panel is cyan-edged in base play and pink-edged in Overdrive, and it currently gets
that for free because the edge is CSS, not art.

**A single static raster cannot follow that.** Three ways out, and the first is recommended:

1. **Commission the panel ACCENT-NEUTRAL** — dark navy body, gunmetal and carbon material, no
   dominant cyan or magenta edge — and **keep the existing CSS gradient border and glow layered
   on top**. The art supplies material and depth; CSS keeps supplying the accent. One asset,
   both skins correct, and the smallest possible change.
2. Two rasters, base and Overdrive, swapped by the skin class. Two assets to keep in sync.
3. Bake one accent and lose the Overdrive shift. Not recommended: the accent flip is a designed
   feature-state signal.

## 3. What the art must do

- **Stay dark.** BALANCE, WIN and BET plates sit on top with white, cyan and gold text. The
  panel is behind them and must not lift the local luminance under those plates.
- **Stay quiet in the middle.** Nine controls sit across it. Detail belongs at the ends and
  along the top and bottom edges, not behind the plates.
- **Read as one slab**, not as nine separate wells. The controls already carry their own chrome.
- **Style register:** the arc-2 lock in `docs/art/style_register.json`. Dimensional painted
  cyberpunk-automotive, gunmetal and carbon, upper-left key, no baked text of any kind.
- **No baked copy at all.** There is no exception here; the panel carries no label.

## 4. Implementation blueprint

### 4a. Art-only, no component work

**Adding the panel background is a one-declaration change**: a `background-image` URL layered
under the existing gradients on `.fs-panel`. No markup changes, no new element, no z-index
change, no token change.

Nothing in CI measures `.fs-panel`. `hud_banner_spec_check.mjs` asserts the nine CONTROL boxes;
`control_row_symmetry_gate.mjs` asserts the gaps between controls. **The panel is not among the
asserted geometry**, and because it is `pointer-events:none` it cannot affect hit testing.

**Risk: low.** The one thing to check by eye is contrast under the three plates, which is a look
pass rather than a gate.

### 4b. Requires component work — NOT part of this path

Everything that would put art INTO a control: raster buttons, plate backgrounds for
BALANCE/WIN/BET, a bespoke stepper. Each needs an `<img>` or a background inside an element
whose exact box is asserted from a live render, and each drags in an accessibility question,
because the controls are `<button>` elements carrying 35 aria-labels between them.

### 4c. Must remain CSS or inline SVG, permanently

- **Every control label and value.** Text is localised across sixteen locales; baked type cannot
  follow a locale, and this is the hard constraint that settles the whole question.
- **The accent colour**, because it flips between base and Overdrive skins.
- **The state animations**: the win-plate bloom, the OVERBOOST bet pulse, the autoplay pulse.
  These are keyframes over live values.

## 5. Acceptance, when the asset arrives

1. Exactly 718x88 at 1x, or a clean integer multiple.
2. Transparent PNG, accent-neutral, no baked text.
3. Dropped in as a `background-image` on `.fs-panel`, layered UNDER the existing gradient border.
4. Eyeball both skins: base cyan edge and Overdrive pink edge must both still read.
5. Confirm the three plate readouts still hold contrast over it.
6. `hud_banner_spec_check.mjs` and `control_row_symmetry_gate.mjs` must stay green. They should
   be untouched by this change; if either moves, the change did more than it was supposed to.

**Nothing about this path replaces a control, and nothing about it needs an owner decision
except the commission itself.**
