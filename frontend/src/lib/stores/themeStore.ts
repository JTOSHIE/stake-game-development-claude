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
    id:        $t.id,
    assetBase: b,
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
    // Frame — frame-2 for every theme (LAYOUT_INSTALL: switched future-spinner
    // from frame-1 to frame-2 per the owner-approved blueprint; frame-2 has a
    // larger transparent centre window, avoids clipping the canvas. One-line
    // revert: change this back to frame-1 for future-spinner if preferred.
    frame:           `${b}/frames/frame-2.png`,
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
