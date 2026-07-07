# Session Report: Build Diet v2 (shipped-bundle asset pruning) + QA soak harness

- **Date:** 2026-07-07 (rebased and landed; originally built 2026-07-04)
- **Model / effort:** Claude Opus 4.8 (1M context), High.
- **Branch:** `claude/build-diet-qa` (rebased onto the current `main` tip before commit).
- **Source:** this work was built in an earlier concurrent session (`FS_BuildDiet_QA_Prompt.md`)
  but left uncommitted in a local worktree. Recovered, rebased onto the latest `main` (the
  branch predated the whole graphics/menu/animation overhaul arc), one conflict resolved
  (`package.json` - kept both the `symbol_fx.py` asset step and the new `qa:soak` script),
  `dist` regenerated fresh against current `main` so the shipped output reflects both the diet
  pruning and every merged reskin/menu/animation change.

## What this delivers

### 1. Build Diet v2 - `frontend/vite.config.ts`
A `closeBundle` Vite plugin (`pruneLegacyAssets`, replacing the old single-file
`excludeRetiredVideo`) that prunes every legacy asset with no live consumer from the
**served build only** - `public/` and the repo are untouched; this runs post-build against
`dist/`. Verified reference-free by grep across `frontend/src` before pruning:
- `assets/symbols/`, `assets/frames/`, `assets/videos/` - the pre-AssetForge legacy roots,
  fully superseded by `assets/themes/<id>/{symbols,frames}`.
- `assets/themes/future-spinner/backgrounds/bg-1.mp4` - the retired video background;
  `themeAssets.backgroundVideo/isVideo` are dead fields no component reads.
- `assets/ui/*` - the pre-LAYOUT_SPEC "WinPod era" HUD art, except `win_pod_v3_active.png` /
  `win_pod_v3_idle.png`, which `WinPod.svelte` still serves (`ReplayMode.svelte` mounts it for
  bet replay) - those two remain live and ship.
- The three alternate themes (`beautiful-game`, `oil-and-fire`, `trap-lane`) + the raw
  concept/preview art dump (`themes/source/`) - ~153MB, unreachable in the served build since
  `App.svelte` forces `future-spinner` unconditionally whenever `!import.meta.env.DEV`, with
  no override that survives it, and the dev-only `ThemeSelector` that reaches them is gated on
  the same flag. `closeBundle` only runs for `vite build`, never `vite dev`, so the dev server
  keeps every theme for local theme-selector testing; only the shipped artifact is pruned.

**Result (measured on this rebase, current `main` + the diet plugin):** dist pruned from
**29 paths, 310.83MB** down to a **9.5MB** final shipped bundle - well under the brief's
target (25MB).

### 2. QA soak harness - `frontend/scripts/qa_soak.mjs`, `frontend/scripts/build_diet_verify.mjs`
Scripts to run isolated-server soak sessions and verify the build-diet pruning against a live
build. `reports/qa/` holds the **original 2026-07-04 run's** logs (`soak-1.log`,
`soak-1-summary.json`, `session-a/b-result.json`, `isolated-server-a.log`,
`build-diet-network-log.json`) - preserved as historical evidence the harness works, but they
predate the entire graphics/menu/animation overhaul, so they are NOT current verification.

## Verification (this rebase, 2026-07-07)
- `npm run build`: succeeds; diet plugin fires and reports the prune (29 paths, 310.83MB).
- `npx svelte-check`: 6 errors, 0 warnings - all 6 are the pre-existing `node_modules` `.d.ts`
  errors, zero new.
- `npm run preview`: serves; screenshot in `reports/screens/build-diet/after-build.png` -
  the intro splash and full theme render correctly on the diet-pruned bundle.
- Locked files (`rgsService.ts`, `gameStore.ts`, `games/**`): untouched.

## Cross-session note (found during this rebase)
`frontend/package.json` on `main` already carried the `"qa:soak": "node scripts/qa_soak.mjs"`
line - introduced incidentally by an unrelated commit (`eb30a0b`, Symbol Life v2 idles/FX),
which must have picked it up from a dirty working tree at commit time. The referenced script
did not exist on `main` until this commit, so `npm run qa:soak` was pointing at nothing.
This commit fills that real gap; `package.json` itself needed no change here (already matches
HEAD) and is not part of this diff.

## Needs owner attention
- **The QA soak logs in `reports/qa/` are stale** (pre-date the whole overhaul arc). Fable
  already flagged that the QA re-soak must cover all five live modes once FeatureMath v2
  ships - re-run `qa:soak` at that point rather than relying on these logs.
- No other action needed; this is a shipped-bundle size win with no behavioural change.

## FOR THE NEXT SESSION
- **Model/effort:** Opus 4.8 (1M), High. **Approach:** recovered uncommitted work from a
  stale local worktree; rebased onto current `main` (stash -> fast-forward -> stash pop ->
  resolve one `package.json` conflict) rather than committing a stale `dist`; regenerated
  `dist` fresh so the shipped artifact reflects both the diet pruning and every merged reskin.
- **Alternatives rejected:** committing the stale pre-rebase `dist` diff as-is (rejected - it
  would have reverted `dist` to a pre-overhaul state); discarding the work as "probably
  redundant" without inspecting it first (rejected - the `vite.config.ts`/`package.json` diff
  turned out to be substantive, well-documented engineering, not incidental noise).
- **Files touched:** `frontend/vite.config.ts`,
  `frontend/scripts/build_diet_verify.mjs`, `frontend/scripts/qa_soak.mjs`,
  `FS_BuildDiet_QA_Prompt.md`, `reports/qa/*`, `reports/screens/build-diet/after-build.png`.
  (`frontend/package.json` needed no change - already matched HEAD; `frontend/dist/`
  is gitignored and excluded from this commit - it is regenerated at build/deploy time.)
- **Open threads:** re-run `qa:soak` after FeatureMath v2 ships (all five modes live); the
  root-hygiene cleanup Fable flagged (old `HANDOVER.md` + the accumulated `FS_*_Prompt.md`
  files) is still outstanding and deliberately deferred to its own pass.
