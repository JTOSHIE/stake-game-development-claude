// splash_calm_gate.mjs, FS VISUAL FIXPACK JOB 1: the boot screens are CALM.
//
// THE OWNER'S RULING (reports/briefs/FS_VISUAL_FIXPACK_Prompt.md), quoted:
// "the splash is calm, black screen, logo sitting still with its gentle pulse,
// raindrops, TAP TO CONTINUE, nothing else moving."
//
// WHAT REGRESSED, AND WHY A GATE RATHER THAN A SCREENSHOT
// ------------------------------------------------------
// LoadingScreen.svelte used to draw the WRS brand mark as TWO layers: a static
// chrome rim (brand_mark_base.png) and an inner five-fold blade
// (brand_mark_spin.png). Only the inner blade carried
// `animation: brand-spin 2.6s linear infinite`, so the mark's own outline never
// moved. That is what DESIGN_SYSTEM.md describes: "a neon chrome rim whose
// inner layer spins independently".
//
// Commit 54544e4 (OWNER AUDIT ROUND 3 item 1, logo canonicalisation) replaced
// both layers with ONE image, hero_icon_96.png, the canonical We Roll Spinners
// mark, and left the rotation on it. The animation was keyed to a layer that no
// longer existed, so it rotated the whole logo instead of the blade inside it.
//
// Measured at HEAD before the fix, 1280x720, 100ms samples over ten seconds:
// the mark's transform was a live rotation matrix throughout, and because the
// artwork is not radially symmetric its axis-aligned bounding box swung
// x 484.47 to 525.69 and y 142.06 to 183.29, a 41px excursion in both axes.
// That is the owner's "jumps around and starts spinning", in numbers.
//
// A screenshot cannot assert this: a still frame of a rotating logo looks like
// a logo. Only a SERIES says whether it moved. So this gate samples geometry
// over the full ten-second window and asserts three independent things:
//
//   GEOMETRY   the box never moves or resizes, across every sample
//   TRANSFORM  the computed matrix carries no rotation and no translation
//   KEYFRAMES  no running animation on the logo mutates `transform` at all
//
// The third is the structural one. Geometry alone would pass a rotation that
// happened to be radially symmetric, and a future asset swap could reintroduce
// exactly this defect behind a symmetric image and then break the day the art
// changes again. Asserting that nothing animates `transform` closes that.
//
// A gentle PULSE is explicitly permitted and is what the ruling asks for, so
// keyframes touching `opacity` or `filter` pass. That is also why the pulse
// shipped as a filter pulse rather than a scale: a scale pulse would move the
// box and this gate could then only assert "small", which is not a property.
//
// CONVENTION (p): --self-test plants the real defect, in the form it really
// occurred (a `transform: rotate(360deg)` keyframe on the mark image), and the
// gate must go red on it before any PASS here counts.
//
// USAGE (from frontend/, after `npm run build`):
//   node scripts/splash_calm_gate.mjs
//   node scripts/splash_calm_gate.mjs --self-test
//   node scripts/splash_calm_gate.mjs --capture --label after
//   FS_WRITE_EVIDENCE=1 node scripts/splash_calm_gate.mjs --capture --label after

import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { evidenceDir, announceEvidenceMode } from './lib/evidencePaths.mjs'
import { startStaticServer, assertNoSurvivors } from './lib/previewServer.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ── TR-101: the server runs IN THIS PROCESS now ──────────────────────────────
//
// Fable's ruling 2026-07-28, option (c): the orphanable child is DELETED rather
// than managed. `lib/previewServer.mjs` serves dist/ over node:http from inside
// this process, so there is no `npx`, no vite child, no process group, and
// nothing that can survive this script.
//
// The three names below are kept so every call site reads exactly as it did.
// They are adapters, not implementations: the implementation is shared.
//
// NOTE WHAT THIS MAKES IMPOSSIBLE. Three scripts in this family never called
// killPreview at all and leaked a server on every single run. Under option (c)
// that is no longer a leak: forgetting to close costs nothing, because the
// server dies with the process instead of outliving it.
let _server = null
async function getFreePort() {
  _server = await startStaticServer(join(ROOT, 'dist'))
  return _server.port
}
function startPreview() { return _server }
function killPreview() { return _server ? _server.close() : undefined }


const SELF_TEST = process.argv.includes('--self-test')
const CAPTURE = process.argv.includes('--capture')
const LABEL = (() => {
  const i = process.argv.indexOf('--label')
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : 'after'
})()

announceEvidenceMode('splash_calm_gate')
const QA = evidenceDir('reports', 'qa')
const SHOTS = evidenceDir('reports', 'screens', 'splash-calm-2026-07-27')

// The platform's own Screen menu names, as used by layout_fit_gate.mjs.
const PROFILES = [
  { name: 'Desktop', width: 1200, height: 675 },
  { name: 'Mobile L', width: 425, height: 812 },
  { name: 'Popout S', width: 400, height: 225 },
]

const WINDOW_MS = 10_000
const SAMPLE_MS = 250
const SHOT_TIMES = [0, 2000, 4000, 6000, 8000, 10_000]

// Sub-pixel float noise only. The measured answer for a still element is an
// identical double every sample, so this is not a tolerance for real motion.
const EPS = 0.01

const RGS_HOST = 'rgs.splash-calm-gate.invalid'
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

// THE TWO BOOT SURFACES.
//
// `isLoading` starts true and is cleared in initRGS's finally block, so the
// LOAD screen is on screen for exactly as long as authenticate takes. Stalling
// that one response is therefore the only honest way to hold it open for a
// ten-second measurement; nothing about the screen itself is altered.
const SURFACES = [
  {
    id: 'loader',
    title: 'load screen',
    root: '.loading-screen',
    // authenticate is stalled past the sample window so the loader stays up.
    authDelayMs: WINDOW_MS + 6000,
    targets: [
      { sel: '.brand-mark img', label: 'WRS mark' },
      { sel: '.wordmark', label: 'WE ROLL SPINNERS wordmark' },
      { sel: '.loading-logo', label: 'game logo' },
    ],
    seedCss: `
      @keyframes seeded-brand-spin { to { transform: rotate(360deg); } }
      .brand-mark img { animation: seeded-brand-spin 2.6s linear infinite; }
    `,
  },
  {
    id: 'splash',
    title: 'splash',
    root: '[data-testid="hero-splash"]',
    authDelayMs: 0,
    targets: [
      { sel: '.emblem-full', label: 'hero emblem' },
      { sel: '.ring-glow', label: 'emblem glow' },
      { sel: '.press-prompt', label: 'TAP TO CONTINUE' },
    ],
    seedCss: `
      @keyframes seeded-emblem-spin { to { transform: rotate(360deg); } }
      [data-testid="hero-splash"] .emblem-full { animation: seeded-emblem-spin 2.6s linear infinite; }
    `,
  },
]


// Same hard timeout and detached-group discipline as layout_fit_gate.mjs: on
// the CI runner, killing the npx wrapper orphans vite and its inherited stdout
// pipe holds this process's event loop open after the work is done (run 122).
const GATE_TIMEOUT_MS = 8 * 60_000
setTimeout(() => {
  console.error(`SPLASH CALM GATE: HARD TIMEOUT after ${GATE_TIMEOUT_MS / 1000}s, failing red`)
  process.exit(1)
}, GATE_TIMEOUT_MS)



// Measured in the page, per sample. Returns geometry, the computed transform
// matrix, and the property names every running animation on the element writes.
const MEASURE = ([rootSel, sels]) => {
  const root = document.querySelector(rootSel)
  if (!root) return { present: false }
  const out = { present: true, nodes: [] }
  for (const sel of sels) {
    const el = root.querySelector(sel)
    if (!el) { out.nodes.push({ sel, missing: true }); continue }
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)

    // Every property any running animation on this element writes. Read off the
    // real keyframes rather than the animation NAME, so a renamed or inherited
    // animation cannot hide from the assertion.
    const animProps = new Set()
    for (const a of el.getAnimations()) {
      if (a.playState === 'idle') continue
      let frames = []
      try { frames = a.effect.getKeyframes() } catch { frames = [] }
      for (const f of frames) {
        for (const k of Object.keys(f)) {
          if (k === 'offset' || k === 'computedOffset' || k === 'easing' || k === 'composite') continue
          animProps.add(k)
        }
      }
    }

    // The computed matrix, parsed. b and c carry rotation/skew; e and f carry
    // translation. Both must be zero for a still element.
    let m = null
    const t = cs.transform
    if (t && t !== 'none') {
      const nums = t.slice(t.indexOf('(') + 1, t.lastIndexOf(')')).split(',').map(Number)
      if (nums.length === 6) m = { a: nums[0], b: nums[1], c: nums[2], d: nums[3], e: nums[4], f: nums[5] }
      else if (nums.length === 16) m = { a: nums[0], b: nums[1], c: nums[4], d: nums[5], e: nums[12], f: nums[13] }
    }

    out.nodes.push({
      sel,
      x: r.x, y: r.y, w: r.width, h: r.height,
      transform: t, matrix: m,
      animProps: [...animProps].sort(),
    })
  }
  return out
}

async function measureSurface(browser, base, profile, surface, { seed = false, capture = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: profile.width, height: profile.height } })
  const page = await ctx.newPage()

  await page.route(`**://${RGS_HOST}/**`, async (route) => {
    if (surface.authDelayMs > 0) await new Promise((r) => setTimeout(r, surface.authDelayMs))
    const url = route.request().url()
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) })
    if (url.includes('/wallet/authenticate')) return json(authBody())
    return json({})
  })

  await page.goto(`${base}/?sessionID=splash-calm-gate&rgs_url=${RGS_HOST}&lang=en`, { waitUntil: 'commit' })
  await page.waitForSelector(surface.root, { timeout: 25_000 })

  // The seed is injected AFTER the surface exists, so it lands on the real
  // element the real defect landed on rather than on a placeholder.
  if (seed) await page.addStyleTag({ content: surface.seedCss })

  const sels = surface.targets.map((t) => t.sel)
  const samples = []
  const shots = []
  const windowMs = seed ? 2500 : WINDOW_MS
  const t0 = Date.now()
  let nextShot = 0
  while (Date.now() - t0 < windowMs + 1) {
    const elapsed = Date.now() - t0
    const s = await page.evaluate(MEASURE, [surface.root, sels]).catch(() => ({ present: false, err: true }))
    samples.push({ t: elapsed, ...s })
    if (capture && nextShot < SHOT_TIMES.length && elapsed >= SHOT_TIMES[nextShot]) {
      const name = `${LABEL}-${surface.id}-${profile.name.toLowerCase().replace(/\s+/g, '-')}-t${SHOT_TIMES[nextShot]}ms.png`
      await page.screenshot({ path: join(SHOTS, name) })
      shots.push(name)
      nextShot++
    }
    await page.waitForTimeout(SAMPLE_MS)
  }
  // The loop exits at the window boundary, so the last scheduled frame (the
  // ten-second one) would otherwise never be taken and the committed sequence
  // would stop short of the window the brief names.
  while (capture && nextShot < SHOT_TIMES.length) {
    const name = `${LABEL}-${surface.id}-${profile.name.toLowerCase().replace(/\s+/g, '-')}-t${SHOT_TIMES[nextShot]}ms.png`
    await page.screenshot({ path: join(SHOTS, name) })
    shots.push(name)
    nextShot++
  }
  await ctx.close()
  return { samples, shots }
}

/**
 * Turn a sample series into findings. One finding per target per broken
 * property, phrased so the failure line names the real screen and the real
 * element rather than a selector.
 */
function assess(profile, surface, samples) {
  const findings = []
  const present = samples.filter((s) => s.present)
  const rows = []

  if (present.length === 0) {
    findings.push(`${profile.name} / ${surface.title}: surface never rendered (${surface.root})`)
    return { findings, rows }
  }

  for (const target of surface.targets) {
    const series = present
      .map((s) => ({ t: s.t, n: (s.nodes || []).find((n) => n.sel === target.sel) }))
      .filter((e) => e.n && !e.n.missing)
    if (series.length === 0) {
      findings.push(`${profile.name} / ${surface.title}: "${target.label}" (${target.sel}) not found`)
      continue
    }

    const first = series[0].n
    let dx = 0, dy = 0, dw = 0, dh = 0
    for (const { n } of series) {
      dx = Math.max(dx, Math.abs(n.x - first.x))
      dy = Math.max(dy, Math.abs(n.y - first.y))
      dw = Math.max(dw, Math.abs(n.w - first.w))
      dh = Math.max(dh, Math.abs(n.h - first.h))
    }

    // TRANSFORM: no rotation or skew (b, c), no translation (e, f).
    const rotated = series.filter(({ n }) => n.matrix && (Math.abs(n.matrix.b) > EPS || Math.abs(n.matrix.c) > EPS))
    const translated = series.filter(({ n }) => n.matrix && (Math.abs(n.matrix.e) > EPS || Math.abs(n.matrix.f) > EPS))

    // KEYFRAMES: a pulse may animate opacity or filter. It may not animate the
    // element's transform, which is the property that moves a logo.
    const transformAnimated = series.filter(({ n }) => n.animProps.includes('transform'))

    const maxMove = Math.max(dx, dy, dw, dh)
    rows.push({
      profile: profile.name, surface: surface.id, target: target.label, selector: target.sel,
      samples: series.length,
      maxDx: +dx.toFixed(4), maxDy: +dy.toFixed(4), maxDw: +dw.toFixed(4), maxDh: +dh.toFixed(4),
      animProps: [...new Set(series.flatMap(({ n }) => n.animProps))].sort(),
      transformAtFirstSample: first.transform,
    })

    if (maxMove > EPS) {
      findings.push(
        `${profile.name} / ${surface.title}: "${target.label}" moved across the window `
        + `(dx=${dx.toFixed(2)} dy=${dy.toFixed(2)} dw=${dw.toFixed(2)} dh=${dh.toFixed(2)} over ${series.length} samples)`,
      )
    }
    if (rotated.length) {
      const worst = rotated[0].n.matrix
      findings.push(
        `${profile.name} / ${surface.title}: "${target.label}" carries a rotation or skew `
        + `(matrix b=${worst.b.toFixed(4)} c=${worst.c.toFixed(4)} in ${rotated.length}/${series.length} samples)`,
      )
    }
    if (translated.length) {
      const worst = translated[0].n.matrix
      findings.push(
        `${profile.name} / ${surface.title}: "${target.label}" carries a translation `
        + `(matrix e=${worst.e.toFixed(4)} f=${worst.f.toFixed(4)} in ${translated.length}/${series.length} samples)`,
      )
    }
    if (transformAnimated.length) {
      findings.push(
        `${profile.name} / ${surface.title}: "${target.label}" has a running animation that writes `
        + `transform (${transformAnimated.length}/${series.length} samples). A gentle pulse animates `
        + 'opacity or filter, never transform.',
      )
    }
  }
  return { findings, rows }
}

const port = await getFreePort()
const preview = await startPreview(port)
const BASE = `http://localhost:${port}`
const browser = await chromium.launch()

let exitCode = 0
try {
  if (SELF_TEST) {
    // CONVENTION (p). Plant the exact defect, in the form it really occurred,
    // and require the gate to go red on it. A gate nobody has watched fail is
    // a script that prints PASS.
    console.log('SPLASH CALM GATE SELF-TEST: planting a transform rotation on each boot logo\n')
    const profile = PROFILES[0]
    let allSeedsCaught = true
    for (const surface of SURFACES) {
      const { samples } = await measureSurface(browser, BASE, profile, surface, { seed: true })
      const { findings } = assess(profile, surface, samples)
      const caught = findings.length > 0
      console.log(`  seeded ${surface.id.padEnd(7)} -> ${caught ? 'RED (correct)' : 'GREEN (WRONG)'}`)
      for (const f of findings) console.log(`      ${f}`)
      if (!caught) allSeedsCaught = false
    }
    // Negative control: with no seed the same measurement must be clean, so a
    // gate that simply always fails cannot pass its own self-test.
    let controlClean = true
    for (const surface of SURFACES) {
      const { samples } = await measureSurface(browser, BASE, profile, surface, { seed: false })
      const { findings } = assess(profile, surface, samples)
      console.log(`  control ${surface.id.padEnd(6)} -> ${findings.length ? 'RED (WRONG)' : 'GREEN (correct)'}`)
      for (const f of findings) console.log(`      ${f}`)
      if (findings.length) controlClean = false
    }
    console.log('')
    if (!allSeedsCaught) {
      console.error('SPLASH CALM GATE SELF-TEST: FAIL, a seeded rotation was not caught')
      exitCode = 1
    } else if (!controlClean) {
      console.error('SPLASH CALM GATE SELF-TEST: FAIL, the unseeded control is not clean, '
        + 'so a red from this gate would not mean anything')
      exitCode = 1
    } else {
      console.log('SPLASH CALM GATE SELF-TEST: PASS (every seeded rotation caught, control clean)')
    }
  } else {
    const failures = []
    const allRows = []
    const allShots = []
    for (const profile of PROFILES) {
      for (const surface of SURFACES) {
        const { samples, shots } = await measureSurface(browser, BASE, profile, surface, { capture: CAPTURE })
        const { findings, rows } = assess(profile, surface, samples)
        failures.push(...findings)
        allRows.push(...rows)
        allShots.push(...shots)
        const worst = rows.reduce((a, r) => Math.max(a, r.maxDx, r.maxDy, r.maxDw, r.maxDh), 0)
        console.log(
          `  ${profile.name.padEnd(9)} ${surface.id.padEnd(7)} `
          + `samples=${String(samples.filter((s) => s.present).length).padStart(3)} `
          + `targets=${rows.length} maxMove=${worst.toFixed(2)}px ${findings.length ? 'FINDINGS' : 'still'}`,
        )
      }
    }

    writeFileSync(join(QA, 'splash_calm_gate_2026-07-27.json'), JSON.stringify({
      window_ms: WINDOW_MS, sample_ms: SAMPLE_MS, eps_px: EPS,
      profiles: PROFILES, rows: allRows, screenshots: allShots, failures,
    }, null, 2))

    console.log(`\nSPLASH CALM GATE: ${PROFILES.length} profiles x ${SURFACES.length} surfaces, `
      + `${WINDOW_MS / 1000}s each at ${SAMPLE_MS}ms`)
    if (failures.length) {
      console.error(`\nFAIL, ${failures.length} finding(s):`)
      for (const f of failures) console.error(`  ${f}`)
      exitCode = 1
    } else {
      console.log('SPLASH CALM GATE: PASS (every boot logo still: zero geometry variance, '
        + 'no rotation, no translation, no transform animation)')
    }
  }
} finally {
  await browser.close()
  killPreview(preview)
}

// TR-101, Fable's ruling: a gate leaves nothing running. ASSERTED, not cleaned
// up, because killing here would hide the defect it reports. Folded into the
// exit code rather than exiting early, so a gate that both fails its own
// checks and leaks still reports both.
if (!assertNoSurvivors('splash calm gate')) {
  console.error('\nSPLASH CALM GATE: this gate left processes behind')
  exitCode = 1
}
process.exit(exitCode)
