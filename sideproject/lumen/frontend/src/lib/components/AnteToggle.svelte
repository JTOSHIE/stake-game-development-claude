<script lang="ts">
  // AnteToggle.svelte — Ante / Double-Chance switch. When on, ordinary spins
  // are placed in the maths 'ante' mode: cost 1.5x for ~2x the free-spin trigger
  // rate (server applies the mode cost). Not a buy: the reels still spin
  // normally. Cyan treatment distinguishes it from the magenta Bonus Buy.
  // Temporary CSS treatment (final art in AssetForge v2). Strings localised.
  import { anteEnabled, ANTE_COST, toggleAnte } from '../stores/betMode'
  import { betAmount, currencyCode, isSpinning, locale } from '../stores/gameStore'
  import { isSocial } from '../stores/socialMode'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { t, type GameMode } from '../i18n/translations'

  $: mode = ($isSocial ? 'social' : 'real') as GameMode
  $: extraMicros = Math.round($betAmount * (ANTE_COST - 1) * CURRENCY_SCALE)
  $: extraLabel = formatBalance(extraMicros, $currencyCode || 'USD')

  function toggle() {
    if ($isSpinning) return
    toggleAnte()
  }
</script>

<button
  class="ante-toggle"
  class:on={$anteEnabled}
  on:click={toggle}
  disabled={$isSpinning}
  role="switch"
  aria-checked={$anteEnabled}
  aria-label={t($locale, 'anteLabel', mode)}
  data-testid="ante-toggle"
>
  <span class="ante-lamp" aria-hidden="true"></span>
  <span class="ante-text">
    <span class="ante-title">{t($locale, 'anteLabel', mode)}</span>
    <span class="ante-sub">{t($locale, 'anteHint', mode)} · +{extraLabel}</span>
  </span>
  <span class="ante-state" aria-hidden="true">{$anteEnabled ? 'ON' : 'OFF'}</span>
</button>

<style>
  .ante-toggle {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 7px 14px; border-radius: 10px; cursor: pointer;
    background: linear-gradient(160deg, #08221f, #061018);
    border: 1px solid rgba(0, 255, 255, 0.35);
    color: rgba(0, 255, 255, 0.85);
    font-family: 'Orbitron', sans-serif; letter-spacing: 0.04em;
    transition: box-shadow 0.2s, border-color 0.2s, opacity 0.2s;
  }
  .ante-toggle:disabled { opacity: 0.5; cursor: default; }
  .ante-toggle.on {
    border-color: #00ffff;
    box-shadow: 0 0 14px rgba(0, 255, 255, 0.4), inset 0 0 12px rgba(0, 255, 255, 0.12);
    color: #aefcff;
  }
  .ante-lamp {
    width: 12px; height: 12px; border-radius: 50%;
    background: rgba(0, 255, 255, 0.18);
    box-shadow: inset 0 0 0 1px rgba(0, 255, 255, 0.4);
    transition: background 0.2s, box-shadow 0.2s;
  }
  .ante-toggle.on .ante-lamp {
    background: #00ffff;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.9);
  }
  .ante-text { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.15; }
  .ante-title { font-size: 0.78rem; font-weight: 700; }
  .ante-sub { font-size: 0.6rem; opacity: 0.75; }
  .ante-state {
    margin-left: 2px; font-size: 0.72rem; font-weight: 900;
    font-variant-numeric: tabular-nums; letter-spacing: 0.08em;
  }

  @media (prefers-reduced-motion: reduce) {
    .ante-toggle, .ante-lamp { transition: none; }
  }
</style>
