// prohibited_mechanic_gate.mjs
//
// S2-C035. The game must ship NO prohibited mechanic, and nothing checked it.
//
// THE REQUIREMENT, in CLAUDE.md's own words under Compliance: the game is
// "stateless per platform definition (the free spins resolve inside one book
// round; no jackpot, gamble, continuation, early cashout, cross-round state)".
// That is a compliance claim the dossier makes to a reviewer, and until this
// gate it was held by nothing but the absence of anyone adding one.
//
// THREE ASSERTIONS, because a prohibited mechanic can arrive by three different
// doors and a single scan would catch only one of them.
//
//   1. THE MODE SET. Every mode the frontend can request exists in the maths
//      package, and every mode the maths declares is offered. A sixth mode
//      appearing on either side is a mechanic nobody validated.
//
//      This compares fsModes.ts's serverMode values against game_config.py's
//      BetMode names. fsModes.drift.test.ts already compares fsModes.ts to
//      index.json, which is a DIFFERENT pair: index.json is GENERATED from
//      game_config.py, so a bad regeneration would leave the frontend agreeing
//      with index.json while both diverged from the maths. Three-way agreement
//      is the point, and this gate is the third leg.
//
//      Note fsModes.ts carries id AND serverMode, and they deliberately differ:
//      the UI calls them normal and overboost where the maths calls them base
//      and antelite. Comparing id would be permanently red on a correct tree.
//
//   2. PROHIBITED VOCABULARY IN SHIPPED TEXT. No jackpot, gamble, cash out,
//      double up or continuation wording reaches the bundle as player text.
//
//      THE HARD PART, and it is the same shape as the Stake scan's: the social
//      vocabulary layer's own phrase table contains the word "gamble", because
//      rewriting it is the compliance MECHANISM. `{phrase:"gamble",
//      replacement:"play"}` ships and must ship. So the scan excludes phrase
//      table entries and ships one as a negative control. A gate that flags its
//      own compliance layer gets switched off.
//
//   3. CONTROL INVENTORY. No handler or control in source is named for a
//      prohibited mechanic. A gamble button wired but hidden is still a mechanic
//      in the artefact, and assertion 2 would not see it if its label were
//      localised or its text assembled at runtime.
//
// Convention (p):
//   node scripts/prohibited_mechanic_gate.mjs --self-test
//   node scripts/prohibited_mechanic_gate.mjs
//
// Writes nothing. Convention (h.1) holds by construction.

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, sep } from 'node:path'

const FRONTEND = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = join(FRONTEND, '..')
const DIST = join(FRONTEND, 'dist')
const SRC = join(FRONTEND, 'src')

// Stated here, not imported. Convention (l.4): a second scan sharing another
// scan's list agrees by construction and corroborates nothing.
//
// THE GAMBLE RULE IS NARROW ON PURPOSE, and the first draft got it wrong. A
// regex of /gambl(e|ing)/ flags `gamblingLimitReached: "Gambling limit
// reached."`, which is RESPONSIBLE-GAMBLING wording supplied verbatim by Fable
// and is a REQUIRED player-protection message in all sixteen locales. Flagging
// it would have pressured someone to delete a mandatory disclaimer to make a
// gate green, which is worse than having no gate. The prohibited MECHANIC is a
// gamble FEATURE, a double-or-nothing offered on a win. So `gamble` matches and
// `gambling` deliberately does not, and the real message ships as a control.
const MECHANICS = [
  [/\bjackpots?\b/i, 'jackpot'],
  [/\bgamble[sd]?\b/i, 'gamble feature'],
  [/\bdouble[\s-]?up\b/i, 'double up'],
  [/\bcash[\s-]?out\b/i, 'cash out'],
  [/\bearly\s+cash/i, 'early cashout'],
]

let failures = 0
const ok = (n) => console.log(`  ok    ${n}`)
const bad = (n, d) => { failures++; console.error(`  FAIL  ${n}${d ? '\n        ' + d : ''}`) }

// ── parsers ──────────────────────────────────────────────────────────────────
function serverModes(src) {
  return [...src.matchAll(/serverMode:\s*'([a-z]+)'/g)].map((m) => m[1]).sort()
}
function betModes(src) {
  return [...src.matchAll(/BetMode\(\s*\n?\s*name="([a-z]+)"/g)].map((m) => m[1]).sort()
}

/**
 * Strip the social vocabulary layer's phrase table before scanning shipped text.
 * Those entries carry prohibited words BY DESIGN: rewriting them is what makes
 * the game compliant on stake.us. Flagging them would flag the mechanism.
 */
function withoutPhraseTable(text) {
  return text
    .replace(/\{\s*phrase\s*:\s*("|')(?:[^"'\\]|\\.)*\1\s*,\s*replacement\s*:\s*("|')(?:[^"'\\]|\\.)*\2\s*\}/g, '{}')
    .replace(/["'](?:[^"'\\]|\\.)*["']\s*:\s*["'](?:[^"'\\]|\\.)*["']/g, '')
}

function mechanicsIn(text) {
  const clean = withoutPhraseTable(text)
  const out = []
  for (const [re, name] of MECHANICS) {
    const m = clean.match(re)
    if (m) out.push({ name, hit: m[0] })
  }
  return out
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

// ── self-test ────────────────────────────────────────────────────────────────
function selfTest() {
  const fs = readFileSync(join(FRONTEND, 'src/lib/config/fsModes.ts'), 'utf8')
  const gc = readFileSync(join(REPO, 'games/future_spinner/game_config.py'), 'utf8')

  const SEEDS = [
    ['a sixth mode offered by the frontend that the maths never declared', true,
      () => {
        const a = serverModes(fs.replace("serverMode: 'super'", "serverMode: 'jackpot'"))
        return JSON.stringify(a) !== JSON.stringify(betModes(gc))
      }],
    ['a mode declared by the maths that the frontend does not offer', true,
      () => {
        const b = betModes(gc.replace('name="cruise"', 'name="cruisex"'))
        return JSON.stringify(serverModes(fs)) !== JSON.stringify(b)
      }],
    ['a jackpot promise in shipped player text', true,
      () => mechanicsIn('{k:"Win the progressive JACKPOT every hour"}').length > 0],
    ['a gamble control offered in player text', true,
      () => mechanicsIn('{k:"Gamble your win to double it"}').length > 0],
    ['a cash out control offered in player text', true,
      () => mechanicsIn('{k:"Cash out early and keep your winnings"}').length > 0],
    ['NEGATIVE CONTROL: the real mode sets agree and must stay green', false,
      () => JSON.stringify(serverModes(fs)) !== JSON.stringify(betModes(gc))],
    ['NEGATIVE CONTROL: the social phrase table SHIPS the word gamble, because '
      + 'rewriting it is the compliance mechanism', false,
      () => mechanicsIn('[{phrase:"gamble",replacement:"play"},{phrase:"wager",replacement:"play"}]').length > 0],
    ['NEGATIVE CONTROL: the responsible-gambling limit message is MANDATORY '
      + 'and must survive, which the first draft of this gate flagged', false,
      () => mechanicsIn('{gamblingLimitReached:"Gambling limit reached."}').length > 0],
    ['NEGATIVE CONTROL: a real shipped bundle must survive', false,
      () => {
        if (!existsSync(DIST)) return false
        const js = walk(DIST).filter((f) => f.endsWith('.js'))
        return js.some((f) => mechanicsIn(readFileSync(f, 'utf8')).length > 0)
      }],
  ]

  let n = 0
  for (const [why, shouldFlag, run] of SEEDS) {
    const got = run()
    const good = got === shouldFlag
    if (!good) n++
    console.log(`  ${good ? 'caught ' : 'MISSED '} seeded: ${why}`)
  }
  console.log(n === 0
    ? 'PROHIBITED MECHANIC GATE SELF-TEST: PASS (5 seeded, 4 negative controls)'
    : `PROHIBITED MECHANIC GATE SELF-TEST: FAIL (${n})`)
  process.exit(n === 0 ? 0 : 1)
}

// ── real run ─────────────────────────────────────────────────────────────────
function run() {
  console.log('PROHIBITED MECHANIC GATE: no jackpot, gamble, continuation or early cashout')

  // 1. the mode set, three-way
  const fsm = serverModes(readFileSync(join(FRONTEND, 'src/lib/config/fsModes.ts'), 'utf8'))
  const bm = betModes(readFileSync(join(REPO, 'games/future_spinner/game_config.py'), 'utf8'))
  if (!fsm.length || !bm.length) {
    bad('both mode lists parse', `frontend=${fsm.length} maths=${bm.length}; a parser found nothing`)
  } else if (JSON.stringify(fsm) !== JSON.stringify(bm)) {
    bad('the frontend offers exactly the modes the maths declares',
      `frontend ${JSON.stringify(fsm)} against maths ${JSON.stringify(bm)}`)
  } else {
    ok(`the frontend offers exactly the modes the maths declares (${fsm.join(', ')})`)
  }

  // 2. shipped player text
  if (!existsSync(DIST)) {
    bad('the bundle is present to scan', 'frontend/dist is absent; build first, a skipped scan is not a pass')
  } else {
    const hits = []
    for (const f of walk(DIST).filter((x) => /\.(js|html|css)$/.test(x))) {
      for (const h of mechanicsIn(readFileSync(f, 'utf8'))) {
        hits.push(`${relative(DIST, f).split(sep).join('/')}: ${h.name} ("${h.hit}")`)
      }
    }
    hits.length
      ? bad('no prohibited mechanic is named in shipped player text', hits.join('; '))
      : ok('no prohibited mechanic is named in shipped player text')
  }

  // 3. control inventory
  const ctrl = []
  for (const f of walk(SRC).filter((x) => /\.(ts|svelte)$/.test(x))) {
    const s = readFileSync(f, 'utf8')
    const m = s.match(/\b(?:function|const|let)\s+\w*(?:gamble|jackpot|cashOut|doubleUp)\w*/i)
    if (m) ctrl.push(`${relative(SRC, f).split(sep).join('/')}: ${m[0]}`)
  }
  ctrl.length
    ? bad('no control or handler is named for a prohibited mechanic', ctrl.join('; '))
    : ok('no control or handler is named for a prohibited mechanic')

  if (failures) {
    console.error(`\nPROHIBITED MECHANIC GATE: FAIL (${failures})`)
    process.exit(1)
  }
  console.log('\nPROHIBITED MECHANIC GATE: PASS (3 assertions held)')
  process.exit(0)
}

if (process.argv.includes('--self-test')) selfTest()
else run()
