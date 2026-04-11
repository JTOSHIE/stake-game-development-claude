<script lang="ts">
  /**
   * WinPod.svelte — Side win display pod
   * Shows win_pod_v2_active.png when there is a win.
   * Hidden completely when no win is active.
   * The pod image contains the multiplier and amount baked in.
   * No CSS text overlay needed — image handles all display.
   */
  import { winMultiplier, winAmount, isSpinning } from '../stores/gameStore'

  $: isActive = $winAmount > 0 && !$isSpinning
</script>

{#if isActive}
  <div class="win-pod">
    <img
      class="pod-img"
      src="assets/ui/win_pod_v2_active.png"
      alt="Win"
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
    animation: podGlow 1.5s ease-in-out infinite;
  }

  .pod-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  @keyframes podGlow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.12); }
  }
</style>
