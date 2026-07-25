# Provider mark, candidate E: owner-supplied, externally commissioned

## Provenance

| Field | Value |
|---|---|
| Origin | **Externally generated, commissioned by the owner** |
| Supplied | 2026-07-26, by the owner |
| Source file | `/Users/jt/Desktop/wrs_provider_mark_source.png`, found at the path the brief named |
| Source SHA-256 | `fba98ff4b36cb7f0380375ca76fb6a4d02b7096f7c1c1ab94973a7b65e6ed7d5` |
| Source dimensions | 1254x1254, 8-bit RGB, **no alpha channel** |
| Ingested by | `frontend/scripts/provider_mark_ingest_e.mjs` |

Externally generated art is permitted for this asset. CLAUDE.md prohibits externally
DESIGNED art and permits external ENHANCEMENT, with symbols never externally designed.
A provider logo is neither a symbol nor an animation-pipeline asset: it is a one-time
square upload in Team Settings Branding, and it came down the same owner-supplied path
the hero emblem did. The obligation CLAUDE.md sets for any external asset is to record
the provenance, which is this table.

## What the ingest did, and did not do

**It did not redraw, retouch, recolour or restyle anything.** Every operation below is a
measurement, a crop, or a rescale, and each is reported with its numbers.

| Measurement | Value |
|---|---|
| Field colour, sampled 6% inside each corner | `#020614` |
| Field consistent across all four insets | yes |
| Ink bounding box | 1254x1254 at (0, 0) |
| Margins | left 0, right 0, top 0, bottom 0 |
| Centring skew | horizontal +0 px, vertical +0 px |
| Master crop | 1252x1252 at (1, 1), centred on the ink |

The source arrived square and very nearly centred, so squaring and centring is a small
correction rather than a recomposition. The skew figures above are how small.

## The background, and why BOTH forms are committed

The platform is explicit: "Provider Logo ... File format: High resolution PNG with a
transparent background" (`docs/stake-engine-live/game-tile-requirements.md:36`, dated
mirror fetched 2026-07-04).

The supplied file has **no alpha channel at all** and a dark field with **rounded
corners**. The radii are the evidence that the field is part of the design rather than a
backdrop that happens to be behind it: a stray backdrop does not have corner radii.

So the choice is a real one and it is not the builder's to make silently. Both forms are
exported:

- **`-field`**: the mark exactly as designed, on its dark rounded-corner tile.
- **`-transparent`**: the same mark with the field keyed out, meeting the platform's
  stated requirement. Keyed at full resolution BEFORE downscaling, so edge antialiasing
  is computed against transparency rather than leaving a grey fringe.

**The owner picks.** If the rounded tile is the intended mark, the platform requirement
is worth raising with them directly, because a submission asset that does not meet a
stated format rule is a portal-upload risk regardless of how good it looks.

## Legibility at 48px, measured on THIS file

TR-031 exists because the ORIGINAL master's arched text was unresolvable at 48px, at
roughly two pixels per stroke. **This source carries an arched text ring too**, so the
same measurement was taken on it rather than assumed either way:

| Measurement | Value |
|---|---|
| Scan line | y = 977 of 1252, through the middle of the word band |
| Letter strokes detected | 7 |
| Median stroke width at source resolution | 21 px |
| **Scaled to 48px** | **0.81 px per stroke** |
| Scaled to 96px | 1.61 px per stroke |

**At 48px the text ring measures 0.81 px per stroke, which is below one whole pixel per stroke and cannot resolve.** That is the same structural finding TR-031 recorded against the original master, and it is why candidate d dropped its text ring entirely. This is a statement about the measurement, not a recommendation: the ring, the reel windows and the 7s are all large and read well, and the owner may reasonably want the wordmark present at 512 and accept it going to a texture at 48. The comparison sheet shows both sizes so the call is made on real pixels.

## Files

| File | Form | SHA-256 |
|---|---|---|
| `provider_mark_e-owner-supplied_master_1252.png` | master | `933d84fc5359c0d0dd21a88a2402953db7b02b07b256b50158ca045d47105474` |
| `provider_mark_e-owner-supplied_512.png` | field | `172d8930ad459d940a7930af274e1f63c5cc07b46ce03e5dd261b9d77559407d` |
| `provider_mark_e-owner-supplied_96.png` | field | `8aa61ba7cd346f2762a6cb76a7c30bcc16ce1155d28abe371285baef229f065a` |
| `provider_mark_e-owner-supplied_48.png` | field | `2715d872f9ec060c45612a0dd840bc912a3c42e803ae1453ef353e5a44fdcaa3` |
| `provider_mark_e-owner-supplied-transparent_512.png` | transparent | `3538d408e475870f269a3ff4da4596f9c54b2ac28472a1f23c2d11fab33a9b09` |
| `provider_mark_e-owner-supplied-transparent_96.png` | transparent | `7e780ceef4643c44ee87cd00ce0b18edd57c1b483887548add6025b407abf194` |
| `provider_mark_e-owner-supplied-transparent_48.png` | transparent | `d8e594dde0a98ca7c562641e227db92c8e5c7865cdf2ef103abc9cf173f1110c` |

## Adoption

**NOT adopted.** `design-system/brand/delivery/WeRollSpinners-Logo.png` is unchanged and
still carries candidate d. The eye-call is the owner's, across e and d, with a, b and c
retired as non-preferred. On the owner's one-line confirmation the delivery file is
regenerated from the chosen candidate and TR-031 closes.
