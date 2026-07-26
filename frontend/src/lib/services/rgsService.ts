/**
 * rgsService.ts - Production RGS API client for Future Spinner
 *
 * Responsibilities:
 *  - Parse session launch parameters from the URL
 *  - Authenticate with the Stake Engine RGS
 *  - Submit spin (play) requests using integer micros for all money values
 *  - Close rounds via end-round
 *  - Map all 8 RGS error codes to typed, user-friendly errors
 *  - Retry transient ERR_GEN failures (max 3 attempts, 1 s apart)
 *
 * NEVER calculate game outcomes here. All game logic lives in the RGS.
 * NEVER use floats for monetary values sent to the API.
 *
 * ============================================================================
 * R2R JOB 4, 2026-07-25. THE WALLET CONTRACT IS NOW THE OFFICIAL ONE.
 * ============================================================================
 *
 * Round-two reviewer 3 filed this as half of its first BLOCKER, and it was
 * right. Every raw shape in this file was invented. The pinned official client,
 * `stake-engine: github:StakeEngine/ts-client` at
 * `df9e126d79b3fe1ef353f4fac9c1699cd79a4d3e` (package-lock.json:2046), defines
 * a materially different wire contract, and against a real RGS the previous
 * shapes would have produced `undefined` at every money field:
 *
 *   authenticate  invented `{ balance: number, minBet, maxBet, stepBet,
 *                 betLevels, currency, round: {roundId, state},
 *                 jurisdiction }`
 *                 official `{ balance: {amount, currency},
 *                 config: {minBet, maxBet, stepBet, defaultBetLevel,
 *                 betLevels, jurisdiction: {...12 flags}},
 *                 round: Round | null }`
 *
 *   play          invented `{ events, balance: number, roundId, win }`
 *                 official `{ balance: {amount, currency}, round: Round }`,
 *                 with the round's events inside `round.state`
 *
 *   end-round     invented request `{sessionID, roundId}`, response
 *                 `{balance: number, roundId}`
 *                 official request `{sessionID}` only, response
 *                 `{balance: {amount, currency}}` with NO round identity at all
 *
 *   rgs_url       the launch parameter is a bare HOST. The official client
 *                 builds `https://${rgs_url}`. This file used it unprefixed,
 *                 so every request went to a relative path on our own origin.
 *                 `replayService.ts` already normalised it correctly; the two
 *                 disagreed, and replay was the one that was right.
 *
 * THE TYPES ARE TRANSCRIBED, NOT IMPORTED. The package has no licence file, so
 * it is a reference rather than a dependency we ship. The declarations below
 * are copied from `node_modules/stake-engine/src/types.ts` at the pinned ref
 * and marked as such. Transcription also means a type change in the upstream
 * pin cannot silently change our behaviour without someone reading the diff,
 * which for a money path is the behaviour we want.
 *
 * THE BALANCE UNIT IS INTEGER MICROS, and this is not an assumption. The
 * official helper is explicit:
 *
 *     const API_MULTIPLIER = 1_000_000
 *     // ParseAmount converts an RGS amount to a regular decimal number.
 *     // eg 1_000_000 to a regular decimal number 1.00
 *     const ParseAmount = (val) => val / API_MULTIPLIER
 *
 *   (`node_modules/stake-engine/src/helpers.ts` at the pinned ref.)
 *
 * That is byte-for-byte our own `CURRENCY_SCALE`, so no unit conversion layer
 * and no dual-path constant is needed: the platform's micros and ours are the
 * same micros. Recorded explicitly because the brief asked for the unit to be
 * evidenced rather than assumed, and because "it happened to match" is only
 * safe once someone has checked.
 *
 * WHAT REMAINS UNKNOWN, pending DTT, stated rather than guessed:
 *
 *   1. `currencyDisplay`. The official contract carries NO display-metadata
 *      field: `Balance` is `{amount, currency}` and nothing more, and the
 *      official client derives symbol, decimals and placement from its own
 *      client-side `CurrencyMeta` table keyed on the currency code. So
 *      TR-012c's premise, that the platform sends display metadata we are
 *      dropping, is not supported by the pin. The passthrough below is
 *      implemented and tolerant so that if DTT shows a field arriving it is
 *      already wired, but at the pin it will always be undefined. Marked
 *      UNKNOWN, not closed.
 *
 *   2. Where `play` puts the round's events. `Round.state` is typed `unknown`
 *      upstream, so the pin does not say. `_extractRoundEvents` reads
 *      `state.events` first, because that is exactly where the Bet Replay
 *      endpoint puts them for this same game (`replayService.ReplayResponse`,
 *      and `ReplayMode.svelte` reads `response.state.events`), and falls back
 *      to `state` being the array itself. Both paths are covered by tests. The
 *      replay endpoint and the play endpoint are separate platform surfaces,
 *      so this is inference from a sibling, and it is labelled as inference.
 */

import { get } from 'svelte/store'
import { errorMessage, isLoading, balance, currencyCode } from '../stores/gameStore'
import { rgsBetLevels } from '../stores/rgsBetLevels'
// Sanctioned additive passthroughs (FS_FeatureFrontend, Overdrive Stage 2):
//  - selectedBetMode : buy UI writes the mode; play() includes it in the request
//  - jurisdictionFlags: initRGS publishes the authenticate jurisdiction flags
//  - lastRoundEvents : spin() publishes the full raw round events before flattening
import { selectedBetMode } from '../stores/betMode'
import { jurisdictionFlags } from '../stores/jurisdiction'
import { lastRoundEvents } from '../stores/roundEvents'
// Canonical reader of the reveal/winInfo schema. See _parsePlayResponse.
import { interpretEvents, type RawEvent, type Cell, CENTIBET_CAP } from './roundInterpreter'
import type { CurrencyDisplay } from '../utils/currency'

// ── Currency ──────────────────────────────────────────────────────────────────
// R1a scope (d), 2026-07-25. This file previously declared its own
// `CURRENCY_SCALE = 1_000_000`, a second copy of a money-path constant whose
// canonical home is utils/currency.ts. The copies always agreed, and
// scripts/currency_scale_drift.test.mjs held them to that, but a gate that
// watches a duplicate is a worse outcome than not having the duplicate. The
// value is now imported. It is still re-exported so this module's public
// surface is unchanged for any consumer that reads it from here.
export { CURRENCY_SCALE } from '../utils/currency'
import { CURRENCY_SCALE } from '../utils/currency'

function microsToDisplay(micros: number): number {
  return micros / CURRENCY_SCALE
}

function displayToMicros(dollars: number): bigint {
  // BigInt arithmetic prevents floating-point rounding on large bets
  return BigInt(Math.floor(dollars * CURRENCY_SCALE))
}

// ══════════════════════════════════════════════════════════════════════════════
// OFFICIAL CONTRACT, transcribed from stake-engine/src/types.ts at
// df9e126d79b3fe1ef353f4fac9c1699cd79a4d3e. Do not edit these to make our code
// compile. If one of them is wrong, the pin is the thing to re-read.
// ══════════════════════════════════════════════════════════════════════════════

/**
 * `Balance.amount` is in INTEGER MICROS. See the header: the official
 * `API_MULTIPLIER` is 1_000_000 and `ParseAmount` divides by it.
 */
export interface OfficialBalance {
  amount:   number
  currency: string
}

/**
 * The full official flag set, all twelve, transcribed verbatim. Note what is
 * NOT here: `minSpinMs`, `realityCheckMs`, `maxAutoplaySpins` and
 * `mandatorySessionDisplay`, which `responsibleGambling.ts` was reading and
 * which no platform response has ever sent. That is R2R3's fourth finding
 * (TR-042). The nearest real equivalent of `minSpinMs` is
 * `minimumRoundDuration`.
 */
export interface OfficialJurisdictionFlags {
  socialCasino:         boolean
  disabledFullscreen:   boolean
  disabledTurbo:        boolean
  disabledSuperTurbo:   boolean
  disabledAutoplay:     boolean
  disabledSlamstop:     boolean
  disabledSpacebar:     boolean
  disabledBuyFeature:   boolean
  displayNetPosition:   boolean
  displayRTP:           boolean
  displaySessionTimer:  boolean
  minimumRoundDuration: number
}

/** Bet configuration. All amounts in integer micros. */
export interface OfficialAuthenticateConfig {
  minBet:          number
  maxBet:          number
  stepBet:         number
  defaultBetLevel: number
  betLevels:       number[]
}

/**
 * The official round. `active` is the round-in-progress signal; there is no
 * `'open' | 'pending_end'` state vocabulary anywhere in the official contract,
 * and `state` is the game-specific round payload rather than a status string.
 * Our previous `ActiveRound { roundId, state: 'open' | 'pending_end' }` was
 * invented on both fields. This matters for TR-035b and is recorded there.
 */
export interface OfficialRound {
  betID:             number
  amount?:           number   // micros
  payout?:           number   // micros
  payoutMultiplier?: number   // bet-multiple x100 (centibets)
  active:            boolean
  mode:              string
  event?:            string
  state:             unknown  // the round's game payload; see _extractRoundEvents
}

export interface OfficialAuthenticateResponse {
  balance:           OfficialBalance
  config:            OfficialAuthenticateConfig
  jurisdictionFlags: OfficialJurisdictionFlags
  round:             OfficialRound | null
}

export interface OfficialPlayResponse {
  balance: OfficialBalance
  round:   OfficialRound
}

export interface OfficialEndRoundResponse {
  balance: OfficialBalance
}

/**
 * The RAW authenticate wire shape, which is NOT the same as
 * `OfficialAuthenticateResponse`. The official client lifts the flags out of
 * `config.jurisdiction` into a top-level `jurisdictionFlags` on the object it
 * returns; on the wire they are nested under `config`. Transcribed from
 * `client.ts`'s `Authenticate`, which reads `data.config.jurisdiction.*` and
 * `data.config.minBet` and so on.
 */
interface RawAuthenticateWire {
  balance: OfficialBalance
  /** TOP-LEVEL, as the live RGS sends it. Pinned types nest it under `config`. TR-080. */
  jurisdiction?: OfficialJurisdictionFlags
  config: OfficialAuthenticateConfig & {
    jurisdiction: OfficialJurisdictionFlags
    /**
     * UNKNOWN at the pin: no display-metadata field exists in the official
     * types. Read tolerantly so DTT can confirm or deny it without a code
     * change. See header note 1.
     */
    currencyDisplay?: CurrencyDisplay
  }
  round: OfficialRound | null
}

const EMPTY_JURISDICTION: OfficialJurisdictionFlags = {
  socialCasino:         false,
  disabledFullscreen:   false,
  disabledTurbo:        false,
  disabledSuperTurbo:   false,
  disabledAutoplay:     false,
  disabledSlamstop:     false,
  disabledSpacebar:     false,
  disabledBuyFeature:   false,
  displayNetPosition:   false,
  displayRTP:           false,
  displaySessionTimer:  false,
  minimumRoundDuration: 0,
}

// ── TypeScript interfaces (our normalised layer) ──────────────────────────────

export interface SessionParams {
  sessionID: string
  lang:      string
  device:    'mobile' | 'desktop'
  rgs_url:   string   // NORMALISED, already carries the https:// scheme
}

/**
 * Our view of authenticate. Every field that existed before this rewrite is
 * still here with the same name, the same unit (dollars) and the same meaning,
 * so `initRGS` and `sessionRecovery` keep working. The additions are the parts
 * of the official contract we were previously blind to.
 */
export interface AuthResponse {
  balance:   number       // dollars
  minBet:    number       // dollars
  maxBet:    number       // dollars
  stepBet:   number       // dollars
  betLevels: number[]     // dollars[]
  currency?: string
  /** NEW: official `config.defaultBetLevel`, dollars. */
  defaultBetLevel: number
  /** The official round, or null. Replaces the invented `{roundId, state}`. */
  round:     OfficialRound | null
  /** Typed official flags. */
  jurisdictionFlags: OfficialJurisdictionFlags
  /**
   * Retained for the existing `jurisdictionFlags` store passthrough, which is
   * `Record<string, unknown>`. Same object as `jurisdictionFlags` above.
   */
  jurisdiction: Record<string, unknown>
  /** UNKNOWN at the pin. See header note 1. */
  currencyDisplay?: CurrencyDisplay
}

export interface PlayResponse {
  events:    RawEvent[]
  balance:   number          // dollars (converted)
  /** Preserved name and type. It is `String(round.betID)`. */
  roundId:   string
  /** NEW: the official numeric identity. */
  betID:     number
  win:       number          // dollars (converted)
  winMicros: number          // raw micros (kept for end-round comparison)
  /** NEW: centibets, straight from the official round. */
  payoutMultiplier: number
  /** NEW: official round-in-progress signal; drives whether end-round is due. */
  active:    boolean
  /** NEW: the whole official round, unflattened. */
  round:     OfficialRound
}

export interface EndRoundResponse {
  balance: number          // dollars
  /**
   * The official end-round response carries NO round identity. This echoes
   * back the id the caller passed, so the existing consumer signature is
   * unchanged, and it is `undefined` when the caller passed nothing. It is
   * never read from the response, because it is not in the response.
   */
  roundId?: string
}

// -- Game events --------------------------------------------------------------
export interface WinEvent {
  symbol:  string
  kind:    number          // match count: 3 | 4 | 5
  ways:    number
  payout:  number          // dollars
}

export interface ScatterEvent {
  count:      number
  multiplier: number       // 1 | 3 | 10
  award:      number       // dollars
}

// -- Spin result (unified interface for App.svelte) ---------------------------
export interface SpinRequest {
  betAmount: number        // dollars
  mode:      'base' | 'bonus'
}

export interface SpinResult {
  board:        string[][]         // [reel][row] - 5 reels x 4 rows
  winEvents:    WinEvent[]
  scatterEvent: ScatterEvent | null
  totalWin:     number             // dollars
  newBalance?:  number             // dollars; present = RGS authoritative; absent = mock (store manages)
  isWincap:     boolean
  roundId:      string
}

// -- Errors -------------------------------------------------------------------
export type RGSErrorCode =
  | 'ERR_VAL'          // Validation - bad bet amount / missing field
  | 'ERR_IPB'          // Insufficient player balance
  | 'ERR_IS'           // Invalid session - must re-launch
  | 'ERR_ATE'          // Auth token expired
  | 'ERR_GLE'          // Game logic error (non-retryable)
  | 'ERR_LOC'          // Location / jurisdiction restriction
  | 'ERR_GEN'          // Generic transient error (retryable)
  | 'ERR_MAINTENANCE'  // Server under maintenance

export interface RGSError extends Error {
  code:      RGSErrorCode
  message:   string          // user-facing, localised
  retryable: boolean
  raw?:      unknown
}

// ── Error handling ────────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<RGSErrorCode, string> = {
  ERR_VAL:         'Invalid bet amount. Please choose a valid bet and try again.',
  ERR_IPB:         'Insufficient balance. Please add funds to continue playing.',
  ERR_IS:          'Your session has expired. Please relaunch the game.',
  ERR_ATE:         'Authentication failed. Please relaunch the game.',
  ERR_GLE:         'A game error occurred. Please try again or contact support.',
  ERR_LOC:         'This game is not available in your region.',
  ERR_GEN:         'A temporary error occurred. Retrying…',
  ERR_MAINTENANCE: 'The server is under maintenance. Please try again shortly.',
}

const RETRYABLE_CODES: RGSErrorCode[] = ['ERR_GEN']

export function handleRGSError(error: unknown): RGSError {
  // Already a typed RGSError - pass through
  if (
    error instanceof Error &&
    'code' in error &&
    typeof (error as RGSError).code === 'string'
  ) {
    return error as RGSError
  }

  // HTTP response with a known error code in body
  if (error !== null && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code as RGSErrorCode
    const knownCodes: RGSErrorCode[] = [
      'ERR_VAL','ERR_IPB','ERR_IS','ERR_ATE',
      'ERR_GLE','ERR_LOC','ERR_GEN','ERR_MAINTENANCE',
    ]
    if (knownCodes.includes(code)) {
      return _makeRGSError(code, error)
    }
  }

  // Network / fetch failure
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return _makeRGSError('ERR_GEN', error)
  }

  // Fallback - unknown error
  return _makeRGSError('ERR_GEN', error)
}

function _makeRGSError(code: RGSErrorCode, raw: unknown): RGSError {
  const err = new Error(ERROR_MESSAGES[code]) as RGSError
  err.name      = 'RGSError'
  err.code      = code
  err.retryable = RETRYABLE_CODES.includes(code)
  err.raw       = raw
  return err
}

// ── Retry helper ──────────────────────────────────────────────────────────────

const MAX_RETRIES   = 3
const RETRY_DELAY   = 1_000    // ms

function _sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function _withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let lastError: RGSError = _makeRGSError('ERR_GEN', null)

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = handleRGSError(err)

      if (lastError.retryable && attempt < MAX_RETRIES) {
        _devLog(`${label} failed (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${RETRY_DELAY}ms…`, lastError)
        await _sleep(RETRY_DELAY)
        continue
      }
      break
    }
  }

  throw lastError
}

// ── Dev logging ───────────────────────────────────────────────────────────────

function _devLog(label: string, data?: unknown): void {
  // `import.meta.env` is injected by Vite and is undefined under a bare tsx
  // run. Reading it optionally is what lets the contract test import this
  // module directly instead of restating its mapping, which is how the previous
  // test came to assert a copy of the code rather than the code.
  if ((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV) {
    console.log(`[RGS] ${label}`, data ?? '')
  }
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function _post<T>(url: string, body: Record<string, unknown>): Promise<T> {
  _devLog(`POST ${url}`, body)

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body:    JSON.stringify(body),
  })

  let json: unknown
  try {
    json = await res.json()
  } catch {
    throw _makeRGSError('ERR_GEN', `Non-JSON response from ${url} (${res.status})`)
  }

  if (!res.ok) {
    _devLog(`POST ${url} - HTTP ${res.status}`, json)
    // Surface the error code from the body if present
    throw json    // handleRGSError() will normalise it
  }

  _devLog(`POST ${url} - OK`, json)
  return json as T
}

// ── rgs_url host normalisation ────────────────────────────────────────────────

/**
 * The `rgs_url` launch parameter is a bare HOST, not a URL. The official client
 * does `const fullRGSURL = \`${protocol ?? 'https'}://${paramRGSURL}\``
 * (client.ts at the pin), and `replayService.parseReplayParams` has always done
 * the same. This file did not, so every wallet request went to a relative path
 * on our own origin and could not have reached the RGS at all.
 *
 * Kept tolerant of a host that already carries a scheme, matching replay's
 * `startsWith('http')` test exactly, so the two normalisations cannot drift.
 */
export function normaliseRgsUrl(raw: string): string {
  const trimmed = (raw || '').trim().replace(/\/+$/, '')
  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : `https://${trimmed}`
}

// ── 1. parseSessionParams ─────────────────────────────────────────────────────

/**
 * Parse RGS launch parameters from the URL query string.
 * Throws if sessionID or rgs_url are absent (indicates a mis-launch, not a dev env).
 */
export function parseSessionParams(): SessionParams {
  const p = new URLSearchParams(window.location.search)

  // Accept 'sessionID' or legacy 'session'
  const sessionID = p.get('sessionID') ?? p.get('session')
  const rgs_url   = p.get('rgs_url')

  if (!sessionID) throw new Error('Missing required URL param: sessionID')
  if (!rgs_url)   throw new Error('Missing required URL param: rgs_url')

  const rawDevice = p.get('device')
  const device: 'mobile' | 'desktop' =
    rawDevice === 'mobile' ? 'mobile' : 'desktop'

  const lang = p.get('lang') ?? 'en'

  const params: SessionParams = {
    sessionID,
    lang,
    device,
    rgs_url: normaliseRgsUrl(rgs_url),
  }
  _devLog('parseSessionParams', params)
  return params
}

// ── 2. authenticate ───────────────────────────────────────────────────────────

/**
 * Authenticate the player session, against the official contract.
 *
 * The request body carries `language` as well as `sessionID`, matching the
 * official client. The docs mirror is explicit that the response's bet
 * configuration is authoritative ("Bet increments must reflect allowed values
 * within authenticate/config/minStep", `docs/stake-engine-live/rgs-communication.md`),
 * which independently corroborates the nesting under `config` that the pinned
 * types define. Two separate first-party inputs, per convention (l.4).
 */
export async function authenticate(params: SessionParams): Promise<AuthResponse> {
  _devLog('authenticate ->', { sessionID: params.sessionID, rgs_url: params.rgs_url })

  const raw = await _post<RawAuthenticateWire>(`${params.rgs_url}/wallet/authenticate`, {
    sessionID: params.sessionID,
    language:  params.lang,
  })

  const config = raw.config ?? ({} as RawAuthenticateWire['config'])
  const flags: OfficialJurisdictionFlags = {
    ...EMPTY_JURISDICTION,
    ...(config.jurisdiction ?? raw.jurisdiction ?? {}),
  }

  const auth: AuthResponse = {
    balance:         microsToDisplay(raw.balance?.amount ?? 0),
    minBet:          microsToDisplay(config.minBet ?? 0),
    maxBet:          microsToDisplay(config.maxBet ?? 0),
    stepBet:         microsToDisplay(config.stepBet ?? 0),
    betLevels:       (config.betLevels ?? []).map(microsToDisplay),
    defaultBetLevel: microsToDisplay(config.defaultBetLevel ?? 0),
    currency:        raw.balance?.currency,
    round:           raw.round ?? null,
    jurisdictionFlags: flags,
    jurisdiction:      flags as unknown as Record<string, unknown>,
    // UNKNOWN at the pin. Undefined here means "the platform sent nothing", not
    // "we dropped it", which is the distinction TR-012c needs at DTT.
    currencyDisplay: config.currencyDisplay,
  }

  _devLog('authenticate <- OK', auth)
  return auth
}

// ── 3. play ───────────────────────────────────────────────────────────────────

/**
 * Extract the round's event stream from the official `Round.state`.
 *
 * INFERENCE, labelled as such. `state` is typed `unknown` upstream, so the pin
 * does not say where the events sit. The Bet Replay endpoint for this same game
 * returns `{payoutMultiplier, costMultiplier, state}` with the events at
 * `state.events` (`replayService.ReplayResponse`, and `ReplayMode.svelte` reads
 * `response.state?.events`), so `state.events` is read first. A `state` that IS
 * the array is accepted as the second form. Anything else yields an empty
 * stream, which the interpreter renders as a static board rather than throwing:
 * a money response must not be lost because its presentation payload was an
 * unexpected shape.
 */
export function _extractRoundEvents(state: unknown): RawEvent[] {
  if (Array.isArray(state)) return state as RawEvent[]
  if (state && typeof state === 'object') {
    const events = (state as { events?: unknown }).events
    if (Array.isArray(events)) return events as RawEvent[]
  }
  return []
}

/**
 * Submit a spin to the RGS.
 * Bet amount is converted to integer micros - no floats sent to the API.
 * Wrapped with retry logic for ERR_GEN.
 *
 * The request body is the official one: `{sessionID, mode, amount}`. `amount`
 * is a NUMBER of micros, not a string: the official client sends
 * `amount: params.amount` straight from a `number`, and a string here would
 * fail the platform's own `amount % stepBet` and bet-level checks.
 */
export async function play(
  params:             SessionParams,
  betAmountDollars:   number,
): Promise<PlayResponse> {
  // Integer micros - never a float. BigInt for the conversion, Number for the
  // wire, which is exact for every bet this game can express.
  const amountMicros = Number(displayToMicros(betAmountDollars))

  _devLog('play ->', { sessionID: params.sessionID, amount: amountMicros })

  const raw = await _withRetry('play', () =>
    _post<OfficialPlayResponse>(`${params.rgs_url}/wallet/play`, {
      sessionID: params.sessionID,
      // Sanctioned additive: include the selected bet mode ('base' default, or
      // 'bonus' when the buy UI set it). Base spins are unaffected.
      mode:      get(selectedBetMode),
      amount:    amountMicros,
    })
  )

  return _normalisePlay(raw)
}

/** Shared by `play` and the mock, so both go through one normalisation. */
function _normalisePlay(raw: OfficialPlayResponse): PlayResponse {
  const round = raw.round
  const winMicros = round?.payout ?? 0

  const resp: PlayResponse = {
    events:           _extractRoundEvents(round?.state),
    balance:          microsToDisplay(raw.balance?.amount ?? 0),
    roundId:          String(round?.betID ?? ''),
    betID:            round?.betID ?? 0,
    win:              microsToDisplay(winMicros),
    winMicros,
    payoutMultiplier: round?.payoutMultiplier ?? 0,
    active:           round?.active === true,
    round,
  }

  _devLog('play <- OK', resp)
  return resp
}

// ── 4. endRound ───────────────────────────────────────────────────────────────

/**
 * Close a round on the RGS.
 *
 * The official request body is `{sessionID}` ALONE, and the official response
 * is `{balance}` alone. The RGS closes whichever round the session currently
 * holds; round identity is not part of the call in either direction. Our
 * previous version sent `roundId` and read one back, and the response field it
 * read does not exist.
 *
 * `roundId` is kept as an optional second parameter so `sessionRecovery.ts` and
 * any other existing caller compile and behave unchanged. It is used for the
 * dev log and echoed back on the result; it is NOT sent, because sending an
 * unrecognised field to a strict wallet endpoint is how a settle gets rejected.
 *
 * R1a scope (b), 2026-07-25, retained: `play` has always been wrapped in retry;
 * `endRound` called `_post` directly, leaving the CREDIT leg unprotected, so
 * one transient failure meant the wallet had taken the bet and the player had
 * not been paid. It is routed through `_withRetry`.
 *
 * IDEMPOTENCY, restated under the new contract because the old justification no
 * longer holds as written. The previous comment said the retry was safe
 * "because end-round is idempotent ON THE ROUND ID: the request carries
 * roundId". It does not carry roundId. The retry is still safe, for a different
 * reason: the call settles the session's currently-active round, and once that
 * round is settled the session has no active round, so a repeat is a no-op that
 * returns the same balance. That is the same guarantee reached by a different
 * route, and it is written out rather than left as an inherited assumption.
 * Flagged for DTT confirmation against a real endpoint.
 */
export async function endRound(
  params:  SessionParams,
  roundId?: string,
): Promise<EndRoundResponse> {
  _devLog('endRound ->', { sessionID: params.sessionID, roundId })

  const raw = await _withRetry('endRound', () =>
    _post<OfficialEndRoundResponse>(`${params.rgs_url}/wallet/end-round`, {
      sessionID: params.sessionID,
    }),
  )

  const resp: EndRoundResponse = {
    balance: microsToDisplay(raw.balance?.amount ?? 0),
    roundId,
  }

  _devLog('endRound <- OK', resp)
  return resp
}

// ── Module-level session state ────────────────────────────────────────────────

let _sessionParams: SessionParams | null = null
let _rgsMode = false     // true = connected to live RGS, false = mock

// ── 5. initRGS (called by App.svelte onMount) ─────────────────────────────────

/**
 * Attempt to parse session params and authenticate.
 * Falls back silently to mock mode when launch params are absent (dev environment).
 */
export async function initRGS(_gameId: string, _legacyToken: string): Promise<void> {
  isLoading.set(true)
  errorMessage.set(null)

  try {
    _sessionParams = parseSessionParams()
    const auth     = await authenticate(_sessionParams)

    // Sync balance and currency from RGS into the game store
    balance.set(auth.balance)
    if (auth.currency) currencyCode.set(auth.currency)
    rgsBetLevels.set(auth.betLevels)
    // Sanctioned additive passthrough: publish jurisdiction flags for the buy UI
    // and the RG layer. These are now the TYPED official twelve.
    jurisdictionFlags.set(auth.jurisdiction)

    _rgsMode = true
    _devLog('RGS connected - auth OK', { balance: auth.balance, betLevels: auth.betLevels })
  } catch (err) {
    const isParamError =
      err instanceof Error &&
      (err.message.includes('sessionID') || err.message.includes('rgs_url'))

    if (isParamError) {
      // Dev environment - no launch URL params present
      console.info('[RGS] Dev mode: session params absent, using mock')
      _rgsMode = false
    } else {
      // Real auth failure
      const rgsErr = handleRGSError(err)
      errorMessage.set(rgsErr.message)
      console.error('[RGS] Auth failed:', rgsErr)
      _rgsMode = false
    }
  } finally {
    isLoading.set(false)
  }
}

// ── 6. spin (unified entry point for App.svelte) ──────────────────────────────

export async function spin(req: SpinRequest): Promise<SpinResult> {
  if (_rgsMode && _sessionParams) {
    return _rgsSpinReal(req)
  }
  return _mockSpin(req)
}

// ── Real RGS spin flow ────────────────────────────────────────────────────────

async function _rgsSpinReal(req: SpinRequest): Promise<SpinResult> {
  const params = _sessionParams!

  try {
    const playResp = await play(params, req.betAmount)

    // Sanctioned additive: publish the complete raw round event sequence BEFORE
    // flattening, so the Overdrive presentation can play back the full round.
    // SpinResult and every existing consumer are untouched.
    lastRoundEvents.set(playResp.events)

    // authBalance starts as the post-play value (bet already deducted by RGS)
    let authBalance = playResp.balance

    // Close the round when the platform says one is still active.
    //
    // CHANGED, deliberately. The old gate was `winMicros > 0`, which is our own
    // rule rather than the platform's, and it is wrong in both directions
    // against the official contract: a zero-win round the RGS still holds open
    // would never be settled, and a settled winning round would be settled
    // again. The official client's own rule is the round's `active` flag
    // ("Only call this API if Play() has returned an Active result",
    // client.ts). `winMicros > 0` is kept as a fallback for a response that
    // omits `active`, so behaviour cannot regress against a server that does
    // not send it.
    const needsEndRound = playResp.round ? playResp.active : playResp.winMicros > 0
    if (needsEndRound) {
      const endResp = await endRound(params, playResp.roundId)
      authBalance = endResp.balance   // post-credit authoritative balance
    }

    const result = _parsePlayResponse(playResp, req.betAmount)
    result.newBalance = authBalance   // carry authoritative balance to App.svelte
    return result
  } catch (err) {
    const rgsErr = handleRGSError(err)
    errorMessage.set(rgsErr.message)
    throw rgsErr
  }
}

// ── Event parser: PlayResponse → SpinResult ───────────────────────────────────
//
// R1a scope (a), 2026-07-25. TR-009, and it was total rather than partial.
//
// This parser used to read three event types of its own invention:
//
//   { type: 'board',   data: { symbols } }
//   { type: 'win',     data: { symbol, kind, ways, payout } }
//   { type: 'scatter', data: { count, multiplier, award } }
//
// The shipped books emit none of them. Measured across the first 300 rounds of
// `books_base.jsonl.zst`: reveal 724, winInfo 499, setWin 499, setTotalWin 774,
// and board 0, win 0, scatter 0. Every branch below was therefore dead on a live
// round, and a live player would have been shown an EMPTY board with no wins and
// no scatter, because `_emptyBoard()` was returned unchanged.
//
// It is not re-implemented here. `roundInterpreter.ts` is the canonical reader of
// the reveal/winInfo schema, it is already what the Overdrive presentation plays
// back, and a second implementation of the same schema is precisely the
// duplication that produced this defect. This function now delegates and maps.
//
// PADDING. `reveal` carries a SIX-row board per reel: the visible 5x4 grid plus
// one padding row above and one below, used by the spin animation and never
// shown to a player. Verified against the shipped book, not assumed:
// 5 reels, [6,6,6,6,6] rows. `SpinResult.board` is the VISIBLE grid, 5x4, so the
// first and last row of each reel are dropped. Counting the padding as real is
// exactly the error that produced the retracted six-scatter claim (CLAUDE.md
// convention (l), worked example), so it is stated and measured here rather than
// inferred.

function _parsePlayResponse(resp: PlayResponse, betDollars: number): SpinResult {
  const script = interpretEvents(resp.events)
  const base = script.baseSpin

  // Cell[][] including padding -> visible string[][]. slice(1, -1) drops exactly
  // the one padding row at each end.
  const board: string[][] = base.board.map((reel) =>
    reel.slice(1, reel.length - 1).map((cell) => cell.name),
  )

  // Centibets are bet-multiples x100, so a win is (centibets / 100) x the bet.
  const winEvents: WinEvent[] = base.wins.map((w) => ({
    symbol: w.symbol,
    kind:   w.kind,
    ways:   w.ways,
    payout: (w.winCentibets / 100) * betDollars,
  }))

  // The instant scatter award is a bet-multiple in centibets at meter 1x, which
  // is the same quantity the legacy `multiplier` field carried (1x / 3x / 10x).
  const scatterEvent: ScatterEvent | null =
    base.scatterCount >= 3
      ? {
          count:      base.scatterCount,
          multiplier: script.instantScatterCentibets / 100,
          award:      (script.instantScatterCentibets / 100) * betDollars,
        }
      : null

  // The cap test now reads the platform's own centibet multiplier where it sent
  // one, rather than dividing two dollar figures. `payoutMultiplier >= 500000`
  // is exactly the 5,000x cap, and it cannot be perturbed by float division.
  const isWincap = resp.payoutMultiplier > 0
    ? resp.payoutMultiplier >= CENTIBET_CAP
    : resp.win / betDollars >= 5000

  return {
    board,
    winEvents,
    scatterEvent,
    totalWin:   resp.win,
    isWincap,
    roundId:    resp.roundId,
    // newBalance is set by _rgsSpinReal after endRound completes
  }
}

// ── Development mock ──────────────────────────────────────────────────────────
//
// R2R JOB 4. THE MOCK NOW SPEAKS THE OFFICIAL CONTRACT.
//
// The old mock built a `SpinResult` directly: its own board, its own win events,
// its own scatter object. It therefore exercised NONE of the parsing the live
// path depends on, and it kept the invented `{symbol, kind, ways, payout}` event
// vocabulary alive in a second place after PR #103 removed it from the live
// path. A dev harness that agrees with production about nothing is worse than no
// harness, because it reports green.
//
// It now emits an OFFICIAL-SHAPED `OfficialPlayResponse` whose `round.state`
// carries the real `reveal` / `winInfo` / `setTotalWin` / `finalWin` schema the
// shipped books emit, including the six-row padded board, and then runs it
// through `_normalisePlay` and `_parsePlayResponse`: the same two functions the
// live path uses, with no branch for mock anywhere inside them. If the parser
// breaks, the mock breaks, which is the whole point.
//
// The reel weights and paytable are unchanged, so the dev feel is unchanged.

const SYMBOLS      = ['H1','H2','M1','M2','M3','L1','L2','L3','W','S']
const REEL_WEIGHTS = [   2,   3,   5,   6,   8,  10,  12,  14,  3,  2]
const TOTAL_WEIGHT = REEL_WEIGHTS.reduce((a, b) => a + b, 0)

const PAYTABLE: Record<string, Record<number, number>> = {
  H1: { 5: 22.00, 4: 6.00, 3: 1.50 },
  H2: { 5: 10.00, 4: 3.00, 3: 0.80 },
  M1: { 5:  5.00, 4: 1.50, 3: 0.45 },
  M2: { 5:  4.00, 4: 1.00, 3: 0.30 },
  M3: { 5:  2.00, 4: 0.60, 3: 0.20 },
  L1: { 5:  1.50, 4: 0.45, 3: 0.15 },
  L2: { 5:  0.80, 4: 0.25, 3: 0.10 },
  L3: { 5:  0.65, 4: 0.20, 3: 0.08 },
}

const SCATTER_TABLE: Record<number, number> = { 3: 1, 4: 3, 5: 10 }

function _pickSymbol(): string {
  let r = Math.random() * TOTAL_WEIGHT
  for (let i = 0; i < SYMBOLS.length; i++) {
    r -= REEL_WEIGHTS[i]
    if (r <= 0) return SYMBOLS[i]
  }
  return SYMBOLS[SYMBOLS.length - 1]
}

function _cell(name: string): Cell {
  return { name, wild: name === 'W', scatter: name === 'S' }
}

/**
 * Build one official-shaped play response from a randomly drawn visible board.
 *
 * Exported for the test suite, which asserts that a mock response and a real
 * book round travel the same code path. Not used by production code beyond
 * `_mockSpin`.
 */
export function _buildMockPlayResponse(
  betAmountDollars: number,
  visible: string[][],
  balanceMicros: number,
  betID: number,
): OfficialPlayResponse {
  // The book's `reveal` board is SIX rows per reel: one padding row above the
  // visible four and one below. The mock pads with the same weighted draw so a
  // consumer that forgot to slice would be visibly wrong here too.
  const board: Cell[][] = visible.map((reel) => [
    _cell(_pickSymbol()),
    ...reel.map(_cell),
    _cell(_pickSymbol()),
  ])

  let scatterCount = 0
  visible.forEach((reel) => reel.forEach((s) => { if (s === 'S') scatterCount++ }))

  // Wins in CENTIBETS, which is the unit the books and the interpreter use.
  const wins: Array<Record<string, unknown>> = []
  let totalCentibets = 0

  for (const sym of Object.keys(PAYTABLE)) {
    for (let matchLen = 5; matchLen >= 3; matchLen--) {
      let ways = 1
      let hit  = true
      for (let r = 0; r < matchLen; r++) {
        const count = visible[r].filter((s) => s === sym || s === 'W').length
        if (count === 0) { hit = false; break }
        ways *= count
      }
      if (hit) {
        const centibets = Math.round(PAYTABLE[sym][matchLen] * ways * 100)
        wins.push({ symbol: sym, kind: matchLen, win: centibets, meta: { ways, globalMult: 1 } })
        totalCentibets += centibets
        break
      }
    }
  }

  if (scatterCount >= 3) {
    const centibets = SCATTER_TABLE[Math.min(scatterCount, 5)] * 100
    wins.push({ symbol: 'S', kind: scatterCount, win: centibets, meta: { ways: 1, globalMult: 1 } })
    totalCentibets += centibets
  }

  totalCentibets = Math.min(totalCentibets, CENTIBET_CAP)

  const events: RawEvent[] = [{ type: 'reveal', board, gameType: 'basegame' }]
  if (wins.length) events.push({ type: 'winInfo', wins, totalWin: totalCentibets })
  events.push({ type: 'setTotalWin', amount: totalCentibets })
  events.push({ type: 'finalWin', amount: totalCentibets })

  const payoutMicros = Math.round((totalCentibets / 100) * betAmountDollars * CURRENCY_SCALE)

  return {
    balance: { amount: balanceMicros, currency: get(currencyCode) || 'USD' },
    round: {
      betID,
      amount:           Math.round(betAmountDollars * CURRENCY_SCALE),
      payout:           payoutMicros,
      payoutMultiplier: totalCentibets,
      // The mock settles inside itself, so the round is never left active. A
      // dev session must not ask a wallet that is not there to close a round.
      active:           false,
      mode:             get(selectedBetMode) || 'base',
      state:            { events },
    },
  }
}

function _mockSpin(req: SpinRequest): SpinResult {
  const visible: string[][] = Array.from({ length: 5 }, () =>
    Array.from({ length: 4 }, () => _pickSymbol())
  )

  // Balance is managed locally by recordSpinResult in mock mode, so the
  // envelope's balance is the store's current value and is deliberately not
  // carried into SpinResult.newBalance below.
  const raw = _buildMockPlayResponse(
    req.betAmount,
    visible,
    Math.round(get(balance) * CURRENCY_SCALE),
    _mockBetID++,
  )

  const resp   = _normalisePlay(raw)
  const result = _parsePlayResponse(resp, req.betAmount)

  _devLog('mockSpin', result)

  // newBalance intentionally absent - recordSpinResult manages balance locally
  // in mock mode. Everything else came through the production parser.
  return { ...result, roundId: `mock-${resp.roundId}` }
}

let _mockBetID = 1
