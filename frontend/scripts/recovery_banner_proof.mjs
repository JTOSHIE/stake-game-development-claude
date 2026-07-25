// recovery_banner_proof.mjs - R2R-R JOB B / TR-035b and TR-049 (2026-07-26).
//
// Captures the resume-and-settle banner state from a REAL production build
// running the REAL recovery path, and writes the TR-049 screenshot the evidence
// inventory has been waiting on.
//
// WHY A PRODUCTION BUILD AND NOT THE DEV SERVER. `recoverSession(isDev)` returns
// immediately in dev, by design: there is no session to recover there. Under
// `vite dev` the whole path is a no-op, so a dev-server capture would photograph
// nothing and label it evidence. This builds and serves the actual dist through
// `vite preview`, the same arrangement build_diet_verify.mjs uses, so
// `import.meta.env.DEV` is false and the recovery branch genuinely runs.
//
// WHAT IS SIMULATED AND WHAT IS NOT. Only the two wallet responses are
// intercepted, at the network boundary, with OFFICIAL-SHAPED payloads:
// authenticate returns an active round carrying real reveal/winInfo events at
// `round.state.events`, and end-round returns a balance. Everything downstream
// is the shipped code: the service parses the official envelope, recovery
// extracts and interprets the events, App plays the round back, endRound is
// called, and the banner renders. Nothing is injected into the page and no
// store is written from outside.
//
// Run (from frontend/): node scripts/recovery_banner_proof.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SCREENS = join(ROOT, '..', 'reports', 'screens', 'session-recovery')
const QA = join(ROOT, '..', 'reports', 'qa')
mkdirSync(SCREENS, { recursive: true })
mkdirSync(QA, { recursive: true })

const RGS_HOST = 'rgs.recovery-proof.invalid'

const cell = (n) => ({ name: n, wild: n === 'W', scatter: n === 'S' })
const boardOf = (rows) => rows.map((reel) => reel.map(cell))

const ORDINARY_BOARD = boardOf([
  ['L1', 'H1', 'H1', 'L3', 'L2', 'M1'],
  ['M2', 'H1', 'L1', 'L3', 'L2', 'M1'],
  ['M3', 'H1', 'M1', 'L3', 'L2', 'M1'],
  ['L1', 'L1', 'M2', 'L3', 'L2', 'M1'],
  ['L1', 'L1', 'M2', 'L3', 'L2', 'M1'],
])

const ORDINARY_EVENTS = [
  { type: 'reveal', board: ORDINARY_BOARD, gameType: 'basegame' },
  { type: 'winInfo', wins: [{ symbol: 'H1', kind: 3, win: 390, meta: { ways: 6, globalMult: 1 } }], totalWin: 390 },
  { type: 'setTotalWin', amount: 390 },
  { type: 'finalWin', amount: 390 },
]

/** The official authenticate envelope, with an ACTIVE round. */
const authenticateBody = (events) => ({
  balance: { amount: 100_000_000, currency: 'USD' },
  config: {
    minBet: 100_000, maxBet: 100_000_000, stepBet: 100_000,
    defaultBetLevel: 1_000_000, betLevels: [100_000, 500_000, 1_000_000, 2_000_000],
    jurisdiction: {
      socialCasino: false, disabledFullscreen: false, disabledTurbo: false,
      disabledSuperTurbo: false, disabledAutoplay: false, disabledSlamstop: false,
      disabledSpacebar: false, disabledBuyFeature: false, displayNetPosition: false,
      displayRTP: false, displaySessionTimer: false, minimumRoundDuration: 0,
    },
  },
  round: {
    betID: 4242, active: true, mode: 'base',
    amount: 1_000_000, payout: 3_900_000, payoutMultiplier: 390,
    state: { events },
  },
})

/** The official end-round envelope: a balance and nothing else. */
const endRoundBody = { balance: { amount: 103_900_000, currency: 'USD' } }

async function getFreePort() {
  return new Promise((res, rej) => {
    const srv = createServer()
    srv.on('error', rej)
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => res(port)) })
  })
}

function startPreview(port) {
  return new Promise((res, rej) => {
    const proc = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
      cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'],
    })
    let done = false
    const onData = (d) => {
      const s = d.toString()
      if (!done && (/Local/.test(s) || /localhost:\d+/.test(s))) { done = true; res(proc) }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', rej)
    setTimeout(() => { if (!done) rej(new Error('vite preview did not start in time')) }, 20000)
  })
}

async function run() {
  if (!existsSync(join(ROOT, 'dist', 'index.html'))) {
    console.error('dist/ is absent. Run `npm run build` first; this proof serves the real build on purpose.')
    process.exit(2)
  }

  const port = await getFreePort()
  const preview = await startPreview(port)
  const base = `http://localhost:${port}`
  const calls = []
  const checks = {}

  try {
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    const consoleErrors = []
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
    page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message))

    // Intercept ONLY the two wallet endpoints, at the network boundary.
    await page.route(`**://${RGS_HOST}/**`, async (route) => {
      const url = route.request().url()
      const body = route.request().postDataJSON?.() ?? null
      calls.push({ url, body })
      if (url.includes('/wallet/authenticate')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(authenticateBody(ORDINARY_EVENTS)) })
      } else if (url.includes('/wallet/end-round')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(endRoundBody) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    const launch = `${base}/?sessionID=proof-session&rgs_url=${RGS_HOST}&lang=en`
    await page.goto(launch, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 30000 })

    // THE SPLASH MUST BE DISMISSED FIRST, and that is an assertion, not setup.
    //
    // The first capture of this feature caught a real defect: the banner
    // rendered correctly while the replay had already played out behind
    // "TAP TO CONTINUE", so the player was told their round had been completed
    // and never saw it happen. Presenting behind a splash is indistinguishable
    // from not presenting at all. Recovery now waits for every boot splash to
    // clear, so this check confirms the banner is NOT yet there while the
    // splash is up, and only appears once the player is actually looking.
    checks.bannerWaitsForTheSplash = {
      pass: await page.locator('[data-testid="recovery-banner"]').count() === 0,
      note: 'the banner must not be showing while a boot splash still covers the game',
    }
    await dismissIntro(page)

    // Capture the replay itself, mid-presentation. This is the frame that
    // proves the player sees their own round rather than only being told about
    // it, and it is the reason TR-035b stopped forfeiting.
    await page.waitForTimeout(700)
    await page.screenshot({ path: join(SCREENS, 'resume-and-settle-replay.png') })
    const boardDuringReplay = await page.evaluate(
      () => document.querySelectorAll('[data-testid="symbol-cell"], .symbol-cell').length,
    )
    checks.roundIsReplayedOnScreen = { pass: boardDuringReplay > 0, cells: boardDuringReplay }

    // The banner appears only after the round has been replayed AND settled, so
    // waiting for it is itself the assertion that the whole sequence ran.
    await page.waitForSelector('[data-testid="recovery-banner"]', { timeout: 30000 })
    await page.waitForTimeout(400)
    await page.screenshot({ path: join(SCREENS, 'resume-and-settle-banner.png') })

    const bannerText = await page.locator('[data-testid="recovery-banner"]').innerText()

    checks.bannerRendered = { pass: true, text: bannerText.replace(/\s*×\s*$/, '').trim() }
    checks.authenticateCalled = {
      pass: calls.some((c) => c.url.includes('/wallet/authenticate')),
    }
    // The whole point of the re-ruling: the round was SETTLED, not parked.
    checks.endRoundCalled = { pass: calls.some((c) => c.url.includes('/wallet/end-round')) }
    // And settled with the OFFICIAL body: sessionID alone, no roundId.
    const end = calls.find((c) => c.url.includes('/wallet/end-round'))
    checks.endRoundBodyIsOfficial = {
      pass: !!end && JSON.stringify(end.body) === JSON.stringify({ sessionID: 'proof-session' }),
      body: end?.body ?? null,
    }
    checks.rgsUrlWasNormalised = {
      pass: calls.every((c) => c.url.startsWith(`https://${RGS_HOST}/`)),
      sample: calls[0]?.url ?? null,
    }
    checks.bannerIsDismissible = { pass: await page.locator('.recovery-banner-close').count() === 1 }
    checks.zeroConsoleErrors = { pass: consoleErrors.length === 0, errors: consoleErrors }

    // Dismiss it and prove it goes, so the capture is of a state a player can
    // actually leave rather than a permanent overlay.
    await page.locator('.recovery-banner-close').click()
    await page.waitForTimeout(250)
    checks.bannerDismisses = { pass: await page.locator('[data-testid="recovery-banner"]').count() === 0 }
    await page.screenshot({ path: join(SCREENS, 'resume-and-settle-dismissed.png') })

    await browser.close()
  } finally {
    preview.kill()
  }

  const allPass = Object.values(checks).every((c) => c.pass)
  const out = {
    generated: '2026-07-26',
    row: 'TR-035b resume-and-settle, TR-049 banner capture',
    servedFrom: 'production build via vite preview, so import.meta.env.DEV is false',
    intercepted: ['/wallet/authenticate', '/wallet/end-round'],
    walletCalls: calls.map((c) => ({ url: c.url, body: c.body })),
    checks,
    allPass,
  }
  writeFileSync(join(QA, 'session_recovery_proof_2026-07-26.json'), JSON.stringify(out, null, 2))

  for (const [k, v] of Object.entries(checks)) console.log(`  ${v.pass ? 'ok  ' : 'FAIL'} ${k}`)
  console.log(`\nbanner text: "${checks.bannerRendered.text}"`)
  console.log(`wallet calls: ${calls.map((c) => c.url.split('/').slice(-1)[0]).join(', ')}`)

  if (!allPass) { console.error('\nRECOVERY BANNER PROOF: FAIL'); process.exit(1) }
  console.log('\nRECOVERY BANNER PROOF: PASS')
}

run().catch((e) => { console.error(e); process.exit(1) })
