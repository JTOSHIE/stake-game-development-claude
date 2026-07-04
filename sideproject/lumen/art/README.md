# LUMEN art masters

Original in-house SVG art masters for LUMEN, the bioluminescent midnight-zone deep-sea slot
(side project, isolated from `games/future_spinner`). Every symbol is a dark silhouette lit only
by additive bio-glow, authored to match the design-system master format used by AssetForge v2
(`scripts/assets/`): a single self-contained SVG per piece, square viewBox, front-facing, no
baked-in text, transparent background, layered `<g>` groups with ids.

## Palette

The whole set is graded to one palette so it reads as a single artist's work.

| Role | Hex | Use |
|---|---|---|
| Abyss base (dark) | `#05070f` to `#0b1020` | Body gradients, silhouettes, background |
| Deep-blue mid | `#0f2440` / `#122036` | Body interiors, rim shadow |
| Cyan | `#00e5ff` | Primary bio-glow: eyes, rim light, nautilus, lanternfish, orb |
| Teal | `#23f0c7` | Secondary glow: jellyfish, isopod edge, underbellies, meter |
| Magenta | `#ff3df0` | Gulper eel, deep shrimp, wild accent, warning-bright motes |
| Lure gold | `#ffd36b` | Anglerfish lure, scatter egg cores (the rare warm light) |
| Highlight white | `#eaffff` / `#ffffff` | Glow cores and specular pips |

Glow is built two ways, layered on every symbol for a consistent look:
1. a soft halo via `feGaussianBlur` (small `stdDeviation` for a tight rim, large for the bloom), and
2. a hot core drawn with a radial gradient plus a small solid white centre.

Lighting is consistent: rim light reads from the top-left, cores sit slightly up-left of centre.

## Files

Symbols are named to the LUMEN maths symbol ids (see `../GAME_DESIGN.md`). All symbols are
`240 x 240` viewBox.

| File | Symbol | Glow | Notes |
|---|---|---|---|
| `H1_anglerfish.svg` | H1 (premium, hero) | lure-gold | Anglerfish, gaping fang mouth, cyan eyes, gold lure on a rod (the biggest single glow) |
| `H2_gulpereel.svg` | H2 (premium) | magenta | Pelican/gulper eel, cavernous jaw + glowing throat, whip tail with a magenta tip lure |
| `M1_nautilus.svg` | M1 (mid) | cyan | Chambered nautilus spiral, cyan rim light tracing the shell, teal septa, tentacle cluster |
| `M2_jellyfish.svg` | M2 (mid) | teal | Moon-jelly bell with the four gonad rings, radial canals, trailing tentacles |
| `M3_lanternfish.svg` | M3 (mid) | cyan | Lanternfish, big eye, a row of photophore light organs along the flank |
| `L1_isopod.svg` | L1 (low) | dim teal | Giant isopod, segmented carapace, legs, faint teal edge (glows least, by design) |
| `L2_shrimp.svg` | L2 (low) | faint magenta | Curled deep shrimp, long antennae, tail fan, subtle magenta rim |
| `L3_orb.svg` | L3 + the feature Glow Orb | radiant cyan-white | The most luminous piece: white core, diatom lattice ring, star rays, broad bloom |
| `W_siphonophore.svg` | W (wild) | spectrum cyan to magenta | Ornate glowing chain-jelly, stacked nectophore bells, trailing filaments; reads premium/special |
| `S_spore.svg` | S (scatter) | gold-teal | Glowing egg-sac / spore cluster in a membrane, gold cores, drifting escaped spores; reads special |

UI / scene pieces (non-square, sized to their aspect):

| File | viewBox | Notes |
|---|---|---|
| `glow_meter.svg` | `120 x 320` | Vertical GLOW gauge: a light-filled column, lit segments from the base plus dim unlit segments above, a glow-orb cap indicator, level notches. No baked text. |
| `background.svg` | `1600 x 900` | Dark abyss backdrop: black-to-deep-blue gradient, faint surface light shafts, a suggested distant trench with ridge silhouettes, drifting lit motes. Kept very dark so symbols pop. |

`preview/` holds rasterised PNG proofs (not masters).

## Rendering to exact-size PNGs

These masters render through the same deterministic path AssetForge v2 uses (CairoSVG in the
assets venv). To reproduce the previews directly:

```sh
# from repo root
./scripts/assets/.venv/bin/python - <<'PY'
import cairosvg, glob, os
art = 'sideproject/lumen/art'
os.makedirs(f'{art}/preview', exist_ok=True)
sizes = {'background': (1600, 900), 'glow_meter': (120, 320)}  # default 240x240
for f in sorted(glob.glob(f'{art}/*.svg')):
    name = os.path.splitext(os.path.basename(f))[0]
    w, h = sizes.get(name, (240, 240))
    cairosvg.svg2png(url=f, write_to=f'{art}/preview/{name}.png',
                     output_width=w, output_height=h)
    print(name, w, h)
PY
```

To wire them into the production pipeline, add a LUMEN manifest mirroring
`scripts/assets/manifest.json`: list each symbol under `symbols` (id to `src`), keep
`symbol_sizes` at 240 and 120, and add `background.svg` / `glow_meter.svg` as `exports` at their
native sizes. The build step (`scripts/assets/build.py`) then renders them byte-identically to
`frontend/public/assets/themes/lumen/`. Nothing here modifies `future_spinner` or the main
frontend.
