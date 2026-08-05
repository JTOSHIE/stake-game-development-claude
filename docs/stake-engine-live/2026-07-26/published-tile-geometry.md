<!-- Stake Engine published-asset survey -->
- topic: published-tile-geometry
- resolved_url: https://fair.stake-engine.com/catalogue plus the per-game `game.image` assets it lists
- fetched: 2026-07-26
- rendered_via: direct HTTP, PNG headers only (Range: bytes=0-63)
- looks_real: true

# Published tile geometry, measured

**TWO CORRECTIONS, 2026-08-05, S2-C217.**

**1. This is OUR SURVEY, not a third-party capture, and it is filed in the wrong place.**
Its own front matter says so: `rendered_via: direct HTTP, PNG headers only`. It is the only
file in this dated directory, and everything else under the mirror root is a verbatim
upstream capture that is deliberately NOT kept current and NOT scanned by
`scripts/qa/doc_currency_gate.mjs`. **So this measurement of ours is excluded from the gate
by where it sits.** Moving it is a rename that touches every citation of it, so it is
reported here rather than done in passing.

**2. 408x546 was described as the platform's PUBLISHED geometry across six live documents.**
The platform publishes no tile dimension at all. It is a DE FACTO convention that we
measured from published games. All six now say so, and the anchors below hold the wording:

**The anchors that hold this wording live in `design-system/brand/delivery/README.md`,
NOT here.** They were written here first and PROVED INERT: seeding the old phrase back into
`CLAUDE.md` left the gate green, because this directory is excluded from scanning. That is
the same defect as correction 1 above, found by testing the anchor instead of trusting it.

The dated ledgers under `reports/qa/session2_audit/` and the walk shards keep the old
wording, because they are records of what was written then.

## Why this capture exists

**The platform publishes no pixel dimensions for the game tile.**
`docs/stake-engine-live/game-tile-requirements.md` asks for a background, a foreground and
a provider logo, gives the naming convention and a 3MB combined ceiling for background
plus foreground, and says nothing about size beyond "high resolution". Section 3c of
`WRS_MASTER_DOCUMENT.md` has carried that gap since JOB 7, recording the AssetForge
scaffold's tile dimensions as "provisional defaults, not an official number".

The number is not published, but it is **observable**. Every published game exposes its
tile through the public unauthenticated FAIR catalogue as `game.image`. This survey reads
the dimensions out of those assets' own headers.

## Method

Sampled evenly through the catalogue rather than taking the first N, so the result is not
one publisher's back catalogue. Only the first 64 bytes of each asset were requested, so
this reads headers rather than downloading the platform's artwork.

| Field | Value |
|---|---|
| Games in catalogue | 2,439 |
| Carrying a tile image | 2,384 |
| Sampled | 120 |
| Headers decoded | 87 |
| Unreachable at sample time | 33 |

## Result

| Dimensions | Count | Share of decoded |
|---|---|---|
| **408x546** | 81 | 93.1% |
| MP4 (animated tile) | 2 | 2.3% |
| JPEG (dimensions not read) | 1 | 1.1% |
| 500x500 | 1 | 1.1% |
| 1024x1024 | 1 | 1.1% |
| 1012x933 | 1 | 1.1% |

**408x546 is the DE FACTO tile geometry of published games**, at 93.1% of the decoded
sample: 81 of 87 decoded assets in an even 120-game sample. **The platform states no
dimension anywhere**, so this is MEASURED and is not a published requirement. Corrected
2026-08-05: this line previously called it "the platform's published tile geometry", which
attributes to the platform a number it has never published.
It is portrait. The stragglers are a handful of odd sizes and a small number of animated
tiles delivered as MP4 rather than as a still image, which is itself worth knowing and is
not something the requirements page mentions either.

## The second observation, which matters more than the first

**The provider logo is not drawn on the published tile.** Inspecting decoded tiles
directly: the game title is set in large type across the lower third, and the publisher
appears beneath it as **letterspaced capital TEXT**, not as the supplied logo image.
Scrollkeeper renders `PAPERCLIP GAMING` as type; Lokis Vault renders `VALKYRIE` as type.

So the three assets the requirements page asks for do not map one-to-one onto what the
tile shows. Background and foreground are composited into the tile. The provider logo is
used somewhere else, and nothing we have captured shows where or at what size. That gap
is the reason `design-system/brand/provider_mark/PROVIDER_LOGO_DERIVATION.md` builds its
size ladder from labelled anchors rather than claiming a rendered size it cannot observe.

## What follows for us

The owner-supplied composed tile master is **exactly 408x546**
(`design-system/brand/tile/tile_composed_master.png`), so it lands on the platform's own
published geometry rather than near it. Everything the repository held before it was
landscape: the background master is 2048x1152 and the hero foreground 4159x1875.

**This does not retire the layered assets.** The requirements page asks for background and
foreground as separate files and the portal's Design Thumbnail editor takes layers, so
both forms are carried in the delivery set. See
`design-system/brand/tile/TILE_LAYER_DERIVATION.md`.
