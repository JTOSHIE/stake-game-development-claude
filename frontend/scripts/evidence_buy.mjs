// evidence_buy.mjs - capture group: buy dialogs. (pre-review, 2026-07-25)
//
// This group is not merely stale art: it predates the per-tier affordability fix
// (R8/TR-016), where canBuyBonus checked bet x 100 for EVERY tier and so enabled
// CONFIRM on the 400x NITRO card beside a correctly displayed 400x price.
//
// So the captures deliberately include the boundary state that proves the fix:
// a balance that affords Buy Overdrive (100x) but NOT NITRO (400x). Getting that
// wrong is invisible in a screenshot of a working case, which is why the case is
// chosen rather than incidental.
//
// TR-028: clean boot, dismissed intro, every dialog reached by clicking.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const OUT = '/Users/jt/math-sdk/reports/screens/buy-dialogs-2026-07-25'
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 720 } })
await p.goto('http://localhost:5173/?mock=1', { waitUntil: 'networkidle' })
await p.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
await p.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
await dismissIntro(p)

const setWallet = async (bal, bet = 1) =>
  p.evaluate(([b2, b3]) => { window.__testStores.balance.set(b2); window.__testStores.betAmount.set(b3) }, [bal, bet])
const openMenu = async () => {
  const open = await p.locator('[data-testid="feature-menu-cards"]').count()
  if (!open) { await p.locator('[data-testid="feature-menu-button"]').first().click()
    await p.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 10000 }) }
  await p.waitForTimeout(450)
}
const shot = async (n) => { await p.screenshot({ path: `${OUT}/${n}.png` }); return n }
const enabled = async (id) => p.locator(`[data-testid="${id}"]`).isEnabled().catch(() => null)

const captured = []
const record = async (n) => captured.push(await shot(n))

// 1. Everything affordable.
await setWallet(1_000_000); await openMenu()
const richBonus = await enabled('activate-bonus'), richSuper = await enabled('activate-super')
await record('01-feature-menu-all-affordable')

// 2. THE BOUNDARY. $150 at $1 affords 100x (=$100) but not 400x (=$400).
await setWallet(150); await p.waitForTimeout(500)
const midBonus = await enabled('activate-bonus'), midSuper = await enabled('activate-super')
await record('02-affordability-boundary-150')

// 3. The confirm dialog for the affordable tier, reached by clicking.
await p.locator('[data-testid="activate-bonus"]').click()
await p.waitForSelector('[data-testid="buy-confirm"]', { timeout: 10000 })
await p.waitForTimeout(500)
await record('03-buy-confirm-bonus-100x')
// The buy dialog does not close on Escape; its backdrop keeps intercepting
// pointer events, so the next click times out. Dismiss it the way a player
// does, with its own cancel control.
await p.locator('.buy-cancel').click()
await p.waitForTimeout(600)

// 4. NITRO confirm, with a wallet that affords it.
await setWallet(1_000_000); await openMenu()
await p.locator('[data-testid="activate-super"]').click()
await p.waitForSelector('[data-testid="buy-confirm"]', { timeout: 10000 })
await p.waitForTimeout(500)
await record('04-buy-confirm-nitro-400x')

const proof = {
  richBonusEnabled: richBonus, richSuperEnabled: richSuper,
  boundaryBonusEnabled: midBonus, boundarySuperEnabled: midSuper,
  perTierAffordabilityProven: richBonus === true && richSuper === true && midBonus === true && midSuper === false,
}
console.log(JSON.stringify(proof, null, 1))
writeFileSync(`${OUT}/PROVENANCE.md`,
`# Buy dialogs, provenance\n\n- captured: 2026-07-25\n- viewport: 1280x720\n` +
`- clean boot, intro dismissed, every dialog reached by clicking (TR-028)\n\n` +
`## Per-tier affordability (R8/TR-016) proven at the boundary\n\n` +
`Balance $150 at a $1 bet affords Buy Overdrive (100x = $100) but not NITRO (400x = $400).\n\n` +
`| State | Buy Overdrive | NITRO |\n|---|---|---|\n` +
`| balance $1,000,000 | ${richBonus ? 'enabled' : 'disabled'} | ${richSuper ? 'enabled' : 'disabled'} |\n` +
`| balance $150 | ${midBonus ? 'enabled' : 'disabled'} | ${midSuper ? 'enabled' : 'disabled'} |\n\n` +
`**Per-tier affordability proven: ${proof.perTierAffordabilityProven ? 'YES' : 'NO'}.** Before R8, the\n` +
`400x tier was gated on a bet x 100 check and would have been enabled in the second row.\n\n` +
`## Files\n\n` + captured.map((c) => `- \`${c}.png\``).join('\n') + '\n')
await b.close()
process.exit(proof.perTierAffordabilityProven ? 0 : 5)
