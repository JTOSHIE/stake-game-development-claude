#!/usr/bin/env node
//
// multiplication_sign_gate.mjs: player-visible prose uses U+00D7, never letter x.
//
// Charter row Q-26. Closed 2026-07-30 by the true fixdown; this gate is what
// stops it reopening, because until now the class had NO gate at all
// (reports/qa/stream_test/KNOWN_OPEN.md, Q-26: "No gate covers this class, so it
// cannot regress noisily").
//
// WHY IT IS WORTH A GATE. The two prose files already wrote U+00D7 correctly 116
// times, so the convention was real and the 51 letter-x instances were drift, not
// a decision. That is precisely the machine-tell the standing mandate names: one
// glyph used two ways across surfaces a player sees side by side.
//
// WHY THE ENUMERATION IS PART OF THE GATE. Q-26's own parked row said the class
// had FOUR surviving instances. It had 51, and the missing 45 were in the file
// type the previous instrument never searched. So this gate scans BOTH prose
// files rather than the English master alone, and its self-test plants the defect
// in prose.locales.ts, which is the file the old count missed.
//
// USAGE
//   node scripts/multiplication_sign_gate.mjs
//   node scripts/multiplication_sign_gate.mjs --self-test
//
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// The player-visible text layer. Both files, because the class lives in both and
// the count that said "four" had looked at one.
const FILES = ['src/lib/i18n/prose.ts', 'src/lib/i18n/prose.locales.ts']

// A numeral immediately followed by a letter x is a multiplication sign written
// the wrong way. The comma-grouped form (5,000x) is included deliberately: that
// shape is what the Q-12 sweep was originally about, and an instrument that
// split on the comma would miss it.
const WRONG = /[0-9](?:\.[0-9]+)?,?[0-9]*x/g

function scan(extra = []) {
  const hits = []
  const sources = [...FILES.map((f) => [f, readFileSync(join(ROOT, f), 'utf-8')]), ...extra]
  for (const [name, body] of sources) {
    body.split('\n').forEach((line, i) => {
      for (const m of line.match(WRONG) || []) hits.push({ file: name, line: i + 1, text: m })
    })
  }
  return hits
}

function judge(hits, label) {
  const ok = (cond, msg) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${msg}`); return cond }
  const pass = ok(hits.length === 0,
    `${label}: no numeral-then-letter-x in player-visible prose (found ${hits.length}`
    + (hits.length ? `: ${hits.slice(0, 6).map((h) => `${h.file}:${h.line} "${h.text}"`).join(', ')}` : '') + ')')
  return pass
}

// The positive control: the convention must actually be in use, or a green run
// would just mean the strings are gone.
function countCorrect() {
  return FILES.reduce((n, f) => n + (readFileSync(join(ROOT, f), 'utf-8').match(/×/g) || []).length, 0)
}

const selfTest = process.argv.includes('--self-test')

if (selfTest) {
  console.log('SEEDED VIOLATION: the defect as it really shipped, planted in prose.locales.ts')
  console.log('  (that file, not the English master, is where 45 of the 51 real instances were)')
  const seeded = scan([['src/lib/i18n/prose.locales.ts (SEEDED)',
    "  modeSuperBlurb: 'Buy a rich entry with the Overdrive meter pre-revved to 5x.',"]])
  if (judge(seeded, 'seeded')) {
    console.error('\nMULTIPLICATION SIGN GATE SELF-TEST: FAIL. The planted defect was NOT caught, '
      + 'so this gate cannot see the class it claims to close.')
    process.exit(1)
  }
  console.log('  caught  the planted instance was reported')

  console.log('\nSEEDED VIOLATION 2: the comma-grouped form the old instrument split on')
  const seeded2 = scan([['src/lib/i18n/prose.ts (SEEDED)', "  maxWinBody: 'Max win is 5,000x your bet.',"]])
  if (judge(seeded2, 'seeded comma form')) {
    console.error('\nMULTIPLICATION SIGN GATE SELF-TEST: FAIL. The comma-grouped form was NOT caught.')
    process.exit(1)
  }
  console.log('  caught  the comma-grouped instance was reported')

  console.log('\nNEGATIVE CONTROL: the real tree must pass')
  if (!judge(scan(), 'clean')) {
    console.error('\nMULTIPLICATION SIGN GATE SELF-TEST: FAIL. The gate fails on clean input.')
    process.exit(1)
  }
  console.log('\nMULTIPLICATION SIGN GATE SELF-TEST: PASS (both forms reproduce, clean input passes)')
  process.exit(0)
}

console.log('MULTIPLICATION SIGN GATE (charter Q-26)')
const correct = countCorrect()
console.log(`  note  U+00D7 is in active use ${correct} times across the two prose files`)
const clean = judge(scan(), 'prose')
const conventionReal = correct > 100
console.log(`  ${conventionReal ? 'ok  ' : 'FAIL'}  the convention is actually in use, so a green run means something`)

if (!clean || !conventionReal) {
  console.error('\nMULTIPLICATION SIGN GATE: FAIL')
  process.exit(1)
}
console.log('\nMULTIPLICATION SIGN GATE: PASS')
