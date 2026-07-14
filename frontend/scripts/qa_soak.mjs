// qa_soak.mjs — QA soak harness (Build Diet v2 + QA brief, Task 2).
//
// Drives the mock game headless through >=1,000 spins spread across a matrix
// of 4 locales x social mode on/off x all 3 speed tiers, asserting for every
// round: the presented total equals the independently-recomputed book total
// exactly (the "interpreter gate", applied live against the mock's own raw
// win events rather than the static curated pool roundInterpreter.test.ts
// already covers), balance arithmetic stays exact in integer micros with no
// drift, zero console errors, and heap usage stable within 15% between the
// 100th and 1,000th spin of the continuous run. Samples fps throughout
// against a 55 floor.
//
// Run (from frontend/, dev server already running): npm run qa:soak
// Writes the full run log to reports/qa/soak-1.log (also this script's stdout).

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, appendFileSync, existsSync, readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawn, execFileSync } from 'node:child_process'
import { createServer } from 'node:net'

// This host runs other concurrent, unrelated automated sessions (observed:
// a stale `vite --port 5199` from a completely different worktree squatting
// on the port this script used to hardcode) — a fixed port is a real
// collision risk, not just a theoretical one. Ask the OS for a free port
// immediately before spawning vite instead.
async function getFreePort() {
  return new Promise((resolvePromise, reject) => {
    const srv = createServer()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolvePromise(port))
    })
  })
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'qa')
mkdirSync(OUT_DIR, { recursive: true })
const LOG_PATH = join(OUT_DIR, 'soak-1.log')
writeFileSync(LOG_PATH, '') // fresh log each run

const CURRENCY_SCALE = 1_000_000
let BASE_URL = process.env.QA_SOAK_URL // set once the isolated server (or the env override) is ready

// The soak takes 25-30+ minutes; a shared `vite dev` server is not safe to
// depend on for that long in this environment (concurrent edits to the same
// files trigger HMR remounts mid-run, and any separately-launched detached
// background shell process has been observed to get reaped independently of
// that). So unless QA_SOAK_URL is explicitly set, this script owns its own
// throwaway server for its entire lifetime: an rsync snapshot of frontend/
// (excluding node_modules/dist), served by a `vite dev` child process of
// *this* Node process — immune to edits on the real frontend/src, and killed
// in the same finally block that tears down the browser.
async function startIsolatedDevServer(instanceLabel = 'a') {
  const frontendDir = join(__dirname, '..')
  const isoDir = mkdtempSync(join(tmpdir(), 'fs-qa-soak-'))
  execFileSync('rsync', ['-a', '--exclude', 'node_modules', '--exclude', 'dist', '--exclude', 'dist-qa-soak', `${frontendDir}/`, `${isoDir}/`])
  // A symlinked node_modules resolves (realpath) outside isoDir, and Vite's
  // dev-server fs allow-list denies /@fs/ requests for anything outside the
  // project root by real path — 403s a handful of self-hosted font files
  // served that way. `cp -c` is an APFS clonefile: an instant, copy-on-write
  // "real" copy fully inside isoDir, so Vite's allow-list is satisfied.
  execFileSync('cp', ['-Rc', join(frontendDir, 'node_modules'), join(isoDir, 'node_modules')])

  // Post-mortem diagnostics: earlier runs saw this child become unreachable
  // between sessions with no evidence of *why*. Its full stdout/stderr is now
  // captured for the process's entire lifetime (not just during the startup
  // race), and every exit is logged with a timestamp, so a repeat failure has
  // something to inspect instead of a bare ERR_CONNECTION_REFUSED.
  const serverLogPath = join(OUT_DIR, `isolated-server-${instanceLabel}.log`)
  writeFileSync(serverLogPath, '')
  const port = await getFreePort()
  const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], { cwd: isoDir, stdio: ['ignore', 'pipe', 'pipe'] })
  proc.stdout.on('data', (d) => appendFileSync(serverLogPath, d.toString()))
  proc.stderr.on('data', (d) => appendFileSync(serverLogPath, d.toString()))
  proc.on('exit', (code, signal) => {
    appendFileSync(serverLogPath, `\n[qa_soak] child exited at ${new Date().toString()} code=${code} signal=${signal}\n`)
  })

  await new Promise((resolvePromise, reject) => {
    let resolved = false
    // The real bug (JOB 2, 2026-07-13, found by inspecting the raw stdout
    // bytes): vite 7.3.1's dev-mode banner bolds "Local" and resets *before*
    // the colon - the literal bytes are `\x1b[1mLocal\x1b[22m:`, so `/Local:/`
    // never matches at all, on any timeout length. This had been silently
    // broken (every run fell through to the timeout, however generous) since
    // whichever vite upgrade introduced that styling change. Match the word
    // alone, the same fix already applied to build_diet_verify.mjs for
    // `vite preview`'s banner (a different command, same class of bug).
    const onData = (d) => { if (!resolved && /Local/.test(d.toString())) { resolved = true; resolvePromise() } }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', reject)
    proc.on('exit', (code) => { if (!resolved) reject(new Error(`isolated vite server exited early (code ${code})`)) })
    setTimeout(() => { if (!resolved) reject(new Error('isolated vite server did not start in time')) }, 60000)
  })
  return { proc, isoDir, url: `http://localhost:${port}`, serverLogPath }
}

function stopIsolatedDevServer(isolated, label) {
  if (!isolated) return
  isolated.proc.kill()
  rmSync(isolated.isoDir, { recursive: true, force: true })
  log(`Isolated dev server (${label}) stopped, snapshot ${isolated.isoDir} removed.`)
}
const WINCAP_BET_MULTIPLE = 5000

const LOCALES = ['en', 'es', 'ja', 'ar']
const SPEED_TIERS = ['normal', 'turbo', 'super']

// Asymmetric per-cell spin counts: the matrix must cover every combination at
// least once, but a headless normal-speed spin takes ~5-6s (full reel
// stagger) against ~0.8s at Super Turbo, so the required 1,000+ volume leans
// on the fast tier rather than spending 20+ minutes forcing equal weight on
// every cell. Every cell is still exercised and every round is still checked.
const CELL_SPINS = { normal: 15, turbo: 25, super: 210 } // session A (social off)
const CELL_SPINS_B = { normal: 5, turbo: 10, super: 60 } // session B (social on)

function log(line) {
  console.log(line)
  appendFileSync(LOG_PATH, line + '\n')
}

function toMicros(dollars) {
  return Math.round(dollars * CURRENCY_SCALE)
}

/** Recompute the round total from the raw mock "book" data (winEvents +
 *  scatterEvent, same cap the mock applies) and compare to what was
 *  presented — the live analogue of the static exact-total interpreter gate. */
function checkRound(entry) {
  const winSum = entry.winEvents.reduce((a, w) => a + w.payout, 0)
  const scatterAward = entry.scatterEvent?.award ?? 0
  const recomputed = Math.min(winSum + scatterAward, entry.bet * WINCAP_BET_MULTIPLE)
  const recomputedMicros = toMicros(recomputed)
  const presentedMicros = toMicros(entry.totalWin)
  return { ok: recomputedMicros === presentedMicros, recomputedMicros, presentedMicros }
}

async function waitSpinDone(page, timeout = 20000) {
  await page.waitForFunction(
    () => !document.querySelector('[data-testid="spin-button"].spinning'),
    { timeout },
  )
}

async function dismissIntro(page) {
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await btn.click()
    await page.waitForTimeout(100)
  }
}

// ── Cost-integrity gate (Wiring Integrity Audit, item b) ────────────────────
// FS_MODES' single source of truth (frontend/src/lib/config/fsModes.ts),
// duplicated here as a plain literal rather than imported: this script runs
// against a built/rsync'd snapshot server, not through the app's own module
// graph, so it has no static import path into frontend/src. Kept in sync by
// the fsModes/index.json drift test (scripts/check_mode_cost_drift.mjs),
// which both sources.
const MODE_COST_CHECK = [
  { menuId: 'normal',    serverMode: 'base',     cost: 1.0,   kind: 'standing' },
  { menuId: 'cruise',    serverMode: 'cruise',   cost: 1.0,   kind: 'standing' },
  { menuId: 'overboost', serverMode: 'antelite', cost: 1.25,  kind: 'enhancer' },
  { menuId: 'bonus',     serverMode: 'bonus',    cost: 100.0, kind: 'buy' },
  { menuId: 'super',     serverMode: 'super',    cost: 400.0, kind: 'buy' },
]
const COST_CHECK_BET = 1.00

/**
 * For each of the five modes, at a fixed bet: drive the FEATURES menu the way
 * a real player would (SELECT / toggle ON / ACTIVATE+CONFIRM), then assert
 * the round actually recorded (a) the correct server mode and (b) the correct
 * integer-micros debit (bet x MODE_COST[mode], never the wallet's 1,000,000
 * scale confused with the book's 100 (centibet) scale). This is the permanent
 * regression gate for the buy-tier billing bug class (PR #44): a control that
 * looks right but silently charges/serves the wrong tier.
 */
async function runCostIntegrityCheck(page) {
  await waitForTestStores(page)
  await page.evaluate((b) => { window.__testStores.betAmount.set(b) }, COST_CHECK_BET)
  // A high balance so the 400x super-buy check never fails on affordability
  // alone after four prior mode charges have run down the default $100 start.
  await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
  await dismissIntro(page)

  const results = []
  for (const m of MODE_COST_CHECK) {
    await clearQaLog(page)
    await page.locator('[data-testid="feature-menu-button"]').click()
    await page.waitForTimeout(120)

    if (m.kind === 'standing') {
      // 'normal' (base) is the active standing mode from session start, so it
      // shows an ACTIVE tag rather than a SELECT button - nothing to click.
      const selectBtn = page.locator(`[data-testid="standing-select-${m.menuId}"]`)
      if (await selectBtn.count() > 0) await selectBtn.click()
      await page.locator('[data-testid="feature-menu-close"]').click()
      await page.locator('[data-testid="spin-button"]').click()
    } else if (m.kind === 'enhancer') {
      await page.locator(`[data-testid="enhancer-toggle-${m.menuId}"]`).click()
      await page.locator('[data-testid="feature-menu-close"]').click()
      await page.locator('[data-testid="spin-button"]').click()
    } else {
      // buy tier: ACTIVATE opens BuyBonus's confirm modal; CONFIRM fires the spin.
      await page.locator(`[data-testid="activate-${m.menuId}"]`).click()
      await logAction(page, `buy-confirm-${m.menuId}`)
      await page.locator('[data-testid="buy-confirm"]').click()
    }
    await waitSpinDone(page)

    const entries = await readQaLog(page)
    const entry = entries[entries.length - 1]
    const expectedMicros = Math.round(COST_CHECK_BET * m.cost * CURRENCY_SCALE)
    // Both handleSpin (standing/enhancer modes) and handleBuy (buy tiers) log
    // the actual computed `cost` now that standingMode is wired through
    // handleSpin - fall back to `bet` only for defensiveness against an
    // older/mismatched build.
    const actualMicros = entry?.cost !== undefined ? toMicros(entry.cost) : toMicros(entry?.bet ?? NaN)
    const modeOk = entry?.mode === m.serverMode
    const costOk = actualMicros === expectedMicros
    results.push({
      menuId: m.menuId, serverMode: m.serverMode,
      expectedMode: m.serverMode, actualMode: entry?.mode,
      expectedMicros, actualMicros,
      ok: modeOk && costOk,
    })
  }
  return results
}

/**
 * Cost-visibility gate (Fable 2026-07-07 item 2): whenever a standing/enhancer
 * mode changes the real per-spin cost (OVERBOOST) or merely changes which
 * maths curve plays (Cruise), the HUD BET box must show it - the correct
 * mode badge, and for OVERBOOST the correct EFFECTIVE bet figure (bet x
 * MODE_COST[mode]), never the nominal bet-level amount. 'normal' is checked
 * too, asserting NEITHER badge shows (a regression there would be just as
 * misleading as one missing when it should show).
 */
async function runCostVisibilityCheck(page) {
  await waitForTestStores(page)
  await page.evaluate((b) => { window.__testStores.betAmount.set(b) }, COST_CHECK_BET)
  await dismissIntro(page)

  const results = []
  for (const m of MODE_COST_CHECK.filter((x) => x.kind !== 'buy')) {
    await page.locator('[data-testid="feature-menu-button"]').click()
    await page.waitForTimeout(120)
    if (m.kind === 'standing') {
      const selectBtn = page.locator(`[data-testid="standing-select-${m.menuId}"]`)
      if (await selectBtn.count() > 0) await selectBtn.click()
    } else if (m.kind === 'enhancer') {
      await page.locator(`[data-testid="enhancer-toggle-${m.menuId}"]`).click()
    }
    await page.locator('[data-testid="feature-menu-close"]').click()
    await page.waitForTimeout(150)

    const overboostBadge = await page.locator('[data-testid="hud-overboost-badge"]').count() > 0
    const cruiseBadge = await page.locator('[data-testid="hud-cruise-label"]').count() > 0
    const expectBadge = m.menuId === 'overboost' ? 'overboost' : m.menuId === 'cruise' ? 'cruise' : 'none'
    const badgeOk = expectBadge === 'overboost'
      ? (overboostBadge && !cruiseBadge)
      : expectBadge === 'cruise'
        ? (cruiseBadge && !overboostBadge)
        : (!overboostBadge && !cruiseBadge)

    const betText = (await page.locator('[data-testid="hud-bet"] .fs-value').textContent()) ?? ''
    const numeric = parseFloat(betText.replace(/[^0-9.]/g, ''))
    const expectedMicros = Math.round(COST_CHECK_BET * m.cost * CURRENCY_SCALE)
    const actualMicros = toMicros(numeric)
    const figureOk = actualMicros === expectedMicros

    results.push({ menuId: m.menuId, expectBadge, badgeOk, expectedMicros, actualMicros, figureOk, ok: badgeOk && figureOk })
  }
  // Reset to normal so this check never leaves standingMode engaged for a
  // caller running further checks against the same page afterward.
  await page.locator('[data-testid="feature-menu-button"]').click()
  await page.waitForTimeout(120)
  const normalSelect = page.locator('[data-testid="standing-select-normal"]')
  if (await normalSelect.count() > 0) await normalSelect.click()
  await page.locator('[data-testid="feature-menu-close"]').click()
  return results
}

/**
 * Buy-affordability boundary assert (Fable 2026-07-07 ruling on trace finding
 * 2): a balance above the 100x Buy Overdrive cost but below the 400x NITRO
 * OVERDRIVE cost must disable the super ACTIVATE button while leaving bonus
 * enabled. This is what actually protects an unaffordable super buy from
 * being reachable - FeatureMenu's own activateBuy() gate checks the real
 * per-mode cost, not the locked gameStore.canBuyBonus (hardcoded to 100x,
 * known-wrong for super - see CLAUDE.md's LOCKED_FILE_DEBTS - but compensated
 * since it never gates the real click path).
 */
async function runBuyAffordabilityBoundaryCheck(page) {
  await waitForTestStores(page)
  await page.evaluate((b) => { window.__testStores.betAmount.set(b) }, COST_CHECK_BET)
  // 150x the bet: affords the 100x bonus buy, not the 400x super buy.
  await page.evaluate((v) => { window.__testStores.balance.set(v) }, COST_CHECK_BET * 150)
  await dismissIntro(page)

  await page.locator('[data-testid="feature-menu-button"]').click()
  await page.waitForTimeout(150)
  const bonusDisabled = await page.locator('[data-testid="activate-bonus"]').isDisabled()
  const superDisabled = await page.locator('[data-testid="activate-super"]').isDisabled()
  await page.locator('[data-testid="feature-menu-close"]').click()

  return { balanceMultiple: 150, bonusDisabled, superDisabled, ok: !bonusDisabled && superDisabled }
}

// NITRO DEV FUEL (2026-07-15 neon polish pass): every buy-tier mode must
// actually launch its feature against the mock, not just accept the debit.
// Forces a deterministic curated round per tier via ?mockCategory= (see
// frontend/src/lib/mock/roundProvider.ts's serveCategory) so this doesn't
// depend on random luck landing a real trigger, then confirms
// FreeSpinsPresentation's own overlay (data-testid="freespins-overlay",
// gated on featureActive) actually renders - not just that the spin
// completed without error.
const BUY_TIER_MOCK_CATEGORIES = { bonus: 'bonus_win_mid', super: 'super_win_mid' }

async function runBuyTierLaunchesFeatureCheck(browser) {
  const results = []
  for (const [mode, category] of Object.entries(BUY_TIER_MOCK_CATEGORIES)) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    try {
      await page.goto(`${BASE_URL}?mockCategory=${category}`, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await waitForTestStores(page)
      await dismissIntro(page)
      await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
      await page.locator('[data-testid="feature-menu-button"]').click()
      await page.waitForTimeout(150)
      await page.locator(`[data-testid="activate-${mode}"]`).click()
      await page.waitForTimeout(150)
      await page.locator('[data-testid="buy-confirm"]').click()
      await page.waitForFunction(
        () => !document.querySelector('[data-testid="spin-button"].spinning'),
        { timeout: 20000 },
      )
      await page.waitForTimeout(300)
      const featureLaunched = await page.evaluate(
        () => document.querySelectorAll('[data-testid="freespins-overlay"]').length > 0,
      )
      results.push({ mode, category, featureLaunched, ok: featureLaunched })
    } finally {
      await page.close()
    }
  }
  return results
}

// A concurrent session actively editing the same dev server can trigger HMR
// component remounts mid-run; window.__testStores is briefly undefined while
// the new instance's onMount re-populates it. Every access below waits for
// the hook to be ready (and, since Vite's dev-server-restart path in this
// environment has also intermittently killed the connection outright,
// reconnects once) rather than letting one transient window crash 1,000
// spins of otherwise-good data.
async function waitForTestStores(page, timeout = 8000) {
  await page.waitForFunction(
    () => window.__testStores?.locale && window.__testStores?.speedTier && window.__testStores?.balance,
    { timeout },
  )
}

async function setLocale(page, loc) {
  await waitForTestStores(page)
  await page.evaluate((l) => { window.__testStores.locale.set(l) }, loc)
}
async function setSpeedTier(page, tier) {
  await waitForTestStores(page)
  await page.evaluate((t) => { window.__testStores.speedTier.set(t) }, tier)
}
async function readBalance(page) {
  await waitForTestStores(page)
  return page.evaluate(() => {
    let v
    const unsub = window.__testStores.balance.subscribe((x) => { v = x })
    unsub()
    return v
  })
}
// A fair leak check compares *retained* heap after a forced collection, not a
// raw mid-execution snapshot (which mixes real retention with whatever
// garbage GC simply hasn't swept yet) — chromium is launched with
// --js-flags=--expose-gc specifically so this can force one before reading.
async function readHeap(page) {
  return page.evaluate(async () => {
    if (typeof window.gc === 'function') {
      window.gc()
      await new Promise((r) => setTimeout(r, 50))
      window.gc()
    }
    return performance.memory?.usedJSHeapSize ?? null
  })
}
async function clearQaLog(page) {
  await page.evaluate(() => { window.__qaLog = [] })
}
async function readQaLog(page) {
  return page.evaluate(() => window.__qaLog ?? [])
}

async function startFpsSampling(page) {
  await page.evaluate(() => {
    window.__fpsSamples = [] // {t, gap} - t is absolute performance.now(), for event attribution
    window.__actionLog = window.__actionLog ?? [] // {event, t} markers pushed by logAction()
    let last = performance.now()
    function tick(t) {
      window.__fpsSamples.push({ t, gap: t - last })
      last = t
      window.__fpsHandle = requestAnimationFrame(tick)
    }
    window.__fpsHandle = requestAnimationFrame(tick)
  })
}
async function stopFpsSampling(page) {
  return page.evaluate(() => {
    cancelAnimationFrame(window.__fpsHandle)
    return window.__fpsSamples ?? []
  })
}

/** Marks a named game event (spin click, buy click, ...) at its real page-context
 * timestamp, so any long frame nearby can be attributed to what was happening
 * rather than reported as an unexplained hitch. */
async function logAction(page, event) {
  await page.evaluate((e) => {
    window.__actionLog = window.__actionLog ?? []
    window.__actionLog.push({ event: e, t: performance.now() })
  }, event)
}

/** Frame gate with attribution (JOB 2): every sampled frame gap over 100ms gets
 * matched to its nearest logged game-event marker by absolute timestamp, so a
 * known hitch (e.g. the ~150ms buy-moment hitch reel_v3_proof.mjs/
 * motion_v2_proof.mjs found) is either explained by what the frame was doing or
 * shown to no longer reproduce - a diagnostic report, not an additional
 * pass/fail gate on top of the existing avg-fps-vs-55 floor. */
function attributeLongFrames(frameSamples, actionLog, thresholdMs = 100) {
  const longFrames = frameSamples.filter((f) => f.gap > thresholdMs)
  return longFrames.map((f) => {
    let nearest = null
    let nearestDelta = Infinity
    for (const a of actionLog) {
      const delta = Math.abs(a.t - f.t)
      if (delta < nearestDelta) {
        nearestDelta = delta
        nearest = a
      }
    }
    return {
      tMs: Math.round(f.t),
      gapMs: Math.round(f.gap * 10) / 10,
      nearestEvent: nearest?.event ?? null,
      deltaToEventMs: nearest ? Math.round(nearestDelta) : null,
    }
  })
}

/**
 * Run one session (one page load, one social-mode setting) through the
 * locale x speed-tier grid, checking every round. `globalCounter` is a
 * mutable { n } object shared across sessions so heap sampling can target
 * the true 100th/1,000th spin of the continuous soak (session A only).
 */
async function runSession(browser, { social, cellSpins, globalCounter, heapSamples, sampleHeap }) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  const consoleErrors = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

  const url = social ? `${BASE_URL}/?social=true` : BASE_URL
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
  await dismissIntro(page)
  await startFpsSampling(page)

  const roundResults = { checked: 0, totalMismatches: [], balanceDrifts: [] }
  let runningBalanceMicros = toMicros(await readBalance(page))

  for (const locale of LOCALES) {
    await setLocale(page, locale)
    for (const tier of SPEED_TIERS) {
      await setSpeedTier(page, tier)
      const n = cellSpins[tier]
      await clearQaLog(page)

      for (let i = 0; i < n; i++) {
        // Defensive: a stray modal (e.g. an HMR-triggered re-render of the
        // once-per-session intro splash while a dev server is live-edited
        // concurrently) must never silently stall the whole soak.
        await dismissIntro(page)
        await logAction(page, 'spin-click')
        await page.locator('[data-testid="spin-button"]').click()
        await waitSpinDone(page)
        globalCounter.n += 1

        if (sampleHeap && (globalCounter.n === 100 || globalCounter.n === 1000)) {
          await page.waitForTimeout(150) // let any post-spin GC-eligible garbage settle
          heapSamples[globalCounter.n] = await readHeap(page)
        }
      }

      const entries = await readQaLog(page)
      for (const entry of entries) {
        roundResults.checked += 1
        const { ok, recomputedMicros, presentedMicros } = checkRound(entry)
        if (!ok) {
          roundResults.totalMismatches.push({ locale, tier, recomputedMicros, presentedMicros })
        }
        // Use the entry's real per-mode cost when present (standingMode is now
        // wired through handleSpin, so a spin under an active >1x enhancer like
        // OVERBOOST costs more than the base bet) - this matrix only ever
        // exercises base/normal mode, so cost === bet here today, but the check
        // must not assume that forever.
        const betMicros = toMicros(entry.cost ?? entry.bet)
        const winMicros = toMicros(entry.totalWin)
        runningBalanceMicros = runningBalanceMicros - betMicros + winMicros
        const actualMicros = toMicros(entry.balanceAfter)
        if (runningBalanceMicros !== actualMicros) {
          roundResults.balanceDrifts.push({
            locale, tier, expectedMicros: runningBalanceMicros, actualMicros,
            deltaMicros: actualMicros - runningBalanceMicros,
          })
          runningBalanceMicros = actualMicros // resync so one drift doesn't cascade false positives
        }
      }

      log(`  [${social ? 'social-on ' : 'social-off'}] locale=${locale} tier=${tier} spins=${n} (global=${globalCounter.n})`)
    }
  }

  const frameSamples = await stopFpsSampling(page)
  const gaps = frameSamples.slice(5).map((f) => f.gap)
  const avgFps = gaps.length ? 1000 / (gaps.reduce((a, b) => a + b, 0) / gaps.length) : null
  const actionLog = await page.evaluate(() => window.__actionLog ?? [])
  const longFrames = attributeLongFrames(frameSamples.slice(5), actionLog)

  await page.close()
  return { roundResults, consoleErrors, avgFps, totalSpins: globalCounter.n, longFrames }
}

async function run() {
  log(`QA SOAK — start ${new Date(0).toISOString().slice(0, 0) || ''}${new Date().toString()}`)
  log(`Matrix: locales=${LOCALES.join(',')} social=[off,on] speedTiers=${SPEED_TIERS.join(',')}`)
  log(`Session A (social off) per-cell spins: ${JSON.stringify(CELL_SPINS)}`)
  log(`Session B (social on)  per-cell spins: ${JSON.stringify(CELL_SPINS_B)}`)

  const externalUrl = BASE_URL
  let isolated = null
  let ownServer = false
  if (!externalUrl) {
    ownServer = true
    log('Spawning isolated dev server (rsync snapshot, immune to concurrent src edits)...')
    isolated = await startIsolatedDevServer('a')
    BASE_URL = isolated.url
    log(`Isolated dev server ready at ${BASE_URL} (snapshot: ${isolated.isoDir})`)
  } else {
    log(`Using externally-provided QA_SOAK_URL=${BASE_URL}`)
  }

  // --expose-gc lets readHeap() force a real collection before sampling, so
  // the 100th/1,000th-spin comparison is retained heap, not raw allocation.
  const browser = await chromium.launch({ args: ['--js-flags=--expose-gc'] })
  const heapSamples = {}

  try {
    // Resilience: each session's raw result is persisted immediately, and a
    // completed session A can be skipped on retry (QA_SOAK_SKIP_A=1, reusing
    // its cached result) — a shared dev server killed by unrelated concurrent
    // activity between sessions must not throw away an already-passing,
    // expensive 1,000-spin run.
    const sessionAPath = join(OUT_DIR, 'session-a-result.json')
    let sessionA
    if (process.env.QA_SOAK_SKIP_A === '1' && existsSync(sessionAPath)) {
      sessionA = JSON.parse(readFileSync(sessionAPath, 'utf8'))
      log(`Session A SKIPPED (reusing cached result): ${sessionA.totalSpins} spins, avg fps ${sessionA.avgFps?.toFixed(1)}`)
    } else {
      sessionA = await runSession(browser, {
        social: false, cellSpins: CELL_SPINS, globalCounter: { n: 0 }, heapSamples, sampleHeap: true,
      })
      writeFileSync(sessionAPath, JSON.stringify({ ...sessionA, heapSamples }, null, 2))
      log(`Session A complete: ${sessionA.totalSpins} spins, avg fps ${sessionA.avgFps?.toFixed(1)}`)
    }
    if (sessionA.heapSamples) Object.assign(heapSamples, sessionA.heapSamples)

    // Session A alone runs 20-25+ minutes; twice now the isolated server has
    // gone unreachable (ERR_CONNECTION_REFUSED) right at the A-to-B boundary
    // with no evidence in the transient startup log of why. Rather than lose
    // an already-passing 1,000-spin session A to that, session B gets one
    // retry against a *freshly spawned* server (own diagnostics log kept
    // under reports/qa/isolated-server-*.log for post-mortem) before failing.
    let sessionB
    try {
      sessionB = await runSession(browser, {
        social: true, cellSpins: CELL_SPINS_B, globalCounter: { n: 0 }, heapSamples, sampleHeap: false,
      })
    } catch (err) {
      log(`Session B failed on first attempt (${err.message}); restarting isolated server and retrying once...`)
      if (ownServer) {
        stopIsolatedDevServer(isolated, 'a')
        isolated = await startIsolatedDevServer('b-retry')
        BASE_URL = isolated.url
        log(`Isolated dev server (retry) ready at ${BASE_URL} (snapshot: ${isolated.isoDir})`)
      }
      sessionB = await runSession(browser, {
        social: true, cellSpins: CELL_SPINS_B, globalCounter: { n: 0 }, heapSamples, sampleHeap: false,
      })
    }
    writeFileSync(join(OUT_DIR, 'session-b-result.json'), JSON.stringify(sessionB, null, 2))
    log(`Session B complete: ${sessionB.totalSpins} spins, avg fps ${sessionB.avgFps?.toFixed(1)}`)

    log('')
    log('=== COST-INTEGRITY GATE (all five modes, fixed bet) ===')
    // This is the one place a real buy-confirm click happens against a fresh
    // page under fps sampling - the known ~150ms buy-moment hitch (found by
    // reel_v3_proof.mjs/motion_v2_proof.mjs) would show up here with a
    // 'buy-confirm-<mode>' nearestEvent if it still reproduces.
    const costPage = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    let costResults, costLongFrames
    try {
      await costPage.goto(BASE_URL, { waitUntil: 'networkidle' })
      await costPage.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await startFpsSampling(costPage)
      costResults = await runCostIntegrityCheck(costPage)
      const costFrameSamples = await stopFpsSampling(costPage)
      const costActionLog = await costPage.evaluate(() => window.__actionLog ?? [])
      costLongFrames = attributeLongFrames(costFrameSamples.slice(5), costActionLog)
    } finally {
      await costPage.close()
    }
    for (const r of costResults) {
      const status = r.ok ? 'PASS' : 'FAIL'
      log(`  [${status}] ${r.menuId} -> expected mode=${r.expectedMode} micros=${r.expectedMicros}` +
          `, actual mode=${r.actualMode} micros=${r.actualMicros}`)
    }
    const costFailures = costResults.filter((r) => !r.ok)
    writeFileSync(join(OUT_DIR, 'cost-integrity-result.json'), JSON.stringify(costResults, null, 2))

    log('')
    log('=== COST-VISIBILITY GATE (HUD badge + effective bet figure) ===')
    const visPage = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    let visResults
    try {
      await visPage.goto(BASE_URL, { waitUntil: 'networkidle' })
      await visPage.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      visResults = await runCostVisibilityCheck(visPage)
    } finally {
      await visPage.close()
    }
    for (const r of visResults) {
      log(`  [${r.ok ? 'PASS' : 'FAIL'}] ${r.menuId} -> expect badge=${r.expectBadge} (${r.badgeOk ? 'ok' : 'WRONG'})` +
          `, bet figure expected=${r.expectedMicros} actual=${r.actualMicros} (${r.figureOk ? 'ok' : 'WRONG'})`)
    }
    const visFailures = visResults.filter((r) => !r.ok)
    writeFileSync(join(OUT_DIR, 'cost-visibility-result.json'), JSON.stringify(visResults, null, 2))

    log('')
    log('=== BUY-AFFORDABILITY BOUNDARY GATE (150x bet: affords bonus, not super) ===')
    const boundaryPage = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    let boundaryResult
    try {
      await boundaryPage.goto(BASE_URL, { waitUntil: 'networkidle' })
      await boundaryPage.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      boundaryResult = await runBuyAffordabilityBoundaryCheck(boundaryPage)
    } finally {
      await boundaryPage.close()
    }
    log(`  [${boundaryResult.ok ? 'PASS' : 'FAIL'}] bonus disabled=${boundaryResult.bonusDisabled} (expect false),` +
        ` super disabled=${boundaryResult.superDisabled} (expect true)`)
    writeFileSync(join(OUT_DIR, 'buy-affordability-boundary-result.json'), JSON.stringify(boundaryResult, null, 2))

    log('')
    log('=== NITRO DEV FUEL: every buy tier launches its feature against the mock ===')
    const buyLaunchResults = await runBuyTierLaunchesFeatureCheck(browser)
    for (const r of buyLaunchResults) {
      log(`  [${r.ok ? 'PASS' : 'FAIL'}] ${r.mode} (mockCategory=${r.category}) featureLaunched=${r.featureLaunched}`)
    }
    const buyLaunchFailures = buyLaunchResults.filter((r) => !r.ok)
    writeFileSync(join(OUT_DIR, 'buy-tier-launches-feature-result.json'), JSON.stringify(buyLaunchResults, null, 2))

    const totalSpins = sessionA.totalSpins + sessionB.totalSpins
    const totalChecked = sessionA.roundResults.checked + sessionB.roundResults.checked
    const totalMismatches = [...sessionA.roundResults.totalMismatches, ...sessionB.roundResults.totalMismatches]
    const totalDrifts = [...sessionA.roundResults.balanceDrifts, ...sessionB.roundResults.balanceDrifts]
    const totalConsoleErrors = [...sessionA.consoleErrors, ...sessionB.consoleErrors]

    const heap100 = heapSamples[100]
    const heap1000 = heapSamples[1000]
    let heapGrowthPct = null
    if (heap100 != null && heap1000 != null && heap100 > 0) {
      heapGrowthPct = ((heap1000 - heap100) / heap100) * 100
    }

    const avgFpsOverall = [sessionA.avgFps, sessionB.avgFps].filter((x) => x != null)
    const avgFps = avgFpsOverall.length ? avgFpsOverall.reduce((a, b) => a + b, 0) / avgFpsOverall.length : null

    const allLongFrames = [
      ...(sessionA.longFrames ?? []).map((f) => ({ ...f, source: 'session-a' })),
      ...(sessionB.longFrames ?? []).map((f) => ({ ...f, source: 'session-b' })),
      ...costLongFrames.map((f) => ({ ...f, source: 'cost-integrity' })),
    ]
    writeFileSync(join(OUT_DIR, 'frame-gate-attribution-2026-07-13.json'), JSON.stringify(allLongFrames, null, 2))

    const summary = {
      totalSpins,
      totalRoundsChecked: totalChecked,
      exactTotalMismatches: totalMismatches.length,
      balanceDrifts: totalDrifts.length,
      consoleErrors: totalConsoleErrors.length,
      heap100Bytes: heap100 ?? null,
      heap1000Bytes: heap1000 ?? null,
      heapGrowthPct,
      avgFpsSessionA: sessionA.avgFps,
      avgFpsSessionB: sessionB.avgFps,
      avgFpsOverall: avgFps,
      costIntegrityFailures: costFailures.length,
      costVisibilityFailures: visFailures.length,
      buyAffordabilityBoundaryOk: boundaryResult.ok,
      buyTierLaunchesFeatureFailures: buyLaunchFailures.length,
      framesOver100ms: allLongFrames.length,
    }

    log('')
    log('=== SUMMARY ===')
    log(JSON.stringify(summary, null, 2))
    if (totalMismatches.length) log('MISMATCHES:\n' + JSON.stringify(totalMismatches, null, 2))
    if (totalDrifts.length) log('BALANCE DRIFTS:\n' + JSON.stringify(totalDrifts, null, 2))
    if (totalConsoleErrors.length) log('CONSOLE ERRORS:\n' + JSON.stringify(totalConsoleErrors, null, 2))
    if (costFailures.length) log('COST-INTEGRITY FAILURES:\n' + JSON.stringify(costFailures, null, 2))
    if (visFailures.length) log('COST-VISIBILITY FAILURES:\n' + JSON.stringify(visFailures, null, 2))
    if (!boundaryResult.ok) log('BUY-AFFORDABILITY BOUNDARY FAILURE:\n' + JSON.stringify(boundaryResult, null, 2))
    if (buyLaunchFailures.length) log('BUY-TIER-LAUNCHES-FEATURE FAILURES:\n' + JSON.stringify(buyLaunchFailures, null, 2))
    if (allLongFrames.length) log('FRAMES OVER 100ms (attributed):\n' + JSON.stringify(allLongFrames, null, 2))
    else log('FRAME GATE: no frames over 100ms sampled this run (the known ~150ms buy-moment hitch did not reproduce)')

    writeFileSync(join(OUT_DIR, 'soak-1-summary.json'), JSON.stringify(summary, null, 2))

    let fail = false
    if (totalSpins < 1000) { log(`FAIL: only ${totalSpins} spins (< 1000)`); fail = true }
    if (totalMismatches.length > 0) { log(`FAIL: ${totalMismatches.length} exact-total mismatches`); fail = true }
    if (totalDrifts.length > 0) { log(`FAIL: ${totalDrifts.length} balance drift(s)`); fail = true }
    if (totalConsoleErrors.length > 0) { log(`FAIL: ${totalConsoleErrors.length} console error(s)`); fail = true }
    if (heapGrowthPct != null && Math.abs(heapGrowthPct) > 15) { log(`FAIL: heap growth ${heapGrowthPct.toFixed(1)}% (> 15%)`); fail = true }
    if (avgFps != null && avgFps < 55) { log(`FAIL: avg fps ${avgFps.toFixed(1)} (< 55)`); fail = true }
    if (costFailures.length > 0) { log(`FAIL: ${costFailures.length} cost-integrity mismatch(es) (see COST-INTEGRITY FAILURES above)`); fail = true }
    if (visFailures.length > 0) { log(`FAIL: ${visFailures.length} cost-visibility mismatch(es) (see COST-VISIBILITY FAILURES above)`); fail = true }
    if (!boundaryResult.ok) { log('FAIL: buy-affordability boundary gate (see BUY-AFFORDABILITY BOUNDARY FAILURE above)'); fail = true }
    if (buyLaunchFailures.length > 0) { log(`FAIL: ${buyLaunchFailures.length} buy tier(s) did not launch their feature (see BUY-TIER-LAUNCHES-FEATURE FAILURES above)`); fail = true }

    if (fail) {
      log('QA SOAK: FAILURES DETECTED')
      process.exitCode = 1
      return
    }
    log('QA SOAK: ALL GATES PASS')
  } finally {
    await browser.close().catch(() => {})
    stopIsolatedDevServer(isolated, 'final')
  }
}

run().catch((err) => {
  log('FATAL: ' + (err?.stack ?? String(err)))
  process.exit(1)
})
