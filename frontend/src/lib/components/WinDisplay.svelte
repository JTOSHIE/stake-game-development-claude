<script lang="ts">
  import { winAmount, winMultiplier, isWincap, scatterCount, locale } from '../stores/gameStore'
  import { t } from '../i18n/translations'

  $: showWin = $winAmount > 0
  $: scatterKey = $scatterCount >= 5 ? 'scatter5'
                : $scatterCount === 4 ? 'scatter4'
                : $scatterCount === 3 ? 'scatter3'
                : null
</script>

<div class="win-display" class:visible={showWin}>
  {#if $isWincap}
    <div class="win-label wincap">{t($locale, 'wincap')}</div>
  {:else if scatterKey}
    <div class="win-label scatter">{t($locale, scatterKey)}</div>
  {/if}

  <div class="win-amount" class:wincap={$isWincap}>
    {#if showWin}
      <span class="currency">$</span>{$winAmount.toFixed(2)}
    {:else}
      <span class="label">{t($locale, 'win')}</span>
    {/if}
  </div>

  {#if showWin && $winMultiplier >= 1}
    <div class="multiplier">{$winMultiplier.toFixed(1)}×</div>
  {/if}
</div>

<style>
  .win-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 140px;
    opacity: 0.35;
    transition: opacity 0.3s;
  }

  .win-display.visible {
    opacity: 1;
  }

  .label {
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    color: #888;
    text-transform: uppercase;
  }

  .win-label {
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .win-label.scatter { color: #a0e4ff; }
  .win-label.wincap  { color: #ffd700; }

  .win-amount {
    font-size: 1.6rem;
    font-weight: 700;
    color: #4eff91;
    font-family: 'Courier New', monospace;
    transition: color 0.3s;
  }

  .win-amount.wincap {
    color: #ffd700;
    text-shadow: 0 0 12px rgba(255, 215, 0, 0.8);
    animation: pulse 0.6s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    from { transform: scale(1);    }
    to   { transform: scale(1.08); }
  }

  .currency {
    font-size: 0.9rem;
    vertical-align: super;
  }

  .multiplier {
    font-size: 0.85rem;
    color: #ffc832;
    margin-top: 2px;
  }
</style>
