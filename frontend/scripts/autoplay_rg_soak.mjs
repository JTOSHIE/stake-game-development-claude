// autoplay_rg_soak.mjs — OWNER AUDIT REMEDIATION item A4.
//
// End-to-end soak asserting autoplay's three responsible-gambling stop
// conditions actually stop autoplay within one spin of being crossed/hit,
// driven entirely through the real DOM (checkbox + amount input + spin-count
// button), not by reaching into internal stores - this is the same class of
// bug that shipped (a UI control that looked wired but wasn't), so the
// assert has to prove the UI path specifically.
//
// Run (from frontend/): node scripts/autoplay_rg_soak.mjs

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

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'qa')
mkdirSync(OUT_DIR, { recursive: true })

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

async function readTestStore(page, name) {
  return page.evaluate((n) => {
    let v
    const unsub = window.__testStores[n].subscribe((x) => { v = x })
    unsub()
    return v
  }, name)
}

/** Drives one stop-condition scenario end to end: forces every round to a
 *  given mock category, configures the requested stop-condition via the
 *  real DOM, starts autoplay, and waits for it to stop - returns how many
 *  spins elapsed before it did. */
async function runScenario(browser, baseUrl, { name, mockCategory, configure, maxSpins = 8, waitForFeaturePresentation = false }) {
  const context = await browser.newContext({ ...devices['iPhone 14'] })
  const page = await context.newPage()
  if (process.env.AUTOPLAY_SOAK_DEBUG) page.on('console', (msg) => console.log(`[${name}]`, msg.text()))
  await page.goto(`${baseUrl}?mockCategory=${mockCategory}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await page.waitForFunction(() => window.__testStores?.balance, { timeout: 8000 })
  await dismissIntro(page)
  await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
  await page.evaluate(() => { window.__testStores.betAmount.set(1) })
  await page.waitForTimeout(150)

  // Open the autoplay menu (portrait HUD's round button, scoped to
  // .p-autoplay-wrapper - .p-round-btn alone is ambiguous, shared with the
  // hamburger menu/max-bet buttons in DOM order before this one) and
  // configure the requested stop-condition through the real inputs.
  const autoBtn = page.locator('.p-autoplay-wrapper .p-round-btn')
  await autoBtn.click()
  await page.waitForTimeout(150)
  await configure(page)

  // Start autoplay at a generous spin count - if the stop-condition is
  // broken, this soak would otherwise run all 50 spins to exhaustion.
  await page.locator('.auto-menu-item', { hasText: '50' }).click()
  await page.waitForTimeout(300)

  if (waitForFeaturePresentation) {
    // A triggered round's free-spins overlay plays out (8-16 spins' worth
    // of animation) entirely BEFORE the autoplay stop-check runs - checking
    // isAutoPlay against the base spin-button's own "not spinning" state
    // (as the generic loop below does) fires far too early here, since that
    // flips well before presentFeature() finishes. The DOM node detaching
    // is itself slightly ahead of the app's own post-presentation stop
    // decision, so a short grace wait after detach avoids racing that too.
    // App.svelte permanently mounts a SECOND, always-active "warm"
    // FreeSpinsPresentation instance (inert, visibility:hidden, pre-painted
    // for performance - see the "Persistent hidden mount (Task 5)" comment
    // above its usage) that also renders this testid, so baseline count is
    // 1 (warm only) and a real trigger briefly brings it to 2. .last() on
    // its own is NOT safe for the "wait until gone" half of this: it's a
    // dynamic query re-evaluated on every call, so once the real overlay
    // detaches (count back to 1) .last() silently starts resolving to the
    // warm one instead - which never detaches - so waitFor({state:
    // 'detached'}) on it hangs forever even though the real presentation
    // already finished (confirmed by screenshot: normal gameplay resumed
    // well inside the wait window). Track appearance via count instead.
    const overlayAppeared = await page.waitForFunction(
      () => document.querySelectorAll('[data-testid="freespins-overlay"]').length >= 2,
      { timeout: 10000 },
    ).then(() => true).catch(() => false)
    if (overlayAppeared) {
      await page.waitForFunction(
        () => document.querySelectorAll('[data-testid="freespins-overlay"]').length < 2,
        { timeout: 45000 },
      ).catch(() => {})
      await page.waitForTimeout(1000)
    }
    const isAutoPlay = await readTestStore(page, 'isAutoPlay')
    await context.close()
    return { name, stoppedWithinSpins: !isAutoPlay, spinsObserved: 1, finalAutoPlay: isAutoPlay, pass: !isAutoPlay }
  }

  let spins = 0
  let stopped = false
  for (; spins < maxSpins; spins++) {
    await page.waitForFunction(
      () => !document.querySelector('[data-testid="spin-button"].spinning'),
      { timeout: 20000 },
    ).catch(() => {})
    await page.waitForTimeout(400)
    const isAutoPlay = await readTestStore(page, 'isAutoPlay')
    if (!isAutoPlay) { stopped = true; break }
    await page.waitForTimeout(600) // let the next autoplay spin kick off
  }

  const finalAutoPlay = await readTestStore(page, 'isAutoPlay')
  await context.close()
  return { name, stoppedWithinSpins: stopped, spinsObserved: spins + 1, finalAutoPlay, pass: stopped && spins <= 1 }
}

async function main() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const baseUrl = `http://localhost:${port}`
  const results = []

  try {
    const browser = await chromium.launch()

    results.push(await runScenario(browser, baseUrl, {
      name: 'loss limit',
      mockCategory: 'base_loss',
      configure: async (page) => {
        await page.locator('.auto-menu-toggle', { hasText: 'Loss limit' }).locator('input[type="checkbox"]').click()
        await page.locator('[data-testid="loss-limit-input"]').fill('1')
      },
    }))

    results.push(await runScenario(browser, baseUrl, {
      name: 'single win limit',
      mockCategory: 'base_win_large',
      configure: async (page) => {
        await page.locator('.auto-menu-toggle', { hasText: 'Single win limit' }).locator('input[type="checkbox"]').click()
        await page.locator('[data-testid="single-win-limit-input"]').fill('2')
      },
    }))

    results.push(await runScenario(browser, baseUrl, {
      name: 'stop on feature',
      mockCategory: 'trigger_3',
      maxSpins: 2,
      waitForFeaturePresentation: true,
      configure: async (page) => {
        const cb = page.locator('.auto-menu-toggle', { hasText: 'Stop on feature' }).locator('input[type="checkbox"]')
        if (!(await cb.isChecked())) await cb.click()
      },
    }))

    await browser.close()
  } finally {
    server.kill()
  }

  const outPath = join(OUT_DIR, 'autoplay-rg-soak.json')
  writeFileSync(outPath, JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
  console.log(`\nResults written to ${outPath}`)

  const pass = results.every((r) => r.pass)
  console.log(pass ? '\nAUTOPLAY RG SOAK: ALL CHECKS PASS' : '\nAUTOPLAY RG SOAK: FAILURES DETECTED')
  process.exitCode = pass ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
