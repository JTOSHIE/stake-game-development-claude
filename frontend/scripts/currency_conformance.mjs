// currency_conformance.mjs - XEC/SC currency readiness (2026-07-25 platform-delta pass)
//
// Three layers:
//   (A) unit    - imports src/lib/utils/currency.ts through Vite inside the page
//                 and asserts exact formatter output with an explicit locale, so
//                 the assertions are deterministic and not host-locale dependent.
//   (B) DOM     - drives the real app with ?mockCurrency=<code> and reads the
//                 rendered HUD, proving the display path end to end.
//   (C) social  - the EU-default combination: social=true AND a sweepstakes
//                 currency together, which is the case the brief cares about.
//
// The central rule under test: a player must never see a raw platform currency
// code. The RGS sends 'XSC'; the player sees 'SC'. Before this pass, replay mode
// keyed its symbol table on 'SC' only, so a real 'XSC' session fell through to a
// fallback that printed the code.
//
// Run (from frontend/): node scripts/currency_conformance.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { qaTmpDir } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = qaTmpDir()
const SCREENS_DIR = qaTmpDir('screens', 'currency-readiness')
mkdirSync(OUT_DIR, { recursive: true })
mkdirSync(SCREENS_DIR, { recursive: true })

// Every code form that can reach the formatter. XSC/XGC arrive from the RGS
// authenticate response; SC/GC are what replayService defaults to when a replay
// URL carries no currency parameter.
const VIRTUAL_CODES = ['XSC', 'XGC', 'SC', 'GC']

// JPY is the high-minimum currency required by the brief: zero decimals, and bet
// levels three orders of magnitude larger than USD. The zero-decimal authority is
// now the portal Bets ledger, read first-hand (R066 TASK 3,
// docs/stake-engine-live/captures/2026-08-14_portal_bets_jpy.md: COST ¥100,
// PAYOUT ¥0). Recorded per (n): R065's uniform-two default briefly put the
// shipped table at ¥10.00 while this harness kept asserting zero, and being
// local-only it was never run in that window; the ledger read settles the
// disagreement in this file's favour.
const DOM_CURRENCIES = ['USD', 'JPY', 'XSC', 'XGC']

const failures = []
function check(name, condition, detail) {
  if (condition) return true
  failures.push({ name, detail })
  return false
}

async function getFreePort() {
  return new Promise((resolvePromise, reject) => {
    const srv = createServer()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolvePromise(port))
    })
  })
}

function startDevServer(port) {
  return new Promise((resolveServer, reject) => {
    const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], {
      cwd: join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let resolved = false
    const onData = (d) => {
      const s = d.toString()
      if (!resolved && (/Local/.test(s) || new RegExp(`localhost:${port}`).test(s))) {
        resolved = true
        resolveServer(proc)
      }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', reject)
    setTimeout(() => { if (!resolved) reject(new Error('vite dev server did not start in time')) }, 15000)
  })
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const baseUrl = `http://localhost:${port}`
  const results = { unit: {}, dom: {}, social: {} }

  try {
    const browser = await chromium.launch()

    // ── (A) unit layer ─────────────────────────────────────────────────────
    {
      const page = await browser.newPage()
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })

      const unit = await page.evaluate(async () => {
        const m = await import('/src/lib/utils/currency.ts')
        const S = m.CURRENCY_SCALE
        return {
          sc1000:      m.formatBalance(1000 * S, 'XSC', 'en'),
          scAlias:     m.formatBalance(1000 * S, 'SC', 'en'),
          gc500:       m.formatBalance(500 * S, 'XGC', 'en'),
          usd:         m.formatBalance(1.25 * S, 'USD', 'en'),
          jpy:         m.formatBalance(1250 * S, 'JPY', 'en'),
          symXSC:      m.currencySymbolFor('XSC', 'en'),
          symSC:       m.currencySymbolFor('SC', 'en'),
          symXGC:      m.currencySymbolFor('XGC', 'en'),
          symUSD:      m.currencySymbolFor('USD', 'en'),
          isVirtXSC:   m.isVirtualCurrency('XSC'),
          isVirtSC:    m.isVirtualCurrency('SC'),
          isVirtUSD:   m.isVirtualCurrency('USD'),
          trailing:    m.VIRTUAL_SYMBOL_TRAILING,
        }
      })
      results.unit = unit

      // Thousands separators AND TRAILING symbol. Fable ruling 2 (2026-07-26)
      // flipped this from the brief's leading "SC 1,000" to "1,000.00 SC", the
      // form documented by both first-party sources (the currency reference and
      // the official ts-client SDK's symbolAfter: true).
      check('unit: XSC renders 1,000.00 SC', unit.sc1000 === '1,000.00 SC', unit.sc1000)
      check('unit: SC alias matches XSC', unit.scAlias === unit.sc1000,
        `${unit.scAlias} vs ${unit.sc1000}`)
      check('unit: XGC renders 500.00 GC', unit.gc500 === '500.00 GC', unit.gc500)
      check('unit: symbol placement is trailing', unit.trailing === true, String(unit.trailing))

      // B1: narrowSymbol derives "$" from the code, no "US$" prefix.
      check('unit: USD narrow symbol, no US prefix',
        unit.usd === '$1.25', unit.usd)

      // Zero-decimal / high-minimum currency, per the ledger read (R066 TASK 3).
      check('unit: JPY is zero-decimal',
        unit.jpy.includes('1,250') && !unit.jpy.includes('.'), unit.jpy)
      check('unit: JPY renders the exact ledger form, ¥1,250',
        unit.jpy === '¥1,250', unit.jpy)

      // The core rule: the raw code must never be the player-facing symbol.
      for (const [k, v] of Object.entries({ symXSC: unit.symXSC, symSC: unit.symSC })) {
        check(`unit: ${k} resolves to SC not a raw code`, v === 'SC', v)
      }
      check('unit: symXGC resolves to GC', unit.symXGC === 'GC', unit.symXGC)
      check('unit: symUSD resolves to $', unit.symUSD === '$', unit.symUSD)

      check('unit: isVirtualCurrency covers both code forms',
        unit.isVirtXSC === true && unit.isVirtSC === true && unit.isVirtUSD === false,
        JSON.stringify(unit))

      await page.close()
    }

    // ── (B) DOM layer ──────────────────────────────────────────────────────
    for (const code of DOM_CURRENCIES) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      const consoleErrors = []
      page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
      page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

      await page.goto(`${baseUrl}/?mockCurrency=${code}`, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await dismissIntro(page)
      await page.waitForTimeout(200)

      const balance = (await page.locator('[data-testid="hud-balance"]').first().innerText()).trim()
      const bet = (await page.locator('[data-testid="hud-bet"]').first().innerText()).trim()
      const bodyText = await page.locator('body').innerText()

      await page.screenshot({ path: join(SCREENS_DIR, `hud-${code}.png`) })
      results.dom[code] = { balance, bet, consoleErrorCount: consoleErrors.length }

      check(`dom ${code}: no console errors`, consoleErrors.length === 0,
        consoleErrors.slice(0, 3).join(' | '))

      if (VIRTUAL_CODES.includes(code)) {
        const symbol = code.replace(/^X/, '')            // XSC -> SC, XGC -> GC
        check(`dom ${code}: HUD shows the ${symbol} symbol`,
          balance.includes(symbol), balance)
        // The whole rendered page must not contain the raw platform code.
        check(`dom ${code}: raw code never rendered to the player`,
          !new RegExp(`\\b${code}\\b`).test(bodyText),
          `found "${code}" in rendered text`)
      }

      if (code === 'USD') {
        check('dom USD: no US$ prefix anywhere', !/US\$/.test(bodyText), balance)
        check('dom USD: balance carries $', balance.includes('$'), balance)
      }

      if (code === 'JPY') {
        // Zero-decimal: the bet/balance figures must not carry a decimal point.
        const amounts = (balance.match(/[\d.,]+/g) || []).join(' ')
        check('dom JPY: zero-decimal amounts', !/\.\d/.test(amounts), balance)
      }

      await page.close()
    }

    // ── (C) social + SC combination (the EU default) ───────────────────────
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      const consoleErrors = []
      page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
      page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

      await page.goto(`${baseUrl}/?mockCurrency=XSC&social=true`, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await dismissIntro(page)
      await page.waitForTimeout(200)

      await page.screenshot({ path: join(SCREENS_DIR, 'social-sc-hud.png'), fullPage: false })

      const bodyText = await page.locator('body').innerText()
      const balance = (await page.locator('[data-testid="hud-balance"]').first().innerText()).trim()

      // Open the feature menu, the densest concentration of prohibited terms.
      await page.locator('[data-testid="feature-menu-button"]').click().catch(() => {})
      await page.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 10000 }).catch(() => {})
      await page.waitForTimeout(200)
      await page.screenshot({ path: join(SCREENS_DIR, 'social-sc-feature-menu.png') })
      const menuText = await page.locator('[data-testid="feature-menu-cards"]').innerText().catch(() => '')

      const combined = `${bodyText}\n${menuText}`

      // Prohibited-term sweep over VISIBLE text only, with the element that
      // carries each hit, so a finding is actionable rather than just a word.
      // Excludes App.svelte's permanently-mounted hidden .warm-mount duplicate
      // subtree, which would otherwise double-count everything.
      const PROHIBITED = ['bet', 'bets', 'cash', 'money', 'wager', 'gamble',
                          'buy', 'bought', 'purchase', 'deposit', 'withdraw', 'currency', 'credit']
      const termHits = await page.evaluate((terms) => {
        const re = new RegExp(`\\b(${terms.join('|')})\\b`, 'i')
        const out = []
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
        let n
        while ((n = walk.nextNode())) {
          const text = (n.textContent || '').trim()
          if (!text || !re.test(text)) continue
          const el = n.parentElement
          if (!el || el.closest('.warm-mount')) continue
          const cs = getComputedStyle(el)
          const r = el.getBoundingClientRect()
          if (cs.visibility === 'hidden' || cs.display === 'none') continue
          if (parseFloat(cs.opacity) === 0) continue
          if (r.width === 0 || r.height === 0) continue
          out.push({ text: text.slice(0, 80), selector: (el.className || '').toString().split(' ')[0] })
        }
        return out
      }, PROHIBITED)

      results.social = {
        balance,
        consoleErrorCount: consoleErrors.length,
        visibleProhibitedTermHits: termHits,
      }

      // Currency assertions: this script's own subject, and they must pass.
      check('social+SC: SC symbol renders in HUD', balance.includes('SC'), balance)
      check('social+SC: raw XSC code never rendered', !/\bXSC\b/.test(combined), 'XSC leaked')
      check('social+SC: no console errors', consoleErrors.length === 0,
        consoleErrors.slice(0, 3).join(' | '))

      // Social wording is deliberately NOT asserted here and NOT auto-corrected.
      // CLAUDE_PROJECT_INSTRUCTIONS_v6 JOB 9b reserves social wording to Fable:
      // "flagging rather than changing them until Fable rules on wording". These
      // hits are reported as findings for that ruling, and tracked as a separate
      // verdict below so a wording gap can never be mistaken for a currency pass
      // or vice versa.
      results.socialStringFindings = termHits
      results.socialStringsClean = termHits.length === 0

      await page.close()
    }

    await browser.close()
  } finally {
    server.kill()
  }

  results.failures = failures
  results.pass = failures.length === 0
  const outPath = join(OUT_DIR, 'currency_conformance_2026-07-25.json')
  writeFileSync(outPath, JSON.stringify(results, null, 2))

  console.log(JSON.stringify(results, null, 2))

  // Two independent verdicts, deliberately not merged.
  if (failures.length) {
    console.error(`\nCURRENCY CONFORMANCE: FAIL (${failures.length})`)
    for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
    process.exit(1)
  }
  console.log('\nCURRENCY CONFORMANCE: PASS')

  const findings = results.socialStringFindings || []
  if (findings.length) {
    console.warn(`\nSOCIAL STRING FINDINGS: ${findings.length} visible prohibited-term string(s)`)
    console.warn('  Reported, NOT auto-corrected. Wording is Fable\'s ruling (JOB 9b).')
    for (const f of findings) console.warn(`  - "${f.text}"  [.${f.selector}]`)
    console.warn('  These are a submission blocker for stake.us / social distribution.')
  } else {
    console.log('SOCIAL STRINGS: clean')
  }
}

run().catch((err) => { console.error(err); process.exit(1) })
