// provider_mark_ingest_g.mjs - TR-031 (2026-07-26).
//
// Ingests the owner's third externally-supplied delivery, the WE ROLL SPINNERS
// logo variant PACK, as candidate g. It does not retouch anything.
//
// This delivery differs from e and f in kind, not just in artwork: it is a
// PACK rather than a single file. Twenty-six files, its own README, transparent
// PNGs from 32 through 1254, WebP, JPG on white and on black, an .ico carrying
// three sizes, and two PDFs for print. The pack's README states its own intent
// per format, so the ingest records that intent rather than inventing one.
//
// THE PIPELINE IS DELIBERATELY IDENTICAL TO CANDIDATE F'S. The whole point of
// the JOB 2 comparison is that f and g are measured the same way, so the crop
// rule, the measurement set and the export ladder here are the same code path
// f went through in provider_mark_ingest_f.mjs. A candidate that arrived with a
// helpfully pre-cropped square would otherwise be comparing its supplier's crop
// against our own, which is not a comparison of the artwork.
//
// So the master here is derived from the pack's highest-resolution TRANSPARENT
// file (1254x1254) using f's ink-centred square crop, NOT from the pack's own
// we_roll_spinners_1096x1096_square_transparent.png. That file is recorded and
// measured in the provenance as the supplier's alternative crop, and it is not
// what the exports are built from.
//
// Run (from frontend/): node scripts/provider_mark_ingest_g.mjs

import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const SOURCE_DIR = '/Users/jt/Downloads/we_roll_spinners_logo'
const SOURCE_ZIP = '/Users/jt/Downloads/we_roll_spinners_logo_pack.zip'
const MASTER_SRC = 'we_roll_spinners_1254x1254_transparent.png'
const SQUARE_ALT = 'we_roll_spinners_1096x1096_square_transparent.png'
const BRAND = '/Users/jt/math-sdk/design-system/archive/provider_mark'
const PACK = join(BRAND, 'pack_g')
const FOUND_DATE = '2026-07-26'

mkdirSync(BRAND, { recursive: true })
mkdirSync(PACK, { recursive: true })

if (!existsSync(SOURCE_DIR)) {
  console.error(`source pack not found: ${SOURCE_DIR}`)
  process.exit(2)
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')

// ── The pack inventory, hashed in full ──────────────────────────────────────
//
// Every file, not a selection. The pack is the studio brand set per JOB 2, so
// the record has to cover the files that are kept for non-portal use as well as
// the one the exports come from.
const packFiles = readdirSync(SOURCE_DIR)
  .filter((f) => !f.startsWith('.'))
  .sort()
  .map((name) => {
    const buf = readFileSync(join(SOURCE_DIR, name))
    return { name, bytes: statSync(join(SOURCE_DIR, name)).size, sha: sha256(buf) }
  })

const zipSha = existsSync(SOURCE_ZIP) ? sha256(readFileSync(SOURCE_ZIP)) : null
const zipBytes = existsSync(SOURCE_ZIP) ? statSync(SOURCE_ZIP).size : null

const masterPath = join(SOURCE_DIR, MASTER_SRC)
if (!existsSync(masterPath)) {
  console.error(`pack master not found: ${masterPath}`)
  process.exit(2)
}
const srcBuf = readFileSync(masterPath)
const srcSha = sha256(srcBuf)
const dataUrl = `data:image/png;base64,${srcBuf.toString('base64')}`

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<html><body></body></html>')

// ── Measure, exactly as candidate f was measured ────────────────────────────
const measure = async (url) => page.evaluate(async (u) => {
  const img = new Image(); img.src = u; await img.decode()
  const W = img.naturalWidth, H = img.naturalHeight
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0)
  const d = x.getImageData(0, 0, W, H).data

  let minX = W, minY = H, maxX = -1, maxY = -1, opaque = 0, partial = 0, clear = 0
  const colours = new Map()
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const i = (py * W + px) * 4, al = d[i + 3]
    if (al === 0) { clear++; continue }
    if (al < 250) partial++; else opaque++
    if (px < minX) minX = px; if (px > maxX) maxX = px
    if (py < minY) minY = py; if (py > maxY) maxY = py
    if (al >= 250) {
      const k = '#' + [d[i], d[i + 1], d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('')
      colours.set(k, (colours.get(k) || 0) + 1)
    }
  }
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2
  const radii = []
  for (let deg = 0; deg < 360; deg++) {
    const th = deg * Math.PI / 180
    let last = 0
    for (let rr = 0; rr < Math.max(W, H) / 2; rr++) {
      const px = Math.round(cx + Math.cos(th) * rr), py = Math.round(cy + Math.sin(th) * rr)
      if (px < 0 || py < 0 || px >= W || py >= H) break
      if (d[(py * W + px) * 4 + 3] >= 128) last = rr
    }
    radii.push(last)
  }
  const mean = radii.reduce((s, v) => s + v, 0) / radii.length
  return {
    W, H, opaque, partial, clear,
    bbox: { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 },
    margins: { L: minX, R: W - 1 - maxX, T: minY, B: H - 1 - maxY },
    colours: [...colours.entries()].sort((p, q) => q[1] - p[1]),
    silhouette: { meanR: +mean.toFixed(1), minR: Math.min(...radii), maxR: Math.max(...radii) },
  }
}, url)

const a = await measure(dataUrl)
const skewH = a.margins.L - a.margins.R
const skewV = a.margins.T - a.margins.B
const lumpiness = ((a.silhouette.maxR - a.silhouette.minR) / a.silhouette.meanR) * 100

// The supplier's own square crop, measured but NOT used for the exports.
let alt = null
if (existsSync(join(SOURCE_DIR, SQUARE_ALT))) {
  const altBuf = readFileSync(join(SOURCE_DIR, SQUARE_ALT))
  alt = await measure(`data:image/png;base64,${altBuf.toString('base64')}`)
  alt.sha = sha256(altBuf)
}

// Square, centred on the ink. f's rule, unchanged.
const inkCx = (a.bbox.minX + a.bbox.maxX) / 2, inkCy = (a.bbox.minY + a.bbox.maxY) / 2
const half = Math.floor(Math.min(inkCx, inkCy, a.W - inkCx, a.H - inkCy))
const crop = { x: Math.round(inkCx - half), y: Math.round(inkCy - half), size: half * 2 }

console.log(`pack         ${packFiles.length} files at ${SOURCE_DIR}`)
console.log(`master src   ${MASTER_SRC}  ${a.W}x${a.H}, RGBA`)
console.log(`alpha        opaque ${a.opaque}, PARTIAL ${a.partial}, clear ${a.clear}`)
console.log(`colours      ${a.colours.length} distinct opaque RGB values`)
console.log(`margins      L${a.margins.L} R${a.margins.R} T${a.margins.T} B${a.margins.B}` +
  `   skew h${skewH >= 0 ? '+' : ''}${skewH} v${skewV >= 0 ? '+' : ''}${skewV}`)
console.log(`silhouette   mean r ${a.silhouette.meanR}, min ${a.silhouette.minR}, max ${a.silhouette.maxR}` +
  `   deviation ${lumpiness.toFixed(1)}%`)
console.log(`master crop  ${crop.size}x${crop.size} at (${crop.x},${crop.y})`)

// ── Exports, f's ladder ─────────────────────────────────────────────────────
const SIZES = [512, 96, 48]
const written = []

const masterBuf = await page.evaluate(async ({ url, cropRect }) => {
  const img = new Image(); img.src = url; await img.decode()
  const c = document.createElement('canvas'); c.width = cropRect.size; c.height = cropRect.size
  const x = c.getContext('2d')
  x.drawImage(img, cropRect.x, cropRect.y, cropRect.size, cropRect.size, 0, 0, cropRect.size, cropRect.size)
  return c.toDataURL('image/png')
}, { url: dataUrl, cropRect: crop })
const MASTER = `provider_mark_g-owner-pack_master_${crop.size}.png`
writeFileSync(join(BRAND, MASTER), Buffer.from(masterBuf.split(',')[1], 'base64'))
written.push({ name: MASTER, px: crop.size })

for (const px of SIZES) {
  const buf = await page.evaluate(async ({ url, cropRect, size }) => {
    const img = new Image(); img.src = url; await img.decode()
    const c = document.createElement('canvas'); c.width = size; c.height = size
    const x = c.getContext('2d')
    // Smoothing ON for the downscale, exactly as candidate f: a platform
    // resampling this asset to a small size uses a smoothing filter, so an
    // export produced without one would not be the thing that gets rendered.
    x.imageSmoothingEnabled = true
    x.imageSmoothingQuality = 'high'
    x.drawImage(img, cropRect.x, cropRect.y, cropRect.size, cropRect.size, 0, 0, size, size)
    return c.toDataURL('image/png')
  }, { url: dataUrl, cropRect: crop, size: px })
  const name = `provider_mark_g-owner-pack_${px}.png`
  writeFileSync(join(BRAND, name), Buffer.from(buf.split(',')[1], 'base64'))
  written.push({ name, px })
}

await browser.close()

// ── The pack itself, kept as the studio brand set ───────────────────────────
//
// JOB 2 records this pack as the studio brand set for non-portal use (favicon,
// site, print). "Recorded" is worth nothing if the files live only in an
// owner's Downloads folder, so the pack is copied in whole, byte for byte, and
// its hashes are the proof that it is the delivery rather than a re-export.
for (const f of packFiles) {
  writeFileSync(join(PACK, f.name), readFileSync(join(SOURCE_DIR, f.name)))
}
const packVerified = packFiles.every((f) => sha256(readFileSync(join(PACK, f.name))) === f.sha)
console.log(`pack copied  ${packFiles.length} files -> ${PACK}   hashes match: ${packVerified}`)
if (!packVerified) {
  console.error('PACK COPY FAILED: a copied file does not match its source hash')
  process.exit(3)
}

const sha = (n) => sha256(readFileSync(join(BRAND, n)))
const colourList = a.colours.slice(0, 8)
  .map(([h, n]) => `\`${h}\` (${n.toLocaleString()} px)`).join(', ')

const lines = [
  '# Provider mark, candidate G: owner-supplied variant pack',
  '',
  '## Provenance',
  '',
  '| Field | Value |',
  '|---|---|',
  '| Origin | **Externally generated, commissioned by the owner** |',
  `| Supplied | ${FOUND_DATE}, by the owner, as the third of three |`,
  `| Found at | \`${SOURCE_DIR}/\` (${packFiles.length} files), alongside \`${SOURCE_ZIP}\` |`,
  zipSha ? `| Pack zip SHA-256 | \`${zipSha}\` (${zipBytes.toLocaleString()} bytes) |` : '| Pack zip | not present |',
  `| Export source | \`${MASTER_SRC}\` |`,
  `| Export source SHA-256 | \`${srcSha}\` |`,
  `| Export source dimensions | ${a.W}x${a.H}, 8-bit **RGBA** |`,
  '| Ingested by | `frontend/scripts/provider_mark_ingest_g.mjs` |',
  `| Pack kept at | \`design-system/archive/provider_mark/pack_g/\`, all ${packFiles.length} files, hash-verified |`,
  '',
  'The delivery states its own origin in its README: the pack was generated from',
  '`we_roll_spinners_original_with_green_bg.png` (1254x1254, solid green field) by removing',
  'the background and producing sized variants, and it asserts that "the logo design itself',
  'has not been altered". That claim is the supplier\'s, recorded as supplied; what this',
  'ingest verifies independently is below.',
  '',
  '## Why the exports are not built from the pack\'s own square crop',
  '',
  `The pack ships \`${SQUARE_ALT}\`, a purpose-made square crop. The exports here are NOT`,
  'built from it. They are built from the pack\'s highest-resolution transparent file using',
  'the **same ink-centred square crop candidate f went through**, because JOB 2 compares f',
  'against g and a comparison in which one side keeps its supplier\'s crop and the other',
  'keeps ours is not a comparison of the artwork.',
  '',
  alt
    ? `The supplier crop is measured anyway, for the record: ${alt.W}x${alt.H}, ink bounding box ` +
      `${alt.bbox.w}x${alt.bbox.h} at (${alt.bbox.minX}, ${alt.bbox.minY}), margins L${alt.margins.L} ` +
      `R${alt.margins.R} T${alt.margins.T} B${alt.margins.B}, ` +
      `${alt.partial.toLocaleString()} partially transparent pixels. SHA-256 \`${alt.sha}\`.`
    : 'The supplier crop was not present in the delivery.',
  '',
  '## Measurements, taken the same way as candidate f',
  '',
  '| Measurement | Value |',
  '|---|---|',
  `| Distinct opaque colours | **${a.colours.length.toLocaleString()}** |`,
  `| Most used | ${colourList} |`,
  `| Alpha | ${a.opaque.toLocaleString()} opaque, **${a.partial.toLocaleString()} partial**, ${a.clear.toLocaleString()} clear |`,
  `| Ink bounding box | ${a.bbox.w}x${a.bbox.h} at (${a.bbox.minX}, ${a.bbox.minY}) |`,
  `| Margins | left ${a.margins.L}, right ${a.margins.R}, top ${a.margins.T}, bottom ${a.margins.B} |`,
  `| Centring skew | horizontal ${skewH >= 0 ? '+' : ''}${skewH} px, vertical ${skewV >= 0 ? '+' : ''}${skewV} px |`,
  `| Silhouette radius | mean ${a.silhouette.meanR}, min ${a.silhouette.minR}, max ${a.silhouette.maxR}, deviation **${lumpiness.toFixed(1)}%** |`,
  `| Master crop | ${crop.size}x${crop.size} at (${crop.x}, ${crop.y}) |`,
  '',
  '### What those numbers say, against candidate f',
  '',
  ...(a.partial === 0
    ? [
      '**The alpha is hard-edged, the same finding f carried.** Zero partially transparent',
      'pixels in the whole file: every pixel is either fully opaque or fully clear, so the',
      'source carries no antialiasing on its silhouette and the resample has to supply all of',
      'it. This was recorded against candidate f as a thing to watch, and it is equally true',
      'here. It is worth stating plainly because the pack\'s README describes these files as',
      'having had "background removed", and a hard alpha is the signature of exactly that: a',
      'key applied to a flat field rather than art drawn on transparency.',
    ]
    : [
      `**The alpha is soft.** ${a.partial.toLocaleString()} partially transparent pixels, where candidate f`,
      'has exactly zero, so this delivery carries its own antialiased silhouette rather than',
      'relying on the resample to supply one.',
    ]),
  '',
  `**The colour count is ${a.colours.length.toLocaleString()}, not three.** Candidate f uses exactly three flat`,
  'colours. This is continuous-tone artwork: gradients, glow falloff and antialiasing. That',
  'is not a defect, but it is the property that decides how the mark behaves when it is',
  'resampled small, which is what JOB 2 measures rather than argues about.',
  '',
  '## The pack, as delivered',
  '',
  `All ${packFiles.length} files, hashed at ingest and copied in whole to \`pack_g/\`:`,
  '',
  '| File | Bytes | SHA-256 |',
  '|---|---|---|',
  ...packFiles.map((f) => `| \`${f.name}\` | ${f.bytes.toLocaleString()} | \`${f.sha}\` |`),
  '',
  '## Exports built by this ingest',
  '',
  '| File | SHA-256 |',
  '|---|---|',
  ...written.map((w) => `| \`${w.name}\` | \`${sha(w.name)}\` |`),
  '',
  '## Adoption',
  '',
  '**Not decided by this ingest.** The provider-logo decision is derived in JOB 2 by',
  'measuring f against g at the sizes the platform actually renders, and it is recorded in',
  '`PROVIDER_LOGO_DERIVATION.md` beside this file. This document records what arrived and',
  'what it measures, nothing more.',
]
writeFileSync(join(BRAND, 'PROVENANCE_g.md'), lines.join('\n') + '\n')

console.log('')
for (const w of written) console.log(`  ${String(w.px).padStart(4)}  ${w.name}`)
console.log('\nCANDIDATE G INGESTED. Decision deferred to the JOB 2 derivation.')
