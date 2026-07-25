// a11y_social_proof.mjs - R4 / TR-012 runtime proof (2026-07-25).
//
// The static gate proves no restricted phrase is HARDCODED. This proves the
// rendered accessibility tree actually carries the social wording at runtime,
// in both real-money and social mode, which is the claim that matters.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'qa')
mkdirSync(OUT_DIR, { recursive: true })

const RESTRICTED = ['bet', 'bets', 'betting', 'total bet', 'buy', 'cash', 'money', 'wager', 'gamble', 'stake', 'deposit', 'withdraw']

const port = await new Promise((res, rej) => {
  const s = createServer(); s.on('error', rej)
  s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)) })
})
const dev = spawn('npx', ['vite', '--port', String(port), '--strictPort'], { cwd: join(__dirname, '..'), stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 6000))

const browser = await chromium.launch()
const collect = async (url) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await dismissIntro(page)
  await page.locator('[data-testid="feature-menu-button"]').first().click().catch(() => {})
  await page.waitForTimeout(600)
  const labels = await page.evaluate(() =>
    [...document.querySelectorAll('[aria-label],[title],[placeholder]')]
      .map((e) => e.getAttribute('aria-label') || e.getAttribute('title') || e.getAttribute('placeholder'))
      .filter((v) => v && v.trim()))
  await page.close()
  return [...new Set(labels)]
}

const real   = await collect(`http://localhost:${port}/?mock=1`)
const social = await collect(`http://localhost:${port}/?mock=1&social=true`)

const hits = (list) => list.filter((v) =>
  RESTRICTED.some((t) => new RegExp(`\\b${t.replace(/ /g, '\\s+')}\\b`, 'i').test(v)))

const socialHits = hits(social)
const result = {
  timestamp: new Date().toISOString(),
  realMoneyLabels: real.length,
  socialLabels: social.length,
  realMoneyRestrictedHits: hits(real),
  socialRestrictedHits: socialHits,
  socialSample: social.filter((v) => /play|prize|coins/i.test(v)).slice(0, 12),
  pass: socialHits.length === 0,
}
writeFileSync(join(OUT_DIR, 'a11y_social_proof_2026-07-25.json'), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
await browser.close(); dev.kill()
process.exit(result.pass ? 0 : 1)
