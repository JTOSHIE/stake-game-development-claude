// r041_stall_banner_proof.mjs
//
// THE ONE R041 SURFACE THE WORDING PROOF CANNOT REACH: the banner a player sees
// when the wallet stalls.
//
// Q4 of FABLE COMMS 040 was that every blocked reason rendered
// `errSessionUnavailable`, whose middle sentence, "Your session could not be
// verified", is FALSE after a stall or a failed settle: the session
// authenticated perfectly well. R041 answered it with a new key,
// `errRoundIncomplete`, routed from the two RUNTIME reasons only.
//
// `liveGuard.test.ts` proves the MAP, and proves it can go red. What no unit
// test can prove is that the mapped key reaches the screen through the real
// banner in a real locale, which is exactly the gap the original defect lived
// in: the store was right and the markup rendered a hardcoded key.
//
// HOW THE STALL IS PRODUCED, and why it is the real thing rather than a mock.
// The page is launched with valid session parameters so the game goes LIVE (a
// paramless launch yields `missing-params`, which is the OTHER branch). The
// stub answers `/wallet/authenticate` with an official-shaped 200 and then
// never answers `/wallet/play` at all. That is the precise condition
// walletTimeout.ts exists for: the request does not fail, it hangs, so
// `_withRetry` cannot see it and only the 15s deadline ends it.
//
// The run therefore takes about twenty seconds by construction. That is the
// deadline being real, not the script being slow.
//
// CONVENTION (h.1): scratch by default, --out=<dir> to place frames on purpose.
//
// Usage, from frontend/, after `npm run build`:
//   node scripts/r041_stall_banner_proof.mjs [--out=<dir>]

import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { WALLET_TIMEOUT_MS } from '../src/lib/services/walletTimeout.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const outArg = process.argv.find((a) => a.startsWith('--out='))
const OUT = outArg ? outArg.slice('--out='.length) : join(ROOT, '.scratch', 'r041-stall')
mkdirSync(OUT, { recursive: true })

const PORT = 4533
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webp': 'image/webp',
}
function serve() {
  const srv = createServer((req, res) => {
    let p = req.url.split('?')[0]
    if (p === '/') p = '/index.html'
    const f = join(DIST, decodeURIComponent(p))
    if (!existsSync(f) || f.endsWith('/')) { res.writeHead(404); res.end('not found'); return }
    res.writeHead(200, { 'content-type': MIME[extname(f)] ?? 'application/octet-stream' })
    res.end(readFileSync(f))
  })
  return new Promise((r) => srv.listen(PORT, () => r(srv)))
}

const M = 1_000_000
/** The official authenticate shape, copied from rgsService.contract.test.ts. */
const AUTH_OK = {
  balance: { amount: 500 * M, currency: 'USD' },
  config: {
    minBet: 100_000, maxBet: 100 * M, stepBet: 100_000, defaultBetLevel: 1 * M,
    betLevels: [100_000, 500_000, 1 * M, 2 * M],
    jurisdiction: {
      socialCasino: false, disabledFullscreen: false, disabledTurbo: false,
      disabledSuperTurbo: false, disabledAutoplay: false, disabledSlamstop: false,
      disabledSpacebar: false, disabledBuyFeature: false, displayNetPosition: false,
      displayRTP: true, displaySessionTimer: false, minimumRoundDuration: 0,
    },
  },
  round: null,
}

let failures = 0
const fail = (m) => { failures++; console.error(`  FAIL  ${m}`) }
const ok = (m) => console.log(`  ok    ${m}`)
const clean = (s) => s.replace(/\s+/g, ' ').trim()

const srv = await serve()
const browser = await chromium.launch()
const observations = {}

try {
  console.log('R041 STALL BANNER PROOF: the wallet hangs, and the banner must say so\n')
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  let playCalls = 0
  await page.route('**/wallet/**', async (route) => {
    const url = route.request().url()
    if (url.includes('/wallet/authenticate')) {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(AUTH_OK) })
      return
    }
    if (url.includes('/wallet/play')) {
      playCalls++
      return // NEVER fulfilled, never aborted. This is the stall.
    }
    await route.fulfill({ contentType: 'application/json', body: '{}' })
  })

  const qs = `sessionID=r041-proof&rgs_url=localhost:${PORT}&lang=de&currency=USD&device=desktop`
  await page.goto(`http://localhost:${PORT}/?${qs}`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
  await dismissIntro(page)
  await page.waitForTimeout(800)

  const bannerBefore = page.locator('[data-testid="live-guard-banner"]')
  observations.beforeSpin = {
    bannerPresent: (await bannerBefore.count()) > 0,
    bannerText: (await bannerBefore.count()) ? clean(await bannerBefore.first().innerText()) : null,
  }
  await page.screenshot({ path: join(OUT, '01-live-session-before-spin.png') })
  if (observations.beforeSpin.bannerPresent) {
    fail(`a healthy live session already shows a guard banner: ${observations.beforeSpin.bannerText}`)
  } else ok('a healthy live session shows no guard banner')

  await page.locator('[data-testid="spin-button"]').click()
  await page.waitForTimeout(2000)
  const midText = (await bannerBefore.count()) ? clean(await bannerBefore.first().innerText()) : null
  observations.duringStall = { atMs: 2000, bannerText: midText, playCalls }
  await page.screenshot({ path: join(OUT, '02-mid-stall-no-banner-yet.png') })
  if (midText) fail(`the banner appeared before the ${WALLET_TIMEOUT_MS}ms deadline: ${midText}`)
  else ok(`no banner two seconds in, the deadline is ${WALLET_TIMEOUT_MS}ms and has not elapsed`)

  // Past the deadline. One extra second of slack for the abort to propagate.
  await page.waitForTimeout(WALLET_TIMEOUT_MS - 2000 + 2500)
  const after = (await bannerBefore.count()) ? clean(await bannerBefore.first().innerText()) : null
  observations.afterDeadline = { bannerText: after, playCalls }
  await page.screenshot({ path: join(OUT, '03-after-deadline-round-incomplete.png') })

  if (!after) {
    fail('no guard banner after the deadline elapsed')
  } else {
    ok(`the banner reads ${JSON.stringify(after)}`)
    // THE ASSERTION THAT MATTERS. The German errRoundIncomplete says the last
    // ROUND could not be completed; the old errSessionUnavailable said the
    // SESSION could not be verified. Matching on the distinguishing clause of
    // each, so this cannot pass by accident on shared boilerplate.
    if (/letzte Runde/i.test(after)) ok('it names the ROUND, which is what actually failed')
    else fail('the banner does not name the round')
    if (/Sitzung konnte nicht verifiziert/i.test(after)) {
      fail('it still claims the SESSION could not be verified, which is the false sentence Q4 raised')
    } else ok('it no longer claims the session could not be verified')
    if (/could not be completed/i.test(after)) fail('the banner fell back to English')
    else ok('and it is in German, not an English fallback')
  }

  // The stake must not go out twice while the outcome is unknown.
  if (playCalls !== 1) fail(`expected exactly one /wallet/play, saw ${playCalls}`)
  else ok('exactly one /wallet/play was attempted, no retry against an unknown outcome')

  writeFileSync(join(OUT, 'observations-stall.json'),
    JSON.stringify({ walletTimeoutMs: WALLET_TIMEOUT_MS, ...observations }, null, 2) + '\n')
  console.log(`\nframes and observations.json written to ${OUT}`)
} finally {
  await browser.close()
  srv.close()
}

if (failures) { console.error(`\nR041 STALL BANNER PROOF: FAIL (${failures})`); process.exit(1) }
console.log('\nR041 STALL BANNER PROOF: PASS')
