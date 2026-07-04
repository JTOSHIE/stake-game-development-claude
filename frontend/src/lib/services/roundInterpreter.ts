// roundInterpreter.ts — pure, typed interpreter that converts one book round
// into an ordered presentation script for the Overdrive Free Spins feature.
//
// NON-LOCKED. Reads only book-round data (the shape the maths emits and the
// shape the replay endpoint returns). No Svelte, no side effects, unit-testable.
//
// Event schema (from the shipped books, games/future_spinner):
//   reveal            { gameType: 'basegame'|'freegame', board: Cell[][] }
//   winInfo           { totalWin, wins: [{ symbol, kind, win, positions, meta:{ ways, globalMult, ... } }] }
//   setWin            { amount }                     // this spin's win (centibets)
//   setTotalWin       { amount }                     // running round total (centibets)
//   freeSpinTrigger   { totalFs }                    // base trigger, initial spins
//   updateFreeSpin    { amount }                     // 0-based index of the spin about to reveal
//   freeSpinRetrigger { totalFs }                    // new total after +5
//   updateGlobalMult  { globalMult }                 // NEW meter value, emitted after a winning free spin
//   freeSpinEnd       { amount }
//   finalWin          { amount }                     // == round.payoutMultiplier
//   wincap            { amount }                     // present if the 5,000x cap was hit
//
// All monetary amounts here are integer CENTIBETS (bet-multiple x 100). Win
// amounts already include the Overdrive meter that was active for that spin.

export const CENTIBET_CAP = 500_000 // 5,000.00x in centibets

export interface Cell {
  name: string
  wild?: boolean
  scatter?: boolean
}
export type Board = Cell[][] // [reel][row], includes padding rows

export interface RawEvent {
  index?: number
  type: string
  [k: string]: unknown
}

export interface BookRound {
  id: number
  payoutMultiplier: number // centibets
  events: RawEvent[]
  criteria?: string
  baseGameWins?: number // bet-multiples
  freeGameWins?: number // bet-multiples
}

export interface PresentedWin {
  symbol: string
  kind: number
  ways: number
  meter: number // Overdrive multiplier applied to this win
  winCentibets: number // meter-applied award
}

export interface PresentedSpin {
  phase: 'base' | 'free'
  fsIndex: number | null // 0-based free-spin index, null for the base spin
  board: Board
  wins: PresentedWin[]
  scatterCount: number
  meterBefore: number
  meterAfter: number
  retrigger: { addedSpins: number; newTotal: number } | null
  spinWinCentibets: number
  runningTotalCentibets: number
}

export interface PresentationScript {
  roundId: number
  triggered: boolean
  baseSpin: PresentedSpin
  initialFreeSpins: number
  freeSpins: PresentedSpin[]
  totalFreeSpinsAwarded: number
  finalMeter: number
  instantScatterCentibets: number // base-trigger instant scatter award (meter 1x)
  baseGameWinCentibets: number
  freeGameWinCentibets: number
  totalWinCentibets: number // == round.payoutMultiplier
  isWincap: boolean
}

const SCATTER_NAME = 'S'

function countScatters(board: Board): number {
  let n = 0
  for (const reel of board) {
    for (const cell of reel) {
      if (cell && (cell.scatter || cell.name === SCATTER_NAME)) n++
    }
  }
  return n
}

function newSpin(phase: 'base' | 'free', fsIndex: number | null, board: Board, meter: number): PresentedSpin {
  return {
    phase,
    fsIndex,
    board,
    wins: [],
    scatterCount: countScatters(board),
    meterBefore: meter,
    meterAfter: meter,
    retrigger: null,
    spinWinCentibets: 0,
    runningTotalCentibets: 0,
  }
}

/**
 * Convert a single book round into an ordered presentation script.
 * Pure: no mutation of the input, no side effects.
 */
export function interpretRound(round: BookRound): PresentationScript {
  const events = round.events ?? []

  let meter = 1
  let phase: 'base' | 'free' = 'base'
  let pendingFsIndex: number | null = null

  let baseSpin: PresentedSpin | null = null
  const freeSpins: PresentedSpin[] = []
  let current: PresentedSpin | null = null

  let triggered = false
  let initialFreeSpins = 0
  let totalFreeSpinsAwarded = 0
  let instantScatterCentibets = 0
  let running = 0

  const pushCurrent = () => {
    if (current) {
      current.runningTotalCentibets = running
      if (current.phase === 'base') baseSpin = current
      else freeSpins.push(current)
      current = null
    }
  }

  for (const ev of events) {
    switch (ev.type) {
      case 'reveal': {
        // finalize the previous spin before starting a new reveal
        pushCurrent()
        const board = (ev.board as Board) ?? []
        const gt = ev.gameType as string
        if (gt === 'freegame') {
          phase = 'free'
          current = newSpin('free', pendingFsIndex, board, meter)
          pendingFsIndex = null
        } else {
          phase = 'base'
          current = newSpin('base', null, board, meter)
        }
        break
      }
      case 'winInfo': {
        if (!current) break
        const wins = (ev.wins as Array<Record<string, unknown>>) ?? []
        for (const w of wins) {
          const m = (w.meta as Record<string, unknown> | undefined) ?? {}
          const winCentibets = Number(w.win ?? 0)
          const presented: PresentedWin = {
            symbol: String(w.symbol ?? ''),
            kind: Number(w.kind ?? 0),
            ways: Number((m.ways as number) ?? 0),
            meter: Number((m.globalMult as number) ?? current.meterBefore),
            winCentibets,
          }
          current.wins.push(presented)
          current.spinWinCentibets += winCentibets
          // The base-trigger instant scatter award (meter 1x) is the scatter win
          // in the base spin.
          if (current.phase === 'base' && presented.symbol === SCATTER_NAME) {
            instantScatterCentibets += winCentibets
          }
        }
        break
      }
      case 'setTotalWin': {
        running = Number(ev.amount ?? running)
        if (current) current.runningTotalCentibets = running
        break
      }
      case 'freeSpinTrigger': {
        triggered = true
        initialFreeSpins = Number(ev.totalFs ?? 0)
        totalFreeSpinsAwarded = initialFreeSpins
        break
      }
      case 'freeSpinRetrigger': {
        const newTotal = Number(ev.totalFs ?? totalFreeSpinsAwarded)
        const added = newTotal - totalFreeSpinsAwarded
        totalFreeSpinsAwarded = newTotal
        if (current) current.retrigger = { addedSpins: added, newTotal }
        break
      }
      case 'updateGlobalMult': {
        // Emitted after a winning free spin: the NEW meter value that applies
        // from the next spin onward. Record it as this spin's meterAfter.
        meter = Number(ev.globalMult ?? meter)
        if (current) current.meterAfter = meter
        break
      }
      case 'updateFreeSpin': {
        pendingFsIndex = Number(ev.amount ?? 0)
        break
      }
      default:
        break
    }
  }
  pushCurrent()

  const totalWinCentibets = round.payoutMultiplier
  const finalMeter = meter

  // Fallbacks if the round had no base reveal (should not happen for real books)
  const safeBase: PresentedSpin =
    baseSpin ?? newSpin('base', null, [], 1)

  return {
    roundId: round.id,
    triggered,
    baseSpin: safeBase,
    initialFreeSpins,
    freeSpins,
    totalFreeSpinsAwarded,
    finalMeter,
    instantScatterCentibets,
    baseGameWinCentibets: Math.round((round.baseGameWins ?? 0) * 100),
    freeGameWinCentibets: Math.round((round.freeGameWins ?? 0) * 100),
    totalWinCentibets,
    isWincap: totalWinCentibets >= CENTIBET_CAP,
  }
}

/**
 * Interpret a raw event list (no BookRound wrapper), deriving the total payout
 * from the finalWin event. Used by the live spin flow and by replay, where only
 * the event sequence is available.
 */
export function interpretEvents(events: RawEvent[]): PresentationScript {
  let payout = 0
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].type === 'finalWin') {
      payout = Number((events[i] as { amount?: number }).amount ?? 0)
      break
    }
  }
  return interpretRound({ id: 0, payoutMultiplier: payout, events })
}

/**
 * Sum of every presented win event across the whole round, in centibets.
 * The exact-total gate (verification) requires
 *   min(sumPresentedWins(script), CENTIBET_CAP) === round.payoutMultiplier
 * because the maths caps the running total at the win cap.
 */
export function sumPresentedWins(script: PresentationScript): number {
  let sum = 0
  for (const w of script.baseSpin.wins) sum += w.winCentibets
  for (const s of script.freeSpins) for (const w of s.wins) sum += w.winCentibets
  return sum
}

// ── Per-cell multiplier wilds (mechanic-agnostic overlay data) ───────────────
// The multiplier-wilds maths (games/future_spinner_multiwild) evaluates ways with
// multiplier_strategy="symbol": each Wild cell can carry an assigned multiplier,
// the winning way's meta.symbolMult is the accumulation of those wild multipliers,
// and every winning way's `positions` list includes the wild positions. When a
// wild cell carries a multiplier the SDK serialises it two ways, either of which
// we accept here:
//   - on the reveal board cell:  { name: 'W', wild: true, multiplier: N }
//   - on a winInfo win position:  { reel, row, multiplier: N }
// (mirrors src/calculations/ways.py, which writes the multiplier onto the wild
// position dict, and src/events/events.py json_ready_sym, which writes it onto
// the board cell.)
//
// collectCellMultipliers derives, for one round, the list of cells that carry a
// wild multiplier as VISIBLE-grid coordinates (reel 0..4, row 0..3) so the
// presentation can drop a per-cell badge straight onto GameGrid. Reveal boards
// may include padding rows; the top-padding offset is inferred from the board
// height and stripped so the returned rows are always 0-based visible rows.

export interface CellMultiplier {
  reel: number
  row: number
  value: number // the wild multiplier on that cell (only values > 1 are surfaced)
}

const VISIBLE_ROWS = 4

/** Top padding rows on a reveal board given its total row count (visible = 4). */
function topPadding(rowCount: number): number {
  return Math.max(0, Math.floor((rowCount - VISIBLE_ROWS) / 2))
}

/**
 * Collect the per-cell wild multipliers for a round, in visible-grid coordinates.
 * Deduplicates by cell (a cell that appears in several winning ways is emitted
 * once, keeping the largest multiplier seen). Only multipliers > 1 are surfaced,
 * since a plain wild (multiplier 1) carries no badge-worthy value.
 */
export function collectCellMultipliers(round: BookRound): CellMultiplier[] {
  const events = round.events ?? []

  // Infer the top-padding offset from the first reveal board so win positions
  // (which use the padded row index) map back to visible rows 0..3.
  let pad = 0
  for (const ev of events) {
    if (ev.type === 'reveal') {
      const board = ev.board as Array<unknown[]> | undefined
      if (board && Array.isArray(board[0])) pad = topPadding(board[0].length)
      break
    }
  }

  const byCell = new Map<string, number>()
  const add = (reelRaw: unknown, rowRaw: unknown, multRaw: unknown, padded: boolean): void => {
    const value = Number(multRaw)
    if (!Number.isFinite(value) || value <= 1) return
    const reel = Number(reelRaw)
    const row = Number(rowRaw) - (padded ? pad : 0)
    if (!Number.isInteger(reel) || !Number.isInteger(row)) return
    if (row < 0 || row >= VISIBLE_ROWS) return
    const key = `${reel},${row}`
    byCell.set(key, Math.max(byCell.get(key) ?? 0, value))
  }

  for (const ev of events) {
    if (ev.type === 'winInfo') {
      const wins = (ev.wins as Array<Record<string, unknown>>) ?? []
      for (const w of wins) {
        const positions = (w.positions as Array<Record<string, unknown>>) ?? []
        for (const p of positions) add(p.reel, p.row, p.multiplier, true)
      }
    } else if (ev.type === 'reveal') {
      const board = (ev.board as Array<Array<Record<string, unknown>>>) ?? []
      for (let reel = 0; reel < board.length; reel++) {
        const col = board[reel] ?? []
        for (let row = 0; row < col.length; row++) {
          const cell = col[row]
          if (cell && (cell.wild || cell.name === 'W')) add(reel, row, cell.multiplier, true)
        }
      }
    }
  }

  return [...byCell.entries()].map(([key, value]) => {
    const [reel, row] = key.split(',').map(Number)
    return { reel, row, value }
  })
}

/** collectCellMultipliers over a bare event list (live spin / replay path). */
export function cellMultipliersFromEvents(events: RawEvent[]): CellMultiplier[] {
  return collectCellMultipliers({ id: 0, payoutMultiplier: 0, events })
}
