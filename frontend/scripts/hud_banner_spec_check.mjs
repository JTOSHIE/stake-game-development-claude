// hud_banner_spec_check.mjs — OWNER AUDIT ROUND 3, item 7.
//
// Enforces docs/HUD_SPEC.md's locked desktop control-banner geometry
// permanently: re-measures every control via a live headless-browser render
// and asserts the EXACT coordinates in that document, not just "close
// enough" - any future edit to HudOverlay.svelte's .fs-hud layout that
// drifts from the locked spec fails this check on sight, and the spec doc
// must be updated in the same commit as any intentional change.
//
// Run (from frontend/): node scripts/hud_banner_spec_check.mjs

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { qaTmpDir } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = qaTmpDir('screens', 'owner-audit-v3', 'hud-banner')
mkdirSync(OUT_DIR, { recursive: true })

// docs/HUD_SPEC.md's locked coordinate table, verbatim.
const SPEC = {
  turbo:    { selector: '.fs-turbo',                     left: 227,  top: 563, width: 82,  height: 82 },
  max:      { selector: '.fs-max',                       left: 325,  top: 580, width: 48,  height: 48 },
  menu:     { selector: '.menu-wrapper',                 left: 389,  top: 582, width: 44,  height: 44 },
  balance:  { selector: '[data-testid="hud-balance"]',   left: 449,  top: 573, width: 200, height: 62 },
  win:      { selector: '[data-testid="hud-win"]',       left: 665,  top: 573, width: 150, height: 62 },
  bet:      { selector: '[data-testid="hud-bet"]',       left: 831,  top: 573, width: 120, height: 62 },
  steppers: { selector: '[data-testid="bet-arrows"]',    left: 967,  top: 578, width: 44,  height: 52 },
  spin:     { selector: '[data-testid="spin-button"]',   left: 1027, top: 562, width: 84,  height: 84 },
  auto:     { selector: '.autoplay-wrapper',             left: 1111, top: 580, width: 48,  height: 48 },
}
const CENTRE_Y = 604
const GAP = 16
const TOUCH_MIN = 44
// Row order left-to-right, for the consistent-gap audit.
const ROW_ORDER = ['turbo', 'max', 'menu', 'balance', 'win', 'bet', 'steppers', 'spin']
// Interactive controls only - BALANCE/WIN/BET plates are display-only and
// exempt from the 44px touch-target rule (per HUD_SPEC.md).
const INTERACTIVE = ['turbo', 'max', 'menu', 'steppers', 'spin', 'auto']

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
async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const failures = []
  const assert = (cond, msg) => { if (!cond) failures.push(msg); console.log(`${cond ? 'PASS' : 'FAIL'}: ${msg}`) }

  try {
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await page.waitForFunction(() => window.__testStores?.balance, { timeout: 8000 })
    await dismissIntro(page)

    // 1. Baseline geometry (typical balance/bet) - exact spec match.
    await page.evaluate(() => { window.__testStores.balance.set(1_000.5); window.__testStores.betAmount.set(5) })
    await page.waitForTimeout(200)
    await page.screenshot({ path: join(OUT_DIR, 'after-desktop.png') })

    const measured = {}
    for (const [key, spec] of Object.entries(SPEC)) {
      const box = await page.locator(spec.selector).boundingBox()
      if (!box) { measured[key] = null; continue }
      measured[key] = { left: Math.round(box.x), top: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) }
    }

    for (const [key, spec] of Object.entries(SPEC)) {
      const m = measured[key]
      assert(!!m, `${key}: element found (${spec.selector})`)
      if (!m) continue
      assert(m.left === spec.left && m.top === spec.top, `${key}: position matches locked spec (left ${m.left}==${spec.left}, top ${m.top}==${spec.top})`)
      assert(m.width === spec.width && m.height === spec.height, `${key}: size matches locked spec (${m.width}x${m.height} == ${spec.width}x${spec.height})`)
      const centreY = m.top + m.height / 2
      assert(Math.abs(centreY - CENTRE_Y) < 0.5, `${key}: centre-Y is exactly ${CENTRE_Y} (measured ${centreY})`)
    }

    // 2. Consistent 16px gap along the row.
    for (let i = 0; i < ROW_ORDER.length - 1; i++) {
      const a = measured[ROW_ORDER[i]], b = measured[ROW_ORDER[i + 1]]
      if (!a || !b) continue
      const gap = b.left - (a.left + a.width)
      assert(gap === GAP, `gap ${ROW_ORDER[i]}->${ROW_ORDER[i + 1]} is exactly ${GAP}px (measured ${gap})`)
    }

    // 3. AUTO tangent to SPIN's right edge - touching, never overlapping.
    const spin = measured.spin, auto = measured.auto
    if (spin && auto) {
      const gap = auto.left - (spin.left + spin.width)
      assert(gap === 0, `AUTO is tangent to SPIN's right edge (gap ${gap}, expected 0)`)
    }

    // 4. 44px+ touch targets on every interactive control.
    for (const key of INTERACTIVE) {
      const m = measured[key]
      if (!m) continue
      assert(m.width >= TOUCH_MIN && m.height >= TOUCH_MIN, `${key}: touch target >= ${TOUCH_MIN}px (measured ${m.width}x${m.height})`)
    }

    // 5. Stress values fit via autofit - a seven-figure balance/win never
    // overflows its plate (scrollWidth <= clientWidth on the autofit target).
    await page.evaluate(() => {
      window.__testStores.balance.set(1_234_567.89)
      window.__testStores.betAmount.set(1)
      window.__testStores.winAmount.set(1_000_000)
    })
    await page.waitForTimeout(200)
    await page.screenshot({ path: join(OUT_DIR, 'stress-values.png') })
    const overflow = await page.evaluate(() => {
      const check = (sel) => {
        const el = document.querySelector(sel)
        if (!el) return null
        return el.scrollWidth > el.clientWidth + 1
      }
      return {
        balance: check('[data-testid="hud-balance"] .fs-value'),
        win: check('[data-testid="hud-win"] .fs-value'),
      }
    })
    assert(overflow.balance === false, `BALANCE plate does not overflow at $1,234,567.89 (autofit)`)
    assert(overflow.win === false, `WIN plate does not overflow at $1,000,000.00 (autofit)`)

    await browser.close()
  } finally {
    server.kill()
  }

  console.log('')
  console.log(failures.length === 0 ? 'HUD BANNER SPEC CHECK: PASS' : `HUD BANNER SPEC CHECK: FAIL (${failures.length})`)
  if (failures.length > 0) { failures.forEach((f) => console.log(`  - ${f}`)); process.exitCode = 1 }
}

run().catch((err) => { console.error(err); process.exitCode = 1 })
