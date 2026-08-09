<script lang="ts">
  /**
   * BetSelector.svelte - the denomination picker the BET window opens.
   *
   * Industry convention, owner-specified 2026-07-28: tapping the BET readout
   * opens a panel listing every level the platform authorised, so a player can
   * jump from minimum to maximum in ONE tap instead of holding an arrow. The
   * stepper arrows stay exactly as they are; this is an addition, not a
   * replacement.
   *
   * THE LADDER IS NEVER HARDCODED. Every level comes from `activeBetLevels`,
   * which is the authenticate response's own `betLevels` with the built-in
   * ladder as the mock and dev fallback. That is the same single source the
   * arrows drive from (`betLadder.ts`), so the panel and the arrows cannot
   * disagree about what exists, which is the R5/TR-013 defect class.
   *
   * MINSTEP IS RESPECTED BY CONSTRUCTION, and it is worth being precise about
   * why, because "we honour minStep" is the kind of claim that is usually
   * asserted rather than held. This panel cannot express a value that is not
   * already on the ladder: it renders one button per level and `setBetLevel()`
   * refuses anything `activeBetLevels` does not contain. Nothing rounds,
   * interpolates or synthesises an amount, so there is no route by which a
   * selection could land off the platform's own increments.
   *
   * A defensive assertion that each level is itself a whole multiple of
   * `config.stepBet` is NOT possible today and is not faked: `stepBet` is read
   * by `rgsService.authenticate()` into its `AuthResponse` and then dropped,
   * because only `betLevels` is published to a non-locked store. Adding the
   * passthrough is a one-line change to a LOCKED file and this brief carries no
   * lock exception, so it is parked with a named sanction request in the
   * session report rather than routed around.
   *
   * WHY LEVELS AND NOT ANTE-ADJUSTED FIGURES. The brief allowed either: show
   * the effective OVERBOOST cost beside each level, or show plain levels and
   * let the BET readout carry the effective figure. Plain levels, because:
   *
   *   1. The list is the LADDER. Those numbers are the platform's own
   *      authorised bet levels and they are what `play` sends as `amount`.
   *      Printing 1.25 beside a level of 1.00 puts a figure in the list that
   *      the player cannot select and the RGS never sees.
   *   2. Two money figures per row, differing by a quiet 1.25x, is exactly the
   *      "decimal or currency formats that disagree" tell the standing mandate
   *      names, on the one surface where a player is comparing numbers.
   *   3. The effective cost already has a home. The BET readout has shown the
   *      ante-adjusted figure since the 2026-07-07 cost-visibility ruling, and
   *      it updates the instant a level is chosen, so the answer is on screen
   *      either way.
   *
   * The panel therefore states the multiplier ONCE, in a footer, rather than
   * sixteen times in a column.
   */
  import { createEventDispatcher, onDestroy } from 'svelte'
  import { betAmount, balance, currencyCode, locale } from '../stores/gameStore'
  import { activeBetLevels, setBetLevel } from '../stores/betLadder'
  import { standingMode } from '../stores/betMode'
  import { spinCostMicros } from '../stores/buyAffordability'
  import { setModalOpen } from '../stores/modalGuard'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { tr } from '../i18n/tr'

  export let open = false

  const dispatch = createEventDispatcher<{ close: void; select: number }>()

  let panelEl: HTMLDivElement | null = null

  $: setModalOpen('bet-selector', open)
  onDestroy(() => setModalOpen('bet-selector', false))

  $: levels = $activeBetLevels
  $: costMultiplier = $betAmount > 0
    ? spinCostMicros($betAmount, $standingMode) / ($betAmount * CURRENCY_SCALE)
    : 1
  $: anteActive = Math.abs(costMultiplier - 1) > 0.0001
  $: effectiveLabel = formatBalance(
    Math.round(spinCostMicros($betAmount, $standingMode)), $currencyCode || 'USD', $locale)

  const money = (v: number) => formatBalance(Math.round(v * CURRENCY_SCALE), $currencyCode || 'USD', $locale)

  function choose(level: number): void {
    setBetLevel(level)
    dispatch('select', level)
    close()
  }

  function close(): void {
    // ASSIGN, then dispatch. The parent uses `bind:open`, and a Svelte binding
    // only propagates when the child assigns to the bound prop; dispatching an
    // event alone left the panel open and the scrim swallowing every click
    // behind it. The event is kept for any caller that wants to observe the
    // close without owning the state.
    open = false
    dispatch('close')
  }

  /**
   * Roving keyboard control. The panel is a grid, so arrows move within it and
   * Escape leaves, which is what a keyboard player expects of a menu. Focus is
   * moved onto the CURRENT level when the panel opens, so the first keystroke
   * acts from where the player already is rather than from the top of the list.
   */
  function handleKey(e: KeyboardEvent): void {
    if (!open) return
    if (e.key === 'Escape') { e.preventDefault(); close(); return }
    const focusables = panelEl
      ? Array.from(panelEl.querySelectorAll<HTMLButtonElement>('.bs-level'))
      : []
    if (!focusables.length) return
    const here = focusables.indexOf(document.activeElement as HTMLButtonElement)
    if (here === -1) return
    let next = here
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(focusables.length - 1, here + 1)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(0, here - 1)
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = focusables.length - 1
    else return
    e.preventDefault()
    focusables[next]?.focus()
  }

  // Focus the current level on open. Deferred a frame so the buttons exist.
  $: if (open && panelEl) queueMicrotask(() => {
    const current = panelEl?.querySelector<HTMLButtonElement>('.bs-level.is-current')
    const first = panelEl?.querySelector<HTMLButtonElement>('.bs-level')
    ;(current ?? first)?.focus()
  })
</script>

<svelte:window on:keydown={handleKey} />

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="bs-scrim fs-scrim"
    role="presentation"
    data-testid="bet-selector-scrim"
    on:click={close}
  ></div>

  <div
    class="bs-panel"
    role="dialog"
    aria-modal="true"
    aria-label={$tr('selectBet')}
    data-testid="bet-selector"
    bind:this={panelEl}
  >
    <div class="bs-head">
      <span class="bs-title">{$tr('selectBet')}</span>
      <button class="bs-close" on:click={close} aria-label={$tr('close')} data-testid="bet-selector-close">
        <svg class="bs-close-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>

    <!-- One button per authorised level. `aria-checked` rather than a visual
         highlight alone, so the current level is announced and not merely
         coloured. -->
    <div class="bs-grid" role="radiogroup" aria-label={$tr('selectBet')}>
      {#each levels as level, i (level)}
        <button
          class="bs-level"
          class:is-current={level === $betAmount}
          class:is-unaffordable={level > $balance}
          role="radio"
          aria-checked={level === $betAmount}
          tabindex={level === $betAmount ? 0 : -1}
          data-testid="bet-level-{i}"
          data-level={level}
          on:click={() => choose(level)}
        >
          <span class="bs-level-value">{money(level)}</span>
          {#if i === 0}<span class="bs-level-tag">{$tr('betMin')}</span>{/if}
          {#if i === levels.length - 1}<span class="bs-level-tag">{$tr('betMax')}</span>{/if}
        </button>
      {/each}
    </div>

    {#if anteActive}
      <!-- The ante multiplier, stated ONCE. See the header note on why the
           effective figure does not go beside every level. -->
      <div class="bs-foot" data-testid="bet-selector-effective">
        <span class="bs-foot-label">{$tr('bet')}</span>
        <span class="bs-foot-value">{effectiveLabel}</span>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* Tokens mirror the HUD's own signature set so the panel reads as part of the
     same chrome rather than as a generic dialog. */
  .bs-panel {
    --sig-cyan:   var(--theme-primary, #00FFFF);
    --sig-gold:   #FFD700;
    --sig-orange: #FF9A2E;

    position: fixed;
    left: 50%;
    top: 50%;
    /* COUNTER-SCALED, and this is not cosmetic. `.game-wrapper` carries
       `transform: scale(S)`, which makes it the containing block for fixed
       descendants AND scales them, so a 44px touch target rendered at 41.3px on
       a 1200px desktop stage. That is the same containing-block trap the ten
       hand-rolled scrims fell into (TR fixpack JOB 4), and `--scrim-scale` is
       the variable App.svelte already publishes to undo it: it is S when the
       wrapper is scaled and 1 when portrait drops the transform. Dividing by it
       here makes one CSS pixel in this panel one real pixel on the glass, which
       is the only way a 44px floor means 44px.
       Measured: without this the level buttons were 41.3px at 1200x675. */
    transform: translate(-50%, -50%) scale(calc(1 / var(--scrim-scale, 1)));
    z-index: 130;                 /* above the HUD (50), below max-win (150) */
    width: min(520px, calc(100vw - 32px));
    max-height: min(70vh, 560px);
    overflow-y: auto;
    padding: 16px 18px 18px;
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(14, 10, 30, 0.98), rgba(8, 6, 20, 0.99));
    border: 1px solid color-mix(in srgb, var(--sig-cyan) 38%, transparent);
    box-shadow:
      0 0 28px color-mix(in srgb, var(--sig-cyan) 22%, transparent),
      0 18px 44px rgba(0, 0, 0, 0.6);
    /* OPACITY ONLY. A transform keyframe here would overwrite the counter-scale
       above for the length of the animation and the panel would pop from the
       wrong size, so the entrance does not touch transform at all. */
    animation: bs-in 0.16s ease both;
  }
  @keyframes bs-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .bs-scrim { z-index: 129; background: rgba(4, 2, 12, 0.62); }

  .bs-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }
  .bs-title {
    font-family: var(--fs-font-display);
    font-weight: 900;
    font-size: 14px;
    letter-spacing: 0.18em;
    color: color-mix(in srgb, var(--sig-cyan) 88%, #fff);
  }
  .bs-close {
    width: 44px; height: 44px;      /* touch minimum, same floor as the HUD */
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; cursor: pointer; padding: 0;
    color: rgba(255, 255, 255, 0.66);
  }
  .bs-close:hover { color: #fff; }
  .bs-close-glyph { width: 18px; height: 18px; }
  .bs-close-glyph path { stroke: currentColor; stroke-width: 2; stroke-linecap: round; fill: none; }

  /* Auto-fit, so a four-level ladder and a twenty-level ladder both look
     deliberate. The 44px row height is the touch floor, not a look. */
  .bs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(104px, 1fr));
    gap: 8px;
  }
  .bs-level {
    position: relative;
    min-height: 44px;
    padding: 8px 10px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    cursor: pointer;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.045);
    font-family: var(--fs-font-display);
    transition: border-color 0.12s, background 0.12s, transform 0.08s;
  }
  .bs-level:hover { border-color: color-mix(in srgb, var(--sig-cyan) 60%, transparent); background: rgba(255, 255, 255, 0.08); }
  .bs-level:active { transform: translateY(1px); }
  .bs-level:focus-visible {
    outline: 2px solid var(--sig-cyan);
    outline-offset: 2px;
  }
  .bs-level-value {
    font-weight: 800;
    font-size: 15px;
    color: #f4f1ff;
  }
  .bs-level-tag {
    position: absolute;
    bottom: 3px;
    font-size: 8px;
    letter-spacing: 0.14em;
    color: rgba(255, 255, 255, 0.42);
  }

  /* The current level is the one thing a player scans for, so it carries the
     gold the BET readout already uses rather than a fourth accent colour. */
  .bs-level.is-current {
    border-color: var(--sig-gold);
    background: color-mix(in srgb, var(--sig-gold) 14%, transparent);
    box-shadow: 0 0 14px color-mix(in srgb, var(--sig-gold) 30%, transparent);
  }
  .bs-level.is-current .bs-level-value { color: var(--sig-gold); }

  /* Dimmed, NOT disabled. A level above the current balance is still a legal
     selection and the SPIN button already refuses an unaffordable bet; removing
     it from the list would make the ladder look shorter than it is. */
  .bs-level.is-unaffordable .bs-level-value { color: rgba(244, 241, 255, 0.42); }

  .bs-foot {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    margin-top: 14px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-family: var(--fs-font-display);
  }
  .bs-foot-label {
    font-size: 10px;
    letter-spacing: 0.18em;
    color: rgba(255, 255, 255, 0.5);
  }
  .bs-foot-value {
    font-size: 16px;
    font-weight: 800;
    color: var(--sig-orange);
  }

  /* Popout S and other very small stages: the panel is fixed to the VIEWPORT,
     so it is sized against the viewport rather than the 1280x720 design
     surface, and the columns collapse before the touch floor does. */
  @media (max-width: 460px), (max-height: 320px) {
    .bs-panel { width: calc(100vw - 16px); max-height: calc(100vh - 16px); padding: 10px 12px 12px; }
    /* 96px rather than 84px, measured at Popout S with the gate's own ladder:
       four columns of 84px let a six-figure amount like $90,000.00 fill its
       button edge to edge and touch its neighbour. At 96px the row wraps to
       three wider columns instead, which costs one line of height the panel has
       and buys the amounts room to breathe. The touch floor is untouched. */
    .bs-grid { grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 6px; }
    .bs-level { min-height: 44px; padding: 6px 6px 12px; }
    .bs-level-value { font-size: 12px; }
    .bs-title { font-size: 12px; letter-spacing: 0.14em; }
  }

  @media (prefers-reduced-motion: reduce) {
    .bs-panel { animation: none; }
  }
</style>
