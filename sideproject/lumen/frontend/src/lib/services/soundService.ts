// soundService.ts — Future Spinner R5 Audio System
// Full tiered audio: 5 win tiers, anticipation, scatter events

import { get } from 'svelte/store'
import { isMuted as isMutedStore } from '../stores/gameStore'
import { musicVolume, sfxVolume } from '../stores/audioSettings'
import { themeAssets } from '../stores/themeStore'

const FS_BASE = 'assets/themes/future-spinner/sounds'

// ── Base volumes ──────────────────────────────────────────────────────────────
// The per-sound design volumes, kept in one place. The two player sliders act as
// master scalars on top of these: BGM loudness is driven directly by
// musicVolume; every SFX effective volume is its base x sfxVolume. Nothing else
// hardcodes a volume number.
const BASE = {
  bgm:                  0.30, // retained for reference; BGM loudness is driven directly by musicVolume
  spin:                 0.70,
  reelStop:             0.85,
  reelStopAnticipation: 0.90,
  winSmall:             0.65,
  winMedium:            0.75,
  winBig:               0.85,
  winEpic:              0.95,
  scatterLand:          0.80,
  anticipationBuild:    0.60,
  uiClick:              0.60,
} as const

// BGM ducking factors, expressed relative to musicVolume so the slider always
// sets the ceiling. These mirror the original 0.30 / 0.12 / 0.08 ratios:
// spin duck 0.12/0.30 = 0.4, anticipation duck 0.08/0.30 ~= 0.27.
const BGM_DUCK_SPIN         = 0.4
const BGM_DUCK_ANTICIPATION = 0.27

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
  s.bgm.loop = true
  // Volumes are set by applyVolumes() from the two player sliders (see below),
  // not hardcoded here.
  return s
}

let sounds = buildSounds()

let bgmStarted = false
let muted = false
let anticipationActive = false

// Current slider values, mirrored from the stores so applyVolumes() and the
// duck helpers can read them synchronously.
let musicVol = get(musicVolume)
let sfxVol   = get(sfxVolume)

// Current BGM duck factor: 1 = normal, BGM_DUCK_SPIN during a spin,
// BGM_DUCK_ANTICIPATION during anticipation. Effective BGM = musicVol * bgmDuck.
let bgmDuck = 1

/**
 * Recompute and assign every current volume from the two slider values. BGM is
 * musicVol scaled by the active duck factor; each SFX is its base x sfxVol.
 * Muting is handled separately via the .muted flag, so this is safe to call at
 * any time (including on unmute to restore the slider-derived volumes).
 */
function applyVolumes(): void {
  sounds.bgm.volume                  = musicVol * bgmDuck
  sounds.spin.volume                 = BASE.spin                 * sfxVol
  sounds.reelStop.volume             = BASE.reelStop             * sfxVol
  sounds.reelStopAnticipation.volume = BASE.reelStopAnticipation * sfxVol
  sounds.winSmall.volume             = BASE.winSmall             * sfxVol
  sounds.winMedium.volume            = BASE.winMedium            * sfxVol
  sounds.winBig.volume               = BASE.winBig               * sfxVol
  sounds.winEpic.volume              = BASE.winEpic              * sfxVol
  sounds.scatterLand.volume          = BASE.scatterLand          * sfxVol
  sounds.anticipationBuild.volume    = BASE.anticipationBuild    * sfxVol
  sounds.uiClick.volume              = BASE.uiClick              * sfxVol
}

// Live-apply whenever either slider changes (subscribe fires immediately on
// subscription, which also performs the initial volume assignment).
musicVolume.subscribe((v) => { musicVol = v; applyVolumes() })
sfxVolume.subscribe((v)   => { sfxVol   = v; applyVolumes() })

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
  // An explicit one-shot volume is a raw base value, so scale it by sfxVol here.
  // When none is passed, base.volume is already the slider-scaled SFX volume.
  clone.volume = volume !== undefined ? volume * sfxVol : base.volume
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
  } else {
    // On unmute, restore every volume to the current slider-derived values.
    applyVolumes()
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
  // Duck BGM during spin, relative to the music slider.
  bgmDuck = BGM_DUCK_SPIN
  sounds.bgm.volume = musicVol * bgmDuck
  setTimeout(() => {
    bgmDuck = 1
    if (!muted) sounds.bgm.volume = musicVol * bgmDuck
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
  // Duck BGM further during anticipation, relative to the music slider.
  bgmDuck = BGM_DUCK_ANTICIPATION
  sounds.bgm.volume = musicVol * bgmDuck
  // Play tension build
  sounds.anticipationBuild.currentTime = 0
  sounds.anticipationBuild.play().catch(() => {})
}

export function stopAnticipation(): void {
  anticipationActive = false
  sounds.anticipationBuild.pause()
  sounds.anticipationBuild.currentTime = 0
  // Restore BGM to the full music slider level.
  bgmDuck = 1
  if (!muted) sounds.bgm.volume = musicVol * bgmDuck
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
