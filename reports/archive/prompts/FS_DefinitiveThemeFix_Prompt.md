# FUTURE SPINNER — DEFINITIVE THEME SYSTEM OVERHAUL
## Read this file completely before touching any code.
## Execute every task in order. Do not skip steps.
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

## VISUAL AUDIT — WHAT IS BROKEN

From screenshots reviewed:

**Future Spinner** ✅ Working — title, frame, symbols, buttons, background all correct.

**Trap Lane (Night Trap):**
- ✅ Logo showing correctly
- ✅ Greyhound frame showing
- ❌ All 20 symbols show the SAME single image — texture cache bug
- ❌ Background still Future Spinner rain street, not greyhound stadium
- ❌ Spin button is a black circle (image not loading)
- ❌ Bet +/- buttons not loading theme versions
- ❌ Balance panel missing/transparent

**Oil & Fire (Geopolitical):**
- ✅ UN building background correct
- ❌ All 20 symbols same single book image — same texture cache bug
- ❌ No game title/logo (empty grey box at top)
- ❌ Spin button: black square (not loading)
- ❌ Auto button: black square (not loading)
- ❌ Frame: thin blue CSS fallback — PNG not loading
- ❌ Balance/Win panels: transparent/missing

**Beautiful Game (Soccer):**
- ✅ Stadium crowd background correct
- ❌ All 20 symbols same book image — same texture cache bug (same book as Geopolitical!)
- ❌ No game title/logo
- ❌ All buttons black squares
- ❌ Frame: thin CSS fallback
- ❌ Panels missing

**Root causes identified:**
1. Symbol files were not copied to the themes/ folder with standard names
2. PixiJS SYMBOL_TEXTURES map still maps old symbol keys (H1/H2 etc) to hard-coded paths
3. App.svelte logo/title not reading from theme store
4. ControlBar buttons not reading from theme store
5. BalanceDisplay/WinDisplay panels not reading from theme store
6. Background switching still not working for Trap Lane (still shows video)

---

## STEP 0 — VERIFY ALL SOURCE FILES EXIST

```bash
echo "=== SOURCE BASE ==="
ls ~/math-sdk/frontend/public/assets/themes/source/ 2>/dev/null || \
  echo "ERROR: source directory missing"

echo ""
echo "=== CHECKING THEME ASSET DIRECTORIES ==="
for theme in future-spinner trap-lane oil-and-fire beautiful-game; do
  echo "--- $theme ---"
  ls ~/math-sdk/frontend/public/assets/themes/$theme/symbols/ 2>/dev/null | wc -l | xargs echo "symbols:"
  ls ~/math-sdk/frontend/public/assets/themes/$theme/backgrounds/ 2>/dev/null | wc -l | xargs echo "backgrounds:"
  ls ~/math-sdk/frontend/public/assets/themes/$theme/frames/ 2>/dev/null | wc -l | xargs echo "frames:"
  ls ~/math-sdk/frontend/public/assets/themes/$theme/ui/ 2>/dev/null | wc -l | xargs echo "ui:"
  ls ~/math-sdk/frontend/public/assets/themes/$theme/sounds/ 2>/dev/null | wc -l | xargs echo "sounds:"
done
```

Report all counts. Then proceed regardless — Tasks 1-3 will fix any missing files.

---

## TASK 1 — INSTALL TRAP LANE ASSETS (exact filenames confirmed)

Source: `~/math-sdk/frontend/public/assets/themes/source/theme-3-greyhounds/concept-A/`

```bash
SRC=~/math-sdk/frontend/public/assets/themes/source/theme-3-greyhounds/concept-A
DST=~/math-sdk/frontend/public/assets/themes/trap-lane

mkdir -p $DST/symbols $DST/backgrounds $DST/frames $DST/ui $DST/sounds

# --- SYMBOLS (exact source filenames → standard target names) ---
cp "$SRC/symbols/t3a_h1_greyhound_champion.png" $DST/symbols/h1.png
cp "$SRC/symbols/t3a_h2_trainer.png"            $DST/symbols/h2.png
cp "$SRC/symbols/t3a_m1_starting_trap.png"      $DST/symbols/m1.png
cp "$SRC/symbols/t3a_m2_trophy.png"             $DST/symbols/m2.png
cp "$SRC/symbols/t3a_m3_race_card.png"          $DST/symbols/m3.png
cp "$SRC/symbols/t3a_l1_stopwatch.png"          $DST/symbols/l1.png
cp "$SRC/symbols/t3a_l2_betting_ticket.png"     $DST/symbols/l2.png
cp "$SRC/symbols/t3a_l3_lure.png"               $DST/symbols/l3.png
cp "$SRC/symbols/t3a_wild.png"                  $DST/symbols/wild.png
cp "$SRC/symbols/t3a_scatter.png"               $DST/symbols/scatter.png

# --- BACKGROUNDS (exact filenames) ---
cp "$SRC/backgrounds/t3a_bg1_night_stadium.jpg" $DST/backgrounds/bg-1.jpg
cp "$SRC/backgrounds/t3a_bg2_starting_traps.jpg" $DST/backgrounds/bg-2.jpg
cp "$SRC/backgrounds/t3a_bg3_finish_line.jpg"   $DST/backgrounds/bg-3.jpg

# --- FRAMES ---
cp "$SRC/frames/t3a_frame_ornate.png"           $DST/frames/frame-1.png
cp "$SRC/frames/t3a_frame_minimal.png"          $DST/frames/frame-2.png

# --- UI ---
cp "$SRC/ui/t3a_logo.png"                       $DST/ui/logo.png
cp "$SRC/ui/t3a_spin_btn.png"                   $DST/ui/spin_button.png
cp "$SRC/ui/t3a_balance_display.png"            $DST/ui/panel_balance.png
cp "$SRC/ui/t3a_win_display.png"                $DST/ui/panel_win.png
cp "$SRC/ui/t3a_bet_btn.png"                    $DST/ui/btn_bet_minus.png
cp "$SRC/ui/t3a_bet_btn.png"                    $DST/ui/btn_bet_plus.png
cp "$SRC/ui/t3a_info_btn.png"                   $DST/ui/btn_menu.png
# Autoplay button — reuse info btn if no dedicated one
cp "$SRC/ui/t3a_info_btn.png"                   $DST/ui/btn_autoplay.png

# --- AUDIO (from theme-level audio folder) ---
ASRC=~/math-sdk/frontend/public/assets/themes/source/theme-3-greyhounds/audio
cp "$ASRC/t3a_bg_music.mp3"          $DST/sounds/bgm_loop.mp3
cp "$ASRC/t3_crowd_ambience.mp3"     $DST/sounds/bgm_tension.mp3
cp "$ASRC/t3_spin_click.mp3"         $DST/sounds/spin.mp3
cp "$ASRC/t3_race_start_bell.mp3"    $DST/sounds/reel_stop.mp3
cp "$ASRC/t3_win_jingle_small.mp3"   $DST/sounds/win_small.mp3
cp "$ASRC/t3_win_jingle_big.mp3"     $DST/sounds/win_big.mp3
cp "$ASRC/t3_bonus_fanfare.mp3"      $DST/sounds/win_epic.mp3
cp "$ASRC/t3_scatter_trigger.mp3"    $DST/sounds/scatter_land.mp3

# Fallbacks from Future Spinner for sounds not in this theme
FS=~/math-sdk/frontend/public/assets/themes/future-spinner/sounds
for s in reel_stop_anticipation win_medium anticipation_build ui_click; do
  [ -f "$FS/${s}.mp3" ] && cp "$FS/${s}.mp3" $DST/sounds/${s}.mp3 || true
done

echo "=== TRAP LANE INSTALL VERIFY ==="
echo "Symbols: $(ls $DST/symbols/ | wc -l) (expect 10)"
echo "Backgrounds: $(ls $DST/backgrounds/ | wc -l) (expect 3)"
echo "Frames: $(ls $DST/frames/ | wc -l) (expect 2)"
echo "UI: $(ls $DST/ui/ | wc -l) (expect 8)"
echo "Sounds: $(ls $DST/sounds/ | wc -l) (expect 12)"
ls $DST/symbols/
```

Commit:
```bash
cd ~/math-sdk && git add public/assets/themes/trap-lane/
git commit -m "feat(assets): trap-lane theme assets fully installed with standard names"
git push origin main
```

---

## TASK 2 — INSTALL OIL & FIRE ASSETS

Source: `theme-4-geopolitical/concept-A/`
Note: This theme has 11 source symbols (h1-h3, m1-m3, l1-l3, wild, scatter).
Map h3→m1, m1→m2, m2→m3, m3→l1, l1→l2, l2→l3. Drop one low symbol.

```bash
SRC=~/math-sdk/frontend/public/assets/themes/source/theme-4-geopolitical/concept-A
DST=~/math-sdk/frontend/public/assets/themes/oil-and-fire

mkdir -p $DST/symbols $DST/backgrounds $DST/frames $DST/ui $DST/sounds

# --- SYMBOLS (11 source → 10 game slots) ---
cp "$SRC/symbols/t4a_h1.png"     $DST/symbols/h1.png
cp "$SRC/symbols/t4a_h2.png"     $DST/symbols/h2.png
cp "$SRC/symbols/t4a_h3.png"     $DST/symbols/m1.png
cp "$SRC/symbols/t4a_m1.png"     $DST/symbols/m2.png
cp "$SRC/symbols/t4a_m2.png"     $DST/symbols/m3.png
cp "$SRC/symbols/t4a_m3.png"     $DST/symbols/l1.png
cp "$SRC/symbols/t4a_l1.png"     $DST/symbols/l2.png
cp "$SRC/symbols/t4a_l2.png"     $DST/symbols/l3.png
cp "$SRC/symbols/t4a_wild.png"   $DST/symbols/wild.png
cp "$SRC/symbols/t4a_scatter.png" $DST/symbols/scatter.png

# --- BACKGROUNDS ---
cp "$SRC/backgrounds/t4a_bg1_un_headquarters.jpg"  $DST/backgrounds/bg-1.jpg
cp "$SRC/backgrounds/t4a_bg2_diplomatic_hall.jpg"  $DST/backgrounds/bg-2.jpg
cp "$SRC/backgrounds/t4a_bg3_world_map.jpg"        $DST/backgrounds/bg-3.jpg

# --- FRAMES ---
cp "$SRC/frames/t4a_frame_ornate.png"   $DST/frames/frame-1.png
cp "$SRC/frames/t4a_frame_minimal.png"  $DST/frames/frame-2.png

# --- UI ---
cp "$SRC/ui/t4a_logo.png"              $DST/ui/logo.png
cp "$SRC/ui/t4a_spin_btn.png"          $DST/ui/spin_button.png
cp "$SRC/ui/t4a_balance_display.png"   $DST/ui/panel_balance.png
cp "$SRC/ui/t4a_win_display.png"       $DST/ui/panel_win.png
cp "$SRC/ui/t4a_bet_btn.png"           $DST/ui/btn_bet_minus.png
cp "$SRC/ui/t4a_bet_btn.png"           $DST/ui/btn_bet_plus.png
cp "$SRC/ui/t4a_info_btn.png"          $DST/ui/btn_menu.png
cp "$SRC/ui/t4a_info_btn.png"          $DST/ui/btn_autoplay.png

# --- AUDIO ---
ASRC=~/math-sdk/frontend/public/assets/themes/source/theme-4-geopolitical/audio
cp "$ASRC/t4a_bg_music.mp3"          $DST/sounds/bgm_loop.mp3
cp "$ASRC/t4_tension_sting.mp3"      $DST/sounds/bgm_tension.mp3
cp "$ASRC/t4_spin_click.mp3"         $DST/sounds/spin.mp3
cp "$ASRC/t4_diplomatic_ambience.mp3" $DST/sounds/reel_stop.mp3
cp "$ASRC/t4_win_jingle_small.mp3"   $DST/sounds/win_small.mp3
cp "$ASRC/t4_win_jingle_big.mp3"     $DST/sounds/win_big.mp3
cp "$ASRC/t4_bonus_fanfare.mp3"      $DST/sounds/win_epic.mp3
cp "$ASRC/t4_scatter_trigger.mp3"    $DST/sounds/scatter_land.mp3

FS=~/math-sdk/frontend/public/assets/themes/future-spinner/sounds
for s in reel_stop_anticipation win_medium anticipation_build ui_click; do
  [ -f "$FS/${s}.mp3" ] && cp "$FS/${s}.mp3" $DST/sounds/${s}.mp3 || true
done

echo "=== OIL & FIRE VERIFY ==="
echo "Symbols: $(ls $DST/symbols/ | wc -l) (expect 10)"
ls $DST/symbols/
```

Commit:
```bash
cd ~/math-sdk && git add public/assets/themes/oil-and-fire/
git commit -m "feat(assets): oil-and-fire theme assets fully installed"
git push origin main
```

---

## TASK 3 — INSTALL BEAUTIFUL GAME ASSETS

Source: `theme-5-soccer/concept-A/`
Same 11→10 symbol mapping as Geopolitical.

```bash
SRC=~/math-sdk/frontend/public/assets/themes/source/theme-5-soccer/concept-A
DST=~/math-sdk/frontend/public/assets/themes/beautiful-game

mkdir -p $DST/symbols $DST/backgrounds $DST/frames $DST/ui $DST/sounds

# --- SYMBOLS ---
cp "$SRC/symbols/t5a_h1.png"     $DST/symbols/h1.png
cp "$SRC/symbols/t5a_h2.png"     $DST/symbols/h2.png
cp "$SRC/symbols/t5a_h3.png"     $DST/symbols/m1.png
cp "$SRC/symbols/t5a_m1.png"     $DST/symbols/m2.png
cp "$SRC/symbols/t5a_m2.png"     $DST/symbols/m3.png
cp "$SRC/symbols/t5a_m3.png"     $DST/symbols/l1.png
cp "$SRC/symbols/t5a_l1.png"     $DST/symbols/l2.png
cp "$SRC/symbols/t5a_l2.png"     $DST/symbols/l3.png
cp "$SRC/symbols/t5a_wild.png"   $DST/symbols/wild.png
cp "$SRC/symbols/t5a_scatter.png" $DST/symbols/scatter.png

# --- BACKGROUNDS ---
cp "$SRC/backgrounds/t5a_bg1_cl_stadium_night.jpg" $DST/backgrounds/bg-1.jpg
cp "$SRC/backgrounds/t5a_bg2_cl_trophy_room.jpg"   $DST/backgrounds/bg-2.jpg
cp "$SRC/backgrounds/t5a_bg3_cl_tunnel.jpg"        $DST/backgrounds/bg-3.jpg

# --- FRAMES ---
cp "$SRC/frames/t5a_frame_ornate.png"   $DST/frames/frame-1.png
cp "$SRC/frames/t5a_frame_minimal.png"  $DST/frames/frame-2.png

# --- UI ---
cp "$SRC/ui/t5a_logo.png"              $DST/ui/logo.png
cp "$SRC/ui/t5a_spin_btn.png"          $DST/ui/spin_button.png
cp "$SRC/ui/t5a_balance_display.png"   $DST/ui/panel_balance.png
cp "$SRC/ui/t5a_win_display.png"       $DST/ui/panel_win.png
cp "$SRC/ui/t5a_bet_btn.png"           $DST/ui/btn_bet_minus.png
cp "$SRC/ui/t5a_bet_btn.png"           $DST/ui/btn_bet_plus.png
cp "$SRC/ui/t5a_info_btn.png"          $DST/ui/btn_menu.png
cp "$SRC/ui/t5a_info_btn.png"          $DST/ui/btn_autoplay.png

# --- AUDIO ---
ASRC=~/math-sdk/frontend/public/assets/themes/source/theme-5-soccer/audio
cp "$ASRC/t5a_bg_music.mp3"          $DST/sounds/bgm_loop.mp3
cp "$ASRC/t5_crowd_roar.mp3"         $DST/sounds/bgm_tension.mp3
cp "$ASRC/t5_spin_click.mp3"         $DST/sounds/spin.mp3
cp "$ASRC/t5_referee_whistle.mp3"    $DST/sounds/reel_stop.mp3
cp "$ASRC/t5_win_jingle_small.mp3"   $DST/sounds/win_small.mp3
cp "$ASRC/t5_win_jingle_big.mp3"     $DST/sounds/win_big.mp3
cp "$ASRC/t5_bonus_fanfare.mp3"      $DST/sounds/win_epic.mp3
cp "$ASRC/t5_goal_horn.mp3"          $DST/sounds/anticipation_build.mp3

# Soccer has no t5_scatter_trigger — use Future Spinner fallback
FS=~/math-sdk/frontend/public/assets/themes/future-spinner/sounds
cp "$FS/scatter_land.mp3"     $DST/sounds/scatter_land.mp3
for s in reel_stop_anticipation win_medium ui_click; do
  [ -f "$FS/${s}.mp3" ] && cp "$FS/${s}.mp3" $DST/sounds/${s}.mp3 || true
done

echo "=== BEAUTIFUL GAME VERIFY ==="
echo "Symbols: $(ls $DST/symbols/ | wc -l) (expect 10)"
ls $DST/symbols/
```

Commit:
```bash
cd ~/math-sdk && git add public/assets/themes/beautiful-game/
git commit -m "feat(assets): beautiful-game theme assets fully installed"
git push origin main
```

---

## TASK 4 — FINAL ASSET INTEGRITY CHECK

Before touching any code, verify ALL assets resolve correctly:

```bash
echo "============================================"
echo "FULL ASSET INTEGRITY AUDIT"
echo "============================================"

PASS=0
FAIL=0

check() {
  if [ -f "$1" ]; then
    PASS=$((PASS+1))
  else
    echo "❌ MISSING: $1"
    FAIL=$((FAIL+1))
  fi
}

for theme in future-spinner trap-lane oil-and-fire beautiful-game; do
  BASE=~/math-sdk/frontend/public/assets/themes/$theme
  echo "--- $theme ---"
  for sym in h1 h2 m1 m2 m3 l1 l2 l3 wild scatter; do
    check "$BASE/symbols/${sym}.png"
  done
  check "$BASE/backgrounds/bg-1.jpg"
  check "$BASE/frames/frame-1.png"
  check "$BASE/ui/logo.png"
  check "$BASE/ui/spin_button.png"
  check "$BASE/ui/panel_balance.png"
  check "$BASE/ui/panel_win.png"
  check "$BASE/ui/btn_bet_minus.png"
  check "$BASE/ui/btn_bet_plus.png"
  check "$BASE/ui/btn_menu.png"
  check "$BASE/sounds/bgm_loop.mp3"
  check "$BASE/sounds/spin.mp3"
  check "$BASE/sounds/win_small.mp3"
  check "$BASE/sounds/win_big.mp3"
done

echo ""
echo "AUDIT RESULT: $PASS passed, $FAIL failed"
[ $FAIL -gt 0 ] && echo "FIX ALL MISSING FILES BEFORE CONTINUING" || echo "ALL ASSETS PRESENT ✅"
```

**If any files are missing, fix them now before moving to Task 5.**
Do not proceed with code changes until FAIL = 0.

---

## TASK 5 — REWRITE themeStore.ts COMPLETELY

Overwrite `src/lib/stores/themeStore.ts` with this complete version:

```typescript
// themeStore.ts — Reactive theme state — We Roll Spinners
// All asset paths derived from active theme. Every UI element reads from here.

import { writable, derived } from 'svelte/store'
import {
  type ThemeConfig,
  THEMES,
  DEFAULT_THEME_ID,
  getTheme,
} from '../config/themes'

// ── Persistence ────────────────────────────────────────────────────────────
function loadSavedTheme(): ThemeConfig {
  try {
    const id = localStorage.getItem('wrs_theme') ?? DEFAULT_THEME_ID
    return getTheme(id)
  } catch {
    return getTheme(DEFAULT_THEME_ID)
  }
}

export function switchTheme(id: string): void {
  try { localStorage.setItem('wrs_theme', id) } catch {}
  activeTheme.set(getTheme(id))
}

// ── Active theme store ──────────────────────────────────────────────────────
export const activeTheme = writable<ThemeConfig>(loadSavedTheme())

// ── All derived asset paths ─────────────────────────────────────────────────
export const themeAssets = derived(activeTheme, ($t) => {
  const b = $t.assetBase
  return {
    // Symbols — standard names, theme folder changes
    symbols: {
      H1:     `${b}/symbols/h1.png`,
      H2:     `${b}/symbols/h2.png`,
      M1:     `${b}/symbols/m1.png`,
      M2:     `${b}/symbols/m2.png`,
      M3:     `${b}/symbols/m3.png`,
      L1:     `${b}/symbols/l1.png`,
      L2:     `${b}/symbols/l2.png`,
      L3:     `${b}/symbols/l3.png`,
      W:      `${b}/symbols/wild.png`,
      S:      `${b}/symbols/scatter.png`,
    },
    // Background
    background:      `${b}/backgrounds/bg-1.jpg`,
    backgroundVideo: `${b}/backgrounds/bg-1.mp4`,
    isVideo:         $t.id === 'future-spinner',
    // Frame
    frame:           `${b}/frames/frame-1.png`,
    // Logo
    logo:            `${b}/ui/logo.png`,
    // Buttons
    spinButton:      `${b}/ui/spin_button.png`,
    btnMinus:        `${b}/ui/btn_bet_minus.png`,
    btnPlus:         `${b}/ui/btn_bet_plus.png`,
    btnAutoplay:     `${b}/ui/btn_autoplay.png`,
    btnMenu:         `${b}/ui/btn_menu.png`,
    // Panels
    panelBalance:    `${b}/ui/panel_balance.png`,
    panelWin:        `${b}/ui/panel_win.png`,
    // Audio
    sounds: {
      bgm:                  `${b}/sounds/bgm_loop.mp3`,
      bgmTension:           `${b}/sounds/bgm_tension.mp3`,
      spin:                 `${b}/sounds/spin.mp3`,
      reelStop:             `${b}/sounds/reel_stop.mp3`,
      reelStopAnticipation: `${b}/sounds/reel_stop_anticipation.mp3`,
      winSmall:             `${b}/sounds/win_small.mp3`,
      winMedium:            `${b}/sounds/win_medium.mp3`,
      winBig:               `${b}/sounds/win_big.mp3`,
      winEpic:              `${b}/sounds/win_epic.mp3`,
      scatterLand:          `${b}/sounds/scatter_land.mp3`,
      anticipationBuild:    `${b}/sounds/anticipation_build.mp3`,
      uiClick:              `${b}/sounds/ui_click.mp3`,
    },
  }
})

export const themePalette = derived(activeTheme, ($t) => $t.palette)
export { THEMES }
```

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/stores/themeStore.ts
git commit -m "fix(themes): rewrite themeStore with complete asset paths"
git push origin main
```

---

## TASK 6 — FIX GameGrid.svelte — SYMBOL TEXTURE LOADING

Read GameGrid.svelte completely. The critical problem is that all
symbols show as one image — PixiJS is caching by URL and serving
stale or fallback textures.

**Find the SYMBOL_TEXTURES constant or map.** It likely still has
hard-coded paths like `/assets/symbols/h1_futuristic_rim.png`.

Replace with a dynamic function that reads from themeStore:

```typescript
// At the TOP of the <script> block, add these imports:
import { get } from 'svelte/store'
import { themeAssets } from '../stores/themeStore'

// Replace SYMBOL_TEXTURES constant with a function:
function getSymbolMap(): Record<string, string> {
  const assets = get(themeAssets)
  return {
    H1: assets.symbols.H1,
    H2: assets.symbols.H2,
    M1: assets.symbols.M1,
    M2: assets.symbols.M2,
    M3: assets.symbols.M3,
    L1: assets.symbols.L1,
    L2: assets.symbols.L2,
    L3: assets.symbols.L3,
    W:  assets.symbols.W,
    S:  assets.symbols.S,
    // Also add lowercase aliases in case board data uses lowercase
    h1: assets.symbols.H1,
    h2: assets.symbols.H2,
    m1: assets.symbols.M1,
    m2: assets.symbols.M2,
    m3: assets.symbols.M3,
    l1: assets.symbols.L1,
    l2: assets.symbols.L2,
    l3: assets.symbols.L3,
    w:  assets.symbols.W,
    s:  assets.symbols.S,
  }
}
```

**Fix _preloadTextures** — clear cache completely before loading:

```typescript
async function _preloadTextures(): Promise<void> {
  const symbolMap = getSymbolMap()
  const urls = Object.values(symbolMap)
  // Deduplicate URLs
  const uniqueUrls = [...new Set(urls)]

  assetLoadProgress.set(0)

  // Force-unload any cached versions to prevent stale textures
  for (const url of uniqueUrls) {
    try {
      if (Assets.cache.has(url)) {
        await Assets.unload(url)
      }
    } catch { /* ignore */ }
  }

  // Load with cache-busting query string to force fresh load
  const cacheBust = Date.now()
  const bustedUrls = uniqueUrls.map(u => `${u}?v=${cacheBust}`)

  try {
    // Load busted URLs but store originals in cache
    for (let i = 0; i < uniqueUrls.length; i++) {
      await Assets.load(uniqueUrls[i])
      assetLoadProgress.set(Math.round(((i + 1) / uniqueUrls.length) * 100))
    }
  } catch (err) {
    // Load individually and log failures
    for (const url of uniqueUrls) {
      try {
        await Assets.load(url)
        console.log(`[GameGrid] ✅ Loaded: ${url}`)
      } catch (e) {
        console.error(`[GameGrid] ❌ FAILED: ${url}`, e)
      }
    }
  }
  assetLoadProgress.set(100)
}
```

**Fix _makeCell** — use getSymbolMap() for every cell:

```typescript
function _makeCell(symbol: string, _highlighted: boolean): Container {
  const symbolMap = getSymbolMap()

  // Try exact key, then uppercase, then fallback
  const url = symbolMap[symbol]
    ?? symbolMap[symbol?.toUpperCase()]
    ?? symbolMap[symbol?.toLowerCase()]

  if (!url) {
    console.warn(`[GameGrid] Unknown symbol: "${symbol}" — available: ${Object.keys(symbolMap).join(', ')}`)
  }

  const container = new Container()

  if (url) {
    try {
      const texture = Assets.get(url) ?? Texture.WHITE
      const sprite = new Sprite(texture)
      sprite.width = CELL_W
      sprite.height = CELL_H
      sprite.anchor.set(0.5)
      sprite.position.set(CELL_W / 2, CELL_H / 2)
      container.addChild(sprite)
    } catch (err) {
      console.error(`[GameGrid] Sprite error for ${symbol}:`, err)
    }
  }

  return container
}
```

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/GameGrid.svelte
git commit -m "fix(themes): GameGrid reads symbols from themeStore, clears cache on load"
git push origin main
```

---

## TASK 7 — FIX App.svelte COMPLETELY

Read App.svelte in full. Then make ALL of these changes:

**A — Add imports at top of script:**
```typescript
import { activeTheme, themeAssets, switchTheme } from './lib/stores/themeStore'
import ThemeSelector from './lib/components/ThemeSelector.svelte'
let showThemeSelector = false
```

**B — Replace the background element.**
Find the `<video>` element. Replace the entire background block with:

```svelte
<div class="bg-layer">
  {#if $themeAssets.isVideo}
    <video
      class="bg-media"
      autoplay loop muted playsinline aria-hidden="true"
      key={$activeTheme.id}
    >
      <source src="{$themeAssets.backgroundVideo}" type="video/mp4" />
    </video>
  {:else}
    <img
      class="bg-media"
      src="{$themeAssets.background}"
      alt=""
      aria-hidden="true"
      key={$activeTheme.id}
    />
  {/if}
  <div class="bg-overlay"></div>
</div>
```

**C — Update the game title / logo.**
Find wherever the logo image or game title text is rendered. Replace with:

```svelte
<div class="game-title-area">
  <img
    src="{$themeAssets.logo}"
    class="game-logo-img"
    alt="{$activeTheme.name}"
    draggable="false"
    on:error={(e) => {
      // Fallback to text title if logo PNG fails
      const el = e.currentTarget as HTMLImageElement
      el.style.display = 'none'
      const parent = el.parentElement
      if (parent && !parent.querySelector('.logo-text-fallback')) {
        const t = document.createElement('div')
        t.className = 'logo-text-fallback'
        t.textContent = $activeTheme.name
        parent.appendChild(t)
      }
    }}
  />
</div>
```

**D — Update the frame.**
Find the frame `<img>` element. Update:
```svelte
<img
  src="{$themeAssets.frame}"
  class="game-frame"
  alt=""
  aria-hidden="true"
/>
```

**E — Add theme selector button** in the utility button area:
```svelte
<button
  class="util-btn theme-btn"
  on:click={() => showThemeSelector = true}
  aria-label="Change theme"
  title="Change theme"
>
  🎨
</button>
```

**F — Add ThemeSelector overlay** before closing tag of main div:
```svelte
{#if showThemeSelector}
  <ThemeSelector
    on:close={() => showThemeSelector = false}
  />
{/if}
```

**G — Update CSS for .bg-media:**
```css
.bg-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
  pointer-events: none;
}

.game-frame {
  position: absolute;
  inset: -80px;
  width: calc(100% + 160px);
  height: calc(100% + 160px);
  object-fit: fill;
  pointer-events: none;
  z-index: 10;
}

.game-logo-img {
  max-height: 70px;
  max-width: 400px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.logo-text-fallback {
  font-family: 'Courier New', monospace;
  font-size: clamp(1.2rem, 3vw, 2rem);
  font-weight: 900;
  letter-spacing: 0.15em;
  color: var(--theme-primary, #00ffff);
  text-shadow: 0 0 20px currentColor;
  text-align: center;
  text-transform: uppercase;
}
```

Commit:
```bash
cd ~/math-sdk && git add frontend/src/App.svelte
git commit -m "fix(themes): App.svelte fully theme-driven — bg, logo, frame, theme selector"
git push origin main
```

---

## TASK 8 — FIX ControlBar.svelte — ALL BUTTONS FROM THEME STORE

Read ControlBar.svelte completely. Find every hard-coded asset path.

Add at the top of the script section:
```typescript
import { themeAssets } from '../stores/themeStore'
```

**Replace spin button img src:**
```svelte
<img src="{$themeAssets.spinButton}" alt="SPIN" draggable="false"
  on:error={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
/>
```

**Replace bet minus/plus buttons.** Find the nudge-btn elements.
Use inline style for background-image (CSS variables can't be reactive):
```svelte
<!-- Decrease bet button -->
<button
  class="nudge-btn nudge-minus"
  style="background-image: url('{$themeAssets.btnMinus}')"
  on:click={handleDecrement}
  disabled={$isSpinning}
  aria-label="Decrease bet"
>
  {#if !$themeAssets.btnMinus}<span>−</span>{/if}
</button>

<!-- Increase bet button -->
<button
  class="nudge-btn nudge-plus"
  style="background-image: url('{$themeAssets.btnPlus}')"
  on:click={handleIncrement}
  disabled={$isSpinning}
  aria-label="Increase bet"
>
  {#if !$themeAssets.btnPlus}<span>+</span>{/if}
</button>
```

**Replace autoplay button:**
```svelte
<button class="autoplay-btn" ...
  style="background-image: url('{$themeAssets.btnAutoplay}')">
  <span class="btn-label">AUTO</span>
</button>
```

**Remove any background-image CSS** for nudge-btn and autoplay-btn
selectors since we're now using inline styles.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/ControlBar.svelte
git commit -m "fix(themes): ControlBar all button images from themeStore"
git push origin main
```

---

## TASK 9 — FIX BalanceDisplay.svelte and WinDisplay.svelte

Read both files.

**BalanceDisplay.svelte** — add import, update panel background:
```typescript
import { themeAssets } from '../stores/themeStore'
```
Find the main panel div and add inline style:
```svelte
<div class="balance-panel" style="background-image: url('{$themeAssets.panelBalance}'); background-size: 100% 100%; background-repeat: no-repeat;">
```
Remove `background-image` from `.balance-panel` CSS.

**WinDisplay.svelte** — same pattern:
```typescript
import { themeAssets } from '../stores/themeStore'
```
```svelte
<div class="win-panel" style="background-image: url('{$themeAssets.panelWin}'); background-size: 100% 100%; background-repeat: no-repeat;">
```
Remove `background-image` from `.win-panel` CSS.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/BalanceDisplay.svelte
git add frontend/src/lib/components/WinDisplay.svelte
git commit -m "fix(themes): Balance and Win panels from themeStore"
git push origin main
```

---

## TASK 10 — FIX soundService.ts

Read soundService.ts. Update the sound loading to use theme paths
with Future Spinner fallbacks for any missing files:

```typescript
import { get } from 'svelte/store'
import { themeAssets } from '../stores/themeStore'

const FS_BASE = 'assets/themes/future-spinner/sounds'

function makeAudio(url: string, fallbackName: string): HTMLAudioElement {
  const el = new Audio(url)
  el.addEventListener('error', () => {
    const fb = `${FS_BASE}/${fallbackName}.mp3`
    if (el.src !== fb) {
      console.warn(`[Sound] Failed: ${url} — using fallback: ${fb}`)
      el.src = fb
    }
  }, { once: true })
  return el
}

function buildSounds() {
  const p = get(themeAssets).sounds
  const s = {
    bgm:                  makeAudio(p.bgm,                  'bgm_loop'),
    bgmTension:           makeAudio(p.bgmTension,           'bgm_tension'),
    spin:                 makeAudio(p.spin,                  'spin'),
    reelStop:             makeAudio(p.reelStop,              'reel_stop'),
    reelStopAnticipation: makeAudio(p.reelStopAnticipation, 'reel_stop_anticipation'),
    winSmall:             makeAudio(p.winSmall,              'win_small'),
    winMedium:            makeAudio(p.winMedium,             'win_medium'),
    winBig:               makeAudio(p.winBig,               'win_big'),
    winEpic:              makeAudio(p.winEpic,              'win_epic'),
    scatterLand:          makeAudio(p.scatterLand,           'scatter_land'),
    anticipationBuild:    makeAudio(p.anticipationBuild,    'anticipation_build'),
    uiClick:              makeAudio(p.uiClick,              'ui_click'),
  }
  s.bgm.loop = true
  s.bgm.volume = 0.30
  return s
}

let sounds = buildSounds()
```

Keep all existing exported functions (playBGM, playSpin, etc.) but
ensure they reference the rebuilt `sounds` object.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/services/soundService.ts
git commit -m "fix(themes): soundService reads from themeStore with fallbacks"
git push origin main
```

---

## TASK 11 — ADD CSS PALETTE VARIABLES TO App.svelte

In App.svelte, add a reactive CSS variable injection using svelte:head:

```svelte
<svelte:head>
  <title>{$activeTheme.name} — We Roll Spinners</title>
</svelte:head>
```

Also add an inline style block on the root element:
```svelte
<div
  id="game-root"
  style="
    --theme-primary: {$activeTheme.palette.primary};
    --theme-secondary: {$activeTheme.palette.secondary};
    --theme-bg: {$activeTheme.palette.background};
  "
>
```

This means all CSS using `var(--theme-primary)` will update automatically.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/App.svelte
git commit -m "feat(themes): CSS palette variables injected per active theme"
git push origin main
```

---

## TASK 12 — TSC + BUILD + FULL VERIFY

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
```

Fix ALL TypeScript errors before proceeding. Common issues:
- Import of `themeAssets` needs to be `$themeAssets` in template
- `key=` is not a standard Svelte attribute — remove it if it causes errors
- `get` from svelte/store is a named import

```bash
npm run build 2>&1
```

Both must exit 0.

**Run final asset check:**
```bash
echo "=== FINAL ASSET CHECK ==="
FAIL=0
for theme in future-spinner trap-lane oil-and-fire beautiful-game; do
  BASE=~/math-sdk/frontend/public/assets/themes/$theme
  for f in \
    symbols/h1.png symbols/h2.png symbols/m1.png symbols/m2.png \
    symbols/m3.png symbols/l1.png symbols/l2.png symbols/l3.png \
    symbols/wild.png symbols/scatter.png \
    backgrounds/bg-1.jpg frames/frame-1.png \
    ui/logo.png ui/spin_button.png \
    ui/panel_balance.png ui/panel_win.png \
    ui/btn_bet_minus.png ui/btn_bet_plus.png ui/btn_menu.png \
    sounds/bgm_loop.mp3 sounds/win_small.mp3; do
    [ -f "$BASE/$f" ] || { echo "❌ $theme/$f"; FAIL=$((FAIL+1)); }
  done
done
[ $FAIL -eq 0 ] && echo "ALL ASSETS PRESENT ✅" || echo "$FAIL MISSING ❌"
```

Update `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md`:

Add or replace the THEME SYSTEM STATUS section:
```markdown
## THEME SYSTEM STATUS — Updated 2026-04-05
- ✅ 4 themes active and fully working
- ✅ All assets installed with standard names (h1.png, h2.png etc)
- ✅ Background: video (future-spinner) / jpg image (all others)
- ✅ Frame PNG switches per theme
- ✅ Logo/title switches per theme
- ✅ Spin button switches per theme
- ✅ Bet +/− buttons switch per theme
- ✅ Balance/Win panels switch per theme
- ✅ All 10 symbols switch per theme (cache cleared)
- ✅ Audio 12 tracks switch per theme (with FS fallbacks)
- ✅ CSS palette variables injected per theme
- ✅ Page title updates per theme
```

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "fix(themes): complete theme system overhaul — all assets, buttons, audio switching"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
FUTURE SPINNER — DEFINITIVE THEME SYSTEM FIX COMPLETE
═══════════════════════════════════════════════════════════════════

TASK 1  — trap-lane assets installed (exact filenames):     [ done ]
TASK 2  — oil-and-fire assets installed:                    [ done ]
TASK 3  — beautiful-game assets installed:                  [ done ]
TASK 4  — integrity check (0 missing files):                [ done ]
TASK 5  — themeStore.ts rewritten completely:               [ done ]
TASK 6  — GameGrid symbol cache cleared + map fixed:        [ done ]
TASK 7  — App.svelte bg/logo/frame fully theme-driven:      [ done ]
TASK 8  — ControlBar all buttons from themeStore:           [ done ]
TASK 9  — Balance/Win panels from themeStore:               [ done ]
TASK 10 — soundService from themeStore + fallbacks:         [ done ]
TASK 11 — CSS palette variables per theme:                  [ done ]
TASK 12 — Build clean, all assets verified:                 [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]
STATUS: [ copied to ~/Downloads/ ]

ON THEME SWITCH EVERYTHING CHANGES:
  ✅ Background (video→image)    ✅ Frame PNG
  ✅ Logo/title                  ✅ Spin button
  ✅ Bet +/− buttons             ✅ Autoplay button
  ✅ Balance panel               ✅ Win panel
  ✅ All 10 symbols              ✅ All 12 audio tracks
  ✅ Page title                  ✅ CSS palette colours

═══════════════════════════════════════════════════════════════════
