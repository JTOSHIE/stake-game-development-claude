# The ticking hero, diagnosed and fixed

> **SUPERSEDED IN PART BY R130, 2026-08-27.** Marked rather than rewritten, which is this project's
> convention for dated records. **The DIAGNOSIS below is still correct and is what R130 acted on** -
> the tick was temporal, it was the idle, and 733ms a frame is a slide show. **The FIX below is
> GONE.** R129 halved the pops with a dual-buffer cross-dissolve; the owner's verdict on the result
> was still "an amateur ticking clock", and their ruling was that bad motion scores worse than a
> still. R130 therefore removed the idle flipbook, the 7.2s sway, the dissolve and the glance
> outright and froze the hero on frame 01. Section 2 onward describes machinery that no longer
> exists: `hero-cycle-idle`, `hero-dissolve-in`, `hero-sway-idle`, `.hero-layer-a`, `.hero-layer-b`.
> The win unfold and the feature brace are untouched and still play. Live state is read from
> `HeroIdle.svelte`, never from this file.

**R129, 2026-08-27.** The owner's complaint was not "no movement". It was that movement exists and
ticks. This is what the tick actually was, what fixed it, and what the fix does not cover.

Every number here was measured first-hand. The metric is silhouette symmetric-difference over union
at the hero's real render size of 206x407, with controls: a frame differs from itself by 0.00% and a
12px horizontal shift reads 25.59%.

---

## 1. The diagnosis: the tick is TEMPORAL, and it is the idle

| state | frames | duration | ms per frame | fps | worst neighbour step |
|---|---:|---:|---:|---:|---:|
| **idle** | 6 | 4400ms | **733ms** | **1.4** | **18.74%** |
| win | 16 | 1500ms | 94ms | 10.7 | 18.63% |
| brace | 7 | 1300ms | 186ms | 5.4 | 19.45% |
| glance | 6 | 1700ms | 283ms | 3.5 | 1.25% |

**The win and the idle take the same size step. The idle holds it 7.8x longer.** At 1.4 fps the eye
fully resolves each still and then watches it snap. That is a slide show, and the idle is the state
on screen almost all the time.

Two aggravating facts about the idle strip, both measured:

- **Its six frames are not evenly spaced in space.** Head-band centroid X per frame, relative to
  frame 01: `0, -3, -7, +7, +3, 0`. Per-step deltas: `-3, -4, +14, -4, -3`. **One step carries 100%
  of the entire 14px lateral range.** The weight shift crosses from its left extreme to its right
  extreme in a single 733ms cut, with no in-between.
- **Frame 06 is byte-identical to frame 01.** In a loop that is dead air: the cycle spends 1466ms
  showing the same pixels back to back.

The other four candidate causes from the brief were measured and cleared:

| candidate cause | verdict |
|---|---|
| a second transform on a different clock | the idle sway is 7.2s against a 4.4s flipbook, deliberate and documented, and it is continuous rather than stepped. Not a tick. |
| banner occlusion showing only the jumpy part | the banner covers hero rows 0..100 of 415, 24%, and it is only present during a win. The idle is never occluded. |
| box clipping popping limbs | **no ancestor clips the hero box.** The two `overflow:hidden` ancestors (`.canvas-slot`, `.game-stage`) are both 1280x720 and the hero sits at (22,295) 207x408, entirely inside. |
| too few frames | true, but it is the HOLD that makes it visible, not the count: the win has an identical worst step at 10.7 fps and does not read as ticking. |

---

## 2. What shipped: a dual-buffer cross-dissolve on the idle

Two stacked copies of the same sheet inside `.hero-body`:

- **`.hero-layer-a`** (bottom) runs `hero-cycle-idle 4.4s steps(6) infinite` at **opacity 1, always**.
- **`.hero-layer-b`** (top) runs the same flipbook with `animation-delay: calc(-1 * var(--hero-frame))`
  so it sits exactly one frame ahead, plus `hero-dissolve-in` over one frame period.

At each step boundary layer A becomes frame N+1 at full opacity while layer B becomes N+2 at zero, so
the composite is continuous across the seam rather than cutting. Six discrete stills become one
continuous morph.

`--hero-frame` is computed in the markup as `DURATION_MS[motion] / FRAMES[motion]`, so the dissolve
period is derived from the same two numbers as the steps and cannot drift out of phase with them.

**It costs zero bytes of asset.** Same sheet, same six frames, one extra DOM element.

### Why the bottom layer does not fade, which was this session's own correction

The first attempt faded A out while B faded in. That is symmetrical and wrong: **two stacked
semi-transparent layers do not composite back to solid.** For a pixel opaque in both frames,
source-over gives `out = t + (1-t)^2`, which dips to **0.750 at t = 0.5**. The hero went 25%
transparent at every dissolve midpoint, 1.4 times a second - a brightness pulse traded for a tick,
which is exactly the swap R126 was burned by. Holding the bottom layer solid gives `t + 1(1-t) = 1.000`
at every t, and the colour still lerps correctly because the top layer's own alpha does the blending.

### Why it does not ghost two bodies

The obvious objection, tested before the code was written. Per adjacent pair, the share of the union
solid in only one frame is **5.4%, 5.4%, 18.7%, 5.5%, 5.4%**. Four of five transitions are
near-invisible. Even the worst - frame 3 to 4, the leg swap - leaves **81.3% of the figure common to
both**, so the composite reads as one robot with a softened limb, not as two. Rendered at 0, 25, 50,
75 and 100% and inspected.

### Why the reactions deliberately do not get it

The one-shots use `steps(n, jump-none)` with `forwards`: they END on the last frame and hold it. A
layer running one frame ahead would run off the end of the sheet there and the hero would fade to
nothing at the close of every reaction. They also do not need it, at 94ms and 186ms a frame. Layer B
is inert unless `data-motion` is `idle`, enforced at (0,3,0) specificity.

---

## 3. The result, and what an adversarial pass corrected in it

45 samples at 100ms across a full 4.4s idle cycle, identical phases, dissolve on versus forced off:

| | before | after |
|---|---:|---:|
| max per-sample change | **15.33** | **4.15** |
| unevenness (stdev) | 3.01 | **0.67** |
| spikiness (max/mean) | 11.67 | **3.53** |
| **spikes above 5.0** | **5** | **0** |

**But "the tick is gone" was too strong, and an adversarial pass was right to overturn it.** Derived
exactly on the real sheet rather than from a screenshot:

| hold | old hard cut | new end-of-dissolve snap |
|---|---:|---:|
| f1->f2 | 5.36% | 2.80% |
| f2->f3 | 5.38% | 2.79% |
| **f3->f4 (the lurch)** | **18.74%** | **10.32%** |
| f4->f5 | 5.48% | 2.80% |
| f5->f6 | 5.44% | 2.76% |
| **f6->f1 (the seam)** | **0.00%** | **0.00%** |

**The pops are roughly halved, not removed.** The honest claim is that a hard cut out of a held
still has become the end of a 733ms continuous move at half the magnitude, and that the loop's one
free transition stays free.

### Two real defects the adversarial pass found in this fix

**1. The drop-shadow was drawn twice.** Both layers carried `filter: drop-shadow(...)`, so wherever
they overlapped the shadow doubled: it darkened as layer B faded in and snapped back at every step.
Measured at 2.35x on the skirt and a **3.269 pop at the f6->f1 seam** - a seam that is otherwise a
perfect no-op because those two frames are byte-identical. Moving the shadow to `.hero-body`, so it
is computed once from the composite, removes both. Re-measured after the move: the seam is back to
**0.00%**.

**2. It is not a true cross-dissolve and cannot be one.** Two stacked RGBA layers composite as
`out = aTop + aBottom(1 - aTop)`. Holding composite alpha at 1 REQUIRES the bottom layer to stay
opaque, which is exactly what leaves the old frame's silhouette in the composite at the end of each
dissolve. Fading both removes the union but drops alpha to **0.750** at every midpoint - a 25%
translucency pulse across the whole figure, 1.4 times a second. **The algebra forces a choice.**

The union was chosen on area: the dip is 25% wrong across 100% of the figure; the union is 100%
wrong across 2.8% of it (10.3% at the worst hold). That is **2.4x to 9x less wrong by area**, and it
decays with the dissolve rather than pulsing.

## 4. A second, separate defect found and fixed: the epic win stalled

`holdFor()` returns 1900ms for an epic win and `.hero-body` runs `hero-punch-epic` for 1.9s, but the
sheet rule pinned the flipbook to 1.5s - and **nothing could override it, because `data-tier` was only
ever set on the outer `.hero-body` div.** No selector could reach the sheet element for the epic case
at all.

So from 1500ms to 1900ms the sprite sat frozen on its final frame while the transform kept sliding it
around: **21.1% of the reaction, the entire settle, playing as a still being translated.** And because
win frame 16 is 0.00% from idle rest, the frozen image is the rest pose, so the hero visually finished
his reaction 400ms early and was then just moved about.

`data-tier` is now on both sheet layers and `.hero-idle[data-motion='win'][data-tier='epic']` stretches
the same 16 frames across 1.9s: 119ms a frame, 8.4 fps, and the flipbook now ends exactly when the body
does. Verified: the sheet reaches `-3090px` at 1899ms where it previously froze at 1500ms.

---

## 5. What this does NOT fix

- **Portrait has no hero at all.** `SceneGroup` mounts landscape-only, so every improvement here is
  landscape-only. That is existing, deliberate behaviour, not a regression.
- **The idle strip is still six frames with one 14px lurch in it.** The dissolve spreads that lurch
  over 733ms instead of cutting it, which is what removes the tick, but the underlying art still has
  no in-between at the crossing. If the owner ever wants the weight shift to read as a *movement*
  rather than a smooth transition between two poses, that needs one more drawn frame at the zero
  crossing - and reclaiming the duplicate frame 06 would make it free in bytes.
- **The glance strip is inert.** Max neighbour change 1.25%, head centroid moves 0.35px in total. Its
  visible motion is entirely the transform. Recorded, not changed.
- **The brace at 5.4 fps was left alone.** It is a 1.3s one-shot with no hold long enough to read as a
  slide show, and it cannot take the dissolve for the `jump-none` reason above.
