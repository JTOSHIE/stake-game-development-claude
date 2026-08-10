// modal_safety_proof.mjs - R8 / TR-016 runtime proof (2026-07-25).
// The claim is behavioural: pressing SPACE must not spin the reels underneath a
// blocking surface. Asserted against isSpinning, driving the real controls.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { dismissIntro, waitSpinDone } from './lib/dismissOverlays.mjs'
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
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
await page.goto(`http://localhost:${port}/?mock=1`, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
await dismissIntro(page)
await page.evaluate(() => { window.__testStores.balance.set(1_000_000); window.__testStores.betAmount.set(1) })

const spinning = () => page.evaluate(() => {
  let v; const u = window.__testStores.isSpinning.subscribe(x => v = x); u && u(); return v
})
const modals = () => page.evaluate(async () => {
  const m = await import('/src/lib/stores/modalGuard.ts')
  let v; const u = m.openModalIds.subscribe(x => v = x); u && u(); return v
})
const pressSpace = async () => { await page.keyboard.press('Space'); await page.waitForTimeout(700) }

const result = { timestamp: new Date().toISOString(), cases: {} }

// Control: with nothing open, SPACE must still spin. A guard that blocks
// everything would pass the negative tests while breaking the game.
await pressSpace()
result.cases.nothingOpen = { modals: await modals(), spun: await spinning() }
await waitSpinDone(page)
await page.waitForTimeout(600)

// FEATURES menu open.
await page.locator('[data-testid="feature-menu-button"]').first().click()
await page.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 10000 })
await pressSpace()
result.cases.featureMenuOpen = { modals: await modals(), spun: await spinning() }

// Buy confirm dialog open - the surface App.svelte could never see.
await page.locator('[data-testid="activate-bonus"]').click()
await page.waitForSelector('[data-testid="buy-confirm"]', { timeout: 10000 })
await pressSpace()
result.cases.buyConfirmOpen = { modals: await modals(), spun: await spinning() }

const c = result.cases
result.pass =
  c.nothingOpen.spun === true && c.nothingOpen.modals.length === 0 &&
  c.featureMenuOpen.spun === false && c.featureMenuOpen.modals.includes('feature-menu') &&
  c.buyConfirmOpen.spun === false && c.buyConfirmOpen.modals.includes('buy-confirm')

writeFileSync(join(OUT, 'modal_safety_proof_2026-07-25.json'), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
await browser.close(); dev.kill()
process.exit(result.pass ? 0 : 1)
