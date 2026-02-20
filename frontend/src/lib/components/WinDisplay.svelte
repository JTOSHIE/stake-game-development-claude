<script lang="ts">
  import { winAmount, winMultiplier, isWincap, scatterCount, locale, currencyCode } from '../stores/gameStore'
  import { t } from '../i18n/translations'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'

  $: showWin = $winAmount > 0
  $: scatterKey = $scatterCount >= 5 ? 'scatter5'
                : $scatterCount === 4 ? 'scatter4'
                : $scatterCount === 3 ? 'scatter3'
                : null
</script>

<!--
  Win display uses ui_paytable_frame_variant_02_original.png as the panel frame.
  The win amount and scatter label are layered on top.
-->
<div class="win-panel" class:visible={showWin} class:wincap-active={$isWincap}>

  {#if $isWincap}
    <div class="win-label wincap">{t($locale, 'wincap')}</div>
  {:else if scatterKey}
    <div class="win-label scatter">{t($locale, scatterKey)}</div>
  {:else}
    <div class="win-label idle">{t($locale, 'win')}</div>
  {/if}

  <div class="win-amount" class:wincap={$isWincap}>
    {#if showWin}
      {formatBalance($winAmount * CURRENCY_SCALE, $currencyCode)}
    {:else}
      —
    {/if}
  </div>

  {#if showWin && $winMultiplier >= 1}
    <div class="multiplier">{$winMultiplier.toFixed(1)}×</div>
  {/if}
</div>

<style>
  .win-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    /* Paytable frame image as the panel art */
    background-image: url('/assets/symbols/ui_paytable_frame_variant_02_original.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;

    min-width: 160px;
    height: 56px;
    padding: 0 1rem;

    opacity: 0.4;
    transition: opacity 0.3s, filter 0.3s;
  }

  .win-panel.visible {
    opacity: 1;
  }

  .win-panel.wincap-active {
    filter: drop-shadow(0 0 14px rgba(255, 215, 0, 0.9));
  }

  .win-label {
    font-size: 0.58rem;
    letter-spacing: 0.1em;
    font-weight: 700;
    text-transform: uppercase;
    line-height: 1;
  }

  .win-label.idle    { color: rgba(255,255,255,0.35); }
  .win-label.scatter { color: #a0e4ff; }
  .win-label.wincap  { color: #ffd700; }

  .win-amount {
    font-size: 1.05rem;
    font-weight: 700;
    color: #4eff91;
    font-family: 'Courier New', monospace;
    line-height: 1.3;
    text-shadow: 0 0 8px rgba(78, 255, 145, 0.4);
    transition: color 0.3s;
  }

  .win-amount.wincap {
    color: #ffd700;
    text-shadow: 0 0 14px rgba(255, 215, 0, 0.9);
    animation: pulse 0.6s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    from { transform: scale(1); }
    to   { transform: scale(1.1); }
  }

  .currency {
    font-size: 0.75rem;
    vertical-align: super;
  }

  .multiplier {
    font-size: 0.7rem;
    color: #ffc832;
    line-height: 1;
  }
</style>
