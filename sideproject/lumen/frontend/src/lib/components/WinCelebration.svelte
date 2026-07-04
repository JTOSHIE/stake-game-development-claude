<script lang="ts">
  // WinCelebration simplified — fullscreen modal removed per R2 brief
  // Big wins (10×+) now handled by WinBanner.svelte (compact top banner)
  // Small wins (< 10×) show a brief non-blocking flash below
  import { onDestroy } from 'svelte'
  import { isSocial } from '../stores/socialMode'

  export let winMultiplier: number = 0

  let visible = false
  let timer: ReturnType<typeof setTimeout> | null = null

  $: {
    if (winMultiplier >= 1 && winMultiplier < 10) {
      clearTimer()
      visible = true
      timer = setTimeout(() => { visible = false }, 1200)
    } else {
      clearTimer()
      visible = false
    }
  }

  function clearTimer(): void {
    if (timer !== null) { clearTimeout(timer); timer = null }
  }

  onDestroy(clearTimer)
</script>

{#if visible}
  <div class="small-win-flash">{$isSocial ? 'PRIZE!' : 'WIN!'}</div>
{/if}

<style>
  .small-win-flash {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
    pointer-events: none;
    font-family: Impact, 'Arial Black', system-ui, sans-serif;
    font-size: clamp(2rem, 6vw, 3.5rem);
    font-weight: 900;
    color: #ffd700;
    text-shadow:
      0 0  8px #fff8c0,
      0 0 18px rgba(255, 215, 0, 1),
      0 0 35px rgba(255, 200, 0, 0.85);
    animation: flash-small 1.0s ease-out forwards;
  }

  @keyframes flash-small {
    0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    25%  { opacity: 1; transform: translate(-50%, -62%) scale(1.15); }
    65%  { opacity: 1; transform: translate(-50%, -70%) scale(1.0); }
    100% { opacity: 0; transform: translate(-50%, -85%) scale(0.8); }
  }
</style>
