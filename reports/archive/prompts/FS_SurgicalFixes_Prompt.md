# FUTURE SPINNER — SURGICAL FIXES: FRAME + PANELS + SPIN
## Three root causes identified from screenshot. Fix each precisely.
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.
**Working directory:** ~/math-sdk/frontend/

---

## STEP 0 — READ ACTUAL STATE BEFORE CHANGING ANYTHING

```bash
# 1. See exactly what the frame CSS looks like right now
grep -n "game-frame\|grid-wrapper\|game-area\|grid-section\|frame.*top\|frame.*bottom\|frame.*height\|frame.*transform" \
  ~/math-sdk/frontend/src/App.svelte | head -30

# 2. See what BalanceDisplay actually renders
cat ~/math-sdk/frontend/src/lib/components/BalanceDisplay.svelte

# 3. See what WinDisplay actually renders
cat ~/math-sdk/frontend/src/lib/components/WinDisplay.svelte

# 4. Check what panelBalance actually maps to in themeStore
grep -n "panelBalance\|panel_balance\|panelWin\|panel_win" \
  ~/math-sdk/frontend/src/lib/stores/themeStore.ts

# 5. Check the GameGrid spin animation
grep -n "spinning\|blur\|scroll\|overflow\|reel-scroll\|keyframe\|animation" \
  ~/math-sdk/frontend/src/lib/components/GameGrid.svelte | head -30

# 6. Check actual file sizes of installed panels
echo "=== Panel PNGs currently installed ==="
ls -la ~/math-sdk/frontend/public/assets/themes/future-spinner/ui/panel_*.png 2>/dev/null
wc -c ~/math-sdk/frontend/public/assets/themes/future-spinner/ui/panel_balance.png
wc -c ~/math-sdk/frontend/public/assets/themes/future-spinner/ui/panel_win.png
```

Report ALL findings. Then execute fixes below.

---

## FIX 1 — FRAME POSITION: Move frame down so it surrounds all 4 rows

**Problem:** Frame top border overlaps row 1 symbols at top.
Frame bottom border overlaps row 4 symbols at bottom.
The frame transparent window needs to align with the exact grid area.

**The grid dimensions are:**
- Grid width: 616px (5×120 + 4×4 gaps)
- Grid height: 412px (4×100 + 3×4 gaps)
- The frame PNG transparent window: ~620×460px

**The frame is sitting too high.** The fix is to shift it down by
adjusting the top/bottom inset values asymmetrically:

Read the current `.game-frame` CSS values from Step 0, then update:

```css
.game-frame {
  position: absolute;
  top: -70px;      /* Less negative = moves frame DOWN */
  left: -80px;
  right: -80px;
  bottom: -60px;   /* More negative = frame extends further below */
  width: calc(100% + 160px);
  height: calc(100% + 130px);  /* top 70 + bottom 60 */
  object-fit: fill;
  pointer-events: none;
  z-index: 10;
  transform: none;
}
```

**The key change:** top moves from -90px to -70px (less extension up,
so frame moves DOWN). Bottom changes to -60px (more extension down,
so frame covers the bottom row).

If the frame is still not aligned after this, try:
- top: -60px, bottom: -70px (shift further down)

The goal: frame border sits cleanly OUTSIDE all 4 rows of symbols,
not cutting through them at top or bottom.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/App.svelte
git commit -m "fix(frame): shift frame down — top:-70px bottom:-60px to surround all 4 rows"
git push origin main
```

---

## FIX 2 — PANEL OVERLAP: Remove old background images from panels

**Problem:** Two background images are stacking in BalanceDisplay and WinDisplay.
The NEW panel image loads fine. The OLD `$themeAssets.panelBalance` image
also loads and shows underneath/behind — creating a double-panel effect.

The screenshot shows "USD_ance" and "173.13" text — the old component
text is still rendering alongside the new Orbitron text.

**Step 2a — Check if BalanceDisplay has duplicate text elements:**

Read BalanceDisplay.svelte. If it has BOTH old text pill structure AND
new led-value structure, remove the old one completely.

The component should have ONLY this structure — nothing else:

```svelte
<div
  class="balance-panel"
  style="background-image: url('{$themeAssets.panelBalance}'); background-size: 100% 100%;"
>
  <div class="field">
    <div class="led-label">{t($locale, 'balance')}</div>
    <div class="led-value cyan">USD {$balance.toFixed(2)}</div>
  </div>
  <div class="divider"></div>
  <div class="field">
    <div class="led-label">{t($locale, 'bet')}</div>
    <div class="led-value gold">USD {$betAmount.toFixed(2)}</div>
  </div>
</div>
```

No other elements. No `.text-pill`. No `.value`. Delete anything else.

**Step 2b — Check if the old panel image is still installed:**

```bash
# Check what's actually in panel_balance.png — is it the new v2 or old?
wc -c ~/math-sdk/frontend/public/assets/themes/future-spinner/ui/panel_balance.png
# New balance_panel_v2.png from R2 is 28KB = ~28000 bytes
# Old panel was 34KB = ~34000 bytes
# If it shows old size, re-copy:
cp ~/Downloads/fs-r2/processed/ui/balance_panel_v2.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/ui/panel_balance.png
cp ~/Downloads/fs-r2/processed/ui/win_panel_v2.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/ui/panel_win.png
```

**Step 2c — Remove background-image from BalanceDisplay CSS:**

The old CSS class `.balance-panel` may still have a `background-image`
property set in CSS (not inline). If so, remove it — background must
come ONLY from the inline style attribute:

```css
.balance-panel {
  min-width: 280px;
  height: 90px;
  background-repeat: no-repeat;
  background-color: transparent;  /* NO background-image here */
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 0 1.2rem;
  gap: 0.8rem;
}
```

**Step 2d — Same check for WinDisplay.svelte:**

Read WinDisplay. The win panel should have background-image ONLY via
inline style, not in CSS. Remove any CSS background-image from `.win-panel`.

The win panel component should render:
```svelte
<div
  class="win-panel win-{winTier}"
  style="background-image: url('{$themeAssets.panelWin}'); background-size: 100% 100%;"
>
  <div class="win-label ...">WIN</div>
  <div class="win-amount ...">USD X.XX</div>
</div>
```

No duplicate elements. No old `.text-pill`. Check and remove.

**Step 2e — Check themeStore maps panel_win (not panel_win.png old)**

```bash
grep -n "panelWin\|panel_win\|panelBalance\|panel_balance" \
  ~/math-sdk/frontend/src/lib/stores/themeStore.ts
```

Confirm both map to `${b}/ui/panel_win.png` and `${b}/ui/panel_balance.png`
which are now the v2 files (after step 2b above).

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(panels): remove duplicate background + old text elements from balance/win panels"
git push origin main
```

---

## FIX 3 — SPIN ANIMATION: Replace jarring blur with proper scroll simulation

**Problem:** The current spin shows symbols blurring in place but not
actually scrolling. This looks like symbols flickering on/off rather
than spinning reels. A real slot reel needs symbols to appear to
scroll vertically before stopping.

**The correct approach for HTML5 video symbols:**

Since the symbols are `<video>` elements in fixed cells, we cannot
actually scroll them. Instead, we simulate scrolling by:

1. During spin: show a single solid blur overlay over each column
   (the column goes completely dark/blurred — as if the symbols are
   spinning too fast to see)
2. When stopping: fade the blur out smoothly on each column as it
   "lands", revealing the final symbols underneath

This is cleaner and more like a real slot than trying to animate
individual symbol positions.

**In GameGrid.svelte, find `_blurCol` and `_clearColBlur` and replace:**

```typescript
// In GameGrid.svelte script section, add:
let spinOverlayRefs: (HTMLDivElement | null)[] =
  Array.from({ length: REELS }, (): HTMLDivElement | null => null)

function _blurCol(colIndex: number): void {
  const col = colRefs[colIndex]
  const overlay = spinOverlayRefs[colIndex]
  if (col) col.style.filter = 'blur(2px) brightness(0.3)'
  if (overlay) {
    overlay.style.opacity = '1'
    overlay.style.animation = 'spin-scroll 0.08s linear infinite'
  }
}

function _clearColBlur(colIndex: number): void {
  const col = colRefs[colIndex]
  const overlay = spinOverlayRefs[colIndex]
  // Smooth fade-out of blur
  if (col) {
    col.style.transition = 'filter 0.18s ease-out'
    col.style.filter = ''
    setTimeout(() => {
      if (col) col.style.transition = ''
    }, 200)
  }
  if (overlay) {
    overlay.style.opacity = '0'
    overlay.style.animation = ''
  }
}
```

**In the template section, add a spin overlay div inside each column:**

```svelte
<div class="symbol-col" bind:this={colRefs[col]} data-col={col}>
  {#each Array(ROWS) as _, row}
    <div class="symbol-cell" data-col={col} data-row={row}>
      {#if videoSupported}
        <video
          bind:this={videoRefs[col][row]}
          class="symbol-video"
          autoplay loop muted playsinline
          data-col={col} data-row={row}
        ></video>
      {:else}
        <img class="symbol-img" src="..." alt="" draggable="false" />
      {/if}
    </div>
  {/each}
  <!-- Spin overlay — covers entire column during spin -->
  <div
    class="spin-overlay"
    bind:this={spinOverlayRefs[col]}
    aria-hidden="true"
  ></div>
</div>
```

**Add CSS for the spin overlay:**

```css
/* Spin overlay — covers entire column, animates to simulate scrolling */
.spin-overlay {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    rgba(0, 10, 30, 0.85) 0px,
    rgba(10, 20, 50, 0.75) 8px,
    rgba(0, 200, 255, 0.08) 12px,
    rgba(0, 10, 30, 0.85) 16px
  );
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
  z-index: 3;
}

@keyframes spin-scroll {
  0%   { background-position: 0 0; }
  100% { background-position: 0 -32px; }
}

/* Column wrapper needs relative positioning for overlay */
.symbol-col {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  will-change: transform, filter;
  overflow: hidden;   /* CRITICAL: clips the overlay to column bounds */
}
```

**Also update `animateSpin` to NOT use `_startSpinAnimation` helper
(remove it if it exists) and instead use only `_blurCol`:**

In the `animateSpin` function, replace:
```typescript
_startSpinAnimation(r)
```
with just:
```typescript
_blurCol(r)
```

And remove the `_startSpinAnimation` and `_stopSpinAnimation` functions
if they were added in a previous session.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/GameGrid.svelte
git commit -m "fix(spin): scroll overlay replaces blur-in-place — cleaner reel stop animation"
git push origin main
```

---

## FIX 4 — TSC + Build + Verify

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Fix ALL TypeScript errors. The `spinOverlayRefs` array needs the same
type as `videoRefs` and `colRefs`.

---

## FIX 5 — Status + Commit

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "fix: frame position, panel overlaps, spin animation — screenshot issues resolved"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
SURGICAL FIXES COMPLETE
═══════════════════════════════════════════════════════════════════

FIX 1 — Frame shifted down (top:-70 bottom:-60):    [ done ]
  → Frame border surrounds all 4 symbol rows
  → No top/bottom symbol clipping

FIX 2 — Panel overlap resolved:                     [ done ]
  → New v2 panel PNGs confirmed installed
  → Single background-image source (inline style only)
  → Old text elements removed from BalanceDisplay/WinDisplay
  → No duplicate rendering

FIX 3 — Spin scroll overlay:                        [ done ]
  → Column overlay fades in during spin
  → Smooth ease-out fade when column stops
  → Clean reveal of landed symbols

FIX 4 — TSC + build: 0 errors:                     [ done ]
FIX 5 — Status + commit:                            [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]

═══════════════════════════════════════════════════════════════════
