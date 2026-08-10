#!/usr/bin/env node
//
// stream_test_capture.mjs: the watched-session capture set for the stream test.
//
// WHAT THIS IS FOR
// ----------------
// The owner's brief (reports/briefs/FS_STREAM_TEST_Prompt.md): the game will be
// shown on stream to tens of thousands of viewers, and the standard is that
// nothing on screen, at any moment, in any transition, reads as less than a top
// studio's work. So this script simulates the WATCHED SESSION end to end at
// every platform preset plus one stretched desktop window, and it captures not
// only every state but the TRANSITION MIDPOINTS between them, because a viewer
// watches the whole animation and not just the settled frames a proof usually
// keeps.
//
// The model is polish_review_capture.mjs: production dist served in-process,
// real sessionID and rgs_url parameters pointing at an INVALID host, the three
// wallet endpoints fulfilled at the network boundary from committed real book
// rounds. Everything downstream of the socket is shipped code. Every DEV hook
// is compiled out of this build, which is the point.
//
// WHAT A WATCHED SESSION IS, per the brief
// ----------------------------------------
// splash, entry, base spins including a dead streak, feature trigger, feature
// run, big win, max win celebration via the wincap fixture, collect, menu,
// paytable end to end, a buy flow, and back to base.
//
// Capture order differs from viewing order for one earned reason: the feature
// round runs LAST in its context because it leaves the presentation draining,
// and the 5,000x cap runs in a FRESH context where it is the first spin and
// cannot be starved. Both lessons are inherited from polish_review_capture.mjs,
// which paid for them across two runs. The catalogue presents frames in watched
// order regardless of capture order.
//
// TRANSITION MIDPOINTS
// --------------------
// After each state-changing action the script shoots immediately (roughly 150ms
// in, screenshot overhead included) and again part-way, before the settled
// frame. Filenames carry `transition_` so the motion-residue audit squad can
// find every mid-flight frame without reading the manifest. Midpoint timing is
// approximate by nature; the frames are evidence of what a viewer can see, not
// of a specific millisecond.
//
// THIS SCRIPT WRITES DIRECTLY INTO A COMMITTED DIRECTORY, ON PURPOSE.
// Convention (h.1) permits that only inside a job that explicitly regenerates
// evidence. This IS that job: the brief orders the frame evidence committed. It
// writes to a DATED directory of its own and never touches an existing one.
//
// USAGE   node scripts/stream_test_capture.mjs [--only <slug>[,<slug>...]]
//
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { dismissIntro, waitSpinDone, waitFeatureDrained } from './lib/dismissOverlays.mjs'
import { startStaticServer } from './lib/previewServer.mjs'
import { qaTmpDir } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const REPO = join(ROOT, '..')

// 2026-07-29: this was hardcoded to '2026-07-28', which meant ANY re-run of
// this harness wrote straight into `reports/screens/stream-test-2026-07-28/`
// and silently overwrote all 519 committed evidence frames. That is exactly
// the failure convention (h.1) is written against, and the failure
// FULL_AUDIT_METHOD.md 2.3 records as having already cost this project five
// committed files: the instruction says read-only, the SCRIPT does the writing.
// Found by the Session 1 re-proof. The first attempt at this fix used
// `toISOString()`, which is UTC, and at 06:03 AEST the UTC date is still
// yesterday, so it resolved to the very directory it was written to protect
// and overwrote 53 frames anyway. They were restored from HEAD, byte
// identical, and the lesson is recorded here rather than in a commit message
// alone: a DATE is a guess about where the output lands. The guard below is
// not a guess.
const DATE = process.env.STREAM_TEST_DATE || (() => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
})()
const OUT = qaTmpDir('screens', `stream-test-${DATE}`)

// The whole run is ten full sessions, several with a 60 to 90 second feature
// drain, so the ceiling is set from arithmetic rather than optimism: ten
// sessions at a generous four minutes plus slack. A hung run still dies red.
const HARD_TIMEOUT_MS = 55 * 60_000
setTimeout(() => {
  console.error(`STREAM CAPTURE: HARD TIMEOUT after ${HARD_TIMEOUT_MS / 1000}s, failing red`)
  process.exit(1)
}, HARD_TIMEOUT_MS)

// The platform's own Screen menu, verbatim, the same seven as
// layout_fit_gate.mjs, PLUS the stretched desktop window the brief adds. 1920 by
// 800 is deliberately not 16:9: it is the shape of a streamer's browser window
// dragged wide on a 1080p display with a title bar, chat dock or taskbar eating
// the height, and it stresses horizontal composition in a way no platform
// preset does. All eight run the full watched session: on stream every preset
// is watched, so no preset gets the abbreviated sweep.
const PRESETS = [
  { name: 'Desktop',  slug: 'desktop',  width: 1200, height: 675 },
  { name: 'Laptop',   slug: 'laptop',   width: 1024, height: 576 },
  { name: 'Popout L', slug: 'popout-l', width: 800,  height: 450 },
  { name: 'Popout S', slug: 'popout-s', width: 400,  height: 225 },
  { name: 'Mobile L', slug: 'mobile-l', width: 425,  height: 812 },
  { name: 'Mobile M', slug: 'mobile-m', width: 375,  height: 667 },
  { name: 'Mobile S', slug: 'mobile-s', width: 320,  height: 568 },
  { name: 'Stretch',  slug: 'stretch',  width: 1920, height: 800 },
]

// The two localised watched sessions the brief orders, one German and one
// Arabic, at the Desktop preset. Locale is forced by the launch URL's lang
// parameter, which is the shipped mechanism (socialLocale.resolveLaunchLocale).
const LOCALE_SESSIONS = [
  { name: 'Desktop de', slug: 'de-desktop', width: 1200, height: 675, lang: 'de' },
  { name: 'Desktop ar', slug: 'ar-desktop', width: 1200, height: 675, lang: 'ar' },
]

const RGS_HOST = 'rgs.stream-test-capture.invalid'
// Large and realistic for the same two reasons as polish_review_capture.mjs:
// NITRO OVERDRIVE at 400x must be affordable so its dialog can be photographed,
// and a short balance string hides fit defects.
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

// Which fixture category the next /wallet/play returns. Set by the driver
// before it clicks SPIN, so every capture names the outcome it intends to show.
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

const LAUNCH = (base, lang) => `${base}/?sessionID=stream-test&rgs_url=${RGS_HOST}&lang=${lang || 'en'}`

// ── capture bookkeeping ──────────────────────────────────────────────────────
const shots = []
let seq = 0
async function shoot(page, session, name, note, phase = 'state') {
  seq += 1
  const file = `${String(seq).padStart(3, '0')}_${session.slug}_${name}.png`
  await page.screenshot({ path: join(OUT, file), fullPage: false })
  shots.push({
    file, session: session.name, viewport: `${session.width}x${session.height}`,
    lang: session.lang || 'en', surface: name, phase, note,
  })
  process.stdout.write(`  ${file}\n`)
}

const settle = (page, ms = 900) => page.waitForTimeout(ms)

/** Click the live one of N duplicate controls; four layout branches render with one visible. */
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

/**
 * The HUD menu button, LOCALE-AGNOSTIC. The first run of this script filtered
 * candidates by aria-label === 'Menu', the pattern inherited from the earlier
 * capture family, and the German and Arabic sessions silently lost their menu,
 * session panel and paytable frames because the game correctly TRANSLATES that
 * label. The button carries data-testid="hud-menu" (or "mini-menu") in every
 * layout branch, so the testid is the selector and language never enters it.
 */
async function openHudMenu(page) {
  return clickLive(page, '[data-testid="hud-menu"], [data-testid="mini-menu"]')
}

/**
 * A guarded spin: sets the category, clicks SPIN, and returns false if the
 * click never reached the wallet, so no stale screen is ever photographed
 * under an informative filename. That failure has shipped here before.
 */
async function spin(page, category) {
  nextCategory = category
  const before = walletCalls.play
  await clickLive(page, '[data-testid="spin-button"]')
  await settle(page, 250)
  return walletCalls.play > before
}

async function captureSession(browser, base, session) {
  console.log(`\n${session.name} ${session.width}x${session.height} lang=${session.lang || 'en'}`)
  const ctx = await browser.newContext({ viewport: { width: session.width, height: session.height } })
  const page = await ctx.newPage()
  await routeWallet(page)
  await page.goto(LAUNCH(base, session.lang), { waitUntil: 'domcontentloaded' })

  // 1. SPLASH. Fresh context, so it always shows. Shot mid-entrance and settled.
  await settle(page, 600)
  await shoot(page, session, 'transition_splash_entrance', 'Splash mid-entrance, about 600ms after load', 'transition')
  await settle(page, 2000)
  if (await page.locator('[data-testid="hero-splash"]').count() > 0) {
    await shoot(page, session, 'splash', 'Hero splash, first surface a viewer sees')
  }

  // 2. SPLASH to RULES. The dismiss mounts the rules card.
  await page.locator('[data-testid="hero-splash"]').first().click({ timeout: 3000 }).catch(() => {})
  await settle(page, 180)
  await shoot(page, session, 'transition_splash_to_rules', 'Mid-fade between splash and rules card', 'transition')
  await settle(page, 720)
  if (await page.locator('.intro-backdrop').count() > 0) {
    await shoot(page, session, 'intro_rules', 'Rules card, gated before first spin')
  }

  // 3. RULES to BASE.
  await dismissIntro(page).catch(() => {})
  await settle(page, 200)
  await shoot(page, session, 'transition_rules_to_base', 'Mid-fade between rules and base game', 'transition')
  await settle(page, 1300)
  await shoot(page, session, 'base_idle', 'Base game at rest, full HUD')

  // 4. THE DEAD STREAK: three losing spins in a row, exactly what a watched
  // session contains most of. The first spin is also the motion capture: reels
  // accelerating and at full speed, with no win presentation to muddy it.
  for (let i = 1; i <= 3; i++) {
    if (!(await spin(page, 'loss'))) { console.log('  (loss spin starved, skipped)'); continue }
    if (i === 1) {
      await shoot(page, session, 'transition_reels_accelerating', 'Reels accelerating, about 250ms after spin press', 'transition')
      await settle(page, 450)
      await shoot(page, session, 'transition_reels_full_speed', 'Reels at full speed', 'transition')
    }
    await waitSpinDone(page, 20000).catch(() => {})
    await settle(page, i === 3 ? 900 : 400)
    await shoot(page, session, `dead_spin_${i}_settled`, `Dead spin ${i} of 3 settled, zero win, HUD readouts at rest`)
  }

  // 5. A WIN, then a BIG WIN. The big win's count-up is shot twice mid-count so
  // the typography squad can compare digit alignment at two magnitudes.
  if (await spin(page, 'win')) {
    await settle(page, 1300)
    await shoot(page, session, 'win_presentation', 'Standard win presentation')
    await waitSpinDone(page, 20000).catch(() => {})
    await settle(page, 700)
  }
  if (await spin(page, 'bigWin')) {
    await settle(page, 1100)
    await shoot(page, session, 'transition_bigwin_countup_early', 'Big win count-up, early digits', 'transition')
    await settle(page, 900)
    await shoot(page, session, 'transition_bigwin_countup_late', 'Big win count-up, later digits', 'transition')
    await settle(page, 1400)
    await shoot(page, session, 'bigwin_settled', 'Big win presentation settled')
    await waitSpinDone(page, 25000).catch(() => {})
    await settle(page, 900)
  }

  // 6. MENU, SESSION PANEL, PAYTABLE END TO END, AUTOPLAY. All idle surfaces,
  // shot before the feature so the context is still clean.
  if (await openHudMenu(page)) {
    await settle(page, 160)
    await shoot(page, session, 'transition_menu_opening', 'HUD menu mid-open', 'transition')
    await settle(page, 440)
    await shoot(page, session, 'hud_menu', 'HUD menu open, audio controls and menu items')
    if (await clickLive(page, '[data-testid="open-session-panel"]')) {
      await settle(page, 700)
      if (await page.locator('[data-testid="session-panel-sheet"]').count() > 0) {
        await shoot(page, session, 'session_panel', 'Session information panel')
      }
      await clickLive(page, '.sp-sheet-close')
      await settle(page, 500)
    }
  }
  if (await openHudMenu(page)) {
    await settle(page, 400)
    await clickLive(page, '.hud-menu-item')
    await settle(page, 200)
    await shoot(page, session, 'transition_paytable_opening', 'Paytable mid-open', 'transition')
    await settle(page, 700)
    if (await page.locator('.fs-pt-panel').count() > 0) {
      await shoot(page, session, 'paytable_top', 'Paytable, opening view')
      const heads = page.locator('.fs-pt-body .fs-heading, .fs-pt-body h3, .fs-pt-body h4')
      const hn = Math.min(await heads.count(), 12)
      for (let i = 0; i < hn; i++) {
        const h = heads.nth(i)
        const label = ((await h.textContent().catch(() => '')) || `section${i}`)
          .trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 34) || `section${i}`
        await h.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' })).catch(() => {})
        await settle(page, 360)
        await shoot(page, session, `paytable_${String(i + 1).padStart(2, '0')}_${label}`, 'Paytable section')
      }
      await clickLive(page, '.fs-pt-close')
      await settle(page, 180)
      await shoot(page, session, 'transition_paytable_closing', 'Paytable mid-close', 'transition')
      await settle(page, 420)
    }
  }
  // 7. THE AUTOPLAY MENU, then THE BUY FLOW, in that order, and the auto menu
  // is closed by TOGGLING ITS OWN BUTTON. The ordering history, kept because
  // both directions failed once: run 1 captured autoplay first and closed it
  // with Escape, which the menu ignores, so the features menu click fell on
  // the still-open auto menu and three buy-flow frames were silently missing.
  // Run 2 swapped them, and the features menu close then ate the autoplay
  // click on the desktop-class layout branch, so six sessions lost their
  // autoplay frame. Toggle-to-close is the fix that lets the original order
  // stand. The selector is the wrapper class rather than the aria-label:
  // the label is translated in de and ar, the class is not.
  // Four wrappers, not three: the desktop-class layout is a FOURTH branch,
  // plain .autoplay-wrapper with an .fs-auto button. Run 3 listed only the
  // p-/c-/m- wrappers, matched zero candidates on that branch, and six
  // sessions lost their autoplay frame silently. Established by DOM probe
  // rather than a third guess.
  const AUTO_BTN = '.autoplay-wrapper button, .p-autoplay-wrapper button, .c-autoplay-wrapper button, .m-autoplay-wrapper button'
  if (await clickLive(page, AUTO_BTN)) {
    await settle(page, 600)
    if (await page.locator('.auto-menu').count() === 0) {
      await clickLive(page, AUTO_BTN)
      await settle(page, 700)
    }
    if (await page.locator('.auto-menu').count() > 0) {
      await shoot(page, session, 'autoplay_menu', 'Autoplay menu, stop conditions and loss limit')
      await clickLive(page, AUTO_BTN)
      await settle(page, 400)
    }
  }

  // THE BUY FLOW. Menu open mid and settled, both buy dialogs. The menu is
  // reopened between tiers because cancelling re-renders the card list.
  if (await clickLive(page, '[data-testid="feature-menu-button"]')) {
    await settle(page, 180)
    await shoot(page, session, 'transition_features_menu_opening', 'FEATURES menu mid-open', 'transition')
    await settle(page, 620)
    if (await page.locator('[data-testid="feature-menu-cards"]').count() === 0) {
      await clickLive(page, '[data-testid="feature-menu-button"]')
      await settle(page, 900)
    }
    if (await page.locator('[data-testid="feature-menu-cards"]').count() > 0) {
      await shoot(page, session, 'features_menu', 'FEATURES menu, all five modes and their prices')
      for (const [testid, label] of [['activate-bonus', 'buy_overdrive'], ['activate-super', 'nitro_overdrive']]) {
        if (await page.locator('[data-testid="feature-menu-cards"]').count() === 0) {
          await clickLive(page, '[data-testid="feature-menu-button"]')
          await settle(page, 800)
        }
        if (await clickLive(page, `[data-testid="${testid}"]`)) {
          await settle(page, 200)
          await shoot(page, session, `transition_dialog_${label}_opening`, 'Buy confirm dialog mid-open', 'transition')
          await settle(page, 700)
          if (await page.locator('[data-testid="buy-confirm"]').count() > 0) {
            await shoot(page, session, `dialog_${label}`, 'Buy confirm dialog, price stated up front')
            await clickLive(page, '.buy-cancel')   // never Escape: the backdrop eats it
            await settle(page, 700)
          }
        }
      }
    }
    await clickLive(page, '[data-testid="feature-menu-close"]')
    await settle(page, 600)
  }

  // 8. THE FEATURE, LAST IN THIS CONTEXT: trigger, entry, the run itself at
  // intervals, and the return to base. The interval frames are the watched
  // feature: meter states, retrigger moments and win presentations land
  // wherever they land, which is exactly what a viewer sees.
  if (await spin(page, 'feature')) {
    await page.waitForSelector('[data-testid="entry-continue"]', { timeout: 15000 }).catch(() => {})
    await settle(page, 250)
    await shoot(page, session, 'transition_feature_entry_fade', 'Feature entry overlay mid-fade', 'transition')
    await settle(page, 550)
    await shoot(page, session, 'feature_entry_card', 'Free spins entry, explicit continue gate')
    await clickLive(page, '[data-testid="entry-continue"]')
    await settle(page, 300)
    await shoot(page, session, 'transition_feature_starting', 'Feature starting, entry card dismissing', 'transition')
    for (let i = 1; i <= 6; i++) {
      await settle(page, 2200)
      await shoot(page, session, `feature_run_${i}`, `Overdrive free spins in flight, interval frame ${i} of 6`)
    }
    await waitFeatureDrained(page, 90000).catch(() => {})
    await settle(page, 350)
    await shoot(page, session, 'transition_feature_exit', 'Feature exiting toward base', 'transition')
    await settle(page, 1600)
    await shoot(page, session, 'post_feature_base', 'Back to base after the feature, totals settled')
  }

  await ctx.close()

  // 9. THE 5,000x CAP, IN ITS OWN CONTEXT, where it is the first spin and
  // cannot be starved. Overlay mid-fade, settled hold, collect, and the return.
  const capCtx = await browser.newContext({ viewport: { width: session.width, height: session.height } })
  const capPage = await capCtx.newPage()
  await routeWallet(capPage)
  await capPage.goto(LAUNCH(base, session.lang), { waitUntil: 'domcontentloaded' })
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
    await settle(capPage, 300)
    await shoot(capPage, session, 'transition_maxwin_overlay_fade', 'Max win overlay mid-fade-in', 'transition')
    await settle(capPage, 1000)
    if (await capPage.locator('.max-win-overlay').count() > 0) {
      await shoot(capPage, session, 'maxwin_celebration', 'MAX WIN celebration, the 5,000x cap, held')
      await clickLive(capPage, '[data-testid="max-win-collect"]')
      await settle(capPage, 250)
      await shoot(capPage, session, 'transition_maxwin_collect_fade', 'Collect pressed, overlay mid-fade-out', 'transition')
      await settle(capPage, 1600)
      await shoot(capPage, session, 'post_collect_base', 'Back to base after collect, balance settled')
    }
  }
  nextCategory = 'win'
  await capCtx.close()
}

// ── run ──────────────────────────────────────────────────────────────────────
;(async () => {
  const only = (() => {
    const i = process.argv.indexOf('--only')
    return i > -1 ? process.argv[i + 1].split(',') : null
  })()
  const sessions = [...PRESETS, ...LOCALE_SESSIONS].filter((s) => !only || only.includes(s.slug))

  // ── THE GUARD, per convention (h.1) and FULL_AUDIT_METHOD.md 2.3 ───────────
  //
  // "The durable fix is upstream of the prompt: the SCRIPTS should be incapable
  // of dirtying committed evidence. A prompt is a request; a path is a
  // guarantee." This is that guarantee. A date is a guess about where output
  // lands and it has now been wrong twice in this file, once hardcoded and once
  // via a UTC/local mismatch. So the script no longer trusts the date: it asks
  // git whether anything at the destination is already tracked, and refuses if
  // so. Overwriting committed evidence now requires saying so out loud with
  // --regenerate, which is exactly the "job whose brief says that is what it is
  // doing" that (h.1) requires.
  if (existsSync(OUT)) {
    const tracked = execSync(`git ls-files -- "${OUT}"`, { cwd: REPO, encoding: 'utf8' }).trim()
    if (tracked && !process.argv.includes('--regenerate')) {
      const n = tracked.split('\n').length
      console.error(`\nSTREAM CAPTURE REFUSED.\n`)
      console.error(`  ${OUT}`)
      console.error(`  already holds ${n} file(s) TRACKED IN GIT, and writing here would`)
      console.error(`  overwrite committed evidence. Convention (h.1): evidence directories`)
      console.error(`  are write-once outside a job that explicitly regenerates them.\n`)
      console.error(`  Capture somewhere else:   STREAM_TEST_DATE=$(date +%F) node scripts/stream_test_capture.mjs`)
      console.error(`  Or say it out loud:       node scripts/stream_test_capture.mjs --regenerate\n`)
      process.exit(1)
    }
  }

  mkdirSync(OUT, { recursive: true })
  const server = await startStaticServer(join(ROOT, 'dist'))
  const base = `http://localhost:${server.port}`
  const browser = await chromium.launch()
  let failed = null

  try {
    for (const session of sessions) {
      await captureSession(browser, base, session).catch((e) => {
        console.error(`  ${session.name}: ${e.message}`)
        failed = failed || e
      })
    }
  } finally {
    await browser.close().catch(() => {})
    server.close()
  }

  const buildInfo = JSON.parse(readFileSync(join(ROOT, 'dist', 'build-info.json'), 'utf-8'))

  writeFileSync(join(OUT, 'MANIFEST.json'), JSON.stringify({
    date: DATE,
    brief: 'reports/briefs/FS_STREAM_TEST_Prompt.md',
    build: buildInfo,
    sessions: sessions.map((s) => ({
      name: s.name, viewport: `${s.width}x${s.height}`, lang: s.lang || 'en',
    })),
    walletCalls,
    captures: shots,
  }, null, 2))

  console.log(`\nSTREAM CAPTURE: ${shots.length} frames across ${sessions.length} sessions`)
  console.log(`  wallet: authenticate ${walletCalls.authenticate}, play ${walletCalls.play}, end-round ${walletCalls.endRound}`)
  console.log(`  out: ${OUT}`)

  // A capture set where nothing reached the wallet is photographs of an idle
  // screen with informative filenames. Asserted, not assumed.
  if (walletCalls.play === 0) {
    console.error('STREAM CAPTURE: FAIL, zero /wallet/play calls: no round was ever played.')
    process.exit(1)
  }
  if (failed) { console.error(`STREAM CAPTURE: completed with errors: ${failed.message}`) }
  process.exit(0)
})()
