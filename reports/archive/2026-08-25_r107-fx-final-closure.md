
# Session Report - R107 FINAL FX CLOSURE: coverage 90%, six of eight FX rows closed, and a recommendation I made three times was wrong (2026-08-25)

Brief saved verbatim: `reports/briefs/FS_FABLE_R107_FINAL_FX_CLOSURE_Prompt.md`. Branch:
`claude/r107-fx-final-closure`, review lane. **Six workstreams, all handled. Zero rasters staged.
No kit packaging. output/ read only. Guards untouched and still refusing at exit 2. The committed
banner pair was not disturbed.**

## Headline

**REPLACE coverage 27 of 30 = 90.0%**, from 80.0%. **Six of eight FX rows closed.** Three intakes
this session, all working-tree-only, each verified by measurement before placement.

---

# WORKSTREAM 1 and 2 - THE SHEETS

## FX-03, CLOSED, and it met the contract R106 had to discover

R106 refused this row at **perfect geometry** because the flame was cyan and `FlameJets.svelte`
requires a green source it recolours by `hue-rotate`. This kit answers it exactly:

| Check | Result |
|---|---|
| Strip geometry | **exactly 1200x120**, five 240x120 frames, no resize |
| **Hue, per frame** | **110.1, 110.1, 110.2, 110.1, 110.1** — the required green |
| Frame alpha | maxA 255 on all five; coverage 15.3 to 18.6% |
| Consumer | `FlameJets.svelte:206` `steps(5)` unchanged, **no code change needed** |

With a green source the three colourways land on green, cyan and magenta, exactly as the
component's comment describes.

**A concern I raised and then disproved.** Coverage is 15.6% against the incumbent's 69.5% and I
suspected a weak flame. Rendering both showed why: **the incumbent is a solid banded chevron, a
flat-vector shape the style register's own negative list forbids**, while the candidate is a
feathered painted flame whose transparent gaps between tongues explain the coverage gap. I then
hypothesised a value-structure problem, a dark core against the "magenta-core white-tipped" brief,
and **measured it: both have a brighter core than tip**, incumbent 214.6/192.3, candidate
183.2/181.0. The hypothesis did not survive, so I dropped it.

## FX-04, CLOSED, and delivered rather than derived

The kit shipped an explicit frame-3 export. Verified after placement:
**byte-identical to its own frame 3**, and **pixel-identical to frame 3 of the placed strip**, max
per-channel difference **0**. The manifest requires exactly that: "literally frame 3 of the sheet,
verified pixel-identical".

---

# WORKSTREAM 3 - PARTICLES

## FX-06, CLOSED. The first particle to beat its incumbent on punch.

| | incumbent | candidate |
|---|---|---|
| size | 128x128 | **128x128 exact** |
| meanA | 47.9 | **51.1 stronger** |
| peak luma | 148.6 | **170.6 brighter** |
| hue | 180 | 185, cyan |
| saturation | 0.94 | 0.76 |

Stronger and brighter on both punch metrics, correct subject, exact size. **Intaken.**

## FX-05 coin, still refused, and now genuinely close

**It IS gold at last**, hue 45 at saturation 0.86 against the incumbent's 0.75 — the previous batch
sent a blue token and this one is a machined gold piece, more on-direction than the plain disc it
would replace. **Refused on brightness: peak luma 177.4 to 114.1, a 36% dimming**, and meanA 145.1
to 116.1, in a coin fountain that must read against a lit win banner. The brief's rule is "clearly
as strong or stronger". It is not.

## FX-08 spark, still refused, third attempt

Named "bright" and measures dimmer: peak luma 222.9 to 188.0, meanA 31.6 to 26.5, **saturation
0.94 to 0.31**. The incumbent is a small vivid cyan cross; this is a muted blue shard.

**Both remaining particles need BRIGHTNESS. Size, subject and hue are all solved.**

---

# WORKSTREAM 4 - CONTACT SHADOWS: fully measured, blocked on something else

**Every number is now known.**

| Quantity | Value |
|---|---|
| `.char-layer` | left 22, bottom 18, 206x407, `animation: char-idle` |
| image vs box aspect | 0.5060 vs 0.5061, so `object-fit: contain` maps 1:1, no letterbox |
| character scale | **0.3028** |
| foot line | **27.7px above the stage bottom** |
| shadow art | 680x240, alpha centroid at **49.8% x, 49.9% y** |
| shadow scaled | 205.9 x 72.7px, needing **36.4px below the contact point** |
| shortfall | **8.7px past the stage bottom** |
| grounding check | composited over the real `bg_base` backdrop: shadow luma **19.7** against a floor of **32.2**, and it does ground the figure |

**THE BLOCKER IS NOT PLACEMENT.** `.car-img, .char-img` is a **shared** CSS rule already carrying
`drop-shadow(0 6px 18px rgba(0, 0, 0, 0.5))`, which is itself a contact shadow. Adding a raster
shadow either doubles it, or requires removing the filter from a rule that **also governs the
car**, whose own shadow asset is separate. **That is a coupled design decision about the scene's
grounding language, and it is not a builder's to make.**

The insertion point remains as R106 established: a sibling inside `.scene-group`, which its own
comment calls a "Non-stacking wrapper: no z-index/transform of its own". The snippet in the R106
report stands, and every measurement above can be dropped straight into it.

---

# WORKSTREAM 5 - THE BURST OVERLAY, AND A CORRECTION

**I have recommended a burst-overlay component in three consecutive session reports. It already
exists.**

`WinBanner.svelte` (588 lines) renders, for every win tier and gated only by reduced motion:
`c1-shockwave`, an `<img>` from `ui/particles/shock_ring.png`; a `c1-chromatic-flash` for epic;
and an epic-tier `c1-coin-layer` fountain. **The asset that shockwave draws is the one this
session improved.**

**What does NOT exist is celebration feedback below the 10x big-win threshold.** The tiers are
big/mega/epic at 10x/30x/100x, and the file records that these are "the same thresholds the
autoplay-pause" uses. Adding a fourth tier beneath them is **a game-feel decision about when a
small win celebrates**, not an isolated wiring task, and the brief explicitly forbids forcing
architecture. So the four win micro-bursts stay unplaced and **the standing recommendation is
withdrawn**.

---

# WORKSTREAM 6 - PROGRAMME STATE

| Measure | Value |
|---|---|
| Working-tree modified rasters | **28** |
| **REPLACE coverage** | **27 of 30 = 90.0%** |
| FX rows closed | **6 of 8**: FX-01, FX-02, FX-03, FX-04, FX-06, FX-07 |
| FX rows open | FX-05 coin, FX-08 spark |
| **All remaining uncovered REPLACE rows** | **SC-03**, **FX-05**, **FX-08** |

## Ranked next work

**1. Remaining art intakes** — two sprites, and both need only one property changed:
a **brighter** gold coin at 40x40 (subject and hue are right, peak luma must rise from ~114 toward
the incumbent's ~177), and a **bright, saturated** cyan spark at 32x32 (saturation must rise from
0.31 toward 0.94).

**2. Component work**, and the list is shorter than it was: the contact shadows, blocked on the
shared drop-shadow decision above, not on placement; sub-10x win feedback, if the owner wants
small wins to celebrate; paytable panel targets, which still do not exist.

**3. Owner decisions:** SC-03's target, which is the last non-FX REPLACE row; the shared
drop-shadow question; the Spine law amendment; the baked MAX in the guide icon; the background
room; OpenAI pricing.

---

## Verification

Generate self-test **22/22**. Asset guard **11/11**. Ingest **17/17**. Doc currency **PASS, 0
new**. Locked paths **PASS**. Guards refuse at exit 2. Zero rasters staged.

## ESCALATIONS

**E1 (R107). Two particles need BRIGHTNESS only.** Every other property is solved.

**E2 (R107). The burst-overlay recommendation is WITHDRAWN.** It existed all along; the real gap
is sub-threshold win feedback, which is a design decision.

**E3 (R107). The contact shadows are blocked by a SHARED `drop-shadow` rule**, not by placement.
Every measurement needed is in this report.

**Closed by this session:** FX-03, FX-04, FX-06.

Model and effort: one session, unattended, review lane, six workstreams. Three intakes, two
refusals, one hypothesis raised and disproved by measurement, and one standing recommendation
withdrawn after reading the code it recommended writing.
