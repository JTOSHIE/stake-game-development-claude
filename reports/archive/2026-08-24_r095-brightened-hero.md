# Session Report - R095 BRIGHTENED HERO ASSETS: the contrast threshold is cleared, and the overlay problem is untouched because this is a pure grade (2026-08-24)

Brief saved verbatim: `reports/briefs/FS_FABLE_R095_BRIGHTENED_HERO_Prompt.md`. Branch:
`claude/r095-brightened-hero`, review lane, held for Fable and the owner. **THE FENCE HELD: zero
rasters staged, asserted by a gate. output/ untouched and read only, no generation, no API call,
no kit packaged. The owner's dev server on 5173 was never touched; this session ran its own on
4173 and stopped it. `hero_emblem_512.png` (BR-01, SOLE KEEP) was NOT modified**, verified on
that exact path. Locked paths not involved.

## Preconditions: all met

| Precondition | State |
|---|---|
| On `main`, up to date | Yes. R094 merged as `040fa8c4`; checked out `main` and pulled |
| `arc2-baseline` | **`618b711eebcaed7682aca4f63b16b24911d5c456`**, unchanged |
| `.scratch/art-review/chatgpt-hero-brightened/` | Present, three masters plus record |
| Previous placeholders | All 27 present |

## TASK: all three swapped, nothing forced

| Asset | Target row and path | Dims | Drift | Route |
|---|---|---|---|---|
| Title Lockup (brightened) | **UI-05** `ui/logo.png` | 600x120 | **0.0000%** | native |
| Robot (brightened) | **SC-06** `ui/scene_character.png` | 680x1344 | **0.0000%** | native |
| Car (brightened) | **SC-05** `ui/scene_car.png` | 2840x1000 | **0.0000%** | native |

The raster count stays at **27** because these overwrite the same three files R094 placed rather
than adding new ones. Ingest took the `native` route on all three, preserving the supplied
cutouts.

## R094's E1 is answered, and measured rather than eyeballed

Contrast of the title's opaque pixels (alpha >= 128) against the backdrop it actually sits on,
which measures 23.8 luminance. The large-text threshold is 3:1.

| Version | mean luminance | p95 | contrast (mean) | contrast (p95) |
|---|---|---|---|---|
| OLD shipped, pre-R094 | 176.0 | 245.9 | **5.16:1** | 7.07:1 |
| R094 candidate | 81.6 | 213.6 | **2.58:1** | 6.19:1 |
| **R095 brightened** | **104.1** | **237.2** | **3.20:1** | **6.83:1** |

**The threshold is cleared**, 2.58 to 3.20 against a 3:1 bar, and it reads visibly better on the
workshop background. **It remains well under the 5.16:1 the art it replaces achieved**, so the
lockup is a darker treatment than the original chrome rather than a match for it. That is now a
deliberate style position rather than an accident. The canvas is correct, so a further pass would
land unforced if the owner wants more of the original's brightness back.

## R094's E2 is NOT answered, and could not have been by this batch

**Checked before swapping whether these were re-renders or grades**, because the answer decides
whether the overlay finding could move at all:

| Asset | R094 subject bbox | R095 subject bbox | Verdict |
|---|---|---|---|
| `logo.png` | (8, 17, 591, 101) | (8, 17, 591, 101) | **identical** |
| `scene_character.png` | (160, 31, 489, 1313) | (159, 31, 490, 1314) | 1px, re-encode noise |
| `scene_car.png` | (90, 181, 2756, 905) | (90, 180, 2757, 905) | 1px, re-encode noise |

**These are pure brightness and contrast grades. Every silhouette is unchanged**, so the
percentage-pinned overlays in `SceneGroup.svelte` land exactly where they did. Re-measured in the
running game after the swap rather than assumed:

| Overlay | Pinned at | Inside its subject | Change from R094 |
|---|---|---|---|
| `.antenna-light` | `left: 12%; top: 20%` | **6%** | none |
| `.underglow` | `bottom: 4%; left: 18%` | **64%** | none |
| `.visor-glint` | `left: 32%; top: 17%` | 100% | none |
| `.car-neon` | `left: 8%; bottom: 46%` | 100% | none |

**This is not a criticism of the brightening pass, which did the job it was given.** The point is
that the two findings are independent. E1 was an art grade and is now addressed. E2 is CSS
percentages tuned to a silhouette these assets no longer have, and no amount of regrading will
move it. If this hero set is kept, that re-tune is a small component change and wants its own
brief.

## TASK: report

- **Swapped 3, failed 0.** All at 0.0000% drift through the normal ingest path.
- **The working tree carries 27 modified rasters**, unchanged in count from R094.
- **Zero rasters staged**, asserted by a gate.
- **`hero_emblem_512.png` NOT modified.**
- `npm run build` exit 0.
- Local preview on 4173: **zero console errors, zero page errors, zero missing-asset requests.**
  Remaining contrast issue: none against the 3:1 threshold, though the title stays darker than
  the pre-R094 art. Remaining overlay issue: `.antenna-light` at 6% and `.underglow` at 64%,
  both unchanged and both recorded above.

Payload: `logo.png` 127,594 to 131,684 bytes; `scene_car.png` 1,657,838 to 1,888,353;
`scene_character.png` 474,277 to 498,716.

## Verification

Records-only commit; the swaps are deliberately uncommitted. Close gates chained with `&&` per
(u.1), each exit code the direct left operand. Explicit paths per (k). Remote CI verified with
the full SHA per rule 10.

## ESCALATIONS

**E1 (R095). The `SceneGroup.svelte` overlay re-tune is now the only open item on the hero set**,
and it is unchanged from R094's E2. `.antenna-light` needs its `left` moved from 12% to roughly
23% to reach the new robot's antenna, and `.underglow` needs its `bottom` raised from 4% to
roughly 14% to sit under the car's new bottom edge. Those are estimates from the measured
bounding boxes, not tuned values; a component brief should set them by eye against the art.

**E2 (R095). The title is now a deliberate darker treatment at 3.20:1**, clearing the threshold
but not matching the 5.16:1 of the art it replaces. Recorded as a style position for the owner to
accept or push, rather than as an open defect.

R094's E3 stands and is now stronger: **a `--compare-against-shipped` mode on `ingest.py` would
have told this session in one command that the silhouettes had not moved**, which is the
question that decided whether E2 could be answered here at all. R093's E1 and E2, R092's E1 and
E2, R091's E1 through E4, R090's E1 through E4, R089's E1 through E3, R087's E1 through E4 and
R086's E2 through E5 all stand.

## FOR THE NEXT SESSION

**The working tree is LEFT SWAPPED with 27 modified rasters plus the R091 provenance record.**

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
now as complete as the available masters allow.** What remains is the provider ruling that gates
whether any of it ships, the `SceneGroup.svelte` overlay re-tune above, R091's homeless win and
Overdrive art, and the tooling items from R090, R091 and R094.

Model and effort: one session, unattended, review lane. Nothing was forced; all three passed at
zero drift on the first attempt.
