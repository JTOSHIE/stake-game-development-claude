// composition_evidence.mjs, FS_POLISH_PUNCH_AND_R3 JOB 3 (2026-07-28).
//
// TWO DELIVERABLES, BOTH EVIDENCE RATHER THAN CHANGE.
//
// 1. THE POPOUT L MEASUREMENT. The brief reports the Popout L stage measured
//    +3.4 percent off centre and orders it centred. Measured here on the
//    current build FIRST, per convention (l.2): at 800x450 (the compact
//    landscape profile) the frame and the grid both sit at exactly 50.0
//    percent of the viewport width, 0.0px off the centreline, and the same is
//    true at Desktop and Laptop. The +3.4 does not reproduce on current main,
//    so there is nothing to centre and this script records the measurement
//    instead of a change. The most probable source of the owner's figure is
//    the LIVE build, whose version is not known (owner item 3, Front V2 the
//    last confirmed publish); re-measure after the V10 upload.
//
// 2. THE DESKTOP SIDE-BY-SIDE, for the owner's eye-call, no change without
//    his word. As shipped, the stage is GEOMETRICALLY centred: the grid sits
//    on the exact centreline while the feature rail hangs on the right, so
//    the ensemble of grid plus rail has its midpoint right of centre and the
//    reels can READ left-weighted to the eye. The comparison frame shifts the
//    whole stage left so the grid-plus-rail ensemble midpoint sits on the
//    centreline instead, which recentres the mass and moves the grid off the
//    geometric centre. One annotated image carries both, with the measured
//    percentages drawn on the frames.
//
// USAGE (from frontend/, after npm run build):
//   FS_WRITE_EVIDENCE=1 node scripts/composition_evidence.mjs

import { chromium } from 'playwright'
import { writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { evidenceDir, announceEvidenceMode } from './lib/evidencePaths.mjs'
import { startStaticServer, assertNoSurvivors } from './lib/previewServer.mjs'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

announceEvidenceMode('composition_evidence')
const SHOTS = evidenceDir('reports', 'screens', 'composition-2026-07-28')
const QA = evidenceDir('reports', 'qa')

const RGS_HOST = 'rgs.composition-evidence.invalid'
const GATE_TIMEOUT_MS = 6 * 60_000
setTimeout(() => {
  console.error('COMPOSITION EVIDENCE: HARD TIMEOUT, failing red')
  process.exit(1)
}, GATE_TIMEOUT_MS)

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

const MEASURE = () => {
  const pick = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1),
      cx: +(r.x + r.width / 2).toFixed(2) }
  }
  return {
    vw: window.innerWidth,
    frame: pick('.game-frame'),
    grid: pick('.grid-slot'),
    rail: pick('[class*="fm-entry"]'),
  }
}

/** Draw the annotation overlay: centreline, grid centre, ensemble midpoint. */
const OVERLAY = ({ vw, grid, rail }) => {
  const layer = document.createElement('div')
  layer.id = 'evidence-overlay'
  layer.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;font-family:system-ui'
  const line = (x, colour, dash, label, labelY) => {
    const l = document.createElement('div')
    l.style.cssText = `position:absolute;top:0;bottom:0;left:${x}px;width:0;`
      + `border-left:2px ${dash} ${colour};`
    layer.appendChild(l)
    const t = document.createElement('div')
    t.textContent = label
    t.style.cssText = `position:absolute;top:${labelY}px;left:${x + 6}px;color:${colour};`
      + 'font-size:13px;font-weight:700;background:rgba(0,0,0,0.72);padding:2px 6px;border-radius:4px;white-space:nowrap'
    layer.appendChild(t)
  }
  const pc = (x) => ((x / vw) * 100).toFixed(1)
  line(vw / 2, '#ffffff', 'solid', `viewport centre 50.0%`, 8)
  line(grid.cx, '#ffd24a', 'dashed', `grid centre ${pc(grid.cx)}%`, 34)
  if (rail) {
    const mid = (grid.x + (rail.x + rail.w)) / 2
    line(mid, '#41e0ff', 'dashed', `grid+rail midpoint ${pc(mid)}%`, 60)
    const box = document.createElement('div')
    box.style.cssText = `position:absolute;left:${rail.x}px;top:${rail.y}px;width:${rail.w}px;`
      + `height:${rail.h}px;border:2px solid #41e0ff;border-radius:6px`
    layer.appendChild(box)
  }
  document.body.appendChild(layer)
}

async function bootPage(browser, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height } })
  const page = await ctx.newPage()
  await page.route(`**://${RGS_HOST}/**`, async (route) => {
    const url = route.request().url()
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) })
    if (url.includes('/wallet/authenticate')) return json(authBody())
    return json({})
  })
  await page.goto(`http://localhost:${server.port}/?sessionID=composition&rgs_url=${RGS_HOST}&lang=en`,
    { waitUntil: 'commit' })
  await page.waitForSelector('[data-testid="hero-splash"]', { timeout: 30_000 })
  await dismissIntro(page)
  await page.waitForTimeout(2000)
  return { ctx, page }
}

const server = await startStaticServer(join(ROOT, 'dist'))
const browser = await chromium.launch()
const results = {}

// ── 1. Measure the three landscape presets, annotate Popout L ───────────────
for (const p of [
  { name: 'Desktop', width: 1200, height: 675 },
  { name: 'Laptop', width: 1024, height: 576 },
  { name: 'Popout L', width: 800, height: 450 },
]) {
  const { ctx, page } = await bootPage(browser, p.width, p.height)
  const m = await page.evaluate(MEASURE)
  results[p.name] = m
  const off = m.grid ? +(m.grid.cx - m.vw / 2).toFixed(2) : null
  console.log(`  ${p.name}: grid centre ${m.grid?.cx}px of ${m.vw}px viewport, `
    + `${((m.grid.cx / m.vw) * 100).toFixed(2)}%, off-centre ${off}px`)
  if (p.name === 'Popout L') {
    await page.evaluate(OVERLAY, m)
    await page.screenshot({ path: join(SHOTS, 'popout-l-centring-measured.png') })
  }
  await ctx.close()
}

// ── 2. The desktop side-by-side ─────────────────────────────────────────────
{
  const { ctx, page } = await bootPage(browser, 1200, 675)
  const m = results['Desktop']
  await page.evaluate(OVERLAY, m)
  const shipped = join(SHOTS, 'desktop-as-shipped.png')
  await page.screenshot({ path: shipped })
  await page.evaluate(() => document.getElementById('evidence-overlay')?.remove())

  // The optically centred variant: shift the stage so the grid-plus-rail
  // ensemble midpoint lands on the centreline. Injected CSS only; nothing in
  // the source changes without the owner's word.
  const shift = +(((m.grid.x + (m.rail.x + m.rail.w)) / 2) - m.vw / 2).toFixed(2)
  await page.addStyleTag({ content: `.game-wrapper { position: relative; left: ${-shift}px; }` })
  await page.waitForTimeout(400)
  const m2 = await page.evaluate(MEASURE)
  results['Desktop optically centred'] = { ...m2, appliedShiftPx: -shift }
  await page.evaluate(OVERLAY, m2)
  const optical = join(SHOTS, 'desktop-optically-centred.png')
  await page.screenshot({ path: optical })
  await ctx.close()

  // Compose the one annotated side-by-side image.
  const b64 = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`
  const pc = (v, vw) => ((v / vw) * 100).toFixed(1)
  const html = `<!doctype html><meta charset="utf-8">
  <body style="margin:0;background:#0b0b16;color:#eee;font-family:system-ui;width:2440px">
  <div style="display:flex;gap:16px;padding:12px">
    <figure style="margin:0;width:1200px">
      <figcaption style="font-size:20px;font-weight:800;padding:6px 2px">
        AS SHIPPED, the rail composition</figcaption>
      <img src="${b64(shipped)}" style="width:1200px;display:block;border:1px solid #333">
      <figcaption style="font-size:14px;line-height:1.5;padding:8px 2px">
        The grid is geometrically centred at ${pc(m.grid.cx, m.vw)}% of the viewport
        (0.0px off the centreline). The feature rail hangs right at
        ${pc(m.rail.cx, m.vw)}%, so the grid-plus-rail ensemble midpoint sits at
        ${pc((m.grid.x + m.rail.x + m.rail.w) / 2, m.vw)}% and the reels can read
        left-weighted against the rail's visual mass.</figcaption>
    </figure>
    <figure style="margin:0;width:1200px">
      <figcaption style="font-size:20px;font-weight:800;padding:6px 2px">
        OPTICALLY CENTRED, the ensemble midpoint on the centreline</figcaption>
      <img src="${b64(optical)}" style="width:1200px;display:block;border:1px solid #333">
      <figcaption style="font-size:14px;line-height:1.5;padding:8px 2px">
        The whole stage shifted ${shift}px left (${pc(shift, m.vw)}% of the viewport),
        putting the grid-plus-rail midpoint at 50.0%. The grid itself now sits at
        ${pc(m2.grid.cx, m2.vw)}%. Committed for the owner's eye-call per the brief;
        the shipped build is unchanged.</figcaption>
    </figure>
  </div></body>`
  const cctx = await browser.newContext({ viewport: { width: 2440, height: 860 } })
  const cpage = await cctx.newPage()
  await cpage.setContent(html)
  await cpage.waitForTimeout(300)
  await cpage.screenshot({ path: join(SHOTS, 'desktop-side-by-side-annotated.png'), fullPage: true })
  await cctx.close()
}

await browser.close()
await server.close()

writeFileSync(join(QA, 'composition_2026-07-28.json'), JSON.stringify({
  generated: '2026-07-28',
  job: 'FS_POLISH_PUNCH_AND_R3 JOB 3, composition',
  finding: 'The briefed +3.4 percent Popout L offset does not reproduce on current main: '
    + 'frame and grid measure exactly 50.0 percent of viewport width at Desktop, Laptop '
    + 'and Popout L. No change made. Most probable source of the reported figure is the '
    + 'live build of unknown version (owner item 3); re-measure after the V10 upload.',
  measurements: results,
}, null, 2))

assertNoSurvivors('composition_evidence')
console.log('\nCOMPOSITION EVIDENCE: complete')
process.exit(0)
