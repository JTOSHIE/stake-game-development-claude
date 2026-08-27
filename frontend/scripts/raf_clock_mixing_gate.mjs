#!/usr/bin/env node
/**
 * RAF CLOCK MIXING GATE: a rAF timestamp may not be measured against a performance.now() start
 * unless the result is clamped or guarded.
 *
 * THE CLASS, WHICH HAS SHIPPED TWICE AND WAS NEARLY MISDIAGNOSED A THIRD TIME.
 * requestAnimationFrame hands its callback the time the FRAME began. `performance.now()` returns
 * the time right now. A tween that captures its start with the second and measures elapsed against
 * the first is mixing two readings of one clock taken at different moments, and when the tween is
 * created DURING a long frame the frame's timestamp can PRECEDE the captured start. Elapsed goes
 * negative.
 *
 * R134 found this in both money count-ups. `Math.min(elapsed / duration, 1)` bounds the top and
 * leaves the bottom open, and `easeOutCubic`, being cubic, amplifies the negative about threefold,
 * so a lead of roughly one and a half frames rendered about -2.6% of the round total: -$0.10 at
 * 15x, -$22.17 at 830x, about -$130 at the 5000x cap.
 *
 * WHY THE GATE ASSERTS THE CLOCK SOURCE AND NOT THE `Math.min` SHAPE, which is the whole point.
 * R134's own report parked four GameGrid clamps as "the same defect class" on the strength of the
 * regex shape. R135 read the call sites and that was WRONG: two of them read `performance.now()` on
 * BOTH sides, so one monotonic clock and no negative is possible; one is a delta-time cap between
 * two rAF timestamps; and the fourth genuinely mixes clocks but is guarded on the line above by
 * `if (now < begin) { requestAnimationFrame(fall); return }`. A gate keyed on `Math.min(x, 1)`
 * would therefore have fired on five safe sites and told nobody anything, while a gate keyed on the
 * CLOCK SOURCE fires on exactly the three that mix, and passes them only because each is handled.
 *
 * SO WHAT THIS REALLY PROTECTS is that guard at GameGrid.svelte. It is one line, it looks redundant
 * to a reader tidying up, and it is the only thing standing between the shipping reel path and the
 * R134 defect. Deleting it is a one-token edit. That is what the seeded self-test plants.
 *
 * A SITE PASSES if it does either of:
 *   CLAMPED  the subtraction is an argument to countUpProgress(), the shared helper R134 added,
 *            which bounds [0,1] and sends NaN to 0; or
 *   GUARDED  an early return compares the same two operands before the subtraction is reached.
 * Anything else is a finding, and a new animation in a new component is covered on the day it is
 * written rather than the day somebody remembers this file.
 *
 * Run:
 *   node scripts/raf_clock_mixing_gate.mjs
 *   node scripts/raf_clock_mixing_gate.mjs --self-test
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const SRC = join(HERE, '..', 'src')

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else if (/\.(ts|svelte)$/.test(name)) out.push(p)
  }
  return out
}

/** Strip comments so prose describing the defect cannot create or hide a finding. */
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

/**
 * Find every place a callback parameter is subtracted from a variable that the same file assigns
 * from performance.now(). That pairing IS the mixed-clock read; nothing else in this gate matters.
 */
function findSites(source, label) {
  const code = stripComments(source)
  const lines = code.split('\n')
  const sites = []
  for (let i = 0; i < lines.length; i++) {
    // `<param> - <other>`, the subtraction itself
    for (const m of lines[i].matchAll(/\b([A-Za-z_$][\w$]*)\s*-\s*([A-Za-z_$][\w$]*)\b/g)) {
      const [, param, other] = m
      if (param === other) continue
      // `other` must be assigned from performance.now() somewhere in this file
      const assigned = new RegExp(`\\b${other}\\s*=\\s*performance\\.now\\(\\)`).test(code)
      if (!assigned) continue
      // `param` must be a callback parameter that rAF supplies a timestamp to. Accept the two
      // shapes this codebase uses: `function name(param: number)` and `(param) => {` / `(param: number) => {`.
      const isParam = new RegExp(
        `function\\s+\\w+\\s*\\(\\s*${param}\\s*:?\\s*\\w*\\s*\\)|\\(\\s*${param}\\s*:?\\s*\\w*\\s*\\)\\s*=>`,
      ).test(code)
      if (!isParam) continue

      const window = lines.slice(Math.max(0, i - 6), i + 1).join('\n')
      const clamped = new RegExp(`countUpProgress\\s*\\(\\s*${param}\\s*-\\s*${other}`).test(lines[i])
      const guarded = new RegExp(`if\\s*\\(\\s*${param}\\s*<\\s*${other}\\s*\\)`).test(window)
      sites.push({ file: label, line: i + 1, param, other, clamped, guarded, text: lines[i].trim().slice(0, 110) })
    }
  }
  return sites
}

function collect(files) {
  const all = []
  for (const f of files) all.push(...findSites(readFileSync(f, 'utf8'), relative(join(HERE, '..'), f)))
  // de-duplicate identical (file, line) pairs produced by multiple regex matches on one line
  const seen = new Set()
  return all.filter((s) => {
    const k = `${s.file}:${s.line}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

function report(sites) {
  const bad = sites.filter((s) => !s.clamped && !s.guarded)
  console.log(`RAF CLOCK MIXING GATE: ${sites.length} mixed-clock site(s) found`)
  for (const s of sites) {
    const how = s.clamped ? 'CLAMPED via countUpProgress()' : s.guarded ? 'GUARDED by an early return' : 'UNPROTECTED'
    console.log(`  ${s.clamped || s.guarded ? 'ok   ' : 'FAIL '} ${s.file}:${s.line}  \`${s.param} - ${s.other}\`  ${how}`)
  }
  return bad
}

const FILES = walk(SRC)

if (process.argv.includes('--self-test')) {
  console.log('RAF CLOCK MIXING GATE, seeded self-test\n')
  let bad = 0
  const grid = join(SRC, 'lib', 'components', 'GameGrid.svelte')
  const countup = join(SRC, 'lib', 'stores', 'winCountUp.ts')

  // SEED 1: delete the guard that protects the shipping reel path. One line, looks redundant.
  const gridSrc = readFileSync(grid, 'utf8')
  const guardLine = gridSrc.split('\n').find((l) => /if\s*\(\s*now\s*<\s*begin\s*\)/.test(l))
  if (!guardLine) {
    console.log('  FAIL  seeded: could not find the GameGrid guard to remove; the gate cannot be seeded')
    bad++
  } else {
    const seeded = findSites(gridSrc.replace(guardLine, ''), 'GameGrid.svelte(seeded)')
    const caught = seeded.some((s) => !s.clamped && !s.guarded)
    console.log(`  ${caught ? 'caught' : 'MISSED'}  seeded: the GameGrid early-return guard deleted`)
    if (caught) for (const s of seeded.filter((x) => !x.clamped && !x.guarded)) console.log(`          ${s.file}:${s.line} \`${s.param} - ${s.other}\``)
    if (!caught) bad++
  }

  // SEED 2: revert R134's clamp to the raw upper-only form in the shared money count-up.
  const cuSrc = readFileSync(countup, 'utf8')
  const seeded2 = findSites(
    cuSrc.replace(/countUpProgress\(\s*now - startTime\s*,\s*duration\s*\)/, 'Math.min((now - startTime) / duration, 1)'),
    'winCountUp.ts(seeded)',
  )
  const caught2 = seeded2.some((s) => !s.clamped && !s.guarded)
  console.log(`  ${caught2 ? 'caught' : 'MISSED'}  seeded: R134's clamp reverted to the upper-only Math.min`)
  if (!caught2) bad++

  // NEGATIVE CONTROL: the real tree must pass.
  const real = collect(FILES).filter((s) => !s.clamped && !s.guarded)
  console.log(`  ${real.length === 0 ? 'clean ' : 'FALSE+'}  NEGATIVE CONTROL: the real tree must have no unprotected site`)
  if (real.length) { bad++; for (const s of real) console.log(`          ${s.file}:${s.line}`) }

  // NEGATIVE CONTROL: prose quoting the defect must not create a finding.
  const proseOnly = findSites(
    '// const t = Math.min((now - start) / duration, 1)\n/* now - startTime against performance.now() */\n',
    'prose-only',
  )
  console.log(`  ${proseOnly.length === 0 ? 'clean ' : 'FALSE+'}  NEGATIVE CONTROL: comments quoting the defect must not register`)
  if (proseOnly.length) bad++

  console.log('')
  if (bad) { console.error(`RAF CLOCK MIXING GATE SELF-TEST: FAIL (${bad} case(s) wrong)`); process.exit(1) }
  console.log('RAF CLOCK MIXING GATE SELF-TEST: PASS (both seeds caught, both controls clean)')
  process.exit(0)
}

const sites = collect(FILES)
if (sites.length === 0) {
  console.error('RAF CLOCK MIXING GATE: FAIL, found ZERO mixed-clock sites, which means the detector stopped working')
  console.error('  There are known sites in winCountUp.ts, WinDisplay.svelte and GameGrid.svelte. Finding none is a broken gate, not a clean tree.')
  process.exit(1)
}
const bad = report(sites)
if (bad.length) {
  console.error(`\nRAF CLOCK MIXING GATE: FAIL (${bad.length} unprotected site(s))`)
  process.exit(1)
}
console.log('\nRAF CLOCK MIXING GATE: PASS (every mixed-clock read is clamped or guarded)')
