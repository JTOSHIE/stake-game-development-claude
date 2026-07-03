<script lang="ts">
  // FeatureButton.svelte — LAYOUT_SPEC FEATURE control. The Grille export
  // carries the button face (no plate box); opens the existing buy confirm
  // flow (BuyBonus.svelte, mounted with showTrigger={false} in App.svelte).
  // Hidden entirely where the jurisdiction disables feature buys.
  import { createEventDispatcher } from 'svelte'
  import { locale, isSpinning } from '../stores/gameStore'
  import { isSocial } from '../stores/socialMode'
  import { buyFeatureDisabled } from '../stores/jurisdiction'
  import { themeAssets } from '../stores/themeStore'
  import { t, type GameMode } from '../i18n/translations'

  const dispatch = createEventDispatcher<{ open: void }>()

  $: mode = ($isSocial ? 'social' : 'real') as GameMode
  $: label = t($locale, 'buyFeature', mode)

  function handleClick() {
    if (!$isSpinning) dispatch('open')
  }
</script>

{#if !$buyFeatureDisabled}
  <div class="feature-group" data-testid="feature-button">
    <button
      class="feature-btn"
      on:click={handleClick}
      disabled={$isSpinning}
      aria-label={label}
    >
      <img src="{$themeAssets.assetBase}/ui/feature_button.png" alt="" draggable="false" />
    </button>
    <div class="feature-label">{label}</div>
  </div>
{/if}

<style>
  /* Beside the frame upper left, just above and right of the character */
  .feature-group {
    position: absolute;
    left: 170px;
    top: 30px;
    width: 128px;
    z-index: 60;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .feature-btn {
    width: 128px;
    height: 128px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: transform 0.12s ease, filter 0.15s ease;
  }
  .feature-btn img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 0 10px rgba(138, 92, 255, 0.4));
  }
  .feature-btn:hover:not(:disabled) {
    transform: scale(1.04);
    filter: brightness(1.15);
  }
  .feature-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .feature-label {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #cbb4ff;
    text-shadow: 0 0 8px rgba(138, 92, 255, 0.7);
    text-align: center;
    white-space: nowrap;
  }
</style>
