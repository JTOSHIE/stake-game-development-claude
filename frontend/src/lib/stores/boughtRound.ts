// boughtRound.ts, JOB 3(f) / TR-068 (2026-07-26).
//
// What the round now being celebrated cost, when that round was BOUGHT.
// `null` for every ordinary spin, which is most of them.
//
// WHY THIS EXISTS. The owner reported "the balance wasn't updating" during a
// live portal session. It was: four HUD balances reconcile to the platform's
// own bet log to the cent. What the owner actually saw is real and is a
// presentation problem, not a money-path one. At 06:23:37 the HUD read
// WIN $57,215.00 in large green type while the balance fell by $142,785,
// because the round had cost $200,000.
//
// That is not an edge case, it is the common case: the typical bought round
// pays back less than it cost (super break-even 71.8%, bonus 76.5%), and seven
// of the owner's eight buy rounds were "wins" that lost money. A gross-payout
// WIN readout is the genre convention and is not wrong in itself, but at 400x
// the convention inverts the meaning of the round, and it confused the person
// who knows the maths.
//
// FABLE'S RULING (2026-07-26, FS_V3_CONSOLIDATED JOB 2), option (a) refined:
// the gross WIN readout is RETAINED, because a reviewer expecting it would read
// a net figure as wrong, and the headline multiplier stays against the bet
// level for the same reason. What is added is a SECONDARY line stating what the
// round cost, beside what it paid, on bought rounds only. Base rounds are
// untouched.
//
// The price is stored in INTEGER MICROS from `spinCostMicros`, the same
// function the confirm dialog prices from, so the figure on the result banner
// and the figure the player agreed to cannot disagree. Storing a formatted
// string here instead would have been a second formatting path and would not
// have survived a currency or locale change mid-session.

import { writable } from 'svelte/store'
import type { BetMode } from './betMode'

export interface BoughtRound {
  /** Which buy tier was purchased. */
  mode: BetMode
  /** What it cost, in integer micros, from `spinCostMicros`. */
  priceMicros: number
}

/**
 * Set by `App.handleBuy` immediately before the wallet call, cleared by
 * `App.handleSpin` at the start of every ordinary spin.
 *
 * Cleared on the next SPIN rather than when the banner dismisses, deliberately:
 * the celebration for a bought round can be raised by either WinBanner
 * instance, the reactive base-game one or the explicit-trigger one
 * FreeSpinsPresentation drives at feature end, and tying the lifetime to a
 * dismissal handler would mean the line depended on which of the two showed.
 * The next spin is the moment the previous round genuinely stops being the
 * round on screen.
 */
export const boughtRound = writable<BoughtRound | null>(null)
