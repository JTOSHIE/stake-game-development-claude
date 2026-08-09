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
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { startStaticServer, assertNoSurvivors } from './lib/previewServer.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'screens')
mkdirSync(OUT, { recursive: true })

// TR-101, Fable's ruling 2026-07-28, option (c). The server runs IN THIS
// PROCESS, so there is no vite child to orphan.
//
// THE FIXED PORT IS GONE TOO, and it was its own defect: 4183 was hardcoded,
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

async function openPaytable(page) {
  // STRUCTURAL HOOKS, not a class name that has since been renamed and not an
  // English label. Corrected 2026-08-10.
  //
  // This waited on `.hamburger-btn`, which exists NOWHERE in src: the class was
  // renamed and the proof was never updated, so the menu never opened and it
  // timed out 6000ms later on `.fs-pt-body`, a selector that is perfectly valid.
  // The fallback then matched `/paytable/i` as TEXT, which only works in
  // English; paytable_card_fill_gate already carries a comment explaining why
  // that is wrong and uses the testid instead. This is that approach.
  await page.evaluate(() => {
    const menu = document.querySelector('[data-testid="hud-menu"], [data-testid="mini-menu"]')
    if (menu) menu.click()
  })
  await page.waitForTimeout(250)
  await page.evaluate(() => {
    // The paytable is the FIRST item in every one of these menus.
    const it = document.querySelector('.hud-menu-item')
    if (it) it.click()
  })
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
  server.close()   // startStaticServer returns a server with close(), not a child process
  process.exit(1)
}
server.close()   // startStaticServer returns a server with close(), not a child process
process.exit(0)
