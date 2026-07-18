<script lang="ts">
  // HeroSplash.svelte — ANIMATION UPLIFT PASS, 2026-07-16, item 1.
  // The animated brand intro built from the locked studio hero emblem
  // (design-system/brand/hero_emblem/, ratified PR #82; bundled here as a
  // palette-compressed 512 copy via scripts/assets/build.py's brand_exports
  // step). Code choreography only - no video, no new tools: three stacked
  // copies of the SAME emblem image, each carrying a different CSS filter
  // (cyan-leaning, magenta-leaning, full colour), flicker in on a stagger so
  // the sign reads as lighting up outer ring first, then wordmarks, then the
  // inner reel - followed by a slow-rotating outer ring (the shared
  // shock_ring particle, reused rather than a bespoke asset), sparse CSS
  // rain streaks, and a soft press-anywhere pulse. First gesture dismisses
  // instantly and, since it's a real pointerdown/keydown, incidentally
  // satisfies App.svelte's existing first-gesture audio warm-up listener
  // with no extra wiring needed.
  import { onMount, createEventDispatcher } from 'svelte'
  import { themeAssets } from '../stores/themeStore'
  import { locale } from '../stores/gameStore'
  import { isSocial } from '../stores/socialMode'
  import { t, type GameMode } from '../i18n/translations'

  const dispatch = createEventDispatcher<{ dismiss: void }>()

  $: base = $themeAssets.assetBase
  $: mode = ($isSocial ? 'social' : 'real') as GameMode

  let reduced = false
  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  interface RainStreak { id: number; left: number; delay: number; dur: number; h: number }
  const RAIN_COUNT = 10
  const rainStreaks: RainStreak[] = Array.from({ length: RAIN_COUNT }, (_, i) => ({
    id: i,
    left: Math.round((i / RAIN_COUNT) * 100 + (Math.random() * 6 - 3)),
    delay: +(Math.random() * 2.2).toFixed(2),
    dur: +(1.1 + Math.random() * 0.8).toFixed(2),
    h: Math.round(60 + Math.random() * 60),
  }))

  let dismissed = false
  function dismiss(): void {
    if (dismissed) return
    dismissed = true
    dispatch('dismiss')
  }
  function handleKey(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault()
      dismiss()
    }
  }
</script>

<div
  class="hero-splash"
  class:reduced
  role="button"
  tabindex="0"
  aria-label={t($locale, 'splashPressAnywhere', mode)}
  data-testid="hero-splash"
  on:click={dismiss}
  on:keydown={handleKey}
>
  {#if !reduced}
    <div class="rain-layer" aria-hidden="true">
      {#each rainStreaks as s (s.id)}
        <span
          class="rain-streak"
          style="left:{s.left}%; height:{s.h}px; animation-delay:{s.delay}s; animation-duration:{s.dur}s;"
        ></span>
      {/each}
    </div>
  {/if}

  <div class="emblem-stage">
    <img class="ring-glow" src="{base}/ui/particles/shock_ring.png" alt="" aria-hidden="true" draggable="false" />
    {#if !reduced}
      <img class="emblem-layer emblem-cyan" src="{base}/ui/hero_emblem_512.png" alt="" aria-hidden="true" draggable="false" />
      <img class="emblem-layer emblem-magenta" src="{base}/ui/hero_emblem_512.png" alt="" aria-hidden="true" draggable="false" />
    {/if}
    <img class="emblem-layer emblem-full" src="{base}/ui/hero_emblem_512.png" alt="We Roll Spinners" draggable="false" />
  </div>

  <div class="press-prompt">{t($locale, 'splashPressAnywhere', mode)}</div>
</div>

<style>
  .hero-splash {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.4rem;
    /* Flat through 42% radius matches the emblem PNG's own solid background
       colour (#080a16, measured during ingest) exactly, so its square
       bounds have no visible seam; only darkens into a vignette beyond
       where the emblem itself sits. */
    background: radial-gradient(circle at 50% 42%, #080a16 0%, #080a16 30%, #05060d 90%, #030309 100%);
    overflow: hidden;
    cursor: pointer;
  }

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
    background: linear-gradient(to bottom, transparent, rgba(150, 220, 255, 0.55), transparent);
    animation-name: rain-fall;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes rain-fall {
    from { transform: translateY(0); }
    to   { transform: translateY(130vh); }
  }

  .emblem-stage {
    position: relative;
    width: min(62vw, 380px);
    aspect-ratio: 1 / 1;
  }

  .ring-glow {
    position: absolute;
    inset: -8%;
    width: 116%;
    height: 116%;
    opacity: 0.55;
    mix-blend-mode: screen;
    animation: ring-rotate 22s linear infinite;
  }
  @keyframes ring-rotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .emblem-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  /* Stage 1: the ring is already the brightest, most cyan part of the mark -
     an unfiltered, high-contrast pass reads as "the ring lighting up" first. */
  .emblem-cyan {
    filter: contrast(1.35) saturate(1.5) brightness(1.25);
    animation: flicker-in 0.5s steps(6, end) 0s both;
  }
  /* Stage 2: hue-rotated toward magenta/purple, where the wordmarks live. */
  .emblem-magenta {
    filter: hue-rotate(130deg) saturate(1.3) brightness(1.1);
    animation: flicker-in 0.5s steps(6, end) 0.4s both;
  }
  /* Stage 3: the true full-colour mark settles in, revealing the chrome
     inner reel last. */
  .emblem-full {
    opacity: 0;
    animation: settle-in 0.6s ease-out 0.85s both;
  }

  @keyframes flicker-in {
    0%   { opacity: 0; }
    15%  { opacity: 0.85; }
    28%  { opacity: 0.15; }
    45%  { opacity: 0.9; }
    60%  { opacity: 0.25; }
    100% { opacity: 0.75; }
  }
  @keyframes settle-in {
    from { opacity: 0; transform: scale(0.97); }
    to   { opacity: 1; transform: scale(1); }
  }

  .press-prompt {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    color: rgba(0, 255, 255, 0.8);
    text-shadow: 0 0 12px rgba(0, 255, 255, 0.6);
    animation: press-pulse 1.8s ease-in-out 1.4s infinite;
  }
  @keyframes press-pulse {
    0%, 100% { opacity: 0.35; }
    50%      { opacity: 0.95; }
  }

  /* Reduced motion: show the full-colour mark immediately, static ring at
     low opacity, no rain, no flicker staging, no press-prompt pulse. */
  .hero-splash.reduced .ring-glow { animation: none; opacity: 0.3; }
  .hero-splash.reduced .emblem-full { animation: none; opacity: 1; }
  .hero-splash.reduced .press-prompt { animation: none; opacity: 0.75; }

  @media (prefers-reduced-motion: reduce) {
    .ring-glow { animation: none; opacity: 0.3; }
    .emblem-cyan, .emblem-magenta { display: none; }
    .emblem-full { animation: none; opacity: 1; }
    .press-prompt { animation: none; opacity: 0.75; }
  }
</style>
