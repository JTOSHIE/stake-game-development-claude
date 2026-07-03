<script lang="ts">
  // LoadingScreen.svelte — Motion Polish v2 brand screens: the WRS standard
  // loading screen. The brand mark (a neon chrome rim) renders large with its
  // inner five-fold blade layer spinning continuously as the loader itself;
  // WE ROLL SPINNERS wordmark above in CSS Orbitron, the active theme's game
  // logo below. DESIGN_SYSTEM: "the rim spinning as the loader, the WE ROLL
  // SPINNERS wordmark above, the game logo slot beneath" — every WRS title.
  import { assetLoadProgress } from '../stores/loadingStore'
  import { themeAssets } from '../stores/themeStore'
</script>

<div class="loading-screen">

  <div class="wordmark">WE ROLL SPINNERS</div>

  <div class="brand-mark" aria-hidden="true">
    <img class="brand-base" src="{$themeAssets.assetBase}/ui/brand_mark_base.png" alt="" draggable="false" />
    <img class="brand-spin" src="{$themeAssets.assetBase}/ui/brand_mark_spin.png" alt="" draggable="false" />
  </div>

  <div class="logo-block">
    <img
      src="{$themeAssets.logo}"
      class="loading-logo"
      alt=""
      draggable="false"
    />
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
    gap: 1.1rem;
    z-index: 1000;
  }

  .wordmark {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-weight: 900;
    font-size: clamp(1rem, 3.2vw, 1.6rem);
    letter-spacing: 0.32em;
    color: #fff;
    text-shadow: 0 0 14px rgba(0, 255, 255, 0.6), 0 0 30px rgba(255, 0, 255, 0.35);
    animation: fade-in 0.8s ease both;
  }

  /* ── Brand mark — the rim spinning as the loader ─────────────────────── */
  .brand-mark {
    position: relative;
    width: clamp(140px, 24vw, 220px);
    height: clamp(140px, 24vw, 220px);
    filter: drop-shadow(0 0 24px rgba(0, 255, 255, 0.5)) drop-shadow(0 0 40px rgba(255, 0, 255, 0.3));
  }
  .brand-base, .brand-spin {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .brand-spin {
    animation: brand-spin 2.6s linear infinite;
    transform-origin: 50% 50%;
  }
  @keyframes brand-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Game logo slot ───────────────────────────────────────────────────── */
  .logo-block {
    text-align: center;
    animation: fade-in 0.8s 0.15s ease both;
  }
  .loading-logo {
    height: clamp(56px, 10vw, 96px);
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 0 16px rgba(0, 255, 255, 0.6));
  }

  /* ── Progress bar ── */
  .progress-track {
    width: min(240px, 60vw);
    height: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 0.4rem;
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
    font-variant-numeric: tabular-nums;
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .brand-spin { animation-duration: 8s; }
  }
</style>
