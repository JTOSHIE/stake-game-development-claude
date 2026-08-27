// build_diet_verify.mjs: Build Diet v2 pruned-path, budget and console gate.
//
// IT NOW TESTS REQUEST ORIGIN. Closed 2026-08-05 by S2-C058. What this paragraph
// said until then is kept below in the past tense, because it is the record of a
// real gap and history does not go stale, and because the way the gap survived is
// the useful part.
//
// WHAT IT USED TO SAY, and it was true when written: this gate did NOT test
// request ORIGIN. The pruned-path block computes `rel` by splitting the response
// URL on the base URL, so for any off-origin URL `rel` was undefined and the whole
// block was skipped. The only checks that saw an off-origin request were the 404
// branch and the requestfailed handler, so a SUCCESSFUL external load at status
// 200 was invisible. MEASURED 2026-07-31, not argued: injecting the exact
// historical TR-001 defect, a `fonts.googleapis.com` stylesheet link, into a
// scratch copy of dist and running this gate unmodified returned exit 0 and ALL
// CHECKS PASS, while the gate's own network log recorded the off-origin 200s it
// declined to flag.
//
// WHAT WAS ACTUALLY MISSING WAS A PREDICATE, NOT AN INSTRUMENT, and that is why
// the fix is small. `requests.push({ url, status })` in the response handler runs
// BEFORE `rel` is computed, so every off-origin URL had been sitting in the log on
// every run since the gate was written, unread by any origin test. The gate saw
// it and threw it away. The 2026-07-31 note above, and the row that followed from
// it, both concluded the assertion belonged in another file
// (platform_conformance_item2.mjs) on the strength of "it filters to same-origin
// before counting". That is true of the pruned-path PREDICATE and false of the
// INSTRUMENT, and the difference is one line's ordering.
//
// A RUNTIME LOG NEEDS NO ALLOWLIST, which is what defeated the static form of this
// same check. Twenty absolute origins ship legitimately in the bundle TEXT: Svelte
// runtime error links, W3C XML namespace identifiers which are names rather than
// destinations, a pixi shader credit. A string scan cannot tell a name from a
// destination and would be permanently red. A namespace identifier is never
// fetched, so it never reaches this log. A request either happened or it did not.
//
// This matters because SUBMISSION_DOSSIER.md section 5a and two external reviews
// have graded an external-resource-loading requirement on this gate's output. The
// substance was TRUE at HEAD throughout (nothing external is loaded, and the clean
// bundle reports offOriginRequests 0 across 52 requests), so this was an UNGUARDED
// REGRESSION rather than a live falsehood. It is now guarded.
//
// AND THE REQUIREMENT ITSELF IS A PARAPHRASE. The platform text at
// docs/stake-engine-live/2026-07-29/approval_guidelines_front_end_communication.md:26
// reads "All images and fonts must be loaded from the Stake Engine Content
// Delivery Network (CDN)." That is narrower than "no external resource loading",
// and the broad form is literally false of any shipped game, which must reach
// the RGS. Per convention (l.7) the verbatim text governs.
//
// Serves the ACTUAL pruned dist/ (via `vite preview`, not the dev server,
// the dev server serves public/ unpruned) and drives a headless session
// (base spins plus a bonus buy) capturing every network request, asserting
// zero 404s and zero requests into any pruned legacy path. Also asserts the
// built dist/ directory's total size stays under the 25MB budget (JOB 4,
// 2026-07-13 - the audio-bearing bundle's first re-verification).
//
// Run (from frontend/, after `npm run build`):
//   node scripts/build_diet_verify.mjs              the gate
//   node scripts/build_diet_verify.mjs --self-test  the convention (p) seeded proof
//
// TR-111, 2026-07-31. This line used to say `npx tsx`. Plain node runs it, which
// is what CI does, and a run instruction that names a tool the pipeline does not
// use is the kind of drift that lets a script rot unnoticed. It rotted for ten
// days: see the note in the finally block of run().

import { chromium } from 'playwright'
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { dismissIntro } from './lib/dismissOverlays.mjs'
import { evidenceDir, announceEvidenceMode } from './lib/evidencePaths.mjs'
import { startStaticServer } from './lib/previewServer.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
// CONVENTION (h.1), migrated 2026-07-27. This wrote straight into committed
// evidence, so every plain run dirtied reports/qa/build-diet-network-log.json.
// Almost all of that churn was noise: the preview server picks a random port,
// so 54 of 54 changed lines were a port number, and the real signal was buried
// under it. Caught during the background adoption, when a routine gate run left
// the file modified in a commit that had nothing to do with it. The committed
// snapshot is now written only under FS_WRITE_EVIDENCE=1.
const OUT_DIR = evidenceDir('reports', 'qa')
announceEvidenceMode('build_diet_verify')

// FS_DIST_DIR exists for the seeded self-test at the bottom of this file, which
// serves a THROWAWAY COPY of dist under the OS temp directory so it can plant a
// real violation in it. Unset, which is every ordinary run and every CI run,
// this is the real build output and nothing about the gate changes.
const DIST_DIR = process.env.FS_DIST_DIR || join(__dirname, '..', 'dist')

// ── TR-101: the server runs IN THIS PROCESS now ──────────────────────────────
// Fable's ruling 2026-07-28, option (c). See lib/previewServer.mjs. The three
// names below are adapters so every call site reads unchanged; there is no
// child process to orphan. This script is one of the three that never called
// killPreview at all and leaked a server on every run; under option (c) that
// is no longer a leak, because the server dies with the process.
let _server = null
async function getFreePort() {
  _server = await startStaticServer(DIST_DIR)
  return _server.port
}
function startPreview() { return _server }
function killPreview() { return _server ? _server.close() : undefined }

// R127: THIS NUMBER MEANS TWO DIFFERENT THINGS AND THEY DIFFER BY 2 MB. READ THIS
// BEFORE PLANNING A BUDGET AGAINST IT.
//
// `npm run build` copies frontend/public/** straight off DISK, so a LOCAL run of this
// gate measures the WORKING TREE. CI checks out the committed tree, so a CI run measures
// what a deploy from main would actually ship. Whenever there is uncommitted art in
// frontend/public/assets/, those are different builds and this gate reports different
// numbers for the same commit.
//
// Measured 2026-08-26 at ca3b4818, with 30 modified-but-uncommitted theme rasters in the
// working tree:
//     CI (committed art)      23,771,355 B = 22.67 MB   headroom 2,443,045 B
//     local (working tree)    25,875,171 B = 24.68 MB   headroom   339,229 B
//     the gap is +2,103,763 B of owner work-in-progress art, entirely
//
// Neither number is wrong. Plan against the SMALLER one, because uncommitted art is
// intended to land; but do not quote the local number as "what ships", and do not be
// surprised when CI reports 2 MB less than your terminal did.
const DIST_BUDGET_BYTES = 25 * 1024 * 1024

function getDirSizeBytes(dir) {
  let total = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    total += entry.isDirectory() ? getDirSizeBytes(full) : statSync(full).size
  }
  return total
}

// Paths pruned from dist by vite.config.ts's pruneLegacyAssets, and a request
// whose path starts with any of these is a hard failure.
const PRUNED_PREFIXES = [
  'assets/symbols/', 'assets/frames/', 'assets/videos/',
  'assets/themes/beautiful-game/', 'assets/themes/oil-and-fire/',
  'assets/themes/trap-lane/', 'assets/themes/source/',
  'assets/themes/future-spinner/backgrounds/bg-1.mp4',
  // R130: the hero 'glance' sheet, orphaned when the idle was frozen. Pruned from
  // the bundle by vite.config.ts's LEGACY_FILES, kept in the repository so a
  // reinstatement stays a revert.
  // THIS ENTRY IS NOT THE GUARD, AND R130 SAID IT WAS. Corrected at R131. This list
  // fires on an actual RESPONSE, so it only catches a pruned path the running
  // session happens to request - and this script's own comment says its bonus buy
  // exercises "whatever DOES render, not necessarily the full Overdrive
  // walkthrough". A sheet that only loads inside a state the session may not reach
  // is therefore not covered here. The STATIC asset_reference_gate is what covers
  // it, once R131 taught it to read markup-interpolated assetBase paths.
  'assets/themes/future-spinner/ui/hero/hero_glance_6f.png',
  // R131: the Overdrive perimeter border, removed from App.svelte. Same correction
  // as above applies: this entry catches a REQUEST, and the border only mounted
  // under overdriveVisualActive. The guard that actually catches a re-added border
  // is asset_reference_gate, verified by seeding the reference back into App.svelte
  // and watching the gate go red on this exact path.
  'assets/themes/future-spinner/ui/win/overdrive_perimeter.png',
]
// assets/ui/ is fully pruned. WinPod is gone; nothing in src requests these.
const KEEP_UI = new Set()



async function run() {
  const port = await getFreePort()
  const preview = await startPreview(port)
  const baseUrl = `http://localhost:${port}`
  const requests = []
  const failures = []
  const consoleErrors = []
  let reelModeToggleCount = null
  let reducedMotionErrors = []
  let reducedMotionCssPresent = false

  try {
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
    page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

    page.on('requestfailed', (req) => {
      requests.push({ url: req.url(), status: 'FAILED', failure: req.failure()?.errorText })
    })
    page.on('response', (res) => {
      const url = res.url()
      const status = res.status()
      requests.push({ url, status })
      if (status === 404) failures.push({ url, status, reason: '404 not found' })
      const rel = url.split(baseUrl + '/')[1]
      if (rel) {
        for (const prefix of PRUNED_PREFIXES) {
          if (rel.startsWith(prefix)) {
            failures.push({ url, status, reason: `request into pruned path (${prefix})` })
          }
        }
        if (rel.startsWith('assets/ui/')) {
          const fname = rel.slice('assets/ui/'.length)
          if (!KEEP_UI.has(fname) && status < 400) {
            failures.push({ url, status, reason: 'request into pruned assets/ui/*' })
          }
        }
      }
    })

    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await dismissIntro(page)
    await page.waitForTimeout(200)

    // A bonus buy first (balance must cover the 100x cost). Production
    // preview has no live RGS / curated mock-round data (see reports/qa
    // notes), so this exercises the buy request/response path and whatever
    // DOES render, not necessarily the full Overdrive walkthrough; that full
    // chain's own assets are checked statically below. FeatureMenu replaced
    // the old single-tier FeatureButton (2026-07-07): open the menu, then
    // ACTIVATE the Buy Overdrive card, which opens the same confirm modal.
    // TR-047 follow-up, 2026-07-26. THIS SCRIPT HAD BEEN BROKEN SINCE 2026-07-16
    // AND NOBODY NOTICED, because it is local-only and not a CI gate. HeroSplash
    // (ANIMATION UPLIFT PASS, 2026-07-16) renders over everything on load and
    // intercepts pointer events, so the click below sat out its full 30s
    // actionability timeout and the run died. The committed result it produced,
    // reports/qa/build-diet-network-log.json, is dated 2026-07-14: two days
    // BEFORE the splash landed. So the network-hygiene proof the dossier cites
    // in section 5 was ten days stale and could not be regenerated.
    //
    // dismissIntro is the shared helper that already existed for exactly this;
    // roughly twenty scripts were deduplicated onto it and this one was missed.
    // Wait for the app to be READY before dismissing. dismissIntro polls for
    // about two seconds, and HeroSplash only mounts once loading finishes, so
    // calling it straight after navigation can poll an empty page and return
    // before the splash has even appeared. Every working harness in this
    // directory waits for the spin button first; this one did not exist when
    // that pattern was established.
    const featureMenuBtn = page.locator('[data-testid="feature-menu-button"]')
    if (await featureMenuBtn.count() > 0) {
      await featureMenuBtn.click()
      await page.waitForTimeout(150)
      const activateBonus = page.locator('[data-testid="activate-bonus"]')
      if (await activateBonus.count() > 0) {
        await activateBonus.click()
        await page.waitForSelector('[data-testid="buy-confirm"]', { timeout: 5000 })
        await page.locator('[data-testid="buy-confirm"]').click({ force: true })
        await page.waitForTimeout(1500)
      }
    }

    // Base spins
    for (let i = 0; i < 6; i++) {
      if (!(await page.locator('[data-testid="spin-button"]').isEnabled().catch(() => false))) break
      await page.locator('[data-testid="spin-button"]').click()
      await page.waitForFunction(() => !document.querySelector('[data-testid="spin-button"].spinning'), { timeout: 15000 })
      await page.waitForTimeout(150)
    }

    // JOB 2 (QA re-soak): confirm the dev-only reel-mode toggle is absent from
    // the production bundle - it's gated behind the same import.meta.env.DEV
    // block as the theme selector (App.svelte), so a normal `npm run build` +
    // `vite preview` (this script) is exactly what a real production check needs.
    reelModeToggleCount = await page.locator('[data-testid="reel-mode-toggle"]').count()

    await page.close()

    // JOB 2's reduced-motion pass: emulate the OS preference, reload, and
    // confirm (a) the shipped CSS still contains the prefers-reduced-motion
    // media query (not stripped by the build) and (b) a full spin completes
    // with zero console errors under that preference - GameGrid.svelte's
    // particle bursts are Pixi-drawn (not CSS), so they can't be asserted via
    // a DOM selector; this checks the app functions correctly with the
    // preference active rather than asserting a canvas-internal detail.
    const rmPage = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    rmPage.on('console', (msg) => { if (msg.type() === 'error') reducedMotionErrors.push(msg.text()) })
    rmPage.on('pageerror', (err) => reducedMotionErrors.push('pageerror: ' + err.message))
    await rmPage.emulateMedia({ reducedMotion: 'reduce' })
    await rmPage.goto(baseUrl, { waitUntil: 'networkidle' })
    await rmPage.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    // The reduced-motion page needs the same treatment, and it is the one that
    // was actually failing: the Playwright log named
    // `class="hero-splash ... reduced"`, and only this page emulates reduced
    // motion. Both pages carried their own intro-only block, written before
    // HeroSplash existed; both now use the shared helper.
    await dismissIntro(rmPage)
    await rmPage.waitForTimeout(200)
    await rmPage.locator('[data-testid="spin-button"]').click()
    await rmPage.waitForFunction(() => !document.querySelector('[data-testid="spin-button"].spinning'), { timeout: 15000 })
    await rmPage.waitForTimeout(150)
    const shippedCss = requests.map((r) => r.url).find((u) => u.endsWith('.css'))
    if (shippedCss) {
      const cssRes = await rmPage.request.get(shippedCss)
      const cssText = await cssRes.text()
      reducedMotionCssPresent = /prefers-reduced-motion/.test(cssText)
    }
    await rmPage.close()
    await browser.close()
  } finally {
    // TR-111. This read `preview.kill()` for ten days and killed the whole gate.
    //
    // The TR-101 migration to an in-process node:net server changed what this
    // handle IS: startStaticServer resolves { url, port, close }, and there has
    // never been a `kill` on it. So every run threw TypeError HERE, in the
    // finally, which meant the assertions at the bottom of run() were never
    // reached and this gate had been seen neither to pass NOR to fail.
    //
    // WORTH KNOWING WHY IT WAS INVISIBLE: a throw from a `finally` REPLACES any
    // exception already travelling out of the `try`. So this one line both broke
    // the gate and hid whatever else might have been wrong underneath it, and
    // the top-level catch still exited 1, which reads exactly like a gate that
    // ran and failed. The seeded self-test below is what distinguishes the two,
    // because its NEGATIVE control demands a real PASS line rather than exit 0.
    await killPreview()
  }

  const distSizeBytes = getDirSizeBytes(DIST_DIR)

  // JOB 4 / TR-062. The build stamp must cost NOTHING at runtime.
  //
  // `dist/build-info.json` exists so a human or a tool reading the artefact can
  // answer "which commit is this", and the console boot line prints the same
  // facts from values Vite inlined at build time. The obvious wrong way to
  // print them is a runtime fetch of that file, which would add a request to
  // every single session, so the ruling has this gate assert against it
  // explicitly rather than trusting the implementation to stay honest.
  const buildInfoRequests = requests.filter((r) => /build-info\.json/.test(r.url))
  if (buildInfoRequests.length > 0) {
    failures.push({
      url: buildInfoRequests[0].url,
      reason: 'build-info.json was FETCHED at runtime. It is provenance, not configuration: '
        + 'the boot line reads values inlined by vite define. See TR-062.',
    })
  }

  // ── S2-C058: THE ORIGIN ASSERTION ──────────────────────────────────────────
  //
  // THE GAP THIS CLOSES, in the gate's own words at :3-13: it does NOT test
  // request ORIGIN, because `rel` is undefined for any off-origin URL and the
  // whole pruned-path block is skipped, so a SUCCESSFUL external load at status
  // 200 was invisible. Measured 2026-07-31 by seeding a real fonts.googleapis.com
  // stylesheet: exit 0, ALL CHECKS PASS.
  //
  // WHY THIS GATE AND NOT THE ONE THE ROW NAMES. The row, and the brief, send
  // this assertion to platform_conformance_item2.mjs on the reasoning that
  // build_diet_verify "filters to same-origin before counting, so it cannot
  // observe a successful external request". That is true of the pruned-path
  // PREDICATE and false of the INSTRUMENT: `requests.push({ url, status })` at
  // :136 runs BEFORE `rel` is computed, so every off-origin URL has been sitting
  // in the log on every run, unread by any origin test. The instrument saw; the
  // predicate discarded. platform_conformance_item2 does record requests too, but
  // it drives a dev server rather than dist, writes five committed evidence
  // files, and has no seeding hook, so moving here costs nothing and keeps the
  // assertion beside the bundle it is about.
  //
  // AND WHY A RUNTIME LOG NEEDS NO ALLOWLIST, which is what defeated the static
  // form of this check. Twenty absolute origins ship legitimately in the bundle
  // TEXT: Svelte runtime error links, W3C XML namespace identifiers which are
  // names rather than destinations, a pixi shader credit. A string scan cannot
  // tell a name from a destination and would be permanently red. A request log
  // has no such problem: a namespace identifier is never fetched, so it never
  // appears here. A request either happened or it did not.
  //
  // Failed off-origin requests count too, not only successful ones. Offline, an
  // external reference fails and trips the existing `failed` check for the wrong
  // reason; online it returns 200 and was invisible. Asserting on the LOG rather
  // than the STATUS makes the verdict the same either way.
  const baseOrigin = new URL(baseUrl).origin
  const offOrigin = []
  for (const r of requests) {
    const u = String(r.url)
    // Not destinations: inline data, object URLs, and the blank page.
    if (/^(data|blob|about|javascript|filesystem):/i.test(u)) continue
    let origin
    try { origin = new URL(u).origin } catch { continue }
    if (origin === baseOrigin) continue
    offOrigin.push({ url: u, status: r.status, origin })
  }
  for (const r of offOrigin) {
    failures.push({ url: r.url, status: r.status, reason: `off-origin request to ${r.origin}` })
  }

  const summary = {
    buildInfoRequests: buildInfoRequests.length,
    totalRequests: requests.length,
    offOriginRequests: offOrigin.length,
    offOriginDetail: offOrigin,
    notFound: requests.filter((r) => r.status === 404).length,
    failed: requests.filter((r) => r.status === 'FAILED').length,
    prunedPathHits: failures.length,
    consoleErrors: consoleErrors.length,
    failures,
    consoleErrorMessages: consoleErrors,
    distSizeBytes,
    distSizeMB: Math.round((distSizeBytes / (1024 * 1024)) * 100) / 100,
    distBudgetMB: DIST_BUDGET_BYTES / (1024 * 1024),
    distUnderBudget: distSizeBytes < DIST_BUDGET_BYTES,
    reelModeToggleAbsentFromProdBundle: reelModeToggleCount === 0,
    reducedMotion: {
      cssRulePresent: reducedMotionCssPresent,
      spinCompletedWithNoErrors: reducedMotionErrors.length === 0,
      errors: reducedMotionErrors,
    },
  }

  writeFileSync(join(OUT_DIR, 'build-diet-network-log.json'), JSON.stringify({ requests, summary }, null, 2))
  console.log(JSON.stringify(summary, null, 2))

  if (
    summary.notFound > 0 || summary.failed > 0 || summary.prunedPathHits > 0 || summary.consoleErrors > 0 ||
    // Named in its own clause rather than left to ride on prunedPathHits, which
    // counts the whole failures array. A reader of this condition should be able
    // to see that origin is asserted without tracing what else pushes there.
    summary.offOriginRequests > 0 ||
    !summary.distUnderBudget ||
    !summary.reelModeToggleAbsentFromProdBundle ||
    !summary.reducedMotion.cssRulePresent || !summary.reducedMotion.spinCompletedWithNoErrors
  ) {
    console.error('BUILD DIET VERIFY: FAILURES DETECTED')
    process.exit(1)
  }
  console.log(`BUILD DIET VERIFY: ALL CHECKS PASS (zero 404s, zero pruned-path requests, zero console errors, ` +
    `dist ${summary.distSizeMB}MB < ${summary.distBudgetMB}MB budget, reel-mode toggle absent, ` +
    `reduced-motion CSS present + spin clean)`)
}

// ── CONVENTION (p): the seeded self-test ─────────────────────────────────────
//
// "A gate that has never been seen to fail is not evidence. It is a script that
// prints PASS." This gate could not even do that: see the note in the finally
// block above. So the requirement here is sharper than "prove it can go red",
// because after TR-111 EVERY run went red, with exit code 1, from the top-level
// catch. Exit status alone cannot tell a working gate from a dead one.
//
// Hence the pairing, and the asymmetry in what each half asserts:
//
//   NEGATIVE CONTROL: the unmodified bundle must produce the real PASS LINE.
//       This is the half that catches the dead gate. A thrown TypeError exits 1
//       and never prints that line, so this control fails on a broken gate even
//       though a naive exit-code check would have called it fine.
//
//   POSITIVE CONTROL: a seeded bundle must produce the real FAILURES DETECTED
//       line AND name the seeded path in its summary. Not merely exit 1: an
//       exit-1 assertion would have been satisfied by the very defect this row
//       exists to fix, which is the trap convention (p) was written about.
//
// WHAT IS SEEDED, and why this form. Convention (p): "plant the exact defect the
// gate exists to catch, in the form it really occurs". The form it really occurs
// in is a live reference to an asset that vite.config.ts's pruneLegacyAssets
// strips from dist, which is TR-047's actual history. That reference does NOT
// show up as a 404, because previewServer.mjs answers an unknown path with
// index.html at status 200 the way a single-page app must. It is invisible to
// every 404 check and visible only to the pruned-prefix test, which is exactly
// why that test exists as a separate assertion. Seeding a 404 instead would have
// proved a different assertion and learned nothing about this one.
async function selfTest() {
  const SEEDED_PATH = 'assets/symbols/tr111_seeded_violation.png'
  const scratchRoot = mkdtempSync(join(tmpdir(), 'build-diet-selftest-'))
  console.log(`SELF-TEST: scratch root ${scratchRoot}`)
  console.log('SELF-TEST: the repository working tree is never written to by this mode.')

  const realDist = join(__dirname, '..', 'dist')
  if (!existsSync(realDist)) {
    console.error(`SELF-TEST: ${realDist} does not exist. Run \`npm run build\` first.`)
    process.exit(1)
  }

  /** Run THIS script, unmodified, as a child against the given dist copy. */
  function runGateAgainst(distDir) {
    const res = spawnSync(process.execPath, [fileURLToPath(import.meta.url)], {
      env: { ...process.env, FS_DIST_DIR: distDir, FS_WRITE_EVIDENCE: '' },
      encoding: 'utf8',
      timeout: 10 * 60 * 1000,
    })
    return { code: res.status, out: (res.stdout || '') + (res.stderr || '') }
  }

  const problems = []

  // ── NEGATIVE CONTROL ───────────────────────────────────────────────────────
  const cleanDist = join(scratchRoot, 'clean')
  cpSync(realDist, cleanDist, { recursive: true })
  console.log('\nSELF-TEST negative control: unmodified bundle, expecting a real PASS.')
  const clean = runGateAgainst(cleanDist)
  if (!/BUILD DIET VERIFY: ALL CHECKS PASS/.test(clean.out)) {
    problems.push(
      'NEGATIVE CONTROL FAILED: the unmodified bundle did not print the PASS line. '
      + `Exit code ${clean.code}. This is the control that catches a gate which throws `
      + 'before reaching its assertions, so read the output below as a live gate defect '
      + 'rather than as a bundle defect.\n' + tail(clean.out),
    )
  } else {
    console.log('SELF-TEST negative control: PASS line present, so the gate reaches its assertions.')
  }

  // ── POSITIVE CONTROL ───────────────────────────────────────────────────────
  const seededDist = join(scratchRoot, 'seeded')
  cpSync(realDist, seededDist, { recursive: true })
  const indexPath = join(seededDist, 'index.html')
  const html = readFileSync(indexPath, 'utf8')
  if (!html.includes('</body>')) {
    console.error('SELF-TEST: seeded copy has no </body> to inject before. Aborting rather than guessing.')
    process.exit(1)
  }
  // Off-screen rather than display:none, so there is no argument about whether
  // the browser elects to fetch it. It is fetched, and that fetch is the seed.
  const seed = `<img src="${SEEDED_PATH}" alt="" `
    + `style="position:absolute;left:-9999px;top:0;width:1px;height:1px">`
  writeFileSync(indexPath, html.replace('</body>', `${seed}</body>`))
  console.log(`\nSELF-TEST positive control: seeded ${SEEDED_PATH}, expecting a real RED.`)
  const seeded = runGateAgainst(seededDist)
  if (!/BUILD DIET VERIFY: FAILURES DETECTED/.test(seeded.out)) {
    problems.push(
      'POSITIVE CONTROL FAILED: the seeded bundle did not print the FAILURES DETECTED line. '
      + `Exit code ${seeded.code}. Exit status alone is NOT accepted here, because the TR-111 `
      + 'defect exited 1 on every run without ever asserting anything.\n' + tail(seeded.out),
    )
  } else if (!seeded.out.includes(SEEDED_PATH)) {
    problems.push(
      'POSITIVE CONTROL FAILED: the gate went red but its summary never names the seeded path '
      + `${SEEDED_PATH}, so it went red for some OTHER reason and this run proves nothing about `
      + 'the pruned-path assertion.\n' + tail(seeded.out),
    )
  } else if (!/request into pruned path/.test(seeded.out)) {
    problems.push(
      'POSITIVE CONTROL FAILED: the gate went red and named the seeded path, but not via the '
      + 'pruned-path reason. The assertion under test is the pruned-prefix one; a 404 or a '
      + 'console error passing for it would be the exact substitution convention (p) forbids.\n'
      + tail(seeded.out),
    )
  } else {
    console.log('SELF-TEST positive control: RED, and attributed to the pruned-path assertion by name.')
  }

  // ── S2-C058 POSITIVE CONTROL: the external origin ──────────────────────────
  //
  // THE FORM THAT ACTUALLY SHIPPED. This is TR-001 replayed: a
  // fonts.googleapis.com stylesheet link in the served bundle. CLAUDE.md's
  // compliance section names that exact host as the thing that must never ship,
  // and 2026-07-31 measured this gate returning exit 0 and ALL CHECKS PASS with
  // precisely this seed in place. That measurement is what this control now
  // inverts.
  //
  // The clean-bundle side of the pair is not a separate run: the negative control
  // above already ran the unmodified bundle, and it now also carries
  // offOriginRequests, so its PASS is the assertion that HEAD makes zero external
  // requests. Checked explicitly below rather than inferred, because a control
  // that passes for an unexamined reason is not a control.
  const originDist = join(scratchRoot, 'seeded-origin')
  cpSync(realDist, originDist, { recursive: true })
  const originIndexPath = join(originDist, 'index.html')
  const originHtml = readFileSync(originIndexPath, 'utf8')
  if (!originHtml.includes('</head>')) {
    console.error('SELF-TEST: seeded copy has no </head> to inject before. Aborting rather than guessing.')
    process.exit(1)
  }
  const SEEDED_ORIGIN = 'https://fonts.googleapis.com'
  const originSeed = `<link rel="stylesheet" href="${SEEDED_ORIGIN}/css2?family=Inter:wght@400;700&display=swap">`
  writeFileSync(originIndexPath, originHtml.replace('</head>', `${originSeed}</head>`))
  console.log(`\nSELF-TEST positive control: seeded a ${SEEDED_ORIGIN} stylesheet, expecting a real RED.`)
  const originSeeded = runGateAgainst(originDist)
  if (!/BUILD DIET VERIFY: FAILURES DETECTED/.test(originSeeded.out)) {
    problems.push(
      'ORIGIN CONTROL FAILED: the bundle with an external font stylesheet did not print the '
      + `FAILURES DETECTED line. Exit code ${originSeeded.code}. This is the exact state measured `
      + 'on 2026-07-31, when this gate returned exit 0 on this seed.\n' + tail(originSeeded.out),
    )
  } else if (!new RegExp(`off-origin request to ${SEEDED_ORIGIN}`).test(originSeeded.out)) {
    problems.push(
      'ORIGIN CONTROL FAILED: the gate went red but not via the off-origin reason naming '
      + `${SEEDED_ORIGIN}. Offline, an external reference also trips the pre-existing `
      + '"failed" check, and letting that stand in for the origin assertion would be the exact '
      + 'substitution convention (p) forbids: the assertion under test is ORIGIN, not reachability.\n'
      + tail(originSeeded.out),
    )
  } else {
    console.log(`SELF-TEST origin control: RED, and attributed to the off-origin assertion naming ${SEEDED_ORIGIN}.`)
  }
  if (!/"offOriginRequests": 0/.test(clean.out)) {
    problems.push(
      'ORIGIN NEGATIVE CONTROL FAILED: the unmodified bundle did not report offOriginRequests: 0. '
      + 'HEAD is expected to make no external request at all, so either the bundle has acquired one '
      + 'or the predicate is counting something it should not.\n' + tail(clean.out),
    )
  } else {
    console.log('SELF-TEST origin negative control: the unmodified bundle makes ZERO off-origin requests.')
  }

  if (problems.length > 0) {
    console.error('\nBUILD DIET VERIFY SELF-TEST: FAILED')
    for (const p of problems) console.error('\n  ' + p)
    process.exit(1)
  }
  console.log('\nBUILD DIET VERIFY SELF-TEST: PASS '
    + '(clean bundle asserts and passes with zero off-origin requests; seeded pruned-path reference '
    + 'and seeded external font origin are both caught by name)')
}

function tail(s, n = 40) {
  return s.split('\n').slice(-n).map((l) => '      | ' + l).join('\n')
}

const main = process.argv.includes('--self-test') ? selfTest : run
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
