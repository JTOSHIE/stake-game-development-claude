<script lang="ts">
  import { onMount } from 'svelte'
  import GameGrid       from './lib/components/GameGrid.svelte'
  import ControlBar     from './lib/components/ControlBar.svelte'
  import BalanceDisplay from './lib/components/BalanceDisplay.svelte'
  import WinDisplay     from './lib/components/WinDisplay.svelte'
  import LoadingScreen  from './lib/components/LoadingScreen.svelte'

  import {
    isLoading, betAmount, boardSymbols, activeWins,
    scatterCount, isSpinning, autoPlayCount, isAutoPlay,
    buyBonusActive, recordSpinResult, resetWin, errorMessage,
  } from './lib/stores/gameStore'
  import { spin, initRGS } from './lib/services/rgsService'
  import type { SpinResult } from './lib/services/rgsService'

  let gridRef: GameGrid

  onMount(async () => {
    // In production, obtain sessionToken from URL params / RGS launch URL
    const params   = new URLSearchParams(window.location.search)
    const token    = params.get('session') ?? 'dev-mock-token'
    const gameId   = 'future_spinner'

    await initRGS(gameId, token)
    isLoading.set(false)
  })

  async function handleSpin() {
    if ($isSpinning) return
    resetWin()

    const mode = $buyBonusActive ? 'bonus' : 'base'
    const bet  = $betAmount

    try {
      const result: SpinResult = await spin({ betAmount: bet, mode })

      // Animate reels, then reveal result
      if (gridRef) {
        await gridRef.animateSpin(result.board)
      }

      boardSymbols.set(result.board)
      activeWins.set(result.winEvents)
      scatterCount.set(result.scatterEvent?.count ?? 0)
      recordSpinResult(result.totalWin, bet)

      buyBonusActive.set(false)

      // Auto-play continuation
      if ($isAutoPlay) {
        autoPlayCount.update(n => n - 1)
        if ($autoPlayCount <= 0) {
          isAutoPlay.set(false)
        } else {
          setTimeout(handleSpin, 800)
        }
      }
    } catch (err) {
      console.error('[Spin error]', err)
      isSpinning.set(false)
    }
  }

  function handleBuyBonus() {
    buyBonusActive.set(true)
    handleSpin()
  }
</script>

<main class="game-wrapper">
  {#if $isLoading}
    <LoadingScreen />
  {/if}

  <header class="game-header">
    <h1 class="game-title">FUTURE SPINNER</h1>
    <p class="provider">We Roll Spinners</p>
  </header>

  {#if $errorMessage}
    <div class="error-banner">{$errorMessage}</div>
  {/if}

  <section class="grid-section">
    <GameGrid bind:this={gridRef} />
  </section>

  <footer class="hud">
    <BalanceDisplay />
    <WinDisplay />
  </footer>

  <ControlBar on:spin={handleSpin} on:buyBonus={handleBuyBonus} />
</main>

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    background: #06060f;
    color: #fff;
    font-family: 'Segoe UI', system-ui, sans-serif;
    overflow: hidden;
    height: 100dvh;
  }

  .game-wrapper {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    max-width: 720px;
    margin: 0 auto;
  }

  .game-header {
    text-align: center;
    padding: 0.75rem 1rem 0.25rem;
    flex-shrink: 0;
  }

  .game-title {
    font-size: 1.4rem;
    font-weight: 900;
    letter-spacing: 0.2em;
    background: linear-gradient(135deg, #ffd700, #ff8c00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .provider {
    font-size: 0.65rem;
    color: #555;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .error-banner {
    background: rgba(255, 50, 50, 0.15);
    border: 1px solid rgba(255, 50, 50, 0.4);
    color: #ff8080;
    text-align: center;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .grid-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    min-height: 0;
  }

  .hud {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0.5rem 1.5rem;
    background: rgba(0,0,0,0.4);
    border-top: 1px solid rgba(255,255,255,0.05);
    flex-shrink: 0;
  }
</style>
