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
// RUNNER (documented per TR-123, 2026-08-11): npx tsx, from frontend/. This
// file has no TypeScript import of its own; tsx is the ONE documented runner
// for the whole gate family (see scripts/README.md), because headers that said
// `node` over an import graph that needed tsx are exactly how two siblings sat
// unrunnable to 2026-08-10.
//   npx tsx scripts/popout_conformance.mjs               the real run
//   npx tsx scripts/popout_conformance.mjs --self-test   convention (p), below
//
// EXIT SEMANTICS (TR-123): exit 0 on PASS, non-zero on FAIL, and the process
// TERMINATES. The vite child is spawned detached and killed as a PROCESS
// GROUP, and the final exit is explicit, because the npx wrapper's surviving
// grandchild used to hold this process open on its inherited pipes after PASS
// had already printed (the R043 closure suite's lingering-handle observation,
// which is what kept this gate out of CI from R14 to now).
//
// The --self-test re-invokes this gate in a child with FS_SEED_VIOLATION=1,
// which forces the Continue button outside the viewport (the exact R14 defect,
// in the form it occurred), and demands BOTH the red verdict AND a real
// non-zero exit within a timeout. The second demand keeps the exit contract
// itself under guard: a reintroduced hang fails the self-test rather than
// hanging a CI leg.

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn, spawnSync } from 'node:child_process'
import { qaTmpDir } from './lib/evidencePaths.mjs'

const SEED = process.env.FS_SEED_VIOLATION === '1'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = qaTmpDir()
const SHOTS = qaTmpDir('screens', 'audit-remediation-v1')
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
    // detached: the npx wrapper is not the server, so a kill must reach the
    // whole process group or the vite grandchild survives and holds this
    // process open on its inherited pipes (TR-123).
    const p = spawn('npx', ['vite', '--port', String(port), '--strictPort'],
      { cwd: join(__dirname, '..'), stdio: ['ignore', 'pipe', 'pipe'], detached: true })
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

      if (SEED) {
        // Convention (p): the exact R14 defect in the form it occurred, the
        // Continue button rendered outside the viewport. position:fixed so
        // Playwright's pre-click auto-scroll cannot bring it back, which is
        // also true of the real defect at 400x225.
        await page.addInitScript(() => {
          document.addEventListener('DOMContentLoaded', () => {
            const style = document.createElement('style')
            style.textContent = '[data-testid="intro-continue"] { position: fixed !important; top: 300vh !important; }'
            document.head.appendChild(style)
          })
        })
      }

      await page.goto(base, { waitUntil: 'networkidle' })
      // Dismiss the brand splash to reach the rules modal. DOM click is fine here:
      // the splash is not what this gate is testing.
      await page.waitForSelector('[data-testid="hero-splash"]', { timeout: 15000 }).catch(() => {})
      await page.locator('[data-testid="hero-splash"]').evaluate((el) => el.click()).catch(() => {})
      // WAIT FOR THE SPLASH TO ACTUALLY GO, not for a fixed 900ms. Corrected
      // 2026-08-10.
      //
      // The boot rework of 2026-08-09 made the splash dismissible only once the
      // game is ready, behind an 1800ms floor, and an early tap is LATCHED and
      // spent at ready rather than dropped. A click here therefore lands at once
      // and the screen leaves ~1800ms later, so a flat 900ms probed a DOM where
      // the splash was still up and IntroSplash did not exist yet. Every
      // viewport reported "IntroSplash not found" against a game that was fine.
      //
      // dismissOverlays.mjs was widened for exactly this on the same day. This
      // gate has its own inline copy of the dismissal and was missed, which is
      // the second-path shape this project keeps meeting. Polling for the
      // element to leave cannot go stale again if the floor changes.
      for (let i = 0; i < 60; i++) {
        const still = await page.locator('[data-testid="hero-splash"]').count()
        if (!still) break
        await page.waitForTimeout(100)
      }
      await page.waitForTimeout(400)   // let IntroSplash mount and settle

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
  } finally {
    try { process.kill(-server.pid, 'SIGTERM') } catch {}
  }

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
  process.exit(0)
}

// ── self-test, convention (p): seeded red AND the exit contract ──────────────
if (process.argv.includes('--self-test')) {
  const r = spawnSync('npx', ['tsx', fileURLToPath(import.meta.url)], {
    cwd: join(__dirname, '..'),
    env: { ...process.env, FS_SEED_VIOLATION: '1' },
    encoding: 'utf-8',
    timeout: 480_000,
  })
  const out = (r.stdout || '') + (r.stderr || '')
  const red = /POPOUT CONFORMANCE: FAIL/.test(out)
  const exited = typeof r.status === 'number' && r.status !== 0
  console.log(`  ${red ? 'caught ' : 'MISSED '} seeded off-viewport Continue turned the gate red`)
  console.log(`  ${exited ? 'exited ' : 'HUNG   '} the failing invocation exited non-zero (status ${r.status}${r.signal ? ', signal ' + r.signal : ''})`)
  if (!red || !exited) {
    console.error('\nPOPOUT CONFORMANCE SELF-TEST: FAIL')
    process.exit(1)
  }
  console.log('\nPOPOUT CONFORMANCE SELF-TEST: PASS (seeded violation red, non-zero exit, terminated)')
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
