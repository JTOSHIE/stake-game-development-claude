// anticipation_proof.mjs - scatter anticipation ship proof (2026-07-25).
//
// The unit test proves the MODEL. This proves the SEQUENCE actually plays in a
// browser, on real curated trigger rounds, and captures the beats as evidence.
//
// It records the escalation ladder by subscribing to the store for the whole
// spin, so the assertion is against what the game really did rather than
// against a screenshot taken at a hopeful moment.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { evidenceDir, announceEvidenceMode } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = evidenceDir('reports', 'qa')
const SHOTS = evidenceDir('reports', 'screens', 'scatter-anticipation')
announceEvidenceMode('anticipation_proof')

const port = await new Promise((res, rej) => {
  const s = createServer(); s.on('error', rej)
  s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)) })
})
const dev = spawn('npx', ['vite', '--port', String(port), '--strictPort'], { cwd: join(__dirname, '..'), stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 6000))
const browser = await chromium.launch()

async function runCase(category, { reducedMotion = false } = {}) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  })
  await page.goto(`http://localhost:${port}/?mock=1`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
  await dismissIntro(page)
  await page.evaluate(() => window.__testStores.balance.set(1_000_000))

  // Record every level the gauge passes through, with timings.
  await page.evaluate(async () => {
    const m = await import('/src/lib/stores/scatterEscalation.ts')
    window.__ladder = []
    const t0 = performance.now()
    window.__unsub = m.scatterEscalation.subscribe((v) => {
      const last = window.__ladder[window.__ladder.length - 1]
      if (!last || last.level !== v) window.__ladder.push({ level: v, atMs: Math.round(performance.now() - t0) })
    })
  })

  // Drive the choreography with an EXACT board. The per-reel scatter placements
  // below are real, decoded from the shipped books, so the sequence under test
  // is one the game genuinely produces rather than one invented for the test.
  await page.waitForFunction(() => typeof window.__gridAnimate === 'function', { timeout: 10000 })
  await page.evaluate(async (perReel) => {
    const board = perReel.map((n) => {
      const col = ['L3', 'L3', 'L3', 'L3']
      for (let i = 0; i < n; i++) col[i] = 'S'
      return col
    })
    window.__gridAnimateDone = window.__gridAnimate(board)
  }, PLACEMENTS[category])
  await page.waitForTimeout(11000)

  const shot = join(SHOTS, `${category}${reducedMotion ? '-reduced' : ''}.png`)
  await page.screenshot({ path: shot })

  const ladder = await page.evaluate(() => window.__ladder)
  const gauge = await page.locator('[data-testid="flame-jets"]').getAttribute('data-gauge').catch(() => null)
  const errors = await page.evaluate(() => window.__consoleErrors || [])
  await page.close()
  return { category, reducedMotion, ladder, finalGauge: gauge, errors, shot: shot.split('/').pop() }
}

// Real per-reel scatter placements decoded from books_base (ids 78, 19, 1).
const PLACEMENTS = {
  trigger_3: [1, 1, 1, 0, 0],
  trigger_4: [1, 1, 1, 1, 0],
  trigger_5: [1, 1, 1, 1, 1],
}

const result = { timestamp: new Date().toISOString(), cases: {} }
for (const cat of ['trigger_3', 'trigger_4', 'trigger_5']) {
  result.cases[cat] = await runCase(cat)
}
result.cases.trigger_5_reduced = await runCase('trigger_5', { reducedMotion: true })

// ── Assertions ───────────────────────────────────────────────────────────────
const levels = (c) => result.cases[c].ladder.map((e) => e.level)
const peak = (c) => Math.max(...levels(c), 0)
const fired = (c, l) => levels(c).includes(l)

result.checks = {
  // The ladder must OPEN before it secures: a build that jumps straight to a
  // celebration never built tension.
  threeOpensBeforeSecuring: levels('trigger_3').indexOf(1) > -1
    && levels('trigger_3').indexOf(1) < levels('trigger_3').indexOf(2),
  // Each curated round must reach its own ceiling and no higher: level is a
  // function of scatters landed, so a 3-scatter round reaching 4 would mean the
  // gauge had invented a scatter.
  threePeaksAtSecured: peak('trigger_3') >= 2 && peak('trigger_3') <= 3,
  fourPeaksHigher: peak('trigger_4') >= 4 && peak('trigger_4') <= 5,
  fiveErupts: fired('trigger_5', 6),
  // Monotonic ordering of ceilings across the three rounds is the clearest
  // single statement that the gauge tracks scatter count.
  ceilingsOrdered: peak('trigger_3') <= peak('trigger_4') && peak('trigger_4') <= peak('trigger_5'),
  // The gauge must return to rest, not stick lit into the next round.
  returnsToRest: levels('trigger_5')[levels('trigger_5').length - 1] === 0
    || result.cases.trigger_5.finalGauge === '0.00',
  // Reduced motion must reach the SAME levels: the information is not optional,
  // only the movement is.
  reducedMotionSameCeiling: peak('trigger_5_reduced') === peak('trigger_5'),
  noConsoleErrors: Object.values(result.cases).every((c) => c.errors.length === 0),
}
result.pass = Object.values(result.checks).every(Boolean)

writeFileSync(join(OUT, 'anticipation_proof_2026-07-25.json'), JSON.stringify(result, null, 2))
for (const [k, c] of Object.entries(result.cases)) {
  console.log(`${k.padEnd(20)} ladder ${JSON.stringify(c.ladder.map((e) => e.level))}  peak ${Math.max(...c.ladder.map((e) => e.level), 0)}`)
}
console.log('\nchecks:', JSON.stringify(result.checks, null, 2))
await browser.close(); dev.kill()
process.exit(result.pass ? 0 : 1)
