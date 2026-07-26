// background_local_testing_verify.mjs - 2026-07-26.
//
// Verifies the path the owner's local eye-call session actually takes, rather
// than assuming it works. Four things, each of which would silently spoil the
// session if it were wrong:
//
//   1. The dev server answers on the LAN address, not just on localhost. The
//      platform's Local Testing redirect sends a BROWSER to the redirect URL;
//      if that browser is the owner's phone, `localhost` is the phone.
//   2. The game boots on the real RGS launch parameter shape
//      (`sessionID` + `rgs_url`, per rgsService.ts) and addresses its
//      authenticate call at the host it was given. Proven by intercepting the
//      request, so no real session is consumed.
//   3. The `?bg=` choice STICKS across a navigation that carries only the RGS
//      parameters. This is the one that would quietly ruin the eye-call: the
//      DTT appends its own query, and if that drops ours the owner would judge
//      the shipped background while believing it was the candidate.
//   4. The candidate file is actually served over HTTP at the path the app
//      requests, at the byte size the ingest recorded.
//
// Run (from frontend/, dev server up with --host):
//   node scripts/background_local_testing_verify.mjs

import { chromium } from 'playwright'
import { writeFileSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const ROOT = '/Users/jt/math-sdk'
const PORT = 5173
const LAN = execFileSync('sh', ['-c',
  'ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true'],
  { encoding: 'utf-8' }).trim()
const CAND_REL = 'assets/themes/future-spinner/backgrounds/candidates/bg_base_candidate_v2.jpg'
const CAND_ABS = `${ROOT}/frontend/public/${CAND_REL}`

// A deliberately fake session against a host that does not exist. The
// authenticate request is intercepted and never allowed out, so nothing real is
// touched and no live session is spent proving the wiring.
const FAKE_SESSION = 'LOCALTEST-DO-NOT-USE'
const FAKE_RGS_HOST = 'rgs.invalid.localtest'

const checks = []
const record = (name, pass, detail) => {
  checks.push({ name, pass, detail })
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}\n         ${detail}`)
}

if (!LAN) {
  console.log('could not determine a LAN address; check 1 cannot run')
}

const browser = await chromium.launch()

// 1. LAN reachability of the dev server.
{
  const page = await browser.newPage()
  const url = `http://${LAN}:${PORT}/?mock=1`
  let ok = false
  let detail = ''
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
    ok = !!resp && resp.status() === 200
    detail = `${url} -> HTTP ${resp?.status()}, game mounted`
  } catch (e) {
    detail = `${url} -> ${e.message.split('\n')[0]}`
  }
  record('dev server answers on the LAN address', ok, detail)
  await page.close()
}

// 4. The candidate is served over HTTP at the requested path, right size.
{
  const page = await browser.newPage()
  const url = `http://${LAN}:${PORT}/${CAND_REL}`
  let ok = false
  let detail = ''
  try {
    const resp = await page.goto(url, { timeout: 15000 })
    const body = await resp.body()
    const onDisk = statSync(CAND_ABS).size
    ok = resp.status() === 200 && body.length === onDisk
    detail = `HTTP ${resp.status()}, served ${body.length.toLocaleString()}B, ` +
             `on disk ${onDisk.toLocaleString()}B, ` +
             `content-type ${resp.headers()['content-type']}`
  } catch (e) {
    detail = `${url} -> ${e.message.split('\n')[0]}`
  }
  record('candidate v2 served over HTTP at the app path, byte sizes agree', ok, detail)
  await page.close()
}

// 2 and 3 together, because they are the same navigation: set the background
// choice, then navigate with ONLY the RGS parameters, as the DTT redirect does.
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 675 } })
  const authAttempts = []

  await page.route('**/*', async (route) => {
    const u = route.request().url()
    // Match on the request's HOSTNAME, never on the URL as a substring. The
    // document URL itself carries `rgs_url=<host>` in its query, so a
    // substring test aborts the page navigation it is meant to observe.
    let host = ''
    try { host = new URL(u).hostname } catch { host = '' }
    if (host === FAKE_RGS_HOST || u.includes('/wallet/authenticate')) {
      authAttempts.push({ url: u, method: route.request().method(),
                          postData: route.request().postData() })
      // Refuse it. The point is to observe the attempt, not to complete it.
      return route.abort('failed')
    }
    return route.continue()
  })

  // Step one: the owner opens the candidate URL directly, once.
  await page.goto(`http://${LAN}:${PORT}/?mock=1&bg=v2`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 20000 })
  const afterParam = await page.evaluate(() => ({
    src: document.querySelector('img.bg-still:not(.overdrive)')?.getAttribute('src'),
    stored: window.sessionStorage.getItem('fsBgCandidate'),
  }))

  // Step two: the DTT redirect fires. Its query carries the session and the
  // RGS host and NOTHING of ours, which is the case that matters.
  const rgsUrl = `http://${LAN}:${PORT}/` +
    `?sessionID=${FAKE_SESSION}&rgs_url=${FAKE_RGS_HOST}&lang=en&device=desktop`
  await page.goto(rgsUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3500)

  const afterRedirect = await page.evaluate(() => ({
    src: document.querySelector('img.bg-still:not(.overdrive)')?.getAttribute('src'),
    stored: window.sessionStorage.getItem('fsBgCandidate'),
  }))

  record(
    'the ?bg=v2 choice survives a redirect carrying only the RGS parameters',
    afterParam.src?.includes('candidate_v2') === true
      && afterRedirect.src?.includes('candidate_v2') === true,
    `after ?bg=v2: ${afterParam.src} (stored ${afterParam.stored}); ` +
    `after RGS-only redirect: ${afterRedirect.src} (stored ${afterRedirect.stored})`,
  )

  const addressed = authAttempts.filter((a) => a.url.includes(FAKE_RGS_HOST))
  record(
    'the game boots on the real launch shape and addresses the given rgs_url',
    addressed.length > 0,
    addressed.length
      ? `${addressed.length} request(s) to the supplied host, first: ` +
        `${addressed[0].method} ${addressed[0].url}`
      : `no request reached the supplied host; attempts seen: ` +
        JSON.stringify(authAttempts.slice(0, 3)),
  )

  await page.close()
}

await browser.close()

const failed = checks.filter((c) => !c.pass)
const out = {
  generated: new Date().toISOString(),
  script: 'frontend/scripts/background_local_testing_verify.mjs',
  lanAddress: LAN,
  port: PORT,
  devServerUrl: `http://${LAN}:${PORT}/`,
  fakeSessionUsed: FAKE_SESSION,
  fakeRgsHostUsed: FAKE_RGS_HOST,
  note: 'The authenticate request is intercepted and aborted; no live RGS '
      + 'session is consumed by this verification.',
  checks,
  allPass: failed.length === 0,
}
writeFileSync(`${ROOT}/reports/qa/background_local_testing_verify.json`,
  JSON.stringify(out, null, 2) + '\n')

console.log(`\n${checks.length - failed.length} of ${checks.length} checks pass`)
if (failed.length) process.exit(1)
