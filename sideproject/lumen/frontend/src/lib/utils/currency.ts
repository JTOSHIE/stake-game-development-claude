/**
 * currency.ts — Stake Engine currency formatters
 *
 * All monetary values in the Stake Engine API are integer micros
 * (1 display unit = 1,000,000 micros). This module converts micros to
 * locale-aware display strings for all 43 supported currencies.
 *
 * Supported currencies (43):
 *   Fiat — USD CAD EUR GBP AUD NZD CHF NOK SEK DKK PLN CZK HUF RON
 *           BGN HRK RUB UAH KZT TRY ZAR NGN KES GHS EGP INR BRL MXN
 *           CLP ARS PEN COP CRC KRW CNY HKD SGD MYR THB IDR PHP VND TWD
 *   Virtual — XGC (Gold Coins → "GC")  XSC (Sweepstakes Coins → "SC")
 *
 * Zero-decimal currencies: JPY IDR KRW VND CLP
 */

/** 1 display unit = 1,000,000 micros */
export const CURRENCY_SCALE = 1_000_000

/**
 * Currencies that are displayed with zero decimal places.
 * Per Stake Engine spec: JPY, IDR, KRW, VND, CLP.
 */
const ZERO_DECIMAL = new Set<string>(['JPY', 'IDR', 'KRW', 'VND', 'CLP'])

/**
 * Format a micros amount as a human-readable currency string.
 *
 * @param micros       - Amount in micros (integer, from the RGS API)
 * @param currencyCode - ISO 4217 code (e.g. "USD", "JPY") or "XGC" / "XSC"
 * @returns            - Formatted string, e.g. "$1.25", "¥1,250", "GC 500"
 *
 * @example
 *   formatBalance(1_250_000, 'USD')  // → "$1.25"
 *   formatBalance(1_250_000_000, 'JPY')  // → "¥1,250"
 *   formatBalance(500_000_000, 'XGC')  // → "GC 500"
 *   formatBalance(10_000_000, 'XSC')  // → "SC 10.00"
 */
export function formatBalance(micros: number, currencyCode: string): string {
  const amount = micros / CURRENCY_SCALE

  // ── Virtual currencies ────────────────────────────────────────────────────
  // XGC — Gold Coins (social casino, no real-money value)
  if (currencyCode === 'XGC') {
    return `GC ${Math.round(amount).toLocaleString()}`
  }
  // XSC — Sweepstakes Coins (social casino prize currency)
  if (currencyCode === 'XSC') {
    return `SC ${amount.toFixed(2)}`
  }

  // ── Fiat currencies ───────────────────────────────────────────────────────
  const decimals = ZERO_DECIMAL.has(currencyCode) ? 0 : 2

  try {
    return new Intl.NumberFormat(undefined, {
      style:                 'currency',
      currency:              currencyCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  } catch {
    // Unknown or unsupported currency code — plain fallback
    return `${currencyCode} ${amount.toFixed(decimals)}`
  }
}
