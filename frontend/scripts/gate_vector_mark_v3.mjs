// gate_vector_mark_v3.mjs — structural gates for VECTOR MARK V3.
//
// Same three gates as v2 (paths-only, margin symmetry, minimum stroke at
// 192) but rendered through headless Chromium rather than cairosvg:
// cairosvg does not correctly render feGaussianBlur (confirmed - a
// stdDeviation=3 blur falls off within ~2px instead of a real gaussian
// spread), and v3's construction depends on real SVG filters for its
// spoke/window/wordmark glows, so a cairosvg-based margin/stroke
// measurement would be measuring a broken render, not the real one.
// Pixel measurement happens in-page via a <canvas> (drawImage +
// getImageData), the same technique portrait_layout_conformance.mjs
// already uses elsewhere - no new PNG-parsing dependency needed.
//
// Run (from frontend/): node scripts/gate_vector_mark_v3.mjs

import { chromium } from 'playwright'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MARK_DIR = join(__dirname, '..', '..', 'design-system', 'brand', 'vector_mark')
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'brand-vector-mark-v3')
mkdirSync(OUT_DIR, { recursive: true })

const FORBIDDEN_TAGS = ['text', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline', 'image', 'tspan']

function gatePathsOnly(svgText) {
  const found = []
  for (const tag of FORBIDDEN_TAGS) {
    const re = new RegExp(`<${tag}[\\s/>]`, 'gi')
    if (re.test(svgText)) found.push(tag)
  }
  return { pass: found.length === 0, found }
}

async function renderToPage(page, svgText, size) {
  const html = `<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:transparent}
    svg{display:block;width:${size}px;height:${size}px}
  </style></head><body>${svgText}</body></html>`
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(html)
  await page.waitForTimeout(200)
}

/** Draws the current page's <svg> onto an in-page canvas via a data-URL
 *  round trip (serialise -> Image -> canvas), then measures margins and
 *  the thickest contiguous magenta run entirely inside the browser. */
async function measureViaCanvas(page, size) {
  return page.evaluate(async (sz) => {
    const svgEl = document.querySelector('svg')
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svgEl)
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = sz
    canvas.height = sz
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, sz, sz)
    const { data } = ctx.getImageData(0, 0, sz, sz)
    URL.revokeObjectURL(url)

    const alphaAt = (x, y) => data[(sz * y + x) * 4 + 3]
    function scan(dir) {
      if (dir === 'left') for (let x = 0; x < sz; x++) { for (let y = 0; y < sz; y++) if (alphaAt(x, y) > 8) return x }
      if (dir === 'right') for (let x = sz - 1; x >= 0; x--) { for (let y = 0; y < sz; y++) if (alphaAt(x, y) > 8) return sz - 1 - x }
      if (dir === 'top') for (let y = 0; y < sz; y++) { for (let x = 0; x < sz; x++) if (alphaAt(x, y) > 8) return y }
      if (dir === 'bottom') for (let y = sz - 1; y >= 0; y--) { for (let x = 0; x < sz; x++) if (alphaAt(x, y) > 8) return sz - 1 - y }
      return sz
    }
    const margins = { left: scan('left'), right: scan('right'), top: scan('top'), bottom: scan('bottom') }

    const scale = sz / 512.0
    const cy = Math.round(256 * scale)
    let bestRun = 0
    for (let y = Math.max(0, cy - Math.round(60 * scale)); y < Math.min(sz, cy + Math.round(60 * scale)); y++) {
      let run = 0
      for (let x = Math.round(300 * scale); x < sz; x++) {
        const idx = (sz * y + x) * 4
        const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3]
        const isMagentaIsh = a > 40 && r > 120 && b > 120 && g < 120
        if (isMagentaIsh) { run++; bestRun = Math.max(bestRun, run) } else { run = 0 }
      }
    }
    return { margins, thickestRun: bestRun }
  }, size)
}

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const variants = ['wrs_mark_v3.svg', 'wrs_mark_v3_mono_cyan.svg']
  const allResults = {}
  let overallPass = true

  for (const variant of variants) {
    const svgPath = join(MARK_DIR, variant)
    const svgText = readFileSync(svgPath, 'utf8')
    console.log(`\n=== ${variant} ===`)

    const pathsOnly = gatePathsOnly(svgText)
    console.log(`[${pathsOnly.pass ? 'PASS' : 'FAIL'}] paths-only: ${pathsOnly.found.join(', ') || 'clean'}`)

    await renderToPage(page, svgText, 512)
    await page.screenshot({ path: join(OUT_DIR, variant.replace('.svg', '_512.png')), omitBackground: true })
    const m512 = await measureViaCanvas(page, 512)
    const vals512 = Object.values(m512.margins)
    const spread = Math.max(...vals512) - Math.min(...vals512)
    const marginPass = spread <= 2
    console.log(`[${marginPass ? 'PASS' : 'FAIL'}] margin symmetry: ${JSON.stringify(m512.margins)} spread=${spread}`)

    let strokePass = true
    let thickestRun = 'n/a (mono has no stroke layer)'
    if (!variant.includes('mono')) {
      await renderToPage(page, svgText, 192)
      await page.screenshot({ path: join(OUT_DIR, variant.replace('.svg', '_192.png')), omitBackground: true })
      const m192 = await measureViaCanvas(page, 192)
      thickestRun = m192.thickestRun
      strokePass = thickestRun >= 2
      console.log(`[${strokePass ? 'PASS' : 'FAIL'}] min stroke @192: thickest run=${thickestRun}px`)
    }

    const variantPass = pathsOnly.pass && marginPass && strokePass
    overallPass = overallPass && variantPass
    allResults[variant] = { pathsOnly, margins: m512.margins, spread, marginPass, thickestRun, strokePass, pass: variantPass }
  }

  await browser.close()
  writeFileSync(join(OUT_DIR, 'gate_output.json'), JSON.stringify(allResults, null, 2))
  console.log('\nALL GATES:', overallPass ? 'PASS' : 'FAIL')
  process.exitCode = overallPass ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
