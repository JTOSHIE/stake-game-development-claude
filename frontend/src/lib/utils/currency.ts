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
 *             XEC (Stake EU sweepstakes -> "SC")
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

/**
 * Currency display metadata as the platform supplies it.
 *
 * Fable ruling on TR-012c (2026-07-25b) dissolved the leading-vs-trailing
 * dispute rather than picking a side: the Stake EU announcement's own words are
 * the instruction, "Your game should use the provided display information
 * rather than showing the raw currency code to players." So placement is not a
 * constant we choose, it is a value the session hands us.
 *
 * The field names follow the documented currency reference exactly
 * (`symbol`, `symbolAfter`, `decimals`) rather than a shape of our own
 * invention. `symbolAfter: true` means trailing, "1,000.00 SC".
 *
 * Every field is optional and each falls back independently, so a partial
 * payload degrades field by field instead of being discarded whole.
 */
export interface CurrencyDisplay {
  symbol?: string
  symbolAfter?: boolean
  decimals?: number
}

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
  // Stake EU, confirmed by first-party platform announcement 2026-07-25 and
  // quoted verbatim in reports/briefs/FS_PlatformDiscordDump_2026-07-25.md:
  //   "Internally, the currency code used is XEC. However, players will not see
  //    XEC in-game. Just like Stake US, the currency will be displayed using the
  //    SC format"
  // "Just like Stake US" is the operative instruction, so XEC is defined to be
  // byte-identical to XSC rather than given its own formatting rules. If the
  // SC presentation ever changes it must change for both, and defining them
  // separately is how they would drift apart.
  //
  // This supersedes the HOLD on TR-012b. The hold was correct while three
  // first-party sources had no trace of the code; a first-party source now
  // exists, so the position changes with the evidence rather than despite it.
  XEC: { symbol: 'SC', decimals: 2 },
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
  display?: CurrencyDisplay | null,
): string {
  const amount = micros / CURRENCY_SCALE
  const code = (currencyCode || '').toUpperCase()

  // Platform-provided display information wins over anything we hold locally,
  // for ANY code including fiat. This is the TR-012c resolution: we render what
  // the session tells us to render. Absent metadata, every field falls back to
  // the behaviour below, which is unchanged.
  if (display && (display.symbol || display.symbolAfter !== undefined || display.decimals !== undefined)) {
    const local = VIRTUAL_CURRENCIES[code]
    const symbol = display.symbol ?? local?.symbol ?? currencySymbolFor(code, localeTag)
    const decimals = display.decimals ?? local?.decimals ?? (ZERO_DECIMAL.has(code) ? 0 : 2)
    const trailing = display.symbolAfter ?? (local ? VIRTUAL_SYMBOL_TRAILING : false)
    const formatted = amount.toLocaleString(localeTag, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    return trailing ? `${formatted} ${symbol}` : `${symbol} ${formatted}`
  }

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

/**
 * Significant digits kept by an abbreviated money value.
 *
 * Fable's ruling closing TR-066 (2026-07-26) states the form exactly: "up to
 * four significant characters plus magnitude suffix, $52.43M form".
 */
export const COMPACT_SIGNIFICANT_DIGITS = 4

/**
 * Truncate toward zero at `digits` significant figures.
 *
 * TRUNCATION, not rounding, and this is a money rule rather than a style
 * preference. Rounding to nearest renders a balance of $999,999.99 as "$1M",
 * telling a player they hold more than they do. Truncating renders "$999.9K",
 * which can only ever understate. The exact figure is never lost: it is
 * rendered in full on every other layout profile and in the session panel, and
 * the abbreviation only ever appears where the full string physically cannot.
 *
 * The error is at most one unit in the last significant digit and is always
 * downward, including in the binary-floating-point edge cases, because the
 * only operation applied is `Math.floor`.
 */
function truncateToSignificant(amount: number, digits: number): number {
  if (!Number.isFinite(amount) || amount === 0) return amount
  const sign = amount < 0 ? -1 : 1
  const abs = Math.abs(amount)
  const magnitude = Math.floor(Math.log10(abs))
  const factor = Math.pow(10, digits - 1 - magnitude)
  return (sign * Math.floor(abs * factor)) / factor
}

/**
 * Format a micros amount as an ABBREVIATED currency string, e.g. "$52.43M".
 *
 * WHERE THIS IS ALLOWED, and it is one place only. Fable's ruling closing
 * TR-066: the 400x225 mini-player profile alone, for BALANCE and WIN alone,
 * and only when the fully formatted value cannot fit its MEASURED slot at the
 * legible floor. Values that fit render in full. Every other profile keeps
 * full precision everywhere. The decision is made by `actions/fitMoney.ts`
 * from a real measurement, never from a magnitude threshold, because a
 * threshold guesses at a width that depends on the currency, the locale and
 * the font that actually loaded.
 *
 * WHY Intl COMPACT NOTATION RATHER THAN A SUFFIX TABLE OF OUR OWN. A hand
 * written K/M/B table is English, and this game ships in sixteen locales. Intl
 * carries the platform locale's own magnitude words, so `de` renders
 * "52,43 Mio. $" and `ja` renders "$5243万" without a single translated string
 * being authored, and it takes the same `localeTag` parameter `formatBalance`
 * already takes, so the two forms cannot drift onto different locales.
 *
 * @example
 *   formatBalanceCompact(52_431_098_760_000, 'USD')  // "$52.43M"
 *   formatBalanceCompact(1_040_060_000, 'USD')       // "$1.04K"
 *   formatBalanceCompact(52_431_098_760_000, 'XSC')  // "52.43M SC"
 */
export function formatBalanceCompact(
  micros: number,
  currencyCode: string,
  localeTag?: string,
  display?: CurrencyDisplay | null,
): string {
  const amount = truncateToSignificant(micros / CURRENCY_SCALE, COMPACT_SIGNIFICANT_DIGITS)
  const code = (currencyCode || '').toUpperCase()

  const compact = {
    notation:                 'compact',
    compactDisplay:           'short',
    maximumSignificantDigits: COMPACT_SIGNIFICANT_DIGITS,
  } as const

  // Platform-supplied display metadata wins, exactly as it does in
  // formatBalance: the TR-012c resolution applies unchanged and only the
  // numeral part differs. `decimals` is deliberately NOT applied, because a
  // compact form has no cents position to place them in.
  if (display && (display.symbol || display.symbolAfter !== undefined || display.decimals !== undefined)) {
    const local = VIRTUAL_CURRENCIES[code]
    const symbol = display.symbol ?? local?.symbol ?? currencySymbolFor(code, localeTag)
    const trailing = display.symbolAfter ?? (local ? VIRTUAL_SYMBOL_TRAILING : false)
    const formatted = amount.toLocaleString(localeTag, compact)
    return trailing ? `${formatted} ${symbol}` : `${symbol} ${formatted}`
  }

  const virtual = VIRTUAL_CURRENCIES[code]
  if (virtual) {
    const formatted = amount.toLocaleString(localeTag, compact)
    return VIRTUAL_SYMBOL_TRAILING
      ? `${formatted} ${virtual.symbol}`
      : `${virtual.symbol} ${formatted}`
  }

  try {
    return new Intl.NumberFormat(localeTag, {
      style:           'currency',
      currency:        code,
      currencyDisplay: 'narrowSymbol',
      ...compact,
    }).format(amount)
  } catch {
    return `${code} ${amount.toLocaleString(localeTag, compact)}`
  }
}
