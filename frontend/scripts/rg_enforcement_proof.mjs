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

// UKGC-shaped: a minimum round duration implies the fast-play ban.
//
// CORRECTED 2026-08-09. This used to inject `minSpinMs`, which is the name of
// the DERIVED store's field, not the official flag. setFlags writes
// `jurisdictionFlags`, the OFFICIAL contract, where the field is
// `minimumRoundDuration`; the derived store maps one to the other. Injecting the
// derived name therefore set nothing at all, and this proof had been reporting
// pass:false against a game that was behaving correctly.
await setFlags({ minimumRoundDuration: 2500 })
result.cases.minSpin2500 = { ...(await speedState()) }

// AUTOPLAY CAP: THERE IS NO OFFICIAL FLAG FOR IT, and asserting one is what made
// this proof wrong for a second reason.
//
// responsibleGambling.ts states it at the field: "maxAutoplaySpins: no official
// flag at the pin; always Infinity". TR-042 removed the invented flag name this
// case was written against. Injecting `maxAutoplaySpins: 25` into the official
// store does nothing, the cap stays Infinity, and every option is correctly
// offered. The old assertion demanded ['10','25'] and so failed on correct
// behaviour.
//
// The capping LOGIC is still live and still worth holding, so it is asserted
// where it can actually be driven: rgAllowedAutoplayCounts takes an explicit cap
// and is pinned in src/lib/stores/responsibleGambling.test.ts. What is asserted
// HERE is the honest thing this page can observe: with no cap in the contract,
// the full menu is offered.
await setFlags({ maxAutoplaySpins: 25 })
result.cases.autoplayNoOfficialCap = { autoplayOffered: await readAutoMenu() }

// SPACEBAR BAN, INCLUDING THE FOCUSED-BUTTON ROUTE. Added 2026-08-09.
//
// disabledSpacebar was enforced by returning from the keydown handler, which
// bans the KEY and not the BET: a focused <button> is activated by Space by the
// browser itself, so one mouse click on SPIN and every later Space span the
// reels in exactly the markets that ban it. The handler now calls
// preventDefault, and this asserts BOTH routes plus the negative control, since
// a fix that bans the spacebar for everyone would be worse than the defect.
{
  const spinning = () => page.evaluate(() => {
    let v; window.__testStores.isSpinning.subscribe((x) => { v = x })(); return v
  })
  const focusSpin = () => page.evaluate(() => {
    const b = [...document.querySelectorAll('[data-testid="spin-button"]')]
      .filter((x) => x.offsetParent !== null && !x.disabled)
    if (b.length) b[0].focus()
    return document.activeElement?.getAttribute('data-testid') ?? null
  })

  await setFlags({ disabledSpacebar: true })
  await page.keyboard.press('Space'); await page.waitForTimeout(700)
  const unfocused = await spinning()
  const focusedOn = await focusSpin()
  await page.keyboard.press('Space'); await page.waitForTimeout(900)
  const focused = await spinning()

  await setFlags({})
  await page.waitForTimeout(300)
  await page.keyboard.press('Space'); await page.waitForTimeout(900)
  const allowed = await spinning()

  result.cases.spacebarBanned = {
    spunUnfocused: unfocused, focusedElement: focusedOn, spunWhileFocused: focused,
    spunWhenAllowed: allowed,
  }
}

const c = result.cases
result.pass =
  c.unrestricted.tier === 'turbo' && c.unrestricted.allDisabled === false &&
  c.turboBanned.tier === 'normal' && c.turboBanned.allDisabled === true &&
  c.minSpin2500.tier === 'normal' && c.minSpin2500.allDisabled === true &&
  c.unrestricted.autoplayOffered.includes('100') &&
  c.unrestricted.autoplayOffered.includes('∞') &&
  // No official cap flag exists, so the full menu is correct here. The
  // capping logic itself is pinned in responsibleGambling.test.ts.
  c.autoplayNoOfficialCap.autoplayOffered.filter((t) => /^[0-9∞]+$/.test(t)).length >= 4 &&
  // the ban holds by key AND by focused-button activation, and lifts when absent
  c.spacebarBanned.spunUnfocused === false &&
  c.spacebarBanned.focusedElement === 'spin-button' &&
  c.spacebarBanned.spunWhileFocused === false &&
  c.spacebarBanned.spunWhenAllowed === true

writeFileSync(join(OUT, 'rg_enforcement_proof_2026-07-25.json'), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
await browser.close(); dev.kill()
process.exit(result.pass ? 0 : 1)
