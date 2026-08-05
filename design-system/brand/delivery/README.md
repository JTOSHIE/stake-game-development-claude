# Submission tile delivery set

Built by `frontend/scripts/tile_delivery_build.mjs`. Names follow the platform
convention quoted verbatim from the dated mirror at
`docs/stake-engine-live/game-tile-requirements.md` (fetched 2026-07-04).

| Delivered as | Platform rule | Role | Size | SHA-256 |
|---|---|---|---|---|
| `FutureSpinner-BG.jpg` | `GameTitle-BG.format` | Background image | 373 KB | `493ee21658d126d7...` |
| `FutureSpinner-FG.png` | `GameTitle-FG.png` | Foreground image | 423 KB | `0dede15b7cac8ac0...` |
| `FutureSpinner-Tile.png` | `no published rule, matches observed published geometry` | Composed tile, flat | 465 KB | `741e77face74f7e9...` |
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
- `FutureSpinner-Tile.png` from `design-system/brand/tile/tile_composed_master.png`
- `WeRollSpinners-Logo.png` from `design-system/brand/provider_mark/provider_mark_f-owner-transparent_master_1024.png`

## Two forms of the tile, and why both ship

**We do not know which form the portal's Design Thumbnail editor takes, because
nobody here has opened it: the game card still shows its placeholder.** So the set
carries both, and the owner uses whichever the editor asks for.

| If the editor wants | Use |
|---|---|
| a single composed image | `FutureSpinner-Tile.png` |
| separate layers | `FutureSpinner-BG.jpg` and `FutureSpinner-FG.png` |

`FutureSpinner-Tile.png` is the owner's composed artwork, byte-identical, at
**408x546**. That is the DE FACTO tile geometry of published games, measured across a
live sample of published assets rather than read off the docs, which give no
dimensions at all. **The platform publishes no tile dimension**, so this is a convention
we measured and not a requirement we were given:

<!--CHECK: !grep "platform's published tile geometry" CLAUDE.md-->
<!--CHECK: !grep "platform's own published tile geometry" CLAUDE.md-->
<!--CHECK: !grep "platform's own published tile geometry" design-system/brand/tile/GENERATION_NOTE_composed_master.md-->
<!--CHECK: !grep "platform's published tile geometry" design-system/brand/tile/TILE_LAYER_DERIVATION.md-->
<!--CHECK: !grep "platform's own published tile geometry" WRS_MASTER_DOCUMENT.md-->
 see `docs/stake-engine-live/2026-07-26/published-tile-geometry.md`.
It is also the first portrait tile asset the project has held; BG and FG are both
landscape.

**The layers could not be derived from the composed master, and that was tested
rather than assumed.** Roughly a fifth of the frame would have to be painted to
recover a complete background behind the character, the type is baked into the
pixels, and a third of the character silhouette has no confident matte edge. The
measurements and the proof sheet are in
`design-system/brand/tile/TILE_LAYER_DERIVATION.md`. If the editor wants layers, the
composed master is the **reference** for how BG and FG should sit, not a source to
cut them from.

## Provider logo: ADOPTED, and re-confirmed by measurement

The provider logo is candidate **f**, the owner's second supplied mark, adopted
2026-07-26 on the instruction "Go with F". It is delivered at its NATIVE 1024
resolution: f's master is a full-frame crop of the owner's file at its own
size, so this asset has been through no resampling at all.

It carries a real alpha channel, so the platform's transparent-background rule
is met by the artwork itself rather than by a keying step performed on it, and
it uses exactly three colours: `#00FFFF` and `#FF00FF` verbatim from the brand
palette plus `#0A0A14` as structural near-black.

**Candidate g, a full variant pack, arrived later the same day and was tested
against f rather than filed beside it.** f took 3 of 3 legibility measures at 32px
and 2 of 3 at every other size on the ladder, so the delivered file did not change.
The working is in `design-system/brand/provider_mark/PROVIDER_LOGO_DERIVATION.md`.
g is superseded for the portal mark and adopted as the studio brand set for
everything else: favicon, site and print.

Candidates a, b, c, d, e and g are superseded and kept. The comparison evidence
stays at `reports/screens/provider-mark/`. To change the adopted mark, re-point
the logo row in this script and re-run; nothing else in the set changes.

**One thing still belongs to the owner**: the actual upload. The provider logo is
a one-time square upload in Team Settings Branding, and the tile goes into the
Tile Editor. Neither can be done from here.
