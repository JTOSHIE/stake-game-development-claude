<script lang="ts">
  import { assetLoadProgress } from '../stores/loadingStore'
</script>

<div class="loading-screen">

  <!-- Game logo -->
  <div class="logo-block">
    <div class="logo-title">FUTURE SPINNER</div>
    <div class="logo-subtitle">WE ROLL SPINNERS</div>
  </div>

  <!-- Animated spinner ring -->
  <div class="spinner-ring">
    <div class="ring"></div>
    <div class="ring ring-2"></div>
  </div>

  <!-- Progress bar -->
  <div class="progress-track">
    <div class="progress-fill" style="width: {$assetLoadProgress}%"></div>
  </div>
  <p class="progress-label">LOADING CYBERNETICS... {$assetLoadProgress}%</p>

</div>

<style>
  .loading-screen {
    position: fixed;
    inset: 0;
    background: #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    z-index: 1000;
  }

  /* ── Logo ── */
  .logo-block {
    text-align: center;
    animation: fade-in 0.8s ease both;
  }

  .logo-title {
    font-family: 'Courier New', monospace;
    font-size: clamp(2rem, 6vw, 3.5rem);
    font-weight: 900;
    letter-spacing: 0.15em;
    color: #00ffff;
    text-shadow:
      0 0 20px rgba(0, 255, 255, 0.9),
      0 0 60px rgba(0, 255, 255, 0.4);
    animation: title-glow 2s ease-in-out infinite alternate;
  }

  .logo-subtitle {
    font-family: 'Courier New', monospace;
    font-size: clamp(0.7rem, 2vw, 0.95rem);
    letter-spacing: 0.35em;
    color: #ff00ff;
    text-shadow: 0 0 12px rgba(255, 0, 255, 0.7);
    margin-top: 0.3rem;
    animation: fade-in 1.2s ease 0.3s both;
  }

  /* ── Spinner ring ── */
  .spinner-ring {
    position: relative;
    width: 80px;
    height: 80px;
  }

  .ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: #00ffff;
    border-right-color: rgba(0, 255, 255, 0.3);
    animation: spin 1.2s linear infinite;
  }

  .ring-2 {
    inset: 10px;
    border-top-color: #ff00ff;
    border-right-color: rgba(255, 0, 255, 0.3);
    animation: spin 0.8s linear infinite reverse;
  }

  /* ── Progress bar ── */
  .progress-track {
    width: min(240px, 60vw);
    height: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00ffff, #ff00ff);
    border-radius: 2px;
    transition: width 0.1s linear;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
  }

  .progress-label {
    font-family: 'Courier New', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    color: rgba(0, 255, 255, 0.5);
  }

  /* ── Keyframes ── */
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes title-glow {
    from { text-shadow: 0 0 20px rgba(0,255,255,0.9), 0 0 60px rgba(0,255,255,0.4); }
    to   { text-shadow: 0 0 30px rgba(0,255,255,1),   0 0 80px rgba(0,255,255,0.6); }
  }
</style>
