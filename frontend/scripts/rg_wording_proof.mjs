// rg_wording_proof.mjs - RG wording, Fable's English masters (2026-07-25).
//
// Two claims, both behavioural rather than cosmetic:
//   1. The panel and the reality check render the masters, and render a real
//      translation in a non-English locale rather than falling back to English.
//   2. "Stop playing" HALTS AUTOPLAY and returns to idle. A reality check that
//      only dismisses itself while autoplay keeps spinning is a notification,
//      not a control.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { qaTmpDir } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = qaTmpDir()
mkdirSync(OUT, { recursive: true })

const port = await new Promise((res, rej) => {
  const s = createServer(); s.on('error', rej)
  s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)) })
})
const dev = spawn('npx', ['vite', '--port', String(port), '--strictPort'], { cwd: join(__dirname, '..'), stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 6000))
const browser = await chromium.launch()

const openPanel = async (page) => {
  await page.evaluate(async () => {
    const m = await import('/src/lib/stores/responsibleGambling.ts')
    m.showSessionPanel.set(true)
  })
  await page.waitForSelector('[data-testid="session-panel-sheet"]', { timeout: 10000 })
  return page.evaluate(() =>
    [...document.querySelectorAll('[data-testid="session-panel-sheet"] .sp-row span:first-child')]
      .map((e) => e.textContent.trim()))
}

const result = { timestamp: new Date().toISOString(), cases: {} }

// English: the five master row labels, in order.
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(`http://localhost:${port}/?mock=1`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await dismissIntro(page)
  result.cases.englishRows = await openPanel(page)
  await page.close()
}

// German: must be genuinely translated, not English fallback.
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(`http://localhost:${port}/?mock=1&lang=de`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await dismissIntro(page)
  result.cases.germanRows = await openPanel(page)
  await page.close()
}

// Reality check: body interpolates, and Stop halts autoplay.
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(`http://localhost:${port}/?mock=1`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await dismissIntro(page)
  // Turn reality checks on and put autoplay in flight.
  await page.evaluate(() => {
    window.__testStores.jurisdictionFlags.set({ realityCheckMs: 1 })
    window.__testStores.isAutoPlay.set(true)
    window.__testStores.autoPlayCount.set(25)
  })
  await page.waitForSelector('[data-testid="reality-check-body"]', { timeout: 10000 })
  const body = (await page.locator('[data-testid="reality-check-body"]').textContent()).trim()
  const read = () => page.evaluate(() => {
    const rd = (s) => { let v; const u = s.subscribe((x) => v = x); u && u(); return v }
    return { auto: rd(window.__testStores.isAutoPlay), count: rd(window.__testStores.autoPlayCount) }
  })
  const before = await read()
  await page.locator('[data-testid="rc-stop"]').click()
  await page.waitForTimeout(400)
  const after = await read()
  result.cases.realityCheck = {
    body,
    interpolated: !body.includes('{time}') && !body.includes('{amount}') && /\d\d:\d\d:\d\d/.test(body),
    autoplayBefore: before, autoplayAfter: after,
  }
  await page.close()
}

const c = result.cases
const EN = ['Time played', 'Spins', 'Total wagered', 'Total won', 'Net result']
result.pass =
  JSON.stringify(c.englishRows) === JSON.stringify(EN) &&
  c.germanRows.length === 5 &&
  c.germanRows.every((g, i) => g !== EN[i]) &&      // genuinely translated, not fallback
  c.realityCheck.interpolated === true &&
  c.realityCheck.autoplayBefore.auto === true &&
  c.realityCheck.autoplayAfter.auto === false &&
  c.realityCheck.autoplayAfter.count === 0

writeFileSync(join(OUT, 'rg_wording_proof_2026-07-25.json'), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
await browser.close(); dev.kill()
process.exit(result.pass ? 0 : 1)
