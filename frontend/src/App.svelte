<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import GameGrid       from './lib/components/GameGrid.svelte'
  import HudOverlay      from './lib/components/HudOverlay.svelte'
  import FeatureMenu     from './lib/components/FeatureMenu.svelte'
  import SceneGroup      from './lib/components/SceneGroup.svelte'
  import BonusInstrumentColumn from './lib/components/BonusInstrumentColumn.svelte'
  import FlameJets      from './lib/components/FlameJets.svelte'
  import LoadingScreen    from './lib/components/LoadingScreen.svelte'
  import IntroSplash      from './lib/components/IntroSplash.svelte'
  import WinCelebration      from './lib/components/WinCelebration.svelte'
  import WinBreakdown        from './lib/components/WinBreakdown.svelte'
  import MaxWinCelebration   from './lib/components/MaxWinCelebration.svelte'
  import PaytableModal       from './lib/components/PaytableModal.svelte'
  import WinBanner           from './lib/components/WinBanner.svelte'
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
    winMultiplier, winAmount, showPaytable, isWincap, canSpin,
    balance, locale,
  } from './lib/stores/gameStore'
  import { spin, initRGS } from './lib/services/rgsService'
  import type { SpinResult } from './lib/services/rgsService'
  import { playBGM, playWin } from './lib/services/soundService'
  import { isSocial } from './lib/stores/socialMode'
  // ── Overdrive Stage 2 (non-locked feature layer) ──────────────────────────
  import { get } from 'svelte/store'
  import { speedTier } from './lib/stores/speedMode'
  import BuyBonus from './lib/components/BuyBonus.svelte'
  import FreeSpinsPresentation from './lib/components/FreeSpinsPresentation.svelte'
  import { selectedBetMode, type BetMode } from './lib/stores/betMode'
  import { MODE_COST } from './lib/config/fsModes'
  import { reelMode, cycleReelMode } from './lib/stores/reelMode'
  import { lastRoundEvents } from './lib/stores/roundEvents'
  import { overdriveVisual } from './lib/stores/overdriveVisual'
  import { interpretRound, type PresentationScript, type RawEvent } from './lib/services/roundInterpreter'
  // Mock round provider is imported lazily and only in dev, so the sample data
  // is tree-shaken out of the production build (live RGS supplies real events).

  // RGS error strings (set in the locked rgsService) are real-money framed. In
  // social mode, scrub every gambling term so none reaches the stake.us player.
  // The locked RGS error code is not surfaced to this layer (gameStore exposes
  // only the message string), so this display-only transform is the available
  // mechanism. Of the eight RGS messages only ERR_VAL ("bet") carries a
  // prohibited term today; the buy/purchase/cost scrubs are defensive so a
  // future server string cannot bleed. Audit remediation, Task 6.
  const scrubCase = (match: string, upper: string, lower: string): string =>
    match[0] === match[0].toUpperCase() ? upper : lower
  $: errorDisplay = $errorMessage && $isSocial
    ? $errorMessage
        .replace(/\bInsufficient balance\b/gi, 'Insufficient coins')
        .replace(/\bbalance\b/gi, 'coins')
        .replace(/\bbets?\b/gi, (m) => scrubCase(m, 'Play', 'play'))
        .replace(/\bpurchases?\b/gi, (m) => scrubCase(m, 'Request', 'request'))
        .replace(/\bbuy\b/gi, (m) => scrubCase(m, 'Get', 'get'))
        .replace(/\bcosts?\b/gi, (m) => scrubCase(m, 'Amount', 'amount'))
    : $errorMessage

  let gridRef: GameGrid
  let buyBonusRef: BuyBonus

  // ── Intro splash — brand screens (Motion Polish v2) ───────────────────────
  // Shown once, right after loading finishes. Persistence (audit remediation):
  // localStorage so it does not re-show on every load in incognito/memory-
  // cleared contexts, falling back silently to sessionStorage then in-memory if
  // a store is unavailable or blocked (each guarded, so no console errors).
  const INTRO_KEY = 'fs_intro_seen_v1'
  let introSeenMemory = false
  function introSeen(): boolean {
    try { if (localStorage.getItem(INTRO_KEY)) return true } catch {}
    try { if (sessionStorage.getItem(INTRO_KEY)) return true } catch {}
    return introSeenMemory
  }
  function markIntroSeen(): void {
    introSeenMemory = true
    try { localStorage.setItem(INTRO_KEY, '1'); return } catch {}
    try { sessionStorage.setItem(INTRO_KEY, '1') } catch {}
  }
  let showIntroSplash = false
  let introHandledForLoad = false
  $: if (!$isLoading && !introHandledForLoad) {
    introHandledForLoad = true
    if (!introSeen()) showIntroSplash = true
  }
  function handleIntroContinue(): void {
    showIntroSplash = false
    markIntroSeen()
  }
  let showThemeSelector = false

  // ── Persistent hidden mount (Reel Feel v3, Task 5) ─────────────────────────
  // The first-ever Overdrive entry pays a one-time compile/style/decode cost for
  // the entry-overlay + BonusInstrumentColumn subtree (a single >100ms frame).
  // Mount that subtree once during loading, let it warm-paint every entry stage
  // at opacity 0, then KEEP IT MOUNTED for the whole session (visibility hidden
  // after the warm paint). Unlike the earlier warm-then-unmount, it is never
  // torn down, so the first real entry reuses the live, compiled, decoded
  // subtree and pays nothing (the 182.8ms first-entry frame is gone). It is
  // never visible (fixed, opacity 0, behind everything, visibility hidden after
  // the first paint), never audible (the subtree imports no audio), never
  // layout-affecting (out of flow), and never focusable (aria-hidden).
  const WARM_SCRIPT = {
    roundId: 0, triggered: true,
    baseSpin: {
      phase: 'base', fsIndex: null,
      board: Array.from({ length: 5 }, () => Array.from({ length: 4 }, () => 'L3')),
      wins: [], scatterCount: 3, meterBefore: 1, meterAfter: 1, retrigger: null,
      spinWinCentibets: 0, runningTotalCentibets: 0,
    },
    initialFreeSpins: 8, freeSpins: [], totalFreeSpinsAwarded: 8, finalMeter: 1,
    instantScatterCentibets: 0, baseGameWinCentibets: 0, freeGameWinCentibets: 0,
    totalWinCentibets: 0, isWincap: false,
  } as unknown as PresentationScript
  let warmMount = !isReplay
  let warmPainted = false
  onMount(() => {
    if (!warmMount) return
    // Let the entry sequence render every stage (flare -> gauge slam -> burst) at
    // opacity 0 so each stage's style/layout/paint/decode is warmed, then switch
    // it to visibility hidden (stops repaint) but LEAVE IT MOUNTED for the
    // session. This runs concurrently with loading (mock RGS + asset load,
    // longer than this window), so it adds no loading delay; the first real
    // Overdrive entry reuses the live compiled/decoded subtree.
    setTimeout(() => { warmPainted = true }, 520)
  })

  // ── Overdrive free-spins presentation state ───────────────────────────────
  let featureActive = false
  let featureScript: PresentationScript | null = null
  let featureResolve: (() => void) | null = null

  // ── Wincap flow ────────────────────────────────────────────────────────────
  // MaxWinCelebration shows immediately (reactive to $isWincap, unchanged). On
  // COLLECT, present the complete round sequence through the interpreter (the
  // "how it happened"), finishing on the total win summary, before autoplay
  // or the next spin can proceed.
  let wincapCollectResolve: (() => void) | null = null

  function waitForWincapCollect(): Promise<void> {
    return new Promise((resolve) => { wincapCollectResolve = resolve })
  }

  function handleWincapCollect(): void {
    isWincap.set(false)
    const r = wincapCollectResolve
    wincapCollectResolve = null
    if (r) r()
  }

  // Live bonus-instrument values — FreeSpinsPresentation drives these via
  // two-way binding below; BonusInstrumentColumn reads the same numbers it
  // shows in its own overlay (LAYOUT_SPEC bonus instrument column).
  let liveMeter = 1
  let liveSpinsRemaining = 0
  let liveRunningTotalCentibets = 0
  // Drives the bg crossfade + frame neon hue-shift (Overdrive transition,
  // Motion Polish v2) — false again once the 'end' phase starts, so the
  // reverse shift plays out behind the total win summary, not after it.
  let overdriveVisualActive = false
  // Mirror the local Overdrive visual flag into the shared store so the HUD and
  // paytable flip their accents from one source of truth.
  $: overdriveVisual.set(overdriveVisualActive)

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
      if (script.triggered) triggerShake() // screen shake on feature trigger
      featureResolve = resolve
    })
  }

  // ── Screen shake — feature trigger and 50x+ wins (Motion Polish v2) ───────
  let shakeActive = false
  let lastShakeWin = 0
  function triggerShake(durationMs = 420): void {
    shakeActive = true
    setTimeout(() => { shakeActive = false }, durationMs)
  }
  $: if ($winAmount > 0 && $winAmount !== lastShakeWin && $winMultiplier >= 50) {
    lastShakeWin = $winAmount
    triggerShake()
  }

  function onFeatureComplete(): void {
    featureActive = false
    featureScript = null
    const r = featureResolve
    featureResolve = null
    if (r) r()
  }

  // ── Buy: place a buy-tier spin and present the guaranteed feature ──────────
  // Generic over every buy tier in FS_MODES (today: bonus 100x, super 400x).
  // `mode` comes from whichever card the player ACTIVATEd in the FEATURES menu
  // (threaded through BuyBonus's confirm dispatch - see the on:buy wiring
  // below); it must never be assumed to be 'bonus'.
  async function handleBuy(mode: BetMode = 'bonus'): Promise<void> {
    if ($isSpinning || featureActive) return
    isSpinning.set(true)
    resetWin()
    const bet = $betAmount
    const cost = bet * (MODE_COST[mode] ?? 100)
    try {
      selectedBetMode.set(mode)
      lastRoundEvents.set(null)   // clear any prior round so mock serves a fresh round
      // NOTE: the locked rgsService.SpinRequest.mode type is 'base'|'bonus' only
      // - it is NOT what reaches the real RGS. play() reads get(selectedBetMode)
      // (set just above) for the actual wallet request, so every buy tier is
      // correctly communicated to the live RGS regardless of this literal. The
      // 'bonus' passed here only selects the mock branch (see rgsService's
      // _mockSpin, which does not itself branch on it either).
      const result: SpinResult = await spin({ betAmount: bet, mode: 'bonus' })

      // Live rgsService publishes the round events; in mock, serve a sample.
      // A dev-only ?mockCategory= override lets headless verification force a
      // specific curated round (e.g. the wincap sample) deterministically.
      // NOTE: sample_rounds.json currently only curates 'base'/'bonus' category
      // samples; cruise/antelite/super fall back to serveMockRound's generic
      // random board (still correctly priced/labelled, just not a curated
      // feature demo) until matching samples are authored - flagged as a
      // follow-up, not a regression (the real RGS path is unaffected).
      let servedTotalWin: number | null = null
      if (import.meta.env.DEV && !get(lastRoundEvents)) {
        const { serveMockRound, serveCategory } = await import('./lib/mock/roundProvider')
        const forcedCategory = new URLSearchParams(window.location.search).get('mockCategory')
        const round = forcedCategory
          ? await serveCategory(mode, forcedCategory)
          : await serveMockRound(mode)
        if (round) servedTotalWin = (round.payoutMultiplier / 100) * bet
      }
      const events = get(lastRoundEvents)
      const script = events ? scriptFromEvents(events) : null

      if (result.newBalance !== undefined) {
        // Live: RGS balance is authoritative (already reflects the mode's cost).
        recordSpinResult(result.totalWin, cost, result.newBalance, result.isWincap)
      } else {
        // Mock: deduct the mode's real cost and add the served round total.
        const win = servedTotalWin ?? result.totalWin
        recordSpinResult(win, cost, undefined, script?.isWincap ?? result.isWincap)
      }

      // Wincap flow: MaxWinCelebration is already showing (reactive to
      // $isWincap). Wait for COLLECT, then present the complete round
      // sequence, finishing on the total win summary. Otherwise, the normal
      // (non-capped) feature presentation plays immediately as before.
      if ($isWincap) {
        await waitForWincapCollect()
        if (script) await presentFeature(script)
      } else if (script?.triggered) {
        await presentFeature(script)
      }
      playWin(bet > 0 ? $winMultiplier : 0)
    } catch (err) {
      console.error('[Buy error]', err)
    } finally {
      selectedBetMode.set('base')
      isSpinning.set(false)
    }
  }

  // Background is static graded stills (AssetForge v2); no video refs needed.
  // Pending autoplay continuation, so it can be cancelled when autoplay stops.
  let autoSpinTimer: ReturnType<typeof setTimeout> | null = null

  // ── Scale-to-fit (LAYOUT_SPEC v3.1) ────────────────────────────────────────
  // The whole stage is laid out at the fixed 1280x720 design surface LAYOUT_SPEC
  // specifies and scaled together by the single stage factor S = min(vw/1280,
  // vh/720), so every element (frame, grid, HUD, instrument column, scene
  // group) shrinks or grows in lockstep and never overflows or clips at small
  // popout sizes (for example Popout S, 400x225).
  const STAGE_W = 1280
  const STAGE_H = 720
  function computeS(): number {
    if (typeof window === 'undefined') return 1
    return Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H)
  }
  let S = computeS()
  function handleResize(): void { S = computeS() }

  onMount(async () => {
    // Skip all RGS initialisation in replay mode — ReplayMode handles its own flow
    if (isReplay) return

    const params  = new URLSearchParams(window.location.search)
    const token   = params.get('session') ?? 'dev-mock-token'
    const gameId  = 'future_spinner'

    await initRGS(gameId, token)
    // isLoading is cleared inside initRGS's finally block
    playBGM()

    // Background is now static graded stills (video retired); the Overdrive
    // variant crossfades via the .bg-still.overdrive.active CSS class.

    // Preload the Overdrive gauge images so they're already decoded before
    // the transition fires — mounting them cold (large PNGs, decoded on
    // first paint) was the source of an occasional dropped frame right at
    // feature trigger (Motion Polish v2 fps gate).
    for (const rel of ['ui/gauge_face.png', 'ui/gauge_needle.png']) {
      const img = new Image()
      img.src = `${$themeAssets.assetBase}/${rel}`
    }

    // Dev-only mock harness: warm the curated sample pool during startup
    // idle time (see roundProvider.preloadSamples), not on the first buy.
    if (import.meta.env.DEV) {
      import('./lib/mock/roundProvider').then((m) => m.preloadSamples()).catch(() => {})
    }
  })

  onDestroy(() => {
    if (autoSpinTimer) clearTimeout(autoSpinTimer)
  })

  // ── DEV-ONLY forced-win demo (Symbol Life capture harness) ────────────────
  // Drives a scripted winning board through the public GameGrid API so the real
  // win burst fires (dev has no RGS), looping every 5s so it is easy to film.
  // NEVER affects production: gated by BOTH import.meta.env.DEV AND a
  // ?windemo=<symbol> URL param, so a normal build (DEV false) or a normal URL
  // (no param) skips it entirely and the block tree-shakes out of the bundle.
  let winDemoInterval: ReturnType<typeof setInterval> | null = null
  onMount(() => {
    if (!import.meta.env.DEV) return
    const demoParam = new URLSearchParams(window.location.search).get('windemo')
    if (!demoParam) return
    const sym = demoParam.toUpperCase()
    // A board with the demo symbol on reels 0, 1, 2 (row 1) so a 3-of-a-kind
    // ways win lights those three reels; the rest is quiet filler.
    const demoBoard = [
      ['L1', sym, 'L2', 'L3'],
      ['M1', sym, 'L2', 'L3'],
      ['M2', sym, 'L1', 'L3'],
      ['L1', 'M3', 'L2', 'L3'],
      ['L2', 'M1', 'L3', 'H2'],
    ]
    const fire = async () => {
      if (!gridRef) return
      resetWin()
      activeWins.set([])
      await gridRef.animateSpin(demoBoard)
      boardSymbols.set(demoBoard)
      activeWins.set([{ symbol: sym, kind: 3, ways: 6, payout: 9 }])
    }
    // Start after loading/assets settle, then loop for easy capture.
    const startTimer = setTimeout(() => {
      fire()
      winDemoInterval = setInterval(fire, 5000)
    }, 1600)
    return () => { clearTimeout(startTimer); if (winDemoInterval) clearInterval(winDemoInterval) }
  })

  // Q1 fix: cancel a pending autoplay continuation the moment autoplay stops,
  // so pressing STOP during the inter-spin delay never fires one more bet.
  $: if (!$isAutoPlay && autoSpinTimer !== null) {
    clearTimeout(autoSpinTimer)
    autoSpinTimer = null
  }

  // Schedule the next autoplay spin. The id is tracked so it can be cancelled.
  // Autoplay honours the active speed tier (Motion Polish v2): the inter-spin
  // pause scales down the same way reel timing does.
  function scheduleAutoSpin(delayMs: number): void {
    const tier = get(speedTier)
    const factor = tier === 'super' ? 0.16 : tier === 'turbo' ? 0.5 : 1
    autoSpinTimer = setTimeout(() => {
      autoSpinTimer = null
      handleSpin()
    }, delayMs * factor)
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
      if (result.isWincap) {
        // Dwell on the winning hit: the board's win burst is already playing
        // from activeWins, so hold on it (a max win is the one moment to linger)
        // before recordSpinResult flips isWincap and the celebration covers the
        // screen. Deliberately NOT turbo-shortened.
        playWin(bet > 0 ? result.totalWin / bet : 0)
        await new Promise((r) => setTimeout(r, 2600))
      }
      recordSpinResult(result.totalWin, bet, result.newBalance, result.isWincap)
      if (!result.isWincap) playWin(bet > 0 ? result.totalWin / bet : 0)

      // QA soak harness telemetry (dev-only): the raw mock "book" data for
      // this round, plus the balance the store actually landed on, so the
      // harness can independently recompute totals and running balance in
      // integer micros and assert zero drift against what's presented.
      if (import.meta.env.DEV) {
        const w = window as unknown as { __qaLog?: unknown[] }
        w.__qaLog = w.__qaLog ?? []
        w.__qaLog.push({
          bet,
          totalWin:     result.totalWin,
          winEvents:    result.winEvents,
          scatterEvent: result.scatterEvent,
          balanceAfter: get(balance),
        })
      }

      // Live base rounds that trigger Overdrive publish their full events; play
      // the free-spins overlay before autoplay continues. (Mock base spins do
      // not populate this, so normal mock base play is unchanged.) Wincap flow:
      // MaxWinCelebration is already showing (reactive to $isWincap) — wait for
      // COLLECT, then present the complete round sequence through the
      // interpreter, finishing on the total win summary.
      const roundEvents = get(lastRoundEvents)
      const script = roundEvents ? scriptFromEvents(roundEvents) : null
      if ($isWincap) {
        await waitForWincapCollect()
        if (script) await presentFeature(script)
      } else if (script?.triggered) {
        await presentFeature(script)
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
    if ($showPaytable || showThemeSelector || $isWincap || featureActive || showIntroSplash) return

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
    <!-- Static graded backgrounds (AssetForge v2). The animated loop video is
         retired from the served build. The Overdrive variant crossfades in
         while the feature plays. -->
    <div class="bg-still-container">
      <img
        class="bg-still"
        src="assets/themes/future-spinner/backgrounds/bg_base.jpg"
        alt=""
        aria-hidden="true"
      />
      <img
        class="bg-still overdrive"
        class:active={overdriveVisualActive}
        src="assets/themes/future-spinner/backgrounds/bg_overdrive.jpg"
        alt=""
        aria-hidden="true"
      />
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
<!-- Stage clips the viewport and centres the fixed 1280x720 design surface,
     scaled by S so it never overflows or clips at small popout sizes. -->
<div class="game-stage">
<main
  class="game-wrapper"
  class:shake={shakeActive}
  style="
    --theme-primary: {$activeTheme.palette.primary};
    --theme-secondary: {$activeTheme.palette.secondary};
    --theme-bg: {$activeTheme.palette.background};
    --S: {S};
  "
>
  <!-- Max win overlay — requires explicit COLLECT click; sits below LoadingScreen (z200) -->
  <MaxWinCelebration
    show={$isWincap}
    on:collect={handleWincapCollect}
  />

  {#if $isLoading}
    <LoadingScreen />
  {/if}

  <!-- Persistent hidden mount (Task 5): the Overdrive entry subtree is mounted
       once, warm-painted, then kept mounted (visibility hidden) for the session
       so the first real entry pays no >100ms frame. -->
  {#if warmMount && $activeTheme.id === 'future-spinner'}
    <div class="warm-mount" class:painted={warmPainted} aria-hidden="true" inert>
      <BonusInstrumentColumn multiplier={1} spinsRemaining={8} runningTotalCentibets={0} />
      <FreeSpinsPresentation script={WARM_SCRIPT} active={true} />
    </div>
  {/if}

  {#if showIntroSplash}
    <IntroSplash on:continue={handleIntroContinue} />
  {/if}

  <!-- LOGO — top centre, 380 wide, y 18 (z70) -->
  <div class="logo-box">
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

  {#if $errorMessage}
    <div class="error-banner">{errorDisplay}</div>
  {/if}

  <!-- SCENE GROUP — left, set further back (z8), future-spinner only -->
  {#if $activeTheme.id === 'future-spinner'}
    <SceneGroup />
  {/if}

  <!-- FRAME — 640x468 at (320,84), z10. Neon hue-shifts during Overdrive
       (Motion Polish v2), reversed once overdriveVisualActive clears. -->
  {#if $themeAssets.frame}
    <img
      src="{$themeAssets.frame}"
      class="game-frame"
      class:overdrive-active={overdriveVisualActive}
      alt=""
      aria-hidden="true"
      on:error={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none'
      }}
    />
  {/if}

  <!-- OVERDRIVE FLAME JETS — 8 frame-edge jets (v3.4), ignite on Overdrive -->
  {#if $activeTheme.id === 'future-spinner'}
    <FlameJets active={overdriveVisualActive} />
  {/if}

  <!-- GRID — 522x349, centred inside the frame, z20 -->
  <div class="grid-slot">
    <div class="grid-scale">
      <GameGrid bind:this={gridRef} />
      <!-- Suppress standard celebration while the max-win overlay is active -->
      <WinCelebration winMultiplier={$isWincap ? 0 : $winMultiplier} />
      <!-- Ways breakdown — cycles group by group after the win burst settles -->
      <WinBreakdown />
      <!-- Overdrive free-spins presentation overlay (feature rounds only) -->
      <FreeSpinsPresentation
        script={featureScript}
        active={featureActive}
        bind:displayMeter={liveMeter}
        bind:spinsRemaining={liveSpinsRemaining}
        bind:runningTotalCentibets={liveRunningTotalCentibets}
        bind:overdriveVisualActive
        on:complete={onFeatureComplete}
      />
    </div>
  </div>

  <!-- BANNER — compact 380x96 centred over the grid at (450,262), z100 -->
  <WinBanner />

  <!-- FEATURES — unified bet-modes menu, right of the frame (replaces the old
       single FeatureButton); future-spinner only, hidden during Overdrive so
       the bonus instrument column owns that zone. A live buy ACTIVATE opens the
       existing BuyBonus confirm modal (same confirm-protected flow the old
       FeatureButton used), passing THROUGH which buy tier was clicked (bug fix:
       every tier used to fall through to the hardcoded 100x bonus buy) so the
       modal shows the correct price and, on confirm, dispatches THAT mode to
       handleBuy. -->
  {#if $activeTheme.id === 'future-spinner' && !featureActive}
    <FeatureMenu on:buy={(e) => buyBonusRef?.openConfirm(e.detail)} />
  {/if}

  <!-- BONUS INSTRUMENT COLUMN — Overdrive only -->
  {#if featureActive && $activeTheme.id === 'future-spinner'}
    <BonusInstrumentColumn
      multiplier={liveMeter}
      spinsRemaining={liveSpinsRemaining}
      runningTotalCentibets={liveRunningTotalCentibets}
    />
  {/if}

  <!-- HUD OVERLAY — generic panel + SPIN + AUTOPLAY, z60 -->
  <HudOverlay on:spin={handleSpin} on:slam={() => gridRef?.slamStop()} />

  <!-- Bonus Buy — modal/confirm logic only; its own trigger button is
       replaced by FeatureButton above (showTrigger=false). Hidden entirely
       where the jurisdiction disables feature buys (handled inside). Dispatches
       the CONFIRMED buy tier (e.detail), not always 'bonus'. -->
  <BuyBonus bind:this={buyBonusRef} showTrigger={false} on:buy={(e) => handleBuy(e.detail)} />

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
    <!-- Reel choreography toggle — dev-only eye test (strip default / drop). -->
    <button
      class="util-btn reel-mode-btn"
      on:click={cycleReelMode}
      aria-label="Toggle reel mode"
      title="Reel mode: {$reelMode} (click to toggle strip/drop)"
      data-testid="reel-mode-toggle"
    >{$reelMode === 'drop' ? '⬇' : '⇅'}<span class="reel-mode-label">{$reelMode}</span></button>
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

  /* Viewport-locked stage: clips overflow and centres the scaled 1280x720
     design surface so the document never grows past the viewport (no
     scrollbars at any size). */
  /* Warm hidden mount (Task 1): renders once to warm styles/decode, then hides.
     opacity 0 (still painted, so it warms), out of flow, behind everything. */
  .warm-mount {
    position: fixed;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    z-index: -1;
  }
  /* Force the whole warm subtree non-interactive so its dialog backdrop never
     intercepts pointer events during the 0-520ms paint window (a child would
     otherwise re-enable pointer-events over the container's none). */
  .warm-mount :global(*) { pointer-events: none !important; }
  .warm-mount.painted { visibility: hidden; }

  .game-stage {
    position: fixed;
    inset: 0;
    z-index: 2;  /* above video layer */
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  /* LAYOUT_SPEC v3.1 stage: fixed 1280x720 design surface, every child
     absolutely positioned per spec, the whole thing scaled by S (set in the
     script and updated on resize) so it shrinks or grows together. */
  .game-wrapper {
    position: relative;
    width: 1280px;
    height: 720px;
    flex: 0 0 auto;
    transform: scale(var(--S, 1));
    transform-origin: center center;
    /* Subtle dark overlay so grid and UI stay readable over the background */
    background: linear-gradient(
      to bottom,
      rgba(6,6,15,0.55) 0%,
      rgba(6,6,15,0.35) 40%,
      rgba(6,6,15,0.65) 100%
    );
    transition: background 0.6s ease;
  }

  /* Screen shake — feature trigger and 50x+ wins (Motion Polish v2). The
     keyframe re-applies scale(S) at every step so the stage stays correctly
     sized while shaking (the base rule's transform is fully replaced while
     the animation runs). */
  @keyframes screen-shake {
    0%, 100% { transform: scale(var(--S, 1)) translate(0, 0); }
    20%      { transform: scale(var(--S, 1)) translate(-7px, 5px); }
    40%      { transform: scale(var(--S, 1)) translate(7px, -5px); }
    60%      { transform: scale(var(--S, 1)) translate(-5px, 4px); }
    80%      { transform: scale(var(--S, 1)) translate(5px, -3px); }
  }
  .game-wrapper.shake { animation: screen-shake 0.42s ease-in-out; }

  @media (prefers-reduced-motion: reduce) {
    .game-wrapper.shake { animation: none; }
  }

  /* ── Logo — top centre, 380 wide, y 18, z70 ─────────────────────────────── */
  .logo-box {
    position: absolute;
    left: 450px;
    top: 18px;
    width: 380px;
    height: 60px;
    z-index: 70;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  /* Text hidden by default — only shown by JS when img fails to load */
  .logo-text {
    font-family: 'Courier New', monospace;
    font-size: 1.6rem;
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
    max-height: 60px;
    max-width: 380px;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 2px 12px rgba(0,0,0,0.9));
  }

  /* Between the grid (bottom 492.5) and the HUD panel (top 560) */
  .error-banner {
    position: absolute;
    left: 340px;
    top: 498px;
    width: 600px;
    height: 54px;
    z-index: 90;
    background: rgba(255, 50, 50, 0.15);
    border: 1px solid rgba(255, 50, 50, 0.4);
    color: #ff8080;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 1rem;
    font-size: 0.85rem;
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

  /* Static graded stills (future-spinner); Overdrive variant crossfades over base */
  .bg-still-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .bg-still {
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

  .bg-still.overdrive {
    opacity: 0;
    transition: opacity 0.6s ease;
  }

  .bg-still.overdrive.active {
    opacity: 0.92;
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

  /* ── Reel-mode toggle (dev-only) — pill just left of the theme button ────── */
  .util-btn.reel-mode-btn {
    position: fixed;
    bottom: 1rem;
    right: 3.6rem;
    z-index: 50;
    background: rgba(0,0,0,0.55);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 14px;
    height: 28px;
    padding: 0 0.55rem;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: #fff;
    transition: background 0.15s, border-color 0.15s;
  }
  .util-btn.reel-mode-btn:hover {
    background: color-mix(in srgb, var(--theme-primary, #00ffff) 12%, transparent);
    border-color: color-mix(in srgb, var(--theme-primary, #00ffff) 45%, transparent);
  }
  .reel-mode-label {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.85;
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

  /* ── Frame — 640x468 at (320,84), z10 ───────────────────────────────────── */
  .game-frame {
    position: absolute;
    left: 320px;
    top: 84px;
    width: 640px;
    height: 468px;
    object-fit: fill;
    pointer-events: none;
    z-index: 10;
    animation: frame-pulse 3s ease-in-out infinite;
  }

  @keyframes frame-pulse {
    0%, 100% { filter: drop-shadow(0 0 8px color-mix(in srgb, var(--theme-primary, #00ffff) 50%, transparent)); }
    50%       { filter: drop-shadow(0 0 20px color-mix(in srgb, var(--theme-primary, #00ffff) 90%, transparent)); }
  }

  /* Overdrive transition — frame neon shifts hue while active (Motion Polish
     v2), reversing automatically when the class clears (overdriveVisualActive
     goes false behind the total win summary, not after it). A distinct
     animation name (not a transition) avoids fighting frame-pulse for the
     filter property. */
  .game-frame.overdrive-active {
    animation: frame-pulse-overdrive 3s ease-in-out infinite;
  }
  @keyframes frame-pulse-overdrive {
    0%, 100% { filter: hue-rotate(280deg) saturate(1.4) drop-shadow(0 0 10px color-mix(in srgb, var(--theme-secondary, #ff00ff) 60%, transparent)); }
    50%       { filter: hue-rotate(280deg) saturate(1.4) drop-shadow(0 0 24px color-mix(in srgb, var(--theme-secondary, #ff00ff) 95%, transparent)); }
  }

  @media (prefers-reduced-motion: reduce) {
    .game-frame, .game-frame.overdrive-active { animation: none; }
  }

  /* ── Grid — 522x349, centred inside the frame, z20 ──────────────────────── */
  .grid-slot {
    position: absolute;
    left: 379px;
    top: 143.5px;
    width: 522px;
    height: 349px;
    z-index: 20;
    overflow: visible;
  }

  /* GameGrid's native canvas is 616x412 — scale it down uniformly to the
     522x349 spec box rather than resizing its internals. */
  .grid-scale {
    position: relative;
    width: 616px;
    height: 412px;
    transform: scale(0.8474025974);
    transform-origin: top left;
  }

  @media (max-width: 768px) {
    button {
      min-height: 44px;
      min-width: 44px;
    }
  }
</style>
