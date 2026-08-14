// r062_retrigger_proof.mjs - FABLE BRIEF R062 TASK 2 (2026-08-14).
//
// THE MOMENT UNDER PROOF (owner art direction): on the SETTLED retrigger
// event, the sequencer pauses, the grid dims, the award text renders CENTRED
// over the grid in the entry pod's award treatment, and after a FIXED total
// duration the sequencer resumes. The old side notice, which hid outside the
// frame on small screens, is gone. Integrity guardrails from the brief, each
// carried by an assertion here:
//
//   A  fires only on the settled retrigger event: EXACTLY ONE appearance in
//      the retrigger fixture (base.feature, updateFreeSpin 16 -> 21), ZERO
//      in the non-retrigger fixture (bonus.feature)
//   B  fixed total duration every occurrence: the visible window measures
//      about 1.6s at every size, and desktop against Mobile S differ by no
//      more than the sampling error (the constant is deliberately not
//      speed-scaled)
//   C  sequencer resumes: the replay reaches REPLAY AGAIN after the moment
//   D  the banner sits WHOLE inside the grid box at Desktop, Mobile S and
//      Popout S (the R061 visual-bounds eye), and the grid carries the dim
//      while the banner shows
//   E  reduced motion: the banner still appears for the same duration with
//      no entrance animation (computed animation-name none)
//   F  ordinary spins untouched: mid-feature board shots of the
//      non-retrigger fixture compare against the pre-R062 reference pack
//      (scratch capture, compared by the session; the committed frames are
//      the moment's own three sizes)
//
// SEEDED NEGATIVE, convention (p), at the observation boundary (declared):
// --self-test re-serves the page with a stylesheet restoring the OLD
// off-frame side position on the moment wrapper, and assertion D must go
// red, named, with a real non-zero exit (TR-123 contract).
//
// RUNNER (TR-123): node, from frontend/. Exit 0 on PASS, non-zero on FAIL,
// terminates; in-process server, closed before exit.
//   node scripts/r062_retrigger_proof.mjs
//   node scripts/r062_retrigger_proof.mjs --self-test

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
const SEED = process.env.FS_R062_SEED === '1'

const FIX = JSON.parse(readFileSync(
  join(FRONTEND, 'src', 'lib', 'services', '__fixtures__', 'replay_rounds.json'), 'utf8'))
const RETRIGGER_ROUND = FIX.base.feature      // one +5 retrigger, 16 -> 21
const PLAIN_ROUND = FIX.bonus.feature         // no retrigger

const SEED_CSS = '[data-testid="retrigger-moment-wrap"]{inset:auto !important;left:100% !important;top:40% !important;width:auto !important;justify-content:flex-start !important}'

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.webp': 'image/webp',
}

const failures = []
const check = (name, cond, detail) => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond ? '' : `  (${detail})`}`)
  if (!cond) failures.push({ name, detail })
}

function statics() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const rel = (req.url || '/').split('?')[0]
      if (rel === '/__seed.css') {
        res.writeHead(200, { 'Content-Type': 'text/css' })
        return res.end(SEED ? SEED_CSS : '')
      }
      const p = join(DIST, rel === '/' ? 'index.html' : rel)
      if (!existsSync(p)) { res.writeHead(404); return res.end('nf') }
      if (rel === '/' && SEED) {
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

/**
 * Drive one feature replay and observe the moment. Returns appearance count,
 * the measured visible window, mid-visibility geometry, and whether the
 * replay settled to REPLAY AGAIN.
 */
async function driveFeature(browser, base, { round, viewport, reducedMotion = false, frame = null }) {
  const ctx = await browser.newContext({
    viewport,
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  })
  const page = await ctx.newPage()
  try {
    await page.route(/\/bet\/replay\//, (route) => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        payoutMultiplier: round.payoutMultiplier / 100,
        costMultiplier: 1.0,
        state: { events: round.events },
      }),
    }))
    const qs = 'replay=true&game=g&version=1&mode=base&event=1&rgs_url=rgs.stake-engine.com'
      + '&currency=USD&amount=1000000&lang=en&device=desktop&social=false'
    await page.goto(`${base}/?${qs}`, { waitUntil: 'domcontentloaded' })
    await page.locator('.start-replay').click({ timeout: 15_000 })
    await page.locator('[data-testid="entry-continue"]').waitFor({ timeout: 30_000 }).catch(() => {})
    await page.evaluate(() => document.querySelector('[data-testid="entry-continue"]')?.click()).catch(() => {})

    const obs = {
      appearances: 0, firstSeen: 0, lastSeen: 0, visibleMs: 0,
      geom: null, settled: false, frameShot: false,
    }
    let visible = false
    const t0 = Date.now()
    while (Date.now() - t0 < 120_000) {
      const s = await page.evaluate(() => {
        const el = document.querySelector('[data-testid="retrigger-moment"]')
        const board = document.querySelector('.fs-board')
        const again = document.querySelector('.play-again')
        if (!el || !board) return { present: false, settled: !!again }
        const r = el.getBoundingClientRect()
        const b = board.getBoundingClientRect()
        return {
          present: true, settled: false,
          rect: { l: r.left, r: r.right, t: r.top, b: r.bottom },
          board: { l: b.left, r: b.right, t: b.top, b: b.bottom },
          dimmed: board.classList.contains('fs-moment-dim'),
          anim: getComputedStyle(el).animationName,
          text: (el.textContent || '').trim(),
        }
      }).catch(() => ({ present: false, settled: false }))
      const now = Date.now()
      if (s.present && !visible) { visible = true; obs.appearances += 1; obs.firstSeen = now }
      if (s.present) {
        obs.lastSeen = now
        if (!obs.geom && now - obs.firstSeen > 400) {
          obs.geom = s
          if (frame && !obs.frameShot) { obs.frameShot = true; await page.screenshot({ path: frame }).catch(() => {}) }
        }
      }
      if (!s.present && visible) visible = false
      if (s.settled) { obs.settled = true; break }
      await page.waitForTimeout(100)
    }
    obs.visibleMs = obs.lastSeen - obs.firstSeen
    return obs
  } finally {
    await page.close()
    await ctx.close()
  }
}

const inBoard = (g) => !!g && g.rect.l >= g.board.l - 1 && g.rect.r <= g.board.r + 1
  && g.rect.t >= g.board.t - 1 && g.rect.b <= g.board.b + 1

async function run() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('dist/ is absent. Run `npm run build` first.')
    process.exit(2)
  }
  const framesDir = evidenceDir('reports', 'screens', 'r062-retrigger')
  const srv = await statics()
  const base = `http://127.0.0.1:${srv.address().port}`
  const browser = await chromium.launch()
  const durations = []
  try {
    for (const [name, w, h] of [['desktop', 1280, 720], ['mobile-s', 320, 568], ['popout-s', 400, 225]]) {
      const o = await driveFeature(browser, base, {
        round: RETRIGGER_ROUND, viewport: { width: w, height: h },
        frame: join(framesDir, `moment_${name}.png`),
      })
      check(`${name}: the moment fires EXACTLY ONCE on the settled retrigger event`,
        o.appearances === 1, `appearances ${o.appearances}`)
      check(`${name}: fixed duration about 1.6s (measured ${o.visibleMs}ms)`,
        o.visibleMs >= 1300 && o.visibleMs <= 1950, `${o.visibleMs}ms outside [1300, 1950]`)
      check(`${name}: the banner sits WHOLE inside the grid box, grid dimmed beneath it`,
        inBoard(o.geom) && !!o.geom && o.geom.dimmed === true,
        o.geom ? `rect ${JSON.stringify(o.geom.rect)} vs board ${JSON.stringify(o.geom.board)} dimmed ${o.geom.dimmed}` : 'no mid-visibility geometry captured')
      check(`${name}: the sequencer resumes and the replay settles`,
        o.settled === true, 'REPLAY AGAIN never appeared')
      durations.push(o.visibleMs)
      if (SEED) {
        // The seeded invocation proves D red at desktop and STOPS, but it
        // carries its verdict with it: the first draft returned before the
        // failure check and a red run exited 0, the exact r042b class
        // (a seed crashing or exiting PAST its verdict teaches nothing).
        if (failures.length) {
          console.error(`\nR062 RETRIGGER PROOF: FAIL (${failures.length})`)
          for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
          await browser.close(); srv.close()
          process.exit(1)
        }
        console.log('\nR062 RETRIGGER PROOF: PASS (seeded scope)')
        await browser.close(); srv.close()
        process.exit(0)
      }
    }
    check('the duration is the same constant at every size (max spread within sampling error)',
      Math.max(...durations) - Math.min(...durations) <= 350,
      `durations ${durations.join('/')}ms`)

    const neg = await driveFeature(browser, base, { round: PLAIN_ROUND, viewport: { width: 1280, height: 720 } })
    check('the non-retrigger feature NEVER shows the moment and still settles',
      neg.appearances === 0 && neg.settled === true, `appearances ${neg.appearances}, settled ${neg.settled}`)

    const rm = await driveFeature(browser, base, {
      round: RETRIGGER_ROUND, viewport: { width: 1280, height: 720 }, reducedMotion: true,
      frame: join(framesDir, 'moment_reduced_motion.png'),
    })
    check('reduced motion: the banner appears statically (no entrance animation) for the same duration',
      rm.appearances === 1 && rm.visibleMs >= 1300 && rm.visibleMs <= 1950
        && !!rm.geom && rm.geom.anim === 'none' && inBoard(rm.geom),
      rm.geom ? `anim "${rm.geom.anim}", ${rm.visibleMs}ms` : 'no geometry captured')
  } finally {
    await browser.close()
    srv.close()
  }

  if (failures.length) {
    console.error(`\nR062 RETRIGGER PROOF: FAIL (${failures.length})`)
    for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
    process.exit(1)
  }
  console.log('\nR062 RETRIGGER PROOF: PASS (fires once on the settled event, fixed duration, centred and whole at three sizes, resumes, reduced motion held)')
  process.exit(0)
}

// ── self-test, convention (p): the off-frame seed red AND the exit contract ──
if (SELF_TEST) {
  const r = spawnSync('node', [fileURLToPath(import.meta.url)], {
    cwd: FRONTEND,
    env: { ...process.env, FS_R062_SEED: '1' },
    encoding: 'utf-8',
    timeout: 600_000,
  })
  const out = (r.stdout || '') + (r.stderr || '')
  const red = /R062 RETRIGGER PROOF: FAIL/.test(out)
  const named = /FAIL desktop: the banner sits WHOLE inside the grid box/.test(out)
  const exited = typeof r.status === 'number' && r.status !== 0
  console.log(`  ${red ? 'caught ' : 'MISSED '} the restored off-frame position turned the proof red`)
  console.log(`  ${named ? 'named  ' : 'UNNAMED'} the red is the visual-bounds assertion, the owner's hidden-notice defect`)
  console.log(`  ${exited ? 'exited ' : 'HUNG   '} the failing invocation exited non-zero (status ${r.status}${r.signal ? ', signal ' + r.signal : ''})`)
  if (!red || !named || !exited) {
    console.error('\nR062 RETRIGGER PROOF SELF-TEST: FAIL')
    process.exit(1)
  }
  console.log('\nR062 RETRIGGER PROOF SELF-TEST: PASS (the off-frame notice red on visual bounds, non-zero exit, terminated)')
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
