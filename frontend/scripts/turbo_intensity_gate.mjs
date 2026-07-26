// turbo_intensity_gate.mjs, FS VISUAL FIXPACK JOB 2: the three speeds are
// PROVABLY distinguishable, not just intended to be.
//
// THE OWNER'S RULING (reports/briefs/FS_VISUAL_FIXPACK_Prompt.md), quoted:
// "the bolt symbol only, no numeral, with the three speeds expressed by the
// control itself intensifying, brighter glow and stronger highlight at each
// step, clearly distinguishable at a glance at all seven presets."
//
// WHY THIS GATE EXISTS, AND WHY IT MEASURES PIXELS
// -----------------------------------------------
// Before this pass the control lit up on a single boolean, `.engaged`, so
// Turbo and Super Turbo were styled IDENTICALLY and the only thing telling
// them apart was the 0.5rem numeral the owner has now removed. Delete the
// numeral without measuring and the game ships two speeds a player cannot
// tell apart at all, which is worse than the defect being fixed.
//
// So "distinguishable" is measured rather than asserted, and it is measured on
// composited pixels for the same reason contrast_gate.mjs does: the control's
// glow is a drop-shadow and a box-shadow spilling outside its own box over
// whatever art happens to be behind it. No stylesheet states the result. Only a
// screenshot knows.
//
// THE METRIC. For each tier the gate screenshots the control's box plus a
// margin wide enough to contain its glow, decodes it through the browser's own
// canvas, and computes the MEAN WCAG relative luminance over every pixel. Mean,
// not worst: the question here is "is this control brighter overall than that
// one", which is what a player judges at a glance, and a single bright pixel is
// not a state. The step between two tiers is then the standard WCAG contrast
// ratio between those two means.
//
// THE BAR, and where it comes from. WCAG 2.1 SC 1.4.11 sets 3:1 for a non-text
// UI component against ADJACENT COLOURS. It says nothing about two states of
// one component, because that is not a case the specification covers, so
// quoting 3:1 here would be borrowing authority the figure does not have. The
// bar asserted is MIN_STEP below, and the measured figures are written into
// reports/qa so the owner can raise it knowing exactly what headroom the shipped
// design has. Monotonicity is asserted separately and absolutely: brighter must
// mean faster at every step, or the encoding is not an encoding.
//
// LUMINANCE, NOT HUE, IS THE CHANNEL. A hue-only encoding fails WCAG 1.4.1 for
// a colour-blind player and fails again on a washed-out phone screen outdoors.
// Every step in this design raises brightness, and brightness is what this gate
// measures, so the accessibility property and the measured property are the
// same property.
//
// ALSO ASSERTED: the numeral is gone. The control's own rendered text must
// contain no digit and no multiplication sign at any tier and any preset. That
// is the owner's instruction stated as a machine check rather than as an
// intention, so it cannot quietly come back.
//
// CONVENTION (p): --self-test plants both real defects. Seed 1 restyles Super
// Turbo to look like Normal, which is the exact shape of the boolean `.engaged`
// this pass replaced. Seed 2 puts the numeral back into the control. The gate
// must go red on each.
//
// USAGE (from frontend/, after `npm run build`):
//   node scripts/turbo_intensity_gate.mjs
//   node scripts/turbo_intensity_gate.mjs --self-test
//   FS_WRITE_EVIDENCE=1 node scripts/turbo_intensity_gate.mjs --capture

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

const SELF_TEST = process.argv.includes('--self-test')
const CAPTURE = process.argv.includes('--capture')

announceEvidenceMode('turbo_intensity_gate')
const QA = evidenceDir('reports', 'qa')
const SHOTS = evidenceDir('reports', 'screens', 'turbo-control-2026-07-27')

// The platform's own Screen menu, same seven as layout_fit_gate.mjs.
const PRESETS = [
  { name: 'Desktop', width: 1200, height: 675 },
  { name: 'Laptop', width: 1024, height: 576 },
  { name: 'Popout S', width: 400, height: 225 },
  { name: 'Popout L', width: 800, height: 450 },
  { name: 'Mobile L', width: 425, height: 812 },
  { name: 'Mobile M', width: 375, height: 667 },
  { name: 'Mobile S', width: 320, height: 568 },
]

// The three presets the brief names for the committed side-by-side proof.
const PROOF_PRESETS = new Set(['Desktop', 'Mobile L', 'Popout S'])

const TIERS = ['normal', 'turbo', 'super']

/**
 * The minimum WCAG contrast ratio between two ADJACENT speed states.
 *
 * Not borrowed from a specification, because no specification covers it (see
 * the header). Set from the shipped design's own measured floor with headroom
 * left underneath, so the gate fails on a regression rather than on noise. The
 * measured figures for every preset are in the JSON this writes.
 */
const MIN_STEP = 1.25

/** Pixels of margin around the control's box, so its glow is inside the crop. */
const GLOW_MARGIN = 16

const RGS_HOST = 'rgs.turbo-intensity-gate.invalid'
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

function getFreePort() {
  return new Promise((res, rej) => {
    const srv = createServer()
    srv.on('error', rej)
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => res(port)) })
  })
}

const GATE_TIMEOUT_MS = 6 * 60_000
setTimeout(() => {
  console.error(`TURBO INTENSITY GATE: HARD TIMEOUT after ${GATE_TIMEOUT_MS / 1000}s, failing red`)
  process.exit(1)
}, GATE_TIMEOUT_MS)

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

const ratio = (l1, l2) => {
  const hi = Math.max(l1, l2), lo = Math.min(l1, l2)
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * Decode a PNG and reduce it to luminance statistics, all inside the page.
 *
 * The browser is already open and already has a decoder, so this needs no image
 * library and no shelling out. Returns the WCAG relative luminance mean and the
 * 95th percentile, the latter standing in for "how bright is the highlight".
 */
async function luminanceOf(page, pngBuffer) {
  const dataUrl = 'data:image/png;base64,' + pngBuffer.toString('base64')
  return page.evaluate(async (url) => {
    const img = new Image()
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url })
    const c = document.createElement('canvas')
    c.width = img.naturalWidth; c.height = img.naturalHeight
    const ctx = c.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const d = ctx.getImageData(0, 0, c.width, c.height).data
    const lin = (v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4) }
    const lums = []
    let sum = 0
    for (let i = 0; i < d.length; i += 4) {
      const L = 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2])
      lums.push(L); sum += L
    }
    lums.sort((a, b) => a - b)
    return {
      pixels: lums.length,
      mean: sum / lums.length,
      p95: lums[Math.floor(lums.length * 0.95)],
      max: lums[lums.length - 1],
    }
  }, dataUrl)
}

/**
 * Find the speed control that is actually on screen at this preset.
 *
 * At Popout S the control is not in the strip at all: R2R-R JOB C moved Turbo,
 * AUTO and MAX into the mini-player menu so SPIN could keep its 44px target. So
 * the menu is opened first, and the menu item IS the control there.
 */
async function revealControl(page) {
  const visible = async () => page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-testid="hud-turbo"]')].find((e) => {
      if (e.closest('.warm-mount')) return false
      const r = e.getBoundingClientRect()
      return r.width > 1 && r.height > 1
    })
    return !!el
  })
  if (await visible()) return true
  const menu = page.locator('[data-testid="mini-menu"]')
  if (await menu.count() > 0) {
    await menu.evaluate((el) => el.click())
    await page.waitForTimeout(150)
  }
  return visible()
}

/** Box, rendered text and current tier of the on-screen speed control. */
async function probeControl(page) {
  return page.evaluate((margin) => {
    const el = [...document.querySelectorAll('[data-testid="hud-turbo"]')].find((e) => {
      if (e.closest('.warm-mount')) return false
      const r = e.getBoundingClientRect()
      return r.width > 1 && r.height > 1
    })
    if (!el) return null
    const r = el.getBoundingClientRect()
    return {
      tier: el.getAttribute('data-speed'),
      text: (el.textContent || '').trim(),
      title: el.getAttribute('title') || '',
      box: {
        x: Math.max(0, Math.floor(r.x - margin)),
        y: Math.max(0, Math.floor(r.y - margin)),
        width: Math.ceil(r.width + margin * 2),
        height: Math.ceil(r.height + margin * 2),
      },
    }
  }, GLOW_MARGIN)
}

async function clickControl(page) {
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-testid="hud-turbo"]')].find((e) => {
      if (e.closest('.warm-mount')) return false
      const r = e.getBoundingClientRect()
      return r.width > 1 && r.height > 1
    })
    if (el) el.click()
  })
}

/**
 * Stitch the three tier crops into one labelled side-by-side strip, in the
 * page's own canvas. The brief asks for the three speeds committed side by
 * side; three separate files are not side by side.
 */
async function composeStrip(page, buffers, labels, title) {
  const urls = buffers.map((b) => 'data:image/png;base64,' + b.toString('base64'))
  const dataUrl = await page.evaluate(async ([urls, labels, title]) => {
    const imgs = await Promise.all(urls.map((u) => new Promise((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u
    })))
    // Two label lines under each crop rather than one. The single line was
    // wider than the crop it labelled, so at Desktop the three captions ran
    // into each other and the strip could not be read: "ormal mean L 0.04"
    // against "urbo". A proof nobody can read is not a proof.
    const PAD = 14, HEAD = 26, FOOT = 38
    const CELL = Math.max(...imgs.map((i) => i.naturalWidth), 150)
    const GAP = 20
    const w = CELL * imgs.length + GAP * (imgs.length - 1) + PAD * 2
    const h = Math.max(...imgs.map((i) => i.naturalHeight)) + PAD * 2 + HEAD + FOOT
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    const x = c.getContext('2d')
    x.fillStyle = '#070a12'; x.fillRect(0, 0, w, h)
    x.fillStyle = '#8fd6ff'; x.font = '600 13px monospace'; x.textBaseline = 'top'
    x.fillText(title, PAD, 7)
    let cx = PAD
    const top = PAD + HEAD
    imgs.forEach((img, k) => {
      const centre = cx + CELL / 2
      x.drawImage(img, Math.round(centre - img.naturalWidth / 2), top)
      x.textAlign = 'center'
      x.fillStyle = '#ffffff'; x.font = '700 12px monospace'
      x.fillText(labels[k][0], centre, top + img.naturalHeight + 7)
      x.fillStyle = '#8fd6ff'; x.font = '400 11px monospace'
      x.fillText(labels[k][1], centre, top + img.naturalHeight + 22)
      x.textAlign = 'left'
      cx += CELL + GAP
    })
    return c.toDataURL('image/png')
  }, [urls, labels, title])
  return Buffer.from(dataUrl.split(',')[1], 'base64')
}

const SEEDS = {
  // Seed 1, the real shape of the defect this pass fixed: before FS VISUAL
  // FIXPACK the control lit on one boolean, so Turbo and Super Turbo were
  // styled identically. This flattens Super Turbo back down to Normal.
  flatten: `
    [data-testid="hud-turbo"][data-speed="super"] {
      filter: none !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12) !important;
      background: radial-gradient(circle at 36% 28%, #2a1a09, #090603 72%) !important;
    }
    [data-testid="hud-turbo"][data-speed="super"] .fs-face {
      background: radial-gradient(circle at 36% 28%, #2a1a09, #090603 72%) !important;
      box-shadow: inset 0 2px 3px rgba(255,255,255,.10), inset 0 -6px 12px rgba(0,0,0,.72) !important;
    }
    [data-testid="hud-turbo"][data-speed="super"] svg path {
      fill: rgba(255,178,100,.45) !important;
      stroke: rgba(255,200,150,0.55) !important;
    }
  `,
}

/** Seed 2 is markup, not CSS: the numeral coming back into the control. */
async function seedNumeral(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('[data-testid="hud-turbo"]')) {
      if (el.querySelector('.seeded-tier')) continue
      const s = document.createElement('span')
      s.className = 'seeded-tier'
      s.textContent = el.getAttribute('data-speed') === 'normal' ? '1×'
        : el.getAttribute('data-speed') === 'turbo' ? '2×' : '4×'
      s.style.fontSize = '8px'
      el.appendChild(s)
    }
  })
}

/**
 * Walk one preset through all three speeds, measuring each.
 *
 * The tier is driven by CLICKING the real control rather than by writing the
 * store, so the measurement exercises the shipped cycle including its
 * jurisdiction gating, and it verifies the tier actually changed rather than
 * counting clicks and hoping.
 */
async function measurePreset(browser, base, preset, opts = {}) {
  const { seedCss = null, seedNum = false, capture = false } = opts
  const ctx = await browser.newContext({ viewport: { width: preset.width, height: preset.height } })
  const page = await ctx.newPage()
  await routeWallet(page)
  await page.goto(`${base}/?sessionID=turbo-gate&rgs_url=${RGS_HOST}&lang=en`, { waitUntil: 'networkidle' })
  await dismissIntro(page)
  await page.waitForTimeout(300)

  if (seedCss) await page.addStyleTag({ content: seedCss })

  const found = await revealControl(page)
  if (!found) { await ctx.close(); return { error: 'speed control not reachable at this preset' } }

  const measures = []
  const buffers = []
  for (let i = 0; i < TIERS.length; i++) {
    if (i > 0) {
      await clickControl(page)
      await page.waitForTimeout(220)
      await revealControl(page)
    }
    if (seedNum) await seedNumeral(page)
    const probe = await probeControl(page)
    if (!probe) { await ctx.close(); return { error: `control vanished at tier index ${i}` } }
    const png = await page.screenshot({ clip: probe.box })
    const lum = await luminanceOf(page, png)
    measures.push({ ...probe, lum })
    buffers.push(png)
  }

  let strip = null
  if (capture) {
    strip = await composeStrip(
      page, buffers,
      measures.map((m) => [m.tier, `mean L ${m.lum.mean.toFixed(4)}`]),
      `${preset.name}  ${preset.width}x${preset.height}  speed control, three states`,
    )
  }
  await ctx.close()
  return { measures, strip }
}

function assess(preset, result) {
  const findings = []
  const rows = []
  if (result.error) {
    findings.push(`${preset.name}: ${result.error}`)
    return { findings, rows }
  }
  const m = result.measures

  // 1. The cycle actually visited three distinct tiers.
  const tiers = m.map((x) => x.tier)
  if (new Set(tiers).size !== 3) {
    findings.push(`${preset.name}: the control did not cycle through three distinct speeds (saw ${tiers.join(', ')})`)
  }

  // 2. THE NUMERAL IS GONE, at every tier.
  for (const x of m) {
    if (/[0-9]/.test(x.text) || /[x×]/i.test(x.text.replace(/[^\dx×]/gi, ''))) {
      findings.push(`${preset.name} / ${x.tier}: the control renders a numeral ("${x.text}"). The ruling is the bolt alone.`)
    }
  }

  // 3. MONOTONIC. Brighter must mean faster, at every step.
  for (let i = 1; i < m.length; i++) {
    if (!(m[i].lum.mean > m[i - 1].lum.mean)) {
      findings.push(
        `${preset.name}: ${m[i - 1].tier} to ${m[i].tier} does not get brighter `
        + `(mean L ${m[i - 1].lum.mean.toFixed(5)} then ${m[i].lum.mean.toFixed(5)})`,
      )
    }
  }

  // 4. THE STEP IS BIG ENOUGH TO SEE.
  for (let i = 1; i < m.length; i++) {
    const r = ratio(m[i].lum.mean, m[i - 1].lum.mean)
    rows.push({
      preset: preset.name, size: `${preset.width}x${preset.height}`,
      from: m[i - 1].tier, to: m[i].tier,
      meanFrom: +m[i - 1].lum.mean.toFixed(6), meanTo: +m[i].lum.mean.toFixed(6),
      p95From: +m[i - 1].lum.p95.toFixed(6), p95To: +m[i].lum.p95.toFixed(6),
      stepRatio: +r.toFixed(4), minRequired: MIN_STEP, pixels: m[i].lum.pixels,
    })
    if (r < MIN_STEP) {
      findings.push(
        `${preset.name}: the ${m[i - 1].tier} to ${m[i].tier} step is ${r.toFixed(3)}:1, `
        + `under the ${MIN_STEP}:1 floor, so the two states are not distinguishable at a glance`,
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
    console.log('TURBO INTENSITY GATE SELF-TEST: planting the two real defects\n')
    const preset = PRESETS[0]
    let ok = true

    const flat = await measurePreset(browser, BASE, preset, { seedCss: SEEDS.flatten })
    const flatFindings = assess(preset, flat).findings
    console.log(`  seed 1, Super Turbo flattened to look like Normal -> ${flatFindings.length ? 'RED (correct)' : 'GREEN (WRONG)'}`)
    for (const f of flatFindings) console.log(`      ${f}`)
    if (!flatFindings.length) ok = false

    const num = await measurePreset(browser, BASE, preset, { seedNum: true })
    const numFindings = assess(preset, num).findings.filter((f) => /numeral/.test(f))
    console.log(`  seed 2, the numeral put back on the control    -> ${numFindings.length ? 'RED (correct)' : 'GREEN (WRONG)'}`)
    for (const f of numFindings) console.log(`      ${f}`)
    if (!numFindings.length) ok = false

    const control = await measurePreset(browser, BASE, preset)
    const controlFindings = assess(preset, control).findings
    console.log(`  control, nothing seeded                        -> ${controlFindings.length ? 'RED (WRONG)' : 'GREEN (correct)'}`)
    for (const f of controlFindings) console.log(`      ${f}`)
    if (controlFindings.length) ok = false

    console.log('')
    if (ok) console.log('TURBO INTENSITY GATE SELF-TEST: PASS (both seeded defects caught, control clean)')
    else { console.error('TURBO INTENSITY GATE SELF-TEST: FAIL'); exitCode = 1 }
  } else {
    const failures = []
    const allRows = []
    const strips = []
    for (const preset of PRESETS) {
      const capture = CAPTURE && PROOF_PRESETS.has(preset.name)
      const result = await measurePreset(browser, BASE, preset, { capture })
      const { findings, rows } = assess(preset, result)
      failures.push(...findings)
      allRows.push(...rows)
      if (result.strip) {
        const name = `turbo-three-states-${preset.name.toLowerCase().replace(/\s+/g, '-')}.png`
        writeFileSync(join(SHOTS, name), result.strip)
        strips.push(name)
      }
      const steps = rows.map((r) => `${r.from[0]}${r.to[0]}=${r.stepRatio.toFixed(2)}`).join(' ')
      console.log(
        `  ${preset.name.padEnd(9)} ${(preset.width + 'x' + preset.height).padEnd(9)} `
        + `steps ${steps.padEnd(22)} ${findings.length ? 'FINDINGS' : 'ok'}`,
      )
    }

    writeFileSync(join(QA, 'turbo_intensity_gate_2026-07-27.json'), JSON.stringify({
      metric: 'WCAG relative luminance, mean over the control box plus a 16px glow margin',
      min_step_ratio: MIN_STEP, glow_margin_px: GLOW_MARGIN,
      rows: allRows, strips, failures,
    }, null, 2))

    const worst = allRows.reduce((a, r) => Math.min(a, r.stepRatio), Infinity)
    console.log(`\nTURBO INTENSITY GATE: ${PRESETS.length} presets x ${TIERS.length} speeds, `
      + `worst adjacent step ${Number.isFinite(worst) ? worst.toFixed(3) : 'n/a'}:1 against a ${MIN_STEP}:1 floor`)
    if (failures.length) {
      console.error(`\nFAIL, ${failures.length} finding(s):`)
      for (const f of failures) console.error(`  ${f}`)
      exitCode = 1
    } else {
      console.log('TURBO INTENSITY GATE: PASS (bolt only, no numeral, and every adjacent '
        + 'speed step is monotonic and measurably visible at all seven presets)')
    }
  }
} finally {
  await browser.close()
  killPreview(preview)
}

process.exit(exitCode)
