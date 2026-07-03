# Session Report: Asset wiring — runtime unified to theme exports

- **Date:** 2026-07-04
- **Branch:** `claude/asset-wiring-fix` (from up-to-date `main`; PR #10 AssetForge exports
  already merged to main).
- **Brief:** `FS_AssetWiring_Fix_Prompt.md` (saved verbatim).

## Problem

AssetForge v2 produced the vector symbol exports under
`assets/themes/future-spinner/symbols/`, but the running game never rendered them: the
future-spinner reel grid resolved textures from the legacy roots `assets/symbols/{idle,win,
idle-png}` (MP4 video plus PNG fallback), and the paytable pointed at legacy Manus variant
PNGs under `assets/symbols/`. The new art was on disk but nothing served it.

## DIAGNOSE — every legacy visual-asset reference found

| Consumer | Reference (before) | Resolves to |
|---|---|---|
| `GameGrid.svelte:49-51` | `IDLE_BASE/WIN_BASE/PNG_IDLE` for future-spinner | legacy `assets/symbols/{idle,win,idle-png}` (video + PNG) |
| `PaytableModal.svelte:49-58` | 10 hardcoded `src` (WILD, SCAT, H1..L3) | legacy `/assets/symbols/<manus_variant>.png` |
| `App.svelte:390-392` (frame) | `$themeAssets.frame` | ALREADY theme-resolved (`themes/future-spinner/frames/frame-1.png`) — no change |
| Tile plate / plates.json | not wired behind symbols | "if already wired" not met (that is the HUD rebuild) — deferred |
| `LoadingScreen.svelte:10`, `WinBanner.svelte:74`, `WinPod.svelte:12,21` | `assets/ui/*` | out of the named roots (symbols/, frames/); no theme-export equivalents; WinPod retired — noted, not moved |

No legacy visual-asset reference lives in a locked file (all in `components/`); no lock
interaction, nothing to lift.

## UNIFY — references moved

**GameGrid.svelte (reel symbol textures).** Every theme, including future-spinner, now
renders its vector symbol PNG from the themeStore-resolved path
`${$themeAssets.assetBase}/symbols/<id>.png` (the AssetForge 240 export). The
future-spinner-only MP4 video path is retired (it was the only video theme):
- `IDLE_BASE/WIN_BASE/PNG_IDLE` and `_isFS` replaced by a single `SYMBOL_BASE =
  ${assetBase}/symbols`; `getIdleSrc`/`getWinSrc` collapsed to `symbolSrc()`.
- Removed `videoRefs`, `videoSupported`, the onMount FS video init, and the `_isFS` video
  branches in `_updateSymbols` (was `_updateSymbolVideos`), `_triggerWinBurst`,
  `_resetToIdle` and `_landReel`. The template renders `<img>` for all cells; win state uses
  the existing CSS `win-flash` pulse (engine-driven win animation lands in Motion Polish v2).
- Main JS chunk shrank about 108 to 106 kB as the video handling dropped out.

**PaytableModal.svelte (paytable icons).** The 10 hardcoded legacy variant paths replaced by
`${$themeAssets.assetBase}/symbols/<id>_1x.png` (the AssetForge 120 exports, the smaller
variant being appropriate for the small table icons). Imports `themeAssets`; the pay values
are unchanged.

Legacy directories were NOT deleted (Build Diet prunes later); only code references were
removed. A grep confirms zero live references to `assets/symbols/` or `assets/frames/`
remain (only a documentation comment naming the retired roots).

## PROVE IT SERVED

Dev server on `:5173`:
- Served `assets/themes/future-spinner/symbols/h1.png` bytes hash-match the file on disk
  (`6676af…`), and that hash differs from the legacy `idle-png/H1.png` (`7dde12…`) — the
  served reel texture is the AssetForge export, not the legacy art.
- `frames/frame-1.png` served bytes hash-match disk (LAYOUT_SPEC frame asset).
- Headless (Playwright, chromium): all 20 reel cells render an
  `assets/themes/future-spinner/symbols/*.png` texture with `naturalWidth > 0`; zero cells
  point at a legacy root; the frame renders `frames/frame-1.png`; zero console errors on
  load.
- Crop-diff: a reel-cell crop (symbol l3) has mean-abs-diff 25.8 against the NEW `l3.png` vs
  89.6 against the legacy `L3.png` — the rendered cell matches the new export and differs
  from the legacy, exactly the required check. Screenshot:
  `~/Desktop/FS_AssetForge_Screens/asset_wiring_reels.png` (reels show the new vector art).

## Gates

| Gate | Result |
|------|--------|
| No live legacy symbol/frame references | PASS (grep clean) |
| Served texture == disk, differs from legacy | PASS |
| Headless: 20/20 cells render loaded theme exports, 0 legacy, 0 console errors | PASS |
| `npm run build` | PASS (clean) |
| Exact-total interpreter test | PASS 44/44 |
| Typecheck (`npm run check`) | 0 new errors in edited files (23 pre-existing remain in untouched bonus components and the tsx test) |

## Scope and locks

Locked files untouched (`rgsService.ts`, `gameStore.ts`, `games/future_spinner/**`). Only
`GameGrid.svelte` and `PaytableModal.svelte` changed. Behavioural note: future-spinner
symbols are now static vector PNGs (the MP4 idle/win pipeline is retired); engine-driven
symbol animation is Motion Polish v2 scope. Playwright was installed with `--no-save`
(package.json and lock unchanged) purely for the headless proof. Committed with explicit
paths; `frontend/dist/**` left uncommitted.
