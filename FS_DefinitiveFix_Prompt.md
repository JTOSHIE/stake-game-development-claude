# FUTURE SPINNER — DEFINITIVE FIX SESSION
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

## STEP 0 — FULL DIAGNOSTIC

Run ALL of these before touching any file:

```bash
# 1. Confirm video files exist on disk
ls -lh ~/math-sdk/frontend/public/assets/videos/

# 2. Read the EXACT current state of App.svelte video section
grep -n "video\|bg-video\|bg_rain\|source\|opacity\|bg-layer\|bg-overlay" \
  ~/math-sdk/frontend/src/App.svelte

# 3. Read the full CSS for bg-video and bg-layer
cat ~/math-sdk/frontend/src/App.svelte | grep -A 20 "bg-video\|bg-layer"

# 4. Check if prefersReducedMotion could be blocking the video
grep -n "prefersReducedMotion\|reduce" ~/math-sdk/frontend/src/App.svelte

# 5. Read full App.svelte template section (the HTML, not script)
cat ~/math-sdk/frontend/src/App.svelte
```

Report every finding before making any changes.

---

## TASK 1 — Fix background video (the real fix)

The video file EXISTS and HAS MOTION. The problem is in the code.

After reading the diagnostic output, identify which of these is causing
the issue and fix it:

**Cause A — prefersReducedMotion is true, hiding the video:**
If `{#if !prefersReducedMotion}` wraps the video element, and
`prefersReducedMotion` is evaluating to `true`, the video never renders.
Fix: Change the condition to always show video, use CSS for reduced motion:

```svelte
<!-- Background video — always render, CSS handles reduced motion -->
<div class="bg-layer">
  <video
    class="bg-video"
    autoplay
    loop
    muted
    playsinline
    aria-hidden="true"
  >
    <source src="assets/videos/bg_rain_street_v2.mp4" type="video/mp4" />
  </video>
  <div class="bg-overlay"></div>
</div>
```

CSS for reduced motion (don't hide the video element, just stop it):
```css
@media (prefers-reduced-motion: reduce) {
  .bg-video { animation: none; filter: none; }
}
```

**Cause B — wrong file path:**
If the source is pointing to `1000062179.mp4` or another old filename,
update it to `bg_rain_street_v2.mp4`.

**Cause C — opacity is 0 or element is hidden:**
If `.bg-video` has `opacity: 0` or `display: none` or `visibility: hidden`,
fix it to `opacity: 0.5`.

**Cause D — z-index conflict — video is behind everything:**
Ensure the `.bg-layer` has `z-index: -1` and is OUTSIDE the main game
wrapper, not nested inside a clipped container.

The correct structure in App.svelte template must be:
```svelte
<!-- 1. Video background — FIRST element, outside main wrapper -->
<div class="bg-layer">
  <video class="bg-video" autoplay loop muted playsinline aria-hidden="true">
    <source src="assets/videos/bg_rain_street_v2.mp4" type="video/mp4" />
  </video>
  <div class="bg-overlay"></div>
</div>

<!-- 2. Game wrapper — comes AFTER the video div -->
<main class="game-wrapper">
  ...
</main>
```

The correct CSS:
```css
.bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.bg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1;
}

.game-wrapper {
  position: relative;
  z-index: 2;  /* above the video layer */
}
```

After making the fix, verify by running `npm run dev` and checking
`http://localhost:5173/` — the background should show the cyberpunk
rain street scene moving behind the game. If it still doesn't show,
open browser DevTools → Console and report any video errors.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(video): diagnose and fix background video not rendering"
git push origin main
```

---

## TASK 2 — Fix WILD symbol white box permanently

The CMF contrast/brightness approach is not working. Use a definitive
approach: draw a dark background rect directly in the cell container
BEHIND the WILD sprite, which masks the white.

In `src/lib/components/GameGrid.svelte`, find the WILD (symbol === 'W')
handling in `_makeCell`. Replace ALL special WILD handling with:

```typescript
if (symbol === 'W') {
  // Draw a dark background panel specifically for the WILD cell
  // This sits between the cell background and the sprite,
  // masking the white PNG background
  const wildMask = new Graphics()
  wildMask.beginFill(0x080818, 1.0)  // near-black, fully opaque
  wildMask.drawRoundedRect(
    PADDING,
    PADDING,
    CELL_W - PADDING * 2,
    CELL_H - PADDING * 2,
    8
  )
  wildMask.endFill()
  c.addChild(wildMask)  // add before the sprite

  // Clear any filters or blend modes that were applied
  sprite.filters = []
  sprite.blendMode = BLEND_MODES.NORMAL
  sprite.tint = 0xffffff  // no tint
}
```

This draws a near-black rectangle that completely covers the cell area
before the sprite renders, so the white PNG background is hidden behind
the dark rect, and the WILD badge graphic sits on top cleanly.

If PADDING is not defined at the top of GameGrid.svelte, use `8` directly.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(symbols): WILD white box — draw dark mask behind sprite"
git push origin main
```

---

## TASK 3 — Fix control bar layout — stop buttons overlapping

The bet minus, bet display panel, and spin button are overlapping or
too compressed. Read ControlBar.svelte and find the main layout row.

The fix: restructure into three clearly separated zones:

**Left zone:** bet selector (minus + display + plus)
**Centre zone:** spin button (larger, more breathing room)
**Right zone:** utility buttons (autoplay, sound, info)

Find the `.main-row` or equivalent flex container and update:

```css
.main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;  /* spread zones apart */
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 12px;
  gap: 0;  /* zones handle their own spacing */
}

/* Left zone — bet selector */
.bet-cluster {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

/* Centre zone — spin button */
.spin-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 0 16px;  /* breathing room either side of spin */
}

/* Right zone — utility */
.aux-cluster {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}
```

Use the ACTUAL class names from the file — read them carefully before
applying. The goal is the three zones have clear separation and the
spin button is never overlapping anything.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(layout): control bar three-zone layout, stop overlap"
git push origin main
```

---

## TASK 4 — Remove green hexagon button (right side)

There is still a green hexagon button visible on the right side of the
control bar. Read ControlBar.svelte and identify it.

Check every button in the right/aux cluster:
- If it is an autoplay button → keep it but style with cyan, not green
- If it is a remnant of Buy Bonus → delete it entirely
- If it is a settings/info button → style with btn_menu.png

Find any of these patterns and fix:
- `background: green` → remove
- `background: #00ff00` → remove  
- `background: #4eff91` → remove
- `border: ... green` → remove
- Any image that is a green hexagon → replace with `btn_menu.png`

After fixing, no button in the game should be green. All utility buttons
use `btn_menu.png` or transparent with cyan glow.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(ui): remove all remaining green buttons"
git push origin main
```

---

## TASK 5 — Verify win celebrations are triggering

Read WinCelebration.svelte and App.svelte together. Confirm the component
is receiving the winMultiplier value correctly.

**Check 1:** In App.svelte, find where WinCelebration is included in the
template. If it's missing, add it:
```svelte
<WinCelebration winMultiplier={$winMultiplier} />
```

**Check 2:** After `recordSpinResult` runs, add a temporary console.log
to confirm the value being passed:
```typescript
console.log('[WIN] multiplier passed to celebration:', $winMultiplier)
```

**Check 3:** In WinCelebration.svelte, confirm the thresholds are:
- 0: nothing shows
- 1–4.9×: brief "WIN!" flash, auto-dismiss 1.5s
- 5–19.9×: "BIG WIN!" overlay, particles, auto-dismiss 3s
- 20–99×: "MEGA WIN!" overlay, more particles, auto-dismiss 5s
- 100×+: "EPIC WIN!" stays until tapped

If the thresholds are wrong or the component isn't mounted, fix it now.

Remove the console.log after confirming it works.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(celebrations): verify win overlay thresholds and mounting"
git push origin main
```

---

## TASK 6 — TSC + build + copy status to Downloads

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0. Fix any errors autonomously.

Update ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md with current state.
Then copy it to Downloads so it can be added to project knowledge:

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md
echo "✅ Status doc copied to ~/Downloads/"
```

```bash
cd ~/math-sdk && git add -A
git commit -m "fix: video, WILD, layout, green buttons, win celebrations"
git push origin main
```

---

## COMPLETION REPORT — reply via Telegram

═══════════════════════════════════════════════════════════
FUTURE SPINNER — DEFINITIVE FIX SESSION COMPLETE
═══════════════════════════════════════════════════════════

TASK 1 — Background video playing:          [ done / cause was: X ]
TASK 2 — WILD white box fixed:              [ done ]
TASK 3 — Control bar layout fixed:          [ done ]
TASK 4 — Green button removed:              [ done ]
TASK 5 — Win celebrations verified:         [ done ]
TASK 6 — Build passing:                     [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]
STATUS: [ copied to ~/Downloads/ ]

Video diagnosis: [ state what was actually wrong ]

═══════════════════════════════════════════════════════════
