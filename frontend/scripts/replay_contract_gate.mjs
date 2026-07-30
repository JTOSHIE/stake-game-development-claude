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
// Usage, from frontend/, after `npm run build`:
//   node scripts/replay_contract_gate.mjs              the contract assertions
//   node scripts/replay_contract_gate.mjs --self-test  convention (p): seeds must go RED
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const DIST = join(HERE, '..', 'dist')
const SELF_TEST = process.argv.includes('--self-test')

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('REPLAY CONTRACT GATE: no build at frontend/dist. Run `npm run build` first.')
  process.exit(2)
}

const FIX = JSON.parse(readFileSync(
  join(HERE, '..', 'src', 'lib', 'services', '__fixtures__', 'replay_rounds.json'), 'utf8'))

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
        // The seed's target string was not found. Fail loudly: a seed that
        // silently no-ops turns a red run green, which is the failure this
        // whole convention exists to prevent.
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
  settleMs = 2500, play = false,
} = {}) {
  const srv = await serve(patches)
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
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
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        payoutMultiplier: round.payoutMultiplier,
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
  observed.bodyText = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').trim()

  // Playing the round is OPT IN, because the default session must stay
  // interaction-free: REQ-085 asserts the fetch needs no click, and a driver
  // that clicked before observing could not tell the two apart.
  if (play && observed.startVisible) {
    await page.locator('.start-replay').click({ timeout: 5000 }).catch(() => {})
    await page.locator('.play-again').waitFor({ timeout: 25000 }).catch(() => {})
    observed.finalWin = (await page.locator('.win-area').innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
  }

  await page.close()
  await new Promise((r) => srv.close(r))
  return { requests, observed }
}

const offOrigin = (reqs) => reqs.filter((r) => !r.url.startsWith(`http://localhost:${PORT}`))

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------
const results = []
const ok = (name, note) => { results.push({ name, pass: true, note }); console.log(`  pass  ${name}${note ? ': ' + note : ''}`) }
const bad = (name, why) => { results.push({ name, pass: false, why }); console.log(`  FAIL  ${name}: ${why}`) }
const check = (cond, name, note, why) => (cond ? ok(name, note) : bad(name, why))

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
  const authed = off.filter((r) => AUTHED_ROUTE.test(new URL(r.url).pathname))
  check(authed.length === 0, `${pre}no authenticated RGS call in replay`,
    'no authenticate, play, end-round, wallet or balance request',
    `replay issued ${authed.length} authenticated call(s): ${authed.map((r) => r.url).join(', ')}`)

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
    const assertFlatMultiplier = (r, tag = '') => {
      const txt = r.observed.startText.replace(/\s+/g, ' ').trim()
      check(/×\s*1\b/.test(txt),
        `${tag}the applied multiplier is displayed at 1.0x (guideline item 50)`,
        `base-mode replay renders "${txt}"`,
        `a 1.0x replay rendered no multiplier: "${txt}". The platform shows `
          + '"Cost multiplier x1.00" beside this, so suppressing it fails an item we otherwise meet')
    }

    if (!SELF_TEST) {
      console.log('\nTHE CONTRACT, one healthy session at the live six-parameter shape:')
      const healthy = await driveReplay(browser)
      const { off } = assertContract(healthy)

      // REQ-077: the optional parameters are APPLIED, not defaulted. Two loads
      // differing only in currency and language must render differently. A
      // single-load assertion cannot see a hardcoded value whenever the one test
      // URL happens to match it, which is exactly how the dash gate failed.
      const eur = healthy.observed.startText
      const jpy = (await driveReplay(browser, { qs: { currency: 'JPY', lang: 'ja', amountMicros: '1000000000' } })).observed.startText
      check(eur !== jpy && eur.length > 0 && jpy.length > 0,
        'optional query parameters are applied, not defaulted',
        `EUR renders "${eur}", JPY/ja renders "${jpy}"`,
        `both loads rendered identically ("${eur}"), so currency and lang are not being read from the query string`)
      check(!/NaN/.test(eur + jpy), 'no NaN in the rendered money figure',
        'both loads format cleanly', `NaN present: EUR "${eur}" JPY "${jpy}"`)

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
        assertFn(r, `[seed ${name}] `)
        const failed = results.slice(before).filter((x) => !x.pass)
        const caught = failed.some((f) => expectFail.test(f.name))
        // The seeded run's own failures are expected, so they are removed from
        // the tally: what is being scored is whether the gate NOTICED.
        results.length = before
        seeds.push({ name, caught, why })
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
        { costMultiplier: 1.0, patches: { [bundle.file]: (b) => {
          const m = b.match(/`× \$\{[\s\S]*?cost ="\} `/)
          if (!m) return null
          return b.replace(m[0], '``')
        } } }, /multiplier is displayed at 1\.0x/, assertFlatMultiplier)

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

      // SEED 4: a second replay request. Catches a retry loop or a double mount,
      // both of which have shipped in this project's history on other surfaces.
      await seed('duplicate-replay-request', 'the replay endpoint is called more than once per load',
        { patches: { '/index.html': (b) => {
          if (!b.includes('</head>')) return null
          return b.replace('</head>',
            `<script>fetch('https://${P.rgsHost}/bet/replay/x/1/base/1').catch(()=>{})</script></head>`)
        } } }, /exactly one replay request|replay URL is exact/)

      // SEED 5: the lifecycle branch suppressed, so a failed fetch leaves a
      // blank surface. Observation-boundary seed, declared in the header.
      {
        const r = await driveReplay(browser, {
          respond: '404',
          patches: { '/index.html': (b) => b.includes('</head>')
            ? b.replace('</head>', '<style>.replay-status.error{display:none !important}</style></head>')
            : null },
        })
        const caught = !r.observed.errorVisible
        seeds.push({ name: 'suppressed-error-branch', caught, why: 'a failed fetch renders no error state' })
        console.log(`  ${caught ? 'caught' : 'MISSED'}  SEED suppressed-error-branch: a failed fetch renders no error state`)
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

      const missed = seeds.filter((s) => !s.caught)
      console.log(`\nSEEDS: ${seeds.length - missed.length}/${seeds.length} caught`)
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
