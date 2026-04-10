# FUTURE SPINNER — TWO-STATE ANIMATED SYMBOL SYSTEM
## Major architectural upgrade: static PNG → video symbols + animated background
## Read this file completely before touching any code.
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Create ANY new file or directory without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.
**Working directory:** ~/math-sdk/frontend/

---

## WHAT THIS SESSION DOES

Replaces the PixiJS static PNG symbol system with a two-state
HTML5 video symbol system. Every symbol now has:

- `_idle.mp4` — seamless loop, plays continuously when symbol is resting
- `_win.mp4` — plays ONCE (exactly 4.0s) when symbol is part of a win

Also installs the new animated video background.

This is an architectural change to GameGrid.svelte only.
All win logic, RTP, reel strips, math SDK — unchanged.

---

## STEP 0 — COPY ASSETS TO PROJECT

```bash
# Create destination directories
mkdir -p ~/math-sdk/frontend/public/assets/symbols/idle
mkdir -p ~/math-sdk/frontend/public/assets/symbols/win
mkdir -p ~/math-sdk/frontend/public/assets/symbols/idle-png
mkdir -p ~/math-sdk/frontend/public/assets/symbols/win-png

# Copy idle MP4s
cp ~/Downloads/fs-symbols/video/idle/h1_rim_idle.mp4     ~/math-sdk/frontend/public/assets/symbols/idle/H1_idle.mp4
cp ~/Downloads/fs-symbols/video/idle/h2_turbo_idle.mp4   ~/math-sdk/frontend/public/assets/symbols/idle/H2_idle.mp4
cp ~/Downloads/fs-symbols/video/idle/m1_grille_idle.mp4  ~/math-sdk/frontend/public/assets/symbols/idle/M1_idle.mp4
cp ~/Downloads/fs-symbols/video/idle/m2_exhaust_idle.mp4 ~/math-sdk/frontend/public/assets/symbols/idle/M2_idle.mp4
cp ~/Downloads/fs-symbols/video/idle/m3_wheel_idle.mp4   ~/math-sdk/frontend/public/assets/symbols/idle/M3_idle.mp4
cp ~/Downloads/fs-symbols/video/idle/l1_lugnut_idle.mp4  ~/math-sdk/frontend/public/assets/symbols/idle/L1_idle.mp4
cp ~/Downloads/fs-symbols/video/idle/l2_sparkplug_idle.mp4 ~/math-sdk/frontend/public/assets/symbols/idle/L2_idle.mp4
cp ~/Downloads/fs-symbols/video/idle/l3_piston_idle.mp4  ~/math-sdk/frontend/public/assets/symbols/idle/L3_idle.mp4
cp ~/Downloads/fs-symbols/video/idle/wild_idle.mp4        ~/math-sdk/frontend/public/assets/symbols/idle/W_idle.mp4
cp ~/Downloads/fs-symbols/video/idle/scatter_idle.mp4     ~/math-sdk/frontend/public/assets/symbols/idle/S_idle.mp4

# Copy win MP4s
cp ~/Downloads/fs-symbols/video/win/h1_rim_win.mp4      ~/math-sdk/frontend/public/assets/symbols/win/H1_win.mp4
cp ~/Downloads/fs-symbols/video/win/h2_turbo_win.mp4    ~/math-sdk/frontend/public/assets/symbols/win/H2_win.mp4
cp ~/Downloads/fs-symbols/video/win/m1_grille_win.mp4   ~/math-sdk/frontend/public/assets/symbols/win/M1_win.mp4
cp ~/Downloads/fs-symbols/video/win/m2_exhaust_win.mp4  ~/math-sdk/frontend/public/assets/symbols/win/M2_win.mp4
cp ~/Downloads/fs-symbols/video/win/m3_wheel_win.mp4    ~/math-sdk/frontend/public/assets/symbols/win/M3_win.mp4
cp ~/Downloads/fs-symbols/video/win/l1_lugnut_win.mp4   ~/math-sdk/frontend/public/assets/symbols/win/L1_win.mp4
cp ~/Downloads/fs-symbols/video/win/l2_sparkplug_win.mp4 ~/math-sdk/frontend/public/assets/symbols/win/L2_win.mp4
cp ~/Downloads/fs-symbols/video/win/l3_piston_win.mp4   ~/math-sdk/frontend/public/assets/symbols/win/L3_win.mp4
cp ~/Downloads/fs-symbols/video/win/wild_win.mp4         ~/math-sdk/frontend/public/assets/symbols/win/W_win.mp4
cp ~/Downloads/fs-symbols/video/win/scatter_win.mp4      ~/math-sdk/frontend/public/assets/symbols/win/S_win.mp4

# Copy PNG fallbacks
cp ~/Downloads/fs-symbols/processed/idle/h1_rim_idle.png      ~/math-sdk/frontend/public/assets/symbols/idle-png/H1.png
cp ~/Downloads/fs-symbols/processed/idle/h2_turbo_idle.png    ~/math-sdk/frontend/public/assets/symbols/idle-png/H2.png
cp ~/Downloads/fs-symbols/processed/idle/m1_grille_idle.png   ~/math-sdk/frontend/public/assets/symbols/idle-png/M1.png
cp ~/Downloads/fs-symbols/processed/idle/m2_exhaust_idle.png  ~/math-sdk/frontend/public/assets/symbols/idle-png/M2.png
cp ~/Downloads/fs-symbols/processed/idle/m3_wheel_idle.png    ~/math-sdk/frontend/public/assets/symbols/idle-png/M3.png
cp ~/Downloads/fs-symbols/processed/idle/l1_lugnut_idle.png   ~/math-sdk/frontend/public/assets/symbols/idle-png/L1.png
cp ~/Downloads/fs-symbols/processed/idle/l2_sparkplug_idle.png ~/math-sdk/frontend/public/assets/symbols/idle-png/L2.png
cp ~/Downloads/fs-symbols/processed/idle/l3_piston_idle.png   ~/math-sdk/frontend/public/assets/symbols/idle-png/L3.png
cp ~/Downloads/fs-symbols/processed/idle/wild_idle.png         ~/math-sdk/frontend/public/assets/symbols/idle-png/W.png
cp ~/Downloads/fs-symbols/processed/idle/scatter_idle.png      ~/math-sdk/frontend/public/assets/symbols/idle-png/S.png

cp ~/Downloads/fs-symbols/processed/win/h1_rim_win.png      ~/math-sdk/frontend/public/assets/symbols/win-png/H1.png
cp ~/Downloads/fs-symbols/processed/win/h2_turbo_win.png    ~/math-sdk/frontend/public/assets/symbols/win-png/H2.png
cp ~/Downloads/fs-symbols/processed/win/m1_grille_win.png   ~/math-sdk/frontend/public/assets/symbols/win-png/M1.png
cp ~/Downloads/fs-symbols/processed/win/m2_exhaust_win.png  ~/math-sdk/frontend/public/assets/symbols/win-png/M2.png
cp ~/Downloads/fs-symbols/processed/win/m3_wheel_win.png    ~/math-sdk/frontend/public/assets/symbols/win-png/M3.png
cp ~/Downloads/fs-symbols/processed/win/l1_lugnut_win.png   ~/math-sdk/frontend/public/assets/symbols/win-png/L1.png
cp ~/Downloads/fs-symbols/processed/win/l2_sparkplug_win.png ~/math-sdk/frontend/public/assets/symbols/win-png/L2.png
cp ~/Downloads/fs-symbols/processed/win/l3_piston_win.png   ~/math-sdk/frontend/public/assets/symbols/win-png/L3.png
cp ~/Downloads/fs-symbols/processed/win/wild_win.png         ~/math-sdk/frontend/public/assets/symbols/win-png/W.png
cp ~/Downloads/fs-symbols/processed/win/scatter_win.png      ~/math-sdk/frontend/public/assets/symbols/win-png/S.png

# Copy background video and fallback
cp ~/Downloads/fs-background/final/FS_Background_Loop_v1.0.mp4 \
   ~/math-sdk/frontend/public/assets/videos/bg_animated_loop.mp4
cp ~/Downloads/fs-background/final/bg_master_fallback.png \
   ~/math-sdk/frontend/public/assets/videos/bg_master_fallback.png

# Verify
echo "=== IDLE MP4s ===" && ls ~/math-sdk/frontend/public/assets/symbols/idle/
echo "=== WIN MP4s ===" && ls ~/math-sdk/frontend/public/assets/symbols/win/
echo "=== IDLE PNGs ===" && ls ~/math-sdk/frontend/public/assets/symbols/idle-png/
echo "=== BACKGROUND ===" && ls ~/math-sdk/frontend/public/assets/videos/bg_animated*
```

Commit assets:
```bash
cd ~/math-sdk && git add frontend/public/assets/symbols/ frontend/public/assets/videos/
git commit -m "feat(assets): animated symbol videos + new background — two-state system"
git push origin main
```

---

## TASK 1 — Update App.svelte background to use animated video

Read App.svelte. Find the background video section.

Replace the current background source to use the new animated loop,
with the static fallback if video fails to load within 2000ms:

```svelte
<!-- Animated background — future-spinner theme only -->
{#if $activeTheme.id === 'future-spinner'}
  <video
    class="bg-media"
    autoplay
    loop
    muted
    playsinline
    aria-hidden="true"
    id="bg-video"
  >
    <source src="assets/videos/bg_animated_loop.mp4" type="video/mp4" />
  </video>
{:else}
  <img class="bg-media" src="{$themeAssets.background}" alt="" aria-hidden="true" />
{/if}
```

Add JavaScript for the 2-second fallback to static image:
```typescript
import { onMount } from 'svelte'

onMount(() => {
  // Performance fallback: if video doesn't load in 2s, swap to static PNG
  const bgVideo = document.getElementById('bg-video') as HTMLVideoElement
  if (bgVideo) {
    const fallbackTimer = setTimeout(() => {
      if (bgVideo.readyState < 3) {
        bgVideo.style.display = 'none'
        const fallback = document.createElement('img')
        fallback.src = 'assets/videos/bg_master_fallback.png'
        fallback.className = 'bg-media'
        fallback.setAttribute('aria-hidden', 'true')
        bgVideo.parentElement?.appendChild(fallback)
      }
    }, 2000)
    bgVideo.addEventListener('canplay', () => clearTimeout(fallbackTimer), { once: true })
  }
})
```

Commit:
```bash
cd ~/math-sdk && git add frontend/src/App.svelte
git commit -m "feat(bg): animated background video with 2s fallback to static PNG"
git push origin main
```

---

## TASK 2 — Rewrite GameGrid.svelte for two-state video symbols

Read GameGrid.svelte completely first.

The current system uses PixiJS to render PNG sprites.
The new system replaces PixiJS cells with HTML5 `<video>` elements
rendered in a CSS grid overlay on top of the PixiJS canvas (or
replacing it entirely for the symbol layer).

**Architecture decision:** Keep PixiJS for win line drawing and
highlight overlays. Replace the symbol sprites with a CSS grid of
video elements positioned to match the 5×4 grid layout exactly.

### 2a — Create the video symbol grid structure

The symbol grid is a 5-column × 4-row CSS grid of video elements,
absolutely positioned to overlay the game canvas area exactly.

In GameGrid.svelte, add a `<div class="symbol-grid">` container
alongside the PixiJS canvas. The PixiJS canvas remains for win lines
and overlays (z-index above the videos).

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import { boardSymbols, activeWins, isSpinning } from '../stores/gameStore'

  // Symbol → video path mapping
  const IDLE_BASE = 'assets/symbols/idle'
  const WIN_BASE  = 'assets/symbols/win'
  const PNG_IDLE  = 'assets/symbols/idle-png'
  const PNG_WIN   = 'assets/symbols/win-png'

  // Detect if video is supported (fallback to PNG for low-power)
  const videoSupported = typeof HTMLVideoElement !== 'undefined'

  // Grid dimensions — must match PixiJS canvas layout
  const REELS = 5
  const ROWS  = 4
  const CELL_W = 140  // px — matches PixiJS CELL_W
  const CELL_H = 140  // px — matches PixiJS CELL_H

  // Track which cells are in a winning state
  let winningCells = new Set<string>()  // "col,row" keys
  let winBurstTimer: ReturnType<typeof setTimeout> | null = null

  // Reference to all video elements: videoRefs[col][row]
  let videoRefs: (HTMLVideoElement | null)[][] =
    Array.from({ length: REELS }, () => Array(ROWS).fill(null))

  // Current board from store
  $: board = $boardSymbols  // string[][] — board[col][row]

  // When board changes (new spin result), update video sources
  $: if (board) updateSymbolVideos(board)

  // When wins come in, trigger win burst
  $: if ($activeWins && $activeWins.length > 0 && !$isSpinning) {
    triggerWinBurst($activeWins, board)
  }

  // When spin starts, reset all to idle
  $: if ($isSpinning) resetToIdle()

  function getIdleSrc(symbol: string): string {
    return `${IDLE_BASE}/${symbol}_idle.mp4`
  }

  function getWinSrc(symbol: string): string {
    return `${WIN_BASE}/${symbol}_win.mp4`
  }

  function getPngFallback(symbol: string, state: 'idle' | 'win'): string {
    return state === 'idle'
      ? `${PNG_IDLE}/${symbol}.png`
      : `${PNG_WIN}/${symbol}.png`
  }

  function updateSymbolVideos(board: string[][]): void {
    for (let col = 0; col < REELS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const symbol = board[col]?.[row]
        if (!symbol) continue
        const vid = videoRefs[col][row]
        if (!vid) continue
        const src = getIdleSrc(symbol)
        if (vid.getAttribute('data-symbol') !== symbol || vid.src !== src) {
          vid.setAttribute('data-symbol', symbol)
          vid.src = src
          vid.load()
          vid.play().catch(() => {})
        }
        vid.style.opacity = '1'
      }
    }
  }

  function triggerWinBurst(wins: any[], board: string[][]): void {
    // Clear any existing win burst timer
    if (winBurstTimer) clearTimeout(winBurstTimer)

    // Build set of winning cell positions
    const newWinningCells = new Set<string>()
    for (const win of wins) {
      if (win.positions) {
        for (const [col, row] of win.positions) {
          newWinningCells.add(`${col},${row}`)
        }
      }
    }
    winningCells = newWinningCells

    // Apply win burst to winning cells, dim non-winning cells
    for (let col = 0; col < REELS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const symbol = board[col]?.[row]
        if (!symbol) continue
        const vid = videoRefs[col][row]
        if (!vid) continue
        const key = `${col},${row}`

        if (newWinningCells.has(key)) {
          // Winning symbol: swap to win burst video, play once from start
          vid.style.opacity = '1'
          vid.loop = false
          vid.src = getWinSrc(symbol)
          vid.load()
          vid.currentTime = 0
          vid.play().catch(() => {})
        } else {
          // Non-winning symbol: pause idle and dim to 40% opacity
          vid.pause()
          vid.style.opacity = '0.4'
        }
      }
    }

    // After exactly 4.0 seconds: revert ALL symbols to idle loop
    winBurstTimer = setTimeout(() => {
      winningCells = new Set()
      if (board) updateSymbolVideos(board)
      // Restore opacity on all non-winning cells
      for (let col = 0; col < REELS; col++) {
        for (let row = 0; row < ROWS; row++) {
          const vid = videoRefs[col][row]
          if (vid) {
            vid.loop = true
            vid.style.opacity = '1'
          }
        }
      }
    }, 4000)
  }

  function resetToIdle(): void {
    // Spin started — clear win state, all symbols back to idle looping
    if (winBurstTimer) {
      clearTimeout(winBurstTimer)
      winBurstTimer = null
    }
    winningCells = new Set()
    for (let col = 0; col < REELS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const vid = videoRefs[col][row]
        if (vid) {
          vid.loop = true
          vid.style.opacity = '1'
          // Play will resume when board updates with new symbols
        }
      }
    }
  }

  onDestroy(() => {
    if (winBurstTimer) clearTimeout(winBurstTimer)
  })
</script>

<!-- Symbol video grid — positioned over PixiJS canvas -->
<div class="symbol-grid">
  {#each Array(REELS) as _, col}
    {#each Array(ROWS) as _, row}
      <div class="symbol-cell">
        {#if videoSupported}
          <video
            bind:this={videoRefs[col][row]}
            class="symbol-video"
            autoplay
            loop
            muted
            playsinline
            data-col={col}
            data-row={row}
          >
            <!-- src set dynamically via updateSymbolVideos -->
          </video>
        {:else}
          <!-- PNG fallback for low-power devices -->
          <img
            class="symbol-img"
            src={board?.[col]?.[row]
              ? getPngFallback(board[col][row], winningCells.has(`${col},${row}`) ? 'win' : 'idle')
              : ''}
            alt=""
            draggable="false"
          />
        {/if}
      </div>
    {/each}
  {/each}
</div>

<!-- PixiJS canvas for win lines and highlight overlays — z-index above videos -->
<canvas bind:this={canvasEl} class="win-overlay-canvas"></canvas>
```

### 2b — CSS for the symbol grid

```css
/* Symbol grid — absolutely positioned over the game area */
.symbol-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 4px;
  padding: 4px;
  z-index: 1;
  pointer-events: none;
}

.symbol-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  overflow: hidden;
}

.symbol-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.15s ease;
}

.symbol-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.15s ease;
}

/* PixiJS canvas for win lines — rendered on top of video cells */
.win-overlay-canvas {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}
```

### 2c — Keep PixiJS but strip out sprite rendering

In the existing PixiJS setup, REMOVE all code that:
- Loads PNG textures via Assets.load()
- Creates PIXI.Sprite objects for symbols
- Renders symbols to the canvas

KEEP all code that:
- Draws win line connectors (gold lines through winning cells)
- Handles anticipation glow effects
- Handles cell highlight overlays (gold borders on winning cells)
- Manages reel stop animations and bouncing

The PixiJS canvas becomes the "win overlay" layer only.
Symbol rendering moves entirely to the HTML5 video grid.

### 2d — Reel spin animation

During spinning, the blur/tumble effect must work with video elements.
Replace the PixiJS blur filter approach with CSS on the video cells:

```typescript
// When spin starts (called from existing spin logic):
function applySpinBlur(colIndex: number): void {
  const cells = document.querySelectorAll(
    `.symbol-cell[data-col="${colIndex}"]`
  )
  cells.forEach(c => (c as HTMLElement).style.filter = 'blur(3px)')
}

function removeSpinBlur(colIndex: number): void {
  const cells = document.querySelectorAll(
    `.symbol-cell[data-col="${colIndex}"]`
  )
  cells.forEach(c => (c as HTMLElement).style.filter = '')
}
```

Note: The cells need `data-col` attribute for this to work.
Update the grid template to include it:
```svelte
<div class="symbol-cell" data-col={col} data-row={row}>
```

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/GameGrid.svelte
git commit -m "feat(symbols): two-state video symbol system — idle loop + win burst"
git push origin main
```

---

## TASK 3 — Handle win positions from rgsService

The `triggerWinBurst` function needs `win.positions` to know WHICH
cells are winners. Read rgsService.ts to confirm the exact structure
of `activeWins`.

```bash
grep -n "positions\|wins\|winInfo\|activeWins" \
  ~/math-sdk/frontend/src/lib/services/rgsService.ts | head -20

grep -n "activeWins\|winPositions" \
  ~/math-sdk/frontend/src/lib/stores/gameStore.ts | head -20
```

The win position format from the existing SDK is:
`positions: [[col, row], [col, row], ...]` per win event.

If the format differs (e.g. flat array, or `{reel, row}` objects),
adapt the `triggerWinBurst` position parsing accordingly.
Do NOT modify rgsService.ts or gameStore.ts — only read them and
adapt the parsing in GameGrid.svelte.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/GameGrid.svelte
git commit -m "fix(symbols): adapt win position parsing to match rgsService format"
git push origin main
```

---

## TASK 4 — TSC + build check

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Fix all TypeScript errors. Both must exit 0.

Common issues to watch for:
- `bind:this` on video requires `HTMLVideoElement | null` type
- The `videoRefs` 2D array initialisation
- `$boardSymbols` — confirm the store export name in gameStore.ts
  (may be `currentBoard` or `boardSymbols` — check and use correct name)
- `$activeWins` — confirm the store export name in gameStore.ts

```bash
grep -n "export\|writable\|derived" \
  ~/math-sdk/frontend/src/lib/stores/gameStore.ts | head -30
```

Adapt store names to match what gameStore.ts actually exports.

---

## TASK 5 — Status + commit

Update `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md`:

```markdown
## ANIMATED SYMBOL SYSTEM — 2026-04-10
- ✅ Two-state video system: _idle.mp4 loop + _win.mp4 burst
- ✅ 10 idle videos installed (H1-S _idle.mp4)
- ✅ 10 win burst videos installed (H1-S _win.mp4)
- ✅ 20 PNG fallbacks installed (idle-png/ and win-png/)
- ✅ New animated background: FS_Background_Loop_v1.0.mp4
- ✅ Background fallback: bg_master_fallback.png (2s timeout)
- ✅ Win logic: winners swap to _win.mp4, non-winners dim to 40%
- ✅ Win burst duration: exactly 4.0 seconds
- ✅ After 4s: all symbols revert to _idle.mp4 loop
- ✅ Spin start: all symbols reset to idle, opacity 100%
- ✅ PixiJS retained for win lines and highlight overlays only
- ✅ PNG fallback path active for low-power/no-video devices
```

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "feat(symbols): animated two-state symbol system complete"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
FUTURE SPINNER — TWO-STATE ANIMATED SYMBOL SYSTEM COMPLETE
═══════════════════════════════════════════════════════════════════

STEP 0  — Assets copied to project:              [ done ]
TASK 1  — Animated background installed:         [ done ]
TASK 2  — GameGrid rebuilt for video symbols:    [ done ]
TASK 3  — Win position parsing adapted:          [ done ]
TASK 4  — TSC + build clean:                     [ done ]
TASK 5  — Status + commit:                       [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]

SYMBOL BEHAVIOUR:
  Idle state   → _idle.mp4 loops continuously
  Win detected → winning symbols: swap to _win.mp4, play once
  Win detected → non-winning symbols: pause + 40% opacity
  After 4.0s   → all symbols revert to _idle.mp4 loop
  Spin start   → instant reset to idle loop, full opacity

BACKGROUND:
  New animated loop: FS_Background_Loop_v1.0.mp4 (32s, 24fps)
  Fallback: bg_master_fallback.png (triggers if load > 2s)

═══════════════════════════════════════════════════════════════════
