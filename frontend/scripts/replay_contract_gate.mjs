// replay_contract_gate.mjs
//
// M01 of Session 3's proof-mechanism survey. ELEVEN platform requirements had no
// proof path that would fail if someone broke them, and all eleven are properties
// of ONE observable: what the shipped bundle DOES when it is loaded at a replay
// URL. So they are one gate, not eleven.
//
// Covers REQ-077, 079, 080, 083, 085, 090, 091, 094, 098, 099 and 132.
// Register: reports/qa/session3/MECHANISMS.md, mechanism M01.
//
// WHY A NEW GATE RATHER THAN WIRING THE EXISTING PROOF
// ----------------------------------------------------
// `replay_blocker_proof.mjs` drives the same surface and is a good proof of a
// different thing: TR-076, the backdrop that intercepted the START REPLAY click.
// It CANNOT prove the contract, and the reason is exact and worth keeping:
//
//     await page.route('**/bet/replay/**', ...)          <-- its only interception
//
// A glob fulfils ANY segment order. Swap `${p.mode}` for the literal 'base' in
// replayService.ts and that proof stays GREEN, because the request still matches
// `**/bet/replay/**`. Transpose game and version: still green. So a self-test
// seeded against that harness would seed a defect the instrument happens to
// handle, which is precisely the trap convention (p) names and precisely how the
// dash gate failed twice.
//
// This gate therefore captures every request with `page.on('request')` and
// asserts the URL CHARACTER FOR CHARACTER against the shape composed from the
// query string. The route interception stays, because we must not call the real
// RGS, but interception is no longer the instrument.
//
// THE SEEDS, and where they are planted
// -------------------------------------
// Convention (p) says plant the defect IN THE FORM IT REALLY TAKES. The form
// these defects really take is a wrong string in the SHIPPED BUNDLE, so that is
// where they are planted: the gate serves dist from memory and the self-test
// serves a byte-patched copy. The minifier preserves the template well enough to
// target it:
//
//     bet/replay/${a.game}/${a.version}/${a.mode}/${a.event}
//
// A seed that patched only the running page's `fetch` would prove the matcher
// works against a simulated observable. Patching the served artefact proves it
// works against the artefact that actually ships, which is a stronger claim and
// costs nothing extra.
//
// WHAT IS SEEDED AT THE OBSERVATION BOUNDARY INSTEAD, and why that is declared
// ---------------------------------------------------------------------------
// Two seeds are injected into the served `index.html` rather than into the
// bundle: the leaked authenticated call, and the suppressed lifecycle branch.
// Minified Svelte template branches are not safely targetable by string
// replacement, and a seed that silently failed to apply would be worse than no
// seed, because it would print PASS. Both reproduce the defect's OBSERVABLE
// exactly (a wallet request on the wire; a fetch window with no status element),
// which is what this gate reads. Stated here rather than left to be discovered,
// per FULL_AUDIT_METHOD.md 2.6: a parked limitation is only honestly parked if
// its enumeration is honest.
//
// A SEED IS SCORED IN THREE CLASSES, NOT TWO (added 2026-07-30)
// ---------------------------------------------------------------------------
// CAUGHT, MISSED, and UNAPPLIED. The third exists because the first two could
// not tell each other apart when a seed's target string was absent: the server
// answered 500, the app never booted, every assertion in the run failed, and
// the seed scored CAUGHT on a defect that had never been planted. **A seed that
// never applied was indistinguishable from a seed that worked.**
//
// That is convention (p)'s own failure mode occurring inside the mechanism
// built to enforce it. **CORRECTED 2026-07-31**, because the original wording
// here overstated it twice and a header is read as fact: it was NOT a full house
// either way (replayed against the pre-fix code, three of the six seeds then
// present would have printed MISSED and exited 1, since the failing assertion
// names with a dead app do not match their expectations), and a bundle RENAME is
// the one case `findBundleWithTemplate` below is explicitly built to survive.
// The real trigger is narrower: an inner patch regex that stops matching after a
// minifier or markup change. An UNAPPLIED seed now exits
// 3, distinct from 1 (a real miss) and 2 (the template locator failed), because
// the fixes differ: a miss means the gate is blind, an unapplied means its
// score is UNKNOWN and re-running changes nothing until the locator is fixed.
//
// Usage, from frontend/, after `npm run build`:
//   node scripts/replay_contract_gate.mjs              the contract assertions
//   node scripts/replay_contract_gate.mjs --self-test  convention (p): seeds must go RED
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { evidenceDir } from './lib/evidencePaths.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const DIST = join(HERE, '..', 'dist')
const SELF_TEST = process.argv.includes('--self-test')

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('REPLAY CONTRACT GATE: no build at frontend/dist. Run `npm run build` first.')
  process.exit(2)
}

const FIX = JSON.parse(readFileSync(
  join(HERE, '..', 'src', 'lib', 'services', '__fixtures__', 'replay_rounds.json'), 'utf8'))

// R053: THE REAL PAYLOAD, captured from the live replay endpoint on the
// published entry (event 83776, base mode) and committed verbatim. Its
// envelope is `{payoutMultiplier, costMultiplier, state: RawEvent[]}`, with
// `state` AS the event array, which is NOT the invented `{state:{events}}`
// shape every stub in this gate had encoded; that encoding is exactly why
// this gate stayed green while the portal replay showed a startup grid.
// The stub parts are kept (the reader accepts both shapes, and they double
// as wallet-shape coverage); the part and seed below run against reality.
const REAL_FIXTURE = JSON.parse(readFileSync(
  join(HERE, '..', '..', 'docs', 'stake-engine-live', 'captures', '2026-08-12_replay_base_83776.json'), 'utf8'))
const REAL_REVEAL = REAL_FIXTURE.state.find((e) => e.type === 'reveal')
// The book board is padded one row top and bottom; the visible window is
// rows 1 to 4 of each six-row column (the padded-board lesson recorded in
// CLAUDE.md convention (l)'s worked example).
const REAL_EXPECT_BOARD = REAL_REVEAL.board.map((col) => col.slice(1, 5).map((c) => String(c.name).toUpperCase()))

// ---------------------------------------------------------------------------
// The replay URL under test. Every value is DISTINCTIVE on purpose: a gate whose
// fixture reuses a default cannot tell a value that was read from a value that
// was hardcoded. `mode` especially: the shipped default is 'base', so a fixture
// using 'base' would be green against the exact defect this gate exists to catch.
// ---------------------------------------------------------------------------
const P = {
  game: '0e872280-c94a-4bcf-a55b-b649c4a02fc0',
  version: '1',
  mode: 'super',
  event: '22975',
  rgsHost: 'rgs.stake-engine.com',
  currency: 'EUR',
  amountMicros: '10000000',
  lang: 'en',
  social: 'false',
}
const REPLAY_QS = (o = {}) => {
  const p = { ...P, ...o }
  return `replay=true&game=${p.game}&version=${p.version}&mode=${p.mode}&event=${p.event}`
    + `&rgs_url=${p.rgsHost}&currency=${p.currency}&amount=${p.amountMicros}`
    + `&lang=${p.lang}&device=desktop&social=${p.social}`
}
// The one request the page is permitted to make off-origin, composed from the
// query values above rather than written out, so the expectation and the input
// cannot drift apart.
const EXPECTED_URL = (o = {}) => {
  const p = { ...P, ...o }
  return `https://${p.rgsHost}/bet/replay/${p.game}/${p.version}/${p.mode}/${p.event}`
}

// Any request whose path looks like an authenticated RGS route. This is the
// REQ-094 and REQ-099 assertion: replay is a public, session-free surface, and a
// single call on any of these means a replay URL has touched the money path.
const AUTHED_ROUTE = /\/(authenticate|play|end-?round|wallet|balance|bet\/(?!replay))/i

const PORT = 4519
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webp': 'image/webp',
}

// The one bundle file that carries the replay URL template, found rather than
// hardcoded so a rebuild with a new content hash does not silently disable the
// seeds. A seed that cannot find its target must be a hard error, never a skip.
function findBundleWithTemplate() {
  const dir = join(DIST, 'assets')
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.js'))) {
    const body = readFileSync(join(dir, f), 'utf8')
    if (body.includes('bet/replay/')) return { file: `/assets/${f}`, body }
  }
  return null
}

// UNAPPLIED SEED TARGETS, recorded rather than only signalled down the wire.
//
// THE HOLE THIS CLOSES, and it made every seed score unreliable. A seed whose
// target string was absent used to produce only an HTTP 500. A 500 on the bundle
// means the app never boots, so every assertion in the seeded run fails, so
// `caught` came out TRUE and the seed printed `caught`. **A seed that never
// applied was indistinguishable from a seed that worked**, and the gate read
// 6/6 either way.
//
// That is the exact failure convention (p) exists to prevent, reproduced inside
// the mechanism built to enforce it.
//
// TWO CORRECTIONS TO THE PARAGRAPH ABOVE, made 2026-07-31 after a post-session
// audit measured it, because the original overstated the defect in a file that
// will be read as fact.
//
// 1. NOT 6/6 EITHER WAY. It depended on WHICH seed lost its target. Replayed
//    against the pre-fix code, three of the six seeds then present would have
//    printed MISSED and exited 1, because with the app dead the only failing
//    assertion names are the request checks, and hardcoded-mode,
//    transposed-segments and leaked-authenticated-call do not match those. The
//    silent-CAUGHT direction was real for the other three.
// 2. NOT A BUNDLE RENAME. findBundleWithTemplate below content-searches
//    dist/assets for the template every run precisely so a rename cannot
//    disable a seed, and the comment above it says so. The real trigger is
//    narrower: an inner patch regex that stops matching after a minifier or
//    markup change. No instance has been shown to have occurred.
//
// So the miss is now RECORDED, and a recorded miss is its own failure class.
// The 500 is kept because it is still the right thing to put on the wire; what
// was missing was the evidence that it happened.
const seedTargetMisses = []

/**
 * Serve dist, optionally with byte patches applied to named files.
 * `patches` is { '<url path>': (body) => newBody }.
 */
function serve(patches = {}) {
  const srv = createServer((req, res) => {
    let p = req.url.split('?')[0]
    if (p === '/') p = '/index.html'
    const f = join(DIST, decodeURIComponent(p))
    if (!existsSync(f) || f.endsWith('/')) { res.writeHead(404); res.end('not found'); return }
    let body = readFileSync(f)
    if (patches[p]) {
      const patched = patches[p](body.toString('utf8'))
      if (patched === null) {
        // The seed's target string was not found. Record it as its own failure
        // class, then fail loudly on the wire. Recording is the half that
        // matters: the 500 alone read as a caught seed.
        seedTargetMisses.push({ path: p, at: new Date().toISOString() })
        res.writeHead(500); res.end('SEED TARGET NOT FOUND'); return
      }
      body = Buffer.from(patched, 'utf8')
    }
    res.writeHead(200, { 'content-type': MIME[extname(f)] ?? 'application/octet-stream' })
    res.end(body)
  })
  return new Promise((r) => srv.listen(PORT, () => r(srv)))
}

/**
 * Drive one replay session and return everything observed.
 * `respond` decides what the intercepted RGS call does: fulfil, delay, fail.
 */
async function driveReplay(browser, {
  qs = {}, patches = {}, respond = 'ok', round = FIX.super.cap, costMultiplier = 400.0,
  settleMs = 2500, play = false, keys = false,
  // R056 TASK 5. `feature` clicks the entry continue gate a feature replay
  // presents (the same click the owner makes; a DOM-level click, because the
  // button animates and Playwright's stability wait spins on it forever, the
  // R043 behavioural-leg lesson). `playTimeoutMs` extends the settle wait for
  // feature rounds, which play a full free-spins sequence before the end
  // banner. `viewport` drives the three reference sizes. `frame` saves a
  // settled screenshot to that path.
  feature = false, playTimeoutMs = 25000, viewport = { width: 1280, height: 720 }, frame = null,
} = {}) {
  // Snapshot the miss ledger so this drive reports only its OWN unapplied
  // targets. Drives are strictly sequential, so an index is sufficient.
  const missMark = seedTargetMisses.length
  const srv = await serve(patches)
  const page = await browser.newPage({ viewport })
  const requests = []
  page.on('request', (r) => {
    requests.push({ url: r.url(), method: r.method(), headers: r.headers(), resourceType: r.resourceType() })
  })

  // Intercept everything that is NOT our local origin, so a stray call to any
  // third party is captured and neutralised rather than escaping to the network.
  await page.route(/^(?!http:\/\/localhost:4519).*/, async (route) => {
    const url = route.request().url()
    if (!url.includes('/bet/replay/')) { await route.abort(); return }
    if (respond === 'abort') { await route.abort('failed'); return }
    if (respond === '404') { await route.fulfill({ status: 404, contentType: 'text/plain', body: 'not found' }); return }
    if (respond === '500') { await route.fulfill({ status: 500, contentType: 'text/plain', body: 'server error' }); return }
    if (respond === 'hang') { await new Promise((r) => setTimeout(r, 30000)); await route.abort(); return }
    if (respond === 'real') {
      // R053: the captured live payload, byte-shaped as the platform sends it
      // (state IS the array). Nothing invented.
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(REAL_FIXTURE) })
      return
    }
    // R056: the envelope's payoutMultiplier is a PLAIN bet-multiple, per the
    // platform's own bytes: the real capture carries payoutMultiplier 0.41
    // beside setTotalWin/finalWin events of 41 CENTIBETS, so envelope = book
    // centibets / 100. The fixture rounds store the book value (centibets),
    // and this wrapper used to pass it through raw, inflating every stub
    // envelope 100x against reality: the same invented-stub drift class the
    // R053 row records, invisible only because no assertion read the amount.
    // FIX.super.cap at 500000 centibets normalises to exactly 5000, the
    // WINCAP boundary, so the cap flow is unchanged.
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        payoutMultiplier: round.payoutMultiplier / 100,
        costMultiplier,
        state: { events: round.events },
      }),
    })
  })

  await page.goto(`http://localhost:${PORT}/?${REPLAY_QS(qs)}`, { waitUntil: 'domcontentloaded' })
  // Deliberately NO interaction here. REQ-085 is that the fetch is issued on
  // load, so the absence of a click is the assertion, not an omission.
  const observed = {}
  observed.loadingSeenBeforeSettle = await page.locator('.replay-status.loading')
    .waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false)
  await page.waitForTimeout(settleMs)
  observed.errorVisible = await page.locator('.replay-status.error').isVisible().catch(() => false)
  observed.errorText = observed.errorVisible
    ? (await page.locator('.replay-status.error').innerText().catch(() => '')).trim() : ''
  observed.startVisible = await page.locator('.start-replay').isVisible().catch(() => false)
  observed.startText = observed.startVisible
    ? (await page.locator('.start-replay').innerText().catch(() => '')).replace(/\s+/g, ' ').trim() : ''
  // The bet cost and applied multiplier. Read from `.replay-figures` rather than
  // from the start button, because S2-C006 moved them OUT of the button on
  // purpose: inside it they existed only in the ready phase.
  observed.figuresVisible = await page.locator('.replay-figures').isVisible().catch(() => false)
  observed.figuresText = observed.figuresVisible
    ? (await page.locator('.replay-figures').innerText().catch(() => '')).replace(/\s+/g, ' ').trim() : ''
  // S2-C009. The label switches to Token in social mode, because "currency" is
  // itself on the stake.us prohibited-terms table.
  observed.currencyVisible = await page.locator('.currency-display').isVisible().catch(() => false)
  observed.currencyText = observed.currencyVisible
    ? (await page.locator('.currency-display').innerText().catch(() => '')).replace(/\s+/g, ' ').trim() : ''
  observed.bodyText = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').trim()

  // Playing the round is OPT IN, because the default session must stay
  // interaction-free: REQ-085 asserts the fetch needs no click, and a driver
  // that clicked before observing could not tell the two apart.
  if (play && observed.startVisible) {
    await page.locator('.start-replay').click({ timeout: 5000 }).catch(() => {})
    if (feature) {
      // The entry continue gate, clicked at DOM level (see the option note).
      await page.locator('[data-testid=entry-continue]').waitFor({ timeout: 20000 }).catch(() => {})
      await page.evaluate(() => document.querySelector('[data-testid=entry-continue]')?.click()).catch(() => {})
    }
    await page.locator('.play-again').waitFor({ timeout: playTimeoutMs }).catch(() => {})
    // R053: the rendered grid, read as SYMBOL NAMES per column from the
    // visible cells' image sources (h1_base normalises to H1; every other
    // symbol ships under its own stem). Read after play-again appears, when
    // the round's final board is settled on screen.
    observed.boardNames = await page.evaluate(() => {
      // STRUCTURAL grouping, not geometric: the grid renders one .reel-strip
      // per column with data-col (GameGrid.svelte:1133), so column membership
      // is read from the DOM rather than inferred from x positions, which
      // win-presentation transforms jitter. Within a strip the settled
      // visible window is the cells inside the strip's own clip box.
      const strips = [...document.querySelectorAll('.reel-strip[data-col]')]
        .sort((a, b) => Number(a.dataset.col) - Number(b.dataset.col))
      // Filename stems map back to book names through the same table the
      // component writes them from (GameGrid.svelte _symNameMap): wild -> W,
      // scatter -> S, h1_base -> H1, the rest are their own upper-cased stem.
      const stem = (src) => {
        const m = (src || '').match(/symbols\/([^/]+)\.png/)
        if (!m) return null
        const s = m[1].toUpperCase().replace(/_BASE$/, '')
        return s === 'WILD' ? 'W' : s === 'SCATTER' ? 'S' : s
      }
      return strips.map((strip) => {
        const clip = (strip.parentElement || strip).getBoundingClientRect()
        return [...strip.querySelectorAll('img.symbol-img')]
          .map((el) => ({ src: el.getAttribute('src') || '', r: el.getBoundingClientRect() }))
          .filter((x) => x.r.height > 4 && x.r.top >= clip.top - x.r.height / 2 && x.r.bottom <= clip.bottom + x.r.height / 2)
          .sort((a, b) => a.r.top - b.r.top)
          .map((c) => stem(c.src))
      })
    })
    observed.finalWin = (await page.locator('.win-area').innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
    // R056 TASK 5: WinDisplay's count-up eases over 600ms, so the SETTLED
    // money strings are read after it, separately from the immediate read
    // above (which existing assertions depend on and which stays put).
    await page.waitForTimeout(900)
    observed.settledWinText = (await page.locator('.win-area').innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
    observed.podText = (await page.locator('.win-pod').innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
    observed.podActive = await page.locator('.win-pod:not(.idle)').isVisible().catch(() => false)
    // THE STATE THE PLATFORM ACTUALLY ASKS ABOUT. Everything above is read in
    // the ready phase, which is the phase that was already compliant. These two
    // are read AFTER the round has played out, which is where item 50 was
    // satisfied by nothing at all before S2-C006.
    observed.figuresAfterPlay = await page.locator('.replay-figures').isVisible().catch(() => false)
    observed.figuresTextAfterPlay = observed.figuresAfterPlay
      ? (await page.locator('.replay-figures').innerText().catch(() => '')).replace(/\s+/g, ' ').trim() : ''
    // OCCLUSION, which isVisible() does NOT test. Playwright calls an element
    // visible when it has a non-empty box and is not display:none, so a figures
    // row sitting under a full-viewport splash reads as visible. Added
    // 2026-07-31 after an audit measured exactly that: with the old cap fixture
    // the element was covered by the max-win overlay and the assertion passed.
    observed.figuresOccludedBy = await page.evaluate(() => {
      const el = document.querySelector('.replay-figures')
      if (!el) return 'absent'
      // SCROLL IT INTO VIEW FIRST, then ask what is on top of it. The first
      // version of this check did not, and reported "off-viewport" on a page
      // that now scrolls, which is a normal reachable state rather than a
      // defect. Being scrolled past and being COVERED are different failures
      // and only the second is what this assertion is for.
      el.scrollIntoView({ block: 'center' })
      const r = el.getBoundingClientRect()
      if (r.bottom <= 0 || r.top >= document.documentElement.clientHeight) return 'unreachable-by-scroll'
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      if (!hit) return null
      return (hit === el || el.contains(hit) || hit.contains(el)) ? null : (hit.className || hit.tagName)
    }).catch(() => null)

    // S2-C008. THE KEYBOARD LEG, and it is OPT IN for the same reason `play` is.
    //
    // The defect this exists for is measured and shipped, recorded at
    // App.svelte:1373-1384: SPACE or ENTER on a focused button is activated by
    // the BROWSER, and App.svelte's own keydown handler cannot prevent it
    // because every one of its guards returns BEFORE it reaches
    // e.preventDefault(). max_win_hold_gate.mjs found exactly that shape by
    // focusing the SPIN button mid-hold and pressing SPACE then ENTER: it
    // recorded one /wallet/play and one /wallet/end-round during the hold.
    //
    // So the press is aimed at a FOCUSED CONTROL rather than at the document,
    // because native activation of a focused button is the mechanism, and a
    // press with nothing focused would be seeding a form that does not ship.
    //
    // WHY NOT IN THE DEFAULT DRIVE, which is what the row's wording implies:
    // two live assertions read this same log and both would become false.
    // `exactly one replay request` and REQ-085's `fetch is issued with no
    // interaction` are true only of an untouched session, and REQ-085's whole
    // point is that the ABSENCE of a click is the assertion. A keyboard leg in
    // the default drive would quietly convert that proof into a lie, so the
    // interacted session is a SEPARATE drive with the money-path predicate run
    // over it on its own.
    if (keys) {
      const target = page.locator('.play-again').or(page.locator('.start-replay')).first()
      await target.focus({ timeout: 5000 }).catch(() => {})
      await page.keyboard.press('Space')
      await page.waitForTimeout(400)
      await page.keyboard.press('Enter')
      // Settle long enough for a provoked request to reach the wire. A press
      // that put money on the wire and a press that did nothing are
      // indistinguishable until the network has had time to show it.
      await page.waitForTimeout(1500)
    }
  }

  // R056 TASK 5: the viewport-fit numbers, read on every drive because the
  // requirement is phase-independent (the overflow TR-065 taught this gate
  // about appeared only AFTER play, which is exactly when the old fit gate
  // stopped looking).
  observed.overflow = await page.evaluate(() => ({
    docW: document.documentElement.scrollWidth,
    docH: document.documentElement.scrollHeight,
    winW: window.innerWidth,
    winH: window.innerHeight,
  }))
  if (frame) await page.screenshot({ path: frame }).catch(() => {})

  await page.close()
  await new Promise((r) => srv.close(r))
  return { requests, observed, unapplied: seedTargetMisses.slice(missMark) }
}

const offOrigin = (reqs) => reqs.filter((r) => !r.url.startsWith(`http://localhost:${PORT}`))

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------
const results = []
const ok = (name, note) => { results.push({ name, pass: true, note }); console.log(`  pass  ${name}${note ? ': ' + note : ''}`) }
const bad = (name, why) => { results.push({ name, pass: false, why }); console.log(`  FAIL  ${name}: ${why}`) }
const check = (cond, name, note, why) => (cond ? ok(name, note) : bad(name, why))

/**
 * REQ-094, REQ-099: replay never touches the money path.
 *
 * EXTRACTED for S2-C008 so it can run over a drive that assertContract must not
 * be run over. An interacted session breaks two of assertContract's other
 * assertions by design (`exactly one replay request` and REQ-085's `issued with
 * no interaction`), but the money-path rule holds on EVERY session, touched or
 * not, and is the only one that does. Keeping it as one predicate called from
 * both places means the keyboard leg is judged by the same rule as the boot, so
 * there is no second statement of the rule to drift.
 */
function assertNoMoneyPath(off, pre = '') {
  const authed = off.filter((r) => AUTHED_ROUTE.test(new URL(r.url).pathname))
  check(authed.length === 0, `${pre}no authenticated RGS call in replay`,
    'no authenticate, play, end-round, wallet or balance request',
    `replay issued ${authed.length} authenticated call(s): ${authed.map((r) => r.url).join(', ')}`)
  return authed
}

/** The contract, asserted against one healthy session. Returns pass/fail counts. */
function assertContract({ requests, observed }, label = '') {
  const pre = label ? label + ' ' : ''
  const off = offOrigin(requests)
  const replayCalls = off.filter((r) => r.url.includes('/bet/replay/'))

  // REQ-080, REQ-083, REQ-090: exactly one off-origin call, at the exact shape,
  // composed from the query values rather than from defaults.
  check(replayCalls.length === 1, `${pre}exactly one replay request`,
    `1 request to ${P.rgsHost}`,
    `expected exactly 1 replay request, saw ${replayCalls.length}`)
  const call = replayCalls[0]
  if (call) {
    check(call.url === EXPECTED_URL(), `${pre}replay URL is exact`,
      call.url,
      `URL does not match the shape composed from the query string.\n        expected ${EXPECTED_URL()}\n        actual   ${call.url}`)
    check(call.method === 'GET', `${pre}replay request is a GET`, call.method,
      `expected GET, got ${call.method}`)

    // REQ-079: no session, no authorisation. A shared public URL must work for
    // anyone, so anything that could carry identity is a violation.
    const h = call.headers ?? {}
    const authish = Object.keys(h).filter((k) => /^(authorization|cookie|x-session|x-auth|x-token)/i.test(k))
    check(authish.length === 0, `${pre}no authorisation material on the replay request`,
      'no Authorization, Cookie or session header',
      `carries ${authish.join(', ')}`)
    const qsInUrl = call.url.includes('?')
    check(!qsInUrl, `${pre}no session or token query parameter`,
      'path only, no query string',
      `the replay URL carries a query string: ${call.url.split('?')[1]}`)
  }

  // REQ-085: issued on load. No interaction was performed before observation,
  // so a captured request is proof it needed none.
  check(!!call, `${pre}fetch is issued with no interaction`,
    'request observed after navigation with no click',
    'no replay request was issued without interaction')

  // REQ-094, REQ-099: replay never touches the money path.
  assertNoMoneyPath(off, pre)

  return { call, off }
}

// ---------------------------------------------------------------------------
async function main() {
  const bundle = findBundleWithTemplate()
  if (!bundle) {
    console.error('REPLAY CONTRACT GATE: could not find the replay URL template in any dist bundle.')
    console.error('The minifier output may have changed shape. The seeds cannot be planted, so this')
    console.error('gate cannot honestly claim a PASS. Fix the locator rather than skipping the seeds.')
    process.exit(2)
  }
  console.log(`REPLAY CONTRACT GATE${SELF_TEST ? ' SELF-TEST' : ''}`)
  console.log(`  template carrier: ${bundle.file}`)

  const browser = await chromium.launch()
  try {
    // Extracted so the SEED can run the same assertion. A check that lives only
    // in the real-run branch cannot be seeded, and an unseedable assertion is
    // exactly what convention (p) says does not count.
    // R053, extracted so the SEED runs the same assertion (the gate's own
    // rule: an unseedable assertion does not count).
    const assertRealFixtureBoard = (r, tag = '') => {
      check(!r.observed.errorVisible,
        `${tag}real fixture: the captured live payload loads without an error state`,
        'ready and playback reached',
        `error state rendered: "${r.observed.errorText.split('\n')[0]}" (the reader refused the real envelope)`)
      const rendered = (r.observed.boardNames || []).map((col) => col.join(','))
      const expected = REAL_EXPECT_BOARD.map((col) => col.join(','))
      check(rendered.length === expected.length && rendered.every((c, i) => c === expected[i]),
        `${tag}real fixture: the rendered board equals the round's book board`,
        `5 columns settled as ${JSON.stringify(rendered)}`,
        `rendered ${JSON.stringify(rendered)} against the fixture's ${JSON.stringify(expected)}; `
          + 'a startup grid here is the exact defect the owner reported on the portal')
    }

    const assertFlatMultiplier = (r, tag = '') => {
      const txt = r.observed.figuresText.replace(/\s+/g, ' ').trim()
      check(/×\s*1\b/.test(txt),
        `${tag}the applied multiplier is displayed at 1.0x (guideline item 50)`,
        `base-mode replay renders "${txt}"`,
        `a 1.0x replay rendered no multiplier: "${txt}". The platform shows `
          + '"Cost multiplier x1.00" beside this, so suppressing it fails an item we otherwise meet')
    }

    // S2-C009. The social leg. The source has rendered Token rather than
    // Currency in social mode since 2026-07-25 and NOTHING ASSERTED IT, which is
    // precisely the state convention (p) calls an unverified claim: a
    // requirement that is met today and held by nobody tomorrow.
    //
    // "currency" is on the stake.us prohibited-terms table, so this is a
    // jurisdiction requirement rather than a wording preference, and the failure
    // is silent: a social player would simply be shown a word we are not
    // permitted to show them.
    const assertSocialToken = (r, tag = '') => {
      const txt = r.observed.currencyText.replace(/\s+/g, ' ').trim()
      check(/\bToken\b/.test(txt) && !/\bcurrenc(y|ies)\b/i.test(txt),
        `${tag}social mode labels the value Token, never Currency (stake.us prohibited terms)`,
        `social replay renders "${txt}"`,
        `a social replay rendered "${txt}". The word "currency" is on the stake.us `
          + 'prohibited-terms table, so this is a jurisdiction failure, not a wording choice')
    }

    // R056 TASK 5. The FEATURE COMPLETE pod must equal the ENVELOPE payout.
    // ReplayMode sets winAmount from response.payoutMultiplier x amount, so
    // the expected strings are computed HERE from the same round data the
    // stub serves, never read back from the surface under test: an assertion
    // that reads its expectation from the thing it checks proves only
    // self-equality. The envelope multiplier is the round's centibets / 100,
    // the platform semantic the capture pins (0.41 beside 41-centibet events).
    const FEATURE_ROUND = FIX.bonus.feature
    const featureExpect = () => {
      const mult = FEATURE_ROUND.payoutMultiplier / 100
      const amount = mult * (Number(P.amountMicros) / 1_000_000)
      return {
        mult,
        multText: `${mult.toFixed(1)}×`,
        amountText: '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      }
    }
    const FEATURE_DRIVE = { round: FEATURE_ROUND, costMultiplier: 100.0, qs: { mode: 'bonus', currency: 'USD' },
      play: true, feature: true, playTimeoutMs: 60000 }
    const assertFeaturePodEqualsEnvelope = (r, tag = '') => {
      const { amountText } = featureExpect()
      check((r.observed.settledWinText || '').includes(amountText),
        `${tag}at FEATURE COMPLETE the pod equals the envelope payout`,
        `settled win area reads "${r.observed.settledWinText}"`,
        `the settled win area read "${r.observed.settledWinText}" against the envelope's ${amountText}; `
          + 'a dash here is the exact state the owner\'s screenshots show, the unsettled feature replay')
    }
    const assertFeaturePodInstrument = (r, tag = '') => {
      // Desktop only: the side pod is hidden by design below 1120px width and
      // the win amount is carried by WinDisplay there, its own recorded rule.
      const { multText, amountText } = featureExpect()
      check(r.observed.podActive === true
          && (r.observed.podText || '').includes(multText)
          && (r.observed.podText || '').includes(amountText),
        `${tag}the desktop pod shows the round's multiplier and amount from the envelope`,
        `pod reads "${r.observed.podText}"`,
        `pod active=${r.observed.podActive} text "${r.observed.podText}" against expected ${multText} and ${amountText}`)
    }
    const assertNoVerticalOverflow = (r, sizeName, tag = '') => {
      const o = r.observed.overflow || {}
      check(Number.isFinite(o.docH) && o.docH <= o.winH && o.docW <= o.winW,
        `${tag}the replay fits one viewport at ${sizeName}, no scrolling`,
        `document ${o.docW}x${o.docH} within viewport ${o.winW}x${o.winH}`,
        `document ${o.docW}x${o.docH} overflows the ${o.winW}x${o.winH} viewport`)
    }
    // R056 TASK 1's fidelity pin AT THE REPLAY SURFACE, in the same battery
    // per the brief: XEC labels SC exactly as the published row prints it
    // (docs/stake-engine-live/2026-07-29/rgs.md:142), never the reversed EC
    // derivation and never the raw code. The XSC substring lesson below
    // applies here too, so the raw code's absence is asserted explicitly.
    const assertXecLabelsSC = (r, tag = '') => {
      const cur = (r.observed.currencyText || '').replace(/\s+/g, ' ').trim()
      const figs = (r.observed.figuresText || '').replace(/\s+/g, ' ').trim()
      check(/\bSC\b/.test(cur) && !/XEC/.test(cur + ' ' + figs) && !/\bEC\b/.test(cur + ' ' + figs),
        `${tag}XEC labels SC, the published row (rgs.md:142), never EC and never the raw code`,
        `currency line "${cur}", figures "${figs}"`,
        `an XEC replay rendered currency "${cur}" figures "${figs}"; the published row prints SC`)
    }

    // S2-C028. Defined HERE, beside the other shared assertions, rather than
    // where the sweepstakes drive is set up. The real-run drives live in a
    // branch the self-test does not execute, so a predicate defined there is
    // undefined by the time a seed reaches for it. Same reason
    // assertFlatMultiplier and assertSocialToken are extracted above.
    //
    // THE SUBSTRING TRAP THIS CLOSES: 'SC' IS A SUBSTRING OF 'XSC'. Written as
    // /SC/.test(txt) this assertion would be GREEN on the exact defect it
    // exists to catch, because the raw code contains the symbol. So the raw
    // code's ABSENCE is asserted explicitly rather than inferred from the
    // symbol's presence, and SEED 3c below is what proves that distinction is
    // real rather than argued.
    const assertSweepstakesSymbol = (r, tag = '') => {
      const txt = r.observed.currencyText.replace(/\s+/g, ' ').trim()
      check(!/XSC/.test(txt) && /\bSC\b/.test(txt),
        `${tag}a sweepstakes currency renders its player symbol, never the raw platform code`,
        `XSC renders "${txt}"`,
        `a sweepstakes replay rendered "${txt}". The raw platform code reaching a player is `
          + 'the jurisdiction failure currency.ts:105 records having already shipped once')
    }

    // S2-C006. The half of item 50 that the ready phase cannot prove, and the
    // reason two verification agents reached OPPOSITE conclusions about the
    // item: it PASSED in the ready phase and was satisfied by nothing at all
    // once the replay had run. The platform asks for these figures in the
    // after-replay state, at approval_guidelines_game_replay_requirements.md
    // :134 ("Show results - Display bet cost, payout, and win amount") and :113.
    //
    // Read after `play`, which is why this assertion needs its own drive rather
    // than riding on the healthy session: the default session is deliberately
    // interaction-free so REQ-085 can assert the fetch needs no click.
    const assertFiguresPersist = (r, tag = '') => {
      const txt = (r.observed.figuresTextAfterPlay ?? '').replace(/\s+/g, ' ').trim()
      check(!r.observed.figuresOccludedBy,
        `${tag}the after-replay figures are not covered by another element`,
        'nothing paints over the figures row once the round has played out',
        `the figures row is covered by "${r.observed.figuresOccludedBy}". Playwright's `
          + 'isVisible() does not test occlusion, so a covered readout would otherwise pass')
      check(r.observed.figuresAfterPlay && /\d/.test(txt),
        `${tag}the bet cost survives the replay playing out (guideline item 50)`,
        `after-replay state renders "${txt}"`,
        `the bet cost vanished once the replay played: "${txt}". It rendered in the ready `
          + 'phase only, so a reviewer checking the result against the Bets panel sees nothing')
      check(/×\s*[\d.]+/.test(txt),
        `${tag}the applied multiplier survives the replay playing out (guideline item 50)`,
        `after-replay state renders "${txt}"`,
        `the applied multiplier vanished once the replay played: "${txt}"`)
    }

    if (!SELF_TEST) {
      console.log('\nTHE CONTRACT, one healthy session at the live six-parameter shape:')
      const healthy = await driveReplay(browser)
      const { off } = assertContract(healthy)

      // REQ-077: the optional parameters are APPLIED, not defaulted. Two loads
      // differing only in currency and language must render differently. A
      // single-load assertion cannot see a hardcoded value whenever the one test
      // URL happens to match it, which is exactly how the dash gate failed.
      // REPOINTED 2026-07-30 from `startText` to `figuresText`, after a
      // post-session audit found this assertion had been gutted without going
      // red. The money used to live in the START REPLAY button, so reading its
      // text compared the rendered currency and amount across two loads. Commit
      // d1cd0c3 hoisted the figures OUT of that button into `.replay-figures`,
      // and this line was left pointing at the button.
      //
      // What it then compared was the translated LABEL: "START REPLAY Mode:
      // super" against the Japanese equivalent. Those differ for any two
      // languages, so the check passed while proving nothing about currency or
      // amount, and the gate went on printing "11 requirements held". A build
      // that hardcoded the currency and ignored the query string would have
      // passed it, which is the exact defect REQ-077 exists to catch.
      const eur = healthy.observed.figuresText
      const jpy = (await driveReplay(browser, { qs: { currency: 'JPY', lang: 'ja', amountMicros: '1000000000' } })).observed.figuresText
      check(eur !== jpy && eur.length > 0 && jpy.length > 0,
        'optional query parameters are applied, not defaulted',
        `EUR renders "${eur}", JPY/ja renders "${jpy}"`,
        `both loads rendered identically ("${eur}"), so currency and lang are not being read from the query string`)
      check(!/NaN/.test(eur + jpy), 'no NaN in the rendered money figure',
        'both loads format cleanly', `NaN present: EUR "${eur}" JPY "${jpy}"`)

      // ── S2-C028: the query string's HOSTILE values, not just its happy ones ──
      //
      // The block above proves the optional parameters are READ rather than
      // defaulted. It uses EUR and JPY, both well formed. Nothing here drove a
      // sweepstakes code, a malformed amount, or a missing mode, and those are
      // the three shapes that actually arrive from a platform launch URL.

      // (a) THE SWEEPSTAKES CODE. The defect is recorded in this repo's own
      // source, currency.ts:105: "replay table knew 'SC' but not 'XSC', so a
      // real sweepstakes session printed" the raw platform code at a player.
      // Printing XSC at a player is what the jurisdiction rules prohibit.
      //
      // THE PREDICATE HAS TO ASSERT AN ABSENCE, and this is the trap in the
      // row: 'SC' IS A SUBSTRING OF 'XSC'. A check written as /SC/.test(txt) is
      // GREEN on the exact defect it exists to catch. So the raw code's absence
      // is asserted explicitly rather than inferred from the symbol's presence.
      //
      // Scoped to `.currency-display` deliberately. Whether the figures row
      // also resolves an SC symbol through PLATFORM_CURRENCIES in the seeded
      // state was NOT verified, and asserting an unverified second surface
      // would be claiming more than was measured.
      assertSweepstakesSymbol(await driveReplay(browser, { qs: { currency: 'XSC', social: 'false' } }))

      // (b) MALFORMED AMOUNTS. amountMicros arrives from a URL, so it arrives
      // as whatever the platform put there. Both a non-numeric value and a
      // negative one must fall back rather than render NaN or a negative bet.
      const badAmounts = []
      for (const amountMicros of ['abc', '-5']) {
        const r = await driveReplay(browser, { qs: { amountMicros }, settleMs: 1500 })
        badAmounts.push({ amountMicros, text: r.observed.figuresText.replace(/\s+/g, ' ').trim() })
      }
      check(badAmounts.every((b) => b.text.length > 0 && !/NaN|-\d/.test(b.text)),
        'a malformed amountMicros falls back rather than rendering NaN or a negative bet',
        badAmounts.map((b) => `${b.amountMicros} renders "${b.text}"`).join('; '),
        `malformed amounts rendered: ${badAmounts.map((b) => `${b.amountMicros} -> "${b.text}"`).join('; ')}`)

      // (c) THE MISSING MODE. assertContract is deliberately NOT run on this
      // drive: with no mode no replay request is issued at all, so `exactly one
      // replay request` and `replay URL is exact` would both fail for the right
      // reason and score as noise. The only thing asserted is that the player
      // is TOLD, rather than left on a blank surface.
      const noMode = await driveReplay(browser, { qs: { mode: '' }, settleMs: 500 })
      check(noMode.observed.errorVisible && noMode.observed.errorText.length > 0,
        'a launch with no mode renders a visible error rather than a blank surface',
        `error reads "${noMode.observed.errorText}"`,
        'a replay launched with no mode rendered no visible error state, so the player is left '
          + 'looking at a surface that never explains itself')

      // GUIDELINE ITEM 50, added 2026-07-30: the applied multiplier is displayed
      // AT 1.0x, which is the case this gate could not previously see.
      //
      // Every fixture here defaults to costMultiplier 400.0, so the gate only
      // ever exercised the branch that worked. The shipped UI read
      // `costMultiplier !== 1.0`, making the display DEAD for base and cruise,
      // the two 1.0x modes and the two a reviewer is most likely to replay. The
      // committed capture at reports/screens/dtt-live-2026-07-26/ shows the
      // platform's own Bets panel reading "Cost multiplier x1.00" beside our
      // overlay saying nothing.
      //
      // A gate whose fixture only covers the passing case is the shape convention
      // (p) exists to stop, so this asserts the boundary value specifically.
      assertFlatMultiplier(await driveReplay(browser, { costMultiplier: 1.0 }))

      // S2-C006, the OTHER half of item 50, and the half no assertion held
      // before. The line above proves the figures render at 1.0x; it proves
      // nothing about whether they still exist once the round has played, which
      // is the state the platform's wording is actually about. Driven at 1.0x
      // for the same reason as the line above: it is the boundary value, so a
      // single drive covers both the suppression case and the persistence case.
      // SUB-CAP ROUND, deliberately. The gate's default is FIX.super.cap at 500000x
      // against WINCAP 5000, which raises the max-win splash and waits for a
      // COLLECT nobody clicks, so the drive stalled in the PLAYING phase and the
      // assertion read an element behind the overlay. FIX.base.win is 390x, so the
      // round actually completes and this reads the phase the platform requirement
      // is about. Also reclaims about 50 seconds of dead wait per CI run.
      assertFiguresPersist(await driveReplay(browser,
        { costMultiplier: 1.0, play: true, round: FIX.base.win }))

      // S2-C008. THE KEYBOARD SESSION, driven separately and judged by the
      // money-path rule alone.
      //
      // Before this, EVERY assertContract call in this file ran over a drive
      // with `play` false and `keys` false, so the money-path rule had only
      // ever been asserted about a session nobody had touched. The rule it is
      // meant to enforce is that replay never puts money on the wire, and the
      // way this project has actually broken that rule is a key press: a
      // focused button activated natively by the browser, past a handler whose
      // guards all return before preventDefault. That path was completely
      // unobserved here.
      const keyed = await driveReplay(browser,
        { costMultiplier: 1.0, play: true, keys: true, round: FIX.base.win })
      assertNoMoneyPath(offOrigin(keyed.requests), '[keyboard] ')

      // S2-C009, driven as its own session because `social` is a launch
      // parameter and cannot be toggled on a live page.
      const socialRun = await driveReplay(browser, { qs: { social: 'true' } })
      assertSocialToken(socialRun)

      // AND ITS CONTROL, which is what stops the assertion above being
      // one-sided. A build that printed Token unconditionally would satisfy
      // assertSocialToken and be wrong in real-money mode, where the label must
      // read Currency. Asserting only the social half would not notice.
      const realTxt = healthy.observed.currencyText.replace(/\s+/g, ' ').trim()
      check(/\bCurrency\b/.test(realTxt) && !/\bToken\b/.test(realTxt),
        'real-money mode still labels the value Currency, so the swap is conditional',
        `real-money replay renders "${realTxt}"`,
        `a real-money replay rendered "${realTxt}". If social and real render the same `
          + 'word then the mode swap is not happening and one of the two is wrong')

      // REQ-091: a visible loading indicator covers the fetch window.
      const held = await driveReplay(browser, { respond: 'hang', settleMs: 1500 })
      check(held.observed.loadingSeenBeforeSettle, 'a held fetch shows a loading indicator',
        '.replay-status.loading visible while the response is outstanding',
        'the fetch window rendered no loading state, which is the blank-screen defect')

      // REQ-098: a user-facing error state, not a blank screen and not a silent
      // hang. All three failure modes are exercised because they are three
      // different code paths: an HTTP error, a server error and a transport
      // abort do not reach the same branch by the same route.
      for (const mode of ['404', '500', 'abort']) {
        const r = await driveReplay(browser, { respond: mode })
        const hasText = r.observed.errorVisible && r.observed.errorText.length > 0
        check(hasText, `a failed fetch (${mode}) shows a user-facing error`,
          `error state rendered: "${r.observed.errorText.split('\n')[0]}"`,
          `no error state rendered; body was "${r.observed.bodyText.slice(0, 80)}"`)
      }

      // REQ-132 IS NOT ASSERTED HERE, DELIBERATELY, and the reason is recorded
      // rather than left as a silent gap, because two wrong versions of it lived
      // in this file first and both would have shipped as evidence.
      //
      // Version one compared the rendered page between an in-order round and a
      // reordered one WITHOUT pressing START REPLAY, so it compared two copies of
      // the same ready card and reported the client's behaviour when it was
      // describing the harness. Version two played the round but moved the single
      // `finalWin` event and expected the total to follow. It does not, and the
      // answer was one line of specification nobody had read:
      //
      //   roundInterpreter.ts:274-279  scans BACKWARDS to the LAST finalWin
      //
      // so with one such event its position is irrelevant. Convention (l.2) says
      // a measurement that disagrees with the specification is a broken
      // measurement until proven otherwise, and twice it was.
      //
      // The real order dependence is `running` at roundInterpreter.ts:211-213,
      // several transforms UPSTREAM of anything this gate can see: the rendered
      // `.win-area` is the win presentation, so the browser can observe that a
      // total was rendered but never which event decided it. **The browser is the
      // wrong instrument for this one requirement.** It is asserted directly on
      // the interpreter instead, in the already-wired `replayRounds.test.ts`
      // (gate 13b), as a pure order swap with a negative control. Same mechanism
      // M01, correct instrument.

      // Negative control: same-origin asset traffic must not be mistaken for a
      // contract breach. Without this the gate would fail on any bundle at all.
      check(off.length >= 1 && offOrigin(healthy.requests).every((r) => r.url.includes('/bet/replay/')),
        'NEGATIVE CONTROL: local asset requests are not flagged',
        `${healthy.requests.length} total requests, ${off.length} off-origin, all of them the replay call`,
        `off-origin traffic beyond the replay call: ${off.map((r) => r.url).join(', ')}`)

      // R053: THE REAL PAYLOAD RENDERS THE ROUND'S ACTUAL BOARD. Served
      // byte-shaped as captured from the live endpoint, played through, the
      // settled grid compared column for column against the fixture's own
      // reveal board (visible window). This is the part every stub above
      // could not be: the stubs encode our reading of the platform, this
      // encodes the platform.
      const real = await driveReplay(browser, { respond: 'real', play: true, qs: { mode: 'base' } })
      assertRealFixtureBoard(real)

      // R056 TASK 5: the feature replay played to settlement at the three
      // reference sizes. The pod-equals-envelope claim is asserted at every
      // size (WinDisplay carries the amount where the side pod is hidden by
      // design), the instrument pod additionally at desktop, and the
      // single-viewport fit at all three, the frame committed for each when
      // FS_WRITE_EVIDENCE=1 (convention (h.1): a plain run writes scratch).
      const framesDir = evidenceDir('reports', 'screens', 'r056-replay')
      const SIZES = [
        ['desktop-1280x720',        { width: 1280, height: 720 }],
        ['mobile-portrait-375x812', { width: 375,  height: 812 }],
        ['popout-s-400x225',        { width: 400,  height: 225 }],
      ]
      for (const [sizeName, viewport] of SIZES) {
        const fr = await driveReplay(browser, { ...FEATURE_DRIVE, viewport,
          frame: join(framesDir, `feature_${sizeName}.png`) })
        assertFeaturePodEqualsEnvelope(fr, `[${sizeName}] `)
        assertNoVerticalOverflow(fr, sizeName, '')
        if (sizeName.startsWith('desktop')) assertFeaturePodInstrument(fr, `[${sizeName}] `)
      }

      // R056 TASK 1's fidelity pin in the same battery: an XEC replay labels
      // SC per the published row, at the surface a reviewer actually loads.
      const xec = await driveReplay(browser, { respond: 'real', qs: { mode: 'base', currency: 'XEC' } })
      assertXecLabelsSC(xec)
    }

    if (SELF_TEST) {
      // -------------------------------------------------------------------
      // Convention (p). Each seed plants the defect in the form it really takes
      // and the gate MUST go red. A green seed fails the whole gate.
      // -------------------------------------------------------------------
      const seeds = []
      const seed = async (name, why, opts, expectFail, assertFn = assertContract) => {
        const r = await driveReplay(browser, opts)
        const before = results.length

        // A SEED THAT DID NOT APPLY HAS PROVED NOTHING, and it must never be
        // scored as a catch. An absent target string 500s, the app never boots,
        // every assertion in the run fails, and `caught` would come out TRUE on
        // a defect that was never planted. Its own class, never a catch and
        // never a miss, because calling it a miss would be equally false.
        if (r.unapplied.length) {
          results.length = before
          seeds.push({ name, caught: false, applied: false, why })
          console.log(`  UNAPPLIED  SEED ${name}: target absent at ${r.unapplied.map((u) => u.path).join(', ')}`)
          console.log('             this seed proved NOTHING: not a catch, not a miss')
          return
        }

        assertFn(r, `[seed ${name}] `)
        const failed = results.slice(before).filter((x) => !x.pass)
        const caught = failed.some((f) => expectFail.test(f.name))
        // The seeded run's own failures are expected, so they are removed from
        // the tally: what is being scored is whether the gate NOTICED.
        results.length = before
        seeds.push({ name, caught, applied: true, why })
        console.log(`  ${caught ? 'caught' : 'MISSED'}  SEED ${name}: ${why}`)
        if (!caught) console.log(`           the gate stayed green on a planted defect`)
      }

      // SEED 1, the one the panel named: `${a.mode}` swapped for a literal.
      // This is the defect that ships silently, because 'base' is also the
      // default, so every casual test of a base-mode replay stays green.
      await seed('hardcoded-mode', 'replay URL template hardcodes the mode instead of reading the query string',
        { patches: { [bundle.file]: (b) => {
          const m = b.match(/bet\/replay\/\$\{(\w+)\.game\}\/\$\{\1\.version\}\/\$\{\1\.mode\}/)
          if (!m) return null
          return b.replace(m[0], `bet/replay/\${${m[1]}.game}/\${${m[1]}.version}/base`)
        } } }, /replay URL is exact/)

      // SEED 1b, THE DEFECT THIS GATE SHIPPED WITH, seeded at the OBSERVATION
      // BOUNDARY per the practice declared in this file's header.
      //
      // The shipped defect was `response.costMultiplier !== 1.0` guarding the
      // display, which made it DEAD for base and cruise. The gate was GREEN over
      // it for as long as it existed, because every fixture used 400.0 and the
      // dead branch was never exercised.
      //
      // The BRANCH is not safely targetable: Svelte 5 minifies reactive
      // statements into mangled identifiers, and a generic `x = y !== null`
      // pattern matches many unrelated sites in the bundle. A first attempt did
      // exactly that, patched something else, and the seed read MISSED. So this
      // reproduces the defect's OBSERVABLE instead, which is what this gate
      // actually reads: the multiplier absent from the rendered start button.
      //
      // The target is anchored on two literals that come from our own template,
      // so it cannot drift onto unrelated code, and a miss is a hard 500 rather
      // than a silent no-op.
      await seed('multiplier-suppressed-at-1x',
        'the replay UI hides the applied multiplier when it is 1.0x, which is base and cruise',
        // RE-ANCHORED 2026-08-10 (R042 A5). This matched the minified text up to
        // `cost ="}`, i.e. through the English literal on the REAL-MONEY branch.
        // A5 keyed that word, so the literal is gone and the locator matched
        // nothing. THIS IS THE THIRD SEED IN TWO DAYS disarmed by an entirely
        // legitimate reword, and each time the anchor reached through prose to
        // get at structure.
        //
        // Anchored now on the TEMPLATE ITSELF, `× ${...}`, which is the shape
        // the assertion is actually about: the multiplier line. Its contents are
        // free to change; its existence is what the seed suppresses.
        { costMultiplier: 1.0, patches: { [bundle.file]: (b) => {
          const m = b.match(/`× \$\{[^`]*`/)
          if (!m) return null
          return b.replace(m[0], '``')
        } } }, /multiplier is displayed at 1\.0x/, assertFlatMultiplier)

      // SEED 1c, S2-C006. Seeded at the OBSERVATION BOUNDARY for the same reason
      // as 1b: the phase branch is not safely targetable in a minified Svelte
      // bundle, and a seed that patched the wrong site would read MISSED while
      // proving nothing.
      //
      // This reproduces the shipped defect's observable EXACTLY rather than
      // approximately, which is the distinction convention (p) turns on: the
      // figures are present in the ready phase and gone the instant Start is
      // pressed, which is precisely what `{#if phase === 'ready'}` did to them.
      // A seed that simply hid `.replay-figures` outright would be a DIFFERENT
      // defect, catchable by the ready-phase assertion that already existed, and
      // would therefore prove nothing about the assertion added with it.
      await seed('figures-lost-after-play',
        'the bet cost and multiplier vanish once the replay plays, leaving item 50 unmet after the round',
        { costMultiplier: 1.0, play: true, round: FIX.base.win, patches: { '/index.html': (b) => {
          if (!b.includes('</head>')) return null
          return b.replace('</head>',
            '<script>addEventListener("click",function(e){'
            + 'if(e.target&&e.target.closest&&e.target.closest(".start-replay")){'
            + 'var f=document.querySelector(".replay-figures");if(f)f.style.display="none"}'
            + '},true)</script></head>')
        } } }, /survives the replay playing out/, assertFiguresPersist)

      // SEED 1d, S2-C009. Seeded in the BUNDLE rather than at the observation
      // boundary, because unlike 1b and 1c this target is safely anchorable: the
      // two literals come from our own template and the minifier leaves them
      // intact, so the match cannot drift onto unrelated code however the
      // surrounding identifiers are mangled. Verified as exactly one occurrence
      // in the shipped bundle before this was written.
      //
      // The defect is planted in THE FORM IT REALLY TAKES, which convention (p)
      // is explicit about: the shape that has shipped in this project four times
      // is the social swap simply not existing, leaving one branch for both
      // modes. TR-091 and TR-104 are both that shape. So the seed collapses the
      // ternary onto its real-money branch rather than, say, deleting the label.
      await seed('social-label-not-swapped',
        'social mode shows the word Currency, which is on the stake.us prohibited-terms table',
        // RE-ANCHORED 2026-08-10 (R041). This matched `"social"?"Token":"Currency"`,
        // i.e. BOTH branches at once. R041 keyed the real-money branch, so the
        // minified ternary is now `==="social"?"Token":s()("replayCurrencyLabel")`
        // and the old locator matched nothing. The gate did exactly the right
        // thing and refused to score an UNAPPLIED seed as caught, which is the
        // behaviour its own header exists to describe.
        //
        // Now anchored on the SOCIAL branch alone. `"Token"` is a deliberate
        // English literal that stays by design (social is en-only, and 'currency'
        // is in vocabulary.ts NOT_SUBSTITUTED because a blanket rewrite would
        // corrupt ISO code labels), so it is the stable half of this pair. The
        // real-money half is now a translation key and will move again.
        { qs: { social: 'true' }, patches: { [bundle.file]: (b) => {
          const m = b.match(/"social"\?"Token":/)
          if (!m) return null
          return b.replace(m[0], '"social"?"Currency":')
        } } }, /labels the value Token/, assertSocialToken)

      // SEED 2: two segments transposed. The old glob-based harness is green on
      // this, which is the whole reason this gate exists.
      await seed('transposed-segments', 'game and version transposed in the replay path',
        { patches: { [bundle.file]: (b) => {
          const m = b.match(/bet\/replay\/\$\{(\w+)\.game\}\/\$\{\1\.version\}/)
          if (!m) return null
          return b.replace(m[0], `bet/replay/\${${m[1]}.version}/\${${m[1]}.game}`)
        } } }, /replay URL is exact/)

      // SEED 3: an authenticated call leaks out of a replay boot. Injected into
      // index.html rather than the bundle, and declared as such in the header.
      await seed('leaked-authenticated-call', 'a wallet or authenticate call escapes from a replay session',
        { patches: { '/index.html': (b) => {
          if (!b.includes('</head>')) return null
          return b.replace('</head>',
            `<script>fetch('https://${P.rgsHost}/wallet/authenticate',{method:'POST'}).catch(()=>{})</script></head>`)
        } } }, /no authenticated RGS call/)

      // SEED 3b, S2-C008: a KEY PRESS puts money on the wire.
      //
      // WHY THIS IS AN OBSERVATION-BOUNDARY SEED AND NOT A SOURCE ONE, stated
      // because the row asked for the source form and the source form cannot be
      // planted here. The real guard is App.svelte's `if (isReplay) return` in
      // handleKeydown, which compiles into the bundle, so index.html cannot
      // reach it. Stripping it in the bundle would also prove nothing: on the
      // replay surface `canSpin` is permanently false, because isLoading starts
      // true and its only clear lives in initRGS, which replay mode skips. So a
      // bundle strip would emit no request at all and the seed would score
      // MISSED on a gate that is working correctly, which is the precise
      // failure convention (p) exists to prevent.
      //
      // What is planted instead is the OBSERVABLE, in the shape the defect
      // really takes on the wire: a focused control, a Space press, and an
      // authenticated call leaving the page. That is the same practice this
      // file's header already declares for SEED 3 and SEED 5, and it is what
      // makes the keyboard leg's own assertion provably able to fail. Without
      // it the leg would be two key presses nobody had ever seen catch
      // anything, which is a script that prints PASS.
      await seed('keypress-puts-money-on-the-wire',
        'a Space press on a focused replay control issues an authenticated call',
        { costMultiplier: 1.0, play: true, keys: true, round: FIX.base.win,
          patches: { '/index.html': (b) => {
            if (!b.includes('</head>')) return null
            return b.replace('</head>',
              '<script>addEventListener("keydown",function(e){if(e.code==="Space")'
              + `fetch('https://${P.rgsHost}/wallet/play',{method:'POST'}).catch(()=>{})},true)`
              + '</script></head>')
          } } },
        /no authenticated RGS call/,
        (r, pre) => assertNoMoneyPath(offOrigin(r.requests), pre))

      // SEED 3c, S2-C028: the sweepstakes lookup loses its XSC key and the raw
      // platform code reaches the player.
      //
      // THE FORM IS THE ONE THAT REALLY SHIPPED, recorded in this repo's own
      // source at currency.ts:105: "replay table knew 'SC' but not 'XSC', so a
      // real sweepstakes session printed" the raw code. The seed deletes that
      // one table entry rather than, say, rewriting the label, because losing
      // the key is how it happened.
      //
      // This is also the seed that proves the substring trap is closed. With
      // the key gone the display renders "XSC", which CONTAINS "SC", so a
      // predicate written as /SC/.test(txt) would score this seed as green. It
      // goes red only because the assertion demands the raw code's ABSENCE.
      await seed('sweepstakes-raw-code-leaks',
        'the currency table loses XSC and a sweepstakes player is shown the raw platform code',
        { qs: { currency: 'XSC', social: 'false' },
          patches: { [bundle.file]: (b) => {
            const anchor = 'XSC:{symbol:"SC",decimals:2},'
            if (!b.includes(anchor)) return null
            return b.replace(anchor, '')
          } } },
        /raw platform code/,
        (r, pre) => assertSweepstakesSymbol(r, pre))

      // SEED 4: a second replay request. Catches a retry loop or a double mount,
      // both of which have shipped in this project's history on other surfaces.
      await seed('duplicate-replay-request', 'the replay endpoint is called more than once per load',
        { patches: { '/index.html': (b) => {
          if (!b.includes('</head>')) return null
          return b.replace('</head>',
            `<script>fetch('https://${P.rgsHost}/bet/replay/x/1/base/1').catch(()=>{})</script></head>`)
        } } }, /exactly one replay request|replay URL is exact/)

      // SEED R053: the pre-fix reader against the REAL payload. The bundle
      // regression collapses the dual-shape read back to state.events-only
      // (the array branch removed, the exact reader this project shipped to
      // the portal), then the CAPTURED live payload is served. The board can
      // never render, the R053 guard turns what used to be a silent startup
      // grid into an error state, and the real-fixture assertions go red
      // either way: reality is load-bearing in this gate from here on.
      await seed('real-envelope-reader-regressed',
        'the state.events-only reader leaves the real replay payload boardless, the portal startup-grid defect',
        { respond: 'real', play: true, qs: { mode: 'base' }, patches: { [bundle.file]: (b) => {
          const m = b.match(/:Array\.isArray\(([\w$]+)\)\?\1:null/)
          if (!m) return null
          return b.replace(m[0], ':[]')
        } } },
        /real fixture/,
        assertRealFixtureBoard)

      // SEED R056: the feature-end banner chain SEVERED, which is the exact
      // pre-fix state the owner's screenshots show: the dismissal callback
      // becomes a bare property access, onEndBannerDismissed() is never
      // called, finish() never dispatches 'complete', the feature replay sits
      // on FEATURE COMPLETE forever and the pod keeps the zero-win dash. The
      // drive still clicks the entry gate, so the ONLY difference from the
      // green run is the severed link; playTimeoutMs is trimmed because the
      // whole point is that .play-again never arrives.
      await seed('feature-end-chain-severed',
        'the feature-end banner dismissal chain is unbound, the FEATURE COMPLETE dash defect',
        { ...FEATURE_DRIVE, playTimeoutMs: 30000, patches: { [bundle.file]: (b) => {
          if (!b.includes('?.onEndBannerDismissed()')) return null
          return b.replaceAll('?.onEndBannerDismissed()', '?.onEndBannerDismissed')
        } } },
        /FEATURE COMPLETE.*envelope payout/,
        assertFeaturePodEqualsEnvelope)

      // SEED 5: the lifecycle branch suppressed, so a failed fetch leaves a
      // blank surface. Observation-boundary seed, declared in the header.
      {
        const r = await driveReplay(browser, {
          respond: '404',
          patches: { '/index.html': (b) => b.includes('</head>')
            ? b.replace('</head>', '<style>.replay-status.error{display:none !important}</style></head>')
            : null },
        })
        const why = 'a failed fetch renders no error state'
        if (r.unapplied.length) {
          // Same rule as the helper above. This seed is planted inline rather
          // than through seed(), so it carries the check itself.
          seeds.push({ name: 'suppressed-error-branch', caught: false, applied: false, why })
          console.log(`  UNAPPLIED  SEED suppressed-error-branch: target absent at ${r.unapplied.map((u) => u.path).join(', ')}`)
          console.log('             this seed proved NOTHING: not a catch, not a miss')
        } else {
          const caught = !r.observed.errorVisible
          seeds.push({ name: 'suppressed-error-branch', caught, applied: true, why })
          console.log(`  ${caught ? 'caught' : 'MISSED'}  SEED suppressed-error-branch: ${why}`)
        }
      }

      // CONTROLS. The gate must be GREEN on a healthy tree, or it cannot go from
      // green to red on a defect and therefore detects nothing. This is the
      // exact failure the survey panel found in two other proposed mechanisms.
      console.log('\nCONTROLS, the unpatched tree must pass:')
      const healthy = await driveReplay(browser)
      assertContract(healthy, '[control]')

      // CONTROL: a scheme-less rgs_url is legitimate and must not read as a
      // mismatch. replayService prefixes https:// itself.
      const call = offOrigin(healthy.requests).find((r) => r.url.includes('/bet/replay/'))
      check(!!call && call.url.startsWith('https://'), '[control] scheme-less rgs_url resolves to https',
        call?.url, 'the scheme-less host did not resolve to an https URL')

      // CONVENTION (p) FOR THIS FILE'S OWN SCORING. The class being closed is
      // "a seed that never applied scores as CAUGHT", so the seeded violation
      // is a target string that is deliberately absent, and the control proves
      // the detector fires on it. Without this, the fix above would itself be a
      // gate nobody has watched go red.
      console.log('\nUNAPPLIED-SEED DETECTOR, the class this gate used to score wrongly:')
      {
        const probe = await driveReplay(browser, { patches: { '/index.html': () => null } })
        check(probe.unapplied.length === 1,
          '[control] an unapplied seed target is RECORDED',
          `recorded at ${probe.unapplied.map((u) => u.path).join(', ') || 'nowhere'}`,
          'a seed target that could not be found went unrecorded, so the gate is blind to it again')

        // The second half is what makes the first worth having: prove the run
        // really would have read as CAUGHT under the old rule, so this control
        // demonstrates a defect that was LIVE rather than one that was theorised.
        const before = results.length
        assertContract(probe, '[unapplied-probe] ')
        // CORRECTED 2026-07-31. This read `.some((x) => !x.pass)`, which is
        // "at least one assertion failed", and was labelled as proving the old
        // RULE would have scored CAUGHT. The old rule was per-seed NAME
        // matching, `failed.some((f) => expectFail.test(f.name))`, which is a
        // narrower thing: on this probe only one of the four assertContract
        // seeds would actually have matched. Substituting loudness for the
        // specific evidence is the same move this gate exists to stop, so the
        // control now applies the real old predicate.
        const failedNames = results.slice(before).filter((x) => !x.pass).map((x) => x.name)
        results.length = before
        const OLD_RULE = /exactly one replay request|no authenticated RGS call/
        check(failedNames.some((n) => OLD_RULE.test(n)),
          '[control] under the OLD per-seed rule this probe would have scored CAUGHT',
          `failing assertions were: ${failedNames.join('; ') || 'none'}`,
          'no failing assertion matched a seed expectation, so the old rule would have read MISSED here')
      }

      // THREE CLASSES, not two, because they need different fixes. A MISS means
      // the gate is blind to a real defect. An UNAPPLIED means no defect was
      // ever planted, so the gate's score against that seed is UNKNOWN rather
      // than bad, and re-running changes nothing until the locator is fixed.
      const unapplied = seeds.filter((s) => s.applied === false)
      const missed = seeds.filter((s) => s.applied !== false && !s.caught)
      const caughtCount = seeds.length - missed.length - unapplied.length
      console.log(`\nSEEDS: ${caughtCount}/${seeds.length} caught, ${missed.length} missed, ${unapplied.length} unapplied`)

      if (unapplied.length) {
        console.log('\nSELF-TEST FAILED: a seed never applied, so this gate cannot claim a score.')
        console.log('An unapplied seed used to read as CAUGHT, because the 500 stops the app booting')
        console.log('and every assertion then fails. Fix the seed locator; re-running changes nothing.')
        unapplied.forEach((u) => console.log(`  UNAPPLIED ${u.name}: ${u.why}`))
        process.exit(3)
      }
      if (missed.length) {
        console.log('SELF-TEST FAILED: the gate stayed green on a planted defect.')
        missed.forEach((m) => console.log(`  MISSED ${m.name}: ${m.why}`))
        process.exit(1)
      }
    }
  } finally {
    await browser.close()
  }

  const failed = results.filter((r) => !r.pass)
  console.log(`\n${results.length - failed.length}/${results.length} assertions passed`)
  if (failed.length) {
    console.log(`REPLAY CONTRACT GATE${SELF_TEST ? ' SELF-TEST' : ''}: FAIL`)
    process.exit(1)
  }
  console.log(`REPLAY CONTRACT GATE${SELF_TEST ? ' SELF-TEST' : ''}: PASS`
    + (SELF_TEST ? ' (every seed red, every control green)' : ' (11 requirements held)'))
}

await main()
