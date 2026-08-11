// r045_error_field_proof.mjs - FABLE RULING R045 item 3 (2026-08-11).
//
// THE CLAIM UNDER PROOF. The platform answers wallet errors with the
// identifier in TOP-LEVEL `error` (captured live, byte for byte:
// docs/stake-engine-live/captures/2026-08-11_wallet_400_1.json to _4, all
// `{"error":"ERR_VAL",...}`), and handleRGSError read only top-level `code`,
// so every real platform error fell through to the generic retryable branch.
// The sanctioned R045 edit makes the identifier read accept a string in
// `code` OR `error`, `code` winning. This proof drives the REAL production
// bundle in a real browser against a stub RGS speaking the platform's actual
// dialect and asserts the player-facing consequences:
//
//   PART 1  authenticate answers 400 {"error":"ERR_IS"}, lang=en: the session
//           is blocked and the rendered banner is the en session message.
//   PART 2  the same at lang=de: the de session message. The banner under
//           test is the live-guard banner, which is the one a blocked session
//           renders (App.svelte gates the English error-banner off when
//           betting is disabled, by design; the localised banner is the
//           player-facing surface, so it is what this proof reads).
//   PART 3  authenticate 200, then /wallet/play answers 400 {"error":"ERR_IS"}:
//           the wallet receives EXACTLY ONE play request, because ERR_IS is
//           not retryable. This is the half the old read broke: ERR_IS missed
//           becomes generic ERR_GEN, which IS retryable, and the client
//           hammers a dead session four times (attempt plus MAX_RETRIES 3).
//           The banner shown beside it is the ERR_IS message.
//
// EXPECTED STRINGS ARE HARDCODED, DELIBERATELY (convention l.4): the DOM
// observation must not share its source with its own expectation, so nothing
// here imports the live tables. Citations for the reader:
//   en 'Game unavailable. ...'          src/lib/i18n/translations.ts:297
//   de 'Spiel nicht verfügbar. ...'     src/lib/i18n/translations.ts:529
//   ERR_IS message                      src/lib/services/rgsService.ts ERROR_MESSAGES
//
// SEEDED NEGATIVE, convention (p), the exact defect in the form it shipped:
// --self-test re-invokes this proof with FS_SEED_VIOLATION=1, which serves a
// SCRATCH COPY of the real dist whose bundle has the dual read regressed to
// the single-field `code` read by textual substitution (the layout_fit
// precedent: seed a scratch copy of the real artefact, never the artefact).
// The seeded run must FAIL on PART 3's request count (four plays, not one),
// and the self-test demands the red verdict, the named assertion AND a real
// non-zero exit within a timeout (TR-123 exit contract, as everywhere).
//
// RUNNER (TR-123): npx tsx, from frontend/. Exit 0 on PASS, non-zero on
// FAIL, terminates; the server is in-process http, closed before exit.
//   npx tsx scripts/r045_error_field_proof.mjs
//   npx tsx scripts/r045_error_field_proof.mjs --self-test

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
  de: 'Spiel nicht verfügbar. Ihre Sitzung konnte nicht verifiziert werden. Bitte neu laden oder den Support kontaktieren.',
  errIs: 'Your session has expired. Please relaunch the game.',
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
  const scratch = join(qaTmpDir('r045-seeded-dist'))
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
    // Remove the `|| typeof X.error == "string"` half of the guard.
    src = src.replace(/\|\|typeof ([\w$]+)\.error===?"string"/g, () => { hits++; return '' })
    // Collapse the code-wins ternary back to the bare `.code` read.
    src = src.replace(/typeof ([\w$]+)\.code===?"string"\?([\w$]+)\.code:([\w$]+)\.error/g,
      (_m, a) => { hits++; return `${a}.code` })
    if (src !== before) writeFileSync(p, src)
  }
  return { scratch, hits }
}

// ── stub RGS plus static dist, one origin ────────────────────────────────────
function startStub(distDir, counters) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      if (req.method === 'POST') {
        let body = ''
        req.on('data', (c) => { body += c })
        req.on('end', () => {
          const sessionID = (() => { try { return JSON.parse(body).sessionID } catch { return '' } })()
          const json = (status, obj) => {
            res.writeHead(status, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(obj))
          }
          if (req.url === '/wallet/authenticate') {
            counters.authenticate++
            if (sessionID === 'r045-authfail') return json(400, { error: 'ERR_IS' })
            return json(200, {
              balance: { amount: 100_000_000, currency: 'USD' },
              config: {
                minBet: 100_000, maxBet: 1_000_000_000, stepBet: 100_000,
                betLevels: [1_000_000, 2_000_000], defaultBetLevel: 1_000_000,
              },
              round: null,
            })
          }
          if (req.url === '/wallet/play') {
            counters.play++
            return json(400, { error: 'ERR_IS' })
          }
          if (req.url === '/wallet/end-round') return json(200, {})
          return json(404, { error: 'ERR_GEN' })
        })
        return
      }
      const rel = (req.url || '/').split('?')[0]
      const p = join(distDir, rel === '/' ? 'index.html' : rel)
      if (!existsSync(p)) { res.writeHead(404); return res.end('not found') }
      res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' })
      res.end(readFileSync(p))
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

async function settle(page, ms = 400) { await page.waitForTimeout(ms) }

async function run() {
  let distDir = REAL_DIST
  if (SEED) {
    const { scratch, hits } = buildSeededDist()
    // A seed that did not land proves nothing; refuse to continue on zero.
    if (hits === 0) {
      console.error('SEED DID NOT APPLY: the bundle carries no dual-read pattern to regress')
      process.exit(2)
    }
    console.log(`  seed applied: ${hits} substitution(s) regressed the read to code-only in a scratch dist`)
    distDir = scratch
  }
  if (!existsSync(join(distDir, 'index.html'))) {
    console.error('dist/ is absent. Run `npm run build` first; this proof serves the real build on purpose.')
    process.exit(1)
  }

  const counters = { authenticate: 0, play: 0 }
  const server = await startStub(distDir, counters)
  const port = server.address().port
  const base = `http://127.0.0.1:${port}`
  const rgs = encodeURIComponent(base)

  const browser = await chromium.launch()
  try {
    // ── PARTS 1 and 2: authenticate 400 {"error":"ERR_IS"}, banner per locale.
    for (const lang of ['en', 'de']) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      await page.goto(`${base}/?sessionID=r045-authfail&rgs_url=${rgs}&lang=${lang}`,
        { waitUntil: 'domcontentloaded' })
      const banner = page.locator('[data-testid="live-guard-banner"]')
      await banner.waitFor({ timeout: 20_000 }).catch(() => {})
      const text = ((await banner.textContent().catch(() => null)) || '').trim()
      check(`PART ${lang === 'en' ? 1 : 2}  ${lang}: blocked-session banner renders the ${lang} session message`,
        text === EXPECT[lang], `got ${JSON.stringify(text)}`)
      await page.close()
    }
    check('PARTS 1+2: authenticate was not retried on either locale (one request each)',
      counters.authenticate === 2, `authenticate count ${counters.authenticate}`)

    // ── PART 3: authenticate 200, play 400 {"error":"ERR_IS"}.
    counters.authenticate = 0; counters.play = 0
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(`${base}/?sessionID=r045-playfail&rgs_url=${rgs}&lang=en`,
      { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 30_000 })
    const { dismissIntro } = await import('./lib/dismissOverlays.mjs')
    await dismissIntro(page)
    await settle(page)
    await page.locator('[data-testid="spin-button"]').click({ timeout: 10_000 })
    // MAX_RETRIES 3 at RETRY_DELAY 1000ms: a misread that retries needs about
    // 3s to finish doing so. 6s observes the whole window either way.
    await page.waitForTimeout(6_000)
    check('PART 3: the wallet received EXACTLY ONE play request (ERR_IS is not retryable)',
      counters.play === 1, `play count ${counters.play}`)
    const errText = ((await page.locator('.error-banner').textContent().catch(() => null)) || '').trim()
    check('PART 3: the error banner carries the ERR_IS session message, not the generic retry line',
      errText === EXPECT.errIs, `got ${JSON.stringify(errText)}`)
    await page.close()
  } finally {
    await browser.close()
    server.close()
  }

  if (failures.length) {
    console.error(`\nR045 ERROR FIELD PROOF: FAIL (${failures.length})`)
    for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
    process.exit(1)
  }
  console.log('\nR045 ERROR FIELD PROOF: PASS (banner en+de, one play request, session message beside it)')
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
  const red = /R045 ERROR FIELD PROOF: FAIL/.test(out)
  const named = /FAIL PART 3: the wallet received EXACTLY ONE play request/.test(out)
  const exited = typeof r.status === 'number' && r.status !== 0
  console.log(`  ${applied ? 'seeded ' : 'NOSEED '} the code-only read was regressed into a scratch copy of the real bundle`)
  console.log(`  ${red ? 'caught ' : 'MISSED '} the single-field read turned the proof red`)
  console.log(`  ${named ? 'named  ' : 'UNNAMED'} the red is the play-request count, the retry hammer the old read causes`)
  console.log(`  ${exited ? 'exited ' : 'HUNG   '} the failing invocation exited non-zero (status ${r.status}${r.signal ? ', signal ' + r.signal : ''})`)
  if (!applied || !red || !named || !exited) {
    console.error('\nR045 ERROR FIELD PROOF SELF-TEST: FAIL')
    process.exit(1)
  }
  console.log('\nR045 ERROR FIELD PROOF SELF-TEST: PASS (seeded single-field read red on the retry hammer, non-zero exit, terminated)')
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
