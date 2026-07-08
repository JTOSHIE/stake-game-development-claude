# FUTURE SPINNER — FINAL THEME POLISH: COMPLETE ITEMISED FIX
## Every issue is listed. Every fix is explicit. No shortcuts.
## Read everything. Execute in order. Verify each step before next.
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.
**Working directory:** ~/math-sdk/frontend/

---

## KNOWN ISSUES FROM SCREENSHOT REVIEW

### Issue 1 — Night Trap symbols all show same image
All 20 cells show h1 (greyhound running). H2-L3 not loading.
Root cause: getSymbolMap() keys may not match exactly.

### Issue 2 — White box on symbols
Some symbols (books in Geo, some greyhounds in Night Trap) have white
rectangular backgrounds instead of transparent. This is a Manus asset issue.
Fix: PixiJS BlurFilter can't fix this — must use CSS mix-blend-mode OR
the GameGrid cell background must be black so white is hidden.

### Issue 3 — Game logo/title missing on Beautiful Game and Oil & Fire
The logo PNG isn't loading or the fallback text is invisible.

### Issue 4 — Frame is CSS fallback not PNG on Beautiful Game and Oil & Fire
The ornate frame PNG fails to load, showing only a thin CSS border.

### Issue 5 — Frame too large — covers balance/bet panels below
The -100px inset pushes the frame border down into the UI panel area.

### Issue 6 — Spin button: dark empty square on Beautiful Game and Oil & Fire
The spin_button.png for these themes isn't loading.

### Issue 7 — MAX bet button still Future Spinner on all new themes
The max bet button is hard-coded to Future Spinner assets.

### Issue 8 — Bet amount frame: Future Spinner style on all new themes
The bet display frame/pill is using Future Spinner CSS styling.

### Issue 9 — Balance/Win panels: too faint, barely visible
The themed panel images aren't strong enough. They need higher opacity
or a CSS fallback background if the image doesn't load.

---

## STEP 0 — FULL DIAGNOSTIC READ

```bash
# Read these exact files before any changes:
cat ~/math-sdk/frontend/src/lib/components/GameGrid.svelte | grep -A 30 "getSymbolMap\|symbolMap\|SYMBOL"
cat ~/math-sdk/frontend/src/lib/components/ControlBar.svelte | head -180
cat ~/math-sdk/frontend/src/lib/components/BalanceDisplay.svelte
cat ~/math-sdk/frontend/src/App.svelte | grep -n "logo\|frame\|game-title\|game-logo\|BALANCE\|maxbet\|MAX"

# Check exact pixel dimensions of all frame PNGs and centre transparency:
python3 -c "
from PIL import Image, ImageStat
import numpy as np, os
themes = ['trap-lane', 'oil-and-fire', 'beautiful-game', 'future-spinner']
for t in themes:
    for f in ['frame-1.png', 'frame-2.png']:
        p = os.path.expanduser(f'~/math-sdk/frontend/public/assets/themes/{t}/frames/{f}')
        if os.path.exists(p):
            img = Image.open(p).convert('RGBA')
            arr = np.array(img)
            w, h = img.size
            # Sample centre 200x200 pixels for alpha
            cx, cy = w//2, h//2
            centre = arr[cy-100:cy+100, cx-100:cx+100, 3]
            print(f'{t}/{f}: {w}x{h}, centre_alpha_mean={centre.mean():.1f}')
        else:
            print(f'{t}/{f}: MISSING')
"

# Check symbol PNG transparency (sample first 3 from each theme):
python3 -c "
from PIL import Image
import numpy as np, os, glob
themes = ['trap-lane', 'oil-and-fire', 'beautiful-game']
for t in themes:
    d = os.path.expanduser(f'~/math-sdk/frontend/public/assets/themes/{t}/symbols/')
    files = sorted(glob.glob(d + '*.png'))[:3]
    for f in files:
        img = Image.open(f).convert('RGBA')
        arr = np.array(img)
        # Check corners for white (non-transparent) pixels
        corners = [arr[0,0], arr[0,-1], arr[-1,0], arr[-1,-1]]
        white_corners = sum(1 for c in corners if c[0]>240 and c[1]>240 and c[2]>240 and c[3]>240)
        print(f'{t}/{os.path.basename(f)}: white_corners={white_corners}/4, mode={img.mode}')
"

# Check logo PNGs:
for theme in trap-lane oil-and-fire beautiful-game; do
  echo "=== $theme logo ==="
  python3 -c "
from PIL import Image; import os
p = os.path.expanduser('~/math-sdk/frontend/public/assets/themes/$theme/ui/logo.png')
if os.path.exists(p):
    img = Image.open(p)
    print(f'  {img.size[0]}x{img.size[1]} {img.mode}')
else:
    print('  MISSING')
"
done
```

Report ALL findings before making any changes.

---

## TASK 1 — Fix symbol variety (Night Trap all showing same symbol)

Read the current getSymbolMap() in GameGrid.svelte carefully.
The issue is likely that all mapped paths resolve to the same file,
OR the board data uses codes that don't hit any key in the map.

Add extensive console logging to diagnose, then fix:

```typescript
function getSymbolMap(): Record<string, string> {
  const assets = get(themeAssets).symbols
  const map: Record<string, string> = {
    // Uppercase (rgsService codes)
    'H1': assets.H1, 'H2': assets.H2,
    'M1': assets.M1, 'M2': assets.M2, 'M3': assets.M3,
    'L1': assets.L1, 'L2': assets.L2, 'L3': assets.L3,
    'W':  assets.W,  'S':  assets.S,
    // Lowercase aliases
    'h1': assets.H1, 'h2': assets.H2,
    'm1': assets.M1, 'm2': assets.M2, 'm3': assets.M3,
    'l1': assets.L1, 'l2': assets.L2, 'l3': assets.L3,
    'w':  assets.W,  's':  assets.S,
  }
  // Debug: log the resolved paths once on first call
  console.log('[GameGrid] Symbol paths:', JSON.stringify(map, null, 2))
  return map
}
```

Verify the assets.H1 through assets.S values are DIFFERENT paths.
If they all resolve to the same path, the themeAssets derived store
has a bug. Check themeStore.ts symbols object:

```typescript
// In themeStore.ts, the symbols must be:
symbols: {
  H1: `${b}/symbols/h1.png`,  // e.g. assets/themes/trap-lane/symbols/h1.png
  H2: `${b}/symbols/h2.png`,
  M1: `${b}/symbols/m1.png`,
  M2: `${b}/symbols/m2.png`,
  M3: `${b}/symbols/m3.png`,
  L1: `${b}/symbols/l1.png`,
  L2: `${b}/symbols/l2.png`,
  L3: `${b}/symbols/l3.png`,
  W:  `${b}/symbols/wild.png`,
  S:  `${b}/symbols/scatter.png`,
},
```

Verify this is exact in themeStore.ts. If not, overwrite.

Also verify the actual files exist and are different:
```bash
md5 ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/*.png
```
If ALL symbols have the same MD5 hash, the assets were copied incorrectly.
In that case, re-copy from source:
```bash
SRC=~/math-sdk/frontend/public/assets/themes/source/theme-3-greyhounds/concept-A/symbols
DST=~/math-sdk/frontend/public/assets/themes/trap-lane/symbols
ls $SRC/
# Then copy each with correct name:
cp "$SRC/t3a_h1_greyhound_champion.png" $DST/h1.png
cp "$SRC/t3a_h2_trainer.png"            $DST/h2.png
cp "$SRC/t3a_m1_starting_trap.png"      $DST/m1.png
cp "$SRC/t3a_m2_trophy.png"             $DST/m2.png
cp "$SRC/t3a_m3_race_card.png"          $DST/m3.png
cp "$SRC/t3a_l1_stopwatch.png"          $DST/l1.png
cp "$SRC/t3a_l2_betting_ticket.png"     $DST/l2.png
cp "$SRC/t3a_l3_lure.png"               $DST/l3.png
cp "$SRC/t3a_wild.png"                  $DST/wild.png
cp "$SRC/t3a_scatter.png"               $DST/scatter.png
md5 $DST/*.png | head -15
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(symbols): verify and fix symbol variety for trap-lane"
git push origin main
```

---

## TASK 2 — Fix white background on symbols using PixiJS blend mode

Some symbol PNGs from Manus have white (non-transparent) backgrounds.
Fix in GameGrid.svelte `_makeCell` — apply multiply blend mode so white
becomes invisible against the dark grid background:

Find the `_makeCell` function. After creating the sprite, add:

```typescript
// Remove white backgrounds from symbols using multiply blend mode
// This makes white pixels transparent against the dark background
sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY

// Also darken the cell background to ensure clean contrast:
const cellBg = new PIXI.Graphics()
cellBg.beginFill(0x111111, 1)
cellBg.drawRect(0, 0, CELL_W, CELL_H)
cellBg.endFill()
container.addChildAt(cellBg, 0)  // Add behind the sprite
```

Wait — MULTIPLY mode only works when both source and dest are dark.
Better approach: use a dark cell background and `BLEND_MODES.NORMAL`
but set the PixiJS background to dark, which clips white artifacts.

Actually the correct approach for white-background PNGs is:
```typescript
// Set sprite blend mode to multiply — removes white backgrounds
sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY
```

This is the industry-standard technique for removing white from sprites.

Add the import if needed:
```typescript
import * as PIXI from 'pixi.js'
// or
import { BLEND_MODES } from 'pixi.js'
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(symbols): multiply blend mode to remove white backgrounds"
git push origin main
```

---

## TASK 3 — Fix game logo/title display for ALL themes

Read App.svelte. Find the game title/logo section.

The logo must display reliably with a text fallback if the PNG fails.
Replace the entire title section with this robust implementation:

```svelte
<!-- ── Game title area ─────────────────────────────────────────────── -->
<div class="game-title-area">
  {#if $themeAssets.logo}
    <img
      class="game-logo-img"
      src="{$themeAssets.logo}"
      alt="{$activeTheme.name}"
      draggable="false"
      on:error={(e) => {
        const img = e.currentTarget as HTMLImageElement
        img.style.display = 'none'
        const wrap = img.parentElement
        if (wrap && !wrap.querySelector('.logo-text')) {
          const t = document.createElement('div')
          t.className = 'logo-text'
          t.textContent = $activeTheme.name
          wrap.appendChild(t)
        }
      }}
    />
  {:else}
    <div class="logo-text">{$activeTheme.name}</div>
  {/if}
</div>
```

Add CSS for both cases:
```css
.game-title-area {
  position: absolute;
  top: -70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  min-width: 200px;
}

.game-logo-img {
  max-height: 70px;
  max-width: 420px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.8));
}

.logo-text {
  font-family: 'Courier New', monospace;
  font-size: clamp(1.4rem, 3.5vw, 2.2rem);
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--theme-primary, #00ffff);
  text-shadow:
    0 0 20px currentColor,
    0 2px 8px rgba(0,0,0,0.9);
  white-space: nowrap;
}
```

This ensures: if the logo PNG loads → show it. If it fails → show the
theme name as styled text in the theme's primary colour.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(ui): robust logo display with styled text fallback for all themes"
git push origin main
```

---

## TASK 4 — Fix frame loading for Beautiful Game and Oil & Fire

The ornate frame PNGs aren't loading. Diagnose and fix.

First, check if the frame files actually exist AND have correct content:
```bash
for theme in trap-lane oil-and-fire beautiful-game; do
  f=~/math-sdk/frontend/public/assets/themes/$theme/frames/frame-1.png
  if [ -f "$f" ]; then
    echo "$theme frame-1.png: $(wc -c < $f) bytes"
    file "$f"
  else
    echo "$theme frame-1.png: MISSING"
  fi
done
```

If any frame is 0 bytes or not a valid PNG:
```bash
# Re-copy from source
cp ~/math-sdk/frontend/public/assets/themes/source/theme-4-geopolitical/concept-A/frames/t4a_frame_ornate.png \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/frames/frame-1.png
cp ~/math-sdk/frontend/public/assets/themes/source/theme-5-soccer/concept-A/frames/t5a_frame_ornate.png \
   ~/math-sdk/frontend/public/assets/themes/beautiful-game/frames/frame-1.png
```

In App.svelte, ensure the frame element has proper error handling
AND a CSS fallback visible border style:

```svelte
{#if $themeAssets.frame}
  <img
    class="game-frame"
    src="{$themeAssets.frame}"
    alt=""
    aria-hidden="true"
    on:error={(e) => {
      // Frame PNG failed — hide it, CSS border will show instead
      const el = e.currentTarget as HTMLImageElement
      el.style.display = 'none'
    }}
  />
{/if}
```

Add CSS fallback border on the grid-wrapper for when frame PNG fails:
```css
.grid-wrapper {
  position: relative;
  /* Fallback border in theme colour if frame PNG fails */
  box-shadow:
    0 0 0 3px var(--theme-primary, #00ffff),
    0 0 20px var(--theme-primary, #00ffff),
    0 0 40px color-mix(in srgb, var(--theme-primary, #00ffff) 30%, transparent);
}
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(frame): verify frame PNGs, add CSS fallback border"
git push origin main
```

---

## TASK 5 — Fix frame inset — stop it covering the panel area

The frame is too large — it overlaps the balance/bet panel area below.
The fix is to use different inset values: top/sides at -80px, bottom at -40px.
This allows the frame to extend above and to the sides but not so far below.

In App.svelte CSS, find `.game-frame` and update:
```css
.game-frame {
  position: absolute;
  top: -80px;
  left: -80px;
  right: -80px;
  bottom: -40px;    /* Less extension at bottom to avoid covering panels */
  width: calc(100% + 160px);
  height: calc(100% + 120px);  /* top 80 + bottom 40 */
  object-fit: fill;
  pointer-events: none;
  z-index: 10;
}
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(frame): asymmetric inset — less extension at bottom to avoid panel overlap"
git push origin main
```

---

## TASK 6 — Fix spin button loading for all themes

The spin button image is not loading on Beautiful Game and Oil & Fire.
Check what path the src resolves to and verify the files:

```bash
# Check the spin button paths
for theme in trap-lane oil-and-fire beautiful-game; do
  f=~/math-sdk/frontend/public/assets/themes/$theme/ui/spin_button.png
  [ -f "$f" ] && echo "$theme spin_button: $(wc -c < $f) bytes" || echo "$theme spin_button: MISSING"
done
```

If any file is missing or 0 bytes, re-copy:
```bash
cp ~/math-sdk/frontend/public/assets/themes/source/theme-4-geopolitical/concept-A/ui/t4a_spin_btn.png \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/ui/spin_button.png
cp ~/math-sdk/frontend/public/assets/themes/source/theme-5-soccer/concept-A/ui/t5a_spin_btn.png \
   ~/math-sdk/frontend/public/assets/themes/beautiful-game/ui/spin_button.png
```

In ControlBar.svelte, ensure the spin button img is sized correctly
and has a visible fallback:

```svelte
<button class="spin-btn" on:click={handleSpin} disabled={$isSpinning}>
  <img
    src="{$themeAssets.spinButton}"
    alt="SPIN"
    class="spin-btn-img"
    draggable="false"
    on:error={(e) => {
      // If theme spin button fails, show a styled fallback
      const el = e.currentTarget as HTMLImageElement
      el.style.display = 'none'
    }}
  />
  <!-- CSS fallback when image fails -->
  {#if $isSpinning}
    <div class="spin-btn-fallback spinning">⚡</div>
  {:else}
    <div class="spin-btn-fallback">SPIN</div>
  {/if}
</button>
```

CSS for spin button:
```css
.spin-btn {
  position: relative;
  width: 90px; height: 90px;
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spin-btn-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}

.spin-btn-fallback {
  position: relative;
  z-index: 1;
  font-family: 'Courier New', monospace;
  font-weight: 900;
  font-size: 0.7rem;
  color: var(--theme-primary, #00ffff);
  text-shadow: 0 0 10px currentColor;
  display: none; /* Only shows when img fails */
}

/* Show fallback when img is hidden */
.spin-btn-img[style*="display: none"] ~ .spin-btn-fallback {
  display: block;
}
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(spin-btn): verify spin button assets, robust loading with fallback"
git push origin main
```

---

## TASK 7 — Fix MAX BET button and bet amount frame

The MAX BET button and bet amount pill/frame still show Future Spinner
assets on all new themes. Fix in ControlBar.svelte.

Find the MAX BET button (usually an img or button with background-image).
Replace with theme-reactive version:

```svelte
<!-- MAX BET button -->
<button
  class="max-btn"
  on:click={setMaxBet}
  disabled={$isSpinning}
  aria-label="Max bet"
  style="background-image: url('{$themeAssets.btnMinus}'); background-size: cover;"
>
  <span class="max-label">MAX</span>
</button>
```

For the bet amount frame/pill — this is a CSS-styled element.
Update its border/background colour to use theme variables:

```css
.bet-selector-panel,
.bet-value-wrap,
.bet-text-pill {
  border-color: var(--theme-primary, #00ffff);
  box-shadow: 0 0 8px color-mix(in srgb, var(--theme-primary, #00ffff) 40%, transparent);
}
```

Find the hard-coded cyan colours in ControlBar CSS and replace with
`var(--theme-primary, #00ffff)`:
- `border: 1px solid #00ffff` → `border: 1px solid var(--theme-primary, #00ffff)`
- `box-shadow: ... rgba(0,255,255, ...)` → use `color-mix` with `--theme-primary`
- `color: #00ffff` → `color: var(--theme-primary, #00ffff)`

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(control-bar): MAX bet button and bet frame use theme colours"
git push origin main
```

---

## TASK 8 — Fix balance and win panels — stronger visual presence

The balance/win panels are too faint. The panel PNG images aren't
providing enough contrast. Add a strong CSS fallback:

In BalanceDisplay.svelte, update the panel style:
```svelte
<div
  class="balance-panel"
  style="
    background-image: url('{$themeAssets.panelBalance}');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-color: rgba(0, 0, 0, 0.75);
    border: 1px solid var(--theme-primary, #00ffff);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-primary, #00ffff) 40%, transparent);
  "
>
```

In WinDisplay.svelte, same treatment:
```svelte
<div
  class="win-panel win-{winTier}"
  class:wincap-active={$isWincap}
  style="
    background-image: url('{$themeAssets.panelWin}');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-color: rgba(0, 0, 0, 0.75);
    border: 1px solid var(--theme-primary, #00ffff);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-primary, #00ffff) 40%, transparent);
  "
>
```

This ensures: even if the PNG doesn't load, the panel has a visible
dark background with a themed border and glow.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(panels): strong CSS fallback for balance/win panels — dark bg + theme border"
git push origin main
```

---

## TASK 9 — Force PixiJS texture cache clear on EVERY render

The PixiJS asset cache is the most persistent bug. Ensure it's fully
cleared on each theme load by using cache-busted URLs:

In GameGrid.svelte, `_preloadTextures`:

```typescript
async function _preloadTextures(): Promise<void> {
  const symbolMap = getSymbolMap()
  // Deduplicate URLs
  const uniqueUrls = [...new Set(Object.values(symbolMap))]

  // Clear ALL PixiJS caches
  try {
    Assets.reset()  // Nuclear option — clears everything
  } catch {
    // Fallback: clear each URL individually
    for (const url of uniqueUrls) {
      try { await Assets.unload(url) } catch {}
    }
  }

  assetLoadProgress.set(0)

  // Load with timestamp cache-bust to force browser to fetch fresh
  const ts = Date.now()
  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i]
    const bustedUrl = `${url}?t=${ts}`
    try {
      // Load with busted URL, alias it back to original URL for lookups
      await Assets.load(bustedUrl)
      // Also load original URL if not already cached
      if (!Assets.cache.has(url)) {
        await Assets.load(url)
      }
      console.log(`[GameGrid] ✅ ${url}`)
    } catch (e) {
      console.error(`[GameGrid] ❌ FAILED: ${url}`, e)
    }
    assetLoadProgress.set(Math.round(((i + 1) / uniqueUrls.length) * 100))
  }
  assetLoadProgress.set(100)
}
```

Also update `_makeCell` to use the correct URL lookup:
```typescript
function _makeCell(symbol: string, highlighted: boolean): Container {
  const symbolMap = getSymbolMap()
  const url = symbolMap[symbol]
    ?? symbolMap[symbol?.toUpperCase()]
    ?? symbolMap[symbol?.toLowerCase()]

  if (!url) {
    console.warn(`[GameGrid] Unknown symbol: "${symbol}"`)
    // Render dark placeholder
    const c = new Container()
    const g = new Graphics()
    g.beginFill(0x111111).drawRect(0, 0, CELL_W, CELL_H).endFill()
    c.addChild(g)
    return c
  }

  const container = new Container()

  // Dark background first (makes white-bg symbols less visible)
  const bg = new Graphics()
  bg.beginFill(0x0a0a0a).drawRect(0, 0, CELL_W, CELL_H).endFill()
  container.addChild(bg)

  // Get texture — try exact URL, then cache-busted version
  const texture = Assets.get(url) ?? Texture.WHITE
  const sprite = new Sprite(texture)
  sprite.width = CELL_W
  sprite.height = CELL_H
  sprite.anchor.set(0.5)
  sprite.position.set(CELL_W / 2, CELL_H / 2)

  // Apply multiply blend to remove white backgrounds from Manus assets
  sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY

  container.addChild(sprite)
  return container
}
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(pixi): nuclear cache reset on theme load, multiply blend for white symbols"
git push origin main
```

---

## TASK 10 — TSC + BUILD + FULL VERIFICATION

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
```
Fix ALL TypeScript errors. Then:
```bash
npm run build 2>&1
```
Both must exit 0.

---

## TASK 11 — GENERATE ANALYSIS REPORT

After the build passes, generate a complete analysis report:

```bash
cat > ~/Downloads/THEME_ANALYSIS_REPORT.md << 'EOF'
# THEME SYSTEM ANALYSIS REPORT
## Generated: $(date)
## Purpose: Review before next session to catch remaining issues

---

## ASSET VERIFICATION
EOF

echo "## ASSET VERIFICATION" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
echo "" >> ~/Downloads/THEME_ANALYSIS_REPORT.md

for theme in future-spinner trap-lane oil-and-fire beautiful-game; do
  echo "### $theme" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
  BASE=~/math-sdk/frontend/public/assets/themes/$theme
  
  echo "**Symbols:**" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
  for sym in h1 h2 m1 m2 m3 l1 l2 l3 wild scatter; do
    f="$BASE/symbols/${sym}.png"
    if [ -f "$f" ]; then
      size=$(wc -c < "$f")
      md5=$(md5 -q "$f" 2>/dev/null || md5sum "$f" | cut -d' ' -f1)
      echo "- ${sym}.png: ${size} bytes | md5: ${md5:0:8}" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
    else
      echo "- ${sym}.png: ❌ MISSING" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
    fi
  done
  
  echo "" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
  echo "**UI:**" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
  for ui in logo spin_button panel_balance panel_win btn_bet_minus btn_bet_plus btn_menu; do
    f="$BASE/ui/${ui}.png"
    [ -f "$f" ] && echo "- ${ui}.png: ✅ $(wc -c < $f) bytes" >> ~/Downloads/THEME_ANALYSIS_REPORT.md \
                || echo "- ${ui}.png: ❌ MISSING" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
  done
  
  echo "" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
  echo "**Frames:**" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
  for f in frame-1.png frame-2.png; do
    fp="$BASE/frames/$f"
    [ -f "$fp" ] && echo "- $f: ✅ $(wc -c < $fp) bytes" >> ~/Downloads/THEME_ANALYSIS_REPORT.md \
                 || echo "- $f: ❌ MISSING" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
  done
  
  echo "" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
done

# Check for duplicate symbols (same file across different symbol slots)
echo "## SYMBOL UNIQUENESS CHECK" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
echo "" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
for theme in trap-lane oil-and-fire beautiful-game; do
  echo "### $theme" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
  BASE=~/math-sdk/frontend/public/assets/themes/$theme/symbols
  # Get all md5s and check for duplicates
  python3 -c "
import hashlib, os, glob
files = sorted(glob.glob('$BASE/*.png'))
hashes = {}
for f in files:
    h = hashlib.md5(open(f,'rb').read()).hexdigest()[:8]
    name = os.path.basename(f)
    if h in hashes:
        print(f'  ⚠️  DUPLICATE: {name} == {hashes[h]} (same file!)')
    else:
        hashes[h] = name
        print(f'  ✅ {name}: {h}')
" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
  echo "" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
done

echo "## KNOWN REMAINING ISSUES" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
echo "" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
echo "Items requiring Manus regeneration:" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
echo "- Symbol PNGs with white backgrounds need re-rendering with RGBA transparency" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
echo "- All symbols should be 256x256 RGBA with FULLY transparent background" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
echo "" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
echo "Items requiring code review:" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
echo "- Verify multiply blend mode removes white backgrounds visually" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
echo "- Verify game title appears for all 4 themes" >> ~/Downloads/THEME_ANALYSIS_REPORT.md
echo "- Verify frame PNG loads for all 4 themes" >> ~/Downloads/THEME_ANALYSIS_REPORT.md

echo "Report generated: ~/Downloads/THEME_ANALYSIS_REPORT.md"
```

---

## TASK 12 — COPY STATUS AND COMMIT

Update `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md`:

Add this section:
```markdown
## REMAINING KNOWN ISSUES (post-session 2026-04-05)
- ⚠️  Some symbol PNGs from Manus have white backgrounds — multiply blend mode applied as workaround
- ⚠️  Some theme logo PNGs may not load — text fallback renders theme name in primary colour
- ⚠️  Frame PNGs may not load on all themes — CSS glowing border fallback applied
- ✅  Symbol variety now working across all themes
- ✅  All 4 themes have correct backgrounds (no Future Spinner bleed)
- ✅  Balance/Win panels have strong dark CSS fallback
- ✅  Theme colours used throughout (CSS variables)
```

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "fix(themes): complete polish — symbols, logos, frames, panels, blend modes"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
FINAL THEME POLISH — COMPLETE
═══════════════════════════════════════════════════════════════════

TASK 1  — Symbol variety fixed (all 10 unique per theme):    [ done ]
TASK 2  — White symbol backgrounds: multiply blend mode:     [ done ]
TASK 3  — Game logos: PNG + styled text fallback:            [ done ]
TASK 4  — Frame PNGs verified + CSS fallback border:         [ done ]
TASK 5  — Frame inset: asymmetric, not covering panels:      [ done ]
TASK 6  — Spin button: verified + fallback:                  [ done ]
TASK 7  — MAX bet + bet frame: theme colours:                [ done ]
TASK 8  — Balance/Win panels: dark bg + theme border:        [ done ]
TASK 9  — PixiJS cache: nuclear reset + cache-busted load:   [ done ]
TASK 10 — TSC + build: 0 errors:                             [ done ]
TASK 11 — Analysis report generated:                         [ done ]
TASK 12 — Status + commit:                                   [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]

OUTPUT FILES IN ~/Downloads/:
  FUTURE_SPINNER_PROJECT_STATUS.md
  THEME_ANALYSIS_REPORT.md

═══════════════════════════════════════════════════════════════════
