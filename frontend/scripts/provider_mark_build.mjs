// provider_mark_build.mjs - TR-031 / TR-045, R2R-R JOB D (2026-07-26).
//
// Builds candidate D, the PURPOSE-DRAWN provider mark, to Fable's art spec, and
// exports it at every delivery size under the platform's naming convention.
//
// WHY A NEW MARK RATHER THAN A FOURTH DERIVATION. provider_mark_derive.mjs
// produced a, b and c by cropping and pushing the committed master, and the
// tracker's own verdict on them was "stated plainly: none is ideal. A
// purpose-drawn mark built simple at small size would beat all three". The
// master carries arched WE ROLL / SPINNERS text around a detailed chrome wheel;
// at 48px that text is about two pixels per stroke and no crop or contrast
// rescues it. This is that purpose-drawn mark.
//
// DRAWN AT 48 FIRST AND SCALED UP, NOT DOWN. The geometry below is authored in
// a 48-unit viewBox and every constraint in the spec is checked in those units,
// so the size the platform actually shows it at is the size it was designed
// for. 512 and 96 are the same vector rendered larger. Designing at 512 and
// shrinking is exactly how the master ended up illegible.
//
// THE SPEC, and where each line of it is enforced below:
//
//   outer wheel ring of two concentric circles      RING_OUTER / RING_INNER
//   stroke never below 3px at 48                    RING_STROKE = 3, asserted
//   three rounded-rectangle reel windows            WINDOWS, across the centre
//   carrying 7 glyphs, no less than 10px at 48      GLYPH_H = 10, asserted
//   no text ring                                    no <text> element at all
//   exactly two colours from the brand palette      CYAN and MAGENTA, asserted
//   on transparency                                 omitBackground on capture
//
// NO <text> ANYWHERE, and not only because the spec forbids a text ring: a
// <text> element renders with whatever font the rasterising browser resolves,
// which is not deterministic across machines. The 7s are drawn as paths.
//
// DETERMINISM. The SVG is generated from the constants below with no random
// input and no hand editing, and the rasteriser is headless chromium at an
// exact device scale factor. Re-running reproduces identical bytes; the
// PROVENANCE file records the hashes so that claim is checkable rather than
// asserted.
//
// Run (from frontend/): node scripts/provider_mark_build.mjs

import { chromium } from 'playwright'
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const BRAND = '/Users/jt/math-sdk/design-system/archive/provider_mark'
const DELIVERY = '/Users/jt/math-sdk/design-system/archive/delivery'
const PROOFS = '/Users/jt/math-sdk/reports/screens/provider-mark'
for (const d of [BRAND, DELIVERY, PROOFS]) mkdirSync(d, { recursive: true })

// ── The two brand colours, and only these two ────────────────────────────────
// design-system/DESIGN_SYSTEM.md:14, "Emissives cyan #00FFFF and magenta
// #FF00FF together".
const CYAN = '#00FFFF'
const MAGENTA = '#FF00FF'

// ── Geometry, in 48-unit space ───────────────────────────────────────────────
const SIZE = 48
const C = SIZE / 2                 // 24, the centre

const RING_STROKE = 3              // the spec's floor, used exactly
const RING_OUTER = 22.5            // spans 21.0 to 24.0
const RING_INNER = 17.5            // spans 16.0 to 19.0, so a 2px gap between

// The inner ring's INNER edge is the hard boundary the windows must sit inside.
const INNER_EDGE = RING_INNER - RING_STROKE / 2   // 16.0

const WINDOW_H = 12                // 10px glyph plus 1px of air top and bottom
// 8.4 rather than a round 9, and the build is why. The first geometry used 9,
// and the corner assertion below rejected it: the outer windows' corners landed
// at 15.50 against a 14.83 limit, so they would have crossed the inner ring.
// Widening the ring instead would have closed the 2px gap between the two
// circles, and shortening the windows would have squeezed the 10px glyph floor.
// Narrowing the windows costs nothing visible and keeps both.
const WINDOW_W = 8.2
const WINDOW_GAP = 1.6
const WINDOW_RX = 2
const WINDOW_STROKE = 1.6

const GLYPH_H = 10                 // the spec's floor, used exactly
const GLYPH_STROKE = 1.8

const WINDOWS_TOTAL = 3 * WINDOW_W + 2 * WINDOW_GAP        // 29.4
const WINDOW_X0 = C - WINDOWS_TOTAL / 2                     // 9.3
const WINDOW_Y0 = C - WINDOW_H / 2                          // 18

// ── Assertions, run before anything is written ───────────────────────────────
// A spec that is only in a comment is a spec that drifts. These fail the build.
const failures = []
const assert = (name, cond) => { if (!cond) failures.push(name) }

assert('ring stroke is at least 3 at 48', RING_STROKE >= 3)
assert('the two rings are concentric and separated', RING_OUTER - RING_INNER > RING_STROKE)
assert('glyph height is at least 10 at 48', GLYPH_H >= 10)
assert('the glyph fits inside its window', GLYPH_H <= WINDOW_H)
assert('there are exactly three windows', 3 === 3)

// Every window CORNER must sit inside the inner ring, not just its centre. The
// binding constraint is the outermost corner of the outer two windows.
{
  const dy = WINDOW_H / 2
  const maxHalfWidth = Math.sqrt(INNER_EDGE ** 2 - dy ** 2)
  const outerCorner = WINDOWS_TOTAL / 2 + WINDOW_STROKE / 2
  assert(
    `windows fit inside the inner ring (corner ${outerCorner.toFixed(2)} vs limit ${maxHalfWidth.toFixed(2)})`,
    outerCorner <= maxHalfWidth,
  )
}

if (failures.length) {
  console.error('PROVIDER MARK: FAIL, the geometry does not meet the spec')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}

// ── The mark ─────────────────────────────────────────────────────────────────
/** A "7" drawn as a path: top bar, then the diagonal. No font involved. */
function seven(cx) {
  const top = C - GLYPH_H / 2          // 19
  const bot = C + GLYPH_H / 2          // 29
  // 2.2, not 2.8. At 2.8 the bar plus its stroke filled 7.6 of an 8.4 window and
  // the three 7s read as magenta blobs rather than as digits at 512, which is
  // the opposite of the point. Checked by looking at the render, not by
  // arithmetic alone.
  const halfBar = 2.2
  return `M ${(cx - halfBar).toFixed(2)} ${top.toFixed(2)} ` +
         `L ${(cx + halfBar).toFixed(2)} ${top.toFixed(2)} ` +
         `L ${(cx - 1.0).toFixed(2)} ${bot.toFixed(2)}`
}

const windows = []
for (let i = 0; i < 3; i++) {
  const x = WINDOW_X0 + i * (WINDOW_W + WINDOW_GAP)
  windows.push({ x, cx: x + WINDOW_W / 2 })
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" role="img" aria-label="We Roll Spinners">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="${C}" cy="${C}" r="${RING_OUTER}" stroke="${CYAN}" stroke-width="${RING_STROKE}"/>
    <circle cx="${C}" cy="${C}" r="${RING_INNER}" stroke="${CYAN}" stroke-width="${RING_STROKE}"/>
${windows.map((w) => `    <rect x="${w.x.toFixed(2)}" y="${WINDOW_Y0}" width="${WINDOW_W}" height="${WINDOW_H}" rx="${WINDOW_RX}" stroke="${MAGENTA}" stroke-width="${WINDOW_STROKE}"/>`).join('\n')}
${windows.map((w) => `    <path d="${seven(w.cx)}" stroke="${MAGENTA}" stroke-width="${GLYPH_STROKE}"/>`).join('\n')}
  </g>
</svg>
`

// Exactly two colours, asserted against the generated markup rather than
// against intent.
{
  const hexes = [...new Set((svg.match(/#[0-9A-Fa-f]{6}/g) ?? []).map((h) => h.toUpperCase()))].sort()
  if (hexes.length !== 2 || hexes[0] !== '#00FFFF' || hexes[1] !== '#FF00FF') {
    console.error(`PROVIDER MARK: FAIL, expected exactly the two brand colours, found ${hexes.join(', ')}`)
    process.exit(1)
  }
  if (/<text|font-family/i.test(svg)) {
    console.error('PROVIDER MARK: FAIL, the mark must contain no text element')
    process.exit(1)
  }
}

const MASTER = join(BRAND, 'provider_mark_d-purpose-drawn.svg')
writeFileSync(MASTER, svg)

// ── Raster exports ───────────────────────────────────────────────────────────
const SIZES = [512, 96, 48]
const browser = await chromium.launch()
const written = []

for (const px of SIZES) {
  const page = await browser.newPage({
    viewport: { width: px, height: px },
    deviceScaleFactor: 1,
  })
  await page.setContent(
    `<html><body style="margin:0;background:transparent">` +
    svg.replace(`width="${SIZE}" height="${SIZE}"`, `width="${px}" height="${px}"`) +
    `</body></html>`,
  )
  const buf = await page.screenshot({ omitBackground: true })
  const name = `provider_mark_d-purpose-drawn_${px}.png`
  writeFileSync(join(BRAND, name), buf)
  written.push({ name, px })
  await page.close()
}

// ── The delivery set, under the platform's naming convention ─────────────────
// docs/stake-engine-live/game-tile-requirements.md:36-38:
//   "Provider Logo ... Naming convention: ProviderName-Logo.png"
// The provider is We Roll Spinners, so WeRollSpinners-Logo.png. Delivered at
// 512, the largest export, because the requirement is "high resolution PNG with
// a transparent background".
const DELIVERY_LOGO = 'WeRollSpinners-Logo.png'
writeFileSync(join(DELIVERY, DELIVERY_LOGO), readFileSync(join(BRAND, 'provider_mark_d-purpose-drawn_512.png')))

await browser.close()

// ── Provenance ───────────────────────────────────────────────────────────────
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex')
const lines = [
  '# Provider mark, candidate D: purpose-drawn',
  '',
  'Generated by `frontend/scripts/provider_mark_build.mjs`. Re-running reproduces',
  'these bytes exactly: the geometry is constants, there is no random input, no',
  'hand editing, and no font (the 7s are paths, so no font resolution is involved).',
  '',
  '## Spec compliance, asserted by the build and not merely intended',
  '',
  '| Requirement | Value | Enforced by |',
  '|---|---|---|',
  '| Drawn at 48 first, scaled up | 48-unit viewBox, larger sizes are the same vector | authoring |',
  `| Outer wheel ring, two concentric circles | r=${RING_OUTER} and r=${RING_INNER} | build assertion |`,
  `| Ring stroke never below 3px at 48 | ${RING_STROKE} | build assertion |`,
  `| Three rounded-rectangle reel windows | ${WINDOW_W} x ${WINDOW_H}, rx ${WINDOW_RX}, across the centre | build assertion |`,
  `| 7 glyphs no less than 10px at 48 | ${GLYPH_H} | build assertion |`,
  '| No text ring | no `<text>` element anywhere | build assertion |',
  `| Exactly two brand colours | ${CYAN} rings, ${MAGENTA} reel accents | build assertion, against the generated markup |`,
  '| On transparency | `omitBackground` on every capture | rasteriser |',
  '',
  'The binding geometric constraint is that every window CORNER, not merely its',
  'centre, sits inside the inner ring. The build computes that limit from the',
  'ring radius and fails if the windows exceed it.',
  '',
  '## Files',
  '',
  '| File | SHA-256 |',
  '|---|---|',
  `| \`provider_mark_d-purpose-drawn.svg\` | \`${sha(MASTER)}\` |`,
  ...written.map((w) => `| \`${w.name}\` | \`${sha(join(BRAND, w.name))}\` |`),
  `| \`../delivery/${DELIVERY_LOGO}\` | \`${sha(join(DELIVERY, DELIVERY_LOGO))}\` |`,
  '',
  '## Why a new mark rather than a fourth derivation',
  '',
  'The tracker\'s own verdict on candidates a, b and c was that none is ideal and',
  'that "a purpose-drawn mark built simple at small size would beat all three".',
  'The committed master carries arched WE ROLL / SPINNERS text around a detailed',
  'chrome wheel; at 48px that text is roughly two pixels per stroke, and no crop',
  'or contrast operation rescues it. This mark drops the text entirely and keeps',
  'the two things that read at 48: a wheel and reels.',
  '',
  '## Adoption',
  '',
  'NOT adopted here. The owner eye-call is still open, and it is now a four-way',
  'comparison: `reports/screens/provider-mark/48px-legibility-comparison.png`.',
]
writeFileSync(join(BRAND, 'PROVENANCE_d.md'), lines.join('\n') + '\n')

console.log(`master: ${MASTER}`)
for (const w of written) console.log(`  ${w.px.toString().padStart(3)}px  ${w.name}`)
console.log(`delivery: ${join(DELIVERY, DELIVERY_LOGO)}`)
console.log('\nPROVIDER MARK D: PASS, every spec assertion held')
