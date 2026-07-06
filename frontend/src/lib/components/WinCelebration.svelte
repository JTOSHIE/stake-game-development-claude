<script lang="ts">
  // WinCelebration simplified - fullscreen modal removed per R2 brief
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
  /* ── 5 signature tokens (canonical, from CHROME_PRIMITIVES.md) ─────────── */
  .small-win-flash {
    --sig-cyan: var(--theme-primary, #00FFFF);
    --sig-magenta: var(--theme-secondary, #FF00FF);
    --sig-pink: #FF2EC4;
    --sig-gold: #FFD700;
    --sig-orange: #FF9A2E;
    --sig-green: #4EFF91;
    --acc: var(--sig-cyan);
    --acc2: var(--sig-pink);

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
    pointer-events: none;
    font-family: 'Orbitron', system-ui, sans-serif;
    font-size: clamp(2rem, 6vw, 3.5rem);
    font-weight: 900;
    color: #f4fbff;
    text-shadow:
      0 0  3px var(--acc),
      0 0 18px color-mix(in srgb, var(--acc) 85%, transparent),
      0 0 35px color-mix(in srgb, var(--acc) 55%, transparent);
    animation: flash-small 1.0s ease-out forwards;
  }

  @keyframes flash-small {
    0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    25%  { opacity: 1; transform: translate(-50%, -62%) scale(1.15); }
    65%  { opacity: 1; transform: translate(-50%, -70%) scale(1.0); }
    100% { opacity: 0; transform: translate(-50%, -85%) scale(0.8); }
  }

  @media (prefers-reduced-motion: reduce) {
    .small-win-flash { animation: none; }
  }
</style>
