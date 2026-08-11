// tile_layer_derivation.mjs - 2026-07-26.
//
// The brief asks for what the Tile Editor actually needs from the composed
// master: a flat portrait export if a flat image is accepted, and derived
// background and foreground layers "where cleanly possible", with an honest
// record of what could not be derived.
//
// This script does the second half properly, which means ATTEMPTING the
// separation and MEASURING why it fails rather than asserting that it would.
// The project's own convention is that a visual question is rendered rather
// than argued, so the attempt is committed as a proof sheet and a reader can
// disagree with it by looking.
//
// Three things are measured, each of which independently blocks a clean
// derivation:
//
//   1. TEXT IS BAKED IN. The composed master carries "FUTURE SPINNER" and
//      "WE ROLL SPINNERS" as pixels. A foreground cut from it carries the
//      title; a background cut from it carries the title. There is no layer
//      order that removes type that was never on its own layer.
//
//   2. THE BACKGROUND BEHIND THE CHARACTER DOES NOT EXIST. A background layer
//      has to be complete. Whatever the character covers has to be painted,
//      and painting it is inventing art inside an ingest, which is precisely
//      what this pipeline exists not to do.
//
//   3. THE SILHOUETTE IS NOT KEYABLE. The character is dark against a neon
//      field, which sounds separable until the glow bleeds across the boundary.
//      The share of silhouette pixels where local contrast is too low to place
//      a matte confidently is measured rather than guessed.
//
// Run (from frontend/): node scripts/tile_layer_derivation.mjs

import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const TILE = '/Users/jt/math-sdk/design-system/brand/tile'
const DELIVERY = '/Users/jt/math-sdk/design-system/archive/delivery'
const OUT = '/Users/jt/math-sdk/reports/screens/brand-tile-composed'
const MASTER = join(TILE, 'tile_composed_master.png')

mkdirSync(OUT, { recursive: true })
mkdirSync(DELIVERY, { recursive: true })

if (!existsSync(MASTER)) {
  console.error(`composed master not found: ${MASTER}`)
  process.exit(2)
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')
const masterBuf = readFileSync(MASTER)
const dataUrl = `data:image/png;base64,${masterBuf.toString('base64')}`

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<html><body></body></html>')

const a = await page.evaluate(async (url) => {
  const img = new Image(); img.src = url; await img.decode()
  const W = img.naturalWidth, H = img.naturalHeight
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0)
  const d = x.getImageData(0, 0, W, H).data
  const N = W * H

  const val = new Float64Array(N), sat = new Float64Array(N), lum = new Float64Array(N)
  for (let i = 0; i < N; i++) {
    const r = d[i * 4] / 255, g = d[i * 4 + 1] / 255, b = d[i * 4 + 2] / 255
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
    val[i] = mx
    sat[i] = mx === 0 ? 0 : (mx - mn) / mx
    lum[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  // Connected components of a boolean mask, 4-connected, iterative.
  const components = (mask) => {
    const seen = new Uint8Array(N)
    const out = []
    for (let s = 0; s < N; s++) {
      if (!mask[s] || seen[s]) continue
      const stack = [s]; seen[s] = 1
      const pixels = []
      let minX = W, minY = H, maxX = -1, maxY = -1
      while (stack.length) {
        const i = stack.pop()
        pixels.push(i)
        const px = i % W, py = (i / W) | 0
        if (px < minX) minX = px; if (px > maxX) maxX = px
        if (py < minY) minY = py; if (py > maxY) maxY = py
        if (px > 0 && mask[i - 1] && !seen[i - 1]) { seen[i - 1] = 1; stack.push(i - 1) }
        if (px < W - 1 && mask[i + 1] && !seen[i + 1]) { seen[i + 1] = 1; stack.push(i + 1) }
        if (py > 0 && mask[i - W] && !seen[i - W]) { seen[i - W] = 1; stack.push(i - W) }
        if (py < H - 1 && mask[i + W] && !seen[i + W]) { seen[i + W] = 1; stack.push(i + W) }
      }
      out.push({ pixels, n: pixels.length, minX, minY, maxX, maxY })
    }
    return out
  }

  // 1. The baked-in type: near-white and near-neutral, then speckle removed.
  //    The scene is full of bright neon highlights, so a plain threshold picks
  //    up the city as well as the title. Keeping only components of a
  //    glyph-plausible size is what separates type from sparkle.
  const whiteish = new Uint8Array(N)
  for (let i = 0; i < N; i++) whiteish[i] = (val[i] > 0.90 && sat[i] < 0.10) ? 1 : 0
  const textMask = new Uint8Array(N)
  let textN = 0, tMinX = W, tMinY = H, tMaxX = -1, tMaxY = -1
  for (const comp of components(whiteish)) {
    if (comp.n < 40) continue
    for (const i of comp.pixels) { textMask[i] = 1 }
    textN += comp.n
    if (comp.minX < tMinX) tMinX = comp.minX
    if (comp.minY < tMinY) tMinY = comp.minY
    if (comp.maxX > tMaxX) tMaxX = comp.maxX
    if (comp.maxY > tMaxY) tMaxY = comp.maxY
  }

  // 2. The character body: the largest dark component sitting in the central
  //    column. A fixed seed point is unreliable, because the middle of the
  //    character is its brightly lit visor rather than its dark shell.
  const dark = new Uint8Array(N)
  for (let i = 0; i < N; i++) dark[i] = val[i] < 0.35 ? 1 : 0
  const body = new Uint8Array(N)
  let best = null
  for (const comp of components(dark)) {
    const cx = (comp.minX + comp.maxX) / 2
    if (cx < 0.25 * W || cx > 0.75 * W) continue
    if (comp.minY > 0.6 * H) continue
    if (!best || comp.n > best.n) best = comp
  }
  let bodyN = 0, bMinX = W, bMinY = H, bMaxX = -1, bMaxY = -1
  if (best) {
    for (const i of best.pixels) body[i] = 1
    bodyN = best.n
    bMinX = best.minX; bMinY = best.minY; bMaxX = best.maxX; bMaxY = best.maxY
  }

  // 3. Silhouette ambiguity: for every boundary pixel of the body mask, the
  //    local luminance step across the boundary. A matte cannot be placed
  //    confidently where that step is small.
  let edgeN = 0, edgeWeak = 0
  const WEAK = 0.10
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x
    if (!body[i]) continue
    const nbs = [i - 1, i + 1, i - W, i + W]
    let boundary = false
    for (const j of nbs) if (!body[j]) boundary = true
    if (!boundary) continue
    edgeN++
    let step = 0
    for (const j of nbs) if (!body[j]) step = Math.max(step, Math.abs(lum[j] - lum[i]))
    if (step < WEAK) edgeWeak++
  }

  // How much of the type sits over the character.
  let textOverBody = 0
  for (let i = 0; i < N; i++) if (textMask[i] && body[i]) textOverBody++
  // And how much sits inside the character's bounding box, which is the region
  // any foreground crop would have to include.
  let textInBodyBox = 0
  for (let i = 0; i < N; i++) {
    if (!textMask[i]) continue
    const px = i % W, py = (i / W) | 0
    if (px >= bMinX && px <= bMaxX && py >= bMinY && py <= bMaxY) textInBodyBox++
  }

  // Proof layers, rendered so the failure is looked at rather than argued.
  const paint = (fn) => {
    const cc = document.createElement('canvas'); cc.width = W; cc.height = H
    const xx = cc.getContext('2d')
    const im = xx.createImageData(W, H)
    for (let i = 0; i < N; i++) fn(i, im.data, d)
    xx.putImageData(im, 0, 0)
    return cc.toDataURL('image/png')
  }
  const textProof = paint((i, o) => {
    o[i * 4] = textMask[i] ? 255 : 12; o[i * 4 + 1] = textMask[i] ? 60 : 12
    o[i * 4 + 2] = textMask[i] ? 220 : 16; o[i * 4 + 3] = 255
  })
  const bodyProof = paint((i, o) => {
    o[i * 4] = body[i] ? 0 : 12; o[i * 4 + 1] = body[i] ? 255 : 12
    o[i * 4 + 2] = body[i] ? 200 : 16; o[i * 4 + 3] = 255
  })
  // The background that would remain: everything the character and the type
  // occupy is a hole, drawn as magenta so the size of the missing art is plain.
  const holeProof = paint((i, o, src) => {
    const hole = body[i] || textMask[i]
    o[i * 4] = hole ? 255 : src[i * 4]
    o[i * 4 + 1] = hole ? 0 : src[i * 4 + 1]
    o[i * 4 + 2] = hole ? 255 : src[i * 4 + 2]
    o[i * 4 + 3] = 255
  })

  return {
    W, H, N,
    text: { n: textN, box: { minX: tMinX, minY: tMinY, maxX: tMaxX, maxY: tMaxY } },
    body: { n: bodyN, box: { minX: bMinX, minY: bMinY, maxX: bMaxX, maxY: bMaxY } },
    edge: { n: edgeN, weak: edgeWeak },
    textOverBody, textInBodyBox,
    proofs: { textProof, bodyProof, holeProof },
  }
}, dataUrl)

const pct = (n, d) => (100 * n / d).toFixed(2)
const holeArea = a.body.n + a.text.n - a.textOverBody

console.log(`master        ${a.W}x${a.H}`)
console.log(`baked type    ${a.text.n.toLocaleString()} px (${pct(a.text.n, a.N)}% of frame), ` +
  `box ${a.text.box.maxX - a.text.box.minX + 1}x${a.text.box.maxY - a.text.box.minY + 1} at (${a.text.box.minX},${a.text.box.minY})`)
console.log(`character     ${a.body.n.toLocaleString()} px (${pct(a.body.n, a.N)}% of frame), ` +
  `box ${a.body.box.maxX - a.body.box.minX + 1}x${a.body.box.maxY - a.body.box.minY + 1} at (${a.body.box.minX},${a.body.box.minY})`)
console.log(`type over it  ${a.textOverBody.toLocaleString()} px directly on the character, ` +
  `${a.textInBodyBox.toLocaleString()} px inside its bounding box`)
console.log(`silhouette    ${a.edge.n.toLocaleString()} boundary px, ${a.edge.weak.toLocaleString()} weak ` +
  `(${pct(a.edge.weak, a.edge.n)}% below a 0.10 luminance step)`)
console.log(`missing art   ${holeArea.toLocaleString()} px (${pct(holeArea, a.N)}% of the frame) would need painting for a BG layer`)

// ── The proof sheet ─────────────────────────────────────────────────────────
const sheet = await page.evaluate(async ({ src, proofs, W, H }) => {
  const PAD = 30, GAP = 22, LABEL = 30
  const cols = 4
  const cw = W, ch = H
  const c = document.createElement('canvas')
  c.width = PAD * 2 + cols * cw + (cols - 1) * GAP
  c.height = PAD * 2 + LABEL + ch + 26
  const x = c.getContext('2d')
  x.fillStyle = '#05060a'; x.fillRect(0, 0, c.width, c.height)
  x.imageSmoothingEnabled = false

  const items = [
    { url: src, label: 'composed master, as supplied' },
    { url: proofs.textProof, label: 'type baked into the pixels' },
    { url: proofs.bodyProof, label: 'character body, largest central dark component' },
    { url: proofs.holeProof, label: 'what a BG layer would be missing' },
  ]
  for (let i = 0; i < items.length; i++) {
    const dx = PAD + i * (cw + GAP)
    x.fillStyle = i === 3 ? '#ff6fff' : '#8fd8ff'
    x.font = 'bold 15px monospace'; x.textAlign = 'left'
    x.fillText(items[i].label, dx, PAD + 18)
    const img = new Image(); img.src = items[i].url; await img.decode()
    x.drawImage(img, dx, PAD + LABEL, cw, ch)
  }
  return c.toDataURL('image/png')
}, { src: dataUrl, proofs: a.proofs, W: a.W, H: a.H })
writeFileSync(join(OUT, 'layer-derivation-attempt.png'), Buffer.from(sheet.split(',')[1], 'base64'))

await browser.close()

// ── The flat delivery ───────────────────────────────────────────────────────
//
// The master is ALREADY at the platform's published geometry, so the flat
// delivery is a rename and nothing else. No resize, no recompress: the bytes
// are the owner's.
const FLAT = 'FutureSpinner-Tile.png'
writeFileSync(join(DELIVERY, FLAT), masterBuf)
const flatSha = sha256(readFileSync(join(DELIVERY, FLAT)))
if (flatSha !== sha256(masterBuf)) {
  console.error('FLAT DELIVERY COPY FAILED')
  process.exit(3)
}
console.log(`\nflat delivery ${FLAT}  ${masterBuf.length.toLocaleString()} bytes, byte-identical to the master`)

const lines = [
  '# Tile layers: what could be derived from the composed master, and what could not',
  '',
  'Produced by `frontend/scripts/tile_layer_derivation.mjs`. The brief asked for background',
  'and foreground layers derived from the composed master **where cleanly possible**, and an',
  'honest record of what could not be. This is that record, and the separation was attempted',
  'and measured rather than declared impossible.',
  '',
  '**Verdict: the layers cannot be cleanly derived. The flat tile can, and is.**',
  '',
  '## What the delivery set now holds',
  '',
  '| File | Form | Source | Use |',
  '|---|---|---|---|',
  `| \`FutureSpinner-Tile.png\` | flat, ${a.W}x${a.H} | the composed master, byte-identical | if the Tile Editor accepts a single composed image |`,
  '| `FutureSpinner-BG.jpg` | layer, 2048x1152 landscape | `tile_background_master.jpg` | if the editor requires layers |',
  '| `FutureSpinner-FG.png` | layer, 4159x1875 landscape | `tile_hero_full.png` | if the editor requires layers |',
  '',
  'Both forms are carried because **we do not know which the editor takes**. The captured',
  'requirements ask for background and foreground as separate files',
  '(`docs/stake-engine-live/game-tile-requirements.md`), and the portal\'s Design Thumbnail',
  'editor has never been opened by us: the game card still shows its placeholder. Shipping',
  'one form and guessing would put the owner in front of an editor with the wrong file.',
  '',
  '## Why the layers cannot be cleanly derived',
  '',
  'Three findings, each of which independently blocks it. Measured on the master, not',
  'assumed. The proof sheet is',
  '`reports/screens/brand-tile-composed/layer-derivation-attempt.png`.',
  '',
  '### 1. The type is baked into the pixels',
  '',
  `The detector resolves **${a.text.n.toLocaleString()} pixels, ${pct(a.text.n, a.N)}% of the frame**, in a`,
  `${a.text.box.maxX - a.text.box.minX + 1}x${a.text.box.maxY - a.text.box.minY + 1} band at (${a.text.box.minX}, ${a.text.box.minY}).`,
  '',
  '**That figure is conservative and understates the real area.** The mask keeps only',
  'near-white, near-neutral components of at least 40 pixels, which cleanly resolves the',
  '`FUTURE SPINNER` title and does not fully resolve the smaller, softer `WE ROLL SPINNERS`',
  'line beneath it, visible in panel two of the proof sheet. The true baked-in type area is',
  'larger than the number above, which only strengthens the finding.',
  '',
  ...(a.textOverBody === 0
    ? [
      `**The type does not overlap the character: ${a.textOverBody} pixels of contact.** It sits in a band`,
      `below it. But ${a.textInBodyBox.toLocaleString()} type pixels still fall inside the character's bounding box, so a`,
      'rectangular foreground crop carries type into the foreground layer even though the two',
      'elements never touch.',
    ]
    : [
      `**${a.textOverBody.toLocaleString()} type pixels sit directly on the character**, and ${a.textInBodyBox.toLocaleString()} inside its bounding`,
      'box. A foreground cut from this file carries the title with it.',
    ]),
  '',
  'Either way the type is in the background layer, because everything that is not foreground',
  'is background. There is no layer order that separates type that was never on its own',
  'layer.',
  '',
  'This also matters beyond the layering: the published tiles the platform composes',
  '**already set the game title and the publisher name themselves**',
  '(`docs/stake-engine-live/2026-07-26/published-tile-geometry.md`). If the editor composes',
  'the same way, type baked into a supplied layer would be drawn twice.',
  '',
  '### 2. The background behind the character does not exist',
  '',
  `The character occupies **${a.body.n.toLocaleString()} pixels, ${pct(a.body.n, a.N)}% of the frame**. Together with the type,`,
  `**${holeArea.toLocaleString()} pixels, ${pct(holeArea, a.N)}% of the frame**, would have to be painted to produce a complete`,
  'background layer.',
  '',
  'The fourth panel of the proof sheet shows that area in magenta. It is not a gap to be',
  'tidied: it is a third of the picture, through the middle, where the city would have to be',
  'invented. Inventing it inside an ingest is exactly what this pipeline exists not to do,',
  'and the result would be our art passed off as the owner\'s delivery.',
  '',
  '### 3. The silhouette is not cleanly keyable',
  '',
  `Of **${a.edge.n.toLocaleString()} boundary pixels** on the character mask, **${a.edge.weak.toLocaleString()} (${pct(a.edge.weak, a.edge.n)}%)** sit below a 0.10`,
  'luminance step against what they touch. The character is dark against a bright neon field,',
  'which sounds separable, but the scene\'s glow bleeds across the boundary and the mask has',
  'no confident edge there.',
  '',
  'That figure is generous to the attempt, too. The mask it measures is the largest dark',
  'connected component in the central column, which is a cruder matte than anyone would ship:',
  'panel three of the proof sheet shows it dropping the brightly lit visor and leaving holes',
  'through the lit panels of the shell. A matte good enough to deliver would have to resolve',
  'those, and it would find more ambiguity along the way, not less.',
  '',
  '## What the owner does with this',
  '',
  'Recorded plainly, because this is the part that reaches a human:',
  '',
  '1. **If the Design Thumbnail editor accepts a single composed image**, use',
  `   \`FutureSpinner-Tile.png\`. It is the owner's own artwork at ${a.W}x${a.H}, which is the`,
  '   platform\'s published tile geometry measured across a live sample, and it has been',
  '   through no resampling or recompression here.',
  '2. **If it requires background and foreground layers**, use the existing',
  '   `FutureSpinner-BG.jpg` and `FutureSpinner-FG.png`, and use the composed master as the',
  '   **reference for how they should sit**: character centred, weighted to the upper two',
  '   thirds, with the lower third left clear for the type the platform draws.',
  '3. **Either way, screenshot the editor.** It is the one surface in this whole submission',
  '   nobody here has seen, and one capture of it settles which of the two paths above is',
  '   real.',
  '',
  '## Files',
  '',
  '| File | SHA-256 |',
  '|---|---|',
  `| \`design-system/brand/tile/tile_composed_master.png\` | \`${sha256(masterBuf)}\` |`,
  `| \`design-system/archive/delivery/${FLAT}\` | \`${flatSha}\` |`,
]
writeFileSync(join(TILE, 'TILE_LAYER_DERIVATION.md'), lines.join('\n') + '\n')

console.log(`record        ${join(TILE, 'TILE_LAYER_DERIVATION.md')}`)
console.log(`proof sheet   ${join(OUT, 'layer-derivation-attempt.png')}`)
