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
])

const COMPONENTS = join(ROOT, 'src/lib/components')
const files = readdirSync(COMPONENTS).filter((f) => f.endsWith('.svelte'))
const hardcoded = []

for (const f of files) {
  const body = readFileSync(join(COMPONENTS, f), 'utf-8')
  const markup = body.split('<style>')[0]
  for (const m of markup.matchAll(/>([A-Z][A-Z0-9 &'.-]{2,})</g)) {
    const text = m[1].trim()
    if (!text || ALLOW.has(text)) continue
    const line = markup.slice(0, m.index).split('\n').length
    hardcoded.push({ file: f, line, text })
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

if (failures.length) {
  console.error(`\nLOCALE COMPLETENESS: FAIL (${failures.length})`)
  for (const f of failures) console.error(`  [${f.gate}] ${f.detail}`)
  process.exit(1)
}
console.log('\nLOCALE COMPLETENESS: PASS')
