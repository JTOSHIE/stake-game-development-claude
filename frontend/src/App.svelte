<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import GameGrid       from './lib/components/GameGrid.svelte'
  import HudOverlay      from './lib/components/HudOverlay.svelte'
  import FeatureMenu     from './lib/components/FeatureMenu.svelte'
  import SceneGroup      from './lib/components/SceneGroup.svelte'
  import BonusInstrumentColumn from './lib/components/BonusInstrumentColumn.svelte'
  import FlameJets      from './lib/components/FlameJets.svelte'
  import LoadingScreen    from './lib/components/LoadingScreen.svelte'
  import HeroSplash       from './lib/components/HeroSplash.svelte'
  import RainLayer        from './lib/components/RainLayer.svelte'
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
  import { playBGM, playWin, warmUpAudio } from './lib/services/soundService'
  import { isSocial } from './lib/stores/socialMode'
  // ── Overdrive Stage 2 (non-locked feature layer) ──────────────────────────
  import { get } from 'svelte/store'
  import { speedTier } from './lib/stores/speedMode'
  import BuyBonus from './lib/components/BuyBonus.svelte'
  import FreeSpinsPresentation from './lib/components/FreeSpinsPresentation.svelte'
  import { selectedBetMode, standingMode, type BetMode } from './lib/stores/betMode'
  import { MODE_COST } from './lib/config/fsModes'
  import { reelMode, cycleReelMode } from './lib/stores/reelMode'
  import { lastRoundEvents } from './lib/stores/roundEvents'
  import { overdriveVisual } from './lib/stores/overdriveVisual'
  import {
    interpretRound, cellMultipliersFromEvents,
    type PresentationScript, type RawEvent,
  } from './lib/services/roundInterpreter'
  import { cellMultipliers } from './lib/stores/cellMultipliers'
  import { currencyCode } from './lib/stores/gameStore'
  import { CURRENCY_SCALE } from './lib/utils/currency'
  import { configureTelemetry, setTelemetrySink, bufferSink, track, winTier, type TelemetryEvent } from './lib/services/telemetry'
  import { rgRecordSpin, autoplayShouldStop, rgSpinDelay } from './lib/stores/responsibleGambling'
  import SessionPanel from './lib/components/SessionPanel.svelte'
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

  // Telemetry: lazy session envelope + a dev buffer sink (window.__telemetry).
  // Production registers a vendor sink instead; no-op until one is set. Never
  // touches the outcome path (see docs/TELEMETRY_TAXONOMY.md) - it only observes.
  configureTelemetry(() => ({
    mode: get(selectedBetMode),
    betMicros: Math.round(get(betAmount) * CURRENCY_SCALE),
    currency: get(currencyCode) || 'USD',
    social: get(isSocial),
  }))
  if (import.meta.env.DEV) {
    const buf: TelemetryEvent[] = []
    ;(window as unknown as { __telemetry: unknown[] }).__telemetry = buf
    setTelemetrySink(bufferSink(buf))
  }

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
  // HeroSplash (ANIMATION UPLIFT PASS, 2026-07-16, item 1): the animated
  // brand intro, shown every load (unlike the once-per-session rules
  // modal below) since it's the "sign lighting up" moment, not something a
  // returning-this-session player needs to skip past repeatedly - it's
  // instantly dismissible on first gesture regardless. Only rendered for
  // the future-spinner theme, since the bundled hero emblem asset is
  // theme-scoped and the other reference skins have no equivalent mark.
  let showHeroSplash = false
  let heroSplashHandledForLoad = false
  $: if (!$isLoading && !heroSplashHandledForLoad) {
    heroSplashHandledForLoad = true
    if ($activeTheme.id === 'future-spinner') {
      showHeroSplash = true
    } else if (!introSeen()) {
      showIntroSplash = true
    }
  }
  function handleHeroSplashDismiss(): void {
    showHeroSplash = false
    if (!introSeen()) showIntroSplash = true
  }
  function handleIntroContinue(): void {
    showIntroSplash = false
    markIntroSeen()
  }
  let showThemeSelector = false
  // 2026-07-14c: single collapsed toggle for the dev-only theme/reel-mode
  // chip popover (item 4, landscape/portrait v2 briefs) - dev chrome default
  // state is collapsed so the dev server's idle view is visually closer to
  // production.
  let showDevPanel = false

  // ── Idle attract mode (ANIMATION UPLIFT PASS 2026-07-16, item 5) ───────────
  // After 20s with no pointerdown/keydown, gentle symbol glints (GameGrid) and
  // an emblem shimmer on the FEATURES bar (FeatureMenu) engage; any
  // interaction kills it instantly. Both effects are pure CSS loops once
  // engaged (no per-frame JS), so the steady-state idle cost is negligible -
  // verified against the frame gate in item 6. Suppressed while any
  // modal/overlay/spin is active so it never fights something the player is
  // actually looking at.
  // Dev-only fast-forward for headless verification (?fastIdle=1) - never
  // reachable in production since import.meta.env.DEV is false there.
  const IDLE_ATTRACT_MS = (import.meta.env.DEV && new URLSearchParams(window.location.search).get('fastIdle'))
    ? 1200 : 20000
  let idleAttract = false
  let idleTimer: ReturnType<typeof setTimeout> | null = null
  function resetIdleTimer(): void {
    idleAttract = false
    if (idleTimer) clearTimeout(idleTimer)
    idleTimer = setTimeout(() => { idleAttract = true }, IDLE_ATTRACT_MS)
  }
  $: idleAttractActive = idleAttract && !$isSpinning && !$showPaytable && !showThemeSelector
    && !$isWincap && !featureActive && !showIntroSplash && !showHeroSplash

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
  // OWNER AUDIT ROUND 2, item 1 (spoiler-bug fix): true for the single frame
  // in which the just-finished feature's real recordSpinResult() settlement
  // lands (see settleRound() below) - suppresses the App-level WinBanner so
  // it doesn't pop a SECOND celebration for a round FreeSpinsPresentation's
  // own end-of-feature screen already celebrated. Reset false at the top of
  // every new spin.
  let lastRoundHadFeature = false

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
  // Feature-end celebration values (WIN BANNER V3 reuse) - see the dedicated
  // <WinBanner> mount below, and FreeSpinsPresentation's onEndBannerDismissed().
  let liveEndBannerAmount = 0
  let liveEndBannerMultiplier = 0
  let liveEndBannerTrigger = 0
  let featureRef: FreeSpinsPresentation
  // OWNER AUDIT ROUND 2, item 4 (Fable's ruling): three distinct entry
  // colourways - natural (organic trigger, any standing mode), overdrive
  // (bought Overdrive - the 100x 'bonus' tier), nitro (bought NITRO
  // OVERDRIVE - the pre-revved 'super' tier, already distinguishable via
  // FreeSpinsPresentation's own isNitroEntry). $selectedBetMode still holds
  // the tier that was actually bought for the whole feature (handleBuy only
  // resets it to 'base' in its `finally`, which runs after presentFeature
  // resolves), so it is a reliable signal here.
  let liveIsNitroEntry = false
  $: flameColourway = liveIsNitroEntry ? 'nitro' : ($selectedBetMode === 'bonus' ? 'overdrive' : 'natural')
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

  // ── Screen shake - feature trigger and big+ wins (ANIMATION UPLIFT PASS
  //    2026-07-16, item 3: "one subtle screen-shake pulse on big and above" -
  //    lowered from the prior 50x threshold to 10x, the same BIG_WIN_THRESHOLD
  //    WinBanner.svelte's own tier system uses, so the two stay aligned) ─────
  let shakeActive = false
  let lastShakeWin = 0
  function triggerShake(durationMs = 420): void {
    shakeActive = true
    setTimeout(() => { shakeActive = false }, durationMs)
  }
  $: if ($winAmount > 0 && $winAmount !== lastShakeWin && $winMultiplier >= 10) {
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
    lastRoundHadFeature = false
    const bet = $betAmount
    // Route through integer micros before this reaches any balance/telemetry
    // math (CLAUDE.md's zero-float-tolerance rule) - a raw `bet * cost` float
    // multiplication (e.g. 0.1 * 400) can land a hair off a clean value, and
    // recordSpinResult's mock-mode balance update does plain float subtraction.
    const cost = Math.round(bet * (MODE_COST[mode] ?? 100) * CURRENCY_SCALE) / CURRENCY_SCALE
    try {
      selectedBetMode.set(mode)
      track({ type: 'buy', tier: mode, costMicros: Math.round(cost * CURRENCY_SCALE) })
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
      const buyWin = result.newBalance !== undefined ? result.totalWin : (servedTotalWin ?? result.totalWin)
      const roundIsWincap = result.newBalance !== undefined ? result.isWincap : (script?.isWincap ?? result.isWincap)

      // OWNER AUDIT ROUND 2, item 1 (spoiler-bug fix, buy-flow counterpart to
      // the same fix in handleSpin above): a buy always triggers the feature,
      // so recordSpinResult's `win` is always the round's FULL total (base +
      // every free spin) - settling it before presentFeature plays would
      // spoil the whole free-spins outcome the instant the buy confirms.
      // Defer until the feature has actually finished playing (wincap keeps
      // its existing immediate reveal via MaxWinCelebration, unaffected).
      const settleRound = () => {
        if (result.newBalance !== undefined) {
          // Live: RGS balance is authoritative (already reflects the mode's cost).
          recordSpinResult(result.totalWin, cost, result.newBalance, result.isWincap)
          rgRecordSpin(Math.round(cost * CURRENCY_SCALE), Math.round(result.totalWin * CURRENCY_SCALE))
        } else {
          // Mock: deduct the mode's real cost and add the served round total.
          recordSpinResult(buyWin, cost, undefined, roundIsWincap)
          rgRecordSpin(Math.round(cost * CURRENCY_SCALE), Math.round(buyWin * CURRENCY_SCALE))
        }
        if (buyWin > 0) {
          const bm = bet > 0 ? buyWin / bet : 0
          track({ type: 'win', winMicros: Math.round(buyWin * CURRENCY_SCALE), multiple: bm, tier: winTier(bm) })
        }

        // Dev-only QA instrumentation, mirroring handleSpin's __qaLog block:
        // the wiring-integrity audit's cost-integrity gate (qa_soak.mjs) needs
        // a buy-tier entry with the mode actually charged, since this call
        // site is the one place the FEATURES-menu tier selection turns into a
        // real debit.
        if (import.meta.env.DEV) {
          const w = window as unknown as { __qaLog?: unknown[] }
          w.__qaLog = w.__qaLog ?? []
          w.__qaLog.push({
            mode,
            bet,
            cost,
            totalWin:     buyWin,
            balanceAfter: get(balance),
          })
        }
      }

      const deferSettle = !roundIsWincap && !!script?.triggered
      if (!deferSettle) settleRound()

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

      if (deferSettle) {
        lastRoundHadFeature = true
        settleRound()
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
  // Portrait layout pass (2026-07-14): a native-feeling composition needs the
  // HUD/FEATURES trigger decoupled from the stage scale, which means
  // .game-wrapper itself must stop being a transformed ancestor in portrait
  // (a `transform` on an ancestor re-anchors `position:fixed` descendants to
  // its own bounding box, not the true viewport - every modal here relies on
  // .game-wrapper being untransformed to correctly cover the real screen).
  // So in portrait, .game-wrapper becomes an unscaled, full-viewport
  // container; only the nested .canvas-inner (the 1280x720 design surface
  // still used for the frame/grid) gets its own scale transform.
  //
  // GRID-FIRST RECOMPOSITION (2026-07-14c, portrait v2): v1 scaled the
  // WHOLE 1280-wide stage to ~96% of viewport width, so the frame (only
  // 640 of those 1280 units) rendered at under half the viewport width -
  // the grid read as small even though the brief's intent was a dominant,
  // width-first grid. This pass calibrates the scale against GRID_SPEC_W
  // (522px - the grid-slot's own design width, not the full 1280 stage and
  // not the frame's own wider 640px decorative border) so the GRID itself
  // reaches ~96% of viewport width, landing symbol cells at ~70-77px on a
  // 390-430px phone (verified empirically against the brief's "near 70px"
  // target - see the session report for the exact calibration reasoning).
  // The frame's own decorative outer edge (wider than the grid by design)
  // extends slightly past the viewport at its outer corners as a result -
  // a deliberate, common "chrome bleed" treatment, not a bug.
  function computePortrait(): boolean {
    if (typeof window === 'undefined') return false
    return window.innerHeight > window.innerWidth
  }
  const GRID_SPEC_W = 522
  // Vertical crop window (portrait v2): SceneGroup and the desktop logo are
  // not rendered in portrait at all (see the template), so canvas-slot only
  // needs to reserve enough height to show the frame (y84-552) plus a small
  // margin for FlameJets' edge-flare bleed (~40px) - not the full 720-tall
  // stage, most of which would otherwise be a dead band below the frame
  // (there is no HUD content left in that region once FeatureMenu/HudOverlay
  // are native-DOM elements below the canvas, not part of the 1280 canvas).
  const PORTRAIT_CROP_BOTTOM_Y = 592
  // Width-first sizing (above) can overflow the viewport vertically on a
  // short phone - "grid as large as width allows" still has to leave room
  // for the wordmark and the HUD below it, or the controls row (meant to be
  // pinned to the bottom safe-area) ends up scrolled out of view instead.
  // These are conservative, content-derived minimums (not guesses): the
  // wordmark's own line-height, and the portrait HUD's content-only height
  // with zero breathing gap (FeatureMenu's 44px trigger + its 8px margin,
  // .p-hud's 20px vertical padding, the stats+bet top-group at 114px, and a
  // 72px controls row - see HudOverlay.svelte's .p-fm-entry/.p-hud/
  // .p-top-group/.p-controls-row rules for the source values).
  const PORTRAIT_WORDMARK_H = 28
  // 290, not the 260 the component styles alone suggested: measured via
  // getBoundingClientRect() that .native-hud-slot's real content-driven
  // floor is ~287px (the hand-summed 260 estimate undercounted actual
  // rendered padding/line-height), confirmed by the fact that shrinking the
  // canvas further than that estimate implied still left the controls row
  // scrolled a few px past the viewport bottom - caught before committing
  // any screenshot, not assumed from the CSS alone.
  const PORTRAIT_HUD_MIN_H = 290
  function computePortraitCanvasScale(): number {
    if (typeof window === 'undefined') return 1
    const widthBasedScale = (0.96 * window.innerWidth) / GRID_SPEC_W
    const availableCanvasH = Math.max(window.innerHeight - PORTRAIT_WORDMARK_H - PORTRAIT_HUD_MIN_H, 1)
    const heightBasedScale = availableCanvasH / PORTRAIT_CROP_BOTTOM_Y
    return Math.min(widthBasedScale, heightBasedScale)
  }
  // Landscape compact HUD pass (2026-07-14b): gate by HEIGHT, not aspect
  // ratio - a landscape phone (innerWidth >= innerHeight) with innerHeight
  // below COMPACT_HEIGHT_BREAKPOINT gets the same decoupling treatment the
  // portrait pass proved (.game-wrapper drops its scale(S) transform so
  // position:fixed modals correctly cover the true viewport again), but with
  // a horizontal single-row native-scale strip instead of portrait's
  // vertical stack. Desktop landscape (>=500px tall) is completely
  // unchanged - still the single scale(S) transform, still every control
  // inside the LAYOUT_SPEC v3.x panel.
  const COMPACT_HEIGHT_BREAKPOINT = 500
  const COMPACT_STRIP_H = 76
  function computeCompactLandscape(): boolean {
    if (typeof window === 'undefined') return false
    return window.innerHeight < window.innerWidth && window.innerHeight < COMPACT_HEIGHT_BREAKPOINT
  }
  function computeCompactCanvasScale(): number {
    if (typeof window === 'undefined') return 1
    const availH = Math.max(window.innerHeight - COMPACT_STRIP_H, 1)
    return Math.min(window.innerWidth / STAGE_W, availH / STAGE_H)
  }
  let S = computeS()
  let portrait = computePortrait()
  let portraitCanvasScale = computePortraitCanvasScale()
  let compactLandscape = computeCompactLandscape()
  let compactCanvasScale = computeCompactCanvasScale()
  function handleResize(): void {
    S = computeS()
    portrait = computePortrait()
    portraitCanvasScale = computePortraitCanvasScale()
    compactLandscape = computeCompactLandscape()
    compactCanvasScale = computeCompactCanvasScale()
  }

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

    // First-gesture audio warm-up (2026-07-14 seam/warm-up fix): primes every
    // Audio element's decode pipeline on the player's first click/keypress so
    // the first real sound of the session doesn't pay a first-use decode cost
    // inline with gameplay. One-shot, removes both listeners once fired -
    // separate from playBGM()'s own gesture listener (which only starts BGM
    // playback, not every other sound element).
    const warmUpOnce = (): void => {
      warmUpAudio()
      document.removeEventListener('pointerdown', warmUpOnce)
      document.removeEventListener('keydown', warmUpOnce)
    }
    document.addEventListener('pointerdown', warmUpOnce)
    document.addEventListener('keydown', warmUpOnce)

    // Idle attract mode (item 5): start the initial timer, reset on any
    // interaction. Persistent (never removed) for the whole session, unlike
    // warmUpOnce above.
    resetIdleTimer()
    document.addEventListener('pointerdown', resetIdleTimer)
    document.addEventListener('keydown', resetIdleTimer)
  })

  onDestroy(() => {
    if (autoSpinTimer) clearTimeout(autoSpinTimer)
    if (idleTimer) clearTimeout(idleTimer)
    document.removeEventListener('pointerdown', resetIdleTimer)
    document.removeEventListener('keydown', resetIdleTimer)
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
    // Responsible gambling: never go below the jurisdiction minimum spin interval
    // (UKGC 2.5s), even under turbo/super. rgSpinDelay is a no-op where unset.
    const delay = rgSpinDelay(delayMs * factor)
    autoSpinTimer = setTimeout(() => {
      autoSpinTimer = null
      handleSpin()
    }, delay)
  }

  async function handleSpin() {
    if ($isSpinning || featureActive) return
    // Standing mode for normal spins (Normal/Cruise) plus the OVERBOOST
    // enhancer toggle - both live in the one standingMode store (FeatureMenu's
    // selectStanding()/toggleEnhancer() write it; see betMode.ts). The locked
    // canSpin guard only ever checks affordability of the 1x base bet, so any
    // >1x mode (OVERBOOST, 1.25x) needs its own affordability guard here,
    // before the spin lock engages - mirrors handleBuy's per-tier cost.
    const mode = $standingMode
    const bet  = $betAmount
    const cost = Math.round(bet * (MODE_COST[mode] ?? 1) * CURRENCY_SCALE) / CURRENCY_SCALE
    if (cost > bet && $balance < cost) return
    isSpinning.set(true)   // disable spin button immediately, before async work begins
    resetWin()
    lastRoundHadFeature = false
    selectedBetMode.set(mode)
    lastRoundEvents.set(null)   // clear any prior round before this spin publishes

    track({ type: 'spin', costMicros: Math.round(cost * CURRENCY_SCALE) })

    try {
      const result: SpinResult = await spin({ betAmount: bet, mode: 'base' })

      // A dev-only ?mockCategory= override lets headless verification force a
      // specific curated round for STANDING-mode spins too, mirroring the
      // buy-flow's existing pattern below (OWNER AUDIT REMEDIATION A4: the
      // autoplay soak needs deterministic win/loss/trigger rounds to prove
      // the loss-limit/single-win-limit/stop-on-feature stop conditions
      // actually engage - previously only the buy flow supported this, so
      // standing-mode autoplay could never exercise stop-on-feature at all
      // in mock mode, and loss/win limits could only be soaked against
      // uncontrolled random results). Live play is unaffected either way -
      // this whole block is import.meta.env.DEV-gated.
      let servedTotalWin: number | null = null
      if (import.meta.env.DEV && !get(lastRoundEvents)) {
        const { serveMockRound, serveCategory } = await import('./lib/mock/roundProvider')
        const forcedCategory = new URLSearchParams(window.location.search).get('mockCategory')
        const round = forcedCategory
          ? await serveCategory(mode, forcedCategory)
          : await serveMockRound(mode)
        if (round) servedTotalWin = (round.payoutMultiplier / 100) * bet
      }
      const win = servedTotalWin ?? result.totalWin

      if (gridRef) await gridRef.animateSpin(result.board)

      boardSymbols.set(result.board)
      activeWins.set(result.winEvents)
      scatterCount.set(result.scatterEvent?.count ?? 0)
      // Multiplier wilds: if the round published raw events (live RGS, or a mock
      // multiwild round), surface the per-cell wild multipliers as overlay
      // badges on the winning cells. Rounds without wild multipliers yield an
      // empty list, so base play is visually unchanged.
      {
        const rawEvents = get(lastRoundEvents)
        cellMultipliers.set(rawEvents ? cellMultipliersFromEvents(rawEvents) : [])
      }
      // Live base rounds that trigger Overdrive publish their full events; play
      // the free-spins overlay before autoplay continues. Wincap flow:
      // MaxWinCelebration is already showing (reactive to $isWincap) — wait for
      // COLLECT, then present the complete round sequence through the
      // interpreter, finishing on the total win summary.
      const roundEvents = get(lastRoundEvents)
      const script = roundEvents ? scriptFromEvents(roundEvents) : null
      // Named distinctly from the imported `isWincap` store ($isWincap is
      // used below) - Svelte's compiler cannot disambiguate a same-named
      // local const from the store when both are in scope, and errors out
      // ("Cannot subscribe to stores that are not declared at the top
      // level") rather than silently picking one.
      const roundIsWincap = script?.isWincap ?? result.isWincap
      if (roundIsWincap) {
        // Dwell on the winning hit: the board's win burst is already playing
        // from activeWins, so hold on it (a max win is the one moment to linger)
        // before recordSpinResult flips isWincap and the celebration covers the
        // screen. Deliberately NOT turbo-shortened.
        playWin(bet > 0 ? win / bet : 0)
        await new Promise((r) => setTimeout(r, 2600))
      }

      // OWNER AUDIT ROUND 2, item 1 (spoiler-bug fix): recordSpinResult sets
      // the GLOBAL $winAmount/$balance the persistent HudOverlay WIN box and
      // WinBanner react to unconditionally, with no feature-aware guard (and
      // cannot be given one - gameStore.ts is locked). For a normal (non-
      // wincap) triggered round, `win` is the ROUND'S FULL total (base +
      // every free spin combined) - settling it here, before presentFeature
      // plays, would reveal the entire outcome before the free spins have
      // even been shown. Defer the whole settlement (balance/session-stats/
      // telemetry) until the feature has actually finished playing; the
      // visible in-feature "TOTAL WIN" is a separate, safe accumulator
      // (FreeSpinsPresentation's runningTotalCentibets, sourced only from
      // spins already played - see roundInterpreter.ts) and is never spoiled
      // by this deferral. Wincap already has its own dedicated immediate
      // reveal (MaxWinCelebration) and is unaffected.
      const settleRound = () => {
        recordSpinResult(win, cost, result.newBalance, roundIsWincap)
        rgRecordSpin(Math.round(cost * CURRENCY_SCALE), Math.round(win * CURRENCY_SCALE))
        if (!roundIsWincap) playWin(bet > 0 ? win / bet : 0)
        if (win > 0) {
          const mult = bet > 0 ? win / bet : 0
          track({ type: 'win', winMicros: Math.round(win * CURRENCY_SCALE), multiple: mult, tier: winTier(mult) })
        }
        if (roundIsWincap) track({ type: 'wincap', multiple: bet > 0 ? win / bet : 0 })

        // QA soak harness telemetry (dev-only): the raw mock "book" data for
        // this round, plus the balance the store actually landed on, so the
        // harness can independently recompute totals and running balance in
        // integer micros and assert zero drift against what's presented.
        if (import.meta.env.DEV) {
          const w = window as unknown as { __qaLog?: unknown[] }
          w.__qaLog = w.__qaLog ?? []
          w.__qaLog.push({
            mode:         get(selectedBetMode),
            bet,
            cost,
            totalWin:     win,
            winEvents:    result.winEvents,
            scatterEvent: result.scatterEvent,
            balanceAfter: get(balance),
          })
        }
      }

      const deferSettle = !roundIsWincap && !!script?.triggered
      if (!deferSettle) settleRound()

      if ($isWincap) {
        await waitForWincapCollect()
        if (script) await presentFeature(script)
      } else if (script?.triggered) {
        await presentFeature(script)
      }

      if (deferSettle) {
        lastRoundHadFeature = true
        settleRound()
      }

      if ($isAutoPlay) {
        autoPlayCount.update(n => n - 1)
        // Responsible-gambling stop conditions (stop on win / single-win limit /
        // feature / loss limit), in addition to count, wincap and the win-tier
        // pause escalation below.
        const rg = autoplayShouldStop({
          winMicros: Math.round(win * CURRENCY_SCALE),
          betMicros: Math.round(bet * CURRENCY_SCALE),
          triggered: !!script?.triggered,
        })
        // Stop auto-play immediately on wincap — player must manually collect
        if ($autoPlayCount <= 0 || $isWincap || rg.stop) {
          isAutoPlay.set(false)
          autoPlayCount.set(0)
        } else {
          const multiplier = bet > 0 ? win / bet : 0
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
    if ($showPaytable || showThemeSelector || $isWincap || featureActive || showIntroSplash || showHeroSplash) return

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
        class:nitro-active={overdriveVisualActive && liveIsNitroEntry}
        src="assets/themes/future-spinner/backgrounds/bg_overdrive.jpg"
        alt=""
        aria-hidden="true"
      />
    </div>
    <!-- OWNER AUDIT REMEDIATION C1: the splash's rain streak layer, ported
         into the live rain-city backdrop at a lower density/opacity than
         the splash's own (10 streaks @ 0.55) - a background ambience touch,
         not a foreground effect competing with gameplay. Same
         RainLayer.svelte component the splash uses (extracted from it,
         not duplicated), so it inherits the same reduced-motion gating. -->
    <RainLayer count={6} opacity={0.22} variant="backdrop" />
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
  class:portrait
  class:compact-landscape={compactLandscape}
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
      <FreeSpinsPresentation script={WARM_SCRIPT} active={true} skipContinueGate={true} />
    </div>
  {/if}

  {#if showHeroSplash}
    <HeroSplash on:dismiss={handleHeroSplashDismiss} />
  {/if}

  {#if showIntroSplash}
    <IntroSplash on:continue={handleIntroContinue} />
  {/if}

  {#if portrait}
    <!-- PORTRAIT WORDMARK (2026-07-14c, grid-first recomposition): a small
         native-DOM text wordmark - never the desktop title lockup image
         (game-logo-img), which is a "desktop title lockup" the brief
         explicitly excludes from portrait. Sits above canvas-slot in normal
         flow, native px, never stage-scaled. -->
    <div class="portrait-wordmark">{$activeTheme.name}</div>
  {/if}

  <!-- CANVAS SLOT — the fixed 1280x720 design surface (frame/grid, plus
       scene/logo in desktop landscape only). In desktop landscape this is a
       no-op wrapper (canvas-inner is unscaled, static; .game-wrapper itself
       carries the scale(S) transform as before). In portrait AND
       compact-landscape (2026-07-14b: a landscape phone with innerHeight
       below 500px), .game-wrapper is unscaled/full-viewport instead, and
       this inner div carries its own scale so the canvas sits above the
       HUD, which native-stacks below (2026-07-14 portrait pass; 2026-07-14b
       extends the same mechanism to short landscape viewports, height-driven
       instead of width-driven; 2026-07-14c recalibrates portrait's scale to
       the grid's own width, not the full 1280 stage, and crops the canvas
       slot's height to the frame's bleed margin instead of the full 720
       stage height - see PORTRAIT_CROP_BOTTOM_Y above). -->
  <div
    class="canvas-slot"
    class:portrait
    class:compact-landscape={compactLandscape}
    style={portrait ? `height:${PORTRAIT_CROP_BOTTOM_Y * portraitCanvasScale}px` : compactLandscape ? `height:${STAGE_H * compactCanvasScale}px` : ''}
  >
    <div
      class="canvas-inner"
      class:portrait
      class:compact-landscape={compactLandscape}
      style={portrait ? `transform: translateX(-50%) scale(${portraitCanvasScale})` : compactLandscape ? `transform: translateX(-50%) scale(${compactCanvasScale})` : ''}
    >
      {#if !portrait}
        <!-- LOGO — top centre, 380 wide, y 18 (z70). Desktop/landscape only:
             portrait's brief explicitly excludes this "desktop title
             lockup" image, using .portrait-wordmark above instead
             (2026-07-14c). -->
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
      {/if}

      {#if $errorMessage}
        <div class="error-banner">{errorDisplay}</div>
      {/if}

      <!-- SCENE GROUP — left, set further back (z8), future-spinner only.
           Desktop/landscape only (2026-07-14c): portrait's brief explicitly
           excludes the car/pilot/billboard scene - the grid is the whole
           composition there, backdrop filling behind via the document-level
           .bg-still-container (unaffected either way, since that's outside
           .game-wrapper entirely). -->
      {#if $activeTheme.id === 'future-spinner' && !portrait}
        <SceneGroup />
      {/if}

      <!-- FRAME — 640x468 at (320,84), z10. Neon hue-shifts during Overdrive
           (Motion Polish v2), reversed once overdriveVisualActive clears. -->
      {#if $themeAssets.frame}
        <img
          src="{$themeAssets.frame}"
          class="game-frame"
          class:overdrive-active={overdriveVisualActive}
          class:nitro-active={overdriveVisualActive && liveIsNitroEntry}
          alt=""
          aria-hidden="true"
          on:error={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      {/if}

      <!-- OVERDRIVE FLAME JETS — 8 frame-edge jets (v3.4), ignite on Overdrive -->
      {#if $activeTheme.id === 'future-spinner'}
        <FlameJets active={overdriveVisualActive} colourway={flameColourway} />
      {/if}

      <!-- GRID — 522x349, centred inside the frame, z20 -->
      <div class="grid-slot">
        <div class="grid-scale">
          <GameGrid bind:this={gridRef} idleAttract={idleAttractActive} />
          <!-- Suppress standard celebration while the max-win overlay is active -->
          <WinCelebration winMultiplier={$isWincap ? 0 : $winMultiplier} />
          <!-- Ways breakdown — cycles group by group after the win burst settles -->
          <WinBreakdown />
          <!-- Overdrive free-spins presentation overlay (feature rounds only) -->
          <FreeSpinsPresentation
            bind:this={featureRef}
            script={featureScript}
            active={featureActive}
            bind:displayMeter={liveMeter}
            bind:spinsRemaining={liveSpinsRemaining}
            bind:runningTotalCentibets={liveRunningTotalCentibets}
            bind:overdriveVisualActive
            bind:isNitroEntry={liveIsNitroEntry}
            bind:endBannerAmount={liveEndBannerAmount}
            bind:endBannerMultiplier={liveEndBannerMultiplier}
            bind:endBannerTrigger={liveEndBannerTrigger}
            on:complete={onFeatureComplete}
          />
        </div>
      </div>

      <!-- BANNER — full-width neon band, edge to edge across the stage, z100 -->
      <WinBanner suppressed={lastRoundHadFeature} />

      <!-- FEATURE-END CELEBRATION — WIN BANNER V3 reuse (OWNER AUDIT ROUND 2,
           item 1/2): the exact same component, driven explicitly by
           FreeSpinsPresentation's own safe (spins-already-played) total
           rather than the global $winAmount, and mounted here (not nested
           inside the scaled grid-slot) so it shares the full 1280x720 stage
           coordinate space the base banner uses. -->
      <WinBanner
        amount={liveEndBannerAmount}
        multiplier={liveEndBannerMultiplier}
        trigger={liveEndBannerTrigger}
        on:dismissed={() => featureRef?.onEndBannerDismissed()}
      />

      <!-- BONUS INSTRUMENT COLUMN — Overdrive only. Landscape/desktop
           unchanged (2026-07-15 neon polish pass, item 2); portrait renders
           its own native-scale compact strip in .native-hud-slot below
           instead - the gap the portrait v2 session report disclosed
           (this gauge column fell fully outside the visible viewport
           window on at least one tested profile during Overdrive) is
           closed by the same decoupling pattern used for FeatureMenu/
           HudOverlay, not by cropping the canvas differently. -->
      {#if featureActive && $activeTheme.id === 'future-spinner' && !portrait}
        <BonusInstrumentColumn
          multiplier={liveMeter}
          spinsRemaining={liveSpinsRemaining}
          runningTotalCentibets={liveRunningTotalCentibets}
        />
      {/if}

      <!-- FEATURES trigger — desktop landscape only here (stays pinned
           beside the frame in the 1280x720 coordinate space); portrait and
           compact-landscape each render their own native-scale trigger in
           .native-hud-slot below. -->
      {#if !portrait && !compactLandscape && $activeTheme.id === 'future-spinner' && !featureActive}
        <FeatureMenu idleAttract={idleAttractActive} on:buy={(e) => buyBonusRef?.openConfirm(e.detail)} />
      {/if}

      <!-- HUD OVERLAY — desktop landscape only here; portrait and
           compact-landscape each render their own native-DOM instance in
           .native-hud-slot below. -->
      {#if !portrait && !compactLandscape}
        <HudOverlay on:spin={handleSpin} on:slam={() => gridRef?.slamStop()} />
      {/if}
    </div>
  </div>

  {#if portrait || compactLandscape}
    <!-- NATIVE HUD SLOT — native DOM scale, never stage-scaled (2026-07-14
         portrait pass; 2026-07-14b extends it to compact-landscape). Sits
         below the canvas slot in normal flow; FeatureMenu/HudOverlay each
         get a `portrait` or `compactLandscape` prop so their own CSS
         renders the matching native-scale composition instead of the
         LAYOUT_SPEC absolute positions. -->
    <div class="native-hud-slot" class:portrait class:compact-landscape={compactLandscape}>
      <!-- Portrait Overdrive meter (2026-07-15, item 2): docked between the
           grid (canvas-slot above) and the FEATURES bar - occupies the same
           slot FeatureMenu's trigger would, since that's hidden during the
           feature anyway (both here and in the landscape/desktop branch).
           Only in portrait - compact-landscape isn't named in this brief and
           keeps its prior behaviour (BonusInstrumentColumn not shown there
           either way, since compactLandscape's own strip has no room for it -
           unchanged, not a new gap this pass introduces). -->
      {#if portrait && featureActive && $activeTheme.id === 'future-spinner'}
        <BonusInstrumentColumn
          compact
          multiplier={liveMeter}
          spinsRemaining={liveSpinsRemaining}
          runningTotalCentibets={liveRunningTotalCentibets}
        />
      {/if}
      {#if $activeTheme.id === 'future-spinner' && !featureActive}
        <FeatureMenu {portrait} {compactLandscape} idleAttract={idleAttractActive} on:buy={(e) => buyBonusRef?.openConfirm(e.detail)} />
      {/if}
      <HudOverlay {portrait} {compactLandscape} on:spin={handleSpin} on:slam={() => gridRef?.slamStop()} />
    </div>
  {/if}

  <!-- Bonus Buy — modal/confirm logic only; its own trigger button is
       replaced by FeatureButton above (showTrigger=false). Hidden entirely
       where the jurisdiction disables feature buys (handled inside). Dispatches
       the CONFIRMED buy tier (e.detail), not always 'bonus'. -->
  <BuyBonus bind:this={buyBonusRef} showTrigger={false} on:buy={(e) => handleBuy(e.detail)} />

  <!-- Dev chrome (2026-07-14c): collapsed behind one small DEV chip instead
       of two separate labelled floating buttons, so the dev server's
       default view reads much closer to production (nothing at all) rather
       than visibly different chrome. Hidden in the production submission
       build so only the validated Future Spinner experience ships (see the
       scope note in the script); data-dev lets the conformance suite's
       touch-target audit exclude every element in here from the production
       gate, same mechanism as before (2026-07-14b), now covering the chip
       and its popover contents alike. Reversible: remove these
       import.meta.env.DEV guards. -->
  {#if import.meta.env.DEV}
    <div class="dev-chip-wrapper">
      <button
        class="util-btn dev-chip"
        on:click={() => showDevPanel = !showDevPanel}
        aria-label="Dev tools"
        aria-expanded={showDevPanel}
        title="Dev tools"
        data-dev="true"
        data-testid="dev-chip"
      >DEV</button>
      {#if showDevPanel}
        <div class="dev-panel" data-dev="true">
          <button
            class="util-btn theme-btn"
            on:click={() => { showThemeSelector = true; showDevPanel = false }}
            aria-label="Change theme"
            title="Change theme"
            data-dev="true"
          >🎨</button>
          <!-- Reel choreography toggle — dev-only eye test (drop is the
               shipping default; strip is the dev-toggle alternative). -->
          <button
            class="util-btn reel-mode-btn"
            on:click={cycleReelMode}
            aria-label="Toggle reel mode"
            title="Reel mode: {$reelMode} (click to toggle strip/drop)"
            data-testid="reel-mode-toggle"
            data-dev="true"
          >{$reelMode === 'drop' ? '⬇' : '⇅'}<span class="reel-mode-label">{$reelMode}</span></button>
        </div>
      {/if}
    </div>
  {/if}

  {#if $showPaytable}
    <PaytableModal />
  {/if}

  <!-- Responsible-gambling session panel (2026-07-14c: absent by default in
       every layout - its own corner overlay only auto-pins where the
       jurisdiction's mandatorySessionDisplay flag demands it; otherwise it's
       reachable via the HUD menu's "Session" item, same in dev and prod).
       Inside the non-replay branch so it is never rendered in replay mode,
       matching BalanceDisplay/ControlBar/ThemeSelector. -->
  <SessionPanel />

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

  /* Portrait/compact-landscape shake variant - no scale() term since
     .game-wrapper carries no scale transform of its own in either native-hud
     mode (only .canvas-inner does). */
  @keyframes screen-shake-portrait {
    0%, 100% { transform: translate(0, 0); }
    20%      { transform: translate(-7px, 5px); }
    40%      { transform: translate(7px, -5px); }
    60%      { transform: translate(-5px, 4px); }
    80%      { transform: translate(5px, -3px); }
  }
  .game-wrapper.portrait.shake,
  .game-wrapper.compact-landscape.shake { animation: screen-shake-portrait 0.42s ease-in-out; }

  @media (prefers-reduced-motion: reduce) {
    .game-wrapper.shake { animation: none; }
  }

  /* Native-HUD layout modes: portrait (2026-07-14 pass) and compact-landscape
     (2026-07-14b - a landscape phone with innerHeight below 500px). Both
     drop the scale(S) transform entirely on .game-wrapper so it is no
     longer a transformed ancestor: every position:fixed modal inside it
     (PaytableModal, BuyBonus, SessionPanel, MaxWinCelebration, ThemeSelector,
     LoadingScreen, HeroSplash, IntroSplash) then correctly covers the true viewport
     again, since a transform on an ancestor otherwise re-anchors
     position:fixed descendants to its own bounding box. Only .canvas-inner
     (nested) carries a scale transform - width-driven in portrait (~96% of
     viewport width), height-driven in compact-landscape (fits the space
     remaining above the native HUD strip) - keeping the existing 1280x720
     coordinate space for the scene/frame/grid unchanged in both. Desktop
     landscape (neither class) is completely untouched. */
  .game-wrapper.portrait,
  .game-wrapper.compact-landscape {
    width: 100%;
    height: 100%;
    flex: 1 1 auto;
    transform: none;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    padding-top: env(safe-area-inset-top, 0px);
    padding-left: env(safe-area-inset-left, 0px);
    padding-right: env(safe-area-inset-right, 0px);
  }

  .canvas-slot {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .canvas-slot.compact-landscape {
    flex: 0 0 auto;
    /* height set inline per-frame (STAGE_H * compactCanvasScale) */
  }
  .canvas-slot.portrait {
    flex: 0 0 auto;
    /* height set inline per-frame (PORTRAIT_CROP_BOTTOM_Y *
       portraitCanvasScale) - deliberately shorter than canvas-inner's own
       logical 720-tall height (2026-07-14c): SceneGroup and the desktop
       logo aren't rendered in portrait, so everything below the frame's
       bleed margin (y592+) is empty stage space, not real content - overflow
       hidden crops it rather than reserving a dead band for nothing. */
    overflow: hidden;
  }
  .canvas-inner {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .canvas-inner.portrait,
  .canvas-inner.compact-landscape {
    position: absolute;
    top: 0;
    left: 50%;
    width: 1280px;
    height: 720px;
    transform-origin: top center;
    /* transform (translateX(-50%) scale(...CanvasScale)) set inline */
  }

  /* Native-DOM HUD region, immediately below the canvas (no dead gap),
     never stage-scaled. Fonts and touch targets inside render at their own
     CSS px, independent of S. flex:0 0 auto sizes this to its own content
     height rather than stretch-filling remaining viewport space - an
     earlier draft (portrait pass) used flex:1 1 auto + justify-content:
     flex-end, which pushed the FEATURES/HUD controls to the very bottom of
     the screen with a large blank backdrop-only gap above them (caught via
     the committed portrait-v1 screenshots, see that pass's session report).
     Any true leftover space on an unusually tall/short viewport now collects
     at the bottom, after the HUD, which reads as normal safe-area padding
     rather than a broken composition. Shared by both portrait (vertical
     stack, see HudOverlay's `portrait` template) and compact-landscape
     (single horizontal row, see HudOverlay's `compactLandscape` template) -
     only the CHILD composition differs, not this slot's own layout. */
  .native-hud-slot {
    position: relative;
    flex: 0 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    z-index: 60;
  }
  /* Portrait (2026-07-14c, grid-first recomposition): grows to fill the
     space remaining below the canvas, so HudOverlay's own controls row can
     be pinned to the true bottom safe-area (via justify-content:
     space-between on .p-hud, see HudOverlay.svelte) instead of v1's
     content-sized slot, which left the controls wherever the content
     happened to end. FeatureMenu's bar stays at the TOP of this region,
     immediately below the grid - no gap - since it's a separate, auto-sized
     flex item before HudOverlay's flex:1 .p-hud fills the rest. */
  .native-hud-slot.portrait {
    flex: 1 1 auto;
    min-height: 0;
  }
  /* Compact-landscape (2026-07-14b): a single native-scale row - FeatureMenu's
     compact trigger and HudOverlay's compact strip are the two flex items,
     side by side, instead of portrait's vertical stack. Fixed height matches
     COMPACT_STRIP_H in the script exactly, since the canvas's own height
     budget is computed against that same constant. */
  .native-hud-slot.compact-landscape {
    box-sizing: border-box;
    flex-direction: row;
    align-items: stretch;
    height: 76px;
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  /* Portrait wordmark (2026-07-14c) - small native-DOM text, never the
     desktop title lockup image. Sized to comfortably fit any top safe-area
     without pushing the canvas down meaningfully. */
  .portrait-wordmark {
    flex: 0 0 auto;
    padding: 4px 0 2px;
    text-align: center;
    font-family: 'Orbitron', system-ui, sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(210, 240, 255, 0.85);
    text-shadow: 0 0 10px color-mix(in srgb, var(--theme-primary, #00ffff) 55%, transparent);
  }

  /* -- Logo - top centre, 380 wide, y 18, z70 -- */
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
  /* NITRO OVERDRIVE (item 4): "intensifies the pink/magenta backdrop" - the
     same graded bg_overdrive.jpg asset, pushed further via filter rather
     than a second art asset. */
  .bg-still.overdrive.active.nitro-active {
    filter: saturate(1.35) brightness(1.08) hue-rotate(-8deg);
  }

  /* ── Dev chip (2026-07-14c) — single small anchor, replaces two separate
       floating buttons so the dev server's default view is visually closer
       to production. ─────────────────────────────────────────────────── */
  .dev-chip-wrapper {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 50;
  }
  .util-btn.dev-chip {
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 10px;
    width: 40px;
    height: 24px;
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, border-color 0.15s;
    color: rgba(255, 255, 255, 0.75);
  }
  .util-btn.dev-chip:hover {
    background: color-mix(in srgb, var(--theme-primary, #00ffff) 12%, transparent);
    border-color: color-mix(in srgb, var(--theme-primary, #00ffff) 45%, transparent);
  }
  .dev-panel {
    position: absolute;
    bottom: calc(100% + 8px);
    right: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .util-btn.theme-btn {
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

  /* ── Reel-mode toggle (dev-only) ──────────────────────────────────────── */
  .util-btn.reel-mode-btn {
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
    white-space: nowrap;
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
  /* NITRO (item 4): the same pulse, intensified - higher saturation and a
     brighter peak glow, distinguishing the bought NITRO entry from a plain
     Overdrive buy without a second keyframe/asset. */
  .game-frame.overdrive-active.nitro-active {
    animation-name: frame-pulse-nitro;
  }
  @keyframes frame-pulse-nitro {
    0%, 100% { filter: hue-rotate(280deg) saturate(1.7) drop-shadow(0 0 14px color-mix(in srgb, var(--theme-secondary, #ff00ff) 75%, transparent)); }
    50%       { filter: hue-rotate(280deg) saturate(1.7) drop-shadow(0 0 34px color-mix(in srgb, var(--theme-secondary, #ff00ff) 100%, transparent)); }
  }

  @media (prefers-reduced-motion: reduce) {
    .game-frame, .game-frame.overdrive-active, .game-frame.overdrive-active.nitro-active { animation: none; }
    .bg-still.overdrive.active.nitro-active { filter: saturate(1.2) brightness(1.05); }
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
