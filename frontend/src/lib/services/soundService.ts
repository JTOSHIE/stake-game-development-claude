// soundService.ts, Future Spinner R5 Audio System
// Full tiered audio: 5 win tiers, anticipation, scatter events

import { get } from 'svelte/store'
import { BIG_WIN_THRESHOLD, MEGA_WIN_THRESHOLD, EPIC_WIN_THRESHOLD } from '../stores/winCountUp'
import { isMuted as isMutedStore } from '../stores/gameStore'
import { musicVolume, sfxVolume } from '../stores/audioSettings'
import { themeAssets } from '../stores/themeStore'
import { overdriveVisual } from '../stores/overdriveVisual'

const FS_BASE = 'assets/themes/future-spinner/sounds'

const MUTE_KEY = 'fs_muted'

/** localStorage persistence for the master mute flag. isMuted itself lives in the
 * locked gameStore.ts (never edited here) - this only ever calls its public
 * writable API (.set()/.subscribe()), the same way this file already read it. */
function loadMutePersisted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function persistMute(val: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, val ? '1' : '0')
  } catch {
    /* ignore - blocked/unavailable storage should never break gameplay */
  }
}

/** Picks the WebM/Opus encode for a loop bed/track when the browser supports it,
 * falling back to the MP3 encode of the same asset otherwise. makeAudio()'s own
 * on-error fallback (below) is the second line of defence if canPlayType's
 * "maybe" turns out wrong at actual playback time. */
function pickLoopUrl(mp3Url: string): string {
  const webmUrl = mp3Url.replace(/\.mp3$/, '.webm')
  const supportsOpus =
    typeof Audio !== 'undefined' && new Audio().canPlayType('audio/webm; codecs="opus"') !== ''
  return supportsOpus ? webmUrl : mp3Url
}

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
  // R117, THE WIN LADDER WAS NOT A LADDER. The four tiers were 0.65/0.75/0.85/0.95
  // here, but playWin() hardcoded 0.4 for the small tier and bypassed this table,
  // so what a player actually heard was 0.40 / 0.75 / 0.85 / 0.95: a +5.45 dB leap
  // into the second tier and then +1.08 dB and +0.96 dB, which are below the level
  // most listeners reliably notice. Three tiers therefore sounded like two.
  //
  // These values are an even ladder: each step is x1.284, or +2.17 dB, across the
  // whole range. The hardcoded bypass in playWin() is gone, so this table is once
  // again the single place win loudness is decided.
  winSmall:             0.45,
  winMedium:            0.58,
  winBig:               0.74,
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
      console.warn(`[Sound] Failed: ${url}, using fallback: ${fb}`)
      el.src = fb
    }
  }, { once: true })
  return el
}

function buildSounds() {
  const p = get(themeAssets).sounds
  const s = {
    bgm:                  makeAudio(pickLoopUrl(p.bgm),               'bgm_loop'),
    bgmTension:           makeAudio(pickLoopUrl(p.bgmTension),        'bgm_tension'),
    spin:                 makeAudio(p.spin,                 'spin'),
    reelStop:             makeAudio(p.reelStop,             'reel_stop'),
    reelStopAnticipation: makeAudio(p.reelStopAnticipation, 'reel_stop_anticipation'),
    winSmall:             makeAudio(p.winSmall,             'win_small'),
    winMedium:            makeAudio(p.winMedium,            'win_medium'),
    winBig:               makeAudio(p.winBig,               'win_big'),
    winEpic:              makeAudio(p.winEpic,              'win_epic'),
    scatterLand:          makeAudio(p.scatterLand,          'scatter_land'),
    anticipationBuild:    makeAudio(pickLoopUrl(p.anticipationBuild), 'anticipation_build'),
    uiClick:              makeAudio(p.uiClick,              'ui_click'),
  }
  s.bgm.loop = true
  s.bgmTension.loop = true
  s.anticipationBuild.loop = true
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
  // Only audible while it's the active bed (paused otherwise, so this is safe
  // to always assign) - see setOverdriveBed()'s crossfade below.
  sounds.bgmTension.volume            = musicVol * bgmDuck
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

// Restore the persisted mute flag once at load (isMuted itself, gameStore.ts, is
// never edited - only its public .set() is called here, the same as any other
// consumer of the store), then keep every subsequent change persisted too.
if (loadMutePersisted()) {
  isMutedStore.set(true)
}
isMutedStore.subscribe(val => {
  setMuted(val)
  persistMute(val)
})

export function setMuted(val: boolean): void {
  muted = val
  Object.values(sounds).forEach(s => { s.muted = val })
  if (val) {
    // Stop any one-shot clones already playing so disabling sound silences
    // everything at once, not only future sounds.
    activeClones.forEach(c => { c.pause(); c.currentTime = 0 })
    activeClones.clear()
    // R115, STUCK ANTICIPATION. stopAnticipation() has exactly one caller,
    // playReelStop(), and that function returns early while muted - so muting
    // during the tension build meant the build never got stopped. A muted
    // <audio> still plays, it is only silent, so the riser kept running and
    // `bgmDuck` stayed pinned at BGM_DUCK_ANTICIPATION (0.27). On unmute the
    // player heard a riser with no reels moving, over a music bed stuck at 27%
    // for the rest of the session. Tearing it down here is the fix, because
    // this is the one place that always runs when sound goes away.
    if (anticipationActive) stopAnticipation()
  } else {
    // On unmute, restore every volume to the current slider-derived values.
    applyVolumes()
    // R115, SILENT SESSION. playBGM() has exactly one caller, App.svelte:1402,
    // and it returns early when muted WITHOUT setting `bgmStarted`. Nothing
    // called it a second time, so a player whose mute preference was restored
    // from a previous session and who then unmuted got no music at all, for the
    // whole session. Retrying here is safe: playBGM() is idempotent through
    // `bgmStarted`, so this is a no-op whenever the bed is already running.
    playBGM()
  }
}

// ── BGM ─────────────────────────────────────────────────────────────────────

// ── FIRST-GESTURE WARM-UP ───────────────────────────────────────────────────

let audioWarmedUp = false

/**
 * Primes every Audio element's decode pipeline on the very first user gesture
 * (muted play immediately paused) so the FIRST real sound of the session -
 * typically the first spin click - doesn't pay a first-use decode cost inline
 * with gameplay. Idempotent and safe to call more than once; each element's
 * mute state is restored to whatever it already was rather than assumed.
 * GameGrid.svelte's own _prewarmArt() already decodes symbol/fx textures at
 * component mount (before the first gesture in the normal flow), so this is
 * audio-only - textures don't need a second, gesture-gated warm-up pass.
 */
export function warmUpAudio(): void {
  if (audioWarmedUp) return
  audioWarmedUp = true
  Object.values(sounds).forEach((el) => {
    const wasMuted = el.muted
    el.muted = true
    el.play().then(() => {
      el.pause()
      el.currentTime = 0
      el.muted = wasMuted
    }).catch(() => {
      el.muted = wasMuted
    })
  })
}

export function playBGM(): void {
  if (muted || bgmStarted) return
  sounds.bgm.play().then(() => {
    bgmStarted = true
  }).catch(() => {
    // Autoplay blocked, start BGM on the first genuine user gesture, whether
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
    // Last reel during anticipation, use the heavy anticipation stop
    sounds.reelStopAnticipation.currentTime = 0
    sounds.reelStopAnticipation.play().catch(() => {})
    stopAnticipation()
  } else {
    playClone(sounds.reelStop)
  }
}

// ── ANTICIPATION ────────────────────────────────────────────────────────────

/**
 * Start anticipation audio, rising tension during slow reel.
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

// ── OVERDRIVE BED SWAP ──────────────────────────────────────────────────────

const BED_CROSSFADE_MS = 600

let overdriveBedActive = false

/**
 * Ramps an element's volume linearly from `from` to `to` over `durationMs`,
 * reusing the same "duck by adjusting .volume over time" idea as the existing
 * spin/anticipation ducks above, just interpolated instead of a single step.
 */
function rampVolume(el: HTMLAudioElement, from: number, to: number, durationMs: number, onDone?: () => void): void {
  const steps = 20
  const stepMs = durationMs / steps
  let i = 0
  el.volume = Math.max(0, Math.min(1, from))
  const timer = setInterval(() => {
    i += 1
    el.volume = Math.max(0, Math.min(1, from + (to - from) * (i / steps)))
    if (i >= steps) {
      clearInterval(timer)
      onDone?.()
    }
  }, stepMs)
}

/**
 * Dev-only instrumentation for the bed crossfade (2026-07-25).
 *
 * `audio_verify.mjs`'s bedSwapFiredOnBonusBuy / bedRevertedAfterFeature checks
 * failed from 2026-07-13 and survived a real harness click-path fix, so this
 * records WHICH branch the function actually takes rather than inferring it.
 * Guarded by import.meta.env.DEV, so it cannot exist in a production build.
 */
export interface BedSwapTrace {
  calls: number
  earlyReturnSameState: number
  earlyReturnMuted: number
  crossfadeToTension: number
  crossfadeToBase: number
  lastArg: boolean | null
}
const bedTrace: BedSwapTrace = {
  calls: 0, earlyReturnSameState: 0, earlyReturnMuted: 0,
  crossfadeToTension: 0, crossfadeToBase: 0, lastArg: null,
}
if (import.meta.env.DEV) {
  ;(window as unknown as { __bedSwapTrace: BedSwapTrace }).__bedSwapTrace = bedTrace
}

/**
 * Crossfades the base bed (bgm_loop) to the tension bed (bgm_tension) on
 * Overdrive feature entry, and back on exit. Driven by the shared
 * `overdriveVisual` store (App.svelte/FreeSpinsPresentation.svelte already flip
 * it at exactly the feature-entry/exit boundary for the HUD/paytable accents -
 * reused here rather than adding a second signal for the same event).
 */
function setOverdriveBed(active: boolean): void {
  bedTrace.calls++
  bedTrace.lastArg = active
  if (active === overdriveBedActive) { bedTrace.earlyReturnSameState++; return }
  overdriveBedActive = active
  if (muted) { bedTrace.earlyReturnMuted++; return }
  if (active) bedTrace.crossfadeToTension++
  else bedTrace.crossfadeToBase++
  const target = musicVol * bgmDuck

  if (active) {
    sounds.bgmTension.currentTime = 0
    sounds.bgmTension.play().catch(() => {})
    rampVolume(sounds.bgmTension, 0, target, BED_CROSSFADE_MS)
    rampVolume(sounds.bgm, sounds.bgm.volume, 0, BED_CROSSFADE_MS, () => sounds.bgm.pause())
  } else {
    sounds.bgm.play().catch(() => {})
    rampVolume(sounds.bgm, sounds.bgm.volume, target, BED_CROSSFADE_MS)
    rampVolume(sounds.bgmTension, sounds.bgmTension.volume, 0, BED_CROSSFADE_MS, () => {
      sounds.bgmTension.pause()
      sounds.bgmTension.currentTime = 0
    })
  }
}

overdriveVisual.subscribe(setOverdriveBed)

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
 * Play tiered win sound based on multiplier (winAmount / betAmount). Thresholds
 * are aligned to the shipped C1 celebration tiers (WinBanner.svelte's
 * BIG_WIN_THRESHOLD/MEGA_WIN_THRESHOLD/EPIC_WIN_THRESHOLD and telemetry.ts's
 * WIN_TIERS - do not let this drift from those two again, the same way
 * telemetry.ts's own comment already warns against drifting from WinBanner).
 * 0        = dead spin, no sound
 * 0,9.99×  = small win (quiet cloneNode at 0.4 vol)
 * 10,29.99×= medium win
 * 30,99.99×= big win
 * 100×+    = epic win (plays twice with 800ms echo) - also covers the 5,000x
 *            MAX/wincap tier, reusing the epic echo rather than a dedicated
 *            MAX sound, as designed.
 */
export function playWin(multiplier: number): void {
  if (muted || multiplier <= 0) return

  // R117: the boundaries are IMPORTED rather than restated. They were literal
  // 100 / 30 / 10 here, which happened to match the celebration table but was a
  // separate declaration that could drift away from it silently. Audio now tracks
  // whatever the visual tiers do, by construction.
  if (multiplier >= EPIC_WIN_THRESHOLD) {
    // Epic win (and MAX/wincap), play twice with slight delay for emphasis
    sounds.winEpic.currentTime = 0
    sounds.winEpic.play().catch(() => {})
    setTimeout(() => {
      playClone(sounds.winEpic, 0.6)
    }, 800)
  } else if (multiplier >= MEGA_WIN_THRESHOLD) {
    // Big win
    sounds.winBig.currentTime = 0
    sounds.winBig.play().catch(() => {})
  } else if (multiplier >= BIG_WIN_THRESHOLD) {
    // Medium win
    sounds.winMedium.currentTime = 0
    sounds.winMedium.play().catch(() => {})
  } else {
    // Small win. No explicit volume: the BASE table decides, like every other tier.
    playClone(sounds.winSmall)
  }
}

// ── PENDING CUES: WIRED, SILENT, NOT FAKED (R125) ────────────────────────────
//
// Four moments in this game have no stem: feature entry, feature end, retrigger,
// and a dedicated max-win. R125 wires their CALL SITES so the moment the files
// land the cue is one line away, WITHOUT inventing audio to fill the gap. Nothing
// below ships a sound; nothing below pretends a cue is finished.
//
// WHY AN AVAILABILITY LIST RATHER THAN A TRY-AND-FALL-BACK. The obvious shape is
// to build these like every other sound and let makeAudio()'s error handler cope.
// That would be wrong twice over. It would fire four 404s under /sounds/ on every
// session, and `audio_verify.mjs` asserts `zeroSoundRequestFailures` over exactly
// that path (audio_verify.mjs:168) - a green gate would go red for cues that are
// only honestly absent. It would also route each miss into makeAudio()'s fallback,
// which re-points the element at a SECOND file that does not exist either, so the
// player would get a console warning per cue instead of silence.
//
// So availability is DECLARED, not discovered. Nothing is requested until its name
// is in AVAILABLE_PENDING_CUES, which means: no network request, no console noise,
// no gate breakage, and no cue that half-exists.
//
// TO TURN ONE ON, once its mastered file is in the theme sounds directory:
//   1. add the key to AVAILABLE_PENDING_CUES below
//   2. add its path to themeStore.ts's `sounds` map under the same key
// Nothing else changes: the hooks are already at the right call sites.
const PENDING_CUES = {
  featureEnter: 'feature_enter.mp3',
  featureEnd:   'feature_end.mp3',
  retrigger:    'retrigger.mp3',
  winMax:       'win_max.mp3',
} as const
type PendingCue = keyof typeof PENDING_CUES

// EMPTY ON PURPOSE, AND IT IS THE POINT OF THIS BLOCK. No stem exists for any of
// the four as of R125. An entry here is a claim that a real mastered file ships at
// that name - do not add one to "wire it up" ahead of the audio.
const AVAILABLE_PENDING_CUES = new Set<PendingCue>([])

// Design volumes for the four, on the same scale as BASE above. They are declared
// now so the loudness decision is made once, in the same table as every other cue,
// rather than improvised at drop-in time. winMax sits above winEpic (0.95) because
// it is the single loudest moment the game has; the feature bookends sit near the
// medium tier so they announce without competing with the win ladder.
const PENDING_BASE: Record<PendingCue, number> = {
  featureEnter: 0.85,
  featureEnd:   0.70,
  retrigger:    0.80,
  winMax:       1.00,
}

const pendingEls = new Map<PendingCue, HTMLAudioElement>()

/**
 * Dev-only instrumentation for the four pending cues (R125).
 *
 * A hook that is CORRECT today is a hook that fires and makes no sound, and those
 * two facts are indistinguishable from a hook that was never called at all - which
 * is how dead wiring survives review. `__playedSounds` in audio_verify.mjs patches
 * HTMLMediaElement.play(), so by construction it cannot see a cue that deliberately
 * never reaches play(). Counting at the boundary instead, which is the same answer
 * this file already reached for the bed crossfade above (Fable ruling 23: keep the
 * instrumentation as the assert).
 *
 * `fired` counts hook calls; `played` counts the ones that reached real audio. While
 * AVAILABLE_PENDING_CUES is empty the correct reading is fired > 0, played === 0.
 * When a stem lands, the same counter proves it started playing.
 */
export interface PendingCueTrace {
  fired: Record<PendingCue, number>
  played: Record<PendingCue, number>
  mutedSkips: number
}
const pendingTrace: PendingCueTrace = {
  fired:  { featureEnter: 0, featureEnd: 0, retrigger: 0, winMax: 0 },
  played: { featureEnter: 0, featureEnd: 0, retrigger: 0, winMax: 0 },
  mutedSkips: 0,
}
if (import.meta.env.DEV) {
  ;(window as unknown as { __pendingCueTrace: PendingCueTrace }).__pendingCueTrace = pendingTrace
}

/** Returns the element for a pending cue, or null while the cue has no file.
 *  Constructed lazily and cached, so an unavailable cue never touches the network. */
function pendingEl(cue: PendingCue): HTMLAudioElement | null {
  if (!AVAILABLE_PENDING_CUES.has(cue)) return null
  const cached = pendingEls.get(cue)
  if (cached) return cached
  const paths = get(themeAssets).sounds as Record<string, string | undefined>
  const url = paths[cue] ?? `${FS_BASE}/${PENDING_CUES[cue]}`
  // No makeAudio(): its fallback would re-point a missing file at a second missing
  // file. A declared-available cue that still fails is a real fault, so it is left
  // to surface as one rather than being papered over.
  const el = new Audio(url)
  pendingEls.set(cue, el)
  return el
}

/** Play a pending cue if its stem exists. Returns whether anything was played, so
 *  callers that must not go silent (max win) can fall back to what ships today. */
function playPending(cue: PendingCue): boolean {
  pendingTrace.fired[cue]++
  if (muted) { pendingTrace.mutedSkips++; return false }
  const el = pendingEl(cue)
  if (!el) return false
  el.currentTime = 0
  el.volume = Math.min(1, PENDING_BASE[cue] * sfxVol)
  el.play().catch(() => {})
  pendingTrace.played[cue]++
  return true
}

/** Feature entry. Silent until feature_enter.mp3 exists. */
export function playFeatureEnter(): void { playPending('featureEnter') }

/** Feature end. Silent until feature_end.mp3 exists. */
export function playFeatureEnd(): void { playPending('featureEnd') }

/** Retrigger landed. Silent until retrigger.mp3 exists. */
export function playRetrigger(): void { playPending('retrigger') }

/**
 * Max win / wincap.
 *
 * This one is NOT silent today and must not become silent: the max win currently
 * reuses the epic win stinger and its 800ms echo, which soundService has done
 * deliberately since R5 (see playWin's doc). So this plays the dedicated stem when
 * one exists and otherwise does exactly what the game does today - an upgrade path,
 * not a hole. `multiplier` is only used by that fallback.
 */
export function playMaxWin(multiplier: number): void {
  if (playPending('winMax')) return
  playWin(multiplier)
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
  // Legacy alias, now use playScatterLand for individual scatter events
  playScatterLand()
}
