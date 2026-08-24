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
transparency. **So the visor limitation recorded above is solved in art.** It is not solved in
law: those four layers are externally designed and would enter the animation pipeline, so they sit
behind the same ruling as the eleven body parts. If the owner amends the law, the visor question
closes with it at no extra cost.

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

## 8. THE COMPLIANCE BLOCKER, found 2026-08-25

**The eleven external parts cannot enter the animation pipeline as the rules stand.**

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
| **A. Rig from the external parts** | **No.** Needs an owner amendment to the system law | Yes | **Small.** The parts are already neutral-posed and rig-ready; the whole cost is one ruling |
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
