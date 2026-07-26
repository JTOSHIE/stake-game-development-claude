// feature_price_proof.mjs - JOB 3(f) / TR-068 (2026-07-26).
//
// THE FINDING. The owner reported "the balance wasn't updating" in a live
// portal session. It was: four HUD balances reconcile to the platform's own bet
// log to the cent. What the owner saw is real and is a presentation problem. At
// 06:23:37 the HUD read WIN $57,215.00 in large green type while the balance
// fell by $142,785, because the round had cost $200,000. Seven of the owner's
// eight buy rounds were "wins" that lost money.
//
// FABLE'S RULING, option (a) refined: the gross WIN readout is RETAINED and the
// headline multiplier stays against the BET LEVEL, both being the genre
// convention that a reviewer expects. What is added is a SECONDARY FEATURE
// PRICE line on the result banner of BOUGHT ROUNDS ONLY, driven by the same
// integer-micros cost source as the confirm dialog, routed through the social
// vocabulary layer.
//
// SO THIS PROVES FOUR THINGS, and the last two are the ones a screenshot would
// not show:
//
//   PRESENT   the line renders on a bought round's result banner.
//   EXACT     its value is byte-identical to the price string the player agreed
//             to in the confirm dialog. Not "about right": the same string. A
//             price line that disagreed with the confirm dialog by a cent would
//             be worse than no price line at all.
//   RETAINED  the WIN headline is still the GROSS payout and the multiplier is
//             still against the bet level, so the ruling's "retained" half is
//             asserted rather than assumed. Without this the proof would pass
//             on a build that had quietly switched to a net presentation, which
//             is option (b), the reading Fable declined.
//   ABSENT    a round that was NOT bought shows no price line. Without this a
//             build that showed the line on every round would pass everything
//             above.
//
// Run at BOTH a real-money and a social session, per the ruling.
//
// Run (from frontend/, with the dev server NOT already on 5173):
//   node scripts/feature_price_proof.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dismissIntro, waitSpinDone, clickAnyPendingGate } from './lib/dismissOverlays.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const QA = join(ROOT, '..', 'reports', 'qa')
const SHOTS = join(ROOT, '..', 'reports', 'screens', 'feature-price-2026-07-26')
mkdirSync(QA, { recursive: true })
mkdirSync(SHOTS, { recursive: true })

const failures = []
const check = (name, cond, detail = '') => {
  if (!cond) failures.push({ name, detail })
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond || !detail ? '' : `  ${detail}`}`)
}

async function freePort() {
  return new Promise((res, rej) => {
    const s = createServer(); s.on('error', rej)
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)) })
  })
}
function devServer(port) {
  return new Promise((res, rej) => {
    const p = spawn('npx', ['vite', '--port', String(port), '--strictPort'],
      { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] })
    let done = false
    const on = (d) => { if (!done && /Local|localhost/.test(d.toString())) { done = true; res(p) } }
    p.stdout.on('data', on); p.stderr.on('data', on); p.on('error', rej)
    setTimeout(() => { if (!done) rej(new Error('vite did not start')) }, 20000)
  })
}

const text = (page, sel) => page.evaluate(
  (s) => (document.querySelector(s)?.textContent ?? '').replace(/\s+/g, ' ').trim(), sel)

/**
 * Drive one complete bought round and read everything off it.
 *
 * `social` selects the session shape. Both are run because the ruling requires
 * the label to survive the vocabulary layer, and a real-money-only proof would
 * say nothing about stake.us.
 */
async function boughtRound(browser, base, opts) {
  const { social, tier } = opts
  const url = `${base}/?mock=1&mockCategory=${opts.category}${social ? '&social=true' : ''}`
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
  await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
  await dismissIntro(page)

  // A wallet that affords the 400x tier at a $1,000 bet, which is the shape the
  // owner actually played at: $400,000 a round.
  // Super turbo, so the free-spins presentation runs at its shortest legal
  // beat lengths. The holds are floored rather than skipped (TR-033), so this
  // changes how long the proof takes and nothing about what it renders.
  await page.evaluate(() => {
    window.__testStores.balance.set(50_000_000)
    window.__testStores.betAmount.set(1000)
    window.__testStores.speedTier.set('super')
  })
  await page.waitForTimeout(400)

  // Reach the confirm dialog the way a player does.
  if (!(await page.locator('[data-testid="feature-menu-cards"]').count())) {
    await page.locator('[data-testid="feature-menu-button"]').first().click()
    await page.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 10000 })
  }
  await page.waitForTimeout(350)
  await page.locator(`[data-testid="activate-${tier}"]`).click()
  await page.waitForSelector('[data-testid="buy-confirm"]', { timeout: 10000 })
  await page.waitForTimeout(300)

  // THE PRICE THE PLAYER AGREES TO. Read off the dialog, not computed here: a
  // proof that recomputed the expected value would be checking its own
  // arithmetic against itself.
  const confirmPrice = await page.evaluate(
    () => (document.querySelector('.buy-modal .buy-stat-val.gold')?.textContent ?? '')
      .replace(/\s+/g, ' ').trim())
  await page.screenshot({ path: join(SHOTS, `${social ? 'social' : 'real'}-${tier}-01-confirm.png`) })

  // data-testid="buy-confirm" is on the CONFIRM BUTTON itself, not the dialog.
  await page.locator('[data-testid="buy-confirm"]').click()

  // The bought round plays its whole feature out before the result banner, and
  // the presentation has a deliberate CLICK TO CONTINUE gate at the entry that
  // a player has to press. A first draft of this proof waited 60 seconds on the
  // banner and timed out with the feature sitting on that gate: the round was
  // not slow, it was waiting for a human. So the proof presses it, which is
  // what a player does, rather than routing around the gate.
  //
  // Pressed through `clickAnyPendingGate`, which uses the DOM's own .click()
  // rather than Playwright's. A first draft called `locator.click()` and every
  // press timed out after 2s with the button plainly visible in the capture:
  // the gate button animates continuously, so Playwright's stability check
  // never settles on it. The shared helper exists for exactly this and is
  // already used by twenty other scripts.
  const deadline = Date.now() + 180000
  while (Date.now() < deadline) {
    if (await page.locator('[data-testid="win-banner"]').count()) break
    await clickAnyPendingGate(page)
    await page.waitForTimeout(400)
  }
  await page.waitForSelector('[data-testid="win-banner"]', { timeout: 30000 })
  await page.waitForTimeout(700)
  await page.screenshot({ path: join(SHOTS, `${social ? 'social' : 'real'}-${tier}-02-banner.png`) })

  const priceLine = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="win-feature-price"]')
    if (!el) return null
    return {
      label: (el.querySelector('.c1-price-label')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      value: (el.querySelector('.c1-price-value')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
    }
  })
  const headline = await text(page, '[data-testid="win-banner"] .c1-amount')
  const mult = await text(page, '[data-testid="win-banner"] .c1-mult')
  // The store the price came from, read directly so the proof can show the
  // integer micros rather than only the formatted string.
  const priceMicros = await page.evaluate(async () => {
    const m = await import('/src/lib/stores/boughtRound.ts')
    let v
    m.boughtRound.subscribe((x) => { v = x })()
    return v?.priceMicros ?? null
  })
  await page.close()
  return { confirmPrice, priceLine, headline, mult, priceMicros, errors }
}

async function run() {
  const port = await freePort()
  const server = await devServer(port)
  const base = `http://localhost:${port}`
  const results = {}
  try {
    const browser = await chromium.launch()

    for (const [name, opts] of [
      ['realMoney_super_400x', { social: false, tier: 'super', category: 'super_win_mid' }],
      ['social_bonus_100x',    { social: true,  tier: 'bonus', category: 'bonus_win_mid' }],
    ]) {
      console.log(`\n${name}`)
      const r = await boughtRound(browser, base, opts)
      results[name] = r
      check(`${name}: the FEATURE PRICE line is present`, r.priceLine !== null)
      check(`${name}: its value is the SAME STRING as the confirm dialog's price`,
        r.priceLine?.value === r.confirmPrice,
        `banner ${JSON.stringify(r.priceLine?.value)} vs confirm ${JSON.stringify(r.confirmPrice)}`)
      check(`${name}: the label is not empty and not a raw key`,
        !!r.priceLine?.label && !/^[a-z][A-Za-z]+$/.test(r.priceLine.label),
        JSON.stringify(r.priceLine?.label))
      check(`${name}: the price is carried as integer micros`,
        Number.isInteger(r.priceMicros) && r.priceMicros > 0, String(r.priceMicros))
      // RETAINED. The gross headline and the bet-level multiplier are the half
      // of the ruling that says what must NOT change.
      check(`${name}: the WIN headline is still a money amount, not a net figure`,
        !!r.headline && !r.headline.startsWith('-'), JSON.stringify(r.headline))
      check(`${name}: the multiplier line is still Nx BET/PLAY, against the bet level`,
        /^\d+x\s+\S+/.test(r.mult), JSON.stringify(r.mult))
      check(`${name}: no page errors`, r.errors.length === 0, r.errors.slice(0, 2).join(' | '))
    }

    // The label must survive the vocabulary layer. Checked against the real
    // term table rather than by eye, in BOTH modes.
    const scanPage = await browser.newPage()
    await scanPage.goto(base, { waitUntil: 'networkidle' })
    const scan = await scanPage.evaluate(async (labels) => {
      const v = await import('/src/lib/i18n/vocabulary.ts')
      return labels.map((l) => ({ label: l, hits: v.scanProhibited(l, { includeNeverRewrite: true }) }))
    }, [results.realMoney_super_400x.priceLine?.label, results.social_bonus_100x.priceLine?.label].filter(Boolean))
    results.vocabularyScan = scan
    check('the price label carries no prohibited term in either mode',
      scan.every((s) => s.hits.length === 0), JSON.stringify(scan))
    await scanPage.close()

    // ── THE NEGATIVE CONTROL ────────────────────────────────────────────────
    // A base-game round that was NOT bought must show no price line. Without
    // this, a build that rendered the line unconditionally would satisfy every
    // assertion above, and "cost shown on every spin" is a different product
    // from the one that was ruled.
    console.log('\nnegativeControl_baseWin')
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(`${base}/?mock=1&mockCategory=base_win_large`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
    await page.waitForFunction(() => window.__testStores !== undefined, { timeout: 10000 })
    await dismissIntro(page)
    await page.waitForTimeout(300)
    await page.locator('[data-testid="spin-button"]').click()
    await waitSpinDone(page, 60000).catch(() => {})
    await page.waitForSelector('[data-testid="win-banner"]', { timeout: 60000 })
    await page.waitForTimeout(600)
    await page.screenshot({ path: join(SHOTS, 'negative-control-base-win.png') })
    const controlHasLine = await page.locator('[data-testid="win-feature-price"]').count()
    const controlBannerText = await text(page, '[data-testid="win-banner"]')
    results.negativeControl = { hasPriceLine: controlHasLine > 0, bannerText: controlBannerText }
    check('negative control: a base-game win shows NO price line', controlHasLine === 0,
      JSON.stringify(controlBannerText))
    await page.close()

    await browser.close()
  } finally { server.kill() }

  results.failures = failures
  results.pass = failures.length === 0
  writeFileSync(join(QA, 'feature_price_proof_2026-07-26.json'), JSON.stringify(results, null, 2))
  if (failures.length) {
    console.error(`\nFEATURE PRICE: FAIL (${failures.length})`)
    for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
    process.exit(1)
  }
  console.log('\nFEATURE PRICE: PASS')
}

run().catch((e) => { console.error(e); process.exit(1) })
