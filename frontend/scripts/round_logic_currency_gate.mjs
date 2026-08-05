// round_logic_currency_gate.mjs
//
// S2-C116. A round's OUTCOME must not depend on the player's currency.
//
// THE INVARIANT, stated as the thing that would be wrong if it broke: the
// modules that turn a book round into a presentation script read board events,
// win amounts in centibets and the multiplier meter. They must never read the
// currency code. A branch anywhere in that path that behaves differently for
// XSC than for EUR is a round whose shape depends on the wallet, which is a
// fairness defect rather than a display one, and no existing gate looks for it.
//
// THIS IS A REGRESSION GUARD, NOT A FIX, and that is why it is cheap. The
// property already holds at HEAD: every module below scans clean. Its whole
// value is the seeded red, which is what makes it a gate rather than a comment.
//
// WHAT IS DELIBERATELY OUT OF SCOPE. rgsService.ts is the wallet and transport
// layer. It SHOULD read currency, it does so about thirty times, and it is a
// locked file. Including it would make this gate permanently red and it would
// then be deleted or exempted, which is how a gate stops meaning anything.
// replayService.ts and telemetry.ts are excluded for the same reason: they carry
// currency legitimately, for display and for reporting.
//
// THE TRAP THIS GATE WALKED INTO ON ITS FIRST RUN, kept because the next person
// to widen it will hit the same thing. sessionRecovery.ts contains the word
// "currency" once, in a COMMENT describing what initRGS publishes. A naive
// /currenc/i scan over raw source flags it, and the honest reading is that
// nothing in that file's CODE touches currency at all. So this gate strips
// comments and string literals before it looks, and ships that exact line as a
// negative control that must survive.
//
// Convention (p):
//   node scripts/round_logic_currency_gate.mjs --self-test
//   node scripts/round_logic_currency_gate.mjs
//
// Writes nothing. Convention (h.1) holds by construction.

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const FRONTEND = join(dirname(fileURLToPath(import.meta.url)), '..')

// The round-shaping path, derived rather than assumed: every non-test module
// that handles RawEvent or PresentationScript, minus the wallet layer above.
const MODULES = [
  'src/lib/services/roundInterpreter.ts',
  'src/lib/stores/roundEvents.ts',
  'src/lib/stores/presentationCheckpoint.ts',
  'src/lib/stores/sessionRecovery.ts',
  'src/lib/mock/roundProvider.ts',
]

/**
 * Remove line comments, block comments and string literals.
 *
 * String literals go too, and that is deliberate: a currency code inside a
 * string is data being passed through, not logic branching on it, and the
 * defect this gate exists to catch is a BRANCH.
 */
function codeOnly(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``')
}

const RULES = [
  [/from\s+['"][^'"]*utils\/currency['"]/, 'imports the currency utilities'],
  [/\bcurrencyCode\b/, 'reads the currencyCode store'],
  [/\b\w*[Cc]urrenc\w*\b/, 'names a currency identifier'],
]

function violations(src) {
  const code = codeOnly(src)
  const out = []
  for (const [re, why] of RULES) {
    const m = code.match(re)
    if (m) out.push({ hit: m[0].trim().slice(0, 60), why })
  }
  return out
}

// ── self-test ────────────────────────────────────────────────────────────────
function selfTest() {
  const real = readFileSync(join(FRONTEND, MODULES[0]), 'utf8')
  const recovery = readFileSync(join(FRONTEND, 'src/lib/stores/sessionRecovery.ts'), 'utf8')

  const SEEDS = [
    ['a currencyCode-conditional branch inside the interpreter, which is the '
      + 'form a fairness defect really takes', true,
      real.replace('export', "import { currencyCode } from '../stores/gameStore'\n"
        + 'const _bump = get(currencyCode) === \'XSC\' ? 2 : 1\nexport', 1)],
    ['an import of the currency utilities into round-shaping code', true,
      "import { currencySymbolFor } from '../utils/currency'\n" + real],
    ['a currency-named local, which is the subtler form: no import, no store, '
      + 'just logic that has learned about currency', true,
      'const currencyBias = 1.0\n' + real],
    ['NEGATIVE CONTROL: the real interpreter must survive', false, real],
    ['NEGATIVE CONTROL: sessionRecovery names currency in a COMMENT only, and '
      + 'that must survive, which is the false positive this gate was born with',
      false, recovery],
    ['NEGATIVE CONTROL: a currency code inside a STRING is data, not a branch',
      false, "const label = 'currencyCode'\n" + real],
  ]

  let bad = 0
  for (const [why, shouldFlag, src] of SEEDS) {
    const ok = (violations(src).length > 0) === shouldFlag
    if (!ok) bad++
    console.log(`  ${ok ? 'caught ' : 'MISSED '} seeded: ${why}`)
  }
  console.log(bad === 0
    ? `ROUND LOGIC CURRENCY GATE SELF-TEST: PASS (${SEEDS.length} seeded, 3 negative controls)`
    : `ROUND LOGIC CURRENCY GATE SELF-TEST: FAIL (${bad})`)
  process.exit(bad === 0 ? 0 : 1)
}

// ── real run ─────────────────────────────────────────────────────────────────
function run() {
  const findings = []
  for (const rel of MODULES) {
    const abs = join(FRONTEND, rel)
    if (!existsSync(abs)) {
      console.error(`ROUND LOGIC CURRENCY GATE: FAIL, ${rel} is absent. `
        + 'A module that moved is a scope change, not a pass.')
      process.exit(1)
    }
    for (const v of violations(readFileSync(abs, 'utf8'))) findings.push({ rel, ...v })
  }

  console.log(`ROUND LOGIC CURRENCY GATE: ${MODULES.length} round-shaping module(s) scanned`)

  if (findings.length) {
    console.error('ROUND LOGIC CURRENCY GATE: FAIL, round-shaping logic reads currency')
    for (const f of findings) console.error(`  ${f.rel}: ${f.why} ("${f.hit}")`)
    console.error('A round\'s shape must not depend on the wallet. If a module here now '
      + 'legitimately needs currency, it has left the round-shaping path and belongs '
      + 'outside MODULES, with the reason recorded.')
    process.exit(1)
  }

  console.log('ROUND LOGIC CURRENCY GATE: PASS (no round-shaping module reads currency)')
  process.exit(0)
}

if (process.argv.includes('--self-test')) selfTest()
else run()
