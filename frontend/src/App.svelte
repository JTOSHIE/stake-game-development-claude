<script lang="ts">
  import { onMount } from 'svelte'
  import GameGrid       from './lib/components/GameGrid.svelte'
  import ControlBar     from './lib/components/ControlBar.svelte'
  import BalanceDisplay from './lib/components/BalanceDisplay.svelte'
  import WinDisplay     from './lib/components/WinDisplay.svelte'
  import LoadingScreen    from './lib/components/LoadingScreen.svelte'
  import WinCelebration      from './lib/components/WinCelebration.svelte'
  import MaxWinCelebration   from './lib/components/MaxWinCelebration.svelte'
  import PaytableModal       from './lib/components/PaytableModal.svelte'

  import {
    isLoading, betAmount, boardSymbols, activeWins,
    scatterCount, isSpinning, autoPlayCount, isAutoPlay,
    buyBonusActive, recordSpinResult, resetWin, errorMessage,
    winMultiplier, showPaytable, isWincap,
  } from './lib/stores/gameStore'
  import { spin, initRGS } from './lib/services/rgsService'
  import type { SpinResult } from './lib/services/rgsService'

  // Respect prefers-reduced-motion for accessibility
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
      recordSpinResult(result.totalWin, bet, result.newBalance, result.isWincap)
      buyBonusActive.set(false)

      if ($isAutoPlay) {
        autoPlayCount.update(n => n - 1)
        // Stop auto-play immediately on wincap — player must manually collect
        if ($autoPlayCount <= 0 || $isWincap) {
          isAutoPlay.set(false)
          autoPlayCount.set(0)
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

<!-- Background video — behind all UI elements -->
<div class="bg-layer" class:reduce-motion={prefersReducedMotion}>
  {#if !prefersReducedMotion}
    <video
      class="bg-video"
      autoplay
      loop
      muted
      playsinline
      aria-hidden="true"
    >
      <!-- Source added when video assets are available in public/assets/videos/ -->
    </video>
  {/if}
  <div class="bg-overlay"></div>
</div>

<main class="game-wrapper" class:bonus-bg={$buyBonusActive}>
  <!-- Max win overlay — requires explicit COLLECT click; sits below LoadingScreen (z200) -->
  <MaxWinCelebration
    show={$isWincap}
    on:collect={() => isWincap.set(false)}
  />

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
    <!-- Suppress standard celebration while the max-win overlay is active -->
    <WinCelebration winMultiplier={$isWincap ? 0 : $winMultiplier} />
    <!-- Cyberpunk frame overlay — sits above canvas, below controls -->
    <div class="grid-wrapper">
      <GameGrid bind:this={gridRef} />
      <!-- Frame image overlay — replace src when frame PNGs are available -->
      <div class="game-frame" aria-hidden="true"></div>
    </div>
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

  /* ── Background video layer ───────────────────────────────────────────── */
  .bg-layer {
    position: fixed;
    inset: 0;
    z-index: -1;
    overflow: hidden;
  }

  .bg-video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.35;  /* subtle — game elements must remain clear */
  }

  .bg-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.65); /* ensures readability over video */
  }

  /* Reduced-motion fallback: static gradient instead of video */
  .bg-layer.reduce-motion {
    background: radial-gradient(
      ellipse at center,
      #0a0a1a 0%,
      #000000 70%
    );
  }

  /* ── Cyberpunk frame overlay ──────────────────────────────────────────── */
  .grid-wrapper {
    position: relative;
    display: inline-block; /* shrink-wrap around the canvas */
  }

  .game-frame {
    position: absolute;
    inset: -6px;                /* extend slightly beyond canvas edges */
    pointer-events: none;       /* never intercept clicks */
    z-index: 10;                /* above canvas (z 0), below UI controls */
    border-radius: 14px;
    border: 2px solid rgba(0, 255, 255, 0.4);
    /* Pulsing cyan border glow */
    animation: frame-glow 3s ease-in-out infinite;
  }

  /* When a real frame image is added, swap this for an <img> with object-fit:fill */
  .game-frame::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 16px;
    border: 1px solid rgba(255, 0, 255, 0.2);
  }

  @keyframes frame-glow {
    0%, 100% {
      border-color: rgba(0, 255, 255, 0.3);
      box-shadow:
        0 0  6px rgba(0, 255, 255, 0.3),
        inset 0 0  6px rgba(0, 255, 255, 0.1);
    }
    50% {
      border-color: rgba(0, 255, 255, 0.7);
      box-shadow:
        0 0 16px rgba(0, 255, 255, 0.7),
        inset 0 0 10px rgba(0, 255, 255, 0.15);
    }
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
