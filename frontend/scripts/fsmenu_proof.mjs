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

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'screens')
mkdirSync(OUT, { recursive: true })

const PORT = 4185
const BASE_URL = `http://localhost:${PORT}`

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
})
server.stdout.on('data', (d) => process.stdout.write(`[preview] ${d}`))
server.stderr.on('data', (d) => process.stderr.write(`[preview] ${d}`))

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

async function dismissIntro(page) {
  for (const sel of ['[data-testid="intro-continue"]', '.intro-continue', '.intro-splash']) {
    const b = page.locator(sel)
    if (await b.count() > 0 && await b.isVisible().catch(() => false)) {
      await b.click({ timeout: 1500 }).catch(() => {})
      await page.waitForTimeout(200)
    }
  }
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
