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

  // Determine mode synchronously at boot, no async needed.
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
  import { isSocial, socialAtBoot } from './lib/stores/socialMode'
  import { resolveLaunchLocale, enforceSocialEnglish } from './lib/stores/socialLocale'
  // ── Overdrive Stage 2 (non-locked feature layer) ──────────────────────────
  import { get } from 'svelte/store'
  import { speedTier } from './lib/stores/speedMode'
  import BuyBonus from './lib/components/BuyBonus.svelte'
  import FreeSpinsPresentation from './lib/components/FreeSpinsPresentation.svelte'
  import { selectedBetMode, standingMode, type BetMode } from './lib/stores/betMode'
  import { spinCostMicros } from './lib/stores/buyAffordability'
  import { boughtRound } from './lib/stores/boughtRound'
  import { reelMode, cycleReelMode } from './lib/stores/reelMode'
  import { lastRoundEvents } from './lib/stores/roundEvents'
  import { overdriveVisual } from './lib/stores/overdriveVisual'
  import {
    interpretRound, cellMultipliersFromEvents,
    type PresentationScript, type RawEvent,
  } from './lib/services/roundInterpreter'
  import { cellMultipliers } from './lib/stores/cellMultipliers'
  import { currencyCode } from './lib/stores/gameStore'
  import { locales, type Locale } from './lib/i18n/translations'
  import { tr } from './lib/i18n/tr'

  // ── COHESION PASS (TR-027) ───────────────────────────────────────────────
  // Shipped as VARIANTS first, defaults second. Both the global grade and the
  // character haze are eye-calls, and an eye-call that needs a rebuild between
  // options spends the reviewer's attention on waiting rather than judging.
  //   ?grade=neutral|warm|cool|deep
  //   ?haze=0|1|2|3
  // DEV-gated and read once at boot. The chosen values become the defaults; the
  // parameters stay afterwards as comparison tools, because the next art
  // question will want the same harness and they cost nothing in production.
  const _cohesionParam = (name: string): string | null =>
    import.meta.env.DEV ? new URLSearchParams(window.location.search).get(name) : null

  const GRADES: Record<string, { colour: string; strength: number; blend: string }> = {
    // A single palette temperature laid over backdrop, scene, frame, symbols and
    // celebrations at once. That is the point: grading the layers independently
    // is how the art came to read as assembled rather than unified.
    neutral: { colour: 'transparent',            strength: 0,    blend: 'normal' },
    warm:    { colour: 'rgb(255, 174, 92)',      strength: 0.16, blend: 'overlay' },
    cool:    { colour: 'rgb(96, 168, 255)',      strength: 0.16, blend: 'overlay' },
    deep:    { colour: 'rgb(58, 22, 96)',        strength: 0.26, blend: 'soft-light' },
  }
  const _gradeKey = _cohesionParam('grade') ?? 'neutral'
  $: grade = GRADES[_gradeKey] ?? GRADES.neutral

  // 0 = off (current shipped look), 3 = deepest. Passed to SceneGroup.
  const hazeLevel = Math.max(0, Math.min(3, Number(_cohesionParam('haze') ?? 0) || 0))

  // BACKGROUND: the owner ruled BG: V1 on 2026-07-27, so candidate v1 IS the
  // shipped background now and the eye-call harness that carried the decision
  // is gone with it. `bg_base.jpg` is the adopted file, `bg_overdrive.jpg` is
  // derived from it by scripts/assets/background_overdrive_derive.py so the
  // feature crossfade stays one city under two lights.
  //
  // Unlike ?grade and ?haze this parameter did NOT stay as a comparison tool.
  // Those switch between treatments computed at runtime and cost nothing; this
  // one needed 0.51MB of candidate JPEGs in public/ to mean anything, and
  // keeping rejected art in the served tree to preserve a switch nobody will
  // press again is the wrong trade. The candidates, their measurements and the
  // provenance are recoverable at commit 6eaea1a and recorded in
  // reports/qa/background_candidate_ingest.json.
  import { CURRENCY_SCALE } from './lib/utils/currency'
  import { configureTelemetry, setTelemetrySink, bufferSink, track, winTier, type TelemetryEvent } from './lib/services/telemetry'
  import { rgRecordSpin, autoplayShouldStop, rgSpinDelay, rgJurisdiction } from './lib/stores/responsibleGambling'
  import { anyModalOpen } from './lib/stores/modalGuard'
  import { bettingDisabled, liveGuardReason, evaluateLiveGuard } from './lib/stores/liveGuard'
  import { recoverSession, recoveryBannerVisible, dismissRecoveryBanner } from './lib/stores/sessionRecovery'
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
  // ── R6: launch language, applied BEFORE first render ──────────────────────
  //
  // SPEC (quoted, docs/stake-engine-live/game-replay-requirements.md, parameter
  // table): "lang | No | Language code". Optional, so absence is legitimate and
  // must fall back to English rather than error.
  //
  // THE GAP THIS CLOSES: rgsService.parseSessionParams() already read `lang`
  // into SessionParams (line 298) and sent it to the RGS, but nothing ever
  // published it to the `locale` store, which is writable<Locale>('en') in the
  // locked gameStore and was never set at boot. A launch URL carrying ?lang=ja
  // therefore rendered the whole game in English. The parameter was parsed,
  // carried, and dropped.
  //
  // This runs in the component script body, NOT onMount, so the store is set
  // before the first render rather than causing a visible English flash.
  //
  // Validation is against the SHIPPED `locales` map rather than a hardcoded
  // list, so adding or removing a locale updates this check for free and the two
  // can never disagree.
  //
  // JOB 3(d) / TR-067, 2026-07-26. Stake Engine testing guideline item 46:
  // "English is the only supported language in Social Mode". The decision now
  // runs through `resolveLaunchLocale`, which checks social FIRST so no amount
  // of parameter parsing can produce a non-English social session, and
  // `socialAtBoot` is resolved at module load from the URL, so this still
  // happens before the first render. `enforceSocialEnglish` below covers the
  // other route, where social arrives with the authenticate response instead.
  {
    try {
      const raw = new URLSearchParams(window.location.search).get('lang')
      locale.set(resolveLaunchLocale(raw, socialAtBoot, locales))
    } catch {
      /* non-browser context; keep the default */
    }
  }
  enforceSocialEnglish()

  if (import.meta.env.DEV) {
    const buf: TelemetryEvent[] = []
    ;(window as unknown as { __telemetry: unknown[] }).__telemetry = buf
    setTelemetrySink(bufferSink(buf))

    // DEV ONLY: ?mockCurrency=XSC seeds the currency the RGS would have sent in
    // its authenticate response, so the currency conformance harness can drive
    // every display path (fiat, zero-decimal/high-minimum, and the XSC/XGC
    // sweepstakes codes) without a live sweepstakes session. Mirrors the
    // existing ?mockCategory and ?social dev hooks. Guarded by import.meta.env.DEV
    // exactly like the theme selector, so it cannot exist in a production build.
    try {
      const mockCurrency = new URLSearchParams(window.location.search).get('mockCurrency')
      if (mockCurrency) currencyCode.set(mockCurrency.toUpperCase())
    } catch { /* non-browser context, ignore */ }
  }

  // ── Intro splash, brand screens (Motion Polish v2) ───────────────────────
  // Shown once, right after loading finishes. Persistence (audit remediation):
  // localStorage so it does not re-show on every load in incognito/memory-
  // cleared contexts, falling back silently to sessionStorage then in-memory if
  // a store is unavailable or blocked (each guarded, so no console errors).
  // R12 / TR-022 (owner ruling, 2026-07-26): SESSION storage only, so the rules
  // modal returns on every COLD load and is still skipped for the rest of the
  // session. It previously wrote localStorage first, which made the flag
  // effectively permanent for a browser profile: the owner reported the splash
  // never reappearing on desktop and having to use incognito to see it again,
  // and that persistence was exactly why. A returning player got a game that had
  // silently dropped its own rules screen.
  //
  // Any legacy localStorage flag is actively cleared on first read, otherwise
  // every existing player stays permanently opted out and the fix would be
  // invisible to precisely the people who hit the bug.
  const INTRO_KEY = 'fs_intro_seen_v1'
  let introSeenMemory = false
  function introSeen(): boolean {
    try {
      if (localStorage.getItem(INTRO_KEY)) localStorage.removeItem(INTRO_KEY)
    } catch {}
    try { if (sessionStorage.getItem(INTRO_KEY)) return true } catch {}
    return introSeenMemory
  }
  function markIntroSeen(): void {
    introSeenMemory = true
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
    // If neither splash is going to be shown at all - a returning session on a
    // theme without the hero emblem - nothing would ever call the dismiss
    // handlers, and a recovery waiting on them would hang forever holding the
    // round open. That would be worse than the defect this gate fixes, so the
    // gate resolves itself here. It is a no-op while a splash IS showing.
    resolveSplashesClearedIfDone()
  }
  function handleHeroSplashDismiss(): void {
    showHeroSplash = false
    if (!introSeen()) showIntroSplash = true
    resolveSplashesClearedIfDone()
  }
  function handleIntroContinue(): void {
    showIntroSplash = false
    markIntroSeen()
    resolveSplashesClearedIfDone()
  }

  // R2R-R JOB B / TR-035b. A recovered round must be REPLAYED IN FRONT OF THE
  // PLAYER, and the boot splashes sit on top of everything. The first capture
  // of this feature caught the defect exactly: the banner rendered correctly
  // while the replay had already played out behind "TAP TO CONTINUE", so the
  // player was told their round had been completed and never saw it happen.
  // Presenting behind a splash is indistinguishable from not presenting at all.
  //
  // Recovery therefore waits for every boot splash to clear before it presents.
  // It does NOT wait to settle: settling is downstream of presenting, so the
  // whole sequence simply starts when the player is actually looking.
  let splashesClearedResolve: (() => void) | null = null
  const splashesCleared: Promise<void> = new Promise((resolve) => {
    splashesClearedResolve = resolve
  })
  function resolveSplashesClearedIfDone(): void {
    if (showHeroSplash || showIntroSplash) return
    const r = splashesClearedResolve
    splashesClearedResolve = null
    if (r) r()
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

  // Live bonus-instrument values, FreeSpinsPresentation drives these via
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
  // ROUND 4 item 6: portrait lockup image load-failure fallback.
  let portraitLogoFailed = false
  let liveIsNitroEntry = false
  // OWNER AUDIT ROUND 4, item 3. The NITRO route previously depended SOLELY on
  // liveIsNitroEntry, which is bound out of FreeSpinsPresentation and therefore
  // only arrives once that component has mounted and reached its entry phase.
  // The Overdrive route never had this problem because it reads $selectedBetMode
  // directly - which is exactly why the bug looked like "bought entries render
  // green" while only NITRO actually did.
  //
  // The window that exposed it: a bought round that hits the 5,000x cap. The
  // MaxWinCelebration COLLECT gate runs BEFORE presentFeature, so for its whole
  // duration liveIsNitroEntry is still false and 'super' matched neither branch,
  // falling through to 'natural' - green flames on a NITRO buy. Measured
  // (reports/screens/owner-audit-v4/): nitro-wincap read colourway-natural
  // before COLLECT and colourway-nitro after, while overdrive-wincap read
  // colourway-overdrive throughout.
  //
  // Fix: derive NITRO from the bought tier the same way Overdrive already is, so
  // the route is known the instant the purchase is made rather than when the
  // presentation catches up. liveIsNitroEntry is kept as an OR because it also
  // covers any future non-buy path into a pre-revved entry.
  // R10, 2026-07-27: annotated to the union FlameJets declares, so the three
  // route names are checked at the point of derivation rather than widening to
  // `string` and failing at the prop. A typo in a route name is now a type error.
  $: flameColourway = ((liveIsNitroEntry || $selectedBetMode === 'super')
    ? 'nitro'
    : ($selectedBetMode === 'bonus' ? 'overdrive' : 'natural')) as 'natural' | 'overdrive' | 'nitro'
  // Drives the bg crossfade + frame neon hue-shift (Overdrive transition,
  // Motion Polish v2), false again once the 'end' phase starts, so the
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
  // TR-036 option (b) / R2R-R JOB E. Set by FreeSpinsPresentation while the
  // capped retrigger ladder is running; lifts the flame jets above the overlay.
  let retriggerBeatActive = false
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

  /**
   * R2R-R JOB B / TR-035b. Play back a round that was still open at boot.
   *
   * Handed to `recoverSession` as its presentation driver, so the player sees
   * the true outcome of their own interrupted round BEFORE it is settled and
   * the balance moves. Two shapes, because a round is one or the other:
   *
   *   triggered   the full free-spins overlay, the same `presentFeature` a
   *               live trigger uses. A player who reloaded mid-feature gets
   *               the feature, which is the entire reason TR-035b refused to
   *               settle blind.
   *   ordinary    the board, wins and scatter count, mapped exactly as the live
   *               settle block maps them, held long enough to be read. No reel
   *               animation: the reels never spun this session, and animating a
   *               spin that already happened elsewhere would be a re-enactment
   *               rather than a result.
   */
  async function presentRecoveredRound(script: PresentationScript): Promise<void> {
    // Wait for the player to be looking. See resolveSplashesClearedIfDone.
    await splashesCleared
    if (script.triggered) {
      await presentFeature(script)
      return
    }
    const base = script.baseSpin
    const bet = get(betAmount)
    boardSymbols.set(base.board.map((reel) => reel.slice(1, reel.length - 1).map((c) => c.name)))
    activeWins.set(base.wins.map((w) => ({
      symbol: w.symbol, kind: w.kind, ways: w.ways,
      payout: (w.winCentibets / 100) * bet,
    })))
    scatterCount.set(base.scatterCount)
    winAmount.set((script.totalWinCentibets / 100) * bet)
    await new Promise((r) => setTimeout(r, 2200))
  }

  // ── Buy: place a buy-tier spin and present the guaranteed feature ──────────
  // Generic over every buy tier in FS_MODES (today: bonus 100x, super 400x).
  // `mode` comes from whichever card the player ACTIVATEd in the FEATURES menu
  // (threaded through BuyBonus's confirm dispatch - see the on:buy wiring
  // below); it must never be assumed to be 'bonus'.
  async function handleBuy(mode: BetMode = 'bonus'): Promise<void> {
    if ($isSpinning || featureActive) return
    if ($bettingDisabled) return   // R2: no bet may be placed off a live session
    isSpinning.set(true)
    resetWin()
    lastRoundHadFeature = false
    const bet = $betAmount
    // Route through integer micros before this reaches any balance/telemetry
    // math (CLAUDE.md's zero-float-tolerance rule) - a raw `bet * cost` float
    // multiplication (e.g. 0.1 * 400) can land a hair off a clean value, and
    // recordSpinResult's mock-mode balance update does plain float subtraction.
    // ONE cost source, shared with the confirm dialog the player just agreed
    // to and with the FEATURE PRICE line the result banner will show
    // (JOB 3(f) / TR-068). This was five separate copies of the same integer
    // micros expression, which is five chances for the price quoted and the
    // price charged to disagree.
    const costMicros = spinCostMicros(bet, mode)
    const cost = costMicros / CURRENCY_SCALE
    try {
      selectedBetMode.set(mode)
      // Recorded BEFORE the wallet call, so a round that resolves fast cannot
      // reach its celebration before the banner knows what it cost.
      boughtRound.set({ mode, priceMicros: costMicros })
      track({ type: 'buy', tier: mode, costMicros })
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
  // ── THE COMPOSITION'S OWN GEOMETRY, in stage units ─────────────────────────
  //
  // FS_SMALLSCREEN_RECOMPOSE (2026-07-26). Every small-screen scale below is
  // derived from these, so they are stated once here instead of being spelled
  // out again inside each function as a literal.
  //
  // They are not new numbers: they are the numbers this file's own rules already
  // use, read off `.game-frame` (App.svelte's "FRAME, 640x468 at (320,84)"),
  // `.grid-slot` (`left:379px; top:143.5px; width:522px; height:349px`) and
  // `.logo-box`. Each was then CONFIRMED by measuring the rendered element at
  // Desktop, where the scale is a known 1200/1280 = 0.9375:
  //
  //   .game-frame  measured 640.0 x 468.1 at (320.0, 84.1)   against 640x468 at (320,84)
  //   .grid-slot   measured 522.0 x 349.0 at (379.0, 143.5)  against 522x349 at (379,143.5)
  //
  // The frame is horizontally centred in the 1280 stage by construction (320
  // units of margin each side), which is why centring the STAGE also centres the
  // frame and no horizontal offset term is needed anywhere below.
  const FRAME_TOP_Y = 84
  const FRAME_BOTTOM_Y = 552
  const FRAME_H = FRAME_BOTTOM_Y - FRAME_TOP_Y   // 468
  const FRAME_W = 640
  // The desktop title lockup's top edge. Used as the mini profile's crop top so
  // the wordmark stays in the composition at Popout S, which is how the owner's
  // brief describes it ("the height between title and strip").
  const LOGO_TOP_Y = 18
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
  // JOB 3(b), TR-065/TR-069. The constant above is now a FLOOR, not the answer.
  //
  // It has drifted twice: 260 was hand-summed from the component styles and
  // undercounted rendered padding, so it became a measured 290, and by
  // 2026-07-26 the real content-driven height had grown again to ~301, which
  // put 11px of the HUD past the viewport bottom at Mobile M and Mobile S and
  // produced the scrollbar guideline item 15 forbids. Bumping the number a
  // third time would just restart the same clock.
  //
  // So the scale is derived from the slot's ACTUAL content height, measured
  // from the live element, with the constant kept only as a floor for the first
  // frame before any measurement exists. This cannot drift, because nothing is
  // being estimated any more.
  //
  // No feedback loop: the HUD renders at native scale and its content height
  // does not depend on the canvas scale, so one measurement settles it.
  // Measured at Mobile M (375x667) on 2026-07-26, which is why both constants
  // below are now fallbacks rather than answers:
  //
  //   wordmark   assumed 28, actually 42        (14px under)
  //   HUD slot   assumed 290, content needs 287, but .p-hud inside it ran to
  //              y=678 against a 667 viewport   (11px past the bottom)
  //
  // 42 + 287 = 329 needed above the canvas; the old maths reserved 28 + 290 =
  // 318 and handed the canvas 349px where only 338 existed. The 11px overshoot
  // is exactly the scrollbar guideline item 15 forbids.
  // FS_SMALLSCREEN_RECOMPOSE (2026-07-26): the two runtime measurements this block
  // describes, and the element bindings that fed them, are GONE. They existed to
  // reconstruct the canvas box by subtracting chrome from the viewport, and that
  // reconstruction is what went stale and non-deterministically overflowed. The box
  // is now read directly from the element CSS sizes (see the inversion below), so
  // there is nothing left to keep in step and the two constants above survive only
  // as the first-frame estimate, before any box exists to measure.
  // FS_SMALLSCREEN_RECOMPOSE (2026-07-26). The height term used to divide by
  // PORTRAIT_CROP_BOTTOM_Y, i.e. it demanded room for the whole 592-unit crop
  // window measured from stage y=0. But the frame only occupies y=84..552, so
  // 124 of those 592 units (21%) are empty stage: 84 above the frame and 40 of
  // bleed margin below. The height budget was being spent on nothing, and
  // because the two terms are a min(), spending it there is what stopped the
  // WIDTH term from binding at Mobile M and Mobile S. Measured before: the grid
  // reached 79.5% of the viewport width at Mobile M and 65.8% at Mobile S, which
  // is the owner's "reels not filling width" exactly.
  //
  // What must fit is the FRAME, not the decorative stage around it. So the
  // height term divides by FRAME_H, and how much stage is shown is then decided
  // separately by computePortraitCrop() out of whatever height is left over.
  // Deriving the two independently is what lets Mobile M reach the width cap
  // while Mobile L still shows the full decorative window.
  // ── THE BOX COMES FROM THE LAYOUT ENGINE, NOT FROM ARITHMETIC ──────────────
  //
  // FS_SMALLSCREEN_RECOMPOSE (2026-07-26). The height above was computed as
  // (viewport - wordmark - HUD), with both chrome heights measured separately and
  // subtracted. That is two sources of truth for one box, and they disagreed: the
  // subtraction has to be re-run every time either measurement lands, and if a
  // measurement arrives late the canvas has already been sized from a stale one.
  // It failed exactly that way, and NON-DETERMINISTICALLY. Measured on the first
  // draft of this pass: Mobile M produced a 338px canvas on one run and 374px on
  // another from an identical load, and Mobile S overflowed its viewport by 25.5px
  // until a 1px resize nudge corrected it to a 10.5px fit. Five controls including
  // SPIN were pushed off the bottom, which is TR-069's defect class returning by a
  // new route.
  //
  // So the dependency is inverted. `.canvas-slot.portrait` is now `flex: 1 1 0`,
  // which means CSS gives it exactly the space the wordmark and the content-sized
  // HUD leave over, with no arithmetic and nothing to go stale. This code then
  // MEASURES that box and picks a scale to fill it. Two consequences worth having:
  //
  //   the canvas can never push a control off screen, because it is physically
  //   incapable of being taller than the box flex handed it; and
  //
  //   if the HUD grows mid-round, flex shrinks the box in the same frame, so the
  //   worst case is one frame of slightly-too-large stage inside a correct box
  //   (clipped as decoration) rather than a control moving out of reach.
  //
  // This is what "measure the real available box" in the brief has to mean: read
  // the box, do not reconstruct it.
  let canvasSlotEl: HTMLElement | null = null
  let measuredSlotH = 0
  function portraitAvailableCanvasH(): number {
    if (measuredSlotH > 0) return measuredSlotH
    // First frame only, before the box exists to be read. Deliberately the
    // conservative estimate: it is better to open too small for one frame and
    // grow than to overshoot and clip a control.
    return Math.max(window.innerHeight - PORTRAIT_WORDMARK_H - PORTRAIT_HUD_MIN_H, 1)
  }
  function computePortraitCanvasScale(): number {
    if (typeof window === 'undefined') return 1
    const widthBasedScale = (0.96 * window.innerWidth) / GRID_SPEC_W
    const heightBasedScale = portraitAvailableCanvasH() / FRAME_H
    return Math.min(widthBasedScale, heightBasedScale)
  }
  /**
   * How much of the stage's vertical extent to show, from where, and where to sit
   * it inside the box.
   *
   * The crop window grows from the bare frame (468 units) up to the full portrait
   * window (592) depending on how much of the box the scale leaves spare, and it
   * is positioned to keep the frame CENTRED both inside the window and inside the
   * box. That is what makes the composition read as composed at every height
   * rather than jammed against the top: at Mobile L the window opens to the full
   * 592 with the frame centred in it, at Mobile M to about 490, and at Mobile S it
   * closes down to the frame itself.
   *
   * Nothing here is hidden by the crop except decorative background. Every
   * interactive control is a native-DOM element BELOW the canvas, so no control is
   * ever inside this window, and the layout gate proves that separately by
   * measuring each control against its clipping ancestors.
   */
  function computePortraitCrop(scale: number): { cropH: number, cropTop: number, offsetY: number } {
    if (typeof window === 'undefined') return { cropH: PORTRAIT_CROP_BOTTOM_Y, cropTop: 0, offsetY: 0 }
    const boxH = portraitAvailableCanvasH()
    const showable = boxH / Math.max(scale, 0.0001)
    const cropH = Math.min(Math.max(showable, FRAME_H), PORTRAIT_CROP_BOTTOM_Y)
    // Centre the frame in the window, but never start above the stage's own top.
    const cropTop = Math.min(Math.max(FRAME_TOP_Y - (cropH - FRAME_H) / 2, 0), FRAME_TOP_Y)
    // Where the width term binds, the crop window can be shorter than the box (at
    // Mobile L by about 21px). Centring the window in the box turns that into
    // symmetric breathing room instead of a seam along one edge.
    const offsetY = Math.max((boxH - cropH * scale) / 2, 0) - cropTop * scale
    return { cropH, cropTop, offsetY }
  }
  /** Read the box CSS produced, and rescale to fill it if it has changed. */
  function remeasurePortraitBox(): void {
    if (!portrait || !canvasSlotEl) return
    const h = canvasSlotEl.clientHeight
    if (h > 0 && Math.abs(h - measuredSlotH) > 0.5) {
      measuredSlotH = h
      portraitCanvasScale = computePortraitCanvasScale()
      portraitCrop = computePortraitCrop(portraitCanvasScale)
    }
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

  // ── MINI-PLAYER, R2R-R JOB C / TR-043 (2026-07-26) ─────────────────────────
  //
  // Stake's mini-player popout is 400x225. Until now that fell into the
  // COMPACT LANDSCAPE profile, which is a 76px strip carrying seven controls in
  // one row: menu, balance, win, bet with two steppers, turbo, AUTO, MAX and
  // SPIN. Round-two reviewer 3 looked at the committed capture and described
  // the result exactly: "the balance and bet fields compressed into overlapping
  // vertical fragments, an unlabeled feature control and collisions across the
  // bottom bar".
  //
  // The compact strip is not wrong; it is a phone-landscape layout being asked
  // to do a job three times smaller than it was drawn for. 76px of a 225px
  // viewport is a third of the screen before a single control is placed, and
  // seven controls in 400px leaves about 50px each including the stats.
  //
  // So this is a DEDICATED PROFILE rather than the compact strip scaled down,
  // which is what the brief asked for and what the finding requires. What
  // changes, and why each:
  //
  //   the strip is 44px, not 76      one row of 44px targets, no stacked
  //                                  label-over-value, which is what was
  //                                  overlapping
  //   four controls, not seven       menu, bet steppers and SPIN stay because
  //                                  they are the only ones a player must reach
  //                                  to play; turbo, AUTO and MAX move into the
  //                                  menu, which already exists and already
  //                                  holds the paytable, session and audio
  //   stats read inline              BAL and WIN render as one line each with
  //                                  the label inline rather than above, so
  //                                  nothing is stacked in 44px
  //   SPIN stays >=44px              it is the one control that must never
  //                                  shrink, and it is why the others moved
  //
  // The breakpoint is BOTH dimensions. A 400px-wide portrait phone is not a
  // mini-player and must not get this layout; the popout is defined by being
  // small in both directions at once.
  const MINI_WIDTH_BREAKPOINT = 480
  const MINI_HEIGHT_BREAKPOINT = 300
  const MINI_STRIP_H = 44
  function computeMiniPlayer(): boolean {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= MINI_WIDTH_BREAKPOINT && window.innerHeight <= MINI_HEIGHT_BREAKPOINT
  }
  // ── POPOUT S RECOMPOSITION, FS_SMALLSCREEN_RECOMPOSE (2026-07-26) ──────────
  //
  // The owner's capture (reports/screens/live-round2-2026-07-26/
  // 08_DEFECT_popout_s_stage_small_and_right_anchored.png) shows the stage small
  // and hard right-anchored with the left of the frame empty. Both halves of that
  // were real and both are fixed here and in the CSS below.
  //
  // THE ANCHORING was not a scale problem at all. `.canvas-inner.mini-player`
  // omitted the `width:1280px; height:720px` pair that `.canvas-inner.portrait`
  // and `.canvas-inner.compact-landscape` both carry, so the base rule's
  // `width:100%` resolved against the 400px slot and the element's box was 400x181
  // rather than the 1280x720 the stage's children are positioned in. That makes
  // `translateX(-50%)` translate by 200px where centring the stage needs 640px, so
  // the whole composition sat (640-200)*scale to the right: 440 * 0.2514 =
  // 110.6px, measured at exactly +110.6px. The fix is the missing declaration,
  // in the CSS below. Derived from the stylesheet first, then confirmed.
  //
  // THE SCALE is fixed here. It divided the full 1280-unit stage width and the
  // full 720-unit height, so the frame got 40.2% of the viewport width while over
  // half the frame's own width budget went to scene art that is decorative. What
  // has to fit is the frame (640 wide) and the crop window from the title down to
  // the frame's bottom edge; the scene either side is clipped as bleed, exactly as
  // it already is on desktop via `.stage`.
  // TITLE: DROP, the owner's ruling, FS_V5_CLOSEOUT (2026-07-27). The
  // recomposition session recorded both numbers and left the call open: keeping
  // the title in frame gives a 44.2% grid fill, dropping it and cropping to the
  // frame alone gives 50.5%, a frame 247px wide against 217px. The owner has
  // taken the second. This is the one-constant change that session named.
  const MINI_CROP_TOP_Y = FRAME_TOP_Y                       // 84, crops to the frame, title dropped
  const MINI_CROP_H = FRAME_BOTTOM_Y - MINI_CROP_TOP_Y      // 468, exactly FRAME_H
  function computeMiniCanvasScale(): number {
    if (typeof window === 'undefined') return 1
    const availH = Math.max(window.innerHeight - MINI_STRIP_H, 1)
    return Math.min(window.innerWidth / FRAME_W, availH / MINI_CROP_H)
  }
  /**
   * The mini crop window, and the honest note about what "fill" can mean here.
   *
   * At Popout S the available box is 400 x 181, an aspect of 2.21:1, and the
   * content is the frame at 1.37:1. The height therefore binds and no centred,
   * undistorted composition can also fill the width. With the title dropped the
   * arithmetic gives 181/468 = 0.3868, a frame 247.5px wide, 61.9% of the
   * viewport, against 54.2% with the title kept and 40.2% before the
   * recomposition. The side margins that remain are inherent to the aspect
   * mismatch and are not dead space to be recovered.
   *
   * The title is dropped at THIS PROFILE ONLY. Every other preset keeps it: the
   * mini player is the one place where 18 stage units of wordmark cost 7.7
   * percentage points of grid, because it is the only profile whose height
   * budget is this tight. Reverting is the same one constant, back to
   * LOGO_TOP_Y.
   */
  function computeMiniCrop(): { cropH: number, cropTop: number } {
    return { cropH: MINI_CROP_H, cropTop: MINI_CROP_TOP_Y }
  }

  function computeCompactLandscape(): boolean {
    if (typeof window === 'undefined') return false
    // Mini-player takes precedence: it is a strictly smaller case, and letting
    // both be true would leave the two strips fighting over the same slot.
    if (computeMiniPlayer()) return false
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
  let miniPlayer = computeMiniPlayer()
  let miniCanvasScale = computeMiniCanvasScale()
  // The crop window is derived from the scale, so it is recomputed everywhere the
  // scale is, and never stored independently of it.
  let portraitCrop = computePortraitCrop(portraitCanvasScale)
  let miniCrop = computeMiniCrop()

  // FS VISUAL FIXPACK JOB 4: what the shared .fs-scrim class divides by.
  //
  // A `transform` makes an element the containing block for its position:fixed
  // DESCENDANTS, so every scrim inside .game-wrapper is anchored to the wrapper
  // rather than to the viewport wherever the wrapper is scaled. The scrim
  // therefore has to be sized in the wrapper's own pre-scale units, which is the
  // viewport divided by the scale.
  //
  // This is NOT the same as --S, and using --S here would be wrong: the three
  // native-HUD modes set `transform: none` on the wrapper while --S keeps its
  // computed value, so a scrim in portrait would be divided by a scale that is
  // not being applied to it. This variable is 1 exactly when the wrapper carries
  // no transform, which is the condition that actually matters.
  $: scrimScale = (portrait || compactLandscape || miniPlayer) ? 1 : S
  function handleResize(): void {
    S = computeS()
    portrait = computePortrait()
    portraitCanvasScale = computePortraitCanvasScale()
    portraitCrop = computePortraitCrop(portraitCanvasScale)
    compactLandscape = computeCompactLandscape()
    compactCanvasScale = computeCompactCanvasScale()
    miniPlayer = computeMiniPlayer()
    miniCanvasScale = computeMiniCanvasScale()
    miniCrop = computeMiniCrop()
    // The box is about to be re-laid out by CSS at the new viewport, so the value
    // read from the old one is worthless. Dropping it means the next observation
    // is used as-is rather than being compared against a stale number.
    measuredSlotH = 0
    remeasurePortraitBox()
  }

  // Watch the CANVAS SLOT, which is the box being filled. Watching it rather than
  // the HUD is the point of the inversion above: whatever changes the space
  // available to the stage (the HUD growing a feature strip mid-round, a longer
  // translated label wrapping, an orientation change, the address bar collapsing)
  // reaches this one observer as a change in the box itself, so none of those
  // causes needs its own listener and none can be forgotten.
  let canvasSlotObserver: ResizeObserver | null = null
  $: if (canvasSlotEl && typeof ResizeObserver !== 'undefined' && !canvasSlotObserver) {
    canvasSlotObserver = new ResizeObserver(() => remeasurePortraitBox())
    canvasSlotObserver.observe(canvasSlotEl)
  }
  onDestroy(() => { canvasSlotObserver?.disconnect(); canvasSlotObserver = null })

  onMount(async () => {
    // ── BUILD PROVENANCE, JOB 4 / TR-062 ───────────────────────────────────
    //
    // One line, first thing, in every mode including replay.
    //
    // The published bundle was once a commit behind main and nothing in the
    // artefact said so: "what is live" had to be established by grepping the
    // shipped JavaScript for em dashes. This makes the question answerable by
    // opening the console, and `dist/build-info.json` answers it for anyone
    // reading the artefact instead.
    //
    // The values are INLINED by Vite's `define`, not fetched. A runtime fetch
    // of build-info.json would have been the obvious way to print this and
    // would have added a request to every session, which is precisely what the
    // ruling has the network-hygiene gate assert against.
    console.info(
      `Future Spinner build ${__BUILD_COMMIT__.slice(0, 8)}`
      + `${__BUILD_CLEAN__ ? '' : ' (uncommitted changes)'} built ${__BUILD_AT__}`,
    )

    // Skip all RGS initialisation in replay mode, ReplayMode handles its own flow
    if (isReplay) return

    const params  = new URLSearchParams(window.location.search)
    // R2R blocker 1. The OFFICIAL launch sends `sessionID`; only `session` was
    // read here, so a real launch fell through to the dev token, failed to
    // authenticate, and the R2 live guard then correctly refused to take a bet.
    // The game was dead on arrival on an official URL. `session` is kept as a
    // legacy fallback, and the order matches parseSessionParams so the token
    // read and the guard below cannot disagree about which launch this is.
    const token   = params.get('sessionID') ?? params.get('session') ?? 'dev-mock-token'
    const gameId  = 'future_spinner'

    await initRGS(gameId, token)
    // isLoading is cleared inside initRGS's finally block

    // R2/TR-010, 2026-07-25. MOCK CONTAINMENT.
    //
    // rgsService sets _rgsMode = false on a real authenticate failure as well as
    // on the dev no-params case, and spin() falls through to _mockSpin() in both.
    // A production player whose session failed to authenticate would therefore
    // have been served the mock: fabricated boards, fabricated wins, a balance
    // moving on screen and nothing reaching the wallet. The file is locked, so
    // the fallthrough is made unreachable rather than removed: betting is
    // enabled only when we can positively establish a live session.
    evaluateLiveGuard(
      (params.get('sessionID') !== null || params.get('session') !== null) && params.get('rgs_url') !== null,
      Boolean(get(errorMessage)),
      import.meta.env.DEV,
    )

    // R11/TR-017, 2026-07-25. SESSION RECOVERY.
    // authenticate reports an in-progress round and initRGS discards it, so a
    // player who reloaded mid-round came back to a fresh game while the RGS
    // still held their open round. On a pending_end round that is money sitting
    // uncollected. Only attempted on a session we have already accepted as live.
    if (!get(bettingDisabled)) {
      // R2R-R JOB B / TR-035b, re-ruled: RESUME AND SETTLE. The round is
      // replayed through the canonical interpreter so the player sees their own
      // outcome, then settled, then one plain banner. presentRecoveredRound is
      // the playback driver; there is no forfeit path.
      await recoverSession(import.meta.env.DEV, undefined, presentRecoveredRound)
    }
    playBGM()

    // Background is now static graded stills (video retired); the Overdrive
    // variant crossfades via the .bg-still.overdrive.active CSS class.

    // Preload the Overdrive gauge images so they're already decoded before
    // the transition fires, mounting them cold (large PNGs, decoded on
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
      // R8/TR-016: re-checked at FIRE time, not only at schedule time. A player
      // can open the buy dialog, the session panel or a reality check during the
      // pause, and autoplay used to spin straight through it. A reality check in
      // particular exists to be acknowledged, so spinning underneath it defeats
      // the control entirely. Re-arm rather than cancel, so autoplay resumes by
      // itself once the surface is dismissed.
      if (get(anyModalOpen)) { scheduleAutoSpin(delayMs); return }
      handleSpin()
    }, delay)
  }

  // ── Anticipation demo, DEV only ──────────────────────────────────────────
  // ?anticipationDemo=3|4|5 plays the scatter build with that many scatters and
  // NOTHING else: no wallet call, no round, no bonus entry. ?anticipationDemo=1
  // cycles 2,3,4,5 on successive presses so the whole ladder can be compared
  // back to back.
  //
  // This exists because the obvious way to watch the sequence, ?mockCategory=
  // trigger_5, pins every round to the curated trigger and drops you into the
  // bonus on every spin, which is precisely when you cannot see the build. It
  // also does not control the symbols the grid animates: the mock generates a
  // RANDOM board, so mockCategory sets the round's events while the reels show
  // something else entirely.
  const _antDemo = import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get('anticipationDemo')
    : null
  const _antCycle = [2, 3, 4, 5]
  let _antIndex = 0
  function _antDemoBoard(): string[][] {
    const n = _antDemo === '1' || _antDemo === 'cycle'
      ? _antCycle[_antIndex++ % _antCycle.length]
      : Math.max(0, Math.min(5, Number(_antDemo) || 0))
    // One scatter per reel from the left, which is how the shipped books place
    // them in all but 0.5% of rounds.
    return Array.from({ length: 5 }, (_, reel) =>
      Array.from({ length: 4 }, (_, row) => (reel < n && row === 0 ? 'S' : 'L3')))
  }

  async function handleSpin() {
    if ($isSpinning || featureActive) return
    if ($bettingDisabled) return   // R2: no bet may be placed off a live session

    if (import.meta.env.DEV && _antDemo) {
      // Choreography only. Returns before anything touches the wallet, the RGS
      // or the feature presentation.
      isSpinning.set(true)
      await gridRef?.animateSpin(_antDemoBoard())
      isSpinning.set(false)
      return
    }
    // Standing mode for normal spins (Normal/Cruise) plus the OVERBOOST
    // enhancer toggle - both live in the one standingMode store (FeatureMenu's
    // selectStanding()/toggleEnhancer() write it; see betMode.ts). The locked
    // canSpin guard only ever checks affordability of the 1x base bet, so any
    // >1x mode (OVERBOOST, 1.25x) needs its own affordability guard here,
    // before the spin lock engages - mirrors handleBuy's per-tier cost.
    const mode = $standingMode
    const bet  = $betAmount
    const costMicros = spinCostMicros(bet, mode)
    const cost = costMicros / CURRENCY_SCALE
    if (cost > bet && $balance < cost) return
    isSpinning.set(true)   // disable spin button immediately, before async work begins
    resetWin()
    lastRoundHadFeature = false
    // This round was not bought, so the result banner carries no price line.
    // Cleared on the next SPIN rather than on banner dismissal: see
    // stores/boughtRound.ts for why the lifetime is tied to the round rather
    // than to whichever of the two WinBanner instances raised the celebration.
    boughtRound.set(null)
    selectedBetMode.set(mode)
    lastRoundEvents.set(null)   // clear any prior round before this spin publishes

    track({ type: 'spin', costMicros })

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
      // MaxWinCelebration is already showing (reactive to $isWincap), wait for
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
        // Stop auto-play immediately on wincap, player must manually collect
        if ($autoPlayCount <= 0 || $isWincap || rg.stop) {
          isAutoPlay.set(false)
          autoPlayCount.set(0)
        } else {
          const multiplier = bet > 0 ? win / bet : 0
          if (multiplier >= 100) {
            // Epic win, stop autoplay entirely
            isAutoPlay.set(false)
            autoPlayCount.set(0)
          } else if (multiplier >= 30) {
            scheduleAutoSpin(6000)   // Mega win, pause 6 seconds
          } else if (multiplier >= 10) {
            scheduleAutoSpin(3500)   // Big win, pause 3.5 seconds
          } else if (multiplier > 0) {
            scheduleAutoSpin(1500)   // Small/medium win, pause 1.5 seconds
          } else {
            scheduleAutoSpin(800)    // Dead spin, continue at normal pace
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
    // Normal-play branch only, never drive a spin in replay mode.
    if (isReplay) return
    if (e.code !== 'Space' && e.key !== ' ') return

    // Let space behave normally while typing in a field.
    const el = document.activeElement as HTMLElement | null
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
      return
    }

    // Let space behave normally (for example scrolling the modal) while a
    // modal or overlay is open.
    //
    // R8/TR-016 (2026-07-25): the named list below covers only the surfaces
    // App.svelte can actually see. Every blocking surface whose open state is
    // COMPONENT-LOCAL was missing, because a local `let` in another component
    // cannot be named from here: the buy confirm dialog, the FEATURES menu, the
    // autoplay menu, the HUD menu, the session panel and the reality check.
    // Spacebar span the reels underneath all six. `$anyModalOpen` is the shared
    // registration those surfaces now write to, so a new modal suppresses the
    // spacebar by announcing itself rather than by being added to this line.
    if ($bettingDisabled) return
    // R2R follow-up, 2026-07-26. The official `disabledSpacebar` flag was
    // derived onto rgJurisdiction and had ZERO consumers: the flag was right
    // and the spacebar span the reels anyway, in exactly the markets that ban
    // it. That is the R7/TR-015 shape reproduced, and this is the reader it was
    // missing. Nothing else changes: the spin BUTTON stays available, because
    // the flag bans the key, not the bet.
    if ($rgJurisdiction.spacebarDisabled) return
    if ($anyModalOpen) return
    if ($showPaytable || showThemeSelector || $isWincap || featureActive || showIntroSplash || showHeroSplash) return

    // From here we own the spacebar: stop the page from scrolling.
    e.preventDefault()

    // Respect the same guard the spin button uses.
    if ($canSpin) handleSpin()
  }

</script>

<svelte:head>
  <title>{$activeTheme.name} - We Roll Spinners</title>
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
        class:route-natural={overdriveVisualActive && flameColourway === 'natural'}
        class:nitro-active={overdriveVisualActive && flameColourway === 'nitro'}
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
    <!-- Static image background, all other themes; video is NOT in DOM -->
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
  <!-- Replay mode, no betting controls, balance, autoplay, or theme selector -->
  <ReplayMode />
{:else}
<!-- Stage clips the viewport and centres the fixed 1280x720 design surface,
     scaled by S so it never overflows or clips at small popout sizes. -->
<div class="game-stage">
<main
  class="game-wrapper"
  class:portrait
  class:compact-landscape={compactLandscape}
  class:mini-player={miniPlayer}
  class:shake={shakeActive}
  style="
    --theme-primary: {$activeTheme.palette.primary};
    --theme-secondary: {$activeTheme.palette.secondary};
    --theme-bg: {$activeTheme.palette.background};
    --S: {S};
    --scrim-scale: {scrimScale};
  "
>
  <!-- Max win overlay, requires explicit COLLECT click; sits below LoadingScreen (z200) -->
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
    <!-- PORTRAIT WORDMARK. OWNER AUDIT ROUND 4, item 6 (2026-07-26): portrait
         now uses the SAME wordmark lockup as desktop, scaled to the portrait
         top zone. This deliberately REVERSES the 2026-07-14c grid-first
         decision, which rendered plain Orbitron text here and explicitly
         excluded the lockup image from portrait; the owner ruled the plain
         text reads as unbranded beside the desktop treatment.
         Still native-DOM and never stage-scaled, so it costs the canvas no
         vertical space beyond its own box. Text fallback retained for a failed
         image load, mirroring the desktop lockup's own on:error behaviour. -->
    <div class="portrait-wordmark">
      {#if portraitLogoFailed}
        <span class="portrait-wordmark-text">{$activeTheme.name}</span>
      {:else}
        <img
          class="portrait-wordmark-img"
          src="{$themeAssets.logo}"
          alt="{$activeTheme.name}"
          draggable="false"
          on:error={() => { portraitLogoFailed = true }}
        />
      {/if}
    </div>
  {/if}

  <!-- CANVAS SLOT, the fixed 1280x720 design surface (frame/grid, plus
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
    bind:this={canvasSlotEl}
    class="canvas-slot"
    class:portrait
    class:compact-landscape={compactLandscape}
    class:mini-player={miniPlayer}
    style={portrait ? '' : miniPlayer ? `height:${miniCrop.cropH * miniCanvasScale}px` : compactLandscape ? `height:${STAGE_H * compactCanvasScale}px` : ''}
  >
    <div
      class="canvas-inner"
      class:portrait
      class:compact-landscape={compactLandscape}
      class:mini-player={miniPlayer}
      style={portrait ? `top:${portraitCrop.offsetY}px; transform: translateX(-50%) scale(${portraitCanvasScale})` : miniPlayer ? `top:${-miniCrop.cropTop * miniCanvasScale}px; transform: translateX(-50%) scale(${miniCanvasScale})` : compactLandscape ? `transform: translateX(-50%) scale(${compactCanvasScale})` : ''}
    >
      {#if !portrait}
        <!-- LOGO, top centre, 380 wide, y 18 (z70). Desktop/landscape only:
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

      <!-- R2/TR-010: a blocked session must SAY SO. Silently disabling the spin
           button would look like a bug and invite reloading into the same
           state. This is deliberately non-dismissible: there is no safe way to
           continue, and it is a full-width banner rather than a modal so it
           cannot be mistaken for something the player is meant to close. -->
      {#if $bettingDisabled}
        <div class="live-guard-banner" role="alert" data-testid="live-guard-banner">
          {$tr('errSessionUnavailable')}
        </div>
      {/if}

      <!-- R2R-R JOB B / TR-035b. ONE plain banner, after a round that was still
           open at boot has been replayed and settled. Unlike the live-guard
           banner above it IS dismissible, because nothing is wrong: the round
           finished, the balance is correct, and the player is free to carry on.
           A non-dismissible notice would imply an unresolved problem. -->
      {#if $recoveryBannerVisible}
        <div class="recovery-banner" role="status" data-testid="recovery-banner">
          <span>{$tr('recoveryResumed')}</span>
          <button type="button" class="recovery-banner-close" on:click={dismissRecoveryBanner}
                  aria-label={$tr('recoveryDismiss')}>×</button>
        </div>
      {/if}

      <!-- SCENE GROUP, left, set further back (z8), future-spinner only.
           Desktop/landscape only (2026-07-14c): portrait's brief explicitly
           excludes the car/pilot/billboard scene - the grid is the whole
           composition there, backdrop filling behind via the document-level
           .bg-still-container (unaffected either way, since that's outside
           .game-wrapper entirely). -->
      {#if $activeTheme.id === 'future-spinner' && !portrait}
        <SceneGroup haze={hazeLevel} />
      {/if}

      <!-- FRAME, 640x468 at (320,84), z10. Neon hue-shifts during Overdrive
           (Motion Polish v2), reversed once overdriveVisualActive clears. -->
      {#if $themeAssets.frame}
        <img
          src="{$themeAssets.frame}"
          class="game-frame"
          class:overdrive-active={overdriveVisualActive}
          class:route-natural={overdriveVisualActive && flameColourway === 'natural'}
          class:nitro-active={overdriveVisualActive && flameColourway === 'nitro'}
          alt=""
          aria-hidden="true"
          on:error={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      {/if}

      <!-- OVERDRIVE FLAME JETS, 8 frame-edge jets (v3.4), ignite on Overdrive -->
      {#if $activeTheme.id === 'future-spinner'}
        <!-- TR-036 option (b): the free-spins overlay sits at z80 and its
             backdrop is nearly opaque at the frame edge, where the jets live.
             During the capped retrigger ladder the jets are lifted above it, so
             the build the player is being shown is actually visible. Without
             this the whole feature would be correct and invisible, which is the
             failure mode the dead-wiring gate exists for and which a store
             assertion alone would not have caught. -->
        <div class="jets-holder" class:above-overlay={retriggerBeatActive}>
          <FlameJets active={overdriveVisualActive || retriggerBeatActive} colourway={flameColourway} />
        </div>
      {/if}

      <!-- GLOBAL GRADE (TR-027). A blended overlay rather than a filter, on
           purpose. `.tile-inner` already carries a filter chain during scatter
           anticipation, driven by the escalation ramp; a second filter on the
           same element MULTIPLIES rather than blends and would look wrong during
           the sequence just signed off. An overlay composites instead, costs one
           compositor layer, and sits at z40: above the backdrop, scene, frame and
           grid, below the HUD at z50, so it unifies the ART without tinting the
           readouts. -->
      {#if grade.strength > 0}
        <div
          class="global-grade"
          data-testid="global-grade"
          data-grade={_gradeKey}
          style="background: {grade.colour}; opacity: {grade.strength}; mix-blend-mode: {grade.blend};"
          aria-hidden="true"
        ></div>
      {/if}

      <!-- GRID, 522x349, centred inside the frame, z20 -->
      <div class="grid-slot">
        <div class="grid-scale">
          <GameGrid bind:this={gridRef} idleAttract={idleAttractActive} />
          <!-- Suppress standard celebration while the max-win overlay is active -->
          <WinCelebration winMultiplier={$isWincap ? 0 : $winMultiplier} />
          <!-- Ways breakdown, cycles group by group after the win burst settles -->
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
            onRetriggerBeat={(on) => { retriggerBeatActive = on }}
            on:complete={onFeatureComplete}
          />
        </div>
      </div>

      <!-- BANNER, full-width neon band, edge to edge across the stage, z100 -->
      <WinBanner suppressed={lastRoundHadFeature} />

      <!-- FEATURE-END CELEBRATION, WIN BANNER V3 reuse (OWNER AUDIT ROUND 2,
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

      <!-- BONUS INSTRUMENT COLUMN, Overdrive only. Landscape/desktop
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

      <!-- FEATURES trigger, desktop landscape only here (stays pinned
           beside the frame in the 1280x720 coordinate space); portrait and
           compact-landscape each render their own native-scale trigger in
           .native-hud-slot below. -->
      {#if !portrait && !compactLandscape && !miniPlayer && $activeTheme.id === 'future-spinner' && !featureActive}
        <FeatureMenu idleAttract={idleAttractActive} on:buy={(e) => buyBonusRef?.openConfirm(e.detail)} />
      {/if}

      <!-- HUD OVERLAY, desktop landscape only here; portrait and
           compact-landscape each render their own native-DOM instance in
           .native-hud-slot below. -->
      {#if !portrait && !compactLandscape && !miniPlayer}
        <HudOverlay on:spin={handleSpin} on:slam={() => { if (!$rgJurisdiction.slamStopDisabled) gridRef?.slamStop() }} />
      {/if}
    </div>
  </div>

  {#if portrait || compactLandscape || miniPlayer}
    <!-- NATIVE HUD SLOT, native DOM scale, never stage-scaled (2026-07-14
         portrait pass; 2026-07-14b extends it to compact-landscape). Sits
         below the canvas slot in normal flow; FeatureMenu/HudOverlay each
         get a `portrait` or `compactLandscape` prop so their own CSS
         renders the matching native-scale composition instead of the
         LAYOUT_SPEC absolute positions. -->
    <div class="native-hud-slot" class:portrait class:compact-landscape={compactLandscape} class:mini-player={miniPlayer}>
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
        <FeatureMenu {portrait} {compactLandscape} {miniPlayer} idleAttract={idleAttractActive} on:buy={(e) => buyBonusRef?.openConfirm(e.detail)} />
      {/if}
      <HudOverlay {portrait} {compactLandscape} {miniPlayer} on:spin={handleSpin} on:slam={() => { if (!$rgJurisdiction.slamStopDisabled) gridRef?.slamStop() }} />
    </div>
  {/if}

  <!-- Bonus Buy, modal/confirm logic only; its own trigger button is
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
          <!-- Reel choreography toggle, dev-only eye test (drop is the
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
.native-hud-slot.mini-player { flex-direction: row; align-items: center; gap: 4px; padding: 0 4px; }

  .jets-holder { position: absolute; inset: 0; pointer-events: none; }
  /* Above the free-spins overlay (z80) only while the retrigger beat runs. */
  .jets-holder.above-overlay { z-index: 90; }

  .live-guard-banner {
    position: fixed; left: 0; right: 0; top: 0; z-index: 9000;
    padding: 14px 18px; text-align: center;
    font-family: 'Orbitron', monospace; font-size: 13px; line-height: 1.45;
    color: #ffe6e6; background: rgba(96, 10, 16, 0.97);
    border-bottom: 2px solid rgba(255, 90, 90, 0.75);
    text-wrap: balance;
  }

  /* R2R-R JOB B / TR-035b. Same slot and same shape as the live-guard banner,
     deliberately cooler in colour: this is information, not an error. The
     live-guard banner is red because the session is unusable; this one is cyan
     because the round completed correctly and the player has lost nothing. */
  .recovery-banner {
    position: fixed; left: 0; right: 0; top: 0; z-index: 9000;
    display: flex; align-items: center; justify-content: center; gap: 14px;
    padding: 14px 18px; text-align: center;
    font-family: 'Orbitron', monospace; font-size: 13px; line-height: 1.45;
    color: #dffbff; background: rgba(6, 46, 58, 0.97);
    border-bottom: 2px solid rgba(0, 255, 255, 0.55);
    text-wrap: balance;
  }
  .recovery-banner-close {
    flex: 0 0 auto;
    width: 26px; height: 26px; line-height: 1;
    font-size: 18px; font-family: inherit;
    color: #dffbff; background: rgba(0, 255, 255, 0.12);
    border: 1px solid rgba(0, 255, 255, 0.45); border-radius: 4px;
    cursor: pointer;
  }
  .recovery-banner-close:hover { background: rgba(0, 255, 255, 0.22); }

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
  .global-grade {
    position: absolute;
    inset: 0;
    z-index: 40;          /* above art (frame 10, grid 20, character 30), below HUD (50) */
    pointer-events: none;
  }

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

  /* Screen shake, feature trigger and 50x+ wins (Motion Polish v2). The
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
  .game-wrapper.compact-landscape.shake,
  .game-wrapper.mini-player.shake { animation: screen-shake-portrait 0.42s ease-in-out; }

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
  .game-wrapper.compact-landscape,
  .game-wrapper.mini-player {
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
    /* JOB 3(b). The slot is a fixed viewport onto the 1280x720 stage, and the
       scene deliberately bleeds past it (car-layer and char-layer extend beyond
       the frame by design, which is what gives the background its depth).
       Desktop already clips that bleed via .stage's own overflow:hidden; the
       native-HUD modes had no equivalent, so at Popout S the bleed made the
       slot 403px wide inside a 400px viewport and the wrapper scrolled
       sideways.
       This is NOT the forbidden "hide the overflow to fake a fit": what is
       being clipped is decorative background, and the layout gate proves it by
       asserting separately that every interactive control lies inside its
       clipping ancestor. A control pushed out here would fail that assertion,
       clipped or not. */
    overflow: hidden;
  }
  .canvas-slot.compact-landscape {
    flex: 0 0 auto;
    /* height set inline per-frame (STAGE_H * compactCanvasScale) */
  }
  .canvas-slot.mini-player {
    flex: 0 0 auto;
    /* height set inline per-frame (STAGE_H * miniCanvasScale) */
  }
  .canvas-inner.mini-player {
    position: absolute; left: 50%; top: 0;
    /* THE 1280x720 COORDINATE SPACE. FS_SMALLSCREEN_RECOMPOSE (2026-07-26).
       These two declarations were missing, and their absence was the whole of the
       Popout S right-anchoring. The stage's children (.game-frame at 320,84,
       .grid-slot at 379,143.5) are positioned in stage units against THIS box, so
       when the base .canvas-inner rule's `width:100%` resolved against the 400px
       slot instead, the box became 400x181 and `translateX(-50%)` translated by
       200px where centring the stage needs 640px. The composition sat
       (640-200)*0.2514 = 110.6px right of centre, measured at exactly +110.6px.
       The portrait and compact-landscape rules below always carried the pair; the
       mini profile was added later (TR-043) and did not, which is why desktop,
       portrait and compact-landscape all centred correctly and only the popout
       did not. Kept adjacent to that rule deliberately so the three cannot drift
       apart again. */
    width: 1280px;
    height: 720px;
    transform-origin: top center;
    /* top and transform set inline per-frame: top is -cropTop*scale, so the crop
       window's top edge lands on the slot's top edge. */
  }
  .canvas-slot.portrait {
    /* FS_SMALLSCREEN_RECOMPOSE (2026-07-26). This was `flex: 0 0 auto` with its
       height set inline from the layout maths, which made the box a COMPUTED
       value that had to be kept in step with two separately-measured chrome
       heights. It could not be, reliably: an identical load produced a 338px
       canvas on one run and 374px on another, and Mobile S overflowed by 25.5px
       until a resize nudge corrected it, pushing SPIN and four other controls off
       the bottom.
       `flex: 1 1 0` makes the box whatever the wordmark and the content-sized HUD
       leave over, decided by the layout engine in the same pass that lays them
       out. There is no second number to keep in step, and the stage physically
       cannot be taller than the box it was given. The script MEASURES this box and
       picks a scale to fill it, which is the one direction that cannot go stale.
       The height still shows less than canvas-inner's logical 720 (2026-07-14c):
       SceneGroup and the desktop logo are not rendered in portrait, so the stage
       below the frame's bleed margin is empty, and the crop window sizes and
       centres itself on the frame instead of reserving a dead band for nothing. */
    flex: 1 1 0;
    height: auto;
    min-height: 0;
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
    /* CONTENT-SIZED, not stretched. FS_SMALLSCREEN_RECOMPOSE (2026-07-26).
       This was `flex: 1 1 auto`, which made the slot absorb every spare pixel in
       the viewport; HudOverlay's `.p-hud` is itself flex:1 with
       justify-content:space-between, so that surplus was distributed INTO the HUD
       as a gap between the stats/bet group and the controls row. The gap was
       therefore (viewportH - wordmark - canvas - hudContent), which grows 1.000px
       for every extra px of viewport height once the canvas is width-bound:
       measured 30.8px at 425x812, 118.8 at 900, 249.8 at 1031 and 618.8 at 1400,
       a slope of exactly 1.000. That is the owner's "roughly 250px dead band
       between BET and the controls" at Mobile L, and it reconciles their figure
       with this machine's 30.8px: the platform's Screen preset sets the WIDTH and
       the window supplies the height, so their Mobile L was about 1031px tall.
       Content-sizing the slot makes the hole structurally impossible rather than
       merely smaller, and any genuine surplus now collects after the HUD as
       bottom padding, which is what this region's own 2026-07-14c comment said
       was intended all along.
       It is also what lets the canvas slot below be measured honestly. A stretching
       HUD and a stretching canvas cannot both be sized from the same leftover: one
       of them has to be the content, and the HUD is the one whose height is
       genuinely decided by what is in it. */
    flex: 0 0 auto;
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
    display: flex;
    align-items: center;
    justify-content: center;
  }
  /* ROUND 4 item 6: the desktop lockup, scaled to the portrait top zone. The
     desktop box is 380x60; portrait gets the same art at roughly 60% of that
     height, width-capped in vw so a narrow device shrinks it rather than
     letting it crowd the grid. Same drop-shadow as desktop so the treatment
     reads as one brand, not two. */
  .portrait-wordmark-img {
    max-height: 36px;
    max-width: 74vw;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.9));
  }
  /* Fallback only - shown if the lockup image fails to load. */
  .portrait-wordmark-text {
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

  /* Text hidden by default, only shown by JS when img fails to load */
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
    /* TR-076. The backdrop is decoration and must never take a hit. As a
       positioned layer at z-index 0 it hit-tests ABOVE unpositioned content,
       which is exactly how it sat over ReplayMode's START REPLAY button and
       swallowed every click (the game-stage at z-index 2 covered it in normal
       play, so only replay mode was exposed). */
    pointer-events: none;
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
  /* OWNER AUDIT ROUND 4, item 3 (owner clarification, 2026-07-26): "it needs to
     differentiate itself between a bonus that has been spun in versus a bonus
     that you pay for". Before this pass the backdrop and frame had only TWO
     states - Overdrive and NITRO - so a NATURALLY TRIGGERED feature and a BOUGHT
     Overdrive rendered identically magenta. Only the flames differed, and the
     owner was describing the borders and shading, not the jets.
     Natural now grades the same asset GREEN-leaning, matching its green flames,
     so the three entry routes read as three distinct treatments:
       natural  green backdrop, green flames
       overdrive  magenta backdrop, cyan flames
       nitro  deep pink backdrop, pink flames
     All three are driven off flameColourway, the single route derivation, so the
     backdrop, the frame and the jets can never disagree about which route is
     live. They previously each re-derived it from liveIsNitroEntry, which is why
     they all shared the same late-binding bug. */
  .bg-still.overdrive.active.route-natural {
    filter: saturate(1.15) brightness(1.02) hue-rotate(-95deg);
  }
  /* NITRO OVERDRIVE (OWNER AUDIT ROUND 3, item 4: shifted pink-forward per
     the owner, was magenta-leaning) - the same graded bg_overdrive.jpg
     asset, pushed further toward deep pink via filter rather than a second
     art asset. */
  .bg-still.overdrive.active.nitro-active {
    filter: saturate(1.4) brightness(1.1) hue-rotate(12deg);
  }

  /* ── Dev chip (2026-07-14c), single small anchor, replaces two separate
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

  /* ── Frame, 640x468 at (320,84), z10 ───────────────────────────────────── */
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

  /* Overdrive transition, frame neon shifts hue while active (Motion Polish
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
  /* ROUND 4 item 3: the naturally-triggered route, green-leaning to match its
     green flames and to read as clearly NOT a purchase. Same pulse rhythm and
     the same single keyframe pattern as the other two routes. */
  .game-frame.overdrive-active.route-natural {
    animation-name: frame-pulse-natural;
  }
  @keyframes frame-pulse-natural {
    0%, 100% { filter: hue-rotate(185deg) saturate(1.3) drop-shadow(0 0 10px color-mix(in srgb, #5dff3c 60%, transparent)); }
    50%       { filter: hue-rotate(185deg) saturate(1.3) drop-shadow(0 0 24px color-mix(in srgb, #5dff3c 95%, transparent)); }
  }
  /* NITRO (OWNER AUDIT ROUND 3, item 4: shifted pink-forward per the owner):
     the same pulse, intensified and hue-shifted warmer than the base
     Overdrive-buy pulse's 280deg - higher saturation and a brighter peak
     glow, distinguishing the bought NITRO entry from a plain Overdrive buy
     without a second keyframe/asset. */
  .game-frame.overdrive-active.nitro-active {
    animation-name: frame-pulse-nitro;
  }
  @keyframes frame-pulse-nitro {
    0%, 100% { filter: hue-rotate(305deg) saturate(1.7) drop-shadow(0 0 14px color-mix(in srgb, var(--theme-secondary, #ff00ff) 75%, transparent)); }
    50%       { filter: hue-rotate(305deg) saturate(1.7) drop-shadow(0 0 34px color-mix(in srgb, var(--theme-secondary, #ff00ff) 100%, transparent)); }
  }

  @media (prefers-reduced-motion: reduce) {
    .game-frame, .game-frame.overdrive-active,
    .game-frame.overdrive-active.route-natural,
    .game-frame.overdrive-active.nitro-active { animation: none; }
    .bg-still.overdrive.active.nitro-active { filter: saturate(1.2) brightness(1.05); }
    .bg-still.overdrive.active.route-natural { filter: saturate(1.1) hue-rotate(-95deg); }
  }

  /* ── Grid, 522x349, centred inside the frame, z20 ──────────────────────── */
  .grid-slot {
    position: absolute;
    left: 379px;
    top: 143.5px;
    width: 522px;
    height: 349px;
    z-index: 20;
    overflow: visible;
  }

  /* GameGrid's native canvas is 616x412, scale it down uniformly to the
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
