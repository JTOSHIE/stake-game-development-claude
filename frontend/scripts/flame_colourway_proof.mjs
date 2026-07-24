// flame_colourway_proof.mjs — OWNER AUDIT ROUND 2, item 4 proof.
//
// Captures all three FlameJets colourway/backdrop entries: natural (organic
// trigger, green flames + standard backdrop), overdrive (bought Overdrive,
// cyan flames + magenta backdrop), nitro (bought NITRO OVERDRIVE, magenta-
// core white-tipped flames + intensified pink/magenta backdrop).
//
// Run (from frontend/): node scripts/flame_colourway_proof.mjs

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'owner-audit-v2', 'flame-colourways')
mkdirSync(OUT_DIR, { recursive: true })

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
async function dismissIntro(page) {
  const splash = page.locator('[data-testid="hero-splash"]')
  if (await splash.count() > 0 && await splash.isVisible().catch(() => false)) { await splash.click(); await page.waitForTimeout(100) }
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) { await btn.click(); await page.waitForTimeout(100) }
}

async function captureNatural(browser, port) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await page.goto(`http://localhost:${port}?mockCategory=trigger_3`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await page.waitForFunction(() => window.__testStores?.balance, { timeout: 8000 })
  await dismissIntro(page)
  await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
  await page.locator('[data-testid="spin-button"]').click()
  await page.waitForSelector('[data-testid="entry-continue"]', { timeout: 10000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: join(OUT_DIR, 'natural-entry.png') })
  await page.close()
}

async function captureBuy(browser, port, mode, category, filename) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await page.goto(`http://localhost:${port}?mockCategory=${category}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await page.waitForFunction(() => window.__testStores?.balance, { timeout: 8000 })
  await dismissIntro(page)
  await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
  await page.locator('[data-testid="feature-menu-button"]').click()
  await page.waitForTimeout(150)
  await page.locator(`[data-testid="activate-${mode}"]`).click()
  await page.waitForTimeout(150)
  await page.locator('[data-testid="buy-confirm"]').click()
  await page.waitForSelector('[data-testid="entry-continue"]', { timeout: 10000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: join(OUT_DIR, filename) })
  await page.close()
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  try {
    const browser = await chromium.launch()
    await captureNatural(browser, port)
    await captureBuy(browser, port, 'bonus', 'trigger_3', 'overdrive-buy-entry.png')
    await captureBuy(browser, port, 'super', 'super_win_small', 'nitro-entry.png')
    await browser.close()
    console.log('Flame colourway proofs captured to', OUT_DIR)
  } finally {
    server.kill()
  }
}
run().catch((err) => { console.error(err); process.exitCode = 1 })
