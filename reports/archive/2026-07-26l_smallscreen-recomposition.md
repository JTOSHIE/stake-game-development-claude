# Session Report - THE SMALL-SCREEN RECOMPOSITION (2026-07-26)

Brief saved verbatim: `reports/briefs/FS_SMALLSCREEN_RECOMPOSE_Prompt.md`. Fresh
session on `main`, integrator role, explicit paths, no lock exceptions and none
needed: no locked path was touched or required, and `git diff .claude/settings.json`
is empty. ONE JOB, per the brief, and it is the extracted JOB 3 from
`FS_LIVE_ROUND2_Prompt.md` that the previous session stopped short of.

## Summary

Both defects the owner photographed are fixed, proven at all seven platform presets,
and each one turned out to have a root cause that was derivable from the stylesheet
before anything was measured. The measurements then agreed with the derivation to
0.1px, which is the outcome convention (l.2) is written to produce.

**Popout S was one missing CSS declaration, not a scale problem.**
`.canvas-inner.mini-player` lacked the `width:1280px; height:720px` pair that
`.canvas-inner.portrait` and `.canvas-inner.compact-landscape` both carry. The stage's
children are positioned in stage units against that box, so with the base rule's
`width:100%` resolving against the 400px slot the box became 400x181 instead of
1280x720, and `translateX(-50%)` translated 200px where centring the stage needs 640.
Predicted right-shift (640-200) x 0.2514 = **110.6px**. Measured: **+110.6px**.

**The mobile dead band was proportional to viewport height, which is why the owner's
number and this machine's number were both right.** The owner reported roughly 250px
at Mobile L; a direct measurement at 425x812 gave **30.8px**. Rather than average them
or pick one, the quantity was swept: the gap is
(viewportH - wordmark - canvas - hudContent), and it grows at a measured **1.000px per
px of viewport height** once the canvas is width-bound. It reads 30.8 at 812, 118.8 at
900, 218.8 at 1000, **249.8 at 1031** and 618.8 at 1400. The platform's Screen preset
sets the WIDTH; the window supplies the height. The owner's Mobile L was about 1031px
tall, never 812, and both figures describe the same defect at two heights.

**The mobile width was a crop window spending 21% of the height budget on nothing.**
`PORTRAIT_CROP_BOTTOM_Y` cropped from stage y=0 to 592 while the frame occupies
y=84..552, so 124 of 592 units were empty stage. Because the scale is a `min()` of a
width term and a height term, that waste is exactly what stopped the width term
binding at Mobile M and Mobile S.

## The measured result, before and after

| Preset | Grid fill before | after | floor | Centre offset before | after | Dead band before | after |
|---|---|---|---|---|---|---|---|
| Popout S 400x225 | 32.8% | **44.2%** | 42% | **+110.6px** | **0.0px** | n/a | n/a |
| Mobile L 425x812 | 96.0% | 96.0% | 94% | 0.0px | 0.0px | **30.8px** | **10.0px** |
| Mobile M 375x667 | 79.5% | **96.0%** | 94% | 0.0px | 0.0px | 10.5px | 10.0px |
| Mobile S 320x568 | 65.8% | **83.7%** | 81% | 0.0px | 0.0px | 10.5px | 10.0px |
| Desktop 1200x675 | 40.8% | 40.8% | 40% | 0.0px | 0.0px | n/a | n/a |
| Laptop 1024x576 | 40.8% | 40.8% | 40% | 0.0px | 0.0px | n/a | n/a |
| Popout L 800x450 | 33.9% | 33.9% | 33% | 0.0px | 0.0px | n/a | n/a |

10.0px is `.p-hud`'s own `gap: 10px`, the one deliberate breathing space, so the after
column is the floor and not a smaller hole. The three landscape presets are the
untouched `scale(S)` profile and are asserted for no-regression.

FEATURES at Popout S, opened from the strip the way a player opens it: the mode list's
window went from **28px onto 663px of content with 0 of 4 cards reachable** to **118px
onto 226px with 2 of 4 fully visible** and the rest reachable by scrolling, close and
BET MODES both inside their clipping ancestors.

## What was fixed, and why each

1. **`.canvas-inner.mini-player` gains `width:1280px; height:720px`.** The
   coordinate-space fix above. Placed adjacent to the portrait and compact-landscape
   rule that always carried the pair, so the three cannot drift apart again.
2. **The mini scale divides the frame's own box.** `min(vw/640, availH/534)` instead of
   `min(vw/1280, availH/720)`, with the crop window running from the title (stage y=18)
   to the frame's bottom edge (y=552).
3. **The portrait height term divides the frame (468), not the crop window (592)**, and
   a separate adaptive crop then decides how much decorative stage to show out of what
   is left, centred on the frame. At Mobile L the window opens to the full 592, at
   Mobile M to about 490, at Mobile S it closes to the frame itself.
4. **`.native-hud-slot.portrait` becomes `flex: 0 0 auto`.** Content-sized, so the
   surplus can no longer be distributed into the HUD as a gap. This makes the hole
   structurally impossible rather than merely smaller.
5. **`.canvas-slot.portrait` becomes `flex: 1 1 0`.** See the regression below; this is
   the load-bearing change.
6. **A mini profile for the FEATURES panel**, compressing the head and bet bar to single
   rows so the mode list gets the majority of the panel.

## A regression this pass caused and caught, and the lesson that outranks the fix

The first working draft computed the canvas box as
(viewport - wordmark - HUD) from two separately measured chrome heights. Every
composition assertion passed. **`layout_fit_gate.mjs` went red** and named five
controls including SPIN as outside the viewport at Mobile M and Mobile S.

The cause is worth recording because it is a class, not an incident: that is **two
sources of truth for one box**, and they disagreed NON-DETERMINISTICALLY. Identical
loads produced a 338px canvas on one run and 374px on another; Mobile S overflowed by
25.5px until a 1px resize nudge corrected it to a 10.5px fit. A subtraction has to be
re-run whenever either measurement lands, and a measurement that arrives late finds the
canvas already sized from a stale one.

So the dependency was inverted rather than the timing patched. `.canvas-slot.portrait`
is now `flex: 1 1 0`, which means **CSS decides the box** in the same layout pass that
places the chrome, and the script measures that box and picks a scale to fill it. The
stage is then physically incapable of exceeding its box, and if the HUD grows mid-round
flex shrinks the box in the same frame, so the worst case is one frame of
slightly-too-large stage inside a correct box rather than a control moving out of reach.
Re-tested across load, a 2.5s settle and a resize nudge, the layout is now identical
every time.

**Two conclusions, stated plainly.** First, the composition gate was green through all
of this, and the fit gate caught it: the two gates measure different things and neither
substitutes for the other. Second, a patched settle loop would have made the arithmetic
converge faster while leaving two sources of truth in place, which is the fix that
looks adequate and rots.

## Hypotheses tested and FALSIFIED, recorded so they are not re-run

- **That the mobile layout was history-dependent.** Predicted from `flex: 1 1 auto`
  making `scrollHeight` report the stretched box. Tested with seven routes to each of
  the three presets, including boot-at-desktop-then-apply-preset, which is what the DTT
  actually does. All settled identically, spread **0.0px**. Discarded.
- **That the HUD's reserve was inflated by a stale measurement.** A hand-sum gave the
  HUD's content as 248.5px against a measured slot of 287. The hand-sum was wrong: it
  omitted `.p-hud`'s 10px gap and 20px of vertical padding. `scrollHeight` was
  reporting the content height correctly at Mobile M and S. Discarded; the 20.3px of
  genuine surplus at Mobile L was real and is fixed by item 4 above.
- **Reverse-engineering the owner's exact viewport from their PNGs.** Attempted by
  decoding the captures through the browser's own canvas, the way `contrast_gate.mjs`
  does. The edge detection was not reliable on these crops and the attempt was
  abandoned rather than reported as a measurement. The height sweep answered the same
  question better, and generally: the fix holds at every height rather than at one
  recovered number.

## Verification, measured

    node scripts/smallscreen_composition_gate.mjs            PASS, 7 presets + FEATURES + 10 swept heights
    node scripts/smallscreen_composition_gate.mjs --self-test PASS, both seeded violations caught
    node scripts/layout_fit_gate.mjs                          PASS, 7 presets, scroll=no offscreen=0 clipped=0
    node scripts/mini_player_proof.mjs                        PASS, 25 checks, 5 seeded violations caught
    node scripts/contrast_gate.mjs                            PASS, 4 portrait presets, seeded violation caught
    node scripts/popout_conformance.mjs                       PASS, 3 viewports, real clicks
    node scripts/typecheck_baseline.mjs                       PASS, 0 errors
    npm run check                                             496 files, 0 errors, 36 warnings (the committed baseline)
    node scripts/dead_wiring_scan.mjs                         PASS
    node scripts/scan_wallet_floats.mjs                       PASS
    node scripts/currency_scale_drift.test.mjs                PASS
    node scripts/locale_completeness_check.mjs                PASS
    node scripts/a11y_social_terms_check.mjs                  PASS
    node scripts/dist_hygiene_gate.mjs                        PASS
    node scripts/dash_gate.mjs --self-test / --source / dist  PASS, all three
    npm run build                                             clean

**The new gate ships a seeded self-test per convention (p), and both seeds are the
defect in the form it really occurred**, because both defects were CSS declarations:
one restores `width:100%` on `.canvas-inner.mini-player` (the gate goes red at +149.1px
off-centre, which is (640-200) x 0.339 at the new scale), the other restores
`flex: 1 1 auto` on `.native-hud-slot.portrait` (16 findings, dead bands from 129.7 to
618.8px). The unseeded build is green on the same run.

**Why the gate sweeps heights rather than only checking the seven presets.** A
preset-only gate would have gone green on the exact defect the owner reported, because
30.8px at a nominal 425x812 is inside any tolerance a reviewer would set while 249.8px
at 1031 is not. The presets fix the width; the window fixes the height.

## Convention compliance, self-audited before reporting (l.5)

- **(b) and (f)** brief saved verbatim to `reports/briefs/` and committed with the work.
- **(h)** before and after captures committed for every preset the spec names, plus the
  FEATURES panel state a still of the idle screen cannot show.
- **(h.1) observed and repaired mid-session.** `portrait_layout_conformance.mjs` and
  `popout_conformance.mjs` still write directly into committed evidence directories
  rather than through `evidenceDir()`. Running them dirtied 30 committed PNGs and one
  committed JSON in `reports/screens/{portrait-v2,landscape-compact-v1,audit-remediation-v1}/`
  and `reports/qa/`. All were restored from HEAD with `git checkout` and none is in this
  session's commits. This is the open work CLAUDE.md's (h.1) entry already names; two
  more scripts for that list.
- **(k)** every path staged by name.
- **(l.1) and (l.2)** both root causes derived from the stylesheet before measuring;
  measurement confirmed the Popout S offset to 0.1px.
- **(p)** the new gate fails on a seeded violation before its PASS is claimed.
- **No lock exception.** No locked path touched; settings diff empty.
- **Nothing solved with `overflow: hidden`.** The crop window is a composition choice
  about how much decorative stage is shown; every interactive control is a native-DOM
  element below the canvas, so no control is inside the clipped region at all, and
  `layout_fit_gate.mjs` proves that independently by measuring each control against its
  clipping ancestors.

## For the owner: one decision, with both numbers

At Popout S the available box is 400x181, an aspect of **2.21:1**, and the frame is
**1.37:1**. Height therefore binds, and no centred, undistorted composition can also
fill the width. Keeping the title in frame gives a grid fill of **44.2%**; dropping the
title and cropping to the frame alone gives about **62%**, a frame 247px wide instead of
217px.

The title was kept, because `FS_LIVE_ROUND2_Prompt.md` describes this composition in the
owner's own words as "the height between title and strip". Both figures are recorded so
the call can be made against numbers. Say the word and it is a one-constant change
(`MINI_CROP_TOP_Y`).

### Rule 10 closing link

Final push, BOTH JOBS GREEN on the remote runner, verified before closing rather
than inferred from the local results:
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30201767190`
  commit `bc9e8a5`
  static gates: success
  browser gates: success

The browser job is the one that matters here, because it is where
`layout_fit_gate.mjs` runs, and this pass's near-miss was a layout regression that
only the fit gate caught. It is green on a different machine from the one that made
the change.

### FOR THE NEXT SESSION

**Model and effort.** Opus, high effort, single job in a fresh context per rule 4.

**Approach.** Derive from the stylesheet first, measure to confirm, and treat any
disagreement between two measurements as a question to answer rather than a range to
split. The height sweep is the reusable idea here: where a quantity depends on the
viewport, assert it across the viewport, not at the presets someone happened to name.

**Alternatives tried and rejected.**
- *Patching the measurement timing with a settle loop.* Rejected: it leaves two sources
  of truth for one box and only makes the disagreement converge faster.
- *Removing the FEATURES bet bar at Popout S to buy 34px.* Rejected: it is a player
  money display, so per (l.8) the builder does not rule on it. The room was found in
  the head, the card rows and the panel height instead.
- *Shrinking the panel's touch targets below 44px.* Rejected: the mini strip's own
  established pattern is a compact visual with an `::after` hit area extended to 44px,
  which `mini_player_proof.mjs` measures, so this profile follows it rather than
  inventing a second convention.
- *Averaging the owner's 250px against this machine's 30.8px.* Rejected outright. Both
  were correct and the discrepancy was the finding.

**Files touched.** `frontend/src/App.svelte`,
`frontend/src/lib/components/FeatureMenu.svelte`,
`frontend/scripts/smallscreen_composition_gate.mjs` (new),
`docs/records/reviews/REVIEW_TRACKER.md` (TR-083 and TR-084 opened and closed),
`reports/briefs/FS_SMALLSCREEN_RECOMPOSE_Prompt.md`,
`reports/qa/smallscreen_composition_{before,after}_2026-07-26.json`,
`reports/screens/smallscreen-recompose-2026-07-26/` (16 captures plus a README), this
report and its archive copy.

**Open threads.**
- `portrait_layout_conformance.mjs` is **non-deterministic in this environment, and it
  is not this pass's doing.** Three runs, three different outcomes:

  | Run | Build | Outcome |
  |---|---|---|
  | 1 | this pass | FAILURES: iphone14-landscape + pixel7-landscape touchTargetAudit, reducedMotionFrameGate, autoInfiniteOption |
  | 2 | **unmodified HEAD** | **CRASHED**, 30s Playwright timeout clicking `activate-bonus` |
  | 3 | this pass, identical to run 1 | FAILURES: iphone14-portrait + iphone14-landscape **frameGate**, pixel7-landscape touchTargetAudit, reducedMotionFrameGate, autoInfiniteOption |

  Runs 1 and 3 are the same build and disagree with each other, which is what makes the
  script unable to answer a regression question in either direction. The causes are
  visible in its own output: `frameGate` is a frame-rate measurement (run 3 failed on a
  single 116.6ms frame out of 185 samples, on a machine that had chromium running
  throughout this session), and `touchTargetAudit` only sees the free-spins entry card
  when the session it drives happens to trigger a bonus, so the element set it checks
  varies. `reducedMotionFrameGate` was **already failing in its committed result at
  HEAD**. It is deliberately excluded from CI ("stay local... tens of minutes",
  `checks.yml`). Worth a session of its own to make deterministic.
- **One genuine finding came out of those runs and is filed as TR-085**, not fixed here:
  the free-spins entry card's TAP TO CONTINUE button measures **88.1 x 33.4px** against
  a 44px minimum. It is in `FreeSpinsPresentation.svelte`, untouched by this pass, and
  it is out of this brief's single job, so per rule 6 it is written up and handed on
  rather than absorbed. Filed rather than deferred silently, because the standing
  mandate removes "minor" as a disposition.
- The `evidenceDir()` migration for the two scripts named under (h.1) above.
- JOBs 4 and 5 of `FS_LIVE_ROUND2_Prompt.md` remain unstarted. JOB 5 (Kit V5) was gated
  on this job passing its gates, which it now has.
