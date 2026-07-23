# Session Report: FABLE ART MASTERS, 2026-07-23

- **Date:** 2026-07-23 (session executed 2026-07-24).
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/fable-art-masters-v1`, cut fresh off `main` (zero open
  PRs at the time of branching).

Four-part brief from Fable: a new Tier 2 vector mark (deterministic,
paths-only SVG with font-to-path wordmarks), a re-rendered tile background,
a composited tile foreground hero, and a one-page composition guide for the
owner's Tile Editor session. This report's gate table is the record Fable
reviews next check-in, per the brief's own closing line.

## Per-part gate table

| Part | Gate | Result |
|---|---|---|
| 1. Vector mark | Paths-only (no text/rect/circle/ellipse/line/polygon/polyline/image anywhere) | PASS (both variants) |
| 1. Vector mark | Margin symmetry, output-derived sweep, 512 render | PASS - 26px all four sides, spread 0 (both variants) |
| 1. Vector mark | Minimum stroke at 192 render >=2px (structural 6-unit spoke stroke) | PASS - measured 20px |
| 2. Tile background | Brightness gate: overall >=24/255, central-band >=30/255 | PASS - measured 79.57 / 91.24, no exposure lift needed |
| 3. Tile foreground hero | Long edge >=1600px | PASS - hero 4159px, pilot-only 1875px |
| 3. Tile foreground hero | No background-navy fringing >50% alpha along silhouette | PASS - 0 offending pixels (both hero and pilot-only), after fixing the gate itself to distinguish healthy antialiasing from a real flat-fringe defect (see PART 3 below) |
| 4. Composition guide | n/a (documentation) | Delivered, numbers sanity-checked against a real composite mockup |

## PART 1: Tier 2 vector mark

`design-system/brand/vector_mark/wrs_mark_v2.svg` (+ `wrs_mark_v2_mono_cyan.svg`),
built by a new deterministic generator, `tools/brand/build_vector_mark.py`.
512 viewBox, centre (256,256): outer tyre annulus (r230/r196, gunmetal,
24 cyan tread notches), chrome rim ring (r196-r176, two flat greys), five
spokes at 72 degrees (gunmetal, 6-unit magenta edge, 18-degree rotation
offset - see below), a reel window (rounded rect 216x120 rx16, 8-unit cyan
border, two 6-unit dividers, three gold "7"s each with a 4-unit magenta
outline), and arched "WE ROLL" / "SPINNERS" wordmarks (radius 150, cap
height 44, navy fill with a 5-unit magenta inner stroke and 3-unit cyan
outer stroke).

**Font-to-path conversion:** added `fonttools` + `brotli` to
`scripts/assets/.venv` (neither existed in the repo before). Orbitron Bold
glyph outlines are extracted directly from the vendored
`@fontsource/orbitron` woff2 (already an existing frontend dependency, SIL
OFL 1.1 licensed, which explicitly permits deriving outline artwork) at
build time - the shipped SVG has zero `<text>` elements and no runtime font
dependency.

**Two real bugs caught before the gates were run for record, not after:**

1. **Wordmark letters overlapping the chrome rim.** The first attempt
   anchored each letter's *baseline* on the arc's radius (150), which
   pushes cap-tops out to 150+44=194 - past the chrome rim's inner edge at
   176. This was invisible-ish in the full-colour render (the letters'
   strong magenta/cyan double-outline against navy disguised the overlap)
   but glaringly obvious in the mono-cyan variant, where the letter and the
   solid-cyan rim are the same colour and visibly merged. Fixed by
   vertically centring each letter's glyph block on the stated radius
   instead of baseline-anchoring it - confirmed by re-rendering both
   variants.
2. **A spoke landing directly behind a wordmark letter.** Five spokes at a
   bare 0/72/144/216/288 degree layout puts one spoke exactly behind the
   wordmark's top-centre letter and, mirrored, the bottom-centre letter.
   An 18-degree rotation offset (chosen to avoid both 0 and 180 mod 72)
   clears both wordmark centres.

**A tension in the brief's own hard rules, resolved and documented rather
than silently picked:** the brief states a global "minimum stroke 6 units"
hard rule, then separately specifies the wordmark's own treatment at 5 and
3 units and the reel digits' outline at 4 units - all below that stated
minimum. Treated the wordmark/digit values as more specific, later
instructions for named decorative elements, and read "minimum stroke 6
units" as governing the *structural* geometry (spokes, dividers) - which is
also what the render gate measures. Full reasoning in
`design-system/brand/vector_mark/GENERATION_NOTE.md`.

Exports: SVG + transparent PNGs at 512/192/96/48 for both variants, under
`design-system/brand/vector_mark/`; proofs and gate output under
`reports/screens/brand-vector-mark/`. At 48px the arched wordmark text is
no longer individually legible (expected for detailed circular badge text
at that size); reads clearly from 96px up.

## PART 2: Tile background

`tools/brand/build_tile_background.py` reuses the AssetForge backgrounds
pipeline's (`scripts/assets/backgrounds.py`) exact "bg_base.jpg" job - same
source frame (`bg_animated_loop.mp4` at t=22s) and the same grading
parameters - for continuity with the shipped game backdrop, then uniformly
upscales the native 1920x1080 extraction to the requested 2048x1152 (both
exactly 16:9, so this is a pure scale, no crop/pad).

Measured brightness before any lift: overall mean **79.57/255**,
central-band mean **91.24/255** - both already well clear of the gate
(>=24 / >=30). No exposure lift was applied; the script measures first and
only lifts brightness (never palette) if the native render falls short,
which it didn't here.

Confirmed by inspection: city, rain, two flying vehicles, in-world neon
signage (a magenta star sign, a cyan striped billboard - both wanted
content per the brief), wet-road reflections, pedestrian silhouettes; no
game UI chrome of any kind baked in. Zero compositional changes were made
(same frame, same crop, uniform upscale only), so the shipped backdrop's
established key-light position and lower-third calmness are preserved
exactly, not re-derived.

Exports: `tile_background_master.jpg` (2048x1152) and
`tile_background_preview_1024.jpg` under `design-system/brand/tile/`;
proof and gate output under `reports/screens/brand-tile-background/`.

## PART 3: Tile foreground hero

`tools/brand/build_tile_hero.py` renders the existing, already-established
`design-system/masters/scene_character_car.svg` master (previously exported
at 1200x656 for in-scene HUD placement) at 3x native (4500x2460), rather
than recomposing the two standalone `scene_character.svg`/`scene_car.svg`
files from scratch - the combined master already encodes "the established
pose" the brief asks for, and re-deriving the same relative positioning
independently risked getting it wrong.

**Ground shadow/glow ellipses excluded.** The master's three scene-dressing
ellipses (a hard-edged 50%-opacity black drop shadow, two soft cyan
repulsor-glow ellipses) were calibrated for the original in-scene ground
plane and don't represent contact with the *new* tile background - and,
found while chasing the edge gate below, their translucent edges were
exactly the kind of navy/black semi-transparent artefact the gate exists to
catch. Excluded from the cutout; a fresh contact shadow belongs in the
PART 4 composition step against the real tile background.

**Rim light:** added along the pilot's leading (left, direction-of-travel)
edge - the cockpit/nose sits on the composition's left, so the vehicle
reads as travelling leftward. Implemented as a per-row directional glow
from the isolated pilot alpha mask's leftmost-opaque-pixel boundary.

**The edge gate caught a real measurement bug in itself, not in the
art.** First pass: 442,831 "offending" pixels - almost the entire
semi-transparent shadow/glow layer, because the gate was flagging any
navy-tolerant colour at any partial alpha anywhere in the image, including
every intentionally-designed soft shadow/glow. After excluding the ground
ellipses (a real fix, above): still 31,525. Sampling the actual pixels
showed the culprit: the artwork's own outline ink colour (`#05070d`, used
on essentially every stroke) is itself dark navy-black, numerically close
to the navy background token (`#060610`) - so a bare "navy-colour +
>50%-alpha near the edge" check flags the artwork's own fully-opaque
outline and its normal, healthy antialiasing (confirmed by direct
pixel-profile sampling: a clean, monotonic 255->252->196->111->27->0
falloff over ~5px) as if it were background bleed-through. Fixed the gate
itself to test local alpha *gradient* instead of a bare threshold - a
steep local gradient means a healthy mid-transition pixel; a shallow
gradient at a stable mid-alpha would mean a genuine flat fringe (the
signature of, e.g., an imperfect chroma-key/despill step). With that fix:
**0 offending pixels** on both variants - a real, not merely
threshold-satisfied, clean result.

Exports: `tile_hero_full.png` (4159x1875, long edge >=1600) and
`tile_hero_pilot_only.png` (854x1875, long edge >=1600), both tight
alpha-cropped and transparent, under `design-system/brand/tile/`; proofs
and gate output under `reports/screens/brand-tile-hero/`.

## PART 4: Tile composition guide

`docs/TILE_COMPOSITION_GUIDE.md` - layer order (background -> gradient ->
hero -> title), hero at centre-left / ~55% tile height, title in the lower
third (Orbitron Bold, cyan fill, magenta outer glow, ~14% tile height), a
suggested gradient-overlay setting, and the dark-background warning note
(with the measured luminance numbers from PART 2, so the owner knows the
background plate itself is already clear of the gate). The guide's own
numbers were sanity-checked against a real composite mockup (background +
hero + a title-zone placeholder) rather than left as unverified
recommendations - saved at
`reports/screens/brand-tile-composition-guide/composition_mockup.jpg`. One
real placement implication surfaced there: the full hero (aspect ratio
~2.2:1) at 55% tile height spans most of a 16:9 tile's width, which is why
the guide already recommends the pilot-only variant on narrower formats.

## Not done / open threads

- No new locked-file edits (`rgsService.ts`, `gameStore.ts`,
  `games/future_spinner/`, `.claude/settings.json` all confirmed untouched).
- The mono-cyan vector mark variant has no stroke-based min-stroke gate
  (it has no stroke layer at all in mono mode, by construction) - only the
  paths-only and margin-symmetry gates apply to it, both pass.
- PR opened, not merged, per standing convention - Fable reviews the
  committed renders next check-in per the brief's own closing line.

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** built
  three new deterministic Python generators (`tools/brand/
  build_vector_mark.py`, `build_tile_background.py`, `build_tile_hero.py`)
  plus a dedicated gate script for the vector mark
  (`tools/brand/gate_vector_mark.py`; the tile hero's fringe gate lives
  inline in its own build script) rather than a single monolithic tool,
  since the three parts have unrelated inputs (font glyphs, an existing
  video-frame pipeline, an existing SVG master) and gate criteria. Iterated
  each part against its own gate/visual inspection before moving to the
  next, catching and fixing three real defects along the way (wordmark/rim
  overlap, spoke/letter collision, and the fringe-gate's own
  overly-broad initial implementation) rather than treating a first-pass
  render as done.
- **Alternatives rejected:** recomposing `scene_character.svg` +
  `scene_car.svg` from their two independent, un-combined viewBoxes from
  scratch for PART 3 (rejected in favour of reusing the existing composited
  `scene_character_car.svg` master, which already encodes "the established
  pose" more faithfully than re-deriving the same relative positioning
  independently would); inflating the wordmark/digit stroke widths to 6
  units to satisfy the brief's global "minimum stroke" rule literally
  (rejected - the brief's own later, more specific numbers for those
  elements take precedence, documented rather than silently overridden).
- **Files touched:** `tools/brand/build_vector_mark.py`,
  `tools/brand/gate_vector_mark.py`, `tools/brand/build_tile_background.py`,
  `tools/brand/build_tile_hero.py` (all new); `design-system/brand/
  vector_mark/` (SVGs, PNGs, `GENERATION_NOTE.md`, new);
  `design-system/brand/tile/` (background master + preview, hero + pilot-only
  PNGs, two generation notes, new); `docs/TILE_COMPOSITION_GUIDE.md` (new);
  `reports/screens/brand-vector-mark/`, `reports/screens/
  brand-tile-background/`, `reports/screens/brand-tile-hero/`,
  `reports/screens/brand-tile-composition-guide/` (all new); this report.
  `scripts/assets/.venv` gained `fonttools`, `brotli`, `numpy` (none existed
  before). Locked files untouched.
- **Open threads:** none blocking - all four parts are complete and gated.
  Fable's next-check-in review of the committed renders (per the brief's
  own closing line) is the only outstanding step.
