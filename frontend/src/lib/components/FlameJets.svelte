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
  // OWNER AUDIT ROUND 2, item 4 (Fable's ruling, contrast law throughout -
  // flame hue at least 90 degrees from the backdrop hue, never green-on-
  // green): the source sprite (jet_flame_sheet.png) is a fixed green asset,
  // recoloured per colourway via CSS filter hue-rotate rather than a second
  // art asset. 'natural' is a no-op (native green, on the standard backdrop,
  // unchanged). 'overdrive' rotates green -> cyan (contrasts the magenta
  // backdrop App.svelte shifts to on Overdrive buy). 'nitro' rotates green
  // -> magenta with a brightness/saturation lift - the sprite's own
  // naturally-lighter flame tips read white-hot against the still-magenta
  // core, so the DOMINANT visible hue (the tips) still contrasts the
  // intensified magenta/pink NITRO backdrop even though the core shares its
  // hue family - this is the explicit "magenta-core white-tipped" brief.
  export let colourway: 'natural' | 'overdrive' | 'nitro' = 'natural'

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
  const XS = JETS.map((j) => j.x)
  const YS = JETS.map((j) => j.y)
  const MIN_X = Math.min(...XS), MAX_X = Math.max(...XS)
  const MIN_Y = Math.min(...YS), MAX_Y = Math.max(...YS)

  // Choreography (item 4): natural keeps the original per-jet flicker
  // (staggered via CSS nth-child, unchanged - see .jet:nth-child rules
  // below). Overdrive and NITRO instead play a directional WAVE - each
  // jet's pulse is delayed by its position along the sweep axis, so the
  // flames visibly light up top-to-bottom (Overdrive) or left-to-right
  // (NITRO) rather than flickering independently.
  function waveDelay(j: { x: number; y: number }): number {
    if (colourway === 'overdrive') {
      const span = MAX_Y - MIN_Y || 1
      return ((j.y - MIN_Y) / span) * 1.1 // slow, synchronised top-to-bottom
    }
    if (colourway === 'nitro') {
      const span = MAX_X - MIN_X || 1
      return ((j.x - MIN_X) / span) * 0.7 // punchier, distinctive left-to-right
    }
    return 0
  }
</script>

<div class="jets colourway-{colourway}" class:active class:reduced aria-hidden="true">
  {#each JETS as j}
    <div
      class="jet"
      style="left:{j.x}px; top:{j.y}px; transform: rotate({j.rot}deg) scale(0.34); --wave-delay:{waveDelay(j)}s;"
    >
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
    filter: drop-shadow(0 0 6px var(--nozzle-glow, rgba(93, 255, 60, 0.5)));
  }
  /* Colourway nozzle glow (item 4) - matches the flame's own recolour. */
  .colourway-natural   .nozzle { --nozzle-glow: rgba(93, 255, 60, 0.5); }
  .colourway-overdrive .nozzle { --nozzle-glow: rgba(60, 235, 255, 0.55); }
  .colourway-nitro     .nozzle { --nozzle-glow: rgba(255, 60, 220, 0.6); }

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
    filter: var(--flame-filter, none);
  }
  /* Colourway recolour (item 4, Fable's ruling): the source sprite is a
     fixed green asset - hue-rotate shifts it per colourway, contrast law
     verified against App.svelte's matching backdrop shift for each. */
  .colourway-natural   .flame { --flame-filter: none; }
  .colourway-overdrive .flame { --flame-filter: hue-rotate(60deg) saturate(1.15); }
  .colourway-nitro     .flame { --flame-filter: hue-rotate(180deg) saturate(1.35) brightness(1.18); }

  .jets.active .flame {
    opacity: 0.95;
    animation: flame-cycle 0.42s steps(5) infinite;
  }
  /* Natural: original per-jet flicker, staggered so the eight jets do not
     breathe in unison (unchanged from the pre-Round-2 behaviour). */
  .colourway-natural.jets.active .flame { animation-name: flame-cycle, flame-breathe; animation-duration: 0.42s, 1.7s; animation-iteration-count: infinite, infinite; animation-timing-function: steps(5), ease-in-out; }
  .colourway-natural .jet:nth-child(2n) .flame { animation-delay: -0.13s, -0.5s; }
  .colourway-natural .jet:nth-child(3n) .flame { animation-delay: -0.26s, -0.9s; }

  /* Overdrive buy: a slow, SYNCHRONISED top-to-bottom pulse - every jet
     plays the identical wave, offset only by --wave-delay (set from each
     jet's y-position in the script). */
  .colourway-overdrive.jets.active .flame {
    animation-name: flame-cycle, flame-pulse-wave;
    animation-duration: 0.42s, 2.2s;
    animation-iteration-count: infinite, infinite;
    animation-timing-function: steps(5), ease-in-out;
    animation-delay: 0s, var(--wave-delay, 0s);
  }

  /* NITRO: a punchier, DISTINCTIVE left-to-right sweeping wave - same
     mechanism, shorter period, delay driven by x-position instead of y. */
  .colourway-nitro.jets.active .flame {
    animation-name: flame-cycle, flame-pulse-wave;
    animation-duration: 0.42s, 1.4s;
    animation-iteration-count: infinite, infinite;
    animation-timing-function: steps(5), ease-in-out;
    animation-delay: 0s, var(--wave-delay, 0s);
  }

  @keyframes flame-cycle {
    from { background-position-x: 0; }
    to   { background-position-x: -1200px; }
  }
  @keyframes flame-breathe {
    0%, 100% { transform: scaleX(0.95); }
    50%      { transform: scaleX(1.07); }
  }
  @keyframes flame-pulse-wave {
    0%, 100% { transform: scaleX(0.92) scaleY(0.96); opacity: 0.8; }
    50%      { transform: scaleX(1.14) scaleY(1.05); opacity: 1; }
  }

  .jets.reduced .flame { background-size: 240px 120px; background-position: 0 0; }
  .jets.reduced.active .flame { opacity: 0.9; animation: none; }

  /* Reduced motion: static glow per colourway (item 4) - no cycle, no wave,
     just the recoloured still frame + nozzle glow above. */
  @media (prefers-reduced-motion: reduce) {
    .jets.active .flame { animation: none; }
  }
</style>
