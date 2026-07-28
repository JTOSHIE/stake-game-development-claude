// vocabulary.test.ts - R2R JOB 6 / TR-041 (2026-07-25). New CI gate 6b.
// Run (from frontend/): npx tsx src/lib/i18n/vocabulary.test.ts
//
// The static half of the social vocabulary gate. The full-rendered-DOM scan
// (scripts/social_dom_conformance.mjs) needs Playwright and a dev server and so
// stays local and in the external audit, per the CI workflow's stated scope.
// This half needs neither and therefore runs on every pull request.
//
// It asserts three things the DOM scan cannot:
//
//   1. The term table still matches the dated jurisdiction mirror, row for row.
//      If someone edits the table to make a string pass, this fails.
//   2. `sv()` behaves: it rewrites in social, leaves real-money alone, prefers
//      the longer phrase, preserves case, and respects word boundaries.
//   3. The three surfaces R2R3 named carry no prohibited term in social, read
//      from the SHIPPED component source rather than from a copy of it.

import { readFileSync } from 'node:fs'
import { t } from './translations'
import {
  sv, scanProhibited, PROHIBITED_TERMS, NOT_SUBSTITUTED, TERM_TABLE_SOURCE,
} from './vocabulary.ts'

let failures = 0
const check = (name: string, a: unknown, e: unknown) => {
  if (JSON.stringify(a) === JSON.stringify(e)) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}\n    expected ${JSON.stringify(e)}\n    actual   ${JSON.stringify(a)}`) }
}
const checkThat = (name: string, cond: boolean) => {
  if (cond) console.log(`  ok   ${name}`)
  else { failures++; console.error(`  FAIL ${name}`) }
}

// ── 1. The table still matches the mirror ────────────────────────────────────
// Read the mirror itself and rebuild the table from it. Two independent inputs
// per convention (l.4): the module's transcription and the dated snapshot.
console.log('\nTHE TERM TABLE against the dated jurisdiction mirror')
const mirror = readFileSync('../docs/stake-engine-live/jurisdiction-requirements.md', 'utf8')
const shaLine = mirror.match(/content_sha256:\s*([0-9a-f]{64})/)
check('the mirror is the one the table was transcribed from',
  shaLine?.[1], TERM_TABLE_SOURCE.contentSha256)

// The table in the mirror is tab-separated, one row per line, after the header.
const rows: Array<[string, string]> = []
let inTable = false
for (const line of mirror.split('\n')) {
  if (/^Restricted Phrase\s+Replacement Phrase/.test(line)) { inTable = true; continue }
  if (!inTable) continue
  const parts = line.split('\t')
  if (parts.length !== 2 || !parts[0].trim()) continue
  rows.push([parts[0].trim(), parts[1].trim()])
}
check('the mirror table has the same number of rows as the module', rows.length, PROHIBITED_TERMS.length)
const mismatched = rows.filter((r, i) =>
  PROHIBITED_TERMS[i]?.phrase !== r[0] || PROHIBITED_TERMS[i]?.replacement !== r[1])
check('every row matches, in the mirror\'s own order, duplicates included', mismatched.length, 0)

// ── 2. sv() behaviour ────────────────────────────────────────────────────────
console.log('\nsv(), the one vocabulary function')
check('real-money mode is untouched', sv('Max Bet', false), 'Max Bet')
check('a single word is replaced', sv('Increase Bet', true), 'Increase Play')
check('ALL CAPS stays ALL CAPS', sv('BET', true), 'PLAY')
check('sentence case is preserved', sv('Bet the maximum.', true), 'Play the maximum.')
check('lower case stays lower case', sv('your bet', true), 'your play')
// Longest-phrase-first is what stops "total bet" becoming "total play"
// via the single-word rule and then diverging from the platform's own row.
check('the longer phrase wins over the shorter one', sv('total bet', true), 'total play')
check('pays out beats pays', sv('the game pays out', true), 'the game won')
// Word boundaries: "better" and "abetting" must not be mangled.
check('a word merely containing a term is untouched', sv('better', true), 'better')
check('and so is a longer word', sv('abetting', true), 'abetting')
check('buy becomes play', sv('buy the feature', true), 'play the feature')
check('empty input is returned as-is', sv('', true), '')

console.log('\nscanProhibited()')
check('finds a term', scanProhibited('Max Bet'), ['bet'])
check('finds nothing in compliant text', scanProhibited('Max Play'), [])
check('excludes the never-rewrite terms by default', scanProhibited('Stake Engine'), [])
check('and reports them when asked',
  scanProhibited('Stake Engine', { includeNeverRewrite: true }), ['stake'])
checkThat('every never-rewrite term carries a recorded reason',
  Object.values(NOT_SUBSTITUTED).every((r) => typeof r === 'string' && r.length > 10))

// ── 3. The three surfaces R2R3 named, read from the shipped source ───────────
// A component that hardcodes a prohibited literal and never routes it through
// sv() is the exact defect. These read the real files.
console.log('\nTHE THREE NAMED SURFACES, read from the shipped components')

const paytable = readFileSync('src/lib/components/PaytableModal.svelte', 'utf8')
const winBanner = readFileSync('src/lib/components/WinBanner.svelte', 'utf8')

checkThat('PaytableModal imports the vocabulary layer', /from '\.\.\/i18n\/vocabulary'/.test(paytable))
checkThat('WinBanner imports the vocabulary layer', /from '\.\.\/i18n\/vocabulary'/.test(winBanner))

// ── The rules and the interface guide moved to the locale layer, JOB 2 ───────
//
// These three assertions used to read the SOURCE of PaytableModal, because the
// social wording lived there as two branches of English literals mapped through
// sv(). JOB 2 (2026-07-28) moved both blocks into the locale layer, so the
// literals are gone from the component and reading the source can no longer
// prove anything about them.
//
// The obligation did not change and is if anything stronger: the SOCIAL wording
// a player actually sees must carry no prohibited term. So these now assert
// against the RESOLVED strings, which is what ships, in every one of the
// sixteen locales rather than only in the English source.

checkThat('the rules block is routed through the locale layer',
  /\$: rulesList = \[\s*\$tr\('rulesWaysPay'\)/.test(paytable))

checkThat('the interface guide is routed through the locale layer',
  /INTERFACE_GUIDE\s*=\s*INTERFACE_GUIDE_RAW\.map/.test(paytable) &&
  /name:\s*\$tr\(row\.nameKey\)/.test(paytable) &&
  /desc:\s*\$tr\(row\.descKey\)/.test(paytable))

const RULE_KEYS = ['rulesWaysPay', 'rulesSymbolValues', 'rulesWildSub', 'rulesScatterMult', 'rulesMaxWin', 'rulesMalfunction']
const GUIDE_KEYS = ['guideSpinName', 'guideSpinDesc', 'guideBetPlusName', 'guideBetPlusDesc',
  'guideBetMinusName', 'guideBetMinusDesc', 'guideFeaturesName', 'guideFeaturesDesc',
  'guideAutoplayName', 'guideAutoplayDesc', 'guideMenuName', 'guideMenuDesc',
  'guideTurboName', 'guideTurboDesc', 'guideMaxName', 'guideMaxDesc']

checkThat('the rules block still has its six lines', RULE_KEYS.length === 6)
checkThat('the interface guide still has its eight rows', GUIDE_KEYS.length === 16)

// The English social wording is the one the prohibited-term table binds, because
// social mode renders in English (testing guideline item 46). Checking the other
// fifteen would be checking a page that cannot exist.
const socialHits = [...RULE_KEYS, ...GUIDE_KEYS].flatMap((k) => {
  const v = t('en', k as never, 'social')
  return scanProhibited(v).map((pt) => `${pt} in ${k} = "${v.slice(0, 60)}"`)
})
check('the resolved social rules and guide carry no prohibited term', socialHits, [])

// The win banner must not render a bare BET literal any more.
checkThat('WinBanner no longer renders an unconditional BET',
  !/\{multLabel\}\s+BET/.test(winBanner))
// 2026-07-29, TR-117. This asserted `sv('BET', $isSocial)`, i.e. the exact call
// shape of the old implementation. That pinned the MECHANISM rather than the
// GUARANTEE, so it went red on a change that strictly improved the line: the
// unit now routes through `t()`, which consults SOCIAL_OVERRIDES first and so
// does the social swap AND the locale swap, where `sv()` did only the social
// one and left all sixteen locales reading English.
//
// The replacement is stronger in both directions. It still forbids a bare
// literal, which is the regression this guard exists for (the line once
// rendered "12x BET" unconditionally, R2R JOB 6 / TR-041). And it now checks
// BEHAVIOUR through the shipped path rather than a regex over source: the same
// key must actually produce the social word and the translated word. A future
// edit that reverted to `sv()` would pass the old regex and fail the locale
// assertion below, which is the point.
checkThat('WinBanner routes its unit label through the keyed layer, not a literal',
  /multUnitLabel\s*=\s*t\(\$locale,\s*'bet',/.test(winBanner))
checkThat('the bet key really does swap for social',
  t('en', 'bet' as never, 'social') === 'PLAY')
checkThat('the bet key really does swap for locale, which sv() could never do',
  t('de', 'bet' as never, 'real') === 'EINSATZ' && t('ar', 'bet' as never, 'real') !== 'BET')

// ── 4. Replay first paint ────────────────────────────────────────────────────
console.log('\nREPLAY FIRST PAINT derives social from the currency too')
const socialMode = readFileSync('src/lib/stores/socialMode.ts', 'utf8')
const replay = readFileSync('src/lib/components/ReplayMode.svelte', 'utf8')
checkThat('socialMode reads the URL currency at module load',
  /function readUrlCurrency/.test(socialMode) && /socialFromUrlCurrency/.test(socialMode))
checkThat('and exposes a before-mount boolean', /export const socialAtBoot/.test(socialMode))
checkThat('ReplayMode derives its first-paint mode from it, not from the flag alone',
  /initialMode: GameMode = socialAtBoot/.test(replay) &&
  !/initialMode: GameMode = search\.get\('social'\)/.test(replay))

if (failures) { console.error(`\nSOCIAL VOCABULARY: FAIL (${failures})`); process.exit(1) }
console.log('\nSOCIAL VOCABULARY: PASS')
