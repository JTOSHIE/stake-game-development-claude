// CONVENTION (h.1), MIGRATED 2026-08-10 by R042 TASK A7. This script used to
// write its JSON and its screenshots STRAIGHT INTO the committed evidence tree,
// so a plain run silently rewrote committed files: a review pass on 2026-08-10
// dirtied 18 of them simply by running this gate. Two sibling gates were moved
// onto `evidenceDir()` in July and these three were missed. Output now defaults
// to the gitignored scratch tree; set FS_WRITE_EVIDENCE=1 to regenerate the
// committed evidence on purpose, which is the opt-in the convention allows.
// social_string_conformance.mjs — ITEM C, social string implementation
// (2026-07-14b, Fable's wording ruling).
//
// Asserts the exact social-mode strings for the two prohibited-term modes
// (bonus, super) and the two other reworded blurbs (cruise, overboost)
// render correctly in both FeatureMenu.svelte and PaytableModal.svelte's Bet
// Modes section, and that real-money mode carries no leftover "Buy"/"Debits"
// text. Captures before (real-money) / after (social) screenshots of both
// consumers as proofs.
//
// RUNNER (documented per TR-123, 2026-08-11): npx tsx, from frontend/.
//   npx tsx scripts/social_string_conformance.mjs               the real run
//   npx tsx scripts/social_string_conformance.mjs --self-test   convention (p)
//
// EXIT SEMANTICS (TR-123): exit 0 on PASS, non-zero on FAIL, and the process
// TERMINATES. The vite child is spawned detached and killed as a process
// group, and the final exit is explicit; this gate used to set exitCode and
// then hang on the vite grandchild's inherited pipes (the R043 closure
// suite's lingering-handle observation).
//
// The --self-test re-invokes this gate in a child with FS_SEED_VIOLATION=1,
// which plants the word Buy inside the social feature menu cards (the exact
// class this gate catches, a prohibited real-money term on a social surface
// it reads), and demands the red verdict, the named failing check AND a real
// non-zero exit within a timeout, so a reintroduced hang fails the self-test
// rather than hanging a CI leg.

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
// R043 PHASE 7 closure suite: this import named `announceEvidenceTarget`,
// which evidencePaths.mjs has never exported, so the module threw at load
// and this gate could not even print FAIL. Same class as the
// locale_prose_conformance repair earlier in R043 (fresh-context majors 1
// and 58); found here because the closure suite runs every gate, wired or
// not.
import { evidenceDir } from './lib/evidencePaths.mjs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn, spawnSync } from 'node:child_process'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const SEED = process.env.FS_SEED_VIOLATION === '1'
const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = evidenceDir('reports', 'qa')
const SCREENS_DIR = evidenceDir('reports', 'screens', 'social-strings-item-c')

const EXPECTED_SOCIAL = {
  bonus: { label: 'Get Overdrive', blurb: 'Get a guaranteed Overdrive Free Spins entry.' },
  super: { blurb: 'Get a rich entry with the Overdrive meter pre-revved to 5×.' },
  // CONFORMED 2026-08-15 (R071 TASK 5). The old "Double-chance" wording is
  // retired estate-wide by the owner's ruling; the social blurb now tracks the
  // master and differs from it only in the one prohibited word. Pinning the
  // superseded text here would have made this gate defend the thing the ruling
  // removed, which is how a gate turns into an obstacle.
  overboost: { blurb: 'Raises the feature trigger rate to about 1.6× Normal. Costs 1.25× every spin while ON.' },
  cruise: { blurb: 'A smoother ride: more frequent smaller prizes, same 96.35% RTP.' },
}
const PROHIBITED_TERMS = ['Buy', 'Debits']

async function getFreePort() {
  return new Promise((resolvePromise, reject) => {
    const srv = createServer()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolvePromise(port))
    })
  })
}

function startDevServer(port) {
  return new Promise((resolvePreview, reject) => {
    // detached so teardown can kill the whole process group; the npx wrapper
    // is not the server (TR-123).
    const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], {
      cwd: join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    })
    let resolved = false
    const onData = (d) => {
      const s = d.toString()
      if (!resolved && (/Local/.test(s) || new RegExp(`localhost:${port}`).test(s))) {
        resolved = true
        resolvePreview(proc)
      }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', reject)
    setTimeout(() => { if (!resolved) reject(new Error('vite dev server did not start in time')) }, 15000)
  })
}

async function openFeatureMenu(page) {
  await page.locator('[data-testid="feature-menu-button"]').click()
  await page.waitForSelector('[data-testid="feature-menu-cards"]', { timeout: 10000 })
  await page.waitForTimeout(150)
}

// The section heading is social-aware since Fable ruling 3 (2026-07-26): the
// word "bet" is on the stake.us prohibited-terms table, so PaytableModal renders
// "Play Modes" when social and "Bet Modes" otherwise. This helper is called in
// BOTH modes, so it must not pin itself to either spelling - doing so is exactly
// the stale-selector class that broke six scripts in Round 3.
async function openPaytableBetModes(page, social) {
  await page.locator('button.fs-menu').click()
  await page.locator('.hud-menu-item').first().click()
  await page.waitForSelector('[data-testid="interface-guide"]', { timeout: 10000 })
  const heading = page.locator('h3.fs-heading', {
    hasText: social ? 'Play Modes' : 'Bet Modes',
  })
  await heading.waitFor({ timeout: 10000 })
  await heading.scrollIntoViewIfNeeded()
  await page.waitForTimeout(150)
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const baseUrl = `http://localhost:${port}`
  const results = {}

  try {
    const browser = await chromium.launch()

    for (const social of [false, true]) {
      const label = social ? 'social' : 'real-money'
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      const consoleErrors = []
      page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
      page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

      const url = social ? `${baseUrl}/?social=true` : baseUrl
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
      await dismissIntro(page)

      // FeatureMenu
      await openFeatureMenu(page)
      if (SEED && social) {
        // Convention (p): the exact defect class, a prohibited real-money term
        // rendered inside a social surface this gate reads.
        await page.evaluate(() => {
          const cards = document.querySelector('[data-testid="feature-menu-cards"]')
          if (cards) {
            const s = document.createElement('span')
            s.textContent = 'Buy'
            cards.appendChild(s)
          }
        })
      }
      await page.screenshot({ path: join(SCREENS_DIR, `feature-menu-${label}.png`) })
      const featureMenuText = await page.locator('[data-testid="feature-menu-cards"]').innerText()
      await page.keyboard.press('Escape').catch(() => {})

      // PaytableModal Bet Modes section
      await openPaytableBetModes(page, social)
      await page.screenshot({ path: join(SCREENS_DIR, `bet-modes-${label}.png`) })
      // Same social-aware heading as openPaytableBetModes - see its comment.
      const paytableText = await page
        .locator('h3.fs-heading', { hasText: social ? 'Play Modes' : 'Bet Modes' })
        .locator('xpath=following-sibling::div[1]').innerText()

      results[label] = { featureMenuText, paytableText, consoleErrorCount: consoleErrors.length }
      await page.close()
    }

    await browser.close()
  } finally {
    try { process.kill(-server.pid, 'SIGTERM') } catch {}
  }

  const checks = {}
  const combinedSocialText = results.social.featureMenuText + '\n' + results.social.paytableText
  const combinedRealText = results['real-money'].featureMenuText + '\n' + results['real-money'].paytableText

  for (const [mode, expected] of Object.entries(EXPECTED_SOCIAL)) {
    if (expected.label) {
      checks[`${mode}.socialLabel`] = { expected: expected.label, pass: combinedSocialText.includes(expected.label) }
    }
    checks[`${mode}.socialBlurb`] = { expected: expected.blurb, pass: combinedSocialText.includes(expected.blurb) }
  }
  // Real-money strings must be genuinely UNCHANGED, not just "not regressed" -
  // assert the original prohibited-term-containing text still renders as-is
  // in real-money mode (catches an accidental edit to the base strings while
  // adding social variants, not just a missing social override).
  checks['realMoney.bonusLabelUnchanged'] = { pass: combinedRealText.includes('Buy Overdrive') }
  checks['realMoney.overboostBlurbUnchanged'] = { pass: combinedRealText.includes('Debits 1.25× every spin while ON') }
  // Prohibited terms must NOT appear anywhere in the social-mode render.
  for (const term of PROHIBITED_TERMS) {
    const found = new RegExp(`\\b${term}\\b`).test(combinedSocialText)
    checks[`social.no_${term}`] = { pass: !found }
  }
  checks.zeroConsoleErrors = {
    pass: results['real-money'].consoleErrorCount === 0 && results.social.consoleErrorCount === 0,
  }

  const allPass = Object.values(checks).every((c) => c.pass)
  const output = { results, checks, allPass }
  const outPath = join(OUT_DIR, 'social_string_conformance_2026-07-14b.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(JSON.stringify(checks, null, 2))
  console.log(`\nResults written to ${outPath}`)

  if (!allPass) {
    console.error('SOCIAL STRING CONFORMANCE: FAILURES DETECTED')
    for (const [k, v] of Object.entries(checks)) if (!v.pass) console.error(`  FAIL ${k}`)
    process.exit(1)
  }
  console.log('SOCIAL STRING CONFORMANCE: ALL CHECKS PASS')
  process.exit(0)
}

// ── self-test, convention (p): seeded red AND the exit contract ──────────────
if (process.argv.includes('--self-test')) {
  const r = spawnSync('npx', ['tsx', fileURLToPath(import.meta.url)], {
    cwd: join(__dirname, '..'),
    env: { ...process.env, FS_SEED_VIOLATION: '1' },
    encoding: 'utf-8',
    timeout: 480_000,
  })
  const out = (r.stdout || '') + (r.stderr || '')
  const red = /SOCIAL STRING CONFORMANCE: FAILURES DETECTED/.test(out)
  const named = /FAIL social\.no_Buy/.test(out)
  const exited = typeof r.status === 'number' && r.status !== 0
  console.log(`  ${red ? 'caught ' : 'MISSED '} seeded Buy in the social feature menu turned the gate red`)
  console.log(`  ${named ? 'named  ' : 'UNNAMED'} the failing check is social.no_Buy, so the red is the seed and not a coverage accident`)
  console.log(`  ${exited ? 'exited ' : 'HUNG   '} the failing invocation exited non-zero (status ${r.status}${r.signal ? ', signal ' + r.signal : ''})`)
  if (!red || !named || !exited) {
    console.error('\nSOCIAL STRING CONFORMANCE SELF-TEST: FAIL')
    process.exit(1)
  }
  console.log('\nSOCIAL STRING CONFORMANCE SELF-TEST: PASS (seeded violation red, named check, non-zero exit, terminated)')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
