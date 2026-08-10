// r043_replay_audio_proof.mjs
//
// B9 / R043 PHASE 2: BET REPLAY IS NO LONGER SILENT, PROVED ON THE SHIPPED
// BUNDLE.
//
// The audit's finding was file-shaped ("ReplayMode.svelte contains zero audio
// references") but the platform requirement is behaviour-shaped: "Show all
// animations, sounds, and visual effects"
// (approval_guidelines_game_replay_requirements.md:130). So this proof reads
// BEHAVIOUR: it serves dist, wraps HTMLMediaElement.prototype.play before the
// bundle loads, drives real replays with a real click on START, and counts
// what actually reached the audio pipeline.
//
// WHAT IS ASSERTED, per the brief:
//   1. a REAL-MONEY replay produces audible cue invocations greater than zero,
//      including the spin-start, reel-stop and win-presentation cues;
//   2. a SOCIAL replay produces audible cue invocations greater than zero;
//   3. under GLOBAL MUTE the same replay produces exactly ZERO audible
//      invocations (warm-up primes play muted by design and are counted
//      separately);
//   4. NO cue fires after the replay ends (the count is frozen at the
//      play-again screen and re-read 2.5 seconds later);
//   5. the WINCAP cue fires at the splash, BEFORE the player's COLLECT,
//      exactly where live play fires it (App.svelte:1677);
//   6. a FEATURE replay animates its triggering spin and lands its scatters
//      audibly before the entry card raises (the feature-trigger
//      acknowledgement, GameGrid's own cues).
//
// THE UNIT NOTE, because the fixtures would otherwise mislead: the platform's
// replay endpoint returns payoutMultiplier as a plain bet-multiple ("25.0",
// approval_guidelines_game_replay_requirements.md:91), while the book fixtures
// carry centibets (390 = 3.9x, math_math_file_format.md:95). This harness
// serves fixture/100, the real endpoint's unit, as polish_review_capture.mjs
// already does.
//
// SELF-TEST (convention p). The defect's real form was a silent replay, and
// its observable is zero audible invocations. The seed is planted at the
// observation boundary, declared as such per the replay_contract_gate
// precedent: the served page boots with the persisted mute flag set, which is
// byte-for-byte the pre-fix observable (silence end to end), and the detector
// must report zero audible cues for it, proving assertion 1 can actually go
// red. The unmuted run is the negative control.
//
// Frames and the audio trace go to reports/screens/r043-replay-audio/ under
// FS_WRITE_EVIDENCE=1 (convention h.1), scratch otherwise.
//
// Usage, from frontend/, after `npm run build`:
//   node scripts/r043_replay_audio_proof.mjs
//   node scripts/r043_replay_audio_proof.mjs --self-test

import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { evidenceDir, announceEvidenceMode } from './lib/evidencePaths.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const DIST = join(HERE, '..', 'dist')
const SELF_TEST = process.argv.includes('--self-test')

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('R043 REPLAY AUDIO PROOF: no build at frontend/dist. Run `npm run build` first.')
  process.exit(2)
}

const FIX = JSON.parse(readFileSync(
  join(HERE, '..', 'src', 'lib', 'services', '__fixtures__', 'replay_rounds.json'), 'utf8'))

const PORT = 4527
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.webm': 'video/webm', '.webp': 'image/webp',
}

const P = {
  game: '0e872280-c94a-4bcf-a55b-b649c4a02fc0', version: '1', mode: 'base',
  event: '77001', rgsHost: 'rgs.stake-engine.com', currency: 'USD',
  amountMicros: '1000000', lang: 'en', social: 'false',
}
const replayUrl = (o = {}) => {
  const p = { ...P, ...o }
  return `http://localhost:${PORT}/?replay=true&game=${p.game}&version=${p.version}`
    + `&mode=${p.mode}&event=${p.event}&rgs_url=${p.rgsHost}&currency=${p.currency}`
    + `&amount=${p.amountMicros}&lang=${p.lang}&device=desktop&social=${p.social}`
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

/** Drive one replay page. Returns helpers bound to the page. */
async function open(browser, { round, muted = false, qs = {} }) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.addInitScript(({ mutedFlag }) => {
    // The instrument: every play() that reaches the audio pipeline is logged
    // with the element's mute state at the moment of the call, so warm-up
    // primes (muted by design, soundService.warmUpAudio) are separable from
    // audible cues.
    window.__audioPlays = []
    const orig = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function (...a) {
      window.__audioPlays.push({
        src: (this.currentSrc || this.src || '').split('/').pop(),
        muted: this.muted, volume: this.volume, at: Math.round(performance.now()),
      })
      return orig.apply(this, a)
    }
    if (mutedFlag) localStorage.setItem('fs_muted', '1')
  }, { mutedFlag: muted })
  await page.route('**/bet/replay/**', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({
      payoutMultiplier: round.payoutMultiplier / 100, // centibets -> bet-multiples, the endpoint's unit
      costMultiplier: 1.0,
      state: { events: round.events },
    }),
  }))
  await page.goto(replayUrl(qs), { waitUntil: 'networkidle' })
  const plays = () => page.evaluate(() => window.__audioPlays)
  const audible = async () => (await plays()).filter((p) => !p.muted)
  return { page, plays, audible }
}

let failures = 0
const ok = (m) => console.log(`  ok    ${m}`)
const bad = (m) => { failures++; console.error(`  FAIL  ${m}`) }
const assert = (cond, m) => (cond ? ok(m) : bad(m))

const EVID = evidenceDir('reports', 'screens', 'r043-replay-audio')
announceEvidenceMode('r043_replay_audio_proof')
const trace = {}

const srv = await serve()
const browser = await chromium.launch()
try {
  if (SELF_TEST) {
    // THE SEED: the pre-fix observable, silence end to end, planted at the
    // observation boundary (the persisted mute flag) as declared above. The
    // detector must read ZERO audible cues, which is what proves the real
    // run's greater-than-zero assertion is capable of failing.
    const s = await open(browser, { round: FIX.base.win, muted: true })
    await s.page.locator('.start-replay').click({ timeout: 10_000 })
    await s.page.locator('.play-again').waitFor({ state: 'visible', timeout: 30_000 })
    const aud = await s.audible()
    const red = aud.length === 0
    console.log(`  ${red ? 'caught ' : 'MISSED '} seeded silent replay: detector reads ${aud.length} audible cue(s)`)
    await s.page.close()

    // NEGATIVE CONTROL: the same detector over the unmuted bundle reads sound.
    const c = await open(browser, { round: FIX.base.win })
    await c.page.locator('.start-replay').click({ timeout: 10_000 })
    await c.page.locator('.play-again').waitFor({ state: 'visible', timeout: 30_000 })
    const caud = await c.audible()
    const clean = caud.length > 0
    console.log(`  ${clean ? 'clean  ' : 'FALSE+ '} unmuted control: detector reads ${caud.length} audible cue(s)`)
    await c.page.close()

    if (!red || !clean) {
      console.error('\nR043 REPLAY AUDIO PROOF SELF-TEST: FAIL')
      process.exit(1)
    }
    console.log('\nR043 REPLAY AUDIO PROOF SELF-TEST: PASS (silence detected as silence, sound as sound)')
    process.exit(0)
  }

  // ── 1. Real-money replay: cues > 0, and the named cues are among them ──────
  {
    const r = await open(browser, { round: FIX.base.win })
    await r.page.screenshot({ path: join(EVID, '01-real-ready.png') })
    await r.page.locator('.start-replay').click({ timeout: 10_000 })
    await r.page.waitForTimeout(900)
    await r.page.screenshot({ path: join(EVID, '02-real-playing.png') })
    await r.page.locator('.play-again').waitFor({ state: 'visible', timeout: 30_000 })
    await r.page.screenshot({ path: join(EVID, '03-real-complete.png') })
    const aud = await r.audible()
    trace.real = { audible: aud, total: (await r.plays()).length }
    assert(aud.length > 0, `real-money replay is audible: ${aud.length} cue invocation(s)`)
    assert(aud.some((p) => p.src.includes('spin')), 'the spin-start cue fired')
    assert(aud.some((p) => p.src.includes('reel_stop')), 'the reel-stop cue fired')
    assert(aud.some((p) => p.src.includes('win_')), 'the win-presentation cue fired')

    // ── 4. No cue after replay end ──────────────────────────────────────────
    const frozen = (await r.plays()).length
    await r.page.waitForTimeout(2500)
    const after = (await r.plays()).length
    assert(after === frozen, `no cue after replay end (${frozen} at completion, ${after} after 2.5s)`)
    await r.page.close()
  }

  // ── 2. Social replay: cues > 0 ─────────────────────────────────────────────
  {
    const s = await open(browser, { round: FIX.base.win, qs: { social: 'true', currency: 'SC' } })
    await s.page.locator('.start-replay').click({ timeout: 10_000 })
    await s.page.locator('.play-again').waitFor({ state: 'visible', timeout: 30_000 })
    await s.page.screenshot({ path: join(EVID, '04-social-complete.png') })
    const aud = await s.audible()
    trace.social = { audible: aud, total: (await s.plays()).length }
    assert(aud.length > 0, `social replay is audible: ${aud.length} cue invocation(s)`)
    await s.page.close()
  }

  // ── 3. Global mute: zero audible invocations ───────────────────────────────
  {
    const m = await open(browser, { round: FIX.base.win, muted: true })
    await m.page.locator('.start-replay').click({ timeout: 10_000 })
    await m.page.locator('.play-again').waitFor({ state: 'visible', timeout: 30_000 })
    const all = await m.plays()
    const aud = all.filter((p) => !p.muted)
    trace.muted = { audible: aud, total: all.length }
    assert(aud.length === 0, `global mute is honoured: 0 audible of ${all.length} total invocation(s)`)
    await m.page.close()
  }

  // ── 5. Wincap: the cue fires at the splash, before COLLECT ────────────────
  {
    const w = await open(browser, { round: FIX.base.cap, qs: { event: '77002' } })
    await w.page.locator('.start-replay').click({ timeout: 10_000 })
    await w.page.locator('[data-testid="max-win-collect"]').waitFor({ state: 'visible', timeout: 15_000 })
    await w.page.screenshot({ path: join(EVID, '05-wincap-splash.png') })
    const aud = await w.audible()
    trace.wincap = { audibleAtSplash: aud }
    assert(aud.some((p) => p.src.includes('win_epic')),
      'the wincap cue (win_epic) fired at the splash, before COLLECT')
    await w.page.close()
  }

  // ── 6. Feature trigger: the triggering spin lands its scatters audibly ────
  {
    const f = await open(browser, { round: FIX.base.feature, qs: { event: '77003' } })
    await f.page.locator('.start-replay').click({ timeout: 10_000 })
    await f.page.locator('[data-testid="overdrive-entry"]').waitFor({ state: 'visible', timeout: 45_000 })
    await f.page.screenshot({ path: join(EVID, '06-feature-entry.png') })
    const aud = await f.audible()
    trace.feature = { audibleAtEntry: aud }
    assert(aud.some((p) => p.src.includes('spin')), 'the triggering spin started audibly')
    assert(aud.some((p) => p.src.includes('scatter_land')),
      'the scatter-land cue fired before the entry card (the feature-trigger acknowledgement)')
    await f.page.close()
  }
} finally {
  await browser.close()
  srv.close()
}

writeFileSync(join(EVID, 'audio_trace.json'), JSON.stringify({
  _what: 'R043 PHASE 2 / B9. Every HTMLMediaElement.play() observed during the proof replays, audible vs muted.',
  _bundle: 'frontend/dist at the commit this file ships in',
  ...trace,
}, null, 2) + '\n')
console.log(`\ntrace written to ${join(EVID, 'audio_trace.json')}`)

if (failures) {
  console.error(`\nR043 REPLAY AUDIO PROOF: FAIL (${failures})`)
  process.exit(1)
}
console.log('\nR043 REPLAY AUDIO PROOF: PASS (the replay surface sounds, honours mute, and is silent after the end)')
