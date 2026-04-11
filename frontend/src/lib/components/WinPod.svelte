<script lang="ts">
  /**
   * WinPod.svelte — Side multiplier/win display (v2)
   * Positioned flush against right outer edge of reel frame.
   * Two LED zones: upper = multiplier, lower = win amount.
   * Uses Orbitron font for premium digital readout appearance.
   */
  import { winMultiplier, winAmount, isSpinning } from '../stores/gameStore'

  $: isActive = $winAmount > 0 && !$isSpinning
  $: multiplierText = $winMultiplier > 0 ? `${$winMultiplier.toFixed(1)}×` : ''
  $: amountText = $winAmount > 0
    ? `${$winAmount.toFixed(2)}`
    : ''
</script>

<div class="win-pod" class:active={isActive}>
  <!-- Background image switches based on win state -->
  <img
    class="pod-bg"
    src={isActive ? 'assets/ui/win_pod_v2_active.png' : 'assets/ui/win_pod_v2_idle.png'}
    alt=""
    draggable="false"
    aria-hidden="true"
  />

  {#if isActive}
    <!-- Upper LED zone — multiplier value -->
    <div class="multiplier-value">{multiplierText}</div>
    <!-- Lower LED zone — win amount -->
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

  .pod-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  /* Upper LED zone — multiplier */
  .multiplier-value {
    position: absolute;
    top: 28%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 2rem;
    font-weight: 900;
    color: #FFD700;
    text-shadow: 0 0 10px #FFD700, 0 0 20px #FFD700;
    letter-spacing: 2px;
    white-space: nowrap;
  }

  /* Lower LED zone — win amount */
  .win-value {
    position: absolute;
    top: 75%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1.4rem;
    font-weight: 900;
    color: #FF00FF;
    text-shadow: 0 0 10px #FF00FF, 0 0 20px #FF00FF;
    letter-spacing: 2px;
    white-space: nowrap;
  }

  /* Active state glow */
  .win-pod.active .pod-bg {
    animation: podGlow 1.5s ease-in-out infinite;
  }

  @keyframes podGlow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.15); }
  }
</style>
