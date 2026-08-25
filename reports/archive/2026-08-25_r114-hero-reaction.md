# R114: the pilot reacts to wins and powers up on the feature

Date: 2026-08-25. Branch: `claude/r114-hero-reaction`. Review lane, unattended.

Brief saved verbatim: `reports/briefs/FS_FABLE_R114_HERO_REACTION_Prompt.md`. Branch:
`claude/r114-hero-reaction`, review lane. **He no longer breathes the same through a dead spin and
a big win.**

## The shortest true summary

**Two one-shot reactions ship**: a win acknowledgement on meaningful wins, and an energy-up on
Overdrive entry. Both return to the idle by construction.

**The identity gate passed this time, unlike R112.** All four strips in this package are the same
robot, because the package derives every frame from one immutable master whose sha256 is the
crossed-arms master the shipped hero came from. Silhouette IoU against the live rest frame is
0.9695 to 0.9932 across every frame of every strip.

**Two strips were still refused**, one of them for being weaker than what already ships.

**A CSS bug nearly shipped a hero that rendered nothing at all**, and the state machine reported
success while it did. Only a screenshot caught it.

---

## WORKSTREAM 1 and 2: audit and identity gate

The package ships its own hero-strip-audit.json declaring per-strip contracts. Everything below
was measured first-hand against the **live** idle sheet, not against the package's own reference.

| Strip | Frames | Ground drift (opaque core) | IoU vs live rest | f1 == fN | Peak change vs rest | Head travel | Status |
|---|---:|---:|---:|---|---:|---:|---|
| **01-win-reaction** | 8 | **0 px** | 0.9713-0.9932 | yes | **57.1%** | **9.5 src px** | **SHIPPED** |
| **03-energy-up** | 6 | **0 px** | 0.9695-0.9932 | yes | **56.4%** | 8.6 src px | **SHIPPED** |
| 02-attention-glance | 6 | 0 px | 0.9789-0.9932 | yes | 31.9% | 7.0 src px | **REFUSED, weak** |
| 04-crossed-arms-idle-b | 6 | 0 px | 0.9869-0.9932 | yes | 30.4% | 2.2 src px | **REFUSED, regression** |

**Every strip passes the identity gate.** None drifts into a second body family, none goes to a
neutral arms-at-sides stance, and every one returns to a frame that is pixel-identical to its
first.

### The ground-line claim needed the right instrument

The win-reaction and energy-up strips extend **16 to 18 px below the feet** at their peak, which
by a naive bounding box reads as the foot teleport this brief forbids. The package's audit claims
that is a reactive ground glow rather than movement. **It is right, and the test is the alpha
threshold:**

| Measured at | win-reaction drift | energy-up drift |
|---|---:|---:|
| soft alpha (>8) | 16 px | 18 px |
| mid alpha (>=128) | 1 px | 1 px |
| **opaque core (>=250)** | **0 px** | **0 px** |

The feet do not move. A glow pools under them.

### Why idle-B was refused, and it is the more interesting refusal

04-crossed-arms-idle-b is offered as a second continuous idle. It is **weaker than the idle
already shipping**: 30.4% peak change against the live idle's 59.0% between extremes, and 2.2
source px of head travel against 6.6.

The reason is structural. R112's idle is **re-rendered per frame**, so every surface relights. This
package's frames are **deterministic transforms of one master** (the audit publishes the
per-frame `lift`, `expand`, `head_angle` and `energy` values). A transform can move a sprite; only
a re-render can relight it. **Adopting idle-B would have regressed the thing the owner approved
two sessions ago.**

02-attention-glance was skipped on the brief's own instruction to skip rather than ship
distraction: 31.9% peak against the win reaction's 57.1%, and the package's own QA calls it
"intentionally subtle" and suggests holding frames to compensate. It would also have cost a
further ~1.5 MB.

---

## WORKSTREAM 3: the reaction architecture, and every question the brief asked

`HeroIdle.svelte` becomes a three-state machine on one element: `idle`, `win`, `energy`.

| Question | Answer, and why |
|---|---|
| **What wins trigger a reaction** | `$winMultiplier >= BIG_WIN_THRESHOLD`, **imported** from `winCountUp.ts`. The hero reacts exactly when the banner does. |
| **Do low-value wins stay idle** | Yes. Verified: a 2x win produces no reaction at all. |
| **Does max win use a stronger path** | **No, deliberately.** A wincap is 5000x so it clears the same threshold and plays the same reaction, but `MaxWinCelebration` is a full-screen modal that covers the hero completely. A separate stronger hero path would render behind an opaque overlay and be seen by nobody. |
| **Reduced motion** | Reactions are **skipped, not damped**. A sudden one-shot is exactly what that setting exists to suppress. The hero holds its rest frame. Verified under emulation. |
| **Banner and hero together** | They share one threshold and one moment, so they read as one event rather than two. Measured occlusion below. |
| **Recovery to rest** | By construction: each strip's last frame is pixel-identical to its first, and `forwards` holds it until the sheet swaps back. |

**One guard worth naming.** `react()` refuses to interrupt a reaction in flight. Every strip is
only safe to leave at its own end, so an overlapping trigger is dropped rather than cutting the
first mid-pose.

**And one edge the reconnaissance caught that I then checked myself.** `winAmount` and `isWincap`
are public writables set not only by `recordSpinResult()` but by `ReplayMode.svelte` in nine
places and by App's session-recovery path. So a store-subscribing hero could react on those paths
too. Read first-hand: `App.svelte:1972` is `{#if isReplay}`, `:1975` is the top-level `{:else}`,
and `<SceneGroup>` is at `:2159` — **inside the else branch. The hero is not mounted during Bet
Replay at all**, so it cannot react there. Session recovery does run in the main view, where a
reaction is correct: the player is watching that win being presented.

---

## WORKSTREAM 4 and 5: what shipped

| Asset | Frames | Size | Bytes |
|---|---:|---|---:|
| `ui/hero/hero_win_reaction_8f.png` | 8 | 3800x940 | 2281 KB |
| `ui/hero/hero_energy_up_6f.png` | 6 | 2850x940 | 1692 KB |
| `ui/hero/hero_crossed_idle_5f.png` | 5 | 3500x940 | 2038 KB (was 3410) |

**The idle was re-packed, and that was not optional.** Every hero sheet must share one resolution
or the figure visibly changes sharpness at the cut into a reaction. Measured at true display size
(1221 device px tall, which is a 1.5x stage on a 1920 viewport at DPR 2), a **70% source renders at
99.5% of full sharpness** with a mean pixel difference of 2.42 out of 255. Re-packing the idle to
match therefore costs nothing visible and **returns 1.37 MB**.

Timing: 1.5 s for the eight-frame win reaction and 1.1 s for the six-frame energy-up, about 0.19 s
a frame against the idle's 0.88 s. Fast enough to read as a response, slow enough not to look
twitchy at game distance.

### The bug that nearly shipped, and why the state machine did not catch it

The first implementation reported perfect behaviour: `idle -> win -> idle`, zero console errors,
zero failed requests, the right sheet, the right background-size. **And it rendered nothing.** The
screenshot showed the car and the banner with an empty space where the hero should be.

Two causes, both invisible to a state check:

1. **All three modes shared one animation name.** CSS restarts an animation when its NAME changes,
   not when its duration does. Switching from the 4.4 s idle to the 1.5 s reaction kept the running
   animation's elapsed time, which was normally already past the shorter duration, so the reaction
   began at its own end.
2. **`steps(8)` with `forwards` holds a value one whole frame PAST the sheet.** `steps(n)` yields
   `0, 1/n ... (n-1)/n` during play and then `1` at completion; with a full n-frame span that final
   value paints empty canvas.

Fixed with three distinct keyframe names and `steps(n, jump-none)` over an `(n-1)`-frame span,
which yields n values from 0 to 1 inclusive and lands exactly on the last frame. Confirmed in the
browser: `background-position-x` now moves `0px -> -412px` through the strip instead of sitting at
`-1648px`.

**The lesson is the general one: a state machine reporting the right state is not evidence that
anything was drawn.**

---

## WORKSTREAM 7: visual QA across states

| State | Result |
|---|---|
| Base idle | 60 fps, p95 18.5 ms, **zero frames over 20 ms** |
| Small win (2x) | **no reaction**, stays idle |
| Losing spin | **no reaction** |
| Big win (13.66x, real book round) | `idle -> win -> idle` |
| Feature entry (real trigger round) | `idle -> energy -> idle` |
| Reduced motion, big win | **no reaction**, holds rest frame |
| Console errors / failed requests | **none in any state** |
| Layout, car relationship, overlays | unchanged: same 206x407 box, same `.char-idle-strip` class, same antenna and visor registration |
| dist | **23.08 MB against a 25 MB budget** |

### An honest measurement about how much of the win reaction is actually seen

The win banner sits at stage y 310 and the hero's head occupies roughly y 295 to 390, so **the band
covers the head during exactly the moment the reaction plays**. Measured against where the
reaction's motion actually is:

| Tier | Band | Share of the reaction's motion hidden |
|---|---|---:|
| big | y 255..365 | **17.1%** |
| mega | y 240..380 | **23.7%** |
| epic | y 225..395 | **30.2%** |

**So 70 to 83 per cent of the reaction remains visible**, and the part that survives is the largest
part: the chest lift, which carries 22.8% of the motion on its own and sits below the band. The
visor brighten is what gets partly covered, and only at the higher tiers. **This is pre-existing
composition, not something this session introduced** — the banner has always sat there — but it is
newly relevant now that the hero does something under it.

**The feature reaction has no banner over it and is seen in full**, which is why it is the more
striking of the two on screen.

---

## WORKSTREAM 8: review impact and residuals

**First ten seconds:** a crossed-arms pilot leaning on his car, breathing on a 4.4 s loop, chrome
and carbon catching the light as he moves, antenna blinking, visor glint sweeping.

**On a meaningful win:** he straightens and lifts his chest, his visor powers from magenta through
to bright cyan, and a glow pools under his feet, over about a second and a half, at the same moment
the win banner lands. Then he settles back.

**On Overdrive entry:** the same rise, gentler and unobstructed, with the visor at its brightest.

**Does it materially improve the animation risk? On the hero, yes, and this is the change that
closes the gap R112 left open.** R112's hero was alive but identical through everything. He now has
three distinct states a reviewer can trigger within a minute of play.

**What still blocks a stronger hero performance set:**

1. **The reactions are transforms, not re-renders.** Everything this package can express is a lift,
   a rotate and an energy ramp of one master image. A genuinely stronger set, an arm unfold, a
   turn toward the reels, a lean, needs new renders, not new transforms.
2. **The head is under the banner on wins.** Either the reaction's expression moves to the body, or
   the banner moves, and the second is an owner-audited layout decision.
3. **The glance strip is the missing third state** and would need re-rendering at the win
   reaction's amplitude to be worth shipping.

### Residuals, precise

**1. THE BIGGEST LEVER ON THIS PROJECT'S ASSET BUDGET IS WEBP, AND IT IS NOT TAKEN.** Measured by
the reconnaissance and verified here: `frontend/scripts/lib/previewServer.mjs:61` already declares
`'.webp': 'image/webp'`, so the gates would serve it. The hero idle sheet as WebP q90 is **678 KB
against 3,492 KB as PNG, 19.4%**. **But there is not one .webp file in the project today**, so
adopting it would introduce a new format to a bundle that is about to be submitted. That is an
infrastructure and submission decision, not hero animation work, so it is recorded rather than
taken. **At 92% of budget it is the highest-value thing on this list.**

**2. R111's rig assets ship but cannot be reached.** `SceneGroup` declares
`heroMode: 'idle' | 'rig' | 'static'`, and `App.svelte:2159` mounts `<SceneGroup haze={hazeLevel} />`
without ever passing `heroMode`. The `'rig'` branch therefore carries **~1.1 MB of robot part
rasters to every player and can never render**. Deleting it would return that 1.1 MB; keeping it
costs a page weight for a fallback that needs a code edit to reach anyway. **This is the owner's
call and it was not made here.**

**3. Feature-presentation art untouched.** Nine assets in this package's feature-presentation/
folder plus four support-accents/ were not audited in depth or wired: the brief's own priority put
the hero first, and the budget was spent. They are the natural next intake.

**4. Still true from R113, unchanged:** the win thresholds are declared in four places and one
disagrees (`WinDisplay.svelte` uses mega at 50 with no epic band), and `soundService.ts` has the
tier names offset one step. This session imported `BIG_WIN_THRESHOLD` rather than adding a fifth
declaration.
