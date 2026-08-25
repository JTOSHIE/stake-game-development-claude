# R112: the pose you wanted was already yours, and the strip brings it to life

Date: 2026-08-25. Branch: `claude/r112-crossed-arms-hero`. Review lane, unattended.

Brief saved verbatim: `reports/briefs/FS_FABLE_R112_CROSSED_ARMS_HERO_Prompt.md`. Branch:
`claude/r112-crossed-arms-hero`, review lane. **The default hero is the crossed-arms pilot again,
now breathing.** Route A, one 5-frame sheet, one new component.

## The shortest true summary

**The crossed-arms attitude is back as the default, and it is animated.** Not a still.

**The single most important finding: the package's "signature crossed-arms master" IS the sprite
the game already shipped.** Silhouette IoU **0.9995**, mean RGB difference **0.90**. The pose the
owner asked to get back was never lost; R111 replaced it with a neutral rig because the eleven
modular parts could not fold their arms. So the value in this package is not the master. It is the
**idle strip**, which is that same hero re-rendered five times.

**Only one of the six strips was usable, and that is a measurement, not an opinion.**

---

## WORKSTREAM 1: package audit

107 files. 87 runtime PNGs, 11 QA sheets, 7 provenance sources, 2 documents. Everything measured
first-hand.

### The decisive discovery: this package contains TWO DIFFERENT FIGURES

Sorting every full-body asset by its ground line separates the package cleanly in two:

| Family | Ground line | Contents |
|---|---|---|
| **A, the shipped hero** | y **1321-1322** | crossed-arms master, 13 coverage poses, strip 01 (crossed idle), strip 06 (win) |
| **B, the modular build** | y **1299** | assembled neutral reference, head-tilt poses, strips 02, 03, 04, 05 |

**23 pixels apart, and a different body.** Family B is the neutral, arms-at-sides figure with
straight parallel legs. Family A has crossed arms AND crossed legs. The assembly guide's own
recommendation mixes them freely, naming strip 01 as the primary idle and strips 02 and 05 as
secondary and accent, so **following the guide would make the character jump 23px and change
stance mid-animation.**

### Strip identity, measured against the shipped hero

| Strip | Subject aspect | Silhouette IoU vs shipped hero | Verdict |
|---|---:|---:|---|
| **01-crossed-arms-idle** | 0.3904 | **0.9997** | **USE. It is the shipped hero.** |
| 03-arms-uncross-transition | 0.4017 | 0.7453 | refuse, family B |
| 02-weight-shift-idle | 0.4183 | 0.6812 | refuse, family B |
| 04-arms-recross-transition | 0.4183 | 0.6812 | refuse, family B |
| 05-head-glance | 0.4183 | 0.6812 | refuse, family B |
| **06-win-reaction** | 0.4468 | **0.5097** | **refuse, a third figure entirely** |

The shipped hero's own aspect is 0.3906. **Strip 01 matches it to four decimals; nothing else is
close.** The win-reaction strip is neither family: slimmer limbs, longer legs, smaller head.

### Frame consistency inside strip 01

| Property | Result |
|---|---|
| Frames | 6 supplied, **frame 06 byte-identical to frame 01** (exact pixel comparison) |
| Ground line drift | **0 px across all frames** |
| Lateral subject drift | +/-2 source px (+/-0.6 layer px), a deliberate sway |
| Max adjacent-frame head travel | **3.8 source px = 1.1 layer px** |
| Pixels changing between adjacent frames | 31 to 42 per cent |

**That last pair of rows is the whole reason this route works.** The head barely moves, yet a third
of the figure changes between frames, because the frames are **re-rendered rather than
transformed**: chest, shoulder, visor and boot highlights all relight. A transform can move a
sprite. Only a re-render can relight it, and relighting is what the eye reads as a body.

### Hand uniqueness, and a claim I had to re-test

The guide asserts the hands are not mirrored clones, and offers as proof that their SHA-256 hashes
differ and they are not byte-identical. **That evidence does not support that claim**: a mirrored
image has a completely different hash. The right instrument is to flip one and compare.

| Comparison | Mean RGB difference | Silhouette IoU |
|---|---:|---:|
| left vs right, as delivered | 51.19 | 0.847 |
| left vs right, **mirrored** | 62.15 | **0.752** |

**The mirrored form is LESS similar than the unmirrored one.** The hands are genuinely distinct.
The conclusion was right; the stated reason for it was not.

### Support layers

The four energy layers register correctly to the crossed master, verified by compositing rather
than by trusting the label: visor energy lands on the visor, eye light inside it, chest energy on
the waist cells. `05-soft-contact-shadow` (594 px wide) and `06-ground-reflection-plate` are
correctly proportioned against the master's 502 px figure. **None shipped this session**, see
scope below.

---

## WORKSTREAM 2: route chosen, and why

**ROUTE A, pose/strip driven.**

Route B (layered crossed-arms hierarchy) is the theoretically attractive one and it is not
available. Its premise is that a locked crossed-arms torso unit can be combined with animated head,
pelvis and legs. But the locked torso unit belongs to family A, whose legs are **crossed**, while
the animatable modular legs belong to family B, whose legs are **parallel**. Attaching family B
legs under a family A torso changes the stance and reintroduces the exact neutral look the owner
rejected. Route C inherits the same problem the moment it plays any strip but 01.

**Route A wins on the evidence, and it also wins on risk.** Because each frame is a complete
render, the failure modes workstream 5 exists to catch, joint separation, shoulder and pelvis
gaps, hand duplication, clipping, **cannot occur on this route at all**. There are no joins to
separate.

---

## WORKSTREAM 3 and 4: what shipped

`frontend/src/lib/components/HeroIdle.svelte`. A five-frame flipbook over one horizontally packed
sheet, using the same construction as the game's existing `FlameJets.svelte`:
`background-position-x` stepped with `steps(5)`.

- **Sheet:** `ui/hero/hero_crossed_idle_5f.png`, 3400x1344, packed from frames 01..05.
- **Frame 06 was dropped deliberately.** It is byte-identical to frame 01, a closing frame for a
  linear player and a duplicate for a looping one. Including it would freeze the loop for one extra
  step every cycle.
- **Timing:** 4.4 s over five frames, 0.88 s a frame. The cuts are invisible because nothing moves
  more than 1.1 layer px between frames.
- **Verified in the browser**, the animation lands on exactly `0, -206, -412, -618, -824 px`:
  frames 01 to 05, never the wrapped end value.

`SceneGroup` now takes `heroMode: 'idle' | 'rig' | 'static'`, default `'idle'`, replacing R111's
boolean. All three keep the same 206x407 box, so switching cannot move the scene.

### Motion refused, in the brief's own priority order

| Priority | Asset | Decision |
|---|---|---|
| 1. crossed-arms idle life | strip 01 | **SHIPPED** |
| 2. head glance / attention | strip 05 | **refused**, family B: arms at sides, ground 23px off |
| 3. weight shift | strip 02 | **refused**, family B |
| 4. arm transition | strips 03, 04 | **refused**, family B; the uncross ends in the rejected neutral stance |
| 5. win acknowledgement | strip 06 | **refused**, a third figure, IoU 0.5097 |

The brief says not to force bad transitions and to skip weak strips rather than ship broken
movement. **Four of the five were skipped for the same reason: they are not this robot.**

---

## WORKSTREAM 5: hand, joint and registration QA

Verified in a live browser at 3x device scale.

| Check | Result |
|---|---|
| Crossed arms read clearly | **Yes**, unambiguous at game size and at 6x |
| Hands a true left/right pair | Verified by mirror test on the part files; in the crossed pose one hand is visible with correctly articulated fingers and the other is hidden by the fold, as the guide documents |
| Hand duplication artifacts | **None** |
| Head/torso join | **Not applicable**: each frame is one render |
| Pelvis/shoulder separation | **Not applicable**, same reason |
| Clipping | none observed |
| Grounding | ground line identical in all five frames; lateral sway 0.6 layer px |

### A defect fixed, that predates both R111 and R112

`.antenna-light` had **zero overlap with the orb it is named for**. Its box was centred at layer
(37.1, 97.7); the orange earpiece orb sits at **(65.3, 71.9)**, measured on the shipped sprite and
confirmed across all five strip frames where it drifts about 1 px. The light was glowing on bare
head shell 28 px to its left.

R111 found this from the other direction and scoped its fix to the rig, because the flat sprite was
then only a fallback. **The flipbook and the flat sprite are the same image**, so this session
corrects the base rule once and both paths are right; the rig keeps its own override because its
head sits higher. Confirmed in the browser at **(65.3, 71.9)**, exactly on target.

`.visor-glint` needed **no** change: re-running R110's own energy-on-lens sweep against the strip's
frames puts the optimum back at `top: 11%` with 56.5 per cent of the gradient on the lens, which is
precisely what R110 shipped. Independent corroboration that the strip is the shipped hero.

---

## WORKSTREAM 6: reduced motion and performance

| Check | Result |
|---|---|
| Frame rate | **60.0 fps**, mean 16.67 ms, p95 16.8 ms, worst 18.6 ms, **zero frames over 20 ms** |
| Console errors | **none** |
| Failed requests | **none** |
| Reduced motion (emulated) | **0 animations, frozen at frame 01** |
| Base game / during spin / after spin | animating throughout, confirmed by the position advancing |
| Portrait | scene unmounts (pre-existing, landscape-only); returns clean |
| dist | **18.33 MB against a 25 MB budget** |

**Reduced motion freezes to frame 01, which IS the shipped hero pose** rather than an arbitrary
stopped frame, so the accessible presentation is the game's own established still.

---

## WORKSTREAM 7: review impact

**Yes, materially, and for a specific reason.** The previous rig moved 17.96 per cent of the hero
box between its extremes with **zero motion below the waist**, because a bone hierarchy can only
rotate the parts it owns. The flipbook changes **21 to 30 per cent between adjacent frames, across
the entire figure including the legs and boots**, because every frame is separately lit. A heatmap
of the difference shows the whole body glowing, where the rig's showed a lit torso above dark legs.

**What a reviewer sees in 5 to 10 seconds:** a crossed-arms pilot leaning on his car whose chest
rises and settles, whose head drifts, and whose chrome and carbon surfaces catch the light
differently as he breathes, on a 4.4 s loop, plus the antenna blink and the visor glint sweep that
are now correctly placed on the parts they are named for.

**Still missing on the hero alone:** any reaction. He breathes identically through a dead spin and
a big win. A win acknowledgement is the single biggest remaining gap, and **the package's win strip
cannot supply it** because it is a different figure.

---

## WORKSTREAM 8: files, and the exact next step

| File | Nature |
|---|---|
| `frontend/src/lib/components/HeroIdle.svelte` | new, the flipbook |
| `frontend/src/lib/components/SceneGroup.svelte` | `heroMode` prop, motion policy, corrected `.antenna-light` |
| `frontend/public/assets/themes/future-spinner/ui/hero/hero_crossed_idle_5f.png` | new, 3400x1344 |
| `docs/art/hero_crossed_idle.provenance.json` | provenance and derivation |

**One raster added; the 30 working-tree placeholders were not swept in.** R111's eleven parts stay
committed because `'rig'` remains a supported mode.

### The exact next art step, if the owner wants a reacting hero

**A win-reaction strip drawn as family A**, that is, from the crossed-arms hero with crossed legs,
starting and ending on frame 01 of the existing idle so it can be entered and exited without a cut.
Same 680x1344 canvas, same ground line **y 1322**, 5 to 8 frames. The current
`06-win-reaction` cannot be retimed or recoloured into this; it is a different body.

The same specification applies to a head-glance accent: family A, ground y 1322, returning to
frame 01.

---

## Tensions surfaced rather than decided

**1. The package oversells itself.** Its QA section states "Energy layers visually align to the
signature crossed-arms master" (true, verified) alongside a hand-uniqueness proof that does not
prove what it claims, and an animation guide that recommends mixing two figures. **The art is
better than its documentation.**

**2. Three hero modes now ship their assets**, costing about 5.3 MB of bundle between the sheet,
R111's eleven parts and the flat sprite. dist is 18.33 MB of 25 MB, so it fits, but if the owner is
confident the neutral rig will never be wanted, deleting `'rig'` returns 1.1 MB.

**3. The contact shadow and ground reflection layers were not shipped.** They register correctly
and would improve grounding, but the hero already carries a drop-shadow filter and adding a painted
contact shadow is a scene-composition change rather than hero animation. Available and measured
when wanted.

**4. Still true from R111, untouched:** the cohesion rim-light and scene-grading filter on
`.char-img` and `.car-img` is dead in the shipped bundle, overridden by a later equal-specificity
rule.
