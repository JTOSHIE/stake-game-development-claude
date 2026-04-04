# FUTURE SPINNER — CLAUDE CODE SESSION: Full Visual Polish + Submission Prep
## All remaining tasks in one continuous session
### Document version: 1.0 | Created: April 2026

---

## PRE-AUTHORISATIONS — READ FIRST, APPLY FOR THE ENTIRE SESSION

All of the following are pre-authorised for this entire session. Do not
stop or ask for confirmation on any of them at any point:

- ✅ Overwrite ANY existing file without asking
- ✅ Create ANY new file without asking
- ✅ Run `npm install` for any package without asking
- ✅ Run `git add`, `git commit`, `git push` without asking
- ✅ Fix TypeScript errors autonomously without asking
- ✅ Continue past any build warning without asking
- ✅ Run `npm run build` and `npm run dev` without asking
- ✅ Update any component, style, or content without asking
- ✅ Run `pandoc` or any conversion tool without asking
- ✅ Create directories without asking

**⚠ HARD LOCKS — never modify these under any circumstances:**
- Anything inside `~/math-sdk/games/future_spinner/` (Math SDK — LOCKED)
- `~/math-sdk/frontend/public/lookUpTable_base.csv` (READ ONLY)
- `~/math-sdk/library/publish_files/` (LOCKED)
- `rgsService.ts` — do not touch
- `gameStore.ts` — do not touch

**Currency rule — mandatory:**
```typescript
// ONLY correct method
const wagerMicros = Math.floor(wagerDollars * 1_000_000)
const winMicros   = Math.floor((wagerMicros * csvPayout) / 100)
const winDollars  = winMicros / 1_000_000 // display only
// NEVER: const win = wagerDollars * multiplier
```

**Working directory:** `~/math-sdk/frontend/`
**Repo:** https://github.com/JTOSHIE/stake-game-development-claude
**Branch:** main

Execute every task in order without stopping. Apply the Three-Strike
Rule: same error 3 times → stop, report exact state, do not attempt a 4th fix.

---

## STANDING PROTOCOL — UPDATE STATUS DOC AFTER EVERY TASK

After completing EACH numbered task, immediately update
`~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md` with:
- Which task just completed
- Which files were modified
- Any issues encountered and how they were resolved
- What is confirmed working

Commit the status doc update together with the task's code changes in
the same git commit. This file is read between sessions to track live
project state — never skip updating it.

---

## STEP 0 — ORIENTATION

```bash
# Read current state
cat ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md

# Inventory all actual asset filenames on disk
ls -la ~/math-sdk/frontend/public/assets/frames/
ls -la ~/math-sdk/frontend/public/assets/videos/
ls -la ~/math-sdk/frontend/public/assets/symbols/

# Read the files that will be modified most heavily
cat ~/math-sdk/frontend/src/App.svelte
cat ~/math-sdk/frontend/src/lib/components/LoadingScreen.svelte
cat ~/math-sdk/frontend/src/lib/components/WinDisplay.svelte
cat ~/math-sdk/frontend/src/lib/i18n/translations.ts

# TypeScript baseline
cd ~/math-sdk/frontend && npx tsc --noEmit 2>&1
```

Report:
1. Exact filenames found in frames/ and videos/ directories
2. Whether translations.ts already has 16 languages or still needs them
3. TSC error count before any changes

---

## TASK 1 — Loading Screen: Logo + Branding + Progress Bar

**File:** `~/math-sdk/frontend/src/lib/components/LoadingScreen.svelte`

Replace the entire file content with the following. Use the exact actual
filenames from the frames/ directory found in Step 0 for any image references.

```svelte
<script lang="ts">
  import { assetLoadProgress } from '../stores/loadingStore'
</script>

<div class="loading-screen">

  <!-- Game logo -->
  <div class="logo-block">
    <div class="logo-title">FUTURE SPINNER</div>
    <div class="logo-subtitle">WE ROLL SPINNERS</div>
  </div>

  <!-- Animated spinner ring -->
  <div class="spinner-ring">
    <div class="ring"></div>
    <div class="ring ring-2"></div>
  </div>

  <!-- Progress bar -->
  <div class="progress-track">
    <div class="progress-fill" style="width: {$assetLoadProgress}%"></div>
  </div>
  <p class="progress-label">LOADING CYBERNETICS... {$assetLoadProgress}%</p>

</div>

<style>
  .loading-screen {
    position: fixed;
    inset: 0;
    background: #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    z-index: 1000;
  }

  /* ── Logo ── */
  .logo-block {
    text-align: center;
    animation: fade-in 0.8s ease both;
  }

  .logo-title {
    font-family: 'Courier New', monospace;
    font-size: clamp(2rem, 6vw, 3.5rem);
    font-weight: 900;
    letter-spacing: 0.15em;
    color: #00ffff;
    text-shadow:
      0 0 20px rgba(0, 255, 255, 0.9),
      0 0 60px rgba(0, 255, 255, 0.4);
    animation: title-glow 2s ease-in-out infinite alternate;
  }

  .logo-subtitle {
    font-family: 'Courier New', monospace;
    font-size: clamp(0.7rem, 2vw, 0.95rem);
    letter-spacing: 0.35em;
    color: #ff00ff;
    text-shadow: 0 0 12px rgba(255, 0, 255, 0.7);
    margin-top: 0.3rem;
    animation: fade-in 1.2s ease 0.3s both;
  }

  /* ── Spinner ring ── */
  .spinner-ring {
    position: relative;
    width: 80px;
    height: 80px;
  }

  .ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: #00ffff;
    border-right-color: rgba(0, 255, 255, 0.3);
    animation: spin 1.2s linear infinite;
  }

  .ring-2 {
    inset: 10px;
    border-top-color: #ff00ff;
    border-right-color: rgba(255, 0, 255, 0.3);
    animation: spin 0.8s linear infinite reverse;
  }

  /* ── Progress bar ── */
  .progress-track {
    width: min(240px, 60vw);
    height: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00ffff, #ff00ff);
    border-radius: 2px;
    transition: width 0.1s linear;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
  }

  .progress-label {
    font-family: 'Courier New', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    color: rgba(0, 255, 255, 0.5);
  }

  /* ── Keyframes ── */
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes title-glow {
    from { text-shadow: 0 0 20px rgba(0,255,255,0.9), 0 0 60px rgba(0,255,255,0.4); }
    to   { text-shadow: 0 0 30px rgba(0,255,255,1),   0 0 80px rgba(0,255,255,0.6); }
  }
</style>
```

If `loadingStore.ts` does not exist yet, create it:
```typescript
// src/lib/stores/loadingStore.ts
import { writable } from 'svelte/store'
export const assetLoadProgress = writable<number>(0)
```

**Verification:** Run `npm run dev`, open http://localhost:5173/ — confirm
the loading screen shows "FUTURE SPINNER" in cyan with dual spinning
rings and a gradient progress bar before the game loads.

Update `FUTURE_SPINNER_PROJECT_STATUS.md` and commit:
```bash
cd ~/math-sdk
git add -A
git commit -m "feat(frontend): loading screen logo, branding, progress bar"
git push origin main
```

---

## TASK 2 — Cyberpunk Frame Overlay (App.svelte)

**File:** `~/math-sdk/frontend/src/App.svelte`

**Step 1:** From the Step 0 inventory, identify the actual frame filenames
in `public/assets/frames/`. They are named like `1000062171.png`,
`1000062174.png`, `1000062175.png`, `1000062176.png` (verify exact names).

**Step 2:** Add a frame overlay image over the PixiJS grid canvas. The
frame sits above the canvas but below all UI controls. Add this to the
App.svelte template in the section containing the GameGrid component:

```svelte
<!-- Cyberpunk frame overlay — sits above canvas, below controls -->
<div class="grid-wrapper">
  <GameGrid bind:this={gameGrid} />
  <img
    src="assets/frames/[FIRST_FRAME_FILENAME]"
    class="game-frame"
    alt=""
    aria-hidden="true"
  />
</div>
```

Replace `[FIRST_FRAME_FILENAME]` with the actual first frame filename
found in Step 0. If a `.grid-wrapper` or equivalent container already
exists around GameGrid, add the `<img>` inside it — do not create a
duplicate wrapper.

**Step 3:** Add these styles to App.svelte's `<style>` block:

```css
.grid-wrapper {
  position: relative;
  display: inline-block; /* shrink-wrap around the canvas */
}

.game-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;      /* never intercept clicks */
  z-index: 10;               /* above canvas (z 0), below UI controls */
  /* Pulsing cyan border glow */
  animation: frame-glow 3s ease-in-out infinite;
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.4));
}

@keyframes frame-glow {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(0,255,255,0.3)); }
  50%       { filter: drop-shadow(0 0 16px rgba(0,255,255,0.7)); }
}
```

**Step 4:** Verify the frame renders correctly:
- Frame image overlays the grid area
- Grid symbols are still fully visible through the frame
- Frame does not block spin button or any UI controls
- Glow animation pulses gently

Update status doc and commit:
```bash
cd ~/math-sdk
git add -A
git commit -m "feat(frontend): cyberpunk frame overlay with pulsing glow"
git push origin main
```

---

## TASK 3 — Background Video Loop (App.svelte)

**File:** `~/math-sdk/frontend/src/App.svelte`

**Step 1:** From the Step 0 inventory, identify the actual video filenames
in `public/assets/videos/`. They are named like `1000062179.mp4`,
`1000062182.mp4`, `1000062183.mp4` (verify exact names).

**Step 2:** Add a looping background video as the very first element
inside the App.svelte template (behind everything else):

```svelte
<!-- Background video — behind all UI elements -->
<div class="bg-layer" class:reduce-motion={prefersReducedMotion}>
  {#if !prefersReducedMotion}
    <video
      class="bg-video"
      autoplay
      loop
      muted
      playsinline
      aria-hidden="true"
    >
      <source src="assets/videos/[FIRST_VIDEO_FILENAME]" type="video/mp4" />
    </video>
  {/if}
  <div class="bg-overlay"></div>
</div>
```

Replace `[FIRST_VIDEO_FILENAME]` with the actual first video filename
found in Step 0.

**Step 3:** Add this to the App.svelte `<script>` block:

```typescript
// Respect prefers-reduced-motion for accessibility
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

**Step 4:** Add these styles to App.svelte's `<style>` block:

```css
.bg-layer {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}

.bg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.35;  /* subtle — game elements must remain clear */
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65); /* ensures readability over video */
}

/* Reduced-motion fallback: static gradient instead of video */
.bg-layer.reduce-motion {
  background: radial-gradient(
    ellipse at center,
    #0a0a1a 0%,
    #000000 70%
  );
}
```

**Step 5:** Verify:
- Background video plays silently and loops behind the game
- Game symbols, controls, and win display are all clearly readable
- On systems with prefers-reduced-motion, a static dark gradient shows instead
- No console errors about video loading

Update status doc and commit:
```bash
cd ~/math-sdk
git add -A
git commit -m "feat(frontend): background video loop with reduced-motion fallback"
git push origin main
```

---

## TASK 4 — Mobile Responsive Layout (App.svelte)

**File:** `~/math-sdk/frontend/src/App.svelte`

Add responsive CSS to make the game playable on mobile screens. The
PixiJS canvas must scale down proportionally. Touch targets must be
minimum 44×44px.

**Step 1:** Add viewport meta if not already in `index.html`:
```bash
grep -q "viewport" ~/math-sdk/frontend/index.html || \
  sed -i 's|<head>|<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">|' ~/math-sdk/frontend/index.html
```

**Step 2:** Add these media queries to App.svelte's `<style>` block.
Read the existing layout structure first and adapt selectors to match
actual class names used in App.svelte:

```css
/* ── Mobile responsive ─────────────────────────────────── */

/* Tablet and below */
@media (max-width: 768px) {
  /* Scale down the PixiJS canvas container */
  .grid-wrapper,
  .game-canvas-container,
  [class*="grid"] {
    transform: scale(0.75);
    transform-origin: top center;
  }

  /* Increase all button touch targets */
  button {
    min-height: 44px;
    min-width: 44px;
  }

  /* Stack layout vertically if side-by-side panels exist */
  .game-layout,
  .main-layout {
    flex-direction: column;
    align-items: center;
  }
}

/* Phone portrait */
@media (max-width: 480px) {
  .grid-wrapper,
  .game-canvas-container,
  [class*="grid"] {
    transform: scale(0.58);
    transform-origin: top center;
  }

  .logo-title {
    font-size: 1.4rem;
  }
}

/* Phone landscape — extra height needed */
@media (max-height: 500px) and (orientation: landscape) {
  .grid-wrapper,
  .game-canvas-container,
  [class*="grid"] {
    transform: scale(0.55);
    transform-origin: top left;
  }
}
```

Adapt all selectors to match the actual class names found in App.svelte.
Do not introduce new wrapper elements — apply transforms to existing containers.

**Verification:**
- Open http://localhost:5173/ and use browser DevTools to simulate iPhone 14 portrait
- Grid should be fully visible without horizontal scrolling
- Spin button should be tappable (44px+)
- Text remains readable

Update status doc and commit:
```bash
cd ~/math-sdk
git add -A
git commit -m "feat(frontend): mobile responsive layout with canvas scaling"
git push origin main
```

---

## TASK 5 — Win Celebration Overlays (WinCelebration.svelte)

**File to create:** `~/math-sdk/frontend/src/lib/components/WinCelebration.svelte`

Create a full-screen win celebration overlay that triggers at different
thresholds. Import and use it in App.svelte.

```svelte
<script lang="ts">
  import { winMultiplier, betAmount } from '../stores/gameStore'
  import { onDestroy } from 'svelte'

  // Compute tier from the store
  $: tier = $winMultiplier >= 100 ? 'epic'
           : $winMultiplier >= 20  ? 'mega'
           : $winMultiplier >= 5   ? 'big'
           : $winMultiplier >= 1   ? 'small'
           : 'none'

  // Auto-dismiss timers
  let dismissTimer: ReturnType<typeof setTimeout>

  $: if (tier === 'small') {
    clearTimeout(dismissTimer)
    dismissTimer = setTimeout(() => winMultiplier.set(0), 1000)
  } else if (tier === 'big') {
    clearTimeout(dismissTimer)
    dismissTimer = setTimeout(() => winMultiplier.set(0), 3000)
  } else if (tier === 'mega') {
    clearTimeout(dismissTimer)
    dismissTimer = setTimeout(() => winMultiplier.set(0), 5000)
  }
  // 'epic' only dismisses on click — no auto-timer

  function dismiss() {
    clearTimeout(dismissTimer)
    winMultiplier.set(0)
  }

  onDestroy(() => clearTimeout(dismissTimer))

  // Particle generation
  function makeParticles(count: number): Array<{x:number, y:number, delay:number, dur:number, color:string}> {
    const colors = ['#00ffff', '#ff00ff', '#ffd700', '#ffffff', '#9d00ff']
    return Array.from({ length: count }, (_, i) => ({
      x:     Math.random() * 100,
      y:     Math.random() * 100,
      delay: Math.random() * 0.8,
      dur:   1 + Math.random() * 1,
      color: colors[i % colors.length],
    }))
  }

  $: particles = tier === 'epic'  ? makeParticles(50)
               : tier === 'mega'  ? makeParticles(35)
               : tier === 'big'   ? makeParticles(20)
               : []
</script>

{#if tier === 'small'}
  <!-- Small win: brief gold flash above grid, auto-hides in 1s -->
  <div class="small-win" aria-live="polite">WIN!</div>

{:else if tier !== 'none'}
  <!-- Big / Mega / Epic: full overlay -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="overlay overlay-{tier}"
    on:click={dismiss}
    role="dialog"
    aria-modal="true"
    aria-label="{tier === 'epic' ? 'EPIC WIN' : tier === 'mega' ? 'MEGA WIN' : 'BIG WIN'}"
    tabindex="-1"
  >
    <!-- Particles -->
    {#each particles as p}
      <div
        class="particle"
        style="
          left: {p.x}%;
          top:  {p.y}%;
          background: {p.color};
          animation-delay: {p.delay}s;
          animation-duration: {p.dur}s;
        "
      ></div>
    {/each}

    <!-- Win label -->
    <div class="win-label-big">
      {#if tier === 'epic'}EPIC WIN!
      {:else if tier === 'mega'}MEGA WIN!
      {:else}BIG WIN!{/if}
    </div>

    <!-- Multiplier -->
    <div class="win-mult">{$winMultiplier.toFixed(1)}×</div>

    <!-- Dismiss hint (epic only) -->
    {#if tier === 'epic'}
      <p class="dismiss-hint">TAP TO CONTINUE</p>
    {/if}
  </div>
{/if}

<style>
  /* ── Small win flash ── */
  .small-win {
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Courier New', monospace;
    font-size: 2rem;
    font-weight: 900;
    color: #ffd700;
    text-shadow: 0 0 20px rgba(255,215,0,0.8);
    z-index: 200;
    animation: small-win-anim 1s ease both;
    pointer-events: none;
  }

  @keyframes small-win-anim {
    0%   { opacity: 0; transform: translateX(-50%) scale(0.6); }
    20%  { opacity: 1; transform: translateX(-50%) scale(1.1); }
    70%  { opacity: 1; transform: translateX(-50%) scale(1); }
    100% { opacity: 0; transform: translateX(-50%) scale(0.9); }
  }

  /* ── Full overlay ── */
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 500;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    cursor: pointer;
    overflow: hidden;
  }

  .overlay-big  { background: rgba(0,0,0,0.82); }
  .overlay-mega { background: rgba(10,0,20,0.88); }
  .overlay-epic { background: rgba(0,0,0,0.92); }

  /* ── Win label ── */
  .win-label-big {
    font-family: 'Courier New', monospace;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-align: center;
    animation: label-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  .overlay-big  .win-label-big {
    font-size: clamp(2.5rem, 10vw, 4rem);
    color: #ff00ff;
    text-shadow: 0 0 30px #ff00ff, 0 0 60px rgba(255,0,255,0.4);
    animation: label-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both,
               pulse-magenta 1.2s ease-in-out infinite 0.5s;
  }

  .overlay-mega .win-label-big {
    font-size: clamp(3rem, 12vw, 5rem);
    color: #00ffff;
    text-shadow: 0 0 40px #00ffff, 0 0 80px rgba(0,255,255,0.5);
    animation: label-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both,
               pulse-cyan 1.2s ease-in-out infinite 0.5s;
  }

  .overlay-epic .win-label-big {
    font-size: clamp(3.5rem, 14vw, 6rem);
    background: linear-gradient(135deg, #00ffff, #ff00ff, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 20px rgba(0,255,255,0.6));
    animation: label-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both,
               rainbow-shift 3s linear infinite 0.5s;
  }

  /* ── Multiplier ── */
  .win-mult {
    font-family: 'Courier New', monospace;
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    font-weight: 700;
    color: #ffd700;
    text-shadow: 0 0 16px rgba(255,215,0,0.7);
    animation: fade-in 0.3s ease 0.2s both;
  }

  .dismiss-hint {
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    color: rgba(255,255,255,0.4);
    margin-top: 1rem;
    animation: fade-in 0.5s ease 1s both;
  }

  /* ── Particles ── */
  .particle {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    animation: particle-fall linear both;
    opacity: 0;
  }

  @keyframes particle-fall {
    0%   { opacity: 1; transform: translateY(0)    scale(1); }
    100% { opacity: 0; transform: translateY(120px) scale(0.3); }
  }

  /* ── Shared keyframes ── */
  @keyframes label-pop {
    from { transform: scale(0.3); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes pulse-magenta {
    0%,100% { text-shadow: 0 0 30px #ff00ff, 0 0 60px rgba(255,0,255,0.4); }
    50%     { text-shadow: 0 0 50px #ff00ff, 0 0 100px rgba(255,0,255,0.7); }
  }

  @keyframes pulse-cyan {
    0%,100% { text-shadow: 0 0 40px #00ffff, 0 0 80px rgba(0,255,255,0.5); }
    50%     { text-shadow: 0 0 60px #00ffff, 0 0 120px rgba(0,255,255,0.8); }
  }

  @keyframes rainbow-shift {
    0%   { filter: drop-shadow(0 0 20px rgba(0,255,255,0.6))   hue-rotate(0deg); }
    100% { filter: drop-shadow(0 0 20px rgba(255,0,255,0.6))   hue-rotate(360deg); }
  }
</style>
```

**Import WinCelebration into App.svelte:**

Add to App.svelte's imports:
```typescript
import WinCelebration from './lib/components/WinCelebration.svelte'
```

Add to App.svelte's template (just before the closing tag of the root
element, so it layers on top of everything):
```svelte
<WinCelebration />
```

**Note on `winMultiplier`:** If `winMultiplier` is a derived store (not
writable), the `winMultiplier.set(0)` calls above will need to instead
call a store action like `resetWin()` from gameStore. Read gameStore.ts
and adapt accordingly — do NOT break the store architecture.

Update status doc and commit:
```bash
cd ~/math-sdk
git add -A
git commit -m "feat(frontend): win celebration overlays — small/big/mega/epic tiers"
git push origin main
```

---

## TASK 6 — Reel Tumble Spin Animation (GameGrid.svelte)

**File:** `~/math-sdk/frontend/src/lib/components/GameGrid.svelte`

Enhance the existing spin animation to use a proper reel-tumble effect —
symbols blur and scroll downward column by column with a staggered stop
sequence.

Read the current `animateSpin` function in GameGrid.svelte first. Then
replace or enhance it with the following approach:

**Requirements:**
1. When spin starts, apply `PIXI.BlurFilter` (blurX: 0, blurY: 8) to
   each reel container
2. Animate each reel container scrolling downward by 40px over 150ms
   using `requestAnimationFrame`, then snap back to 0
3. Stagger reel stops: reel 0 stops first, then reel 1–4 each stop
   100ms after the previous (total stagger: 400ms)
4. On each reel stop: remove blur filter, play the reel-stop "snap"
   visual (brief scale 1.0 → 1.05 → 1.0 over 80ms)
5. After all reels stop: call `_applyWinHighlights()`
6. Total animation duration: ~800ms for normal speed, ~400ms for turbo
   (check if `isTurbo` store exists and halve durations if so)

If the current code already implements a scroll animation, enhance the
existing approach rather than replacing it wholesale. Do not break the
existing asset loading, fallback, or win highlight logic.

**Blur application pattern:**
```typescript
import { BlurFilter } from 'pixi.js'

function _blurReel(reelIndex: number): void {
  const blur = new BlurFilter()
  blur.blurX = 0
  blur.blurY = 10
  reelContainers[reelIndex].filters = [blur]
}

function _clearBlur(reelIndex: number): void {
  reelContainers[reelIndex].filters = []
}
```

After implementing, run the dev server and spin multiple times to confirm:
- Each reel visually blurs during spin
- Reels stop left-to-right with clear stagger
- Win highlights appear correctly after all reels stop
- No memory leaks (filters cleaned up after each spin)

Update status doc and commit:
```bash
cd ~/math-sdk
git add -A
git commit -m "feat(frontend): reel tumble animation with blur and staggered stops"
git push origin main
```

---

## TASK 7 — Verify + Complete 16 Languages (translations.ts)

**File:** `~/math-sdk/frontend/src/lib/i18n/translations.ts`

From Step 0, you already know whether 16 languages are present or not.

**If 16 languages are already present** (en, ar, de, es, fi, fr, hi, id,
ja, ko, pl, pt, ru, tr, vi, zh): skip to verification below.

**If fewer than 16 languages are present**, add the missing ones. The
required 16 language codes are:
`en ar de es fi fr hi id ja ko pl pt ru tr vi zh`

Each locale must implement all keys defined in the `Translations`
interface. Use accurate native-language translations — not English
placeholders.

**Required keys** (match whatever interface is currently defined, and add
any that are missing):
```typescript
spin, stop, endRound, autoPlay,
bet, betMin, betMax, maxBet, minBet,
balance, win, loading, buyBonus, buyBonusDesc,
scatter3, scatter4, scatter5, wincap,
bigWin, hugeWin, megaWin,
error, insufficientBalance, sessionExpired,
maintenanceMode, locationRestricted, gamblingLimitReached,
rules, paytable, close, settings
```

**Verification:**
```bash
cd ~/math-sdk/frontend
node -e "
const { locales } = require('./src/lib/i18n/translations.ts')
// This will error if imports don't work — use tsc check instead
"
npx tsc --noEmit 2>&1
```

Count of locales in the file must equal 16. If TSC passes, languages are correct.

Update status doc and commit:
```bash
cd ~/math-sdk
git add -A
git commit -m "feat(frontend): 16 languages complete"
git push origin main
```

---

## TASK 8 — PAR Sheet PDF

Convert the PAR sheet markdown to PDF for the submission package.

```bash
# Create submission directory
mkdir -p ~/math-sdk/submission-package

# Try pandoc first
which pandoc && pandoc \
  ~/math-sdk/games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md \
  -o ~/math-sdk/submission-package/FUTURE_SPINNER_PAR_SHEET.pdf \
  --pdf-engine=wkhtmltopdf 2>/dev/null || \
pandoc \
  ~/math-sdk/games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md \
  -o ~/math-sdk/submission-package/FUTURE_SPINNER_PAR_SHEET.pdf 2>/dev/null || \
echo "PANDOC_FAILED"
```

If pandoc is not available, install it:
```bash
brew install pandoc
pandoc \
  ~/math-sdk/games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md \
  -o ~/math-sdk/submission-package/FUTURE_SPINNER_PAR_SHEET.pdf
```

If PDF generation fails after two attempts, convert to HTML as fallback:
```bash
pandoc \
  ~/math-sdk/games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md \
  -o ~/math-sdk/submission-package/FUTURE_SPINNER_PAR_SHEET.html \
  --standalone \
  --metadata title="Future Spinner PAR Sheet — We Roll Spinners"
echo "HTML fallback created"
```

Verify the output file exists and is non-zero size:
```bash
ls -lh ~/math-sdk/submission-package/
```

Update status doc and commit:
```bash
cd ~/math-sdk
git add submission-package/
git commit -m "feat(submission): PAR sheet PDF generated"
git push origin main
```

---

## TASK 9 — Submission Package + Promotional Blurb

```bash
mkdir -p ~/math-sdk/submission-package
```

**Step 1:** Create `promotional_blurb.txt`:

```bash
cat > ~/math-sdk/submission-package/promotional_blurb.txt << 'EOF'
FUTURE SPINNER — We Roll Spinners

Future Spinner is a high-volatility 5×4 cyberpunk slot game built for
the Stake Engine platform, delivering 1,024 ways-to-win across a rain-
soaked neon megacity where spinning rims never stopped evolving.

GAME HIGHLIGHTS
- Grid: 5 reels × 4 rows — 1,024 ways-to-win
- RTP: 96.35% (GLI-11 compliant, validated at 100,000 simulations)
- Win cap: 5,000× maximum win
- Hit rate: 33.57%
- Volatility: Medium-High (σ = 16.26×)

THEME & VISUALS
Futuristic cyberpunk automotive culture — chrome spinning rims,
turbochargers, holographic grilles, and neon exhaust pipes form the
symbol set. Dark backgrounds, magenta and cyan neon glow, and looping
cyberpunk cityscape video create an immersive premium aesthetic.

BONUS FEATURE
Stateless scatter multiplier — land 3, 4, or 5 Scatter symbols anywhere
on the grid to win 5×, 15×, or 50× your total bet instantly. No free
spin rounds — clean, fast, compliant.

TECHNICAL
- Platform: Stake Engine (Carrot RGS)
- Frontend: Svelte 5 + PixiJS v7
- Math: Carrot Math SDK (Python 3.12 + Rust optimiser)
- Languages: 16 (ar, de, en, es, fi, fr, hi, id, ja, ko, pl, pt, ru, tr, vi, zh)
- Currencies: 43 Stake Engine supported currencies
- Studio: We Roll Spinners

GitHub (math publish files):
https://github.com/JTOSHIE/stake-game-development-claude
EOF
```

**Step 2:** Create `SUBMISSION_CHECKLIST.md`:

```bash
cat > ~/math-sdk/submission-package/SUBMISSION_CHECKLIST.md << 'EOF'
# FUTURE SPINNER — SUBMISSION CHECKLIST
## We Roll Spinners | Stake Engine

### Math Files (upload to Stake Engine portal)
- [ ] books_base.jsonl.zst — ~/math-sdk/library/publish_files/
- [ ] lookUpTable_base_0.csv — ~/math-sdk/library/publish_files/
- [ ] index.json — ~/math-sdk/library/publish_files/

### Frontend Build (upload dist/ folder)
- [ ] Run: cd ~/math-sdk/frontend && npm run build
- [ ] Upload entire dist/ folder contents

### Documentation
- [ ] FUTURE_SPINNER_PAR_SHEET.pdf — submission-package/
- [ ] promotional_blurb.txt — submission-package/

### Artwork (Google Drive / Dropbox — public link required)
- [ ] All symbol PNGs — public/assets/symbols/
- [ ] All frame PNGs — public/assets/frames/
- [ ] All background MP4s — public/assets/videos/

### Compliance
- [ ] RTP confirmed: 96.3500% (±0.000% deviation)
- [ ] 16 languages implemented
- [ ] No Stake branding in game
- [ ] No child-appealing themes
- [ ] No jackpots / no free spins
- [ ] Win cap enforced: 5,000×
- [ ] IP/trademark review: "Future Spinner" and "We Roll Spinners"

### Final Build Check
- [ ] npx tsc --noEmit exits 0
- [ ] npm run build exits 0
- [ ] Game loads and spins in browser
- [ ] Win display works correctly
- [ ] Mobile layout tested
EOF
```

**Step 3:** Run the final production build:
```bash
cd ~/math-sdk/frontend
npm run build 2>&1
ls -lh dist/
```

Confirm `dist/` folder exists and contains `index.html`.

Update status doc and commit:
```bash
cd ~/math-sdk
git add submission-package/
git add frontend/dist/ 2>/dev/null || true
git commit -m "feat(submission): promotional blurb, checklist, production build"
git push origin main
```

---

## FINAL TYPESCRIPT CHECK + BUILD

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit with 0 errors. Fix any errors autonomously before
writing the completion report.

---

## FINAL STATUS DOC UPDATE

Write the complete final state to `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md`:

```markdown
# FUTURE SPINNER — PROJECT STATUS
## Last updated: [today's date] | Full visual polish session complete

## CURRENT STATE
All visual polish tasks complete. Game is submission-ready pending
artwork upload to Google Drive / Dropbox and final Stake Engine portal
upload. Production build passes with 0 TypeScript errors.

## COMPONENT STATUS

| Component | Status | Notes |
|-----------|--------|-------|
| Math SDK | ✅ LOCKED | 96.35% RTP, 100k sim |
| rgsService.ts | ✅ LOCKED | Mock mode working |
| gameStore.ts | ✅ LOCKED | |
| GameGrid.svelte | ✅ Complete | PNGs, blur reel tumble, win highlights |
| LoadingScreen.svelte | ✅ Complete | Logo, dual rings, gradient progress bar |
| WinDisplay.svelte | ✅ Complete | Count-up, flicker-free, colour tiers |
| WinCelebration.svelte | ✅ Complete | small/big/mega/epic tiers + particles |
| ControlBar.svelte | ✅ Complete | Cyberpunk hover effects |
| BalanceDisplay.svelte | ✅ Complete | |
| App.svelte | ✅ Complete | Frame overlay, video BG, mobile layout |
| translations.ts | ✅ Complete | 16 languages |
| PAR Sheet PDF | ✅ Complete | submission-package/ |
| Submission package | ✅ Complete | Checklist + blurb created |

## OUTSTANDING (manual steps — requires human)
1. Upload artwork folder (symbols + frames + videos) to Google Drive/Dropbox
2. Upload dist/ + math publish files to Stake Engine portal
3. IP/trademark review for "Future Spinner" and "We Roll Spinners"
4. Test with real RGS endpoint (not mock mode)

## SESSIONS LOG
| Session | Date | What was done |
|---------|------|--------------|
| Full polish | [today] | Tasks 1–9: loading screen, frame, video, mobile, celebrations, reel tumble, 16 languages, PAR PDF, submission package |
| Bugfix | 2026-04-03 | Win display flicker fixed, payout units confirmed |
| Symbol Integration | 2026-04-03 | PNG sprites, hover effects, count-up animation |

## REPOSITORY
- Repo: https://github.com/JTOSHIE/stake-game-development-claude
- Frontend: ~/math-sdk/frontend/
- Branch: main
- Last commit: [git log --oneline -1]
```

---

## FINAL COMMIT + PUSH

```bash
cd ~/math-sdk
git add -A
git commit -m "chore: final status doc — all visual polish complete, submission ready"
git push origin main
```

---

## COMPLETION REPORT

Print this exactly when all tasks are done:

═══════════════════════════════════════════════════════════════
FUTURE SPINNER — FULL VISUAL POLISH SESSION COMPLETE
═══════════════════════════════════════════════════════════════

TASK 1 — Loading screen logo + branding:       [ done ]
TASK 2 — Cyberpunk frame overlay:              [ done ]
TASK 3 — Background video loop:                [ done ]
TASK 4 — Mobile responsive layout:            [ done ]
TASK 5 — Win celebration overlays:            [ done ]
TASK 6 — Reel tumble spin animation:          [ done ]
TASK 7 — 16 languages:                        [ done / already done ]
TASK 8 — PAR Sheet PDF:                       [ done ]
TASK 9 — Submission package:                  [ done ]

TSC CHECK:    [ 0 errors ]
BUILD:        [ pass — dist/ created ]
ALL COMMITS:  [ pushed to main ]
STATUS DOC:   [ updated ]

REMAINING (human steps):
  → Upload artwork to Google Drive/Dropbox (public link)
  → Upload dist/ + math files to Stake Engine portal
  → IP/trademark review
  → Test against real RGS endpoint

═══════════════════════════════════════════════════════════════
