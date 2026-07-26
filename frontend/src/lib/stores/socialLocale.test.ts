// socialLocale.test.ts, JOB 3(d) / TR-067 (2026-07-26).
//
// Stake Engine testing guideline item 46, quoted verbatim from the dated
// mirror: "English is the only supported language in Social Mode".
//
// The load-bearing case is a SOCIAL `da` LAUNCH, and it is the case Fable named
// because it exercises both halves of the rule at once:
//
//   FORCING           social must render English whatever `lang` says.
//   UNSHIPPED LOCALE  `da` (Danish) is offered by the platform's own Language
//                     menu and is NOT one of our sixteen, recorded on TR-059
//                     from the DTT toolbar captures. So the same launch also
//                     tests the fallback for a language we do not ship.
//
// A test that only covered social `de` would prove the forcing and prove
// nothing about the fallback, and a test that only covered non-social `da`
// would prove the reverse. This covers both, plus the case that must NOT be
// broken: a real-money `de` session still renders German.
//
// Run (from frontend/): npx tsx src/lib/stores/socialLocale.test.ts

import { resolveLaunchLocale, SOCIAL_LOCALE } from './socialLocale.ts'
import { locales } from '../i18n/translations.ts'

let pass = 0
const failures: string[] = []

function eq(label: string, actual: unknown, expected: unknown): void {
  if (actual === expected) { pass++; return }
  failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
}
function ok(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass++; return }
  failures.push(`${label}${detail ? `: ${detail}` : ''}`)
}

// ── The premise, stated rather than assumed ──────────────────────────────────
eq('social mode renders English', SOCIAL_LOCALE, 'en')
ok('we ship exactly sixteen locales', Object.keys(locales).length === 16, String(Object.keys(locales).length))
ok('da is NOT one of ours, which is what makes it the right test case',
  !Object.prototype.hasOwnProperty.call(locales, 'da'))
ok('de IS one of ours, which is what makes the forcing case meaningful',
  Object.prototype.hasOwnProperty.call(locales, 'de'))

// ── THE NAMED CASE: a social da launch ───────────────────────────────────────
eq('social + da renders English', resolveLaunchLocale('da', true, locales), 'en')
eq('non-social + da falls back to English, because we do not ship it',
  resolveLaunchLocale('da', false, locales), 'en')

// ── Forcing, against languages we DO ship ────────────────────────────────────
// These are the cases that would have failed before this change: the parameter
// is valid, the locale exists, and social must override it anyway.
for (const code of Object.keys(locales)) {
  eq(`social + ${code} is forced to English`, resolveLaunchLocale(code, true, locales), 'en')
}

// ── And the behaviour that must NOT regress ──────────────────────────────────
// TR-014 exists because ?lang=ja once rendered the whole game in English. A fix
// for item 46 that broke real-money localisation would trade one defect for a
// worse one.
for (const code of Object.keys(locales)) {
  eq(`real money + ${code} still renders ${code}`, resolveLaunchLocale(code, false, locales), code)
}

// ── Malformed input is a valid launch, not an error ──────────────────────────
// The spec marks the parameter optional: "lang | No | Language code".
for (const bad of [null, undefined, '', '   ', 'xx', 'EN-GB', 'zz-ZZ', '../en', 'ja;drop', '123', 'null', 'ENGLISH']) {
  eq(`malformed lang ${JSON.stringify(bad)} falls back to English`,
    resolveLaunchLocale(bad, false, locales), 'en')
  eq(`malformed lang ${JSON.stringify(bad)} is still English when social`,
    resolveLaunchLocale(bad, true, locales), 'en')
}

// Case and whitespace are normalised, so a platform sending "DE " still gets
// German rather than silently dropping to English.
eq('uppercase is normalised', resolveLaunchLocale('DE', false, locales), 'de')
eq('surrounding whitespace is trimmed', resolveLaunchLocale('  ja  ', false, locales), 'ja')

// ── Social is checked BEFORE the parameter, and that ordering is the rule ────
// Asserted against a shipped map that contains every code, so if the
// implementation ever parsed first and forced second, one of these would show
// the parsed value instead of English.
ok('no input of any kind produces a non-English social locale',
  [...Object.keys(locales), 'da', 'xx', '', '   ', null, undefined]
    .every((v) => resolveLaunchLocale(v as string | null | undefined, true, locales) === 'en'))

console.log(`social locale assertions: ${pass} passed, ${failures.length} failed`)
if (failures.length) {
  for (const f of failures) console.error(`  - ${f}`)
  console.error('\nSOCIAL LOCALE: FAIL')
  process.exit(1)
}
console.log('SOCIAL LOCALE: PASS')
