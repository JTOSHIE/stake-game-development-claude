// soundService.ts — Future Spinner R5 Audio System
// Full tiered audio: 5 win tiers, anticipation, scatter events

import { get } from 'svelte/store'
import { isMuted as isMutedStore } from '../stores/gameStore'
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
    spin:                 makeAudio(p.spin,                 'spin'),
    reelStop:             makeAudio(p.reelStop,             'reel_stop'),
    reelStopAnticipation: makeAudio(p.reelStopAnticipation, 'reel_stop_anticipation'),
    winSmall:             makeAudio(p.winSmall,             'win_small'),
    winMedium:            makeAudio(p.winMedium,            'win_medium'),
    winBig:               makeAudio(p.winBig,               'win_big'),
    winEpic:              makeAudio(p.winEpic,              'win_epic'),
    scatterLand:          makeAudio(p.scatterLand,          'scatter_land'),
    anticipationBuild:    makeAudio(p.anticipationBuild,    'anticipation_build'),
    uiClick:              makeAudio(p.uiClick,              'ui_click'),
  }
  s.bgm.loop    = true
  s.bgm.volume  = 0.30
  s.spin.volume                 = 0.70
  s.reelStop.volume             = 0.85
  s.reelStopAnticipation.volume = 0.90
  s.winSmall.volume             = 0.65
  s.winMedium.volume            = 0.75
  s.winBig.volume               = 0.85
  s.winEpic.volume              = 0.95
  s.scatterLand.volume          = 0.80
  s.anticipationBuild.volume    = 0.60
  s.uiClick.volume              = 0.60
  return s
}

let sounds = buildSounds()

let bgmStarted = false
let muted = false
let anticipationActive = false

// One-shot cloned sounds currently playing (reel stops, scatters, small wins,
// the epic-win echo). Tracked so muting can stop them immediately, not just
// suppress future sounds.
const activeClones = new Set<HTMLAudioElement>()

/**
 * Play a fresh one-shot clone of a base sound and track it so it can be
 * stopped on mute. The clone removes itself from the set when it finishes.
 */
function playClone(base: HTMLAudioElement, volume?: number): void {
  if (muted) return
  const clone = base.cloneNode() as HTMLAudioElement
  clone.volume = volume ?? base.volume
  activeClones.add(clone)
  const cleanup = () => activeClones.delete(clone)
  clone.addEventListener('ended', cleanup, { once: true })
  clone.play().catch(cleanup)
}

// Sync with isMuted store
isMutedStore.subscribe(val => setMuted(val))

export function setMuted(val: boolean): void {
  muted = val
  Object.values(sounds).forEach(s => { s.muted = val })
  if (val) {
    // Stop any one-shot clones already playing so disabling sound silences
    // everything at once, not only future sounds.
    activeClones.forEach(c => { c.pause(); c.currentTime = 0 })
    activeClones.clear()
  }
}

// ── BGM ─────────────────────────────────────────────────────────────────────

export function playBGM(): void {
  if (muted || bgmStarted) return
  sounds.bgm.play().then(() => {
    bgmStarted = true
  }).catch(() => {
    // Autoplay blocked — start BGM on the first genuine user gesture, whether
    // that is a click/tap or a key press (for example the spacebar to spin).
    // One-shot and idempotent: whichever fires first starts the music once and
    // removes both listeners so the music never double-starts.
    const startOnce = (): void => {
      if (bgmStarted) return
      bgmStarted = true
      sounds.bgm.play().catch(() => {})
      document.removeEventListener('click', startOnce)
      document.removeEventListener('keydown', startOnce)
    }
    document.addEventListener('click', startOnce)
    document.addEventListener('keydown', startOnce)
  })
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
    playClone(sounds.reelStop)
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
  playClone(sounds.scatterLand)
}

// ── WIN SOUNDS ──────────────────────────────────────────────────────────────

/**
 * Play tiered win sound based on multiplier (winAmount / betAmount).
 * 0         = dead spin, no sound
 * 0.01–1.9× = small win (quiet cloneNode at 0.4 vol)
 * 2×–9.9×   = medium win
 * 10×–49.9× = big win
 * 50×+      = epic win (plays twice with 800ms echo)
 */
export function playWin(multiplier: number): void {
  if (muted || multiplier <= 0) return

  if (multiplier >= 50) {
    // Epic win — play twice with slight delay for emphasis
    sounds.winEpic.currentTime = 0
    sounds.winEpic.play().catch(() => {})
    setTimeout(() => {
      playClone(sounds.winEpic, 0.6)
    }, 800)
  } else if (multiplier >= 10) {
    // Big win
    sounds.winBig.currentTime = 0
    sounds.winBig.play().catch(() => {})
  } else if (multiplier >= 2) {
    // Medium win
    sounds.winMedium.currentTime = 0
    sounds.winMedium.play().catch(() => {})
  } else {
    // Small win — softer version
    playClone(sounds.winSmall, 0.4)
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
