# Session Report - R086 PLACEHOLDER INTEGRATION: eight swapped locally, ten refused by the gate, and the per-symbol idles found dead in the CSS (2026-08-24)

Brief saved verbatim: `reports/briefs/FS_FABLE_R086_PLACEHOLDER_INTEGRATION_Prompt.md`.
Branch: `main`. **THE FENCE HELD: `git diff --cached` carried zero raster additions or
modifications at every commit, asserted by a gate chained with `&&` rather than by
intention. `output/` is now gitignored. Nothing under `output/imagegen` was moved, edited,
deleted or committed. No generation, no API call. No kit packaged.** Locked paths untouched.
**The working tree is deliberately LEFT SWAPPED for the owner's look pass.**

## Preconditions: all met

| Precondition | State |
|---|---|
| On `main`, pulled | Yes, already up to date |
| Modified tracked files at start | **0** (only untracked `output/`) |
| `arc2-baseline` resolves to | **`618b711e`** (`618b711eebcaed7682aca4f63b16b24911d5c456`), confirmed via `arc2-baseline^{commit}` |
| `git check-ignore output/imagegen` at start | **exit 1, NOT ignored**, so `output/` was added to `.gitignore` this session as the precondition directs |
| `git check-ignore output/imagegen` at close | exit 0, ignored |

## TASK 1: the snapshot, and it raced the batch

**126 files, 105,317,272 bytes, newest mtime `2026-08-24T12:38:29`**, copied with `cp -a`
to `.scratch/placeholder-2026-08-24/src/` (gitignored per (h.1)).

**THE SNAPSHOT CAUGHT `support-states` MID DELIVERY, and that is recorded rather than
smoothed over.** At the snapshot instant that folder held only `source-1254/` and
`work-alpha/`, with an EMPTY `review/`. Its seven top level masters carry mtime **12:39**
and its `PROMPTS_AND_QA.md` **12:41**, both after the snapshot instant, so they are out of
scope by the brief's own rule that everything after the snapshot instant is out of scope.

**Checked rather than assumed that this costs nothing.** All seven are pressed states, a
simple win banner, a max win frame and a feature buy alternate. The manifest has no
REPLACE row for a pressed state and none for a win banner, so **no swap is missed**. The
disposition would be NO-ROW for all seven had they been in scope.

## TASK 2: the mapping table

**`docs/art/placeholder_map_2026-08-24.csv`, 126 rows, one per snapshot file.** Dimensions
and alpha are read from each file's own header, never from the batch record's QA table.

| Status | Count |
|---|---|
| MAPPED | **8** |
| WRONG-SPEC | **8** |
| AMBIGUOUS | **2** |
| NO-ROW | **14** |
| INTERMEDIATE | **94** |

**`source-1254/` is classified INTERMEDIATE, and the brief's own list does not settle it.**
The brief names `chroma`, `work-alpha`, `review` and `preview-64px` and omits
`source-1254`, which five of the six batches carry. Resolved by measurement rather than by
reading the omission as a designation:

- Resizing a `work-alpha` file to 480 and compositing on green reproduces the delivered top
  level file **exactly**, which identifies work-alpha as the step immediately before
  delivery and `source-1254` as one step further upstream again.
- **`source-1254` fails the batch's own delivery QA.** Every record asserts all four canvas
  corners are exactly `#00FF00`. Measured: the delivered `01-ui-gauge-face.png` corners are
  `(0,255,0)`; its `source-1254` counterpart reads `(23,240,19)`, `(23,241,18)`,
  `(24,237,21)`, `(18,242,17)`. A file that fails the delivery spec is not the delivery.
- Every `source-1254` file carries a `-source` suffix, as `work-alpha` carries `-alpha`.
  Delivery files carry no suffix.

**Selection, where several candidates target one row.**

- **Tile plate, RESOLVED.** `06-tile-plate-refinement-v2.png` supersedes `07-tile-plate.png`
  on three independent signals: the batch record self declares it a *"refinement v2 ...
  while retaining the original subordinate reel cell role"*; it is newer (08-24 against
  08-22); and the newest batch record cites it under primary style references while never
  citing the other. Recorded as the selected candidate, which then still refused on the gate.
- **Backgrounds, NOT RESOLVED, and this is an owner decision.** Neither self declares as a
  successor and the subjects differ, a layered workshop against a dyno test cell. Two rooms,
  not two grades of one room, so recency is not a supersede rule here, and this batch family
  demonstrably says "v2" and "refinement" when it means supersede. Both carry identical
  role language marking them as peers. Recorded AMBIGUOUS.

**A near miss worth recording: the batch records use their OWN sequence labels and they
collide with manifest ids.** `future-spinner-ui-support-480-masters` labels its assets
"UI-01" to "UI-05", and its **"UI-04 Secondary Panel"** is batch numbering that does NOT
correspond to manifest `UI-04`, which is `ui/jet_nozzle.png`. The manifest has no UI-03 row
at all, proving the two schemes are unrelated. Mapping by that label would have been a
silent wrong row ingest that every dimension check would have passed.

## TASK 3: the local swap, working tree only

**Eight shipped paths overwritten in the working tree. Nothing staged, ever.**

| Manifest id | Shipped path | Source | Drift |
|---|---|---|---|
| SY-01 | `symbols/wild.png` | `01-wild.png` | 0.0% |
| SY-02 | `symbols/scatter.png` | `02-scatter-energy-core.png` | 0.0% |
| SY-03 | `symbols/h1.png` | `03-h1-spinning-rim-complete.png` | 0.0% |
| SY-04 | `symbols/h1_base.png` | `04-h1-spinning-rim-base.png` | 0.0% |
| SY-05 | `symbols/h1_spin.png` | `05-h1-spinning-rim-spin.png` | 0.0% |
| SY-06 | `symbols/h2.png` | `06-h2-turbocharger.png` | 0.0% |
| UI-01 | `ui/gauge_face.png` | `01-ui-gauge-face.png` | 0.0% |
| UI-02 | `ui/gauge_needle.png` | `02-ui-single-needle.png` | 0.0% |

All under `frontend/public/assets/themes/future-spinner/`. Delivery artefacts and the ingest
ledger are at `.scratch/placeholder-2026-08-24/delivery/`.

**Counts: swapped 8, wrong-spec 8, ambiguous 2, no-row 14, intermediate 94.**

**TEN REFUSALS, and the gate was right on every one.** The aspect check runs on the SOURCE
before any resize, tolerance 1 per cent:

| Row | Candidate | Source | Target | Drift |
|---|---|---|---|---|
| SY-08 | M2 coilover | 1016x1548 | 240x240 | 34.37% |
| SY-09 | M3 dash readout | 1536x1024 | 240x240 | 50.00% |
| SY-10 | L1 lug nut | 1016x1547 | 240x240 | 34.32% |
| SY-11 | L2 spark plug | 1016x1548 | 240x240 | 34.37% |
| SY-12 | L3 piston | 1016x1548 | 240x240 | 34.37% |
| SY-13 | both tile plates | 480x480 | 244x204 | 16.39% |
| SC-01 | both backgrounds | 480x480 | 1920x1080 | 43.75% |
| UI-05 | wordmark | 480x480 | 600x120 | 80.00% |

**`--allow-aspect-change` IS NOT A WORKAROUND HERE, and recording that matters more than
the refusals.** `ingest.py` resizes straight to target and carries no pad, letterbox or crop
path anywhere, so forcing the flag ships distorted art past the same dimension assertion the
module's own docstring warns about. The real remediations differ per row: the five native
symbol masters need a centred pad to square; SY-13 needs a 244x204 CROP; UI-05 is a
composition mismatch, a two line `FUTURE` over `SPINNER` lockup against a 5:1 single line
strip, which no resize or crop reaches. **SC-01 and SC-02 fail on RESOLUTION independently
of aspect: a 480x480 source is a 4x upscale short of 1920x1080, into the row the manifest
calls "the dominant surface in the game".** And **SC-02 has no candidate at all**: its row
reads *"DERIVED, NOT AUTHORED: it is a colour grade of bg_base at identical geometry. Supply
as a matched pair or the crossfade will jump."*

**22 of the 30 REPLACE rows remain unfilled**: SY-07 to SY-13, SC-01, SC-02, SC-03, SC-05,
SC-06, UI-04, UI-05 and FX-01 to FX-08. Verified that this is absence rather than an
oversight: no candidate for M1 (SY-07), the jet nozzle (UI-04), the bezel (SC-03), the car
or the character (SC-05, SC-06), or any FX sheet exists in any batch. The FX set was
actively excluded by the prompt lock, which forbids particles and baked glow and requires a
centred isolated object, geometrically incompatible with a 6 up flipbook strip.

## TASK 4: the SY-09 transcription

`docs/art/art_manifest_arc2.csv` row SY-09 corrected, text only, ratified by the owner's
paste of the brief. Role is now **"M3 Holographic Dash Readout, mid symbol"**, and the note
records that **FX-01's overlay sheet semantics become the HOLO FLICKER sheet, with the
layout spec UNCHANGED at six frames of 200x200 packed left to right in one 1200x200 row**.
The file still parses at 47 rows, 30 REPLACE / 10 REGEN / 6 DEAD / 1 KEEP.

**No component or code change was made this session.** Two findings that would have required
one are recorded under ESCALATIONS instead, per the brief.

## TASK 5: build, run, look, measure

**BUILD PASSES. `npm run build` exit 0**, no errors, no warnings of substance. The eight
swapped rasters propagate to `dist` byte identical, verified by sha256 on three of them.
`build-info` reports `v10 8e80e951 DIRTY 93 files, 12850091 bytes`; DIRTY is expected and
correct, the working tree carries the swaps. **`npm run assets` was deliberately NOT run**:
`build.py` regenerates from the vector masters and would have overwritten the swaps.

**Six captures in `.scratch/placeholder-2026-08-24/screens/`, and nothing left `.scratch`**:
board at rest, spin in motion, paytable, win presentation, feature screen, small scale reel
context, plus `measure.json`.

**Zero console errors, zero page errors, zero failed or 4xx asset requests** across all
captures. No layout breakage observed. The new art reads correctly in the win presentation,
where the three H1 rims render with a clean silhouette and no visible green fringe.

**One rendering note that is DEV only and not a defect**: the board at rest before any spin
shows every cell as the same L3 piston, because the template seeds each cell with
`symbolBaseSrc('L3')` at `GameGrid.svelte:1197` and cells are painted imperatively on the
first spin. In dev there is no RGS to populate a board at boot. The swapped art becomes
visible from the first spin onward.

### The DOM measurement, and it did not return the number it went looking for

**M2 idle bob excursion: 0.000px. L3 idle pump excursion: 0.000px.** Not a measurement
failure. **The CSS rules do not exist in the built bundle.**

Svelte's CSS scoper prunes selectors it cannot see in the markup. Nine of the ten per symbol
idle classes are added ONLY by `img.classList.add(idleClass(sym))` at
`GameGrid.svelte:575`, never written literally in the template, so their selectors are
removed as unused while their `@keyframes` survive as orphans. **`idle-breathe` is the sole
survivor, because it is the one class written literally at `GameGrid.svelte:1197`.**

Verified three independent ways:

1. **Rule count in the built CSS**: `.idle-breathe` has 1 rule; `.idle-coil`, `.idle-pump`,
   `.idle-charge`, `.idle-rev`, `.idle-flame`, `.idle-arc`, `.idle-rings`, `.idle-rays` and
   `.idle-glint` have **0** each. All nine `@keyframes` blocks are present and orphaned.
2. **Live `getComputedStyle`** on a real settled tile with the class applied returns
   `animationName: none` for all nine, and `s-...-idle-breathe 3.4s` for the survivor.
3. **`prefers-reduced-motion` pinned to `no-preference`** in the harness and asserted false
   in the page, so the reduce media block is ruled out as an explanation.

**Consequence: every symbol on the board performs the same generic 3.4s scale pulse**, and
Symbol Life v2's per symbol character does not run. This sits directly under review 1's
"poor animations" tag.

### The headroom numbers, for when that is repaired

Authored excursions are **3px (M2 `idle-coil`)** and **7px (L3 `idle-pump`)**, absolute CSS
px. **Headroom scales with the render; the excursion does not.** Measured art square:
**78.180px at 1440x900** and **54.951px at 430x860**, so a 240px asset renders at scale
0.32575 and 0.22896.

| | M2 (SY-08) | L3 (SY-12) |
|---|---|---|
| Authored excursion | 3px | 7px |
| Measured excursion today | **0.000px** | **0.000px** |
| Art space headroom, any alpha | 7px | **0px** |
| Art space headroom, solid (alpha >= 128) | 29px | 31px |
| Art space headroom NEEDED, desktop | 9.21px | 21.49px |
| Art space headroom NEEDED, 430px wide | 13.10px | **30.57px** |
| Solid crown margin, desktop | +19.79px | +9.51px |
| Solid crown margin, 430px wide | +15.90px | **+0.43px** |

**Two things fall out of that.** First, the manifest states these requirements as "3px
vertical headroom" (SY-08) and "7px crown headroom" (SY-12), which reads as ART SPACE and
**under specifies by roughly threefold at desktop and fourfold at 430px**, because the
translate is absolute while the art is scaled down. Second, **L3's solid crown clears its own
pump by 0.43px at 430px wide**, which is no margin at all; any narrower viewport breaks it.
Neither bites today because the excursion is zero, and both bite the moment the pruning is
fixed. L3's faint outer glow already touches row 0 of its canvas, so on any alpha it has
zero headroom at every size.

### Measured on the artefact that ships, per the R083 lesson

The ingest ledger reports `max_residual_dominance` **0.098** for all eight, which is clean
and is measured BEFORE the downscale. **The delivered files tell a different story that the
ledger cannot see**: each carries a small count of PURE GREEN pixels, 15 to 214 per file, all
at or below **14.5 per cent alpha** and averaging about 3 per cent. This is Lanczos ringing
landing just above the `ALPHA_SNAP_FLOOR` of 2/255. **The currently shipped originals carry
ZERO such pixels.** Negligible on screen, no gate failed, and it is far short of the R083
halo which sat at full opacity across the whole edge. Recorded because it is a measurable
regression against what ships today, not waved past.

## Verification

Close gates chained with `&&` per (u.1), including the zero raster staged assertion the
brief requires. Explicit paths per (k). Remote CI verified with the full SHA per rule 10,
never a short SHA.

## ESCALATIONS

**E1 (R086). The nine per symbol idle classes are pruned out of the built CSS and do not
run.** `.idle-coil`, `.idle-pump`, `.idle-charge`, `.idle-rev`, `.idle-flame`, `.idle-arc`,
`.idle-rings`, `.idle-rays` and `.idle-glint` have zero rules in `dist`; their `@keyframes`
ship orphaned. Cause is Svelte's unused selector pruning against classes added only via
`classList.add()` at `GameGrid.svelte:575`. The fix is a one word change per rule, wrapping
each selector in `:global()`, which is exactly the pattern the same file already uses for
`win-flash` and `loser-dim`. **No code change was made, per TASK 4.** This is review lane and
wants a brief of its own.

**E2 (R086). SC-01 and SC-02 cannot be filled from this batch at all**, and not because of
aspect. A 480x480 source is a 4x upscale short of 1920x1080, and SC-02 is DERIVED NOT
AUTHORED so it needs a colour graded twin of whichever SC-01 is chosen. **The owner decision
needed first is WHICH ROOM the arc-2 backdrop is**, the layered workshop or the dyno test
cell, because that must be settled before any 16:9 render at delivery resolution.

**E3 (R086). FX-01's own manifest row still reads "6-frame flipbook of the M3 booster
flame".** The SY-09 correction this session makes M3 a holographic dash readout, so FX-01's
subject is now orphaned. The brief scoped the edit to the SY-09 row and recorded the
semantics change in SY-09's note, so FX-01's row was deliberately left alone and is named
here for a ruling.

**E4 (R086). `docs/art/ART_HANDOVER_ARC2.md` carries two off by one counts** against the
manifest: its priority table states P1 as "13 files, 12 to replace" where the manifest has
13 REPLACE, and P4 as "7 files" where the manifest has FX-01 to FX-08, eight. P2 and P3
reconcile exactly. Documentation debt only; the manifest is correct.

**E5 (R086). The snapshot raced a live batch**, catching `support-states` between its
intermediates and its masters. It cost nothing here because none of the seven late masters
maps to a REPLACE row, but `output/imagegen` remains live and any future count is a reading
rather than a state. This is R085-R's E3 recurring, and the EXTERNAL INTAKE convention
ratified this session is the structural answer: batches arrive as CLOSED dated folders.

R085-R's E1, E2 and E4 stand, as do R085's E2, R084's E1, E2 and E3, R083's E3 and E4,
R082's three, R080's E1, R081's E2 and E3, TR-148's four, R078's E1 and E2, and R079's E1
and E2.

## FOR THE NEXT SESSION

**THE WORKING TREE IS LEFT SWAPPED, deliberately, so the owner can run `npm run dev` from
`frontend/` and look at the game with the placeholder art in place.** The dev server serves
on `http://localhost:5173/`. The swap is visible from the first spin onward, not on the
at rest board, for the DEV only reason recorded under TASK 5.

**RESTORE INSTRUCTION, to return the tree to HEAD before any kit build:**

```
git checkout -- frontend/public/assets/themes/future-spinner/symbols/wild.png \
                frontend/public/assets/themes/future-spinner/symbols/scatter.png \
                frontend/public/assets/themes/future-spinner/symbols/h1.png \
                frontend/public/assets/themes/future-spinner/symbols/h1_base.png \
                frontend/public/assets/themes/future-spinner/symbols/h1_spin.png \
                frontend/public/assets/themes/future-spinner/symbols/h2.png \
                frontend/public/assets/themes/future-spinner/ui/gauge_face.png \
                frontend/public/assets/themes/future-spinner/ui/gauge_needle.png
```

**Kit packaging stays FORBIDDEN while any placeholder differs from HEAD.** Run the restore
first, confirm `git status` is clean, then build.

Two conventions are now standing, ratified by the owner's paste of this brief: **SUBMISSION
RECORD** (every portal upload act gets a same day committed record of kit filename, kit
sha256, source SHA from the kit README, and portal timestamp) and **EXTERNAL INTAKE**
(externally generated batches arrive as closed dated folders with a MANIFEST.md naming
provider, product, model, account, dates, verbatim prompts, included reference files, post
processing chain and manifest id targets, never edited after delivery).

R087 (style register, secret scanning gate, Gemini terms capture, arc-2 living handover)
ships on the owner's REISSUE. submission-1 remains held on the portal artefact. The provider
ruling and the OpenAI formal reply remain open, and placeholder assets stay visual test only
until a ruling clears a batch.

Model and effort: Sonnet at high effort per the brief, one session, unattended, review lane
material recorded rather than actioned.
