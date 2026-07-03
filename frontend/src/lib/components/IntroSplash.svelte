<script lang="ts">
  // IntroSplash.svelte — Motion Polish v2 brand screens: the intro splash
  // (DESIGN_SYSTEM "new standard screen"). After load, before play: an
  // Overdrive rules explainer card with a Continue control, localised across
  // all 16 locales with social overrides, shown once per session.
  import { createEventDispatcher } from 'svelte'
  import { locale } from '../stores/gameStore'
  import { isSocial } from '../stores/socialMode'
  import { buyFeatureDisabled } from '../stores/jurisdiction'
  import { playClick } from '../services/soundService'
  import { t, type GameMode } from '../i18n/translations'

  const dispatch = createEventDispatcher<{ continue: void }>()

  $: mode = ($isSocial ? 'social' : 'real') as GameMode

  function handleContinue(): void {
    playClick()
    dispatch('continue')
  }
</script>

<div class="intro-backdrop" role="dialog" aria-modal="true" aria-label={t($locale, 'overdriveFreeSpins', mode)}>
  <div class="intro-card">
    <h2 class="intro-title">{t($locale, 'overdriveFreeSpins', mode)}</h2>
    <ul class="intro-rules">
      <li>{t($locale, 'rulesOverdriveTrigger', mode)}</li>
      <li>{t($locale, 'rulesOverdriveMeter', mode)}</li>
      <li>{t($locale, 'rulesOverdriveRetrigger', mode)}</li>
      {#if !$buyFeatureDisabled}
        <li>{t($locale, 'rulesOverdriveBuy', mode)}</li>
      {/if}
    </ul>
    <button class="intro-continue" on:click={handleContinue} data-testid="intro-continue">
      {t($locale, 'introContinue', mode)}
    </button>
  </div>
</div>

<style>
  .intro-backdrop {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.86);
    backdrop-filter: blur(3px);
    padding: 1rem;
    animation: intro-fade-in 0.35s ease both;
  }

  .intro-card {
    width: min(92vw, 480px);
    padding: 1.8rem 1.6rem;
    border-radius: 14px;
    background: linear-gradient(160deg, #0c0c22 0%, #08081a 100%);
    border: 1px solid rgba(0, 255, 255, 0.3);
    box-shadow: 0 0 40px rgba(0, 255, 255, 0.25), 0 0 0 1px rgba(255, 200, 50, 0.06) inset;
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    text-align: center;
    animation: intro-card-in 0.4s cubic-bezier(0.34, 1.2, 0.4, 1) both;
  }

  .intro-title {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1.2rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    color: var(--theme-primary, #00ffff);
    text-shadow: 0 0 16px currentColor;
  }

  .intro-rules {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 0;
    text-align: left;
  }

  .intro-rules li {
    font-size: 0.82rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.75);
    padding-left: 1rem;
    position: relative;
  }

  .intro-rules li::before {
    content: '›';
    position: absolute;
    left: 0;
    color: rgba(0, 255, 255, 0.7);
  }

  .intro-continue {
    align-self: center;
    padding: 0.7rem 2.4rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-weight: 900;
    letter-spacing: 0.12em;
    font-size: 0.9rem;
    color: #061018;
    background: linear-gradient(135deg, #00ffff, #16f2e0);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    transition: transform 0.1s ease, box-shadow 0.15s ease;
  }
  .intro-continue:hover { box-shadow: 0 0 28px rgba(0, 255, 255, 0.7); }
  .intro-continue:active { transform: scale(0.96); }

  @keyframes intro-fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes intro-card-in { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }

  @media (prefers-reduced-motion: reduce) {
    .intro-backdrop, .intro-card { animation: none; }
  }
</style>
