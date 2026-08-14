// direction_parity_gate.mjs: the game stage renders IDENTICAL GEOMETRY whether
// the document's direction is ltr or rtl.
//
// Built 2026-08-14 from FABLE BRIEF R068 (the RTL geometry leak), alongside the
// fix it exists to hold: `.game-stage` and `.replay-container` pin
// `direction: ltr` at the stage roots.
//
// WHY THIS EXISTS
// ---------------
// The owner's language sweep found Arabic, and only Arabic, shifting the board
// cells left out of the painted frame. The mechanism, derived first (l.1) and
// then measured: App.svelte's accessibility pass (2026-08-09) reactively sets
// `document.documentElement.dir = 'rtl'` for the ar locale, and TWO boxes in
// the stage were direction-sensitive:
//
//   - `.grid-scale`, a 616px-wide STATIC block inside the 522px-wide
//     `.grid-slot`, corrected by a scale transform whose top-left origin is
//     PHYSICAL. In ltr the 94px surplus overflows right and the scale pulls it
//     back; in rtl the box re-anchors to the inline-start edge, which is the
//     RIGHT edge, so the whole grid drifts 94px LEFT out of the frame
//     (measured: en x=379, ar x=285, DX exactly -94 at 1280x720) while the
//     absolutely-positioned frame (physical `left: 320px`) stays put.
//   - `.symbol-grid`, a flex row, reverses reel order (col 0 and col 4 swap).
//
// The brief's premise ("zero dir or rtl references in src", a host-document
// leak) was recounted per rule 16 and corrected: the flip is OUR OWN line,
// App.svelte:233, and no host is needed to reproduce. The pin keeps that line
// (screen readers and the platform host read the document attributes) while
// making stage GEOMETRY host- and locale-invariant. Arabic text keeps native
// shaping: shaping belongs to the script, not the container's direction, and
// the ar HUD plates were held pixel-identical across the pin (the one differing
// plate, BET, differed by the identical 27/20184 channels between two runs of
// the SAME build: the recorded autofit capture-flake class, not direction).
//
// THE CHECKS
// ----------
//   A  LIVE PARITY      every stage surface rect with the document FLIPPED TO
//                       RTL equals its ltr twin (0.5px tolerance) at desktop,
//                       mobile-s, popout-s: frame, grid tree, all five reel
//                       columns (order included, which catches the flex
//                       reversal), jets holder, HUD plates, win display after
//                       a settled win, buy dialog.
//                       THE TWIN IS THE SAME LOADED PAGE, dir flipped in
//                       place, exactly the brief's "the harness with the host
//                       flipped to rtl". The first draft compared lang=ar to
//                       lang=en and failed on the replay leg for a reason
//                       worth keeping: ar's longer disclaimer wraps
//                       differently, which changes the R056 measured column
//                       fit, so an ar-vs-en comparison measures LOCALE TEXT
//                       LENGTH as well as direction. Same content, direction
//                       flipped, isolates the one variable this gate owns.
//   B  REPLAY PARITY    the replay view's board and column rects, same
//                       flip-in-place twin, same sizes
//   C  DOCUMENT INTACT  a real lang=ar load still sets documentElement
//                       lang=ar and dir=rtl (the accessibility pass must
//                       survive the fix), the stage roots compute direction
//                       ltr, and the ar frames are captured for the owner
//
// SELF-TEST (convention (p)): --self-test LIFTS THE PIN, exactly the shipped
// defect. Seed 'pin-lifted-stage' forces the stage roots back to
// direction: inherit, and the gate must go RED reproducing the owner's exact
// drift: .grid-scale DX -94 (at the design scale) and reel order reversed.
// Seed 'pin-lifted-replay' lifts only the replay root and the replay leg must
// catch it. A green gate that cannot reproduce the owner's screenshot is a
// script that prints PASS.
//
// Run (from frontend/):
//   node scripts/direction_parity_gate.mjs
//   node scripts/direction_parity_gate.mjs --self-test
//   FS_WRITE_EVIDENCE=1 node scripts/direction_parity_gate.mjs   # commit-run frames
//
// Frames: reports/screens/r068-direction-parity/ (scratch unless evidence mode,
// per (h.1)).

import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import { evidenceDir } from './lib/evidencePaths.mjs'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FRONTEND = join(__dirname, '..')
const DIST = join(FRONTEND, 'dist')

const SELF_TEST = process.argv.includes('--self-test')
// Read at REQUEST TIME, never captured at module scope: the self-test sets
// FS_SEED per seed run inside this same process, and a module-scope copy is
// a seed that can never fire (this gate's own first self-test run proved it:
// zero parity failures under a lifted pin, caught by the expect-red check).
const seedNow = () => process.env.FS_SEED || ''

const FIXTURES = JSON.parse(readFileSync(
  join(FRONTEND, 'src', 'lib', 'services', '__fixtures__', 'replay_rounds.json'), 'utf8'))
const WIN_ROUND = FIXTURES.base.win
// The replay endpoint's envelope: payoutMultiplier is a PLAIN multiplier and
// the events ride under state.events (the real captured shape, R053/R056).
const REPLAY_ENVELOPE = {
  payoutMultiplier: WIN_ROUND.payoutMultiplier / 100,
  costMultiplier: 1.0,
  state: { events: WIN_ROUND.events },
  currency: 'USD',
  amount: 1_000_000,
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.webp': 'image/webp',
}

// The brief's three sizes, by the estate's established names (money_fit_gate
// SIZES_ALL), selected BY NAME per the R061 seed-matrix lesson.
const SIZES = [
  ['desktop', 1280, 720],
  ['mobile-s', 320, 568],
  ['popout-s', 400, 225],
]

// Every live-stage surface with a stable selector at page settle. The five
// reel columns are asserted INDIVIDUALLY so a pure order reversal (identical
// union box) cannot pass.
const LIVE_SURFACES = [
  '.game-frame', '.grid-slot', '.grid-scale', '.grid-container', '.symbol-grid',
  '.jets-holder',
]
const REPLAY_SURFACES = ['.replay-container', '.replay-column', '.grid-container', '.symbol-grid']

// The two seeds: direction: inherit is EXACTLY the pre-fix state (the pin
// lifted, the document's rtl flowing back in), not a synthetic rtl force.
const SEED_CSS = {
  'pin-lifted-stage': '.game-stage{direction:inherit !important}',
  'pin-lifted-replay': '.replay-container{direction:inherit !important}',
}

const failures = []
let pass = 0
function check(name, cond, detail) {
  if (cond) { pass++; return true }
  failures.push({ name, detail })
  return false
}

function startStub() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      if (req.method === 'POST') {
        let b = ''
        req.on('data', (c) => { b += c })
        req.on('end', () => {
          const json = (o) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)) }
          if (req.url === '/wallet/authenticate') {
            return json({
              balance: { amount: 1_000_000_000, currency: 'USD' },
              config: { minBet: 100_000, maxBet: 1_000_000, stepBet: 100_000, betLevels: [1_000_000], defaultBetLevel: 1_000_000 },
              round: null,
            })
          }
          if (req.url === '/wallet/play') {
            return json({
              balance: { amount: 999_000_000, currency: 'USD' },
              round: {
                betID: 6801, active: true, mode: 'base', amount: 1_000_000,
                payout: Math.round(WIN_ROUND.payoutMultiplier * 1_000_000 / 100),
                payoutMultiplier: WIN_ROUND.payoutMultiplier,
                state: { events: WIN_ROUND.events },
              },
            })
          }
          if (req.url === '/wallet/end-round') return json({ balance: { amount: 1_000_000_000, currency: 'USD' } })
          if (req.url?.startsWith('/bet/replay')) {
            return json(REPLAY_ENVELOPE)
          }
          res.writeHead(404); res.end('{}')
        })
        return
      }
      const rel = (req.url || '/').split('?')[0]
      if (rel.includes('/bet/replay')) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'access-control-allow-origin': '*' })
        return res.end(JSON.stringify(REPLAY_ENVELOPE))
      }
      if (rel === '/__seed.css') {
        res.writeHead(200, { 'Content-Type': 'text/css' })
        return res.end(SEED_CSS[seedNow()] || '')
      }
      const p = join(DIST, rel === '/' ? 'index.html' : rel)
      if (!existsSync(p)) { res.writeHead(404); return res.end('nf') }
      if (rel === '/' && seedNow()) {
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

function rect(r) {
  return r ? { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) } : null
}

async function readSurfaces(page, selectors) {
  return page.evaluate((sels) => {
    const take = (el) => {
      const { x, y, width, height } = el.getBoundingClientRect()
      return { x: +x.toFixed(1), y: +y.toFixed(1), w: +width.toFixed(1), h: +height.toFixed(1) }
    }
    const out = { dir: document.documentElement.dir, lang: document.documentElement.lang, rects: {} }
    for (const s of sels) {
      const el = document.querySelector(s)
      out.rects[s] = el ? take(el) : null
    }
    document.querySelectorAll('.symbol-col').forEach((el, i) => { out.rects[`.symbol-col[${i}]`] = take(el) })
    const stage = document.querySelector('.game-stage') || document.querySelector('.replay-container')
    out.stageDirection = stage ? getComputedStyle(stage).direction : null
    return out
  }, selectors)
}

function compareTwins(sizeName, legName, en, ar) {
  const keys = new Set([...Object.keys(en.rects), ...Object.keys(ar.rects)])
  for (const k of keys) {
    const a = en.rects[k], b = ar.rects[k]
    if (!a && !b) continue
    if (!check(`${legName} ${sizeName} ${k}: present in both directions`, !!a && !!b, `en=${!!a} ar=${!!b}`)) continue
    const dx = Math.abs(a.x - b.x), dy = Math.abs(a.y - b.y)
    const dw = Math.abs(a.w - b.w), dh = Math.abs(a.h - b.h)
    check(`${legName} ${sizeName} ${k}: rect parity`,
      dx <= 0.5 && dy <= 0.5 && dw <= 0.5 && dh <= 0.5,
      `en=${JSON.stringify(a)} ar=${JSON.stringify(b)} (dx=${(b.x - a.x).toFixed(1)})`)
  }
}

async function settle(page) {
  // The boot scrims (hero splash, then the feature intro) intercept every
  // pointer event until dismissed; the house helper handles the sequence.
  await page.waitForSelector('.grid-container', { timeout: 30000 })
  await dismissIntro(page)
  await page.waitForTimeout(1000)
}

async function settleReplay(page) {
  // The replay view renders its board only after START REPLAY.
  await page.waitForSelector('.replay-container', { timeout: 30000 })
  await page.locator('.start-replay').click({ timeout: 10000 })
  await page.waitForSelector('.grid-container', { timeout: 30000 })
  await page.waitForTimeout(1500)
}

const framesDir = evidenceDir('reports', 'screens', 'r068-direction-parity')
mkdirSync(framesDir, { recursive: true })

if (!existsSync(DIST)) {
  console.error('dist/ is absent. Run `npm run build` first.')
  process.exit(1)
}

const flipDir = async (page, dir) => {
  await page.evaluate((d) => { document.documentElement.dir = d }, dir)
  await page.waitForTimeout(400)
}

// Measure the same loaded page both ways: ltr as loaded, then the document
// flipped to rtl in place (the app sets dir once per locale change, so a
// manual set holds until the next locale flip, which never comes here).
const measureBothDirections = async (page, selectors) => {
  await flipDir(page, 'ltr')
  const ltr = await readSurfaces(page, selectors)
  await flipDir(page, 'rtl')
  const rtl = await readSurfaces(page, selectors)
  await flipDir(page, 'ltr')
  return { ltr, rtl }
}

const openBuyDialog = async (page) => {
  const menuButton = page.locator('[data-testid="feature-menu-button"], .feature-menu-button').first()
  const opened = await menuButton.click({ timeout: 5000 }).then(() => true).catch(() => false)
  if (!opened) return false
  await page.waitForTimeout(800)
  return true
}

const DIALOG_SEL = '.feature-menu, [data-testid="feature-menu"], .fm-panel'
const readDialogRect = (page) => page.evaluate((sel) => {
  const el = document.querySelector(sel)
  if (!el) return null
  const { x, y, width, height } = el.getBoundingClientRect()
  return { x: +x.toFixed(1), y: +y.toFixed(1), w: +width.toFixed(1), h: +height.toFixed(1) }
}, DIALOG_SEL)

const REPLAY_Q = (base) => `replay=true&game=future_spinner&version=10&mode=base&event=1&rgs_url=${encodeURIComponent(base)}`

const runSeed = async (seedName, expectRed) => {
  process.env.FS_SEED = seedName
  const seedFailures = []
  const server = await startStub()
  const base = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    if (seedName === 'pin-lifted-replay') {
      await page.goto(`${base}/?${REPLAY_Q(base)}&lang=en`, { waitUntil: 'networkidle' })
      await settleReplay(page)
      const { ltr, rtl } = await measureBothDirections(page, REPLAY_SURFACES)
      const mark = failures.length
      compareTwins('desktop', 'seed-replay', ltr, rtl)
      seedFailures.push(...failures.splice(mark))
    } else {
      await page.goto(`${base}/?sessionID=r068&rgs_url=${encodeURIComponent(base)}&lang=en`, { waitUntil: 'networkidle' })
      await settle(page)
      const { ltr, rtl } = await measureBothDirections(page, LIVE_SURFACES)
      const mark = failures.length
      compareTwins('desktop', 'seed-stage', ltr, rtl)
      seedFailures.push(...failures.splice(mark))
      if (expectRed) {
        // The owner's exact drift: .grid-scale 94px left at the 1280x720
        // design scale, and the reel order reversed.
        const drift = rtl.rects['.grid-scale'] && ltr.rects['.grid-scale']
          ? +(rtl.rects['.grid-scale'].x - ltr.rects['.grid-scale'].x).toFixed(1) : NaN
        check(`seed ${seedName}: reproduces the owner's exact -94px grid drift`, drift === -94, `measured DX=${drift}`)
        const col0Moved = rtl.rects['.symbol-col[0]'] && ltr.rects['.symbol-col[0]']
          && Math.abs(rtl.rects['.symbol-col[0]'].x - ltr.rects['.symbol-col[0]'].x) > 100
        check(`seed ${seedName}: reproduces the reel-order reversal`, !!col0Moved,
          JSON.stringify({ ltr: ltr.rects['.symbol-col[0]'], rtl: rtl.rects['.symbol-col[0]'] }))
      }
    }
  } finally {
    await browser.close()
    server.close()
    delete process.env.FS_SEED
  }
  check(`seed ${seedName || 'negative-control'}: gate logic goes ${expectRed ? 'RED' : 'GREEN'} under the seed`,
    expectRed ? seedFailures.length > 0 : seedFailures.length === 0,
    `${seedFailures.length} parity failures under seed: ${seedFailures.slice(0, 3).map((f) => f.name).join('; ')}`)
}

if (SELF_TEST) {
  // (p): lift the pin, demand the owner's screenshot back.
  await runSeed('pin-lifted-stage', true)
  await runSeed('pin-lifted-replay', true)
  // Negative control: an empty seed name must stay green, so a seed that
  // could never fire is caught.
  await runSeed('', false)
  if (failures.length) {
    console.error(`direction parity SELF-TEST failures (${failures.length}):`)
    for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
    process.exit(1)
  }
  console.log(`direction parity gate self-test: ${pass} checks passed, the lifted pin reproduced the owner's drift red on both roots, negative control green.`)
  process.exit(0)
}

const server = await startStub()
const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch()

try {
  for (const [sizeName, w, h] of SIZES) {
    const page = await browser.newPage({ viewport: { width: w, height: h } })

    // ── A: live stage, one page, both directions ───────────────────────────
    await page.goto(`${base}/?sessionID=r068&rgs_url=${encodeURIComponent(base)}&lang=en`, { waitUntil: 'networkidle' })
    await settle(page)
    // One settled win so the win display and its chips exist on both twins.
    await page.keyboard.press(' ')
    await page.waitForTimeout(4500)
    const live = await measureBothDirections(page, [...LIVE_SURFACES, '.c-stat--balance', '.c-stat--win', '.c-stat--bet'])
    compareTwins(sizeName, 'live', live.ltr, live.rtl)

    // ── A continued: the buy dialog, open once, both directions ────────────
    await page.goto(`${base}/?sessionID=r068&rgs_url=${encodeURIComponent(base)}&lang=en`, { waitUntil: 'networkidle' })
    await settle(page)
    const opened = await openBuyDialog(page)
    check(`buy ${sizeName}: feature menu reachable`, opened, 'menu button click failed')
    if (opened) {
      await flipDir(page, 'ltr')
      const dLtr = await readDialogRect(page)
      await flipDir(page, 'rtl')
      const dRtl = await readDialogRect(page)
      await flipDir(page, 'ltr')
      if (dLtr && dRtl) {
        check(`buy ${sizeName}: dialog rect parity`,
          Math.abs(dLtr.x - dRtl.x) <= 0.5 && Math.abs(dLtr.y - dRtl.y) <= 0.5
          && Math.abs(dLtr.w - dRtl.w) <= 0.5 && Math.abs(dLtr.h - dRtl.h) <= 0.5,
          `ltr=${JSON.stringify(dLtr)} rtl=${JSON.stringify(dRtl)}`)
      } else {
        check(`buy ${sizeName}: dialog measured both directions`, false, `ltr=${!!dLtr} rtl=${!!dRtl}`)
      }
    }

    // ── B: replay view, one page, both directions ──────────────────────────
    await page.goto(`${base}/?${REPLAY_Q(base)}&lang=en`, { waitUntil: 'networkidle' })
    await settleReplay(page)
    const replay = await measureBothDirections(page, REPLAY_SURFACES)
    check(`replay ${sizeName}: replay root computes direction ltr`,
      replay.rtl.stageDirection === 'ltr', String(replay.rtl.stageDirection))
    compareTwins(sizeName, 'replay', replay.ltr, replay.rtl)

    // ── C: the real ar load keeps the accessibility attributes, the stage
    //       pins, and the owner's frames are captured ──────────────────────
    await page.goto(`${base}/?sessionID=r068&rgs_url=${encodeURIComponent(base)}&lang=ar`, { waitUntil: 'networkidle' })
    await settle(page)
    const arLive = await readSurfaces(page, LIVE_SURFACES)
    check(`ar ${sizeName}: document keeps dir=rtl and lang=ar (the accessibility pass survives)`,
      arLive.dir === 'rtl' && arLive.lang === 'ar', JSON.stringify({ dir: arLive.dir, lang: arLive.lang }))
    check(`ar ${sizeName}: stage root computes direction ltr under the rtl document`,
      arLive.stageDirection === 'ltr', String(arLive.stageDirection))
    check(`ar ${sizeName}: the board sits where the ltr twin puts it`,
      arLive.rects['.grid-scale'] && live.ltr.rects['.grid-scale']
        && Math.abs(arLive.rects['.grid-scale'].x - live.ltr.rects['.grid-scale'].x) <= 0.5,
      JSON.stringify({ ar: arLive.rects['.grid-scale'], ltr: live.ltr.rects['.grid-scale'] }))
    await page.screenshot({ path: join(framesDir, `live_ar_${sizeName}.png`) })
    await page.goto(`${base}/?${REPLAY_Q(base)}&lang=ar`, { waitUntil: 'networkidle' })
    await settleReplay(page)
    await page.screenshot({ path: join(framesDir, `replay_ar_${sizeName}.png`) })

    await page.close()
  }
} finally {
  await browser.close()
  server.close()
}

if (failures.length) {
  console.error(`DIRECTION PARITY GATE failures (${failures.length}):`)
  for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
  process.exit(1)
}
console.log(`direction parity gate PASS: ${pass} assertions, the stage geometry is direction-invariant at ${SIZES.map((s) => s[0]).join(', ')} (live, buy dialog, replay, flip-in-place twins), the ar document keeps lang and dir and its board matches the ltr twin.`)
