// replayLocale.test.ts
//
// Published checklist items "English is the only supported language in Social
// Mode" and "Invalid language parameters do not break game display", for the
// REPLAY route specifically.
//
// WHY THIS EXISTS, and it is the third time this project has been caught by the
// same shape. The game route forces English in social mode at App.svelte, via
// resolveLaunchLocale, and that was proven empirically on 2026-08-05. Row 46 was
// then marked PASS. The replay route is a SEPARATE surface: App.svelte branches
// `{#if isReplay}` to ReplayMode INSTEAD of the game tree, and both
// replayService.parseReplayParams and ReplayMode's eager first-paint block read
// the `lang` parameter RAW rather than through the resolver.
//
// WHAT MADE IT LOOK CORRECT, which is the part worth keeping. A social replay
// with `lang=de` renders an ENGLISH disclaimer, so an inspection that opens the
// page and reads the visible text concludes the rule holds. It holds for that
// ONE key because `replayDisclaimer` carries an explicit social override, and
// the override text is English. Every key WITHOUT a social override falls
// through to the localised string, and the money readouts take `lang` directly:
//
//   t('de', 'hudStartReplay', 'social')  ->  'WIEDERHOLUNG STARTEN'
//   t('de', 'replayAgain',    'social')  ->  'ERNEUT ABSPIELEN'
//   formatBalance(..., 'SC', 'de')       ->  '1.234,50 SC'
//
// Those three only render AFTER a replay loads, so a browser probe with no RGS
// behind it never reaches them and reports the page as clean. The defect lives
// exactly where the cheap check cannot see.
//
// So this test asserts on the resolved LOCALE and on the rendered STRINGS,
// rather than on the page, because the page is what hid it.
//
// Run: npx tsx src/lib/services/replayLocale.test.ts

import { t, type Locale, type GameMode } from '../i18n/translations'
import { formatBalance } from '../utils/currency'

// THIS TEST DRIVES parseReplayParams, NOT resolveLaunchLocale, and the first
// draft got that wrong in a way that is worth recording. Asserting on the
// resolver proves nothing here: the resolver was never broken. The defect was
// that replayService did not CALL it. A test of the resolver passes just as
// happily on the defective code, which is convention (p)'s exact warning about
// seeding a defect in a form the gate happens to handle.
//
// parseReplayParams reads window.location.search at CALL time, so a minimal
// window stub, mutated between calls, exercises the real function.
;(globalThis as { window?: unknown }).window = { location: { search: '' } }
const win = (globalThis as unknown as { window: { location: { search: string } } }).window

const { parseReplayParams } = await import('./replayService')

/** Parse a replay launch, returning the params the route would actually use. */
function launch(qs: string) {
  win.location.search = qs
  return parseReplayParams()
}

const BASE = 'replay=true&game=future_spinner&version=10&mode=base&event=1'
  + '&rgs_url=https://example.invalid'

let failures = 0
function check(name: string, got: unknown, want: unknown): void {
  if (got === want) { console.log(`  ok   ${name}`); return }
  failures++
  console.error(`  FAIL ${name}\n       got  ${JSON.stringify(got)}\n       want ${JSON.stringify(want)}`)
}

console.log('REPLAY LOCALE: social is English only, junk degrades, real money is unaffected')

// 1. Social wins over an explicit, VALID, shipped language.
const socialFlagged = launch(`${BASE}&social=true&lang=de&currency=SC`)
check('social flag with lang=de resolves to en', socialFlagged?.lang, 'en')
check('and it is still recognised as a social session', socialFlagged?.social, true)

// 2. Social arriving via a virtual currency rather than the flag. parseReplayParams
//    computes `social` as `socialFlag || isVirtualCurrency(currency)`, so both
//    routes into social mode must land on English.
check('social via virtual currency with lang=fr resolves to en',
  launch(`${BASE}&lang=fr&currency=SC`)?.lang, 'en')

// 3. THE STRINGS, not just the locale. These are the keys with no social
//    override, which is what made the browser look clean.
const soc: GameMode = 'social'
const socialLang = (socialFlagged?.lang ?? 'xx') as Locale
check('social START REPLAY is English',
  t(socialLang, 'hudStartReplay', soc), t('en' as Locale, 'hudStartReplay', soc))
check('social REPLAY AGAIN is English',
  t(socialLang, 'replayAgain', soc), t('en' as Locale, 'replayAgain', soc))

// 4. The money format follows the same resolved locale, so a social session
//    cannot render a German decimal comma.
check('social money format is English-shaped',
  formatBalance(1234500000, 'SC', socialLang), '1,234.50 SC')

// 5. NEGATIVE CONTROL. Real money MUST still honour a valid language, or this
//    test would pass by breaking localisation everywhere.
const realDe = launch(`${BASE}&lang=de&currency=USD`)
check('real money with lang=de stays de', realDe?.lang, 'de')
const realLang = (realDe?.lang ?? 'xx') as Locale
check('real money START REPLAY is German',
  t(realLang, 'hudStartReplay', 'real' as GameMode) !== t('en' as Locale, 'hudStartReplay', 'real' as GameMode), true)

// 6. Invalid language parameters do not break the display: no raw key, no throw,
//    no bogus locale handed to Intl.
for (const junk of ['zzz', 'en-US-x-nonsense', '..%2F..%2Fetc%2Fpasswd', '123']) {
  check(`junk lang ${JSON.stringify(junk)} degrades to en`,
    launch(`${BASE}&lang=${junk}&currency=USD`)?.lang, 'en')
}
check('absent lang degrades to en', launch(`${BASE}&currency=USD`)?.lang, 'en')
check('empty lang degrades to en', launch(`${BASE}&lang=&currency=USD`)?.lang, 'en')

// 7. A junk language must not reach Intl, which would throw a RangeError and
//    take the whole readout down rather than degrading.
let threw = false
try { formatBalance(1234500000, 'USD', (launch(`${BASE}&lang=zzz&currency=USD`)?.lang ?? 'zzz') as Locale) }
catch { threw = true }
check('a junk lang cannot reach Intl and throw', threw, false)

if (failures) {
  console.error(`\nREPLAY LOCALE: FAIL (${failures})`)
  process.exit(1)
}
console.log('\nREPLAY LOCALE: PASS (social forced to English on the replay route, '
  + 'junk degraded, real money localisation intact)')
