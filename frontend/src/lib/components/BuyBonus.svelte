<script lang="ts">
  // BuyBonus.svelte — Bonus Buy button + confirm modal. Temporary CSS treatment
  // (final art in AssetForge v2). Fully hidden where the jurisdiction disables
  // feature buys. All strings localised with social overrides.
  import { createEventDispatcher } from 'svelte'
  import { betAmount, currencyCode, canBuyBonus, locale, isSpinning } from '../stores/gameStore'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { buyFeatureDisabled } from '../stores/jurisdiction'
  import { isSocial } from '../stores/socialMode'
  import { t, type GameMode } from '../i18n/translations'

  const dispatch = createEventDispatcher<{ buy: void }>()
  let showConfirm = false

  // FeatureButton (LAYOUT_SPEC HUD) opens this same confirm flow instead of a
  // second on-screen trigger; App.svelte mounts this with showTrigger={false}
  // and calls openConfirm() via bind:this so there is exactly one buy button.
  export let showTrigger = true

  $: mode = ($isSocial ? 'social' : 'real') as GameMode
  $: priceMicros = Math.round($betAmount * 100 * CURRENCY_SCALE)
  $: priceLabel = formatBalance(priceMicros, $currencyCode || 'USD')

  function open() { if (!$isSpinning) showConfirm = true }
  function cancel() { showConfirm = false }
  function confirm() {
    showConfirm = false
    dispatch('buy')
  }

  export function openConfirm(): void { open() }
</script>

{#if !$buyFeatureDisabled}
  {#if showTrigger}
    <button
      class="buy-btn"
      on:click={open}
      disabled={$isSpinning}
      aria-label={t($locale, 'buyFeature', mode)}
      data-testid="buy-bonus-button"
    >
      <span class="buy-btn-label">{t($locale, 'buyFeature', mode)}</span>
      <span class="buy-btn-price">{priceLabel}</span>
    </button>
  {/if}

  {#if showConfirm}
    <div class="buy-backdrop" role="dialog" aria-modal="true" aria-label={t($locale, 'buyConfirmTitle', mode)}>
      <div class="buy-modal">
        <h2 class="buy-title">{t($locale, 'buyConfirmTitle', mode)}</h2>
        <p class="buy-desc">{t($locale, 'buyConfirmBody', mode)}</p>
        <div class="buy-price-row">
          <span>{t($locale, 'buyPrice', mode)}</span>
          <span class="buy-price-val">{priceLabel}</span>
        </div>
        {#if !$canBuyBonus}
          <p class="buy-warn">{t($locale, 'insufficientBalance', mode)}</p>
        {/if}
        <div class="buy-actions">
          <button class="buy-cancel" on:click={cancel}>{t($locale, 'buyCancel', mode)}</button>
          <button class="buy-confirm" on:click={confirm} disabled={!$canBuyBonus} data-testid="buy-confirm">
            {t($locale, 'buyConfirm', mode)}
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
  }
  .buy-modal {
    width: min(90vw, 380px); padding: 22px; border-radius: 14px; text-align: center;
    background: linear-gradient(160deg, #0c0c22, #08081a);
    border: 1px solid var(--theme-secondary, #ff2ec4);
    box-shadow: 0 0 24px rgba(255, 46, 196, 0.4);
    color: #fff; font-family: 'Orbitron', sans-serif;
  }
  .buy-title { font-size: 1.1rem; margin: 0 0 12px; color: var(--theme-secondary, #ff2ec4); }
  .buy-desc { font-size: 0.85rem; opacity: 0.9; margin: 0 0 14px; line-height: 1.5; }
  .buy-price-row { display: flex; justify-content: space-between; padding: 8px 4px; font-size: 0.9rem; border-top: 1px solid rgba(255,255,255,0.1); }
  .buy-price-val { color: #ffd54a; font-weight: 700; }
  .buy-warn { color: #ff6b6b; font-size: 0.8rem; }
  .buy-actions { display: flex; gap: 10px; margin-top: 16px; }
  .buy-cancel, .buy-confirm { flex: 1; padding: 10px; border-radius: 8px; cursor: pointer; font-family: 'Orbitron', sans-serif; font-weight: 700; }
  .buy-cancel { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff; }
  .buy-confirm { background: var(--theme-secondary, #ff2ec4); border: none; color: #12071e; }
  .buy-confirm:disabled { opacity: 0.5; cursor: default; }
</style>
