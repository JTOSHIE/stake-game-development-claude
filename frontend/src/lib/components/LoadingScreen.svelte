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
    background: #0a0a1a;
    z-index: 100;
  }

  .spinner {
    width: 56px;
    height: 56px;
    border: 4px solid rgba(255, 200, 50, 0.2);
    border-top-color: #ffc832;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .label {
    margin-top: 1rem;
    color: #ffc832;
    font-size: 1rem;
    letter-spacing: 0.1em;
    font-family: sans-serif;
  }
</style>
