# Session Report - R091 BACKGROUNDS AND WIN/OVERDRIVE: the background finally fits, its twin was derived with it, and all four win graphics are NO-ROW (2026-08-24)

Brief saved verbatim: `reports/briefs/FS_FABLE_R091_BACKGROUNDS_WIN_OVERDRIVE_Prompt.md`.
Branch: `claude/r091-backgrounds-win-overdrive`, review lane, held for Fable and the owner.
**THE FENCE HELD: zero rasters staged, asserted by a gate. The swaps live only in the working
tree. output/ untouched and read only, no generation, no API call, no kit packaged. The
owner's dev server on 5173 was never touched; this session ran its own on 4173 and stopped
it.** Locked paths not involved.

## Preconditions: all met

| Precondition | State |
|---|---|
| On `main`, up to date | Yes. R090 merged as `0e607647`; checked out `main` and pulled |
| `arc2-baseline` | **`618b711eebcaed7682aca4f63b16b24911d5c456`**, unchanged |
| `chatgpt-fullres-backgrounds/` | Present, two 1920x1080 RGB masters plus record |
| `chatgpt-win-overdrive-480-masters/` | Present, four masters plus record. **All four are 1920x1080 despite the folder name saying 480** |
| Previous 20 placeholders | All present and carried across the branch switch |

## TASK 1: the background, and the first one that ever passed the gate

**`01-workshop-background-1920x1080.png` is 1920x1080 against a 1920x1080 target, 0.00%
aspect drift.** `ingest.py` accepted SC-01 unmodified and unflagged, the first time a
background has cleared the gate. R086 and R089 both refused one at 43.7% drift because the
candidate was a 480x480 square that was additionally a 4x upscale; rendering at full
resolution removes the whole problem rather than working around it. WORKSHOP was taken as the
default, per the brief.

| Row | Source | Shipped path | Result |
|---|---|---|---|
| SC-01 | `01-workshop-background-1920x1080.png` | `backgrounds/bg_base.jpg` | **SWAPPED**, 0.00% drift |
| SC-02 | derived from the new base | `backgrounds/bg_overdrive.jpg` | **DERIVED**, matched pair |

### The twin was not optional

SC-02's row reads **"DERIVED, NOT AUTHORED: it is a colour grade of bg_base at identical
geometry. Supply as a matched pair or the crossfade will jump."** So
`scripts/assets/background_overdrive_derive.py` was run from the new base. Measured on the
project's own metric (64x36 z-scored grey grid, Pearson r and share of cells moved beyond
0.5 SD):

| Pair | Pearson r | cells moved |
|---|---|---|
| Old shipped pair | +0.9985 | 0.0% |
| **New pair, base and derived twin** | **+0.9961** | **0.3%** |
| **Hazard: new base against the OLD twin** | **-0.2575** | **71.5%** |

**A base-only swap would have been actively anti-correlated, worse than two unrelated
images.** And the consequence is worse than the manifest's word "jump" suggests: `.bg-still`
holds the base at `opacity: 0.92` permanently and never fades it out, so the composite during
Overdrive is `0.92 x overdrive + 0.0736 x base`. The player would have seen a 0.6s double
exposure between a dark workshop and a bright anti-correlated city **on every Overdrive entry
and again on every exit**, plus a permanent 7.36% ghost of the old skyline through the entire
feature. **No gate would have caught it**: `asset_reference_gate.mjs` checks that references
resolve, not that content agrees, and `build_diet_verify.mjs` checks 404s and the size budget.
Confirmed by eye as well as by number: the Overdrive layer is visibly the same workshop under
a hotter, magenta-leaning grade.

### A regression I introduced and corrected in the same session

The first delivery went through `ingest.py`, which hardcodes `quality=92, subsampling=0` at
line 361 with no CLI override. That is right for small transparent symbol rows and wrong for a
1920x1080 backdrop: it produced **643,957 bytes against a 273,173-byte incumbent, 2.36 times
the budget**. Every other background writer in this repository (`backgrounds.py`,
`background_candidate_ingest.py`, and the derive tool itself) uses **q80 progressive 4:2:0**.

Re-encoded **from the source PNG rather than from the delivered jpg**, so nothing was double
compressed, then the twin re-derived from the corrected base so the pair could not desync:

| File | Incumbent | First delivery | Corrected | vs incumbent |
|---|---|---|---|---|
| `bg_base.jpg` | 273,173 B | 643,957 B | **270,011 B** | **0.99x** |
| `bg_overdrive.jpg` | 269,186 B | 264,759 B | **259,050 B** | **0.96x** |

Both now sit slightly under the incumbent. SC-01's own note calls this row the dominant
surface in the game and the largest single raster in the kit, and the kit carries a 25 MiB
budget, so a 371 KB overshoot on one file was worth catching.

## TASK 2: all four win and Overdrive graphics are NO-ROW

Traced through source rather than assumed. **There is no live shipped raster target for any of
the four.**

| Asset | Where that moment renders | Rasters that component loads | Verdict |
|---|---|---|---|
| Small / Medium Win Banner | `WinCelebration.svelte:34` (1x to 10x), `WinBanner.svelte` (10x+) | none; `WinBanner`'s only two are `particles/coin.png` 40x40 and `particles/shock_ring.png` 128x128 | **NO-ROW** |
| Big Win Banner | `WinBanner.svelte:382-431`, tier escalation by `min-height` and `box-shadow` | same two particles | **NO-ROW** |
| Max / Ultimate Win Frame | `MaxWinCelebration.svelte` | **zero rasters**; does not import the theme store at all. Crown is inline SVG paths, halo a `conic-gradient` | **NO-ROW** |
| Overdrive Entry / Trigger | `FreeSpinsPresentation.svelte:475-506` | five sprites INSIDE the card: 2x `smoke_puff` 56x56, `gauge_face` and `gauge_needle` 464x464, `shock_ring` 128x128, all with existing manifest rows | **NO-ROW** |

`docs/art/art_manifest_arc2.csv` carries **no row of any classification** for a banner, big
win, max win or entry graphic, and the shipped theme tree contains no such raster.

**Three further disqualifiers, any one of which is decisive on its own.**

1. **They are opaque.** `WinBanner`'s own header records it as a band spanning the stage with
   the reels deliberately visible above and below, replacing a prior centred box that blocked
   the grid. An opaque full-screen plate would black the game out on every win over 10x. The
   Overdrive flare and dip are deliberately semi-transparent for the same reason.
2. **The geometry is wrong by an order of magnitude.** The Overdrive entry card is
   `.fs-overlay`, `inset: 0` inside a 616x412 box scaled 0.847 into a 522x349 stage slot. The
   win band is roughly 1280 wide by 110 to 170 tall. **The only 1920x1080 slots in the entire
   game are SC-01 and SC-02**, the two backgrounds this session just filled.
3. **Baked copy would be barred anyway.** All four moments render live localised strings
   across sixteen locales plus the social vocabulary swap. UI-07 and UI-08 already carry the
   standing disposition, "never bake copy into art again", after exactly this mistake.

Installing any of these would be **a code change to components that ship no raster today**,
not the filling of an existing target. That is a component brief, not an asset swap, and it is
recorded rather than attempted.

## TASK 3: report

- **Swapped 2** (`bg_base.jpg` plus its derived `bg_overdrive.jpg`), **NO-ROW 4**, WRONG-SPEC 0.
- **The working tree now carries 22 modified rasters**: the twenty from R086 to R090 plus the
  background pair.
- **Zero rasters staged**, asserted by a gate.
- `npm run build` exit 0.
- Local preview on 4173: **zero console errors, zero page errors, zero missing-asset requests,
  no layout breakage.** The workshop reads well behind the reel window, its centre is dark and
  uncluttered exactly where the grid sits, and the HUD strip holds white text comfortably,
  which is SC-01's own stated constraint.

**One non-raster is deliberately left dirty.** `background_overdrive_derive.py` always writes
`reports/qa/background_overdrive_derive.json`, and it was allowed to. A provenance record
naming files that are no longer on disk is precisely the stale-document failure the currency
gate exists to prevent, so the record is left describing the pair that is actually in the tree,
and it is listed in the restore command alongside the rasters. Its base and output sha256 were
verified to match the two files on disk.

## Verification

Records-only commit; the swaps are deliberately uncommitted. Close gates chained with `&&` per
(u.1), each exit code the direct left operand. Explicit paths per (k). Remote CI verified with
the full SHA per rule 10.

## ESCALATIONS

**E1 (R091). `ingest.py` hardcodes `quality=92, subsampling=0` and it is wrong for every
opaque 1920x1080 row, not only this one.** It has no CLI override, so any future background
adopted through the normal path lands at roughly 2.4x the budget the rest of the pipeline was
tuned to. Either give it a per-row encode setting or route background rows through the
existing background encoder. Tooling change, review lane.

**E2 (R091). The four win and Overdrive masters have nowhere to go, and the reason is
architectural.** Every win and feature moment in this game is CSS and inline SVG by design.
If the owner wants illustrated celebration art, that is a deliberate component change with
three constraints to solve first: the assets must carry alpha, they must be authored at the
real slot geometry rather than 1920x1080, and they must stay text-free because the copy is
localised across sixteen locales. **9.65 MB of art currently has no home**, which is worth
knowing before more of it is commissioned.

**E3 (R091). `02-dyno-cell-background-1920x1080.png` is not an SC-02 candidate and must never
become one.** It scores r 0.2136 against the adopted base, so it is a different room, whereas
SC-02 is by definition a grade of SC-01. It remains a live alternative for **SC-01** if the
owner prefers the dyno cell to the workshop, in which case the twin is re-derived from it.

**E4 (R091). The manifest's `renders_in` citations have drifted in two rows**, found in
passing: FX-05 cites `WinBanner.svelte:170`, a variable assignment rather than the `<img>` at
`:306`, and FX-07 cites `FreeSpinsPresentation.svelte:638`, a CSS rule rather than the `<img>`
tags at `:478-479`. Documentation debt only.

R090's E1 through E5 stand, as do R089's E1 through E3, R087's E1 through E4, and R086's E2
through E5.

## FOR THE NEXT SESSION

**The working tree is LEFT SWAPPED with 22 modified rasters plus one provenance record**, so
the owner can run `npm run dev` from `frontend/` and look. The background is the visible change
this session; the win and Overdrive moments are unchanged because they have no raster to change.

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
                frontend/public/assets/themes/future-spinner/symbols/m2.png \
                frontend/public/assets/themes/future-spinner/symbols/m3.png \
                frontend/public/assets/themes/future-spinner/symbols/l1.png \
                frontend/public/assets/themes/future-spinner/symbols/l2.png \
                frontend/public/assets/themes/future-spinner/symbols/l3.png \
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

Kit packaging stays forbidden while any placeholder differs from HEAD. Still open: the tile
plate's 732x612 re-render, `m1.png` as the last glow-era symbol with no candidate anywhere,
and whether illustrated celebration art is wanted at all given every win moment is CSS today.

Model and effort: one session, unattended, review lane, with a two-agent trace over the win and
Overdrive target question and the background consumption path. No gate failed.
