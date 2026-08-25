<script lang="ts">
  // HeroIdle.svelte, the crossed-arms pilot as a living sprite.
  //
  // WHY A FLIPBOOK AND NOT A RIG. R111 articulated the hero out of eleven separate
  // part rasters, which gave real bone motion but only in the pose those parts were
  // drawn in: arms at sides, neutral. The owner's preferred attitude is the crossed
  // arms the game shipped with, and crossed arms cannot be produced from those parts,
  // because the fold is a single baked shape rather than two posable forearms.
  //
  // The art package answers that directly. Its crossed-arms idle strip is the SHIPPED
  // HERO, re-rendered five times: frame 01 has a silhouette IoU of 0.9997 against
  // ui/scene_character.png and a mean RGB difference of 0.90. So playing that strip
  // gives back exactly the attitude the game had, with the sprite now breathing.
  //
  // WHAT MAKES IT WORK. The frames are re-rendered rather than transformed, so the
  // chest, shoulder and visor highlights relight as the body moves. That is why it
  // reads as a body rather than as a picture being nudged: 31 to 42 per cent of the
  // figure's pixels change between adjacent frames, while the head itself travels only
  // 3.8 source pixels. A transform can move a sprite; only a re-render can relight it.
  //
  // FIVE FRAMES, NOT SIX. The kit ships six, but frame 06 is byte-identical to frame
  // 01: it is a closing frame for a linear player, and a duplicate for a looping one.
  // steps(5) over frames 01..05 is the closed loop.
  //
  // The ground line is identical in all five frames, so the feet do not move at all.
  export let assetBase: string

  // 5 frames wide, each the width of the hero box, matching the FlameJets sheet idiom.
  const FRAMES = 5
  const BOX_W = 206
  const BOX_H = 407
</script>

<div
  class="hero-idle"
  aria-hidden="true"
  data-testid="hero-idle"
  style="background-image: url('{assetBase}/ui/hero/hero_crossed_idle_5f.png');
         background-size: {BOX_W * FRAMES}px {BOX_H}px;
         --idle-span: -{BOX_W * FRAMES}px;"
></div>

<style>
  .hero-idle {
    position: absolute;
    inset: 0;
    background-repeat: no-repeat;
    background-position-x: 0;
    /* 4.4s over five frames is 0.88s a frame. The cuts are invisible because the
       most any part of the figure moves between two frames is 1.1 layer px; what
       the eye reads is the relighting, not the step. */
    animation: hero-idle-cycle 4.4s steps(5) infinite;
    /* Matches the flat sprite's own shadow exactly, so the swap does not change
       how the hero sits in the scene. */
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.55));
  }

  /* steps(5) with a -5-frame span lands on 0, -1, -2, -3, -4 frame widths, which is
     frames 01..05 and never the wrapped end value. Same construction as
     FlameJets.svelte's flame-cycle. */
  @keyframes hero-idle-cycle {
    from { background-position-x: 0; }
    to   { background-position-x: var(--idle-span); }
  }

  /* Freeze to frame 01, which IS the shipped hero pose, so the reduced-motion
     presentation is the game's own established still rather than an arbitrary
     stopped frame. */
  @media (prefers-reduced-motion: reduce) {
    .hero-idle {
      animation: none;
      background-position-x: 0;
    }
  }
</style>
