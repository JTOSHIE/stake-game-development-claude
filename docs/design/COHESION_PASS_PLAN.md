# Cohesion pass: plan

TR-027. Written 2026-07-25 at the end of the anticipation session, so the next session can
start without re-deriving anything.

## The ruling this serves

Fable, as art director, 2026-07-28: review 1 and review 3 saw the same proofs and disagreed
because they applied different bars. For a three-star target **review 1's bar governs**, and
the answer is a **targeted cohesion pass, not a rebuild**:

- (a) integrate the character layer into the backdrop with atmosphere, depth haze and
  scene-matched grading so the flat art sits IN the scene, extending the existing rim-light
  work;
- (b) **one** global grade unifying backdrop, frame, symbols and celebrations to a single
  palette temperature;
- (c) the animation half is already answered by `feature/scatter-anticipation`, now merged
  and signed off.

## Build it as variants, not as a decision

The owner's instruction was "let's just see what it looks like, we can play around with
it". Both (a) and (b) are eye-calls, and an eye-call that has to be re-rolled through a
rebuild each time wastes the reviewer's attention on waiting rather than on judging.

**So the pass ships tunable first and fixed second.** Same shape as
`?anticipationDemo=`, which worked well for exactly this reason:

    ?grade=neutral|warm|cool|deep      global palette temperature
    ?haze=0|1|2|3                      how hard the character sits back into the scene

Both DEV-gated and read once at boot. Implemented as CSS custom properties on a single
root element so a variant is one property change, not a re-render:

    --grade-temp, --grade-strength, --haze-opacity, --haze-blur, --rim-strength

Once the owner picks, the chosen values become the defaults and the parameters stay as
dev-only comparison tools. **Do not delete them after picking**: the next art question will
want the same harness, and the parameters cost nothing in production because the whole
block is `import.meta.env.DEV` gated.

## Where the work goes

| Layer | File | What changes |
|---|---|---|
| Character and car | `SceneGroup.svelte` | depth haze behind each sprite, scene-matched grading over the flat art, the existing flat `drop-shadow` extended into a proper rim light |
| Backdrop | `App.svelte` `.bg-still` | receives the global grade |
| Frame | `App.svelte` `.game-frame` | receives the global grade |
| Symbols | `GameGrid.svelte` `.tile-inner` | receives the global grade, and must NOT fight the anticipation filters already on that element |
| Celebrations | `FreeSpinsPresentation`, `MaxWinCelebration` | receive the global grade |

**The one real collision risk:** `.tile-inner` already carries
`filter: brightness() saturate() drop-shadow()` during anticipation, and the escalation
ramp drives it. A global grade applied to the same element as a second `filter` will
multiply, not blend, and will look wrong exactly during the sequence that was just signed
off. Apply the grade at a wrapping layer, or compose it into the same filter chain
deliberately. Check the anticipation captures before and after.

## Constraints carried in

- **Reduced motion is unaffected.** Grading and haze are static state, not movement, so
  they apply identically under `prefers-reduced-motion`. Do not gate them behind it.
- **Before and after pairs per profile**, as the brief requires. Desktop and portrait at
  minimum, since portrait excludes the scene group entirely and so exercises only the
  global grade.
- **The frame gate still applies.** A full-surface filter is not free. Prefer a single
  graded layer over per-element filters, and re-measure with the ratio method in
  `reports/qa/anticipation_performance_2026-07-25.md`, since this machine cannot judge the
  absolute threshold.
- **Do not lose the hero read.** The character was deliberately pulled out of hiding and
  left-justified so he reads as a presented feature. Haze him too hard and that staging
  decision is undone. This is the specific thing to watch when comparing `?haze=` values.

## Two calls only the owner can make

1. **How warm or cool the global grade sits.** The backdrop is already magenta-shifting on
   Overdrive and the flames carry three colourways, so the grade has to leave room for
   those without fighting them.
2. **How strongly the character hazes into the scene**, against the hero read above.

## Open, related

- **TR-028**: several proof captures begin in dialogs or artificial test states, which is
  weak experience evidence. The before and after pairs from this pass are the natural
  opportunity to regenerate a clean set. Cheap, and it was review 1's actual complaint.

---

# Addendum, 2026-07-25: the grade landed, the haze did not, and why

## What the first pass established

**The global grade works** and is merged. At `?grade=deep` the image reads as one
photograph rather than several assets. The HUD is untinted, confirming the overlay sits at
the right depth (z40, above art, below HUD at z50).

**The haze does not, and tuning it further is not the answer.** Even at level 3 it barely
moves. The reason is a style mismatch, not an atmosphere deficit: the pilot and car are
**flat vector illustrations** against a **rendered, atmospheric** backdrop. Haze softens
edges; it cannot turn a cutout into a rendered subject.

## Claude Design is not an art generator

Recorded because the assumption is easy to make and expensive to act on. `DesignSync`
syncs **design-system** projects: component libraries, HTML previews, design tokens. It
reads and writes files in a claude.ai/design project. It does **not** generate or edit
artwork, and it cannot produce a better character or car.

## The real lever: the vector masters

The project's own rule (CLAUDE.md) is that all visual assets are produced in-house from
**SVG vector masters** via the asset pipeline. Those masters exist:

    frontend/scripts/scene/scene_character.svg    5.0 KB
    frontend/scripts/scene/scene_car.svg          3.8 KB

Measured contents of the character master: **25 paths, 6 circles, 4 rects, 10 linear
gradients, ZERO radial gradients, ZERO filters.** That composition is the flatness. There
is no volumetric shading in the file, so no amount of CSS downstream can add it
convincingly.

**Fixing it at the master is the correct pass**, and it is the one thing that would move
review 1's art-direction score rather than mitigate it:

1. **Volumetric shading.** Radial gradients on the helmet dome, shoulders, arms and the
   car body, so forms read as round rather than filled.
2. **Rim light baked in**, keyed to the scene's own cyan-violet key light. Baked into the
   master it will be correct at every scale; the CSS rim added in the first pass is a
   stopgap and should be reduced or removed once the master carries it.
3. **Ambient occlusion** where the character meets the car and the ground, which is what
   actually seats a subject in a scene.
4. **Specular highlights** on the visor and any chrome, which is what sells "rendered".

## Blocker to clear first: there is no scripted render step

`scene_proof.mjs` only COPIES the existing PNG; it does not produce it. Nothing in the
repository rasterises `scene_character.svg` to `scene_character.png`, so the current PNGs
cannot be regenerated reproducibly and an edited master would have no way to reach the
game.

**First task of the art pass is a render script**, headless Chrome rasterising each master
at its exact shipped dimensions, committed so the pipeline claim in CLAUDE.md becomes true
rather than aspirational. Measure the existing PNG dimensions and match them exactly, so
the swap is a like-for-like replacement and layout cannot shift.

## Order of work

1. Render script, verified by re-rendering the CURRENT masters and diffing against the
   shipped PNGs. If they do not match, the masters are not the true source and that must
   be resolved before any art change.
2. Character master: shading, rim, occlusion, specular. Re-render, compare in situ.
3. Car master, same treatment.
4. Reduce or remove the CSS rim in `SceneGroup.svelte` once the master carries it.
5. Re-decide the haze level against the improved art. It may earn its keep once the
   subject is rendered rather than flat.
