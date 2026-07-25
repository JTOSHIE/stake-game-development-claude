// provider_mark_ingest_f.mjs - TR-031 (2026-07-26).
//
// Ingests the second owner-supplied mark, "Transparent We Roll Spinners
// icon.png", as candidate f, through the same measure-and-report pipeline
// candidate e used. It does not retouch anything.
//
// This one is materially different from e and the differences are all in its
// favour on the two things TR-031 has been stuck on:
//
//   it has a REAL ALPHA CHANNEL, so the platform's stated "transparent
//   background" requirement is met by the file itself rather than by a keying
//   step we performed on the owner's art;
//   it has NO WORDMARK, so the 0.81 px per stroke problem that dogged e and the
//   original master simply does not exist here.
//
// THE ONE THING THAT NEEDS CHECKING, and the reason this script renders context
// tiles as well as exports: the mark's structural colour is #0A0A14, a
// near-black, and it is OPAQUE rather than transparent. It draws the reel
// window frames and the gaps that separate the ring from the reels. On a light
// surface that structure reads. On a DARK surface, which is what a casino
// portal tile normally is, near-black structure on a dark background is
// near-invisible, and the mark can lose the lines that hold it together.
//
// That is a real risk and it is not decidable from a screenshot on white. So
// this script renders the mark at true size over light, mid and dark surfaces
// and lets the owner see it.
//
// Run (from frontend/): node scripts/provider_mark_ingest_f.mjs

import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const SOURCE = '/Users/jt/Desktop/Transparent We Roll Spinners icon.png'
const BRAND = '/Users/jt/math-sdk/design-system/brand/provider_mark'
const OUT = '/Users/jt/math-sdk/reports/screens/provider-mark'
mkdirSync(BRAND, { recursive: true })
mkdirSync(OUT, { recursive: true })

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

// ── Measure ─────────────────────────────────────────────────────────────────
const a = await page.evaluate(async (url) => {
  const img = new Image(); img.src = url; await img.decode()
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
  // Silhouette roundness, sampled every degree from the bbox centre.
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
}, dataUrl)

const skewH = a.margins.L - a.margins.R
const skewV = a.margins.T - a.margins.B
const lumpiness = ((a.silhouette.maxR - a.silhouette.minR) / a.silhouette.meanR) * 100

// Square, centred on the ink.
const inkCx = (a.bbox.minX + a.bbox.maxX) / 2, inkCy = (a.bbox.minY + a.bbox.maxY) / 2
const half = Math.floor(Math.min(inkCx, inkCy, a.W - inkCx, a.H - inkCy))
const crop = { x: Math.round(inkCx - half), y: Math.round(inkCy - half), size: half * 2 }

console.log(`source       ${a.W}x${a.H}, RGBA`)
console.log(`alpha        opaque ${a.opaque}, PARTIAL ${a.partial}, clear ${a.clear}`)
console.log(`colours      ${a.colours.map(([h, n]) => `${h} (${n})`).join('  ')}`)
console.log(`margins      L${a.margins.L} R${a.margins.R} T${a.margins.T} B${a.margins.B}` +
  `   skew h${skewH >= 0 ? '+' : ''}${skewH} v${skewV >= 0 ? '+' : ''}${skewV}`)
console.log(`silhouette   mean r ${a.silhouette.meanR}, min ${a.silhouette.minR}, max ${a.silhouette.maxR}` +
  `   deviation ${lumpiness.toFixed(1)}%`)
console.log(`master crop  ${crop.size}x${crop.size} at (${crop.x},${crop.y})`)

// ── Exports ─────────────────────────────────────────────────────────────────
const SIZES = [512, 96, 48]
const written = []
for (const px of SIZES) {
  const buf = await page.evaluate(async ({ url, cropRect, size }) => {
    const img = new Image(); img.src = url; await img.decode()
    const c = document.createElement('canvas'); c.width = size; c.height = size
    const x = c.getContext('2d')
    // Smoothing ON here, and it matters more than usual: the source alpha is
    // HARD EDGED with zero partial pixels, so a nearest-neighbour downscale to
    // 48 would produce a visibly jagged silhouette. The resample is what
    // supplies the antialiasing the source does not carry.
    x.imageSmoothingEnabled = true
    x.imageSmoothingQuality = 'high'
    x.drawImage(img, cropRect.x, cropRect.y, cropRect.size, cropRect.size, 0, 0, size, size)
    return c.toDataURL('image/png')
  }, { url: dataUrl, cropRect: crop, size: px })
  const name = `provider_mark_f-owner-transparent_${px}.png`
  writeFileSync(join(BRAND, name), Buffer.from(buf.split(',')[1], 'base64'))
  written.push({ name, px })
}

const masterBuf = await page.evaluate(async ({ url, cropRect }) => {
  const img = new Image(); img.src = url; await img.decode()
  const c = document.createElement('canvas'); c.width = cropRect.size; c.height = cropRect.size
  const x = c.getContext('2d')
  x.drawImage(img, cropRect.x, cropRect.y, cropRect.size, cropRect.size, 0, 0, cropRect.size, cropRect.size)
  return c.toDataURL('image/png')
}, { url: dataUrl, cropRect: crop })
const MASTER = `provider_mark_f-owner-transparent_master_${crop.size}.png`
writeFileSync(join(BRAND, MASTER), Buffer.from(masterBuf.split(',')[1], 'base64'))
written.unshift({ name: MASTER, px: crop.size })

// ── The context proof: does the dark structure survive a dark surface? ──────
//
// Rendered at TRUE size over three surfaces. No upscaling anywhere.
const SURFACES = [
  { name: 'light',  hex: '#f2f4f7' },
  { name: 'mid',    hex: '#6b7280' },
  { name: 'dark',   hex: '#12161f' },
  { name: 'portal', hex: '#0d0f14' },   // a typical casino tile surround
]
const CONTEXT_ROWS = [
  { key: 'f-owner-transparent', label: 'f  owner transparent  NEW' },
  { key: 'e-owner-supplied-transparent', label: 'e  transparent' },
  { key: 'e-owner-supplied', label: 'e  on its own field' },
  { key: 'd-purpose-drawn', label: 'd  purpose-drawn' },
]
const ctxItems = []
for (const row of CONTEXT_ROWS) {
  const sizes = {}
  let ok = true
  for (const px of [512, 96, 48]) {
    const f = join(BRAND, `provider_mark_${row.key}_${px}.png`)
    if (!existsSync(f)) { ok = false; break }
    sizes[px] = `data:image/png;base64,${readFileSync(f).toString('base64')}`
  }
  if (ok) ctxItems.push({ ...row, sizes })
}

const ctx = await page.evaluate(async ({ rows, surfaces }) => {
  const PAD = 30, LABEL_W = 250, CELL = 512, GAP = 26
  const SMALL = 96 + GAP + 48
  const COL_W = CELL + GAP + SMALL + GAP * 2
  const ROW_H = CELL + 62
  const W = LABEL_W + surfaces.length * COL_W + PAD
  const H = PAD + 40 + rows.length * ROW_H + PAD
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d')
  x.fillStyle = '#05060a'; x.fillRect(0, 0, W, H)
  x.imageSmoothingEnabled = false   // every mark is drawn 1:1, never resampled

  x.fillStyle = '#8fd8ff'; x.font = 'bold 20px monospace'; x.textAlign = 'left'
  for (let s = 0; s < surfaces.length; s++) {
    x.fillText(`${surfaces[s].name}  ${surfaces[s].hex}`, LABEL_W + s * COL_W, PAD + 22)
  }

  for (let r = 0; r < rows.length; r++) {
    const top = PAD + 40 + r * ROW_H
    x.fillStyle = rows[r].label.includes('NEW') ? '#ff6fff' : '#7f97a5'
    x.font = 'bold 18px monospace'; x.textAlign = 'left'
    x.fillText(rows[r].label, PAD, top + CELL / 2)

    for (let s = 0; s < surfaces.length; s++) {
      const cx0 = LABEL_W + s * COL_W
      x.fillStyle = surfaces[s].hex
      x.fillRect(cx0, top, CELL + GAP + SMALL + GAP, CELL)
      let dx = cx0 + GAP / 2
      for (const px of [512, 96, 48]) {
        const img = new Image(); img.src = rows[r].sizes[px]; await img.decode()
        x.drawImage(img, dx, top + (CELL - px) / 2, px, px)   // 1:1
        dx += px + GAP
      }
    }
  }
  return c.toDataURL('image/png')
}, { rows: ctxItems, surfaces: SURFACES })
writeFileSync(join(OUT, 'candidate-f-on-surfaces.png'), Buffer.from(ctx.split(',')[1], 'base64'))

await browser.close()

const sha = (n) => createHash('sha256').update(readFileSync(join(BRAND, n))).digest('hex')
const colourList = a.colours.map(([h, n]) => `\`${h}\` (${n.toLocaleString()} px)`).join(', ')

const lines = [
  '# Provider mark, candidate F: owner-supplied, transparent',
  '',
  '## Provenance',
  '',
  '| Field | Value |',
  '|---|---|',
  '| Origin | **Externally generated, commissioned by the owner** |',
  '| Supplied | 2026-07-26, by the owner, as the second of two |',
  '| Source file | `/Users/jt/Desktop/Transparent We Roll Spinners icon.png` |',
  `| Source SHA-256 | \`${srcSha}\` |`,
  `| Source dimensions | ${a.W}x${a.H}, 8-bit **RGBA** |`,
  '| Ingested by | `frontend/scripts/provider_mark_ingest_f.mjs` |',
  '',
  '## Measurements',
  '',
  '| Measurement | Value |',
  '|---|---|',
  `| Colours used | **exactly ${a.colours.length}**: ${colourList} |`,
  `| Alpha | ${a.opaque.toLocaleString()} opaque, **${a.partial} partial**, ${a.clear.toLocaleString()} clear |`,
  `| Ink bounding box | ${a.bbox.w}x${a.bbox.h} at (${a.bbox.minX}, ${a.bbox.minY}) |`,
  `| Margins | left ${a.margins.L}, right ${a.margins.R}, top ${a.margins.T}, bottom ${a.margins.B} |`,
  `| Centring skew | horizontal ${skewH >= 0 ? '+' : ''}${skewH} px, vertical ${skewV >= 0 ? '+' : ''}${skewV} px |`,
  `| Silhouette radius | mean ${a.silhouette.meanR}, min ${a.silhouette.minR}, max ${a.silhouette.maxR}, deviation **${lumpiness.toFixed(1)}%** |`,
  `| Master crop | ${crop.size}x${crop.size} at (${crop.x}, ${crop.y}) |`,
  '',
  '## What is better about this one than candidate e',
  '',
  'Both of TR-031\'s open questions close on this file, and neither closes by our doing',
  'anything to the art:',
  '',
  '1. **It has a real alpha channel.** The platform states the provider logo wants "a',
  '   transparent background" (`docs/stake-engine-live/game-tile-requirements.md:36`).',
  '   Candidate e had no alpha at all and we had to key its field out; here the',
  '   requirement is met by the supplied file itself.',
  '2. **There is no wordmark.** Candidate e\'s arched text measured 0.81 px per stroke at',
  '   48px, below one whole pixel. That problem does not exist here, because the element',
  '   that caused it is not present.',
  '',
  `**The colour discipline is exact.** Three colours and no more: \`#00FFFF\` and`,
  '`#FF00FF` are the brand emissives verbatim (`design-system/DESIGN_SYSTEM.md:14`), plus',
  '`#0A0A14` as a structural near-black.',
  '',
  '## Two things to look at before adopting',
  '',
  '### 1. The structural near-black on a dark surface',
  '',
  '`#0A0A14` is **opaque, not transparent**, and it draws the reel window frames and the',
  'gaps that separate the ring from the reel strip. On a light surface that structure reads',
  'clearly. On a dark surface, which is what a casino portal tile normally is, near-black',
  'structure sits at very low contrast against the background and the lines that hold the',
  'mark together can visually dissolve.',
  '',
  'This is not decidable from a preview on white, so it is rendered rather than argued:',
  '`reports/screens/provider-mark/candidate-f-on-surfaces.png` shows this mark and the',
  'other candidates at TRUE 512, 96 and 48 over light, mid, dark and a typical portal',
  'surface, drawn 1:1 with no resampling.',
  '',
  '### 2. The alpha channel is hard-edged',
  '',
  `**${a.partial} partially transparent pixels** in the whole file: every pixel is either`,
  'fully opaque or fully clear. The source carries no antialiasing on its silhouette. That',
  'is harmless at 1024 and it is why the exports above are downscaled with high-quality',
  'smoothing ON: the resample supplies the edge softening the source does not have. Worth',
  'knowing if the file is ever used at or near its native size, where the hard edge would',
  'show.',
  '',
  `The outer silhouette also deviates **${lumpiness.toFixed(1)}%** from a true circle`,
  `(radius ${a.silhouette.minR} to ${a.silhouette.maxR}), which is visible as slight`,
  'flattening beside the reel strip at 512 and is invisible at 48. Recorded, not corrected:',
  'correcting it would be redrawing the owner\'s art inside an ingest.',
  '',
  '## Files',
  '',
  '| File | SHA-256 |',
  '|---|---|',
  ...written.map((w) => `| \`${w.name}\` | \`${sha(w.name)}\` |`),
  '',
  '## Adoption',
  '',
  '**NOT adopted.** `design-system/brand/delivery/WeRollSpinners-Logo.png` is unchanged and',
  'still carries candidate d. The eye-call is the owner\'s.',
]
writeFileSync(join(BRAND, 'PROVENANCE_f.md'), lines.join('\n') + '\n')

console.log('')
for (const w of written) console.log(`  ${String(w.px).padStart(4)}  ${w.name}`)
console.log(`\ncontext sheet: ${join(OUT, 'candidate-f-on-surfaces.png')}`)
console.log('\nCANDIDATE F INGESTED. Not adopted; the eye-call is the owner\'s.')
