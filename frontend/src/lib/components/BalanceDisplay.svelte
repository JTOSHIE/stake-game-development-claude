<script lang="ts">
  import { balance, betAmount, locale } from '../stores/gameStore'
  import { t } from '../i18n/translations'
</script>

<!--
  Balance panel uses ui_balance_panel_variant_02.png as a CSS background image.
  The two data fields (balance / bet) are layered on top using absolute positioning
  within the panel's natural aspect ratio container.
-->
<div class="balance-panel">
  <div class="field">
    <span class="label">{t($locale, 'balance')}</span>
    <span class="value">${$balance.toFixed(2)}</span>
  </div>
  <div class="divider"></div>
  <div class="field">
    <span class="label">{t($locale, 'bet')}</span>
    <span class="value">${$betAmount.toFixed(2)}</span>
  </div>
</div>

<style>
  .balance-panel {
    display: flex;
    align-items: center;
    gap: 0;

    /* Cyberpunk balance panel image as the frame */
    background-image: url('/assets/symbols/ui_balance_panel_variant_02.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;

    /* Size the panel to show a reasonable portion of the art */
    min-width: 220px;
    height: 56px;
    padding: 0 1.5rem;

    /* Readable text on the dark panel image */
    position: relative;
  }

  .field {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .divider {
    width: 1px;
    height: 60%;
    background: rgba(255, 200, 50, 0.25);
    flex-shrink: 0;
  }

  .label {
    font-size: 0.58rem;
    letter-spacing: 0.14em;
    color: rgba(255, 200, 50, 0.7);
    text-transform: uppercase;
    line-height: 1;
  }

  .value {
    font-size: 1.05rem;
    font-weight: 700;
    color: #ffffff;
    font-family: 'Courier New', monospace;
    line-height: 1.3;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
  }
</style>
