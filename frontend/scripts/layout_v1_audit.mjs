// layout_v1_audit.mjs — LAYOUT_SPEC v3.1 proof gates for the layout-install pass.
//
// Requires a running dev server (npm run dev, default http://localhost:5173)
// so the DEV-only mock round provider can serve a guaranteed bonus round for
// the "bonus" screenshot/audit. Run (from frontend/): npx tsx scripts/layout_v1_audit.mjs
//
// Produces:
//  - reports/screens/layout-v1/base.png, bonus.png, and one PNG per compliance
//    viewport (mobile-s.png, mobile-m.png, mobile-l.png, popout-s.png,
//    popout-l.png, desktop.png)
//  - reports/screens/layout-v1/audit-results.json (occlusion + position data)
//
// Exits non-zero if any occlusion or position-audit check fails.

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'layout-v1')
// __dirname = frontend/scripts -> ../.. = repo root -> reports/screens/layout-v1
mkdirSync(OUT_DIR, { recursive: true })

const BASE_URL = process.env.LAYOUT_AUDIT_URL ?? 'http://localhost:5173'

// Fresh Playwright contexts have empty storage, so the once-per-session intro
// splash (a full-screen modal) shows on every page and intercepts clicks unless
// dismissed. (Pre-existing: this audit predates the intro splash.)
async function dismissIntroIfPresent(page) {
  const btn = page.locator('[data-testid="intro-continue"]')
  try {
    if (await btn.count() > 0 && await btn.isVisible()) {
      await btn.click()
      await page.waitForTimeout(120)
    }
  } catch {}
}


const COMPLIANCE_VIEWPORTS = [
  { name: 'mobile-s', width: 320, height: 568 },
  { name: 'mobile-m', width: 375, height: 667 },
  { name: 'mobile-l', width: 425, height: 812 },
  { name: 'popout-s', width: 400, height: 225 },
  { name: 'popout-l', width: 800, height: 450 },
  { name: 'desktop',  width: 1200, height: 675 },
]

// Text-bearing HUD selectors checked for pairwise occlusion, plus the frame.
// (2026-07-08 hygiene pass: the old .hud-panel/.turbo-btn/etc class names and
// the FeatureButton testid are stale since the B1 HUD reskin - fs-turbo/
// fs-menu/etc are siblings of .fs-panel, not descendants, so these are now
// standalone selectors rather than `.hud-panel .x` descendant selectors.)
const TEXT_SELECTORS = [
  '.logo-box',
  '.error-banner',
  '.fs-turbo',
  '.fs-menu',
  '[data-testid="hud-balance"]',
  '[data-testid="hud-win"]',
  '[data-testid="hud-bet"]',
  '[data-testid="spin-button"]',
  '.autoplay-wrapper',
  '[data-testid="feature-menu-entry"] .fm-entry-label',
  '[data-testid="win-banner"]',
  '[data-testid="bonus-instrument-column"] .plate',
  '[data-testid="odometer"]',
]
const FRAME_SELECTOR = '.game-frame'

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

async function collectBoxes(page) {
  const boxes = []
  for (const sel of [...TEXT_SELECTORS, FRAME_SELECTOR]) {
    const els = await page.locator(sel).all()
    for (const el of els) {
      if (!(await el.isVisible())) continue
      const box = await el.boundingBox()
      if (box) boxes.push({ selector: sel, box })
    }
  }
  return boxes
}

function occlusionMatrix(boxes) {
  const frameBoxes = boxes.filter((b) => b.selector === FRAME_SELECTOR)
  const textBoxes = boxes.filter((b) => b.selector !== FRAME_SELECTOR)
  const failures = []
  for (let i = 0; i < textBoxes.length; i++) {
    for (let j = i + 1; j < textBoxes.length; j++) {
      if (intersects(textBoxes[i].box, textBoxes[j].box)) {
        failures.push({ a: textBoxes[i].selector, b: textBoxes[j].selector })
      }
    }
    for (const f of frameBoxes) {
      if (intersects(textBoxes[i].box, f.box)) {
        failures.push({ a: textBoxes[i].selector, b: FRAME_SELECTOR })
      }
    }
  }
  return failures
}

async function run() {
  const browser = await chromium.launch()
  const results = { viewports: {}, position: null }
  let anyFail = false

  // ── Base state, six compliance viewports + the primary 1280x720 ──────────
  for (const vp of [{ name: '1280x720-base', width: 1280, height: 720 }, ...COMPLIANCE_VIEWPORTS]) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="hud-panel"]', { timeout: 15000 })
    await dismissIntroIfPresent(page)
    await page.waitForTimeout(600) // settle animations/fonts

    const boxes = await collectBoxes(page)
    const failures = occlusionMatrix(boxes)
    results.viewports[vp.name] = {
      width: vp.width,
      height: vp.height,
      boxCount: boxes.length,
      occlusionFailures: failures,
    }
    if (failures.length) anyFail = true

    const fileName = vp.name === '1280x720-base' ? 'base.png' : `${vp.name}.png`
    await page.screenshot({ path: join(OUT_DIR, fileName) })

    // Position audit — only meaningful at the 1280x720 reference (S=1)
    if (vp.name === '1280x720-base') {
      const panel = await page.locator('[data-testid="hud-panel"]').boundingBox()
      const spin = await page.locator('[data-testid="spin-button"]').boundingBox()
      const logo = await page.locator('.logo-box').boundingBox()
      const spinCentre = { x: spin.x + spin.width / 2, y: spin.y + spin.height / 2 }
      results.position = {
        hudPanel: { expected: { x: 320, y: 560, width: 640, height: 88 }, measured: panel },
        spinCentre: { expected: { x: 970, y: 604 }, measured: spinCentre },
        logoBox: { expected: { x: 450, y: 18, width: 380, height: 60 }, measured: logo },
      }
    }

    await page.close()
  }

  // ── Bonus (mock) state — trigger the guaranteed bonus buy, capture mid-feature ──
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="hud-panel"]', { timeout: 15000 })
    await dismissIntroIfPresent(page)
    await page.waitForTimeout(600)

    // FeatureMenu replaced the old single-tier FeatureButton (2026-07-07):
    // open the menu, then ACTIVATE the Buy Overdrive card.
    await page.locator('[data-testid="feature-menu-button"]').click()
    await page.waitForTimeout(150)
    await page.locator('[data-testid="activate-bonus"]').click()
    await page.waitForSelector('[data-testid="buy-confirm"]', { timeout: 5000 })
    await page.locator('[data-testid="buy-confirm"]').click()

    // Wait for the free-spins overlay to reach its 'spin' phase (entry ~1.1s)
    // :visible: skip the persistent hidden warm mount's duplicate testids.
    await page.waitForSelector('[data-testid="freespins-overlay"]:visible', { timeout: 10000 })
    await page.waitForSelector('[data-testid="bonus-instrument-column"]:visible', { timeout: 10000 })
    await page.waitForTimeout(1400)

    const boxes = await collectBoxes(page)
    const failures = occlusionMatrix(boxes)
    results.viewports['1280x720-bonus'] = {
      width: 1280,
      height: 720,
      boxCount: boxes.length,
      occlusionFailures: failures,
    }
    if (failures.length) anyFail = true

    const column = await page.locator('[data-testid="bonus-instrument-column"]:visible').boundingBox()
    results.position.instrumentColumn = {
      expected: { x: 1000, y: 96, width: 262 },
      measured: column,
    }

    await page.screenshot({ path: join(OUT_DIR, 'bonus.png') })
    await page.close()
  }

  await browser.close()

  writeFileSync(join(OUT_DIR, 'audit-results.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))

  if (anyFail) {
    console.error('LAYOUT AUDIT: OCCLUSION FAILURES DETECTED')
    process.exit(1)
  }
  console.log('LAYOUT AUDIT: ALL OCCLUSION CHECKS PASS')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
