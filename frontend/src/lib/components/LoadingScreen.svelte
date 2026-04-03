<script lang="ts">
  import { assetLoadProgress } from '../stores/loadingStore'
</script>

<div class="loading-screen">
  <div class="glow-ring">
    <div class="spinner"></div>
  </div>
  <p class="label">LOADING CYBERNETICS...</p>

  <div class="progress-bar-track">
    <div class="progress-bar-fill" style="width: {$assetLoadProgress}%"></div>
  </div>
  <p class="progress-label">{$assetLoadProgress}%</p>
</div>

<style>
  .loading-screen {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(13, 13, 31, 0.95);
  }

  /* Outer ambient glow ring so the spinner looks embedded in neon light */
  .glow-ring {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      0 0 24px rgba(255, 200, 50, 0.35),
      0 0 60px rgba(255, 150, 0, 0.18);
  }

  .spinner {
    width: 64px;
    height: 64px;
    border: 4px solid rgba(255, 200, 50, 0.15);
    border-top-color: #ffc832;
    border-right-color: rgba(255, 200, 50, 0.55);
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
    filter: drop-shadow(0 0 10px rgba(255, 200, 50, 0.75));
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .label {
    margin-top: 1.5rem;
    color: #ffc832;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.28em;
    font-family: 'Courier New', monospace;
    text-transform: uppercase;
    text-shadow:
      0 0 10px rgba(255, 200, 50, 0.9),
      0 0 24px rgba(255, 150, 0, 0.5);
    animation: pulse 1.6s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    from { opacity: 0.75; }
    to   { opacity: 1; }
  }

  .progress-bar-track {
    margin-top: 1.2rem;
    width: 180px;
    height: 4px;
    background: rgba(255, 200, 50, 0.15);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #ffc832, #ff8c00);
    border-radius: 2px;
    transition: width 0.1s linear;
    box-shadow: 0 0 8px rgba(255, 200, 50, 0.7);
  }

  .progress-label {
    margin-top: 0.4rem;
    color: rgba(255, 200, 50, 0.6);
    font-size: 0.7rem;
    font-family: 'Courier New', monospace;
    letter-spacing: 0.15em;
  }
</style>
