# Provider mark, candidate G: owner-supplied variant pack

## Provenance

| Field | Value |
|---|---|
| Origin | **Externally generated, commissioned by the owner** |
| Supplied | 2026-07-26, by the owner, as the third of three |
| Found at | `/Users/jt/Downloads/we_roll_spinners_logo/` (25 files), alongside `/Users/jt/Downloads/we_roll_spinners_logo_pack.zip` |
| Pack zip SHA-256 | `c15b047da6baaf6e300a66243bcb8f6d569915064f4f168397333e15c597ef79` (19,389,108 bytes) |
| Export source | `we_roll_spinners_1254x1254_transparent.png` |
| Export source SHA-256 | `1cbf3f72ad110f34b6d2903f69a26a513a3270a378d3f0977a121becd44dc4e4` |
| Export source dimensions | 1254x1254, 8-bit **RGBA** |
| Ingested by | `frontend/scripts/provider_mark_ingest_g.mjs` |
| Pack kept at | `design-system/brand/provider_mark/pack_g/`, all 25 files, hash-verified |

The delivery states its own origin in its README: the pack was generated from
`we_roll_spinners_original_with_green_bg.png` (1254x1254, solid green field) by removing
the background and producing sized variants, and it asserts that "the logo design itself
has not been altered". That claim is the supplier's, recorded as supplied; what this
ingest verifies independently is below.

## Why the exports are not built from the pack's own square crop

The pack ships `we_roll_spinners_1096x1096_square_transparent.png`, a purpose-made square crop. The exports here are NOT
built from it. They are built from the pack's highest-resolution transparent file using
the **same ink-centred square crop candidate f went through**, because JOB 2 compares f
against g and a comparison in which one side keeps its supplier's crop and the other
keeps ours is not a comparison of the artwork.

The supplier crop is measured anyway, for the record: 1096x1096, ink bounding box 1009x1096 at (43, 0), margins L43 R44 T0 B0, 0 partially transparent pixels. SHA-256 `935687c40987a964c738d5f249ecbe43ca7da4d98ca7c6e11273148fb75f7f1e`.

## Measurements, taken the same way as candidate f

| Measurement | Value |
|---|---|
| Distinct opaque colours | **546,589** |
| Most used | `#000000` (3,206 px), `#ffffff` (1,576 px), `#000001` (854 px), `#fffffe` (619 px), `#fefffe` (571 px), `#000002` (568 px), `#000003` (479 px), `#fefefe` (383 px) |
| Alpha | 907,662 opaque, **0 partial**, 664,854 clear |
| Ink bounding box | 1009x1096 at (137, 56) |
| Margins | left 137, right 108, top 56, bottom 102 |
| Centring skew | horizontal +29 px, vertical -46 px |
| Silhouette radius | mean 536.6, min 475, max 570, deviation **17.7%** |
| Master crop | 1206x1206 at (38, 1) |

### What those numbers say, against candidate f

**The alpha is hard-edged, the same finding f carried.** Zero partially transparent
pixels in the whole file: every pixel is either fully opaque or fully clear, so the
source carries no antialiasing on its silhouette and the resample has to supply all of
it. This was recorded against candidate f as a thing to watch, and it is equally true
here. It is worth stating plainly because the pack's README describes these files as
having had "background removed", and a hard alpha is the signature of exactly that: a
key applied to a flat field rather than art drawn on transparency.

**The colour count is 546,589, not three.** Candidate f uses exactly three flat
colours. This is continuous-tone artwork: gradients, glow falloff and antialiasing. That
is not a defect, but it is the property that decides how the mark behaves when it is
resampled small, which is what JOB 2 measures rather than argues about.

## The pack, as delivered

All 25 files, hashed at ingest and copied in whole to `pack_g/`:

| File | Bytes | SHA-256 |
|---|---|---|
| `README.txt` | 1,897 | `1722df1c5c12f9a9aac200aa9c14d82471bab69fff1553ac197c99585905328c` |
| `we_roll_spinners_1024x1024_blackbg.jpg` | 617,452 | `9a737333d0882f113f56771e3e8f3ec1e56a08b9263169e20905c0e789d262cb` |
| `we_roll_spinners_1024x1024_transparent.png` | 1,430,411 | `778ee5eab54d65c13568cd10d38e4b7d11ff80b11e75809746933b98b2ce6847` |
| `we_roll_spinners_1024x1024_whitebg.jpg` | 615,363 | `027acf1f913761186272466935eaf8f7e085cf85b3ba70982f36ef3a01386f16` |
| `we_roll_spinners_1096x1096_square_transparent.png` | 2,134,329 | `935687c40987a964c738d5f249ecbe43ca7da4d98ca7c6e11273148fb75f7f1e` |
| `we_roll_spinners_1254x1254_blackbg.jpg` | 850,339 | `77dd03252e50fa9e4e4f614c222b0b9e415b8b454d87adafad32c053db5bb811` |
| `we_roll_spinners_1254x1254_transparent.png` | 2,649,613 | `1cbf3f72ad110f34b6d2903f69a26a513a3270a378d3f0977a121becd44dc4e4` |
| `we_roll_spinners_1254x1254_transparent.webp` | 203,876 | `2add8dd513c24711da05716f8e36ecc4f1f16a3df4c1ededc1ce2a73841bce5b` |
| `we_roll_spinners_1254x1254_whitebg.jpg` | 848,421 | `09bd6ec6204bed08b6da844bb6f5ee8eaa77309477b46c7cea700a35490a5d67` |
| `we_roll_spinners_128x128_transparent.png` | 32,094 | `5d91b00b321d68d4c1a750815617a1c01f2f78048d2db8382315aa592b03a84a` |
| `we_roll_spinners_256x256_transparent.png` | 114,538 | `b8c08517319491681e6401f53b78ef9adfd0fea43dae03320e556f8373f62b0e` |
| `we_roll_spinners_256x256_whitebg.jpg` | 59,834 | `9a6dafaad90d5316db322d0ca085e6033c8cf04e90a4a150f211915389ad61d3` |
| `we_roll_spinners_32x32_transparent.png` | 2,806 | `734e907f79ee75ae04f7d83842cc913a77da0e875e24296d90bf48719c1c91c0` |
| `we_roll_spinners_512x512_blackbg.jpg` | 200,674 | `ce75d8b2cc8ac99b27f1db478f0fc993fd8336b6a64fe6a4975293ba56f6bfe8` |
| `we_roll_spinners_512x512_transparent.png` | 406,316 | `dc21a285667fdac8c59e9547c4124d1a63536ac9fe1e312e0aeca3df8b82fc50` |
| `we_roll_spinners_512x512_transparent.webp` | 51,060 | `d6ac9d3e15bd8463f00e372aa9916a6f96006ad01ff4b316d9e29542a80e84ab` |
| `we_roll_spinners_512x512_whitebg.jpg` | 200,128 | `4349637b17f2b8e7f50174ab89d2688a81e0548c90ab05e33a1a0dc416a916bf` |
| `we_roll_spinners_64x64_transparent.png` | 8,957 | `2ecaceea9ce722ca24e1353c94d059682fc91a87ac6f7a9edb94d46a492afeec` |
| `we_roll_spinners_bw_1254.png` | 46,336 | `4e87f494ed9903f99b8cb696237d203b1a7ec2b18d5d0209d7bc9c236e346886` |
| `we_roll_spinners_favicon.ico` | 88,878 | `c30efc38f98c8ddc05af5dba0754ac1cc88958f609c99eb9ed80cbe36bbc60cb` |
| `we_roll_spinners_gray_blackbg.jpg` | 370,760 | `768eed8158013b93c0a26df5e86568f3e992c69bb0ee061eed2e025dff1030b5` |
| `we_roll_spinners_logo.pdf` | 3,061,657 | `8bbf9410d52eeb4b3cf17cefbeec9a3662674a784414ca19c0aab58c071ecf2e` |
| `we_roll_spinners_logo_whitebg.pdf` | 863,070 | `c84bf1b315ea088ee1119d9db4a157036daf9d14dc848cc1268b5f4099014da9` |
| `we_roll_spinners_original_with_green_bg.png` | 2,369,988 | `8e19c2a0ce8e0cd5e13f6e7dd810d2a5546060e45090802816d168e4a65397aa` |
| `we_roll_spinners_trimmed_transparent.png` | 2,299,056 | `429a751c3908bc9d0bcaec3fd72613a2e2262096a97fe9742cc3445f413725d4` |

## Exports built by this ingest

| File | SHA-256 |
|---|---|
| `provider_mark_g-owner-pack_master_1206.png` | `255f117b1f8241504ae6293ced7f6b61bcc92902e3ab1e4be29636073507b723` |
| `provider_mark_g-owner-pack_512.png` | `c944dfa500dc635cfefcc26b00ef0eeec744a4edc22b5cd8baf8ce69ddde16d6` |
| `provider_mark_g-owner-pack_96.png` | `956ad9a1220905977140ce52b4b84056dacdf5c2ec71c3480adb2909a3bc27ea` |
| `provider_mark_g-owner-pack_48.png` | `6ad026145a4eb4c4c9d0c11f3d80f48be235dafca21d7eff07c2d3e098ce32da` |

## Adoption

**Not decided by this ingest.** The provider-logo decision is derived in JOB 2 by
measuring f against g at the sizes the platform actually renders, and it is recorded in
`PROVIDER_LOGO_DERIVATION.md` beside this file. This document records what arrived and
what it measures, nothing more.
