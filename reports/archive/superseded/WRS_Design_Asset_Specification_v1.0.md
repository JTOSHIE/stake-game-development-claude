# WRS GAME TEMPLATE — DESIGN & ASSET SPECIFICATION
## Version 1.0 | Extracted from live codebase | 2026-04-12
## Source: future-spinner theme (reference implementation)

All values in this document are read directly from source files.
No assumptions. No estimates.

---

## TABLE OF CONTENTS

1. Reel Grid Dimensions
2. Frame Overlay — CSS Values
3. Z-Index Stack
4. Background System
5. Win Pod — Dimensions, Images, Zone Coordinates
6. Balance Display Panel
7. Win Display Panel
8. Control Bar — Button Sizes
9. Colour Reference
10. Asset Inventory — Global UI (`public/assets/ui/`)
11. Asset Inventory — Theme UI (`public/assets/themes/future-spinner/ui/`)
12. Asset Inventory — Symbols (`public/assets/symbols/idle-png/`)
13. Folder Structure
14. New Theme Checklist

---

## 1. REEL GRID DIMENSIONS

Source: `frontend/src/lib/components/GameGrid.svelte` lines 32–38

```
REELS    = 5
ROWS     = 4
CELL_W   = 120 px
CELL_H   = 100 px
GAP      = 4 px

CANVAS_W = REELS × CELL_W + (REELS − 1) × GAP  =  616 px
CANVAS_H = ROWS  × CELL_H + (ROWS  − 1) × GAP  =  412 px
```

The PixiJS canvas is rendered at exactly **616 × 412 px**.
The win-line overlay canvas is the same size (same Application dimensions).

Each symbol cell occupies a **120 × 100 px** slot.
Win-line connector points are centred:
```
x = col × (CELL_W + GAP) + CELL_W / 2
y = row × (CELL_H + GAP) + CELL_H / 2
```

---

## 2. FRAME OVERLAY — CSS VALUES

Source: `frontend/src/App.svelte` `.game-frame` rule

```css
.game-frame {
  position: absolute;
  inset: -70px;                      /* all four sides: top right bottom left */
  width:  calc(100% + 140px);        /* canvas 616px → frame rendered 756px wide */
  height: calc(100% + 140px);        /* canvas 412px → frame rendered 552px tall */
  object-fit: fill;
  pointer-events: none;
  z-index: 10;
  animation: frame-pulse 3s ease-in-out infinite;
}
```

Frame pulse animation:
```css
@keyframes frame-pulse {
  0%, 100% { filter: drop-shadow(0 0  8px color-mix(in srgb, var(--theme-primary) 50%, transparent)); }
  50%       { filter: drop-shadow(0 0 20px color-mix(in srgb, var(--theme-primary) 90%, transparent)); }
}
```

Grid wrapper (frame parent):
```css
.grid-wrapper {
  position: relative;
  display: inline-block;
  overflow: visible;
  z-index: 10;
}
```

**Artwork guidance:** The frame PNG transparent centre must align with the 616 × 412 px
canvas when rendered at 756 × 552 px. The opaque border is 70 px on every side.
Design the frame with a transparent interior of at least 616 × 412 px at 756 × 552 total.

---

## 3. Z-INDEX STACK

Source: `frontend/src/App.svelte` CSS comments + component files

| Layer | Element | z-index |
|-------|---------|---------|
| Background video / image | `.bg-layer` | 0 |
| Game wrapper | `.game-wrapper` | 2 |
| Reel grid + frame | `.grid-wrapper`, `.game-frame` | 10 |
| Win Pod | `.win-pod` (WinPod.svelte) | 50 |
| Theme selector button (fixed) | `.util-btn.theme-btn` | 50 |
| Control bar | `.control-bar` (ControlBar.svelte) | 60 |
| Game header / logo | `.game-header` | 70 |
| Win Banner | `.big-win-banner` (WinBanner.svelte) | 100 |

Zone text inside Win Pod uses `z-index: 2` (relative to the pod container).

---

## 4. BACKGROUND SYSTEM

Source: `frontend/src/App.svelte`

### future-spinner theme — dual-video crossfade

Two `<video>` elements share the same source (`bg_animated_loop.mp4`).
Video 2 starts at `duration / 2` to offset the loop point.
A 100 ms `setInterval` polls `currentTime`; when within 1.5 s of loop end
it fades the inactive video in via opacity transition.

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
  top: 0; left: 0;
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

Video file: `assets/videos/bg_animated_loop.mp4` (47 MB on disk)

### All other themes — static image

```css
.bg-media {
  position: absolute;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  opacity: 0.92;
}
```

Source path: `$themeAssets.background` (from themeStore)

### Dark overlay (all themes)

```css
.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  pointer-events: none;
}
```

---

## 5. WIN POD

Source: `frontend/src/lib/components/WinPod.svelte`

### Container

```css
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
```

Positioned relative to `.grid-wrapper`. Sits **220 px** to the right of the grid edge.

### Images

| State | File | Disk size |
|-------|------|-----------|
| Active (win showing) | `assets/ui/win_pod_v3_active.png` | 83,013 bytes |
| Idle (no win) | `assets/ui/win_pod_v3_idle.png` | 53,340 bytes |

```css
.pod-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
```

Idle pod opacity: **0.35**

### Transparent LED Zones (from Manus QC report)

Both zones are positioned relative to the **200 × 320 px** pod container.

**Zone 1 — MULTIPLIER**

```
position: absolute
top:    72px
left:   50px
width:  99px
height: 72px
font-family: 'Orbitron', 'Courier New', monospace
font-size:   1.8rem
font-weight: 900
color:       #00FFFF
text-shadow: 0 0 10px #00FFFF, 0 0 20px rgba(0, 255, 255, 0.6)
letter-spacing: 1px
white-space: nowrap
z-index: 2
```

**Zone 2 — WIN AMOUNT**

```
position: absolute
top:    192px
left:   50px
width:  99px
height: 72px
font-family: 'Orbitron', 'Courier New', monospace
font-size:   1.4rem
font-weight: 900
color:       #FF00FF
text-shadow: 0 0 10px #FF00FF, 0 0 20px rgba(255, 0, 255, 0.6)
letter-spacing: 1px
white-space: nowrap
z-index: 2
```

**Zone map (px, relative to pod top-left at 0, 0):**

```
  0 px ┌────────────────────┐
       │                    │
 72 px │  ┌──────────────┐  │  Zone 1 MULTIPLIER  left:50 → 149  top:72 → 144
144 px │  └──────────────┘  │
       │                    │
192 px │  ┌──────────────┐  │  Zone 2 WIN AMOUNT  left:50 → 149  top:192 → 264
264 px │  └──────────────┘  │
       │                    │
320 px └────────────────────┘
```

**Artwork guidance:** PNG must have `alpha = 0` (fully transparent) inside both zone
rectangles. Opaque artwork surrounds them. Text colour bleeds through from behind.
PNG must be exactly **200 × 320 px** (or scale cleanly to it with `object-fit: contain`).

### Reactive logic

```typescript
$: isActive = $winAmount > 0 && !$isSpinning
$: multText = $winMultiplier > 0 ? `${$winMultiplier.toFixed(1)}×` : ''
$: amtText  = $winAmount  > 0 ? $winAmount.toFixed(2) : ''
```

Both stores (`winAmount`, `winMultiplier`) are in **dollars** (e.g. `5.00`).
No division by `1_000_000`.

---

## 6. BALANCE DISPLAY PANEL

Source: `frontend/src/lib/components/BalanceDisplay.svelte`

```css
.balance-panel {
  min-width: 280px;
  height: 90px;
  background: linear-gradient(135deg,
    rgba(0,  8, 20, 0.92) 0%,
    rgba(0, 20, 40, 0.88) 50%,
    rgba(0,  8, 20, 0.92) 100%
  );
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 8px;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
  padding: 0 1.4rem;
  gap: 0.8rem;
}
```

Two fields (BALANCE / BET) separated by a 1px vertical divider
(`rgba(0,255,255,0.15)`, height 55%).

Label typography:
```
font-family:    'Orbitron', 'Courier New', monospace
font-size:      0.5rem
font-weight:    700
letter-spacing: 0.25em
color:          rgba(255, 255, 255, 0.4)
text-transform: uppercase
```

Value typography:
```
font-family:    'Orbitron', 'Courier New', monospace
font-size:      1.1rem
font-weight:    700
letter-spacing: 2px
```

| Field | Colour | text-shadow |
|-------|--------|-------------|
| Balance | `#00FFFF` | `0 0 8px #00FFFF, 0 0 16px rgba(0,255,255,0.4)` |
| Bet | `#FFD700` | `0 0 8px #FFD700, 0 0 16px rgba(255,215,0,0.4)` |

---

## 7. WIN DISPLAY PANEL

Source: `frontend/src/lib/components/WinDisplay.svelte`

```css
.win-panel {
  min-width: 200px;
  height: auto;
  min-height: 56px;
  padding: 0 1.2rem;
  border-radius: 8px;
  background: linear-gradient(135deg,
    rgba(20,  0, 30, 0.92) 0%,
    rgba(40,  0, 50, 0.88) 50%,
    rgba(20,  0, 30, 0.92) 100%
  );
  border: 1px solid rgba(255, 0, 255, 0.4);
  box-shadow: 0 0 12px rgba(255, 0, 255, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

Idle state opacity: **0.4**

Win amount typography:
```
font-family:    'Orbitron', 'Courier New', monospace
font-size:      1.1rem
font-weight:    900
color:          #FF00FF
text-shadow:    0 0 8px #FF00FF, 0 0 16px rgba(255,0,255,0.4)
letter-spacing: 2px
```

Win tiers and label colours:

| Tier | Threshold | Label text | Label colour |
|------|-----------|------------|--------------|
| none | mult = 0 | WIN (idle) | `rgba(255,255,255,0.35)` |
| green | 0 < mult < 1× | WIN | `rgba(255,255,255,0.35)` |
| gold | 1× – 9.9× | WIN | `rgba(255,255,255,0.35)` |
| big | 10× – 49.9× | BIG WIN! | `#ff00ff` with `text-shadow: 0 0 20px #ff00ff` |
| mega | 50×+ | MEGA WIN! | `#00ffff` with `text-shadow: 0 0 30px #00ffff` |
| wincap | `isWincap` flag | WINCAP | `#ffd700` |

---

## 8. CONTROL BAR — BUTTON SIZES

Source: `frontend/src/lib/components/ControlBar.svelte`

| Element | Width | Height | Notes |
|---------|-------|--------|-------|
| Spin button | 96px | 96px | Circular, `border-radius: 50%` |
| Max Bet button | 64px | 64px | Image button (`btn_max.png`) |
| Autoplay button | 56px | 56px | Image button (`$themeAssets.btnAutoplay`) |
| Nudge buttons (±) | 52px | 52px | `background-image: $themeAssets.btnMinus/Plus` |
| Bet selector panel | 148px | 48px | CSS gold glass; contains both nudge btns + value |
| Utility buttons (⚡/🔇/ℹ) | 40px | 40px | Circular, `border-radius: 50%` |

Bet selector panel background:
```css
background: linear-gradient(135deg,
  rgba(10,  8, 0, 0.92) 0%,
  rgba(25, 20, 0, 0.88) 50%,
  rgba(10,  8, 0, 0.92) 100%
);
border: 1px solid rgba(255, 215, 0, 0.4);
border-radius: 6px;
box-shadow: 0 0 10px rgba(255,215,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04);
```

Bet LED value:
```
font-family:    'Orbitron', 'Courier New', monospace
font-size:      0.98rem
font-weight:    700
color:          #FFD700
text-shadow:    0 0 8px #FFD700
letter-spacing: 2px
```

Control bar `z-index: 60`.

---

## 9. COLOUR REFERENCE

All values extracted from CSS in the listed components.

| Role | Value | Usage |
|------|-------|-------|
| Cyan primary | `#00FFFF` | Balance value, multiplier zone, MEGA WIN label |
| Gold / amber | `#FFD700` | Bet value, wincap label, wincap amount |
| Magenta | `#FF00FF` | Win amount (all tiers), win-amt zone, panel border, BIG WIN label |
| Body background | `#060610` | `:global(body) background` |
| Inactive text | `rgba(255,255,255,0.35–0.40)` | Labels, idle panels |
| Panel border — cyan | `rgba(0, 255, 255, 0.40)` | BalanceDisplay |
| Panel border — magenta | `rgba(255, 0, 255, 0.40)` | WinDisplay |
| Panel border — gold | `rgba(255, 215, 0, 0.40)` | Bet selector |
| Dark overlay | `rgba(0, 0, 0, 0.35)` | `.bg-overlay` |
| Game wrapper gradient | `rgba(6,6,15, 0.55 → 0.35 → 0.65)` | `.game-wrapper` to bottom |

CSS custom properties injected per-theme from `$activeTheme.palette`:
```
--theme-primary      (future-spinner default: #00ffff)
--theme-secondary
--theme-bg
```

Font: **Orbitron** (Google Fonts, weights 400 / 700 / 900) — loaded via `<svelte:head>`.
Fallback: `'Courier New', monospace`.

---

## 10. ASSET INVENTORY — GLOBAL UI

Path: `frontend/public/assets/ui/`
These assets are NOT theme-specific. Referenced via direct `src="assets/ui/..."` paths.

| Filename | Bytes | Status |
|----------|-------|--------|
| `win_pod_v3_active.png` | 83,013 | **ACTIVE** — current WinPod active image |
| `win_pod_v3_idle.png` | 53,340 | **ACTIVE** — current WinPod idle image |
| `big_win_banner.png` | 199,232 | **ACTIVE** — WinBanner component background |
| `win_pod_v2_active.png` | 89,532 | Previous version — not in use |
| `win_pod_v2_idle.png` | 58,311 | Previous version — not in use |
| `win_pod_active.png` | 106,537 | v1 — not in use |
| `win_pod_idle.png` | 70,311 | v1 — not in use |
| `bet_display.png` | 16,651 | Legacy (CSS-only panel used now) |
| `panel_balance.png` | 34,996 | Legacy (CSS-only panel used now) |
| `panel_win.png` | 45,855 | Legacy (CSS-only panel used now) |
| `spin_button.png` | 83,719 | Legacy (theme spin_button.png used) |
| `btn_bet_plus.png` | 13,648 | Legacy |
| `btn_bet_minus.png` | 12,627 | Legacy |
| `btn_menu.png` | 6,968 | Legacy |
| `btn_bet_plus_v2.png` | 14,090 | Not in use |
| `btn_bet_plus_v3.png` | 12,389 | Not in use |
| `btn_bet_minus_v2.png` | 13,663 | Not in use |
| `btn_bet_minus_v3.png` | 12,381 | Not in use |
| `btn_bet_display_v2.png` | 22,780 | Not in use |
| `btn_bet_display_v3.png` | 22,635 | Not in use |
| `logo_future_spinner.png` | 106,148 | Not in use (theme logo.png used) |
| `logo_future_spinner_loading.png` | 149,024 | Not in use |
| `logo_we_roll_spinners.png` | 15,872 | Not in use |

---

## 11. ASSET INVENTORY — THEME UI (future-spinner)

Path: `frontend/public/assets/themes/future-spinner/ui/`
Loaded through `themeStore` via the `themeAssets` derived store.

| Filename | Bytes | themeStore key | Displayed size | Component |
|----------|-------|----------------|----------------|-----------|
| `spin_button.png` | 72,034 | `spinButton` | 96 × 96 px | ControlBar spin button |
| `btn_bet_plus.png` | 67,444 | `btnPlus` | 52 × 52 px | ControlBar nudge btn bg |
| `btn_bet_minus.png` | 64,785 | `btnMinus` | 52 × 52 px | ControlBar nudge btn bg |
| `btn_max.png` | 67,721 | direct `src=` | 64 × 64 px | ControlBar MAX bet btn |
| `btn_autoplay.png` | 75,213 | `btnAutoplay` | 56 × 56 px | ControlBar autoplay btn |
| `btn_menu.png` | 63,971 | `btnMenu` | — | Menu button |
| `logo.png` | 106,148 | `logo` | max 440 × 72 px | Game header |
| `subtitle.png` | 15,872 | — | — | Subtitle / tagline |
| `panel_balance.png` | 17,912 | `panelBalance` | — | Not used (CSS-only) |
| `panel_win.png` | 19,113 | `panelWin` | — | Not used (CSS-only) |

---

## 12. ASSET INVENTORY — SYMBOLS

Path: `frontend/public/assets/symbols/idle-png/`
Static PNG fallbacks used when video is unavailable. All 10 symbols.

| Filename | Bytes | Symbol name |
|----------|-------|-------------|
| `H1.png` | 121,359 | High-value 1 |
| `H2.png` | 114,676 | High-value 2 |
| `M1.png` | 113,579 | Mid-value 1 |
| `M2.png` | 111,496 | Mid-value 2 |
| `M3.png` | 112,403 | Mid-value 3 |
| `L1.png` | 103,212 | Low-value 1 |
| `L2.png` | 56,267 | Low-value 2 |
| `L3.png` | 105,616 | Low-value 3 |
| `S.png` | 123,537 | Scatter |
| `W.png` | 90,693 | Wild |

**10 symbols total.** Each cell is rendered at **120 × 100 px** (CELL_W × CELL_H).
PNGs should be supplied at 120 × 100 px or larger; GameGrid scales via `width/height: 100%`.

Display names used in code and paytable: `WILD`, `SCAT`, `H1`, `H2`, `M1`, `M2`, `M3`, `L1`, `L2`, `L3`.

---

## 13. FOLDER STRUCTURE

```
frontend/public/assets/
├── ui/                              ← Global UI (win pod, banners, legacy)
│   ├── win_pod_v3_active.png        ← ACTIVE win pod image
│   ├── win_pod_v3_idle.png          ← ACTIVE win pod idle
│   ├── big_win_banner.png           ← WinBanner background
│   └── [legacy files — safe to archive]
│
├── symbols/
│   ├── idle-png/                    ← Static PNG fallback per symbol (10 files)
│   │   └── H1.png, H2.png, M1–M3, L1–L3, S.png, W.png
│   └── win-png/                     ← Win-burst PNGs (if used for non-video fallback)
│
├── videos/
│   ├── bg_animated_loop.mp4         ← future-spinner background (47 MB)
│   ├── bg_rain_street_v2.mp4        ← (5.8 MB)
│   ├── bg_city_aerial_v2.mp4        ← (3.4 MB)
│   ├── bg_rim_spin_v2.mp4           ← (5.0 MB)
│   └── bg_master_fallback.png       ← Static fallback image (6.3 MB)
│
└── themes/
    └── future-spinner/
        ├── ui/
        │   ├── spin_button.png      ← 96 × 96 display
        │   ├── btn_bet_plus.png     ← 52 × 52 display
        │   ├── btn_bet_minus.png    ← 52 × 52 display
        │   ├── btn_max.png          ← 64 × 64 display
        │   ├── btn_autoplay.png     ← 56 × 56 display
        │   ├── btn_menu.png
        │   ├── logo.png             ← max 440 × 72 display
        │   ├── subtitle.png
        │   ├── panel_balance.png    ← (not active — CSS-only)
        │   └── panel_win.png        ← (not active — CSS-only)
        ├── symbols/                 ← Theme-specific symbols (h1.png … s.png, w.png)
        ├── sounds/                  ← 12 audio tracks (see §14)
        └── frame.png                ← 756 × 552 display; loaded via themeAssets.frame
```

**For a new theme `my-theme`, create:**
```
frontend/public/assets/themes/my-theme/
├── ui/
│   ├── spin_button.png    (display: 96 × 96)
│   ├── btn_bet_plus.png   (display: 52 × 52)
│   ├── btn_bet_minus.png  (display: 52 × 52)
│   ├── btn_max.png        (display: 64 × 64)
│   ├── btn_autoplay.png   (display: 56 × 56)
│   ├── logo.png           (display: max 440 × 72)
│   └── frame.png          (display: 756 × 552; transparent interior 616 × 412)
├── symbols/
│   └── h1.png, h2.png, m1.png, m2.png, m3.png,
│       l1.png, l2.png, l3.png, s.png, w.png   (all: 120 × 100)
└── sounds/
    ├── bgm_loop.mp3
    ├── bgm_tension.mp3
    ├── spin.mp3
    ├── reel_stop.mp3
    ├── reel_stop_anticipation.mp3
    ├── win_small.mp3
    ├── win_medium.mp3
    ├── win_big.mp3
    ├── win_epic.mp3
    ├── scatter_land.mp3
    ├── anticipation_build.mp3
    └── ui_click.mp3
```

---

## 14. NEW THEME CHECKLIST

### Required assets (minimum viable)

- [ ] `ui/logo.png` — max display: **440 × 72 px** (`object-fit: contain`)
- [ ] `ui/frame.png` — display: **756 × 552 px** (`object-fit: fill`); transparent interior **616 × 412 px**; opaque border **~70 px** all sides
- [ ] `ui/spin_button.png` — display: **96 × 96 px**
- [ ] `ui/btn_bet_plus.png` — display: **52 × 52 px** (used as CSS `background-image`)
- [ ] `ui/btn_bet_minus.png` — display: **52 × 52 px**
- [ ] `ui/btn_max.png` — display: **64 × 64 px**
- [ ] `ui/btn_autoplay.png` — display: **56 × 56 px**
- [ ] `symbols/h1.png … w.png` — 10 PNGs, each **120 × 100 px**
- [ ] `sounds/bgm_loop.mp3` + 11 other tracks (see §13)
- [ ] Background: `bg.jpg` or `bg.png` (static, `opacity: 0.92`) — OR video (future-spinner only)

### Optional

- [ ] `ui/subtitle.png`
- [ ] `ui/panel_balance.png` (not used while CSS-only panels are active)
- [ ] `ui/panel_win.png` (not used while CSS-only panels are active)
- [ ] Custom win pod PNGs — default `assets/ui/win_pod_v3_*.png` used if not supplied

### themeStore registration

Add to `frontend/src/lib/stores/themeStore.ts`:

```typescript
{
  id: 'my-theme',
  name: 'My Theme',
  palette: {
    primary:    '#RRGGBB',   // frame glow, borders, win lines, text highlights
    secondary:  '#RRGGBB',
    background: '#RRGGBB',
  }
}
```

`--theme-primary` is injected as a CSS variable across all components:
frame pulse animation, panel borders, control bar utility buttons, PixiJS win-line colour.

### Z-index contracts — DO NOT CHANGE

| Layer | z-index | Constraint |
|-------|---------|------------|
| `grid-wrapper` | **10** | Frame and symbols must be at 10 |
| `WinPod` | **50** | Must clear grid (10) |
| `control-bar` | **60** | Must clear WinPod (50) |
| `game-header` | **70** | Must clear control-bar (60) |
| `WinBanner` | **100** | Topmost in-game element |

### Currency and number display rules

- `winAmount`, `balance`, `betAmount` stores → **dollars** (e.g. `5.00`)
- Display: `.toFixed(2)` — **no** division by `1_000_000`
- `formatBalance()` utility expects micros → call as `formatBalance(value * CURRENCY_SCALE, code)`

### Win Pod zone rules

If supplying custom win pod artwork, transparent cutout zones must match:
```
Zone 1 (multiplier): top: 72px,  left: 50px, width: 99px, height: 72px
Zone 2 (win amount): top: 192px, left: 50px, width: 99px, height: 72px
```
within a **200 × 320 px** canvas.

If zone coordinates change, update **both** the PNG artwork
and `.zone-mult` / `.zone-amt` CSS in `WinPod.svelte`.

---

*Document generated 2026-04-12 from live source files.*
*Re-run the extraction commands listed at the top of this document after any layout or asset change.*
