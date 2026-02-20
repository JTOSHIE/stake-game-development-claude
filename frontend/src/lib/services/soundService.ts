// soundService.ts — Lightweight HTML5 Audio manager for Future Spinner
//
// All sounds are lazily loaded on first call so the browser can start playback
// only after a user gesture (avoids autoplay-policy errors).
// Every call checks isMuted so no stub-mode toggling is needed in callers.

import { get } from 'svelte/store'
import { isMuted } from '../stores/gameStore'

// ── Internal helpers ──────────────────────────────────────────────────────────

const cache: Map<string, HTMLAudioElement> = new Map()

function play(src: string, volume = 1.0): void {
  if (get(isMuted)) return
  let audio = cache.get(src)
  if (!audio) {
    audio = new Audio(src)
    cache.set(src, audio)
  }
  audio.currentTime = 0
  audio.volume = Math.min(1, Math.max(0, volume))
  audio.play().catch(() => {
    // Autoplay policy or missing asset — fail silently
  })
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Played when the spin button is pressed, before reels start moving. */
export function playSpin(): void {
  play('/assets/sounds/spin_start.mp3', 0.7)
}

/** Played once per reel as it stops. Call with reel index 0–4. */
export function playReelStop(reelIndex = 0): void {
  // Slight pitch shift gives depth: volume tapers from 0.65 → 0.45 across reels
  const vol = 0.65 - reelIndex * 0.04
  play('/assets/sounds/reel_stop.mp3', vol)
}

/** Played after wins are evaluated; tier drives volume. */
export function playWin(tier: 'small' | 'big' | 'mega' | 'huge' = 'small'): void {
  const MAP: Record<string, [string, number]> = {
    small: ['/assets/sounds/win_small.mp3', 0.6],
    big:   ['/assets/sounds/win_big.mp3',   0.75],
    mega:  ['/assets/sounds/win_mega.mp3',  0.85],
    huge:  ['/assets/sounds/win_huge.mp3',  1.0],
  }
  const [src, vol] = MAP[tier]
  play(src, vol)
}

/** Short click feedback for UI buttons (bet nudge, mute toggle, etc.). */
export function playClick(): void {
  play('/assets/sounds/ui_click.mp3', 0.45)
}
