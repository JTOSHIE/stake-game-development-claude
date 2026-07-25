// typecheck_baseline.mjs - Fable ruling 11 (2026-07-26), CI gate.
//
// BASELINE IS ZERO as of 2026-07-27 (R10). All eleven pre-existing errors were
// fixed rather than tolerated, and three of them turned out to be one defect
// each rather than noise:
//
//   - RainLayer.svelte carried a literal style tag inside a script COMMENT.
//     svelte.compile respects comments so the file always built and shipped, but
//     svelte2tsx (what svelte-check runs) treated it as a real element, considered
//     the script closed, and misparsed to EOF. That produced 3 errors AND silently
//     disabled type-checking for the whole component.
//   - telemetry.ts used `Omit<Union, K>`, which is NOT distributive and collapses
//     a union to its common properties. Every per-variant field vanished from
//     track()'s parameter type: 5 errors from one operator.
//   - The remaining 3 were literal-union widening and one genuinely dead markup
//     branch left behind by Round 3 item 5.
//
// Historical note, kept because it explains why this gate exists at all:
//
//   1. (RESOLVED 2026-07-26) tsx-run test files were producing ~22 spurious
//      errors because the browser app's tsconfig was being applied to scripts
//      that legitimately use node: builtins and .ts import extensions. They are
//      now excluded in tsconfig.app.json and run explicitly under tsx instead,
//      which dropped the baseline from 33 errors to 11 without touching a line
//      of app code.
//   2. Telemetry payload typing in App.svelte: track() calls pass fields the
//      TelemetryEvent type does not declare. Telemetry is a no-op observer sink
//      with zero network calls (docs/TELEMETRY_TAXONOMY.md), so these are
//      annotation gaps rather than runtime risk.
//
// Burning them down is a real cleanup, in the most complex file in the tree,
// days before an external audit. That is a decision for Fable, not something to
// smuggle into a CI commit. So this gate locks in the CURRENT state and fails
// only on REGRESSION: new type errors cannot be introduced, and the existing
// ones cannot be quietly added to.
//
// The baseline is now zero and MUST STAY THERE. Raising it requires a deliberate
// edit and a reason in the commit message, and should be treated as a red flag
// rather than routine maintenance.
//
// Known limitation, stated rather than hidden: this compares counts, not
// identities. Removing one error and adding a different one nets to zero and
// would pass. A stricter identity-based baseline is possible if this ever
// proves too loose in practice.
//
// Run (from frontend/): node scripts/typecheck_baseline.mjs

import { execSync } from 'node:child_process'

const BASELINE_ERRORS = 0
const BASELINE_WARNINGS = 36

let out = ''
try {
  out = execSync('npx svelte-check --tsconfig ./tsconfig.app.json --output human', {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 32 * 1024 * 1024,
  })
} catch (err) {
  // svelte-check exits non-zero whenever errors exist, which is the normal case
  // while the baseline is above zero. The output is what matters.
  out = `${err.stdout || ''}${err.stderr || ''}`
}

// svelte-check emits two different summary shapes depending on --output.
// Accept both, so this gate does not silently break if the flag changes.
//   machine: "COMPLETED 485 FILES 11 ERRORS 36 WARNINGS"
//   human:   "svelte-check found 11 errors and 36 warnings in 9 files"
let files, errors, warnings
const machine = out.match(/COMPLETED\s+(\d+)\s+FILES\s+(\d+)\s+ERRORS\s+(\d+)\s+WARNINGS/)
const human = out.match(/found\s+(\d+)\s+errors?\s+and\s+(\d+)\s+warnings?\s+in\s+(\d+)\s+files?/i)
if (machine) {
  ;[, files, errors, warnings] = machine.map(Number)
} else if (human) {
  ;[, errors, warnings, files] = human.map(Number)
} else {
  console.error('TYPECHECK BASELINE: FAIL - could not parse the svelte-check summary in either format.')
  console.error(out.slice(-2000))
  process.exit(1)
}
console.log(`svelte-check: ${files} files, ${errors} errors, ${warnings} warnings`)
console.log(`baseline:     ${BASELINE_ERRORS} errors, ${BASELINE_WARNINGS} warnings`)

const failures = []
if (errors > BASELINE_ERRORS) {
  failures.push(`errors rose ${BASELINE_ERRORS} -> ${errors}. New type errors were introduced.`)
}
if (warnings > BASELINE_WARNINGS) {
  failures.push(`warnings rose ${BASELINE_WARNINGS} -> ${warnings}.`)
}

if (failures.length) {
  console.error('\nTYPECHECK BASELINE: FAIL')
  for (const f of failures) console.error(`  - ${f}`)
  console.error('\nFix the new errors, or lower nothing and explain why the baseline must rise.')
  process.exit(1)
}

if (errors < BASELINE_ERRORS || warnings < BASELINE_WARNINGS) {
  console.log(`\nBaseline improved (${BASELINE_ERRORS - errors} fewer errors, ${BASELINE_WARNINGS - warnings} fewer warnings).`)
  console.log('Lower BASELINE_ERRORS / BASELINE_WARNINGS in this file to lock the gain in.')
}
console.log('\nTYPECHECK BASELINE: PASS')
