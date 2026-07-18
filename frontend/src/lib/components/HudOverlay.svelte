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
    isMuted, showPaytable, winAmount, winMultiplier, BET_LEVELS, locale,
  } from '../stores/gameStore'
  import { rgsBetLevels } from '../stores/rgsBetLevels'
  import { musicVolume, sfxVolume } from '../stores/audioSettings'
  import { overdriveVisual } from '../stores/overdriveVisual'
  import { speedTier, cycleSpeed } from '../stores/speedMode'
  import { tr } from '../i18n/tr'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { playClick } from '../services/soundService'
  import { autoplayLimits, rgJurisdiction, showSessionPanel } from '../stores/responsibleGambling'
  import { standingMode } from '../stores/betMode'
  import { MODE_COST } from '../config/fsModes'
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
        { balance, betAmount, winAmount, isSpinning, rgsBetLevels, locale, speedTier, standingMode, jurisdictionFlags }
    }
  })

  const AUTO_OPTIONS = [10, 25, 50, 100]
  let showAutoMenu = false
  // Responsible-gambling autoplay stop-conditions (see stores/responsibleGambling).
  let stopOnWin = false
  let stopOnFeature = true
  let lossLimitOn = false
  let showMenu = false

  // ── Bet ladder - ported from the retired ControlBar unchanged ────────────
  $: activeLevels = $rgsBetLevels.length > 0 ? $rgsBetLevels : BET_LEVELS

  function nearestLevel(levels: number[], value: number): number {
    return levels.reduce(
      (best, lvl) => (Math.abs(lvl - value) < Math.abs(best - value) ? lvl : best),
      levels[0],
    )
  }

  $: if (activeLevels.length > 0 && !activeLevels.includes($betAmount)) {
    betAmount.set(nearestLevel(activeLevels, $betAmount))
  }

  $: curIndex = activeLevels.indexOf($betAmount)
  $: canIncrease =
    curIndex > -1 &&
    curIndex < activeLevels.length - 1 &&
    activeLevels[curIndex + 1] <= $balance
  $: canDecrease = curIndex > 0

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

  function increaseBet() {
    playClick()
    const idx = activeLevels.indexOf($betAmount)
    if (idx > -1 && idx < activeLevels.length - 1 && activeLevels[idx + 1] <= $balance) {
      betAmount.set(activeLevels[idx + 1])
    }
  }

  function decreaseBet() {
    playClick()
    const idx = activeLevels.indexOf($betAmount)
    if (idx > 0) betAmount.set(activeLevels[idx - 1])
  }

  // MAX bet (v3.3) - highest affordable ladder level, consistent with the
  // affordability guard the increase arrow already uses.
  $: maxLevel = (() => {
    const affordable = activeLevels.filter((l) => l <= $balance)
    return affordable.length ? affordable[affordable.length - 1] : activeLevels[0]
  })()
  $: canSetMax = curIndex > -1 && $betAmount !== maxLevel

  function setMaxBet() {
    playClick()
    if ($betAmount !== maxLevel) betAmount.set(maxLevel)
  }

  function startAuto(count: number) {
    playClick()
    autoplayLimits.set({
      count,
      stopOnAnyWin: stopOnWin,
      singleWinLimitMult: 0,
      stopOnFeature,
      lossLimitMicros: lossLimitOn ? Math.round($betAmount * count * CURRENCY_SCALE) : 0,
    })
    autoPlayCount.set(count)
    isAutoPlay.set(true)
    showAutoMenu = false
    dispatch('spin')
  }

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
  $: effectiveCost = Math.round($betAmount * (MODE_COST[$standingMode] ?? 1) * CURRENCY_SCALE) / CURRENCY_SCALE
  $: isOverboost = $standingMode === 'antelite'
  $: isCruise    = $standingMode === 'cruise'

  $: balanceLabel = formatBalance(Math.round($balance * CURRENCY_SCALE), $currencyCode || 'USD')
  $: betLabel     = formatBalance(Math.round(effectiveCost * CURRENCY_SCALE), $currencyCode || 'USD')

  // HUD win count-up (2026-07-14b, ITEM B): every win ticks the HUD figure up
  // incrementally rather than jumping straight to the final value, the same
  // rAF/cubic-ease approach WinBanner.svelte already uses for its own (>=10x
  // only) celebration overlay - this is the same behaviour applied to the
  // HUD figure that's visible for every win, not just the big ones. Duration
  // scales with win size: a 400ms floor for small wins up to an 800ms
  // ceiling, saturating at 50x bet so huge wins don't drag the HUD out.
  // Resets (new spin zeroing winAmount) snap instantly - only increases tween.
  const WIN_COUNTUP_MIN_MS = 400
  const WIN_COUNTUP_MAX_MS = 800
  let displayedWinAmount = 0
  let winCountUpFrame: number | null = null
  let lastWinAmountSeen = 0

  function startWinCountUp(target: number, multiplier: number): void {
    if (winCountUpFrame) cancelAnimationFrame(winCountUpFrame)
    const start = displayedWinAmount
    const startTime = performance.now()
    const duration = Math.min(
      WIN_COUNTUP_MAX_MS,
      WIN_COUNTUP_MIN_MS + Math.min(WIN_COUNTUP_MAX_MS - WIN_COUNTUP_MIN_MS, multiplier * 8),
    )
    function tick(now: number): void {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      displayedWinAmount = start + (target - start) * eased
      if (progress < 1) {
        winCountUpFrame = requestAnimationFrame(tick)
      } else {
        displayedWinAmount = target
        winCountUpFrame = null
      }
    }
    winCountUpFrame = requestAnimationFrame(tick)
  }

  $: if ($winAmount !== lastWinAmountSeen) {
    const previous = lastWinAmountSeen
    lastWinAmountSeen = $winAmount
    if ($winAmount > previous) {
      startWinCountUp($winAmount, $winMultiplier)
    } else {
      if (winCountUpFrame) cancelAnimationFrame(winCountUpFrame)
      winCountUpFrame = null
      displayedWinAmount = $winAmount
    }
  }

  onDestroy(() => {
    if (winCountUpFrame) cancelAnimationFrame(winCountUpFrame)
  })

  $: winLabel = formatBalance(Math.round(displayedWinAmount * CURRENCY_SCALE), $currencyCode || 'USD')
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
      <div class="p-stat" data-testid="hud-balance">
        <span class="p-stat-label">{$tr('balance')}</span>
        <span class="p-stat-value cyan">{balanceLabel}</span>
      </div>
      <div class="p-stat" class:lit={$winAmount > 0} data-testid="hud-win">
        <span class="p-stat-label">{$tr('win')}</span>
        <span class="p-stat-value magenta">{winLabel}</span>
      </div>
    </div>
    <!-- BET gets its own full-width row: a 3-column stats row left no room
         for two 44px steppers plus a stress-value bet figure without either
         clipping the currency text or shrinking the steppers below the
         touch-target floor (caught by the committed portrait screenshots
         showing "$1,000,000.00" overflowing its card - see session report). -->
    <div class="p-bet-stat" data-testid="hud-bet">
      <span class="p-stat-label">{$tr('bet')}</span>
      <div class="p-bet-row" data-testid="bet-arrows">
        <button class="p-bet-step" on:click={decreaseBet} disabled={$isSpinning || !canDecrease} aria-label="Decrease bet">
          <svg viewBox="0 0 20 12"><path d="M10 11 1 1h18z"/></svg>
        </button>
        <span class="p-stat-value gold">{betLabel}</span>
        <button class="p-bet-step" on:click={increaseBet} disabled={$isSpinning || !canIncrease} aria-label="Increase bet">
          <svg viewBox="0 0 20 12"><path d="M10 1 19 11H1z"/></svg>
        </button>
      </div>
      {#if isOverboost}
        <span class="p-mode-badge overboost" data-testid="hud-overboost-badge">OVERBOOST</span>
      {:else if isCruise}
        <span class="p-mode-badge cruise" data-testid="hud-cruise-label">CRUISE</span>
      {/if}
    </div>
  </div>

  <div class="p-controls-row">
    <div class="p-controls-side">
      <div class="p-menu-wrapper">
        <button class="p-round-btn" on:click={toggleMenu} aria-label="Menu" aria-expanded={showMenu}>
          <span class="p-hamburger"><span class="p-hamburger-bar"></span><span class="p-hamburger-bar"></span><span class="p-hamburger-bar"></span></span>
        </button>
        {#if showMenu}
          <div class="hud-menu p-hud-menu" role="menu">
            <button class="hud-menu-item" role="menuitem" on:click={openPaytable}>{$tr('paytable')}</button>
            <button class="hud-menu-item" role="menuitem" on:click={openSessionPanel} data-testid="open-session-panel">Session</button>
            <div class="audio-panel" class:muted={$isMuted}>
              <button class="hud-menu-item audio-mute" role="menuitem" on:click={toggleMute}>
                {$isMuted ? 'Unmute' : 'Mute'} {$isMuted ? '🔇' : '🔊'}
              </button>
              <div class="audio-row">
                <span class="audio-label">MUSIC</span>
                <input class="audio-slider" type="range" min="0" max="100" value={musicPct} on:input={setMusicVol} aria-label="Music volume" />
                <span class="audio-pct">{musicPct}%</span>
              </div>
              <div class="audio-row">
                <span class="audio-label">SOUND</span>
                <input class="audio-slider" type="range" min="0" max="100" value={sfxPct} on:input={setSfxVol} aria-label="Sound effects volume" />
                <span class="audio-pct">{sfxPct}%</span>
              </div>
            </div>
          </div>
        {/if}
      </div>
      <button
        class="p-round-btn"
        class:engaged={$speedTier !== 'normal'}
        on:click={toggleTurbo}
        disabled={$isSpinning}
        aria-label="Cycle speed (Normal / Turbo / Super Turbo)"
        title={$speedTier === 'normal' ? 'Normal speed' : $speedTier === 'turbo' ? 'Turbo' : 'Super Turbo'}
      >
        <svg viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>
        <span class="p-tier">{$speedTier === 'normal' ? '1×' : $speedTier === 'turbo' ? '2×' : '4×'}</span>
      </button>
    </div>

    <button
      class="p-spin"
      class:spinning={$isSpinning}
      disabled={$isSpinning ? false : !$canSpin}
      on:click={handleSpin}
      aria-label={$tr('spin')}
      data-testid="spin-button"
    >
      <svg class="glyph play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      <svg class="glyph arrows" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M18 3v5h-5"/></svg>
      <span class="p-spin-txt">{$tr('spin')}</span>
    </button>

    <div class="p-controls-side">
      <button class="p-round-btn p-max" on:click={setMaxBet} disabled={$isSpinning || !canSetMax} aria-label="Max bet" data-testid="max-chip">
        <span class="p-max-cap">MAX</span>
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
              <span class="p-tier">{$autoPlayCount}</span>
            {:else}
              <svg viewBox="0 0 24 24"><path d="M7 6a6 6 0 1 0 5 3"/></svg>
            {/if}
          </button>
          {#if showAutoMenu}
            <div class="auto-menu p-auto-menu" role="menu">
              <label class="auto-menu-toggle"><input type="checkbox" bind:checked={stopOnWin} /> Stop on win</label>
              <label class="auto-menu-toggle"><input type="checkbox" bind:checked={stopOnFeature} /> Stop on feature</label>
              <label class="auto-menu-toggle"><input type="checkbox" bind:checked={lossLimitOn} /> Loss limit</label>
              <div class="auto-menu-sep">Spins</div>
              {#each AUTO_OPTIONS as n}
                <button class="auto-menu-item" role="menuitem" on:click={() => startAuto(n)}>{n}</button>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div><!-- /p-hud -->
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
    <button class="c-round-btn" on:click={toggleMenu} aria-label="Menu" aria-expanded={showMenu}>
      <span class="p-hamburger"><span class="p-hamburger-bar"></span><span class="p-hamburger-bar"></span><span class="p-hamburger-bar"></span></span>
    </button>
    {#if showMenu}
      <div class="hud-menu c-hud-menu" role="menu">
        <button class="hud-menu-item" role="menuitem" on:click={openPaytable}>{$tr('paytable')}</button>
        <button class="hud-menu-item" role="menuitem" on:click={openSessionPanel} data-testid="open-session-panel">Session</button>
        <div class="audio-panel" class:muted={$isMuted}>
          <button class="hud-menu-item audio-mute" role="menuitem" on:click={toggleMute}>
            {$isMuted ? 'Unmute' : 'Mute'} {$isMuted ? '🔇' : '🔊'}
          </button>
          <div class="audio-row">
            <span class="audio-label">MUSIC</span>
            <input class="audio-slider" type="range" min="0" max="100" value={musicPct} on:input={setMusicVol} aria-label="Music volume" />
            <span class="audio-pct">{musicPct}%</span>
          </div>
          <div class="audio-row">
            <span class="audio-label">SOUND</span>
            <input class="audio-slider" type="range" min="0" max="100" value={sfxPct} on:input={setSfxVol} aria-label="Sound effects volume" />
            <span class="audio-pct">{sfxPct}%</span>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <div class="c-stat c-stat--balance" data-testid="hud-balance">
    <span class="c-stat-label">{$tr('balance')}</span>
    <span class="c-stat-value cyan">{balanceLabel}</span>
  </div>
  <div class="c-stat" class:lit={$winAmount > 0} data-testid="hud-win">
    <span class="c-stat-label">{$tr('win')}</span>
    <span class="c-stat-value magenta">{winLabel}</span>
  </div>
  <div class="c-stat c-stat--bet" data-testid="hud-bet">
    <span class="c-stat-label">{$tr('bet')}</span>
    <div class="c-bet-row" data-testid="bet-arrows">
      <button class="c-bet-step" on:click={decreaseBet} disabled={$isSpinning || !canDecrease} aria-label="Decrease bet">
        <svg viewBox="0 0 20 12"><path d="M10 11 1 1h18z"/></svg>
      </button>
      <span class="c-stat-value gold">{betLabel}</span>
      <button class="c-bet-step" on:click={increaseBet} disabled={$isSpinning || !canIncrease} aria-label="Increase bet">
        <svg viewBox="0 0 20 12"><path d="M10 1 19 11H1z"/></svg>
      </button>
    </div>
    {#if isOverboost}
      <span class="c-mode-badge overboost" data-testid="hud-overboost-badge">OVERBOOST</span>
    {:else if isCruise}
      <span class="c-mode-badge cruise" data-testid="hud-cruise-label">CRUISE</span>
    {/if}
  </div>

  <button
    class="c-round-btn"
    class:engaged={$speedTier !== 'normal'}
    on:click={toggleTurbo}
    disabled={$isSpinning}
    aria-label="Cycle speed (Normal / Turbo / Super Turbo)"
    title={$speedTier === 'normal' ? 'Normal speed' : $speedTier === 'turbo' ? 'Turbo' : 'Super Turbo'}
  >
    <svg viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>
    <span class="c-tier">{$speedTier === 'normal' ? '1×' : $speedTier === 'turbo' ? '2×' : '4×'}</span>
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
          <span class="c-tier">{$autoPlayCount}</span>
        {:else}
          <svg viewBox="0 0 24 24"><path d="M7 6a6 6 0 1 0 5 3"/></svg>
        {/if}
      </button>
      {#if showAutoMenu}
        <div class="auto-menu c-auto-menu" role="menu">
          <label class="auto-menu-toggle"><input type="checkbox" bind:checked={stopOnWin} /> Stop on win</label>
          <label class="auto-menu-toggle"><input type="checkbox" bind:checked={stopOnFeature} /> Stop on feature</label>
          <label class="auto-menu-toggle"><input type="checkbox" bind:checked={lossLimitOn} /> Loss limit</label>
          <div class="auto-menu-sep">Spins</div>
          {#each AUTO_OPTIONS as n}
            <button class="auto-menu-item" role="menuitem" on:click={() => startAuto(n)}>{n}</button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <button class="c-round-btn c-max" on:click={setMaxBet} disabled={$isSpinning || !canSetMax} aria-label="Max bet" data-testid="max-chip">
    <span class="c-max-cap">MAX</span>
  </button>

  <button
    class="c-spin"
    class:spinning={$isSpinning}
    disabled={$isSpinning ? false : !$canSpin}
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
    class:engaged={$speedTier !== 'normal'}
    on:click={toggleTurbo}
    disabled={$isSpinning}
    aria-label="Cycle speed (Normal / Turbo / Super Turbo)"
    title={$speedTier === 'normal' ? 'Normal speed' : $speedTier === 'turbo' ? 'Turbo' : 'Super Turbo'}
  >
    <span class="fs-face">
      <svg viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>
      <span class="tier">{$speedTier === 'normal' ? '1×' : $speedTier === 'turbo' ? '2×' : '4×'}</span>
    </span>
  </button>

  <!-- MAX chip - v3.6: far-left gap between TURBO and the menu, clear of SPIN. -->
  <button
    class="fs-max"
    on:click={setMaxBet}
    disabled={$isSpinning || !canSetMax}
    aria-label="Max bet"
    data-testid="max-chip"
  ><span class="cap">MAX</span></button>

  <!-- Hamburger + menu - fixed at x 344 -->
  <div class="menu-wrapper">
    <button class="fs-menu" on:click={toggleMenu} aria-label="Menu" aria-expanded={showMenu}>
      <span class="inset"><span class="bar"></span><span class="bar"></span><span class="bar"></span></span>
    </button>
    {#if showMenu}
      <div class="hud-menu" role="menu">
        <button class="hud-menu-item" role="menuitem" on:click={openPaytable}>{$tr('paytable')}</button>
        <button class="hud-menu-item" role="menuitem" on:click={openSessionPanel} data-testid="open-session-panel">Session</button>
        <div class="audio-panel" class:muted={$isMuted}>
          <button class="hud-menu-item audio-mute" role="menuitem" on:click={toggleMute}>
            {$isMuted ? 'Unmute' : 'Mute'} {$isMuted ? '🔇' : '🔊'}
          </button>
          <div class="audio-row">
            <span class="audio-label">MUSIC</span>
            <input
              class="audio-slider"
              type="range" min="0" max="100"
              value={musicPct}
              on:input={setMusicVol}
              aria-label="Music volume"
            />
            <span class="audio-pct">{musicPct}%</span>
          </div>
          <div class="audio-row">
            <span class="audio-label">SOUND</span>
            <input
              class="audio-slider"
              type="range" min="0" max="100"
              value={sfxPct}
              on:input={setSfxVol}
              aria-label="Sound effects volume"
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
      <span class="fs-value cyan">{balanceLabel}</span>
    </span>
  </div>

  <!-- WIN - fixed box x 616, width 150 -->
  <div class="fs-box fs-win fs-plate" class:lit={$winAmount > 0} data-testid="hud-win">
    <span class="fs-rail"></span>
    <span class="fs-face">
      <span class="fs-label">{$tr('win')}</span>
      <span class="fs-value magenta">{winLabel}</span>
    </span>
  </div>

  <!-- BET - fixed box x 782, width 120, value right-aligned. Shows the
       EFFECTIVE debit (bet x MODE_COST[standingMode]), not the nominal bet
       level, whenever a standing/enhancer mode changes the real cost. -->
  <div class="fs-box fs-bet fs-plate" data-testid="hud-bet">
    <span class="fs-rail"></span>
    <span class="fs-face">
      <span class="fs-label">{$tr('bet')}</span>
      <span class="fs-value gold">{betLabel}</span>
    </span>
  </div>

  <!-- Mode badge anchor - a plain (unclipped) sibling matching the BET box's
       own geometry exactly. .fs-plate's clip-path would otherwise clip any
       child poking above the box, so this sits outside it, not inside. -->
  {#if isOverboost || isCruise}
    <div class="fs-bet-badge-anchor">
      {#if isOverboost}
        <span class="fs-mode-badge overboost" data-testid="hud-overboost-badge">OVERBOOST</span>
      {:else}
        <span class="fs-mode-badge cruise" data-testid="hud-cruise-label">CRUISE</span>
      {/if}
    </div>
  {/if}

  <!-- Stacked cyan bet arrows - own FIXED column x 906 (v3.3), independent of BET box -->
  <div class="fs-arrows" data-testid="bet-arrows">
    <button class="fs-arrow" on:click={increaseBet} disabled={$isSpinning || !canIncrease} aria-label="Increase bet"><svg viewBox="0 0 20 12"><path d="M10 1 19 11H1z"/></svg></button>
    <button class="fs-arrow" on:click={decreaseBet} disabled={$isSpinning || !canDecrease} aria-label="Decrease bet"><svg viewBox="0 0 20 12"><path d="M10 11 1 1h18z"/></svg></button>
  </div>

  <!-- SPIN - v3.2: centre (1004,604), 84 diameter. Stays clickable mid-spin
       (slam-stop, Motion Polish v2) even though $canSpin is false while spinning. -->
  <button
    class="fs-spin"
    class:spinning={$isSpinning}
    disabled={$isSpinning ? false : !$canSpin}
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
          <span class="count">{$autoPlayCount}</span>
        {:else}
          <svg viewBox="0 0 24 24"><path d="M7 6a6 6 0 1 0 5 3"/></svg>
        {/if}
      </span>
    </button>
    {#if showAutoMenu}
      <div class="auto-menu" role="menu">
        <label class="auto-menu-toggle"><input type="checkbox" bind:checked={stopOnWin} /> Stop on win</label>
        <label class="auto-menu-toggle"><input type="checkbox" bind:checked={stopOnFeature} /> Stop on feature</label>
        <label class="auto-menu-toggle"><input type="checkbox" bind:checked={lossLimitOn} /> Loss limit</label>
        <div class="auto-menu-sep">Spins</div>
        {#each AUTO_OPTIONS as n}
          <button class="auto-menu-item" role="menuitem" on:click={() => startAuto(n)}>{n}</button>
        {/each}
      </div>
    {/if}
  </div>
  {/if}

</div><!-- /fs-hud -->
{/if}

<style>
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
  .fs-panel{
    position:absolute;left:296px;top:560px;width:688px;height:88px;z-index:59;
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
     Fixed geometry (never reflow). Signature colour per field. ------------- */
  .fs-box{position:absolute;top:573px;height:62px;z-index:60;}
  .fs-box .fs-face{padding:0 10px;}
  .fs-balance{left:400px;width:200px;--sig:var(--sig-cyan);}
  .fs-win    {left:616px;width:150px;--sig:var(--sig-pink);}
  .fs-bet    {left:782px;width:120px;--sig:var(--sig-gold);}
  .fs-bet .fs-face{align-items:flex-end;padding-right:14px;}

  .fs-label{
    font-family:'Orbitron',system-ui,monospace;font-size:.52rem;font-weight:700;
    letter-spacing:.18em;text-transform:uppercase;color:rgba(190,232,255,.62);
    position:relative;z-index:1;
  }
  .fs-value{
    font-family:'Orbitron',system-ui,monospace;font-size:1.02rem;font-weight:700;
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
    position:absolute; left:782px; top:557px; width:120px; height:16px;
    z-index:61; display:flex; justify-content:flex-end; pointer-events:none;
  }
  .fs-mode-badge{
    font-family:'Orbitron',system-ui,monospace; font-size:.5rem; font-weight:800;
    letter-spacing:.1em; text-transform:uppercase; white-space:nowrap;
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
     own fixed column x906 top578 (v3.3). ----------------------------------- */
  .fs-arrows{position:absolute;left:906px;top:578px;width:44px;height:52px;z-index:60;
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

  /* ===== MAX chip - far-left gap (v3.6), gold ============================== */
  .fs-max{position:absolute;left:311px;top:582px;width:26px;height:44px;padding:0;
    border:none;background:none;cursor:pointer;z-index:60;
    display:flex;align-items:center;justify-content:center;}
  .fs-max .cap{
    width:24px;height:26px;display:flex;align-items:center;justify-content:center;
    border-radius:6px;position:relative;
    background:linear-gradient(180deg,#2a2410,#0d0b04);
    box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--sig-gold) 55%,transparent),
               0 0 8px color-mix(in srgb,var(--sig-gold) 35%,transparent);
    font-family:'Orbitron',monospace;font-size:.46rem;font-weight:800;letter-spacing:.02em;
    color:#ffe58a;text-shadow:0 0 6px var(--sig-gold);
  }
  .fs-max:hover:not(:disabled) .cap{filter:brightness(1.2);}
  .fs-max:active:not(:disabled){transform:translateY(1px);}
  .fs-max:disabled{opacity:.4;cursor:not-allowed;}

  /* ===== HAMBURGER menu - chrome square (x344) ============================= */
  .fs-menu{position:absolute;left:344px;top:584px;width:40px;height:40px;z-index:60;
    padding:0;border:none;cursor:pointer;border-radius:9px;
    background:linear-gradient(160deg,#c6d6e0,#55656f 52%,#222c34);
    box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 2px 5px rgba(0,0,0,.55);
    display:flex;align-items:center;justify-content:center;}
  .fs-menu .inset{width:32px;height:32px;border-radius:6px;
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
  .fs-turbo{position:absolute;left:227px;top:563px;width:82px;height:82px;z-index:60;
    padding:0;border:none;cursor:pointer;}
  .fs-turbo .fs-face{background:radial-gradient(circle at 36% 28%,#33210c,#0c0803 72%);}
  .fs-turbo svg{width:26px;height:26px;}
  .fs-turbo svg path{fill:rgba(255,190,120,.7);}
  .fs-turbo .tier{font-family:'Orbitron',monospace;font-size:.5rem;font-weight:800;
    letter-spacing:.06em;color:rgba(255,200,140,.75);font-variant-numeric:tabular-nums;}
  .fs-turbo:disabled{opacity:.5;cursor:not-allowed;}
  .fs-turbo.engaged svg path{fill:#ffc46a;}
  .fs-turbo.engaged .tier{color:#ffce7a;}
  .fs-turbo.engaged{filter:drop-shadow(0 0 14px rgba(255,120,30,.7));
    animation:fs-flame .8s ease-in-out infinite alternate;}
  @keyframes fs-flame{from{filter:drop-shadow(0 0 10px rgba(255,120,30,.55)) brightness(1);}
    to{filter:drop-shadow(0 0 20px rgba(255,140,40,.9)) brightness(1.28);}}

  /* ===== AUTOPLAY - chrome knob (x912 top648, 48) ========================= */
  .fs-auto{position:absolute;left:912px;top:648px;width:48px;height:48px;z-index:60;
    padding:0;border:none;cursor:pointer;}
  .fs-auto .fs-face{gap:0;}
  .fs-auto svg{width:20px;height:20px;}
  .fs-auto svg path{fill:none;stroke:rgba(200,236,255,.7);stroke-width:5;}
  .fs-auto .count{font-family:'Orbitron',monospace;font-size:.9rem;font-weight:800;
    color:var(--acc);font-variant-numeric:tabular-nums;text-shadow:0 0 8px var(--acc);}
  .fs-auto:disabled{opacity:.4;cursor:not-allowed;}
  .fs-auto.active{filter:drop-shadow(0 0 12px color-mix(in srgb,var(--acc) 75%,transparent));
    animation:fs-auto-pulse 1s ease-in-out infinite alternate;}
  .fs-auto.active svg path{stroke:var(--acc);}
  @keyframes fs-auto-pulse{from{filter:drop-shadow(0 0 6px color-mix(in srgb,var(--acc) 40%,transparent));}
    to{filter:drop-shadow(0 0 16px color-mix(in srgb,var(--acc) 90%,transparent));}}

  /* ===== SPIN - crafted chrome, cyan redline ring (x962 top562, 84) =======
     Replaces spin_button.png. Bezel + dark dome + emissive ring + SVG glyph. */
  .fs-spin{position:absolute;left:962px;top:562px;width:84px;height:84px;z-index:61;
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
    font-family:'Orbitron',monospace;font-size:.46rem;font-weight:800;letter-spacing:.14em;
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
    .fs-win.lit .fs-rail,.fs-win.lit .fs-value,.fs-turbo.engaged,.fs-auto.active,
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
    left: 344px;
    top: 584px;
    width: 40px;
    height: 40px;
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

  /* ── Audio panel - Mute toggle + MUSIC / SOUND volume sliders ─────────────── */
  .audio-panel {
    border-top: 1px solid rgba(0, 255, 255, 0.14);
    padding-bottom: 0.4rem;
    transition: opacity 0.15s;
  }
  /* When muted, dim the sliders (they stay adjustable). */
  .audio-panel.muted .audio-row { opacity: 0.45; }
  .audio-mute { padding-top: 0.55rem; }
  .audio-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.3rem 0.9rem;
  }
  .audio-label {
    flex: 0 0 42px;
    font-family: 'Orbitron', sans-serif;
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

  .autoplay-wrapper {
    position: absolute;
    left: 912px;
    top: 648px;
    width: 48px;
    height: 48px;
    z-index: 60;
  }
  .autoplay-wrapper .fs-auto { position: static; left: auto; top: auto; }

  .auto-menu {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10, 10, 30, 0.96);
    border: 1px solid rgba(255, 200, 50, 0.3);
    border-radius: 8px;
    overflow: hidden;
    z-index: 65;
    min-width: 64px;
  }
  .auto-menu-item {
    display: block;
    width: 100%;
    padding: 0.35rem 0.8rem;
    background: none;
    border: none;
    color: #ffc832;
    cursor: pointer;
    font-size: 0.8rem;
    text-align: center;
  }
  .auto-menu-item:hover { background: rgba(255, 200, 50, 0.15); }

  .auto-menu-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0.3rem 0.7rem;
    font-size: 0.62rem;
    letter-spacing: 0.02em;
    color: rgba(255, 255, 255, 0.75);
    cursor: pointer;
    white-space: nowrap;
  }
  .auto-menu-toggle input { accent-color: #00ffff; cursor: pointer; }
  .auto-menu-sep {
    padding: 0.3rem 0.7rem 0.15rem;
    font-size: 0.56rem;
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
    font-family: 'Orbitron', system-ui, sans-serif;
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
  .p-stat-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(190, 232, 255, 0.65);
    white-space: nowrap;
  }
  .p-stat-value {
    font-size: 16px;
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
    gap: 10px;
    padding: 8px 12px;
    min-height: 52px;
    border-radius: 10px;
    background: linear-gradient(160deg, rgba(255, 215, 0, 0.08), transparent 60%), #0c1220;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .p-stat-value.cyan { color: color-mix(in srgb, var(--p-cyan) 20%, #fff); }
  .p-stat-value.magenta { color: color-mix(in srgb, var(--p-pink) 22%, #fff); }
  .p-stat-value.gold { color: color-mix(in srgb, var(--p-gold) 30%, #fff); }

  .p-bet-row { display: flex; align-items: center; gap: 2px; }
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
    text-transform: uppercase;
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
  .p-round-btn.engaged { box-shadow: 0 0 12px color-mix(in srgb, var(--p-orange) 70%, transparent); }
  .p-round-btn.engaged svg path { stroke: var(--p-orange); }
  .p-round-btn.active { box-shadow: 0 0 12px color-mix(in srgb, var(--p-acc) 70%, transparent); }
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
  .p-hud-menu, .p-auto-menu { position: absolute; bottom: calc(100% + 8px); z-index: 65; }
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
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    flex: 1 1 auto;
    min-width: 0;
    height: 100%;
    box-sizing: border-box;
    padding: 8px 12px 8px 8px;
    font-family: 'Orbitron', system-ui, sans-serif;
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
  .c-round-btn.engaged { box-shadow: 0 0 12px color-mix(in srgb, var(--c-orange) 70%, transparent); }
  .c-round-btn.engaged svg path { stroke: var(--c-orange); }
  .c-round-btn.active { box-shadow: 0 0 12px color-mix(in srgb, var(--c-acc) 70%, transparent); }

  .c-tier { font-size: 11px; font-weight: 800; letter-spacing: 0.04em; color: rgba(230, 245, 255, 0.85); }
  .c-max-cap { font-size: 11px; font-weight: 800; letter-spacing: 0.04em; color: var(--c-gold); }

  .c-menu-wrapper, .c-autoplay-wrapper { position: relative; flex: 0 0 auto; }
  .c-hud-menu, .c-auto-menu { position: absolute; bottom: calc(100% + 8px); z-index: 65; }
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
    font-size: 14px;
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
  .c-stat--balance { flex: 1.4 1 0; }
  .c-stat--bet { flex: 1.6 1 0; }
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
    text-transform: uppercase;
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
