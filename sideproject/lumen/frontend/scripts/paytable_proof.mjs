// paytable_proof.mjs — screenshots for the LUMEN paytable overhaul.
// Boots its own vite preview server on port 4181 (avoids clashing with dev on
// 5173/5174), opens the paytable via the HUD menu, and captures the top
// (how-to-win + ways), the Symbol Payouts grid and the Interface Guide.
// Run (from frontend/, after `npm run build`):
//   npx tsx scripts/paytable_proof.mjs   (or: node scripts/paytable_proof.mjs)
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

const PORT = 4181
const BASE_URL = `http://localhost:${PORT}`

// ── Boot the preview server ────────────────────────────────────────────────
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
      try {
        const r = await fetch(url)
        if (r.ok) return resolve()
      } catch {}
      if (Date.now() - start > timeoutMs) return reject(new Error('preview server did not start'))
      setTimeout(tick, 300)
    }
    tick()
  })
}

async function dismissIntro(page) {
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await btn.click(); await page.waitForTimeout(200)
  }
}

let browser
try {
  await waitForServer(BASE_URL)
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERR:', m.text()) })
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('.spin-btn', { timeout: 20000 })
  await dismissIntro(page)
  await page.waitForTimeout(600)

  // Open the paytable via the HUD hamburger menu -> Paytable.
  await page.locator('.hamburger-btn').click()
  await page.waitForTimeout(200)
  await page.locator('.hud-menu-item', { hasText: /paytable/i }).first().click()
  await page.waitForSelector('.modal-body', { timeout: 5000 })
  await page.waitForTimeout(500)

  // (a) top — how-to-win banner + ways diagram.
  await page.locator('.modal-body').evaluate((el) => { el.scrollTop = 0 })
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(OUT, 'lumen_paytable_top.png') })
  console.log('captured lumen_paytable_top.png')

  // (b) Symbol Payouts grid — 4 across, big, named.
  await page.locator('[data-testid="symbol-payouts"]').evaluate((el) => el.scrollIntoView())
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(OUT, 'lumen_paytable_symbols.png') })
  console.log('captured lumen_paytable_symbols.png')

  // (c) Interface Guide.
  await page.locator('[data-testid="interface-guide"]').evaluate((el) => el.scrollIntoView())
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(OUT, 'lumen_paytable_interface.png') })
  console.log('captured lumen_paytable_interface.png')

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
