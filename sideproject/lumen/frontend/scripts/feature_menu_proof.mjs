// feature_menu_proof.mjs — screenshots for the LUMEN FEATURES menu refactor.
// Requires the dev server running. Run (from frontend/):
//   BASE_URL=http://localhost:5174 npx tsx scripts/feature_menu_proof.mjs
import pw from '/Users/jt/math-sdk/frontend/node_modules/playwright/index.js'
const { chromium } = pw
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'screens')
mkdirSync(OUT, { recursive: true })
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173'

async function dismissIntro(page) {
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await btn.click(); await page.waitForTimeout(200)
  }
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERR:', m.text()) })
await page.goto(BASE_URL, { waitUntil: 'networkidle' })
await page.waitForSelector('.spin-btn', { timeout: 20000 })
await dismissIntro(page)
await page.waitForTimeout(600)

// (a) base game with the single FEATURES entry
await page.screenshot({ path: join(OUT, 'lumen_base_features.png') })
console.log('captured lumen_base_features.png')

// (b) FEATURES menu open — card list
await page.locator('[data-testid="feature-menu-entry"] .entry-btn').click()
await page.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 5000 })
await page.waitForTimeout(400)
await page.screenshot({ path: join(OUT, 'lumen_featuremenu.png') })
console.log('captured lumen_featuremenu.png')

// (c) BET MODES info page (opens the paytable's Bet Modes section)
await page.locator('[data-testid="open-bet-modes-info"]').click()
await page.waitForSelector('[data-testid="bet-modes-section"]', { timeout: 5000 })
await page.locator('[data-testid="bet-modes-section"]').scrollIntoViewIfNeeded()
await page.waitForTimeout(400)
await page.screenshot({ path: join(OUT, 'lumen_betmodes_info.png') })
console.log('captured lumen_betmodes_info.png')

// close paytable (Escape) and trigger a buy from the menu to confirm entry
await page.keyboard.press('Escape')
await page.waitForTimeout(300)
await page.locator('[data-testid="feature-menu-entry"] .entry-btn').click()
await page.waitForSelector('[data-testid="activate-bloom"]', { timeout: 5000 })
await page.locator('[data-testid="activate-bloom"]').click()
// The Bloom presentation overlay should appear (mock serves a bonus round).
try {
  await page.waitForSelector('[data-testid="freespins-overlay"]:visible', { timeout: 12000 })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: join(OUT, 'lumen_buy_flow.png') })
  console.log('BUY FLOW: feature entered — freespins overlay visible')
} catch (e) {
  console.log('BUY FLOW: overlay not detected within timeout —', e.message)
  await page.screenshot({ path: join(OUT, 'lumen_buy_flow.png') })
}

await browser.close()
