# Session Report - R094 CORRECTED HERO ASSETS: all three pass at zero drift, and three things the gate cannot see (2026-08-24)

Brief saved verbatim: `reports/briefs/FS_FABLE_R094_CORRECTED_HERO_ASSETS_Prompt.md`. Branch:
`claude/r094-corrected-hero-assets`, review lane, held for Fable and the owner. **THE FENCE HELD:
zero rasters staged, asserted by a gate. output/ untouched and read only, no generation, no API
call, no kit packaged. The owner's dev server on 5173 was never touched; this session ran its own
on 4173 and stopped it. `hero_emblem_512.png` (BR-01, SOLE KEEP) was NOT modified**, confirmed by
`git status` on that exact path returning nothing. Locked paths not involved.

## Preconditions: all met

| Precondition | State |
|---|---|
| On `main`, up to date | Yes. R093 merged as `306f2a76`; checked out `main` and pulled |
| `arc2-baseline` | **`618b711eebcaed7682aca4f63b16b24911d5c456`**, unchanged |
| `.scratch/art-review/chatgpt-hero-corrected-sizes/` | Present, three masters plus record |
| Previous 24 placeholders | All present |

## TASK: all three swapped, nothing forced

| Asset | Source | Target row and path | Dims | Drift |
|---|---|---|---|---|
| Title Lockup | `01-future-spinner-title-lockup-600x120.png` | **UI-05** `ui/logo.png` | 600x120 | **0.0000%** |
| Robot | `02-robot-character-680x1344.png` | **SC-06** `ui/scene_character.png` | 680x1344 | **0.0000%** |
| Car | `03-car-2840x1000.png` | **SC-05** `ui/scene_car.png` | 2840x1000 | **0.0000%** |

**Taking the sizes from the shipped targets worked exactly as R093 predicted**, the same way the
tile plate did at R092 once rebuilt to the specified canvas. No flag was passed and nothing was
forced.

**Ingest took the `native` route on all three**, recorded as *"source supplied its own cutout"*.
Worth confirming rather than assuming: these arrive as RGBA with real alpha, and `ingest.py`'s
own docstring warns that running the keyer over an already-transparent PNG is the worse failure
direction, because the keyer reads RGB only and would silently discard the supplied cutout while
dimensions and format still looked right.

## The gate passed, and three things still want the owner's eye

Aspect and dimension are the only things the gate measures. CLAUDE.md's own test for adopting
external art asks for more: *"Measure it against what it replaces rather than asserting the
answer. For a subject with a silhouette, the subject bounding box; a changed silhouette breaks
layout, because overlay effects are positioned by percentage within their layer."* Applying that
test:

### 1. The title is materially less legible

Measured on opaque pixels (alpha >= 128), and against the backdrop the title actually sits on:

| | mean luminance | p95 | contrast vs backdrop (mean) | contrast (p95) |
|---|---|---|---|---|
| OLD shipped | **176.0** | 245.9 | **5.16:1** | 7.07:1 |
| NEW candidate | **81.6** | 213.6 | **2.58:1** | 6.19:1 |

Backdrop luminance behind the title band measures 23.8. **The contrast ratio roughly halves and
lands under the 3:1 large-text threshold at the mean**, while the bright highlights still reach
6.19:1. So the lettering now reads as dark metal with lit edges rather than the bright chrome it
replaces, and on the workshop background it is noticeably harder to read. This is not a gate
failure and it is an art call rather than a builder's, but it is the single most visible change
in this swap.

### 2. The silhouettes moved, and the precedent bar was far tighter

| Asset | Old subject bbox | New subject bbox | Delta |
|---|---|---|---|
| `logo.png` | 488x113 | 584x85 | width **+19.7%**, height **-24.8%** |
| `scene_character.png` | 553x1250 | 330x1283 | **width -40.3%**, height +2.6% |
| `scene_car.png` | 2729x914 | 2667x725 | width -2.3%, **height -20.7%** |

For comparison, CLAUDE.md records the July adoption of the enhanced scene art as verified with
`scene_character.png` *"subject bounding box matching the original to 0.7%"* and `scene_car.png`
*"subject bounding box identical at 2729x914, 40.7% transparent in both"*. The robot is now a
much slimmer figure and the car much flatter than the art each replaces.

### 3. Two percentage-positioned overlays no longer sit on their art

This is the concrete consequence CLAUDE.md's test exists to catch, and it is measured in the
running game rather than reasoned about. `SceneGroup.svelte` pins four decorative overlays by
percentage of their layer. Mapping each new subject into screen coordinates and intersecting:

| Overlay | Pinned at | Inside its subject | Verdict |
|---|---|---|---|
| `.antenna-light` | `left: 12%; top: 20%` | **6%** | **misaligned** |
| `.underglow` | `bottom: 4%; left: 18%` | **64%** | partially detached |
| `.visor-glint` | `left: 32%; top: 17%` | 100% | fine |
| `.car-neon` | `left: 8%; bottom: 46%` | 100% | fine |

- **`.antenna-light`** lands almost entirely in empty space beside the robot, because the new
  subject starts at x 160 of 680 where the old one started at x 13. The art carries its own
  orange orb at the antenna tip, so the visible damage is a faint blink floating off-model
  rather than a missing light.
- **`.underglow`** hangs roughly 22px below the car's new bottom edge, because the silhouette is
  20.7% shorter while the glow stays pinned at `bottom: 4%`.

**None of this is a reason to reject the art and it was not rejected.** The swaps are in the tree
for the look pass exactly as the brief asks.

## TASK: report

- **Swapped 3, failed 0.** All at 0.0000% drift through the normal ingest path.
- **The working tree now carries 27 modified rasters**, up from 24.
- **Zero rasters staged**, asserted by a gate.
- **`hero_emblem_512.png` NOT modified**, verified on that exact path.
- `npm run build` exit 0.
- Local preview on 4173: **zero console errors, zero page errors, zero missing-asset requests.**
  No layout breakage in the sense of broken boxes or overflow; the two overlay misalignments
  above are the layout finding, and they are cosmetic rather than structural.

Payload: `logo.png` 106,148 to 127,594 bytes; `scene_car.png` 1,036,271 to 1,657,838;
`scene_character.png` 629,245 to 474,277.

## Verification

Records-only commit; the swaps are deliberately uncommitted. Close gates chained with `&&` per
(u.1), each exit code the direct left operand. Explicit paths per (k). Remote CI verified with
the full SHA per rule 10.

## ESCALATIONS

**E1 (R094). The title lockup halves its contrast against the background, 5.16:1 to 2.58:1
mean.** The canvas is now correct, so if the darkness is not the intent a re-render at the same
600x120 would land unforced. Owner's call on whether the darker treatment is wanted.

**E2 (R094). If this hero set is kept, `SceneGroup.svelte`'s overlay percentages want re-tuning
to the new silhouettes.** Specifically `.antenna-light` (6% on subject) and `.underglow` (64%).
That is a small component change and its own brief; it was not attempted here because this
session's brief is an asset swap and R093's instruction not to invent wiring still frames the
arc.

**E3 (R094). The subject-bounding-box test should be part of the swap gate, not just the
adoption prose.** CLAUDE.md has required it since July and it is currently applied by hand.
Three sessions in a row have now turned up something the aspect gate cannot see (R090's M2
headroom, R092's plate opacity and corner source, R094's silhouette drift and overlay
misalignment). A `--compare-against-shipped` mode on `ingest.py` that prints the old and new
subject bbox and flags a delta beyond a threshold would make it structural. Tooling change,
review lane.

R093's E1 and E2 stand, as do R092's E1 and E2, R091's E1 through E4, R090's E1 through E4,
R089's E1 through E3, R087's E1 through E4 and R086's E2 through E5.

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

Kit packaging stays forbidden while any placeholder differs from HEAD. **Every REPLACE row that
has a candidate now has one in the tree.** What remains open is the provider ruling, the title
darkness and overlay re-tune above, the homeless win and Overdrive art from R091, and the two
tooling bugs from R090 and R091.

Model and effort: one session, unattended, review lane. Nothing was forced and no flag was
passed; all three passed the gate at zero drift on the first attempt.
