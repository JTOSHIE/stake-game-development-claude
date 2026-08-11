// SUPERSEDED 2026-08-11 by frontend/scripts/r047_verify.mjs, per R047 TASK 8.
// R047 changed strings and sources adjacent to the set this file pins (the de
// register moved to du, the paytable figures now route through toLocaleString,
// FeatureMenu's footer gained allModesLabel); its own checks still passed at
// the moment of retirement, and it is archived rather than deleted because it
// is the record of what R043 shipped, moved out of frontend/scripts/ so nobody
// runs it expecting a verdict on the current tree.
//
// r043_verify.mjs
//
// ONE COMMAND THAT RE-DERIVES EVERY CLAIM MADE ABOUT R043 PHASE 1.
//
// SUPERSEDES r042_verify.mjs, which is archived under reports/archive/ with the
// other retired ruling verifiers. R043 changed strings R042 had pinned
// (rulesOverdriveModes carried figures A2 forms applied to; Phase 1 replaces
// the whole strings), so the older verifier retires per the standing pattern:
// an instrument pinned to a historical ruling is not wired into CI, the
// standing gates assert PROPERTIES, and these assert one ruling, on demand.
//
// WHAT IT COMPARES, and the direction is the whole value. It reads the RULING,
// verbatim, from the brief committed under convention (f)
// (reports/briefs/FS_R043_MEGA_CLOSEOUT_Prompt.md), and compares it against
// the LIVE MODULES as evaluated by the TypeScript runtime. Not a fixture, not
// a snapshot, and above all not the script that applied the change, which
// would share an input with the thing under test and corroborate nothing
// (convention l.4).
//
// Run, from frontend/:   npx tsx scripts/r043_verify.mjs
//                        npx tsx scripts/r043_verify.mjs --self-test
//
// The self-test (convention p) re-runs every check against seeded copies of
// the live tables carrying the exact superseded strings this ruling removed,
// and fails unless every seed is caught.
//
// Exit 0 means the shipped strings are the ruled strings. Exit 1 names every
// divergence. Reads only; writes nothing.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { featureI18n, SOCIAL_OVERRIDES } from '../src/lib/i18n/translations.ts'
import { proseI18n } from '../src/lib/i18n/prose.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = join(ROOT, '..')
const BRIEF = join(REPO, 'reports/briefs/FS_R043_MEGA_CLOSEOUT_Prompt.md')

const LOCS = ['en', 'ar', 'de', 'es', 'fi', 'fr', 'hi', 'id',
  'ja', 'ko', 'pl', 'pt', 'ru', 'tr', 'vi', 'zh']
const COMMA_DECIMAL = ['de', 'es', 'fi', 'fr', 'id', 'pl', 'pt', 'ru', 'tr', 'vi']

const brief = readFileSync(BRIEF, 'utf-8')
const between = (a, b) => brief.slice(brief.indexOf(a), brief.indexOf(b))
const unwrap = (s) => s.replace(/\n/g, ' ').trim()

// ── The ruled content, parsed from the brief ─────────────────────────────────

// 1a: the exact English sentence (wrapped across two lines in the brief).
const RULED_EN_TRIGGER = unwrap(
  between('en becomes exactly: ', '\nNon-English:').slice('en becomes exactly: '.length))

// 1a: the fifteen A3 target phrases, in the brief's own parenthesised order.
// The order is positional and this array is its key, transcribed once.
const A3_ORDER = ['de', 'es', 'fr', 'ja', 'ko', 'pl', 'pt', 'ru', 'tr', 'vi', 'zh', 'ar', 'id', 'fi', 'hi']
const A3_PHRASES = unwrap(
  between('apply the ratified A3 substitution table (', ') to this key')
    .slice('apply the ratified A3 substitution table ('.length)).split(', ')

/**
 * The check stems. Three locales apply the ruled STEM per the brief's own
 * Japanese precedent (stem swapped, suffix untouched), because the A3 target
 * phrase carries a possessive the shipped sentence never had:
 *   tr  the brief itself writes 'temel bahsinizin stem'; bahsinizin carries
 *       the your-suffix, the shipped sentence reads 'temel bahsin'
 *   fi  peruspanoksesi is the possessive; the shipped elative is
 *       peruspanoksesta, so the shared stem is peruspanoks
 *   ar  رهانك الأساسي carries the your-suffix on the noun; the shipped form is
 *       الرهان الأساسي, so the ruled basis word الأساسي is the stem
 * Every stem application is recorded in the R043 session report as the brief
 * requires.
 */
const STEM_OVERRIDES = { tr: 'temel bahsin', fi: 'peruspanoks', ar: 'الأساسي' }

/**
 * The superseded basis stems that must be ABSENT from rulesOverdriveTrigger.
 * Not ruled content: these are the pre-R043 shipped phrases, quoted in
 * OWNER_RULINGS_PRESUBMISSION.md section K and visible at
 * `git show ce252a8:frontend/src/lib/i18n/translations.ts`. Key-scoped, so
 * legitimate uses elsewhere (the RG cumulative label, totalWin) do not match.
 */
const OLD_BASIS = {
  en: 'total bet', ar: 'إجمالي', de: 'Gesamteinsatz', es: 'apuesta total',
  fi: 'kokonaispanos', fr: 'mise totale', hi: 'कुल दांव', id: 'total taruhan',
  ja: '合計ベット', ko: '총 베팅액', pl: 'całkowi', pt: 'aposta total',
  ru: 'общей ставки', tr: 'toplam bahsin', vi: 'tổng', zh: '总投注',
}

// 1c: sixteen whole strings plus the social line.
const RULED_MODES = {}
for (const line of between('1c. MAJOR 12', '\nSocial (en):').split('\n')) {
  const m = line.match(/^([a-z]{2}): (.+)$/)
  if (m && LOCS.includes(m[1])) RULED_MODES[m[1]] = m[2]
}
const RULED_MODES_SOCIAL = brief.match(/^Social \(en\): (.+)$/m)[1]

// 1d: sixteen insertions. The leading space is part of the ruled text where
// present (the CJK insertions open with a full-width parenthesis instead).
const RULED_METER_INS = {}
for (const line of between('1d. MAJOR 13', '\n1e. KIT BASIS GATE').split('\n')) {
  const m = line.match(/^([a-z]{2}): (.+)$/)
  if (m && LOCS.includes(m[1])) RULED_METER_INS[m[1]] = m[2]
}
// The brief writes the insertion for most locales with a leading space after
// 'xx: ' (two spaces total); the regex above consumes one, keeping the space
// that belongs to the ruled text.

// The starting-value token the insertion must directly follow, per locale.
const METER_ANCHOR = Object.fromEntries(LOCS.map((l) => [l,
  l === 'ja' ? '1倍' : l === 'zh' ? '1 倍' : '1×']))

// ── The checks, parameterised so the self-test can seed the tables ───────────

function runChecks(feature, prose, social, log) {
  const fails = []
  const ok = (m) => log && console.log(`  ok    ${m}`)
  const bad = (m, want, got) => {
    fails.push(m)
    if (log) console.error(`  FAIL  ${m}\n          ruled:   ${JSON.stringify(want)}\n          shipped: ${JSON.stringify(got)}`)
  }

  // 1a
  if (feature.en.rulesOverdriveTrigger === RULED_EN_TRIGGER) ok('1a en trigger is the ruled sentence, byte for byte')
  else bad('1a en trigger', RULED_EN_TRIGGER, feature.en.rulesOverdriveTrigger)
  A3_ORDER.forEach((l, i) => {
    const phrase = A3_PHRASES[i]
    const stem = STEM_OVERRIDES[l] ?? phrase
    const v = feature[l].rulesOverdriveTrigger
    if (v.includes(OLD_BASIS[l])) bad(`1a ${l} trigger still states the old basis`, `not ${OLD_BASIS[l]}`, v)
    else if (!v.includes(stem)) bad(`1a ${l} trigger does not state the ruled basis`, stem, v)
    else ok(`1a ${l} trigger states ${stem}`)
  })
  const st = social.rulesOverdriveTrigger
  if (st.includes('base play') && !st.includes('total play')) ok('1a social trigger moves to base play')
  else bad('1a social trigger', 'base play, no total play', st)

  // 1b
  for (const l of COMMA_DECIMAL) {
    const v = prose[l].modeOverboostBlurb
    if (v.includes('1,6×') && v.includes('1,25×') && !v.includes('1.6') && !v.includes('1.25')) ok(`1b ${l} renders 1,6 and 1,25`)
    else bad(`1b ${l} modeOverboostBlurb`, '1,6× and 1,25×, no en forms', v)
  }
  for (const l of ['en', 'ar', 'hi', 'ja', 'ko', 'zh']) {
    const v = prose[l].modeOverboostBlurb
    if (v.includes('1.6') && v.includes('1.25')) ok(`1b ${l} keeps the en forms, as ruled`)
    else bad(`1b ${l} modeOverboostBlurb keeps 1.6 and 1.25`, '1.6 and 1.25', v)
  }

  // 1c
  for (const l of LOCS) {
    if (feature[l].rulesOverdriveModes === RULED_MODES[l]) ok(`1c ${l} modes is the ruled string`)
    else bad(`1c ${l} modes`, RULED_MODES[l], feature[l].rulesOverdriveModes)
  }
  if (social.rulesOverdriveModes === RULED_MODES_SOCIAL) ok('1c social modes is the ruled string')
  else bad('1c social modes', RULED_MODES_SOCIAL, social.rulesOverdriveModes)

  // 1d: the insertion is present AND sits directly after the starting token.
  for (const l of LOCS) {
    const v = feature[l].rulesOverdriveMeter
    const ins = RULED_METER_INS[l]
    const at = v.indexOf(ins)
    if (at === -1) { bad(`1d ${l} meter carries the ruled qualification`, ins, v); continue }
    const anchor = METER_ANCHOR[l]
    if (v.slice(0, at).endsWith(anchor)) ok(`1d ${l} qualification directly follows the starting ${anchor}`)
    else bad(`1d ${l} qualification position`, `directly after the first ${anchor}`, v)
  }
  const sm = social.rulesOverdriveMeter
  if (sm.includes(RULED_METER_INS.en)) ok('1d social meter carries the en qualification')
  else bad('1d social meter', RULED_METER_INS.en, sm)

  return fails
}

// ── Structural checks on the instruments themselves ──────────────────────────

function instrumentChecks(log) {
  const fails = []
  const ok = (m) => log && console.log(`  ok    ${m}`)
  const bad = (m) => { fails.push(m); if (log) console.error(`  FAIL  ${m}`) }

  // 1b's second direction: the machine_tell freeze retired WITH the fix.
  const gate = readFileSync(join(ROOT, 'scripts/machine_tell_gate.mjs'), 'utf-8')
  if (/const KNOWN_EN_FORM_FIGURE = new Map\(\[\]\)/.test(gate)) ok('1b the machine_tell KNOWN_EN_FORM_FIGURE freeze is retired (empty map)')
  else bad('1b the machine_tell KNOWN_EN_FORM_FIGURE freeze is retired')

  // 1e: the kit basis gate exists and ships its seeded self-test.
  let kb = ''
  try { kb = readFileSync(join(ROOT, 'scripts/kit_basis_gate.mjs'), 'utf-8') } catch {}
  if (kb.includes("process.argv.includes('--self-test')") && kb.includes('SUPERSEDED_BASIS')) ok('1e kit_basis_gate.mjs exists with a seeded self-test')
  else bad('1e kit_basis_gate.mjs exists with a seeded self-test')

  return fails
}

// ── self-test: seed the exact superseded strings, prove every class is caught ─
if (process.argv.includes('--self-test')) {
  const feature = structuredClone(featureI18n)
  const prose = structuredClone(proseI18n)
  const social = structuredClone(SOCIAL_OVERRIDES)
  // The four seeds are the pre-R043 shipped strings themselves, from
  // `git show ce252a8:frontend/src/lib/i18n/translations.ts` and the
  // pre-1b prose layer, not invented examples of the class.
  feature.de.rulesOverdriveTrigger = '3, 4 oder 5 Scatter vergeben 8, 12 oder 16 Freispiele und zahlen sofort 1×, 3× oder 10× des Gesamteinsatzes.'
  prose.fr.modeOverboostBlurb = 'Double chance : environ 1.6× le taux de déclenchement. Débite 1.25× par tour tant que le mode est ON.'
  feature.ja.rulesOverdriveModes = 'ベースゲームとボーナス購入はどちらもRTP96.35%です。最大配当はベットの5,000倍。'
  feature.en.rulesOverdriveMeter = 'The Overdrive meter starts at 1× and rises +1× after every winning free spin, multiplying all later wins. It never resets during the feature.'

  const fails = runChecks(feature, prose, social, false)
  const want = ['1a de trigger', '1b fr modeOverboostBlurb', '1c ja modes', '1d en meter']
  let missed = 0
  for (const w of want) {
    const hit = fails.some((f) => f.startsWith(w))
    console.log(`  ${hit ? 'caught ' : 'MISSED '} seeded ${w}`)
    if (!hit) missed++
  }
  // Negative control: the live tables must be clean.
  const live = runChecks(featureI18n, proseI18n, SOCIAL_OVERRIDES, false)
  const clean = live.length === 0
  console.log(`  ${clean ? 'clean  ' : 'FALSE+ '} the live tables pass every check`)
  if (missed || !clean) {
    console.error('\nR043 VERIFY SELF-TEST: FAIL')
    process.exit(1)
  }
  console.log('\nR043 VERIFY SELF-TEST: PASS (4 seeded violations caught, live tables clean)')
  process.exit(0)
}

// ── the real run ─────────────────────────────────────────────────────────────
console.log('R043 VERIFY: the shipped strings against the ruling that authorised them')
console.log(`  ruling read from ${BRIEF.replace(REPO + '/', '')}\n`)

if (A3_PHRASES.length !== 15) {
  console.error(`FAIL: parsed ${A3_PHRASES.length} A3 phrases from the brief, expected 15`)
  process.exit(1)
}
if (Object.keys(RULED_MODES).length !== 16 || Object.keys(RULED_METER_INS).length !== 16) {
  console.error(`FAIL: parsed ${Object.keys(RULED_MODES).length} modes strings and `
    + `${Object.keys(RULED_METER_INS).length} meter insertions from the brief, expected 16 of each`)
  process.exit(1)
}

const fails = [
  ...runChecks(featureI18n, proseI18n, SOCIAL_OVERRIDES, true),
  ...instrumentChecks(true),
]

const checks = 16 + 16 + 1 + 16 + 16 + 1 + 16 + 1 + 2 + 2
console.log(`\n${checks} checks run against the ruling`)
if (fails.length) {
  console.error(`\nR043 VERIFY: FAIL (${fails.length}). The shipped strings are NOT the ruled strings.`)
  process.exit(1)
}
console.log('\nR043 VERIFY: PASS (the shipped strings are the ruled strings, and every site renders them)')
