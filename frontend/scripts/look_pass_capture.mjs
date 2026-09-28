#!/usr/bin/env node
//
// look_pass_capture.mjs: the R151 look-pass harness (brief workstream 4).
//
// WHAT IT CAPTURES. The PRODUCTION build (dist/, or DIST=<dir>) at 1280x800 and 390x844, three
// states each: idle (3 s after the splash and rules card are dismissed), a real 16.2x win at the
// banner's peak (base/bigWin, a win of 10x or more), and the feature entry gate (base/feature, a
// natural trigger). Rounds are REAL committed book rounds from
// src/lib/services/__fixtures__/replay_rounds.json, served at the wallet boundary exactly as
// polish_review_capture.mjs does; no DEV hook exists in this build and none is used.
//
// NO PLACEHOLDER ART. A shot is refused, and the run fails red, if at the moment of capture any
// visible <img> has not decoded (complete and naturalWidth > 0), any request has returned 404, or
// the lockup has fallen back to its text. The version string the build prints is recorded: the
// game shows it only as its console boot line ("Future Spinner <version> build <sha>"), nothing on
// screen renders it.
//
// WHERE IT WRITES. Scratch by default (convention (h.1)); pass --out <dir> to write a committed
// evidence directory, which only a job regenerating evidence should do. It also writes
// captures.json (every shot, its viewport, state, fixture and the version line).
//
// THE CONTINUE GATE. The entry gate's TAP TO CONTINUE pulses forever, so Playwright's
// locator.click waits for a stability it never reaches (R151 inventory F11). This harness never
// clicks it; it photographs the gate itself.
//
// USAGE (from frontend/)   node scripts/look_pass_capture.mjs [--out ../reports/screens/<name>]
//
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { dismissIntro, waitSpinDone } from './lib/dismissOverlays.mjs'
import { startStaticServer } from './lib/previewServer.mjs'
import { qaTmpDir } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = process.env.DIST ? resolve(process.env.DIST) : join(ROOT, 'dist')
const outArg = process.argv.indexOf('--out')
const OUT = outArg > 0 ? resolve(process.argv[outArg + 1]) : qaTmpDir('screens', 'look-pass')
mkdirSync(OUT, { recursive: true })

const HARD_TIMEOUT_MS = 6 * 60_000
setTimeout(() => { console.error('LOOK PASS: HARD TIMEOUT, failing red'); process.exit(1) }, HARD_TIMEOUT_MS).unref()

const VIEWPORTS = [
  { slug: 'desktop-1280', width: 1280, height: 800 },
  { slug: 'phone-390', width: 390, height: 844 },
]
const RGS_HOST = 'rgs.look-pass.invalid'
const START_MICROS = 50_000_000_000
const FIXTURES = JSON.parse(readFileSync(join(ROOT, 'src/lib/services/__fixtures__/replay_rounds.json'), 'utf-8'))
const MODE_COST = { base: 1, cruise: 1, antelite: 1.25, bonus: 100, super: 400 }

async function routeWallet(page, state) {
  await page.route(`**://${RGS_HOST}/**`, async (route) => {
    const req = route.request()
    const url = req.url()
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) })
    if (url.includes('/wallet/authenticate')) {
      return json({
        balance: { amount: START_MICROS, currency: 'USD' },
        config: {
          minBet: 100_000, maxBet: 100_000_000, stepBet: 100_000, defaultBetLevel: 1_000_000,
          betLevels: [100_000, 500_000, 1_000_000, 2_000_000],
          jurisdiction: {
            socialCasino: false, disabledFullscreen: false, disabledTurbo: false, disabledSuperTurbo: false,
            disabledAutoplay: false, disabledSlamstop: false, disabledSpacebar: false, disabledBuyFeature: false,
            displayNetPosition: false, displayRTP: false, displaySessionTimer: false, minimumRoundDuration: 0,
          },
        },
        round: null,
      })
    }
    if (url.includes('/wallet/play')) {
      let mode = 'base'
      try { mode = req.postDataJSON()?.mode ?? 'base' } catch { /* no body */ }
      if (!MODE_COST[mode]) mode = 'base'
      const round = (FIXTURES[mode] || FIXTURES.base)[state.next] || FIXTURES.base.win
      state.bets += 1
      const bet = 1_000_000
      return json({
        balance: { amount: START_MICROS - state.bets * Math.round(bet * MODE_COST[mode]), currency: 'USD' },
        round: {
          betID: 700_000 + state.bets, active: true, mode, amount: bet,
          payout: Math.round((bet * (round.payoutMultiplier ?? 0)) / 100),
          payoutMultiplier: (round.payoutMultiplier ?? 0) / 100,
          state: { events: round.events },
        },
      })
    }
    if (url.includes('/wallet/end-round')) return json({ balance: { amount: START_MICROS, currency: 'USD' } })
    return json({})
  })
}

async function clickVisible(page, selector) {
  const loc = page.locator(selector)
  const n = await loc.count()
  for (let i = 0; i < n; i++) {
    const el = loc.nth(i)
    if (await el.isVisible().catch(() => false)) {
      const box = await el.boundingBox()
      if (box) { await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); return true }
    }
  }
  return false
}

async function placeholderCheck(page, notFound) {
  const imgs = await page.evaluate(() => {
    const bad = []
    for (const img of document.querySelectorAll('img')) {
      const r = img.getBoundingClientRect()
      const cs = getComputedStyle(img)
      const visible = r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'
      if (visible && img.getAttribute('src') && (!img.complete || img.naturalWidth === 0)) bad.push(img.getAttribute('src'))
    }
    const logoTxt = document.getElementById('theme-logo-txt')
    const logoFallback = !!logoTxt && getComputedStyle(logoTxt).display !== 'none'
    const portraitFallback = !!document.querySelector('.portrait-wordmark-text')
    return { bad, logoFallback, portraitFallback }
  })
  const reasons = []
  if (imgs.bad.length) reasons.push(`undecoded images: ${imgs.bad.join(', ')}`)
  if (imgs.logoFallback || imgs.portraitFallback) reasons.push('lockup fell back to text')
  if (notFound.length) reasons.push(`404s: ${notFound.join(', ')}`)
  return reasons
}

const shots = []
const failures = []
let version = null

async function shoot(page, vp, state, fixture, notFound, note) {
  const reasons = await placeholderCheck(page, notFound)
  if (reasons.length) { failures.push({ viewport: vp.slug, state, reasons }); console.error(`  REFUSED ${vp.slug} ${state}: ${reasons.join('; ')}`); return }
  const file = `${vp.slug}_${state}.png`
  await page.screenshot({ path: join(OUT, file), fullPage: false })
  shots.push({ file, viewport: `${vp.width}x${vp.height}`, state, fixture, note })
  console.log(`  ${file}`)
}

async function captureViewport(browser, base, vp) {
  console.log(`\n${vp.slug}`)
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await ctx.newPage()
  const notFound = []
  const pageErrors = []
  page.on('response', (r) => { if (r.status() === 404) notFound.push(r.url().replace(base, '')) })
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('console', (m) => { const t = m.text(); if (t.startsWith('Future Spinner ')) version = t })
  const state = { next: 'loss', bets: 0 }
  await routeWallet(page, state)
  await page.goto(`${base}/?sessionID=look-pass&rgs_url=${RGS_HOST}&lang=en`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2400)
  await dismissIntro(page).catch(() => {})
  await page.waitForTimeout(3000)
  await shoot(page, vp, 'idle', 'none (the pre-spin display board)', notFound, 'At rest, 3 s after the rules card')

  state.next = 'bigWin'
  if (!(await clickVisible(page, '[data-testid="spin-button"]'))) failures.push({ viewport: vp.slug, state: 'win', reasons: ['no visible SPIN'] })
  const banner = page.locator('[data-testid="win-banner"]')
  await banner.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => failures.push({ viewport: vp.slug, state: 'win', reasons: ['banner never showed'] }))
  await page.waitForTimeout(1300)
  await shoot(page, vp, 'win_16x', 'base/bigWin, 16.2x', notFound, 'Win banner (BIG tier) at its peak')
  await banner.first().waitFor({ state: 'detached', timeout: 12000 }).catch(() => {})
  await waitSpinDone(page).catch(() => {})
  await page.waitForTimeout(800)

  state.next = 'feature'
  await clickVisible(page, '[data-testid="spin-button"]')
  const gate = page.locator('[data-testid="entry-continue"]')
  await gate.first().waitFor({ state: 'visible', timeout: 25000 }).catch(() => failures.push({ viewport: vp.slug, state: 'feature_entry', reasons: ['entry gate never showed'] }))
  await page.waitForTimeout(700)
  await shoot(page, vp, 'feature_entry', 'base/feature, natural trigger', notFound, 'Overdrive entry gate')
  if (pageErrors.length) failures.push({ viewport: vp.slug, state: 'page', reasons: pageErrors })
  await ctx.close()
}

const server = await startStaticServer(DIST)
const base = `http://127.0.0.1:${server.port}`
const browser = await chromium.launch()
try {
  for (const vp of VIEWPORTS) await captureViewport(browser, base, vp)
} finally {
  await browser.close()
  await server.close()
}
writeFileSync(join(OUT, 'captures.json'), JSON.stringify({ dist: DIST, version, shots, failures }, null, 2))
console.log(`\nversion line: ${version}`)
if (failures.length || !version) {
  console.error(`LOOK PASS: FAIL (${failures.length} refusal(s)${version ? '' : ', no version line'})`)
  process.exitCode = 1
} else {
  console.log(`LOOK PASS: ${shots.length} shots, no placeholder art, written to ${OUT}`)
}
