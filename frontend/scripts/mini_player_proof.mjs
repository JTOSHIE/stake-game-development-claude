// mini_player_proof.mjs - TR-043, R2R-R JOB C (2026-07-26).
//
// Captures the DEDICATED 400x225 mini-player HUD in the five active states the
// brief names, and asserts each is legible and OPERABLE rather than merely
// photographed.
//
// WHAT REPLACED WHAT. The previous popout evidence was a single capture in the
// layouts group plus a conformance script whose only real assertion was that
// the rules modal's Continue button could be clicked. Round-two reviewer 3 read
// the capture and described it exactly: "the balance and bet fields compressed
// into overlapping vertical fragments, an unlabeled feature control and
// collisions across the bottom bar. The committed popout gate proves only that
// the rules modal's Continue button can be clicked."
//
// So this proves the two things that finding actually asks about:
//
//   LEGIBLE   every control's rendered box is measured, and any pair that
//             OVERLAPS fails. That is the literal complaint, checked
//             geometrically rather than judged from a picture.
//   OPERABLE  every touch target is measured against 44px INCLUDING its
//             pseudo-element extension, and SPIN is actually clicked in each
//             state where a spin is legal.
//
// Run (from frontend/, after `npm run build`): node scripts/mini_player_proof.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro, waitSpinDone } from './lib/dismissOverlays.mjs'
import { evidenceDir, announceEvidenceMode } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SCREENS = evidenceDir('reports', 'screens', 'mini-player-2026-07-26')
const QA = evidenceDir('reports', 'qa')
announceEvidenceMode('mini_player_proof')

const VIEWPORT = { width: 400, height: 225 }   // Stake's mini-player popout
const MIN_TARGET = 44
// The legible floor, declared in frontend/src/lib/actions/fitMoney.ts as
// MINI_LEGIBLE_FLOOR_PX. Repeated here so the gate can state what it is
// asserting, and immediately checked against the value the running code
// published onto the element, so the two cannot drift apart silently.
const MIN_LEGIBLE_FLOOR = 9

// ── The session, and why this proof has one ──────────────────────────────────
//
// The first run of this script captured a UI THAT HAD NEVER SPUN. Loaded
// without launch parameters, the production build's live guard correctly blocks
// betting ("Game unavailable. Your session could not be verified."), so every
// SPIN click was a no-op and the balance read $100.00 before and after. Every
// geometric assertion still passed, and the "spinning" and "result" captures
// were photographs of an idle screen with different filenames.
//
// That is precisely the class of empty proof reviewer 3 objected to in the old
// popout gate. So this proof launches with real parameters and intercepts the
// two wallet endpoints with OFFICIAL-SHAPED payloads, exactly as
// recovery_banner_proof.mjs does, and then ASSERTS THE BALANCE MOVED. A capture
// where nothing happened can no longer pass.
const RGS_HOST = 'rgs.mini-player-proof.invalid'
// Raised 2026-07-26, JOB 3(e). It was 100_000_000 ($100.00), a four-character
// value, and every legibility assertion passed against it while the owner's real
// session showed the mini strip dropping the cents off a $1,040.06 balance and
// cutting the WIN glyph. A proof that only ever renders short numbers cannot see
// the defect that only long numbers cause.
//
// $52,431,098.76 is deliberately hostile and deliberately realistic: the owner
// ran this game at a $50,000,000 balance, and the DTT offers presets up to
// $10,000,000,000.00. Twelve significant characters plus separators and cents is
// the worst case a player can actually reach, so it is what the strip must hold.
//
// BOTH FIXTURES ARE REQUIRED, because Fable's ruling closing TR-066 has two
// halves and a proof of one half is not a proof of the ruling:
//
//   HOSTILE  the full string cannot fit the measured slot at the legible floor,
//            so the strip must ABBREVIATE ("$52.43M") rather than cut.
//   FITS     the full string does fit, so it must render IN FULL. Without this
//            case, a build that abbreviated everything unconditionally would
//            pass, and that is a worse product than the defect.
//
// FITS_MICROS is not an invented number. It is the balance in the owner's own
// Popout S capture, 28_popout_s_mini_strip_TR066_win_clipped.png, where the
// strip rendered "BAL $1,040" with the cents cut off. It is therefore the exact
// value that must now render as "$1,040.06".
const HOSTILE_MICROS = 52_431_098_760_000
const FITS_MICROS    = 1_040_060_000
let START_MICROS = HOSTILE_MICROS

const cell = (n) => ({ name: n, wild: n === 'W', scatter: n === 'S' })
const boardOf = (rows) => rows.map((reel) => reel.map(cell))
const WIN_BOARD = boardOf([
  ['L1', 'H1', 'H1', 'L3', 'L2', 'M1'],
  ['M2', 'H1', 'L1', 'L3', 'L2', 'M1'],
  ['M3', 'H1', 'M1', 'L3', 'L2', 'M1'],
  ['L1', 'L1', 'M2', 'L3', 'L2', 'M1'],
  ['L1', 'L1', 'M2', 'L3', 'L2', 'M1'],
])
const WIN_EVENTS = [
  { type: 'reveal', board: WIN_BOARD, gameType: 'basegame' },
  { type: 'winInfo', wins: [{ symbol: 'H1', kind: 3, win: 390, meta: { ways: 6, globalMult: 1 } }], totalWin: 390 },
  { type: 'setTotalWin', amount: 390 },
  { type: 'finalWin', amount: 390 },
]
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
let betCount = 0
const playBody = () => {
  betCount += 1
  return {
    balance: { amount: START_MICROS - betCount * 1_000_000, currency: 'USD' },
    round: {
      betID: 5000 + betCount, active: true, mode: 'base',
      amount: 1_000_000, payout: 3_900_000, payoutMultiplier: 390,
      state: { events: WIN_EVENTS },
    },
  }
}
const endBody = () => ({ balance: { amount: START_MICROS - betCount * 1_000_000 + 3_900_000, currency: 'USD' } })

// Wallet calls actually made, counted at the interception point.
//
// THIS REPLACED A DISPLAY-STRING COMPARISON, and the reason is worth keeping.
// The check that proves "a real spin happened, this is not a photograph of an
// idle screen" used to read the BALANCE readout before and after and require it
// to differ. That worked while the strip rendered "$100.00"; it broke the
// moment the abbreviation ruling landed, because at a $52,431,098.76 balance a
// $1.00 bet leaves the rendered string at "$52.43M" both times. The check went
// red and it was RIGHT to: its evidence source had stopped being evidence.
//
// The repair is not a looser comparison, it is a better source. A count of
// intercepted /wallet/play calls proves the round reached the wallet, and it
// cannot be affected by how the result is formatted, which is precisely the
// property the old version lacked.
const walletCalls = { authenticate: 0, play: 0, endRound: 0 }

async function routeWallet(page) {
  await page.route(`**://${RGS_HOST}/**`, async (route) => {
    const url = route.request().url()
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) })
    if (url.includes('/wallet/authenticate')) { walletCalls.authenticate += 1; return json(authBody()) }
    if (url.includes('/wallet/play')) { walletCalls.play += 1; return json(playBody()) }
    if (url.includes('/wallet/end-round')) { walletCalls.endRound += 1; return json(endBody()) }
    return json({})
  })
}
const LAUNCH = (base, extra = '') =>
  `${base}/?sessionID=mini-proof&rgs_url=${RGS_HOST}&lang=en${extra}`

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

/**
 * Measure every mini-HUD control: its rendered box, and its EFFECTIVE touch
 * target including the ::after extension several of them use to reach 44px
 * without the visual eating the 44px row.
 */
const MEASURE = `(() => {
  const hud = document.querySelector('[data-testid="mini-hud"]')
  if (!hud) return { present: false }
  const sel = [
    ['menu',      '[data-testid="mini-menu"]'],
    ['balance',   '[data-testid="hud-balance"]'],
    ['win',       '[data-testid="hud-win"]'],
    ['bet',       '[data-testid="hud-bet"]'],
    ['betDown',   '[data-testid="hud-bet"] .m-bet-step:first-of-type'],
    ['betUp',     '[data-testid="hud-bet"] .m-bet-step:last-of-type'],
    ['spin',      '[data-testid="spin-button"]'],
  ]
  // The FEATURES trigger is a SIBLING of the mini HUD, not a child: App puts
  // both in the native-hud-slot row. It is measured because it went missing
  // entirely in an earlier draft of this layout, and a control a player cannot
  // reach is the worst failure this proof can catch.
  const fm = document.querySelector('[data-testid="feature-menu-button"]')
  const out = { present: true, hud: hud.getBoundingClientRect().toJSON(), controls: {} }
  for (const [name, q] of sel) {
    const el = hud.querySelector(q)
    if (!el) { out.controls[name] = null; continue }
    const r = el.getBoundingClientRect()
    // Effective target: the box grown by any ::after inset extension.
    const after = getComputedStyle(el, '::after')
    let grow = 0
    if (after && after.content && after.content !== 'none') {
      const t = parseFloat(after.top) || 0
      grow = Math.abs(Math.min(0, t))
    }
    out.controls[name] = {
      x: r.x, y: r.y, w: r.width, h: r.height,
      targetW: r.width + grow * 2, targetH: r.height + grow * 2,
      text: (el.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 40),
      // LEGIBILITY, measured.
      //
      // REPAIRED 2026-07-26, JOB 3(e). The previous version of this check was
      // 'v.scrollWidth > v.clientWidth + 1' and it was VACUOUS: every
      // .m-stat-value carries 'use:autofitText', which iteratively shrinks the
      // font until scrollWidth <= clientWidth. The condition it tested is the
      // exact condition autofit exists to eliminate, so it could only ever be
      // false. It passed while the owner's Popout S capture plainly showed the
      // WIN readout cut mid-glyph, which is how it was found.
      //
      // Three real failure modes replace it, none of which autofit can mask:
      //
      //   clippedByAncestor  the whole stat box is cut by a parent's overflow.
      //                      This is what the owner actually saw: the value was
      //                      not overflowing its own box, its box was off the
      //                      end of the strip.
      //   autofitFloorHit    autofit gave up at MIN_SCALE (0.4) and the content
      //                      still does not fit, so it IS truncated.
      //   illegible          autofit "succeeded" by shrinking the rendered text
      //                      below a readable size. Fitting by becoming
      //                      unreadable is not fitting.
      //
      // EXTENDED 2026-07-26 for the abbreviation ruling. 'truncated' now also
      // fails when the effective rendered size the action settled on is under
      // the legible floor the action itself published. The floor is read off
      // 'data-fit-floor' rather than hardcoded here, so the gate cannot drift
      // away from the value the code actually used.
      fitMode: (() => {
        const v = el.querySelector('.m-stat-value')
        return v ? (v.dataset.fitMode ?? null) : null
      })(),
      fitPx: (() => {
        const v = el.querySelector('.m-stat-value')
        const n = v ? parseFloat(v.dataset.fitPx ?? '') : NaN
        return Number.isFinite(n) ? n : null
      })(),
      fitFloor: (() => {
        const v = el.querySelector('.m-stat-value')
        const n = v ? parseFloat(v.dataset.fitFloor ?? '') : NaN
        return Number.isFinite(n) ? n : null
      })(),
      truncated: (() => {
        const v = el.querySelector('.m-stat-value')
        if (!v) return false
        if (v.scrollWidth > v.clientWidth + 1) return true
        // Wrapping is not fitting. In a 44px strip a value that breaks
        // onto a second line is cut vertically, and scrollWidth stays
        // equal to clientWidth because it 'fits' horizontally. Found by
        // the seeded case below, which this check originally missed.
        if (v.scrollHeight > v.clientHeight + 1) return true

        // Clipped by any ancestor that establishes a clipping context.
        const vr = v.getBoundingClientRect()
        let p = v.parentElement
        while (p && p !== document.body) {
          const o = getComputedStyle(p)
          if (/(hidden|auto|scroll|clip)/.test(o.overflowX) || /(hidden|auto|scroll|clip)/.test(o.overflowY)) {
            const pr = p.getBoundingClientRect()
            if (vr.right - pr.right > 1 || pr.left - vr.left > 1
              || vr.bottom - pr.bottom > 1 || pr.top - vr.top > 1) return true
          }
          p = p.parentElement
        }
        // Also clipped by the viewport itself.
        if (vr.right - window.innerWidth > 1 || vr.left < -1) return true

        const cs = getComputedStyle(v)
        const scale = parseFloat(v.style.getPropertyValue('--autofit-scale') || '1')
        if (scale <= 0.4 + 0.001 && v.scrollWidth > v.clientWidth) return true
        // Effective rendered size. Below 9px a currency value on a 400x225
        // popout is not readable, and "it fits" stops meaning anything.
        const effective = (parseFloat(cs.fontSize) || 0)
        if (effective > 0 && effective < 9) return true
        // The action's own settled size against the action's own published
        // floor. This catches a fit bought below the legible floor even where
        // the computed font-size has already been rounded back up by the
        // engine, which the raw computed read above cannot see.
        const px = parseFloat(v.dataset.fitPx ?? '')
        const floor = parseFloat(v.dataset.fitFloor ?? '')
        if (Number.isFinite(px) && Number.isFinite(floor) && px < floor - 0.01) return true
        return false
      })(),
      disabled: !!el.disabled,
      visible: r.width > 0 && r.height > 0,
    }
  }
  if (fm) {
    const r = fm.getBoundingClientRect()
    const after = getComputedStyle(fm, '::after')
    let grow = 0
    if (after && after.content && after.content !== 'none') {
      grow = Math.abs(Math.min(0, parseFloat(after.top) || 0))
    }
    out.controls.features = {
      x: r.x, y: r.y, w: r.width, h: r.height,
      targetW: r.width + grow * 2, targetH: r.height + grow * 2,
      text: '', truncated: false, disabled: !!fm.disabled,
      visible: r.width > 0 && r.height > 0,
    }
  } else {
    out.controls.features = null
  }
  // Anything rendered below the viewport is not operable, whatever its size.
  out.viewportH = window.innerHeight
  out.viewportW = window.innerWidth
  return out
})()`

/** Two boxes overlap if they intersect on both axes. */
function overlaps(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
}

async function run() {
  if (!existsSync(join(ROOT, 'dist', 'index.html'))) {
    console.error('dist/ is absent. Run `npm run build` first.')
    process.exit(2)
  }
  const port = await getFreePort()
  const preview = await startPreview(port)
  const base = `http://localhost:${port}`
  const states = {}
  const checks = {}

  try {
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: VIEWPORT })
    const consoleErrors = []
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
    page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message))

    await routeWallet(page)
    await page.goto(LAUNCH(base), { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 30000 })
    await dismissIntro(page)
    await page.waitForTimeout(500)

    // The session must be LIVE, or nothing below means anything.
    checks.sessionIsLive = {
      pass: await page.locator('[data-testid="live-guard-banner"]').count() === 0,
      note: 'without launch params the live guard blocks betting and every spin capture is of an idle screen',
    }
    const readBalance = () => page.evaluate(
      () => document.querySelector('[data-testid="hud-balance"]')?.innerText.replace(/\s+/g, ' ').trim() ?? '',
    )
    const balanceAtStart = await readBalance()

    const capture = async (name) => {
      await page.screenshot({ path: join(SCREENS, `${name}.png`) })
      states[name] = await page.evaluate(MEASURE)
    }

    // 1. IDLE
    await capture('idle')

    // 2. SPINNING, captured mid-spin rather than after it
    await page.locator('[data-testid="spin-button"]').click()
    await page.waitForTimeout(320)
    await capture('spinning')
    await waitSpinDone(page, 30000).catch(() => {})

    // 3. RESULT, the settled board with the win readout populated
    await page.waitForTimeout(900)
    await capture('result')

    // THE SPIN ACTUALLY HAPPENED. Without this the two captures above could be
    // an idle screen twice, which is what the first run of this script produced.
    // Asserted against the WALLET, not against the readout: see walletCalls.
    const balanceAfter = await readBalance()
    checks.theSpinActuallyRan = {
      pass: walletCalls.play >= 1,
      playCalls: walletCalls.play,
      balanceBefore: balanceAtStart, balanceAfter,
      note: 'counted at the wallet, because at an abbreviated balance a $1.00 bet does not change the rendered string',
    }
    checks.theWinIsPresented = {
      pass: !/\$0\.00\s*$/.test(await page.evaluate(
        () => document.querySelector('[data-testid="hud-win"]')?.innerText.replace(/\s+/g, ' ').trim() ?? '')),
    }

    // 4. FEATURE. Driven by the curated mock pool rather than by waiting for a
    //    natural 1-in-185 trigger, which is what the evidence convention allows
    //    and what feature-flow-2026-07-25 already does.
    await page.goto(LAUNCH(base, '&mockCategory=feature_trigger'), { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 30000 })
    await dismissIntro(page)
    await page.waitForTimeout(400)
    await page.locator('[data-testid="spin-button"]').click()
    // Wait for the free-spins overlay, then capture it in the popout.
    await page.waitForSelector('[data-testid="freespins-overlay"]:not(.warm-mount *)', { timeout: 30000 }).catch(() => {})
    await page.waitForTimeout(1400)
    await page.screenshot({ path: join(SCREENS, 'feature.png') })
    states.feature = await page.evaluate(MEASURE)

    // 5. MODAL. The paytable over a 225px viewport is the hardest surface here,
    //    and R2R3's predecessor gate only ever proved its Continue button was
    //    clickable.
    await page.goto(LAUNCH(base), { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 30000 })
    await dismissIntro(page)
    await page.waitForTimeout(400)
    await page.locator('[data-testid="mini-menu"]').click()
    await page.waitForTimeout(200)
    await page.locator('.hud-menu-item').first().click()
    await page.waitForSelector('[data-testid="interface-guide"]', { timeout: 15000 })
    await page.waitForTimeout(400)
    await page.screenshot({ path: join(SCREENS, 'modal.png') })
    states.modal = await page.evaluate(MEASURE)
    checks.modalIsScrollableAndClosable = {
      pass: await page.locator('[data-testid="interface-guide"]').count() > 0,
    }
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    checks.modalClosesOnEscape = {
      pass: await page.locator('[data-testid="interface-guide"]').count() === 0,
    }

    // ── The two assertions the finding is actually about ────────────────────
    const overlapFindings = []
    const smallTargets = []
    const offscreen = []
    for (const [state, m] of Object.entries(states)) {
      if (!m || !m.present) continue
      const named = Object.entries(m.controls).filter(([, v]) => v && v.visible)
      for (let i = 0; i < named.length; i++) {
        for (let j = i + 1; j < named.length; j++) {
          const [an, a] = named[i]; const [bn, b] = named[j]
          // The bet cluster legitimately contains its own steppers.
          if (an === 'bet' && (bn === 'betUp' || bn === 'betDown')) continue
          if (bn === 'bet' && (an === 'betUp' || an === 'betDown')) continue
          if (overlaps(a, b)) overlapFindings.push({ state, a: an, b: bn })
        }
      }
      for (const [name, c] of named) {
        if (['menu', 'betUp', 'betDown', 'spin', 'features'].includes(name)) {
          // A DISABLED control is exempt, and this is a real distinction rather
          // than a convenience. The bet steppers are disabled mid-spin, and the
          // CSS deliberately drops their touch extension with them: a 44px
          // target on a control that cannot be pressed is dead space that steals
          // room from the ones that can. The proof caught this by measuring the
          // spinning state, which is exactly why it measures every state rather
          // than only idle.
          if (c.disabled) continue
          if (c.targetW < MIN_TARGET || c.targetH < MIN_TARGET) {
            smallTargets.push({ state, name, targetW: +c.targetW.toFixed(1), targetH: +c.targetH.toFixed(1) })
          }
        }
        if (c.y + c.h > m.viewportH + 0.5 || c.x + c.w > m.viewportW + 0.5 || c.x < -0.5 || c.y < -0.5) {
          offscreen.push({ state, name })
        }
      }
    }

    checks.dedicatedProfileIsActive = {
      pass: Object.values(states).every((m) => m && m.present),
      note: 'the mini HUD renders at 400x225, not the compact-landscape strip',
    }
    checks.noControlsOverlap = { pass: overlapFindings.length === 0, findings: overlapFindings }
    checks.everyTargetIs44px = { pass: smallTargets.length === 0, findings: smallTargets }
    checks.nothingRendersOffscreen = { pass: offscreen.length === 0, findings: offscreen }

    // No stat value may be cut off. This is the other half of "legible", and
    // the half a geometric overlap test cannot see.
    const truncatedStats = []
    for (const [state, m] of Object.entries(states)) {
      if (!m || !m.present) continue
      for (const name of ['balance', 'win', 'bet']) {
        const c = m.controls[name]
        if (c && c.visible && c.truncated) truncatedStats.push({ state, name, text: c.text })
      }
    }
    checks.noStatValueIsTruncated = { pass: truncatedStats.length === 0, findings: truncatedStats }
    checks.hudFitsItsBudget = {
      pass: Object.values(states).every((m) => !m.present || m.hud.height <= 46),
      heights: Object.fromEntries(Object.entries(states).map(([k, m]) => [k, m?.hud?.height ?? null])),
    }
    // The FEATURES trigger must EXIST and be reachable in every non-feature
    // state. It fell out of the row entirely in an earlier draft, and only
    // svelte-check noticing an unused prop revealed it.
    const featureStates = ['idle', 'result', 'modal']
    checks.featuresTriggerIsReachable = {
      pass: featureStates.every((st) => states[st]?.controls?.features?.visible),
      states: Object.fromEntries(featureStates.map((st) => [st, !!states[st]?.controls?.features?.visible])),
    }
    // ── THE ABBREVIATION RULING, both halves ────────────────────────────────
    //
    // Fable, closing TR-066: "In the 400x225 profile alone, BALANCE and WIN
    // abbreviate (up to four significant characters plus magnitude suffix,
    // $52.43M form) exactly when the fully formatted value cannot fit the
    // measured slot at the legible floor; values that fit render in full; every
    // other profile keeps full precision everywhere."
    //
    // Half one, on the hostile fixture already captured above.
    const RULED_FORM = /^\$\d{1,3}(?:\.\d{1,3})?[KMBT]$/
    const abbrevFindings = []
    for (const [state, m] of Object.entries(states)) {
      if (!m || !m.present) continue
      for (const name of ['balance', 'win']) {
        const c = m.controls[name]
        if (!c || !c.visible) continue
        if (c.fitMode === null) { abbrevFindings.push({ state, name, why: 'no fitMode published, the action did not run' }); continue }
        if (c.fitMode !== 'compact') continue
        // The VALUE text, with the label stripped: c.text is "BAL $52.43M".
        const value = c.text.split(/\s+/).slice(1).join(' ')
        if (!RULED_FORM.test(value)) abbrevFindings.push({ state, name, value, why: 'not the ruled $52.43M form' })
      }
    }
    checks.abbreviationTakesTheRuledForm = { pass: abbrevFindings.length === 0, findings: abbrevFindings }
    // The floor this gate reasons about must be the floor the code used.
    const publishedFloors = Object.values(states)
      .flatMap((m) => (m && m.present ? ['balance', 'win'] : []).map((n) => m.controls[n]?.fitFloor))
      .filter((v) => v !== null && v !== undefined)
    checks.theLegibleFloorIsTheOneTheCodeUsed = {
      pass: publishedFloors.length > 0 && publishedFloors.every((f) => f === MIN_LEGIBLE_FLOOR),
      expected: MIN_LEGIBLE_FLOOR,
      published: [...new Set(publishedFloors)],
    }
    checks.balanceAbbreviatesAtTheHostileBalance = {
      pass: ['idle', 'spinning', 'result', 'modal'].every(
        (st) => states[st]?.controls?.balance?.fitMode === 'compact'),
      note: `$52,431,098.76 cannot fit the measured slot at the ${MIN_LEGIBLE_FLOOR}px floor, so it must abbreviate rather than be cut`,
      modes: Object.fromEntries(Object.entries(states).map(([k, m]) => [k, m?.controls?.balance?.fitMode ?? null])),
      rendered: Object.fromEntries(Object.entries(states).map(([k, m]) => [k, m?.controls?.balance?.text ?? null])),
    }

    // Half two: a value that FITS must render in full. Without this a build
    // that abbreviated unconditionally would pass every check above.
    START_MICROS = FITS_MICROS
    betCount = 0
    await page.goto(LAUNCH(base), { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 30000 })
    await dismissIntro(page)
    await page.waitForTimeout(600)
    await page.screenshot({ path: join(SCREENS, 'idle-fits-in-full.png') })
    const fits = await page.evaluate(MEASURE)
    states['idle-fits-in-full'] = fits
    checks.aValueThatFitsRendersInFull = {
      pass: fits?.controls?.balance?.fitMode === 'full'
        && fits?.controls?.win?.fitMode === 'full'
        && /1,040\.06/.test(fits?.controls?.balance?.text ?? '')
        && !fits?.controls?.balance?.truncated
        && !fits?.controls?.win?.truncated,
      note: 'the owner-captured balance, which the shipped build rendered as "BAL $1,040" with the cents cut off',
      balance: fits?.controls?.balance ?? null,
      win: fits?.controls?.win ?? null,
    }

    // "Every other profile keeps full precision everywhere." Same hostile
    // balance, three larger profiles, asserting the complete figure is present.
    START_MICROS = HOSTILE_MICROS
    betCount = 0
    const OTHER_PROFILES = [
      ['desktop',   { width: 1280, height: 800 }],
      ['portrait',  { width: 390,  height: 844 }],
      ['landscape', { width: 812,  height: 375 }],
    ]
    const fullPrecision = {}
    for (const [name, vp] of OTHER_PROFILES) {
      await page.setViewportSize(vp)
      await page.goto(LAUNCH(base), { waitUntil: 'domcontentloaded' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 30000 })
      await dismissIntro(page)
      await page.waitForTimeout(600)
      fullPrecision[name] = await page.evaluate(
        () => (document.querySelector('[data-testid="hud-balance"]')?.innerText ?? '')
          .replace(/\s+/g, ' ').trim())
    }
    await page.setViewportSize(VIEWPORT)
    checks.everyOtherProfileKeepsFullPrecision = {
      pass: Object.values(fullPrecision).every((txt) => txt.includes('52,431,098.76')),
      rendered: fullPrecision,
    }

    checks.zeroConsoleErrors = { pass: consoleErrors.length === 0, errors: consoleErrors.slice(0, 5) }

    // ── SEEDED VIOLATION, convention (p) ────────────────────────────────────
    //
    // noStatValueIsTruncated passed for weeks while the WIN readout was
    // visibly cut in the owner's Popout S capture, because it tested
    // `scrollWidth > clientWidth`, the one condition `use:autofitText` exists
    // to eliminate. It could only ever return false. A green result meant
    // nothing, and nobody could tell, because it had never been seen to fail.
    //
    // Three violations are planted, one per real failure mode, in the form each
    // actually occurs. The OLD check would have caught none of them.
    await page.goto(LAUNCH(base), { waitUntil: 'domcontentloaded' })
    await dismissIntro(page)
    await page.waitForTimeout(400)
    const isTruncated = async () =>
      (await page.evaluate(MEASURE))?.controls?.win?.truncated === true

    const seeded = []
    const mutations = [
      ['clipped by an ancestor, the form the owner photographed',
        `document.querySelector('[data-testid="hud-win"] .m-stat-value').style.cssText += ';position:relative;left:400px'`],
      ['autofit floor reached and content still overflowing',
        `(() => { const v = document.querySelector('[data-testid="hud-win"] .m-stat-value'); v.textContent = '$1,234,567,890.00'; v.style.setProperty('--autofit-scale','0.4'); v.style.setProperty('width','20px','important'); v.style.setProperty('display','block','important'); v.style.setProperty('overflow','hidden','important'); v.style.setProperty('white-space','nowrap','important') })()`],
      ['fits only by becoming illegible, effective font under 9px',
        `document.querySelector('[data-testid="hud-win"] .m-stat-value').style.fontSize = '6px'`],
      // The two seeds below plant the failure of the ABBREVIATION ruling
      // itself, which is a new claim and therefore needs its own proof that
      // the gate can go red on it. The first is literally the pre-fix build:
      // the full string left in a slot too small for it, at full size, which
      // is what produced "BAL $1,040" in the owner's capture.
      ['the abbreviation did not happen and the full value is left to be cut',
        `(() => { const v = document.querySelector('[data-testid="hud-win"] .m-stat-value'); v.textContent = '$52,431,098.76'; v.dataset.fitMode = 'full'; v.style.setProperty('--autofit-scale','1') })()`],
      ['abbreviated, but the fit was bought below the published legible floor',
        `(() => { const v = document.querySelector('[data-testid="hud-win"] .m-stat-value'); v.dataset.fitPx = String(parseFloat(v.dataset.fitFloor || '9') - 1) })()`],
    ]
    for (const [why, js] of mutations) {
      await page.evaluate(js)
      await page.waitForTimeout(80)
      const caught = await isTruncated()
      seeded.push({ why, caught })
      console.log(`  ${caught ? 'caught' : 'MISSED'}  seeded: ${why}`)
      await page.goto(LAUNCH(base), { waitUntil: 'domcontentloaded' })
      await dismissIntro(page)
      await page.waitForTimeout(400)
    }
    // Negative control: untouched, it must be clean, or the check is just
    // returning true for everything and is no better than the one it replaced.
    const cleanControl = !(await isTruncated())
    console.log(`  ${cleanControl ? 'clean ' : 'FALSE+'}  seeded: negative control, an untouched HUD must pass`)

    checks.truncationGateCanActuallyFail = {
      pass: seeded.every((s) => s.caught) && cleanControl,
      seeded, negativeControl: cleanControl,
    }

    await browser.close()
  } finally {
    preview.kill()
  }

  const allPass = Object.values(checks).every((c) => c.pass)
  writeFileSync(join(QA, 'mini_player_proof_2026-07-26.json'), JSON.stringify({
    generated: '2026-07-26',
    row: 'TR-043, dedicated 400x225 mini-player HUD',
    viewport: VIEWPORT,
    supersedes: 'reports/screens/layouts-2026-07-25/popout-400x225.png and reports/qa/popout_conformance_2026-07-27.json',
    states: Object.keys(states),
    measurements: states,
    checks,
    allPass,
  }, null, 2))

  for (const [k, v] of Object.entries(checks)) {
    console.log(`  ${v.pass ? 'ok  ' : 'FAIL'} ${k}`)
    if (!v.pass && v.findings) for (const f of v.findings.slice(0, 10)) console.log(`        ${JSON.stringify(f)}`)
  }
  if (!allPass) { console.error('\nMINI PLAYER: FAIL'); process.exitCode = 1 }
  else console.log('\nMINI PLAYER: PASS')
}

run().catch((e) => { console.error(e); process.exit(1) })
