<script lang="ts">
  // LoadingScreen.svelte, Motion Polish v2 brand screens: the WRS standard
  // loading screen. WE ROLL SPINNERS wordmark above, the brand mark large in
  // the middle, the active theme's game logo below, progress beneath that.
  //
  // FS VISUAL FIXPACK JOB 1 (owner ruling, 2026-07-27): THE BRAND MARK NO
  // LONGER ROTATES, AND NOTHING ON THIS SCREEN SLIDES INTO PLACE.
  //
  // The owner reported "the load screen's We Roll Spinners logo now jumps
  // around and starts spinning", and ruled: "the splash is calm, black screen,
  // logo sitting still with its gentle pulse, raindrops, TAP TO CONTINUE,
  // nothing else moving."
  //
  // WHAT ACTUALLY REGRESSED. This screen used to draw the mark as TWO layers:
  // a static chrome rim (brand_mark_base.png) with an inner five-fold blade
  // (brand_mark_spin.png) over it. Only the INNER BLADE carried
  // `animation: brand-spin 2.6s linear infinite`, so the mark's own outline
  // never moved. DESIGN_SYSTEM.md describes exactly that: "a neon chrome rim
  // whose inner layer spins independently".
  //
  // Commit 54544e4 (OWNER AUDIT ROUND 3 item 1, logo canonicalisation) replaced
  // both layers with ONE image, hero_icon_96.png, the canonical We Roll Spinners
  // mark, and left the rotation sitting on it. The animation was keyed to a
  // layer that no longer existed, so from that commit onward it rotated the
  // whole logo rather than the blade inside it. Measured at 1280x720 before the
  // fix, over ten seconds: the mark's bounding box swung 77.25px in width and
  // height and 38.6px in x and y, because the canonical artwork is not radially
  // symmetric. That is the "jumps around" in numbers, and it is the same one
  // defect as the spin, not a second one.
  //
  // THE TENSION, RECORDED RATHER THAN RESOLVED QUIETLY (convention n).
  // DESIGN_SYSTEM.md's brand layer states the standard loading screen for EVERY
  // WRS game is "the rim spinning as the loader". This ruling is the later and
  // better-informed instrument and therefore governs, so the mark is still. The
  // design system line is left for the owner to amend or restore deliberately;
  // it is raised as a comms item in the session report rather than edited here
  // on the builder's own authority.
  //
  // WHAT REPLACED IT. The mark sits still and its glow breathes: a FILTER pulse
  // on the container, never a transform and never a scale. That distinction is
  // load-bearing rather than stylistic. A scale pulse would move the bounding
  // box, and splash_calm_gate.mjs could then only assert "the logo moved a
  // little", which is not a property anyone can hold a build to. A filter pulse
  // lets the assertion be exactly zero.
  //
  // The two entry fades animate opacity only. They previously carried
  // `translateY(-8px)` with staggered delays, so the wordmark and the game logo
  // each slid 8px down into place on every load. That is small, and it is still
  // the wordmark visibly moving on a screen the owner has ruled is calm.
  //
  // The rain layer is the same RainLayer.svelte the splash uses, at the same
  // density and opacity, so the two boot screens read as one continuous calm
  // presentation rather than a stark loader cutting to a rainy splash. It
  // inherits the component's own reduced-motion gating.
  //
  // Held by frontend/scripts/splash_calm_gate.mjs, which samples this screen and
  // the splash every 250ms across ten seconds at three presets and asserts zero
  // geometry variance, no rotation, no translation and no transform-writing
  // animation on any boot logo.
  import { assetLoadProgress } from '../stores/loadingStore'
  import { themeAssets } from '../stores/themeStore'
  import RainLayer from './RainLayer.svelte'
</script>

<div class="loading-screen fs-scrim">
  <RainLayer count={10} opacity={0.55} variant="splash" />

  <!-- Positioned wrapper so the in-flow content paints above the absolutely
       positioned rain layer rather than under it. -->
  <div class="loading-content">

    <div class="wordmark">WE ROLL SPINNERS</div>

    <!-- OWNER AUDIT ROUND 3, item 1 (logo canonicalisation): the hero emblem
         is the sole WRS mark, so this loader draws the hero icon (a tight
         circular crop of the emblem's wheel-and-reel core, tools/brand/
         derive_hero_icon.py) as a single layer, replacing the old bespoke
         brand_mark_base/brand_mark_spin two-layer rim+blade composite.
         FS VISUAL FIXPACK JOB 1: it is STILL. The class is named for what it
         does, so nobody re-adds a rotation to something called brand-spin. -->
    <div class="brand-mark" aria-hidden="true">
      <img class="brand-still" src="{$themeAssets.assetBase}/ui/hero_icon_96.png" alt="" draggable="false" />
    </div>

    <div class="logo-block">
      <img
        src="{$themeAssets.logo}"
        class="loading-logo"
        alt=""
        draggable="false"
      />
    </div>

    <!-- Progress bar. This is a readout of real load progress, not decoration,
         so it is the one thing on this screen that changes while the player
         waits. Raised as a comms item against the ruling's "nothing else
         moving" rather than removed on the builder's own authority: a loading
         screen with no progress indication is a product decision, not a defect
         fix. -->
    <div class="progress-track">
      <div class="progress-fill" style="width: {$assetLoadProgress}%"></div>
    </div>
    <!-- The percentage sits in its own fixed-width box so the text before it
         cannot shift as the number counts 0 to 100. It needs one because
         Orbitron's digits are NOT equal width (measured on the shipped woff:
         "1" is 391 units against "0" at 834, a 443/1000 em spread) and the
         `font-variant-numeric: tabular-nums` below is INERT against it, since
         that property maps to the OpenType `tnum` feature and Orbitron ships no
         GSUB features at all. See QUALITY_CHARTER.md Q-23. -->
    <p class="progress-label">LOADING CYBERNETICS... <span class="progress-pct">{$assetLoadProgress}</span>%</p>

  </div>
</div>

<style>
  .loading-screen {
    background: #000;
    overflow: hidden;
    z-index: 1000;
  }

  .loading-content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.1rem;
  }

  .wordmark {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-weight: 900;
    font-size: clamp(1rem, 3.2vw, 1.6rem);
    letter-spacing: 0.32em;
    color: #fff;
    text-shadow: 0 0 14px rgba(0, 255, 255, 0.6), 0 0 30px rgba(255, 0, 255, 0.35);
    animation: fade-in 0.8s ease both;
  }

  /* Brand mark: still, with its glow breathing. */
  .brand-mark {
    position: relative;
    width: clamp(140px, 24vw, 220px);
    height: clamp(140px, 24vw, 220px);
    filter: drop-shadow(0 0 24px rgba(0, 255, 255, 0.5)) drop-shadow(0 0 40px rgba(255, 0, 255, 0.3));
    animation: brand-glow-pulse 3.2s ease-in-out infinite;
  }
  .brand-still {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  /* Filter only. Nothing here may touch transform or scale: the gate asserts
     the mark's box is byte-identical across every sample of a ten-second
     window, and that assertion is only possible because the pulse is a glow. */
  @keyframes brand-glow-pulse {
    0%, 100% {
      filter: drop-shadow(0 0 18px rgba(0, 255, 255, 0.38)) drop-shadow(0 0 30px rgba(255, 0, 255, 0.22));
    }
    50% {
      filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.62)) drop-shadow(0 0 52px rgba(255, 0, 255, 0.40));
    }
  }

  /* Game logo slot */
  .logo-block {
    text-align: center;
    animation: fade-in 0.8s 0.15s ease both;
  }
  .loading-logo {
    height: clamp(56px, 10vw, 96px);
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 0 16px rgba(0, 255, 255, 0.6));
  }

  /* Progress bar */
  .progress-track {
    width: min(240px, 60vw);
    height: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 0.4rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00ffff, #ff00ff);
    border-radius: 2px;
    transition: width 0.1s linear;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
  }

  .progress-label {
    /* The boot progress label is the FIRST text a player reads, and it was set
       in Courier New: not the brand face, and on a device without Courier New
       it is whatever the generic monospace happens to be. Orbitron leads now.
       QUALITY_CHARTER.md Q-15.

       CORRECTED 2026-07-27, and the correction is the point. This comment used
       to end "and the monospace chain stays behind it for the tabular figures".
       That was wrong twice over. A fallback stack only participates when the
       leading family is UNAVAILABLE, so once Orbitron loads the tail renders
       nothing; and `font-variant-numeric` below is INERT against Orbitron
       regardless, because it maps to the OpenType `tnum` feature and Orbitron
       ships no GSUB features at all. Putting Orbitron first therefore removed
       the only thing keeping these digits steady, which is why the percentage
       now sits in its own fixed-width box in the markup. QUALITY_CHARTER.md
       Q-23. */
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    color: rgba(0, 255, 255, 0.5);
    font-variant-numeric: tabular-nums;
  }
  /* 3ch reserves the width of "100" in the current face, so the label's text
     cannot move as the number grows. Right-aligned so the digits settle against
     the per cent sign rather than drifting away from it. */
  .progress-pct {
    display: inline-block;
    min-width: 3ch;
    text-align: right;
  }

  /* Opacity only. The 8px translateY these two carried is what made the
     wordmark and the game logo slide into place on every load. */
  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .brand-mark { animation: none; }
    .wordmark, .logo-block { animation: none; }
  }
</style>
