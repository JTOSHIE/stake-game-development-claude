# Control row geometry, 2026-08-15

JOB A of `reports/briefs/FS_CONTROL_ROW_FONTS_2026-08-15_Prompt.md`. Every number below is
`getBoundingClientRect()` read from the DOM of the built app at rest, never measured off
an image. Australian English, no em dashes or en dashes.

Frames beside this file: `before-<profile>.png` and `after-<profile>.png` at all three
profiles. Raw readings: `_before.json` and `_after.json`.

---

## A1. What was there, measured

### Desktop 1280x720, canvas centre 640.00

| Element | left | right | width | centre |
|---|---|---|---|---|
| turbo | 227.00 | 309.00 | 82.00 | 268.00 |
| **slab** | 309.00 | 1020.00 | 711.00 | **664.50** |
| max | 325.00 | 373.00 | 48.00 | 349.00 |
| menu | 389.00 | 433.00 | 44.00 | 411.00 |
| balance | 449.00 | 649.00 | 200.00 | 549.00 |
| win | 665.00 | 815.00 | 150.00 | 740.00 |
| bet | 831.00 | 951.00 | 120.00 | 891.00 |
| steppers | 967.00 | 1011.00 | 44.00 | 989.00 |
| spin | 1027.00 | 1111.00 | 84.00 | 1069.00 |
| auto | 1111.00 | 1159.00 | 48.00 | 1135.00 |

**Gaps, left to right:** turbo to max **16.00**, max to menu **16.00**, menu to balance
**16.00**, balance to win **16.00**, win to bet **16.00**, bet to steppers **16.00**,
steppers to spin **16.00**, spin to auto **0.00**. Outer: turbo right to slab left
**0.00**; slab right to spin left **7.00**. Slab centre against canvas centre **+24.50**.

### Owner ratio 1200x675, canvas centre 600.00

Every figure is the desktop one times 0.9375, which is the stage scale at this size, so
the row is proportionally identical rather than separately laid out: gaps all **15.00**,
spin to auto **0.00**, outer **0.00** and **6.56**, slab centre **+22.97**.

| Element | left | right | width | centre |
|---|---|---|---|---|
| turbo | 212.81 | 289.69 | 76.88 | 251.25 |
| **slab** | 289.69 | 956.25 | 666.56 | **622.97** |
| max | 304.69 | 349.69 | 45.00 | 327.19 |
| menu | 364.69 | 405.94 | 41.25 | 385.31 |
| balance | 420.94 | 608.44 | 187.50 | 514.69 |
| win | 623.44 | 764.06 | 140.63 | 693.75 |
| bet | 779.06 | 891.56 | 112.50 | 835.31 |
| steppers | 906.56 | 947.81 | 41.25 | 927.19 |
| spin | 962.81 | 1041.56 | 78.75 | 1002.19 |
| auto | 1041.56 | 1086.56 | 45.00 | 1064.06 |

### Portrait, Mobile S 320x568, canvas centre 160.00

| Element | left | right | width | centre |
|---|---|---|---|---|
| turbo | 68.00 | 116.00 | 48.00 | 92.00 |
| **slab** (`.p-controls-row`) | 12.00 | 308.00 | 296.00 | **160.00** |
| max | 208.00 | 256.00 | 48.00 | 232.00 |
| balance | 12.00 | 156.00 | 144.00 | 84.00 |
| win | 164.00 | 308.00 | 144.00 | 236.00 |
| bet | 12.00 | 308.00 | 296.00 | 160.00 |
| steppers | 134.20 | 293.00 | 158.80 | 213.60 |
| spin | 126.00 | 198.00 | 72.00 | 162.00 |
| auto | 264.00 | 312.00 | 48.00 | 288.00 |

**A SINGLE LEFT-TO-RIGHT GAP LIST DOES NOT DESCRIBE THIS PROFILE, so none is given.**
Portrait is not one row: the balance and win plates sit at centre-Y 373.75, the bet plate
and steppers at 445.00, and the turbo, spin and autoplay at 522.00. They are three stacked
rows inside one slab, and the turbo and spin are CHILDREN of that slab rather than
neighbours of it. The slab itself measures **dead centre, 160.00 against 160.00**, and
there is no menu control in this profile. Portrait was not touched by A2.

### The 711 against 688 discrepancy, resolved

**Cause: a stale inline comment, not a stale geometry.** The comment above `.fs-panel` read
`v3.2 x 296..984 (688 wide)`, which is the PRE-2026-07-25 panel. OWNER AUDIT ROUND 3 item 7
shifted the whole row right and re-measured the banner to `left:309px; width:711px`, and
`docs/HUD_SPEC.md` records exactly that. The CSS and the locked spec agreed with each other
all along at 711; only the comment beside them still described the superseded geometry. The
comment is now corrected in place, with the supersession named rather than erased.

**One thing worth keeping from the old numbers:** 296..984 has a centre of 640, the canvas
centre. The pre-audit panel WAS canvas-centred, and the +49px row shift is what took that
away. That is history rather than a defect, and it is why the centring question below is a
real question rather than an idle one.

---

## A2. What changed, and the one thing that could not

### The token, and where its value came from

**`--fs-row-gap: 16px`.** The value is not invented and not chosen: **seven of the row's
eight control-to-control gaps already measured exactly 16.00**, and `docs/HUD_SPEC.md`
rule 2 has locked that step since 2026-07-25. The eighth gap, spin to auto, is 0.00 by
rule 4, AUTO tangent to SPIN, and is expressed as a tangency rather than as a gap.

Every horizontal position in the row is now derived from that token and the controls' own
widths, in one chain from TURBO's left edge. Nine hand-set pixel values are gone.

### What moved: one edge, 7px

**Every control's rendered coordinate is unchanged**, which is proved rather than asserted:
`frontend/scripts/hud_banner_spec_check.mjs` pins each of the nine controls to its exact
locked left, top, width and height and passes. The `_after.json` reading agrees: comparing
before to after, **the only box whose geometry changed is the slab**.

The slab's right inset was 9px against a left inset of 16px. It is now one token on both
sides, so the slab runs from one gap before MAX to one gap after STEPPERS, and its width
goes 711 to 718.

### The result

| Quantity | before | after |
|---|---|---|
| outer gap, turbo right to slab left | 0.00 | **0.00** |
| outer gap, slab right to spin left | 7.00 | **0.00** |
| **the two outer gaps are equal** | **no** | **YES, 0.00 and 0.00** |
| every control-to-control gap | 16.00 x7 | 16.00 x7, unchanged |
| spin to auto | 0.00 | 0.00, unchanged |
| slab centre against canvas centre | +24.50 | +28.00 |

At 1200x675 the same figures scale: outer gaps **0.00** and **0.00**, control gaps
**15.00**, slab centre **+26.25**.

### THE SLAB DOES NOT CENTRE ON THE CANVAS, AND IT CANNOT WITHOUT MOVING LOCKED CONTROLS

The brief asks for equal outer gaps AND a canvas-centred slab. **The two are mutually
unsatisfiable while the controls stay where `docs/HUD_SPEC.md` locks them**, and the proof
is one line:

- equal outer gaps means `slab.left - turbo.right = spin.left - slab.right`;
- a canvas-centred slab means `slab.left + slab.right = 2 x 640 = 1280`;
- substituting gives `640 - turbo.right = spin.left - 640`, so it needs turbo.right and
  spin.left to be **equidistant from 640**. They are locked at 309 and 1027, which are
  **331** and **387** away. 331 is not 387, for any slab width.

Equivalently: the slab's contents run MAX.left 325 to STEPPERS.right 1011, whose midpoint
is **668**, not 640. A symmetric slab inherits 668. **The row is right-heavy by design**,
TURBO alone on the left against SPIN plus AUTO on the right, and the slab is where that
shows.

**So the +28.00 is not a defect this pass declined to fix. It is a consequence of the
locked coordinates, and moving them is an owner decision.** Three options, none applied:

1. **Leave it.** The slab is a backdrop; the controls it backs are correctly spaced and the
   two outer gaps are now equal. Cost: the banner reads 28px right of centre against a
   dead-centred reel.
2. **Shift the whole row left by 28px.** Every control keeps its spacing, the slab centres,
   the row's own extent moves off centre in the other direction. Cost: nine locked
   coordinates change, `docs/HUD_SPEC.md` and `hud_banner_spec_check.mjs` change with them.
3. **Rebalance the row.** Move AUTO to the left of TURBO, or give the left side equivalent
   furniture, so the contents' midpoint IS 640. Cost: a real layout redesign and an owner
   art call.

---

## A3. The gate

`frontend/scripts/control_row_symmetry_gate.mjs`, run at both fullscreen viewports:

- the two outer gaps are equal, to two decimal places;
- every control-to-control gap is the same token;
- AUTO is tangent to SPIN, so a later tidy-up cannot apply the token to it;
- the slab's offset from the canvas centre is PRINTED every run and deliberately not
  asserted, because asserting it would be asserting an owner decision nobody has made.

**Seeded self-test, convention (p):** the seed widens the slab's left inset by 6px in a
scratch copy of the source, rebuilds to the gitignored scratch tree, and the run must go
red naming the skewed gap. It does: `the two OUTER gaps are equal (turbo to slab -6.00,
slab to spin 0.00)` at both viewports, with the other assertions still green, and the
working file is restored and verified byte for byte afterwards.

**The gate is NOT wired into CI in this pass**, because A4 leaves the geometry awaiting the
owner's eye and a gate that pins a geometry the owner may change is a gate that will need
changing with it.

---

## A4. THIS IS AN OWNER EYE-CALL

**A3 passing is not approval and is not offered as approval.** What the gate proves is that
the two outer gaps are now equal and that one token drives the row. **Whether the result
LOOKS right, and whether the slab's +28.00 from the canvas centre should be closed by
moving locked controls, is the owner's judgement on the before and after captures in this
directory.** Nothing here anticipates that answer.

---

## A5. THE REBALANCE, R071 TASK 6, and the owner's ruling closed the question

The owner ruled the third option: **the control row's contents align their midpoint to
the canvas centre.** The frames for it are `rebalanced-<profile>.png` beside the before
and after pairs above, and the reading is committed beside them as _rebalanced.json (unbackticked, because a
bare filename in backticks is a repository-root path claim to the document currency gate).

**It is one number.** Because A2 put every horizontal position on one chain derived from
`--fs-x-turbo`, moving the row's origin from 227 to 199 translates all nine controls by
the same 28px. The seven 16px gaps are untouched, AUTO stays tangent to SPIN, and the
slab, which is symmetric about its contents, arrives at the canvas centre with them.

| Quantity | before A2 | after A2 | after the rebalance |
|---|---|---|---|
| slab centre against canvas centre, desktop | +24.50 | +28.00 | **0.00** |
| contents midpoint against canvas centre | +28.00 | +28.00 | **0.00** |
| the two outer gaps | 0.00 and 7.00 | 0.00 and 0.00 | **0.00 and 0.00** |
| the seven control gaps | 16.00 | 16.00 | **16.00** |
| SPIN to AUTO | 0.00 | 0.00 | **0.00** |
| row extent, desktop | 227 to 1159 | 227 to 1159 | **199 to 1131** |

At the owner's own 1200x675 ratio every figure scales with the stage and the offsets are
**0.00** there too.

**TWO CONTROLS DID NOT MOVE ON THE FIRST ATTEMPT, and the gate caught it.** MENU and AUTO
are positioned by their WRAPPERS, `.menu-wrapper` and `.autoplay-wrapper`, which carried
hand-set lefts of their own that the A2 token chain never touched, because A2 changed only
the rules it rewrote. Translating the origin moved the seven controls that were on the
chain and left those two behind: the run reported `gap max->menu 44`, `gap menu->balance
-12` and `AUTO tangent 28`. Both wrappers are now on the chain, `--fs-x-menu` and
`--fs-x-auto`, and AUTO's token is derived from SPIN's own left and width so the tangency
cannot drift. **This is exactly what a runtime gate is for**: a static count of the token
would have reported nine tokens and said nothing.

`docs/HUD_SPEC.md` and `frontend/scripts/hud_banner_spec_check.mjs` move to the new
coordinates in the same commit, which the spec's own rule requires, and that check passes
on all nine controls. `control_row_symmetry_gate.mjs` now ASSERTS the centring rather than
printing it, and is wired into the browser matrix.
