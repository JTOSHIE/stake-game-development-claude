// evidence_menu.mjs - capture group: menus. (pre-review, 2026-07-25)
// TR-028: clean boot, intro dismissed, every panel opened by clicking the
// control a player uses. Nothing is opened by setting a store.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const OUT = '/Users/jt/math-sdk/reports/screens/menus-2026-07-25'
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 720 } })
await p.goto('http://localhost:5173/?mock=1', { waitUntil: 'networkidle' })
await p.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
await p.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
await dismissIntro(p)
await p.evaluate(() => window.__testStores.balance.set(1_000_000))
await p.waitForTimeout(600)

const captured = [], notes = {}
const shot = async (n) => { await p.screenshot({ path: `${OUT}/${n}.png` }); captured.push(n); return n }
// Several layout branches render at once with the inactive ones hidden, so always
// drive the control a player could actually press.
const clickLive = async (sel) => {
  const all = p.locator(sel); const n = await all.count()
  for (let i = 0; i < n; i++) { const el = all.nth(i)
    if (await el.isVisible() && await el.isEnabled()) { await el.click(); return true } }
  return false
}

// 1. FEATURES menu, the bet-mode cards.
await clickLive('[data-testid="feature-menu-button"]')
await p.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 10000 })
await p.waitForTimeout(500)
await shot('01-features-menu')
notes['01-features-menu'] = 'opened by clicking FEATURES'
await clickLive('[data-testid="feature-menu-close"]'); await p.waitForTimeout(500)

// 2. HUD menu, audio and session controls.
if (await clickLive('button[aria-label="Menu"]')) {
  await p.waitForTimeout(600); await shot('02-hud-menu')
  notes['02-hud-menu'] = 'opened by clicking the HUD menu control'
  await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(400)
}

// 3. Autoplay menu.
if (await clickLive('button[aria-label="AUTO"], button[aria-label="AUTOPLAY"], button[aria-label="Autoplay"]')) {
  await p.waitForTimeout(600); await shot('03-autoplay-menu')
  notes['03-autoplay-menu'] = 'opened by clicking the autoplay control'
}

// 4. Session panel, reached through the HUD menu as a player does.
// Reload so no earlier menu is left covering the control, then take the real
// route: HUD menu, then its Session item. The testid is open-session-panel; an
// earlier guess at menu-session found nothing and would have been recorded as a
// missing feature rather than a wrong selector.
await p.goto('http://localhost:5173/?mock=1', { waitUntil: 'networkidle' })
await p.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
await dismissIntro(p)
await p.waitForTimeout(600)
await clickLive('button[aria-label="Menu"]')
await p.waitForTimeout(500)
await clickLive('[data-testid="open-session-panel"]')
await p.waitForTimeout(800)
if (await p.locator('[data-testid="session-panel-sheet"]').count()) {
  await shot('04-session-panel'); notes['04-session-panel'] = 'opened via the HUD menu Session item'
} else {
  notes['04-session-panel'] = 'NOT CAPTURED: no clickable route found from the HUD menu in this build'
}

writeFileSync(`${OUT}/PROVENANCE.md`,
`# Menus, provenance\n\n- captured: 2026-07-25\n- viewport: 1280x720\n` +
`- clean boot, intro dismissed, every panel opened by CLICKING (TR-028)\n\n## Route per capture\n\n` +
Object.entries(notes).map(([k, v]) => `- \`${k}\` - ${v}`).join('\n') +
`\n\n## Files\n\n` + captured.map((c) => `- \`${c}.png\``).join('\n') + '\n')
console.log(JSON.stringify(notes, null, 1))
await b.close()
