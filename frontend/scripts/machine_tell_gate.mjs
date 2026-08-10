#!/usr/bin/env node
//
// machine_tell_gate.mjs: the machine-tell gate.
//
// WHAT IT ENFORCES, AND WHY IT EXISTS
// -----------------------------------
// CLAUDE.md's STANDING MANDATE (line 483) ends: "Nothing player-visible may read
// as machine-generated." Its inspection test (line 495) then names the specific
// failures. docs/QUALITY_CHARTER.md holds the full list and this gate enforces
// the sweepable subset of it.
//
// This is the SECOND gate of its family. dash_gate.mjs covers class 1, dash
// typography, and its header records how its predecessor passed twice while
// blind. This one covers the classes beside it:
//
//   glyph-iconography     an operating-system emoji or a text dingbat typeset as
//                         an ICON, inside a text run, beside drawn SVG icons.
//                         Two defects at once: the icon family breaks, AND the
//                         character is outside the 183-codepoint Orbitron subset
//                         so it silently falls back to a system font mid-line.
//   orphan-placeholder    scaffold defaults and authoring markers that survived.
//   double-space          two or more spaces inside player-visible prose.
//   mixed-apostrophe      ONE locale using both U+0027 and U+2019.
//   dropped-apostrophe    a French elision written without its apostrophe.
//   hardcoded-currency    a currency symbol written as a literal beside an input
//                         instead of derived from the session's currency.
//   money-tofixed         player money rendered by .toFixed() rather than by the
//                         canonical formatter in src/lib/utils/currency.ts.
//
// WHY BY CODEPOINT AND NOT BY READING FONT STACKS
// -----------------------------------------------
// The shipped Orbitron subset covers 183 codepoints. It HAS U+0027, U+2019 and
// U+00D7. It does NOT have U+2715 (the close cross), U+2192 (the arrow),
// U+2605 (the star) or U+2713 (the tick). A character the brand face lacks does
// not fail loudly: the browser falls back for that ONE character, so a close
// button reads in Helvetica in the middle of an Orbitron interface and no
// stylesheet anywhere says so. Reading font-family declarations cannot find
// that. Reading characters can.
//
// USAGE
//   node scripts/machine_tell_gate.mjs              source AND dist (build first)
//   node scripts/machine_tell_gate.mjs --source     source only, no build needed
//   node scripts/machine_tell_gate.mjs --self-test  prove it fails on seeded defects
//
import { readFileSync, readdirSync, statSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { join, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')

// ── The flagged codepoint blocks ─────────────────────────────────────────────
//
// Symbol, pictograph, dingbat, arrow and geometric-shape blocks. These are
// INTERFACE FURNITURE and are locale-independent: they are the same character
// whether the player reads English or Japanese, which is exactly why they are
// the gate's business and the locale scripts are not.
//
// DELIBERATELY NOT INCLUDED, and this is the load-bearing part of the design:
//   - the locale scripts themselves (Arabic, Devanagari, CJK, Cyrillic, Thai,
//     Hangul). Orbitron is Latin-only, so those fall back by design and always
//     will. Flagging them would make the gate cry wolf on fifteen of sixteen
//     locales, and a gate that cries wolf gets ignored, which this project has
//     already watched happen once (see locale_completeness_check.mjs's own
//     comments).
//   - General Punctuation U+2000 to U+206F, which holds the curly quotes and the
//     ellipsis. Orbitron carries those, and the quote classes below handle the
//     one real defect there.
//   - U+00D7, the multiplication sign, which is Latin-1 Supplement, is in the
//     subset, and is the house form for "times".
const SYMBOL_BLOCKS = [
  [0x2190, 0x21ff], // Arrows
  [0x2300, 0x23ff], // Miscellaneous Technical
  [0x2460, 0x24ff], // Enclosed Alphanumerics
  [0x25a0, 0x25ff], // Geometric Shapes
  [0x2600, 0x26ff], // Miscellaneous Symbols, holds U+2605 BLACK STAR
  [0x2700, 0x27bf], // Dingbats, holds U+2713 and U+2715
  [0x2b00, 0x2bff], // Miscellaneous Symbols and Arrows
  [0x1f000, 0x1faff], // the emoji planes
  [0xfe0f, 0xfe0f], // VARIATION SELECTOR-16, the emoji presentation selector
]

// REVIEWED ALLOWLIST. Every entry carries its reason and who reviewed it, per
// the shape dash_gate.mjs established. Kept short on purpose: an allowlist that
// starts long is an allowlist nobody reads.
const ALLOWED_CODEPOINTS = new Map([
  [0x221e, 'U+221E INFINITY. Reviewed and kept, 2026-07-27 sweep. It labels the '
    + 'infinite-autoplay option in a button row whose other members are the '
    + 'numerals 10, 25, 50 and 100; it is a member of a numeric series, not an '
    + 'icon, and a drawn lemniscate among numerals would read worse than the '
    + 'conventional symbol. Orbitron does not carry it, so one glyph does fall '
    + 'back, which is recorded in QUALITY_CHARTER.md Q-07 rather than hidden.'],
])

function flaggedCodepoints(text) {
  const hits = []
  for (const ch of text) {
    const cp = ch.codePointAt(0)
    if (ALLOWED_CODEPOINTS.has(cp)) continue
    if (SYMBOL_BLOCKS.some(([lo, hi]) => cp >= lo && cp <= hi)) hits.push({ ch, cp })
  }
  return hits
}

const hex = (cp) => 'U+' + cp.toString(16).toUpperCase().padStart(4, '0')

// ── Placeholder markers ──────────────────────────────────────────────────────
const PLACEHOLDER_WORDS = /\b(TODO|TBD|FIXME|XXX|Lorem ipsum|lorem ipsum)\b/

// A <title> whose content is package-name shaped: all lowercase, hyphen
// separated, no spaces. Derived rather than matched against one hardcoded
// string, so it catches the class and not only the instance. This is exactly
// what `future-spinner-frontend` was, straight from the Vite scaffold, and it
// was the PRE-HYDRATION browser tab title: what the tab reads from first paint
// until App.svelte's <svelte:head> replaces it. Transient, not permanent; the
// first assessment of this got that wrong and QUALITY_CHARTER.md Q-01 records
// the correction.
const TITLE_TAG = /<title>([^<]*)<\/title>/g
const PACKAGE_SHAPED = /^[a-z0-9]+(?:-[a-z0-9]+)+$/

// ── Helpers ──────────────────────────────────────────────────────────────────
const SRC_TEXT = new Set(['.svelte', '.ts', '.js', '.css', '.html'])
const DIST_TEXT = new Set(['.js', '.css', '.html', '.json', '.md', '.svg', '.txt'])

// TEST FILES ARE NOT A PLAYER SURFACE. A test asserts on prose, quotes and
// money strings BY DESIGN, including deliberately malformed ones, so scanning
// them reports the fixtures as defects. Found by this gate's own first real run,
// which flagged a sentence inside sessionRecovery.test.ts. Excluded here with a
// negative control below, rather than allowlisted line by line.
const isTestFile = (p) => /\.(test|spec)\.(ts|js|mjs)$/.test(p)

// THE CANONICAL MONEY FORMATTER IS EXEMPT FROM money-tofixed, and it is the only
// file that is. formatBalance() must call toFixed() somewhere: that is what it
// is FOR. The class this gate enforces is "money formatted anywhere OTHER than
// here", so exempting the one canonical implementation is the rule, not a hole
// in it. Also found by the first real run.
const CANONICAL_MONEY_MODULE = 'src/lib/utils/currency.ts'

function walk(dir, exts, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const name of entries) {
    if (name === 'node_modules' || name === '.git') continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, exts, out)
    else if (exts.has(extname(name))) out.push(p)
  }
  return out
}

/** A whole-line or trailing comment cannot reach dist: the bundler strips it. */
function isComment(line) {
  const t = line.trim()
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('<!--')
}

// ── Source scanners ──────────────────────────────────────────────────────────

function scanGlyphs(files, { skipComments }) {
  const out = []
  for (const p of files) {
    let src
    try { src = readFileSync(p, 'utf-8') } catch { continue }
    const rel = relative(ROOT, p)
    src.split('\n').forEach((line, i) => {
      if (skipComments && isComment(line)) return
      const hits = flaggedCodepoints(line)
      if (!hits.length) return
      const glyphs = [...new Set(hits.map((h) => `${h.ch} ${hex(h.cp)}`))].join(', ')
      out.push({
        klass: 'glyph-iconography',
        file: rel,
        line: i + 1,
        detail: `${glyphs} typeset in a text run`,
        text: line.trim().slice(0, 110),
      })
    })
  }
  return out
}

function scanPlaceholders(files) {
  const out = []
  for (const p of files) {
    let src
    try { src = readFileSync(p, 'utf-8') } catch { continue }
    const rel = relative(ROOT, p)

    for (const m of src.matchAll(TITLE_TAG)) {
      const title = m[1].trim()
      if (PACKAGE_SHAPED.test(title)) {
        const line = src.slice(0, m.index).split('\n').length
        out.push({
          klass: 'orphan-placeholder',
          file: rel,
          line,
          detail: `<title> is package-name shaped: "${title}". A scaffold default reached the browser tab.`,
          text: m[0],
        })
      }
    }

    src.split('\n').forEach((line, i) => {
      if (isComment(line)) return
      const m = line.match(PLACEHOLDER_WORDS)
      if (m) {
        out.push({
          klass: 'orphan-placeholder',
          file: rel,
          line: i + 1,
          detail: `authoring marker "${m[1]}" on a shippable line`,
          text: line.trim().slice(0, 110),
        })
      }
    })
  }
  return out
}

/**
 * Double spaces INSIDE string content only. Source indentation and column
 * alignment are code, not player-visible prose, and the locale table is aligned
 * on purpose, so a naive whole-line scan would report hundreds of non-defects.
 */
function scanDoubleSpaces(files) {
  const out = []
  const STRING = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g
  const TEXT_NODE = />([^<>{}]{4,})</g
  for (const p of files) {
    let src
    try { src = readFileSync(p, 'utf-8') } catch { continue }
    const rel = relative(ROOT, p)
    src.split('\n').forEach((line, i) => {
      if (isComment(line)) return
      const candidates = []
      for (const m of line.matchAll(STRING)) candidates.push(m[1] ?? m[2] ?? '')
      for (const m of line.matchAll(TEXT_NODE)) candidates.push(m[1])
      for (const c of candidates) {
        if (/\S {2,}\S/.test(c)) {
          out.push({
            klass: 'double-space',
            file: rel,
            line: i + 1,
            detail: 'two or more consecutive spaces inside player-visible text',
            text: c.trim().slice(0, 110),
          })
          break
        }
      }
    })
  }
  return out
}

/**
 * Apostrophe consistency, evaluated PER LOCALE BLOCK rather than per file.
 * Per file would be wrong in both directions: sixteen locales in one file
 * legitimately differ from each other, and the defect is one locale
 * contradicting ITSELF, which is what a player actually sees.
 */
const LOCALE_BLOCK = /\nconst (\w{2}): Translations = \{/g
const FEATURE_BLOCK = /^  ([a-z]{2}): \{\s*$/

function localeBlocks(src) {
  const lines = src.split('\n')
  const blocks = []

  const starts = [...src.matchAll(LOCALE_BLOCK)]
  starts.forEach((m, i) => {
    const from = src.slice(0, m.index).split('\n').length
    const to = i + 1 < starts.length
      ? src.slice(0, starts[i + 1].index).split('\n').length
      : lines.length
    blocks.push({ code: m[1], from, to, kind: 'translations' })
  })

  const feat = []
  lines.forEach((l, i) => {
    const m = l.match(FEATURE_BLOCK)
    if (m) feat.push({ code: m[1], line: i + 1 })
  })
  feat.forEach((f, i) => {
    blocks.push({
      code: f.code,
      from: f.line,
      to: i + 1 < feat.length ? feat[i + 1].line : lines.length,
      kind: 'feature',
    })
  })
  return blocks
}

/** Apostrophes that are part of string CONTENT, not delimiters. */
function apostropheForms(line) {
  const curly = (line.match(/’/g) || []).length
  let straight = (line.match(/\\'/g) || []).length
  for (const s of line.match(/"(?:[^"\\]|\\.)*"/g) || []) {
    straight += (s.match(/'/g) || []).length
  }
  return { curly, straight }
}

/**
 * EMPTY, AND THAT IS THE POINT. R042 TASK A1 ruled option (a): the two French
 * strings R041 supplied were converted to this file's escaped straight form,
 * word content untouched, so `fr` no longer contradicts itself and the entry
 * that recorded the contradiction had to go with it.
 *
 * IT COULD NOT HAVE BEEN LEFT BEHIND. The both-directions check below fails a
 * frozen entry that no longer describes reality, which is what turned a
 * one-line ruling into a two-line change rather than a quiet half-fix. Kept as
 * an empty map rather than deleted so the mechanism, and the reason it exists,
 * survive the next time a locale needs freezing.
 *
 * Standing direction from the same ruling: player-facing French standardises on
 * the straight form for submission, and a font-verified typographic pass across
 * all sixteen locales is a post-approval cosmetic candidate, board item
 * TYPOGRAPHIC_APOSTROPHE_PASS.
 *
 * Keyed `file|locale`.
 */
const KNOWN_MIXED_APOSTROPHE = new Map([])

/**
 * ENGLISH FIGURE FORMS IN A COMMA-DECIMAL LOCALE. R042 TASK A2.
 *
 * In these ten locales the comma is the DECIMAL separator and the period groups
 * thousands, so an English-punctuated figure is not a formatting inconsistency,
 * it is a DIFFERENT NUMBER. `5,000×` reads as five. `96.35%` reads as 9,635 per
 * cent. Both shipped to players in all ten before this ruling.
 *
 * Two shapes are caught:
 *   comma-grouped thousands   1,000 / 5,000 / 12,345
 *   period decimal beside a unit   96.35% / 1.25×
 *
 * The unit is REQUIRED for the second shape. A bare `1.5` in prose is usually a
 * version, a reel count or an ordinary sentence, and flagging those would make
 * the gate cry wolf, which is how gates get switched off.
 *
 * THE DECIMAL SHAPE IS CAPPED AT TWO FRACTION DIGITS, and the first draft of
 * this scan was wrong without it: `5.000×` is the CORRECT German and Turkish
 * form for five thousand, and a naive period-decimal rule flagged the very
 * strings this ruling had just fixed. Exactly three digits after a period is a
 * thousands group in these locales, not a decimal. The cost is that a genuine
 * three-place decimal beside a unit would be missed; we ship none, and a rule
 * that fails the correct answer is worse than one with a narrow blind spot.
 */
const COMMA_DECIMAL = new Set(['de', 'es', 'fi', 'fr', 'id', 'pl', 'pt', 'ru', 'tr', 'vi'])

/**
 * FROZEN, ONE KEY, AND IT IS A QUESTION RATHER THAN AN EXEMPTION ON MERIT.
 *
 * R042 TASK A2 ruled the figure tokens `5,000` and `96.35`. `modeOverboostBlurb`
 * carries TWO MORE in the same file and the same ten locales: "1.6× the feature
 * trigger rate" and "1.25× every spin", both period decimals beside a unit, so
 * in German they read as sixteen and one hundred and twenty five.
 *
 * The scan the ruling asked for catches them, correctly. The ruling's REWRITE
 * did not name them. Converting them anyway would be a builder deciding the
 * wording of a maths-adjacent disclosure, which convention (l.8) forbids, and
 * narrowing the scan to hide them would be worse: a gate written around a defect
 * it can see is the exact self-deception this file exists to stop.
 *
 * So they are frozen HERE, visibly, checked in BOTH directions, and escalated as
 * section J of OWNER_RULINGS_PRESUBMISSION.md. When the ruling lands, the fix
 * removes this entry or the gate fails.
 *
 * Keyed `file|key`, deliberately NOT per locale: the defect is one string in ten
 * locales, and ten entries would read as ten problems.
 */
const KNOWN_EN_FORM_FIGURE = new Map([
  ['src/lib/i18n/prose.locales.ts|modeOverboostBlurb',
    'R042 TASK A2 ruled the tokens 5,000 and 96.35 only. This string carries 1.6x and 1.25x '
    + 'in the same ten locales, unruled. Escalated as OWNER_RULINGS section J.'],
])

/**
 * THE SAME LOCALE ACROSS THE THREE TABLES. R042 A1, found by a render proof.
 *
 * `scanApostrophes` judges a locale WITHIN ONE FILE, and that is not the
 * property a player experiences. French was internally consistent in both
 * files and still contradicted itself on screen: `translations.ts` held 7
 * typographic apostrophes and `prose.locales.ts` held 7 escaped straight ones,
 * and BOTH RENDER INTO THE SAME PAYTABLE MODAL. Each file passed. The player saw
 * both forms in one view, which is exactly the machine tell the per-file scan
 * was written to catch.
 *
 * It was found by `r042_wording_proof.mjs` reading the RENDERED text, not by any
 * source scan, which is the argument for render-level proofs in one line.
 */
function scanApostrophesAcrossTables(files) {
  const per = new Map()
  for (const file of files) {
    let src
    try { src = readFileSync(file, 'utf-8') } catch { continue }
    const rel = relative(ROOT, file)
    const lines = src.split('\n')
    for (const b of localeBlocks(src)) {
      const acc = per.get(b.code) || { curly: [], straight: [] }
      for (let i = b.from; i < b.to; i++) {
        const { curly, straight } = apostropheForms(lines[i] || '')
        if (curly) acc.curly.push(`${rel}:${i + 1}`)
        if (straight) acc.straight.push(`${rel}:${i + 1}`)
      }
      per.set(b.code, acc)
    }
  }
  const out = []
  for (const [code, acc] of per) {
    if (!acc.curly.length || !acc.straight.length) continue
    out.push({
      klass: 'mixed-apostrophe-across-tables',
      file: 'src/lib/i18n/',
      line: 1,
      detail: `locale '${code}' uses BOTH apostrophe forms ACROSS the locale tables, `
        + `which one screen renders together: U+2019 at ${acc.curly.slice(0, 3).join(', ')} `
        + `and U+0027 at ${acc.straight.slice(0, 3).join(', ')}`,
      text: code,
    })
  }
  return out
}

function scanNumeralForms(file) {
  const out = []
  let src
  try { src = readFileSync(file, 'utf-8') } catch { return out }
  const rel = relative(ROOT, file)
  const lines = src.split('\n')
  const seen = new Set()

  for (const b of localeBlocks(src)) {
    if (!COMMA_DECIMAL.has(b.code)) continue
    for (let i = b.from; i < b.to; i++) {
      const line = lines[i] || ''
      if (isComment(line)) continue
      const m = line.match(/^\s*(\w+):\s*'((?:[^'\\]|\\.)*)'/)
      if (!m) continue
      const [, key, value] = m
      const grouped = value.match(/\d,\d{3}(?!\d)/)
      const decimal = value.match(/\d+\.\d{1,2}(?!\d)\s*[%×]/)
      if (!grouped && !decimal) continue
      const frozenKey = `${rel}|${key}`
      if (KNOWN_EN_FORM_FIGURE.has(frozenKey)) { seen.add(frozenKey); continue }
      out.push({
        klass: 'en-form-figure',
        file: rel,
        line: i + 1,
        detail: `locale '${b.code}' renders ${JSON.stringify((grouped || decimal)[0])} in '${key}', `
          + 'where the comma is the decimal separator; a player reads a different number',
        text: value.slice(0, 110),
      })
    }
  }
  // BOTH DIRECTIONS, same as the apostrophe freeze. An entry that stops matching
  // is a rusted ratchet excusing whatever lands in that key next.
  for (const [k, why] of KNOWN_EN_FORM_FIGURE) {
    if (!k.startsWith(rel + '|') || seen.has(k)) continue
    out.push({
      klass: 'stale-figure-exemption', file: rel, line: 1,
      detail: `${k} no longer matches, so its KNOWN_EN_FORM_FIGURE entry must be deleted. `
        + 'Reason recorded was: ' + why,
      text: k,
    })
  }
  return out
}

function scanApostrophes(file) {
  const out = []
  let src
  try { src = readFileSync(file, 'utf-8') } catch { return out }
  const rel = relative(ROOT, file)
  const lines = src.split('\n')

  // Merge the two block families so one locale is judged as one locale, even
  // though its strings live in two tables in the same file.
  const perLocale = new Map()
  for (const b of localeBlocks(src)) {
    const acc = perLocale.get(b.code) || { curly: [], straight: [] }
    for (let i = b.from; i < b.to; i++) {
      const { curly, straight } = apostropheForms(lines[i] || '')
      if (curly) acc.curly.push(i + 1)
      if (straight) acc.straight.push(i + 1)
    }
    perLocale.set(b.code, acc)
  }

  for (const [code, acc] of perLocale) {
    const frozenKey = `${rel}|${code}`
    const mixed = acc.curly.length > 0 && acc.straight.length > 0
    // BOTH DIRECTIONS. A frozen entry that no longer describes reality is a
    // rusted ratchet: the next real mixing in that locale would be silently
    // excused by an exemption nobody noticed had stopped applying.
    if (KNOWN_MIXED_APOSTROPHE.has(frozenKey)) {
      if (!mixed) {
        out.push({
          klass: 'stale-apostrophe-exemption',
          file: rel,
          line: 1,
          detail: `locale '${code}' is no longer mixed, so its KNOWN_MIXED_APOSTROPHE entry `
            + 'must be deleted. Reason recorded was: ' + KNOWN_MIXED_APOSTROPHE.get(frozenKey),
          text: frozenKey,
        })
      }
      continue
    }
    if (mixed) {
      out.push({
        klass: 'mixed-apostrophe',
        file: rel,
        line: acc.curly[0],
        detail: `locale '${code}' uses BOTH apostrophe forms: U+2019 at line(s) `
          + `${acc.curly.join(', ')} and U+0027 at line(s) ${acc.straight.join(', ')}`,
        text: (lines[acc.curly[0] - 1] || '').trim().slice(0, 110),
      })
    }
  }

  // A French elision written without its apostrophe. The letters c d j l m n s t
  // and the pair qu are never standalone French words, so a single one of them
  // followed by a space and a vowel-initial or h-initial word is an elision that
  // lost its apostrophe rather than a false positive.
  const ELISION = /(?:^|[\s(])(?:qu|[cdjlmnst])\s+(?=[aeiouyàâéèêëîïôùûü]|h[aeiouy])/i
  for (const b of localeBlocks(src).filter((x) => x.code === 'fr')) {
    for (let i = b.from; i < b.to; i++) {
      const line = lines[i] || ''
      if (isComment(line)) continue
      const strings = [...line.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g)]
        .map((m) => m[1] ?? m[2] ?? '')
      for (const s of strings) {
        if (ELISION.test(s)) {
          out.push({
            klass: 'dropped-apostrophe',
            file: rel,
            line: i + 1,
            detail: "a French elision is missing its apostrophe (for example 'n a' where 'n’a' is meant)",
            text: s.trim().slice(0, 110),
          })
          break
        }
      }
    }
  }
  return out
}

function scanMoney(files) {
  const out = []
  // `>$<` and friends: a bare currency symbol as a markup text node. In Svelte
  // `>{$store}<` opens with a brace, so store references cannot match this.
  const LITERAL_SYMBOL = />\s*([$€£¥])\s*</
  // A .toFixed() whose receiver names money. Deliberately excludes multipliers:
  // `$winMultiplier.toFixed(1)` renders "1.5x", which is not a currency amount.
  const MONEY_TOFIXED = /(\w*(?:amount|balance|payout|cost|price|credit|cash)\w*)\s*\.toFixed\s*\(/i
  for (const p of files) {
    let src
    try { src = readFileSync(p, 'utf-8') } catch { continue }
    const rel = relative(ROOT, p)
    src.split('\n').forEach((line, i) => {
      if (isComment(line)) return
      const sym = line.match(LITERAL_SYMBOL)
      if (sym) {
        out.push({
          klass: 'hardcoded-currency',
          file: rel,
          line: i + 1,
          detail: `currency symbol "${sym[1]}" written as a literal. Derive it from the `
            + 'session currency via currencySymbolFor() in src/lib/utils/currency.ts.',
          text: line.trim().slice(0, 110),
        })
      }
      const money = rel.replace(/\\/g, '/').endsWith(CANONICAL_MONEY_MODULE)
        ? null
        : line.match(MONEY_TOFIXED)
      if (money) {
        out.push({
          klass: 'money-tofixed',
          file: rel,
          line: i + 1,
          detail: `player money rendered by ${money[1]}.toFixed(). Use formatBalance() `
            + 'so grouping, decimals and the currency symbol come from one place.',
          text: line.trim().slice(0, 110),
        })
      }
    })
  }
  return out
}


/**
 * CROSS-SURFACE CASING (sweep class 4), added 2026-07-28 for TR-092.
 *
 * The mandate names "capitalisation that changes between two screens showing the
 * same word". The charter recorded class 4 as only PARTLY covered because it
 * needs the rendered DOM. This closes the specific, ruled instance statically,
 * which is the part that can be pinned without a browser.
 *
 * THE DEFECT IT PINS: every surface takes its mode name from ONE source,
 * `modeLabel()` in src/lib/config/fsModes.ts, and the specification spells it
 * `Cruise`. The HUD badge carried `text-transform: uppercase` at three layout
 * profiles and the features menu, the paytable row and the buy dialog did not,
 * so the same mode read `Cruise` on three screens and `CRUISE` on a fourth. One
 * CSS property, four surfaces, and no gate saw it.
 *
 * A transform on a mode badge is therefore forbidden: the source of truth is the
 * specification's own spelling, and a surface that restyles it is the outlier.
 */
const MODE_BADGE_SELECTOR = /\.[a-z-]*mode-badge\b/
function scanCasingTransforms(files) {
  const out = []
  for (const p of files) {
    let src
    try { src = readFileSync(p, 'utf-8') } catch { continue }
    const rel = relative(ROOT, p)
    const lines = src.split('\n')
    let inRule = false
    let ruleLine = 0
    let selector = ''
    lines.forEach((line, i) => {
      if (MODE_BADGE_SELECTOR.test(line) && line.includes('{')) {
        inRule = true; ruleLine = i + 1; selector = line.trim().replace(/\{.*$/, '').trim()
      }
      if (inRule && /text-transform\s*:\s*(uppercase|lowercase|capitalize)/.test(line) && !isComment(line)) {
        out.push({
          klass: 'cross-surface-casing',
          file: rel,
          line: i + 1,
          detail: `a mode badge restyles its casing (rule "${selector}" opened at line ${ruleLine}). `
            + 'Every surface renders the same modeLabel(), so a transform here makes one screen '
            + 'disagree with three. Remove it and let the specification spelling stand.',
          text: line.trim().slice(0, 110),
        })
      }
      if (inRule && line.includes('}')) inRule = false
    })
  }
  return out
}

/**
 * THIRD FONT STACK (sweep class, added 2026-07-28, FS_POLISH_PUNCH_AND_R3
 * JOB 2).
 *
 * Exactly two font stacks exist, as tokens in src/app.css: --fs-font-display
 * and --fs-font-numeric. Before the tokens there were EIGHT hand-typed variant
 * stacks plus seven bare 'Courier New' sites, and each variant fell back to a
 * DIFFERENT face while Orbitron loaded or wherever it failed. The tokens close
 * the class only if nothing can spell a stack by hand again, so:
 *
 *   1. every font-family declaration must be `inherit` or one of the two
 *      tokens; a literal family name anywhere else is the defect;
 *   2. the only lines allowed to spell a literal stack are the two token
 *      DEFINITIONS, and only in src/app.css; a third --fs-font-* token, or a
 *      redefinition elsewhere, fails;
 *   3. a `fontFamily:` key in script (the PixiJS form, which cannot read CSS
 *      custom properties) is flagged outright: there are zero today, and a new
 *      one would be a literal stack the CSS rule cannot see.
 *
 * Single-line declarations only, which is every declaration in this tree; the
 * `font:` shorthand appears once as `font: inherit`, which carries no family.
 */
const TOKEN_DEF = /--fs-font-([a-z0-9-]+)\s*:/
const FONT_FAMILY_DECL = /font-family\s*:\s*([^;}]+)/
const CANONICAL_TOKEN_FILE = 'src/app.css'
const CANONICAL_TOKENS = new Set(['display', 'numeric'])

function scanFontStacks(files) {
  const out = []
  for (const p of files) {
    let src
    try { src = readFileSync(p, 'utf-8') } catch { continue }
    const rel = relative(ROOT, p)
    const isTokenFile = rel.replace(/\\/g, '/').endsWith(CANONICAL_TOKEN_FILE)
    src.split('\n').forEach((line, i) => {
      if (isComment(line)) return
      const def = line.match(TOKEN_DEF)
      if (def && (!CANONICAL_TOKENS.has(def[1]) || !isTokenFile)) {
        out.push({
          klass: 'third-font-stack',
          file: rel,
          line: i + 1,
          detail: CANONICAL_TOKENS.has(def[1])
            ? `the token --fs-font-${def[1]} is redefined outside ${CANONICAL_TOKEN_FILE}`
            : `a third font token --fs-font-${def[1]} is defined. Exactly two exist: display and numeric.`,
          text: line.trim().slice(0, 110),
        })
        return
      }
      const decl = line.match(FONT_FAMILY_DECL)
      if (decl) {
        const value = decl[1].trim()
        const canonical = value === 'inherit'
          || value === 'var(--fs-font-display)'
          || value === 'var(--fs-font-numeric)'
        // The two definition lines in app.css legitimately spell literal stacks.
        if (!canonical && !(isTokenFile && TOKEN_DEF.test(line))) {
          out.push({
            klass: 'third-font-stack',
            file: rel,
            line: i + 1,
            detail: `a literal font stack "${value.slice(0, 60)}". Use var(--fs-font-display) or `
              + 'var(--fs-font-numeric); the only literal stacks live in src/app.css as the token definitions.',
            text: line.trim().slice(0, 110),
          })
        }
      }
      if (/\bfontFamily\s*:/.test(line)) {
        out.push({
          klass: 'third-font-stack',
          file: rel,
          line: i + 1,
          detail: 'a script-side fontFamily (the PixiJS form). Canvas text cannot read the CSS tokens, '
            + 'so this is a literal stack the CSS rule cannot see; resolve the token value explicitly '
            + 'and record why, rather than spelling a family here.',
          text: line.trim().slice(0, 110),
        })
      }
    })
  }
  return out
}

// ── Reporting ────────────────────────────────────────────────────────────────
function report(label, findings) {
  if (!findings.length) {
    console.log(`${label}: PASS`)
    return true
  }
  console.error(`\n${label}: FAIL, ${findings.length} machine-tell(s)`)
  for (const f of findings) {
    console.error(`  [${f.klass}] ${f.file}:${f.line}`)
    console.error(`      ${f.detail}`)
    console.error(`      ${f.text}`)
  }
  return false
}

// ── self-test, convention (p) ────────────────────────────────────────────────
//
// CLAUDE.md line 470: "plant the exact defect the gate exists to catch, IN THE
// FORM IT REALLY OCCURS, and prove the gate goes red." A seed in a form the gate
// happens to handle, while the real defect occurs in another form, teaches
// nothing. That is precisely how player_string_dash_check.mjs passed twice while
// blind to markup prose.
//
// So every seed below is a string that was IN THIS REPOSITORY at HEAD 3f0d686,
// before the 2026-07-27 sweep removed it. Not an invented example of the class:
// the thing itself, in the file shape it was found in.
if (process.argv.includes('--self-test')) {
  const tmp = join(ROOT, '.machine-tell-selftest')
  rmSync(tmp, { recursive: true, force: true })
  mkdirSync(tmp, { recursive: true })

  const write = (name, body) => {
    const p = join(tmp, name)
    mkdirSync(join(p, '..'), { recursive: true })
    writeFileSync(p, body, 'utf-8')
    return p
  }

  const cases = [
    {
      name: 'scaffold-title.html',
      body: '<!doctype html>\n<html>\n  <head>\n    <title>future-spinner-frontend</title>\n  </head>\n</html>\n',
      run: (p) => scanPlaceholders([p]),
      why: 'Q-01, the Vite scaffold package name as the pre-hydration tab title, in MARKUP',
    },
    {
      name: 'en-figure-de.ts',
      body: "\nconst de: Translations = {\n  rulesMaxWin:          'Der Maximalgewinn ist auf 5,000\u00d7 deinen Basiseinsatz begrenzt.',\n  modeCruiseBlurb:      'Ruhigere Fahrt, unver\u00e4ndert 96.35% RTP.',\n}\n",
      run: (p) => scanNumeralForms(p),
      why: 'R042 A2, the shipped defect itself: comma-grouped thousands and a period decimal '
        + 'beside a unit inside a COMMA-DECIMAL locale, where they read as five and 9,635 per cent',
    },
    {
      name: 'locale-emoji.ts',
      body: "const en = {\n  wincap:               '\u{1F3C6} MAXIMUM WIN, 5,000×!',\n}\n",
      run: (p) => scanGlyphs([p], { skipComments: true }),
      why: 'Q-02, an emoji inside a LOCALE TABLE VALUE, which no markup scan would see',
    },
    {
      name: 'interpolated-emoji.svelte',
      body: "<button>\n  {$isMuted ? 'Unmute' : 'Mute'} {$isMuted ? '\u{1F507}' : '\u{1F50A}'}\n</button>\n",
      run: (p) => scanGlyphs([p], { skipComments: true }),
      why: 'Q-03, emoji inside a SVELTE INTERPOLATION, the form a plain string scan misses',
    },
    {
      name: 'markup-dingbat.svelte',
      body: '<div class="c1-crown crown" aria-hidden="true">★ ★ ★</div>\n',
      run: (p) => scanGlyphs([p], { skipComments: true }),
      why: 'Q-04, a dingbat as MARKUP PROSE between tags, outside the Orbitron subset',
    },
    {
      name: 'nested-dingbat.svelte',
      body: '<button class="fs-pt-close fs-knob">\n  <span class="fs-face">✕</span>\n</button>\n',
      run: (p) => scanGlyphs([p], { skipComments: true }),
      why: 'Q-05, a dingbat inside a NESTED element',
    },
    {
      name: 'mixed-apostrophe.ts',
      body: "\nconst fr: Translations = {\n"
        + "  rulesA: 'La montee est plus courte lors d\\'un redeclenchement.',\n"
        + "  rulesB: 'Le jeu de base et l’Achat de bonus rendent 96,35 %.',\n"
        + '}\n'
        + "\nconst de: Translations = {\n  rulesA: 'Sauber.',\n}\n",
      run: (p) => scanApostrophes(p),
      why: 'Q-08, ONE locale carrying both apostrophe forms, which only a per-locale scan finds',
    },
    {
      name: 'dropped-apostrophe.ts',
      body: "\nconst fr: Translations = {\n"
        + "  errSessionUnavailable: 'Jeu indisponible. Votre session n a pas pu etre verifiee.',\n"
        + '}\n',
      run: (p) => scanApostrophes(p),
      why: 'Q-09, an elision with the apostrophe ABSENT, which is not a mixed-form defect',
    },
    {
      name: 'hardcoded-currency.svelte',
      body: '<label class="auto-menu-amount">$<input type="number" bind:value={lossLimitAmount} /></label>\n',
      run: (p) => scanMoney([p]),
      why: 'Q-10, a hardcoded currency symbol beside an input, in a EUR and SC capable game',
    },
    {
      name: 'money-tofixed.svelte',
      body: '<script>\n  $: amtText  = $winAmount > 0 ? $winAmount.toFixed(2) : \'\'\n</script>\n',
      run: (p) => scanMoney([p]),
      why: 'Q-11, player money via .toFixed(), the form ledger row SA-022 reported',
    },
    {
      name: 'mode-badge-casing.svelte',
      body: '<style>\n  .fs-mode-badge{\n    font-size:.5rem;\n'
        + '    letter-spacing:.1em; text-transform:uppercase; white-space:nowrap;\n  }\n</style>\n',
      run: (p) => scanCasingTransforms([p]),
      why: 'TR-092, the exact rule that made the HUD badge read CRUISE while three other surfaces read Cruise',
    },
    {
      name: 'double-space.svelte',
      body: '<p>All matching symbol positions count,  with no fixed paylines.</p>\n',
      run: (p) => scanDoubleSpaces([p]),
      why: 'a double space inside markup prose',
    },
    {
      name: 'variant-stack.svelte',
      body: "<style>\n  .fs-label {\n    font-family: 'Orbitron', system-ui, sans-serif;\n  }\n</style>\n",
      run: (p) => scanFontStacks([p]),
      why: 'JOB 2, a hand-typed variant stack, the exact form 25 sites carried before the tokens',
    },
    {
      name: 'bare-courier.svelte',
      body: "<style>\n  .ts-note { font-family: 'Courier New', monospace; font-size: 0.7rem; }\n</style>\n",
      run: (p) => scanFontStacks([p]),
      why: 'JOB 2, a bare Courier New site, the form ThemeSelector carried seven of',
    },
    {
      name: 'third-token.css',
      body: ':root {\n  --fs-font-heading: \'Impact\', sans-serif;\n}\n',
      run: (p) => scanFontStacks([p]),
      why: 'JOB 2, a THIRD token defined, which the literal-stack rule alone would bless',
    },
    {
      name: 'pixi-fontfamily.ts',
      body: "const style = new TextStyle({\n  fontFamily: 'Arial',\n  fontSize: 24,\n})\n",
      run: (p) => scanFontStacks([p]),
      why: 'JOB 2, a script-side PixiJS fontFamily, which no CSS scan would see',
    },
  ]

  let allRed = true
  for (const c of cases) {
    const p = write(c.name, c.body)
    const found = c.run(p)
    const red = found.length > 0
    console.log(`  ${red ? 'caught ' : 'MISSED '} ${c.name}: ${c.why}`)
    if (!red) allRed = false
    rmSync(p, { force: true })
  }

  // NEGATIVE CONTROLS. A gate that fails on clean input is useless in a
  // different way, and these encode the three judgements that could go wrong:
  // that non-Latin locales are legitimate, that the multiplication sign is the
  // house form, and that a multiplier is not money.
  const controls = [
    {
      name: 'correct-figure-de.ts',
      body: "\nconst de: Translations = {\n  rulesMaxWin:          'Der Maximalgewinn ist auf 5.000\u00d7 deinen Basiseinsatz begrenzt.',\n  modeCruiseBlurb:      'Ruhigere Fahrt, unver\u00e4ndert 96,35 % RTP.',\n}\n",
      run: (p) => scanNumeralForms(p),
      why: 'the CORRECT German forms must pass. The first draft of this scan failed here, '
        + 'reading 5.000 as a period decimal rather than a thousands group, and would have '
        + 'reported the very strings R042 had just fixed',
    },
    {
      name: 'clean-title.html',
      body: '<!doctype html>\n<html>\n  <head>\n    <title>Future Spinner</title>\n  </head>\n</html>\n',
      run: (p) => scanPlaceholders([p]),
      why: 'a real title must pass',
    },
    {
      name: 'clean-locales.ts',
      body: "const ja = {\n  wincap: '最大勝利, 5,000倍！',\n"
        + "  scatter3: '3 SCATTER: 8 フリースピン + 1× ベット',\n}\n",
      run: (p) => scanGlyphs([p], { skipComments: true }),
      why: 'Japanese script, fullwidth punctuation and U+00D7 must all pass',
    },
    {
      name: 'clean-multiplier.svelte',
      body: '<script>\n  $: multText = $winMultiplier > 0 ? `${$winMultiplier.toFixed(1)}×` : \'\'\n</script>\n',
      run: (p) => scanMoney([p]),
      why: 'a MULTIPLIER via .toFixed() is not money and must pass',
    },
    {
      name: 'clean-store-ref.svelte',
      body: '<span class="hud-balance">{$balanceLabel}</span>\n',
      run: (p) => scanMoney([p]),
      why: 'a Svelte store reference must not read as a hardcoded dollar sign',
    },
    {
      name: 'clean-aligned-locale.ts',
      body: "const en = {\n  spin:                 'SPIN',\n  balance:              'BALANCE',\n}\n",
      run: (p) => scanDoubleSpaces([p]),
      why: 'column-aligned source is code, not player prose, and must pass',
    },
    {
      // Both of the next two encode a correction this gate's OWN first real run
      // forced, so a later edit that reintroduces either false positive goes red
      // here rather than being rediscovered against the whole tree.
      name: 'sessionRecovery.test.ts',
      body: 'const expected = "the banner is dismissible,  because nothing is wrong"\n',
      run: (p) => (isTestFile(p) ? [] : scanDoubleSpaces([p])),
      why: 'a TEST file asserts on malformed prose by design and must be excluded',
    },
    {
      // Written at a path that really ENDS in the canonical module's path, so
      // this exercises the shipped predicate rather than a restatement of it.
      // A control that reimplements the rule it is checking proves nothing,
      // which is the same trap convention (p) was written about.
      name: 'src/lib/utils/currency.ts',
      body: 'export function formatBalance(amount, code, decimals) {\n'
        + '  return `${code} ${amount.toFixed(decimals)}`\n}\n',
      run: (p) => scanMoney([p]),
      why: 'the CANONICAL formatter must call toFixed(); it is the one exempt file',
    },
    {
      name: 'clean-stat-label.svelte',
      body: '<style>\n  .p-stat-label {\n    text-transform: uppercase;\n  }\n</style>\n',
      run: (p) => scanCasingTransforms([p]),
      why: 'a stat LABEL is not a mode name and may be styled freely; only mode badges are pinned',
    },
    {
      name: 'clean-token-usage.svelte',
      body: '<style>\n  .fs-money { font-family: var(--fs-font-numeric); }\n'
        + '  .fs-title { font-family: var(--fs-font-display); }\n'
        + '  .fs-input { font-family: inherit; }\n</style>\n',
      run: (p) => scanFontStacks([p]),
      why: 'JOB 2, the two tokens and inherit are the only legitimate values and must pass',
    },
    {
      // Written at a path that really ends in src/app.css, so the shipped
      // isTokenFile predicate is exercised rather than restated.
      name: 'src/app.css',
      body: ":root {\n  --fs-font-display: 'Orbitron', system-ui, sans-serif;\n"
        + "  --fs-font-numeric: 'Orbitron', 'Courier New', monospace;\n"
        + '  font-family: var(--fs-font-display);\n}\n',
      run: (p) => scanFontStacks([p]),
      why: 'JOB 2, the canonical token definitions in app.css are the one place literal stacks live',
    },
    {
      name: 'clean-one-form.ts',
      body: "\nconst fr: Translations = {\n  a: 'Ce jeu n’est pas disponible.',\n  b: 'La relecture d’une mise.',\n}\n",
      run: (p) => scanApostrophes(p),
      why: 'a locale consistently using ONE apostrophe form must pass',
    },
  ]

  let allClean = true
  for (const c of controls) {
    const p = write(c.name, c.body)
    const found = c.run(p)
    const ok = found.length === 0
    console.log(`  ${ok ? 'clean  ' : 'FALSE+ '} ${c.name}: ${c.why}`)
    if (!ok) {
      allClean = false
      found.forEach((f) => console.log(`            unexpected: [${f.klass}] ${f.detail}`))
    }
    rmSync(p, { force: true })
  }

  rmSync(tmp, { recursive: true, force: true })

  if (!allRed || !allClean) {
    console.error('\nMACHINE TELL GATE SELF-TEST: FAIL. The gate does not catch what it claims to catch.')
    process.exit(1)
  }
  console.log(`\nMACHINE TELL GATE SELF-TEST: PASS (${cases.length} seeded violations caught, `
    + `${controls.length} negative controls clean)`)
  process.exit(0)
}

// ── source scan ──────────────────────────────────────────────────────────────
const sourceOnly = process.argv.includes('--source')

const srcFiles = walk(join(ROOT, 'src'), SRC_TEXT).filter((p) => !isTestFile(p))
const indexHtml = join(ROOT, 'index.html')
// THE BLIND SPOT R041 WALKED INTO. This read translations.ts alone, while
// `localeBlocks`'s FEATURE_BLOCK regex has always matched prose.locales.ts's
// identical `  fr: {` shape. The prose layer carries the paytable rules, the
// disclaimer and the mode blurbs, i.e. the longest sentences in the product and
// the ones most likely to contain an apostrophe at all, and none of it was ever
// scanned. The gate reported PASS over a mixed-apostrophe fr block.
const localeTables = [
  join(ROOT, 'src/lib/i18n/translations.ts'),
  join(ROOT, 'src/lib/i18n/prose.ts'),
  join(ROOT, 'src/lib/i18n/prose.locales.ts'),
]

const srcFindings = [
  ...scanGlyphs([...srcFiles, indexHtml], { skipComments: true }),
  ...scanPlaceholders([...srcFiles, indexHtml]),
  ...scanDoubleSpaces(srcFiles),
  ...localeTables.flatMap((f) => scanApostrophes(f)),
  ...localeTables.flatMap((f) => scanNumeralForms(f)),
  ...scanApostrophesAcrossTables(localeTables),
  ...scanMoney(srcFiles),
  ...scanCasingTransforms(srcFiles),
  ...scanFontStacks([...srcFiles, indexHtml]),
]

const srcOk = report(
  `SOURCE SCAN (${srcFiles.length + 1} files under src/ plus index.html)`,
  srcFindings,
)

if (sourceOnly) {
  process.exit(srcOk ? 0 : 1)
}

// ── dist scan ────────────────────────────────────────────────────────────────
//
// Dist is the authority for the two classes whose whole point is what actually
// reaches a player: a glyph is a glyph however it was authored, and the tab
// title is read straight out of the shipped HTML.
//
// The other classes are source-only ON PURPOSE, and this is a limit rather than
// an oversight: a minified bundle inlines CSS and third-party strings, so
// double spaces and apostrophe forms in dist are not reliably OURS. Claiming
// coverage there would be the same overreach that made a previous gate's PASS
// meaningless. Stated here so nobody reads the silence as coverage.
const distDir = join(ROOT, 'dist')
let distFiles = []
try {
  statSync(distDir)
  distFiles = walk(distDir, DIST_TEXT)
} catch {
  console.error('\nDIST SCAN: no dist/ found. Build first (npm run build), or use --source.')
  process.exit(1)
}

const distFindings = [
  ...scanGlyphs(distFiles, { skipComments: false }),
  ...scanPlaceholders(distFiles),
]
const distOk = report(`DIST SCAN (${distFiles.length} text files in dist/)`, distFindings)

if (!srcOk || !distOk) {
  console.error('\nSee docs/QUALITY_CHARTER.md for the class list and the fixes that closed each one.')
  process.exit(1)
}
console.log('\nMACHINE TELL GATE: PASS (source and dist both clean)')
