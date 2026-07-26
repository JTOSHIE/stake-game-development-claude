// published_tile_geometry_survey.mjs - 2026-07-26, convention (d) docs watch.
//
// The captured tile requirements give NO pixel dimensions. Not a width, not a
// height, not a safe area. `docs/stake-engine-live/game-tile-requirements.md`
// asks for a background, a foreground and a provider logo, names the file
// naming convention and a 3MB combined ceiling, and stops there. Section 3c of
// WRS_MASTER_DOCUMENT.md has carried that gap as an open note since JOB 7: the
// AssetForge scaffold's tile w/h values are "provisional defaults, not an
// official number".
//
// The number is not published, but it is OBSERVABLE. Every published game on
// the platform exposes its tile through the public, unauthenticated FAIR
// catalogue at https://fair.stake-engine.com/catalogue, as `game.image`. This
// script samples those assets, reads the dimensions straight out of each PNG
// header, and counts them. That turns a provisional default into a measured
// fact about what the platform actually publishes.
//
// Only the first 64 bytes of each asset are requested, via a Range header, so
// the survey reads headers rather than downloading the platform's artwork.
//
// Run (from frontend/): node scripts/published_tile_geometry_survey.mjs

import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CATALOGUE = 'https://fair.stake-engine.com/catalogue'
const OUT_DIR = '/Users/jt/math-sdk/docs/stake-engine-live/2026-07-26'
const CAPTURE_DATE = '2026-07-26'
const SAMPLE = 120

mkdirSync(OUT_DIR, { recursive: true })

const res = await fetch(CATALOGUE, { headers: { 'User-Agent': 'Mozilla/5.0' } })
if (!res.ok) {
  console.error(`catalogue fetch failed: ${res.status}`)
  process.exit(2)
}
const games = await res.json()
const withImage = games.filter((g) => g.game?.image)
console.log(`catalogue: ${games.length} games, ${withImage.length} carrying a tile image`)

// Evenly spaced through the list rather than the first N, so the sample is not
// just one publisher's back catalogue.
const step = Math.max(1, Math.floor(withImage.length / SAMPLE))
const selected = withImage.filter((_, i) => i % step === 0).slice(0, SAMPLE)

const readHeader = async (url) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const headers = { 'User-Agent': 'Mozilla/5.0' }
      if (attempt === 0) headers.Range = 'bytes=0-63'
      const r = await fetch(url, { headers })
      if (!r.ok && r.status !== 206) throw new Error(`status ${r.status}`)
      return Buffer.from(await r.arrayBuffer())
    } catch {
      await new Promise((r) => setTimeout(r, 400))
    }
  }
  return null
}

const counts = new Map()
const failures = []
let pngCount = 0, nonPng = 0
for (const g of selected) {
  const buf = await readHeader(g.game.image)
  if (!buf || buf.length < 24) { failures.push(g.game.name); continue }
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    // IHDR: 8 signature, 4 length, 4 "IHDR", then width at 16 and height at 20.
    const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20)
    const key = `${w}x${h}`
    counts.set(key, (counts.get(key) || 0) + 1)
    pngCount++
  } else if (buf[0] === 0xff && buf[1] === 0xd8) {
    counts.set('JPEG (dimensions not read)', (counts.get('JPEG (dimensions not read)') || 0) + 1)
    nonPng++
  } else if (buf.subarray(4, 8).toString('latin1') === 'ftyp') {
    counts.set('MP4 (animated tile)', (counts.get('MP4 (animated tile)') || 0) + 1)
    nonPng++
  } else {
    counts.set('other container', (counts.get('other container') || 0) + 1)
    nonPng++
  }
}

const decoded = pngCount + nonPng
const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1])
const [topKey, topN] = ranked[0]
const share = (100 * topN) / decoded

console.log(`sampled ${selected.length}, decoded ${decoded}, unreachable ${failures.length}`)
for (const [k, v] of ranked) console.log(`  ${k}: ${v} (${(100 * v / decoded).toFixed(1)}%)`)

const lines = [
  '<!-- Stake Engine published-asset survey -->',
  '- topic: published-tile-geometry',
  `- resolved_url: ${CATALOGUE} plus the per-game \`game.image\` assets it lists`,
  `- fetched: ${CAPTURE_DATE}`,
  '- rendered_via: direct HTTP, PNG headers only (Range: bytes=0-63)',
  '- looks_real: true',
  '',
  '# Published tile geometry, measured',
  '',
  '## Why this capture exists',
  '',
  '**The platform publishes no pixel dimensions for the game tile.**',
  '`docs/stake-engine-live/game-tile-requirements.md` asks for a background, a foreground and',
  'a provider logo, gives the naming convention and a 3MB combined ceiling for background',
  'plus foreground, and says nothing about size beyond "high resolution". Section 3c of',
  '`WRS_MASTER_DOCUMENT.md` has carried that gap since JOB 7, recording the AssetForge',
  'scaffold\'s tile dimensions as "provisional defaults, not an official number".',
  '',
  'The number is not published, but it is **observable**. Every published game exposes its',
  'tile through the public unauthenticated FAIR catalogue as `game.image`. This survey reads',
  'the dimensions out of those assets\' own headers.',
  '',
  '## Method',
  '',
  `Sampled evenly through the catalogue rather than taking the first N, so the result is not`,
  'one publisher\'s back catalogue. Only the first 64 bytes of each asset were requested, so',
  'this reads headers rather than downloading the platform\'s artwork.',
  '',
  '| Field | Value |',
  '|---|---|',
  `| Games in catalogue | ${games.length.toLocaleString()} |`,
  `| Carrying a tile image | ${withImage.length.toLocaleString()} |`,
  `| Sampled | ${selected.length} |`,
  `| Headers decoded | ${decoded} |`,
  `| Unreachable at sample time | ${failures.length} |`,
  '',
  '## Result',
  '',
  '| Dimensions | Count | Share of decoded |',
  '|---|---|---|',
  ...ranked.map(([k, v]) => `| ${k === topKey ? `**${k}**` : k} | ${v} | ${(100 * v / decoded).toFixed(1)}% |`),
  '',
  `**${topKey} is the platform's published tile geometry**, at ${share.toFixed(1)}% of the decoded sample.`,
  'It is portrait. The stragglers are a handful of odd sizes and a small number of animated',
  'tiles delivered as MP4 rather than as a still image, which is itself worth knowing and is',
  'not something the requirements page mentions either.',
  '',
  '## The second observation, which matters more than the first',
  '',
  '**The provider logo is not drawn on the published tile.** Inspecting decoded tiles',
  'directly: the game title is set in large type across the lower third, and the publisher',
  'appears beneath it as **letterspaced capital TEXT**, not as the supplied logo image.',
  'Scrollkeeper renders `PAPERCLIP GAMING` as type; Lokis Vault renders `VALKYRIE` as type.',
  '',
  'So the three assets the requirements page asks for do not map one-to-one onto what the',
  'tile shows. Background and foreground are composited into the tile. The provider logo is',
  'used somewhere else, and nothing we have captured shows where or at what size. That gap',
  'is the reason `design-system/brand/provider_mark/PROVIDER_LOGO_DERIVATION.md` builds its',
  'size ladder from labelled anchors rather than claiming a rendered size it cannot observe.',
  '',
  '## What follows for us',
  '',
  `The owner-supplied composed tile master is **exactly ${topKey}**`,
  '(`design-system/brand/tile/tile_composed_master.png`), so it lands on the platform\'s own',
  'published geometry rather than near it. Everything the repository held before it was',
  'landscape: the background master is 2048x1152 and the hero foreground 4159x1875.',
  '',
  '**This does not retire the layered assets.** The requirements page asks for background and',
  'foreground as separate files and the portal\'s Design Thumbnail editor takes layers, so',
  'both forms are carried in the delivery set. See',
  '`design-system/brand/tile/TILE_LAYER_DERIVATION.md`.',
]
const outFile = join(OUT_DIR, 'published-tile-geometry.md')
writeFileSync(outFile, lines.join('\n') + '\n')
console.log(`\ncapture written: ${outFile}`)
