# FUTURE SPINNER — THEME SYSTEM COMPLETE FIX
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

## WHAT IS BROKEN (from visual audit)

1. **Symbols not loading for new themes** — GameGrid caches textures by
   URL. When theme switches and page reloads, old cached textures from
   previous session may conflict. The SYMBOL_TEXTURES map may still be
   hard-coded instead of reading from themeStore.

2. **Background not switching** — App.svelte video/image background
   still points to Future Spinner video even when other themes are active.
   The jpg background path for non-video themes isn't resolving correctly.

3. **Frame not switching** — Frame src may point to a non-existent file
   for new themes, falling back to CSS frame instead.

4. **ALL buttons unchanged** — ControlBar.svelte spin button, bet buttons,
   and utility buttons all still use hard-coded Future Spinner asset paths.
   They must read from themeStore.

5. **Frame inset too small on Trap Lane** — Frame extends -70px but the
   canvas is larger than it was on Future Spinner. Needs to be -80px to
   match all themes.

---

## STEP 0 — FULL READ BEFORE ANY CHANGES

```bash
# Read every file we are about to modify
cat ~/math-sdk/frontend/src/App.svelte
cat ~/math-sdk/frontend/src/lib/components/GameGrid.svelte
cat ~/math-sdk/frontend/src/lib/components/ControlBar.svelte
cat ~/math-sdk/frontend/src/lib/components/BalanceDisplay.svelte
cat ~/math-sdk/frontend/src/lib/components/WinDisplay.svelte
cat ~/math-sdk/frontend/src/lib/stores/themeStore.ts
cat ~/math-sdk/frontend/src/lib/config/themes.ts

# Check what theme assets actually exist on disk
echo "=== trap-lane assets ==="
ls ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/ 2>/dev/null || echo "MISSING"
ls ~/math-sdk/frontend/public/assets/themes/trap-lane/backgrounds/ 2>/dev/null || echo "MISSING"
ls ~/math-sdk/frontend/public/assets/themes/trap-lane/frames/ 2>/dev/null || echo "MISSING"
ls ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/ 2>/dev/null || echo "MISSING"
ls ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/ 2>/dev/null || echo "MISSING"

echo "=== beautiful-game assets ==="
ls ~/math-sdk/frontend/public/assets/themes/beautiful-game/symbols/ 2>/dev/null || echo "MISSING"
ls ~/math-sdk/frontend/public/assets/themes/beautiful-game/ui/ 2>/dev/null || echo "MISSING"

echo "=== oil-and-fire assets ==="
ls ~/math-sdk/frontend/public/assets/themes/oil-and-fire/symbols/ 2>/dev/null || echo "MISSING"
ls ~/math-sdk/frontend/public/assets/themes/oil-and-fire/ui/ 2>/dev/null || echo "MISSING"

cd ~/math-sdk/frontend && npx tsc --noEmit 2>&1
```

Report all findings. If any theme folder is MISSING, run the install
commands to copy from source before continuing:

```bash
# If trap-lane symbols are missing, copy from source:
SRC=~/math-sdk/frontend/public/assets/themes/source/theme-3-greyhounds

mkdir -p ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols
mkdir -p ~/math-sdk/frontend/public/assets/themes/trap-lane/backgrounds
mkdir -p ~/math-sdk/frontend/public/assets/themes/trap-lane/frames
mkdir -p ~/math-sdk/frontend/public/assets/themes/trap-lane/ui
mkdir -p ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds

cp "$SRC/concept-A/symbols/t3a_h1_greyhound_champion.png" ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/h1.png
cp "$SRC/concept-A/symbols/t3a_h2_trainer.png"            ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/h2.png
cp "$SRC/concept-A/symbols/t3a_m1_starting_trap.png"      ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/m1.png
cp "$SRC/concept-A/symbols/t3a_m2_trophy.png"             ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/m2.png
cp "$SRC/concept-A/symbols/t3a_m3_race_card.png"          ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/m3.png
cp "$SRC/concept-A/symbols/t3a_l1_stopwatch.png"          ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/l1.png
cp "$SRC/concept-A/symbols/t3a_l2_betting_ticket.png"     ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/l2.png
cp "$SRC/concept-A/symbols/t3a_l3_lure.png"               ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/l3.png
cp "$SRC/concept-A/symbols/t3a_wild.png"                  ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/wild.png
cp "$SRC/concept-A/symbols/t3a_scatter.png"               ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/scatter.png
cp "$SRC/concept-A/backgrounds/t3a_bg1_night_stadium.jpg" ~/math-sdk/frontend/public/assets/themes/trap-lane/backgrounds/bg-1.jpg
cp "$SRC/concept-A/backgrounds/t3a_bg2_starting_traps.jpg" ~/math-sdk/frontend/public/assets/themes/trap-lane/backgrounds/bg-2.jpg
cp "$SRC/concept-A/backgrounds/t3a_bg3_finish_line.jpg"   ~/math-sdk/frontend/public/assets/themes/trap-lane/backgrounds/bg-3.jpg
cp "$SRC/concept-A/frames/t3a_frame_ornate.png"           ~/math-sdk/frontend/public/assets/themes/trap-lane/frames/frame-1.png
cp "$SRC/concept-A/frames/t3a_frame_minimal.png"          ~/math-sdk/frontend/public/assets/themes/trap-lane/frames/frame-2.png
cp "$SRC/concept-A/ui/t3a_logo.png"                       ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/logo.png
cp "$SRC/concept-A/ui/t3a_spin_btn.png"                   ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/spin_button.png
cp "$SRC/concept-A/ui/t3a_balance_display.png"            ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/panel_balance.png
cp "$SRC/concept-A/ui/t3a_win_display.png"                ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/panel_win.png
cp "$SRC/concept-A/ui/t3a_bet_btn.png"                    ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/btn_bet_minus.png
cp "$SRC/concept-A/ui/t3a_bet_btn.png"                    ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/btn_bet_plus.png
cp "$SRC/concept-A/ui/t3a_info_btn.png"                   ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/btn_menu.png
cp "$SRC/audio/t3a_bg_music.mp3"                          ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/bgm_loop.mp3
cp "$SRC/audio/t3_spin_click.mp3"                         ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/spin.mp3
cp "$SRC/audio/t3_win_jingle_small.mp3"                   ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/win_small.mp3
cp "$SRC/audio/t3_win_jingle_big.mp3"                     ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/win_big.mp3
cp "$SRC/audio/t3_bonus_fanfare.mp3"                      ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/win_epic.mp3
cp "$SRC/audio/t3_scatter_trigger.mp3"                    ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/scatter_land.mp3
cp "$SRC/audio/t3_crowd_ambience.mp3"                     ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/bgm_tension.mp3
cp "$SRC/audio/t3_race_start_bell.mp3"                    ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/reel_stop.mp3
# Fallbacks from future-spinner for missing sounds
for s in reel_stop_anticipation win_medium anticipation_build ui_click; do
  cp ~/math-sdk/frontend/public/assets/themes/future-spinner/sounds/${s}.mp3 \
     ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/${s}.mp3 2>/dev/null || true
done
```

Do the same for oil-and-fire and beautiful-game if their assets are missing.
Use the source paths `theme-4-geopolitical` and `theme-5-soccer` respectively,
following the same pattern but with t4a_ and t5a_ prefixes.

---

## TASK 1 — Fix themeStore.ts — add ALL UI asset paths

Read current themeStore.ts. The themeAssets derived store is missing
the bet button paths and other UI elements. Update to include everything:

```typescript
export const themeAssets = derived(activeTheme, ($t) => ({
  symbols: {
    H1: `${$t.assetBase}/symbols/h1.png`,
    H2: `${$t.assetBase}/symbols/h2.png`,
    M1: `${$t.assetBase}/symbols/m1.png`,
    M2: `${$t.assetBase}/symbols/m2.png`,
    M3: `${$t.assetBase}/symbols/m3.png`,
    L1: `${$t.assetBase}/symbols/l1.png`,
    L2: `${$t.assetBase}/symbols/l2.png`,
    L3: `${$t.assetBase}/symbols/l3.png`,
    W:  `${$t.assetBase}/symbols/wild.png`,
    S:  `${$t.assetBase}/symbols/scatter.png`,
  },
  // Background — jpg for all new themes, mp4 for future-spinner
  background:   `${$t.assetBase}/backgrounds/bg-1.jpg`,
  backgroundMp4: `${$t.assetBase}/backgrounds/bg-1.mp4`,
  frame:        `${$t.assetBase}/frames/frame-1.png`,
  // UI elements — ALL must swap per theme
  spinButton:   `${$t.assetBase}/ui/spin_button.png`,
  panelBalance: `${$t.assetBase}/ui/panel_balance.png`,
  panelWin:     `${$t.assetBase}/ui/panel_win.png`,
  btnMinus:     `${$t.assetBase}/ui/btn_bet_minus.png`,
  btnPlus:      `${$t.assetBase}/ui/btn_bet_plus.png`,
  btnMenu:      `${$t.assetBase}/ui/btn_menu.png`,
  logo:         `${$t.assetBase}/ui/logo.png`,
  // Audio
  sounds: {
    bgm:                  `${$t.assetBase}/sounds/bgm_loop.mp3`,
    bgmTension:           `${$t.assetBase}/sounds/bgm_tension.mp3`,
    spin:                 `${$t.assetBase}/sounds/spin.mp3`,
    reelStop:             `${$t.assetBase}/sounds/reel_stop.mp3`,
    reelStopAnticipation: `${$t.assetBase}/sounds/reel_stop_anticipation.mp3`,
    winSmall:             `${$t.assetBase}/sounds/win_small.mp3`,
    winMedium:            `${$t.assetBase}/sounds/win_medium.mp3`,
    winBig:               `${$t.assetBase}/sounds/win_big.mp3`,
    winEpic:              `${$t.assetBase}/sounds/win_epic.mp3`,
    scatterLand:          `${$t.assetBase}/sounds/scatter_land.mp3`,
    anticipationBuild:    `${$t.assetBase}/sounds/anticipation_build.mp3`,
    uiClick:              `${$t.assetBase}/sounds/ui_click.mp3`,
  },
}))
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(themes): themeStore includes all UI asset paths"
git push origin main
```

---

## TASK 2 — Fix App.svelte background switching

Read App.svelte. Find the background section. The problem is:
1. The `<video>` element may always be shown regardless of theme
2. The jpg background path may not have a fallback

Replace the background section with proper video/image switching:

```svelte
<!-- Background — video for future-spinner, image for all other themes -->
<div class="bg-layer">
  {#if $activeTheme.id === 'future-spinner'}
    <video
      class="bg-video"
      autoplay loop muted playsinline aria-hidden="true"
    >
      <source src="{$themeAssets.backgroundMp4}" type="video/mp4" />
    </video>
  {:else}
    <img
      class="bg-video"
      src="{$themeAssets.background}"
      alt=""
      aria-hidden="true"
      style="object-fit: cover; width: 100%; height: 100%;"
    />
  {/if}
  <div class="bg-overlay"></div>
</div>
```

Also update the logo section — currently may still be using a hard-coded
path. Replace with:
```svelte
<img src="{$themeAssets.logo}" class="game-logo" alt="{$activeTheme.name}" draggable="false" />
```

And the frame:
```svelte
<img
  src="{$themeAssets.frame}"
  class="game-frame"
  alt=""
  aria-hidden="true"
  on:error={(e) => {
    // If frame image fails to load, hide it gracefully
    (e.currentTarget as HTMLImageElement).style.display = 'none'
  }}
/>
```

Update the `.game-frame` CSS inset to `-80px` for all themes:
```css
.game-frame {
  position: absolute;
  inset: -80px;
  width: calc(100% + 160px);
  height: calc(100% + 160px);
  object-fit: fill;
  pointer-events: none;
  z-index: 10;
  animation: frame-pulse 3s ease-in-out infinite;
}
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(themes): background switches video/image per theme, frame inset -80px"
git push origin main
```

---

## TASK 3 — Fix GameGrid.svelte — force texture reload on theme change

Read GameGrid.svelte. Find where SYMBOL_TEXTURES is defined and where
textures are loaded. The core problem is that PixiJS caches assets by
URL, and if the URL changes on theme switch but the cache still has the
old texture, it serves the wrong one.

**Fix: clear the PixiJS asset cache before loading new theme textures.**

Find `_preloadTextures` and update:

```typescript
async function _preloadTextures(): Promise<void> {
  // Get current theme's symbol paths from store
  const { get } = await import('svelte/store')
  const { themeAssets } = await import('../stores/themeStore')
  const assets = get(themeAssets)
  const SYMBOL_TEXTURES = assets.symbols

  assetLoadProgress.set(0)

  // Clear PixiJS asset cache to force fresh load for new theme
  try {
    for (const url of Object.values(SYMBOL_TEXTURES)) {
      if (Assets.cache.has(url)) {
        await Assets.unload(url).catch(() => {})
      }
    }
  } catch {
    // Ignore cache clear errors
  }

  try {
    await Assets.load(Object.values(SYMBOL_TEXTURES), (progress: number) => {
      assetLoadProgress.set(Math.round(progress * 100))
    })
  } catch (err) {
    console.warn('[GameGrid] Texture load error:', err)
    // Log individual failures
    for (const [key, url] of Object.entries(SYMBOL_TEXTURES)) {
      try {
        await Assets.load(url)
        console.log(`[GameGrid] ✅ ${key}: ${url}`)
      } catch (e) {
        console.error(`[GameGrid] ❌ FAILED: ${key}: ${url}`)
      }
    }
  }
  assetLoadProgress.set(100)
}
```

Also update `_makeCell` to read symbol textures dynamically:

```typescript
function _makeCell(symbol: string, highlighted: boolean): Container {
  const { get } = require('svelte/store')  // or use top-level import
  const SYMBOL_TEXTURES = getCurrentSymbolTextures()  // function that reads from store
  const url = SYMBOL_TEXTURES[symbol]
  // ... rest unchanged
}
```

Add a helper function at the top of the script:
```typescript
import { get } from 'svelte/store'
import { themeAssets } from '../stores/themeStore'

function getCurrentSymbolTextures(): Record<string, string> {
  return get(themeAssets).symbols
}
```

If `get` is already imported, just add the `themeAssets` import.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(themes): GameGrid clears PixiJS cache on theme switch, reads from store"
git push origin main
```

---

## TASK 4 — Fix ControlBar.svelte — all buttons from theme store

Read ControlBar.svelte in full. Find every hard-coded asset path:
- `/assets/ui/spin_button.png`
- `/assets/ui/btn_bet_minus.png` or `btn_bet_minus_v2.png`
- `/assets/ui/btn_bet_plus.png` or `btn_bet_plus_v2.png`
- `/assets/ui/btn_menu.png`
- `/assets/symbols/ui_spin_button_variant_03.png` (old path)
- Any other hard-coded `/assets/` paths

Add import at top of script:
```typescript
import { get } from 'svelte/store'
import { themeAssets } from '../stores/themeStore'
```

Replace each hard-coded img src with a reactive reference:
```svelte
<!-- Spin button -->
<img src="{$themeAssets.spinButton}" alt="SPIN" draggable="false" />

<!-- Bet minus button background -->
<!-- Find the nudge-btn[aria-label="Decrease bet"] and update: -->
<!-- In CSS, replace url('/assets/ui/btn_bet_minus_v2.png') with a style attribute -->
```

For the CSS-based button images (using background-image in CSS), you
cannot use Svelte reactive variables directly in `<style>`. Instead,
use inline style attributes on the button elements:

```svelte
<!-- Decrease bet button -->
<button
  class="nudge-btn"
  aria-label="Decrease bet"
  style="background-image: url('{$themeAssets.btnMinus}')"
  ...
>

<!-- Increase bet button -->
<button
  class="nudge-btn"
  aria-label="Increase bet"
  style="background-image: url('{$themeAssets.btnPlus}')"
  ...
>

<!-- Autoplay button -->
<button ... style="background-image: url('{$themeAssets.btnMenu}')">
```

For the spin button, update the `<img>` src directly:
```svelte
<img src="{$themeAssets.spinButton}" alt="SPIN" draggable="false" />
```

Remove any `background-image` from CSS for `.nudge-btn[aria-label=...]`
selectors since we're now using inline styles.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(themes): ControlBar reads all button assets from themeStore"
git push origin main
```

---

## TASK 5 — Fix BalanceDisplay and WinDisplay panels

Read BalanceDisplay.svelte and WinDisplay.svelte.

Both have background-image CSS pointing to hard-coded paths. Same
approach as Task 4 — use inline style:

In BalanceDisplay.svelte template, find the main panel container and add:
```svelte
<div class="balance-panel" style="background-image: url('{$themeAssets.panelBalance}')">
```

In WinDisplay.svelte template, find the win panel container and add:
```svelte
<div class="win-panel ..." style="background-image: url('{$themeAssets.panelWin}')">
```

Add the themeAssets import to both components:
```typescript
import { themeAssets } from '../stores/themeStore'
```

Remove the hard-coded `background-image` from the CSS for these panels
(since we're now using inline style). Keep all other CSS unchanged.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(themes): BalanceDisplay and WinDisplay panels from themeStore"
git push origin main
```

---

## TASK 6 — Fix soundService to reload on theme change

The soundService currently initialises sounds once at module load time.
When the theme changes and page reloads, it must pick up the new theme's
audio paths.

Read soundService.ts. The `buildSounds()` or `_initSounds()` function
should already read from themeAssets store. Verify it does.

If sounds are still hard-coded to `/assets/sounds/`, update to read
from the theme store:

```typescript
import { get } from 'svelte/store'
import { themeAssets } from '../stores/themeStore'

function buildSounds(): Record<string, HTMLAudioElement> {
  const paths = get(themeAssets).sounds
  // Use theme paths, fall back to future-spinner sounds if file doesn't exist
  function audio(url: string, fallback: string): HTMLAudioElement {
    const el = new Audio(url)
    el.addEventListener('error', () => {
      // If theme sound fails, load the future-spinner fallback
      el.src = fallback
    })
    return el
  }

  const base = 'assets/themes/future-spinner/sounds'
  return {
    bgm:                  audio(paths.bgm, `${base}/bgm_loop.mp3`),
    bgmTension:           audio(paths.bgmTension, `${base}/bgm_tension.mp3`),
    spin:                 audio(paths.spin, `${base}/spin.mp3`),
    reelStop:             audio(paths.reelStop, `${base}/reel_stop.mp3`),
    reelStopAnticipation: audio(paths.reelStopAnticipation, `${base}/reel_stop_anticipation.mp3`),
    winSmall:             audio(paths.winSmall, `${base}/win_small.mp3`),
    winMedium:            audio(paths.winMedium, `${base}/win_medium.mp3`),
    winBig:               audio(paths.winBig, `${base}/win_big.mp3`),
    winEpic:              audio(paths.winEpic, `${base}/win_epic.mp3`),
    scatterLand:          audio(paths.scatterLand, `${base}/scatter_land.mp3`),
    anticipationBuild:    audio(paths.anticipationBuild, `${base}/anticipation_build.mp3`),
    uiClick:              audio(paths.uiClick, `${base}/ui_click.mp3`),
  }
}
```

The fallback to future-spinner sounds means even if a new theme is
missing some sounds, the game won't break — it'll just use the
cyberpunk audio as a fallback.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(themes): soundService reads from themeStore with future-spinner fallbacks"
git push origin main
```

---

## TASK 7 — Apply theme palette colours as CSS variables

When a new theme loads, the colour palette should update globally —
win line colours, UI glow colours, etc. should match the theme.

In App.svelte, add a reactive block that sets CSS variables:

```svelte
<svelte:head>
  <style>
    :root {
      --theme-primary: {$activeTheme.palette.primary};
      --theme-secondary: {$activeTheme.palette.secondary};
      --theme-bg: {$activeTheme.palette.background};
    }
  </style>
</svelte:head>
```

Then in App.svelte CSS, replace hard-coded cyan/magenta colours with
CSS variables where appropriate:

```css
/* Frame glow uses theme primary colour */
@keyframes frame-pulse {
  0%, 100% { filter: drop-shadow(0 0 8px color-mix(in srgb, var(--theme-primary) 50%, transparent)); }
  50%       { filter: drop-shadow(0 0 20px color-mix(in srgb, var(--theme-primary) 90%, transparent)); }
}

/* Win banner uses theme colours */
/* The WinBanner component should also read --theme-primary */
```

In GameGrid.svelte, update the win line connector colour to use the
theme's primary colour instead of hard-coded gold `0xffd700`:

```typescript
// Convert CSS hex to PixiJS number for win line colour
function hexToPixi(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

// Use theme primary for win line
import { get } from 'svelte/store'
import { activeTheme } from '../stores/themeStore'

const winLineColour = hexToPixi(get(activeTheme).palette.primary)
// Use winLineColour instead of 0xffd700 in win line drawing
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(themes): CSS palette variables + theme-coloured win lines"
git push origin main
```

---

## TASK 8 — TSC + build + verify + status

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Fix all TypeScript errors. Both must exit 0.

**Verify assets exist for all themes:**
```bash
for theme in future-spinner trap-lane oil-and-fire beautiful-game; do
  echo "=== $theme ==="
  for f in symbols/h1.png symbols/wild.png frames/frame-1.png \
            ui/spin_button.png ui/panel_balance.png sounds/bgm_loop.mp3; do
    path=~/math-sdk/frontend/public/assets/themes/$theme/$f
    [ -f "$path" ] && echo "✅ $f" || echo "❌ MISSING: $f"
  done
done
```

Fix any missing assets by copying from the source folders or from
future-spinner as fallbacks.

Update ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md:

```markdown
## THEME SYSTEM STATUS
- ✅ 4 active themes: future-spinner, trap-lane, oil-and-fire, beautiful-game
- ✅ Background switches: video (future-spinner) / jpg (all others)
- ✅ Frame switches per theme (ornate PNG from each theme's assets)
- ✅ Logo switches per theme
- ✅ Spin button switches per theme
- ✅ Bet +/− buttons switch per theme
- ✅ Balance/win panels switch per theme
- ✅ Audio switches per theme (with future-spinner fallbacks)
- ✅ Symbols fully switch per theme (cache cleared on reload)
- ✅ Win line colour uses theme primary palette colour
- ✅ Frame inset -80px (larger, consistent across all themes)
```

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "fix(themes): complete theme switching — all assets swap correctly"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
FUTURE SPINNER — THEME SYSTEM COMPLETE FIX
═══════════════════════════════════════════════════════════════════

TASK 1 — themeStore has all UI paths:              [ done ]
TASK 2 — Background video/image switches:          [ done ]
TASK 3 — GameGrid clears cache, reloads symbols:   [ done ]
TASK 4 — ControlBar all buttons from store:        [ done ]
TASK 5 — Balance/Win panels from store:            [ done ]
TASK 6 — soundService from store + fallbacks:      [ done ]
TASK 7 — CSS palette variables, themed win lines:  [ done ]
TASK 8 — Build passing, all assets verified:       [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]
STATUS: [ copied to ~/Downloads/ ]

WHAT CHANGES ON THEME SWITCH:
  ✅ Background (video → image)
  ✅ Frame PNG
  ✅ Logo
  ✅ Spin button
  ✅ Bet +/− buttons
  ✅ Balance & Win panels
  ✅ All 10 symbols
  ✅ Audio (12 tracks)
  ✅ Win line colour
  ✅ UI glow colours (CSS variables)

═══════════════════════════════════════════════════════════════════
