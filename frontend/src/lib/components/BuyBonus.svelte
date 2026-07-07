<script lang="ts">
  // BuyBonus.svelte — Bonus Buy button + confirm modal. Temporary CSS treatment
  // (final art in AssetForge v2). Fully hidden where the jurisdiction disables
  // feature buys. All strings localised with social overrides.
  import { createEventDispatcher } from 'svelte'
  import { betAmount, currencyCode, canBuyBonus, locale, isSpinning } from '../stores/gameStore'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { buyFeatureDisabled } from '../stores/jurisdiction'
  import { isSocial } from '../stores/socialMode'
  import { themeAssets } from '../stores/themeStore'
  import { t, type GameMode } from '../i18n/translations'
  import { MODE_COST } from '../config/fsModes'
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
  $: priceMicros = Math.round($betAmount * (MODE_COST[buyMode] ?? 100) * CURRENCY_SCALE)
  $: priceLabel = formatBalance(priceMicros, $currencyCode || 'USD')

  function open(mode: BetMode = 'bonus') {
    if ($isSpinning) return
    buyMode = mode
    showConfirm = true
  }
  function cancel() { showConfirm = false }
  function confirm() {
    showConfirm = false
    dispatch('buy', buyMode)
  }

  export function openConfirm(mode: BetMode = 'bonus'): void { open(mode) }
</script>

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
    <div class="buy-backdrop" role="dialog" aria-modal="true" aria-label={t($locale, 'buyConfirmTitle', localeMode)}>
      <div class="buy-modal">
        <!-- Grille art carries the header (LAYOUT_SPEC feature accent) -->
        <img class="buy-header-art" src="{base}/ui/feature_button.png" alt="" draggable="false" />
        <h2 class="buy-title">{t($locale, 'buyConfirmTitle', localeMode)}</h2>
        <p class="buy-desc">{t($locale, 'buyConfirmBody', localeMode)}</p>

        <!-- Real symbol preview grid (scatter leads) -->
        <div class="buy-preview" aria-hidden="true">
          {#each PREVIEW as sym}
            <div class="buy-sym" class:lead={sym === 'scatter'}>
              <img src="{base}/symbols/{sym}.png" alt="" draggable="false" />
            </div>
          {/each}
        </div>

        <!-- Price on an instrument-plate styled element -->
        <div class="buy-price-plate">
          <span class="buy-price-label">{t($locale, 'buyPrice', localeMode)}</span>
          <span class="buy-price-val">{priceLabel}</span>
        </div>
        {#if !$canBuyBonus}
          <p class="buy-warn">{t($locale, 'insufficientBalance', localeMode)}</p>
        {/if}
        <div class="buy-actions">
          <button class="buy-cancel" on:click={cancel}>{t($locale, 'buyCancel', localeMode)}</button>
          <button class="buy-confirm" on:click={confirm} disabled={!$canBuyBonus} data-testid="buy-confirm">
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
    font-family: 'Orbitron', sans-serif; font-weight: 700; letter-spacing: 1px;
    box-shadow: 0 0 12px rgba(255, 46, 196, 0.35);
  }
  .buy-btn:disabled { opacity: 0.5; cursor: default; }
  .buy-btn-label { font-size: 0.8rem; }
  .buy-btn-price { font-size: 0.72rem; color: #ffd54a; }
  .buy-backdrop {
    position: fixed; inset: 0; z-index: 120; display: flex; align-items: center; justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    animation: buy-fade 0.2s ease;
  }
  @keyframes buy-fade { from { opacity: 0; } to { opacity: 1; } }
  .buy-modal {
    width: min(92vw, 400px); padding: 20px 22px 22px; border-radius: 16px; text-align: center;
    background: linear-gradient(160deg, #0c0c22, #08081a);
    border: 1px solid var(--theme-secondary, #ff2ec4);
    box-shadow: 0 0 30px rgba(255, 46, 196, 0.45), 0 0 60px rgba(138, 92, 255, 0.2);
    color: #fff; font-family: 'Orbitron', sans-serif;
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
  /* Price on an instrument-plate styled element (notched corners, magenta rim) */
  .buy-price-plate {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 18px; margin: 0 0 4px;
    background: linear-gradient(180deg, #1a2236, #080c16);
    clip-path: polygon(0 22%, 6% 0, 94% 0, 100% 22%, 100% 100%, 6% 100%, 0 78%);
    box-shadow: inset 0 0 0 1.5px rgba(255, 43, 214, 0.85), 0 0 12px rgba(255, 43, 214, 0.25);
  }
  .buy-price-label { font-size: 0.72rem; letter-spacing: 0.06em; color: rgba(255, 255, 255, 0.7); text-transform: uppercase; }
  .buy-price-val { color: #ffd54a; font-weight: 700; font-size: 1.05rem; font-variant-numeric: tabular-nums; text-shadow: 0 0 8px rgba(255, 213, 74, 0.5); }

  @media (prefers-reduced-motion: reduce) {
    .buy-backdrop, .buy-modal { animation: none; }
  }
  .buy-warn { color: #ff6b6b; font-size: 0.8rem; }
  .buy-actions { display: flex; gap: 10px; margin-top: 16px; }
  .buy-cancel, .buy-confirm { flex: 1; padding: 10px; border-radius: 8px; cursor: pointer; font-family: 'Orbitron', sans-serif; font-weight: 700; }
  .buy-cancel { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff; }
  .buy-confirm { background: var(--theme-secondary, #ff2ec4); border: none; color: #12071e; }
  .buy-confirm:disabled { opacity: 0.5; cursor: default; }
</style>
