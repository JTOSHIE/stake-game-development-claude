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
  import { DEFAULT_THEME_ID } from './lib/config/themes'

  // ── Submission scope ────────────────────────────────────────────────────────
  // Ship only the finished, validated Future Spinner experience. The alternate
  // themes (trap-lane, oil-and-fire, beautiful-game) are unvalidated visual
  // skins that are not part of the approved maths/PAR submission and have minor
  // defects (for example missing themed background music), so the theme selector
  // is dev-only (gated in the markup) and the default theme is forced in the
  // production build. Reversible: remove this block and the DEV guards on the
  // theme button and selector to re-enable theme switching.
  if (!import.meta.env.DEV) {
    switchTheme(DEFAULT_THEME_ID)
  }

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
    winMultiplier, showPaytable, isWincap, canSpin,
  } from './lib/stores/gameStore'
  import { spin, initRGS } from './lib/services/rgsService'
  import type { SpinResult } from './lib/services/rgsService'
  import { playBGM, playWin } from './lib/services/soundService'
  import { isSocial } from './lib/stores/socialMode'
  // ── Overdrive Stage 2 (non-locked feature layer) ──────────────────────────
  import { get } from 'svelte/store'
  import BuyBonus from './lib/components/BuyBonus.svelte'
  import FreeSpinsPresentation from './lib/components/FreeSpinsPresentation.svelte'
  import { selectedBetMode } from './lib/stores/betMode'
  import { lastRoundEvents } from './lib/stores/roundEvents'
  import { interpretRound, type PresentationScript, type RawEvent } from './lib/services/roundInterpreter'
  // Mock round provider is imported lazily and only in dev, so the sample data
  // is tree-shaken out of the production build (live RGS supplies real events).

  // RGS error strings (set in the locked rgsService) are real-money framed
  // ("bet", "balance"). In social mode, remap those nouns so no gambling term
  // reaches the player. This is a display-only transform; the locked service
  // is untouched.
  $: errorDisplay = $errorMessage && $isSocial
    ? $errorMessage
        .replace(/\bInsufficient balance\b/gi, 'Insufficient coins')
        .replace(/\bbalance\b/gi, 'coins')
        .replace(/\bbets?\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Play' : 'play'))
    : $errorMessage

  let gridRef: GameGrid
  let showThemeSelector = false

  // ── Overdrive free-spins presentation state ───────────────────────────────
  let featureActive = false
  let featureScript: PresentationScript | null = null
  let featureResolve: (() => void) | null = null

  /** Build a presentation script from a raw event list (live) or a served round. */
  function scriptFromEvents(events: RawEvent[]): PresentationScript {
    const finalWin = [...events].reverse().find((e) => e.type === 'finalWin')
    const payout = Number((finalWin?.amount as number) ?? 0)
    return interpretRound({ id: 0, payoutMultiplier: payout, events })
  }

  /** Play the free-spins overlay to completion. Resolves when the player has
   *  seen the whole round. Autoplay treats the entire bonus as one round. */
  function presentFeature(script: PresentationScript): Promise<void> {
    return new Promise((resolve) => {
      featureScript = script
      featureActive = true
      featureResolve = resolve
    })
  }

  function onFeatureComplete(): void {
    featureActive = false
    featureScript = null
    const r = featureResolve
    featureResolve = null
    if (r) r()
  }

  // ── Bonus Buy: place a bonus-mode spin and present the guaranteed feature ──
  async function handleBuy(): Promise<void> {
    if ($isSpinning || featureActive) return
    isSpinning.set(true)
    resetWin()
    const bet = $betAmount
    const cost = bet * 100
    try {
      selectedBetMode.set('bonus')
      const result: SpinResult = await spin({ betAmount: bet, mode: 'bonus' })

      // Live rgsService publishes the round events; in mock, serve a sample.
      let servedTotalWin: number | null = null
      if (import.meta.env.DEV && !get(lastRoundEvents)) {
        const { serveMockRound } = await import('./lib/mock/roundProvider')
        const round = await serveMockRound('bonus')
        if (round) servedTotalWin = (round.payoutMultiplier / 100) * bet
      }
      const events = get(lastRoundEvents)
      const script = events ? scriptFromEvents(events) : null

      if (result.newBalance !== undefined) {
        // Live: RGS balance is authoritative (already reflects the 100x cost).
        recordSpinResult(result.totalWin, cost, result.newBalance, result.isWincap)
      } else {
        // Mock: deduct the full 100x cost and add the served round total.
        const win = servedTotalWin ?? result.totalWin
        recordSpinResult(win, cost, undefined, script?.isWincap ?? result.isWincap)
      }

      if (script?.triggered) await presentFeature(script)
      playWin(bet > 0 ? $winMultiplier : 0)
    } catch (err) {
      console.error('[Buy error]', err)
    } finally {
      selectedBetMode.set('base')
      isSpinning.set(false)
    }
  }

  let bgVideo1: HTMLVideoElement
  let bgVideo2: HTMLVideoElement
  let bgVideo1Active = true
  let crossfadeInterval: ReturnType<typeof setInterval> | null = null
  // Pending autoplay continuation, so it can be cancelled when autoplay stops.
  let autoSpinTimer: ReturnType<typeof setTimeout> | null = null

  // ── Scale-to-fit ───────────────────────────────────────────────────────────
  // The game is laid out at a fixed design size and scaled to fit the viewport,
  // so the whole UI (grid, logo, HUD, controls) shrinks together and never
  // overflows or clips at small popout sizes (for example Popout S, 400x225).
  const DESIGN_W = 720
  const DESIGN_H = 760
  function fitFor(): number {
    if (typeof window === 'undefined') return 1
    // Never upscale beyond the design size (keeps the canvas crisp on large screens).
    return Math.min(1, window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H)
  }
  let fitScale = fitFor()
  function handleResize(): void { fitScale = fitFor() }

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
    if (autoSpinTimer) clearTimeout(autoSpinTimer)
  })

  // Q1 fix: cancel a pending autoplay continuation the moment autoplay stops,
  // so pressing STOP during the inter-spin delay never fires one more bet.
  $: if (!$isAutoPlay && autoSpinTimer !== null) {
    clearTimeout(autoSpinTimer)
    autoSpinTimer = null
  }

  // Schedule the next autoplay spin. The id is tracked so it can be cancelled.
  function scheduleAutoSpin(delayMs: number): void {
    autoSpinTimer = setTimeout(() => {
      autoSpinTimer = null
      handleSpin()
    }, delayMs)
  }

  async function handleSpin() {
    if ($isSpinning || featureActive) return
    isSpinning.set(true)   // disable spin button immediately, before async work begins
    resetWin()
    selectedBetMode.set('base')
    lastRoundEvents.set(null)   // clear any prior round before this spin publishes

    const bet  = $betAmount

    try {
      const result: SpinResult = await spin({ betAmount: bet, mode: 'base' })

      if (gridRef) await gridRef.animateSpin(result.board)

      boardSymbols.set(result.board)
      activeWins.set(result.winEvents)
      scatterCount.set(result.scatterEvent?.count ?? 0)
      recordSpinResult(result.totalWin, bet, result.newBalance, result.isWincap)
      playWin(bet > 0 ? result.totalWin / bet : 0)

      // Live base rounds that trigger Overdrive publish their full events; play
      // the free-spins overlay before autoplay continues. (Mock base spins do
      // not populate this, so normal mock base play is unchanged.)
      const roundEvents = get(lastRoundEvents)
      if (roundEvents) {
        const script = scriptFromEvents(roundEvents)
        if (script.triggered) await presentFeature(script)
      }

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
            scheduleAutoSpin(6000)   // Mega win — pause 6 seconds
          } else if (multiplier >= 10) {
            scheduleAutoSpin(3500)   // Big win — pause 3.5 seconds
          } else if (multiplier > 0) {
            scheduleAutoSpin(1500)   // Small/medium win — pause 1.5 seconds
          } else {
            scheduleAutoSpin(800)    // Dead spin — continue at normal pace
          }
        }
      }
    } catch (err) {
      console.error('[Spin error]', err)
    } finally {
      // B1 fix: always release the spin lock, even if animateSpin early-returns
      // (assets not ready) or throws, so the game can never deadlock after a spin.
      isSpinning.set(false)
    }
  }

  // Spacebar triggers the same action as the spin button (Stake Engine
  // requirement). Reuses handleSpin and the canSpin guard so it behaves
  // identically to clicking spin.
  function handleKeydown(e: KeyboardEvent): void {
    // Normal-play branch only — never drive a spin in replay mode.
    if (isReplay) return
    if (e.code !== 'Space' && e.key !== ' ') return

    // Let space behave normally while typing in a field.
    const el = document.activeElement as HTMLElement | null
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
      return
    }

    // Let space behave normally (for example scrolling the modal) while a
    // modal or overlay is open.
    if ($showPaytable || showThemeSelector || $isWincap || featureActive) return

    // From here we own the spacebar: stop the page from scrolling.
    e.preventDefault()

    // Respect the same guard the spin button uses.
    if ($canSpin) handleSpin()
  }

</script>

<svelte:head>
  <title>{$activeTheme.name} — We Roll Spinners</title>
</svelte:head>

<!-- Spacebar to spin. The handler is inert in replay mode and while a modal
     is open, so it only acts during normal play. -->
<svelte:window on:keydown={handleKeydown} on:resize={handleResize} />

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
<!-- Stage clips the viewport and centres the fixed-size game, which is scaled
     to fit so it never overflows at small popout sizes. -->
<div class="game-stage">
<main
  class="game-wrapper"
  style="
    --theme-primary: {$activeTheme.palette.primary};
    --theme-secondary: {$activeTheme.palette.secondary};
    --theme-bg: {$activeTheme.palette.background};
    --fit-scale: {fitScale};
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
    <div class="error-banner">{errorDisplay}</div>
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
      <!-- Overdrive free-spins presentation overlay (feature rounds only) -->
      <FreeSpinsPresentation
        script={featureScript}
        active={featureActive}
        on:complete={onFeatureComplete}
      />
    </div>
  </section>

  <footer class="hud">
    <BalanceDisplay />
    <WinDisplay />
  </footer>

  <ControlBar on:spin={handleSpin} />

  <!-- Bonus Buy — hidden entirely where the jurisdiction disables feature buys.
       Temporary CSS treatment; final art in AssetForge v2. -->
  <div class="buy-bonus-row">
    <BuyBonus on:buy={handleBuy} />
  </div>

  <!-- Theme selector — dev-only. Hidden in the production submission build so
       only the validated Future Spinner experience ships (see the scope note
       in the script). Reversible: remove these import.meta.env.DEV guards. -->
  {#if import.meta.env.DEV}
    <button
      class="util-btn theme-btn"
      on:click={() => showThemeSelector = true}
      aria-label="Change theme"
      title="Change theme"
    >🎨</button>
  {/if}

  {#if $showPaytable}
    <PaytableModal />
  {/if}

  {#if import.meta.env.DEV && showThemeSelector}
    <ThemeSelector on:close={() => showThemeSelector = false} />
  {/if}
</main>
</div>
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

  /* Viewport-locked stage: clips overflow and centres the scaled game so the
     document never grows past the viewport (no scrollbars at any size). */
  .game-stage {
    position: fixed;
    inset: 0;
    z-index: 2;  /* above video layer */
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .game-wrapper {
    display: flex;
    flex-direction: column;
    /* Fixed design size, scaled to fit the viewport via --fit-scale (set in the
       script and updated on resize). transform-origin centre keeps it centred
       within the stage; the background layer fills any letterbox margin. */
    width: 720px;
    height: 760px;
    flex: 0 0 auto;
    transform: scale(var(--fit-scale, 1));
    transform-origin: center center;
    position: relative;
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
  /* The whole game is scaled to fit the viewport via --fit-scale (see the
     game-stage and game-wrapper rules plus handleResize in the script), so no
     per-breakpoint grid scaling is needed. The touch-target minimum below
     applies before scaling. */
  @media (max-width: 768px) {
    button {
      min-height: 44px;
      min-width: 44px;
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
