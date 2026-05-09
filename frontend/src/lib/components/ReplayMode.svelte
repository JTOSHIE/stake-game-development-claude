<script lang="ts">
  import { onMount } from 'svelte'
  import {
    parseReplayParams,
    fetchReplay,
    microsToDisplay,
    totalBetSpentMicros,
    currencySymbol,
  } from '../services/replayService'
  import {
    replayParams,
    replayResponse,
    replayPhase,
    replayError,
  } from '../stores/replayStore'
  import GameGrid from './GameGrid.svelte'
  import WinDisplay from './WinDisplay.svelte'
  import WinPod from './WinPod.svelte'

  // Drive the animation pipeline by setting gameStore writables via their
  // public .set() API — gameStore.ts itself is NOT modified.
  import {
    boardSymbols,
    activeWins,
    scatterCount,
    winAmount,
    betAmount,
    isWincap,
    isSpinning,
    WINCAP,
  } from '../stores/gameStore'

  import type { ReplayParams, ReplayResponse } from '../services/replayService'

  let params: ReplayParams | null = null
  let response: ReplayResponse | null = null
  let phase: 'loading' | 'ready' | 'playing' | 'complete' | 'error' = 'loading'
  let error: string | null = null
  let gridRef: GameGrid

  onMount(async () => {
    try {
      const p = parseReplayParams()
      if (!p) {
        // Should never happen — App.svelte should only render this in replay mode.
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
      // Future Spinner stores the round as an events array in state.
      // Shape: [{ type: 'board', data: { symbols: string[][] } },
      //         { type: 'win',   data: { symbol, kind, ways, payout } }, ...]
      const events: any[] = Array.isArray(response.state?.events)
        ? response.state.events
        : []

      // --- Board ----------------------------------------------------------
      const boardEvent = events.find((ev: any) => ev.type === 'board')
      // Fall back to response.state.board if the event array is absent
      const board: string[][] = boardEvent?.data?.symbols ?? response.state?.board ?? []

      // --- Win events (payout in micros, kind = match length 3|4|5) -------
      const winEvents = events
        .filter((ev: any) => ev.type === 'win')
        .map((ev: any) => ({
          symbol: ev.data.symbol as string,
          kind:   ev.data.kind   as number,
          ways:   ev.data.ways   as number,
          payout: ev.data.payout as number,
        }))

      // --- Scatter --------------------------------------------------------
      const scatterEvt = events.find((ev: any) => ev.type === 'scatter')

      // Set bet so winMultiplier derived store resolves correctly
      betAmount.set(microsToDisplay(params.amount))

      // Drive the reel spin animation (identical pipeline to live game)
      isSpinning.set(true)
      if (gridRef && board.length > 0) {
        await gridRef.animateSpin(board)
      }
      isSpinning.set(false)

      // Populate result stores — exactly as App.svelte does post-spin
      boardSymbols.set(board)
      activeWins.set(winEvents)
      scatterCount.set(scatterEvt?.data?.count ?? 0)
      // winAmount drives the derived winMultiplier (winAmount / betAmount)
      winAmount.set(microsToDisplay(response.payoutMultiplier * params.amount))
      isWincap.set(response.payoutMultiplier >= WINCAP)

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
</script>

<div class="replay-container">
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
          <div class="btn-line-1">START REPLAY</div>
          <div class="btn-line-2">Mode: <strong>{params.mode}</strong></div>
          <div class="btn-line-3">
            Bet: <strong>{currencySymbol(params.currency)}{baseBet.toFixed(2)}</strong>
            {#if showCostMultiplier}
              × {response.costMultiplier} cost =
              <strong>{currencySymbol(params.currency)}{totalSpent.toFixed(2)}</strong>
            {/if}
          </div>
        </button>
      {:else if phase === 'playing'}
        <div class="replay-status playing">Replaying round…</div>
      {:else if phase === 'complete'}
        <button class="replay-btn play-again" on:click={playAgain}>
          PLAY AGAIN
        </button>
      {/if}
    </div>

    <!-- Currency display (per Stake Engine spec) -->
    <div class="currency-display">
      Currency: <strong>{params.currency}</strong>
    </div>
  {/if}
</div>

<style>
  .replay-container {
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
    .replay-btn {
      min-width: 240px;
      padding: 1rem 1.5rem;
    }
    .btn-line-1 {
      font-size: 1.25rem;
    }
  }
</style>
