// audioSettings.ts — independent MUSIC and SOUND (SFX) volume controls.
//
// Two writable stores, each a number in [0, 1]:
//   musicVolume — master scalar for the background music (BGM)
//   sfxVolume   — master scalar for every non-BGM ("SFX") sound
//
// Both persist to localStorage so a player's mix survives a reload. Loading is
// fully guarded (SSR / blocked storage / missing key / NaN all fall back to the
// default) and every change is saved via a .subscribe. These sit alongside the
// existing master-mute flag (isMuted in gameStore): mute still overrides volume,
// these sliders set the loudness that mute restores to on unmute.

import { writable } from 'svelte/store'

const MUSIC_KEY = 'fs_music_volume'
const SFX_KEY   = 'fs_sfx_volume'

export const MUSIC_DEFAULT = 0.5
export const SFX_DEFAULT   = 0.8

/** Clamp any value into [0, 1]; non-finite input falls back to the default. */
function clamp01(v: number, fallback: number): number {
  if (typeof v !== 'number' || Number.isNaN(v) || !Number.isFinite(v)) return fallback
  if (v < 0) return 0
  if (v > 1) return 1
  return v
}

// Resolve the initial value from localStorage, guarded so a blocked or absent
// storage never throws. A missing key or an unparseable / NaN value yields the
// default.
function initial(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return clamp01(parseFloat(raw), fallback)
  } catch {
    return fallback
  }
}

function persist(key: string, value: number): void {
  try { localStorage.setItem(key, String(value)) } catch {}
}

export const musicVolume = writable<number>(initial(MUSIC_KEY, MUSIC_DEFAULT))
export const sfxVolume   = writable<number>(initial(SFX_KEY,   SFX_DEFAULT))

// Save on every change (also clamps whatever a consumer wrote, though the UI
// bindings already keep it in range).
musicVolume.subscribe((v) => persist(MUSIC_KEY, clamp01(v, MUSIC_DEFAULT)))
sfxVolume.subscribe((v)   => persist(SFX_KEY,   clamp01(v, SFX_DEFAULT)))
