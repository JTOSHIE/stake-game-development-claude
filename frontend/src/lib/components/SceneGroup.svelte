<script lang="ts">
  // SceneGroup.svelte — scene_character_car export, LAYOUT_SPEC scene group.
  // Set further back (z below the frame) with the car's nose sliding under the
  // frame. Scene life (all subtle, never competing with the reels): a slow
  // HOVER BOB on the whole rig (it is a hover car), a pulsing cyan underglow at
  // the hover pads, a magenta pulse travelling the car's neon side lines, an
  // orange antenna-light blink, a faint rear booster flicker, gentle breathing
  // and an occasional visor glint.
  import { themeAssets } from '../stores/themeStore'
</script>

<div class="scene-group" data-testid="scene-group" aria-hidden="true">
  <div class="scene-hover">
    <img class="scene-img" src="{$themeAssets.assetBase}/ui/scene_character_car.png" alt="" draggable="false" />
    <div class="underglow" aria-hidden="true"></div>
    <!-- Hover-pad turbines — the car's ground contacts spin (its 'wheels'). -->
    <div class="hover-swirl front" aria-hidden="true"></div>
    <div class="hover-swirl rear" aria-hidden="true"></div>
    <div class="car-neon" aria-hidden="true"></div>
    <div class="booster-flicker" aria-hidden="true"></div>
    <div class="antenna-light" aria-hidden="true"></div>
    <div class="visor-glint" aria-hidden="true"></div>
  </div>
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
  }

  /* Hover bob — the whole rig floats, reinforcing the hover car; a touch of
     scale gives a gentle breathe on top. */
  .scene-hover {
    position: absolute;
    inset: 0;
    transform-origin: 50% 85%;
    animation: scene-hover 5s ease-in-out infinite;
  }
  @keyframes scene-hover {
    0%, 100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-8px) scale(1.012); }
  }

  .scene-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 0 24px rgba(0, 0, 0, 0.5));
  }

  /* Car underglow — cyan pulse at the hover pads under the car; breathes in
     counter-phase to the bob so the lift reads as pad thrust. */
  .underglow {
    position: absolute;
    left: 6%;
    bottom: 9%;
    width: 66%;
    height: 12%;
    background: radial-gradient(ellipse at center, rgba(0, 220, 255, 0.45) 0%, rgba(0, 220, 255, 0.12) 52%, transparent 78%);
    animation: underglow-pulse 5s ease-in-out infinite;
    filter: blur(3px);
  }
  @keyframes underglow-pulse {
    0%, 100% { opacity: 0.5; transform: scaleY(0.9); }
    50%      { opacity: 1; transform: scaleY(1.1); }
  }

  /* Hover-pad turbines — a rotating cyan energy swirl in each hover pad, so the
     car's ground contacts read as spinning (the hover-car 'wheels'). Elliptical
     to match the pads' perspective; screen-blended over the pad glow. */
  .hover-swirl {
    position: absolute;
    height: 5.5%;
    width: 11%;
    border-radius: 50%;
    background: conic-gradient(from 0deg,
      rgba(0, 225, 255, 0.75) 0deg, rgba(0, 225, 255, 0.05) 40deg,
      rgba(0, 225, 255, 0.6) 90deg, rgba(0, 225, 255, 0.05) 150deg,
      rgba(0, 225, 255, 0.75) 180deg, rgba(0, 225, 255, 0.05) 220deg,
      rgba(0, 225, 255, 0.6) 270deg, rgba(0, 225, 255, 0.05) 330deg,
      rgba(0, 225, 255, 0.75) 360deg);
    mix-blend-mode: screen;
    filter: blur(1.5px);
    animation: swirl-spin 1.3s linear infinite;
  }
  /* Positioned within the on-screen portion of the hover glow (the pad rects
     themselves fall off the left edge / behind the frame). */
  .hover-swirl.front { left: 24%; bottom: 13%; }
  .hover-swirl.rear  { left: 39%; bottom: 13%; }
  @keyframes swirl-spin { to { transform: rotate(360deg); } }

  /* Car neon side lines — a magenta glow that travels along the body lines. */
  .car-neon {
    position: absolute;
    left: 3%;
    bottom: 33%;
    width: 40%;
    height: 8%;
    transform: skewX(-24deg);
    background: linear-gradient(90deg, transparent 0%, rgba(255, 46, 196, 0.0) 20%, rgba(255, 46, 196, 0.55) 50%, rgba(255, 46, 196, 0.0) 80%, transparent 100%);
    background-size: 220% 100%;
    filter: blur(2px);
    animation: neon-travel 3.4s linear infinite;
    mix-blend-mode: screen;
  }
  @keyframes neon-travel {
    0%   { background-position: 130% 0; opacity: 0.35; }
    50%  { opacity: 0.9; }
    100% { background-position: -60% 0; opacity: 0.35; }
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

  /* Character antenna light — the orange orb at the antenna tip blinks. */
  .antenna-light {
    position: absolute;
    left: 33.5%;
    top: 12%;
    width: 4%;
    height: 4%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 176, 64, 1) 0%, rgba(255, 122, 46, 0.55) 45%, transparent 72%);
    animation: antenna-blink 2.8s ease-in-out infinite;
  }
  @keyframes antenna-blink {
    0%, 100% { opacity: 0.4; transform: scale(0.9); }
    45%      { opacity: 1; transform: scale(1.15); }
    60%      { opacity: 0.6; transform: scale(1); }
  }

  /* Character visor — occasional glint sweep over the visor. */
  .visor-glint {
    position: absolute;
    left: 41%;
    top: 22%;
    width: 12%;
    height: 8%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(200, 240, 255, 0.3) 45%, transparent 75%);
    opacity: 0;
    animation: visor-glint 6s ease-in-out infinite;
    mix-blend-mode: screen;
  }
  @keyframes visor-glint {
    0%, 92%, 100% { opacity: 0; }
    94%            { opacity: 0.85; }
    96%            { opacity: 0.1; }
    98%            { opacity: 0.6; }
  }

  @media (prefers-reduced-motion: reduce) {
    .scene-hover, .underglow, .hover-swirl, .car-neon, .booster-flicker, .antenna-light, .visor-glint {
      animation: none;
    }
    .underglow { opacity: 0.6; }
    .car-neon  { opacity: 0.5; }
    .visor-glint { opacity: 0; }
    .antenna-light { opacity: 0.8; }
  }
</style>
