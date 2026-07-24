// autoplay_menu_proof.mjs — OWNER AUDIT ROUND 3, item 9.
//
// Opens the autoplay dropdown on desktop and portrait, measures the
// single-win-limit input, loss-limit input, and a spin-count preset button,
// asserts all are >=44px, and captures proof screenshots.
//
// Run (from frontend/): node scripts/autoplay_menu_proof.mjs

import { chromium, devices } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'owner-audit-v3', 'autoplay-menu')
mkdirSync(OUT_DIR, { recursive: true })

const TOUCH_MIN = 44

async function getFreePort() {
  return new Promise((resolvePromise, reject) => {
    const srv = createServer()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => resolvePromise(port)) })
  })
}
function startDevServer(port) {
  return new Promise((resolvePreview, reject) => {
    const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] })
    let resolved = false
    const onData = (d) => { const s = d.toString(); if (!resolved && /Local/.test(s)) { resolved = true; resolvePreview(proc) } }
    proc.stdout.on('data', onData); proc.stderr.on('data', onData); proc.on('error', reject)
    setTimeout(() => { if (!resolved) reject(new Error('vite dev server did not start in time')) }, 15000)
  })
}
async function checkProfile(browser, port, label, contextOpts, autoSelector) {
  const context = await browser.newContext(contextOpts)
  const page = await context.newPage()
  const failures = []
  const assert = (cond, msg) => { if (!cond) failures.push(msg); console.log(`${cond ? 'PASS' : 'FAIL'}: [${label}] ${msg}`) }
  try {
    await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await page.waitForFunction(() => window.__testStores?.balance, { timeout: 8000 })
    await dismissIntro(page)
    await page.locator(autoSelector).click()
    await page.waitForTimeout(200)
    // Toggle the limits on so their number inputs actually render.
    const toggles = page.locator('.auto-menu-toggle')
    await toggles.nth(1).locator('input').check().catch(() => {})
    await toggles.nth(3).locator('input').check().catch(() => {})
    await page.waitForTimeout(150)
    await page.screenshot({ path: join(OUT_DIR, `${label}.png`) })

    const winInput = await page.locator('[data-testid="single-win-limit-input"]').boundingBox()
    const lossInput = await page.locator('[data-testid="loss-limit-input"]').boundingBox()
    const preset = await page.locator('.auto-menu-item').first().boundingBox()
    assert(!!winInput && winInput.width >= TOUCH_MIN && winInput.height >= TOUCH_MIN, `single-win-limit-input >= 44px (measured ${winInput?.width.toFixed(0)}x${winInput?.height.toFixed(0)})`)
    assert(!!lossInput && lossInput.width >= TOUCH_MIN && lossInput.height >= TOUCH_MIN, `loss-limit-input >= 44px (measured ${lossInput?.width.toFixed(0)}x${lossInput?.height.toFixed(0)})`)
    assert(!!preset && preset.height >= TOUCH_MIN, `spin-count preset button height >= 44px (measured ${preset?.height.toFixed(0)})`)

    // On-screen sanity: the dropdown must not overflow the viewport.
    const menuBox = await page.locator('.auto-menu').first().boundingBox()
    const viewport = page.viewportSize()
    const withinBounds = menuBox && menuBox.x >= -1 && (menuBox.x + menuBox.width) <= viewport.width + 1
    assert(withinBounds, `autoplay dropdown stays within the viewport (menu x=${menuBox?.x.toFixed(0)} width=${menuBox?.width.toFixed(0)}, viewport width=${viewport.width})`)
  } finally {
    await context.close()
  }
  return failures
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  let allFailures = []
  try {
    const browser = await chromium.launch()
    allFailures = allFailures.concat(
      await checkProfile(browser, port, 'desktop-landscape', { viewport: { width: 1280, height: 720 } }, '.fs-auto'),
    )
    allFailures = allFailures.concat(
      await checkProfile(browser, port, 'iphone14-portrait', { ...devices['iPhone 14'] }, '.p-autoplay-wrapper button'),
    )
    await browser.close()
  } finally {
    server.kill()
  }
  console.log('')
  console.log(allFailures.length === 0 ? 'AUTOPLAY MENU PROOF: PASS' : `AUTOPLAY MENU PROOF: FAIL (${allFailures.length})`)
  if (allFailures.length > 0) { allFailures.forEach((f) => console.log(`  - ${f}`)); process.exitCode = 1 }
}

run().catch((err) => { console.error(err); process.exitCode = 1 })
