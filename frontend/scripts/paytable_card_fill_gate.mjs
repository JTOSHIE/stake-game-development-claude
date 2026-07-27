// paytable_card_fill_gate.mjs, FS VISUAL FIXPACK JOB 3: a card's fill encloses
// its content, on every card, at every locale.
//
// THE OWNER'S REPORT (reports/briefs/FS_VISUAL_FIXPACK_Prompt.md), quoted:
// "In Symbol Payouts, the WILD and SCAT cards' background fill stops short so
// the bottom of their text cuts off the blue panel, unlike every other card".
//
// WHAT IT ACTUALLY WAS
// --------------------
// The paytable's card primitive is two elements: `.fs-plate` is the brushed
// chrome FRAME, and its `.fs-face` child is the dark FILL that carries the
// content. The frame was a block container, so the fill was only ever as tall
// as its own content. Wherever the frame is content-sized too, that is
// invisible. `.fs-sym-grid` is a grid, and grid items stretch to their row, so
// on a row containing a taller card the shorter card's frame grew and its fill
// did not, and the chrome gradient showed through underneath.
//
// Measured at 1200x675 before the fix, Symbol Payouts row 1: every frame
// 197.4px tall; H1, H2, M1 and M2 fills 193.6px, which is the frame less its
// 2px padding on each side; WILD's fill 170.3px, exposing 23.0px of chrome, and
// SCAT's 156.6px, exposing 36.8px. Those two are exactly the two whose content
// is a short note rather than three payout rows, which is why those two and no
// others.
//
// So the defect is not about WILD and SCAT. It is about any card whose content
// is shorter than its row, in any locale, forever. A fix that padded those two
// cards would have been wrong the next time a translation changed a line count.
//
// WHAT THIS ASSERTS, in both directions, because a fix can fail either way:
//
//   ENCLOSURE  the fill covers the frame's inner box. Fails on the shipped
//              defect: fill shorter than frame, chrome showing.
//   CONTAINMENT every text box and image inside a card lies inside that card's
//              fill. Fails on the other fix that suggests itself, giving the
//              fill a fixed height, which stops the chrome showing and starts
//              the text spilling instead.
//
// ACROSS ALL SIXTEEN LOCALES, and the locale list is DERIVED from the shipped
// `Locale` union rather than copied, so a seventeenth locale is covered the day
// it lands rather than the day someone remembers this file.
//
// CONVENTION (p): --self-test plants both real forms. Seed 1 restores the block
// frame, which is the defect as it shipped. Seed 2 pins the fill to a fixed
// height, which is the defect the obvious fix would have introduced.
//
// USAGE (from frontend/, after `npm run build`):
//   node scripts/paytable_card_fill_gate.mjs
//   node scripts/paytable_card_fill_gate.mjs --self-test
//   FS_WRITE_EVIDENCE=1 node scripts/paytable_card_fill_gate.mjs --capture

import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
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

announceEvidenceMode('paytable_card_fill_gate')
const QA = evidenceDir('reports', 'qa')
const SHOTS = evidenceDir('reports', 'screens', 'paytable-card-fill-2026-07-27')

/**
 * The shipped locales, read off the `Locale` union in translations.ts.
 *
 * Derived, not listed. A gate carrying its own copy of a list is a gate that
 * silently stops covering the thing it was written for, and this project has
 * already paid for that once with the dash gate's two-file scan.
 */
function shippedLocales() {
  const src = readFileSync(join(ROOT, 'src', 'lib', 'i18n', 'translations.ts'), 'utf8')
  const m = src.match(/export type Locale\s*=([\s\S]*?)\n\n/)
  if (!m) throw new Error('could not find the Locale union in translations.ts')
  const codes = [...m[1].matchAll(/'([a-z]{2})'/g)].map((x) => x[1])
  if (codes.length < 2) throw new Error(`Locale union parsed to ${codes.length} codes, which cannot be right`)
  return codes
}

const LOCALES = shippedLocales()

// Every locale is measured at Desktop. English and the two extremes of the
// window range are measured at all three so a locale-independent layout break
// is caught too.
const DESKTOP = { name: 'Desktop', width: 1200, height: 675 }
const EXTRA_PRESETS = [
  { name: 'Mobile L', width: 425, height: 812 },
  { name: 'Popout S', width: 400, height: 225 },
]
const EXTRA_PRESET_LOCALES = ['en', 'de', 'ar']

/** The plate-based cards. Frames that are stretched by a grid are the risk. */
const CARD_SELECTORS = ['.fs-sym-card', '.fs-mode-card', '.fs-rtp-row']

/** Sub-pixel rounding only. The measured shortfall on the real defect was 23px. */
const EPS = 0.75

const RGS_HOST = 'rgs.paytable-fill-gate.invalid'

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


const GATE_TIMEOUT_MS = 8 * 60_000
setTimeout(() => {
  console.error(`PAYTABLE CARD FILL GATE: HARD TIMEOUT after ${GATE_TIMEOUT_MS / 1000}s, failing red`)
  process.exit(1)
}, GATE_TIMEOUT_MS)



/**
 * Open the paytable through whichever menu this preset renders. At Popout S the
 * paytable is reached from the mini-player menu, not the desktop knob.
 */
async function openPaytable(page) {
  const clicked = await page.evaluate(() => {
    const menu = [...document.querySelectorAll('.fs-menu, [data-testid="mini-menu"], .p-round-btn, .c-round-btn, .m-round-btn')]
      .find((e) => (e.getAttribute('aria-label') || '') === 'Menu')
    if (!menu) return false
    menu.click()
    return true
  })
  if (!clicked) return false
  await page.waitForTimeout(200)
  await page.evaluate(() => {
    // The paytable is the FIRST item in every one of these menus. Matching on
    // its label would only work in English, and this gate runs in sixteen.
    const it = document.querySelector('.hud-menu-item')
    if (it) it.click()
  })
  try {
    await page.waitForSelector('.fs-sym-card', { timeout: 8000 })
  } catch { return false }
  await page.waitForTimeout(350)
  return true
}

/**
 * Measure every card: does its fill cover its frame, and does its content sit
 * inside its fill.
 */
const MEASURE = ([selectors, eps]) => {
  const out = []
  for (const sel of selectors) {
    for (const card of document.querySelectorAll(sel)) {
      const cs = getComputedStyle(card)
      if (cs.display === 'none' || cs.visibility === 'hidden') continue
      const face = card.querySelector(':scope > .fs-face')
      const cr = card.getBoundingClientRect()
      if (cr.width < 2 || cr.height < 2) continue
      if (!face) { out.push({ sel, label: '?', noFace: true }); continue }
      const fr = face.getBoundingClientRect()

      // The frame's INNER box: its border box deflated by its own padding, which
      // is the area the fill is supposed to occupy.
      const pt = parseFloat(cs.paddingTop) || 0
      const pr = parseFloat(cs.paddingRight) || 0
      const pb = parseFloat(cs.paddingBottom) || 0
      const pl = parseFloat(cs.paddingLeft) || 0
      const inner = { left: cr.left + pl, top: cr.top + pt, right: cr.right - pr, bottom: cr.bottom - pb }

      // Positive numbers are exposed frame, i.e. chrome showing where fill
      // should be. This is the direction the shipped defect fails in.
      const exposed = {
        top: fr.top - inner.top,
        left: fr.left - inner.left,
        right: inner.right - fr.right,
        bottom: inner.bottom - fr.bottom,
      }

      // Content containment. Any element carrying its own visible text, plus
      // every image, must lie inside the fill.
      const overflows = []
      const nodes = [...card.querySelectorAll('*')].filter((el) => {
        if (el === face) return false
        if (el.tagName === 'IMG') return true
        return [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0)
      })
      for (const el of nodes) {
        const es = getComputedStyle(el)
        if (es.display === 'none' || es.visibility === 'hidden' || Number(es.opacity) === 0) continue
        const r = el.getBoundingClientRect()
        if (r.width < 1 || r.height < 1) continue
        const over = {
          top: fr.top - r.top, left: fr.left - r.left,
          right: r.right - fr.right, bottom: r.bottom - fr.bottom,
        }
        const worst = Math.max(over.top, over.left, over.right, over.bottom)
        if (worst > eps) {
          overflows.push({
            what: (el.className && el.className.toString().split(' ')[0]) || el.tagName,
            text: (el.textContent || '').trim().slice(0, 34),
            by: +worst.toFixed(2),
            side: Object.entries(over).sort((a, b) => b[1] - a[1])[0][0],
          })
        }
      }

      out.push({
        sel,
        label: (card.querySelector('.fs-sym-name, .fs-mode-name, .fs-rtp-lbl') || {}).textContent?.trim()?.slice(0, 22) || sel,
        frameH: +cr.height.toFixed(2), fillH: +fr.height.toFixed(2),
        exposed: {
          top: +exposed.top.toFixed(2), left: +exposed.left.toFixed(2),
          right: +exposed.right.toFixed(2), bottom: +exposed.bottom.toFixed(2),
        },
        worstExposed: +Math.max(exposed.top, exposed.left, exposed.right, exposed.bottom).toFixed(2),
        overflows,
      })
    }
  }
  return out
}

const SEEDS = {
  // Seed 1: the defect exactly as it shipped. The frame goes back to being a
  // block container, so the fill stops at its own content again.
  blockFrame: `
    .fs-plate { display: block !important; }
    .fs-plate > .fs-face { flex: none !important; }
  `,
  // Seed 2: the fix that suggests itself and is also wrong. Pinning the fill to
  // a fixed height stops the chrome showing and starts the text spilling, which
  // is the failure the brief names ("fixed-height fill against taller
  // multi-line content").
  fixedHeightFill: `
    .fs-sym-card > .fs-face { height: 90px !important; flex: none !important; }
  `,
}

async function measureOne(browser, base, preset, locale, opts = {}) {
  const { seedCss = null, capture = false } = opts
  const ctx = await browser.newContext({ viewport: { width: preset.width, height: preset.height } })
  const page = await ctx.newPage()
  await page.route(`**://${RGS_HOST}/**`, (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify(route.request().url().includes('/wallet/authenticate') ? authBody() : {}),
  }))
  await page.goto(`${base}/?sessionID=fill-gate&rgs_url=${RGS_HOST}&lang=${locale}`, { waitUntil: 'networkidle' })
  await dismissIntro(page)
  await page.waitForTimeout(250)
  if (seedCss) await page.addStyleTag({ content: seedCss })

  const opened = await openPaytable(page)
  if (!opened) { await ctx.close(); return { error: 'could not open the paytable' } }

  const cards = await page.evaluate(MEASURE, [CARD_SELECTORS, EPS])

  let shot = null
  if (capture) {
    const name = `${LABEL}-cards-${locale}-${preset.name.toLowerCase().replace(/\s+/g, '-')}.png`
    // The Symbol Payouts grid alone, which is what the report is about.
    const grid = page.locator('.fs-sym-grid').first()
    await grid.scrollIntoViewIfNeeded().catch(() => {})
    await page.waitForTimeout(150)
    await grid.screenshot({ path: join(SHOTS, name) }).catch(() => {})
    shot = name
  }
  await ctx.close()
  return { cards, shot }
}

function assess(preset, locale, result) {
  const findings = []
  if (result.error) {
    findings.push(`${locale} / ${preset.name}: ${result.error}`)
    return { findings, cards: [] }
  }
  if (!result.cards.length) {
    findings.push(`${locale} / ${preset.name}: no cards found, so nothing was actually checked`)
    return { findings, cards: [] }
  }
  for (const c of result.cards) {
    if (c.noFace) {
      findings.push(`${locale} / ${preset.name}: a ${c.sel} has no fill element at all`)
      continue
    }
    if (c.worstExposed > EPS) {
      const side = Object.entries(c.exposed).sort((a, b) => b[1] - a[1])[0]
      findings.push(
        `${locale} / ${preset.name}: card "${c.label}" fill stops short of its frame, `
        + `${side[1].toFixed(2)}px of frame exposed at ${side[0]} (frame ${c.frameH}px, fill ${c.fillH}px)`,
      )
    }
    for (const o of c.overflows) {
      findings.push(
        `${locale} / ${preset.name}: card "${c.label}" content .${o.what} ("${o.text}") `
        + `exceeds its fill by ${o.by}px at ${o.side}`,
      )
    }
  }
  return { findings, cards: result.cards }
}

const port = await getFreePort()
const preview = await startPreview(port)
const BASE = `http://localhost:${port}`
const browser = await chromium.launch()

let exitCode = 0
try {
  if (SELF_TEST) {
    console.log('PAYTABLE CARD FILL GATE SELF-TEST: planting both real failure forms\n')
    let ok = true

    const s1 = await measureOne(browser, BASE, DESKTOP, 'en', { seedCss: SEEDS.blockFrame })
    const f1 = assess(DESKTOP, 'en', s1).findings.filter((f) => /stops short/.test(f))
    console.log(`  seed 1, the frame back to a block container -> ${f1.length ? 'RED (correct)' : 'GREEN (WRONG)'}`)
    for (const f of f1.slice(0, 4)) console.log(`      ${f}`)
    if (!f1.length) ok = false

    const s2 = await measureOne(browser, BASE, DESKTOP, 'en', { seedCss: SEEDS.fixedHeightFill })
    const f2 = assess(DESKTOP, 'en', s2).findings.filter((f) => /exceeds its fill/.test(f))
    console.log(`  seed 2, the fill pinned to a fixed height   -> ${f2.length ? 'RED (correct)' : 'GREEN (WRONG)'}`)
    for (const f of f2.slice(0, 4)) console.log(`      ${f}`)
    if (!f2.length) ok = false

    const c = await measureOne(browser, BASE, DESKTOP, 'en')
    const fc = assess(DESKTOP, 'en', c).findings
    console.log(`  control, nothing seeded                     -> ${fc.length ? 'RED (WRONG)' : 'GREEN (correct)'}`)
    for (const f of fc.slice(0, 6)) console.log(`      ${f}`)
    if (fc.length) ok = false

    console.log('')
    if (ok) console.log('PAYTABLE CARD FILL GATE SELF-TEST: PASS (both seeded forms caught, control clean)')
    else { console.error('PAYTABLE CARD FILL GATE SELF-TEST: FAIL'); exitCode = 1 }
  } else {
    const failures = []
    const rows = []
    const shots = []
    let cardsChecked = 0

    const runs = []
    for (const locale of LOCALES) runs.push({ preset: DESKTOP, locale })
    for (const locale of EXTRA_PRESET_LOCALES) {
      for (const preset of EXTRA_PRESETS) runs.push({ preset, locale })
    }

    for (const run of runs) {
      const capture = CAPTURE && (run.locale === 'en' || run.locale === 'de' || run.locale === 'ar')
      const result = await measureOne(browser, BASE, run.preset, run.locale, { capture })
      const { findings, cards } = assess(run.preset, run.locale, result)
      failures.push(...findings)
      cardsChecked += cards.length
      if (result.shot) shots.push(result.shot)
      const worst = cards.reduce((a, c) => Math.max(a, c.worstExposed ?? 0), 0)
      rows.push({
        locale: run.locale, preset: run.preset.name, cards: cards.length,
        worstExposedPx: +worst.toFixed(2),
        contentOverflows: cards.reduce((a, c) => a + (c.overflows?.length || 0), 0),
      })
      console.log(
        `  ${run.locale.padEnd(3)} ${run.preset.name.padEnd(9)} cards=${String(cards.length).padStart(2)} `
        + `worstExposed=${worst.toFixed(2)}px ${findings.length ? 'FINDINGS' : 'ok'}`,
      )
    }

    writeFileSync(join(QA, 'paytable_card_fill_gate_2026-07-27.json'), JSON.stringify({
      locales: LOCALES, eps_px: EPS, card_selectors: CARD_SELECTORS,
      cards_checked: cardsChecked, rows, screenshots: shots, failures,
    }, null, 2))

    console.log(`\nPAYTABLE CARD FILL GATE: ${LOCALES.length} locales, ${runs.length} runs, ${cardsChecked} cards measured`)
    if (failures.length) {
      console.error(`\nFAIL, ${failures.length} finding(s):`)
      for (const f of failures) console.error(`  ${f}`)
      exitCode = 1
    } else {
      console.log('PAYTABLE CARD FILL GATE: PASS (every card fill encloses its frame, '
        + 'and every card content sits inside its fill, at every shipped locale)')
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
if (!assertNoSurvivors('paytable card fill gate')) {
  console.error('\nPAYTABLE CARD FILL GATE: this gate left processes behind')
  exitCode = 1
}
process.exit(exitCode)
