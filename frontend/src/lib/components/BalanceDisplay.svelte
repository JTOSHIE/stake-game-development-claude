<script lang="ts">
  import { balance, betAmount, locale } from '../stores/gameStore'
  import { t } from '../i18n/translations'
  import { themeAssets } from '../stores/themeStore'
</script>

<div
  class="balance-panel"
  style="background-image: url('{$themeAssets.panelBalance}'); background-size: 100% 100%;"
>
  <div class="field">
    <div class="led-label">{t($locale, 'balance')}</div>
    <div class="led-value cyan">USD {$balance.toFixed(2)}</div>
  </div>
  <div class="divider"></div>
  <div class="field">
    <div class="led-label">{t($locale, 'bet')}</div>
    <div class="led-value gold">USD {$betAmount.toFixed(2)}</div>
  </div>
</div>

<style>
  .balance-panel {
    min-width: 280px;
    height: 90px;
    background-repeat: no-repeat;
    background-color: rgba(0, 0, 0, 0.75);
    border: 1px solid var(--theme-primary, #00ffff);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-primary, #00ffff) 40%, transparent);
    border-radius: 6px;
    display: flex;
    align-items: center;
    padding: 0 1.2rem;
    gap: 0.8rem;
  }

  .field {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .divider {
    width: 1px;
    height: 55%;
    background: rgba(255, 200, 50, 0.25);
    flex-shrink: 0;
  }

  .led-label {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    display: block;
  }

  .led-value {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 2px;
    display: block;
  }

  .led-value.cyan {
    color: #00FFFF;
    text-shadow: 0 0 8px #00FFFF;
  }

  .led-value.gold {
    color: #FFD700;
    text-shadow: 0 0 8px #FFD700;
  }
</style>
