// replay_fit_gate.mjs
//
// Published checklist item: "Supports Replays in Popout S view".
//
// WHY THIS GATE EXISTS, and the gap it closes is a gate-shaped one rather than a
// code-shaped one. `layout_fit_gate.mjs` measures the GAME route at seven
// presets and has done for months. The REPLAY route is a different tree:
// App.svelte branches on its replay flag and renders ReplayMode INSTEAD of the
// game, so not one of those seven measurements ever touched it. The result was
// that at Popout S the replay grid laid out at its natural 616px inside a 400px
// viewport, 64.9 per cent visible, and because it is centred the overflow was
// split across BOTH edges: there was no scroll position that showed all five
// reels. That shipped, and nothing could have said so.
//
// THE REPLAY ROUTE NEEDS AN RGS TO RENDER ITS GRID AT ALL, which is why this
// gate carries its own server rather than using lib/previewServer.mjs. The grid
// lives behind `{:else if params && response}`, so a probe that cannot answer
// `/bet/replay/...` never reaches the element it is meant to measure and reports
// a clean run over nothing. A canned round is served here for exactly that
// reason.
//
// WHAT IS ASSERTED, and what is deliberately only REPORTED:
//   - HORIZONTAL fit is the assertion. A reel grid wider than the viewport, and
//     centred, is unrecoverable by scrolling. That is the defect.
//   - The page must not overflow horizontally either, so the fix cannot be
//     "let it scroll".
//   - VERTICAL extent is REPORTED, not failed. The replay route is a document
//     with a disclaimer above the grid and controls below it, and scrolling down
//     a replay page is ordinary. The "must not be scrollable" published item is
//     about the game frame, not this route. Reported so a regression there is
//     visible rather than silent.
//
// Convention (p):
//   node scripts/replay_fit_gate.mjs --self-test
//   node scripts/replay_fit_gate.mjs
//
// Writes nothing. Convention (h.1) holds by construction.

import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import { assertNoSurvivors } from './lib/previewServer.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')

// The same seven presets layout_fit_gate measures, so the two routes are judged
// against one list rather than two that can drift apart.
const PRESETS = [
  { name: 'Desktop',  width: 1200, height: 675 },
  { name: 'Laptop',   width: 1024, height: 576 },
  { name: 'Popout S', width: 400,  height: 225 },
  { name: 'Popout L', width: 800,  height: 450 },
  { name: 'Mobile L', width: 425,  height: 812 },
  { name: 'Mobile M', width: 375,  height: 667 },
  { name: 'Mobile S', width: 320,  height: 568 },
]

const MIME = {
  '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.json': 'application/json',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp3': 'audio/mpeg',
  '.webm': 'video/webm', '.mp4': 'video/mp4', '.ico': 'image/x-icon',
}

/**
 * One real base-mode round, an L3 five-of-a-kind on six ways paying 390
 * centibets. Taken from books_base rather than invented, so the grid this gate
 * measures is a grid the game would really draw.
 */
const CANNED_ROUND = {
  payoutMultiplier: 390,
  costMultiplier: 1.0,
  state: {
    events: [
      { index: 0, type: 'reveal', board: [
        [{ name: 'L3' }, { name: 'H2' }, { name: 'L2' }, { name: 'S' }, { name: 'L3' }, { name: 'H2' }],
        [{ name: 'M1' }, { name: 'W' }, { name: 'H2' }, { name: 'M1' }, { name: 'S' }, { name: 'W' }],
        [{ name: 'L3' }, { name: 'L1' }, { name: 'M2' }, { name: 'S' }, { name: 'M3' }, { name: 'L1' }],
        [{ name: 'M3' }, { name: 'L2' }, { name: 'L3' }, { name: 'W' }, { name: 'L3' }, { name: 'M3' }],
        [{ name: 'L3' }, { name: 'L1' }, { name: 'L1' }, { name: 'S' }, { name: 'L2' }, { name: 'M3' }],
      ] },
      { index: 1, type: 'winInfo', totalWin: 390, wins: [{
        symbol: 'L3', kind: 5, win: 390,
        positions: [{ reel: 0, row: 1 }],
        meta: { ways: 6, globalMult: 1, winWithoutMult: 390, symbolMult: 0 },
      }] },
      { index: 2, type: 'setWin', amount: 390 },
      { index: 3, type: 'setTotalWin', amount: 390 },
      { index: 4, type: 'finalWin', amount: 390 },
    ],
  },
}

let failures = 0
const ok = (n) => console.log(`  ok    ${n}`)
const bad = (n, d) => { failures++; console.error(`  FAIL  ${n}${d ? '\n        ' + d : ''}`) }

function startServer() {
  const sockets = new Set()
  const server = createServer((req, res) => {
    const path = req.url.split('?')[0]
    if (path.includes('/bet/replay/')) {
      res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' })
      res.end(JSON.stringify(CANNED_ROUND))
      return
    }
    let file
    try { file = join(DIST, decodeURIComponent(path)) } catch { res.writeHead(400).end(); return }
    if (!existsSync(file) || file.endsWith('/')) file = join(DIST, 'index.html')
    try {
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
      res.end(readFileSync(file))
    } catch { res.writeHead(404).end() }
  })
  server.on('connection', (s) => { sockets.add(s); s.on('close', () => sockets.delete(s)) })
  return {
    server,
    listen: () => new Promise((r) => server.listen(0, () => r(server.address().port))),
    close: () => { for (const s of sockets) s.destroy(); server.close() },
  }
}

/**
 * Measure the replay grid at one preset.
 *
 * `seedUnscaled` plants the ACTUAL defect this gate exists to catch: the grid
 * rendered at its natural size with no fit factor, which is precisely what
 * shipped. It is injected as a stylesheet rather than by editing the source, so
 * the self-test never has to modify the tree it is measuring.
 */
async function measure(browser, origin, preset, seedUnscaled = false) {
  const page = await browser.newPage({ viewport: { width: preset.width, height: preset.height } })
  try {
    if (seedUnscaled) {
      await page.addInitScript(() => {
        document.addEventListener('DOMContentLoaded', () => {
          const s = document.createElement('style')
          s.textContent = '.grid-area{transform:none !important;margin-left:0 !important;'
            + 'margin-right:0 !important;margin-bottom:0 !important;}'
          document.head.appendChild(s)
        })
      })
    }
    const url = `${origin}/?replay=true&game=future_spinner&version=10&mode=base`
      + `&event=1&rgs_url=${origin}&currency=USD&amount=1000000`
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.grid-area', { timeout: 30000 })
    await page.waitForTimeout(1200)
    return await page.evaluate(() => {
      const el = document.querySelector('.grid-area')
      const r = el.getBoundingClientRect()
      const vw = window.innerWidth
      const visibleW = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0))
      return {
        left: +r.left.toFixed(1), right: +r.right.toFixed(1),
        width: +r.width.toFixed(1), height: +r.height.toFixed(1),
        vw, vh: window.innerHeight,
        visiblePct: r.width > 0 ? +((visibleW / r.width) * 100).toFixed(1) : 0,
        docScrollW: document.documentElement.scrollWidth,
        docScrollH: document.documentElement.scrollHeight,
        transform: getComputedStyle(el).transform,
        ...(() => {
          // "Supports Replays" has to mean the player can START one. The control
          // is allowed to be below the fold on a short viewport, because this
          // route is a document with a disclaimer above and controls below and
          // scrolling it is ordinary. It is NOT allowed to be absent, zero-sized,
          // or outside the scrollable area, which would make the replay
          // unstartable rather than merely low.
          const btn = [...document.querySelectorAll('button')]
            .find((b) => /replay/i.test(b.textContent || ''))
          if (!btn) return { btnFound: false }
          const b2 = btn.getBoundingClientRect()
          return {
            btnFound: true,
            btnVisibleNow: b2.top >= 0 && b2.bottom <= window.innerHeight,
            btnReachable: b2.width > 0 && b2.height > 0
              && b2.bottom <= document.documentElement.scrollHeight
              && b2.right <= document.documentElement.scrollWidth,
          }
        })(),
      }
    })
  } finally {
    await page.close()
  }
}

async function run({ selfTest = false } = {}) {
  if (!existsSync(DIST)) {
    console.error('REPLAY FIT GATE: dist is absent. Run `npm run build` first.')
    process.exit(1)
  }
  const srv = startServer()
  const port = await srv.listen()
  const origin = `http://127.0.0.1:${port}`
  const browser = await chromium.launch()

  try {
    if (selfTest) {
      console.log('REPLAY FIT GATE SELF-TEST: the grid rendered unscaled must be caught')
      const small = PRESETS.find((p) => p.name === 'Popout S')

      const seeded = await measure(browser, origin, small, true)
      const caughtSmall = seeded.visiblePct < 99.5
      console.log(`  ${caughtSmall ? 'caught ' : 'MISSED '} seeded: the replay grid at its natural `
        + `616px inside a ${small.width}px viewport (${seeded.visiblePct}% visible, `
        + `left ${seeded.left}, right ${seeded.right})`)
      if (!caughtSmall) failures++

      const seededOverflow = seeded.docScrollW > seeded.vw
      console.log(`  ${seededOverflow ? 'caught ' : 'MISSED '} seeded: and the page overflows `
        + `horizontally with it (scrollWidth ${seeded.docScrollW} against viewport ${seeded.vw})`)
      if (!seededOverflow) failures++

      // NEGATIVE CONTROLS. The real build must survive at the tightest preset,
      // and a wide preset must not be scaled at all: a gate that "fixed" the
      // small case by shrinking everything everywhere would pass its seeded
      // test and ruin the desktop view.
      const real = await measure(browser, origin, small, false)
      const realOk = real.visiblePct >= 99.5 && real.docScrollW <= real.vw
      console.log(`  ${realOk ? 'clean  ' : 'MISSED '} seeded: NEGATIVE CONTROL, the real build at `
        + `Popout S (${real.visiblePct}% visible, scrollWidth ${real.docScrollW})`)
      if (!realOk) failures++

      const desktop = await measure(browser, origin, PRESETS[0], false)
      const unscaled = desktop.transform === 'none' || desktop.transform === 'matrix(1, 0, 0, 1, 0, 0)'
      console.log(`  ${unscaled ? 'clean  ' : 'MISSED '} seeded: NEGATIVE CONTROL, Desktop is not `
        + `scaled down (transform ${desktop.transform})`)
      if (!unscaled) failures++

      console.log(failures === 0
        ? '\nREPLAY FIT GATE SELF-TEST: PASS (2 seeded, 2 negative controls)'
        : `\nREPLAY FIT GATE SELF-TEST: FAIL (${failures})`)
      return
    }

    console.log(`REPLAY FIT GATE: the replay grid at ${PRESETS.length} presets`)
    for (const preset of PRESETS) {
      const m = await measure(browser, origin, preset, false)
      const label = `${preset.name} (${preset.width}x${preset.height})`
      if (m.visiblePct < 99.5) {
        bad(`${label}: the whole reel grid is on screen`,
          `${m.visiblePct}% visible. left ${m.left}, right ${m.right}, width ${m.width}, `
          + `viewport ${m.vw}. Centred overflow cannot be recovered by scrolling.`)
      } else if (m.docScrollW > m.vw) {
        bad(`${label}: the page does not overflow horizontally`,
          `scrollWidth ${m.docScrollW} against viewport ${m.vw}`)
      } else if (!m.btnFound) {
        bad(`${label}: the replay can actually be started`,
          'no control matching /replay/i was rendered at all')
      } else if (!m.btnReachable) {
        bad(`${label}: the replay control is reachable`,
          'the START control is zero-sized or outside the scrollable area, so the replay '
          + 'cannot be started at this size')
      } else {
        const vNote = m.height > m.vh ? `, ${(m.height - m.vh).toFixed(0)}px taller than the viewport` : ''
        const bNote = m.btnVisibleNow ? '' : ', start control below the fold but reachable'
        ok(`${label}: whole grid on screen, no horizontal overflow, replay startable`
          + ` (grid ${m.width}x${m.height}${vNote}${bNote})`)
      }
    }
  } finally {
    await browser.close()
    srv.close()
  }

  if (failures) {
    console.error(`\nREPLAY FIT GATE: FAIL (${failures})`)
    process.exit(1)
  }
  console.log(`\nREPLAY FIT GATE: PASS (whole reel grid visible at all ${PRESETS.length} presets, `
    + 'no horizontal overflow)')
}

await run({ selfTest: process.argv.includes('--self-test') })
assertNoSurvivors('replay fit gate')
process.exit(failures === 0 ? 0 : 1)
