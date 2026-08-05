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
 * Display is TRANSCRIBED from the platform's published table, not derived from
 * a locale. This reversed the previous design on 2026-07-29 and the reason is
 * recorded at PLATFORM_CURRENCIES below, because the previous design was a
 * reasonable instinct that was wrong about the authority rather than wrong
 * about typography.
 *
 *   - every supported code, fiat and virtual, comes from PLATFORM_CURRENCIES,
 *     transcribed from the Supported Currencies table at
 *     `docs/stake-engine-live/2026-07-29/rgs.md:92`;
 *   - Intl remains only as a fallback for a code the platform has not published,
 *     and no supported code can reach it. `currency_table_gate.mjs` asserts that
 *     unreachability rather than leaving it as an intention;
 *   - the locale used for grouping and decimal marks is still the
 *     platform-provided language, passed in by the caller, not the browser's own
 *     locale. Grouping is the one thing the platform's Example column does not
 *     specify, since every example is a single-digit amount.
 *
 * Supported currencies: the 49 codes in PLATFORM_CURRENCIES, which is the whole
 * of the platform's published table. The 'SC' and 'GC' replay aliases resolve
 * through VIRTUAL_CURRENCIES and are not platform codes.
 *
 * Zero-decimal currencies: JPY IDR KRW VND CLP, per the published Example
 * column. Held in the table's own `decimals` field, not in a second list.
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

interface PlatformCurrency {
  /** Player-facing symbol, exactly as the platform's Display column spells it. */
  symbol: string
  /** Decimal places, read off the platform's own Example column. */
  decimals: number
  /** True renders "10.00 KR"; absent renders "CA$10.00". */
  symbolAfter?: boolean
}

/**
 * THE PLATFORM'S PUBLISHED CURRENCY TABLE, transcribed rather than derived.
 *
 * Source: the Supported Currencies table at
 * `docs/stake-engine-live/2026-07-29/rgs.md:92`, the fresh full capture. The
 * same table appears byte-identical at
 * `docs/stake-engine-live/2026-07-29/approval_guidelines_rgs_communication.md:50`.
 *
 * WHY THIS REPLACED Intl, and it is one design decision rather than 34 bugs
 * ------------------------------------------------------------------------
 * This file used to say "the symbol is derived by Intl from the code, never
 * substituted", and that was the right instinct about the wrong authority. Intl
 * renders a currency the way a LOCALE conventionally writes it. The platform's
 * table is not a locale convention: it is a display specification the platform
 * published and REQ-108 makes binding. Where the two disagree, Intl is not wrong
 * about typography and is still wrong about the requirement.
 *
 * Measured 2026-07-29 before the change: 34 of the 49 published codes rendered
 * something other than the platform's own Example column, including eight where
 * the player was shown a DIFFERENT CURRENCY'S symbol. A Canadian, Mexican,
 * Singaporean, Taiwanese, Chilean, Argentine or New Zealand balance rendered a
 * bare `$`, which reads as United States dollars, and a Chinese balance rendered
 * `¥`, which is the Japanese yen sign. Evidence:
 * `reports/qa/session4a/M04_CURRENCY_DIVERGENCE.md` and
 * `reports/qa/currency_table_2026-07-29/BEFORE.txt`.
 *
 * XGC, XSC and XEC were already correct, and that is the diagnosis rather than a
 * coincidence: they are the three rows this project had written down. Every
 * failure was a code delegated to Intl. So the fix is to write the rest down.
 *
 * THE SPACING RULE IS THE PLATFORM'S OWN, not a convention of ours. Its
 * published `DisplayBalance` reference (`rgs.md:262`) is exactly:
 *
 *     symbolAfter ? `${amount} ${symbol}` : `${symbol}${amount}`
 *
 * Leading takes no space, trailing takes exactly one. All 49 published examples
 * satisfy it with no exception, which is why the rule is encoded once in
 * `formatFromTable` rather than as a per-row spacing field.
 *
 * THE FIELDS COME FROM THE EXAMPLE COLUMN, NOT FROM THE PLATFORM'S OWN
 * CurrencyMeta, AND THE TWO DISAGREE. The same page publishes a `CurrencyMeta`
 * record at `rgs.md:205`. It does not reproduce the page's own Example column
 * for 14 codes: it marks PEN and MAD `symbolAfter: true` where the examples show
 * `S/10.00` and `MAD10.00` leading; it gives KWD, JOD, BHD, TND and OMR three
 * decimals where the examples show two; it gives ISK, UGX, XOF and XGC zero
 * decimals where the examples show `kr10.00`, `USh10.00`, `CFA10.00` and
 * `10.00 GC`; and it gives ILS the glyph `₪` where the Display and Example
 * columns both say `ILS`. The Example column is used because it is what the
 * platform's approval guidelines show a reviewer, and because the owner's brief
 * names it as the authority. The contradiction is escalated rather than resolved
 * here, per convention (l.8), as comms entry 028.
 *
 * Every row below was generated from the capture and round-tripped: symbol plus
 * side plus decimals rebuild the published Example string byte-for-byte for all
 * 49 rows. The trailing comment on each row is that Example, so a reader can
 * check a row against the platform without leaving the file.
 */
export const PLATFORM_CURRENCIES: Record<string, PlatformCurrency> = {
  USD: { symbol: '$',    decimals: 2 }, // $10.00
  CAD: { symbol: 'CA$',  decimals: 2 }, // CA$10.00
  JPY: { symbol: '¥',    decimals: 0 }, // ¥10
  EUR: { symbol: '€',    decimals: 2 }, // €10.00
  RUB: { symbol: '₽',    decimals: 2 }, // ₽10.00
  CNY: { symbol: 'CN¥',  decimals: 2 }, // CN¥10.00
  PHP: { symbol: '₱',    decimals: 2 }, // ₱10.00
  INR: { symbol: '₹',    decimals: 2 }, // ₹10.00
  IDR: { symbol: 'Rp',   decimals: 0 }, // Rp10
  KRW: { symbol: '₩',    decimals: 0 }, // ₩10
  BRL: { symbol: 'R$',   decimals: 2 }, // R$10.00
  MXN: { symbol: 'MX$',  decimals: 2 }, // MX$10.00
  DKK: { symbol: 'KR',   decimals: 2, symbolAfter: true }, // 10.00 KR
  PLN: { symbol: 'zł',   decimals: 2, symbolAfter: true }, // 10.00 zł
  VND: { symbol: '₫',    decimals: 0, symbolAfter: true }, // 10 ₫
  TRY: { symbol: '₺',    decimals: 2 }, // ₺10.00
  CLP: { symbol: 'CLP',  decimals: 0, symbolAfter: true }, // 10 CLP
  ARS: { symbol: 'ARS',  decimals: 2, symbolAfter: true }, // 10.00 ARS
  PEN: { symbol: 'S/',   decimals: 2 }, // S/10.00
  NGN: { symbol: '₦',    decimals: 2 }, // ₦10.00
  SAR: { symbol: 'SAR',  decimals: 2, symbolAfter: true }, // 10.00 SAR
  ILS: { symbol: 'ILS',  decimals: 2, symbolAfter: true }, // 10.00 ILS
  AED: { symbol: 'AED',  decimals: 2, symbolAfter: true }, // 10.00 AED
  TWD: { symbol: 'NT$',  decimals: 2 }, // NT$10.00
  NOK: { symbol: 'kr',   decimals: 2 }, // kr10.00
  KWD: { symbol: 'KD',   decimals: 2 }, // KD10.00
  JOD: { symbol: 'JD',   decimals: 2 }, // JD10.00
  CRC: { symbol: '₡',    decimals: 2 }, // ₡10.00
  TND: { symbol: 'TND',  decimals: 2, symbolAfter: true }, // 10.00 TND
  SGD: { symbol: 'SG$',  decimals: 2 }, // SG$10.00
  MYR: { symbol: 'RM',   decimals: 2 }, // RM10.00
  OMR: { symbol: 'OMR',  decimals: 2, symbolAfter: true }, // 10.00 OMR
  QAR: { symbol: 'QAR',  decimals: 2, symbolAfter: true }, // 10.00 QAR
  BHD: { symbol: 'BD',   decimals: 2 }, // BD10.00
  PKR: { symbol: '₨',    decimals: 2 }, // ₨10.00
  EGP: { symbol: 'ج.م',  decimals: 2 }, // ج.م10.00
  NZD: { symbol: 'NZ$',  decimals: 2 }, // NZ$10.00
  BOB: { symbol: 'Bs',   decimals: 2 }, // Bs10.00
  GHS: { symbol: 'GH₵',  decimals: 2 }, // GH₵10.00
  KES: { symbol: 'KSh',  decimals: 2 }, // KSh10.00
  MAD: { symbol: 'MAD',  decimals: 2 }, // MAD10.00
  BAM: { symbol: 'KM',   decimals: 2 }, // KM10.00
  ISK: { symbol: 'kr',   decimals: 2 }, // kr10.00
  TZS: { symbol: 'TSh',  decimals: 2 }, // TSh10.00
  UGX: { symbol: 'USh',  decimals: 2 }, // USh10.00
  XOF: { symbol: 'CFA',  decimals: 2 }, // CFA10.00
  XGC: { symbol: 'GC',   decimals: 2, symbolAfter: true }, // 10.00 GC
  XSC: { symbol: 'SC',   decimals: 2, symbolAfter: true }, // 10.00 SC
  XEC: { symbol: 'SC',   decimals: 2, symbolAfter: true }, // 10.00 SC
}

/**
 * Render an amount against a platform table row.
 *
 * The placement rule is the platform's own `DisplayBalance`, quoted above.
 * GROUPING IS THE ONE ADDITION, and it is deliberate: the platform's reference
 * uses `toFixed`, which renders a thousand as "1000.00". Every published Example
 * is a single-digit amount, so the table specifies nothing about grouping, and
 * ungrouped balances are a legibility regression this project already fixed once
 * ("SC 1,000.00", not "SC 1000.00"). Grouping and the decimal mark therefore
 * stay on the platform-provided locale, which is what every other money string
 * in the game already does.
 */
function formatFromTable(
  amount: number,
  meta: PlatformCurrency,
  localeTag?: string,
  numberOptions?: Intl.NumberFormatOptions,
): string {
  const formatted = amount.toLocaleString(
    localeTag,
    numberOptions ?? { minimumFractionDigits: meta.decimals, maximumFractionDigits: meta.decimals },
  )
  return meta.symbolAfter ? `${formatted} ${meta.symbol}` : `${meta.symbol}${formatted}`
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

  // The platform's published symbol, which is the binding one. Before this
  // existed, a Canadian balance's symbol resolved to a bare `$` here as well as
  // in formatBalance, so the HUD's loss-limit readout and the replay currency
  // symbol carried the same defect as the balance did.
  const platform = PLATFORM_CURRENCIES[code]
  if (platform) return platform.symbol

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
 * Does this currency render its symbol AFTER the amount?
 *
 * The companion to currencySymbolFor above, and it exists for the same reason
 * that one does. Before this, HudOverlay computed placement as
 * `isVirtualCurrency(code) && VIRTUAL_SYMBOL_TRAILING`, which is right for the
 * virtual codes and wrong for every platform code the table marks
 * `symbolAfter: true`. Fourteen of them are: DKK, PLN, VND, CLP, ARS, SAR, ILS,
 * AED and the rest. On a Danish session the balance read "10.00 KR" from
 * formatBalance while the loss-limit readout beside it read "KR10.00", so two
 * money figures on one screen disagreed about their own currency.
 *
 * The precedence deliberately mirrors currencySymbolFor's, virtual then
 * platform then default, so the symbol and its placement can never be resolved
 * from two different rules.
 */
export function currencySymbolTrailing(currencyCode: string): boolean {
  const code = (currencyCode || '').toUpperCase()

  if (VIRTUAL_CURRENCIES[code]) return VIRTUAL_SYMBOL_TRAILING

  const platform = PLATFORM_CURRENCIES[code]
  if (platform) return platform.symbolAfter === true

  // Unknown code: leading, which is what formatBalance falls back to.
  return false
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

  // The platform's published table. This is the authority for every supported
  // code and it is checked before Intl, not after.
  const platform = PLATFORM_CURRENCIES[code]
  if (platform) return formatFromTable(amount, platform, localeTag)

  // UNREACHABLE FOR ANY SUPPORTED CODE, and that is asserted rather than
  // asserted-in-a-comment: `scripts/qa/currency_table_gate.mjs` proves no code in
  // the platform's table reaches this branch, by instrumenting it. It survives
  // only for a code the platform adds between captures, where rendering
  // something beats rendering nothing.
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

  // The platform table, exactly as in formatBalance. Only the numeral part
  // differs: `decimals` is deliberately not applied, because a compact form has
  // no cents position to place them in, which is the same reason the display
  // metadata branch above skips it.
  const platform = PLATFORM_CURRENCIES[code]
  if (platform) return formatFromTable(amount, platform, localeTag, compact)

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
