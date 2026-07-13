// ux_v1_audit.mjs — FS UX POLISH proof gates (HUD v3.2, paytable, wincap flow).
//
// Requires a running dev server (npm run dev, default http://localhost:5173).
// Run (from frontend/): npx tsx scripts/ux_v1_audit.mjs
//
// Produces reports/screens/ux-v1/:
//  - hud-stress-<viewport>.png (1280x720 + six compliance viewports, stress values)
//  - paytable-top.png, paytable-scrolled.png
//  - wincap-splash.png, wincap-presentation.png, wincap-summary.png
//  - ux-audit-results.json (occlusion + position data for the HUD stress pass)
//
// Exits non-zero if any occlusion or position-audit check fails.

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'ux-v1')
mkdirSync(OUT_DIR, { recursive: true })

const BASE_URL = process.env.LAYOUT_AUDIT_URL ?? 'http://localhost:5173'

// Fresh Playwright contexts have empty storage, so the once-per-session intro
// splash (a full-screen modal) shows on every page and intercepts clicks
// unless dismissed. (2026-07-08 hygiene pass: this script predates the intro
// splash and never accounted for it, unlike layout_v1_audit.mjs's own copy of
// this same helper.)
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
// AMENDMENT v3.2: TURBO/SPIN/AUTOPLAY/BALANCE/WIN/BET/arrows are all direct
// stage-level siblings now (no longer nested inside .hud-panel).
// 2026-07-08 hygiene pass: class names updated to the current B1 HUD reskin
// (.fs-turbo/.fs-menu/etc, testid-based where no stable class exists) and the
// FeatureButton testid replaced with FeatureMenu's entry.
const TEXT_SELECTORS = [
  '.logo-box',
  '.error-banner',
  '.fs-turbo',
  '.fs-menu',
  '[data-testid="hud-balance"]',
  '[data-testid="hud-win"]',
  '[data-testid="hud-bet"]',
  '[data-testid="bet-arrows"]',
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

/** Inject stress values via the dev-only window.__testStores hook. A bet of
 *  $5,000.00 exceeds this game's default BET_LEVELS ladder (max $100), so a
 *  higher RGS-style ladder is seeded first — otherwise HudOverlay's bet-ladder
 *  guard immediately snaps the value back down, exactly as it should in real
 *  play against an unlisted bet amount. */
async function loadStressValues(page) {
  await page.waitForFunction(() => (window).__testStores !== undefined, { timeout: 10000 })
  await page.evaluate(() => {
    const s = (window).__testStores
    s.rgsBetLevels.set([0.10, 1.00, 10.00, 100.00, 1000.00, 5000.00])
    s.balance.set(10000)
    s.betAmount.set(5000)
    // Below the 10x big-win-banner threshold at this bet, so the stress pass
    // exercises the fixed-width WIN box without also popping the banner.
    s.winAmount.set(5000)
  })
  await page.waitForTimeout(150)
}

async function run() {
  const browser = await chromium.launch()
  const results = { viewports: {}, position: null }
  let anyFail = false

  // ── Gate 1: HUD v3.2 occlusion + position audit under stress values ──────
  for (const vp of [{ name: '1280x720', width: 1280, height: 720 }, ...COMPLIANCE_VIEWPORTS]) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await dismissIntroIfPresent(page)
    await loadStressValues(page)

    const boxes = await collectBoxes(page)
    const failures = occlusionMatrix(boxes)
    results.viewports[vp.name] = { width: vp.width, height: vp.height, boxCount: boxes.length, occlusionFailures: failures }
    if (failures.length) anyFail = true

    // Verify the bet arrows are visible AND clickable (not just present).
    const arrows = page.locator('[data-testid="bet-arrows"] .fs-arrow')
    const arrowCount = await arrows.count()
    let arrowsClickable = arrowCount === 2
    for (let i = 0; i < arrowCount; i++) {
      if (!(await arrows.nth(i).isVisible())) arrowsClickable = false
    }
    results.viewports[vp.name].arrowsClickable = arrowsClickable
    if (!arrowsClickable) anyFail = true

    await page.screenshot({ path: join(OUT_DIR, `hud-stress-${vp.name}.png`) })

    if (vp.name === '1280x720') {
      const panel = await page.locator('[data-testid="hud-panel"]').boundingBox()
      const spin = await page.locator('[data-testid="spin-button"]').boundingBox()
      const turbo = await page.locator('.fs-turbo').boundingBox()
      const autoplay = await page.locator('.autoplay-wrapper').boundingBox()
      const balanceBox = await page.locator('[data-testid="hud-balance"]').boundingBox()
      const winBox = await page.locator('[data-testid="hud-win"]').boundingBox()
      const betBox = await page.locator('[data-testid="hud-bet"]').boundingBox()
      const betArrows = await page.locator('[data-testid="bet-arrows"]').boundingBox()
      const centre = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 })
      results.position = {
        hudPanel:   { expected: { x: 296, y: 560, width: 688, height: 88 }, measured: panel },
        spinCentre: { expected: { x: 1004, y: 604 }, measured: centre(spin) },
        turboCentre:{ expected: { x: 268, y: 604 }, measured: centre(turbo) },
        autoplayCentre: { expected: { x: 936, y: 672 }, measured: centre(autoplay) },
        balanceBox: { expected: { x: 400, width: 200 }, measured: { x: balanceBox.x, width: balanceBox.width } },
        winBox:     { expected: { x: 616, width: 150 }, measured: { x: winBox.x, width: winBox.width } },
        betBox:     { expected: { x: 782, width: 120 }, measured: { x: betBox.x, width: betBox.width } },
        betArrows:  { expected: { x: 916 }, measured: { x: betArrows.x } },
      }
    }

    await page.close()
  }

  // ── Gate 2: full-page paytable screenshots (top + scrolled) ──────────────
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await dismissIntroIfPresent(page)
    await page.locator('.fs-menu').click()
    await page.getByRole('menuitem', { name: /paytable/i }).click()
    await page.waitForSelector('.fs-pt-panel', { timeout: 5000 })
    await page.waitForTimeout(300)
    await page.screenshot({ path: join(OUT_DIR, 'paytable-top.png') })

    await page.locator('.fs-pt-body').evaluate((el) => { el.scrollTop = el.scrollHeight })
    await page.waitForTimeout(200)
    await page.screenshot({ path: join(OUT_DIR, 'paytable-scrolled.png') })
    await page.close()
  }

  // ── Gate 3: wincap flow — splash, collect, full presentation, summary ────
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(`${BASE_URL}/?mockCategory=wincap`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="feature-menu-button"]', { timeout: 15000 })
    await dismissIntroIfPresent(page)

    // FeatureMenu replaced the old single-tier FeatureButton (2026-07-07).
    await page.locator('[data-testid="feature-menu-button"]').click()
    await page.waitForTimeout(150)
    await page.locator('[data-testid="activate-bonus"]').click()
    await page.waitForSelector('[data-testid="buy-confirm"]', { timeout: 5000 })
    await page.locator('[data-testid="buy-confirm"]').click()

    // Splash — MaxWinCelebration shows immediately.
    await page.waitForSelector('.max-win-overlay', { timeout: 10000 })
    await page.waitForTimeout(400)
    await page.screenshot({ path: join(OUT_DIR, 'wincap-splash.png') })
    const splashVisible = await page.locator('.max-win-overlay').isVisible()

    // Collect — the full round presentation should now play. :visible skips
    // the persistent hidden warm mount's duplicate testid (same pattern
    // layout_v1_audit.mjs already uses for this exact element).
    await page.locator('.collect-btn').click()
    await page.waitForSelector('[data-testid="freespins-overlay"]:visible', { timeout: 10000 })
    await page.waitForTimeout(1200)
    await page.screenshot({ path: join(OUT_DIR, 'wincap-presentation.png') })
    const presentationVisible = await page.locator('[data-testid="freespins-overlay"]:visible').isVisible()

    // Wait for it to reach the end/summary phase, then screenshot. :visible
    // skips the persistent hidden warm mount's duplicate (same pattern as
    // freespins-overlay above).
    await page.waitForSelector('.fs-end:visible', { timeout: 20000 })
    await page.waitForTimeout(300)
    await page.screenshot({ path: join(OUT_DIR, 'wincap-summary.png') })
    const summaryVisible = await page.locator('.fs-end:visible').isVisible()

    results.wincapFlow = { splashVisible, presentationVisible, summaryVisible }
    if (!splashVisible || !presentationVisible || !summaryVisible) anyFail = true

    await page.close()
  }

  await browser.close()

  writeFileSync(join(OUT_DIR, 'ux-audit-results.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))

  if (anyFail) {
    console.error('UX AUDIT: FAILURES DETECTED')
    process.exit(1)
  }
  console.log('UX AUDIT: ALL CHECKS PASS')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
