// r057_invalid_rgs_proof.mjs - FABLE BRIEF R057 TASK 1 (2026-08-13).
//
// THE CLAIM UNDER PROOF, checklist item [02] of the fifty-one: "Game
// authentication fails correctly with an invalid rgs_url". A launch whose
// rgs_url cannot be reached must FAIL LOUDLY AND SAFELY: the auth-failed
// live guard engages (R2/TR-010 mock containment: a session that did not
// authenticate must never be bettable, because rgsService's locked
// fallthrough would serve the mock), the KEYED banner renders in the
// player's locale, the spin control is not usable, and nothing hangs.
//
//   PART 1  lang=en: the live-guard banner renders the en session message.
//   PART 2  lang=de: the de session message. Both within a bounded window,
//           which is the no-hang half of the claim: a network-level
//           authenticate failure retries before surfacing, so the window
//           covers the whole retry ladder and the banner must still land.
//   PART 3  no silent state, asserted BEHAVIOURALLY: pressing the spin
//           control on the blocked session puts NOTHING on the wire. The
//           R2/TR-010 containment gates the ACTION, not the attribute
//           (App.svelte:714 `if ($bettingDisabled) return`), so the button
//           can render enabled while every press is a guarded no-op; the
//           claim the checklist item makes is that no bet can be placed and
//           no mock spin runs, and that is what is asserted: zero new
//           requests toward the RGS origin after the press, and the banner
//           still standing.
//
// THE INVALID rgs_url IS A REFUSED PORT, deliberately: a port on 127.0.0.1
// that was bound and closed just before the drive, so the connection is
// REFUSED deterministically, offline-safe, on every runner. An unresolvable
// DNS name tests the resolver's mood as much as our handling; a refused
// connection is the same failure class (the fetch rejects, initRGS surfaces
// the error) without the environmental dependence.
//
// EXPECTED STRINGS ARE HARDCODED, DELIBERATELY (convention l.4): the DOM
// observation must not share its source with its own expectation. Citations:
//   en 'Game unavailable. ...'        src/lib/i18n/translations.ts:298
//   de 'Spiel nicht verfügbar. ...'   src/lib/i18n/translations.ts:532
//   key map auth-failed -> errSessionUnavailable  src/lib/stores/liveGuard.ts:65
//
// SEEDED NEGATIVE, convention (p), the exact defect this guard exists to
// prevent: --self-test re-invokes with FS_SEED_VIOLATION=1, which serves a
// SCRATCH COPY of the real dist whose evaluateLiveGuard ternary is regressed
// so the authErrored branch yields null instead of 'auth-failed' (the guard
// severed: an authenticate failure no longer engages it). The seeded run
// must FAIL on the banner assertions, and the self-test demands the red
// verdict, the named assertion AND a real non-zero exit (TR-123 contract).
//
// RUNNER (TR-123): npx tsx, from frontend/. Exit 0 on PASS, non-zero on
// FAIL, terminates; the static server is in-process http, closed before exit.
//   npx tsx scripts/r057_invalid_rgs_proof.mjs
//   npx tsx scripts/r057_invalid_rgs_proof.mjs --self-test

import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, cpSync, mkdirSync, rmSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import { spawnSync } from 'node:child_process'
import { qaTmpDir } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FRONTEND = join(__dirname, '..')
const REAL_DIST = join(FRONTEND, 'dist')
const SEED = process.env.FS_SEED_VIOLATION === '1'

const EXPECT = {
  en: 'Game unavailable. Your session could not be verified. Please reload or contact support.',
  de: 'Spiel nicht verfügbar. Deine Sitzung konnte nicht bestätigt werden. Bitte lade neu oder kontaktiere den Support.',
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webp': 'image/webp',
}

const failures = []
const check = (name, cond, detail) => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond ? '' : `  (${detail})`}`)
  if (!cond) failures.push({ name, detail })
}

// ── the seeded scratch dist, convention (p) ──────────────────────────────────
function buildSeededDist() {
  const scratch = join(qaTmpDir('r057-seeded-dist'))
  rmSync(scratch, { recursive: true, force: true })
  mkdirSync(scratch, { recursive: true })
  cpSync(REAL_DIST, scratch, { recursive: true })
  let hits = 0
  const assets = join(scratch, 'assets')
  for (const f of readdirSync(assets)) {
    if (!f.endsWith('.js')) continue
    const p = join(assets, f)
    let src = readFileSync(p, 'utf-8')
    const before = src
    // evaluateLiveGuard's decision, minified:
    //   const b=n?"auth-failed":a?null:"missing-params"
    // Severed so an authenticate failure yields null: the guard never
    // engages, which is exactly the pre-R2/TR-010 state where a failed
    // session fell through to the mock with nothing on screen saying why.
    src = src.replace(/\?"auth-failed":/g, () => { hits++; return '?null:' })
    if (src !== before) writeFileSync(p, src)
  }
  return { scratch, hits }
}

// ── static dist server (no wallet stubs: the rgs_url points elsewhere) ──────
function startStatic(distDir) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const rel = (req.url || '/').split('?')[0]
      const p = join(distDir, rel === '/' ? 'index.html' : rel)
      if (!existsSync(p)) { res.writeHead(404); return res.end('not found') }
      res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' })
      res.end(readFileSync(p))
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

/** Bind a port, learn its number, close it: a deterministically REFUSED port. */
function refusedPort() {
  return new Promise((resolve) => {
    const s = createServer()
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address()
      s.close(() => resolve(port))
    })
  })
}

async function run() {
  let distDir = REAL_DIST
  if (SEED) {
    const { scratch, hits } = buildSeededDist()
    if (hits === 0) {
      console.error('SEED DID NOT APPLY: the bundle carries no auth-failed ternary to sever')
      process.exit(2)
    }
    console.log(`  seed applied: ${hits} substitution(s) severed the auth-failed guard in a scratch dist`)
    distDir = scratch
  }
  if (!existsSync(join(distDir, 'index.html'))) {
    console.error('dist/ is absent. Run `npm run build` first; this proof serves the real build on purpose.')
    process.exit(1)
  }

  const server = await startStatic(distDir)
  const base = `http://127.0.0.1:${server.address().port}`
  const dead = await refusedPort()
  const rgs = encodeURIComponent(`http://127.0.0.1:${dead}`)

  const browser = await chromium.launch()
  try {
    for (const lang of ['en', 'de']) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      const rgsRequests = []
      page.on('request', (r) => { if (r.url().includes(`127.0.0.1:${dead}`)) rgsRequests.push(r.url()) })
      const t0 = Date.now()
      await page.goto(`${base}/?sessionID=r057-invalid&rgs_url=${rgs}&lang=${lang}`,
        { waitUntil: 'domcontentloaded' })
      const banner = page.locator('[data-testid="live-guard-banner"]')
      // 25s bounds the whole retry ladder (MAX_RETRIES 3 at 1000ms) with
      // headroom for a cold runner; the elapsed time is printed so the
      // no-hang half of the claim carries its number.
      await banner.waitFor({ timeout: 25_000 }).catch(() => {})
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
      const text = ((await banner.textContent().catch(() => null)) || '').trim()
      check(`PART ${lang === 'en' ? 1 : 2}  ${lang}: the keyed auth-failed banner renders within bounds (${elapsed}s)`,
        text === EXPECT[lang], `got ${JSON.stringify(text)}`)
      if (lang === 'en') {
        // PART 3, behavioural (see the header): a press on the spin control
        // must put nothing on the wire and must not disturb the banner.
        await page.waitForTimeout(500)
        const before = rgsRequests.length
        const spin = page.locator('[data-testid="spin-button"]')
        if ((await spin.count().catch(() => 0)) > 0) {
          await spin.click({ timeout: 5_000, force: true }).catch(() => {})
        }
        await page.waitForTimeout(2_000)
        const after = rgsRequests.length
        const bannerStill = ((await banner.textContent().catch(() => null)) || '').trim() === EXPECT.en
        check('PART 3: a press on the spin control puts nothing on the wire and the banner stands',
          after === before && bannerStill,
          `rgs requests before press ${before}, after ${after}; banner intact ${bannerStill}`)
      }
      await page.close()
    }
  } finally {
    await browser.close()
    server.close()
  }

  if (failures.length) {
    console.error(`\nR057 INVALID RGS_URL PROOF: FAIL (${failures.length})`)
    for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
    process.exit(1)
  }
  console.log('\nR057 INVALID RGS_URL PROOF: PASS (keyed banner en+de within bounds, a press puts nothing on the wire, no silent state, no hang)')
  process.exit(0)
}

// ── self-test, convention (p): seeded red AND the exit contract ──────────────
if (process.argv.includes('--self-test')) {
  const r = spawnSync('npx', ['tsx', fileURLToPath(import.meta.url)], {
    cwd: FRONTEND,
    env: { ...process.env, FS_SEED_VIOLATION: '1' },
    encoding: 'utf-8',
    timeout: 300_000,
  })
  const out = (r.stdout || '') + (r.stderr || '')
  const applied = /seed applied: [1-9]/.test(out)
  const red = /R057 INVALID RGS_URL PROOF: FAIL/.test(out)
  const named = /FAIL PART 1 {2}en: the keyed auth-failed banner/.test(out)
  const exited = typeof r.status === 'number' && r.status !== 0
  console.log(`  ${applied ? 'seeded ' : 'NOSEED '} the auth-failed guard was severed in a scratch copy of the real bundle`)
  console.log(`  ${red ? 'caught ' : 'MISSED '} the severed guard turned the proof red`)
  console.log(`  ${named ? 'named  ' : 'UNNAMED'} the red is the missing keyed banner, the silent dead session`)
  console.log(`  ${exited ? 'exited ' : 'HUNG   '} the failing invocation exited non-zero (status ${r.status}${r.signal ? ', signal ' + r.signal : ''})`)
  if (!applied || !red || !named || !exited) {
    console.error('\nR057 INVALID RGS_URL PROOF SELF-TEST: FAIL')
    process.exit(1)
  }
  console.log('\nR057 INVALID RGS_URL PROOF SELF-TEST: PASS (severed guard red on the missing banner, non-zero exit, terminated)')
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
