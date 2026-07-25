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

// The social rules block must no longer carry "pays". Extracted by finding the
// social branch of rulesList, which is the array literal before the `: [`.
const socialRulesBlock = paytable.match(/\$: rulesList = \$isSocial\s*\?\s*\[([\s\S]*?)\]\s*:/)?.[1] ?? ''
// Only the STRING LITERALS. Comments in this block legitimately name the
// restricted words while explaining why they were removed, and failing on a
// comment would push the next author to stop explaining themselves.
const socialRuleStrings = [...socialRulesBlock.matchAll(/'([^']+)'/g)].map((m) => m[1])
checkThat('the social rules block is found in the source', socialRuleStrings.length >= 6)
const socialRuleHits = socialRuleStrings.flatMap((s) => scanProhibited(s).map((p) => `${p} in "${s.slice(0, 60)}"`))
check('the social rules carry no prohibited term', socialRuleHits, [])

// The interface guide is now mapped through sv(), so its literals may still
// contain the real-money words; what must be true is that the mapping exists.
checkThat('the interface guide is routed through sv()',
  /INTERFACE_GUIDE\s*=\s*INTERFACE_GUIDE_RAW\.map/.test(paytable) &&
  /name:\s*sv\(row\.name,\s*\$isSocial\)/.test(paytable) &&
  /desc:\s*sv\(row\.desc,\s*\$isSocial\)/.test(paytable))

// And that its rows do in fact produce compliant text when mapped.
const guideRows = [...paytable.matchAll(/name:\s*'([^']+)',\s*desc:\s*'([^']+)'/g)]
checkThat('the interface guide rows were located', guideRows.length >= 8)
for (const [, name, desc] of guideRows) {
  const hits = [...scanProhibited(sv(name, true)), ...scanProhibited(sv(desc, true))]
  check(`guide row "${name}" is compliant once socialised`, hits, [])
}

// The win banner must not render a bare BET literal any more.
checkThat('WinBanner no longer renders an unconditional BET',
  !/\{multLabel\}\s+BET/.test(winBanner))
checkThat('WinBanner routes its unit label through sv()',
  /sv\('BET',\s*\$isSocial\)/.test(winBanner))

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
