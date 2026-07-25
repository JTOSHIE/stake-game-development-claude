// socialMode.ts — single source of truth for social (free-to-play) mode.
//
// Social mode is resolved once at boot from the ?social=true URL parameter
// (the same flag the replay flow and the Stake Engine play-modal toggle use),
// and is also inferred when the RGS authenticate response returns a social
// currency code (Gold Coins / Sweeps Coins). When active, every gambling-framed
// label switches to its compliant social variant so the game qualifies for
// automatic stake.us publication.
//
// This store is NON-LOCKED. It reads the public currencyCode writable from
// gameStore via its exported value; it does not modify gameStore.

import { derived } from 'svelte/store'
import { currencyCode } from './gameStore'
import { jurisdictionFlags } from './jurisdiction'

// Social currency codes used by Stake social casinos.
// XEC added 2026-07-25 on the first-party Stake EU announcement: "Similar to
// Stake US, games released on Stake EU will have social set to true." The
// platform sets the social flag itself, so this is defence in depth rather than
// the primary route: a session that arrives with an XEC balance and no flag
// still gets social presentation instead of real-money vocabulary.
const SOCIAL_CURRENCIES = new Set(['XGC', 'XSC', 'SC', 'GC', 'XEC'])

/** Read the ?social= URL flag once at module load. Accepts true or 1. */
function readUrlSocial(): boolean {
  try {
    const v = new URLSearchParams(window.location.search).get('social')
    return v === 'true' || v === '1'
  } catch {
    return false
  }
}

/**
 * Read the ?currency= URL parameter once at module load.
 *
 * R2R JOB 6 / TR-041, 2026-07-25. Round-two reviewer 3: "Replay's initial mode
 * derives only from social=true, so an XSC/XEC URL can briefly render the
 * real-money disclaimer before mount." That was exactly right, and the window
 * was not theoretical: `isSocial` derived from the `currencyCode` STORE, and in
 * replay that store is not written until `ReplayMode.startReplay` runs, which
 * is after the first paint. A replay URL carrying `currency=XSC` but no
 * `social=true` therefore painted the real-money disclaimer first and switched
 * afterwards, which is the one frame a compliance screenshot would catch.
 *
 * The currency is in the URL from the very first byte, so it is read at module
 * load alongside the flag. This is the same defence-in-depth reasoning that put
 * currency inference in `isSocial` at all: the platform sets the flag, and we do
 * not rely on it alone.
 */
function readUrlCurrency(): string {
  try {
    return new URLSearchParams(window.location.search).get('currency') ?? ''
  } catch {
    return ''
  }
}

/** Resolved once at boot from the URL flag. */
export const socialFromUrl: boolean = readUrlSocial()

/** Resolved once at boot from the URL currency, before any store is written. */
export const socialFromUrlCurrency: boolean =
  SOCIAL_CURRENCIES.has(readUrlCurrency().toUpperCase())

/**
 * True at module-evaluation time, before mount and before any store write,
 * whenever the URL alone is enough to establish social mode. Components that
 * need to render social-correct text on their FIRST paint read this rather
 * than subscribing.
 */
export const socialAtBoot: boolean = socialFromUrl || socialFromUrlCurrency

/**
 * True when the game should present social-casino language. A single boolean
 * the whole app reads.
 *
 * R2R follow-up, 2026-07-26. The official contract carries a `socialCasino`
 * flag, which is the PLATFORM stating the answer directly rather than us
 * inferring it. It was derived onto the RG store with zero readers; this is the
 * reader. It joins the URL flag and the currency code rather than replacing
 * them: all three are defence in depth, and any one of them being true is
 * enough, because presenting social wording to a real-money player is a
 * cosmetic error while the reverse is a compliance breach.
 */
export const isSocial = derived(
  [currencyCode, jurisdictionFlags],
  ([$ccy, $flags]) =>
    socialAtBoot ||
    $flags.socialCasino === true ||
    SOCIAL_CURRENCIES.has(($ccy || '').toUpperCase()),
)
