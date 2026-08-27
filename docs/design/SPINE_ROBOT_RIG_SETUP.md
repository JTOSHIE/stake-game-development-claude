# SPINE_ROBOT_RIG_SETUP.md — the pilot robot, part breakdown to first idle

**Written 2026-08-25, R102 WORKSTREAM B.** This is a SETUP SPECIFICATION, not a runtime.
Nothing in the shipped game reads it yet, and that is deliberate: see section 7.

**What exists today.** The robot ships as ONE static raster, `ui/scene_character.png` at
680x1344, drawn as a single `<img>` in `SceneGroup.svelte`. There is no skeletal animation of
any kind anywhere in this repository: a sweep for Spine, skeleton, `.atlas` and
esotericsoftware at HEAD returns nothing. So this document describes a rig that does not yet
exist, from parts that are not yet in the repository.

---

## 1. Provenance, and why the measurements are transcribed here

An eleven-part breakdown of the robot was generated into the incoming art directory under an
art-review folder named for the robot spine parts. **That directory is not tracked by git.**
Convention (m) says an external document must be in the repository before work cites it, so
every load-bearing figure below is TRANSCRIBED here rather than cited by path. If the parts
are later adopted into the repository, this file is the record they should be checked against.

**The delivery record over-claims itself, and that is recorded rather than smoothed over.** It
promises a review folder holding a contact sheet and a neutral assembly preview, and a
source-original folder holding the unprocessed generator outputs. **Neither exists.** The
folder contains exactly the eleven part PNGs and the record itself, verified by listing it.
Anyone planning the rig on the strength of "there is a neutral assembly preview to check
against" should know there is not. (Those two folder names are deliberately written in prose
rather than as citations, because a citation to a path that does not exist is exactly what the
document currency gate refuses, and it refused this file once for doing it.)

---

## 2. Part inventory, measured

Measured at R102 from the delivered files, not copied from the record. Ink is the fraction of
pixels at alpha >= 128. Every part is RGBA with genuine transparency, all four corner alpha
values are zero, and transparent pixels carry zeroed RGB, so no despill pass is needed.

| # | Part | Canvas | Subject bbox | Ink | Body role |
|---|---|---|---|---|---|
| 01 | head + visor | 380x330 | 336x286 | 44.5% | Head, visor, antenna, earpiece, neck connector |
| 02 | torso + chest | 480x340 | 434x296 | 57.5% | Torso, collar, shoulder sockets, carbon plate, waist connector |
| 03 | upper left arm | 190x270 | 146x228 | 41.0% | Anatomical-left shoulder to elbow |
| 04 | lower left arm + hand | 200x310 | 154x268 | 46.5% | Anatomical-left elbow to hand |
| 05 | upper right arm | 190x270 | 146x228 | 45.9% | Anatomical-right shoulder to elbow |
| 06 | lower right arm + hand | 200x310 | 154x268 | 47.1% | Anatomical-right elbow to hand |
| 07 | pelvis + waist | 420x260 | 376x216 | 55.2% | Waist shell, cyan cells, pelvis armour, both hip sockets |
| 08 | upper left leg | 220x340 | 176x298 | 50.4% | Anatomical-left hip to knee |
| 09 | lower left leg + foot | 230x450 | 184x406 | 47.3% | Anatomical-left knee to foot, magenta boot rim |
| 10 | upper right leg | 220x340 | 176x296 | 50.9% | Anatomical-right hip to knee |
| 11 | lower right leg + foot | 230x450 | 184x406 | 50.0% | Anatomical-right knee to foot, cyan boot rim |

**Three properties that matter for rigging, all verified rather than assumed:**

1. **Every subject is centred in its canvas.** The opaque centroid of all eleven parts sits at
   (0.50, 0.50) of the canvas. So the default pivot of an imported image is the CENTRE OF THE
   PART, never a joint. Every pivot in section 4 has to be set deliberately.
2. **There is a consistent transparent margin of about 20 to 23 pixels on every side.** Canvas
   minus subject bbox is 44 to 46 px on both axes for all eleven parts. Do not crop it: it is
   what stops a rotated limb clipping its own edge.
3. **Left and right parts share identical canvases**: upper arms both 190x270, lower arms both
   200x310, upper legs both 220x340, lower legs both 230x450. A mirrored rig is therefore
   arithmetically clean.

---

## 3. Naming convention

**Anatomical, never screen-relative, because the two are opposites in a front view.** The
robot's left arm appears on the viewer's RIGHT. Every name below is the robot's own left and
right, and the delivered files already follow this.

Adopt this for slots, bones and attachments alike, lowercase with underscores:

```
root
  hip
    pelvis
    torso
      head
      arm_l_upper -> arm_l_lower
      arm_r_upper -> arm_r_lower
    leg_l_upper  -> leg_l_lower
    leg_r_upper  -> leg_r_lower
```

Slot names match bone names. Attachment names match the part they carry, so
`arm_l_lower` carries attachment `arm_l_lower`. Keeping the three identical means a
mis-mapped attachment is visible in the tree rather than discoverable only by playing the
animation.

---

## 4. Hierarchy and pivots

`root` sits at the floor, under the feet, so the whole rig can be translated for a bob without
the feet sliding. `hip` is the animation anchor: it is what a breathing idle actually moves.

| Bone | Parent | Carries | Pivot in its own PNG, from top-left |
|---|---|---|---|
| `root` | — | nothing | floor level, x centred |
| `hip` | `root` | nothing | — |
| `pelvis` | `hip` | part 07 | torso socket (210, 30) |
| `torso` | `pelvis` | part 02 | waist (240, 310) |
| `head` | `torso` | part 01 | neck (190, 300) |
| `arm_l_upper` | `torso` | part 03 | shoulder (95, 30) |
| `arm_l_lower` | `arm_l_upper` | part 04 | elbow (100, 35) |
| `arm_r_upper` | `torso` | part 05 | shoulder (95, 30) |
| `arm_r_lower` | `arm_r_upper` | part 06 | elbow (100, 35) |
| `leg_l_upper` | `hip` | part 08 | hip (110, 30) |
| `leg_l_lower` | `leg_l_upper` | part 09 | knee (115, 35) |
| `leg_r_upper` | `hip` | part 10 | hip (110, 30) |
| `leg_r_lower` | `leg_r_upper` | part 11 | knee (115, 35) |

**Socket positions on the parent parts**, for placing the child bones:

- Torso: neck (240, 30), shoulders (35, 125) and (445, 125), waist (240, 310).
- Pelvis: torso socket (210, 30), hips (110, 195) and (310, 195).
- Upper arm elbow socket (95, 240). Upper leg knee socket (110, 310).

**Legs parent to `hip` and not to `pelvis`.** The pelvis is a rendered part; the hip is the
transform the animation drives. Parenting legs to a rendered part means every waist rotation
drags the legs with it, which is wrong for a breathing idle.

### These pivots were checked, not trusted

- **Every pivot is exactly horizontally centred** in its own canvas: head 190 of 380, torso
  240 of 480, pelvis 210 of 420, upper arm 95 of 190, lower arm 100 of 200, upper leg 110 of
  220, lower leg 115 of 230. An off-centre pivot would skew the whole rig.
- **Both socket pairs are exactly symmetric.** Torso shoulders sit 205 px either side of the
  neck; pelvis hips sit 100 px either side of the torso socket.
- **The chain assembles to the right height.** Head above neck 300, torso 280, pelvis 165,
  upper leg 280, lower leg below knee 415 gives 1440 px. Four joint seams each double-count
  two 20 px margins, so the standing figure is about 1280 px against the 1344 px reference the
  parts were drawn from: **95 per cent, which is agreement rather than coincidence.**
- Arm reach from shoulder is 485 px against a 695 px leg, a ratio of 0.70, close enough to
  human proportion to look deliberate.

**Draw order, back to front:** lower legs, upper legs, lower arms, upper arms, pelvis, torso,
head. Adjust connector depths per pose; the arms sit in front of the torso in a neutral front
view and behind it once they swing back.

---

## 5. Import procedure

1. Import the eleven PNGs as attachments into one skeleton, one attachment per slot, names per
   section 3.
2. **Set every pivot before parenting anything.** The images arrive centre-pivoted, so a
   default import produces a rig where every limb rotates about its own middle. Use section 4.
3. Build the bone tree, parent the slots, then set the draw order.
4. Do NOT crop or trim the transparent margins on import. Section 2 point 3.
5. Pack the atlas with the margins preserved and premultiplied alpha OFF, matching how the
   rest of this project's transparent art is handled.

---

## 6. The first idle animation

Target a loop of 3 to 4 seconds so it does not read as a repeating tic. Everything below is
small: an idle that is visible as motion is too big.

| Channel | Bone | Suggested |
|---|---|---|
| Bob | `hip` | translate Y, 6 to 10 px, ease in and out, the master rhythm |
| Breathe | `torso` | scale Y 1.00 to 1.015, in phase with the bob |
| Head settle | `head` | rotate 1.5 to 2.5 degrees, LAGGING the torso by 4 to 6 frames |
| Arm sway | `arm_*_upper` | rotate 1 to 2 degrees, opposing the bob |
| Forearm follow | `arm_*_lower` | rotate 0.5 to 1 degree, lagging the upper arm |
| Legs | `leg_*` | nothing. Feet stay planted |

**Offset the two sides by roughly a fifth of the loop.** Perfect bilateral symmetry is the
single strongest tell that something is rigged rather than alive.

### The visor energy needs a decision first

**The visor is baked into part 01 and cannot be animated separately.** The head part is
delivered as one image containing helmet, visor, antenna and earpiece. So the "visor energy"
an idle wants is not an attachment keyframe, and there are exactly three honest options:

1. **A tinted overlay quad** parented to `head`, additive, its alpha keyed to pulse. Cheapest,
   needs no new art, and cannot follow the visor's actual shape.
2. **Commission a separate visor attachment**, an emissive-only layer registered to the same
   380x330 canvas so it drops straight onto the head bone. Correct, and it is one more
   generated part in a style the batch already established.
3. **Leave the visor static** for the first idle and revisit. Entirely defensible for v1.

Option 2 is the right answer if the visor is meant to carry the character's life. **It is a
new art request and is not in scope for a rig built from the parts that exist.**

**UPDATE 2026-08-25 (R104): option 2 HAS BEEN DELIVERED.** The completion kit's spine-support
group contains a head with the visor REMOVED (640x640), a separate visor glow layer (640x320), an
eye sensor light layer (640x160) and a chest energy layer (640x480), all RGBA with true
transparency. **So the visor limitation recorded above is solved in art.** **And as of 2026-08-25 it is solved in
law too**: the owner's ruling permits external development-stage art in the animation pipeline, so
those layers are admissible on the same footing as the eleven body parts. **The visor question is
closed.** The runtime-true kit later supplied visor, eye and chest layers at **680x1344**, matching
the shipped hero canvas exactly, so they register without a resize.

---

## 7. Why no code landed with this

**There is no natural insertion point, and adding one would break a rule this project
already enforces.** No Spine runtime is installed, no atlas loader exists, and the robot is a
static `<img>`. A config stub or manifest entry for a character nothing reads would be dead
wiring, and `frontend/scripts/dead_wiring_scan.mjs` runs in CI precisely to catch state that
is written and never read. Adding an unread entry to satisfy a checklist is the exact pattern
that gate exists to stop.

So the honest deliverable is this specification plus the ranked brief below.

### The next brief, if the owner wants the rig

**AMENDED 2026-08-25 BY R103. Step 1 as originally written is BLOCKED, and the reason is a
system law rather than a preference.** The original step 1 read "Adopt the parts into the
repository under the design-system, with a provenance record per the Assets convention, since
they are owner-commissioned external art." R103 checked that against the law and it does not
hold. The original four-step list is superseded by section 8.

---

## 8. THE COMPLIANCE BLOCKER — **WITHDRAWN BY OWNER RULING, 2026-08-25 (R109)**

> **THIS SECTION IS SUPERSEDED. THE PARTS ARE UNBLOCKED.** The owner has withdrawn the
> animation-pipeline restriction for Future Spinner:
>
> > External development-stage artwork may be used in the Future Spinner animation pipeline,
> > including character rigging and Spine, provided final shipped assets remain
> > quality-controlled, provenance-recorded, and presentation-safe for Stake.
>
> **Route A below is now OPEN and is the recommended path.** Static-only treatment of the
> robot is no longer required. The three surviving conditions are the ruling's own:
> quality-controlled, provenance-recorded, presentation-safe.
>
> **The analysis below is kept unedited** because it is the reasoning that identified the
> blocker and got it to the owner, and because it still describes the rule other WRS titles
> operate under. Read it as history, not as instruction.

**[SUPERSEDED] The eleven external parts cannot enter the animation pipeline as the rules stand.**

`design-system/DESIGN_SYSTEM.md` SYSTEM LAWS, quoted exactly:

> **Symbols, frames and anything the animation pipeline positions or animates derive from
> vector masters in this directory and are NEVER externally designed.** No exception, and no
> measurement changes that answer (Manus retired July 2026).
> **Owner-commissioned SCENE, TILE and MARKETING art may come from outside**, because it is
> flat, terminal, and animates nothing.

`CLAUDE.md`'s Assets section states the same thing as condition 2 of three: "**It does not
enter the animation pipeline.** Symbols, frames and anything the effect system positions or
animates are still produced in-house from vector masters, full stop."

**The permission the shipped hero art relies on is justified BY the fact that it animates
nothing. Rigging it is precisely the act that destroys that justification.** So the parts move
from the permitted class into the prohibited one on the day they are rigged, and the law
forecloses the usual escape: "No exception, and no measurement changes that answer."

**A provenance record does not fix this.** Provenance is condition 3; condition 2 fails first.

### What R103 found that changes the options

**There is an in-house vector master of this robot, it is tracked, and it is dormant.**
`frontend/scripts/scene/scene_character.svg`, 340x672, named as the source of the shipped
character render by `design-system/masters/COMPLIANCE_NOTE_scene_character.md`. Two facts
about it decide what can be done with it:

1. **It is a single flat group.** One `<g id="racer">` containing about 35 unnamed paths,
   circles and rects. There are no per-body-part groups and no ids on the elements, so
   `build.py`'s existing LAYERED track, which selects by named `group_ids` and already emits
   split part pairs for the H1 rim, the gauge and the brand mark, **cannot separate it as-is.**
2. **It has been superseded and nothing renders from it.** The shipped
   `ui/scene_character.png` is 680x1344 and is the externally ENHANCED raster adopted under the
   2026-07-25 amendment. A sweep for the master's filename across the source tree returns no
   live consumer. So a rig built from it would look like the pre-enhancement flat art, not like
   the robot a player currently sees.

### The three routes, and none of them is free

| Route | Compliant today? | Matches shipped art? | Size of job |
|---|---|---|---|
| **A. Rig from the external parts** | **YES — the ruling landed 2026-08-25.** | Yes | **Small, and now UNBLOCKED. This is the path.** |
| **B. Rig from the in-house SVG master** | **Yes**, no ruling needed | **No.** Flat vector, predates the enhancement | **LARGE, and R104 corrected this.** See below |
| **C. Re-author the enhanced look as an in-house vector master, neutral pose, named groups** | Yes | Yes | Largest, and it is real vector authoring |

### R104 CORRECTION: route B is not "group the paths and export"

**R103 sized route B as medium, on the assumption that the master's 35 paths only needed
grouping. R104 rendered the master and looked at it, and that assumption was wrong.**

The in-house master is drawn in the HERO POSE, which
`design-system/masters/COMPLIANCE_NOTE_scene_character.md` already described in words:
"Posture is arms folded, weight on one leg." Rendering it confirms both:

- **The forearms are folded in an X across the chest**, overlapping each other and the torso.
- **The stance is weighted**, with the legs asymmetric and one crossing in front.

**A rig needs limbs in neutral, separable orientations.** Rotating a folded forearm about an
elbow pivot does not uncross it; it gives you crossed arms that wave. Grouping the existing
paths therefore produces a skeleton that cannot perform the idle in section 9, no matter how
carefully the pivots are placed.

**This is exactly the problem the external batch solved deliberately**, and its own record says
so: the limb parts "are rendered in neutral straight orientations rather than the crossed hero
pose so they can be rotated freely in Spine."

**So route B requires re-authoring the limbs in neutral orientation, in vector, in-house.** That
is most of the work of route C, without route C's benefit of matching the shipped art.

### What this does to the decision

**Route A is now clearly the cheapest path, and its entire cost is one owner ruling.** The
external parts are already neutral-posed, already separated, already measured, and already carry
a matching visor layer in the 2026-08-25 completion kit. Everything about them is ready except
their legal standing.

**The law has been amended twice before by owner ruling**, on 2026-07-25 for enhancement and on
2026-07-27 for commissioned scene, tile and marketing art. A third amendment covering rigged
character art would be the same shape, and it is the owner's to make or refuse.

**If the answer is no, route C is the honest one**, not route B: if the limbs must be re-authored
anyway, they should be re-authored to match the art the player actually sees rather than to match
a flat vector master that nothing renders.

**Route A is not unreasonable and the precedent exists**: the Assets law has already been
amended twice by owner ruling, on 2026-07-25 for enhancement and on 2026-07-27 for commissioned
scene, tile and marketing art. A third amendment covering rigged character art would be the
same shape. **But it is an owner ruling, and no builder may assume it.**

**Route B is the only one a builder can start unblocked**, and it has a hidden virtue: it needs
no new pipeline. Grouping the master's paths and adding a `layered` block reuses machinery this
project already ships and already trusts.

**This is the decision that gates every other Spine task.** Nothing below can start until it is
made.

## 9. First motion, once a route is chosen

**The smallest useful outcome, deliberately smaller than it is tempting to make it.**

1. **Idle breathe only.** `hip` translate Y 6 to 10 px over a 3 to 4 second loop, with `torso`
   scale Y 1.00 to 1.015 in phase. Nothing else moves. Ship this alone and look at it.
2. **Then head settle.** `head` rotate 1.5 to 2.5 degrees, LAGGING the torso by 4 to 6 frames.
   The lag is what makes it read as weight rather than as a rigid pivot.
3. **Then arm sway**, 1 to 2 degrees on the upper arms opposing the bob, 0.5 to 1 degree on the
   forearms lagging behind. Offset left and right by about a fifth of the loop; perfect
   bilateral symmetry is the strongest tell that something is rigged rather than alive.
4. **Visor energy is LAST and only if the art supports it.** Section 6 records why: the visor is
   baked into the head part, so this needs either a tinted overlay quad or a commissioned
   emissive layer.
5. **No celebration choreography.** No win poses, no feature entry, no reactions. Those need a
   state machine the game does not have, which is the same gap recorded against the title states
   and character poses.

**Sequencing rules for whoever executes this:**

- **Feature-flag it and keep the static image as the fallback.** The robot renders today from
  one `<img>`; that path must keep working untouched while the rig is behind a flag.
- **Reduced motion must stop the idle**, not slow it. The project already pins
  `prefers-reduced-motion` behaviour elsewhere and this must join it.
- **Legs stay planted for all of the above.** Feet do not move in an idle, and a shifting
  contact point is the fastest way to make a standing figure look like it is floating.
- The two hero ground shadows in the 2026-08-25 FX set would make the contact read properly and
  are a separate, smaller job that does not need the rig at all.

---

## 10. THE PATH AFTER THE 2026-08-25 RULING (R109)

> **CORRECTED BY R110, 2026-08-25.** This section was written believing that v2's three
> 680x1344 layers register to the shipped hero. **They do not.** R110 measured them against
> `ui/scene_character.png` and all three land on the wrong body part: the visor on the chest and
> folded arms, the eye on the arms, the chest on the pelvis, each displaced downward by a
> consistent 13 to 16 percentage points of canvas height. The visor layer is **488 px wide
> against a head that is 297 px at its widest**. The original claim rested on canvas dimensions
> matching and 88 to 94 per cent of pixels falling on the silhouette; both are true and neither
> is registration. **Section 10b's overlay route is therefore blocked on new art, not ready to
> build.** The superseded text is kept below so the reasoning stays legible. Full evidence:
> `reports/archive/2026-08-25_r110-painted-visor.md`.


**The law no longer blocks anything here.** What remains is ordinary sequencing, and there are
two targets of very different size. **Do the small one first.**

### 10a. What the package actually contains, measured

| Group | Canvas | Registers to | Usable for |
|---|---|---|---|
| **11 body parts** | 190x270 to 480x340 | each other, pivots verified | **the Spine rig** |
| **emissive family v1**, visor-off head, visor glow, eye, chest | 640x640, 640x320, 640x160, 640x480 | **each other** (subjects 583-596 wide) | a rig built on the v1 head |
| **emissive family v2**, visor, eye, chest | **680x1344 each** | ~~the SHIPPED hero exactly~~ **canvas only; content is displaced 13-16% downward (R110)** | **nothing yet: needs redrawing to the spec in 10c** |
| contact shadows | 680x240, 2840x300 | the hero widths exactly | grounding, blocked separately |

**THE ONE GENUINELY MISSING PIECE.** There is no visor emissive registered to the RIG's head
part canvas of 380x330. v1's visor-off head is 640x640 and its subject aspect is 1.140 against
the rig head's 1.175, so **it is a different render, not the same head at another size**. A rig
using v1's head must take the whole v1 family and be checked for style consistency against the
other ten parts; a rig using part 01 has no separable visor.

### 10b. FIRST NON-STATIC TARGET: the visor overlay, and it needs no Spine at all

**The game already animates the visor.** `SceneGroup.svelte` carries
`<div class="visor-glint">`, a CSS radial-gradient positioned at `left:32%; top:17%; width:20%;
height:12%` with a keyframed opacity flash, `mix-blend-mode: screen`, and a
`prefers-reduced-motion` path that sets it to `opacity: 0`.

**v2's visor layer shares the hero's 680x1344 canvas but is NOT registered to it (R110).** The
route below stays here because it is the right shape once a correctly registered layer exists. Swapping the gradient for it is:

- one element, `.visor-glint`, changing from a positioned gradient to a full-canvas layer at
  `inset: 0` carrying the raster;
- the SAME keyframes, so the flash rhythm is unchanged;
- the SAME reduced-motion rule, which must be kept.

**Why this is the right first step (once the art exists):** ~~the art exists, it registers exactly~~, no runtime is added,
the animation and its accessibility behaviour already exist, and it upgrades a white blob
gradient to real painted art. The same argument applies to the eye and chest layers.

**Why R109 did NOT implement it:** it is a player-visible change to the hero's appearance, and
`mix-blend-mode: screen` over a full-canvas painted raster behaves differently from a small
gradient in ways that need looking at on the running game. It also pairs a new raster with a CSS
reference, so both must land together or neither, exactly as the banner did. **That is a short,
well-defined implementation brief, not a blind edit.**

### 10c. SECOND TARGET: the Spine rig

Sections 3, 4 and 9 already carry the naming convention, the full pivot and socket table, the
import procedure, the draw order and the first-idle specification. What R109 adds is the
**runtime insertion point**, which was previously unanswerable:

**Insert at `SceneGroup.svelte`'s `.char-layer`.** It is a positioned wrapper at
`left:22px; bottom:18px; width:206px; height:407px` carrying `animation: char-idle 5s`. The
rigged character replaces `<img class="char-img">` inside it. Two things must be preserved:

1. **Keep the static `<img>` as the fallback**, behind a feature flag, so the current display
   cannot break. This is the whole reason the insertion point is a wrapper rather than the image.
2. **Decide what happens to `char-idle`.** The wrapper currently supplies the bob and breathe in
   CSS. A rigged idle would do the same job in the skeleton, so running both would double it.
   Either the CSS animation is disabled when the rig is active, or the rig ships without its own
   bob. **This is the same class of question as the contact shadow's shared `drop-shadow`, and it
   should be decided rather than discovered.**

**What still needs tooling, and it is not small:** a Spine runtime dependency, an atlas loader, a
render target inside a Svelte component, and a `prefers-reduced-motion` path that stops the idle
rather than slowing it. That is a dependency decision, and it is the reason 10b comes first.

### 10d. Recommended order

1. **Visor, eye and chest overlays on the static hero.** No new dependency. Art registers exactly.
2. **Contact shadows**, once the shared `drop-shadow` question is answered.
3. **The Spine rig**, with the `char-idle` question decided up front and the static image kept as
   the flagged fallback.

---

## 10c. THE MEASURED SPEC FOR A USABLE VISOR EMISSIVE (R110)

Measured off the shipped sprite rather than described, so a new layer can be drawn to fit on the
first attempt.

| Property | Value |
|---|---|
| Canvas | **680 x 1344**, transparent, registered to `ui/scene_character.png` at the origin |
| Head extent | y 40..300; the neck pinch is at y 300 where the silhouette narrows to 111 px |
| Head maximum width | **297 px**, at y 200..240 |
| Visor lens | bbox **x 185..568, y 37..319**, centroid **(369, 214)** |
| Where emissive mass should peak | **y 201..268** |
| Colour | the hero's own cyan to magenta gradient, left to right across the lens |
| Format | premultiplied straight-alpha PNG, safe under screen or additive blending |

**Anything approaching 488 px wide is wider than the head and will read as a lozenge over the
face.** That is precisely how the current v2 layer fails.

### The runtime insertion point is unchanged

`.visor-glint` in `frontend/src/lib/components/SceneGroup.svelte`. The element already carries the
keyframes, the 6s period, `mix-blend-mode: screen`, and the `prefers-reduced-motion` rule that
sets it to `opacity: 0`. A correctly registered raster becomes a full-canvas layer at `inset: 0`
on that same element, keeping all four.

### What R110 changed in the meantime

The gradient's `top` moved from `17%` to `11%`. At 17 per cent it centred on image y309, the neck
pinch, putting **5.7 per cent** of its light on the lens and wasting **32.4 per cent** off the
sprite entirely. At 11 per cent it centres on y228, mid-lens: **56.4 per cent on lens, 3.6 per
cent wasted**. The mapping is 1:1 at scale 3.302 because `.char-img` is `object-fit:contain` and
the box aspect 206/407 matches the source 680/1344 to four decimals.

---

## 11. WHAT R111 ACTUALLY BUILT, AND WHY IT IS NOT SPINE (2026-08-25)

**The hero is articulated and non-static as of R111, and no Spine runtime was added.** This
section is the correction to the assumption running through sections 1 to 10: that making the
robot move requires a skeletal runtime. It does not, and the reasons are specific to this
codebase rather than general.

### 11a. The constraints that decided it

| Fact | Consequence |
|---|---|
| No Spine package of any kind is installed, and there are **zero `.atlas` or `.skel` files** in the repo | The Spine route starts by adding a dependency AND authoring skeleton data that does not exist |
| pixi.js 7.4.3 is imported in exactly one file, `GameGrid.svelte`, for `Application` + `Graphics` | It drives a fixed 616x412 win overlay parented inside the reel grid; it cannot share a canvas with the hero's box without a layout change |
| CSS animates this game: **95 `@keyframes` blocks** across `frontend/src` | CSS is the house idiom, not a workaround |
| A parented, transform-driven, multi-part animation with a reduced-motion contract already shipped on this exact hero | The pattern to extend already existed |

### 11b. Nested DOM elements ARE a bone hierarchy

This is the whole idea and it is worth stating plainly:

- A child element's `transform` **composes with its parent's**. Rotating `.bone-torso` carries the
  head and both arms because they are its descendants. That is what a bone chain does.
- **`transform-origin` IS the joint.** Set to the connector coordinate the part was drawn around,
  rotation happens at the elbow instead of at the corner of a rectangle.
- The browser composites transforms on the GPU, so eleven transformed layers cost about what the
  one `<img>` cost. Measured: **60fps, zero frames over 20ms**.

### 11c. The shipped structure

frontend/src/lib/components/RobotRig.svelte, mounted by `SceneGroup.svelte` inside the existing
`.char-layer`.

```
pelvis (root, static)
├── leg upper L/R ──> leg lower L/R          static, so the feet stay planted
└── torso                    breathe: +/-0.55deg about the waist, 4 source px rise, 5.2s
    ├── arm upper L/R        +/-1.3deg / +/-1.1deg about the shoulders, 5.8s / 6.3s
    │   └── arm lower L/R    +/-1.1deg / +/-1.3deg about the elbows, 6.7s / 5.5s
    └── head                 +/-0.9deg about the neck, 7.1s
```

Periods share no common factor, so the bones drift in and out of phase and the loop never resolves
into a visible pulse.

**Geometry.** Everything inside the root is positioned in the parts' own SOURCE pixels so the kit's
joint table is used unmodified. One transform on the root maps that space into the 206x407 box:
`left: 23.95px; top: 9.09px; transform: scale(0.27784)`, derived by matching the assembled
subject (569x1400 source px) to the shipped hero's subject (504x1284 source px) on height.

**Motion policy.** `.char-layer.char-rigged { animation: none }` switches the old whole-body
`char-idle` off, so exactly one idle runs.

**Fallback.** `SceneGroup` takes `rig` (default `true`). `rig={false}` renders the original flat
`<img class="char-img">` with every original rule intact.

**Overlay re-registration.** `.antenna-light` and `.visor-glint` are percentages of `.char-layer`
calibrated to the flat sprite, and the rig's head lands elsewhere. Both are re-derived under
`.char-rigged` against the rig's own head raster. The antenna one was urgent: unmoved it blinks in
empty space, because its box ends at x 49.4 and the rig's head starts at x 50.1.

### 11d. What this does NOT settle

- **The pose.** The kit's limbs are drawn straight so they can rotate, so the rig stands neutrally
  where the shipped hero stood with arms folded and legs crossed. Same character, less attitude.
  Folding is not achievable from these parts. This is an owner decision, recorded in section 0I of
  the outstanding ledger.
- **When Spine WOULD earn its place:** mesh deformation, skinning, IK, or animation authored by an
  artist in the Spine editor rather than by hand in CSS. None of those are needed for an idle. If a
  future performance set wants them, sections 1 to 10 remain the right plan and the part kit is
  already rig-ready.
- **The visor emissive** is still a CSS gradient and still blocked on art, per section 10c.

---

## 12. THE DEFAULT HERO IS NOW A STRIP, NOT THE RIG (R112, 2026-08-25)

**Section 11 described the rig as the shipped hero. It is no longer the default.** The owner's
preferred attitude is crossed arms, and section 11d already recorded that folding the arms is not
achievable from the modular parts. R112 resolved that from the art side instead.

### What changed

`SceneGroup` takes `heroMode: 'idle' | 'rig' | 'static'`, default **`'idle'`**:

- **`'idle'`** renders `HeroIdle.svelte`. **AMENDED 2026-08-27 by R130: THE IDLE NO LONGER
  ANIMATES AT ALL.** It is frame 01 of `ui/hero/hero_crossed_idle_6f.png`, held, at
  `background-position-x: 0` with no animation on either the sheet or the `.hero-body` wrapper.
  The owner's ruling was that bad motion scores worse than a still. R130 deleted the flipbook,
  the 7.2 s body sway, R129's dual-buffer dissolve and the 24 s `glance` state; the 16-frame win
  unfold and the 7-frame feature brace are untouched and still play, and are now the only
  performances this hero has. Resting micro-life comes from `SceneGroup`'s own `.antenna-light`
  and `.visor-glint`, not from this component.
  *Superseded description, kept because the surrounding sections still refer to it:* a six-frame
  flipbook, `steps(6)` over `background-position-x`, 4.4 s loop — amended 2026-08-26 by R122,
  which replaced the five-frame lighting-only strip with a six-frame planted-foot weight shift.
  The `.hero-body` transform wrapper was added in R121 and still carries the reactions; see
  `reports/archive/2026-08-26_r122-pose-strips.md`.
  **Only frame 01 of that six-frame sheet is now reachable** — see the R130 section of
  `reports/SESSION_REPORT.md` for the byte cost, which is unresolved and the owner's call.
- **`'rig'`** is section 11's bone hierarchy, unchanged and still supported.
- **`'static'`** is the original flat sprite.

### Why the strip beats the rig for THIS character

| | R111 rig | R112 flipbook |
|---|---|---|
| Pose | neutral, arms at sides | **crossed arms, the shipped attitude** |
| Motion between extremes | 17.96% of the box | **21-30% between adjacent frames** |
| Motion below the waist | **zero** | present, relighting |
| Joint separation risk | real, mitigated by tuning | **cannot occur, each frame is one render** |
| Bytes | 1.1 MB of parts | 3.4 MB sheet |

**The mechanism, and it is the general lesson:** the head travels only 3.8 source px between
frames, yet a third of the figure changes, because the frames are **re-rendered rather than
transformed**. A transform can move a sprite; only a re-render can relight it. For a character
whose material read is chrome and carbon under a fixed key light, the relighting IS the animation.

### When the rig is still the right answer

Section 11c's hierarchy remains the correct foundation for anything a fixed strip cannot do:
reacting to arbitrary game state, aiming at a moving target, blending two motions, or any motion
whose timing is not known in advance. A strip is a recording; a rig is an instrument. This hero
needs a recording.

### The blocking art spec, if the hero should react

The package's win-reaction strip is unusable: it is a third figure (silhouette IoU 0.5097 against
the shipped hero). A usable one must be **family A**, meaning drawn from the crossed-arms hero with
crossed legs, on a **680x1344** canvas with its ground line at **y 1322**, 5 to 8 frames, starting
and ending on frame 01 of the existing idle so it can be entered and left without a cut.

