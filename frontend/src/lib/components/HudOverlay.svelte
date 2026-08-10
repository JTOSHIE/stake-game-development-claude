<script lang="ts">
  // HudOverlay.svelte - LAYOUT_SPEC v3.2 AMENDMENT: fixed-field HUD.
  // Reskin-free per DESIGN_SYSTEM (the only themed accent is TURBO, which
  // reuses the existing turbo treatment with an engage glow). Every field
  // inside the panel is a fixed box that never moves or resizes as its value
  // grows (stress-tested against $10,000.00 balance / $5,000.00 win /
  // $5,000.00 bet); every numeric value uses tabular numerals.
  import { createEventDispatcher, onMount, onDestroy } from 'svelte'
  import {
    betAmount, balance, canSpin, currencyCode,
    isSpinning, isAutoPlay, autoPlayCount,
    isMuted, showPaytable, winAmount, locale, isWincap,
  } from '../stores/gameStore'
  import { rgsBetLevels } from '../stores/rgsBetLevels'
  // MID-01: the ONE win count-up clock, shared with WinBanner.svelte.
  import { sharedWinCountUp } from '../stores/winCountUp'
  import {
    activeBetLevels, canIncreaseBetLevel, canDecreaseBetLevel, canSetMaxBetLevel,
    increaseBetLevel, decreaseBetLevel, setMaxBetLevel, snapBetToLadder,
  } from '../stores/betLadder'
  import { musicVolume, sfxVolume } from '../stores/audioSettings'
  import { overdriveVisual } from '../stores/overdriveVisual'
  import { autofitText } from '../actions/autofitText'
  import { fitMoney } from '../actions/fitMoney'
  import { speedTier, cycleSpeed } from '../stores/speedMode'
  import { tr } from '../i18n/tr'
  import { isSocial } from '../stores/socialMode'
  import { formatBalance, formatBalanceCompact, CURRENCY_SCALE, // The autoplay loss limit rendered a hardcoded `$` beside its input at three
    // layout profiles. The game runs in EUR, XEC and SC among others, and the
    // owner's own live sessions were EUR, so a euro player set a loss limit
    // labelled in dollars. Same class as the XSC leak PR #89 fixed: a second, // divergent idea of what the currency is. QUALITY_CHARTER.md Q-10.
    currencySymbolFor, currencySymbolTrailing, formatWin, winFractionDigits } from '../utils/currency'
  import { playClick } from '../services/soundService'
  import {
    autoplayLimits, rgJurisdiction, showSessionPanel,
    rgAllowedAutoplayCounts, rgClampAutoplayCount, rgInfiniteAutoplayAllowed,
  } from '../stores/responsibleGambling'
  import { setModalOpen } from '../stores/modalGuard'
  import BetSelector from './BetSelector.svelte'
  import { standingMode } from '../stores/betMode'
  import { FS_MODES } from '../config/fsModes'
  import { spinCostMicros } from '../stores/buyAffordability'
  import { jurisdictionFlags } from '../stores/jurisdiction'

  const dispatch = createEventDispatcher<{ spin: void; slam: void }>()

  // Portrait layout mode (2026-07-14 portrait pass): when true, renders a
  // native-DOM-scale stacked composition (stats row + controls row) instead
  // of the fixed-coordinate LAYOUT_SPEC v3.2 absolute layout below - see the
  // template's top-level {#if portrait} branch. Every binding/handler is
  // shared between both branches; only the markup/CSS differs.
  export let portrait = false
  // Landscape compact HUD pass (2026-07-14b): when true (a landscape phone
  // with innerHeight below 500px, see App.svelte's computeCompactLandscape),
  // renders a native-DOM-scale single-row strip instead of either the
  // fixed-coordinate LAYOUT_SPEC absolute layout or portrait's stacked rows.
  // Every binding/handler is shared across all three branches.
  export let compactLandscape = false
  /**
   * R2R-R JOB C / TR-043. Stake's 400x225 mini-player popout gets its OWN
   * layout, not the compact-landscape strip squeezed further. See App.svelte's
   * computeMiniPlayer for why: 76px of a 225px viewport is a third of the
   * screen before a control is placed, and seven controls in 400px is what
   * produced the overlapping fields reviewer 3 photographed.
   */
  export let miniPlayer = false

  // Dev-only test hook: exposes the store objects so headless verification
  // (frontend/scripts/layout_v1_audit.mjs, qa_soak.mjs, the portrait-layout
  // conformance suite) can inject stress values / drive the
  // locale-social-speed matrix / force a standing mode (OVERBOOST, Cruise)
  // without any production code path. Never present in a production build
  // (import.meta.env.DEV is false there).
  onMount(() => {
    if (import.meta.env.DEV) {
      // isSpinning added 2026-07-16 (ANIMATION UPLIFT PASS) so the
      // conformance suite can force WinBanner's big/mega/epic tiers: set
      // betAmount to 1 first, then winAmount directly equals winMultiplier
      // (a derived, read-only store - not exposed here since it can't be
      // .set() anyway).
      ;(window as unknown as { __testStores?: unknown }).__testStores =
        { balance, betAmount, winAmount, isSpinning, rgsBetLevels, locale, speedTier, standingMode, jurisdictionFlags,
          isAutoPlay, autoPlayCount }
    }
  })

  const AUTO_OPTIONS = [10, 25, 50, 100]
  // R7/TR-015: the offered counts must respect maxAutoplaySpins. Reactive, not
  // a constant, because the flags arrive with the authenticate response.
  $: allowedAutoOptions = rgAllowedAutoplayCounts(AUTO_OPTIONS, $rgJurisdiction.maxAutoplaySpins)
  // OWNER AUDIT REMEDIATION B5: an infinite autoplay option, gated on the
  // jurisdiction flag that already models an autoplay cap (defaults
  // Infinity/uncapped - see stores/responsibleGambling's rgJurisdiction).
  // Passing Infinity straight into the existing count/decrement machinery
  // (autoPlayCount.update(n => n - 1), the $autoPlayCount <= 0 stop check)
  // just works with no special-casing there - Infinity - 1 is still
  // Infinity, and > 0 forever - only the DISPLAY needs a lying-eight symbol
  // instead of literally rendering the string "Infinity".
  const AUTO_INFINITE = Infinity
  function formatAutoCount(n: number): string {
    return n === Infinity ? '∞' : String(n)
  }
  let showAutoMenu = false
  // Responsible-gambling autoplay stop-conditions (see stores/responsibleGambling).
  let stopOnWin = false
  let stopOnFeature = true
  let lossLimitOn = false
  // OWNER AUDIT REMEDIATION A4: the loss limit checkbox previously had no
  // dedicated amount - it silently reused the autoplay spin COUNT as if it
  // were a dollar multiplier (lossLimitMicros = bet * count), which is
  // approximately the natural all-spins-lose exhaustion point, making the
  // "limit" nearly inert. Same story for single-win: the store's own
  // stop-condition logic was correct and unit-tested, but singleWinLimitMult
  // was hardcoded to 0 with no UI to set it at all.
  let lossLimitAmount = 50
  let singleWinLimitOn = false
  let singleWinLimitMult = 10
  let showMenu = false

  // R8/TR-016: both of these are component-local, so App.svelte's spacebar
  // handler could never name them. Registered instead of listed.
  $: setModalOpen('auto-menu', showAutoMenu)
  $: setModalOpen('hud-menu', showMenu)

  // ── Bet ladder ───────────────────────────────────────────────────────────
  // R5/TR-013 (2026-07-25): this logic used to live here as a local copy, and
  // FeatureMenu.svelte had its own divergent one via gameStore's hardcoded
  // BET_LEVELS actions. Two bet-changing surfaces, two ladders. Both now share
  // stores/betLadder.ts, which drives from the AUTHENTICATED levels. Behaviour
  // here is unchanged; the duplication that let them drift is gone.
  // The markup binds to these stores DIRECTLY rather than through `$:` aliases.
  // An alias latched a stale value: when the RGS ladder arrives, the bet is
  // briefly off the new ladder, the guards are correctly false for that instant,
  // and the snap below then moves the bet onto it. The alias kept the transient
  // false and both arrows stayed disabled with a perfectly valid bet on screen.
  // A store read in markup is always live, so the transient cannot stick.

  // Snap an off-ladder bet onto the ladder once the RGS supplies it, so the
  // player never sits on an amount the platform did not authorise.
  $: if ($activeBetLevels.length > 0 && !$activeBetLevels.includes($betAmount)) {
    snapBetToLadder()
  }

  // Pressing SPIN mid-spin slam-stops all reels instantly (Motion Polish v2,
  // reel feel item 1); the outcome is already determined, this only fast
  // forwards the presentation. Otherwise behaves as a normal spin request.
  function handleSpin() {
    if ($isSpinning) {
      dispatch('slam')
    } else if ($canSpin) {
      dispatch('spin')
    }
  }

  // THE BET WINDOW IS A BUTTON (owner's order, 2026-07-28, industry convention).
  //
  // Tapping the BET readout opens a denomination panel listing every level the
  // platform authorised, so a player reaches the maximum in one tap instead of
  // holding an arrow through a ladder that can be twenty levels long on a
  // non-USD currency. THE ARROWS ARE UNCHANGED and remain the fine adjustment;
  // this is an addition.
  //
  // Registered with modalGuard by the panel itself, so autoplay re-arms rather
  // than spinning underneath it and the spacebar does not reach the reels while
  // a player is choosing a stake.
  let showBetSelector = false
  function openBetSelector() {
    if ($isSpinning) return   // the arrows are disabled mid-spin; so is this
    playClick()
    showBetSelector = true
  }

  function increaseBet() { playClick(); increaseBetLevel() }
  function decreaseBet() { playClick(); decreaseBetLevel() }
  function setMaxBet()   { playClick(); setMaxBetLevel() }

  // ── AUTOPLAY IS A TWO-STEP ACTION. R042 BRIEF B, blocker B8. ───────────────
  //
  // THE PLATFORM RULE, quoted verbatim from the dated mirror:
  //
  //   "If an 'autoplay' feature is present, the player must confirm the autoplay
  //    action, games are not allowed to automatically place consecutive bets
  //    with one click."
  //
  // This used to be ONE function, `startAuto`, wired straight to every spin
  // count. A single tap on "100" set the limits, armed autoplay AND dispatched
  // the first bet, and with no RGS cap the infinity option was one tap away
  // too. The project's own gate asserted that this was compliant, on an earlier
  // reading in which the count button WAS the confirmation. **Fable reversed
  // that reading against the platform sentence above**: the same click places
  // consecutive bets, which is the thing the sentence prohibits.
  //
  // So selection and commitment are now separate functions with separate
  // handlers, and `isAutoPlay.set(true)` lives in exactly one of them. The
  // count buttons cannot start a bet however they are wired, because the code
  // that starts one is not reachable from them. That is the property the gate
  // asserts, and it is a structural one rather than a promise.
  //
  // The RG clamp and the stop-condition wiring are unchanged; they simply moved
  // to the moment of commitment, which is also the moment they are read.

  /** The chosen count, or null when nothing is chosen. NEVER pre-selected. */
  let pendingAutoCount: number | null = null

  /** Step one. Chooses a count and shows it. Starts nothing. */
  function selectAuto(requested: number) {
    playClick()
    // Clamped at SELECTION as well as at commitment, so what the player is
    // shown is what they will get rather than a number quietly reduced later.
    pendingAutoCount = rgClampAutoplayCount(requested)
  }

  /** Step two, and the only place autoplay can begin. */
  function confirmAuto() {
    if (pendingAutoCount === null) return
    playClick()
    // Clamped again: the menu is the only route today, but a cap that is only
    // enforced where the number was chosen is one refactor away from being lost.
    const count = rgClampAutoplayCount(pendingAutoCount)
    autoplayLimits.set({
      count,
      stopOnAnyWin: stopOnWin,
      singleWinLimitMult: singleWinLimitOn ? singleWinLimitMult : 0,
      stopOnFeature,
      lossLimitMicros: lossLimitOn ? Math.round(lossLimitAmount * CURRENCY_SCALE) : 0,
    })
    autoPlayCount.set(count)
    isAutoPlay.set(true)
    showAutoMenu = false
    pendingAutoCount = null
    dispatch('spin')
  }

  // Closing the menu abandons the selection. Without this a count chosen,
  // dismissed and forgotten would still be sitting there the next time the menu
  // opened, and the player would meet a Start button they did not arm.
  $: if (!showAutoMenu && pendingAutoCount !== null) pendingAutoCount = null

  function stopAuto() {
    playClick()
    isAutoPlay.set(false)
    autoPlayCount.set(0)
  }

  function toggleAutoMenu() {
    if ($isAutoPlay) { stopAuto(); return }
    showAutoMenu = !showAutoMenu
  }

  function toggleTurbo() {
    playClick()
    cycleSpeed()
  }

  function toggleMenu() {
    showMenu = !showMenu
  }

  function openPaytable() {
    playClick()
    showPaytable.set(true)
    showMenu = false
  }

  // 2026-07-14c: opens SessionPanel's on-demand sheet (TIME/SPINS/NET) from
  // the HUD menu, in every layout mode - always reachable regardless of
  // jurisdiction, since the persistent corner overlay now only auto-pins
  // where mandatorySessionDisplay demands it.
  function openSessionPanel() {
    playClick()
    showSessionPanel.set(true)
    showMenu = false
  }

  function toggleMute() {
    isMuted.update((v) => !v)
  }

  // Audio sliders run on a 0..100 scale; the stores hold 0..1. These convert
  // between the two so the range inputs drive musicVolume / sfxVolume live.
  $: musicPct = Math.round($musicVolume * 100)
  $: sfxPct   = Math.round($sfxVolume * 100)

  function setMusicVol(e: Event) {
    musicVolume.set((+(e.currentTarget as HTMLInputElement).value) / 100)
  }
  function setSfxVol(e: Event) {
    sfxVolume.set((+(e.currentTarget as HTMLInputElement).value) / 100)
  }

  // Cost visibility (Fable 2026-07-07 item 0): while OVERBOOST is toggled ON,
  // every spin is actually debited at 1.25x, not the nominal bet-level amount
  // - the BET display must show that effective figure (the standard ante-bet
  // pattern), not the base bet, or the HUD silently disagrees with the real
  // wallet cost. Mirrors handleSpin's own cost computation exactly (App.svelte)
  // so the displayed figure can never drift from what is actually charged.
  $: effectiveCost = spinCostMicros($betAmount, $standingMode) / CURRENCY_SCALE
  $: isOverboost = $standingMode === 'antelite'
  $: isCruise    = $standingMode === 'cruise'
  // R24, 2026-07-27: the HUD mode badges READ their names from fsModes, the single
  // source of truth, instead of re-typing them. They were hardcoded as 'OVERBOOST'
  // and 'CRUISE' in three template branches here while fsModes declares 'OVERBOOST'
  // and 'Cruise' - the two had ALREADY diverged in case, which is the duplicated-concept
  // class the fresh-eyes review flagged. modeLabel() also applies the social override,
  // so the badges follow social mode for free. Uppercasing stays in CSS where it was.
  $: overboostLabel = $tr(FS_MODES.find((m) => m.serverMode === 'antelite')!.labelKey)
  $: cruiseLabel    = $tr(FS_MODES.find((m) => m.serverMode === 'cruise')!.labelKey)

  // NEON LIFT (2026-07-15, item 3): a brief glow pulse on the bet figure the
  // moment OVERBOOST toggles ON (the effective cost jumping to 1.25x is
  // otherwise a silent number change) - triggers only on the OFF->ON
  // transition, not on every reactive re-run, by comparing against the
  // previous value. Cleared after one pulse cycle so it never becomes a
  // permanent state.
  let overboostPulse = false
  let prevOverboost = false
  let overboostPulseTimer: ReturnType<typeof setTimeout> | null = null
  $: if (isOverboost && !prevOverboost) {
    overboostPulse = true
    if (overboostPulseTimer) clearTimeout(overboostPulseTimer)
    overboostPulseTimer = setTimeout(() => { overboostPulse = false }, 700)
  }
  $: prevOverboost = isOverboost

  // Derived from the session's currency, and placed on the side that currency
  // places it, exactly as formatBalance() does for every other money readout.
  $: lossLimitSymbol   = currencySymbolFor($currencyCode || 'USD')
  $: lossLimitTrailing = currencySymbolTrailing($currencyCode || 'USD')
  $: balanceLabel = formatWin(Math.round($balance * CURRENCY_SCALE), $currencyCode || 'USD', $locale)
  $: betLabel     = formatWin(Math.round(effectiveCost * CURRENCY_SCALE), $currencyCode || 'USD', $locale)
  // Abbreviated companions, consumed by the 400x225 mini profile ONLY. Computed
  // here rather than inside the action so both forms come from the one currency
  // module and cannot disagree about the symbol, the locale or the code.
  $: balanceCompact = formatBalanceCompact(Math.round($balance * CURRENCY_SCALE), $currencyCode || 'USD', $locale)

  // HUD win count-up (2026-07-14b, ITEM B): every win ticks the HUD figure up
  // incrementally rather than jumping straight to the final value.
  //
  // MID-01, 2026-07-30. This component no longer owns a clock. It previously
  // ran its own requestAnimationFrame loop over its own duration rule, against
  // WinBanner.svelte's separate loop over its separate rule, and the two
  // animated the SAME `$winAmount` at different lengths with the same easing.
  // At 16x the HUD finished 872ms before the banner; at the epic tier, two full
  // seconds before it. So the WIN pod revealed the total the celebration exists
  // to reveal, every time.
  //
  // Both surfaces now READ `sharedWinCountUp`, which is one value produced by
  // one loop and driven from `$winAmount` by the store module itself. Equality
  // between the pod and the banner is therefore structural rather than
  // asserted between two implementations: there is only one number to show.
  // Held by `win_countup_sync_gate.mjs`, whose seeded self-test restores the
  // two-clock shape and requires it to go red.
  //
  // The duration rule, the reset-snaps-instantly behaviour and the MAX-WIN HOLD
  // snap all moved into `stores/winCountUp.ts` unchanged. Below the big-win
  // threshold the HUD's own 400ms-to-800ms curve still governs, so ordinary
  // wins tick exactly as they did.

  onDestroy(() => {
    if (overboostPulseTimer) clearTimeout(overboostPulseTimer)
  })

  // Digits come from the SETTLED $winAmount, not from the eased frame value.
  // Deriving per frame makes the readout flicker between two and four places for
  // the whole count-up; measured before this landed.
  $: winDigits = winFractionDigits(Math.round($winAmount * CURRENCY_SCALE), $currencyCode || 'USD')
  $: winLabel = formatWin(Math.round($sharedWinCountUp * CURRENCY_SCALE), $currencyCode || 'USD', $locale, null, winDigits)
  $: winCompact = formatBalanceCompact(Math.round($sharedWinCountUp * CURRENCY_SCALE), $currencyCode || 'USD', $locale)
</script>

{#if portrait}
<!-- PORTRAIT HUD (2026-07-14 portrait pass; 2026-07-14c grid-first
     recomposition restructures the internal layout): native-DOM-scale
     composition - a compact stats row (balance/win) plus a full-width bet
     row sit at the TOP of this region (immediately below FeatureMenu's bar,
     which is itself immediately below the grid - no gap), while the
     controls row (menu, turbo/badge zone, a large central SPIN, MAX,
     autoplay) is pinned to the true bottom safe-area via .p-hud's own
     justify-content:space-between (see the CSS) - .p-hud now fills all the
     space App.svelte's .native-hud-slot.portrait grows to, rather than
     being sized to its own content as v1 was. Rendered as a normal-flow
     sibling OUTSIDE the scaled 1280x720 stage (see App.svelte), so nothing
     here is affected by --S - every size below is a real, native CSS px
     value. -->
<div class="p-hud" class:p-hud--overdrive={$overdriveVisual}>
  <div class="p-top-group">
    <div class="p-stats-row">
      <div class="p-stat p-stat--balance" data-testid="hud-balance">
        <span class="p-stat-label">{$tr('balance')}</span>
        <span class="p-stat-value cyan" use:autofitText={balanceLabel}>{balanceLabel}</span>
      </div>
      <div class="p-stat p-stat--win" class:lit={$winAmount > 0} data-testid="hud-win">
        <span class="p-stat-label">{$tr('win')}</span>
        <span class="p-stat-value magenta" use:autofitText={winLabel}>{winLabel}</span>
      </div>
    </div>
    <!-- BET gets its own full-width row: a 3-column stats row left no room
         for two 44px steppers plus a stress-value bet figure without either
         clipping the currency text or shrinking the steppers below the
         touch-target floor (caught by the committed portrait screenshots
         showing "$1,000,000.00" overflowing its card - see session report). -->
    <div class="p-bet-stat" class:overboost-pulse={overboostPulse} data-testid="hud-bet">
      <span class="p-stat-label">{$tr('bet')}</span>
      <div class="p-bet-row" data-testid="bet-arrows">
        <button class="p-bet-step" on:click={decreaseBet} disabled={$isSpinning || !$canDecreaseBetLevel} aria-label={$tr('a11yDecreaseBet')}>
          <svg viewBox="0 0 20 12"><path d="M10 11 1 1h18z"/></svg>
        </button>
        <button class="p-stat-value gold bet-open" use:autofitText={betLabel} on:click={openBetSelector} aria-haspopup="dialog" aria-expanded={showBetSelector} aria-label={$tr("a11yOpenBetSelector")} data-testid="bet-window"><span class="bet-open-text">{betLabel}</span></button>
        <button class="p-bet-step" on:click={increaseBet} disabled={$isSpinning || !$canIncreaseBetLevel} aria-label={$tr('a11yIncreaseBet')}>
          <svg viewBox="0 0 20 12"><path d="M10 1 19 11H1z"/></svg>
        </button>
      </div>
      {#if isOverboost}
        <span class="p-mode-badge overboost" data-testid="hud-overboost-badge">{overboostLabel}</span>
      {:else if isCruise}
        <span class="p-mode-badge cruise" data-testid="hud-cruise-label">{cruiseLabel}</span>
      {/if}
    </div>
  </div>

  <div class="p-controls-row">
    <div class="p-controls-side">
      <div class="p-menu-wrapper">
        <button class="p-round-btn" on:click={toggleMenu} aria-label={$tr('a11yMenu')} aria-expanded={showMenu} data-testid="hud-menu">
          <span class="p-hamburger"><span class="p-hamburger-bar"></span><span class="p-hamburger-bar"></span><span class="p-hamburger-bar"></span></span>
        </button>
        {#if showMenu}
          <div class="hud-menu p-hud-menu" role="menu">
            <button class="hud-menu-item" role="menuitem" on:click={openPaytable}>{$tr('paytable')}</button>
            <button class="hud-menu-item" role="menuitem" on:click={openSessionPanel} data-testid="open-session-panel">{$tr('hudSession')}</button>
            <div class="audio-panel" class:muted={$isMuted}>
              <button class="hud-menu-item audio-mute" role="menuitem" on:click={toggleMute}>
                {$isMuted ? $tr('ctrlUnmute') : $tr('ctrlMute')}
                <svg class="audio-mute-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 9v6h4l5 4V5L8 9H4z" />
                  {#if $isMuted}
                    <path class="mute-slash" d="M17 9.5l5 5M22 9.5l-5 5" />
                  {:else}
                    <path class="wave" d="M16.5 8.5a5 5 0 0 1 0 7" />
                  {/if}
                </svg>
              </button>
              <div class="audio-row">
                <span class="audio-label">{$tr('hudMusic')}</span>
                <input class="audio-slider" type="range" min="0" max="100" value={musicPct} on:input={setMusicVol} aria-label={$tr('a11yMusicVolume')} />
                <span class="audio-pct">{musicPct}%</span>
              </div>
              <div class="audio-row">
                <span class="audio-label">{$tr('hudSound')}</span>
                <input class="audio-slider" type="range" min="0" max="100" value={sfxPct} on:input={setSfxVol} aria-label={$tr('a11ySfxVolume')} />
                <span class="audio-pct">{sfxPct}%</span>
              </div>
            </div>
          </div>
        {/if}
      </div>
      <button
        class="p-round-btn p-turbo"
        data-speed={$speedTier}
        data-testid="hud-turbo"
        on:click={toggleTurbo}
        disabled={$isSpinning || $rgJurisdiction.turboDisabled}
        aria-label={$tr('a11yCycleSpeed')}
        title={$speedTier === 'normal' ? 'Normal speed' : $speedTier === 'turbo' ? 'Turbo' : 'Super Turbo'}
      >
        <svg viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>
      </button>
    </div>

    <button
      class="p-spin"
      class:spinning={$isSpinning}
      disabled={$isWincap ? true : ($isSpinning ? false : !$canSpin)}
      on:click={handleSpin}
      aria-label={$tr('spin')}
      data-testid="spin-button"
    >
      <svg class="glyph play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      <svg class="glyph arrows" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M18 3v5h-5"/></svg>
      <span class="p-spin-txt">{$tr('spin')}</span>
    </button>

    <div class="p-controls-side">
      <button class="p-round-btn p-max" on:click={setMaxBet} disabled={$isSpinning || !$canSetMaxBetLevel} aria-label={$tr('betMax')} data-testid="max-chip">
        <span class="p-max-cap">{$tr('hudMax')}</span>
      </button>
      {#if !$rgJurisdiction.autoplayDisabled}
        <div class="p-autoplay-wrapper">
          <button
            class="p-round-btn"
            class:active={$isAutoPlay}
            on:click={toggleAutoMenu}
            disabled={$isSpinning && !$isAutoPlay}
            aria-label={$tr('autoPlay')}
          >
            {#if $isAutoPlay}
              <span class="p-tier">{formatAutoCount($autoPlayCount)}</span>
            {:else}
              <svg viewBox="0 0 24 24"><path d="M7 6a6 6 0 1 0 5 3"/></svg>
            {/if}
          </button>
          {#if showAutoMenu}
            <div class="auto-menu p-auto-menu" role="menu">
              <label class="auto-menu-toggle"><input type="checkbox" bind:checked={stopOnWin} /> {$tr('stopOnWin')}</label>
              <label class="auto-menu-toggle"><input type="checkbox" bind:checked={singleWinLimitOn} /> {$tr('singleWinLimit')}</label>
              {#if singleWinLimitOn}
                <label class="auto-menu-amount">&times;<input type="number" min="1" step="1" bind:value={singleWinLimitMult} class="auto-menu-input" data-testid="single-win-limit-input" /></label>
              {/if}
              <label class="auto-menu-toggle"><input type="checkbox" bind:checked={stopOnFeature} /> {$tr('stopOnFeature')}</label>
              <label class="auto-menu-toggle"><input type="checkbox" bind:checked={lossLimitOn} /> {$tr('lossLimit')}</label>
              {#if lossLimitOn}
                <label class="auto-menu-amount">{#if !lossLimitTrailing}{lossLimitSymbol}{/if}<input type="number" min="1" step="1" bind:value={lossLimitAmount} class="auto-menu-input" data-testid="loss-limit-input" />{#if lossLimitTrailing}{lossLimitSymbol}{/if}</label>
              {/if}
              <div class="auto-menu-sep">{$tr('hudSpins')}</div>
              {#each allowedAutoOptions as n}
                <button class="auto-menu-item" class:is-selected={pendingAutoCount === n} role="menuitemradio"
                        aria-checked={pendingAutoCount === n} on:click={() => selectAuto(n)}>{n}</button>
              {/each}
              {#if $rgInfiniteAutoplayAllowed}
                <button class="auto-menu-item" class:is-selected={pendingAutoCount === AUTO_INFINITE} role="menuitemradio"
                        aria-checked={pendingAutoCount === AUTO_INFINITE} on:click={() => selectAuto(AUTO_INFINITE)}
                        data-testid="auto-infinite">∞</button>
              {/if}
              <!-- STEP TWO. The only control that can begin a bet. Absent until a
                   count is chosen, so there is no Start to hit by reflex and no
                   pre-selected infinity. R042 BRIEF B. -->
              {#if pendingAutoCount !== null}
                <button class="auto-menu-start" role="menuitem" on:click={confirmAuto}
                        data-testid="auto-start">{$tr('autoplayStartCta')} ·
                  {pendingAutoCount === AUTO_INFINITE ? '∞' : pendingAutoCount}</button>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div><!-- /p-hud -->
{:else if miniPlayer}
<!-- MINI-PLAYER HUD (R2R-R JOB C / TR-043): a dedicated 44px single row for
     Stake's 400x225 popout. FOUR controls, not the compact strip's seven.
     Turbo, AUTO and MAX are not dropped, they MOVE into the menu, which
     already exists here and already carries the paytable, session and audio.
     What stays is the minimum a player needs to play: the menu, the bet
     steppers, and SPIN.

     Stats read INLINE, label and value on one line, because the stacked
     label-over-value the compact strip uses is exactly what was overlapping at
     this height. SPIN keeps its >=44px target; everything else moved so that it
     could. -->
<div class="m-hud" class:m-hud--overdrive={$overdriveVisual} data-testid="mini-hud">
  <div class="m-menu-wrapper">
    <button class="m-round-btn" on:click={toggleMenu} aria-label={$tr('a11yMenu')} aria-expanded={showMenu} data-testid="mini-menu">
      <span class="p-hamburger"><span class="p-hamburger-bar"></span><span class="p-hamburger-bar"></span><span class="p-hamburger-bar"></span></span>
    </button>
    {#if showMenu}
      <div class="hud-menu m-hud-menu" role="menu">
        <button class="hud-menu-item" role="menuitem" on:click={openPaytable}>{$tr('paytable')}</button>
        <button class="hud-menu-item" role="menuitem" on:click={openSessionPanel} data-testid="open-session-panel">{$tr('hudSession')}</button>
        <!-- The three controls that left the row. They are reachable, labelled,
             and at full menu-item size, which they were not when crammed into
             the strip as icons. -->
        <!-- FS VISUAL FIXPACK JOB 2: the numeral is gone here too. At this size
             the control lives only in the menu, so the menu item IS the control
             at Popout S and has to carry the same three-step intensity. The
             localised word stays: a menu item without a label would be worse
             than the numeral ever was. -->
        <button class="hud-menu-item m-turbo-item" role="menuitem" on:click={toggleTurbo}
                data-speed={$speedTier}
                data-testid="hud-turbo"
                disabled={$isSpinning || $rgJurisdiction.turboDisabled}
                title={$speedTier === 'normal' ? 'Normal speed' : $speedTier === 'turbo' ? 'Turbo' : 'Super Turbo'}>
          <svg class="m-turbo-bolt" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>
          {$tr('hudTurboLabel')}
        </button>
        {#if !$rgJurisdiction.autoplayDisabled}
          <button class="hud-menu-item" role="menuitem" on:click={toggleAutoMenu} disabled={$isSpinning}>
            {$tr('autoPlay')}
          </button>
        {/if}
        <button class="hud-menu-item" role="menuitem" on:click={setMaxBet}
                disabled={$isSpinning || !$canSetMaxBetLevel}>
          {$tr('betMax')}
        </button>
        <div class="audio-panel" class:muted={$isMuted}>
          <button class="hud-menu-item audio-mute" role="menuitem" on:click={toggleMute}>
            {$isMuted ? $tr('ctrlUnmute') : $tr('ctrlMute')}
                <svg class="audio-mute-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 9v6h4l5 4V5L8 9H4z" />
                  {#if $isMuted}
                    <path class="mute-slash" d="M17 9.5l5 5M22 9.5l-5 5" />
                  {:else}
                    <path class="wave" d="M16.5 8.5a5 5 0 0 1 0 7" />
                  {/if}
                </svg>
          </button>
        </div>
      </div>
    {/if}
  </div>

  <!-- Abbreviated labels, and not as a shortcut. The proof measured the full
       words truncating the VALUES at 400px: "BALANCE $100.00" in 71px cut the
       number, not the word, and a player who cannot read their balance is the
       exact finding this HUD exists to fix. Short labels in all sixteen
       locales, so no locale falls back to English. -->
  <!-- BALANCE and WIN use fitMoney, not autofitText, and they are the only two
       readouts in the game that do. Fable's ruling closing TR-066: in this
       profile alone, a value that cannot fit its measured slot at the legible
       floor renders abbreviated ("$52.43M") rather than cut; a value that fits
       renders in full; every other profile keeps full precision everywhere.
       The spans are deliberately EMPTY, because the action owns the text: the
       choice between the two forms is the result of a measurement that can
       only be taken after layout. -->
  <div class="m-stat m-stat--balance" data-testid="hud-balance">
    <span class="m-stat-label">{$tr('hudBalanceShort')}</span>
    <span class="m-stat-value cyan" use:fitMoney={{ full: balanceLabel, compact: balanceCompact }}></span>
  </div>
  <div class="m-stat m-stat--win" class:lit={$winAmount > 0} data-testid="hud-win">
    <span class="m-stat-label">{$tr('hudWinShort')}</span>
    <span class="m-stat-value magenta" use:fitMoney={{ full: winLabel, compact: winCompact }}></span>
  </div>
  <div class="m-stat m-stat--bet" data-testid="hud-bet">
    <button class="m-bet-step" on:click={decreaseBet} disabled={$isSpinning || !$canDecreaseBetLevel} aria-label={$tr('a11yDecreaseBet')}>
      <svg viewBox="0 0 20 12"><path d="M10 11 1 1h18z"/></svg>
    </button>
    <button class="m-stat-value gold bet-open" use:autofitText={betLabel} on:click={openBetSelector} aria-haspopup="dialog" aria-expanded={showBetSelector} aria-label={$tr("a11yOpenBetSelector")} data-testid="bet-window"><span class="bet-open-text">{betLabel}</span></button>
    <button class="m-bet-step" on:click={increaseBet} disabled={$isSpinning || !$canIncreaseBetLevel} aria-label={$tr('a11yIncreaseBet')}>
      <svg viewBox="0 0 20 12"><path d="M10 1 19 11H1z"/></svg>
    </button>
  </div>

  <button
    class="m-spin"
    class:spinning={$isSpinning}
    data-testid="spin-button"
    on:click={handleSpin}
    disabled={$isWincap ? true : ($isSpinning ? false : !$canSpin)}
    aria-label={$tr('spin')}
  >
    {#if $isSpinning}
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
    {:else}
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
    {/if}
  </button>
</div>

{:else if compactLandscape}
<!-- LANDSCAPE COMPACT HUD (2026-07-14b): a single native-scale row - menu,
     stats cluster (balance/win/bet+steppers), turbo, AUTO, MAX, SPIN
     (>=56px, rightmost) - for a landscape phone with innerHeight below
     500px. Rendered as the second flex item in .native-hud-slot, which
     App.svelte switches to flex-direction:row for this mode so this and
     FeatureMenu's compact trigger share one row (see App.svelte's
     `.native-hud-slot.compact-landscape` rule). Every size below is a real
     native CSS px value, same discipline as the portrait branch above - all
     seven touch targets (menu, turbo, AUTO, MAX, both bet steppers, SPIN)
     are >=44px effective, closing the PR #78 landscape debt table. -->
<div class="c-hud" class:c-hud--overdrive={$overdriveVisual}>
  <div class="c-menu-wrapper">
    <button class="c-round-btn" on:click={toggleMenu} aria-label={$tr('a11yMenu')} aria-expanded={showMenu} data-testid="hud-menu">
      <span class="p-hamburger"><span class="p-hamburger-bar"></span><span class="p-hamburger-bar"></span><span class="p-hamburger-bar"></span></span>
    </button>
    {#if showMenu}
      <div class="hud-menu c-hud-menu" role="menu">
        <button class="hud-menu-item" role="menuitem" on:click={openPaytable}>{$tr('paytable')}</button>
        <button class="hud-menu-item" role="menuitem" on:click={openSessionPanel} data-testid="open-session-panel">{$tr('hudSession')}</button>
        <div class="audio-panel" class:muted={$isMuted}>
          <button class="hud-menu-item audio-mute" role="menuitem" on:click={toggleMute}>
            {$isMuted ? $tr('ctrlUnmute') : $tr('ctrlMute')}
                <svg class="audio-mute-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 9v6h4l5 4V5L8 9H4z" />
                  {#if $isMuted}
                    <path class="mute-slash" d="M17 9.5l5 5M22 9.5l-5 5" />
                  {:else}
                    <path class="wave" d="M16.5 8.5a5 5 0 0 1 0 7" />
                  {/if}
                </svg>
          </button>
          <div class="audio-row">
            <span class="audio-label">{$tr('hudMusic')}</span>
            <input class="audio-slider" type="range" min="0" max="100" value={musicPct} on:input={setMusicVol} aria-label={$tr('a11yMusicVolume')} />
            <span class="audio-pct">{musicPct}%</span>
          </div>
          <div class="audio-row">
            <span class="audio-label">{$tr('hudSound')}</span>
            <input class="audio-slider" type="range" min="0" max="100" value={sfxPct} on:input={setSfxVol} aria-label={$tr('a11ySfxVolume')} />
            <span class="audio-pct">{sfxPct}%</span>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <div class="c-stat c-stat--balance" data-testid="hud-balance">
    <span class="c-stat-label">{$tr('balance')}</span>
    <span class="c-stat-value cyan" use:autofitText={balanceLabel}>{balanceLabel}</span>
  </div>
  <div class="c-stat c-stat--win" class:lit={$winAmount > 0} data-testid="hud-win">
    <span class="c-stat-label">{$tr('win')}</span>
    <span class="c-stat-value magenta" use:autofitText={winLabel}>{winLabel}</span>
  </div>
  <div class="c-stat c-stat--bet" class:overboost-pulse={overboostPulse} data-testid="hud-bet">
    <span class="c-stat-label">{$tr('bet')}</span>
    <div class="c-bet-row" data-testid="bet-arrows">
      <button class="c-bet-step" on:click={decreaseBet} disabled={$isSpinning || !$canDecreaseBetLevel} aria-label={$tr('a11yDecreaseBet')}>
        <svg viewBox="0 0 20 12"><path d="M10 11 1 1h18z"/></svg>
      </button>
      <button class="c-stat-value gold bet-open" use:autofitText={betLabel} on:click={openBetSelector} aria-haspopup="dialog" aria-expanded={showBetSelector} aria-label={$tr("a11yOpenBetSelector")} data-testid="bet-window"><span class="bet-open-text">{betLabel}</span></button>
      <button class="c-bet-step" on:click={increaseBet} disabled={$isSpinning || !$canIncreaseBetLevel} aria-label={$tr('a11yIncreaseBet')}>
        <svg viewBox="0 0 20 12"><path d="M10 1 19 11H1z"/></svg>
      </button>
    </div>
    {#if isOverboost}
      <span class="c-mode-badge overboost" data-testid="hud-overboost-badge">{overboostLabel}</span>
    {:else if isCruise}
      <span class="c-mode-badge cruise" data-testid="hud-cruise-label">{cruiseLabel}</span>
    {/if}
  </div>

  <button
    class="c-round-btn c-turbo"
    data-speed={$speedTier}
    data-testid="hud-turbo"
    on:click={toggleTurbo}
    disabled={$isSpinning || $rgJurisdiction.turboDisabled}
    aria-label={$tr('a11yCycleSpeed')}
    title={$speedTier === 'normal' ? 'Normal speed' : $speedTier === 'turbo' ? 'Turbo' : 'Super Turbo'}
  >
    <svg viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>
  </button>

  {#if !$rgJurisdiction.autoplayDisabled}
    <div class="c-autoplay-wrapper">
      <button
        class="c-round-btn"
        class:active={$isAutoPlay}
        on:click={toggleAutoMenu}
        disabled={$isSpinning && !$isAutoPlay}
        aria-label={$tr('autoPlay')}
      >
        {#if $isAutoPlay}
          <span class="c-tier">{formatAutoCount($autoPlayCount)}</span>
        {:else}
          <svg viewBox="0 0 24 24"><path d="M7 6a6 6 0 1 0 5 3"/></svg>
        {/if}
      </button>
      {#if showAutoMenu}
        <div class="auto-menu c-auto-menu" role="menu">
          <label class="auto-menu-toggle"><input type="checkbox" bind:checked={stopOnWin} /> {$tr('stopOnWin')}</label>
          <label class="auto-menu-toggle"><input type="checkbox" bind:checked={singleWinLimitOn} /> {$tr('singleWinLimit')}</label>
          {#if singleWinLimitOn}
            <label class="auto-menu-amount">&times;<input type="number" min="1" step="1" bind:value={singleWinLimitMult} class="auto-menu-input" data-testid="single-win-limit-input" /></label>
          {/if}
          <label class="auto-menu-toggle"><input type="checkbox" bind:checked={stopOnFeature} /> {$tr('stopOnFeature')}</label>
          <label class="auto-menu-toggle"><input type="checkbox" bind:checked={lossLimitOn} /> {$tr('lossLimit')}</label>
          {#if lossLimitOn}
            <label class="auto-menu-amount">{#if !lossLimitTrailing}{lossLimitSymbol}{/if}<input type="number" min="1" step="1" bind:value={lossLimitAmount} class="auto-menu-input" data-testid="loss-limit-input" />{#if lossLimitTrailing}{lossLimitSymbol}{/if}</label>
          {/if}
          <div class="auto-menu-sep">{$tr('hudSpins')}</div>
          {#each allowedAutoOptions as n}
            <button class="auto-menu-item" class:is-selected={pendingAutoCount === n} role="menuitemradio"
                    aria-checked={pendingAutoCount === n} on:click={() => selectAuto(n)}>{n}</button>
          {/each}
          {#if $rgInfiniteAutoplayAllowed}
            <button class="auto-menu-item" class:is-selected={pendingAutoCount === AUTO_INFINITE} role="menuitemradio"
                    aria-checked={pendingAutoCount === AUTO_INFINITE} on:click={() => selectAuto(AUTO_INFINITE)}
                    data-testid="auto-infinite">∞</button>
          {/if}
          <!-- STEP TWO. The only control that can begin a bet. Absent until a
               count is chosen, so there is no Start to hit by reflex and no
               pre-selected infinity. R042 BRIEF B. -->
          {#if pendingAutoCount !== null}
            <button class="auto-menu-start" role="menuitem" on:click={confirmAuto}
                    data-testid="auto-start">{$tr('autoplayStartCta')} ·
              {pendingAutoCount === AUTO_INFINITE ? '∞' : pendingAutoCount}</button>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  <button class="c-round-btn c-max" on:click={setMaxBet} disabled={$isSpinning || !$canSetMaxBetLevel} aria-label={$tr('betMax')} data-testid="max-chip">
    <span class="c-max-cap">{$tr('hudMax')}</span>
  </button>

  <button
    class="c-spin"
    class:spinning={$isSpinning}
    disabled={$isWincap ? true : ($isSpinning ? false : !$canSpin)}
    on:click={handleSpin}
    aria-label={$tr('spin')}
    data-testid="spin-button"
  >
    <svg class="glyph play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
    <svg class="glyph arrows" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M18 3v5h-5"/></svg>
  </button>
</div><!-- /c-hud -->
{:else}
<!-- HUD - B1 reskin. .fs-hud is a display:contents token-scope wrapper only;
     every control keeps its own position:absolute against the same stage
     ancestor, so nothing shifts. Overdrive flips accents from the shared flag. -->
<div class="fs-hud" class:fs-hud--overdrive={$overdriveVisual}>

  <!-- HUD panel - v3.2 x 296..984 (688 wide), y 560..648, radius 18 -->
  <div class="fs-panel" data-testid="hud-panel"></div>

  <!-- TURBO - v3.2: OUTSIDE the panel, centre (268,604) -->
  <button
    class="fs-turbo fs-knob"
    data-speed={$speedTier}
    data-testid="hud-turbo"
    on:click={toggleTurbo}
    disabled={$isSpinning || $rgJurisdiction.turboDisabled}
    aria-label={$tr('a11yCycleSpeed')}
    title={$speedTier === 'normal' ? 'Normal speed' : $speedTier === 'turbo' ? 'Turbo' : 'Super Turbo'}
  >
    <span class="fs-face">
      <svg viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>
    </span>
  </button>

  <!-- MAX chip - v3.6: far-left gap between TURBO and the menu, clear of SPIN. -->
  <button
    class="fs-max"
    on:click={setMaxBet}
    disabled={$isSpinning || !$canSetMaxBetLevel}
    aria-label={$tr('betMax')}
    data-testid="max-chip"
  ><span class="cap">{$tr('hudMax')}</span></button>

  <!-- Hamburger + menu - fixed at x 344 -->
  <div class="menu-wrapper">
    <button class="fs-menu" on:click={toggleMenu} aria-label={$tr('a11yMenu')} aria-expanded={showMenu} data-testid="hud-menu">
      <span class="inset"><span class="bar"></span><span class="bar"></span><span class="bar"></span></span>
    </button>
    {#if showMenu}
      <div class="hud-menu" role="menu">
        <button class="hud-menu-item" role="menuitem" on:click={openPaytable}>{$tr('paytable')}</button>
        <button class="hud-menu-item" role="menuitem" on:click={openSessionPanel} data-testid="open-session-panel">{$tr('hudSession')}</button>
        <div class="audio-panel" class:muted={$isMuted}>
          <button class="hud-menu-item audio-mute" role="menuitem" on:click={toggleMute}>
            {$isMuted ? $tr('ctrlUnmute') : $tr('ctrlMute')}
                <svg class="audio-mute-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 9v6h4l5 4V5L8 9H4z" />
                  {#if $isMuted}
                    <path class="mute-slash" d="M17 9.5l5 5M22 9.5l-5 5" />
                  {:else}
                    <path class="wave" d="M16.5 8.5a5 5 0 0 1 0 7" />
                  {/if}
                </svg>
          </button>
          <div class="audio-row">
            <span class="audio-label">{$tr('hudMusic')}</span>
            <input
              class="audio-slider"
              type="range" min="0" max="100"
              value={musicPct}
              on:input={setMusicVol}
              aria-label={$tr('a11yMusicVolume')}
            />
            <span class="audio-pct">{musicPct}%</span>
          </div>
          <div class="audio-row">
            <span class="audio-label">{$tr('hudSound')}</span>
            <input
              class="audio-slider"
              type="range" min="0" max="100"
              value={sfxPct}
              on:input={setSfxVol}
              aria-label={$tr('a11ySfxVolume')}
            />
            <span class="audio-pct">{sfxPct}%</span>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- BALANCE - fixed box x 400, width 200 -->
  <div class="fs-box fs-balance fs-plate" data-testid="hud-balance">
    <span class="fs-rail"></span>
    <span class="fs-face">
      <span class="fs-label">{$tr('balance')}</span>
      <span class="fs-value cyan" use:autofitText={balanceLabel}>{balanceLabel}</span>
    </span>
  </div>

  <!-- WIN - fixed box x 616, width 150 -->
  <div class="fs-box fs-win fs-plate" class:lit={$winAmount > 0} data-testid="hud-win">
    <span class="fs-rail"></span>
    <span class="fs-face">
      <span class="fs-label">{$tr('win')}</span>
      <span class="fs-value magenta" use:autofitText={winLabel}>{winLabel}</span>
    </span>
  </div>

  <!-- BET - fixed box x 782, width 120, value right-aligned. Shows the
       EFFECTIVE debit (bet x MODE_COST[standingMode]), not the nominal bet
       level, whenever a standing/enhancer mode changes the real cost. -->
  <div class="fs-box fs-bet fs-plate" class:overboost-pulse={overboostPulse} data-testid="hud-bet">
    <span class="fs-rail"></span>
    <span class="fs-face">
      <span class="fs-label">{$tr('bet')}</span>
      <button class="fs-value gold bet-open" use:autofitText={betLabel} on:click={openBetSelector} aria-haspopup="dialog" aria-expanded={showBetSelector} aria-label={$tr("a11yOpenBetSelector")} data-testid="bet-window"><span class="bet-open-text">{betLabel}</span></button>
    </span>
  </div>

  <!-- Mode badge anchor - a plain (unclipped) sibling matching the BET box's
       own geometry exactly. .fs-plate's clip-path would otherwise clip any
       child poking above the box, so this sits outside it, not inside. -->
  {#if isOverboost || isCruise}
    <div class="fs-bet-badge-anchor">
      {#if isOverboost}
        <span class="fs-mode-badge overboost" data-testid="hud-overboost-badge">{overboostLabel}</span>
      {:else}
        <span class="fs-mode-badge cruise" data-testid="hud-cruise-label">{cruiseLabel}</span>
      {/if}
    </div>
  {/if}

  <!-- Stacked cyan bet arrows - own FIXED column x 906 (v3.3), independent of BET box -->
  <div class="fs-arrows" data-testid="bet-arrows">
    <button class="fs-arrow" on:click={increaseBet} disabled={$isSpinning || !$canIncreaseBetLevel} aria-label={$tr('a11yIncreaseBet')}><svg viewBox="0 0 20 12"><path d="M10 1 19 11H1z"/></svg></button>
    <button class="fs-arrow" on:click={decreaseBet} disabled={$isSpinning || !$canDecreaseBetLevel} aria-label={$tr('a11yDecreaseBet')}><svg viewBox="0 0 20 12"><path d="M10 11 1 1h18z"/></svg></button>
  </div>

  <!-- SPIN - v3.2: centre (1004,604), 84 diameter. Stays clickable mid-spin
       (slam-stop, Motion Polish v2) even though $canSpin is false while spinning. -->
  <button
    class="fs-spin"
    class:spinning={$isSpinning}
    disabled={$isWincap ? true : ($isSpinning ? false : !$canSpin)}
    on:click={handleSpin}
    aria-label={$tr('spin')}
    data-testid="spin-button"
  >
    <span class="ring"></span>
    <span class="dome">
      <svg class="glyph play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      <svg class="glyph arrows" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M18 3v5h-5"/></svg>
    </span>
    <span class="txt">{$tr('spin')}</span>
  </button>

  <!-- AUTOPLAY - v3.2: centre (936,672), 48. Hidden entirely where the
       jurisdiction bans autoplay (UKGC, enforced May 2026). -->
  {#if !$rgJurisdiction.autoplayDisabled}
  <div class="autoplay-wrapper">
    <button
      class="fs-auto fs-knob"
      class:active={$isAutoPlay}
      on:click={toggleAutoMenu}
      disabled={$isSpinning && !$isAutoPlay}
      aria-label={$tr('autoPlay')}
    >
      <span class="fs-face">
        {#if $isAutoPlay}
          <span class="count">{formatAutoCount($autoPlayCount)}</span>
        {:else}
          <svg viewBox="0 0 24 24"><path d="M7 6a6 6 0 1 0 5 3"/></svg>
        {/if}
      </span>
    </button>
    {#if showAutoMenu}
      <div class="auto-menu" role="menu">
        <label class="auto-menu-toggle"><input type="checkbox" bind:checked={stopOnWin} /> {$tr('stopOnWin')}</label>
        <label class="auto-menu-toggle"><input type="checkbox" bind:checked={singleWinLimitOn} /> {$tr('singleWinLimit')}</label>
        {#if singleWinLimitOn}
          <label class="auto-menu-amount">&times;<input type="number" min="1" step="1" bind:value={singleWinLimitMult} class="auto-menu-input" data-testid="single-win-limit-input" /></label>
        {/if}
        <label class="auto-menu-toggle"><input type="checkbox" bind:checked={stopOnFeature} /> {$tr('stopOnFeature')}</label>
        <label class="auto-menu-toggle"><input type="checkbox" bind:checked={lossLimitOn} /> {$tr('lossLimit')}</label>
        {#if lossLimitOn}
          <label class="auto-menu-amount">{#if !lossLimitTrailing}{lossLimitSymbol}{/if}<input type="number" min="1" step="1" bind:value={lossLimitAmount} class="auto-menu-input" data-testid="loss-limit-input" />{#if lossLimitTrailing}{lossLimitSymbol}{/if}</label>
        {/if}
        <div class="auto-menu-sep">{$tr('hudSpins')}</div>
        {#each allowedAutoOptions as n}
          <button class="auto-menu-item" class:is-selected={pendingAutoCount === n} role="menuitemradio"
                  aria-checked={pendingAutoCount === n} on:click={() => selectAuto(n)}>{n}</button>
        {/each}
        {#if $rgInfiniteAutoplayAllowed}
          <button class="auto-menu-item" class:is-selected={pendingAutoCount === AUTO_INFINITE} role="menuitemradio"
                  aria-checked={pendingAutoCount === AUTO_INFINITE} on:click={() => selectAuto(AUTO_INFINITE)}
                  data-testid="auto-infinite">∞</button>
        {/if}
        <!-- STEP TWO. The only control that can begin a bet. Absent until a
             count is chosen, so there is no Start to hit by reflex and no
             pre-selected infinity. R042 BRIEF B. -->
        {#if pendingAutoCount !== null}
          <button class="auto-menu-start" role="menuitem" on:click={confirmAuto}
                  data-testid="auto-start">{$tr('autoplayStartCta')} ·
            {pendingAutoCount === AUTO_INFINITE ? '∞' : pendingAutoCount}</button>
        {/if}
      </div>
    {/if}
  </div>
  {/if}

</div><!-- /fs-hud -->
{/if}

<!-- The denomination picker. ONE mount for all four layout profiles: it is
     fixed to the viewport rather than to the 1280x720 design surface, so it
     needs no per-profile copy and cannot drift between them. -->
<BetSelector bind:open={showBetSelector} />

<style>
  /* The BET readout is a button in all four profiles. These four rules are the
     entire visual cost of that: the element keeps its profile's own class and
     therefore its own geometry, colour and autofit behaviour, and this strips
     only the things a <button> brings with it that a <span> did not. Written
     once rather than per profile so the four cannot drift. */
  .bet-open {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    /* MIN-WIDTH ZERO, and this one line is why the layout fit gate is green.
       A flex item's default `min-width: auto` refuses to shrink below its
       min-content width. A <span> in these rows had no intrinsic minimum worth
       speaking of, but a <button> does, so promoting the readout stopped it
       shrinking and the mini strip's BET box reported 99px of content in a 92px
       box at Popout S: `hud-bet` clipped its own value. Restoring the shrink
       lets `autofitText` do its job exactly as it did when this was a span. */
    min-width: 0;
  }
  /* THE VALUE IS WRAPPED IN A SPAN, and it is not decoration.
     `layout_fit_gate.mjs:199` measures "the deepest text-bearing node" of each
     readout with `el.querySelector('.m-stat-val, .stat-value, span, div')`, and
     falls back to the CONTAINER when nothing matches. Promoting the readout
     from a <span> to a <button> matched none of those four, so the gate
     silently switched from measuring the value (36px in a 36px box, fine) to
     measuring the whole BET container, whose scrollWidth carries the two
     steppers' pre-existing SVG overflow: it reported 99 against 92 at Popout S
     and called it a clipped value. Nothing was actually clipping.
     Giving the gate back the text node it looks for restores its intent rather
     than weakening it, and costs one element. The gate's fallback is a real
     blind spot for any future non-span readout and is recorded as such. */
  .bet-open-text { display: inline; }
  .bet-open:disabled { cursor: default; }

  /* THE TAP TARGET IS THE BET WINDOW, NOT THE DIGITS.
     Measured, and it was a regression this change introduced: promoting the
     readout from a <span> to a <button> made it an audited touch target for the
     first time, and portrait_layout_conformance reported it at 50.8x24 on
     iPhone 14 and Pixel 7 portrait and 44.4x21 in compact landscape, against a
     44px floor. A span is not a control and was never measured; a button is,
     and it was too small the moment it became one.
     The three small profiles put the readout in a flex row BETWEEN two 44px
     steppers, so the row is already 44px tall and stretching the readout to
     match costs no layout at all. The landscape plate is deliberately excluded:
     it is a fixed-geometry 120px box with a clip-path, it is not a touch
     profile, and forcing height into it would push the label out of its own
     plate to satisfy a bar that does not apply there. */
  .p-stat-value.bet-open,
  .c-stat-value.bet-open {
    min-height: 44px;
    align-self: stretch;
  }

  /* THE MINI STRIP IS DELIBERATELY EXCLUDED, and it was measured rather than
     reasoned. Adding the 44px floor to `.m-stat-value.bet-open` too made the
     Popout S BET row 44px tall, the two steppers stretched with it, and their
     20x12 SVGs scaled to the new height until each carried 32px of content in a
     22px box. That overflow is what the layout fit gate reported as
     `hud-bet` clipping its value, 99 against 92, at Popout S ONLY.
     It is the right exclusion on its own terms as well: the touch-target audit
     runs at iPhone 14 and Pixel 7, portrait and landscape, which are the
     portrait and compact-landscape profiles. Popout S is a 400x225 desktop
     popout, not a touch surface, and its controls are already smaller than the
     touch floor by design. */

  /* NO `display: flex` HERE, and that is a correction rather than an omission.
     The first version centred the label with `display: flex`, and the layout
     fit gate went red at Popout S: `hud-bet` clipped its own value, 99px of
     content in a 92px box. `autofitText` shrinks the font by comparing
     `scrollWidth` against `clientWidth` (`actions/autofitText.ts:28`), and on a
     flex container the text sits in an anonymous flex item whose min-content
     width does not fall as the font does, so the action's own escape hatch
     stopped working and it gave up while still overflowing.
     A <button> already centres its content, so the flex was buying nothing and
     costing the one mechanism that keeps a long currency string inside a
     fixed-width readout. */
  .bet-open:focus-visible {
    outline: 2px solid var(--sig-cyan, #00FFFF);
    outline-offset: 2px;
    border-radius: 3px;
  }

  /* ── MINI-PLAYER HUD (R2R-R JOB C / TR-043) ──────────────────────────────
     A dedicated 44px row for Stake's 400x225 popout. Every number here is a
     real native CSS px, not a scaled one: the whole finding was that scaling a
     larger layout down is what produced the overlapping fields.

     THE HEIGHT BUDGET, since it is what everything else follows from. 225px
     total, 44px for this strip, leaving 181px of canvas. The compact strip's
     76px would have left 149px, and it stacks a label ABOVE a value inside
     that 76, which is what collided. Here label and value share one line. */
  .m-hud {
    display: flex; align-items: center; gap: 4px;
    /* flex, not width:100%. The slot is a row shared with FeatureMenu's mini
       trigger; a full-width strip would push that trigger out of the row, which
       is how the FEATURES control went missing in the first place. */
    flex: 1 1 auto; min-width: 0; height: 44px; padding: 0 4px 0 2px;
    background: linear-gradient(180deg, rgba(10, 14, 26, 0.94), rgba(6, 8, 18, 0.98));
    border-top: 1px solid rgba(0, 255, 255, 0.22);
    font-family: var(--fs-font-numeric);
    /* THE MENU BUTTON'S ICON WAS INVISIBLE HERE. Found 2026-07-26 while
       comparing the rebuilt Popout S against the owner's live capture, where
       the second control reads as an empty dark box in both.

       The cause is a borrowed rule. This profile's menu button reuses the
       portrait profile's markup, `.p-hamburger` with three `.p-hamburger-bar`
       children, and that rule paints the bars with `background: var(--p-acc)`.
       `--p-acc` is declared on `.p-hud` and nowhere else, so inside `.m-hud`
       the property is unset, the declaration is invalid at computed-value time,
       and `background` falls back to its initial value, transparent. Three bars
       of nothing, in a button a player in the popout has to find in order to
       reach the paytable, the session panel, turbo, autoplay and MAX.

       Declaring the accent here is the fix, rather than rewriting the bar rule,
       because the same borrowing happens in `.c-hud` and any future profile
       that reuses the markup would inherit the same silence. */
    --p-acc: var(--theme-primary, #00ffff);
  }
  .m-hud--overdrive {
    border-top-color: rgba(255, 0, 255, 0.35);
    --p-acc: var(--theme-secondary, #ff00ff);
  }

  .m-menu-wrapper { position: relative; flex: 0 0 auto; }
  /* 36px visual with a 44px hit area via the pseudo-element: the target is
     full size without the button itself eating the row. */
  .m-round-btn {
    position: relative;
    width: 36px; height: 36px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0, 255, 255, 0.08); border: 1px solid rgba(0, 255, 255, 0.3);
    color: #bff; cursor: pointer; padding: 0;
  }
  .m-round-btn::after { content: ''; position: absolute; inset: -4px; }
  .m-hud-menu { bottom: 44px; left: 0; }
  /* THE MENU IS TALLER THAN THE SPACE ABOVE THIS ROW AT POPOUT S, and the
     overflow goes UPWARDS, off the top of the viewport, where no scroll position
     can recover it. Measured at 400x225: the row is 44px and the menu anchors
     8px above it, leaving 177.5px, while the menu itself is 206.2px in English
     and 215.2px in Japanese. PAYTABLE rendered 28.7px above the viewport top
     with 4.3px of its 32px showing and its label cut, and in hi, ja and zh the
     first item was off screen entirely, where a real pointer click is refused
     and the paytable cannot be opened from the popout at all. Sixteen of sixteen
     locales overflowed.

     Two rules, each doing a different job.

     The tighter item padding is the FIX: it puts all six items on screen at
     once, worst locale 166.4px into the 177.5px available, so nothing has to
     scroll in any of the sixteen.

     The max-height is the GUARD, not the fix. 52px is the 44px row plus the
     3.5px the wrapper sits above the viewport bottom, rounded up. If a locale, a
     jurisdiction flag or a new item ever grows this menu past the space above
     the row again, it scrolls inside itself instead of going back off the top.

     THE GUARD IS WRITTEN ON `.m-hud .m-hud-menu`, NOT ON `.m-hud-menu`, AND THAT
     IS LOAD BEARING. The base `.hud-menu` rule carries `overflow: hidden` and
     the compiler emits it AFTER this one at equal specificity, so `overflow-y:
     auto` on `.m-hud-menu` alone loses the cascade and computes `hidden`. The
     cap would then clip the last item with no scrollbar and no way to reach it,
     which is worse than the defect it replaced. Measured both ways before
     choosing. 2026-08-10. */
  .m-hud .m-hud-menu { max-height: calc(100vh - 52px); overflow-y: auto; }
  .m-hud-menu .hud-menu-item { padding-top: 0.25rem; padding-bottom: 0.25rem; }

  /* Stats read INLINE. This is the change that removes the overlap: nothing is
     stacked in 44px, so nothing can collide with the line above it. */
  .m-stat {
    /* Balance gets the most room of the three: it is the longest string and
       the one a player checks most. The first capture showed it truncated to
       "$1..." with 60px to work in, which is not legible however tidy the row
       looks, so the flex basis is weighted rather than equal. */
    flex: 1.5 1 0; min-width: 0;
    display: flex; align-items: baseline; gap: 4px;
    padding: 0 2px; overflow: hidden;
  }
  .m-stat-label {
    flex: 0 0 auto;
    font-size: 7px; letter-spacing: 0.04em; color: #6f8a9a; text-transform: uppercase;
  }
  .m-stat-value {
    flex: 1 1 auto; min-width: 0;
    /* 11px is the base size for this size class, and the whole row is measured
       against it: the FEATURES trigger had to come back into the row (it was
       missing entirely) and something had to give. The stat VALUES are the last
       thing that may shrink and the last thing that may truncate, so the labels
       went to 7px and the gaps to 4 first.

       THE var() IS THE TR-066 FIX AND IT IS NOT COSMETIC. This rule read a flat
       `font-size: 11px` from the day this profile was written, while the markup
       carried `use:autofitText` and the comment below claimed autofit was doing
       the work. It was not. The action writes --autofit-scale and the font-size
       rule has to multiply it in for anything to happen; .p-stat-value,
       .c-stat-value and .fs-value all do, and this one did not. So on the one
       profile with the least room, nothing ever shrank, and a long value was
       simply cut by the overflow below. That is the mid-glyph cut in the
       owner's Popout S capture, and no amount of re-tuning the flex weights
       could have fixed it.

       The legible FLOOR is 9px and lives in actions/fitMoney.ts, which stops
       shrinking there and switches to the abbreviated form instead. */
    font-size: calc(11px * var(--autofit-scale, 1));
    font-weight: 700; white-space: nowrap;
    /* Uniform digit advance, so a counting-up win does not re-fit on every
       frame as the glyph widths change under it. */
    font-variant-numeric: tabular-nums;
    /* NO text-overflow: ellipsis. The value is shrunk, then abbreviated, before
       anything is allowed to be lost, and an ellipsis on top of that turns a
       small-but-readable number into an unreadable one: whichever wins, the
       player loses. Overflow stays hidden so a pathological value cannot push
       the row apart. */
    overflow: hidden;
  }
  .m-stat-value.cyan { color: #7ff; }
  .m-stat-value.magenta { color: #f9f; }
  .m-stat-value.gold { color: #ffd54a; }
  .m-stat.lit .m-stat-value.magenta { text-shadow: 0 0 8px rgba(255, 0, 255, 0.6); }

  /* Weighted by string length, and by EXPLICIT CLASS rather than by position.
     The first attempt used .m-stat:nth-of-type(2), which counts among sibling
     divs and therefore matched BALANCE rather than WIN: balance got 71px and
     truncated while win sat on 103px showing "$0.00". A positional selector in
     a row whose composition can change is a bug waiting for the next control
     to be added. */
  /* 1.25, not 1.8. At 1.8 the balance fit and the WIN value truncated instead:
     the row is a fixed budget, so over-weighting one stat simply moves the
     defect. Both measured clear at 1.25. */
  .m-stat--balance { flex: 1.15 1 0; }
  .m-stat--win { flex: 1 1 0; }
  .m-stat--bet { flex: 0 0 auto; gap: 2px; }
  .m-stat--bet .m-stat-value { min-width: 36px; text-align: center; }
  .m-bet-step {
    position: relative;
    width: 24px; height: 30px; border-radius: 6px; padding: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255, 213, 74, 0.10); border: 1px solid rgba(255, 213, 74, 0.34);
    cursor: pointer;
  }
  /* Same trick as the menu button: 26x30 visual, 44px effective target.
     -9 and not -7: the proof measured the effective box and reported 40x44,
     so the horizontal extension was one step short of the floor. Measured,
     then corrected, rather than assumed from the visual size. */
  .m-bet-step::after { content: ''; position: absolute; inset: -10px; }
  .m-bet-step svg { width: 12px; height: 8px; fill: #ffd54a; }
  .m-bet-step:disabled { opacity: 0.35; cursor: default; }
  .m-bet-step:disabled::after { content: none; }

  /* SPIN never shrinks. It is the one control that must always be operable, and
     it is the reason turbo, AUTO and MAX moved into the menu. */
  .m-spin {
    position: relative;
    flex: 0 0 auto;
    /* 44x40 visual with a 3px extension, so the effective target is 50x46.
       The proof measured 44x38 on the first pass: wide enough and two pixels
       short vertically, which is exactly the kind of miss a screenshot cannot
       show and a measurement can. */
    width: 44px; height: 40px; border-radius: 10px; padding: 0;
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at 50% 40%, rgba(0, 255, 255, 0.35), rgba(0, 120, 150, 0.5));
    border: 1px solid rgba(0, 255, 255, 0.7);
    box-shadow: 0 0 12px rgba(0, 255, 255, 0.35);
    cursor: pointer;
  }
  .m-spin::after { content: ''; position: absolute; inset: -3px; }
  .m-spin svg { width: 20px; height: 20px; fill: #eafeff; }
  .m-spin:disabled { opacity: 0.4; cursor: default; box-shadow: none; }
  .m-spin.spinning { background: radial-gradient(circle at 50% 40%, rgba(255, 0, 255, 0.3), rgba(120, 0, 150, 0.5)); border-color: rgba(255, 0, 255, 0.7); }

  /* ============================================================================
     FUTURE SPINNER - B1 HUD & CONTROL-BAR RESKIN  (production CSS)
     Fixed 1280x720 design surface (LAYOUT_SPEC v3.2/v3.6). Every coordinate
     below is the real spec coordinate already used by HudOverlay.svelte.
     Material language: brushed chrome + gunmetal + gold (DESIGN_SYSTEM Record
     of Truth), matched to the Overdrive gauge bezel. One signature colour per
     field. Base + Overdrive two-state locked via the .fs-hud--overdrive class.
     ========================================================================== */

  /* ---- token bridge: reads the app's existing --theme-* vars, falls back to
     themes.ts future-spinner palette. display:contents keeps .fs-hud a pure
     token-scope wrapper so children stay absolute against the stage ancestor. */
  .fs-hud{
    display:contents;
    --sig-cyan:    var(--theme-primary,   #00FFFF);
    --sig-magenta: var(--theme-secondary, #FF00FF);
    --sig-pink:    #FF2EC4;   /* HUD magenta used in v3.7 boxes */
    --sig-gold:    #FFD700;
    --sig-orange:  #FF9A2E;
    --navy:        #060610;
    /* live accents - flipped by the Overdrive skin below */
    --acc:  var(--sig-cyan);
    --acc2: var(--sig-pink);
  }

  /* ===== REUSABLE CHROME PRIMITIVES ==========================================
     .fs-plate  notched instrument plate (bezel + face + optional rail)
     .fs-knob   round chrome bezel (buttons)
     .fs-rail   left neon accent rail
     ========================================================================== */
  .fs-plate{
    position:absolute;
    --sig:var(--sig-cyan);
    padding:2px;                                   /* rim thickness */
    clip-path:polygon(0 0,calc(100% - 11px) 0,100% 11px,100% 100%,11px 100%,0 calc(100% - 11px));
    background:linear-gradient(150deg,#eef5fa 0%,#b3c6d2 15%,#63737f 37%,#2b363f 52%,#8499a8 72%,#dceaf2 100%);
    box-shadow:0 3px 10px rgba(0,0,0,.6),0 0 9px color-mix(in srgb,var(--sig) 20%,transparent),inset 0 1px 0 rgba(255,255,255,.35);
  }
  .fs-plate > .fs-face{
    position:absolute;inset:2px;
    clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
    background:
      linear-gradient(160deg,color-mix(in srgb,var(--sig) 15%,transparent),transparent 44%),
      linear-gradient(180deg,#111a2b 0%,#070b16 100%);
    box-shadow:inset 0 1px 0 rgba(255,255,255,.07),inset 0 -8px 18px rgba(0,0,0,.6);
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
  }
  .fs-rail{
    position:absolute;left:2px;top:9px;bottom:9px;width:3px;border-radius:2px;
    background:var(--sig);box-shadow:0 0 8px var(--sig),0 0 14px color-mix(in srgb,var(--sig) 60%,transparent);
    z-index:2;
  }
  .fs-knob{
    border-radius:50%;padding:3px;
    background:conic-gradient(from 216deg,#e7f1f7,#93a7b5,#39454f,#728593,#eef5fa,#4f5f6b,#a9bcc8,#e7f1f7);
    box-shadow:0 3px 10px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.55);
  }
  .fs-knob > .fs-face{
    position:absolute;inset:3px;border-radius:50%;
    background:radial-gradient(circle at 36% 28%,#1a3640,#06131c 72%);
    box-shadow:inset 0 2px 3px rgba(255,255,255,.14),inset 0 -6px 12px rgba(0,0,0,.7);
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;
  }

  /* ===== PANEL ================================================================
     v3.2: x296..984 (688 wide), y560..648, radius18. Slim chrome sub-frame. */
  /* OWNER AUDIT ROUND 3 item 7: widened/reflowed to keep underlying MAX
     through STEPPERS (the whole re-measured banner shifted right and
     widened slightly) - see docs/HUD_SPEC.md. TURBO and SPIN/AUTO stay
     outside the panel, as before. */
  .fs-panel{
    position:absolute;left:309px;top:560px;width:711px;height:88px;z-index:59;
    border-radius:18px;pointer-events:none;
    background:linear-gradient(135deg,rgba(6,9,20,.86) 0%,rgba(10,15,34,.74) 100%);
    border:1px solid transparent;
    background-image:
      linear-gradient(135deg,rgba(6,9,20,.86),rgba(10,15,34,.74)),
      linear-gradient(180deg,color-mix(in srgb,var(--acc) 55%,#c9d7e0),color-mix(in srgb,var(--acc) 12%,#2b363f));
    background-origin:border-box;background-clip:padding-box,border-box;
    box-shadow:
      0 6px 22px rgba(0,0,0,.5),
      inset 0 1px 0 rgba(255,255,255,.06),
      0 0 22px color-mix(in srgb,var(--acc) 22%,transparent);
  }

  /* ===== BALANCE / WIN / BET =================================================
     Fixed geometry (never reflow). Signature colour per field. OWNER AUDIT
     ROUND 3 item 7: shifted right as part of the whole-banner re-measure
     (locked spec, docs/HUD_SPEC.md) - a consistent 16px gap now separates
     every distinct control across the entire row, MENU through AUTO. ---- */
  .fs-box{position:absolute;top:573px;height:62px;z-index:60;}
  .fs-box .fs-face{padding:0 10px;}
  .fs-balance{left:449px;width:200px;--sig:var(--sig-cyan);}
  .fs-win    {left:665px;width:150px;--sig:var(--sig-pink);}
  .fs-bet    {left:831px;width:120px;--sig:var(--sig-gold);}
  .fs-bet .fs-face{align-items:flex-end;padding-right:14px;}
  /* OVERBOOST glow pulse (2026-07-15, item 3): fires once on the OFF->ON
     transition (see HudOverlay's script section) - overrides .fs-plate's
     static glow for one cycle, then reverts. */
  @keyframes overboost-bet-pulse-landscape {
    0%   { box-shadow:0 3px 10px rgba(0,0,0,.6),0 0 9px color-mix(in srgb,var(--sig-gold) 20%,transparent),inset 0 1px 0 rgba(255,255,255,.35); }
    35%  { box-shadow:0 3px 10px rgba(0,0,0,.6),0 0 22px 4px color-mix(in srgb,var(--sig-orange, #ff9a2e) 75%,transparent),inset 0 1px 0 rgba(255,255,255,.35); }
    100% { box-shadow:0 3px 10px rgba(0,0,0,.6),0 0 9px color-mix(in srgb,var(--sig-gold) 20%,transparent),inset 0 1px 0 rgba(255,255,255,.35); }
  }
  .fs-bet.overboost-pulse { animation: overboost-bet-pulse-landscape 0.7s ease-out; }

  .fs-label{
    font-family: var(--fs-font-numeric);font-size:.52rem;font-weight:700;
    letter-spacing:.18em;text-transform:uppercase;color:rgba(190,232,255,.62);
    position:relative;z-index:1;
  }
  .fs-value{
    font-family: var(--fs-font-numeric);
    font-size:calc(1.02rem * var(--autofit-scale, 1));
    font-weight:700;
    letter-spacing:.04em;white-space:nowrap;font-variant-numeric:tabular-nums;
    position:relative;z-index:1;
    -webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;
  }
  /* Crisp glyphs: near-white fill, one tight 3px halo (no wide blur = no fuzz). */
  .fs-value.cyan   {color:color-mix(in srgb,var(--sig-cyan) 18%,#ffffff);text-shadow:0 0 3px color-mix(in srgb,var(--sig-cyan) 60%,transparent);}
  .fs-value.magenta{color:color-mix(in srgb,var(--sig-pink) 20%,#ffffff);text-shadow:0 0 3px color-mix(in srgb,var(--sig-pink) 60%,transparent);}
  .fs-value.gold   {color:color-mix(in srgb,var(--sig-gold) 28%,#ffffff);text-shadow:0 0 3px color-mix(in srgb,var(--sig-gold) 55%,transparent);}
  .fs-bet .fs-label,.fs-bet .fs-value{text-align:right;width:100%;}

  /* Cost-visibility mode badge (Fable 2026-07-07 item 0): a plain (unclipped)
     anchor matching the BET box's own fixed geometry exactly, sitting just
     above it - kept OUTSIDE .fs-bet/.fs-plate deliberately, since .fs-plate's
     clip-path would otherwise clip a child poking above its own bounds. */
  .fs-bet-badge-anchor{
    position:absolute; left:831px; top:557px; width:120px; height:16px;
    z-index:61; display:flex; justify-content:flex-end; pointer-events:none;
  }
  .fs-mode-badge{
    font-family: var(--fs-font-numeric); font-size:.5rem; font-weight:800;
    letter-spacing:.1em; white-space:nowrap;
    /* text-transform: uppercase REMOVED 2026-07-28 (TR-092). It made the HUD
       badge render CRUISE while the features menu, the paytable mode row and
       the buy dialog all render Cruise, from the SAME modeLabel() source. The
       specification's own spelling is `Cruise` (CLAUDE.md True game facts and
       fsModes.ts), so the badge was the outlier. OVERBOOST and NITRO OVERDRIVE
       are unaffected: they are already capitals in the specification. */
    padding:2px 7px; border-radius:999px;
  }
  .fs-mode-badge.overboost{
    color:#1a0d02; background:var(--sig-orange);
    box-shadow:0 0 8px color-mix(in srgb,var(--sig-orange) 55%,transparent);
  }
  .fs-mode-badge.cruise{
    color:color-mix(in srgb,var(--sig-cyan) 30%,#fff);
    background:rgba(0,240,255,.08);
    border:1px solid color-mix(in srgb,var(--sig-cyan) 40%,transparent);
  }

  /* WIN plate lit - win present. Rail + face bloom, value count-pulse. */
  .fs-win.lit{--sig:var(--sig-pink);}
  .fs-win.lit{filter:drop-shadow(0 0 12px color-mix(in srgb,var(--sig-pink) 70%,transparent));}
  .fs-win.lit .fs-rail{animation:fs-rail-bloom 1.1s ease-in-out infinite;}
  .fs-win.lit .fs-value{animation:fs-win-pop 1.1s ease-in-out infinite;}
  @keyframes fs-rail-bloom{0%,100%{box-shadow:0 0 8px var(--sig-pink);}50%{box-shadow:0 0 16px var(--sig-pink),0 0 28px var(--sig-pink);}}
  @keyframes fs-win-pop{0%,100%{transform:scale(1);}50%{transform:scale(1.06);}}

  /* ===== BET ARROWS - chrome nubs, cyan chevrons ============================
     OWNER AUDIT ROUND 3 item 7: shifted to x967 as part of the whole-banner
     re-measure (locked spec, docs/HUD_SPEC.md) - a consistent 16px gap from
     the BET plate's new right edge at x951. */
  .fs-arrows{position:absolute;left:967px;top:578px;width:44px;height:52px;z-index:60;
    display:flex;flex-direction:column;gap:4px;}
  .fs-arrow{
    width:44px;height:24px;padding:0;border:none;cursor:pointer;position:relative;
    border-radius:5px;background:transparent;
    display:flex;align-items:center;justify-content:center;
  }
  .fs-arrow::before{                              /* chrome cap */
    content:'';position:absolute;inset:0;border-radius:5px;
    background:linear-gradient(180deg,#c8d8e2,#5c6c78 55%,#26313a);
    box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 1px 3px rgba(0,0,0,.6);
  }
  .fs-arrow svg{position:relative;z-index:1;width:15px;height:9px;
    filter:drop-shadow(0 0 4px color-mix(in srgb,var(--acc) 80%,transparent));}
  .fs-arrow svg path{fill:var(--acc);}
  .fs-arrow:hover:not(:disabled)::before{filter:brightness(1.18);}
  .fs-arrow:active:not(:disabled){transform:translateY(1px);}
  .fs-arrow:disabled{opacity:.4;cursor:not-allowed;filter:grayscale(.4);}

  /* ===== MAX chip - OWNER AUDIT ROUND 3 item 7: adopts the mobile
     .p-round-btn/.p-max-cap circular treatment (was a narrow 26x44
     rectangular "cap", the one control that didn't match the rest of the
     banner's circular-button language) - 48px circle, same shared vertical
     centre (y=604) as every other control in the locked spec
     (docs/HUD_SPEC.md). ============================================== */
  .fs-max{position:absolute;left:325px;top:580px;width:48px;height:48px;padding:0;
    border:none;border-radius:50%;cursor:pointer;z-index:60;
    background:radial-gradient(circle at 36% 28%,#2a2410,#0d0b04 72%);
    box-shadow:0 2px 8px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.12);
    display:flex;align-items:center;justify-content:center;}
  .fs-max .cap{
    font-family: var(--fs-font-numeric);font-size:.62rem;font-weight:800;letter-spacing:.02em;
    color:#ffe58a;text-shadow:0 0 6px var(--sig-gold);
  }
  .fs-max:hover:not(:disabled){filter:brightness(1.2);}
  .fs-max:active:not(:disabled){transform:translateY(1px);}
  .fs-max:disabled{opacity:.4;cursor:not-allowed;}

  /* ===== HAMBURGER menu - chrome square. OWNER AUDIT ROUND 3 item 7: bumped
     40px -> 44px (was under the 44px touch-target floor); position now set
     by .menu-wrapper below (locked spec, docs/HUD_SPEC.md), these left/top
     values are inert when wrapped there but kept in sync for clarity. ==== */
  .fs-menu{position:absolute;left:389px;top:582px;width:44px;height:44px;z-index:60;
    padding:0;border:none;cursor:pointer;border-radius:9px;
    background:linear-gradient(160deg,#c6d6e0,#55656f 52%,#222c34);
    box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 2px 5px rgba(0,0,0,.55);
    display:flex;align-items:center;justify-content:center;}
  .fs-menu .inset{width:35px;height:35px;border-radius:6px;
    background:radial-gradient(circle at 38% 30%,#15222b,#070d14 72%);
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
    box-shadow:inset 0 0 8px rgba(0,0,0,.7);}
  .fs-menu .bar{width:16px;height:2px;border-radius:1px;background:var(--acc);
    box-shadow:0 0 5px color-mix(in srgb,var(--acc) 80%,transparent);}
  .fs-menu:hover .bar{filter:brightness(1.3);}
  .fs-menu:active{transform:translateY(1px);}

  /* ===== TURBO - chrome knob, orange flame accent (x227 top563, 82) =======
     2026-07-14 portrait pass, landscape touch-target audit: at the typical
     landscape-phone scale factor (~0.54, e.g. iPhone 14 landscape 844x390),
     the previous 72x72 box read as ~39x39 effective - under the 44px floor.
     Bumped to 82x82 (recentred on the old 72x72 box) so it clears 44px
     effective at 0.54 scale with margin (82*0.54=~44.3px); the 40px gap to
     .fs-menu absorbs the size increase without collision. */
  /* FS VISUAL FIXPACK JOB 2 (owner-specified, 2026-07-27): THE NUMERAL IS GONE.
     The control was a bolt with a 0.5rem "1x / 2x / 4x" caption underneath it,
     which the owner called too small and silly. The new design is the bolt
     alone, and the three speeds are carried by the CONTROL INTENSIFYING:
     brighter face, brighter bolt, stronger glow at each step.

     WHY THE STEPS ARE LUMINANCE STEPS, NOT HUE STEPS. Encoding state in hue
     alone fails WCAG 1.4.1 for a colour-blind player and fails again on a
     washed-out phone screen in daylight. Every step here raises brightness,
     which is the channel that survives both, and it is the channel
     turbo_intensity_gate.mjs measures: it screenshots the real composited
     control at each tier and asserts the mean relative luminance rises
     monotonically with a real contrast step between adjacent states.

     THE FLAME ANIMATION IS REMOVED, and that is deliberate rather than
     collateral. It ran `fs-flame .8s alternate`, swinging brightness 1.0 to
     1.28 twice a second on any engaged tier. Once intensity IS the state, an
     animation that changes intensity makes the state ambiguous: a pulsing
     Turbo passes through the brightness of Super Turbo on every cycle, so at a
     glance the two are not distinguishable, which is exactly what the ruling
     asks for. It also made the states unmeasurable.

     The bolt grew 26px to 34px: it no longer shares the face with a caption. */
  .fs-turbo{position:absolute;left:227px;top:563px;width:82px;height:82px;z-index:60;
    padding:0;border:none;cursor:pointer;}
  .fs-turbo svg{width:34px;height:34px;}
  .fs-turbo:disabled{opacity:.5;cursor:not-allowed;}

  /* Step 1 of 3, Normal. Resting: a dim bolt on a near-black face, no glow. */
  .fs-turbo[data-speed="normal"] .fs-face{
    background:radial-gradient(circle at 36% 28%,#241505,#070502 72%);
    box-shadow:inset 0 2px 3px rgba(255,255,255,.08),inset 0 -6px 12px rgba(0,0,0,.78);}
  .fs-turbo[data-speed="normal"] svg path{fill:rgba(255,178,100,.40);}

  /* Step 2 of 3, Turbo. The face warms, the bolt lights, a glow appears. */
  .fs-turbo[data-speed="turbo"] .fs-face{
    background:radial-gradient(circle at 36% 28%,#96601b,#2a1808 72%);
    box-shadow:inset 0 2px 4px rgba(255,225,180,.3),inset 0 -6px 12px rgba(0,0,0,.5);}
  .fs-turbo[data-speed="turbo"] svg path{fill:#ffc266;}
  .fs-turbo[data-speed="turbo"]{filter:drop-shadow(0 0 16px rgba(255,125,30,.78));}

  /* Step 3 of 3, Super Turbo. The bolt goes white hot, the face is at its
     brightest, and the glow grows in radius and gains a second wider pass. */
  .fs-turbo[data-speed="super"] .fs-face{
    background:radial-gradient(circle at 36% 28%,#ffb43c,#5e3410 72%);
    box-shadow:inset 0 2px 8px rgba(255,248,232,.62),inset 0 -6px 12px rgba(0,0,0,.3);}
  .fs-turbo[data-speed="super"] svg path{fill:#fffaf0;}
  .fs-turbo[data-speed="super"]{
    filter:drop-shadow(0 0 24px rgba(255,160,60,1)) drop-shadow(0 0 46px rgba(255,100,25,.72));}

  /* ===== AUTOPLAY - chrome knob. OWNER AUDIT ROUND 3 item 7: docked as a
     circle tangent to SPIN's right edge (x1111 = SPIN's left 1027 + its own
     width 84 - touching, never overlapping), same shared vertical centre
     y=604 as the rest of the locked spec (docs/HUD_SPEC.md) - was sitting
     well below-left of SPIN entirely unaligned (top:648 vs SPIN's top:562,
     centres 68px apart). ================================================ */
  .fs-auto{position:absolute;left:1111px;top:580px;width:48px;height:48px;z-index:60;
    padding:0;border:none;cursor:pointer;}
  .fs-auto .fs-face{gap:0;}
  .fs-auto svg{width:20px;height:20px;}
  .fs-auto svg path{fill:none;stroke:rgba(200,236,255,.7);stroke-width:5;}
  .fs-auto .count{font-family: var(--fs-font-numeric);font-size:.9rem;font-weight:800;
    color:var(--acc);font-variant-numeric:tabular-nums;text-shadow:0 0 8px var(--acc);}
  .fs-auto:disabled{opacity:.4;cursor:not-allowed;}
  .fs-auto.active{filter:drop-shadow(0 0 12px color-mix(in srgb,var(--acc) 75%,transparent));
    animation:fs-auto-pulse 1s ease-in-out infinite alternate;}
  .fs-auto.active svg path{stroke:var(--acc);}
  @keyframes fs-auto-pulse{from{filter:drop-shadow(0 0 6px color-mix(in srgb,var(--acc) 40%,transparent));}
    to{filter:drop-shadow(0 0 16px color-mix(in srgb,var(--acc) 90%,transparent));}}

  /* ===== SPIN - crafted chrome, cyan redline ring (x1027 top562, 84) ======
     OWNER AUDIT ROUND 3 item 7: shifted to x1027 (was x962) as part of the
     whole-banner re-measure (locked spec, docs/HUD_SPEC.md) - a consistent
     16px gap from the bet-steppers' new right edge at x1011. Replaces
     spin_button.png. Bezel + dark dome + emissive ring + SVG glyph. */
  .fs-spin{position:absolute;left:1027px;top:562px;width:84px;height:84px;z-index:61;
    padding:0;border:none;cursor:pointer;border-radius:50%;
    background:conic-gradient(from 216deg,#e7f1f7,#8fa3b1,#333f49,#6d8090,#eef5fa,#47565f,#a4b7c3,#e7f1f7);
    box-shadow:0 4px 14px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.6),
               0 0 20px color-mix(in srgb,var(--acc) 55%,transparent);
    transition:transform .12s ease,box-shadow .15s ease;}
  .fs-spin .ring{position:absolute;inset:5px;border-radius:50%;
    border:2px solid var(--acc);box-shadow:0 0 12px var(--acc),inset 0 0 10px color-mix(in srgb,var(--acc) 50%,transparent);}
  .fs-spin .dome{position:absolute;inset:9px;border-radius:50%;
    background:radial-gradient(circle at 36% 28%,#1a3a44,#05131b 70%);
    box-shadow:inset 0 3px 5px rgba(255,255,255,.16),inset 0 -8px 16px rgba(0,0,0,.75);
    display:flex;align-items:center;justify-content:center;}
  .fs-spin .glyph{width:30px;height:30px;}
  .fs-spin .glyph.play path{fill:var(--acc);filter:drop-shadow(0 0 6px var(--acc));}
  .fs-spin .glyph.arrows{display:none;}
  .fs-spin .glyph.arrows path{fill:none;stroke:var(--acc);stroke-width:5;stroke-linecap:round;
    filter:drop-shadow(0 0 6px var(--acc));}
  .fs-spin .txt{position:absolute;bottom:14px;left:0;right:0;text-align:center;
    font-family: var(--fs-font-numeric);font-size:.46rem;font-weight:800;letter-spacing:.14em;
    color:var(--acc);text-shadow:0 0 6px var(--acc);}
  .fs-spin:hover:not(:disabled){transform:scale(1.05);
    box-shadow:0 4px 18px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.6),0 0 30px var(--acc);}
  .fs-spin:active:not(:disabled){transform:scale(.96);}
  .fs-spin:disabled{opacity:.45;cursor:not-allowed;filter:grayscale(.4);box-shadow:none;}
  .fs-spin.spinning .glyph.play{display:none;}
  .fs-spin.spinning .glyph.arrows{display:block;animation:fs-spin-rot .7s linear infinite;}
  .fs-spin.spinning .txt{opacity:.5;}
  @keyframes fs-spin-rot{to{transform:rotate(360deg);}}

  /* ===== SWAPPABLE COLOUR SCHEMES (slot-template layer) =====================
     The HUD is skin-free: every colour comes from 5 signature tokens. Drop a
     scheme class on the .fs-hud root and the whole bar re-tints. */
  .fs-hud.scheme-trap { --sig-cyan:#39FF14; --sig-pink:#FF7A1A; --sig-gold:#EBFF5A; --sig-orange:#FF6600; } /* Trap Lane   */
  .fs-hud.scheme-oil  { --sig-cyan:#FF8A3D; --sig-pink:#D9A86A; --sig-gold:#F5D061; --sig-orange:#FF5A1F; } /* Oil & Fire  */
  .fs-hud.scheme-pitch{ --sig-cyan:#2FD24F; --sig-pink:#FFD700; --sig-gold:#EDE7C8; --sig-orange:#4CE06B; } /* Beautiful Game */

  /* ===== OVERDRIVE TWO-STATE ================================================
     App sets .fs-hud--overdrive (mirror overdriveVisual). Accents flip
     cyan->magenta, spin ring goes redline, panel edge warms. */
  .fs-hud--overdrive{--acc:var(--sig-pink);--acc2:var(--sig-orange);}
  .fs-hud--overdrive .fs-spin .dome{background:radial-gradient(circle at 36% 28%,#4a1030,#1a0510 70%);}
  .fs-hud--overdrive .fs-spin .ring{border-color:var(--sig-pink);
    box-shadow:0 0 14px var(--sig-pink),0 0 26px color-mix(in srgb,var(--sig-orange) 45%,transparent);}
  .fs-hud--overdrive .fs-panel{animation:fs-od-edge 3s ease-in-out infinite;}
  @keyframes fs-od-edge{0%,100%{box-shadow:0 6px 22px rgba(0,0,0,.5),0 0 20px color-mix(in srgb,var(--sig-pink) 30%,transparent);}
    50%{box-shadow:0 6px 22px rgba(0,0,0,.5),0 0 34px color-mix(in srgb,var(--sig-pink) 65%,transparent);}}
  .fs-hud--overdrive .fs-arrows,
  .fs-hud--overdrive .fs-menu,
  .fs-hud--overdrive .fs-auto{filter:hue-rotate(-6deg) saturate(1.08);}

  @media (prefers-reduced-motion:reduce){
    /* .fs-turbo.engaged is no longer listed: the flame animation it stilled
       was removed outright by FS VISUAL FIXPACK JOB 2, so the control is
       already motionless at every tier for every player. */
    .fs-win.lit .fs-rail,.fs-win.lit .fs-value,.fs-auto.active,
    .fs-spin.spinning .glyph.arrows,.fs-hud--overdrive .fs-panel{animation:none;}
  }

  /* ============================================================================
     DROPDOWN MENUS - NOT part of the design pass (kept from the live component).
     The menu / autoplay wrappers position the new chrome buttons and anchor
     their dropdowns; the buttons themselves render static inside the wrapper so
     their spec coordinates are unchanged.
     ========================================================================== */
  .menu-wrapper {
    position: absolute;
    left: 389px;
    top: 582px;
    width: 44px;
    height: 44px;
    z-index: 60;
  }
  .menu-wrapper .fs-menu { position: static; left: auto; top: auto; }

  .hud-menu {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    min-width: 200px;
    background: rgba(6, 6, 18, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    overflow: hidden;
    z-index: 65;
  }
  .hud-menu-item {
    display: block;
    width: 100%;
    padding: 0.5rem 0.9rem;
    background: none;
    border: none;
    color: #fff;
    text-align: left;
    font-size: 0.8rem;
    cursor: pointer;
  }
  .hud-menu-item:hover { background: rgba(255, 255, 255, 0.08); }

  /* FS VISUAL FIXPACK JOB 2: at Popout S the speed control lives ONLY in this
     menu, so the menu item has to carry the same three-step intensity the knob
     carries everywhere else. Same bolt, same brightening, same fill growth; the
     localised word stays because a menu item needs a label. */
  /* THE WHOLE ROW CARRIES THE STEP, not just the glyph. First measured with the
     intensity on the 16px bolt alone: the adjacent-state contrast at Popout S
     came out at 1.014:1 and 1.030:1, effectively flat, because the bolt is a few
     percent of the row's area and the row is what a player looks at. A cue that
     only a measuring instrument can find is not "clearly distinguishable at a
     glance". So the row's fill and its leading edge intensify with the bolt. */
  .m-turbo-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .m-turbo-bolt { width: 20px; height: 20px; flex: 0 0 auto; }
  /* All three tiers carry the leading edge; it is the edge's brightness that
     steps, so the row's shape never changes and only its intensity does. */
  .m-turbo-item[data-speed="normal"] {
    background: rgba(0, 0, 0, 0.22);
    box-shadow: inset 3px 0 0 rgba(255, 200, 150, 0.26);
  }
  .m-turbo-item[data-speed="normal"] .m-turbo-bolt path { stroke: rgba(255, 200, 150, 0.5); stroke-width: 1.8; fill: none; }

  .m-turbo-item[data-speed="turbo"] {
    background: linear-gradient(90deg, rgba(255, 154, 46, 0.48), rgba(255, 154, 46, 0.12));
    box-shadow: inset 3px 0 0 #ff9a2e;
  }
  .m-turbo-item[data-speed="turbo"] .m-turbo-bolt path { stroke: #ffc266; stroke-width: 1.8; fill: rgba(255, 154, 46, 0.55); }
  .m-turbo-item[data-speed="turbo"] .m-turbo-bolt { filter: drop-shadow(0 0 6px rgba(255, 130, 30, 0.8)); }

  .m-turbo-item[data-speed="super"] {
    background: linear-gradient(90deg, rgba(255, 186, 74, 0.82), rgba(255, 150, 50, 0.26));
    box-shadow: inset 4px 0 0 #fffaf0, 0 0 18px rgba(255, 140, 40, 0.55);
    color: #1a0d02;
  }
  .m-turbo-item[data-speed="super"] .m-turbo-bolt path { stroke: #fffaf0; stroke-width: 1.8; fill: #ffdca8; }
  .m-turbo-item[data-speed="super"] .m-turbo-bolt { filter: drop-shadow(0 0 10px rgba(255, 170, 70, 1)) drop-shadow(0 0 18px rgba(255, 100, 25, 0.7)); }

  /* ── Audio panel - Mute toggle + MUSIC / SOUND volume sliders ─────────────── */
  .audio-panel {
    border-top: 1px solid rgba(0, 255, 255, 0.14);
    padding-bottom: 0.4rem;
    transition: opacity 0.15s;
  }
  /* When muted, dim the sliders (they stay adjustable). */
  .audio-panel.muted .audio-row { opacity: 0.45; }
  .audio-mute { padding-top: 0.55rem; }
  /* The speaker was two operating-system emoji, U+1F507 and U+1F50A, typeset in
     a text run beside this menu's drawn 24x24 SVG icons. An emoji is rendered by
     the platform's colour emoji font, so it looked like a different product on
     every device and could never carry the brand face. Now one drawn icon in the
     same geometric family as the turbo bolt and the autoplay glyphs above it.
     QUALITY_CHARTER.md Q-03. */
  .audio-mute-icon {
    width: 14px;
    height: 14px;
    vertical-align: -2px;
    margin-left: 6px;
  }
  .audio-mute-icon path { fill: currentColor; }
  .audio-mute-icon path.wave,
  .audio-mute-icon path.mute-slash {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
  }
  .audio-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.3rem 0.9rem;
  }
  .audio-label {
    flex: 0 0 42px;
    font-family: var(--fs-font-display);
    font-size: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: rgba(159, 239, 255, 0.75);
  }
  .audio-pct {
    flex: 0 0 30px;
    text-align: right;
    font-size: 0.58rem;
    font-variant-numeric: tabular-nums;
    color: var(--sig-cyan, #00ffff);
  }

  /* Range slider styled on the HUD's cyan accent (track + thumb). */
  .audio-slider {
    flex: 1 1 auto;
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(90deg, rgba(0, 255, 255, 0.55), rgba(0, 255, 255, 0.15));
    outline: none;
    cursor: pointer;
    margin: 0;
  }
  .audio-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--sig-cyan, #00ffff);
    border: 1px solid rgba(4, 6, 18, 0.9);
    box-shadow: 0 0 6px rgba(0, 255, 255, 0.7);
    cursor: pointer;
  }
  .audio-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--sig-cyan, #00ffff);
    border: 1px solid rgba(4, 6, 18, 0.9);
    box-shadow: 0 0 6px rgba(0, 255, 255, 0.7);
    cursor: pointer;
  }
  .audio-slider::-moz-range-track {
    height: 4px;
    border-radius: 2px;
    background: rgba(0, 255, 255, 0.25);
  }

  /* OWNER AUDIT ROUND 3 item 7: this wrapper (not .fs-auto itself, which it
     forces to position:static) is the real positioning authority - docked
     tangent to SPIN's right edge, locked spec in docs/HUD_SPEC.md. */
  .autoplay-wrapper {
    position: absolute;
    left: 1111px;
    top: 580px;
    width: 48px;
    height: 48px;
    z-index: 60;
  }
  .autoplay-wrapper .fs-auto { position: static; left: auto; top: auto; }

  /* OWNER AUDIT ROUND 3, item 9: enlarged with generous spacing throughout -
     was a cramped 64px-min-width dropdown with sub-44px checkboxes/inputs/
     buttons (the .auto-menu-input number fields had no explicit height at
     all, effectively ~20px tall). Every interactive row is now a real 44px+
     target, shared by all three layouts (desktop/portrait/compact-landscape
     all render this same markup - see the three `.auto-menu`-class mounts
     above). */
  .auto-menu {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10, 10, 30, 0.97);
    border: 1px solid rgba(255, 200, 50, 0.35);
    border-radius: 12px;
    overflow-x: hidden;
    overflow-y: auto;
    max-height: calc(100vh - 90px);
    z-index: 65;
    min-width: 220px;
    padding: 6px 0;
  }
  .auto-menu-item {
    display: block;
    width: 100%;
    min-height: 44px;
    padding: 0.6rem 1rem;
    background: none;
    border: none;
    color: #ffc832;
    cursor: pointer;
    font-size: 1rem;
    text-align: center;
    box-sizing: border-box;
  }
  .auto-menu-item:hover { background: rgba(255, 200, 50, 0.15); }

  /* R042 BRIEF B. The chosen count has to be VISIBLE, or a two-step flow reads
     as a broken one-step flow: the player taps a number, nothing appears to
     happen, and they tap again. The selected state and the Start control are
     what make the second step legible. */
  .auto-menu-item.is-selected {
    background: rgba(255, 200, 50, 0.22);
    box-shadow: inset 3px 0 0 #ffc832;
    font-weight: 700;
  }
  .auto-menu-start {
    display: block;
    width: 100%;
    min-height: 44px;
    margin-top: 4px;
    padding: 0.6rem 1rem;
    background: rgba(255, 200, 50, 0.18);
    border: 1px solid rgba(255, 200, 50, 0.55);
    border-radius: 6px;
    color: #ffc832;
    font: inherit;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-align: center;
    cursor: pointer;
  }
  .auto-menu-start:hover { background: rgba(255, 200, 50, 0.3); }

  .auto-menu-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 0.5rem 1rem;
    font-size: 0.82rem;
    letter-spacing: 0.02em;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    white-space: nowrap;
    box-sizing: border-box;
  }
  .auto-menu-toggle input {
    accent-color: #00ffff;
    cursor: pointer;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
  .auto-menu-amount {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 0.4rem 1rem 0.4rem 2.4rem;
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.65);
    box-sizing: border-box;
  }
  .auto-menu-input {
    width: 5.2rem;
    min-height: 44px;
    padding: 8px 10px;
    font-size: 0.95rem;
    font-family: var(--fs-font-display);
    color: #fff;
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid rgba(0, 255, 255, 0.4);
    border-radius: 6px;
    box-sizing: border-box;
  }
  .auto-menu-sep {
    padding: 0.5rem 1rem 0.25rem;
    font-size: 0.66rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 200, 50, 0.5);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 2px;
  }

  /* ============================================================================
     PORTRAIT HUD (2026-07-14 portrait pass) - fully self-contained, native
     CSS px throughout (never affected by the stage's --S scale, since this
     renders as a normal-flow sibling outside the scaled 1280x720 stage - see
     App.svelte). Every font-size here is >=11px (legibility floor); every
     interactive control is >=44px effective (touch-target floor). Uses its
     own p- prefixed classes throughout rather than reusing the landscape
     fs-* classes, since those carry hardcoded LAYOUT_SPEC absolute
     coordinates that would need overriding anyway - a fresh, isolated set of
     rules is less risk than fighting the absolute-position cascade.
     ========================================================================== */
  .p-hud {
    --p-cyan: var(--theme-primary, #00ffff);
    --p-pink: var(--theme-secondary, #ff00ff);
    --p-gold: #ffd700;
    --p-orange: #ff9a2e;
    --p-acc: var(--p-cyan);
    /* 2026-07-14c grid-first recomposition: fills all of App.svelte's
       .native-hud-slot.portrait (flex:1, grows to the viewport bottom)
       instead of v1's content-sized block, then space-between pins
       .p-controls-row to the true bottom safe-area while .p-top-group
       (stats+bet) stays flush against the top of this region, right below
       FeatureMenu's bar - eliminates the v1 dead-gap bug's replacement
       (a gap that could reappear between top-group and controls on a very
       tall phone) by making that gap the ONE deliberate breathing space the
       brief allows, not an accidental one. */
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
    padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
    font-family: var(--fs-font-display);
    background: linear-gradient(180deg, rgba(6, 9, 20, 0.92), rgba(4, 6, 14, 0.98));
  }
  .p-hud--overdrive { --p-acc: var(--p-pink); }
  .p-top-group { display: flex; flex-direction: column; gap: 10px; flex: 0 0 auto; }

  .p-stats-row { display: flex; flex-direction: row; gap: 8px; }
  .p-stat {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 8px 6px;
    min-height: 52px;
    border-radius: 10px;
    background: linear-gradient(160deg, rgba(0, 255, 255, 0.08), transparent 60%), #0c1220;
    border: 1px solid rgba(255, 255, 255, 0.08);
    position: relative;
  }
  .p-stat.lit { border-color: color-mix(in srgb, var(--p-pink) 55%, transparent); }
  /* NEON LIFT (2026-07-15): subtle persistent per-field neon edge, distinct
     from .lit's stronger "there's an active win" state above. */
  .p-stat--balance {
    border-color: color-mix(in srgb, var(--p-cyan) 35%, transparent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--p-cyan) 20%, transparent);
  }
  .p-stat--win {
    border-color: color-mix(in srgb, var(--p-pink) 30%, transparent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--p-pink) 16%, transparent);
  }
  .p-stat-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(190, 232, 255, 0.65);
    white-space: nowrap;
  }
  .p-stat-value {
    /* OWNER AUDIT REMEDIATION B1: font-size scales down via the
       autofitText action's --autofit-scale custom property so values up to
       $999,999.99 fit without truncating - text-overflow:ellipsis stays as
       a defensive fallback only, not the primary mechanism now. */
    font-size: calc(16px * var(--autofit-scale, 1));
    font-weight: 700;
    letter-spacing: 0.02em;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* BET's own full-width row (2026-07-14 portrait pass correction): the
     original single 3-column .p-stats-row left no room for two 44px
     steppers plus a stress-value bet figure ($1,000,000.00-scale balances
     are a real, tested case per this file's landscape doc comment above) -
     confirmed overflowing in the committed portrait-v1 screenshots. */
  .p-bet-stat {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    /* OWNER AUDIT ROUND 2, item 7: the row read cramped at 10px - opened up
       for a more generous, full-width feel now that it already has the
       whole row to itself (44px+ targets below are unaffected either way). */
    gap: 16px;
    padding: 8px 14px;
    min-height: 52px;
    border-radius: 10px;
    background: linear-gradient(160deg, rgba(255, 215, 0, 0.08), transparent 60%), #0c1220;
    border: 1px solid color-mix(in srgb, var(--p-gold) 30%, transparent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--p-gold) 16%, transparent);
    transition: box-shadow 0.15s ease;
  }
  /* OVERBOOST glow pulse (2026-07-15, item 3): fires once on the OFF->ON
     transition (see HudOverlay's script section), not a permanent state. */
  @keyframes overboost-bet-pulse {
    0%   { box-shadow: 0 0 8px color-mix(in srgb, var(--p-gold) 16%, transparent); }
    35%  { box-shadow: 0 0 22px 4px color-mix(in srgb, var(--p-orange) 70%, transparent); }
    100% { box-shadow: 0 0 8px color-mix(in srgb, var(--p-gold) 16%, transparent); }
  }
  .p-bet-stat.overboost-pulse { animation: overboost-bet-pulse 0.7s ease-out; }
  .p-stat-value.cyan { color: color-mix(in srgb, var(--p-cyan) 20%, #fff); }
  .p-stat-value.magenta { color: color-mix(in srgb, var(--p-pink) 22%, #fff); }
  .p-stat-value.gold { color: color-mix(in srgb, var(--p-gold) 30%, #fff); }

  .p-bet-row { display: flex; align-items: center; gap: 10px; }
  .p-bet-step {
    /* 2026-07-14 portrait pass, touch-target audit (portrait_layout_
       conformance.mjs): the original 30x30 box measured below the 44px
       floor - bumped to a real 44x44 hit target, confirmed by re-running
       the audit rather than assumed. */
    width: 44px;
    height: 44px;
    min-width: 44px;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .p-bet-step svg { width: 12px; height: 8px; }
  .p-bet-step svg path { fill: var(--p-acc); }
  .p-bet-step:disabled { opacity: 0.4; cursor: not-allowed; }

  .p-mode-badge {
    position: absolute;
    top: -8px;
    right: 6px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    /* text-transform: uppercase REMOVED 2026-07-28 (TR-092). It made the HUD
       badge render CRUISE while the features menu, the paytable mode row and
       the buy dialog all render Cruise, from the SAME modeLabel() source. The
       specification's own spelling is `Cruise` (CLAUDE.md True game facts and
       fsModes.ts), so the badge was the outlier. OVERBOOST and NITRO OVERDRIVE
       are unaffected: they are already capitals in the specification. */
    white-space: nowrap;
    padding: 2px 8px;
    border-radius: 999px;
  }
  .p-mode-badge.overboost { color: #1a0d02; background: var(--p-orange); }
  .p-mode-badge.cruise {
    color: color-mix(in srgb, var(--p-cyan) 30%, #fff);
    background: rgba(0, 240, 255, 0.1);
    border: 1px solid color-mix(in srgb, var(--p-cyan) 40%, transparent);
  }

  .p-controls-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .p-controls-side {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    flex: 1 1 0;
  }
  .p-controls-side:last-child { justify-content: flex-end; }

  /* Every round control button: 48x48 real box (>=44px touch-target floor
     with headroom), circular chrome-on-navy, one accent colour via --p-acc. */
  .p-round-btn {
    position: relative;
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: radial-gradient(circle at 36% 28%, #1a2636, #060b16 72%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    cursor: pointer;
  }
  .p-round-btn svg { width: 20px; height: 20px; }
  .p-round-btn svg path { fill: none; stroke: var(--p-acc); stroke-width: 1.8; }
  .p-round-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .p-round-btn.active { box-shadow: 0 0 12px color-mix(in srgb, var(--p-acc) 70%, transparent); }

  /* FS VISUAL FIXPACK JOB 2: the portrait speed control, three intensity steps.
     Replaces the former boolean `.engaged`, which lit Turbo and Super Turbo
     identically and left the numeral as the only thing telling them apart. The
     bolt also FILLS as it intensifies, so the step is a change in the amount of
     lit area as well as in brightness: a second, independent cue that survives
     a washed-out screen. Bolt grown 20px to 24px now the caption is gone. */
  .p-turbo svg { width: 24px; height: 24px; }
  .p-turbo[data-speed="normal"] {
    background: radial-gradient(circle at 36% 28%, #151d29, #04070d 72%);
  }
  .p-turbo[data-speed="normal"] svg path { stroke: rgba(255, 200, 150, 0.5); fill: none; }
  .p-turbo[data-speed="turbo"] {
    background: radial-gradient(circle at 36% 28%, #96601b, #22160a 72%);
    box-shadow: 0 0 18px color-mix(in srgb, var(--p-orange) 80%, transparent),
                inset 0 1px 0 rgba(255, 255, 255, 0.22);
  }
  .p-turbo[data-speed="turbo"] svg path {
    stroke: #ffc266;
    fill: color-mix(in srgb, var(--p-orange) 55%, transparent);
  }
  .p-turbo[data-speed="super"] {
    background: radial-gradient(circle at 36% 28%, #ffb43c, #533008 72%);
    box-shadow: 0 0 30px color-mix(in srgb, var(--p-orange) 100%, transparent),
                0 0 52px color-mix(in srgb, var(--p-orange) 55%, transparent),
                inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }
  .p-turbo[data-speed="super"] svg path { stroke: #fffaf0; fill: #ffdca8; }
  .p-tier {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: rgba(230, 245, 255, 0.85);
  }

  .p-hamburger { display: flex; flex-direction: column; gap: 4px; }
  .p-hamburger-bar { width: 18px; height: 2px; border-radius: 1px; background: var(--p-acc); }

  .p-max-cap { font-size: 12px; font-weight: 800; letter-spacing: 0.04em; color: var(--p-gold); }

  /* SPIN - the single largest, most important control: 72px real diameter
     (well over the 64px floor the brief asks for), centred between the two
     control clusters. */
  .p-spin {
    position: relative;
    width: 72px;
    height: 72px;
    min-width: 72px;
    min-height: 72px;
    padding: 0;
    border: none;
    border-radius: 50%;
    flex: 0 0 auto;
    background: conic-gradient(from 200deg, var(--p-acc), color-mix(in srgb, var(--p-acc) 40%, #0c1220), var(--p-acc));
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6), 0 0 18px color-mix(in srgb, var(--p-acc) 45%, transparent);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    cursor: pointer;
  }
  .p-spin .glyph { width: 22px; height: 22px; }
  .p-spin .glyph path { fill: #04070f; }
  .p-spin .glyph.arrows { display: none; fill: none; stroke: #04070f; stroke-width: 2; }
  .p-spin.spinning .glyph.play { display: none; }
  .p-spin.spinning .glyph.arrows { display: block; }
  .p-spin:disabled { opacity: 0.5; cursor: not-allowed; }
  .p-spin-txt {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #04070f;
  }

  .p-menu-wrapper, .p-autoplay-wrapper { position: relative; }

  /* Dropdowns reuse the existing .hud-menu/.auto-menu visual styling
     verbatim (dark panel, border, item padding - not spec-coordinate-tied,
     just anchored to whichever positioned ancestor wraps them), which now
     anchors correctly against .p-menu-wrapper/.p-autoplay-wrapper above
     instead of the landscape stage's absolute wrapper. */
  .p-hud-menu, .p-auto-menu { position: absolute; bottom: calc(100% + 8px); z-index: 65; left: auto; right: auto; transform: none; }
  .p-hud-menu { left: 0; }
  .p-auto-menu { right: 0; }

  /* LANDSCAPE COMPACT HUD (2026-07-14b) - fully self-contained, native CSS
     px throughout, same discipline as the portrait .p-* block above: no
     reuse of the LAYOUT_SPEC .fs-* absolute-position classes. Fills
     App.svelte's .native-hud-slot.compact-landscape row (fixed 76px tall,
     set there) as the second flex item, alongside FeatureMenu's own
     compact trigger. */
  .c-hud {
    --c-cyan: var(--theme-primary, #00ffff);
    --c-pink: var(--theme-secondary, #ff00ff);
    --c-gold: #ffd700;
    --c-orange: #ff9a2e;
    --c-acc: var(--c-cyan);
    /* Same borrowed-rule defect as `.m-hud` above: this profile's menu button
       reuses `.p-hamburger-bar`, which paints from `--p-acc`, and `--p-acc` is
       declared only on `.p-hud`. Aliased onto this profile's own accent so the
       bars follow the compact palette, overdrive shift included. */
    --p-acc: var(--c-acc);
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    flex: 1 1 auto;
    min-width: 0;
    height: 100%;
    box-sizing: border-box;
    padding: 8px 12px 8px 8px;
    font-family: var(--fs-font-display);
    background: linear-gradient(180deg, rgba(6, 9, 20, 0.92), rgba(4, 6, 14, 0.98));
  }
  .c-hud--overdrive { --c-acc: var(--c-pink); }

  .c-round-btn {
    position: relative;
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: radial-gradient(circle at 36% 28%, #1a2636, #060b16 72%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    cursor: pointer;
  }
  .c-round-btn svg { width: 18px; height: 18px; }
  .c-round-btn svg path { fill: none; stroke: var(--c-acc); stroke-width: 1.8; }
  .c-round-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .c-round-btn.active { box-shadow: 0 0 12px color-mix(in srgb, var(--c-acc) 70%, transparent); }

  /* FS VISUAL FIXPACK JOB 2: the compact-landscape speed control, same three
     steps as portrait at this strip's smaller 44px box. */
  .c-turbo svg { width: 22px; height: 22px; }
  .c-turbo[data-speed="normal"] {
    background: radial-gradient(circle at 36% 28%, #151d29, #04070d 72%);
  }
  .c-turbo[data-speed="normal"] svg path { stroke: rgba(255, 200, 150, 0.5); fill: none; }
  .c-turbo[data-speed="turbo"] {
    background: radial-gradient(circle at 36% 28%, #96601b, #22160a 72%);
    box-shadow: 0 0 18px color-mix(in srgb, var(--c-orange) 80%, transparent),
                inset 0 1px 0 rgba(255, 255, 255, 0.22);
  }
  .c-turbo[data-speed="turbo"] svg path {
    stroke: #ffc266;
    fill: color-mix(in srgb, var(--c-orange) 55%, transparent);
  }
  .c-turbo[data-speed="super"] {
    background: radial-gradient(circle at 36% 28%, #ffb43c, #533008 72%);
    box-shadow: 0 0 30px color-mix(in srgb, var(--c-orange) 100%, transparent),
                0 0 52px color-mix(in srgb, var(--c-orange) 55%, transparent),
                inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }
  .c-turbo[data-speed="super"] svg path { stroke: #fffaf0; fill: #ffdca8; }

  .c-tier { font-size: 11px; font-weight: 800; letter-spacing: 0.04em; color: rgba(230, 245, 255, 0.85); }
  .c-max-cap { font-size: 11px; font-weight: 800; letter-spacing: 0.04em; color: var(--c-gold); }

  .c-menu-wrapper, .c-autoplay-wrapper { position: relative; flex: 0 0 auto; }
  .c-hud-menu, .c-auto-menu { position: absolute; bottom: calc(100% + 8px); z-index: 65; left: auto; right: auto; transform: none; }
  .c-hud-menu { left: 0; }
  .c-auto-menu { right: 0; }

  .c-stat {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1px;
    /* 4px horizontal (not 8px): caught via a $1,000,000.00 stress-value
       screenshot truncating by ~5px at the iPhone 14 landscape width
       (2026-07-14b) - narrow margin, not a font/flex-ratio problem. */
    padding: 2px 4px;
    height: 100%;
    border-radius: 8px;
    background: linear-gradient(160deg, rgba(0, 255, 255, 0.08), transparent 60%), #0c1220;
    border: 1px solid rgba(255, 255, 255, 0.08);
    position: relative;
  }
  .c-stat.lit { border-color: color-mix(in srgb, var(--c-pink) 55%, transparent); }
  .c-stat-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(190, 232, 255, 0.65);
    white-space: nowrap;
  }
  .c-stat-value {
    font-size: calc(14px * var(--autofit-scale, 1));
    font-weight: 700;
    letter-spacing: 0.02em;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .c-stat-value.cyan { color: color-mix(in srgb, var(--c-cyan) 20%, #fff); }
  .c-stat-value.magenta { color: color-mix(in srgb, var(--c-pink) 22%, #fff); }
  .c-stat-value.gold { color: color-mix(in srgb, var(--c-gold) 30%, #fff); }

  /* Balance gets extra flex-basis (2026-07-14b, caught via stress-value
     screenshot: "$1,000,000.00" was truncating with ellipsis at the default
     1:1:1.6 balance:win:bet ratio). Win stays small deliberately - it's
     rarely a long figure in practice - freeing width for balance and bet,
     the two fields most likely to carry long currency strings. */
  /* NEON LIFT (2026-07-15): subtle persistent per-field neon edge, on top
     of each cell's pre-existing flex-basis tuning. */
  .c-stat--balance {
    flex: 1.4 1 0;
    border-color: color-mix(in srgb, var(--c-cyan) 35%, transparent);
    box-shadow: 0 0 6px color-mix(in srgb, var(--c-cyan) 18%, transparent);
  }
  .c-stat--win {
    border-color: color-mix(in srgb, var(--c-pink) 30%, transparent);
    box-shadow: 0 0 6px color-mix(in srgb, var(--c-pink) 14%, transparent);
  }
  .c-stat--bet {
    flex: 1.6 1 0;
    border-color: color-mix(in srgb, var(--c-gold, #ffd700) 30%, transparent);
    box-shadow: 0 0 6px color-mix(in srgb, var(--c-gold, #ffd700) 14%, transparent);
    transition: box-shadow 0.15s ease;
  }
  @keyframes overboost-bet-pulse-compact {
    0%   { box-shadow: 0 0 6px color-mix(in srgb, var(--c-gold, #ffd700) 14%, transparent); }
    35%  { box-shadow: 0 0 18px 3px color-mix(in srgb, var(--c-orange, #ff9a2e) 70%, transparent); }
    100% { box-shadow: 0 0 6px color-mix(in srgb, var(--c-gold, #ffd700) 14%, transparent); }
  }
  .c-stat--bet.overboost-pulse { animation: overboost-bet-pulse-compact 0.7s ease-out; }
  .c-bet-row { display: flex; align-items: center; gap: 2px; }
  .c-bet-step {
    width: 44px;
    height: 44px;
    min-width: 44px;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .c-bet-step svg { width: 12px; height: 8px; }
  .c-bet-step svg path { fill: var(--c-acc); }
  .c-bet-step:disabled { opacity: 0.4; cursor: not-allowed; }

  .c-mode-badge {
    position: absolute;
    top: -8px;
    right: 6px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    /* text-transform: uppercase REMOVED 2026-07-28 (TR-092). It made the HUD
       badge render CRUISE while the features menu, the paytable mode row and
       the buy dialog all render Cruise, from the SAME modeLabel() source. The
       specification's own spelling is `Cruise` (CLAUDE.md True game facts and
       fsModes.ts), so the badge was the outlier. OVERBOOST and NITRO OVERDRIVE
       are unaffected: they are already capitals in the specification. */
    white-space: nowrap;
    padding: 2px 8px;
    border-radius: 999px;
  }
  .c-mode-badge.overboost { color: #1a0d02; background: var(--c-orange); }
  .c-mode-badge.cruise {
    color: color-mix(in srgb, var(--c-cyan) 30%, #fff);
    background: rgba(0, 240, 255, 0.08);
    border: 1px solid color-mix(in srgb, var(--c-cyan) 40%, transparent);
  }

  .c-spin {
    position: relative;
    flex: 0 0 auto;
    width: 60px;
    height: 60px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: conic-gradient(from 200deg, var(--c-acc), color-mix(in srgb, var(--c-acc) 40%, #0c1220), var(--c-acc));
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6), 0 0 18px color-mix(in srgb, var(--c-acc) 45%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .c-spin .glyph { width: 22px; height: 22px; }
  .c-spin .glyph path { fill: #04070f; }
  .c-spin .glyph.arrows { display: none; fill: none; stroke: #04070f; stroke-width: 2; }
  .c-spin.spinning .glyph.play { display: none; }
  .c-spin.spinning .glyph.arrows { display: block; }
  .c-spin:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
