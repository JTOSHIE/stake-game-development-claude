// locale_launch_conformance.mjs - R6 (2026-07-27).
//
// SPEC (quoted, docs/stake-engine-live/game-replay-requirements.md parameter table):
//   "lang | No | Language code"
// Optional, so absence is a legitimate launch and must fall back to English.
//
// Asserts the launch `lang` parameter reaches the rendered UI for all sixteen
// shipped locales, and that every malformed or unknown value degrades to English
// rather than erroring, blanking, or rendering a raw key.
//
// Derived, not hardcoded: the locale list is read from the shipped translations
// module inside the page, so this harness cannot drift from what actually ships.
//
// Run (from frontend/): node scripts/locale_launch_conformance.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { evidenceDir, announceEvidenceMode } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = evidenceDir('reports', 'qa')
const SHOTS = evidenceDir('reports', 'screens', 'audit-remediation-v1')
announceEvidenceMode('locale_launch_conformance')

// Unknown / malformed values. Every one must fall back to English silently.
const BAD = ['xx', 'EN-GB', '', '   ', 'zz-ZZ', '../en', 'ja;drop', '123', 'null', 'ENGLISH']

const failures = []
const results = { spec: 'lang | No | Language code (game-replay-requirements.md)', locales: {}, fallback: {} }
const check = (n, c, d) => { if (!c) failures.push({ name: n, detail: d }) }

async function freePort() {
  return new Promise((res, rej) => {
    const s = createServer(); s.on('error', rej)
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)) })
  })
}
function devServer(port) {
  return new Promise((res, rej) => {
    const p = spawn('npx', ['vite', '--port', String(port), '--strictPort'],
      { cwd: join(__dirname, '..'), stdio: ['ignore', 'pipe', 'pipe'] })
    let done = false
    const on = (d) => { if (!done && /Local|localhost/.test(d.toString())) { done = true; res(p) } }
    p.stdout.on('data', on); p.stderr.on('data', on); p.on('error', rej)
    setTimeout(() => { if (!done) rej(new Error('vite did not start')) }, 20000)
  })
}

// Read the store's resolved locale and a rendered string, so this proves the
// value reached the UI rather than merely being stored.
const probe = (page) => page.evaluate(async () => {
  const mod = await import('/src/lib/i18n/translations.ts')
  const el = [...document.querySelectorAll('[data-testid="spin-button"]')]
    .filter((e) => !e.closest('.warm-mount'))[0]
  return {
    spinText: (el?.textContent || '').trim(),
    enSpin: mod.locales.en.spin,
    shipped: Object.keys(mod.locales),
  }
})

async function run() {
  const port = await freePort()
  const server = await devServer(port)
  const base = `http://localhost:${port}`
  try {
    const browser = await chromium.launch()

    // Discover the shipped locale set from the module itself.
    const boot = await browser.newPage()
    await boot.goto(base, { waitUntil: 'networkidle' })
    await boot.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    const { shipped } = await probe(boot)
    await boot.close()
    console.log(`shipped locales (${shipped.length}): ${shipped.join(' ')}`)
    check('sixteen locales ship', shipped.length === 16, `found ${shipped.length}`)

    // Every shipped locale must render its own SPIN string.
    for (const code of shipped) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      const errs = []
      page.on('pageerror', (e) => errs.push(e.message))
      await page.goto(`${base}/?lang=${code}`, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await dismissIntro(page)
      const expected = await page.evaluate(async (c) => {
        const m = await import('/src/lib/i18n/translations.ts')
        return m.locales[c].spin
      }, code)
      const { spinText } = await probe(page)
      results.locales[code] = { rendered: spinText, expected }
      check(`${code}: renders its own SPIN string`, spinText === expected,
        `rendered ${JSON.stringify(spinText)}, expected ${JSON.stringify(expected)}`)
      check(`${code}: no page errors`, errs.length === 0, errs.slice(0, 2).join(' | '))

      // THE DOCUMENT MUST DECLARE THE LANGUAGE IT IS RENDERING. index.html
      // ships `<html lang="en">` and nothing changed it, so every locale served
      // a document claiming to be English: a screen reader picked English
      // phonetics for correctly translated text, and Arabic rendered inside an
      // LTR document because dir was never set. Added 2026-08-09.
      const doc = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
      }))
      results.locales[code].documentLang = doc.lang
      results.locales[code].documentDir = doc.dir
      check(`${code}: document lang matches the rendered locale`, doc.lang === code,
        `html lang is ${JSON.stringify(doc.lang)}`)
      check(`${code}: document direction is correct`,
        doc.dir === (code === 'ar' ? 'rtl' : 'ltr'),
        `html dir is ${JSON.stringify(doc.dir)} for ${code}`)
      if (code === 'ja' || code === 'ar') {
        await page.screenshot({ path: join(SHOTS, `locale-${code}.png`) })
      }
      await page.close()
    }

    // Unknown / malformed values must fall back to English, silently.
    for (const bad of BAD) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      const errs = []
      page.on('pageerror', (e) => errs.push(e.message))
      await page.goto(`${base}/?lang=${encodeURIComponent(bad)}`, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await dismissIntro(page)
      const { spinText, enSpin } = await probe(page)
      results.fallback[JSON.stringify(bad)] = spinText
      check(`fallback ${JSON.stringify(bad)}: renders English`, spinText === enSpin,
        `rendered ${JSON.stringify(spinText)}, expected ${JSON.stringify(enSpin)}`)
      check(`fallback ${JSON.stringify(bad)}: no page errors`, errs.length === 0,
        errs.slice(0, 2).join(' | '))
      await page.close()
    }

    // ── SOCIAL MODE FORCES ENGLISH, JOB 3(d) / TR-067 ───────────────────────
    //
    // Guideline item 46: "English is the only supported language in Social
    // Mode". `stores/socialLocale.test.ts` proves the RULE with no browser;
    // this proves the WIRING, which is a different claim and the one this
    // project keeps getting wrong. R7/TR-015 was a correctly computed flag with
    // no consumer, and TR-067 itself was a correct vocabulary layer that nobody
    // had connected to the locale axis. A rule nothing calls renders nothing.
    //
    // The `da` cases are the ones Fable named: Danish is offered by the
    // platform's own Language menu and is not one of our sixteen (TR-059), so a
    // social `da` launch exercises the forcing and the unshipped-locale
    // fallback at once.
    const SOCIAL_CASES = [
      ['social=true&lang=da', 'the named case: forced, and the language is one we do not ship'],
      ['social=true&lang=de', 'forced over a language we DO ship, which is the case that used to fail'],
      ['social=1&lang=ja',    'the numeric flag form is equally social'],
      ['currency=XSC&lang=de', 'social inferred from a social currency with no flag at all'],
      ['currency=XEC&lang=fr', 'Stake EU sweepstakes, same requirement'],
    ]
    results.social = {}
    for (const [query, why] of SOCIAL_CASES) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      const errs = []
      page.on('pageerror', (e) => errs.push(e.message))
      await page.goto(`${base}/?${query}`, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await dismissIntro(page)
      const { spinText } = await probe(page)
      // ENGLISH IN THE SOCIAL VOCABULARY, which is not `locales.en.spin`.
      // The first draft of this check compared against the real-money English
      // string and failed on all five cases, reporting "rendered PLAY, expected
      // SPIN". That was the assertion being wrong, not the build: `spin` is
      // itself a prohibited term on stake.us and the vocabulary layer correctly
      // substitutes it. The two axes are independent, which is the whole point
      // of TR-067, so the expectation has to name both: locale `en`, mode
      // `social`.
      const enSocialSpin = await page.evaluate(async () => {
        const m = await import('/src/lib/i18n/translations.ts')
        return m.t('en', 'spin', 'social')
      })
      // The locale STORE, not only the rendered string. Forcing the text while
      // leaving the store on `de` would leave every other consumer of the
      // locale, the currency formatter's locale tag included, disagreeing with
      // the words next to it.
      // Read by subscribing rather than via svelte's `get`: bare specifiers do
      // not resolve inside page.evaluate, and a store calls its subscriber
      // synchronously with the current value, so this needs no helper.
      const storeLocale = await page.evaluate(async () => {
        const gs = await import('/src/lib/stores/gameStore.ts')
        let v
        gs.locale.subscribe((x) => { v = x })()
        return v
      })
      results.social[query] = { rendered: spinText, storeLocale, expected: enSocialSpin, why }
      check(`social ${query}: renders English (social vocabulary)`, spinText === enSocialSpin,
        `rendered ${JSON.stringify(spinText)}, expected ${JSON.stringify(enSocialSpin)}`)
      check(`social ${query}: the locale STORE reads en`, storeLocale === 'en',
        `store reads ${JSON.stringify(storeLocale)}`)
      check(`social ${query}: no page errors`, errs.length === 0, errs.slice(0, 2).join(' | '))
      if (query === 'social=true&lang=da') {
        await page.screenshot({ path: join(SHOTS, 'locale-social-da.png') })
      }
      await page.close()
    }

    // The negative control. Without it, a build that forced English for EVERY
    // session would pass every assertion above, and that is a worse defect than
    // the one being fixed.
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      await page.goto(`${base}/?lang=de`, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await dismissIntro(page)
      const { spinText, enSpin } = await probe(page)
      const deSpin = await page.evaluate(async () => {
        const m = await import('/src/lib/i18n/translations.ts')
        return m.locales.de.spin
      })
      results.social['NEGATIVE CONTROL lang=de, not social'] = { rendered: spinText, expected: deSpin, english: enSpin }
      // The control only discriminates if the two strings actually differ, so
      // that is asserted rather than assumed. de.spin is 'DREHEN' against
      // en.spin 'SPIN'; if a future translation pass ever made them equal, this
      // control would silently stop testing anything.
      check('negative control is discriminating: de and en SPIN differ', deSpin !== enSpin,
        `both render ${JSON.stringify(deSpin)}`)
      check('negative control: a real-money de session still renders German',
        spinText === deSpin,
        `rendered ${JSON.stringify(spinText)}, expected ${JSON.stringify(deSpin)}`)
      await page.close()
    }

    await browser.close()
  } finally { server.kill() }

  results.failures = failures
  results.pass = failures.length === 0
  writeFileSync(join(OUT, 'locale_launch_conformance_2026-07-27.json'), JSON.stringify(results, null, 2))
  if (failures.length) {
    console.error(`\nLOCALE LAUNCH: FAIL (${failures.length})`)
    for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
    process.exit(1)
  }
  console.log(`\nLOCALE LAUNCH: PASS (${Object.keys(results.locales).length} locales, ${BAD.length} fallback cases)`)
}

run().catch((e) => { console.error(e); process.exit(1) })
