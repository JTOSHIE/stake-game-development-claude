// reel_v3_proof.mjs — Reel Feel v3 motion proof gates.
//
// Requires a running dev server (npm run dev, default http://localhost:5173).
// Run (from frontend/): npx tsx scripts/reel_v3_proof.mjs
//
// Produces reports/screens/reel-v3/:
//  - fps-log.json (per-frame fps + long-frame log across 20 spins incl. one bonus entry)
//  - occlusion-1280x720.json (re-run of the HUD occlusion audit)
//  - strip-cycle.gif, drop-cycle.gif, idle-charge.gif (video capture -> gif via ffmpeg)
//
// Gates (exit non-zero on any): avg fps >= 55, ZERO frames over 100ms (hard),
// occlusion clean, every gif < 3MB. p95/p99 reported.
//
// Note: the persistent hidden Overdrive warm mount means [data-testid=...] for
// the entry/overlay always exist in the DOM, so all bonus detection here uses
// :visible to target the real (visible) instance only.

import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'reel-v3')
mkdirSync(OUT_DIR, { recursive: true })
const BASE_URL = process.env.LAYOUT_AUDIT_URL ?? 'http://localhost:5173'

async function waitSpinDone(page, timeout = 15000) {
  await page.waitForFunction(() => !document.querySelector('.spin-btn.spinning'), { timeout })
}
async function dismissIntroIfPresent(page) {
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await btn.click()
    await page.waitForTimeout(100)
  }
}

// ── Gate: fps across 20 spins including a bonus entry ───────────────────────
async function runFpsGate(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('.spin-btn', { timeout: 15000 })
  await dismissIntroIfPresent(page)

  await page.evaluate(() => {
    window.__frameTimes = []
    let last = performance.now()
    function tick(t) {
      window.__frameTimes.push(t - last)
      last = t
      window.__rafHandle = requestAnimationFrame(tick)
    }
    window.__rafHandle = requestAnimationFrame(tick)
  })

  for (let i = 0; i < 20; i++) {
    if (i === 9) {
      await page.locator('[data-testid="feature-button"] button').click()
      await page.waitForSelector('[data-testid="buy-confirm"]', { timeout: 5000 })
      await page.locator('[data-testid="buy-confirm"]').click()
      // :visible targets the real entry, not the persistent warm mount.
      await page.locator('[data-testid="overdrive-entry"]:visible').waitFor({ timeout: 8000 })
      await page.waitForTimeout(2500)
      for (let j = 0; j < 25; j++) {
        const active = await page.locator('[data-testid="freespins-overlay"]:visible').count()
        if (!active) break
        await page.waitForTimeout(300)
      }
    } else {
      await page.locator('.spin-btn').click()
      await waitSpinDone(page)
    }
  }

  const frameTimes = await page.evaluate(() => {
    cancelAnimationFrame(window.__rafHandle)
    return window.__frameTimes
  })
  await page.close()

  const gaps = frameTimes.slice(5)
  const avgMs = gaps.reduce((a, b) => a + b, 0) / gaps.length
  const avgFps = 1000 / avgMs
  const longFrames = gaps.filter((g) => g > 100)
  const sorted = [...gaps].sort((a, b) => a - b)
  const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]
  return {
    sampleCount: gaps.length, avgFrameMs: avgMs, avgFps,
    p95FrameMs: pct(95), p99FrameMs: pct(99),
    maxFrameMs: sorted[sorted.length - 1],
    longFrameCount: longFrames.length, longFrames,
  }
}

// ── Gate: occlusion re-check at 1280x720 ─────────────────────────────────────
const TEXT_SELECTORS = [
  '.logo-box', '.error-banner', '.turbo-btn', '.hamburger-btn',
  '.balance-box', '.win-box', '.bet-box', '.bet-arrows', '.spin-btn', '.autoplay-wrapper',
  '[data-testid="feature-button"] .feature-label', '[data-testid="win-banner"]',
  '[data-testid="bonus-instrument-column"] .plate', '[data-testid="odometer"]',
]
const FRAME_SELECTOR = '.game-frame'
function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}
async function runOcclusionGate(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('.spin-btn', { timeout: 15000 })
  await dismissIntroIfPresent(page)
  await page.waitForTimeout(500)
  const boxes = []
  for (const sel of [...TEXT_SELECTORS, FRAME_SELECTOR]) {
    const els = await page.locator(sel).all()
    for (const el of els) {
      if (!(await el.isVisible())) continue
      const box = await el.boundingBox()
      if (box) boxes.push({ selector: sel, box })
    }
  }
  await page.close()
  const frameBoxes = boxes.filter((b) => b.selector === FRAME_SELECTOR)
  const textBoxes = boxes.filter((b) => b.selector !== FRAME_SELECTOR)
  const failures = []
  for (let i = 0; i < textBoxes.length; i++) {
    for (let j = i + 1; j < textBoxes.length; j++) {
      if (intersects(textBoxes[i].box, textBoxes[j].box)) failures.push({ a: textBoxes[i].selector, b: textBoxes[j].selector })
    }
    for (const f of frameBoxes) {
      if (intersects(textBoxes[i].box, f.box)) failures.push({ a: textBoxes[i].selector, b: FRAME_SELECTOR })
    }
  }
  return { boxCount: boxes.length, failures }
}

// ── GIF captures ──────────────────────────────────────────────────────────
async function captureGif(browser, name, widthPx, url, action, { tailSeconds } = {}) {
  const dir = join(OUT_DIR, `_video_${name}`)
  mkdirSync(dir, { recursive: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir, size: { width: widthPx, height: Math.round(widthPx * 720 / 1280) } },
  })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForSelector('.spin-btn', { timeout: 15000 })
  await dismissIntroIfPresent(page)
  await action(page)
  const video = page.video()
  await page.close()
  await context.close()
  const rawPath = await video.path()

  let videoPath = rawPath
  if (tailSeconds) {
    videoPath = join(dir, 'trimmed.webm')
    execFileSync('ffmpeg', ['-y', '-sseof', `-${tailSeconds}`, '-i', rawPath, '-c', 'copy', videoPath])
  }

  const gifPath = join(OUT_DIR, `${name}.gif`)
  const palettePath = join(dir, 'palette.png')
  const FPS = 9
  const MAX_COLORS = 96
  execFileSync('ffmpeg', ['-y', '-i', videoPath, '-vf', `fps=${FPS},scale=${widthPx}:-1:flags=lanczos,palettegen=max_colors=${MAX_COLORS}`, palettePath])
  execFileSync('ffmpeg', ['-y', '-i', videoPath, '-i', palettePath, '-filter_complex', `fps=${FPS},scale=${widthPx}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer`, gifPath])
  return { gifPath, sizeMb: statSync(gifPath).size / (1024 * 1024) }
}

async function run() {
  const browser = await chromium.launch()
  const results = {}

  console.log('[1/4] FPS gate (20 spins incl. one bonus entry)...')
  results.fps = await runFpsGate(browser)
  console.log(`  avg fps: ${results.fps.avgFps.toFixed(1)}, p95: ${results.fps.p95FrameMs.toFixed(1)}ms, p99: ${results.fps.p99FrameMs.toFixed(1)}ms, max: ${results.fps.maxFrameMs.toFixed(1)}ms, long frames (>100ms): ${results.fps.longFrameCount}`)

  console.log('[2/4] Occlusion gate (1280x720)...')
  results.occlusion = await runOcclusionGate(browser)
  writeFileSync(join(OUT_DIR, 'occlusion-1280x720.json'), JSON.stringify(results.occlusion, null, 2))
  console.log(`  boxes: ${results.occlusion.boxCount}, failures: ${results.occlusion.failures.length}`)

  console.log('[3/4] GIF captures (strip / drop / idle+charge)...')
  const gifResults = {}

  gifResults.stripCycle = await captureGif(browser, 'strip-cycle', 360, `${BASE_URL}/?fs_reel_mode=strip`, async (page) => {
    await page.locator('.spin-btn').click()
    await waitSpinDone(page)
    await page.waitForTimeout(400)
  })

  gifResults.dropCycle = await captureGif(browser, 'drop-cycle', 360, `${BASE_URL}/?fs_reel_mode=drop`, async (page) => {
    await page.locator('.spin-btn').click()
    await waitSpinDone(page)
    await page.waitForTimeout(400)
  })

  // idle + charge: spin until a win blooms, then linger so the win charge/bloom
  // and the settled-tile idle animations are captured.
  gifResults.idleCharge = await captureGif(browser, 'idle-charge', 360, `${BASE_URL}/?fs_reel_mode=strip`, async (page) => {
    let saw = false
    for (let i = 0; i < 12 && !saw; i++) {
      await page.locator('.spin-btn').click()
      await waitSpinDone(page)
      saw = (await page.locator('.symbol-cell.plate-bloom').count()) > 0
    }
    await page.waitForTimeout(2200)
  }, { tailSeconds: 4 })

  for (const [k, v] of Object.entries(gifResults)) {
    console.log(`  ${k}: ${v.gifPath} (${v.sizeMb.toFixed(2)} MB)`)
  }
  results.gifs = gifResults
  await browser.close()

  console.log('[4/4] Writing fps-log.json...')
  writeFileSync(join(OUT_DIR, 'fps-log.json'), JSON.stringify(results.fps, null, 2))
  writeFileSync(join(OUT_DIR, 'proof-summary.json'), JSON.stringify(results, null, 2))

  let fail = false
  if (results.fps.avgFps < 55) { console.error(`FAIL: avg fps ${results.fps.avgFps.toFixed(1)} < 55`); fail = true }
  if (results.fps.longFrameCount > 0) { console.error(`FAIL: ${results.fps.longFrameCount} frame(s) over 100ms`); fail = true }
  if (results.occlusion.failures.length > 0) { console.error('FAIL: occlusion failures detected'); fail = true }
  for (const [k, v] of Object.entries(gifResults)) {
    if (v.sizeMb >= 3) { console.error(`FAIL: ${k}.gif is ${v.sizeMb.toFixed(2)} MB (>= 3MB)`); fail = true }
  }

  if (fail) { console.error('REEL V3 PROOF: FAILURES DETECTED'); process.exit(1) }
  console.log('REEL V3 PROOF: ALL GATES PASS')
}

run().catch((err) => { console.error(err); process.exit(1) })
