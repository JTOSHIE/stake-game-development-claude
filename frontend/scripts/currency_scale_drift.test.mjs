// currency_scale_drift.test.mjs - Fable ruling 8 (2026-07-26).
//
// CURRENCY_SCALE exists in two places and cannot be reduced to one:
//
//   src/lib/utils/currency.ts    CANONICAL
//   src/lib/services/rgsService.ts   LOCKED, cannot be edited
//
// A third module-local copy in replayService.ts was removed in the same pass;
// it now imports the canonical one.
//
// All copies currently agree. The money path is exactly where silent drift is
// least acceptable (CLAUDE.md makes integer micros mandatory with zero float
// tolerance), and "they agree because someone checked once" is the shape that
// produced the 2026-07-25 currency defect. This gate holds the remaining
// duplication with an assert rather than a comment.
//
// READ-ONLY. This script parses rgsService.ts as text and never writes to it.
// Reading a locked file is permitted; writing is not, and nothing here does.
//
// Run (from frontend/): node scripts/currency_scale_drift.test.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const src = (p) => readFileSync(resolve(here, '..', p), 'utf-8')

const SOURCES = [
  { label: 'canonical', path: 'src/lib/utils/currency.ts', locked: false },
  { label: 'locked RGS', path: 'src/lib/services/rgsService.ts', locked: true },
]

// Matches `export const CURRENCY_SCALE = 1_000_000` and the un-exported form,
// with or without underscore separators.
const DECL = /(?:export\s+)?const\s+CURRENCY_SCALE\s*=\s*([0-9_]+)/

const failures = []
const found = []

for (const s of SOURCES) {
  let text
  try {
    text = src(s.path)
  } catch (err) {
    failures.push(`${s.path}: unreadable (${err.code})`)
    continue
  }
  const m = text.match(DECL)
  if (!m) {
    failures.push(`${s.path}: no CURRENCY_SCALE declaration found. If it moved, this gate must be updated deliberately, not deleted.`)
    continue
  }
  found.push({ ...s, raw: m[1], value: Number(m[1].replace(/_/g, '')) })
}

// Every declaration must equal the canonical one.
const canonical = found.find((f) => f.label === 'canonical')
if (!canonical) {
  failures.push('canonical CURRENCY_SCALE missing from src/lib/utils/currency.ts')
} else {
  if (canonical.value !== 1_000_000) {
    failures.push(`canonical CURRENCY_SCALE is ${canonical.value}, expected 1000000 (the RGS wallet scale, 6 decimal places)`)
  }
  for (const f of found) {
    if (f.value !== canonical.value) {
      failures.push(`DRIFT: ${f.path} declares ${f.value}, canonical is ${canonical.value}`)
    }
  }
}

// replayService must not reintroduce its own copy.
const replay = src('src/lib/services/replayService.ts')
if (DECL.test(replay)) {
  failures.push('src/lib/services/replayService.ts has reintroduced a local CURRENCY_SCALE declaration; it must import the canonical one from utils/currency.ts')
}
if (!/import\s*\{[^}]*CURRENCY_SCALE[^}]*\}\s*from\s*['"]\.\.\/utils\/currency['"]/.test(replay)) {
  failures.push('src/lib/services/replayService.ts no longer imports CURRENCY_SCALE from utils/currency')
}

for (const f of found) {
  console.log(`  ${f.label.padEnd(11)} ${String(f.value).padStart(9)}  ${f.path}${f.locked ? '  (locked, read-only)' : ''}`)
}

if (failures.length) {
  console.error('\nCURRENCY SCALE DRIFT: FAIL')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log('\nCURRENCY SCALE DRIFT: PASS (all declarations agree at 1,000,000)')
