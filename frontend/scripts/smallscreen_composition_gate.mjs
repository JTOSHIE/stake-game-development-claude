// smallscreen_composition_gate.mjs, FS_SMALLSCREEN_RECOMPOSE (2026-07-26).
//
// WHAT THIS ASSERTS, AND WHY IT IS NOT layout_fit_gate
// ---------------------------------------------------
// layout_fit_gate asks whether the frame FITS and whether every control is
// REACHABLE. Both were already green when the owner opened the live build and
// found the small-screen layouts wrong anyway, because "fits and reachable" says
// nothing about COMPOSITION. A stage can fit perfectly, keep every control
// reachable, and still be shoved into one corner at 40% of the width it had.
// That is exactly what the owner's captures show, so this gate asserts the three
// things a fit gate cannot see:
//
//   CENTRED    the frame's centre must sit on the viewport's centre. The Popout S
//              defect measured +110.6px of right-anchoring while the fit gate was
//              green, because nothing was checking.
//   FILLS      the stage must genuinely use the box it was given. Asserted as a
//              per-preset floor on the grid's rendered width, each floor DERIVED
//              from the layout maths (see FLOORS below) rather than pinned to
//              whatever the current build happens to produce, so this cannot
//              become a regression test for a defect.
//   NO DEAD BAND
//              the vertical gap between the portrait HUD's top group and its
//              controls row must not exceed the ONE deliberate CSS gap. This is
//              swept across viewport HEIGHTS, not just the seven presets, because
//              the defect was proportional to viewport height and the presets
//              alone would have missed it. See THE HEIGHT SWEEP below.
//
// Plus, at Popout S only:
//   FEATURES USABLE
//              the FEATURES panel opens from the mini strip and its mode cards are
//              actually reachable. Before this pass the panel gave the card list a
//              28px window onto 663px of content and all four mode cards lay
//              outside their clipping ancestor, so a player in the popout could
//              open FEATURES and reach nothing.
//
// THE HEIGHT SWEEP, and why it exists
// -----------------------------------
// The owner reported a dead band of "roughly 250px" at Mobile L. On this machine
// Mobile L (425x812) measured 30.8px, and the two numbers were both correct: the
// gap is (viewportH - wordmark - canvas - hudContent), which grows 1.000px for
// every extra px of viewport height once the canvas is width-bound. Measured
// slope over 812..1400 was exactly 1.000, and ~250px implies a viewport about
// 1031px tall. The platform's Screen preset sets the WIDTH; the height is
// whatever the window has, so "Mobile L" on the owner's monitor was ~1030px tall,
// not 812. A gate that checked only the seven nominal presets would have gone
// green on the very defect that was reported. So the dead band is swept.
//
// Run (from frontend/, after `npm run build`):
//   node scripts/smallscreen_composition_gate.mjs                 assert + capture
//   node scripts/smallscreen_composition_gate.mjs --capture-only  capture only
//   node scripts/smallscreen_composition_gate.mjs --self-test     convention (p)
//   FS_WRITE_EVIDENCE=1 ... --phase before|after                  committed captures

import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { evidenceDir, announceEvidenceMode } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const argv = process.argv.slice(2)
const CAPTURE_ONLY = argv.includes('--capture-only')
const SELF_TEST = argv.includes('--self-test')
const phaseArg = argv.indexOf('--phase')
const PHASE = phaseArg >= 0 ? argv[phaseArg + 1] : 'after'

const SCREENS = evidenceDir('reports', 'screens', 'smallscreen-recompose-2026-07-26', PHASE)
const QA = evidenceDir('reports', 'qa')
announceEvidenceMode('smallscreen_composition_gate')

// The platform's own Screen menu, verbatim, same seven as layout_fit_gate.
const PRESETS = [
  { name: 'Desktop',   width: 1200, height: 675 },
  { name: 'Laptop',    width: 1024, height: 576 },
  { name: 'Popout S',  width: 400,  height: 225 },
  { name: 'Popout L',  width: 800,  height: 450 },
  { name: 'Mobile L',  width: 425,  height: 812 },
  { name: 'Mobile M',  width: 375,  height: 667 },
  { name: 'Mobile S',  width: 320,  height: 568 },
]

// ── THE FILL FLOORS, DERIVED ────────────────────────────────────────────────
//
// Each floor is computed from the layout maths, not observed and pinned. The
// stage geometry is `.grid-slot` 522x349 at (379,143.5) and `.game-frame`
// 640x468 at (320,84) inside the 1280x720 stage (App.svelte's own rules, and
// measured at Desktop as 522.0x349.0 and 640.0x468.1). The portrait scale is
// min(0.96*vw/522, availH/468) and the mini scale is min(vw/640, availH/534).
//
// Where the WIDTH term binds the grid reaches 96% of the viewport by
// construction. Where the HEIGHT term binds the grid cannot reach 96% without
// either shrinking the HUD below its 44px touch targets or cropping into the
// frame, and neither is acceptable, so the floor is the height-bound arithmetic
// and the gate says so rather than pretending 96% is reachable.
//
//   Mobile L 425x812  width-bound   0.96*425/522 = 0.7816 -> 522*s/425 = 96.0%
//   Mobile M 375x667  width-bound   0.96*375/522 = 0.6897 -> 96.0%
//   Mobile S 320x568  HEIGHT-bound  availH 239 / 468 = 0.5107 -> 522*s/320 = 83.3%
//   Popout S 400x225  HEIGHT-bound  availH 181 / 534 = 0.3390 -> 522*s/400 = 44.2%
//
// Desktop, Laptop and Popout L are the untouched scale(S) landscape profile and
// are asserted for centring and no-regression only, at their measured values.
const FLOORS = {
  'Mobile L': 94.0,
  'Mobile M': 94.0,
  'Mobile S': 81.0,
  'Popout S': 42.0,
  'Desktop': 40.0,
  'Laptop': 40.0,
  'Popout L': 33.0,
}

// The ONE deliberate breathing gap, `.p-hud { gap: 10px }` in HudOverlay.svelte.
// Anything beyond this plus sub-pixel tolerance is surplus showing as a hole.
const HUD_GAP_PX = 10
const DEAD_BAND_TOLERANCE = 2.5
// Heights swept at 425 wide. 1031 is the height the owner's "roughly 250px"
// implies, so the reported case is measured directly rather than inferred.
const SWEEP_HEIGHTS = [568, 667, 740, 812, 900, 1000, 1031, 1100, 1200, 1400]
const CENTRE_TOLERANCE = 1.5

const RGS_HOST = 'rgs.smallscreen-gate.invalid'
const authBody = () => ({
  balance: { amount: 100_000_000, currency: 'USD' },
  config: {
    minBet: 100_000, maxBet: 100_000_000, stepBet: 100_000,
    defaultBetLevel: 1_000_000, betLevels: [100_000, 500_000, 1_000_000, 2_000_000],
    jurisdiction: {
      socialCasino: false, disabledFullscreen: false, disabledTurbo: false,
      disabledSuperTurbo: false, disabledAutoplay: false, disabledSlamstop: false,
      disabledSpacebar: false, disabledBuyFeature: false, displayNetPosition: false,
      displayRTP: false, displaySessionTimer: false, minimumRoundDuration: 0,
    },
  },
  round: null,
})

async function getFreePort() {
  return new Promise((res, rej) => {
    const srv = createServer()
    srv.on('error', rej)
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => res(port)) })
  })
}
function startPreview(port) {
  return new Promise((res, rej) => {
    const proc = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
      cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], detached: true,
    })
    let done = false
    const onData = (d) => {
      const s = d.toString()
      if (!done && (/Local/.test(s) || /localhost:\d+/.test(s))) { done = true; res(proc) }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', rej)
    setTimeout(() => { if (!done) rej(new Error('vite preview did not start in time')) }, 20000)
  })
}
function killPreview(proc) {
  try { process.kill(-proc.pid, 'SIGTERM') } catch { try { proc.kill() } catch {} }
}

// Same watchdog rationale as layout_fit_gate: an orphaned preview pipe once hung
// the CI job after it had already printed PASS.
const GATE_TIMEOUT_MS = 8 * 60_000
setTimeout(() => {
  console.error(`SMALLSCREEN COMPOSITION GATE: HARD TIMEOUT after ${GATE_TIMEOUT_MS / 1000}s, failing red`)
  process.exit(1)
}, GATE_TIMEOUT_MS)

const MEASURE = `(() => {
  const q = (s) => document.querySelector(s)
  const rect = (el) => { if (!el) return null; const b = el.getBoundingClientRect()
    return { x:+b.x.toFixed(1), y:+b.y.toFixed(1), w:+b.width.toFixed(1), h:+b.height.toFixed(1),
             right:+b.right.toFixed(1), bottom:+b.bottom.toFixed(1) } }
  const vw = innerWidth, vh = innerHeight
  const clipBox = (el) => {
    let box = { left:0, top:0, right:vw, bottom:vh }
    let p = el.parentElement
    while (p && p !== document.body) {
      const o = getComputedStyle(p)
      if (/(hidden|auto|scroll|clip)/.test(o.overflowX) || /(hidden|auto|scroll|clip)/.test(o.overflowY)) {
        const pr = p.getBoundingClientRect()
        box = { left: Math.max(box.left, pr.left), top: Math.max(box.top, pr.top),
                right: Math.min(box.right, pr.right), bottom: Math.min(box.bottom, pr.bottom) }
      }
      p = p.parentElement
    }
    return box
  }
  const insideClip = (el) => { if (!el) return null
    const b = el.getBoundingClientRect(), c = clipBox(el), E = 1
    return b.left - c.left >= -E && b.top - c.top >= -E
        && b.right - c.right <= E && b.bottom - c.bottom <= E }

  const frame = q('.game-frame'), grid = q('.grid-slot')
  const top = q('.p-top-group'), ctrl = q('.p-controls-row')
  const out = {
    vw, vh,
    wrapperClasses: q('.game-wrapper') ? q('.game-wrapper').className : null,
    canvasSlot: rect(q('.canvas-slot')),
    frame: rect(frame),
    grid: rect(grid),
    hudSlot: rect(q('.native-hud-slot')),
    topGroup: rect(top),
    controlsRow: rect(ctrl),
  }
  if (out.frame) {
    out.frameCentreX = +(((out.frame.x + out.frame.right) / 2) - vw / 2).toFixed(1)
    out.frameFillPctW = +(100 * out.frame.w / vw).toFixed(1)
  }
  if (out.grid) {
    out.gridCentreX = +(((out.grid.x + out.grid.right) / 2) - vw / 2).toFixed(1)
    out.gridFillPctW = +(100 * out.grid.w / vw).toFixed(1)
    out.gridInsideClip = insideClip(grid)
  }
  if (out.topGroup && out.controlsRow) {
    out.deadBandPx = +(out.controlsRow.y - out.topGroup.bottom).toFixed(1)
  }
  return out
})()`

// FEATURES panel usability, measured after the panel is opened the way a player
// opens it. "Usable" is deliberately concrete: the close button reachable, and at
// least two of the four mode cards fully inside every clipping ancestor, with the
// first one fully visible. A 28px window onto 663px of cards fails all of it.
const MEASURE_FEATURES = `(() => {
  const q = (s) => document.querySelector(s)
  const rect = (el) => { if (!el) return null; const b = el.getBoundingClientRect()
    return { x:+b.x.toFixed(1), y:+b.y.toFixed(1), w:+b.width.toFixed(1), h:+b.height.toFixed(1),
             right:+b.right.toFixed(1), bottom:+b.bottom.toFixed(1) } }
  const vw = innerWidth, vh = innerHeight
  const clipBox = (el) => {
    let box = { left:0, top:0, right:vw, bottom:vh }
    let p = el.parentElement
    while (p && p !== document.body) {
      const o = getComputedStyle(p)
      if (/(hidden|auto|scroll|clip)/.test(o.overflowX) || /(hidden|auto|scroll|clip)/.test(o.overflowY)) {
        const pr = p.getBoundingClientRect()
        box = { left: Math.max(box.left, pr.left), top: Math.max(box.top, pr.top),
                right: Math.min(box.right, pr.right), bottom: Math.min(box.bottom, pr.bottom) }
      }
      p = p.parentElement
    }
    return box
  }
  const insideClip = (el) => { if (!el) return false
    const b = el.getBoundingClientRect(), c = clipBox(el), E = 1
    return b.left - c.left >= -E && b.top - c.top >= -E
        && b.right - c.right <= E && b.bottom - c.bottom <= E }
  const cardsEl = q('.fm-cards')
  const cards = [...document.querySelectorAll('.fm-card')]
  return {
    panelPresent: !!q('.fm-panel'),
    panel: rect(q('.fm-panel')),
    closeReachable: q('.fm-close') ? insideClip(q('.fm-close')) : false,
    cardsWindowH: cardsEl ? +cardsEl.getBoundingClientRect().height.toFixed(1) : null,
    cardsContentH: cardsEl ? cardsEl.scrollHeight : null,
    cardCount: cards.length,
    cardsFullyVisible: cards.filter((c) => insideClip(c)).length,
    firstCardVisible: cards.length ? insideClip(cards[0]) : false,
    cardBoxes: cards.map((c) => ({ h: +c.getBoundingClientRect().height.toFixed(1), inside: insideClip(c) })),
  }
})()`

async function newPage(browser, viewport, seedCss) {
  const ctx = await browser.newContext({ viewport })
  const page = await ctx.newPage()
  await page.route(`**://${RGS_HOST}/**`, async (route) => {
    const url = route.request().url()
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) })
    if (url.includes('/wallet/authenticate')) return json(authBody())
    return json({})
  })
  if (seedCss) await page.addStyleTag({ content: seedCss }).catch(() => {})
  return { ctx, page }
}

async function load(page, seedCss) {
  await page.goto(`http://localhost:${PORT}/?sessionID=smallscreen-gate&rgs_url=${RGS_HOST}&lang=en`,
    { waitUntil: 'networkidle' })
  // Seeded CSS is re-applied after navigation: addStyleTag before goto does not
  // survive the load, and the seeded violation must be present in the LIVE page.
  if (seedCss) await page.addStyleTag({ content: seedCss })
  await dismissIntro(page)
  await page.waitForTimeout(600)
  if (seedCss) {
    // Force the layout maths to re-run against the seeded styles.
    await page.setViewportSize({ width: page.viewportSize().width, height: page.viewportSize().height + 1 })
    await page.waitForTimeout(400)
    await page.setViewportSize({ width: page.viewportSize().width, height: page.viewportSize().height - 1 })
    await page.waitForTimeout(500)
  }
}

let PORT = 0

async function runPass({ seedCss = null, capture = true, label = '' } = {}) {
  const failures = []
  const rows = []
  const browser = await chromium.launch()
  try {
    // ── the seven presets ────────────────────────────────────────────────────
    for (const p of PRESETS) {
      const { ctx, page } = await newPage(browser, { width: p.width, height: p.height }, seedCss)
      await load(page, seedCss)
      const m = await page.evaluate(MEASURE)
      const slug = p.name.toLowerCase().replace(/\s+/g, '_')
      if (capture) {
        await page.screenshot({ path: join(SCREENS, `${slug}_${p.width}x${p.height}.png`) })
      }

      const floor = FLOORS[p.name]
      if (m.frame && Math.abs(m.frameCentreX) > CENTRE_TOLERANCE) {
        failures.push(`${p.name}: stage not centred, frame centre is ${m.frameCentreX > 0 ? '+' : ''}${m.frameCentreX}px from the viewport centre`)
      }
      if (m.grid && floor != null && m.gridFillPctW < floor) {
        failures.push(`${p.name}: stage does not fill its box, grid is ${m.gridFillPctW}% of the viewport width against a derived floor of ${floor}%`)
      }
      if (m.deadBandPx != null && m.deadBandPx > HUD_GAP_PX + DEAD_BAND_TOLERANCE) {
        failures.push(`${p.name}: dead band of ${m.deadBandPx}px between the HUD top group and the controls row (the one deliberate gap is ${HUD_GAP_PX}px)`)
      }
      rows.push({ preset: p.name, size: `${p.width}x${p.height}`,
                  frameCentreOffsetX: m.frameCentreX ?? null, frameFillPctW: m.frameFillPctW ?? null,
                  gridFillPctW: m.gridFillPctW ?? null, gridFillFloor: floor ?? null,
                  deadBandPx: m.deadBandPx ?? null, canvasSlotH: m.canvasSlot ? m.canvasSlot.h : null })
      console.log(`  ${p.name.padEnd(10)} ${(p.width + 'x' + p.height).padEnd(9)} ` +
        `centre=${String(m.frameCentreX ?? 'n/a').padStart(6)} ` +
        `gridFill=${String(m.gridFillPctW ?? 'n/a').padStart(5)}%${floor != null ? '/' + floor : ''} ` +
        `deadBand=${String(m.deadBandPx ?? 'n/a').padStart(6)}`)
      await ctx.close()
    }

    // ── FEATURES, from the strip, at Popout S ────────────────────────────────
    {
      const { ctx, page } = await newPage(browser, { width: 400, height: 225 }, seedCss)
      await load(page, seedCss)
      const trigger = await page.$('[data-testid="feature-menu-button"]')
      if (!trigger) {
        failures.push('Popout S: no FEATURES trigger in the mini strip')
      } else {
        await trigger.click()
        await page.waitForTimeout(600)
        const f = await page.evaluate(MEASURE_FEATURES)
        if (capture) await page.screenshot({ path: join(SCREENS, 'popout_s_400x225_features_open.png') })
        if (!f.panelPresent) failures.push('Popout S: FEATURES trigger did not open a panel')
        if (!f.closeReachable) failures.push('Popout S: FEATURES panel close button is not reachable')
        if (!f.firstCardVisible) failures.push('Popout S: FEATURES panel first mode card is not fully visible')
        if (f.cardsFullyVisible < 2) {
          failures.push(`Popout S: FEATURES panel shows ${f.cardsFullyVisible} of ${f.cardCount} mode cards fully, needs at least 2 (card window ${f.cardsWindowH}px for ${f.cardsContentH}px of content)`)
        }
        rows.push({ preset: 'Popout S FEATURES', cardsWindowH: f.cardsWindowH,
                    cardsContentH: f.cardsContentH, cardCount: f.cardCount,
                    cardsFullyVisible: f.cardsFullyVisible, closeReachable: f.closeReachable })
        console.log(`  ${'FEATURES'.padEnd(10)} ${'400x225'.padEnd(9)} ` +
          `cards=${f.cardsFullyVisible}/${f.cardCount} fully visible, window=${f.cardsWindowH}px content=${f.cardsContentH}px close=${f.closeReachable ? 'reachable' : 'UNREACHABLE'}`)
      }
      await ctx.close()
    }

    // ── the height sweep at 425 wide ─────────────────────────────────────────
    console.log('\n  height sweep at 425 wide (the preset sets the width, the window sets the height):')
    const sweep = []
    for (const h of SWEEP_HEIGHTS) {
      const { ctx, page } = await newPage(browser, { width: 425, height: h }, seedCss)
      await load(page, seedCss)
      const m = await page.evaluate(MEASURE)
      sweep.push({ height: h, deadBandPx: m.deadBandPx ?? null, gridFillPctW: m.gridFillPctW ?? null })
      if (m.deadBandPx != null && m.deadBandPx > HUD_GAP_PX + DEAD_BAND_TOLERANCE) {
        failures.push(`425x${h}: dead band of ${m.deadBandPx}px (the one deliberate gap is ${HUD_GAP_PX}px)`)
      }
      console.log(`    425x${String(h).padEnd(5)} deadBand=${String(m.deadBandPx ?? 'n/a').padStart(6)} gridFill=${String(m.gridFillPctW ?? 'n/a').padStart(5)}%`)
      await ctx.close()
    }
    rows.push({ sweep })
  } finally {
    await browser.close()
  }
  return { failures, rows }
}

// ── convention (p): plant the defect in the form it really occurred ──────────
//
// Both defects were CSS declarations, so both seeds are CSS declarations. Not a
// synthetic stand-in: the first seed restores exactly the missing width/height
// pair that made the mini stage's coordinate space 400x181 instead of 1280x720,
// and the second restores exactly the `flex: 1 1 auto` that let the HUD slot
// stretch and turned the surplus into a hole.
const SEEDS = [
  {
    name: 'the mini stage loses its 1280x720 coordinate space (Popout S right-anchoring)',
    css: '.canvas-inner.mini-player { width: 100% !important; height: 100% !important; }',
    mustMention: 'not centred',
  },
  {
    name: 'the portrait HUD slot stretches again (the unbounded dead band)',
    css: '.native-hud-slot.portrait { flex: 1 1 auto !important; }',
    mustMention: 'dead band',
  },
]

const port = await getFreePort()
const preview = await startPreview(port)
PORT = port

try {
  if (SELF_TEST) {
    console.log('SMALLSCREEN COMPOSITION GATE, SELF-TEST (convention p)\n')
    let allRed = true
    for (const seed of SEEDS) {
      console.log(`  seeding: ${seed.name}`)
      const { failures } = await runPass({ seedCss: seed.css, capture: false, label: seed.name })
      const caught = failures.some((f) => f.toLowerCase().includes(seed.mustMention))
      console.log(`  -> ${failures.length} finding(s), mentioning "${seed.mustMention}": ${caught ? 'YES' : 'NO'}`)
      for (const f of failures.slice(0, 4)) console.log(`     ${f}`)
      if (!caught) { allRed = false; console.error(`  SELF-TEST FAILED: the gate did not go red on "${seed.name}"`) }
      console.log('')
    }
    console.log('  and the unseeded build must be GREEN on the same run:')
    const clean = await runPass({ capture: false })
    if (clean.failures.length) {
      allRed = false
      console.error(`  SELF-TEST FAILED: the unseeded build reported ${clean.failures.length} finding(s)`)
      for (const f of clean.failures) console.error(`     ${f}`)
    } else {
      console.log('  -> unseeded build: PASS')
    }
    console.log('')
    if (!allRed) { console.error('SELF-TEST: FAIL'); process.exit(1) }
    console.log('SELF-TEST: PASS (each seeded violation turned the gate red, the real build stayed green)')
    process.exit(0)
  }

  console.log(`SMALLSCREEN COMPOSITION GATE (phase: ${PHASE})\n`)
  const { failures, rows } = await runPass({ capture: true })
  writeFileSync(join(QA, `smallscreen_composition_${PHASE}_2026-07-26.json`),
    JSON.stringify({ phase: PHASE, presets: PRESETS.length, floors: FLOORS, rows, failures }, null, 2))

  if (CAPTURE_ONLY) {
    console.log(`\nCAPTURE ONLY: ${failures.length} finding(s) recorded, not failing.`)
    for (const f of failures) console.log(`  ${f}`)
    process.exit(0)
  }
  if (failures.length) {
    console.error(`\nFAIL, ${failures.length} finding(s):`)
    for (const f of failures) console.error(`  ${f}`)
    process.exit(1)
  }
  console.log('\nSMALLSCREEN COMPOSITION GATE: PASS (centred, filling its box, no dead band at any swept height, FEATURES usable at Popout S)')
  process.exit(0)
} finally {
  killPreview(preview)
}
