# Vector Mark V3: Generation Record

- **Tool:** deterministic Python generator (`tools/brand/build_vector_mark_v3.py`),
  reusing v2's font-to-path and arc-layout math directly
  (`tools/brand/build_vector_mark.py`) rather than re-deriving it - same
  geometry skeleton (r230/r196/r176 rings, 24 notches, 5 spokes at 18-degree
  offset, the reel window, the arched wordmarks), different fill/glow
  construction.
- **Date generated:** 2026-07-24 (OWNER AUDIT REMEDIATION C2, replacing the
  rejected `wrs_mark_v2.svg`).

## What changed from v2

v2 was a hollow, double-stroke outline construction (paths-only, no fills
except the gold 7s). v3 is a filled "dark coin" badge:

- A solid navy radial-gradient plate (`r=230` disk) behind everything - the
  "filled dark coin" the brief asked for, replacing v2's transparent-in-the-
  middle ring construction.
- The chrome rim is a `linearGradient` fill (light-mid-dark-mid-light,
  simulating a brushed metallic sheen), not v2's two flat grey bands.
- Spokes are filled gunmetal with a magenta **SVG gaussian-blur** edge glow
  (`<filter><feGaussianBlur>`), not a flat stroke.
- The reel window is a lit panel: a blurred cyan glow ring around the frame,
  gold filled 7s with their own blurred gold glow layered underneath the
  crisp fill+outline pass.
- The wordmarks are neon-sign style: filled cyan letterforms with a layered,
  blurred magenta glow behind and a crisp cyan outline on top - a lit tube
  look, not v2's hollow inner/outer double-stroke.

## A real rendering-tool bug found and worked around

cairosvg (used throughout v2's build/export/gate pipeline) does **not**
correctly render `feGaussianBlur`: a test circle with `stdDeviation="3"`
showed alpha falling from 255 to 0 within ~2 pixels - a hard edge, not a
blur - confirmed by direct pixel sampling before committing to this
construction style at all. Since v3's entire glow treatment depends on
real gaussian blur, every v3 render (previews, gate measurements, PNG
exports) goes through headless Chromium instead
(`frontend/scripts/gate_vector_mark_v3.mjs`, plus an export pass), which has
a real filter engine. v2's existing cairosvg-based files/gates are
untouched - this is a v3-only pipeline change.

## A mono-variant bug caught before the gates were run for record

The first mono-cyan render was a single solid cyan disk with no visible
detail: mono mode made the r=230 navy plate cyan too (mirroring v2's own
"tyre fill becomes cyan in mono" pattern), but unlike v2's thin annulus, v3's
plate is a full disk reaching the centre - making it cyan buried every other
cyan-filled element stacked on top of it into one flat circle. Fixed by
keeping the plate navy in both variants; only the structural/decorative
elements (rim, notches, spokes, window, digits, wordmarks) go cyan in mono.

## Gate results (`frontend/scripts/gate_vector_mark_v3.mjs`)

| Gate | wrs_mark_v3.svg | wrs_mark_v3_mono_cyan.svg |
|---|---|---|
| Paths-only | PASS | PASS |
| Margin symmetry (512 render) | PASS - 26px all four sides, spread 0 | PASS - 26px all four sides, spread 0 |
| Minimum stroke at 192 render >=2px | PASS - measured 22px | n/a (mono has no stroke layer) |

Same numeric gates as v2 (paths-only element check, 2px margin-symmetry
tolerance, 2px minimum-stroke floor at 192) - filters are not in the
paths-only gate's forbidden-element list (it only forbids drawable
primitives - rect/circle/ellipse/line/polygon/polyline/text/image - not
`<filter>`/`<feGaussianBlur>`/`<feMerge>` defs), so v3's filter-dependent
construction passes the same gate v2 used without needing to change it.

## Scope: sub-96 contexts only

Per the brief, the hero emblem (`design-system/brand/hero_emblem/`) remains
the canonical logo at 96px and above; v3 covers favicon/watermark contexts
below that. Confirmed by direct legibility check: at 48px, v3's solid-filled
construction reads far more clearly (the chrome coin + reel window + 7s
silhouette is genuinely recognisable) than v2's hollow-outline version did
at the same size - v2's thin double-stroke lines washed out at small scale
in a way solid fills do not.

## Exports

`wrs_mark_v3.svg` / `wrs_mark_v3_mono_cyan.svg` plus transparent PNGs at
512/192/96/48 for each (rendered via Chromium, not cairosvg - see above),
all under `design-system/brand/vector_mark/`. Proofs (composited onto a
dark preview background) and gate output under
`reports/screens/brand-vector-mark-v3/`. Committed for owner judgement per
the brief - not wired into any frontend code path yet.
