# FUTURE SPINNER — FULL DIAGNOSTIC + SURGICAL FIX
## This prompt diagnoses the actual running state FIRST, then fixes exactly what is wrong.
## Do NOT skip any diagnostic step. Do NOT assume previous changes worked.
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.
**Working directory:** ~/math-sdk/frontend/

---

## KNOWN SYMPTOMS (from screenshot)
1. Night Trap / Trap Lane theme shows FUTURE SPINNER rain street background
2. Symbol grid is empty / dark — no symbols rendering at all
3. Frame ornate PNG loads but its centre is too small — cuts into symbol area
4. Spin button appears to be a black/white square (theme button not loading)
5. Balance panel is thin/transparent (theme panel not loading)

---

## PHASE 1 — FULL DIAGNOSTIC (read everything, fix nothing)

### D1 — What theme does localStorage think is active?

```bash
# Check what the built JS will read from localStorage
# We can't access browser localStorage, but we can check the theme default
grep -n "localStorage\|wrs_theme\|DEFAULT_THEME\|loadSaved" \
  ~/math-sdk/frontend/src/lib/stores/themeStore.ts \
  ~/math-sdk/frontend/src/lib/config/themes.ts 2>/dev/null
```

### D2 — What does App.svelte ACTUALLY render for the background?

```bash
grep -n "video\|bg-layer\|bg-media\|isVideo\|activeTheme\|background\|mp4\|jpg" \
  ~/math-sdk/frontend/src/App.svelte | head -50
```

Report the EXACT lines found. We need to confirm the `{#if}` check exists and uses `$activeTheme.id`.

### D3 — What do the symbol keys in the game store look like?

```bash
# What symbol codes does rgsService.ts produce on the board?
grep -n "H1\|H2\|M1\|M2\|M3\|L1\|L2\|L3\|symbol\|board\|WILD\|SCATTER\|'W'\|'S'" \
  ~/math-sdk/frontend/src/lib/services/rgsService.ts | head -40
```

This tells us EXACTLY what symbol codes the game engine produces.
These must EXACTLY match the keys in getSymbolMap() in GameGrid.svelte.

### D4 — What does getSymbolMap() in GameGrid.svelte return?

```bash
grep -n "getSymbolMap\|symbolMap\|SYMBOL_TEXTURES\|H1\|H2\|themeAssets\|symbols\." \
  ~/math-sdk/frontend/src/lib/components/GameGrid.svelte | head -40
```

### D5 — What does themeStore actually export as symbol paths?

```bash
cat ~/math-sdk/frontend/src/lib/stores/themeStore.ts
```

Read the complete file. Report what keys the `symbols` object has.

### D6 — Do the actual asset files exist with the right names?

```bash
echo "=== TRAP LANE SYMBOLS ==="
ls ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/ 2>/dev/null || echo "DIRECTORY MISSING"

echo ""
echo "=== TRAP LANE BACKGROUNDS ==="
ls ~/math-sdk/frontend/public/assets/themes/trap-lane/backgrounds/ 2>/dev/null || echo "DIRECTORY MISSING"

echo ""
echo "=== TRAP LANE UI ==="
ls ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/ 2>/dev/null || echo "DIRECTORY MISSING"

echo ""
echo "=== TRAP LANE SOUNDS ==="
ls ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/ 2>/dev/null || echo "DIRECTORY MISSING"

echo ""
echo "=== BEAUTIFUL GAME SYMBOLS ==="
ls ~/math-sdk/frontend/public/assets/themes/beautiful-game/symbols/ 2>/dev/null || echo "DIRECTORY MISSING"

echo ""
echo "=== OIL AND FIRE SYMBOLS ==="
ls ~/math-sdk/frontend/public/assets/themes/oil-and-fire/symbols/ 2>/dev/null || echo "DIRECTORY MISSING"

# Check file sizes to confirm they aren't empty
echo ""
echo "=== TRAP LANE SYMBOL FILE SIZES ==="
du -sh ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/*.png 2>/dev/null | head -12
```

### D7 — What does ControlBar.svelte use for button images?

```bash
grep -n "spinButton\|btnMinus\|btnPlus\|btnAutoplay\|spin_button\|btn_bet\|themeAssets\|src=" \
  ~/math-sdk/frontend/src/lib/components/ControlBar.svelte | head -30
```

### D8 — What does BalanceDisplay.svelte use for its panel?

```bash
grep -n "panelBalance\|panel_balance\|background-image\|themeAssets\|style=" \
  ~/math-sdk/frontend/src/lib/components/BalanceDisplay.svelte | head -20
```

### D9 — Frame dimensions vs canvas size

```bash
# Get the frame PNG dimensions
python3 -c "
from PIL import Image
import os
for theme in ['trap-lane', 'oil-and-fire', 'beautiful-game', 'future-spinner']:
    path = f'$HOME/math-sdk/frontend/public/assets/themes/{theme}/frames/frame-1.png'
    if os.path.exists(path):
        img = Image.open(path)
        print(f'{theme}: {img.size[0]}x{img.size[1]} {img.mode}')
        # Check centre transparency
        import numpy as np
        arr = np.array(img)
        cx, cy = arr.shape[1]//2, arr.shape[0]//2
        print(f'  centre alpha: {arr[cy,cx,3] if arr.shape[2]==4 else \"N/A\"}')
        print(f'  inner safe zone estimate: needs to be at least 700x560 transparent')
    else:
        print(f'{theme}: MISSING')
"
```

### D10 — Check the dev server / dist is actually rebuilt

```bash
# When was the dist last built vs when were the source files last changed?
echo "=== DIST BUILD TIME ==="
ls -la ~/math-sdk/frontend/dist/assets/*.js 2>/dev/null | head -3

echo ""
echo "=== SOURCE LAST MODIFIED ==="
ls -la ~/math-sdk/frontend/src/App.svelte
ls -la ~/math-sdk/frontend/src/lib/stores/themeStore.ts
ls -la ~/math-sdk/frontend/src/lib/components/GameGrid.svelte
ls -la ~/math-sdk/frontend/src/lib/components/ControlBar.svelte
```

---

## PHASE 2 — FIXES (based on diagnostic findings)

Read all D1-D10 findings BEFORE making any fixes.
Then execute ONLY the fixes that are proven necessary by the diagnostics.

### FIX A — Symbol key mismatch (MOST LIKELY ROOT CAUSE)

Based on D3 and D4 findings: if rgsService.ts produces symbol codes like
`'H1'`, `'H2'` etc but getSymbolMap uses different keys, EVERY symbol
will fail to resolve and PixiJS renders nothing.

Read rgsService.ts symbol codes (from D3). Then update getSymbolMap()
in GameGrid.svelte to use EXACTLY the same codes:

```typescript
function getSymbolMap(): Record<string, string> {
  const assets = get(themeAssets).symbols
  // Keys here must EXACTLY match what rgsService.ts puts in the board array
  // Check D3 diagnostic output for the exact codes used
  return {
    // Add every code found in rgsService.ts board output:
    'H1': assets.H1,  'h1': assets.H1,
    'H2': assets.H2,  'h2': assets.H2,
    'M1': assets.M1,  'm1': assets.M1,
    'M2': assets.M2,  'm2': assets.M2,
    'M3': assets.M3,  'm3': assets.M3,
    'L1': assets.L1,  'l1': assets.L1,
    'L2': assets.L2,  'l2': assets.L2,
    'L3': assets.L3,  'l3': assets.L3,
    'W':  assets.W,   'w':  assets.W,
    'S':  assets.S,   's':  assets.S,
    // Also handle any alternate codes found in rgsService:
    'WILD':    assets.W,
    'SCATTER': assets.S,
    'wild':    assets.W,
    'scatter': assets.S,
  }
}
```

### FIX B — Background not switching

If D2 shows the `{#if}` is already using `$activeTheme.id === 'future-spinner'`,
the issue is the page is loading and localStorage still returns `future-spinner`.

Add a test: temporarily change DEFAULT_THEME_ID to 'trap-lane' in themes.ts,
rebuild, open the browser, verify trap-lane loads. Then change it back.

```typescript
// In src/lib/config/themes.ts, temporarily:
export const DEFAULT_THEME_ID = 'trap-lane'
```

Build and test. If trap-lane background now shows correctly, the issue
was only that localStorage was caching 'future-spinner'. Revert
DEFAULT_THEME_ID back to 'future-spinner' after confirming.

If trap-lane background STILL shows future-spinner video even with
DEFAULT_THEME_ID = 'trap-lane', then the {#if} block is not working.
In that case, read App.svelte lines around the background block again
and show the exact code to diagnose further.

### FIX C — Frame too small / covering symbols

If D9 shows the frame's transparent centre is smaller than 700×560px
(the PixiJS canvas size), the frame needs CSS adjustment.

The frame PNG from Manus is 800×640px with a transparent centre of
approximately 560×440px. The PixiJS canvas is 700×560px. The transparent
window is TOO SMALL.

Solution: Override the frame display to use the `frame-2.png` (minimal)
for new themes, which should have a larger transparent area. Or adjust
the CSS inset to make the frame larger:

In App.svelte, update the `.game-frame` CSS:
```css
.game-frame {
  position: absolute;
  inset: -100px;           /* Larger than -80px to push frame further out */
  width: calc(100% + 200px);
  height: calc(100% + 200px);
  object-fit: fill;
  pointer-events: none;
  z-index: 10;
}
```

Also try: for non-future-spinner themes, use the minimal frame
(frame-2.png) which has thinner borders and a larger visible window:

In themeStore.ts, update the frame path for new themes:
```typescript
// For new themes, use frame-2 (minimal) which has more transparent centre
frame: $t.id === 'future-spinner'
  ? `${b}/frames/frame-1.png`
  : `${b}/frames/frame-2.png`,
```

### FIX D — Buttons not showing theme images

If D7 shows ControlBar.svelte still has hard-coded paths OR if inline
styles are not being applied, force a complete rewrite of the button
section:

```svelte
<!-- Spin button — must show theme image -->
<button class="spin-btn" on:click={handleSpin} disabled={$isSpinning}>
  <img
    src="{$themeAssets.spinButton}"
    alt="SPIN"
    draggable="false"
    style="width: 100%; height: 100%; object-fit: contain;"
  />
</button>
```

### FIX E — Panels not showing theme images

If D8 shows BalanceDisplay is still using CSS background-image instead
of inline style, fix it:

```svelte
<div
  class="balance-panel"
  style="
    background-image: url('{$themeAssets.panelBalance}');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-color: transparent;
  "
>
```

---

## PHASE 3 — MANDATORY BUILD AND VERIFY

After ALL fixes are applied:

```bash
# 1. Full rebuild
cd ~/math-sdk/frontend
npm run build 2>&1

# 2. TypeScript check
npx tsc --noEmit 2>&1

# 3. Verify the built JS actually contains the fix
echo "=== VERIFY: future-spinner check in built JS ==="
grep -l "future-spinner" ~/math-sdk/frontend/dist/assets/*.js 2>/dev/null | head -3

# 4. Verify background paths are in built output
echo "=== VERIFY: background paths in built output ==="
grep "bg-1.jpg\|bg-1.mp4" ~/math-sdk/frontend/dist/assets/*.js 2>/dev/null | head -5
```

---

## PHASE 4 — COMMIT AND REPORT

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "fix(themes): diagnostic-driven surgical fix — symbols, background, frame, buttons"
git push origin main
```

---

## COMPLETION REPORT

Print the diagnostic findings AND what was fixed:

═══════════════════════════════════════════════════════════════════
DIAGNOSTIC RESULTS
═══════════════════════════════════════════════════════════════════

D1 — localStorage/theme default:          [ report finding ]
D2 — App.svelte background block:         [ report finding ]
D3 — rgsService symbol codes:             [ list exact codes ]
D4 — getSymbolMap keys:                   [ list exact keys ]
D5 — themeStore symbol object keys:       [ list exact keys ]
D6 — Asset files on disk:                 [ pass/fail per theme ]
D7 — ControlBar button src:               [ report finding ]
D8 — BalanceDisplay panel src:            [ report finding ]
D9 — Frame PNG dimensions/transparency:   [ report dimensions ]
D10 — Build times vs source times:        [ report timestamps ]

FIXES APPLIED:
A — Symbol key mapping:    [ done/not needed ]
B — Background switch:     [ done/not needed ]
C — Frame sizing:          [ done/not needed ]
D — Button images:         [ done/not needed ]
E — Panel images:          [ done/not needed ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]

═══════════════════════════════════════════════════════════════════
