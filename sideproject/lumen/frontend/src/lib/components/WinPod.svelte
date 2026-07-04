<script lang="ts">
  import { winMultiplier, winAmount, isSpinning } from '../stores/gameStore'

  $: isActive = $winAmount > 0 && !$isSpinning
  $: multText = $winMultiplier > 0 ? `${$winMultiplier.toFixed(1)}×` : ''
  $: amtText  = $winAmount > 0 ? $winAmount.toFixed(2) : ''
</script>

{#if isActive}
  <div class="win-pod">
    <img class="pod-img"
      src="assets/ui/win_pod_v3_active.png"
      alt="" draggable="false" aria-hidden="true"
    />
    <div class="zone-mult">{multText}</div>
    <div class="zone-amt">{amtText}</div>
  </div>
{:else}
  <div class="win-pod idle">
    <img class="pod-img"
      src="assets/ui/win_pod_v3_idle.png"
      alt="" draggable="false" aria-hidden="true"
    />
  </div>
{/if}

<style>
  .win-pod {
    position: absolute;   /* MUST be absolute relative to .grid-wrapper */
    right: -220px;
    top: 50%;
    transform: translateY(-50%);
    width: 200px;
    height: 320px;
    z-index: 50;
    pointer-events: none;
    /* Note: we use position:absolute for placement but the children
       with absolute positioning use the nearest positioned ancestor.
       Since .win-pod is position:absolute it IS a containing block. */
  }

  .win-pod.idle {
    opacity: 0.35;
  }

  /* The pod is a decorative side panel that sits to the right of the grid.
     In portrait viewports the scale-to-fit factor is width-bound, so the pod
     would extend past the right edge and be clipped. Hide it there. The win
     amount is still shown in WinDisplay, and the pod is position:absolute so
     hiding it does not affect the grid centring. It stays visible at the
     landscape popout (400x225, 800x450) and desktop (1200x675) sizes. */
  @media (orientation: portrait) {
    .win-pod {
      display: none;
    }
  }

  .pod-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  /* Zone 1 — MULTIPLIER: top:72 left:50 w:99 h:72 (from Manus QC) */
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
    text-shadow: 0 0 10px #00FFFF, 0 0 20px rgba(0,255,255,0.6);
    letter-spacing: 1px;
    white-space: nowrap;
    z-index: 2;
  }

  /* Zone 2 — WIN: top:192 left:50 w:99 h:72 (from Manus QC) */
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
    text-shadow: 0 0 10px #FF00FF, 0 0 20px rgba(255,0,255,0.6);
    letter-spacing: 1px;
    white-space: nowrap;
    z-index: 2;
  }
</style>
