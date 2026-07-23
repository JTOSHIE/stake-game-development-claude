# Tile Composition Guide

One page for the owner's Tile Editor session (Stake Engine store tile).
Source assets, all under `design-system/brand/tile/`:

| Asset | Size | Role |
|---|---|---|
| `tile_background_master.jpg` | 2048x1152 | Base scene layer |
| `tile_hero_full.png` | 4159x1875, transparent | Racer + hover car, tight-cropped |
| `tile_hero_pilot_only.png` | 854x1875, transparent | Pilot alone, tight-cropped (use if the tile format is too narrow/tall for the full car+pilot group) |

The vector mark (`design-system/brand/vector_mark/wrs_mark_v2.svg` /
`_mono_cyan.svg`, 512/192/96/48 PNG exports) is available if the tile
format calls for a small corner badge, but is not part of the base
layer stack below.

## Layer order (bottom to top)

1. **Background** - `tile_background_master.jpg`, fit to the tile canvas
   (crop to the tile's aspect ratio rather than stretch, to preserve the
   rain-city perspective).
2. **Gradient overlay** (see below) - improves title legibility in the
   lower third without hiding the scene.
3. **Hero** - `tile_hero_full.png` (or `tile_hero_pilot_only.png` on
   narrower formats), placed centre-left.
4. **Title text**, lower third.

## Hero placement

Centre-left, at roughly **55% of the tile's height** (i.e. the hero's own
height should scale to ~0.55x the tile canvas height, anchored so its feet
sit just above the bottom edge - matching the wet-road contact point in the
background plate). Horizontally, bias left-of-centre (roughly 30-40% in
from the left edge for the hero's horizontal centre) so the lower-third
title zone on the right/centre stays uncluttered.

## Title, lower third

- **Placement:** lower third of the tile, horizontally centred or biased
  right of the hero.
- **Font:** Orbitron Bold (already used throughout the brand - matches the
  vector mark's wordmark and the in-game HUD).
- **Fill:** cyan (`#00FFFF`, the brand token).
- **Effect:** magenta (`#FF00FF`) outer glow, not a hard outline - soft
  enough to lift the title off the busy background without fighting the
  scene's own neon signage.
- **Size:** roughly **14% of the tile's height** for the title's cap
  height.
- **Legibility note:** the background's star-sign reflection (lower-left,
  see `design-system/brand/tile/GENERATION_NOTE_background.md`) is the one
  bright, busy area in the lower third - keep the title clear of it,
  biasing right or adding a touch more gradient darkening under the title
  itself if it's positioned there.

## Suggested gradient layer

A linear gradient, transparent at roughly the vertical 55% mark down to
~35% opacity near-black (`#000000`) at the bottom edge, is enough to lift
title contrast without visibly flattening the scene above it - the
background's own measured luminance (see
`GENERATION_NOTE_background.md`) is already comfortably bright, so a light
gradient is sufficient; there's no need to darken the whole plate.

## Dark-background warning

The Tile Editor's dark-background warning is keyed off overall/central-band
luminance - `tile_background_master.jpg` already clears both thresholds
natively (overall 79.6/255, central band 91.2/255, gate minimums are 24 and
30) with no exposure lift applied, so the warning should not trigger from
the background plate itself. If a gradient overlay or additional darkening
is added on top in the Tile Editor, re-check the warning after - a strong
enough gradient can still pull the measured luminance back under the gate
even though the source plate started well clear of it.
