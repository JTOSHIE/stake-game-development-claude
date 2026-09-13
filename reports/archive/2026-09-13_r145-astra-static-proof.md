
---

# R145 - THE ASTRA PROOFS ARE IN THE THEME TREE, AND THE HERO ON STAGE DOES NOT CHANGE (2026-09-13)

Sole live brief, review lane, medium effort. Brief saved verbatim at
`reports/briefs/FS_R145_AstraStaticProofIntake_Prompt.md` per convention (f).

**THE ONE LINE THE BRIEF ASKED FOR: the on-stage hero will NOT change after this swap. Hero on
stage will not change until Path 1 freeze points rest at this file.**

**Three rasters are in the diff and nothing else changed in the theme tree:**
`ui/scene_character.png` (SC-06), `symbols/h2.png` (SY-06) and `symbols/m3.png` (SY-09), each the
`ingest.py` output of the supplied proof. 3 of 59 theme rasters differ from the session-start
fingerprint; the idle, win and brace sheets are byte-identical. Zero source files.

## Boot

The primary checkout was on `claude/r143-dev-one-round`, not `main`. Rule 11 says an unexpected
branch means a live writer, so that was checked before anything moved: the tree was clean including
untracked files, the branch tip `db626bcb` is an ancestor of `origin/main` (PR #180 merged) with an
identical tree hash `7c9c2b3a`, and nothing listened on 5173 or 5174. It was R143's close residue,
not a session mid-flight. Switched to `main` and fast-forwarded to `6e451987`.

**Fingerprint before any file operation:** zero dirty rasters (the R129 to R137 working-tree set
was committed at R137), 59 theme rasters hashed, and the three sources plus `PROMPTS_AND_QA.md`
hashed. Re-fingerprinted immediately before the swap: identical.

## Precondition 3: what the stage actually draws

- `frontend/src/App.svelte:2261` is the only mount, `<SceneGroup haze={hazeLevel} />`, with no
  `heroMode`.
- `frontend/src/lib/components/SceneGroup.svelte:46` defaults `heroMode` to `'idle'`, and lines
  96 to 97 render `HeroIdle` for it. `scene_character.png` appears only in the `{:else}` branch at
  line 99, which no mount reaches.
- `frontend/src/lib/components/HeroIdle.svelte:139` maps idle to `hero_crossed_idle_6f.png`,
  painted at line 321.
- **Confirmed live, both passes, at 1280:** `hero-idle` mounted, background
  `hero_crossed_idle_6f.png` at `0px 0%`, the static `.char-img` not mounted, and
  **`scene_character.png` never requested by the page at all**. At 390 no `SceneGroup` mounts,
  which is the portrait layout's standing behaviour.

So `scene_character.png` was swapped as the brief orders, and it changes nothing a player sees
today. Its path is still registered as `shipped_robot_mascot` in
`scripts/assets/canonical_sources.json`, so its content is now the retouch, while the idle sheet's
frame 01 was matched to the OLD raster. The two now differ by the material retouch until Path 1.

## Workstream 1: the supplier's QA was checked, not believed

| Row | Class | Source | Target | Aspect drift |
|---|---|---|---|---|
| SC-06 `ui/scene_character.png` | REPLACE | 680x1344 RGBA | 680x1344 | 0.0 |
| SY-06 `symbols/h2.png` | REPLACE | 480x480 RGBA | 240x240 | 0.0 |
| SY-09 `symbols/m3.png` | REPLACE | 480x480 RGBA | 240x240 | 0.0 |

**`silhouetteIoU: 1` in the supplier's QA is a literal in its script, not a measurement.** It is
entailed by that script's own zero-alpha-change check, but nothing ever computed it. IoU was
measured here.

**PROVENANCE VERIFIED BY RE-DERIVATION.** The supplier's `retouch()` was copied verbatim into a
scratch script (its own file was NOT run, because running it overwrites the sources), applied in
memory to HEAD's three files, and resized with the same sharp 0.35.4 lanczos3 call. **All three
delivered proofs reproduce byte for byte, identical sha256.** The proofs are therefore a
deterministic function of the shipped art: zero generated pixels, and the three rejected gpt-image
edits contribute nothing. The supplier's native figures reproduce exactly: pixels changed 166,253 /
10,376 / 1,687, max RGB change 14 / 14 / 13. The shipped art is R137's OpenAI gpt-image-1
placeholder set, owner-authorised under Ticket 456254 for development-stage artwork.

**The ingest path, calibrated against a known answer before it was trusted.** The brief says "the
project ingest path (the one that already proved byte-reproducible on hero sheets)", and in this
repository those are two different things: `scripts/assets/assetforge/ingest.py`, and R140's
sheet pack method, which is recorded as a procedure (its encoder parity is in
`docs/art/r126_hero_inbetween_intake.provenance.json`) rather than committed as a tool. Resolved by measurement rather than by
choosing: **today's `ingest.py` reproduces the SHIPPED `h2.png` and `scene_character.png` byte for
byte** from their recorded 2026-08-24 sources. So it is the byte-reproducible path for these exact
rows, the hero raster included, and it is also the gate the fence names. Its output is what ships,
per R141.

Ingest accepted all three, route `native`, no keyer, cleared 551,437 / 101,797 / 119,002 px (the
supplier's transparency counts exactly).

| File | Delivered sha256 | Bytes | HEAD sha256 | HEAD bytes |
|---|---|---|---|---|
| `scene_character.png` | `6bdd73d0` | 774,813 | `785393e3` | 791,212 |
| `h2.png` | `d8192d42` | 83,181 | `02f328ea` | 84,647 |
| `m3.png` | `287f5f29` | 63,116 | `5f6d982b` | 63,141 |

Net -17,890 B. The production build of this tree is 24,296,023 B, exactly 17,890 B under R143's,
leaving 1,918,377 B under the 26,214,400 B cap.

### The refusal criteria, delivered file against HEAD

| | scene_character | h2 | m3 |
|---|---|---|---|
| Aspect drift | 0 | 0 | 0 |
| **Silhouette IoU, alpha >= 128** | **1.000000** | **0.994760** | **0.997922** |
| IoU, any coverage (alpha >= 1) | 1.000000 | 0.978127 | 0.979415 |
| **Alpha hole: interior px now below 128** | **0** | **0** of 27,443 | **0** of 23,732 |
| Interior px now below 255 | 0 | 0 | 0 |
| Alpha px differing | 0 | 3,173, max 95 | 2,721, max 98 |
| Alpha bounding box | identical | +1 px right and bottom | +1 px right and bottom |
| Max RGB, pixels opaque in both | 14 | 120 | 89 |

**No row refused, and no row is a different robot, turbo or dash.**

**The IoU threshold is stated because it decides the answer.** At alpha >= 128, the threshold
`ingest.py` itself uses for silhouettes (line 301) and R140 used, all three clear 0.99. At any
coverage, H2 and M3 would not. **The unedited control below scores identically at any coverage**, so
a strict reading would refuse the mandated path, not the proof.

## THE FINDING: for H2 and M3 the 480 detour moves more pixels than the retouch does

A **symmetric control**: HEAD's own 240 raster through the identical path, the same 2x sharp
lanczos3 upsample the supplier used and then `ingest.py`'s own `despill_existing` and
`resize_premultiplied`, with no edit at all.

| Opaque pixels | delivered vs HEAD | control vs HEAD (path alone) | delivered vs control (edit alone) |
|---|---|---|---|
| H2 mean RGB delta | 13.40 | 12.93 | 1.72 |
| H2 max RGB delta | 120 | 120 | 15 |
| M3 mean RGB delta | 11.67 | 11.59 | 0.31 |
| M3 max RGB delta | 89 | 89 | 14 |

**Delivered alpha is identical to control alpha in both rows**, so every silhouette change above is
path and none is edit.

**The cause, found rather than assumed: libvips' lanczos3 2x upsample sits half a pixel off a
centre-aligned grid**, so every downscale of these proofs inherits a quarter-pixel move down and
right at 240. Alpha centroid against HEAD:

| Route on the same shipped pixels | H2 dx, dy | M3 dx, dy | H2 / M3 mean RGB |
|---|---|---|---|
| sharp up, `ingest.py` down (what ships) | +0.2533, +0.2658 | +0.2676, +0.2641 | 12.93 / 11.59 |
| sharp up, 2x2 box down (no resampler) | +0.2490, +0.2504 | +0.2525, +0.2514 | 12.03 / 10.67 |
| PIL lanczos up, `ingest.py` down | -0.0020, +0.0006 | +0.0054, +0.0008 | 4.35 / 4.49 |

The box average shares no resampler with `ingest.py` and shows the same move; a PIL-only round trip
shows none. **The move is baked into the proof pixels, so no downscale of them can remove it.**

**What it does to the supplier's guarantees: they hold at native 240 only, a file that was never
delivered.** M3's protected display window (native x 32 to 215, y 70 to 172): **17,937 px now differ
from HEAD** (max 85). The control alone differs on 17,935; the edit alone on 270, by at most 3.
Across every pixel the retouch protected, M3 differs on 23,335 against a control 23,333, H2 on
13,834 against 13,824.

**At drawn size it is not visible.** The shift in device pixels: board 1280 0.145, paytable 1280
0.163, board 390 0.156, paytable 390 0.200. Before and after paytable cards at both widths could not
be told apart by eye. **The corollary cuts the other way too: M3's retouch, mean 0.31, will not read
at a look-pass either.**

**OWNER QUESTION, not a builder ruling:**

- **A.** Supply a native 240x240 delivery of the same retouch. The re-derivation proves it is
  already computable, and it would carry alpha identical to HEAD, max RGB 14 and 13, and M3's display
  byte-identical. It needs a brief, because this one names the 480s as the sources and forbids
  generating images.
- **B.** Accept H2 and M3 as delivered in this PR.
- **C.** Withdraw H2 and M3 from this PR and keep the hero only.

## The hero row is clean on every axis

Delivered alpha identical to HEAD, IoU 1.000000 at both thresholds, bounding box identical at
x 88 to 592, y 30 to 1314. 166,253 opaque pixels changed, max 14, mean 2.22, p99 12. The difference
map is diffuse metal texture with the visor and head black: material only, as the supplier said.

`ingest.py`'s premultiplied round trip touched 11,002 of the 13,099 semi-transparent edge pixels,
**at most 1.98/255 composited** (straight RGB up to 127, all at near-zero alpha), where the proof
had left them identical. That is the tool's signature on everything it passes, and the shipped file
carries its own copy of it from 2026-08-24.

## Workstream 2: the swap, and the fence found on HEAD

Copied the three ingest outputs over the targets; each target's sha256 equals its ingest output.

**The rasters are COMMITTED, on a review-lane PR.** The standing fence "records only, rasters
uncommitted" was lifted by the owner's R137 ruling, and `main` has since accepted owner-briefed
theme rasters by review-lane PR three times: R137's placeholders `578a3a51`, R141's needle (PR #178)
and R140's strips (PR #179). Commits `29f967c8` (rasters and brief) and `aa9a9850` (evidence).

**Adoption test step 5, what else derives from these files:** FX-01 `symbols/m3_flame_sheet.png`
is declared `variant_of symbols/m3.png`, but it is drawn in the same 9% / 82% box as the symbol
(`GameGrid.svelte` `.symbol-overlay`), so it registers to the cell, not to the raster; the quarter
pixel is about 0.08 CSS px against it. The scene_character relationships are above.

## Workstream 3: proved in a browser on the session's own server

- **Server:** the `fs-dev` preview configuration, port 5174 with `--strictPort`. **5173 untouched**:
  nothing was listening there at boot and nothing was started there.
- **Identity, not liveness:** before the swap four served assets were byte-identical to the tree.
  Vite serves `public/` with `Cache-Control: no-cache` and a size and mtime ETag, so a reload
  revalidates.
- **The page's own network responses** at 1280 and 390: `h2.png` 200, 83,181 B, `d8192d42`
  (before: 84,647 B, `02f328ea`); `m3.png` 200, 63,116 B, `287f5f29` (before: 63,141 B,
  `5f6d982b`). `scene_character.png` fetched directly because the page never asks for it: served
  `6bdd73d0`, HEAD `785393e3`, **hash changed**.
- **Both widths, both passes: 0 console errors, 0 HTTP responses at or above 400, so zero 404s,
  0 failed requests, 0 broken images.** Every H2 and M3 image sits inside its cell and the grid. The
  DEV-only `?windemo=H2` fixture holds 4 visible H2 and 1 M3; paytable cards load at natural
  240x240, drawn at 78 and 64 CSS px.
- **Screens committed** to `reports/screens/r145-astra-static-proof/`: the board grid at 1280 and
  390, the on-stage hero at rest (identical), the paytable cards at drawn size, the 240 rasters with
  an x8 difference map, and the hero raster at drawn and native size marked NOT ON STAGE.

**Instrument failures, caught by looking rather than by asserts:**

1. **The BEFORE 1280 H2 board-cell crop was blank.** `?windemo=` re-spins every 5 s and the element
   screenshot landed mid-spin while every DOM check had passed. Refused, not committed; the paytable
   cards are the clean comparison. R138's lesson again: green asserts do not validate screenshots.
2. **The 1280 M3 rect read 73.7 px tall before and 69.8 after**, with identical width. Not
   geometry: M3's idle `idle-flame` is filter-only (`GameGrid.svelte:1522`), so this was the demo's
   landing motion caught mid-phase.
3. **My own first commit message overstated the shift** as "about 0.15 device px at the largest
   draw size". The largest DEVICE draw is the 390 paytable card, 64 CSS px at DPR 3, where it is
   0.20. It also said the control "accounts for" the delivered mean, which implies means add; they
   do not. Both corrected before the first push, so no pushed history was rewritten. The table
   above is the record.

**Pre-existing, not the swap:** the red splotches on the winning turbos are win-burst particles
and appear identically in the BEFORE pass. Named so the look-pass does not attribute them to R145.

## Gates

**Browser matrix, all 28 legs, run locally BEFORE the push** against a fresh production build of
this exact tree (`1579ca92`): **28 of 28 green**, including the legs that read art, paytable card
fill, contrast, scrim coverage and replay contract. Two legs finished fast enough to suspect
(count-up steady 1.2 s, autoplay confirm 4.1 s) and their logs show real probes and real passes.
The machine was busy: another Claude session was running Playwright gates for a different project
throughout (its process chain leads to `SI_Planogram_Builder`), so the timing legs were watched, and
none went red. Replay contract took 594 s locally.

**Static job, all 83 steps, run locally on the committed tree immediately before this paragraph
was written** (the only change since is this paragraph): **82 of 82 run steps green**, with `npm ci`
skipped because it deletes `node_modules` under a running server; CI runs it. Its production build
stamps 101 files and 24,296,023 B. Nothing in the static job reads this report or its archive: the
document currency gate excludes both, and the text gates scan `frontend/src/`, `dist` and two prose
files, so writing this line after the run does not stale the run.

## FOR THE NEXT SESSION

**Model and effort:** Opus 5, medium effort, as the brief set.

**Approach:** fingerprint; trace the stage in source and confirm it live; re-derive the supplier's
proofs from HEAD before trusting the QA; calibrate `ingest.py` against the shipped files before using
it; measure every row against HEAD with a symmetric control; swap the ingest outputs; prove in a
browser on 5174 with before and after passes; commit on a review-lane PR.

**Alternatives rejected:** R140's sheet pack method for H2 and M3 (never calibrated on these rows,
and centre-aligned PIL LANCZOS inherits the same quarter-pixel move); a shift-compensating downscale
(a new, uncalibrated path the brief did not authorise); running the supplier's `static_proof.mjs`
(it writes over the sources); shipping the re-derived native 240s (outside this brief, which names
the 480s and forbids generating images); refusing H2 and M3 on "material delta only" (the brief's
refusal rules are explicit and all three pass); a `.claude/launch.json` in the repository (created
and removed within a minute, because the preview tool reads the user-level file, which already
carried `fs-dev`).

**Files touched:** the three rasters, the brief save, six evidence screens, this report and its
dated archive extract.

**Open threads:**

- **The A, B or C question above**, for the owner.
- **Path 1 freeze** is the next brief if the owner still wants the stage to show this raster.
- **The checkout is left on `claude/r145-astra-static-proof`** so the owner's look-pass is real
  before merge: `npm run dev` from `frontend/` serves this tree on 5173, and a hard refresh shows the
  new H2 and M3. `npm run owner:preview` will REFUSE here, correctly, because the branch's commits
  are not on `origin/main`; after the PR merges it serves them. The next session should find this
  branch, verify it merged, and switch as R145 did.
- **Owner preview NOT refreshed:** nothing landed on `main`, so rule 12 does not fire, and the brief
  keeps 5173 untouched.
- **A stale line number in a code comment, parked outside a three-raster fence:**
  `SceneGroup.svelte:37` says heroMode's one mount is `App.svelte:2159`; it is now line 2261.
- An orphaned Playwright Firefox from about ten days ago sits at 0% CPU under launchd. Not this
  session's, left alone, named so a timing-sensitive session checks for it (R140).
