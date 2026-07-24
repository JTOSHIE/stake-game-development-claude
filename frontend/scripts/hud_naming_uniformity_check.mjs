// hud_naming_uniformity_check.mjs — OWNER AUDIT ROUND 3, item 2.
//
// Asserts the feature-HUD field labels (OVERDRIVE FREE SPINS, TOTAL WIN)
// render byte-identically everywhere BonusInstrumentColumn appears: portrait
// (iPhone 14, Pixel 7) and real desktop/landscape (1280x720). Compact-
// landscape is intentionally not included - that profile doesn't render
// this instrument column at all (no room, per the Round 2 relayout), so
// there is no second landscape rendering to compare against.
//
// Run (from frontend/): node scripts/hud_naming_uniformity_check.mjs

import { chromium, devices } from 'playwright'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

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
}async function waitSpinDone(page, timeout = 20000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const done = await page.evaluate(() => !document.querySelector('[data-testid="spin-button"].spinning'))
    if (done) return
    const gate = page.locator('[data-testid="entry-continue"]')
    if (await gate.count() > 0 && await gate.isVisible().catch(() => false)) {
      await gate.click({ force: true }).catch(() => {})
    }
    await page.waitForTimeout(150)
  }
  throw new Error(`waitSpinDone: spin still in progress after ${timeout}ms`)
}

async function readFeatureLabels(browser, port, contextOpts, label) {
  const context = await browser.newContext(contextOpts)
  const page = await context.newPage()
  try {
    await page.goto(`http://localhost:${port}?mockCategory=trigger_3`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await page.waitForFunction(() => window.__testStores?.balance, { timeout: 8000 })
    await dismissIntro(page)
    await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
    await page.locator('[data-testid="spin-button"]').click()
    await page.waitForSelector('[data-testid="entry-continue"]', { timeout: 10000 })
    await page.locator('[data-testid="entry-continue"]').click({ force: true })
    // App.svelte permanently warm-mounts a second, hidden BonusInstrumentColumn
    // instance sharing this exact testid (Reel Feel v3 pre-paint) - excluding
    // .warm-mount descendants is what actually finds the real, live one.
    await page.waitForFunction(
      () => [...document.querySelectorAll('[data-testid="bonus-instrument-column"]')].some((el) => !el.closest('.warm-mount')),
      { timeout: 10000 },
    )
    await page.waitForTimeout(300)
    const labels = await page.evaluate(() => {
      const col = [...document.querySelectorAll('[data-testid="bonus-instrument-column"]')].find((el) => !el.closest('.warm-mount'))
      const odometer = col.querySelector('[data-testid="odometer"]')
      const totalWin = col.querySelector('[data-testid="feature-total-win"]')
      const labelSel = '.pm-label, .plate-label'
      return {
        freeSpinsLabel: odometer?.querySelector(labelSel)?.textContent?.trim() ?? null,
        totalWinLabel: totalWin?.querySelector(labelSel)?.textContent?.trim() ?? null,
      }
    })
    // Let the round finish so the next profile starts clean.
    await waitSpinDone(page).catch(() => {})
    return { profile: label, ...labels }
  } finally {
    await context.close()
  }
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const failures = []
  const assert = (cond, msg) => { if (!cond) failures.push(msg); console.log(`${cond ? 'PASS' : 'FAIL'}: ${msg}`) }
  try {
    const browser = await chromium.launch()
    const results = []
    results.push(await readFeatureLabels(browser, port, { ...devices['iPhone 14'] }, 'iphone14-portrait'))
    results.push(await readFeatureLabels(browser, port, { ...devices['Pixel 7'] }, 'pixel7-portrait'))
    results.push(await readFeatureLabels(browser, port, { viewport: { width: 1280, height: 720 } }, 'desktop-landscape'))
    await browser.close()

    console.log(JSON.stringify(results, null, 2))

    const freeSpinsLabels = new Set(results.map((r) => r.freeSpinsLabel))
    const totalWinLabels = new Set(results.map((r) => r.totalWinLabel))
    assert(results.every((r) => r.freeSpinsLabel !== null), 'every profile rendered a FREE SPINS field label')
    assert(results.every((r) => r.totalWinLabel !== null), 'every profile rendered a TOTAL WIN field label')
    assert(freeSpinsLabels.size === 1, `FREE SPINS label identical across all profiles (found: ${[...freeSpinsLabels].join(' | ')})`)
    assert(totalWinLabels.size === 1, `TOTAL WIN label identical across all profiles (found: ${[...totalWinLabels].join(' | ')})`)
    assert([...freeSpinsLabels][0] === 'OVERDRIVE FREE SPINS', `FREE SPINS label matches the canonical string "OVERDRIVE FREE SPINS" (found "${[...freeSpinsLabels][0]}")`)
    assert([...totalWinLabels][0] === 'TOTAL WIN', `TOTAL WIN label matches the canonical string "TOTAL WIN" (found "${[...totalWinLabels][0]}")`)
  } finally {
    server.kill()
  }
  console.log('')
  console.log(failures.length === 0 ? 'HUD NAMING UNIFORMITY CHECK: PASS' : `HUD NAMING UNIFORMITY CHECK: FAIL (${failures.length})`)
  if (failures.length > 0) { failures.forEach((f) => console.log(`  - ${f}`)); process.exitCode = 1 }
}

run().catch((err) => { console.error(err); process.exitCode = 1 })
