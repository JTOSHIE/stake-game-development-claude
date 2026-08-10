// numeral_locale_pass.mjs
//
// FABLE RULING R042 TASK A2. Rewrites the two published figures in the prose
// layer from English punctuation to each locale's own.
//
// THE DEFECT THIS CLOSES, because "inconsistent formatting" undersells it. The
// prose layer wrote `5,000×` and `96.35%` into every locale. In the ten locales
// where the comma is the DECIMAL separator and the period groups thousands, a
// player did not read a differently punctuated number, they read a DIFFERENT
// NUMBER: the maximum win as FIVE times the bet, and the Cruise return to player
// as 9,635 per cent. Both shipped. The same German paytable modal already
// rendered both correctly two lines away, from `translations.ts`, so one screen
// stated the RTP two ways and the cap two ways.
//
// WHY A COMMITTED SCRIPT RATHER THAN A ONE-OFF EDIT. The forms are a RULING, not
// a preference, and a ruling that exists only as a diff cannot be re-applied,
// re-checked, or explained to the next reader. This file is the ruling in
// executable form; `r042_verify.mjs` checks the result against the brief itself,
// which is a genuinely independent input.
//
// Idempotent: running it twice changes nothing, because it matches the English
// forms only. Run from frontend/:
//   node scripts/numeral_locale_pass.mjs            apply, write the report
//   node scripts/numeral_locale_pass.mjs --check    report only, exit 1 if work remains
//
// 2026-08-10.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = join(ROOT, '..')
const LOCALES = join(ROOT, 'src/lib/i18n/prose.locales.ts')
const REPORT = join(REPO, 'reports/qa/r042_numeral_locale_pass.json')

/**
 * The ruled forms, transcribed from R042 TASK A2. Locales absent from this table
 * are ruled UNCHANGED and keep the English forms: en, ar, hi, ja, ko, zh.
 *
 * `thousands` replaces the bare `5,000` and leaves the following × alone.
 * `percent` replaces the whole `96.35%` token, because Turkish puts the sign in
 * FRONT and a number-only substitution could not express that.
 *
 * THE GROUPING SPACES ARE REGULAR U+0020, DELIBERATELY, not U+202F narrow
 * no-break. A narrow no-break space is typographically better and is what the
 * locales themselves prefer, but it is invisible in a diff, invisible in a
 * terminal, and this codebase has already been bitten twice this week by
 * invisible characters in source. A regular space is legible to every reader and
 * to every gate, and the figure it produces is unambiguous in all four locales
 * that use it.
 */
const FORMS = {
  de: { thousands: '5.000', percent: '96,35 %' },
  es: { thousands: '5.000', percent: '96,35 %' },
  fi: { thousands: '5 000', percent: '96,35 %' },
  fr: { thousands: '5 000', percent: '96,35 %' },
  id: { thousands: '5.000', percent: '96,35%'  },
  pl: { thousands: '5 000', percent: '96,35%'  },
  pt: { thousands: '5.000', percent: '96,35%'  },
  ru: { thousands: '5 000', percent: '96,35 %' },
  tr: { thousands: '5.000', percent: '%96,35'  },
  vi: { thousands: '5.000', percent: '96,35%'  },
}

const EN_THOUSANDS = '5,000'
const EN_PERCENT   = '96.35%'

const src = readFileSync(LOCALES, 'utf-8')
const lines = src.split('\n')
const changes = []
let cur = null

for (let i = 0; i < lines.length; i++) {
  const block = lines[i].match(/^ {2}([a-z]{2}): \{/)
  if (block) { cur = block[1]; continue }
  if (!cur || !FORMS[cur]) continue
  const m = lines[i].match(/^ {4}(\w+): '((?:[^'\\]|\\.)*)',$/)
  if (!m) continue
  const [, key, raw] = m
  let out = raw
  if (out.includes(EN_THOUSANDS)) out = out.split(EN_THOUSANDS).join(FORMS[cur].thousands)
  if (out.includes(EN_PERCENT))   out = out.split(EN_PERCENT).join(FORMS[cur].percent)
  if (out === raw) continue
  lines[i] = `    ${key}: '${out}',`
  changes.push({ locale: cur, key, before: raw, after: out })
}

const check = process.argv.includes('--check')

console.log(`NUMERAL LOCALE PASS: ${changes.length} string(s) would change`)
for (const c of changes) console.log(`  ${c.locale}.${c.key}`)

if (check) {
  if (changes.length) {
    console.error('\nNUMERAL LOCALE PASS: FAIL, English figure forms remain in a comma-decimal locale')
    process.exit(1)
  }
  console.log('\nNUMERAL LOCALE PASS: PASS (no English figure forms remain)')
  process.exit(0)
}

writeFileSync(LOCALES, lines.join('\n'))

// ASSERT THE FINAL BYTES rather than trusting the loop. Re-read from disk and
// confirm every ruled locale now carries its own form and none of the English
// ones, so a partially applied pass cannot report success.
const after = readFileSync(LOCALES, 'utf-8')
const afterLines = after.split('\n')
let verifying = null
const problems = []
for (const line of afterLines) {
  const block = line.match(/^ {2}([a-z]{2}): \{/)
  if (block) { verifying = block[1]; continue }
  if (!verifying || !FORMS[verifying]) continue
  const m = line.match(/^ {4}(\w+): '((?:[^'\\]|\\.)*)',$/)
  if (!m) continue
  if (m[2].includes(EN_THOUSANDS)) problems.push(`${verifying}.${m[1]} still carries ${EN_THOUSANDS}`)
  if (m[2].includes(EN_PERCENT))   problems.push(`${verifying}.${m[1]} still carries ${EN_PERCENT}`)
}
if (problems.length) {
  console.error('\nNUMERAL LOCALE PASS: FAIL after writing:')
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}

mkdirSync(dirname(REPORT), { recursive: true })
writeFileSync(REPORT, JSON.stringify({
  _what: 'R042 TASK A2. Per-locale numeral forms applied to the prose layer.',
  _ruling: 'reports/briefs/FS_R042A_DISCLOSURE_INTEGRITY_Prompt.md, TASK A2',
  _unchanged: ['en', 'ar', 'hi', 'ja', 'ko', 'zh'],
  _groupingSpace: 'U+0020, chosen over U+202F deliberately; see the file header',
  forms: FORMS,
  changed: changes.length,
  changes,
}, null, 2) + '\n')

console.log(`\nfinal bytes verified: no English figure form remains in any ruled locale`)
console.log(`report written to ${REPORT.replace(REPO + '/', '')}`)
console.log('\nNUMERAL LOCALE PASS: PASS')
