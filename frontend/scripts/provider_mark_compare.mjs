// provider_mark_compare.mjs - TR-031, R2R-R JOB D (2026-07-26).
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

const CANDIDATES = [
  { key: 'a-master',        label: 'a  master (control)' },
  { key: 'b-core-crop',     label: 'b  core crop' },
  { key: 'c-core-bold',     label: 'c  core bold' },
  { key: 'd-purpose-drawn', label: 'd  purpose-drawn  NEW' },
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
    x.fillStyle = list[i].label.includes('NEW') ? '#ff6fff' : '#8fd8ff'
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

console.log(`four-way sheet written: ${join(OUT, '48px-legibility-comparison.png')}`)
for (const i of items) console.log(`  ${i.label}`)
console.log('\nNo adoption here. The eye-call is the owner\'s.')
