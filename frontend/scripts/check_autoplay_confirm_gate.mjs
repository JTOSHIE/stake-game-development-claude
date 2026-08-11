// check_autoplay_confirm_gate.mjs
//
// AUTOPLAY MUST TAKE TWO DELIBERATE ACTIONS. R042 BRIEF B, blocker B8.
//
// THE PLATFORM RULE, quoted verbatim from the dated mirror
// (docs/stake-engine-live/front-end-communication.md):
//
//   "If an 'autoplay' feature is present, the player must confirm the autoplay
//    action, games are not allowed to automatically place consecutive bets with
//    one click."
//
// WHAT THIS FILE USED TO SAY, and it is kept because being wrong in writing is
// the whole reason the gate is being rewritten rather than extended. The earlier
// version asserted, on a prior compliance read, that the spin-count button IS
// the explicit confirm: "choosing 10/25/50/100 is the tap that both sets the
// limits and starts autoplay in one user-initiated action". It then policed that
// design faithfully for weeks. **Fable reversed that reading on 2026-08-10**
// against the sentence above: the same click places consecutive bets, which is
// exactly what the sentence prohibits. A gate can be perfectly implemented and
// still be guarding the wrong property.
//
// WHAT IT ASSERTS NOW, and the shape matters more than the count:
//
//   1. `isAutoPlay.set(true)` appears exactly once in live component code.
//   2. That occurrence is inside the CONFIRM handler, by name.
//   3. NO SELECTION HANDLER can reach it. The function that a spin-count button
//      calls must not set the store, must not dispatch a spin, and must not call
//      the confirm handler.
//   4. Every spin-count button is wired to the SELECTION handler, so a count tap
//      cannot start a bet however the markup is rearranged.
//   5. The confirm control exists and is separate.
//
// Point 3 is the one that makes one-click starting impossible BY CONSTRUCTION
// rather than by convention: the code that begins a bet is not reachable from
// the control that chooses a number.
//
// RUNNER (TR-123 contract, applied by R047 TASK 5 for CI wiring): npx tsx,
// from frontend/. Exit 0 on PASS, non-zero on FAIL, terminates (static gate,
// no server, no browser; the PASS exit is explicit so the whole family
// carries one stated contract). Convention (p):
//   npx tsx scripts/check_autoplay_confirm_gate.mjs --self-test
//   npx tsx scripts/check_autoplay_confirm_gate.mjs
//
// Reads only.

import { readFileSync, globSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC_DIR = join(__dirname, '..', 'src')

const SET_TRUE = /isAutoPlay\.set\(\s*true\s*\)/
const SELECT_FN = 'selectAuto'
const CONFIRM_FN = 'confirmAuto'

/**
 * Extract a function body by brace matching from `function NAME(`.
 * Regex cannot do this, and the whole assertion is about what is INSIDE one
 * function and not inside another.
 */
export function functionBody(src, name) {
  const start = src.indexOf(`function ${name}(`)
  if (start < 0) return null
  const open = src.indexOf('{', start)
  if (open < 0) return null
  let depth = 0
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}') {
      depth--
      if (depth === 0) return src.slice(open, i + 1)
    }
  }
  return null
}

/** Every finding for one component's source. Exported so the self-test can seed. */
export function auditAutoplay(src, label = 'component') {
  const problems = []
  // COMMENTS DESCRIBE, THEY DO NOT ACT. The first run of this rewrite failed on
  // its own explanation: the source comment above `confirmAuto` says
  // "isAutoPlay.set(true) lives in exactly one of them", and a naive line count
  // read that as a second call site. A gate that cannot tell prose from code
  // punishes the documentation that makes the code reviewable.
  const isComment = (l) => /^\s*(\/\/|\*|\/\*)/.test(l)
  const setSites = src.split('\n').filter((l) => !isComment(l) && SET_TRUE.test(l)).length
  if (setSites !== 1) {
    problems.push(`${label}: isAutoPlay.set(true) appears ${setSites} time(s), expected exactly 1`)
  }

  const select = functionBody(src, SELECT_FN)
  const confirm = functionBody(src, CONFIRM_FN)
  if (!select) problems.push(`${label}: no ${SELECT_FN}() selection handler found`)
  if (!confirm) problems.push(`${label}: no ${CONFIRM_FN}() confirm handler found`)

  if (confirm && !SET_TRUE.test(confirm)) {
    problems.push(`${label}: ${CONFIRM_FN}() does not start autoplay, so the confirm step is inert`)
  }
  // THE LOAD-BEARING ASSERTION. A selection handler that can start a bet, or
  // dispatch a spin, or call the confirm handler, collapses the two steps back
  // into one however the markup looks.
  if (select) {
    if (SET_TRUE.test(select)) {
      problems.push(`${label}: ${SELECT_FN}() sets isAutoPlay, so choosing a count starts a bet`)
    }
    if (/dispatch\(\s*['"]spin['"]\s*\)/.test(select)) {
      problems.push(`${label}: ${SELECT_FN}() dispatches a spin, so choosing a count places a bet`)
    }
    if (new RegExp(`\\b${CONFIRM_FN}\\s*\\(`).test(select)) {
      problems.push(`${label}: ${SELECT_FN}() calls ${CONFIRM_FN}(), collapsing the two steps into one`)
    }
  }

  // Every spin-count control must call SELECTION, never confirm and never a
  // combined starter. Checked on the markup rather than on intent.
  for (const m of src.matchAll(/<button[^>]*class="auto-menu-item"[\s\S]{0,300}?on:click=\{([^}]*)\}/g)) {
    const handler = m[1]
    if (!handler.includes(SELECT_FN)) {
      problems.push(`${label}: a spin-count button calls ${handler.trim()} rather than ${SELECT_FN}`)
    }
  }
  if (!/data-testid="auto-start"/.test(src)) {
    problems.push(`${label}: no separate start control (data-testid="auto-start") exists`)
  }
  return problems
}

// ── self-test ────────────────────────────────────────────────────────────────
if (process.argv.includes('--self-test')) {
  const OK = readFileSync(join(SRC_DIR, 'lib/components/HudOverlay.svelte'), 'utf8')
  const CASES = [
    ['THE DEFECT ITSELF: the selection handler starts autoplay, which is one-click start', true,
      OK.replace(
        /function selectAuto\(requested: number\) \{[\s\S]*?\n  \}/,
        'function selectAuto(requested: number) {\n    pendingAutoCount = requested\n    isAutoPlay.set(true)\n  }')],
    ['the selection handler dispatches a spin, the same defect by another route', true,
      OK.replace(
        /function selectAuto\(requested: number\) \{[\s\S]*?\n  \}/,
        "function selectAuto(requested: number) {\n    pendingAutoCount = requested\n    dispatch('spin')\n  }")],
    ['the selection handler simply calls confirm, collapsing the two steps', true,
      OK.replace(
        /function selectAuto\(requested: number\) \{[\s\S]*?\n  \}/,
        'function selectAuto(requested: number) {\n    pendingAutoCount = requested\n    confirmAuto()\n  }')],
    ['a spin-count button rewired straight to confirm', true,
      OK.replace(/on:click=\{\(\) => selectAuto\(n\)\}/, 'on:click={confirmAuto}')],
    ['the separate start control is deleted', true,
      OK.split('data-testid="auto-start"').join('data-testid="auto-started"')],
    ['NEGATIVE CONTROL: the shipped two-step component must pass', false, OK],
  ]
  let bad = 0
  for (const [why, shouldFlag, src] of CASES) {
    const flagged = auditAutoplay(src, 'seed').length > 0
    const good = flagged === shouldFlag
    if (!good) bad++
    console.log(`  ${good ? 'caught ' : 'MISSED '} seeded: ${why}`)
  }
  const seeded = CASES.filter((c) => c[1]).length
  console.log(bad === 0
    ? `\nAUTOPLAY CONFIRM SELF-TEST: PASS (${seeded} seeded, ${CASES.length - seeded} negative control)`
    : `\nAUTOPLAY CONFIRM SELF-TEST: FAIL (${bad})`)
  process.exit(bad === 0 ? 0 : 1)
}

// ── run ──────────────────────────────────────────────────────────────────────
const files = globSync(join(SRC_DIR, '**', '*.svelte')).filter(
  (p) => !p.includes('node_modules') && !p.includes('/dist/'),
)
const allText = files.map((p) => readFileSync(p, 'utf8')).join('\n---\n')
const isImported = (path) => {
  const base = path.split('/').pop().replace('.svelte', '')
  return new RegExp(`import\\s+\\w+\\s+from\\s+['"][^'"]*${base}\\.svelte['"]`).test(allText)
}

const live = []
for (const path of files) {
  const text = readFileSync(path, 'utf8')
  if (!SET_TRUE.test(text)) continue
  const rel = path.replace(SRC_DIR, 'src')
  if (isImported(path)) live.push([rel, text])
  else console.log(`  note: ${rel} starts autoplay but is not imported anywhere (dead code)`)
}

console.log('='.repeat(70))
console.log('AUTOPLAY EXPLICIT-CONFIRM GATE (two-step, R042 BRIEF B)')
console.log('='.repeat(70))
console.log(`live components that can start autoplay: ${live.length}`)

let problems = []
if (live.length !== 1) {
  problems.push(`expected exactly 1 live component able to start autoplay, found ${live.length}`)
} else {
  const [rel, text] = live[0]
  console.log(`  ${rel}`)
  problems = auditAutoplay(text, rel)
}

if (problems.length) {
  console.error('\nAUTOPLAY EXPLICIT-CONFIRM GATE: FAIL')
  for (const p of problems) console.error(`  ${p}`)
  console.error('\nA spin count must SELECT only. Exactly one separate control may start a')
  console.error('bet, because the platform forbids placing consecutive bets from one click.')
  process.exit(1)
}
console.log('\nAUTOPLAY EXPLICIT-CONFIRM GATE: PASS')
console.log('  one-click start is impossible by construction: the selection handler')
console.log('  cannot set the store, cannot dispatch a spin, and cannot call confirm.')
process.exit(0)
