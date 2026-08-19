#!/usr/bin/env node
//
// precision_law_gate.mjs: the platform's decimal-place law, asserted estate-wide.
//
// THE LAW, settled and no longer a question (R071 TASK 1). Source: a Stake
// reviewer message, corroborated exactly by the platform's own rgs.md:
//
//   PAYOUTS AND WINS display at up to FOUR decimal places: two by default,
//   widening past two only where sub-cent precision genuinely exists, which is
//   the $0.0008 class this game can really pay (0.08x at the 0.01 minimum bet).
//
//   BALANCES, COSTS, BETS and EVERY OTHER currency display render at EXACTLY
//   TWO. A balance is not a payout. A cost is not a payout.
//
// AND THE ZERO-DECIMAL FLOOR (R071 TASK 2), which is the one exception and is an
// exception in the honest direction: a non-zero amount BELOW one unit of a
// zero-decimal currency widens until its value is visible, because rounding
// 0.5 yen to an integer states a number the wallet did not move. This is the
// exact class a reviewer rejected another studio over.
//
// WHAT THIS GATE COVERS, and what covers the rest. This is the UNIT half: it
// drives the shipped formatters directly, over every currency class the platform
// table carries, with no browser and no build, so it runs in the static job for
// about a second. The RUNTIME half, that the rendered HUD and ledger really
// carry those strings, is r057_subcent_proof.mjs, which drives a real 0.08x
// round through the built bundle and whose expectations were conformed to this
// same law in the same commit.
//
// SEEDED SELF-TEST, convention (p). Three seeds, each the exact defect in the
// form it really occurred in this repository:
//   1. a THREE-PLACE BALANCE, which is what shipped until this pass;
//   2. a FOUR-PLACE COST, which is what the stand-back audit widened two cost
//      sites to;
//   3. the SILENT ROUND, a zero-decimal currency rendering a sub-unit amount as
//      an integer, which is what shipped until this pass.
// Each seed patches a scratch COPY of the module under test and requires the
// conformance to go red on it. The working file is never touched.
//
// RUNNER: npx tsx scripts/precision_law_gate.mjs [--self-test]

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CURRENCY = join(ROOT, 'src/lib/utils/currency.ts')

/**
 * The conformance table.
 *
 * `klass` is the law's own vocabulary, not ours: `win` is a payout display and
 * takes the widening rule, `other` is every balance, cost, bet and derived
 * figure and takes exactly two, except where the zero-decimal floor lifts it.
 */
const CASES = [
  // code, micros, klass, expected, why
  ['USD', 100_000_000, 'other', '$100.00', 'an ordinary balance renders at exactly two'],
  ['USD', 99_908_000, 'other', '$99.91', 'a balance carrying sub-cent micros still renders at exactly two'],
  ['USD', 125_000, 'other', '$0.13', 'the antelite cost at the 0.10 rung renders at exactly two'],
  ['USD', 12_500, 'other', '$0.01', 'the antelite cost at the 0.01 rung renders at exactly two'],
  ['USD', 800, 'win', '$0.0008', 'the 0.08x minimum win at the minimum bet widens to four'],
  ['USD', 8_000, 'win', '$0.008', 'a sub-cent win widens only as far as it needs'],
  ['USD', 100_000_000, 'win', '$100.00', 'a whole win does NOT widen'],
  ['XSC', 800, 'win', '0.0008 SC', 'the sweepstakes token widens the same way'],
  ['XSC', 99_908_000, 'other', '99.91 SC', 'and holds two on a balance'],
  // The zero-decimal floor. JPY, VND and CLP resolve to zero places in the
  // platform table this repository transcribes.
  ['JPY', 100_000_000, 'other', '¥100', 'a whole-unit zero-decimal balance is unchanged'],
  ['JPY', 500_000, 'other', '¥0.5', 'HALF A YEN WIDENS rather than rounding to a lying integer'],
  ['JPY', 800, 'other', '¥0.0008', 'and widens to four when that is what the amount needs'],
  ['JPY', 500_000, 'win', '¥0.5', 'the same floor applies to a win'],
  ['VND', 500_000, 'other', 'VND 0.5', 'VND is zero-decimal by the ruling and widens'],
  ['CLP', 500_000, 'other', 'CLP 0.5', 'CLP likewise'],
  // These four are TWO-decimal in the platform table this repository
  // transcribes, whatever the ts-client says, so they take the ordinary law.
  // Recorded as conformance rows because the brief named them.
  ['IDR', 250_000, 'other', 'Rp0.25', 'IDR is two-decimal in the published table'],
  ['KRW', 500_000, 'other', '₩0.50', 'KRW is two-decimal in the published table'],
  ['ISK', 500_000, 'other', 'kr0.50', 'ISK is two-decimal in the published table'],
  ['UGX', 500_000, 'other', 'USh0.50', 'UGX is two-decimal in the published table'],
  ['XOF', 500_000, 'other', 'CFA0.50', 'XOF is two-decimal in the published table'],
]

async function loadModule(source) {
  const dir = mkdtempSync(join(tmpdir(), 'precision-law-'))
  const file = join(dir, 'currency.ts')
  writeFileSync(file, source)
  const mod = await import(pathToFileURL(file).href)
  return { mod, dir }
}

async function conform(source, label) {
  const { mod, dir } = await loadModule(source)
  const failures = []
  for (const [code, micros, klass, expected, why] of CASES) {
    const got = klass === 'win'
      ? mod.formatWin(micros, code, 'en')
      : mod.formatBalance(micros, code, 'en')
    const ok = got === expected
    console.log(`  ${ok ? 'ok    ' : 'FAIL  '}  ${code} ${String(micros).padStart(11)} ${klass.padEnd(5)} `
      + `expected ${expected.padEnd(11)} got ${got.padEnd(11)} : ${why}`)
    if (!ok) failures.push(`${code} ${micros} ${klass}: expected ${expected}, got ${got}`)
  }
  return failures
}

/** The three seeds, each a real defect this repository actually shipped. */
const SEEDS = [
  {
    key: 'three-place-balance',
    what: 'the balance widens past two, which is what shipped until R071',
    // The law lives in the formatter's contract, so the seed lifts the floor on
    // every "other" display by making formatBalance widen like a win does.
    patch: (s) => s.replace(
      'const widen = (d: number): number => {',
      'const widen = (d: number): number => {\n    return Math.max(d, winFractionDigits(micros, code, display))'),
    expect: (f) => f.some((x) => x.startsWith('USD 99908000 other')),
  },
  {
    key: 'four-place-cost',
    what: 'a cost widens to four, which is what the stand-back audit did to two cost sites',
    patch: (s) => s.replace(
      'const widen = (d: number): number => {',
      'const widen = (d: number): number => {\n    if (Math.abs(micros) < CURRENCY_SCALE) return 4'),
    expect: (f) => f.some((x) => x.startsWith('USD 125000 other') || x.startsWith('USD 12500 other')),
  },
  {
    key: 'silent-round',
    what: 'a zero-decimal currency rounds a sub-unit amount to a lying integer',
    patch: (s) => s.replace(
      'export function zeroDecimalDigits(micros: number, maxDigits = 4): number {',
      'export function zeroDecimalDigits(micros: number, maxDigits = 4): number {\n  return 0'),
    expect: (f) => f.some((x) => x.startsWith('JPY 500000 other')),
  },
]

;(async () => {
  const source = readFileSync(CURRENCY, 'utf-8')
  const selfTest = process.argv.includes('--self-test')

  if (selfTest) {
    console.log('PRECISION LAW GATE SELF-TEST (convention p)\n')
    const problems = []
    for (const seed of SEEDS) {
      console.log(`SEEDED VIOLATION: ${seed.what}`)
      const patched = seed.patch(source)
      if (patched === source) {
        problems.push(`SEED NOT APPLIED: ${seed.key} matched nothing in currency.ts`)
        console.error(`  ERROR   the seed patched nothing, so it proves nothing`)
        continue
      }
      const failures = await conform(patched, seed.key)
      const caught = seed.expect(failures)
      console.log(`  ${caught ? 'caught' : 'MISSED'}  ${seed.key} fails the conformance, by row\n`)
      if (!caught) problems.push(`SEED NOT CAUGHT: ${seed.key}`)
    }
    if (problems.length) {
      for (const p of problems) console.error(`  ${p}`)
      console.error(`\nPRECISION LAW GATE SELF-TEST: FAIL (${problems.length}). `
        + 'A seeded defect this gate did not catch means its PASS means nothing.')
      process.exit(1)
    }
    console.log('PRECISION LAW GATE SELF-TEST: PASS (every seeded defect reproduces and is caught)')
    process.exit(0)
  }

  console.log('PRECISION LAW GATE\n')
  console.log(`CONFORMANCE, ${CASES.length} rows over the shipped formatters:`)
  const failures = await conform(source, 'shipped')
  console.log('')
  if (failures.length) {
    for (const f of failures) console.error(`  ${f}`)
    console.error(`\nPRECISION LAW GATE: FAIL (${failures.length})`)
    process.exit(1)
  }
  console.log('PRECISION LAW GATE: PASS (wins widen to four, everything else holds two, '
    + 'and a zero-decimal sub-unit amount never rounds to a lying integer)')
  process.exit(0)
})()
