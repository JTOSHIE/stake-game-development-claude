<script lang="ts">
  // HeroIdle.svelte, the crossed-arms pilot: breathing by default, reacting when
  // something happens.
  //
  // R112 made him alive. R114 makes him respond. The idle is unchanged in
  // character: a SIX-frame weight shift over 4.4 seconds (R126: this said "five-frame
  // breathe"; the strip has been six frames since R122 replaced it, and it shifts
  // weight rather than breathing). On top of it sit two
  // one-shot reactions that borrow the same element and hand it straight back.
  //
  // WHY ONE ELEMENT AND NOT THREE LAYERS. Every sheet is the same figure at the
  // same scale in the same box, so the only thing that has to change to play a
  // reaction is which sheet the element is reading and how many steps it takes
  // through it. Stacking three layers and cross-fading would add two idle
  // compositor layers that are invisible 99% of the time, for a transition that
  // measurement says does not need softening (see below).
  //
  // WHY THE CUT DOES NOT SHOW. The reaction sheets come from a package that
  // derives every frame from one immutable master, and that master is the same
  // crossed-arms hero the idle was rendered from. Measured against the live idle
  // rest frame, entering a reaction changes 34-54% of the figure depending which
  // idle frame we cut from - and a NORMAL step inside the idle loop already
  // changes 36-48%. The cut is no larger than what the idle does every 0.73s.
  //
  // WHY THE LAST FRAME OF EACH REACTION IS A DUPLICATE OF ITS FIRST. It is the
  // exit. Ending on it leaves the figure 36.2% from the idle's rest frame; ending
  // one frame earlier would leave it 48.3% away. The duplicate costs almost
  // nothing after PNG compression and buys the smoothest hand-back available.
  import { onMount, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import { winMultiplier, isSpinning } from '../stores/gameStore'
  import { overdriveVisual } from '../stores/overdriveVisual'
  // The SAME constant the win banner tiers on. This codebase already carries four
  // separate declarations of the win thresholds and one of them disagrees; this
  // is deliberately not a fifth. The hero reacts exactly when the banner does.
  import { BIG_WIN_THRESHOLD, EPIC_WIN_THRESHOLD } from '../stores/winCountUp'

  export let assetBase: string

  type HeroMotion = 'idle' | 'win' | 'energy' | 'glance'

  const SHEET: Record<HeroMotion, string> = {
    idle: 'hero_crossed_idle_6f.png',
    win: 'hero_win_reaction_14f.png',
    energy: 'hero_feature_trigger_7f.png',
    glance: 'hero_glance_6f.png',
  }
  const FRAMES: Record<HeroMotion, number> = { idle: 6, win: 14, energy: 7, glance: 6 }
  // ~0.19s a frame for the reactions against the idle's 0.88s: fast enough to read
  // as a response, slow enough not to look twitchy at game distance. The glance is
  // slower still, because it is an idle accent rather than a response to anything.
  const DURATION_MS: Record<HeroMotion, number> = { idle: 4400, win: 1500, energy: 1300, glance: 1700 }

  const BOX_W = 206
  const BOX_H = 407

  // THE SPAN DIFFERS BETWEEN A LOOP AND A ONE-SHOT, and getting it wrong renders
  // nothing at all.
  //
  // The idle loops, so it uses steps(6) over a FULL six-frame span: the timing
  // function yields 0, 1/6 ... 5/6, which is frames 01..06, and the wrap back to
  // frame 01 is the loop. (R126: this said steps(5)/five frames; the code has said
  // six since R122.)
  //
  // A one-shot must END on its final frame and hold it. A plain steps(n) would yield
  // 0, 1/n ... (n-1)/n during play and then 1 at completion, and with `forwards` that
  // held value is one whole frame PAST the sheet: the element paints empty. So the
  // reactions use steps(n, jump-none) over an (n-1)-frame span, which yields n
  // values from 0 to 1 inclusive, landing exactly on the last frame and staying
  // there until Svelte hands the element back to the idle.
  const SPAN_PX: Record<HeroMotion, number> = {
    idle: -(FRAMES.idle * BOX_W),
    win: -((FRAMES.win - 1) * BOX_W),
    energy: -((FRAMES.energy - 1) * BOX_W),
    glance: -((FRAMES.glance - 1) * BOX_W),
  }

  let motion: HeroMotion = 'idle'
  // Declared here rather than beside the win latch because holdFor() reads it.
  let winTier: 'big' | 'epic' = 'big'
  let reduced = false
  let timer: ReturnType<typeof setTimeout> | undefined

  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Warm both reaction sheets so the first one to play does not decode on the
    // frame it is needed. They would be fetched anyway; this only moves the cost.
    for (const key of ['win', 'energy', 'glance'] as HeroMotion[]) {
      const img = new Image()
      img.src = `${assetBase}/ui/hero/${SHEET[key]}`
    }
  })
  onDestroy(() => clearTimeout(timer))

  /** Play a one-shot, then hand the element back to the idle. */
  // R121: the epic punch runs 1.9s where the standard one runs 1.5s, so the hold
  // has to know which is playing. Without this the state flipped back to idle at
  // 1500ms and cut the epic curve off at 79%, snapping the figure from -6px to
  // the idle sway. Caught by timing the observed state sequence against the CSS.
  function holdFor(next: HeroMotion): number {
    if (next === 'win' && winTier === 'epic') return 1900
    return DURATION_MS[next]
  }

  function react(next: HeroMotion) {
    // Under reduced motion the hero holds its rest frame and nothing interrupts
    // it. A sudden one-shot is exactly the kind of motion that setting exists to
    // suppress, so reactions are not damped here, they are skipped.
    if (reduced) return
    // Never interrupt a reaction in flight. Two overlapping one-shots would cut
    // the first mid-pose, and every strip is only safe to leave at its own end.
    if (motion !== 'idle') return
    motion = next
    clearTimeout(timer)
    timer = setTimeout(() => { motion = 'idle' }, holdFor(next))
  }

  // ── Win: once per round, after the reels stop ────────────────────────────────
  // Guarded by a round latch rather than by the multiplier alone, because
  // winMultiplier is derived from winAmount and stays raised for the whole
  // settled round: without the latch any unrelated re-render would re-fire it.
  let reactedThisRound = false
  // R121: the punch is scaled to the win. The brief asks for a stronger
  // epic-class reaction "if available" - no STRIP is available (every factory
  // strip is the same locked pose), but a stronger transform costs nothing and
  // is the only axis on which this hero can express a bigger win at all.
  $: if ($isSpinning) reactedThisRound = false
  $: if (!$isSpinning && !reactedThisRound && $winMultiplier >= BIG_WIN_THRESHOLD) {
    reactedThisRound = true
    winTier = $winMultiplier >= EPIC_WIN_THRESHOLD ? 'epic' : 'big'
    react('win')
  }

  // ── Feature: the moment Overdrive turns on ───────────────────────────────────
  let sawOverdrive = false
  $: {
    if ($overdriveVisual && !sawOverdrive) react('energy')
    sawOverdrive = $overdriveVisual
  }

  // ── Glance: the only motion here that nothing triggers ───────────────────────
  // R117. Everything above is a RESPONSE. The gap a reviewer actually sees is the
  // long middle: a dead spin, then another, with the hero breathing identically
  // through all of it. The glance is a one-shot look toward the reels on a slow
  // timer, so the character reads as paying attention rather than as a loop.
  //
  // Deliberately NOT random per-tick: a fixed cadence with a long period is calmer
  // than a coin flip, and it cannot cluster. It is skipped entirely while spinning,
  // while Overdrive runs and while any reaction is in flight, so it can never step
  // on something that means something.
  const GLANCE_EVERY_MS = 24_000
  let glanceTimer: ReturnType<typeof setInterval> | undefined
  onMount(() => {
    glanceTimer = setInterval(() => {
      if (reduced || motion !== 'idle') return
      if (get(isSpinning) || get(overdriveVisual)) return
      if (get(winMultiplier) >= BIG_WIN_THRESHOLD) return
      react('glance')
    }, GLANCE_EVERY_MS)
  })
  onDestroy(() => clearInterval(glanceTimer))
</script>

<!-- TWO LAYERS, DELIBERATELY. The inner element plays the flipbook; the outer one
     moves the whole figure. They are separate because the flipbook CANNOT move him:
     every frame in every strip is the same locked pose under different lighting
     (measured, see the style block), so body motion has to come from a transform. -->
<div class="hero-body" data-motion={motion} data-tier={motion === 'win' ? winTier : null} aria-hidden="true">
  <div
    class="hero-idle"
    data-motion={motion}
    data-testid="hero-idle"
    aria-hidden="true"
    style="background-image: url('{assetBase}/ui/hero/{SHEET[motion]}');
           background-size: {BOX_W * FRAMES[motion]}px {BOX_H}px;
           --hero-span: {SPAN_PX[motion]}px;"
  ></div>
</div>

<style>
  /* ===== THE BODY LAYER (R121) ===============================================
     WHY THIS EXISTS, AND WHY IT IS NOW MUCH SMALLER THAN R121 SHIPPED IT.
     R121 measured every live state and all ten factory strips at render size and
     found silhouette change of 0.11% to 0.51% between frames: they animated
     LIGHTING on a locked pose. A transform was then the only way to move him.

     R122 replaced those strips with real pose-changing performances - the arms
     actually unfold and recross - measured at 3.4% to 5.4% mean per frame pair,
     8x to 12x the incumbents by total silhouette path length. The frames now
     carry the motion, so the transform's job has changed from SUPPLYING motion
     to seasoning it, and the idle sway in particular is dialled right back: two
     lateral motions on one figure is the same double-bob mistake R115 removed,
     just on a different axis.

     WHAT IT DOES. The outer element rotates the whole figure about its FEET,
     which is what a person standing with their arms crossed actually does. The
     inner element keeps playing the flipbook untouched.

     WHY ROTATION AND NOT A BOB. R111 shipped a whole-body translateY slide on
     top of the breathing flipbook and R115 removed it: two vertical motions on
     one figure read as a double bob. A rotation about the feet is a different
     axis - it reads as weight shift, not as a second breath - so the two
     compose instead of fighting. There is deliberately NO translateY here.

     WHY 7.2s AGAINST THE FLIPBOOK'S 4.4s. Equal periods would lock the sway to
     the breath and read as a metronome. 4.4 and 7.2 only re-align every 39.6s,
     so the combined motion does not visibly repeat.

     DISTINCT KEYFRAME NAMES PER STATE, for the same reason the flipbook needs
     them: CSS restarts an animation on a NAME change, not a duration change. A
     shared name would hand the reaction the idle's elapsed time. */
  .hero-body {
    position: absolute;
    inset: 0;
    transform-origin: 50% 97%;   /* the feet, not the centre */
    will-change: transform;
  }
  /* R122: amplitude cut from 1.05deg to 0.32deg. MEASURED: with the new
     weight-shift strip the frames alone give 1.614% silhouette change and
     13.29px of head travel - already more than R121's strip-plus-full-sway
     managed (1.007% / 12.61px). Layering the old sway on top pushed excursion
     to 7.0% and head travel to 18.7px while per-sample silhouette change FELL
     to 1.545%, which is the signature of two motions cancelling at some phases
     and stacking at others. Two lateral motions on one figure is the double-bob
     mistake R115 removed, on a different axis.

     It is not removed, because it still earns its keep: the strip is a 6-frame
     loop on a 4.4s cycle and repeats exactly, and a slow rotation at 7.2s beats
     against it so the loop never lands the same way twice. That is all it does
     now - de-looping, not motion. */
  @keyframes hero-sway-idle {
    0%   { transform: rotate(-0.32deg); }
    50%  { transform: rotate( 0.32deg); }
    100% { transform: rotate(-0.32deg); }
  }
  /* THE WIN PUNCH IS TRANSLATION-LED, AND THAT IS A MEASURED CORRECTION.
     The first version was rotation-led about the feet, like the sway. Measured
     against the banner's real geometry - it mounts at stage top:310 over a hero
     occupying stage y295..702, so it covers the hero's own rows 15..185 - that
     put 77.1% of the reaction's silhouette motion in the HEAD band and left only
     29.5% of it visible. The player saw almost none of the reaction he earned.

     A rotation about the feet displaces each row in proportion to its height, so
     it is head-weighted by construction. A TRANSLATION displaces every row
     EQUALLY, so the chest and stance - the part that stays visible under the
     banner - move as much as the head does. The rotation is kept small, for
     character rather than for reach.

     The peak lands at 12% of 1.5s = 180ms, deliberately inside the banner's own
     0.6s entry animation, so the strongest moment reads before full occlusion. */
  @keyframes hero-punch-win {
    0%   { transform: translateY(0)     rotate(0deg)    scale(1);     }
    12%  { transform: translateY(-15px) rotate(-1.2deg) scale(1.028); }
    30%  { transform: translateY(-4px)  rotate( 0.9deg) scale(1.010); }
    52%  { transform: translateY(-8px)  rotate(-0.5deg) scale(1.014); }
    76%  { transform: translateY(-2px)  rotate( 0.2deg) scale(1.004); }
    100% { transform: translateY(0)     rotate(0deg)    scale(1);     }
  }
  @keyframes hero-punch-epic {
    0%   { transform: translateY(0)     rotate(0deg)    scale(1);     }
    10%  { transform: translateY(-27px) rotate(-2.0deg) scale(1.050); }
    26%  { transform: translateY(-7px)  rotate( 1.5deg) scale(1.016); }
    46%  { transform: translateY(-16px) rotate(-0.9deg) scale(1.028); }
    68%  { transform: translateY(-4px)  rotate( 0.5deg) scale(1.008); }
    86%  { transform: translateY(-6px)  rotate(-0.2deg) scale(1.010); }
    100% { transform: translateY(0)     rotate(0deg)    scale(1);     }
  }
  /* Feature entry: a brace. He sinks, then rises taller than rest, then settles. */
  @keyframes hero-brace-energy {
    0%   { transform: rotate(0deg)    scale(1);                 }
    18%  { transform: rotate(0.5deg)  scale(0.984) translateY(4px); }
    46%  { transform: rotate(-0.8deg) scale(1.030) translateY(-5px); }
    72%  { transform: rotate(0.3deg)  scale(1.010) translateY(-1px); }
    100% { transform: rotate(0deg)    scale(1)     translateY(0);   }
  }
  /* The glance is a look, so the body barely turns: a small horizontal squeeze
     plus a lean is enough to sell a head turn on a flat sprite. */
  @keyframes hero-turn-glance {
    0%   { transform: rotate(0deg)     scaleX(1);     }
    30%  { transform: rotate(-1.3deg)  scaleX(0.985); }
    70%  { transform: rotate(-1.3deg)  scaleX(0.985); }
    100% { transform: rotate(0deg)     scaleX(1);     }
  }
  .hero-body[data-motion='idle']   { animation: hero-sway-idle 7.2s ease-in-out infinite; }
  .hero-body[data-motion='win']    { animation: hero-punch-win 1.5s cubic-bezier(.22,1.2,.36,1) 1 both; }
  /* Epic-class wins get the same SHAPE at greater amplitude and a beat longer,
     so the difference reads as "bigger", not as "different". A distinct keyframe
     NAME, not just a longer duration, for the restart reason above. */
  .hero-body[data-motion='win'][data-tier='epic'] {
    animation: hero-punch-epic 1.9s cubic-bezier(.22,1.25,.36,1) 1 both;
  }
  .hero-body[data-motion='energy'] { animation: hero-brace-energy 1.3s cubic-bezier(.3,.9,.3,1) 1 both; }
  .hero-body[data-motion='glance'] { animation: hero-turn-glance 1.7s ease-in-out 1 both; }

  .hero-idle {
    position: absolute;
    inset: 0;
    background-repeat: no-repeat;
    background-position-x: 0;
    /* Matches the flat sprite's own shadow, so no mode changes how the hero sits
       in the scene. */
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.55));
  }

  /* THREE SEPARATE KEYFRAME NAMES, DELIBERATELY, even though the bodies are
     identical. CSS restarts an animation when its NAME changes, not when its
     duration does: with one shared name, switching from the 4.4s idle to the 1.5s
     reaction kept the running animation's elapsed time, which was usually already
     past the shorter duration, so the reaction started at its own end. Distinct
     names make every mode change a clean restart. */
  @keyframes hero-cycle-idle {
    from { background-position-x: 0; }
    to   { background-position-x: var(--hero-span); }
  }
  @keyframes hero-cycle-win {
    from { background-position-x: 0; }
    to   { background-position-x: var(--hero-span); }
  }
  @keyframes hero-cycle-energy {
    from { background-position-x: 0; }
    to   { background-position-x: var(--hero-span); }
  }
  @keyframes hero-cycle-glance {
    from { background-position-x: 0; }
    to   { background-position-x: var(--hero-span); }
  }

  .hero-idle[data-motion='idle']   { animation: hero-cycle-idle 4.4s steps(6) infinite; }
  /* `forwards` holds the final frame until Svelte swaps the sheet back, so there
     is no flash of frame 01 between the reaction ending and the idle resuming. */
  /* R126: steps(14), not steps(8). THIS IS THE ONE PLACE THE FRAME COUNT IS
     HARDCODED - background-size and --hero-span both derive from FRAMES.win in the
     markup above, so a denser sheet with a stale steps() here does not error, it
     silently plays the first 8 of 14 frames and stops mid-gesture. */
  .hero-idle[data-motion='win']    { animation: hero-cycle-win 1.5s steps(14, jump-none) 1 forwards; }
  .hero-idle[data-motion='energy'] { animation: hero-cycle-energy 1.3s steps(7, jump-none) 1 forwards; }
  .hero-idle[data-motion='glance']  { animation: hero-cycle-glance 1.7s steps(6, jump-none) 1 forwards; }

  /* Freeze to frame 01, which IS the shipped hero pose, so the reduced-motion
     presentation is the game's own established still. Reactions never start under
     this setting, so only the idle needs stilling. */
  @media (prefers-reduced-motion: reduce) {
    .hero-idle {
      animation: none;
      background-position-x: 0;
    }
    /* THE ATTRIBUTE SELECTOR HAS TO BE REPEATED HERE, and this is not cosmetic.
       The state rules above are `.hero-body[data-motion='idle']`, specificity
       (0,2,0). A bare `.hero-body` reset is (0,1,0) and LOSES to them, so the
       sway kept running under prefers-reduced-motion. Caught by reading the
       computed animation-name in a reduced-motion browser context, which
       reported hero-sway-idle and a live rotation matrix. */
    .hero-body[data-motion] { animation: none; transform: none; }
  }
</style>
