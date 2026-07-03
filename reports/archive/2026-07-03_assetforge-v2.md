# Session Report: AssetForge v2 (masters, layout law, pipeline, HUD)

- **Date:** 2026-07-03
- **Branch:** `claude/assetforge-v2` (from up-to-date `main`).
- **Brief:** `FS_AssetForge_v2_Prompt.md` (saved verbatim: part one plus the part two appendix
  already received this session, assembled and manifest-checked).

## Preamble: recovery and ADDENDUM merge

The brief arrived across several messages (part two first, then a placeholder version, then
the authoritative part one). Before executing, per the recovery instructions:
- Deleted the superseded placeholder brief.
- Resolved PR #8 (design system ADDENDUM): merged `main` into it, kept the full ADDENDUM in
  `DESIGN_SYSTEM.md`, regenerated the conflicted session report rather than hand-merging,
  merged the PR, deleted the branch, pulled main. Task 0 preconditions then both satisfied
  on main (HANDOVER.md and the DESIGN_SYSTEM ADDENDUM).

## Manifest check (gate before executing)

Ten master files across both parts, every BEGIN/END block real SVG, zero bracketed
placeholders. **PASSED**: 10/10 present, all well-formed SVG, zero placeholders, 10 BEGIN/10
END blocks in the assembled brief.

## What was done and verified

**Task 0 (done).** Branched `claude/assetforge-v2`. Fixed the CLAUDE.md convention (g)
cross-reference from `(d)` to `(e)` (lock exceptions).

**Task 1 (done).** Created the six part-one symbol masters (M1_master_v3, M2_master_v2,
M3_master_v3, L1_master, L2_master, L3_master) plus the four part-two masters already in the
tree (H2_master_v31, brand_mark, plate_instrument, scene_character_car). Updated
`DESIGN_SYSTEM.md`: lineup rows (M2 Holographic Grille, M3 Plasma Booster, H2 v3.1 anchor,
M1 v3, L1/L2/L3 in masters), SYSTEM LAWS additions (signature colour identity per symbol,
silhouette-first, tile-plate law, generic control overlay), retirements (win pod; themed
spin/buy buttons), and a non-symbol masters section (scene, brand mark, instrument plate).

**Task 2 (done).** Created `design-system/LAYOUT_SPEC.md`: the "# LAYOUT_SPEC v3.1 (owner
approved)" title plus HANDOVER.md section 4 copied verbatim from the repo (byte-identical,
confirmed by extract-and-compare).

**Task 3 (done, verified).** Deterministic pipeline: `scripts/assets/manifest.json` +
`scripts/assets/build.py`, wired as `npm run assets` (venv with cairosvg 2.9 and pillow 12).
33 exports: ten symbols at 240x240 and 120x120; neutral tile plate 244x204 plus plates.json
(symbol id to signature colour); brand mark 512 and 192; Grille feature button 224; gauge
face 464; scene 1200 wide; instrument plate 524x119 and 262x59; layered H1 (spin group +
static base) and H2 v3.1 (needle + face without needle). **Reproducibility gate PASSED**:
two runs produced byte-identical outputs (sha256 compared). Layered separation confirmed
(h1_spin 88% transparent = spokes only; gauge_needle 99% transparent = needle only).

**Task 4 (done, verified).** `scripts/assets/backgrounds.py` extracts t=22s (BASE) and t=7s
(OVERDRIVE) from the loop video and grades per HANDOVER section 3 (contrast, colour,
per-channel multipliers, brightness, vignette), quality 88, producing bg_base.jpg and
bg_overdrive.jpg. `App.svelte` swapped from the dual-video crossfade to static stills with an
Overdrive crossfade (keyed on the feature-active flag). A vite plugin excludes the animated
loop mp4 from dist while keeping the source in the repo. **Build verified**: mp4 absent from
dist, both jpgs present, source mp4 retained.

## Verification gates

| Gate | Result |
|------|--------|
| Manifest check (10 masters, real SVG, no placeholders) | PASS |
| `npm run assets` reproducibility (two runs, hash compare) | PASS (byte-identical) |
| `npm run build` | PASS (clean; vite plugin excluded the mp4) |
| dist excludes bg_animated_loop.mp4, includes bg jpgs | PASS |
| Exact-total interpreter test | PASS 44/44 ("ALL INTERPRETER GATES PASS") |
| Typecheck (`npm run check`) on my edited files | No new errors introduced |

A reviewable contact sheet of every master, export and background is at
`~/Desktop/FS_AssetForge_Screens/FS_AssetForge_contactsheet.png` (all render on-brand,
front-facing, correct signature colours).

## NOT completed this pass (needs owner attention)

- **Task 5 (full HUD and scene rebuild to LAYOUT_SPEC v3.1) is NOT done.** The live app is a
  720x760 design surface; LAYOUT_SPEC is a 1280x720 landscape re-architecture with a
  symbol-on-tinted-plate grid, a persistent bonus instrument column, character scene
  placement, and an occlusion gate across ten viewports. This is a large, high-risk rewrite
  of a working, compliant frontend that cannot be completed and truly verified (the occlusion
  gate needs the running app screenshotted at ten viewports) in this pass. I deliberately did
  not big-bang it unverified and risk breaking the working game. Everything it depends on
  (all exports, plates.json, both backgrounds, the background swap, LAYOUT_SPEC.md) is now in
  place, so it is ready to be executed as its own focused, verifiable session. The one
  landscape-independent piece of Task 5 (retiring the video for static backgrounds) is done.
- **Task 6 (recon) is reference-only and was not run as a capture.** valkyriestudio.gg is
  reachable (HTTP 200) but Playwright is not installed and the task commits nothing; a note
  is at `~/Desktop/reference/waylanders/`.
- **Pre-existing `npm run check` errors (23)**, all in files this pass did not touch
  (`BuyBonus.svelte` and `FreeSpinsPresentation.svelte` i18n `GameMode` typing;
  `roundInterpreter.test.ts` node builtins; `PaytableModal.svelte` `<tr>` warnings). They
  predate this pass. The brief's "tsc clean" gate is therefore not green at the repo level,
  but this pass adds none of them.

## Scope and locks

No lock exception needed or taken. `rgsService.ts`, `gameStore.ts` and
`games/future_spinner/**` were not touched. Frontend edits: `App.svelte` (background),
`vite.config.ts` (mp4 exclusion plugin), `package.json` (`assets` script). Committed with
explicit paths; `frontend/dist/**` build output left uncommitted.
