// rg_enforcement_proof.mjs - R7 / TR-015 runtime proof (2026-07-25).
//
// The unit test proves the MODEL enforces the flags. R5 taught that a correct
// model can still reach a surface that ignores it, so this drives the real
// controls: it asserts the speed button is actually disabled and that the
// autoplay menu actually stops offering counts above the cap.
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

const setFlags = async (flags) => {
  await page.evaluate((f) => window.__testStores.jurisdictionFlags.set(f), flags)
  await page.waitForTimeout(350)
}
const speedState = () => page.evaluate(() => {
  const btns = [...document.querySelectorAll('[aria-label="Cycle speed (Normal / Turbo / Super Turbo)"]')]
  let tier; const u = window.__testStores.speedTier.subscribe(v => tier = v); u && u()
  return { count: btns.length, allDisabled: btns.length > 0 && btns.every(b => b.disabled), tier }
})
// The autoplay trigger is labelled with the translated autoPlay string, and the
// menu is a toggle, so it must be closed before reopening or the second read
// comes back empty and every "does not offer" assertion passes vacuously.
const readAutoMenu = async () => {
  const read = () => page.evaluate(() =>
    [...document.querySelectorAll('.auto-menu-item')].map((e) => e.textContent.trim()))
  const trigger = page.locator('button[aria-label="AUTO"], button[aria-label="AUTOPLAY"], button[aria-label="Autoplay"]')
  const clickLive = async () => {
    const n = await trigger.count()
    for (let i = 0; i < n; i++) {
      const el = trigger.nth(i)
      if (await el.isVisible() && await el.isEnabled()) { await el.click(); return true }
    }
    return false
  }
  if ((await read()).length) { await clickLive(); await page.waitForTimeout(250) } // close if already open
  if (!(await clickLive())) throw new Error('rg proof: no live autoplay trigger found')
  await page.waitForTimeout(350)
  const items = await read()
  if (!items.length) throw new Error('rg proof: autoplay menu opened but offered nothing - refusing to assert on an empty read')
  await clickLive(); await page.waitForTimeout(200)  // leave it closed
  return items
}

const result = { timestamp: new Date().toISOString(), cases: {} }

// No restrictions: turbo must work.
await setFlags({})
await page.evaluate(() => window.__testStores.speedTier.set('normal'))
const live = page.locator('[aria-label="Cycle speed (Normal / Turbo / Super Turbo)"]')
for (let i = 0; i < await live.count(); i++) {
  const el = live.nth(i)
  if (await el.isVisible() && await el.isEnabled()) { await el.click(); break }
}
await page.waitForTimeout(250)
result.cases.unrestricted = { ...(await speedState()), autoplayOffered: await readAutoMenu() }

// Turbo banned outright.
await setFlags({ disabledTurbo: true })
result.cases.turboBanned = { ...(await speedState()) }

// UKGC-shaped: a minimum spin duration implies the fast-play ban.
await setFlags({ minSpinMs: 2500 })
result.cases.minSpin2500 = { ...(await speedState()) }

// Autoplay capped at 25.
await setFlags({ maxAutoplaySpins: 25 })
result.cases.autoplayCapped25 = { autoplayOffered: await readAutoMenu() }

const c = result.cases
result.pass =
  c.unrestricted.tier === 'turbo' && c.unrestricted.allDisabled === false &&
  c.turboBanned.tier === 'normal' && c.turboBanned.allDisabled === true &&
  c.minSpin2500.tier === 'normal' && c.minSpin2500.allDisabled === true &&
  c.unrestricted.autoplayOffered.includes('100') &&
  c.unrestricted.autoplayOffered.includes('∞') &&
  JSON.stringify(c.autoplayCapped25.autoplayOffered.filter((t) => /^[0-9∞]+$/.test(t))) === JSON.stringify(['10', '25'])

writeFileSync(join(OUT, 'rg_enforcement_proof_2026-07-25.json'), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
await browser.close(); dev.kill()
process.exit(result.pass ? 0 : 1)
