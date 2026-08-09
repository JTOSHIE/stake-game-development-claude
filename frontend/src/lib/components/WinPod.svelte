<script lang="ts">
  import { winMultiplier, winAmount, isSpinning, currencyCode, locale } from '../stores/gameStore'
  import { formatBalance, CURRENCY_SCALE, formatWin } from '../utils/currency'

  $: isActive = $winAmount > 0 && !$isSpinning
  $: multText = $winMultiplier > 0 ? `${$winMultiplier.toFixed(1)}×` : ''
  // Was `$winAmount.toFixed(2)`, the last money `.toFixed` in frontend/src and the
  // one the analyst track raised as ledger row SA-022. It printed `3750000.00`:
  // no grouping, no currency symbol, in a fixed 99px zone, beside a banner in the
  // same frame that formatted correctly. Bet Replay is the only consumer
  // (ReplayMode.svelte), which is a mandatory approval surface, and a large bet
  // is exactly the input that overflows. Now the one canonical formatter, like
  // every other money readout in the build. QUALITY_CHARTER.md Q-11.
  $: amtText  = $winAmount > 0
    ? formatWin(Math.round($winAmount * CURRENCY_SCALE), $currencyCode || 'USD', $locale)
    : ''
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

  /* Zone 1, MULTIPLIER: top:72 left:50 w:99 h:72 (from Manus QC) */
  .zone-mult {
    position: absolute;
    top: 72px;
    left: 50px;
    width: 99px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--fs-font-numeric);
    font-size: 1.8rem;
    font-weight: 900;
    color: #00FFFF;
    text-shadow: 0 0 10px #00FFFF, 0 0 20px rgba(0,255,255,0.6);
    letter-spacing: 1px;
    white-space: nowrap;
    z-index: 2;
  }

  /* Zone 2, WIN: top:192 left:50 w:99 h:72 (from Manus QC) */
  .zone-amt {
    position: absolute;
    top: 192px;
    left: 50px;
    width: 99px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--fs-font-numeric);
    font-size: 1.4rem;
    font-weight: 900;
    color: #FF00FF;
    text-shadow: 0 0 10px #FF00FF, 0 0 20px rgba(255,0,255,0.6);
    letter-spacing: 1px;
    white-space: nowrap;
    z-index: 2;
  }
</style>
