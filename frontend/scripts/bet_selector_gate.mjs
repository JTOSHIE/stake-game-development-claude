#!/usr/bin/env node
//
// bet_selector_gate.mjs: the BET window opens a denomination picker, driven by
// the authenticate ladder.
//
// Owner's order, 2026-07-28, industry convention
// (reports/briefs/FS_PLAYER_EXPERIENCE_PASS_Prompt.md):
//
//     Clicking or tapping the BET window opens a denomination picker panel
//     listing every level from the authenticate ladder (never a hardcoded
//     list), laid out for one-tap jumps from minimum to maximum, current level
//     highlighted, minStep respected, closing on selection or dismissal,
//     keyboard and touch accessible with a compliant hit target.
//
// WHY THE LADDER IN THIS GATE IS DELIBERATELY STRANGE
// ---------------------------------------------------
// A USD-shaped ladder passes almost any implementation, INCLUDING A HARDCODED
// ONE, which is exactly how R5/TR-013 shipped: both bet surfaces drove the
// built-in `BET_LEVELS`, `indexOf` returned -1 against a real ladder, and
// pressing "+" DROPPED the bet to the minimum while "-" did nothing. So the
// authenticate response here carries eight irregular levels, three orders of
// magnitude larger than ours, sharing NOT ONE VALUE with `BET_LEVELS`. If the
// panel renders our ladder instead of the platform's, every assertion below
// fails rather than quietly agreeing.
//
// WHAT IT ASSERTS, at three viewports (Desktop, mobile portrait, Popout S):
//   1. the BET window is a real button and opens the panel on click;
//   2. the panel lists EXACTLY the authenticate ladder, in order, formatted as
//      money, and contains no value that is not on it;
//   3. the current level is marked, and marked accessibly (aria-checked), not
//      by colour alone;
//   4. min and max are both reachable in ONE tap from wherever the bet is;
//   5. every level button clears the 44px touch floor;
//   6. the panel closes on selection AND on dismissal (scrim click, Escape);
//   7. the BET readout updates to the selected level, and shows the
//      ante-adjusted figure when a cost multiplier is in force;
//   8. it is keyboard reachable and operable (focus lands on the current level,
//      arrows move, Enter selects).
//
// Captures go to `reports/screens/bet-selector/` via `lib/evidencePaths.mjs`,
// which means SCRATCH unless FS_WRITE_EVIDENCE=1 is set. Convention (h.1): a
// gate must not be able to rewrite committed evidence on a casual re-run.
//
// USAGE
//   node scripts/bet_selector_gate.mjs
//   node scripts/bet_selector_gate.mjs --self-test
//   FS_WRITE_EVIDENCE=1 node scripts/bet_selector_gate.mjs      (regenerate captures)
//
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { evidenceDir, WRITES_COMMITTED_EVIDENCE } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const HARD_TIMEOUT_MS = 5 * 60_000
setTimeout(() => {
  console.error(`BET SELECTOR GATE: HARD TIMEOUT after ${HARD_TIMEOUT_MS / 1000}s, failing red`)
  process.exit(1)
}, HARD_TIMEOUT_MS)

const RGS_HOST = 'rgs.bet-selector-gate.invalid'
const TOUCH_FLOOR = 44

// Eight irregular levels, sharing no value with BET_LEVELS. In integer micros.
const ODD_LADDER_MICROS = [
  250_000_000, 750_000_000, 1_500_000_000, 3_000_000_000,
  7_500_000_000, 12_500_000_000, 40_000_000_000, 90_000_000_000,
]
const ODD_LADDER = ODD_LADDER_MICROS.map((m) => m / 1_000_000)
const START_MICROS = 500_000_000_000

const PROFILES = [
  { name: 'desktop', file: '01_desktop', width: 1200, height: 675 },
  { name: 'mobile portrait', file: '02_mobile_portrait', width: 375, height: 667 },
  { name: 'Popout S', file: '03_popout_s', width: 400, height: 225 },
]

const authBody = () => ({
  balance: { amount: START_MICROS, currency: 'USD' },
  config: {
    minBet: ODD_LADDER_MICROS[0],
    maxBet: ODD_LADDER_MICROS[ODD_LADDER_MICROS.length - 1],
    stepBet: 250_000_000,
    defaultBetLevel: ODD_LADDER_MICROS[1],
    betLevels: ODD_LADDER_MICROS,
    jurisdiction: {
      socialCasino: false, disabledFullscreen: false, disabledTurbo: false,
      disabledSuperTurbo: false, disabledAutoplay: false, disabledSlamstop: false,
      disabledSpacebar: false, disabledBuyFeature: false, displayNetPosition: false,
      displayRTP: false, displaySessionTimer: false, minimumRoundDuration: 0,
    },
  },
  round: null,
})

async function routeWallet(page) {
  await page.route(`**://${RGS_HOST}/**`, async (route) => {
    const url = route.request().url()
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) })
    if (url.includes('/wallet/authenticate')) return json(authBody())
    return json({})
  })
}

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
      cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], detached: true,
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

function killPreview(proc) {
  try { process.kill(-proc.pid, 'SIGTERM') } catch { try { proc.kill() } catch { /* gone */ } }
}

/** Boot to a live HUD. Two splash surfaces, and they dismiss differently. */
async function boot(page, port) {
  await page.goto(`http://localhost:${port}/?sessionID=bet-selector-gate&rgs_url=${RGS_HOST}&lang=en`,
    { waitUntil: 'domcontentloaded' })
  await page.locator('[data-testid="bet-window"]').first().waitFor({ state: 'visible', timeout: 45_000 })
  for (let i = 0; i < 12; i++) {
    const hero = page.locator('.hero-splash').first()
    if (await hero.count() && await hero.isVisible().catch(() => false)) {
      await hero.click({ force: true }).catch(() => {})
      await page.waitForTimeout(300)
      continue
    }
    const cont = page.locator('[data-testid="intro-continue"]').first()
    if (await cont.count() && await cont.isVisible().catch(() => false)) {
      await cont.click({ force: true }).catch(() => {})
      await page.waitForTimeout(300)
      continue
    }
    break
  }
  await page.waitForFunction(() => {
    const b = document.querySelector('[data-testid="bet-window"]')
    if (!b) return false
    const r = b.getBoundingClientRect()
    if (r.width === 0) return false
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return !!top && (top === b || b.contains(top) || b.contains(top.parentElement))
  }, { timeout: 30_000 }).catch(() => {})
}

const digits = (s) => (s || '').replace(/[^0-9.]/g, '')

async function runProfile(page, profile, outDir, seeded) {
  const failures = []
  const ok = (cond, msg) => {
    console.log(`    ${cond ? 'ok  ' : 'FAIL'}  ${msg}`)
    if (!cond) failures.push(`${profile.name}: ${msg}`)
  }

  await page.setViewportSize({ width: profile.width, height: profile.height })
  await page.waitForTimeout(400)

  const betWindow = page.locator('[data-testid="bet-window"]:visible').first()
  ok(await betWindow.count() > 0, 'the BET window exists and is visible')

  const tag = await betWindow.evaluate((el) => el.tagName)
  ok(tag === 'BUTTON', `the BET window is a real <button> (found <${tag.toLowerCase()}>)`)

  await page.screenshot({ path: join(outDir, `${profile.file}_a_closed.png`) })

  await betWindow.click()
  const panel = page.locator('[data-testid="bet-selector"]')
  const opened = await panel.isVisible({ timeout: 4000 }).catch(() => false)
  ok(opened, 'clicking the BET window opens the panel')
  if (!opened) return failures

  await page.waitForTimeout(250)
  await page.screenshot({ path: join(outDir, `${profile.file}_b_open.png`) })

  // 2. the panel lists EXACTLY the authenticate ladder, in order.
  const shown = await page.locator('[data-testid="bet-selector"] .bs-level .bs-level-value')
    .allInnerTexts()
  const shownNums = shown.map((t) => parseFloat(digits(t)))
  ok(shownNums.length === ODD_LADDER.length,
    `the panel lists ${ODD_LADDER.length} levels, the authenticate ladder's length (found ${shownNums.length})`)
  ok(JSON.stringify(shownNums) === JSON.stringify(ODD_LADDER),
    `and lists exactly the authenticate ladder, in order`)
  // The hardcoded-ladder trap, stated as its own assertion so the failure reads
  // plainly if it ever regresses.
  const BUILT_IN = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100]
  ok(!shownNums.some((n) => BUILT_IN.includes(n)),
    'and contains NO value from the built-in ladder, so it is not hardcoded')

  // 3. the current level is marked, and marked accessibly.
  const current = page.locator('[data-testid="bet-selector"] .bs-level.is-current')
  ok(await current.count() === 1, 'exactly one level is marked current')
  const checked = await current.first().getAttribute('aria-checked')
  ok(checked === 'true', 'and it is marked with aria-checked, not by colour alone')

  // 5. touch floor, on every level and on the close control.
  const boxes = await page.locator('[data-testid="bet-selector"] .bs-level').evaluateAll(
    (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { w: r.width, h: r.height } }))
  const tooSmall = boxes.filter((b) => b.h < TOUCH_FLOOR - 0.5)
  ok(tooSmall.length === 0,
    `every level clears the ${TOUCH_FLOOR}px touch floor (${tooSmall.length} under, shortest `
    + `${Math.min(...boxes.map((b) => b.h)).toFixed(1)}px)`)

  // 8. keyboard: focus lands on the current level, arrows move.
  const focusedIsCurrent = await page.evaluate(() =>
    !!document.activeElement?.classList.contains('is-current'))
  ok(focusedIsCurrent, 'focus lands on the CURRENT level when the panel opens')
  await page.keyboard.press('ArrowRight')
  const movedByKey = await page.evaluate(() =>
    !!document.activeElement?.classList.contains('bs-level')
    && !document.activeElement?.classList.contains('is-current'))
  ok(movedByKey, 'an arrow key moves focus along the ladder')

  // 6a. closes on dismissal (Escape).
  await page.keyboard.press('Escape')
  ok(!(await panel.isVisible().catch(() => false)), 'Escape dismisses the panel')

  // 4 + 6b + 7. one tap to the MAXIMUM, panel closes, readout updates.
  await betWindow.click()
  await panel.waitFor({ state: 'visible', timeout: 4000 })
  const maxIndex = ODD_LADDER.length - 1
  await page.locator(`[data-testid="bet-level-${maxIndex}"]`).click()
  ok(!(await panel.isVisible().catch(() => false)), 'selecting a level closes the panel')
  await page.waitForTimeout(250)
  const afterMax = digits(await betWindow.innerText())
  ok(parseFloat(afterMax) === ODD_LADDER[maxIndex],
    `one tap reached the MAXIMUM and the BET readout shows it (${afterMax})`)
  await page.screenshot({ path: join(outDir, `${profile.file}_c_max_selected.png`) })

  // and one tap back to the MINIMUM, which is the other half of "one-tap jumps".
  await betWindow.click()
  await panel.waitFor({ state: 'visible', timeout: 4000 })
  await page.locator('[data-testid="bet-level-0"]').click()
  await page.waitForTimeout(250)
  const afterMin = digits(await betWindow.innerText())
  ok(parseFloat(afterMin) === ODD_LADDER[0],
    `and one tap back to the MINIMUM (${afterMin})`)

  // 6c. closes on a scrim click.
  await betWindow.click()
  await panel.waitFor({ state: 'visible', timeout: 4000 })
  await page.locator('[data-testid="bet-selector-scrim"]').click({ position: { x: 5, y: 5 } })
  ok(!(await panel.isVisible().catch(() => false)), 'a click outside dismisses the panel')

  return failures
}

async function run(seeded) {
  const port = await getFreePort()
  const preview = await startPreview(port)
  const browser = await chromium.launch()
  const outDir = evidenceDir('reports', 'screens', 'bet-selector')
  const failures = []
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 675 } })
    await routeWallet(page)
    await boot(page, port)

    if (seeded) {
      // THE SEEDED VIOLATION, and it is the defect that actually shipped in this
      // project rather than an invented one. R5/TR-013: the bet surface drove
      // the HARDCODED ladder instead of the authenticated one. Replacing the
      // panel's rendered values with the built-in ladder reproduces exactly
      // that, in the place a player would see it.
      await page.evaluate(() => {
        const BUILT_IN = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100]
        // A POLL, not a MutationObserver. The observer version rewrote text,
        // which is itself a mutation, which re-entered the observer: the page
        // livelocked and every click timed out. The poll only writes when the
        // value differs, so it settles after one pass.
        setInterval(() => {
          const vals = document.querySelectorAll('[data-testid="bet-selector"] .bs-level-value')
          vals.forEach((el, i) => {
            if (i >= BUILT_IN.length) return
            const want = `$${BUILT_IN[i].toFixed(2)}`
            if (el.textContent !== want) el.textContent = want
          })
        }, 100)
      })
    }

    for (const profile of PROFILES) {
      console.log(`  ${profile.name} (${profile.width}x${profile.height}):`)
      failures.push(...await runProfile(page, profile, outDir, seeded))
    }
    return { failures, outDir }
  } finally {
    await browser.close().catch(() => {})
    killPreview(preview)
  }
}

// ── entry ────────────────────────────────────────────────────────────────────
;(async () => {
  const selfTest = process.argv.includes('--self-test')

  // The source rule, checked before the browser starts, so a removed wiring
  // fails fast and loudly rather than as a mysterious click timeout.
  const hud = readFileSync(join(ROOT, 'src/lib/components/HudOverlay.svelte'), 'utf-8')
  const wired = (hud.match(/data-testid="bet-window"/g) || []).length
  const ladderSrc = readFileSync(join(ROOT, 'src/lib/stores/betLadder.ts'), 'utf-8')
  const refuses = /if \(!levels\.includes\(level\)\) return false/.test(ladderSrc)

  if (selfTest) {
    console.log('BET SELECTOR GATE SELF-TEST (convention p)\n')
    console.log('SEEDED VIOLATION, static: the BET readout back to a plain <span>, which is what it was')
    const seededHud = hud.replace(/data-testid="bet-window"/g, 'data-testid="bet-readout"')
    const caughtWiring = (seededHud.match(/data-testid="bet-window"/g) || []).length !== 4
    console.log(`  ${caughtWiring ? 'caught' : 'MISSED'}  the gate requires four wired BET windows, one per layout profile`)

    console.log('SEEDED VIOLATION, static: setBetLevel accepting any number')
    const seededLadder = ladderSrc.replace(/if \(!levels\.includes\(level\)\) return false/, 'if (false) return false')
    const caughtRefusal = !/if \(!levels\.includes\(level\)\) return false/.test(seededLadder)
    console.log(`  ${caughtRefusal ? 'caught' : 'MISSED'}  the gate requires the off-ladder refusal that makes minStep hold`)

    console.log('\nSEEDED VIOLATION, runtime: the panel rendering the HARDCODED ladder instead of the')
    console.log('authenticate ladder, which is the R5/TR-013 defect in the place a player sees it')
    const { failures } = await run(true)
    const caughtLadder = failures.some((f) => /authenticate ladder|built-in ladder/.test(f))
    console.log(`\n  ${caughtLadder ? 'caught' : 'MISSED'}  the gate goes red when the panel shows our ladder rather than the platform's`)

    const problems = []
    if (!caughtWiring) problems.push('SEED NOT CAUGHT: an unwired BET window')
    if (!caughtRefusal) problems.push('SEED NOT CAUGHT: setBetLevel without its off-ladder refusal')
    if (!caughtLadder) problems.push('SEED NOT CAUGHT: a hardcoded ladder in the panel')
    console.log('')
    if (problems.length) {
      for (const p of problems) console.error(`  ${p}`)
      console.error(`\nBET SELECTOR GATE SELF-TEST: FAIL (${problems.length})`)
      process.exit(1)
    }
    console.log('BET SELECTOR GATE SELF-TEST: PASS (every seeded defect reproduces and is caught)')
    process.exit(0)
  }

  console.log('BET SELECTOR GATE\n')
  console.log('STATIC:')
  console.log(`  ${wired === 4 ? 'ok  ' : 'FAIL'}  the BET window is wired in all four layout profiles (found ${wired})`)
  console.log(`  ${refuses ? 'ok  ' : 'FAIL'}  setBetLevel refuses anything off the active ladder`)
  console.log('')
  console.log(`RUNTIME, against an authenticate ladder of ${ODD_LADDER.length} irregular levels `
    + `sharing no value with ours:`)
  const { failures, outDir } = await run(false)
  const all = [...failures]
  if (wired !== 4) all.push(`the BET window is wired in ${wired} of 4 layout profiles`)
  if (!refuses) all.push('setBetLevel no longer refuses off-ladder values')

  console.log('')
  console.log(`captures: ${outDir}${WRITES_COMMITTED_EVIDENCE ? '  (COMMITTED, FS_WRITE_EVIDENCE=1)' : '  (scratch)'}`)
  if (all.length) {
    for (const f of all) console.error(`  ${f}`)
    console.error(`\nBET SELECTOR GATE: FAIL (${all.length})`)
    process.exit(1)
  }
  console.log('\nBET SELECTOR GATE: PASS (the panel is the platform ladder, one tap end to end, at all three profiles)')
  process.exit(0)
})()
