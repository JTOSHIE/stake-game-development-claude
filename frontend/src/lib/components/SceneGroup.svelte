<script lang="ts">
  // SceneGroup.svelte — Future Spinner left-side scene, rebuilt as two layers.
  //
  // The old single baked scene_character_car.png (character + car together,
  // pushed off-screen left) is replaced by two separately rendered sprites:
  //
  //   scene_car.png       — lower-left SCENERY. The hover car sits in the left
  //                         gutter, its tail sliding partly under the reel frame
  //                         (z below the frame). Keeps the hover bob, cyan pad
  //                         underglow, magenta neon travel and a green nose
  //                         booster flicker.
  //   scene_character.png — the pilot as a FEATURE HERO. Pulled out of hiding,
  //                         left-justified and fully visible in the gutter to the
  //                         left of the frame (never tucked behind it), scaled up
  //                         so he reads as a presented feature. He has his own
  //                         idle life: a slow bob and sway with a subtle breathing
  //                         scale, plus the antenna-tip blink and visor glint.
  //
  // All motion is subtle ambient scene life and is disabled under
  // prefers-reduced-motion. The group is decorative (aria-hidden).
  import { themeAssets } from '../stores/themeStore'
</script>

<div class="scene-group" data-testid="scene-group" aria-hidden="true">
  <!-- CAR — lower-left scenery, tail slides under the frame (z8, below frame z10) -->
  <div class="car-layer" aria-hidden="true">
    <img class="car-img" src="{$themeAssets.assetBase}/ui/scene_car.png" alt="" draggable="false" />
    <div class="underglow" aria-hidden="true"></div>
    <div class="car-neon" aria-hidden="true"></div>
    <div class="booster-flicker" aria-hidden="true"></div>
  </div>

  <!-- CHARACTER — feature hero, left-justified in the gutter, fully visible (z30) -->
  <div class="char-layer" aria-hidden="true">
    <img class="char-img" src="{$themeAssets.assetBase}/ui/scene_character.png" alt="" draggable="false" />
    <div class="antenna-light" aria-hidden="true"></div>
    <div class="visor-glint" aria-hidden="true"></div>
  </div>
</div>

<style>
  /* Non-stacking wrapper: no z-index/transform of its own, so the two layers
     resolve their z-index against the 1280x720 design surface (frame z10,
     grid z20, HUD z50). The car can therefore sit below the frame while the
     character sits above it. */
  .scene-group {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  /* ---- CAR (scenery) --------------------------------------------------- */
  .car-layer {
    position: absolute;
    left: -30px;
    bottom: 10px;
    width: 860px;
    height: 303px;
    z-index: 8;              /* below the frame (z10) so the tail tucks under it */
    transform-origin: 50% 90%;
    animation: car-hover 6s ease-in-out infinite;
  }
  @keyframes car-hover {
    0%, 100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-6px) scale(1.01); }
  }

  .car-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.5));
  }

  /* Cyan pad underglow — pulses in counter-phase to the bob so the lift reads
     as hover-pad thrust. */
  .underglow {
    position: absolute;
    left: 18%;
    bottom: 4%;
    width: 62%;
    height: 16%;
    background: radial-gradient(ellipse at center, rgba(0, 220, 255, 0.45) 0%, rgba(0, 220, 255, 0.12) 52%, transparent 78%);
    animation: underglow-pulse 6s ease-in-out infinite;
    filter: blur(3px);
  }
  @keyframes underglow-pulse {
    0%, 100% { opacity: 0.5; transform: scaleY(0.9); }
    50%      { opacity: 1; transform: scaleY(1.1); }
  }

  /* Magenta neon side line — a glow that travels along the body. */
  .car-neon {
    position: absolute;
    left: 8%;
    bottom: 46%;
    width: 84%;
    height: 7%;
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

  /* Booster — faint green flicker at the nose accent. */
  .booster-flicker {
    position: absolute;
    left: 1%;
    bottom: 44%;
    width: 6%;
    height: 16%;
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

  /* ---- CHARACTER (feature hero) --------------------------------------- */
  .char-layer {
    position: absolute;
    left: 22px;
    bottom: 18px;
    width: 206px;
    height: 407px;
    z-index: 30;             /* above the frame (z10)/grid (z20), below HUD (z50) */
    transform-origin: 50% 92%;
    animation: char-idle 5s ease-in-out infinite;
  }
  /* Slow bob + gentle sway + subtle breathing scale — layered so he feels alive
     without competing with the reels. */
  @keyframes char-idle {
    0%   { transform: translateY(0) rotate(-0.6deg) scale(1); }
    50%  { transform: translateY(-7px) rotate(0.6deg) scale(1.015); }
    100% { transform: translateY(0) rotate(-0.6deg) scale(1); }
  }

  .char-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.55));
  }

  /* Antenna tip — the orange orb blinks. Positioned over the orb on the
     character's upper left. */
  .antenna-light {
    position: absolute;
    left: 12%;
    top: 20%;
    width: 12%;
    height: 8%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 176, 64, 1) 0%, rgba(255, 122, 46, 0.55) 45%, transparent 72%);
    animation: antenna-blink 2.8s ease-in-out infinite;
  }
  @keyframes antenna-blink {
    0%, 100% { opacity: 0.4; transform: scale(0.9); }
    45%      { opacity: 1; transform: scale(1.15); }
    60%      { opacity: 0.6; transform: scale(1); }
  }

  /* Visor — occasional glint sweep over the visor. */
  .visor-glint {
    position: absolute;
    left: 32%;
    top: 17%;
    width: 20%;
    height: 12%;
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
    .car-layer, .char-layer, .underglow, .car-neon, .booster-flicker, .antenna-light, .visor-glint {
      animation: none;
    }
    .underglow { opacity: 0.6; }
    .car-neon  { opacity: 0.5; }
    .visor-glint { opacity: 0; }
    .antenna-light { opacity: 0.8; }
  }
</style>
