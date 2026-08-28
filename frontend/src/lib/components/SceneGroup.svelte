<script lang="ts">
  // SceneGroup.svelte, Future Spinner left-side scene, rebuilt as two layers.
  //
  // The old single baked scene_character_car.png (character + car together,
  // pushed off-screen left) is replaced by two separately rendered sprites:
  //
  //   scene_car.png, lower-left SCENERY. The hover car sits in the left
  //                         gutter, its tail sliding partly under the reel frame
  //                         (z below the frame). Keeps the hover bob, cyan pad
  //                         underglow, magenta neon travel and a green nose
  //                         booster flicker.
  //   scene_character.png, the pilot as a FEATURE HERO. Pulled out of hiding,
  //                         left-justified and fully visible in the gutter to the
  //                         left of the frame (never tucked behind it), scaled up
  //                         so he reads as a presented feature. His idle life is
  //                         a small vertical float on this layer (R138, the same
  //                         class of motion as the car and half its amplitude)
  //                         plus the antenna-tip blink and visor glint.
  //
  // All motion is subtle ambient scene life and is disabled under
  // prefers-reduced-motion. The group is decorative (aria-hidden).
  import { themeAssets } from '../stores/themeStore'
  import HeroIdle from './HeroIdle.svelte'

  // ── HERO PRESENTATION (R111, revised R112) ─────────────────────────────────
  // Three ways to draw the pilot, in descending order of how good he looks:
  //
  //   'idle'   DEFAULT. The crossed-arms idle strip, played as a six-frame
  //            flipbook (R126: this said five; it has been six since R122). This is the shipped hero's own pose and silhouette
  //            (frame 01 matches ui/scene_character.png at IoU 0.9997), but
  //            re-rendered per frame so the body relights as it breathes.
  //   'static' The original flat sprite with its whole-body bob. The oldest and
  //            safest path, and the one-line escape hatch: pass heroMode="static"
  //            at the App.svelte mount and the hero reverts to the pre-R111 sprite.
  //
  // R111's eleven-part bone hierarchy WAS a third mode here and was removed in
  // R115. It could never render: heroMode has exactly one mount, App.svelte:2159
  // `<SceneGroup haze={hazeLevel} />`, which does not pass it, so the branch was
  // unreachable while its eleven part rasters shipped to every player. R112
  // established that the pose those parts are drawn in, arms at sides and neutral,
  // is not the wanted one. The rig remains in git history and in
  // docs/design/SPINE_ROBOT_RIG_SETUP.md if a real skeletal pass is ever revived.
  //
  // Every mode keeps the same 206x407 box, the same grounding and its own
  // reduced-motion behaviour, so switching cannot move the scene.
  export let heroMode: 'idle' | 'static' = 'idle'

  // ── COHESION PASS (TR-027) ─────────────────────────────────────────────────
  // The car and pilot were separated from the backdrop by a flat drop-shadow
  // alone, which is exactly what makes the art read as PLACED ON the scene
  // rather than sitting IN it. Three things fix that, and they are levels rather
  // than a single switch because how hard to push it is an eye-call:
  //
  //   1. DEPTH HAZE. A scene-coloured wash between the backdrop and each sprite,
  //      which is what atmosphere actually does at distance.
  //   2. SCENE-MATCHED GRADING. A slight shift of the flat art toward the
  //      backdrop's own temperature, so the sprite is lit by the same world.
  //   3. RIM LIGHT. The existing drop-shadow extended into a directional edge
  //      light, which is what separates a subject from its background once the
  //      haze has deliberately reduced the contrast that used to do that job.
  //
  // 0 keeps the shipped look exactly. The hero read is the thing to watch when
  // comparing: the pilot was deliberately pulled out of hiding and left-
  // justified so he reads as a presented feature, and hazing him too hard undoes
  // that staging decision.
  export let haze: 0 | 1 | 2 | 3 | number = 0

  const HAZE = [
    { wash: 0,    blur: 0,  grade: 0,    rim: 0    },
    { wash: 0.10, blur: 2,  grade: 0.10, rim: 0.35 },
    { wash: 0.18, blur: 4,  grade: 0.18, rim: 0.55 },
    { wash: 0.28, blur: 7,  grade: 0.28, rim: 0.75 },
  ]
  $: h = HAZE[Math.max(0, Math.min(3, Math.round(haze)))] ?? HAZE[0]
</script>

<div
  class="scene-group"
  data-testid="scene-group"
  data-haze={haze}
  style="--haze-wash:{h.wash}; --haze-blur:{h.blur}px; --haze-grade:{h.grade}; --rim:{h.rim};"
  aria-hidden="true"
>
  <!-- CAR, lower-left scenery, tail slides under the frame (z8, below frame z10) -->
  <div class="car-layer" aria-hidden="true">
    <div class="depth-haze" aria-hidden="true"></div>
    <img class="car-img" src="{$themeAssets.assetBase}/ui/scene_car.png" alt="" draggable="false" />
    <div class="underglow" aria-hidden="true"></div>
    <div class="car-neon" aria-hidden="true"></div>
    <div class="booster-flicker" aria-hidden="true"></div>
  </div>

  <!-- CHARACTER, feature hero, left-justified in the gutter, fully visible (z30) -->
  <div class="char-layer" aria-hidden="true">
    <div class="depth-haze" aria-hidden="true"></div>
    {#if heroMode === 'idle'}
      <HeroIdle assetBase={$themeAssets.assetBase} />
    {:else}
      <img class="char-img" src="{$themeAssets.assetBase}/ui/scene_character.png" alt="" draggable="false" />
    {/if}
    <div class="antenna-light" aria-hidden="true"></div>
    <div class="visor-glint" aria-hidden="true"></div>
    <div class="chest-lamp" aria-hidden="true"></div>
  </div>
</div>

<style>
  /* ── Cohesion: depth haze, scene grading, rim light ──────────────────────
     All three are STATIC state, not motion, so they apply identically under
     prefers-reduced-motion and are deliberately NOT gated behind it. Atmosphere
     is not an animation. */
  .depth-haze {
    position: absolute;
    inset: -6%;
    pointer-events: none;
    /* Scene-coloured wash: the backdrop's own cyan-violet, laid between the
       backdrop and the sprite so distance reads as distance. */
    background: radial-gradient(
      ellipse at 50% 60%,
      rgba(90, 190, 220, calc(var(--haze-wash, 0) * 1.15)) 0%,
      rgba(58, 40, 120, calc(var(--haze-wash, 0) * 0.85)) 55%,
      transparent 78%
    );
    filter: blur(var(--haze-blur, 0px));
    /* No opacity switch is needed: at level 0 --haze-wash is 0, so every colour
       stop in the gradient is fully transparent and the layer renders nothing. */
    z-index: 0;
  }
  .car-layer .depth-haze, .char-layer .depth-haze { z-index: -1; }

  /* Scene-matched grading + rim light on the sprites themselves. The rim is the
     existing drop-shadow extended into a directional edge light: once haze has
     deliberately reduced the contrast that separated subject from background,
     something has to put that separation back, and a rim is what does it
     without flattening the haze again. */
  .car-img, .char-img {
    filter:
      drop-shadow(0 6px 18px rgba(0, 0, 0, 0.5))
      drop-shadow(-2px -1px 0 rgba(120, 240, 255, var(--rim, 0)))
      drop-shadow(2px -1px 0 rgba(180, 120, 255, calc(var(--rim, 0) * 0.7)))
      saturate(calc(1 - var(--haze-grade, 0) * 0.35))
      brightness(calc(1 - var(--haze-grade, 0) * 0.12))
      contrast(calc(1 - var(--haze-grade, 0) * 0.10));
  }

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

  /* Cyan pad underglow, pulses in counter-phase to the bob so the lift reads
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

  /* Magenta neon side line, a glow that travels along the body. */
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

  /* Booster, faint green flicker at the nose accent. */
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
  /* R138: THE FLOAT IS BACK, AND IT IS A DIFFERENT ANIMAL FROM WHAT R130 DELETED.
     The owner's ruling after the live upload: a completely still idle is too dead,
     restore the original slight floating, the same class as the car. What R130
     deleted was POSE motion on the hero itself, the sheet flipbook, the 7.2s sway
     and the glance, and all of that stays deleted. What returns here is whole-layer
     travel one level ABOVE the sprite, so the pose cannot tick by construction:
     HeroIdle's sheet still holds frame 01 with no animation of its own.

     THE CAR IS THE CALIBRATION, measured live at R138 by seeking the animation
     clock: car-hover is translateY 0 to -6px with scale 1 to 1.01 over 6s
     ease-in-out. The hero floats HALF that, translateY only, 3px over 5s. 5s is
     the original char-idle's own period, and it is deliberately non-harmonic with
     the car's 6s so the two never phase-lock and read as one machine (the same
     principle that spaced the accent periods 2.8s / 6.0s / 7.4s below).

     WHAT THE OLD RULE HAD THAT THIS ONE MUST NOT GROW BACK: rotate(-0.6deg to
     0.6deg) and scale(1.015). The rotation is the pendulum class R130's ruling
     retired and the R138 fence names again; the scale is left out to keep this
     strictly a float rather than a breathe. hero_idle_planted_gate.mjs now
     enforces translateY-only on every keyframe this layer references, and that
     the hero's amplitude stays at or below the car's, both derived from this
     file at gate time rather than from a number written into the gate.

     The .char-idle-strip disable rule that R111 used to switch this animation off
     for the rig is deleted with this restore, not commented out: both hero modes
     now share the one float, so there is nothing left for it to disable. */
  @keyframes char-idle {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-3px); }
  }

  .char-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.55));
  }

  /* Antenna tip, the orange orb blinks. Positioned over the orb on the
     character's upper left. */
  /* R112: re-registered onto the orb it is named for. The inherited box was
     centred at layer (37.1, 97.7); the orange earpiece orb it lights sits at
     (65.3, 71.9), measured on the shipped sprite and confirmed across all five
     strip frames, where it drifts about 1px. So the light had ZERO overlap with
     the orb and glowed on bare head shell 28px to its left. R111 measured the
     same defect from the other direction and scoped its fix to the rig, because
     the flat sprite was only a fallback then. The flipbook and the flat sprite
     are the same image (IoU 0.9997), so one corrected base rule now serves both
     and there is no per-mode duplicate. Height drops 8% -> 6% because the orb is
     10.5 x 11.6 layer px and the taller box smeared a round light into an
     ellipse. The rig keeps its own override below: its head sits higher. */
  .antenna-light {
    position: absolute;
    left: 25.72%;
    top: 14.66%;
    width: 12%;
    height: 6%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 176, 64, 1) 0%, rgba(255, 122, 46, 0.55) 45%, transparent 72%);
    animation: antenna-blink 2.8s ease-in-out infinite;
  }
  @keyframes antenna-blink {
    0%, 100% { opacity: 0.4; transform: scale(0.9); }
    45%      { opacity: 1; transform: scale(1.15); }
    60%      { opacity: 0.6; transform: scale(1); }
  }

  /* Visor, occasional glint sweep over the visor.

     top was 17% until R110, which measured where the light actually landed.
     .char-img is object-fit:contain and the box aspect (206/407) matches the
     source (680/1344) to four decimals, so layer % maps 1:1 onto the sprite at
     scale 3.302. At 17% the gradient centred on image y309, which is the neck
     pinch, not the lens: only 5.7% of the gradient's energy fell on the visor
     and 32.4% missed the sprite entirely and lit nothing. At 11% the centre is
     y228, the middle of the lens (image y37..319), giving 56.4% on the lens and
     3.6% wasted. Nothing else changes: same keyframes, same 6s period, same
     blend mode, same box, so the reduced-motion path and layout are untouched.

     Left is deliberately NOT centred on the lens (centre 42% against a lens
     centroid of 54.3%): a specular highlight belongs off-centre, near the
     visor's own painted streak. That is an art choice, not the defect. */
  .visor-glint {
    position: absolute;
    left: 32%;
    top: 11%;
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

  /* Chest lamp, R131. The third and last resting accent, and the only one below the
     head: the antenna sits at the ocular pod and the glint on the visor, so a static
     figure had both its signs of life in the top fifth of itself. This is the belt
     lamp array on the abdomen.

     IT IS A SIBLING OF <HeroIdle>, NOT A CHILD OF .hero-body, AND THAT IS DELIBERATE.
     .hero-body carries filter: drop-shadow(), which is computed from its whole
     subtree, so a glow child would have made the hero's SHADOW pulse with it - the
     defect R129 shipped once by putting the shadow on two stacked layers. Out here
     the shadow cannot see it, and it inherits the reduced-motion reset below for free.

     GEOMETRY, MEASURED RATHER THAN EYEBALLED. The lamp is THREE bright cyan bars in a
     housing, core hull x85..103 / y179..185 in the 206x407 .char-layer box (a previous
     count of four included the housing bezel's right shoulder).

     CONTAINMENT IS VERIFIED ON THE BOX BELOW, NOT ON A NOMINAL PADDING. An earlier
     draft of this comment said "the hull padded by 8px", which is not what the rule
     computes: 37.37% / 42.01% / 17% / 5.65% of 206x407 lands the box at x76.98..112.00
     and y170.98..193.98, so the real margins are 8.0px left and top and 9.0px right
     and bottom - the box centre sits half a pixel right of the hull centre. Measured
     over those exact pixels (x76..113, y170..194, 888 px): minimum alpha 255, with
     ZERO pixels below 250, against a positive control box straddling the silhouette
     edge that correctly reports alpha 0. So the glow cannot reach the silhouette edge
     and cannot contaminate the parent drop-shadow. Centre 45.87% / 44.83%.

     WHY IT DOES NOT TICK, which is the bar the brief sets. Three properties, each the
     opposite of what made the old idle tick: it is CONTINUOUS (an eased opacity ramp,
     no discrete step - the tick's worst step was 48.9 held 733ms); it changes NO
     GEOMETRY (no transform, no scale, so silhouette change is exactly zero, where the
     tick moved 18.75% of the silhouette); and its period is 7.4s, slower than both
     existing accents and deliberately non-harmonic with them (2.8s and 6.0s) so the
     three never land together and read as a pulse.

     THE HEADROOM, WITH BOTH SIDES OF THE RATIO TAKEN THE SAME WAY. A first draft said
     "6,000x quieter", which divided the tick's WORST STEP by the lamp's MEAN - two
     different kinds of number, and exactly the mistake R130 recorded a rule against.
     Like for like: worst-step against the lamp's max is 48.872 / 0.0166 = 2,944x, and
     mean-step against the lamp's mean is 26.614 / 0.0081 = 3,286x. A longer 30s
     sampling run puts the lamp's mean nearer 0.0055, which widens both rather than
     narrowing them. Call it THREE THOUSAND TIMES quieter and it is defensible on
     either pairing. */
  .chest-lamp {
    position: absolute;
    left: 37.37%;
    top: 42.01%;
    width: 17%;
    height: 5.65%;
    border-radius: 50%;
    /* The lamp's own measured colour, mean RGB about (40, 205, 225). */
    background: radial-gradient(ellipse, rgba(64, 226, 245, 0.85) 0%, rgba(40, 190, 225, 0.35) 45%, transparent 72%);
    mix-blend-mode: screen;
    opacity: 0.18;
    animation: chest-lamp-breathe 7.4s ease-in-out infinite;
  }
  @keyframes chest-lamp-breathe {
    0%, 100% { opacity: 0.16; }
    50%      { opacity: 0.44; }
  }

  /* THE THREE ACCENTS ARE SIBLINGS OF .hero-body, SO THEY DO NOT TRAVEL WITH IT.
     R131, found by an adversarial pass over R131's own diff, and PRE-EXISTING: it
     affects all three, not just the one this session added.

     Each accent is positioned as a percentage of .char-layer and is painted on top
     of the sprite. During a reaction .hero-body transforms - the epic punch lifts
     27px, scales 1.05 and rotates 2deg - and the accents do not, so the glow slides
     off the feature it is lighting. Measured at the epic peak, as the distance
     between the PAINTED feature (the sprite centroid put through the live transform
     matrix) and the CSS glow:

         .antenna-light   0.36px at rest -> 44.59px mid-punch, at opacity 0.42
         .visor-glint     0.53px        -> 45.55px, at opacity 0.00
         .chest-lamp      0.66px        -> 39.39px, at opacity 0.42

     The glow boxes are 24 to 41px wide, so at those distances the light is entirely
     off its feature. The chest lamp drifts LEAST because it sits lowest, nearest the
     transform-origin at the feet, where a rotation displaces least.

     WHY SUPPRESS RATHER THAN FOLLOW. Making them track would mean either moving them
     inside .hero-body - which is exactly what must not happen, because that element's
     drop-shadow is computed from its whole subtree and a glow child would pulse the
     shadow - or duplicating the transform, which then has to be kept in step with
     four keyframe sets by hand. Suppression is correct on its own terms anyway:
     these are RESTING accents. While the hero is performing a win or a brace, the
     performance is the thing to look at, and a static glint on a moving figure was
     never the intent.

     `:has()` DEGRADES SAFELY. Where it is unsupported the rule simply does not
     apply and the behaviour is exactly what shipped before this fix, which is why
     it is an acceptable mechanism for a cosmetic suppression. */
  /* :global() ON THE :has() ARGUMENT IS REQUIRED, and leaving it out is a silent
     no-op. .hero-body belongs to HeroIdle.svelte, so Svelte's scoping appends THIS
     component's class to it and the selector can never match. The first version of
     this rule did exactly that: svelte-check reported three css_unused_selector
     warnings and the measured drift was unchanged at 39 to 45px, i.e. the rule
     shipped as decoration. The accents themselves stay scoped; only the cross-
     component condition is global. */
  .char-layer:has(:global(.hero-body[data-motion]:not([data-motion='idle']))) .antenna-light,
  .char-layer:has(:global(.hero-body[data-motion]:not([data-motion='idle']))) .visor-glint,
  .char-layer:has(:global(.hero-body[data-motion]:not([data-motion='idle']))) .chest-lamp {
    /* THE ANIMATION HAS TO BE STOPPED, NOT JUST OVERRIDDEN, and that is the second
       way this rule was inert before it worked. A CSS animation's keyframe values
       sit ABOVE normal declarations in the cascade, so `opacity: 0` alone loses to
       antenna-blink and chest-lamp-breathe, both of which set opacity at every
       keyframe. Measured: the rule compiled, the selector matched, and the accents
       still read 0.42 at the punch peak. Cancelling the animation first lets the
       opacity apply. This is the same shape as the reduced-motion block below,
       which stops animations rather than trying to out-declare them. */
    animation: none;
    opacity: 0;
    /* NO TRANSITION HERE, AND THE ABSENCE IS DELIBERATE. This rule carried
       `transition: opacity 120ms linear` when it first shipped, and that was a THIRD
       inert mechanism in the same declaration - after the missing :global() and the
       animation-origin problem above. Cancelling an animation in the SAME style
       change leaves no transitionable before-change value, so the fade could never
       run: measured, the accents went 0.4304 -> 0.0000 in one 20ms frame with
       transition-property already computing to `opacity 0.12s` on the element, while
       a probe with the same declaration and no animation faded through seven
       intermediate values in the same rAF loop. The exit was a hard cut by
       construction too, since the declaration leaves with the rule.
       Making it fade would need each accent wrapped in an unanimated div carrying
       the transition, which is real machinery for a cross-fade at the one moment it
       is least visible: the cut happens exactly as the hero launches a large
       reaction and the win banner fires. So the suppression is a HARD CUT, on
       purpose, and this comment says so rather than a dead declaration implying
       otherwise. */
  }

  @media (prefers-reduced-motion: reduce) {
    /* R130: !important ON THE ANIMATION RESET, AND THE FREEZE IS WHY.
       These resets are correct TODAY, but only on a tie broken by source order:
       `.antenna-light` here is (0,1,0) and `.antenna-light` at its state rule is
       also (0,1,0), so this block wins purely because it sits later in the file.
       Any future rule that qualifies one of these by a parent, a state attribute
       or a modifier class - `.char-layer--rig .antenna-light`, say - lands at
       (0,2,0) and takes the animation straight back, with nothing failing.
       That was survivable while these were minor accents on a hero that had a
       flipbook and a sway of its own. R130 froze the hero, so .antenna-light and
       .visor-glint are now the ONLY motion on the resting figure: if this reset
       ever loses, a player who asked for reduced motion gets the single moving
       thing on screen, with nothing else moving to hide it. My own freeze raised
       the stakes on this reset, which is the same shape as R129's finding that
       its data-tier work widened an accessibility hole one layer down.
       !important makes the override unconditional rather than a specificity race
       every future rule has to remember to lose. HeroIdle.svelte's own
       reduced-motion block does this for the same reason.

       R138 MADE THE .char-layer ENTRY LOAD-BEARING AGAIN. While the strip idle
       was frozen and `.char-layer.char-idle-strip` disabled the base animation,
       this reset had nothing to stop on that element; the R130 note here recorded
       exactly that. The strip disable rule is deleted with the R138 float restore,
       so `.char-layer` now carries a real 5s float that THIS line is what stops
       under reduced motion, on the same plain source-order tie as the six other
       elements. The R138 brief's own target is explicit: reduced motion freezes
       both the float and the reaction dissolve. */
    .car-layer, .char-layer, .underglow, .car-neon, .booster-flicker, .antenna-light, .visor-glint, .chest-lamp {
      animation: none !important;
    }
    .underglow { opacity: 0.6; }
    .car-neon  { opacity: 0.5; }
    .visor-glint { opacity: 0; }
    .antenna-light { opacity: 0.8; }
    /* R131: held at the low end of its own ramp rather than 0. The lamp is a lit part
       of the sprite, so stilling it at zero would darken the figure relative to what a
       no-preference player sees; 0.16 is the keyframe's own resting value, which makes
       the reduced-motion presentation the same picture minus the movement. Every other
       entry in this block follows the same principle. */
    .chest-lamp { opacity: 0.16; }
    /* R135: THE BOOSTER FLICKER WAS THE ONE ELEMENT IN THIS BLOCK WITH NO REPLACEMENT OPACITY,
       AND STILLING IT MADE IT BRIGHTER THAN IT EVER GETS WITH MOTION ON. `animation: none` above
       removes the keyframes, and the keyframes were the only thing supplying an opacity, so it
       fell back to the base rule's 1 while its own animated range is 0.25 to 0.80. Measured live
       with the media feature toggled inside ONE page load: no-preference ranges 0.250 to 0.800
       across 23 distinct values, reduced pins at 1.000 with getAnimations() empty, and a repeat
       of the no-preference read afterwards returns the identical 0.250/0.800/23. That is 1.25x
       its own animated PEAK and 4.00x its resting value. In pixels over the element's own rect,
       mean luminance went 86.09 to 108.33 and back to 85.07: a signal 22 times the 1.02 drift
       between the two control reads.
       0.25 is the keyframe's own 0%/100% resting value, so this is the chest lamp's principle
       above applied literally: the same picture minus the movement. REDUCED MOTION MAY FREEZE OR
       DIM. IT MAY NOT INTENSIFY. */
    .booster-flicker { opacity: 0.25; }
  }
</style>
