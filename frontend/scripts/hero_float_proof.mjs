// hero_float_proof.mjs - R138 proof: the idle float, the reaction crossfade,
// and the fences around both.
//
// Requires a running dev server. Run (from frontend/):
//   LAYOUT_AUDIT_URL=http://localhost:5174 node scripts/hero_float_proof.mjs
//
// Writes reports/screens/r138-idle-float/ (via evidencePaths: scratch unless
// FS_WRITE_EVIDENCE=1, which the R138 session sets because producing this
// evidence is that session's own job):
//   - hero-float-proof.json   every measurement below
//   - idle-1280.png, win-mid-dissolve.png, epic-mid-dissolve.png,
//     brace-mid-dissolve.png, reduced-motion.png, portrait.png
//
// WHAT IT PROVES, one letter per brief requirement:
//   A. idle = rest pose + tiny vertical float: over 8s the wrapper's translateY
//      travels 2 to 4px peak to peak on a period near 5s, the SHEET never
//      animates and never leaves background-position-x 0 (pose pixels do not
//      tick), the body never transforms at rest (no punch), and the hero's
//      amplitude sits at or below the car's, both sampled live.
//   B. small win: no reaction (5x stays idle, no crossfade buffer mounts).
//   C. big win: the crossfade runs - the top buffer rides exactly one frame
//      ahead of the bottom at every sample, the fade sweeps 0 to 1, both
//      buffers exit to rest, and the frame rate holds through it.
//   D. epic: both of the top buffer's clocks stretch to the 1.9s hold, and a
//      big win landing mid-epic cannot flip the tier (the R121/R129 class).
//   E. feature entry: the brace crossfades on the energy timing.
//   F. reduced motion: no float, no dissolve, mid-flight reactions dropped.
//   G. portrait: same truths at 390x844, or an honest record that the scene
//      does not mount there.
//   H. zero console errors and zero page errors across the whole run.
//
// Exits non-zero on any failed assertion.

import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { evidenceDir } from './lib/evidencePaths.mjs'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const OUT_DIR = evidenceDir('reports', 'screens', 'r140-dense-reactions')
const BASE_URL = process.env.LAYOUT_AUDIT_URL ?? 'http://localhost:5173'

const results = { baseUrl: BASE_URL, sections: {}, consoleErrors: [], pageErrors: [] }
let failures = 0
function assert(section, label, ok, detail) {
  const rec = { label, ok, detail }
  ;(results.sections[section] ??= []).push(rec)
  if (!ok) { failures++; console.error(`  FAIL [${section}] ${label}: ${JSON.stringify(detail)}`) }
  else console.log(`  ok   [${section}] ${label}`)
}

/** Sample wrapper/car/sheet/body state for `ms` at ~40ms cadence. */
async function sampleScene(page, ms) {
  return page.evaluate(async (ms) => {
    const charLayer = document.querySelector('.char-layer')
    const car = document.querySelector('.car-layer')
    const sheet = document.querySelector('[data-testid="hero-idle"]')
    const body = document.querySelector('.hero-body')
    if (!charLayer || !sheet || !body) return null
    const t0 = performance.now()
    const out = []
    while (performance.now() - t0 < ms) {
      const my = sel => { const m = new DOMMatrixReadOnly(getComputedStyle(sel).transform); return m.m42 }
      out.push({
        t: +(performance.now() - t0).toFixed(1),
        heroY: +my(charLayer).toFixed(3),
        carY: car ? +my(car).toFixed(3) : null,
        sheetAnim: getComputedStyle(sheet).animationName,
        sheetBg: getComputedStyle(sheet).backgroundPositionX,
        bodyTransform: getComputedStyle(body).transform,
      })
      await new Promise(r => setTimeout(r, 40))
    }
    return out
  }, ms)
}

function amplitude(list) { return +(Math.max(...list) - Math.min(...list)).toFixed(3) }
function periodOf(samples, key) {
  const ys = samples.map(s => s[key])
  const mid = (Math.min(...ys) + Math.max(...ys)) / 2
  const crossings = []
  for (let i = 1; i < samples.length; i++) {
    if (samples[i - 1][key] > mid && samples[i][key] <= mid) crossings.push(samples[i].t)
  }
  const ps = crossings.slice(1).map((t, i) => t - crossings[i])
  return ps.length ? +(ps.reduce((a, b) => a + b) / ps.length).toFixed(0) : null
}

/** Force a settled win of `mult` x bet through the dev-only store hook.
 *  THE SPIN MUST BE HELD FOR A FLUSH, not toggled synchronously: Svelte batches
 *  store-driven reactive statements, so isSpinning true-then-false inside one
 *  task never shows the component the intermediate true and the round latch
 *  (`$: if ($isSpinning) reactedThisRound = false`) never resets. The first
 *  draft of this proof did exactly that, and every reaction after the first
 *  was silently refused - visible as an epic that never started, not as an
 *  error anywhere. */
async function forceWin(page, mult) {
  await page.evaluate(async (mult) => {
    const S = window.__testStores
    S.betAmount.set(1)
    S.isSpinning.set(true)
    await new Promise(r => setTimeout(r, 60))
    S.winAmount.set(mult)
    S.isSpinning.set(false)
  }, mult)
}

async function motionState(page) {
  return page.evaluate(() => {
    const body = document.querySelector('.hero-body')
    const cross = document.querySelector('[data-testid="hero-cross"]')
    return {
      motion: body?.getAttribute('data-motion'),
      tier: body?.getAttribute('data-tier'),
      crossMounted: !!cross,
    }
  })
}

/** Trace one reaction: buffer offsets, fade sweep, animation clocks. The frame
 *  rate is deliberately NOT measured here - the polling below is main-thread
 *  load, and a first draft read its own polling back as dropped frames. */
async function traceReaction(page, ms) {
  return page.evaluate(async (ms) => {
    const sheet = document.querySelector('[data-testid="hero-idle"]')
    const cross = document.querySelector('[data-testid="hero-cross"]')
    if (!cross) return { error: 'no cross buffer mounted' }
    const anims = cross.getAnimations().map(a => ({
      name: a.animationName, duration: a.effect.getTiming().duration, iterations: a.effect.getTiming().iterations,
    }))
    const sheetAnims = sheet.getAnimations().map(a => ({ name: a.animationName, duration: a.effect.getTiming().duration }))
    const frames = []
    const t0 = performance.now()
    while (performance.now() - t0 < ms) {
      const c = document.querySelector('[data-testid="hero-cross"]')
      frames.push({
        t: +(performance.now() - t0).toFixed(1),
        bottom: parseFloat(getComputedStyle(sheet).backgroundPositionX),
        top: c ? parseFloat(getComputedStyle(c).backgroundPositionX) : null,
        fade: c ? +parseFloat(getComputedStyle(c).opacity).toFixed(3) : null,
      })
      // R140: rAF, not setTimeout(30). The win fade ramp fell from 100ms to
      // 48.387ms when the sheet went 16 -> 32 frames, and a 30ms sampler on a
      // 48ms sawtooth resolves under two samples a ramp - the low/high check
      // below would have become a phase lottery. rAF gives ~2.9 samples a ramp.
      await new Promise(r => requestAnimationFrame(() => r()))
    }
    return { anims, sheetAnims, frames }
  }, ms)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
page.on('console', m => { if (m.type() === 'error') results.consoleErrors.push(m.text()) })
page.on('pageerror', e => results.pageErrors.push(String(e)))
await page.goto(BASE_URL, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-testid="hero-idle"]', { timeout: 15000 })
await page.waitForFunction(() => window.__testStores?.balance, { timeout: 8000 })
// The once-per-session intro splash sits over the scene; the first run of this
// proof screenshotted six copies of it while every measurement beneath passed.
await dismissIntro(page)

// ── A. the idle float ────────────────────────────────────────────────────────
console.log('A. idle float, 11.5s sample at 1280x720')
{
  // 11.5s, not 8s: the period estimator needs two midline down-crossings, and
  // an 8s window catches one as often as two on a 5s period - the first run of
  // this proof failed on exactly that phase accident, not on the float.
  const s = await sampleScene(page, 11500)
  const heroAmp = amplitude(s.map(x => x.heroY))
  const carAmp = amplitude(s.map(x => x.carY))
  const heroPeriod = periodOf(s, 'heroY')
  assert('A', 'wrapper floats 2 to 4px peak to peak', heroAmp >= 2 && heroAmp <= 4, { heroAmp })
  assert('A', 'float period near 5s', heroPeriod !== null && heroPeriod > 4500 && heroPeriod < 5500, { heroPeriod })
  assert('A', 'float at or below the car amplitude', heroAmp <= carAmp, { heroAmp, carAmp })
  assert('A', 'pose pixels do not tick: sheet never animates', s.every(x => x.sheetAnim === 'none'), { seen: [...new Set(s.map(x => x.sheetAnim))] })
  assert('A', 'pose pixels do not tick: sheet holds frame 01', s.every(x => x.sheetBg === '0px'), { seen: [...new Set(s.map(x => x.sheetBg))] })
  assert('A', 'no punch at rest: body transform stays none', s.every(x => x.bodyTransform === 'none'), { seen: [...new Set(s.map(x => x.bodyTransform))] })
  results.sections.A_trace = { heroAmp, carAmp, heroPeriod, samples: s.length }
  await page.screenshot({ path: join(OUT_DIR, 'idle-1280.png') })
}

// ── B. small win: no reaction ────────────────────────────────────────────────
console.log('B. small win (5x): no reaction')
{
  await forceWin(page, 5)
  await page.waitForTimeout(900)
  const st = await motionState(page)
  assert('B', 'a 5x win leaves the hero at rest', st.motion === 'idle' && !st.crossMounted, st)
}

// ── C. big win: the crossfade ────────────────────────────────────────────────
console.log('C. big win (15x): crossfade trace')
{
  await forceWin(page, 15)
  await page.waitForTimeout(60)
  const st = await motionState(page)
  assert('C', 'a 15x win starts the big-tier reaction', st.motion === 'win' && st.tier === 'big' && st.crossMounted, st)
  const tr = await traceReaction(page, 1200)
  assert('C', 'top buffer runs the win position and fade clocks (1.5s / 48.387ms x 31)',
    tr.anims?.length === 2
    && tr.anims.some(a => a.name.includes('hero-cross-top-win') && a.duration === 1500)
    && tr.anims.some(a => a.name.includes('hero-cross-fade-win') && Math.abs(a.duration - 48.387) < 0.1 && a.iterations === 31),
    tr.anims)
  assert('C', 'bottom buffer runs the win bottom clock (1.5s)',
    tr.sheetAnims?.length === 1 && tr.sheetAnims[0].name.includes('hero-cross-bottom-win') && tr.sheetAnims[0].duration === 1500,
    tr.sheetAnims)
  const offsets = tr.frames.filter(f => f.top !== null).map(f => +(f.top - f.bottom).toFixed(1))
  assert('C', 'top buffer rides exactly one frame (206px) ahead at every sample',
    offsets.length > 20 && offsets.every(o => Math.abs(o + 206) < 0.6), { n: offsets.length, seen: [...new Set(offsets)] })
  const fades = tr.frames.map(f => f.fade).filter(f => f !== null)
  // The 0.7 ceiling is what the sampler can honestly resolve: values above
  // ~0.85 exist only for the last sixth of each ramp, so demanding one is a
  // phase lottery (a run of this proof lost it at 0.834). R140 halved the ramp
  // to 48.387ms and the sampler moved to rAF to keep roughly three samples a
  // ramp; the bounds are unchanged because the resolution is. The ramp's true
  // shape is already pinned by the clock assert above - 31 iterations of
  // 48.387ms linear, read from the animation itself - so this sample check
  // only confirms the fade is live, low to high.
  assert('C', 'the fade sweeps low to high', Math.min(...fades) < 0.25 && Math.max(...fades) > 0.7,
    { min: Math.min(...fades), max: Math.max(...fades) })
  await page.waitForTimeout(700)
  const after = await motionState(page)
  const rest = await page.evaluate(() => ({
    bg: getComputedStyle(document.querySelector('[data-testid="hero-idle"]')).backgroundPositionX,
    bodyT: getComputedStyle(document.querySelector('.hero-body')).transform,
  }))
  assert('C', 'exit lands on rest: buffer unmounted, frame 01, no transform',
    after.motion === 'idle' && !after.crossMounted && rest.bg === '0px' && rest.bodyT === 'none', { after, rest })

  // The fps run is its OWN reaction with nothing else on the page's main
  // thread: the buffer trace above polls computed style every 30ms, which is
  // measurement load, and the first draft of this proof read its own polling
  // back as dropped frames. Measure clean or do not claim the number.
  await forceWin(page, 15)
  const fps = await page.evaluate(async () => {
    const deltas = []
    let last = performance.now()
    let on = true
    const tick = t => { deltas.push(t - last); last = t; if (on) requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
    await new Promise(r => setTimeout(r, 1400))
    on = false
    const d = deltas.slice(1)
    return { mean: +(1000 / (d.reduce((a, b) => a + b) / d.length)).toFixed(1), longFrames: d.filter(x => x > 32).length, samples: d.length }
  })
  assert('C', 'frame rate holds through the dissolve (clean run)', fps.mean >= 55 && fps.longFrames <= 3, fps)
  results.sections.C_fps = fps
  await page.waitForTimeout(400)

  // The mid-dissolve screenshot is a THIRD reaction, so the capture cost
  // cannot pollute either measurement above.
  await forceWin(page, 15)
  await page.waitForTimeout(700)
  await page.screenshot({ path: join(OUT_DIR, 'win-mid-dissolve.png') })
  await page.waitForTimeout(1100)
}

// ── C2. THE WHOLE GESTURE PLAYS, WHICH IS THE FAILURE R126 RECORDED ──────────
// A stale step count does not throw and does not fail a gate: it silently plays a
// TRUNCATED gesture. R140 moved the win from 16 frames to 32 and the brace from 7
// to 16, so every literal had to move with them, and this is the assertion that
// says they did.
//
// IT SEEKS THE ANIMATION RATHER THAN SAMPLING THE CLOCK, and the first draft of
// this section is why. Sampling computed style on rAF for 1460ms of a 1500ms
// reaction captured 29 of the 31 steps and failed - not because a frame was
// missing (every observed gap was exactly 206px) but because the trace window
// closed before the last two steps and the buffer then unmounts at 1500ms. A
// wall-clock sampler on a one-shot is a race with its own subject. Pausing the
// animation and seeking currentTime to each step's midpoint reads all 31
// deterministically, with no phase luck and no dependence on frame rate.
//
// The contract, derived from the component rather than copied from it:
//   BOX_W 206, win FRAMES 32 -> span -(32-1)*206 = -6386px
//   bottom buffer  steps(31, jump-none) from 0 to span+step = -6180px  -> frames 01..31
//   top buffer     steps(31, jump-none) from -206 to span   = -6386px  -> frames 02..32
// Together the two buffers paint all 32 frames; neither paints all of them alone.
console.log('C2. the full 32-frame sweep')
{
  await forceWin(page, 15)
  await page.waitForTimeout(60)
  const sweep = await page.evaluate(async () => {
    const sheet = document.querySelector('[data-testid="hero-idle"]')
    const cross = document.querySelector('[data-testid="hero-cross"]')
    if (!cross) return { error: 'no cross buffer mounted' }
    const pos = el => el.getAnimations().find(a => a.animationName.includes('cross-') && !a.animationName.includes('fade'))
    const ab = pos(sheet), at = pos(cross)
    if (!ab || !at) return { error: 'position animations not found' }
    const DUR = 1500, STEPS = 31
    ab.pause(); at.pause()
    const bottom = [], top = []
    for (let k = 0; k < STEPS; k++) {
      // the midpoint of step k, so a boundary rounding either way cannot land us
      // on the wrong side of it
      const t = (k + 0.5) * (DUR / STEPS)
      ab.currentTime = t; at.currentTime = t
      bottom.push(Math.round(parseFloat(getComputedStyle(sheet).backgroundPositionX)))
      top.push(Math.round(parseFloat(getComputedStyle(cross).backgroundPositionX)))
    }
    ab.play(); at.play()
    return { bottom, top, union: new Set([...bottom, ...top]).size }
  })
  const expBottom = Array.from({ length: 31 }, (_, k) => -k * 206)
  const expTop = Array.from({ length: 31 }, (_, k) => -(k + 1) * 206)
  assert('C2', 'bottom buffer paints frames 01..31, 0 to -6180px, one 206px step each',
    !sweep.error && JSON.stringify(sweep.bottom) === JSON.stringify(expBottom),
    { error: sweep.error, first: sweep.bottom?.[0], last: sweep.bottom?.[30], n: sweep.bottom?.length })
  assert('C2', 'top buffer paints frames 02..32, -206 to -6386px, one frame ahead throughout',
    !sweep.error && JSON.stringify(sweep.top) === JSON.stringify(expTop),
    { error: sweep.error, first: sweep.top?.[0], last: sweep.top?.[30], n: sweep.top?.length })
  assert('C2', 'the two buffers between them paint all 32 frames of the sheet',
    sweep.union === 32, { union: sweep.union })
  results.sections.C2_sweep = { bottomFirst: sweep.bottom?.[0], bottomLast: sweep.bottom?.[30],
    topFirst: sweep.top?.[0], topLast: sweep.top?.[30], union: sweep.union }
  await page.waitForTimeout(1600)
}

// ── D. epic: both clocks stretch, and the tier cannot flip ───────────────────
console.log('D. epic win (150x): the 1.9s hold and the tier guard')
{
  await forceWin(page, 150)
  await page.waitForTimeout(60)
  const st = await motionState(page)
  assert('D', 'a 150x win starts the epic tier', st.motion === 'win' && st.tier === 'epic' && st.crossMounted, st)
  const clocks = await page.evaluate(() => {
    const cross = document.querySelector('[data-testid="hero-cross"]')
    const sheet = document.querySelector('[data-testid="hero-idle"]')
    if (!cross) return { cross: [], sheetDur: [] }
    return {
      cross: cross.getAnimations().map(a => ({ name: a.animationName, duration: a.effect.getTiming().duration })),
      sheetDur: sheet.getAnimations().map(a => a.effect.getTiming().duration),
    }
  })
  assert('D', 'epic stretches the position clock to 1.9s and the fade to 61.29ms',
    clocks.cross.some(a => a.name.includes('hero-cross-top-win') && Math.abs(a.duration - 1900) < 1)
    && clocks.cross.some(a => a.name.includes('hero-cross-fade-win') && Math.abs(a.duration - 61.29) < 0.1)
    && clocks.sheetDur.every(d => Math.abs(d - 1900) < 1),
    clocks)
  // The R121/R129 class: a big win landing mid-epic must not repaint the tier.
  await page.waitForTimeout(500)
  await forceWin(page, 15)
  await page.waitForTimeout(100)
  const mid = await motionState(page)
  assert('D', 'a 15x win mid-epic cannot flip the tier', mid.motion === 'win' && mid.tier === 'epic', mid)
  await page.screenshot({ path: join(OUT_DIR, 'epic-mid-dissolve.png') })
  await page.waitForTimeout(1600)
  const after = await motionState(page)
  assert('D', 'the epic exits to rest after its own 1.9s hold', after.motion === 'idle' && !after.crossMounted, after)
}

// ── E. feature entry: the brace crossfades ───────────────────────────────────
console.log('E. feature entry: brace crossfade')
{
  await page.evaluate(async () => {
    const m = await import('/src/lib/stores/overdriveVisual.ts')
    m.overdriveVisual.set(true)
  })
  await page.waitForTimeout(60)
  const st = await motionState(page)
  assert('E', 'overdrive-on starts the brace', st.motion === 'energy' && st.crossMounted, st)
  const clocks = await page.evaluate(() => {
    const cross = document.querySelector('[data-testid="hero-cross"]')
    return cross ? cross.getAnimations().map(a => ({ name: a.animationName, duration: a.effect.getTiming().duration, iterations: a.effect.getTiming().iterations })) : []
  })
  assert('E', 'brace runs the energy clocks (1.3s / 86.667ms x 15)',
    clocks.some(a => a.name.includes('hero-cross-top-energy') && a.duration === 1300)
    && clocks.some(a => a.name.includes('hero-cross-fade-energy') && Math.abs(a.duration - 86.667) < 0.1 && a.iterations === 15),
    clocks)
  await page.screenshot({ path: join(OUT_DIR, 'brace-mid-dissolve.png') })
  await page.evaluate(async () => {
    const m = await import('/src/lib/stores/overdriveVisual.ts')
    m.overdriveVisual.set(false)
  })
  await page.waitForTimeout(1500)
  const after = await motionState(page)
  assert('E', 'the brace exits to rest', after.motion === 'idle' && !after.crossMounted, after)
}

// ── F. reduced motion: freeze both ───────────────────────────────────────────
console.log('F. reduced motion')
{
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForTimeout(150)
  const frozen = await page.evaluate(() => ({
    charAnims: document.querySelector('.char-layer').getAnimations().length,
    carAnims: document.querySelector('.car-layer').getAnimations().length,
  }))
  assert('F', 'no float under reduced motion (wrapper and car stilled)', frozen.charAnims === 0 && frozen.carAnims === 0, frozen)
  await forceWin(page, 50)
  await page.waitForTimeout(300)
  const st = await motionState(page)
  assert('F', 'reactions are refused under reduced motion', st.motion === 'idle' && !st.crossMounted, st)
  await page.screenshot({ path: join(OUT_DIR, 'reduced-motion.png') })
  // Mid-flight drop: start an epic with motion allowed, then reduce.
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.waitForTimeout(100)
  await forceWin(page, 150)
  await page.waitForTimeout(300)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForTimeout(150)
  const dropped = await motionState(page)
  assert('F', 'a reaction in flight is dropped when reduce turns on', dropped.motion === 'idle' && !dropped.crossMounted, dropped)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
}

// ── G. portrait ──────────────────────────────────────────────────────────────
console.log('G. portrait 390x844')
{
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(600)
  const present = await page.evaluate(() => !!document.querySelector('.char-layer'))
  if (!present) {
    assert('G', 'scene not mounted in portrait (recorded, not failed)', true, { present })
  } else {
    const s = await sampleScene(page, 5400)
    const heroAmp = amplitude(s.map(x => x.heroY))
    assert('G', 'portrait float stays in the 2 to 4px band', heroAmp >= 2 && heroAmp <= 4, { heroAmp })
    assert('G', 'portrait pose does not tick', s.every(x => x.sheetAnim === 'none' && x.sheetBg === '0px'), {})
  }
  await page.screenshot({ path: join(OUT_DIR, 'portrait.png') })
  await page.setViewportSize({ width: 1280, height: 720 })
}

// ── H. console hygiene ───────────────────────────────────────────────────────
assert('H', 'zero console errors', results.consoleErrors.length === 0, results.consoleErrors.slice(0, 5))
assert('H', 'zero page errors', results.pageErrors.length === 0, results.pageErrors.slice(0, 5))

await browser.close()
writeFileSync(join(OUT_DIR, 'hero-float-proof.json'), JSON.stringify(results, null, 2))
console.log(`\nEvidence written to ${OUT_DIR}`)
if (failures) { console.error(`HERO FLOAT PROOF: FAIL (${failures})`); process.exit(1) }
console.log('HERO FLOAT PROOF: PASS')
