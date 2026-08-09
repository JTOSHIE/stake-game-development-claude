// walletTimeout.ts - a deadline on every wallet request. Non-locked seam.
//
// THE DEFECT. `rgsService._post` calls `fetch` with no `signal` and no deadline,
// so a wallet endpoint that accepts the connection and never answers leaves the
// promise pending forever. `_withRetry` cannot help: it retries REJECTIONS, and
// a stall never rejects. Measured against the shipped dist with a stub whose
// `/wallet/play` never responds: the spin control held its spinning state for
// 90 seconds with the stake gone from the displayed balance, no banner, no
// error, and a second click doing nothing because handleSpin returns early while
// `$isSpinning`.
//
// rgsService.ts is LOCKED, so the deadline is installed one layer below it, at
// the `fetch` it calls, from main.ts before the app mounts.
//
// WHY THE BODY IS BUFFERED HERE rather than left to `_post`'s `res.json()`.
// `_post` wraps that call in `try { ... } catch { throw _makeRGSError('ERR_GEN',
// ...) }`, and ERR_GEN is the one RETRYABLE code. A stall that delivers headers
// and then withholds the body would therefore abort inside `res.json()`, be
// relabelled as a retryable ERR_GEN, and `_withRetry` would RE-SEND THE BET up
// to three more times against a wallet that may already have taken it. Reading
// the body to completion under the same deadline keeps every stall, headers or
// body, inside this function, where it becomes a NON-retryable error.
//
// The returned Response is a faithful copy: same status, statusText and headers,
// body already in memory. `_post` reads `res.ok`, `res.status` and `res.json()`
// and cannot tell the difference.
//
// 2026-08-10.

import { liveGuardReason } from '../stores/liveGuard'

/**
 * 15 seconds. A play call is one wallet write, and the pinned official client
 * sets no deadline at all, so there is no upstream number to inherit and this is
 * ours to justify. It is an order of magnitude above a healthy round trip, which
 * is what keeps it from abandoning a round the RGS really is about to answer,
 * and short enough that a player is not staring at a frozen control for a
 * minute. One constant, tuned in one place.
 */
export const WALLET_TIMEOUT_MS = 15_000

/** Statuses whose body must be null when a Response is constructed. */
const NULL_BODY_STATUS = new Set([101, 103, 204, 205, 304])

/**
 * The error a stall produces.
 *
 * SHAPED SO THE LOCKED FILE PASSES IT THROUGH UNCHANGED. `handleRGSError`'s
 * first branch returns any Error carrying a string `code` as-is, preserving
 * `retryable`. `retryable: false` is what stops `_withRetry` re-sending the bet,
 * and it is the whole safety argument here.
 *
 * The message is deliberately EMPTY. `_rgsSpinReal`'s catch does
 * `errorMessage.set(rgsErr.message)`, and that store renders raw; every string
 * it can hold today is hardcoded English. An empty one renders nothing, because
 * App's banner is `{#if $errorMessage && ...}`. The player is told what happened
 * by the TRANSLATED live-guard banner instead. The diagnosis goes to the console
 * and to `raw`, where it belongs.
 */
function walletStallError(url: string, ms: number): Error {
  const err = new Error('') as Error & { code: string; retryable: boolean; raw: unknown }
  err.name = 'RGSError'
  err.code = 'ERR_TIMEOUT'
  err.retryable = false
  err.raw = { reason: 'wallet-timeout', url, timeoutMs: ms }
  return err
}

/**
 * Install the deadline. Idempotent, and inert until a `/wallet/` request is
 * made, so the dev mock, which makes none, is untouched.
 */
export function installWalletTimeout(timeoutMs: number = WALLET_TIMEOUT_MS): void {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') return
  if ((window.fetch as { __walletTimeout?: boolean }).__walletTimeout) return

  const nativeFetch = window.fetch.bind(window)

  const wrapped = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url =
      typeof input === 'string' ? input
      : input instanceof URL ? input.href
      : (input as Request).url

    // Only the wallet. Assets, the bet-replay endpoint and everything else keep
    // the platform's own behaviour exactly as it is today. A caller that brought
    // its own signal owns its own cancellation; nothing in this game does, and
    // composing two signals is not worth the surface.
    if (!url.includes('/wallet/') || init?.signal) return nativeFetch(input as RequestInfo, init)

    const controller = new AbortController()
    let timedOut = false
    const timer = setTimeout(() => { timedOut = true; controller.abort() }, timeoutMs)

    try {
      const res = await nativeFetch(input as RequestInfo, { ...init, signal: controller.signal })
      // An opaque or otherwise unconstructable response is handed back as-is,
      // body unread, rather than risking a throw from the Response constructor.
      if (res.status === 0) return res
      const body = NULL_BODY_STATUS.has(res.status) ? null : await res.text()
      return new Response(body, {
        status:     res.status,
        statusText: res.statusText,
        headers:    res.headers,
      })
    } catch (err) {
      // A genuine network failure is NOT ours: rethrown untouched so
      // handleRGSError still maps it to a retryable ERR_GEN, as it does today.
      if (!timedOut) throw err
      console.warn(`[RGS] wallet request timed out after ${timeoutMs}ms: ${url}`)
      // Betting stops here. The outcome of this round is UNKNOWN to us: the RGS
      // may have taken the stake and opened a round. Blocking every bet route is
      // what makes it impossible for the player, or autoplay, to stake a second
      // time against a wallet whose state we can no longer see. Reloading
      // re-authenticates and recoverSession settles whatever round was left
      // open, which is exactly what the translated banner asks them to do.
      liveGuardReason.set('wallet-stalled')
      throw walletStallError(url, timeoutMs)
    } finally {
      clearTimeout(timer)
    }
  }

  ;(wrapped as { __walletTimeout?: boolean }).__walletTimeout = true
  window.fetch = wrapped as typeof window.fetch
}
