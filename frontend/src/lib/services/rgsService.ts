// rgsService.ts — RGS API calls for Future Spinner
// Wraps the @stake-engine/ts-client SDK methods

import { errorMessage, isLoading } from '../stores/gameStore'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SpinRequest {
  betAmount: number
  mode: 'base' | 'bonus'
}

export interface WinEvent {
  symbol: string
  kind: number        // match count (3/4/5)
  ways: number
  payout: number      // in currency units
}

export interface ScatterEvent {
  count: number
  multiplier: number  // 1, 3, or 10
  award: number       // in currency units
}

export interface SpinResult {
  board: string[][]           // [reel][row] — 5×4 grid
  winEvents: WinEvent[]
  scatterEvent: ScatterEvent | null
  totalWin: number            // in currency units
  newBalance: number
  isWincap: boolean
  roundId: string
}

// ── Client configuration ──────────────────────────────────────────────────────

let clientInitialised = false
let stakeClient: unknown = null

export async function initRGS(gameId: string, sessionToken: string): Promise<void> {
  isLoading.set(true)
  errorMessage.set(null)

  try {
    // Dynamically import the Stake Engine ts-client
    const { StakeClient } = await import('stake-engine' as string)
    stakeClient = new (StakeClient as new (config: Record<string, unknown>) => unknown)({
      gameId,
      sessionToken,
      environment: import.meta.env.MODE === 'production' ? 'production' : 'staging',
    })
    clientInitialised = true
  } catch (err) {
    console.warn('[RGS] ts-client init failed — using mock mode:', err)
    clientInitialised = false   // fall through to mock
  } finally {
    isLoading.set(false)
  }
}

// ── Spin ──────────────────────────────────────────────────────────────────────

export async function spin(req: SpinRequest): Promise<SpinResult> {
  if (clientInitialised && stakeClient) {
    return _rgsSpinReal(req)
  }
  // Development mock — no RGS connection needed during frontend build
  return _mockSpin(req)
}

async function _rgsSpinReal(req: SpinRequest): Promise<SpinResult> {
  try {
    const client = stakeClient as Record<string, (args: unknown) => Promise<unknown>>
    const raw = await client.spin({ bet: req.betAmount, mode: req.mode })
    return _parseRGSResponse(raw as Record<string, unknown>, req.betAmount)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown RGS error'
    errorMessage.set(msg)
    throw err
  }
}

function _parseRGSResponse(raw: Record<string, unknown>, betAmount: number): SpinResult {
  // Map Stake Engine response shape → SpinResult
  // Adjust field names to match actual ts-client response once integrated
  return {
    board:        (raw.board as string[][])   ?? _emptyBoard(),
    winEvents:    (raw.wins as WinEvent[])    ?? [],
    scatterEvent: (raw.scatter as ScatterEvent | null) ?? null,
    totalWin:     (raw.totalWin as number)    ?? 0,
    newBalance:   (raw.balance as number)     ?? 0,
    isWincap:     ((raw.totalWin as number) ?? 0) / betAmount >= 5000,
    roundId:      (raw.roundId as string)     ?? '',
  }
}

// ── Development mock ──────────────────────────────────────────────────────────
// Produces realistic spin results weighted toward the 96.35% RTP profile.

const SYMBOLS = ['H1','H2','M1','M2','M3','L1','L2','L3','W','S']
const REEL_WEIGHTS = [2, 3, 5, 6, 8, 10, 12, 14, 3, 2]  // matches BR0.csv
const TOTAL_WEIGHT = REEL_WEIGHTS.reduce((a, b) => a + b, 0)

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

  // Count scatters
  let scatterCount = 0
  board.forEach(reel => reel.forEach(sym => { if (sym === 'S') scatterCount++ }))

  // Simple ways evaluation (non-optimised — for visual dev only)
  const winEvents: WinEvent[] = []
  let totalWin = 0

  const PAYTABLE: Record<string, Record<number, number>> = {
    H1: { 5: 22, 4: 6, 3: 1.5 }, H2: { 5: 10, 4: 3, 3: 0.8 },
    M1: { 5: 5,  4: 1.5, 3: 0.45 }, M2: { 5: 4, 4: 1, 3: 0.3 },
    M3: { 5: 2,  4: 0.6, 3: 0.2 }, L1: { 5: 1.5, 4: 0.45, 3: 0.15 },
    L2: { 5: 0.8, 4: 0.25, 3: 0.1 }, L3: { 5: 0.65, 4: 0.2, 3: 0.08 },
  }

  for (const sym of Object.keys(PAYTABLE)) {
    for (let matchLen = 5; matchLen >= 3; matchLen--) {
      let ways = 1
      let hit = true
      for (let reel = 0; reel < matchLen; reel++) {
        const count = board[reel].filter(s => s === sym || s === 'W').length
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

  // Scatter award
  let scatterEvent: ScatterEvent | null = null
  const scatterTable: Record<number, number> = { 3: 1, 4: 3, 5: 10 }
  if (scatterCount >= 3) {
    const mult = scatterTable[Math.min(scatterCount, 5)]
    const award = mult * req.betAmount
    scatterEvent = { count: scatterCount, multiplier: mult, award }
    totalWin += award
  }

  // Enforce wincap
  totalWin = Math.min(totalWin, req.betAmount * 5000)

  return {
    board,
    winEvents,
    scatterEvent,
    totalWin,
    newBalance: 0,     // managed by gameStore
    isWincap: totalWin / req.betAmount >= 5000,
    roundId: `mock-${Date.now()}`,
  }
}
