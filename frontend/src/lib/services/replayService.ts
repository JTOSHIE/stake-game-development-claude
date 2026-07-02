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
  state: any                 // game-specific replay state — events / board / wins
}

const CURRENCY_SCALE = 1_000_000

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
 * is missing — these are mandatory.
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

  const social = params.get('social') === 'true'
  const currency = params.get('currency') ?? (social ? 'SC' : 'USD')

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
    lang: params.get('lang') ?? 'en',
    device: (params.get('device') ?? 'desktop') as 'mobile' | 'desktop',
    social,
  }
}

/**
 * Fetch the replay data from the RGS replay endpoint.
 * No session is required — replay URLs are publicly shareable.
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
 * Resolve a currency symbol for display. Supports the most common Stake Engine
 * currencies plus the social-mode SC. Falls back to "{CODE} " for unknown codes.
 */
export function currencySymbol(code: string): string {
  const map: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    BRL: 'R$',
    CAD: 'CA$',
    AUD: 'A$',
    SC: 'SC ',
  }
  return map[code] ?? `${code} `
}
