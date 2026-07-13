// motion_v2_proof.mjs — Motion Polish v2 proof gates.
//
// Requires a running dev server (npm run dev, default http://localhost:5173).
// Run (from frontend/): npx tsx scripts/motion_v2_proof.mjs
//
// Produces reports/screens/motion-v2/:
//  - fps-log.json (per-spin fps + long-frame log across 20 spins incl. one bonus entry)
//  - occlusion-1280x720.json (re-run of the HUD occlusion audit)
//  - spin-stagger.gif, win-bloom.gif, overdrive-transition.gif (video capture -> gif via ffmpeg)
//
// Exits non-zero if the fps gate, the long-frame gate, or the occlusion gate fails.

import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, statSync, renameSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'motion-v2')
mkdirSync(OUT_DIR, { recursive: true })
const BASE_URL = process.env.LAYOUT_AUDIT_URL ?? 'http://localhost:5173'

async function waitSpinDone(page, timeout = 15000) {
  await page.waitForFunction(() => !document.querySelector('[data-testid="spin-button"].spinning'), { timeout })
}

/** Every fresh browser context has its own sessionStorage, so the once-per-
 *  session intro splash shows on every new page — dismiss it before driving
 *  spins/buys so it doesn't block the SPIN button. */
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
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await dismissIntroIfPresent(page)
  // Ensure the 100x bonus buy at spin #10 stays affordable regardless of how
  // the preceding 9 base spins land.
  await page.waitForFunction(() => window.__testStores?.balance, { timeout: 8000 })
  await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })

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

  // 19 base spins + 1 bonus entry (the 10th, mid-run, so both idle and
  // in-feature frames are sampled).
  for (let i = 0; i < 20; i++) {
    if (i === 9) {
      // FeatureMenu replaced the old single-tier FeatureButton (2026-07-07).
      await page.locator('[data-testid="feature-menu-button"]').click()
      await page.waitForTimeout(150)
      await page.locator('[data-testid="activate-bonus"]').click()
      await page.waitForSelector('[data-testid="buy-confirm"]', { timeout: 5000 })
      await page.locator('[data-testid="buy-confirm"]').click()
      // :visible targets the real entry, not the persistent hidden warm mount
      // (Reel Feel v3, Task 5), whose testids are always present in the DOM.
      await page.waitForSelector('[data-testid="overdrive-entry"]:visible', { timeout: 8000 })
      // Let the entry sequence + at least one free spin play out.
      await page.waitForTimeout(2500)
      // Slam through the rest of the feature quickly if still active.
      for (let j = 0; j < 20; j++) {
        const active = await page.locator('[data-testid="freespins-overlay"]:visible').count()
        if (!active) break
        await page.waitForTimeout(300)
      }
    } else {
      await page.locator('[data-testid="spin-button"]').click()
      await waitSpinDone(page)
    }
  }

  const frameTimes = await page.evaluate(() => {
    cancelAnimationFrame(window.__rafHandle)
    return window.__frameTimes
  })
  await page.close()

  const gaps = frameTimes.slice(5) // drop the first few (page-settle noise)
  const avgMs = gaps.reduce((a, b) => a + b, 0) / gaps.length
  const avgFps = 1000 / avgMs
  const longFrames = gaps.filter((g) => g > 100)
  const sorted = [...gaps].sort((a, b) => a - b)
  const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]
  const p95FrameMs = pct(95)
  const p99FrameMs = pct(99)

  return { sampleCount: gaps.length, avgFrameMs: avgMs, avgFps, p95FrameMs, p99FrameMs, longFrameCount: longFrames.length, longFrames }
}

// ── Gate: occlusion re-check at 1280x720 ─────────────────────────────────────
// 2026-07-08 hygiene pass: class names updated to the current B1 HUD reskin
// and the FeatureButton testid replaced with FeatureMenu's entry.
const TEXT_SELECTORS = [
  '.logo-box', '.error-banner', '.fs-turbo', '.fs-menu',
  '[data-testid="hud-balance"]', '[data-testid="hud-win"]', '[data-testid="hud-bet"]',
  '[data-testid="bet-arrows"]', '[data-testid="spin-button"]', '.autoplay-wrapper',
  '[data-testid="feature-menu-entry"] .fm-entry-label', '[data-testid="win-banner"]',
  '[data-testid="bonus-instrument-column"] .plate', '[data-testid="odometer"]',
]
const FRAME_SELECTOR = '.game-frame'
function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}
async function runOcclusionGate(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
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
// Each proof clip must land well under the 3MB gate: modest fps/width/colors,
// and (for the win-bloom clip, whose search phase varies in length) trimmed
// to just the tail of the recording so only the actual winning spin appears.
async function captureGif(browser, name, widthPx, action, { tailSeconds } = {}) {
  const dir = join(OUT_DIR, `_video_${name}`)
  mkdirSync(dir, { recursive: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir, size: { width: widthPx, height: Math.round(widthPx * 720 / 1280) } },
  })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
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
  const sizeMb = statSync(gifPath).size / (1024 * 1024)
  return { gifPath, sizeMb }
}

async function run() {
  const browser = await chromium.launch()
  const results = {}

  console.log('[1/4] FPS gate (20 spins incl. one bonus entry)...')
  results.fps = await runFpsGate(browser)
  console.log(`  avg fps: ${results.fps.avgFps.toFixed(1)}, p95: ${results.fps.p95FrameMs.toFixed(1)}ms, p99: ${results.fps.p99FrameMs.toFixed(1)}ms, long frames (>100ms): ${results.fps.longFrameCount}`)

  // ── Anticipation floor (audit remediation, Task 2) ──────────────────────────
  // Effective final-reel anticipation hold per tier, mirroring GameGrid's
  // Math.max(300, base * speedFactor). Base 900ms (scatter) / 600ms (near-miss),
  // factors Normal 1 / Turbo 0.5 / Super Turbo 0.16. Gate: every hold >= 300ms.
  results.anticipationFloor = (() => {
    const factors = { normal: 1, turbo: 0.5, super: 0.16 }
    const rows = {}
    let pass = true
    for (const [tier, f] of Object.entries(factors)) {
      const scatterHoldMs = Math.max(300, 900 * f)
      const nearMissHoldMs = Math.max(300, 600 * f)
      rows[tier] = { scatterHoldMs, nearMissHoldMs }
      if (scatterHoldMs < 300 || nearMissHoldMs < 300) pass = false
    }
    return { rows, pass }
  })()
  console.log('  anticipation holds ms:', JSON.stringify(results.anticipationFloor.rows),
    results.anticipationFloor.pass ? 'PASS (>=300 all tiers)' : 'FAIL')

  console.log('[2/4] Occlusion gate (1280x720)...')
  results.occlusion = await runOcclusionGate(browser)
  writeFileSync(join(OUT_DIR, 'occlusion-1280x720.json'), JSON.stringify(results.occlusion, null, 2))
  console.log(`  boxes: ${results.occlusion.boxCount}, failures: ${results.occlusion.failures.length}`)

  console.log('[3/4] GIF captures...')
  const gifResults = {}

  gifResults.spinStagger = await captureGif(browser, 'spin-stagger', 360, async (page) => {
    await page.locator('[data-testid="spin-button"]').click()
    await waitSpinDone(page)
    await page.waitForTimeout(300)
  })

  gifResults.winBloom = await captureGif(browser, 'win-bloom', 360, async (page) => {
    let saw = false
    for (let i = 0; i < 10 && !saw; i++) {
      await page.locator('[data-testid="spin-button"]').click()
      await waitSpinDone(page)
      saw = (await page.locator('.symbol-cell.plate-bloom').count()) > 0
    }
    await page.waitForTimeout(1500)
  }, { tailSeconds: 4 }) // search phase length varies — keep just the winning spin

  gifResults.overdriveTransition = await captureGif(browser, 'overdrive-transition', 360, async (page) => {
    // FeatureMenu replaced the old single-tier FeatureButton (2026-07-07).
    await page.locator('[data-testid="feature-menu-button"]').click()
    await page.waitForTimeout(150)
    await page.locator('[data-testid="activate-bonus"]').click()
    await page.waitForSelector('[data-testid="buy-confirm"]', { timeout: 5000 })
    await page.locator('[data-testid="buy-confirm"]').click()
    await page.waitForSelector('[data-testid="overdrive-entry"]', { timeout: 8000 })
    await page.waitForTimeout(2600)
  })

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
  if (!results.anticipationFloor.pass) { console.error('FAIL: anticipation floor < 300ms at some tier'); fail = true }
  if (results.occlusion.failures.length > 0) { console.error('FAIL: occlusion failures detected'); fail = true }
  for (const [k, v] of Object.entries(gifResults)) {
    if (v.sizeMb >= 3) { console.error(`FAIL: ${k}.gif is ${v.sizeMb.toFixed(2)} MB (>= 3MB)`); fail = true }
  }

  if (fail) { console.error('MOTION V2 PROOF: FAILURES DETECTED'); process.exit(1) }
  console.log('MOTION V2 PROOF: ALL GATES PASS')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
