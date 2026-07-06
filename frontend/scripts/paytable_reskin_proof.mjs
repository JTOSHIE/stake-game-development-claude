// paytable_reskin_proof.mjs — screenshots for the B3 paytable reskin.
// Boots its own vite preview on port 4183, opens the paytable via the HUD menu
// and captures the new brushed-steel plate at the top, the symbol grid and the
// Overdrive + RTP area. Run (from frontend/, after `npm run build`):
//   node scripts/paytable_reskin_proof.mjs
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

const PORT = 4183
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

async function openPaytable(page) {
  // Primary: HUD hamburger -> Paytable menu item.
  const burger = page.locator('.hamburger-btn')
  if (await burger.count() > 0) {
    await burger.first().click({ timeout: 3000 }).catch(() => {})
    await page.waitForTimeout(250)
    const item = page.locator('.hud-menu-item', { hasText: /paytable/i })
    if (await item.count() > 0) { await item.first().click({ timeout: 3000 }).catch(() => {}) }
  }
  if (await page.locator('.fs-pt-body').count() === 0) {
    // Fallback: any visible control mentioning paytable.
    const any = page.getByText(/paytable/i)
    if (await any.count() > 0) await any.first().click({ timeout: 3000 }).catch(() => {})
  }
  await page.waitForSelector('.fs-pt-body', { timeout: 6000 })
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
  await page.waitForTimeout(500)

  await openPaytable(page)
  await page.waitForTimeout(600)

  await page.locator('.fs-pt-body').evaluate((el) => { el.scrollTop = 0 })
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(OUT, 'fs_paytable_reskin_top.png') })
  console.log('captured fs_paytable_reskin_top.png')

  await page.locator('.fs-sym-grid').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(OUT, 'fs_paytable_reskin_symbols.png') })
  console.log('captured fs_paytable_reskin_symbols.png')

  await page.locator('.fs-trig').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(OUT, 'fs_paytable_reskin_overdrive.png') })
  console.log('captured fs_paytable_reskin_overdrive.png')

  await page.locator('.fs-rtp').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(OUT, 'fs_paytable_reskin_rtp.png') })
  console.log('captured fs_paytable_reskin_rtp.png')

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
