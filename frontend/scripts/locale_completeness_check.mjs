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

/**
 * KNOWN DEBT, TR-091, recorded 2026-07-27, AWAITING FABLE'S RULING.
 *
 * These are the 20 the widened reading found on its first run. They are NOT
 * exempt on their merits: every one is genuinely player-visible hardcoded
 * English, and six of them are the strings recorded as blocking stake.us. They
 * are listed here so that the gate can go LIVE AND CORRECT today without main
 * going red, which rule 10 forbids, while the fix itself is a decision that
 * changes player-visible strings on compliance-adjacent surfaces and therefore
 * belongs to Fable rather than to the builder.
 *
 * SCOPED BY FILE ON PURPOSE. A bare text allowlist would also excuse a NEW
 * `BET` written tomorrow in a different component, which would spend the whole
 * value of widening the gate. Keyed `file|text`, so the debt is frozen exactly
 * where it stands and anything new still fails.
 *
 * THE RATCHET: every entry removed here is one surface fixed. When this list is
 * empty, delete it and this comment with it.
 */
const KNOWN_DEBT = new Set([
  // The stake.us six. Handled for SOCIAL mode by a hand-rolled ternary, which is
  // why nobody noticed: the social swap works and the LOCALE swap does not
  // exist, so both branches are hardcoded English in all sixteen locales.
  'src/lib/components/FeatureMenu.svelte|BUY FEATURES',
  'src/lib/components/FeatureMenu.svelte|GET FEATURES',
  'src/lib/components/FeatureMenu.svelte|BET MODES',
  'src/lib/components/FeatureMenu.svelte|PLAY MODES',
  // The enhancer toggle state.
  'src/lib/components/FeatureMenu.svelte|OFF',
  // The responsible-gambling session overlay.
  'src/lib/components/SessionPanel.svelte|NET',
  // Constants. `overdriveFreeSpins` and `totalWin` ALREADY exist in all sixteen
  // locales in the feature block, so these two are second copies of translated
  // strings rather than missing translations.
  'src/lib/components/BonusInstrumentColumn.svelte|OVERDRIVE FREE SPINS',
  'src/lib/components/BonusInstrumentColumn.svelte|TOTAL WIN',
  // Symbol labels, rendered from a local record and from the paytable.
  'src/lib/components/WinBreakdown.svelte|WILD',
  'src/lib/components/WinBreakdown.svelte|SCATTER',
  'src/lib/components/PaytableModal.svelte|WILD',
  'src/lib/components/PaytableModal.svelte|SCAT',
])

/**
 * Dev-only, and exempt on its MERITS rather than as debt: ThemeSelector is
 * gated behind `import.meta.env.DEV` in App.svelte and is not rendered in
 * production, the same reason SELECT THEME, BACK and PLAY THIS THEME are in
 * ALLOW above. It sits here rather than in ALLOW only because it is scoped to
 * the one dev-only component.
 */
const DEV_ONLY = new Set([
  'src/lib/components/ThemeSelector.svelte|FUTURE SPINNER',
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

/**
 * WIDENED 2026-07-27 (TR-091). THE FOURTH TIME THIS GATE'S READING FORM WAS
 * NARROWER THAN THE DEFECT.
 *
 * The regex above requires the uppercase run to be the WHOLE text node. Three
 * shapes therefore escaped it, and they were counted rather than estimated:
 * 14 render sites of player-visible hardcoded English, of which SIX are the
 * strings recorded as blocking stake.us.
 *
 *   (A) A literal SHARING a node with an interpolation. The `\s*` on both sides
 *       still cannot span a `{...}`, and the old `text.includes('{')` line then
 *       discarded whatever did match:
 *           <span>NET {coinsWord}</span>
 *
 *   (B) A literal written INSIDE an interpolation. Never a text node at all, so
 *       nothing above could ever see it. This is where the stake.us terms live:
 *           {$isSocial ? 'GET FEATURES' : 'BUY FEATURES'}
 *       Note these ARE handled for social mode, which is exactly why they were
 *       never noticed: both branches are hardcoded English, so the social swap
 *       works and the LOCALE swap does not exist.
 *
 *   (C) A literal imported from a `.ts` module. The gate only ever opened
 *       `.svelte` files, so a constant was unreachable by construction:
 *           <span class="pm-label">{HUD_LABEL_FREE_SPINS}</span>
 *       with `export const HUD_LABEL_FREE_SPINS = 'OVERDRIVE FREE SPINS'`.
 *
 * SCOPE IS DELIBERATELY UNCHANGED: this still hunts UPPERCASE player strings,
 * because that is the class this gate has always claimed. Sentence-case prose
 * stays parked and enumerated in docs/QUALITY_CHARTER.md 4.3, and pretending
 * otherwise here would make the gate cry wolf across the whole tree. What
 * changed is the READING, not the class.
 */

/** Player-facing attributes. A `title` is a tooltip a desktop player reads. */
const PLAYER_ATTRS = ['aria-label', 'title', 'alt', 'placeholder']

/** An uppercase run that reads as player prose rather than as a code token. */
const isPlayerCaps = (s) => {
  const t = (s || '').trim()
  if (t.length < 3 || ALLOW.has(t)) return false
  if (!/^[A-Z][A-Z0-9 &'.,!?:%×+-]*$/.test(t)) return false  // caps, digits, punctuation only
  if (!/[A-Z]{2,}/.test(t)) return false                     // needs a real uppercase word
  if (/^[0-9 .,%×+-]+$/.test(t)) return false                // pure number or figure
  return true
}

/**
 * Strings that are ARGUMENTS to a translation call are the correct form and
 * must never be flagged: `{$tr('paytable')}` is the thing we want people to
 * write. Matched by looking left from the quote for a translate call.
 */
const TRANSLATE_CALL = /(?:\$?tr|t)\s*\(\s*$/

/**
 * The currency-fallback idiom, which is NOT player prose. This codebase writes
 * `formatBalance(micros, $currencyCode || 'USD')` in a dozen places, and `USD`
 * is three uppercase letters so it reads as a label to any caps-shaped test.
 * Excluded by the shape of the call rather than by a list of codes, because a
 * list would have to grow every time a currency is added and would also have to
 * exclude `BET`, `NET` and `OFF`, which are the same shape and ARE prose.
 */
const CURRENCY_FALLBACK = /(?:currencyCode|currency)\s*(?:\|\||\?\?)\s*$/

/** Split markup into text nodes, keeping interpolations as separators. */
function textSegments(markup) {
  const out = []
  const NODE = />([^<>]+)</g
  for (const m of markup.matchAll(NODE)) {
    const raw = m[1]
    const at = m.index + 1
    // Split on interpolations so a literal beside one is still seen. Depth
    // counting, because a ternary can contain nested braces.
    let buf = '', depth = 0, start = 0
    for (let i = 0; i < raw.length; i++) {
      const c = raw[i]
      if (c === '{') { if (depth === 0) { out.push({ text: buf, at: at + start }); buf = '' } depth++ ; continue }
      if (c === '}') { depth = Math.max(0, depth - 1); if (depth === 0) start = i + 1; continue }
      if (depth === 0) buf += c
    }
    if (buf) out.push({ text: buf, at: at + start })
  }
  return out
}

/** Quoted string literals that sit inside a `{...}` in MARKUP. */
function interpolatedStrings(markup) {
  const out = []
  const BLOCK = /\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g
  for (const m of markup.matchAll(BLOCK)) {
    const inner = m[1]
    for (const s of inner.matchAll(/'([^'\\]*)'|"([^"\\]*)"/g)) {
      const val = s[1] ?? s[2] ?? ''
      const before = inner.slice(0, s.index)
      if (TRANSLATE_CALL.test(before)) continue          // {$tr('key')}, correct
      if (CURRENCY_FALLBACK.test(before)) continue       // $currencyCode || 'USD'
      out.push({ text: val, at: m.index })
    }
  }
  return out
}

/**
 * `{IDENT}`, `{IDENT[...]}` or `{IDENT[...] ?? x}` rendered in markup, resolved
 * either to the component's OWN script block or to an imported `.ts` module.
 *
 * The local case is not an afterthought: stripping the script block to kill the
 * false positives above also hid `WinBreakdown`'s own
 * `const SYMBOL_LABELS = { ..., W: 'WILD', S: 'SCATTER' }`, which IS rendered in
 * markup. Fixing one blindness opened another, so both are resolved here.
 */
function renderedConstants(markup, body, path) {
  const out = []
  const rendered = new Set()
  for (const m of markup.matchAll(/\{\s*([A-Z][A-Z0-9_]{2,})\s*(?:\[[^\]]*\])?/g)) {
    rendered.add(m[1])
  }
  if (!rendered.size) return out
  const script = body.split('</script>')[0]

  // (i) declared in this component's own script block
  for (const name of rendered) {
    const decl = script.match(new RegExp(`const ${name}\\b[^=]*=\\s*([\\s\\S]{0,400})`))
    if (!decl) continue
    for (const s of decl[1].matchAll(/'([^'\\]*)'|"([^"\\]*)"/g)) {
      const val = s[1] ?? s[2] ?? ''
      if (isPlayerCaps(val)) out.push({ text: val, via: `${name}, declared locally` })
    }
  }

  for (const imp of script.matchAll(/import\s*\{([^}]+)\}\s*from\s*'([^']+)'/g)) {
    const names = imp[1].split(',').map((n) => n.trim().split(/\s+as\s+/)[0].trim())
    const hit = names.filter((n) => rendered.has(n))
    if (!hit.length) continue
    let target = imp[2]
    if (!target.startsWith('.')) continue
    const base = join(dirname(path), target)
    let src = null
    for (const ext of ['.ts', '.js', '/index.ts']) {
      try { src = readFileSync(base + ext, 'utf-8'); break } catch { /* next */ }
    }
    if (!src) continue
    for (const name of hit) {
      const decl = src.match(new RegExp(`export const ${name}\\b[^=]*=\\s*([\\s\\S]{0,400})`))
      if (!decl) continue
      for (const s of decl[1].matchAll(/'([^'\\]*)'|"([^"\\]*)"/g)) {
        const val = s[1] ?? s[2] ?? ''
        if (isPlayerCaps(val)) out.push({ text: val, via: `${name} (${target})` })
      }
    }
  }
  return out
}

/**
 * THE ONE DETECTION PATH, called by BOTH the real scan and the self-test.
 *
 * It is a function for a reason learned the hard way twice this week. A
 * self-test that RESTATES the rule it is checking proves nothing about the
 * shipped rule: `machine_tell_gate.mjs`'s first currency control did exactly
 * that and passed while the real predicate was untested. So the seeds below run
 * through this, the same code the tree runs through, and a widening that forgets
 * to wire in a new detector cannot pass its own seeds.
 */
function findLiterals(body, path, label = '(seed)') {
  const hardcoded = []
  const debt = []
  // STRIP THE SCRIPT BLOCK, not just the style block. The old regex needed a
  // literal to be a whole `>text<` node, which almost never matches inside
  // JavaScript, so `body.split('<style>')[0]` was good enough by accident. The
  // widened reading looks at `{...}` blocks, and script code is nothing BUT
  // braces, so the first run reported `INPUT` and `TEXTAREA` from a `tagName`
  // comparison and six ISO currency codes from an `import { ZERO_DECIMAL }`
  // line. Player-facing text lives in markup; the script block is code.
  // HTML COMMENTS ARE STRIPPED TOO, and that is verified rather than assumed:
  // Svelte compiles with `preserveComments: false` by default, and `grep` for a
  // distinctive committed comment string in `dist/assets/*.js` returns 0. So a
  // `<!-- -->` in a component cannot reach a player. This matters because the
  // house style explains a fix by QUOTING the code it replaced, and without this
  // the gate flags the explanation as the defect: burning the first four ratchet
  // entries did exactly that, on the two lines that had just been FIXED.
  const markup = body
    .replace(/<script[\s\S]*?<\/script>/g, (m) => '\n'.repeat((m.match(/\n/g) || []).length))
    .replace(/<!--[\s\S]*?-->/g, (m) => '\n'.repeat((m.match(/\n/g) || []).length))
    .split('<style>')[0]
  const seen = new Set()
  const add = (text, at, note) => {
    const t = (text || '').trim()
    if (!isPlayerCaps(t)) return
    const scoped = label + '|' + t
    if (DEV_ONLY.has(scoped)) return
    if (KNOWN_DEBT.has(scoped)) { debt.push({ file: label, text: t }); return }
    const key = t + '|' + note
    if (seen.has(key)) return
    seen.add(key)
    const line = typeof at === 'number' ? markup.slice(0, at).split('\n').length : 0
    hardcoded.push({ file: label, line, text: t, note })
  }

  // (A) whole text nodes, and literals sharing a node with an interpolation
  for (const seg of textSegments(markup)) add(seg.text, seg.at, 'text node')

  // (B) literals written inside an interpolation, including player attributes
  for (const s of interpolatedStrings(markup)) add(s.text, s.at, 'inside an interpolation')

  // (B2) player-facing attributes with a static quoted value
  for (const attr of PLAYER_ATTRS) {
    const RE = new RegExp(`\\b${attr}="([^"{}]+)"`, 'g')
    for (const m of markup.matchAll(RE)) add(m[1], m.index, `${attr} attribute`)
  }

  // (C) uppercase constants imported from a .ts module and rendered
  for (const c of renderedConstants(markup, body, path)) add(c.text, 0, `constant ${c.via}`)

  hardcoded.debt = debt
  return hardcoded
}

const hardcoded = []
const debtSeen = []
for (const [label, path] of files) {
  const found = findLiterals(readFileSync(path, 'utf-8'), path, label)
  hardcoded.push(...found)
  debtSeen.push(...(found.debt || []))
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
// The debt is REPORTED on every run, never silent. A gate that quietly excuses
// twenty player-visible strings reads, to anyone scanning CI, exactly like a
// gate with nothing to excuse. TR-091 is awaiting a ruling, not resolved.
if (debtSeen.length) {
  console.log(`KNOWN DEBT (TR-091, awaiting ruling): ${debtSeen.length} player-visible literal(s) frozen by file`)
  const byFile = new Map()
  for (const d of debtSeen) byFile.set(d.file, [...(byFile.get(d.file) || []), d.text])
  for (const [f, ts] of byFile) console.log(`    ${f}: ${ts.join(', ')}`)
}
// Compare UNIQUE keys, not occurrences: `TOTAL WIN` legitimately renders at two
// sites in one component, so counting occurrences would make this check pass or
// fail by coincidence rather than by meaning.
const debtMatched = new Set(debtSeen.map((d) => d.file + '|' + d.text))
const debtStale = [...KNOWN_DEBT].filter((k) => !debtMatched.has(k))
if (debtStale.length) {
  // The list must describe reality in BOTH directions. An entry that no longer
  // matches anything is a fix that landed without its allowlist entry being
  // removed, and the ratchet only works if it cannot rust.
  failures.push({
    gate: 'known-debt',
    detail: `KNOWN_DEBT has ${debtStale.length} entry(ies) matching nothing: ${debtStale.join('; ')}. `
      + 'That surface is fixed, so remove the entry, per the ratchet note beside the list.',
  })
}

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
  // TR-091 seeds. Every one is a form that WAS really in this repository and
  // that the pre-2026-07-27 reading could not see. Convention (p) is explicit
  // that a seed in a form the gate happens to handle teaches nothing, so these
  // are copied from the real lines rather than invented.
  ['TR-091 (A): a literal SHARING a text node with an interpolation',
   '<div class="sp-row"><span>NET {coinsWord}</span></div>'],
  ['TR-091 (B): a literal written INSIDE an interpolation, the stake.us form',
   `<div class="fm-section-label">{$isSocial ? 'GET FEATURES' : 'BUY FEATURES'}</div>`],
  // The same SHAPE in a player-facing attribute. The value is uppercase on
  // purpose: this gate's declared class is uppercase player strings, and the
  // real `title={$speedTier === 'normal' ? 'Normal speed' : ...}` is SENTENCE
  // case, so it is correctly out of scope here and stays in the parked
  // sentence-case set at docs/QUALITY_CHARTER.md 4.3. Seeding it with its real
  // sentence-case value made this seed fail, which was the seed being wrong
  // about the gate's scope rather than the gate being wrong. Recorded because
  // getting that backwards is how a gate gets widened into crying wolf.
  ['TR-091 (B): the same shape in a player-facing ATTRIBUTE, which no quoted-value scan sees',
   `<button title={$isSocial ? 'PLAY MODES' : 'BET MODES'}>x</button>`],
]
const seedResults = SEEDS.map(([why, markup]) => ({
  why,
  // Through the SHIPPED detection path, not a restatement of one regex.
  caught: findLiterals(markup, join(ROOT, 'src/lib/components/__seed__.svelte')).length > 0,
}))
// The negative control. Without it a detector matching everything would "catch"
// every seed and the self-test would certify a gate that fails on clean markup,
// which is a different way of being useless. Each line is a form that MUST pass:
// the correct translated call, a plain value, a lowercase label, and the
// currency-fallback idiom that the widening initially flagged by mistake.
const CLEAN = [
  `<span>{$tr('spin')}</span>`,
  `<div class="x">{value}</div>`,
  `<p>\n  {label}\n</p>`,
  `<span>{formatBalance(micros, $currencyCode || 'USD')}</span>`,
  `<span class="lbl">Spins</span>`,
  // A comment quoting the defect it replaced must NOT be flagged. Svelte strips
  // comments, so this is not player-visible, and the house style writes them.
  `<!-- Was {$isSocial ? 'PLAY' : 'BET'}, replaced by the tr layer -->`,
].join('\n')
const cleanIsClean = findLiterals(CLEAN, join(ROOT, 'src/lib/components/__clean__.svelte')).length === 0

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
