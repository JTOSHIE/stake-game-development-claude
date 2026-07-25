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
  currencySymbolFor,
  isVirtualCurrency,
} from './currency.ts'

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

console.log(`currency static assertions: ${pass} passed, ${failures.length} failed`)
if (failures.length) {
  for (const f of failures) console.error(`  - ${f}`)
  console.error('\nCURRENCY STATIC: FAIL')
  process.exit(1)
}

console.log('CURRENCY STATIC: PASS')
