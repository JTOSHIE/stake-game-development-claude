// sessionRecovery.ts - R11 / TR-035 (2026-07-25). Non-locked.
//
// THE GAP
//
// The authenticate response carries a round when one is still in progress, and
// rgsService.authenticate() maps it faithfully. initRGS() then throws it away:
// it publishes balance, currency, bet levels and jurisdiction flags, and never
// looks at `round`.
//
// So a player who reloads mid-round - a dropped connection, a phone rotating
// into a browser reload, a crash during the free-spins presentation - came back
// to a fresh game while the RGS still held an open round for them. That is
// money: a computed win waiting to be credited, with nothing ever going to ask
// for it.
//
// RETYPED TO THE OFFICIAL CONTRACT, R2R JOB 4, 2026-07-25.
//
// This module previously modelled the round as `{ roundId: string, state:
// 'open' | 'pending_end' }`. Both fields were invented. The official round, at
// the pinned ts-client ref, is `{ betID: number, amount?, payout?,
// payoutMultiplier?, active: boolean, mode: string, event?, state: unknown }`:
// the identity is a NUMBER called `betID`, the in-progress signal is a BOOLEAN
// called `active`, and `state` is the round's own game payload rather than a
// status string. There is no `'pending_end'` anywhere in the official contract.
//
// TWO CONSEQUENCES, both recorded rather than acted on unilaterally:
//
//   1. The auto-settle branch is REMOVED, not disabled. It fired on
//      `state === 'pending_end'`, a value no platform response can produce, so
//      against a real RGS it was already unreachable. Leaving unreachable
//      money-path code behind a false condition is worse than deleting it,
//      because the next reader believes the case is handled.
//
//   2. TR-035b's premise has changed and the row needs re-ruling. It was parked
//      because "recovering an open round needs the round's events, and
//      authenticate does not return them". Under the official contract
//      authenticate DOES return them: `round.state` is the same payload the Bet
//      Replay endpoint serves, so the presentation is rebuildable. The official
//      client's own instruction is likewise unambiguous, that EndRound is
//      called when a round is active. This module still parks rather than
//      settles, because changing recovery BEHAVIOUR is TR-035b's decision and
//      not JOB 4's, and because the inference about where `state` puts its
//      events wants DTT confirmation before a settle rides on it.
//
// Everything here is a no-op in mock/dev, where there is no session to recover.

// `get` and the `balance` store were used only by the auto-settle branch that
// fired on the invented `'pending_end'` state. That branch is gone (see the
// header), so the imports go with it rather than lingering as a hint that this
// module still writes to the balance. It does not.
import { writable } from 'svelte/store'
import { parseSessionParams, authenticate, endRound } from '../services/rgsService'
import type { OfficialRound } from '../services/rgsService'

/**
 * The official round, narrowed to the three fields recovery reads. Named
 * ActiveRound still, so consumers and the existing proof keep compiling.
 */
export interface ActiveRound {
  betID: number
  active: boolean
  /** The round's own game payload. Carries the events; see the header. */
  state: unknown
}

export type RecoveryOutcome =
  | { kind: 'none' }                                   // nothing to recover
  | { kind: 'settled'; betID: number; balance: number }
  | { kind: 'open-round-parked'; betID: number }       // needs DTT semantics
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
    const round: OfficialRound | null = auth.round ?? null

    // `active: false` is a round the platform has already closed. It is
    // reported in the authenticate response as history, not as work, and
    // treating it as recoverable would settle a round twice.
    if (!round || round.active !== true) {
      activeRound.set(null)
      const out: RecoveryOutcome = { kind: 'none' }
      lastRecovery.set(out)
      return out
    }

    activeRound.set({ betID: round.betID, active: round.active, state: round.state })

    // Parked, deliberately. See the header: the official contract says to call
    // EndRound here, and `round.state` now gives us the events to present the
    // round properly first. Both of those change TR-035b's premise, and TR-035b
    // is the row that owns the decision. JOB 4's scope is the contract, not the
    // recovery policy.
    const out: RecoveryOutcome = { kind: 'open-round-parked', betID: round.betID }
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
