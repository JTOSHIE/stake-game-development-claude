// reelMode.ts — non-locked dev toggle for the reel choreography (Reel Feel v3).
//
// Both choreographies share one tile-unit engine (GameGrid): 'strip' scrolls a
// wrapped vertical strip, 'drop' releases the same tiles from above the frame
// with gravity easing. The toggle switches choreography only; result rows are
// identical. Dev-only per the brief: default 'strip', overridable via a
// ?fs_reel_mode= URL param or a persisted localStorage key (guarded, falling
// back to sessionStorage then in-memory like the intro-splash flag), and
// surfaced through a DEV-gated control in App.svelte.

import { writable } from 'svelte/store'

export type ReelMode = 'strip' | 'drop'

const KEY = 'fs_reel_mode'
const VALUES: ReelMode[] = ['strip', 'drop']

function isMode(v: string | null): v is ReelMode {
  return v === 'strip' || v === 'drop'
}

// Resolve the initial mode: URL param wins (explicit dev override), then the
// persisted key, then the default. Every access is guarded so a blocked or
// absent storage never throws or logs.
function initialMode(): ReelMode {
  try {
    const q = new URLSearchParams(window.location.search).get(KEY)
    if (isMode(q)) return q
  } catch {}
  try {
    const s = localStorage.getItem(KEY)
    if (isMode(s)) return s
  } catch {}
  try {
    const s = sessionStorage.getItem(KEY)
    if (isMode(s)) return s
  } catch {}
  return 'strip'
}

export const reelMode = writable<ReelMode>(initialMode())

function persist(mode: ReelMode): void {
  try { localStorage.setItem(KEY, mode); return } catch {}
  try { sessionStorage.setItem(KEY, mode) } catch {}
}

/** Set the reel mode and persist it (guarded). */
export function setReelMode(mode: ReelMode): void {
  reelMode.set(mode)
  persist(mode)
}

/** Toggle strip <-> drop and persist. */
export function cycleReelMode(): void {
  reelMode.update((m) => {
    const next = VALUES[(VALUES.indexOf(m) + 1) % VALUES.length]
    persist(next)
    return next
  })
}
