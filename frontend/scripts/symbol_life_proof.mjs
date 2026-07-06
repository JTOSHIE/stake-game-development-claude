// symbol_life_proof.mjs - Symbol Life win-burst before/after capture harness.
//
// Boots its own vite DEV server on port 4187 (--strictPort) so
// import.meta.env.DEV is true and the ?windemo=<symbol> forced-win demo fires.
// Navigates to /?windemo=h1, captures the win burst at its PEAK (a few hundred
// ms after the winners reveal) plus one idle frame.
//
// Run (from frontend/):
//   node scripts/symbol_life_proof.mjs <peakOut.png> [idleOut.png]
// e.g. node scripts/symbol_life_proof.mjs screens/symbol_after.png screens/symbol_after_idle.png
import pw from '/Users/jt/math-sdk/frontend/node_modules/playwright/index.js'
const { chromium } = pw
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, isAbsolute } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const peakArg = process.argv[2] ?? 'screens/symbol_after.png'
const idleArg = process.argv[3] ?? null
const resolveOut = (p) => (isAbsolute(p) ? p : join(ROOT, p))
const peakOut = resolveOut(peakArg)
const idleOut = idleArg ? resolveOut(idleArg) : null
mkdirSync(dirname(peakOut), { recursive: true })

const PORT = 4187
const BASE_URL = `http://localhost:${PORT}`

const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
})
server.stdout.on('data', (d) => process.stdout.write(`[vite] ${d}`))
server.stderr.on('data', (d) => process.stderr.write(`[vite] ${d}`))

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try { const r = await fetch(url); if (r.ok) return resolve() } catch {}
      if (Date.now() - start > timeoutMs) return reject(new Error('vite dev server did not start'))
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

  await page.goto(`${BASE_URL}/?windemo=h1`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.symbol-grid', { timeout: 20000 })
  await dismissIntro(page)

  // Wait for the demo to reveal winners and the burst to start (plate-bloom).
  await page.waitForSelector('.symbol-cell.plate-bloom', { timeout: 25000 })
  // Let the pop / flash / particles reach their peak.
  await page.waitForTimeout(450)
  await page.screenshot({ path: peakOut })
  console.log('captured peak:', peakOut)

  if (idleOut) {
    // Wait for the burst window to reset (4000ms) so the grid is back to idle.
    await page.waitForSelector('.symbol-cell.plate-bloom', { state: 'detached', timeout: 8000 }).catch(() => {})
    await page.waitForTimeout(400)
    await page.screenshot({ path: idleOut })
    console.log('captured idle:', idleOut)
  }
} catch (err) {
  console.error(err)
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  server.kill('SIGTERM')
  setTimeout(() => server.kill('SIGKILL'), 1000)
}
