// currency_table_gate.mjs: every supported currency renders exactly what the
// platform published, at every magnitude a player can hold.
//
// Built 2026-07-29 from `reports/briefs/FS_CURRENCY_SERIAL_Prompt.md`, JOB 2,
// alongside the table it exists to hold (JOB 1).
//
// WHY THIS EXISTS
// ---------------
// Until 2026-07-29 this game derived fiat currency symbols from `Intl`. Measured
// against the platform's own published Example column, 34 of 49 supported codes
// rendered something else, and in eight of them the player was shown A DIFFERENT
// CURRENCY'S SYMBOL: a bare `$` on Canadian, Mexican, Singaporean, Taiwanese,
// Chilean, Argentine and New Zealand balances, and `¥` (Japanese yen) on Chinese
// ones. That is the CLASS A set, and it is printed first below for the reason
// that it is the only class where a player can be actively misled about what
// money they are looking at.
//
// The fix was a written table. This gate is what stops the table drifting from
// the platform, silently, the way the derived version did.
//
// THE ONE PROPERTY THAT MAKES THIS A GATE AND NOT A TEST
// -----------------------------------------------------
// It reads the PLATFORM MIRROR, not a copy of the platform's numbers kept in the
// gate. `docs/stake-engine-live/2026-07-29/rgs.md` is parsed at run time and its
// Example column is the expected value. So the gate's inputs and the
// implementation's inputs are genuinely independent, per convention (l.4): the
// implementation holds `PLATFORM_CURRENCIES`, the gate holds nothing and re-reads
// the capture. A gate that restated the same 49 rows would agree with the table
// by construction and would have proved nothing at all.
//
// THE CHECKS
// ----------
//   A  TABLE COMPLETENESS   every captured code is in the table with the same
//                           symbol, side and decimals, and the table carries no
//                           code the platform does not publish
//   B  EXAMPLE COLUMN       formatBalance at the $10 rung is byte-identical to
//                           the platform's own Example string
//   C  MAGNITUDE LADDER     every code at every rung, symbol, side, spacing and
//                           decimals, from zero to a million
//   D  Intl UNREACHABLE     no supported code constructs a currency-style
//                           Intl.NumberFormat. Proven by instrumenting the
//                           constructor, not by reading the source
//   E  CONTROLS             negative controls with a paired positive for each,
//                           so a control that could never fire is caught
//
// Run:
//   node scripts/qa/currency_table_gate.mjs             # from frontend/
//   node scripts/qa/currency_table_gate.mjs --self-test # convention (p)

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '..', '..')
const CAPTURE = join(REPO, 'docs', 'stake-engine-live', '2026-07-29', 'rgs.md')
const MODULE = join(REPO, 'frontend', 'src', 'lib', 'utils', 'currency.ts')

/**
 * The CLASS A codes, printed first.
 *
 * Class A is not "the biggest string difference", it is "the player concludes a
 * different currency". A Canadian balance reading `$10.00` is a smaller textual
 * error than `10.00 KR` versus `kr 10.00`, and a far larger one in meaning,
 * because the player believes they hold United States dollars. Sorting the proof
 * output by textual severity would have buried exactly the rows that matter.
 *
 * NZD is in this list and was not in the original finding. It had no row in the
 * 2026-07-04 capture, so `reports/qa/session4a/M04_CURRENCY_DIVERGENCE.md:51`
 * correctly excluded it as unspecified rather than divergent. The 2026-07-29
 * capture publishes `NZ$10.00`, which turns it from a scope exclusion into a
 * Class A defect.
 */
const CLASS_A = {
  CAD: 'bare $ reads as United States dollars',
  MXN: 'bare $ reads as United States dollars',
  SGD: 'bare $ reads as United States dollars',
  TWD: 'bare $ reads as United States dollars',
  CLP: 'bare $ reads as United States dollars',
  ARS: 'bare $ reads as United States dollars',
  NZD: 'bare $ reads as United States dollars',
  CNY: '¥ is the Japanese yen sign',
}

/**
 * The magnitude ladder, in micros.
 *
 * Chosen so each rung can fail differently rather than to look thorough. Zero
 * exercises the empty-balance path; 10_000 is the $0.01 minimum denomination the
 * platform asks new submissions to offer, so it is the rung a REQ-124 change
 * would move into range; 1_000_000_000 is the first rung where a grouping
 * separator appears at all, which is where a symbol placed on the wrong side
 * stops being merely wrong and starts colliding with the separator; and the
 * non-round rung catches rounding applied at the wrong decimal count.
 */
const RUNGS = [
  { micros: 0,                 label: 'zero' },
  { micros: 10_000,            label: '0.01, the platform minimum denomination' },
  { micros: 100_000,           label: '0.10, the current ladder floor' },
  { micros: 1_000_000,         label: '1' },
  { micros: 10_000_000,        label: '10, the Example column rung' },
  { micros: 1_000_000_000,     label: '1,000, first grouping separator' },
  { micros: 12_345_678_900,    label: '12,345.6789, non-round' },
  { micros: 1_000_000_000_000, label: '1,000,000' },
]

const LOCALE = 'en-US'

/**
 * Parse the platform's Supported Currencies table out of the capture.
 *
 * Deriving side and decimals from the Example string rather than trusting a
 * separate field is deliberate: the Example column is what the platform shows a
 * reviewer, and it is the authority the owner's brief names. The round trip
 * below is what makes the derivation safe, and it is checked for every row.
 */
export function parseCapture(text) {
  const rows = []
  for (const line of text.split('\n')) {
    const p = line.split('\t')
    if (p.length < 4 || !/^[A-Z]{3}$/.test(p[1])) continue
    const [, code, symbol, example] = p
    let symbolAfter, numeric
    if (example.startsWith(symbol)) { symbolAfter = false; numeric = example.slice(symbol.length) }
    else if (example.endsWith(' ' + symbol)) { symbolAfter = true; numeric = example.slice(0, -(symbol.length + 1)) }
    else throw new Error(`capture row ${code}: Example ${JSON.stringify(example)} does not carry Display ${JSON.stringify(symbol)} on either side`)
    if (!/^\d+(\.\d+)?$/.test(numeric)) throw new Error(`capture row ${code}: numeral ${JSON.stringify(numeric)} is not a plain number`)
    const decimals = numeric.includes('.') ? numeric.split('.')[1].length : 0
    // The round trip. If symbol, side and decimals cannot rebuild the platform's
    // own Example string, the parse is wrong and every expectation built on it
    // would be wrong in the same direction, which is the failure mode a gate can
    // least afford.
    const rebuilt = symbolAfter ? `${(10).toFixed(decimals)} ${symbol}` : `${symbol}${(10).toFixed(decimals)}`
    if (rebuilt !== example) throw new Error(`capture row ${code}: round trip produced ${JSON.stringify(rebuilt)} from ${JSON.stringify(example)}`)
    rows.push({ code, symbol, symbolAfter, decimals, example })
  }
  if (rows.length === 0) throw new Error('capture carries no Supported Currencies rows, which is itself the finding')

  // R056 TRANSCRIPTION FIDELITY PIN, the INVERSION of the R054 ruled override
  // that briefly lived here. The published table's XEC row says Display SC
  // ("Stake Euro Cash / XEC / SC / 10.00 SC",
  // docs/stake-engine-live/2026-07-29/rgs.md:142), the first-party
  // announcement is silent on labels, so the table governs: our label must
  // EQUAL the published row, and R054's derived EC was reversed against that
  // primary source (TR-134). This pin asserts the CAPTURED row still prints
  // the symbol the reversal was decided on. The day the platform changes
  // their page it throws as rusted and the label is re-derived against the
  // new row rather than silently outliving its source; the ordinary
  // module-vs-capture equality below then holds the shipped code to the row.
  // No row is rewritten: the capture is the truth this gate compares against.
  const FIDELITY_PINS = {
    XEC: { rule: 'R056, 2026-08-13, reversing R054', symbol: 'SC' },
  }
  for (const row of rows) {
    const pin = FIDELITY_PINS[row.code]
    if (!pin) continue
    if (row.symbol !== pin.symbol) {
      throw new Error(`FIDELITY PIN RUSTED: the capture now says ${row.code} displays ${JSON.stringify(row.symbol)}, `
        + `not ${JSON.stringify(pin.symbol)} as it did when ${pin.rule} was recorded. Re-derive the label against the new row.`)
    }
  }

  // R065, THE RULED PLACEMENT AND DECIMALS LAYER (both citations recorded, per
  // the brief's own order). The OWNER'S RULING
  // (reports/briefs/FS_FABLE_R065_CURRENCY_PLACEMENT_Prompt.md, 2026-08-14, on
  // the owner's stake.com production captures) supersedes the placement and
  // decimals of the PUBLISHED page's Example column
  // (docs/stake-engine-live/2026-07-29/rgs.md), whose trailing examples are
  // ILLUSTRATIVE from this ruling on. Self-retiring per (n): each entry below
  // asserts the captured page STILL prints the example the ruling was decided
  // against, so the day the platform updates the page this throws as rusted
  // and the classification is re-derived rather than outliving its sources.
  // The eleven code-leading rows are the ruled nine plus OMR and QAR, the
  // shipped table's other two trailing rows, absent from the ruling's
  // enumeration and completed with it because TASK 1 retires fiat trailing
  // unconditionally (surfaced per (n) in TR-143). The decimal deltas are the
  // TASK 2 uniform-two default over the page's zero-decimal examples, with
  // the ruling's own VND 10 and CLP 10 keeping zero.
  const RULED = {
    DKK: { placement: 'code-leading', symbol: 'DKK', decimals: 2, pageExample: '10.00 KR' },
    PLN: { placement: 'code-leading', symbol: 'PLN', decimals: 2, pageExample: '10.00 zł' },
    VND: { placement: 'code-leading', symbol: 'VND', decimals: 0, pageExample: '10 ₫' },
    CLP: { placement: 'code-leading', symbol: 'CLP', decimals: 0, pageExample: '10 CLP' },
    ARS: { placement: 'code-leading', symbol: 'ARS', decimals: 2, pageExample: '10.00 ARS' },
    SAR: { placement: 'code-leading', symbol: 'SAR', decimals: 2, pageExample: '10.00 SAR' },
    ILS: { placement: 'code-leading', symbol: 'ILS', decimals: 2, pageExample: '10.00 ILS' },
    AED: { placement: 'code-leading', symbol: 'AED', decimals: 2, pageExample: '10.00 AED' },
    TND: { placement: 'code-leading', symbol: 'TND', decimals: 2, pageExample: '10.00 TND' },
    OMR: { placement: 'code-leading', symbol: 'OMR', decimals: 2, pageExample: '10.00 OMR' },
    QAR: { placement: 'code-leading', symbol: 'QAR', decimals: 2, pageExample: '10.00 QAR' },
    JPY: { placement: 'prefix', decimals: 0, pageExample: '¥10' }, // ZERO per the R066 ledger read; the page agrees here
    IDR: { placement: 'prefix', decimals: 2, pageExample: 'Rp10' },
    KRW: { placement: 'prefix', decimals: 2, pageExample: '₩10' },
    KWD: { placement: 'prefix', decimals: 2, pageExample: null },
    JOD: { placement: 'prefix', decimals: 2, pageExample: null },
    BHD: { placement: 'prefix', decimals: 2, pageExample: null },
  }
  for (const row of rows) {
    const r = RULED[row.code]
    if (!r) continue
    if (r.pageExample !== null && row.example !== r.pageExample) {
      throw new Error(`R065 ILLUSTRATIVE PIN RUSTED: the page now prints ${row.code} as ${JSON.stringify(row.example)}, `
        + `not ${JSON.stringify(r.pageExample)} as when the R065 ruling was decided. Re-derive the classification.`)
    }
    if (r.symbol) row.symbol = r.symbol
    row.codeLeading = r.placement === 'code-leading'
    row.symbolAfter = false
    row.decimals = r.decimals
    // The row's Example becomes the RULED form, so every downstream class
    // (B included) holds the module to the ruling, not the page.
    row.example = row.codeLeading
      ? `${row.symbol} ${(10).toFixed(row.decimals)}`
      : `${row.symbol}${(10).toFixed(row.decimals)}`
  }
  return rows
}

/** The expected string, built from the CAPTURE alone. Never from the module. */
function expected(micros, row) {
  const n = (micros / 1_000_000).toLocaleString(LOCALE, {
    minimumFractionDigits: row.decimals,
    maximumFractionDigits: row.decimals,
  })
  if (row.codeLeading) return `${row.symbol} ${n}` // R065: CODE space AMOUNT
  return row.symbolAfter ? `${n} ${row.symbol}` : `${row.symbol}${n}`
}

/**
 * Run every check against one module. Returns failures; never throws on a
 * finding, so the self-test can drive it with deliberately broken modules.
 */
export async function runChecks(modulePath, capturePath) {
  const rows = parseCapture(readFileSync(capturePath, 'utf-8'))
  // Cache-bust, so the self-test's successive mutated copies are really
  // re-imported rather than served from the module registry.
  const mod = await import(`${pathToFileURL(modulePath).href}?v=${process.hrtime.bigint()}`)
  const { formatBalance, currencySymbolFor, PLATFORM_CURRENCIES } = mod
  const failures = []
  let checks = 0
  const fail = (cls, code, msg) => failures.push({ cls, code, msg })

  // Class A first, then the rest in captured order. This is the proof ORDERING
  // the brief asks for and it is applied to every per-code check below.
  const ordered = [
    ...rows.filter((r) => r.code in CLASS_A),
    ...rows.filter((r) => !(r.code in CLASS_A)),
  ]

  // ---- A. TABLE COMPLETENESS -------------------------------------------------
  if (!PLATFORM_CURRENCIES) {
    fail('A', '-', 'currency.ts does not export PLATFORM_CURRENCIES')
    return { failures, checks, rows: ordered }
  }
  for (const r of ordered) {
    checks++
    const t = PLATFORM_CURRENCIES[r.code]
    if (!t) { fail('A', r.code, `published by the platform, absent from PLATFORM_CURRENCIES, so it falls through to Intl`); continue }
    if (t.symbol !== r.symbol) fail('A', r.code, `symbol is ${JSON.stringify(t.symbol)}, capture says ${JSON.stringify(r.symbol)}`)
    if (Boolean(t.symbolAfter) !== r.symbolAfter) fail('A', r.code, `symbolAfter is ${Boolean(t.symbolAfter)}, capture says ${r.symbolAfter}`)
    if (t.decimals !== r.decimals) fail('A', r.code, `decimals is ${t.decimals}, capture says ${r.decimals}`)
  }
  const captured = new Set(rows.map((r) => r.code))
  for (const code of Object.keys(PLATFORM_CURRENCIES)) {
    checks++
    if (!captured.has(code)) fail('A', code, 'in PLATFORM_CURRENCIES but not in the platform capture, so it is an invention rather than a transcription')
  }

  // ---- B. EXAMPLE COLUMN, byte for byte -------------------------------------
  for (const r of ordered) {
    checks++
    const got = formatBalance(10_000_000, r.code, LOCALE)
    if (got !== r.example) fail('B', r.code, `renders ${JSON.stringify(got)}, platform Example column says ${JSON.stringify(r.example)}`)
  }

  // ---- C. MAGNITUDE LADDER ---------------------------------------------------
  for (const r of ordered) {
    for (const rung of RUNGS) {
      checks++
      const got = formatBalance(rung.micros, r.code, LOCALE)
      const want = expected(rung.micros, r)
      if (got !== want) fail('C', r.code, `at ${rung.label}: renders ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`)
    }
    checks++
    const sym = currencySymbolFor(r.code, LOCALE)
    if (sym !== r.symbol) fail('C', r.code, `currencySymbolFor returns ${JSON.stringify(sym)}, capture says ${JSON.stringify(r.symbol)}`)
  }

  // ---- D. Intl UNREACHABLE FOR ANY SUPPORTED CODE ----------------------------
  // Instrumented rather than read off the source. A comment claiming a branch is
  // unreachable is the same category of evidence as a gate that has never been
  // seen to fail.
  const realNF = Intl.NumberFormat
  const reached = []
  try {
    Intl.NumberFormat = function (locales, options) {
      if (options && options.style === 'currency') reached.push(options.currency)
      return new realNF(locales, options)
    }
    Intl.NumberFormat.prototype = realNF.prototype
    for (const r of ordered) {
      for (const rung of RUNGS) formatBalance(rung.micros, r.code, LOCALE)
      currencySymbolFor(r.code, LOCALE)
    }
  } finally {
    Intl.NumberFormat = realNF
  }
  checks++
  if (reached.length) {
    for (const code of [...new Set(reached)]) {
      fail('D', code, 'reached the Intl fallback, which no supported code may do')
    }
  }

  return { failures, checks, rows: ordered, intlReached: reached }
}

/**
 * E. CONTROLS. Each negative control is paired with a positive, because a
 * control that can never fire is indistinguishable from one that always passes,
 * and this project has shipped four of those.
 */
async function runControls(modulePath) {
  const mod = await import(`${pathToFileURL(modulePath).href}?v=${process.hrtime.bigint()}c`)
  const { formatBalance, PLATFORM_CURRENCIES, isVirtualCurrency } = mod
  const out = []
  const check = (label, ok, detail) => out.push({ label, ok, detail })

  // NEGATIVE: a code the platform does not publish must NOT be forced into the
  // table. GBP and AUD are in this game's historical supported list and in no
  // published platform row, so falling through to Intl is correct for them.
  check('GBP, unpublished by the platform, is absent from the table',
    !('GBP' in PLATFORM_CURRENCIES), `GBP in table: ${'GBP' in PLATFORM_CURRENCIES}`)
  // PAIRED POSITIVE: and it still renders something rather than nothing.
  check('GBP still renders a usable string via the Intl fallback',
    /\d/.test(formatBalance(10_000_000, 'GBP', LOCALE)), formatBalance(10_000_000, 'GBP', LOCALE))

  // NEGATIVE: the replay aliases are not platform codes and must not be required
  // in the table.
  check("'SC' and 'GC' replay aliases are not in the platform table",
    !('SC' in PLATFORM_CURRENCIES) && !('GC' in PLATFORM_CURRENCIES), 'aliases absent')
  // PAIRED POSITIVE: and they still resolve, which is the defect fixed 2026-07-25.
  check("'SC' alias still renders the symbol and never the raw code",
    formatBalance(10_000_000, 'SC', LOCALE) === '10.00 SC' && isVirtualCurrency('SC'),
    formatBalance(10_000_000, 'SC', LOCALE))

  // NEGATIVE: platform-supplied display metadata still overrides the table. The
  // TR-012c resolution is not repealed by having a table.
  check('session display metadata still overrides the table',
    formatBalance(10_000_000, 'CAD', LOCALE, { symbol: 'Z$', symbolAfter: true, decimals: 1 }) === '10.0 Z$',
    formatBalance(10_000_000, 'CAD', LOCALE, { symbol: 'Z$', symbolAfter: true, decimals: 1 }))
  // PAIRED POSITIVE: and absent metadata the table wins.
  check('absent metadata, the table wins for the same code',
    formatBalance(10_000_000, 'CAD', LOCALE) === 'CA$10.00', formatBalance(10_000_000, 'CAD', LOCALE))

  // NEGATIVE: an unknown code must not throw and must not render blank.
  check('an unknown code renders rather than throwing',
    /ZZZ/.test(formatBalance(10_000_000, 'ZZZ', LOCALE)), formatBalance(10_000_000, 'ZZZ', LOCALE))
  // PAIRED POSITIVE: a known code does not fall into that path.
  check('a known code does not render its raw code to the player',
    !/\bCAD\b/.test(formatBalance(10_000_000, 'CAD', LOCALE)), formatBalance(10_000_000, 'CAD', LOCALE))

  // NEGATIVE: case folding still works, so an RGS sending lowercase is safe.
  check('a lowercase code still resolves through the table',
    formatBalance(10_000_000, 'cad', LOCALE) === 'CA$10.00', formatBalance(10_000_000, 'cad', LOCALE))
  // PAIRED POSITIVE: and the compact form uses the table's symbol too.
  check('the compact form uses the table symbol, not Intl',
    mod.formatBalanceCompact(1_000_000_000_000, 'CAD', LOCALE).startsWith('CA$'),
    mod.formatBalanceCompact(1_000_000_000_000, 'CAD', LOCALE))

  return out
}

// ---------------------------------------------------------------------------
// THE SEEDED SELF-TEST, convention (p)
// ---------------------------------------------------------------------------
// "Plant the exact defect the gate exists to catch, in the form it really
// occurs, and prove the gate goes red." The form it really occurs in is a row in
// PLATFORM_CURRENCIES that disagrees with the platform's published table, so
// every seed below is a real edit to a real copy of the real module, imported
// through the real path. None of them calls a predicate with a hand-made array.
//
// Seed 1 is not an invented defect. `CAD: '$'` is byte-for-byte what this
// codebase actually shipped until 2026-07-29, and it is the single row that best
// represents the class: a Class A wrong-currency symbol.

const SEEDS = [
  {
    name: 'seed 1, the defect that actually shipped: CAD renders a bare $',
    from: "CAD: { symbol: 'CA$',  decimals: 2 },",
    to:   "CAD: { symbol: '$',    decimals: 2 },",
    expect: /CAD/,
  },
  {
    name: 'seed 2, symbol on the wrong side, the form the platform CurrencyMeta gets wrong',
    from: "PEN: { symbol: 'S/',   decimals: 2 },",
    to:   "PEN: { symbol: 'S/',   decimals: 2, symbolAfter: true },",
    expect: /PEN/,
  },
  {
    name: 'seed 3, wrong decimal count, the KWD three-decimal form',
    from: "KWD: { symbol: 'KD',   decimals: 2 },",
    to:   "KWD: { symbol: 'KD',   decimals: 3 },",
    expect: /KWD/,
  },
  {
    name: 'seed 4, a row deleted, so the code falls through to Intl (proves check D)',
    from: "MYR: { symbol: 'RM',   decimals: 2 }, // RM10.00",
    to:   '',
    expect: /MYR/,
  },
  {
    name: 'seed 5, a row invented that the platform does not publish',
    from: "USD: { symbol: '$',    decimals: 2 }, // $10.00",
    to:   "USD: { symbol: '$',    decimals: 2 },\n  ZWL: { symbol: 'Z$',   decimals: 2 },",
    expect: /ZWL/,
  },
  {
    name: 'seed 6, leading symbol given a space, the "RM 10.00" form that shipped',
    from: 'return meta.symbolAfter ? `${formatted} ${meta.symbol}` : `${meta.symbol}${formatted}`',
    to:   'return meta.symbolAfter ? `${formatted} ${meta.symbol}` : `${meta.symbol} ${formatted}`',
    expect: /./,
  },
  {
    // Convention (p): the exact defect R054 shipped, in the form it really
    // occurred: the VIRTUAL entry (the one that renders, shadowing the
    // platform row) relabelled EC against the published row's SC. The gate
    // must go red on XEC before its PASS over the reversal counts.
    name: 'seed 7, the R054 divergence replanted: XEC relabelled EC against the published row',
    from: "XEC: { symbol: 'SC', decimals: 2 },",
    to:   "XEC: { symbol: 'EC', decimals: 2 },",
    expect: /XEC/,
  },
  {
    // R065: a TRAILING FIAT render, the retired class restored on the
    // owner's own evidence row.
    name: 'seed 8, a fiat row rendered trailing against the R065 ruling',
    from: "PLN: { symbol: 'PLN',  decimals: 2, codeLeading: true },",
    to:   "PLN: { symbol: 'PLN',  decimals: 2, symbolAfter: true },",
    expect: /PLN/,
  },
  {
    // R065: a raw-code leak where a symbol exists: NOK's kr replaced by its
    // ISO code, the exact never-raw-code violation for a symbol-carrying row.
    name: 'seed 9, a raw code shown where the ruling gives a symbol',
    from: "NOK: { symbol: 'kr',   decimals: 2 },",
    to:   "NOK: { symbol: 'NOK',  decimals: 2 },",
    expect: /NOK/,
  },
]

async function selfTest() {
  const dir = mkdtempSync(join(tmpdir(), 'currency-table-gate-'))
  const src = readFileSync(MODULE, 'utf-8')
  let passed = 0
  const problems = []
  try {
    // PAIRED POSITIVE for the whole seeded set: the unmutated module must be
    // GREEN. Without this, six red runs prove only that the gate can say no.
    const clean = join(dir, 'clean.ts')
    writeFileSync(clean, src)
    const base = await runChecks(clean, CAPTURE)
    if (base.failures.length === 0) { passed++; console.log(`  PASS  paired positive: the unmutated module is green over ${base.checks} checks`) }
    else { problems.push(`the unmutated module is NOT green: ${base.failures.slice(0, 3).map((f) => `${f.code} ${f.msg}`).join('; ')}`) }

    for (const seed of SEEDS) {
      if (!src.includes(seed.from)) {
        problems.push(`${seed.name}: anchor not found in currency.ts, so this seed silently tested nothing`)
        continue
      }
      const p = join(dir, `seed-${SEEDS.indexOf(seed)}.ts`)
      // The replacement is a FUNCTION, not a string, and that is load-bearing.
      // A string replacement expands `$&`, `` $` ``, `$'` and `$$`, and three of
      // these seeds contain `$'` inside a currency symbol: `'CA$'` to `'$'` spans
      // the sequence `$'`, which String.replace reads as "splice in everything
      // after the match". The first run of this self-test planted two seeds that
      // duplicated the whole file into itself and went red on a SYNTAX ERROR
      // rather than on the defect, which the `expect` pattern caught. A seed that
      // goes red for the wrong reason has taught the gate nothing, which is the
      // entire argument of convention (p) turned on the self-test itself.
      writeFileSync(p, src.replace(seed.from, () => seed.to))
      let res
      try { res = await runChecks(p, CAPTURE) } catch (e) { res = { failures: [{ cls: 'X', code: '-', msg: String(e.message) }] } }
      const text = res.failures.map((f) => `${f.code} ${f.msg}`).join(' | ')
      if (res.failures.length > 0 && seed.expect.test(text)) {
        passed++
        console.log(`  PASS  ${seed.name}`)
        console.log(`          gate went red: ${text.slice(0, 110)}`)
      } else if (res.failures.length === 0) {
        problems.push(`${seed.name}: THE GATE STAYED GREEN over a planted defect`)
      } else {
        problems.push(`${seed.name}: gate went red but on the wrong thing: ${text.slice(0, 140)}`)
      }
    }

    // The fidelity pin's own red, convention (p) on the CAPTURE side this
    // time: the platform "changes" the published XEC row and parseCapture
    // must throw as RUSTED rather than let the R056 reversal outlive its
    // primary source. The mutation edits Display and Example together, the
    // form a real page edit would take.
    const capSrc = readFileSync(CAPTURE, 'utf-8')
    const PIN_ANCHOR = 'XEC\tSC\t10.00 SC'
    if (!capSrc.includes(PIN_ANCHOR)) {
      problems.push('pin seed: the XEC row anchor was not found in the capture, so this seed silently tested nothing')
    } else {
      const mutatedCapture = join(dir, 'capture-xec-changed.md')
      writeFileSync(mutatedCapture, capSrc.replace(PIN_ANCHOR, 'XEC\tEC\t10.00 EC'))
      try {
        await runChecks(clean, mutatedCapture)
        problems.push('pin seed: the FIDELITY PIN STAYED GREEN over a changed published row')
      } catch (e) {
        const msg = String(e && e.message)
        if (/FIDELITY PIN RUSTED/.test(msg)) {
          passed++
          console.log('  PASS  pin seed: a changed published XEC row rusts the fidelity pin')
          console.log(`          threw: ${msg.slice(0, 110)}`)
        } else {
          problems.push(`pin seed: threw, but on the wrong thing: ${msg.slice(0, 140)}`)
        }
      }
    }

    // Controls, run against the clean module.
    const controls = await runControls(clean)
    for (const c of controls) {
      if (c.ok) { passed++; console.log(`  PASS  control: ${c.label}`) }
      else problems.push(`control failed: ${c.label} (${c.detail})`)
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }

  console.log('')
  if (problems.length) {
    console.error(`currency table gate SELF-TEST FAILED, ${problems.length} problem(s):`)
    for (const p of problems) console.error(`  - ${p}`)
    process.exit(1)
  }
  console.log(`currency table gate self-test: ${passed} checks passed, ${SEEDS.length} module seeds and the capture pin seed all caught.`)
}

async function main() {
  if (process.argv.includes('--self-test')) return selfTest()

  const { failures, checks, rows, intlReached } = await runChecks(MODULE, CAPTURE)
  const controls = await runControls(MODULE)
  const badControls = controls.filter((c) => !c.ok)

  const classA = rows.filter((r) => r.code in CLASS_A)
  console.log(`currency table gate: ${rows.length} published codes x ${RUNGS.length} magnitude rungs, against ${CAPTURE.replace(REPO + '/', '')}`)
  console.log('')
  console.log(`CLASS A, the wrong-currency cases, ${classA.length} codes, reported first:`)
  for (const r of classA) {
    const bad = failures.filter((f) => f.code === r.code)
    console.log(`  ${bad.length ? 'FAIL' : 'ok  '}  ${r.code}  ${r.example.padEnd(12)}  ${CLASS_A[r.code]}`)
  }
  console.log('')
  console.log(`Intl fallback reached by: ${intlReached && intlReached.length ? [...new Set(intlReached)].join(', ') : 'no supported code (asserted by instrumenting the constructor)'}`)
  console.log(`controls: ${controls.length - badControls.length} of ${controls.length} passed`)

  if (failures.length === 0 && badControls.length === 0) {
    console.log('')
    console.log(`currency table gate PASS: ${checks} assertions, all ${rows.length} codes render the R065 ruled form (the page's superseded examples pinned as illustrative).`)
    return
  }
  console.error('')
  console.error(`currency table gate FAIL: ${failures.length} divergence(s), ${badControls.length} control failure(s).`)
  for (const f of failures) console.error(`  [${f.cls}] ${f.code}: ${f.msg}`)
  for (const c of badControls) console.error(`  [E] control: ${c.label} (${c.detail})`)
  process.exit(1)
}

main().catch((e) => { console.error(`currency table gate ERROR: ${e.stack || e.message}`); process.exit(1) })
