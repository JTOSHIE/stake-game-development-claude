// audit_remediation.mjs — audit-remediation gates (Tasks 3 and 5).
// Requires a running dev server. Run from frontend/:  node scripts/audit_remediation.mjs
// Writes reports/screens/audit-remediation/audit.json; exits non-zero on any failure.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', '..', 'reports', 'screens', 'audit-remediation')
mkdirSync(OUT, { recursive: true })
const URL = 'http://localhost:5173/'

const intersects = (a, b) =>
  a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
const inside = (box, host) =>
  box.x >= host.x - 0.5 && box.y >= host.y - 0.5 &&
  box.x + box.width <= host.x + host.width + 0.5 &&
  box.y + box.height <= host.y + host.height + 0.5

async function boxOf(page, sel) {
  const el = await page.$(sel)
  return el ? el.boundingBox() : null
}

async function run() {
  const browser = await chromium.launch()
  const results = { hitAreas: {}, jetClip: {}, pass: true }

  // ── Task 3: MAX / SPIN / arrows hit rectangles pairwise non-intersecting ──
  for (const vp of [{ w: 1280, h: 720 }, { w: 320, h: 568 }]) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 })
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForSelector('.symbol-cell img.symbol-img', { timeout: 20000 })
    const max = await boxOf(page, '[data-testid="max-chip"]')
    const spin = await boxOf(page, '[data-testid="spin-button"]')
    const arrows = await boxOf(page, '[data-testid="bet-arrows"]')
    const pairs = { 'max-spin': intersects(max, spin), 'max-arrows': intersects(max, arrows), 'spin-arrows': intersects(spin, arrows) }
    const ok = !pairs['max-spin'] && !pairs['max-arrows'] && !pairs['spin-arrows']
    results.hitAreas[`${vp.w}x${vp.h}`] = {
      max: max && { x: Math.round(max.x), y: Math.round(max.y), w: Math.round(max.width), h: Math.round(max.height) },
      spin: spin && { x: Math.round(spin.x), w: Math.round(spin.width) },
      arrows: arrows && { x: Math.round(arrows.x), w: Math.round(arrows.width) },
      intersecting: pairs, pass: ok,
    }
    if (!ok) results.pass = false
    await page.close()
  }

  // ── Task 5: all 8 jet flame boxes fully inside the visible stage ──────────
  const JET_VIEWPORTS = [
    { w: 320, h: 568 }, { w: 375, h: 667 }, { w: 425, h: 812 },
    { w: 400, h: 225 }, { w: 800, h: 450 }, { w: 1200, h: 675 },
  ]
  for (const vp of JET_VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 })
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForSelector('.jet .flame', { timeout: 20000 })
    const stage = await boxOf(page, '.game-wrapper')
    const flames = await page.$$('.jet .flame')
    const clipped = []
    let i = 0
    for (const f of flames) {
      const b = await f.boundingBox()
      if (b && stage && !inside(b, stage)) clipped.push(i)
      i++
    }
    const ok = flames.length === 8 && clipped.length === 0
    results.jetClip[`${vp.w}x${vp.h}`] = { jetCount: flames.length, clipped, pass: ok }
    if (!ok) results.pass = false
    await page.close()
  }

  await browser.close()
  writeFileSync(join(OUT, 'audit.json'), JSON.stringify(results, null, 2))
  console.log('hit-area pass:', Object.entries(results.hitAreas).map(([k, v]) => `${k}=${v.pass}`).join(' '))
  console.log('jet-clip pass:', Object.entries(results.jetClip).map(([k, v]) => `${k}=${v.pass}(clip:${v.clipped.join(',') || 'none'})`).join(' '))
  console.log(results.pass ? 'AUDIT REMEDIATION: PASS' : 'AUDIT REMEDIATION: FAIL')
  process.exit(results.pass ? 0 : 1)
}
run().catch((e) => { console.error(e); process.exit(1) })
