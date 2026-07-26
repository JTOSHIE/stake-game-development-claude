# Scene background: Generation Record

The shipped rain-city backdrop, adopted 2026-07-27 on the owner's ruling
**BG: V1**. This record exists because the asset is externally designed, which
the project's Assets convention now permits only WITH recorded provenance. This
is that record.

## Provenance

| Field | Value |
|---|---|
| Origin | **Externally generated, commissioned by the owner** |
| Supplied | 2026-07-26, by the owner |
| Found at | `~/Downloads/slot_background_assets/bg_improved_v1.jpg` |
| Source SHA-256 | `65ef44c1ce96d351e96f69831bde8146...` (full value in the ingest record) |
| Source bytes | 569,573 |
| Source dimensions | 1920x1080, RGB, no alpha |
| Vendor's own description | "Alternative compositions in the same style." |
| Ingested by | `scripts/assets/background_candidate_ingest.py` |
| Ingest record | `reports/qa/background_candidate_ingest.json` |
| Landed as | `frontend/public/assets/themes/future-spinner/backgrounds/bg_base.jpg` |
| Shipped SHA-256 | `c7ecfa15dde8db42...` |
| Shipped bytes | **273,173** at JPEG q80, progressive, optimised, 4:2:0 |

Recompressed, not retouched and not resized. The encode was swept against the
incumbent's own 277,172-byte budget rather than chosen by eye: q92 through q80
were measured and q80 is the highest quality that fits. The supplied 569,573-byte
file would have been a 105 per cent increase on the background it replaced.

## What the measurement says this asset is

Scored against the background it replaced, by
`scripts/assets/background_candidate_ingest.py`, with controls:

| File | Declared relationship | Pearson r | Cells moved | Class |
|---|---|---|---|---|
| `bg_original.jpg` | "your original file for reference" | 1.0000 | 0.0% | identity |
| `bg_original_enhanced.jpg` | "keeps the exact same scene" | 0.9966 | 0.0% | ENHANCEMENT |
| **`bg_improved_v1.jpg`** (this file) | "alternative composition" | **0.3850** | **58.2%** | **NEW DESIGN** |

So this is a new design, not an enhancement, and it was adopted as one knowingly.
The classifier that produced that verdict has a seeded self-test
(`background_candidate_ingest_selftest.py`, convention p) proving it returns
ENHANCEMENT on real enhancements, so the verdict is a finding rather than a
default.

**The input was our own art.** `bg_original.jpg` in the supplied drop is
byte-identical to the background this replaced, sha256
`23e63e54e99aa0b03ddd52649e7838af33c6661121c1da2563ad81342c57539f`. The
commission started from the shipped asset and moved a long way from it; it did
not start from nothing.

## Tonal profile, against the background it replaced

Mean luminance by region, after the shipping encode:

| Region | Previous | This asset | Delta |
|---|---|---|---|
| Full frame | 76.59 | 73.61 | **-2.98** |
| Title band, top 18% | 57.58 | 40.85 | **-16.73** |
| Stage band, middle 64% | 84.99 | 91.07 | **+6.08** |
| HUD strip, bottom 18% | 65.72 | 44.34 | **-21.38** |

The two bands the interface draws over both got DARKER, which is the favourable
direction: the HUD's readouts and the title wordmark are light on dark, so a
darker plate behind them is more contrast, not less, and the stage band brightening
slightly works with the frame's cyan rather than against it.

## The Overdrive variant

`bg_overdrive.jpg` is **derived from this file**, not supplied alongside it, by
`scripts/assets/background_overdrive_derive.py`. This matters and it is the one
thing an adoption here can silently break: `App.svelte` crossfades the Overdrive
image in over the base while the feature plays, so if the base changes and the
variant does not, triggering the feature cuts to a different city and cuts back.

The derivation applies the RELATIVE difference between `backgrounds.py`'s two
grades, so the Overdrive treatment is the project's own and traceable to it:

| Parameter | Relative value | From |
|---|---|---|
| Contrast | 1.0556 | 1.14 / 1.08 |
| Colour | 1.1017 | 1.30 / 1.18 |
| Brightness | 0.9400 | 0.94 / 1.00 |
| Channel R,G,B | 1.1800, 0.9200, 1.0566 | overdrive / base, per channel |
| Vignette | 0.1935 incremental | (0.50 - 0.38) / (1 - 0.38) |

Output 269,186 bytes, sha256 `909dbeefd304b10b...`, recorded in
`reports/qa/background_overdrive_derive.json`.

## Bundle effect

| | Bytes |
|---|---|
| `bg_base.jpg` | 277,172 to 273,173, **-3,999** |
| `bg_overdrive.jpg` | 280,904 to 269,186, **-11,718** |
| **Net** | **-15,717** |

## What was NOT adopted

Candidate v2 (`bg_improved_v2.jpg`) was ingested, captured and offered alongside
this one; the owner chose v1. It measured r 0.3455, also a new design, and ran
brighter in every region including +14.72 under the HUD strip.
`bg_highquality_1920x1080.jpg` was scored as a control and never ingested. All
three, with their hashes and measurements, are in
`reports/qa/background_candidate_ingest.json`, and the candidate files
themselves are recoverable at commit `6eaea1a`.
