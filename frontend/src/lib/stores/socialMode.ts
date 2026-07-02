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

// Social currency codes used by Stake social casinos.
const SOCIAL_CURRENCIES = new Set(['XGC', 'XSC', 'SC', 'GC'])

/** Read the ?social= URL flag once at module load. Accepts true or 1. */
function readUrlSocial(): boolean {
  try {
    const v = new URLSearchParams(window.location.search).get('social')
    return v === 'true' || v === '1'
  } catch {
    return false
  }
}

/** Resolved once at boot from the URL flag. */
export const socialFromUrl: boolean = readUrlSocial()

/**
 * True when the game should present social-casino language: the URL flag is
 * set, or the RGS returned a social currency code. A single boolean the whole
 * app reads.
 */
export const isSocial = derived(currencyCode, ($ccy) =>
  socialFromUrl || SOCIAL_CURRENCIES.has(($ccy || '').toUpperCase()),
)
