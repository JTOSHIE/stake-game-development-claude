// currency.test.ts - static currency-conformance assertions for CI.
//
// The full currency harness (scripts/currency_conformance.mjs) drives a real
// browser through Playwright and stays local, per Fable ruling 11: CI runs cheap
// static gates only. This file is the static subset: it imports the formatter
// directly and asserts its contract with no browser, no dev server and no
// network.
//
// It covers the two things that would be most damaging to get wrong and are
// fully checkable without rendering:
//   - the raw platform currency code is NEVER the player-facing string
//     (the 2026-07-25 defect: replay rendered "XSC 1.00" at the player);
//   - symbol placement, decimals and grouping per Fable ruling 2 (TRAILING).
//
// Run (from frontend/): npx tsx src/lib/utils/currency.test.ts

import {
  CURRENCY_SCALE,
  VIRTUAL_SYMBOL_TRAILING,
  formatBalance,
  formatBalanceCompact,
  currencySymbolFor,
  currencySymbolTrailing,
  isVirtualCurrency,
  type CurrencyDisplay,
} from './currency.ts'
import { scanProhibited } from '../i18n/vocabulary.ts'

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

const S = CURRENCY_SCALE
eq('CURRENCY_SCALE is the RGS wallet scale', S, 1_000_000)

// ── Fable ruling 2: TRAILING placement ────────────────────────────────────────
eq('placement constant is trailing', VIRTUAL_SYMBOL_TRAILING, true)
eq('XSC formats trailing with grouping', formatBalance(1000 * S, 'XSC', 'en'), '1,000.00 SC')
eq('XGC formats trailing with grouping', formatBalance(500 * S, 'XGC', 'en'), '500.00 GC')

// ── Both live code forms resolve identically ──────────────────────────────────
// XSC/XGC come from the RGS authenticate response; SC/GC are what
// replayService.parseReplayParams defaults to when a replay URL omits currency.
eq('SC alias matches XSC', formatBalance(1000 * S, 'SC', 'en'), formatBalance(1000 * S, 'XSC', 'en'))
eq('GC alias matches XGC', formatBalance(500 * S, 'GC', 'en'), formatBalance(500 * S, 'XGC', 'en'))

// ── The rule that matters most: the code is never shown ───────────────────────
for (const code of ['XSC', 'XGC', 'SC', 'GC']) {
  const rendered = formatBalance(1234 * S, code, 'en')
  ok(`${code}: raw code absent from rendered string`,
    !new RegExp(`\\b${code}\\b`).test(rendered) || code === 'SC' || code === 'GC',
    rendered)
  ok(`${code}: resolves to a symbol, not the code`,
    ['SC', 'GC'].includes(currencySymbolFor(code, 'en')),
    currencySymbolFor(code, 'en'))
  ok(`${code}: recognised as virtual`, isVirtualCurrency(code))
}
// The X-prefixed platform codes specifically must never appear.
for (const code of ['XSC', 'XGC']) {
  ok(`${code}: X-prefixed platform code never rendered`,
    !formatBalance(1234 * S, code, 'en').includes(code),
    formatBalance(1234 * S, code, 'en'))
}

// ── Fiat: symbol derived from the code, no US$ prefix (the B1 change) ─────────
eq('USD uses the narrow symbol', formatBalance(1.25 * S, 'USD', 'en'), '$1.25')
ok('USD carries no US prefix', !formatBalance(1.25 * S, 'USD', 'en').includes('US'))
eq('USD symbol resolves to $', currencySymbolFor('USD', 'en'), '$')
ok('USD is not virtual', !isVirtualCurrency('USD'))

// ── Zero-decimal / high-minimum currencies ────────────────────────────────────
eq('JPY is zero-decimal', formatBalance(1250 * S, 'JPY', 'en'), '¥1,250')
for (const code of ['JPY', 'IDR', 'KRW', 'VND', 'CLP']) {
  ok(`${code}: no decimal point`, !/\.\d/.test(formatBalance(1250 * S, code, 'en')),
    formatBalance(1250 * S, code, 'en'))
}

// ── Unknown codes degrade safely rather than throwing ─────────────────────────
ok('unknown code does not throw', (() => {
  try { formatBalance(S, 'ZZZ', 'en'); return true } catch { return false }
})())

// ── XEC, Stake EU (2026-07-25 first-party announcement) ─────────────────────
// The platform's instruction is "Just like Stake US", so every assertion here
// is that XEC behaves EXACTLY as XSC does. Asserting equality against XSC
// rather than against hardcoded expectations means the pair cannot drift: if
// the SC presentation is ever changed for one, this fails until it changes for
// both.
eq('XEC is recognised as a virtual currency', isVirtualCurrency('XEC'), true)
eq('XEC never shows the raw code to a player', currencySymbolFor('XEC'), 'SC')
eq('XEC symbol matches XSC exactly', currencySymbolFor('XEC'), currencySymbolFor('XSC'))
eq('XEC formats identically to XSC', formatBalance(1_000_000_000, 'XEC'), formatBalance(1_000_000_000, 'XSC'))
eq('XEC formats identically to XSC at zero', formatBalance(0, 'XEC'), formatBalance(0, 'XSC'))
eq('XEC formats identically to XSC on a fractional amount', formatBalance(1_234_560, 'XEC'), formatBalance(1_234_560, 'XSC'))
eq('XEC is case-insensitive on the code', currencySymbolFor('xec'), 'SC')
eq('the raw code XEC never appears in a formatted balance', formatBalance(1_000_000_000, 'XEC').includes('XEC'), false)

// ── TR-012c: placement comes from the payload, not from us ──────────────────
// Fable dissolved the leading-vs-trailing dispute by taking the announcement's
// own instruction literally: "use the provided display information". These
// assert BOTH placements render correctly from fixture payloads, which is the
// point - the game must be correct whichever the platform sends, so neither
// side of the original argument needs to have been right.

const LEADING: CurrencyDisplay  = { symbol: 'SC', symbolAfter: false, decimals: 2 }
const TRAILING: CurrencyDisplay = { symbol: 'SC', symbolAfter: true,  decimals: 2 }

eq('payload leading renders "SC 1,000.00"',  formatBalance(1000 * S, 'XEC', 'en', LEADING),  'SC 1,000.00')
eq('payload trailing renders "1,000.00 SC"', formatBalance(1000 * S, 'XEC', 'en', TRAILING), '1,000.00 SC')
eq('the same payload governs XSC identically', formatBalance(1000 * S, 'XSC', 'en', LEADING), 'SC 1,000.00')
eq('placement is honoured for fiat too', formatBalance(1000 * S, 'USD', 'en', { symbol: '$', symbolAfter: true, decimals: 2 }), '1,000.00 $')

// Partial payloads degrade field by field rather than being discarded whole.
eq('symbol alone, placement falls back to trailing', formatBalance(1000 * S, 'XEC', 'en', { symbol: 'SC' }), '1,000.00 SC')
eq('decimals alone are honoured', formatBalance(1000 * S, 'XEC', 'en', { decimals: 0 }), '1,000 SC')
eq('symbolAfter false alone flips placement', formatBalance(1000 * S, 'XEC', 'en', { symbolAfter: false }), 'SC 1,000.00')

// Absent metadata must leave existing behaviour untouched, which is what makes
// this change safe to ship before the DTT confirms which placement is live.
eq('no metadata is identical to the old two-arg call', formatBalance(1000 * S, 'XEC', 'en', null), formatBalance(1000 * S, 'XEC', 'en'))
eq('an empty metadata object changes nothing', formatBalance(1000 * S, 'XEC', 'en', {}), formatBalance(1000 * S, 'XEC', 'en'))
eq('the raw code still never reaches a player under metadata', formatBalance(1000 * S, 'XEC', 'en', LEADING).includes('XEC'), false)

// ── The abbreviated form, TR-066 / Fable's ruling of 2026-07-26 ───────────────
//
// "up to four significant characters plus magnitude suffix, $52.43M form".
// These assert the CONTRACT of the formatter. Where it is allowed to be used is
// a separate question, decided by measurement in actions/fitMoney.ts and proved
// by scripts/mini_player_proof.mjs, because it is a geometric question and not
// a formatting one.

eq('the ruled example renders exactly as ruled',
  formatBalanceCompact(52_431_098_760_000, 'USD', 'en'), '$52.43M')
eq('four significant digits, not two',
  formatBalanceCompact(1_234_567_890 * S, 'USD', 'en'), '$1.234B')
eq('the owner-captured balance abbreviates as $1.04K',
  formatBalanceCompact(1_040_060_000, 'USD', 'en'), '$1.04K')
eq('small values keep their own magnitude and gain no suffix',
  formatBalanceCompact(100 * S, 'USD', 'en'), '$100')
eq('zero is zero', formatBalanceCompact(0, 'USD', 'en'), '$0')

// TRUNCATION, NOT ROUNDING, and this is the money assertion in this block.
// Rounding to nearest renders $999,999.99 as "$1M", which tells a player they
// hold more than they do. A money readout may understate under abbreviation; it
// may never overstate.
eq('a balance one cent under a million never reads as a million',
  formatBalanceCompact(999_999_99 * 10_000, 'USD', 'en'), '$999.9K')
ok('the abbreviated value never exceeds the true value',
  [999_999_99 * 10_000, 52_431_098_760_000, 1_040_060_000, 9_999_999_999_999].every((micros) => {
    const shown = formatBalanceCompact(micros, 'USD', 'en')
    const suffix = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 }[shown.slice(-1)] ?? 1
    const numeral = parseFloat(shown.replace(/[^0-9.]/g, '')) * suffix
    return numeral <= micros / S + 1e-6
  }))

// The raw platform code must never reach a player here either. This is the same
// requirement the full formatter carries, restated because a second formatter
// is a second chance to leak it, which is exactly how the 2026-07-25 replay
// defect happened.
// The X-prefixed forms are what the RGS actually sends, so they are the ones
// that can leak. SC and GC are the player-facing SYMBOLS and are supposed to
// appear, which is why they are checked from the other direction below.
for (const code of ['XSC', 'XGC', 'XEC']) {
  const rendered = formatBalanceCompact(52_431_098_760_000, code, 'en')
  ok(`compact never prints the raw code ${code}`, !rendered.includes(code), rendered)
}
for (const [code, symbol] of [['XSC', 'SC'], ['XGC', 'GC'], ['XEC', 'SC']] as const) {
  ok(`compact renders the ${code} symbol ${symbol}`,
    formatBalanceCompact(52_431_098_760_000, code, 'en').includes(symbol))
}
eq('XSC abbreviates trailing, like its full form',
  formatBalanceCompact(52_431_098_760_000, 'XSC', 'en'), '52.43M SC')
eq('XEC is byte-identical to XSC in compact form too',
  formatBalanceCompact(52_431_098_760_000, 'XEC', 'en'),
  formatBalanceCompact(52_431_098_760_000, 'XSC', 'en'))
eq('platform display metadata governs the compact form as well',
  formatBalanceCompact(52_431_098_760_000, 'XEC', 'en', { symbol: 'SC', symbolAfter: false }), 'SC 52.43M')

// The magnitude word is the LOCALE'S own, which is the whole reason this uses
// Intl compact notation rather than a hand-written K/M/B table: a table would
// have been English in a game that ships sixteen locales.
ok('a non-English locale gets its own magnitude word, not "M"',
  formatBalanceCompact(52_431_098_760_000, 'USD', 'de').includes('Mio'),
  formatBalanceCompact(52_431_098_760_000, 'USD', 'de'))

// And it must survive the social vocabulary layer. A magnitude word that
// happened to be a prohibited term would ship a jurisdiction breach through a
// formatter nobody thought to scan.
for (const loc of ['en', 'de', 'es', 'fr', 'pt', 'pl', 'ru', 'tr', 'id', 'vi', 'fi', 'hi', 'ar', 'ja', 'ko', 'zh']) {
  const text = formatBalanceCompact(52_431_098_760_000, 'XSC', loc)
  ok(`compact form carries no prohibited term in ${loc}`,
    scanProhibited(text, { includeNeverRewrite: true }).length === 0,
    `${text} -> ${scanProhibited(text, { includeNeverRewrite: true }).join(', ')}`)
}

// ── currencySymbolTrailing, S2-C013 ──────────────────────────────────────────
//
// THE DEFECT THIS PINS, stated so the test cannot be weakened without noticing.
// HudOverlay computed the loss-limit readout's symbol placement as
// `isVirtualCurrency(code) && VIRTUAL_SYMBOL_TRAILING`. That is correct for the
// virtual codes and WRONG for every platform code the published table marks
// `symbolAfter: true`. On a Danish session formatBalance rendered the balance
// "10.00 KR" while the loss limit beside it rendered "KR10.00": two money
// figures on one screen disagreeing about their own currency.
//
// The old expression is written out below as the CONTROL, so this test fails if
// anyone repoints the consumer back at it.
for (const code of ['DKK', 'PLN', 'VND', 'CLP', 'ARS', 'SAR', 'ILS', 'AED']) {
  ok(`${code} trails its symbol, per the platform table`,
    currencySymbolTrailing(code) === true,
    `currencySymbolTrailing(${code}) returned ${currencySymbolTrailing(code)}`)
  ok(`CONTROL: the OLD expression gets ${code} wrong, which is why the accessor exists`,
    (isVirtualCurrency(code) && VIRTUAL_SYMBOL_TRAILING) === false)
}

for (const code of ['USD', 'EUR', 'GBP', 'CAD', 'JPY']) {
  ok(`${code} leads its symbol`, currencySymbolTrailing(code) === false)
}

for (const code of ['XSC', 'XGC', 'XEC']) {
  ok(`virtual ${code} still trails, so the accessor did not regress the case that worked`,
    currencySymbolTrailing(code) === VIRTUAL_SYMBOL_TRAILING)
}

ok('an unknown code leads, matching formatBalance fallback',
  currencySymbolTrailing('ZZZ') === false)
ok('an empty code does not throw and leads',
  currencySymbolTrailing('') === false)

// Placement and symbol must come from ONE rule, so the two accessors agree on
// every platform code rather than being independently maintained.
for (const code of ['DKK', 'USD', 'XSC', 'VND']) {
  const rendered = formatBalance(10 * S, code)
  const sym = currencySymbolFor(code)
  ok(`${code}: formatBalance agrees with currencySymbolTrailing on placement`,
    currencySymbolTrailing(code) ? rendered.trimEnd().endsWith(sym) : rendered.startsWith(sym),
    `rendered "${rendered}", symbol "${sym}", trailing ${currencySymbolTrailing(code)}`)
}

console.log(`currency static assertions: ${pass} passed, ${failures.length} failed`)
if (failures.length) {
  for (const f of failures) console.error(`  - ${f}`)
  console.error('\nCURRENCY STATIC: FAIL')
  process.exit(1)
}

console.log('CURRENCY STATIC: PASS')
