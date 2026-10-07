<script lang="ts">
  // HudOverlay.svelte - LAYOUT_SPEC v3.2 AMENDMENT: fixed-field HUD.
  // NOTE R153 (2026-10-07): the accent sentence below is retired. Since R153 the
  // only accent on the bar is the spin ring's 2px edge; TURBO steps in white with
  // no glow. See R153 OPERATOR STRIP in the style block.
  // Reskin-free per DESIGN_SYSTEM (the only themed accent is TURBO, which
  // reuses the existing turbo treatment with an engage glow). Every field
  // inside the panel is a fixed box that never moves or resizes as its value
  // grows (stress-tested against $10,000.00 balance / $5,000.00 win /
  // $5,000.00 bet); every numeric value uses tabular numerals.
  import { createEventDispatcher, onMount } from 'svelte'
  import {
    betAmount, balance, currencyCode,
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
  import { spinCostMicros, canAffordSpin } from '../stores/buyAffordability'
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
    } else if ($canAffordSpin) {
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

  // R153: the NEON LIFT bet pulse of 2026-07-15 is gone with its glow. It flashed an orange
  // bloom round the BET plate on the OFF->ON edge of OVERBOOST, and the operator strip carries
  // no per-plate accent. The change is still never silent: the BET value reads the effective
  // 1.25x cost the moment the mode engages, and the OVERBOOST badge appears above it.

  // Derived from the session's currency, and placed on the side that currency
  // places it, exactly as formatBalance() does for every other money readout.
  $: lossLimitSymbol   = currencySymbolFor($currencyCode || 'USD')
  $: lossLimitTrailing = currencySymbolTrailing($currencyCode || 'USD')

  // ── THE AUTOPLAY LOSS LIMIT, FORMATTED AND VALIDATED (R071 TASK 3) ─────────
  //
  // This field was the one money surface in the game that reached the DOM with
  // NO formatter on either side: a bare `type="number"` bound straight to a
  // float, so a de or tr session saw "12.5" beside a symbol in a view where
  // every other amount used that locale's separators, and a typed value could
  // carry more precision than the currency has.
  //
  // Two halves now:
  //   VALIDATION. Every keystroke and every commit runs through
  //   `sanitiseLossLimit`, which coerces to a number, floors at one unit,
  //   caps at the platform's own bet ceiling, and rounds to the CURRENCY's
  //   precision, zero places for a zero-decimal currency and two otherwise.
  //   FORMATTING. The committed value renders beside the field through
  //   `formatBalance`, under TASK 1's law that a limit is a currency display
  //   and takes exactly two places (or the widened sub-unit form a
  //   zero-decimal currency needs, per TASK 2).
  //
  // The input itself keeps `type="number"`, deliberately: it is the control a
  // player edits, and swapping it for a formatted text box would take the
  // numeric keypad away on the owner's own phone.
  const LOSS_LIMIT_MAX = 500_000
  // The currency's own precision, READ OFF THE SHIPPED FORMATTER rather than
  // re-derived from a table this file would then have to keep in step. One whole
  // unit renders as "1", "1.00" or "1.000" depending on the currency, and no
  // grouping separator can appear at one unit, so the fraction run is the answer.
  // The decimal count this input accepts is DERIVED from what the shipped
  // formatter actually renders for one unit, never assumed to be two. A
  // zero-decimal currency must not offer a 0.01 step, and the precision law's
  // widening floor means the answer is a property of the currency rather than a
  // constant. $locale is passed rather than a fixed tag: a hardcoded locale on a
  // money formatter is the exact class winPrecision.test.ts check 9 guards, and
  // the match tolerates either decimal separator because that is the one thing
  // that genuinely varies here. Verified across en, de, fr, ar and ja.
  $: lossLimitDecimals =
    formatBalance(CURRENCY_SCALE, $currencyCode || 'USD', $locale)
      .match(/\d+(?:[.,](\d+))?/)?.[1]?.length ?? 0
  $: lossLimitStep = lossLimitDecimals === 0 ? 1 : Number((10 ** -lossLimitDecimals).toFixed(lossLimitDecimals))
  function sanitiseLossLimit(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v)
    if (!Number.isFinite(n)) return 1
    const clamped = Math.min(Math.max(n, lossLimitStep), LOSS_LIMIT_MAX)
    return Number(clamped.toFixed(lossLimitDecimals))
  }
  $: lossLimitLabel = formatBalance(
    Math.round(sanitiseLossLimit(lossLimitAmount) * CURRENCY_SCALE), $currencyCode || 'USD', $locale)
  // R071 TASK 1, the settled platform precision law (a Stake reviewer message corroborated exactly by rgs.md): payouts and wins render at up to four places, every other currency display at exactly two. A BALANCE is not a win, so it renders at exactly two.
  $: balanceLabel = formatBalance(Math.round($balance * CURRENCY_SCALE), $currencyCode || 'USD', $locale)
  // A COST is a currency display, not a payout, so it renders at exactly two.
  $: betLabel     = formatBalance(Math.round(effectiveCost * CURRENCY_SCALE), $currencyCode || 'USD', $locale)
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
        <span class="p-stat-value cyan" data-money="cur" use:autofitText={balanceLabel}>{balanceLabel}</span>
      </div>
      <div class="p-stat p-stat--win" data-testid="hud-win">
        <span class="p-stat-label">{$tr('win')}</span>
        <span class="p-stat-value magenta" data-money="cur" use:autofitText={winLabel}>{winLabel}</span>
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
        <button class="p-bet-step" on:click={decreaseBet} disabled={$isSpinning || !$canDecreaseBetLevel} aria-label={$tr('a11yDecreaseBet')}>
          <svg viewBox="0 0 20 12"><path d="M4 3l6 6 6-6"/></svg>
        </button>
        <button class="p-stat-value gold bet-open" data-money="cur" use:autofitText={betLabel} on:click={openBetSelector} aria-haspopup="dialog" aria-expanded={showBetSelector} aria-label={$tr("a11yOpenBetSelector")} data-testid="bet-window"><span class="bet-open-text">{betLabel}</span></button>
        <button class="p-bet-step" on:click={increaseBet} disabled={$isSpinning || !$canIncreaseBetLevel} aria-label={$tr('a11yIncreaseBet')}>
          <svg viewBox="0 0 20 12"><path d="M4 9l6-6 6 6"/></svg>
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
            <button class="hud-menu-item" role="menuitem" on:click={openPaytable} data-testid="open-paytable">{$tr('paytable')}</button>
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
        title={$tr('a11yCycleSpeed')}
      >
        <svg viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>
      </button>
    </div>

    <button
      class="p-spin"
      class:spinning={$isSpinning}
      disabled={$isWincap ? true : ($isSpinning ? false : !$canAffordSpin)}
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
                <label class="auto-menu-amount">{#if !lossLimitTrailing}{lossLimitSymbol}{/if}<input type="number" min={lossLimitStep} step={lossLimitStep} max={LOSS_LIMIT_MAX} bind:value={lossLimitAmount} on:change={() => { lossLimitAmount = sanitiseLossLimit(lossLimitAmount) }} on:blur={() => { lossLimitAmount = sanitiseLossLimit(lossLimitAmount) }} class="auto-menu-input" data-testid="loss-limit-input" />{#if lossLimitTrailing}{lossLimitSymbol}{/if}<span class="auto-menu-amount-fmt" data-money="cur" data-testid="loss-limit-formatted" aria-live="polite">{lossLimitLabel}</span></label>
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
        <button class="hud-menu-item" role="menuitem" on:click={openPaytable} data-testid="open-paytable">{$tr('paytable')}</button>
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
                title={$tr('a11yCycleSpeed')}>
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
    <span class="m-stat-value cyan" data-money="cur" use:fitMoney={{ full: balanceLabel, compact: balanceCompact }}></span>
  </div>
  <div class="m-stat m-stat--win" data-testid="hud-win">
    <span class="m-stat-label">{$tr('hudWinShort')}</span>
    <span class="m-stat-value magenta" data-money="cur" use:fitMoney={{ full: winLabel, compact: winCompact }}></span>
  </div>
  <div class="m-stat m-stat--bet" data-testid="hud-bet">
    <button class="m-bet-step" on:click={decreaseBet} disabled={$isSpinning || !$canDecreaseBetLevel} aria-label={$tr('a11yDecreaseBet')}>
      <svg viewBox="0 0 20 12"><path d="M4 3l6 6 6-6"/></svg>
    </button>
    <button class="m-stat-value gold bet-open" data-money="cur" use:autofitText={betLabel} on:click={openBetSelector} aria-haspopup="dialog" aria-expanded={showBetSelector} aria-label={$tr("a11yOpenBetSelector")} data-testid="bet-window"><span class="bet-open-text">{betLabel}</span></button>
    <button class="m-bet-step" on:click={increaseBet} disabled={$isSpinning || !$canIncreaseBetLevel} aria-label={$tr('a11yIncreaseBet')}>
      <svg viewBox="0 0 20 12"><path d="M4 9l6-6 6 6"/></svg>
    </button>
  </div>

  <button
    class="m-spin"
    class:spinning={$isSpinning}
    data-testid="spin-button"
    on:click={handleSpin}
    disabled={$isWincap ? true : ($isSpinning ? false : !$canAffordSpin)}
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
        <button class="hud-menu-item" role="menuitem" on:click={openPaytable} data-testid="open-paytable">{$tr('paytable')}</button>
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
    <span class="c-stat-value cyan" data-money="cur" use:autofitText={balanceLabel}>{balanceLabel}</span>
  </div>
  <div class="c-stat c-stat--win" data-testid="hud-win">
    <span class="c-stat-label">{$tr('win')}</span>
    <span class="c-stat-value magenta" data-money="cur" use:autofitText={winLabel}>{winLabel}</span>
  </div>
  <div class="c-stat c-stat--bet" data-testid="hud-bet">
    <span class="c-stat-label">{$tr('bet')}</span>
    <div class="c-bet-row" data-testid="bet-arrows">
      <button class="c-bet-step" on:click={decreaseBet} disabled={$isSpinning || !$canDecreaseBetLevel} aria-label={$tr('a11yDecreaseBet')}>
        <svg viewBox="0 0 20 12"><path d="M4 3l6 6 6-6"/></svg>
      </button>
      <button class="c-stat-value gold bet-open" data-money="cur" use:autofitText={betLabel} on:click={openBetSelector} aria-haspopup="dialog" aria-expanded={showBetSelector} aria-label={$tr("a11yOpenBetSelector")} data-testid="bet-window"><span class="bet-open-text">{betLabel}</span></button>
      <button class="c-bet-step" on:click={increaseBet} disabled={$isSpinning || !$canIncreaseBetLevel} aria-label={$tr('a11yIncreaseBet')}>
        <svg viewBox="0 0 20 12"><path d="M4 9l6-6 6 6"/></svg>
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
    title={$tr('a11yCycleSpeed')}
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
            <label class="auto-menu-amount">{#if !lossLimitTrailing}{lossLimitSymbol}{/if}<input type="number" min={lossLimitStep} step={lossLimitStep} max={LOSS_LIMIT_MAX} bind:value={lossLimitAmount} on:change={() => { lossLimitAmount = sanitiseLossLimit(lossLimitAmount) }} on:blur={() => { lossLimitAmount = sanitiseLossLimit(lossLimitAmount) }} class="auto-menu-input" data-testid="loss-limit-input" />{#if lossLimitTrailing}{lossLimitSymbol}{/if}<span class="auto-menu-amount-fmt" data-money="cur" data-testid="loss-limit-formatted" aria-live="polite">{lossLimitLabel}</span></label>
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
    disabled={$isWincap ? true : ($isSpinning ? false : !$canAffordSpin)}
    on:click={handleSpin}
    aria-label={$tr('spin')}
    data-testid="spin-button"
  >
    <svg class="glyph play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
    <svg class="glyph arrows" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M18 3v5h-5"/></svg>
  </button>
</div><!-- /c-hud -->
{:else}
<!-- HUD - R153 operator strip (was the B1 reskin). .fs-hud is a display:contents token-scope wrapper only;
     every control keeps its own position:absolute against the same stage
     ancestor, so nothing shifts. Overdrive flips accents from the shared flag. -->
<div class="fs-hud" class:fs-hud--overdrive={$overdriveVisual}>

  <!-- HUD panel. The v3.2 geometry this comment used to state, x 296..984
         (688 wide), was superseded on 2026-07-25 by OWNER AUDIT ROUND 3 item 7,
         which shifted the row right and re-measured the banner to 309..1020
         (711 wide). The comment was not updated then, which is where the 711
         against 688 discrepancy came from. It is now derived from the row's own
         token: one gap before MAX, one gap after STEPPERS. -->
  <div class="fs-panel" data-testid="hud-panel"></div>

  <!-- TURBO - v3.2: OUTSIDE the panel, centre (268,604) -->
  <button
    class="fs-turbo fs-knob"
    data-speed={$speedTier}
    data-testid="hud-turbo"
    on:click={toggleTurbo}
    disabled={$isSpinning || $rgJurisdiction.turboDisabled}
    aria-label={$tr('a11yCycleSpeed')}
    title={$tr('a11yCycleSpeed')}
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
        <button class="hud-menu-item" role="menuitem" on:click={openPaytable} data-testid="open-paytable">{$tr('paytable')}</button>
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
  <div class="fs-box fs-balance" data-testid="hud-balance">
    <span class="fs-face">
      <span class="fs-label">{$tr('balance')}</span>
      <span class="fs-value cyan" data-money="cur" use:autofitText={balanceLabel}>{balanceLabel}</span>
    </span>
  </div>

  <!-- WIN - fixed box x 616, width 150 -->
  <div class="fs-box fs-win" data-testid="hud-win">
    <span class="fs-face">
      <span class="fs-label">{$tr('win')}</span>
      <span class="fs-value magenta" data-money="cur" use:autofitText={winLabel}>{winLabel}</span>
    </span>
  </div>

  <!-- BET - fixed box x 782, width 120, value right-aligned. Shows the
       EFFECTIVE debit (bet x MODE_COST[standingMode]), not the nominal bet
       level, whenever a standing/enhancer mode changes the real cost. -->
  <div class="fs-box fs-bet" data-testid="hud-bet">
    <span class="fs-face">
      <span class="fs-label">{$tr('bet')}</span>
      <button class="fs-value gold bet-open" data-money="cur" use:autofitText={betLabel} on:click={openBetSelector} aria-haspopup="dialog" aria-expanded={showBetSelector} aria-label={$tr("a11yOpenBetSelector")} data-testid="bet-window"><span class="bet-open-text">{betLabel}</span></button>
    </span>
  </div>

  <!-- Mode badge anchor - a plain (unclipped) sibling matching the BET box's
       own geometry exactly. .fs-plate's clip-path would otherwise clip any
       child poking above the box, so this sits outside it, not inside.
       R153: the plate and its clip-path are gone, but the face now clips with
       overflow:hidden, so the badge still has to sit outside the box to reach
       above the strip's top edge. -->
  {#if isOverboost || isCruise}
    <div class="fs-bet-badge-anchor">
      {#if isOverboost}
        <span class="fs-mode-badge overboost" data-testid="hud-overboost-badge">{overboostLabel}</span>
      {:else}
        <span class="fs-mode-badge cruise" data-testid="hud-cruise-label">{cruiseLabel}</span>
      {/if}
    </div>
  {/if}

  <!-- R153: one chevron pair, stroked, in the locked STEPPERS column beside BET. -->
  <div class="fs-arrows" data-testid="bet-arrows">
    <button class="fs-arrow" on:click={increaseBet} disabled={$isSpinning || !$canIncreaseBetLevel} aria-label={$tr('a11yIncreaseBet')}><svg viewBox="0 0 20 12"><path d="M4 9l6-6 6 6"/></svg></button>
    <button class="fs-arrow" on:click={decreaseBet} disabled={$isSpinning || !$canDecreaseBetLevel} aria-label={$tr('a11yDecreaseBet')}><svg viewBox="0 0 20 12"><path d="M4 3l6 6 6-6"/></svg></button>
  </div>

  <!-- SPIN - v3.2: centre (1004,604), 84 diameter. Stays clickable mid-spin
       (slam-stop, Motion Polish v2) even though $canAffordSpin is false while spinning. -->
  <button
    class="fs-spin"
    class:spinning={$isSpinning}
    disabled={$isWincap ? true : ($isSpinning ? false : !$canAffordSpin)}
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
          <label class="auto-menu-amount">{#if !lossLimitTrailing}{lossLimitSymbol}{/if}<input type="number" min={lossLimitStep} step={lossLimitStep} max={LOSS_LIMIT_MAX} bind:value={lossLimitAmount} on:change={() => { lossLimitAmount = sanitiseLossLimit(lossLimitAmount) }} on:blur={() => { lossLimitAmount = sanitiseLossLimit(lossLimitAmount) }} class="auto-menu-input" data-testid="loss-limit-input" />{#if lossLimitTrailing}{lossLimitSymbol}{/if}<span class="auto-menu-amount-fmt" data-money="cur" data-testid="loss-limit-formatted" aria-live="polite">{lossLimitLabel}</span></label>
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
  /* NOTE R153: the landscape exclusion described above still stands, for a different reason. The
     plate has no clip-path since R153, and it IS treated as a touch target now: it meets the 44px
     floor through .fs-bet .bet-open::after (in R153 OPERATOR STRIP below), which covers the whole
     120x62 BET box, not through this min-height. */
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
    /* R153: the operator plate, flat. The cyan top rule was a neon rail by another name. */
    background: var(--op-plate);
    border-radius: 8px;
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
    /* R153: white, in both states, like the other three profiles. */
    --p-acc: var(--op-glyph);
  }

  .m-menu-wrapper { position: relative; flex: 0 0 auto; }
  /* 36px visual with a 44px hit area via the pseudo-element: the target is
     full size without the button itself eating the row. */
  .m-round-btn {
    position: relative;
    box-sizing: border-box;
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: transparent; border: 1px solid var(--op-hairline);
    color: var(--op-glyph); cursor: pointer; padding: 0;
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
  .m-hud-menu .hud-menu-item { padding-top: 0.25rem; padding-bottom: 0.25rem; min-height: 0; }

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
    /* R153 keeps 7px here, under the brief's 10px, and that is the one profile where it does.
       MEASURED IN R153 at 400x225 with the label forced to 10px: the BALANCE value slot shrank
       from 64 to 58px, a $50,000.00 balance no longer fitted it, and $1,234,567.89 fell back to
       the abbreviated $1.234M where 7px shows it in full (the WIN slot went 52 to 45px). The
       values are what this strip exists to show (the .m-stat-value note below). The brief's proof
       sizes are 1280 and 390; this exception is on the R153 owner list. Colour and face follow
       the strip. */
    font-size: 7px; font-weight: 700; letter-spacing: 0.08em; color: var(--op-label); text-transform: uppercase;
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
  .m-stat-value.cyan,
  .m-stat-value.magenta,
  .m-stat-value.gold { color: var(--op-value); }

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
    background: transparent; border: none;
    cursor: pointer;
  }
  /* Same trick as the menu button: 26x30 visual, 44px effective target.
     -9 and not -7: the proof measured the effective box and reported 40x44,
     so the horizontal extension was one step short of the floor. Measured,
     then corrected, rather than assumed from the visual size. */
  .m-bet-step::after { content: ''; position: absolute; inset: -10px; }
  .m-bet-step svg { width: 12px; height: 8px; overflow: visible; }
  .m-bet-step svg path { fill: none; stroke: var(--op-glyph); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
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
    /* R153: a 40px circle with the 2px accent ring, the same object as SPIN everywhere else,
       where it was a 44x40 cyan gradient tile. The ::after extension below takes the effective
       target to 46x46, still over the 44 floor the measurement above was taken against. */
    box-sizing: border-box;
    width: 40px; height: 40px; border-radius: 50%; padding: 0;
    display: flex; align-items: center; justify-content: center;
    background: transparent;
    border: 2px solid var(--hud-accent);
    cursor: pointer;
  }
  .m-spin::after { content: ''; position: absolute; inset: -3px; }
  .m-spin svg { width: 18px; height: 18px; fill: var(--op-value); }
  .m-spin:disabled { opacity: 0.4; cursor: default; }

  /* NOTE R153 (2026-10-07), above the B1 header it supersedes: the material language that header
     names (brushed chrome, gunmetal, gold, one signature colour per field, matched to the gauge
     bezel) is retired. Since R153 every HUD profile paints the operator strip: one flat plate,
     white type, hairline circles, the spin ring as the only accent. See R153 OPERATOR STRIP below.
     ============================================================================
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
  /* ===== OPERATOR SHELL, R119 ================================================
     The base --hud-* tokens moved to App.svelte's .game-wrapper in R120 so the
     paytable, the FEATURES bar and the instrument column inherit the same shell.
     THEY CANNOT LIVE ON :root. --theme-primary is declared on .game-wrapper, and
     a custom property is substituted where it is DECLARED, not where it is used:
     a :root token referencing it resolves to its fallback and silently stops
     following the palette. Verified in a browser before moving it - a :root
     token rendered the cyan fallback while the same token on the wrapper
     rendered the theme colour.

     Only the state flip stays here, because it is scoped to a HUD state. */
  /* R153: the mini strip joins the flip. Its spin ring now reads --hud-accent like the other three
     profiles; before R153 it hard-coded cyan and switched to a magenta gradient while spinning. */
  .fs-hud--overdrive, .p-hud--overdrive, .c-hud--overdrive, .m-hud--overdrive{
    --hud-accent: var(--theme-secondary, #FF2EC4);
  }

  .fs-hud{
    display:contents;

    /* ===== THE CONTROL ROW'S ONE SPACING SCALE ================================
       Every horizontal position in this row is now derived from a SINGLE token
       and the controls' own widths, rather than from nine hand-set left values
       that happened to agree.

       THE TOKEN'S VALUE IS NOT INVENTED. 16px is what SEVEN of the row's eight
       control-to-control gaps already measured, and it is what HUD_SPEC.md rule
       2 has locked since 2026-07-25: "Every distinct control is separated from
       its neighbour by exactly 16px". The eighth gap, SPIN to AUTO, is 0 by
       HUD_SPEC.md rule 4, AUTO tangent to SPIN, and is expressed as such below
       rather than smuggled in as a different number.

       EVERY CONTROL'S RENDERED COORDINATE IS UNCHANGED by this refactor, which
       is provable rather than asserted: frontend/scripts/hud_banner_spec_check.mjs
       pins each one to the exact locked value and stays green. The chain starts
       at TURBO's locked left edge and walks right, one token at a time.

       The SLAB is the one geometry that changes, by 7px on its right edge only.
       It backs MAX through STEPPERS with one token of inset on each side, so
       the two OUTER gaps, TURBO to slab and slab to SPIN, become EQUAL. They
       were 0.00 and 7.00, an asymmetry with no rule behind it. See
       reports/screens/controlrow-2026-08-15/MEASUREMENTS.md for the before and
       after tables and for what this does NOT fix. */
    --fs-row-gap:16px;

    --fs-w-turbo:82px; --fs-w-max:48px;  --fs-w-menu:44px;
    --fs-w-bal:200px;  --fs-w-win:150px; --fs-w-bet:120px;
    --fs-w-step:44px;  --fs-w-spin:84px; --fs-w-auto:48px;

    /* THE ROW'S ORIGIN, and the whole rebalance is this one number.
       R071 TASK 6, owner ruling: the control row's contents align their midpoint
       to the canvas centre. The slab backs MAX through STEPPERS, whose span ran
       325 to 1011 with a midpoint of 668, so the slab sat 28px right of the 640
       centre under a dead-centred reel. Moving the origin 28px left translates
       every control by the same 28px, because every position below is derived
       from this one: the seven 16px gaps are untouched, AUTO stays tangent to
       SPIN, and the contents' midpoint becomes (297 + 983) / 2 = 640 exactly.
       docs/HUD_SPEC.md and hud_banner_spec_check.mjs move with it in the same
       commit, which the spec's own rule requires. */
    --fs-x-turbo:199px;
    --fs-x-max:  calc(var(--fs-x-turbo) + var(--fs-w-turbo) + var(--fs-row-gap));
    --fs-x-menu: calc(var(--fs-x-max)   + var(--fs-w-max)   + var(--fs-row-gap));
    --fs-x-bal:  calc(var(--fs-x-menu)  + var(--fs-w-menu)  + var(--fs-row-gap));
    --fs-x-win:  calc(var(--fs-x-bal)   + var(--fs-w-bal)   + var(--fs-row-gap));
    --fs-x-bet:  calc(var(--fs-x-win)   + var(--fs-w-win)   + var(--fs-row-gap));
    --fs-x-step: calc(var(--fs-x-bet)   + var(--fs-w-bet)   + var(--fs-row-gap));
    --fs-x-spin: calc(var(--fs-x-step)  + var(--fs-w-step)  + var(--fs-row-gap));
    /* HUD_SPEC.md rule 4: AUTO is tangent to SPIN, deliberately no gap. */
    --fs-x-auto: calc(var(--fs-x-spin)  + var(--fs-w-spin));

    /* The slab: one token of inset before MAX and one after STEPPERS. */
    --fs-x-slab: calc(var(--fs-x-max) - var(--fs-row-gap));
    --fs-w-slab: calc(var(--fs-x-step) + var(--fs-w-step) + var(--fs-row-gap) - var(--fs-x-slab));
    --sig-cyan:    var(--theme-primary,   #00FFFF);
    --sig-magenta: var(--theme-secondary, #FF00FF);
    --sig-pink:    #FF2EC4;   /* HUD magenta used in v3.7 boxes */
    --sig-gold:    #FFD700;
    --sig-orange:  #FF9A2E;
    --navy:        #060610;
    /* R153: --acc and --acc2 ("live accents - flipped by the Overdrive skin below") are deleted.
       R153 removed every rule that read them and the Overdrive flip that set them, so they had no
       reader; --hud-accent is the one accent token. */
  }

  /* ===== R153 OPERATOR STRIP, DESKTOP ========================================
     The owner's brief R153 TASK 1 (reports/briefs/FS_R153_OperatorStripHeroStill_Prompt.md),
     after a 4.3/9 score tagged "poor bet UI bar": the pattern of one dark strip under the reels
     with small tracked labels, white values, a chevron pair on BET, a ringed spin circle and
     hairline circles for everything else. "The theme lives on the grid. The bar is a control."

     WHAT WENT, so a reader does not go looking for it: the hud_banner.png bracket texture and
     the glass gradient over it, the chamfered .fs-plate bezels and their sunken faces, the
     .fs-rail neon rails (markup and rules), the win plate's rail bloom and its 1.1s value pop,
     the OVERBOOST bet glow pulse, the chrome caps under the bet arrows and their cyan glow, the
     triangle glyphs, the .fs-knob bezels, the brightness and scale hovers, the spin button's
     accent bloom and dome, and the Overdrive panel edge pulse and hue rotations. The previous
     rules are in this file at 895815b9.

     WHAT DID NOT MOVE: every coordinate. The --fs-* chain above, the slab and every control box
     are exactly what docs/HUD_SPEC.md locks and hud_banner_spec_check.mjs and
     control_row_symmetry_gate.mjs measure. This section changes paint only.

     THE ONE ACCENT is the spin ring, through --hud-accent, which the Overdrive flip above turns
     magenta. Everything else is white at three strengths (--op-value, --op-glyph, --op-label)
     on the one plate, declared once on App.svelte's .game-wrapper. */

  /* ---- the strip: MAX through STEPPERS, one flat plate ----------------------- */
  .fs-panel{
    position:absolute;left:var(--fs-x-slab);top:560px;width:var(--fs-w-slab);height:88px;z-index:59;
    border-radius:8px;pointer-events:none;
    background:var(--op-plate);
  }

  /* ---- BALANCE / WIN / BET: label over value, straight on the strip ---------- */
  .fs-box{position:absolute;top:573px;height:62px;z-index:60;}
  .fs-balance{left:var(--fs-x-bal);width:var(--fs-w-bal);}
  .fs-win    {left:var(--fs-x-win);width:var(--fs-w-win);}
  .fs-bet    {left:var(--fs-x-bet);width:var(--fs-w-bet);}
  /* overflow:hidden is load-bearing. The .fs-plate clip-path used to be the value's clipping
     ancestor, and money_fit_gate.mjs's seed 5 needs one within three levels of .fs-value to
     prove that a value escaping its box is caught; the face now provides it. */
  .fs-box > .fs-face{
    position:absolute;inset:0;padding:0 10px;overflow:hidden;
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;
  }
  /* BET reads right-aligned so its value sits against the chevrons it is changed by. */
  .fs-bet > .fs-face{align-items:flex-end;padding-right:6px;}

  .fs-label{
    font-family:var(--fs-font-numeric);font-size:10px;font-weight:700;line-height:1;
    letter-spacing:.16em;text-transform:uppercase;color:var(--op-label);
  }
  /* One white face, tabular figures, live: the value is the markup's own text, fed by the
     stores every frame, never a raster. max-width plus overflow keep an over-wide string inside
     its own box so autofitText sees the overflow and shrinks it (R061). */
  .fs-value{
    font-family:var(--fs-font-numeric);
    font-size:calc(18px * var(--autofit-scale, 1));
    font-weight:700;line-height:1.1;letter-spacing:.02em;
    white-space:nowrap;font-variant-numeric:tabular-nums;
    color:var(--op-value);
    -webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;
    max-width:100%;overflow:hidden;
  }
  /* The cyan / magenta / gold classes stay on the markup (tests and the autofit hook read
     them) and all three resolve to the one white. */
  .fs-value.cyan,
  .fs-value.magenta,
  .fs-value.gold{color:var(--op-value);text-shadow:none;}
  .fs-bet .fs-label,.fs-bet .fs-value{text-align:right;width:100%;}
  /* THE WHOLE BET BOX OPENS THE PICKER. The readout button is the size of its digits (about
     104x20), and this layout is also the one a landscape tablet gets, scaled, so it is a touch
     target that sat far under the 44px floor. The ::after covers the face (120x62), the
     button's containing block: the button itself is position:static, so its own overflow:hidden
     does not clip the pseudo-element, and a press anywhere in the BET box is a press on the
     button. Nothing moves and nothing new is drawn. */
  .fs-bet .bet-open::after{content:'';position:absolute;inset:0;}
  .fs-bet .bet-open:disabled::after{content:none;}

  /* Cost-visibility badge above BET. Neutral now: the word carries the state, and the value
     under it already reads the effective 1.25x cost. R153 also corrected its anchor, which sat
     at a hand-set left:831px, the BET box's position before R071 moved the row 28px left, so it
     had been floating 28px right of the box it labels since 2026-08-15. */
  .fs-bet-badge-anchor{
    position:absolute;left:var(--fs-x-bet);top:555px;width:var(--fs-w-bet);height:16px;
    z-index:61;display:flex;justify-content:flex-end;pointer-events:none;
  }
  .fs-mode-badge{
    font-family:var(--fs-font-numeric);font-size:10px;font-weight:700;line-height:12px;
    letter-spacing:.12em;white-space:nowrap;
    /* No text-transform: TR-092, OVERBOOST is capitals in the specification and Cruise is not. */
    padding:1px 7px;border-radius:999px;
    color:var(--op-value);background:var(--op-plate);border:1px solid var(--op-hairline-hi);
  }

  /* ---- BET: one chevron pair --------------------------------------------------
     Two 44x24 keys in the locked 44x52 column, each with a 44x44 hit area (below), an up and a
     down chevron drawn as strokes.
     No cap, no fill, no glow: the plus/minus caps and their triangles are gone from the control. */
  .fs-arrows{position:absolute;left:var(--fs-x-step);top:578px;width:var(--fs-w-step);height:52px;z-index:60;
    display:flex;flex-direction:column;gap:4px;}
  .fs-arrow{
    position:relative;
    width:44px;height:24px;padding:0;border:none;border-radius:6px;cursor:pointer;
    background:transparent;display:flex;align-items:center;justify-content:center;
  }
  /* 44x44 TARGETS IN A 44x52 COLUMN, WITHOUT MOVING IT. Each key was 44x24, under the 44px floor
     HUD_SPEC.md rule 3 sets and the R153 brief restates; only the column was ever measured. Each
     key's hit area now extends 20px AWAY from the other, up for the up key and down for the down
     key, so the two stay 4px apart and never overlap. Up to y 558 crosses only the strip's own top
     edge (the badge anchor ends at x 923, 16px left of this column); down to y 650 is clear scene. The drawn chevrons and the
     locked column are unchanged. */
  .fs-arrow::after{content:'';position:absolute;left:0;right:0;}
  .fs-arrow:first-child::after{top:-20px;bottom:0;}
  .fs-arrow:last-child::after{top:0;bottom:-20px;}
  .fs-arrow:disabled::after{content:none;}
  .fs-arrow svg{width:16px;height:10px;overflow:visible;}
  .fs-arrow svg path{fill:none;stroke:var(--op-glyph);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}
  .fs-arrow:hover:not(:disabled){background:rgba(255,255,255,.07);}
  .fs-arrow:hover:not(:disabled) svg path{stroke:var(--op-value);}
  .fs-arrow:active:not(:disabled){transform:translateY(1px);}
  .fs-arrow:disabled{opacity:.3;cursor:not-allowed;}

  /* ---- the hairline circles: MAX, MENU, TURBO, AUTO -----------------------------
     One treatment for all four: the strip's own plate inside a 1px edge at 32% white, the glyph
     at 86% white. MAX and MENU sit on the strip, so only their edge shows there; TURBO and AUTO
     sit off it, over the scene, where the plate is what keeps their glyph legible. */
  .fs-max{position:absolute;left:var(--fs-x-max);top:580px;width:var(--fs-w-max);height:48px;padding:0;
    border-radius:50%;cursor:pointer;z-index:60;
    background:var(--op-plate);border:1px solid var(--op-hairline);
    display:flex;align-items:center;justify-content:center;}
  .fs-max .cap{
    font-family:var(--fs-font-numeric);font-size:11px;font-weight:700;letter-spacing:.08em;
    color:var(--op-value);
  }
  .fs-max:hover:not(:disabled){border-color:var(--op-hairline-hi);}
  .fs-max:active:not(:disabled){transform:translateY(1px);}
  .fs-max:disabled{opacity:.35;cursor:not-allowed;}

  /* MENU keeps its locked 44x44 box (.menu-wrapper below is the positioning authority) and
     becomes a circle like its neighbours. */
  .fs-menu{position:absolute;left:var(--fs-x-menu);top:582px;width:var(--fs-w-menu);height:44px;z-index:60;
    padding:0;cursor:pointer;border-radius:50%;
    background:var(--op-plate);border:1px solid var(--op-hairline);
    display:flex;align-items:center;justify-content:center;}
  .fs-menu .inset{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;}
  .fs-menu .bar{width:16px;height:2px;border-radius:1px;background:var(--op-glyph);}
  .fs-menu:hover{border-color:var(--op-hairline-hi);}
  .fs-menu:active{transform:translateY(1px);}

  /* TURBO and AUTO carry their circle on the inner .fs-face, so the button box keeps the locked
     geometry while the drawn circle matches its neighbours. TURBO's box is 82x82 by HUD_SPEC (it
     was sized for a 44px effective target at a 0.54 stage scale) and its circle is drawn at 48,
     the size of MAX and AUTO: an 82px circle beside an 84px SPIN would have made the speed
     control read as a second primary. The whole 82x82 box still takes the tap.
     THE CIRCLE SITS AT THE BOX'S RIGHT EDGE, NOT ITS CENTRE (corrected in R153's own review).
     Centred it spanned x 216..264, leaving a visible 33px gap to MAX where every other visible gap
     in the row is 16 (HUD_SPEC rule 2), and floating 17px off the strip's left end while SPIN
     meets the right end. At left:34px it spans 233..281: 16px to MAX, flush with the strip's left
     end as SPIN is flush with its right. Centre-Y stays 604; the box and its tap are unchanged. */
  .fs-knob{padding:0;border:none;border-radius:50%;background:none;}
  .fs-knob > .fs-face{
    position:absolute;border-radius:50%;box-sizing:border-box;
    background:var(--op-plate);border:1px solid var(--op-hairline);
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;
  }

  .fs-turbo{position:absolute;left:var(--fs-x-turbo);top:563px;width:var(--fs-w-turbo);height:82px;z-index:60;cursor:pointer;}
  .fs-turbo > .fs-face{left:34px;top:17px;width:48px;height:48px;}
  .fs-turbo svg{width:22px;height:22px;}
  .fs-turbo svg path{stroke-width:1.6;stroke-linejoin:round;}
  .fs-turbo:disabled{opacity:.5;cursor:not-allowed;}

  /* THE THREE SPEEDS ARE THREE LUMINANCE STEPS, AS BEFORE, NOW IN WHITE. FS VISUAL FIXPACK JOB 2
     made intensity the state (no numeral, no hue-only cue, WCAG 1.4.1) and turbo_intensity_gate
     measures mean luminance over the control rising by at least 1.25:1 per step. With the spin
     ring the only accent, the steps are spent in white: an outlined bolt at rest, a lit circle
     with a solid white bolt, then a solid white disc with the bolt cut out of it. */
  .fs-turbo[data-speed="normal"] svg path{fill:none;stroke:var(--op-label);}
  /* 40% white, not 22%: at 22% the Desktop normal-to-turbo step measured 1.165:1 against the
     gate's 1.25 floor (the 48px circle is about 14% of the measured area). */
  .fs-turbo[data-speed="turbo"] > .fs-face{
    background:color-mix(in srgb,#ffffff 40%,#12141a);border-color:var(--op-hairline-hi);}
  .fs-turbo[data-speed="turbo"] svg path{fill:var(--op-value);stroke:var(--op-value);}
  .fs-turbo[data-speed="super"] > .fs-face{background:#ffffff;border-color:#ffffff;}
  .fs-turbo[data-speed="super"] svg path{fill:#12141a;stroke:#12141a;}

  .fs-auto{position:absolute;left:var(--fs-x-auto);top:580px;width:var(--fs-w-auto);height:48px;z-index:60;cursor:pointer;}
  .fs-auto > .fs-face{inset:0;gap:0;}
  .fs-auto svg{width:20px;height:20px;}
  .fs-auto svg path{fill:none;stroke:var(--op-glyph);stroke-width:2;stroke-linecap:round;}
  .fs-auto .count{font-family:var(--fs-font-numeric);font-size:14px;font-weight:700;
    color:var(--op-value);font-variant-numeric:tabular-nums;}
  .fs-auto:hover:not(:disabled) > .fs-face{border-color:var(--op-hairline-hi);}
  .fs-auto:disabled{opacity:.4;cursor:not-allowed;}
  /* Running: the edge goes solid white and the remaining count replaces the glyph. No pulse. */
  .fs-auto.active > .fs-face,
  .fs-auto.active:hover:not(:disabled) > .fs-face{border-color:var(--op-value);}

  /* ---- SPIN: a circle with a 2px ring, the only accent --------------------------
     84px, the largest control, on the strip's plate, with the ring in --hud-accent (cyan, and
     magenta under Overdrive through the flip above). The glyph and its word are white so the
     ring is the only colour on the bar. The spinning arrows still turn: that is feedback that a
     press was taken, not decoration, and reduced motion stops it below. */
  .fs-spin{position:absolute;left:var(--fs-x-spin);top:562px;width:var(--fs-w-spin);height:84px;z-index:61;
    padding:0;border:none;cursor:pointer;border-radius:50%;
    background:var(--op-plate);
    transition:transform .12s ease,background-color .15s ease;}
  .fs-spin .ring{position:absolute;inset:0;border-radius:50%;border:2px solid var(--hud-accent);}
  .fs-spin .dome{position:absolute;inset:2px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;}
  .fs-spin .glyph{width:28px;height:28px;margin-bottom:8px;}
  .fs-spin .glyph.play path{fill:var(--op-value);}
  .fs-spin .glyph.arrows{display:none;}
  .fs-spin .glyph.arrows path{fill:none;stroke:var(--op-value);stroke-width:2.4;stroke-linecap:round;}
  .fs-spin .txt{position:absolute;bottom:15px;left:0;right:0;text-align:center;
    font-family:var(--fs-font-numeric);font-size:10px;font-weight:700;letter-spacing:.16em;
    color:var(--op-label);}
  .fs-spin:hover:not(:disabled){background:color-mix(in srgb,#ffffff 8%,#12141a);}
  .fs-spin:active:not(:disabled){transform:scale(.96);}
  .fs-spin:disabled{opacity:.45;cursor:not-allowed;}
  .fs-spin.spinning .glyph.play{display:none;}
  .fs-spin.spinning .glyph.arrows{display:block;animation:fs-spin-rot .7s linear infinite;}
  .fs-spin.spinning .txt{opacity:.5;}
  @keyframes fs-spin-rot{to{transform:rotate(360deg);}}

  /* NOTE R153 (2026-10-07): the R135 note below says the five signature tokens drive the bar.
     Since R153 the bar paints from the --op-* plate tokens and --hud-accent; the --sig-* tokens
     still exist on .fs-hud, and the only rule in this file that reads one is the .bet-open focus ring. */
  /* R135: the three swappable scheme rules are deleted. Nothing ever added those classes, so they
     shipped nothing and stood as build warnings. See the matching note in PaytableModal.svelte.
     The claim above them, that the HUD is skin-free because every colour comes from five signature
     tokens, remains TRUE and is unaffected: the tokens are still there and still drive the bar.
     What is gone is only the three unreachable overrides. */

  /* ===== OVERDRIVE =============================================================
     R153: the whole Overdrive state on this bar is the accent flip at the top of this section,
     which turns the spin ring magenta. The edge pulse, the dome gradient and the hue rotations on
     the arrows, menu and auto controls are gone with the chrome they decorated. */

  @media (prefers-reduced-motion:reduce){
    .fs-spin.spinning .glyph.arrows{animation:none;}
  }

  /* ============================================================================
     DROPDOWN MENUS - NOT part of the design pass (kept from the live component).
     The menu / autoplay wrappers position the new chrome buttons and anchor
     their dropdowns; the buttons themselves render static inside the wrapper so
     their spec coordinates are unchanged.
     ========================================================================== */
  .menu-wrapper {
    position: absolute;
    /* On the row's token chain, R071 TASK 6: this wrapper carries the MENU
       box that HUD_SPEC.md pins, so it moves with the origin like every other
       control rather than staying behind at a hand-set value. */
    left: var(--fs-x-menu);
    top: 582px;
    width: 44px;
    height: 44px;
    z-index: 60;
  }
  .menu-wrapper .fs-menu { position: static; left: auto; top: auto; }

  /* R153: the menu that holds the PAYTABLE entry is the same dark plate as the strip it opens
     from (the brief: "Paytable and feature entry buttons restyle to the same dark plate"). It was
     a 96% navy panel with a white hairline border. */
  .hud-menu {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    min-width: 200px;
    background: var(--op-plate);
    border-radius: 8px;
    overflow: hidden;
    z-index: 65;
  }
  /* R153: 44px tall, the floor the brief restates. PAYTABLE is the first item here and the
     paytable's only entry, and it measured about 32px. The mini menu keeps its compressed rows
     (see .m-hud-menu below): Popout S is a 400x225 desktop popout whose six items only fit the
     space above the row when compressed, measured at R2R-R JOB C. */
  .hud-menu-item {
    display: block;
    width: 100%;
    min-height: 44px;
    padding: 0.5rem 0.9rem;
    background: none;
    border: none;
    color: var(--op-value);
    text-align: left;
    font-family: var(--fs-font-numeric);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
  }
  .hud-menu-item:hover { background: rgba(255, 255, 255, 0.07); }

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
  /* R153: the three steps in WHITE, like the knob in every other profile. Before R153 the row
     stepped through accent gradients behind an accent leading-edge rail, with accent glows on the
     bolt and an 18px accent bloom at Super, the last accent left on the bar outside the spin ring
     (the R153 review found it here, in the Popout S menu). The row's fill still carries the step,
     which is what turbo_intensity_gate measures at Popout S: clear at Normal, a white wash with a
     solid white bolt at Turbo, a white row with the bolt and label cut out of it at Super. No rail,
     no glow, no gradient. The previous rules are in this file at 895815b9. */
  .m-turbo-item[data-speed="normal"] { background: none; }
  .m-turbo-item[data-speed="normal"] .m-turbo-bolt path { stroke: var(--op-label); stroke-width: 1.8; fill: none; }

  .m-turbo-item[data-speed="turbo"] { background: rgba(255, 255, 255, 0.18); }
  .m-turbo-item[data-speed="turbo"] .m-turbo-bolt path { stroke: var(--op-value); stroke-width: 1.8; fill: var(--op-value); }

  .m-turbo-item[data-speed="super"] { background: rgba(255, 255, 255, 0.9); color: #12141a; }
  .m-turbo-item[data-speed="super"] .m-turbo-bolt path { stroke: #12141a; stroke-width: 1.8; fill: #12141a; }

  /* ── Audio panel - Mute toggle + MUSIC / SOUND volume sliders ─────────────── */
  .audio-panel {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  /* R153: MUSIC and SOUND read as the strip's labels do, and the percentage as its values. */
  .audio-label {
    flex: 0 0 42px;
    font-family: var(--fs-font-numeric);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: var(--op-label);
  }
  .audio-pct {
    flex: 0 0 30px;
    text-align: right;
    font-family: var(--fs-font-numeric);
    font-size: 0.62rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--op-value);
  }

  /* Range slider. R153: a flat white track and a white thumb, no cyan gradient and no glow. */
  .audio-slider {
    flex: 1 1 auto;
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.24);
    outline: none;
    cursor: pointer;
    margin: 0;
  }
  /* R153, A FOUND DEFECT CLOSED IN PASSING: the slider has carried `outline: none` with no
     replacement since it was written, so a keyboard player tabbing to MUSIC or SOUND saw no
     focus at all. The ring below is the one every other HUD control gets from app.css. */
  .audio-slider:focus-visible {
    outline: 2px solid var(--theme-primary, #00ffff);
    outline-offset: 3px;
  }
  .audio-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--op-value);
    border: none;
    cursor: pointer;
  }
  .audio-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--op-value);
    border: none;
    cursor: pointer;
  }
  .audio-slider::-moz-range-track {
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.24);
  }

  /* OWNER AUDIT ROUND 3 item 7: this wrapper (not .fs-auto itself, which it
     forces to position:static) is the real positioning authority - docked
     tangent to SPIN's right edge, locked spec in docs/HUD_SPEC.md. */
  .autoplay-wrapper {
    position: absolute;
    /* On the row's token chain, R071 TASK 6. AUTO stays tangent to SPIN because
       --fs-x-auto is derived from SPIN's own left and width, not hand-set. */
    left: var(--fs-x-auto);
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
    /* R153: the operator plate, as the hamburger menu. It was navy with a gold hairline. */
    background: var(--op-plate);
    border-radius: 8px;
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
    color: var(--op-value);
    cursor: pointer;
    font-family: var(--fs-font-numeric);
    font-size: 1rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    text-align: center;
    box-sizing: border-box;
  }
  .auto-menu-item:hover { background: rgba(255, 255, 255, 0.07); }

  /* R042 BRIEF B. The chosen count has to be VISIBLE, or a two-step flow reads
     as a broken one-step flow: the player taps a number, nothing appears to
     happen, and they tap again. The selected state and the Start control are
     what make the second step legible. */
  .auto-menu-item.is-selected {
    background: rgba(255, 255, 255, 0.12);
    box-shadow: inset 3px 0 0 var(--op-value);
    font-weight: 700;
  }
  .auto-menu-start {
    display: block;
    width: 100%;
    min-height: 44px;
    margin-top: 4px;
    padding: 0.6rem 1rem;
    background: transparent;
    border: 1px solid var(--op-hairline-hi);
    border-radius: 999px;
    color: var(--op-value);
    font: inherit;
    font-family: var(--fs-font-numeric);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-align: center;
    cursor: pointer;
  }
  .auto-menu-start:hover { background: rgba(255, 255, 255, 0.08); }

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
    accent-color: #e9ecf2;
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
    /* R071 TASK 4: this field holds a money amount, so it takes the NUMERIC
       face like every other money surface rather than the brand face. */
    font-family: var(--fs-font-numeric);
    color: var(--op-value);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--op-hairline);
    border-radius: 6px;
    box-sizing: border-box;
  }
  .auto-menu-amount-fmt { margin-left: 6px; opacity: 0.75; font-size: 11px; letter-spacing: 0.02em; }
  .auto-menu-sep {
    padding: 0.5rem 1rem 0.25rem;
    font-size: 0.66rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--op-label);
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
    /* R153: the glyph colour every portrait control draws with. It was the cyan accent, and
       the operator strip spends the accent on the spin ring only. */
    --p-acc: var(--op-glyph);
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
    /* R153: one face for labels and values, Exo 2, which carries real tabular figures.
       Orbitron, which this was, ships no tnum, so tabular-nums was inert here. */
    font-family: var(--fs-font-numeric);
    /* R153: no gradient. The region shows the stage's own backdrop and the strip below is the
       one plate, so the bar is a control on the scene rather than a panel over it. */
    background: none;
  }
  /* R153: the Overdrive pink glyph shift is gone; the spin ring alone flips (--hud-accent). */
  /* THE STRIP, PORTRAIT. BALANCE and WIN over BET, as before, but one plate rather than three
     bezelled cards: #12141a at 90%, 8px corners, nothing else. */
  .p-top-group {
    display: flex; flex-direction: column; gap: 0; flex: 0 0 auto;
    padding: 2px 6px;
    border-radius: 8px;
    background: var(--op-plate);
  }

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
    /* R153: no card. The transparent 1px border keeps the measured box exactly where it was. */
    border: 1px solid transparent;
    background: none;
    position: relative;
  }
  /* R153: a live win no longer lights its field. The value counting up is the signal. */
  /* R119 SUPERSEDES THE "NEON LIFT" OF 2026-07-15. That pass gave each field a
     persistent per-field neon edge - balance cyan, win magenta, bet gold - so
     three adjacent plates carried three different colours at rest. The operator
     shell spends the accent only on a live win, so the resting edge is now the
     same neutral hairline on all three and the fields are told apart by their
     LABELS, which is what labels are for. The .lit win state is kept and is now
     the only coloured edge on the bar. */
  /* R153 SETS THE LABEL AT 10PX, AND THAT IS UNDER THIS BLOCK'S 11PX FLOOR ON PURPOSE. The
     owner's brief names the figure ("Labels BALANCE, WIN, BET at 10px tracked caps, 60% white"),
     a later and more specific instrument than the 2026-07-14 floor, so it governs under
     convention (n); portrait_layout_conformance.mjs carries the exemption, named, for these
     labels only. Values and every other text here stay at or above 11px. */
  .p-stat-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--op-label);
    white-space: nowrap;
  }
  .p-stat-value {
    /* OWNER AUDIT REMEDIATION B1: font-size scales down via the
       autofitText action's --autofit-scale custom property so values up to
       $999,999.99 fit without truncating. R059 GOVERNING RULE: the
       text-overflow ellipsis that sat here as a "defensive fallback" is
       REMOVED, because ellipsis on money is banned outright: a fallback
       that renders dots over a balance is not a defence, it is the defect
       (the m-stat rule below reasoned this out first and never carried
       one). Overflow stays hidden purely as containment mid-fit. */
    font-size: calc(18px * var(--autofit-scale, 1));
    font-weight: 700;
    letter-spacing: 0.02em;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    color: var(--op-value);
    max-width: 100%;
    overflow: hidden;
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
    padding: 4px 8px;
    min-height: 52px;
    /* R153: the BET row sits in the same plate as BALANCE and WIN, divided from them by a
       hairline rather than boxed as its own card. The OVERBOOST glow pulse that lived here
       went with the per-plate accents (see the script note). */
    background: none;
    border: 1px solid transparent;
    border-top-color: rgba(255, 255, 255, 0.08);
  }
  .p-stat-value.cyan,
  .p-stat-value.magenta,
  .p-stat-value.gold { color: var(--op-value); }

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
    /* R153: a chevron, not a filled key. The 44x44 target is unchanged; only its paint went. */
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .p-bet-step svg { width: 16px; height: 10px; overflow: visible; }
  .p-bet-step svg path { fill: none; stroke: var(--op-glyph); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  .p-bet-step:active:not(:disabled) { background: rgba(255, 255, 255, 0.07); }
  .p-bet-step:disabled { opacity: 0.3; cursor: not-allowed; }

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
  /* R153: one neutral badge for both modes. The word carries the state; colour carried none of
     it that the word did not, and the strip has no per-plate accent. */
  .p-mode-badge.overboost,
  .p-mode-badge.cruise {
    color: var(--op-value);
    background: var(--op-plate);
    border: 1px solid var(--op-hairline-hi);
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
     with headroom). R153: a hairline circle on the strip's plate, white glyph,
     where it was chrome on navy with a cyan glyph. */
  .p-round-btn {
    position: relative;
    box-sizing: border-box;
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    padding: 0;
    border: 1px solid var(--op-hairline);
    border-radius: 50%;
    background: var(--op-plate);
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
  .p-round-btn:active:not(:disabled) { border-color: var(--op-hairline-hi); }
  /* Autoplay running: the edge goes solid white. No glow. */
  .p-round-btn.active { border-color: var(--op-value); }

  /* FS VISUAL FIXPACK JOB 2: the portrait speed control, three intensity steps.
     Replaces the former boolean `.engaged`, which lit Turbo and Super Turbo
     identically and left the numeral as the only thing telling them apart. The
     bolt also FILLS as it intensifies, so the step is a change in the amount of
     lit area as well as in brightness: a second, independent cue that survives
     a washed-out screen. Bolt grown 20px to 24px now the caption is gone. */
  .p-turbo svg { width: 24px; height: 24px; }
  /* R119: the three steps and their spacing are unchanged - turbo_intensity_gate
     asserts a real luminance step between adjacent tiers at seven presets - only
     the hue moves from amber to the shell accent. */
  /* R153: the same three luminance steps as the desktop knob, in white rather than the accent:
     an outlined bolt, then a lit circle and a solid bolt, then a white disc with a dark bolt. */
  .p-turbo[data-speed="normal"] svg path { stroke: var(--op-label); fill: none; }
  .p-turbo[data-speed="turbo"] {
    background: color-mix(in srgb, #ffffff 40%, #12141a);
    border-color: var(--op-hairline-hi);
  }
  .p-turbo[data-speed="turbo"] svg path { stroke: var(--op-value); fill: var(--op-value); }
  .p-turbo[data-speed="super"] {
    background: #ffffff;
    border-color: #ffffff;
  }
  .p-turbo[data-speed="super"] svg path { stroke: #12141a; fill: #12141a; }
  .p-tier {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.02em;
    font-variant-numeric: tabular-nums;
    color: var(--op-value);
  }

  .p-hamburger { display: flex; flex-direction: column; gap: 4px; }
  .p-hamburger-bar { width: 18px; height: 2px; border-radius: 1px; background: var(--p-acc); }

  .p-max-cap { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: var(--op-value); }

  /* SPIN - the single largest, most important control: 72px real diameter
     (well over the 64px floor the brief asks for), centred between the two
     control clusters. */
  /* R153: a circle with a 2px ring, the only accent, on the strip's plate. It was a conic
     gradient disc with an accent bloom. Same 72px box. */
  .p-spin {
    position: relative;
    box-sizing: border-box;
    width: 72px;
    height: 72px;
    min-width: 72px;
    min-height: 72px;
    padding: 0;
    border: 2px solid var(--hud-accent);
    border-radius: 50%;
    flex: 0 0 auto;
    background: var(--op-plate);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    cursor: pointer;
  }
  .p-spin .glyph { width: 22px; height: 22px; }
  .p-spin .glyph path { fill: var(--op-value); }
  .p-spin .glyph.arrows { display: none; }
  .p-spin .glyph.arrows path { fill: none; stroke: var(--op-value); stroke-width: 2.2; stroke-linecap: round; }
  .p-spin.spinning .glyph.play { display: none; }
  .p-spin.spinning .glyph.arrows { display: block; }
  .p-spin:disabled { opacity: 0.5; cursor: not-allowed; }
  .p-spin-txt {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: var(--op-label);
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
    --c-acc: var(--op-glyph);
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
    /* R153: Exo 2 for labels and values (real tabular figures), and the strip itself is the one
       operator plate: #12141a at 90%, 8px corners, no gradient. */
    font-family: var(--fs-font-numeric);
    border-radius: 8px;
    background: var(--op-plate);
  }
  /* R153: the compact glyph colour is white in both states; only the spin ring flips. */

  /* R153: hairline circles, as portrait. */
  .c-round-btn {
    position: relative;
    box-sizing: border-box;
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 1px solid var(--op-hairline);
    border-radius: 50%;
    background: var(--op-plate);
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
  .c-round-btn:active:not(:disabled) { border-color: var(--op-hairline-hi); }
  .c-round-btn.active { border-color: var(--op-value); }

  /* FS VISUAL FIXPACK JOB 2: the compact-landscape speed control, same three
     steps as portrait at this strip's smaller 44px box. */
  .c-turbo svg { width: 22px; height: 22px; }
  .c-turbo[data-speed="normal"] svg path { stroke: var(--op-label); fill: none; }
  .c-turbo[data-speed="turbo"] {
    background: color-mix(in srgb, #ffffff 40%, #12141a);
    border-color: var(--op-hairline-hi);
  }
  .c-turbo[data-speed="turbo"] svg path { stroke: var(--op-value); fill: var(--op-value); }
  .c-turbo[data-speed="super"] {
    background: #ffffff;
    border-color: #ffffff;
  }
  .c-turbo[data-speed="super"] svg path { stroke: #12141a; fill: #12141a; }

  .c-tier { font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--op-value); }
  .c-max-cap { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: var(--op-value); }

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
    /* R153: no card inside the strip; the transparent border keeps the measured box. */
    background: none;
    border: 1px solid transparent;
    position: relative;
  }
  /* R153: as portrait, the 10px label is the brief's figure and sits under the 11px floor by
     that sanction; the exemption is named in portrait_layout_conformance.mjs. */
  .c-stat-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--op-label);
    white-space: nowrap;
  }
  .c-stat-value {
    font-size: calc(14px * var(--autofit-scale, 1));
    font-weight: 700;
    letter-spacing: 0.02em;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    color: var(--op-value);
    max-width: 100%;
    overflow: hidden;
    /* R059: ellipsis removed, same reasoning as .p-stat-value above. */
  }
  .c-stat-value.cyan,
  .c-stat-value.magenta,
  .c-stat-value.gold { color: var(--op-value); }

  /* Balance gets extra flex-basis (2026-07-14b, caught via stress-value
     screenshot: "$1,000,000.00" was truncating with ellipsis at the default
     1:1:1.6 balance:win:bet ratio). Win stays small deliberately - it's
     rarely a long figure in practice - freeing width for balance and bet,
     the two fields most likely to carry long currency strings. */
  /* NEON LIFT (2026-07-15): subtle persistent per-field neon edge, on top
     of each cell's pre-existing flex-basis tuning. */
  /* R153: a live win no longer lights its field (the .lit rules are gone in every profile, and so
     are the markup's class:lit directives). The value counting up is the signal. The R119 record
     below says the .lit state is kept; it describes the bar before R153. */
  /* R119 SUPERSEDES THE "NEON LIFT" OF 2026-07-15. That pass gave each field a
     persistent per-field neon edge - balance cyan, win magenta, bet gold - so
     three adjacent plates carried three different colours at rest. The operator
     shell spends the accent only on a live win, so the resting edge is now the
     same neutral hairline on all three and the fields are told apart by their
     LABELS, which is what labels are for. The .lit win state is kept and is now
     the only coloured edge on the bar. */
  /* The flex-basis tuning below is GEOMETRY and is untouched: it was measured
     against a $1,000,000.00 stress value. Only colour moves. */
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
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .c-bet-step svg { width: 16px; height: 10px; overflow: visible; }
  .c-bet-step svg path { fill: none; stroke: var(--op-glyph); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  .c-bet-step:active:not(:disabled) { background: rgba(255, 255, 255, 0.07); }
  .c-bet-step:disabled { opacity: 0.3; cursor: not-allowed; }

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
  .c-mode-badge.overboost,
  .c-mode-badge.cruise {
    color: var(--op-value);
    background: var(--op-plate);
    border: 1px solid var(--op-hairline-hi);
  }

  /* R153: the ringed circle, as portrait and desktop. */
  .c-spin {
    position: relative;
    box-sizing: border-box;
    flex: 0 0 auto;
    width: 60px;
    height: 60px;
    padding: 0;
    border: 2px solid var(--hud-accent);
    border-radius: 50%;
    background: var(--op-plate);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .c-spin .glyph { width: 22px; height: 22px; }
  .c-spin .glyph path { fill: var(--op-value); }
  .c-spin .glyph.arrows { display: none; }
  .c-spin .glyph.arrows path { fill: none; stroke: var(--op-value); stroke-width: 2.2; stroke-linecap: round; }
  .c-spin.spinning .glyph.play { display: none; }
  .c-spin.spinning .glyph.arrows { display: block; }
  .c-spin:disabled { opacity: 0.5; cursor: not-allowed; }

  /* R151: PHONE SPIN FEEDBACK, THE DESKTOP'S OWN. The desktop SPIN (.fs-spin) presses to 0.96 and
     turns its arrows every 700ms while spinning; the portrait (.p-spin), compact-landscape (.c-spin)
     and mini-player (.m-spin) SPIN buttons read scale 1.000 at rest, on hover and when pressed, and
     showed a static glyph while spinning (measured at 390x844, 844x390 and 400x225). Same press,
     same rotation keyframes (fs-spin-rot, above). A transform does not reflow, so no HUD geometry
     changes. The mini player's spinning glyph is a stop square, which is not meant to turn, so it
     takes the press only. The border-colour fade the global button rule gave these (only .m-spin
     has a border) is kept in the list. Under reduced motion they match the desktop exactly: the 4%
     press stays (no travel), the arrow rotation stops. */
  /* NOTE R153: the R151 record above says only .m-spin has a border. Since R153 all three carry the
     2px accent ring, so the border-colour fade in the list below applies to each of them. */
  .p-spin, .c-spin, .m-spin { transition: transform .12s ease, border-color .25s; }
  .p-spin:active:not(:disabled), .c-spin:active:not(:disabled), .m-spin:active:not(:disabled) { transform: scale(.96); }
  .p-spin.spinning .glyph.arrows, .c-spin.spinning .glyph.arrows { animation: fs-spin-rot .7s linear infinite; }
  @media (prefers-reduced-motion: reduce) {
    .p-spin.spinning .glyph.arrows, .c-spin.spinning .glyph.arrows { animation: none; }
  }
</style>
