# Session Report - R090 SQUARE RE-RENDER SWAP: five symbols in, the tile plate refused because its target is the one that is not square (2026-08-24)

Brief saved verbatim: `reports/briefs/FS_FABLE_R090_SQUARE_RERENDER_SWAP_Prompt.md`. Branch:
`claude/r090-square-rerender-swap`, review lane, held for Fable and the owner. **THE FENCE
HELD: zero raster additions or modifications staged, asserted by a gate. The swaps live only
in the working tree and are never committed. output/ untouched and read only, no generation,
no API call, no kit packaged. The owner's dev server on 5173 was never touched; this session
ran its own on 4173 and stopped it.** Locked paths not involved.

## Preconditions: all met

| Precondition | State |
|---|---|
| On `main`, up to date | Yes. R089 merged as `509a2902`; checked out `main` and pulled |
| `arc2-baseline` | **`618b711eebcaed7682aca4f63b16b24911d5c456`**, unchanged |
| Square masters present | Yes, at `.scratch/art-review/chatgpt-square-rerender-480-masters/`, seven files, all 480x480 RGB |
| Previous placeholders present | Yes, all fifteen from R086/R087/R089 carried across the branch switch |

## TASK: the swaps

Sources run through the AssetForge primitives (`green_key_knockout`, then
`resize_premultiplied`) with the 1% aspect guard applied on the source before any resize,
exactly as `ingest.py` applies it.

### SWAPPED, working tree only (5)

| Row | Source | Shipped path | Transform | Drift |
|---|---|---|---|---|
| M2 | `01-m2-premium-coilover-strut.png` | `symbols/m2.png` | 480x480 to 240x240 | 0.00% |
| M3 | `02-m3-holographic-dash-readout.png` | `symbols/m3.png` | 480x480 to 240x240 | 0.00% |
| L1 | `03-l1-jewel-cut-lug-nut.png` | `symbols/l1.png` | 480x480 to 240x240 | 0.00% |
| L2 | `04-l2-iridium-spark-plug.png` | `symbols/l2.png` | 480x480 to 240x240 | 0.00% |
| L3 | `05-l3-forged-piston.png` | `symbols/l3.png` | 480x480 to 240x240 | 0.00% |

**The square re-render did exactly what it was for.** These five were WRONG-SPEC at R086 and
again at R089 because their masters were portrait or landscape (1016x1548, 1536x1024) against
square 240x240 rows. Re-rendered square, all five pass at zero drift.

**Independently verified** by three parallel adversarial checks, which re-measured rather than
trusting any claim:

- All five are **bit-identical (maxdiff 0)** to a fresh re-run of `green_key_knockout` then
  `resize_premultiplied(240,240)` on the named masters, so the pipeline description holds.
- All five: 240x240 RGBA, all four corners alpha 0, single connected subject at alpha 128,
  **no alpha inversion, no missing chunks, no fragmentation**. L3's two interior holes are
  the connecting-rod big-end bore and the wrist-pin bore, correctly keyed apertures rather
  than defects.
- **Green fringe: every pixel with green dominance at or above 128 carries alpha 22 or less**
  (13 to 46 pixels per file). Composited over the cell background the worst single pixel
  lifts green by 7.6%, invisible at the 82px render size. The R083 post-downscale halo did
  not return.
- The batch record's Pixel QA table **verifies exactly**, all six bounding boxes and
  foreground percentages, once read in `PIL.getbbox()` exclusive convention.

### REFUSED (1)

| Row | Source | Target | Drift | Disposition |
|---|---|---|---|---|
| Tile Plate | `06-tile-plate.png` 480x480 | `symbols/tile_plate.png` **244x204** | **16.39%** | WRONG-SPEC, skipped |

**The refusal is structural, not a bad render.** The square re-render pass fixed the five
symbols precisely because their targets are square; the tile plate is the one asset in the set
whose target is not. 16.39% is 16.4 times the 1% gate, nowhere near marginal. Three further
findings confirm that shipping it would be wrong in every available form:

1. **`ingest.py` has no pad, crop or letterbox path anywhere.** `--allow-aspect-change` only
   skips the raise; delivery is unchanged, so it would **squash the bezel to 83.607% of
   correct height**, turning every circular bolt head into an ellipse.
2. **A centre crop is not safe.** Cropping 480x480 to 480x401 removes rows 0 to 38 and 440 to
   479. The plate's ink starts at row 19 and ends at 461, so the crop cuts **20px into the
   plate at the top and 22px at the bottom, 6.652% of its own ink**, shearing both rails, both
   centre latches and all four corner brackets. SY-13's `safe_margins` says the corner radius
   must match the grid, and the crop removes the corners outright.
3. **The CSS makes aspect matter more, not less.** `.tile-plate` is `object-fit: fill` into a
   120x100 cell, so a square master squashes **16.667% vertically at runtime** whatever ingest
   does. The gate is protecting exactly the right thing.

**RECOMMENDED REMEDY: re-render the plate on a 732x612 canvas** (3x of 244x204, drift
0.0000%), pure `#00FF00`, with the bezel filling the canvas **edge to edge, zero margin**. The
current candidate leaves 21/21/19/18px of transparent margin, and SY-13 requires it to fill
the cell. Then `ingest.py` runs unmodified and unflagged, needing no new code.

**A separate question that is the owner's, not the builder's:** this candidate is a heavy
ornate mechanical bezel with corner brackets, bolt heads, latches and vent slots, where the
shipped plate is a flat three-colour dark navy rounded rectangle. It sits behind all 35 tile
slots with no per-symbol branch, and SY-13's own language says it must stay subordinate to the
symbols. Aspect is the blocking defect; design weight is a second and larger decision.

## The M2 headroom question, and why it is not a regression

I went looking for a defect here and the evidence would not support it. Recording the whole
chain because the conclusion reverses the obvious reading.

**The observation.** SY-08 requires 3px of top headroom at 240 and R087 encoded it as
`idle-coil translateY(-1.25%)`. Top alpha padding of the new m2, measured on the delivered
file:

| threshold | new m2 | verdict against the 3px contract |
|---|---|---|
| any alpha | **0px** | short by 3.00 art px = 1.025 design px |
| alpha 128 | 2px | short by 1.00 art px = 0.342 design px |
| alpha 254 | **3px** | **meets the contract exactly** |

What crosses the box top is a 28px-wide antialiased Lanczos shoulder at roughly half opacity.

**The consequence, measured in the RUNNING game rather than derived.** Every relevant
`overflow` is `visible` (`.symbol-cell`, `.tile-inner`, `.reel-strip`), so nothing clips. At
the peak of the animation the image box still sits **7.603px clear of its own cell top** for
`idle-coil` and **6.304px** for `idle-pump`; `leavesCell` is false for both. The excursion
lands inside the cell's own 9px top inset, over the symbol's own dark plate. For calibration
in the same component, `win-pop scale(1.22)` lifts the identical element about nine times
further on every single win and has always shipped unclipped.

**Why it is not a regression.** The same any-alpha test **fails the OLD l3 harder** (0px
against a 7px pump requirement) than it fails the new m2, and the old l3 is the very asset
R087 authored `-2.9167%` for. The NEW l3 measures 8px any-alpha and is the first version that
actually clears its own contract. So **l3 went from violating to clearing, and m2 from
clearing to grazing**. Top padding old to new: m2 7 to 0, m3 6 to 53, l1 8 to 26, l2 8 to 8,
l3 0 to 8. Four improved, one grazes.

**Verdict: a contract violation on the strictest reading, with no visible effect. No code
change, no owner decision.** Nudge the master's top edge from row 3 to row 8 or 10 of 480 at
the next natural re-render. The batch record's sentence "top edge positioned at pixel 3 to
preserve the requested idle-animation headroom" is a scale error: pixel 3 of 480 is 1.5px at
240, and the contract is met only by the downscale's edge ramp rather than by the stated
construction. Do not cite that sentence as evidence.

## TASK 3: report

- **Swapped 5, refused 1.** Zero rasters staged, asserted by a gate.
- **The working tree now carries 20 modified placeholder rasters**: the eight from R086/R087,
  the seven UI controls from R089, and these five symbols.
- `npm run build` exit 0.
- Local preview on 4173: the board renders all five new symbols alongside the earlier swaps,
  **zero console errors, zero page errors, zero missing-asset requests, no layout breakage.**
  The set reads as one family now, the same painted gunmetal and carbon with cyan and magenta
  accents, silhouettes distinct at cell size and no visible green.

## Verification

Records-only commit; the swaps are deliberately uncommitted. Close gates chained with `&&` per
(u.1), each exit code the direct left operand. Explicit paths per (k). Remote CI verified with
the full SHA per rule 10.

## ESCALATIONS

**E1 (R090). `ALPHA_SNAP_FLOOR` in `scripts/assets/assetforge/ingest.py` does not clear the
alpha its own docstring says it clears.** The pixel array is float32 and the constant float64,
and the comparison is strict, so **alpha 2 survives**, 76 to 119 pixels per delivered file.
More to the point the floor is too low regardless: the real near-key fringe sits at **alpha 3
to 16**, entirely above it. A floor around 23/255 would clear all of it. This is systemic and
predates R090; the same residue already shipped in the R086 swaps. Worth its own brief, and it
is a gate-and-tooling change so it is review lane.

**E2 (R090). `ingest.py`'s aspect refusal message is misleading.** It advises "pass
`--allow-aspect-change` if the crop is deliberate", but the flag performs **no crop**; it only
skips the raise and then squashes. A later session could take the message at its word and ship
distorted art believing it had cropped. One-line fix, not made here because this session's
brief is a swap.

**E3 (R090). The tile plate needs a re-render at 732x612 edge to edge**, per the analysis
above, and separately an owner decision on whether an ornate bezel is wanted behind all 35 tile
slots at all.

**E4 (R090). The five files grow the symbol payload 126,745 to 209,632 bytes, up 65%.** Small
absolutely, and placeholders are not the shipping set, but it is a direction nobody had
recorded and the kit has a size budget.

**E5 (R090). `m1.png` is now the only glow-era symbol left in the directory**, untouched since
2026-07-24 and carrying 60.2% soft-edge pixels where the swapped set carries 7 to 20%. The
symbol set is one asset short of visual consistency, and no M1 candidate exists in any batch.

R089's E1 through E3 stand, R087's E1 through E4 stand, as do R086's E2 through E5 and the
older open threads recorded there.

## FOR THE NEXT SESSION

**The working tree is LEFT SWAPPED with twenty placeholder rasters, deliberately, so the owner
can run `npm run dev` from `frontend/` and look.** The symbols now form a consistent set except
`m1.png`; the tile plate and background are unchanged.

**RESTORE INSTRUCTION, to return the tree to HEAD before any kit build:**

```
git checkout -- frontend/public/assets/themes/future-spinner/symbols/wild.png \
                frontend/public/assets/themes/future-spinner/symbols/scatter.png \
                frontend/public/assets/themes/future-spinner/symbols/h1.png \
                frontend/public/assets/themes/future-spinner/symbols/h1_base.png \
                frontend/public/assets/themes/future-spinner/symbols/h1_spin.png \
                frontend/public/assets/themes/future-spinner/symbols/h2.png \
                frontend/public/assets/themes/future-spinner/symbols/m2.png \
                frontend/public/assets/themes/future-spinner/symbols/m3.png \
                frontend/public/assets/themes/future-spinner/symbols/l1.png \
                frontend/public/assets/themes/future-spinner/symbols/l2.png \
                frontend/public/assets/themes/future-spinner/symbols/l3.png \
                frontend/public/assets/themes/future-spinner/ui/gauge_face.png \
                frontend/public/assets/themes/future-spinner/ui/gauge_needle.png \
                frontend/public/assets/themes/future-spinner/ui/spin_button.png \
                frontend/public/assets/themes/future-spinner/ui/btn_turbo.png \
                frontend/public/assets/themes/future-spinner/ui/btn_bet_plus.png \
                frontend/public/assets/themes/future-spinner/ui/btn_bet_minus.png \
                frontend/public/assets/themes/future-spinner/ui/feature_button.png \
                frontend/public/assets/themes/future-spinner/ui/btn_menu.png \
                frontend/public/assets/themes/future-spinner/ui/btn_autoplay.png
```

Kit packaging stays forbidden while any placeholder differs from HEAD. Still open and unchanged
by this session: the backgrounds ruling WORKSHOP or TESTCELL, the background's own 4x upscale
problem, and the R088 pack on the owner's reissue.

Model and effort: one session, unattended, review lane, with a three-agent adversarial
verification pass over the artefacts, the headroom claim and the tile-plate refusal. No gate
failed.
