// contrast_gate.mjs, JOB 3(g) / TR-070 (2026-07-26).
//
// The mobile-portrait FEATURES bar renders its label over the game's background
// art, and in the owner's capture 23 the text is legible but weak. The row was
// deliberately NOT fixed blind, because JOB 3(b) re-derived the layout and
// changed what sits behind that bar: "re-measure after (b) and only then decide
// whether a scrim is needed". This is that measurement, kept as a gate.
//
// WHY IT MEASURES COMPOSITED PIXELS RATHER THAN CSS
// -------------------------------------------------
// Reading the two CSS colours and computing a ratio would be measuring the
// wrong thing. The bar's plate is
//
//   linear-gradient(160deg, rgba(255,46,196,0.1), rgba(6,9,20,0.9))
//
// so at its start the plate is NINETY PERCENT TRANSPARENT and the real backdrop
// behind the label is whatever the background art happens to be at that point.
// The contrast a player experiences is against the composited result, which no
// stylesheet states and only a screenshot knows.
//
// So the method is:
//
//   1. read the label's own computed colour, which is opaque text and therefore
//      genuinely is what it says it is;
//   2. hide the label's glyphs (visibility:hidden, which keeps layout and so
//      keeps the backdrop identical) and screenshot exactly its box;
//   3. decode that PNG back INSIDE the browser via a canvas, which needs no
//      image library at all, and read every pixel;
//   4. report the ratio against the WORST pixel, not the average.
//
// The worst pixel is the point. The label is light, so the pixel that hurts is
// the LIGHTEST one behind it, and an average would let a small bright highlight
// hide inside a mostly dark region. A player does not read the average.
//
// THE BAR. WCAG 2.1 AA is 4.5:1 for normal text and 3:1 for large text. The
// label is 12px at weight 800, which is well under the 18.66px bold threshold
// for "large", so 4.5:1 is the applicable figure and is what is asserted.
//
// Run (from frontend/, after `npm run build`): node scripts/contrast_gate.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const QA = join(ROOT, '..', 'reports', 'qa')
const SHOTS = join(ROOT, '..', 'reports', 'screens', 'contrast-2026-07-26')
mkdirSync(QA, { recursive: true })
mkdirSync(SHOTS, { recursive: true })

/** WCAG 2.1 AA for normal-size text. The label is 12px, so this is the figure. */
const AA_NORMAL = 4.5

// Portrait presets from the platform's own Screen menu, the ones where the
// FEATURES bar renders as a full-width plate over the art.
const PRESETS = [
  { name: 'Mobile L', width: 425, height: 812 },
  { name: 'Mobile M', width: 375, height: 667 },
  { name: 'Mobile S', width: 320, height: 568 },
  { name: 'Portrait', width: 390, height: 844 },
]

// Every player-visible text node on the portrait FEATURES bar. The label is the
// row's subject, but a gate that measured only the subject would say nothing
// about the mode chip sitting beside it, which is smaller still.
const TARGETS = [
  ['features label', '.p-fm-entry-label'],
  ['active mode chip', '.p-fm-entry-active'],
]

const RGS_HOST = 'rgs.contrast-gate.invalid'
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
const LAUNCH = (base) => `${base}/?sessionID=contrast-gate&rgs_url=${RGS_HOST}&lang=en`

async function getFreePort() {
  return new Promise((res, rej) => {
    const srv = createServer(); srv.on('error', rej)
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => res(port)) })
  })
}
function startPreview(port) {
  return new Promise((res, rej) => {
    const proc = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'],
      { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] })
    let done = false
    const onData = (d) => {
      const s = d.toString()
      if (!done && (/Local/.test(s) || /localhost:\d+/.test(s))) { done = true; res(proc) }
    }
    proc.stdout.on('data', onData); proc.stderr.on('data', onData); proc.on('error', rej)
    setTimeout(() => { if (!done) rej(new Error('vite preview did not start in time')) }, 20000)
  })
}

// ── WCAG 2.1 relative luminance and contrast ratio ───────────────────────────
// Transcribed from the specification rather than remembered: the 0.03928
// threshold and the 2.4 exponent are the two values most often written wrong.
const channel = (v) => {
  const c = v / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}
const luminance = (r, g, b) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
const ratio = (l1, l2) => {
  const hi = Math.max(l1, l2), lo = Math.min(l1, l2)
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * Decode a PNG buffer to pixels using the browser's own canvas.
 *
 * No image library, and no shelling out to a converter. The page is already
 * open and already has a decoder in it.
 */
async function pixelsOf(page, pngBuffer) {
  const dataUrl = 'data:image/png;base64,' + pngBuffer.toString('base64')
  return page.evaluate(async (url) => {
    const img = new Image()
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url })
    const c = document.createElement('canvas')
    c.width = img.naturalWidth; c.height = img.naturalHeight
    const ctx = c.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const d = ctx.getImageData(0, 0, c.width, c.height).data
    return { w: c.width, h: c.height, data: Array.from(d) }
  }, dataUrl)
}

const failures = []
const check = (name, cond, detail = '') => {
  if (!cond) failures.push({ name, detail })
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond || !detail ? '' : `  ${detail}`}`)
}

/** Measure one target's worst-case contrast against its real backdrop. */
async function measure(page, selector) {
  const box = await page.evaluate((sel) => {
    const el = [...document.querySelectorAll(sel)].find((e) => !e.closest('.warm-mount'))
    if (!el) return null
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) return null
    const cs = getComputedStyle(el)
    return {
      x: Math.floor(r.x), y: Math.floor(r.y),
      w: Math.ceil(r.width), h: Math.ceil(r.height),
      color: cs.color, fontSize: parseFloat(cs.fontSize), fontWeight: cs.fontWeight,
    }
  }, selector)
  if (!box) return null

  // The text's own colour, NORMALISED BY THE BROWSER rather than parsed here.
  //
  // The first version of this gate scraped numbers out of the computed value
  // with /[\d.]+/g and reported every preset failing at about 1.17:1 against a
  // near-black backdrop, which is the opposite of possible for light text. The
  // measurement was broken, not the build. `.p-fm-entry`'s colour is a
  // `color-mix()`, so the computed value comes back as CSS Color 4
  // `color(srgb 1 0.795098 0.942157)`, whose channels are 0 to 1. Read as 0 to
  // 255 they are almost black.
  //
  // Convention (l.2): a measurement that disagrees with the specification is a
  // broken measurement until proven otherwise. Rather than add a second syntax
  // to the parser and wait for the third, the browser paints the colour into a
  // canvas and hands back the sRGB bytes, which is correct for every colour
  // syntax that exists or will exist.
  const rgb = await page.evaluate((css) => {
    const c = document.createElement('canvas')
    c.width = c.height = 1
    const ctx = c.getContext('2d')
    ctx.fillStyle = css
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    return [d[0], d[1], d[2]]
  }, box.color)
  const textL = luminance(rgb[0], rgb[1], rgb[2])

  // Hide the GLYPHS but keep the box, so the backdrop under it is unchanged.
  // `display:none` would reflow the row and measure a different backdrop.
  await page.evaluate((sel) => {
    const el = [...document.querySelectorAll(sel)].find((e) => !e.closest('.warm-mount'))
    if (el) el.style.visibility = 'hidden'
  }, selector)
  await page.waitForTimeout(200)
  const png = await page.screenshot({ clip: { x: box.x, y: box.y, width: box.w, height: box.h } })
  await page.evaluate((sel) => {
    const el = [...document.querySelectorAll(sel)].find((e) => !e.closest('.warm-mount'))
    if (el) el.style.visibility = ''
  }, selector)

  const { w, h, data } = await pixelsOf(page, png)
  let worst = Infinity, worstPx = null, sum = 0, n = 0
  for (let i = 0; i < data.length; i += 4) {
    const l = luminance(data[i], data[i + 1], data[i + 2])
    const r = ratio(textL, l)
    sum += r; n += 1
    if (r < worst) { worst = r; worstPx = [data[i], data[i + 1], data[i + 2]] }
  }
  return {
    textColor: box.color, textRgb: rgb, fontSize: box.fontSize, fontWeight: box.fontWeight,
    samples: n, region: { w, h },
    worstRatio: +worst.toFixed(3), meanRatio: +(sum / n).toFixed(3), worstPixel: worstPx,
  }
}

async function run() {
  if (!existsSync(join(ROOT, 'dist', 'index.html'))) {
    console.error('dist/ is absent. Run `npm run build` first.')
    process.exit(2)
  }
  const port = await getFreePort()
  const preview = await startPreview(port)
  const base = `http://localhost:${port}`
  const results = { standard: 'WCAG 2.1 AA, 4.5:1 for normal-size text', threshold: AA_NORMAL, presets: {} }

  try {
    const browser = await chromium.launch()
    for (const p of PRESETS) {
      const page = await browser.newPage({ viewport: { width: p.width, height: p.height } })
      await routeWallet(page)
      await page.goto(LAUNCH(base), { waitUntil: 'domcontentloaded' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 30000 })
      await dismissIntro(page)
      await page.waitForTimeout(900)

      // BRING THE MODE CHIP ON SCREEN BEFORE MEASURING IT.
      //
      // The chip only renders when a non-default standing mode is selected, so
      // a first run reported "not rendered at this preset" for all four presets
      // and the target measured nothing at all. An assertion that silently has
      // no subject is the inert-check failure this project already recorded
      // once, when the paytable content assertions were green while matching a
      // different dialog. So the mode is selected the way a player selects it,
      // by opening the menu and clicking CRUISE, and if the chip is still
      // absent afterwards that is reported rather than skipped.
      try {
        await page.locator('[data-testid="feature-menu-button"]').first().click({ timeout: 5000 })
        await page.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 8000 })
        await page.waitForTimeout(300)
        await page.locator('[data-testid="standing-select-cruise"]').first().click({ timeout: 5000 })
        await page.waitForTimeout(400)
        await page.keyboard.press('Escape')
        await page.waitForTimeout(600)
      } catch {
        /* recorded by the chip's own present:false below */
      }

      results.presets[p.name] = {}
      console.log(`\n${p.name} ${p.width}x${p.height}`)
      for (const [label, sel] of TARGETS) {
        const m = await measure(page, sel)
        if (!m) {
          // Absent is not a pass and not a failure: the mode chip only renders
          // when a non-default mode is standing. Recorded so a silently missing
          // target cannot read as a green measurement.
          results.presets[p.name][label] = { present: false }
          console.log(`  ---  ${label}: not rendered at this preset`)
          continue
        }
        results.presets[p.name][label] = { present: true, ...m }
        check(`${p.name}: ${label} meets ${AA_NORMAL}:1 against its real backdrop`,
          m.worstRatio >= AA_NORMAL,
          `worst ${m.worstRatio}:1 (mean ${m.meanRatio}:1) text rgb(${m.textRgb}) vs rgb(${m.worstPixel})`)
      }
      await page.screenshot({ path: join(SHOTS, `${p.name.replace(/\s+/g, '-').toLowerCase()}.png`) })
      await page.close()
    }

    // ── SEEDED VIOLATION, convention (p) ────────────────────────────────────
    //
    // This gate claims the low-contrast class is closed, so it has to be seen
    // to fail. The seed is the real form: the label's colour is pushed toward
    // its backdrop, exactly what a future palette change would do, and the
    // measurement must go red on it. A seed that painted the label bright
    // magenta on black would prove only that the arithmetic runs.
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await routeWallet(page)
    await page.goto(LAUNCH(base), { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 30000 })
    await dismissIntro(page)
    await page.waitForTimeout(900)

    const before = await measure(page, '.p-fm-entry-label')
    await page.evaluate(() => {
      const el = [...document.querySelectorAll('.p-fm-entry-label')].find((e) => !e.closest('.warm-mount'))
      // A dim colour close to the dark plate behind it. This is the defect in
      // the form it really occurs: a palette choice that reads as "on brand"
      // and is unreadable.
      if (el) el.style.color = 'rgb(60, 22, 48)'
    })
    await page.waitForTimeout(200)
    const seeded = await measure(page, '.p-fm-entry-label')
    await page.screenshot({ path: join(SHOTS, 'seeded-low-contrast.png') })
    await page.close()

    results.seeded = { before: before?.worstRatio ?? null, afterSeed: seeded?.worstRatio ?? null }
    console.log('\nseeded violation')
    check('the gate goes RED on a seeded low-contrast label',
      seeded !== null && seeded.worstRatio < AA_NORMAL,
      `seeded worst ${seeded?.worstRatio}:1, which must be under ${AA_NORMAL}`)
    check('negative control: the real label passes on the same run',
      before !== null && before.worstRatio >= AA_NORMAL,
      `real worst ${before?.worstRatio}:1`)

    await browser.close()
  } finally { preview.kill() }

  results.failures = failures
  results.pass = failures.length === 0
  writeFileSync(join(QA, 'contrast_2026-07-26.json'), JSON.stringify(results, null, 2))
  if (failures.length) {
    console.error(`\nCONTRAST: FAIL (${failures.length})`)
    for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
    process.exit(1)
  }
  console.log('\nCONTRAST: PASS')
}

run().catch((e) => { console.error(e); process.exit(1) })
