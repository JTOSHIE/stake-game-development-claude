// bet_ladder_proof.mjs - R5 / TR-013 runtime proof (2026-07-25).
// The unit test pins the model. This proves both SURFACES are wired to it, by
// injecting an authenticated ladder and clicking the real controls.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', '..', 'reports', 'qa')
mkdirSync(OUT, { recursive: true })

const JPY_LADDER = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]

const port = await new Promise((res, rej) => {
  const s = createServer(); s.on('error', rej)
  s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)) })
})
const dev = spawn('npx', ['vite', '--port', String(port), '--strictPort'], { cwd: join(__dirname, '..'), stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 6000))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
await page.goto(`http://localhost:${port}/?mock=1`, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
await dismissIntro(page)

// Several layout branches render at once with the inactive ones hidden or
// disabled, so always drive the control a player could actually press.
const clickLive = async (selector) => {
  const all = page.locator(selector)
  const n = await all.count()
  for (let i = 0; i < n; i++) {
    const el = all.nth(i)
    if (await el.isVisible() && await el.isEnabled()) { await el.click(); return true }
  }
  throw new Error(`no visible, enabled element for ${selector}`)
}
const bet = () => page.evaluate(() => { let v; const u = window.__testStores.betAmount.subscribe(x => v = x); u && u(); return v })
// Authenticate with a ladder that shares NO value with the hardcoded one.
await page.evaluate((lv) => {
  window.__testStores.balance.set(1_000_000)
  window.__testStores.rgsBetLevels.set(lv)
}, JPY_LADDER)
await page.waitForTimeout(400)

const steps = {}
steps.afterLadderApplied = await bet()          // snap should land on a real level
// HUD surface
await clickLive('[aria-label="Increase bet"]')
await page.waitForTimeout(200); steps.hudAfterPlus = await bet()
await clickLive('[aria-label="Decrease bet"]')
await page.waitForTimeout(200); steps.hudAfterMinus = await bet()

// FEATURES menu surface - the one that was broken
await page.locator('[data-testid="feature-menu-button"]').first().click()
await page.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 10000 })
await clickLive('.fm-step[aria-label="Increase bet"]')
await page.waitForTimeout(200); steps.featureMenuAfterPlus = await bet()
await clickLive('.fm-step[aria-label="Decrease bet"]')
await page.waitForTimeout(200); steps.featureMenuAfterMinus = await bet()

const onLadder = (v) => JPY_LADDER.includes(v)
const result = {
  timestamp: new Date().toISOString(),
  authenticatedLadder: JPY_LADDER,
  steps,
  everyValueOnAuthenticatedLadder: Object.values(steps).every(onLadder),
  hudStepsUp: steps.hudAfterPlus > steps.afterLadderApplied,
  featureMenuStepsUp: steps.featureMenuAfterPlus > steps.hudAfterMinus,
  neverCollapsedToHardcodedMinimum: !Object.values(steps).includes(0.10),
}
result.pass = result.everyValueOnAuthenticatedLadder && result.hudStepsUp
           && result.featureMenuStepsUp && result.neverCollapsedToHardcodedMinimum
writeFileSync(join(OUT, 'bet_ladder_proof_2026-07-25.json'), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
await browser.close(); dev.kill()
process.exit(result.pass ? 0 : 1)
