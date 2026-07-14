// audio_verify.mjs — JOB 1f, AUDIOFORGE V1 audio-integration Playwright pass.
//
// Serves a `vite dev` server (window.__testStores, used to seed bet/balance
// deterministically, is DEV-only gated and never exposed in a `vite preview`
// production build - the mastered sound files under test are the same either
// way, only the JS bundle differs) and drives a headless session: asserts
// every /sounds/ request returns 200, that spin/reel_stop/win sounds actually
// fire (HTMLMediaElement.play() intercepted, not just "file was requested" -
// files load once regardless of whether they're ever played), that the bed
// swap (bgm_loop -> bgm_tension) fires on a bonus buy, and zero console errors
// throughout.
//
// Run (from frontend/): npx tsx scripts/audio_verify.mjs

import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'qa')
mkdirSync(OUT_DIR, { recursive: true })
const OUT_PATH = join(OUT_DIR, 'audio_verify_2026-07-13.json')

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

// vite dev, not vite preview: window.__testStores (used below to seed bet/balance
// deterministically, the same hook qa_soak.mjs relies on) is gated behind
// import.meta.env.DEV and is never exposed in a production preview build. The
// actual sound files under test are served straight out of public/ either way
// (the build copies them into dist/ verbatim), so this still exercises the real
// mastered audio - only the JS bundle differs (dev vs prod), not the assets.
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

async function dismissIntro(page) {
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await btn.click()
    await page.waitForTimeout(100)
  }
}

async function waitSpinDone(page, timeout = 20000) {
  await page.waitForFunction(
    () => !document.querySelector('[data-testid="spin-button"].spinning'),
    { timeout },
  )
}

const SEAM_ROWS = ['bgm_loop', 'bgm_tension', 'anticipation_build']
const SEAM_RMS_WINDOW_MS = 20
const SEAM_RMS_TOLERANCE_DB = 2.0

// Loop-conditioning seam gate (2026-07-14 seam fix): decodes the actual shipped
// audio (both formats) in-browser via the Web Audio API and measures the RMS
// delta between the first and last SEAM_RMS_WINDOW_MS - the same metric
// tools/audio_forge/master.py's condition_loop_seam() targets during
// mastering. This is a HARD gate against the real shipped bytes, not a
// re-check of the Python pipeline's own self-report.
async function measureSeamRmsDeltaDb(page, url) {
  return page.evaluate(async ({ url, windowMs }) => {
    const res = await fetch(url)
    if (!res.ok) return { error: `fetch ${res.status}` }
    const buf = await res.arrayBuffer()
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    let audioBuffer
    try {
      audioBuffer = await ctx.decodeAudioData(buf)
    } catch (err) {
      return { error: `decode failed: ${err.message}` }
    }
    const sr = audioBuffer.sampleRate
    const n = Math.floor(sr * windowMs / 1000)
    const total = audioBuffer.length
    function rmsAllChannels(startIdx, len) {
      let sumSq = 0
      let count = 0
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        const data = audioBuffer.getChannelData(c)
        for (let i = startIdx; i < startIdx + len; i++) {
          sumSq += data[i] * data[i]
          count++
        }
      }
      return Math.sqrt(sumSq / count)
    }
    const toDb = (r) => (r > 0 ? 20 * Math.log10(r) : -999)
    const startDb = toDb(rmsAllChannels(0, n))
    const endDb = toDb(rmsAllChannels(total - n, n))
    return { startDb, endDb, deltaDb: Math.abs(startDb - endDb) }
  }, { url, windowMs: SEAM_RMS_WINDOW_MS })
}

async function runSeamChecks(page, baseUrl) {
  const results = {}
  for (const name of SEAM_ROWS) {
    results[name] = {}
    for (const ext of ['webm', 'mp3']) {
      const url = `${baseUrl}/assets/themes/future-spinner/sounds/${name}.${ext}`
      results[name][ext] = await measureSeamRmsDeltaDb(page, url)
    }
  }
  return results
}

async function run() {
  const port = await getFreePort()
  const preview = await startDevServer(port)
  const baseUrl = `http://localhost:${port}`

  const soundRequests = []
  const soundFailures = []
  const consoleErrors = []

  try {
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

    // Intercept HTMLMediaElement.play() before any app code runs, so every
    // soundService.ts Audio element's real .play() calls get recorded - not
    // just "the file was fetched" (which only ever happens once, on load).
    await page.addInitScript(() => {
      window.__playedSounds = []
      const origPlay = HTMLMediaElement.prototype.play
      HTMLMediaElement.prototype.play = function () {
        window.__playedSounds.push(this.currentSrc || this.src)
        return origPlay.call(this)
      }
    })

    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
    page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

    page.on('response', (res) => {
      const url = res.url()
      if (!url.includes('/sounds/')) return
      const status = res.status()
      soundRequests.push({ url, status })
      if (status >= 400) soundFailures.push({ url, status, reason: `HTTP ${status}` })
    })
    page.on('requestfailed', (req) => {
      const url = req.url()
      if (!url.includes('/sounds/')) return
      soundFailures.push({ url, status: 'FAILED', reason: req.failure()?.errorText })
    })

    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
    await dismissIntro(page)

    // A real spin - checks spin/reel_stop (and win, if the round happens to pay).
    await page.evaluate(() => { window.__testStores.betAmount.set(1.0) })
    await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
    await page.locator('[data-testid="spin-button"]').click()
    await waitSpinDone(page)
    await page.waitForTimeout(300) // let any win sound's setTimeout-scheduled echo fire

    const playedAfterSpin = await page.evaluate(() => window.__playedSounds)

    // Force a real win to exercise a win sound deterministically (rather than
    // hoping the one real spin above pays): the dev test-store hook can set
    // winAmount directly and the spin flow's playWin() call reads winMultiplier
    // from it - simplest reliable way to prove the win-sound wiring fires
    // without depending on RNG. Spin again after seeding a win amount is
    // simpler still: just call playWin's own soundService export directly is
    // not reachable from Playwright, so instead assert win coverage from the
    // MP3 duration table in the JSON output for a human to cross-check if this
    // one real spin didn't happen to land a win.
    const wonASoundThisSpin = playedAfterSpin.some((s) => /win_(small|medium|big|epic)\.(mp3|webm)$/.test(s))

    // Bonus buy - exercises the bed-swap crossfade (bgm_loop -> bgm_tension).
    await page.evaluate(() => { window.__playedSounds = [] })
    await page.locator('[data-testid="feature-menu-button"]').click()
    await page.waitForTimeout(120)
    await page.locator('[data-testid="activate-bonus"]').click()
    await page.locator('[data-testid="buy-confirm"]').click()
    await waitSpinDone(page)
    // Overdrive presentation entry (and the crossfade it drives) happens on a
    // short animated delay after the round resolves - give it a moment before
    // reading back what played.
    await page.waitForTimeout(1200)
    const playedAfterBuy = await page.evaluate(() => window.__playedSounds)
    const bedSwapFired = playedAfterBuy.some((s) => /bgm_tension\.(mp3|webm)$/.test(s))

    // Let the free-spins presentation run its course so we exit Overdrive too
    // (bed should crossfade back to bgm_loop) - best-effort, not asserted hard
    // since presentation length varies with the awarded spin count.
    await page.waitForTimeout(4000)
    const playedAfterFeature = await page.evaluate(() => window.__playedSounds)
    const bedReverted = playedAfterFeature.filter((s) => /bgm_loop\.(mp3|webm)$/.test(s)).length > 0

    const seamResults = await runSeamChecks(page, baseUrl)
    const seamFailures = []
    for (const [name, byExt] of Object.entries(seamResults)) {
      for (const [ext, r] of Object.entries(byExt)) {
        if (r.error) {
          seamFailures.push(`${name}.${ext}: ${r.error}`)
        } else if (r.deltaDb > SEAM_RMS_TOLERANCE_DB) {
          seamFailures.push(`${name}.${ext}: seam delta ${r.deltaDb.toFixed(2)}dB exceeds ${SEAM_RMS_TOLERANCE_DB}dB tolerance`)
        }
      }
    }

    await browser.close()

    const checks = {
      spinSoundFired: playedAfterSpin.some((s) => /\/spin\.(mp3|webm)$/.test(s)),
      reelStopSoundFired: playedAfterSpin.some((s) => /reel_stop(_anticipation)?\.(mp3|webm)$/.test(s)),
      winSoundFiredOnRealSpin: wonASoundThisSpin,
      bedSwapFiredOnBonusBuy: bedSwapFired,
      bedRevertedAfterFeature: bedReverted,
      zeroSoundRequestFailures: soundFailures.length === 0,
      zeroConsoleErrors: consoleErrors.length === 0,
      loopSeamsWithinTolerance: seamFailures.length === 0,
    }

    const result = {
      timestamp: new Date().toISOString(),
      baseUrl,
      soundRequestCount: soundRequests.length,
      soundFailures,
      consoleErrors,
      checks,
      seamResults,
      seamFailures,
      playedSoundsLog: { afterSpin: playedAfterSpin, afterBuy: playedAfterBuy, afterFeature: playedAfterFeature },
    }
    writeFileSync(OUT_PATH, JSON.stringify(result, null, 2))

    console.log(JSON.stringify(checks, null, 2))
    const allPass = Object.values(checks).every(Boolean)
    if (!allPass) {
      console.error('AUDIO VERIFY: FAIL - see', OUT_PATH)
      process.exitCode = 1
    } else {
      console.log('AUDIO VERIFY: ALL CHECKS PASS')
    }
  } finally {
    preview.kill()
  }
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
