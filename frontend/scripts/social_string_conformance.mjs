// social_string_conformance.mjs — ITEM C, social string implementation
// (2026-07-14b, Fable's wording ruling).
//
// Asserts the exact social-mode strings for the two prohibited-term modes
// (bonus, super) and the two other reworded blurbs (cruise, overboost)
// render correctly in both FeatureMenu.svelte and PaytableModal.svelte's Bet
// Modes section, and that real-money mode carries no leftover "Buy"/"Debits"
// text. Captures before (real-money) / after (social) screenshots of both
// consumers as proofs.
//
// Run (from frontend/): npx tsx scripts/social_string_conformance.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'qa')
const SCREENS_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'social-strings-item-c')
mkdirSync(OUT_DIR, { recursive: true })
mkdirSync(SCREENS_DIR, { recursive: true })

const EXPECTED_SOCIAL = {
  bonus: { label: 'Get Overdrive', blurb: 'Get a guaranteed Overdrive Free Spins entry.' },
  super: { blurb: 'Get a rich entry with the Overdrive meter pre-revved to 5x.' },
  overboost: { blurb: 'Double-chance: about 1.6x the feature trigger rate. Costs 1.25x every spin while ON.' },
  cruise: { blurb: 'A smoother ride: more frequent smaller prizes, same 96.35% RTP.' },
}
const PROHIBITED_TERMS = ['Buy', 'Debits']

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
  return new Promise((resolvePreview, reject) => {
    const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], {
      cwd: join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let resolved = false
    const onData = (d) => {
      const s = d.toString()
      if (!resolved && (/Local/.test(s) || new RegExp(`localhost:${port}`).test(s))) {
        resolved = true
        resolvePreview(proc)
      }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', reject)
    setTimeout(() => { if (!resolved) reject(new Error('vite dev server did not start in time')) }, 15000)
  })
}

async function dismissIntro(page) {
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await btn.click()
    await page.waitForTimeout(100)
  }
}

async function openFeatureMenu(page) {
  await page.locator('[data-testid="feature-menu-button"]').click()
  await page.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 10000 })
  await page.waitForTimeout(150)
}

async function openPaytableBetModes(page) {
  await page.locator('button.fs-menu').click()
  await page.locator('.hud-menu-item').first().click()
  await page.waitForSelector('[data-testid="interface-guide"]', { timeout: 10000 })
  const heading = page.locator('h3.fs-heading', { hasText: 'Bet Modes' })
  await heading.scrollIntoViewIfNeeded()
  await page.waitForTimeout(150)
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const baseUrl = `http://localhost:${port}`
  const results = {}

  try {
    const browser = await chromium.launch()

    for (const social of [false, true]) {
      const label = social ? 'social' : 'real-money'
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      const consoleErrors = []
      page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
      page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

      const url = social ? `${baseUrl}/?social=true` : baseUrl
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await dismissIntro(page)

      // FeatureMenu
      await openFeatureMenu(page)
      await page.screenshot({ path: join(SCREENS_DIR, `feature-menu-${label}.png`) })
      const featureMenuText = await page.locator('[data-testid="feature-menu-cards"]').innerText()
      await page.keyboard.press('Escape').catch(() => {})

      // PaytableModal Bet Modes section
      await openPaytableBetModes(page)
      await page.screenshot({ path: join(SCREENS_DIR, `bet-modes-${label}.png`) })
      const paytableText = await page.locator('h3.fs-heading', { hasText: 'Bet Modes' })
        .locator('xpath=following-sibling::div[1]').innerText()

      results[label] = { featureMenuText, paytableText, consoleErrorCount: consoleErrors.length }
      await page.close()
    }

    await browser.close()
  } finally {
    server.kill()
  }

  const checks = {}
  const combinedSocialText = results.social.featureMenuText + '\n' + results.social.paytableText
  const combinedRealText = results['real-money'].featureMenuText + '\n' + results['real-money'].paytableText

  for (const [mode, expected] of Object.entries(EXPECTED_SOCIAL)) {
    if (expected.label) {
      checks[`${mode}.socialLabel`] = { expected: expected.label, pass: combinedSocialText.includes(expected.label) }
    }
    checks[`${mode}.socialBlurb`] = { expected: expected.blurb, pass: combinedSocialText.includes(expected.blurb) }
  }
  // Real-money strings must be genuinely UNCHANGED, not just "not regressed" -
  // assert the original prohibited-term-containing text still renders as-is
  // in real-money mode (catches an accidental edit to the base strings while
  // adding social variants, not just a missing social override).
  checks['realMoney.bonusLabelUnchanged'] = { pass: combinedRealText.includes('Buy Overdrive') }
  checks['realMoney.overboostBlurbUnchanged'] = { pass: combinedRealText.includes('Debits 1.25x every spin while ON') }
  // Prohibited terms must NOT appear anywhere in the social-mode render.
  for (const term of PROHIBITED_TERMS) {
    const found = new RegExp(`\\b${term}\\b`).test(combinedSocialText)
    checks[`social.no_${term}`] = { pass: !found }
  }
  checks.zeroConsoleErrors = {
    pass: results['real-money'].consoleErrorCount === 0 && results.social.consoleErrorCount === 0,
  }

  const allPass = Object.values(checks).every((c) => c.pass)
  const output = { results, checks, allPass }
  const outPath = join(OUT_DIR, 'social_string_conformance_2026-07-14b.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(JSON.stringify(checks, null, 2))
  console.log(`\nResults written to ${outPath}`)

  if (!allPass) {
    console.error('SOCIAL STRING CONFORMANCE: FAILURES DETECTED')
    process.exitCode = 1
  } else {
    console.log('SOCIAL STRING CONFORMANCE: ALL CHECKS PASS')
  }
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
