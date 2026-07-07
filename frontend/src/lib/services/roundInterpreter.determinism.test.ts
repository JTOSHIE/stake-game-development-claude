// roundInterpreter.determinism.test.ts — provably-fair readiness gate.
// Run: npx tsx src/lib/services/roundInterpreter.determinism.test.ts
//
// PF invariant 2 (docs/PF_READINESS.md): every round is reconstructable from its
// book, and the presentation is deterministic - same book in, byte-identical
// presentation out, with NO dependence on wall clock or RNG. This test replays each
// curated sample book multiple times and asserts the interpreted script is identical
// every time. If this ever fails, the client has introduced hidden entropy into the
// outcome/replay path and PF reconstruction is broken.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { interpretRound, type BookRound } from './roundInterpreter.ts'

const here = dirname(fileURLToPath(import.meta.url))
const samplesPath = resolve(here, '../mock/sample_rounds.json')
const samples: Array<{ mode: string; category: string; round: BookRound }> = JSON.parse(
  readFileSync(samplesPath, 'utf-8'),
)

const RUNS = 5
let pass = 0
const failures: string[] = []

for (const s of samples) {
  const label = `${s.mode}/${s.category} (id ${s.round?.id ?? '?'})`
  // Reconstruct the SAME book repeatedly; capture each script as canonical JSON.
  const renders: string[] = []
  for (let i = 0; i < RUNS; i++) {
    // Deep-clone the input each run so no interpretRound call can mutate shared
    // state and mask non-determinism.
    const round: BookRound = JSON.parse(JSON.stringify(s.round))
    renders.push(JSON.stringify(interpretRound(round)))
  }
  const allIdentical = renders.every((r) => r === renders[0])
  if (allIdentical) {
    pass++
  } else {
    const first = renders[0]
    const diffAt = renders.findIndex((r) => r !== first)
    failures.push(`${label}: run ${diffAt} differs from run 0 (non-deterministic presentation)`)
  }
}

// Guard: the interpreter must not read wall clock. A crude but effective check -
// the source has no Date.now()/new Date()/Math.random() in the outcome path.
const srcPath = resolve(here, './roundInterpreter.ts')
const src = readFileSync(srcPath, 'utf-8')
const banned = ['Math.random', 'Date.now', 'new Date(']
const found = banned.filter((b) => src.includes(b))
if (found.length) {
  failures.push(`roundInterpreter.ts uses non-deterministic API(s): ${found.join(', ')}`)
}

console.log('='.repeat(70))
console.log('PF READINESS: round-reconstruction determinism')
console.log('='.repeat(70))
console.log(`samples: ${samples.length}  runs each: ${RUNS}  deterministic: ${pass}`)
if (failures.length) {
  console.log('\nFAILURES:')
  for (const f of failures) console.log('  - ' + f)
  console.log('\nPF DETERMINISM: FAIL')
  process.exit(1)
}
console.log('\nPF DETERMINISM: PASS (every sample book reconstructs identically)')
