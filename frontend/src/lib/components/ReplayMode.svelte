<script lang="ts">
  import { onMount } from 'svelte'
  import {
    parseReplayParams,
    fetchReplay,
    microsToDisplay,
    totalBetSpentMicros,
    currencySymbol,
  } from '../services/replayService'
  import { formatBalance, CURRENCY_SCALE, isVirtualCurrency } from '../utils/currency'
  import {
    replayParams,
    replayResponse,
    replayPhase,
    replayError,
  } from '../stores/replayStore'
  import GameGrid from './GameGrid.svelte'
  import WinDisplay from './WinDisplay.svelte'
  import WinPod from './WinPod.svelte'
  import FreeSpinsPresentation from './FreeSpinsPresentation.svelte'
  import MaxWinCelebration from './MaxWinCelebration.svelte'
  import { interpretEvents, type PresentationScript, type RawEvent } from '../services/roundInterpreter'
  import { socialAtBoot } from '../stores/socialMode'

  // Drive the animation pipeline by setting gameStore writables via their
  // public .set() API, gameStore.ts itself is NOT modified.
  import {
    boardSymbols,
    activeWins,
    scatterCount,
    winAmount,
    betAmount,
    currencyCode,
    isWincap,
    isSpinning,
    WINCAP,
  } from '../stores/gameStore'

  import type { ReplayParams, ReplayResponse } from '../services/replayService'

  // i18n, replay supports the ?lang= param; the disclaimer must follow it.
  import { t, type Locale, type GameMode } from '../i18n/translations'

  // Resolve the locale/mode eagerly so the disclaimer renders correctly even
  // during the initial loading phase (before onMount assigns `params`).
  const search = new URLSearchParams(window.location.search)
  const initialLang = (search.get('lang') ?? 'en') as Locale
  // R2R JOB 6 / TR-041. This derived the first-paint mode from the `social`
  // flag ALONE, so a replay URL carrying `currency=XSC` without the flag
  // painted the real-money disclaimer for one frame before the currency store
  // was written in startReplay. `socialAtBoot` resolves the flag AND the URL
  // currency at module load, before mount, which closes that frame.
  const initialMode: GameMode = socialAtBoot ? 'social' : 'real'

  let params: ReplayParams | null = null
  let response: ReplayResponse | null = null
  let phase: 'loading' | 'ready' | 'playing' | 'complete' | 'error' = 'loading'
  let error: string | null = null
  let gridRef: GameGrid

  // Overdrive free-spins playback (feature rounds).
  let featureScript: PresentationScript | null = null
  let featureActive = false
  let featureResolve: (() => void) | null = null
  function onFeatureComplete(): void {
    featureActive = false
    const r = featureResolve
    featureResolve = null
    if (r) r()
  }

  // Wincap flow (applies to replay too): show the MAX WIN splash immediately,
  // wait for COLLECT, then present the complete round sequence, finishing on
  // the total win summary, same order as live play.
  let wincapCollectResolve: (() => void) | null = null
  function handleWincapCollect(): void {
    isWincap.set(false)
    const r = wincapCollectResolve
    wincapCollectResolve = null
    if (r) r()
  }

  onMount(async () => {
    try {
      const p = parseReplayParams()
      if (!p) {
        // Should never happen, App.svelte should only render this in replay mode.
        throw new Error('ReplayMode rendered outside of replay mode.')
      }
      params = p
      replayParams.set(p)

      const r = await fetchReplay(p)
      response = r
      replayResponse.set(r)
      phase = 'ready'
      replayPhase.set('ready')
    } catch (e: any) {
      error = e?.message ?? 'Failed to load replay.'
      phase = 'error'
      replayPhase.set('error')
      replayError.set(error)
    }
  })

  async function startReplay() {
    if (!response || !params) return
    phase = 'playing'
    replayPhase.set('playing')

    try {
      // ══════════════════════════════════════════════════════════════════════
      // R2R JOB 5, 2026-07-25. EVERY ROUND GOES THROUGH THE CANONICAL READER.
      // ══════════════════════════════════════════════════════════════════════
      //
      // Round-two reviewer 3's second BLOCKER. This function used the canonical
      // interpreter ONLY when the round carried a `freeSpinTrigger`. Every
      // ordinary round - every loss, every base win, every capped base round -
      // fell through to a search for three event types:
      //
      //   { type: 'board',   data: { symbols } }
      //   { type: 'win',     data: { symbol, kind, ways, payout } }
      //   { type: 'scatter', data: { count, ... } }
      //
      // None of them exists. They are the same invented schema PR #103 removed
      // from the live path, left behind here. Measured across the first 300
      // rounds of the shipped `books_base.jsonl.zst`: reveal 724, winInfo 499,
      // and board 0, win 0, scatter 0. So `board` resolved to `[]`, no reel
      // animation ran, `activeWins` was empty and `scatterCount` was 0: a
      // player replaying an ordinary win watched a static, empty grid. Bet
      // Replay is a mandatory platform requirement, which is why this is a
      // blocker rather than a defect.
      //
      // There is now ONE call to `interpretEvents` covering every round, and
      // the base-round mapping below is line-for-line the mapping
      // `rgsService._parsePlayResponse` performs, so replay and live cannot
      // disagree about what a round means. The `response.state.board` fallback
      // is gone too: it was a second invented shape, and falling back to one
      // invention when another is missing is not a fallback.
      const events: RawEvent[] = Array.isArray(response.state?.events)
        ? (response.state.events as RawEvent[])
        : []

      // Set bet + currency so amounts format correctly during playback.
      betAmount.set(microsToDisplay(params.amount))
      currencyCode.set(params.currency)

      const betDollars = microsToDisplay(params.amount)
      const script = interpretEvents(events)

      // --- Overdrive free-spins round -------------------------------------
      // If the replayed round triggered the feature, play the full free-spins
      // sequence via the shared interpreter and presentation overlay. The
      // disclaimer stays visible in every phase (rendered at the top).
      if (script.triggered) {
        const wincapNow = response.payoutMultiplier >= WINCAP
        if (wincapNow) {
          // Wincap flow applies in replay too: splash first, then on COLLECT
          // present the complete round sequence, finishing on the summary.
          isWincap.set(true)
          await new Promise<void>((resolve) => { wincapCollectResolve = resolve })
        }
        featureScript = script
        featureActive = true
        await new Promise<void>((resolve) => { featureResolve = resolve })
        winAmount.set(microsToDisplay(response.payoutMultiplier * params.amount))
        isWincap.set(wincapNow)
        phase = 'complete'
        replayPhase.set('complete')
        return
      }

      // --- Ordinary round, from the canonical reader -----------------------
      const base = script.baseSpin

      // `reveal` carries SIX rows per reel: the visible 5x4 grid plus one
      // padding row above and below, used by the spin animation and never
      // shown. slice(1, -1) drops exactly one row at each end. Counting the
      // padding as real is the error behind the retracted six-scatter claim
      // (CLAUDE.md convention (l), worked example).
      const board: string[][] = base.board.map((reel) =>
        reel.slice(1, reel.length - 1).map((cell) => cell.name),
      )

      // Wins arrive in centibets (bet-multiples x100). `activeWins` holds
      // DOLLARS, which is what App.svelte puts there after a live spin. The
      // deleted code put micros here, from a field that never existed.
      const winEvents = base.wins.map((w) => ({
        symbol: w.symbol,
        kind:   w.kind,
        ways:   w.ways,
        payout: (w.winCentibets / 100) * betDollars,
      }))

      // Wincap flow (non-feature base round reaching the cap, see the
      // feature-round branch above for the more common triggered case):
      // splash first, wait for COLLECT, then the reel reveal below plays as
      // the "how it happened" presentation, finishing on the summary.
      const wincapNow = response.payoutMultiplier >= WINCAP
      if (wincapNow) {
        isWincap.set(true)
        await new Promise<void>((resolve) => { wincapCollectResolve = resolve })
      }

      // Drive the reel spin animation (identical pipeline to live game)
      isSpinning.set(true)
      if (gridRef && board.length > 0) {
        await gridRef.animateSpin(board)
      }
      isSpinning.set(false)

      // Populate result stores, exactly as App.svelte does post-spin
      boardSymbols.set(board)
      activeWins.set(winEvents)
      // The interpreter counts scatters on the VISIBLE window, not the padded
      // board, which is the same count the live path shows.
      scatterCount.set(base.scatterCount)
      // winAmount drives the derived winMultiplier (winAmount / betAmount)
      winAmount.set(microsToDisplay(response.payoutMultiplier * params.amount))
      isWincap.set(wincapNow)

      // Let win-line and celebration animations complete
      await new Promise((r) => setTimeout(r, 2000))

      phase = 'complete'
      replayPhase.set('complete')
    } catch (e: any) {
      isSpinning.set(false)
      error = e?.message ?? 'Playback failed.'
      phase = 'error'
      replayPhase.set('error')
      replayError.set(error)
    }
  }

  function playAgain() {
    // Reset visible state and let user trigger startReplay again
    activeWins.set([])
    winAmount.set(0)
    isWincap.set(false)
    scatterCount.set(0)
    phase = 'ready'
    replayPhase.set('ready')
  }

  // Display helpers
  $: baseBet = params ? microsToDisplay(params.amount) : 0
  $: totalSpent = params && response
    ? microsToDisplay(totalBetSpentMicros(params.amount, response.costMultiplier))
    : 0
  $: showCostMultiplier = response ? response.costMultiplier !== 1.0 : false

  // Disclaimer text, prefer parsed params once available, else the eager values.
  $: locale = (params?.lang ?? initialLang) as Locale
  $: mode = (params?.social ? 'social' : initialMode) as GameMode
  $: disclaimer = t(locale, 'replayDisclaimer', mode)
</script>

<div class="replay-container">
  <!-- Replay disclaimer, always visible, Stake Engine compliance. Makes clear
       this is a non-interactive replay of a past round with no real wager. -->
  <div class="replay-disclaimer" role="note">{disclaimer}</div>

  <!-- Wincap flow applies in replay too: splash first, then COLLECT reveals
       the full round sequence (see startReplay). -->
  <MaxWinCelebration show={$isWincap} on:collect={handleWincapCollect} />

  {#if phase === 'loading'}
    <div class="replay-status loading">Loading replay…</div>
  {:else if phase === 'error'}
    <div class="replay-status error">
      <div class="error-title">Replay failed to load</div>
      <div class="error-detail">{error}</div>
    </div>
  {:else if params && response}
    <!-- Game grid is always shown once data is ready -->
    <div class="grid-area">
      <GameGrid bind:this={gridRef} />
      <FreeSpinsPresentation
        script={featureScript}
        active={featureActive}
        on:complete={onFeatureComplete}
      />
    </div>

    <!-- Win amount display once replay has played out -->
    {#if phase === 'complete' || phase === 'playing'}
      <div class="win-area">
        <WinDisplay />
        <WinPod />
      </div>
    {/if}

    <!-- Replay controls (compliant with Stake Engine spec) -->
    <div class="replay-controls">
      {#if phase === 'ready'}
        <button class="replay-btn start-replay" on:click={startReplay}>
          <div class="btn-line-1">{t(params.lang as Locale, 'hudStartReplay', mode)}</div>
          <div class="btn-line-2">Mode: <strong>{params.mode}</strong></div>
          <div class="btn-line-3">
            {mode === 'social' ? 'Play' : 'Bet'}: <strong>{formatBalance(Math.round(baseBet * CURRENCY_SCALE), params.currency, params.lang)}</strong>
            {#if showCostMultiplier}
              × {response.costMultiplier} {mode === 'social' ? '=' : 'cost ='}
              <strong>{formatBalance(Math.round(totalSpent * CURRENCY_SCALE), params.currency, params.lang)}</strong>
            {/if}
          </div>
        </button>
      {:else if phase === 'playing'}
        <div class="replay-status playing">Replaying round…</div>
      {:else if phase === 'complete'}
        <button class="replay-btn play-again" on:click={playAgain}>
          {t(params.lang as Locale, 'replayAgain', mode)}
        </button>
      {/if}
    </div>

    <!-- Currency display. The replay spec's UI Simplification table lists
         "Currency display" under Keep/Show, so this stays. Two constraints
         apply on top of it, both fixed 2026-07-25:
           1. Virtual currencies must show the player-facing symbol, never the
              raw platform code. Printing "XSC" at a player is exactly what the
              jurisdiction rules prohibit.
           2. The word "currency" is itself on the stake.us prohibited-terms
              table (currency -> token), so the label switches in social mode. -->
    <div class="currency-display">
      {mode === 'social' ? 'Token' : 'Currency'}:
      <strong>{isVirtualCurrency(params.currency)
        ? currencySymbol(params.currency, params.lang)
        : params.currency}</strong>
    </div>
  {/if}
</div>

<style>
  .replay-container {
    /* TR-076. Positioned above App.svelte's fixed .bg-layer (z-index 0), the
       same relationship .game-stage (z-index 2) has in normal play. Without
       this the backdrop painted over the whole replay UI, leaving START
       REPLAY a shadow under the dark overlay. */
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 2rem 1rem;
    box-sizing: border-box;
    background: #060610;
    font-family: 'Orbitron', sans-serif;
    color: #00FFFF;
  }

  .replay-disclaimer {
    flex: 0 0 auto;
    max-width: 560px;
    text-align: center;
    font-size: 0.8125rem;
    font-weight: 400;
    line-height: 1.4;
    color: #FFD700;
    background: rgba(255, 215, 0, 0.08);
    border: 1px solid rgba(255, 215, 0, 0.35);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    letter-spacing: 0.01em;
  }

  .grid-area {
    position: relative;
    flex: 0 0 auto;
  }

  .win-area {
    position: relative;
  }

  .replay-controls {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  .replay-btn {
    background: linear-gradient(135deg, #00FFFF, #FF00FF);
    color: #060610;
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    border: none;
    border-radius: 12px;
    padding: 1.25rem 2.5rem;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    box-shadow: 0 0 24px rgba(0, 255, 255, 0.4);
    text-align: center;
    min-width: 280px;
  }

  .replay-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 32px rgba(255, 0, 255, 0.5);
  }

  .replay-btn:active {
    transform: translateY(0);
  }

  .btn-line-1 {
    font-size: 1.5rem;
    font-weight: 900;
    margin-bottom: 0.5rem;
    letter-spacing: 0.1em;
  }

  .btn-line-2,
  .btn-line-3 {
    font-size: 0.875rem;
    font-weight: 400;
    margin-top: 0.25rem;
  }

  .play-again {
    font-size: 1.5rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    padding: 1rem 3rem;
  }

  .replay-status {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.25rem;
    text-align: center;
  }

  .replay-status.loading {
    color: #00FFFF;
  }

  .replay-status.error {
    color: #FF6666;
  }

  .replay-status.playing {
    color: #FF00FF;
    font-weight: 700;
  }

  .error-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .error-detail {
    font-size: 0.875rem;
    font-weight: 400;
    opacity: 0.85;
    max-width: 480px;
  }

  .currency-display {
    font-size: 0.875rem;
    color: #FFD700;
    opacity: 0.8;
  }

  /* Mobile adjustments per Stake Engine viewport spec
     (Mobile S 320×568 is the smallest required size) */
  @media (max-width: 480px) {
    .replay-container {
      padding: 1rem 0.5rem;
      gap: 1rem;
    }
    .replay-disclaimer {
      font-size: 0.75rem;
      padding: 0.625rem 0.75rem;
    }
    .replay-btn {
      min-width: 240px;
      padding: 1rem 1.5rem;
    }
    .btn-line-1 {
      font-size: 1.25rem;
    }
  }
</style>
