// locale_completeness_check.mjs - R24 (2026-07-27).
//
// Two static gates that together kill the untranslated-string class:
//
//   1. COMPLETENESS. Every key declared in the `Translations` interface exists in
//      ALL sixteen locale objects. A key added to `en` and forgotten elsewhere is
//      a build-time failure rather than a Japanese player seeing English.
//
//   2. NO NEW HARDCODED PLAYER STRINGS. Component markup must not contain
//      uppercase player-facing literals. This is what let 18 strings render
//      English in fifteen locales: the keys did not exist, so nobody noticed the
//      components were not asking for them.
//
// Static, no browser, no dev server: CI-safe.
//
// Run (from frontend/): node scripts/locale_completeness_check.mjs

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')
const SRC = readFileSync(join(ROOT, 'src/lib/i18n/translations.ts'), 'utf-8')

const failures = []

// ── Gate 1: every interface key present in every locale ──────────────────────
const ifaceMatch = SRC.match(/export interface Translations \{([\s\S]*?)\n\}/)
if (!ifaceMatch) {
  failures.push({ gate: 'completeness', detail: 'could not locate the Translations interface' })
}
const required = ifaceMatch
  ? [...ifaceMatch[1].matchAll(/^\s+(\w+)(\??):\s+string/gm)]
      .filter((m) => m[2] !== '?')      // optional keys are optional by design
      .map((m) => m[1])
  : []

const localeBlocks = [...SRC.matchAll(/\nconst (\w{2}): Translations = \{/g)]
const socIdx = SRC.indexOf('\nexport const SOCIAL_OVERRIDES')

const locales = []
localeBlocks.forEach((m, i) => {
  const start = m.index
  const end = i + 1 < localeBlocks.length ? localeBlocks[i + 1].index : socIdx
  const body = SRC.slice(start, end)
  // Accept BOTH quote styles and values that begin on a continuation line.
  // The first version of this gate matched only `key: '...'` and therefore
  // reported French as missing two keys whose values are DOUBLE-quoted because
  // they contain apostrophes ("Ce jeu n'est pas disponible..."). French was
  // complete; the gate was wrong. A gate that cries wolf gets ignored, so it
  // now matches key/value pairs regardless of quoting or line breaks.
  const present = new Set([...body.matchAll(/^\s+(\w+):\s*(?:'|"|\n\s*['"])/gm)].map((x) => x[1]))
  locales.push({ code: m[1], present })
})

console.log(`LOCALE COMPLETENESS: ${required.length} required keys x ${locales.length} locales`)

if (locales.length !== 16) {
  failures.push({ gate: 'completeness', detail: `expected 16 locales, found ${locales.length}` })
}

for (const { code, present } of locales) {
  const missing = required.filter((k) => !present.has(k))
  if (missing.length) {
    failures.push({
      gate: 'completeness',
      detail: `locale '${code}' is missing ${missing.length} key(s): ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ', ...' : ''}`,
    })
  }
}

// ── Gate 2: no new hardcoded player-facing literals in component markup ──────
// Allowlisted, with the reason each is exempt. Anything not on this list that
// looks like a player-facing uppercase literal fails the gate.
const ALLOW = new Set([
  'RTP',              // universal industry acronym; untranslated in the platform's own docs
  'WE ROLL SPINNERS', // studio brand name, never translated
  'DEV',              // dev-only chip, not rendered in production
  'SELECT THEME',     // ThemeSelector is dev-only (import.meta.env.DEV gated in App.svelte)
  'BACK',             // ThemeSelector, dev-only
  'COMING SOON',      // ThemeSelector's own copy is dev-only; the FeatureMenu one is translated
  // Added 2026-07-26 (TR-072) when the repaired regex first saw it. Same reason
  // as SELECT THEME and BACK above: ThemeSelector is gated behind
  // `import.meta.env.DEV` in App.svelte and is not rendered in production, so
  // no player in any locale can reach this string.
  'PLAY THIS THEME',
  // Added 2026-07-27 by the machine-tell sweep (QUALITY_CHARTER.md Q-22). The
  // dev panel's theme button was the emoji `🎨`, U+1F3A8, which shipped as a
  // literal in the production bundle even though the panel itself is gated
  // behind `import.meta.env.DEV` and never renders for a player. Swapping the
  // emoji for a word is what surfaced it here, and the same dev-only reasoning
  // that covers DEV and SELECT THEME above covers it: no player in any locale
  // can reach this string.
  'THEME',
])

const COMPONENTS = join(ROOT, 'src/lib/components')
const files = readdirSync(COMPONENTS).filter((f) => f.endsWith('.svelte'))
  .map((f) => ['src/lib/components/' + f, join(COMPONENTS, f)])
// src/App.svelte is scanned too. TR-063 found the dash gate reporting PASS at
// 25 files while App.svelte shipped an em dash in the document title, for the
// same reason: the file list was a list.
files.push(['src/App.svelte', join(ROOT, 'src/App.svelte')])

/**
 * The literal scan.
 *
 * REPAIRED 2026-07-26 (TR-072). This was `/>([A-Z][A-Z0-9 &'.-]{2,})</g`,
 * requiring the literal's first character to sit IMMEDIATELY after the `>`.
 * That is only true when an element and its text are on one line. The moment an
 * element carries enough attributes to be wrapped, which is the normal
 * formatting in this codebase, its text sits on its own line preceded by a
 * newline and indentation, and the gate could not see it at all:
 *
 *     <button
 *       class="entry-continue"
 *       on:click={continueFromEntry}
 *     >
 *       CLICK TO CONTINUE          <-- invisible to the old regex
 *     </button>
 *
 * So a gate whose entire purpose is "no new hardcoded player strings" was blind
 * to every hardcoded player string written in the house style, and it reported
 * PASS while four of them shipped to players in fifteen locales. This is the
 * TR-060 and TR-063 pattern for the third time: a gate that reads one authoring
 * form of the defect while the defect occurs in another.
 *
 * `\s*` on both sides is the fix. The self-test below seeds the exact form that
 * shipped, per convention (p), so the next time this regex is wrong it is one
 * run rather than four days of reading that finds out.
 */
const LITERAL_RE = />\s*([A-Z][A-Z0-9 &'.,!?:-]{2,})\s*</g
const hardcoded = []

for (const [label, path] of files) {
  const body = readFileSync(path, 'utf-8')
  const markup = body.split('<style>')[0]
  for (const m of markup.matchAll(LITERAL_RE)) {
    const text = m[1].trim()
    if (!text || ALLOW.has(text)) continue
    if (text.includes('{') || text.includes('}')) continue  // interpolation, not a literal
    const line = markup.slice(0, m.index).split('\n').length
    hardcoded.push({ file: label, line, text })
  }
}

if (hardcoded.length) {
  for (const h of hardcoded) {
    failures.push({
      gate: 'no-hardcoded',
      detail: `${h.file}:${h.line} renders the literal "${h.text}". Add a Translations key and render it, or allowlist it here with a reason.`,
    })
  }
}

console.log(`HARDCODED SCAN: ${files.length} components, ${hardcoded.length} unexplained literal(s)`)

// ── SEEDED VIOLATION SELF-TEST, convention (p) ───────────────────────────────
//
// "Every gate that claims a class closed ships a self-test that plants a
//  violation and must FAIL on it before its PASS counts."
//
// This gate claimed the hardcoded-player-string class was closed and reported
// PASS for months while four such strings shipped, because its regex read one
// authoring form of the defect and the defect occurred in another. That is
// exactly what convention (p) is written to catch, and a seeded violation would
// have caught it in one run.
//
// So the seeds are the forms that ACTUALLY OCCUR, not a form the regex happens
// to handle. The first is the one that shipped: an element wrapped across lines
// with its text on its own line. Convention (p) is explicit that seeding a
// convenient form teaches nothing.
const SEEDS = [
  ['the form that shipped: wrapped element, text on its own line',
   '<button\n  class="entry-continue"\n  on:click={go}\n>\n  CLICK TO CONTINUE\n</button>'],
  ['same line, the only form the old regex could see',
   '<span>PLAY AGAIN</span>'],
  ['leading whitespace only',
   '<div>   COLLECT</div>'],
  ['trailing newline only',
   '<h1>REACHED!\n</h1>'],
  ['punctuation the old character class excluded',
   '<p>\n  NO WIN, TRY AGAIN\n</p>'],
]
const seedResults = SEEDS.map(([why, markup]) => {
  LITERAL_RE.lastIndex = 0
  const caught = [...markup.matchAll(LITERAL_RE)]
    .map((m) => m[1].trim())
    .some((t) => t && !ALLOW.has(t) && !t.includes('{'))
  return { why, caught }
})
// The negative control. Without it a regex matching everything would "catch"
// all five seeds and the self-test would certify a gate that fails on clean
// markup, which is a different way of being useless.
const CLEAN = '<span>{$tr(\'spin\')}</span>\n<div class="x">{value}</div>\n<p>\n  {label}\n</p>'
LITERAL_RE.lastIndex = 0
const cleanIsClean = [...CLEAN.matchAll(LITERAL_RE)]
  .map((m) => m[1].trim())
  .every((t) => !t || ALLOW.has(t) || t.includes('{'))

for (const s of seedResults) {
  console.log(`  ${s.caught ? 'caught' : 'MISSED'}  seeded: ${s.why}`)
}
console.log(`  ${cleanIsClean ? 'clean ' : 'FALSE+'}  seeded: negative control, translated markup must pass`)
if (!seedResults.every((s) => s.caught) || !cleanIsClean) {
  failures.push({
    gate: 'self-test',
    detail: 'the hardcoded-literal scan did not fail on a seeded violation, so its PASS means nothing',
  })
}

if (failures.length) {
  console.error(`\nLOCALE COMPLETENESS: FAIL (${failures.length})`)
  for (const f of failures) console.error(`  [${f.gate}] ${f.detail}`)
  process.exit(1)
}
console.log('\nLOCALE COMPLETENESS: PASS')
