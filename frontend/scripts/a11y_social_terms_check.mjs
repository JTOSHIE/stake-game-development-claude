// a11y_social_terms_check.mjs - R4 / TR-012 (2026-07-25).
//
// The visible-text prohibited-term sweep reads rendered DOM text. Screen-reader
// text is not rendered DOM text, so aria-label, title, alt, placeholder and
// friends were never covered by it. Fourteen control labels shipped hardcoded
// English carrying the prohibited term "bet" ("Increase bet", "Decrease bet",
// "Max bet", "Features and bet modes"), invisible to every existing check: a
// blind player in a social jurisdiction heard the real-money vocabulary the
// sighted player was protected from.
//
// Two gates:
//
//   1. NO PROHIBITED TERMS IN ACCESSIBILITY ATTRIBUTES. Literal attribute values
//      are matched against the platform's own restricted-phrase table, quoted
//      verbatim from docs/stake-engine-live/jurisdiction-requirements.md.
//
//   2. NO HARDCODED ACCESSIBILITY TEXT AT ALL. Any literal value is a string
//      that cannot be translated and cannot carry a social variant, which is the
//      condition that produced defect 1. Values must come from `$tr(...)`.
//      Decorative empty values (alt="") and allowlisted entries are exempt.
//
// Static, no browser, no dev server: CI-safe.
//
// Run (from frontend/): node scripts/a11y_social_terms_check.mjs

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')

// Quoted verbatim from the platform's restricted-phrase table
// (docs/stake-engine-live/jurisdiction-requirements.md, "Restricted Phrase"
// column). Longest first so multi-word phrases report ahead of their fragments.
const RESTRICTED = [
  'win feature', 'total bet', 'bonus buy', 'buy bonus', 'at the cost of',
  'paid out', 'pays out', 'pay out', 'cost of', 'betting', 'rebet',
  'deposit', 'withdraw', 'purchase', 'gamble', 'credit', 'bought',
  'wager', 'money', 'payer', 'stake', 'cash', 'bets', 'pays', 'paid',
  'bet', 'buy', 'pay',
]

const A11Y_ATTRS = [
  'aria-label', 'aria-description', 'aria-roledescription', 'aria-valuetext',
  'aria-placeholder', 'title', 'alt', 'placeholder',
]

// Literal accessibility values that are exempt, each with its reason.
const ALLOW = new Map([
  ['We Roll Spinners',                        'studio brand name, never translated'],
  ['Overdrive Free Spins',                    'feature proper noun; carries no restricted term'],
  ['Max Win reached',                         'celebration dialog; "win" is a REPLACEMENT term, not a restricted one'],
  ['Close',                                   'pending a11y key; carries no restricted term'],
  ['Menu',                                    'pending a11y key; carries no restricted term'],
  ['Features',                                'pending a11y key; carries no restricted term'],
  ['Music volume',                            'pending a11y key; carries no restricted term'],
  ['Sound effects volume',                    'pending a11y key; carries no restricted term'],
  ['Cycle speed (Normal / Turbo / Super Turbo)', 'pending a11y key; carries no restricted term'],

  // Dev-only surfaces. Never rendered in a production build: App.svelte wraps
  // the dev chip and its popover in {#if import.meta.env.DEV} (App.svelte:1296)
  // and ThemeSelector is dev-only per CLAUDE.md. No player ever hears these.
  ['Dev tools',        'dev-only, App.svelte import.meta.env.DEV guard'],
  ['Change theme',     'dev-only, App.svelte import.meta.env.DEV guard'],
  ['Toggle reel mode', 'dev-only, App.svelte import.meta.env.DEV guard'],
  ['Reel mode: {$reelMode} (click to toggle strip/drop)', 'dev-only, App.svelte import.meta.env.DEV guard'],
  ['Select game theme', 'dev-only, ThemeSelector is DEV-gated per CLAUDE.md'],

  // TR-012a, NAMED DEBT rather than hidden. These four ARE player-facing and
  // carry no restricted phrase, so they are not a compliance breach, but they
  // are English-only for screen-reader users in fifteen locales. They are not
  // machine-translated here on purpose: "Reality check" is responsible-gambling
  // wording, and the standing caveat on this project is that machine-produced
  // translations are not native-reviewed, RG terms especially. Routed to R7,
  // which owns RG enforcement and should carry the reviewed wording.
  ['A matching way reads left to right across adjacent reels, starting from reel 1',
   'TR-012a: player-facing, no restricted term, translation pending'],
  ['Overdrive trigger table', 'TR-012a: player-facing, no restricted term, translation pending'],
  ['Session information',     'TR-012a: player-facing RG surface, translation pending, routed to R7'],
  ['Reality check',           'TR-012a: player-facing RG term, must be native-reviewed not machine-translated, routed to R7'],
])

const failures = []
const COMPONENTS = join(ROOT, 'src/lib/components')
const files = [
  ...readdirSync(COMPONENTS).filter((f) => f.endsWith('.svelte')).map((f) => join(COMPONENTS, f)),
  join(ROOT, 'src/App.svelte'),
]

const attrRe = new RegExp(`(${A11Y_ATTRS.join('|')})="([^"]*)"`, 'g')
let literalCount = 0
let scanned = 0

for (const file of files) {
  const name = file.split('/').pop()
  const markup = readFileSync(file, 'utf-8').split('<style>')[0]
  let m
  while ((m = attrRe.exec(markup)) !== null) {
    const [, attr, value] = m
    scanned++
    // `{...}` values are expressions - translated, so both gates are satisfied.
    if (value.startsWith('{')) continue
    if (value.trim() === '') continue // decorative, correct for aria purposes
    const line = markup.slice(0, m.index).split('\n').length

    const hit = RESTRICTED.find((t) =>
      new RegExp(`\\b${t.replace(/ /g, '\\s+')}\\b`, 'i').test(value),
    )
    if (hit) {
      failures.push({
        gate: 'restricted-term',
        detail: `${name}:${line} ${attr}="${value}" contains the restricted phrase "${hit}". `
              + `Screen-reader text is player-facing text. Route it through $tr(...) with a social variant.`,
      })
      continue
    }
    if (!ALLOW.has(value)) {
      literalCount++
      failures.push({
        gate: 'hardcoded-a11y',
        detail: `${name}:${line} ${attr}="${value}" is hardcoded. It cannot be translated and cannot `
              + `carry a social variant. Add a Translations key and render it, or allowlist it here with a reason.`,
      })
    }
  }
}

console.log(`A11Y SOCIAL TERMS: ${files.length} components, ${scanned} accessibility attributes scanned`)
console.log(`  restricted-phrase violations: ${failures.filter((f) => f.gate === 'restricted-term').length}`)
console.log(`  unexplained hardcoded values: ${literalCount}`)

if (failures.length) {
  console.error(`\nA11Y SOCIAL TERMS: FAIL (${failures.length})`)
  for (const f of failures) console.error(`  [${f.gate}] ${f.detail}`)
  process.exit(1)
}
console.log('\nA11Y SOCIAL TERMS: PASS')
