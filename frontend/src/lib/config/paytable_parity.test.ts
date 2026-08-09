// paytable_parity.test.ts
//
// M08 of Session 3's proof-mechanism survey. Covers REQ-040, REQ-074 and REQ-140.
// Register: reports/qa/session3/MECHANISMS.md, mechanism M08.
//
// THE REQUIREMENT, in the platform's terms: what the player is shown must be what
// the maths actually pays. Every paid combination, the scatter awards and the max
// win figure printed in the rules must equal the shipped maths package, per mode.
//
// REQ-040 IS HERE BECAUSE NOTHING ELSE HELD IT, and that is worth recording.
// Session 2 walked 194 requirements. Session 3's survey put 79 of them to seven
// squads. **REQ-040 was assigned to no squad, appeared in no mechanism and
// appeared in no unreachable list.** It was found by counting rather than by
// reading: 78 of 79 accounted for. It is HIGH severity and player visible. An
// unassigned requirement is worse than a parked one, because nothing records
// that it was dropped.
//
// WHY THIS IS A SEPARATE FILE FROM fsModes.drift.test.ts. That gate guards
// per-mode COST against index.json and is wired already. This one guards PAYS,
// scatter awards and the max win against game_config.py and the lookup tables:
// different operands, different failure, and folding them would make one red
// check mean two unrelated things.
//
// WHY IT READS SOURCE TEXT RATHER THAN IMPORTING. `SYMBOLS` lives inside
// PaytableModal.svelte's script block, which tsx cannot import, and
// `self.paytable` is Python. Both sides are therefore parsed out of the files
// that actually ship. That is the same approach as replayRounds.test.ts gate 13a
// and it is the honest one here: a restatement of either side in TypeScript
// would be the developer's belief written down twice, which cannot catch a
// disagreement between belief and artefact.
//
// Run (from frontend/):
//   npx tsx src/lib/config/paytable_parity.test.ts
//   npx tsx src/lib/config/paytable_parity.test.ts --self-test
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(here, '../../../..')
const P = {
  paytableModal: resolve(REPO, 'frontend/src/lib/components/PaytableModal.svelte'),
  fsModes: resolve(REPO, 'frontend/src/lib/config/fsModes.ts'),
  prose: resolve(REPO, 'frontend/src/lib/i18n/prose.ts'),
  proseLocales: resolve(REPO, 'frontend/src/lib/i18n/prose.locales.ts'),
  gameConfig: resolve(REPO, 'games/future_spinner/game_config.py'),
  publishDir: resolve(REPO, 'games/future_spinner/library/publish_files'),
}

const SELF_TEST = process.argv.includes('--self-test')
let failures = 0
const ok = (n: string) => console.log(`  ok   ${n}`)
const fail = (n: string, detail?: string) => {
  failures++
  console.error(`  FAIL ${n}${detail ? '\n    ' + detail : ''}`)
}
const check = (n: string, a: unknown, e: unknown) =>
  (JSON.stringify(a) === JSON.stringify(e) ? ok(n) : fail(n, `expected ${JSON.stringify(e)}\n    actual   ${JSON.stringify(a)}`))
const checkThat = (n: string, cond: boolean, detail?: string) => (cond ? ok(n) : fail(n, detail))

// ---------------------------------------------------------------------------
// PARSERS. Each returns null when its target is not found, and a null is a HARD
// ERROR rather than a skip: a parser that silently finds nothing turns a red run
// green, which is the failure convention (p) exists to prevent.
// ---------------------------------------------------------------------------

/** The frontend's displayed per-way pays, from PaytableModal.svelte's SYMBOLS. */
function frontendPays(src: string): Record<string, (number | null)[]> | null {
  const block = src.match(/const SYMBOLS = \[([\s\S]*?)\] as const/)
  if (!block) return null
  const out: Record<string, (number | null)[]> = {}
  for (const m of block[1].matchAll(/\{\s*name:\s*'([A-Z0-9]+)'[^}]*?pays:\s*\[([^\]]*)\]/g)) {
    out[m[1]] = m[2].split(',').map((v) => {
      const t = v.trim()
      return t === 'null' ? null : Number(t)
    })
  }
  return Object.keys(out).length ? out : null
}

/** The maths package's pays, from game_config.py's self.paytable. */
function mathsPays(src: string): Record<string, Record<number, number>> | null {
  const block = src.match(/self\.paytable = \{([\s\S]*?)\n\s*\}/)
  if (!block) return null
  const out: Record<string, Record<number, number>> = {}
  for (const m of block[1].matchAll(/\((\d+),\s*"([A-Z0-9]+)"\):\s*([0-9.]+)/g)) {
    const kind = Number(m[1]); const sym = m[2]; const pay = Number(m[3])
    ;(out[sym] ??= {})[kind] = pay
  }
  return Object.keys(out).length ? out : null
}

/** The maths package's scatter awards, from self.scatter_multiplier_table. */
function mathsScatter(src: string): Record<number, number> | null {
  const block = src.match(/self\.scatter_multiplier_table = \{([\s\S]*?)\n\s*\}/)
  if (!block) return null
  const out: Record<number, number> = {}
  for (const m of block[1].matchAll(/(\d+):\s*([0-9.]+)/g)) out[Number(m[1])] = Number(m[2])
  return Object.keys(out).length ? out : null
}

/** The maths package's hard win cap, from _WINCAP. */
function mathsWincap(src: string): number | null {
  const m = src.match(/^_WINCAP\s*=\s*([0-9.]+)/m)
  return m ? Number(m[1]) : null
}

/**
 * The figure the rules PRINT to the player.
 *
 * READS THE NUMBER, NOT THE LABEL, since 2026-08-09. It used to parse
 * `FS_MAX_WIN_LABEL = '5,000×'` and strip the punctuation back out. The rendered
 * figure is now derived from the numeric `FS_MAX_WIN` via toLocaleString, so the
 * label is no longer what a player sees, and a gate reading it would have passed
 * happily while FS_MAX_WIN said something else entirely. Parsing the number the
 * game actually formats is both simpler and strictly stronger.
 */
function displayedMaxWin(src: string): number | null {
  const m = src.match(/FS_MAX_WIN\s*=\s*([0-9_]+)/)
  if (!m) return null
  const n = Number(m[1].replace(/_/g, ''))
  return Number.isFinite(n) ? n : null
}

/**
 * The scatter multipliers stated by EVERY rules-prose string, in every locale.
 *
 * S2-C050. This used to be a single `src.match` against prose.ts, so it read the
 * FIRST English string and nothing else. Fifteen localised strings and the
 * English social variant stated the same multipliers to a player and none of
 * them was checked. A translator writing 5x, 15x, 50x, which are the values this
 * game shipped BEFORE FeatureMath v2 and which CLAUDE.md still records as the
 * wrong ones, would have passed this gate.
 *
 * The literal pattern allows ESCAPED apostrophes, and that was not theoretical.
 * French reads "n\'importe ou", and a naive single-quote pattern terminates on
 * that escaped quote and captures a fragment carrying no multipliers at all.
 * The first version of this parser did exactly that and reported the French
 * line as stating none, which read as a live defect and was a parser bug.
 */
function proseScatterAll(src: string): { at: number; nums: number[] }[] {
  return [...src.matchAll(/rulesScatterMult:\s*'((?:[^'\\]|\\.)*)'/g)].map((m) => ({
    at: m.index ?? 0,
    nums: [...m[1].matchAll(/([0-9]+)×/g)].map((x) => Number(x[1])),
  }))
}

/** Top-level locale keys in prose.locales.ts, so coverage is derived and not a literal. */
function localeKeys(src: string): string[] {
  return [...src.matchAll(/^ {2}([a-z]{2}): \{/gm)].map((m) => m[1])
}

/** Highest payout in a published lookup table, in bet multiples. */
function tableMaxX(csv: string): number {
  let max = 0
  for (const line of csv.split('\n')) {
    const c = line.split(',')
    if (c.length < 3) continue
    const v = Number(c[2])
    if (Number.isFinite(v) && v > max) max = v
  }
  return max / 100 // the tables are centibets
}

// ---------------------------------------------------------------------------
// THE ASSERTIONS, as a pure function of the four source texts, so the self-test
// can run the identical logic over deliberately corrupted copies.
// ---------------------------------------------------------------------------
function assertParity(src: {
  paytableModal: string; fsModes: string; prose: string; gameConfig: string
  tables: Record<string, string>
}, label = '') {
  const p = label ? `${label} ` : ''
  const fe = frontendPays(src.paytableModal)
  const ma = mathsPays(src.gameConfig)
  const scatMaths = mathsScatter(src.gameConfig)
  const cap = mathsWincap(src.gameConfig)
  const shown = displayedMaxWin(src.fsModes)
  const scatEn = proseScatterAll(src.prose)
  const scatLoc = proseScatterAll(src.proseLocales)
  const scatProse = scatEn.length ? scatEn[0].nums : null

  if (!fe || !ma || !scatMaths || cap === null || shown === null || !scatProse) {
    fail(`${p}every operand parses`,
      `a parser found nothing, so this gate cannot honestly claim a PASS. `
      + `frontendPays=${!!fe} mathsPays=${!!ma} scatterTable=${!!scatMaths} `
      + `wincap=${cap !== null} maxWinLabel=${shown !== null} proseScatter=${!!scatProse}`)
    return
  }
  ok(`${p}every operand parses`)

  // S2-C050. EVERY rules-prose string, in every locale, states the same scatter
  // multipliers as the maths. Two assertions, because coverage and correctness
  // fail differently: a locale can carry a WRONG figure, or carry NONE at all,
  // and only checking the ones that exist would miss the second.
  {
    const keys = localeKeys(src.proseLocales)
    checkThat(`${p}every locale carries a scatter-multiplier line`,
      keys.length > 0 && scatLoc.length === keys.length,
      `${keys.length} locale(s) in prose.locales.ts, ${scatLoc.length} scatter line(s)`)

    // scatMaths is keyed by SCATTER COUNT (3, 4, 5); the prose states the
    // multipliers in that order, so compare against its values.
    const want = JSON.stringify(Object.values(scatMaths))
    const wrong = [...scatEn, ...scatLoc].filter((o) => JSON.stringify(o.nums) !== want)
    checkThat(`${p}all ${scatEn.length + scatLoc.length} prose strings state the maths multipliers`,
      wrong.length === 0,
      wrong.length
        ? `${wrong.length} disagree, first at offset ${wrong[0].at} stating `
          + `${JSON.stringify(wrong[0].nums)} against ${want}`
        : undefined)
  }

  // REQ-074 and REQ-140: displayed pays equal the maths, symbol by symbol.
  // The maths is the AUTHORITY: it is the locked, validated package, and the
  // frontend is the restatement, so any disagreement is the frontend's fault.
  let compared = 0
  for (const [sym, kinds] of Object.entries(ma)) {
    const row = fe[sym]
    if (!row) { fail(`${p}${sym}: the paytable shows this symbol`, 'the maths pays it and the modal does not list it'); continue }
    for (const [kindStr, pay] of Object.entries(kinds)) {
      const kind = Number(kindStr)
      compared++
      // pays is [_, _, 3-of, 4-of, 5-of], so index === match length minus one.
      check(`${p}${sym} ${kind}-of-a-kind pays ${pay}`, row[kind - 1], pay)
    }
  }
  checkThat(`${p}every maths symbol was compared`, compared === 24,
    `expected 24 symbol/length pairs (8 paying symbols x 3 lengths), compared ${compared}`)

  // A symbol the FRONTEND pays that the maths does not is the other direction of
  // the same defect, and the direction a one-way check would miss.
  for (const [sym, row] of Object.entries(fe)) {
    if (sym === 'WILD' || sym === 'SCAT') continue
    checkThat(`${p}${sym} is a symbol the maths actually pays`, !!ma[sym],
      `the modal prices ${sym} at ${JSON.stringify(row)} and game_config.py has no entry for it`)
  }

  // REQ-074: the scatter awards the rules state equal the maths table.
  check(`${p}scatter awards in the rules equal the maths table`,
    scatProse, [scatMaths[3], scatMaths[4], scatMaths[5]])

  // REQ-040: the max win figure PRINTED to the player equals the maths cap.
  check(`${p}the printed max win equals the maths hard cap`, shown, cap)

  // REQ-040's per-mode half: every published mode really reaches that cap and
  // none exceeds it. This is the operand the survey panel identified and it is
  // the reason the requirement is checkable at all.
  for (const [mode, csv] of Object.entries(src.tables)) {
    check(`${p}${mode}: the published lookup table tops out at the cap`, tableMaxX(csv), cap)
  }
}

// ---------------------------------------------------------------------------
function readAll() {
  const tables: Record<string, string> = {}
  for (const f of readdirSync(P.publishDir).filter((n) => /^lookUpTable_.*\.csv$/.test(n))) {
    tables[f.replace(/^lookUpTable_|_0\.csv$/g, '')] = readFileSync(resolve(P.publishDir, f), 'utf8')
  }
  return {
    paytableModal: readFileSync(P.paytableModal, 'utf8'),
    fsModes: readFileSync(P.fsModes, 'utf8'),
    prose: readFileSync(P.prose, 'utf8'),
    proseLocales: readFileSync(P.proseLocales, 'utf8'),
    gameConfig: readFileSync(P.gameConfig, 'utf8'),
    tables,
  }
}

const real = readAll()

if (!SELF_TEST) {
  console.log('PAYTABLE PARITY: displayed pays, scatter awards and max win against the shipped maths')
  assertParity(real)
  if (failures) { console.error(`\nPAYTABLE PARITY: FAIL (${failures})`); process.exit(1) }
  console.log('\nPAYTABLE PARITY: PASS (3 requirements held: REQ-040, REQ-074, REQ-140)')
} else {
  // -------------------------------------------------------------------------
  // Convention (p). Each seed plants the defect IN THE FORM IT REALLY TAKES: a
  // wrong number in the shipped source, which is exactly how a paytable drifts.
  // Nobody edits a paytable by deleting it; they change one figure and the two
  // sides quietly stop agreeing.
  // -------------------------------------------------------------------------
  console.log('PAYTABLE PARITY SELF-TEST')
  const seeds: { name: string; caught: boolean }[] = []
  const seed = (name: string, mutate: (s: ReturnType<typeof readAll>) => ReturnType<typeof readAll>) => {
    const before = failures
    const quiet = console.log
    console.log = () => {}
    const err = console.error
    console.error = () => {}
    assertParity(mutate(readAll()), `[seed ${name}]`)
    console.log = quiet
    console.error = err
    const caught = failures > before
    failures = before // the seeded failures are expected; what is scored is whether it NOTICED
    seeds.push({ name, caught })
    console.log(`  ${caught ? 'caught' : 'MISSED'}  SEED ${name}`)
  }

  // The real drift form: one figure changed on the frontend side.
  seed('one symbol pay drifts on the frontend', (s) => ({
    ...s, paytableModal: s.paytableModal.replace("pays: [null, null, 1.5,  6,    22]", "pays: [null, null, 1.5,  6,    25]"),
  }))
  // The same defect from the other side, which a one-way check would miss.
  seed('one symbol pay drifts in the maths', (s) => ({
    ...s, gameConfig: s.gameConfig.replace('(5, "L3"): 0.65', '(5, "L3"): 0.70'),
  }))
  // The max win figure printed to the player stops matching the cap. This is
  // REQ-040 exactly, and it is the one nothing held before this gate.
  seed('the printed max win drifts from the maths cap', (s) => ({
    ...s, fsModes: s.fsModes.replace('FS_MAX_WIN = 5000', 'FS_MAX_WIN = 10000'),
  }))
  // S2-C050 SEED 1. The real defect form for the locale half: a TRANSLATED
  // string carrying the pre-FeatureMath-v2 multipliers. English stays correct,
  // which is exactly why the old single-match parser could not see this.
  seed('a LOCALISED scatter line states the old 5x/15x/50x multipliers', (s) => ({
    ...s,
    proseLocales: s.proseLocales.replace(
      '1×, 3× oder 10×',
      '5×, 15× oder 50×',
    ),
  }))
  // S2-C050 SEED 2. Coverage rather than correctness: a locale that carries no
  // scatter line at all. A check that only reads the lines it finds scores this
  // as clean, because there is nothing wrong with the ones that exist.
  seed('a locale carries NO scatter line at all', (s) => ({
    ...s,
    proseLocales: s.proseLocales.replace(
      /\n\s*rulesScatterMult: '3, 4 oder 5 SCATTER[^\n]*\n/,
      '\n',
    ),
  }))
  // A scatter award restated wrongly in the player-facing rules.
  seed('a scatter award in the rules drifts', (s) => ({
    ...s, prose: s.prose.replace('a 1×, 3×, or 10× multiplier', 'a 1×, 5×, or 10× multiplier'),
  }))
  // A published mode that no longer reaches the cap it advertises.
  seed('a published mode stops reaching the advertised cap', (s) => ({
    ...s, tables: { ...s.tables, base: s.tables.base.replace(/,500000/g, ',400000') },
  }))
  // A parser that finds nothing must FAIL rather than pass vacuously. Without
  // this the gate would go green the day someone reformats the SYMBOLS array.
  seed('a parser target disappears entirely', (s) => ({
    ...s, paytableModal: s.paytableModal.replace('const SYMBOLS = [', 'const SYMBOLS_RENAMED = ['),
  }))

  console.log('\nCONTROLS, the real tree must pass:')
  assertParity(real, '[control]')

  const missed = seeds.filter((s) => !s.caught)
  console.log(`\nSEEDS: ${seeds.length - missed.length}/${seeds.length} caught`)
  if (missed.length || failures) {
    if (missed.length) console.error('SELF-TEST FAILED: the gate stayed green on a planted defect:')
    missed.forEach((m) => console.error(`  MISSED ${m.name}`))
    if (failures) console.error(`SELF-TEST FAILED: ${failures} control assertion(s) failed on the real tree`)
    process.exit(1)
  }
  console.log('PAYTABLE PARITY SELF-TEST: PASS (every seed red, every control green)')
}
