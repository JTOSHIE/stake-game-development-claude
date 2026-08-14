# Layout measurements, 2026-08-15

TASK 3 of `reports/briefs/FS_RED_CLEARANCE_2026-08-15_Prompt.md`. **EVIDENCE ONLY: no
layout, CSS or component was changed by this pass.** Australian English, no em dashes or
en dashes.

---

## 1. How this was taken

The shipped `dist` was served from a static server, booted to REST in a real browser at
each viewport, both boot surfaces dismissed, no dialog opened and no spin placed. Every
number below is `getBoundingClientRect()` read from the DOM, never measured off an image.
The raw reading, including the ancestor chain, is committed beside this file at
`_measurements.json`, and the frames are `desktop-1280x720.png` and `mobile-s-320x568.png`
at deviceScaleFactor 2.

**The two profiles are the project's own.** Desktop 1280x720 is the size the gate family
uses. The portrait profile is Mobile S 320x568, which `contrast_gate.mjs`,
`layout_fit_gate.mjs`, `direction_parity_gate.mjs` and `popout_conformance.mjs` already
name. It selects HudOverlay's `{#if portrait}` branch, since 568 > 320.

**What each name resolves to**, recorded so no reading is ambiguous:

| Name | Selector | Note |
|---|---|---|
| painted reel frame | `.game-frame` | the drawn frame around the board |
| reel frame | `.grid-slot` | the slot the reel block sits in |
| banner slab | `[data-testid="hud-panel"]` desktop, `.p-controls-row` portrait | the bottom slab |
| turbo | `[data-testid="hud-turbo"]` | |
| spin | `[data-testid="spin-button"]` | |
| autoplay | `.fs-auto` desktop, `.p-autoplay-wrapper button` portrait | |
| features | `[data-testid="feature-menu-button"]` | the offset suspect |

---

## 2. Desktop 1280x720

**Viewport width 1280, viewport centre 640.00.**

| Element | left | right | width | centre |
|---|---|---|---|---|
| painted reel frame | 320.00 | 960.00 | 640.00 | **640.00** |
| reel frame | 379.00 | 901.00 | 522.00 | **640.00** |
| banner slab | 309.00 | 1020.00 | 711.00 | **664.50** |
| turbo | 227.00 | 309.00 | 82.00 | 268.00 |
| spin | 1027.00 | 1111.00 | 84.00 | 1069.00 |
| autoplay | 1111.00 | 1159.00 | 48.00 | 1135.00 |
| features | 966.00 | 1109.33 | 143.33 | 1037.66 |

**Derived:**

| Quantity | Value |
|---|---|
| reel centre | **640.00** |
| banner centre | **664.50** |
| viewport centre | **640.00** |
| reel centre minus viewport centre | **0.00** |
| banner centre minus viewport centre | **+24.50** |
| painted frame centre minus viewport centre | **0.00** |
| gap, turbo right edge to banner left edge | **0.00** |
| gap, banner right edge to spin left edge | **7.00** |

---

## 3. Mobile S 320x568, the portrait profile

**Viewport width 320, viewport centre 160.00.**

| Element | left | right | width | centre |
|---|---|---|---|---|
| painted reel frame | -4.10 | 324.10 | 328.21 | **160.00** |
| reel frame | 26.15 | 293.85 | 267.69 | **160.00** |
| banner slab | 12.00 | 308.00 | 296.00 | **160.00** |
| turbo | 68.00 | 116.00 | 48.00 | 92.00 |
| spin | 126.00 | 198.00 | 72.00 | 162.00 |
| autoplay | 264.00 | 312.00 | 48.00 | 288.00 |
| features | 12.00 | 308.00 | 296.00 | 160.00 |

**Derived:**

| Quantity | Value |
|---|---|
| reel centre | **160.00** |
| banner centre | **160.00** |
| viewport centre | **160.00** |
| reel centre minus viewport centre | **0.00** |
| banner centre minus viewport centre | **0.00** |
| gap, turbo right edge to banner left edge | **-104.00** |
| gap, banner right edge to spin left edge | **-182.00** |

**THE TWO NEGATIVE GAPS ARE CONTAINMENT, NOT OVERLAP.** In portrait the turbo, spin and
autoplay are CHILDREN of the banner slab (`.p-controls-row`), so "the gap from the turbo's
right edge to the banner's left edge" is measuring from a child out to its own parent's
edge. The figures are reported because the brief asks for them, and they mean the turbo
sits 104px inside the slab's left edge and the spin button 182px inside its right edge.
The desktop profile is the one where the two are genuinely separate boxes.

**One small offset recorded rather than passed over**: the portrait SPIN button's centre is
162.00 against a viewport centre of 160.00, **+2.00**. The painted frame, the reel and the
slab are all exactly centred, so this is the button's own position inside a centred row.

---

## 4. The REPORTED figures, re-derived and NOT reproduced

Fable measured a 902 pixel wide screenshot and reported reel centre 405.5, banner centre
428.5, viewport centre 451, an equal step of roughly 23px at each nesting level, and could
not isolate the spin button's left edge. Those were carried into this brief as REPORTED,
and the DOM does not reproduce them.

Scaling that image to the 1280 viewport (factor 1280/902 = 1.4191):

| Quantity | REPORTED, at 902 | Scaled to 1280 | MEASURED from the DOM | Agrees |
|---|---|---|---|---|
| viewport centre | 451 | 640.0 | 640.00 | yes |
| reel centre | 405.5 | 575.4 | **640.00** | **no, out by 64.6** |
| banner centre | 428.5 | 608.1 | **664.50** | **no, out by 56.4** |
| step, each nesting level | about 23 | about 32.6 | **0.00 frame to reel, 0.00 reel to viewport, +24.50 viewport to banner** | **no** |
| spin left edge | could not isolate | | **1027.00** | now known |

**The reel is not off centre. It is exactly centred, twice over**: the painted frame and
the slot both measure a centre of 640.00 against a viewport centre of 640.00, to the
hundredth of a pixel. **The only element off centre is the bottom banner slab, by
+24.50px to the right**, and the "equal step at each nesting level" reading is not present
in the DOM at all.

**One observation, offered as an observation and not as a conclusion.** The slab measures
711.00 wide where the component's own comment beside it describes the v3.2 panel as
"x 296..984 (688 wide)". It is 23px wider than that description and its centre is 24.50px
right of the stage centre the description implies. Whether the panel grew, or moved, or
the comment is stale, is not established here and is not guessed at.

---

## 5. What the reel shares a container with, since the FEATURES button was the suspect

**Desktop.** `.grid-slot` is one of SEVEN children of `.canvas-inner`, and the FEATURES
entry `.fm-entry` (143.33 wide) is one of its siblings, along with `.logo-box` (380),
`.scene-group` (1280), `.game-frame` (640) and `.jets-holder` (1280).

**But the container is `display: block`, not a flex or grid row.** Its computed
`justify-content` is `normal`, its own box is 0 to 1280 with centre 640.00, and the reel's
measured centre is 640.00. **A block container does not distribute its children, so a
sibling cannot push the reel sideways**, and the measurement agrees: the reel is dead
centre with the FEATURES entry present. **The FEATURES suspect is refuted for the reel.**

The ancestor chain, each one measured: `.grid-slot` (379 to 901, centre 640.00) inside
`.canvas-inner` (0 to 1280, centre 640.00, block) inside `.canvas-slot` (0 to 1280) inside
`main.game-wrapper` (0 to 1280, transform `matrix(1, 0, 0, 1, ...)`, so unscaled at this
size) inside `.game-stage` (0 to 1280, `display: flex`, `justify-content: center`).

**Portrait.** `.canvas-inner` carries `transform: matrix(0.512821, ...)` and measures
-168.20 to 488.20, a 656.4 wide block scaled into a 320 viewport, centre 160.00. It has
three children: `.game-frame`, `.jets-holder` and `.grid-slot`. The FEATURES entry is not
among them: in portrait it is the full-width bar at 12.00 to 308.00.

**So the banner slab's +24.50 on desktop is not inherited from the reel's container.** The
reel's chain is centred at every level. The slab is a different subtree and is where the
offset lives. Nothing further is derived here, and nothing was changed.
