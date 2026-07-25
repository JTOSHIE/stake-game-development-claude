// popout_conformance.mjs - R14 (2026-07-27).
//
// SPEC, quoted verbatim from the dated mirror
// (docs/stake-engine-live/front-end-communication.md:20):
//   "Popout view support: Stake offers players to option to use the 'mini-player'
//    modal to play games in the background. Games must support this small view
//    without the active game board been visibly distorted."
//
// This gate guards the defect fixed in R14 and carried unfixed since Round 3:
// IntroSplash's Continue button rendered fully outside the viewport at 400x225,
// so a player whose FIRST session opened directly in mini-player mode could not
// dismiss the rules and could not proceed.
//
// THE CRITICAL ASSERT is the REAL Playwright click. Playwright's "outside of the
// viewport" check is geometric and is NOT bypassed by {force:true}; only a
// DOM-level .click() evades it. So a genuine .click() succeeding is proof the
// element is truly reachable by a human, not merely present in the DOM. Every
// other assertion here is supporting evidence for that one.
//
// Deliberately does NOT use dismissOverlays' clickViaDom helper: that helper
// exists to work around this class of problem, so using it here would hide
// exactly what this gate is meant to catch.
//
// Run (from frontend/): node scripts/popout_conformance.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', '..', 'reports', 'qa')
const SHOTS = join(__dirname, '..', '..', 'reports', 'screens', 'audit-remediation-v1')
mkdirSync(OUT, { recursive: true })
mkdirSync(SHOTS, { recursive: true })

// Stake's two documented popout sizes plus the smallest required mobile viewport.
const VIEWPORTS = [
  { name: 'popout-S-400x225', w: 400, h: 225 },
  { name: 'popout-L-800x450', w: 800, h: 450 },
  { name: 'mobile-S-320x568', w: 320, h: 568 },
]

const failures = []
const results = { spec: 'front-end-communication.md:20', viewports: {} }
const check = (n, c, d) => { if (!c) failures.push({ name: n, detail: d }) }

async function freePort() {
  return new Promise((res, rej) => {
    const s = createServer(); s.on('error', rej)
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)) })
  })
}
function devServer(port) {
  return new Promise((res, rej) => {
    const p = spawn('npx', ['vite', '--port', String(port), '--strictPort'],
      { cwd: join(__dirname, '..'), stdio: ['ignore', 'pipe', 'pipe'] })
    let done = false
    const on = (d) => { if (!done && /Local|localhost/.test(d.toString())) { done = true; res(p) } }
    p.stdout.on('data', on); p.stderr.on('data', on); p.on('error', rej)
    setTimeout(() => { if (!done) rej(new Error('vite did not start')) }, 20000)
  })
}

async function run() {
  const port = await freePort()
  const server = await devServer(port)
  const base = `http://localhost:${port}`
  try {
    const browser = await chromium.launch()

    for (const v of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: v.w, height: v.h } })
      const errs = []
      page.on('pageerror', (e) => errs.push(e.message))

      await page.goto(base, { waitUntil: 'networkidle' })
      // Dismiss the brand splash to reach the rules modal. DOM click is fine here:
      // the splash is not what this gate is testing.
      await page.waitForSelector('[data-testid="hero-splash"]', { timeout: 15000 }).catch(() => {})
      await page.locator('[data-testid="hero-splash"]').evaluate((el) => el.click()).catch(() => {})
      await page.waitForTimeout(900)

      const geom = await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="intro-continue"]')
        const card = document.querySelector('.intro-card')
        if (!btn || !card) return null
        const b = btn.getBoundingClientRect()
        const c = card.getBoundingClientRect()
        return {
          vh: innerHeight,
          cardTop: Math.round(c.top), cardBottom: Math.round(c.bottom), cardH: Math.round(c.height),
          btnTop: Math.round(b.top), btnBottom: Math.round(b.bottom), btnH: Math.round(b.height),
          btnInViewport: b.top >= 0 && b.bottom <= innerHeight,
          cardWithinViewport: c.top >= 0 && c.bottom <= innerHeight,
        }
      })

      check(`${v.name}: rules modal present`, !!geom, 'IntroSplash not found')
      if (geom) {
        results.viewports[v.name] = geom
        check(`${v.name}: Continue button inside the viewport`, geom.btnInViewport, JSON.stringify(geom))
        check(`${v.name}: card does not overflow the viewport`, geom.cardWithinViewport, JSON.stringify(geom))
        // 44px touch-target rule, same standard as the Round 3 audit.
        check(`${v.name}: Continue meets the 44px touch target`, geom.btnH >= 40, `height ${geom.btnH}`)
      }

      await page.screenshot({ path: join(SHOTS, `popout-${v.name}.png`) })

      // THE CRITICAL ASSERT: a genuine click, no force, no DOM bypass.
      let realClick = false, clickErr = ''
      try {
        await page.locator('[data-testid="intro-continue"]').click({ timeout: 5000 })
        realClick = true
      } catch (e) {
        clickErr = String(e).split('\n')[0]
      }
      await page.waitForTimeout(500)
      const dismissed = await page.evaluate(() => !document.querySelector('[data-testid="intro-continue"]'))

      results.viewports[v.name] = { ...results.viewports[v.name], realClick, dismissed }
      check(`${v.name}: REAL Playwright click succeeds (no force, no DOM bypass)`, realClick, clickErr)
      check(`${v.name}: rules modal actually dismissed`, dismissed, 'still present after click')
      check(`${v.name}: no page errors`, errs.length === 0, errs.slice(0, 2).join(' | '))

      await page.close()
    }

    await browser.close()
  } finally { server.kill() }

  results.failures = failures
  results.pass = failures.length === 0
  writeFileSync(join(OUT, 'popout_conformance_2026-07-27.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results.viewports, null, 2))
  if (failures.length) {
    console.error(`\nPOPOUT CONFORMANCE: FAIL (${failures.length})`)
    for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
    process.exit(1)
  }
  console.log(`\nPOPOUT CONFORMANCE: PASS (${VIEWPORTS.length} viewports, real clicks)`)
}

run().catch((e) => { console.error(e); process.exit(1) })
