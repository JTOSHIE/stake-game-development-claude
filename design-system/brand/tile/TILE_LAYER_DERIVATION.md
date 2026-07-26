# Tile layers: what could be derived from the composed master, and what could not

Produced by `frontend/scripts/tile_layer_derivation.mjs`. The brief asked for background
and foreground layers derived from the composed master **where cleanly possible**, and an
honest record of what could not be. This is that record, and the separation was attempted
and measured rather than declared impossible.

**Verdict: the layers cannot be cleanly derived. The flat tile can, and is.**

## What the delivery set now holds

| File | Form | Source | Use |
|---|---|---|---|
| `FutureSpinner-Tile.png` | flat, 408x546 | the composed master, byte-identical | if the Tile Editor accepts a single composed image |
| `FutureSpinner-BG.jpg` | layer, 2048x1152 landscape | `tile_background_master.jpg` | if the editor requires layers |
| `FutureSpinner-FG.png` | layer, 4159x1875 landscape | `tile_hero_full.png` | if the editor requires layers |

Both forms are carried because **we do not know which the editor takes**. The captured
requirements ask for background and foreground as separate files
(`docs/stake-engine-live/game-tile-requirements.md`), and the portal's Design Thumbnail
editor has never been opened by us: the game card still shows its placeholder. Shipping
one form and guessing would put the owner in front of an editor with the wrong file.

## Why the layers cannot be cleanly derived

Three findings, each of which independently blocks it. Measured on the master, not
assumed. The proof sheet is
`reports/screens/brand-tile-composed/layer-derivation-attempt.png`.

### 1. The type is baked into the pixels

The detector resolves **26,879 pixels, 12.07% of the frame**, in a
336x321 band at (35, 131).

**That figure is conservative and understates the real area.** The mask keeps only
near-white, near-neutral components of at least 40 pixels, which cleanly resolves the
`FUTURE SPINNER` title and does not fully resolve the smaller, softer `WE ROLL SPINNERS`
line beneath it, visible in panel two of the proof sheet. The true baked-in type area is
larger than the number above, which only strengthens the finding.

**The type does not overlap the character: 0 pixels of contact.** It sits in a band
below it. But 3,689 type pixels still fall inside the character's bounding box, so a
rectangular foreground crop carries type into the foreground layer even though the two
elements never touch.

Either way the type is in the background layer, because everything that is not foreground
is background. There is no layer order that separates type that was never on its own
layer.

This also matters beyond the layering: the published tiles the platform composes
**already set the game title and the publisher name themselves**
(`docs/stake-engine-live/2026-07-26/published-tile-geometry.md`). If the editor composes
the same way, type baked into a supplied layer would be drawn twice.

### 2. The background behind the character does not exist

The character occupies **19,397 pixels, 8.71% of the frame**. Together with the type,
**46,276 pixels, 20.77% of the frame**, would have to be painted to produce a complete
background layer.

The fourth panel of the proof sheet shows that area in magenta. It is not a gap to be
tidied: it is a third of the picture, through the middle, where the city would have to be
invented. Inventing it inside an ingest is exactly what this pipeline exists not to do,
and the result would be our art passed off as the owner's delivery.

### 3. The silhouette is not cleanly keyable

Of **2,350 boundary pixels** on the character mask, **884 (37.62%)** sit below a 0.10
luminance step against what they touch. The character is dark against a bright neon field,
which sounds separable, but the scene's glow bleeds across the boundary and the mask has
no confident edge there.

That figure is generous to the attempt, too. The mask it measures is the largest dark
connected component in the central column, which is a cruder matte than anyone would ship:
panel three of the proof sheet shows it dropping the brightly lit visor and leaving holes
through the lit panels of the shell. A matte good enough to deliver would have to resolve
those, and it would find more ambiguity along the way, not less.

## What the owner does with this

Recorded plainly, because this is the part that reaches a human:

1. **If the Design Thumbnail editor accepts a single composed image**, use
   `FutureSpinner-Tile.png`. It is the owner's own artwork at 408x546, which is the
   platform's published tile geometry measured across a live sample, and it has been
   through no resampling or recompression here.
2. **If it requires background and foreground layers**, use the existing
   `FutureSpinner-BG.jpg` and `FutureSpinner-FG.png`, and use the composed master as the
   **reference for how they should sit**: character centred, weighted to the upper two
   thirds, with the lower third left clear for the type the platform draws.
3. **Either way, screenshot the editor.** It is the one surface in this whole submission
   nobody here has seen, and one capture of it settles which of the two paths above is
   real.

## Files

| File | SHA-256 |
|---|---|
| `design-system/brand/tile/tile_composed_master.png` | `741e77face74f7e93fb29790eb16dfc22f15b7a13d3d9f47a00a682e7c99434e` |
| `design-system/brand/delivery/FutureSpinner-Tile.png` | `741e77face74f7e93fb29790eb16dfc22f15b7a13d3d9f47a00a682e7c99434e` |
