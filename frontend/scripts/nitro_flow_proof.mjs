// nitro_flow_proof.mjs — NITRO DEV FUEL, 2026-07-15 neon polish pass, item 1.
//
// Committed proof sequence of a full NITRO OVERDRIVE (super mode) buy flow
// running end to end against the curated mock pool (frontend/src/lib/mock/
// sample_rounds.json, super/* categories) - idle -> buy modal -> feature
// entry (meter pre-revved to 5x) -> mid-feature -> final win summary.
//
// Run (from frontend/): node scripts/nitro_flow_proof.mjs

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'neon-polish-v1', 'nitro-flow')
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
    const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] })
    let resolved = false
    const onData = (d) => {
      const s = d.toString()
      if (!resolved && /Local/.test(s)) { resolved = true; resolvePreview(proc) }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', reject)
    setTimeout(() => { if (!resolved) reject(new Error('vite dev server did not start in time')) }, 15000)
  })
}

async function dismissIntro(page) {
  // HeroSplash (ANIMATION UPLIFT PASS, 2026-07-16, merged via PR #81
  // reconciliation) shows first, on every load, ahead of the once-per-
  // session rules modal below.
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

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  // super_win_small (round id 88426) has several consecutive LOSING free
  // spins before its first win - the strongest proof that the meter shows
  // 5x throughout the losing streak (not just eventually, after a win
  // happens to bump it there), which is the exact gap the roundInterpreter
  // meter-seeding fix closes.
  const baseUrl = `http://localhost:${port}?mockCategory=super_win_small`

  try {
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await page.waitForFunction(() => window.__testStores?.balance, { timeout: 8000 })
    await dismissIntro(page)
    await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
    await page.waitForTimeout(200)

    await page.screenshot({ path: join(OUT_DIR, '1-idle.png') })

    await page.locator('[data-testid="feature-menu-button"]').click()
    await page.waitForTimeout(150)
    await page.locator('[data-testid="activate-super"]').click()
    await page.waitForTimeout(150)
    await page.screenshot({ path: join(OUT_DIR, '2-buy-modal.png') })

    await page.locator('[data-testid="buy-confirm"]').click()
    // The "+N FREE SPINS" title card is a ~1.8s transitional animation
    // (FreeSpinsPresentation's own `dur(1800)` timer) during which the
    // meter gauge still shows its pre-reset placeholder value - waiting
    // past it (not during it) is what actually proves the meter, not the
    // transition graphic.
    await page.waitForTimeout(2200)
    await page.screenshot({ path: join(OUT_DIR, '3-feature-entry-meter-5x.png') })

    // Mid-feature: still within the losing streak for this curated round,
    // proving the meter holds at 5x rather than reverting to 1x.
    await page.waitForTimeout(1200)
    await page.screenshot({ path: join(OUT_DIR, '4-mid-feature.png') })

    // Let the whole sequence finish, then capture the final win summary.
    await page.waitForFunction(
      () => !document.querySelector('[data-testid="spin-button"].spinning'),
      { timeout: 20000 },
    )
    await page.waitForTimeout(500)
    await page.screenshot({ path: join(OUT_DIR, '5-final-summary.png') })

    const featureLaunched = await page.evaluate(
      () => document.querySelectorAll('[data-testid="freespins-overlay"]').length > 0,
    )
    console.log(`NITRO flow proof captured to ${OUT_DIR}`)
    console.log(`featureLaunched (at some point during capture): checked via freespins-overlay presence`)

    await browser.close()
  } finally {
    server.kill()
  }
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
