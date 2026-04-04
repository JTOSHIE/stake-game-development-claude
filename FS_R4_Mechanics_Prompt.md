# FUTURE SPINNER — R4 WIRING + GAME MECHANICS UPGRADE
## Read this file and execute all tasks in order without stopping.
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.
**Working directory:** ~/math-sdk/frontend/

---

## STEP 0 — ORIENTATION

```bash
# Confirm R4 assets are present
ls ~/math-sdk/frontend/public/assets/ui/logo*
ls ~/math-sdk/frontend/public/assets/sounds/win_epic.mp3

# Read the files we will modify
cat ~/math-sdk/frontend/src/App.svelte
cat ~/math-sdk/frontend/src/lib/components/GameGrid.svelte
cat ~/math-sdk/frontend/src/lib/services/soundService.ts
cat ~/math-sdk/frontend/src/lib/components/WinDisplay.svelte

cd ~/math-sdk/frontend && npx tsc --noEmit 2>&1
```

---

## TASK 1 — Wire R4 logo assets into App.svelte

Replace the plain text header with the logo PNG images.

In `src/App.svelte`, find the game header section containing
"FUTURE SPINNER" and "WE ROLL SPINNERS" text. It likely looks like:

```svelte
<header class="game-header">
  <h1 class="game-title">FUTURE SPINNER</h1>
  <p class="game-subtitle">WE ROLL SPINNERS</p>
</header>
```

Replace with image-based logo:
```svelte
<header class="game-header">
  <img
    src="assets/ui/logo_future_spinner.png"
    class="game-logo"
    alt="FUTURE SPINNER"
    draggable="false"
  />
  <img
    src="assets/ui/logo_we_roll_spinners.png"
    class="game-subtitle-logo"
    alt="WE ROLL SPINNERS"
    draggable="false"
  />
</header>
```

Add CSS:
```css
.game-logo {
  height: clamp(40px, 6vw, 70px);
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 12px rgba(0,255,255,0.5))
          drop-shadow(0 0 24px rgba(255,215,0,0.3));
  animation: logo-pulse 4s ease-in-out infinite;
}

@keyframes logo-pulse {
  0%, 100% { filter: drop-shadow(0 0 10px rgba(0,255,255,0.4))
                     drop-shadow(0 0 20px rgba(255,215,0,0.25)); }
  50%       { filter: drop-shadow(0 0 18px rgba(0,255,255,0.7))
                     drop-shadow(0 0 36px rgba(255,215,0,0.45)); }
}

.game-subtitle-logo {
  height: clamp(14px, 2vw, 20px);
  width: auto;
  object-fit: contain;
  opacity: 0.8;
  margin-top: 2px;
}
```

Also update LoadingScreen.svelte to use `logo_future_spinner_loading.png`
for the loading screen logo if it currently uses text or a different asset.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(ui): wire R4 logo PNGs for header and loading screen"
git push origin main
```

---

## TASK 2 — Wire win_epic.mp3 into soundService

The R4 package includes a new `win_epic.mp3` for 20×+ wins. Wire it in.

In `src/lib/services/soundService.ts`:

Add to the sounds object:
```typescript
const sounds: Record<string, HTMLAudioElement> = {
  bgm:      new Audio(`${BASE}bgm_loop.mp3`),
  spin:     new Audio(`${BASE}spin.mp3`),
  reelStop: new Audio(`${BASE}reel_stop.mp3`),
  win:      new Audio(`${BASE}win.mp3`),
  winEpic:  new Audio(`${BASE}win_epic.mp3`),  // NEW
  uiClick:  new Audio(`${BASE}ui_click.mp3`),
  scatter:  new Audio(`${BASE}scatter.mp3`),
}

sounds.winEpic.volume = 0.95
```

Update `playWin` to use `winEpic` for 20×+ wins:
```typescript
export function playWin(multiplier: number): void {
  if (muted || multiplier <= 0) return

  if (multiplier >= 50) {
    // Epic — winEpic sound
    sounds.winEpic.currentTime = 0
    sounds.winEpic.play().catch(() => {})
  } else if (multiplier >= 20) {
    // Mega — winEpic at slightly lower volume
    const megaClone = sounds.winEpic.cloneNode() as HTMLAudioElement
    megaClone.volume = 0.8
    megaClone.play().catch(() => {})
  } else if (multiplier >= 10) {
    sounds.scatter.currentTime = 0
    sounds.scatter.play().catch(() => {})
  } else if (multiplier >= 2) {
    sounds.win.currentTime = 0
    sounds.win.play().catch(() => {})
  } else {
    const softWin = sounds.win.cloneNode() as HTMLAudioElement
    softWin.volume = 0.4
    softWin.play().catch(() => {})
  }
}
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(audio): wire win_epic.mp3 for mega/epic win tiers"
git push origin main
```

---

## TASK 3 — Restore win multiplier display on WinDisplay

The win multiplier (e.g. "5.6×") used to show below the win amount
and was removed. Restore it.

In `src/lib/components/WinDisplay.svelte`, read the current template.
Find where the win amount is displayed. Add the multiplier below it:

```svelte
{#if $winMultiplier > 0}
  <div class="win-panel" class:win-idle={$winMultiplier === 0} ...>
    <span class="win-label">WIN</span>
    <span class="win-amount">
      {formatBalance($winAmount * CURRENCY_SCALE)}
    </span>
    <span class="win-multiplier">{$winMultiplier.toFixed(1)}×</span>
  </div>
{/if}
```

Add CSS for the multiplier:
```css
.win-multiplier {
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: rgba(255, 215, 0, 0.85);
  letter-spacing: 0.1em;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  margin-top: 1px;
  display: block;
}
```

Check that `winMultiplier` is imported from gameStore. If it is already
there but not displaying, find why and fix.

The multiplier should be visible whenever there is a win, and hidden
(or showing 0) during dead spins.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(ui): restore win multiplier display below win amount"
git push origin main
```

---

## TASK 4 — Win line highlighting: dim non-winners, pulse winners

This is the most important gameplay mechanic upgrade. When a win occurs,
the winning symbol cells should glow/pulse, and non-winning cells should
dim. This creates clear visual communication of what won.

Read `src/lib/components/GameGrid.svelte` in full. Find the
`activeWins` store subscription and the win highlighting logic.

The current implementation likely just changes the cell background
colour. Upgrade it to do the following:

**Step 1 — Non-winning cells dim to 40% opacity:**
When `activeWins` is non-empty, for every cell that is NOT part of a
win, set its container alpha to 0.4. For cells that ARE part of a win,
keep alpha at 1.0.

**Step 2 — Winning cells get a gold pulsing border:**
For winning cells, draw or update a Graphics object that creates a
glowing gold border that pulses:

```typescript
// Inside the win highlighting update function
function _updateWinHighlights(wins: WinEvent[]): void {
  // Build a Set of winning positions: "reel,row"
  const winPositions = new Set<string>()
  for (const win of wins) {
    for (const pos of win.positions) {
      winPositions.add(`${pos.reel},${pos.row}`)
    }
  }

  // Update each cell
  for (let r = 0; r < REELS; r++) {
    for (let row = 0; row < ROWS; row++) {
      const cell = cellContainers[r][row]
      const isWinner = winPositions.has(`${r},${row}`)

      if (wins.length > 0) {
        cell.alpha = isWinner ? 1.0 : 0.35  // dim non-winners
      } else {
        cell.alpha = 1.0  // reset all on no wins
      }
    }
  }
}
```

Wire this into the existing `activeWins` store subscription. When
`$activeWins` changes, call `_updateWinHighlights($activeWins)`.

**Step 3 — Winning symbols scale up:**
For winning cells, use PIXI Ticker to animate the cell scale from 1.0
to 1.08 and back over 600ms, repeating 3 times:

```typescript
function _pulseWinCell(cell: Container, duration = 600, repeats = 3): void {
  let elapsed = 0
  let count = 0
  const ticker = new Ticker()
  ticker.add((delta) => {
    elapsed += delta * (1000 / 60)
    const t = (elapsed % duration) / duration
    const scale = 1.0 + 0.08 * Math.sin(t * Math.PI)
    cell.scale.set(scale)
    if (elapsed > duration) {
      elapsed = 0
      count++
      if (count >= repeats) {
        cell.scale.set(1.0)
        ticker.destroy()
      }
    }
  })
  ticker.start()
}
```

Call `_pulseWinCell` on each winning cell after the spin resolves.

Look at the existing win positions data structure — it may use different
field names (e.g. `reel`, `col`, `column`, `x`, `y`). Read the actual
WinEvent type from rgsService.ts to get the correct field names, then
use those. Do NOT modify rgsService.ts.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(gameplay): win highlighting — dim non-winners, pulse winners"
git push origin main
```

---

## TASK 5 — Anticipation: slow reel 5 when reels 1-4 match

This is the "near-miss" anticipation effect. When reels 1 and 2 have
landed on matching high-value symbols (H1 or H2), reel 5 should slow
down dramatically before landing, creating tension.

Read `animateSpin` in `GameGrid.svelte`. Find where each reel's scroll
speed and stop timing is set.

Add anticipation logic:

```typescript
// After reel 4 stops — check if reels 1-4 have potential win
// If they do, slow reel 5 and play a tension sound

function _checkAnticipation(board: string[][]): boolean {
  // Check if first 4 reels of row 1 (or any row) have matching symbols
  const row0 = [board[0][0], board[1][0], board[2][0], board[3][0]]
  const highValue = ['H1', 'H2', 'S']
  const hasHighMatch = highValue.some(sym =>
    row0.filter(s => s === sym || s === 'W').length >= 3
  )
  return hasHighMatch
}
```

When anticipation triggers (reels 1-4 all match), for reel 5:
- Extend the scroll duration by 800ms
- Reduce the scroll speed gradually (ease from normal to 20% speed)
- Add a subtle screen shake effect (±2px position offset, 3 cycles)
- Play `reel_stop` sound with a slight delay and reverb feel

This is a complex change. If the current `animateSpin` function uses
a fixed timing per reel, add an optional `slowFactor` parameter for
the last reel and apply it conditionally.

If implementing full anticipation is too complex given the current
architecture, implement a simpler version: just extend the last reel's
animation duration by 600ms when the first 3 reels have matching symbols.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(gameplay): reel anticipation — slow reel 5 on near-match"
git push origin main
```

---

## TASK 6 — Scatter anticipation: special glow when 2 scatters land

When 2 scatter symbols have landed (reels 1 and 2), the remaining
reels should get a special golden glow treatment indicating a potential
scatter win is coming.

In `GameGrid.svelte`, track scatter count as reels stop. After reel 2
stops, check if 2 scatters have landed on the board. If yes:

```typescript
// Apply scatter anticipation glow to remaining reel containers
function _scatterAnticipation(reelIndex: number): void {
  // Glow the remaining reels gold
  for (let r = reelIndex + 1; r < REELS; r++) {
    const container = reelContainers[r]
    // Add a golden filter overlay
    const glow = new ColorMatrixFilter()
    glow.brightness(1.15, false)
    container.filters = [glow]
    // Remove glow when that reel stops
    // (handled by clearing filters in the reel stop handler)
  }
}
```

This creates the visual tension of "will the third scatter land?"

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(gameplay): scatter anticipation glow when 2 scatters land"
git push origin main
```

---

## TASK 7 — TSC + build + status update + copy to Downloads

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0. Fix any errors autonomously.

Update ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md:

```markdown
## CURRENT STATE
R4 assets wired. Logo PNGs in header and loading screen.
win_epic.mp3 added for mega/epic wins. Win multiplier display restored.
Win highlighting upgraded — non-winners dim, winners pulse at 1.08x scale.
Reel anticipation implemented. Scatter anticipation glow added.
Production build passing, 0 TypeScript errors.
```

Copy to Downloads:
```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md
echo "Status doc copied to Downloads"
```

```bash
cd ~/math-sdk && git add -A
git commit -m "chore: R4 complete — logo, audio, win mechanics, anticipation"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════
FUTURE SPINNER — R4 + MECHANICS UPGRADE COMPLETE
═══════════════════════════════════════════════════════════

TASK 1 — R4 logos wired:                    [ done ]
TASK 2 — win_epic.mp3 wired:                [ done ]
TASK 3 — Win multiplier display restored:   [ done ]
TASK 4 — Win highlighting upgraded:         [ done ]
TASK 5 — Reel anticipation added:           [ done ]
TASK 6 — Scatter anticipation glow:         [ done ]
TASK 7 — Build passing:                     [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]
STATUS: [ copied to ~/Downloads/ ]

═══════════════════════════════════════════════════════════
