// entry_continue_touch_gate.mjs, TR-085 (2026-07-27).
//
// THE DEFECT. The free-spins entry card's TAP TO CONTINUE button measured
// 88.1 x 33.4px at pixel7-landscape, against the 44px touch minimum the same
// audit applies to every other control. It is the control a player must press
// to continue a bonus, so it is not a control to leave under the floor.
//
// WHY THE EXISTING FIX DID NOT COVER IT. `.entry-continue` already carries
// `min-height: 96px`, and that number was not arbitrary: the button lives
// inside the LAYOUT_SPEC 1280x720 stage, which is scaled down to fit, and 96
// pre-scale was chosen to clear 44 on screen at the ~0.58x that portrait was
// measured at. Landscape scales further. 33.4 / 96 = 0.348, so at
// pixel7-landscape the stage runs at roughly 0.348x and the same 96px lands at
// 33.4px. The old fix was correct for the case it was measured against and
// silently short for the one it was not.
//
// WHY NOT SIMPLY RAISE min-height. Reaching 44px at 0.348x needs about 126
// stage units, a third taller again, and that height is spent on every profile
// including desktop, where the button is already generously sized. A control
// that has to be enormous everywhere to be tappable somewhere is the wrong
// shape of fix.
//
// THE PATTERN USED INSTEAD is the one already established in this codebase for
// exactly this problem: a compact visual with an extended hit area, as
// `.m-fm-entry` in FeatureMenu.svelte does with `::after { inset: -4px }`. The
// visual keeps its 96 units; the pseudo-element extends the pressable region
// beyond it. Nothing moves, nothing grows on screen, and the target clears the
// floor at the smallest scale the game actually renders at.
//
// WHAT THIS GATE ASSERTS. The RENDERED hit box, the union of the button and its
// ::after, is at least 44px in both dimensions at every measured profile,
// including the two landscape ones where the defect was found. It measures the
// real element in a real triggered feature, not a mock of it.
//
// Run (from frontend/, dev server NOT required, it starts its own):
//   node scripts/entry_continue_touch_gate.mjs
//   node scripts/entry_continue_touch_gate.mjs --self-test   convention (p)

import { chromium, devices } from 'playwright'
import { writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { evidenceDir, announceEvidenceMode } from './lib/evidencePaths.mjs'

const QA = evidenceDir('reports', 'qa')
announceEvidenceMode('entry_continue_touch_gate')

const SELF_TEST = process.argv.includes('--self-test')
const MIN_TOUCH_PX = 44

// The same device profiles portrait_layout_conformance.mjs audits, which is
// where TR-085 was found. Landscape is the binding case and is why both
// orientations are here rather than portrait alone.
const PROFILES = [
  { label: 'iphone14-portrait', device: 'iPhone 14' },
  { label: 'iphone14-landscape', device: 'iPhone 14 landscape' },
  { label: 'pixel7-portrait', device: 'Pixel 7' },
  { label: 'pixel7-landscape', device: 'Pixel 7 landscape' },
]

const freePort = () => new Promise((res) => {
  const srv = createServer()
  srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => res(port)) })
})

const port = await freePort()
const dev = spawn('npx', ['vite', '--port', String(port), '--strictPort'], {
  cwd: join(import.meta.dirname, '..'), stdio: ['ignore', 'pipe', 'pipe'],
})
await new Promise((res, rej) => {
  let done = false
  dev.stdout.on('data', (d) => {
    if (!done && String(d).includes('ready in')) { done = true; res() }
  })
  setTimeout(() => { if (!done) rej(new Error('vite dev did not start in time')) }, 30000)
})

// Measures the union of the button's own border box and its ::after box, which
// together are what a finger can actually press. getBoundingClientRect does not
// include a pseudo-element, so the ::after geometry is read from its computed
// style and composed manually.
//
// THE UNIT TRAP, and it produced a false PASS before it was caught. The whole
// point of this control is that it lives inside a stage that is SCALED, so the
// two sources of geometry here are in different units: getBoundingClientRect
// returns RENDERED pixels, already scaled, while getComputedStyle returns the
// author's value in unscaled stage units. Adding one to the other reported a
// 47px target as 86px, which would have passed a button that was still under
// the floor. The element's own scale is recovered from the ratio of its
// rendered height to its layout height and applied to the insets, so both
// terms are in rendered pixels before they are summed.
const MEASURE = `(() => {
  const el = document.querySelector('[data-testid="entry-continue"]')
  if (!el) return null
  const b = el.getBoundingClientRect()
  const cs = getComputedStyle(el, '::after')
  const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0 }
  const hasAfter = cs && cs.content && cs.content !== 'none'
  // offsetHeight/Width are the unscaled layout box; the rect is the rendered
  // one. Their ratio IS the cumulative transform scale on this element.
  const scaleY = el.offsetHeight ? b.height / el.offsetHeight : 1
  const scaleX = el.offsetWidth ? b.width / el.offsetWidth : 1
  // Insets are negative outward in the pattern, so an inset of -28px on a side
  // extends the box by 28 stage units, which is 28 * scale rendered pixels.
  const top = hasAfter ? Math.max(0, -num(cs.top)) * scaleY : 0
  const bottom = hasAfter ? Math.max(0, -num(cs.bottom)) * scaleY : 0
  const left = hasAfter ? Math.max(0, -num(cs.left)) * scaleX : 0
  const right = hasAfter ? Math.max(0, -num(cs.right)) * scaleX : 0
  return {
    visualW: +b.width.toFixed(1),
    visualH: +b.height.toFixed(1),
    hitW: +(b.width + left + right).toFixed(1),
    hitH: +(b.height + top + bottom).toFixed(1),
    stageScale: +scaleY.toFixed(4),
    layoutH: el.offsetHeight,
    afterPresent: !!hasAfter,
    afterExtensionRenderedPx: { top: +top.toFixed(1), bottom: +bottom.toFixed(1) },
  }
})()`

async function measureProfile(browser, profile, seedCss) {
  const ctx = await browser.newContext({ ...devices[profile.device] })
  const page = await ctx.newPage()
  await page.goto(`http://localhost:${port}/?mockCategory=trigger_3`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
  await page.waitForFunction(() => window.__testStores?.balance, { timeout: 10000 })
  await dismissIntro(page)
  if (seedCss) await page.addStyleTag({ content: seedCss })
  await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
  await page.locator('[data-testid="spin-button"]').click()
  await page.waitForSelector('[data-testid="entry-continue"]', { timeout: 20000 })
  await page.waitForTimeout(900)
  const m = await page.evaluate(MEASURE)

  // A measured target that does not actually take a press is not a fix. This
  // clicks a point INSIDE the ::after extension but OUTSIDE the visual button,
  // with a real mouse event and no force, and requires the gate to advance. If
  // the pseudo-element were not receiving pointer events, or were painted under
  // something else, the extra area would measure correctly and be dead to a
  // player, which is exactly the failure worth catching here.
  let extensionClickable = null
  if (m && m.afterPresent) {
    const box = await page.locator('[data-testid="entry-continue"]').boundingBox()
    if (box) {
      const belowVisual = { x: box.x + box.width / 2, y: box.y + box.height + 3 }
      try {
        await page.mouse.click(belowVisual.x, belowVisual.y)
        await page.waitForSelector('[data-testid="entry-continue"]',
          { state: 'detached', timeout: 4000 })
        extensionClickable = true
      } catch {
        extensionClickable = false
      }
    }
  }

  await ctx.close()
  return { ...(m ?? {}), extensionClickable, found: !!m }
}

async function run(seedCss, label) {
  const browser = await chromium.launch()
  const rows = []
  for (const profile of PROFILES) {
    const m = await measureProfile(browser, profile, seedCss)
    // An extension that measures big but takes no press fails too.
    const sizeOk = m.found && m.hitW >= MIN_TOUCH_PX && m.hitH >= MIN_TOUCH_PX
    const clickOk = m.extensionClickable !== false
    const pass = sizeOk && clickOk
    rows.push({ profile: profile.label, ...m, sizeOk, clickOk, pass })
    if (m.found) {
      console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${profile.label.padEnd(20)} `
        + `visual ${String(m.visualW).padStart(6)} x ${String(m.visualH).padStart(5)}  `
        + `hit ${String(m.hitW).padStart(6)} x ${String(m.hitH).padStart(5)}  `
        + `scale ${m.stageScale}  `
        + `ext press ${m.extensionClickable === null ? 'n/a' : (m.extensionClickable ? 'ok' : 'DEAD')}`)
    } else {
      console.log(`  [FAIL] ${profile.label.padEnd(20)} button not found`)
    }
  }
  await browser.close()
  const failures = rows.filter((r) => !r.pass)
  console.log(`${label}: ${rows.length - failures.length} of ${rows.length} profiles clear ${MIN_TOUCH_PX}px`)
  return { rows, failures }
}

let exitCode = 0

if (SELF_TEST) {
  // Convention (p). The gate claims a class closed, so it must be seen to fail
  // on the defect in the form it really occurred: the hit extension removed,
  // leaving the 96-unit visual to scale below the floor in landscape. If the
  // gate stays green with the fix disabled it is asserting nothing.
  console.log('SELF-TEST: seeding the exact defect, ::after hit extension removed\n')
  const seeded = await run(
    '.entry-continue::after { content: none !important; }',
    '  seeded',
  )
  console.log('')
  const real = await run(null, '  unseeded')
  console.log('')
  const seededCaughtLandscape = seeded.failures.some((f) => f.profile.includes('landscape'))
  if (!seededCaughtLandscape) {
    console.log('SELF-TEST FAILED: removing the hit extension did not turn the gate red '
      + 'in landscape, so a green run proves nothing')
    exitCode = 1
  } else if (real.failures.length) {
    console.log('SELF-TEST FAILED: the real build does not pass its own gate')
    exitCode = 1
  } else {
    console.log(`SELF-TEST PASSED: the seeded build failed at `
      + `${seeded.failures.map((f) => f.profile).join(', ')} and the real build stayed green`)
  }
} else {
  console.log(`ENTRY CONTINUE TOUCH GATE (TR-085), floor ${MIN_TOUCH_PX}px\n`)
  const { rows, failures } = await run(null, 'RESULT')
  writeFileSync(join(QA, 'entry_continue_touch_gate.json'), JSON.stringify({
    generated: new Date().toISOString(),
    row: 'TR-085',
    script: 'frontend/scripts/entry_continue_touch_gate.mjs',
    minTouchPx: MIN_TOUCH_PX,
    rows,
    pass: failures.length === 0,
  }, null, 2) + '\n')
  console.log(failures.length
    ? `\nENTRY CONTINUE TOUCH GATE: FAIL at ${failures.map((f) => f.profile).join(', ')}`
    : '\nENTRY CONTINUE TOUCH GATE: PASS')
  exitCode = failures.length ? 1 : 0
}

dev.kill('SIGTERM')
process.exit(exitCode)
