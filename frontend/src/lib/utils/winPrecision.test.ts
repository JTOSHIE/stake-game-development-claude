// winPrecision.test.ts
//
// Published item: "Game displays sub-cent payouts correctly".
//
// THE REQUIREMENT, quoted from the platform's rgs.md:295: "If the game has a
// minimum win of >= 0.1x, three points of precision are required: 0.1x * $0.01 =
// $0.001, while games with minimum wins <0.1x will require 4 points of
// precision." And rgs.md:297 makes it a requirement rather than a preference:
// "it is only a requirement that wins in-game show exact win amounts."
//
// Our smallest paying combination is L3 three-of-a-kind on one way, 0.08x, which
// is under 0.1x, so four points is our band. The owner confirmed the platform
// minimum bet goes as low as 1 cent, which is what makes this ordinary rather
// than exotic: at a 1 cent bet that combination pays $0.0008 and rendered
// "$0.00". The wallet moved and the screen said nothing had.
//
// WHAT THIS TEST IS REALLY GUARDING, beyond the digit count:
//
//   1. ORDINARY WINS MUST NOT CHANGE. "Always four decimals" would render every
//      normal win as "$12.3400". That trades a rare defect for a constant one,
//      so the digit count is keyed on the VALUE and ordinary amounts are pinned
//      here as negative controls.
//   2. THE TRAILING SYMBOL MUST SURVIVE. Fourteen platform codes render the
//      symbol AFTER the amount, and S2-C013 was exactly a defect where one money
//      readout disagreed with another about placement. A formatter that widened
//      precision by rebuilding the display metadata would recreate it.
//   3. THE COUNT-UP MUST NOT FLICKER. Three win readouts render an EASED FLOAT.
//      Deciding the digit count from each frame makes the readout grow and
//      shrink digits continuously while counting, which is why the digit count
//      is computed once from the settled win and passed in.
//
// Run: npx tsx src/lib/utils/winPrecision.test.ts

import { readFileSync, readdirSync } from 'node:fs'
import {
  formatBalance, formatWin, winFractionDigits, CURRENCY_SCALE,
} from './currency.ts'

let failures = 0
const check = (name: string, got: unknown, want: unknown): void => {
  if (got === want) { console.log(`  ok   ${name}`); return }
  failures++
  console.error(`  FAIL ${name}\n       got  ${JSON.stringify(got)}\n       want ${JSON.stringify(want)}`)
}
const micros = (v: number) => Math.round(v * CURRENCY_SCALE)

console.log('WIN PRECISION: sub-cent wins show what the wallet actually moved')

// 1. THE DEFECT. Smallest win at the platform's lowest bets.
check('1c bet, 0.08x win, was "$0.00"', formatWin(micros(0.0008), 'USD', 'en-US'), '$0.0008')
check('10c bet, 0.08x win, was "$0.01"', formatWin(micros(0.008), 'USD', 'en-US'), '$0.008')

// 2. NEGATIVE CONTROLS. Ordinary wins are untouched, and identical to what the
//    balance formatter renders, so nothing gains spurious decimals.
for (const v of [0.08, 1, 12.34, 1234.5, 0]) {
  check(`ordinary win ${v} is unchanged`,
    formatWin(micros(v), 'USD', 'en-US'), formatBalance(micros(v), 'USD', 'en-US'))
}

// 3. THE TRAILING SYMBOL SURVIVES WIDENING. DKK renders symbol-after.
check('a trailing-symbol currency keeps its placement when widened',
  formatWin(micros(0.0008), 'DKK', 'en-US'), '0.0008 KR')
check('and is unchanged at an ordinary amount',
  formatWin(micros(12.34), 'DKK', 'en-US'), formatBalance(micros(12.34), 'DKK', 'en-US'))

// 4. Social currencies widen too: a sweepstakes session has the same wallet.
check('a virtual currency widens', formatWin(micros(0.0008), 'SC', 'en-US'), '0.0008 SC')

// 5. THE DIGIT RULE ITSELF, keyed on the value.
check('an exact-cent value needs 2', winFractionDigits(micros(12.34), 'USD'), 2)
check('a tenth-of-a-cent value needs 3', winFractionDigits(micros(0.008), 'USD'), 3)
check('a hundredth-of-a-cent value needs 4', winFractionDigits(micros(0.0008), 'USD'), 4)
check('and it never exceeds 4', winFractionDigits(micros(0.00008), 'USD'), 4)
check('zero needs no widening', winFractionDigits(0, 'USD'), 2)

// 6. COUNT-UP STABILITY. Pinning from the settled win keeps one width for every
//    frame; deriving per frame does not. Both are asserted, so the test states
//    what the defect looked like as well as what the fix does.
{
  const settled = micros(0.008)
  const digits = winFractionDigits(settled, 'USD')
  const frames = [0, 0.0003, 0.0041, 0.0067, 0.008].map(micros)
  const pinned = frames.map((f) => formatWin(f, 'USD', 'en-US', null, digits))
  const derived = frames.map((f) => formatWin(f, 'USD', 'en-US'))
  const widths = new Set(pinned.map((s) => s.length))
  check('every count-up frame renders at one width when pinned', widths.size, 1)
  check('and the derived-per-frame form really does vary, which is the defect',
    new Set(derived.map((s) => s.length)).size > 1, true)
}

// 7. THE WIRING. A correct formatter that nothing calls is not a fix. Every win
//    readout must be routed; the bought-round PRICE is deliberately not a win.
const files: Array<[string, string]> = [
  ['HudOverlay', 'src/lib/components/HudOverlay.svelte'],
  ['WinBanner', 'src/lib/components/WinBanner.svelte'],
  ['WinDisplay', 'src/lib/components/WinDisplay.svelte'],
  ['WinPod', 'src/lib/components/WinPod.svelte'],
  ['WinBreakdown', 'src/lib/components/WinBreakdown.svelte'],
  ['BonusInstrumentColumn', 'src/lib/components/BonusInstrumentColumn.svelte'],
  // ADDED 2026-08-09. The per-spin free-spin win pop was MISSED by the first
  // pass, which grepped for readouts named like wins; this one is called fmt().
  // It rendered "$0.00" at a 1 cent bet for a spin that really paid $0.004,
  // beside a running total in the SAME frame that already used formatWin.
  ['FreeSpinsPresentation', 'src/lib/components/FreeSpinsPresentation.svelte'],
]
for (const [name, path] of files) {
  check(`${name} renders wins through formatWin`, /formatWin\(/.test(readFileSync(path, 'utf8')), true)
}
// The three animated readouts must PIN the digit count, not derive it per frame.
for (const [name, path] of files.slice(0, 3)) {
  check(`${name} pins the digit count from the settled win`,
    /winFractionDigits\(/.test(readFileSync(path, 'utf8')), true)
}

// 8. NO MONEY READOUT MAY BE LEFT ON THE ROUNDING FORMATTER. Enumerated rather
//    than pattern-matched, because pattern-matching on names is exactly how the
//    free-spins pop was missed: it is called fmt(), not anything with "win" in
//    it. Every remaining formatBalance call site in a component must be a value
//    that CANNOT be sub-unit, and each is named here so adding a new one is a
//    deliberate act rather than an oversight.
{
  const ALLOWED_ROUNDING = new Set([
    'BetSelector.svelte',        // bet ladder rungs, exact by construction
    'BuyBonus.svelte',           // buy price
    'FeatureMenu.svelte',        // mode costs and the insufficient-balance figure
    'ReplayMode.svelte',         // replay bet cost and total spent
    'PaytableModal.svelte',      // advertised buy prices
    'WinBanner.svelte',          // the bought-round PRICE line, not a win
    'SessionPanel.svelte',       // wagered/won rows already carry $locale
  ])
  const dir = 'src/lib/components'
  const offenders: string[] = []
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.svelte')) continue
    const src = readFileSync(`${dir}/${f}`, 'utf8')
    const uses = src.split('\n').some((l) => /formatBalance\(/.test(l) && !/^\s*(\/\/|\*)/.test(l) && !/^import /.test(l))
    if (uses && !ALLOWED_ROUNDING.has(f)) offenders.push(f)
  }
  check('no component outside the named list still rounds money',
    offenders.join(',') || 'none', 'none')
}

// 9. EVERY MONEY FORMATTER CALL PASSES THE LAUNCH LOCALE.
//
// formatBalance/formatWin/formatBalanceCompact take the locale as their THIRD
// argument. Omitting it does not fail loudly: toLocaleString falls back to the
// runtime default, which is the player's BROWSER locale. So a session launched
// with lang=en on a German machine rendered an English label beside a German
// number, "BALANCE $100,00", and the session panel printed the same quantity two
// ways in adjacent rows because two of its three rows did pass it.
//
// Enumerated, for the same reason as check 8: a call site added without the
// argument is silent, and pattern-matching on names is what let the last one
// through.
{
  const dir = 'src/lib/components'
  const CALL = /\bformat(?:Balance|Win|BalanceCompact)\s*\(/
  const offenders: string[] = []
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.svelte')) continue
    const src = readFileSync(`${dir}/${f}`, 'utf8')
    // Join wrapped calls so a multi-line call is judged whole.
    const flat = src.replace(/\(\s*\n\s*/g, '(').replace(/,\s*\n\s*/g, ', ')
    for (const line of flat.split('\n')) {
      if (!CALL.test(line)) continue
      if (/^\s*(\/\/|\*)/.test(line) || /^import /.test(line)) continue
      // ReplayMode legitimately uses params.lang, its own resolved locale.
      if (/\$locale|params\.lang|localeTag/.test(line)) continue
      offenders.push(`${f}: ${line.trim().slice(0, 60)}`)
    }
  }
  check('every money formatter call passes a locale',
    offenders.join(' | ') || 'none', 'none')
}

if (failures) { console.error(`\nWIN PRECISION: FAIL (${failures})`); process.exit(1) }
console.log('\nWIN PRECISION: PASS (sub-cent exact, ordinary unchanged, placement kept, count-up stable)')
