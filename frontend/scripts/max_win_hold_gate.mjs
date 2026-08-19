#!/usr/bin/env node
//
// max_win_hold_gate.mjs: the max-win celebration holds until the player collects.
//
// THE RULE, owner's order 2026-07-28 (reports/briefs/FS_PLAYER_EXPERIENCE_PASS_Prompt.md):
//
//     The max-win celebration must hold indefinitely: nothing auto-advances,
//     nothing progresses behind it, no timer dismisses it; it leaves only on
//     the player's COLLECT or ENTER.
//
// WHY THIS EXISTS, and it is not hypothetical.
// -------------------------------------------
// The overlay itself was always correct: it carries no timer and its promise,
// App.svelte's waitForWincapCollect(), is resolved by nothing but the collect
// handler. What was NOT correct was what ran BEHIND it. The App-level WinBanner
// fires reactively on `$winMultiplier >= 10`, a capped round is 5,000x, and the
// flag that suppresses it (`lastRoundHadFeature`) is false on the wincap path.
// So on every max win the big-win banner played its count-up and AUTO-DISMISSED
// on its own `duration + 2200ms` timer underneath the z150 celebration, seen by
// nobody and finished long before a player who is staring at a 5,000x win thinks
// about reaching for COLLECT.
//
// That is the class this gate exists to catch: not "does the overlay have a
// timer", which is easy and was never wrong, but "does anything else move while
// it holds".
//
// WHAT IT ASSERTS
//
//   STATIC, ten rules read out of the components rather than restated, so the
//   gate cannot pass while the source says something else:
//     1. the base WinBanner mount suppresses for the whole wincap ROUND;
//     2. the round-long wincap flag is raised at both hold sites and cleared at
//        both round-entry sites;
//     3. MaxWinCelebration registers itself with modalGuard;
//     4. MaxWinCelebration contains no timer of any kind;
//     5. the ways breakdown stops cycling during the hold;
//     6. the board's win-burst teardown defers while the hold is up;
//     7. Bet Replay raises its terminal splash AFTER the round completes;
//     8. both round-entry actions refuse to start a round while the hold is up;
//     9. the SPIN control is disabled by STATE during the hold, not merely
//        covered by a scrim, because a scrim stops a pointer and nothing else;
//    10. the autoplay stop reads the round's own wincap fact, not `$isWincap`,
//        which the collect handler has already cleared by the time it is read.
//
//   RUNTIME, against a REAL capped round out of the shipped book, played through
//   the production build and the production RGS path (no dev hooks: the
//   `?mockCategory=` override is import.meta.env.DEV gated and does not exist in
//   dist, so the wallet endpoints are routed instead and the game cannot tell):
//    11. thirty seconds after the celebration mounts it is still mounted;
//    12. across those thirty seconds, sampled every 500ms, no win banner ever
//        appears behind it;
//    13. balance and win readouts are byte-identical at t+0 and t+30s;
//    14. no /wallet/play and no /wallet/end-round is issued during the hold,
//        INCLUDING after focus is taken off COLLECT, moved to SPIN, and SPACE
//        is pressed. That probe is the one that found the worst of this: before
//        the fix it placed a real bet, reset WIN to $0.00 and made the
//        celebration vanish with no COLLECT at all;
//    15. a real COLLECT click then dismisses it and the round proceeds.
//
// WHAT IS DELIBERATELY NOT ASSERTED, and the brief says to record it.
// -------------------------------------------------------------------
// The big, mega and epic win banners are NOT held to this rule. The owner's
// instruction extends the guarantee to them ONLY IF they already gate on player
// input, and they do not: WinBanner.svelte carries no `on:click`, no
// `on:keydown`, no `svelte:window` listener, no `role` and no `tabindex`, and
// its single exit is `dismissTimer = setTimeout(..., duration + 2200)` at
// :181. Tier durations are big 1400, mega 2000, epic 2800 plus 2200 each, so
// 3.6s, 4.2s and 5.0s. They are timed banners by design and are left exactly as
// they are. The max-win celebration is the one surface that waits for a person.
//
// USAGE
//   node scripts/max_win_hold_gate.mjs
//   node scripts/max_win_hold_gate.mjs --self-test
//
import { chromium } from 'playwright'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn, execFileSync } from 'node:child_process'
import { startStaticServer, assertNoSurvivors } from './lib/previewServer.mjs'
import { qaTmpDir } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ── TR-101: the server runs IN THIS PROCESS now ──────────────────────────────
//
// Fable's ruling 2026-07-28, option (c): the orphanable child is DELETED rather
// than managed. `lib/previewServer.mjs` serves dist/ over node:http from inside
// this process, so there is no `npx`, no vite child, no process group, and
// nothing that can survive this script.
//
// The three names below are kept so every call site reads exactly as it did.
// They are adapters, not implementations: the implementation is shared.
//
// NOTE WHAT THIS MAKES IMPOSSIBLE. Three scripts in this family never called
// killPreview at all and leaked a server on every single run. Under option (c)
// that is no longer a leak: forgetting to close costs nothing, because the
// server dies with the process instead of outliving it.
let _server = null
async function getFreePort() {
  _server = await startStaticServer(join(ROOT, 'dist'))
  return _server.port
}
function startPreview() { return _server }
function killPreview() { return _server ? _server.close() : undefined }


// Thirty seconds is the owner's own figure and is what the REAL run measures.
//
// The seeded runs watch for twelve, because both seeds fire four seconds into
// the hold and the detector under test is identical at either length: the
// observation WINDOW is not the thing being proved, the detector is. Running
// three full thirty second holds in CI would spend ninety seconds proving the
// same two facts. Stated here rather than left as an unexplained constant.
const HOLD_MS = 30_000
const SEED_HOLD_MS = 12_000
const SAMPLE_MS = 500

const HARD_TIMEOUT_MS = 5 * 60_000
setTimeout(() => {
  console.error(`MAX WIN HOLD GATE: HARD TIMEOUT after ${HARD_TIMEOUT_MS / 1000}s, failing red`)
  process.exit(1)
}, HARD_TIMEOUT_MS)

// ── the static rules ─────────────────────────────────────────────────────────
//
// Each rule is a predicate over the real file contents. The seeded violation is
// the source AS IT SHIPPED BEFORE THIS FIX, byte for byte, so a rule that stops
// describing the defect stops passing its own self-test.

const APP = join(ROOT, 'src/App.svelte')
const CELEB = join(ROOT, 'src/lib/components/MaxWinCelebration.svelte')

const RULES = [
  {
    name: 'the base WinBanner suppresses for the whole wincap round',
    file: APP,
    check: (s) => {
      const m = /<WinBanner suppressed=\{([^}]*)\}\s*\/>/.exec(s)
      return m ? /lastRoundWasWincap/.test(m[1]) : false
    },
    // Exactly what stood at 6e9e4739, the kit V7 build.
    seed: (s) => s.replace(/<WinBanner suppressed=\{[^}]*\}\s*\/>/,
      '<WinBanner suppressed={lastRoundHadFeature} />'),
    why: 'a 5,000x round clears BIG_WIN_THRESHOLD, so an unsuppressed banner runs and self-dismisses behind the overlay',
  },
  {
    name: 'the round-long wincap flag is raised where the hold begins and cleared each round',
    file: APP,
    check: (s) =>
      (s.match(/lastRoundWasWincap = true/g) || []).length === 2 &&
      (s.match(/lastRoundWasWincap = false/g) || []).length === 3,
    seed: (s) => s.replace(/\s*lastRoundWasWincap = true\n/g, '\n'),
    why: 'suppressing on $isWincap alone moves the banner to just after COLLECT rather than removing it',
  },
  {
    name: 'MaxWinCelebration registers itself with modalGuard',
    file: CELEB,
    check: (s) => /setModalOpen\(\s*'max-win'\s*,\s*show\s*\)/.test(s),
    seed: (s) => s.replace(/\$: setModalOpen\([^\n]*\n/, ''),
    why: 'without it every suppression during the hold depends on a hand-maintained $isWincap list in App.svelte',
  },
  {
    name: 'MaxWinCelebration carries no timer of any kind',
    file: CELEB,
    check: (s) => !/setTimeout|setInterval|requestAnimationFrame/.test(s),
    seed: (s) => s.replace(/function collect\(\): void \{/,
      'function collect(): void {\n    setTimeout(collect, 8000)'),
    why: 'a timer in this component is the most direct possible form of the defect',
  },
  {
    name: 'the ways breakdown stops cycling during the hold',
    file: APP,
    check: (s) => /<WinBreakdown suppressed=\{\$isWincap\}\s*\/>/.test(s),
    seed: (s) => s.replace(/<WinBreakdown suppressed=\{\$isWincap\}\s*\/>/, '<WinBreakdown />'),
    why: 'its 1400ms cycle has no natural end and ran for the whole hold',
  },
  {
    name: 'the board win-burst teardown defers while the hold is up',
    file: join(ROOT, 'src/lib/components/GameGrid.svelte'),
    check: (s) => /if \(get\(isWincap\)\) \{ winBurstTimer = armWinBurstTeardown\(\); return \}/.test(s),
    seed: (s) => s.replace(/\s*if \(get\(isWincap\)\) \{ winBurstTimer = armWinBurstTeardown\(\); return \}\n/, '\n'),
    why: 'the 4000ms teardown fired 1.4s into the hold and stripped the board the overlay sits over',
  },
  {
    name: 'replay raises its terminal splash after the round completes, not before',
    file: join(ROOT, 'src/lib/components/ReplayMode.svelte'),
    check: (s) => !/isWincap\.set\(wincapNow\)\n\n?\s*(\/\/ Let win-line|phase = 'complete')/.test(s)
      && /replayPhase\.set\('complete'\)\n(\s|\S)*?isWincap\.set\(wincapNow\)/.test(s),
    seed: (s) => s.replace(
      /phase = 'complete'\n      replayPhase\.set\('complete'\)/,
      "isWincap.set(wincapNow)\n      phase = 'complete'\n      replayPhase.set('complete')"),
    why: 'Bet Replay re-raised the celebration and then ran a 2000ms settle and the phase change behind it',
  },
  {
    name: 'the round-entry actions refuse to start a round while the hold is up',
    file: APP,
    check: (s) => (s.match(/if \(\$isWincap\) return/g) || []).length === 2,
    seed: (s) => s.replace(/\s*if \(\$isWincap\) return\n/g, '\n'),
    why: 'the SPIN button stays focusable under the scrim and SPACE or ENTER placed a real bet behind the hold',
  },
  // THE SPIN-CONTROL RULE USED TO SIT HERE AND IT WAS A STATIC STRING COUNT.
  //
  // It required the literal `disabled={$isWincap ? true : ($isSpinning ? false :
  // !$canSpin)}` to appear exactly four times in HudOverlay.svelte. That is an
  // assertion about an IDENTIFIER'S SPELLING, not about the control, and it
  // failed on run 31815432853 for a rename that made the behaviour STRONGER:
  // `canSpin` compares the balance against the bare bet, `canAffordSpin`
  // compares it against the bet times the mode cost, and the ternary's shape,
  // including the `$isWincap ? true` arm this rule exists to protect, was
  // untouched. The gate went red while the thing it guards was correct.
  //
  // It is now a RUNTIME assertion, `spinDisabledPerProfile` below, which reads
  // the rendered `disabled` property off the DOM at wincap in each of the four
  // layout profiles the four instances belong to. A rename cannot break it and
  // a real regression cannot hide from it.
  {
    name: 'the autoplay stop reads the round fact, not the already-cleared $isWincap',
    file: APP,
    check: (s) => /if \(\$autoPlayCount <= 0 \|\| roundIsWincap \|\| rg\.stop\)/.test(s),
    // Exactly what stood at 6e9e4739.
    seed: (s) => s.replace(/if \(\$autoPlayCount <= 0 \|\| roundIsWincap \|\| rg\.stop\)/,
      'if ($autoPlayCount <= 0 || $isWincap || rg.stop)'),
    why: 'handleWincapCollect clears isWincap before resolving, so that term is dead when it is read',
  },
]

function runStatic(seeded) {
  const failures = []
  for (const r of RULES) {
    const src = readFileSync(r.file, 'utf-8')
    const subject = seeded ? r.seed(src) : src
    const ok = r.check(subject)
    if (seeded) {
      // Under the seed the rule MUST go red. A seed the rule still passes means
      // the rule is not describing the defect it claims to describe.
      console.log(`  ${ok ? 'MISSED' : 'caught'}  ${r.name}`)
      if (ok) failures.push(`SEED NOT CAUGHT: ${r.name} (${r.why})`)
    } else {
      console.log(`  ${ok ? 'ok    ' : 'FAIL  '}  ${r.name}`)
      if (!ok) failures.push(`${r.name} (${r.why})`)
    }
  }
  return failures
}

// ── the runtime harness ──────────────────────────────────────────────────────

const RGS_HOST = 'rgs.max-win-hold-gate.invalid'
const START_MICROS = 100_000_000
const BET_MICROS = 1_000_000
// A capped round pays exactly 5,000x the bet. In micros, against a 1.00 bet.
const WIN_MICROS = 5_000 * BET_MICROS

/**
 * A REAL capped round out of the shipped book, not an invented payload. Serving
 * a synthetic 5,000x would prove the overlay reacts to a number; serving the
 * book's own round proves it reacts to an outcome the maths genuinely produces.
 */
function wincapRound() {
  const samples = JSON.parse(readFileSync(join(ROOT, 'src/lib/mock/sample_rounds.json'), 'utf-8'))
  const entry = samples.find((e) => e.category === 'wincap' && e.mode === 'base')
  if (!entry) throw new Error('no base-mode wincap round in the shipped sample book')
  return entry.round
}

const authBody = () => ({
  balance: { amount: START_MICROS, currency: 'USD' },
  config: {
    minBet: 100_000, maxBet: 100_000_000, stepBet: 100_000,
    defaultBetLevel: BET_MICROS,
    betLevels: [100_000, 500_000, BET_MICROS, 2_000_000],
    jurisdiction: {
      socialCasino: false, disabledFullscreen: false, disabledTurbo: false,
      disabledSuperTurbo: false, disabledAutoplay: false, disabledSlamstop: false,
      disabledSpacebar: false, disabledBuyFeature: false, displayNetPosition: false,
      displayRTP: false, displaySessionTimer: false, minimumRoundDuration: 0,
    },
  },
  round: null,
})

async function routeWallet(page, counters) {
  const round = wincapRound()
  await page.route(`**://${RGS_HOST}/**`, async (route) => {
    const url = route.request().url()
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) })
    if (url.includes('/wallet/authenticate')) return json(authBody())
    if (url.includes('/wallet/play')) {
      counters.play += 1
      return json({
        balance: { amount: START_MICROS - BET_MICROS, currency: 'USD' },
        round: {
          betID: 987654,
          active: true,
          mode: 'base',
          amount: BET_MICROS,
          payout: WIN_MICROS,
          payoutMultiplier: round.payoutMultiplier,   // 500000 centibets, the cap
          state: { events: round.events },
        },
      })
    }
    if (url.includes('/wallet/end-round')) {
      counters.endRound += 1
      return json({ balance: { amount: START_MICROS - BET_MICROS + WIN_MICROS, currency: 'USD' } })
    }
    return json({})
  })
}




// S2-C025. THE SENTINEL IS KEPT AND THE ROW'S OWN PRESCRIPTION IS REFUSED, with
// the reason, because the recorded remainder is a hypothesis about the fix and
// this one is wrong.
//
// The row said to replace the .catch with a hard throw. A throw here escapes
// runtime() through its finally, reaches the top-level IIFE which has no .catch,
// and becomes an unhandled rejection. That is technically non-zero and it is the
// wrong red twice over: the self-test's accounting shape is
// `const failures = await runtime(kind)` followed by a `caught` / `MISSED` line,
// so a throw means runtime() never returns and the seeded run CRASHES instead of
// printing `caught`; and convention (p) asks for a gate seen to go red with a
// NAMED finding, not a stack trace. It would also discard the diagnostic, since
// '<absent>' inside the ok() message is what tells a reader which readout went.
//
// So the sentinel stays and the assertion moves to the caller, where it can name
// what it found. The explicit 2s timeout is not cosmetic: innerText() defaults to
// 30s, this file sets no default, and four readout calls on a seeded run would
// pay about 120s of pure waiting against the 5 minute HARD_TIMEOUT_MS watchdog
// that guards the whole --self-test process. 2s is generous for an element the
// harness has already waited 45s for max-win-collect to appear beside.
const readout = (page, id) =>
  page.locator(`[data-testid="${id}"]`).first().innerText({ timeout: 2000 }).catch(() => '<absent>')

async function runtime(seedKind) {
  const holdMs = seedKind ? SEED_HOLD_MS : HOLD_MS
  const port = await getFreePort()
  const preview = await startPreview(port)
  const browser = await chromium.launch()
  const counters = { play: 0, endRound: 0 }
  const failures = []
  const ok = (cond, msg) => { console.log(`  ${cond ? 'ok    ' : 'FAIL  '}  ${msg}`); if (!cond) failures.push(msg) }

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await routeWallet(page, counters)
    await page.goto(
      `http://localhost:${port}/?sessionID=maxwin-hold-gate&rgs_url=${RGS_HOST}&lang=en`,
      { waitUntil: 'domcontentloaded' })

    // Through the splash screens to a live HUD.
    //
    // MEASURED, not assumed. The boot sequence leaves `.hero-splash` up at
    // z-index 300 across the whole viewport with `pointer-events: auto`, and it
    // dismisses on a click on ITSELF. A click aimed at the spin button's
    // coordinates while it is up is swallowed by the splash, and playwright
    // reports it as the spin button being intercepted, which reads like a
    // different problem entirely.
    const spin = page.locator('[data-testid="spin-button"]').first()
    await spin.waitFor({ state: 'visible', timeout: 45_000 })

    // TWO boot surfaces, and they dismiss differently. HeroSplash is
    // tap-anywhere, so it is clicked on itself. IntroSplash, the Overdrive
    // explainer, is NOT: its root is `.intro-backdrop` and it only leaves via
    // its own CONTINUE button. Clicking the backdrop does nothing at all, which
    // is correct behaviour for an explainer and is why this loop names the
    // button rather than the surface.
    for (let i = 0; i < 12; i++) {
      const hero = page.locator('.hero-splash').first()
      if (await hero.count() && await hero.isVisible().catch(() => false)) {
        await hero.click({ force: true }).catch(() => {})
        await page.waitForTimeout(350)
        continue
      }
      const cont = page.locator('[data-testid="intro-continue"]').first()
      if (await cont.count() && await cont.isVisible().catch(() => false)) {
        await cont.click({ force: true }).catch(() => {})
        await page.waitForTimeout(350)
        continue
      }
      break
    }

    // Then require the spin button to be the TOPMOST element at its own centre
    // before clicking it, so any remaining full-stage overlay (the warm-mounted
    // Overdrive subtree included) is waited out rather than clicked through.
    await page.waitForFunction(() => {
      const btn = document.querySelector('[data-testid="spin-button"]')
      if (!btn) return false
      const r = btn.getBoundingClientRect()
      if (r.width === 0) return false
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return !!top && (top === btn || btn.contains(top))
    }, { timeout: 30_000 })

    await spin.click()

    const collect = page.locator('[data-testid="max-win-collect"]')
    await collect.waitFor({ state: 'visible', timeout: 45_000 })
    console.log('  celebration mounted, beginning the hold')

    // The seeds go in the instant the celebration is up, which is exactly when
    // the real defect fired.
    if (seedKind === 'banner') {
      // The form that really shipped: a big-win banner appears behind the
      // overlay and removes itself on its own timer.
      await page.evaluate(() => {
        const el = document.createElement('div')
        el.className = 'c1-win big-win-banner tier-epic'
        el.style.cssText = 'position:fixed;inset:0;z-index:100;'
        document.body.appendChild(el)
        setTimeout(() => el.remove(), 4000)
      })
    } else if (seedKind === 'dismiss') {
      // The other half of the rule: something other than the player takes the
      // celebration away.
      await page.evaluate(() => {
        setTimeout(() => {
          const btn = document.querySelector('[data-testid="max-win-collect"]')
          if (btn) btn.click()
        }, 4000)
      })
    } else if (seedKind === 'readout') {
      // S2-C025, and it has to be a PARTIAL absence to be the real form.
      //
      // A total HudOverlay non-mount never reaches the swallow: spin-button
      // lives in the same component and :337 already waits 45s for it, so the
      // run goes red loudly and early for a different reason. Seeding that would
      // be seeding a form the gate already catches by accident.
      //
      // The uncovered case is the readouts gone while the spin button survives,
      // which is what a refactor actually does: HudOverlay carries four copies of
      // each testid, one per profile branch, and this gate's 1280x720 viewport
      // selects the fullscreen branch alone.
      await page.evaluate(() => {
        document.querySelector('[data-testid="hud-balance"]')?.remove()
        document.querySelector('[data-testid="hud-win"]')?.remove()
      })
    }

    const playAtHold = counters.play
    const endAtHold = counters.endRound
    const balance0 = await readout(page, 'hud-balance')
    const win0 = await readout(page, 'hud-win')

    // S2-C025: THE PRECONDITION THAT MAKES THE EQUALITY CHECKS MEAN SOMETHING.
    //
    // Without this, an absent readout made both endpoint reads '<absent>', and
    // the two assertions below compared '<absent>' === '<absent>', printed ok,
    // and pushed nothing. The hold's balance and win checks were vacuous exactly
    // when the HUD was broken, which is the only time they mattered.
    //
    // Asserted at the t+0 endpoint ONLY, deliberately. A readout that vanishes
    // MID-hold is already caught, because a real value is not equal to
    // '<absent>' and the equality assertions go red on their own. The single
    // uncovered case was both endpoints absent, and this closes exactly that
    // without a second assertion that could only ever duplicate one.
    ok(/[0-9]/.test(balance0), `the BALANCE readout is present and carries a value ("${balance0}")`)
    ok(/[0-9]/.test(win0), `the WIN readout is present and carries a value ("${win0}")`)

    // Sample across the whole hold, because a banner that appears and dismisses
    // between two endpoint reads is invisible to an endpoint comparison, and
    // that banner is the defect this gate was written for.
    let bannerSeen = 0
    let unmounted = false
    let keyboardProbed = false
    const samples = Math.floor(holdMs / SAMPLE_MS)
    for (let i = 0; i < samples; i++) {
      await page.waitForTimeout(SAMPLE_MS)
      bannerSeen += await page.locator('.big-win-banner').count()
      if (!(await collect.isVisible().catch(() => false))) { unmounted = true; break }

      // THE KEYBOARD ROUTE, probed a quarter of the way in.
      //
      // The scrim stops a POINTER. It does not stop a key. `isSpinning` is
      // already false by the time the celebration raises (GameGrid clears it
      // when the reels land, long before the 2600ms dwell and the settle), and
      // the balance has just been credited a 5,000x win, so `canSpin` is true
      // and the SPIN button is `disabled=false` and still tabbable underneath
      // the overlay. A player who started the round by clicking SPIN still has
      // it focused. SPACE or ENTER on a focused button is activated by the
      // BROWSER, and App.svelte's own keydown handler cannot prevent it because
      // every guard returns before `e.preventDefault()`.
      //
      // If that lands it is not a cosmetic violation: it places a real wallet
      // bet behind the held celebration, and the new round's settle calls
      // `isWincap.set(false)` unconditionally, so the overlay disappears with
      // no COLLECT and the original round's promise is left with no resolver.
      if (!keyboardProbed && i > samples / 4) {
        keyboardProbed = true
        const focusMoved = await page.evaluate(() => {
          // Take focus OFF the collect button first. The celebration now moves
          // focus there when it raises, and SPACE on a focused COLLECT is a
          // player collecting, which is exactly what the rule allows. Blurring
          // first is what makes this a test of the SPIN route rather than a
          // test of the collect button.
          const active = document.activeElement
          if (active && active.blur) active.blur()
          const btn = document.querySelector('[data-testid="spin-button"]')
          if (!btn) return 'no spin button'
          btn.focus()
          return document.activeElement === btn ? 'spin button took focus' : 'spin button refused focus'
        })
        console.log(`  keyboard probe: ${focusMoved}`)
        // SPACE, and deliberately not ENTER. ENTER is one of the two keys the
        // owner's rule says MAY dismiss the celebration, so pressing it would be
        // testing the rule's positive half. SPACE is the interesting one: it is
        // not a dismissal key, it activates a focused button natively, and it is
        // the key this game binds to SPIN.
        await page.keyboard.press('Space')
        await page.waitForTimeout(500)
      }
    }

    const balance1 = await readout(page, 'hud-balance')
    const win1 = await readout(page, 'hud-win')

    ok(!unmounted, `the celebration is still mounted after ${holdMs / 1000}s`)
    ok(bannerSeen === 0, `no win banner appeared behind it across ${samples} samples (saw ${bannerSeen})`)
    ok(balance0 === balance1, `BALANCE unchanged across the hold ("${balance0}" then "${balance1}")`)
    ok(win0 === win1, `WIN unchanged across the hold ("${win0}" then "${win1}")`)
    ok(counters.play === playAtHold,
      `no /wallet/play during the hold, INCLUDING after SPACE on the SPIN button `
      + `(${counters.play - playAtHold} seen)`)
    ok(counters.endRound === endAtHold, `no /wallet/end-round during the hold (${counters.endRound - endAtHold} seen)`)

    // And it does leave on a real click.
    if (!unmounted) {
      await collect.click()
      await collect.waitFor({ state: 'hidden', timeout: 20_000 })
      ok(true, 'a real COLLECT click dismisses it and the round proceeds')
    }
    return failures
  } finally {
    await browser.close().catch(() => {})
    killPreview(preview)
  }
}

// ── the four spin controls, asserted at runtime ───────────────────────────────
//
// HudOverlay renders ONE of four mutually exclusive layout branches, and each
// carries its own SPIN button with its own `disabled` binding. The branches are
// selected by three props App.svelte computes from the window, so the honest way
// to reach all four instances is to drive four real viewports rather than to
// count four strings in the source.
//
// THE PROFILES ARE READ OUT OF THE COMPONENT AND ITS CALLER, NOT ASSUMED.
// HudOverlay.svelte declares `portrait`, `miniPlayer` and `compactLandscape` as
// props and branches on them in that order, with the desktop case as the final
// `{:else}`. App.svelte computes each one:
//
//   computePortrait()         innerHeight > innerWidth
//   computeMiniPlayer()       innerWidth <= 480 AND innerHeight <= 300
//   computeCompactLandscape() NOT mini, innerHeight < innerWidth, innerHeight < 500
//
// so the four viewports below are chosen to land one profile each, and the
// assertion CHECKS which branch it actually got by reading the button's own
// class rather than trusting the arithmetic.
const SPIN_PROFILES = [
  { key: 'portrait', cls: 'p-spin', width: 390, height: 844,
    rule: 'innerHeight > innerWidth' },
  { key: 'miniPlayer', cls: 'm-spin', width: 400, height: 225,
    rule: 'innerWidth <= 480 and innerHeight <= 300' },
  { key: 'compactLandscape', cls: 'c-spin', width: 900, height: 450,
    rule: 'not mini, innerHeight < innerWidth, innerHeight < 500' },
  { key: 'fullscreen', cls: 'fs-spin', width: 1280, height: 720,
    rule: 'the {:else} branch, none of the three above' },
]

/**
 * Boot one page to the raised max-win celebration.
 *
 * DELIBERATELY A COPY of the boot sequence inside `runtime()` rather than a
 * refactor of it. That function carries three working seeds and the notes that
 * earned each step; rewriting it to share code here would put those at risk to
 * save a dozen lines. The steps are identical and the reasons are recorded there.
 */
async function bootToCelebration(page, port) {
  await page.goto(
    `http://localhost:${port}/?sessionID=maxwin-spin-gate&rgs_url=${RGS_HOST}&lang=en`,
    { waitUntil: 'domcontentloaded' })
  const spin = page.locator('[data-testid="spin-button"]').first()
  await spin.waitFor({ state: 'visible', timeout: 45_000 })
  for (let i = 0; i < 12; i++) {
    const hero = page.locator('.hero-splash').first()
    if (await hero.count() && await hero.isVisible().catch(() => false)) {
      await hero.click({ force: true }).catch(() => {})
      await page.waitForTimeout(350)
      continue
    }
    const cont = page.locator('[data-testid="intro-continue"]').first()
    if (await cont.count() && await cont.isVisible().catch(() => false)) {
      await cont.click({ force: true }).catch(() => {})
      await page.waitForTimeout(350)
      continue
    }
    break
  }
  await page.waitForFunction(() => {
    const btn = document.querySelector('[data-testid="spin-button"]')
    if (!btn) return false
    const r = btn.getBoundingClientRect()
    if (r.width === 0) return false
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return !!top && (top === btn || btn.contains(top))
  }, { timeout: 30_000 })
  await spin.click()
  await page.locator('[data-testid="max-win-collect"]').waitFor({ state: 'visible', timeout: 45_000 })
}

/**
 * At wincap, in each named profile, the rendered SPIN button must be disabled.
 *
 * Reads the DOM `disabled` PROPERTY and the attribute, not the source text, so a
 * rename of the affordability store cannot break it and a control that renders
 * clickable cannot hide behind a scrim.
 */
async function spinDisabledPerProfile(distDir, profiles) {
  const server = await startStaticServer(distDir)
  const browser = await chromium.launch()
  const failures = []
  const ok = (cond, msg) => { console.log(`  ${cond ? 'ok    ' : 'FAIL  '}  ${msg}`); if (!cond) failures.push(msg) }
  try {
    for (const p of profiles) {
      const page = await browser.newPage({ viewport: { width: p.width, height: p.height } })
      const counters = { play: 0, endRound: 0 }
      await routeWallet(page, counters)
      await bootToCelebration(page, server.port)
      const seen = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('[data-testid="spin-button"]')]
        return btns.map((b) => ({
          cls: b.className,
          disabledProp: b.disabled === true,
          disabledAttr: b.hasAttribute('disabled'),
        }))
      })
      await page.close()

      // One branch renders at a time, so more than one instance means the
      // profile selection itself has broken and every reading below is suspect.
      ok(seen.length === 1,
        `${p.key} ${p.width}x${p.height}: exactly one SPIN control is mounted (saw ${seen.length})`)
      if (seen.length !== 1) continue
      const [btn] = seen
      ok(btn.cls.includes(p.cls),
        `${p.key} ${p.width}x${p.height}: the mounted control is the ${p.cls} instance, `
        + `so the viewport really selected this branch (${p.rule}) (class "${btn.cls}")`)
      ok(btn.disabledProp && btn.disabledAttr,
        `${p.key} ${p.width}x${p.height}: the ${p.cls} SPIN control is DISABLED at wincap, `
        + `read from the DOM (property ${btn.disabledProp}, attribute ${btn.disabledAttr})`)
    }
    return failures
  } finally {
    await browser.close().catch(() => {})
    server.close()
  }
}

/**
 * Convention (p): sever the `$isWincap ? true` arm on ONE instance, in a scratch
 * copy of the source, and require the gate to go red on exactly that instance.
 *
 * The seed is a REBUILD rather than a patch of the built bundle, because the
 * defect it plants is a source defect and a bundle patch would be proving that
 * the gate catches a string edit in a file nobody ships from. The build lands in
 * the gitignored scratch tree, never in the committed `dist`.
 *
 * The working file is restored in a `finally` and then VERIFIED byte for byte.
 * A gate that can leave a component modified is worse than the defect it hunts.
 */
function buildSeededDist(instanceIndex) {
  const file = join(ROOT, 'src/lib/components/HudOverlay.svelte')
  const original = readFileSync(file, 'utf-8')
  const ARM = 'disabled={$isWincap ? true : '
  const positions = []
  for (let i = original.indexOf(ARM); i !== -1; i = original.indexOf(ARM, i + 1)) positions.push(i)
  if (positions.length !== SPIN_PROFILES.length) {
    throw new Error(`seed: expected ${SPIN_PROFILES.length} wincap arms in HudOverlay.svelte, found ${positions.length}`)
  }
  const at = positions[instanceIndex]
  const severed = original.slice(0, at) + 'disabled={' + original.slice(at + ARM.length)
  const out = join(qaTmpDir('max-win-hold-seed'), 'dist')
  try {
    writeFileSync(file, severed)
    execFileSync(join(ROOT, 'node_modules/.bin/vite'),
      ['build', '--outDir', out, '--emptyOutDir'],
      { cwd: ROOT, stdio: 'pipe' })
  } finally {
    writeFileSync(file, original)
  }
  if (readFileSync(file, 'utf-8') !== original) {
    throw new Error('seed: HudOverlay.svelte was NOT restored, refusing to continue')
  }
  return out
}

// ── entry ────────────────────────────────────────────────────────────────────
;(async () => {
  const selfTest = process.argv.includes('--self-test')

  if (selfTest) {
    console.log('MAX WIN HOLD GATE SELF-TEST (convention p)\n')
    console.log('SEEDED VIOLATION, static: each rule re-checked against the source AS IT SHIPPED before this fix')
    const missed = runStatic(true)
    console.log('')
    console.log('SEEDED VIOLATION, runtime: a big-win banner appears behind the hold and removes itself on a timer,')
    console.log('which is the exact form the defect took in the shipped build')
    const bannerFailures = await runtime('banner')
    const caughtBanner = bannerFailures.some((f) => f.startsWith('no win banner appeared'))
    console.log(`  ${caughtBanner ? 'caught' : 'MISSED'}  the runtime detector goes red on a banner behind the hold`)
    console.log('')
    console.log('SEEDED VIOLATION, runtime: something other than the player dismisses the celebration mid-hold')
    const dismissFailures = await runtime('dismiss')
    const caughtDismiss = dismissFailures.some((f) => f.startsWith('the celebration is still mounted'))
    console.log(`  ${caughtDismiss ? 'caught' : 'MISSED'}  the runtime detector goes red on an auto-dismiss`)

    console.log('')
    console.log('SEEDED VIOLATION, runtime: the balance and win readouts are removed while the spin button')
    console.log('survives, so both endpoint reads return the same sentinel and the equality checks pass vacuously')
    const readoutFailures = await runtime('readout')
    const caughtReadout = readoutFailures.some((f) => f.startsWith('the WIN readout is present'))
    // A PAIRED CONTROL, because the seed must go red for the RIGHT reason. If the
    // equality assertions also fired, the readouts were absent at only one
    // endpoint and this would be the old check catching it, not the new one.
    const equalityStayedQuiet = !readoutFailures.some((f) => f.startsWith('WIN unchanged'))
    console.log(`  ${caughtReadout ? 'caught' : 'MISSED'}  the runtime detector goes red on an absent readout`)
    console.log(`  ${equalityStayedQuiet ? 'ok    ' : 'CHECK '}  and it is the new precondition that caught it, `
      + 'not the equality assertion')

    console.log('')
    console.log('SEEDED VIOLATION, source: the `$isWincap ? true` arm is severed on ONE of the four SPIN')
    console.log('controls in a scratch copy of HudOverlay.svelte, rebuilt to a scratch dist, so that one')
    console.log('instance renders ENABLED at wincap while the other three stay correct')
    const SEEDED = 0 // the portrait instance, the first wincap arm in the file
    const seededProfile = SPIN_PROFILES[SEEDED]
    const controlProfile = SPIN_PROFILES[SPIN_PROFILES.length - 1]
    let spinSeedProblems = []
    let caughtSpin = false
    let controlStayedGreen = false
    try {
      const seededDist = buildSeededDist(SEEDED)
      const seedFailures = await spinDisabledPerProfile(seededDist, [seededProfile, controlProfile])
      // The seed must go red on the SEVERED instance, by name.
      caughtSpin = seedFailures.some((f) =>
        f.startsWith(`${seededProfile.key} `) && f.includes('is DISABLED at wincap'))
      // And the PAIRED CONTROL must stay green, or the gate is failing everything
      // and would "catch" a seed it never actually looked at.
      controlStayedGreen = !seedFailures.some((f) => f.startsWith(`${controlProfile.key} `))
      console.log(`  ${caughtSpin ? 'caught' : 'MISSED'}  the ${seededProfile.cls} instance is reported enabled at wincap, by name`)
      console.log(`  ${controlStayedGreen ? 'ok    ' : 'CHECK '}  and the ${controlProfile.cls} control instance stayed green in the same run`)
      rmSync(seededDist, { recursive: true, force: true })
    } catch (e) {
      spinSeedProblems = [`SEED NOT RUN: the severed-source build failed (${e.message})`]
      console.error(`  ERROR   ${e.message}`)
    }

    const problems = [...missed, ...spinSeedProblems]
    if (!caughtSpin) problems.push(`SEED NOT CAUGHT: a severed ${seededProfile.cls} wincap arm did not fail the gate`)
    if (!controlStayedGreen) problems.push(`SEED NOT ISOLATED: the ${controlProfile.cls} control also failed, so the seed proves nothing`)
    if (!caughtBanner) problems.push('SEED NOT CAUGHT: a banner behind the hold did not fail the gate')
    if (!caughtDismiss) problems.push('SEED NOT CAUGHT: an auto-dismiss did not fail the gate')
    if (!caughtReadout) problems.push('SEED NOT CAUGHT: absent balance and win readouts did not fail the gate')
    console.log('')
    if (problems.length) {
      for (const p of problems) console.error(`  ${p}`)
      console.error(`\nMAX WIN HOLD GATE SELF-TEST: FAIL (${problems.length}). `
        + 'A seeded defect this gate did not catch means its PASS means nothing.')
      process.exit(1)
    }
    // TR-101, Fable's ruling: a gate leaves nothing running. Asserted, not
    // cleaned up, because killing here would hide the defect it reports.
    if (!assertNoSurvivors('max win hold gate self-test')) {
      console.error('\nMAX WIN HOLD GATE SELF-TEST: FAIL, this gate left processes behind')
      process.exit(1)
    }
    console.log('MAX WIN HOLD GATE SELF-TEST: PASS (every seeded defect reproduces and is caught)')
    process.exit(0)
  }

  console.log('MAX WIN HOLD GATE\n')
  console.log('STATIC rules, read out of the components:')
  const staticFailures = runStatic(false)
  console.log('')
  console.log(`RUNTIME, a real capped round from the shipped book held for ${HOLD_MS / 1000}s:`)
  const runtimeFailures = await runtime(null)
  console.log('')
  console.log('RUNTIME, the four SPIN controls read from the DOM at wincap, one layout profile each:')
  // FS_SPIN_SEED=<0..3> points this REAL run at a severed-source build, so the
  // claim "a seeded defect gives a real non-zero exit" is demonstrable rather
  // than argued from the code path. It is never set in CI, and it builds to the
  // gitignored scratch tree exactly as the self-test does.
  const seedIdx = process.env.FS_SPIN_SEED
  const spinDist = seedIdx === undefined ? join(ROOT, 'dist') : buildSeededDist(Number(seedIdx))
  if (seedIdx !== undefined) {
    console.log(`  (FS_SPIN_SEED=${seedIdx}: serving a build with the ${SPIN_PROFILES[Number(seedIdx)].cls} wincap arm severed)`)
  }
  const spinFailures = await spinDisabledPerProfile(spinDist, SPIN_PROFILES)

  const failures = [...staticFailures, ...runtimeFailures, ...spinFailures]
  console.log('')
  if (failures.length) {
    for (const f of failures) console.error(`  ${f}`)
    console.error(`\nMAX WIN HOLD GATE: FAIL (${failures.length})`)
    process.exit(1)
  }
  // TR-101, Fable's ruling: a gate leaves nothing running. Asserted, not
  // cleaned up, because killing here would hide the defect it reports.
  if (!assertNoSurvivors('max win hold gate')) {
    console.error('\nMAX WIN HOLD GATE: FAIL, this gate left processes behind')
    process.exit(1)
  }
  console.log('MAX WIN HOLD GATE: PASS (the celebration holds, and nothing moves behind it)')
  process.exit(0)
})()
