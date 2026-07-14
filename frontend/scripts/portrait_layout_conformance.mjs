// portrait_layout_conformance.mjs — PORTRAIT LAYOUT PASS, 2026-07-14.
//
// Permanent mobile conformance suite: Playwright device descriptors
// (isMobile true), iPhone 14 + Pixel 7, portrait AND landscape each.
//   - committed screenshots: idle, spin, win, buy modal, paytable,
//     OVERBOOST-active -> reports/screens/portrait-v1/<device>-<orientation>/
//   - touch-target audit: every visible interactive element (button,
//     [role=button], input, a[href], [tabindex]) asserts effective
//     (post-scale) bounding box >= 44px on both dimensions.
//   - font-legibility assert: computed font-size on the portrait HUD's own
//     text elements >= 11px rendered (landscape's pre-existing sub-11px
//     .fs-label/.audio-label text is sampled and reported, NOT gated - a
//     disclosed, out-of-scope finding predating this pass, see the session
//     report).
//   - frame-gate: re-run of the long-frame (>100ms) check across several
//     spins on the mobile (touch, device-scale-factor) profile.
//
// Run (from frontend/): node scripts/portrait_layout_conformance.mjs

import { chromium, devices } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'qa')
const SCREENS_ROOT = join(__dirname, '..', '..', 'reports', 'screens', 'portrait-v1')
mkdirSync(OUT_DIR, { recursive: true })
mkdirSync(SCREENS_ROOT, { recursive: true })

const DEVICE_PROFILES = [
  { label: 'iphone14', portrait: 'iPhone 14', landscape: 'iPhone 14 landscape' },
  { label: 'pixel7', portrait: 'Pixel 7', landscape: 'Pixel 7 landscape' },
]

const TOUCH_TARGET_MIN = 44
const FONT_MIN = 11
const LONG_FRAME_MS = 100

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

async function waitTestStores(page) {
  await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
}

/** Enumerate every visible interactive element and its post-scale bounding
 *  box. Returns [{selector, testid, w, h, pass}]. */
async function auditTouchTargets(page) {
  return page.evaluate((MIN) => {
    const els = Array.from(document.querySelectorAll(
      'button, [role="button"], input, a[href], [tabindex]:not([tabindex="-1"])',
    ))
    return els
      .filter((el) => {
        const r = el.getBoundingClientRect()
        const style = getComputedStyle(el)
        // Excludes PixiJS's own off-screen accessibility helper button
        // (rendered at top:-1000px by its internal AccessibilityManager) and
        // anything else parked outside the true viewport - not a reachable
        // touch target for a real user regardless of its box size.
        const onScreen = r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth
        return r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && onScreen
      })
      .map((el) => {
        const r = el.getBoundingClientRect()
        return {
          testid: el.getAttribute('data-testid') || null,
          label: el.getAttribute('aria-label') || el.textContent?.trim()?.slice(0, 24) || null,
          tag: el.tagName.toLowerCase(),
          w: Math.round(r.width * 10) / 10,
          h: Math.round(r.height * 10) / 10,
          pass: r.width >= MIN && r.height >= MIN,
        }
      })
  }, TOUCH_TARGET_MIN)
}

/** Sample computed font-size on the portrait HUD's own text elements. */
async function auditPortraitFontSizes(page) {
  return page.evaluate((MIN) => {
    const selectors = [
      '.p-stat-label', '.p-stat-value', '.p-spin-txt', '.p-tier',
      '.p-max-cap', '.p-fm-entry-label', '.p-fm-entry-active', '.p-mode-badge',
    ]
    const out = []
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((el) => {
        const size = parseFloat(getComputedStyle(el).fontSize)
        out.push({ selector: sel, text: el.textContent?.trim()?.slice(0, 20) ?? '', fontSizePx: size, pass: size >= MIN })
      })
    }
    return out
  }, FONT_MIN)
}

/** Diagnostic-only sample of known pre-existing sub-11px landscape text -
 *  not gated this pass (see session report), reported for visibility. */
async function sampleLandscapeSmallText(page) {
  return page.evaluate(() => {
    const out = []
    for (const sel of ['.fs-label', '.audio-label']) {
      document.querySelectorAll(sel).forEach((el) => {
        out.push({ selector: sel, fontSizePx: parseFloat(getComputedStyle(el).fontSize) })
      })
    }
    return out
  })
}

async function runFrameGate(page) {
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
  await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
  for (let i = 0; i < 5; i++) {
    await page.locator('[data-testid="spin-button"]').click()
    await waitSpinDone(page)
    await page.waitForTimeout(120)
  }
  const frameTimes = await page.evaluate(() => {
    cancelAnimationFrame(window.__rafHandle)
    return window.__frameTimes
  })
  const longFrames = frameTimes.filter((t) => t > LONG_FRAME_MS)
  return { sampleCount: frameTimes.length, longFrameCount: longFrames.length, longFrames, pass: longFrames.length === 0 }
}

async function runProfile(browser, baseUrl, deviceLabel, orientation, deviceName, results) {
  const key = `${deviceLabel}-${orientation}`
  const screensDir = join(SCREENS_ROOT, key)
  mkdirSync(screensDir, { recursive: true })
  const context = await browser.newContext({ ...devices[deviceName] })
  const page = await context.newPage()

  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await waitTestStores(page)
  await dismissIntro(page)
  await page.evaluate(() => { window.__testStores.betAmount.set(1.0) })
  await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
  await page.waitForTimeout(150)

  const viewport = page.viewportSize()
  const entry = { device: deviceName, viewport, screenshots: {} }

  // idle
  await page.screenshot({ path: join(screensDir, 'idle.png') })
  entry.screenshots.idle = 'idle.png'

  // spin (mid-flight)
  await page.locator('[data-testid="spin-button"]').click()
  await page.waitForTimeout(200)
  await page.screenshot({ path: join(screensDir, 'spin.png') })
  entry.screenshots.spin = 'spin.png'
  await waitSpinDone(page)

  // win
  await page.evaluate(() => { window.__testStores.winAmount.set(42.5) })
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(screensDir, 'win.png') })
  entry.screenshots.win = 'win.png'
  await page.evaluate(() => { window.__testStores.winAmount.set(0) })

  // buy modal (FeatureMenu -> BuyBonus confirm)
  const featureMenuBtn = page.locator('[data-testid="feature-menu-button"]')
  if (await featureMenuBtn.count() > 0) {
    await featureMenuBtn.click()
    await page.waitForTimeout(150)
    const activateBonus = page.locator('[data-testid="activate-bonus"]')
    if (await activateBonus.count() > 0) {
      await activateBonus.click()
      await page.waitForTimeout(150)
      await page.screenshot({ path: join(screensDir, 'buy-modal.png') })
      entry.screenshots.buyModal = 'buy-modal.png'
      // Close the buy confirm modal explicitly (it has no Escape handler) so
      // it doesn't intercept clicks on later steps.
      const cancelBtn = page.locator('.buy-cancel')
      if (await cancelBtn.count() > 0) {
        await cancelBtn.click().catch(() => {})
        await page.waitForTimeout(150)
      }
    }
  }
  await page.waitForTimeout(100)

  // paytable
  await page.evaluate(() => { window.__testStores.showPaytable?.set?.(true) }).catch(() => {})
  const menuBtn = page.locator('[data-testid="feature-menu-button"], [aria-label="Menu"]').first()
  // Portrait exposes the paytable via the HUD's hamburger menu; landscape via
  // its own .fs-menu. Try the hamburger path generically across both.
  const hamburger = page.locator('[aria-label="Menu"]')
  if (await hamburger.count() > 0) {
    await hamburger.first().click()
    await page.waitForTimeout(150)
    const paytableItem = page.getByText('Paytable', { exact: false }).first()
    if (await paytableItem.count() > 0) {
      await paytableItem.click().catch(() => {})
      await page.waitForTimeout(200)
    }
  }
  await page.screenshot({ path: join(screensDir, 'paytable.png') })
  entry.screenshots.paytable = 'paytable.png'
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(100)

  // OVERBOOST active
  await page.evaluate(() => { window.__testStores.standingMode.set('antelite') })
  await page.waitForTimeout(200)
  await page.screenshot({ path: join(screensDir, 'overboost-active.png') })
  entry.screenshots.overboostActive = 'overboost-active.png'
  await page.evaluate(() => { window.__testStores.standingMode.set('base') })

  // touch-target audit
  const targets = await auditTouchTargets(page)
  const failingTargets = targets.filter((t) => !t.pass)
  entry.touchTargetAudit = {
    totalChecked: targets.length,
    failing: failingTargets,
    pass: failingTargets.length === 0,
  }

  // font legibility (portrait only - see module doc comment)
  if (orientation === 'portrait') {
    const fonts = await auditPortraitFontSizes(page)
    const failingFonts = fonts.filter((f) => !f.pass)
    entry.fontLegibilityAudit = { totalChecked: fonts.length, failing: failingFonts, pass: failingFonts.length === 0 }
  } else {
    entry.landscapeSmallTextDiagnostic = await sampleLandscapeSmallText(page)
  }

  // frame gate
  entry.frameGate = await runFrameGate(page)

  results[key] = entry
  await context.close()
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const baseUrl = `http://localhost:${port}`
  const results = {}

  try {
    const browser = await chromium.launch()
    for (const profile of DEVICE_PROFILES) {
      console.error(`[progress] ${profile.label} portrait`)
      await runProfile(browser, baseUrl, profile.label, 'portrait', profile.portrait, results)
      console.error(`[progress] ${profile.label} landscape`)
      await runProfile(browser, baseUrl, profile.label, 'landscape', profile.landscape, results)
    }
    await browser.close()
  } finally {
    server.kill()
  }

  const outPath = join(OUT_DIR, 'portrait-layout-conformance-2026-07-14.json')
  writeFileSync(outPath, JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
  console.log(`\nResults written to ${outPath}`)
  console.log(`Screenshots written to ${SCREENS_ROOT}`)

  const failures = []
  function collectFailures(obj, path) {
    if (obj === null || typeof obj !== 'object') return
    if ('pass' in obj && obj.pass === false) failures.push(path)
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'pass') continue
      collectFailures(value, path ? `${path}.${key}` : key)
    }
  }
  collectFailures(results, '')

  if (failures.length > 0) {
    console.error(`\nPORTRAIT LAYOUT CONFORMANCE: FAILURES DETECTED - ${failures.join(', ')}`)
    process.exitCode = 1
  } else {
    console.log('\nPORTRAIT LAYOUT CONFORMANCE: ALL CHECKS PASS')
  }
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
