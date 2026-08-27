#!/usr/bin/env node
/**
 * COUNT-UP NON-NEGATIVE GATE: no money surface may ever render below zero.
 *
 * WHAT THIS CATCHES, AND IT SHIPPED TWICE. Both money count-ups computed progress as
 * `Math.min(elapsed / duration, 1)`, which bounds the TOP of the range and leaves the
 * BOTTOM open. `startTime` is captured with `performance.now()` when the tween is built,
 * while `tick()` receives the requestAnimationFrame timestamp, which is when the FRAME
 * began; a tween created during a long frame can therefore be handed a `now` that
 * PRECEDES its own start. Progress goes negative, and `easeOutCubic`, being cubic,
 * AMPLIFIES that negative by about three times rather than damping it.
 *
 * THE HARM SCALES WITH THE WIN, which is why this is a gate and not a footnote. The same
 * one-and-a-half-frame lead renders about -$0.10 on a 15x round, -$22.17 on an 830x round
 * and about -$130 at the 5000x cap. R132 measured the 15x case and recorded it as a shared
 * easing artefact. R133 measured -$21.35 on the HUD pod beside -$22.17 on the banner in six
 * of seven bonus rounds and escalated it. This gate is R134 closing it.
 *
 * WHY TWO CHECKS RATHER THAN ONE, per convention (p). A behavioural check alone would pass
 * the day someone reintroduces the raw form in a new component, because it only knows about
 * the functions it imports. A source check alone would pass the day someone keeps the shape
 * and breaks the arithmetic. So:
 *
 *   CHECK 1, BEHAVIOUR: drive the LIVE exported functions with a `now` that precedes
 *     `startTime`, at the three multipliers the brief names, and require the rendered
 *     figure to be >= 0.
 *   CHECK 2, SOURCE: every money count-up routes its progress through `countUpProgress`
 *     and its emitted value through `nonNegativeMoney`, and none of them contains the
 *     upper-only clamp any more.
 *
 * THE COMMENT-STRIPPING DETAIL, and it is the same trap `css_liveness_gate` documents in
 * reverse. The fixed files QUOTE the defective line in the comment that explains the fix.
 * A source scan that does not strip comments would therefore go RED on the explanation of
 * the repair, for ever. Comments are stripped before every source assertion.
 *
 * Run:
 *   npx tsx scripts/countup_nonnegative_gate.mjs
 *   npx tsx scripts/countup_nonnegative_gate.mjs --self-test
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const SRC = join(HERE, '..', 'src')

// The LIVE implementation. Imported, never reimplemented: a gate that reconstructs the
// thing it guards can be green over a live defect, which this project has recorded more
// than once.
const mod = await import(join(SRC, 'lib', 'stores', 'winCountUp.ts'))
const { countUpProgress, easeOutCubic, nonNegativeMoney, countUpDurationMs } = mod

/** Every file that tweens a figure a player reads as money, and what it feeds. */
const MONEY_COUNT_UPS = [
  {
    file: join(SRC, 'lib', 'stores', 'winCountUp.ts'),
    label: 'stores/winCountUp.ts (the shared helper: HUD WIN pod, win banner, feature-end banner)',
  },
  {
    file: join(SRC, 'lib', 'components', 'WinDisplay.svelte'),
    label: 'components/WinDisplay.svelte (the Bet Replay end-of-round banner)',
  },
]

/** Strip line and block comments so a comment quoting the defect cannot trip the scan. */
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

/**
 * The three cases the brief names, at bet 1 so the multiplier IS the dollar total.
 * Durations come from the live rule rather than a copy of it.
 */
const CASES = [15, 830, 5000].map((multiplier) => ({
  multiplier,
  total: multiplier,
  duration: countUpDurationMs(multiplier),
}))

/**
 * The leads to test. 24ms is the value R133 measured by inverting two independent
 * observations of the same round; the rest bracket it, including a whole 50ms stall.
 */
const LEADS_MS = [0.5, 4, 8, 16.7, 23.8, 24.7, 33.4, 50, 120]

/** The FIRST PAINTED FRAME, computed exactly as the shipped tick computes it. */
function firstFrameValue(total, duration, leadMs, impl) {
  const startTime = 1_000_000
  const now = startTime - leadMs // the rAF timestamp precedes the captured start
  return impl(now - startTime, duration, total)
}

/** The shipped arithmetic, start at 0 as the brief requires. */
const LIVE = (elapsed, duration, total) =>
  nonNegativeMoney(0 + (total - 0) * easeOutCubic(countUpProgress(elapsed, duration)))

/** The defect, in the exact form it really shipped, for the self-test. */
const SEEDED = (elapsed, duration, total) =>
  0 + (total - 0) * (1 - Math.pow(1 - Math.min(elapsed / duration, 1), 3))

function checkBehaviour(impl) {
  const failures = []
  for (const c of CASES) {
    for (const lead of LEADS_MS) {
      const v = firstFrameValue(c.total, c.duration, lead, impl)
      if (!(v >= 0)) {
        failures.push(
          `${c.multiplier}x over ${c.duration}ms, rAF timestamp ${lead}ms before start: ` +
            `renders $${v.toFixed(2)}`,
        )
      }
    }
  }
  // Non-finite inputs must not escape either: a NaN reaches the formatter as "NaN".
  for (const bad of [NaN, -Infinity]) {
    const v = LIVE === impl ? nonNegativeMoney(bad) : bad
    if (!(v >= 0)) failures.push(`a non-finite value (${String(bad)}) renders ${String(v)}`)
  }
  return failures
}

function checkSource(seedDefect = false) {
  const failures = []
  for (const { file, label } of MONEY_COUNT_UPS) {
    let text = stripComments(readFileSync(file, 'utf8'))
    if (seedDefect) {
      // Plant the defect in the form it really occurred: swap the clamped progress call
      // back to the upper-only Math.min, exactly as both files read before R134.
      text = text.replace(
        /countUpProgress\(\s*now - start(?:Time)?\s*,\s*duration\s*\)/,
        'Math.min((now - startTime) / duration, 1)',
      )
    }
    if (/Math\.min\(\s*\(?\s*now\s*-\s*start/.test(text)) {
      failures.push(`${label}: an upper-only progress clamp is back`)
    }
    if (!/countUpProgress\(/.test(text)) {
      failures.push(`${label}: does not route its progress through countUpProgress()`)
    }
    if (!/nonNegativeMoney\(/.test(text)) {
      failures.push(`${label}: does not route its emitted value through nonNegativeMoney()`)
    }
  }
  return failures
}

function report(name, failures) {
  if (failures.length === 0) {
    console.log(`  ok    ${name}`)
    return true
  }
  console.log(`  FAIL  ${name}`)
  for (const f of failures) console.log(`          ${f}`)
  return false
}

if (process.argv.includes('--self-test')) {
  console.log('COUNT-UP NON-NEGATIVE GATE, seeded self-test')
  let ok = true

  const seededBehaviour = checkBehaviour(SEEDED)
  if (seededBehaviour.length === 0) {
    console.log('  FAIL  seeded: the pre-R134 arithmetic must render a negative and did not')
    ok = false
  } else {
    console.log(`  caught  seeded: the pre-R134 arithmetic renders a negative (${seededBehaviour.length} case(s))`)
    // Print the three cases the brief names, at the lead R133 actually measured, so the
    // self-test reproduces the reported figures rather than merely asserting a sign.
    for (const c of CASES) {
      const v = firstFrameValue(c.total, c.duration, 23.8, SEEDED)
      console.log(
        `          ${String(c.multiplier).padStart(4)}x over ${c.duration}ms, 23.8ms lead: ` +
          `$${v.toFixed(2)}`,
      )
    }
  }

  const seededSource = checkSource(true)
  if (seededSource.length === 0) {
    console.log('  FAIL  seeded: the upper-only clamp restored in source was not detected')
    ok = false
  } else {
    console.log(`  caught  seeded: the upper-only clamp restored in source (${seededSource.length} finding(s))`)
    for (const f of seededSource) console.log(`          ${f}`)
  }

  // NEGATIVE CONTROLS: the real thing must pass both checks, or the seeds above prove nothing.
  ok = report('seeded: NEGATIVE CONTROL, the live arithmetic must pass', checkBehaviour(LIVE)) && ok
  ok = report('seeded: NEGATIVE CONTROL, the real source must pass', checkSource(false)) && ok

  // And the comment-stripper must actually be doing work, or the source check is passing
  // for the wrong reason: the fixed files really do quote the defective line.
  const raw = MONEY_COUNT_UPS.map(({ file }) => readFileSync(file, 'utf8')).join('\n')
  if (!/Math\.min\(\s*\(?\s*now\s*-\s*start/.test(raw)) {
    console.log('  FAIL  seeded: no file quotes the old form, so comment-stripping is untested here')
    ok = false
  } else {
    console.log('  caught  seeded: the fixed files DO quote the old form in prose, and stripping handles it')
  }

  console.log(ok ? '\nCOUNT-UP NON-NEGATIVE GATE: the gate can fail' : '\nCOUNT-UP NON-NEGATIVE GATE: SELF-TEST FAILED')
  process.exit(ok ? 0 : 1)
}

console.log('COUNT-UP NON-NEGATIVE GATE')
console.log(`  ${MONEY_COUNT_UPS.length} money count-up(s) in scope:`)
for (const { label } of MONEY_COUNT_UPS) console.log(`    - ${label}`)
const behaviour = checkBehaviour(LIVE)
const source = checkSource(false)
const okAll =
  report(`the first painted frame is never negative (${CASES.length} multipliers x ${LEADS_MS.length} leads)`, behaviour) &&
  report('every money count-up routes through countUpProgress() and nonNegativeMoney()', source)
console.log(okAll ? '\nCOUNT-UP NON-NEGATIVE GATE: PASS' : '\nCOUNT-UP NON-NEGATIVE GATE: FAIL')
process.exit(okAll ? 0 : 1)
