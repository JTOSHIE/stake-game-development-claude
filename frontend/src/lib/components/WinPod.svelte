<script lang="ts">
  /**
   * WinPod.svelte — Side win display (fully dynamic, CSS-only numbers)
   * Works exactly like BalanceDisplay — no baked-in values.
   * Pod frame image is decorative border only.
   * Hidden completely when no win is active.
   */
  import { winMultiplier, winAmount, isSpinning } from '../stores/gameStore'

  $: isActive   = $winAmount > 0 && !$isSpinning
  $: multText   = $winMultiplier > 0 ? `${$winMultiplier.toFixed(1)}×` : '—'
  $: amtText    = $winAmount > 0 ? $winAmount.toFixed(2) : '0.00'
</script>

{#if isActive}
  <div class="win-pod">
    <!-- Decorative outer frame image — no numbers in this zone -->
    <img
      class="pod-frame"
      src="assets/ui/win_pod_v2_active.png"
      alt=""
      draggable="false"
      aria-hidden="true"
    />

    <!-- Dynamic content — pure CSS, same as balance panel -->
    <div class="pod-content">
      <div class="pod-label">MULTIPLIER</div>
      <div class="pod-mult">{multText}</div>
      <div class="pod-divider"></div>
      <div class="pod-label">WIN</div>
      <div class="pod-amt">{amtText}</div>
    </div>
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

  /* Decorative frame — covers entire pod area */
  .pod-frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  /* Dynamic content sits on top of the frame image */
  .pod-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 24px 12px;
  }

  .pod-label {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.25em;
    color: rgba(0, 255, 255, 0.7);
    text-transform: uppercase;
    text-shadow: 0 0 6px rgba(0, 255, 255, 0.5);
  }

  .pod-mult {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 2.4rem;
    font-weight: 900;
    color: #FFD700;
    text-shadow:
      0 0 10px #FFD700,
      0 0 20px rgba(255, 215, 0, 0.6);
    letter-spacing: 2px;
    line-height: 1;
  }

  .pod-divider {
    width: 70%;
    height: 2px;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 0, 255, 0.6),
      transparent
    );
    margin: 4px 0;
  }

  .pod-amt {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1.9rem;
    font-weight: 900;
    color: #FF00FF;
    text-shadow:
      0 0 10px #FF00FF,
      0 0 20px rgba(255, 0, 255, 0.6);
    letter-spacing: 2px;
    line-height: 1;
  }
</style>
