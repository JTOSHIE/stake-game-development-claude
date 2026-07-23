# Tile Foreground Hero: Generation Record

- **Tool:** `tools/brand/build_tile_hero.py`, composing the existing,
  already-established `design-system/masters/scene_character_car.svg`
  master (the in-game racer+hover-car pose, previously exported at 1200x656
  for in-scene HUD placement per `scripts/assets/manifest.json`) at 3x
  native resolution (1500x820 native -> 4500x2460 rendered).
- **Date generated:** 2026-07-23 (FABLE ART MASTERS brief, PART 3).

## Ground shadow/glow ellipses excluded

The master's three scene-dressing ellipses (a hard-edged 50%-opacity black
drop shadow and two soft cyan repulsor-glow ellipses) were calibrated for
the original in-scene ground plane and dropped from this cutout - they
don't represent contact with the *new* tile background, and (found during
the edge gate below) their translucent edges are exactly the kind of
navy/black semi-transparent fringe the gate exists to catch. A fresh
contact shadow belongs in the PART 4 composition step against the real
tile background, not baked into this isolated hero.

## Rim light

A magenta rim light was added along the pilot's leading (left,
direction-of-travel) edge - the car's cockpit/nose detail sits on the left
of the composition, so the vehicle reads as travelling leftward. Implemented
as a directional, per-row glow: for each row of the isolated pilot alpha
mask, the leftmost opaque pixel is found and a magenta glow band is blended
outward/inward from that boundary with a quadratic falloff (visible in both
the full hero and the pilot-only variant).

## Edge gate: a genuine tension worth recording

The brief's edge gate is "no background-navy fringing above 50 percent
alpha along the silhouette." The master's own outline ink colour
(`#05070d`, used on essentially every path's stroke) is itself a dark
navy-black, numerically close to the navy background token (`#060610`) -
so a naive "navy-coloured pixel at >50% alpha near the edge" check
flags the artwork's own **fully opaque** outline colour and its **normal,
healthy antialiasing** (a clean, monotonic alpha falloff over ~4-5px,
verified by direct pixel sampling) as if it were background bleed-through.
Neither is a real fringe - a real fringe (e.g. from an imperfect
chroma-key/despill step) would show a *flat plateau* of semi-transparent
colour sitting across several pixels rather than an actively-transitioning
edge. `gate_vector_mark`'s sibling gate here (`fringe_gate` in
`build_tile_hero.py`) tests for exactly that distinction via local alpha
gradient (a steep local gradient = healthy mid-transition; a shallow one
at a stable mid-alpha = a real flat fringe), rather than a bare colour+alpha
threshold. With that fix: **0 offending pixels** on both the hero and the
pilot-only variant - the render is genuinely clean, not merely
gate-satisfied by a lenient threshold.

## Sizes

| Export | Size (px) | Long edge |
|---|---|---|
| `tile_hero_full.png` | 4159x1875 | 4159 (>=1600 floor) |
| `tile_hero_pilot_only.png` | 854x1875 | 1875 (>=1600 floor) |

Both tight alpha-cropped, transparent background, under
`design-system/brand/tile/`; proofs (composited onto a dark preview
background for reviewability) and gate output under
`reports/screens/brand-tile-hero/`.
