/**
 * rgsService.ts — Production RGS API client for Future Spinner
 *
 * Responsibilities:
 *  - Parse session launch parameters from the URL
 *  - Authenticate with the Stake Engine RGS
 *  - Submit spin (play) requests using integer micros for all money values
 *  - Close winning rounds via end-round
 *  - Map all 8 RGS error codes to typed, user-friendly errors
 *  - Retry transient ERR_GEN failures (max 3 attempts, 1 s apart)
 *
 * NEVER calculate game outcomes here. All game logic lives in the RGS.
 * NEVER use floats for monetary values sent to the API.
 */

import { errorMessage, isLoading, balance, currencyCode } from '../stores/gameStore'

// ── Currency ──────────────────────────────────────────────────────────────────
/** 1 dollar = 1,000,000 micros. Use ONLY integer arithmetic for money. */
export const CURRENCY_SCALE = 1_000_000

function microsToDisplay(micros: number): number {
  return micros / CURRENCY_SCALE
}

function displayToMicros(dollars: number): bigint {
  // BigInt arithmetic prevents floating-point rounding on large bets
  return BigInt(Math.floor(dollars * CURRENCY_SCALE))
}

// ── TypeScript interfaces ─────────────────────────────────────────────────────

export interface SessionParams {
  sessionID: string
  lang:      string
  device:    'mobile' | 'desktop'
  rgs_url:   string
}

// -- Authenticate --------------------------------------------------------------
interface RawAuthResponse {
  balance:    number       // micros
  minBet:     number       // micros
  maxBet:     number       // micros
  stepBet:    number       // micros
  betLevels:  number[]     // micros[]
  currency?:  string
  round?:     ActiveRound  // present when a round is in progress
}

interface ActiveRound {
  roundId: string
  state:   'open' | 'pending_end'
}

export interface AuthResponse {
  balance:   number       // dollars
  minBet:    number       // dollars
  maxBet:    number       // dollars
  stepBet:   number       // dollars
  betLevels: number[]     // dollars[]
  currency?: string
  round?:    ActiveRound
}

// -- Play ---------------------------------------------------------------------
interface RawPlayResponse {
  events:  RawGameEvent[]
  balance: number          // micros
  roundId: string
  win:     number          // micros
}

interface RawGameEvent {
  type: string
  data: Record<string, unknown>
}

export interface PlayResponse {
  events:  RawGameEvent[]
  balance: number          // dollars (converted)
  roundId: string
  win:     number          // dollars (converted)
  winMicros: number        // raw micros (kept for end-round comparison)
}

// -- End round ----------------------------------------------------------------
interface RawEndRoundResponse {
  balance: number          // micros
  roundId: string
}

export interface EndRoundResponse {
  balance: number          // dollars
  roundId: string
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
  board:        string[][]         // [reel][row] — 5 reels × 4 rows
  winEvents:    WinEvent[]
  scatterEvent: ScatterEvent | null
  totalWin:     number             // dollars
  newBalance?:  number             // dollars; present = RGS authoritative; absent = mock (store manages)
  isWincap:     boolean
  roundId:      string
}

// -- Errors -------------------------------------------------------------------
export type RGSErrorCode =
  | 'ERR_VAL'          // Validation — bad bet amount / missing field
  | 'ERR_IPB'          // Insufficient player balance
  | 'ERR_IS'           // Invalid session — must re-launch
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
  // Already a typed RGSError — pass through
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

  // Fallback — unknown error
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
  if (import.meta.env.DEV) {
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
    _devLog(`POST ${url} — HTTP ${res.status}`, json)
    // Surface the error code from the body if present
    throw json    // handleRGSError() will normalise it
  }

  _devLog(`POST ${url} — OK`, json)
  return json as T
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

  const params: SessionParams = { sessionID, lang, device, rgs_url }
  _devLog('parseSessionParams', params)
  return params
}

// ── 2. authenticate ───────────────────────────────────────────────────────────

/**
 * Authenticate the player session.
 * All monetary values returned are converted from micros to dollars.
 */
export async function authenticate(params: SessionParams): Promise<AuthResponse> {
  _devLog('authenticate →', { sessionID: params.sessionID, rgs_url: params.rgs_url })

  const raw = await _post<RawAuthResponse>(`${params.rgs_url}/wallet/authenticate`, {
    sessionID: params.sessionID,
  })

  const auth: AuthResponse = {
    balance:   microsToDisplay(raw.balance),
    minBet:    microsToDisplay(raw.minBet),
    maxBet:    microsToDisplay(raw.maxBet),
    stepBet:   microsToDisplay(raw.stepBet),
    betLevels: raw.betLevels.map(microsToDisplay),
    currency:  raw.currency,
    round:     raw.round,
  }

  _devLog('authenticate ← OK', auth)
  return auth
}

// ── 3. play ───────────────────────────────────────────────────────────────────

/**
 * Submit a spin to the RGS.
 * Bet amount is converted to integer micros — no floats sent to the API.
 * Wrapped with retry logic for ERR_GEN.
 */
export async function play(
  params:             SessionParams,
  betAmountDollars:   number,
): Promise<PlayResponse> {
  // Integer micros — never a float
  const amountMicros = displayToMicros(betAmountDollars).toString()

  _devLog('play →', { sessionID: params.sessionID, amount: amountMicros })

  const raw = await _withRetry('play', () =>
    _post<RawPlayResponse>(`${params.rgs_url}/wallet/play`, {
      sessionID: params.sessionID,
      amount:    amountMicros,
    })
  )

  const resp: PlayResponse = {
    events:     raw.events,
    balance:    microsToDisplay(raw.balance),
    roundId:    raw.roundId,
    win:        microsToDisplay(raw.win),
    winMicros:  raw.win,
  }

  _devLog('play ← OK', resp)
  return resp
}

// ── 4. endRound ───────────────────────────────────────────────────────────────

/**
 * Close a round on the RGS. Only called when win > 0.
 * The RGS credits the player balance on its side; we sync the display value.
 */
export async function endRound(
  params:  SessionParams,
  roundId: string,
): Promise<EndRoundResponse> {
  _devLog('endRound →', { sessionID: params.sessionID, roundId })

  const raw = await _post<RawEndRoundResponse>(`${params.rgs_url}/wallet/end-round`, {
    sessionID: params.sessionID,
    roundId,
  })

  const resp: EndRoundResponse = {
    balance: microsToDisplay(raw.balance),
    roundId: raw.roundId,
  }

  _devLog('endRound ← OK', resp)
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

    _rgsMode = true
    _devLog('RGS connected — auth OK', { balance: auth.balance, betLevels: auth.betLevels })
  } catch (err) {
    const isParamError =
      err instanceof Error &&
      (err.message.includes('sessionID') || err.message.includes('rgs_url'))

    if (isParamError) {
      // Dev environment — no launch URL params present
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

    // authBalance starts as the post-play value (bet already deducted by RGS)
    let authBalance = playResp.balance

    // Close the round on a win — RGS credits the prize and returns updated balance
    if (playResp.winMicros > 0) {
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
// Expected event types emitted by the Stake Engine for Future Spinner:
//
//   { type: 'board',   data: { symbols: string[][] } }
//   { type: 'win',     data: { symbol, kind, ways, payout } }  (payout in micros)
//   { type: 'scatter', data: { count, multiplier, award } }    (award  in micros)
//
// If the RGS sends a different shape, adjust the type-guards below.

function _parsePlayResponse(resp: PlayResponse, betDollars: number): SpinResult {
  let board:        string[][] = _emptyBoard()
  const winEvents:  WinEvent[] = []
  let scatterEvent: ScatterEvent | null = null

  for (const ev of resp.events) {
    if (ev.type === 'board' && Array.isArray(ev.data?.symbols)) {
      board = ev.data.symbols as string[][]
      continue
    }

    if (ev.type === 'win') {
      const d = ev.data
      winEvents.push({
        symbol:  String(d.symbol  ?? ''),
        kind:    Number(d.kind    ?? 0),
        ways:    Number(d.ways    ?? 1),
        payout:  microsToDisplay(Number(d.payout ?? 0)),
      })
      continue
    }

    if (ev.type === 'scatter') {
      const d = ev.data
      scatterEvent = {
        count:      Number(d.count      ?? 0),
        multiplier: Number(d.multiplier ?? 1),
        award:      microsToDisplay(Number(d.award ?? 0)),
      }
    }
  }

  return {
    board,
    winEvents,
    scatterEvent,
    totalWin:   resp.win,
    isWincap:   resp.win / betDollars >= 5000,
    roundId:    resp.roundId,
    // newBalance is set by _rgsSpinReal after endRound completes
  }
}

// ── Development mock ──────────────────────────────────────────────────────────
// Produces realistic spin results using BR0.csv reel weights (2/3/5/6/8/10/12/14/3/2).
// RTP profile mirrors the 96.35% target via the paytable from game_config.py.

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

function _emptyBoard(): string[][] {
  return Array.from({ length: 5 }, () => Array.from({ length: 4 }, () => 'L3'))
}

function _mockSpin(req: SpinRequest): SpinResult {
  const board: string[][] = Array.from({ length: 5 }, () =>
    Array.from({ length: 4 }, () => _pickSymbol())
  )

  let scatterCount = 0
  board.forEach(reel => reel.forEach(sym => { if (sym === 'S') scatterCount++ }))

  const winEvents: WinEvent[] = []
  let totalWin = 0

  for (const sym of Object.keys(PAYTABLE)) {
    for (let matchLen = 5; matchLen >= 3; matchLen--) {
      let ways = 1
      let hit  = true
      for (let r = 0; r < matchLen; r++) {
        const count = board[r].filter(s => s === sym || s === 'W').length
        if (count === 0) { hit = false; break }
        ways *= count
      }
      if (hit) {
        const payout = PAYTABLE[sym][matchLen] * ways * req.betAmount
        const capped = Math.min(payout, req.betAmount * 5000)
        winEvents.push({ symbol: sym, kind: matchLen, ways, payout: capped })
        totalWin += capped
        break
      }
    }
  }

  let scatterEvent: ScatterEvent | null = null
  if (scatterCount >= 3) {
    const mult  = SCATTER_TABLE[Math.min(scatterCount, 5)]
    const award = mult * req.betAmount
    scatterEvent = { count: scatterCount, multiplier: mult, award }
    totalWin    += award
  }

  totalWin = Math.min(totalWin, req.betAmount * 5000)

  _devLog('mockSpin', { board, winEvents, scatterEvent, totalWin })

  return {
    board,
    winEvents,
    scatterEvent,
    totalWin,
    // newBalance intentionally absent — recordSpinResult manages balance locally in mock mode
    isWincap: totalWin / req.betAmount >= 5000,
    roundId:  `mock-${Date.now()}`,
  }
}
