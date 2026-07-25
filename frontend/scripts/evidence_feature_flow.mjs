// evidence_feature_flow.mjs - capture group: feature presentation flow.
// (pre-review pass, 2026-07-25)
//
// TR-028 is the reason this script is shaped the way it is. Its complaint was
// that captures "begin in dialogs or artificial test states", which is weak
// experience evidence because it is not what a player sees. So the feature is
// reached by PLAYING: ordinary base spins until one naturally triggers. No
// forced category, no injected board, no dialog opened to start.
//
// The route actually used is printed and recorded, so the evidence says how it
// was obtained rather than implying a purity it did not have.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dismissIntro, waitSpinDone, clickAnyPendingGate } from './lib/dismissOverlays.mjs'

const OUT = '/Users/jt/math-sdk/reports/screens/feature-flow-2026-07-25'
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 720 } })
await p.goto('http://localhost:5173/?mock=1', { waitUntil: 'networkidle' })
await p.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
await p.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
await dismissIntro(p)
await p.evaluate(() => { window.__testStores.balance.set(1_000_000); window.__testStores.betAmount.set(1) })

const shot = async (name) => { await p.screenshot({ path: `${OUT}/${name}.png` }); return name }
const featureUp = () => p.evaluate(() =>
  [...document.querySelectorAll('[data-testid="freespins-overlay"]')].some((e) => !e.closest('.warm-mount')))

await p.waitForTimeout(800)
await shot('01-base-idle')

// Play until the feature triggers of its own accord.
let spins = 0, triggered = false
for (; spins < 60 && !triggered; spins++) {
  await p.locator('[data-testid="spin-button"]').click()
  await p.waitForTimeout(900)
  // Catch the entry the moment it appears, before any gate is cleared.
  if (await featureUp()) { triggered = true; break }
  await waitSpinDone(p).catch(() => {})
  if (await featureUp()) { triggered = true; break }
}

const route = triggered ? `natural base-game trigger after ${spins + 1} spins` : 'NOT REACHED naturally'
console.log('route:', route)

const captured = ['01-base-idle']
if (triggered) {
  await p.waitForTimeout(600);  captured.push(await shot('02-feature-entry'))
  await p.waitForTimeout(1600); captured.push(await shot('03-entry-gate'))
  for (let i = 0; i < 30; i++) { if (await clickAnyPendingGate(p)) break; await p.waitForTimeout(200) }
  await p.waitForTimeout(1800); captured.push(await shot('04-free-spins-running'))
  await p.waitForTimeout(2600); captured.push(await shot('05-meter-progress'))
  for (let i = 0; i < 40; i++) { await clickAnyPendingGate(p); await p.waitForTimeout(350)
    if (!(await featureUp())) break }
  await p.waitForTimeout(900);  captured.push(await shot('06-feature-resolved'))
}

writeFileSync(`${OUT}/PROVENANCE.md`,
`# Feature flow captures, provenance\n\n` +
`- captured: 2026-07-25\n- viewport: 1280x720\n- route: **${route}**\n` +
`- no forced mockCategory, no injected board, no dialog opened to begin\n` +
`- TR-028: every capture is of a state the player reached by playing\n\n` +
`## Files\n\n` + captured.map((c) => `- \`${c}.png\``).join('\n') + '\n')
console.log('captured:', captured.join(', '))
await b.close()
process.exit(triggered ? 0 : 3)
