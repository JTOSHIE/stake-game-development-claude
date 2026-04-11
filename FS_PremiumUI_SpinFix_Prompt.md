# FUTURE SPINNER — PREMIUM UI + SPIN FIX + FRAME ADJUST
## Three tasks in one session
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.

---

## CONTEXT

Three things to fix:
1. Install the new premium 3D UI assets (Manus delivery)
2. Fix reel spin animation — smooth scrolling, sequential stops,
   longest spin on reel 5 only when anticipation is active
3. Nudge frame down ~5px to close top gap without bottom overlap

---

## STEP 0 — VERIFY PREMIUM UI ZIP IS IN DOWNLOADS

```bash
ls ~/Downloads/ | grep -i "premium\|ui.*v1\|FS_UI\|future.*ui\|3d"
find ~/Downloads -name "spin_btn.png" 2>/dev/null | head -3
find ~/Downloads -name "win_pod*.png" 2>/dev/null | head -3
```

Report what is found. If the ZIP is not yet extracted, check for it:
```bash
ls ~/Downloads/*.zip | grep -i "premium\|ui\|FS"
```

If ZIP found but not extracted:
```bash
unzip ~/Downloads/[ZIPNAME].zip -d ~/Downloads/fs-premium-ui/
```

If already extracted, note the path and continue.

---

## TASK 1 — Install Premium 3D UI Assets

Assets to install (confirmed from QC report):
- spin_btn.png       200×200px — replaces all themes' spin_button.png
- bet_plus.png       200×200px — gold, signals increase
- bet_minus.png      200×200px — magenta, signals decrease
- autoplay_btn.png   200×200px — cyan utility
- info_btn.png       200×200px — cyan utility
- menu_btn.png       200×200px — cyan utility
- balance_panel.png  340×90px  — gunmetal/carbon, cyan LED
- win_panel.png      340×90px  — magenta neon trim
- win_pod_idle.png   200×320px — dark glass, non-intrusive
- win_pod_active.png 200×320px — gold/cyan eruption for win state

```bash
# Adjust SRC path based on Step 0 findings
SRC=~/Downloads/fs-premium-ui
DST=~/math-sdk/frontend/public/assets/themes/future-spinner/ui

# Verify source files exist and are real size
echo "=== CHECKING SOURCE FILES ==="
for f in spin_btn bet_plus bet_minus autoplay_btn info_btn menu_btn \
          balance_panel win_panel win_pod_idle win_pod_active; do
  size=$(wc -c < "$SRC/${f}.png" 2>/dev/null || echo 0)
  echo "$f.png: ${size} bytes $([ $size -gt 10000 ] && echo '✅' || echo '❌ TOO SMALL')"
done

# Install to future-spinner theme
cp "$SRC/spin_btn.png"       $DST/spin_button.png
cp "$SRC/bet_plus.png"       $DST/btn_bet_plus.png
cp "$SRC/bet_minus.png"      $DST/btn_bet_minus.png
cp "$SRC/autoplay_btn.png"   $DST/btn_autoplay.png
cp "$SRC/info_btn.png"       $DST/btn_menu.png
cp "$SRC/menu_btn.png"       $DST/btn_menu.png
cp "$SRC/balance_panel.png"  $DST/panel_balance.png
cp "$SRC/win_panel.png"      $DST/panel_win.png

# Win pod goes to a separate public location (not in theme/ui — it's a new component)
mkdir -p ~/math-sdk/frontend/public/assets/ui
cp "$SRC/win_pod_idle.png"   ~/math-sdk/frontend/public/assets/ui/win_pod_idle.png
cp "$SRC/win_pod_active.png" ~/math-sdk/frontend/public/assets/ui/win_pod_active.png

echo "=== VERIFY INSTALLED ==="
for f in spin_button panel_balance panel_win btn_bet_plus btn_bet_minus \
          btn_autoplay btn_menu; do
  size=$(wc -c < "$DST/${f}.png" 2>/dev/null || echo 0)
  echo "$f.png: ${size} bytes $([ $size -gt 10000 ] && echo '✅' || echo '❌')"
done
```

### Update WinDisplay.svelte — update panel dimensions for new 340×90 panels

The new win_panel.png is 340×90px (previously 360×100px from Round 3).
In WinDisplay.svelte, update the panel min-width:

```bash
grep -n "min-width\|height.*56\|height.*auto" \
  ~/math-sdk/frontend/src/lib/components/WinDisplay.svelte
```

Update to match new panel:
```css
.win-panel {
  min-width: 260px;   /* slightly narrower than 340px to allow for padding */
  height: auto;
  padding: 0 1.2rem;
}
```

### Add the Side Win Pod component

Create `~/math-sdk/frontend/src/lib/components/WinPod.svelte`:

```svelte
<script lang="ts">
  /**
   * WinPod.svelte — Side win multiplier display
   * Replaces the centre-grid WinBanner overlay.
   * Positioned flush against right edge of frame at vertical centre.
   * win_pod_active.png erupts on win; multiplier text overlaid via CSS.
   */
  import { winMultiplier, winAmount, isSpinning } from '../stores/gameStore'

  // Show active state when there is a win and not spinning
  $: isActive = $winAmount > 0 && !$isSpinning
  $: multiplierText = $winMultiplier > 0
    ? `${$winMultiplier.toFixed(1)}×`
    : ''
</script>

<div class="win-pod" class:active={isActive}>
  <img
    class="pod-img"
    src={isActive
      ? 'assets/ui/win_pod_active.png'
      : 'assets/ui/win_pod_idle.png'}
    alt={isActive ? `Win ${multiplierText}` : ''}
    draggable="false"
  />
  {#if isActive && multiplierText}
    <div class="multiplier-overlay">
      {multiplierText}
    </div>
  {/if}
</div>

<style>
  .win-pod {
    position: absolute;
    right: -110px;        /* flush against right outer edge of frame */
    top: 50%;
    transform: translateY(-50%);
    width: 100px;
    height: 160px;
    z-index: 15;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .pod-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  /* Multiplier text overlaid on win_pod_active.png */
  .multiplier-overlay {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Courier New', monospace;
    font-size: 1.6rem;
    font-weight: 900;
    color: #FFD700;
    text-shadow:
      0 0 20px #FFD700,
      0 0 40px rgba(255, 215, 0, 0.6);
    white-space: nowrap;
    letter-spacing: -0.02em;
  }
</style>
```

### Wire WinPod into App.svelte

In App.svelte:

1. Add import at top of script:
```svelte
import WinPod from '$lib/components/WinPod.svelte'
```

2. In the template, add `<WinPod />` inside the `.grid-wrapper` div
   (alongside the game grid, so it positions relative to the frame):
```svelte
<div class="grid-wrapper">
  <GameGrid bind:this={gameGrid} />
  <WinPod />   <!-- positioned right: -110px from grid-wrapper -->
  <!-- WinBanner disabled — win pod handles multiplier display -->
  <!-- <WinBanner /> -->
</div>
```

Make sure `.grid-wrapper` has `position: relative` and `overflow: visible`
so the WinPod can extend outside the grid boundary.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(ui): premium 3D UI assets installed, WinPod component added"
git push origin main
```

---

## TASK 2 — Fix reel spin animation

### Current problem:
The spin looks jagged — symbols are scrolling with a sudden stop
rather than smooth deceleration. The current `_spinReel` in
GameGrid.svelte uses `progress = elapsed / duration` which is linear
and abrupt.

### What a smooth slot reel looks like:
- All reels START spinning simultaneously
- Reels STOP sequentially left to right (reel 0 first, reel 4 last)
- Each reel scrolls smoothly then decelerates into its landing position
- No jagged jumps — the motion feels continuous and fluid
- Reel 5 (index 4) is ALWAYS the last and has the longest spin
- If anticipation is active (potential 5-of-a-kind), reel 5 spins
  an extra 600ms with a build-up effect before landing

### What to change in GameGrid.svelte:

**Read the current `_spinReel` and `animateSpin` functions:**
```bash
grep -n "_spinReel\|animateSpin\|duration\|progress\|elapsed\|tick\|blur" \
  ~/math-sdk/frontend/src/lib/components/GameGrid.svelte | head -40
```

**Replace the linear progress with an easing function:**

The `_spinReel` function currently does:
```typescript
const progress = Math.min(elapsed / duration, 1)
```

This creates a linear stop — no deceleration. Replace with an
ease-out cubic function so the reel decelerates smoothly:

```typescript
// Ease-out cubic — fast start, smooth deceleration into landing
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

// In _spinReel tick():
const rawProgress = Math.min(elapsed / duration, 1)
const progress = easeOutCubic(rawProgress)
```

**Apply CSS scroll animation for the visual blur effect:**

During the spin, the column should appear to scroll (symbols blurring
past). Since we're using CSS video cells, add a CSS animation to the
column wrapper during spin to simulate scrolling:

```typescript
function _startSpinAnimation(colIndex: number): void {
  const col = colRefs[colIndex]
  if (!col) return
  col.classList.add('spinning')
}

function _stopSpinAnimation(colIndex: number): void {
  const col = colRefs[colIndex]
  if (!col) return
  col.classList.remove('spinning')
}
```

Add CSS to GameGrid.svelte `<style>`:
```css
/* Smooth reel spin animation */
.symbol-col.spinning {
  filter: blur(4px) brightness(0.7);
  animation: reel-scroll 0.12s linear infinite;
}

@keyframes reel-scroll {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-8px); }
}

/* Deceleration — remove spinning class and bounce into place */
.symbol-col {
  transition: filter 0.15s ease-out;
}
```

**Update `animateSpin` to start all reels simultaneously:**

```typescript
export async function animateSpin(finalBoard: string[][]): Promise<void> {
  if (!assetsReady) return

  winHighlightLayer?.clear()
  _resetToIdle()

  isSpinning.set(true)
  playSpinStart()

  const isT = get(isTurbo)

  // START all reels spinning at once (visual blur, scroll animation)
  for (let r = 0; r < REELS; r++) {
    _blurCol(r)
    _startSpinAnimation(r)
  }

  // STOP reels sequentially — left to right with staggered timing
  // Reel 0 stops first (shortest), reel 4 stops last (longest)
  // Base durations: 600, 900, 1200, 1500ms — turbo: half these
  const BASE_STOPS = [600, 900, 1200, 1500]

  // Stop reels 0–3 sequentially
  for (let r = 0; r < 4; r++) {
    const dur = isT ? BASE_STOPS[r] / 2 : BASE_STOPS[r]
    await new Promise<void>(resolve => setTimeout(resolve, dur))
    _stopSpinAnimation(r)
    _clearColBlur(r)

    // Land this reel's symbols
    const reel = finalBoard[r] ?? []
    for (let row = 0; row < ROWS; row++) {
      const sym = (reel[row] ?? 'L3').toUpperCase()
      const vid = videoRefs[r][row]
      if (vid) {
        vid.setAttribute('data-symbol', sym)
        vid.src = getIdleSrc(sym)
        vid.loop = true
        vid.load()
        vid.play().catch(() => {})
        vid.style.opacity = '1'
      }
    }

    playReelStop(r)
    if ((finalBoard[r] ?? []).some(sym => sym === 'S')) playScatterLand()
    await _bounceCol(r)

    // Check scatter anticipation after reel 1 stops
    if (r === 1) {
      const scattersLanded = [0, 1].reduce((acc, ri) =>
        acc + (finalBoard[ri] ?? []).filter(s => s === 'S').length, 0)
      if (scattersLanded >= 2) _scatterAnticipation(1)
    }
  }

  // Reel 4 (last) — check if anticipation applies
  const anticipate = !isT && _checkAnticipation(finalBoard)
  if (anticipate) {
    playAnticipation()
    // Extra 600ms with continued spin effect before landing
    await new Promise<void>(resolve => setTimeout(resolve, 600))
  }

  // Land reel 4
  _stopSpinAnimation(4)
  _clearColBlur(4)
  const reel4 = finalBoard[4] ?? []
  for (let row = 0; row < ROWS; row++) {
    const sym = (reel4[row] ?? 'L3').toUpperCase()
    const vid = videoRefs[4][row]
    if (vid) {
      vid.setAttribute('data-symbol', sym)
      vid.src = getIdleSrc(sym)
      vid.loop = true
      vid.load()
      vid.play().catch(() => {})
      vid.style.opacity = '1'
    }
  }
  playReelStop(4)
  if ((finalBoard[4] ?? []).some(sym => sym === 'S')) playScatterLand()
  await _bounceCol(4)

  isSpinning.set(false)
}
```

**Remove the old `_spinReel` function entirely** — the new `animateSpin`
handles timing directly without it. If `_spinReel` is still referenced
anywhere, remove those references.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/GameGrid.svelte
git commit -m "fix(spin): smooth reel animation — simultaneous start, sequential stops, ease-out"
git push origin main
```

---

## TASK 3 — Nudge frame down ~5px, close top gap without bottom overlap

### Current situation:
- Frame top is at -90px (extended up in last session)
- There is still a visible gap at the top between symbols and frame
- The frame bottom overlaps the panel area below the grid

### Fix:
Instead of extending the frame further up (which worsens the bottom
overlap), shift the entire frame DOWN by adjusting the CSS transform.

Read the current `.game-frame` CSS:
```bash
grep -n "game-frame\|top.*-\|bottom.*-\|transform\|translateY" \
  ~/math-sdk/frontend/src/App.svelte | head -10
```

Apply a downward shift using transform:
```css
.game-frame {
  position: absolute;
  top: -90px;
  left: -80px;
  right: -80px;
  bottom: -40px;
  width: calc(100% + 160px);
  height: calc(100% + 130px);
  object-fit: fill;
  pointer-events: none;
  z-index: 10;
  transform: translateY(8px);   /* nudge down ~8px to close top gap */
}
```

The `translateY(8px)` shifts the frame down without changing the
frame's inset values — it moves the whole frame image downward so
the top border of the frame sits closer to the top row of symbols,
while the bottom of the frame moves correspondingly away from the
panel area.

If 8px is too much or too little, adjust in 2px increments.
The goal: top of frame border touches the top row of symbols,
bottom of frame does NOT overlap the balance/bet panels.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/App.svelte
git commit -m "fix(frame): translateY(8px) nudges frame down to close top gap"
git push origin main
```

---

## TASK 4 — TSC + Build + Status

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0. Fix any TypeScript errors.

Common issue: WinPod.svelte may need `winAmount` and `winMultiplier`
exported from gameStore. Check:
```bash
grep -n "export.*winAmount\|export.*winMultiplier" \
  ~/math-sdk/frontend/src/lib/stores/gameStore.ts
```

If not exported, use `lastWinMicros` and calculate from that,
or use the existing `winAmount` store — adapt to whatever gameStore exports.

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "feat(ui): premium UI, win pod, smooth spin, frame nudge — complete"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
PREMIUM UI + SPIN + FRAME COMPLETE
═══════════════════════════════════════════════════════════════════

TASK 1 — Premium 3D UI installed:           [ done ]
  spin, bet+, bet-, autoplay, info, menu buttons
  balance + win panels (340×90)
  WinPod component created + wired

TASK 2 — Smooth reel spin animation:        [ done ]
  All reels start simultaneously
  Sequential stops L→R: 600/900/1200/1500ms
  Ease-out deceleration (cubic)
  Reel 5 longest, +600ms on anticipation
  CSS blur + scroll animation during spin

TASK 3 — Frame nudge down 8px:              [ done ]
  translateY(8px) closes top gap
  Bottom does not overlap panels

TASK 4 — TSC + build clean:                 [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]

═══════════════════════════════════════════════════════════════════
