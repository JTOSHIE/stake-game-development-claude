// hud_reel_size_check.mjs — OWNER AUDIT ROUND 3, item 8.
//
// Hard assert: the feature (FreeSpinsPresentation's DOM-mocked .fs-board)
// must render at EXACTLY base-game size (GameGrid's real .grid-slot canvas)
// on every profile, within a 2px tolerance. Root cause this caught: the
// feature grid is a SEPARATE DOM representation from the real PIXI canvas,
// not the same element re-skinned - its cell/gap geometry was never
// actually matched to GameGrid.svelte's CELL_W=120/CELL_H=100/GAP=4
// constants, so it rendered ~65%/77% of true size regardless of viewport.
//
// Run (from frontend/): node scripts/hud_reel_size_check.mjs

import { chromium, devices } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'owner-audit-v3', 'reel-size')
mkdirSync(OUT_DIR, { recursive: true })

const TOLERANCE_PX = 2

const PROFILES = [
  { label: 'desktop-landscape', context: { viewport: { width: 1280, height: 720 } } },
  { label: 'iphone14-portrait', context: { ...devices['iPhone 14'] } },
  { label: 'pixel7-portrait', context: { ...devices['Pixel 7'] } },
]

async function getFreePort() {
  return new Promise((resolvePromise, reject) => {
    const srv = createServer()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => resolvePromise(port)) })
  })
}
function startDevServer(port) {
  return new Promise((resolvePreview, reject) => {
    const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] })
    let resolved = false
    const onData = (d) => { const s = d.toString(); if (!resolved && /Local/.test(s)) { resolved = true; resolvePreview(proc) } }
    proc.stdout.on('data', onData); proc.stderr.on('data', onData); proc.on('error', reject)
    setTimeout(() => { if (!resolved) reject(new Error('vite dev server did not start in time')) }, 15000)
  })
}
async function checkProfile(browser, port, profile) {
  const context = await browser.newContext(profile.context)
  const page = await context.newPage()
  try {
    await page.goto(`http://localhost:${port}?mockCategory=trigger_3`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await page.waitForFunction(() => window.__testStores?.balance, { timeout: 8000 })
    await dismissIntro(page)
    await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
    await page.waitForTimeout(300)

    const baseBox = await page.locator('.grid-slot').boundingBox()
    await page.screenshot({ path: join(OUT_DIR, `${profile.label}-base.png`) })

    await page.locator('[data-testid="spin-button"]').click()
    await page.waitForSelector('[data-testid="entry-continue"]', { timeout: 10000 })
    await page.locator('[data-testid="entry-continue"]').click({ force: true })
    await page.waitForSelector('.fs-board', { timeout: 10000 })
    await page.waitForTimeout(300)

    const featureBox = await page.locator('.fs-board').boundingBox()
    await page.screenshot({ path: join(OUT_DIR, `${profile.label}-feature.png`) })

    return { profile: profile.label, baseBox, featureBox }
  } finally {
    await context.close()
  }
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const failures = []
  const assert = (cond, msg) => { if (!cond) failures.push(msg); console.log(`${cond ? 'PASS' : 'FAIL'}: ${msg}`) }

  try {
    const browser = await chromium.launch()
    for (const profile of PROFILES) {
      const result = await checkProfile(browser, port, profile)
      const { baseBox, featureBox } = result
      console.log(`[${profile.label}] base=${JSON.stringify(baseBox)} feature=${JSON.stringify(featureBox)}`)
      if (!baseBox || !featureBox) {
        assert(false, `${profile.label}: both base and feature grid boxes found`)
        continue
      }
      const dw = Math.abs(baseBox.width - featureBox.width)
      const dh = Math.abs(baseBox.height - featureBox.height)
      const dx = Math.abs(baseBox.x - featureBox.x)
      const dy = Math.abs(baseBox.y - featureBox.y)
      assert(dw <= TOLERANCE_PX, `${profile.label}: feature grid width matches base within ${TOLERANCE_PX}px (base ${baseBox.width.toFixed(1)} vs feature ${featureBox.width.toFixed(1)}, diff ${dw.toFixed(2)})`)
      assert(dh <= TOLERANCE_PX, `${profile.label}: feature grid height matches base within ${TOLERANCE_PX}px (base ${baseBox.height.toFixed(1)} vs feature ${featureBox.height.toFixed(1)}, diff ${dh.toFixed(2)})`)
      assert(dx <= TOLERANCE_PX, `${profile.label}: feature grid x-position matches base within ${TOLERANCE_PX}px (diff ${dx.toFixed(2)})`)
      assert(dy <= TOLERANCE_PX, `${profile.label}: feature grid y-position matches base within ${TOLERANCE_PX}px (diff ${dy.toFixed(2)})`)
    }
    await browser.close()
  } finally {
    server.kill()
  }

  console.log('')
  console.log(failures.length === 0 ? 'HUD REEL SIZE CHECK: PASS' : `HUD REEL SIZE CHECK: FAIL (${failures.length})`)
  if (failures.length > 0) { failures.forEach((f) => console.log(`  - ${f}`)); process.exitCode = 1 }
}

run().catch((err) => { console.error(err); process.exitCode = 1 })
