// r043_settle_failure_proof.mjs
//
// B12 / R043 PHASE 4: A LIVE SETTLE FAILURE FAILS CLOSED ON MONEY, PROVED ON
// THE SHIPPED BUNDLE AGAINST A STUB RGS.
//
// THE DEFECT. endRound throws inside the locked _rgsSpinReal, the whole spin
// rejects, and App.svelte's finally handed the optimistic debit BACK: the
// displayed balance returned to its pre-bet value while the RGS had taken the
// stake and still held the round open with the win uncredited; betting stayed
// enabled and the next SPIN staked again on top of the open round.
//
// THE DESIGN UNDER TEST (unlocked-first; the R043 conditional lock sanction
// was NOT triggered, see sessionRecovery.ts's derivation note): on any live
// rejection the debit is never handed back on assumption. App resyncs from
// server truth: authenticate, adopt the authoritative balance, and an active
// round engages the settle-failed guard; the reload path settles it through
// recoverSession's idempotent end-round leg.
//
// WHAT THE STUB DOES, per the brief: accepts /wallet/play (the stake is
// genuinely taken, a round opens) and FAILS /wallet/end-round, which is the
// exact half-failure B12 names. After play, any authenticate reports the open
// round and the post-play balance, which is what a real wallet would say.
//
// EVERY MONEY ASSERTION IS EXACT INTEGER MICROS, rendered through the
// product's own formatBalance so the expected string cannot drift from the
// display: base mode debits exactly 1_000_000 micros on a 1.00 bet and
// OVERBOOST (antelite) exactly 1_250_000, and the on-screen figure must equal
// the micros-exact expectation at every stage.
//
// SELF-TEST (convention p). The seeds are the superseded behaviour ITSELF, in
// the form it really occurs, planted into a copy of App.svelte's source: the
// resync blocks stripped (the pre-fix file), and the finally refund unguarded.
// The structural predicate that guards the design must go red on both, and
// pass the shipped source as the negative control.
//
// Run, from frontend/, after `npm run build`:
//   npx tsx scripts/r043_settle_failure_proof.mjs
//   npx tsx scripts/r043_settle_failure_proof.mjs --self-test

import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { evidenceDir, announceEvidenceMode } from './lib/evidencePaths.mjs'
import { formatBalance } from '../src/lib/utils/currency.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const DIST = join(ROOT, 'dist')
const SELF_TEST = process.argv.includes('--self-test')

// ── self-test: the structural predicate and its seeds ────────────────────────
export function structuralFindings(appSource) {
  const findings = []
  const resyncBlocks = (appSource.match(
    /if \(!import\.meta\.env\.DEV && optimisticDebit && get\(liveGuardReason\) !== 'wallet-stalled'\) \{\s*\n\s*optimisticDebit = 0\s*\n\s*await resyncAfterSpinRejection\(\)/g,
  ) || []).length
  if (resyncBlocks < 2) {
    findings.push(`only ${resyncBlocks} of 2 rejection paths resync from server truth `
      + '(handleSpin and handleBuy must both refuse the assumption refund)')
  }
  // The finally refunds must stay behind the wallet-stalled guard; an
  // UNGUARDED refund is the superseded behaviour itself.
  if (/if \(optimisticDebit\) \{\s*\n\s*balance\.update\(\(b\) => b \+ optimisticDebit\)/.test(appSource)) {
    findings.push('an UNCONDITIONAL optimistic-debit refund is present, the superseded refund-on-rejection behaviour')
  }
  return findings
}

if (SELF_TEST) {
  const real = readFileSync(join(ROOT, 'src/App.svelte'), 'utf-8')

  // SEED 1: the pre-fix file, byte for byte the superseded behaviour, made by
  // stripping the resync blocks this phase added.
  const stripped = real.replace(
    /if \(!import\.meta\.env\.DEV && optimisticDebit && get\(liveGuardReason\) !== 'wallet-stalled'\) \{\s*\n\s*optimisticDebit = 0\s*\n\s*await resyncAfterSpinRejection\(\)\s*\n\s*\}\n/g, '')
  const s1 = structuralFindings(stripped)
  console.log(`  ${s1.length ? 'caught ' : 'MISSED '} seeded: the resync blocks removed (the pre-fix refund-on-rejection file)`)

  // SEED 2: the refund made unconditional, the same superseded behaviour in
  // its other authoring form.
  const unguarded = real.replace(
    /if \(optimisticDebit && get\(liveGuardReason\) !== 'wallet-stalled'\) \{\n        balance\.update\(\(b\) => b \+ optimisticDebit\)/,
    'if (optimisticDebit) {\n        balance.update((b) => b + optimisticDebit)')
  const s2 = structuralFindings(unguarded)
  console.log(`  ${s2.length ? 'caught ' : 'MISSED '} seeded: the finally refund unguarded`)

  const clean = structuralFindings(real)
  console.log(`  ${clean.length === 0 ? 'clean  ' : 'FALSE+ '} negative control: the shipped source passes`)
  if (clean.length) for (const f of clean) console.log(`           ${f}`)

  if (!s1.length || !s2.length || clean.length) {
    console.error('\nR043 SETTLE FAILURE PROOF SELF-TEST: FAIL')
    process.exit(1)
  }
  console.log('\nR043 SETTLE FAILURE PROOF SELF-TEST: PASS (both superseded forms caught, shipped source clean)')
  process.exit(0)
}

// ── the behavioural proof ────────────────────────────────────────────────────
if (!existsSync(join(DIST, 'index.html'))) {
  console.error('R043 SETTLE FAILURE PROOF: no build at frontend/dist. Run `npm run build` first.')
  process.exit(2)
}

const FIX = JSON.parse(readFileSync(
  join(ROOT, 'src', 'lib', 'services', '__fixtures__', 'live_rounds.json'), 'utf8'))

const PORT = 4541
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.webm': 'video/webm', '.webp': 'image/webp',
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
const START = 500 * M
const WIN_ROUND = FIX.win               // payoutMultiplier 390 centibets = 3.9x
const JURIS = {
  socialCasino: false, disabledFullscreen: false, disabledTurbo: false,
  disabledSuperTurbo: false, disabledAutoplay: false, disabledSlamstop: false,
  disabledSpacebar: false, disabledBuyFeature: false, displayNetPosition: false,
  displayRTP: true, displaySessionTimer: false, minimumRoundDuration: 0,
}
const CONFIG = {
  minBet: 100_000, maxBet: 100 * M, stepBet: 100_000, defaultBetLevel: 1 * M,
  betLevels: [100_000, 500_000, 1 * M, 2 * M], jurisdiction: JURIS,
}

/**
 * One stub wallet per page: play takes the stake and opens the round,
 * end-round behaves per `endRoundMode`, and any authenticate AFTER play
 * reports the open round with the post-play balance, exactly as a real wallet
 * holding the round would. `probeMode: 'fail'` makes post-play authenticates
 * 500 too (scenario D).
 */
function wireStub(page, { costMicros, endRoundMode = 'fail', probeMode = 'ok', counters }) {
  let played = false
  return page.route('**/wallet/**', async (route) => {
    const url = route.request().url()
    const json = (body, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (url.includes('/wallet/authenticate')) {
      counters.auth++
      if (played && probeMode === 'fail') { counters.probeFails++; return json({ error: 'ERR_GEN' }, 500) }
      return json({
        balance: { amount: played ? START - costMicros : START, currency: 'USD' },
        config: CONFIG,
        round: played
          ? { betID: 9001, active: true, mode: 'base', amount: costMicros,
              payout: Math.round((WIN_ROUND.payoutMultiplier / 100) * costMicros),
              payoutMultiplier: WIN_ROUND.payoutMultiplier,
              state: { events: WIN_ROUND.events } }
          : null,
      })
    }
    if (url.includes('/wallet/play')) {
      counters.play++
      played = true
      return json({
        balance: { amount: START - costMicros, currency: 'USD' },
        round: { betID: 9001, active: true, mode: 'base', amount: costMicros,
          payout: Math.round((WIN_ROUND.payoutMultiplier / 100) * costMicros),
          payoutMultiplier: WIN_ROUND.payoutMultiplier,
          state: { events: WIN_ROUND.events } },
      })
    }
    if (url.includes('/wallet/end-round')) {
      counters.end++
      if (endRoundMode === 'fail') return json({ error: 'ERR_GEN' }, 500)
      const settled = START - costMicros + Math.round((WIN_ROUND.payoutMultiplier / 100) * costMicros)
      return json({ balance: { amount: settled, currency: 'USD' } })
    }
    return json({})
  })
}

const { dismissIntro } = await import('./lib/dismissOverlays.mjs')
let failures = 0
const ok = (m) => console.log(`  ok    ${m}`)
const bad = (m) => { failures++; console.error(`  FAIL  ${m}`) }
const assert = (cond, m) => (cond ? ok(m) : bad(m))
const clean = (s) => s.replace(/\s+/g, ' ').trim()
const balanceText = async (page) =>
  clean(await page.locator('[data-testid="hud-balance"]').first().innerText())
// The product's own formatter renders the expectation, so the assertion is
// about the MICROS, not about locale punctuation trivia.
const de = (micros) => formatBalance(micros, 'USD', 'de')

const EVID = evidenceDir('reports', 'screens', 'r043-settle-failure')
announceEvidenceMode('r043_settle_failure_proof')

const QS = `sessionID=r043-proof&rgs_url=localhost:${PORT}&lang=de&currency=USD&device=desktop`
const srv = await serve()
const browser = await chromium.launch()
const trace = {}
try {
  // ── A. Base mode: settle fails, no refund, guard engaged, German banner ────
  {
    const counters = { auth: 0, play: 0, end: 0, probeFails: 0 }
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    await wireStub(page, { costMicros: 1 * M, counters })
    await page.goto(`http://localhost:${PORT}/?${QS}`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
    await dismissIntro(page)
    await page.waitForTimeout(600)
    assert((await balanceText(page)).includes(de(START)), `boot balance renders ${de(START)}`)
    await page.screenshot({ path: join(EVID, '01-live-before-spin.png') })

    const authAtSpin = counters.auth
    await page.locator('[data-testid="spin-button"]').click()
    const banner = page.locator('[data-testid="live-guard-banner"]')
    await banner.waitFor({ state: 'visible', timeout: 30000 })
    await page.screenshot({ path: join(EVID, '02-settle-failed-guard-up.png') })

    const bal = await balanceText(page)
    trace.A = { counters: { ...counters }, balance: bal }
    assert(counters.play === 1, 'exactly one /wallet/play (the stake went out once)')
    assert(counters.end >= 1, `/wallet/end-round was attempted and refused (${counters.end} attempt(s))`)
    assert(counters.auth > authAtSpin, 'the rejection triggered a resync authenticate (the probe)')
    assert(bal.includes(de(START - 1 * M)),
      `NO REFUND: the balance is the server's ${de(START - 1 * M)}, not the pre-bet ${de(START)}`)
    assert(!bal.includes(de(START)), 'and the pre-bet figure is gone from the readout')

    const text = clean(await banner.innerText())
    assert(/letzte Runde/i.test(text), `the banner names the ROUND, in German: ${JSON.stringify(text)}`)
    assert(!/could not be completed/i.test(text), 'and did not fall back to English')

    // SPIN blocked at every route.
    const playsBefore = counters.play
    await page.locator('[data-testid="spin-button"]').click({ force: true }).catch(() => {})
    await page.waitForTimeout(600)
    await page.keyboard.press('Space')
    await page.waitForTimeout(600)
    // The blocking truth is the ACTION guard (handleSpin returns on
    // $bettingDisabled), which covers every route including autoplay; the
    // wallet counters above are the proof that matters. The button's disabled
    // attribute tracks canSpin (affordability), a different store, and is not
    // asserted here.
    assert(counters.play === playsBefore, 'SPIN is blocked by click AND spacebar: no second /wallet/play')
    await page.screenshot({ path: join(EVID, '03-spin-blocked.png') })

    // ── B. Reload: recovery presents and settles through end-round ──────────
    // The stub flips end-round to succeed, which is the platform recovering;
    // authenticate still reports the held round, and recoverSession does the
    // rest exactly as it does for a mid-round reload.
    await page.unroute('**/wallet/**')
    const c2 = { auth: 0, play: 0, end: 0, probeFails: 0 }
    let played2 = true // the wallet still holds the round from A
    await page.route('**/wallet/**', async (route) => {
      const url = route.request().url()
      const json = (body, status = 200) =>
        route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
      if (url.includes('/wallet/authenticate')) {
        c2.auth++
        return json({
          balance: { amount: START - 1 * M, currency: 'USD' }, config: CONFIG,
          round: played2
            ? { betID: 9001, active: true, mode: 'base', amount: 1 * M,
                payout: 3_900_000, payoutMultiplier: 390, state: { events: WIN_ROUND.events } }
            : null,
        })
      }
      if (url.includes('/wallet/end-round')) {
        c2.end++
        played2 = false
        return json({ balance: { amount: START - 1 * M + 3_900_000, currency: 'USD' } })
      }
      if (url.includes('/wallet/play')) { c2.play++; return json({}, 500) }
      return json({})
    })
    await page.goto(`http://localhost:${PORT}/?${QS}`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
    await dismissIntro(page).catch(() => {})
    await page.locator('[data-testid="recovery-banner"]').waitFor({ state: 'visible', timeout: 45000 })
    await page.screenshot({ path: join(EVID, '04-reload-recovered-settled.png') })
    const bal2 = await balanceText(page)
    trace.B = { counters: { ...c2 }, balance: bal2 }
    assert(c2.end === 1, 'the reload settled the held round through the idempotent end-round leg')
    assert(bal2.includes(de(START - 1 * M + 3_900_000)),
      `the credited balance is micros-exact: ${de(START - 1 * M + 3_900_000)}`)
    assert((await page.locator('[data-testid="live-guard-banner"]').count()) === 0,
      'the guard is down: the session is clear to play again')
    await page.close()
  }

  // ── C. OVERBOOST (antelite, 1.25x): per-mode debit integrity in micros ─────
  {
    const counters = { auth: 0, play: 0, end: 0, probeFails: 0 }
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    await wireStub(page, { costMicros: 1_250_000, counters })
    await page.goto(`http://localhost:${PORT}/?${QS}`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
    await dismissIntro(page)
    // Four layout profiles each render a FEATURES button; drive the visible
    // one, and wait for the menu's own content before reaching for the toggle.
    // The UI mode id is 'overboost' (fsModes maps it to the maths package's
    // antelite), so the toggle's testid is enhancer-toggle-overboost.
    await page.locator('[data-testid="feature-menu-button"]:visible').first().click()
    await page.waitForSelector('[data-testid="enhancer-toggle-overboost"]', { timeout: 10000 })
    await page.locator('[data-testid="enhancer-toggle-overboost"]:visible').first().click()
    await page.locator('[data-testid="feature-menu-close"]:visible').first().click()
    await page.waitForTimeout(400)
    await page.locator('[data-testid="spin-button"]').click()
    await page.locator('[data-testid="live-guard-banner"]').waitFor({ state: 'visible', timeout: 30000 })
    const bal = await balanceText(page)
    trace.C = { counters: { ...counters }, balance: bal }
    assert(bal.includes(de(START - 1_250_000)),
      `OVERBOOST debits exactly 1_250_000 micros: the readout is ${de(START - 1_250_000)}`)
    await page.screenshot({ path: join(EVID, '05-antelite-micros-exact.png') })
    await page.close()
  }

  // ── D. The probe itself fails: fail closed ────────────────────────────────
  {
    const counters = { auth: 0, play: 0, end: 0, probeFails: 0 }
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    await wireStub(page, { costMicros: 1 * M, probeMode: 'fail', counters })
    await page.goto(`http://localhost:${PORT}/?${QS}`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
    await dismissIntro(page)
    await page.locator('[data-testid="spin-button"]').click()
    const banner = page.locator('[data-testid="live-guard-banner"]')
    await banner.waitFor({ state: 'visible', timeout: 30000 })
    const bal = await balanceText(page)
    trace.D = { counters: { ...counters }, balance: bal }
    assert(counters.probeFails >= 1, 'the probe authenticate was attempted and refused')
    assert(/letzte Runde/i.test(clean(await banner.innerText())),
      'an unanswerable probe fails CLOSED: the guard banner is up')
    assert(bal.includes(de(START - 1 * M)),
      `and the stake stays debited (${de(START - 1 * M)}), never refunded on assumption`)
    const plays = counters.play
    await page.keyboard.press('Space')
    await page.waitForTimeout(600)
    assert(counters.play === plays, 'betting stays blocked while the truth is unknown')
    await page.screenshot({ path: join(EVID, '06-probe-failed-fail-closed.png') })
    await page.close()
  }
} finally {
  await browser.close()
  srv.close()
}

writeFileSync(join(EVID, 'settle_failure_trace.json'), JSON.stringify({
  _what: 'R043 PHASE 4 / B12. Wallet call counters and balance readouts at each stage.',
  startMicros: START,
  ...trace,
}, null, 2) + '\n')
console.log(`\ntrace written to ${join(EVID, 'settle_failure_trace.json')}`)

if (failures) { console.error(`\nR043 SETTLE FAILURE PROOF: FAIL (${failures})`); process.exit(1) }
console.log('\nR043 SETTLE FAILURE PROOF: PASS (no refund on assumption, guard engaged, reload settles, micros exact)')
