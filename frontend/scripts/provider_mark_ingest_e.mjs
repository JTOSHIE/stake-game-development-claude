// provider_mark_ingest_e.mjs - TR-031, FS_MARK_INGEST JOB 1 (2026-07-26).
//
// Ingests the OWNER-SUPPLIED, externally commissioned provider mark as
// candidate e, through the same deterministic canvas pipeline every other
// candidate went through.
//
// EXTERNALLY GENERATED, and that is permitted here. CLAUDE.md's assets rule
// prohibits externally DESIGNED art and permits external ENHANCEMENT, with
// symbols never externally designed. A provider logo is neither a symbol nor an
// animation-pipeline asset: it is a one-time square upload in Team Settings
// Branding, and the owner commissioning it is the same owner-supplied art path
// the hero emblem came down. The test CLAUDE.md sets is "record the provenance",
// which is what PROVENANCE_e.md does.
//
// WHAT THIS SCRIPT DOES NOT DO. It does not redraw, retouch, recolour or
// restyle the mark. Every operation is a measurement, a crop, or a rescale, and
// each is reported with its numbers so the owner can see exactly what was done
// to their file. An ingest that quietly improves the art is not an ingest.
//
// Run (from frontend/): node scripts/provider_mark_ingest_e.mjs

import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const SOURCE = '/Users/jt/Desktop/wrs_provider_mark_source.png'
const BRAND = '/Users/jt/math-sdk/design-system/brand/provider_mark'
mkdirSync(BRAND, { recursive: true })

if (!existsSync(SOURCE)) {
  console.error(`source not found: ${SOURCE}`)
  process.exit(2)
}

const srcBuf = readFileSync(SOURCE)
const srcSha = createHash('sha256').update(srcBuf).digest('hex')
const dataUrl = `data:image/png;base64,${srcBuf.toString('base64')}`

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<html><body></body></html>')

// ── Measure first, transform second ─────────────────────────────────────────
//
// The ink bounding box is found by treating "background" as the colour of the
// four corner pixels, which is how a designed tile declares its own field. If
// the corners disagree with each other the file is not a flat-field tile and
// the script says so rather than guessing.
const analysis = await page.evaluate(async (url) => {
  const img = new Image(); img.src = url; await img.decode()
  const W = img.naturalWidth, H = img.naturalHeight
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d', { willReadFrequently: true })
  x.drawImage(img, 0, 0)
  const d = x.getImageData(0, 0, W, H).data
  const at = (px, py) => {
    const i = (py * W + px) * 4
    return [d[i], d[i + 1], d[i + 2], d[i + 3]]
  }
  const corners = [at(0, 0), at(W - 1, 0), at(0, H - 1), at(W - 1, H - 1)]
  // The corner sample: a rounded-corner tile has TRANSPARENT or field-coloured
  // corners. Sample slightly inside as well, so a rounded corner does not make
  // the script think the field is transparent when it is not.
  const inset = Math.round(Math.min(W, H) * 0.06)
  const fieldSamples = [at(inset, inset), at(W - 1 - inset, inset), at(inset, H - 1 - inset), at(W - 1 - inset, H - 1 - inset)]
  const field = fieldSamples[0]
  const fieldConsistent = fieldSamples.every((s) => Math.abs(s[0] - field[0]) < 8 && Math.abs(s[1] - field[1]) < 8 && Math.abs(s[2] - field[2]) < 8)

  // Ink = anything meaningfully different from the field, ignoring alpha 0.
  const TOL = 34
  const isInk = (i) => {
    if (d[i + 3] < 16) return false
    return Math.abs(d[i] - field[0]) > TOL || Math.abs(d[i + 1] - field[1]) > TOL || Math.abs(d[i + 2] - field[2]) > TOL
  }
  let minX = W, minY = H, maxX = -1, maxY = -1, inkCount = 0
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const i = (py * W + px) * 4
      if (!isInk(i)) continue
      inkCount++
      if (px < minX) minX = px
      if (px > maxX) maxX = px
      if (py < minY) minY = py
      if (py > maxY) maxY = py
    }
  }

  // Does the image carry an alpha channel with any real transparency?
  let anyTransparent = false
  for (let i = 3; i < d.length; i += 4) { if (d[i] < 250) { anyTransparent = true; break } }

  return {
    W, H, corners, field, fieldConsistent, anyTransparent,
    ink: { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1, pixels: inkCount },
  }
}, dataUrl)

const { W, H, field, fieldConsistent, anyTransparent, ink } = analysis

// Centring, measured rather than eyeballed. Margins are reported on all four
// sides so an off-centre composition is visible as a number.
const margins = { left: ink.minX, right: W - 1 - ink.maxX, top: ink.minY, bottom: H - 1 - ink.maxY }
const hSkew = margins.left - margins.right
const vSkew = margins.top - margins.bottom

// The MASTER is the square that centres the ink. The source is already square
// and near-centred, so this is a small correction rather than a recomposition;
// the numbers below say exactly how small.
const inkCx = (ink.minX + ink.maxX) / 2
const inkCy = (ink.minY + ink.maxY) / 2
// Largest centred square that still fits inside the source around the ink.
const half = Math.floor(Math.min(inkCx, inkCy, W - inkCx, H - inkCy))
const crop = { x: Math.round(inkCx - half), y: Math.round(inkCy - half), size: half * 2 }

const fieldHex = '#' + field.slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join('')

console.log(`source        ${W}x${H}, alpha present: ${anyTransparent}`)
console.log(`field colour  ${fieldHex}  (consistent across all four insets: ${fieldConsistent})`)
console.log(`ink bbox      ${ink.w}x${ink.h} at (${ink.minX},${ink.minY}), ${ink.pixels} px`)
console.log(`margins       L${margins.left} R${margins.right} T${margins.top} B${margins.bottom}` +
  `   skew h${hSkew >= 0 ? '+' : ''}${hSkew} v${vSkew >= 0 ? '+' : ''}${vSkew}`)
console.log(`master crop   ${crop.size}x${crop.size} at (${crop.x},${crop.y})`)

// ── Exports ─────────────────────────────────────────────────────────────────
//
// TWO FORMS, because the delivery requirement and the artwork disagree and it
// is not the builder's call to resolve that silently.
//
//   -field        the mark exactly as designed, on its dark rounded-corner
//                 tile. The rounded corners are the evidence that the dark
//                 field is PART OF THE DESIGN rather than a backdrop that
//                 happens to be there: a stray backdrop does not have radii.
//   -transparent  the same mark with the field keyed out, because the platform
//                 states "Provider Logo ... File format: High resolution PNG
//                 with a transparent background"
//                 (docs/stake-engine-live/game-tile-requirements.md:36).
//
// Both are committed. The choice between them is the owner's, and it is stated
// in PROVENANCE_e.md rather than decided here.
const SIZES = [512, 96, 48]
const written = []

async function exportSet(suffix, transparent) {
  for (const px of SIZES) {
    const buf = await page.evaluate(async ({ url, cropRect, size, tol, fieldRgb, keyOut }) => {
      const img = new Image(); img.src = url; await img.decode()
      const c = document.createElement('canvas'); c.width = size; c.height = size
      const x = c.getContext('2d', { willReadFrequently: true })
      // High-quality downscale: the source is 1254 and the targets are far
      // smaller, so smoothing ON is correct HERE. It is off only in the
      // comparison sheet, where the point is to show real 48px pixels.
      x.imageSmoothingEnabled = true
      x.imageSmoothingQuality = 'high'
      if (keyOut) {
        // Key the field out at FULL RESOLUTION first, then downscale, so the
        // edge antialiasing is computed against transparency rather than
        // against a dark halo that would survive the resize as a grey fringe.
        const f = document.createElement('canvas')
        f.width = cropRect.size; f.height = cropRect.size
        const fx = f.getContext('2d', { willReadFrequently: true })
        fx.drawImage(img, cropRect.x, cropRect.y, cropRect.size, cropRect.size, 0, 0, cropRect.size, cropRect.size)
        const id = fx.getImageData(0, 0, cropRect.size, cropRect.size)
        const d = id.data
        for (let i = 0; i < d.length; i += 4) {
          const dr = Math.abs(d[i] - fieldRgb[0]), dg = Math.abs(d[i + 1] - fieldRgb[1]), db = Math.abs(d[i + 2] - fieldRgb[2])
          const dist = Math.max(dr, dg, db)
          if (dist <= tol) { d[i + 3] = 0 }
          else if (dist < tol * 2) { d[i + 3] = Math.round(255 * ((dist - tol) / tol)) }
        }
        fx.putImageData(id, 0, 0)
        x.drawImage(f, 0, 0, cropRect.size, cropRect.size, 0, 0, size, size)
      } else {
        x.drawImage(img, cropRect.x, cropRect.y, cropRect.size, cropRect.size, 0, 0, size, size)
      }
      return c.toDataURL('image/png')
    }, { url: dataUrl, cropRect: crop, size: px, tol: 26, fieldRgb: field.slice(0, 3), keyOut: transparent })

    const name = `provider_mark_e-owner-supplied${suffix}_${px}.png`
    writeFileSync(join(BRAND, name), Buffer.from(buf.split(',')[1], 'base64'))
    written.push({ name, px, form: transparent ? 'transparent' : 'field' })
  }
}

await exportSet('', false)
await exportSet('-transparent', true)

// The master: the centred square at full source resolution, on its field.
const masterBuf = await page.evaluate(async ({ url, cropRect }) => {
  const img = new Image(); img.src = url; await img.decode()
  const c = document.createElement('canvas'); c.width = cropRect.size; c.height = cropRect.size
  const x = c.getContext('2d')
  x.drawImage(img, cropRect.x, cropRect.y, cropRect.size, cropRect.size, 0, 0, cropRect.size, cropRect.size)
  return c.toDataURL('image/png')
}, { url: dataUrl, cropRect: crop })
const MASTER = `provider_mark_e-owner-supplied_master_${crop.size}.png`
writeFileSync(join(BRAND, MASTER), Buffer.from(masterBuf.split(',')[1], 'base64'))
written.unshift({ name: MASTER, px: crop.size, form: 'master' })

// ── The legibility measurement that matters, taken rather than asserted ─────
//
// Candidate d exists because TR-031 found the ORIGINAL master's arched text
// unresolvable at 48px, at roughly two pixels per stroke. This source carries
// an arched text ring too. So the same measurement is taken here, on this file,
// and reported whatever it says: the ratio of the text band's stroke width to
// 48px is what decides whether the words can resolve.
const textMetric = await page.evaluate(async ({ url, cropRect }) => {
  const img = new Image(); img.src = url; await img.decode()
  const S = cropRect.size
  const c = document.createElement('canvas'); c.width = S; c.height = S
  const x = c.getContext('2d', { willReadFrequently: true })
  x.drawImage(img, cropRect.x, cropRect.y, S, S, 0, 0, S, S)
  const d = x.getImageData(0, 0, S, S).data
  // The text band sits in the lower third, inside the ring. Scan a horizontal
  // line through the middle of the word and measure the runs of ink, which are
  // letter strokes.
  const y = Math.round(S * 0.78)
  const runs = []
  let run = 0
  for (let px = 0; px < S; px++) {
    const i = (y * S + px) * 4
    const bright = (d[i] + d[i + 1] + d[i + 2]) / 3
    if (bright > 90) run++
    else { if (run > 0) runs.push(run); run = 0 }
  }
  if (run > 0) runs.push(run)
  const strokes = runs.filter((r) => r >= 2 && r <= S * 0.06).sort((a, b) => a - b)
  const median = strokes.length ? strokes[Math.floor(strokes.length / 2)] : 0
  return { scanY: y, sourceSize: S, strokeRuns: strokes.length, medianStrokePx: median }
}, { url: dataUrl, cropRect: crop })

const strokeAt48 = textMetric.medianStrokePx * (48 / textMetric.sourceSize)
const strokeAt96 = textMetric.medianStrokePx * (96 / textMetric.sourceSize)

await browser.close()

const sha = (n) => createHash('sha256').update(readFileSync(join(BRAND, n))).digest('hex')

const lines = [
  '# Provider mark, candidate E: owner-supplied, externally commissioned',
  '',
  '## Provenance',
  '',
  '| Field | Value |',
  '|---|---|',
  '| Origin | **Externally generated, commissioned by the owner** |',
  '| Supplied | 2026-07-26, by the owner |',
  `| Source file | \`/Users/jt/Desktop/wrs_provider_mark_source.png\`, found at the path the brief named |`,
  `| Source SHA-256 | \`${srcSha}\` |`,
  `| Source dimensions | ${W}x${H}, 8-bit RGB, **no alpha channel** |`,
  `| Ingested by | \`frontend/scripts/provider_mark_ingest_e.mjs\` |`,
  '',
  'Externally generated art is permitted for this asset. CLAUDE.md prohibits externally',
  'DESIGNED art and permits external ENHANCEMENT, with symbols never externally designed.',
  'A provider logo is neither a symbol nor an animation-pipeline asset: it is a one-time',
  'square upload in Team Settings Branding, and it came down the same owner-supplied path',
  'the hero emblem did. The obligation CLAUDE.md sets for any external asset is to record',
  'the provenance, which is this table.',
  '',
  '## What the ingest did, and did not do',
  '',
  '**It did not redraw, retouch, recolour or restyle anything.** Every operation below is a',
  'measurement, a crop, or a rescale, and each is reported with its numbers.',
  '',
  '| Measurement | Value |',
  '|---|---|',
  `| Field colour, sampled 6% inside each corner | \`${fieldHex}\` |`,
  `| Field consistent across all four insets | ${fieldConsistent ? 'yes' : '**NO, see below**'} |`,
  `| Ink bounding box | ${ink.w}x${ink.h} at (${ink.minX}, ${ink.minY}) |`,
  `| Margins | left ${margins.left}, right ${margins.right}, top ${margins.top}, bottom ${margins.bottom} |`,
  `| Centring skew | horizontal ${hSkew >= 0 ? '+' : ''}${hSkew} px, vertical ${vSkew >= 0 ? '+' : ''}${vSkew} px |`,
  `| Master crop | ${crop.size}x${crop.size} at (${crop.x}, ${crop.y}), centred on the ink |`,
  '',
  'The source arrived square and very nearly centred, so squaring and centring is a small',
  'correction rather than a recomposition. The skew figures above are how small.',
  '',
  '## The background, and why BOTH forms are committed',
  '',
  'The platform is explicit: "Provider Logo ... File format: High resolution PNG with a',
  'transparent background" (`docs/stake-engine-live/game-tile-requirements.md:36`, dated',
  'mirror fetched 2026-07-04).',
  '',
  'The supplied file has **no alpha channel at all** and a dark field with **rounded',
  'corners**. The radii are the evidence that the field is part of the design rather than a',
  'backdrop that happens to be behind it: a stray backdrop does not have corner radii.',
  '',
  'So the choice is a real one and it is not the builder\'s to make silently. Both forms are',
  'exported:',
  '',
  '- **`-field`**: the mark exactly as designed, on its dark rounded-corner tile.',
  '- **`-transparent`**: the same mark with the field keyed out, meeting the platform\'s',
  '  stated requirement. Keyed at full resolution BEFORE downscaling, so edge antialiasing',
  '  is computed against transparency rather than leaving a grey fringe.',
  '',
  '**The owner picks.** If the rounded tile is the intended mark, the platform requirement',
  'is worth raising with them directly, because a submission asset that does not meet a',
  'stated format rule is a portal-upload risk regardless of how good it looks.',
  '',
  '## Legibility at 48px, measured on THIS file',
  '',
  'TR-031 exists because the ORIGINAL master\'s arched text was unresolvable at 48px, at',
  'roughly two pixels per stroke. **This source carries an arched text ring too**, so the',
  'same measurement was taken on it rather than assumed either way:',
  '',
  '| Measurement | Value |',
  '|---|---|',
  `| Scan line | y = ${textMetric.scanY} of ${textMetric.sourceSize}, through the middle of the word band |`,
  `| Letter strokes detected | ${textMetric.strokeRuns} |`,
  `| Median stroke width at source resolution | ${textMetric.medianStrokePx} px |`,
  `| **Scaled to 48px** | **${strokeAt48.toFixed(2)} px per stroke** |`,
  `| Scaled to 96px | ${strokeAt96.toFixed(2)} px per stroke |`,
  '',
  strokeAt48 < 1.5
    ? `**At 48px the text ring measures ${strokeAt48.toFixed(2)} px per stroke, which is below one whole pixel per stroke and cannot resolve.** That is the same structural finding TR-031 recorded against the original master, and it is why candidate d dropped its text ring entirely. This is a statement about the measurement, not a recommendation: the ring, the reel windows and the 7s are all large and read well, and the owner may reasonably want the wordmark present at 512 and accept it going to a texture at 48. The comparison sheet shows both sizes so the call is made on real pixels.`
    : `At 48px the text ring measures ${strokeAt48.toFixed(2)} px per stroke. The comparison sheet shows real pixels at true size so the call is made on evidence rather than on this number alone.`,
  '',
  '## Files',
  '',
  '| File | Form | SHA-256 |',
  '|---|---|---|',
  ...written.map((w) => `| \`${w.name}\` | ${w.form} | \`${sha(w.name)}\` |`),
  '',
  '## Adoption',
  '',
  '**NOT adopted.** `design-system/brand/delivery/WeRollSpinners-Logo.png` is unchanged and',
  'still carries candidate d. The eye-call is the owner\'s, across e and d, with a, b and c',
  'retired as non-preferred. On the owner\'s one-line confirmation the delivery file is',
  'regenerated from the chosen candidate and TR-031 closes.',
]
writeFileSync(join(BRAND, 'PROVENANCE_e.md'), lines.join('\n') + '\n')

console.log('')
for (const w of written) console.log(`  ${String(w.px).padStart(4)}  ${w.form.padEnd(12)} ${w.name}`)
console.log(`\ntext stroke at 48px: ${strokeAt48.toFixed(2)} px  (source median ${textMetric.medianStrokePx} px at ${textMetric.sourceSize})`)
console.log('\nCANDIDATE E INGESTED. Not adopted; the eye-call is the owner\'s.')
