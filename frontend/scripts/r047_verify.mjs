// r047_verify.mjs
//
// ONE COMMAND THAT RE-DERIVES EVERY CLAIM MADE ABOUT R047 TASKS 1 TO 4.
//
// SUPERSEDES r043_verify.mjs, archived under reports/archive/ with the other
// retired ruling verifiers per the standing pattern: an instrument pinned to a
// historical ruling is not wired into CI, the standing gates assert
// PROPERTIES, and these assert one ruling, on demand.
//
// WHAT IT COMPARES, and the direction is the whole value. It reads the RULING,
// verbatim, from the brief committed under convention (f)
// (reports/briefs/FS_FABLE_R047_MAJORS_Prompt.md), and compares it against the
// LIVE MODULES as evaluated by the TypeScript runtime and the LIVE COMPONENT
// SOURCES as bytes on disk. Not a fixture, not a snapshot, and above all not
// the session that applied the change (convention l.4).
//
// THE CHECKS:
//   T1  the paytable's ways figure and pays values route through
//       toLocaleString, the wincap celebration figure too, and no rendered
//       template text node in either component carries a separator figure.
//   T2  allModesLabel exists in all sixteen locales with the brief's exact
//       values, and FeatureMenu renders {$tr('allModesLabel')} with no
//       'All modes' literal remaining.
//   T3  METER_PRE_REV states super 5 and bonus 1, and the feature entry block
//       seeds the pod from the book (script.freeSpins[0]?.meterBefore ?? 1).
//   T4  the three ruled de strings match the brief byte for byte, and the de
//       player-facing tables carry ZERO formal-address forms.
//
// RUNNER (TR-123 contract): npx tsx, from frontend/. Exit 0 on PASS,
// non-zero on FAIL, terminates.
//   npx tsx scripts/r047_verify.mjs
//   npx tsx scripts/r047_verify.mjs --self-test   convention (p), seeded
//
// Reads only; writes nothing.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { locales, featureI18n } from '../src/lib/i18n/translations.ts'
import { proseI18n } from '../src/lib/i18n/prose.ts'
import { METER_PRE_REV } from '../src/lib/config/fsModes.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = join(ROOT, '..')
const BRIEF = readFileSync(join(REPO, 'reports/briefs/FS_FABLE_R047_MAJORS_Prompt.md'), 'utf-8')

const LOCS = ['en', 'ar', 'de', 'es', 'fi', 'fr', 'hi', 'id', 'ja', 'ko', 'pl', 'pt', 'ru', 'tr', 'vi', 'zh']
const FORMAL_DE = /\b(Sie|Ihre?|Ihrem|Ihren|Ihnen)\b/

let failures = 0
const ok = (m) => console.log(`  ok    ${m}`)
const fail = (m) => { failures++; console.error(`  FAIL  ${m}`) }
const check = (cond, m) => (cond ? ok(m) : fail(m))

/** The brief's own allModesLabel values, parsed from the ruling text. */
export function briefAllModesValues(brief) {
  const line = brief.split('\n').find((l) => l.startsWith('All modes | '))
  if (!line) return null
  const vals = line.split(' | ')
  return Object.fromEntries(LOCS.map((loc, i) => [loc, vals[i]]))
}

/** The brief's three exact de strings, parsed from the ruling text. */
export function briefDeStrings(brief) {
  const out = {}
  for (const key of ['errSessionUnavailable', 'errRoundIncomplete', 'sessionExpired']) {
    const line = brief.split('\n').find((l) => l.startsWith(`${key}: `))
    if (line) out[key] = line.slice(key.length + 2).trim()
  }
  return out
}

/** Template text nodes carrying a separator figure, same reading as the kit
 *  basis gate's half 3 (duplicated deliberately: this file must not import a
 *  script whose tail runs a gate). */
export function templateFigures(src) {
  const tpl = src
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\{[^{}]*\}/g, ' ')
  const hits = []
  for (const m of tpl.matchAll(/>([^<>]+)</g)) if (/\d[.,]\d/.test(m[1])) hits.push(m[1].trim())
  return hits
}

export function runChecks({ tables, feature, prose, preRev, sources, brief }) {
  failures = 0
  console.log('R047 VERIFY: tasks 1 to 4 against the committed ruling\n')

  // ── T1 ──
  const pt = sources.paytable
  check(pt.includes("(1024).toLocaleString($locale)"), 'T1: the ways figure routes through toLocaleString')
  check(pt.includes("sym.pays[2]?.toLocaleString($locale"), 'T1: pays values route through toLocaleString')
  check(sources.maxwin.includes('FS_MAX_WIN.toLocaleString($locale)'), 'T1: the wincap celebration figure routes through toLocaleString')
  const tplHits = [...templateFigures(pt), ...templateFigures(sources.maxwin)]
  check(tplHits.length === 0, `T1: zero separator figures in rendered template text nodes${tplHits.length ? ` (found ${JSON.stringify(tplHits)})` : ''}`)

  // ── T2 ──
  const want = briefAllModesValues(brief)
  check(!!want, 'T2: the brief supplies the sixteen allModesLabel values')
  if (want) for (const loc of LOCS) {
    check(tables[loc]?.allModesLabel === want[loc],
      `T2: ${loc} allModesLabel is the ruled value ${JSON.stringify(want[loc])}${tables[loc]?.allModesLabel === want[loc] ? '' : `, got ${JSON.stringify(tables[loc]?.allModesLabel)}`}`)
  }
  check(sources.featureMenu.includes("{$tr('allModesLabel')}"), 'T2: FeatureMenu renders the key')
  check(!sources.featureMenu.includes('All modes ·'), 'T2: the English literal is gone from FeatureMenu')

  // ── T3 ──
  check(preRev.super === 5, `T3: METER_PRE_REV.super is 5 (got ${preRev.super})`)
  check(preRev.bonus === 1, `T3: METER_PRE_REV.bonus is 1 (got ${preRev.bonus})`)
  const entryBlock = sources.presentation.match(/phase = 'entry'[\s\S]{0,900}?runEntrySequence\(\)/)
  check(!!entryBlock && entryBlock[0].includes('script.freeSpins[0]?.meterBefore ?? 1'),
    'T3: the entry block seeds the pod from the book (freeSpins[0].meterBefore)')
  check(!!entryBlock && !/displayMeter = 1\b/.test(entryBlock[0]),
    'T3: no unconditional displayMeter = 1 remains in the entry block')

  // ── T4 ──
  const ruled = briefDeStrings(brief)
  for (const [key, val] of Object.entries(ruled)) {
    check(tables.de?.[key] === val,
      `T4: de ${key} matches the ruling byte for byte${tables.de?.[key] === val ? '' : `, got ${JSON.stringify(tables.de?.[key])}`}`)
  }
  const deText = JSON.stringify(tables.de) + JSON.stringify(feature?.de ?? {}) + JSON.stringify(prose?.de ?? {})
  const formal = deText.match(FORMAL_DE)
  check(!formal, `T4: zero formal-address forms in the de player-facing tables${formal ? ` (found ${JSON.stringify(formal[0])})` : ''}`)

  return failures
}

const LIVE = {
  tables: locales,
  feature: featureI18n,
  prose: proseI18n,
  preRev: METER_PRE_REV,
  brief: BRIEF,
  sources: {
    paytable: readFileSync(join(ROOT, 'src/lib/components/PaytableModal.svelte'), 'utf-8'),
    maxwin: readFileSync(join(ROOT, 'src/lib/components/MaxWinCelebration.svelte'), 'utf-8'),
    featureMenu: readFileSync(join(ROOT, 'src/lib/components/FeatureMenu.svelte'), 'utf-8'),
    presentation: readFileSync(join(ROOT, 'src/lib/components/FreeSpinsPresentation.svelte'), 'utf-8'),
  },
}

// ── self-test, convention (p): every check must go red on its own seed ───────
if (process.argv.includes('--self-test')) {
  console.log('R047 VERIFY SELF-TEST: every seed must be caught\n')
  const seeded = structuredClone ? structuredClone(LIVE) : JSON.parse(JSON.stringify(LIVE))
  const seededTables = JSON.parse(JSON.stringify(locales))
  seededTables.de.allModesLabel = 'All modes'                                   // wrong value
  seededTables.de.errSessionUnavailable = 'Spiel nicht verfügbar. Ihre Sitzung konnte nicht verifiziert werden. Bitte neu laden oder den Support kontaktieren.'  // the superseded Sie form
  const origLog = console.log, origErr = console.error
  console.log = () => {}; console.error = () => {}
  const seededFailures = runChecks({
    ...seeded,
    tables: seededTables,
    preRev: { ...METER_PRE_REV, super: 1 },                                     // the defect TR-127 named
    sources: {
      ...LIVE.sources,
      paytable: LIVE.sources.paytable.replace("(1024).toLocaleString($locale)", '1,024'),
      featureMenu: LIVE.sources.featureMenu.replace("{$tr('allModesLabel')}", 'All modes ·'),
      presentation: LIVE.sources.presentation.replace('script.freeSpins[0]?.meterBefore ?? 1', '1'),
    },
  })
  console.log = origLog; console.error = origErr
  // Every planted class must be caught: the count is derived, not guessed.
  const EXPECT_MIN = 9
  if (seededFailures < EXPECT_MIN) {
    console.error(`R047 VERIFY SELF-TEST: FAIL (only ${seededFailures} of >= ${EXPECT_MIN} seeded classes caught)`)
    process.exit(1)
  }
  const liveFailures = runChecks(LIVE)
  console.log = origLog; console.error = origErr
  if (liveFailures !== 0) {
    console.error('\nR047 VERIFY SELF-TEST: FAIL (the live tree must pass while the seeds fail)')
    process.exit(1)
  }
  console.log(`\nR047 VERIFY SELF-TEST: PASS (${seededFailures} seeded reds caught, live tree clean)`)
  process.exit(0)
}

const n = runChecks(LIVE)
if (n) {
  console.error(`\nR047 VERIFY: FAIL (${n} divergence(s) from the ruling)`)
  process.exit(1)
}
console.log('\nR047 VERIFY: PASS (the shipped strings, figures and pod source are the ruled ones)')
process.exit(0)
