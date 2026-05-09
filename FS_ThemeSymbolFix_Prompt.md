# FUTURE SPINNER — FIX THEME SYMBOL PATHS
## Makes GameGrid.svelte load symbols from the active theme
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.

---

## CONTEXT

GameGrid.svelte has three hardcoded constants:
```typescript
const IDLE_BASE = 'assets/symbols/idle'
const WIN_BASE  = 'assets/symbols/win'
const PNG_IDLE  = 'assets/symbols/idle-png'
```

These always load future-spinner symbols regardless of the active theme.
All other themes have symbols at `assets/themes/{id}/symbols/*.png` (PNG only, no video).

---

## STEP 0 — READ CURRENT STATE

```bash
# Find the exact lines of the three constants
grep -n "IDLE_BASE\|WIN_BASE\|PNG_IDLE\|getIdleSrc\|getWinSrc\|themeAssets\|import.*theme" \
  ~/math-sdk/frontend/src/lib/components/GameGrid.svelte | head -30

# Confirm themeAssets exposes id and assetBase
grep -n "id:\|assetBase:\|return {" \
  ~/math-sdk/frontend/src/lib/stores/themeStore.ts | head -20
```

Report exact line numbers. Then execute fixes.

---

## FIX 1 — themeStore.ts: confirm id and assetBase are exposed

If `id` and `assetBase` are NOT already in the derived `themeAssets` return object, add them.

```typescript
// In the derived themeAssets store, ensure the return includes:
return {
  id:        t.id,        // ← add if missing
  assetBase: b,           // ← add if missing
  // ... all existing fields unchanged
}
```

If they are already there, skip this fix.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/stores/themeStore.ts
git commit -m "fix(theme): expose id and assetBase on themeAssets store"
git push origin main
```

---

## FIX 2 — GameGrid.svelte: make symbol paths reactive to active theme

Read the full file first:
```bash
wc -l ~/math-sdk/frontend/src/lib/components/GameGrid.svelte
head -60 ~/math-sdk/frontend/src/lib/components/GameGrid.svelte
```

### Step 2a — Import themeAssets

At the top of the `<script>` section, add the import if not already present:
```typescript
import { themeAssets } from '../stores/themeStore'
```

### Step 2b — Replace the three hardcoded constants with reactive statements

Find and remove:
```typescript
const IDLE_BASE = 'assets/symbols/idle'
const WIN_BASE  = 'assets/symbols/win'
const PNG_IDLE  = 'assets/symbols/idle-png'
```

Replace with reactive statements (add to the script section):
```typescript
// Reactive symbol paths — future-spinner uses video, other themes use PNG
$: _isFS      = $themeAssets.id === 'future-spinner'
$: _assetBase = $themeAssets.assetBase   // e.g. 'assets/themes/trap-lane'
$: IDLE_BASE  = _isFS ? 'assets/symbols/idle'     : `${_assetBase}/symbols`
$: WIN_BASE   = _isFS ? 'assets/symbols/win'      : `${_assetBase}/symbols`
$: PNG_IDLE   = _isFS ? 'assets/symbols/idle-png' : `${_assetBase}/symbols`
```

### Step 2c — Update getIdleSrc and getWinSrc to handle both video and PNG

Find the current `getIdleSrc` and `getWinSrc` functions. They likely look like:
```typescript
function getIdleSrc(symbol: string): string {
  return `${IDLE_BASE}/${symbol.toUpperCase()}_idle.mp4`
}
function getWinSrc(symbol: string): string {
  return `${WIN_BASE}/${symbol.toUpperCase()}_win.mp4`
}
```

Replace with versions that branch on `_isFS`:
```typescript
function getIdleSrc(symbol: string): string {
  if (_isFS) return `${IDLE_BASE}/${symbol.toUpperCase()}_idle.mp4`
  // Non-FS themes: PNG only, lowercase filenames
  // Map internal codes to theme PNG names
  const nameMap: Record<string, string> = {
    'H1': 'h1', 'H2': 'h2',
    'M1': 'm1', 'M2': 'm2', 'M3': 'm3',
    'L1': 'l1', 'L2': 'l2', 'L3': 'l3',
    'W':  'wild', 'S': 'scatter'
  }
  const fname = nameMap[symbol.toUpperCase()] ?? symbol.toLowerCase()
  return `${IDLE_BASE}/${fname}.png`
}

function getWinSrc(symbol: string): string {
  if (_isFS) return `${WIN_BASE}/${symbol.toUpperCase()}_win.mp4`
  // Non-FS themes have no win video — return same PNG (win burst is CSS only)
  const nameMap: Record<string, string> = {
    'H1': 'h1', 'H2': 'h2',
    'M1': 'm1', 'M2': 'm2', 'M3': 'm3',
    'L1': 'l1', 'L2': 'l2', 'L3': 'l3',
    'W':  'wild', 'S': 'scatter'
  }
  const fname = nameMap[symbol.toUpperCase()] ?? symbol.toLowerCase()
  return `${WIN_BASE}/${fname}.png`
}
```

### Step 2d — Update the template: show video only for future-spinner

Find the symbol cell template. It likely has a `<video>` element with a fallback `<img>`.

The non-FS themes have no MP4 files. Update the template so video is only used for FS:

```svelte
<div class="symbol-cell" data-col={col} data-row={row}>
  {#if _isFS}
    <!-- future-spinner: video symbol with PNG fallback -->
    <video
      bind:this={videoRefs[col][row]}
      class="symbol-video"
      autoplay loop muted playsinline
      data-col={col} data-row={row}
    >
      <source src={getIdleSrc(board[col]?.[row] ?? 'L3')} type="video/mp4" />
    </video>
  {:else}
    <!-- Other themes: PNG symbol -->
    <img
      bind:this={imgRefs[col][row]}
      class="symbol-img"
      src={getIdleSrc(board[col]?.[row] ?? 'L3')}
      alt={board[col]?.[row] ?? 'L3'}
      draggable="false"
    />
  {/if}
  <!-- Spin overlay (all themes) -->
  <div
    class="spin-overlay"
    bind:this={spinOverlayRefs[col]}
    aria-hidden="true"
  ></div>
</div>
```

**Note:** If `imgRefs` doesn't exist yet, add it alongside `videoRefs`:
```typescript
let imgRefs: (HTMLImageElement | null)[][] =
  Array.from({ length: REELS }, () =>
    Array.from({ length: ROWS }, (): HTMLImageElement | null => null)
  )
```

### Step 2e — Update _landReel to handle both video and img

Find `_landReel` (or equivalent function that updates symbols after a spin stops).
It currently updates `videoRefs[r][row].src`. Add a branch for non-FS themes:

```typescript
async function _landReel(r: number, finalBoard: string[][]): Promise<void> {
  _clearColBlur(r)

  const reel = finalBoard[r] ?? []
  for (let row = 0; row < ROWS; row++) {
    const sym = (reel[row] ?? 'L3').toUpperCase()

    if (_isFS) {
      // future-spinner: update video src
      const vid = videoRefs[r][row]
      if (vid) {
        vid.src = getIdleSrc(sym)
        vid.load()
        vid.play().catch(() => {})
        vid.style.opacity = '1'
      }
    } else {
      // Other themes: update img src
      const img = imgRefs[r]?.[row]
      if (img) {
        img.src = getIdleSrc(sym)
        img.style.opacity = '1'
      }
    }
  }

  playReelStop(r)
  if ((finalBoard[r] ?? []).some(s => s === 'S')) playScatterLand()
  await _bounceCol(r)
}
```

### Step 2f — Update win burst for non-FS themes

Find `_triggerWinBurst`. For non-FS themes there are no win MP4s.
Add a CSS class-based win flash for non-FS instead:

```typescript
function _triggerWinBurst(wins: WinResult[], board: string[][]): void {
  if (!wins.length) return

  const winningCells = new Set<string>()
  for (const win of wins) {
    for (const [col, row] of win.positions) {
      winningCells.add(`${col},${row}`)
    }
  }

  for (let col = 0; col < REELS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const isWinner = winningCells.has(`${col},${row}`)

      if (_isFS) {
        const vid = videoRefs[col][row]
        if (vid) {
          if (isWinner) {
            vid.src = getWinSrc(board[col]?.[row] ?? 'L3')
            vid.load()
            vid.play().catch(() => {})
            vid.style.opacity = '1'
          } else {
            vid.style.opacity = '0.4'
          }
        }
      } else {
        const img = imgRefs[col]?.[row]
        if (img) {
          if (isWinner) {
            img.style.opacity = '1'
            img.classList.add('win-flash')
          } else {
            img.style.opacity = '0.35'
          }
        }
      }
    }
  }

  // Revert after 4 seconds
  winBurstTimer = setTimeout(() => {
    for (let col = 0; col < REELS; col++) {
      for (let row = 0; row < ROWS; row++) {
        if (_isFS) {
          const vid = videoRefs[col][row]
          if (vid) {
            vid.src = getIdleSrc(board[col]?.[row] ?? 'L3')
            vid.load()
            vid.play().catch(() => {})
            vid.style.opacity = '1'
          }
        } else {
          const img = imgRefs[col]?.[row]
          if (img) {
            img.style.opacity = '1'
            img.classList.remove('win-flash')
          }
        }
      }
    }
  }, 4000)
}
```

Add CSS for win flash (non-FS themes):
```css
.symbol-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transition: opacity 0.2s ease;
}

@keyframes win-flash-pulse {
  0%, 100% { filter: brightness(1) drop-shadow(0 0 8px rgba(0,255,255,0.8)); }
  50%       { filter: brightness(1.3) drop-shadow(0 0 16px rgba(0,255,255,1)); }
}

.symbol-img.win-flash {
  animation: win-flash-pulse 0.6s ease-in-out infinite;
}
```

---

## FIX 3 — TSC + Build

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Fix ALL TypeScript errors. Common issues:
- `imgRefs` type — use `HTMLImageElement | null`
- `_isFS` used in function body but is a reactive variable — TypeScript may complain
  if used inside non-reactive functions. Use `get(themeAssets).id === 'future-spinner'`
  inside plain functions instead of `_isFS`

---

## FIX 4 — Commit + Status

```bash
cd ~/math-sdk && git add -A
git commit -m "fix(theme): GameGrid loads symbols from active theme — all 4 themes now show correct symbols"
git push origin main

cat >> ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md << 'EOF'

## THEME SYMBOL FIX — 2026-04-12
- ✅ GameGrid.svelte: IDLE_BASE/WIN_BASE/PNG_IDLE now reactive to $themeAssets.id
- ✅ future-spinner: still uses video symbols (MP4) — unchanged
- ✅ trap-lane, oil-and-fire, beautiful-game: now load PNG symbols from themes/{id}/symbols/
- ✅ Win burst: FS uses _win.mp4, other themes use CSS win-flash animation
- ✅ TSC: 0 errors | Build: pass
EOF

cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md ~/Desktop/FUTURE_SPINNER_PROJECT_STATUS.md
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
THEME SYMBOL PATHS FIXED
═══════════════════════════════════════════════════════════════════

FIX 1 — themeStore: id + assetBase exposed        [ done ]
FIX 2 — GameGrid: reactive symbol paths           [ done ]
  - IDLE_BASE/WIN_BASE/PNG_IDLE now reactive
  - getIdleSrc/getWinSrc branch on _isFS
  - Template: <video> for FS, <img> for others
  - _landReel: updates correct element per theme
  - _triggerWinBurst: MP4 for FS, CSS flash for others
FIX 3 — TSC: 0 errors | Build: pass               [ done ]
FIX 4 — Committed + status updated                [ done ]

RESULT: Switch to trap-lane → trap-lane symbols ✅
        Switch to oil-and-fire → oil-and-fire symbols ✅
        Switch to beautiful-game → beautiful-game symbols ✅
        Switch back to future-spinner → video symbols ✅

═══════════════════════════════════════════════════════════════════
