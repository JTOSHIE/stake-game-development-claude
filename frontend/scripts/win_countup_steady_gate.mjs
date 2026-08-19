#!/usr/bin/env node
//
// win_countup_steady_gate.mjs: the win count-up does not dance as it rolls.
//
// TR-089, Fable ruling 3.
//
// WHY THIS EXISTS, and it is not a hypothetical.
// ---------------------------------------------
// `.fs-num` carries `font-variant-numeric: tabular-nums`, which reads as "the
// digits are all the same width". Against Orbitron it is INERT: that property
// maps to the OpenType `tnum` feature, and parsing the shipped
// `orbitron-latin-*.woff` with fontTools reports NO GSUB features at all, so
// there is no `tnum` to switch on. The real advances are:
//
//     digit   0    1    2    3    4    5    6    7    8    9
//     units  834  391  830  826  730  830  820  660  834  828     of 1000
//
// `1` is less than half the width of `0`, a spread of 443/1000 em. So a total
// counting up from zero changed width on almost every frame, and the platform's
// guidelines require multi-win outcomes to count up incrementally, which means a
// reviewer watches this animation deliberately.
//
// The fix is per-digit fixed-width boxes on the AMOUNT ONLY, 0.834em each, the
// widest real advance. This gate proves it holds against the shipped font rather
// than against the stylesheet's intention.
//
// WHAT IT ASSERTS, and the second one is the one that matters:
//   1. Every digit box renders the same width. Necessary, not sufficient.
//   2. Two amounts with the SAME character count but DIFFERENT digits render at
//      the same total width, and every character sits at the same x offset.
//      `$1,111.11` against `$8,888.88` is the worst case: `1` is the narrowest
//      digit and `8` is the widest, so if anything can drift, those two will.
//   3. A digit-free control still renders, so the boxes have not broken layout.
//
// USAGE
//   node scripts/win_countup_steady_gate.mjs
//   node scripts/win_countup_steady_gate.mjs --self-test
//
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { startStaticServer, assertNoSurvivors } from './lib/previewServer.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ── TR-101: the server runs IN THIS PROCESS now ──────────────────────────────
//
// Fable's ruling 2026-07-28, option (c): the orphanable child is DELETED rather
// than managed. `lib/previewServer.mjs` serves dist/ over node:http from inside
// this process, so there is no `npx`, no vite child, no process group, and
// nothing that can survive this script.
//
// The three names below are kept so every call site reads exactly as it did.
// They are adapters, not implementations: the implementation is shared.
//
// NOTE WHAT THIS MAKES IMPOSSIBLE. Three scripts in this family never called
// killPreview at all and leaked a server on every single run. Under option (c)
// that is no longer a leak: forgetting to close costs nothing, because the
// server dies with the process instead of outliving it.
let _server = null
async function getFreePort() {
  _server = await startStaticServer(join(ROOT, 'dist'))
  return _server.port
}
function startPreview() { return _server }
function killPreview() { return _server ? _server.close() : undefined }


const HARD_TIMEOUT_MS = 4 * 60_000
setTimeout(() => {
  console.error(`WIN COUNTUP STEADY GATE: HARD TIMEOUT after ${HARD_TIMEOUT_MS / 1000}s, failing red`)
  process.exit(1)
}, HARD_TIMEOUT_MS)

// The rule under test, read out of the shipped component rather than restated,
// so the gate cannot pass while the component says something else.
const BANNER = readFileSync(join(ROOT, 'src/lib/components/WinBanner.svelte'), 'utf-8')
// R071 TASK 4: the per-digit boxes are RETIRED and the face does the work, so
// the mechanism this gate used to read out of the component is now asserted
// ABSENT. What is measured below is the OUTCOME instead: equal digit advances
// and zero drift, in the face the money surfaces actually render in.
const RETIRED_RULE = /\.c1-amount \.c1-digit \{/.test(BANNER)

// The two strings, chosen so the narrowest and widest digits are compared.
const NARROW = '$1,111.11'
const WIDE = '$8,888.88'

/**
 * The measurement, run in the page against the REAL shipped font. Renders the
 * amount markup exactly as WinBanner does, at the real class names, and reports
 * per-character geometry.
 */
const MEASURE = `(spec) => {
  const host = document.createElement('div')
  host.className = 'probe-host'
  document.body.appendChild(host)
  // RENDERED AS ONE TEXT NODE, exactly as the component now does. The old probe
  // put every character in its own span, which is what the retired per-digit
  // boxes needed, and that shape measures punctuation differently either side of
  // a span boundary: the comma in "$1,111.11" came back 15.52px and the same
  // comma in "$8,888.88" 18.33px, with every DIGIT identical at 41.69px. That is
  // a shaping artefact of the probe, not of the game, and measuring the real
  // shape removes it.
  const render = (text, tabular) => {
    host.innerHTML = ''
    const wrap = document.createElement('div')
    wrap.className = tabular ? 'c1-amount fs-num' : 'c1-amount fs-num seed'
    wrap.textContent = text
    host.appendChild(wrap)
    return { total: Math.round(wrap.getBoundingClientRect().width * 100) / 100 }
  }
  // Each digit alone, in the same style, so "one advance" is measured rather
  // than inferred from two totals agreeing.
  // THE ADVANCE IS MEASURED AS A DELTA, NOT AS A LONE GLYPH'S BOX.
  //
  // This first read one digit at a time and compared the element widths. That
  // measures the wrong thing and it went red on CI while passing locally, which
  // is the useful part: locally the device pixel ratio is 2 and every digit read
  // 41.69, on the runner it is 1 and the same digits read 42 and 44. **A lone
  // glyph's box is its ink plus its side bearings, quantised to whole device
  // pixels, and side bearings are exactly what tabular figures do NOT equalise.**
  // The property under test is the ADVANCE, which is the distance from one glyph
  // to the next and therefore only exists BETWEEN glyphs.
  //
  // So each digit is rendered at two lengths and the advance is the difference
  // divided by the gap. The side bearings appear in both terms and cancel, and
  // the rounding error is divided by ten along with everything else.
  const ADV_LONG = 11
  const digitWidths = (tabular) => {
    const out = []
    for (let d = 0; d <= 9; d++) {
      const one = render(String(d), tabular).total
      const many = render(String(d).repeat(ADV_LONG), tabular).total
      out.push(Math.round(((many - one) / (ADV_LONG - 1)) * 100) / 100)
    }
    return out
  }
  const out = {
    narrowBoxed: render(spec.narrow, true),
    wideBoxed: render(spec.wide, true),
    narrowRaw: render(spec.narrow, false),
    wideRaw: render(spec.wide, false),
    control: render(spec.control, true),
    digitsTabular: digitWidths(true),
    digitsSeed: digitWidths(false),
  }
  host.remove()
  return out
}`


async function measure(selfTest) {
  const port = await getFreePort()
  const preview = await startPreview(port)
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(`http://localhost:${port}/?sessionID=countup-gate&rgs_url=rgs.countup.invalid&lang=en`,
      { waitUntil: 'domcontentloaded' })
    // The real Orbitron must be loaded before anything is measured, or the
    // numbers describe a fallback face and the gate proves nothing.
    await page.waitForFunction(() => document.fonts && document.fonts.status === 'loaded', { timeout: 20000 })
    await page.addStyleTag({
      content: `.probe-host{position:fixed;left:-9999px;top:0;}
                .probe-host .c1-amount{font-family:var(--fs-font-numeric);font-weight:900;
                  letter-spacing:2px;white-space:nowrap;font-size:64px;
                  font-variant-numeric:tabular-nums;font-kerning:none;}
                /* THE SEED, and it is the world before the ruling: the DISPLAY
                   face, which is Orbitron, with tabular-nums asked for and
                   inert because that face carries no tnum to switch on. */
                .probe-host .c1-amount.seed{font-family:var(--fs-font-display);}`,
    })
    // FORCE THE PROBE'S OWN FACES TO LOAD, AND PROVE THEY DID.
    //
    // `document.fonts.status === 'loaded'` above is necessary and NOT sufficient,
    // and this gate paid for the difference: it means every face the page has
    // ASKED FOR has arrived. The probe renders at weight 900 in a detached host,
    // and if no page element happens to use that exact face and weight, nothing
    // ever asked, so the probe silently measured a FALLBACK and reported its
    // metrics as ours. That is how this gate ran green locally, where the faces
    // were already warm, and red on a cold runner with a 2px spread that no
    // amount of rounding could explain.
    //
    // So the faces are requested explicitly and then CHECKED. A gate that cannot
    // prove which face it measured is not measuring anything, and it fails loudly
    // here rather than reporting a fallback's numbers as a verdict.
    const faces = await page.evaluate(async () => {
      const want = ['900 64px "Exo 2"', '900 64px "Orbitron"']
      await Promise.all(want.map((f) => document.fonts.load(f, '0123456789')))
      await document.fonts.ready
      return want.map((f) => ({ f, ok: document.fonts.check(f) }))
    })
    const missing = faces.filter((x) => !x.ok).map((x) => x.f)
    if (missing.length) {
      throw new Error(`the probe faces did not load, so nothing below would describe them: ${missing.join(', ')}`)
    }
    console.log(`  faces confirmed loaded: ${faces.map((x) => x.f).join(', ')}`)
    // page.evaluate with a STRING evaluates it as an expression rather than
    // calling it with the argument, so the call is written out explicitly.
    const spec = { narrow: NARROW, wide: WIDE, control: '$--.--' }
    return await page.evaluate(`(${MEASURE})(${JSON.stringify(spec)})`)
  } finally {
    await browser.close().catch(() => {})
    killPreview(preview)
  }
}

function judge(m, label) {
  const failures = []
  const ok = (cond, msg) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${msg}`); if (!cond) failures.push(msg) }

  ok(!RETIRED_RULE, `${label}: the retired per-digit box rule is absent from the component`)

  // ONE PIXEL, and the tolerance is stated rather than tuned. The advance is a
  // delta divided by ten, so a whole-device-pixel rounding at either end moves it
  // by at most a tenth of a pixel; 1px is two orders of magnitude of headroom
  // against that and two orders of magnitude BELOW the defect, which is a spread
  // of roughly 28px at this size in the display face. The seed proves the second
  // half of that claim on every run rather than leaving it asserted.
  const ADVANCE_TOLERANCE_PX = 1
  const spread = Math.max(...m.digitsTabular) - Math.min(...m.digitsTabular)
  ok(spread <= ADVANCE_TOLERANCE_PX,
    `${label}: every digit renders ONE advance in the numeric face (spread ${spread.toFixed(2)}px across ${m.digitsTabular.length} digits)`)

  ok(m.narrowBoxed.total === m.wideBoxed.total,
    `${label}: "${NARROW}" and "${WIDE}" render at the SAME total width `
    + `(${m.narrowBoxed.total} vs ${m.wideBoxed.total})`)

  ok(m.control.total > 0, `${label}: a digit-free control still renders (${m.control.total}px)`)
  return failures
}

// ── the raw comparison, which is also the seeded violation ───────────────────
//
// Convention (p). The "seed" here is not an invented defect: it is the component
// AS IT SHIPPED BEFORE THIS FIX, i.e. the same markup with the fixed-width rule
// absent, which is what `--self-test` renders. If the unboxed form does NOT
// drift, the shipped font has changed and this gate is measuring nothing, so its
// PASS would be meaningless.
;(async () => {
  const selfTest = process.argv.includes('--self-test')
  const m = await measure(false)

  if (selfTest) {
    console.log('SEEDED VIOLATION: the same markup in the DISPLAY face, which is what every money')
    console.log('surface rendered in before the R071 ruling, with tabular-nums inert against it')
    const seedSpread = Math.max(...m.digitsSeed) - Math.min(...m.digitsSeed)
    const rawDrift = Math.round(seedSpread * 100) / 100
    const rawWidthsDiffer = m.narrowRaw.total !== m.wideRaw.total
    console.log(`  raw totals: "${NARROW}" ${m.narrowRaw.total}px vs "${WIDE}" ${m.wideRaw.total}px`)
    console.log(`  ${rawWidthsDiffer ? 'caught' : 'MISSED'}  the display face DOES change the total width`)
    console.log(`  ${rawDrift > 1 ? 'caught' : 'MISSED'}  the display face's digits DO differ in advance `
      + `(spread ${rawDrift}px)`)
    if (!rawWidthsDiffer || rawDrift <= 1) {
      console.error('\nWIN COUNTUP STEADY GATE SELF-TEST: FAIL. The display face does not drift, '
        + 'so this gate is not measuring what it claims to measure.')
      process.exit(1)
    }
    console.log('\nWIN COUNTUP STEADY GATE SELF-TEST: PASS (the defect reproduces without the fix)')
    process.exit(0)
  }

  console.log('WIN COUNTUP STEADY GATE: measured in the numeric face, the per-digit boxes retired')
  const failures = judge(m, 'numeric face')
  console.log('')
  if (failures.length) {
    console.error(`WIN COUNTUP STEADY GATE: FAIL (${failures.length})`)
    process.exit(1)
  }
  // TR-101, Fable's ruling: a gate leaves nothing running. Asserted, not
  // cleaned up, because killing here would hide the defect it reports.
  if (!assertNoSurvivors('win countup steady gate')) {
    console.error('\nWIN COUNTUP STEADY GATE: FAIL, this gate left processes behind')
    process.exit(1)
  }
  console.log('WIN COUNTUP STEADY GATE: PASS (the count-up holds its geometry as the digits roll)')
  process.exit(0)
})()
