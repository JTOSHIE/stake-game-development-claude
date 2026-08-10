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
//      Replay endpoint serves, so the presentation is rebuildable.
//
// ============================================================================
// RESUME AND SETTLE, R2R-R JOB B, 2026-07-26, per Fable's re-ruling on TR-035b.
// ============================================================================
//
// The row is re-ruled and this module now RESUMES AND SETTLES. THERE IS NO
// FORFEIT PATH, and the absence is the point: the reason the old design parked
// was that settling blind could take a feature the player had never seen, and
// the only honest alternatives were to forfeit it or to guess at it. Neither is
// necessary once the events are in hand.
//
// The sequence, in this order and for these reasons:
//
//   1. EXTRACT the round's events from `round.state`, using the same tolerant
//      extraction the service uses (`_extractRoundEvents`, imported rather than
//      reimplemented, so recovery and live play cannot disagree about where a
//      round's events live).
//   2. INTERPRET them through `roundInterpreter`, the canonical reader. The
//      script it returns is the same shape the live path and Bet Replay both
//      present, so the player sees the true outcome of their own round rather
//      than a summary of it.
//   3. PRESENT, by awaiting the caller's playback. Playback comes BEFORE the
//      settle deliberately. A player who reloads during a free-spins round is
//      owed the round, not just its number, and settling first would let the
//      balance jump before the presentation explained why.
//   4. SETTLE via `endRound`, then adopt the authoritative balance it returns.
//   5. BANNER, once, plainly: the previous round has been completed and its
//      result applied.
//
// WHAT HAPPENS IF THE EVENTS ARE NOT WHERE WE THINK. Extraction returns an
// empty array rather than throwing, and an empty array still settles. The money
// is not held hostage to the presentation: a round we cannot replay is still a
// round the platform is holding open, and leaving it open to avoid an
// unexplained balance change would be the worse failure by a wide margin. The
// outcome records `presented: false` so the case is visible rather than silent.
//
// WHAT REMAINS FOR DTT. Not the design, which is settled. Only the confirmation
// that a real active round carries its events at `round.state.events`, which is
// inference from the Bet Replay endpoint until a live payload is seen.
//
// Everything here is a no-op in mock/dev, where there is no session to recover.

import { writable } from 'svelte/store'
import {
  parseSessionParams, authenticate, endRound, _extractRoundEvents,
} from '../services/rgsService'
import type { OfficialRound } from '../services/rgsService'
import { interpretEvents, type PresentationScript } from '../services/roundInterpreter'
import { balance, betAmount } from './gameStore'
import { rgsBetConfig, openingBet } from './rgsBetConfig'
import { authPublishedNothing, publishedNothing } from './authShape'
import { CURRENCY_SCALE } from '../utils/currency'
import {
  readCheckpoint, clearCheckpoint, validateCheckpoint, type CheckpointRejection,
} from './presentationCheckpoint'
import { liveGuardReason } from './liveGuard'

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
  /** Resumed and settled. `presented` is false only when the round carried no
   *  readable events, in which case it was settled without a replay. */
  | { kind: 'resumed'; betID: number; balance: number; presented: boolean; triggered: boolean
      /** TR-099. The first spin played, or null when the round was replayed whole. */
      resumedFromIndex?: number | null
      /** TR-099. Why a stored cursor was not used, when one was rejected. */
      checkpointRejection?: CheckpointRejection | null }
  | { kind: 'failed'; error: string }
  /** Presented, then end-round failed. The platform still holds the round and
   *  the win was never credited. Distinct from 'failed' because the player has
   *  ALREADY BEEN SHOWN the round, so silence is not an available option. */
  | { kind: 'settle-failed'; betID: number; error: string }

/** The round the RGS says is still in progress, or null. */
export const activeRound = writable<ActiveRound | null>(null)

/** The last recovery attempt's outcome, for diagnostics and the proof. */
export const lastRecovery = writable<RecoveryOutcome>({ kind: 'none' })

// NO `recoveredScript` STORE. An earlier draft published the interpreted script
// as a store as well as handing it to the playback callback, and the dead-wiring
// gate correctly failed it: nothing ever read the store, because the callback
// already carries the script to the only consumer that wants it. A store that
// looks wired and is not is exactly the standingMode shape that gate exists to
// catch, and allowlisting it would have been the wrong answer to a correct
// finding.

/**
 * True once a round has been resumed and settled. Drives ONE plain banner.
 *
 * Deliberately a boolean and not a queue: a session recovers at most one round,
 * at boot, and a banner that could stack would invite a design where it does.
 */
export const recoveryBannerVisible = writable<boolean>(false)

/** Dismiss the banner. The player may close it; nothing depends on it staying. */
export function dismissRecoveryBanner(): void {
  recoveryBannerVisible.set(false)
}

/**
 * The three platform calls recovery makes, injectable so the branches can be
 * tested. ES module exports are read-only bindings and cannot be stubbed in
 * place, and an active round cannot be produced on demand against a live RGS.
 * Production passes nothing and gets the real implementations.
 */
export interface RecoveryPlatform {
  parseSessionParams: typeof parseSessionParams
  authenticate: typeof authenticate
  endRound: typeof endRound
}
const REAL: RecoveryPlatform = { parseSessionParams, authenticate, endRound }

/**
 * Play the recovered round back. Production passes App.svelte's presentation
 * driver; tests pass a spy; the default resolves immediately so a caller that
 * has no presentation still settles correctly rather than stalling.
 *
 * TR-099: `resumeFromIndex` is the first free spin to PLAY when the player
 * accepted a RESUME, and null for a full replay. A driver that ignores it still
 * behaves exactly as it did before this feature existed, which is what keeps
 * the fallback path honest.
 */
export type PresentFn = (script: PresentationScript, resumeFromIndex?: number | null) => Promise<void>
const NO_PRESENTATION: PresentFn = async () => {}

/**
 * Ask the player whether to continue from where they left off.
 *
 * OFFERED, NEVER ASSUMED, and the second reason is the one that matters: a
 * player who left BECAUSE something looked wrong needs a way to see the whole
 * round, and auto-resuming would remove the only route to the full replay at
 * exactly the moment they most want it.
 *
 * The default DECLINES, so any caller that does not implement the offer gets
 * today's full-replay behaviour rather than a silent skip.
 */
export type OfferResumeFn = (info: { playedSpins: number; totalSpins: number }) => Promise<boolean>
const NO_OFFER: OfferResumeFn = async () => false

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
  present: PresentFn = NO_PRESENTATION,
  offerResume: OfferResumeFn = NO_OFFER,
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

    // DID THE PLATFORM ACTUALLY SEND A SESSION? See stores/authShape.ts for why
    // this judgement is made HERE and not folded into the live guard's
    // authErrored flag: that flag also gates this very function, and this
    // function is what settles an open round and credits its payout.
    authPublishedNothing.set(publishedNothing(auth))

    // PUBLISH THE REST OF THE BETTING PARAMETERS, 2026-08-09.
    //
    // Published item: "Game dynamically uses ALL betting parameters from the
    // authenticate response". betLevels was consumed; minBet, maxBet, stepBet
    // and defaultBetLevel were parsed and dropped. Measured against a stubbed
    // platform: with defaultBetLevel 100 the game opened on 20, the bottom rung,
    // because the only thing that moved the bet was HudOverlay's snap from the
    // hardcoded 1.00 default.
    //
    // WHY HERE RATHER THAN IN THE SERVICE. initRGS is the obvious home and it is
    // inside rgsService.ts, which is LOCKED. This function already calls
    // authenticate on every launch and already holds the whole response, so
    // publishing from here needs no lock exception and adds no network call.
    // The owner sanctioned a locked edit for this; it turned out not to be
    // needed, and an unnecessary locked edit is worse than none.
    rgsBetConfig.set({
      minBet:          auth.minBet ?? 0,
      maxBet:          auth.maxBet ?? 0,
      stepBet:         auth.stepBet ?? 0,
      defaultBetLevel: auth.defaultBetLevel ?? 0,
    })

    // Open on the operator's chosen bet. Suppressed when a round is active,
    // because the stake actually at risk is restored below from round.amount and
    // that is the higher-priority truth for a resumed session.
    const opening = openingBet(
      {
        minBet: auth.minBet ?? 0, maxBet: auth.maxBet ?? 0,
        stepBet: auth.stepBet ?? 0, defaultBetLevel: auth.defaultBetLevel ?? 0,
      },
      auth.betLevels ?? [],
      round?.active === true,
    )
    if (opening !== null) betAmount.set(opening)

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

    // RESTORE THE STAKE BEFORE ANYTHING PRESENTS, 2026-08-09.
    //
    // Published checklist item "Active rounds restore the bet amount from the
    // authenticate response". `round.amount` is the stake in micros and it was
    // carried all the way here and then never read: a repo-wide search for it
    // in production code returned nothing.
    //
    // THE BET READOUT IS THE SMALL HALF. The presentation converts the round's
    // centibet awards into MONEY using whatever `betAmount` currently holds, so
    // a player who reloads mid-round on a $5.00 stake was shown their own round
    // played back with every figure computed from the $1.00 default: a fifth of
    // the real amounts, on a round whose outcome was already settled. Restoring
    // the stake fixes the readout and the arithmetic in one write.
    //
    // It must land HERE, before the presentation is built and before the resume
    // offer is awaited, or the first frames render against the wrong bet.
    //
    // Guarded rather than unconditional: `amount` is optional in the pinned
    // OfficialRound type, and a zero or absent value would silently zero every
    // figure the presentation derives. Absent means "keep what we have", which
    // is the current behaviour, not a regression.
    if (typeof round.amount === 'number' && Number.isFinite(round.amount) && round.amount > 0) {
      betAmount.set(round.amount / CURRENCY_SCALE)
    }

    // 1. EXTRACT, using the service's own reader rather than a second copy.
    const events = _extractRoundEvents(round.state)

    // 2. INTERPRET. An empty event list still produces a script; what it does
    //    not produce is anything worth showing, which `presented` records.
    let script: PresentationScript | null = null
    let triggered = false
    if (events.length > 0) {
      script = interpretEvents(events)
      triggered = script.triggered
    }

    // 2b. THE CURSOR, TR-099. Read a stored presentation checkpoint and decide
    //     whether it may be used against THIS round's script. Every rejection
    //     falls to the same place: the full replay below, which is the flow
    //     that shipped before this feature existed.
    let resumeFromIndex: number | null = null
    let checkpointRejection: CheckpointRejection | null = null
    if (script) {
      const verdict = validateCheckpoint(readCheckpoint(), script, round.betID)
      checkpointRejection = verdict.rejection
      if (verdict.rejection !== null) {
        // A cursor we will not use is a cursor that should not survive. The
        // 'none' case clears nothing, because there was nothing there.
        if (verdict.rejection !== 'none') clearCheckpoint()
      } else if (verdict.resumeFromIndex !== null) {
        // OFFERED, not applied. Declining is a first-class choice and plays the
        // round from the start; both branches settle identically.
        const accepted = await offerResume({
          playedSpins: verdict.resumeFromIndex,
          totalSpins: script.freeSpins.length,
        })
        if (accepted) resumeFromIndex = verdict.resumeFromIndex
        else clearCheckpoint()
      }
    }

    // 3. PRESENT, before settling. See the header: a player who reloaded during
    //    a feature is owed the round, not just its number.
    if (script) {
      await present(script, resumeFromIndex)
    }

    // 4. SETTLE. This runs whether or not the replay ran. A round we cannot
    //    present is still a round the platform is holding open, and leaving it
    //    open to avoid an unexplained balance change is the worse failure.
    //
    //    A SETTLE THAT FAILS IS NOT THE SAME FAILURE AS ONE BEFORE IT.
    //
    //    Everything above resolves into the outer catch, which records
    //    `{kind:'failed'}` on `lastRecovery`, a store NO PRODUCTION CODE READS.
    //    So the player was shown their winning round, the balance never moved,
    //    and nothing on the page said so: no banner, no error text, no
    //    role=alert. Then SPIN placed a real bet on top of a round the platform
    //    was still holding open.
    //
    //    This one call therefore gets its own catch. It does not swallow the
    //    failure: it engages the LIVE GUARD, which is the mechanism that already
    //    exists for "we cannot establish that betting is safe". That blocks every
    //    bet route and renders the non-dismissible translated banner without
    //    inventing a string.
    //
    //    The round and the checkpoint are deliberately NOT cleared: the platform
    //    still holds the round, so a reload must be able to recover and settle it
    //    again, and end-round is idempotent on the session's active round.
    //    2026-08-10.
    let resp: Awaited<ReturnType<typeof platform.endRound>>
    try {
      resp = await platform.endRound(params, String(round.betID))
    } catch (err) {
      liveGuardReason.set('settle-failed')
      const out: RecoveryOutcome = {
        kind: 'settle-failed',
        betID: round.betID,
        error: err instanceof Error ? err.message : String(err),
      }
      lastRecovery.set(out)
      return out
    }
    balance.set(resp.balance)
    activeRound.set(null)
    // TR-099. The round is closed, so the cursor is dead. Cleared here as well
    // as in the presentation, because a round can settle without the
    // presentation ever having run (an empty event list still settles).
    clearCheckpoint()

    // 5. BANNER, once.
    recoveryBannerVisible.set(true)

    const out: RecoveryOutcome = {
      kind: 'resumed',
      betID: round.betID,
      balance: resp.balance,
      presented: script !== null,
      triggered,
      resumedFromIndex: resumeFromIndex,
      checkpointRejection,
    }
    lastRecovery.set(out)
    return out
  } catch (err) {
    // Still deliberately tolerant: a recovery failure must never stop the
    // player reaching the game. A blocked session is the live guard's job.
    const out: RecoveryOutcome = { kind: 'failed', error: err instanceof Error ? err.message : String(err) }
    lastRecovery.set(out)
    return out
  }
}

// ============================================================================
// RESYNC AFTER A REJECTED LIVE SPIN, R043 PHASE 4, closing blocker B12.
// ============================================================================
//
// THE DEFECT THIS CLOSES. `endRound` throws inside the locked `_rgsSpinReal`,
// the whole spin rejects, and App.svelte's finally handed the optimistic debit
// BACK: the displayed balance returned to its pre-bet value while the RGS had
// already taken the stake and still held the round open with the win
// uncredited. Nothing engaged, betting stayed enabled, and the next SPIN
// placed a second stake on top of an open round. The recovery leg got a
// dedicated settle-failed guard on 2026-08-10; the live-play leg of the same
// call did not.
//
// THE DESIGN, fail-closed on money. From App's side a rejected live spin is
// ONE opaque failure: the locked service settles inside itself, so "play was
// refused" and "play succeeded and the settle failed" reject identically, and
// there are NO client-side validation failures after the debit point that
// could reject without reaching the wallet (play() posts directly; the
// affordability guard returns before the debit; the enumerated pre-wallet set
// is EMPTY). So the displayed balance is never reconstructed by assumption in
// either direction. This function asks the server:
//
//   1. authenticate with the current session and ADOPT the authoritative
//      balance, which is the one figure that is true whether or not the stake
//      was taken;
//   2. if the response carries an ACTIVE round, the platform is still holding
//      the rejected spin open: engage the settle-failed guard (betting
//      disabled by every route, the errRoundIncomplete banner renders), and
//      leave settlement to the reload path, where recoverSession presents the
//      round and settles it through the idempotent end-round exactly as it
//      already does for a mid-round reload;
//   3. if there is no active round, the adopted balance already tells the
//      truth about the stake, and the session is clear to play;
//   4. if the probe itself fails, nothing can be established, so it fails
//      CLOSED: the same guard engages and the same reload instruction renders.
//
// MID-SESSION AUTHENTICATE SEMANTICS, DERIVED FROM THE PINNED OFFICIAL CLIENT
// BEFORE THIS WAS BUILT, as the R043 brief requires. At the pinned ref
// (package-lock: StakeEngine/ts-client df9e126, node_modules/stake-engine),
// client.ts:80-141 shows Authenticate is a PURE READ: one fetch, no teardown,
// no once-only guard (the other four methods all demand authenticate has
// HAPPENED, never that it happened once), and its active-round flag is set
// with no else branch, so a repeat call can raise the open-round signal but
// never clear one. The SDK's own open-round fence sits in Play
// (client.ts:199-203), not in Authenticate. The platform mirror agrees:
// "The round returned may represent a currently active or the last completed
// round. Frontends should continue the round if it remains active"
// (docs/stake-engine-live/2026-07-29/rgs_wallet.md:26), and rgs.md:41
// designates the authenticate response's round.event as the resume surface
// after a disconnect. No first-party source evidences that a repeat
// authenticate abandons or corrupts an open round, so the R043 conditional
// lock sanction is NOT triggered and rgsService.ts stays untouched. In-repo
// precedent: every live launch already authenticates twice (initRGS at
// rgsService.ts:730, then recoverSession above). Two residual unknowns are
// DTT observations, not assumptions here: end-round on an ALREADY-SETTLED
// session is unconfirmed (the pinned client's comment says it errors, our
// retry comment says no-op; DTT_PROTOCOL.md:151-154 already carries it), and
// no first-party text covers a third authenticate issued between play and
// end-round in one page life, which is exactly what this probe does after a
// rejection.
export type ResyncOutcome =
  | { kind: 'clear'; balance: number }
  | { kind: 'open-round'; betID: number }
  | { kind: 'probe-failed'; error: string }

export async function resyncAfterSpinRejection(
  platform: RecoveryPlatform = REAL,
): Promise<ResyncOutcome> {
  try {
    const params = platform.parseSessionParams()
    const auth = await platform.authenticate(params)
    // The authoritative figure, adopted before anything else is decided.
    balance.set(auth.balance)
    const round: OfficialRound | null = auth.round ?? null
    if (round && round.active === true) {
      activeRound.set({ betID: round.betID, active: round.active, state: round.state })
      liveGuardReason.set('settle-failed')
      return { kind: 'open-round', betID: round.betID }
    }
    return { kind: 'clear', balance: auth.balance }
  } catch (err) {
    // Nothing could be established, so nothing is assumed: the stake stays
    // debited on screen and betting stays blocked until a reload re-reads the
    // wallet. Overstating the player's balance on the one path where we
    // cannot check is the failure this branch exists to refuse.
    liveGuardReason.set('settle-failed')
    return { kind: 'probe-failed', error: err instanceof Error ? err.message : String(err) }
  }
}

/** Test helper. Not used by production code. */
export function resetSessionRecovery(): void {
  activeRound.set(null)
  lastRecovery.set({ kind: 'none' })
  recoveryBannerVisible.set(false)
}
