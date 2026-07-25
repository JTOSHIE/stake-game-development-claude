// evidence_rules.mjs - capture group: rules and paytable. (pre-review, 2026-07-25)
//
// The highest-value group: the platform requires per-mode cost, RTP and max win
// to be displayed to the player in-game, along with all symbol pays, special
// values, feature access descriptions and a UI button guide. A reviewer looks
// for these directly.
//
// TR-028 compliance: the run starts from a clean boot and the paytable is opened
// by CLICKING the control a player uses, not by setting its store. The dialog is
// the subject here, so being inside it is correct; arriving there by a shortcut
// would not be.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const OUT = '/Users/jt/math-sdk/reports/screens/rules-paytable-2026-07-25'
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 720 } })
await p.goto('http://localhost:5173/?mock=1', { waitUntil: 'networkidle' })
await p.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
await dismissIntro(p)
await p.waitForTimeout(700)

// Open as a player does: FEATURES menu, then its bet-modes info control.
await p.locator('[data-testid="feature-menu-button"]').first().click()
await p.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 10000 })
await p.locator('[data-testid="open-bet-modes-info"]').click()
await p.waitForTimeout(900)

const headings = await p.evaluate(() =>
  [...document.querySelectorAll('.fs-pt-title, .fs-heading')].map((e) => e.textContent.trim()))
console.log('sections found:', headings.join(' | '))

const captured = []
const shotSection = async (idx, label) => {
  await p.evaluate((i) => {
    const hs = [...document.querySelectorAll('.fs-pt-title, .fs-heading')]
    hs[i]?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, idx)
  await p.waitForTimeout(450)
  const name = `${String(captured.length + 1).padStart(2, '0')}-${label}`
  await p.screenshot({ path: `${OUT}/${name}.png` })
  captured.push(name)
  return name
}
for (let i = 0; i < headings.length; i++) {
  const slug = headings[i].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
  await shotSection(i, slug || `section-${i}`)
}

// Assert the compliance content is actually present, rather than assuming a
// screenshot of a section proves the section says the right thing.
// Read the text from the element that actually CONTAINS the headings, found by
// walking up from one of them. An earlier version guessed at a container class
// and matched a different dialog entirely, so every assertion failed while the
// content was plainly on screen. Deriving the container from the headings
// cannot miss it.
const body = await p.evaluate(() => {
  const h = [...document.querySelectorAll('.fs-pt-title, .fs-heading')][0]
  let el = h
  for (let i = 0; i < 6 && el?.parentElement; i++) el = el.parentElement
  return (el?.innerText || document.body.innerText || '')
})
const checks = {
  showsRtp:        /96\.35/.test(body),
  showsMaxWin:     /5,?000\s*[x×]/i.test(body),
  showsModeCosts:  /100\s*[x×]/.test(body) && /400\s*[x×]/.test(body) && /1\.25\s*[x×]/.test(body),
  showsInterfaceGuide: /interface guide/i.test(body),
  showsResponsiblePlay: /responsible/i.test(body),
}
console.log('content assertions:', JSON.stringify(checks, null, 1))

writeFileSync(`${OUT}/PROVENANCE.md`,
`# Rules and paytable captures, provenance\n\n- captured: 2026-07-25\n- viewport: 1280x720\n` +
`- opened by clicking FEATURES then the bet-modes info control, as a player does\n` +
`- clean boot, intro dismissed, no forced state\n\n## Content assertions\n\n` +
Object.entries(checks).map(([k, v]) => `- ${v ? 'PASS' : 'FAIL'} ${k}`).join('\n') +
`\n\n## Files\n\n` + captured.map((c) => `- \`${c}.png\``).join('\n') + '\n')
await b.close()
process.exit(Object.values(checks).every(Boolean) ? 0 : 4)
