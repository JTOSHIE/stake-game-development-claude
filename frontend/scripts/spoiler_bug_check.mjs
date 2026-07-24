// spoiler_bug_check.mjs — OWNER AUDIT ROUND 2, item 1 hard assert.
//
// Proves the spoiler bug is actually fixed, not just "looks right":
//   1. The persistent HUD WIN box ($winAmount) never shows anything but
//      $0.00 for the ENTIRE duration of a triggered feature - it only jumps
//      to the true total once the feature has fully finished (the settled
//      round happens after presentFeature resolves - see App.svelte's
//      settleRound() deferral).
//   2. The in-feature TOTAL WIN field (BonusInstrumentColumn, sourced from
//      FreeSpinsPresentation's own runningTotalCentibets) equals EXACTLY the
//      sum of spins 1..k after spin k has played - never the round's final
//      total early.
//   3. The entry card's CLICK TO CONTINUE gate actually blocks progression
//      until clicked.
//
// Run (from frontend/): node scripts/spoiler_bug_check.mjs

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'owner-audit-v2', 'spoiler-bug')
mkdirSync(OUT_DIR, { recursive: true })

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

function startDevServer(port) {
  return new Promise((resolvePreview, reject) => {
    const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] })
    let resolved = false
    const onData = (d) => {
      const s = d.toString()
      if (!resolved && /Local/.test(s)) { resolved = true; resolvePreview(proc) }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', reject)
    setTimeout(() => { if (!resolved) reject(new Error('vite dev server did not start in time')) }, 15000)
  })
}

async function dismissIntro(page) {
  const splash = page.locator('[data-testid="hero-splash"]')
  if (await splash.count() > 0 && await splash.isVisible().catch(() => false)) {
    await splash.click()
    await page.waitForTimeout(100)
  }
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await btn.click()
    await page.waitForTimeout(100)
  }
}

function moneyToNumber(text) {
  return Number(String(text).replace(/[^0-9.-]/g, ''))
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  // base/retrigger: multiple free spins including a retrigger - the
  // strongest exercise of the per-spin running total.
  const baseUrl = `http://localhost:${port}?mockCategory=retrigger`
  const failures = []
  const assert = (cond, msg) => {
    if (!cond) failures.push(msg)
    console.log(`${cond ? 'PASS' : 'FAIL'}: ${msg}`)
  }

  try {
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await page.waitForFunction(() => window.__testStores?.balance, { timeout: 8000 })
    await dismissIntro(page)
    await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
    await page.waitForTimeout(200)
    await page.screenshot({ path: join(OUT_DIR, '1-idle.png') })

    await page.locator('[data-testid="spin-button"]').click()

    // 1. The entry gate must actually appear and block - never auto-advance.
    await page.waitForSelector('[data-testid="entry-continue"]', { timeout: 8000 })
    await page.waitForTimeout(600)
    const stillGated = await page.locator('[data-testid="entry-continue"]').isVisible()
    assert(stillGated, 'entry CLICK TO CONTINUE gate is still visible after 600ms (does not auto-advance)')
    await page.screenshot({ path: join(OUT_DIR, '2-entry-gate.png') })

    // 2. Nothing has spoiled yet - the persistent HUD WIN box is still $0.
    const hudWinAtGate = await page.locator('[data-testid="hud-win"]').first().innerText()
    assert(moneyToNumber(hudWinAtGate) === 0, `HUD WIN box reads $0 at the entry gate (was "${hudWinAtGate}")`)

    // Pull the script's own known-good per-spin totals for independent
    // verification (dev-only hook, FreeSpinsPresentation.svelte).
    const scriptData = await page.evaluate(() => window.__qaFeatureScript?.script ?? null)
    if (!scriptData) throw new Error('window.__qaFeatureScript not populated - dev hook missing or round did not trigger')
    // Svelte writable stores expose no plain "current value" getter on
    // window - subscribe() calls back synchronously with the current value,
    // so subscribing then immediately unsubscribing reads it without
    // importing svelte/store into the page.
    const bet = await page.evaluate(() => {
      let v
      window.__testStores.betAmount.subscribe((x) => { v = x })()
      return v
    })
    console.log(`round: ${scriptData.freeSpins.length} free spins, totalWinCentibets=${scriptData.totalWinCentibets}, bet=${bet}`)

    // { force: true }: the button has a continuous CSS pulse animation
    // (by design - "small but alive"), so its bounding box never settles
    // long enough for Playwright's default actionability stability check -
    // that's a testability quirk of the animation, not evidence the button
    // is unclickable to a real pointer click.
    await page.locator('[data-testid="entry-continue"]').click({ force: true })

    for (let i = 0; i < scriptData.freeSpins.length; i++) {
      await page.waitForFunction(
        (idx) => window.__qaFeatureScript?.spinIndex === idx && window.__qaFeatureScript?.phase === 'spin',
        i,
        { timeout: 15000 },
      )
      // Read the displayed running total right as this spin lands. :visible
      // matters here: App.svelte permanently warm-mounts a second, hidden
      // (visibility:hidden after its one-time paint) BonusInstrumentColumn
      // instance (Reel Feel v3 pre-paint) sharing the exact same
      // data-testid, pinned at runningTotalCentibets=0 forever - without
      // :visible this locator ambiguously matches both.
      const displayed = await page.locator('[data-testid="feature-total-win"] .plate-value:visible, [data-testid="feature-total-win"] .pm-value:visible').first().innerText()
      const expectedCentibets = scriptData.freeSpins[i].runningTotalCentibets
      const expectedDollars = Math.round((expectedCentibets / 100) * bet * 100) / 100
      const displayedDollars = moneyToNumber(displayed)
      assert(
        Math.abs(displayedDollars - expectedDollars) < 0.01,
        `spin ${i + 1}/${scriptData.freeSpins.length}: TOTAL WIN reads ${displayed} (expected sum of spins 1..${i + 1} = $${expectedDollars.toFixed(2)})`,
      )
      // The final total must never appear before the LAST spin.
      if (i < scriptData.freeSpins.length - 1) {
        const finalDollars = Math.round((scriptData.totalWinCentibets / 100) * bet * 100) / 100
        assert(
          Math.abs(displayedDollars - finalDollars) > 0.005 || Math.abs(expectedDollars - finalDollars) < 0.005,
          `spin ${i + 1}: displayed total ($${displayedDollars.toFixed(2)}) is not the round's FINAL total ($${finalDollars.toFixed(2)}) early`,
        )
      }
      // HUD WIN box must still read $0 - the settlement hasn't landed yet.
      const hudWinMid = await page.locator('[data-testid="hud-win"]').first().innerText()
      assert(moneyToNumber(hudWinMid) === 0, `spin ${i + 1}: HUD WIN box still reads $0 mid-feature (was "${hudWinMid}")`)
    }
    await page.screenshot({ path: join(OUT_DIR, '3-mid-feature.png') })

    // 3. Feature-end celebration shows, then the round finally settles.
    await page.waitForSelector('[data-testid="win-banner"]', { timeout: 15000 })
    await page.screenshot({ path: join(OUT_DIR, '4-end-celebration.png') })

    // App.svelte permanently warm-mounts a second, always-active
    // FreeSpinsPresentation instance (Reel Feel v3 pre-paint) inside a
    // hidden .warm-mount container - it shares this exact testid and is
    // ALWAYS present in the DOM regardless of real feature state, so a
    // plain querySelector never sees "detached". Excluding .warm-mount
    // descendants is what actually detects the real overlay closing.
    await page.waitForFunction(
      () => ![...document.querySelectorAll('[data-testid="freespins-overlay"]')].some((el) => !el.closest('.warm-mount')),
      { timeout: 40000 },
    )
    // HudOverlay's WIN box count-up animates to the settled value (up to
    // WIN_COUNTUP_MAX_MS=800ms) - give it time to actually finish before
    // reading the final figure.
    await page.waitForTimeout(1000)
    const finalHudWin = await page.locator('[data-testid="hud-win"]').first().innerText()
    const finalExpected = Math.round((scriptData.totalWinCentibets / 100) * bet * 100) / 100
    assert(
      Math.abs(moneyToNumber(finalHudWin) - finalExpected) < 0.01,
      `after the feature ends, HUD WIN box settles to the true final total ${finalExpected.toFixed(2)} (was "${finalHudWin}")`,
    )
    await page.screenshot({ path: join(OUT_DIR, '5-settled.png') })

    await browser.close()
  } finally {
    server.kill()
  }

  console.log('')
  console.log(failures.length === 0 ? 'SPOILER BUG CHECK: PASS' : `SPOILER BUG CHECK: FAIL (${failures.length} failure(s))`)
  if (failures.length > 0) {
    failures.forEach((f) => console.log(`  - ${f}`))
    process.exitCode = 1
  }
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
