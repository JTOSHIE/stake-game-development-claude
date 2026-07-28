<script lang="ts">
  // HeroSplash.svelte, the brand intro, built from the locked studio hero
  // emblem (design-system/brand/hero_emblem/, ratified PR #82; bundled here as
  // a palette-compressed 512 copy via scripts/assets/build.py's brand_exports
  // step).
  //
  // OWNER AUDIT ROUND 4, item 2 (owner ruling, 2026-07-26): the neon power-on
  // flicker sequence is REMOVED. It stacked three copies of the same emblem
  // (cyan-leaning, magenta-leaning, full colour) and stepped their opacity in
  // on a stagger via `flicker-in 0.5s steps(6, end)`. The stepped opacity is
  // what made it read as flashing squares rather than a sign lighting up.
  //
  // The splash is now the STATIC hero emblem over the existing backdrop, with
  // the rain layer and one gentle steady glow. One emblem image, no filters, no
  // staging, no stepped animation anywhere.
  //
  // Unchanged on purpose: tap-anywhere dismissal, which is a real
  // pointerdown/keydown and therefore still satisfies App.svelte's first-gesture
  // audio warm-up listener with no extra wiring; and the reduced-motion
  // behaviour, which already showed the static full-colour mark and is now
  // simply what everyone gets.
  import { onMount, createEventDispatcher } from 'svelte'
  import { themeAssets } from '../stores/themeStore'
  import { locale } from '../stores/gameStore'
  import { isSocial } from '../stores/socialMode'
  import { t, type GameMode } from '../i18n/translations'
  import RainLayer from './RainLayer.svelte'

  const dispatch = createEventDispatcher<{ dismiss: void }>()

  $: base = $themeAssets.assetBase
  $: mode = ($isSocial ? 'social' : 'real') as GameMode

  let reduced = false
  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

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
  class="hero-splash fs-scrim"
  class:reduced
  role="button"
  tabindex="0"
  aria-label={t($locale, 'splashPressAnywhere', mode)}
  data-testid="hero-splash"
  on:click={dismiss}
  on:keydown={handleKey}
>
  <RainLayer count={10} opacity={0.55} variant="splash" />

  <div class="emblem-stage">
    <img class="ring-glow" src="{base}/ui/particles/shock_ring.png" alt="" aria-hidden="true" draggable="false" />
    <img class="emblem-layer emblem-full" src="{base}/ui/hero_emblem_512.png" alt="We Roll Spinners" draggable="false" />
  </div>

  <div class="press-prompt">{t($locale, 'splashPressAnywhere', mode)}</div>
</div>

<style>
  .hero-splash {
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
    opacity: 0.42;
    mix-blend-mode: screen;
    /* Gentle steady glow. The 22s rotation is gone with the flicker sequence:
       the owner ruling asks for a static mark with a steady glow, and a slowly
       rotating ring behind a static emblem reads as drift, not calm.

       FS VISUAL FIXPACK JOB 1 (2026-07-27): the ruling for this pass is "logo
       sitting still with its gentle pulse", so the steady glow now breathes.
       OPACITY only, matching the loader's filter pulse: the emblem itself does
       not move, does not scale and does not rotate, and splash_calm_gate.mjs
       asserts its box is identical across every sample of a ten-second window.
       A scale pulse would have made that assertion impossible to state. */
    animation: emblem-glow-pulse 3.2s ease-in-out infinite;
  }
  @keyframes emblem-glow-pulse {
    0%, 100% { opacity: 0.34; }
    50%      { opacity: 0.52; }
  }

  .emblem-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  /* The mark is static and full-colour from first paint. No filtered duplicate
     layers, no staged reveal, no stepped opacity. */
  .emblem-full {
    opacity: 1;
  }

  .press-prompt {
    font-family: var(--fs-font-numeric);
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

  /* Reduced motion is unaffected by this ruling (it never showed the flicker
     staging). The only remaining motion on this screen is the press-prompt
     pulse, which reduced motion still stills. */
  .hero-splash.reduced .ring-glow { animation: none; opacity: 0.3; }
  .hero-splash.reduced .press-prompt { animation: none; opacity: 0.75; }

  @media (prefers-reduced-motion: reduce) {
    .ring-glow { animation: none; opacity: 0.3; }
    .press-prompt { animation: none; opacity: 0.75; }
  }
</style>
