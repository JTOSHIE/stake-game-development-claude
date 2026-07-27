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

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const HARD_TIMEOUT_MS = 4 * 60_000
setTimeout(() => {
  console.error(`WIN COUNTUP STEADY GATE: HARD TIMEOUT after ${HARD_TIMEOUT_MS / 1000}s, failing red`)
  process.exit(1)
}, HARD_TIMEOUT_MS)

// The rule under test, read out of the shipped component rather than restated,
// so the gate cannot pass while the component says something else.
const BANNER = readFileSync(join(ROOT, 'src/lib/components/WinBanner.svelte'), 'utf-8')
const DIGIT_RULE = /\.c1-amount \.c1-digit \{[^}]*width:\s*([0-9.]+)em/.exec(BANNER)

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
  const render = (text, boxed) => {
    host.innerHTML = ''
    const wrap = document.createElement('div')
    wrap.className = 'c1-amount fs-num'
    for (const c of text) {
      const s = document.createElement('span')
      s.className = 'c1-ch'
      const isDigit = c >= '0' && c <= '9'
      if (isDigit && boxed) s.className += ' c1-digit'
      s.textContent = c
      wrap.appendChild(s)
    }
    host.appendChild(wrap)
    const chars = [...wrap.children].map((el) => {
      const r = el.getBoundingClientRect()
      return { c: el.textContent, x: Math.round(r.left * 100) / 100, w: Math.round(r.width * 100) / 100 }
    })
    const total = Math.round(wrap.getBoundingClientRect().width * 100) / 100
    return { chars, total }
  }
  const out = {
    narrowBoxed: render(spec.narrow, true),
    wideBoxed: render(spec.wide, true),
    narrowRaw: render(spec.narrow, false),
    wideRaw: render(spec.wide, false),
    control: render(spec.control, true),
  }
  host.remove()
  return out
}`

function getFreePort() {
  return new Promise((res, rej) => {
    const srv = createServer()
    srv.on('error', rej)
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => res(port)) })
  })
}
function startPreview(port) {
  return new Promise((res, rej) => {
    const proc = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
      cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], detached: true,
    })
    let done = false
    const onData = (d) => {
      const s = d.toString()
      if (!done && (/Local/.test(s) || /localhost:\d+/.test(s))) { done = true; res(proc) }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', rej)
    setTimeout(() => { if (!done) rej(new Error('vite preview did not start in time')) }, 20000)
  })
}
const killPreview = (p) => { try { process.kill(-p.pid, 'SIGTERM') } catch { try { p.kill() } catch {} } }

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
                .probe-host .c1-amount{font-family:'Orbitron',system-ui,sans-serif;font-weight:900;
                  letter-spacing:2px;white-space:nowrap;font-size:64px;}
                .probe-host .c1-amount .c1-digit{display:inline-block;${
                  selfTest ? '' : `width:${DIGIT_RULE ? DIGIT_RULE[1] : '0.834'}em;`}text-align:center;}`,
    })
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

  const digitWidths = new Set(m.narrowBoxed.chars.filter((c) => c.c >= '0' && c.c <= '9').map((c) => c.w))
  ok(digitWidths.size === 1, `${label}: every digit box is one width (found ${[...digitWidths].join(', ')})`)

  ok(m.narrowBoxed.total === m.wideBoxed.total,
    `${label}: "${NARROW}" and "${WIDE}" render at the SAME total width `
    + `(${m.narrowBoxed.total} vs ${m.wideBoxed.total})`)

  const drift = m.narrowBoxed.chars
    .map((c, i) => Math.abs(c.x - (m.wideBoxed.chars[i]?.x ?? c.x)))
    .reduce((a, b) => Math.max(a, b), 0)
  ok(drift < 0.5, `${label}: no character moves between the two amounts (worst drift ${drift}px)`)

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
    console.log('SEEDED VIOLATION: the same markup WITHOUT the per-digit rule, i.e. what shipped before TR-089')
    const rawDrift = m.narrowRaw.chars
      .map((c, i) => Math.abs(c.x - (m.wideRaw.chars[i]?.x ?? c.x)))
      .reduce((a, b) => Math.max(a, b), 0)
    const rawWidthsDiffer = m.narrowRaw.total !== m.wideRaw.total
    console.log(`  raw totals: "${NARROW}" ${m.narrowRaw.total}px vs "${WIDE}" ${m.wideRaw.total}px`)
    console.log(`  ${rawWidthsDiffer ? 'caught' : 'MISSED'}  unboxed digits DO change the total width`)
    console.log(`  ${rawDrift > 1 ? 'caught' : 'MISSED'}  unboxed characters DO move (worst drift ${rawDrift}px)`)
    if (!rawWidthsDiffer || rawDrift <= 1) {
      console.error('\nWIN COUNTUP STEADY GATE SELF-TEST: FAIL. The unboxed form does not drift, '
        + 'so this gate is not measuring what it claims to measure.')
      process.exit(1)
    }
    console.log('\nWIN COUNTUP STEADY GATE SELF-TEST: PASS (the defect reproduces without the fix)')
    process.exit(0)
  }

  if (!DIGIT_RULE) {
    console.error('WIN COUNTUP STEADY GATE: FAIL, no `.c1-amount .c1-digit { width: <n>em }` rule found '
      + 'in WinBanner.svelte. The fix has been removed or renamed.')
    process.exit(1)
  }
  console.log(`WIN COUNTUP STEADY GATE: digit box read from the component as ${DIGIT_RULE[1]}em`)
  const failures = judge(m, 'boxed')
  console.log('')
  if (failures.length) {
    console.error(`WIN COUNTUP STEADY GATE: FAIL (${failures.length})`)
    process.exit(1)
  }
  console.log('WIN COUNTUP STEADY GATE: PASS (the count-up holds its geometry as the digits roll)')
  process.exit(0)
})()
