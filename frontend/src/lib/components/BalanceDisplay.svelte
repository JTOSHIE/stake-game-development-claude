<script lang="ts">
  import { balance, betAmount, locale } from '../stores/gameStore'
  import { t } from '../i18n/translations'
</script>

<div class="balance-panel">
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
    background: linear-gradient(135deg,
      rgba(0, 8, 20, 0.92) 0%,
      rgba(0, 20, 40, 0.88) 50%,
      rgba(0, 8, 20, 0.92) 100%
    );
    border: 1px solid rgba(0, 255, 255, 0.4);
    border-radius: 8px;
    box-shadow:
      0 0 12px rgba(0, 255, 255, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    padding: 0 1.4rem;
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
    background: rgba(0, 255, 255, 0.15);
    flex-shrink: 0;
  }

  .led-label {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.25em;
    color: rgba(255, 255, 255, 0.4);
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
    text-shadow: 0 0 8px #00FFFF, 0 0 16px rgba(0, 255, 255, 0.4);
  }

  .led-value.gold {
    color: #FFD700;
    text-shadow: 0 0 8px #FFD700, 0 0 16px rgba(255, 215, 0, 0.4);
  }
</style>
