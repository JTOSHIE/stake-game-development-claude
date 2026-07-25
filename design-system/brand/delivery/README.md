# Submission tile delivery set

Built by `frontend/scripts/tile_delivery_build.mjs`. Names follow the platform
convention quoted verbatim from the dated mirror at
`docs/stake-engine-live/game-tile-requirements.md` (fetched 2026-07-04).

| Delivered as | Platform rule | Role | Size | SHA-256 |
|---|---|---|---|---|
| `FutureSpinner-BG.jpg` | `GameTitle-BG.format` | Background image | 373 KB | `493ee21658d126d7...` |
| `FutureSpinner-FG.png` | `GameTitle-FG.png` | Foreground image | 423 KB | `0dede15b7cac8ac0...` |
| `WeRollSpinners-Logo.png` | `ProviderName-Logo.png` | Provider Logo | 31 KB | `676d7d1317e061be...` |

**Background plus foreground: 796 KB against the 3 MB ceiling.** Within the limit. The platform states "Please ensure that the background & foreground images don't exceed more than 3MB combined", and the provider logo is not part of that sum, so it is excluded from the total above.

## Why these are copies rather than renames

The masters under `design-system/brand/tile/` are named for what they are, and
two committed `GENERATION_NOTE` files describe how each was produced BY THOSE
NAMES. Renaming in place would orphan that provenance to save a duplicate of a
file already held. This directory is the SUBMISSION SET; `tile/` and
`provider_mark/` remain the working set.

## Source of each file

- `FutureSpinner-BG.jpg` from `design-system/brand/tile/tile_background_master.jpg`
- `FutureSpinner-FG.png` from `design-system/brand/tile/tile_hero_full.png`
- `WeRollSpinners-Logo.png` from `design-system/brand/provider_mark/provider_mark_d-purpose-drawn_512.png`

## Not yet adopted

The provider logo here is candidate **d**, the purpose-drawn mark. The owner
eye-call across a, b, c and d is still open
(`reports/screens/provider-mark/48px-legibility-comparison.png`). If the owner
picks a different candidate, re-point the logo row above and re-run; nothing
else in the set changes.
