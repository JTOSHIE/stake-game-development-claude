// sessionRecovery.ts - R11 / TR-017 (2026-07-25). Non-locked.
//
// THE GAP
//
// The authenticate response carries `round?: { roundId, state }`, present when a
// round is still in progress, and rgsService.authenticate() maps it faithfully
// (line 334). initRGS() then throws it away: it publishes balance, currency,
// bet levels and jurisdiction flags, and never looks at `round`.
//
// So a player who reloads mid-round - a dropped connection, a phone rotating
// into a browser reload, a crash during the free-spins presentation - came back
// to a fresh game while the RGS still held an open round for them. On a
// `pending_end` round that is money: the win is computed and waiting to be
// credited, and nothing was ever going to ask for it.
//
// rgsService.ts is locked and out of scope for this run. It does not need to
// change: `parseSessionParams`, `authenticate` and `endRound` are all exported,
// so recovery is entirely implementable from outside the lock.
//
// WHAT THIS DOES, AND WHERE IT STOPS
//
//   state 'pending_end'  the round is settled by calling the platform's own
//                        endRound, which credits it and returns the
//                        authoritative balance. Unambiguous, and done.
//
//   state 'open'         the round exists but has NOT been resolved. Recovering
//                        it needs the round's events, and authenticate does not
//                        return them. This module surfaces the open round and
//                        stops there. It does NOT guess: settling an open round
//                        could forfeit a feature the player has not seen, and
//                        fabricating a presentation for it would be inventing an
//                        outcome. The options are recorded in the tracker as
//                        TR-017b and resolved empirically at the DTT session.
//
// Everything here is a no-op in mock/dev, where there is no session to recover.

import { writable, get } from 'svelte/store'
import { parseSessionParams, authenticate, endRound } from '../services/rgsService'
import { balance } from './gameStore'

export interface ActiveRound {
  roundId: string
  state: 'open' | 'pending_end'
}

export type RecoveryOutcome =
  | { kind: 'none' }                                   // nothing to recover
  | { kind: 'settled'; roundId: string; balance: number }
  | { kind: 'open-round-parked'; roundId: string }     // needs DTT semantics
  | { kind: 'failed'; error: string }

/** The round the RGS says is still in progress, or null. */
export const activeRound = writable<ActiveRound | null>(null)

/** The last recovery attempt's outcome, for diagnostics and the proof. */
export const lastRecovery = writable<RecoveryOutcome>({ kind: 'none' })

/**
 * The three platform calls recovery makes, injectable so the branches can be
 * tested. ES module exports are read-only bindings and cannot be stubbed in
 * place, and the branch that matters most - a pending_end round waiting to be
 * credited - cannot be produced on demand against a live RGS. Production passes
 * nothing and gets the real implementations.
 */
export interface RecoveryPlatform {
  parseSessionParams: typeof parseSessionParams
  authenticate: typeof authenticate
  endRound: typeof endRound
}
const REAL: RecoveryPlatform = { parseSessionParams, authenticate, endRound }

/**
 * Read the session's in-progress round and act on it.
 *
 * Deliberately tolerant: a recovery failure must never stop the player getting
 * into the game, so every error path resolves rather than throws. A blocked
 * session is the live guard's job (R2), not this module's.
 */
export async function recoverSession(
  isDev: boolean,
  platform: RecoveryPlatform = REAL,
): Promise<RecoveryOutcome> {
  if (isDev) {
    const out: RecoveryOutcome = { kind: 'none' }
    lastRecovery.set(out)
    return out
  }
  try {
    const params = platform.parseSessionParams()
    const auth = await platform.authenticate(params)
    const round = auth.round as ActiveRound | undefined
    if (!round) {
      activeRound.set(null)
      const out: RecoveryOutcome = { kind: 'none' }
      lastRecovery.set(out)
      return out
    }
    activeRound.set(round)

    if (round.state === 'pending_end') {
      const resp = await platform.endRound(params, round.roundId)
      balance.set(resp.balance)
      activeRound.set(null)
      const out: RecoveryOutcome = { kind: 'settled', roundId: round.roundId, balance: resp.balance }
      lastRecovery.set(out)
      return out
    }

    const out: RecoveryOutcome = { kind: 'open-round-parked', roundId: round.roundId }
    lastRecovery.set(out)
    return out
  } catch (err) {
    const out: RecoveryOutcome = { kind: 'failed', error: err instanceof Error ? err.message : String(err) }
    lastRecovery.set(out)
    return out
  }
}

/** Test helper. Not used by production code. */
export function resetSessionRecovery(): void {
  activeRound.set(null)
  lastRecovery.set({ kind: 'none' })
}
