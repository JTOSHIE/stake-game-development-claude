// currency_scale_drift.test.mjs - Fable ruling 8 (2026-07-26), updated by the
// R1a sanctioned locked pass (2026-07-25).
//
// THE DUPLICATION IS GONE. There is now exactly ONE declaration of
// CURRENCY_SCALE in the codebase:
//
//   src/lib/utils/currency.ts        CANONICAL, and the only declaration
//   src/lib/services/rgsService.ts   imports it (was a second declaration)
//   src/lib/services/replayService.ts imports it (was a third)
//
// The earlier version of this gate held two agreeing copies to each other,
// because rgsService.ts was locked and could not be changed. The first lock
// sanction (scope item d) removed that copy, so the gate's job changes: it no
// longer reconciles duplicates, it asserts that duplicates have not come back.
// That is the stronger property, and it is why the old failure message said the
// gate "must be updated deliberately, not deleted" if the declaration ever
// moved. This is that deliberate update.
//
// The money path is exactly where silent drift is least acceptable (CLAUDE.md
// makes integer micros mandatory with zero float tolerance), and "they agree
// because someone checked once" is the shape that produced the 2026-07-25
// currency defect.
//
// READ-ONLY. This script parses source as text and never writes to any of it.
//
// Run (from frontend/): node scripts/currency_scale_drift.test.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const src = (p) => readFileSync(resolve(here, '..', p), 'utf-8')

const SOURCES = [
  { label: 'canonical', path: 'src/lib/utils/currency.ts', locked: false },
]

// Modules that must IMPORT the canonical constant and must never declare their
// own. rgsService.ts joined this list when the lock sanction removed its copy.
const MUST_IMPORT = [
  'src/lib/services/rgsService.ts',
  'src/lib/services/replayService.ts',
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

// No consumer may reintroduce a local copy, and each must still import the
// canonical one. A module that stops importing it has either stopped using
// money maths, which is worth knowing, or has grown a copy under another name.
for (const path of MUST_IMPORT) {
  const text = src(path)
  if (DECL.test(text)) {
    failures.push(`${path} has reintroduced a local CURRENCY_SCALE declaration; it must import the canonical one from utils/currency.ts`)
  }
  if (!/CURRENCY_SCALE[^\n]*from\s*['"]\.\.\/utils\/currency['"]|from\s*['"]\.\.\/utils\/currency['"][^\n]*CURRENCY_SCALE/.test(text)) {
    failures.push(`${path} no longer references CURRENCY_SCALE from utils/currency`)
  }
}

for (const f of found) {
  console.log(`  ${f.label.padEnd(11)} ${String(f.value).padStart(9)}  ${f.path}${f.locked ? '  (locked, read-only)' : ''}`)
}

if (failures.length) {
  console.error('\nCURRENCY SCALE DRIFT: FAIL')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log(`\n  ${MUST_IMPORT.length} consumer(s) verified as importing, not declaring`)
console.log('\nCURRENCY SCALE DRIFT: PASS (one declaration at 1,000,000, no copies)')
