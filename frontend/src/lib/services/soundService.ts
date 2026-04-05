// soundService.ts — Future Spinner R5 Audio System
// Full tiered audio: 5 win tiers, anticipation, scatter events

import { get } from 'svelte/store'
import { isMuted as isMutedStore } from '../stores/gameStore'
import { themeAssets } from '../stores/themeStore'

function buildSounds(): Record<string, HTMLAudioElement> {
  const paths = get(themeAssets).sounds
  const base = 'assets/themes/future-spinner/sounds'

  function audio(url: string, fallback: string): HTMLAudioElement {
    const el = new Audio(url)
    el.addEventListener('error', () => {
      if (el.src !== fallback) el.src = fallback
    })
    return el
  }

  const sounds: Record<string, HTMLAudioElement> = {
    bgm:                  audio(paths.bgm,                  `${base}/bgm_loop.mp3`),
    bgmTension:           audio(paths.bgmTension,           `${base}/bgm_tension.mp3`),
    spin:                 audio(paths.spin,                 `${base}/spin.mp3`),
    reelStop:             audio(paths.reelStop,             `${base}/reel_stop.mp3`),
    reelStopAnticipation: audio(paths.reelStopAnticipation, `${base}/reel_stop_anticipation.mp3`),
    winSmall:             audio(paths.winSmall,             `${base}/win_small.mp3`),
    winMedium:            audio(paths.winMedium,            `${base}/win_medium.mp3`),
    winBig:               audio(paths.winBig,               `${base}/win_big.mp3`),
    winEpic:              audio(paths.winEpic,              `${base}/win_epic.mp3`),
    scatterLand:          audio(paths.scatterLand,          `${base}/scatter_land.mp3`),
    anticipationBuild:    audio(paths.anticipationBuild,    `${base}/anticipation_build.mp3`),
    uiClick:              audio(paths.uiClick,              `${base}/ui_click.mp3`),
  }

  // Volume levels
  sounds.bgm.loop              = true
  sounds.bgm.volume            = 0.30
  sounds.bgmTension.volume     = 0.50
  sounds.spin.volume           = 0.70
  sounds.reelStop.volume       = 0.85
  sounds.reelStopAnticipation.volume = 0.90
  sounds.winSmall.volume       = 0.65
  sounds.winMedium.volume      = 0.75
  sounds.winBig.volume         = 0.85
  sounds.winEpic.volume        = 0.95
  sounds.scatterLand.volume    = 0.80
  sounds.anticipationBuild.volume = 0.60
  sounds.uiClick.volume        = 0.60

  return sounds
}

let sounds = buildSounds()

let bgmStarted = false
let muted = false
let anticipationActive = false

// Sync with isMuted store
isMutedStore.subscribe(val => setMuted(val))

export function setMuted(val: boolean): void {
  muted = val
  Object.values(sounds).forEach(s => { s.muted = val })
}

// ── BGM ─────────────────────────────────────────────────────────────────────

export function playBGM(): void {
  if (muted || bgmStarted) return
  sounds.bgm.play().catch(() => {
    document.addEventListener('click', () => {
      if (!bgmStarted) {
        sounds.bgm.play().catch(() => {})
        bgmStarted = true
      }
    }, { once: true })
  })
  bgmStarted = true
}

// ── SPIN ────────────────────────────────────────────────────────────────────

export function playSpinStart(): void {
  if (muted) return
  sounds.spin.currentTime = 0
  sounds.spin.play().catch(() => {})
  // Duck BGM during spin
  sounds.bgm.volume = 0.12
  setTimeout(() => {
    if (!muted) sounds.bgm.volume = 0.30
  }, 1800)
}

// ── REEL STOPS ──────────────────────────────────────────────────────────────

/**
 * Play reel stop sound for a given reel index (0-4).
 * If anticipation is active on reel 4 (last reel), use heavy version.
 */
export function playReelStop(reelIndex: number = 0): void {
  if (muted) return
  if (anticipationActive && reelIndex === 4) {
    // Last reel during anticipation — use the heavy anticipation stop
    sounds.reelStopAnticipation.currentTime = 0
    sounds.reelStopAnticipation.play().catch(() => {})
    stopAnticipation()
  } else {
    const clone = sounds.reelStop.cloneNode() as HTMLAudioElement
    clone.volume = sounds.reelStop.volume
    clone.play().catch(() => {})
  }
}

// ── ANTICIPATION ────────────────────────────────────────────────────────────

/**
 * Start anticipation audio — rising tension during slow reel.
 * Call this when reels 1-4 have matched high-value symbols.
 */
export function playAnticipation(): void {
  if (muted) return
  anticipationActive = true
  // Duck normal BGM
  sounds.bgm.volume = 0.08
  // Play tension build
  sounds.anticipationBuild.currentTime = 0
  sounds.anticipationBuild.play().catch(() => {})
}

export function stopAnticipation(): void {
  anticipationActive = false
  sounds.anticipationBuild.pause()
  sounds.anticipationBuild.currentTime = 0
  // Restore BGM
  if (!muted) sounds.bgm.volume = 0.30
}

// ── SCATTER ─────────────────────────────────────────────────────────────────

/**
 * Play the scatter landing sound each time a scatter symbol appears.
 * Call once per scatter as each reel stops.
 */
export function playScatterLand(): void {
  if (muted) return
  const clone = sounds.scatterLand.cloneNode() as HTMLAudioElement
  clone.volume = sounds.scatterLand.volume
  clone.play().catch(() => {})
}

// ── WIN SOUNDS ──────────────────────────────────────────────────────────────

/**
 * Play tiered win sound based on multiplier (winAmount / betAmount).
 * 0         = dead spin, no sound
 * 0.01–1.9× = small win
 * 2×–9.9×   = medium win
 * 10×–19.9× = big win
 * 20×+      = epic win
 */
export function playWin(multiplier: number): void {
  if (muted || multiplier <= 0) return

  if (multiplier >= 20) {
    sounds.winEpic.currentTime = 0
    sounds.winEpic.play().catch(() => {})
  } else if (multiplier >= 10) {
    sounds.winBig.currentTime = 0
    sounds.winBig.play().catch(() => {})
  } else if (multiplier >= 2) {
    sounds.winMedium.currentTime = 0
    sounds.winMedium.play().catch(() => {})
  } else {
    sounds.winSmall.currentTime = 0
    sounds.winSmall.play().catch(() => {})
  }
}

// ── UI ───────────────────────────────────────────────────────────────────────

export function playUIClick(): void {
  if (muted) return
  sounds.uiClick.currentTime = 0
  sounds.uiClick.play().catch(() => {})
}

/** Alias for backward compatibility with any existing call sites */
export const playClick = playUIClick

export function playScatter(): void {
  // Legacy alias — now use playScatterLand for individual scatter events
  playScatterLand()
}
