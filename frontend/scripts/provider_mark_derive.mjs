// provider_mark_derive.mjs - TR-031 provider-mark candidates. (2026-07-25)
//
// The provider logo is a one-time square upload in Team Settings Branding and is
// seen small. Review 1 called the current mark "nearly unreadable" at 48px, and
// the reason is structural rather than a matter of sharpening: the master carries
// arched WE ROLL / SPINNERS text around a detailed chrome wheel, and text at 48px
// is roughly two pixels per stroke. No amount of contrast rescues it.
//
// So the candidates differ in WHAT THEY KEEP, not just in how hard they are
// pushed. All three are deterministic canvas operations on the committed master,
// re-runnable to identical bytes, with no hand editing.
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'

const OUTA = '/Users/jt/math-sdk/design-system/brand/provider_mark'
const OUTP = '/Users/jt/math-sdk/reports/screens/provider-mark'
mkdirSync(OUTA, { recursive: true }); mkdirSync(OUTP, { recursive: true })

const b = await chromium.launch()
const p = await b.newPage()
await p.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })

const CANDIDATES = {
  // A: the master as-is, only rescaled. The control, so the comparison shows
  // what the derivations actually buy.
  'a-master': { crop: 1.0, contrast: 1.0, saturate: 1.0, brightness: 1.0 },
  // B: crop away the arched text ring and keep the wheel and reels, which are
  // the only elements that survive at 48px, then lift contrast.
  'b-core-crop': { crop: 0.68, contrast: 1.35, saturate: 1.25, brightness: 1.08 },
  // C: the same crop pushed harder, for a mark that must read against a light
  // or busy panel background.
  'c-core-bold': { crop: 0.62, contrast: 1.7, saturate: 1.45, brightness: 1.15 },
}

const results = {}
for (const [name, cfg] of Object.entries(CANDIDATES)) {
  const shots = await p.evaluate(async ({ name, cfg }) => {
    const img = new Image()
    img.src = '/brand-master.png'
    await img.decode()
    const out = {}
    for (const size of [512, 96, 48]) {
      const c = document.createElement('canvas'); c.width = size; c.height = size
      const x = c.getContext('2d')
      x.imageSmoothingQuality = 'high'
      x.filter = `contrast(${cfg.contrast}) saturate(${cfg.saturate}) brightness(${cfg.brightness})`
      const s = img.width * cfg.crop
      const o = (img.width - s) / 2
      x.drawImage(img, o, o, s, s, 0, 0, size, size)
      out[size] = c.toDataURL('image/png')
    }
    return out
  }, { name, cfg })
  for (const [size, url] of Object.entries(shots)) {
    writeFileSync(`${OUTA}/provider_mark_${name}_${size}.png`, Buffer.from(url.split(',')[1], 'base64'))
  }
  results[name] = { cfg, url48: shots[48] }
  console.log(`${name}: 512/96/48 written`)
}

// Side-by-side 48px legibility sheet, rendered at 8x so the comparison is
// viewable without the reviewer having to zoom a 48px file.
// Built from the data URLs already computed above rather than re-fetching files
// from the dev server, which needed them published first and failed to decode.
const sheet = await p.evaluate(async (items) => {
  const names = items.map((i) => i.name)
  const PAD = 40, CELL = 48 * 8, W = names.length * (CELL + PAD) + PAD, H = CELL + PAD * 3
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d')
  x.fillStyle = '#0a0a12'; x.fillRect(0, 0, W, H)
  x.imageSmoothingEnabled = false          // show the real 48px pixels, not a smoothed lie
  for (let i = 0; i < names.length; i++) {
    const img = new Image(); img.src = items[i].url; await img.decode()
    const dx = PAD + i * (CELL + PAD)
    x.drawImage(img, dx, PAD, CELL, CELL)
    x.fillStyle = '#8fd8ff'; x.font = '20px monospace'; x.textAlign = 'center'
    x.fillText(names[i], dx + CELL / 2, PAD + CELL + 28)
    // true size beside it, so the sheet never flatters the mark
    x.drawImage(img, dx + CELL / 2 - 24, PAD + CELL + 44, 48, 48)
  }
  return c.toDataURL('image/png')
}, Object.entries(results).map(([n, r]) => ({ name: n, url: r.url48 })))
writeFileSync(`${OUTP}/48px-legibility-comparison.png`, Buffer.from(sheet.split(',')[1], 'base64'))
console.log('legibility sheet written')

writeFileSync(`${OUTA}/PROVENANCE.md`,
`# Provider mark candidates, provenance (TR-031)\n\n` +
`- derived: 2026-07-25 by \`frontend/scripts/provider_mark_derive.mjs\`\n` +
`- source: \`design-system/brand/hero_emblem/master_1024.png\` (unmodified)\n` +
`- deterministic canvas operations only, no hand editing; re-running reproduces identical output\n\n` +
`## Candidates\n\n| Name | Centre crop | Contrast | Saturate | Brightness | Intent |\n|---|---|---|---|---|---|\n` +
`| a-master | 100% | 1.0 | 1.0 | 1.0 | control: the current mark, rescaled only |\n` +
`| b-core-crop | 68% | 1.35 | 1.25 | 1.08 | drops the arched text ring, keeps wheel and reels |\n` +
`| c-core-bold | 62% | 1.70 | 1.45 | 1.15 | same crop pushed harder for busy or light backgrounds |\n\n` +
`## Why cropping rather than sharpening\n\n` +
`The master carries arched WE ROLL / SPINNERS text around the wheel. At 48px that text is\n` +
`about two pixels per stroke, so it cannot resolve at any contrast. Candidates b and c drop\n` +
`it and keep the elements that survive. That is a design proposal, not a technical fix, and\n` +
`the eye-call is the owner's.\n\n## Not adopted\n\nNo candidate is adopted in this pass.\n`)
await b.close()
