// r041_verify.mjs
//
// ONE COMMAND THAT RE-DERIVES EVERY CLAIM MADE ABOUT R041's EXECUTION.
//
// WHY THIS EXISTS. The session that executed Fable ruling block R041 asserted, in
// a commit message and a report, that 210 player-facing strings match the ruling
// exactly. A reader has no way to check that short of comparing 210 strings by
// hand, and "the builder says so" is precisely the standard this project does not
// accept anywhere else. So the claim is made checkable instead of merely stated.
//
// WHAT IT COMPARES, and why the direction matters. It reads the RULING, verbatim,
// from the brief committed under convention (f), and compares it against the
// LIVE MODULES as evaluated by the TypeScript runtime. Not against a fixture, not
// against a snapshot, and not against the script that applied the change: those
// would all share an input with the thing under test, which convention (l.4)
// warns is not corroboration at all. The authority and the artefact are genuinely
// independent inputs, and this is the one comparison that means anything.
//
// It also verifies the ELEVEN REWIRES, because a translated key that no component
// calls is not a fix. Each site is asserted to render through the translation
// layer rather than a literal.
//
// Run, from frontend/:
//   npx tsx scripts/r041_verify.mjs
//
// Exit 0 means the shipped strings are the ruled strings. Exit 1 names every
// divergence. Reads only; writes nothing.
//
// DELIBERATELY NOT IN CI, and the reason is the lesson R041 itself taught twice.
// This pins the strings to ONE HISTORICAL RULING. A later ruling that legitimately
// rewords any of them would make this go red for doing the right thing, and the
// only way to quiet it would be to edit the committed brief, which convention (f)
// forbids: a brief is the evidence for the session that executed it and is never
// tidied. Two seeded self-tests were disarmed on 2026-08-10 by exactly this shape
// of coupling, an assertion anchored to prose that was free to change. So this is
// an ON-DEMAND verification instrument for R041, run when someone wants to check
// the claim, not a standing gate. The standing gates are the ones that assert
// PROPERTIES rather than particular sentences: locale completeness, the hardcoded
// string ratchet, the machine tell scan and paytable parity.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { proseI18n, PROSE_SOCIAL } from '../src/lib/i18n/prose.ts'
import { locales, LOCALE_CODES, t } from '../src/lib/i18n/translations.ts'
import { sv } from '../src/lib/i18n/vocabulary.ts'
import { liveGuardMessageKey } from '../src/lib/stores/liveGuard.ts'
import { liveGuardReason } from '../src/lib/stores/liveGuard.ts'
import { get } from 'svelte/store'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = join(ROOT, '..')
const BRIEF = join(REPO, 'reports/briefs/FS_R041_FABLE_RULINGS_Prompt.md')

let failures = 0
let checks = 0
// Counted separately from `checks` on purpose. TASK 4 reports one line per KEY
// covering sixteen values, so a bare check count understates coverage by an order
// of magnitude, and an understated number in a verification report is its own
// small dishonesty.
let strings = 0
const ok = (m) => { checks++; console.log(`  ok    ${m}`) }
const bad = (m, want, got) => {
  checks++; failures++
  console.error(`  FAIL  ${m}\n          ruling: ${JSON.stringify(want)}\n          shipped: ${JSON.stringify(got)}`)
}

const brief = readFileSync(BRIEF, 'utf-8')
const between = (a, b) => brief.slice(brief.indexOf(a), brief.indexOf(b))
const LOCS = ['en', 'ar', 'de', 'es', 'fi', 'fr', 'hi', 'id',
  'ja', 'ko', 'pl', 'pt', 'ru', 'tr', 'vi', 'zh']

console.log('R041 VERIFY: the shipped strings against the ruling that authorised them')
console.log(`  ruling read from ${BRIEF.replace(REPO + '/', '')}\n`)

// ── 1. TASK 1 and TASK 2, the two rules sentences in sixteen locales ─────────
console.log('TASK 1 and 2: the cap and the scatter, 16 locales plus the social table')
for (const [head, tail, key] of [
  ['TASK 1. Q1 CAP WORDING', 'TASK 2. Q2 SCATTER', 'rulesMaxWin'],
  ['TASK 2. Q2 SCATTER', 'TASK 3. Q4 NEW BANNER', 'rulesScatterMult'],
]) {
  const sec = between(head, tail)
  for (const line of sec.split('\n')) {
    const m = line.match(/^([a-z]{2}): (.+)$/)
    if (!m || !LOCS.includes(m[1])) continue
    const got = proseI18n[m[1]]?.[key]
    strings++
    if (got === m[2]) ok(`${key} ${m[1]}`)
    else bad(`${key} ${m[1]}`, m[2], got)
  }
  // The indented lines: TASK 1 carries en and PROSE_SOCIAL, TASK 2 only social
  // (its en sits on an unindented line already covered above).
  const ind = [...sec.matchAll(new RegExp(`^  ${key}: (.+)$`, 'gm'))].map((x) => x[1])
  strings += key === 'rulesMaxWin' ? 2 : 1
  if (key === 'rulesMaxWin') {
    if (proseI18n.en[key] === ind[0]) ok(`${key} en`); else bad(`${key} en`, ind[0], proseI18n.en[key])
    if (PROSE_SOCIAL[key] === ind[1]) ok(`${key} PROSE_SOCIAL`); else bad(`${key} PROSE_SOCIAL`, ind[1], PROSE_SOCIAL[key])
  } else {
    if (PROSE_SOCIAL[key] === ind[0]) ok(`${key} PROSE_SOCIAL`); else bad(`${key} PROSE_SOCIAL`, ind[0], PROSE_SOCIAL[key])
  }
}

// ── 2. TASK 3, the new banner key ────────────────────────────────────────────
console.log('\nTASK 3: errRoundIncomplete, 16 locales')
for (const line of between('TASK 3. Q4 NEW BANNER', 'TASK 4. Q3 UNTRANSLATED').split('\n')) {
  const m = line.match(/^([a-z]{2}): (.+)$/)
  if (!m || !LOCS.includes(m[1])) continue
  const got = locales[m[1]].errRoundIncomplete
  strings++
  if (got === m[2]) ok(`errRoundIncomplete ${m[1]}`)
  else bad(`errRoundIncomplete ${m[1]}`, m[2], got)
}

// ── 3. TASK 4, ten keys in sixteen locales ───────────────────────────────────
console.log('\nTASK 4: ten keys, 16 locales each')
for (const line of between('TASK 4. Q3 UNTRANSLATED', 'Recorded decisions:').split('\n')) {
  if (!line.includes('|') || !/^[a-zA-Z]/.test(line)) continue
  const [rawName, , rest] = [line.slice(0, line.indexOf(':')), 0, line.slice(line.indexOf(':') + 1)]
  const name = rawName.replace(/\s*\(.*?\)\s*$/, '').trim()
  if (!/^[a-zA-Z]+$/.test(name)) continue
  const vals = rest.split(' | ').map((v) => v.trim())
  if (vals.length !== 16) { bad(`${name}: value count`, 16, vals.length); continue }
  let badHere = 0
  vals.forEach((want, i) => {
    strings++
    const got = locales[LOCS[i]][name]
    if (got !== want) { bad(`${name} ${LOCS[i]}`, want, got); badHere++ }
  })
  if (!badHere) ok(`${name}, all 16 locales`)
}

// ── 4. The composed behaviour, not just the stored strings ───────────────────
//
// A correct string in a table proves nothing about what a player reads. These are
// the three compositions the ruling actually specified, evaluated for real.
console.log('\nComposed output: what a player would actually see')
const cases = [
  ['social betUnit renders the platform replacement', sv(t('en', 'betUnit', 'social'), true), 'play'],
  ['social baseBetUnit likewise', sv(t('en', 'baseBetUnit', 'social'), true), 'base play'],
  ['real-money de betUnit stays translated', sv(t('de', 'betUnit', 'real'), false), locales.de.betUnit],
  ['sv never mangles a translated word', sv('Einsatz', true), 'Einsatz'],
  ['waysCount interpolates {n}', t('de', 'waysCount', 'real', { n: 243 }), locales.de.waysCount.replace('{n}', '243')],
]
for (const [name, got, want] of cases) {
  if (got === want) ok(`${name}: ${JSON.stringify(got)}`)
  else bad(name, want, got)
}

// ── 5. The banner map, which is the whole of Q4 ──────────────────────────────
console.log('\nQ4: the blocked session names the cause that actually happened')
for (const [reason, key] of [
  ['settle-failed', 'errRoundIncomplete'],
  ['wallet-stalled', 'errRoundIncomplete'],
  ['auth-failed', 'errSessionUnavailable'],
  ['missing-params', 'errSessionUnavailable'],
]) {
  liveGuardReason.set(reason)
  const got = get(liveGuardMessageKey)
  if (got === key) ok(`${reason} renders ${key}`)
  else bad(`${reason} renders the right key`, key, got)
}
liveGuardReason.set(null)

// ── 6. THE REWIRES. A translated key nothing calls is not a fix. ─────────────
console.log('\nThe eleven rewires: every site renders through the translation layer')
const SITES = [
  ['HudOverlay.svelte', /\$tr\('ctrlUnmute'\)\s*:\s*\$tr\('ctrlMute'\)/, 'the audio toggle is keyed', 4],
  ['FeatureMenu.svelte', /sv\(\$tr\('betUnit'\), \$isSocial\)/, 'the cost unit routes through sv()', 2],
  ['FeatureMenu.svelte', /sv\(\$tr\('perSpinWhileOn'\), \$isSocial\)/, 'the OVERBOOST effect line is keyed', 1],
  ['PaytableModal.svelte', /\$tr\('colScatters'\)/, 'the scatter column header is keyed', 1],
  ['ReplayMode.svelte', /\$tr\('replayModeLabel'\)/, 'the replay mode label is keyed', 1],
  ['ReplayMode.svelte', /\$tr\('replayBetLabel'\)/, 'the replay bet label is keyed', 1],
  ['ReplayMode.svelte', /\$tr\('replayCurrencyLabel'\)/, 'the replay currency label is keyed', 1],
  ['FreeSpinsPresentation.svelte', /aria-label=\{t\(lang, 'overdriveFreeSpins', mode\)\}/, 'the free-spins aria-label is keyed', 1],
  ['WinBreakdown.svelte', /\$tr\('waysCount', \{ n: current\.ways \}\)/, 'the ways count is keyed and interpolated', 1],
]
for (const [file, re, why, want] of SITES) {
  const src = readFileSync(join(ROOT, 'src/lib/components', file), 'utf-8')
  const n = (src.match(new RegExp(re.source, 'g')) || []).length
  if (n === want) ok(`${file}: ${why} (${n} site${n > 1 ? 's' : ''})`)
  else bad(`${file}: ${why}`, `${want} site(s)`, `${n} site(s)`)
}
{
  const src = readFileSync(join(ROOT, 'src/lib/config/fsModes.ts'), 'utf-8')
  if (/t\(\(locale \?\? 'en'\) as Locale, 'baseBetUnit'\)/.test(src)) ok('fsModes.ts: the max-win footnote unit is keyed')
  else bad('fsModes.ts: the max-win footnote unit is keyed', 'a t() call for baseBetUnit', 'not found')
}

// ── 7. THE OLD WORDING MUST BE GONE, in every locale, not merely replaced ────
console.log('\nThe superseded wording is absent from every locale')
{
  const OLD_EN = ['Maximum win per spin', 'multiplier to your total bet win', 'Maximum prize per play']
  let found = 0
  for (const l of LOCALE_CODES) {
    for (const k of ['rulesMaxWin', 'rulesScatterMult']) {
      const v = proseI18n[l][k]
      for (const o of OLD_EN) if (v.includes(o)) { bad(`${l}.${k} still carries superseded text`, 'absent', o); found++ }
    }
  }
  for (const o of OLD_EN) {
    for (const k of ['rulesMaxWin', 'rulesScatterMult']) {
      if ((PROSE_SOCIAL[k] ?? '').includes(o)) { bad(`PROSE_SOCIAL.${k} still carries superseded text`, 'absent', o); found++ }
    }
  }
  if (!found) ok('no locale and no social variant carries any superseded sentence')
}

console.log(`\n${checks} checks run, comparing ${strings} player-facing strings against the ruling`)
if (failures) {
  console.error(`\nR041 VERIFY: FAIL (${failures}). The shipped strings are NOT the ruled strings.`)
  process.exit(1)
}
console.log('\nR041 VERIFY: PASS (the shipped strings are the ruled strings, and every site renders them)')
