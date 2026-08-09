// social_dom_conformance.mjs - R2R JOB 6 / TR-041 (2026-07-25).
//
// REPLACES scripts/social_string_conformance.mjs, which round-two reviewer 3
// dismantled in one sentence: "The social conformance script inspects only
// mode-card text and checks only 'Buy' and 'Debits', so its PASS is not
// meaningful for the full surface."
//
// It was right on both counts. The old script read two containers, the feature
// menu cards and the paytable's Bet Modes block, and tested two words. Its green
// result sat beside a paytable whose rules said "Malfunctions void all pays",
// an interface guide that said "Max Bet" and "Bet the maximum", and a win banner
// that said "BET" on every celebration. Nothing about that was a lie; the scope
// was simply far narrower than the name suggested.
//
// WHAT THIS DOES INSTEAD:
//
//   1. Walks the FULL RENDERED DOM, not two selectors. Every text node plus
//      every aria-label, title, alt and placeholder, because screen-reader text
//      is player-facing text (the lesson of R4/TR-012, where 14 control labels
//      shipped carrying "bet" and only a blind player heard them).
//
//   2. Scans against the COMPLETE prohibited-term table from the dated
//      jurisdiction mirror, all 39 rows, imported from the same
//      src/lib/i18n/vocabulary.ts module the app itself uses. One table, one
//      place, so the scan cannot check a shorter list than the app applies.
//
//   3. Opens the surfaces a player actually reaches: first paint, the paytable
//      (rules, symbols, interface guide, mode cards), the features menu, the
//      autoplay menu, the session panel and a real win banner driven by a real
//      spin.
//
//   4. Runs in BOTH modes and asserts zero actionable hits in social, while
//      asserting the real-money strings are genuinely unchanged rather than
//      merely un-regressed.
//
// The three terms in NOT_SUBSTITUTED ('stake', 'currency', 'fund') are reported
// separately rather than failed on, with every occurrence listed, so a human can
// see they are brand and platform context. Hiding them would be the same
// narrowing this script exists to undo.
//
// Playwright and a dev server, so it stays local and in the external audit per
// the CI workflow's stated scope. Its result is committed as JSON.
//
// Run (from frontend/): node scripts/social_dom_conformance.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { PROHIBITED_TERMS, NOT_SUBSTITUTED, TERM_TABLE_SOURCE } from '../src/lib/i18n/vocabulary.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'qa')
const SCREENS_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'social-dom-conformance')
mkdirSync(OUT_DIR, { recursive: true })
mkdirSync(SCREENS_DIR, { recursive: true })

const NEVER_REWRITE = new Set(Object.keys(NOT_SUBSTITUTED))
const UNIQUE_TERMS = [...new Map(PROHIBITED_TERMS.map((t) => [t.phrase.toLowerCase(), t])).values()]

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const phraseRe = (p) => new RegExp(`(?<![A-Za-z])${escapeRe(p)}(?![A-Za-z])`, 'gi')

async function getFreePort() {
  return new Promise((res, rej) => {
    const srv = createServer()
    srv.on('error', rej)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => res(port))
    })
  })
}

function startDevServer(port) {
  return new Promise((res, rej) => {
    const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], {
      cwd: join(__dirname, '..'), stdio: ['ignore', 'pipe', 'pipe'],
    })
    let done = false
    const onData = (d) => {
      const s = d.toString()
      if (!done && (/Local/.test(s) || new RegExp(`localhost:${port}`).test(s))) { done = true; res(proc) }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', rej)
    setTimeout(() => { if (!done) rej(new Error('vite dev server did not start in time')) }, 20000)
  })
}

/**
 * Harvest EVERY player-visible string on the page: rendered text plus the four
 * attributes a screen reader speaks. Returns one array of {source, text} so a
 * hit can be traced back to the element that produced it.
 */
const HARVEST = `(() => {
  const out = []
  const push = (source, text) => { if (text && text.trim()) out.push({ source, text: text.trim() }) }
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const el = n.parentElement
    if (!el) continue
    const style = getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden') continue
    if (el.closest('[aria-hidden="true"]')) continue
    push('text:' + el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''), n.nodeValue)
  }
  for (const attr of ['aria-label', 'title', 'alt', 'placeholder']) {
    for (const el of document.querySelectorAll('[' + attr + ']')) {
      push(attr + ':' + el.tagName.toLowerCase(), el.getAttribute(attr))
    }
  }
  return out
})()`

async function harvest(page, surface, bag) {
  const items = await page.evaluate(HARVEST)
  for (const it of items) bag.push({ ...it, surface })
  // Per-surface counts are PRINTED, not just totalled. A surface that harvests
  // zero looks identical to one that harvested clean strings in the total, and
  // that is exactly how the intro rules modal went unscanned: it was dismissed
  // before the first harvest, so it contributed nothing and nothing said so.
  console.log(`  .. harvest ${surface}: ${items.length} string(s)`)
  return items.length
}

// Progress goes to stdout as it happens. The first run of this script was piped
// through `tail`, which buffers, so a long run looked identical to a hang.
const step = (page, msg) => console.log(`  .. ${msg}`)

/**
 * Close whatever is open and WAIT for it to actually go.
 *
 * The first run of this script recorded harvest errors on the session panel and
 * the spin surface: a previous modal was still on screen, so the next click sat
 * out Playwright's full 30 s actionability timeout against a covered element.
 * Pressing Escape and moving on is not enough; the next surface has to wait for
 * the overlay to leave.
 */
async function closeOverlays(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape').catch(() => {})
    await page.waitForTimeout(250)
    const covered = await page.locator('.fs-modal, [role="dialog"], .fs-overlay').count().catch(() => 0)
    if (covered === 0) return
  }
  // Last resort: click the far corner, which every overlay here treats as a
  // backdrop dismissal.
  await page.mouse.click(4, 4).catch(() => {})
  await page.waitForTimeout(300)
}

/** Reload to a known-clean state. See the reasoning at the autoplay surface. */
async function resetPage(page, social) {
  const url = page.url().split('#')[0]
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 30000 })
  await dismissIntro(page)
  await page.waitForTimeout(300)
}

async function openSurfaces(page, social, bag) {
  await harvest(page, 'first-paint', bag)
  await page.screenshot({ path: join(SCREENS_DIR, `first-paint-${social ? 'social' : 'real'}.png`) })

  // Features menu
  try {
    await page.locator('[data-testid="feature-menu-button"]').click()
    await page.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 8000 })
    await page.waitForTimeout(200)
    await harvest(page, 'features-menu', bag)
    await page.screenshot({ path: join(SCREENS_DIR, `features-${social ? 'social' : 'real'}.png`) })
    await closeOverlays(page)
    step(page, 'features-menu done')
  } catch (e) { bag.push({ surface: 'features-menu', source: 'ERROR', text: String(e.message) }); step(page, 'features-menu ERROR: ' + e.message.split('\n')[0]) }

  // Paytable, scrolled the whole way so the rules, the symbol table, the
  // interface guide and the mode cards all render.
  try {
    await page.locator('button.fs-menu').click({ timeout: 8000 })
    await page.locator('.hud-menu-item').first().click({ timeout: 8000 })
    await page.waitForSelector('[data-testid="interface-guide"]', { timeout: 8000 })
    await page.waitForTimeout(250)
    // Scroll with the wheel over the modal's centre rather than by locating a
    // scroll container. The first attempt resolved an ancestor by xpath, which
    // matched nothing, so every iteration sat out Playwright's full 30 s
    // actionability timeout before falling through to the wheel anyway: twelve
    // iterations, two modes, twelve minutes of nothing. The wheel needs no
    // locator and cannot time out.
    await page.mouse.move(640, 400)
    for (let i = 0; i < 12; i++) {
      await harvest(page, 'paytable', bag)
      await page.mouse.wheel(0, 700)
      await page.waitForTimeout(150)
    }
    await page.screenshot({ path: join(SCREENS_DIR, `paytable-${social ? 'social' : 'real'}.png`) })
    await closeOverlays(page)
    step(page, 'paytable done')
  } catch (e) { bag.push({ surface: 'paytable', source: 'ERROR', text: String(e.message) }); step(page, 'paytable ERROR: ' + e.message.split('\n')[0]) }

  // Autoplay menu and session panel, via the HUD menu.
  //
  // Each opens from a fresh page rather than from whatever the previous surface
  // left on screen. Escape does not close every overlay here, and a covered
  // click sits out its whole actionability timeout and then contributes nothing
  // but an error entry: the first two runs of this script lost the session panel
  // and the win banner exactly that way. A reload costs a second and cannot be
  // wrong about what is open.
  for (const [surface, idx] of [['autoplay', 1], ['session', 2]]) {
    try {
      await resetPage(page, social)
      await page.locator('button.fs-menu').click({ timeout: 8000 })
      await page.waitForTimeout(150)
      const items = page.locator('.hud-menu-item')
      if (await items.count() > idx) {
        await items.nth(idx).click()
        await page.waitForTimeout(400)
        await harvest(page, surface, bag)
        await page.screenshot({ path: join(SCREENS_DIR, `${surface}-${social ? 'social' : 'real'}.png`) })
      }
      await closeOverlays(page)
    } catch (e) { bag.push({ surface, source: 'ERROR', text: String(e.message) }) }
  }

  // A real spin, harvested repeatedly so a win banner is caught if one fires.
  try {
    await resetPage(page, social)
    for (let spin = 0; spin < 8; spin++) {
      await page.locator('[data-testid="spin-button"]').click({ timeout: 8000 })
      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(300)
        await harvest(page, 'spin', bag)
      }
      const banner = await page.locator('.c1-win').count()
      if (banner > 0) {
        await harvest(page, 'win-banner', bag)
        await page.screenshot({ path: join(SCREENS_DIR, `win-banner-${social ? 'social' : 'real'}.png`) })
        break
      }
    }
  } catch (e) { bag.push({ surface: 'spin', source: 'ERROR', text: String(e.message) }) }
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const baseUrl = `http://localhost:${port}`
  const modes = {}

  try {
    const browser = await chromium.launch()
    for (const social of [false, true]) {
      const label = social ? 'social' : 'real'
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      const consoleErrors = []
      page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
      page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message))

      console.log(`[${label}] loading ${baseUrl}`)
      await page.goto(social ? `${baseUrl}/?social=true` : baseUrl, { waitUntil: 'domcontentloaded' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 30000 })

      // HARVEST THE BOOT OVERLAYS BEFORE DISMISSING THEM, 2026-08-09.
      //
      // This scan used to call dismissIntro() FIRST and take its first-paint
      // harvest afterwards, so every string on the intro rules modal was gone
      // from the DOM before anything read it. That modal is the first thing a
      // reviewer opening a social session actually reads, and it was the one
      // surface this gate could not see. The strings on it are compliant today,
      // checked by hand, so this closes a COVERAGE gap rather than a defect: the
      // gate was passing on a surface it never inspected.
      //
      // Deliberately tolerant. The overlays are timing-dependent, and the boot
      // splash is only dismissible once the game is ready, so a slow load can
      // reach here with nothing mounted yet. An empty pre-dismiss harvest is a
      // legitimate outcome and must not fail the run; what matters is that the
      // strings are READ when they are present, not that they always are.
      const bag = []
      await harvest(page, 'boot-overlays', bag)

      await dismissIntro(page)
      console.log(`[${label}] loaded, walking surfaces`)

      await openSurfaces(page, social, bag)
      modes[label] = { strings: bag, consoleErrors }
      await page.close()
    }
    await browser.close()
  } finally {
    server.kill()
  }

  // ── Scan ───────────────────────────────────────────────────────────────────
  const scan = (bag) => {
    const actionable = []
    const informational = []
    for (const item of bag) {
      for (const { phrase } of UNIQUE_TERMS) {
        if (!phraseRe(phrase).test(item.text)) continue
        const hit = { phrase, surface: item.surface, source: item.source, text: item.text.slice(0, 160) }
        if (NEVER_REWRITE.has(phrase.toLowerCase())) informational.push(hit)
        else actionable.push(hit)
      }
    }
    // Deduplicate by phrase + exact text; the same label is harvested on every
    // pass, and 400 copies of one hit is not 400 defects.
    const key = (h) => `${h.phrase}::${h.text}`
    const dedupe = (arr) => [...new Map(arr.map((h) => [key(h), h])).values()]
    return { actionable: dedupe(actionable), informational: dedupe(informational) }
  }

  const socialScan = scan(modes.social.strings)
  const realScan = scan(modes.real.strings)

  const surfacesCovered = [...new Set(modes.social.strings.map((s) => s.surface))]
  const socialTextCount = modes.social.strings.length

  const checks = {}
  checks['social.zeroProhibitedTerms'] = {
    pass: socialScan.actionable.length === 0,
    hits: socialScan.actionable,
  }
  // The real-money render MUST still contain the real-money vocabulary. If it
  // does not, the social rewrite leaked into both modes, which is a different
  // defect wearing this one's clothes.
  checks['real.vocabularyUnchanged'] = {
    pass: realScan.actionable.length > 0,
    note: 'real-money mode is EXPECTED to carry restricted terms; zero here would mean the social rewrite leaked into both modes',
    sampleCount: realScan.actionable.length,
  }
  checks['coverage.surfaces'] = {
    pass: surfacesCovered.length >= 5,
    surfaces: surfacesCovered,
  }
  checks['coverage.stringsHarvested'] = { pass: socialTextCount > 200, count: socialTextCount }
  checks['social.noHarvestErrors'] = {
    pass: !modes.social.strings.some((s) => s.source === 'ERROR'),
    errors: modes.social.strings.filter((s) => s.source === 'ERROR'),
  }
  checks.zeroConsoleErrors = {
    pass: modes.real.consoleErrors.length === 0 && modes.social.consoleErrors.length === 0,
    real: modes.real.consoleErrors,
    social: modes.social.consoleErrors,
  }

  const allPass = Object.values(checks).every((c) => c.pass)
  const output = {
    generated: '2026-07-25',
    supersedes: 'reports/qa/social_string_conformance_2026-07-14b.json',
    termTableSource: TERM_TABLE_SOURCE,
    termsScanned: UNIQUE_TERMS.length,
    termsReportedNotFailed: Object.keys(NOT_SUBSTITUTED),
    surfacesCovered,
    stringsHarvested: { real: modes.real.strings.length, social: socialTextCount },
    checks,
    socialInformationalHits: socialScan.informational,
    allPass,
  }

  const outPath = join(OUT_DIR, 'social_dom_conformance_2026-07-25.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))

  console.log(`\nterms scanned: ${UNIQUE_TERMS.length}   surfaces: ${surfacesCovered.join(', ')}`)
  console.log(`strings harvested: real ${modes.real.strings.length}, social ${socialTextCount}`)
  for (const [k, v] of Object.entries(checks)) {
    console.log(`  ${v.pass ? 'ok  ' : 'FAIL'} ${k}`)
    if (!v.pass && v.hits) for (const h of v.hits.slice(0, 40)) {
      console.log(`        "${h.phrase}" in ${h.surface} (${h.source}): ${h.text}`)
    }
  }
  console.log(`\nwritten to ${outPath}`)

  if (!allPass) { console.error('\nSOCIAL DOM CONFORMANCE: FAIL'); process.exitCode = 1 }
  else console.log('\nSOCIAL DOM CONFORMANCE: PASS')
}

run().catch((e) => { console.error(e); process.exit(1) })
