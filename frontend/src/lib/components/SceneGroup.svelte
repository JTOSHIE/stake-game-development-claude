<script lang="ts">
  // SceneGroup.svelte — scene_character_car export, LAYOUT_SPEC scene group.
  // Set further back (z below the frame) with the car's nose sliding under
  // the frame; gentle CSS idle breathing only (Motion Polish owns real motion).
  import { themeAssets } from '../stores/themeStore'
</script>

<div class="scene-group" data-testid="scene-group" aria-hidden="true">
  <img class="scene-img" src="{$themeAssets.assetBase}/ui/scene_character_car.png" alt="" draggable="false" />
</div>

<style>
  .scene-group {
    position: absolute;
    left: -260px;
    top: 140px;
    width: 1024px;
    height: 560px;
    z-index: 8;
    pointer-events: none;
    animation: idle-breathe 4.5s ease-in-out infinite alternate;
  }

  .scene-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 0 24px rgba(0, 0, 0, 0.5));
  }

  @keyframes idle-breathe {
    from { transform: scale(1); }
    to   { transform: scale(1.015); }
  }

  @media (prefers-reduced-motion: reduce) {
    .scene-group { animation: none; }
  }
</style>
