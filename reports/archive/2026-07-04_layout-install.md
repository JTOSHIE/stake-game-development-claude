# Session Report: Layout install — LAYOUT_SPEC v3.1 rendered, old HUD retired

- **Date:** 2026-07-04
- **Branch:** `claude/layout-install` (from up-to-date `main`; PR #11 asset-wiring-fix
  already merged to main).
- **Brief:** `FS_LayoutInstall_Prompt.md` (saved verbatim).

## Problem

AssetForge v2 (PR #10) produced every master, export, and the layout law itself
(`design-system/LAYOUT_SPEC.md`), but deliberately dropped its own Task 5 (the HUD/scene
rebuild) as too large to big-bang unverified in that pass. The live app was still the old
720x760 flex-column layout mounting `ControlBar`, `WinPod`, `BalanceDisplay` and `WinDisplay`
— none of which exist in LAYOUT_SPEC. This pass builds and mounts the actual LAYOUT_SPEC v3.1
surface and retires the superseded components from the live-game tree.

## What was built

**Stage re-architecture.** `App.svelte`'s design surface changed from a fixed 720x760 flex
column to the LAYOUT_SPEC 1280x720 absolutely-positioned stage, scaled together by a single
factor `S = min(vw/1280, vh/720)` (CSS var `--S`, replacing the old `--fit-scale`). Every
element below is positioned in stage coordinates and shrinks/grows together — verified with
no clipping or scrollbars at all six compliance viewports.

| Element | Spec position | Implementation |
|---|---|---|
| Logo | top centre, 380 wide, y 18 | `.logo-box` 450,18,380,60 (height capped so it clears the frame top at y84) |
| Frame | 640x468 at (320,84) | `.game-frame`, switched future-spinner to `frame-2.png` (themeStore.ts, one-line, reversible) |
| Grid | 522x349 centred in the frame | `.grid-slot` at 379,143.5; GameGrid's native 616x412 canvas scaled 0.8474 via `transform-origin: top left` |
| HUD panel | x 320-960, y 560-648, radius 18 | `HudOverlay.svelte` `.hud-panel` |
| SPIN | 84 diameter, centre (970,604) | `HudOverlay.svelte` `.spin-btn`, generic (non-themed) treatment |
| AUTOPLAY | 48, centre (902,672) | `HudOverlay.svelte` `.autoplay-wrapper`, reuses the existing autoplay start/stop flow |
| TURBO | 72, far left inside the panel | `HudOverlay.svelte` `.turbo-btn` — the one themed accent inside the generic panel |
| FEATURE | Grille export, ~128 wide, beside the frame upper left | `FeatureButton.svelte`, opens the existing `BuyBonus` confirm flow |
| Scene group | left, ~560 tall, car nose under the frame | `SceneGroup.svelte`, z8 (below the frame's z10) |
| Bonus instrument column | gauge 232 at (1018,96), plates 1000-1262 | `BonusInstrumentColumn.svelte` — Overdrive only |
| Banner | compact 380x96 at (450,262), gold rim, z100 | `WinBanner.svelte` restyled CSS-only (no more `big_win_banner.png`) |

**New components:** `HudOverlay.svelte`, `FeatureButton.svelte`, `SceneGroup.svelte`,
`BonusInstrumentColumn.svelte`.

**New non-locked store:** `speedMode.ts` — a three-tier speed cycle (Normal / Turbo / Super
Turbo) layered on top of the locked `gameStore.isTurbo` boolean (kept in sync so every
existing turbo consumer is unaffected); `GameGrid.svelte` reads the tier directly to apply
the extra Super Turbo quarter-speed reduction. This avoids touching the locked `gameStore.ts`
for a third state.

**Tile plate wiring.** `GameGrid.svelte` now fetches `plates.json` at runtime per theme and
renders `tile_plate.png` behind every symbol cell, tinted per the symbol's signature colour
via a box-shadow edge glow — the wiring AssetForge v2's report flagged as deferred.

**BuyBonus.svelte / FreeSpinsPresentation.svelte (additive, non-breaking).** `BuyBonus` gained
`export let showTrigger = true` and `export function openConfirm()` so `FeatureButton` can
drive its existing confirm-modal flow without a second on-screen trigger button.
`FreeSpinsPresentation` exported its `displayMeter` / `spinsRemaining` /
`runningTotalCentibets` locals (now bindable) so `BonusInstrumentColumn` shows the exact same
live values the free-spins overlay itself does.

## Retired from the mounted live-game tree (files NOT deleted)

`ControlBar.svelte`, `WinPod.svelte`, `BalanceDisplay.svelte`, `WinDisplay.svelte` (the old
footer `.hud`), and the old standalone buy-bonus row. LAYOUT_SPEC has no pod and no MAX bet,
and duplicating BALANCE/WIN displays outside the new HUD panel would itself be an occlusion
risk, so I retired all four rather than only the two named in the brief — noting this scope
extension here for the owner's review.

**Scope note — `ReplayMode.svelte` is out of scope.** It still legitimately imports and mounts
`WinDisplay` and `WinPod` for its own compliance-mandated replay presentation (CLAUDE.md:
"In replay mode BalanceDisplay, ControlBar, AutoPlayModal and ThemeSelector are not
rendered" — WinDisplay/WinPod are not on that exclusion list, and replay never touches
rgsService or gameStore.ts directly). The retirement audit below is scoped to `App.svelte`'s
live-game branch, which is what the brief's "mounted tree" refers to.

## Proof gates

**a. Screenshots** — `reports/screens/layout-v1/`: `base.png`, `bonus.png` (mock Overdrive
round triggered via the guaranteed bonus buy — DEV-only mock round provider), plus the six
compliance viewports (`mobile-s.png` 320x568, `mobile-m.png` 375x667, `mobile-l.png` 425x812,
`popout-s.png` 400x225, `popout-l.png` 800x450, `desktop.png` 1200x675). Reproducible via
`frontend/scripts/layout_v1_audit.mjs` (`npm run dev` then `npx tsx scripts/layout_v1_audit.mjs`
from `frontend/`).

**b. DOM occlusion audit** — zero bounding-box intersections between any two text-bearing HUD
elements, and between HUD text and the frame, at every captured state:

| Viewport | Boxes checked | Occlusion failures |
|---|---|---|
| 1280x720 (base) | 10 | 0 |
| Mobile S 320x568 | 10 | 0 |
| Mobile M 375x667 | 10 | 0 |
| Mobile L 425x812 | 10 | 0 |
| Popout S 400x225 | 10 | 0 |
| Popout L 800x450 | 10 | 0 |
| Desktop 1200x675 | 10 | 0 |
| 1280x720 (bonus/Overdrive) | 13 | 0 |

Full matrix (selectors + boxes) archived in `reports/screens/layout-v1/audit-results.json`.

**c. Position audit** — measured at 1280x720 (S=1, so design units map 1:1 to pixels):

| Element | Expected | Measured | Deviation |
|---|---|---|---|
| HUD panel bounds | x320 y560 640x88 | x320 y560 640x88 | 0px |
| SPIN button centre | (970, 604) | (970, 604) | 0px |
| Logo box bounds | x450 y18 380x60 | x450 y18 380x60 | 0px |
| Instrument column bounds | x1000 y96 w262 | x1000 y96 w262 (h366) | 0px |

**d. Retirement audit** — `grep -n "ControlBar\|WinPod\|BalanceDisplay\|WinDisplay"
frontend/src/App.svelte` returns no matches. All four component files remain on disk
unmodified except where noted (BuyBonus/FreeSpinsPresentation additive exports); ControlBar,
WinPod, BalanceDisplay untouched entirely.

**e. Type/build/maths gates:**

| Gate | Result |
|------|--------|
| `svelte-check` on edited/new files | 0 new errors (WinDisplay.svelte's 1 pre-existing `GameMode` error and the 6 pre-existing `roundInterpreter.test.ts` errors are untouched baseline; fixed the same `GameMode` cast in the 3 files this pass touched that had it: `FeatureButton.svelte` (new), `BuyBonus.svelte`, `FreeSpinsPresentation.svelte`) |
| `npx tsc -p tsconfig.node.json --noEmit` | clean |
| `npm run build` | clean |
| Exact-total interpreter test (`npx tsx src/lib/services/roundInterpreter.test.ts`) | PASS 44/44 |

## CLAUDE.md

Added convention (h): visual-proof screenshots (before/after) for any pass that changes what
renders, committed to `reports/screens/<pass>/`.

## Scope and locks

`rgsService.ts`, `gameStore.ts`, `games/future_spinner/**` untouched — no lock exception
needed or taken (confirmed before starting, per the brief's own instruction to stop and
report rather than lift anything if a lock exception seemed necessary; it did not).

## Files changed

New: `frontend/src/lib/components/HudOverlay.svelte`, `FeatureButton.svelte`,
`SceneGroup.svelte`, `BonusInstrumentColumn.svelte`, `frontend/src/lib/stores/speedMode.ts`,
`frontend/scripts/layout_v1_audit.mjs`, `reports/screens/layout-v1/*.png` +
`audit-results.json`, `FS_LayoutInstall_Prompt.md`.

Edited: `frontend/src/App.svelte` (full re-architecture), `frontend/src/lib/components/
GameGrid.svelte` (tile plate wiring, speed tiers), `frontend/src/lib/components/WinBanner.svelte`
(compact CSS restyle), `frontend/src/lib/components/BuyBonus.svelte` (additive
`showTrigger`/`openConfirm`), `frontend/src/lib/components/FreeSpinsPresentation.svelte`
(additive bindable exports), `frontend/src/lib/stores/themeStore.ts` (frame-2 switch),
`CLAUDE.md` (convention h), `FUTURE_SPINNER_PROJECT_STATUS.md` (copied to `~/Desktop/`).
