<script lang="ts">
  // FeatureMenu.svelte - the SINGLE entry point for every Future Spinner bet
  // mode. One FEATURES knob (right of the frame, where the old FeatureButton
  // sat) opens a brushed-steel modal built on the shared .fs-plate / .fs-knob /
  // .fs-rail chrome vocabulary (matches HudOverlay + PaytableModal):
  //   - a shared bet selector row on top (reads betAmount / currencyCode);
  //   - a scrollable card list, one card per mode from the source-of-truth
  //     config (config/fsModes.ts), each an .fs-plate in the mode's signature
  //     tone. Card behaviour keys off kind:
  //       standing : ACTIVE if it is the current standing mode, else SELECT.
  //       enhancer : an ON/OFF role="switch" toggle.
  //       buy      : cost + ACTIVATE button that dispatches 'buy' with the mode.
  //   - modes with available:false render DIMMED with a "COMING SOON" tag and
  //     are non-interactive (never select a standing mode nor fire a buy).
  //
  // Because everything renders from FS_MODES, flipping a mode live later is a
  // one-line edit in the config - this component needs no change.
  import { createEventDispatcher } from 'svelte'
  import { tr } from '../i18n/tr'
  // R041. The cost lines used to read `{$isSocial ? 'per spin' : 'bet'}`, which
  // LOOKED like the sweepstakes vocabulary layer and was not: both branches were
  // English, so the words were untranslated AND outside the compliance filter.
  // `sv()` is that layer, and `$tr` supplies the translated word it rewrites.
  import { sv } from '../i18n/vocabulary'
  import { FS_MODES, fsRtpLabel, fsCostLabel, VOLATILITY_KEY } from '../config/fsModes'
  import type { FsMode } from '../config/fsModes'
  import { standingMode, type BetMode } from '../stores/betMode'
  import { isSocial } from '../stores/socialMode'
  import { betAmount, currencyCode, isSpinning, balance, showPaytable, locale } from '../stores/gameStore'
  // R5/TR-013: the bet arrows here previously used gameStore's actions, which
  // operate on the hardcoded BET_LEVELS rather than the authenticated ladder.
  // Off-ladder, "+" dropped the bet to 0.10 and "-" did nothing. Both surfaces
  // now share one model.
  import {
    increaseBetLevel, decreaseBetLevel, canIncreaseBetLevel, canDecreaseBetLevel,
  } from '../stores/betLadder'
  import { buyFeatureDisabled } from '../stores/jurisdiction'
  import { canAffordMode, shortfallFor, spinCostMicros } from '../stores/buyAffordability'
  import { setModalOpen } from '../stores/modalGuard'
  import { formatBalance, formatWin, CURRENCY_SCALE } from '../utils/currency'
  import { playClick } from '../services/soundService'

  const dispatch = createEventDispatcher<{ buy: BetMode }>()

  // Thin wrappers: the ladder model is shared, the click sound is presentation.
  function decreaseBet(): void { playClick(); decreaseBetLevel() }
  function increaseBet(): void { playClick(); increaseBetLevel() }

  // Portrait layout mode (2026-07-14 portrait pass): renders a compact,
  // native-DOM-scale trigger (reachable above the HUD controls row) instead
  // of the LAYOUT_SPEC absolute-positioned .fm-entry knob below. The modal
  // itself (.fm) is unchanged either way - it correctly covers the true
  // viewport once the caller (App.svelte) stops giving .game-wrapper a scale
  // transform in portrait mode.
  export let portrait = false
  // Idle attract mode (ANIMATION UPLIFT PASS 2026-07-16, item 5): a real
  // Svelte prop (App.svelte owns the 20s timer), so `class:idle-shimmer`
  // below is traced natively - no raw classList toggling here.
  export let idleAttract = false
  // Landscape compact HUD pass (2026-07-14b): renders an icon-only 48px
  // round trigger as a flex item alongside HudOverlay's compact strip in
  // App.svelte's .native-hud-slot.compact-landscape row. Same modal, same
  // reasoning as portrait above - only the trigger's own markup/CSS differs.
  export let compactLandscape = false
  /** R2R-R JOB C / TR-043: the 400x225 mini-player profile. */
  export let miniPlayer = false

  let open = false

  $: cur = $currencyCode || 'USD'
  // REACTIVE, not `const`. Corrected 2026-08-10.
  //
  // As a plain const this closure was created ONCE and never recomputed, so the
  // buy cards quoted a price from whatever the bet happened to be when the menu
  // first rendered. Measured with real clicks on the in-menu stepper, no store
  // injection: stepping the bet 1.00 -> 0.50 -> 0.20 -> 0.10 left "Buy Overdrive
  // 100x · $100.00" unchanged at every step. At 0.10 the real price is $10.00,
  // so the card overstated the cost of a purchase TENFOLD, on the control the
  // player clicks to spend.
  //
  // A template call site cannot rescue it: Svelte 5.45 compiles `{price(1)}`
  // against a const to `() => ($.untrack(() => price(1)))`, deliberately
  // suppressing dependency tracking. The `$:` form compiles with $betAmount,
  // cur and $locale hoisted into the dependency list, which is why this is the
  // fix rather than a call-site change.
  $: price = (cost: number) =>
    formatBalance(Math.round($betAmount * cost * CURRENCY_SCALE), cur, $locale)
  // OWNER AUDIT REMEDIATION A3: a persistent, always-visible resolved cost
  // for whatever standing mode is currently active (base/cruise/OVERBOOST -
  // OVERBOOST is itself a standingMode value, not a modifier layered on top,
  // so MODE_COST[$standingMode] already carries its 1.25x correctly).
  // $betAmount must appear directly in this statement, not just inside
  // price()'s closure - Svelte's reactive-statement dependency tracking is
  // a static scan of the statement's OWN text, so a store only referenced
  // inside a called function is invisible to it and never re-triggers this
  // line (confirmed the hard way: this exact bug shipped once already,
  // caught by the conformance suite's live-reactivity check, not by eye).
  $: currentSpinCost = formatWin(spinCostMicros($betAmount, $standingMode), cur, $locale)

  // Buy cards are hidden entirely where the jurisdiction disables feature buys,
  // exactly as the current FeatureButton / BuyBonus do.
  $: cards = FS_MODES.filter((m) => m.kind !== 'buy' || !$buyFeatureDisabled)
  // FEATURES MENU RESTRUCTURE (2026-07-15, item 4): two labelled sections -
  // SPIN MODES (standing + enhancer kinds: Normal, Cruise, OVERBOOST) and
  // BUY FEATURES (buy kind: Buy Overdrive, NITRO OVERDRIVE) - both derived
  // from the same `cards` array/order, so FS_MODES stays the single source
  // of truth and adding a mode still needs no template change, just the
  // right `kind`.
  $: spinModeCards = cards.filter((m) => m.kind !== 'buy')
  $: buyFeatureCards = cards.filter((m) => m.kind === 'buy')
  // FEATURES MENU ITERATION 3 (OWNER AUDIT ROUND 2, item 6): Normal and
  // Cruise become one paired switch instead of two separate stacked cards -
  // condenses the list so the buy cards sit higher with less scrolling.
  // OVERBOOST (the only enhancer) keeps its own separate card, rendered from
  // the same generic loop as before.
  $: pairedStandingCards = spinModeCards.filter((m) => m.id === 'normal' || m.id === 'cruise')
  $: otherSpinModeCards = spinModeCards.filter((m) => m.id !== 'normal' && m.id !== 'cruise')

  // A standing card is active when its serverMode is the selected standing mode.
  const isActiveStanding = (m: FsMode, sel: BetMode) => sel === m.serverMode
  // An enhancer is on when its serverMode is the selected standing mode.
  const isEnhancerOn = (m: FsMode, sel: BetMode) => sel === m.serverMode

  // FEATURES entry chip reflects the active standing/enhancer mode (cost
  // visibility, Fable 2026-07-07 item 0): OVERBOOST needs a persistent,
  // clearly-labelled state since it changes the real per-spin debit; Cruise
  // only needs a subtle label since its cost is unchanged at 1.0x.
  $: entryActiveLabel = $standingMode === 'antelite' || $standingMode === 'cruise'
    ? $tr(FS_MODES.find((m) => m.serverMode === $standingMode)!.labelKey)
    : ''

  function openMenu(): void { if (!$isSpinning) { playClick(); open = true } }
  function close(): void { playClick(); open = false }

  function selectStanding(m: FsMode): void {
    if (!m.available || $isSpinning) return
    playClick()
    standingMode.set(m.serverMode)
  }

  function toggleEnhancer(m: FsMode): void {
    if (!m.available || $isSpinning) return
    playClick()
    standingMode.update((sel) => (sel === m.serverMode ? 'base' : m.serverMode))
  }

  // The FEATURES panel blocks the reels underneath it.
  $: setModalOpen('feature-menu', open)

  function activateBuy(m: FsMode): void {
    // Only live buy modes ever dispatch. Placeholder buys are non-interactive.
    if (!m.available || $isSpinning) return
    // Same shared affordability truth the confirm dialog uses, so the two
    // surfaces cannot disagree about whether a tier is affordable.
    if (!$canAffordMode(m.serverMode)) return
    playClick()
    open = false
    dispatch('buy', m.serverMode)
  }

  function openBetModesInfo(): void {
    playClick()
    open = false
    showPaytable.set(true)
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && open) close()
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if portrait}
  <!-- Portrait native-scale trigger - reachable above the HUD controls row,
       native CSS px throughout (never stage-scaled). -->
  <button
    class="p-fm-entry"
    class:mode-enhancer={$standingMode === 'antelite'}
    class:idle-shimmer={idleAttract}
    on:click={openMenu}
    disabled={$isSpinning}
    aria-label={$tr('a11yFeatureMenu')}
    aria-haspopup="dialog"
    aria-expanded={open}
    data-testid="feature-menu-button"
  >
    <!-- OWNER AUDIT ROUND 4, item 5: the retired car-grille mark, drawn inline
         at hamburger scale. Inline SVG rather than a symbol PNG on purpose:
         it inherits currentColor (so the purple accent needs no second
         declaration), stays crisp at every stage scale, and cannot be
         pruned out of the bundle by the build-diet plugin the way an
         assets/symbols/* reference could. Identical markup in both the
         portrait and desktop entries, so the two cannot drift. -->
    <svg class="fm-entry-grille" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6.5" width="18" height="11" rx="2.6"/>
      <path d="M8.6 9v6M12 9v6M15.4 9v6"/>
    </svg>
    <span class="p-fm-entry-label">{$tr('hudFeatures')}</span>
    {#if entryActiveLabel}
      <span
        class="p-fm-entry-active"
        class:enhancer={$standingMode === 'antelite'}
        data-testid="feature-menu-active-mode"
      >{entryActiveLabel}</span>
    {/if}
  </button>
{:else if miniPlayer}
  <!-- MINI-PLAYER trigger (R2R-R JOB C / TR-043). Without this branch the
       component fell through to the DESKTOP trigger inside a 44px row, and the
       result was that a player in the popout could not reach the bet modes or
       the buy at all. That is a functional regression, and it was found only
       because svelte-check flagged the `miniPlayer` prop as an unused export:
       the prop was threaded through and never consumed. A warning about a
       missing export turned out to be a missing CONTROL.

       Icon-only and 36px visual with the same ::after extension the rest of the
       mini row uses to reach a 44px target. No mode badge: HudOverlay's own bet
       cell carries OVERBOOST/CRUISE in the same visible row. -->
  <button
    class="m-fm-entry"
    class:mode-enhancer={$standingMode === 'antelite'}
    class:idle-shimmer={idleAttract}
    on:click={openMenu}
    disabled={$isSpinning}
    aria-label={$tr('a11yFeatureMenu')}
    aria-haspopup="dialog"
    aria-expanded={open}
    data-testid="feature-menu-button"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
      <circle cx="9" cy="6" r="2.2" fill="currentColor"/>
      <circle cx="15" cy="12" r="2.2" fill="currentColor"/>
      <circle cx="7" cy="18" r="2.2" fill="currentColor"/>
    </svg>
  </button>

{:else if compactLandscape}
  <!-- Compact-landscape native-scale trigger (2026-07-14b) - a flex item
       alongside HudOverlay's .c-hud strip, icon-only (no room for the
       "FEATURES" text label at this width budget), still >=44px effective.
       No active-mode badge here (unlike the portrait/landscape triggers) -
       HudOverlay's own .c-mode-badge on the bet stat cell already shows
       OVERBOOST/CRUISE in the same visible row, so a second indicator here
       would be redundant and, at this button's size, would either sit below
       the 11px legibility floor or overflow the 76px strip height. -->
  <button
    class="c-fm-entry"
    class:mode-enhancer={$standingMode === 'antelite'}
    class:idle-shimmer={idleAttract}
    on:click={openMenu}
    disabled={$isSpinning}
    aria-label={$tr('a11yFeatureMenu')}
    aria-haspopup="dialog"
    aria-expanded={open}
    data-testid="feature-menu-button"
  >
    <!-- OWNER AUDIT ROUND 4, item 5: the retired car-grille mark, drawn inline
         at hamburger scale. Inline SVG rather than a symbol PNG on purpose:
         it inherits currentColor (so the purple accent needs no second
         declaration), stays crisp at every stage scale, and cannot be
         pruned out of the bundle by the build-diet plugin the way an
         assets/symbols/* reference could. Identical markup in both the
         portrait and desktop entries, so the two cannot drift. -->
    <svg class="fm-entry-grille" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6.5" width="18" height="11" rx="2.6"/>
      <path d="M8.6 9v6M12 9v6M15.4 9v6"/>
    </svg>
  </button>
{:else}
<!-- ── Single FEATURES entry (right of the frame, old FeatureButton spot).
     OWNER AUDIT ROUND 3, item 6: standardised on the mobile pill treatment
     (small hamburger glyph + FEATURES text, purple/pink accent) - the large
     circular knob variant is retired. Outer div + .fm-entry-label/
     .fm-entry-active class names kept as-is (several other conformance
     scripts query `[data-testid="feature-menu-entry"] .fm-entry-label`
     directly) even though they now live inside the single pill button
     rather than as siblings of a separate knob. ───────────────────────── -->
<div class="fm-entry" data-testid="feature-menu-entry">
  <button
    class="fm-entry-pill"
    class:mode-enhancer={$standingMode === 'antelite'}
    class:idle-shimmer={idleAttract}
    on:click={openMenu}
    disabled={$isSpinning}
    aria-label={$tr('a11yFeatureMenu')}
    aria-haspopup="dialog"
    aria-expanded={open}
    data-testid="feature-menu-button"
  >
    <!-- OWNER AUDIT ROUND 4, item 5: the retired car-grille mark, drawn inline
         at hamburger scale. Inline SVG rather than a symbol PNG on purpose:
         it inherits currentColor (so the purple accent needs no second
         declaration), stays crisp at every stage scale, and cannot be
         pruned out of the bundle by the build-diet plugin the way an
         assets/symbols/* reference could. Identical markup in both the
         portrait and desktop entries, so the two cannot drift. -->
    <svg class="fm-entry-grille" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6.5" width="18" height="11" rx="2.6"/>
      <path d="M8.6 9v6M12 9v6M15.4 9v6"/>
    </svg>
    <span class="fm-entry-label">{$tr('hudFeatures')}</span>
    {#if entryActiveLabel}
      <span
        class="fm-entry-active"
        class:enhancer={$standingMode === 'antelite'}
        data-testid="feature-menu-active-mode"
      >{entryActiveLabel}</span>
    {/if}
  </button>
</div>
{/if}

<!-- ── Modal ───────────────────────────────────────────────────────────────── -->
{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    class="fm fs-scrim"
    role="dialog"
    aria-modal="true"
    aria-label={$tr('a11yFeatures')}
    tabindex="-1"
    on:click|self={close}
  >
    <!-- FS_SMALLSCREEN_RECOMPOSE (2026-07-26): the panel gets a MINI profile at
         Popout S. The trigger above has existed since TR-043, but opening it in a
         400x225 popout produced a panel whose head (67px) and bet bar (91px) ate
         158 of its 198px, leaving the mode list a 28px window onto 663px of
         content with all four cards outside their clipping ancestor. The control
         was reachable and the thing it controls was not, so the brief's "make
         FEATURES present usably from the strip" is about this class, not the
         button. -->
    <div class="fm-panel fs-plate" class:fm-panel--mini={miniPlayer}>
      <span class="fs-rail"></span>
      <div class="fs-face">

        <!-- Header -->
        <div class="fm-head">
          <h2 class="fm-title">{$tr('hudFeatures')}</h2>
          <button class="fm-close fs-knob" on:click={close} aria-label={$tr('a11yClose')} data-testid="feature-menu-close">
            <!-- Was `✕`, U+2715, absent from the Orbitron subset. Same glyph and
                 same fix as PaytableModal's close. QUALITY_CHARTER.md Q-05. -->
            <span class="fs-face"><svg class="fm-close-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></span>
          </button>
        </div>

        <!-- Shared bet selector row (ITERATION 3, OWNER AUDIT ROUND 2, item 6:
             merged with the former standalone "This spin costs" line below it
             - the cost text now sits in this SAME row, before the bet amount,
             so the two header lines condense into one). -->
        <div class="fm-betbar fs-plate">
          <div class="fs-face">
            <span class="fm-spin-cost" data-testid="current-spin-cost">{$tr('hudSpinCost')} <span class="fs-num">{currentSpinCost}</span></span>
            <!-- Was `{$isSocial ? 'PLAY' : 'BET'}`, a hand-rolled copy of a layer
                 that already exists: SOCIAL_OVERRIDES maps `bet` to PLAY and `tr`
                 is social-aware, so the ternary reproduced the social swap and
                 dropped the locale swap. Both branches were English in all
                 sixteen locales. TR-091. -->
            <span class="fm-betlabel">{$tr('bet')}</span>
            <button class="fm-step" on:click={decreaseBet} disabled={$isSpinning || !$canDecreaseBetLevel} aria-label={$tr('a11yDecreaseBet')}>-</button>
            <span class="fm-betval fs-num" data-testid="feature-menu-bet">{price(1)}</span>
            <button class="fm-step" on:click={increaseBet} disabled={$isSpinning || !$canIncreaseBetLevel} aria-label={$tr('a11yIncreaseBet')}>+</button>
          </div>
        </div>

        <!-- Two labelled sections (2026-07-15 neon polish pass, item 4):
             SPIN MODES (standing + enhancer kinds) then a visual separator
             then BUY FEATURES (buy kind) - both rendered from the same
             config-driven card markup via a shared snippet-like block below,
             so adding a mode is still a one-line FS_MODES edit. -->
        <div class="fm-cards" data-testid="feature-menu-cards">
          <div class="fm-section-label">{$tr('hudSpinModes')}</div>

          <!-- ITERATION 3, item 6: Normal + Cruise as one paired switch, not
               two stacked cards - same per-mode markup/testids as the plain
               loop below (standing-select-{id} only renders for the mode
               that ISN'T active, exactly as before), just laid out side by
               side in a single card so the list condenses. -->
          {#if pairedStandingCards.length === 2}
            <div class="fm-card fs-plate tone-standing fm-paired" data-testid="feature-card-normal-cruise">
              <div class="fs-face fm-paired-face">
                {#each pairedStandingCards as m (m.id)}
                  {@const active = isActiveStanding(m, $standingMode)}
                  <div class="fm-paired-opt" class:active>
                    <div class="fm-name-row">
                      <span class="fm-radio" class:checked={active} aria-hidden="true"></span>
                      <span class="fm-name">{$tr(m.labelKey)}</span>
                    </div>
                    <p class="fm-blurb">{$tr(m.blurbKey)}</p>
                    <div class="fm-action">
                      <span class="fm-cost fs-num">{fsCostLabel(m.cost, $locale)} {sv($tr('betUnit'), $isSocial)}</span>
                      {#if active}
                        <span class="fm-active-tag" data-testid="standing-active-{m.id}">{$tr('hudActive')}</span>
                      {:else}
                        <button
                          class="fm-select"
                          on:click={() => selectStanding(m)}
                          disabled={$isSpinning}
                          data-testid="standing-select-{m.id}"
                        >{$tr('hudSelect')}</button>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          {#each otherSpinModeCards as m (m.id)}
            {@const active = isActiveStanding(m, $standingMode)}
            {@const enhOn = isEnhancerOn(m, $standingMode)}
            <div
              class="fm-card fs-plate tone-{m.kind}"
              class:active={m.available && m.kind === 'standing' && active}
              class:dimmed={!m.available}
              data-testid="feature-card-{m.id}"
            >
              <div class="fs-face">
                <div class="fm-card-main">
                  <div class="fm-name-row">
                    {#if m.available && m.kind === 'standing'}
                      <!-- OWNER AUDIT REMEDIATION B3: an explicit radio dot,
                           not just the border-glow ring, so the standing-mode
                           choice reads as an obvious single-select group at a
                           glance, not just "the card with slightly more glow." -->
                      <span class="fm-radio" class:checked={active} aria-hidden="true"></span>
                    {/if}
                    <span class="fm-name">{$tr(m.labelKey)}</span>
                    {#if !m.available}
                      <span class="fm-soon">{$tr('hudComingSoon')}</span>
                    {:else}
                      <span class="fm-vol">{$tr(VOLATILITY_KEY[m.volatility])}</span>
                    {/if}
                  </div>
                  <p class="fm-blurb">{$tr(m.blurbKey)}</p>
                  {#if m.kind === 'enhancer'}
                    <!-- OWNER AUDIT REMEDIATION B3: OVERBOOST's own effect
                         and live resolved cost inline, not just the bare
                         "1.25x bet" the .fm-cost line already showed - reads
                         as "what does turning this on actually cost me". -->
                    <p class="fm-enh-effect">{fsCostLabel(m.cost, $locale)} {sv($tr('perSpinWhileOn'), $isSocial)} · <span class="fs-num">{price(m.cost)}</span></p>
                  {/if}
                </div>

                <div class="fm-action">
                  <span class="fm-cost fs-num">{fsCostLabel(m.cost, $locale)} {sv($tr('betUnit'), $isSocial)}</span>

                  {#if !m.available}
                    <span class="fm-tag" aria-hidden="true">{$tr('hudSoon')}</span>
                  {:else if m.kind === 'standing'}
                    {#if active}
                      <span class="fm-active-tag" data-testid="standing-active-{m.id}">{$tr('hudActive')}</span>
                    {:else}
                      <button
                        class="fm-select"
                        on:click={() => selectStanding(m)}
                        disabled={$isSpinning}
                        data-testid="standing-select-{m.id}"
                      >{$tr('hudSelect')}</button>
                    {/if}
                  {:else}
                    <button
                      class="fm-toggle"
                      class:on={enhOn}
                      role="switch"
                      aria-checked={enhOn}
                      on:click={() => toggleEnhancer(m)}
                      disabled={$isSpinning}
                      data-testid="enhancer-toggle-{m.id}"
                    >{enhOn ? $tr('stateOn') : $tr('stateOff')}</button>
                  {/if}
                </div>
              </div>
            </div>
          {/each}

          <div class="fm-section-separator" role="separator" aria-hidden="true"></div>
          <div class="fm-section-label">{$tr('buyFeaturesHeading')}</div>
          {#each buyFeatureCards as m (m.id)}
            <div
              class="fm-card fs-plate tone-{m.kind}"
              class:dimmed={!m.available}
              data-testid="feature-card-{m.id}"
            >
              <div class="fs-face">
                <div class="fm-card-main">
                  <div class="fm-name-row">
                    <span class="fm-name">{$tr(m.labelKey)}</span>
                    {#if !m.available}
                      <span class="fm-soon">{$tr('hudComingSoon')}</span>
                    {:else}
                      <span class="fm-vol">{$tr(VOLATILITY_KEY[m.volatility])}</span>
                    {/if}
                  </div>
                  <p class="fm-blurb">{$tr(m.blurbKey)}</p>
                </div>

                <div class="fm-action">
                  <span class="fm-cost fs-num">{fsCostLabel(m.cost, $locale)} · {price(m.cost)}</span>

                  {#if !m.available}
                    <span class="fm-tag" aria-hidden="true">{$tr('hudSoon')}</span>
                  {:else}
                    <!-- Owner observation 2026-07-26: NITRO read as "not always
                         selectable" because an unaffordable tier was simply a dead
                         control with no reason given. The shortfall is now stated,
                         using the existing translated insufficient-balance string
                         so no untranslated copy is introduced. -->
                    <button
                      class="fm-activate"
                      on:click={() => activateBuy(m)}
                      disabled={$isSpinning || !$canAffordMode(m.serverMode)}
                      title={$shortfallFor(m.serverMode) > 0
                        ? `${$tr('insufficientBalance')} (${formatBalance(Math.round($shortfallFor(m.serverMode) * CURRENCY_SCALE), $currencyCode || 'USD', $locale)})`
                        : undefined}
                      data-testid="activate-{m.id}"
                    >{$tr('hudActivate')}</button>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>

        <!-- Footer -->
        <div class="fm-foot">
          <span class="fm-rtp">{$tr('allModesLabel')} · RTP {fsRtpLabel($locale)}</span>
          <button class="fm-info-btn" on:click={openBetModesInfo} data-testid="open-bet-modes-info">{$tr('betModesHeading')}</button>
        </div>

      </div><!-- /fs-face -->
    </div><!-- /fm-panel -->
  </div>
{/if}

<style>
  /* MINI-PLAYER trigger (R2R-R JOB C / TR-043). Matches .m-round-btn in
     HudOverlay: 36px visual, 44px effective target via the ::after extension,
     so the whole mini row is consistent about how it reaches the floor. */
  .m-fm-entry {
    position: relative;
    flex: 0 0 auto;
    width: 36px; height: 36px; border-radius: 8px; padding: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255, 0, 255, 0.10); border: 1px solid rgba(255, 0, 255, 0.34);
    color: #f9f; cursor: pointer;
  }
  .m-fm-entry::after { content: ''; position: absolute; inset: -4px; }
  .m-fm-entry svg { width: 20px; height: 20px; }
  .m-fm-entry:disabled { opacity: 0.4; cursor: default; }
  .m-fm-entry:disabled::after { content: none; }
  .m-fm-entry.mode-enhancer { border-color: rgba(255, 213, 74, 0.55); color: #ffd54a; }

  /* ==========================================================================
     FUTURE SPINNER - FEATURES MENU
     Built on the shared chrome vocabulary (.fs-plate / .fs-knob / .fs-rail /
     .fs-face) so it reads as part of the same instrument set as the HUD and
     the paytable. Svelte scopes styles per component, so the chrome primitives
     are re-declared here (identical to HudOverlay / PaytableModal). One
     signature colour per card tone; base + gold/cyan/pink signature tokens.
     ========================================================================== */

  /* token scope */
  .fm-entry,
  .p-fm-entry,
  .c-fm-entry,
  .fm {
    --sig-cyan: var(--theme-primary, #00ffff);
    --sig-pink: #ff2ec4;
    --sig-gold: #ffd700;
    --sig-orange: #ff9a2e;
    --sig-green: #4eff91;
    --acc: var(--sig-cyan);
  }

  /* ---- shared chrome primitives (same as HudOverlay / PaytableModal) ---- */
  .fs-plate {
    position: relative;
    --sig: var(--sig-cyan);
    padding: 2px;
    clip-path: polygon(0 0, calc(100% - 13px) 0, 100% 13px, 100% 100%, 13px 100%, 0 calc(100% - 13px));
    background: linear-gradient(150deg, #eef5fa, #b3c6d2 15%, #63737f 37%, #2b363f 52%, #8499a8 72%, #dceaf2);
    box-shadow:
      0 3px 10px rgba(0, 0, 0, 0.6),
      0 0 9px color-mix(in srgb, var(--sig) 20%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.35);
  }
  .fs-plate > .fs-face {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
    background:
      linear-gradient(160deg, color-mix(in srgb, var(--sig) 12%, transparent), transparent 44%),
      linear-gradient(180deg, #111a2b, #070b16);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), inset 0 -8px 18px rgba(0, 0, 0, 0.6);
  }
  .fs-rail {
    position: absolute;
    left: 2px;
    top: 16px;
    bottom: 16px;
    width: 4px;
    border-radius: 2px;
    z-index: 2;
    background: var(--sig-gold);
    box-shadow: 0 0 10px var(--sig-gold);
  }
  .fs-knob {
    border-radius: 50%;
    padding: 3px;
    position: relative;
    background: conic-gradient(from 216deg, #e7f1f7, #93a7b5, #39454f, #728593, #eef5fa, #4f5f6b, #a9bcc8, #e7f1f7);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.55);
  }
  .fs-knob > .fs-face {
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: radial-gradient(circle at 36% 28%, #1a3640, #06131c 72%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.14), inset 0 -6px 12px rgba(0, 0, 0, 0.7);
  }
  .fs-num { font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }

  /* ---- entry knob: right of the frame (mirrors the old FeatureButton spot) - */
  .fm-entry {
    position: absolute;
    left: 966px;
    top: 238px;
    z-index: 60;
  }
  /* OWNER AUDIT ROUND 3, item 6: the mobile pill treatment, standardised
     onto desktop - same shape/colour language as .p-fm-entry (hamburger +
     FEATURES text, purple/pink accent glow), the large circular knob
     variant above is retired. */
  .fm-entry-pill {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 10px 18px;
    border: 1.5px solid color-mix(in srgb, var(--sig-pink) 55%, transparent);
    border-radius: 10px;
    background: linear-gradient(160deg, rgba(255, 46, 196, 0.1), rgba(6, 9, 20, 0.9));
    box-shadow:
      0 0 12px color-mix(in srgb, var(--sig-pink) 45%, transparent),
      inset 0 0 10px color-mix(in srgb, var(--sig-pink) 14%, transparent);
    color: color-mix(in srgb, var(--sig-pink) 25%, #fff);
    cursor: pointer;
    font-family: var(--fs-font-display);
    white-space: nowrap;
    transition: filter 0.15s ease;
  }
  .fm-entry-pill:hover:not(:disabled) { filter: brightness(1.1); }
  .fm-entry-pill:disabled { opacity: 0.5; cursor: not-allowed; }
  .fm-entry-pill svg { width: 18px; height: 18px; flex-shrink: 0; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; }
  /* ROUND 4 item 5: the grille carries more geometry than the old three-bar
     glyph, so it needs a finer stroke to stay legible at the same size. Written
     against all three entry containers rather than as a bare .fm-entry-grille
     rule: each container already sets `<container> svg { stroke-width: 2.2 }`,
     which is (0,1,1) and would otherwise out-specify a lone (0,1,0) class. */
  .fm-entry-pill svg.fm-entry-grille,
  .p-fm-entry svg.fm-entry-grille,
  .c-fm-entry svg.fm-entry-grille { stroke-width: 1.7; stroke-linejoin: round; }
  /* OVERBOOST engaged: the pill glows orange (matching the enhancer card's
     tone) instead of the default pink, so the FEATURES chip itself reflects
     the toggle state at a glance (cost-visibility item). */
  .fm-entry-pill.mode-enhancer {
    border-color: color-mix(in srgb, var(--sig-orange) 55%, transparent);
    box-shadow:
      0 0 12px color-mix(in srgb, var(--sig-orange) 45%, transparent),
      inset 0 0 10px color-mix(in srgb, var(--sig-orange) 14%, transparent);
    color: color-mix(in srgb, var(--sig-orange) 25%, #fff);
  }
  .fm-entry-label {
    font-family: var(--fs-font-numeric);
    font-size: 0.68rem; font-weight: 800; letter-spacing: 0.12em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  /* Active standing/enhancer mode label next to the FEATURES chip - subtle
     for Cruise (cost unchanged), a clearly-labelled persistent pill for
     OVERBOOST (real per-spin cost change while ON). */
  .fm-entry-active {
    font-family: var(--fs-font-numeric);
    font-size: 0.58rem; font-weight: 800; letter-spacing: 0.08em;
    white-space: nowrap;
    padding: 2px 8px; border-radius: 999px;
    color: color-mix(in srgb, var(--sig-cyan) 35%, #fff);
    background: rgba(0, 240, 255, 0.08);
    border: 1px solid color-mix(in srgb, var(--sig-cyan) 40%, transparent);
  }
  .fm-entry-active.enhancer {
    color: #1a0d02;
    background: var(--sig-orange);
    border-color: var(--sig-orange);
    box-shadow: 0 0 10px color-mix(in srgb, var(--sig-orange) 55%, transparent);
  }

  /* ---- modal shell ---- */
  /* FS VISUAL FIXPACK JOB 4: geometry moved to the shared .fs-scrim class in
     app.css. This element supplies only paint and layout. */
  .fm {
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(3px);
    font-family: var(--fs-font-display);
    animation: fm-fade 0.18s ease;
  }
  @keyframes fm-fade { from { opacity: 0; } to { opacity: 1; } }

  .fm-panel {
    width: 92%;
    max-width: 560px;
    max-height: 88%;
    max-height: 88dvh;
    --sig: var(--sig-gold);
    animation: fm-pop 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .fm-panel > .fs-face {
    max-height: 88vh;
    max-height: 88dvh;
    overflow: hidden;
  }
  @keyframes fm-pop { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }

  /* ── MINI PANEL PROFILE, Popout S (FS_SMALLSCREEN_RECOMPOSE, 2026-07-26) ────
     A purpose-built composition for a 400x225 box, not the desktop panel scaled
     down. The measured problem: at 400x225 the panel is 198px tall and the head
     and bet bar are fixed-height blocks drawn for a 560px-wide desktop dialog, so
     they consumed 158px of it and the mode list was left 28px for 663px of
     content. Every one of the four cards lay outside its clipping ancestor, and
     the BET MODES button sat 8px below the viewport.
     The budget is reallocated rather than the whole thing shrunk: the head and
     bet bar are compressed to single rows of about 30px each, which leaves the
     MODE LIST the majority of the panel for the first time. That is the right
     split because the list is what the panel is FOR; the head is a title and a
     close button, and the bet bar duplicates a stepper the mini strip already
     shows in its visible row.
     What is dropped at this size, and why it is safe: each card's prose blurb and
     OVERBOOST's secondary effect line. Both are descriptive rather than
     load-bearing, the per-mode COST stays on every card (the platform display
     convention requires the effective price to be stated, and it still is), and
     the BET MODES button that opens the full explanation stays reachable. Nothing
     here is hidden by an overflow: the list scrolls, and the gate asserts the
     cards lie inside their clipping ancestors rather than merely existing. */
  /* TOUCH TARGETS AT THIS SIZE. Four mode rows at a 44px visual height is 176px
     of button in a panel that has 216px for everything, so 44px VISUAL does not
     fit and no amount of CSS makes it. The mini strip already solved this exact
     problem the same way (.m-fm-entry is a 36px visual with `::after{inset:-4px}`
     reaching a 44px target, and mini_player_proof measures targets INCLUDING that
     extension), so this profile follows the codebase's own established pattern
     rather than inventing a second one: compact visuals, hit areas extended to
     44px. Card pitch is 43px and the extended hit areas are 44px tall, so
     consecutive rows do not overlap, which the mini proof also checks. */
  .fm-panel--mini {
    width: 96%;
    max-width: none;
    max-height: 96dvh;
  }
  .fm-panel--mini > .fs-face { max-height: 96dvh; }
  .fm-panel--mini .fm-head { padding: 2px 10px; }
  .fm-panel--mini .fm-title { font-size: 0.78rem; letter-spacing: 0.12em; }
  .fm-panel--mini .fm-close { width: 24px; height: 24px; padding: 2px; position: relative; }
  .fm-panel--mini .fm-close::after { content: ''; position: absolute; inset: -10px; }
  .fm-panel--mini .fm-close > .fs-face { font-size: 0.7rem; }
  /* One row, never wrapping: the wrap is what made this 91px tall. */
  .fm-panel--mini .fm-betbar { margin: 2px 8px 0; }
  .fm-panel--mini .fm-betbar > .fs-face {
    flex-wrap: nowrap; gap: 0.4rem; padding: 2px 8px;
  }
  .fm-panel--mini .fm-spin-cost { font-size: 0.52rem; letter-spacing: 0.04em; }
  .fm-panel--mini .fm-betlabel { font-size: 0.5rem; letter-spacing: 0.08em; }
  .fm-panel--mini .fm-betval { font-size: 0.72rem; }
  .fm-panel--mini .fm-step {
    width: 26px; height: 26px; min-width: 26px; min-height: 26px; position: relative;
  }
  .fm-panel--mini .fm-step::after { content: ''; position: absolute; inset: -9px; }
  .fm-panel--mini .fm-cards { padding: 3px 8px; margin-top: 0; gap: 5px; }
  .fm-panel--mini .fm-section-label { font-size: 0.52rem; padding: 0; line-height: 1.2; }
  .fm-panel--mini .fm-section-separator { margin: 1px 2px 0; }
  /* Cards become compact single rows: name, volatility, cost, action. */
  .fm-panel--mini .fm-card > .fs-face { padding: 5px 8px; gap: 0.4rem; }
  .fm-panel--mini .fm-blurb,
  .fm-panel--mini .fm-enh-effect { display: none; }
  .fm-panel--mini .fm-card-main { gap: 0; }
  .fm-panel--mini .fm-name { font-size: 0.64rem; }
  .fm-panel--mini .fm-vol, .fm-panel--mini .fm-soon { font-size: 0.48rem; }
  .fm-panel--mini .fm-cost { font-size: 0.52rem; }
  /* Cost BESIDE the action, not above it. This is what actually buys the room:
     the base .fm-action is a column, so every card carried cost + gap + button
     stacked (43px) where the name row needed 16, making the cards 57 to 62px tall
     and fitting one at a time. Side by side the card is the button's own height
     and two cards clear the window. */
  .fm-panel--mini .fm-action {
    flex-direction: row; align-items: center; gap: 0.35rem;
  }
  .fm-panel--mini .fm-select, .fm-panel--mini .fm-buy,
  .fm-panel--mini .fm-activate, .fm-panel--mini .fm-toggle {
    font-size: 0.55rem; padding: 3px 8px; min-height: 28px; min-width: 70px;
    position: relative;
  }
  .fm-panel--mini .fm-select::after, .fm-panel--mini .fm-buy::after,
  .fm-panel--mini .fm-activate::after, .fm-panel--mini .fm-toggle::after {
    content: ''; position: absolute; inset: -8px;
  }
  .fm-panel--mini .fm-active-tag { font-size: 0.48rem; }
  /* The paired Normal/Cruise card stays side by side (the base .fm-paired-face
     rule sets that with !important, which is why these two need it as well to
     reach the padding and gap at all). At 384px of panel each option gets about
     180px, which holds a name, a cost and a SELECT once the blurb is gone. */
  .fm-panel--mini .fm-paired-face { padding: 4px 4px !important; }
  /* Each paired option also becomes a row, for the same reason the plain cards
     did: stacked, this one card was 59px against the others' 42, and it is the
     first in the list, so its height alone decided whether a second card cleared
     the window. */
  .fm-panel--mini .fm-paired-opt {
    flex-direction: row; align-items: center; gap: 0.3rem; padding: 0 5px;
  }
  .fm-panel--mini .fm-paired-opt .fm-name-row { flex: 1 1 auto; min-width: 0; }
  .fm-panel--mini .fm-paired-opt .fm-action { margin-top: 0; flex: 0 0 auto; }
  .fm-panel--mini .fm-paired-opt .fm-select { min-width: 56px; }
  .fm-panel--mini .fm-info-btn {
    font-size: 0.55rem; padding: 3px 8px; min-height: 26px; position: relative;
  }
  .fm-panel--mini .fm-info-btn::after { content: ''; position: absolute; inset: -9px; }
  .fm-panel--mini .fm-foot { padding: 3px 8px; }

  /* header */
  .fm-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 22px;
    border-bottom: 1px solid color-mix(in srgb, var(--sig-gold) 22%, transparent);
    flex-shrink: 0;
  }
  .fm-title {
    font-size: 1.2rem; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;
    background: linear-gradient(135deg, var(--sig-gold), var(--sig-orange));
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  }
  .fm-close { width: 34px; height: 34px; padding: 3px; border: none; cursor: pointer; flex-shrink: 0; }
  .fm-close > .fs-face { color: #cfe6f2; font-size: 0.82rem; }
  .fm-close:hover > .fs-face { color: #fff; filter: brightness(1.2); }
  /* Sized in em off the font-size the glyph used, stroked in currentColor, so
     the two rules above keep working unchanged. QUALITY_CHARTER.md Q-05. */
  .fm-close-glyph { width: 1.05em; height: 1.05em; display: block; }
  .fm-close-glyph path { fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; }

  /* bet selector row - ITERATION 3 (item 6): now also carries the spin-cost
     text (formerly its own line under the SPIN MODES label), merged into
     this one row, before the bet amount, so the two header lines condense
     into one. */
  .fm-betbar { margin: 14px 20px 0; --sig: var(--sig-cyan); flex-shrink: 0; }
  .fm-betbar > .fs-face { flex-direction: row; align-items: center; gap: 0.7rem; padding: 8px 16px; flex-wrap: wrap; }
  .fm-spin-cost {
    font-size: 0.62rem; color: rgba(255, 255, 255, 0.65); letter-spacing: 0.1em;
    white-space: nowrap; text-transform: uppercase;
  }
  .fm-spin-cost .fs-num { color: #fff2c2; font-weight: 800; text-shadow: 0 0 4px var(--sig-gold); text-transform: none; letter-spacing: normal; margin-left: 0.3em; }
  .fm-betlabel { font-size: 0.58rem; letter-spacing: 0.16em; color: color-mix(in srgb, var(--sig-cyan) 45%, #fff); }
  .fm-step {
    width: 30px; height: 30px; border-radius: 8px; cursor: pointer;
    background: rgba(0, 240, 255, 0.08); border: 1px solid color-mix(in srgb, var(--sig-cyan) 45%, transparent);
    color: color-mix(in srgb, var(--sig-cyan) 25%, #fff); font-size: 1.1rem; font-weight: 900; line-height: 1;
    display: flex; align-items: center; justify-content: center;
  }
  .fm-step:disabled { opacity: 0.35; cursor: default; }
  .fm-betval {
    margin-left: auto; min-width: 84px; text-align: right;
    font-size: 0.98rem; font-weight: 900; color: #fff2c2; text-shadow: 0 0 3px var(--sig-gold);
  }

  /* card list - flex:1 1 auto + min-height:0 is load-bearing: without it a
     flex column's default auto min-height means this list grows to fit ALL
     cards and gets clipped by .fm-panel > .fs-face's overflow:hidden instead
     of shrinking to the remaining space and scrolling internally (OWNER
     AUDIT REMEDIATION A2 - this, not the max-height units, was the actual
     clipping cause; the header/bet-bar above already opt out via
     flex-shrink:0 but nothing told this list to shrink at all). */
  .fm-cards {
    flex: 1 1 auto; min-height: 0;
    overflow-y: auto; padding: 14px 20px; margin-top: 4px;
    display: flex; flex-direction: column; gap: 10px;
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--acc) 45%, transparent) transparent;
  }
  .fm-cards::-webkit-scrollbar { width: 8px; }
  .fm-cards::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--acc) 40%, transparent); border-radius: 4px; }

  /* Section labels + separator (2026-07-15, item 4): SPIN MODES / BUY
     FEATURES - the first label sits flush at the top of the scroll area
     (no extra top margin), the second is preceded by a visual rule. */
  .fm-section-label {
    font-family: var(--fs-font-numeric);
    font-size: 0.66rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase;
    color: color-mix(in srgb, var(--sig-gold) 45%, #fff);
    text-shadow: 0 0 8px color-mix(in srgb, var(--sig-gold) 40%, transparent);
    padding: 2px 2px 0;
  }
  .fm-section-separator {
    height: 1px;
    margin: 4px 2px 0;
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--sig-gold) 55%, transparent) 20%, color-mix(in srgb, var(--sig-gold) 55%, transparent) 80%, transparent);
  }

  .fm-card { --sig: var(--sig-cyan); }
  .fm-card.tone-standing { --sig: var(--sig-cyan); }
  .fm-card.tone-enhancer { --sig: var(--sig-orange); }
  .fm-card.tone-buy { --sig: var(--sig-pink); }
  .fm-card > .fs-face { flex-direction: row; align-items: center; gap: 0.85rem; padding: 12px 14px; }
  .fm-card.active > .fs-face {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.07),
      inset 0 -8px 18px rgba(0, 0, 0, 0.6),
      inset 0 0 0 1px color-mix(in srgb, var(--sig-cyan) 60%, transparent),
      0 0 14px color-mix(in srgb, var(--sig-cyan) 25%, transparent);
  }
  .fm-card.dimmed { filter: grayscale(0.55) brightness(0.72); opacity: 0.7; }

  /* Normal + Cruise paired switch (ITERATION 3, item 6) - one card, two
     options side by side, each reusing the exact same .fm-name-row/
     .fm-radio/.fm-blurb/.fm-action/.fm-select markup the plain per-mode
     cards use, so nothing about their behaviour or testids changes, only
     the layout condenses from two stacked cards into one. */
  .fm-paired-face { flex-direction: row !important; align-items: stretch !important; padding: 12px 14px !important; gap: 0 !important; }
  .fm-paired-opt {
    flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 0.4rem;
    padding: 0 12px; text-align: left;
  }
  .fm-paired-opt:first-child { border-right: 1px solid rgba(255, 255, 255, 0.12); }
  /* At 320px each paired column carries about 86px of content, and neither
     child of this row can shrink: .fm-cost is white-space:nowrap so its
     min-content is its full text, and the control beside it is one unbreakable
     token. In Finnish the row wants 115px (cost 28.6 + gap 6.4 + AKTIIVINEN
     80.0) in an 85px box, so it overflowed 30px and laid the ACTIVE tag 5.3px
     across the neighbouring Cruise cost line. In EVERY locale the same row
     pushed SELECT 10.3px past the card face, whose clip-path clipped both the
     button's paint AND its hit area. Wrapping is a no-op wherever the row
     already fits, measured byte-identical at 425, 800, 1024 and 1200 and in the
     Popout S mini profile, where .fm-action is flex:0 0 auto and sizes to
     max-content. NOTE the similar rule for .fm-panel--mini is NOT this one and
     must stay as it is. 2026-08-10. */
  .fm-paired-opt .fm-action {
    flex-direction: row; align-items: center; justify-content: space-between;
    margin-top: auto; flex-wrap: wrap; row-gap: 4px;
  }

  .fm-card-main { flex: 1; min-width: 0; text-align: left; }
  .fm-name-row { display: flex; align-items: center; gap: 0.5rem; }
  .fm-name { font-size: 0.94rem; font-weight: 800; color: #eafcff; letter-spacing: 0.03em; }
  /* OWNER AUDIT REMEDIATION B3: radio-dot standing-mode indicator. */
  .fm-radio {
    width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0;
    border: 2px solid color-mix(in srgb, var(--sig-cyan) 45%, transparent);
    box-sizing: border-box; position: relative;
  }
  .fm-radio.checked {
    border-color: var(--sig-cyan);
    box-shadow: 0 0 6px color-mix(in srgb, var(--sig-cyan) 70%, transparent);
  }
  .fm-radio.checked::after {
    content: ''; position: absolute; inset: 2px; border-radius: 50%;
    background: var(--sig-cyan); box-shadow: 0 0 4px var(--sig-cyan);
  }
  .fm-enh-effect {
    font-size: 0.66rem; color: color-mix(in srgb, var(--sig-orange) 55%, #fff);
    margin: 0.3rem 0 0; font-weight: 700;
  }
  .fm-enh-effect .fs-num { color: #ffd66a; }
  .fm-vol {
    font-size: 0.5rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
    color: color-mix(in srgb, var(--sig) 45%, #fff);
    border: 1px solid color-mix(in srgb, var(--sig) 45%, transparent); border-radius: 999px;
    padding: 0.12rem 0.5rem; white-space: nowrap;
  }
  .fm-soon {
    font-size: 0.5rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
    color: #d8e2ea; background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 999px;
    padding: 0.12rem 0.55rem; white-space: nowrap;
  }
  .fm-blurb { font-size: 0.72rem; color: rgba(200, 230, 245, 0.68); line-height: 1.4; margin: 0.24rem 0 0; }

  .fm-action { display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; flex-shrink: 0; }
  .fm-cost { font-size: 0.6rem; color: #ffd66a; white-space: nowrap; }
  .fm-select, .fm-activate, .fm-toggle {
    min-width: 86px; padding: 0.42rem 0.7rem; border-radius: 8px; cursor: pointer;
    font-family: inherit; font-size: 0.66rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
  }
  .fm-select {
    background: rgba(0, 240, 255, 0.08); border: 1px solid color-mix(in srgb, var(--sig-cyan) 50%, transparent);
    color: color-mix(in srgb, var(--sig-cyan) 25%, #fff);
  }
  .fm-select:hover:not(:disabled) { background: rgba(0, 240, 255, 0.16); }
  .fm-select:disabled { opacity: 0.45; cursor: default; }
  .fm-active-tag {
    font-size: 0.6rem; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase;
    color: color-mix(in srgb, var(--sig-cyan) 25%, #fff); text-shadow: 0 0 8px color-mix(in srgb, var(--sig-cyan) 60%, transparent);
    padding: 0.42rem 0.2rem;
  }
  .fm-toggle {
    min-width: 62px; border-radius: 999px;
    background: rgba(255, 255, 255, 0.05); border: 1px solid color-mix(in srgb, var(--sig-orange) 45%, transparent);
    color: color-mix(in srgb, var(--sig-orange) 35%, #fff);
  }
  .fm-toggle.on {
    background: var(--sig-orange); border-color: var(--sig-orange); color: #1a0d02;
    box-shadow: 0 0 12px color-mix(in srgb, var(--sig-orange) 55%, transparent);
  }
  .fm-toggle:disabled { opacity: 0.55; cursor: default; }
  .fm-activate {
    background: linear-gradient(160deg, var(--sig-pink), #a01e8f); border: none; color: #fff;
    box-shadow: 0 0 12px color-mix(in srgb, var(--sig-pink) 40%, transparent);
  }
  .fm-activate:hover:not(:disabled) { filter: brightness(1.1); }
  .fm-activate:disabled { opacity: 0.45; cursor: default; box-shadow: none; }
  .fm-tag {
    font-size: 0.55rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;
    color: rgba(216, 226, 234, 0.7); padding: 0.42rem 0.4rem;
  }

  /* footer */
  .fm-foot {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 22px; flex-shrink: 0;
    border-top: 1px solid color-mix(in srgb, var(--sig-gold) 18%, transparent);
  }
  .fm-rtp { font-size: 0.64rem; letter-spacing: 0.06em; color: color-mix(in srgb, var(--sig-gold) 50%, #fff); }
  .fm-info-btn {
    padding: 0.42rem 0.9rem; border-radius: 8px; cursor: pointer;
    font-family: inherit; font-size: 0.64rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
    background: rgba(255, 215, 0, 0.08); border: 1px solid color-mix(in srgb, var(--sig-gold) 45%, transparent);
    color: color-mix(in srgb, var(--sig-gold) 35%, #fff);
  }
  .fm-info-btn:hover { background: rgba(255, 215, 0, 0.16); }

  @media (prefers-reduced-motion: reduce) {
    .fm, .fm-panel, .fm-entry-knob { animation: none; }
  }

  /* Idle attract shimmer (ANIMATION UPLIFT PASS 2026-07-16, item 5): a
     gentle glow/brightness breathing pulse on the FEATURES entry, shared
     across all three layout variants (.p-fm-entry/.c-fm-entry/.fm-entry-knob)
     via the one .idle-shimmer class rather than three separate rules.
     OWNER AUDIT ROUND 2, item 7 fix: desktop/landscape had this class on
     the OUTER .fm-entry wrapper div (rectangular, no border-radius) rather
     than the actual circular .fm-entry-knob button - the animated
     box-shadow followed the wrapper's square bounding box, reading as a
     pulsing square shadow artefact behind the round button and its label.
     Portrait/compact-landscape were never affected (idle-shimmer already
     sat on the button itself there). Moved to .fm-entry-knob to match. */
  .idle-shimmer {
    animation: idle-shimmer-pulse 3.2s ease-in-out infinite;
  }
  @keyframes idle-shimmer-pulse {
    0%, 100% { box-shadow: 0 0 0 rgba(0, 255, 255, 0); filter: brightness(1); }
    50%      { box-shadow: 0 0 20px 3px color-mix(in srgb, var(--sig-cyan, #00ffff) 55%, transparent); filter: brightness(1.18); }
  }
  @media (prefers-reduced-motion: reduce) {
    .idle-shimmer { animation: none; }
  }

  /* Portrait native-scale trigger (2026-07-14 portrait pass) - fully
     self-contained, native CSS px throughout, no LAYOUT_SPEC coordinates. */
  .p-fm-entry {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 8px 14px;
    margin: 0 12px 8px;
    width: calc(100% - 24px);
    /* NEON LIFT (2026-07-15): persistent bright magenta/pink border glow,
       not just a flat 1px outline - the FEATURES bar is the entry point to
       every bet mode and reads as a plain rectangle without it. */
    border: 1.5px solid color-mix(in srgb, var(--sig-pink, #ff2ec4) 55%, transparent);
    border-radius: 10px;
    background: linear-gradient(160deg, rgba(255, 46, 196, 0.1), rgba(6, 9, 20, 0.9));
    box-shadow:
      0 0 12px color-mix(in srgb, var(--sig-pink, #ff2ec4) 45%, transparent),
      inset 0 0 10px color-mix(in srgb, var(--sig-pink, #ff2ec4) 14%, transparent);
    color: color-mix(in srgb, var(--sig-pink, #ff2ec4) 25%, #fff);
    cursor: pointer;
    font-family: var(--fs-font-display);
  }
  .p-fm-entry:disabled { opacity: 0.5; cursor: not-allowed; }
  .p-fm-entry svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; }
  .p-fm-entry-label {
    font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
  }
  .p-fm-entry-active {
    font-size: 11px; font-weight: 800; letter-spacing: 0.08em;
    padding: 2px 8px; border-radius: 999px;
    background: rgba(0, 240, 255, 0.1);
    border: 1px solid color-mix(in srgb, var(--sig-cyan, #00ffff) 40%, transparent);
  }
  .p-fm-entry-active.enhancer {
    color: #1a0d02;
    background: var(--sig-orange, #ff9a2e);
    border-color: var(--sig-orange, #ff9a2e);
  }
  .p-fm-entry.mode-enhancer {
    border-color: color-mix(in srgb, var(--sig-orange, #ff9a2e) 55%, transparent);
  }

  /* Compact-landscape native-scale trigger (2026-07-14b) - icon-only round
     button, sized to match HudOverlay's .c-round-btn family (44px) but a
     touch larger (48px) since it's the entry point to every bet mode. */
  .c-fm-entry {
    position: relative;
    flex: 0 0 auto;
    align-self: center;
    width: 48px;
    height: 48px;
    padding: 0;
    border: 1.5px solid color-mix(in srgb, var(--sig-pink, #ff2ec4) 50%, transparent);
    border-radius: 50%;
    background: radial-gradient(circle at 36% 28%, #2a1030, #05121b 72%);
    /* NEON LIFT (2026-07-15): persistent pink glow, matching the portrait bar. */
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      0 0 10px color-mix(in srgb, var(--sig-pink, #ff2ec4) 40%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .c-fm-entry svg { width: 20px; height: 20px; fill: none; stroke: var(--sig-pink, #ff2ec4); stroke-width: 2.2; stroke-linecap: round; }
  .c-fm-entry:disabled { opacity: 0.5; cursor: not-allowed; }
  .c-fm-entry.mode-enhancer {
    box-shadow: 0 0 12px color-mix(in srgb, var(--sig-orange, #ff9a2e) 55%, transparent);
  }
  .c-fm-entry.mode-enhancer svg { stroke: var(--sig-orange, #ff9a2e); }
</style>
