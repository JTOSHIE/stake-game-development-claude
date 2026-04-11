<script lang="ts">
  /**
   * WinPod.svelte — Side multiplier/win display (v2)
   * Pod frame image kept as decorative border.
   * Dark background strips painted over baked-in numbers.
   * Orbitron CSS text renders on top — single source of truth.
   */
  import { winMultiplier, winAmount, isSpinning } from '../stores/gameStore'

  $: isActive = $winAmount > 0 && !$isSpinning
  $: multiplierText = $winMultiplier > 0 ? `${$winMultiplier.toFixed(1)}×` : ''
  $: amountText = $winAmount > 0
    ? `${$winAmount.toFixed(2)}`
    : ''
</script>

<div class="win-pod" class:active={isActive}>
  <!-- Pod frame image — decorative border only -->
  <!-- overflow:hidden on .pod-frame clips the baked-in number zone -->
  <div class="pod-frame">
    <img
      class="pod-bg"
      src={isActive ? 'assets/ui/win_pod_v2_active.png' : 'assets/ui/win_pod_v2_idle.png'}
      alt=""
      draggable="false"
      aria-hidden="true"
    />
  </div>

  <!-- Our CSS text — positioned OVER the image -->
  {#if isActive}
    <div class="multiplier-value">{multiplierText}</div>
    <div class="win-value">{amountText}</div>
  {/if}
</div>

<style>
  .win-pod {
    position: absolute;
    right: -220px;
    top: 50%;
    transform: translateY(-50%);
    width: 200px;
    height: 320px;
    z-index: 50;
    pointer-events: none;
  }

  .pod-frame {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .pod-bg {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  /* Upper LED zone — covers baked-in multiplier zone with our text */
  .multiplier-value {
    position: absolute;
    top: 28%;
    left: 0;
    right: 0;
    text-align: center;
    transform: translateY(-50%);
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 2.4rem;
    font-weight: 900;
    color: #FFD700;
    text-shadow:
      0 0 0 #1a1a00,
      0 0 0 #1a1a00,
      0 0 10px #FFD700,
      0 0 20px #FFD700;
    letter-spacing: 2px;
    white-space: nowrap;
    /* Dark background stripe to cover baked-in number */
    background: rgba(10, 8, 0, 0.95);
    padding: 4px 8px;
    border-radius: 4px;
    margin: 0 16px;
  }

  /* Lower LED zone — covers baked-in win amount zone */
  .win-value {
    position: absolute;
    top: 75%;
    left: 0;
    right: 0;
    text-align: center;
    transform: translateY(-50%);
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1.6rem;
    font-weight: 900;
    color: #FF00FF;
    text-shadow:
      0 0 10px #FF00FF,
      0 0 20px #FF00FF;
    letter-spacing: 2px;
    white-space: nowrap;
    /* Dark background stripe to cover baked-in text */
    background: rgba(10, 0, 12, 0.95);
    padding: 4px 8px;
    border-radius: 4px;
    margin: 0 16px;
  }

  /* Active state glow on the pod frame */
  .win-pod.active .pod-bg {
    animation: podGlow 1.5s ease-in-out infinite;
  }

  @keyframes podGlow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.15); }
  }
</style>
