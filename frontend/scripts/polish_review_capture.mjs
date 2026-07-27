#!/usr/bin/env node
//
// polish_review_capture.mjs: the full-surface capture set for a polish review.
//
// WHAT THIS IS FOR
// ----------------
// Fable reviews visually, and CLAUDE.md convention (h) says visual verdicts are
// given only on proofs committed under reports/screens/. This produces one
// coherent set at HEAD so a returning reviewer can see every player-visible
// surface without launching anything.
//
// WHY IT IS A NEW SCRIPT AND NOT A RE-RUN OF THE evidence_*.mjs FAMILY
// --------------------------------------------------------------------
// Two independent reasons, both fatal to reuse:
//
//   1. The six evidence_*.mjs scripts hardcode COMMITTED evidence directories
//      and none of them imports lib/evidencePaths.mjs, so a plain re-run
//      silently rewrites committed evidence. That is exactly the convention
//      (h.1) failure recorded against anticipation_proof.mjs, which modified
//      four committed PNGs on a casual re-run.
//   2. They target the DEV SERVER and depend on DEV-only hooks. This set must
//      photograph the PRODUCTION BUILD, because the production build is what a
//      player and a reviewer see, and in it `?mock`, `?mockCategory`,
//      `?windemo`, `?anticipationDemo`, `window.__testStores` and every other
//      hook is gone: they are all behind `import.meta.env.DEV`.
//
// So the model copied here is layout_fit_gate.mjs plus mini_player_proof.mjs:
// spawn `vite preview` on a free port, launch with real sessionID and rgs_url
// parameters pointing at an INVALID host, and fulfil the three wallet endpoints
// at the network boundary. Everything downstream is shipped code.
//
// HOW REAL ROUNDS ARE SERVED WITHOUT A DEV HOOK
// ---------------------------------------------
// src/lib/services/__fixtures__/replay_rounds.json holds five modes times five
// categories of REAL committed book rounds, each with its full events array.
// rgsService sends the selected mode in the /wallet/play body, so the
// interception reads `mode` off the request and replies with the matching
// fixture. That is how all five mode presentations and every celebration tier
// are reached from a production build honestly.
//
// THIS SCRIPT WRITES DIRECTLY INTO A COMMITTED DIRECTORY, ON PURPOSE.
// Convention (h.1) permits that only inside "a job that explicitly regenerates
// evidence". This IS that job: reports/briefs/FS_ROUND3_PREP_Prompt.md JOB 4
// asks for a fresh capture set committed under reports/screens/polish-review-<date>/.
// It writes to a DATED directory of its own and never touches an existing one.
//
// USAGE   node scripts/polish_review_capture.mjs
//
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro, waitSpinDone } from './lib/dismissOverlays.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const REPO = join(ROOT, '..')

const DATE = '2026-07-27'
const OUT = join(REPO, 'reports', 'screens', `polish-review-${DATE}`)

// Same hard-timeout discipline as every browser gate here, for the reason
// recorded against run 122: killing the npx wrapper orphans vite, whose
// inherited stdout pipe holds this process open forever after the work is done.
const HARD_TIMEOUT_MS = 12 * 60_000
setTimeout(() => {
  console.error(`POLISH CAPTURE: HARD TIMEOUT after ${HARD_TIMEOUT_MS / 1000}s, failing red`)
  process.exit(1)
}, HARD_TIMEOUT_MS)

// The platform's own Screen menu, verbatim, the same seven as layout_fit_gate.mjs.
// Read off the DTT on 2026-07-26; source capture named in that file.
const PRESETS = [
  { name: 'Desktop',  slug: 'desktop',  width: 1200, height: 675, full: true },
  { name: 'Laptop',   slug: 'laptop',   width: 1024, height: 576, full: false },
  { name: 'Popout L', slug: 'popout-l', width: 800,  height: 450, full: false },
  { name: 'Popout S', slug: 'popout-s', width: 400,  height: 225, full: false },
  { name: 'Mobile L', slug: 'mobile-l', width: 425,  height: 812, full: true },
  { name: 'Mobile M', slug: 'mobile-m', width: 375,  height: 667, full: false },
  { name: 'Mobile S', slug: 'mobile-s', width: 320,  height: 568, full: false },
]

const RGS_HOST = 'rgs.polish-review-capture.invalid'
// Deliberately large and deliberately realistic. NITRO OVERDRIVE costs 400x, so
// a balance under 400 units disables the buy and the dialog cannot be
// photographed; and a short balance string hides every fit and truncation
// defect, which is the lesson mini_player_proof.mjs paid for once already.
const START_MICROS = 50_000_000_000

const FIXTURES = JSON.parse(
  readFileSync(join(ROOT, 'src/lib/services/__fixtures__/replay_rounds.json'), 'utf-8'),
)

const authBody = () => ({
  balance: { amount: START_MICROS, currency: 'USD' },
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
  round: null,
})

// Which fixture category the next /wallet/play should return. Set by the caller
// before it clicks SPIN, so a capture names the outcome it intends to show
// rather than photographing whatever came back.
let nextCategory = 'win'
let betCount = 0
const walletCalls = { authenticate: 0, play: 0, endRound: 0 }

const MODE_COST = { base: 1, cruise: 1, antelite: 1.25, bonus: 100, super: 400 }

function playBody(requestedMode) {
  const mode = MODE_COST[requestedMode] ? requestedMode : 'base'
  const byMode = FIXTURES[mode] || FIXTURES.base
  const round = byMode[nextCategory] || byMode.win
  betCount += 1
  const bet = 1_000_000
  const cost = Math.round(bet * MODE_COST[mode])
  return {
    balance: { amount: START_MICROS - betCount * cost, currency: 'USD' },
    round: {
      betID: 900_000 + betCount,
      active: true,
      mode,
      amount: bet,
      payout: Math.round((bet * (round.payoutMultiplier ?? 0)) / 100),
      payoutMultiplier: (round.payoutMultiplier ?? 0) / 100,
      state: { events: round.events },
    },
  }
}

async function routeWallet(page) {
  await page.route(`**://${RGS_HOST}/**`, async (route) => {
    const req = route.request()
    const url = req.url()
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) })
    if (url.includes('/wallet/authenticate')) { walletCalls.authenticate += 1; return json(authBody()) }
    if (url.includes('/wallet/play')) {
      walletCalls.play += 1
      let mode = 'base'
      try { mode = req.postDataJSON()?.mode ?? 'base' } catch { /* body may be absent */ }
      return json(playBody(mode))
    }
    if (url.includes('/wallet/end-round')) {
      walletCalls.endRound += 1
      return json({ balance: { amount: START_MICROS, currency: 'USD' } })
    }
    return json({})
  })
}

const LAUNCH = (base) => `${base}/?sessionID=polish-review&rgs_url=${RGS_HOST}&lang=en`

function getFreePort() {
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
const killPreview = (proc) => {
  try { process.kill(-proc.pid, 'SIGTERM') } catch { try { proc.kill() } catch { /* gone */ } }
}

// ── capture bookkeeping ──────────────────────────────────────────────────────
const shots = []
let seq = 0
async function shoot(page, preset, name, note) {
  seq += 1
  const file = `${String(seq).padStart(3, '0')}_${preset.slug}_${name}.png`
  await page.screenshot({ path: join(OUT, file), fullPage: false })
  shots.push({ file, preset: preset.name, viewport: `${preset.width}x${preset.height}`, surface: name, note })
  process.stdout.write(`  ${file}\n`)
}

const settle = (page, ms = 900) => page.waitForTimeout(ms)

/**
 * Click the live one of N duplicate controls. Four layout branches render
 * simultaneously with only one visible, so a plain click hits a hidden node.
 * Same approach as evidence_menu.mjs's clickLive.
 */
async function clickLive(page, selector, timeout = 4000) {
  const loc = page.locator(selector)
  const n = await loc.count()
  for (let i = 0; i < n; i++) {
    const el = loc.nth(i)
    if (await el.isVisible().catch(() => false)) {
      await el.click({ timeout }).catch(() => {})
      return true
    }
  }
  return false
}

/** The HUD menu button carries aria-label="Menu" in all four branches. */
async function openHudMenu(page) {
  const cands = page.locator('.fs-menu, [data-testid="mini-menu"], .p-round-btn, .c-round-btn, .m-round-btn')
  const n = await cands.count()
  for (let i = 0; i < n; i++) {
    const el = cands.nth(i)
    if (!(await el.isVisible().catch(() => false))) continue
    const label = await el.getAttribute('aria-label').catch(() => null)
    if (label === 'Menu') { await el.click({ timeout: 4000 }).catch(() => {}); return true }
  }
  return false
}

async function capturePreset(browser, base, preset) {
  console.log(`\n${preset.name} ${preset.width}x${preset.height}`)
  const ctx = await browser.newContext({ viewport: { width: preset.width, height: preset.height } })
  const page = await ctx.newPage()
  await routeWallet(page)
  await page.goto(LAUNCH(base), { waitUntil: 'domcontentloaded' })

  // 1. THE SPLASH. Its seen-flag lives in sessionStorage, which is scoped per
  // context, so a fresh context always shows it. Must be shot BEFORE dismissIntro.
  await settle(page, 2600)
  if (await page.locator('[data-testid="hero-splash"]').count() > 0) {
    await shoot(page, preset, 'splash', 'Hero splash, first surface a player sees')
  }

  // 2. THE RULES CARD, mounted only by the splash's own dismiss handler.
  await page.locator('[data-testid="hero-splash"]').first().click({ timeout: 3000 }).catch(() => {})
  await settle(page, 900)
  if (await page.locator('.intro-backdrop').count() > 0) {
    await shoot(page, preset, 'intro_rules', 'Rules card, gated before first spin')
  }

  await dismissIntro(page).catch(() => {})
  await settle(page, 1400)
  await shoot(page, preset, 'base_idle', 'Base game at rest, full HUD')

  // 3. THE HUD MENU and everything reachable from it.
  if (await openHudMenu(page)) {
    await settle(page, 500)
    await shoot(page, preset, 'hud_menu', 'HUD menu open, audio controls and menu items')

    // Session panel.
    if (await clickLive(page, '[data-testid="open-session-panel"]')) {
      await settle(page, 700)
      if (await page.locator('[data-testid="session-panel-sheet"]').count() > 0) {
        await shoot(page, preset, 'session_panel', 'Session information panel')
      }
      await clickLive(page, '.sp-sheet-close')
      await settle(page, 500)
    }
  }

  // 4. THE PAYTABLE, END TO END. There is no pager: enumerate the headings and
  // scroll each into view, exactly as evidence_rules.mjs does.
  if (await openHudMenu(page)) {
    await settle(page, 400)
    await clickLive(page, '.hud-menu-item')   // the paytable is first in every branch
    await settle(page, 900)
    if (await page.locator('.fs-pt-panel').count() > 0) {
      await shoot(page, preset, 'paytable_top', 'Paytable, opening view')
      if (preset.full) {
        const heads = page.locator('.fs-pt-body .fs-heading, .fs-pt-body h3, .fs-pt-body h4')
        const hn = Math.min(await heads.count(), 12)
        for (let i = 0; i < hn; i++) {
          const h = heads.nth(i)
          const label = ((await h.textContent().catch(() => '')) || `section${i}`)
            .trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 34) || `section${i}`
          await h.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' })).catch(() => {})
          await settle(page, 380)
          await shoot(page, preset, `paytable_${String(i + 1).padStart(2, '0')}_${label}`, 'Paytable section')
        }
      }
      await clickLive(page, '.fs-pt-close')
      await settle(page, 500)
    }
  }

  // 5. THE FEATURES MENU, and the five mode presentations it carries.
  if (await clickLive(page, '[data-testid="feature-menu-button"]')) {
    await settle(page, 800)
    if (await page.locator('[data-testid="feature-menu-cards"]').count() > 0) {
      await shoot(page, preset, 'features_menu', 'FEATURES menu, all five modes and their prices')

      if (preset.full) {
        // Cruise, a standing mode: selecting it re-renders the card set.
        if (await clickLive(page, '[data-testid="standing-select-cruise"]')) {
          await settle(page, 700)
          await shoot(page, preset, 'mode_cruise_selected', 'Cruise selected, standing mode')
        }
        // OVERBOOST, the 1.25x enhancer toggle: the effective spin cost changes.
        if (await clickLive(page, '[data-testid="enhancer-toggle-overboost"]')) {
          await settle(page, 700)
          await shoot(page, preset, 'mode_overboost_on', 'OVERBOOST on, effective spin cost shown')
          await clickLive(page, '[data-testid="enhancer-toggle-overboost"]')
          await settle(page, 500)
        }
        // The two buy dialogs. Cancelling the first returns to the FEATURES
        // menu but the card list re-renders, so the second activate control is
        // a fresh node: the menu is reopened between them rather than assuming
        // the old handle is still live. The first run of this script captured
        // Buy Overdrive and silently missed NITRO for exactly that reason.
        for (const [testid, label] of [['activate-bonus', 'buy_overdrive'], ['activate-super', 'nitro_overdrive']]) {
          if (await page.locator('[data-testid="feature-menu-cards"]').count() === 0) {
            await clickLive(page, '[data-testid="feature-menu-button"]')
            await settle(page, 800)
          }
          if (await clickLive(page, `[data-testid="${testid}"]`)) {
            await settle(page, 900)
            if (await page.locator('[data-testid="buy-confirm"]').count() > 0) {
              await shoot(page, preset, `dialog_${label}`, 'Buy confirm dialog, price stated up front')
              await clickLive(page, '.buy-cancel')   // never Escape: the backdrop eats it
              await settle(page, 700)
            }
          }
        }
      }
    }
    await clickLive(page, '[data-testid="feature-menu-close"]')
    await settle(page, 600)
  }

  // 6. THE AUTOPLAY MENU, a mandatory surface with its own confirm gate.
  if (await clickLive(page, 'button[aria-label="AUTO"], button[aria-label="AUTOPLAY"], button[aria-label="Autoplay"]')) {
    await settle(page, 600)
    if (await page.locator('.auto-menu').count() > 0) {
      await shoot(page, preset, 'autoplay_menu', 'Autoplay menu, stop conditions and loss limit')
    }
    await page.keyboard.press('Escape').catch(() => {})
    await settle(page, 400)
  }

  // 7. REAL ROUNDS. Only at the full presets: a spin costs wall-clock and the
  // point of the small presets is layout, which the surfaces above already show.
  if (preset.full) {
    // THREE ROUNDS IN THIS CONTEXT, and the 5,000x cap gets its own below.
    //
    // Two runs established why. With `cap` third and `feature` fourth, the
    // feature round never reached the wallet. Swapping them moved the failure
    // rather than fixing it: `cap` was then fourth and IT never reached the
    // wallet. The common factor is not the order, it is that a fourth spin
    // cannot start inside the settle window after three presentations have run,
    // and the free-spins round in particular leaves the feature draining.
    //
    // The guard did its job both times: `walletCalls.play === before` meant the
    // click was a no-op, so the shot was SKIPPED rather than a stale screen
    // being photographed under an informative filename. That is the failure this
    // repository has shipped before and the reason the guard exists.
    //
    // So the cap round runs in a FRESH CONTEXT, where it is the first spin and
    // cannot be starved. Two contexts is cheaper than a flaky fourth round.
    for (const [category, label] of [['win', 'win'], ['bigWin', 'big_win'], ['feature', 'free_spins']]) {
      nextCategory = category
      const before = walletCalls.play
      await clickLive(page, '[data-testid="spin-button"]')
      await settle(page, 1200)
      if (walletCalls.play === before) continue   // the spin did not reach the wallet
      if (category === 'cap') {
        await page.waitForSelector('.max-win-overlay', { timeout: 12000 }).catch(() => {})
        await settle(page, 900)
        await shoot(page, preset, 'celebration_max_win', 'MAX WIN celebration, 5,000x cap')
        await clickLive(page, '[data-testid="max-win-collect"]')
      } else if (category === 'feature') {
        await page.waitForSelector('[data-testid="entry-continue"]', { timeout: 12000 }).catch(() => {})
        await settle(page, 700)
        await shoot(page, preset, 'feature_entry_card', 'Free spins entry, explicit continue gate')
        await clickLive(page, '[data-testid="entry-continue"]')
        await settle(page, 2200)
        await shoot(page, preset, 'feature_in_play', 'Overdrive free spins in play, meter and totals')
      } else {
        await settle(page, 1600)
        await shoot(page, preset, `celebration_${label}`, 'Win presentation')
      }
      await waitSpinDone(page, 25000).catch(() => {})
      await settle(page, 900)
    }
    nextCategory = 'win'
  }

  await ctx.close()

  // ── the 5,000x cap, in its own context ─────────────────────────────────────
  if (preset.full) {
    const capCtx = await browser.newContext({ viewport: { width: preset.width, height: preset.height } })
    const capPage = await capCtx.newPage()
    await routeWallet(capPage)
    await capPage.goto(LAUNCH(base), { waitUntil: 'domcontentloaded' })
    await settle(capPage, 2600)
    await capPage.locator('[data-testid="hero-splash"]').first().click({ timeout: 3000 }).catch(() => {})
    await settle(capPage, 700)
    await dismissIntro(capPage).catch(() => {})
    await settle(capPage, 1400)

    nextCategory = 'cap'
    const before = walletCalls.play
    await clickLive(capPage, '[data-testid="spin-button"]')
    if (walletCalls.play > before) {
      await capPage.waitForSelector('.max-win-overlay', { timeout: 20000 }).catch(() => {})
      await settle(capPage, 1100)
      if (await capPage.locator('.max-win-overlay').count() > 0) {
        await shoot(capPage, preset, 'celebration_max_win', 'MAX WIN celebration, the 5,000x cap, first spin of a fresh session')
      }
    }
    nextCategory = 'win'
    await capCtx.close()
  }
}

// ── run ──────────────────────────────────────────────────────────────────────
;(async () => {
  mkdirSync(OUT, { recursive: true })
  const port = await getFreePort()
  const preview = await startPreview(port)
  const base = `http://localhost:${port}`
  const browser = await chromium.launch()
  let failed = null

  try {
    for (const preset of PRESETS) {
      await capturePreset(browser, base, preset).catch((e) => {
        console.error(`  ${preset.name}: ${e.message}`)
        failed = failed || e
      })
    }
  } finally {
    await browser.close().catch(() => {})
    killPreview(preview)
  }

  const buildInfo = JSON.parse(readFileSync(join(ROOT, 'dist', 'build-info.json'), 'utf-8'))

  writeFileSync(join(OUT, 'MANIFEST.json'), JSON.stringify({
    date: DATE,
    build: buildInfo,
    presets: PRESETS.map((p) => ({ name: p.name, viewport: `${p.width}x${p.height}`, fullSweep: p.full })),
    walletCalls,
    captures: shots,
  }, null, 2))

  console.log(`\nPOLISH REVIEW CAPTURE: ${shots.length} frames`)
  console.log(`  wallet: authenticate ${walletCalls.authenticate}, play ${walletCalls.play}, end-round ${walletCalls.endRound}`)
  console.log(`  out: ${OUT}`)

  // A capture set where nothing ever reached the wallet is a set of photographs
  // of an idle screen with informative filenames. That failure has happened here
  // before (mini_player_proof.mjs's own header records it), so it is asserted.
  if (walletCalls.play === 0) {
    console.error('POLISH REVIEW CAPTURE: FAIL, zero /wallet/play calls: no round was ever played.')
    process.exit(1)
  }
  if (failed) { console.error(`POLISH REVIEW CAPTURE: completed with errors: ${failed.message}`) }
  process.exit(0)
})()
