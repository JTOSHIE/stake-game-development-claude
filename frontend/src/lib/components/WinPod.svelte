<script lang="ts">
  /**
   * WinPod.svelte — Side win display with transparent LED zones
   * Pod image has two cut-out zones (alpha=0) where CSS text shows through.
   * Zone 1 (top:72, left:50, 99×72): multiplier value
   * Zone 2 (top:192, left:50, 99×72): win amount
   * Hidden when no win is active.
   */
  import { winMultiplier, winAmount, isSpinning } from '../stores/gameStore'

  $: isActive = $winAmount > 0 && !$isSpinning
  $: multText = $winMultiplier > 0 ? `${$winMultiplier.toFixed(1)}×` : ''
  $: amtText  = $winAmount > 0 ? $winAmount.toFixed(2) : ''
</script>

{#if isActive}
  <div class="win-pod">
    <!-- Pod frame image with transparent LED zones -->
    <img
      class="pod-img"
      src="assets/ui/win_pod_v3_active.png"
      alt=""
      draggable="false"
      aria-hidden="true"
    />
    <!-- Zone 1: multiplier text — sits in the transparent cutout -->
    <div class="zone-mult">{multText}</div>
    <!-- Zone 2: win amount text — sits in the transparent cutout -->
    <div class="zone-amt">{amtText}</div>
  </div>
{:else}
  <!-- Idle state: show dim pod, no numbers -->
  <div class="win-pod idle">
    <img
      class="pod-img"
      src="assets/ui/win_pod_v3_idle.png"
      alt=""
      draggable="false"
      aria-hidden="true"
    />
  </div>
{/if}

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

  .win-pod.idle {
    opacity: 0.4;
  }

  .pod-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  /* Zone 1 — MULTIPLIER readout (exact coordinates from Manus QC) */
  .zone-mult {
    position: absolute;
    top: 72px;
    left: 50px;
    width: 99px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1.8rem;
    font-weight: 900;
    color: #00FFFF;
    text-shadow:
      0 0 10px #00FFFF,
      0 0 20px rgba(0, 255, 255, 0.6);
    letter-spacing: 1px;
    white-space: nowrap;
  }

  /* Zone 2 — WIN amount readout (exact coordinates from Manus QC) */
  .zone-amt {
    position: absolute;
    top: 192px;
    left: 50px;
    width: 99px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1.4rem;
    font-weight: 900;
    color: #FF00FF;
    text-shadow:
      0 0 10px #FF00FF,
      0 0 20px rgba(255, 0, 255, 0.6);
    letter-spacing: 1px;
    white-space: nowrap;
  }
</style>
