# Tier 2 Vector Mark: Generation Record

- **Tool:** deterministic Python generator (`tools/brand/build_vector_mark.py`),
  not AI-generated - every coordinate is computed from the brief's own
  numeric spec (radii, stroke widths, angles, tracking).
- **Date generated:** 2026-07-23 (FABLE ART MASTERS brief, PART 1).
- **Font-to-path conversion:** `fontTools` (added to `scripts/assets/.venv`)
  extracts Orbitron Bold (`@fontsource/orbitron`, `orbitron-latin-700-normal.woff2`)
  glyph outlines directly as SVG path data at build time. The shipped SVG
  contains zero `<text>` elements and has no runtime font dependency - every
  letter and digit is a pre-computed `<path>`. Orbitron is licensed under the
  SIL Open Font License 1.1 (`frontend/node_modules/@fontsource/orbitron/LICENSE`,
  already vendored as an existing frontend dependency), which explicitly
  permits deriving outline artwork from the font.

## Palette

Cyan `#00FFFF`, magenta `#FF00FF`, gold `#FFD700` and navy `#060610` are the
named tokens from `design-system/DESIGN_SYSTEM.md`. Two families the brief
names qualitatively but that have no existing hex in that document:

- **Gunmetal** (tyre annulus, spokes): `#1a1e2b` - a dark navy-grey chosen to
  sit in the "deep-navy gunmetal" family alongside navy `#060610`, distinct
  enough for the tyre body to read as metal rather than pure background.
- **Chrome rim's "two flat greys":** `#c9cedb` (light) / `#868fa3` (dark),
  a highlight/shadow pair for the r196-r176 ring.

## A tension in the brief's own hard rules, resolved and recorded

The brief states a global hard rule of "minimum stroke 6 units" alongside
"no detail under 8 units", but then separately specifies the arched
wordmark's own treatment at 5 units (inner) and 3 units (outer), and the
reel digits' outline at 4 units - all below that stated global minimum.
Read as two more specific, later instructions for named decorative
elements (the neon-sign double-stroke letters, the digit outline) rather
than a values to inflate to 6, this generator implements the wordmark and
digits exactly as specified (5/3/4 units) and treats "minimum stroke 6
units" as governing the mark's *structural* geometry - the five spokes'
magenta edge (6 units) and the reel window's two dividers (6 units) - which
is also what `tools/brand/gate_vector_mark.py`'s render gate measures.

## Design decisions not fully specified by the brief

- **Spoke rotation offset (18 degrees):** five spokes at a bare 0/72/144/
  216/288 degree layout puts one spoke directly behind the wordmark's
  top-centre letter and (mirrored) the bottom-centre letter - confirmed
  visually in an early render, worst on the mono-cyan variant where the
  spoke's fill and the letter's fill are the same colour and merge
  outright. An 18 degree offset (avoiding both 0 and 180 mod 72) clears
  both wordmark centres.
- **Wordmark radial anchoring:** letters are vertically centred on the
  arc's stated radius (150), not baseline-anchored on it. Baseline-anchoring
  (the first attempt) pushed cap-tops to radius 150+44=194, past the chrome
  rim's inner edge at 176 - a real overlap bug, not a style choice, caught
  by the same mono-cyan-merge symptom above and fixed before the gates were
  run for record.
- **Digit cap height (76 units)** and **wordmark tracking (10 units)**: not
  numerically specified beyond "cap height ~44" for the wordmark (used
  exactly) and no explicit digit size - 76 units was chosen to fill the
  three reel slots (each ~68 units wide inside the window) with comfortable
  margin.

## Gate results (`tools/brand/gate_vector_mark.py`)

| Gate | wrs_mark_v2.svg | wrs_mark_v2_mono_cyan.svg |
|---|---|---|
| Paths-only (no text/rect/circle/ellipse/line/polygon/polyline/image) | PASS | PASS |
| Margin symmetry (output-derived sweep, 512 render) | PASS - 26px all four sides, spread 0 | PASS - 26px all four sides, spread 0 |
| Minimum stroke at 192 render >=2px (structural 6-unit spoke stroke) | PASS - measured 20px | n/a (mono variant has no stroke layer) |

## Exports

`wrs_mark_v2.svg` / `wrs_mark_v2_mono_cyan.svg` plus transparent PNGs at
512/192/96/48 for each, all under `design-system/brand/vector_mark/`, with
proof renders copied to `reports/screens/brand-vector-mark/`. At 48px the
arched wordmark text is no longer individually legible (expected for
detailed circular badge text at that size - the reel window/tyre/rim shape
carries brand recognition at that scale); it reads clearly from 96px up.
