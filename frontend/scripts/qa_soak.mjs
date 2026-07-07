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
    const onData = (d) => { if (!resolved && /Local:/.test(d.toString())) { resolved = true; resolvePromise() } }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', reject)
    proc.on('exit', (code) => { if (!resolved) reject(new Error(`isolated vite server exited early (code ${code})`)) })
    setTimeout(() => { if (!resolved) reject(new Error('isolated vite server did not start in time')) }, 15000)
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
  await page.waitForFunction(() => !document.querySelector('.spin-btn.spinning'), { timeout })
}

async function dismissIntro(page) {
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await btn.click()
    await page.waitForTimeout(100)
  }
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
    window.__fpsSamples = []
    let last = performance.now()
    function tick(t) {
      window.__fpsSamples.push(t - last)
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
  await page.waitForSelector('.spin-btn', { timeout: 15000 })
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
        await page.locator('.spin-btn').click()
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
        const betMicros = toMicros(entry.bet)
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

  const frameTimes = await stopFpsSampling(page)
  const gaps = frameTimes.slice(5)
  const avgFps = gaps.length ? 1000 / (gaps.reduce((a, b) => a + b, 0) / gaps.length) : null

  await page.close()
  return { roundResults, consoleErrors, avgFps, totalSpins: globalCounter.n }
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
    }

    log('')
    log('=== SUMMARY ===')
    log(JSON.stringify(summary, null, 2))
    if (totalMismatches.length) log('MISMATCHES:\n' + JSON.stringify(totalMismatches, null, 2))
    if (totalDrifts.length) log('BALANCE DRIFTS:\n' + JSON.stringify(totalDrifts, null, 2))
    if (totalConsoleErrors.length) log('CONSOLE ERRORS:\n' + JSON.stringify(totalConsoleErrors, null, 2))

    writeFileSync(join(OUT_DIR, 'soak-1-summary.json'), JSON.stringify(summary, null, 2))

    let fail = false
    if (totalSpins < 1000) { log(`FAIL: only ${totalSpins} spins (< 1000)`); fail = true }
    if (totalMismatches.length > 0) { log(`FAIL: ${totalMismatches.length} exact-total mismatches`); fail = true }
    if (totalDrifts.length > 0) { log(`FAIL: ${totalDrifts.length} balance drift(s)`); fail = true }
    if (totalConsoleErrors.length > 0) { log(`FAIL: ${totalConsoleErrors.length} console error(s)`); fail = true }
    if (heapGrowthPct != null && Math.abs(heapGrowthPct) > 15) { log(`FAIL: heap growth ${heapGrowthPct.toFixed(1)}% (> 15%)`); fail = true }
    if (avgFps != null && avgFps < 55) { log(`FAIL: avg fps ${avgFps.toFixed(1)} (< 55)`); fail = true }

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
