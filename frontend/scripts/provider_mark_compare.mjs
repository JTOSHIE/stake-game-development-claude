// provider_mark_compare.mjs - TR-031, R2R-R JOB D then FS_MARK_INGEST JOB 2
// (2026-07-26).
//
// Refreshes the 48px legibility sheet to a FOUR-way comparison, adding the
// purpose-drawn candidate D beside the master (a) and the two derivations
// (b, c), for the owner's eye-call.
//
// SEPARATED FROM provider_mark_derive.mjs on purpose. That script derives a, b
// and c from the committed master and needs a running dev server to do it; this
// one only reads the committed 48px PNGs off disk, so refreshing the comparison
// after a new candidate lands does not require re-deriving the old ones, and
// cannot accidentally change them.
//
// The sheet shows each mark at 8x for a reviewer to look at AND at its true 48px
// beside it, with image smoothing off, so it never flatters a mark by showing a
// resampled version of it. That was the previous sheet's rule and it is kept.
//
// Run (from frontend/): node scripts/provider_mark_compare.mjs

import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const BRAND = '/Users/jt/math-sdk/design-system/brand/provider_mark'
const OUT = '/Users/jt/math-sdk/reports/screens/provider-mark'

// a, b and c are RETIRED as non-preferred (convention (h)) and stay in the sheet
// anyway. A comparison that quietly drops the options it has moved past stops
// being a comparison: the owner should be able to see what "better" is better
// than, and a future reader should be able to check that the retirement was
// earned rather than asserted.
const CANDIDATES = [
  { key: 'a-master',                  label: 'a  master  RETIRED', retired: true },
  { key: 'b-core-crop',               label: 'b  core crop  RETIRED', retired: true },
  { key: 'c-core-bold',               label: 'c  core bold  RETIRED', retired: true },
  { key: 'd-purpose-drawn',           label: 'd  purpose-drawn' },
  { key: 'e-owner-supplied',          label: 'e  owner-supplied  NEW', highlight: true },
  { key: 'e-owner-supplied-transparent', label: 'e  transparent  NEW', highlight: true },
]

const items = []
for (const c of CANDIDATES) {
  const file = join(BRAND, `provider_mark_${c.key}_48.png`)
  if (!existsSync(file)) {
    console.error(`missing 48px export for ${c.key}: ${file}`)
    process.exit(1)
  }
  items.push({ ...c, url: `data:image/png;base64,${readFileSync(file).toString('base64')}` })
}

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<html><body></body></html>')

const sheet = await page.evaluate(async (list) => {
  const PAD = 40, CELL = 48 * 8
  const W = list.length * (CELL + PAD) + PAD
  const H = CELL + PAD * 3 + 20
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d')
  x.fillStyle = '#0a0a12'; x.fillRect(0, 0, W, H)
  // Never smooth: the reviewer must see the real 48px pixels, not a resampled
  // version that reads better than the file the platform will actually show.
  x.imageSmoothingEnabled = false
  for (let i = 0; i < list.length; i++) {
    const img = new Image(); img.src = list[i].url; await img.decode()
    const dx = PAD + i * (CELL + PAD)
    x.drawImage(img, dx, PAD, CELL, CELL)
    x.fillStyle = list[i].highlight ? '#ff6fff' : list[i].retired ? '#4a5f6c' : '#8fd8ff'
    x.font = '20px monospace'; x.textAlign = 'center'
    x.fillText(list[i].label, dx + CELL / 2, PAD + CELL + 28)
    // True size beside it, so the sheet never flatters the mark.
    x.drawImage(img, dx + CELL / 2 - 24, PAD + CELL + 44, 48, 48)
    x.fillStyle = '#5f7f92'; x.font = '13px monospace'
    x.fillText('actual 48px', dx + CELL / 2, PAD + CELL + 112)
  }
  return c.toDataURL('image/png')
}, items)

writeFileSync(join(OUT, '48px-legibility-comparison.png'), Buffer.from(sheet.split(',')[1], 'base64'))
await browser.close()

console.log(`comparison sheet written: ${join(OUT, '48px-legibility-comparison.png')}`)
for (const i of items) console.log(`  ${i.label}`)

// ── TRUE-SIZE STRIP ─────────────────────────────────────────────────────────
//
// The sheet above blows each mark up 8x so a reviewer can see what is
// happening. This strip does the opposite and is the one that decides the
// question: candidate e at ACTUAL 48, 96 and 512, no upscaling, no smoothing,
// laid out at the sizes the platform will really show. A mark is chosen on real
// pixels or it is chosen on a flattering render.
const STRIP = [
  { key: 'e-owner-supplied', label: 'e  on its field' },
  { key: 'e-owner-supplied-transparent', label: 'e  transparent' },
]
const stripItems = []
for (const row of STRIP) {
  const sizes = {}
  for (const px of [512, 96, 48]) {
    const f = join(BRAND, `provider_mark_${row.key}_${px}.png`)
    if (!existsSync(f)) { console.error(`missing ${f}`); process.exit(1) }
    sizes[px] = `data:image/png;base64,${readFileSync(f).toString('base64')}`
  }
  stripItems.push({ ...row, sizes })
}

const browser2 = await chromium.launch()
const page2 = await browser2.newPage()
await page2.setContent('<html><body></body></html>')
const strip = await page2.evaluate(async (rows) => {
  const PAD = 34, GAP = 46, ROW_H = 512 + 74
  const W = PAD * 2 + 512 + GAP + 96 + GAP + 48 + 120
  const H = PAD + rows.length * ROW_H + PAD
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d')
  x.fillStyle = '#0a0a12'; x.fillRect(0, 0, W, H)
  // NO smoothing and NO scaling anywhere below: every mark is drawn at its own
  // exported pixel size, which is the entire point of this strip.
  x.imageSmoothingEnabled = false
  for (let r = 0; r < rows.length; r++) {
    const top = PAD + r * ROW_H
    x.fillStyle = rows[r].label.includes('transparent') ? '#8fd8ff' : '#ff6fff'
    x.font = 'bold 22px monospace'; x.textAlign = 'left'
    x.fillText(rows[r].label, PAD, top + 22)
    let dx = PAD
    for (const px of [512, 96, 48]) {
      const img = new Image(); img.src = rows[r].sizes[px]; await img.decode()
      const dy = top + 44 + (512 - px) / 2
      x.drawImage(img, dx, dy, px, px)   // 1:1, no resample
      x.fillStyle = '#5f7f92'; x.font = '15px monospace'; x.textAlign = 'center'
      x.fillText(`${px}px actual`, dx + px / 2, top + 44 + 512 + 22)
      dx += px + GAP
    }
  }
  return c.toDataURL('image/png')
}, stripItems)
writeFileSync(join(OUT, 'candidate-e-true-size.png'), Buffer.from(strip.split(',')[1], 'base64'))
await browser2.close()
console.log(`true-size strip written: ${join(OUT, 'candidate-e-true-size.png')}`)

console.log('\nNo adoption here. The eye-call is the owner\'s.')
