<script lang="ts">
  /**
   * WinPod.svelte — Side win multiplier display
   * Replaces the centre-grid WinBanner overlay.
   * Positioned flush against right edge of frame at vertical centre.
   * win_pod_active.png erupts on win; multiplier text overlaid via CSS.
   */
  import { winMultiplier, winAmount, isSpinning } from '../stores/gameStore'

  // Show active state when there is a win and not spinning
  $: isActive = $winAmount > 0 && !$isSpinning
  $: multiplierText = $winMultiplier > 0
    ? `${$winMultiplier.toFixed(1)}×`
    : ''
</script>

<div class="win-pod" class:active={isActive}>
  <img
    class="pod-img"
    src={isActive
      ? 'assets/ui/win_pod_active.png'
      : 'assets/ui/win_pod_idle.png'}
    alt={isActive ? `Win ${multiplierText}` : ''}
    draggable="false"
  />
  {#if isActive && multiplierText}
    <div class="multiplier-overlay">
      {multiplierText}
    </div>
  {/if}
</div>

<style>
  .win-pod {
    position: absolute;
    right: -110px;        /* flush against right outer edge of frame */
    top: 50%;
    transform: translateY(-50%);
    width: 100px;
    height: 160px;
    z-index: 15;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .pod-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  /* Multiplier text overlaid on win_pod_active.png */
  .multiplier-overlay {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Courier New', monospace;
    font-size: 1.6rem;
    font-weight: 900;
    color: #FFD700;
    text-shadow:
      0 0 20px #FFD700,
      0 0 40px rgba(255, 215, 0, 0.6);
    white-space: nowrap;
    letter-spacing: -0.02em;
  }
</style>
