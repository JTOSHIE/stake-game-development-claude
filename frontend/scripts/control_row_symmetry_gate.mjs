#!/usr/bin/env node
//
// control_row_symmetry_gate.mjs: the desktop control row's spacing is one scale,
// and the slab sits symmetrically inside it.
//
// WHY THIS EXISTS
// ---------------
// The row's nine horizontal positions were nine hand-set pixel values that all
// happened to encode the same 16px step. Nothing asserted that they still did,
// and one of them had already drifted: the slab's right inset was 9px against a
// left inset of 16px, so the two OUTER gaps, TURBO to slab and slab to SPIN,
// read 0.00 and 7.00. Both are now derived from a single token, and this gate
// reads the rendered result back off the DOM so a future edit cannot quietly
// re-introduce a hand-set value.
//
// WHAT IT ASSERTS, all measured from getBoundingClientRect at two viewports:
//
//   1. THE OUTER GAPS ARE EQUAL. turbo.right to slab.left equals
//      slab.right to spin.left, to two decimal places.
//   2. EVERY CONTROL-TO-CONTROL GAP IS THE SAME TOKEN. TURBO through SPIN, the
//      seven gaps HUD_SPEC.md rule 2 locks at 16px in stage units, equal to each
//      other at whatever the viewport's scale makes them.
//   3. SPIN TO AUTO IS TANGENT. HUD_SPEC.md rule 4, deliberately zero, asserted
//      so the token cannot be applied to it by a later tidy-up.
//
// WHAT IT DELIBERATELY DOES NOT ASSERT, AND WHY
// ---------------------------------------------
// The brief that produced this gate also asked that the slab CENTRE on the
// canvas centre. That is not assertable today and the reason is arithmetic
// rather than an oversight, so it is printed as a measurement instead of a
// verdict:
//
//   the slab's contents run MAX.left to STEPPERS.right, and both are locked by
//   HUD_SPEC.md. Their midpoint is 668 in stage units, not 640. A slab centred
//   on 640 with EQUAL outer gaps would need turbo.right and spin.left to be
//   equidistant from 640; they are 331 and 387. No slab geometry satisfies both
//   while the controls stay where the locked spec puts them.
//
// Centring the slab therefore means moving locked controls, which is an owner
// decision. The gate reports the offset every run so the number stays visible.
//
// SEEDED SELF-TEST, convention (p): the seed skews ONE gap by 6px in a scratch
// copy of the source, rebuilds to the gitignored scratch tree, and the run must
// exit non-zero NAMING the skewed gap. The working file is restored in a finally
// and verified byte for byte.
//
// RUNNER: npx tsx or node, from frontend/. Exit 0 on PASS, non-zero on FAIL.
//   node scripts/control_row_symmetry_gate.mjs
//   node scripts/control_row_symmetry_gate.mjs --self-test

import { chromium } from 'playwright'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { startStaticServer, assertNoSurvivors } from './lib/previewServer.mjs'
import { qaTmpDir } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const HUD = join(ROOT, 'src/lib/components/HudOverlay.svelte')
const RGS_HOST = 'rgs.control-row-gate.invalid'
const START_MICROS = 100_000_000
const EPS = 0.01

// Both are fullscreen-profile viewports: 1280x720 is the design surface and
// 1200x675 is the owner's own capture ratio, where the stage scales by 0.9375
// and every gap should scale with it rather than drifting.
const VIEWPORTS = [
  { key: 'desktop-1280x720', width: 1280, height: 720 },
  { key: 'owner-1200x675', width: 1200, height: 675 },
]

// Left to right. The slab is measured separately: it is a backdrop, not a
// member of the control sequence.
const CONTROLS = [
  ['turbo', '[data-testid="hud-turbo"]'],
  ['max', '[data-testid="max-chip"]'],
  ['menu', '.fs-menu'],
  ['balance', '[data-testid="hud-balance"]'],
  ['win', '[data-testid="hud-win"]'],
  ['bet', '[data-testid="hud-bet"]'],
  ['steppers', '[data-testid="bet-arrows"]'],
  ['spin', '[data-testid="spin-button"]'],
  ['auto', '.autoplay-wrapper'],
]

async function routeWallet(page) {
  await page.route(`**://${RGS_HOST}/**`, async (route) => {
    const url = route.request().url()
    const json = (b) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(b) })
    if (url.includes('/wallet/authenticate')) {
      return json({
        balance: { amount: START_MICROS, currency: 'USD' },
        config: {
          minBet: 100_000, maxBet: 100_000_000, stepBet: 100_000, defaultBetLevel: 1_000_000,
          betLevels: [100_000, 200_000, 500_000, 1_000_000], jurisdiction: {},
        },
        round: null,
      })
    }
    if (url.includes('/wallet/balance')) return json({ balance: { amount: START_MICROS, currency: 'USD' } })
    return json({})
  })
}

async function measure(distDir) {
  const server = await startStaticServer(distDir)
  const browser = await chromium.launch()
  const readings = []
  try {
    for (const v of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: v.width, height: v.height } })
      await routeWallet(page)
      await page.goto(`http://localhost:${server.port}/?sessionID=control-row-gate&rgs_url=${RGS_HOST}&lang=en`,
        { waitUntil: 'domcontentloaded' })
      await page.locator('[data-testid="spin-button"]').first().waitFor({ state: 'visible', timeout: 45_000 })
      // Past the two boot surfaces, exactly as the other browser gates do.
      for (let i = 0; i < 12; i++) {
        const hero = page.locator('.hero-splash').first()
        if (await hero.count() && await hero.isVisible().catch(() => false)) {
          await hero.click({ force: true }).catch(() => {}); await page.waitForTimeout(350); continue
        }
        const cont = page.locator('[data-testid="intro-continue"]').first()
        if (await cont.count() && await cont.isVisible().catch(() => false)) {
          await cont.click({ force: true }).catch(() => {}); await page.waitForTimeout(350); continue
        }
        break
      }
      await page.waitForTimeout(1200)
      const r = await page.evaluate(({ CONTROLS }) => {
        const box = (el) => {
          const b = el.getBoundingClientRect()
          return { left: +b.left.toFixed(2), right: +b.right.toFixed(2), w: +b.width.toFixed(2),
                   centreX: +((b.left + b.right) / 2).toFixed(2) }
        }
        const vis = (el) => {
          const b = el.getBoundingClientRect(); const cs = getComputedStyle(el)
          return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'
        }
        const pick = (sel) => {
          for (const el of document.querySelectorAll(sel)) if (vis(el)) return box(el)
          return null
        }
        const out = { controls: {}, slab: pick('[data-testid="hud-panel"]') }
        for (const [name, sel] of CONTROLS) out.controls[name] = pick(sel)
        const stage = document.querySelector('.canvas-inner') || document.querySelector('.game-stage')
        out.canvas = stage ? box(stage) : null
        return out
      }, { CONTROLS })
      await page.close()
      readings.push({ viewport: v, ...r })
    }
    return readings
  } finally {
    await browser.close().catch(() => {})
    server.close()
  }
}

function judge(readings) {
  const failures = []
  const ok = (cond, msg) => { console.log(`  ${cond ? 'ok    ' : 'FAIL  '}  ${msg}`); if (!cond) failures.push(msg) }
  for (const r of readings) {
    const v = r.viewport.key
    const c = r.controls
    if (!r.slab || !r.canvas || Object.values(c).some((x) => !x)) {
      ok(false, `${v}: every control and the slab are mounted`)
      continue
    }
    // 1. the two outer gaps
    const outerLeft = +(r.slab.left - c.turbo.right).toFixed(2)
    const outerRight = +(c.spin.left - r.slab.right).toFixed(2)
    ok(Math.abs(outerLeft - outerRight) <= EPS,
      `${v}: the two OUTER gaps are equal (turbo to slab ${outerLeft.toFixed(2)}, `
      + `slab to spin ${outerRight.toFixed(2)})`)

    // 2. one token along the row, TURBO through SPIN
    const seq = ['turbo', 'max', 'menu', 'balance', 'win', 'bet', 'steppers', 'spin']
    const gaps = []
    for (let i = 0; i < seq.length - 1; i++) gaps.push(+(c[seq[i + 1]].left - c[seq[i]].right).toFixed(2))
    const token = gaps[0]
    const uniform = gaps.every((g) => Math.abs(g - token) <= EPS)
    ok(uniform, `${v}: every control-to-control gap is the same token (${gaps.map((g) => g.toFixed(2)).join(', ')})`)

    // 3. SPIN to AUTO tangent, HUD_SPEC.md rule 4
    const tangent = +(c.auto.left - c.spin.right).toFixed(2)
    ok(Math.abs(tangent) <= EPS, `${v}: AUTO is tangent to SPIN (${tangent.toFixed(2)})`)

    // REPORTED, not asserted. See the header for why this cannot be a verdict
    // until the owner rules on moving locked controls.
    const off = +(r.slab.centreX - r.canvas.centreX).toFixed(2)
    console.log(`  note    ${v}: slab centre is ${off >= 0 ? '+' : ''}${off.toFixed(2)} from the canvas centre `
      + `(contents midpoint is locked by HUD_SPEC.md; centring needs an owner ruling)`)
  }
  return failures
}

/**
 * Skew ONE gap by 6px in a scratch copy of the source and rebuild.
 *
 * The seed moves the slab's LEFT edge only, which is the exact shape of the
 * defect this gate exists to catch: an asymmetric slab, one outer gap wider than
 * the other, with every control still where the locked spec puts it.
 */
function buildSeededDist() {
  const original = readFileSync(HUD, 'utf-8')
  const ARM = '--fs-x-slab: calc(var(--fs-x-max) - var(--fs-row-gap));'
  if (!original.includes(ARM)) throw new Error('seed: the slab token was not found in HudOverlay.svelte')
  const severed = original.replace(ARM, '--fs-x-slab: calc(var(--fs-x-max) - var(--fs-row-gap) - 6px);')
  const out = join(qaTmpDir('control-row-seed'), 'dist')
  try {
    writeFileSync(HUD, severed)
    execFileSync(join(ROOT, 'node_modules/.bin/vite'), ['build', '--outDir', out, '--emptyOutDir'],
      { cwd: ROOT, stdio: 'pipe' })
  } finally {
    writeFileSync(HUD, original)
  }
  if (readFileSync(HUD, 'utf-8') !== original) {
    throw new Error('seed: HudOverlay.svelte was NOT restored, refusing to continue')
  }
  return out
}

;(async () => {
  const selfTest = process.argv.includes('--self-test')

  if (selfTest) {
    console.log('CONTROL ROW SYMMETRY GATE SELF-TEST (convention p)\n')
    console.log('SEEDED VIOLATION: the slab\'s left inset is widened by 6px in a scratch copy of the')
    console.log('source, so the two outer gaps become unequal while every control stays put\n')
    let seededDist
    try {
      seededDist = buildSeededDist()
    } catch (e) {
      console.error(`  ERROR   ${e.message}`)
      process.exit(1)
    }
    const failures = judge(await measure(seededDist))
    rmSync(seededDist, { recursive: true, force: true })
    const caught = failures.some((f) => f.includes('the two OUTER gaps are equal'))
    console.log('')
    console.log(`  ${caught ? 'caught' : 'MISSED'}  the skewed outer gap fails the gate, by name`)
    if (!caught) {
      console.error('\nCONTROL ROW SYMMETRY GATE SELF-TEST: FAIL, a seeded 6px skew did not fail the gate.')
      process.exit(1)
    }
    if (!assertNoSurvivors('control row symmetry gate self-test')) {
      console.error('\nCONTROL ROW SYMMETRY GATE SELF-TEST: FAIL, this gate left processes behind')
      process.exit(1)
    }
    console.log('CONTROL ROW SYMMETRY GATE SELF-TEST: PASS (the seeded skew reproduces and is caught)')
    process.exit(0)
  }

  console.log('CONTROL ROW SYMMETRY GATE\n')
  const failures = judge(await measure(join(ROOT, 'dist')))
  console.log('')
  if (failures.length) {
    for (const f of failures) console.error(`  ${f}`)
    console.error(`\nCONTROL ROW SYMMETRY GATE: FAIL (${failures.length})`)
    process.exit(1)
  }
  if (!assertNoSurvivors('control row symmetry gate')) {
    console.error('\nCONTROL ROW SYMMETRY GATE: FAIL, this gate left processes behind')
    process.exit(1)
  }
  console.log('CONTROL ROW SYMMETRY GATE: PASS (one spacing scale, symmetric slab, tangent AUTO)')
  process.exit(0)
})()
