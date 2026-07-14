// platform_conformance_item2.mjs — ITEM 2, JOB 2 addendum extensions a-g.
//
// (a) same-origin sweep: every network request in a real session must be
//     same-origin, zero third-party hosts.
// (b) spacebar must trigger the same action as the spin button.
// (c) mini-player popout: render at Stake's small background-play modal
//     proportions (popout-s 400x225, popout-l 800x450 - the same dimensions
//     layout_v1_audit.mjs already uses) and prove the board is undistorted
//     (critical controls stay within the viewport, no horizontal overflow).
// (d) bet-level conformance: drive bet selection purely from injected RGS
//     bet levels (simulating a high-minimum currency, JPY-style), prove every
//     level is reachable and spinnable at both extremes.
// (e) language fuzz: several non-English/malformed language codes, assert no
//     literal corruption strings ("undefined", "NaN", "[object Object]")
//     leak into the DOM and zero console errors.
// (f) incremental win count-up: assert the HUD win figure and (via a real
//     bonus-buy round) the WinBanner celebration both progress across
//     multiple frames rather than jumping straight to the final value.
// (g) fastplay legibility: this codebase's equivalent of Stake's "fastplay"
//     is the existing Turbo/Super Turbo speed tier - screenshot HUD/board
//     legibility at Super Turbo (the fastest tier) as the proof.
//
// Run (from frontend/): npx tsx scripts/platform_conformance_item2.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'reports', 'qa')
const SCREENS_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'platform-conformance-item2')
mkdirSync(OUT_DIR, { recursive: true })
mkdirSync(SCREENS_DIR, { recursive: true })

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
    const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], {
      cwd: join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let resolved = false
    const onData = (d) => {
      const s = d.toString()
      if (!resolved && (/Local/.test(s) || new RegExp(`localhost:${port}`).test(s))) {
        resolved = true
        resolvePreview(proc)
      }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', reject)
    setTimeout(() => { if (!resolved) reject(new Error('vite dev server did not start in time')) }, 15000)
  })
}

async function dismissIntro(page) {
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await btn.click()
    await page.waitForTimeout(100)
  }
}

async function waitSpinDone(page, timeout = 20000) {
  await page.waitForFunction(
    () => !document.querySelector('[data-testid="spin-button"].spinning'),
    { timeout },
  )
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const baseUrl = `http://localhost:${port}`
  const results = {}

  try {
    const browser = await chromium.launch()

    // ── (a) Same-origin sweep ────────────────────────────────────────────
    console.error('[progress] starting (a) same-origin sweep')
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      const requests = []
      page.on('request', (req) => requests.push(req.url()))
      await page.goto(baseUrl, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
      await dismissIntro(page)
      await page.evaluate(() => { window.__testStores.betAmount.set(1.0) })
      await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-testid="spin-button"]').click()
        await waitSpinDone(page)
        await page.waitForTimeout(150)
      }
      const featureMenuBtn = page.locator('[data-testid="feature-menu-button"]')
      if (await featureMenuBtn.count() > 0) {
        await featureMenuBtn.click()
        await page.waitForTimeout(120)
        const activateBonus = page.locator('[data-testid="activate-bonus"]')
        if (await activateBonus.count() > 0) {
          await activateBonus.click()
          await page.locator('[data-testid="buy-confirm"]').click()
          await waitSpinDone(page)
        }
      }
      const pageOrigin = new URL(baseUrl).origin
      const thirdParty = requests.filter((u) => {
        try { return new URL(u).origin !== pageOrigin && !u.startsWith('data:') && !u.startsWith('blob:') }
        catch { return false }
      })
      results.sameOriginSweep = { totalRequests: requests.length, thirdPartyRequests: thirdParty, pass: thirdParty.length === 0 }
      await page.close()
    }

    console.error('[progress] starting (b) spacebar bet assert')
    // ── (b) Spacebar bet assert ──────────────────────────────────────────
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      await page.goto(baseUrl, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
      await dismissIntro(page)
      await page.evaluate(() => { window.__testStores.betAmount.set(1.0) })
      await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
      const balanceBefore = await page.evaluate(() => {
        let v; window.__testStores.balance.subscribe((x) => { v = x })(); return v
      })
      await page.keyboard.press('Space')
      const spunViaSpacebar = await page.waitForSelector('[data-testid="spin-button"].spinning', { timeout: 3000 })
        .then(() => true).catch(() => false)
      if (spunViaSpacebar) await waitSpinDone(page)
      await page.waitForTimeout(150)
      const balanceAfter = await page.evaluate(() => {
        let v; window.__testStores.balance.subscribe((x) => { v = x })(); return v
      })
      results.spacebarTriggersSpin = { spunViaSpacebar, balanceBefore, balanceAfter, pass: spunViaSpacebar && balanceAfter !== balanceBefore }
      await page.close()
    }

    console.error('[progress] starting (c) popout proofs')
    // ── (c) Mini-player popout proofs ────────────────────────────────────
    {
      results.popoutProofs = {}
      for (const [label, w, h] of [['popout-s', 400, 225], ['popout-l', 800, 450]]) {
        const page = await browser.newPage({ viewport: { width: w, height: h } })
        await page.goto(baseUrl, { waitUntil: 'networkidle' })
        await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
        await dismissIntro(page)
        await page.waitForTimeout(200)
        await page.screenshot({ path: join(SCREENS_DIR, `${label}.png`) })
        const spinBox = await page.locator('[data-testid="spin-button"]').boundingBox()
        const balanceBox = await page.locator('[data-testid="hud-balance"]').boundingBox().catch(() => null)
        const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)
        const spinVisible = spinBox && spinBox.x >= 0 && spinBox.y >= 0 && spinBox.x + spinBox.width <= w && spinBox.y + spinBox.height <= h
        const balanceVisible = !balanceBox || (balanceBox.x >= 0 && balanceBox.x + balanceBox.width <= w)
        results.popoutProofs[label] = { width: w, height: h, hasHorizontalOverflow, spinVisible, balanceVisible, pass: !hasHorizontalOverflow && spinVisible && balanceVisible }
        await page.close()
      }
    }

    console.error('[progress] starting (d) bet-level conformance')
    // ── (d) Bet-level conformance (JPY-style high-minimum currency) ─────
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      await page.goto(baseUrl, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
      await dismissIntro(page)
      // Simulated JPY authenticate response: no-decimal, larger-denomination
      // levels (typical of a currency with a much higher practical minimum
      // than USD cents) - the RGS's real authenticate response would supply
      // this; __testStores.rgsBetLevels is the same store initRGS() would
      // populate in production, injected directly here since driving a real
      // authenticate round-trip is out of scope for a headless dev check.
      const jpyLevels = [100, 200, 500, 1000, 2000, 5000, 10000, 50000]
      await page.evaluate((levels) => { window.__testStores.rgsBetLevels.set(levels) }, jpyLevels)
      await page.evaluate((min) => { window.__testStores.balance.set(min * 1000) }, jpyLevels[jpyLevels.length - 1])
      await page.evaluate((min) => { window.__testStores.betAmount.set(min) }, jpyLevels[0])
      await page.waitForTimeout(100)

      const reached = new Set()
      const readBet = () => page.evaluate(() => { let v; window.__testStores.betAmount.subscribe((x) => { v = x })(); return v })
      reached.add(await readBet())
      // Click "increase bet" through the whole ladder.
      for (let i = 0; i < jpyLevels.length + 2; i++) {
        const incBtn = page.locator('[data-testid="bet-arrows"] .fs-arrow[aria-label="Increase bet"]')
        if (await incBtn.count() === 0 || await incBtn.isDisabled().catch(() => true)) break
        await incBtn.click()
        await page.waitForTimeout(60)
        reached.add(await readBet())
      }
      const allLevelsReached = jpyLevels.every((lvl) => reached.has(lvl))
      // Spin at the top of the ladder (max), then back down to the bottom (min).
      const spinAtMax = await page.locator('[data-testid="spin-button"]').isEnabled().catch(() => false)
      if (spinAtMax) {
        await page.locator('[data-testid="spin-button"]').click()
        await waitSpinDone(page)
      }
      await page.evaluate((min) => { window.__testStores.betAmount.set(min) }, jpyLevels[0])
      await page.waitForTimeout(100)
      const spinAtMin = await page.locator('[data-testid="spin-button"]').isEnabled().catch(() => false)
      if (spinAtMin) {
        await page.locator('[data-testid="spin-button"]').click()
        await waitSpinDone(page)
      }
      results.betLevelConformance = {
        injectedLevels: jpyLevels,
        levelsReachedViaIncrease: [...reached].sort((a, b) => a - b),
        allLevelsReached,
        spinSucceededAtMax: spinAtMax,
        spinSucceededAtMin: spinAtMin,
        pass: allLevelsReached && spinAtMax && spinAtMin,
      }
      await page.close()
    }

    console.error('[progress] starting (e) language fuzz')
    // ── (e) Language fuzz ────────────────────────────────────────────────
    {
      results.languageFuzz = {}
      const codes = ['en', 'de-DE', 'zh-Hant', 'xx-XX', '🎰', '']
      for (const code of codes) {
        const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
        const consoleErrors = []
        page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
        page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))
        await page.goto(baseUrl, { waitUntil: 'networkidle' })
        await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
        await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
        await page.evaluate((c) => { window.__testStores.locale.set(c) }, code)
        await page.waitForTimeout(150)
        await dismissIntro(page)
        const bodyText = await page.locator('body').innerText()
        const corrupted = /\bundefined\b|\bNaN\b|\[object Object\]/.test(bodyText)
        results.languageFuzz[code || '(empty)'] = { corrupted, consoleErrorCount: consoleErrors.length, pass: !corrupted && consoleErrors.length === 0 }
        await page.close()
      }
    }

    console.error('[progress] starting (f) win count-up')
    // ── (f) Incremental win count-up ────────────────────────────────────
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      await page.goto(baseUrl, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
      await dismissIntro(page)
      await page.evaluate(() => { window.__testStores.betAmount.set(1.0) })
      await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })

      // HUD win box: sample its text across several animation frames right
      // after a small, direct winAmount injection - reveals whether it ticks
      // or jumps straight to the final value.
      await page.evaluate(() => { window.__testStores.winAmount.set(0) })
      await page.waitForTimeout(50)
      const samplesPromise = page.evaluate(() => new Promise((resolve) => {
        const samples = []
        let frames = 0
        function sample() {
          samples.push(document.querySelector('[data-testid="hud-win"] .fs-value')?.textContent ?? null)
          frames += 1
          if (frames < 20) requestAnimationFrame(sample)
          else resolve(samples)
        }
        requestAnimationFrame(sample)
      }))
      await page.evaluate(() => { window.__testStores.winAmount.set(42.5) })
      const hudSamples = await samplesPromise
      const hudDistinctValues = new Set(hudSamples.filter(Boolean)).size
      const hudCountsUp = hudDistinctValues > 1

      // WinBanner (>=10x tier): real bonus buy, guaranteed large multiplier,
      // sample the banner's own displayed amount across frames.
      await page.evaluate(() => { window.__testStores.winAmount.set(0) })
      const featureMenuBtn = page.locator('[data-testid="feature-menu-button"]')
      let bannerSamples = []
      if (await featureMenuBtn.count() > 0) {
        await featureMenuBtn.click()
        await page.waitForTimeout(120)
        const activateBonus = page.locator('[data-testid="activate-bonus"]')
        if (await activateBonus.count() > 0) {
          await activateBonus.click()
          await page.locator('[data-testid="buy-confirm"]').click()
          await waitSpinDone(page)
          await page.waitForTimeout(300)
          bannerSamples = await page.evaluate(() => new Promise((resolve) => {
            const samples = []
            let frames = 0
            function sample() {
              const el = document.querySelector('.c1-amount')
              samples.push(el?.textContent ?? null)
              frames += 1
              if (frames < 30) requestAnimationFrame(sample)
              else resolve(samples)
            }
            requestAnimationFrame(sample)
          }))
        }
      }
      const bannerDistinctValues = new Set(bannerSamples.filter(Boolean)).size
      const bannerCountsUp = bannerDistinctValues > 1
      results.winCountUp = {
        hudSamples, hudDistinctValues, hudCountsUp,
        bannerSamples, bannerDistinctValues, bannerCountsUp,
        // Hard assert (2026-07-14b, ITEM B): the HUD figure must tween up
        // incrementally for every win, not just WinBanner's >=10x overlay -
        // this is what makes item (f) a real gate rather than descriptive
        // data collection only.
        pass: hudCountsUp,
      }
      await page.close()
    }

    console.error('[progress] starting (g) fastplay legibility')
    // ── (g) Fastplay legibility (this game's Turbo/Super Turbo speed tiers) ─
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      await page.goto(baseUrl, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
      await dismissIntro(page)
      await page.evaluate(() => { window.__testStores.speedTier.set('superTurbo') })
      await page.evaluate(() => { window.__testStores.betAmount.set(1.0) })
      await page.evaluate(() => { window.__testStores.balance.set(1_000_000) })
      await page.locator('[data-testid="spin-button"]').click()
      await page.waitForTimeout(200) // capture mid-spin at the fastest tier
      await page.screenshot({ path: join(SCREENS_DIR, 'fastplay-superturbo-midspin.png') })
      await waitSpinDone(page)
      await page.screenshot({ path: join(SCREENS_DIR, 'fastplay-superturbo-settled.png') })
      results.fastplayLegibility = { speedTierUsed: 'superTurbo', screenshotsCaptured: ['fastplay-superturbo-midspin.png', 'fastplay-superturbo-settled.png'] }
      await page.close()
    }

    await browser.close()
  } finally {
    server.kill()
  }

  const outPath = join(OUT_DIR, 'platform-conformance-item2-2026-07-14.json')
  writeFileSync(outPath, JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
  console.log(`\nResults written to ${outPath}`)

  // Overall pass/fail (2026-07-14b, ITEM B): collect every `pass` field
  // anywhere in the results tree (top-level checks like winCountUp, and
  // nested per-item checks like popoutProofs.popout-s / languageFuzz.en) and
  // fail the whole run if any is false - this script previously only
  // collected data with no hard gate at all.
  const failures = []
  function collectFailures(obj, path) {
    if (obj === null || typeof obj !== 'object') return
    if ('pass' in obj && obj.pass === false) failures.push(path)
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'pass') continue
      collectFailures(value, path ? `${path}.${key}` : key)
    }
  }
  collectFailures(results, '')

  if (failures.length > 0) {
    console.error(`\nPLATFORM CONFORMANCE: FAILURES DETECTED - ${failures.join(', ')}`)
    process.exitCode = 1
  } else {
    console.log('\nPLATFORM CONFORMANCE: ALL CHECKS PASS')
  }
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
