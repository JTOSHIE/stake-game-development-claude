// roundProvider.ts, offline mock round provider (NON-LOCKED).
//
// In dev/mock mode the locked rgsService serves a single flattened SpinResult
// and does not populate lastRoundEvents with a real free-spins sequence. This
// provider serves curated real book rounds (frontend/src/lib/mock/sample_rounds.json)
// so the whole Overdrive feature is developable and testable offline: it picks a
// round for the requested mode/intent and publishes its raw events to
// lastRoundEvents, exactly as the live rgsService does before flattening.
//
// The sample data is loaded via a LAZY dynamic import so the ~0.5 MB JSON is
// code-split into its own chunk and never enters the main production bundle; it
// is fetched only if the mock path actually runs (offline dev, never live RGS).

import { lastRoundEvents } from '../stores/roundEvents'
import type { BookRound, RawEvent } from '../services/roundInterpreter'
import type { BetMode } from '../stores/betMode'
import { BUY_MODES } from '../config/fsModes'

// Every buy-tier server mode (bonus, super, and any future addition) - single
// source of truth via fsModes.ts, so a new buy tier is guaranteed-trigger here
// for free the moment it is added to FS_MODES.
const BUY_MODE_IDS = new Set<string>(BUY_MODES.map((m) => m.serverMode))

export interface SampleEntry {
  mode: BetMode
  category: string
  round: BookRound
}

let _cache: SampleEntry[] | null = null
async function loadSamples(): Promise<SampleEntry[]> {
  if (_cache) return _cache
  const mod = await import('./sample_rounds.json')
  _cache = (mod.default ?? mod) as unknown as SampleEntry[]
  return _cache
}

async function samplesFor(mode: BetMode): Promise<SampleEntry[]> {
  return (await loadSamples()).filter((s) => s.mode === mode)
}

async function triggeredSamples(mode: BetMode): Promise<SampleEntry[]> {
  return (await samplesFor(mode)).filter((s) =>
    s.round.events.some((e) => e.type === 'freeSpinTrigger'),
  )
}

function randomOf<T>(arr: T[]): T | null {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null
}

/**
 * Publish a mock round's raw events to lastRoundEvents so the presentation can
 * play it back. Returns the chosen round (or null if none match).
 *  - a buy-tier mode (bonus, super, ...) -> always a triggered round (guaranteed feature)
 *  - a standing mode (base, cruise, antelite) -> a triggered round when forceTrigger, else any
 * NOTE, corrected 2026-08-05 (S2-C084): this used to say sample_rounds.json
 * curated only 'base'/'bonus' samples and named 'super' as having no pool. That
 * is no longer true. All five modes are curated, counted from the file's own
 * mode and category fields. What is still missing is narrower: cruise and
 * antelite have no wincap and no retrigger or high-meter sample. Where a pool is
 * genuinely empty this returns null and the caller falls back to the raw
 * _mockSpin board, correctly priced and labelled, just not a curated feature
 * demo. No totals are written here, per convention (s): they grow whenever a
 * sample is authored, which is what made the old note false.
 */
export async function serveMockRound(
  mode: BetMode,
  opts: { forceTrigger?: boolean } = {},
): Promise<BookRound | null> {
  const pool =
    BUY_MODE_IDS.has(mode) || opts.forceTrigger
      ? await triggeredSamples(mode)
      : await samplesFor(mode)
  const entry = randomOf(pool)
  if (!entry) return null
  lastRoundEvents.set(entry.round.events as RawEvent[])
  return entry.round
}

/** Warm the sample-pool cache ahead of time (App.svelte calls this once on
 *  mount, DEV-only). The curated pool is a multi-MB JSON file carrying every
 *  sampled round's full board and event data; parsing it cold on the first buy
 *  was a measurable main-thread hitch mid-animation (Motion Polish v2 fps
 *  gate). Loading it during startup idle time instead has no such cost. */
export async function preloadSamples(): Promise<void> {
  await loadSamples()
}

/** Serve a specific sample category (used by dev/headless verification). */
export async function serveCategory(
  mode: BetMode,
  category: string,
): Promise<BookRound | null> {
  const entry = (await samplesFor(mode)).find((s) => s.category === category) ?? null
  if (!entry) return null
  lastRoundEvents.set(entry.round.events as RawEvent[])
  return entry.round
}
