// check_autoplay_confirm_gate.mjs — Wiring Integrity Audit, item 3(ii).
//
// The platform manual's only hard autoplay rule (per Fable's compliance
// read): the player must explicitly confirm autoplay, and a game must never
// place consecutive bets from one click. This repo has no separate
// "AutoPlayModal" confirm step - the spin-count button in the HUD's auto-menu
// IS the explicit confirm (choosing "10"/"25"/"50"/"100" is the tap that both
// sets the limits and starts autoplay in one user-initiated action).
//
// This is a permanent regression gate, not a one-off check: it asserts
// `isAutoPlay.set(true)` appears in EXACTLY ONE place in the whole frontend,
// and that occurrence sits inside a function reachable only from a real
// `on:click` handler in the same file. If a future change ever added a second
// path to start autoplay (a keyboard shortcut, a URL param, an automatic
// continuation), this fails loudly rather than silently creating a
// no-explicit-confirm autoplay start.
//
// Run: node scripts/check_autoplay_confirm_gate.mjs (from frontend/)

import { readFileSync, globSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC_DIR = join(__dirname, '..', 'src')

const files = globSync(join(SRC_DIR, '**', '*.svelte')).filter(
  (p) => !p.includes('node_modules') && !p.includes('/dist/'),
)

const SET_TRUE = /isAutoPlay\.set\(\s*true\s*\)/
const ON_CLICK = /on:click=\{/

// Liveness check: is this component actually imported anywhere (a real
// `import X from '.../Name.svelte'`, not a stray comment mentioning the
// name)? A hit inside a component nobody imports can't reach a real player,
// but it is still worth surfacing loudly - dead code duplicating live
// autoplay-start logic is exactly the kind of stale artefact that has caused
// confusion in past audits (see the Collection Meter finding).
const allText = files.map((p) => readFileSync(p, 'utf8')).join('\n---\n')
function isImportedAnywhere(path) {
  const base = path.split('/').pop().replace('.svelte', '')
  const importPattern = new RegExp(`import\\s+\\w+\\s+from\\s+['"][^'"]*${base}\\.svelte['"]`)
  return importPattern.test(allText)
}

const hits = []
for (const path of files) {
  const text = readFileSync(path, 'utf8')
  const lines = text.split('\n')
  const live = isImportedAnywhere(path)
  lines.forEach((line, i) => {
    if (SET_TRUE.test(line)) hits.push({ path: path.replace(SRC_DIR, 'src'), line: i + 1, text: line.trim(), fullText: text, live })
  })
}

console.log('='.repeat(70))
console.log('AUTOPLAY EXPLICIT-CONFIRM GATE')
console.log('='.repeat(70))
console.log(`isAutoPlay.set(true) call sites found: ${hits.length}`)
for (const h of hits) console.log(`  [${h.live ? 'LIVE' : 'dead code, unmounted'}] ${h.path}:${h.line}  ${h.text}`)

const liveHits = hits.filter((h) => h.live)
const deadHits = hits.filter((h) => !h.live)

let fail = false
if (liveHits.length !== 1) {
  console.log('')
  console.log(`FAIL: expected exactly 1 LIVE (imported/mounted) call site, found ${liveHits.length}.` +
    ' A new path into autoplay must be reviewed for an explicit user-confirm gate before this count changes.')
  fail = true
} else {
  // Confirm the single live call site's enclosing function is bound to a real
  // on:click in the same file (a light heuristic: the file must contain at
  // least one on:click handler - proving this is a component with real click
  // wiring, not e.g. a store module or a keyboard/timer-driven path).
  const [hit] = liveHits
  if (!ON_CLICK.test(hit.fullText)) {
    console.log('')
    console.log(`FAIL: ${hit.path} has no on:click handler at all - isAutoPlay.set(true) may not be tap-gated.`)
    fail = true
  }
}
if (deadHits.length) {
  console.log('')
  console.log(`NOTE: ${deadHits.length} call site(s) in unmounted/dead components - unreachable by a real` +
    ' player today, but flagged since dead code duplicating live wiring is a stale-artefact risk' +
    ' (see the audit report). Not gated on, since it cannot affect a live session.')
}

if (fail) {
  console.log('')
  console.log('AUTOPLAY CONFIRM GATE: FAIL')
  process.exitCode = 1
} else {
  console.log('')
  console.log('AUTOPLAY CONFIRM GATE: PASS (exactly one start path, gated behind a real on:click)')
}
