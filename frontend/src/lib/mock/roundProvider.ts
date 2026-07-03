// roundProvider.ts — offline mock round provider (NON-LOCKED).
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

export interface SampleEntry {
  mode: 'base' | 'bonus'
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

async function samplesFor(mode: 'base' | 'bonus'): Promise<SampleEntry[]> {
  return (await loadSamples()).filter((s) => s.mode === mode)
}

async function triggeredSamples(mode: 'base' | 'bonus'): Promise<SampleEntry[]> {
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
 *  - mode 'bonus'  -> always a triggered round (guaranteed feature)
 *  - mode 'base'   -> a triggered round when forceTrigger, else any base round
 */
export async function serveMockRound(
  mode: 'base' | 'bonus',
  opts: { forceTrigger?: boolean } = {},
): Promise<BookRound | null> {
  const pool =
    mode === 'bonus' || opts.forceTrigger
      ? await triggeredSamples(mode)
      : await samplesFor(mode)
  const entry = randomOf(pool)
  if (!entry) return null
  lastRoundEvents.set(entry.round.events as RawEvent[])
  return entry.round
}

/** Warm the sample-pool cache ahead of time (App.svelte calls this once on
 *  mount, DEV-only). The curated pool is a multi-MB JSON file (58 rounds'
 *  worth of full board/event data); parsing it cold on the first bonus buy
 *  was a measurable main-thread hitch mid-animation (Motion Polish v2 fps
 *  gate). Loading it during startup idle time instead has no such cost. */
export async function preloadSamples(): Promise<void> {
  await loadSamples()
}

/** Serve a specific sample category (used by dev/headless verification). */
export async function serveCategory(
  mode: 'base' | 'bonus',
  category: string,
): Promise<BookRound | null> {
  const entry = (await samplesFor(mode)).find((s) => s.category === category) ?? null
  if (!entry) return null
  lastRoundEvents.set(entry.round.events as RawEvent[])
  return entry.round
}
