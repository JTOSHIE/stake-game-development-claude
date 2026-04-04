<script lang="ts">
  import { winMultiplier, isSpinning } from '../stores/gameStore'

  $: show = $winMultiplier > 0 && !$isSpinning
  $: tier = $winMultiplier >= 50 ? 'epic'
          : $winMultiplier >= 10 ? 'big'
          : $winMultiplier >= 2  ? 'medium'
          : 'small'
</script>

{#if show}
  <div class="win-banner tier-{tier}" role="status">
    <span class="win-banner-mult">{$winMultiplier.toFixed(1)}×</span>
    <span class="win-banner-label">WIN</span>
  </div>
{/if}

<style>
  .win-banner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
    text-align: center;
    pointer-events: none;
    animation: banner-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes banner-pop {
    from { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
    to   { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
  }

  .win-banner-mult {
    display: block;
    font-family: 'Courier New', monospace;
    font-weight: 900;
    font-size: clamp(2rem, 6vw, 4rem);
    letter-spacing: 0.05em;
    line-height: 1;
  }

  .win-banner-label {
    display: block;
    font-family: 'Courier New', monospace;
    font-size: clamp(0.6rem, 1.5vw, 0.9rem);
    letter-spacing: 0.4em;
    opacity: 0.8;
    margin-top: 4px;
  }

  /* Colour tiers */
  .tier-small .win-banner-mult {
    color: #ffd700;
    text-shadow: 0 0 20px rgba(255,215,0,0.7);
  }
  .tier-medium .win-banner-mult {
    color: #ffd700;
    text-shadow: 0 0 30px rgba(255,215,0,0.9), 0 0 60px rgba(255,215,0,0.4);
  }
  .tier-big .win-banner-mult {
    color: #ff00ff;
    text-shadow: 0 0 30px rgba(255,0,255,0.9), 0 0 60px rgba(255,0,255,0.5);
  }
  .tier-epic .win-banner-mult {
    color: #00ffff;
    text-shadow: 0 0 40px rgba(0,255,255,1), 0 0 80px rgba(0,255,255,0.6);
  }
</style>
