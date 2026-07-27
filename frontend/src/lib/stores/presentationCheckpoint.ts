// presentationCheckpoint.ts - TR-099 (2026-07-28). Non-locked.
//
// Specification: `docs/design/FEATURE_RESUME_DESIGN.md`. This module is the
// storage half of it.
//
// THE ONE IDEA. What is persisted is a presentation CURSOR, never presentation
// CONTENT. The cursor is an INDEX into the round's own event sequence. Every
// number the player is then shown is read out of the freshly interpreted
// `PresentationScript` on the recovering boot, because
// `FreeSpinsPresentation.nextSpin()` already derives the meter, the running
// total and the spins remaining from the script.
//
// WHY THAT MATTERS MORE THAN IT LOOKS. `localStorage` is player-editable. Under
// this design the worst a forged checkpoint can do is SKIP PART OF AN ANIMATION
// of the player's own round. It cannot move a balance, a total or a payout,
// because not one of those is read from here. Divergence from the round's true
// figures is structurally impossible rather than carefully avoided, and that is
// the property that makes local storage acceptable for this at all.
//
// The stored totals exist ONLY as a checksum. They are never rendered. If they
// disagree with the script at that index the checkpoint is not trusted, because
// a disagreement means the cursor describes a different round than the one the
// RGS just handed us.
//
// EVERY FAILURE IS THE SAME FAILURE. Absent, wrong version, wrong round, out of
// range, checksum mismatch, unreadable storage: all of them resolve to "no
// checkpoint", and the caller falls back to the replay-then-settle flow that
// ships today. One fallback, already proven. A recovery feature with several
// failure modes has several ways to be wrong.

import type { PresentationScript } from '../services/roundInterpreter'

/** One key. A session has at most one active round; see the design's section 4. */
const KEY = 'fs:presentation-checkpoint'

/**
 * Schema version. A change to `PresentationScript`'s shape would make an old
 * cursor point at something different, so a mismatch is discarded rather than
 * misread. One line, and it removes a whole class of silent error.
 */
const VERSION = 1

/** `freeSpinIndex` when the entry has been accepted but no free spin has finished. */
export const BEFORE_FIRST_SPIN = -1

export interface PresentationCheckpoint {
  v: number
  /** The official round identity, `OfficialRound.betID`. */
  betID: number
  phase: 'free'
  /** Index into `script.freeSpins` of the LAST COMPLETED spin, or -1. */
  freeSpinIndex: number
  // ── checksum only, never rendered ──────────────────────────────────────────
  seenTotalCentibets: number
  seenMeter: number
}

/**
 * Every storage touch goes through here.
 *
 * A private-mode browser, a full quota, a disabled storage API and a
 * `SecurityError` all land in the same place: the fallback. The player is never
 * shown an error about storage, because storage is not their problem and the
 * round is recoverable without it.
 */
function safely<T>(fn: () => T, fallback: T): T {
  try {
    if (typeof localStorage === 'undefined') return fallback
    return fn()
  } catch {
    return fallback
  }
}

export function writeCheckpoint(cp: Omit<PresentationCheckpoint, 'v'>): void {
  safely(() => {
    localStorage.setItem(KEY, JSON.stringify({ ...cp, v: VERSION }))
  }, undefined)
}

export function clearCheckpoint(): void {
  safely(() => localStorage.removeItem(KEY), undefined)
}

/** The raw record, or null. Shape-checked here so callers never see a partial. */
export function readCheckpoint(): PresentationCheckpoint | null {
  return safely(() => {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PresentationCheckpoint>
    if (
      typeof parsed !== 'object' || parsed === null ||
      parsed.v !== VERSION ||
      typeof parsed.betID !== 'number' ||
      parsed.phase !== 'free' ||
      typeof parsed.freeSpinIndex !== 'number' ||
      typeof parsed.seenTotalCentibets !== 'number' ||
      typeof parsed.seenMeter !== 'number'
    ) return null
    return parsed as PresentationCheckpoint
  }, null)
}

/**
 * What the script itself says the totals were at a given cursor. The single
 * place the checksum is computed, so the writer and the validator cannot drift:
 * a checksum computed two ways is not a checksum.
 */
export function figuresAt(script: PresentationScript, freeSpinIndex: number):
  { seenTotalCentibets: number; seenMeter: number } {
  if (freeSpinIndex < 0) {
    return { seenTotalCentibets: script.baseSpin.runningTotalCentibets, seenMeter: 1 }
  }
  const spin = script.freeSpins[freeSpinIndex]
  return { seenTotalCentibets: spin.runningTotalCentibets, seenMeter: spin.meterAfter }
}

export type CheckpointRejection =
  | 'none'            // nothing stored, or storage unreadable
  | 'bet-id'          // a checkpoint for a different round
  | 'not-triggered'   // this round never entered the feature
  | 'out-of-range'    // the cursor points past the end of this script
  | 'checksum'        // the stored figures disagree with the script

export interface CheckpointVerdict {
  /** The index of the first free spin to PLAY, when the cursor is trusted. */
  resumeFromIndex: number | null
  rejection: CheckpointRejection | null
}

/**
 * Decide whether a stored cursor may be used against THIS round's script.
 *
 * Returns the index of the first spin to play, or a named rejection. The
 * rejection is named rather than boolean so the proof can assert WHICH guard
 * fired: a validator that rejects everything for the wrong reason passes a
 * boolean test and is still broken.
 */
export function validateCheckpoint(
  cp: PresentationCheckpoint | null,
  script: PresentationScript,
  betID: number,
): CheckpointVerdict {
  if (!cp) return { resumeFromIndex: null, rejection: 'none' }
  if (cp.betID !== betID) return { resumeFromIndex: null, rejection: 'bet-id' }
  if (!script.triggered) return { resumeFromIndex: null, rejection: 'not-triggered' }

  const next = cp.freeSpinIndex + 1
  // `next === length` would mean every spin is already played, which is not a
  // resume, it is a finished feature. Rejecting it sends that case to the
  // replay, which ends on the same summary either way.
  if (cp.freeSpinIndex < BEFORE_FIRST_SPIN || next >= script.freeSpins.length) {
    return { resumeFromIndex: null, rejection: 'out-of-range' }
  }

  const truth = figuresAt(script, cp.freeSpinIndex)
  if (truth.seenTotalCentibets !== cp.seenTotalCentibets || truth.seenMeter !== cp.seenMeter) {
    return { resumeFromIndex: null, rejection: 'checksum' }
  }
  return { resumeFromIndex: next, rejection: null }
}

/** Test helper. Not used by production code. */
export function resetPresentationCheckpoint(): void {
  clearCheckpoint()
}
