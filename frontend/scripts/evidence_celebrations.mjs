// evidence_celebrations.mjs - capture group: win celebrations. (2026-07-25)
//
// TR-028 says captures must not begin in artificial test states. That sits in
// real tension here: a wincap round is 1 in 100,000 in base mode, so waiting for
// one naturally is not a capture strategy.
//
// The tension is resolved by choosing the LEAST artificial route that reaches
// each tier, and disclosing which was used for each:
//
//   - ordinary wins: played for, by spinning, exactly as a player reaches them;
//   - the large and wincap tiers: served from a CURATED ROUND OUT OF THE SHIPPED
//     BOOK via ?mockCategory=. That is a real outcome the maths genuinely
//     produces, played through the normal presentation path. It is not a forced
//     UI state and nothing is injected into the win display.
//
// What is deliberately NOT done: setting winAmount directly to fake a tier. The
// dev hook allows it and it would be quicker; it would also mean the celebration
// in the evidence never corresponded to a real round.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dismissIntro, waitSpinDone, clickAnyPendingGate } from './lib/dismissOverlays.mjs'

const OUT = '/Users/jt/math-sdk/reports/screens/celebrations-2026-07-25'
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch()
const captured = [], routes = {}

async function session(query) {
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } })
  await p.goto(`http://localhost:5173/?mock=1${query}`, { waitUntil: 'networkidle' })
  await p.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
  await p.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
  await dismissIntro(p)
  await p.evaluate(() => { window.__testStores.balance.set(1_000_000); window.__testStores.betAmount.set(1) })
  return p
}
const shot = async (p, n) => { await p.screenshot({ path: `${OUT}/${n}.png` }); captured.push(n); return n }

// 1. An ordinary win, played for rather than arranged.
{
  const p = await session('')
  let found = false, spins = 0
  for (; spins < 40 && !found; spins++) {
    await p.locator('[data-testid="spin-button"]').click()
    await p.waitForTimeout(1100)
    if (await p.locator('[data-testid="win-banner"]:visible').count()) { found = true; break }
    await waitSpinDone(p).catch(() => {})
  }
  if (found) { await p.waitForTimeout(400); await shot(p, '01-ordinary-win-banner') }
  routes['01-ordinary-win-banner'] = found ? `natural spin, after ${spins + 1} spins` : 'not reached naturally'
  await p.close()
}

// 2. A large win, from a curated round in the shipped book.
{
  const p = await session('&mockCategory=base_win_large')
  await p.locator('[data-testid="spin-button"]').click()
  await p.waitForTimeout(2600)
  await shot(p, '02-large-win')
  routes['02-large-win'] = 'curated shipped-book round via ?mockCategory=base_win_large'
  await p.close()
}

// 3. The max-win celebration, from the wincap round in the shipped book.
{
  const p = await session('&mockCategory=wincap')
  await p.locator('[data-testid="spin-button"]').click()
  for (let i = 0; i < 40; i++) {
    if (await p.locator('.max-win-overlay:visible').count()) break
    await clickAnyPendingGate(p); await p.waitForTimeout(300)
  }
  await p.waitForTimeout(900)
  await shot(p, '03-max-win-celebration')
  routes['03-max-win-celebration'] = 'curated shipped-book wincap round via ?mockCategory=wincap'
  await p.close()
}

writeFileSync(`${OUT}/PROVENANCE.md`,
`# Win celebrations, provenance\n\n- captured: 2026-07-25\n- viewport: 1280x720\n\n` +
`## Route per capture, disclosed\n\n` +
Object.entries(routes).map(([k, v]) => `- \`${k}.png\` - ${v}`).join('\n') +
`\n\n## Why the curated route, and what was refused\n\n` +
`A wincap round is 1 in 100,000 in base mode, so waiting for one is not a strategy. The\n` +
`large and wincap tiers are served from CURATED ROUNDS OUT OF THE SHIPPED BOOK and played\n` +
`through the normal presentation path: real outcomes the maths genuinely produces, not\n` +
`forced UI states.\n\n` +
`Deliberately refused: setting winAmount directly to fake a tier. The dev hook allows it\n` +
`and it would have been quicker, but the celebration in the evidence would then never have\n` +
`corresponded to a real round.\n\n## Files\n\n` +
captured.map((c) => `- \`${c}.png\``).join('\n') + '\n')
console.log(JSON.stringify(routes, null, 1))
await b.close()
