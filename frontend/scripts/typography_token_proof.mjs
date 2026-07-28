// typography_token_proof.mjs, FS_POLISH_PUNCH_AND_R3 JOB 2 (2026-07-28).
//
// THE CLAIM THIS PROVES: collapsing eight hand-typed font stacks and seven
// bare 'Courier New' sites into the two canonical tokens (--fs-font-display,
// --fs-font-numeric, src/app.css) changes NO shipped pixel while Orbitron is
// loaded. Orbitron led every shipped stack before the tokens and leads both
// tokens after them, so with the face loaded the rendered glyphs are
// identical; only the fallback chains were unified. The seven bare Courier New
// sites are all in ThemeSelector.svelte, which is dev-only and does not ship.
//
// METHOD. Serve two dists over the same in-process static server: the BEFORE
// dist (built at the pre-token commit) and the AFTER dist (built with the
// tokens). Capture the same two typography-rich surfaces from each at
// 1200x675, with animations disabled by injected CSS and every canvas masked
// by Playwright's own deterministic mask paint, since reels and particle
// layers are WebGL and legitimately nondeterministic frame to frame. Then
// count differing pixels between the pairs. The assertion is zero.
//
// The two surfaces:
//   splash  the hero splash: wordmark, title, TAP TO CONTINUE prompt.
//   hud     the in-game HUD after dismissing the splash: balance, bet and win
//           readouts (numeric token) beside labels and buttons (display token).
//
// This is a one-session proof rather than a standing gate: once the before
// dist no longer exists the comparison cannot be re-run, which is why the
// captures are committed per convention (h). The STANDING protection is the
// third-font-stack class in machine_tell_gate.mjs, which fails the build if a
// literal stack ever appears again.
//
// USAGE (from frontend/):
//   node scripts/typography_token_proof.mjs --before <dist-dir> --after <dist-dir>
//   FS_WRITE_EVIDENCE=1 ... to write into the committed evidence directory.

import { chromium } from 'playwright'
import { writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { evidenceDir, announceEvidenceMode } from './lib/evidencePaths.mjs'
import { startStaticServer, assertNoSurvivors } from './lib/previewServer.mjs'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const argOf = (flag) => {
  const i = process.argv.indexOf(flag)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : null
}
const BEFORE_DIST = argOf('--before')
const AFTER_DIST = argOf('--after')
if (!BEFORE_DIST || !AFTER_DIST) {
  console.error('usage: node scripts/typography_token_proof.mjs --before <dist> --after <dist>')
  process.exit(2)
}

announceEvidenceMode('typography_token_proof')
const SHOTS = evidenceDir('reports', 'screens', 'typography-tokens-2026-07-28')
const QA = evidenceDir('reports', 'qa')

const VIEWPORT = { width: 1200, height: 675 }
const RGS_HOST = 'rgs.typography-token-proof.invalid'

const GATE_TIMEOUT_MS = 6 * 60_000
setTimeout(() => {
  console.error(`TYPOGRAPHY TOKEN PROOF: HARD TIMEOUT after ${GATE_TIMEOUT_MS / 1000}s, failing red`)
  process.exit(1)
}, GATE_TIMEOUT_MS)

const authBody = () => ({
  balance: { amount: 100_000_000, currency: 'USD' },
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

// Animations off entirely (not paused: paused freezes at a phase that depends
// on load timing, none resets to the unanimated base state, which is the only
// deterministic frame). Canvases are masked at screenshot time instead, since
// CSS cannot still a WebGL layer.
const FREEZE_CSS = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
  }
`

async function captureBuild(browser, base, label) {
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  const page = await ctx.newPage()
  await page.route(`**://${RGS_HOST}/**`, async (route) => {
    const url = route.request().url()
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) })
    if (url.includes('/wallet/authenticate')) return json(authBody())
    return json({})
  })
  await page.goto(`${base}/?sessionID=typography-proof&rgs_url=${RGS_HOST}&lang=en`, { waitUntil: 'commit' })

  const shots = {}
  const snap = async (id) => {
    await page.addStyleTag({ content: FREEZE_CSS })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(600)
    const path = join(SHOTS, `${label}-${id}.png`)
    await page.screenshot({ path, mask: [page.locator('canvas')] })
    shots[id] = path
  }

  await page.waitForSelector('[data-testid="hero-splash"]', { timeout: 30_000 })
  await snap('splash')

  await dismissIntro(page)
  await page.waitForSelector('.hud-root, .fs-hud, [data-testid="hud"], .game-stage', { timeout: 30_000 })
  await page.waitForTimeout(1500)
  await snap('hud')

  await ctx.close()
  return shots
}

/** Decode two PNGs in a browser page and count differing pixels. */
async function diffPixels(browser, aPath, bPath) {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  const toDataUri = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`
  const result = await page.evaluate(async ([a, b]) => {
    const load = (src) => new Promise((res, rej) => {
      const img = new Image()
      img.onload = () => res(img)
      img.onerror = rej
      img.src = src
    })
    const [ia, ib] = await Promise.all([load(a), load(b)])
    if (ia.width !== ib.width || ia.height !== ib.height) {
      return { differing: -1, total: 0, note: `size mismatch ${ia.width}x${ia.height} vs ${ib.width}x${ib.height}` }
    }
    const cv = (img) => {
      const c = document.createElement('canvas')
      c.width = img.width; c.height = img.height
      const g = c.getContext('2d')
      g.drawImage(img, 0, 0)
      return g.getImageData(0, 0, img.width, img.height).data
    }
    const da = cv(ia); const db = cv(ib)
    let differing = 0
    for (let i = 0; i < da.length; i += 4) {
      if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2] || da[i + 3] !== db[i + 3]) differing++
    }
    return { differing, total: da.length / 4 }
  }, [toDataUri(aPath), toDataUri(bPath)])
  await ctx.close()
  return result
}

const browser = await chromium.launch()
const failures = []

const beforeServer = await startStaticServer(BEFORE_DIST)
const beforeShots = await captureBuild(browser, `http://localhost:${beforeServer.port}`, 'before')
await beforeServer.close()

const afterServer = await startStaticServer(AFTER_DIST)
const afterShots = await captureBuild(browser, `http://localhost:${afterServer.port}`, 'after')
await afterServer.close()

const results = {}
for (const id of ['splash', 'hud']) {
  const r = await diffPixels(browser, beforeShots[id], afterShots[id])
  results[id] = r
  const ok = r.differing === 0
  if (!ok) failures.push(`${id}: ${r.differing} of ${r.total} pixels differ${r.note ? ` (${r.note})` : ''}`)
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${id}: ${r.differing} differing pixel(s) of ${r.total}`)
}

await browser.close()

writeFileSync(join(QA, 'typography_token_proof_2026-07-28.json'), JSON.stringify({
  generated: '2026-07-28',
  job: 'FS_POLISH_PUNCH_AND_R3 JOB 2, typography tokens, zero visual change',
  viewport: VIEWPORT,
  method: 'animations disabled, canvases masked, per-pixel RGBA equality',
  results,
  pass: failures.length === 0,
  failures,
}, null, 2))

assertNoSurvivors('typography_token_proof')
if (failures.length) {
  console.error(`\nTYPOGRAPHY TOKEN PROOF: FAIL (${failures.join('; ')})`)
  process.exit(1)
}
console.log('\nTYPOGRAPHY TOKEN PROOF: PASS, the token adoption changed no shipped pixel on either surface')
// The hard-timeout timer above still holds the event loop; the work is done.
process.exit(0)
