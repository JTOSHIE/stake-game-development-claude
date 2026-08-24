# Session Report - R093 HERO TITLE AND CHARACTER: nothing landed, three refused on aspect and three have nowhere to go, with the exact canvases to re-render (2026-08-24)

Brief saved verbatim: `reports/briefs/FS_FABLE_R093_HERO_TITLE_CHARACTER_Prompt.md`. Branch:
`claude/r093-hero-title-character`, review lane, held for Fable and the owner. **THE FENCE HELD:
zero rasters staged, asserted by a gate. output/ untouched and read only, no generation, no API
call, no kit packaged. The owner's dev server on 5173 was never touched; this session ran its own
on 4173 and stopped it.** Locked paths not involved.

**ZERO SWAPS THIS SESSION.** The working tree is unchanged from R092: the same twenty-four
placeholders, plus the R091 provenance record still deliberately dirty. Recorded plainly, because
a session that lands nothing is a real outcome and the product here is the re-render
specification rather than a diff.

## Preconditions: all met

| Precondition | State |
|---|---|
| On `main`, up to date | Yes. R092 merged as `ba430367`; checked out `main` and pulled |
| `arc2-baseline` | **`618b711eebcaed7682aca4f63b16b24911d5c456`**, unchanged |
| `.scratch/art-review/chatgpt-hero-character-masters/` | Present, eight masters plus two records |
| Previous 24 placeholders | All present |

## The protected emblem was never a candidate and was not touched

`ui/hero_emblem_512.png` is **BR-01, the owner-ruled SOLE KEEP**: "Do not replace, restyle or
recolour. It is the palette anchor every other asset harmonises with." A brief asking to place a
"Main Title lockup" could plausibly have been aimed at it. It was not, and it was not written to.
The only live title raster in the tree is **UI-05 `ui/logo.png`**, and that is where the lockup
was tested. `ui/subtitle.png` (UI-06) and `ui/hero_icon_96.png` (BR-02) are both **DEAD** and take
no replacement by design.

## THREE WRONG-SPEC, measured by running the real ingest

Not predicted. Each was put through `scripts/assets/assetforge/ingest.py` against its live
REPLACE row and refused on the 1% aspect gate:

| Asset | Source | Target row and path | Target dims | Drift |
|---|---|---|---|---|
| Main Title lockup | `01-title-main-1600x600.png` 1600x600 (2.6667) | **UI-05** `ui/logo.png` | 600x120 (5.0000) | **46.67%** |
| Robot main | `06-robot-only-main-800x1000.png` 800x1000 (0.8000) | **SC-06** `ui/scene_character.png` | 680x1344 (0.5060) | **58.12%** |
| Car only | `07-car-only-1400x600.png` 1400x600 (2.3333) | **SC-05** `ui/scene_car.png` | 2840x1000 (2.8400) | **17.84%** |

All three targets are live and confirmed rendering: `logo.png` at `App.svelte:2034` and `:2080`
and `HeroSplash.svelte:118`; `scene_car.png` at `SceneGroup.svelte:62`; `scene_character.png` at
`SceneGroup.svelte:71`.

## THREE NO-ROW

| Asset | Reason |
|---|---|
| Title Idle / Soft Glow | No shipped raster for a title state, and **no wiring anywhere**: a full-tree search for title-state, glow-state or surge handling returns nothing |
| Title Energy Surge | As above |
| Robot Active Pose | No shipped raster for a character pose, and no pose wiring |

The structural reason is the same in all three cases: **the game has one title raster and one
character raster, not a set of states.** Adding states means new component wiring, which the
brief explicitly forbids in this session, so all three are recorded and skipped rather than
half-installed.

## The exact canvases to re-render

This is what the session is actually for. Each lands at **0.0000% drift** and would then pass
ingest unmodified and unflagged, exactly as the tile plate did at R092 once it was rebuilt to the
732x612 specified at R090.

| Asset | Re-render at | Aspect | Larger options at 0.0000% |
|---|---|---|---|
| Title | **600x120** | 5:1 | 2x `1200x240`, 3x `1800x360` |
| Robot | **680x1344** | 85:168 | 2x `1360x2688` |
| Car | **2840x1000** | 71:25 | 1x is the sensible ask; the shipped file is already large |

### Why the title shape matters beyond the gate

`.logo-box` is a **380x60 strip** and `.game-logo-img` is `max-height: 60px; max-width: 380px;
object-fit: contain`. Measured in the running game the box renders at **338x68**, and the current
5:1 wordmark fills it. A 2.6667:1 lockup contained in that same box renders **180x68, leaving 47%
of the box empty**, and reads materially smaller than the wordmark it would replace.

**The slot is a wide strip by construction.** If the owner wants a tall, blocky title lockup
instead, that is a change to `.logo-box`, to `.game-logo-img`, to the portrait wordmark rule and
to the UI-05 manifest row. It is a layout brief, not an asset swap, and it is out of scope here
by the brief's own instruction not to invent wiring.

### How the two scene assets fail, which differs from the tile plate

`.car-img` and `.char-img` both use `object-fit: contain`, so a wrong-aspect file would
**letterbox rather than distort at render**. The gate still refuses correctly, because ingest
must resize the delivered file to the exact target dimensions and that squashes it **in the
file**. Measured, if they were forced through and then contained:

| Asset | Contained render in its live box | Empty |
|---|---|---|
| Car | 803x344 in a 977x344 box | **18%** |
| Robot | 238x298 in a 238x466 box | **36%** |

The robot in particular would read as a small figure floating in a tall slot rather than the
feature hero SC-06 describes.

## Two files in the folder were out of scope

`04-robot-car-main-1400x1000.png` and `05-robot-car-active-1400x1000.png` are the pre-separation
combined hero. The brief named the separated layers, so these were not used. **Flagged for
whoever reaches for them next:** their natural home is `ui/scene_character_car.png`, which is
**SC-07, DEAD**, carrying an explicit "delete, do not redraw" and a trap recorded in its own row,
it **regenerates itself** from `scripts/assets/manifest.json` on the next `npm run assets` unless
the manifest entry is removed in the same edit.

## TASK: report

- **Swapped 0, WRONG-SPEC 3, NO-ROW 3.**
- **The working tree still carries 24 modified rasters**, unchanged from R092.
- **Zero rasters staged**, asserted by a gate.
- `npm run build` exit 0.
- Local preview on 4173: **zero console errors, zero page errors, zero missing-asset requests, no
  layout breakage.** All three live targets load at their shipped dimensions (`logo.png` 600x120,
  `scene_car.png` 2840x1000, `scene_character.png` 680x1344).

## Verification

Records-only commit. Close gates chained with `&&` per (u.1), each exit code the direct left
operand. Explicit paths per (k). Remote CI verified with the full SHA per rule 10.

## ESCALATIONS

**E1 (R093). The hero batch was authored to its own canvases rather than to the shipped slots,
and this is now the third time.** R086 and R089 refused a 480x480 background against 1920x1080;
R090 refused a square tile plate against 244x204; both were fixed by a re-render to the stated
target and then passed at zero drift. The same fix applies here. **The cheap structural
prevention is to hand the generator the target dimensions from
`docs/art/art_manifest_arc2.csv` up front**, because the manifest already carries a
`target_dimensions` column for all 47 rows and every refusal so far has been an aspect that
column would have supplied.

**E2 (R093). The title, the title states and the character poses are asking for a richer hero
presentation than the components support.** The game has one title raster in a 380x60 strip and
one character raster, with no state or pose machinery. Delivering idle, surge and active-pose art
implies an animated title and a reactive character, which is a component brief with real scope.
Worth an owner decision before more state art is commissioned, and it is the same shape as R091's
E2 about the homeless win and Overdrive art.

R092's E1 and E2 stand, as do R091's E1 through E4, R090's E1 through E4, R089's E1 through E3,
R087's E1 through E4 and R086's E2 through E5.

## FOR THE NEXT SESSION

**The working tree is unchanged from R092: 24 modified rasters plus the R091 provenance record.**
The restore command is identical to R092's and is repeated here so it stays with the newest
session.

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
                reports/qa/background_overdrive_derive.json
```

Kit packaging stays forbidden while any placeholder differs from HEAD. The three re-render
canvases above are the concrete next art ask; everything else open is unchanged from R092.

Model and effort: one session, unattended, review lane. Nothing was forced and no flag was
passed; the three refusals are the gate working as designed.
