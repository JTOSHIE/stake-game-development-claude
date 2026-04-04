// soundService.ts — Audio for Future Spinner
// Uses HTML5 Audio API with actual MP3 files

import { isMuted as isMutedStore } from '../stores/gameStore'

const BASE = 'assets/sounds/'

// Preload all audio files
const sounds: Record<string, HTMLAudioElement> = {
  bgm:      new Audio(`${BASE}bgm_loop.mp3`),
  spin:     new Audio(`${BASE}spin.mp3`),
  reelStop: new Audio(`${BASE}reel_stop.mp3`),
  win:      new Audio(`${BASE}win.mp3`),
  uiClick:  new Audio(`${BASE}ui_click.mp3`),
  scatter:  new Audio(`${BASE}scatter.mp3`),
}

// BGM loops
sounds.bgm.loop   = true
sounds.bgm.volume = 0.3

// Set volumes
sounds.spin.volume     = 0.7
sounds.reelStop.volume = 0.85
sounds.win.volume      = 0.8
sounds.uiClick.volume  = 0.6
sounds.scatter.volume  = 0.9

let bgmStarted = false
let muted = false

// Stay in sync with the isMuted store so ControlBar's mute toggle works
isMutedStore.subscribe(val => setMuted(val))

export function setMuted(val: boolean): void {
  muted = val
  Object.values(sounds).forEach(s => { s.muted = val })
}

export function playBGM(): void {
  if (muted || bgmStarted) return
  sounds.bgm.play().catch(() => {
    // Autoplay blocked — will start on first user interaction
    document.addEventListener('click', () => {
      if (!bgmStarted) {
        sounds.bgm.play().catch(() => {})
        bgmStarted = true
      }
    }, { once: true })
  })
  bgmStarted = true
}

export function playSpinStart(): void {
  if (muted) return
  sounds.spin.currentTime = 0
  sounds.spin.play().catch(() => {})
  // Duck BGM during spin, restore after reel settle
  sounds.bgm.volume = 0.15
  setTimeout(() => { sounds.bgm.volume = 0.3 }, 1500)
}

export function playReelStop(_reelIndex: number = 0): void {
  if (muted) return
  // Clone for overlapping stops on multiple reels
  const clone = sounds.reelStop.cloneNode() as HTMLAudioElement
  clone.volume = sounds.reelStop.volume
  clone.play().catch(() => {})
}

/**
 * Play win sound based on win multiplier (winAmount / betAmount).
 * Dead spins: call playWin(0) — no sound plays.
 * Small wins (>0 to <2×): soft win chime
 * Medium wins (2× to <10×): regular win fanfare
 * Big wins (10× to <50×): scatter/celebration sound
 * Epic wins (50×+): scatter sound + repeat for emphasis
 */
export function playWin(multiplier: number): void {
  if (muted || multiplier <= 0) return  // dead spin — silence

  if (multiplier >= 50) {
    // Epic — play scatter twice with slight delay
    sounds.scatter.currentTime = 0
    sounds.scatter.play().catch(() => {})
    setTimeout(() => {
      if (!muted) {
        const echo = sounds.scatter.cloneNode() as HTMLAudioElement
        echo.volume = 0.6
        echo.play().catch(() => {})
      }
    }, 800)
  } else if (multiplier >= 10) {
    // Big win — scatter/celebration sound
    sounds.scatter.currentTime = 0
    sounds.scatter.play().catch(() => {})
  } else if (multiplier >= 2) {
    // Medium win — win fanfare
    sounds.win.currentTime = 0
    sounds.win.play().catch(() => {})
  } else {
    // Small win (>0 but <2×) — quiet win sound at lower volume
    const softWin = sounds.win.cloneNode() as HTMLAudioElement
    softWin.volume = 0.4
    softWin.play().catch(() => {})
  }
}

export function playScatter(): void {
  if (muted) return
  sounds.scatter.currentTime = 0
  sounds.scatter.play().catch(() => {})
}

export function playUIClick(): void {
  if (muted) return
  sounds.uiClick.currentTime = 0
  sounds.uiClick.play().catch(() => {})
}

/** Alias kept for existing ControlBar call sites */
export const playClick = playUIClick
