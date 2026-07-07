// cellMultipliers.ts — non-locked store carrying the per-cell wild multipliers
// of the current round, as VISIBLE-grid coordinates (reel 0..4, row 0..3).
//
// A mechanic (multiplier wilds) publishes DATA here; GameGrid renders a
// mechanic-agnostic CellModifier badge for each entry during the win step and
// clears the store at the start of the next spin. Keeping the multiplier-wild
// presentation as data (not a new pipeline) directly addresses the
// "ways-only frontend assumptions" pitfall — a new per-cell mechanic adds an
// entry shape, not a new component tree.
//
// Populated from roundInterpreter.collectCellMultipliers/cellMultipliersFromEvents.

import { writable } from 'svelte/store'
import type { CellMultiplier } from '../services/roundInterpreter'

export const cellMultipliers = writable<CellMultiplier[]>([])
