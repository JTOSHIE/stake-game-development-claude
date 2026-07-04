<script lang="ts">
  // FlameJets.svelte (Opus elevate 2, Task 1) — Overdrive frame-edge jets.
  // Eight fixed nozzles (two per frame side) with a flame sprite that IGNITES
  // on the Overdrive entry, burns for the whole bonus (a CSS steps() sprite
  // loop over jet_flame_sheet.png + a scale-breathe), and extinguishes on exit.
  // Pooled: the eight jet elements are created once and toggled by `active`;
  // the flame is driven entirely by CSS, so there is zero per-frame allocation.
  // prefers-reduced-motion swaps to the static-glow frame with no animation.
  import { onMount } from 'svelte'
  import { themeAssets } from '../stores/themeStore'

  export let active = false

  $: base = $themeAssets.assetBase

  let reduced = false
  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  // Frame is 640x468 at (320,84) in stage coords (LAYOUT_SPEC). Flame points
  // outward from each edge (rot 0 = the sprite's native rightward flame).
  const JETS = [
    { x: 480, y: 84,  rot: -90 }, { x: 800, y: 84,  rot: -90 }, // top edge, up
    { x: 480, y: 552, rot: 90  }, { x: 800, y: 552, rot: 90  }, // bottom edge, down
    { x: 320, y: 224, rot: 180 }, { x: 320, y: 412, rot: 180 }, // left edge, left
    { x: 960, y: 224, rot: 0   }, { x: 960, y: 412, rot: 0   }, // right edge, right
  ]
</script>

<div class="jets" class:active class:reduced aria-hidden="true">
  {#each JETS as j}
    <div class="jet" style="left:{j.x}px; top:{j.y}px; transform: rotate({j.rot}deg) scale(0.55);">
      <div
        class="flame"
        style="background-image: url({base}/ui/{reduced ? 'jet_flame_static' : 'jet_flame_sheet'}.png)"
      ></div>
      <img class="nozzle" src="{base}/ui/jet_nozzle.png" alt="" draggable="false" />
    </div>
  {/each}
</div>

<style>
  /* Frame-edge FX: above the frame (z10), outside the grid so it never
     overlaps symbols; recorded in LAYOUT_SPEC v3.4 z-order. */
  .jets { position: absolute; inset: 0; z-index: 15; pointer-events: none; }

  .jet {
    position: absolute;
    width: 0;
    height: 0;
    transform-origin: 0 0;
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  .jets.active .jet { opacity: 1; }

  .nozzle {
    position: absolute;
    left: -80px;
    top: -80px;
    width: 160px;
    height: 160px;
    display: block;
    filter: drop-shadow(0 0 6px rgba(93, 255, 60, 0.5));
  }

  /* Flame emanates from the nozzle mouth (jet origin) to the right (local). */
  .flame {
    position: absolute;
    left: 6px;
    top: -60px;
    width: 240px;
    height: 120px;
    background-repeat: no-repeat;
    background-size: 1200px 120px;   /* 5 frames x 240 */
    transform-origin: left center;
    opacity: 0;
  }
  .jets.active .flame {
    opacity: 0.95;
    animation:
      flame-cycle 0.42s steps(5) infinite,
      flame-breathe 1.7s ease-in-out infinite;
  }
  /* stagger the flicker so the eight jets do not pulse in unison */
  .jet:nth-child(2n) .flame { animation-delay: -0.13s, -0.5s; }
  .jet:nth-child(3n) .flame { animation-delay: -0.26s, -0.9s; }

  @keyframes flame-cycle {
    from { background-position-x: 0; }
    to   { background-position-x: -1200px; }
  }
  @keyframes flame-breathe {
    0%, 100% { transform: scaleX(0.95); }
    50%      { transform: scaleX(1.07); }
  }

  .jets.reduced .flame { background-size: 240px 120px; background-position: 0 0; }
  .jets.reduced.active .flame { opacity: 0.9; animation: none; }

  @media (prefers-reduced-motion: reduce) {
    .jets.active .flame { animation: none; }
  }
</style>
