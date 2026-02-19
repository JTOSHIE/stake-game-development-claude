<script lang="ts">
  import { locale } from '../stores/gameStore'
  import { t } from '../i18n/translations'
</script>

<div class="loading-screen">
  <div class="spinner"></div>
  <p class="label">{t($locale, 'loading')}</p>
</div>

<style>
  .loading-screen {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* Loading screen background */
    background-color: #06060f;
    background-image: url('/assets/symbols/bg3_loading_screen_desktop_variant_02.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 100;
  }

  @media (max-width: 480px) {
    .loading-screen {
      background-image: url('/assets/symbols/bg3_loading_screen_mobile_variant_02.png');
    }
  }

  .spinner {
    width: 64px;
    height: 64px;
    border: 4px solid rgba(255, 200, 50, 0.2);
    border-top-color: #ffc832;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    /* Lift above background */
    filter: drop-shadow(0 0 12px rgba(255, 200, 50, 0.6));
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .label {
    margin-top: 1.25rem;
    color: #ffc832;
    font-size: 1rem;
    letter-spacing: 0.12em;
    font-family: sans-serif;
    text-shadow: 0 0 12px rgba(255, 200, 50, 0.8);
  }
</style>
