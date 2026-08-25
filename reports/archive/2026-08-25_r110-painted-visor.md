# R110: no painted visor asset registers to the shipped hero, and the incumbent glint was lighting the neck

Date: 2026-08-25. Branch: `claude/r110-painted-visor`. Review lane, unattended.

## The shortest true summary

**The asked-for replacement was refused.** None of the three painted emissive layers register to
the shipped hero. They are not offset, they are drawn for a different figure, and the visor layer
is 1.64 times wider than the robot's entire head.

**A real defect was found and fixed instead.** The incumbent CSS glint was landing on the neck
rings and chin, not on the visor. Only 5.7 per cent of its light fell on the lens and 32.4 per
cent missed the character altogether. One CSS value moved it to 56.4 per cent on the lens.

**One raster was staged: none.** The only file changed in the frontend is
`frontend/src/lib/components/SceneGroup.svelte`, and the change is a single declaration.

---

## TASK 1: source validation. REFUSED, with measurements

### The shipped hero, measured first

`frontend/public/assets/themes/future-spinner/ui/scene_character.png`, 680 x 1344.

| Feature | Measurement |
|---|---|
| Head | y 40..300, neck pinch at y 300 where the silhouette narrows to 111 px |
| Head maximum width | 297 px, at y 200..240 |
| Visor lens (saturated and bright, head only) | bbox x 185..568, y 37..319; centroid (369, 214) |
| Emissive mass peak | y 201..268, 13,075 px, the largest band on the whole sprite |

### Candidate 1: `40-visor-only-glow-layer-680x1344.png`

In `.scratch/art-review/chatgpt-runtime-true-kit/character-support/` (gitignored).

The canvas is 680 x 1344 and matches the hero exactly. **That is the only thing about it that
matches.**

| Property | Layer | Hero visor | Verdict |
|---|---|---|---|
| Content bbox | x 95..582, y 358..528 | lens at y 37..319 | 
| Alpha-weighted centroid | y 446, 33.2% of canvas | emissive peak 15..20% | 16 points too low |
| Width | 488 px | head is 297 px at its widest | **1.64x wider than the entire head** |
| Height ratio vs hero visor | 0.47x | | wrong proportion |
| Pixels landing on the silhouette | 93.9% | | lands on the **chest and folded arms** |

**A translate does not rescue it.** I composited it shifted up by 211 px (the measured centroid
offset) and by 240 px. In both cases the layer becomes a giant lozenge that swallows the head
entirely and hides the real visor. Evidence rendered to scratch as `visor_shift.png`.

### Candidate 2: `19-robot-visor-glow-layer.png`

In `.scratch/art-review/chatgpt-outstanding-completion-kit/spine-support/`, 640 x 320.

It floats **above** the head dome of the 640-family robot, with only 44.3 per cent of its pixels
on the body. It was authored against `18-robot-head-visor-off.png` (640 x 640), which is a
different render from the shipped hero: subject aspect 1.140 against the rig head's 1.175.

### Conclusion

Neither candidate is a visor for this robot. Forcing either one would put a glowing lens on the
chest or hovering above the head. The brief's own instruction applies: adjust minimally or leave
a precise residual rather than forcing a bad look.

---

## A CORRECTION TO WHAT I WROTE IN R109

R109 stated that the three 680 x 1344 layers "register to the shipped hero canvas exactly."

**That was wrong, and the way it was wrong is worth recording.** I verified two things: that the
canvas dimensions matched, and that 88 to 94 per cent of each layer's pixels landed on the robot
silhouette. Both were true. Neither answers the question. **A layer can be 93.9 per cent
"on-body" and be entirely on the wrong body part**, which is exactly what this one is.

Canvas match is not registration. Percentage-on-silhouette is not registration. The instrument
that answers the question is *which feature does the light land on*, and it took a per-feature
mask to see it. This is the same wrong-instrument failure that R104 hit with occluded plates and
R108 hit with peak-over-opaque, and it reached a document this time.

The R109 text is not deleted. This report is the correction beside it, per convention (s).

---

## TASK 4: the eye and chest layers, also refused

Same kit, same canvas, same fault.

| Layer | Centroid | Should sit on | Actually lands on |
|---|---|---|---|
| `41-eye-light-layer-680x1344.png` | y 404, 30.1% | head sensor, ~17% | thin lines across the **folded arms** |
| `42-chest-energy-layer-680x1344.png` | y 700, 52.1% | chest vents, ~38% | a glowing panel on the **pelvis** |

**All three layers are displaced downward by a consistent 13 to 16 percentage points of canvas
height, roughly 180 to 216 px.** The consistency is the tell: they are internally coherent with
each other and with some reference figure that is framed differently from the shipped hero. They
are not damaged, they are drawn for a different body.

Per the brief, I stopped after the visor and did not expand into contact-shadow policy or rig
work.

---

## TASKS 2 and 3: what was actually implemented

With the replacement refused, I measured the incumbent to state honestly what it does, and found
a defect.

### The mapping, derived before measuring

`.char-layer` is 206 x 407 CSS px. `.char-img` is `width:100%; height:100%; object-fit:contain`.
Box aspect 206/407 = 0.50614; source aspect 680/1344 = 0.50595. They agree to four decimals, so
the image fills the box with no letterboxing and **layer percentages map 1:1 onto sprite pixels
at scale 3.302**.

### What the incumbent was doing

`.visor-glint` at `left:32%; top:17%; width:20%; height:12%` occupies image px x 218..354,
y 228..390, centred at **(286, 309)**. y 309 is the neck pinch. The gradient was centred on the
robot's neck.

Energy landing where it matters, integrating the gradient's alpha against a per-feature mask:

| `top` | Gradient centre | Energy on the visor lens | Energy wasted off the sprite |
|---|---|---|---|
| **17% (incumbent)** | y 309 | **5.7%** | **32.4%** |
| 15% | y 282 | 20.8% | 28.7% |
| 13% | y 255 | 43.5% | 15.1% |
| 12% | y 241 | 52.5% | 8.4% |
| **11% (adopted)** | y 228 | **56.4%** | **3.6%** |
| 9% | y 201 | 46.9% | 0.2% |

### The change

One declaration in `frontend/src/lib/components/SceneGroup.svelte`: `top: 17%` becomes
`top: 11%`, with a comment recording the derivation.

Everything the brief asked to preserve is preserved, and preserved by construction rather than by
inspection:

- **Timing and keyframes**: untouched. Same `@keyframes visor-glint`, same 6s period, same
  `0%,92%,100% / 94% / 96%` stops.
- **Reduced motion**: untouched. The reduced-motion block sets `.visor-glint { opacity: 0 }`, so
  the element renders nothing there and the change is a no-op by definition.
- **Layout stability**: untouched. The element is `position:absolute` inside an existing box, so
  moving `top` cannot reflow anything.
- **The static hero body**: untouched. No raster was read, written, staged or replaced.

### An instrument correction inside this session

Three measurements disagreed and it is worth saying which one was right.

Judging the side-by-side composites **by eye**, 13% looked best and 11% looked like it rode up
onto the metal dome. The **energy metric** said 11%. I resolved it by rendering a heatmap of the
luminance actually added, and **the metric was right**: at 11% the lens ellipse lights up; at 17%
the concentric neck rings light up, which is unmistakable once plotted.

My eye was fooled because screening white onto an already bright cyan lens produces a small
apparent change, while washing a dark neck looks dramatic. **The composite rewarded the wrong
answer.** Rendering the delta rather than the result is what settled it.

---

## TASK 5: state of the work

**Files changed: two frontend-relevant, the rest records.**

| File | Nature |
|---|---|
| `frontend/src/lib/components/SceneGroup.svelte` | one declaration plus comment, commit-ready |
| `reports/briefs/FS_FABLE_R110_PAINTED_VISOR_Prompt.md` | brief saved verbatim, convention (f) |
| `reports/SESSION_REPORT.md`, `reports/archive/2026-08-25_r110-painted-visor.md` | this report |
| `reports/FABLE_COMMS.md` | entry 108 |
| `reports/OUTSTANDING_LEDGER_2026-08-25.md` | section 0H |
| `docs/design/SPINE_ROBOT_RIG_SETUP.md` | the measured art specification |

**Rasters staged: zero.** The 30 dirty working-tree placeholder rasters are untouched and their
count is unchanged from the session baseline.

**Gates, all run locally:** build PASS, `locked_paths_gate` PASS, `doc_currency_gate` PASS,
`asset_guard.py --self-test` PASS, `asset_reference_gate` PASS, `build_diet_verify` PASS. The
built CSS was checked directly and carries `top:11%` with keyframes and the reduced-motion rule
unchanged.

### Residual risks

1. **The glint is still a CSS gradient, not painted art.** The brief's actual goal is not met.
   It is deferred for want of a usable asset, not abandoned.
2. **The horizontal position was deliberately not changed.** The glint centre is at 42 per cent
   against a lens centroid of 54.3 per cent. A specular highlight belongs off-centre and near the
   visor's own painted streak, so I judged this an art choice rather than a defect and left it.
   If the owner wants it centred, that is `left: 32%` to `left: 44%`, one value.
3. **Revert is one value.** `top: 11%` back to `top: 17%` restores the previous behaviour exactly.

### The art specification that would work

For whoever draws the replacement, measured from the shipped sprite rather than described:

- Canvas **680 x 1344**, transparent, registered to
  `ui/scene_character.png` so it composites at the origin with no offset.
- The lens occupies **x 185..568, y 37..319**, centroid **(369, 214)**. Emissive mass should peak
  in the band **y 201..268**.
- Maximum sensible width is **297 px** at the head's widest, at y 200..240. Anything approaching
  488 px is wider than the head.
- Follow the hero's own cyan to magenta gradient across the lens, left to right.
- Deliver as a premultiplied straight-alpha PNG, additive or screen safe.

### Recommended next session

1. **Commission or redraw the visor emissive to the specification above.** It is the only thing
   blocking the brief's stated goal, and the spec is now exact.
2. **The contact-shadow decision**, still open, still blocked by the shared
   `.car-img, .char-img` drop-shadow rule.
3. **Coordinated idle policy** before any Spine work, so the CSS idle and a future rig idle do
   not fight.
4. **The first Spine idle rig**, once 1 and 3 are settled.
