// layout_fit_gate.mjs, JOB 3(b): the frame must FIT at every real platform preset.
//
// WHY THIS EXISTS, AND WHY IT MEASURES RATHER THAN PHOTOGRAPHS
// -----------------------------------------------------------
// Guideline item 15 says "Main game frame should not be scrollable". TR-065
// found scrollbars at mobile portrait, Mobile S and Popout S, and the tempting
// fix was one line: change `overflow-y: auto` to `hidden` on the three wrapper
// classes. The ruling forbids that, and TR-069 is the reason it was right to.
//
// TR-069: at mobile portrait the rightmost control in the bottom row is already
// cut by the viewport boundary. Hiding overflow would have turned a VISIBLE
// scrollbar into an INVISIBLE unreachable control, and this gate would have gone
// green while the game got worse. So the assertion is not "does it scroll" but
// two independent things:
//
//   FITS       the wrapper's scrollHeight must not exceed its clientHeight
//   REACHABLE  every interactive control's box must lie inside the viewport
//
// A fix that satisfies the first by breaking the second fails here.
//
// The seven presets are the platform's own, read off the DTT Screen menu on
// 2026-07-26 rather than invented: see reports/screens/dtt-live-2026-07-26/
// 09_dtt_screen_presets_popout_s_400x225.png.
//
// Run (from frontend/, after `npm run build`): node scripts/layout_fit_gate.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { evidenceDir, announceEvidenceMode } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const QA = evidenceDir('reports', 'qa')
announceEvidenceMode('layout_fit_gate')

// The platform's own Screen menu, verbatim.
const PRESETS = [
  { name: 'Desktop',   width: 1200, height: 675 },
  { name: 'Laptop',    width: 1024, height: 576 },
  { name: 'Popout S',  width: 400,  height: 225 },
  { name: 'Popout L',  width: 800,  height: 450 },
  { name: 'Mobile L',  width: 425,  height: 812 },
  { name: 'Mobile M',  width: 375,  height: 667 },
  { name: 'Mobile S',  width: 320,  height: 568 },
]

const RGS_HOST = 'rgs.layout-fit-gate.invalid'
const START_MICROS = 100_000_000

const authBody = () => ({
  balance: { amount: START_MICROS, currency: 'USD' },
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

async function routeWallet(page) {
  await page.route(`**://${RGS_HOST}/**`, async (route) => {
    const url = route.request().url()
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) })
    if (url.includes('/wallet/authenticate')) return json(authBody())
    return json({})
  })
}

async function getFreePort() {
  return new Promise((res, rej) => {
    const srv = createServer()
    srv.on('error', rej)
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => res(port)) })
  })
}

// HARD TIMEOUT (CI triage, run 122). The gate's work takes ~13s; on the CI
// runner the process then hung forever AFTER printing PASS, because killing
// the `npx` wrapper orphans the real vite child, whose inherited stdout pipe
// holds this process's event loop open. The watchdog turns any such hang into
// a loud red instead of a silent wait, and the explicit exit below makes
// success independent of lingering handles.
const GATE_TIMEOUT_MS = 4 * 60_000
setTimeout(() => {
  console.error(`LAYOUT FIT GATE: HARD TIMEOUT after ${GATE_TIMEOUT_MS / 1000}s, failing red`)
  process.exit(1)
}, GATE_TIMEOUT_MS)

function startPreview(port) {
  return new Promise((res, rej) => {
    // detached: the preview gets its own process group, so killPreview can
    // signal the GROUP and reach vite itself, not just the npx wrapper.
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
  // Negative pid signals the whole detached group: npx AND the vite it spawned.
  try { process.kill(-proc.pid, 'SIGTERM') } catch { try { proc.kill() } catch {} }
}

// Measured in the page. Two independent questions, plus the text-overflow check
// that TR-066 needs, plus the overlap check TR-071 needs.
const MEASURE = `(() => {
  const wrap = document.querySelector('.game-wrapper')
  if (!wrap) return { error: 'no .game-wrapper' }

  const vw = window.innerWidth, vh = window.innerHeight
  const EPS = 1   // sub-pixel rounding is not a defect

  // 1. FITS. Only an element that CAN scroll counts. Desktop clips the stage
  // with overflow:hidden and its untransformed content is a few px taller than
  // 720; that is a clip, not a scrollbar, and reporting it would be a false
  // positive that trains everyone to ignore this gate.
  const scrollable = (el) => {
    const o = getComputedStyle(el)
    return /(auto|scroll)/.test(o.overflowY) || /(auto|scroll)/.test(o.overflowX)
  }
  const wrapScrolls = scrollable(wrap)
  const fits = {
    wrapperScrollable: wrapScrolls,
    wrapperScrollH: wrap.scrollHeight, wrapperClientH: wrap.clientHeight,
    wrapperScrollW: wrap.scrollWidth,  wrapperClientW: wrap.clientWidth,
    docScrollH: document.documentElement.scrollHeight,
    docClientH: document.documentElement.clientHeight,
  }
  fits.vScroll = wrapScrolls && fits.wrapperScrollH - fits.wrapperClientH > EPS
  fits.hScroll = wrapScrolls && fits.wrapperScrollW - fits.wrapperClientW > EPS
  fits.docScroll = fits.docScrollH - fits.docClientH > EPS

  // 2. REACHABLE. A control must lie inside the viewport AND inside every
  // clipping ancestor. TR-069's control was cut by an ancestor's overflow while
  // still nominally inside the viewport, so checking the viewport alone would
  // have missed exactly the defect this gate exists to catch.
  const clipBox = (el) => {
    let box = { left: 0, top: 0, right: vw, bottom: vh }
    let p = el.parentElement
    while (p && p !== document.body) {
      const o = getComputedStyle(p)
      if (/(hidden|auto|scroll|clip)/.test(o.overflowX) || /(hidden|auto|scroll|clip)/.test(o.overflowY)) {
        const pr = p.getBoundingClientRect()
        box = {
          left: Math.max(box.left, pr.left), top: Math.max(box.top, pr.top),
          right: Math.min(box.right, pr.right), bottom: Math.min(box.bottom, pr.bottom),
        }
      }
      p = p.parentElement
    }
    return box
  }
  const controls = []
  const nodes = document.querySelectorAll('button, [role="button"], [data-testid*="button"], [data-testid^="hud-"], [data-testid$="-button"], [data-testid="mini-menu"], [data-testid="feature-menu-button"]')
  for (const el of nodes) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    const cb = clipBox(el)
    const outLeft = r.left - cb.left < -EPS, outTop = r.top - cb.top < -EPS
    const outRight = r.right - cb.right > EPS, outBottom = r.bottom - cb.bottom > EPS
    controls.push({
      id: el.getAttribute('data-testid') || el.className?.toString?.().slice(0, 40) || el.tagName,
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      outside: outLeft || outTop || outRight || outBottom,
      how: [outLeft && 'left', outTop && 'top', outRight && 'right', outBottom && 'bottom'].filter(Boolean),
    })
  }

  // 3. TEXT OVERFLOW. A readout whose scrollWidth exceeds its clientWidth is
  // clipping its own value, which is what TR-066 caught at Popout S.
  const readouts = []
  for (const q of ['[data-testid="hud-balance"]', '[data-testid="hud-win"]', '[data-testid="hud-bet"]']) {
    const el = document.querySelector(q)
    if (!el) continue
    const cs = getComputedStyle(el)
    if (cs.display === 'none') continue
    // Measure the deepest text-bearing node, not the padded container.
    const t = el.querySelector('.m-stat-val, .stat-value, span, div') || el
    readouts.push({ id: q, scrollW: t.scrollWidth, clientW: t.clientWidth,
                    clipped: t.scrollWidth - t.clientWidth > EPS, text: (t.textContent || '').trim().slice(0, 24) })
  }

  return { vw, vh, fits, controls, readouts }
})()`

const failures = []
const rows = []

const port = await getFreePort()
const preview = await startPreview(port)
const BASE = `http://localhost:${port}`
const browser = await chromium.launch()

try {
  for (const p of PRESETS) {
    const ctx = await browser.newContext({ viewport: { width: p.width, height: p.height } })
    const page = await ctx.newPage()
    await routeWallet(page)
    await page.goto(`${BASE}/?sessionID=layout-gate&rgs_url=${RGS_HOST}&lang=en`, { waitUntil: 'networkidle' })
    await dismissIntro(page)
    await page.waitForTimeout(500)

    const m = await page.evaluate(MEASURE)
    if (m.error) { failures.push(`${p.name}: ${m.error}`); await ctx.close(); continue }

    const offscreen = m.controls.filter((c) => c.outside)
    const clipped = m.readouts.filter((r) => r.clipped)

    if (m.fits.vScroll) failures.push(`${p.name}: wrapper scrolls vertically (${m.fits.wrapperScrollH} > ${m.fits.wrapperClientH})`)
    if (m.fits.hScroll) failures.push(`${p.name}: wrapper scrolls horizontally (${m.fits.wrapperScrollW} > ${m.fits.wrapperClientW})`)
    if (m.fits.docScroll) failures.push(`${p.name}: document scrolls (${m.fits.docScrollH} > ${m.fits.docClientH})`)
    for (const c of offscreen) failures.push(`${p.name}: control "${c.id}" outside the viewport (${c.how.join(',')}) at x=${c.rect.x} w=${c.rect.w}`)
    for (const r of clipped) failures.push(`${p.name}: readout ${r.id} clips its value ("${r.text}", ${r.scrollW} > ${r.clientW})`)

    rows.push({
      preset: p.name, size: `${p.width}x${p.height}`,
      vScroll: m.fits.vScroll, hScroll: m.fits.hScroll, docScroll: m.fits.docScroll,
      controls: m.controls.length, offscreen: offscreen.map((c) => c.id), clipped: clipped.map((r) => r.id),
    })
    console.log(
      `  ${p.name.padEnd(10)} ${(p.width + 'x' + p.height).padEnd(9)} ` +
      `scroll=${m.fits.vScroll || m.fits.hScroll || m.fits.docScroll ? 'YES' : 'no '} ` +
      `controls=${String(m.controls.length).padStart(2)} offscreen=${offscreen.length} clipped=${clipped.length}`,
    )
    await ctx.close()
  }
} finally {
  await browser.close()
  killPreview(preview)
}

writeFileSync(join(QA, 'layout_fit_gate_2026-07-26.json'), JSON.stringify({ rows, failures }, null, 2))

console.log(`\nLAYOUT FIT GATE: ${PRESETS.length} presets measured`)
if (failures.length) {
  console.error(`\nFAIL, ${failures.length} finding(s):`)
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}
console.log('LAYOUT FIT GATE: PASS (fits and every control reachable at all seven presets)')
// Explicit, because on the CI runner an orphaned preview pipe kept the event
// loop alive after this line and the job hung green-in-all-but-exit (run 122).
process.exit(0)
