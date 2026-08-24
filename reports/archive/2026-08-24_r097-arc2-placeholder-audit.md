# Session Report - R097 FULL ARC-2 PLACEHOLDER AUDIT (2026-08-24)

Brief saved verbatim: `reports/briefs/FS_FABLE_R097_ARC2_AUDIT_Prompt.md`. Branch:
`claude/r097-arc2-audit`, review lane, held for Fable and the owner. **READ-ONLY AUDIT. No
raster was modified, staged or committed. No swap, no code change, no generation, no kit.
`output/` untouched. `hero_emblem_512.png` untouched. The owner's dev server on 5173 was never
touched; this session ran its own on 4173 and stopped it.**

**PROOF THE TREE SURVIVED THE AUDIT.** The 28 modified paths were sha256-fingerprinted before
any work began and again at the end. The combined fingerprint is **`fd5e7ff8e3c468ba036c974037441880`**
in both cases, byte-for-byte identical. All five discovery agents independently returned
`TREE_AFTER` matching the expected 28 paths. This is asserted structurally rather than hoped
for, because the audit's own tooling is the main threat to an uncommitted tree.

---

## EXECUTIVE SUMMARY

| | |
|---|---|
| **Placeholders in the working tree** | **27 rasters** (plus 1 provenance record = 28 modified paths) |
| **Manifest REPLACE coverage** | **20 of 30 = 66.7%** |
| **Coverage by priority tier** | **P1 13/13 (100%), P2 4/5 (80%), P3 3/4 (75%), P4 0/8 (0%)** |
| **Sessions that built it** | R086, R089, R090, R091, R092, R094, R095, R096 (there is no R088) |
| **Build** | exit 0, zero console errors, zero missing assets |
| **Open defects against the art** | **none** |
| **Blocking decision** | the provider ruling |

**The headline is that the 33.3% gap is not scattered, it is one tier.** Every uncovered
REPLACE row is either the eight-row FX set (flipbook sheets and particles, P4) or two singles,
SC-03 the reel bezel and UI-04 the jet nozzle. **P1, the symbols, is complete at 13 of 13.**
No uncovered row was ever refused by a gate: no candidate was ever offered for any of them.

**The single most actionable operational finding is new to this audit** and is not an art
issue: **`npm run assets` would silently revert 16 of the 27 placeholders** and recreate 15
deliberately-absent files. See E1.

---

## TASK 1: WORKING-TREE INVENTORY

28 modified paths, all unstaged, zero untracked, zero staged. **Every one of the 27 rasters has
IDENTICAL dimensions and pixel mode at HEAD and now**, confirming that every swap landed at
0.0000% drift into the shipped target's own canvas. Only the bytes moved.

Session attribution is taken from the records (`reports/FABLE_COMMS.md` entries 085 to 094 and
the ten dated archives), not inferred.

### Symbols (12)

| path | dims | bytes HEAD to now | session |
|---|---|---|---|
| `symbols/wild.png` | 240x240 RGBA | 75,775 to 96,540 | R086 |
| `symbols/scatter.png` | 240x240 RGBA | 66,552 to 94,393 | R086 |
| `symbols/h1.png` | 240x240 RGBA | 64,505 to 99,580 | R086 |
| `symbols/h1_base.png` | 240x240 RGBA | 58,081 to 67,654 | R086 |
| `symbols/h1_spin.png` | 240x240 RGBA | 22,100 to 45,454 | R086 |
| `symbols/h2.png` | 240x240 RGBA | 16,920 to 84,647 | R086 |
| `symbols/m2.png` | 240x240 RGBA | 36,038 to 37,433 | R090 |
| `symbols/m3.png` | 240x240 RGBA | 26,225 to 63,141 | R090 |
| `symbols/l1.png` | 240x240 RGBA | 24,311 to 41,242 | R090 |
| `symbols/l2.png` | 240x240 RGBA | 21,232 to 22,909 | R090 |
| `symbols/l3.png` | 240x240 RGBA | 18,939 to 44,907 | R090 |
| `symbols/m1.png` | 240x240 RGBA | 37,695 to 61,996 | R092 |

### Tile plate (1)

| path | dims | bytes | session |
|---|---|---|---|
| `symbols/tile_plate.png` | 244x204 RGBA | 1,054 to 81,899 | R092 |

Alpha extrema now `(255,255)`, fully opaque, where HEAD measures `(0,255)` with a real corner
radius. The 77.7x byte ratio is the largest in the set and is misleading: the file it replaced
was a flat three-colour rectangle that compressed to almost nothing.

### Backgrounds (2)

| path | dims | bytes | session |
|---|---|---|---|
| `backgrounds/bg_base.jpg` | 1920x1080 RGB | 273,173 to 270,011 | R091 |
| `backgrounds/bg_overdrive.jpg` | 1920x1080 RGB | 269,186 to 259,050 | R091 |

The only two non-PNG rasters and **the only two that got smaller than HEAD**, after R091 caught
its own 2.36x over-ship and re-encoded from source at the house q80 progressive 4:2:0. Verified
this audit: the on-disk pair hashes match `derived_from.sha256` and `output.sha256` in the
modified provenance record exactly, so **the record describes the pair actually on disk**.

### Gauge (2)

| path | dims | bytes | session |
|---|---|---|---|
| `ui/gauge_face.png` | 464x464 RGBA | 107,549 to 302,421 | R086 |
| `ui/gauge_needle.png` | 464x464 RGBA | 5,280 to 20,476 | R086 |

### UI controls (7)

All from R089, all 480x480 green-keyed masters downscaled to each target's own shipped size.

| path | dims | bytes |
|---|---|---|
| `ui/spin_button.png` | 200x200 RGBA | 45,119 to 63,421 |
| `ui/btn_turbo.png` | 200x200 RGBA | 21,679 to 29,670 |
| `ui/btn_bet_plus.png` | 200x200 RGBA | 11,655 to 31,491 |
| `ui/btn_bet_minus.png` | 200x200 RGBA | 11,739 to 32,505 |
| `ui/btn_menu.png` | 200x200 RGBA | 13,542 to 31,620 |
| `ui/btn_autoplay.png` | 200x200 RGBA | 22,757 to 34,116 |
| `ui/feature_button.png` | 224x224 RGBA | 22,965 to 58,331 |

### Title / logo (1)

| path | dims | bytes | sessions |
|---|---|---|---|
| `ui/logo.png` | 600x120 RGBA | 106,148 to 132,328 | introduced R094, regraded R095, current bytes R096 |

### Hero character (2)

| path | dims | bytes | sessions |
|---|---|---|---|
| `ui/scene_character.png` | 680x1344 RGBA | 629,245 to 791,212 | R094, R095, R096 |
| `ui/scene_car.png` | 2840x1000 RGBA | 1,036,271 to 2,169,737 | R094, R095, R096 |

`scene_character.png` is non-monotonic across its three passes: 629,245 at HEAD, **474,277** at
R094 (below HEAD, the thin silhouette), 498,716 at R095, 791,212 at R096. That dip is the
silhouette regression R094 recorded and R096 reversed, visible in the byte trail.

### Non-raster (1)

`reports/qa/background_overdrive_derive.json`, 6 insertions and 6 deletions, left deliberately
dirty since R091 so the provenance record keeps describing the background pair actually on disk.

**Aggregate: 3,045,735 to 5,068,184 bytes, +2,022,449, +66.4%. 25 files grew, 2 shrank.** The
hero pair alone is +1,295,433, which is **64.1% of all growth**.

---

## TASK 2: MANIFEST COVERAGE

`docs/art/art_manifest_arc2.csv`, parsed with the csv module: **47 rows, REPLACE 30, REGEN 10,
DEAD 6, KEEP 1.** Computed first-hand and independently reproduced by the verification agent.

### Covered: 20 of 30 REPLACE rows = 66.7%

SY-01 wild, SY-02 scatter, SY-03 h1, SY-04 h1_base, SY-05 h1_spin, SY-06 h2, SY-07 m1,
SY-08 m2, SY-09 m3, SY-10 l1, SY-11 l2, SY-12 l3, SY-13 tile_plate, SC-01 bg_base,
SC-02 bg_overdrive, SC-05 scene_car, SC-06 scene_character, UI-01 gauge_face,
UI-02 gauge_needle, UI-05 logo.

### Missing: 10 REPLACE rows

| id | path | target | why |
|---|---|---|---|
| SC-03 | `frames/frame-2.png` | 800x640 | no candidate ever offered |
| UI-04 | `ui/jet_nozzle.png` | 160x160 | no candidate ever offered |
| FX-01 | `symbols/m3_flame_sheet.png` | 1200x200 | 6-frame flipbook strip |
| FX-02 | `symbols/l2_fuse_sheet.png` | 800x200 | 4-frame flipbook strip |
| FX-03 | `ui/jet_flame_sheet.png` | 1200x120 | 5-frame flipbook strip |
| FX-04 | `ui/jet_flame_static.png` | 240x120 | still flame |
| FX-05 | `ui/particles/coin.png` | 40x40 | particle |
| FX-06 | `ui/particles/shock_ring.png` | 128x128 | particle |
| FX-07 | `ui/particles/smoke_puff.png` | 56x56 | particle |
| FX-08 | `ui/particles/spark.png` | 32x32 | particle |

**None of the ten was ever refused by a gate.** Verified against
`docs/art/placeholder_map_2026-08-24.csv`: no row anywhere targets SC-03, UI-04 or any FX id.
This is a pure intake gap, not a quality failure. R086 recorded the cause for the FX set: the
generation prompt lock forbids particles and baked glow and requires a centred isolated object,
which is geometrically incompatible with a multi-frame flipbook strip.

### Coverage by priority tier, which is the more useful framing

| tier | covered | note |
|---|---|---|
| **P1** | **13 / 13 = 100%** | every symbol, complete |
| **P2** | **4 / 5 = 80%** | backgrounds and scene pair; SC-03 bezel missing |
| **P3** | **3 / 4 = 75%** | gauge pair and logo; UI-04 jet nozzle missing |
| **P4** | **0 / 8 = 0%** | the entire FX set |

**The gap is one tier.** P4 accounts for eight of the ten missing rows.

### Swapped but NOT a REPLACE row: 7

All seven UI controls resolve to **REGEN** rows: DOC-01 spin_button, DOC-02 btn_bet_plus,
DOC-03 btn_bet_minus, DOC-05 btn_autoplay, DOC-06 btn_menu, DOC-07 btn_turbo,
DOC-10 feature_button. This was deliberate and recorded at R089: these render as the Interface
Guide inside the Paytable modal, and `feature_button.png` additionally on the Buy screen. **No
DEAD row and no KEEP row was modified**; `hero_emblem_512.png` is absent from the modified list.

So the arithmetic reconciles: 27 modified rasters = 20 REPLACE rows retired + 7 REGEN rows
swapped for the guide.

---

## TASK 3: TECHNICAL FINDINGS LOG, R086 to R096

### Closed

| # | Finding | Decisive evidence | Closed by |
|---|---|---|---|
| 1 | Nine of ten per-symbol idle animations were dead in the built CSS | rule count in `dist` CSS was 1 for `idle-breathe`, 0 for the other nine | R087 |
| 2 | Six MORE pruned rules found in the same file: `fx-flame`, `fx-arc`, `plate-bloom`, `pre-charge`, `scatter-charge`, `win-spin-fast` | 16 total, all restored with `:global()` | R087 |
| 3 | `.spinning` pruned, so idles would not pause on travelling reels | would have been a regression introduced by the idle restore itself | R087 |
| 4 | Idle excursions were absolute px against render-scaled art | converted to -1.25% and -2.9167%; L3 crown clearance went +0.43px to +6.95px | R087 |
| 5 | `replay_contract_gate.mjs` dim reader could not tell a 0.2 dim from an 0.82 `valve-hiss` flicker | threshold 0.9 to 0.5, visible cells only; self-test still 15/15, run 86/86 | R087 |
| 6 | Seven preferred masters could not go in without distortion | all seven later landed at 0.0000% after re-render to target | R090, R091, R092 |
| 7 | Tile plate refused three times on 16.39% aspect drift | 732x612 re-render passed unforced | R092 |
| 8 | `m1.png` was the last glow-era symbol with no candidate | re-rendered and swapped | R092 |
| 9 | Background refused twice at 43.75% and a 4x upscale | full-resolution 1920x1080 render passed at 0.0000% | R091 |
| 10 | SC-02 would have desynced from SC-01 | derived twin scores r +0.9961; base-only would have been r -0.2575 | R091 |
| 11 | R091 shipped `bg_base.jpg` at 2.36x budget through `ingest.py`'s q92 | re-encoded from source at q80 progressive 4:2:0, 643,957 to 270,011 | R091, same session |
| 12 | Hero assets authored to their own canvases, three refusals | re-rendered to the shipped targets, all passed at 0.0000% | R094 |
| 13 | Title contrast halved, 5.16:1 to 2.58:1 | brightened to 3.20:1 then 3.42:1, over the 3:1 threshold | R095, R096 |
| 14 | Silhouettes drifted far past precedent (robot width -40.3%) | restored to -8.9%; car height -20.7% to -7.9% | R096 |
| 15 | `.antenna-light` sat 6% inside the robot; `.underglow` 64% | 89% and 76%; **closed by art, not code**, and R095's CSS estimates were withdrawn | R096 |

### Open - art decision

| # | Finding | Evidence |
|---|---|---|
| 16 | **Title remains a darker treatment than the art it replaces**, 3.42:1 against the original's 5.16:1 | over the 3:1 large-text threshold; a style position, not a defect |
| 17 | **The tile plate is materially busier** than the flat rectangle it replaces, behind all 35 cells with no per-symbol branch | see the correction below: the "subordinate" wording is NOT in the manifest |
| 18 | The plate's corner geometry now comes from CSS `border-radius: 8px` rather than the art's own 23px alpha radius | renders correctly; the rendered radius is smaller than before |
| 19 | Backgrounds: WORKSHOP was taken as the default; `02-dyno-cell` remains a live alternative for SC-01 | r 0.2136 against the adopted base, so it is a different room, not an SC-02 candidate |

### Open - code decision

| # | Finding | Evidence |
|---|---|---|
| 20 | **~9.65 MB of win and Overdrive art has no render site**; every win moment is CSS plus inline SVG | see TASK 4 |
| 21 | Title states and character poses have no state machinery anywhere | `titleState`, `energySurge`, `activePose` etc: 0 hits each |
| 22 | The seven swapped UI controls change the Paytable guide and Buy screen, **not the live HUD**, which is CSS+SVG (`HudOverlay.svelte`: 0 `<img>`, 27 `<svg>`) | if the live HUD should carry this art, that is a component change |

### Open - tooling

| # | Finding | Evidence |
|---|---|---|
| 23 | **`npm run assets` would silently revert 16 of the 27 placeholders** and recreate 15 absent files | NEW this audit, see E1 |
| 24 | `ALPHA_SNAP_FLOOR` does not clear the alpha its docstring claims | float32 array vs float64 constant, strict `<`, so alpha 2 survives; real fringe sits at alpha 3 to 16, above the floor entirely |
| 25 | `ingest.py` hardcodes `quality=92, subsampling=0` with no CLI override | wrong for every opaque full-size row, 2.36x the budget the rest of the pipeline uses |
| 26 | `ingest.py`'s aspect refusal message advises `--allow-aspect-change` "if the crop is deliberate" | **the flag performs no crop**; it skips the raise and squashes |
| 27 | No `--compare-against-shipped` mode exists | the subject-bbox test has been required since July and hand-rolled four sessions running |
| 28 | `BASELINE_WARNINGS = 36` against a real count of 4 | 29 of the 36 were the R087 defect class |
| 29 | Four `renders_in` citations point at the wrong line: FX-05, **FX-06, FX-07, FX-08** | R091 reported two; this audit found four |
| 30 | DOC-10's manifest note says `regen_interface_guide_icons.mjs` has "ten targets" including `feature_button` | it has **nine**, and `feature_button` is not among them; it is regenerated by `build.py` |
| 31 | `ART_HANDOVER_ARC2.md` off-by-ones: P1 "12 to replace" (13), P4 "7 files" (8) | lines 247 and 250 |
| 32 | Four dead CSS selectors remain: `.fs-hud.scheme-trap/-oil/-pitch`, `.pm-value.pink` | not classList-applied, so outside the liveness gate's class |
| 33 | **The escalation ledger is stale**: R089's E1 to E3 were discharged by R090 to R092, yet every later report still prints "R089's E1 through E3 stand" | six reports carry it forward |

### Open - provider / licence

| # | Finding |
|---|---|
| 34 | **The provider ruling gates whether any placeholder can ship.** Placeholders remain visual-test only; provider attribution rides the batch records as received |
| 35 | `submission-1` remains held on the portal artefact |
| 36 | The SUBMISSION RECORD and EXTERNAL INTAKE conventions were ratified at R086 and are now standing |

---

## A CORRECTION TO MY OWN PRIOR REPORTING

Recorded rather than quietly fixed, per the project's own rule that a wrong belief is evidence.

**At R092 I wrote, and repeated in R092's comms entry, that "SY-13's own note says the plate
must stay subordinate to the symbols". That attribution is wrong.** Verified this audit: the
word "subordinate" appears **zero times** in `art_manifest_arc2.csv`. SY-13's actual text is
`safe_margins: fills the cell; corner radius must match the grid` and a note ending "it is the
single highest-leverage tile in the set". The only occurrence of "subordinate" anywhere in
`docs/art/` is one line in `placeholder_map_2026-08-24.csv`, quoting the **batch record's own
self-description**, not the manifest.

**The design concern stands and finding 17 keeps it. The authority I cited for it does not.**
I attributed a generated batch's self-description to the project's own specification, which is
exactly the kind of drift this project's premise-provenance rule exists to catch.

---

## TASK 4: HOMELESS ASSETS AND ARCHITECTURAL GAPS

### 1. Win and Overdrive celebration art

Four 1920x1080 opaque RGB masters, **10,118,515 bytes = 9.65 MiB**, more than double the entire
47-raster theme set. **Zero render sites.**

| Moment | Component | What it renders | Rasters it loads |
|---|---|---|---|
| Wins 1x to 10x | `WinCelebration.svelte:35` | one CSS text div | **none**; 0 rasters, 0 SVG, no theme store |
| Wins 10x+ | `WinBanner.svelte` | `linear-gradient` plate, tier by `min-height` 110/140/170 | exactly two: `shock_ring.png:293`, `coin.png:304` |
| Max win | `MaxWinCelebration.svelte` | `radial-gradient`, `conic-gradient` halo, **inline SVG** crown `:144-146` | **zero**, and it does not import the theme store |
| Overdrive entry | `FreeSpinsPresentation.svelte` | CSS flare, dip, title card, award burst | six sprites *inside* the card |

**Three independent disqualifiers, each decisive alone.** They are **opaque**, and `WinBanner`
is deliberately a band with the reels visible above and below (`:379-381`), so an opaque
full-screen plate blacks out the game on every win over 10x. The **geometry** is off by an order
of magnitude: `.fs-overlay` is `inset: 0` inside a 616x412 box scaled into a 522x349 slot, and
the only 1920x1080 slots in the game are the two backgrounds. And **baked copy** would collide
with the standing UI-07/UI-08 disposition, since all four moments render live localised strings
across sixteen locales plus the social vocabulary swap.

**Required to make usable:** a component change, plus alpha, plus authoring at the real slot
geometry, plus text-free. That is a design brief, not an asset swap.

### 2. Title states and character poses

Sources exist for title idle/soft-glow, title energy-surge and a robot active pose. **No state
machinery exists anywhere**: `titleState`, `idleState`, `energySurge`, `activePose`, `logoState`,
`glowState` return **0 hits each**; whole-word `pose` and `surge` return 0.

**Required:** new component wiring plus state management. The game has one title raster and one
character raster by design.

**A trap for whoever reaches for the combined robot+car files:** their natural home is
`ui/scene_character_car.png`, which is **SC-07, DEAD**, carrying "delete, do not redraw", and
`scripts/assets/manifest.json:26` still exports it, so it regenerates itself unless the manifest
entry goes in the same edit.

### 3. Live HUD controls

Confirmed by reading source: **`HudOverlay.svelte` contains exactly 0 `<img>` and 27 `<svg>`.**
Line 1708 literally reads "Replaces spin_button.png". The five `themeStore.ts` button fields at
`:79-83` have **exactly one occurrence each in all of `frontend/src`, their own definition, and
zero consumers.**

The seven swapped UI rasters render in `PaytableModal.svelte`'s Interface Guide (eight
`kind: 'img'` rows, `:119-139`) and `feature_button.png` also at `BuyBonus.svelte:117`.

**Required to put this art on the live HUD:** replace the CSS/SVG controls with `<img>`, or
restyle them. A component change.

---

## TASK 5: VISUAL SPOT CHECK

Own preview on 4173; the owner's 5173 untouched. **Assertions, not just screenshots**, because a
screenshot of an idle screen with an informative filename is an empty proof.

**Base game at rest** and **a settled post-spin board** captured to
`.scratch/arc2-audit-2026-08-24/screens/`. Asserted present and loaded, with natural dimensions
read from the DOM:

| Element | natural | rendered box |
|---|---|---|
| `bg_base` / `bg_overdrive` | 1920x1080 | 1440x900 |
| `logo` | 600x120 | 338x68 |
| robot | 680x1344 | 237x465 |
| car | 2840x1000 | 977x344 |
| gauge face / needle | 464x464 | 261x261 / 335x335 |
| symbol tiles | 240x240 | 35 tile plates present |

Nine distinct symbols on the settled board. **Zero console errors, zero page errors, zero
missing-asset requests, no layout breakage.**

**Reads well.** The symbol set is one coherent family in painted gunmetal and carbon with cyan
and magenta accents, silhouettes distinct at cell size. The tile plate gives every cell
mechanical depth and the per-symbol plate tints read clearly (gold for L1, cyan for L3, green for
M3). The workshop background keeps its centre dark and uncluttered exactly where the grid sits,
and the HUD strip holds white text. The robot and car read as substantial. The title is legible
though still the darkest element of the hero group.

**No remaining visual issues observed**, and none were fixed, this being a read-only session.

---

## TASK 6: FINAL STATUS SUMMARY

**1. Total placeholders in the working tree: 27 rasters**, plus one provenance record, 28
modified paths.

**2. Art completeness: 20 of 30 REPLACE rows = 66.7%.** By tier: **P1 100%, P2 80%, P3 75%,
P4 0%.** The entire shortfall is the eight-row FX set plus SC-03 and UI-04, none of which ever
had a candidate offered.

**3. Open decisions for the owner**

| Decision | Type |
|---|---|
| **The provider ruling**, which gates whether any placeholder can ever ship | provider/licence |
| Whether the FX set (8 rows) is commissioned, and how, given the prompt lock forbids the shapes it needs | art + intake |
| Whether the darker title treatment at 3.42:1 is accepted | art |
| Whether the busier tile plate is accepted behind all 35 cells | art |
| WORKSHOP or TESTCELL for SC-01 | art |
| Whether ~9.65 MB of win/Overdrive art gets a component to live in | code |
| Whether the live HUD should carry raster art at all | code |

**4. Recommended next actions, ranked**

1. **Guard the tree against `npm run assets`** (E1). It silently reverts 16 of 27 placeholders.
   This is cheap, it is not an art decision, and it is the only finding here that can destroy
   work already done.
2. **Get the provider ruling.** Everything else is downstream of it; without it the whole
   placeholder set is visual-test only and cannot ship.
3. **Decide the FX set.** It is the entire coverage gap and the only tier at 0%.
4. **Add `--compare-against-shipped` to `ingest.py`** (finding 27). Four sessions have
   hand-rolled the same measurement, and it is the check that caught every non-geometric defect.
5. **Fix `ALPHA_SNAP_FLOOR`** (finding 24) and the misleading refusal message (finding 26).
6. **Sweep the documentation drift**: findings 29 to 33, including the stale escalation ledger.

**5. Restore command**: see FOR THE NEXT SESSION below.

---

## AUDIT METHOD AND ITS LIMITS

Per the project's audit discipline, what this audit did **not** do is stated so silence is not
mistaken for coverage.

**Method.** Four read-only discovery lenses in parallel (inventory, manifest coverage, findings
log, architectural gaps), then one adversarial verification agent whose job was to refute their
load-bearing numbers. Every agent carried an explicit prohibition on running project scripts
that write, and every agent returned a `TREE_AFTER` git status. The visual spot check and all
authorship happened in the main loop, alone.

**Independently verified first-hand by me, not taken from an agent:** the 28/27 path split, the
30 REPLACE rows, the 20/30 coverage figure and the full covered and missing lists, the SY-13
wording error, and the `npm run assets` overwrite set.

**The verification agent found six errors in the discovery lenses**, all corrected above. Two
mattered: the `npm run assets` claim originally said "every swap" when it is 16 of 27, and the
`regen_interface_guide_icons.mjs` claim covered six of seven, not all seven.

**A correction to my own instrument.** My first computation of the `npm run assets` revert set
returned **6**, because I extracted `out` keys from `manifest.json` and the symbols block writes
by naming convention instead (`build.py:307`). The agent's 16 was right and my first pass was
wrong. I recomputed from the convention and now get 16 independently. **A pattern that returns
nothing means the pattern found nothing, not that the thing does not exist.**

**NOT swept.** Audio assets and the sixteen sound files. Locale and player-facing text. The maths
package (locked). CI workflow health beyond the gates named. Performance and bundle timing.
Accessibility beyond the one title contrast measurement. Any surface of the game outside the
theme asset tree and the components that render it.

**NOT gated.** No new gate was built this session; the brief is read-only. Findings 23 to 33 are
all gateable classes and none of them is gated today except the CSS liveness class from R087.

---

## ESCALATIONS

**E1 (R097). `npm run assets` would silently revert 16 of the 27 placeholders and recreate 15
deliberately-absent files. This is the most actionable finding in the audit and it is new.**

Measured from `scripts/assets/manifest.json` plus `build.py` read as text, never executed:

- **Reverts 16**: all ten manifest symbols (`h1, h2, l1, l2, l3, m1, m2, m3, scatter, wild`),
  plus `h1_base`, `h1_spin`, `gauge_needle` (layered), `gauge_face`, `feature_button` (exports),
  and `tile_plate`.
- **Does not touch 11**: both backgrounds, `logo`, `scene_car`, `scene_character`, and the six
  remaining UI controls.
- **Recreates 15 absent files**: ten `_1x` symbol variants, four `brand_mark*` files and
  `gauge_base.png`. **Both `brand_mark` files are already deleted from the tree**, so the build
  would resurrect them, and `manifest.json:26` still exports SC-07 `scene_character_car.png`,
  which its own manifest row calls DEAD.

Nothing warns about this. The mitigation is cheap: either a guard in `build.py` that refuses
when the theme tree is dirty, or a line in the restore instruction. **Until then, do not run
`npm run assets` while the placeholders are in the tree.**

**E2 (R097). The escalation ledger has been carrying discharged items forward for six sessions.**
R089's E1 to E3 were fully discharged by R090, R091 and R092, yet R091 through R096 all still
print "R089's E1 through E3 stand". A reader trusting the ledger would think seven masters are
still blocked when all seven landed. Recorded as the same class as finding 33.

**E3 (R097). Four manifest `renders_in` citations point at CSS rules or variable assignments
rather than the `<img>` they describe**: FX-05, FX-06, FX-07 and FX-08. R091 reported two; there
are four. Plus DOC-10's note miscounts the regen script's targets (nine, not ten, and
`feature_button` is not one of them).

Findings 16 to 36 above carry the full open list with dispositions. Nothing from R086 to R096 was
dropped; items closed by later sessions are marked Closed with the session that closed them.

---

## FOR THE NEXT SESSION

**The working tree is EXACTLY as this audit found it: 27 modified rasters plus the R091
provenance record, verified by identical sha256 fingerprints before and after.**

**RESTORE INSTRUCTION, the full current set:**

```
git checkout -- frontend/public/assets/themes/future-spinner/backgrounds/bg_base.jpg \
                frontend/public/assets/themes/future-spinner/backgrounds/bg_overdrive.jpg \
                frontend/public/assets/themes/future-spinner/symbols/wild.png \
                frontend/public/assets/themes/future-spinner/symbols/scatter.png \
                frontend/public/assets/themes/future-spinner/symbols/h1.png \
                frontend/public/assets/themes/future-spinner/symbols/h1_base.png \
                frontend/public/assets/themes/future-spinner/symbols/h1_spin.png \
                frontend/public/assets/themes/future-spinner/symbols/h2.png \
                frontend/public/assets/themes/future-spinner/symbols/m1.png \
                frontend/public/assets/themes/future-spinner/symbols/m2.png \
                frontend/public/assets/themes/future-spinner/symbols/m3.png \
                frontend/public/assets/themes/future-spinner/symbols/l1.png \
                frontend/public/assets/themes/future-spinner/symbols/l2.png \
                frontend/public/assets/themes/future-spinner/symbols/l3.png \
                frontend/public/assets/themes/future-spinner/symbols/tile_plate.png \
                frontend/public/assets/themes/future-spinner/ui/gauge_face.png \
                frontend/public/assets/themes/future-spinner/ui/gauge_needle.png \
                frontend/public/assets/themes/future-spinner/ui/spin_button.png \
                frontend/public/assets/themes/future-spinner/ui/btn_turbo.png \
                frontend/public/assets/themes/future-spinner/ui/btn_bet_plus.png \
                frontend/public/assets/themes/future-spinner/ui/btn_bet_minus.png \
                frontend/public/assets/themes/future-spinner/ui/feature_button.png \
                frontend/public/assets/themes/future-spinner/ui/btn_menu.png \
                frontend/public/assets/themes/future-spinner/ui/btn_autoplay.png \
                frontend/public/assets/themes/future-spinner/ui/logo.png \
                frontend/public/assets/themes/future-spinner/ui/scene_character.png \
                frontend/public/assets/themes/future-spinner/ui/scene_car.png \
                reports/qa/background_overdrive_derive.json
```

Kit packaging stays forbidden while any placeholder differs from HEAD, and **`npm run assets` is
now a second hazard alongside it** per E1.

Model and effort: one session, unattended, review lane, high effort. Four read-only discovery
lenses plus one adversarial verification pass; authorship and the visual check in the main loop.
No raster was touched.
