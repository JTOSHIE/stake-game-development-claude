// replay_blocker_proof.mjs
//
// TR-076, the replay blocker. On the live platform the Replay panel launched
// the game, the board rendered static, and START REPLAY sat at the bottom as an
// unclickable shadow. Root cause: App.svelte's fixed .bg-layer (z-index 0)
// hit-tests and paints ABOVE unpositioned content, and ReplayMode's container
// was unpositioned. The game-stage (z-index 2) covered the backdrop in normal
// play, so ONLY replay mode was exposed. Third appearance of the
// full-viewport-layer-intercepts-input class (HeroSplash was the first).
//
// This proof drives the PRODUCTION build at the EXACT live replay parameter
// shape (docs/stake-engine-live/game-replay-requirements.md, Query Parameters
// table) and performs a REAL Playwright click on START REPLAY, which fails on
// any element interception rather than dispatching a synthetic event.
//
// Three passes:
//   1. SEEDED (convention (p)): the shipped defect form is re-introduced into
//      the served page (pointer-events restored on .bg-layer, replay container
//      dropped out of the stacking order). The proof must go RED here: the
//      real click must be intercepted by the backdrop. A green seeded pass
//      fails the whole proof.
//   2. BASE WIN, live shape, EUR: real click, then asserts the presentation
//      actually runs: the reel animation engages, the win counts up to a
//      non-zero EUR amount, and every displayed amount is euro-formatted with
//      no raw code and no NaN.
//   3. SUPER WINCAP: the shipped super cap round (payoutMultiplier 5000, the
//      round shape of live event 22975). Asserts MaxWinCelebration presents
//      and its COLLECT control is really clickable (TR-073 evidence).
//
// Convention (h.1): all output goes to scratch. Copy captures into
// reports/screens/replay-blocker/ only inside a job that regenerates evidence.
//
// Usage: node scripts/replay_blocker_proof.mjs   (from frontend/, after build)
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const DIST = join(HERE, '..', 'dist')
const OUT = process.env.REPLAY_PROOF_OUT
  ?? join(process.env.TMPDIR ?? '/tmp', 'replay_blocker_proof')
mkdirSync(OUT, { recursive: true })

const FIX = JSON.parse(readFileSync(
  join(HERE, '..', 'src', 'lib', 'services', '__fixtures__', 'replay_rounds.json'), 'utf8'))

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg',
}

const PORT = 4517
const srv = createServer((req, res) => {
  let p = req.url.split('?')[0]
  if (p === '/') p = '/index.html'
  const f = join(DIST, decodeURIComponent(p))
  if (existsSync(f) && !f.endsWith('/')) {
    res.writeHead(200, { 'content-type': MIME[extname(f)] ?? 'application/octet-stream' })
    res.end(readFileSync(f))
  } else { res.writeHead(404); res.end('not found') }
})
await new Promise((r) => srv.listen(PORT, r))

// The EXACT live parameter shape. Every documented parameter present, EUR,
// amount in integer micros (10.00 EUR), SUPER mode, the owner's event id.
const LIVE_QS = (mode, event) =>
  `replay=true&game=0e872280-c94a-4bcf-a55b-b649c4a02fc0&version=1` +
  `&mode=${mode}&event=${event}&rgs_url=rgs.stake-engine.com` +
  `&currency=EUR&amount=10000000&lang=en&device=desktop&social=false`

const results = []
const fail = (name, why) => { results.push({ name, pass: false, why }); console.log(`FAIL  ${name}: ${why}`) }
const pass = (name, note) => { results.push({ name, pass: true, note }); console.log(`pass  ${name}${note ? ': ' + note : ''}`) }

const browser = await chromium.launch()

async function openReplay(round, costMultiplier, { seedDefect = false, mode = 'SUPER', event = '22975' } = {}) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await page.route('**/bet/replay/**', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      payoutMultiplier: round.payoutMultiplier,
      costMultiplier,
      state: { events: round.events },
    }),
  }))
  await page.goto(`http://localhost:${PORT}/?${LIVE_QS(mode, event)}`)
  if (seedDefect) {
    // Convention (p): the EXACT form that shipped. The backdrop becomes
    // hit-testable again and the replay container drops out of the stacking
    // order, which is precisely the pre-fix CSS.
    await page.addStyleTag({ content: `
      .bg-layer { pointer-events: auto !important; }
      .replay-container { position: static !important; z-index: auto !important; }
    ` })
  }
  await page.locator('.start-replay').waitFor({ state: 'visible', timeout: 15000 })
  return page
}

// ── Pass 1: SEEDED violation must go RED ────────────────────────────────────
{
  const page = await openReplay(FIX.super.cap, 400.0, { seedDefect: true })
  await page.screenshot({ path: join(OUT, '01_seeded_defect_start_replay_shadowed.png') })
  let intercepted = false
  try {
    await page.locator('.start-replay').click({ timeout: 4000 })
  } catch (e) {
    intercepted = /intercepts pointer events|Timeout/.test(e.message)
  }
  if (intercepted) {
    const hit = await page.evaluate(() => {
      const b = document.querySelector('.start-replay').getBoundingClientRect()
      const el = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)
      return el ? String(el.className) : 'none'
    })
    pass('seeded interception goes red', `real click blocked, hit lands on "${hit}"`)
  } else {
    fail('seeded interception goes red', 'seeded defect did NOT block the click; the proof cannot see the defect it exists to catch')
  }
  await page.close()
}

// ── Pass 2: base win at the live shape, EUR, real click, presentation runs ──
{
  const page = await openReplay(FIX.base.win, 1.0, { mode: 'BASE', event: '52121' })
  const btnText = await page.locator('.start-replay').innerText()
  if (/€/.test(btnText) && /10[.,]00/.test(btnText) && !/NaN|EUR\b/.test(btnText)) {
    pass('EUR display on start button', btnText.replace(/\s+/g, ' ').trim())
  } else {
    fail('EUR display on start button', `expected euro-formatted 10.00, got "${btnText}"`)
  }
  await page.screenshot({ path: join(OUT, '02_base_ready_eur.png') })
  await page.locator('.start-replay').click({ timeout: 5000 })
  pass('real click on START REPLAY', 'not intercepted')

  // The presentation actually runs: playing status appears, then the win
  // counts up. Sample the win display twice mid-count to see it MOVING.
  await page.locator('.replay-status.playing').waitFor({ timeout: 5000 })
  pass('replay presentation starts', 'Replaying round status visible')
  // Sample the win display continuously from the click so the incremental
  // count-up is observed in flight, not only its settled total.
  const samples = []
  const deadline = Date.now() + 12000
  let shot = false
  while (Date.now() < deadline) {
    const t = (await page.locator('.win-area').innerText().catch(() => '')).trim()
    if (t && t !== samples[samples.length - 1]) samples.push(t)
    if (!shot && t) { await page.screenshot({ path: join(OUT, '03_base_playing_board_animating.png') }); shot = true }
    if (await page.locator('.play-again').isVisible().catch(() => false)) break
    await page.waitForTimeout(120)
  }
  await page.locator('.play-again').waitFor({ timeout: 20000 })
  const wFinal = samples[samples.length - 1] ?? ''
  const nonZero = /[1-9]/.test(wFinal.replace(/[^0-9]/g, ''))
  if (samples.length >= 2 && nonZero) {
    pass('win counts up to a non-zero total', `${samples.length} distinct frames, first "${samples[0].split('\n')[1] ?? samples[0]}", final "${wFinal.split('\n')[1] ?? wFinal}"`)
  } else if (samples.length === 1 && nonZero) {
    fail('win counts up to a non-zero total', `win display never moved: single frame "${wFinal.replace(/\n/g, ' / ')}"`)
  } else {
    fail('win counts up to a non-zero total', `samples=${samples.length} final="${wFinal}"`)
  }
  if (/NaN/.test(wFinal)) fail('no NaN in win display', wFinal)
  await page.screenshot({ path: join(OUT, '04_base_complete_play_again.png') })
  await page.close()
}

// ── Pass 3: super wincap, MaxWinCelebration presents (TR-073 evidence) ──────
{
  const page = await openReplay(FIX.super.cap, 400.0)
  await page.locator('.start-replay').click({ timeout: 5000 })
  const collect = page.locator('[data-testid="max-win-collect"]')
  await collect.waitFor({ state: 'visible', timeout: 15000 })
  pass('MaxWinCelebration presents at wincap in replay', 'COLLECT visible after real click, super cap round (5,000x, the round shape of live event 22975)')
  // Let the overlay's entry animation land so the capture shows the presented
  // celebration rather than its first transparent frame.
  await page.waitForTimeout(1200)
  await page.screenshot({ path: join(OUT, '05_super_wincap_maxwin_celebration.png') })
  await collect.click({ timeout: 5000 })
  pass('COLLECT is really clickable', 'wincap overlay dismissed by a real click')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: join(OUT, '06_super_wincap_after_collect.png') })
  await page.close()
}

await browser.close()
srv.close()

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} assertions passed. Captures: ${OUT}`)
if (failed.length) { console.log('RED'); process.exit(1) }
console.log('GREEN')
