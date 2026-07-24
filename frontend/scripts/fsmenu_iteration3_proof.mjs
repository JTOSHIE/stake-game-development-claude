// fsmenu_iteration3_proof.mjs — OWNER AUDIT ROUND 2, item 6 + item 7(a)(b) proof.
//
// Visual proof: FEATURES menu condensed (merged bet/cost header, Normal+Cruise
// paired switch), the FEATURES-button square shadow artefact gone (landscape),
// and the portrait bet-stepper row spacing opened up.
//
// Run (from frontend/): node scripts/fsmenu_iteration3_proof.mjs

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'owner-audit-v2', 'fsmenu-iteration3')
mkdirSync(OUT_DIR, { recursive: true })

async function getFreePort() {
  return new Promise((resolvePromise, reject) => {
    const srv = createServer()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolvePromise(port))
    })
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
async function dismissIntro(page) {
  const splash = page.locator('[data-testid="hero-splash"]')
  if (await splash.count() > 0 && await splash.isVisible().catch(() => false)) { await splash.click(); await page.waitForTimeout(100) }
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) { await btn.click(); await page.waitForTimeout(100) }
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const failures = []
  const assert = (cond, msg) => { if (!cond) failures.push(msg); console.log(`${cond ? 'PASS' : 'FAIL'}: ${msg}`) }
  let browser
  try {
    browser = await chromium.launch()

    // ── Landscape/desktop ────────────────────────────────────────────────
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    // ?fastIdle: dev-only override (App.svelte IDLE_ATTRACT_MS) shortens the
    // 20s idle-attract threshold to 1.2s so this check doesn't have to wait
    // out the real timer.
    await page.goto(`http://localhost:${port}?fastIdle=1`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await dismissIntro(page)
    await page.waitForTimeout(1800) // past the 1.2s fastIdle threshold

    await page.screenshot({ path: join(OUT_DIR, '1-landscape-idle-shimmer.png') })
    // The idle-shimmer's box-shadow must now be confined to the circular
    // knob button, not the rectangular wrapper - assert the wrapper itself
    // no longer carries the animation class.
    const wrapperHasShimmer = await page.evaluate(() =>
      document.querySelector('[data-testid="feature-menu-entry"]')?.classList.contains('idle-shimmer') ?? null)
    const knobHasShimmer = await page.evaluate(() =>
      document.querySelector('[data-testid="feature-menu-button"]')?.classList.contains('idle-shimmer') ?? null)
    assert(wrapperHasShimmer === false, `outer .fm-entry wrapper no longer carries idle-shimmer (square shadow source) - was ${wrapperHasShimmer}`)
    assert(knobHasShimmer === true, `circular .fm-entry-knob button now carries idle-shimmer instead - was ${knobHasShimmer}`)

    await page.locator('[data-testid="feature-menu-button"]').click()
    await page.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 5000 })
    await page.waitForTimeout(300)
    await page.screenshot({ path: join(OUT_DIR, '2-landscape-menu-open.png') })

    // Merged header: current-spin-cost now lives inside the bet bar, not a
    // separate line - assert it's a descendant of .fm-betbar.
    const costInBetbar = await page.evaluate(() => {
      const cost = document.querySelector('[data-testid="current-spin-cost"]')
      return !!cost && !!cost.closest('.fm-betbar')
    })
    assert(costInBetbar, 'SPIN COST now sits inside the merged bet-selector row (.fm-betbar)')

    // Paired switch: standing-select-cruise (Normal is active by default) and
    // standing-active-normal must both exist inside ONE shared card.
    const pairedCardHtml = await page.evaluate(() => {
      const card = document.querySelector('[data-testid="feature-card-normal-cruise"]')
      return card ? { count: 1, hasCruiseSelect: !!card.querySelector('[data-testid="standing-select-cruise"]'), hasNormalActive: !!card.querySelector('[data-testid="standing-active-normal"]') } : null
    })
    assert(!!pairedCardHtml, 'Normal + Cruise render inside one paired-switch card (feature-card-normal-cruise)')
    assert(pairedCardHtml?.hasCruiseSelect === true, 'paired card exposes standing-select-cruise (Cruise not yet active)')
    assert(pairedCardHtml?.hasNormalActive === true, 'paired card exposes standing-active-normal (Normal active by default)')

    await page.close()

    // ── Portrait: bet-stepper row spacing ────────────────────────────────
    const portraitPage = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await portraitPage.goto(`http://localhost:${port}`, { waitUntil: 'networkidle' })
    await portraitPage.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await dismissIntro(portraitPage)
    await portraitPage.waitForTimeout(300)
    await portraitPage.screenshot({ path: join(OUT_DIR, '3-portrait-bet-row.png') })

    const gapPx = await portraitPage.evaluate(() => {
      const row = document.querySelector('[data-testid="bet-arrows"]')
      return row ? parseFloat(getComputedStyle(row).gap) : null
    })
    assert(gapPx !== null && gapPx >= 10, `portrait bet-stepper row gap opened up (generous, not the old 2px) - measured ${gapPx}px`)

    const stepBox = await portraitPage.evaluate(() => {
      const btn = document.querySelector('.p-bet-step')
      if (!btn) return null
      const r = btn.getBoundingClientRect()
      return { w: r.width, h: r.height }
    })
    assert(!!stepBox && stepBox.w >= 44 && stepBox.h >= 44, `bet stepper targets stay >=44px (measured ${stepBox?.w}x${stepBox?.h})`)

    await browser.close()
  } finally {
    server.kill()
  }
  console.log('')
  console.log(failures.length === 0 ? 'FSMENU ITERATION 3 PROOF: PASS' : `FSMENU ITERATION 3 PROOF: FAIL (${failures.length})`)
  if (failures.length > 0) { failures.forEach((f) => console.log(`  - ${f}`)); process.exitCode = 1 }
}

run().catch((err) => { console.error(err); process.exitCode = 1 })
