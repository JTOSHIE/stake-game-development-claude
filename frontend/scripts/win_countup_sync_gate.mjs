#!/usr/bin/env node
//
// win_countup_sync_gate.mjs: the banner and the WIN pod show ONE number.
//
// MID-01, ruled by Fable, carried by reports/briefs/FS_TRUE_FIXDOWN_Prompt.md:
// "banner and WIN pod driven from one shared count-up source, with frame-level
// equality asserted".
//
// WHY THIS EXISTS, and it is measured rather than hypothetical.
// ------------------------------------------------------------
// Two components animated the SAME number, $winAmount, on two independent
// requestAnimationFrame loops with two independent duration rules and the SAME
// easing:
//
//     WinBanner.svelte:79    { big: 1400, mega: 2000, epic: 2800 }
//     HudOverlay.svelte:312  min(800, 400 + min(400, multiplier * 8))
//
// Same curve shape, different lengths. That is the worst case, because the two
// readouts diverge SMOOTHLY: there is no frame where the disagreement announces
// itself, and a player reading the HUD sees the total before the celebration
// counting up to it has arrived. At a big-tier 16x win the HUD settled 872ms
// early; at the epic tier, a full two seconds early.
//
// WHAT IT ASSERTS
//   1. RUNTIME, per frame. Through a real big, mega and epic win, the banner
//      amount and the HUD WIN pod render the SAME string on every sampled
//      frame in which both are visible.
//   2. RUNTIME, ordering. The HUD does not reach its final value before the
//      banner reaches its own. This is the half a player actually feels, and
//      it is a different claim from equality: two surfaces could agree frame by
//      frame and still both be wrong about when to finish.
//   3. SOURCE. Exactly one win count-up frame loop exists in src/lib. A second
//      one reintroduced anywhere is the defect returning, and it would not be
//      caught by 1 or 2 until someone happened to capture the right frame.
//
// SEEDED SELF-TEST, convention (p). Two seeds, one per judgement:
//   - the comparator is fed the two HISTORICAL curves, computed with the
//     SHIPPED easeOutCubic and the shipped duration rule plus the pre-fix HUD
//     rule, and must report divergence AND early settling;
//   - the source scan is fed a planted second frame loop and must report it.
// A gate that has never been seen to fail is not evidence. It is a script that
// prints PASS.
//
// USAGE
//   node scripts/win_countup_sync_gate.mjs
//   node scripts/win_countup_sync_gate.mjs --self-test
//
import { chromium } from 'playwright'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC = join(ROOT, 'src', 'lib')
const COUNT_UP_MODULE = join(SRC, 'stores', 'winCountUp.ts')

// The seed reads the SHIPPED tier durations out of the module rather than
// carrying a hand copy, so a change to them cannot leave this gate seeding a
// stale defect. Extraction failure is fatal rather than silent: a rename that
// this regex stops matching would otherwise seed zeros and "pass".
function shippedTierDurations() {
  const body = readFileSync(COUNT_UP_MODULE, 'utf-8')
  const m = body.match(/TIER_COUNT_UP_MS[^=]*=\s*\{\s*big:\s*(\d+),\s*mega:\s*(\d+),\s*epic:\s*(\d+)\s*\}/)
  if (!m) {
    console.error(`FATAL: could not read TIER_COUNT_UP_MS from ${relative(ROOT, COUNT_UP_MODULE)}. `
      + 'The seed would be meaningless, so this is a failure rather than a skip.')
    process.exit(1)
  }
  return { big: Number(m[1]), mega: Number(m[2]), epic: Number(m[3]) }
}

// The shipped easing, cubic ease-out. Both historical loops used exactly this,
// so the seed varies ONLY the duration, which is the defect.
const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3)

// The three tiers, driven as bet=1 so winAmount IS the bet multiple. Chosen at
// the boundaries the thresholds actually use: 16 is the brief's worked instance,
// 40 clears mega, 150 clears epic.
const TIERS = [
  { name: 'big', multiplier: 16, expectMs: 1400 },
  { name: 'mega', multiplier: 40, expectMs: 2000 },
  { name: 'epic', multiplier: 150, expectMs: 2800 },
]

// The PRE-FIX HUD duration rule, kept here as a historical constant so the seed
// reproduces the real defect. This is NOT a restatement of the current rule:
// the current rule is imported from the shipped module above and the seed
// compares the two.
const PRE_FIX_HUD_MS = (m) => Math.min(800, 400 + Math.min(400, m * 8))

function getFreePort() {
  return new Promise((res, rej) => {
    const srv = createServer()
    srv.on('error', rej)
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => res(port)) })
  })
}

function startDevServer(port) {
  return new Promise((res, rej) => {
    const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], {
      cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'],
    })
    let done = false
    const onData = (d) => { if (!done && /Local/.test(d.toString())) { done = true; res(proc) } }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', rej)
    setTimeout(() => { if (!done) rej(new Error('vite dev server did not start in time')) }, 20000)
  })
}

// ── 1 and 2: the runtime sample ──────────────────────────────────────────────
//
// Sampled inside the page on requestAnimationFrame, because sampling from node
// over CDP cannot see a per-frame disagreement: the round trip is longer than
// the frames it is trying to catch.
const SAMPLE = `(durationMs) => new Promise((resolve) => {
  const visibleText = (sel) => {
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden') {
        return (el.innerText || '').replace(/\\s+/g, ' ').trim()
      }
    }
    return null
  }
  const samples = []
  const t0 = performance.now()
  function tick() {
    const t = performance.now() - t0
    samples.push({ t, banner: visibleText('[data-testid="win-amount"]'), hud: visibleText('[data-testid="hud-win"]') })
    if (t < durationMs) requestAnimationFrame(tick)
    else resolve(samples)
  }
  requestAnimationFrame(tick)
})`

// The HUD pod renders a label above the value ("WIN\\n$1,234.00"), so compare on
// the money token rather than the whole node text.
function moneyOf(text) {
  if (!text) return null
  const m = text.match(/[^\s]*\d[\d.,]*[^\s]*/g)
  return m ? m[m.length - 1] : null
}

async function runtimeSamples() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const browser = await chromium.launch()
  const out = []
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
    await page.waitForFunction(() => window.__testStores?.winAmount, { timeout: 10000 })
    await dismissIntro(page)

    for (const tier of TIERS) {
      // Reset to zero and let the reset snap land, so each tier starts clean.
      await page.evaluate(() => {
        window.__testStores.isSpinning.set(true)
        window.__testStores.winAmount.set(0)
      })
      await page.waitForTimeout(120)
      await page.evaluate((m) => {
        window.__testStores.balance.set(10_000_000)
        window.__testStores.betAmount.set(1)
        window.__testStores.isSpinning.set(false)
        window.__testStores.winAmount.set(m)
      }, tier.multiplier)
      // page.evaluate with a STRING evaluates it as an expression rather than
      // calling it with the argument, so the call is written out explicitly.
      // (Same trap win_countup_steady_gate.mjs:147-148 records.)
      const samples = await page.evaluate(`(${SAMPLE})(${tier.expectMs + 400})`)
      out.push({ tier, samples })
    }
  } finally {
    await browser.close().catch(() => {})
    try { server.kill('SIGTERM') } catch { /* already gone */ }
  }
  return out
}

function judgeRuntime(runs) {
  const failures = []
  const ok = (cond, msg) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${msg}`); if (!cond) failures.push(msg) }

  for (const { tier, samples } of runs) {
    const both = samples.filter((s) => s.banner !== null && s.hud !== null)
    ok(both.length > 5, `${tier.name}: banner and HUD were both visible for ${both.length} sampled frames`)

    const mismatches = both.filter((s) => moneyOf(s.banner) !== moneyOf(s.hud))
    const worst = mismatches[0]
    ok(mismatches.length === 0,
      `${tier.name}: banner and HUD agree on EVERY frame`
      + (worst ? ` (first divergence at ${Math.round(worst.t)}ms: banner ${moneyOf(worst.banner)} vs HUD ${moneyOf(worst.hud)}, ${mismatches.length} frames)` : ''))

    // Ordering: the HUD must not settle before the banner does. "Settled" is the
    // first frame whose value equals the last observed value and never changes again.
    const settleIndex = (key) => {
      const vals = both.map((s) => moneyOf(s[key]))
      const final = vals[vals.length - 1]
      let i = vals.length - 1
      while (i > 0 && vals[i - 1] === final) i--
      return i
    }
    const hudSettled = both[settleIndex('hud')]
    const bannerSettled = both[settleIndex('banner')]
    if (hudSettled && bannerSettled) {
      const early = bannerSettled.t - hudSettled.t
      ok(early <= 80,
        `${tier.name}: the HUD does not reveal the total before the celebration `
        + `(HUD settled ${Math.round(hudSettled.t)}ms, banner ${Math.round(bannerSettled.t)}ms, HUD early by ${Math.round(early)}ms)`)

      // THE DURATION ITSELF. Added after the gate's first real run: equality and
      // ordering both passed while every tier ran the 400ms floor, because the
      // driver was reading a stale derived multiplier. Two surfaces agreeing on
      // the wrong number is not what MID-01 asked for, and without this the
      // regression was invisible.
      //
      // The floor is generous, because the count-up's last frames move by less
      // than a cent and the rendered STRING therefore stops changing before the
      // tween formally ends. What it must exclude is a whole tier being wrong,
      // which is a factor of three or more.
      const observed = bannerSettled.t
      const floor = tier.expectMs * 0.55
      ok(observed >= floor,
        `${tier.name}: the count-up actually runs its tier length `
        + `(settled ${Math.round(observed)}ms against a ${tier.expectMs}ms tier, floor ${Math.round(floor)}ms)`)
    }
  }
  return failures
}

// ── 3: the source scan ───────────────────────────────────────────────────────
//
// Exactly one win count-up frame loop may exist. Written as a scan rather than a
// spot check on two files, because the defect this replaces was two components
// each believing it owned the clock, and the third one would be found the same way.
function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (/\.(ts|svelte)$/.test(p) && !/\.test\.ts$/.test(p)) out.push(p)
  }
  return out
}

const COUNT_UP_LOOP = /requestAnimationFrame\s*\(\s*(tick|countUp)\s*\)/

const SHARED_LOOP = 'src/lib/stores/winCountUp.ts'

// FROZEN DEBT, keyed by FILE so a new loop anywhere else still fails.
//
// Found by this gate's own negative control on its first run, which is exactly
// what convention (p) predicts: "expect the gate's first real run to correct the
// gate". MID-01 was recorded as TWO clocks. There are THREE.
//
// WinDisplay.svelte carries a third count-up over the same $winAmount on its own
// 600ms rule (WinDisplay.svelte:50). It is NOT a MID-01 instance and is frozen
// rather than fixed, on evidence rather than convenience: App.svelte:1689 renders
// <ReplayMode /> and App.svelte:1716 onward renders the game, in mutually
// exclusive branches of one {#if isReplay}. WinDisplay is mounted only by
// ReplayMode.svelte:309, so it never renders beside the HUD WIN pod or the
// banner and no player can see two disagreeing figures at once. What is real is
// a THIRD duration rule for one figure, which is a consistency defect on a
// compliance-mandated surface and is recorded for disposition rather than fixed
// inside a pass whose scope is the shared pair.
const FROZEN = [
  {
    file: 'src/lib/components/WinDisplay.svelte',
    reason: 'replay-only surface, mutually exclusive with the HUD; third duration rule recorded as MID-01b',
  },
]

function scanSource(extraFiles = []) {
  const hits = []
  for (const file of walk(SRC)) {
    const body = readFileSync(file, 'utf-8')
    if (COUNT_UP_LOOP.test(body)) hits.push(relative(ROOT, file))
  }
  for (const [name, body] of extraFiles) if (COUNT_UP_LOOP.test(body)) hits.push(name)
  return hits
}

function judgeSource(hits) {
  const failures = []
  const ok = (cond, msg) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${msg}`); if (!cond) failures.push(msg) }

  console.log(`  note  ${FROZEN.length} frozen count-up loop(s) excused, each keyed by file:`)
  for (const f of FROZEN) console.log(`          ${f.file}  (${f.reason})`)

  const frozenFiles = FROZEN.map((f) => f.file)
  const unexpected = hits.filter((h) => h !== SHARED_LOOP && !frozenFiles.includes(h))
  ok(unexpected.length === 0,
    `no win count-up frame loop outside the shared one and the frozen list (found: ${unexpected.join(', ') || 'none'})`)

  ok(hits.includes(SHARED_LOOP), `the shared count-up loop exists at ${SHARED_LOOP}`)

  // Both directions, per the frozen-debt ratchet: an entry matching nothing
  // means a fix landed without its entry being removed, and a ratchet that can
  // rust is not a ratchet.
  const rusted = frozenFiles.filter((f) => !hits.includes(f))
  ok(rusted.length === 0,
    `every frozen entry still matches something (stale entries: ${rusted.join(', ') || 'none'})`)

  return failures
}

// ── the seeds ────────────────────────────────────────────────────────────────
//
// Convention (p): plant the exact defect in the form it really occurs and prove
// the gate goes red. Seed 1 is the two historical curves; seed 2 is a second
// frame loop planted in a component, which is how the defect would return.
function seedTwoClockSamples(multiplier, tierName) {
  const bannerMs = shippedTierDurations()[tierName] // shipped rule, read from source
  const hudMs = PRE_FIX_HUD_MS(multiplier)          // the rule that shipped before MID-01
  const target = multiplier
  const samples = []
  for (let t = 0; t <= bannerMs + 400; t += 16) {
    const fmt = (ms) => '$' + (target * easeOutCubic(Math.min(t / ms, 1))).toFixed(2)
    samples.push({ t, banner: fmt(bannerMs), hud: 'WIN ' + fmt(hudMs) })
  }
  return samples
}

;(async () => {
  const selfTest = process.argv.includes('--self-test')

  if (selfTest) {
    console.log('SEEDED VIOLATION 1: the two clocks as they shipped before MID-01')
    console.log(`  banner rule (shipped, read from source): ${shippedTierDurations().big}ms at 16x`)
    console.log(`  HUD rule (pre-fix):                      ${PRE_FIX_HUD_MS(16)}ms at 16x`)
    const seeded = TIERS.map((tier) => ({ tier, samples: seedTwoClockSamples(tier.multiplier, tier.name) }))
    const seededFailures = judgeRuntime(seeded)
    if (seededFailures.length === 0) {
      console.error('\nWIN COUNTUP SYNC GATE SELF-TEST: FAIL. The two pre-fix clocks did NOT diverge, '
        + 'so the runtime comparator is not measuring what it claims to measure.')
      process.exit(1)
    }
    console.log(`  caught  ${seededFailures.length} judgements went red on the pre-fix pair`)

    console.log('\nSEEDED VIOLATION 2: a second win count-up frame loop planted in a component')
    const planted = scanSource([['src/lib/components/SeededSecondClock.svelte',
      'function tick(){} requestAnimationFrame(tick)']])
    const plantedFailures = judgeSource(planted)
    if (plantedFailures.length === 0) {
      console.error('\nWIN COUNTUP SYNC GATE SELF-TEST: FAIL. A planted second frame loop was NOT detected, '
        + 'so the source scan cannot see the defect returning.')
      process.exit(1)
    }
    console.log('  caught  the planted second loop was reported')

    console.log('\nNEGATIVE CONTROL: the real tree must still pass the source scan')
    if (judgeSource(scanSource()).length !== 0) {
      console.error('\nWIN COUNTUP SYNC GATE SELF-TEST: FAIL. The gate fails on clean input, which is '
        + 'useless in a different way.')
      process.exit(1)
    }

    console.log('\nWIN COUNTUP SYNC GATE SELF-TEST: PASS (both defects reproduce, clean input passes)')
    process.exit(0)
  }

  console.log('WIN COUNTUP SYNC GATE')
  console.log('\nSOURCE: one frame loop')
  const sourceFailures = judgeSource(scanSource())

  console.log('\nRUNTIME: frame-level equality and ordering')
  const runtimeFailures = judgeRuntime(await runtimeSamples())

  const failures = [...sourceFailures, ...runtimeFailures]
  if (failures.length) {
    console.error(`\nWIN COUNTUP SYNC GATE: FAIL (${failures.length})`)
    process.exit(1)
  }
  console.log('\nWIN COUNTUP SYNC GATE: PASS')
})().catch((err) => { console.error(err); process.exit(1) })
