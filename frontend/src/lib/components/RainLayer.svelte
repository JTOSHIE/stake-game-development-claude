<script lang="ts">
  // RainLayer.svelte — OWNER AUDIT REMEDIATION C1.
  // Extracted from HeroSplash.svelte's own CSS rain streaks (ANIMATION
  // UPLIFT PASS 2026-07-16) so the same effect can be ported into the
  // in-game backdrop at a different density/opacity without duplicating
  // the streak-generation logic. Fully CSS-driven (no canvas/SVG), gated
  // by prefers-reduced-motion both here (skip rendering) and via a CSS
  // media query fallback, same belt-and-suspenders pattern as the splash.
  import { onMount } from 'svelte'

  export let count = 10
  export let opacity = 0.55
  // Scopes the CSS keyframe/class names so this component can be mounted
  // twice on one page (splash + backdrop) without one instance's animation
  // rules clobbering the other's - Svelte scopes the <style> block per
  // component instance automatically, so this is actually already safe;
  // kept as an explicit prop anyway for callers that want visibly distinct
  // markup in devtools.
  export let variant = 'default'

  interface RainStreak { id: number; left: number; delay: number; dur: number; h: number }

  let reduced = false
  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  $: rainStreaks = Array.from({ length: count }, (_, i): RainStreak => ({
    id: i,
    left: Math.round((i / count) * 100 + (Math.random() * 6 - 3)),
    delay: +(Math.random() * 2.2).toFixed(2),
    dur: +(1.1 + Math.random() * 0.8).toFixed(2),
    h: Math.round(60 + Math.random() * 60),
  }))
</script>

{#if !reduced}
  <div class="rain-layer" data-variant={variant} aria-hidden="true" style="--rain-opacity: {opacity}">
    {#each rainStreaks as s (s.id)}
      <span
        class="rain-streak"
        style="left:{s.left}%; height:{s.h}px; animation-delay:{s.delay}s; animation-duration:{s.dur}s;"
      ></span>
    {/each}
  </div>
{/if}

<style>
  .rain-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .rain-streak {
    position: absolute;
    top: -120px;
    width: 1.5px;
    background: linear-gradient(to bottom, transparent, rgba(150, 220, 255, var(--rain-opacity, 0.55)), transparent);
    animation-name: rain-fall;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes rain-fall {
    from { transform: translateY(0); }
    to   { transform: translateY(130vh); }
  }
  @media (prefers-reduced-motion: reduce) {
    .rain-layer { display: none; }
  }
</style>
