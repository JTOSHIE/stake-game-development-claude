// File: src/lib/services/replayService.ts
// Purpose: Stake Engine Bet Replay support.
//          Parallel to (not modifying) rgsService.ts.
//          Used only when URL contains ?replay=true.
//
// Responsibilities:
//   - Parse replay-specific URL params
//   - Fetch round data from {rgs_url}/bet/replay/{game}/{version}/{mode}/{event}
//   - Expose a typed response for ReplayMode.svelte to consume
//   - Helpers for currency/amount display per Stake Engine spec

// CURRENCY_SCALE is imported, never redeclared. It previously existed here as a
// third module-local copy alongside utils/currency.ts and the locked
// rgsService.ts. All three agreed, but the money path holding one constant in
// triplicate is the same drift shape that produced the 2026-07-25 currency
// defect. utils/currency.ts is canonical (Fable ruling 8, 2026-07-26); the
// locked rgsService.ts copy is recorded in CLAUDE.md's LOCKED_FILE_DEBTS and
// held to the canonical value by scripts/currency_scale_drift.test.mjs.
import { currencySymbolFor, CURRENCY_SCALE, isVirtualCurrency } from '../utils/currency'
import { resolveLaunchLocale } from '../stores/socialLocale'

export interface ReplayParams {
  replay: true
  game: string         // UUID
  version: string      // e.g. "1"
  mode: string         // e.g. "BASE"
  event: string        // simulation/event ID
  rgsUrl: string       // already-prefixed with https://
  currency: string     // ISO 4217 code or 'SC' (social)
  amount: number       // raw integer micros
  lang: string         // ISO 639-1 code, default 'en'
  device: 'mobile' | 'desktop'
  social: boolean
}

export interface ReplayResponse {
  payoutMultiplier: number   // multiplier applied to the bet amount for total payout
  costMultiplier: number     // multiplier applied to the bet for cost (1.0 for base mode)
  state: any                 // game-specific replay state, events / board / wins
}


/**
 * Returns null if the current URL is NOT in replay mode.
 * Returns a fully-typed ReplayParams object if replay=true.
 *
 * Default behaviour per Stake Engine spec:
 *   - currency: 'USD' (non-social) or 'SC' (social) if not provided
 *   - amount: 1_000_000 (1 USD or 1 SC) if not provided
 *   - lang: 'en'
 *   - device: 'desktop'
 *   - social: false
 *
 * Throws if replay=true is present but any of game/version/mode/event/rgs_url
 * is missing, these are mandatory.
 */
export function parseReplayParams(): ReplayParams | null {
  const params = new URLSearchParams(window.location.search)

  if (params.get('replay') !== 'true') return null

  const game = params.get('game')
  const version = params.get('version')
  const mode = params.get('mode')
  const event = params.get('event')
  const rgsUrlRaw = params.get('rgs_url')

  if (!game || !version || !mode || !event || !rgsUrlRaw) {
    throw new Error(
      'Replay mode requires game, version, mode, event, and rgs_url query parameters.',
    )
  }

  const rgsUrl = rgsUrlRaw.startsWith('http')
    ? rgsUrlRaw
    : `https://${rgsUrlRaw}`

  // Social presentation follows the CURRENCY as well as the flag.
  //
  // The platform documents `social=true/false` as its signal
  // (docs/stake-engine-live/jurisdiction-requirements.md line 17), and that flag
  // stays authoritative for turning social mode ON. But a replay URL carrying
  // `currency=XSC` and no `social` flag previously rendered the full real-money
  // vocabulary next to an SC balance, which is a prohibited-terms breach in the
  // jurisdictions that use those codes. Deriving from the currency as well can
  // only ever turn social mode ON, never off, so it cannot suppress real-money
  // language where that language is correct. isVirtualCurrency() is the
  // canonical test in utils/currency.ts rather than a second code list here.
  //
  // Scope note: XEC is deliberately NOT handled. Three first-party sources (the
  // live docs, the currency reference and the official ts-client SDK) have no
  // trace of it, and the standing recommendation in
  // docs/stake-engine-live/2026-07-25/DELTA_NOTES.md is not to record it as a
  // supported code until a first-party source is produced. See TR-012.
  const socialFlag = (() => {
    const v = params.get('social')
    return v === 'true' || v === '1'
  })()
  const currency = params.get('currency') ?? (socialFlag ? 'SC' : 'USD')
  const social = socialFlag || isVirtualCurrency(currency)

  // Guard against a missing or malformed amount: parseInt can yield NaN (or a
  // non-positive value) for junk input, which would render as "NaN" in the UI.
  // Fall back to the default 1.00 (CURRENCY_SCALE micros) in that case.
  const rawAmount = params.get('amount')
  const parsedAmount = rawAmount !== null ? parseInt(rawAmount, 10) : CURRENCY_SCALE
  const amount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : CURRENCY_SCALE

  return {
    replay: true,
    game,
    version,
    mode,
    event,
    rgsUrl,
    currency,
    amount,
    // Routed through the SAME validator the game route uses, rather than taken
    // raw. Social wins outright inside it, and an unknown or malformed code
    // degrades to English instead of rendering raw keys. Reading the parameter
    // directly here left the replay route as the one surface where a social
    // session could render German: keys carrying an explicit social override
    // still came out English, which is why this looked correct, but every key
    // WITHOUT one fell through to the localised string and the money format
    // followed `lang` too. 2026-08-09.
    lang: resolveLaunchLocale(params.get('lang'), social),
    device: (params.get('device') ?? 'desktop') as 'mobile' | 'desktop',
    social,
  }
}

/**
 * Fetch the replay data from the RGS replay endpoint.
 * No session is required, replay URLs are publicly shareable.
 */
export async function fetchReplay(p: ReplayParams): Promise<ReplayResponse> {
  const url = `${p.rgsUrl}/bet/replay/${p.game}/${p.version}/${p.mode}/${p.event}`

  if (import.meta.env.DEV) {
    console.log('[replay] GET', url)
  }

  const response = await fetch(url, { method: 'GET' })

  if (!response.ok) {
    throw new Error(
      `Replay fetch failed (${response.status} ${response.statusText}). URL: ${url}`,
    )
  }

  const data = (await response.json()) as ReplayResponse

  if (import.meta.env.DEV) {
    console.log('[replay] response:', data)
  }

  return data
}

/**
 * Compute the total amount spent on the bet for display on the Start Replay
 * button. Per Stake Engine spec: amount × costMultiplier.
 * Returns the result in raw micros.
 */
export function totalBetSpentMicros(
  amountMicros: number,
  costMultiplier: number,
): number {
  return Math.floor(amountMicros * costMultiplier)
}

/**
 * Convert raw micros to display dollars.
 */
export function microsToDisplay(micros: number): number {
  return micros / CURRENCY_SCALE
}

/**
 * Resolve a currency symbol for display.
 *
 * Delegates to the shared formatter in utils/currency.ts. This function used to
 * carry its own ten-entry hardcoded map, which had two defects fixed 2026-07-25:
 * it keyed sweepstakes coins on 'SC' when the RGS actually sends 'XSC' (so a
 * sweepstakes replay fell through to the fallback and printed the raw code
 * "XSC" to the player, which the jurisdiction rules forbid), and it covered only
 * ten of the platform's currencies while the shared formatter covers all of
 * them. Kept as a named export because ReplayMode.svelte and any future replay
 * surface import it; the implementation is now a single delegation so the two
 * tables can never drift apart again.
 */
export function currencySymbol(code: string, localeTag?: string): string {
  return currencySymbolFor(code, localeTag)
}
