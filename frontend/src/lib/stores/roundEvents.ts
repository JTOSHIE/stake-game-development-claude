// roundEvents.ts — non-locked store carrying the complete raw event sequence of
// the most recent round.
//
// The locked rgsService publishes the full RGS event list here (sanctioned
// additive change) BEFORE it flattens the events into the single-spin
// SpinResult, so the Overdrive presentation can play back the whole free-spins
// round via roundInterpreter. SpinResult and every existing consumer are
// unchanged; consumers that only need the flattened result ignore this store.
//
// In offline/mock feature development the mock round provider writes curated
// sample-round events here so the whole feature is testable without the RGS.

import { writable } from 'svelte/store'
import type { RawEvent } from '../services/roundInterpreter'

export const lastRoundEvents = writable<RawEvent[] | null>(null)
