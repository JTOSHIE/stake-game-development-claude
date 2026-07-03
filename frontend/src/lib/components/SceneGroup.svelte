<script lang="ts">
  // SceneGroup.svelte — scene_character_car export, LAYOUT_SPEC scene group.
  // Set further back (z below the frame) with the car's nose sliding under
  // the frame. Motion Polish v2 scene life: slow underglow pulse near the
  // hover pads, a faint booster flicker, gentle character breathing (base)
  // and an occasional visor glint — all subtle, never competing with the reels.
  import { themeAssets } from '../stores/themeStore'
</script>

<div class="scene-group" data-testid="scene-group" aria-hidden="true">
  <img class="scene-img" src="{$themeAssets.assetBase}/ui/scene_character_car.png" alt="" draggable="false" />
  <div class="underglow" aria-hidden="true"></div>
  <div class="booster-flicker" aria-hidden="true"></div>
  <div class="visor-glint" aria-hidden="true"></div>
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

  /* Car underglow — slow pulse near the hover pads at the base of the car */
  .underglow {
    position: absolute;
    left: 8%;
    bottom: 12%;
    width: 62%;
    height: 10%;
    background: radial-gradient(ellipse at center, rgba(0, 220, 255, 0.35) 0%, rgba(0, 220, 255, 0.08) 55%, transparent 80%);
    animation: underglow-pulse 3.6s ease-in-out infinite;
    filter: blur(2px);
  }
  @keyframes underglow-pulse {
    0%, 100% { opacity: 0.55; }
    50%      { opacity: 1; }
  }

  /* Booster — faint flicker near the rear light accent */
  .booster-flicker {
    position: absolute;
    left: 2%;
    bottom: 30%;
    width: 6%;
    height: 6%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(120, 255, 160, 0.9) 0%, rgba(120, 255, 160, 0.2) 60%, transparent 80%);
    animation: booster-flicker 2.1s steps(6, jump-none) infinite;
  }
  @keyframes booster-flicker {
    0%, 100% { opacity: 0.25; }
    15%      { opacity: 0.7; }
    30%      { opacity: 0.3; }
    45%      { opacity: 0.8; }
    60%      { opacity: 0.35; }
    75%      { opacity: 0.6; }
  }

  /* Character visor — occasional glint sweep over the head/visor area */
  .visor-glint {
    position: absolute;
    left: 44%;
    top: 24%;
    width: 12%;
    height: 8%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(200, 240, 255, 0.3) 45%, transparent 75%);
    opacity: 0;
    animation: visor-glint 6s ease-in-out infinite;
  }
  @keyframes visor-glint {
    0%, 92%, 100% { opacity: 0; }
    94%            { opacity: 0.8; }
    96%            { opacity: 0.1; }
    98%            { opacity: 0.6; }
  }

  @media (prefers-reduced-motion: reduce) {
    .scene-group, .underglow, .booster-flicker, .visor-glint {
      animation: none;
    }
    .underglow { opacity: 0.6; }
    .visor-glint { opacity: 0; }
  }
</style>
