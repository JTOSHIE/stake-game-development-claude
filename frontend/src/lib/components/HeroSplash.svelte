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
  import { themeAssets, activeTheme } from '../stores/themeStore'
  import { locale } from '../stores/gameStore'
  import { isSocial } from '../stores/socialMode'
  import { t, type GameMode } from '../i18n/translations'
  import RainLayer from './RainLayer.svelte'

  /**
   * Whether the game is ready to be entered.
   *
   * Since 2026-08-09 this splash is the ONLY boot screen and is shown from
   * mount, so it is on screen while the game is still loading. The prompt stays
   * hidden and the tap does nothing until this turns true, because dismissing
   * early would drop the player into a game that is not ready, which is worse
   * than the loading screen this replaced.
   *
   * Defaults true so any caller that does not pass it behaves as before.
   */
  export let ready = true

  /** Falls back to the theme name as text if the logo image fails to load. */
  let logoFailed = false
  /** A tap that arrived before `ready`, waiting to be spent. */
  let pendingDismiss = false

  const dispatch = createEventDispatcher<{ dismiss: void }>()

  $: base = $themeAssets.assetBase
  $: mode = ($isSocial ? 'social' : 'real') as GameMode

  let reduced = false
  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  let dismissed = false
  function dismiss(): void {
    // A TAP IS NEVER SWALLOWED, and the first draft of this got it wrong in a way
    // worth recording. It returned early while `ready` was false, so a tap during
    // the boot floor did nothing at all: the player had to tap twice, and every
    // browser gate that clears this screen by clicking it (lib/dismissOverlays.mjs
    // polls for 2s) was left measuring the splash instead of the game. The scrim,
    // turbo and contrast gates all went red, and they were right to.
    //
    // So an early tap is LATCHED rather than dropped: it is remembered and spends
    // itself the moment `ready` goes true. The player never taps into a dead
    // screen, and never lands in a game that is still loading either.
    if (dismissed) return
    if (!ready) { pendingDismiss = true; return }
    dismissed = true
    dispatch('dismiss')
  }

  // Spends a latched tap. Guarded on `dismissed` so it cannot fire twice.
  $: if (ready && pendingDismiss && !dismissed) {
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

  <!-- THE GAME LOGO, 2026-08-09, and it is the IMAGE rather than text on the
       owner's second ruling of the same day.
       
       The first pass rendered this as text in the brand face, on the reading
       that the chrome logo art was archaic. The owner's clarification was
       narrower than that: the art is fine, it is the SAME logo that sits at the
       top of the game, and the boot screen should use it so the two match. Text
       here would have made the boot screen the only surface in the game not
       using the logo, which is the inconsistency this avoids.
       
       Same asset and same fallback shape as the in-game header in App.svelte:
       if the image fails, the theme name renders as text rather than leaving a
       gap. Opacity-only animation, per splash_calm_gate.mjs. -->
  {#if logoFailed}
    <div class="game-title">{$activeTheme.name}</div>
  {:else}
    <img
      class="game-logo"
      src="{$themeAssets.logo}"
      alt="{$activeTheme.name}"
      draggable="false"
      on:error={() => { logoFailed = true }}
    />
  {/if}

  <div class="emblem-stage">
    <!-- R135: the .ring-glow layer is deleted. It painted ZERO pixels: the emblem drawn on top of
         it is 100% opaque and covers it entirely (inset 0 / 100% against the ring's inset -8% /
         116%), measured as 0 changed pixels against a 35,894 px positive control in the same run.
         The splash is byte-identical without it, and splash_calm_gate asserts geometry, which does
         not change. Widening it to clear the emblem was the alternative and was NOT taken: that is
         a visible change to the boot screen and therefore the owner's call, not a cleanup. -->
    <img class="emblem-layer emblem-full" src="{base}/ui/hero_emblem_512.png" alt="We Roll Spinners" draggable="false" />
  </div>

  <!-- ALWAYS RENDERED, hidden by opacity until ready. A `{#if}` here removed the
       element from layout and the centred column shifted when it reappeared,
       which splash_calm_gate caught as 12.73px of movement on every element at
       Popout S. Opacity changes nothing about geometry, which is the property
       that gate exists to hold. 2026-08-09. -->
  <div class="press-prompt" class:is-ready={ready} aria-hidden={!ready}>
    {t($locale, 'splashPressAnywhere', mode)}
  </div>
</div>

<style>
  .game-logo {
    display: block;
    margin: 0 auto;
    /* Height reserved from BOTH axes so the boot logo cannot reflow the column
       when it finishes loading. 2026-08-09. */
    height: clamp(26px, min(9vw, 11vh), 92px);
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 0 16px rgba(0, 255, 255, 0.6));
    animation: title-fade-in 0.8s ease both;
  }
  @media (prefers-reduced-motion: reduce) {
    .game-logo { animation: none; }
  }

  .game-title {
    font-family: var(--fs-font-numeric);
    font-weight: 900;
    font-size: clamp(1.7rem, 6vw, 3rem);
    letter-spacing: 0.12em;
    line-height: 1.05;
    text-align: center;
    color: #fff;
    text-shadow:
      0 0 18px rgba(0, 255, 255, 0.75),
      0 0 42px rgba(255, 0, 255, 0.45);
    animation: title-fade-in 0.8s ease both;
  }
  @keyframes title-fade-in { from { opacity: 0 } to { opacity: 1 } }
  @media (prefers-reduced-motion: reduce) {
    .game-title { animation: none; }
  }

  .hero-splash {
    z-index: 300;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* Height-aware: Popout S is 400x225, so a fixed 1.4rem gap plus the logo
       plus the emblem overflowed and the centred column re-laid-out as the logo
       image loaded, which splash_calm_gate correctly caught as 20.56px of
       movement on every element. 2026-08-09. */
    gap: clamp(0.4rem, 3vh, 1.4rem);
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
    /* 46vh keeps the emblem inside short viewports. Without it, Popout S
       reserved 248px of emblem in a 225px-tall screen. 2026-08-09. */
    width: min(62vw, 380px, 46vh);
    aspect-ratio: 1 / 1;
  }

  /* R135: the .ring-glow rules and @keyframes emblem-glow-pulse are deleted with the element.
     They were the only consumer of that keyframe. See the note at the markup for the measurement. */
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
    /* Hidden but still occupying its box until ready, so the column never
       reflows. The pulse lives on .is-ready because an opacity keyframe would
       otherwise override this. 2026-08-09. */
    opacity: 0;
  }
  .press-prompt.is-ready {
    /* VISIBLE THE MOMENT IT IS TRUE, not 1.4s later. Corrected 2026-08-10.
       This rule used to add ONLY the animation, and that animation carries a
       1.4s delay, during which the base rule's opacity: 0 still applied. So the
       screen's only instruction was invisible for the 1800ms boot floor PLUS
       1400ms of delay. Measured before the fix: opacity 0 at every sample to
       3200ms, first non-zero at 3200ms. The keyframes start and end at 0.35, so
       setting that here is the animation's own resting value and the pulse
       layers on top without a jump. */
    opacity: 0.35;
    animation: press-pulse 1.8s ease-in-out 1.4s infinite;
  }
  @keyframes press-pulse {
    0%, 100% { opacity: 0.35; }
    50%      { opacity: 0.95; }
  }

  /* Reduced motion is unaffected by this ruling (it never showed the flicker
     staging). The only remaining motion on this screen is the press-prompt
     pulse, which reduced motion still stills. */
  /* SCOPED TO .is-ready, both here and in the media query below. These rules
     were unscoped, and being more specific than the base rule they won even
     before ready: under reduced motion the prompt read TAP TO CONTINUE from
     400ms while the game was still loading, inviting a tap the splash would
     hold until ready. Measured before the fix: opacity 0.75 at every sample
     from 400ms, with is-ready not set until 2000ms. */
  .hero-splash.reduced .press-prompt.is-ready { animation: none; opacity: 0.75; }

  @media (prefers-reduced-motion: reduce) {
    .press-prompt.is-ready { animation: none; opacity: 0.75; }
  }
</style>
