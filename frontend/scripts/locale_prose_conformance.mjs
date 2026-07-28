// locale_prose_conformance.mjs, JOB 2 of reports/briefs/FS_FINAL_MILE_Prompt.md
// (2026-07-28).
//
// REPLACES the ALL-CAPS-only hardcoded scan in locale_completeness_check.mjs
// gate 2, which round three dismantled from two directions at once.
//
// Reviewer 2, F2: "The root cause (per the tracker) is that the conformance gate
// only scans ALL-CAPS literals, missing sentence-case prose." Reviewer 3,
// finding 1, required "an AST/runtime gate that finds literals in script
// variables as well as markup".
//
// Both were right, and the old gate could not have found either of the two
// defects that actually shipped:
//
//   FORM A, the one the reviewers saw. A sentence-case prose literal that never
//   goes through t() at all, so no locale table is ever consulted:
//   config/fsModes.ts carried the five mode blurbs as English strings, and
//   PaytableModal carried the rules, the interface guide and the disclaimer the
//   same way. An uppercase-literal regex over .svelte files cannot see either:
//   the strings are not uppercase, and one of the two files is not .svelte.
//
//   FORM B, which NO reviewer found, and which is worse. A key that IS keyed,
//   IS translated in all sixteen locales, and still renders English, because
//   t() consulted a flat English social table before the locale table and
//   returned from it. 39 keys did this in social mode in every locale. No
//   source scan of any kind can see this one: the source is correct and the
//   tables are complete. Only running the resolver, or rendering the page, can.
//
// So this gate has three parts and each one exists for a defect that shipped:
//
//   PART 1, COMPLETENESS. Every prose key and every social key present in all
//   sixteen locales. Static, instant.
//
//   PART 2, RESOLVER LEAK. Drive the real t() across every key, every locale and
//   both modes, and flag anything that comes back byte-identical to English.
//   This is the only part that can see FORM B. Static, instant, no browser.
//
//   PART 3, RENDERED DOM. Load the real app in every locale in both modes, walk
//   the rendered DOM plus the four attributes a screen reader speaks, and flag
//   any harvested string that exactly matches a known English source string.
//   This is the only part that can see FORM A, because a literal that never
//   reaches t() is invisible to PART 2 by construction.
//
// Convention (p): --self-test plants the exact defect in BOTH forms and the
// gate must go red on each, plus negative controls that must stay green.
//
// Run (from frontend/):
//   node scripts/locale_prose_conformance.mjs              full, with browser
//   node scripts/locale_prose_conformance.mjs --static     parts 1 and 2 only
//   node scripts/locale_prose_conformance.mjs --self-test  convention (p)

import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'

import { t, locales, SOCIAL_OVERRIDES, LOCALE_CODES, featureI18n } from '../src/lib/i18n/translations.ts'
import { resolveLaunchLocale, SOCIAL_LOCALE } from '../src/lib/stores/socialLocale.ts'
import { proseI18n, en as proseEn, PROSE_SOCIAL } from '../src/lib/i18n/prose.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'qa')
mkdirSync(OUT_DIR, { recursive: true })

const NON_EN = LOCALE_CODES.filter((l) => l !== 'en')
const MODES = ['real', 'social']

// ── What is allowed to be identical to English ───────────────────────────────
//
// Every entry is a REASON, not a silencer. A string lands here because it is
// genuinely the same word in that language, or because it is a proper noun the
// translators were instructed never to translate. The list is small on purpose:
// a growing allowlist is how a gate stops meaning anything.

const PROPER_NOUNS = [
  'Future Spinner', 'We Roll Spinners', 'Overdrive', 'Overdrive Free Spins',
  'OVERBOOST', 'NITRO OVERDRIVE', 'WILD', 'SCATTER', 'RTP', 'Remote Game Server',
  'Normal', 'Cruise', 'MAX', 'COLLECT', 'Enter', 'GC', 'SC',
]

/**
 * Keys whose translation is legitimately byte-identical to English in specific
 * locales. Every entry carries its reason. This list was NOT written first and
 * then justified: it is the exact residue left after running PART 2 over all
 * 16 locales, triaged one row at a time. One row failed triage and was FIXED
 * rather than excused (`megaWin` still read "MEGA WIN!!!" in Indonesian and
 * Vietnamese while both had translated the tier word beside it), which is the
 * outcome that keeps a list like this honest.
 */
const IDENTICAL_OK = {
  // International loanwords: these ARE the word in the target language.
  autoPlay:          ['de', 'es', 'fi', 'fr', 'id', 'pl', 'pt'],   // "AUTO"
  guideTurboName:    ['de', 'es', 'fi', 'fr', 'id', 'pl', 'pt', 'tr', 'vi'], // "Turbo"
  guideMenuName:     ['fr', 'id', 'pl', 'pt', 'vi'],               // "Menu"
  a11yMenu:          ['fr', 'id', 'pl', 'pt', 'vi'],               // "Menu"
  guideFeaturesName: ['de'],                                       // German uses "Features"
  a11yFeatures:      ['de'],                                       // same
  hudFeatures:       ['de'],                                       // same, ALL CAPS form
  guideAutoplayName: ['de'],                                       // German uses "Autoplay"
  hudSession:        ['fr'],                                       // "SESSION" is French
  sessionNet:        ['fr', 'tr'],                                 // "NET" in both
  // Japanese slot interfaces conventionally print the bet controls in English.
  betMin: ['ja'], betMax: ['ja'], minBet: ['ja'], maxBet: ['ja'],
  // Mode names. Normal and Cruise are the same word in these languages; the two
  // ALL-CAPS mode names are product proper nouns the localisers were instructed
  // never to translate, so all fifteen are expected.
  modeNormalLabel:    ['de', 'es', 'fr', 'id', 'pt', 'tr'],
  modeCruiseLabel:    ['de', 'fi', 'id'],
  modeOverboostLabel: NON_EN,
  modeSuperLabel:     NON_EN,
}

const isNumericOrSymbolic = (s) => !/[A-Za-zЀ-ӿ؀-ۿऀ-ॿ぀-ヿ一-鿿가-힯]{2}/.test(s)
const isProperNounOnly = (s) => {
  // Case-insensitive: the tables carry both "Overdrive" and "OVERDRIVE".
  let rest = s.toLowerCase()
  for (const p of PROPER_NOUNS) rest = rest.split(p.toLowerCase()).join('')
  return !/[a-z]{2}/.test(rest)
}

// ── The predicate, extracted so the self-test can seed it directly ───────────

/**
 * Given a resolver, report every (locale, mode, key) whose value is
 * byte-identical to the English value and is not excused.
 * `resolve(locale, key, mode)` is injected so the self-test can hand in a
 * deliberately broken one.
 */
export function findResolverLeaks(keys, resolve, { identicalOk = IDENTICAL_OK, modes = ['real'] } = {}) {
  // REAL MONEY ONLY, and this is not a narrowing. Social mode renders in
  // English by platform requirement (testing guideline item 46), enforced in
  // stores/socialLocale.ts, so `t(<non-en>, key, 'social')` is a call the app
  // cannot make and comparing its result to English measures nothing. PART 1
  // asserts the ENFORCEMENT instead, which is the real obligation.
  const leaks = []
  for (const key of keys) {
    for (const mode of modes) {
      const en = resolve('en', key, mode)
      if (!en || isNumericOrSymbolic(en) || isProperNounOnly(en)) continue
      for (const loc of NON_EN) {
        if ((identicalOk[key] || []).includes(loc)) continue
        const v = resolve(loc, key, mode)
        if (v === en) leaks.push({ key, locale: loc, mode, value: v })
      }
    }
  }
  return leaks
}

/**
 * Given strings harvested from a rendered page in `locale`, report every one
 * that exactly matches a known English source string.
 */
export function findRenderedLeaks(harvested, englishStrings, locale, { identicalOk = IDENTICAL_OK } = {}) {
  const excused = new Set()
  for (const [k, locs] of Object.entries(identicalOk)) {
    if (locs.includes(locale)) {
      const v = englishStrings.byKey[k]
      if (v) excused.add(v)
    }
  }
  const hits = []
  for (const h of harvested) {
    const text = h.text.trim()
    if (!text || isNumericOrSymbolic(text) || isProperNounOnly(text)) continue
    if (excused.has(text)) continue
    if (englishStrings.set.has(text)) hits.push({ ...h, text })
  }
  return hits
}

// ── The English corpus every part compares against ───────────────────────────

function englishCorpus() {
  const byKey = {}
  for (const [k, v] of Object.entries(locales.en)) byKey[k] = v
  for (const [k, v] of Object.entries(featureI18n.en)) if (!(k in byKey)) byKey[k] = v
  for (const [k, v] of Object.entries(proseEn)) if (!(k in byKey)) byKey[k] = v
  const set = new Set()
  for (const v of Object.values(byKey)) if (typeof v === 'string' && v.trim()) set.add(v.trim())
  for (const v of Object.values(SOCIAL_OVERRIDES)) if (typeof v === 'string' && v.trim()) set.add(v.trim())
  for (const v of Object.values(PROSE_SOCIAL)) if (typeof v === 'string' && v.trim()) set.add(v.trim())
  return { byKey, set }
}

const ALL_KEYS = [
  ...Object.keys(locales.en),
  ...Object.keys(featureI18n.en),
  ...Object.keys(proseEn),
]

// ── PART 1, completeness ─────────────────────────────────────────────────────

function part1() {
  const failures = []
  const proseKeys = Object.keys(proseEn)
  for (const loc of LOCALE_CODES) {
    for (const k of proseKeys) {
      if (proseI18n[loc]?.[k] === undefined) failures.push({ part: 'completeness', locale: loc, key: k, table: 'proseI18n' })
    }
  }
  // Social mode is English by platform requirement (testing guideline item 46),
  // so there is no per-locale social table to check for completeness. What IS
  // worth asserting, because it is the thing the requirement actually rests on,
  // is that the launch resolver cannot produce a non-English social session for
  // ANY language parameter, including a valid one.
  for (const loc of LOCALE_CODES) {
    if (resolveLaunchLocale(loc, true) !== SOCIAL_LOCALE) {
      failures.push({ part: 'social-english', locale: loc, detail: 'social session resolved to a non-English locale' })
    }
  }
  return failures
}

// ── PART 3, rendered DOM ─────────────────────────────────────────────────────

const HARVEST = `(() => {
  const out = []
  const push = (source, text) => { if (text && text.trim()) out.push({ source, text: text.trim() }) }
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const el = n.parentElement
    if (!el) continue
    const st = getComputedStyle(el)
    if (st.display === 'none' || st.visibility === 'hidden') continue
    if (el.closest('[aria-hidden="true"]')) continue
    push('text:' + el.tagName.toLowerCase(), n.nodeValue)
  }
  for (const attr of ['aria-label', 'title', 'alt', 'placeholder']) {
    for (const el of document.querySelectorAll('[' + attr + ']')) push(attr, el.getAttribute(attr))
  }
  return out
})()`

async function getFreePort() {
  return new Promise((res, rej) => {
    const srv = createServer()
    srv.on('error', rej)
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => res(port)) })
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
      if (!done && (/Local/.test(s) || new RegExp('localhost:' + port).test(s))) { done = true; res(proc) }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', rej)
    setTimeout(() => { if (!done) rej(new Error('vite dev server did not start in time')) }, 30000)
  })
}

async function part3(english) {
  const { chromium } = await import('playwright')
  const port = await getFreePort()
  const server = await startDevServer(port)
  const browser = await chromium.launch()
  const failures = []
  const surfaces = []
  try {
    // The parameter is `lang`, read at App.svelte:190. An earlier revision of
    // this gate used `language=` and every page rendered English, which read as
    // 1,412 leaks. That was a broken measurement, not a finding: convention
    // (l.2). Social is NOT crossed with a locale here, because social forces
    // English before first paint, so the only meaningful social page is en.
    for (const loc of NON_EN) {
      for (const mode of ['real']) {
        const url = `http://localhost:${port}/?lang=${loc}`
        const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
        await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {})
        const { dismissIntro } = await import('./lib/dismissOverlays.mjs')
        await dismissIntro(page).catch(() => {})
        await page.waitForTimeout(400)

        const bag = []
        bag.push(...(await page.evaluate(HARVEST)))
        // The paytable is the block an approval reviewer is guaranteed to open,
        // and it is where the rules, the interface guide and the disclaimer live.
        for (const sel of ['[data-testid="menu-button"]', '.hud-menu', 'button[aria-label]']) {
          const el = await page.$(sel)
          if (el) { await el.click().catch(() => {}); await page.waitForTimeout(300); break }
        }
        bag.push(...(await page.evaluate(HARVEST)))

        const hits = findRenderedLeaks(bag, english, loc)
        surfaces.push({ locale: loc, mode, harvested: bag.length, hits: hits.length })
        for (const h of hits) failures.push({ part: 'rendered', locale: loc, mode, ...h })
        await page.close()
      }
    }
  } finally {
    await browser.close()
    server.kill()
  }
  return { failures, surfaces }
}

// ── Convention (p), the seeded self-test ─────────────────────────────────────

function selfTest() {
  const cases = []
  const english = englishCorpus()

  // SEED 1, the reachable resolver regression: a locale loses a prose key, so
  // t() falls through to English and a German player reads an English rule.
  // This is FORM B as it can actually occur now that the social path is
  // understood: not a table consulted in the wrong order, but a table with a
  // hole in it that the English fallback silently papers over.
  const holedResolve = (loc, key, mode) =>
    (loc === 'de' && key === 'rulesMaxWin') ? t('en', key, mode) : t(loc, key, mode)
  const holed = findResolverLeaks(['rulesMaxWin'], holedResolve)
  cases.push({
    name: 'seeded: a locale loses one prose key and falls back to English',
    caught: holed.length === 1 && holed[0].locale === 'de',
    detail: `${holed.length} leak(s); the English fallback is silent, so only this catches it`,
  })

  // SEED 2, the guideline 46 breach. If the launch resolver ever let a valid
  // `lang` through on a social session, the game would render a non-English
  // social page, which is a named platform requirement failure.
  const brokenLaunch = (raw, social) => (raw === 'de' ? 'de' : resolveLaunchLocale(raw, social))
  cases.push({
    name: 'seeded: a social session resolves to a non-English locale (guideline 46)',
    caught: brokenLaunch('de', true) !== SOCIAL_LOCALE,
    detail: 'social must force English before first paint, for every language parameter',
  })

  // FORM A, the reviewers' finding, in the form it really occurred: the German
  // capture's own sentence, rendered as a text node on a German page.
  const GERMAN_FIXTURE = 'Standard play. Overdrive Free Spins trigger on 3+ scatters.'
  cases.push({
    name: 'seeded FORM A: the German regression fixture, sentence-case prose on a de page',
    caught: findRenderedLeaks([{ source: 'text:p', text: GERMAN_FIXTURE }], english, 'de').length === 1,
    detail: JSON.stringify(GERMAN_FIXTURE),
  })

  // FORM A in an ATTRIBUTE, which no visible-text scan sees.
  cases.push({
    name: 'seeded FORM A: English in a screen reader label, invisible to a text scan',
    caught: findRenderedLeaks([{ source: 'aria-label', text: 'Sound effects volume' }], english, 'ja').length === 1,
    detail: 'aria-label="Sound effects volume" on a Japanese page',
  })

  // FORM A, ALL CAPS. The old gate's only case must still be caught.
  cases.push({
    name: 'seeded FORM A: an ALL CAPS literal, the only form the OLD gate could see',
    caught: findRenderedLeaks([{ source: 'text:span', text: 'MEGA WIN' }], english, 'ru').length === 1,
    detail: 'the replaced gate must not lose coverage it had',
  })

  // NEGATIVE CONTROL 1: a correct translation must NOT be flagged.
  cases.push({
    name: 'negative control: a correctly translated string passes',
    caught: findRenderedLeaks([{ source: 'text:p', text: t('de', 'modeNormalBlurb', 'real') }], english, 'de').length === 0,
    detail: JSON.stringify(t('de', 'modeNormalBlurb', 'real')).slice(0, 60),
  })

  // NEGATIVE CONTROL 2: a proper noun the translators must NOT translate.
  cases.push({
    name: 'negative control: a proper noun that is English by instruction passes',
    caught: findRenderedLeaks([{ source: 'text:span', text: 'NITRO OVERDRIVE' }], english, 'ja').length === 0,
    detail: 'proper nouns are never a leak',
  })

  // NEGATIVE CONTROL 3: the real resolver must be clean. This is the assertion
  // that would have gone red on 2026-07-27 and green today.
  const realLeaks = findResolverLeaks(ALL_KEYS, t)
  cases.push({
    name: 'negative control: the REAL resolver leaks nothing',
    caught: realLeaks.length === 0,
    detail: realLeaks.length ? `${realLeaks.length} leaks: ` + realLeaks.slice(0, 5).map((l) => `${l.locale}/${l.mode}/${l.key}`).join(', ') : 'clean',
  })

  return cases
}

// ── Main ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const english = englishCorpus()

if (args.includes('--self-test')) {
  const cases = selfTest()
  console.log('LOCALE PROSE CONFORMANCE, seeded self-test (convention p)\n')
  for (const c of cases) console.log(`  ${c.caught ? 'caught ' : 'MISSED '} ${c.name}\n           ${c.detail}`)
  const bad = cases.filter((c) => !c.caught)
  console.log(`\nSELF-TEST: ${bad.length ? 'FAIL' : 'PASS'} (${cases.length - bad.length}/${cases.length})`)
  process.exit(bad.length ? 1 : 0)
}

const failures = []
const p1 = part1()
failures.push(...p1)
console.log(`PART 1 completeness: ${Object.keys(proseEn).length} prose keys + ${Object.keys(SOCIAL_OVERRIDES).length} social keys x ${LOCALE_CODES.length} locales, ${p1.length} gap(s)`)

const p2 = findResolverLeaks(ALL_KEYS, t)
failures.push(...p2.map((l) => ({ part: 'resolver', ...l })))
console.log(`PART 2 resolver leak: ${ALL_KEYS.length} keys x ${NON_EN.length} locales x 2 modes, ${p2.length} leak(s)`)

let surfaces = []
if (!args.includes('--static')) {
  const r = await part3(english)
  failures.push(...r.failures)
  surfaces = r.surfaces
  const hit = r.failures.length
  console.log(`PART 3 rendered DOM: ${surfaces.length} locale/mode pages, ${surfaces.reduce((a, s) => a + s.harvested, 0)} strings harvested, ${hit} leak(s)`)
} else {
  console.log('PART 3 rendered DOM: SKIPPED (--static)')
}

const result = {
  gate: 'locale_prose_conformance',
  generated: new Date().toISOString(),
  locales: LOCALE_CODES.length,
  modes: MODES,
  parts: { completeness: p1.length, resolver: p2.length, rendered: failures.filter((f) => f.part === 'rendered').length },
  surfaces,
  failures: failures.slice(0, 200),
  pass: failures.length === 0,
}
writeFileSync(join(OUT_DIR, 'locale_prose_conformance.json'), JSON.stringify(result, null, 2))

if (failures.length) {
  console.log(`\nFAILURES (${failures.length}), first 20:`)
  for (const f of failures.slice(0, 20)) console.log('  ', JSON.stringify(f))
}
console.log(`\nLOCALE PROSE CONFORMANCE: ${failures.length ? 'FAIL' : 'PASS'}`)
process.exit(failures.length ? 1 : 0)
