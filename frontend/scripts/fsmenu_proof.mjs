// fsmenu_proof.mjs — screenshots for the unified FEATURES menu.
// Boots its own vite preview on port 4185, captures:
//   fsmenu_base.png     — base game with the single FEATURES entry (no scattered buy)
//   fsmenu_open.png     — the menu open, all five cards (Normal active, three
//                         placeholders dimmed "coming soon", Buy Overdrive live)
//   fsmenu_betmodes.png — the paytable scrolled to the BET MODES section
// Run (from frontend/, after `npm run build`):
//   node scripts/fsmenu_proof.mjs
import pw from '/Users/jt/math-sdk/frontend/node_modules/playwright/index.js'
const { chromium } = pw
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { startStaticServer, assertNoSurvivors } from './lib/previewServer.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'screens')
mkdirSync(OUT, { recursive: true })

// TR-101, Fable's ruling 2026-07-28, option (c). The server runs IN THIS
// PROCESS, so there is no vite child to orphan.
//
// THE FIXED PORT IS GONE TOO, and it was its own defect: 4185 was hardcoded,
// so two of these proofs running at once fought over one port and the second
// died on --strictPort. The kernel now picks, and reports what it picked.
const server = await startStaticServer(join(ROOT, 'dist'))
const PORT = server.port
const BASE_URL = server.url

function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try { const r = await fetch(url); if (r.ok) return resolve() } catch {}
      if (Date.now() - start > timeoutMs) return reject(new Error('preview server did not start'))
      setTimeout(tick, 300)
    }
    tick()
  })
}

let browser
try {
  await waitForServer(BASE_URL)
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERR:', m.text()) })
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await dismissIntro(page)
  await page.waitForTimeout(600)

  // 1) Base game — single FEATURES entry, no scattered buy button.
  await page.screenshot({ path: join(OUT, 'fsmenu_base.png') })
  console.log('captured fsmenu_base.png')

  // 2) Open the menu — all five cards.
  await page.locator('[data-testid="feature-menu-button"]').click({ timeout: 4000 })
  await page.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 6000 })
  await page.waitForTimeout(500)
  await page.screenshot({ path: join(OUT, 'fsmenu_open.png') })
  console.log('captured fsmenu_open.png')

  // 3) Jump to the paytable BET MODES section via the menu's BET MODES button.
  await page.locator('[data-testid="open-bet-modes-info"]').click({ timeout: 4000 })
  await page.waitForSelector('.fs-modes', { timeout: 6000 })
  await page.locator('.fs-modes').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(500)
  await page.screenshot({ path: join(OUT, 'fsmenu_betmodes.png') })
  console.log('captured fsmenu_betmodes.png')

  await browser.close()
  console.log('done')
} catch (e) {
  console.error('PROOF FAILED:', e)
  if (browser) await browser.close().catch(() => {})
  server.kill('SIGTERM')
  process.exit(1)
}
server.kill('SIGTERM')
process.exit(0)
