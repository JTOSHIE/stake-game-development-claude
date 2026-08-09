// round_payout_reconciliation_gate.mjs
//
// PUBLISHED CHECKLIST ITEM 32: "Check 5 wins for each game mode against the Game
// Rules". Self-assessment row 32, docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md.
//
// A reviewer satisfies that item by playing until five wins land in each of the
// five modes and reconciling each against what the rules screen told them. That
// is twenty-five samples drawn by hand, and it is the WEAKEST form of the claim
// the item is actually about, which is: does every win this game will ever pay
// agree with what the player was told it would pay?
//
// This gate answers the strong form. It reconciles EVERY win in EVERY published
// book, in all five modes, against the paytable a player can read on screen.
//
// THE FORMULA, and it is not this gate's invention. game_config.py's own comment
// above the table states it:
//
//     "Final ways win = paytable_value x ways_count x bet, then x the Overdrive
//      multiplier during free spins."
//
// so, in the integer centibets the books actually carry:
//
//     ways win     = paytable[kind][symbol] x meta.ways x meta.globalMult x 100
//     scatter win  = scatterAward[kind]     x meta.globalMult x 100
//
// both then CLAMPED to the 5,000x cap, and the clamp is applied to EACH WIN
// rather than to the round total. That was derived from the books rather than
// assumed, because the obvious reading is wrong in a way that still adds up.
// books_base round 1020 carries an H1 five-of-a-kind on 324 ways at a 2x meter,
// worth 14,256x by the formula, reported as exactly 500,000 centibets; the
// running total before it was already 475,480, so a clamp that merely topped the
// ROUND up to the cap would have reported 24,520 instead. It does not. A later
// L3 win in the same round is still paid in full at 2,080. So: every win is
// individually min(formula, cap), and the round is min(sum of those, cap).
//
// SCATTER IS NOT PER-WAY, which is the one trap in here. A scatter win event
// carries meta.ways just like every other win, and multiplying by it is the
// obvious wrong answer: five scatters arrive with ways 5 and pay 10x, not 50x.
// The scatter table pays a flat multiple of TOTAL BET. Both forms are seeded in
// the self-test, because the plausible bug is the one worth planting.
//
// WHY THE TWO PAYTABLE PARSES ARE GENUINELY INDEPENDENT, per convention (l.4),
// which warns that two methods sharing an input corroborate nothing. These do
// not share one: one parse reads a python dict keyed by (count, symbol) in the
// LOCKED maths package; the other reads a TypeScript array of `pays` tuples
// ordered [_, _, 3of, 4of, 5of] in the Svelte component the player opens. Same
// numbers, two authors, two formats, two files, neither generated from the
// other. If they agree, that is real corroboration. The books are then checked
// against the PLAYER-FACING one, because the item asks whether wins match the
// GAME RULES, and the game rules are what is on the screen.
//
// WHAT THIS GATE DELIBERATELY DOES NOT COVER, stated because a parked class is
// only honestly parked if its enumeration is honest:
//   - Whether the RGS serves these books faithfully. That is the lookup tables
//     and the platform, and it is out of reach from here.
//   - Whether the free-spin COUNT awarded matches the rules. That is the trigger
//     table, checked by the locale prose gates, not a payout figure.
//   - Symbol-level multipliers (meta.symbolMult). It is 0 in every win in every
//     published book, and the gate FAILS if that ever stops being true rather
//     than silently ignoring a field it does not model.
//
// Convention (p):
//   node scripts/round_payout_reconciliation_gate.mjs --self-test
//   node scripts/round_payout_reconciliation_gate.mjs
//   node scripts/round_payout_reconciliation_gate.mjs --limit 5000   (fast pass)
//
// Writes nothing. Convention (h.1) holds by construction.

import { readFileSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const FRONTEND = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = join(FRONTEND, '..')
const CONFIG_PY = join(REPO, 'games/future_spinner/game_config.py')
const MODAL = join(FRONTEND, 'src/lib/components/PaytableModal.svelte')
const BOOKS = join(REPO, 'games/future_spinner/library/publish_files')

// The five modes, as the maths names them. fsModes.ts calls two of them
// something else on screen (normal/overboost against base/antelite); the book
// files are named for the SERVER mode, so these are the server names.
const MODES = ['base', 'cruise', 'antelite', 'bonus', 'super']

const CENTIBETS = 100
const WINCAP_CENTIBETS = 5000 * CENTIBETS // the 5,000x hard cap, every mode

let failures = 0
const ok = (n) => console.log(`  ok    ${n}`)
const bad = (n, d) => { failures++; console.error(`  FAIL  ${n}${d ? '\n        ' + d : ''}`) }

// ── parsers ──────────────────────────────────────────────────────────────────

/** The maths paytable: {(5, "H1"): 22.0, ...} keyed [kind][symbol]. */
export function paytableFromConfig(src) {
  const body = src.split('self.paytable = {')[1]
  if (!body) return {}
  const table = {}
  for (const m of body.split('}')[0].matchAll(/\((\d+),\s*"([A-Z0-9]+)"\)\s*:\s*([0-9.]+)/g)) {
    const [, kind, sym, val] = m
    ;(table[kind] ||= {})[sym] = Number(val)
  }
  return table
}

/** The player-facing paytable: pays: [_, _, 3of, 4of, 5of]. */
export function paytableFromModal(src) {
  const body = src.split('const SYMBOLS = [')[1]
  if (!body) return {}
  const table = {}
  for (const m of body.split('] as const')[0].matchAll(
    /name:\s*'([A-Z0-9]+)'[^}]*?pays:\s*\[([^\]]+)\]/g)) {
    const [, name, arr] = m
    const vals = arr.split(',').map((s) => s.trim())
    vals.forEach((v, i) => {
      if (v === 'null') return
      ;(table[String(i + 1)] ||= {})[name] = Number(v)
    })
  }
  return table
}

/**
 * The scatter award table. game_config.py builds it from a base award dict, so
 * this reads the literal rather than re-deriving the comprehension: 3/4/5
 * scatters pay 1x/3x/10x of TOTAL BET, per CLAUDE.md's true game facts.
 */
export function scatterAwards() {
  return { 3: 1, 4: 3, 5: 10 }
}

/**
 * The instant scatter award for a given scatter count, in multiples of TOTAL BET.
 *
 * SIX SCATTERS ARE REAL, and this is the one thing in this file that had to be
 * derived from the books rather than read off the table. `scatter_multiplier_table`
 * in game_config.py defines 3, 4 and 5 only, which reads as "6 cannot happen".
 * It can: books_bonus round 61700 lands six scatters on rows 1 and 4 of the
 * padded six-row board, with BOTH padding rows empty, so all six are on the
 * visible 5x4 grid. game_config.py's own comment beside freespin_triggers says
 * why: "the base trigger is forced to exactly 3/4/5 distinct-reel scatters, but
 * free-spin draws are natural and scatters can stack, giving 6+ on a 5x4 grid
 * ... (6+ awards the 5-scatter amount)".
 *
 * So the award clamps to the highest defined key. That is stated by the config
 * AND confirmed by the artefact: those wins carry winWithoutMult 1000, i.e. 10x,
 * the 5-scatter amount. Two independent inputs, per convention (l.4).
 *
 * OWNER RULING, and it was given before this gate existed rather than because of
 * it: six or seven scatters is the same as five, so nothing player-facing turns
 * on it. Restated 2026-08-09 when this pass re-raised it. The award IS identical,
 * 10x and 16 spins, so the rules screen stopping at five is correct about what a
 * player can win. Do not reopen this.
 *
 * CLAUDE.md's convention (l) worked example concluded "maximum 5, zero rounds at
 * 6 or 7". It says so about books_base, and for books_base it is exactly true:
 * a full 100,000-round pass finds ZERO. The measurement was never wrong.
 *
 * WHAT WAS UNDER-SAMPLED, recorded because it is the only new fact here.
 * REVIEW_TRACKER TR-047 generalised to all five modes off 20,000 rounds each.
 * The only rounds that carry six scatters are ids 61700 and 98874, in bonus and
 * super, both beyond that window. Full pass, per 100,000 rounds: base 0,
 * cruise 0, antelite 0, bonus 2, super 2.
 */
export function scatterAwardFor(kind, table) {
  const keys = Object.keys(table).map(Number).sort((x, y) => x - y)
  if (!keys.length) return undefined
  const max = keys[keys.length - 1]
  if (kind > max) return table[max]
  return table[kind]
}

/** Every difference between two [kind][symbol] tables, as readable strings. */
export function tableDiff(a, b, aName, bName) {
  const out = []
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const k of [...keys].sort()) {
    const syms = new Set([...Object.keys(a[k] || {}), ...Object.keys(b[k] || {})])
    for (const s of [...syms].sort()) {
      const x = a[k]?.[s]
      const y = b[k]?.[s]
      if (x !== y) out.push(`${s} ${k}-of-a-kind: ${aName} ${x ?? 'absent'} against ${bName} ${y ?? 'absent'}`)
    }
  }
  return out
}

// ── the reconciliation itself ────────────────────────────────────────────────

/**
 * The expected win in centibets for one win entry, from the player-facing rules.
 * Returns null when the shape is one this gate does not model, so the caller can
 * count it as UNMODELLED rather than silently passing it.
 */
export function expectedWinCentibets(win, payTable, scatter) {
  const kind = Number(win.kind)
  const ways = Number(win?.meta?.ways ?? 0)
  const mult = Number(win?.meta?.globalMult ?? 1)
  if (!Number.isFinite(kind) || !Number.isFinite(mult)) return null

  if (win.symbol === 'S') {
    const award = scatterAwardFor(kind, scatter)
    if (award === undefined) return null
    // FLAT multiple of total bet. Deliberately NOT x ways: see the header.
    return Math.min(Math.round(award * mult * CENTIBETS), WINCAP_CENTIBETS)
  }

  const per = payTable[String(kind)]?.[win.symbol]
  if (per === undefined) return null
  if (!Number.isFinite(ways) || ways <= 0) return null
  return Math.min(Math.round(per * ways * mult * CENTIBETS), WINCAP_CENTIBETS)
}

/** Reconcile one decoded round. Returns {wins, bad[], unmodelled, capApplied}. */
export function reconcileRound(round, payTable, scatter) {
  const problems = []
  let wins = 0
  let unmodelled = 0
  let presented = 0

  for (const ev of round.events || []) {
    if (ev.type !== 'winInfo') continue
    for (const w of ev.wins || []) {
      wins++
      presented += Number(w.win ?? 0)

      if (Number(w?.meta?.symbolMult ?? 0) !== 0) {
        problems.push(`round ${round.id}: ${w.symbol} carries symbolMult ${w.meta.symbolMult}, `
          + 'which this gate does not model; the formula above is incomplete for it')
        continue
      }

      const want = expectedWinCentibets(w, payTable, scatter)
      if (want === null) { unmodelled++; continue }
      const got = Number(w.win ?? 0)
      if (want !== got) {
        problems.push(`round ${round.id}: ${w.symbol} ${w.kind}-of-a-kind, ways ${w.meta?.ways}, `
          + `meter ${w.meta?.globalMult}x: rules say ${want} centibets, book pays ${got}`)
      }
    }
  }

  // The round total must be the presented wins, capped. roundInterpreter.ts
  // states this same invariant over the event script; here it is checked
  // against the payout the RGS will actually credit.
  const capped = Math.min(presented, WINCAP_CENTIBETS)
  const payout = Number(round.payoutMultiplier ?? 0)
  if (capped !== payout) {
    problems.push(`round ${round.id}: presented wins total ${presented} (capped ${capped}) `
      + `but payoutMultiplier is ${payout}`)
  }

  return { wins, problems, unmodelled, capApplied: presented > WINCAP_CENTIBETS }
}

/** Stream one mode's book file through the zstd CLI, a round per line. */
async function scanMode(mode, payTable, scatter, limit) {
  const file = join(BOOKS, `books_${mode}.jsonl.zst`)
  if (!existsSync(file)) return { mode, missing: true }

  const proc = spawn('zstd', ['-dc', file], { stdio: ['ignore', 'pipe', 'ignore'] })
  const rl = createInterface({ input: proc.stdout, crlfDelay: Infinity })

  const stat = { mode, rounds: 0, wins: 0, unmodelled: 0, capped: 0, problems: [], parseErrors: 0 }
  for await (const line of rl) {
    if (!line) continue
    if (limit && stat.rounds >= limit) break
    let round
    try { round = JSON.parse(line) } catch { stat.parseErrors++; continue }
    stat.rounds++
    const r = reconcileRound(round, payTable, scatter)
    stat.wins += r.wins
    stat.unmodelled += r.unmodelled
    if (r.capApplied) stat.capped++
    // Keep the first twenty so a failure is diagnosable without a 500k line dump.
    for (const p of r.problems) if (stat.problems.length < 20) stat.problems.push(p)
    else { stat.problems.length = 20; break }
  }
  rl.close()
  proc.kill()
  return stat
}

// ── self-test ────────────────────────────────────────────────────────────────

function selfTest() {
  const cfg = readFileSync(CONFIG_PY, 'utf8')
  const modal = readFileSync(MODAL, 'utf8')
  const real = paytableFromModal(modal)
  const scatter = scatterAwards()

  // A real round, taken verbatim from books_base: L3 five-of-a-kind, 6 ways,
  // meter 1x, paying 390 centibets. 0.65 x 6 x 1 x 100 = 390.
  const REAL_ROUND = {
    id: 0,
    payoutMultiplier: 390,
    events: [{
      index: 1, type: 'winInfo', totalWin: 390,
      wins: [{ symbol: 'L3', kind: 5, win: 390, meta: { ways: 6, globalMult: 1, symbolMult: 0 } }],
    }],
  }
  // A real scatter win: five scatters, ways 5, paying 1000 centibets, i.e. 10x
  // TOTAL BET rather than 10x per way.
  const REAL_SCATTER = {
    id: 1,
    payoutMultiplier: 1000,
    events: [{
      index: 1, type: 'winInfo', totalWin: 1000,
      wins: [{ symbol: 'S', kind: 5, win: 1000, meta: { ways: 5, globalMult: 1, symbolMult: 0 } }],
    }],
  }
  // books_base round 1020, verbatim. The H1 win on 324 ways at a 2x meter is
  // worth 1,425,600 by the formula and is reported clamped at 500,000; the L3
  // win after it is still paid in full. Sum of reported wins is 977,560 and the
  // round pays min(that, cap) = 500,000.
  const REAL_CAPPED = {
    id: 1020,
    payoutMultiplier: 500000,
    events: [{
      index: 1, type: 'winInfo', totalWin: 500000,
      wins: [
        { symbol: 'M3', kind: 3, win: 20,     meta: { ways: 1,   globalMult: 1, symbolMult: 0 } },
        { symbol: 'L2', kind: 5, win: 160,    meta: { ways: 2,   globalMult: 1, symbolMult: 0 } },
        { symbol: 'S',  kind: 3, win: 100,    meta: { ways: 3,   globalMult: 1, symbolMult: 0 } },
        { symbol: 'H1', kind: 5, win: 475200, meta: { ways: 216, globalMult: 1, symbolMult: 0 } },
        { symbol: 'H1', kind: 5, win: 500000, meta: { ways: 324, globalMult: 2, symbolMult: 0 } },
        { symbol: 'L3', kind: 5, win: 2080,   meta: { ways: 16,  globalMult: 2, symbolMult: 0 } },
      ],
    }],
  }
  // books_bonus round 61700, the six-scatter win, verbatim. 10x total bet at a
  // 2x Overdrive meter = 2,000 centibets, and winWithoutMult confirms the 1,000.
  const SIX_SCATTER = {
    id: 61700,
    payoutMultiplier: 2000,
    events: [{
      index: 1, type: 'winInfo', totalWin: 2000,
      wins: [{ symbol: 'S', kind: 6, win: 2000, meta: { ways: 6, globalMult: 2, symbolMult: 0 } }],
    }],
  }
  const clone = (o) => JSON.parse(JSON.stringify(o))

  const SEEDS = [
    ['the two paytables disagree, which is the drift this exists to catch', true,
      () => tableDiff(paytableFromConfig(cfg.replace('(5, "H1"): 22.0', '(5, "H1"): 20.0')),
        real, 'maths', 'rules').length > 0],

    ['the RULES screen is the one that drifted, not the maths', true,
      () => tableDiff(paytableFromConfig(cfg),
        paytableFromModal(modal.replace("pays: [null, null, 1.5,  6,    22]", "pays: [null, null, 1.5,  6,    25]")),
        'maths', 'rules').length > 0],

    ['a book pays more than the rules promise', true,
      () => { const r = clone(REAL_ROUND); r.events[0].wins[0].win = 400; r.payoutMultiplier = 400
        return reconcileRound(r, real, scatter).problems.length > 0 }],

    ['a book pays LESS than the rules promise, which shortchanges the player', true,
      () => { const r = clone(REAL_ROUND); r.events[0].wins[0].win = 380; r.payoutMultiplier = 380
        return reconcileRound(r, real, scatter).problems.length > 0 }],

    ['the ways count is inflated, so the win no longer follows from the board', true,
      () => { const r = clone(REAL_ROUND); r.events[0].wins[0].meta.ways = 8
        return reconcileRound(r, real, scatter).problems.length > 0 }],

    ['the Overdrive meter is applied but the win was not multiplied by it', true,
      () => { const r = clone(REAL_ROUND); r.events[0].wins[0].meta.globalMult = 3
        return reconcileRound(r, real, scatter).problems.length > 0 }],

    ['THE SCATTER TRAP: scatter paid PER WAY instead of as a flat total-bet '
      + 'multiple, which is the plausible bug and reads as correct arithmetic', true,
      () => { const r = clone(REAL_SCATTER); r.events[0].wins[0].win = 5000; r.payoutMultiplier = 5000
        return reconcileRound(r, real, scatter).problems.length > 0 }],

    ['the round total disagrees with the wins it presented', true,
      () => { const r = clone(REAL_ROUND); r.payoutMultiplier = 500
        return reconcileRound(r, real, scatter).problems.length > 0 }],

    ['a symbolMult appears, which the formula above does not model and must not '
      + 'be silently passed over', true,
      () => { const r = clone(REAL_ROUND); r.events[0].wins[0].meta.symbolMult = 2
        return reconcileRound(r, real, scatter).problems.length > 0 }],

    ['SIX SCATTERS paid MORE than the five-scatter amount, which is the rule in '
      + 'game_config.py being broken in the direction nobody would notice', true,
      () => reconcileRound(SIX_SCATTER, real, { ...scatter, 6: 20 }, true).problems.length > 0],

    ['NEGATIVE CONTROL: books_bonus round 61700, verbatim, six visible scatters '
      + 'paying the five-scatter amount at a 2x meter', false,
      () => reconcileRound(SIX_SCATTER, real, scatter).problems.length > 0],

    ['NEGATIVE CONTROL: the real maths and the real rules screen agree', false,
      () => tableDiff(paytableFromConfig(cfg), real, 'maths', 'rules').length > 0],

    ['NEGATIVE CONTROL: a real ways win from books_base reconciles', false,
      () => reconcileRound(REAL_ROUND, real, scatter).problems.length > 0],

    ['NEGATIVE CONTROL: a real scatter win from books_base reconciles', false,
      () => reconcileRound(REAL_SCATTER, real, scatter).problems.length > 0],

    ['a win above the cap is paid IN FULL instead of being clamped to 5,000x, '
      + 'which is the max-win promise being broken in the player\'s favour and '
      + 'is still a broken promise', true,
      () => { const r = clone(REAL_CAPPED)
        r.events[0].wins[3].win = 1425600           // the uncapped H1 figure
        r.payoutMultiplier = WINCAP_CENTIBETS
        return reconcileRound(r, real, scatter).problems.length > 0 }],

    ['NEGATIVE CONTROL: books_base round 1020, verbatim, where one win is clamped '
      + 'to the cap and a later win in the same round is still paid in full', false,
      () => reconcileRound(REAL_CAPPED, real, scatter).problems.length > 0],
  ]

  let n = 0
  for (const [why, shouldFlag, run] of SEEDS) {
    let got
    try { got = run() } catch (e) { got = `threw ${e.message}` }
    const good = got === shouldFlag
    if (!good) n++
    console.log(`  ${good ? 'caught ' : 'MISSED '} seeded: ${why}`)
  }
  const seeded = SEEDS.filter((s) => s[1]).length
  const controls = SEEDS.length - seeded
  console.log(n === 0
    ? `\nROUND PAYOUT RECONCILIATION SELF-TEST: PASS (${seeded} seeded, ${controls} negative controls)`
    : `\nROUND PAYOUT RECONCILIATION SELF-TEST: FAIL (${n})`)
  process.exit(n === 0 ? 0 : 1)
}

// ── real run ─────────────────────────────────────────────────────────────────

async function run() {
  const limitArg = process.argv.indexOf('--limit')
  const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : 0

  console.log('ROUND PAYOUT RECONCILIATION: every published win against the rules a player reads')
  console.log(limit ? `  limited to the first ${limit} rounds per mode\n` : '  full pass, every round in every mode\n')

  const cfg = readFileSync(CONFIG_PY, 'utf8')
  const modal = readFileSync(MODAL, 'utf8')
  const mathsTable = paytableFromConfig(cfg)
  const rulesTable = paytableFromModal(modal)
  const scatter = scatterAwards()

  // 1. the two independent parses must agree before either is trusted
  const entries = Object.values(rulesTable).reduce((a, o) => a + Object.keys(o).length, 0)
  if (entries === 0) {
    bad('the player-facing paytable parses', 'PaytableModal.svelte yielded no entries; the parser has drifted from the file')
  } else {
    const diff = tableDiff(mathsTable, rulesTable, 'maths', 'rules')
    diff.length
      ? bad('the maths paytable and the rules screen agree', diff.join('; '))
      : ok(`the maths paytable and the rules screen agree, all ${entries} entries, parsed independently`)
  }

  // 2. every win in every mode
  let totalRounds = 0
  let totalWins = 0
  let totalUnmodelled = 0
  for (const mode of MODES) {
    const s = await scanMode(mode, rulesTable, scatter, limit)
    if (s.missing) { bad(`books_${mode}.jsonl.zst is present to scan`, 'a skipped mode is not a pass'); continue }
    totalRounds += s.rounds
    totalWins += s.wins
    totalUnmodelled += s.unmodelled
    if (s.parseErrors) bad(`books_${mode} decodes cleanly`, `${s.parseErrors} unparseable line(s)`)
    if (s.problems.length) {
      bad(`every win in ${mode} matches the rules screen`,
        `${s.rounds} rounds, ${s.wins} wins:\n        ` + s.problems.join('\n        '))
    } else {
      ok(`${mode}: ${s.rounds.toLocaleString()} rounds, ${s.wins.toLocaleString()} wins, `
        + `all reconcile${s.capped ? `, ${s.capped} at the 5,000x cap` : ''}`)
    }
  }

  if (totalUnmodelled > 0) {
    bad('every win shape is modelled by the formula',
      `${totalUnmodelled} win(s) had a symbol or kind this gate cannot compute, so they were `
      + 'neither checked nor counted as passing')
  } else if (totalWins > 0) {
    ok(`every one of the ${totalWins.toLocaleString()} wins was modelled, none skipped`)
  }

  if (failures) {
    console.error(`\nROUND PAYOUT RECONCILIATION: FAIL (${failures})`)
    process.exit(1)
  }
  console.log(`\nROUND PAYOUT RECONCILIATION: PASS (${totalRounds.toLocaleString()} rounds, `
    + `${totalWins.toLocaleString()} wins, five modes, zero disagreements with the rules screen)`)
  process.exit(0)
}

if (process.argv.includes('--self-test')) selfTest()
else run()
