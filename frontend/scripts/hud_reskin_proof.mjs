// hud_reskin_proof.mjs - screenshots for the B1 HUD & control-bar reskin.
// Boots its own vite preview on port 4184, dismisses the intro splash and
// captures the idle chrome HUD, the forced Overdrive flip, and the paytable
// with the shared Overdrive hook warmed. Run (from frontend/, after build):
//   node scripts/hud_reskin_proof.mjs
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

const PORT = 4184
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
  const burger = page.locator('.fs-menu')
  if (await burger.count() > 0) {
    await burger.first().click({ timeout: 3000 }).catch(() => {})
    await page.waitForTimeout(250)
    const item = page.locator('.hud-menu-item', { hasText: /paytable/i })
    if (await item.count() > 0) { await item.first().click({ timeout: 3000 }).catch(() => {}) }
  }
  if (await page.locator('.fs-pt').count() === 0) {
    const any = page.getByText(/paytable/i)
    if (await any.count() > 0) await any.first().click({ timeout: 3000 }).catch(() => {})
  }
  await page.waitForSelector('.fs-pt', { timeout: 6000 })
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

  // 1) idle HUD
  await page.waitForSelector('.fs-hud', { timeout: 6000 })
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(OUT, 'hud_reskin_base.png') })
  console.log('captured hud_reskin_base.png')

  // 2) forced Overdrive flip on the HUD
  await page.locator('.fs-hud').evaluate((el) => el.classList.add('fs-hud--overdrive'))
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(OUT, 'hud_reskin_overdrive.png') })
  console.log('captured hud_reskin_overdrive.png')

  // reset before opening the paytable
  await page.locator('.fs-hud').evaluate((el) => el.classList.remove('fs-hud--overdrive'))
  await page.waitForTimeout(200)

  // 3) paytable with the shared Overdrive hook warmed
  await openPaytable(page)
  await page.waitForTimeout(400)
  await page.locator('.fs-pt').evaluate((el) => el.classList.add('fs-pt--overdrive'))
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(OUT, 'hud_reskin_paytable_overdrive.png') })
  console.log('captured hud_reskin_paytable_overdrive.png')

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
