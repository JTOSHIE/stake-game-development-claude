// r057_throttled_device_evidence.mjs - FABLE BRIEF R057 TASK 3 (2026-08-13).
//
// AN EVIDENCE RUN, NOT A GATE, and the distinction is the brief's own:
// checklist item [49] ("Game works correctly on older mobile devices") cannot
// be closed by emulation, so this run records DILIGENCE NUMBERS for the
// owner's walk rather than asserting a pass. The mobile portrait preset
// (375x812, mobile user agent, touch) is driven under 6x CPU throttle via the
// Chrome DevTools protocol, which is DevTools' own "low-end mobile"
// calibration, and the measured figures are written into the evidence pack
// verbatim. THRESHOLDS ARE REPORTED, NOT INVENTED: no number here is judged,
// because inventing a pass line for hardware we do not have would be exactly
// the self-assessed green the fifty-one mapping refuses. Any owner hand-test
// on real older hardware is recorded beside these numbers as one line when
// given.
//
// WHAT IS MEASURED, at 1x (control) and 6x (throttled), same build, same
// stub wallet, same real 0.08x book round:
//   load    navigation start to the spin control interactive (the boot cost)
//   spin    click to the win readout carrying the round's value, three spins
//           (the cadence a player feels)
//
// Output: reports/qa/r057_throttled_device_2026-08-13.json (the numbers) and
// a rendered .md beside it (the owner-readable pack page), plus one settled
// frame. Written through evidenceDir per (h.1): a plain run goes to scratch,
// the committed pack is written by this session's own FS_WRITE_EVIDENCE run.
//
// RUNNER (TR-123): npx tsx, from frontend/. Exit 0 when the run completed and
// the pack was written, non-zero on mechanical failure; terminates.
//   npx tsx scripts/r057_throttled_device_evidence.mjs

import { chromium, devices } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import { evidenceDir } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FRONTEND = join(__dirname, '..')
const DIST = join(FRONTEND, 'dist')

const ROUND = JSON.parse(readFileSync(
  join(FRONTEND, 'src', 'lib', 'services', '__fixtures__', 'subcent_round_47.json'), 'utf-8'))
const START_MICROS = 100_000_000
const BET_MICROS = 100_000
const PAYOUT_MICROS = 8_000
const SPINS = 3

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webp': 'image/webp',
}

function startStub(distDir) {
  let bets = 0
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      if (req.method === 'POST') {
        let body = ''
        req.on('data', (c) => { body += c })
        req.on('end', () => {
          const json = (obj) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)) }
          if (req.url === '/wallet/authenticate') {
            return json({
              balance: { amount: START_MICROS, currency: 'USD' },
              config: {
                minBet: BET_MICROS, maxBet: 1_000_000_000, stepBet: BET_MICROS,
                betLevels: [BET_MICROS, 2 * BET_MICROS], defaultBetLevel: BET_MICROS,
              },
              round: null,
            })
          }
          if (req.url === '/wallet/play') {
            bets += 1
            return json({
              balance: { amount: START_MICROS - bets * BET_MICROS + (bets - 1) * PAYOUT_MICROS, currency: 'USD' },
              round: {
                betID: 4700 + bets, active: true, mode: 'base',
                amount: BET_MICROS, payout: PAYOUT_MICROS, payoutMultiplier: ROUND.payoutMultiplier,
                state: { events: ROUND.events },
              },
            })
          }
          if (req.url === '/wallet/end-round') {
            return json({ balance: { amount: START_MICROS - bets * BET_MICROS + bets * PAYOUT_MICROS, currency: 'USD' } })
          }
          res.writeHead(404); res.end('{}')
        })
        return
      }
      const rel = (req.url || '/').split('?')[0]
      const p = join(distDir, rel === '/' ? 'index.html' : rel)
      if (!existsSync(p)) { res.writeHead(404); return res.end('not found') }
      res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' })
      res.end(readFileSync(p))
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

async function measureAt(browser, rate, frameDir) {
  const server = await startStub(DIST)
  const base = `http://127.0.0.1:${server.address().port}`
  // The mobile portrait preset: a real device profile so the mobile HUD and
  // touch paths engage, not a resized desktop window.
  const ctx = await browser.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 } })
  const page = await ctx.newPage()
  try {
    const cdp = await ctx.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate })

    const t0 = Date.now()
    await page.goto(`${base}/?sessionID=r057-throttle&rgs_url=${encodeURIComponent(base)}&lang=en`,
      { waitUntil: 'domcontentloaded' })
    const domContentLoadedMs = Date.now() - t0
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 120_000 })
    const spinInteractiveMs = Date.now() - t0

    const { dismissIntro } = await import('./lib/dismissOverlays.mjs')
    await dismissIntro(page)
    await page.waitForTimeout(800)

    const spinMs = []
    for (let i = 0; i < SPINS; i++) {
      // The cadence a player feels is click to the WIN PRESENTED, measured in
      // two phases because the settled readout text is identical every spin
      // (each fixture spin wins the same $0.008): first the readout CLEARS
      // (winAmount resets at spin start), then it carries the round's value
      // again. Two earlier signals were tried and both measured the wrong
      // thing, kept here so neither returns: a change-predicate against the
      // previous text never fires from spin 2 on (the texts are equal), and
      // the balance readout flips on the DEBIT the moment the click lands
      // (46ms at 1x), which is the handler's latency, not the round's.
      const s0 = Date.now()
      await page.locator('[data-testid="spin-button"]').click({ timeout: 20_000, force: true })
      await page.waitForFunction(() => {
        const el = document.querySelector('[data-testid="hud-win"]')
        return el && !el.innerText.includes('0.008')
      }, undefined, { timeout: 30_000 }).catch(() => {})
      await page.waitForFunction(() => {
        const el = document.querySelector('[data-testid="hud-win"]')
        return el && el.innerText.includes('0.008')
      }, undefined, { timeout: 60_000 }).catch(() => {})
      spinMs.push(Date.now() - s0)
      // Let the presentation settle before the next press.
      await page.waitForTimeout(2_500)
    }
    if (rate !== 1) {
      await page.screenshot({ path: join(frameDir, `throttled_${rate}x_settled.png`) })
    }
    return { rate, domContentLoadedMs, spinInteractiveMs, spinMs }
  } finally {
    await page.close()
    await ctx.close()
    server.close()
  }
}

async function run() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('dist/ is absent. Run `npm run build` first.')
    process.exit(1)
  }
  const frameDir = evidenceDir('reports', 'screens', 'r057-throttled')
  const qaDir = evidenceDir('reports', 'qa')
  const browser = await chromium.launch()
  let control, throttled
  try {
    control = await measureAt(browser, 1, frameDir)
    throttled = await measureAt(browser, 6, frameDir)
  } finally {
    await browser.close()
  }

  const pack = {
    task: 'R057 TASK 3, checklist item 49 diligence',
    date: '2026-08-13',
    method: 'Playwright chromium, iPhone 12 profile at 375x812, CDP Emulation.setCPUThrottlingRate,'
      + ' real dist served with a stub wallet replaying published book round 47 (0.08x) at the $0.10 minimum bet',
    note: 'Thresholds are reported, not invented: no figure below is judged. Emulation is not'
      + ' hardware; any owner hand-test on real older devices is recorded beside this pack as one line when given.',
    control_1x: control,
    throttled_6x: throttled,
  }
  const jsonPath = join(qaDir, 'r057_throttled_device_2026-08-13.json')
  writeFileSync(jsonPath, JSON.stringify(pack, null, 2) + '\n')

  const line = (m) => `| ${m.rate}x | ${m.domContentLoadedMs} ms | ${m.spinInteractiveMs} ms | ${m.spinMs.join(' / ')} ms |`
  const md = `# Throttled-device evidence, R057 TASK 3 (2026-08-13)

Checklist item 49 diligence: the mobile portrait preset (iPhone 12 profile,
375x812) driven under CPU throttle via the DevTools protocol, real dist, stub
wallet, published book round 47 (0.08x) at the $0.10 minimum bet. Thresholds
are reported, not invented: nothing here is judged, because emulation is not
hardware. The numbers are for the owner's walk of the fifty-one.

| CPU | domcontentloaded | spin control interactive | click to win readout (3 spins) |
|---|---|---|---|
${line(control)}
${line(throttled)}

Frame: reports/screens/r057-throttled/throttled_6x_settled.png (the settled
board after a throttled spin, mobile portrait).

Owner hand-test on real older hardware: none recorded at the time of this
run; one line is added here if given.
`
  const mdPath = join(qaDir, 'r057_throttled_device_2026-08-13.md')
  writeFileSync(mdPath, md)

  console.log('  control 1x :', JSON.stringify(control))
  console.log('  throttled 6x:', JSON.stringify(throttled))
  console.log(`\nR057 THROTTLED DEVICE EVIDENCE: RECORDED (${jsonPath})`)
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
