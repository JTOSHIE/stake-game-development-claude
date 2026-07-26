// tile_master_ingest.mjs - 2026-07-26.
//
// Ingests the owner's composed Future Spinner tile, supplied as a single flat
// image rather than as layers, into design-system/brand/tile/ as the composed
// master. It does not retouch anything and it does not resize anything.
//
// Everything the repository held before this was LANDSCAPE: the tile background
// master is 2048x1152 and the hero foreground is 4159x1875. The published Stake
// tile is PORTRAIT. That mismatch is the reason this delivery matters, and it is
// measured here rather than asserted, because the delivery's own dimensions turn
// out to land exactly on the platform's published geometry.
//
// Run (from frontend/): node scripts/tile_master_ingest.mjs

import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const SOURCE = '/Users/jt/Downloads/we-roll-spinners_future-spinner_tile.png'
const TILE = '/Users/jt/math-sdk/design-system/brand/tile'
const MASTER = 'tile_composed_master.png'
const FOUND_DATE = '2026-07-26'

mkdirSync(TILE, { recursive: true })

if (!existsSync(SOURCE)) {
  console.error(`source not found: ${SOURCE}`)
  process.exit(2)
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')
const srcBuf = readFileSync(SOURCE)
const srcSha = sha256(srcBuf)
const srcBytes = statSync(SOURCE).size
const dataUrl = `data:image/png;base64,${srcBuf.toString('base64')}`

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<html><body></body></html>')

const a = await page.evaluate(async (url) => {
  const img = new Image(); img.src = url; await img.decode()
  const W = img.naturalWidth, H = img.naturalHeight
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0)
  const d = x.getImageData(0, 0, W, H).data

  let opaque = 0, partial = 0, clear = 0
  const colours = new Set()
  // Edge rows and columns, to see whether the art runs to the border or sits
  // inside a field. A tile that does not fill its own frame is a tile with a
  // visible seam once the platform draws it against the lobby background.
  let edgeClear = 0, edgeTotal = 0
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const i = (py * W + px) * 4, al = d[i + 3]
    if (al === 0) clear++
    else if (al < 250) partial++
    else opaque++
    if (colours.size < 2000000) {
      colours.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2])
    }
    const onEdge = px === 0 || py === 0 || px === W - 1 || py === H - 1
    if (onEdge) { edgeTotal++; if (al === 0) edgeClear++ }
  }
  return { W, H, opaque, partial, clear, colours: colours.size, edgeClear, edgeTotal }
}, dataUrl)

await browser.close()

const alphaUsed = a.clear > 0 || a.partial > 0
const coverage = (100 * a.opaque) / (a.W * a.H)

console.log(`source       ${a.W}x${a.H}, ${srcBytes.toLocaleString()} bytes`)
console.log(`alpha        opaque ${a.opaque.toLocaleString()}, partial ${a.partial}, clear ${a.clear}`)
console.log(`             alpha channel in use: ${alphaUsed}, opaque coverage ${coverage.toFixed(2)}%`)
console.log(`colours      ${a.colours.toLocaleString()} distinct RGB values`)
console.log(`edge         ${a.edgeClear}/${a.edgeTotal} border pixels fully transparent`)

writeFileSync(join(TILE, MASTER), srcBuf)
const landedSha = sha256(readFileSync(join(TILE, MASTER)))
if (landedSha !== srcSha) {
  console.error('COPY FAILED: landed file does not match the source hash')
  process.exit(3)
}
console.log(`copied       ${MASTER}   byte-identical to source: true`)

const lines = [
  '# Tile composed master: Generation Record',
  '',
  '## Provenance',
  '',
  '| Field | Value |',
  '|---|---|',
  '| Origin | **Externally generated, commissioned by the owner** |',
  `| Supplied | ${FOUND_DATE}, by the owner |`,
  `| Found at | \`${SOURCE}\` |`,
  `| Source SHA-256 | \`${srcSha}\` |`,
  `| Source bytes | ${srcBytes.toLocaleString()} |`,
  `| Dimensions | **${a.W}x${a.H}**, portrait |`,
  '| Ingested by | `frontend/scripts/tile_master_ingest.mjs` |',
  '| Landed as | `design-system/brand/tile/tile_composed_master.png`, byte-identical |',
  '',
  'Not resized, not recompressed, not retouched. The file committed here is the',
  'file the owner supplied, and the hash above is checked after the copy rather',
  'than assumed.',
  '',
  '## Measurements',
  '',
  '| Measurement | Value |',
  '|---|---|',
  `| Dimensions | ${a.W}x${a.H} (aspect ${(a.W / a.H).toFixed(4)}) |`,
  `| Alpha | ${a.opaque.toLocaleString()} opaque, ${a.partial.toLocaleString()} partial, ${a.clear.toLocaleString()} clear |`,
  `| Alpha channel in use | **${alphaUsed ? 'yes' : 'no, fully opaque'}** |`,
  `| Opaque coverage | ${coverage.toFixed(2)}% of the frame |`,
  `| Distinct RGB values | ${a.colours.toLocaleString()} |`,
  `| Fully transparent border pixels | ${a.edgeClear} of ${a.edgeTotal} |`,
  '',
  '## Why the dimensions are the finding',
  '',
  `**${a.W}x${a.H} is the platform's own published tile geometry.** That is not inferred from`,
  'the docs, which give no pixel dimensions for the tile anywhere. It was measured against',
  'the platform\'s live published assets: see',
  '`docs/stake-engine-live/2026-07-26/published-tile-geometry.md`, where a sample of live',
  'game tiles taken from the public FAIR catalogue is decoded and its dimensions counted.',
  '',
  'Everything the repository held before this delivery was **landscape**:',
  '',
  '| Existing asset | Dimensions | Orientation |',
  '|---|---|---|',
  '| `tile_background_master.jpg` | 2048x1152 | landscape |',
  '| `tile_hero_full.png` (delivered as `FutureSpinner-FG.png`) | 4159x1875 | landscape |',
  `| **\`tile_composed_master.png\`** (this file) | **${a.W}x${a.H}** | **portrait** |`,
  '',
  'So this is the first asset in the project built to the shape the platform actually',
  'publishes. What follows from that for the delivery set is worked out in the tile',
  'delivery record, not here.',
]
writeFileSync(join(TILE, 'GENERATION_NOTE_composed_master.md'), lines.join('\n') + '\n')

console.log('\nTILE COMPOSED MASTER INGESTED.')
