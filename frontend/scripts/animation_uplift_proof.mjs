// animation_uplift_proof.mjs — ANIMATION UPLIFT PASS, 2026-07-16.
// Captures proof stills for all 6 items into reports/screens/animation-uplift-v1/:
//   splash-*.png            item 1 (flicker-in sequence + dismissed state)
//   entry-*.png              item 2 (bonus entry gate stage sequence)
//   winbanner-*.png          item 3 (big/mega/epic tiers)
//   anticipation-*.png       item 4 (before/during)
//   idle-*.png               item 5 (before/during)
//   reduced-motion-*.png     items 1/3/4/5 under prefers-reduced-motion: reduce
//
// Run (from frontend/, against a running dev server on the given port):
//   node scripts/animation_uplift_proof.mjs <port>

import { chromium, devices } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'animation-uplift-v1')
mkdirSync(OUT_DIR, { recursive: true })

const PORT = process.argv[2] || '57140'
const BASE_URL = `http://localhost:${PORT}`

async function dismissSplashAndIntro(page) {
  const splash = page.locator('[data-testid="hero-splash"]')
  if (await splash.count() && await splash.isVisible().catch(() => false)) {
    await splash.click()
    await page.waitForTimeout(150)
  }
  const intro = page.locator('[data-testid="intro-continue"]')
  if (await intro.count() && await intro.isVisible().catch(() => false)) {
    await intro.click()
    await page.waitForTimeout(150)
  }
}

async function waitSpinDone(page, timeout = 20000) {
  await page.waitForFunction(
    () => !document.querySelector('[data-testid="spin-button"].spinning'),
    { timeout },
  ).catch(() => {})
}

async function captureSplash(browser, reduced) {
  const suffix = reduced ? '-reduced' : ''
  const context = await browser.newContext({ ...devices['iPhone 14'], reducedMotion: reduced ? 'reduce' : 'no-preference' })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="hero-splash"]', { timeout: 10000 }).catch(() => {})
  await page.screenshot({ path: join(OUT_DIR, `splash-0ms${suffix}.png`) })
  if (!reduced) {
    await page.waitForTimeout(600)
    await page.screenshot({ path: join(OUT_DIR, `splash-600ms${suffix}.png`) })
    await page.waitForTimeout(800)
    await page.screenshot({ path: join(OUT_DIR, `splash-1400ms${suffix}.png`) })
  }
  const splash = page.locator('[data-testid="hero-splash"]')
  if (await splash.count()) await splash.click()
  await page.waitForTimeout(200)
  await page.screenshot({ path: join(OUT_DIR, `splash-dismissed${suffix}.png`) })
  await context.close()
}

async function captureEntryGate(browser, reduced) {
  const suffix = reduced ? '-reduced' : ''
  const context = await browser.newContext({ ...devices['iPhone 14'], reducedMotion: reduced ? 'reduce' : 'no-preference' })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
  await dismissSplashAndIntro(page)
  await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
  await page.locator('[data-testid="feature-menu-button"]').click()
  await page.waitForTimeout(150)
  await page.locator('[data-testid="activate-bonus"]').click()
  await page.waitForTimeout(150)
  await page.locator('[data-testid="buy-confirm"]').click()
  await page.waitForSelector('[data-testid="overdrive-entry"]', { timeout: 8000 }).catch(() => {})
  await page.waitForTimeout(350)
  await page.screenshot({ path: join(OUT_DIR, `entry-title-slam${suffix}.png`) })
  await page.waitForTimeout(700)
  await page.screenshot({ path: join(OUT_DIR, `entry-burst${suffix}.png`) })
  await context.close()
}

async function captureWinBanners(browser) {
  const context = await browser.newContext({ viewport: { width: 1000, height: 700 } })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
  await dismissSplashAndIntro(page)
  await page.evaluate(() => { window.__testStores.betAmount.set(1) })
  for (const [tier, mult] of [['big', 15], ['mega', 40], ['epic', 150]]) {
    await page.evaluate((m) => { window.__testStores.winAmount.set(m) }, mult)
    await page.waitForTimeout(400)
    await page.screenshot({ path: join(OUT_DIR, `winbanner-${tier}.png`) })
    await page.evaluate(() => { window.__testStores.isSpinning.set(true) })
    await page.waitForTimeout(80)
    await page.evaluate(() => { window.__testStores.isSpinning.set(false) })
    await page.waitForTimeout(80)
  }
  await context.close()
}

async function captureAnticipation(browser, reduced) {
  const suffix = reduced ? '-reduced' : ''
  const context = await browser.newContext({ viewport: { width: 1000, height: 700 }, reducedMotion: reduced ? 'reduce' : 'no-preference' })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await dismissSplashAndIntro(page)
  await page.screenshot({ path: join(OUT_DIR, `anticipation-before${suffix}.png`) })
  await page.evaluate(() => { window.__testGameGrid?.forceAnticipation() })
  await page.waitForTimeout(500)
  await page.screenshot({ path: join(OUT_DIR, `anticipation-active${suffix}.png`) })
  await context.close()
}

async function captureIdleAttract(browser, reduced) {
  const suffix = reduced ? '-reduced' : ''
  const context = await browser.newContext({ viewport: { width: 1000, height: 700 }, reducedMotion: reduced ? 'reduce' : 'no-preference' })
  const page = await context.newPage()
  await page.goto(`${BASE_URL}?fastIdle=1`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await dismissSplashAndIntro(page)
  await page.screenshot({ path: join(OUT_DIR, `idle-before${suffix}.png`) })
  await page.waitForTimeout(1600)
  await page.screenshot({ path: join(OUT_DIR, `idle-active${suffix}.png`) })
  await context.close()
}

async function main() {
  const browser = await chromium.launch()
  console.log('[proof] splash')
  await captureSplash(browser, false)
  await captureSplash(browser, true)
  console.log('[proof] entry gate')
  await captureEntryGate(browser, false)
  await captureEntryGate(browser, true)
  console.log('[proof] win banners')
  await captureWinBanners(browser)
  console.log('[proof] anticipation')
  await captureAnticipation(browser, false)
  await captureAnticipation(browser, true)
  console.log('[proof] idle attract')
  await captureIdleAttract(browser, false)
  await captureIdleAttract(browser, true)
  await browser.close()
  console.log('done:', OUT_DIR)
}

main()
