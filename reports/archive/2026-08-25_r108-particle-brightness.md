
# Session Report - R108 FINAL PARTICLE BRIGHTNESS: both closed, all eight FX rows done, one row left in the manifest (2026-08-25)

Brief saved verbatim: `reports/briefs/FS_FABLE_R108_PARTICLE_BRIGHTNESS_Prompt.md`. Branch:
`claude/r108-particle-brightness`, review lane. **Zero rasters staged. No kit packaging. output/
read only. Guards untouched and still refusing at exit 2. The committed banner pair was not
disturbed.**

## Headline

**REPLACE coverage 29 of 30 = 96.7%. All eight FX rows closed.** One REPLACE row remains
uncovered in the entire manifest, and it is blocked on an owner decision rather than on art.

---

# TASK 1 - AUDIT

Nine candidate sprites plus sources. **The kit supplied both real runtime targets directly**, a
40x40 coin and a 32x32 spark, so neither needed a downscale from a larger size.

| File | Dims | Alpha | Hue | Sat | meanA | peakL | Coverage |
|---|---|---|---|---|---|---|---|
| coin 40x40 | 40x40 | Y | 45 | 0.82 | 144.7 | 188.9 | 70.1% |
| coin 32 / 64 / 96 / 128 | — | Y | 45 | 0.81-0.84 | 144.6-144.8 | 187-191 | 61-72% |
| spark 32x32 | 32x32 | Y | 182 | 0.24 | 41.0 | 195.4 | 45.1% |
| spark 64 / 96 / 128 | — | Y | 193-198 | 0.30-0.36 | 41.1-41.3 | 187-192 | 30-36% |
| **INCUMBENT coin** | 40x40 | Y | 51 | 0.75 | 145.1 | 177.4 | 67.4% |
| **INCUMBENT spark** | 32x32 | Y | 180 | **0.94** | 31.6 | **222.9** | 60.5% |

---

# TASK 2 - FX-05 COIN: CLOSED

| Check | Incumbent | Candidate | Verdict |
|---|---|---|---|
| Size | 40x40 | **40x40 exact** | correct runtime target, not merely the largest |
| Hue | 51 | 45 | both warm gold |
| Saturation | 0.75 | **0.82** | richer |
| Peak luma | 177.4 | **188.9** | brighter |
| Max luma | 229 | **252** | brighter |
| **Integrated light** | 160,569 | **172,111** | **107.2%** |

Brighter, warmer and more saturated on every measure the brief names. **Intaken.**

Three batches ago this row received a blue token; two ago a gold coin 36% dimmer than the
incumbent. This one is right.

---

# TASK 3 - FX-08 SPARK: CLOSED, after changing instrument

**The measure that refused the last two sparks said "dimmer" again, and it was the wrong measure
for this shape.**

| Measure | Incumbent | Candidate | Reads as |
|---|---|---|---|
| Peak luma, mean over opaque px | 222.9 | 195.4 | dimmer |
| Saturation | 0.94 | 0.24 | flatter |
| Mean alpha | 31.6 | **41.0** | more mass |
| Max luma | 255 | 255 | equal |
| **Integrated light, sum of alpha x luminance** | 13,508 | **34,053** | **252.1%** |

**Why the measures disagree.** The incumbent is a **thin cross**: few opaque pixels, each very
bright, so a per-pixel average is high. The candidate is a **full six-point burst**: more pixels
at a slightly lower average. **Per-pixel brightness rewards thin shapes and punishes full ones.**
What the eye receives at 32px is the total light emitted, and the burst delivers two and a half
times more.

**The saturation reading is explained rather than excused.** The core is white-hot, which is what
a bright spark looks like; the spikes remain cyan at hue 182 against the incumbent's 180. A
uniformly cyan cross scores higher on mean saturation without being a better spark.

**The picture prompted the recheck.** Magnified 6x, the candidate is plainly an energetic burst
with a hot core, not the dim shard the previous two batches sent. That disagreement between the
number and the image is what sent me looking for a better number.

**I came close to refusing a good asset for the third time on a measure that was quietly wrong for
this shape.**

---

# TASK 4 - RESULT

| | |
|---|---|
| FX-05 coin | **CLOSED** |
| FX-08 spark | **CLOSED** |
| **REPLACE coverage** | **29 of 30 = 96.7%**, from 90.0% |
| **FX rows** | **8 of 8 closed** |
| Working-tree rasters | 30 |

## The only REPLACE row left in the manifest

**SC-03, `frames/frame-2.png`.** It is not an art gap. Its `target_dimensions` cell reads
`800x640 source`, and its own note says: "either author at the true 640x468 aspect or the engine
call site changes". **That is an owner decision.** Since R103 the composer refuses that row
cleanly with a message naming the two remedies, rather than crashing.

## Is the art arc complete?

**For the REPLACE set, yes, apart from that one decision.** What remains is not pictures:

- **Owner decisions**: SC-03's target; the shared `.car-img, .char-img` `drop-shadow` rule that
  blocks the contact shadows; whether sub-10x wins should celebrate; the Spine law amendment; the
  baked MAX in the guide icon; the background room; OpenAI pricing.
- **Component work**: the contact shadow layer, blocked on the decision above; sub-threshold win
  feedback; paytable panel targets, which do not exist.
- **Standing**: the 30 working-tree rasters are still uncommitted and still the visual review set;
  kit packaging remains forbidden while they differ from HEAD.

---

## Verification

Generate self-test **22/22**. Asset guard **11/11**. Ingest **17/17**. Doc currency **PASS, 0
new**. Locked paths **PASS**. Guards refuse at exit 2. Zero rasters staged. Both intakes went
through the ingest path at exact size and are ledgered.

## ESCALATIONS

**E1 (R108). The measurement lesson, recorded because it reversed a refusal.** For a small sprite
judged on "does it catch the eye", integrate alpha times luminance over the canvas.
Peak-over-opaque rewards thin bright shapes and punishes full ones, and it nearly cost this row a
third refusal.

**E2 (R108). SC-03 is the last REPLACE row and needs a decision, not art.**

**Closed by this session:** FX-05, FX-08, and with them the entire FX set.

Model and effort: one session, unattended, review lane, four tasks. Two intakes, both at exact
runtime targets, one of them saved by questioning the instrument rather than the art.
