// gameStore.ts — Svelte stores for Future Spinner game state

import { writable, derived, get } from 'svelte/store'
import type { Locale } from '../i18n/translations'

// ── Bet ladder (matches game_config.py bet_levels) ────────────────────────────
export const BET_LEVELS = [0.10, 0.20, 0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00]
export const WINCAP = 5000

// ── Core state stores ─────────────────────────────────────────────────────────

/** Player's current balance in currency units */
export const balance = writable<number>(100.00)

/** Currently selected bet amount */
export const betAmount = writable<number>(1.00)

/** Win amount for the most recent spin (0 if no win) */
export const winAmount = writable<number>(0)

/** Whether a spin is currently in progress */
export const isSpinning = writable<boolean>(false)

/** Whether the game is in auto-play mode */
export const isAutoPlay = writable<boolean>(false)

/** Number of auto-play spins remaining (0 = off) */
export const autoPlayCount = writable<number>(0)

/** UI loading state */
export const isLoading = writable<boolean>(true)

/** Error message (null = no error) */
export const errorMessage = writable<string | null>(null)

/** Active locale */
export const locale = writable<Locale>('en')

/** Raw board result from last spin — 5 reels × 4 rows */
export const boardSymbols = writable<string[][]>([])

/** Win lines / ways highlighted after last spin */
export const activeWins = writable<Array<{ symbol: string; ways: number; payout: number }>>([])

/** Scatter count on last spin (0 if none) */
export const scatterCount = writable<number>(0)

/** Whether the last spin hit the wincap */
export const isWincap = writable<boolean>(false)

/** Current buy-bonus mode active */
export const buyBonusActive = writable<boolean>(false)

/** Session statistics */
export const sessionStats = writable({
  spinsPlayed: 0,
  totalBet: 0,
  totalWon: 0,
  biggestWin: 0,
})

// ── Derived stores ────────────────────────────────────────────────────────────

/** Current bet index in BET_LEVELS array */
export const betIndex = derived(betAmount, ($bet) =>
  BET_LEVELS.indexOf($bet) === -1 ? 0 : BET_LEVELS.indexOf($bet)
)

/** Win as a multiplier of current bet */
export const winMultiplier = derived(
  [winAmount, betAmount],
  ([$win, $bet]) => ($bet > 0 ? $win / $bet : 0)
)

/** Whether player can afford the current spin */
export const canSpin = derived(
  [balance, betAmount, isSpinning, isLoading],
  ([$bal, $bet, $spinning, $loading]) => $bal >= $bet && !$spinning && !$loading
)

/** Whether player can afford buy-bonus (100× bet) */
export const canBuyBonus = derived(
  [balance, betAmount, isSpinning, isLoading],
  ([$bal, $bet, $spinning, $loading]) => $bal >= $bet * 100 && !$spinning && !$loading
)

// ── Actions ───────────────────────────────────────────────────────────────────

export function increaseBet(): void {
  betAmount.update($bet => {
    const idx = BET_LEVELS.indexOf($bet)
    return idx < BET_LEVELS.length - 1 ? BET_LEVELS[idx + 1] : $bet
  })
}

export function decreaseBet(): void {
  betAmount.update($bet => {
    const idx = BET_LEVELS.indexOf($bet)
    return idx > 0 ? BET_LEVELS[idx - 1] : $bet
  })
}

export function setMaxBet(): void {
  betAmount.set(BET_LEVELS[BET_LEVELS.length - 1])
}

export function setMinBet(): void {
  betAmount.set(BET_LEVELS[0])
}

export function recordSpinResult(win: number, bet: number): void {
  winAmount.set(win)
  balance.update($bal => $bal - bet + win)
  isWincap.set(win / bet >= WINCAP)
  sessionStats.update(s => ({
    spinsPlayed: s.spinsPlayed + 1,
    totalBet:    s.totalBet + bet,
    totalWon:    s.totalWon + win,
    biggestWin:  Math.max(s.biggestWin, win),
  }))
}

export function resetWin(): void {
  winAmount.set(0)
  activeWins.set([])
  scatterCount.set(0)
  isWincap.set(false)
}
