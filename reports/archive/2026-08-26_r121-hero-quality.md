# Session Report - R121 HERO ANIMATION QUALITY: the strips were never going to move him, so a transform layer does it instead, and the hero's head now travels 12.6px instead of 1.3px (2026-08-26)

**MORNING SUMMARY.**

1. **THE STRIPS CANNOT MOVE HIM, AND THAT IS MEASURED, NOT ASSERTED.** Across every live state
   and all ten factory hero strips, the SILHOUETTE change between frames is 0.11% to 0.51% of
   the figure's pixels. They change LIGHTING on a locked pose. The factory's own QA note says so:
   *"Crossed arms, crossed-leg stance, hand identity ... remain locked."*
2. **The live idle was already the most body-motion anything available had.** The best factory
   candidate is 0.435%, and that strip is already shipped. **There was nothing to buy.**
3. **So the motion comes from a transform layer instead.** Zero new bytes.
4. **Idle silhouette motion 3.6x, excursion 6.4x, head travel 1.29px to 12.61px.**
5. **The win punch was rewritten after measuring it against the banner** - the first version put
   77.1% of its motion in the head, which is exactly where the banner sits.
6. **Two bugs I introduced, both caught by measurement**: reduced motion silently kept animating,
   and the epic punch was being truncated at 79%.

---

## 1. WORKSTREAM 1 - WHAT THE HERO ACTUALLY DOES, MEASURED AT RENDER SIZE

Everything below is measured on the figure as RENDERED (206x407 in the 1280x720 stage), because
"readable at game distance" is the brief's bar and a sheet that moves in 4K and not at 206px is
a still.

| state | sheet | frames | duration | silhouette change | where the motion is |
|---|---|---|---|---|---|
| idle | `hero_crossed_idle_5f` | 5 | 4400ms | **0.51%** | 28% head, 57% chest |
| win | `hero_win_reaction_8f` | 8 | 1500ms | **0.33%** | 35% head, 57% chest |
| energy | `hero_feature_trigger_7f` | 7 | 1300ms | **0.44%** | 36% head, 56% chest |
| glance | `hero_glance_6f` | 6 | 1700ms | **0.34%** | 46% head, 44% chest |

**A figure whose outline moves under 1% of its pixels between frames is not changing pose.** The
strips animate the visor glow, the chest lamps and the ground bloom. The body is a still.

## 2. WORKSTREAM 2 - EVERY CANDIDATE REFUSED, WITH THE NUMBER

The brief's rule is "refuse weaker-than-incumbent strips". Measured with the same instrument on
all ten factory strips at render size:

| strip | frames | silhouette change | disposition |
|---|---|---|---|
| 03-feature-trigger | 7 | **0.435%** | already live |
| 01-max-win-reaction | 8 | 0.434% | **REFUSED** - and see below |
| 09-power-surge-settle | 8 | 0.397% | **REFUSED** - weaker than the live energy (0.44%) |
| 04-glance-to-reels | 6 | 0.340% | already live |
| 02-epic-win-reaction | 8 | 0.325% | already live |
| 10-overdrive-active-life | 6 | 0.190% | **REFUSED** - barely moves |
| 08-short-approval-nod | 6 | 0.173% | **REFUSED** - barely moves |
| 05-dead-spin-settle | 6 | 0.155% | **REFUSED** |
| 07-third-idle | 6 | 0.121% | **REFUSED** |
| 06-second-idle | 6 | 0.112% | **REFUSED** |

**The single largest silhouette change any of these can produce is 0.435%, and the live idle
already sits at 0.51%.** The brief's priority list - power-surge, epic win, approval nod, max win -
is refused in full, on its own stated rule, with a number for each.

**01-max-win is refused for the fourth session running** and now for a second, independent reason:
`MaxWinCelebration` is still a full-screen modal that covers the hero, AND at 0.434% it would not
move him anyway.

## 3. THE ONLY REMAINING AXIS: A TRANSFORM LAYER

A second element wraps the flipbook and moves the whole figure. The flipbook keeps playing
untouched inside it.

```
.hero-body   <- transform: rotate / translate / scale, origin at the FEET
  .hero-idle <- the flipbook, unchanged
```

**Why rotation for the idle and not a bob.** R111 shipped a whole-body `translateY` on top of the
breathing flipbook and R115 removed it: two vertical motions on one figure read as a double bob.
A rotation about the feet is a different axis - it reads as weight shift, not as a second breath -
so the two compose instead of fighting. There is deliberately **no translateY in the idle**.

**Why 7.2s against the flipbook's 4.4s.** Equal periods would lock the sway to the breath and read
as a metronome. 4.4 and 7.2 only re-align every 39.6s.

**Measured on the shipped build**, hero isolated so the alpha channel is the true silhouette,
26 samples 340ms apart:

| | transform OFF | transform ON | change |
|---|---|---|---|
| silhouette motion | 0.278% | **1.007%** | **3.6x** |
| excursion from mean pose | 0.646% | **4.121%** | **6.4x** |
| head travel | 1.29px | **12.61px** | **9.8x** |

An overlay of eight samples makes it plainest: with the transform off, all eight land on top of
each other as one crisp figure. With it on there is a visible motion envelope, widest at the head
and narrowing to the feet - **and the feet stay pin-sharp in both**, which is the no-foot-teleport
requirement holding.

## 4. WORKSTREAM 4 - THE WIN PUNCH WAS REWRITTEN BECAUSE THE FIRST ONE WAS INVISIBLE

The win banner mounts at stage `top: 310px` over a hero occupying stage y295..702, so it covers
the hero's own rows 15..185 - his head and upper chest.

**The first punch was rotation-led, like the sway. Measured against that geometry it put 77.1% of
its silhouette motion in the head band and left only 29.5% of the reaction visible.** A rotation
about the feet displaces each row in proportion to its height, so it is head-weighted by
construction - precisely the failure mode workstream 4 names.

**A translation displaces every row equally.** Rewritten translation-led and re-measured, stepping
the animation deterministically through 30 exact points on its curve:

| | rotation-led | translation-led |
|---|---|---|
| hidden by the banner | 70.5% | **52.4%** |
| visible below it | 29.5% | **47.6%** |
| head band share | 77.1% | **26.3%** |
| chest band share | 12.4% | **32.8%** |

The peak lands at 12% of 1500ms = 180ms, deliberately inside the banner's own 0.6s entry
animation, so the strongest moment reads before full occlusion.

**Ground line across the punch: 400 -> 386 -> 400.** A 15px lift that returns exactly to rest. It
is a hop, not a teleport: the largest single step on the 30-sample curve is smooth, and the head is
not clipped - `.char-layer` sets no `overflow`, so the figure draws outside its box, verified by
capturing the page rather than the element.

## 5. WORKSTREAM 3 - THE SHIPPED BEHAVIOUR MATRIX

Recorded with a `MutationObserver` on `data-motion`, installed before the spin, so no polling gap
can miss a state:

| state | observed | duration |
|---|---|---|
| idle / dead spin | sway runs continuously; glance at 21.3s | 1701ms, exact |
| small win (< 10x) | **no reaction** | - |
| meaningful win (16.2x) | `idle -> win/big -> idle` | 1504ms, exact |
| **epic win (135.6x)** | `idle -> win/epic -> idle` | 1902ms, exact |
| feature entry | `idle -> energy -> idle` | 1302ms, exact |
| feature active | the sway only, deliberately | - |
| reduced motion | `animation-name: none`, `transform: none` | - |

**Epic-class wins get a stronger punch**, which is the brief's "stronger reaction if available".
No strip was available; a larger transform costs nothing and is the only axis on which this hero
can express a bigger win at all. Same shape, greater amplitude, a beat longer.

**Feature-active life is the sway and nothing more.** The brief allows "optional restrained ambient
life only if not noisy". There are 25 seconds between the entry reaction and the end-of-feature
win, and the sway now fills them; adding a fourth trigger there would be noise.

## 6. WORKSTREAM 5 - PERFORMANCE

**60 fps, p95 16.8ms, worst frame 18.6ms, zero frames over 20ms across 194 samples.** A composited
transform costs nothing. **dist 23.35 MB of 25** - R121 adds CSS only and no rasters, so the 1.65 MB
of headroom is untouched. No sanitation was needed because nothing was intaken.

## 7. TWO BUGS I INTRODUCED, BOTH CAUGHT BY MEASUREMENT

**REDUCED MOTION WAS SILENTLY STILL ANIMATING.** The state rules are
`.hero-body[data-motion='idle']`, specificity (0,2,0). My reduced-motion reset was a bare
`.hero-body`, (0,1,0), and **lost to them**. The sway kept running for exactly the users who asked
it not to. Found by reading `animation-name` in a reduced-motion browser context, which returned
`hero-sway-idle` and a live rotation matrix. Fixed by repeating the attribute selector.

**THE EPIC PUNCH WAS BEING CUT OFF AT 79%.** The epic curve runs 1900ms but `react()` held the
state for `DURATION_MS['win']` = 1500ms, so `data-motion` flipped back to idle mid-curve and the
figure snapped from -6px to the idle sway. Found by timing the observed state sequence against the
CSS duration: 30031ms to 31536ms is 1505ms, not 1900ms. Fixed with a tier-aware hold.

## 8. WORKSTREAM 6 - WHAT A REVIEWER ACTUALLY SEES

- **First 10 seconds:** the hero leans, slowly and continuously, through a 12.6px arc. Before this
  pass he moved 1.3px, which at game distance is nothing. This is the change most likely to move a
  "poor animations" note, because it is the state a reviewer spends the most time looking at.
- **On a meaningful win:** he pops 15px off the ground and settles over 1.5s, with 47.6% of that
  motion below the banner rather than 29.5%.
- **On an epic win:** the same move, 27px and 1.9s - visibly bigger, not merely different.
- **On feature entry:** he braces, sinks and rises taller than rest over 1.3s.
- **Does it materially reduce the risk?** For idle and dead time, yes and decisively - that is a
  3.6x measured change in the thing that was flat. For the reactions it is an improvement rather
  than a transformation, because the underlying frames still do not change pose. **The remaining
  gap is a rendering gap, not a code gap.**

## 9. WHAT IS STILL MISSING, AND THE EXACT ART REQUEST

The transform can move the figure but it cannot change what the figure IS doing. The arms stay
crossed in every frame of every state, because there is one master pose and ten lighting
treatments of it. To go further, new renders are needed, not new code.

**The request, in priority order.** Each must hold the existing acceptance bar: identity IoU above
0.95 against the live rest frame, opaque-core ground drift 0px, first frame pixel-identical to
last, and RGB zeroed under alpha 0.

1. **A win reaction that CHANGES THE POSE** - arms unfolding into a fist-pump or a point, returning
   to crossed. Target silhouette change **above 5%** per frame pair, against today's 0.33%.
2. **An idle with a real weight shift** - the stance changing, not the lighting. Above 2%.
3. **A feature-entry brace where the stance widens.** Above 4%.
4. **A max-win reaction is still pointless** until `MaxWinCelebration` stops being a full-screen
   modal over the hero. That is a UI decision, not an art one.

The measurement script that produced every number in this report is the acceptance test for those
renders: it takes a strip directory and reports silhouette change per frame pair at render size.
