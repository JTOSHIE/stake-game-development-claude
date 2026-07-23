# Tile Background: Generation Record

- **Tool:** `tools/brand/build_tile_background.py`, reusing the AssetForge
  backgrounds pipeline's (`scripts/assets/backgrounds.py`) exact "bg_base.jpg"
  job - same source frame (`bg_animated_loop.mp4` at t=22s, the "seed") and
  the same grading parameters (contrast 1.08, colour 1.18, brightness 1.0,
  channel multipliers (1.0, 1.0, 1.06), vignette 0.38/0.45), for continuity
  with the shipped game backdrop.
- **Date generated:** 2026-07-23 (FABLE ART MASTERS brief, PART 2).
- **Resolution:** native extraction is 1920x1080 (the source video's native
  size); uniformly upscaled to the requested 2048x1152 (both exactly 16:9,
  so this is a pure scale, no crop/pad - framing is unchanged from the
  shipped backdrop).

## Brightness gate

Measured (0.2126/0.7152/0.0722 Rec.709 luminance weights) before any lift:
overall mean **79.57/255**, central-band (vertical middle third) mean
**91.24/255** - both already well clear of the gate (overall >=24, band
>=30). No exposure lift was applied; the script measures first and only
lifts brightness (never palette/hue) if the native render falls short,
which it didn't here.

## Composition check against the brief

- **Scene only, no grid/frame/HUD/logo:** confirmed by inspection - city
  towers, rain, two flying vehicles, a magenta star sign and a cyan striped
  billboard (both in-world neon signage, which the brief explicitly wants),
  wet-road reflections, pedestrian silhouettes with umbrellas. No game UI
  chrome of any kind is present in the source frame.
- **Upper-left key light / calm lower third:** this re-render makes zero
  compositional changes (same frame, same crop, uniform upscale only), so
  whatever the shipped, already-live game backdrop already established here
  is preserved exactly. The lower third (wet road + reflections) reads as
  the calmest region of the frame relative to the signage-dense upper two
  thirds, consistent with using it as a title zone; PART 4's composition
  guide notes the star sign's reflection bloom in the lower-left as the one
  area to keep a proposed title clear of.

## Exports

`tile_background_master.jpg` (2048x1152) and `tile_background_preview_1024.jpg`
(1024x576) under `design-system/brand/tile/`, proof copy and gate output
under `reports/screens/brand-tile-background/`.
