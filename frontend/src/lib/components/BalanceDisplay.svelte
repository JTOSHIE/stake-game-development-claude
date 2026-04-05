<script lang="ts">
  import { balance, betAmount, locale, currencyCode } from '../stores/gameStore'
  import { t } from '../i18n/translations'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { themeAssets } from '../stores/themeStore'
</script>

<!--
  Balance panel uses ui_balance_panel_variant_02.png as a CSS background image.
  The two data fields (balance / bet) are layered on top using absolute positioning
  within the panel's natural aspect ratio container.
-->
<div class="balance-panel" style="background-image: url('{$themeAssets.panelBalance}')">
  <div class="field">
    <div class="text-pill">
      <span class="label">{t($locale, 'balance')}</span>
      <span class="value">{formatBalance($balance * CURRENCY_SCALE, $currencyCode)}</span>
    </div>
  </div>
  <div class="divider"></div>
  <div class="field">
    <div class="text-pill">
      <span class="label">{t($locale, 'bet')}</span>
      <span class="value">{formatBalance($betAmount * CURRENCY_SCALE, $currencyCode)}</span>
    </div>
  </div>
</div>

<style>
  .balance-panel {
    display: flex;
    align-items: stretch;
    gap: 0;

    /* Background image set via inline style from themeStore */
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-color: transparent;

    /* Size the panel to show a reasonable portion of the art */
    min-width: 220px;
    height: 56px;
    /* Horizontal padding keeps text off the decorative left/right edges */
    padding: 0 1.4rem;

    position: relative;
    border: none;
    box-shadow: none;
  }

  .field {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Dark pill ensures contrast over any background image colour */
  .text-pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    background: rgba(0, 0, 0, 0.60);
    border-radius: 4px;
    padding: 3px 8px;
  }

  .divider {
    width: 1px;
    align-self: center;
    height: 55%;
    background: rgba(255, 200, 50, 0.25);
    flex-shrink: 0;
  }

  .label {
    font-size: 0.60rem;
    letter-spacing: 0.2em;
    color: rgba(0, 255, 255, 0.6);
    text-transform: uppercase;
    line-height: 1;
    display: block;
    font-family: 'Courier New', monospace;
  }

  .value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #ffffff;
    font-family: 'Courier New', monospace;
    line-height: 1.2;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
    display: block;
  }
</style>
