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
  import WinBanner           from './lib/components/WinBanner.svelte'
  import ThemeSelector       from './lib/components/ThemeSelector.svelte'
  import { activeTheme, themeAssets, switchTheme } from './lib/stores/themeStore'

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

  onMount(async () => {
    // Video background fallback: if animated loop doesn't load in 2s, swap to static PNG
    const bgVideo = document.getElementById('bg-video') as HTMLVideoElement | null
    if (bgVideo) {
      const fallbackTimer = setTimeout(() => {
        if (bgVideo.readyState < 3) {
          bgVideo.style.display = 'none'
          const fallback = document.createElement('img')
          fallback.src = 'assets/videos/bg_master_fallback.png'
          fallback.className = 'bg-media'
          fallback.setAttribute('aria-hidden', 'true')
          bgVideo.parentElement?.appendChild(fallback)
        }
      }, 2000)
      bgVideo.addEventListener('canplay', () => clearTimeout(fallbackTimer), { once: true })
    }

    const params  = new URLSearchParams(window.location.search)
    const token   = params.get('session') ?? 'dev-mock-token'
    const gameId  = 'future_spinner'

    await initRGS(gameId, token)
    // isLoading is cleared inside initRGS's finally block
    playBGM()
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
  {#if $activeTheme.id !== 'future-spinner'}
    <!-- Remove cyberpunk body PNG for non-FS themes so it doesn't bleed through -->
    <style>body { background-image: none !important; }</style>
  {/if}
</svelte:head>

<!-- ── Background layer ─────────────────────────────────────────────────── -->
<div class="bg-layer">
  {#if $activeTheme.id === 'future-spinner'}
    <!-- Animated video background — only mounted for future-spinner; 2s fallback in onMount -->
    <video
      class="bg-media"
      autoplay
      loop
      muted
      playsinline
      aria-hidden="true"
      id="bg-video"
    >
      <source src="assets/videos/bg_animated_loop.mp4" type="video/mp4" />
    </video>
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

  .bg-media {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
    display: block;
  }

  /* Video (future-spinner): semi-transparent — body PNG shows through for depth */
  video.bg-media { opacity: 0.5; }

  /* Static image (all other themes): high opacity — body PNG must not bleed through */
  img.bg-media { opacity: 0.92; }

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
    /* Frame PNG provides the border — no CSS border here */
  }

  .game-frame {
    position: absolute;
    top: -80px;
    left: -80px;
    right: -80px;
    bottom: -40px;    /* Less extension at bottom — avoids covering panels */
    width: calc(100% + 160px);
    height: calc(100% + 120px);  /* top 80 + bottom 40 */
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
