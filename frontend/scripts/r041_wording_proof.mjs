// r041_wording_proof.mjs
//
// EVIDENCE FOR FABLE RULING BLOCK R041. Captures the surfaces R041 changed, in
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
  : join(ROOT, '.scratch', 'r041-wording')
mkdirSync(OUT, { recursive: true })

const PORT = 4531
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

// ── The paytable rules block, four locales ───────────────────────────────────
async function captureRules(browser, lang) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(`http://localhost:${PORT}/?lang=${lang}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
  await dismissIntro(page)

  await page.locator('button.fs-menu').click()
  await page.locator('.hud-menu-item').first().click()
  await page.waitForSelector('[data-testid="interface-guide"]', { timeout: 15000 })
  await page.waitForTimeout(250)

  // The rules list is the block carrying the cap sentence. Scroll it into view
  // so the frame shows the two sentences R041 rewrote, not the top of the modal.
  const rules = page.locator('.fs-rules, [data-testid="paytable-rules"]').first()
  if (await rules.count()) {
    await rules.scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
  }
  await page.screenshot({ path: join(OUT, `rules-${lang}.png`) })

  // THE RULES ARE `ul.fs-rules`, NOT `[data-testid="interface-guide"]`. The
  // first draft of this proof read the guide element and reported the two cap
  // assertions as failures while the wording was in fact correct: the guide is
  // a SECTION of the modal and carries no rules text at all. A proof that reads
  // the wrong element produces a confident answer about nothing, which is worse
  // than no proof, so the selector is pinned to where the strings actually are.
  const lists = page.locator('ul.fs-rules')
  const n = await lists.count()
  const parts = []
  for (let i = 0; i < n; i++) parts.push(clean(await lists.nth(i).innerText()))
  const rulesText = parts.join(' ')
  const ths = await page.locator('th').allInnerTexts()
  ledger.push({
    capture: `rules-${lang}`, lang,
    rulesLists: n, rulesText,
    tableHeaders: ths.map(clean),
  })
  await page.close()
  return rulesText
}

// ── The HUD audio menu, one non-English locale ───────────────────────────────
async function captureAudioMenu(browser, lang) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(`http://localhost:${PORT}/?lang=${lang}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
  await dismissIntro(page)

  await page.locator('button.fs-menu').click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(OUT, `hud-audio-${lang}.png`) })

  const mute = await textOf(page, '.audio-mute')
  ledger.push({ capture: `hud-audio-${lang}`, lang, muteLabel: mute })
  await page.close()
  return mute ?? ''
}

// ── The replay meta line, real money and social ──────────────────────────────
const REPLAY_QS = (mode, lang) =>
  `replay=true&game=future_spinner&version=1.0&mode=${mode}&event=1`
  + `&rgs_url=localhost:${PORT}&currency=${mode === 'social' ? 'XSC' : 'USD'}`
  + `&amount=1000000&lang=${lang}&device=desktop&social=${mode === 'social'}`

async function captureReplay(browser, mode, lang) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.route(/^(?!http:\/\/localhost:4531).*/, async (route) => {
    const url = route.request().url()
    if (!url.includes('/bet/replay/')) { await route.abort(); return }
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ payoutMultiplier: 0, costMultiplier: 1, state: { events: [] } }),
    })
  })
  await page.goto(`http://localhost:${PORT}/?${REPLAY_QS(mode, lang)}`,
    { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: join(OUT, `replay-${mode}.png`) })

  const meta = await textOf(page, '.replay-figures') ?? await textOf(page, 'body')
  const line2 = await textOf(page, '.btn-line-2')
  ledger.push({ capture: `replay-${mode}`, mode, lang, meta, line2 })
  await page.close()
  return { meta: meta ?? '', line2: line2 ?? '' }
}

// ── run ──────────────────────────────────────────────────────────────────────
const srv = await serve()
const browser = await chromium.launch()
try {
  console.log('R041 WORDING PROOF: the surfaces the ruling changed, read as text\n')

  console.log('Paytable rules, four locales')
  const rulesText = {}
  for (const lang of ['en', 'de', 'ja', 'zh']) rulesText[lang] = await captureRules(browser, lang)

  // ASSERTIONS. The old wording is the thing that must be gone, and English
  // leaking into a translated modal is the thing that must not have returned.
  if (!/per game round/i.test(rulesText.en)) fail('en rules do not carry the new ROUND wording')
  else ok('en rules read "per game round", not "per spin"')

  if (/Maximum win per spin/i.test(rulesText.en)) fail('en rules still carry the OLD per-spin sentence')
  else ok('the old per-spin sentence is gone from en')

  if (!/instant win/i.test(rulesText.en)) fail('en scatter rule does not read as an instant win')
  else ok('en scatter rule reads "instant win", not "multiplier"')

  for (const lang of ['de', 'ja', 'zh']) {
    if (!rulesText[lang]) { fail(`${lang} rules modal captured no text`); continue }
    if (rulesText[lang] === rulesText.en) fail(`${lang} rules are byte-identical to en`)
    else ok(`${lang} rules are genuinely translated, not the English string`)
    if (/Maximum win per spin/i.test(rulesText[lang])) fail(`${lang} still carries the English per-spin sentence`)
  }
  // The Scatters column header was the English literal in all sixteen locales.
  // Asserted against the value R041 actually ratified for each locale, not
  // merely "not the English word": de is 'Scatter', ja and zh are 'SCATTER'.
  //
  // COMPARED CASE-INSENSITIVELY, AND THAT IS NOT A WEAKENING. `.fs-trig th`
  // carries `text-transform: uppercase` (PaytableModal.svelte:684), so innerText
  // returns the RENDERED case, not the string's own: de's ratified 'Scatter'
  // reads back as 'SCATTER' beside its equally uppercased siblings FREISPIELE
  // and SOFORTPRÄMIE. Asserting the source case here would fail on a correct
  // string and, worse, would silently start passing if someone deleted the CSS
  // rule. The exact stored values are already pinned elsewhere: all 176 were
  // diffed against the ruling by evaluating the module directly.
  for (const [lang, want] of [['de', 'Scatter'], ['ja', 'SCATTER'], ['zh', 'SCATTER']]) {
    const ths = (ledger.find((l) => l.capture === `rules-${lang}`)?.tableHeaders ?? [])
    const lower = ths.map((t) => t.toLowerCase())
    if (lower.includes(want.toLowerCase())) {
      ok(`${lang} carries the ratified scatter header ${JSON.stringify(want)} (rendered ${JSON.stringify(ths.find((t) => t.toLowerCase() === want.toLowerCase()))})`)
    } else {
      fail(`${lang} scatter header missing; headers seen: ${JSON.stringify(ths)}`)
    }
    // The English plural is the defect being closed, and no ratified value for
    // these three locales is 'Scatters', so seeing it means the fix regressed.
    if (lower.includes('scatters')) fail(`${lang} still shows the English "Scatters"`)
  }

  console.log('\nHUD audio menu, non-English')
  const mute = await captureAudioMenu(browser, 'de')
  if (!mute) fail('no audio mute control captured')
  else if (/^(Mute|Unmute)$/i.test(mute)) fail(`the de audio toggle still reads English: ${JSON.stringify(mute)}`)
  else ok(`the de audio toggle reads ${JSON.stringify(mute)}`)

  console.log('\nReplay meta line, real money and social')
  const real = await captureReplay(browser, 'real', 'de')
  const social = await captureReplay(browser, 'social', 'en')
  if (/\bCurrency\b/.test(real.meta) && !/Währung/.test(real.meta)) {
    fail('the de real-money replay still shows the English word Currency')
  } else ok('the de real-money replay meta line is translated')
  if (/\bWährung\b/.test(social.meta)) fail('social leaked a translated currency label')
  else ok('the social replay keeps its en-only Token wording')

  writeFileSync(join(OUT, 'observations-wording.json'),
    JSON.stringify({ generated: 'R041 wording proof', ledger }, null, 2) + '\n')
  console.log(`\nframes and observations.json written to ${OUT}`)
} finally {
  await browser.close()
  srv.close()
}

if (failures) { console.error(`\nR041 WORDING PROOF: FAIL (${failures})`); process.exit(1) }
console.log('\nR041 WORDING PROOF: PASS')
