# FUTURE SPINNER — THREE TARGETED FIXES
## Fix only what is confirmed broken. No other changes.
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.
**Working directory:** ~/math-sdk/frontend/

---

## THE THREE PROBLEMS TO FIX

### PROBLEM 1 — MULTIPLY blend mode is blackening all symbols
`BLEND_MODES.MULTIPLY` was applied to fix white-background PNGs.
This was wrong. MULTIPLY against a dark background turns all
dark-coloured pixels black — destroying the symbol images entirely.

**Fix:** Remove MULTIPLY. Use a dark per-cell background instead.
The dark cell background will visually clip any white edges.

### PROBLEM 2 — Game title shows text AND logo simultaneously
The logo-text fallback div AND the logo PNG img both render at the
same time, causing overlapping text like "TR[NIGHT TRAP LOGO]NE".

**Fix:** Make them mutually exclusive — show text ONLY when image fails.

### PROBLEM 3 — Double border/frame on new themes
The CSS glow box-shadow AND the frame PNG are both showing at once,
creating a double border effect on Beautiful Game and Oil & Fire.

**Fix:** Remove the CSS glow from grid-wrapper — let the frame PNG
be the sole border. Use CSS only when the frame PNG explicitly fails.

---

## STEP 0 — READ FILES BEFORE CHANGING ANYTHING

```bash
# Find the MULTIPLY blend mode in GameGrid.svelte
grep -n "MULTIPLY\|blendMode\|BLEND_MODES" \
  ~/math-sdk/frontend/src/lib/components/GameGrid.svelte

# Find the logo rendering in App.svelte
grep -n "logo\|logo-text\|logo-img\|game-title" \
  ~/math-sdk/frontend/src/App.svelte

# Find the grid-wrapper box-shadow in App.svelte
grep -n "grid-wrapper\|box-shadow\|frame\|glow" \
  ~/math-sdk/frontend/src/App.svelte | head -30
```

Report exact line numbers for each. Then make the fixes below.

---

## FIX 1 — Remove MULTIPLY blend mode from GameGrid.svelte

In GameGrid.svelte, find every occurrence of:
- `BLEND_MODES.MULTIPLY`
- `blendMode = PIXI.BLEND_MODES.MULTIPLY`
- `blendMode = BLEND_MODES.MULTIPLY`
- `sprite.blendMode`

Remove ALL of them completely. The line should be deleted entirely.

Then find `_makeCell` function. Ensure the cell background is dark
so white-edge artifacts are minimised:

```typescript
function _makeCell(symbol: string, highlighted: boolean): Container {
  const symbolMap = getSymbolMap()
  const url = symbolMap[symbol]
    ?? symbolMap[symbol?.toUpperCase()]
    ?? symbolMap[symbol?.toLowerCase()]

  const container = new Container()

  // Dark cell background — visually clips minor white edges from symbols
  const bg = new Graphics()
  bg.beginFill(0x0d0d14)
  bg.drawRect(0, 0, CELL_W, CELL_H)
  bg.endFill()
  container.addChild(bg)

  if (!url) {
    console.warn(`[GameGrid] Unknown symbol: "${symbol}"`)
    return container
  }

  const texture = Assets.get(url) ?? Texture.WHITE
  if (texture === Texture.WHITE) {
    console.warn(`[GameGrid] Texture not loaded for: ${url}`)
  }

  const sprite = new Sprite(texture)
  sprite.width = CELL_W
  sprite.height = CELL_H
  sprite.anchor.set(0.5)
  sprite.position.set(CELL_W / 2, CELL_H / 2)
  // NO blendMode — use default NORMAL
  container.addChild(sprite)

  return container
}
```

Do NOT add any blendMode property at all. Leave it as default (NORMAL).

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(symbols): remove MULTIPLY blend mode — was blackening all symbols"
git push origin main
```

---

## FIX 2 — Fix double logo in App.svelte

Find the game title / logo section in App.svelte.
There is currently both a `.logo-text` div AND an `<img>` element
rendering simultaneously.

Replace the entire title section with this — the text ONLY shows
when the image is hidden (via on:error):

```svelte
<div class="game-title-area">
  <img
    class="game-logo-img"
    src="{$themeAssets.logo}"
    alt="{$activeTheme.name}"
    draggable="false"
    id="theme-logo-img"
    on:error={() => {
      const img = document.getElementById('theme-logo-img') as HTMLImageElement
      if (img) img.style.display = 'none'
      const txt = document.getElementById('theme-logo-txt')
      if (txt) (txt as HTMLElement).style.display = 'block'
    }}
  />
  <div
    class="logo-text"
    id="theme-logo-txt"
    style="display: none;"
  >
    {$activeTheme.name}
  </div>
</div>
```

The key change: `style="display: none;"` on the text div means it is
INVISIBLE by default. It only becomes visible if the img `on:error`
fires. This eliminates the overlap completely.

Add/update CSS:
```css
.game-title-area {
  position: absolute;
  top: -72px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  pointer-events: none;
}

.game-logo-img {
  max-height: 72px;
  max-width: 440px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 2px 12px rgba(0,0,0,0.9));
}

.logo-text {
  font-family: 'Courier New', monospace;
  font-size: clamp(1.5rem, 4vw, 2.4rem);
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--theme-primary, #00ffff);
  text-shadow:
    0 0 20px currentColor,
    0 0 40px color-mix(in srgb, currentColor 40%, transparent),
    0 2px 8px rgba(0,0,0,0.9);
  white-space: nowrap;
}
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(logo): text fallback hidden by default, only shows on img error"
git push origin main
```

---

## FIX 3 — Remove double border from grid-wrapper

Find `.grid-wrapper` in App.svelte CSS. Remove the box-shadow that
creates the CSS glow border. The frame PNG should be the only border.

```css
/* BEFORE — has CSS glow that conflicts with frame PNG */
.grid-wrapper {
  position: relative;
  box-shadow:
    0 0 0 3px var(--theme-primary, #00ffff),
    0 0 20px var(--theme-primary, #00ffff),
    ...;
}

/* AFTER — no CSS border, frame PNG is the sole border */
.grid-wrapper {
  position: relative;
  /* Frame PNG provides the border — no CSS border needed */
}
```

Remove the box-shadow from .grid-wrapper entirely.

The frame PNG is already positioned with negative inset to extend
beyond the grid — it IS the border. The CSS glow was a fallback that
is now causing a double-border on all themes including the good ones.

For themes where the frame PNG is blank/tiny (oil-and-fire, beautiful-game),
the grid will simply have no visible border from the PNG — that is
acceptable until proper frame PNGs are generated from Manus.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(frame): remove double CSS border from grid-wrapper"
git push origin main
```

---

## FIX 4 — TSC + Build + Verify

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0. Fix any TypeScript errors from removing blend mode.

---

## FIX 5 — Update status and commit

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "fix: three regressions fixed — blend mode, double logo, double border"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════
THREE TARGETED FIXES COMPLETE
═══════════════════════════════════════════════════════════════

FIX 1 — MULTIPLY blend mode removed:         [ done ]
  → Symbols now render with correct colours
  → Dark cell background clips white edges

FIX 2 — Logo text/image overlap fixed:       [ done ]
  → Text hidden by default (display:none)
  → Only appears if PNG fails to load
  → No more "TR[LOGO]NE" overlap

FIX 3 — Double border removed:               [ done ]
  → CSS box-shadow removed from grid-wrapper
  → Frame PNG is sole border
  → No more double border on any theme

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]

═══════════════════════════════════════════════════════════════

## WHAT STILL NEEDS MANUS (not fixable in code)

These require new assets from Manus — cannot be fixed in code:

1. Oil & Fire logo PNG — 729 bytes (blank). Need real logo PNG.
2. Beautiful Game logo PNG — 728 bytes (blank). Need real logo PNG.
3. Oil & Fire frame-1.png — 4KB (placeholder). Need real ornate frame.
4. Beautiful Game frame-1.png — 4KB (placeholder). Need real ornate frame.
5. Oil & Fire btn_menu.png — 260 bytes (blank). Need real button.
6. Beautiful Game btn_menu.png — 257 bytes (blank). Need real button.
7. Symbol white backgrounds — all 3 new themes have white-bg PNGs.
   Manus must re-render ALL symbols as RGBA with transparent backgrounds.
   Brief line to add: "RGBA PNG, 256x256, background alpha=0, no fill"

## HOW TO VIEW SOURCE IMAGES ON MAC

To browse all concept images before deciding which to use:
```bash
open ~/math-sdk/frontend/public/assets/themes/source/theme-3-greyhounds/concept-A/symbols/
open ~/math-sdk/frontend/public/assets/themes/source/theme-4-geopolitical/concept-A/symbols/
open ~/math-sdk/frontend/public/assets/themes/source/theme-5-soccer/concept-A/symbols/
```
In Finder: Select All (Cmd+A), then press Space bar.
Arrow keys to move through images. This is Quick Look — instant, no app needed.

═══════════════════════════════════════════════════════════════
