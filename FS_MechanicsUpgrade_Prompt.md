# FUTURE SPINNER — GAME MECHANICS + ANIMATION UPGRADE
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

## STEP 0 — READ ALL FILES FIRST

```bash
cat ~/math-sdk/frontend/src/lib/components/GameGrid.svelte
cat ~/math-sdk/frontend/src/lib/components/WinCelebration.svelte
cat ~/math-sdk/frontend/src/App.svelte
cd ~/math-sdk/frontend && npx tsc --noEmit 2>&1
```

Read all three files completely before making any changes.
Note the exact variable names, function names, and architecture.

---

## TASK 1 — Fix spin blur: reduce intensity, only during mid-scroll

**Problem:** The blur is too heavy (BlurFilter strength 8) making
symbols completely unreadable. Premium slots use very subtle blur
only during the fast-scroll phase, and remove it as reels slow.

In `GameGrid.svelte`, find all BlurFilter usage in the spin animation.

**Fix:**
- Reduce blur strength to maximum **3** (was 8)
- Apply blur only on the Y axis (`blurX: 0, blurY: 3`)
- Remove blur BEFORE the reel starts decelerating (not after stop)
- The final 200ms of each reel's animation should have zero blur
  so symbols are clear as they land

```typescript
// Correct blur application
const blur = new BlurFilter()
blur.blurX = 0
blur.blurY = 3        // was 8 — reduce significantly
blur.quality = 1      // lower quality = better performance

// Apply at spin start
reelContainers[r].filters = [blur]

// Remove BEFORE the deceleration phase, not after stop
// When reel is ~200ms from stopping, clear the filter:
reelContainers[r].filters = []
```

The reel animation should feel like: fast blur → gradual clearing →
clean stop. NOT: full blur right up until the frame it stops.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(animation): reduce spin blur intensity, clear before decel"
git push origin main
```

---

## TASK 2 — Fix anticipation: ONLY reel 5 (index 4) slows down

**Problem:** Currently reels 4 AND 5 both have slow anticipation.
Only the LAST reel (index 4, the 5th reel) should slow down.

In `GameGrid.svelte`, find the anticipation logic. Look for where
reels are slowed or where `playAnticipation()` is called.

The correct condition:
```typescript
// Only trigger anticipation for the LAST reel (index 4)
if (r === 4 && _checkAnticipation(board)) {
  // Apply slow reel animation to reel 4 only
  slowFactor = 3.0   // 3× slower than normal
  playAnticipation()
} else {
  slowFactor = 1.0   // normal speed
}
```

Reels 0-3 must ALWAYS stop at normal speed regardless of what symbols
they show. Only reel 4 (the 5th/rightmost reel) ever slows.

Also ensure reel 4's slow animation only triggers when reels 0-2
(the first THREE reels) have matching high-value symbols — not just
reels 0 and 1.

```typescript
function _checkAnticipation(board: string[][]): boolean {
  // Check if reels 0, 1, AND 2 have matching high-value symbols in any row
  for (let row = 0; row < ROWS; row++) {
    const s0 = board[0]?.[row]
    const s1 = board[1]?.[row]
    const s2 = board[2]?.[row]
    const highValue = ['H1', 'H2', 'S']
    const isWild = (s: string) => s === 'W'
    const matches = (a: string, b: string) =>
      a === b || isWild(a) || isWild(b)
    if (
      highValue.includes(s0) &&
      matches(s0, s1) &&
      matches(s0, s2)
    ) return true
  }
  return false
}
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(animation): anticipation on reel 5 only, requires 3-reel match"
git push origin main
```

---

## TASK 3 — Win line connector: draw lines between winning cells

**Problem:** Gold borders exist per winning cell but there's no
visual line connecting reel 1 → 2 → 3 → 4 → 5 across the win path.
Players can't easily see "this is the line that won".

In `GameGrid.svelte`, find `_applyWinHighlights` (or equivalent).
After drawing the gold border on each winning cell, add a connecting
line through the centre of each winning cell:

```typescript
function _drawWinConnector(
  wins: WinEvent[],
  board: string[][]
): void {
  if (!winHighlightLayer || wins.length === 0) return

  for (const win of wins) {
    // Collect the centre Y positions of winning cells per reel
    const points: { x: number; y: number }[] = []

    for (let r = 0; r < REELS; r++) {
      const reelSymbols = board[r] ?? []
      for (let row = 0; row < ROWS; row++) {
        const sym = reelSymbols[row]
        if (sym === win.symbol || sym === 'W') {
          // Use only the FIRST matching row per reel for the line
          // (in ways games, pick the row that forms the best visual path)
          const cx = r * STRIP_W + CELL_W / 2
          const cy = row * STRIP_H + CELL_H / 2
          points.push({ x: cx, y: cy })
          break  // one point per reel
        }
      }
    }

    if (points.length >= 2) {
      // Draw a glowing gold line connecting all winning positions
      winHighlightLayer.lineStyle(2, 0xffd700, 0.6)
      winHighlightLayer.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        winHighlightLayer.lineTo(points[i].x, points[i].y)
      }

      // Draw again slightly thicker and more transparent for glow effect
      winHighlightLayer.lineStyle(6, 0xffd700, 0.15)
      winHighlightLayer.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        winHighlightLayer.lineTo(points[i].x, points[i].y)
      }
    }
  }
}
```

Call `_drawWinConnector(wins, board)` after `_applyWinHighlights`.

The win path should be visible as a golden line threading through
the centre of each winning symbol across the grid.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(gameplay): gold win line connector across matching symbols"
git push origin main
```

---

## TASK 4 — Win multiplier banner on the grid

**Problem:** The multiplier (e.g. "5.6×") only appears in the small
win display panel. It needs a prominent banner that appears on the
grid itself immediately after the reels stop.

In `App.svelte` or create a new `WinBanner.svelte` component:

```svelte
<!-- WinBanner.svelte -->
<script lang="ts">
  import { winMultiplier } from '../stores/gameStore'
  import { isSpinning } from '../stores/gameStore'

  $: show = $winMultiplier > 0 && !$isSpinning
  $: tier = $winMultiplier >= 50 ? 'epic'
          : $winMultiplier >= 10 ? 'big'
          : $winMultiplier >= 2  ? 'medium'
          : 'small'
</script>

{#if show}
  <div class="win-banner tier-{tier}" role="status">
    <span class="win-banner-mult">{$winMultiplier.toFixed(1)}×</span>
    <span class="win-banner-label">WIN</span>
  </div>
{/if}

<style>
  .win-banner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
    text-align: center;
    pointer-events: none;
    animation: banner-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes banner-pop {
    from { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
    to   { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
  }

  .win-banner-mult {
    display: block;
    font-family: 'Courier New', monospace;
    font-weight: 900;
    font-size: clamp(2rem, 6vw, 4rem);
    letter-spacing: 0.05em;
    line-height: 1;
  }

  .win-banner-label {
    display: block;
    font-family: 'Courier New', monospace;
    font-size: clamp(0.6rem, 1.5vw, 0.9rem);
    letter-spacing: 0.4em;
    opacity: 0.8;
    margin-top: 4px;
  }

  /* Colour tiers */
  .tier-small .win-banner-mult {
    color: #ffd700;
    text-shadow: 0 0 20px rgba(255,215,0,0.7);
  }
  .tier-medium .win-banner-mult {
    color: #ffd700;
    text-shadow: 0 0 30px rgba(255,215,0,0.9), 0 0 60px rgba(255,215,0,0.4);
  }
  .tier-big .win-banner-mult {
    color: #ff00ff;
    text-shadow: 0 0 30px rgba(255,0,255,0.9), 0 0 60px rgba(255,0,255,0.5);
  }
  .tier-epic .win-banner-mult {
    color: #00ffff;
    text-shadow: 0 0 40px rgba(0,255,255,1), 0 0 80px rgba(0,255,255,0.6);
  }
</style>
```

Import and place WinBanner inside the `grid-wrapper` in App.svelte
so it appears over the game grid:

```svelte
<div class="grid-wrapper">
  <GameGrid bind:this={gridRef} />
  <img src="assets/frames/frame_clean_ornate.png" class="game-frame" ... />
  <WinBanner />
</div>
```

The banner shows the multiplier prominently centred on the grid
for 2 seconds then fades out. It auto-hides when the next spin starts.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(gameplay): win multiplier banner centred on grid"
git push origin main
```

---

## TASK 5 — Reel elastic bounce on stop

**Problem:** Reels currently just stop. Premium slots have an elastic
overshoot — the reel scrolls slightly past the target then snaps back,
giving a satisfying "thud" feel.

In `GameGrid.svelte`, in the reel stop sequence, after the main
scroll animation completes for each reel, add a brief bounce:

```typescript
// After reel r stops at target position:
// 1. Overshoot: move container 6px further in scroll direction
// 2. Bounce back: return to 0 over 80ms
// 3. Tiny second bounce: 2px, 40ms — dampened

async function _bounceReel(container: Container): Promise<void> {
  const OVERSHOOT = 8   // pixels
  const DUR1 = 80       // ms for first bounce
  const DUR2 = 40       // ms for second (smaller) bounce

  return new Promise(resolve => {
    const start = performance.now()

    const tick = () => {
      const t = (performance.now() - start) / DUR1
      if (t < 1) {
        container.y = OVERSHOOT * (1 - t)
        requestAnimationFrame(tick)
      } else {
        container.y = 0
        // Second smaller bounce
        const start2 = performance.now()
        const tick2 = () => {
          const t2 = (performance.now() - start2) / DUR2
          if (t2 < 1) {
            container.y = -2 * Math.sin(t2 * Math.PI)
            requestAnimationFrame(tick2)
          } else {
            container.y = 0
            resolve()
          }
        }
        requestAnimationFrame(tick2)
      }
    }
    requestAnimationFrame(tick)
  })
}
```

Call `_bounceReel(reelContainers[r])` after each reel stops, before
moving to the next reel's stop sequence.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(animation): elastic bounce on reel stop"
git push origin main
```

---

## TASK 6 — Autoplay pause on big wins (industry compliance)

**Problem:** Autoplay must not spin through big wins without pausing.
This is an industry standard and player protection requirement.

In `App.svelte`, find the autoplay continuation logic. Update it:

```typescript
// After each spin resolves, check multiplier before continuing autoplay
const multiplier = $betAmount > 0 ? result.totalWin / $betAmount : 0

if ($isAutoPlay && $autoPlayCount > 0) {
  let delay = 800  // default between spins

  if (multiplier >= 100) {
    // Epic win — stop autoplay entirely
    isAutoPlay.set(false)
    autoPlayCount.set(0)
    // Don't continue
  } else if (multiplier >= 30) {
    // Mega win — pause 6 seconds
    delay = 6000
    setTimeout(() => handleSpin(), delay)
  } else if (multiplier >= 10) {
    // Big win — pause 3.5 seconds
    delay = 3500
    setTimeout(() => handleSpin(), delay)
  } else if (multiplier > 0) {
    // Small/medium win — pause 1.5 seconds
    delay = 1500
    setTimeout(() => handleSpin(), delay)
  } else {
    // Dead spin — continue quickly
    delay = $isTurbo ? 300 : 800
    setTimeout(() => handleSpin(), delay)
  }
}
```

Find the actual autoplay continuation code and adapt to match its
existing structure — do not duplicate the spin call.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(gameplay): autoplay pauses on big wins — industry standard"
git push origin main
```

---

## TASK 7 — Also fix the subtitle and autoplay button from FinalPolish

Include these fixes from the earlier FS_FinalPolish_Prompt.md:

**7a — Centre WE ROLL SPINNERS beneath the logo:**
Find the subtitle image in App.svelte. Ensure it is in a `.logo-stack`
flex column container with the main logo, centred:
```css
.logo-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
```

**7b — Autoplay button image:**
Find the autoplay button in ControlBar.svelte. Ensure it has:
```svelte
<img src="/assets/ui/btn_menu.png" alt="Autoplay" draggable="false" />
```
And the AUTO label beneath it.

**7c — Reel 5 frame clipping:**
In App.svelte, ensure `.grid-wrapper` has `overflow: visible` and
the game-frame inset is symmetrical at `-70px` all sides.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(ui): subtitle centred, autoplay image, reel 5 unclipped"
git push origin main
```

---

## TASK 8 — TSC + build + status + copy to Downloads

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0. Fix any errors autonomously.

Update ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md with all changes.

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "chore: mechanics upgrade complete — blur, anticipation, win lines, banner"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════
FUTURE SPINNER — MECHANICS UPGRADE COMPLETE
═══════════════════════════════════════════════════════════════

TASK 1 — Blur reduced (max Y=3, clears before stop):   [ done ]
TASK 2 — Anticipation reel 5 only, 3-reel match:       [ done ]
TASK 3 — Gold win line connector across grid:           [ done ]
TASK 4 — Win multiplier banner on grid:                 [ done ]
TASK 5 — Elastic bounce on reel stop:                   [ done ]
TASK 6 — Autoplay pauses on big wins:                   [ done ]
TASK 7 — Subtitle, autoplay image, reel 5 clip:         [ done ]
TASK 8 — Build passing:                                 [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]
STATUS: [ copied to ~/Downloads/ ]

═══════════════════════════════════════════════════════════════
