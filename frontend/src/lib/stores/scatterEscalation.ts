// scatterEscalation.ts - the anticipation tension gauge. Non-locked.
// Built to `docs/design/SCATTER_ANTICIPATION_SHIP_SPEC.md` under Fable's
// integrity ruling of 2026-07-25.
//
// THE INTEGRITY PROPERTY, which is the whole reason this file exists separately
// from GameGrid rather than living inside its spin loop:
//
//   The escalation level is a function of TWO INPUTS ONLY - how many scatters
//   have VISIBLY LANDED, and whether reels are STILL MOVING. It never receives
//   the final board, so it cannot read the outcome even by accident.
//
// That is not a stylistic preference. The proposal this replaces asked for a
// choice between building tension toward a fourth scatter the board never had,
// or softening the build when the known board holds no more. The second option
// means reading the outcome; the first means the build sometimes lies.
//
// Making the level a function of visible state dissolves the dilemma, because it
// changes what the build SAYS. A level-3 build states "three are down and reels
// are still turning". That is true one hundred per cent of the time. It never
// claims a fourth is coming, so there is no lie to soften and no reason to look.
//
// The signature is the enforcement: `escalationFor` cannot be passed a board.

import { writable, derived } from 'svelte/store'

/**
 * 0 jets off, no anticipation
 * 1 anticipation open, two down, reels moving. Jets still OFF: the gauge reads
 *   "bonus secured and how good", not "something might happen".
 * 2 SECURED, third landed, no reels left. One-shot pulse, jets ignite low.
 * 3 climbing, third landed, reels still moving.
 * 4 fourth landed, no reels left. One-shot pulse, jets high.
 * 5 near full, fourth landed, reels still moving.
 * 6 full eruption, fifth landed.
 */
export type EscalationLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * Which build this is. The base-game trigger and a free-spins RETRIGGER are the
 * same mechanic and deliberately not the same moment.
 */
export type EscalationPhase = 'base' | 'retrigger'

/**
 * TR-036 option (b), ratified, built R2R-R JOB E (2026-07-26).
 *
 * A retrigger runs the SAME ladder, CAPPED AT LEVEL 3. Nothing new is invented:
 * levels 0 to 3 behave exactly as they do in the base game, and 4, 5 and 6
 * collapse onto 3.
 *
 * WHY CAPPED RATHER THAN ABSENT, and why not full. The stakes genuinely differ.
 * In the base game the gauge answers "is the bonus secured, and how good is the
 * entry", and a fifth scatter is the best thing that can happen in the round.
 * Inside the feature the bonus is already secured and a retrigger is +5 spins;
 * a full eruption for it would tell the player something bigger happened than
 * did, which is the same class of dishonesty the whole visible-state-only
 * ruling exists to prevent. Running NOTHING was the other option and is what
 * shipped before: reviewer 1 called it out as "a bonus retrigger presenting
 * zero escalation after a full escalation system", and they were right that it
 * reads as unfinished.
 *
 * The integrity property is untouched: the level is still a function of visibly
 * landed scatters and whether reels are still moving, and `escalationFor` still
 * cannot be passed a board.
 */
export const RETRIGGER_MAX_LEVEL: EscalationLevel = 3

/** Levels that are a single celebratory beat rather than a sustained state. */
export const PULSE_LEVELS: ReadonlySet<EscalationLevel> = new Set<EscalationLevel>([2, 4, 6])

/**
 * Which celebratory pulse, if any, a reel stop has just earned.
 *
 * THE GAUGE IS A FUNCTION OF STATE; THE PULSE IS A FUNCTION OF A TRANSITION.
 * Conflating the two was a real bug, caught by replaying book round 78
 * (`[1,1,1,0,0]`): the third scatter lands on reel 2, but a state-only model
 * fired the SECURED beat when the reels finally ran out, two stops later. The
 * celebration has to happen when the scatter lands, not when the round ends.
 *
 * Crossing thresholds rather than testing equality also handles the 0.5% of
 * rounds that land two scatters on one reel, where a single stop can take the
 * count from one to three and must still fire SECURED.
 *
 * @returns the pulse level to fire, or null for an ordinary stop.
 */
export function pulseLevelFor(
  landedBefore: number,
  landedAfter: number,
  phase: EscalationPhase = 'base',
): EscalationLevel | null {
  if (landedBefore < 5 && landedAfter >= 5) return capped(6, phase)
  if (landedBefore < 4 && landedAfter >= 4) return capped(4, phase)
  if (landedBefore < 3 && landedAfter >= 3) return capped(2, phase)
  return null
}

/**
 * Apply the retrigger cap.
 *
 * A PULSE ABOVE THE CAP BECOMES NOTHING, not a repeat of the SECURED beat.
 * Clamping 4 to 3 would turn a one-shot beat into a sustained level, and
 * clamping it to 2 would fire SECURED a second time in one spin, which reads as
 * a bug rather than a design. Above the cap there is simply no further beat to
 * fire: the retrigger already announced itself at three.
 */
function capped(level: EscalationLevel, phase: EscalationPhase): EscalationLevel | null {
  if (phase !== 'retrigger') return level
  if (level > RETRIGGER_MAX_LEVEL) return PULSE_LEVELS.has(level) ? null : RETRIGGER_MAX_LEVEL
  return level
}

/**
 * The whole model.
 *
 * Levels are COMPUTED, never incremented. Measured from 40,000 shipped base
 * rounds, 0.5% of them land two scatters on a single reel, so a ladder that
 * advanced one beat per reel stop would be wrong about one round in two
 * hundred. Computing from state is correct for a jump of any size.
 *
 * @param scattersLanded  scatters visibly committed so far. Not the board's total.
 * @param reelsRemaining  reels that have not yet been told to stop.
 */
export function escalationFor(
  scattersLanded: number,
  reelsRemaining: number,
  phase: EscalationPhase = 'base',
): EscalationLevel {
  const moving = reelsRemaining > 0
  let level: EscalationLevel
  if (scattersLanded >= 5) level = 6
  else if (scattersLanded === 4) level = moving ? 5 : 4
  else if (scattersLanded === 3) level = moving ? 3 : 2
  else if (scattersLanded === 2) level = moving ? 1 : 0
  else level = 0
  // A SUSTAINED level above the cap clamps to the cap rather than vanishing:
  // unlike a pulse, a hold has to be some value for the whole time the reels
  // are still turning, and 3 is the honest one. "Three are down and reels are
  // still moving" is true of a four-scatter retrigger too.
  return phase === 'retrigger' && level > RETRIGGER_MAX_LEVEL ? RETRIGGER_MAX_LEVEL : level
}

/**
 * Sustained hold for a level, before the speed factor. Uniform by level and
 * independent of outcome: a level-3 hold is the same length whether or not a
 * fourth is coming, because the game does not know and must not behave as if it
 * does. Non-sustained levels return 0.
 */
export function holdMsFor(level: EscalationLevel): number {
  switch (level) {
    case 1: return 900
    case 3: return 1000
    case 5: return 1100
    default: return 0
  }
}

/** One-shot pulse duration for a beat level, before the speed factor. */
export function pulseMsFor(level: EscalationLevel): number {
  switch (level) {
    case 2: return 350
    case 4: return 450
    case 6: return 700
    default: return 0
  }
}

/** Floors that make "turbo shortens, never skips" true rather than aspirational. */
export const HOLD_FLOOR_MS = 300
export const PULSE_FLOOR_MS = 180

/** Apply the speed factor without ever letting a beat vanish. */
export function scaledHoldMs(level: EscalationLevel, speedFactor: number): number {
  const base = holdMsFor(level)
  return base === 0 ? 0 : Math.max(HOLD_FLOOR_MS, base * speedFactor)
}

export function scaledPulseMs(level: EscalationLevel, speedFactor: number): number {
  const base = pulseMsFor(level)
  return base === 0 ? 0 : Math.max(PULSE_FLOOR_MS, base * speedFactor)
}

/**
 * Flame gauge intensity, 0 to 1, for a level. Jets are dark below level 2 by
 * design: igniting them while the bonus is not yet secured would make the gauge
 * mean "maybe", and its value is that it means "yes, and this much".
 */
export function flameIntensityFor(level: EscalationLevel): number {
  switch (level) {
    case 2: return 0.35
    case 3: return 0.55
    case 4: return 0.75
    case 5: return 0.9
    case 6: return 1
    default: return 0
  }
}

/** Current level. Written by GameGrid's spin loop, read by the flame gauge. */
export const scatterEscalation = writable<EscalationLevel>(0)

/** Convenience for the jets: intensity rather than level. */
export const flameIntensity = derived(scatterEscalation, ($l) => flameIntensityFor($l))

export function resetEscalation(): void {
  scatterEscalation.set(0)
}
