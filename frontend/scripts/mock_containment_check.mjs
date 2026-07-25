// mock_containment_check.mjs - R2 / TR-010 (2026-07-25).
//
// Asserts the PRODUCTION bundle structurally cannot reach the dev mock.
//
// Two gates:
//
//   1. SOURCE. Every import of the mock modules is inside an
//      `import.meta.env.DEV` guard, so Vite's dead-code elimination removes the
//      whole branch from a production build.
//   2. BUNDLE. The built production output contains none of the mock payload.
//      This is the one that actually matters: gate 1 checks intent, gate 2
//      checks the artefact that ships. The curated sample_rounds.json is a
//      multi-megabyte file of real book rounds, so its absence is both a
//      containment property and a bundle-size one.
//
// Run (from frontend/): npm run build && node scripts/mock_containment_check.mjs

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, relative } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')
const DIST = join(ROOT, 'dist')

const failures = []

// ── Gate 1: every mock import is DEV-guarded ─────────────────────────────────
const MOCK_MODULES = ['mock/roundProvider', 'mock/sample_rounds']

function walk(dir, out = [], filter = /\.(svelte|ts)$/) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out, filter)
    else if (filter.test(name)) out.push(p)
  }
  return out
}

let guarded = 0
for (const file of walk(join(ROOT, 'src'))) {
  // Two exclusions, both deliberate:
  //   - src/lib/mock/** IS the mock. It importing its own sample data is not a
  //     leak; what matters is whether anything OUTSIDE it reaches in unguarded.
  //   - *.test.ts never ships. A test importing the mock is the normal case.
  if (file.includes('/lib/mock/') || /\.test\./.test(file)) continue
  const text = readFileSync(file, 'utf-8')
  if (!MOCK_MODULES.some((m) => text.includes(m))) continue
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    if (!MOCK_MODULES.some((m) => line.includes(m))) return
    // The guard may be on this line or in the enclosing block just above it.
    const window = lines.slice(Math.max(0, i - 6), i + 1).join('\n')
    if (window.includes('import.meta.env.DEV')) guarded++
    else failures.push({
      gate: 'source',
      detail: `${relative(ROOT, file)}:${i + 1} imports a mock module without an enclosing import.meta.env.DEV guard. `
            + `An unguarded import compiles the mock into the production bundle.`,
    })
  })
}

// ── Gate 2: the built bundle carries no mock payload ─────────────────────────
let scanned = 0
if (!existsSync(DIST)) {
  failures.push({ gate: 'bundle', detail: 'dist/ not found. Run `npm run build` before this check; skipping the bundle gate is not a pass.' })
} else {
  // Markers chosen to be present in the mock payload and absent from product
  // code. `criteria` and `payoutMultiplier` are book-row fields that only the
  // curated samples carry as literal data.
  const MARKERS = ['serveMockRound', 'triggeredSamples', 'sample_rounds', 'preloadSamples']
  // Recurse the WHOLE of dist. The first version of this reused the source
  // walker, whose filter is .svelte/.ts, so it scanned exactly one file and
  // passed vacuously. A containment gate that scans nothing is worse than no
  // gate, because it reports PASS.
  const built = walk(DIST, [], /\.(js|mjs|json|html|css)$/)
  if (built.length < 2) {
    failures.push({ gate: 'bundle', detail: `only ${built.length} built file(s) found under dist/. That is too few to be a real build; refusing to report a pass on it.` })
  }
  for (const file of built) {
    scanned++
    const text = readFileSync(file, 'utf-8')
    for (const marker of MARKERS) {
      if (text.includes(marker)) {
        failures.push({
          gate: 'bundle',
          detail: `${relative(ROOT, file)} contains "${marker}". The dev mock reached the production bundle.`,
        })
      }
    }
  }
}

console.log(`MOCK CONTAINMENT: ${guarded} guarded mock import(s) in source, ${scanned} built file(s) scanned`)

if (failures.length) {
  console.error(`\nMOCK CONTAINMENT: FAIL (${failures.length})`)
  for (const f of failures) console.error(`  [${f.gate}] ${f.detail}`)
  process.exit(1)
}
console.log('\nMOCK CONTAINMENT: PASS')
