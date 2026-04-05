// themeStore.ts — Reactive theme state for We Roll Spinners

import { writable, derived } from 'svelte/store'
import {
  type ThemeConfig,
  getActiveTheme,
  saveTheme,
  getTheme,
  THEMES,
} from '../config/themes'

export const activeTheme = writable<ThemeConfig>(getActiveTheme())

// Derived asset paths — always points to the active theme's assets
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
  background:   `${$t.assetBase}/backgrounds/bg-1.${$t.videoBackground ? 'mp4' : 'jpg'}`,
  frame:        `${$t.assetBase}/frames/frame-1.png`,
  spinButton:   `${$t.assetBase}/ui/spin_button.png`,
  panelBalance: `${$t.assetBase}/ui/panel_balance.png`,
  panelWin:     `${$t.assetBase}/ui/panel_win.png`,
  btnMinus:     `${$t.assetBase}/ui/btn_bet_minus.png`,
  btnPlus:      `${$t.assetBase}/ui/btn_bet_plus.png`,
  btnMenu:      `${$t.assetBase}/ui/btn_menu.png`,
  logo:         `${$t.assetBase}/ui/logo.png`,
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

export const themePalette = derived(activeTheme, ($t) => $t.palette)

export function switchTheme(id: string): void {
  saveTheme(id)
  activeTheme.set(getTheme(id))
}

export { THEMES }
