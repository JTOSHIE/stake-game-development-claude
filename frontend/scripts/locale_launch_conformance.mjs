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

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', '..', 'reports', 'qa')
const SHOTS = join(__dirname, '..', '..', 'reports', 'screens', 'audit-remediation-v1')
mkdirSync(OUT, { recursive: true })
mkdirSync(SHOTS, { recursive: true })

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
