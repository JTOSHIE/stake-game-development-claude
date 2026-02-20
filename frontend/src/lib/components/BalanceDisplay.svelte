<script lang="ts">
  import { balance, betAmount, locale, currencyCode } from '../stores/gameStore'
  import { t } from '../i18n/translations'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
</script>

<!--
  Balance panel uses ui_balance_panel_variant_02.png as a CSS background image.
  The two data fields (balance / bet) are layered on top using absolute positioning
  within the panel's natural aspect ratio container.
-->
<div class="balance-panel">
  <div class="field">
    <span class="label">{t($locale, 'balance')}</span>
    <span class="value">{formatBalance($balance * CURRENCY_SCALE, $currencyCode)}</span>
  </div>
  <div class="divider"></div>
  <div class="field">
    <span class="label">{t($locale, 'bet')}</span>
    <span class="value">{formatBalance($betAmount * CURRENCY_SCALE, $currencyCode)}</span>
  </div>
</div>

<style>
  .balance-panel {
    display: flex;
    align-items: stretch;
    gap: 0;

    /* Cyberpunk balance panel image as the frame */
    background-image: url('/assets/symbols/ui_balance_panel_variant_02.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;

    /* Size the panel to show a reasonable portion of the art */
    min-width: 220px;
    height: 56px;
    /* Horizontal padding keeps text off the decorative left/right edges */
    padding: 0 1.4rem;

    position: relative;
  }

  .field {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* Nudge the stack 1px upward so the optical centre sits on the panel midline */
    padding-top: 1px;
    gap: 1px;
  }

  .divider {
    width: 1px;
    align-self: center;
    height: 55%;
    background: rgba(255, 200, 50, 0.25);
    flex-shrink: 0;
  }

  .label {
    font-size: 0.56rem;
    letter-spacing: 0.14em;
    color: rgba(255, 200, 50, 0.75);
    text-transform: uppercase;
    line-height: 1;
    /* Keep baseline flush — no extra descender space */
    display: block;
  }

  .value {
    font-size: 1.0rem;
    font-weight: 700;
    color: #ffffff;
    font-family: 'Courier New', monospace;
    /* Tight line-height keeps it snug against the label */
    line-height: 1.2;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
    display: block;
  }
</style>
