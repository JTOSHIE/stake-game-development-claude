# TITLE: DROP at Popout S, before and after, 2026-07-27

The owner's ruling on the open call the recomposition session recorded. That
session measured both options and deliberately did not choose:

> Keeping the title in frame gives a grid fill of 44.2%; dropping the title and
> cropping to the frame alone gives about 62%, a frame 247px wide instead of
> 217px. The title was kept, because FS_LIVE_ROUND2_Prompt.md describes this
> composition in the owner's own words as "the height between title and strip".
> Both figures are recorded so the call can be made against numbers. Say the
> word and it is a one-constant change (MINI_CROP_TOP_Y).

The word was DROP. It was one constant, as named.

## The change

`App.svelte`, `MINI_CROP_TOP_Y` from `LOGO_TOP_Y` (18) to `FRAME_TOP_Y` (84).
The mini crop window therefore runs 552 minus 84 = 468 stage units rather than
552 minus 18 = 534, which is exactly `FRAME_H`.

Derived before measuring, per convention (l.1):

    availH  = 225 - 44 (strip) = 181
    scale   = min(400/640, 181/468) = min(0.6250, 0.386752) = 0.386752
    frame   = 640 * 0.386752 = 247.5px, 61.9% of the viewport
    grid    = 522 * 0.386752 = 201.9px, 50.5% of the viewport

Measured by the composition gate: **grid fill 50.5%**, centre offset 0. Exact
agreement.

## Scope, checked rather than assumed

The title is dropped at the mini profile ONLY. Every other preset keeps it, and
the gate's own numbers confirm nothing else moved: Desktop 40.8%, Laptop 40.8%,
Popout L 33.9%, Mobile L 96%, Mobile M 96%, Mobile S 83.7%, all identical to the
before run. The dead band stays at the one deliberate 10px gap across all ten
swept heights.

## Files

`before/` and `after/`, the same eight captures each: the seven platform presets
plus the Popout S FEATURES panel open. `popout_s_400x225.png` is the pair that
carries the decision.

The composition gate's derived Popout S floor moved with the derivation, 42.0 to
48.0, because the divisor it is computed from changed from 534 to 468. It was
re-derived, not re-pinned to an observation, and the gate's seeded-violation
self-test still passes in both directions.
