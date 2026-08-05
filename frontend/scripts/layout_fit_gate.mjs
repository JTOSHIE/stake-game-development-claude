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
import { mkdirSync, writeFileSync, readFileSync, readdirSync, cpSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { evidenceDir, announceEvidenceMode, SCRATCH_ROOT } from './lib/evidencePaths.mjs'
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
// The three adapter names that used to sit here (getFreePort, startPreview,
// killPreview) are gone. They wrapped a single module-level `_server`, which a
// self-test cannot use: it has to stand up a server per pass, against a
// different built tree each time. `measurePresets` below owns its own server for
// the length of one pass and closes it in a finally, which is what the adapters
// were emulating anyway.
const SELF_TEST = process.argv.includes('--self-test')

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
  // S2-C024: ABSENCE IS RECORDED, NEVER SWALLOWED.
  //
  // These two lines used to be a bare "continue" on a missing element and a
  // bare "continue" on display:none, and between them they made the whole
  // readout check unfalsifiable: a readout that never mounted, or mounted
  // hidden, left NO trace at all. The readouts array was consumed only by a
  // filter on r.clipped, so an empty array produced an empty clipped array and
  // zero failures. The gate printed PASS on a HUD with no balance, no win and
  // no bet on it.
  //
  // A gate that cannot see a missing element is not measuring presence, it is
  // measuring the elements that happened to be there. Both branches now push a
  // record and the caller asserts on it.
  const readouts = []
  for (const q of ['[data-testid="hud-balance"]', '[data-testid="hud-win"]', '[data-testid="hud-bet"]']) {
    const el = document.querySelector(q)
    if (!el) { readouts.push({ id: q, missing: true }); continue }
    const cs = getComputedStyle(el)
    if (cs.display === 'none') { readouts.push({ id: q, hidden: true }); continue }
    // Measure the deepest text-bearing node, not the padded container.
    const t = el.querySelector('.m-stat-val, .stat-value, span, div') || el
    readouts.push({ id: q, scrollW: t.scrollWidth, clientW: t.clientWidth,
                    clipped: t.scrollWidth - t.clientWidth > EPS, text: (t.textContent || '').trim().slice(0, 24) })
  }

  return { vw, vh, fits, controls, readouts }
})()`

/**
 * One measuring pass over a set of presets, against a given built tree.
 *
 * Extracted so the self-test can point it at a SEEDED dist. The alternative was
 * a DOM seed that removes the element after it mounts, and that would have been
 * the weaker proof: it reproduces the state at measurement time without ever
 * exercising the build, so it could not tell us whether a real refactor that
 * renames a testid is caught. Convention (p) asks for the form that actually
 * ships, and what ships is a bundle.
 */
async function measurePresets(distDir, presets) {
  const failures = []
  const rows = []

  const server = await startStaticServer(distDir)
  const BASE = `http://localhost:${server.port}`
  const browser = await chromium.launch()

  try {
    for (const p of presets) {
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
      const missing = m.readouts.filter((r) => r.missing)
      const hidden = m.readouts.filter((r) => r.hidden)

      if (m.fits.vScroll) failures.push(`${p.name}: wrapper scrolls vertically (${m.fits.wrapperScrollH} > ${m.fits.wrapperClientH})`)
      if (m.fits.hScroll) failures.push(`${p.name}: wrapper scrolls horizontally (${m.fits.wrapperScrollW} > ${m.fits.wrapperClientW})`)
      if (m.fits.docScroll) failures.push(`${p.name}: document scrolls (${m.fits.docScrollH} > ${m.fits.docClientH})`)
      for (const c of offscreen) failures.push(`${p.name}: control "${c.id}" outside the viewport (${c.how.join(',')}) at x=${c.rect.x} w=${c.rect.w}`)
      for (const r of clipped) failures.push(`${p.name}: readout ${r.id} clips its value ("${r.text}", ${r.scrollW} > ${r.clientW})`)

      // S2-C024, THE ASSERTION THE GATE NEVER HAD. All three readouts are
      // expected at EVERY preset, not "at least one": HudOverlay.svelte has four
      // mutually exclusive profile branches and every one of them carries all
      // three testids, so the source supports the strong form. A gate written
      // deliberately weaker than its source is the same unfalsifiable shape in a
      // smaller size.
      for (const r of missing) failures.push(`${p.name}: readout ${r.id} is NOT MOUNTED`)
      for (const r of hidden) failures.push(`${p.name}: readout ${r.id} is mounted but display:none, so the player cannot see it`)

      rows.push({
        preset: p.name, size: `${p.width}x${p.height}`,
        vScroll: m.fits.vScroll, hScroll: m.fits.hScroll, docScroll: m.fits.docScroll,
        controls: m.controls.length, offscreen: offscreen.map((c) => c.id), clipped: clipped.map((r) => r.id),
        // Recorded as well as asserted, so the committed evidence carries a field
        // that MOVES when a readout goes missing. It previously did not.
        readouts: m.readouts.length, missing: missing.map((r) => r.id), hidden: hidden.map((r) => r.id),
      })
      console.log(
        `  ${p.name.padEnd(10)} ${(p.width + 'x' + p.height).padEnd(9)} ` +
        `scroll=${m.fits.vScroll || m.fits.hScroll || m.fits.docScroll ? 'YES' : 'no '} ` +
        `controls=${String(m.controls.length).padStart(2)} offscreen=${offscreen.length} clipped=${clipped.length} ` +
        `readouts=${m.readouts.length - missing.length}/3${missing.length ? ' MISSING ' + missing.length : ''}`,
      )
      await ctx.close()
    }
  } finally {
    await browser.close()
    server.close()
  }

  return { rows, failures }
}

// ── convention (p): the seeded self-test this gate never had ─────────────────
//
// Ten of the twelve browser legs in checks.yml run `--self-test && <gate>`. This
// one ran BARE, because it had no self-test to run: no --self-test, no seed, no
// flag anywhere in the file. So its PASS was a script printing PASS, which is
// what convention (p) exists to stop, and the matrix leg is changed with it.
//
// THE SEEDS ARE BUILD-LEVEL, and that is the point. Each one copies the real
// dist into the gitignored .evidence-scratch/ and breaks it there, so the tree is
// never touched and the seed still travels the same path a real regression would.

const SEED_ROOT = join(SCRATCH_ROOT, 'layout-fit-seeded')

function seedDist(name, transform) {
  const dir = join(SEED_ROOT, name)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  cpSync(join(ROOT, 'dist'), dir, { recursive: true })
  transform(dir)
  return dir
}

/** A refactor renames a testid and the readout stops matching. */
function seedRenameTestid(dir, from, to) {
  const assets = join(dir, 'assets')
  let hits = 0
  for (const f of readdirSync(assets)) {
    if (!f.endsWith('.js')) continue
    const p = join(assets, f)
    const src = readFileSync(p, 'utf-8')
    if (!src.includes(from)) continue
    hits += src.split(from).length - 1
    writeFileSync(p, src.split(from).join(to))
  }
  return hits
}

/** A CSS regression hides a readout that is still in the DOM. */
function seedHideTestid(dir, testid) {
  const p = join(dir, 'index.html')
  const html = readFileSync(p, 'utf-8')
  writeFileSync(p, html.replace('</head>',
    `<style>[data-testid="${testid}"]{display:none !important}</style></head>`))
}

async function selfTest() {
  const probe = [PRESETS[0]]
  const results = []
  const check = (name, pass, detail) => {
    results.push(pass)
    console.log(`  ${pass ? 'pass' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
  }

  console.log('LAYOUT FIT GATE SELF-TEST')
  console.log(`  seeded builds under ${SEED_ROOT}`)
  console.log('')

  // CONTROL 1 first, deliberately. If the real dist does not carry all three
  // readouts at this preset, then the seeds below prove nothing and the strong
  // "all three" predicate is wrong about the source rather than about the build.
  const control = await measurePresets(join(ROOT, 'dist'), probe)
  const c0 = control.rows[0] || {}
  check('CONTROL the real dist mounts all three readouts', c0.readouts === 3 && (c0.missing || []).length === 0,
    `readouts=${c0.readouts}, missing=${JSON.stringify(c0.missing || [])}`)
  check('CONTROL the real dist reports no findings at this preset', control.failures.length === 0,
    control.failures.length ? control.failures[0] : 'clean')

  // SEED 1: THE FORM THAT REALLY OCCURS. A testid is renamed in the built
  // bundle, so the element never mounts under the name the gate looks for. This
  // is a refactor, and it is exactly how a readout goes missing in practice.
  let renamed = 0
  const dirRenamed = seedDist('rename-hud-win', (d) => { renamed = seedRenameTestid(d, 'hud-win', 'hud-w1n') })
  check('SEED the rename reached the built bundle', renamed > 0, `${renamed} literal(s) rewritten`)
  const seeded1 = await measurePresets(dirRenamed, probe)
  const caught1 = seeded1.failures.filter((f) => /readout \[data-testid="hud-win"\] is NOT MOUNTED/.test(f))
  check('SEED a renamed testid is CAUGHT as not mounted', caught1.length === 1, caught1[0] || 'not caught')

  // SEED 2: the second swallow, which the row did not name. A readout that is in
  // the DOM but display:none is invisible to the player and was equally silent.
  const dirHidden = seedDist('hide-hud-bet', (d) => seedHideTestid(d, 'hud-bet'))
  const seeded2 = await measurePresets(dirHidden, probe)
  const caught2 = seeded2.failures.filter((f) => /readout \[data-testid="hud-bet"\] is mounted but display:none/.test(f))
  check('SEED a display:none readout is CAUGHT', caught2.length === 1, caught2[0] || 'not caught')

  // CONTROL 3: the seed is SPECIFIC. Renaming hud-win must not report hud-balance
  // or hud-bet as missing, or the assertion is firing on something other than the
  // thing it names and the red would be meaningless.
  const strays = seeded1.failures.filter((f) => /NOT MOUNTED/.test(f) && !/hud-win/.test(f))
  check('CONTROL the seed does not implicate the other two readouts', strays.length === 0,
    strays.length ? strays.join('; ') : 'none')

  rmSync(SEED_ROOT, { recursive: true, force: true })

  const failed = results.filter((r) => !r).length
  console.log('')
  console.log(`LAYOUT FIT GATE SELF-TEST: ${failed ? 'FAIL' : 'PASS'} `
    + `(${results.length - failed}/${results.length}, 3 seeds, 3 paired controls)`)
  return failed === 0
}

if (SELF_TEST) {
  // Exits BEFORE any evidence write, per convention (h.1). The gate's own
  // evidence path is already scratch-routed via evidenceDir, so this is belt and
  // braces rather than the only guard, but a self-test has no business writing a
  // gate report at all: its rows describe seeded builds, not the shipped one.
  process.exit((await selfTest()) ? 0 : 1)
}

const { rows, failures } = await measurePresets(join(ROOT, 'dist'), PRESETS)

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
// TR-101, Fable's ruling: a gate leaves nothing running. ASSERTED, not
// cleaned up, because killing here would hide the defect it reports.
if (!assertNoSurvivors('layout fit gate')) {
  console.error('\nLAYOUT FIT GATE: FAIL, this gate left processes behind')
  process.exit(1)
}
process.exit(0)
