<script lang="ts">
  // RobotRig.svelte, the hero pilot as an articulated figure instead of one flat PNG.
  //
  // WHY THIS EXISTS. The hero shipped as a single baked sprite (scene_character.png)
  // whose only life was a whole-body bob: the entire image slid up 7px and back. That
  // reads as a picture being moved, not as a character being alive, and it is the
  // "poor animations" note in review terms.
  //
  // WHAT THIS IS, AND WHAT IT IS NOT. This is a bone hierarchy built out of nested DOM
  // elements and CSS transforms. It is NOT Spine, and it deliberately adds no runtime:
  //
  //   - A child element's transform composes with its parent's, which is exactly what a
  //     bone chain does. Rotating .bone-torso carries the head and both arms with it,
  //     because they are its descendants.
  //   - transform-origin IS the joint. Each bone's origin is set to the connector
  //     coordinate the part was drawn around, so rotation happens at the elbow rather
  //     than at the corner of a rectangle.
  //   - The browser composites transforms on the GPU, so eleven transformed layers cost
  //     about what the one <img> cost.
  //
  // The eleven parts and their joint coordinates come from the art kit's own breakdown
  // (see robot_parts.provenance.json beside the images). Their pivots were verified by
  // assembling the figure from those coordinates and comparing it against the shipped
  // hero before any of this was written.
  //
  // GEOMETRY, and why the numbers look arbitrary. Everything inside .rig-root is
  // positioned in SOURCE pixels, the parts' own coordinate space, so the CSS can use the
  // kit's joint table unmodified. One scale on the root maps that space into the
  // 206x407 .char-layer box. The root offset and scale were derived by matching the
  // assembled figure's subject box to the shipped hero's subject box, so the rig stands
  // where the flat sprite stood, at the same height, with its feet on the same line.
  //
  // MOTION POLICY. The legs and pelvis are deliberately NOT animated. Everything moves
  // from the waist up, so the feet stay planted and the character does not drift or
  // slide. SceneGroup switches its own .char-layer bob off when the rig is mounted, so
  // the two idles never stack.
  export let assetBase: string

  const P = `${assetBase}/ui/robot`
</script>

<div class="rig-root" aria-hidden="true" data-testid="robot-rig">
  <div class="bone bone-pelvis">
    <!-- Legs first: they sit behind the pelvis shell. Not animated, so the feet stay
         planted and the figure reads as standing rather than floating. -->
    <div class="bone bone-leg-r-upper">
      <div class="bone bone-leg-r-lower">
        <img class="part" src="{P}/11-lower-right-leg-foot.png" alt="" draggable="false" />
      </div>
      <img class="part" src="{P}/10-upper-right-leg.png" alt="" draggable="false" />
    </div>
    <div class="bone bone-leg-l-upper">
      <div class="bone bone-leg-l-lower">
        <img class="part" src="{P}/09-lower-left-leg-foot.png" alt="" draggable="false" />
      </div>
      <img class="part" src="{P}/08-upper-left-leg.png" alt="" draggable="false" />
    </div>

    <img class="part part-pelvis" src="{P}/07-pelvis-waist.png" alt="" draggable="false" />

    <div class="bone bone-torso">
      <!-- Arms are descendants of the torso so the breathe carries them, and they are
           ordered before the torso plate so the shoulders tuck behind it. -->
      <div class="bone bone-arm-r-upper">
        <div class="bone bone-arm-r-lower">
          <img class="part" src="{P}/06-lower-right-arm-hand.png" alt="" draggable="false" />
        </div>
        <img class="part" src="{P}/05-upper-right-arm.png" alt="" draggable="false" />
      </div>
      <div class="bone bone-arm-l-upper">
        <div class="bone bone-arm-l-lower">
          <img class="part" src="{P}/04-lower-left-arm-hand.png" alt="" draggable="false" />
        </div>
        <img class="part" src="{P}/03-upper-left-arm.png" alt="" draggable="false" />
      </div>

      <img class="part part-torso" src="{P}/02-torso-chest.png" alt="" draggable="false" />

      <div class="bone bone-head">
        <img class="part" src="{P}/01-head-visor.png" alt="" draggable="false" />
      </div>
    </div>
  </div>
</div>

<style>
  /* The root maps SOURCE pixel space into the .char-layer box. left/top place the
     assembled subject exactly where the flat hero's subject sat; scale is the ratio of
     the hero's subject height (388.98 layer px) to the rig's (1400 source px). */
  .rig-root {
    position: absolute;
    left: 23.95px;
    top: 9.09px;
    width: 0;
    height: 0;
    transform: scale(0.27784);
    transform-origin: 0 0;
    /* Matches the flat sprite's own shadow so the swap does not change the grounding. */
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.55));
  }

  .bone {
    position: absolute;
  }

  .part {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  /* ── Bone boxes, in SOURCE px, each relative to its parent bone ──────────────
     transform-origin is the joint: the connector coordinate the part was drawn
     around, taken from the kit's pivot table. */
  .bone-pelvis      { left:  74px; top:  530px; width: 420px; height: 260px; transform-origin: 210px  30px; z-index: 2; }
  .bone-torso       { left: -30px; top: -280px; width: 480px; height: 340px; transform-origin: 240px 310px; z-index: 3; }
  .bone-head        { left:  50px; top: -270px; width: 380px; height: 330px; transform-origin: 190px 300px; z-index: 3; }

  .bone-arm-r-upper { left: -60px; top:   95px; width: 190px; height: 270px; transform-origin:  95px  30px; z-index: 1; }
  .bone-arm-r-lower { left:  -5px; top:  205px; width: 200px; height: 310px; transform-origin: 100px  35px; z-index: 1; }
  .bone-arm-l-upper { left: 350px; top:   95px; width: 190px; height: 270px; transform-origin:  95px  30px; z-index: 1; }
  .bone-arm-l-lower { left:  -5px; top:  205px; width: 200px; height: 310px; transform-origin: 100px  35px; z-index: 1; }

  .bone-leg-r-upper { left:   0px; top:  165px; width: 220px; height: 340px; transform-origin: 110px  30px; z-index: 1; }
  .bone-leg-r-lower { left:  -5px; top:  275px; width: 230px; height: 450px; transform-origin: 115px  35px; z-index: 1; }
  .bone-leg-l-upper { left: 200px; top:  165px; width: 220px; height: 340px; transform-origin: 110px  30px; z-index: 1; }
  .bone-leg-l-lower { left:  -5px; top:  275px; width: 230px; height: 450px; transform-origin: 115px  35px; z-index: 1; }

  /* ── Idle ────────────────────────────────────────────────────────────────────
     Amplitudes are in SOURCE px and degrees, so a 2px translate is 2 * 0.27784 =
     0.56 layer px on screen: deliberately small. The periods are deliberately
     coprime-ish (5.2 / 7.1 / 5.8 / 6.3 / 6.7 / 5.5 seconds) so the bones drift in
     and out of phase and the loop never resolves into a visible pulse. That is
     what separates an idle that reads as breathing from one that reads as a
     metronome. */
  .bone-torso {
    animation: rig-breathe 5.2s ease-in-out infinite;
  }
  @keyframes rig-breathe {
    0%,
    100% { transform: rotate(-0.55deg) translateY(0); }
    50%  { transform: rotate(0.55deg) translateY(-4px); }
  }

  .bone-head {
    animation: rig-head 7.1s ease-in-out infinite;
  }
  @keyframes rig-head {
    0%,
    100% { transform: rotate(0.9deg); }
    50%  { transform: rotate(-0.9deg); }
  }

  .bone-arm-r-upper { animation: rig-arm-a 5.8s ease-in-out infinite; }
  .bone-arm-l-upper { animation: rig-arm-b 6.3s ease-in-out infinite; }
  .bone-arm-r-lower { animation: rig-arm-b 6.7s ease-in-out infinite; }
  .bone-arm-l-lower { animation: rig-arm-a 5.5s ease-in-out infinite; }
  @keyframes rig-arm-a {
    0%,
    100% { transform: rotate(-1.3deg); }
    50%  { transform: rotate(1.3deg); }
  }
  @keyframes rig-arm-b {
    0%,
    100% { transform: rotate(1.1deg); }
    50%  { transform: rotate(-1.1deg); }
  }

  /* Freeze to the clean neutral pose. The rig's rest state IS the assembled figure,
     so stopping every bone leaves a correct, fully-connected character rather than a
     half-played frame. */
  @media (prefers-reduced-motion: reduce) {
    .bone-torso,
    .bone-head,
    .bone-arm-r-upper,
    .bone-arm-l-upper,
    .bone-arm-r-lower,
    .bone-arm-l-lower {
      animation: none;
      transform: none;
    }
  }
</style>
