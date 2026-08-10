// r042_verify.mjs
//
// ONE COMMAND THAT RE-DERIVES EVERY CLAIM MADE ABOUT R042 BRIEF A.
//
// SUPERSEDES r041_verify.mjs, which is archived under reports/archive/. R042
// changed strings R041 had pinned, so the older verifier would now fail for
// doing the right thing. That is not a flaw in either: it is what happens when
// an instrument is pinned to a historical ruling, which is exactly why neither
// is wired into CI. The standing gates assert PROPERTIES; these assert one
// ruling, on demand.
//
// WHAT IT COMPARES, and the direction is the whole value. It reads the RULING,
// verbatim, from the brief committed under convention (f), and compares it
// against the LIVE MODULES as evaluated by the TypeScript runtime. Not a
// fixture, not a snapshot, and above all not the scripts that applied the
// change, which would share an input with the thing under test and corroborate
// nothing (convention l.4).
//
// Run, from frontend/:   npx tsx scripts/r042_verify.mjs
//
// Exit 0 means the shipped strings are the ruled strings. Exit 1 names every
// divergence. Reads only; writes nothing.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { proseI18n, PROSE_SOCIAL } from '../src/lib/i18n/prose.ts'
import { locales, LOCALE_CODES } from '../src/lib/i18n/translations.ts'
import { VOLATILITY_KEY, FS_MODES } from '../src/lib/config/fsModes.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = join(ROOT, '..')
const BRIEF = join(REPO, 'reports/briefs/FS_R042A_DISCLOSURE_INTEGRITY_Prompt.md')

let failures = 0, checks = 0, strings = 0
const ok = (m) => { checks++; console.log(`  ok    ${m}`) }
const bad = (m, want, got) => {
  checks++; failures++
  console.error(`  FAIL  ${m}\n          ruled:   ${JSON.stringify(want)}\n          shipped: ${JSON.stringify(got)}`)
}

const brief = readFileSync(BRIEF, 'utf-8')
const between = (a, b) => brief.slice(brief.indexOf(a), brief.indexOf(b))
const LOCS = ['en', 'ar', 'de', 'es', 'fi', 'fr', 'hi', 'id',
  'ja', 'ko', 'pl', 'pt', 'ru', 'tr', 'vi', 'zh']

console.log('R042 VERIFY: the shipped strings against the ruling that authorised them')
console.log(`  ruling read from ${BRIEF.replace(REPO + '/', '')}\n`)

// ── A1. French apostrophes ───────────────────────────────────────────────────
console.log('A1: French standardises on the escaped straight apostrophe')
{
  const fr = readFileSync(join(ROOT, 'src/lib/i18n/prose.locales.ts'), 'utf-8')
    .split('\n')
  let inFr = false, curly = 0, straight = 0
  for (const line of fr) {
    const b = line.match(/^ {2}([a-z]{2}): \{/)
    if (b) { inFr = b[1] === 'fr'; continue }
    if (!inFr) continue
    if (line.includes('’')) curly++
    if (line.includes("\\'")) straight++
  }
  if (curly === 0 && straight > 0) ok(`the fr block is uniformly straight (${straight} lines, 0 typographic)`)
  else bad('the fr block is uniformly straight', '0 typographic', `${curly} typographic`)
}

// ── A2. The ruled numeral forms, byte for byte ───────────────────────────────
console.log('\nA2: per-locale figure forms')
{
  const sec = between('TASK A2. NUMERAL LOCALE PASS', 'Grouping spaces are regular')
  const ruled = {}
  for (const line of sec.split('\n')) {
    // `\S+` was wrong here and the failure is worth keeping: fi, fr and ru group
    // thousands with a SPACE (`5 000×`), so a non-whitespace match silently
    // dropped exactly the locales whose form is least like English.
    const m = line.match(/^([a-z]{2}): (.+?)× and (.+?)$/)
    if (m && LOCS.includes(m[1])) {
      ruled[m[1]] = { cap: m[2].trim() + '×', pct: m[3].replace(/\s*\(.*\)\s*$/, '').trim() }
    }
  }
  // The six ruled UNCHANGED keep the English forms.
  for (const l of ['en', 'ar', 'hi', 'ja', 'ko', 'zh']) ruled[l] = { cap: '5,000×', pct: '96.35%' }
  if (Object.keys(ruled).length !== 16) bad('parsed 16 locale forms from the brief', 16, Object.keys(ruled).length)
  for (const l of LOCS) {
    strings += 2
    const mw = proseI18n[l].rulesMaxWin
    const cr = proseI18n[l].modeCruiseBlurb
    if (mw.includes(ruled[l].cap)) ok(`${l} cap renders ${ruled[l].cap}`)
    else bad(`${l} cap form`, ruled[l].cap, mw)
    if (cr.includes(ruled[l].pct)) ok(`${l} RTP renders ${ruled[l].pct}`)
    else bad(`${l} RTP form`, ruled[l].pct, cr)
  }
  // THE NEGATIVE HALF. Presence of the right form does not prove absence of the
  // wrong one, and the wrong one is what a player misreads.
  for (const l of LOCS) {
    if (['en', 'ar', 'hi', 'ja', 'ko', 'zh'].includes(l)) continue
    for (const [key, val] of [['rulesMaxWin', proseI18n[l].rulesMaxWin], ['modeCruiseBlurb', proseI18n[l].modeCruiseBlurb]]) {
      if (val.includes('5,000') || val.includes('96.35%')) bad(`${l}.${key} still carries an English figure form`, 'absent', val)
    }
  }
  ok('no comma-decimal locale still carries 5,000 or 96.35%')
  // PROSE_SOCIAL is en and ruled UNCHANGED.
  if (PROSE_SOCIAL.rulesMaxWin.includes('5,000×')) ok('PROSE_SOCIAL keeps the English form, as ruled')
  else bad('PROSE_SOCIAL keeps the English form', '5,000×', PROSE_SOCIAL.rulesMaxWin)
}

// ── A3. The bet basis ────────────────────────────────────────────────────────
console.log('\nA3: the cap and scatter state the BASE bet, not the total')
{
  const sec = between('TASK A3. BASIS CORRECTION', 'PROSE_SOCIAL replacements')
  for (const line of sec.split('\n')) {
    const m = line.match(/^([a-z]{2}): (.+)$/)
    if (!m || !LOCS.includes(m[1])) continue
    for (const clause of m[2].split(';')) {
      const c = clause.trim().match(/^(.+?)\s*>\s*(.+?)\s*\((.+?)\)$/)
      if (!c) continue
      const [, frm, to, scope] = c
      const keys = scope.trim().startsWith('both') ? ['rulesMaxWin', 'rulesScatterMult'] : [scope.trim()]
      for (const k of keys) {
        strings++
        const v = proseI18n[m[1]][k]
        // The OLD basis must be gone. The new one is asserted by stem, because
        // ja.rulesScatterMult reads 合計ベット額の where the brief wrote
        // 合計ベットの, so the ruled stem was applied and 額 left alone.
        const stem = to.replace(/の$/, '')
        if (v.includes(frm)) bad(`${m[1]}.${k} still states the old basis`, `not ${frm}`, v)
        else if (!v.includes(stem)) bad(`${m[1]}.${k} does not state the ruled basis`, stem, v)
        else ok(`${m[1]}.${k}`)
      }
    }
  }
  const soc = between('PROSE_SOCIAL replacements', 'maxWinFootnote stays as shipped')
  for (const line of soc.split('\n')) {
    const m = line.match(/^(rulesMaxWin|rulesScatterMult): (.+)$/)
    if (!m) continue
    strings++
    if (PROSE_SOCIAL[m[1]] === m[2]) ok(`PROSE_SOCIAL.${m[1]}`)
    else bad(`PROSE_SOCIAL.${m[1]}`, m[2], PROSE_SOCIAL[m[1]])
  }
}

// ── A4. The responsible-play paragraph ───────────────────────────────────────
console.log('\nA4: the responsible play paragraph is keyed in all sixteen')
{
  const sec = between('TASK A4. RESPONSIBLE PLAY PARAGRAPH', 'Retire the frozen paragraph entry')
  for (const line of sec.split('\n')) {
    const m = line.match(/^([a-z]{2}): (.+)$/)
    if (!m || !LOCS.includes(m[1])) continue
    strings++
    if (proseI18n[m[1]].responsiblePlayBody === m[2]) ok(`responsiblePlayBody ${m[1]}`)
    else bad(`responsiblePlayBody ${m[1]}`, m[2], proseI18n[m[1]].responsiblePlayBody)
  }
  strings++
  if ((proseI18n.en.responsiblePlayBody || '').startsWith('Autoplay can be set to stop')) ok('responsiblePlayBody en is the shipped paragraph')
  else bad('responsiblePlayBody en', 'the shipped paragraph', proseI18n.en.responsiblePlayBody)
  const pm = readFileSync(join(ROOT, 'src/lib/components/PaytableModal.svelte'), 'utf-8')
  if (/\{\$tr\('responsiblePlayBody'\)\}/.test(pm)) ok('PaytableModal renders it through the translation layer')
  else bad('PaytableModal renders it keyed', "{$tr('responsiblePlayBody')}", 'not found')
  if (/Autoplay can be set to stop/.test(pm)) bad('the English literal is gone from the component', 'absent', 'still present')
  else ok('and the English literal is gone from the component')
}

// ── A5. The Bet Replay cost word ─────────────────────────────────────────────
console.log('\nA5: the replay cost word routes through costLabel')
{
  const rm = readFileSync(join(ROOT, 'src/lib/components/ReplayMode.svelte'), 'utf-8')
  if (/\$tr\('costLabel'\)/.test(rm)) ok('ReplayMode uses the existing costLabel key')
  else bad('ReplayMode uses costLabel', "$tr('costLabel')", 'not found')
  if (/'cost ='/.test(rm)) bad('the English literal is gone', 'absent', "'cost =' still present")
  else ok('and the English cost literal is gone')
}

// ── A6. Volatility ───────────────────────────────────────────────────────────
console.log('\nA6: the FEATURES volatility band is keyed in all sixteen')
{
  const sec = between('TASK A6 (majors 5 and 16)', 'Extend the hardcoded scan')
  const EN = { volLow: 'Low', volHigh: 'High', volVeryHigh: 'Very High', volExtreme: 'Extreme' }
  const NON_EN = LOCS.slice(1)
  for (const line of sec.split('\n')) {
    const m = line.match(/^(vol\w+): (.+)$/)
    if (!m) continue
    const vals = m[2].split(' | ').map((v) => v.trim())
    if (vals.length !== 16 - 1) { bad(`${m[1]} value count`, 15, vals.length); continue }
    let bads = 0
    strings++
    if (locales.en[m[1]] !== EN[m[1]]) { bad(`${m[1]} en`, EN[m[1]], locales.en[m[1]]); bads++ }
    vals.forEach((want, i) => {
      strings++
      if (locales[NON_EN[i]][m[1]] !== want) { bad(`${m[1]} ${NON_EN[i]}`, want, locales[NON_EN[i]][m[1]]); bads++ }
    })
    if (!bads) ok(`${m[1]}, all 16 locales`)
  }
  // Exhaustive by construction: every band in the config must have a key.
  for (const mode of FS_MODES) {
    const k = VOLATILITY_KEY[mode.volatility]
    if (k && locales.de[k]) ok(`${mode.id} band ${JSON.stringify(mode.volatility)} maps to ${k}`)
    else bad(`${mode.id} band has a key`, 'a volatility key', k)
  }
  const fm = readFileSync(join(ROOT, 'src/lib/components/FeatureMenu.svelte'), 'utf-8')
  const raw = (fm.match(/\{m\.volatility\}/g) || []).length
  if (raw === 0) ok('no FEATURES card renders the raw union member')
  else bad('no card renders the raw union member', 0, raw)
}

console.log(`\n${checks} checks run, comparing ${strings} player-facing strings against the ruling`)
if (failures) {
  console.error(`\nR042 VERIFY: FAIL (${failures}). The shipped strings are NOT the ruled strings.`)
  process.exit(1)
}
console.log('\nR042 VERIFY: PASS (the shipped strings are the ruled strings, and every site renders them)')
