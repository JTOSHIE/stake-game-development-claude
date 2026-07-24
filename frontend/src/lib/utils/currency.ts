/**
 * currency.ts - Stake Engine currency formatters
 *
 * SINGLE SOURCE OF TRUTH for every player-facing money string in the game.
 * Nothing else may hold its own symbol table. `replayService.currencySymbol()`
 * delegates here; a second, divergent table there previously keyed sweepstakes
 * coins on 'SC' when the platform actually sends 'XSC', which leaked the raw
 * code to players in replay mode (fixed 2026-07-25, see
 * reports/qa/currency_readiness_2026-07-25.md).
 *
 * All monetary values in the Stake Engine API are integer micros
 * (1 display unit = 1,000,000 micros).
 *
 * Display is DERIVED, never hardcoded:
 *   - fiat symbols come from Intl via the currency code the platform sent, using
 *     `currencyDisplay: 'narrowSymbol'` so USD renders "$1.00" and not
 *     "US$1.00" (the B1 change, re-verified 2026-07-25 and confirmed correct:
 *     it derives from the code rather than substituting a hardcoded glyph);
 *   - virtual currency symbols come from VIRTUAL_CURRENCIES below, keyed on the
 *     platform's own codes;
 *   - the locale used for grouping and decimal marks is the platform-provided
 *     language, passed in by the caller, not the browser's own locale.
 *
 * Supported currencies:
 *   Fiat - USD CAD EUR GBP AUD NZD CHF NOK SEK DKK PLN CZK HUF RON
 *          BGN HRK RUB UAH KZT TRY ZAR NGN KES GHS EGP INR BRL MXN
 *          CLP ARS PEN COP CRC KRW CNY HKD SGD MYR THB IDR PHP VND TWD
 *   Virtual - XGC (Gold Coins -> "GC")  XSC (Sweepstakes Coins -> "SC")
 *
 * Zero-decimal currencies: JPY IDR KRW VND CLP
 */

/** 1 display unit = 1,000,000 micros */
export const CURRENCY_SCALE = 1_000_000

/**
 * Currencies displayed with zero decimal places, per the Stake Engine currency
 * reference. These are also the practical high-minimum currencies (a JPY bet
 * level is three orders of magnitude larger than a USD one).
 */
const ZERO_DECIMAL = new Set<string>(['JPY', 'IDR', 'KRW', 'VND', 'CLP'])

/**
 * Symbol placement for virtual currencies.
 *
 * RESOLVED 2026-07-26 by Fable ruling (2): TRAILING, "10.00 SC".
 *
 * Two independent first-party sources document `symbolAfter: true`: the Stake
 * Engine currency reference, and the official StakeEngine/ts-client SDK
 * (`src/helpers.ts`, `XSC: { symbol: 'SC', decimals: 2, symbolAfter: true }`).
 * The 2026-07-25 brief had specified leading placement, "SC 1,000"; Fable ruled
 * the two first-party sources outrank it and that the brief's spec was wrong.
 *
 * Kept as a single named constant rather than inlined, because it remains the
 * one flip point should the platform ever change its mind: every player-facing
 * surface follows from here.
 */
export const VIRTUAL_SYMBOL_TRAILING = true

interface VirtualCurrency {
  /** Player-facing symbol. The raw code is NEVER shown to players. */
  symbol: string
  decimals: number
}

/**
 * Virtual currencies, keyed on every code form that actually reaches this
 * module. Two forms are live in the system and BOTH must resolve:
 *
 *   - 'XSC' / 'XGC' are what the RGS authenticate response sends
 *     (gameStore.currencyCode).
 *   - 'SC' / 'GC' are what the Bet Replay flow defaults to when the replay URL
 *     carries no currency parameter, see replayService.parseReplayParams:
 *     `params.get('currency') ?? (social ? 'SC' : 'USD')`.
 *
 * Keying on only one form is precisely the bug fixed on 2026-07-25: the old
 * replay table knew 'SC' but not 'XSC', so a real sweepstakes session printed
 * the raw code to the player. socialMode.ts already treats all four as social
 * for the same reason.
 */
export const VIRTUAL_CURRENCIES: Record<string, VirtualCurrency> = {
  XGC: { symbol: 'GC', decimals: 2 },
  XSC: { symbol: 'SC', decimals: 2 },
  GC:  { symbol: 'GC', decimals: 2 },
  SC:  { symbol: 'SC', decimals: 2 },
}

/** True when the code is a platform virtual currency. */
export function isVirtualCurrency(currencyCode: string): boolean {
  return Object.prototype.hasOwnProperty.call(
    VIRTUAL_CURRENCIES,
    (currencyCode || '').toUpperCase(),
  )
}

/**
 * Resolve the player-facing symbol for a currency code, derived rather than
 * hardcoded. Returns the code itself only for genuinely unknown currencies,
 * where showing something is better than showing nothing.
 */
export function currencySymbolFor(currencyCode: string, localeTag?: string): string {
  const code = (currencyCode || '').toUpperCase()

  const virtual = VIRTUAL_CURRENCIES[code]
  if (virtual) return virtual.symbol

  try {
    const parts = new Intl.NumberFormat(localeTag, {
      style:           'currency',
      currency:        code,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0)
    const found = parts.find((p) => p.type === 'currency')
    if (found && found.value) return found.value
  } catch {
    /* fall through */
  }
  return code
}

/**
 * Format a micros amount as a human-readable currency string.
 *
 * @param micros       - Amount in micros (integer, from the RGS API)
 * @param currencyCode - the code the platform sent, e.g. "USD", "JPY", "XSC"
 * @param localeTag    - platform-provided language tag, e.g. "ja". Omit to use
 *                       the runtime default.
 *
 * @example
 *   formatBalance(1_250_000, 'USD')            // "$1.25"
 *   formatBalance(1_250_000_000, 'JPY')        // "¥1,250"
 *   formatBalance(1_000_000_000, 'XSC')        // "1,000.00 SC"
 *   formatBalance(500_000_000, 'XGC')          // "500.00 GC"
 */
export function formatBalance(
  micros: number,
  currencyCode: string,
  localeTag?: string,
): string {
  const amount = micros / CURRENCY_SCALE
  const code = (currencyCode || '').toUpperCase()

  // Virtual currencies. Grouped like fiat so large sweepstakes balances stay
  // readable ("SC 1,000.00", not "SC 1000.00"), and the code is never rendered.
  const virtual = VIRTUAL_CURRENCIES[code]
  if (virtual) {
    const formatted = amount.toLocaleString(localeTag, {
      minimumFractionDigits: virtual.decimals,
      maximumFractionDigits: virtual.decimals,
    })
    return VIRTUAL_SYMBOL_TRAILING
      ? `${formatted} ${virtual.symbol}`
      : `${virtual.symbol} ${formatted}`
  }

  // Fiat. The symbol is derived by Intl from the code, never substituted.
  const decimals = ZERO_DECIMAL.has(code) ? 0 : 2

  try {
    return new Intl.NumberFormat(localeTag, {
      style:                 'currency',
      currency:              code,
      currencyDisplay:       'narrowSymbol',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  } catch {
    // Unknown or unsupported currency code - plain fallback
    return `${code} ${amount.toFixed(decimals)}`
  }
}
