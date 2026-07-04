// File: src/lib/stores/replayStore.ts
// Purpose: Replay-specific state. Parallel to (not modifying) gameStore.ts.

import { writable } from 'svelte/store'
import type { ReplayParams, ReplayResponse } from '../services/replayService'

/** Current replay params parsed from URL, or null if not in replay mode */
export const replayParams = writable<ReplayParams | null>(null)

/** Replay endpoint response, populated after fetchReplay() succeeds */
export const replayResponse = writable<ReplayResponse | null>(null)

/** UI phase of the replay flow */
export type ReplayPhase =
  | 'loading'   // Fetching replay data from RGS
  | 'ready'     // Data loaded; waiting for user to press Start Replay
  | 'playing'   // Animation in progress
  | 'complete'  // Animation finished; showing Play Again
  | 'error'     // Fetch or playback failed

export const replayPhase = writable<ReplayPhase>('loading')

/** Error message if fetch or playback failed */
export const replayError = writable<string | null>(null)
