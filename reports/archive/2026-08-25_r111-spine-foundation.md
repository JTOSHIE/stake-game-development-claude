# R111: the robot is articulated and non-static, built with no runtime at all

Date: 2026-08-25. Branch: `claude/r111-spine-foundation`. Review lane, unattended.

Brief saved verbatim: `reports/briefs/FS_FABLE_R111_SPINE_FOUNDATION_Prompt.md`. Branch:
`claude/r111-spine-foundation`, review lane. **The hero now moves from the waist up with its feet
planted.** Eleven part rasters committed, one new component, one declaration changed in the old one.

## The shortest true summary

**The robot is non-static.** Head, torso and both arms articulate on a real bone hierarchy; the
legs and feet deliberately do not move, and that was verified by measurement rather than by
reading the CSS.

**No Spine runtime was added, and none was needed.** The bone hierarchy is nested DOM elements
with `transform-origin` set to each joint. Zero new dependencies, 60fps, no canvas.

**`rig={false}` restores the old flat sprite exactly.** The fallback is one prop.

---

## WORKSTREAM 1: parts, hierarchy, pivots

### 1.1 Inventory, and every claim in the kit doc checked

`.scratch/art-review/chatgpt-robot-spine-parts/` holds **eleven parts and a breakdown document**,
and it is the only complete body set in any kit. It is a genuinely good package. Every claim its
`PROMPTS_AND_QA.md` makes about processing verified first-hand:

| Claim | Result |
|---|---|
| Eleven canvases at the stated sizes | **11/11 exact** |
| Consistent 20 px safety margin | 20 px on every side, except 21 px left/right on `06-lower-right-arm-hand.png` |
| All four corner alphas zero | **11/11** |
| Transparent pixels have zeroed RGB | **11/11** |

Two claims in that document are **false**: it lists a review/ directory (contact sheet and
neutral assembly preview) and a source-original/ directory for provenance. **Neither exists on
disk.** The parts themselves are unaffected, but the document oversells what was delivered.

**The one thing to understand about this set:** the limbs are drawn in neutral straight
orientations, deliberately, so they can be rotated. They are **not** the shipped hero's
crossed-arm pose. That has a consequence, and it is in the tensions section below.

### 1.2 and 1.3 Hierarchy and pivots, verified by assembly rather than trusted

The kit publishes a joint table. **After R110 I do not accept a documented pivot without
rendering it**, so I chained every joint and composited the figure:

```
pelvis (root)
├── leg upper L/R ──> leg lower L/R          hip -> knee
└── torso                                     waist
    ├── arm upper L/R ──> arm lower L/R       shoulder -> elbow
    └── head                                  neck
```

The result is a **coherent, fully connected robot**, recognisably the same character as the
shipped hero: same domed helmet, cyan-to-magenta visor, orange earpiece, carbon chest, cyan waist
cells, magenta and cyan boot rims. The kit's pivots are correct as published.

**Nothing critical is missing.** The set is complete for a standing idle.

---

## WORKSTREAM 2: runtime foundation

### 2.1 The route, and why it is not Spine

A read-only reconnaissance pass over the codebase established the constraints, and each
load-bearing finding was then given to a separate agent whose job was to refute it:

- **pixi.js 7.4.3 is the only rendering library, and there is no Spine runtime of any kind.**
  No `@esotericsoftware/*`, no `pixi-spine`, no `spine-webgl`, and **zero `.atlas` or `.skel`
  files anywhere in the repository**.
- **Pixi is imported in exactly one file** (`GameGrid.svelte`), pulling only `Application` and
  `Graphics`, into a fixed 616x412 canvas parented inside the reel grid. It renders nothing in the
  hero's box and the two cannot share a canvas without a layout change.
- **CSS is what actually animates this game**: 95 `@keyframes` blocks across `frontend/src`.
- **A working multi-part, parented, transform-driven animation already ships on this exact hero**,
  in DOM and CSS, including its reduced-motion contract.

So the honest reading is that **the Spine route would mean adding a dependency AND authoring
skeleton data that does not exist**, to reimplement a capability the platform already gives for
free. The brief says do not over-engineer. **Nested DOM transforms ARE a bone hierarchy**: a
child's transform composes with its parent's, and `transform-origin` is the joint. Rotating
`.bone-torso` carries the head and both arms because they are its descendants.

**`frontend/src/lib/components/RobotRig.svelte`**, 11 `<img>` elements in 22 nodes, 6 CSS
animations, no JavaScript in the animation loop, GPU-composited.

### 2.2 Integration and the geometry

Everything inside `.rig-root` is positioned in the parts' own **source pixels**, so the kit's
joint table is used unmodified; one scale on the root maps that space into the existing box.

| | value | derived from |
|---|---|---|
| root offset | `left: 23.95px; top: 9.09px` | matching the assembled subject to the shipped hero's subject box |
| root scale | `0.27784` | hero subject height 388.98 layer px / rig subject height 1400 source px |
| rig subject | 569x1400 source px, aspect 0.4036 | measured |
| hero subject | 504x1284 source px, aspect 0.3925 | measured |

**Layout is unchanged and this was checked in the browser, not assumed:** `.char-layer` still
measures exactly 206x407 design px with the rig mounted. The car is untouched. Nothing in the app
anchors to the character, so there was nothing else to move.

**Fallback:** `export let rig = true`. Passing `false` renders the original
`<img class="char-img">` and every original rule still applies to it, so the old behaviour is
recovered exactly rather than approximately.

**One deliberate difference from the kit's flat draw order.** Nesting the arms under the torso
means they paint above the pelvis, where the kit's order tucks them behind it. Measured, the two
orders differ by **8,184 pixels, 0.8% of the figure**, at the hip. Arms in front of the hips is
the anatomically natural reading, so nesting won.

### 2.3 Motion policy: exactly one idle runs

**The CSS bob is switched off when the rig mounts**, via `.char-layer.char-rigged { animation:
none }`. The flat sprite had no joints, so its only possible life was moving the whole picture:
`char-idle` slid it 7px and swayed it 0.6deg. Stacking that on an articulated breathe is precisely
the double-bob the brief forbids. The rig articulates instead.

---

## WORKSTREAM 3: the first idle

| Bone | Rotation | Also | Period |
|---|---|---|---|
| torso (about the waist) | ±0.55° | translateY 4 source px | 5.2 s |
| head (about the neck) | ±0.9° | | 7.1 s |
| upper arms (shoulders) | ±1.3° / ±1.1° | | 5.8 s / 6.3 s |
| lower arms (elbows) | ±1.1° / ±1.3° | | 6.7 s / 5.5 s |
| **pelvis and both legs** | **none** | **none** | **not animated** |

Amplitudes are in source pixels, so the torso's 4px translate is **0.56 layer px on screen**:
deliberately small. The periods share no common factor, so the bones drift in and out of phase and
the loop never resolves into a visible pulse. That is the difference between an idle that reads as
breathing and one that reads as a metronome.

**The legs are static on purpose.** In a hierarchy where the legs descend from the pelvis, any
pelvis motion moves the feet. Animating from the waist up keeps the feet planted, which is what
the brief means by stable grounded presentation.

**Reduced motion freezes to the clean neutral pose.** The rig's rest state IS the assembled
figure, so stopping every bone leaves a correct, fully-connected character rather than a
half-played frame.

---

## WORKSTREAM 4: visual QA, all measured

Run headlessly against the built `dist/` through the repo's own preview server and Playwright,
from a probe kept in the scratchpad so nothing was written into the tree.

| Check | Result |
|---|---|
| Parts loaded | **11/11, zero broken, zero failed requests** |
| Console errors | **none**, base game and through spins |
| Frame rate | **60.0 fps**, mean 16.67 ms, p95 16.8 ms, worst 18.2 ms, **zero frames over 20 ms** |
| Layout | `.char-layer` exactly 206x407 design px, unchanged |
| Joint separation | none at rest, at idle extremes, or at counter-phase worst case |
| Grounding | feet planted; **zero changed pixels in the bottom 30% of the figure** |
| Base game / during spin / after spin | rig present, 11 parts, 6 animations, visible |
| Portrait | scene unmounts entirely (pre-existing: the scene is landscape-only) |
| Return to landscape | rig restored cleanly, 11 parts, 6 animations, no leak |
| Reduced motion (emulated) | **every bone: 0 animations, `transform: none`** |

**Joints were checked at the extremes, not just at rest.** I rendered the neck and waist at rest,
at the idle extreme, and at a counter-phase worst case where parent and child pull opposite ways.
The segmented neck stays seated in its collar and the pelvis stays married to the torso in all
three.

### An instrument correction inside this session

My first motion measurement said 29% of the hero box changed, **with motion in the feet**. That
was wrong, and wrong in a familiar way: I had paused only the animations whose names begin `rig-`,
so **the car's own `car-hover`, underglow, neon and booster flicker were still running behind the
robot** and their motion was being counted as the robot's.

Re-measured with **all 54 page animations frozen** and only the rig's bones seeked, the result is
clean: 17.96% of the box changes, and the bottom three bands of the figure show **exactly zero
changed pixels**. A heatmap of the difference shows the head, torso and arms lit and the legs
completely dark. **The first number was measuring the scene; the second measures the robot.**

---

## Two defects found in the overlays, one of them mine to fix

`.antenna-light` and `.visor-glint` are positioned in percentages of `.char-layer`, and those
percentages were calibrated against the flat sprite.

**The antenna light was blinking in empty space.** Its inherited box spans layer x 24.7..49.4; the
rig's head does not begin until x 50.1. Re-derived against the rig's own head raster and re-centred
on the earpiece orb, then confirmed in the browser: measured centre **(65.1, 58.2)** against a
target of **(65.1, 58.0)**. It was also made near-circular, because the orb is 10.5x11.6 layer px
and the inherited 12%x8% box smeared a round light into a vertical ellipse.

**The glint was re-derived by R110's own method** — sweep `top`, take the most gradient energy
landing on the lens. For the rig that peaks at **9%** (49.2% on lens) rather than the flat sprite's
11%.

**Both fixes are scoped to `.char-rigged`.** The base rules are untouched, so the fallback keeps
the flat sprite's exact shipped behaviour.

**AND A PRE-EXISTING ONE, INDEPENDENTLY CORROBORATED.** `.antenna-light` never overlapped the orb
on the flat sprite either. I measured it, and a separate reconnaissance agent that had not seen my
numbers reached the same conclusion from the other direction, calling it "the same defect class
R110 found and fixed on `.visor-glint`, still unfixed on its sibling". **I did not change it**: it
belongs to the fallback path, and it is the owner's call whether the fallback should be corrected
or simply retired. The fix is `left: 25.6%; top: 11.3%` with a rounder box.

---

## WORKSTREAM 5: does this move the "poor animations" tag

**On the hero, yes, and it is the difference between a picture and a character.** What a reviewer
now sees: the chest rises and falls, the head drifts against it, both arms carry independent
shoulder and elbow life, and the feet stay put. What they saw before was one flat image sliding up
seven pixels and back on a five-second loop, which is the single most recognisable tell of a game
with no animation budget.

**But I will not overclaim it.** "Poor animations" is almost certainly a judgement about the whole
presentation, not about one character in the left gutter, and **the reels are still where a player
spends their attention**. The hero is now the best-animated thing on the screen, which is itself
diagnostic of what remains.

**Still missing for a stronger score, in the order a reviewer would notice:**

1. **Symbol life.** Symbols land and sit there. Idle shimmer, landing impact and win pulses are
   the highest-value remaining work, and the FX set closed in R108 already provides the material.
2. **Win acknowledgement.** Nothing on the character or the scene reacts to a win.
3. **Feature entry.** The transition into Overdrive free spins has no character or scene beat.
4. **Reel-stop weight.** Stops are positional rather than physical.

**Yes, symbol and feature animation still need a parallel pass.** This session bought the hero;
it did not buy the reels.

---

## WORKSTREAM 6: ranked animation roadmap

1. **Leave this idle alone unless the owner dislikes the pose.** It is stable, cheap and verified.
   The open question is artistic, not technical, and it is the first tension below.
2. **Simple win acknowledgement on the hero.** The rig makes this nearly free: a short additive
   pose on the existing bones, gated on a win event, reusing the same reduced-motion contract.
   Highest ratio of perceived polish to risk now available.
3. **Feature-entry reaction.** A one-off character beat on Overdrive entry, same mechanism.
4. **Broad symbol and feedback pass.** The largest and most valuable block, and the one that
   actually addresses the review tag. Independent of the rig.
5. **Audio coupling.** Only once the visual beats exist to couple to.

---

## Tensions surfaced rather than decided, per convention (n)

**1. THE POSE CHANGED, AND THIS IS THE OWNER'S CALL.** The shipped hero stands with **arms folded
and legs crossed**, which is a confident, characterful piece of staging. The rig's parts are drawn
straight so they can rotate, so the articulated robot stands **neutrally, arms at its sides, with
visibly wider shoulders**. It is unmistakably the same character and the art quality is equal, but
it has **less attitude than the pose it replaces**. That is a real trade: the game gains life and
loses swagger. Folding the arms is not available from these parts, because the hero's folded arms
are a single baked shape. If the owner wants the old attitude back, the honest options are to
commission crossed-arm limb variants, or to keep `rig={false}` and wait.

**2. The rig is 2.8% wider in proportion than the flat hero** (subject aspect 0.4036 against
0.3925). Matched on height, so the feet and the crown land where they did.

**3. LAYOUT_SPEC v3.1 still specifies "about 560 character height" and the hero ships at 388.8.**
That predates this session and is unchanged by it, but the spec is nominally live and now
describes neither the old hero nor the new one.

**4. A separate confirmed defect I did not touch.** The cohesion rim-light and scene-grading
filter on `.char-img` and `.car-img` is **dead in the shipped bundle**, overridden by a later
equal-specificity rule that re-declares `filter` wholesale. The rig matches the *effective*
shipped look, so it introduces no new inconsistency, but the rim light nobody is seeing is a real
finding and belongs to a separate pass.

---

## What shipped

| File | Nature |
|---|---|
| `frontend/src/lib/components/RobotRig.svelte` | new, the bone hierarchy and idle |
| `frontend/src/lib/components/SceneGroup.svelte` | rig mount, fallback prop, motion policy, overlay overrides |
| `frontend/public/assets/themes/future-spinner/ui/robot/*.png` | 11 part rasters, 1.1 MB, **committed because the feature 404s without them** |
| `docs/art/robot_parts.provenance.json` | provenance, per the R109 ruling |

**The eleven rasters are committed deliberately**, and this is the one place the fence needed a
judgement. The brief permits animation and runtime foundation files; the parts ARE the animation.
`dist_hygiene_gate` additionally requires a clean-tree build naming HEAD, so an uncommitted part
set could never go green. **The thirty working-tree placeholder rasters were not swept in** and
their count is unchanged.

**Provenance is recorded and lives outside the bundle.** The record was first written beside the
images and then moved to `docs/art/`, because it cites internal `.scratch/` paths and those should
not ship to players. Every part's sha256 is recorded and verified byte-identical to the kit source.

**dist:** 15.72 MB against a 25 MB budget.

**Gates, all green locally:** build, `locked_paths`, `doc_currency` (0 new), `asset_guard` 11/11
self-test, `asset_reference`, `build_diet_verify`, `dead_wiring`, `dash`, `multiplication_sign`,
`machine_tell`, `evidence_hygiene`, `supply_chain`, `layout_fit`, `smallscreen_composition`.

**Not run deliberately:** `scene_proof.mjs`, which writes into the committed `frontend/screens/`
directory and would have dirtied the tree.
