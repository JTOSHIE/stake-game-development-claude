// spin_click_warmup_recheck.mjs — 2026-07-14 seam/warm-up fix, ITEM 0.
//
// Focused re-check of the frame-gate attribution specifically around early
// spin-clicks, reusing the exact same FPS-sampling/logAction/
// attributeLongFrames methodology as qa_soak.mjs's frame gate (JOB 2), rather
// than re-running the full 25-30 minute soak matrix. The baseline this
// compares against is reports/qa/frame-gate-attribution-2026-07-13.json: 5
// long frames total, 4 attributed to spin-click at 200-300ms delta, 3 of
// which land within the first ~3s of their session (i.e. at or near the
// FIRST spin click) - exactly the cold-start window the first-gesture
// warm-up targets.
//
// Run (from frontend/): npx tsx scripts/spin_click_warmup_recheck.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'qa')
mkdirSync(OUT_DIR, { recursive: true })
const OUT_PATH = join(OUT_DIR, 'spin-click-warmup-recheck-2026-07-14.json')

const SPIN_COUNT = 15 // covers the early-session window the baseline's cluster sat in

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

function attributeLongFrames(frameSamples, actionLog, thresholdMs = 100) {
  const longFrames = frameSamples.filter((f) => f.gap > thresholdMs)
  return longFrames.map((f) => {
    let nearest = null
    let nearestDelta = Infinity
    for (const a of actionLog) {
      const delta = Math.abs(a.t - f.t)
      if (delta < nearestDelta) {
        nearestDelta = delta
        nearest = a
      }
    }
    return {
      tMs: Math.round(f.t),
      gapMs: Math.round(f.gap * 10) / 10,
      nearestEvent: nearest?.event ?? null,
      deltaToEventMs: nearest ? Math.round(nearestDelta) : null,
    }
  })
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const baseUrl = `http://localhost:${port}`

  try {
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    const consoleErrors = []
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
    page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })

    await page.evaluate(() => {
      window.__fpsSamples = []
      window.__actionLog = []
      let last = performance.now()
      function tick(t) {
        window.__fpsSamples.push({ t, gap: t - last })
        last = t
        window.__fpsHandle = requestAnimationFrame(tick)
      }
      window.__fpsHandle = requestAnimationFrame(tick)
    })

    const intro = page.locator('[data-testid="intro-continue"]')
    if (await intro.count() > 0 && await intro.isVisible().catch(() => false)) {
      // Dismissing the intro IS the first real user gesture in the normal
      // flow - this is what should fire warmUpAudio() before the first spin.
      await page.evaluate((e) => { window.__actionLog.push({ event: e, t: performance.now() }) }, 'intro-dismiss-gesture')
      await intro.click()
      await page.waitForTimeout(100)
    }

    await page.evaluate(() => { window.__testStores.betAmount.set(1.0) })
    await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })

    for (let i = 0; i < SPIN_COUNT; i++) {
      await page.evaluate((e) => { window.__actionLog.push({ event: e, t: performance.now() }) }, `spin-click-${i}`)
      await page.locator('[data-testid="spin-button"]').click()
      await page.waitForFunction(() => !document.querySelector('[data-testid="spin-button"].spinning'), { timeout: 15000 })
      await page.waitForTimeout(150)
    }

    const frameSamples = await page.evaluate(() => {
      cancelAnimationFrame(window.__fpsHandle)
      return window.__fpsSamples
    })
    const actionLog = await page.evaluate(() => window.__actionLog)

    await browser.close()

    const longFrames = attributeLongFrames(frameSamples.slice(5), actionLog)
    const spinClickAttributed = longFrames.filter((f) => f.nearestEvent?.startsWith('spin-click'))
    const firstThreeSecondFrames = longFrames.filter((f) => f.tMs < 3000)

    const result = {
      timestamp: new Date().toISOString(),
      spinCount: SPIN_COUNT,
      totalFrameSamples: frameSamples.length,
      consoleErrors,
      longFrames,
      spinClickAttributedCount: spinClickAttributed.length,
      firstThreeSecondFrameCount: firstThreeSecondFrames.length,
      baselineForComparison: {
        source: 'reports/qa/frame-gate-attribution-2026-07-13.json (JOB 2, pre-warm-up)',
        totalLongFrames: 5,
        spinClickAttributedCount: 4,
        firstThreeSecondFrameCount: 2,
      },
    }
    writeFileSync(OUT_PATH, JSON.stringify(result, null, 2))
    console.log(JSON.stringify(result, null, 2))
  } finally {
    server.kill()
  }
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
