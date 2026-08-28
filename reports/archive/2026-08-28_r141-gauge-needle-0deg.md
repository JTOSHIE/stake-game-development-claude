
---

# R141 - THE GAUGE WAS BAKED 27.5 DEGREES OFF, AND THE FORMULA WAS INNOCENT (2026-08-28)

Sole live brief, unattended, review lane. Brief saved verbatim at
`reports/briefs/FS_R141_GaugeNeedle0deg_Prompt.md` per convention (f). Booted
from `main` at `59db1a08`, which already carried R138's idle float; R136, R139
and R140 ran in other sessions and are not this session's to report.

**One raster is in the diff.** The scope was a single file and it stayed that
way: `frontend/public/assets/themes/future-spinner/ui/gauge_needle.png` plus
the brief save. Zero source files, zero hero, zero `gauge_face.png`.

## The question the brief asked, and why the answer was NOT a formula edit

`GaugeMeter.svelte` computes `needleDeg = -110 + clamp((mult - 1) / 15) * 220`
and its comment says the needle sweeps -110 to +110 degrees through the top.
The brief supplied a replacement needle drawn at 0 degrees and permitted a
call-site correction **only** if ingest proved the bake was not 0.

Ingest proved it IS 0, so **the formula was not touched**. That is the whole
finding: the sweep arithmetic has been correct all along, and every meter
reading was 27.5 degrees clockwise of what the dial's own ticks say because
the ART was rotated, not because the maths was.

**Baked angle, before and after.** Measured on the rasters themselves with
three independent estimators, so no single definition of "the tip" carries the
claim. BEFORE is `git show 59db1a08:<path>`, the needle main shipped before
this session; AFTER is the file this session ships.

| Estimator | BEFORE | AFTER |
|---|---|---|
| Tip, furthest opaque pixel from the hub | **+27.750** | **+0.176** |
| Tip centroid, alpha-weighted, furthest 2% | **+27.776** | **+0.045** |
| Principal axis, second moments about the hub | **+27.577** | **-0.178** |

Convention (l.4) applies to the agreement as much as to the disagreement:
these three share an input, the raster, so they corroborate the ANGLE and not
the raster's provenance. What they establish is that the reading is not an
artefact of one tip definition. All three sit within 0.2 degrees of each other
before, and within 0.36 degrees of each other after, straddling zero.

**A DECIMAL CORRECTION TO THIS SESSION'S OWN EARLIER FIGURES.** The numbers
quoted while the work was in flight were +27.512 / +27.503 / 27.202 before and
+0.000 / -0.141 / -0.562 after. The table above is a fresh re-measurement at
close, with the alpha threshold stated (opaque is alpha > 128, the mass
estimators integrate alpha > 10), and it disagrees in the second decimal. The
instruments differ in threshold, not in conclusion, and the conclusion is
unchanged: about +27.6 degrees before, zero within a third of a degree after.
The fresh figures are the record; the in-flight ones are superseded.

**Corroboration that does NOT share the tip definition:** the alpha-mass
centroid moves from **x = 245.47** to **x = 232.50** against a canvas centre
of **232.0**. A needle pointing straight up puts its mass on the centreline,
and this one now does, to half a pixel.

**It is the same needle, rotated, not a redraw.** Opaque pixels **4767 -> 4759**,
a change of 8 pixels or 0.17%, which is resampling loss on a rotation. A
redrawn asset does not land that close.

## Ship the ingest OUTPUT, not the raw source

The source and the delivered file are NOT identical, and shipping the source
would have been the easy mistake. Ingest ran the real path and accepted the
row as **UI-02, classification REPLACE, `route: native`** with the reason
"source supplied its own cutout": `cleared_px 210096`, `clear_fraction
0.98257`, `soft_edge_px 1448`, `despilled_px 149`, `aspect_drift 0.0`.

- source sha256 `cea006ca6bf1d6049be1004d05fd68c869a981a71fcabba8b2b27b048b7a8472`
- delivered sha256 `80074ad3da4578453fdeb40c612df7b1ffb60f8131a7f12163aa797e10bb7a91`

The delivered file is what is committed. The two differ by a **despill**:
RGB moves on a small number of pixels with an **alpha max delta of 0** and
identical geometry. Source was already **464x464**, the shipped target, so no
resize ran and `aspect_drift` is exactly 0.

**The step that actually mattered was re-measuring the DELIVERED file for 0
degrees rather than trusting the source's measurement.** A resize or a rotate
inside ingest would have moved the bake, and the ledger's own numbers would
not have said so. The AFTER column above is the delivered file.

## Two instrument failures, both caught by their own controls

Neither of these would have been visible without a control, and the first
would have produced a confident wrong residual and then a formula edit the
fence forbids. This is the fifth consecutive session in which the instrument,
not the code, was the thing that was broken.

**1. Every rotation read about -95 degrees no matter what was requested.**
`.gauge-needle` carries `transition: transform 0.6s cubic-bezier(0.22, 1.65,
0.32, 1)`. That is an OVERSHOOT curve, and a 140ms capture was catching the
needle **mid-swing**, so the measurement was reading the transition rather
than the target. **Kill a CSS transition before measuring a transformed
element.**

**2. Killing the transition was not enough.** The drift control still read
**10,630 changed pixels between two frames that should have been identical**,
because the feature scene behind the gauge animates continuously and the base
frame was captured at a different moment. The fix was not a higher threshold.
**The fix was ISOLATION**: hide everything but the gauge, put it on a flat
backdrop, and re-run. Drift then read **0 pixels** against a **1,130 pixel**
positive control.

The standing lesson from R133 and R135 holds and is now proven a third time: a
comparison's two sides must be the same thing, and when a control fails the
answer is a better control, never a looser threshold.

## Live proof, on the isolated gauge

With drift at 0 and the positive control at 1,130 pixels, the painted angle
tracks the requested rotation across the whole sweep:

| Requested | Painted |
|---|---|
| -110 | -108.15 |
| -66 | -62.55 |
| 0 | +2.42 |
| +55 | +54.20 |
| +110 | +106.71 |

Mean measured residual **+0.72 degrees**, consistent with the raster
measurement above and with nothing left to correct at the call site.

**Needle count on screen: 1.** Verified by hiding the needle sprite and
counting strong-red pixels in the face: **0**. The pre-R137 face carried
**1,305**, which is the baked-in second needle R137 removed; this session
confirms it has not returned and that the shipped face contributes none.

At multiplier 1 the needle sits at the START of the tick arc, which is what
the formula's -110 degree floor asks for and what the dial's ticks show.

**Reduced motion:** 1 needle, 0 animations, `transition: none`, correct angle,
0 console errors.

## What did NOT change, and one thing that is still open

The fence held. No `gauge_face.png`, no hero, no audio, no kit, no unrelated
rasters, no sweep formula, no source file of any kind.

**Still open, unchanged by this swap and NOT introduced by it:** the needle's
visual hub sits about 4 pixels off the CSS rotation origin. This is
pre-existing and it is unchanged **by construction** rather than by luck: the
hub is at (231.50, 228.0) in BOTH rasters, so the swap neither adds nor
removes the offset. It is cosmetic, it is parked, and it is named here so the
next session does not rediscover it as new.

## FOR THE NEXT SESSION

Model and effort: Opus 5, high effort, as the brief requested.

Approach: measure the supplied raster before ingesting it, ingest through the
real path, re-measure the DELIVERED file, then prove the live render on an
isolated gauge rather than against the animated scene. The formula was left
alone because the evidence said to leave it alone.

Alternatives tried and rejected: measuring rotation against the live feature
scene (defeated by scene animation, 10,630 pixel drift floor); trusting the
source file's measurement instead of the delivered one (would have shipped an
unverified bake); raw-overwriting the theme file instead of ingesting (the
brief permits it only where the project treats the row as a direct theme swap,
and this row goes through ingest).

Files touched: `frontend/public/assets/themes/future-spinner/ui/gauge_needle.png`,
the brief save, and this report with its dated archive extract.

Open threads: the ~4px hub-to-rotation-origin offset described above. The
owner preview was NOT refreshed: this session landed nothing on `main` (review
lane, PR #178 awaits Fable), so rule 12 does not fire.

**Both suites were run locally BEFORE the push this time**, which is the R137
process gap closed: static **82/82** and the browser matrix **28/28**.

### Remote CI, rule 10, verified after the final push

Run **33139371403** on `15360b32`:
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/33139371403
**completed SUCCESS, 30 of 30 jobs green**, with no non-success job in the
list. PR #178 is open on the review lane. This paragraph is itself a commit
and therefore postdates the run it quotes; per the R131 lesson that chase has
no fixed point, so it is verified by SHA in the past tense and stops here.
