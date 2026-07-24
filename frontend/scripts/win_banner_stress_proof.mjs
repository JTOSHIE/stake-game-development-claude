// win_banner_stress_proof.mjs — OWNER AUDIT REMEDIATION item B2.
//
// Proves the win banner's amount text no longer truncates at large dollar
// values by forcing the epic tier at $1,000 / $100,000 / $1,000,000 (bet=1,
// so winAmount itself is the multiplier, comfortably clearing the epic
// threshold at all three) and asserting the rendered text is the full,
// untruncated string with no horizontal overflow of its plate.
//
// Run (from frontend/): node scripts/win_banner_stress_proof.mjs

import { chromium, devices } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'

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
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', reject)
    setTimeout(() => { if (!resolved) reject(new Error('vite dev server did not start in time')) }, 15000)
  })
}
async function dismissIntro(page) {
  const splash = page.locator('[data-testid="hero-splash"]')
  if (await splash.count() > 0 && await splash.isVisible().catch(() => false)) {
    await splash.click()
    await page.waitForTimeout(100)
  }
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await btn.click()
    await page.waitForTimeout(100)
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'owner-audit-v1', 'win-banner-stress')
mkdirSync(OUT_DIR, { recursive: true })

const STRESS_VALUES = [1000, 100000, 1000000]

async function main() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const baseUrl = `http://localhost:${port}`
  const results = []

  try {
    const browser = await chromium.launch()
    const context = await browser.newContext({ ...devices['iPhone 14'] })
    const page = await context.newPage()
    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await page.waitForFunction(() => window.__testStores?.balance, { timeout: 8000 })
    await dismissIntro(page)

    for (const value of STRESS_VALUES) {
      await page.evaluate((v) => {
        window.__testStores.balance.set(10_000_000)
        window.__testStores.betAmount.set(1)
        window.__testStores.winAmount.set(v)
      }, value)
      // Epic tier's count-up animation runs 2800ms (TIER_COUNT_UP_MS.epic)
      // before displayAmount reaches its final value - checking too early
      // reads a mid-animation partial number, not the true rendered text.
      await page.waitForTimeout(3200)

      const check = await page.evaluate((v) => {
        const el = document.querySelector('.c1-amount')
        if (!el) return { pass: false, reason: 'amount element not found' }
        const text = el.textContent ?? ''
        const overflows = el.scrollWidth > el.clientWidth + 1
        const expected = v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const containsFullValue = text.includes(expected)
        return { text, overflows, containsFullValue, pass: !overflows && containsFullValue }
      }, value)

      const screenshotPath = join(OUT_DIR, `epic-win-$${value}.png`)
      await page.screenshot({ path: screenshotPath })
      results.push({ value, ...check, screenshot: screenshotPath })
      console.log(`$${value}: ${JSON.stringify(check)}`)
    }

    await browser.close()
  } finally {
    server.kill()
  }

  const outPath = join(OUT_DIR, 'win-banner-stress-results.json')
  writeFileSync(outPath, JSON.stringify(results, null, 2))
  const pass = results.every((r) => r.pass)
  console.log(pass ? '\nWIN BANNER STRESS PROOF: ALL PASS' : '\nWIN BANNER STRESS PROOF: FAILURES DETECTED')
  process.exitCode = pass ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
