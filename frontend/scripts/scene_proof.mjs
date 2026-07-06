// scene_proof.mjs — visual proof for the Future Spinner scene overhaul.
//
// Self-contained: launches `vite` dev on PORT 4188 (--strictPort), drives a
// 1280x720 page, dismisses the intro splash, and captures:
//   frontend/screens/scene_after.png            — base game showing the
//       character presented as a fully-visible feature on the left, the car as
//       scenery, and no spinning turbine swirls.
//   frontend/screens/scene_character_render.png — a copy of the rendered
//       character sprite so it can be eyeballed for crop/completeness.
//
// Run (from frontend/): node scripts/scene_proof.mjs

import playwright from '/Users/jt/math-sdk/frontend/node_modules/playwright/index.js'
const { chromium } = playwright
import { spawn } from 'node:child_process'
import { mkdirSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FRONTEND = join(__dirname, '..')
const SCREENS = join(FRONTEND, 'screens')
mkdirSync(SCREENS, { recursive: true })

const PORT = 4188
const BASE_URL = `http://localhost:${PORT}`

function startVite() {
  const proc = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
    cwd: FRONTEND,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return new Promise((resolve, reject) => {
    let out = ''
    const onData = (buf) => {
      out += buf.toString()
      if (/Local:\s+http/i.test(out) || out.includes(`localhost:${PORT}`)) {
        resolve(proc)
      }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('exit', (code) => reject(new Error(`vite exited early (code ${code})\n${out}`)))
    setTimeout(() => reject(new Error(`vite did not start in time\n${out}`)), 60000)
  })
}

async function dismissIntroIfPresent(page) {
  const btn = page.locator('[data-testid="intro-continue"]')
  if ((await btn.count()) > 0 && (await btn.isVisible().catch(() => false))) {
    await btn.click()
    await page.waitForTimeout(150)
  }
}

async function run() {
  console.log('[scene-proof] starting vite on port', PORT, '...')
  const vite = await startVite()
  console.log('[scene-proof] vite up')

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(BASE_URL, { waitUntil: 'load' })
    // The intro splash overlays the ControlBar, so dismiss it before the
    // controls (and thus the spin button) render.
    await page.waitForSelector('[data-testid="intro-continue"]', { timeout: 20000 })
    await dismissIntroIfPresent(page)
    await page.waitForSelector('.game-frame', { timeout: 20000 })
    await page.waitForSelector('[data-testid="scene-group"]', { timeout: 5000 })
    // Let the scene layers load + settle a beat mid-animation.
    await page.waitForTimeout(1200)

    const afterPath = join(SCREENS, 'scene_after.png')
    await page.screenshot({ path: afterPath })
    console.log('[scene-proof] wrote', afterPath)

    await page.close()
  } finally {
    await browser.close()
    vite.kill('SIGTERM')
  }

  // Copy the rendered character sprite for an isolated eyeball check.
  const charSrc = join(FRONTEND, 'public/assets/themes/future-spinner/ui/scene_character.png')
  const charDst = join(SCREENS, 'scene_character_render.png')
  copyFileSync(charSrc, charDst)
  console.log('[scene-proof] wrote', charDst)
  console.log('[scene-proof] done')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
