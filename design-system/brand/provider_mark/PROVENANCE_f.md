# Provider mark, candidate F: owner-supplied, transparent

## Provenance

| Field | Value |
|---|---|
| Origin | **Externally generated, commissioned by the owner** |
| Supplied | 2026-07-26, by the owner, as the second of two |
| Source file | `/Users/jt/Desktop/Transparent We Roll Spinners icon.png` |
| Source SHA-256 | `61a2258d7c3283d93e430539656070f72560b86d5940312c7454ff776a3daefd` |
| Source dimensions | 1024x1024, 8-bit **RGBA** |
| Ingested by | `frontend/scripts/provider_mark_ingest_f.mjs` |

## Measurements

| Measurement | Value |
|---|---|
| Colours used | **exactly 3**: `#00ffff` (230,190 px), `#0a0a14` (150,556 px), `#ff00ff` (150,491 px) |
| Alpha | 531,237 opaque, **0 partial**, 517,339 clear |
| Ink bounding box | 825x817 at (100, 104) |
| Margins | left 100, right 99, top 104, bottom 103 |
| Centring skew | horizontal +1 px, vertical +1 px |
| Silhouette radius | mean 410.7, min 407, max 428, deviation **5.1%** |
| Master crop | 1024x1024 at (0, 0) |

## What is better about this one than candidate e

Both of TR-031's open questions close on this file, and neither closes by our doing
anything to the art:

1. **It has a real alpha channel.** The platform states the provider logo wants "a
   transparent background" (`docs/stake-engine-live/game-tile-requirements.md:36`).
   Candidate e had no alpha at all and we had to key its field out; here the
   requirement is met by the supplied file itself.
2. **There is no wordmark.** Candidate e's arched text measured 0.81 px per stroke at
   48px, below one whole pixel. That problem does not exist here, because the element
   that caused it is not present.

**The colour discipline is exact.** Three colours and no more: `#00FFFF` and
`#FF00FF` are the brand emissives verbatim (`design-system/DESIGN_SYSTEM.md:14`), plus
`#0A0A14` as a structural near-black.

## Two things to look at before adopting

### 1. The structural near-black on a dark surface

`#0A0A14` is **opaque, not transparent**, and it draws the reel window frames and the
gaps that separate the ring from the reel strip. On a light surface that structure reads
clearly. On a dark surface, which is what a casino portal tile normally is, near-black
structure sits at very low contrast against the background and the lines that hold the
mark together can visually dissolve.

This is not decidable from a preview on white, so it is rendered rather than argued:
`reports/screens/provider-mark/candidate-f-on-surfaces.png` shows this mark and the
other candidates at TRUE 512, 96 and 48 over light, mid, dark and a typical portal
surface, drawn 1:1 with no resampling.

### 2. The alpha channel is hard-edged

**0 partially transparent pixels** in the whole file: every pixel is either
fully opaque or fully clear. The source carries no antialiasing on its silhouette. That
is harmless at 1024 and it is why the exports above are downscaled with high-quality
smoothing ON: the resample supplies the edge softening the source does not have. Worth
knowing if the file is ever used at or near its native size, where the hard edge would
show.

The outer silhouette also deviates **5.1%** from a true circle
(radius 407 to 428), which is visible as slight
flattening beside the reel strip at 512 and is invisible at 48. Recorded, not corrected:
correcting it would be redrawing the owner's art inside an ingest.

## Files

| File | SHA-256 |
|---|---|
| `provider_mark_f-owner-transparent_master_1024.png` | `66c692daf309293568214bd57b350b02b930d610c6b7d09ecb181a35dc7a03c6` |
| `provider_mark_f-owner-transparent_512.png` | `635844bb5ff8ecc7f1ac020880e500bdeecb645f5f7bc501cca3e7d6bf19913a` |
| `provider_mark_f-owner-transparent_96.png` | `aac6db0e9616e6c2833cef44cf9aa465e39f72a9d195f3f3647a66b23f108f9e` |
| `provider_mark_f-owner-transparent_48.png` | `54198f1cfa1f2a193f13ed31f4d619009b8fab68c72f21c2d33455bb938e98b2` |

## Adoption

**NOT adopted.** `design-system/brand/delivery/WeRollSpinners-Logo.png` is unchanged and
still carries candidate d. The eye-call is the owner's.
