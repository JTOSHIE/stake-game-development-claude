# Session Report - R118 PERIMETER TONE-DOWN: the frame stops outshining the game, and the thing that actually makes the feature loud turns out to be somewhere else (2026-08-26)

**MORNING SUMMARY.** The Overdrive perimeter is quieter and every number the brief asked for is
measured on real browser renders of a genuinely running feature. But the honest headline is the
second one:

1. **The perimeter's held opacity is 0.75 to 0.50.** Measured, its band sat at **2.54x the mean
   relative luminance of the reels it frames**. The frame was literally brighter than the game. It
   now sits at **1.44x**: still clearly the brightest thing at the stage edge, no longer dominant.
2. **Feature entry is untouched in strength.** The complaint is the sustained state, not the
   announcement, so entry still blooms to the old 0.75 and then relaxes. Verified frame by frame:
   peak **0.746 at t=446ms**, settled to exactly **0.500 by t=926ms**.
3. **The hero's cost is more than halved** (silhouette separation -4.31% to -1.78%) and the wash on
   him is cut **45.3%**.
4. **The reels were never touched by the perimeter at all** - not reduced, ZERO. Its raster carries
   no light inside the frame box, so "reels stay primary" was already true by construction.
5. **THE PERIMETER IS NOT WHAT MAKES THE FEATURE FEEL OVERBEARING.** Two other layers are far
   larger, and one of them is a hue mismatch that no amount of dimming can fix. Section 6.

---

## 1. THE LIVE PERIMETER, EXACTLY AS FOUND

One element, one raster, all in frontend/src/App.svelte.

**Markup**, App.svelte:2236-2244, gated `{#if overdriveVisualActive || overdriveSettling}`, with
`class:settling={!overdriveVisualActive}` and `data-testid="overdrive-perimeter"`.

**CSS as found**, App.svelte:2584-2612:

| property | value |
|---|---|
| position / inset | `absolute` / `0` |
| z-index | 41 (above the grade at 40, below the HUD at 50) |
| blend mode | `mix-blend-mode: screen` |
| background-size | `100% 100%`, no-repeat |
| pointer-events | `none` |
| held opacity | **0.75** |
| enter | `overdrive-perimeter-in 0.9s ease-out forwards`, from opacity 0 + `brightness(1.35) saturate(1.2)` |
| settle | `overdrive-perimeter-out 1.6s ease-in forwards`, to opacity 0 + `brightness(0.64) saturate(0.21)` |
| reduced motion | `animation: none; opacity: 0.75` |

**Thickness, measured rather than guessed.** The raster is 1344x756, exactly 1.05x the 1280x720
stage and the identical 16:9, so `background-size: 100% 100%` is a uniform 0.9524 downscale with no
distortion. Its light lives entirely in a band from the stage edge inward:

| inset from edge (stage px) | share of total light |
|---|---|
| 0-16 | 18.8% |
| 16-40 | 48.9% (the core) |
| 40-60 | 27.2% |
| 60-90 | 5.0% |
| **beyond 90** | **0.00%** |

**Three separate declarations hard-coded 0.75** - App.svelte:2601 (enter end), :2604 (settle start)
and :2609 (the reduced-motion branch that no gate exercises). All three had to move together or the
change would have been half-applied in exactly the state nobody tests.

**The 1.6s settle has a JavaScript twin.** `overdriveSettleTimer` at App.svelte:586 unmounts the
element after 1600 ms. The CSS duration and that timer must stay equal or the element vanishes
mid-fade, so the duration was deliberately left alone.

## 2. WHAT CHANGED

| | before | after |
|---|---|---|
| held opacity | 0.75 | **0.50** |
| entry peak | 0.75 (then held) | **0.75 (then relaxes to 0.50)** |
| settle departs from | 0.75 | **0.50** |
| settle filter | `brightness(0.64) saturate(0.21)` | **unchanged, deliberately** |
| reduced motion | 0.75 | **0.50** |
| enter duration | 0.9s | unchanged |
| settle duration | 1.6s | unchanged (JS twin) |

**Why 0.50 and not something else.** R115 dialled 0.9 to 0.75 by judgement; the archive is explicit
and no number was ever attached to it - "Opacity was dialled 0.9 to 0.75 deliberately. This is a
STATE that persists for a dozen free spins, not a beat, and the brief asks for restraint." So there
was no measured incumbent to defend. The anchor chosen here is the thing the brief says must stay
primary: **the perimeter band's mean relative luminance as a multiple of the reels'.**

| opacity | band vs reels | signal kept | peak kept | hero edge CR vs off |
|---|---|---|---|---|
| 0.75 | **2.54x** | 100% | 100% | -1.22% |
| 0.65 | 2.04x | 80.2% | 78.4% | -0.60% |
| 0.55 | 1.63x | 64.1% | 60.0% | -0.15% |
| **0.50** | **1.44x** | **56.9%** | **52.4%** | **+0.03%** |
| 0.45 | 1.28x | 50.4% | 44.1% | +0.17% |
| 0.35 | 1.01x | 39.8% | 30.6% | +0.35% |

0.50 is where the frame stops out-shining the reels by a factor of two and a half, keeps a clear
majority of its own signal, and returns the hero to his perimeter-off baseline. Below about 0.35 the
band reaches parity with the reels and stops reading as an energised edge at all.

**The settle filter was left exactly as it was.** R115 measured it from the kit's own separate
settle accent, and that measurement was independently reproduced during this session's recon. Only
the opacity it departs from moves, which makes the cool-out softer for free without touching a
number that was actually derived from art.

## 3. CLEARANCE, MEASURED ON HEAD ART

One running feature, drift-controlled, perimeter forced to each value at the same instant so the
comparison shares a backdrop.

| state | hero added light | hero body lit | **hero edge CR** | car added light | **car edge CR** |
|---|---|---|---|---|---|
| perimeter off | 0 | 0.00% | 2.0014 | 0 | 1.0229 |
| **old 0.75** | +0.01481 | 9.98% | 1.9151 (**-4.31%**) | +0.02059 | 1.0532 (**+2.97%**) |
| **new 0.50** | +0.00810 | 8.65% | 1.9658 (**-1.78%**) | +0.01157 | 1.0508 (**+2.73%**) |

**Hero: improved.** The wash on his body is cut 45.3% and the separation he loses to the perimeter
more than halves. Where the perimeter touches him is narrower than the geometry suggests: the bright
left band lands in his transparent gutter margin, not on him, and the contact is almost entirely at
his feet where the bottom band crosses.

**Car: the perimeter HELPS it, and still does.** Because the ring lights the ground around the car
more than the car itself, it raises the car's edge separation rather than lowering it. The tone-down
keeps nearly all of that (+2.97% to +2.73%) while cutting the wash 43.8%. Toning further would start
giving that benefit back.

**Reels: untouched, and always were.** The perimeter raster carries **zero** light inside the
`.game-frame` box and inside `.grid-slot` - not a small amount, exactly none, on both the raster and
the render. 100% of its light falls outside the frame. No change was needed and none was made.

**HUD and win amounts: structurally safe.** The perimeter is z41; the HUD is z50 and the logo z70,
so both paint over it. This was proven rather than assumed: a composite with no z-order
over-predicted brightness in the logo box by 38.2% of its pixels, which is precisely the shape of
what covers it.

## 4. VIEWPORTS

Five viewports, each driven to a real feature. Held opacity, blend and z were identical at every
one; **zero console errors and zero failed requests everywhere.**

| viewport | mode | hero/car mounted | held | stage scale | perimeter in frame | added-light reduction |
|---|---|---|---|---|---|---|
| 1280x720 | desktop | yes | 0.50 | 1.000 | all four edges | **52.9%** |
| 1920x1080 | desktop | yes | 0.50 | 1.500 | all four edges | **53.1%** |
| 1024x576 | desktop | yes | 0.50 | 0.800 | all four edges | **52.7%** |
| 800x450 | compact-landscape | yes | 0.50 | 0.625 | all four edges | **52.5%** |
| 400x225 | mini-player | yes | 0.50 | 0.3125 | **none - all four outside** | n/a |
| 390x844 | portrait | **no** | 0.50 | 0.3047 | top and bottom only | **52.0%** |

**Fits, does not clip, does not crowd.** The reduction is 52.5-53.1% at every landscape scale, which
is what it should be: nothing about the perimeter uses vw/vh, so it scales exactly like the rest of
the fixed stage.

**It does not feel heavier on smaller screens - it disappears.** At mini-player (400x225) all four
edges of the perimeter fall outside the viewport and it lights essentially nothing. It renders and
costs nothing visible.

**Portrait, corrected.** The recon predicted the perimeter would be entirely out of frame in
portrait. Measured at page level, it is not: it lights **4.69% of the actual 390x844 screen**, a
band spanning the full width from y70 to y593. It reduces by 52.0% like everywhere else. There is no
clearance question there because **SceneGroup is mounted only when not portrait**, so portrait has
no hero and no car at all - `portrait` is a pure aspect test (`innerHeight > innerWidth`), not a
width breakpoint. **Hero and car clearance is a landscape-only question.**

No responsive adjustment was needed, so none was made.

## 5. REGRESSION

| check | result |
|---|---|
| base game unchanged | perimeter element **never appears**: 0 before the spin, 0 across a full losing round. Hero idle. |
| feature entry readable | verified per animation frame: 0 -> **0.746 at t=446ms** -> 0.500 at t=926ms |
| feature active distinct | held exactly **0.500**, blend `screen`, z41, at all five viewports |
| feature end / settle | settle ran **1590ms** against the 1.6s CSS and the 1600ms JS timer, opacity 0.500 -> 0.017, then unmount |
| console / asset faults | **zero errors, zero failed requests** in every state and every viewport |
| reduced motion | opacity **0.500**, `animation-name: none`, media query matching, zero errors |

**Gates: 27 pass.** Including `scrim_coverage`, the one gate a perimeter edit could plausibly have
flipped (it flags blocks combining `position: fixed`, a full inset and a background; the perimeter
is `position: absolute`, so it stays clear), and `money_fit`, which is the **only** CI gate that
reaches a state where the perimeter exists at all. `typecheck_baseline` passes with 7 warnings
against a baseline of 36 and fails on any rise, which is the likeliest way a CSS edit goes red.
`dist_hygiene` fails locally on `cleanTree: false` only, because the working tree carries 30
placeholder rasters plus this change; it builds clean in CI.

## 6. THE FINDING THAT MATTERS MORE THAN THE TONE-DOWN

The brief assumes the perimeter is what makes the feature overbearing and asks whether it covers the
hero and car. Measurement does not support that premise, and two other layers are much larger.

**The perimeter is a minor contributor over the hero.** On his opaque pixels it adds a mean of
+0.0216 luma against his own mean of 0.2964 - a 7.3% relative lift - and only about a tenth of his
body is lifted at all. Independently corroborated two ways during this session.

**The backdrop hue-rotates the entire viewport.** On the default `natural` route the whole 100vw x
100vh backdrop takes `hue-rotate(-95deg) saturate(1.15)`, a measured mean hue swing of **-80.3
degrees behind the hero** and -82.1 behind the car (App.svelte:3023-3025). By area this is the
single largest change in the feature and the perimeter is a bystander to it. Notably **no Overdrive
backdrop route adds light** - all three are darker than the base backdrop - so a "too bright"
reading cannot be coming from there. It is a colour change, not a brightness one.

**The frame pulse is the largest colour change landing on the car.** `.game-frame` hue-rotates
185/280/305 degrees and saturates 1.3-1.7x depending on route, covering 43.9% of its overlap with
the car box at a mean painted luma of 0.5697, animated on a 3s loop (App.svelte:3176-3205).

**THE STRONGEST SINGLE CANDIDATE, AND IT IS NOT A BRIGHTNESS PROBLEM: the perimeter carries no route
colourway.** Every other Overdrive layer shifts hue per route. The perimeter does not - it takes only
`class:settling`, no `route-natural`, no `nitro-active` - so it renders the same teal-cyan
(alpha-weighted RGB 36,87,103 over the hero box) during a green `natural` feature and a deep-pink
`nitro` one alike. On the default route everything else goes green and the perimeter stays cyan.
**Dimming cannot fix a hue mismatch**, and this is very likely why it reads as stuck on rather than
part of the look.

**Not done here, deliberately.** The brief asked for a tone-down, not a re-colour, and route-tinting
is a change in kind rather than degree. It is the recommended next change and it is cheap: one class
binding and one filter rule, mirroring what `.game-frame` already does.

## 7. WHAT THIS SESSION DID NOT DO, AND WHERE IT COULD BE WRONG

- **No gate anywhere measures the hero or the car for legibility, in any state.** Confirmed by
  reading every gate. This change is therefore unprotected against future regression, and so is
  every hero and car change made since R110.
- **The car raster in the working tree is not HEAD's** - silhouette IoU 0.6772 and +0.0575 mean body
  luminance apart. Section 3 was therefore measured with HEAD's car swapped into `dist` only; the
  owner's work-in-progress raster was never touched. `scene_character.png` is also dirty but is
  **not live**: `heroMode` defaults to `idle`, so the HeroIdle flipbook renders instead of it.
- **The hero's edge-CR cost is moment-dependent.** It measured -1.22% in one captured feature moment
  and -4.31% in another. The direction and the halving hold in both; the magnitude does not.
- **The entry overshoot is a transient and only its opacity curve was verified**, not how it reads
  against the rest of the entry moment, which is already busy with the hero reaction, the flame jets,
  the backdrop crossfade and the frame pulse.
- **Nothing was measured in portrait for the reels or HUD**, only the perimeter's own footprint.

## 8. INSTRUMENT FAILURES, RECORDED BECAUSE EACH ONE NEARLY SHIPPED A WRONG ANSWER

1. **A connected-component "hero" mask landed on the reels** and dutifully reported **0.00% damage at
   every opacity**. The giveaway was that the hero and car masks came out as nearly the same region.
2. **An eroded signal band emptied itself** and reported the perimeter as contributing almost
   nothing anywhere, contradicting a direct band measurement by a factor of 46.
3. **An offline sRGB composite was confirmed to 0.13/255 against synthetic patches, with a
   linear-light negative control correctly rejected - and still overstated the effect on the real
   stage**, because something above z41 attenuates it. Passing a control does not make an instrument
   valid in a different context. The model was dropped and everything remeasured from real renders.
4. **The game logic keeps running while CSS animations are paused.** Any two captures taken apart are
   different stages. A drift control (same state captured first and last) showed 19.45% of pixels
   moving; the hero region moved 0.00%, which is why hero numbers survived and reel numbers did not.
5. **`np.asarray(Image.open(...))` passed inline as a function argument returns different values than
   the same expression bound to a variable first**, reproduced deterministically. Caught only because
   an assertion required the backdrop compared against itself to be exactly zero.
6. **The first entry-curve probe polled after `waitForSelector` and only ever saw the settled value.**
   It would have let an unverified "entry still peaks at 0.75" claim ship in a code comment. Replaced
   with a per-frame sampler installed before app code runs.

**The pattern in all six: a plausible number is not a verified one, and the cheapest defence is an
assertion that makes the physically impossible case fail loudly.**
