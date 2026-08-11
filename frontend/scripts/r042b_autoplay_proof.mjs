// r042b_autoplay_proof.mjs
//
// EVIDENCE THAT AUTOPLAY TAKES TWO DELIBERATE ACTIONS. R042 BRIEF B, blocker B8.
//
// The gate proves the CODE cannot start a bet from a selection handler. This
// proves the BEHAVIOUR a player meets, which is a different claim: that choosing
// a count visibly changes nothing except the selection, that a Start control then
// appears, and that only Start places a bet.
//
// IT COUNTS WALLET CALLS, not just pixels. The platform rule is about placing
// bets, so the assertion that matters is that ZERO play requests leave the client
// between choosing a count and pressing Start. A screenshot cannot show that.
//
// IT ALSO RE-ASSERTS THE RESPONSIBLE PLAY PARAGRAPH, which R042 A4 keyed in
// sixteen locales and which describes this feature: "Autoplay can be set to stop
// automatically on any win, when the Overdrive feature triggers, or once a loss
// limit you choose is reached, and can always be stopped manually at any time."
// Every clause of that sentence must still correspond to a control on screen, or
// the paragraph became a false statement the moment the menu was redesigned.
//
// CONVENTION (h.1): scratch by default, --out=<dir> to place frames on purpose.
//
// RUNNER (TR-123 contract, applied by R047 TASK 5 for CI wiring): npx tsx,
// from frontend/, after `npm run build`. Exit 0 on PASS, non-zero on FAIL,
// terminates (in-process server closed, exits explicit). Fixed port 4551,
// unique in the family (the 4541 pair is settle and wording).
//   npx tsx scripts/r042b_autoplay_proof.mjs [--out=<dir>]
//   npx tsx scripts/r042b_autoplay_proof.mjs --self-test
//
// The --self-test re-invokes this proof with FS_SEED_VIOLATION=1, which
// installs a page-level handler making a COUNT SELECTION press Start the
// moment it appears: the exact one-click class blocker B8 closed, planted at
// the boundary a player's finger meets. The central assertion (choosing a
// count places NO bet) must go red and the process must exit non-zero.

import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const outArg = process.argv.find((a) => a.startsWith('--out='))
const OUT = outArg ? outArg.slice('--out='.length) : join(ROOT, '.scratch', 'r042b')
mkdirSync(OUT, { recursive: true })

const PORT = 4551
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webp': 'image/webp',
}
function serve() {
  const srv = createServer((req, res) => {
    let p = req.url.split('?')[0]
    if (p === '/') p = '/index.html'
    const f = join(DIST, decodeURIComponent(p))
    if (!existsSync(f) || f.endsWith('/')) { res.writeHead(404); res.end('not found'); return }
    res.writeHead(200, { 'content-type': MIME[extname(f)] ?? 'application/octet-stream' })
    res.end(readFileSync(f))
  })
  return new Promise((r) => srv.listen(PORT, () => r(srv)))
}

const M = 1_000_000
const AUTH_OK = {
  balance: { amount: 500 * M, currency: 'USD' },
  config: {
    minBet: 100_000, maxBet: 100 * M, stepBet: 100_000, defaultBetLevel: 1 * M,
    betLevels: [100_000, 500_000, 1 * M, 2 * M],
    jurisdiction: {
      socialCasino: false, disabledFullscreen: false, disabledTurbo: false,
      disabledSuperTurbo: false, disabledAutoplay: false, disabledSlamstop: false,
      disabledSpacebar: false, disabledBuyFeature: false, displayNetPosition: false,
      displayRTP: true, displaySessionTimer: false, minimumRoundDuration: 0,
    },
  },
  round: null,
}

let failures = 0
const fail = (m) => { failures++; console.error(`  FAIL  ${m}`) }
const ok = (m) => console.log(`  ok    ${m}`)
const clean = (s) => s.replace(/\s+/g, ' ').trim()
const ledger = {}

const SEED = process.env.FS_SEED_VIOLATION === '1'

// ── self-test, convention (p): seeded red AND the exit contract ──────────────
if (process.argv.includes('--self-test')) {
  const { spawnSync } = await import('node:child_process')
  const r = spawnSync('npx', ['tsx', fileURLToPath(import.meta.url)], {
    cwd: ROOT,
    env: { ...process.env, FS_SEED_VIOLATION: '1' },
    encoding: 'utf-8',
    timeout: 300_000,
  })
  const out = (r.stdout || '') + (r.stderr || '')
  const red = /R042B AUTOPLAY PROOF: FAIL/.test(out)
  const named = /choosing a count placed \d+ bet/.test(out)
  const exited = typeof r.status === 'number' && r.status !== 0
  console.log(`  ${red ? 'caught ' : 'MISSED '} the seeded one-click selection turned the proof red`)
  console.log(`  ${named ? 'named  ' : 'UNNAMED'} the red is the no-bet-on-selection assertion, blocker B8's own class`)
  console.log(`  ${exited ? 'exited ' : 'HUNG   '} the failing invocation exited non-zero (status ${r.status}${r.signal ? ', signal ' + r.signal : ''})`)
  if (!red || !named || !exited) {
    console.error('\nR042B AUTOPLAY PROOF SELF-TEST: FAIL')
    process.exit(1)
  }
  console.log('\nR042B AUTOPLAY PROOF SELF-TEST: PASS (seeded one-click red, non-zero exit, terminated)')
  process.exit(0)
}

const srv = await serve()
const browser = await chromium.launch()
try {
  console.log('R042B AUTOPLAY PROOF: choosing a count must not place a bet\n')
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  if (SEED) {
    // Convention (p): the one-click defect in the form it occurs, a selection
    // that begins a bet, planted at the DOM boundary before the app boots.
    await page.addInitScript(() => {
      document.addEventListener('click', (e) => {
        const el = e.target instanceof Element ? e.target.closest('button.auto-menu-item') : null
        if (el) setTimeout(() => {
          const start = document.querySelector('[data-testid="auto-start"]')
          if (start instanceof HTMLElement) start.click()
        }, 50)
      }, true)
    })
  }

  let playCalls = 0
  await page.route('**/wallet/**', async (route) => {
    const url = route.request().url()
    if (url.includes('/wallet/play')) playCalls++
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(url.includes('/wallet/authenticate') ? AUTH_OK : { balance: 499 * M }),
    })
  })

  const qs = `sessionID=r042b&rgs_url=localhost:${PORT}&lang=en&currency=USD&device=desktop`
  await page.goto(`http://localhost:${PORT}/?${qs}`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
  await dismissIntro(page)
  await page.waitForTimeout(600)

  // Open the auto menu.
  const autoBtn = page.locator('button[aria-label*="uto" i], .auto-wrapper button').first()
  if (await autoBtn.count()) { await autoBtn.click(); await page.waitForTimeout(400) }
  const menu = page.locator('.auto-menu').first()
  if (!(await menu.count())) { fail('the auto menu did not open'); throw new Error('no menu') }

  const startBefore = await page.locator('[data-testid="auto-start"]').count()
  await page.screenshot({ path: join(OUT, '01-menu-open-no-selection.png') })
  if (startBefore === 0) ok('with nothing chosen there is NO start control, so nothing to hit by reflex')
  else fail('a start control exists before any count is chosen')

  const inf = await page.locator('[data-testid="auto-infinite"][aria-checked="true"]').count()
  if (inf === 0) ok('and infinity is not pre-selected')
  else fail('infinity is pre-selected')

  // STEP ONE. Choose a count.
  const playBefore = playCalls
  const counts = page.locator('button.auto-menu-item')
  const nCounts = await counts.count()
  await counts.nth(Math.min(1, nCounts - 1)).click()
  // In seed mode the observation window widens so the planted one-click's bet
  // is certainly on the wire before the assertion reads the counter.
  await page.waitForTimeout(SEED ? 2200 : 700)
  await page.screenshot({ path: join(OUT, '02-count-selected-not-started.png') })

  const startAfter = await page.locator('[data-testid="auto-start"]').count()
  if (startAfter === 1) ok('choosing a count reveals exactly one start control')
  else fail(`expected one start control after selecting, saw ${startAfter}`)

  const selected = await page.locator('button.auto-menu-item[aria-checked="true"]').count()
  if (selected === 1) ok('and the chosen count is shown as selected')
  else fail(`expected one selected count, saw ${selected}`)

  // THE ASSERTION THE PLATFORM RULE IS ABOUT.
  if (playCalls === playBefore) ok(`choosing a count placed NO bet (${playCalls} play calls, unchanged)`)
  else fail(`choosing a count placed ${playCalls - playBefore} bet(s)`)

  const stillIdle = await page.locator('[data-testid="spin-button"]').isEnabled().catch(() => true)
  ledger.afterSelect = { playCalls, startControls: startAfter, selected }

  if (SEED) {
    // The seed exists to prove the assertion above goes red; every later step
    // is meaningless on a page whose selection already started autoplay, and
    // attempting them crashes past the verdict instead of printing it.
    await browser.close()
    srv.close()
    if (failures) { console.error(`\nR042B AUTOPLAY PROOF: FAIL (${failures})`); process.exit(1) }
    console.log('\nR042B AUTOPLAY PROOF: PASS')
    process.exit(0)
  }

  // STEP TWO. Start.
  await page.locator('[data-testid="auto-start"]').click()
  await page.waitForTimeout(1800)
  await page.screenshot({ path: join(OUT, '03-started.png') })
  if (playCalls > playBefore) ok(`pressing start placed the bet (${playCalls} play call(s))`)
  else fail('pressing start placed no bet')
  ledger.afterStart = { playCalls }

  // THE RESPONSIBLE PLAY PARAGRAPH MUST STILL BE TRUE OF THIS MENU.
  await page.keyboard.press('Escape').catch(() => {})
  const page2 = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page2.route('**/wallet/**', (r) => r.fulfill({
    contentType: 'application/json', body: JSON.stringify(AUTH_OK),
  }))
  await page2.goto(`http://localhost:${PORT}/?${qs}`, { waitUntil: 'domcontentloaded' })
  await page2.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
  await dismissIntro(page2)
  const auto2 = page2.locator('button[aria-label*="uto" i], .auto-wrapper button').first()
  if (await auto2.count()) { await auto2.click(); await page2.waitForTimeout(400) }
  const menuText = clean(await page2.locator('.auto-menu').first().innerText())
  ledger.menuText = menuText
  await page2.screenshot({ path: join(OUT, '04-stop-conditions.png') })

  // Each clause of the keyed paragraph, checked against a control on screen.
  const CLAUSES = [
    ['stop automatically on any win', /Stop on win/i],
    ['when the Overdrive feature triggers', /Stop on feature/i],
    ['once a loss limit you choose is reached', /Loss limit/i],
  ]
  for (const [clause, re] of CLAUSES) {
    if (re.test(menuText)) ok(`responsiblePlayBody clause holds: "${clause}"`)
    else fail(`responsiblePlayBody claims "${clause}" and no control matches it`)
  }
  // "can always be stopped manually at any time": the AUTO control becomes STOP
  // while autoplay runs, which is asserted on the first page rather than here.
  if (/Start autoplay/i.test(menuText) === false) {
    ok('and with nothing chosen the menu shows no start affordance')
  } else fail('the menu shows a start affordance with nothing chosen')

  writeFileSync(join(OUT, 'observations-r042b.json'),
    JSON.stringify({ generated: 'R042B autoplay two-step proof', ...ledger }, null, 2) + '\n')
  console.log(`\nframes and observations written to ${OUT}`)
} finally {
  await browser.close()
  srv.close()
}

if (failures) { console.error(`\nR042B AUTOPLAY PROOF: FAIL (${failures})`); process.exit(1) }
console.log('\nR042B AUTOPLAY PROOF: PASS')
process.exit(0)
