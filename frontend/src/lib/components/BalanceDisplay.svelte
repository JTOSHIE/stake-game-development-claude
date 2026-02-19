<script lang="ts">
  import { balance, betAmount } from '../stores/gameStore'
  import { locale } from '../stores/gameStore'
  import { t } from '../i18n/translations'
</script>

<div class="balance-display">
  <div class="field">
    <span class="label">{t($locale, 'balance')}</span>
    <span class="value">${$balance.toFixed(2)}</span>
  </div>
  <div class="field">
    <span class="label">{t($locale, 'bet')}</span>
    <span class="value">${$betAmount.toFixed(2)}</span>
  </div>
</div>

<style>
  .balance-display {
    display: flex;
    gap: 2rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 80px;
  }

  .label {
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    color: #888;
    text-transform: uppercase;
  }

  .value {
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
    font-family: 'Courier New', monospace;
  }
</style>
