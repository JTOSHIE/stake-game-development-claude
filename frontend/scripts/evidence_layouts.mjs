// evidence_layouts.mjs - capture group: layouts. (pre-review pass, 2026-07-25)
// Every capture begins from a clean boot with the intro dismissed and NO dialog
// open, per TR-028: a capture that starts inside a dialog is weak experience
// evidence because it is not what a player sees.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { dismissIntro } from './lib/dismissOverlays.mjs'
const OUT = '/Users/jt/math-sdk/reports/screens/layouts-2026-07-25'
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch()
const VIEWPORTS = {
  'desktop-1280x720':  { width: 1280, height: 720 },
  'desktop-1920x1080': { width: 1920, height: 1080 },
  'landscape-compact': { width: 960,  height: 480 },
  'portrait-430x932':  { width: 430,  height: 932 },
  'portrait-390x844':  { width: 390,  height: 844 },
  'popout-400x225':    { width: 400,  height: 225 },
}
for (const [name, vp] of Object.entries(VIEWPORTS)) {
  const p = await b.newPage({ viewport: vp })
  await p.goto('http://localhost:5173/?mock=1', { waitUntil: 'networkidle' })
  await p.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
  await dismissIntro(p)
  await p.waitForTimeout(1400)
  const dialogs = await p.locator('[role="dialog"]:visible').count()
  await p.screenshot({ path: `${OUT}/${name}.png` })
  console.log(`${name.padEnd(20)} ${vp.width}x${vp.height}  open dialogs: ${dialogs}`)
  await p.close()
}
await b.close()
