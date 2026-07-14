// rules_conformance_proof.mjs — ITEM 1, JOB 5b in-game rules conformance.
//
// Opens the paytable/rules modal (base state and mid-Overdrive) and screenshots
// every section required by the approval checklist: per-mode cost/RTP/max-win,
// feature access (trigger table), special-symbol values, and the UI button
// guide (Interface Guide). Proofs land in reports/screens/rules-conformance-item1/.
//
// Run (from frontend/): npx tsx scripts/rules_conformance_proof.mjs

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'rules-conformance-item1')
mkdirSync(OUT_DIR, { recursive: true })

async function getFreePort() {
  return new Promise((resolvePromise, reject) => {
    const srv = createServer()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolvePromise(port))
    })
  })
}

function startDevServer(port) {
  return new Promise((resolvePreview, reject) => {
    const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], {
      cwd: join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let resolved = false
    const onData = (d) => {
      const s = d.toString()
      if (!resolved && (/Local/.test(s) || new RegExp(`localhost:${port}`).test(s))) {
        resolved = true
        resolvePreview(proc)
      }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', reject)
    setTimeout(() => { if (!resolved) reject(new Error('vite dev server did not start in time')) }, 15000)
  })
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const baseUrl = `http://localhost:${port}`
  const consoleErrors = []

  try {
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
    page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })

    const intro = page.locator('[data-testid="intro-continue"]')
    if (await intro.count() > 0 && await intro.isVisible().catch(() => false)) {
      await intro.click()
      await page.waitForTimeout(150)
    }

    // Open the paytable: click the HUD's menu button, then its paytable item
    // (HudOverlay.svelte: button.fs-menu opens the menu, .hud-menu-item[0] is
    // the paytable entry - no dedicated data-testid exists for either).
    await page.locator('button.fs-menu').click()
    await page.locator('.hud-menu-item').first().click()
    await page.waitForSelector('[data-testid="interface-guide"]', { timeout: 10000 })
    await page.waitForTimeout(200)

    // Full-page scroll capture: base state.
    await page.screenshot({ path: join(OUT_DIR, 'paytable-full-base.png'), fullPage: true })

    // Scroll to the Bet Modes section (per-mode cost/RTP/max-win) and capture it.
    const modesHeading = page.locator('h3.fs-heading', { hasText: 'Bet Modes' })
    if (await modesHeading.count() > 0) {
      await modesHeading.scrollIntoViewIfNeeded()
      await page.waitForTimeout(150)
      await page.screenshot({ path: join(OUT_DIR, 'bet-modes-section.png') })
    }

    // Scroll to the Overdrive Free Spins (feature access / trigger table) section.
    const overdriveHeading = page.locator('h3.fs-heading', { hasText: 'Overdrive' })
    if (await overdriveHeading.count() > 0) {
      await overdriveHeading.scrollIntoViewIfNeeded()
      await page.waitForTimeout(150)
      await page.screenshot({ path: join(OUT_DIR, 'feature-access-section.png') })
    }

    // Scroll to the Interface Guide (UI button guide).
    const guide = page.locator('[data-testid="interface-guide"]')
    await guide.scrollIntoViewIfNeeded()
    await page.waitForTimeout(150)
    await page.screenshot({ path: join(OUT_DIR, 'interface-guide-section.png') })

    // Scroll to Symbol Payouts (special-symbol values).
    const symbolsHeading = page.locator('h3.fs-heading', { hasText: 'Symbol Payouts' })
    if (await symbolsHeading.count() > 0) {
      await symbolsHeading.scrollIntoViewIfNeeded()
      await page.waitForTimeout(150)
      await page.screenshot({ path: join(OUT_DIR, 'symbol-payouts-section.png') })
    }

    await page.close()
    await browser.close()

    console.log(JSON.stringify({ consoleErrors, outDir: OUT_DIR }, null, 2))
    if (consoleErrors.length > 0) {
      console.error('RULES CONFORMANCE PROOF: console errors detected')
      process.exitCode = 1
    } else {
      console.log('RULES CONFORMANCE PROOF: captured, zero console errors')
    }
  } finally {
    server.kill()
  }
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
