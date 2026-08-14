// money_fit_gate.mjs - FABLE BRIEF R059, the governing rule (2026-08-14).
//
// THE RULE UNDER ENFORCEMENT, estate-wide: every money-bearing element
// renders through the one proven fitting mechanism (autofitText / fitMoney)
// in BOTH vocabularies, the currency or token marker is always visible, and
// text-overflow ellipsis on money is BANNED. The owner's screen-by-screen
// sweep at maximum values found the real-money path fitting correctly at
// every size while the social GC path rendered dots (the instrument plates),
// clipped suffixes (the popout compact form) and pushed-out cells (the buy
// strip). Money-bearing elements are marked `data-money` in the source
// ("cur" carries a currency or token marker, "num" is a bare figure), which
// is what makes the rule scannable rather than a review-time judgement.
//
// WHAT IS ASSERTED on every visible [data-money] node, per leg and size:
//   E  computed text-overflow is never 'ellipsis', and the rendered text
//      carries no U+2026 and no three-dot run (the banned dotted state)
//   F  scrollWidth <= clientWidth + 1 and the box sits inside the viewport
//      horizontally (no clipped or pushed-out money)
//   M  data-money="cur" nodes contain the leg's marker (GC / CA$), which
//      with F holding means the marker is VISIBLE, not merely present
//
// LEGS: social GC at the owner's maximum values, and CAD as the control leg
// (the path the owner verified correct; these assertions are its regression
// guard). SIZES: Desktop 1280x720, Popout S 400x225, Mobile S 320x568.
// SURFACES: the HUD at rest, the paytable (mode cards and the ways diagram,
// whose leading 1 must sit inside the plate at 320), the buy confirm dialog
// (the strip DOCKED in the scroll flow per the R059 owner ruling, reachable
// by the same scroll that reaches CONFIRM), and the feature instrument
// panels mid-feature (desktop, the dotted plates of the owner's capture).
//
// SEEDS, convention (p), at the observation boundary (declared, the fit-gate
// precedent), each the defect in the form the owner captured:
//   1  the dotted state: a stylesheet re-adds text-overflow ellipsis with a
//      tight box on money nodes; E must go red
//   2  the stripped-suffix popout: a stylesheet restores the FLAT font-size
//      on the mini strip (the exact recorded no-op trap: an action writing a
//      property nothing reads), so the GC suffix is cut at Popout S; F must
//      go red
//
// RUNNER (TR-123): node, from frontend/. Exit 0 on PASS, non-zero on FAIL,
// terminates; in-process server, closed before exit.
//   node scripts/money_fit_gate.mjs
//   node scripts/money_fit_gate.mjs --self-test

import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import { spawnSync } from 'node:child_process'
import { evidenceDir } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FRONTEND = join(__dirname, '..')
const DIST = join(FRONTEND, 'dist')
const SELF_TEST = process.argv.includes('--self-test')
const SEED = process.env.FS_MONEY_SEED || ''

const FEATURE_ROUND = JSON.parse(readFileSync(
  join(FRONTEND, 'src', 'lib', 'services', '__fixtures__', 'replay_rounds.json'), 'utf8')).bonus.feature

// The owner's maximum-value scenarios: a nine-figure balance and the maximum
// bet, so the compact form, the buy price and the instrument totals all carry
// their longest strings.
const MAX_BALANCE_MICROS = 100_000_000_000_000  // 100,000,000.00
const MAX_BET_MICROS = 1_000_000_000            // 1,000.00 per spin

const LEGS = [
  { name: 'GC',  currency: 'GC',  marker: 'GC' },
  { name: 'CAD', currency: 'CAD', marker: 'CA$' },
]
const SIZES = [
  ['desktop', 1280, 720],
  ['popout-s', 400, 225],
  ['mobile-s', 320, 568],
]

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.webp': 'image/webp',
}

const failures = []
let checks = 0
const check = (name, cond, detail) => {
  checks++
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond ? '' : `  (${detail})`}`)
  if (!cond) failures.push({ name, detail })
}

// The two seeds inject at the OBSERVATION BOUNDARY: a style sheet served
// with the page, the same declared form the replay fit gate uses. Seed 2 is
// the recorded no-op trap verbatim: a flat font-size means the fit action
// writes a property nothing reads.
const SEED_CSS = {
  'ellipsis-restored': '[data-money]{text-overflow:ellipsis !important;max-width:48px !important;overflow:hidden !important;display:inline-block}',
  'flat-font-restored': '.m-stat-value{font-size:11px !important}',
}

function startStub(currency) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      if (req.method === 'POST') {
        let b = ''
        req.on('data', (c) => { b += c })
        req.on('end', () => {
          const json = (o) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)) }
          if (req.url === '/wallet/authenticate') {
            return json({
              balance: { amount: MAX_BALANCE_MICROS, currency },
              config: {
                minBet: 100_000, maxBet: MAX_BET_MICROS, stepBet: 100_000,
                betLevels: [MAX_BET_MICROS], defaultBetLevel: MAX_BET_MICROS,
              },
              round: null,
            })
          }
          if (req.url === '/wallet/play') {
            return json({
              balance: { amount: MAX_BALANCE_MICROS - MAX_BET_MICROS, currency },
              round: {
                betID: 5901, active: true, mode: 'base', amount: MAX_BET_MICROS,
                payout: Math.round(FEATURE_ROUND.payoutMultiplier * MAX_BET_MICROS / 100),
                payoutMultiplier: FEATURE_ROUND.payoutMultiplier,
                state: { events: FEATURE_ROUND.events },
              },
            })
          }
          if (req.url === '/wallet/end-round') {
            return json({ balance: { amount: MAX_BALANCE_MICROS, currency } })
          }
          res.writeHead(404); res.end('{}')
        })
        return
      }
      const rel = (req.url || '/').split('?')[0]
      if (rel === '/__seed.css') {
        res.writeHead(200, { 'Content-Type': 'text/css' })
        return res.end(SEED_CSS[SEED] || '')
      }
      const p = join(DIST, rel === '/' ? 'index.html' : rel)
      if (!existsSync(p)) { res.writeHead(404); return res.end('nf') }
      if (rel === '/' && SEED) {
        // The seed stylesheet rides the page itself, after the bundle's css.
        const html = readFileSync(p, 'utf-8')
          .replace('</head>', '<link rel="stylesheet" href="/__seed.css"></head>')
        res.writeHead(200, { 'Content-Type': 'text/html' })
        return res.end(html)
      }
      res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' })
      res.end(readFileSync(p))
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

/** Scan every visible [data-money] node for the three properties. */
async function scanMoney(page, marker) {
  return page.evaluate((mk) => {
    const out = []
    for (const el of document.querySelectorAll('[data-money]')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue // unmounted or hidden
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none') continue
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim()
      out.push({
        kind: el.dataset.money,
        text,
        ellipsisProp: cs.textOverflow === 'ellipsis',
        dotted: /…|\.\.\./.test(text),
        overflowPx: el.scrollWidth - el.clientWidth,
        offLeft: r.left < -1,
        offRight: r.right > window.innerWidth + 1,
        hasMarker: el.dataset.money !== 'cur' || text.includes(mk),
        tag: `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`,
      })
    }
    return out
  }, marker)
}

function assertScan(nodes, where) {
  const bad = {
    ellipsis: nodes.filter((n) => n.ellipsisProp || n.dotted),
    overflow: nodes.filter((n) => n.overflowPx > 1 || n.offLeft || n.offRight),
    marker: nodes.filter((n) => !n.hasMarker),
  }
  const fmt = (list) => list.slice(0, 3).map((n) => `${n.tag} "${n.text}" +${n.overflowPx}px`).join('; ')
  check(`${where}: no money element carries ellipsis, in property or in paint (${nodes.length} scanned)`,
    bad.ellipsis.length === 0, fmt(bad.ellipsis))
  check(`${where}: no money element overflows or leaves the viewport`,
    bad.overflow.length === 0, fmt(bad.overflow))
  check(`${where}: every currency-bearing element shows its marker`,
    bad.marker.length === 0, fmt(bad.marker))
}

async function run() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('dist/ is absent. Run `npm run build` first.')
    process.exit(2)
  }
  const framesDir = evidenceDir('reports', 'screens', 'r059-money-fit')
  const browser = await chromium.launch()
  try {
    for (const leg of LEGS) {
      const server = await startStub(leg.currency)
      const base = `http://127.0.0.1:${server.address().port}`
      try {
        for (const [sizeName, w, h] of SIZES) {
          const page = await browser.newPage({ viewport: { width: w, height: h } })
          try {
            await page.goto(`${base}/?sessionID=r059&rgs_url=${encodeURIComponent(base)}&lang=en`,
              { waitUntil: 'domcontentloaded' })
            await page.waitForSelector('[data-testid="spin-button"]', { timeout: 30_000 })
            const { dismissIntro } = await import('./lib/dismissOverlays.mjs')
            await dismissIntro(page)
            await page.waitForTimeout(900)

            assertScan(await scanMoney(page, leg.marker), `${leg.name} ${sizeName} HUD`)
            await page.screenshot({ path: join(framesDir, `${leg.name.toLowerCase()}_${sizeName}_hud.png`) })

            // The paytable: mode cards and, at Mobile S, the ways diagram
            // with its leading 1 inside the plate.
            const menu = page.locator('[data-testid="hud-menu"], [data-testid="mini-menu"]').first()
            await menu.click({ timeout: 5_000 }).catch(() => {})
            await page.locator('[data-testid="open-paytable"]').click({ timeout: 5_000 }).catch(() => {})
            await page.waitForTimeout(600)
            assertScan(await scanMoney(page, leg.marker), `${leg.name} ${sizeName} paytable`)
            if (sizeName === 'mobile-s') {
              const ways = await page.evaluate(() => {
                const face = document.querySelector('.fs-ways-diagram')
                const first = face?.querySelector('.fs-way-cell')
                if (!face || !first) return null
                const fr = face.getBoundingClientRect()
                const cr = first.getBoundingClientRect()
                return { faceLeft: fr.left, cellLeft: cr.left, cellRight: cr.right, text: first.textContent?.trim(), vw: window.innerWidth }
              })
              check(`${leg.name} mobile-s: the ways sequence's leading 1 sits whole inside the viewport`,
                !!ways && ways.text === '1' && ways.cellLeft >= Math.max(0, ways.faceLeft) - 1 && ways.cellLeft >= -1,
                ways ? `cell "${ways.text}" left ${Math.round(ways.cellLeft)} against face ${Math.round(ways.faceLeft)} in ${ways.vw}` : 'diagram not found')
              await page.screenshot({ path: join(framesDir, `${leg.name.toLowerCase()}_${sizeName}_ways.png`) })
            }
            await page.keyboard.press('Escape').catch(() => {})
            await page.waitForTimeout(300)

            // The buy dialog: open FEATURES, open the NITRO (worst price)
            // confirm, assert the strip is DOCKED and lands with CONFIRM.
            // EVERY step asserts rather than skipping: a surface the drive
            // could not reach must read as a failure, never as covered (the
            // first run of this gate skipped this whole block silently on a
            // wrong selector, which is the no-silent-caps rule violated by
            // the gate meant to enforce carefulness).
            {
              await page.evaluate(() => (document.querySelector('[data-testid="feature-menu-button"]')) ?.click())
              await page.waitForTimeout(600)
              await page.evaluate(() => (document.querySelector('[data-testid="activate-super"]')) ?.click())
              await page.waitForTimeout(600)
              const strip = page.locator('.buy-stats-row')
              const stripFound = (await strip.count()) > 0
              check(`${leg.name} ${sizeName}: the buy confirm dialog opened for the worst-price tier`,
                stripFound, 'the NITRO confirm did not open; the drive cannot vouch for this surface')
              if (stripFound) {
                  const docked = await strip.evaluate((el) => getComputedStyle(el).position !== 'sticky' && getComputedStyle(el).position !== 'fixed')
                  check(`${leg.name} ${sizeName}: the buy strip is docked in the scroll flow, not floating`,
                    docked, 'computed position is sticky or fixed')
                  await strip.scrollIntoViewIfNeeded().catch(() => {})
                  await page.waitForTimeout(400)
                  assertScan(await scanMoney(page, leg.marker), `${leg.name} ${sizeName} buy dialog`)
                  const maxWinCell = await page.evaluate(() => {
                    const cells = [...document.querySelectorAll('.buy-stat')]
                    const last = cells[cells.length - 1]
                    if (!last) return null
                    const r = last.getBoundingClientRect()
                    return { right: r.right, vw: window.innerWidth, text: (last.textContent || '').replace(/\s+/g, ' ').trim() }
                  })
                  check(`${leg.name} ${sizeName}: the MAX WIN cell is inside the row, never pushed out`,
                    !!maxWinCell && maxWinCell.right <= maxWinCell.vw + 1,
                    maxWinCell ? `right ${Math.round(maxWinCell.right)} in ${maxWinCell.vw} ("${maxWinCell.text}")` : 'cell not found')
                  await page.screenshot({ path: join(framesDir, `${leg.name.toLowerCase()}_${sizeName}_buy.png`) })
              }
              await page.keyboard.press('Escape').catch(() => {})
              await page.keyboard.press('Escape').catch(() => {})
            }
          } finally {
            await page.close()
          }
        }

        // The feature instrument panels, desktop: the owner's dotted plates.
        {
          const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
          try {
            await page.goto(`${base}/?sessionID=r059-feature&rgs_url=${encodeURIComponent(base)}&lang=en`,
              { waitUntil: 'domcontentloaded' })
            await page.waitForSelector('[data-testid="spin-button"]', { timeout: 30_000 })
            const { dismissIntro } = await import('./lib/dismissOverlays.mjs')
            await dismissIntro(page)
            await page.waitForTimeout(500)
            await page.locator('[data-testid="spin-button"]').click({ timeout: 10_000 })
            await page.locator('[data-testid="entry-continue"]').waitFor({ timeout: 30_000 }).catch(() => {})
            await page.evaluate(() => (document.querySelector('[data-testid="entry-continue"]'))?.click()).catch(() => {})
            await page.waitForTimeout(3_000)
            const plates = await page.evaluate((mk) => {
              const out = []
              for (const el of document.querySelectorAll('[data-testid="feature-total-win"] [data-money]')) {
                const r = el.getBoundingClientRect()
                if (r.width === 0) continue
                const cs = getComputedStyle(el)
                out.push({
                  text: (el.textContent || '').trim(),
                  ellipsisProp: cs.textOverflow === 'ellipsis',
                  dotted: /…|\.\.\./.test((el.textContent || '')),
                  overflowPx: el.scrollWidth - el.clientWidth,
                  hasMarker: (el.textContent || '').includes(mk),
                })
              }
              return out
            }, leg.marker)
            check(`${leg.name} feature: the TOTAL panel fits its string whole, marker visible, never dots (${plates.length} mount(s))`,
              plates.length > 0 && plates.every((p) => !p.ellipsisProp && !p.dotted && p.overflowPx <= 1 && p.hasMarker),
              JSON.stringify(plates.slice(0, 2)))
            await page.screenshot({ path: join(framesDir, `${leg.name.toLowerCase()}_desktop_feature.png`) })
          } finally {
            await page.close()
          }
        }
      } finally {
        server.close()
      }
    }
  } finally {
    await browser.close()
  }

  if (failures.length) {
    console.error(`\nMONEY FIT GATE: FAIL (${failures.length} of ${checks})`)
    for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
    process.exit(1)
  }
  console.log(`\nMONEY FIT GATE: PASS (${checks} assertions, both vocabularies, three sizes, the governing rule holds)`)
  process.exit(0)
}

// ── self-test, convention (p): both seeded states must go red, named ─────────
if (SELF_TEST) {
  const runSeed = (seedName, expect) => {
    const r = spawnSync('node', [fileURLToPath(import.meta.url)], {
      cwd: FRONTEND,
      env: { ...process.env, FS_MONEY_SEED: seedName },
      encoding: 'utf-8',
      timeout: 600_000,
    })
    const out = (r.stdout || '') + (r.stderr || '')
    const red = /MONEY FIT GATE: FAIL/.test(out)
    const named = expect.test(out)
    const exited = typeof r.status === 'number' && r.status !== 0
    console.log(`  ${red && named && exited ? 'caught ' : 'MISSED '} SEED ${seedName}${red ? '' : ' (stayed green)'}${named ? '' : ' (wrong assertion)'}${exited ? '' : ' (no exit)'}`)
    return red && named && exited
  }
  const ok1 = runSeed('ellipsis-restored', /FAIL .*no money element carries ellipsis/)
  const ok2 = runSeed('flat-font-restored', /FAIL GC popout-s.*(overflows|carries ellipsis)|FAIL .*popout-s HUD: no money element overflows/)
  if (!ok1 || !ok2) {
    console.error('\nMONEY FIT GATE SELF-TEST: FAIL')
    process.exit(1)
  }
  console.log('\nMONEY FIT GATE SELF-TEST: PASS (the dotted state and the stripped-suffix popout both red, named, non-zero exits)')
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
