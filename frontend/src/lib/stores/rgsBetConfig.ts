// rgsBetConfig.ts
//
// The betting parameters the authenticate response carries BESIDES `betLevels`.
//
// WHY THIS EXISTS. The published checklist item is "Game dynamically uses ALL
// betting parameters from the authenticate response". `betLevels` was consumed,
// via `rgsBetLevels` and `betLadder.ts`, and that half of the claim was true.
// The other four were read off the wire, converted into display units, assigned
// into the auth object, and then never read by anything. Measured by driving the
// real `initRGS()` against a stubbed platform: with `defaultBetLevel: 100` the
// game opened on 20, the bottom rung, because the only thing that moved the bet
// was HudOverlay's nearest-neighbour snap from the hardcoded 1.00 default.
//
// A player launching in any currency whose ladder is not USD-shaped therefore
// opened on the minimum rather than the operator's configured default. Nothing
// looks broken: the arrows work and the number is valid. It is simply not the
// bet the operator asked for, and a reviewer testing this exact row sees it in
// one launch.
//
// UNITS: DISPLAY UNITS, not micros, matching `rgsBetLevels`. The service does the
// conversion once, at the boundary, so every consumer downstream sees one
// convention. Stated here because a store of raw numbers with no unit is how the
// integer-micros rule gets broken by accident.
//
// `defaultBetLevel` is the only field with a consumer today. The other three are
// published because the item names them, because they cost nothing to carry, and
// because the fallback ladder currently offers rungs outside the platform's own
// [minBet, maxBet] envelope when `betLevels` is absent. That widening was
// DELIBERATELY NOT DONE in this pass: it was reviewed and judged unsafe as
// specified, since constraining a ladder to `stepBet` multiples in display-unit
// floats reintroduces exactly the float-arithmetic hazard the integer-micros
// rule exists to prevent. Recorded as open rather than half-applied.

import { writable } from 'svelte/store'

export interface RgsBetConfig {
  /** Smallest bet the platform will accept, display units. 0 when unknown. */
  minBet: number
  /** Largest bet the platform will accept, display units. 0 when unknown. */
  maxBet: number
  /** Increment between adjacent bets, display units. 0 when unknown. */
  stepBet: number
  /** The bet the operator wants the session to OPEN on, display units. */
  defaultBetLevel: number
}

export const EMPTY_BET_CONFIG: RgsBetConfig = {
  minBet: 0, maxBet: 0, stepBet: 0, defaultBetLevel: 0,
}

export const rgsBetConfig = writable<RgsBetConfig>({ ...EMPTY_BET_CONFIG })

/**
 * The opening bet for a session, or null when the platform did not name one we
 * can honour.
 *
 * TWO CONDITIONS, and the second is the one that matters.
 *
 * 1. The default must be ON the ladder the player can actually reach. Setting a
 *    bet that is not a rung leaves the arrows unable to return to it, and
 *    HudOverlay's snap would move it on the next interaction anyway, so the
 *    session would silently disagree with itself about the opening bet.
 *
 * 2. IT MUST NOT OVERRIDE A RECOVERED ROUND. `sessionRecovery` restores the
 *    stake that is actually at risk from `round.amount`, and that stake is the
 *    truth for a resumed session: the operator's preferred OPENING bet is not
 *    relevant to a round the player already placed. The caller passes
 *    `hasActiveRound` so this cannot race the recovery path, which sets the bet
 *    from a different and higher-priority source.
 */
export function openingBet(
  config: RgsBetConfig,
  levels: readonly number[],
  hasActiveRound: boolean,
): number | null {
  if (hasActiveRound) return null
  const wanted = config.defaultBetLevel
  if (!Number.isFinite(wanted) || wanted <= 0) return null
  if (!levels.some((l) => l === wanted)) return null
  return wanted
}
