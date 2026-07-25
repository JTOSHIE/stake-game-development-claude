# FUTURE SPINNER — THEME SYSTEM AUDIT
## Generated: 2026-04-11

---

## SUMMARY

| Asset | Code Path | Files on Disk | Status |
|-------|-----------|---------------|--------|
| Symbols (video) | hardcoded `assets/symbols/idle/` | `assets/themes/{id}/symbols/` | ❌ MISMATCH |
| Symbols (PNG fallback) | hardcoded `assets/symbols/idle-png/` | `assets/themes/{id}/symbols/` | ❌ MISMATCH |
| Background | `$themeAssets.background` → `assets/themes/{id}/backgrounds/bg-1.jpg` | `assets/themes/{id}/backgrounds/bg-1.jpg` | ✅ MATCH |
| Frame | `$themeAssets.frame` → `assets/themes/{id}/frames/frame-2.png` | `assets/themes/{id}/frames/frame-2.png` | ✅ MATCH |
| Spin button | `$themeAssets.spinButton` → `assets/themes/{id}/ui/spin_button.png` | `assets/themes/{id}/ui/spin_button.png` | ✅ MATCH |
| Sounds | `$themeAssets.sounds.*` → `assets/themes/{id}/sounds/*.mp3` | `assets/themes/{id}/sounds/*.mp3` | ✅ MATCH |

---

## DETAIL: SYMBOLS — CRITICAL MISMATCH

### What the code does (GameGrid.svelte)

Three constants hardcoded at the top of the module:

```typescript
const IDLE_BASE = 'assets/symbols/idle'
const WIN_BASE  = 'assets/symbols/win'
const PNG_IDLE  = 'assets/symbols/idle-png'
```

Symbol sources are built from these constants, not from the theme store:

```typescript
function getIdleSrc(symbol: string): string {
  return `${IDLE_BASE}/${symbol.toUpperCase()}_idle.mp4`
}
function getWinSrc(symbol: string): string {
  return `${WIN_BASE}/${symbol.toUpperCase()}_win.mp4`
}
```

PNG fallback in the template:
```svelte
src="{PNG_IDLE}/{symbol}.png"
```

GameGrid **never imports or reads `$themeAssets`** for symbol paths.

### What files are on disk

Future Spinner (hardcoded path works):
```
frontend/public/assets/symbols/idle/H1_idle.mp4  … H2, M1, M2, M3, L1, L2, L3, SCATTER, WILD
frontend/public/assets/symbols/win/H1_win.mp4    … (same 10 symbols)
frontend/public/assets/symbols/idle-png/h1.png   … (lowercase, 20 fallback PNGs)
```

New themes (themeStore-derived path, never used by GameGrid):
```
frontend/public/assets/themes/trap-lane/symbols/h1.png … wild.png, scatter.png
frontend/public/assets/themes/oil-and-fire/symbols/h1.png … wild.png, scatter.png
frontend/public/assets/themes/beautiful-game/symbols/h1.png … wild.png, scatter.png
```

New themes have **PNG symbols only** — no `_idle.mp4` or `_win.mp4` video files.

### Effect of the mismatch

When any non-future-spinner theme is active:
- `getIdleSrc('h1')` → `assets/symbols/idle/H1_idle.mp4` → future-spinner symbol video
- `getWinSrc('h1')` → `assets/symbols/win/H1_win.mp4` → future-spinner win video
- PNG fallback → `assets/symbols/idle-png/h1.png` → future-spinner PNG

**All themes always display future-spinner symbols.** The new theme symbol files are never loaded.

---

## DETAIL: BACKGROUND — MATCH ✅

### Code path

`App.svelte` template:
```svelte
{:else}
  <img class="bg-media" src="{$themeAssets.background}" alt="" aria-hidden="true" />
{/if}
```

`themeStore.ts` derived store:
```typescript
background: `${b}/backgrounds/bg-1.jpg`
```
where `b = t.assetBase = 'assets/themes/{id}'`

### Files on disk
```
assets/themes/trap-lane/backgrounds/bg-1.jpg        ✅
assets/themes/oil-and-fire/backgrounds/bg-1.jpg     ✅
assets/themes/beautiful-game/backgrounds/bg-1.jpg   ✅
```

No action needed.

---

## DETAIL: FRAME — MATCH ✅

### Code path

`themeStore.ts`:
```typescript
frame: t.id === 'future-spinner'
  ? `${b}/frames/frame-1.png`
  : `${b}/frames/frame-2.png`
```

`App.svelte` uses `$themeAssets.frame`.

### Files on disk
```
assets/themes/trap-lane/frames/frame-2.png        ✅  (copied from ui/frame.png in prior session)
assets/themes/oil-and-fire/frames/frame-2.png     ✅  (copied from ui/frame.png in prior session)
assets/themes/beautiful-game/frames/frame-2.png   ✅  (copied from ui/frame.png in prior session)
```

No action needed.

---

## DETAIL: SPIN BUTTON — MATCH ✅

### Code path

`themeStore.ts`:
```typescript
spinButton: `${b}/ui/spin_button.png`
```

`ControlBar.svelte` (or App.svelte) uses `$themeAssets.spinButton`.

### Files on disk
```
assets/themes/trap-lane/ui/spin_button.png        ✅
assets/themes/oil-and-fire/ui/spin_button.png     ✅
assets/themes/beautiful-game/ui/spin_button.png   ✅
```

No action needed.

---

## DETAIL: SOUNDS — MATCH ✅

### Code path

`soundService.ts` reads `get(themeAssets).sounds` at `buildSounds()` time.

`themeStore.ts` derives:
```typescript
sounds: {
  bgmLoop:      `${b}/sounds/bgm_loop.mp3`,
  spinStart:    `${b}/sounds/spin.mp3`,
  reelStop:     `${b}/sounds/reel_stop.mp3`,
  winSmall:     `${b}/sounds/win_small.mp3`,
  winMedium:    `${b}/sounds/win_medium.mp3`,
  winBig:       `${b}/sounds/win_big.mp3`,
  winEpic:      `${b}/sounds/win_epic.mp3`,
  scatter:      `${b}/sounds/scatter_land.mp3`,
  anticipation: `${b}/sounds/anticipation.mp3`,
  reelHeavy:    `${b}/sounds/reel_heavy.mp3`,
  buttonClick:  `${b}/sounds/button_click.mp3`,
  bgmWin:       `${b}/sounds/bgm_win.mp3`,
}
```

ThemeSelector calls `window.location.reload()` on switch, so `buildSounds()` re-runs
with the new active theme — dynamic switching works without any extra code.

### Files on disk (12 files per theme, all present)
```
assets/themes/trap-lane/sounds/        ✅ 12 mp3s
assets/themes/oil-and-fire/sounds/     ✅ 12 mp3s
assets/themes/beautiful-game/sounds/   ✅ 12 mp3s
```

No action needed.

---

## REQUIRED CODE CHANGES

### Fix 1 — GameGrid.svelte: make symbol paths theme-aware

**File:** `frontend/src/GameGrid.svelte` (or wherever the component lives)

**Problem:** `IDLE_BASE`, `WIN_BASE`, `PNG_IDLE` are hardcoded strings.
`$themeAssets` is never imported in this file for symbol paths.

**Change:**

Import the theme assets store:
```typescript
import { themeAssets } from '../stores/themeStore'
```

Replace the three hardcoded constants with reactive derived values.
The new themes have PNG symbols only (no video), so the logic must branch:

```typescript
// Remove these:
// const IDLE_BASE = 'assets/symbols/idle'
// const WIN_BASE  = 'assets/symbols/win'
// const PNG_IDLE  = 'assets/symbols/idle-png'

// Add:
$: assetBase  = $themeAssets.assetBase  // e.g. 'assets/themes/trap-lane'
$: isFS       = $themeAssets.id === 'future-spinner'
$: IDLE_BASE  = isFS ? 'assets/symbols/idle'     : `${assetBase}/symbols`
$: WIN_BASE   = isFS ? 'assets/symbols/win'      : `${assetBase}/symbols`
$: PNG_IDLE   = isFS ? 'assets/symbols/idle-png' : `${assetBase}/symbols`
```

Update `getIdleSrc` and `getWinSrc` to be reactive or to accept the base as a parameter:

```typescript
function getIdleSrc(symbol: string, idleBase: string, isVideo: boolean): string {
  if (isVideo) return `${idleBase}/${symbol.toUpperCase()}_idle.mp4`
  return `${idleBase}/${symbol.toLowerCase()}.png`
}

function getWinSrc(symbol: string, winBase: string, isVideo: boolean): string {
  if (isVideo) return `${winBase}/${symbol.toUpperCase()}_win.mp4`
  return `${winBase}/${symbol.toLowerCase()}.png`
}
```

Or, since the non-FS themes have no video at all, disable the video symbol system
and use the PNG fallback path for non-FS themes:

```typescript
$: useVideoSymbols = $themeAssets.id === 'future-spinner'
```

In the template, show `<video>` only when `useVideoSymbols` is true;
otherwise show `<img>` directly from `${assetBase}/symbols/{symbol}.png`.

**Note on PNG filenames in new themes:**
New theme symbol files are named lowercase: `h1.png`, `h2.png`, `m1.png`, `m2.png`,
`m3.png`, `l1.png`, `l2.png`, `l3.png`, `scatter.png`, `wild.png`.
The game's internal symbol names should already match these (lowercase) when used with `.toLowerCase()`.

---

### Fix 2 — themeStore.ts: expose `id` and `assetBase` on `themeAssets`

**File:** `frontend/src/lib/stores/themeStore.ts`

**Check:** The derived `themeAssets` store may only expose the path strings (background, frame,
sounds, etc.) but not `id` or `assetBase` directly. GameGrid needs both.

Add to the derived store's return value:
```typescript
id:        t.id,
assetBase: b,
```

If they are already present, no change needed.

---

## VERIFICATION CHECKLIST (after applying fixes)

1. Switch to `trap-lane` — reel symbols should show trap-lane PNGs, not future-spinner videos
2. Switch to `oil-and-fire` — symbols should show oil-and-fire PNGs
3. Switch to `beautiful-game` — symbols should show beautiful-game PNGs
4. Switch back to `future-spinner` — symbols should show idle.mp4 video loop (not PNGs)
5. Win animation: future-spinner shows `_win.mp4`; other themes may need a CSS win-flash
   fallback since they have no `_win.mp4` files
6. TSC: 0 errors | Build: pass

---

## FILES CONSULTED

- `frontend/src/lib/components/GameGrid.svelte`
- `frontend/src/lib/stores/themeStore.ts`
- `frontend/src/lib/config/themes.ts`
- `frontend/src/App.svelte`
- `frontend/public/assets/themes/oil-and-fire/` (directory listing)
- `frontend/public/assets/themes/oil-and-fire/symbols/` (directory listing)
- `frontend/public/assets/themes/oil-and-fire/frames/` (directory listing)
- `frontend/public/assets/symbols/idle/` (directory listing — future-spinner videos)
