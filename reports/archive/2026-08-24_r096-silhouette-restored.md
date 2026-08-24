# Session Report - R096 SILHOUETTE-RESTORED HERO: the proportions came back, the antenna light went from 6 per cent on the robot to 89, and the CSS re-tune is no longer needed (2026-08-24)

Brief saved verbatim: `reports/briefs/FS_FABLE_R096_SILHOUETTE_RESTORED_Prompt.md`. Branch:
`claude/r096-silhouette-restored`, review lane, held for Fable and the owner. **THE FENCE HELD:
zero rasters staged, asserted by a gate. output/ untouched and read only, no generation, no API
call, no kit packaged. The owner's dev server on 5173 was never touched; this session ran its own
on 4173 and stopped it. `hero_emblem_512.png` (BR-01, SOLE KEEP) was NOT modified**, verified on
that exact path. Locked paths not involved.

## Preconditions: all met

| Precondition | State |
|---|---|
| On `main`, up to date | Yes. R095 merged as `6509c7b8`; checked out `main` and pulled |
| `arc2-baseline` | **`618b711eebcaed7682aca4f63b16b24911d5c456`**, unchanged |
| `.scratch/art-review/chatgpt-hero-silhouette-restored/` | Present, three masters plus record |
| Previous placeholders | All 27 present |

## TASK: all three swapped

| Asset | Target row and path | Dims | Drift | Route |
|---|---|---|---|---|
| Robot, restored proportions | **SC-06** `ui/scene_character.png` | 680x1344 | **0.0000%** | native |
| Car, taller and fuller | **SC-05** `ui/scene_car.png` | 2840x1000 | **0.0000%** | native |
| Title, extra-bright | **UI-05** `ui/logo.png` | 600x120 | **0.0000%** | native |

Raster count stays at **27**; these overwrite the same three files.

## THE ADDITIONAL CHECK, answered with numbers

**Because the swaps are never committed, `HEAD` still holds the original pre-R094 art**, so all
three generations can be compared against the same reference rather than against each other.
Subject bounding boxes:

| Asset | Original (pre-R094) | R095 in tree | **R096 now** |
|---|---|---|---|
| `scene_character.png` | 553x1250 | 330x1283, **width -40.3%** | **504x1284, width -8.9%** |
| `scene_car.png` | 2729x914 | 2667x725, **height -20.7%** | **2750x842, height -7.9%** |
| `logo.png` | 488x113 | 584x85 | 584x85, **unchanged** |

**Is the robot silhouette fuller? Yes.** The width deficit against the original closes from
**40.3 per cent to 8.9 per cent**. On screen it now reads as a substantial armoured figure with
proper limb mass rather than the thin one R094 introduced.

**Does the car have more visual height and weight? Yes.** Its height deficit closes from **20.7
per cent to 7.9 per cent**, and its width is now marginally above the original at +0.8 per cent.
The body reads properly again with the magenta side line running its length.

**The title is a pure grade**, its bounding box byte-identical to R095's, so this pass changed
only its brightness.

## AND THE OVERLAY QUESTION IS ANSWERED: no CSS re-tune is needed

This is the third session on this thread and the first where the numbers move. Re-measured in the
running game after the swap, mapping each subject's true bounding box into screen coordinates and
intersecting it with where each overlay actually lands:

| Overlay | Pinned at | R094 / R095 | **R096** |
|---|---|---|---|
| `.antenna-light` | `left: 12%; top: 20%` | **6%** inside the robot | **89%** |
| `.underglow` | `bottom: 4%; left: 18%` | 64% inside the car | **76%** |
| `.visor-glint` | `left: 32%; top: 17%` | 100% | 100% |
| `.car-neon` | `left: 8%; bottom: 46%` | 100% | 100% |

**`.antenna-light` is effectively resolved at 89 per cent.** The orange orb sits on the antenna
where the CSS was written to put it. **I withdraw R095's E1 estimate** that it needed `left`
moved from 12 to about 23 per cent: the art moved instead, and the CSS is correct as authored.

**`.underglow` at 76 per cent is not a defect either, and it would be over-reporting to call it
one.** Two measurements say so. Its overhang below the car's bottom edge **halves, 21.8px to
10.9px** at the rendered size. And more importantly, **a hover-pad glow should sit slightly under
the vehicle**, which is exactly what it now does. What looked wrong at 64 per cent was the glow
detaching from a car that had shrunk away from it; at 76 per cent it reads as the effect it was
written to be.

**So the correct disposition is that R094's E2 and R095's E1 are CLOSED by art rather than by
code**, and no change to `SceneGroup.svelte` is wanted.

## The title, which keeps improving without returning to the original

Contrast of the title's opaque pixels against the backdrop it sits on, 3:1 being the large-text
threshold:

| Version | mean luminance | contrast (mean) | contrast (p95) |
|---|---|---|---|
| Original, pre-R094 | 176.0 | 5.16:1 | 7.07:1 |
| R094 | 81.6 | 2.58:1 | 6.19:1 |
| R095 | 104.1 | 3.20:1 | 6.83:1 |
| **R096 extra-bright** | **112.5** | **3.42:1** | **6.86:1** |

Comfortably over the threshold and brighter again, and still a darker treatment than the chrome
it replaces. That remains a style position for the owner rather than a defect; the canvas is
correct, so any further pass lands unforced.

## TASK: report

- **Swapped 3, failed 0.** All at 0.0000% drift through the normal ingest path, native route.
- **The working tree carries 27 modified rasters**, unchanged in count.
- **Zero rasters staged**, asserted by a gate.
- **`hero_emblem_512.png` NOT modified.**
- `npm run build` exit 0.
- Local preview on 4173: **zero console errors, zero page errors, zero missing-asset requests, no
  layout breakage.** Silhouette and overlay observations are the two sections above.

Payload: `scene_character.png` 498,716 to 791,212 bytes; `scene_car.png` 1,888,353 to 2,169,737;
`logo.png` 131,684 to 132,328. The two scene assets are meaningfully larger for the fuller
silhouettes, which is the trade being made and is recorded rather than hidden.

## Verification

Records-only commit; the swaps are deliberately uncommitted. Close gates chained with `&&` per
(u.1), each exit code the direct left operand. Explicit paths per (k). Remote CI verified with
the full SHA per rule 10.

## ESCALATIONS

**R094's E2 and R095's E1 are CLOSED**, by art rather than by code. No `SceneGroup.svelte` change
is wanted, and the estimates R095 offered for the overlay percentages are withdrawn.

**E1 (R096). The title stays a darker treatment at 3.42:1 against the original's 5.16:1.** Over
the threshold, improving each pass, and a style position rather than a defect. Recorded so it is
not mistaken for an unresolved finding.

**E2 (R096). The two scene assets grew substantially for the fuller silhouettes**,
`scene_car.png` to 2.17 MB and `scene_character.png` to 791 KB. Against a 25 MiB kit budget this
is comfortable, but the scene pair is now the largest raster group in the theme after the
backgrounds, and it is the direction rather than the absolute that is worth knowing.

**R094's E3 is now the strongest surviving tooling item**: a `--compare-against-shipped` mode on
`ingest.py` would have produced this session's entire ADDITIONAL CHECK in one command, and the
same measurement has now been hand-rolled three sessions running. R093's E1 and E2, R092's E1 and
E2, R091's E1 through E4, R090's E1 through E4, R089's E1 through E3, R087's E1 through E4 and
R086's E2 through E5 all stand.

## FOR THE NEXT SESSION

**The working tree is LEFT SWAPPED with 27 modified rasters plus the R091 provenance record.**
**The hero set now has no open findings against it.**

**RESTORE INSTRUCTION, all currently modified paths:**

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

Kit packaging stays forbidden while any placeholder differs from HEAD. **The art side of arc 2 is
complete and carries no open defect.** What remains is the provider ruling that gates whether any
of it ships, R091's homeless win and Overdrive art, and the tooling items from R090, R091 and
R094.

Model and effort: one session, unattended, review lane. Nothing was forced; all three passed at
zero drift on the first attempt, and the session's real work was the measurement that closed two
standing findings.
