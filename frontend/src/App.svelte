<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import GameGrid       from './lib/components/GameGrid.svelte'
  import ControlBar     from './lib/components/ControlBar.svelte'
  import BalanceDisplay from './lib/components/BalanceDisplay.svelte'
  import WinDisplay     from './lib/components/WinDisplay.svelte'
  import LoadingScreen    from './lib/components/LoadingScreen.svelte'
  import WinCelebration      from './lib/components/WinCelebration.svelte'
  import MaxWinCelebration   from './lib/components/MaxWinCelebration.svelte'
  import PaytableModal       from './lib/components/PaytableModal.svelte'
  import WinBanner           from './lib/components/WinBanner.svelte'
  import WinPod              from './lib/components/WinPod.svelte'
  import ThemeSelector       from './lib/components/ThemeSelector.svelte'
  import ReplayMode          from './lib/components/ReplayMode.svelte'
  import { parseReplayParams } from './lib/services/replayService'
  import { activeTheme, themeAssets, switchTheme } from './lib/stores/themeStore'

  // Determine mode synchronously at boot — no async needed.
  // If replay=true with malformed params, treat as replay so ReplayMode shows
  // the error state rather than silently falling back to live game.
  const isReplay = (() => {
    try {
      return parseReplayParams() !== null
    } catch {
      return new URLSearchParams(window.location.search).get('replay') === 'true'
    }
  })()

  import {
    isLoading, betAmount, boardSymbols, activeWins,
    scatterCount, isSpinning, autoPlayCount, isAutoPlay,
    recordSpinResult, resetWin, errorMessage,
    winMultiplier, showPaytable, isWincap,
  } from './lib/stores/gameStore'
  import { spin, initRGS } from './lib/services/rgsService'
  import type { SpinResult } from './lib/services/rgsService'
  import { playBGM, playWin } from './lib/services/soundService'

  let gridRef: GameGrid
  let showThemeSelector = false

  let bgVideo1: HTMLVideoElement
  let bgVideo2: HTMLVideoElement
  let bgVideo1Active = true
  let crossfadeInterval: ReturnType<typeof setInterval> | null = null

  onMount(async () => {
    // Skip all RGS initialisation in replay mode — ReplayMode handles its own flow
    if (isReplay) return

    const params  = new URLSearchParams(window.location.search)
    const token   = params.get('session') ?? 'dev-mock-token'
    const gameId  = 'future_spinner'

    await initRGS(gameId, token)
    // isLoading is cleared inside initRGS's finally block
    playBGM()

    // Crossfade logic — offset video2 by half duration to eliminate loop jump
    if (bgVideo1 && bgVideo2) {
      bgVideo1.addEventListener('loadedmetadata', () => {
        const half = bgVideo1.duration / 2
        bgVideo2.currentTime = half

        crossfadeInterval = setInterval(() => {
          const v1 = bgVideo1
          const v2 = bgVideo2
          if (!v1 || !v2) return

          if (bgVideo1Active && v1.duration > 0 && v1.currentTime > v1.duration - 1.5) {
            bgVideo1Active = false
          } else if (!bgVideo1Active && v2.duration > 0 && v2.currentTime > v2.duration - 1.5) {
            bgVideo1Active = true
          }
        }, 100)
      }, { once: true })
    }
  })

  onDestroy(() => {
    if (crossfadeInterval) clearInterval(crossfadeInterval)
  })

  async function handleSpin() {
    if ($isSpinning) return
    isSpinning.set(true)   // disable spin button immediately, before async work begins
    resetWin()

    const bet  = $betAmount

    try {
      const result: SpinResult = await spin({ betAmount: bet, mode: 'base' })

      if (gridRef) await gridRef.animateSpin(result.board)

      boardSymbols.set(result.board)
      activeWins.set(result.winEvents)
      scatterCount.set(result.scatterEvent?.count ?? 0)
      recordSpinResult(result.totalWin, bet, result.newBalance, result.isWincap)
      playWin(bet > 0 ? result.totalWin / bet : 0)

      if ($isAutoPlay) {
        autoPlayCount.update(n => n - 1)
        // Stop auto-play immediately on wincap — player must manually collect
        if ($autoPlayCount <= 0 || $isWincap) {
          isAutoPlay.set(false)
          autoPlayCount.set(0)
        } else {
          const multiplier = bet > 0 ? result.totalWin / bet : 0
          if (multiplier >= 100) {
            // Epic win — stop autoplay entirely
            isAutoPlay.set(false)
            autoPlayCount.set(0)
          } else if (multiplier >= 30) {
            // Mega win — pause 6 seconds
            setTimeout(handleSpin, 6000)
          } else if (multiplier >= 10) {
            // Big win — pause 3.5 seconds
            setTimeout(handleSpin, 3500)
          } else if (multiplier > 0) {
            // Small/medium win — pause 1.5 seconds
            setTimeout(handleSpin, 1500)
          } else {
            // Dead spin — continue at normal pace
            setTimeout(handleSpin, 800)
          }
        }
      }
    } catch (err) {
      console.error('[Spin error]', err)
      isSpinning.set(false)
    }
  }

</script>

<svelte:head>
  <title>{$activeTheme.name} — We Roll Spinners</title>
</svelte:head>

<!-- ── Background layer ─────────────────────────────────────────────────── -->
<div class="bg-layer">
  {#if $activeTheme.id === 'future-spinner'}
    <!-- Dual video crossfade — eliminates the visible loop restart jump -->
    <div class="bg-video-container">
      <video
        bind:this={bgVideo1}
        class="bg-video"
        class:active={bgVideo1Active}
        autoplay
        loop
        muted
        playsinline
        aria-hidden="true"
      >
        <source src="assets/videos/bg_animated_loop.mp4" type="video/mp4" />
      </video>
      <video
        bind:this={bgVideo2}
        class="bg-video"
        class:active={!bgVideo1Active}
        autoplay
        loop
        muted
        playsinline
        aria-hidden="true"
      >
        <source src="assets/videos/bg_animated_loop.mp4" type="video/mp4" />
      </video>
    </div>
  {:else}
    <!-- Static image background — all other themes; video is NOT in DOM -->
    <img
      class="bg-media"
      src="{$themeAssets.background}"
      alt=""
      aria-hidden="true"
    />
  {/if}
  <!-- Dark overlay to ensure game readability -->
  <div class="bg-overlay" aria-hidden="true"></div>
</div>

{#if isReplay}
  <!-- Replay mode — no betting controls, balance, autoplay, or theme selector -->
  <ReplayMode />
{:else}
<main
  class="game-wrapper"
  style="
    --theme-primary: {$activeTheme.palette.primary};
    --theme-secondary: {$activeTheme.palette.secondary};
    --theme-bg: {$activeTheme.palette.background};
  "
>
  <!-- Max win overlay — requires explicit COLLECT click; sits below LoadingScreen (z200) -->
  <MaxWinCelebration
    show={$isWincap}
    on:collect={() => isWincap.set(false)}
  />

  {#if $isLoading}
    <LoadingScreen />
  {/if}

  <header class="game-header">
    <div class="game-title-area">
      <img
        class="game-logo-img"
        src="{$themeAssets.logo}"
        alt="{$activeTheme.name}"
        draggable="false"
        id="theme-logo-img"
        on:error={() => {
          const img = document.getElementById('theme-logo-img') as HTMLImageElement
          if (img) img.style.display = 'none'
          const txt = document.getElementById('theme-logo-txt')
          if (txt) (txt as HTMLElement).style.display = 'block'
        }}
      />
      <div
        class="logo-text"
        id="theme-logo-txt"
        style="display: none;"
      >
        {$activeTheme.name}
      </div>
    </div>
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
      {#if $themeAssets.frame}
        <img
          src="{$themeAssets.frame}"
          class="game-frame"
          alt=""
          aria-hidden="true"
          on:error={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      {/if}
      <WinBanner />
      <WinPod />
    </div>
  </section>

  <footer class="hud">
    <BalanceDisplay />
    <WinDisplay />
  </footer>

  <ControlBar on:spin={handleSpin} />

  <!-- Theme selector button -->
  <button
    class="util-btn theme-btn"
    on:click={() => showThemeSelector = true}
    aria-label="Change theme"
    title="Change theme"
  >🎨</button>

  {#if $showPaytable}
    <PaytableModal />
  {/if}

  {#if showThemeSelector}
    <ThemeSelector on:close={() => showThemeSelector = false} />
  {/if}
</main>
{/if}

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    background: #060610;
    margin: 0;
    padding: 0;
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
    position: relative;
    z-index: 2;  /* above video layer */
    /* Subtle dark overlay so grid and UI stay readable over the background */
    background: linear-gradient(
      to bottom,
      rgba(6,6,15,0.55) 0%,
      rgba(6,6,15,0.35) 40%,
      rgba(6,6,15,0.65) 100%
    );
    transition: background 0.6s ease;
  }

  .game-header {
    text-align: center;
    padding: 0.75rem 1rem 0.25rem;
    flex-shrink: 0;
    position: relative;
    z-index: 70;  /* Z-INDEX STACK: logo / title */
  }

  .game-title-area {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60px;
    pointer-events: none;
  }

  /* Text hidden by default — only shown by JS when img fails to load */
  .logo-text {
    font-family: 'Courier New', monospace;
    font-size: clamp(1.5rem, 4vw, 2.4rem);
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--theme-primary, #00ffff);
    text-shadow:
      0 0 20px currentColor,
      0 0 40px color-mix(in srgb, currentColor 40%, transparent),
      0 2px 8px rgba(0,0,0,0.9);
    white-space: nowrap;
  }

  .game-logo-img {
    max-height: 72px;
    max-width: 440px;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 2px 12px rgba(0,0,0,0.9));
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
    z-index: 0;
    overflow: hidden;
  }

  /* Static image backgrounds (non-future-spinner themes) */
  .bg-media {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    pointer-events: none;
    display: block;
    opacity: 0.92;
  }

  /* Dual-video crossfade container (future-spinner) */
  .bg-video-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .bg-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    opacity: 0;
    transition: opacity 1.5s ease;
    pointer-events: none;
  }

  .bg-video.active {
    opacity: 0.85;
  }

  /* ── Theme toggle button ──────────────────────────────────────────────── */
  .util-btn.theme-btn {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 50;
    background: rgba(0,0,0,0.55);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, border-color 0.15s;
    color: #fff;
  }
  .util-btn.theme-btn:hover {
    background: color-mix(in srgb, var(--theme-primary, #00ffff) 12%, transparent);
    border-color: color-mix(in srgb, var(--theme-primary, #00ffff) 45%, transparent);
  }

  .bg-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .bg-media { animation: none; filter: none; }
  }

  /* ── Cyberpunk frame overlay ──────────────────────────────────────────── */
  .grid-wrapper {
    position: relative;
    display: inline-block;
    overflow: visible;
    z-index: 10;  /* Z-INDEX STACK: reel frame + symbols */
    /* Frame PNG provides the border — no CSS border here */
  }

  .game-frame {
    position: absolute;
    inset: -70px;
    width: calc(100% + 140px);
    height: calc(100% + 140px);
    object-fit: fill;
    pointer-events: none;
    z-index: 10;
    animation: frame-pulse 3s ease-in-out infinite;
  }

  @keyframes frame-pulse {
    0%, 100% { filter: drop-shadow(0 0 8px color-mix(in srgb, var(--theme-primary, #00ffff) 50%, transparent)); }
    50%       { filter: drop-shadow(0 0 20px color-mix(in srgb, var(--theme-primary, #00ffff) 90%, transparent)); }
  }

  /* ── Mobile responsive ─────────────────────────────────────────────────── */

  /* Tablet and below */
  @media (max-width: 768px) {
    .grid-wrapper {
      transform: scale(0.75);
      transform-origin: top center;
    }

    button {
      min-height: 44px;
      min-width: 44px;
    }
  }

  /* Phone portrait */
  @media (max-width: 480px) {
    .grid-wrapper {
      transform: scale(0.58);
      transform-origin: top center;
    }
  }

  /* Phone landscape — extra height needed */
  @media (max-height: 500px) and (orientation: landscape) {
    .grid-wrapper {
      transform: scale(0.55);
      transform-origin: top left;
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
