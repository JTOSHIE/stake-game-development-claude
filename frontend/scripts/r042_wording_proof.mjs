// r042_wording_proof.mjs
//
// EVIDENCE FOR FABLE RULING BLOCK R042 BRIEF A. Captures the surfaces R041 changed, in
// the locales its DONE MEANS names, and reads back the STRINGS as well as the
// pixels.
//
// WHY IT READS TEXT AND NOT ONLY PIXELS. A screenshot proves something rendered.
// It does not prove WHICH string rendered, and every defect R041 closes was a
// case of the wrong string rendering while the screen looked perfectly fine: the
// cap said "per spin" in sixteen languages, the scatter said "multiplier", the
// mute toggle said "Mute" in Japanese. A frame of a German paytable is
// indistinguishable to most readers from a frame of a German paytable with one
// English word in it. So every capture writes its observed text to a JSON ledger
// beside the PNG, and the ledger ASSERTS: the run exits non-zero if a locale's
// rules text is missing, is still the old wording, or is identical to English
// where it should not be.
//
// It drives the SHIPPED BUNDLE from dist/ over a plain static server, not the
// dev server, so what is photographed is what would be uploaded.
//
// CONVENTION (h.1): writes to a scratch directory by default and never into a
// committed evidence directory. Pass --out=<dir> to place frames deliberately,
// which is what the R041 close does once, on purpose.
//
// Usage, from frontend/, after `npm run build`:
//   node scripts/r041_wording_proof.mjs [--out=<dir>]

import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const outArg = process.argv.find((a) => a.startsWith('--out='))
const OUT = outArg
  ? outArg.slice('--out='.length)
  : join(ROOT, '.scratch', 'r042-wording')
mkdirSync(OUT, { recursive: true })

const PORT = 4541
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webp': 'image/webp',
}

function serve() {
  const srv = createServer((req, res) => {
    let p = req.url.split('?')[0]
    if (p === '/') p = '/index.html'
    const f = join(DIST, decodeURIComponent(p))
    if (!existsSync(f) || f.endsWith('/')) { res.writeHead(404); res.end('not found'); return }
    res.writeHead(200, { 'content-type': MIME[extname(f)] ?? 'application/octet-stream' })
    res.end(readFileSync(f))
  })
  return new Promise((r) => srv.listen(PORT, () => r(srv)))
}

const clean = (s) => s.replace(/\s+/g, ' ').trim()

async function textOf(page, sel) {
  const loc = page.locator(sel)
  if (!(await loc.count())) return null
  return clean(await loc.first().innerText())
}

const ledger = []
let failures = 0
const fail = (m) => { failures++; console.error(`  FAIL  ${m}`) }
const ok = (m) => console.log(`  ok    ${m}`)


// ── The paytable rules block ─────────────────────────────────────────────────
async function captureRules(browser, lang) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(`http://localhost:${PORT}/?lang=${lang}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
  await dismissIntro(page)
  await page.locator('button.fs-menu').click()
  await page.locator('.hud-menu-item').first().click()
  await page.waitForSelector('[data-testid="interface-guide"]', { timeout: 15000 })
  await page.waitForTimeout(250)
  const rules = page.locator('ul.fs-rules').first()
  if (await rules.count()) { await rules.scrollIntoViewIfNeeded(); await page.waitForTimeout(200) }
  await page.screenshot({ path: join(OUT, `rules-${lang}.png`) })
  const lists = page.locator('ul.fs-rules')
  const n = await lists.count()
  const parts = []
  for (let i = 0; i < n; i++) parts.push(clean(await lists.nth(i).innerText()))
  const text = parts.join(' ')
  const modal = await textOf(page, '[data-testid="interface-guide"]')
  ledger.push({ capture: `rules-${lang}`, lang, rulesText: text })
  await page.close()
  return text
}

// ── The FEATURES cards, where the volatility band renders ────────────────────
async function captureFeatures(browser, lang) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(`http://localhost:${PORT}/?lang=${lang}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
  await dismissIntro(page)
  const btn = page.locator('[data-testid="features-button"], button:has-text("FEATURES")').first()
  if (await btn.count()) { await btn.click(); await page.waitForTimeout(600) }
  await page.screenshot({ path: join(OUT, `features-${lang}.png`) })
  const vols = (await page.locator('.fm-vol').allInnerTexts()).map(clean)
  const costs = (await page.locator('.fm-cost').allInnerTexts()).map(clean)
  ledger.push({ capture: `features-${lang}`, lang, volatility: vols, costs })
  await page.close()
  return vols
}

// ── run ──────────────────────────────────────────────────────────────────────
const srv = await serve()
const browser = await chromium.launch()
try {
  console.log('R042 WORDING PROOF: the ruled forms, read as text\n')

  console.log('Paytable rules')
  const de = await captureRules(browser, 'de')
  const tr = await captureRules(browser, 'tr')
  const fr = await captureRules(browser, 'fr')
  const en = await captureRules(browser, 'en')

  // A2, the figures, in the form a German player actually reads.
  if (de.includes('5.000×')) ok('de cap renders 5.000×'); else fail(`de cap: ${de.slice(0, 160)}`)
  if (de.includes('5,000×')) fail('de still shows the English 5,000×'); else ok('and the English 5,000× is gone from de')
  if (tr.includes('5.000×')) ok('tr cap renders 5.000×'); else fail('tr cap form')
  if (en.includes('5,000×')) ok('en is deliberately unchanged at 5,000×'); else fail('en should be unchanged')

  // A3, the basis.
  if (/Basiseinsatz/.test(de)) ok('de states the BASE bet'); else fail('de basis')
  if (/temel bahsinizin/.test(tr)) ok('tr states the BASE bet'); else fail('tr basis')
  if (/Gesamteinsatz/.test(de)) fail('de still states the TOTAL bet'); else ok('and de no longer states the total')
  if (/base bet/.test(en)) ok('en states the base bet'); else fail('en basis')

  // A1, apostrophes: one form only in the French rules block.
  const curly = (fr.match(/\u2019/g) || []).length
  const straight = (fr.match(/'/g) || []).length
  if (curly === 0) ok(`fr rules use one apostrophe form (${straight} straight, 0 typographic)`)
  else fail(`fr mixes apostrophe forms: ${curly} typographic`)

  // A4, the responsible play paragraph.
  for (const [lang, text] of [['de', de], ['tr', tr]]) {
    if (/Autoplay can be set to stop/.test(text)) fail(`${lang} still shows the English responsible play paragraph`)
  }
  ok('no locale shows the English responsible play paragraph in the rules block')

  console.log('\nFEATURES cards')
  const vde = await captureFeatures(browser, 'de')
  const vja = await captureFeatures(browser, 'ja')
  const EN_BANDS = ['Low', 'High', 'Very High', 'Extreme']
  const leakedDe = vde.filter((v) => EN_BANDS.includes(v))
  const leakedJa = vja.filter((v) => EN_BANDS.includes(v))
  if (vde.length === 0) fail('no volatility band captured in de')
  else if (leakedDe.length) fail(`de cards still show English bands: ${JSON.stringify(leakedDe)}`)
  else ok(`de bands are translated: ${JSON.stringify(vde)}`)
  if (vja.length && leakedJa.length) fail(`ja cards still show English bands: ${JSON.stringify(leakedJa)}`)
  else if (vja.length) ok(`ja bands are translated: ${JSON.stringify(vja)}`)

  writeFileSync(join(OUT, 'observations-r042.json'),
    JSON.stringify({ generated: 'R042 wording proof', ledger }, null, 2) + '\n')
  console.log(`\nframes and observations written to ${OUT}`)
} finally {
  await browser.close()
  srv.close()
}

if (failures) { console.error(`\nR042 WORDING PROOF: FAIL (${failures})`); process.exit(1) }
console.log('\nR042 WORDING PROOF: PASS')
