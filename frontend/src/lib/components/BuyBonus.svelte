<script lang="ts">
  // BuyBonus.svelte, Bonus Buy button + confirm modal. Temporary CSS treatment
  // (final art in AssetForge v2). Fully hidden where the jurisdiction disables
  // feature buys. All strings localised with social overrides.
  import { createEventDispatcher } from 'svelte'
  import { betAmount, currencyCode, locale, isSpinning } from '../stores/gameStore'
  // R8/TR-016: the confirm button used gameStore's canBuyBonus, hardcoded to
  // bet x 100. At the 400x NITRO tier that enabled CONFIRM beside a correctly
  // displayed 400x price. gameStore is locked, so the correct per-tier check
  // lives in this non-locked module, shared with the FEATURES menu.
  import { canAffordMode, modeCostFor, spinCostMicros } from '../stores/buyAffordability'
  import { setModalOpen, setGameBlocked } from '../stores/modalGuard'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { buyFeatureDisabled } from '../stores/jurisdiction'
  import { isSocial } from '../stores/socialMode'
  import { themeAssets } from '../stores/themeStore'
  import { t, type GameMode } from '../i18n/translations'
  import { FS_MODES, fsRtpLabel, maxWinVsBaseBetLabel } from '../config/fsModes'
  import { autofitText } from '../actions/autofitText'
  import type { BetMode } from '../stores/betMode'

  // Real symbol images previewed in the modal grid (scatter is the trigger, so
  // it leads; then the premium reel symbols the feature pays on).
  const PREVIEW = ['scatter', 'h1', 'h2', 'm3', 'wild']
  $: base = $themeAssets.assetBase

  const dispatch = createEventDispatcher<{ buy: BetMode }>()
  let showConfirm = false

  // FeatureButton (LAYOUT_SPEC HUD) opens this same confirm flow instead of a
  // second on-screen trigger; App.svelte mounts this with showTrigger={false}
  // and calls openConfirm(mode) via bind:this so there is exactly one buy
  // button/modal shared by every buy tier in the FEATURES menu.
  export let showTrigger = true

  // Which buy tier this confirm is currently for (set by openConfirm before
  // showConfirm flips true). Defaults to 'bonus' so the standalone trigger
  // button (showTrigger=true, unused in the current 5-mode menu but kept for
  // API compatibility) still shows a sane price.
  let buyMode: BetMode = 'bonus'

  $: localeMode = ($isSocial ? 'social' : 'real') as GameMode
  $: modeCost = modeCostFor(buyMode)
  $: priceMicros = spinCostMicros($betAmount, buyMode)
  $: priceLabel = formatBalance(priceMicros, $currencyCode || 'USD', $locale)
  // OWNER AUDIT REMEDIATION B4: the modal's own feature name/description
  // now come straight from FS_MODES (the single source of truth already
  // used by the FEATURES menu cards) instead of a single generic
  // "OVERDRIVE FREE SPINS" title+body shared by every tier - Buy Overdrive
  // and NITRO OVERDRIVE now read as genuinely different presentations, and
  // NITRO's own "meter pre-revved to 5x" line comes along for free since
  // it's already in fsModes.ts's blurb for 'super'.
  $: buyModeEntry = FS_MODES.find((m) => m.serverMode === buyMode) ?? FS_MODES.find((m) => m.id === 'bonus')
  $: featureName = buyModeEntry ? t($locale, buyModeEntry.labelKey, localeMode) : t($locale, 'buyConfirmTitle', localeMode)
  $: featureBlurb = buyModeEntry ? t($locale, buyModeEntry.blurbKey, localeMode) : ''

  function open(mode: BetMode = 'bonus') {
    if ($isSpinning) return
    buyMode = mode
    showConfirm = true
  }
  // Announce this dialog to the shared modal guard so the spacebar handler and
  // the autoplay scheduler both suppress themselves while it is open. Neither
  // could see `showConfirm` before: it is component-local state.
  $: setModalOpen('buy-confirm', showConfirm)
  // Sibling of the game containers, so it can also contain focus.
  $: setGameBlocked('buy-confirm', showConfirm)

  function cancel() { showConfirm = false }
  function confirm() {
    showConfirm = false
    dispatch('buy', buyMode)
  }

  export function openConfirm(mode: BetMode = 'bonus'): void { open(mode) }
</script>

<!-- Escape closes the dialog. On the backdrop element this did nothing, because
     a keydown handler only fires for the focused element and the backdrop never
     holds focus; measured closedByEscape=false at all seven presets before this
     moved to the window. Gated on showConfirm so it is inert the rest of the
     time, and it stops propagation so the same key does not also reach another
     overlay's handler. -->
<svelte:window on:keydown={(e: KeyboardEvent) => {
  if (showConfirm && e.key === 'Escape') { e.stopPropagation(); cancel() }
}} />


{#if !$buyFeatureDisabled}
  {#if showTrigger}
    <button
      class="buy-btn"
      on:click={() => open()}
      disabled={$isSpinning}
      aria-label={t($locale, 'buyFeature', localeMode)}
      data-testid="buy-bonus-button"
    >
      <span class="buy-btn-label">{t($locale, 'buyFeature', localeMode)}</span>
      <span class="buy-btn-price">{priceLabel}</span>
    </button>
  {/if}

  {#if showConfirm}
    <!-- DISMISSIBLE, 2026-08-09. This dialog could only be closed by its own
         CANCEL control: Escape did nothing and the backdrop swallowed clicks.
         A modal a player cannot escape is a trap, and a reviewer tries both
         before finding the button. `cancel` is the SAME handler CANCEL calls,
         so there is one exit path and no second copy of the tidy-up. The
         backdrop check compares currentTarget with target so a click inside
         the modal does not close it. -->
    <div class="buy-backdrop fs-scrim" role="dialog" aria-modal="true" aria-label={featureName}
         on:click={(e) => { if (e.target === e.currentTarget) cancel() }}
         on:keydown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); cancel() } }}
         tabindex="-1">
      <div class="buy-modal">
        <!-- Grille art carries the header (LAYOUT_SPEC feature accent) -->
        <img class="buy-header-art" src="{base}/ui/feature_button.png" alt="" draggable="false" />
        <!-- OWNER AUDIT REMEDIATION B4: feature name (per-mode, not the one
             generic title both tiers shared before), then "what you get" -
             the mode's own blurb (NITRO's "pre-revved to 5x" line included
             for free), the scatter/spins/instant-award breakdown and the
             meter behaviour, both reused verbatim from the existing Rules
             tab translations rather than duplicating new copy. -->
        <h2 class="buy-title">{featureName}</h2>
        <p class="buy-desc">{t($locale, 'buyConfirmBody', localeMode, { cost: modeCost })}</p>

        <div class="buy-whatyouget">
          <p class="buy-whatyouget-lbl">{t($locale, 'buyWhatYouGet', localeMode)}</p>
          <p class="buy-whatyouget-line">{featureBlurb}</p>
          <p class="buy-whatyouget-line">{t($locale, 'rulesOverdriveTrigger', localeMode)}</p>
          <p class="buy-whatyouget-line">{t($locale, 'rulesOverdriveMeter', localeMode)}</p>
        </div>

        <!-- Real symbol preview grid (scatter leads) -->
        <div class="buy-preview" aria-hidden="true">
          {#each PREVIEW as sym}
            <div class="buy-sym" class:lead={sym === 'scatter'}>
              <img src="{base}/symbols/{sym}.png" alt="" draggable="false" />
            </div>
          {/each}
        </div>

        <!-- Price / RTP / max win stat row (B4: reinforces the per-mode
             disclosure requirement - every buy tier states its own price
             plus the RTP and max win that apply to it). -->
        <div class="buy-stats-row">
          <div class="buy-stat">
            <span class="buy-stat-label">{t($locale, 'buyPrice', localeMode)}</span>
            <span class="buy-stat-val gold" use:autofitText={priceLabel} data-money="cur">{priceLabel}</span>
          </div>
          <div class="buy-stat">
            <span class="buy-stat-label">RTP</span>
            <span class="buy-stat-val" use:autofitText={fsRtpLabel($locale)} data-money="num">{fsRtpLabel($locale)}</span>
          </div>
          <div class="buy-stat">
            <span class="buy-stat-label">{t($locale, 'hudMaxWin', localeMode)}</span>
            <!-- ROUND 4 item 4: quoted against the BASE bet, because this stat
                 sits beside a 100x/400x cost multiplier. -->
            <span class="buy-stat-val" use:autofitText={maxWinVsBaseBetLabel($isSocial, $locale)} data-money="num">{maxWinVsBaseBetLabel($isSocial, $locale)}</span>
          </div>
        </div>
        {#if !$canAffordMode(buyMode)}
          <p class="buy-warn">{t($locale, 'insufficientBalance', localeMode)}</p>
        {/if}
        <div class="buy-actions">
          <button class="buy-cancel" on:click={cancel}>{t($locale, 'buyCancel', localeMode)}</button>
          <button class="buy-confirm" on:click={confirm} disabled={!$canAffordMode(buyMode)} data-testid="buy-confirm">
            {t($locale, 'buyConfirm', localeMode)}
          </button>
        </div>
      </div>
    </div>
  {/if}
{/if}

<style>
  .buy-btn {
    display: inline-flex; flex-direction: column; align-items: center; gap: 2px;
    padding: 8px 16px; border-radius: 10px; cursor: pointer;
    background: linear-gradient(160deg, #2a0d3a, #12071e);
    border: 1px solid var(--theme-secondary, #ff2ec4);
    color: var(--theme-secondary, #ff2ec4);
    font-family: var(--fs-font-display); font-weight: 700; letter-spacing: 1px;
    box-shadow: 0 0 12px rgba(255, 46, 196, 0.35);
  }
  .buy-btn:disabled { opacity: 0.5; cursor: default; }
  .buy-btn-label { font-size: 0.8rem; }
  .buy-btn-price { font-size: 0.72rem; color: #ffd54a; }
  .buy-backdrop { z-index: 120; display: flex; align-items: center; justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    animation: buy-fade 0.2s ease;
  }
  @keyframes buy-fade { from { opacity: 0; } to { opacity: 1; } }
  .buy-modal {
    /* OWNER AUDIT REMEDIATION B4: "larger, premium presentation" - widened
       from 400px and given a taller scrollable cap so the new what-you-get
       and stats sections have real room instead of being squeezed in. */
    width: min(94vw, 460px); max-height: 90dvh; overflow-y: auto;
    padding: 22px 24px 24px; border-radius: 18px; text-align: center;
    background: linear-gradient(160deg, #0c0c22, #08081a);
    border: 1px solid var(--theme-secondary, #ff2ec4);
    box-shadow: 0 0 34px rgba(255, 46, 196, 0.5), 0 0 70px rgba(138, 92, 255, 0.22);
    color: #fff; font-family: var(--fs-font-display);
    animation: buy-pop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes buy-pop { from { opacity: 0; transform: scale(0.86); } to { opacity: 1; transform: scale(1); } }
  .buy-header-art { width: 88px; height: 88px; object-fit: contain; display: block; margin: 0 auto 4px; filter: drop-shadow(0 0 10px rgba(138, 92, 255, 0.55)); }
  .buy-title { font-size: 1.12rem; margin: 0 0 10px; color: var(--theme-secondary, #ff2ec4); letter-spacing: 0.04em; }
  .buy-desc { font-size: 0.82rem; opacity: 0.9; margin: 0 0 14px; line-height: 1.5; }
  .buy-preview { display: flex; justify-content: center; align-items: center; gap: 8px; margin: 0 0 16px; }
  .buy-sym { width: 52px; height: 52px; border-radius: 10px; background: #0b0f1c; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(0, 255, 255, 0.18); }
  .buy-sym img { width: 46px; height: 46px; object-fit: contain; }
  .buy-sym.lead { width: 62px; height: 62px; box-shadow: inset 0 0 0 1px rgba(255, 215, 0, 0.5), 0 0 12px rgba(255, 215, 0, 0.35); }
  .buy-sym.lead img { width: 56px; height: 56px; }
  /* OWNER AUDIT REMEDIATION B4: "what you get" - mode blurb + scatter/spins
     breakdown + meter behaviour, left-aligned body copy inside the
     otherwise-centred modal (easier to read as a paragraph block). */
  .buy-whatyouget {
    text-align: left; margin: 0 0 14px; padding: 12px 14px;
    background: rgba(255, 255, 255, 0.03); border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .buy-whatyouget-lbl {
    font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--theme-secondary, #ff2ec4); margin: 0 0 6px; font-weight: 700;
  }
  .buy-whatyouget-line {
    font-size: 0.74rem; line-height: 1.5; color: rgba(255, 255, 255, 0.85);
    margin: 0 0 6px;
  }
  .buy-whatyouget-line:last-child { margin-bottom: 0; }

  /* Price / RTP / max win, three stat cells on one instrument-plate styled
     row (notched corners, magenta rim - same treatment the old single
     price plate used). */
  /* R12, 2026-07-27: STICKY, and this is a compliance requirement rather than a
     styling preference. Per-mode cost, RTP and max win must be DISPLAYED to the
     player; this row is where the buy flow discloses all three.
     The modal already scrolled (max-height 90dvh, overflow-y auto), so at short
     viewports the row was still reachable but sat BELOW THE FOLD: measured out of
     view at 360x600 and at compact landscape 812x375, where a reviewer who does
     not scroll simply never sees the disclosure. (390x664, the height the brief
     named, was already fine.)
     Sticking it to the bottom of the modal's scroll box keeps it on screen at
     every height without reordering the owner-approved B4 presentation. The
     opaque background is required: the content scrolling underneath would
     otherwise show through the clip-path notches.
     R059 TASK 3, OWNER DESIGN RULING, and the tension with the R12 paragraph
     above is surfaced per (n) rather than silently resolved: the owner's
     sweep found this row FLOATING OVER the scrolling copy on small screens
     and ruled it DOCKED IN THE SCROLL FLOW at the bottom of the content, so
     the sticky is removed. The R12 disclosure concern survives structurally:
     the row is the last content block before the (still sticky) actions, so
     the same scroll that reaches CONFIRM lands the disclosure directly above
     it, and the buy proof drives that scroll rather than assuming it. */
  .buy-stats-row {
    display: flex; align-items: stretch; justify-content: space-between;
    padding: 10px 4px; margin: 0 0 4px;
    background: linear-gradient(180deg, #1a2236, #080c16);
    clip-path: polygon(0 12%, 3% 0, 97% 0, 100% 12%, 100% 100%, 3% 100%, 0 88%);
    box-shadow: inset 0 0 0 1.5px rgba(255, 43, 214, 0.85), 0 0 12px rgba(255, 43, 214, 0.25);
  }
  .buy-stat {
    /* min-width: 0 so a long value can actually shrink its cell: a flex item
       refuses to go below its content width without it, which is what pushed
       MAX WIN out of the row at Mobile S. R059 TASK 3. */
    flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 0 6px; border-right: 1px solid rgba(255, 255, 255, 0.08);
  }
  .buy-stat:last-child { border-right: none; }
  .buy-stat-label { font-size: 0.6rem; letter-spacing: 0.05em; color: rgba(255, 255, 255, 0.6); text-transform: uppercase; }
  .buy-stat-val {
    color: #cfe9ff; font-weight: 700;
    /* R059: the fit action's scale multiplied in, per the governing rule. */
    font-size: calc(0.92rem * var(--autofit-scale, 1));
    font-variant-numeric: tabular-nums;
    white-space: nowrap; max-width: 100%; overflow: hidden;
  }
  .buy-stat-val.gold { color: #ffd54a; text-shadow: 0 0 8px rgba(255, 213, 74, 0.5); }

  @media (prefers-reduced-motion: reduce) {
    .buy-backdrop, .buy-modal { animation: none; }
  }
  .buy-warn { color: #ff6b6b; font-size: 0.8rem; }
  /* THE BUTTONS MUST BE ON SCREEN, not merely reachable. Measured before this
     change, opening the dialog at the seven presets: CONFIRM was below the fold
     at FOUR of them, and at Popout S it sat 365px under a 225px viewport, inside
     the modal's own scroll box. A previous pass made `.buy-stats-row` sticky so
     the price disclosure stayed visible, and left the controls underneath it
     scrolling away.

     Both are now pinned to the bottom of the scroll box: the actions at the
     very bottom, the stats row directly above them. The offset is the actions'
     own height (10px padding x2, ~22px of button, 16px margin-top) and is stated
     as one value here rather than being repeated. */
  .buy-actions {
    display: flex; gap: 10px; margin-top: 16px;
    position: sticky; bottom: 0; z-index: 3;
    /* Opaque, or the content scrolling underneath shows through the gap
       between the two buttons. Matches the modal's own gradient foot. */
    background: #08081a;
    padding-bottom: 2px;
  }
  .buy-cancel, .buy-confirm { flex: 1; padding: 10px; border-radius: 8px; cursor: pointer; font-family: var(--fs-font-display); font-weight: 700; }
  .buy-cancel { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff; }
  .buy-confirm { background: var(--theme-secondary, #ff2ec4); border: none; color: #12071e; }
  .buy-confirm:disabled { opacity: 0.5; cursor: default; }
</style>
