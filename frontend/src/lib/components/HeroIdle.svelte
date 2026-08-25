<script lang="ts">
  // HeroIdle.svelte, the crossed-arms pilot: breathing by default, reacting when
  // something happens.
  //
  // R112 made him alive. R114 makes him respond. The idle is unchanged in
  // character: a five-frame breathe over 4.4 seconds. On top of it sit two
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
  // changes 36-48%. The cut is no larger than what the idle does every 0.88s.
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
  import { BIG_WIN_THRESHOLD } from '../stores/winCountUp'

  export let assetBase: string

  type HeroMotion = 'idle' | 'win' | 'energy' | 'glance'

  const SHEET: Record<HeroMotion, string> = {
    idle: 'hero_crossed_idle_5f.png',
    win: 'hero_win_reaction_8f.png',
    energy: 'hero_feature_trigger_7f.png',
    glance: 'hero_glance_6f.png',
  }
  const FRAMES: Record<HeroMotion, number> = { idle: 5, win: 8, energy: 7, glance: 6 }
  // ~0.19s a frame for the reactions against the idle's 0.88s: fast enough to read
  // as a response, slow enough not to look twitchy at game distance. The glance is
  // slower still, because it is an idle accent rather than a response to anything.
  const DURATION_MS: Record<HeroMotion, number> = { idle: 4400, win: 1500, energy: 1300, glance: 1700 }

  const BOX_W = 206
  const BOX_H = 407

  // THE SPAN DIFFERS BETWEEN A LOOP AND A ONE-SHOT, and getting it wrong renders
  // nothing at all.
  //
  // The idle loops, so it uses steps(5) over a FULL five-frame span: the timing
  // function yields 0, 1/5 ... 4/5, which is frames 01..05, and the wrap back to
  // frame 01 is the loop.
  //
  // A one-shot must END on its final frame and hold it. steps(8) would yield
  // 0, 1/8 ... 7/8 during play and then 1 at completion, and with `forwards` that
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
    timer = setTimeout(() => { motion = 'idle' }, DURATION_MS[next])
  }

  // ── Win: once per round, after the reels stop ────────────────────────────────
  // Guarded by a round latch rather than by the multiplier alone, because
  // winMultiplier is derived from winAmount and stays raised for the whole
  // settled round: without the latch any unrelated re-render would re-fire it.
  let reactedThisRound = false
  $: if ($isSpinning) reactedThisRound = false
  $: if (!$isSpinning && !reactedThisRound && $winMultiplier >= BIG_WIN_THRESHOLD) {
    reactedThisRound = true
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

<div
  class="hero-idle"
  data-motion={motion}
  data-testid="hero-idle"
  aria-hidden="true"
  style="background-image: url('{assetBase}/ui/hero/{SHEET[motion]}');
         background-size: {BOX_W * FRAMES[motion]}px {BOX_H}px;
         --hero-span: {SPAN_PX[motion]}px;"
></div>

<style>
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

  .hero-idle[data-motion='idle']   { animation: hero-cycle-idle 4.4s steps(5) infinite; }
  /* `forwards` holds the final frame until Svelte swaps the sheet back, so there
     is no flash of frame 01 between the reaction ending and the idle resuming. */
  .hero-idle[data-motion='win']    { animation: hero-cycle-win 1.5s steps(8, jump-none) 1 forwards; }
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
  }
</style>
