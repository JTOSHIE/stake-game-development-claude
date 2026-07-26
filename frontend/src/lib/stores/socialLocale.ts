// socialLocale.ts, JOB 3(d) / TR-067 (2026-07-26).
//
// Stake Engine testing guideline item 46, quoted verbatim from the dated
// mirror: "English is the only supported language in Social Mode".
//
// That is written as a requirement on the GAME, not as a description of what
// the platform will send, so the game has to enforce it rather than assume it.
// Fable approved option (a): social sessions force the `en` locale BEFORE FIRST
// PAINT, regardless of the language parameter.
//
// WHAT WAS ACTUALLY WRONG. `i18n/tr.ts` derives from `[locale, isSocial]` and
// uses the social flag to pick the VOCABULARY VARIANT only. It never touches
// the locale. The 39-term substitution layer is correct and well tested; the
// two axes had simply never been connected, so a social session launched with
// `lang=de` rendered German chrome wearing social wording.
//
// WHY THE LOCALE STORE AND NOT tr.ts. TR-067 records the fix as "one line in
// tr.ts". That would have covered every string routed through `$tr` and left
// the `locale` store itself still reading `de`, so anything else consuming it,
// the currency formatter's locale tag among them, would disagree with the text
// beside it. Forcing the store makes every consumer agree by construction, and
// `locale` is a plain writable exported from gameStore, so this is the public
// `.set()` API and needs no lock exception.
//
// TWO LAYERS, because social arrives by two different routes at two different
// times:
//
//   BOOT      the `?social=true` flag and a social `?currency=` are in the URL
//             from the first byte, so `resolveLaunchLocale` decides before the
//             first render and there is never a German frame to photograph.
//   LATE      `socialCasino` and the currency code arrive with the authenticate
//             response, after paint. `enforceSocialEnglish` watches `isSocial`
//             and forces English if it turns true later.
//
// The forcing is deliberately ONE WAY. Social turning on forces English; social
// turning off does not restore a previous language, because there is no
// legitimate sequence in which a session stops being social, and a store that
// tried to remember and restore would be inventing a state machine for a
// transition that cannot happen.

import { get } from 'svelte/store'
import { locale } from './gameStore'
import { isSocial } from './socialMode'
import { locales, type Locale } from '../i18n/translations'

/** The one language social mode is permitted to render in. */
export const SOCIAL_LOCALE: Locale = 'en'

/**
 * The locale a launch should paint in, decided from the URL alone.
 *
 * Pure, and separated from the wiring on purpose: the rule is the part worth
 * testing, and it is testable with no browser, no dev server and no stores.
 *
 * @param rawLang - the raw `lang` URL parameter, exactly as read. May be
 *                  absent, empty, malformed or a language we do not ship.
 * @param social  - whether the URL alone already establishes social mode.
 * @param shipped - the shipped locale map, passed in rather than imported at
 *                  the call site so the validation cannot drift from what
 *                  actually ships.
 */
export function resolveLaunchLocale(
  rawLang: string | null | undefined,
  social: boolean,
  shipped: Record<string, unknown> = locales,
): Locale {
  // Social wins outright and is checked FIRST, so no amount of parameter
  // parsing can produce a non-English social session. Checking it after the
  // parameter would leave a path where a valid `lang` slipped through.
  if (social) return SOCIAL_LOCALE

  const candidate = (rawLang ?? '').toLowerCase().trim()
  if (candidate && Object.prototype.hasOwnProperty.call(shipped, candidate)) {
    return candidate as Locale
  }
  // Absent, unknown, malformed or empty all keep English. An unrecognised
  // language code is a valid launch, not an error: the spec marks `lang`
  // optional, so absence must not throw and must not render a raw key.
  return SOCIAL_LOCALE
}

/**
 * Watch for social mode arriving after boot and force English when it does.
 *
 * Returns the unsubscribe function. Never unsubscribed in the app, because the
 * requirement holds for the whole session; the return exists so a test can
 * clean up after itself.
 */
export function enforceSocialEnglish(): () => void {
  return isSocial.subscribe(($social) => {
    if ($social && get(locale) !== SOCIAL_LOCALE) locale.set(SOCIAL_LOCALE)
  })
}
