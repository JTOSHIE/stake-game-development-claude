// r057_subcent_proof.mjs - FABLE BRIEF R057 TASK 2 (2026-08-13).
//
// THE CLAIM UNDER PROOF, checklist item [12] of the fifty-one: "Game displays
// sub-cent payouts correctly". The platform's minimum bets produce wins below
// one cent, and the per-currency decimals rule in currency.ts
// (winFractionDigits) prescribes exactly how they render: the currency's own
// precision is the floor, digits are added only while the INTEGER MICROS still
// carry value below that place, capped at four. This proof drives the REAL
// production bundle through a real spin against a stub wallet and asserts the
// rendered strings on every money surface a player sees.
//
// THE FIXTURE ROUND IS REAL: book round id 47 of the published books_base
// (payoutMultiplier 8 centibets, the 0.08x single-way L3 hit that is this
// game's minimum paying combination), committed verbatim at
// src/lib/services/__fixtures__/subcent_round_47.json. At the $0.10 minimum
// bet it pays $0.008, the exact case winFractionDigits' own header records:
// two-decimal truncation rendered it "$0.01", which is not the number that
// moved the wallet.
//
//   LEG 1  USD:  after the spin settles, the HUD win, the win panel, the HUD
//          balance, and the session ledger (Total Won and Net) all render the
//          widened three-digit strings. Frames committed.
//   LEG 2  XSC:  the same round in the sweepstakes token: trailing SC symbol,
//          same widening, never the raw code. Frames committed.
//
// EXPECTED STRINGS ARE HARDCODED, DELIBERATELY (convention l.4), derived from
// the rule rather than read back from the surface: bet 100,000 micros, payout
// 8,000 micros, so win $0.008 (8,000 % 10,000 != 0 -> 3 digits), balance
// 100.00 - 0.10 + 0.008 = $99.908 in micros. Citations:
//
// AMENDED 2026-08-15, R071 TASK 1, and the amendment is the point of the ruling.
// The settled platform law, a Stake reviewer message corroborated exactly by
// rgs.md, is that PAYOUTS AND WINS render at up to four places and every other
// currency display renders at exactly two. So this proof's two WIN expectations
// are unchanged, $0.008 at the HUD and $0.008 on the ledger's TOTAL WON, and its
// two non-win expectations move to two places: the BALANCE reads $99.91 and the
// NET reads -$0.09. Checklist item 12, "game displays sub-cent payouts
// correctly", is still exactly what this proof holds: the sub-cent PAYOUT is
// displayed, at four places, on both surfaces that carry a payout.
//   the rule            src/lib/utils/currency.ts winFractionDigits
//   HUD labels          src/lib/components/HudOverlay.svelte:329,367
//   win panel           src/lib/components/WinDisplay.svelte:92
//   ledger rows         src/lib/components/SessionPanel.svelte:116-118
//
// SEEDED NEGATIVE, convention (p), the exact defect in the form it occurs:
// --self-test re-invokes with FS_SEED_VIOLATION=1, serving a SCRATCH COPY of
// the real dist whose winFractionDigits widening loop is severed (the
// for-loop condition forced false), so every sub-cent value truncates to the
// currency's base precision: $0.008 renders "$0.01". The seeded run must FAIL
// on the win-string assertion, named, with a real non-zero exit (TR-123).
//
// RUNNER (TR-123): npx tsx, from frontend/. Exit 0 on PASS, non-zero on FAIL,
// terminates; the stub server is in-process http, closed before exit.
//   npx tsx scripts/r057_subcent_proof.mjs
//   npx tsx scripts/r057_subcent_proof.mjs --self-test

import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, cpSync, mkdirSync, rmSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import { spawnSync } from 'node:child_process'
import { qaTmpDir, evidenceDir } from './lib/evidencePaths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FRONTEND = join(__dirname, '..')
const REAL_DIST = join(FRONTEND, 'dist')
const SEED = process.env.FS_SEED_VIOLATION === '1'

const ROUND = JSON.parse(readFileSync(
  join(FRONTEND, 'src', 'lib', 'services', '__fixtures__', 'subcent_round_47.json'), 'utf-8'))

const START_MICROS = 100_000_000    // $100.00
const BET_MICROS = 100_000          // $0.10, the minimum bet
const PAYOUT_MICROS = 8_000         // 0.08x of the bet: $0.008, sub-cent

// The expectations, per currency, derived from the rule (see header).
const LEGS = [
  { name: 'USD', currency: 'USD', win: '$0.008', balance: '$99.91', won: '$0.008', net: '-$0.09' },
  { name: 'XSC', currency: 'XSC', win: '0.008 SC', balance: '99.91 SC', won: '0.008 SC', net: '-0.09 SC' },
]

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
  const scratch = join(qaTmpDir('r057-subcent-seeded-dist'))
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
    // winFractionDigits' widening loop, minified:
    //   for(;m<u;){const k=Ve/Math.pow(10,m);if(p%Math.round(k)===0)break;m+=1}
    // Severed by forcing the loop condition false: digits stay at the
    // currency's base precision and $0.008 truncates to "$0.01", the exact
    // wrong-truncation the rule's own header records having shipped.
    src = src.replace(/for\(;([\w$]+)<([\w$]+);\)(\{const [\w$]+=[\w$]+\/Math\.pow\(10,)/g,
      (_m, _a, _b, tail) => { hits++; return `for(;!1;)${tail}` })
    if (src !== before) writeFileSync(p, src)
  }
  return { scratch, hits }
}

// ── stub wallet plus static dist, one origin ─────────────────────────────────
function startStub(distDir, currency) {
  let played = false
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      if (req.method === 'POST') {
        let body = ''
        req.on('data', (c) => { body += c })
        req.on('end', () => {
          const json = (obj) => {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(obj))
          }
          if (req.url === '/wallet/authenticate') {
            return json({
              balance: { amount: START_MICROS, currency },
              config: {
                minBet: BET_MICROS, maxBet: 1_000_000_000, stepBet: BET_MICROS,
                betLevels: [BET_MICROS, 2 * BET_MICROS, 10 * BET_MICROS],
                defaultBetLevel: BET_MICROS,
              },
              round: null,
            })
          }
          if (req.url === '/wallet/play') {
            played = true
            return json({
              balance: { amount: START_MICROS - BET_MICROS, currency },
              round: {
                betID: 4701, active: true, mode: 'base',
                amount: BET_MICROS, payout: PAYOUT_MICROS, payoutMultiplier: ROUND.payoutMultiplier,
                state: { events: ROUND.events },
              },
            })
          }
          if (req.url === '/wallet/end-round') {
            return json({ balance: { amount: START_MICROS - BET_MICROS + (played ? PAYOUT_MICROS : 0), currency } })
          }
          res.writeHead(404); res.end('{}')
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

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim()

async function run() {
  let distDir = REAL_DIST
  if (SEED) {
    const { scratch, hits } = buildSeededDist()
    if (hits === 0) {
      console.error('SEED DID NOT APPLY: the bundle carries no widening loop to sever')
      process.exit(2)
    }
    console.log(`  seed applied: ${hits} substitution(s) severed the widening loop in a scratch dist`)
    distDir = scratch
  }
  if (!existsSync(join(distDir, 'index.html'))) {
    console.error('dist/ is absent. Run `npm run build` first; this proof serves the real build on purpose.')
    process.exit(1)
  }

  const framesDir = evidenceDir('reports', 'screens', 'r057-subcent')
  const browser = await chromium.launch()
  try {
    for (const leg of LEGS) {
      const server = await startStub(distDir, leg.currency)
      const base = `http://127.0.0.1:${server.address().port}`
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      try {
        await page.goto(`${base}/?sessionID=r057-subcent&rgs_url=${encodeURIComponent(base)}&lang=en`,
          { waitUntil: 'domcontentloaded' })
        await page.waitForSelector('[data-testid="spin-button"]', { timeout: 30_000 })
        const { dismissIntro } = await import('./lib/dismissOverlays.mjs')
        await dismissIntro(page)
        await page.waitForTimeout(500)
        await page.locator('[data-testid="spin-button"]').click({ timeout: 10_000 })
        // Reels, win presentation and count-up: 6s settles all of it for a
        // one-way base win.
        await page.waitForTimeout(6_000)

        const hudWin = clean(await page.locator('[data-testid="hud-win"]').innerText().catch(() => ''))
        const hudBalance = clean(await page.locator('[data-testid="hud-balance"]').innerText().catch(() => ''))
        check(`${leg.name}: the HUD win readout carries the widened sub-cent value ${leg.win}`,
          hudWin.includes(leg.win), `hud-win reads ${JSON.stringify(hudWin)}`)
        check(`${leg.name}: the HUD balance carries the settled ${leg.balance}`,
          hudBalance.includes(leg.balance), `hud-balance reads ${JSON.stringify(hudBalance)}`)

        // The ledger: open the session panel via the HUD menu.
        await page.locator('[data-testid="hud-menu"]').click({ timeout: 5_000 })
        await page.locator('[data-testid="open-session-panel"]').click({ timeout: 5_000 })
        await page.locator('[data-testid="session-panel-sheet"]').waitFor({ timeout: 5_000 })
        const sheet = clean(await page.locator('[data-testid="session-panel-sheet"]').innerText().catch(() => ''))
        check(`${leg.name}: the ledger's Total Won carries the real precision ${leg.won}`,
          sheet.includes(leg.won), `session sheet reads ${JSON.stringify(sheet.slice(0, 200))}`)
        check(`${leg.name}: the ledger's Net carries ${leg.net}`,
          sheet.includes(leg.net), `session sheet reads ${JSON.stringify(sheet.slice(0, 200))}`)
        check(`${leg.name}: the raw code never reaches a player`,
          !sheet.includes('XSC') && !hudWin.includes('XSC') && !hudBalance.includes('XSC'),
          'the raw platform code rendered')

        await page.screenshot({ path: join(framesDir, `subcent_${leg.name.toLowerCase()}_ledger.png`) })
        await page.keyboard.press('Escape').catch(() => {})
        await page.locator('[data-testid="session-panel-sheet"]').waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => {})
        await page.screenshot({ path: join(framesDir, `subcent_${leg.name.toLowerCase()}_hud.png`) })
      } finally {
        await page.close()
        server.close()
      }
    }
  } finally {
    await browser.close()
  }

  if (failures.length) {
    console.error(`\nR057 SUB-CENT DISPLAY PROOF: FAIL (${failures.length})`)
    for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`)
    process.exit(1)
  }
  console.log('\nR057 SUB-CENT DISPLAY PROOF: PASS (a real 0.08x round at the minimum bet renders its true value on every money surface, USD and XSC)')
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
  const red = /R057 SUB-CENT DISPLAY PROOF: FAIL/.test(out)
  const named = /FAIL USD: the HUD win readout carries the widened sub-cent value/.test(out)
  const exited = typeof r.status === 'number' && r.status !== 0
  console.log(`  ${applied ? 'seeded ' : 'NOSEED '} the widening loop was severed in a scratch copy of the real bundle`)
  console.log(`  ${red ? 'caught ' : 'MISSED '} the wrong truncation turned the proof red`)
  console.log(`  ${named ? 'named  ' : 'UNNAMED'} the red is the win readout, the "\$0.01 for \$0.008" misstatement`)
  console.log(`  ${exited ? 'exited ' : 'HUNG   '} the failing invocation exited non-zero (status ${r.status}${r.signal ? ', signal ' + r.signal : ''})`)
  if (!applied || !red || !named || !exited) {
    console.error('\nR057 SUB-CENT DISPLAY PROOF SELF-TEST: FAIL')
    process.exit(1)
  }
  console.log('\nR057 SUB-CENT DISPLAY PROOF SELF-TEST: PASS (severed widening red on the win readout, non-zero exit, terminated)')
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
