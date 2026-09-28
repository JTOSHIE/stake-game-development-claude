// plural.test.ts, R152. Count nouns agree with their count in all sixteen locales.
//
// The defect this closes shipped as the win breakdown chip reading "L3 x4 1 ways" (R151
// look-pass, desktop-1280_win_16x.png): `waysCount` was '{n} ways' in English and the same
// single form in fifteen more locales, so every one-way win (18.6% of base spins, weighted by
// lookUpTable_base_0.csv) printed a plural, and Russian, Polish and Arabic were wrong at
// several other counts as well. t() now resolves ICU-style plural blocks through
// Intl.PluralRules for the locale whose table supplied the string.
//
// Convention (p): the self-test plants the SHIPPED form and must go red on it.
//
// Run (from frontend/): npx tsx src/lib/i18n/plural.test.ts [--self-test]
import { t, LOCALE_CODES, type Locale } from './translations'

let failures = 0
const ok = (cond: boolean, msg: string) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${msg}`); if (!cond) failures++ }

// Locales whose nouns mark grammatical number. The rest (id ja ko tr vi zh) print one form
// after any numeral, which is correct for them, so they are not asked to vary.
const MARKS_NUMBER: Locale[] = ['en', 'ar', 'de', 'es', 'fi', 'fr', 'hi', 'pl', 'pt', 'ru']

/** A form that does not change between 1 and 2 cannot agree with both. */
function singularDiffers(render: (n: number) => string): boolean {
  return render(1) !== render(2).replace(/2/g, '1')
}

if (process.argv.includes('--self-test')) {
  console.log('SEEDED: the shipped English waysCount, "{n} ways"')
  const shipped = (n: number) => '{n} ways'.replace('{n}', String(n))
  if (singularDiffers(shipped)) { console.error('SELF-TEST FAIL: the shipped form was not caught'); process.exit(1) }
  console.log('  caught  "1 ways" reads the same as "2 ways" with its digit changed')
  console.log('SEEDED: a plural block with no "one" branch in a locale that has one')
  const noOne = (n: number) => t('en', 'waysCount', 'real', { n }).replace(/^1 way$/, '1 ways')
  if (singularDiffers(noOne)) { console.error('SELF-TEST FAIL: a missing branch was not caught'); process.exit(1) }
  console.log('  caught')
  console.log('\nPLURAL SELF-TEST: PASS')
  process.exit(0)
}

console.log('1. Every count key resolves: no raw plural syntax, no stray #, in any locale')
const WAYS = [1, 2, 3, 4, 5, 6, 8, 9, 12, 16, 18, 21, 22, 24, 27, 1024]
const AWARDS = [5, 8, 12, 16]
for (const loc of LOCALE_CODES) {
  const outs = [
    ...WAYS.map((n) => t(loc, 'waysCount', 'real', { n })),
    ...AWARDS.map((n) => t(loc, 'freeSpinsAward', 'real', { n })),
    ...[[0, 8], [1, 8], [3, 21], [2, 22], [7, 41]].map(([p, tot]) => t(loc, 'resumeBody', 'real', { played: p, total: tot })),
  ]
  ok(outs.every((s) => !/[{}#]/.test(s)), `${loc}: ${outs.length} renders, none carries { } or #`)
}

console.log('2. Where the language marks number, the singular differs from the plural')
for (const loc of MARKS_NUMBER) {
  ok(singularDiffers((n) => t(loc, 'waysCount', 'real', { n })), `${loc} waysCount: "${t(loc, 'waysCount', 'real', { n: 1 })}" vs "${t(loc, 'waysCount', 'real', { n: 2 })}"`)
}

console.log('3. The pinned forms at the counts real rounds reach (a change here is a translation change)')
const PIN: Array<[Locale, 'waysCount' | 'freeSpinsAward', number, string]> = [
  ['en', 'waysCount', 1, '1 way'], ['en', 'waysCount', 8, '8 ways'],
  ['de', 'waysCount', 1, '1 Gewinnweg'], ['fr', 'waysCount', 1, '1 façon'],
  ['ru', 'waysCount', 1, '1 способ'], ['ru', 'waysCount', 3, '3 способа'], ['ru', 'waysCount', 21, '21 способ'], ['ru', 'waysCount', 8, '8 способов'],
  ['pl', 'waysCount', 1, '1 sposób'], ['pl', 'waysCount', 22, '22 sposoby'], ['pl', 'waysCount', 5, '5 sposobów'],
  ['ar', 'waysCount', 2, '2 طريقتان'], ['ar', 'waysCount', 8, '8 طرق'], ['ar', 'waysCount', 12, '12 طريقة'],
  ['en', 'freeSpinsAward', 16, '+16 FREE SPINS'], ['ru', 'freeSpinsAward', 5, '+5 ФРИСПИНОВ'],
  ['pl', 'freeSpinsAward', 8, '+8 DARMOWYCH SPINÓW'], ['fi', 'freeSpinsAward', 12, '+12 ILMAISKIERROSTA'],
  ['tr', 'freeSpinsAward', 16, '+16 BEDAVA DÖNÜŞ'], ['ar', 'freeSpinsAward', 8, '+8 لفات مجانية'], ['ar', 'freeSpinsAward', 16, '+16 لفة مجانية'],
]
for (const [loc, key, n, want] of PIN) ok(t(loc, key, 'real', { n }) === want, `${loc} ${key} ${n} -> ${want}`)

console.log('4. A string with no plural block is unchanged by the plural pass')
ok(t('en', 'rgRealityCheckBody', 'real', { time: '00:10:00', amount: '$1.00' })
  === 'You have been playing for 00:10:00. Your net result this session is $1.00.', 'rgRealityCheckBody interpolates as before')

if (failures) { console.error(`\nPLURAL: FAIL (${failures})`); process.exit(1) }
console.log('\nPLURAL: PASS')
