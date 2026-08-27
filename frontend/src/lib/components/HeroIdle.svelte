<script lang="ts">
  // HeroIdle.svelte, the crossed-arms pilot: PLANTED at rest, reacting when
  // something happens.
  //
  // R130 FROZE THE IDLE. The owner's word was "an amateur ticking clock", and
  // the ruling was that bad motion scores worse than a still. The idle is now a
  // held rest pose - no flipbook, no sway, no dissolve - and the win unfold and
  // the feature brace are the only performances this hero has.
  //
  // WHAT THE IDLE IS NOW. One element, one sheet, background-position-x: 0,
  // animation-name: none. That is the whole of it. It is achieved by DELETING
  // the idle rules, not by adding a rule that switches them off - see the
  // FREEZE BY DELETION note in the style block, which is load-bearing.
  //
  // WHERE THE "TINY LIFE" LIVES, AND IT IS NOT IN THIS FILE. The brief allowed a
  // small local accent on the resting figure. It already existed, one level up:
  // SceneGroup.svelte mounts .antenna-light (an amber orb pulsing on 2.8s) and
  // .visor-glint (a specular sweep on 6s, silent for 92% of its cycle) as
  // SIBLINGS of this component, inside the same 206x407 .char-layer box, so their
  // percentages land on this sprite 1:1. Measured live: the antenna sits at
  // x53.9..76.9 / y61..83.7 of the hero box, which is the ocular pod, and the
  // glint at x66..107 / y45.3..94.1, which is the visor's cyan half. Both are
  // local light on a static figure - no body translation, no silhouette change.
  // DO NOT ADD ANOTHER ONE HERE. A glow child of .hero-body would be cast into
  // the parent's drop-shadow (see .hero-body below), so pulsing it would pulse
  // the shadow - R129's double-shadow defect arriving by a new route.
  //
  // WHY ONE ELEMENT. Every sheet is the same figure at the same scale in the
  // same box, so the only thing that has to change to play a reaction is which
  // sheet the element is reading and how many steps it takes through it.
  //
  // WHY THE CUT DOES NOT SHOW, AND THE FREEZE MADE IT FREE. The reaction sheets
  // derive from the same immutable master as the idle, and every one of them
  // both STARTS and ENDS on the idle's rest pose. Measured at render size
  // 206x407 against idle frame 01, as silhouette change / mean absolute RGB:
  //
  //     win frame 01     0.000% / 0.000      win frame 16    0.000% / 0.003
  //     brace frame 01   0.000% / 0.000      brace frame 07  0.003% / 0.004
  //
  // Both ends of both reactions are free. That is BETTER than it was: while the
  // idle animated, a reaction could be cut into from any of six frames, up to
  // 10.242% silhouette away from rest (frame 04). Frozen on frame 01, the cut in
  // is exactly the 0.000% above. The freeze target must therefore stay frame 01,
  // which `background-position-x: 0` on .hero-idle already supplies.
  // (The RGB companion to that 10.242% is quoted as 37.312 in this session's
  // commit message and is nearer 36.967 - it moves with the mask convention where
  // the silhouette figure does not, so the silhouette number is the one to cite.)
  import { onMount, onDestroy } from 'svelte'
  import { winMultiplier, isSpinning } from '../stores/gameStore'
  import { overdriveVisual } from '../stores/overdriveVisual'
  // The SAME constant the win banner tiers on. This codebase already carries four
  // separate declarations of the win thresholds and one of them disagrees; this
  // is deliberately not a fifth. The hero reacts exactly when the banner does.
  import { BIG_WIN_THRESHOLD, EPIC_WIN_THRESHOLD } from '../stores/winCountUp'

  export let assetBase: string

  type HeroMotion = 'idle' | 'win' | 'energy'
  /** The one-shots. Everything that animates is one of these; 'idle' is a held still. */
  type HeroReaction = Exclude<HeroMotion, 'idle'>

  // R130 REMOVED A FOURTH STATE, 'glance'. It was a 6-frame flipbook on a 24s
  // timer plus a body turn, and it was the last idle-state motion left after the
  // freeze. Two measurements retired it, neither of them about the tick - by the
  // tick metric the glance was innocent, at 1.255% x 283ms against the idle's
  // 18.75% x 733ms, some 46x calmer. (That 1.255% is threshold-sensitive because
  // the glance sheet has soft edges: it reads 1.378% at alpha>=64. The idle's
  // 18.75% is stable across the same range. Compare the two only at one threshold.)
  //   1. Its body animation rotated -1.3deg about the feet and HELD that off-rest
  //      for 680ms, displacing the head 8.96px at the top of the box - just over
  //      TWICE the entire peak-to-peak swing of the sway this session deleted, and
  //      about half the feature brace's own peak. The ratio is scale-invariant on
  //      the centreline and is exactly sin(1.3deg)/(2*sin(0.32deg)) = 2.03; an
  //      earlier draft of this comment said 2.12, which reproduces from no probe
  //      point on the sprite and contradicted the two numbers beside it (9.10/4.41
  //      = 2.06). Check a ratio against its own operands before writing it down.
  //      A pendulum rule cannot mean only the small pendulum, and once the sway
  //      went this was the ONLY transform left anywhere in the idle state.
  //   2. Its art alone could not carry it. Across all six glance frames the
  //      silhouette bbox is invariant and the centroid drifts 0.239px: the head
  //      turn was sold entirely by the transform, so cutting the transform alone
  //      would have left a strip nobody could see still holding the state machine
  //      - and react() refuses every reaction while it does.
  //
  // A THIRD REASON WAS OFFERED AND IT WAS WRONG, RECORDED SO IT IS NOT RE-USED.
  // Glance frame 01 sits a small but non-zero distance from idle frame 01, where
  // every win and brace endpoint is byte-identical to it - which looks like proof
  // that the glance is the one strip not landing on rest. It is not: the glance
  // sheet is authored at 475x940 a frame where the other three are 394x780, so it
  // takes a different downsample path into the 206x407 box. CONTROL: push the
  // IDLE's own frame 01 through a 475x940 detour and back, and it lands 5.220 mean
  // RGB from itself against the glance's 5.537 - both measured the same way, over
  // the intersection eroded 5px to exclude edges. So 94.3% of the gap is the
  // resampler, not the art. QUOTE BOTH SIDES OF A RATIO FROM THE SAME MASK: an
  // earlier draft paired that 94% with an un-eroded 5.825, which is a different
  // denominator (and does not itself reproduce under any single convention).
  // Measure a cross-sheet difference against a resample control before calling it
  // a pose difference.
  //
  // hero_glance_6f.png (1,655,215 B) is consequently an ORPHAN and still ships. It
  // was left on disk deliberately - reinstating it is a revert, not a re-render.

  const SHEET: Record<HeroMotion, string> = {
    idle: 'hero_crossed_idle_6f.png',
    win: 'hero_win_reaction_16f.png',
    energy: 'hero_feature_trigger_7f.png',
  }
  // FRAMES.idle SURVIVES THE FREEZE AND IS NOT DEAD MACHINERY. It looks like
  // flipbook state and it is not: background-size below is BOX_W * FRAMES[motion],
  // so it is what scales the six-frame strip such that position 0 paints frame 01
  // at the right size. Drop it and the frozen hero renders at the wrong scale.
  const FRAMES: Record<HeroMotion, number> = { idle: 6, win: 16, energy: 7 }
  // ~0.09s a frame for the win, ~0.19s for the brace: fast enough to read as a
  // response, slow enough not to look twitchy at game distance. There is no idle
  // entry because a still has no duration.
  const DURATION_MS: Record<HeroReaction, number> = { win: 1500, energy: 1300 }

  const BOX_W = 206
  const BOX_H = 407

  // THE SPAN IS A ONE-SHOT SPAN, AND THE TWO FORMULAS MUST NOT BE UNIFIED.
  // (No quoted word in this paragraph, deliberately: BOX_W and BOX_H are rendered
  // in the markup below, so locale_completeness_check reads the 400 characters
  // after their declarations looking for player-facing literals, and a quoted
  // ALL-CAPS word here fails that gate with no runtime symptom at all.)
  //
  // A one-shot must END on its final frame and hold it. A plain steps(n) would
  // yield 0, 1/n ... (n-1)/n during play and then 1 at completion, and with
  // `forwards` that held value is one whole frame PAST the sheet: the element
  // paints empty. So the reactions use steps(n, jump-none) over an (n-1)-frame
  // span, which yields n values from 0 to 1 inclusive, landing exactly on the
  // last frame and staying there until Svelte hands the element back.
  //
  // Until R130 this map also carried an idle entry at a FULL n-frame span,
  // because a loop wraps where a one-shot stops. That entry is gone with the
  // loop. Anyone restoring a looping state here needs the full-span form back -
  // applying this (n-1) formula to a 6-frame loop drops frame 06, and applying
  // the full-span form to the win gives -3296px against a background-size of
  // 3296px, which renders a BLANK hero with nothing thrown and no gate failed.
  const SPAN_PX: Record<HeroReaction, number> = {
    win: -((FRAMES.win - 1) * BOX_W),
    energy: -((FRAMES.energy - 1) * BOX_W),
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
    // The idle sheet is not warmed here because it is the painted image already.
    for (const key of ['win', 'energy'] as HeroReaction[]) {
      const img = new Image()
      img.src = `${assetBase}/ui/hero/${SHEET[key]}`
    }
  })
  onDestroy(() => {
    clearTimeout(timer)
    if (reduceMq && onReduceChange) reduceMq.removeEventListener('change', onReduceChange)
  })

  /** Play a one-shot, then hand the element back to the resting pose. */
  // R121: the epic punch runs 1.9s where the standard one runs 1.5s, so the hold
  // has to know which is playing. Without this the state flipped back to idle at
  // 1500ms and cut the epic curve off at 79%, snapping the figure from -6px to
  // the idle sway. Caught by timing the observed state sequence against the CSS.
  function holdFor(next: HeroReaction): number {
    if (next === 'win' && winTier === 'epic') return 1900
    return DURATION_MS[next]
  }

  function react(next: HeroReaction) {
    // Under reduced motion the hero holds its rest frame and nothing interrupts
    // it. A sudden one-shot is exactly the kind of motion that setting exists to
    // suppress, so reactions are not damped here, they are skipped.
    if (reduced) return
    // Never interrupt a reaction in flight. Two overlapping one-shots would cut
    // the first mid-pose, and every strip is only safe to leave at its own end.
    // R130: with the glance gone, the only thing that can hold this gate closed
    // is another real reaction, so a feature brace can no longer be swallowed by
    // an idle accent that happened to be playing.
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
</script>

<!-- TWO ELEMENTS, DELIBERATELY. The inner element paints the sheet; the outer one
     moves the whole figure during a reaction. They are separate because the
     flipbook CANNOT move him: every frame in every strip is the same locked pose
     under different lighting, so body motion has to come from a transform.
     At rest neither of them animates. -->
<div class="hero-body" data-motion={motion} data-tier={motion === 'win' ? winTier : null} aria-hidden="true">
  <div
    class="hero-idle"
    data-motion={motion}
    data-tier={motion === 'win' ? winTier : null}
    data-testid="hero-idle"
    aria-hidden="true"
    style="background-image: url('{assetBase}/ui/hero/{SHEET[motion]}');
           background-size: {BOX_W * FRAMES[motion]}px {BOX_H}px;
           --hero-span: {motion === 'idle' ? 0 : SPAN_PX[motion]}px;"
  ></div>
</div>

<style>
  /* ===== THE BODY LAYER ======================================================
     WHAT IT DOES. The outer element rotates and lifts the whole figure during a
     reaction, about its FEET. The inner element keeps painting the sheet
     untouched. At rest it has no animation at all.

     R130 REMOVED THE IDLE SWAY FROM HERE. It was `hero-sway-idle 7.2s`, a
     +/-0.32deg rotation that displaced the head 4.30px peak to peak. It was kept
     at R122 for one reason - to de-loop a 6-frame flipbook that repeated exactly
     every 4.4s, by beating a 7.2s period against it. THE FLIPBOOK IT WAS
     DE-LOOPING NO LONGER EXISTS, so its only remaining effect was to be the
     left-right pendulum the owner asked to be rid of. Deleted, not switched off.

     NO REPLACEMENT `animation: none` RULE WAS ADDED HERE, ON PURPOSE. When
     `motion` flips back to 'idle' the reaction selectors simply stop matching,
     animation-name computes to none, the `both`/`forwards` fill is dropped with
     the animation, and the body returns to transform:none by itself. A rule like
     `.hero-body[data-motion] { animation: none }` outside the media query would
     be (0,2,0) - it would TIE the reaction rules below and win on source order,
     silently deleting the win punch and the feature brace. See FREEZE BY
     DELETION further down; this is the same trap on the body layer. */
  .hero-body {
    position: absolute;
    inset: 0;
    /* THE PIVOT IS NOT SWAY MACHINERY, AND IT MUST NOT LEAVE WITH IT. This comment
       used to sit inside the sway essay, which made it read as part of it. Every
       surviving reaction rotates - hero-punch-win -1.2deg, hero-punch-epic -2.0deg,
       hero-brace-energy -0.8deg - and all three pivot on this. Remove it with the
       sway and the win punch swings the FEET instead of the head, with nothing
       thrown and no gate failed. */
    transform-origin: 50% 97%;   /* the feet, not the centre */
    /* Now serves only the reactions - at rest nothing here animates. Kept rather
       than moved onto the reaction rules because a will-change that arrives on the
       same frame as the animation it is hinting is too late to help, and the cost
       is one 206x407 compositor layer that the drop-shadow below would promote
       anyway. */
    will-change: transform;
    /* Matches the flat sprite's own shadow, so no mode changes how the hero sits in the
       scene. It lives HERE rather than on the sheet layer so it is computed once from
       the whole subtree - see the note in .hero-idle.
       IT ALSO APPLIES TO ANY CHILD ADDED LATER. That is why the resting micro-life
       lives in SceneGroup.svelte and not in here: a glow child would be drawn into
       this shadow, so pulsing the glow would pulse the shadow. */
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.55));
  }
  /* THE WIN PUNCH IS TRANSLATION-LED, AND THAT IS A MEASURED CORRECTION.
     The first version was rotation-led about the feet. Measured against the banner's
     real geometry, that put most of the reaction's motion in the HEAD band, which the
     banner covers, and the player saw almost none of the reaction he earned.

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
  /* DISTINCT KEYFRAME NAMES PER STATE, for the same reason the flipbook needs
     them: CSS restarts an animation on a NAME change, not a duration change. A
     shared name would hand the reaction the previous one's elapsed time. */
  .hero-body[data-motion='win']    { animation: hero-punch-win 1.5s cubic-bezier(.22,1.2,.36,1) 1 both; }
  /* Epic-class wins get the same SHAPE at greater amplitude and a beat longer,
     so the difference reads as "bigger", not as "different". A distinct keyframe
     NAME, not just a longer duration, for the restart reason above. */
  .hero-body[data-motion='win'][data-tier='epic'] {
    animation: hero-punch-epic 1.9s cubic-bezier(.22,1.25,.36,1) 1 both;
  }
  .hero-body[data-motion='energy'] { animation: hero-brace-energy 1.3s cubic-bezier(.3,.9,.3,1) 1 both; }

  /* ===== THE SHEET LAYER =====================================================
     AT REST THIS RULE IS THE WHOLE IDLE: position 0 of the six-frame strip, which
     is the shipped rest pose, and no animation to move it off. */
  .hero-idle {
    position: absolute;
    inset: 0;
    background-repeat: no-repeat;
    background-position-x: 0;
    /* R129: THE DROP-SHADOW MOVED UP TO .hero-body AND THAT IS A REAL FIX, NOT TIDYING.
       With two stacked layers each carrying its own drop-shadow, the shadow was drawn
       TWICE wherever they overlapped, so it darkened as the second faded in and then
       snapped back at every step boundary: 0.1291 to 0.3033 mean alpha across a hold, a
       2.35x pulse at 1.36 Hz. Those two layers are gone at R130, but the shadow stays on
       the parent - one shadow computed once from the composite is correct regardless of
       how many children there are, and it is what keeps a future child from doubling it
       again. */
  }

  /* ===== FREEZE BY DELETION ==================================================
     THE IDLE IS FROZEN BECAUSE NOTHING MATCHES IT, NOT BECAUSE SOMETHING SWITCHES
     IT OFF. There is deliberately no `.hero-idle[data-motion='idle']` rule and no
     blanket `.hero-idle[data-motion] { animation: none }`. READ THIS BEFORE ADDING
     EITHER, because both are traps this file has already been caught by:

     - A blanket `.hero-idle[data-motion] { animation: none; background-position-x: 0 }`
       outside the media query is (0,2,0). It exactly TIES the three reaction rules
       below, and any such rule added at the end of the block sits LATER in source
       order, so it WINS - silently deleting the 16-frame win unfold and the
       7-frame feature brace with no error, no 404 and no failing gate. This is the
       same class of tie that cost R121, R128 and R129 a shipped bug each.
     - A `.hero-idle[data-motion='idle']` rule is (0,2,0) too, and R129 recorded
       that it likewise ties and beats the layer rules that used to live here.

     WHAT R130 DELETED, so nothing quietly grows back:
       @keyframes hero-cycle-idle    the 4.4s / 6-frame flipbook. 733ms a frame,
                                     1.36fps, worst step 18.75% - the tick itself.
       @keyframes hero-sway-idle     the +/-0.32deg, 7.2s left-right pendulum.
       @keyframes hero-dissolve-in   the R129 dual-buffer cross-dissolve.
       @keyframes hero-turn-glance   the glance's body turn.
       @keyframes hero-cycle-glance  the glance's flipbook.
       .hero-layer-a / .hero-layer-b the two stacked sheet elements the dissolve
                                     needed. One element remains and it carries
                                     data-testid="hero-idle", as it always did.

     DO NOT RENAME `hero-idle`. It reads like idle machinery and it is the exact
     opposite: it is the class that carries the WIN and FEATURE flipbooks below,
     the epic duration stretch, and the reduced-motion sheet reset. Renaming or
     dropping it removes all four in one edit, with no compile error.

     EVERY SPECIFICITY FIGURE IN THIS FILE IS WRITTEN PRE-SCOPING. Svelte appends
     one scoping class to each of these selectors, verified in the built CSS
     (`.hero-idle[data-motion]` ships as `.hero-idle[data-motion].svelte-xxxxxx`),
     so a stated (0,2,0) is really (0,3,0). The shift is +1 for every selector
     here, so every tie and every comparison above is preserved and the arguments
     hold as written; the absolute numbers are one class light. The only shape
     that scopes differently is the descendant form, which takes `:where()` and
     adds nothing - and nothing in this file uses it. */

  /* THREE SEPARATE KEYFRAME NAMES, DELIBERATELY, even though the bodies are
     identical. CSS restarts an animation when its NAME changes, not when its
     duration does: with one shared name, switching between states kept the
     running animation's elapsed time, which was usually already past the shorter
     duration, so the new state started at its own end. Distinct names make every
     mode change a clean restart. (There were four until R130 retired the glance.) */
  @keyframes hero-cycle-win {
    from { background-position-x: 0; }
    to   { background-position-x: var(--hero-span); }
  }
  @keyframes hero-cycle-energy {
    from { background-position-x: 0; }
    to   { background-position-x: var(--hero-span); }
  }

  /* `forwards` holds the final frame until Svelte swaps the sheet back, so there
     is no flash of frame 01 between the reaction ending and the rest pose resuming. */
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
     data-tier is now on the sheet layer too, and this override stretches the same 16
     frames across the epic's own 1.9s: 119ms a frame instead of 94ms, still 8.4fps,
     and the flipbook now ends exactly when the body does. (0,3,0) beats the (0,2,0)
     rule above outright rather than relying on source order. */
  .hero-idle[data-motion='win'][data-tier='epic'] { animation-duration: 1.9s; }
  .hero-idle[data-motion='energy'] { animation: hero-cycle-energy 1.3s steps(7, jump-none) 1 forwards; }

  /* The resting pose IS frame 01, so under reduced motion the hero already looks
     exactly as he does at rest. Reactions never start under this setting, so these
     resets exist for the state that is already in flight when a player turns it on. */
  @media (prefers-reduced-motion: reduce) {
    /* THESE TWO RESETS ARE NOT REDUNDANT AFTER THE FREEZE, and the first one reads
       as though it were. It no longer has an idle animation to stop - but it is what
       stills the 16-frame WIN flipbook and the 7-frame FEATURE flipbook, both of
       which survive, and it is the second line of defence behind the live matchMedia
       listener for a player who turns reduce ON with a reaction already running.
       Deleting it restores the exact R128 defect one layer down.

       R128: `.hero-idle` HERE USED TO BE BARE, AND IT DID NOTHING. The state rules
       are (0,2,0); a bare `.hero-idle` reset is (0,1,0) and loses, so the flipbook
       kept running for a player who asked for reduced motion. Survived R121-R127.

       R129: !important, AND IT IS NOT LAZINESS. The tier rules above are (0,3,0) and
       these resets are (0,2,0), so the epic tier OUTRANKED the accessibility override
       and escaped it - an epic win ran 1.9s with 27.5px of travel while the media
       query said reduce=true. Chasing specificity here means every future tier rule
       has to remember to stay below a number nobody writes down; !important makes the
       override unconditional, which is what an accessibility reset is FOR. */
    .hero-idle[data-motion] {
      animation: none !important;
      background-position-x: 0 !important;
    }
    /* THE ATTRIBUTE SELECTOR HAS TO BE REPEATED HERE, and this is not cosmetic.
       The state rules above are `.hero-body[data-motion='win']`, specificity
       (0,2,0). A bare `.hero-body` reset is (0,1,0) and LOSES to them, so the
       body kept animating under prefers-reduced-motion. Caught by reading the
       computed animation-name in a reduced-motion browser context, which
       reported a live rotation matrix. */
    .hero-body[data-motion] { animation: none !important; transform: none !important; }
  }
</style>
