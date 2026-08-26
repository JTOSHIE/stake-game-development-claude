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
  // crossed-arms hero the idle was rendered from.
  //
  // R126 RE-DERIVED THESE FIGURES AND THE OLD ONES WERE ALL WRONG. This comment
  // used to claim the cut changed "34-54%" of the figure, that a normal idle step
  // "already changes 36-48%", and that ending one frame early would leave the
  // figure "48.3%" from rest against "36.2%". None of those reproduce against the
  // shipped art; they are stale from an art generation two intakes ago. Measured
  // now, at render size 206x407, against the strips actually on disk:
  //
  //   cutting IN  (an idle frame -> win frame 01): 0.00% to 10.23%, depending
  //               which idle frame we cut from
  //   a NORMAL step inside the idle loop:          5.36% to 18.74%
  //   cutting OUT (win last frame -> idle rest):   0.00%, exactly
  //
  // The argument survives and is stronger than it was written: the worst cut into
  // a reaction (10.23%) is smaller than the idle's own worst step (18.74%), and
  // the cut back out is free, because every reaction strip ends on the rest pose.
  //
  // WHY THE LAST FRAME OF EACH REACTION IS A DUPLICATE OF ITS FIRST. It is the
  // exit, and it is what makes that 0.00% true. Ending one frame earlier would
  // leave the figure 0.53% from rest instead - still small, because R126's win
  // strip keeps the source's ease-out frame, but not free. The duplicate costs
  // almost nothing after PNG compression and buys the smoothest hand-back there is.
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
    win: 'hero_win_reaction_16f.png',
    energy: 'hero_feature_trigger_7f.png',
    glance: 'hero_glance_6f.png',
  }
  const FRAMES: Record<HeroMotion, number> = { idle: 6, win: 16, energy: 7, glance: 6 }
  // ~0.09s a frame for the win against the idle's 0.73s: fast enough to read
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
  let reduceMq: MediaQueryList | undefined
  let onReduceChange: ((e: MediaQueryListEvent) => void) | undefined
  let timer: ReturnType<typeof setTimeout> | undefined

  onMount(() => {
    // R129: THIS USED TO BE A ONE-SHOT READ AND THAT WAS WRONG IN BOTH DIRECTIONS.
    // macOS Accessibility > Reduce motion propagates to a live tab without a reload, so a
    // single read at mount goes stale the moment a player toggles it. Turning it ON left
    // `reduced` false and reactions kept firing at someone who had just asked them to stop;
    // turning it OFF left `reduced` true and the hero never reacted again for the rest of
    // the session. Both were reachable by a real user action, and an adversarial pass
    // produced the first one in a browser.
    const rmq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced = rmq.matches
    onReduceChange = (e: MediaQueryListEvent) => {
      reduced = e.matches
      // Drop anything in flight immediately rather than letting it play out: a player who
      // turns this on mid-reaction wants it to stop now, not in 1.9 seconds.
      if (e.matches) { clearTimeout(timer); motion = 'idle' }
    }
    rmq.addEventListener('change', onReduceChange)
    reduceMq = rmq
    // Warm both reaction sheets so the first one to play does not decode on the
    // frame it is needed. They would be fetched anyway; this only moves the cost.
    for (const key of ['win', 'energy', 'glance'] as HeroMotion[]) {
      const img = new Image()
      img.src = `${assetBase}/ui/hero/${SHEET[key]}`
    }
  })
  onDestroy(() => {
    clearTimeout(timer)
    if (reduceMq && onReduceChange) reduceMq.removeEventListener('change', onReduceChange)
  })

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
  <!-- R129, TWO STACKED FLIPBOOK LAYERS FOR THE IDLE ONLY. Layer A is the element
       everything already knew about and keeps the test id; layer B sits under it,
       runs the SAME sheet one frame ahead, and the two cross-dissolve. See the
       style block for why, and for why the reactions deliberately do NOT get this. -->
  <div
    class="hero-idle hero-layer-a"
    data-motion={motion}
    data-tier={motion === 'win' ? winTier : null}
    data-testid="hero-idle"
    aria-hidden="true"
    style="background-image: url('{assetBase}/ui/hero/{SHEET[motion]}');
           background-size: {BOX_W * FRAMES[motion]}px {BOX_H}px;
           --hero-span: {SPAN_PX[motion]}px;
           --hero-frame: {DURATION_MS[motion] / FRAMES[motion]}ms;"
  ></div>
  <div
    class="hero-idle hero-layer-b"
    data-motion={motion}
    data-tier={motion === 'win' ? winTier : null}
    aria-hidden="true"
    style="background-image: url('{assetBase}/ui/hero/{SHEET[motion]}');
           background-size: {BOX_W * FRAMES[motion]}px {BOX_H}px;
           --hero-span: {SPAN_PX[motion]}px;
           --hero-frame: {DURATION_MS[motion] / FRAMES[motion]}ms;"
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
     the breath and read as a metronome. 4.4 and 7.2 only re-align every 79.2s (R129: this said 39.6s, which is where the sway is at the OPPOSITE extreme - 9.0000 flipbook cycles against 5.5000 sway cycles - so it is the anti-alignment, not the re-alignment. LCM(4.4, 7.2) = 79.2),
     so the combined motion does not visibly repeat.

     DISTINCT KEYFRAME NAMES PER STATE, for the same reason the flipbook needs
     them: CSS restarts an animation on a NAME change, not a duration change. A
     shared name would hand the reaction the idle's elapsed time. */
  .hero-body {
    position: absolute;
    inset: 0;
    transform-origin: 50% 97%;   /* the feet, not the centre */
    will-change: transform;
    /* Matches the flat sprite's own shadow, so no mode changes how the hero sits in the
       scene. It lives HERE rather than on the sheet layers so it is computed once from
       the composite of both - see the note in .hero-idle. */
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.55));
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
     against the banner's real geometry, that put most of the reaction's motion in
     the HEAD band, which the banner covers, and the player saw almost none of the
     reaction he earned.

     THE BANNER GEOMETRY, RE-DERIVED AT R129 BECAUSE R126's CORRECTION WAS ITSELF WRONG.
     The original figure said the banner "covers the hero's own rows 15..185", from
     reading `top:310` as the banner's TOP edge; WinBanner pairs it with
     `translateY(-50%)`, so 310 is the band's CENTRE. R126 corrected that and introduced
     three new errors of its own, which an adversarial pass caught and which are fixed
     here. It reported the hero box as y280.5..695.1, height 414.6 - that is a MID-PUNCH
     TRANSFORMED rect quoted as the resting box - and it quoted one tier's coverage
     against another tier's rectangle. The tell was arithmetic: its own two shares summed
     to 99.4, which cannot be a two-way partition.

     Measured live at 1280x720, stage scale 1, and re-derived offline on the shipped
     16-frame sheet. The hero box is y294.98..702.02, height 407.04, which is BOX_H.
     The banner height is per-tier, so the coverage is too:

         tier   banner span    covers hero rows   share of the reaction's motion
         big    y254.5..365.5      0..73                 12.68% behind, 87.32% below
         mega   y240  ..380        0..85                 17.83% behind, 82.17% below
         epic   y224  ..396        0..101                29.44% behind, 70.56% below

     Each pair sums to exactly 100.00. The hero reacts from BIG_WIN_THRESHOLD = 10x, so
     the COMMON case is the big tier and 87% of the motion is visible; even at epic it is
     71%. The chest band, rows 106..171, carries 40.07% on its own (39.00% is rows
     106..170 - the previous figure was an off-by-one in the stated band).

     The conclusion the rest of this note rests on is unchanged and is now better
     supported: a rotation about the feet is head-weighted by construction, and the head
     is exactly the part the banner covers.

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
    /* R129: THE DROP-SHADOW MOVED UP TO .hero-body AND THAT IS A REAL FIX, NOT TIDYING.
       With two stacked layers each carrying its own drop-shadow, the shadow is drawn
       TWICE wherever they overlap, so it darkened as layer B faded in and then snapped
       back at every step boundary. An adversarial pass measured the skirt going 0.1291
       to 0.3033 mean alpha across a hold, a 2.35x pulse at 1.36 Hz, and a 3.269 pop at
       the frame6->frame1 seam - a seam that is otherwise a perfect no-op, because those
       two frames are byte-identical. One shadow, computed once from the composite on the
       parent, removes both. */
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

  /* ===== R129, THE CROSS-DISSOLVED IDLE ====================================
     THE DEFECT, MEASURED BEFORE ANY CHANGE. The owner's word was "ticking", and
     the numbers agree, but not where you would guess. Neighbour-frame silhouette
     change at render size 206x407, against the time each still is HELD:

         idle    6 frames / 4400ms =  733ms a frame ( 1.4 fps)  worst step 18.74%
         win    16 frames / 1500ms =   94ms a frame (10.7 fps)  worst step 18.63%
         brace   7 frames / 1300ms =  186ms a frame ( 5.4 fps)  worst step 19.45%

     The win and the idle take the SAME SIZE STEP. The idle holds it 7.8x longer.
     At 1.4 fps the eye fully resolves each still and then watches it snap: that is
     a slide show, and it is the state on screen almost all the time. The tick is
     TEMPORAL, and it is the idle. The reactions are not the problem.

     THE FIX IS TWO STACKED COPIES OF THE SAME SHEET, ONE FRAME APART, DISSOLVING.
     Layer A shows frame N at FULL opacity throughout; layer B sits one frame ahead
     showing N+1 and fades in over the frame's hold, on top of it. At each step boundary A becomes N+1 at
     full opacity while B becomes N+2 at zero, so the composite is continuous
     across the seam rather than cutting. Six discrete stills become one continuous
     morph. It costs ZERO BYTES: same sheet, same six frames, one extra element.

     WHAT IT DOES NOT DO, AND AN ADVERSARIAL PASS IS WHY THIS PARAGRAPH EXISTS.
     This is NOT a true cross-dissolve and it cannot be one. Two stacked RGBA layers
     composite as out = aTop + aBottom(1 - aTop), so holding composite alpha at 1
     REQUIRES the bottom layer to stay opaque - which means at the end of every dissolve
     the composite carries the OLD frame's silhouette as well as the new one, and then
     snaps back to a single frame at the step. The alternative, fading both, removes the
     union but drops composite alpha to 0.750 at every midpoint: a 25% translucency pulse
     on the whole figure, 1.4 times a second. The algebra forces a choice between the two.
     Measured offline on the real sheet, exactly:
         hold      old hard cut     new end-of-dissolve snap
         f1->f2         5.36%              2.80%
         f2->f3         5.38%              2.79%
         f3->f4        18.74%             10.32%
         f4->f5         5.48%              2.80%
         f5->f6         5.44%              2.76%
         f6->f1         0.00%              0.00%
     So the pops are roughly HALVED, not removed, and the loop's one free transition (f6
     and f1 are byte-identical) stays free. The union was chosen over the alpha dip on
     area: the dip is 25% wrong across 100% of the figure, the union is 100% wrong across
     2.8% of it, so the union is between 2.4x and 9x less wrong by area. It is also the
     END of a 733ms continuous move rather than a cut out of a held still, which is a
     different thing perceptually even at the same number.

     WHY IT DOES NOT GHOST TWO BODIES, WHICH IS THE OBVIOUS OBJECTION. Measured
     per pair, the share of the union that is solid in only one of the two frames
     is 5.4%, 5.4%, 18.7%, 5.5%, 5.4%. Four of five transitions are near-invisible.
     Even the worst - frame 3 to 4, where the weight shift swaps which leg is
     forward - leaves 81.3% of the figure common to both, so the composite reads as
     ONE robot with a softened limb, not as two. Rendered and inspected at 0, 25,
     50, 75 and 100% before this was written.

     WHY THE REACTIONS DO NOT GET THIS, AND IT IS NOT AN OVERSIGHT. The one-shots
     use steps(n, jump-none) with `forwards`, so they END on the last frame and
     hold it. A layer running one frame AHEAD would run off the end of the sheet
     there and the hero would fade to nothing at the close of every reaction. They
     also do not need it: at 94ms and 186ms a frame they are 7.8x and 3.9x faster
     than the idle. Layer B is therefore inert unless data-motion is 'idle'.

     --hero-frame is the state's own ms-per-frame, computed in the markup from
     DURATION_MS / FRAMES, so the dissolve can never drift out of phase with the
     steps: both are derived from the same two numbers rather than restated. */
  .hero-layer-b { opacity: 0; animation: none; }
  /* Layer B carries the class `hero-idle`, so the reaction rules below match it too
     and it would run a second, invisible copy of every one-shot at opacity 0. It is
     harmless but it is a compositor animation doing nothing, and it makes the claim
     "layer B is inert unless the state is idle" false in the computed styles even
     though it is true on screen. Made literally true here.
     BOTH CLASSES ON PURPOSE: `.hero-layer-b:not([attr])` is (0,2,0) because :not()
     takes its argument's specificity, which exactly TIES the reaction rules below and
     then loses on source order. Verified by reading the computed animation-name in the
     browser: it still reported hero-cycle-win. Adding .hero-idle makes it (0,3,0).
     Third specificity tie this file has lost while looking like it should have won. */
  .hero-idle.hero-layer-b:not([data-motion='idle']) { animation: none; }

  /* LAYER A DOES NOT FADE, AND THAT IS A CORRECTION TO THIS SESSION'S OWN FIRST
     ATTEMPT. It originally ran hero-dissolve-out while B ran hero-dissolve-in, which
     looks symmetrical and is wrong: two stacked SEMI-TRANSPARENT layers do not
     composite back to solid. For a pixel opaque in both frames, source-over gives
     out = a_top + a_bot(1 - a_top) = t + (1-t)^2, which dips to 0.750 at t=0.5. The
     hero went 25% TRANSPARENT at every dissolve midpoint, 1.4 times a second - a
     brightness pulse traded for the tick, which is exactly the kind of swap R126 was
     burned by. Holding the bottom layer solid gives t + 1(1-t) = 1.000 at every t,
     and the colour still lerps correctly because the TOP layer's own alpha does the
     blending. Verified arithmetically before the change and by sampling computed
     opacity after it. */
  .hero-layer-a[data-motion='idle'] {
    animation: hero-cycle-idle 4.4s steps(6) infinite;
  }
  .hero-layer-b[data-motion='idle'] {
    animation: hero-cycle-idle 4.4s steps(6) calc(-1 * var(--hero-frame)) infinite,
               hero-dissolve-in var(--hero-frame) linear infinite;
  }
  @keyframes hero-dissolve-in  { from { opacity: 0; } to { opacity: 1; } }

  /* The old single rule `.hero-idle[data-motion='idle']` lived here and is GONE on
     purpose. It was (0,2,0), exactly tying the two layer rules above, and it sat
     LATER in source order - so it would have won and silently overwritten both
     dissolve animations with the plain one-layer flipbook. The two rules above now
     cover both layers between them, so it is redundant as well as harmful. */
  /* `forwards` holds the final frame until Svelte swaps the sheet back, so there
     is no flash of frame 01 between the reaction ending and the idle resuming. */
  /* R126: steps(16), not steps(8). THIS IS THE ONE PLACE THE FRAME COUNT IS
     HARDCODED - background-size and --hero-span both derive from FRAMES.win in the
     markup above, so a denser sheet with a stale steps() here does not error, it
     silently plays the first 8 of 16 frames and stops mid-gesture. */
  .hero-idle[data-motion='win']    { animation: hero-cycle-win 1.5s steps(16, jump-none) 1 forwards; }
  /* R129: THE EPIC WIN'S FLIPBOOK DIED 400ms BEFORE ITS BODY DID.
     holdFor() returns 1900ms for an epic win and .hero-body runs hero-punch-epic for
     1.9s, but this rule pinned the SHEET to 1.5s and nothing could override it,
     because data-tier was only ever set on the outer .hero-body div - no selector
     could reach the sheet element for the epic case at all. So from 1500ms to 1900ms
     the sprite sat frozen on its final frame while the transform kept sliding it
     around: 21.1% of the reaction, the entire settle, playing as a still being
     translated. And because win frame 16 is 0.00% from idle rest, the frozen image
     is the REST pose, so the hero visually finished his reaction 400ms early and was
     then just moved about.
     data-tier is now on both sheet layers, and this override stretches the same 16
     frames across the epic's own 1.9s: 119ms a frame instead of 94ms, still 8.4fps,
     and the flipbook now ends exactly when the body does. (0,3,0) beats the (0,2,0)
     rule above outright rather than relying on source order. */
  .hero-idle[data-motion='win'][data-tier='epic'] { animation-duration: 1.9s; }
  .hero-idle[data-motion='energy'] { animation: hero-cycle-energy 1.3s steps(7, jump-none) 1 forwards; }
  .hero-idle[data-motion='glance']  { animation: hero-cycle-glance 1.7s steps(6, jump-none) 1 forwards; }

  /* Freeze to frame 01, which IS the shipped hero pose, so the reduced-motion
     presentation is the game's own established still. Reactions never start under
     this setting, so only the idle needs stilling. */
  @media (prefers-reduced-motion: reduce) {
    /* R128: `.hero-idle` HERE USED TO BE BARE, AND IT DID NOTHING. This is the
       SAME specificity bug the note below records for the body layer, one layer
       down, three lines away from its own fix, and it survived R121 through R127.
       The state rules are `.hero-idle[data-motion='idle']` at (0,2,0); a bare
       `.hero-idle` reset is (0,1,0) and loses, so the six-frame flipbook kept
       running for a player who asked for reduced motion.
       Measured in a real reduced-motion browser context before and after: the
       media query reported true, computed animation-name was still
       hero-cycle-idle, and background-position-x cycled -618px, -1030px, -206px
       over 3.2s, identical to a no-preference context. With the attribute
       repeated the selector is (0,2,0), ties the state rules, and wins on source
       order because this block comes after them. */
    /* R129: !important, AND IT IS NOT LAZINESS. The tier rules above are (0,3,0) -
       `.hero-body[data-motion='win'][data-tier='epic']` and its sheet sibling - and these
       resets are (0,2,0), so the epic tier OUTRANKED the accessibility override and
       escaped it. An adversarial pass reproduced that in a browser: with the media query
       reporting reduce=true, an epic win still ran hero-punch-epic for 1.9s with 27.5px of
       vertical travel, while big wins and the feature brace (both (0,2,0)) were correctly
       stilled. Chasing specificity here means every future tier rule has to remember to
       stay below a number nobody writes down; !important makes the override
       unconditional, which is what an accessibility reset is FOR. GameGrid.svelte's own
       reduced-motion block already does this for the same reason. */
    .hero-idle[data-motion] {
      animation: none !important;
      background-position-x: 0 !important;
    }
    /* R129: layer B must also be stilled AND hidden. Without the opacity reset it
       would sit at whatever the dissolve last left it on, half-covering layer A
       with a second frozen copy. */
    .hero-layer-b[data-motion] { animation: none !important; opacity: 0 !important; }
    /* THE ATTRIBUTE SELECTOR HAS TO BE REPEATED HERE, and this is not cosmetic.
       The state rules above are `.hero-body[data-motion='idle']`, specificity
       (0,2,0). A bare `.hero-body` reset is (0,1,0) and LOSES to them, so the
       sway kept running under prefers-reduced-motion. Caught by reading the
       computed animation-name in a reduced-motion browser context, which
       reported hero-sway-idle and a live rotation matrix. */
    .hero-body[data-motion] { animation: none !important; transform: none !important; }
  }
</style>
