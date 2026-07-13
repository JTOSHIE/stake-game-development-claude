# FUTURE SPINNER — ROUND 2 COMPLETE IMPLEMENTATION
## Based on FS Developer Update Brief R2
## 17 new assets + 10 code changes
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

## STEP 0 — VERIFY ALL SOURCE FILES

```bash
echo "=== SYMBOLS (10 expected) ==="
ls ~/Downloads/fs-r2/processed/symbols/ | wc -l
ls ~/Downloads/fs-r2/processed/symbols/

echo ""
echo "=== UI ASSETS (7 expected) ==="
ls ~/Downloads/fs-r2/processed/ui/ | wc -l
ls ~/Downloads/fs-r2/processed/ui/

echo ""
echo "=== SIZE CHECK (all must be > 5KB) ==="
for f in ~/Downloads/fs-r2/processed/symbols/*.png; do
  size=$(wc -c < "$f")
  name=$(basename "$f")
  echo "$name: ${size}B $([ $size -gt 5000 ] && echo '✅' || echo '❌ TOO SMALL')"
done
for f in ~/Downloads/fs-r2/processed/ui/*.png; do
  size=$(wc -c < "$f")
  name=$(basename "$f")
  echo "$name: ${size}B $([ $size -gt 5000 ] && echo '✅' || echo '❌ TOO SMALL')"
done
```

Report all findings. If any file is missing or under 5KB, STOP and report.

---

## TASK 1 — Install front-facing symbol PNG fallbacks

Replace all 10 angled idle PNGs with new front-facing versions.
Destination: `~/math-sdk/frontend/public/assets/symbols/idle-png/`
The game uses UPPERCASE filenames (H1.png etc), source uses lowercase.

```bash
SRC=~/Downloads/fs-r2/processed/symbols
DST=~/math-sdk/frontend/public/assets/symbols/idle-png

cp "$SRC/h1_rim_idle.png"      $DST/H1.png
cp "$SRC/h2_turbo_idle.png"    $DST/H2.png
cp "$SRC/m1_grille_idle.png"   $DST/M1.png
cp "$SRC/m2_exhaust_idle.png"  $DST/M2.png
cp "$SRC/m3_wheel_idle.png"    $DST/M3.png
cp "$SRC/l1_lugnut_idle.png"   $DST/L1.png
cp "$SRC/l2_sparkplug_idle.png" $DST/L2.png
cp "$SRC/l3_piston_idle.png"   $DST/L3.png
cp "$SRC/wild_idle.png"        $DST/W.png
cp "$SRC/scatter_idle.png"     $DST/S.png

echo "=== VERIFY SYMBOLS ==="
for sym in H1 H2 M1 M2 M3 L1 L2 L3 W S; do
  size=$(wc -c < "$DST/${sym}.png" 2>/dev/null || echo 0)
  echo "$sym.png: ${size}B $([ $size -gt 5000 ] && echo '✅' || echo '❌')"
done
```

Commit:
```bash
cd ~/math-sdk && git add frontend/public/assets/symbols/idle-png/
git commit -m "feat(symbols): front-facing idle PNGs — replace angled versions"
git push origin main
```

---

## TASK 2 — Install new UI assets

```bash
SRC=~/Downloads/fs-r2/processed/ui
FS_UI=~/math-sdk/frontend/public/assets/themes/future-spinner/ui
GLOBAL_UI=~/math-sdk/frontend/public/assets/ui

mkdir -p $GLOBAL_UI

# Future Spinner theme UI replacements
cp "$SRC/balance_panel_v2.png" $FS_UI/panel_balance.png
cp "$SRC/win_panel_v2.png"     $FS_UI/panel_win.png
cp "$SRC/max_bet_btn.png"      $FS_UI/btn_max.png

# Global UI (not theme-specific)
cp "$SRC/big_win_banner.png"    $GLOBAL_UI/big_win_banner.png
cp "$SRC/bet_display.png"       $GLOBAL_UI/bet_display.png
cp "$SRC/win_pod_v2_idle.png"   $GLOBAL_UI/win_pod_v2_idle.png
cp "$SRC/win_pod_v2_active.png" $GLOBAL_UI/win_pod_v2_active.png

echo "=== VERIFY UI ASSETS ==="
for f in panel_balance.png panel_win.png btn_max.png; do
  size=$(wc -c < "$FS_UI/$f" 2>/dev/null || echo 0)
  echo "$f: ${size}B $([ $size -gt 5000 ] && echo '✅' || echo '❌')"
done
for f in big_win_banner.png bet_display.png win_pod_v2_idle.png win_pod_v2_active.png; do
  size=$(wc -c < "$GLOBAL_UI/$f" 2>/dev/null || echo 0)
  echo "$f: ${size}B $([ $size -gt 5000 ] && echo '✅' || echo '❌')"
done
```

Commit:
```bash
cd ~/math-sdk && git add frontend/public/assets/
git commit -m "feat(assets): R2 UI assets installed — panels v2, win pod v2, banner, max bet"
git push origin main
```

---

## TASK 3 — Add Orbitron font to app

In App.svelte, find the `<svelte:head>` block. Add the Orbitron font link:

```svelte
<svelte:head>
  <title>{$activeTheme.name} — We Roll Spinners</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>
```

Commit:
```bash
cd ~/math-sdk && git add frontend/src/App.svelte
git commit -m "feat(font): add Orbitron from Google Fonts for LED number displays"
git push origin main
```

---

## TASK 4 — Fix video background crossfade (eliminate loop jump)

Read App.svelte. Find the current background video section
(`{#if $activeTheme.id === 'future-spinner'}`).

Replace the single video element with a dual-video crossfade system:

```svelte
{#if $activeTheme.id === 'future-spinner'}
  <!-- Dual video crossfade — eliminates the visible loop restart jump -->
  <div class="bg-video-container">
    <video
      bind:this={bgVideo1}
      class="bg-video"
      class:active={bgVideo1Active}
      autoplay
      loop
      muted
      playsinline
      aria-hidden="true"
    >
      <source src="assets/videos/bg_animated_loop.mp4" type="video/mp4" />
    </video>
    <video
      bind:this={bgVideo2}
      class="bg-video"
      class:active={!bgVideo1Active}
      autoplay
      loop
      muted
      playsinline
      aria-hidden="true"
    >
      <source src="assets/videos/bg_animated_loop.mp4" type="video/mp4" />
    </video>
  </div>
{:else}
  <img class="bg-media" src="{$themeAssets.background}" alt="" aria-hidden="true" />
{/if}
```

Add these variables to the `<script>` section:
```typescript
let bgVideo1: HTMLVideoElement
let bgVideo2: HTMLVideoElement
let bgVideo1Active = true
let crossfadeInterval: ReturnType<typeof setInterval> | null = null
```

In `onMount`, add after existing mount code:
```typescript
// Crossfade logic — offset video2 by half duration to eliminate loop jump
if (bgVideo1 && bgVideo2) {
  bgVideo1.addEventListener('loadedmetadata', () => {
    const half = bgVideo1.duration / 2
    bgVideo2.currentTime = half

    crossfadeInterval = setInterval(() => {
      const v1 = bgVideo1
      const v2 = bgVideo2
      if (!v1 || !v2) return

      if (bgVideo1Active && v1.duration > 0 && v1.currentTime > v1.duration - 1.5) {
        bgVideo1Active = false
      } else if (!bgVideo1Active && v2.duration > 0 && v2.currentTime > v2.duration - 1.5) {
        bgVideo1Active = true
      }
    }, 100)
  }, { once: true })
}
```

In `onDestroy`, add:
```typescript
if (crossfadeInterval) clearInterval(crossfadeInterval)
```

Add CSS:
```css
.bg-video-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bg-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1.5s ease;
  pointer-events: none;
}

.bg-video.active {
  opacity: 0.85;
}
```

Remove the old `.bg-media` video CSS if it conflicts.
Remove the old 2-second fallback timer code (we now have a cleaner setup).
Keep the static fallback img for non-future-spinner themes.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/App.svelte
git commit -m "fix(bg): dual video crossfade eliminates loop restart jump"
git push origin main
```

---

## TASK 5 — Fix frame vertical position

Read App.svelte. Find the `.game-area` or `.grid-wrapper` or `.reel-frame-container`
CSS — whatever positions the game grid vertically on screen.

The frame is sitting too high. Centre it between logo and control bar:

Find the CSS class that controls vertical position of the game grid area.
Replace any fixed `top:` or `margin-top:` values with:

```css
.game-area {   /* or whatever the class is called */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, calc(-50% + 20px));
  /* The +20px accounts for the logo above — adjust in 4px increments if needed */
}
```

Also update the `.game-frame` translateY to 0 if it was previously
offset (the brief says centring via top:50% should be the fix, not translateY):

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
  transform: none;   /* Remove any previous translateY hack */
}
```

Commit:
```bash
cd ~/math-sdk && git add frontend/src/App.svelte
git commit -m "fix(layout): centre game frame vertically between logo and control bar"
git push origin main
```

---

## TASK 6 — Rewrite WinPod.svelte for v2 assets

Replace the entire contents of `src/lib/components/WinPod.svelte`:

```svelte
<script lang="ts">
  /**
   * WinPod.svelte — Side multiplier/win display (v2)
   * Positioned flush against right outer edge of reel frame.
   * Two LED zones: upper = multiplier, lower = win amount.
   * Uses Orbitron font for premium digital readout appearance.
   */
  import { winMultiplier, winAmount, isSpinning } from '../stores/gameStore'

  $: isActive = $winAmount > 0 && !$isSpinning
  $: multiplierText = $winMultiplier > 0 ? `${$winMultiplier.toFixed(1)}×` : ''
  $: amountText = $winAmount > 0
    ? `${($winAmount / 1_000_000).toFixed(2)}`
    : ''
</script>

<div class="win-pod" class:active={isActive}>
  <!-- Background image switches based on win state -->
  <img
    class="pod-bg"
    src={isActive ? 'assets/ui/win_pod_v2_active.png' : 'assets/ui/win_pod_v2_idle.png'}
    alt=""
    draggable="false"
    aria-hidden="true"
  />

  {#if isActive}
    <!-- Upper LED zone — multiplier value -->
    <div class="multiplier-value">{multiplierText}</div>
    <!-- Lower LED zone — win amount -->
    <div class="win-value">{amountText}</div>
  {/if}
</div>

<style>
  .win-pod {
    position: absolute;
    right: -220px;
    top: 50%;
    transform: translateY(-50%);
    width: 200px;
    height: 320px;
    z-index: 50;
    pointer-events: none;
  }

  .pod-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  /* Upper LED zone — multiplier */
  .multiplier-value {
    position: absolute;
    top: 28%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 2rem;
    font-weight: 900;
    color: #FFD700;
    text-shadow: 0 0 10px #FFD700, 0 0 20px #FFD700;
    letter-spacing: 2px;
    white-space: nowrap;
  }

  /* Lower LED zone — win amount */
  .win-value {
    position: absolute;
    top: 75%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1.4rem;
    font-weight: 900;
    color: #FF00FF;
    text-shadow: 0 0 10px #FF00FF, 0 0 20px #FF00FF;
    letter-spacing: 2px;
    white-space: nowrap;
  }

  /* Active state glow */
  .win-pod.active .pod-bg {
    animation: podGlow 1.5s ease-in-out infinite;
  }

  @keyframes podGlow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.15); }
  }
</style>
```

Check what store values are available:
```bash
grep -n "export.*winAmount\|export.*winMultiplier\|export.*lastWin\|export.*currentWin" \
  ~/math-sdk/frontend/src/lib/stores/gameStore.ts | head -10
```

Adapt the store imports to match what gameStore.ts actually exports.
If `winAmount` is in micros, divide by 1_000_000 for display.
If it's already in dollars, remove the division.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/WinPod.svelte
git commit -m "feat(win-pod): v2 assets, dual LED zones, Orbitron font"
git push origin main
```

---

## TASK 7 — Replace fullscreen win overlay with compact top banner

### 7a — Create WinBanner.svelte (NEW FILE)

```svelte
<script lang="ts">
  /**
   * WinBanner.svelte — Compact Big Win banner
   * Sits at top of viewport above reel frame. Reels remain 100% visible.
   * Appears on big/mega/epic wins. Auto-dismisses after 4 seconds.
   * Uses big_win_banner.png (800x200) as background.
   */
  import { onDestroy } from 'svelte'
  import { winMultiplier, winAmount, isSpinning } from '../stores/gameStore'

  const BIG_WIN_THRESHOLD = 10   // multiplier × bet to trigger banner

  let visible = false
  let displayAmount = 0
  let dismissTimer: ReturnType<typeof setTimeout> | null = null
  let countUpFrame: number | null = null

  $: if ($winMultiplier >= BIG_WIN_THRESHOLD && !$isSpinning) {
    showBanner($winAmount)
  }

  function showBanner(targetMicros: number): void {
    if (dismissTimer) clearTimeout(dismissTimer)
    if (countUpFrame) cancelAnimationFrame(countUpFrame)

    const targetDollars = targetMicros / 1_000_000
    displayAmount = 0
    visible = true

    // Count up animation over 2 seconds
    const startTime = performance.now()
    const duration = 2000

    function countUp(): void {
      const elapsed = Math.min(performance.now() - startTime, duration)
      const progress = elapsed / duration
      // Ease-out so counting slows near the end
      displayAmount = targetDollars * (1 - Math.pow(1 - progress, 3))
      if (progress < 1) {
        countUpFrame = requestAnimationFrame(countUp)
      } else {
        displayAmount = targetDollars
      }
    }
    countUpFrame = requestAnimationFrame(countUp)

    // Auto-dismiss after 4 seconds
    dismissTimer = setTimeout(() => {
      visible = false
      displayAmount = 0
    }, 4000)
  }

  onDestroy(() => {
    if (dismissTimer) clearTimeout(dismissTimer)
    if (countUpFrame) cancelAnimationFrame(countUpFrame)
  })
</script>

{#if visible}
  <div class="big-win-banner" class:active={visible}>
    <img
      class="banner-bg"
      src="assets/ui/big_win_banner.png"
      alt="Big Win"
      draggable="false"
    />
    <div class="win-amount">
      USD {displayAmount.toFixed(2)}
    </div>
  </div>
{/if}

<style>
  .big-win-banner {
    position: absolute;
    top: -120px;          /* above the reel frame */
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 200px;
    z-index: 100;
    pointer-events: none;
  }

  .banner-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    opacity: 0;
    transition: opacity 0.3s ease-in;
  }

  .big-win-banner.active .banner-bg {
    opacity: 1;
    animation: bannerPulse 2s ease-in-out infinite;
  }

  @keyframes bannerPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }

  /* Win amount in the LED readout zone at banner bottom */
  .win-amount {
    position: absolute;
    bottom: 18%;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 2rem;
    font-weight: 900;
    color: #00FFFF;
    text-shadow: 0 0 15px #00FFFF, 0 0 30px #00FFFF;
    letter-spacing: 4px;
    white-space: nowrap;
  }
</style>
```

### 7b — Remove WinCelebration fullscreen overlay

Read `src/lib/components/WinCelebration.svelte`.

Find the fullscreen overlay (position: fixed, inset: 0, z-index: 500 or similar).
The big/mega/epic win overlays that block the entire screen must be removed.

Replace the component so it only handles the SMALL win flash
(brief text like "WIN!" that appears briefly, not fullscreen):

Keep: the small win flash (1-2 seconds, brief text above grid)
Remove: the full overlay with dark background, particles, dismiss button

If WinCelebration.svelte is purely the fullscreen overlay, replace it
with a minimal stub that does nothing (the WinBanner handles big wins now):

```svelte
<script lang="ts">
  // WinCelebration simplified — fullscreen modal removed per R2 brief
  // Big wins now handled by WinBanner.svelte (compact top banner)
  // Small wins shown in WinDisplay panel
</script>
<!-- No output — component kept for import compatibility -->
```

### 7c — Wire WinBanner into App.svelte

In App.svelte, add import:
```typescript
import WinBanner from '$lib/components/WinBanner.svelte'
```

Add `<WinBanner />` inside the `.grid-wrapper` div, above GameGrid:
```svelte
<div class="grid-wrapper">
  <WinBanner />
  <GameGrid bind:this={gameGrid} />
  <WinPod />
</div>
```

Confirm `<!-- <WinBanner /> -->` (the old one that was commented out) is
removed entirely — not just commented, deleted.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/WinBanner.svelte \
  frontend/src/lib/components/WinCelebration.svelte \
  frontend/src/App.svelte
git commit -m "feat(win): compact top banner replaces fullscreen modal — reels stay visible"
git push origin main
```

---

## TASK 8 — Redesign bottom control bar

This is the most significant change. Read ControlBar.svelte completely first.

```bash
wc -l ~/math-sdk/frontend/src/lib/components/ControlBar.svelte
cat ~/math-sdk/frontend/src/lib/components/ControlBar.svelte
```

New layout (left to right):
```
[BALANCE PANEL] — [BET−] [BET DISPLAY] [BET+] — [MAX BET] — [SPIN] — [WIN PANEL]
```

### 8a — Update BalanceDisplay.svelte

Replace background image and add Orbitron number styling:

```svelte
<div
  class="balance-panel"
  style="background-image: url('{$themeAssets.panelBalance}'); background-size: 100% 100%;"
>
  <div class="field">
    <div class="led-label">{t($locale, 'balance')}</div>
    <div class="led-value cyan">USD {($balance / 1_000_000).toFixed(2)}</div>
  </div>
  <div class="divider"></div>
  <div class="field">
    <div class="led-label">{t($locale, 'bet')}</div>
    <div class="led-value gold">USD {($wagerMicros / 1_000_000).toFixed(2)}</div>
  </div>
</div>
```

CSS:
```css
.balance-panel {
  min-width: 280px;
  height: 90px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-color: transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 0 1.2rem;
  gap: 0.8rem;
}

.led-label {
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  display: block;
}

.led-value {
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 2px;
  display: block;
}

.led-value.cyan {
  color: #00FFFF;
  text-shadow: 0 0 8px #00FFFF;
}

.led-value.gold {
  color: #FFD700;
  text-shadow: 0 0 8px #FFD700;
}
```

### 8b — Update WinDisplay.svelte

```css
.led-value.magenta {
  color: #FF00FF;
  text-shadow: 0 0 8px #FF00FF;
}
```

Apply `font-family: 'Orbitron'` to win amount text.
Apply `color: #FF00FF` with matching text-shadow.

### 8c — Update ControlBar.svelte

Add the bet display panel and max bet button.
The bet display uses `assets/ui/bet_display.png` as background.
The max bet button uses `assets/themes/future-spinner/ui/btn_max.png`.

Find where the bet amount is displayed. Wrap it with the bet_display background:

```svelte
<!-- Bet display with premium panel background -->
<div
  class="bet-display-panel"
  style="background-image: url('assets/ui/bet_display.png'); background-size: 100% 100%;"
>
  <span class="led-value gold">USD {($wagerMicros / 1_000_000).toFixed(2)}</span>
</div>
```

Add the MAX BET button if it doesn't exist or update existing:
```svelte
<button
  class="max-btn themed-btn"
  on:click={setMaxBet}
  disabled={$isSpinning}
  aria-label="Max bet"
>
  <img src="assets/themes/future-spinner/ui/btn_max.png" alt="MAX" draggable="false" />
</button>
```

CSS for bet display panel:
```css
.bet-display-panel {
  min-width: 180px;
  height: 70px;
  background-repeat: no-repeat;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
}

.led-value.gold {
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  color: #FFD700;
  text-shadow: 0 0 8px #FFD700;
  letter-spacing: 2px;
}
```

Commit:
```bash
cd ~/math-sdk && git add \
  frontend/src/lib/components/ControlBar.svelte \
  frontend/src/lib/components/BalanceDisplay.svelte \
  frontend/src/lib/components/WinDisplay.svelte
git commit -m "feat(controls): Orbitron LED numbers, bet display panel, max bet button"
git push origin main
```

---

## TASK 9 — Enforce z-index stack and DOM cleanup

In App.svelte, audit and enforce these z-index values:

```css
/* Z-INDEX STACK — enforce these exactly */
.bg-video-container { z-index: -1; }    /* Background video */
.grid-wrapper        { z-index: 10; }   /* Reel frame + symbols */
.win-pod             { z-index: 50; }   /* Side win pod */
.control-bar         { z-index: 60; }   /* Bottom controls */
.game-logo           { z-index: 70; }   /* Logo / title */
.big-win-banner      { z-index: 100; }  /* Big win banner */
```

DOM cleanup — search for and physically delete (not hide):
```bash
# Check for any remaining old background image references
grep -n "bg1_main\|CYBER\|cyber.*slot\|background-image.*url.*symbol" \
  ~/math-sdk/frontend/src/App.svelte

# Check for any display:none or visibility:hidden on old elements
grep -n "display.*none\|visibility.*hidden" \
  ~/math-sdk/frontend/src/App.svelte \
  ~/math-sdk/frontend/src/lib/components/ControlBar.svelte
```

Remove any found. Old elements must not exist in the DOM.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(dom): enforce z-index stack, remove old hidden elements"
git push origin main
```

---

## TASK 10 — TSC + Build

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Fix ALL TypeScript errors. Common issues:
- WinBanner store names — adapt to what gameStore actually exports
- `winAmount` may be `lastWinMicros` in gameStore — check:
  ```bash
  grep -n "export\|writable\|derived" ~/math-sdk/frontend/src/lib/stores/gameStore.ts | head -20
  ```
- `crossfadeInterval` type in App.svelte

---

## TASK 11 — Generate Developer Handover Spec Document

After build passes, generate the master spec document:

```bash
cat > ~/Downloads/WRS_GameTemplate_Spec_v1.0.md << 'SPEC'
# WRS Game Template — Master Developer Specification
## Version: 1.0 | Generated: $(date)
## Studio: We Roll Spinners | Platform: Stake Engine (Carrot RGS)

---

## PURPOSE

This document is the definitive reference for building any new slot game
on the WRS platform. Every asset name, dimension, CSS rule, component
and theming requirement is specified here. Give this to any designer or
developer to replicate the Future Spinner structure for a new game.

---

## DIRECTORY STRUCTURE

\`\`\`
frontend/public/assets/
├── themes/
│   └── [theme-id]/           ← One folder per theme
│       ├── symbols/           ← 10 PNGs: h1-l3, wild, scatter
│       ├── backgrounds/       ← bg-1.jpg, bg-2.jpg, bg-3.jpg
│       ├── frames/            ← frame-1.png (ornate), frame-2.png (minimal)
│       ├── ui/                ← All themed buttons and panels
│       └── sounds/            ← bgm_loop.mp3 + SFX
├── symbols/
│   ├── idle/                  ← MP4 idle loops: H1_idle.mp4 ... S_idle.mp4
│   ├── win/                   ← MP4 win bursts: H1_win.mp4 ... S_win.mp4
│   ├── idle-png/              ← PNG fallbacks: H1.png ... S.png
│   └── win-png/               ← PNG fallbacks: H1.png ... S.png
├── videos/
│   └── bg_animated_loop.mp4  ← Main background video (future-spinner only)
└── ui/                        ← Global UI (not theme-specific)
    ├── big_win_banner.png     800×200px RGBA
    ├── bet_display.png        240×70px  RGBA
    ├── win_pod_v2_idle.png    200×320px RGBA
    └── win_pod_v2_active.png  200×320px RGBA
\`\`\`

---

## THEME ASSET SPECIFICATIONS

### Per-Theme UI Files (in themes/[theme-id]/ui/)

| File | Dimensions | Purpose | Colours |
|------|-----------|---------|---------|
| logo.png | 600×150px RGBA | Game title at top | Theme primary |
| spin_button.png | 200×200px RGBA | Main spin action | Theme primary |
| panel_balance.png | 340×90px RGBA | Balance/bet display | Theme palette |
| panel_win.png | 360×100px RGBA | Win amount display | Theme palette |
| btn_bet_minus.png | 80×80px RGBA | Decrease bet | Theme secondary |
| btn_bet_plus.png | 80×80px RGBA | Increase bet | Theme primary |
| btn_autoplay.png | 80×80px RGBA | Toggle autoplay | Theme neutral |
| btn_menu.png | 60×60px RGBA | Info/menu utility | Theme neutral |
| btn_max.png | 200×200px RGBA | Max bet action | Theme primary |
| frame-1.png | 800×640px RGBA | Ornate reel border | Theme palette |
| frame-2.png | 800×640px RGBA | Minimal reel border | Theme palette |

### Symbol Files (in themes/[theme-id]/symbols/)

| File | Dimensions | Notes |
|------|-----------|-------|
| h1.png | 256×256px RGBA | Highest value symbol |
| h2.png | 256×256px RGBA | High value symbol |
| m1.png | 256×256px RGBA | Medium value symbol |
| m2.png | 256×256px RGBA | Medium value symbol |
| m3.png | 256×256px RGBA | Medium value symbol |
| l1.png | 256×256px RGBA | Low value symbol |
| l2.png | 256×256px RGBA | Low value symbol |
| l3.png | 256×256px RGBA | Low value symbol |
| wild.png | 256×256px RGBA | Wild symbol |
| scatter.png | 256×256px RGBA | Scatter symbol |

**Symbol requirements:**
- RGBA with fully transparent background
- Object centred, no rectangular fill
- Front-facing (zero perspective angle)
- File size: 50–150KB each

### Frame Requirements (CRITICAL)

- 800×640px RGBA
- Centre area MUST be 100% transparent (alpha=0): minimum 620×460px
- Test: open on white background → centre shows white (fully clear)
- Border width: approximately 80px each side
- ornate: full decorative treatment
- minimal: clean lines only, same theme identity

---

## CODE COMPONENTS

### Svelte Component Map

| Component | Purpose | Key Props/Stores |
|-----------|---------|-----------------|
| App.svelte | Root layout, background, frame | activeTheme, themeAssets |
| GameGrid.svelte | Video symbol grid + PixiJS win lines | boardSymbols, activeWins, isSpinning |
| ControlBar.svelte | Spin, bet +/−, max, auto, utilities | wagerMicros, isSpinning, isTurbo |
| BalanceDisplay.svelte | Balance + bet amounts | balance, wagerMicros |
| WinDisplay.svelte | Win amount panel | winAmount, winMultiplier |
| WinPod.svelte | Side multiplier/amount pod | winAmount, winMultiplier |
| WinBanner.svelte | Big win compact top banner | winAmount, winMultiplier |
| WinCelebration.svelte | Particle effects (not fullscreen) | winMultiplier |
| LoadingScreen.svelte | Loading progress | assetLoadProgress |
| PaytableModal.svelte | Paytable information | — |
| ThemeSelector.svelte | Theme switching UI | activeTheme |

### Theme Store (themeStore.ts) — Asset Path Keys

| Key | Maps to |
|-----|---------|
| themeAssets.logo | ui/logo.png |
| themeAssets.spinButton | ui/spin_button.png |
| themeAssets.panelBalance | ui/panel_balance.png |
| themeAssets.panelWin | ui/panel_win.png |
| themeAssets.btnMinus | ui/btn_bet_minus.png |
| themeAssets.btnPlus | ui/btn_bet_plus.png |
| themeAssets.btnAutoplay | ui/btn_autoplay.png |
| themeAssets.btnMenu | ui/btn_menu.png |
| themeAssets.frame | frames/frame-1.png |
| themeAssets.background | backgrounds/bg-1.jpg |
| themeAssets.symbols.H1 | symbols/h1.png |
| ... | ... |
| themeAssets.symbols.S | symbols/scatter.png |

---

## NUMBER DISPLAY STANDARDS

All dynamic numbers use the Orbitron font (Google Fonts) with colour coding:

| Display | Colour | CSS |
|---------|--------|-----|
| Balance | Cyan | color: #00FFFF; text-shadow: 0 0 8px #00FFFF |
| Win amount | Magenta | color: #FF00FF; text-shadow: 0 0 8px #FF00FF |
| Bet amount | Gold | color: #FFD700; text-shadow: 0 0 8px #FFD700 |
| Multiplier | Gold | color: #FFD700; text-shadow: 0 0 10px #FFD700 |

Font: `font-family: 'Orbitron', 'Courier New', monospace; font-weight: 700; letter-spacing: 2px;`

---

## Z-INDEX STACK

| Layer | Z-Index | Element |
|-------|---------|---------|
| Background video | -1 | .bg-video-container |
| Reel frame + symbols | 10 | .grid-wrapper |
| Win Pod (side panel) | 50 | WinPod component |
| Control bar | 60 | ControlBar component |
| Logo / title | 70 | .game-logo |
| Big Win banner | 100 | WinBanner component |

---

## CURRENCY — INTEGER MICROS (MANDATORY)

All currency values stored and transmitted in micros (1/1,000,000 of currency unit):

\`\`\`typescript
const CURRENCY_SCALE = 1_000_000
const wagerMicros = Math.floor(wagerDollars * CURRENCY_SCALE)
const winMicros   = Math.floor((wagerMicros * csvPayout) / 100)
const winDollars  = winMicros / CURRENCY_SCALE  // display only
\`\`\`

NEVER multiply float dollars by multiplier directly. Always use integer micros.

---

## SYMBOL ANIMATION SYSTEM

| State | Source | Duration | Trigger |
|-------|--------|----------|---------|
| Idle | [CODE]_idle.mp4 | Loops 6-8s | Always — resting, spinning |
| Win burst | [CODE]_win.mp4 | Exactly 4.0s | Symbol is part of winning payline |

Symbol codes: H1, H2, M1, M2, M3, L1, L2, L3, W (wild), S (scatter)

Win logic:
1. Winning symbols → swap to _win.mp4, play ONCE
2. Non-winning symbols → pause idle, opacity 0.4
3. After 4.0s → all revert to _idle.mp4 loop, opacity 1.0

---

## REEL SPIN TIMING

| Reel | Stop time (normal) | Stop time (turbo) |
|------|-------------------|-------------------|
| 0 | 600ms | 300ms |
| 1 | 900ms | 450ms |
| 2 | 1200ms | 600ms |
| 3 | 1500ms | 750ms |
| 4 | last + anticipation (+600ms if triggered) | last |

All reels start simultaneously. Stop left to right. Ease-out cubic deceleration.

---

## ADDING A NEW THEME — CHECKLIST

1. Create folder: `public/assets/themes/[theme-id]/`
2. Add all files from the theme asset spec table above
3. Register in `src/lib/config/themes.ts`:
   ```typescript
   { id: '[theme-id]', name: 'Theme Name', palette: { primary: '#COLOUR', secondary: '#COLOUR', bg: '#COLOUR' } }
   ```
4. No code changes required — themeStore reads all paths dynamically
5. For video background: set `isVideo: true` in theme config

---

*Generated by Claude Code | We Roll Spinners | Stake Engine*
*This document replaces all previous asset briefs and specifications*
SPEC

echo "✅ Spec document written to ~/Downloads/WRS_GameTemplate_Spec_v1.0.md"
wc -l ~/Downloads/WRS_GameTemplate_Spec_v1.0.md
```

---

## TASK 12 — Final commit and status update

```bash
# Update project status
cat >> ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md << 'EOF'

## R2 BRIEF IMPLEMENTATION — 2026-04-11
- ✅ 10 front-facing symbol PNGs installed (idle-png/)
- ✅ 7 new UI assets installed (panels v2, win pod v2, banner, max bet)
- ✅ Orbitron font added (Google Fonts)
- ✅ Background video crossfade (dual-video, no loop jump)
- ✅ Frame vertically centred between logo and control bar
- ✅ Win Pod v2 — dual LED zones (multiplier + amount), Orbitron
- ✅ Big win compact banner (top-of-screen, reels visible)
- ✅ Fullscreen win modal removed from DOM
- ✅ Control bar: Orbitron numbers, bet display panel, max bet button
- ✅ Z-index stack enforced
- ✅ DOM cleanup — no display:none hiding of old elements
- ✅ Developer handover spec generated
EOF

cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "feat: R2 brief complete — premium UI, Orbitron, crossfade, win banner, spec doc"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
ROUND 2 BRIEF — COMPLETE
═══════════════════════════════════════════════════════════════════

TASK 1  — Front-facing symbol PNGs:             [ done ]
TASK 2  — New UI assets installed:              [ done ]
TASK 3  — Orbitron font:                        [ done ]
TASK 4  — Video crossfade (no loop jump):       [ done ]
TASK 5  — Frame vertically centred:             [ done ]
TASK 6  — Win Pod v2 (dual LED zones):          [ done ]
TASK 7  — Compact win banner (not fullscreen):  [ done ]
TASK 8  — Control bar redesign + LED numbers:   [ done ]
TASK 9  — Z-index + DOM cleanup:                [ done ]
TASK 10 — TSC + build clean:                    [ done ]
TASK 11 — Developer spec document generated:    [ done ]
TASK 12 — Status + commit:                      [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]

OUTPUT FILES IN ~/Downloads/:
  FUTURE_SPINNER_PROJECT_STATUS.md
  WRS_GameTemplate_Spec_v1.0.md    ← MASTER TEMPLATE FOR ALL FUTURE GAMES

═══════════════════════════════════════════════════════════════════
