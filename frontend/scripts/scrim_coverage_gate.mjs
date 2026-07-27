// scrim_coverage_gate.mjs, FS VISUAL FIXPACK JOB 4: a full-screen scrim covers
// the full screen.
//
// THE OWNER'S REPORT (reports/briefs/FS_VISUAL_FIXPACK_Prompt.md), quoted:
// "The full-screen dark overlay behind dialogs and transitions does not always
// cover the whole screen; at some sizes the corners show through."
//
// WHY IT HAPPENS, AND WHY "AT SOME SIZES" IS THE TELL
// ---------------------------------------------------
// On desktop, App.svelte's `.game-wrapper` is a 1280x720 box carrying
// `transform: scale(var(--S))`, and a transform makes an element the containing
// block for its `position: fixed` DESCENDANTS. Every dialog scrim lives inside
// it, so `position: fixed; inset: 0` resolved to the STAGE, not the viewport.
// PaytableModal's own comment said as much in terms: "App.svelte's
// transform:scale re-anchors position:fixed descendants to the 1280x720 stage,
// so this covers the stage exactly."
//
// Covering the stage exactly is invisible while the window happens to be 16:9,
// because then the stage IS the viewport. At any other aspect ratio the stage
// is letterboxed and the bands beside or above it are simply not covered. That
// is the owner's "at some sizes", and it is why the corners are what shows: at
// most window shapes the uncovered region is two bands, and the corners are
// where a player's eye lands on them.
//
// The native-HUD modes (portrait, compact landscape, mini player) drop the
// transform, so they were already correct. This gate covers all of them anyway,
// because a gate that only runs where the bug is cannot tell you when the fix
// broke somewhere else.
//
// WHAT IS ASSERTED
// ----------------
//   RECT     the scrim's box contains the whole visual viewport, no negative
//            margin at any edge.
//   HIT TEST a ring of sample points one pixel inside every edge, and both
//            diagonals of every corner, must hit the scrim or something inside
//            it. The rect test alone would pass a scrim that is the right size
//            and clipped by an ancestor; only a hit test knows what is actually
//            on top of a pixel.
//   SHARED   no component may hand-roll full-screen scrim geometry. A rule that
//            declares `position: fixed` with a full inset AND paints a
//            background is a second implementation, and the whole point of this
//            pass is that there is one.
//
// SAFE-AREA INSETS, stated honestly. Headless chromium reports every
// env(safe-area-inset-*) as zero, so no run here can exercise a real notch and
// this gate does not claim to. What it asserts instead is the property that
// makes insets a non-issue: the shared rule sizes from 100vw and 100dvh, which
// span the whole visual viewport INCLUDING the inset regions, and it is checked
// to contain no env(safe-area-inset reference that could shrink it. An inset is
// advisory geometry telling you where an obstruction is; a scrim's job is to
// pass under it, not to stop at it.
//
// CONVENTION (p): --self-test plants the real defect, which is the scrim
// re-anchored to the scaled stage, and the real regression, a scrim that keeps
// the shared class but is shrunk by the insets.
//
// USAGE (from frontend/, after `npm run build`):
//   node scripts/scrim_coverage_gate.mjs
//   node scripts/scrim_coverage_gate.mjs --self-test
//   FS_WRITE_EVIDENCE=1 node scripts/scrim_coverage_gate.mjs --capture --label after

import { chromium } from 'playwright'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'
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

announceEvidenceMode('scrim_coverage_gate')
const QA = evidenceDir('reports', 'qa')
const SHOTS = evidenceDir('reports', 'screens', 'scrim-coverage-2026-07-27')

// The platform's own seven, plus three swept sizes chosen to maximise
// letterboxing against the 1280x720 stage: much wider than 16:9, square, and
// much taller. The defect is invisible at 16:9 and worst far from it.
const PRESETS = [
  { name: 'Desktop', width: 1200, height: 675 },
  { name: 'Laptop', width: 1024, height: 576 },
  { name: 'Popout S', width: 400, height: 225 },
  { name: 'Popout L', width: 800, height: 450 },
  { name: 'Mobile L', width: 425, height: 812 },
  { name: 'Mobile M', width: 375, height: 667 },
  { name: 'Mobile S', width: 320, height: 568 },
]
const SWEPT = [
  { name: 'Swept wide', width: 1600, height: 600 },
  { name: 'Swept square', width: 900, height: 900 },
  { name: 'Swept tall', width: 1100, height: 980 },
]
const ALL_SIZES = [...PRESETS, ...SWEPT]

/**
 * The scrims a player actually meets, and how to reach each one.
 *
 * `open` returns true when the surface is on screen. Anything it cannot reach
 * at a given size is reported as skipped rather than silently passing, because
 * a gate that quietly checks nothing is the failure convention (p) names.
 */
const SURFACES = [
  {
    id: 'hero-splash',
    selector: '[data-testid="hero-splash"]',
    async open(page) {
      return page.locator('[data-testid="hero-splash"]').count().then((n) => n > 0)
    },
  },
  {
    id: 'intro-rules',
    selector: '.intro-backdrop',
    async open(page) {
      const splash = page.locator('[data-testid="hero-splash"]')
      if (await splash.count() > 0) {
        await splash.evaluate((el) => el.click())
        await page.waitForTimeout(200)
      }
      return page.locator('.intro-backdrop').count().then((n) => n > 0)
    },
  },
  {
    id: 'paytable',
    selector: '.fs-pt',
    async open(page) {
      await dismissIntro(page)
      const ok = await page.evaluate(() => {
        const m = [...document.querySelectorAll('.fs-menu, [data-testid="mini-menu"], .p-round-btn, .c-round-btn, .m-round-btn')]
          .find((e) => (e.getAttribute('aria-label') || '') === 'Menu')
        if (!m) return false
        m.click()
        return true
      })
      if (!ok) return false
      await page.waitForTimeout(180)
      await page.evaluate(() => { const it = document.querySelector('.hud-menu-item'); if (it) it.click() })
      await page.waitForTimeout(350)
      return page.locator('.fs-pt').count().then((n) => n > 0)
    },
  },
  {
    id: 'feature-menu',
    selector: '.fm',
    async open(page) {
      await dismissIntro(page)
      const ok = await page.evaluate(() => {
        const b = document.querySelector('[data-testid="feature-menu-button"]')
        if (!b) return false
        b.click()
        return true
      })
      if (!ok) return false
      await page.waitForTimeout(350)
      return page.locator('.fm').count().then((n) => n > 0)
    },
  },
  {
    id: 'session-sheet',
    selector: '.sp-sheet-backdrop',
    async open(page) {
      await dismissIntro(page)
      const ok = await page.evaluate(() => {
        const m = [...document.querySelectorAll('.fs-menu, [data-testid="mini-menu"], .p-round-btn, .c-round-btn, .m-round-btn')]
          .find((e) => (e.getAttribute('aria-label') || '') === 'Menu')
        if (!m) return false
        m.click()
        return true
      })
      if (!ok) return false
      await page.waitForTimeout(180)
      await page.evaluate(() => {
        const it = document.querySelector('[data-testid="open-session-panel"]')
        if (it) it.click()
      })
      await page.waitForTimeout(300)
      return page.locator('.sp-sheet-backdrop').count().then((n) => n > 0)
    },
  },
]

/** Sub-pixel rounding. The shipped defect leaves whole bands, not fractions. */
const EPS = 1

const RGS_HOST = 'rgs.scrim-coverage-gate.invalid'

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


const GATE_TIMEOUT_MS = 10 * 60_000
setTimeout(() => {
  console.error(`SCRIM COVERAGE GATE: HARD TIMEOUT after ${GATE_TIMEOUT_MS / 1000}s, failing red`)
  process.exit(1)
}, GATE_TIMEOUT_MS)



const MEASURE = ([selector, eps]) => {
  const el = document.querySelector(selector)
  if (!el) return { missing: true }
  const r = el.getBoundingClientRect()

  // The TRUE visual viewport. visualViewport is the one that tracks a pinch or
  // a retracting mobile toolbar; innerWidth/innerHeight are the fallback.
  const vv = window.visualViewport
  const vw = vv ? vv.width : window.innerWidth
  const vh = vv ? vv.height : window.innerHeight

  // Positive means an uncovered strip of that many pixels at that edge.
  const gaps = {
    left: +(r.left - 0).toFixed(2),
    top: +(r.top - 0).toFixed(2),
    right: +(vw - r.right).toFixed(2),
    bottom: +(vh - r.bottom).toFixed(2),
  }

  // HIT TEST. A ring one pixel inside every edge plus both diagonals of every
  // corner. The rect check cannot see an ancestor clipping the scrim; this can.
  const misses = []
  const pts = []
  const N = 9
  for (let i = 0; i < N; i++) {
    const fx = (i + 0.5) / N
    pts.push(['top', Math.round(fx * vw), 1])
    pts.push(['bottom', Math.round(fx * vw), Math.round(vh - 2)])
    pts.push(['left', 1, Math.round(fx * vh)])
    pts.push(['right', Math.round(vw - 2), Math.round(fx * vh)])
  }
  for (const [cx, cy, name] of [[2, 2, 'top-left'], [vw - 3, 2, 'top-right'], [2, vh - 3, 'bottom-left'], [vw - 3, vh - 3, 'bottom-right']]) {
    pts.push([name, Math.round(cx), Math.round(cy)])
  }
  for (const [edge, x, y] of pts) {
    const hit = document.elementFromPoint(x, y)
    const covered = !!hit && (hit === el || el.contains(hit))
    if (!covered) {
      misses.push({
        edge, x, y,
        hit: hit ? ((hit.className && hit.className.toString().split(' ')[0]) || hit.tagName) : 'nothing',
      })
    }
  }

  const worstGap = Math.max(gaps.left, gaps.top, gaps.right, gaps.bottom)
  return {
    vw: +vw.toFixed(2), vh: +vh.toFixed(2),
    rect: { x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) },
    gaps, worstGap, misses, missCount: misses.length, sampled: pts.length,
    covers: worstGap <= eps && misses.length === 0,
  }
}

const SEEDS = {
  // Seed 1: the defect exactly as it shipped. Pinning the scrim back to
  // `inset: 0` re-anchors it to whatever its containing block is, which on
  // desktop is the scaled stage.
  reanchor: `
    .fs-scrim { left: 0 !important; top: 0 !important; right: 0 !important; bottom: 0 !important;
                width: auto !important; height: auto !important; transform: none !important; }
  `,
  // Seed 2: the regression a well-meaning later edit would introduce, making
  // the scrim respect the safe-area insets instead of passing under them. The
  // insets are zero here, so this seeds the same shape with a literal.
  insetShrink: `
    .fs-scrim { width: calc((100vw / var(--scrim-scale, 1)) - 24px) !important;
                height: calc((100dvh / var(--scrim-scale, 1)) - 24px) !important; }
  `,
}

/**
 * The SHARED half: no component may carry its own full-screen scrim geometry.
 *
 * A CSS rule that declares `position: fixed`, a full inset, AND a background is
 * a second implementation of this pass's whole subject. Read out of the source
 * rather than the DOM because the point is that it must not be WRITTEN, not
 * merely that it currently renders correctly.
 */
function scanForHandRolledScrims() {
  const dirs = [join(ROOT, 'src'), join(ROOT, 'src', 'lib', 'components')]
  const files = new Set()
  for (const d of dirs) {
    let entries = []
    try { entries = readdirSync(d) } catch { continue }
    for (const n of entries) if (n.endsWith('.svelte')) files.add(join(d, n))
  }
  const found = []
  for (const file of [...files].sort()) {
    const src = readFileSync(file, 'utf8')
    const styleStart = src.indexOf('<style>')
    if (styleStart < 0) continue
    // Comments are stripped first, otherwise a rule preceded by a block comment
    // reports the whole comment as its "selector" and the finding is unreadable.
    const css = src.slice(styleStart).replace(/\/\*[\s\S]*?\*\//g, '')
    // Each declaration block with its selector prelude.
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = m[1].trim().replace(/\s+/g, ' ').replace(/^<style>\s*/, '')
      const body = m[2]
      if (!/position\s*:\s*fixed/.test(body)) continue
      const fullInset = /inset\s*:\s*0(\s|;|$)/.test(body)
        || (/top\s*:\s*0/.test(body) && /left\s*:\s*0/.test(body) && /right\s*:\s*0/.test(body) && /bottom\s*:\s*0/.test(body))
      if (!fullInset) continue
      if (!/background(-color|-image)?\s*:/.test(body)) continue
      found.push({ file: file.replace(ROOT + '/', ''), selector })
    }
  }
  return found
}

/** The shared rule must not shrink itself by the safe-area insets. */
function scanSharedRule() {
  const css = readFileSync(join(ROOT, 'src', 'app.css'), 'utf8')
  const m = css.match(/\.fs-scrim\s*\{([^}]*)\}/)
  if (!m) return { present: false }
  const body = m[1]
  return {
    present: true,
    usesViewportUnits: /100vw/.test(body) && /100dvh/.test(body),
    referencesSafeArea: /env\(\s*safe-area-inset/.test(body),
    body: body.replace(/\s+/g, ' ').trim(),
  }
}

async function measureSurface(browser, base, size, surface, opts = {}) {
  const { seedCss = null, capture = false } = opts
  const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height } })
  const page = await ctx.newPage()
  await page.route(`**://${RGS_HOST}/**`, (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify(route.request().url().includes('/wallet/authenticate') ? authBody() : {}),
  }))
  await page.goto(`${base}/?sessionID=scrim-gate&rgs_url=${RGS_HOST}&lang=en`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(250)
  if (seedCss) await page.addStyleTag({ content: seedCss })

  let opened = false
  try { opened = await surface.open(page) } catch { opened = false }
  if (!opened) { await ctx.close(); return { skipped: true } }
  await page.waitForTimeout(200)

  const m = await page.evaluate(MEASURE, [surface.selector, EPS])
  let shot = null
  if (capture && !m.missing) {
    shot = `${LABEL}-${surface.id}-${size.name.toLowerCase().replace(/\s+/g, '-')}.png`
    await page.screenshot({ path: join(SHOTS, shot) })
  }
  await ctx.close()
  return { ...m, shot }
}

const port = await getFreePort()
const preview = await startPreview(port)
const BASE = `http://localhost:${port}`
const browser = await chromium.launch()

let exitCode = 0
try {
  if (SELF_TEST) {
    console.log('SCRIM COVERAGE GATE SELF-TEST: planting the two real failure forms\n')
    const size = { name: 'Swept wide', width: 1600, height: 600 }
    const surface = SURFACES.find((s) => s.id === 'paytable')
    let ok = true

    const s1 = await measureSurface(browser, BASE, size, surface, { seedCss: SEEDS.reanchor })
    const red1 = !s1.skipped && !s1.missing && !s1.covers
    console.log(`  seed 1, the scrim re-anchored to the scaled stage -> ${red1 ? 'RED (correct)' : 'GREEN (WRONG)'}`)
    if (!s1.skipped && !s1.missing) console.log(`      worst gap ${s1.worstGap}px, ${s1.missCount}/${s1.sampled} sample points uncovered`)
    if (!red1) ok = false

    const s2 = await measureSurface(browser, BASE, size, surface, { seedCss: SEEDS.insetShrink })
    const red2 = !s2.skipped && !s2.missing && !s2.covers
    console.log(`  seed 2, the scrim shrunk by a safe-area inset     -> ${red2 ? 'RED (correct)' : 'GREEN (WRONG)'}`)
    if (!s2.skipped && !s2.missing) console.log(`      worst gap ${s2.worstGap}px, ${s2.missCount}/${s2.sampled} sample points uncovered`)
    if (!red2) ok = false

    const c = await measureSurface(browser, BASE, size, surface)
    const green = !c.skipped && !c.missing && c.covers
    console.log(`  control, nothing seeded                           -> ${green ? 'GREEN (correct)' : 'RED (WRONG)'}`)
    if (!c.skipped && !c.missing) console.log(`      worst gap ${c.worstGap}px, ${c.missCount}/${c.sampled} sample points uncovered`)
    if (!green) ok = false

    console.log('')
    if (ok) console.log('SCRIM COVERAGE GATE SELF-TEST: PASS (both seeded forms caught, control clean)')
    else { console.error('SCRIM COVERAGE GATE SELF-TEST: FAIL'); exitCode = 1 }
  } else {
    const failures = []
    const rows = []
    const shots = []

    // The SHARED half runs first: it needs no browser and it is the assertion
    // that this pass produced one implementation rather than nine correct ones.
    const shared = scanSharedRule()
    if (!shared.present) {
      failures.push('src/app.css declares no .fs-scrim rule, so there is no shared implementation to share')
    } else {
      if (!shared.usesViewportUnits) {
        failures.push(`the shared .fs-scrim rule does not size from 100vw and 100dvh: "${shared.body}"`)
      }
      if (shared.referencesSafeArea) {
        failures.push('the shared .fs-scrim rule references env(safe-area-inset...), which would stop it '
          + 'at the inset rather than passing under it')
      }
    }
    const handRolled = scanForHandRolledScrims()
    for (const h of handRolled) {
      failures.push(`${h.file} hand-rolls full-screen scrim geometry at "${h.selector}". `
        + 'Geometry belongs to the shared .fs-scrim class; a component supplies only paint.')
    }
    console.log(`  shared rule present=${shared.present} viewportUnits=${shared.usesViewportUnits} `
      + `safeAreaRef=${shared.referencesSafeArea} handRolled=${handRolled.length}`)

    for (const size of ALL_SIZES) {
      for (const surface of SURFACES) {
        const capture = CAPTURE && (size.name === 'Swept wide' || size.name === 'Swept square') && surface.id === 'paytable'
        const m = await measureSurface(browser, BASE, size, surface, { capture })
        if (m.skipped) {
          rows.push({ size: size.name, surface: surface.id, skipped: true })
          console.log(`  ${size.name.padEnd(13)} ${surface.id.padEnd(14)} not reachable at this size, skipped`)
          continue
        }
        if (m.missing) {
          failures.push(`${size.name} / ${surface.id}: opened but ${surface.selector} was not in the DOM`)
          continue
        }
        if (m.shot) shots.push(m.shot)
        rows.push({
          size: size.name, viewport: `${size.width}x${size.height}`, surface: surface.id,
          rect: m.rect, gaps: m.gaps, worstGap: m.worstGap,
          uncoveredSamples: m.missCount, sampled: m.sampled,
        })
        if (m.worstGap > EPS) {
          const worst = Object.entries(m.gaps).sort((a, b) => b[1] - a[1])[0]
          failures.push(
            `${size.name} (${size.width}x${size.height}) / ${surface.id}: scrim leaves `
            + `${worst[1]}px uncovered at ${worst[0]} (scrim ${m.rect.w}x${m.rect.h} in a ${m.vw}x${m.vh} viewport)`,
          )
        }
        if (m.missCount > 0) {
          const sample = m.misses.slice(0, 3).map((x) => `${x.edge}(${x.x},${x.y})->${x.hit}`).join(' ')
          failures.push(
            `${size.name} (${size.width}x${size.height}) / ${surface.id}: `
            + `${m.missCount} of ${m.sampled} edge sample points are not covered by the scrim: ${sample}`,
          )
        }
        console.log(
          `  ${size.name.padEnd(13)} ${surface.id.padEnd(14)} `
          + `gap=${String(m.worstGap).padStart(6)}px uncoveredSamples=${String(m.missCount).padStart(2)}/${m.sampled} `
          + `${m.covers ? 'ok' : 'FINDINGS'}`,
        )
      }
    }

    writeFileSync(join(QA, 'scrim_coverage_gate_2026-07-27.json'), JSON.stringify({
      eps_px: EPS, sizes: ALL_SIZES, surfaces: SURFACES.map((s) => s.id),
      shared_rule: shared, hand_rolled: handRolled, rows, screenshots: shots, failures,
    }, null, 2))

    const measured = rows.filter((r) => !r.skipped).length
    console.log(`\nSCRIM COVERAGE GATE: ${ALL_SIZES.length} sizes x ${SURFACES.length} scrims, ${measured} measured`)
    if (failures.length) {
      console.error(`\nFAIL, ${failures.length} finding(s):`)
      for (const f of failures) console.error(`  ${f}`)
      exitCode = 1
    } else {
      console.log('SCRIM COVERAGE GATE: PASS (one shared implementation, and zero uncovered pixels '
        + 'at every edge of every scrim at all seven presets and three swept sizes)')
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
if (!assertNoSurvivors('scrim coverage gate')) {
  console.error('\nSCRIM COVERAGE GATE: this gate left processes behind')
  exitCode = 1
}
process.exit(exitCode)
