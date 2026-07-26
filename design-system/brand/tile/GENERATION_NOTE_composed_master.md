# Tile composed master: Generation Record

## Provenance

| Field | Value |
|---|---|
| Origin | **Externally generated, commissioned by the owner** |
| Supplied | 2026-07-26, by the owner |
| Found at | `/Users/jt/Downloads/we-roll-spinners_future-spinner_tile.png` |
| Source SHA-256 | `741e77face74f7e93fb29790eb16dfc22f15b7a13d3d9f47a00a682e7c99434e` |
| Source bytes | 476,178 |
| Dimensions | **408x546**, portrait |
| Ingested by | `frontend/scripts/tile_master_ingest.mjs` |
| Landed as | `design-system/brand/tile/tile_composed_master.png`, byte-identical |

Not resized, not recompressed, not retouched. The file committed here is the
file the owner supplied, and the hash above is checked after the copy rather
than assumed.

## Measurements

| Measurement | Value |
|---|---|
| Dimensions | 408x546 (aspect 0.7473) |
| Alpha | 222,768 opaque, 0 partial, 0 clear |
| Alpha channel in use | **no, fully opaque** |
| Opaque coverage | 100.00% of the frame |
| Distinct RGB values | 142,208 |
| Fully transparent border pixels | 0 of 1904 |

## Why the dimensions are the finding

**408x546 is the platform's own published tile geometry.** That is not inferred from
the docs, which give no pixel dimensions for the tile anywhere. It was measured against
the platform's live published assets: see
`docs/stake-engine-live/2026-07-26/published-tile-geometry.md`, where a sample of live
game tiles taken from the public FAIR catalogue is decoded and its dimensions counted.

Everything the repository held before this delivery was **landscape**:

| Existing asset | Dimensions | Orientation |
|---|---|---|
| `tile_background_master.jpg` | 2048x1152 | landscape |
| `tile_hero_full.png` (delivered as `FutureSpinner-FG.png`) | 4159x1875 | landscape |
| **`tile_composed_master.png`** (this file) | **408x546** | **portrait** |

So this is the first asset in the project built to the shape the platform actually
publishes. What follows from that for the delivery set is worked out in the tile
delivery record, not here.
