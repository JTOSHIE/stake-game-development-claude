<script lang="ts">
  import { onMount } from 'svelte'
  import GameGrid       from './lib/components/GameGrid.svelte'
  import ControlBar     from './lib/components/ControlBar.svelte'
  import BalanceDisplay from './lib/components/BalanceDisplay.svelte'
  import WinDisplay     from './lib/components/WinDisplay.svelte'
  import LoadingScreen    from './lib/components/LoadingScreen.svelte'
  import WinCelebration   from './lib/components/WinCelebration.svelte'
  import PaytableModal    from './lib/components/PaytableModal.svelte'

  import {
    isLoading, betAmount, boardSymbols, activeWins,
    scatterCount, isSpinning, autoPlayCount, isAutoPlay,
    buyBonusActive, recordSpinResult, resetWin, errorMessage,
    winMultiplier, showPaytable,
  } from './lib/stores/gameStore'
  import { spin, initRGS } from './lib/services/rgsService'
  import type { SpinResult } from './lib/services/rgsService'

  let gridRef: GameGrid

  onMount(async () => {
    const params  = new URLSearchParams(window.location.search)
    const token   = params.get('session') ?? 'dev-mock-token'
    const gameId  = 'future_spinner'

    await initRGS(gameId, token)
    // isLoading is cleared inside initRGS's finally block
  })

  async function handleSpin() {
    if ($isSpinning) return
    isSpinning.set(true)   // disable spin button immediately, before async work begins
    resetWin()

    const mode = $buyBonusActive ? 'bonus' : 'base'
    const bet  = $betAmount

    try {
      const result: SpinResult = await spin({ betAmount: bet, mode })

      if (gridRef) await gridRef.animateSpin(result.board)

      boardSymbols.set(result.board)
      activeWins.set(result.winEvents)
      scatterCount.set(result.scatterEvent?.count ?? 0)
      recordSpinResult(result.totalWin, bet, result.newBalance)
      buyBonusActive.set(false)

      if ($isAutoPlay) {
        autoPlayCount.update(n => n - 1)
        if ($autoPlayCount <= 0) isAutoPlay.set(false)
        else setTimeout(handleSpin, 800)
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

<main class="game-wrapper" class:bonus-bg={$buyBonusActive}>
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
    <WinCelebration winMultiplier={$winMultiplier} />
    <GameGrid bind:this={gridRef} />
  </section>

  <footer class="hud">
    <BalanceDisplay />
    <WinDisplay />
  </footer>

  <ControlBar on:spin={handleSpin} on:buyBonus={handleBuyBonus} />

  {#if $showPaytable}
    <PaytableModal />
  {/if}
</main>

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    /* Desktop cyberpunk background */
    background-color: #06060f;
    background-image: url('/assets/symbols/bg1_main_game_desktop_variant_01.png');
    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;
    background-attachment: fixed;
    color: #fff;
    font-family: 'Segoe UI', system-ui, sans-serif;
    overflow: hidden;
    height: 100dvh;
  }

  /* Mobile: swap to portrait-optimised background */
  @media (max-width: 480px) {
    :global(body) {
      background-image: url('/assets/symbols/bg1_main_game_mobile_variant_04.png');
    }
  }

  .game-wrapper {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    max-width: 720px;
    margin: 0 auto;
    /* Subtle dark overlay so grid and UI stay readable over the background */
    background: linear-gradient(
      to bottom,
      rgba(6,6,15,0.55) 0%,
      rgba(6,6,15,0.35) 40%,
      rgba(6,6,15,0.65) 100%
    );
    transition: background 0.6s ease;
  }

  /* Bonus buy: shift tint toward deep purple */
  .game-wrapper.bonus-bg {
    background: linear-gradient(
      to bottom,
      rgba(20,0,40,0.65) 0%,
      rgba(10,0,25,0.40) 40%,
      rgba(20,0,40,0.70) 100%
    );
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
    /* Legible on any background colour */
    filter: drop-shadow(0 1px 6px rgba(0,0,0,0.9));
  }

  .provider {
    font-size: 0.65rem;
    color: rgba(255,255,255,0.4);
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
    padding: 0.4rem 1.5rem;
    background: rgba(0,0,0,0.25);
    border-top: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
  }
</style>
