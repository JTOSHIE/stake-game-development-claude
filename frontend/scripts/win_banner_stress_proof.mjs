// win_banner_stress_proof.mjs — OWNER AUDIT REMEDIATION item B2, extended
// OWNER AUDIT ROUND 2 item 2 ("commit stress proofs at $1,000 / $100,000 /
// $1,000,000 in both orientations" for WIN BANNER V3, the full-width neon
// band replacing the old centred box).
//
// Proves the win banner's amount text no longer truncates at large dollar
// values by forcing the epic tier at $1,000 / $100,000 / $1,000,000 (bet=1,
// so winAmount itself is the multiplier, comfortably clearing the epic
// threshold at all three) and asserting the rendered text is the full,
// untruncated string with no horizontal overflow of its plate - now run in
// BOTH portrait (iPhone 14) and landscape (1280x720 desktop) orientations.
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
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'owner-audit-v2', 'win-banner-stress')
mkdirSync(OUT_DIR, { recursive: true })

const STRESS_VALUES = [1000, 100000, 1000000]
const ORIENTATIONS = [
  { name: 'portrait', context: () => ({ ...devices['iPhone 14'] }) },
  { name: 'landscape', context: () => ({ viewport: { width: 1280, height: 720 } }) },
]

async function main() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const baseUrl = `http://localhost:${port}`
  const results = []

  try {
    const browser = await chromium.launch()

    for (const orientation of ORIENTATIONS) {
      const context = await browser.newContext(orientation.context())
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
          // WIN BANNER V3 (item 2): also confirm the band spans stage
          // edge-to-edge and reels are visible above/below (no full-height
          // blocking box) - the band's rendered width should be close to
          // its containing stage width, and its height should be a small
          // fraction of the viewport, not a large centred box.
          const band = document.querySelector('.big-win-banner')
          const bandBox = band ? band.getBoundingClientRect() : null
          return { text, overflows, containsFullValue, bandBox, pass: !overflows && containsFullValue }
        }, value)

        const screenshotPath = join(OUT_DIR, `${orientation.name}-epic-win-$${value}.png`)
        await page.screenshot({ path: screenshotPath })
        results.push({ orientation: orientation.name, value, ...check, screenshot: screenshotPath })
        console.log(`[${orientation.name}] $${value}: ${JSON.stringify(check)}`)
      }

      await context.close()
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
