
# Session Report - R105 RUNTIME-TRUE INTAKE: the banner pair is committed, FX-01 is closed, and the particle gap became a design gap (2026-08-25)

Brief saved verbatim: `reports/briefs/FS_FABLE_R105_RUNTIME_TRUE_INTAKE_Prompt.md`. Branch:
`claude/r105-runtime-true-intake`, review lane. **Seven workstreams, all handled. Guards
untouched and still refusing at exit 2. No kit packaging. The incoming art directory was read
only.**

**One raster was committed, under the pairing path this brief explicitly authorises.** No
placeholder was swept in: the commit is exactly two files.

---

# WORKSTREAM 1 - THE BANNER PAIR: COMMITTED

## 1.1 State on arrival

The R104 pair survived the branch switch intact: the raster untracked, the CSS line unstaged,
the `url()` present in the working copy and absent at HEAD.

## 1.2 The decision: OPTION A, commit both together

**Verified CI-safe BEFORE committing rather than discovered after:**

| Risk | Finding |
|---|---|
| `asset_reference_gate.mjs` requires every referenced asset in dist | satisfied once the raster is committed |
| `build_diet_verify.mjs` fails any 404 | satisfied, same reason |
| pruned-path check | `assets/themes/future-spinner/ui/` is **not** in `PRUNED_PREFIXES` |
| `KEEP_UI` allowlist | guards `assets/ui/`, a **different** tree; does not apply |
| dist budget | 63,873 bytes against **25 MB** |
| HUD geometry gates | `hud_banner_spec_check.mjs` asserts the nine CONTROL boxes; `control_row_symmetry_gate.mjs` asserts the gaps. **Neither measures `.fs-panel`** |
| accessibility / locale | `pointer-events:none`, no text |
| `frontend/dist` dirtying | dist is gitignored; CI builds it |

**The six new finalists did not beat the placed one**, scored on visible pixels only:

| Candidate | cyan+magenta | saturation | luma |
|---|---|---|---|
| **placed** | **2.98%** | **0.061** | **19.9** |
| new F | 3.50% | 0.093 | 29.3 |
| new C | 3.89% | 0.070 | 35.7 |
| new B | 8.38% | 0.081 | 22.7 |
| new A / D / E | 8.66 to 20.46% | 0.154 to 0.199 | 32.7 to 41.6 |

So no re-swap, and the banner question is closed rather than carried forward again.

## 1.3 The commit

`af30f6cd`, **two files**: the raster and `HudOverlay.svelte`. Verified afterwards that the 22
placeholder rasters remained unstaged and unchanged.

## 1.4 Visual confirmation

Composited offline against the locked control boxes in both skins. **The accent border reads
cyan in base and pink in Overdrive**, the art shows as machined hardware through the visible
gaps, and the plates are opaque so Balance, Win and Bet text is unaffected by the art behind them.

---

# WORKSTREAM 2 and 3 - THE KIT, AND WHAT COULD BE TAKEN

**84 deliverables across seven groups.** Two intakes, and every refusal has a measured reason.

## FX-01, closed. The first FX row to close after three art batches.

| Check | Result |
|---|---|
| frame count | **6**, matching `GameGrid.svelte:1374` `steps(6)` |
| geometry | 1536x256 to 1200x200 is a **uniform 1.28x** downscale, **0.00% aspect drift** |
| frame boundaries | all seven land on integers, so no frame bleed |
| intent | a holo flicker sheet for M3, which is the **owner-ratified R086 correction** |

**A THRESHOLD ARTEFACT NEARLY COST THIS.** Three frames read 0.0% ink and I was about to call
the sheet half-empty. Those frames are 31 to 39 KB, which no blank PNG is. My metric counted
alpha at or above 128; the frames ramp **max alpha 72, 115, 186, 229, 255, 78**, exactly what a
flicker should do. **The sheet was correct and the instrument was wrong.**

Swapped working-tree-only. The file grew 19,793 to 149,859 bytes, painted alpha against a
generated flame; recorded because it is a real size change, though trivial against the budget.

## The refusals, each on a measurement

**FX-02, refused on INTENT despite perfect geometry.** The 4-frame impact sheet is 1024x256,
which downscales uniformly to the required 800x200 at 0.00% drift. **It is a reel-stop impact
and FX-02 is the L2 Blade Fuse filament arc.** Geometry is not identity. Taking it would have
put the wrong animation on a symbol.

**FX-03, refused on geometry.** Five frames at last, but 256x256 square against a 240x120
landscape target: 50% adrift, non-uniform, would squash.

**The particle rows, refused, and the gap CHANGED CHARACTER.** 24 sprites arrived at 32, 64, 96
and 128 px, so **the sizes are finally reachable**. The designs are not: the six are spark chip,
ember chip, cyan mote, magenta mote, glow chip, metallic flake. **There is no coin, no expanding
ring, no smoke wisp**, which is what FX-05, FX-06 and FX-07 are. The one plausible match:

| | size | max alpha | coverage | saturation |
|---|---|---|---|---|
| incumbent spark | 32x32 | 255 | **60.5%** | **0.94** |
| kit spark chip | 32x32 | 255 | 16.2% | 0.20 |
| kit cyan mote | 32x32 | 255 | 31.9% | 0.29 |

**A materially fainter spark on a reel edge, and nothing asked for a quieter one.** Refused.
**The particle gap is now a DESIGN brief rather than a size brief**, which is a much easier thing
to commission: the sizes are solved.

**Paytable support, refused and now proven homeless.** `PaytableModal.svelte` has **2 `<img>`
tags and no `background-image url()` anywhere**. There is no panel raster target in the paytable
to aim at. Two kit assets are additionally fully opaque and would black out what sits behind them.

**Scene polish, refused.** Frame-level component work, unchanged from R104.

---

# WORKSTREAM 4 - FX AND PARTICLE STATUS

**Truly closed:** FX-01.
**Still needs ART:** FX-02 (a fuse arc, not an impact), FX-03 (5 frames at 240x120 landscape),
FX-05 coin, FX-06 expanding ring, FX-07 smoke wisp. FX-08 has a candidate that was refused on
weight.
**Still needs CODE:** every burst, ambient and transition asset in all three batches; there is no
overlay component to draw them.

The particle runtime is individual sprites, not an atlas: four separate files referenced
directly from `WinBanner.svelte`, `FreeSpinsPresentation.svelte` and `GameGrid.svelte`. **No
atlas packing is needed**, which removes one option from the previous brief.

---

# WORKSTREAM 5 - SHADOWS AND CHARACTER LAYERS

**5.1 The shadow blocker is now precise, and it is not the art.** Widths match their heroes
exactly, 680 and 2840. But `.char-layer` carries a **breathing transform**,
`translateY(-6px) scale(1.01)`, and the layer already holds `.depth-haze`, `.antenna-light` and
`.visor-glint`. **A shadow placed inside that layer lifts off the ground with the character.** A
contact shadow must stay planted, so the insertion point is a layer OUTSIDE the animated
wrapper, or a counter-animation. **That is a design decision, so it is documented rather than
guessed**, which is this brief's own stated fallback.

**5.2 The character layers now match the shipped hero exactly at 680x1344**, where the previous
kit's were 640-based. They are still externally designed art destined for the animation
pipeline, so they remain law-blocked. **They do materially reduce the cost of a law-amendment
route**: visor, eye and chest emissives registered to the shipped canvas means an amended route
would need no further art request.

---

# WORKSTREAM 6 - GUIDE AND TEXT

**6.1** All six restored icons still match HEAD. The guide still depicts the live controls.
**6.2** Nothing taken: no target exists.
**6.3** No new safe isolated fix was found this session; the R103 text items still need owner
wording decisions.

---

# WORKSTREAM 7 - PROGRAMME STATE

## 7.1 Recomputed

| Measure | Value |
|---|---|
| Working-tree modified rasters | **23** (22 placeholders + the FX-01 sheet) |
| Committed art this session | **1**, the banner, paired with its CSS |
| **REPLACE coverage** | **22 of 30 = 73.3%**, up from 70.0% |
| Runtime-true kit | 84 deliverables, 2 taken |
| Law-blocked | the character layers, unchanged |
| Wrong-spec remaining | FX-02 on intent, FX-03 on geometry |

## 7.2 BANNER STATUS: **COMMITTED**, as a pair, in `af30f6cd`.

## 7.3 Roadmap

**1. Immediate safe intakes:** none left in this kit. Everything remaining is blocked on art,
code or law.

**2. Art still required**, and the specs already exist in `docs/design/FX_REGENERATION_SPEC.md`:
FX-03 at 1200x120 in five 240x120 LANDSCAPE frames; FX-02 as an L2 filament arc, not an impact;
and the particle set as a **design** brief now that sizes are solved: a gold coin at 40x40, an
expanding ring at 128x128, a soft smoke wisp at 56x56, and if the spark is to be replaced, one
at the incumbent's weight rather than a fifth of it.

**3. Component work required**, cheapest first: the shadow layer outside the breathing wrapper;
a burst-overlay component, which unlocks assets from all three batches at once; paytable panel
targets, which do not exist at all today.

**4. Law and owner decisions:** the Spine amendment, still the cheapest path to a rig; SC-03's
target; the baked MAX in the guide icon; the background room; OpenAI pricing.

---

## Verification

Generate self-test **22/22**. Asset guard **11/11**. Ingest **17/17**. Doc currency **PASS, 0
new**. Locked paths **PASS**. Guards still refuse at exit 2.

## ESCALATIONS

**E1 (R105). The particle gap is a design gap now, not a size gap.** Four designs are named
above with their exact sizes.

**E2 (R105). FX-02's slot fits an asset that is the wrong thing.** Refused on intent; the risk
is that a future session matches it on geometry.

**E3 (R105). The shadow insertion point must sit outside `.char-layer`'s breathing transform.**

**E4 (R105). The character emissive layers now match the shipped canvas**, so a law amendment
would need no further art.

**Closed by this session:** R102-E2 and R104-E1 (banner), FX-01.

Model and effort: one session, unattended, review lane, seven workstreams. Two intakes, both
measured; every refusal carries its number. One instrument error caught before it rejected a
good asset.
