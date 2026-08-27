# R133 - THE BAND WAS COVERING THE CELEBRATION IT WAS ANNOUNCING

Brief: `reports/briefs/FS_R133_BannerPresentation_Prompt.md`, saved verbatim before any work.
Branch `claude/r133-banner-presentation`, review lane, pull request #173.
CI **30/30 GREEN on 9b82f621**, run 33065915539, zero failures and zero skips.
Boot state: on main at 15dc1f85 (the PR #172 merge, so R132 was live and confirmed present),
the owner's 30 WIP rasters fingerprinted from the repo root with absolute paths before any file
operation, and re-verified byte-identical at close.

## 1. The goal, and the answer the measurement gave instead

The owner's read was that Big / Mega / Epic are "correct and readable, but still basic", and the
brief asked for a celebration rather than a notification strip. The obvious response is to add
decoration. **The measurement said the decoration was already there and the band was sitting on
top of it.**

Eleven parallel measurement agents worked the live banner. Five of them independently reached the
same root cause.

**THE TIER ART WAS BEHIND AN OPAQUE PLATE.** `.c1-tier-burst` sat at `z-index: 0` under
`.fs-plate`, whose child `.fs-face` painted an opaque `linear-gradient(180deg,#111a2b,#070b16)`
across the whole band.

| tier | tier-art ink INSIDE the band | positive control | art energy discarded |
|---|---|---|---|
| BIG | **0 of 86,400 px** | 99.937% | 52.0% |
| MEGA | - | - | 60.9% |
| EPIC | **0 of 86,400 px** | 39.58% above / 55.72% below | 50.8%, **including its brightest row** |

So the shards a player sees erupting above and below the strip were the whole of the art, and the
interior got none of it. **The celebration's art and the celebration's number never occupied the
same pixels.** Rendered at size, that is a censor bar across a firework.

**AND THE PLATE THAT WOULD HAVE GIVEN THE BAND MATERIAL WAS ITSELF INVISIBLE.** `.fs-plate` carried
a six-stop chrome gradient (`#eef5fa` through `#2b363f` to `#dceaf2`) that would have supplied
thickness, bevel and highlight. It was 100% occluded by its own coincident child: magenta forced on
`.fs-plate` changed **0 of 212,480 px**, while the same probe on `.fs-face` changed **94.29%**. The
plate was dead paint. The band was a flat dark rectangle with two rules.

**The symptoms all fall out of those two facts.** Interior 93.56% / 94.35% empty, with 53% to 69%
of the 1280 columns carrying no mark and dead runs of 177, 176, 225 and 223px. Ends that were dead
cuts: the 3px rule ran at full saturation into pixel column 0 and 1279, `border-radius: 0`,
`clip-path: none`, `mask-image: none`, and the maximum horizontal luminance gradient across the
outer 40px was 1.8 to 2.8 per pixel against 47.8 to 70.1 vertically at the rules, **a 20x to 37x
asymmetry**: two hard edges saying STRIP and none saying OBJECT. It was **the only element in the
game drawing a full-width straight rule**, with a strongest horizontal seam of 64.7 / 59.8 / 71.3
against 29.2 for the untouched game and 27.2 for MaxWinCelebration.

**AND IT WAS A STILL IMAGE FOR MOST OF ITS LIFE.** Every transient finished by about 1400ms
(chromatic flash dark by 250ms, shockwave by 700ms, particles and coins by 1400ms) while the banner
lives 3600 / 4200 / 5000ms. Completely static, zero changed pixels, for **61% / 67% / 72%** of the
time a player is looking at it. At mega and epic the celebration ended BEFORE the count-up landed:
motion over at 1400ms against count-ups running to 2000 and 2800ms. Integrated motion energy over
the band rect measured 13.6 / 26.7 / 81.6 against MaxWinCelebration's 255.6.

**THE MEGA RUNG WAS BROKEN THREE INDEPENDENT WAYS**, and this is the one a person could have seen.
Painted silhouette: big 344px, mega 314px, epic 539px, so **the middle rung of a three-rung ladder
was 30px SHORTER than the rung below it**, for a win 5.48x larger. Rule luminance: big 200.8, mega
101.3, gold 208.0, so mega was half the brightness of big. And band mean luminance against the
reels it covered: big 47.5 vs 41.3 and epic 46.6 vs 36.2, both correctly brighter, but **mega 35.7
against 37.7**, i.e. the mega celebration made that strip of screen DARKER than the spin it was
celebrating.

## 2. The constraint that ruled out the obvious repair

Three agents measured the band's rect independently and all three fall out of one formula, which
the synthesis derived rather than any single report stating it: **`min-height` is very nearly inert,
and the band's height is the amount's line box plus padding.** Every rule is line-height 1.5, and
`align-items: baseline`, so BIG 36+75 = 111 (measured 111, min-height 110 never binds), MEGA 44+96 =
140, EPIC 52+120 = 172.

**Therefore +1px of amount font-size = +1.5px of band = more grid and more hero buried, and the
band is CENTRED on stage y=310 under `translateY(-50%)`, so that growth is symmetric: half goes up
into the hero's dome and half down into the grid.** Growing the type to fix flatness makes the bury
worse, deterministically. Nothing in this pass grows the type.

## 3. What shipped

Nine changes, every one inside `WinBanner.svelte`, which is the whole diff.

1. **The face is a scrim, not a slab.** The opaque gradient becomes `rgba(17,26,43,.80)` to
   `rgba(7,11,22,.90)`, so the tier art reads THROUGH the band for the first time.
2. **The paint order is explicit**: burst 1, plate 2, shockwave 3, particles 4, coins 5. Only
   `.fs-plate` had no z-index of its own and won on DOM order, and that omission WAS the defect, so
   it is now written out rather than left to be re-created.
3. **The dead chrome gradient is deleted, not revealed.** This is the opposite of the obvious
   repair and it was decided from pixels: with the face lifted off, the gradient renders as a milky
   grey plastic sheet with one diagonal sweep, no bevel and no highlight, and it destroys the
   amount's contrast. The material moves to `.fs-face`, where it can be seen, as a real bevel.
4. **The band has ends**: a horizontal mask on `.fs-plate`, with the per-tier glow ladder moved up
   to the unmasked `.c1-plate-wrap` so that a mask cannot eat it. See section 5 for why that
   structure, and what the first attempt got wrong.
5. **`.band-edge` gains a white-hot core**, which is what a real neon tube has and also how you
   equalise perceived brightness across hues, which is what mega's half-brightness rule needed.
6. **The mega rung is fixed**: the burst goes 420px to 500px, so the ladder reads 430 / 500 / 540,
   and the face tint becomes per-tier (`--tint` 20% / 32% / 26%) so the mega band stops being
   darker than the game behind it.
7. **A heartbeat at every tier**, 2.4s at scale 1.010 / 1.014 / 1.020. Note the direction: epic's
   own amplitude comes DOWN from 1.03, and the period more than doubles. The standing mandate
   refuses anything a reviewer could call ticking, and the fix for a dead tail is a slower breath,
   not a faster twitch.
8. **Reduced motion stops enumerating.** The block named four selectors and therefore FAILED OPEN
   for any new one; it now neutralises the subtree, so the next animation added to this component
   is covered on the day it is written rather than the day somebody remembers the block.
9. **Two inert declarations given the specificity to apply**, plus a `matchMedia` change listener.

## 4. What was refused

- **A full-stage surround, a new rail, or any increase in coverage.** Band geometry is byte-identical
  at 111 / 140 / 172px, verified on both servers at all three tiers.
- **Growing the type**, for the deterministic reason in section 2.
- **Masking a hole in the burst** where the text sits, which was the prescription from one judge.
  The burst is CENTRED, so a centred hole discards precisely its brightest core. Restacking so the
  art sits behind the text achieves the same protection and keeps the core.
- **`border-radius` for the ends.** It measured as not solving the problem at all: at 56px radius
  the band's far-left interior read 40.07 against a 37.26 control, i.e. unchanged, because a radius
  rounds corners and does not taper an edge.
- **Reviving the chrome gradient**, per section 3.
- **Fixing the two findings in section 7**, which sit outside a banner-chrome fence.

## 5. Four defects in my own work, found by the adversarial pass

**(a) THE PER-TIER `--pulse` LADDER WAS INERT.** I declared `--pulse` on `.tier-* .fs-plate` and
consumed it in a keyframe on `.c1-plate-wrap`, which is `.fs-plate`'s **ANCESTOR**. Custom
properties inherit downward only, so the computed `--pulse` on the animated element was empty at
every tier and all three ran the `var()` fallback 1.012 - measured `matrix(1.012)` at big, mega AND
epic - while the comment beside it claimed epic reached 1.020. **This is R131's lesson in a new
costume: a rule that compiles is not a rule that works.** Fixed by animating the element that
declares the property, verified as `matrix(1.010 / 1.014 / 1.020)`.

**(b) THE EPIC BANNER PAINTED ON THE HUD WIN POD.** 0 changed pixels became 56, with a peak channel
delta of 167, which is a bright mark on a money readout. The arithmetic needs no pixels: 560px x
1.045 (my new breathe) x 1.012 (my new pulse) = 592px, centred on stage y=310, so the bottom landed
at y606 against a pod starting at y573. **This was a direct consequence of the headline fix**: the
burst is the layer I deliberately lifted out from behind an opaque face, and then grew and animated.
Making it read through the band also made it read over the HUD. Fixed three ways at once - the pulse
moved to `.fs-plate`, which does not contain the burst; the breathe became opacity-only so no edge
moves; and epic returned to its shipped 540px. Re-measured at **0 changed px, max channel delta 0**,
against a 2,563px positive control in the same rect in the same run and a drift check of 0.

**(c) MY MASK DELETED THE VERY GLOW MY COMMENT SAID IT PRESERVED.** I gave `.band-edge` both
`mask-image` and `filter: drop-shadow`, and a mask's default `mask-clip: border-box` clips the
filter's output to that element's own 3px box. Measured in Chromium, WebKit AND Firefox: removing
the glow entirely changed **zero** pixels outside the band, and so did replacing it with a 40px pure
white drop-shadow AND a 40px pure white box-shadow. At HEAD the same glow was worth 69,416 pixels.
**I traded a real, large halo for none, and wrote a comment claiming it still resolved.**

**(d) IN WEBKIT, `mask-clip: no-clip` PARSES, REPORTS SUPPORTED, COMPUTES CORRECTLY, AND DOES
NOTHING.** My first version kept the tier glow on `.fs-plate` and relied on `no-clip` to stop the
mask eating it. That works in Chromium and Firefox. In WebKit 26.5, Safari's engine, deleting the
epic tier's entire 46/95/130px halo changed **0 pixels of the frame**, while the enabling control
showed the glow was worth 63,956 pixels once the mask was removed. **Every feature detection a
developer would reach for - `CSS.supports`, the computed value - said it was working.** And
`-webkit-mask-clip: no-clip` is not even valid syntax in Chromium or WebKit, so the compatibility
belt beside it was dead text providing exactly zero coverage.

**The repair was structural rather than clever: nothing that has to paint outside its box lives on
a masked element any more.** The tier glow moved to `.c1-plate-wrap`, same rect, unmasked, no
feature reliance at all. Measured outcome: the outer halo goes 19,132px to 17,710px above the band
and 19,132px to 16,436px below, so **86% to 93% preserved** where my first version had it at zero -
and it now survives in Safari, where it would not have.

**A fifth, smaller one, same pass:** I folded a `color-mix()` into the same single `background`
declaration as its own fallback, in two places. A declaration is all-or-nothing, so on an engine
without `color-mix` the band AND both rules vanished, where HEAD lost only its glows. Both now put
the plain declaration first and the `color-mix` one immediately after.

## 6. And the contrast failure I caused by measuring the wrong element

I measured the amount, found 8:1 against a 4.5:1 bar, and declared a pass. **The amount was never
the element at risk.** The TIER LABEL is smaller, thinner, and the only text coloured `--sig`, the
one text colour that varies per tier. Against the new scrim it measured **3.53:1 at mega and 3.96:1
at epic**, both under the bar, sustained across the banner's whole life rather than as a transient.

Two causes, each isolated inside one page load so no cross-server confound survives. At mega it is
the scrim alone. At epic it is the scrim AND my own mask ramp: **my comment verified that the 132px
plateau cleared the BURST and never checked the TEXT**, and epic's label ink begins at x=97, inside
the ramp, so live text was being faded onto the moving game behind it at a measured mask alpha of
0.85. The plateau is now 72px.

The arithmetic says mega was always the vulnerable one: `#FF2EC4` has relative luminance 0.2720, so
it clears 4.5:1 only while the backdrop stays under 0.0216, a flat sRGB grey of 40, and a
translucent scrim over a live moving game cannot promise that. The label is therefore lifted 20%
toward white, which revises an R131 decision and says so in the file: the hue is unchanged and
`#FF58D0` still reads as the mega magenta beside magenta rules.

**MY FIRST INSTRUMENT FOR THIS WAS WRONG AND SAID SO LOUDLY.** Defining a glyph pixel by "differs a
lot from the text-removed frame" includes ANTI-ALIASED EDGE pixels, which are partial-coverage and
fail contrast by construction. That instrument reported **HEAD as failing too**, which cannot be
true, and that is what exposed it. The corrected method takes a white/black probe pair, derives
per-pixel coverage, and measures only the full-coverage glyph body. It reproduces the adversarial
pass's own BEFORE figures exactly - mega 5.26 against their 5.26, epic 10.79 against their
10.79-10.89 - which is what makes the AFTER column trustworthy.

| element | BIG | MEGA | EPIC |
|---|---|---|---|
| tier label, HEAD | 12.17 | 5.26 | 10.79 |
| tier label, my first version | - | **3.53 FAIL** | **3.96 FAIL** |
| **tier label, shipped** | **11.65** | **4.82** | **7.36** |
| amount, HEAD | 17.03 | 17.11 | 16.56 |
| **amount, shipped** | **12.24** | **11.86** | **11.68** |

Zero failing pixels anywhere in the shipped column. The closed-form prediction for the label lift
(4.82 / 11.66 / 7.38) matched the measurement (4.82 / 11.65 / 7.36) to 0.02, which is the strongest
evidence the model of the failure is the right one.

**A correction to my own earlier statement in this session:** I reported the amount's contrast as
8.02 / 9.18 / 9.41. That came from the miscalibrated instrument above. The calibrated figures are
12.24 / 11.86 / 11.68, so the amount kept more headroom than I said it had.

## 7. Reported and NOT fixed, with reasons, per the standing mandate

The mandate allows FIXED or OWNER-PARKED WITH REASONS and no third category. These are parked.

**(a) THE OVERDRIVE-TINTED BANNER IS UNREACHABLE IN REAL PLAY.** `FreeSpinsPresentation.toEnd()`
sets `overdriveVisualActive = false` at line 417 and bumps `endBannerTrigger` at line 424; both
propagate in the same Svelte flush, so the store is already false on the first frame the banner
exists. Measured across three real curated feature rounds with per-frame sampling: **4,973 samples,
4,273 frames with overdrive live, 694 frames with the banner up, ZERO frames with both.** Not a
blind instrument - it saw the overdrive state for 4,273 frames in the same loads. The CSS is
correct and fires when the class is present. PARKED because the fix is a two-line reorder inside
FreeSpinsPresentation, which is not the banner, and that file is on the R132 lockstep path this
session had to preserve; a presentation reorder there is precisely the shape of change that caused
the R132 spoiler.

**(b) THE SHARED COUNT-UP CAN RENDER A NEGATIVE MONEY AMOUNT, AND ITS SIZE SCALES WITH THE WIN.**
`createWinCountUp.to()` computes `Math.min((now - startTime) / duration, 1)`, which clamps the upper
bound only. `startTime` comes from `performance.now()` while `tick()` receives the rAF frame
timestamp, which can precede it. `easeOutCubic` then AMPLIFIES the negative by about 3x. Measured
this session at **-$21.35 on the pod beside -$22.17 on the banner**, in 6 of 7 bonus rounds.
Verified independently by me in closed form: both observations invert to the same lead of about
24ms, one and a half frames at 60fps. R132 section 11d recorded this as one frame reading -$0.10 at
15x and called it a shared easing artefact; **the same defect is two orders of magnitude worse on a
big win, because the magnitude is proportional to the total** - about -$130 on a 5000x wincap.
PARKED and ESCALATED under convention (l.8): `winCountUp.ts` is the shared HUD count-up, the brief
forbids moving HUD WIN logic, and anything touching player money display goes to the owner and Fable
as a question rather than a builder ruling. **The fix is a lower clamp and cannot change timing.
This is the one on the list that should not wait long: a player can see a negative win.**

**(c) The container query never fires on the live stage.** `@container (max-width: 700px)` cannot
match at any viewport width, because the banner's mount is `.canvas-inner` at a fixed `width: 1280px`
sized only by a transform, and transforms do not resize a query container. Probed at fourteen widths
from 1280 down to 320: the container measures 1280 at every one, with the probe proved able to see
the query first. **It is NOT dead code** - it fires in the 616px replay grid mount, which is the case
the file's own comment describes. Kept, and recorded here so the next reader does not delete it.

## 8. Residuals

- The outer halo is 86-93% of what it was, not 100%, and the `.band-edge` halo specifically is now
  contained within the band because it sits inside the masked plate. The tier glow on the unmasked
  wrapper supplies the outside light instead.
- That wrapper glow does not fade at the ends, so a soft full-width halo remains while the hard
  rule now tapers. The hard rule was what drove the measured seam.
- Big and mega each gave back about 9px of distance between the banner's deepest painted row and
  the HUD, because both gained a pulse they did not have. Both still measure 0 changed pixels on
  the HUD row with 9,300px positive controls, but the next person to grow a burst has less room
  than the file implies.
- The `?mockCategory=bonus_win_large` bonus-buy round needs a much longer settle window than the
  other fixtures; a 32s poll was not enough and the guard correctly aborted rather than reporting a
  stale figure.
- Audio remains the largest publication gap, unchanged since R125 and outside this fence.

## 9. FOR THE NEXT SESSION

**Model and effort:** Opus 5, high effort, ultracode on. Three multi-agent workflows: eleven
measurement agents, a four-design panel with three judges, and eleven verification-and-attack
agents. About 4.5M subagent tokens.

**Approach:** measure before designing, then attack the result harder than the original. The
measurement phase is what turned "make it less basic" into "the band is covering the art", which no
amount of decorating would have found.

**Alternatives tried and rejected:** a design panel with four candidates implemented in isolated git
worktrees - **it failed outright**, because `isolation: 'worktree'` reported this directory as "not
a git repository" even though git works fine here, so all four design agents died at spawn. The
three judges then ran on an empty payload and, correctly, all three refused to invent scores and
verified the absence three independent ways instead. Their prospective analysis was used instead of
a panel result. **If a future session wants worktree isolation here, test it with one throwaway
agent before building a phase on it.**

**Also rejected:** `border-radius` for the ends (measured: does not taper an edge); masking
`.c1-plate-wrap` (measured: destroys 117% of the burst overhang and half the glow); masking a hole
in the burst (discards its brightest core); reviving the chrome gradient (a grey slab at real size).

**Files touched:** `frontend/src/lib/components/WinBanner.svelte` only, plus the brief, this report,
its archive and `reports/screens/r133-banner-presentation/`.

**Open threads:** the two parked findings in section 7, of which the negative-money one is the
urgent one; and the bought-round contrast case, which the adversarial pass measured at 3.65:1 on my
first version and which I could NOT re-measure after the fix, because the bonus-buy fixture would
not settle inside the harness window. The label lift applies to every tier so it should carry, but
**that specific round is verified in mechanism and not in pixels, and the next session should
close it.**
