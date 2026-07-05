// audio_menu_proof.mjs - screenshot proof for the LUMEN audio volume controls.
// Boots a preview server on PORT 4182 (4181 is reserved for a parallel job),
// opens the game, opens the hamburger hud-menu, and captures the Mute toggle +
// MUSIC slider + SOUND slider. Run (from frontend/) after `npm run build`:
//   node scripts/audio_menu_proof.mjs
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

const PORT = 4182
const BASE_URL = `http://localhost:${PORT}`

// Boot the Vite preview server serving dist/ on the reserved port.
const server = spawn('npm', ['run', 'preview', '--', '--port', String(PORT), '--strictPort'], {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
})
server.stdout.on('data', (d) => process.stdout.write(`[preview] ${d}`))
server.stderr.on('data', (d) => process.stderr.write(`[preview] ${d}`))

function shutdown() {
  try { server.kill('SIGTERM') } catch {}
}
process.on('exit', shutdown)

async function dismissIntro(page) {
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await btn.click(); await page.waitForTimeout(200)
  }
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(BASE_URL)
      if (res.ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('preview server did not come up')
}

await waitForServer()

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERR:', m.text()) })
await page.goto(BASE_URL, { waitUntil: 'networkidle' })
await page.waitForSelector('.spin-btn', { timeout: 20000 })
await dismissIntro(page)
await page.waitForTimeout(600)

// Open the hamburger menu (aria-label="Menu") to reveal the hud-menu dropdown.
await page.locator('button[aria-label="Menu"]').click()
await page.waitForSelector('.hud-menu', { timeout: 5000 })
await page.waitForSelector('.audio-slider', { timeout: 5000 })
await page.waitForTimeout(400)

await page.screenshot({ path: join(OUT, 'lumen_audio_menu.png') })
console.log('captured lumen_audio_menu.png')

const sliders = await page.locator('.audio-slider').count()
console.log(`audio sliders rendered: ${sliders}`)

await browser.close()
shutdown()
process.exit(0)
