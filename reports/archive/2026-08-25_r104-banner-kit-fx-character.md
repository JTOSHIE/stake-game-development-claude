
# Session Report - R104 BANNER + COMPLETION KIT + FX PATH + CHARACTER ROUTE: one asset of twenty-four was usable, and the Spine decision got much cheaper (2026-08-25)

Brief saved verbatim: `reports/briefs/FS_FABLE_R104_BANNER_KIT_FX_CHARACTER_Prompt.md`. Branch:
`claude/r104-banner-kit-fx-character`, review lane. **Six workstreams, all handled. Zero rasters
staged or committed. No kit packaging. The incoming art directory was read only. Guards
untouched and still refusing at exit 2.**

## Preconditions: all met

R103 merged as `dab7d357`; 22 working-tree rasters; the completion kit, the FX set, the ledger,
the Spine document and the in-house master all present; guards live.

---

# WORKSTREAM 1 - COMPLETION KIT AUDIT

**122 files, 24 top-level deliverables across five groups.** Full table in the FX spec and the
ledger. The headline:

| Verdict | Count | Which |
|---|---|---|
| **READY, and placed** | **1** | the 718x88 banner, variant B |
| WRONG-SPEC | 2 | the jet flame and holo dash sheets |
| Blocked on an open owner data question | 1 | the thin reel bezel, against SC-03's unparseable target |
| NO-ROW / HOMELESS | 20 | everything else |

**Group conclusions.** *Banner candidates*: four, all exactly 718x88, spec met precisely.
*Paytable support*: five well-made panels with no target, because the paytable is CSS.
*FX expansion*: eight strips plus 62 numbered frames; the frame counts improved and the frame
shapes did not. *Spine support*: six layers including the visor separation R102 asked for, all
blocked by law. *Scene polish*: four assets, all needing frame-level component work.

**One instrument error, caught before it reached a conclusion.** An aspect-match sweep across
kit assets and manifest rows reported a robot head as a match for `symbols/wild.png`, because
both are square. **Aspect equality is necessary and nowhere near sufficient**; it says nothing
about what an asset is. Re-run by intent first and geometry second.

---

# WORKSTREAM 2 - BANNER SELECTION AND PLACEMENT

## 2.1 The contract, re-verified

`--fs-x-slab = 297 - 16 = 281`, `--fs-w-slab = 939 + 44 + 16 - 281 = 718`, matching
`docs/HUD_SPEC.md`. `z-index:59` against controls at 61. **`pointer-events:none`**, so no touch
target and no accessible name can attach to it. `--acc` is `--sig-cyan` in base and
`--sig-pink` under `.fs-hud--overdrive`.

## 2.2 The measurement that changed the answer

**My first scoring measured the wrong pixels.** It scored how calm each candidate was under the
Balance, Win and Bet plates. Then I checked whether those plates are opaque: `.fs-plate`'s final
face layer is `linear-gradient(180deg,#111a2b 0%,#070b16 100%)`, a solid fill. **56.5% of the
panel is completely occluded by controls.** Re-measured on visible pixels only:

| Candidate | cyan+magenta | saturation | luma | std |
|---|---|---|---|---|
| **B** | **2.98%** | **0.061** | **19.9** | 50.4 |
| C | 13.77% | 0.175 | 28.6 | 55.3 |
| D | 16.98% | 0.209 | 25.8 | **35.9** |
| A | 20.13% | 0.222 | 44.2 | 65.3 |

**B wins on the hard constraint.** D is calmer, but carries 5.7 times more accent. A, C and D all
carry 10 to 12% strong cyan, which would fight the pink Overdrive skin. B is also the darkest.

## 2.3 Placement

**Placed working-tree-only** as a new untracked hud_banner.png in the theme's ui directory,
718x88 RGBA, and wired as one background layer on `.fs-panel`.

**NEITHER IS COMMITTED, and that is forced by two gates rather than chosen.**
`frontend/scripts/asset_reference_gate.mjs` asserts every asset path the code references exists
in dist, and `frontend/scripts/build_diet_verify.mjs:155` fails on any 404. **A committed
`url()` pointing at an uncommitted raster fails both.** So the raster and its single CSS line
live in the working tree together; the next session commits both or reverts both. Recorded in
the ledger, the comms entry and here, so nobody finds them cold.

`svelte-check` reports the same 6 pre-existing errors, both files in `node_modules`, zero
mentions of HudOverlay.

## 2.4 Overdrive correctness, proven structurally

```
layer 1  url(hud_banner.png)              clip: padding-box   <- the art
layer 2  linear-gradient(135deg,...)      clip: padding-box   <- body fill
layer 3  linear-gradient(180deg,--acc..)  clip: border-box    <- THE ACCENT BORDER
```

`.fs-hud--overdrive` changes `--acc` only, so it reaches layer 3 only. **The art is inside the
padding box and cannot be touched by the flip.** Belt and braces: B's outer 2px ring is fully
transparent, mean alpha 0, so the art does not even reach the border. And because every plate is
opaque, the banner cannot affect text contrast at all.

---

# WORKSTREAM 3 - MAKING FX USABLE

## 3.1 and 3.2 The three buckets, traced against the runtime

**Bucket 1, can ship now: NOTHING.** No FX asset in either flood fits a live slot.

**Bucket 2, good art with the wrong frame geometry:** the two sheets. **The numbers are compiled
into CSS, which is why this keeps failing:**

| Row | Sheet | Frames | Frame | The CSS that locks it |
|---|---|---|---|---|
| FX-01 | 1200x200 | **6** | **200x200** | `GameGrid.svelte:1373-1374`, `background-size:492px 82px`, `steps(6)` |
| FX-02 | 800x200 | **4** | 200x200 | `GameGrid.svelte:1379-1380`, `steps(4)` |
| FX-03 | 1200x120 | **5** | 240x120 | `FlameJets.svelte:206`, `steps(5)` |

**FX-01's frame COUNT is finally right at 6. The frame SHAPE is still wrong: 200x200 is square,
256x320 is portrait.** The jet sheet arrived with 8 frames against 5.

**Bucket 3, homeless:** 20 assets. The particle runtime is live across five components but draws
**32 to 128 px sprites**; every burst in both floods is 960 px or larger. There is no
selected-cell concept. `SceneGroup` has no shadow layer. The paytable is CSS.

## 3.3 Intake

**Nothing was forced.** The banner was the only asset that could land.

## 3.4 and 3.5 The specs

**New file `docs/design/FX_REGENERATION_SPEC.md`** carries copy-paste prompts stating every
number for FX-01, FX-02 and FX-03, plus the four particle sprites at **40, 128, 56 and 32 px**
with their exact call sites. **The particle gap has now survived two art floods** because both
delivered overlays instead of sprites; the prompt says "four files, four exact sizes, not one
contact sheet" for that reason.

---

# WORKSTREAM 4 - THE IN-HOUSE CHARACTER ROUTE

## 4.1 The law, restated

`design-system/DESIGN_SYSTEM.md`: anything the animation pipeline "positions or animates" is
"**NEVER externally designed. No exception, and no measurement changes that answer**". External
scene art is permitted "**because it is flat, terminal, and animates nothing**", and `CLAUDE.md`
condition 2 says the same. **The shipped hero raster is permitted only while it animates
nothing.** Rigging it is the act that removes the permission.

## 4.2 and 4.3 The master, inspected and then LOOKED AT

340x672, one flat `<g id="racer">`, 35 unnamed drawable elements, no per-body-part groups, so
`build.py`'s layered track cannot split it. Zero live consumers; the shipped 680x1344 raster is
the externally enhanced version.

**R103 sized "rig from the in-house master" as medium, assuming the paths only needed grouping.
I rendered the master and that was wrong.** It is the hero pose the compliance note already
described in words: **arms folded in an X across the chest, weight on one leg, legs
overlapping.** A rig needs neutral, separable limbs, and **you cannot uncross a folded forearm by
rotating it about an elbow pivot.** The external batch solved this deliberately and says so: its
limbs "are rendered in neutral straight orientations rather than the crossed hero pose".

**So route B requires limb re-authoring in vector, which is most of route C's work without route
C's benefit of matching the shipped art.**

**Route A, one owner ruling, is now the cheapest path by a wide margin.** The external parts are
neutral-posed, separated, measured, and the completion kit now supplies the visor, eye and chest
emissive layers R102 recorded as missing. The Assets law has been amended twice by owner ruling
already, on 2026-07-25 and 2026-07-27.

## 4.4 Docs corrected

`docs/design/SPINE_ROBOT_RIG_SETUP.md` no longer presents route B as the cheap unblocked option,
and records that the visor limitation is solved in art but still gated by law.

---

# WORKSTREAM 5 - PAYTABLE AND GUIDE HONESTY

**5.1 The guide still matches the live controls.** All six restored icons remain byte-identical
to HEAD. `feature_button.png` is the last un-restored guide icon and is dual-role.

**5.2 No paytable art could be taken.** All five support assets are well made and have no target:
the paytable draws no panel rasters. They are homeless pending paytable component work.

**5.3 One safe isolated fix made.** `maxWinVsBaseBetLabel` was imported by `PaytableModal.svelte`
and never used; removed. **The export stays**, because `BuyBonus.svelte` genuinely uses it.
Everything else found at R103, the baked MAX in the guide icon, the WILD and SCAT literals, the
bare RTP string, needs owner wording decisions and was escalated rather than changed.

---

# WORKSTREAM 6 - PROGRAMME STATE

## 6.1 Recomputed

| Measure | Value |
|---|---|
| Manifest | 47 rows: 30 REPLACE, 10 REGEN, 6 DEAD, 1 KEEP |
| Working-tree rasters | **23** = 22 modified + 1 new banner |
| REPLACE coverage | **21/30 = 70.0%**, unchanged: **the banner has no manifest row** |
| Incoming art on disk | **42.58 MiB** across both floods |
| Blocked by LAW | 15 assets |
| Blocked by MISSING COMPONENT | 17 assets |
| Blocked by WRONG-SPEC | 5 assets |
| Blocked by an owner DATA decision | 2 assets |

## 6.2 The five decisions, restated

1. **Banner**: chosen and placed. **The only open part is whether to commit it**, which needs the
   raster committed too. One decision, and the ledger says exactly what to commit.
2. **Spine law**: route A is now clearly cheapest and its whole cost is one ruling. **Owner.**
3. **FX regeneration**: specs are written and machine-ready. No decision needed, just a run.
4. **Particles**: prompt written for the four exact sizes. No decision needed, just a run.
5. **Provider and tooling**: unchanged. OpenAI client, pricing, SC-03's target.

## 6.3 Roadmap, executable without rediscovery

**Files to GENERATE**, all specified in `docs/design/FX_REGENERATION_SPEC.md`: the FX-01 sheet at
1200x200 in 6 square frames, the FX-03 sheet at 1200x120 in 5 landscape frames plus its frame-3
still, and the four particle sprites at 40, 128, 56 and 32 px.

**Files to WIRE**, each needing component work and none needing new art: the two hero contact
shadows into `SceneGroup.svelte` (widths already match their heroes exactly, smallest job with
the clearest payoff); a burst-overlay component, which unlocks three FX at once.

**Files to LEAVE ALONE**: every robot part and emissive layer, until the law question is answered;
the 22 placeholder rasters; the two bezel variants until SC-03's target is decided.

**Owner decisions still required**: commit the banner or not; the Spine law amendment; SC-03's
target; the baked MAX in the guide icon; the background room; the homeless win art; and the
OpenAI pricing or exemption.

---

## Verification

Generate self-test **22/22**. Asset guard **11/11**. Ingest **17/17**. Doc currency **PASS, 0
new**. Locked paths **PASS**. Guards still refuse at exit 2. Explicit paths per (k).

**The doc currency gate caught me once more, and it was right.** The ledger backticked the new
banner path, which does not exist at HEAD. Sixth encounter with that class this arc. Fixed in the
document.

## ESCALATIONS

**E1 (R104). The banner is placed but uncommittable alone.** Committing the CSS without the
raster fails two gates. Decide whether to commit both.

**E2 (R104). Route A is the cheap Spine path and needs a law amendment.** Precedent exists twice.

**E3 (R104). The FX frame shape, not just the count, is what fails.** Spec written.

**E4 (R104). The particle gap has survived two art floods.** Four files, four exact sizes.

**E5 (R104). 17 assets are blocked only by missing components**, and the two contact shadows are
the cheapest of them by a wide margin.

**Carried:** everything in the ledger. **Closed:** R102-E2 in art, R103-E10, and R102-E5 in art
though not in law.

Model and effort: one session, unattended, review lane, six workstreams. First-hand measurement
throughout, with two instrument errors caught and corrected before they reached a conclusion.
Five files changed, two authorised working-tree-only changes, zero rasters staged.
