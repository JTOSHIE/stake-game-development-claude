# Submission tile delivery set

Built by `frontend/scripts/tile_delivery_build.mjs`. Names follow the platform
convention quoted verbatim from the dated mirror at
`docs/stake-engine-live/game-tile-requirements.md` (fetched 2026-07-04).

| Delivered as | Platform rule | Role | Size | SHA-256 |
|---|---|---|---|---|
| `FutureSpinner-BG.jpg` | `GameTitle-BG.format` | Background image | 373 KB | `493ee21658d126d7...` |
| `FutureSpinner-FG.png` | `GameTitle-FG.png` | Foreground image | 423 KB | `0dede15b7cac8ac0...` |
| `WeRollSpinners-Logo.png` | `ProviderName-Logo.png` | Provider Logo | 39 KB | `66c692daf3092935...` |

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
- `WeRollSpinners-Logo.png` from `design-system/brand/provider_mark/provider_mark_f-owner-transparent_master_1024.png`

## Provider logo: ADOPTED

The provider logo is candidate **f**, the owner's second supplied mark, adopted
2026-07-26 on the instruction "Go with F". It is delivered at its NATIVE 1024
resolution: f's master is a full-frame crop of the owner's file at its own
size, so this asset has been through no resampling at all.

It carries a real alpha channel, so the platform's transparent-background rule
is met by the artwork itself rather than by a keying step performed on it, and
it uses exactly three colours: `#00FFFF` and `#FF00FF` verbatim from the brand
palette plus `#0A0A14` as structural near-black.

Candidates a, b, c, d and e are superseded and kept. The comparison evidence
stays at `reports/screens/provider-mark/`. To change the adopted mark, re-point
the logo row in this script and re-run; nothing else in the set changes.

**One thing still belongs to the owner**: the actual upload. The provider logo is
a one-time square upload in Team Settings Branding, and the tile layers go into
the Tile Editor. Neither can be done from here.
