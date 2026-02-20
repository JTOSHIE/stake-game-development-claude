<script lang="ts">
  // No reactive stores needed — this renders until isLoading clears
</script>

<div class="loading-screen">
  <div class="glow-ring">
    <div class="spinner"></div>
  </div>
  <p class="label">LOADING CYBERNETICS...</p>
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
    /* Subtle pulse so it feels alive */
    animation: pulse 1.6s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    from { opacity: 0.75; }
    to   { opacity: 1; }
  }
</style>
