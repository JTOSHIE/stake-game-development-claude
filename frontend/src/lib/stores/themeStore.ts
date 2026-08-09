// themeStore.ts, Reactive theme state, We Roll Spinners
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
    // Symbols, standard names, theme folder changes
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
    // REPOINTED 2026-08-09. This derived `bg-1.jpg` for EVERY theme, including
    // future-spinner, whose real backdrop is the adopted `bg_base.jpg` rendered
    // directly in App.svelte. So the field named a file the shipping theme never
    // used, and that file was 886KB of machine-generated cityscape carrying
    // legible rival casino signage ("JACKPOT CITY", "CYBER JOKER SLOTS",
    // "NEON REELS") into an artefact uploaded to Stake. It could not render in
    // production, because the {:else} branch that consumes this field only runs
    // for non-future-spinner themes and production forces future-spinner, but
    // "does not contain" is about the bundle rather than about what paints.
    // Same class as the `branding/` directory deleted under TR-047 and the
    // dangling `backgroundVideo` removed below.
    background:      `${b}/backgrounds/bg_base.jpg`,
    // `backgroundVideo` REMOVED 2026-07-28 (asset reference gate, JOB 1). It
    // derived `${b}/backgrounds/bg-1.mp4` for every theme, and
    // `build_diet_verify.mjs` prunes that exact path BY NAME because it is
    // 6,083,487 bytes of retired video. The field had ZERO consumers, so nothing
    // ever requested it and no runtime gate could see it: a dangling reference
    // to a deliberately unshipped file, sitting in the bundle waiting for the
    // day someone wired it up. Found by `asset_reference_gate.mjs` on its first
    // run, which is what that gate exists for.
    isVideo:         $t.id === 'future-spinner',
    // Frame, frame-2 for every theme (LAYOUT_INSTALL: switched future-spinner
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

export { THEMES }
