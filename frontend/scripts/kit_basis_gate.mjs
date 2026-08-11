// kit_basis_gate.mjs
//
// R043 PHASE 1e. THE DISCOVERY METHOD THAT FOUND SECTION K, TURNED INTO AN
// INSTRUMENT.
//
// OWNER_RULINGS_PRESUBMISSION.md section K records how the surviving old-basis
// string was actually found: "grepping the built kit for the German word A3 had
// just removed". No source gate saw it, because the basis of a claim is meaning
// rather than form, and the one instrument that did see it was a hand-typed
// grep that ran once. This file is that grep, kept, per locale, and seeded.
//
// TWO HALVES, BOTH AGAINST WHAT ACTUALLY SHIPS:
//
//   1. SUPERSEDED BASIS WORDS. The A3 ruling (R042) and R043 Phase 1a moved
//      every player-facing bet-basis claim from the total-bet phrase to the
//      base-bet phrase, per locale. The superseded phrases below must therefore
//      appear ZERO times in the built kit payload (frontend/dist, which is what
//      scripts/kit_build.mjs packages). Case-sensitive, deliberately: Polish
//      legitimately ships WYGRANA CAŁKOWITA (total WIN) in caps, and the
//      superseded phrases are lowercase mid-sentence forms.
//
//   2. EN-FORM FIGURES PER COMMA-DECIMAL LOCALE. In the ten locales where the
//      comma is the decimal separator, an English-punctuated figure is a
//      DIFFERENT NUMBER (R042 A2, R043 1b). The locale tables are evaluated
//      live, every string of every comma-decimal locale is checked for the two
//      en-form shapes, and any hit is then located in the kit text to prove
//      whether it shipped. Either way it is red: a source hit ships on the next
//      build.
//
// WHY THE FIGURE HALF READS THE SOURCE TABLES AS WELL AS THE KIT: the bundle
// interleaves all sixteen locales in one file, so a bare grep cannot say WHICH
// locale a figure belongs to, and `5,000×` is the correct English form. Locale
// attribution exists only in the tables; the kit proves shipment. Each side
// supplies what the other cannot (convention l.4: the two inputs are
// independent, the tables via tsx evaluation and the kit via bytes on disk).
//
// Run from frontend/ (dist must exist for the default run; build first):
//   npx tsx scripts/kit_basis_gate.mjs               scan dist
//   npx tsx scripts/kit_basis_gate.mjs --self-test   convention (p)
//
// EXIT SEMANTICS (TR-123, 2026-08-11): exit 0 on PASS, non-zero on FAIL, and
// the process terminates. This gate is static and always terminated on its
// own; the PASS exit is now EXPLICIT so the whole TR-123 family carries one
// contract, stated rather than relied on (see scripts/README.md).

import { readFileSync, readdirSync, statSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { join, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')

/**
 * The superseded basis phrases, per locale, exactly as they shipped before
 * R042 A3 and R043 1a removed them. Sources: the A3 table in
 * reports/briefs/FS_R042A_DISCLOSURE_INTEGRITY_Prompt.md, and the pre-R043
 * rulesOverdriveTrigger strings quoted in OWNER_RULINGS section K and visible
 * at `git show ce252a8:frontend/src/lib/i18n/translations.ts`.
 *
 * en and social use figure-anchored phrases ('10× total bet') rather than the
 * bare pair, because the social VOCABULARY layer legitimately ships the bare
 * mapping phrase 'total bet' -> 'total play' as rewriter data, and the social
 * rulesOverdriveBuy legitimately carries '100× your total play' (unruled;
 * recorded in the R043 session report rather than decided here).
 *
 * SIX LOCALES USE THE CLAIM FORM, NOT THE BARE WORD, AND THE GATE'S OWN FIRST
 * REAL RUN IS WHY. `rgTotalWagered`, the responsible-gambling panel's
 * cumulative "Total wagered" row, legitimately ships the bare total-bet word
 * in ar, de, hi, ja, ko and zh (translations.ts lines 398, 514, 978, 1210,
 * 1326, 2022): a session's total wagered genuinely is a total, and that label
 * makes no basis claim about an award. The superseded CLASS is the total-bet
 * phrase as an award or cap BASIS, which in these languages always carries a
 * case or particle marking (des/deinen ... Gesamteinsatzes, ...の, ...의,
 * ...的, ...का/के, من ...), so the claim-marked forms below catch every basis
 * sentence that shipped while the bare cumulative label stays legitimate. The
 * other nine locales are protected by case instead: their RG labels are
 * capitalised (Total misé, Tổng tiền cược) and the mid-sentence basis phrases
 * are not.
 */
export const SUPERSEDED_BASIS = {
  en: ['your total bet', '10× total bet'],
  social: ['10× of your total play'],
  ar: ['من إجمالي الرهان', 'من إجمالي رهانك'],
  de: ['Gesamteinsatzes', 'deinen Gesamteinsatz'],
  es: ['apuesta total'],
  fi: ['kokonaispanos'],
  fr: ['mise totale'],
  hi: ['कुल दांव का', 'कुल दांव के', 'कुल बेट के'],
  id: ['total taruhan'],
  ja: ['合計ベットの'],
  ko: ['총 베팅액의'],
  pl: ['całkowitej stawki', 'całkowitego zakładu'],
  pt: ['aposta total'],
  ru: ['общей ставки'],
  tr: ['toplam bahsin'],
  vi: ['tổng cược', 'tổng tiền cược'],
  zh: ['总投注的'],
}

const COMMA_DECIMAL = ['de', 'es', 'fi', 'fr', 'id', 'pl', 'pt', 'ru', 'tr', 'vi']

// The two en-form shapes, same predicates as machine_tell_gate.mjs's numeral
// scan: comma-grouped thousands, and a period decimal of at most two fraction
// digits beside a unit (three digits after a period is a thousands group in
// these locales, which is the CORRECT form).
const GROUPED = /\d,\d{3}(?!\d)/
const DECIMAL = /\d+\.\d{1,2}(?!\d)\s*[%×]/

const KIT_TEXT_EXT = new Set(['.js', '.css', '.html', '.json', '.svg', '.txt', '.md'])

function walk(dir, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const name of entries) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else if (KIT_TEXT_EXT.has(extname(name))) out.push(p)
  }
  return out
}

/** HALF 1: every superseded basis phrase occurs zero times in the kit text. */
export function scanBasis(kitFiles) {
  const out = []
  for (const p of kitFiles) {
    let text
    try { text = readFileSync(p, 'utf-8') } catch { continue }
    for (const [locale, phrases] of Object.entries(SUPERSEDED_BASIS)) {
      for (const phrase of phrases) {
        if (text.includes(phrase)) {
          out.push({
            half: 'basis', locale, phrase,
            file: relative(ROOT, p),
            detail: `superseded ${locale} basis phrase ${JSON.stringify(phrase)} is in the built kit`,
          })
        }
      }
    }
  }
  return out
}

/** HALF 2: no comma-decimal locale string carries an en-form figure; any that
 *  does is located in the kit text to prove whether it shipped. */
export function scanFigures(tables, kitText) {
  const out = []
  for (const locale of COMMA_DECIMAL) {
    for (const table of tables) {
      const block = table[locale]
      if (!block) continue
      for (const [key, value] of Object.entries(block)) {
        if (typeof value !== 'string') continue
        const hit = value.match(GROUPED) || value.match(DECIMAL)
        if (!hit) continue
        out.push({
          half: 'figure', locale, key,
          shipped: kitText.includes(value),
          detail: `locale '${locale}' renders ${JSON.stringify(hit[0])} in '${key}' `
            + '(comma-decimal locale, so a player reads a different number)',
        })
      }
    }
  }
  return out
}

/** HALF 3 (R047 TASK 1, closing TR-125's gate gap): no .svelte TEMPLATE text
 *  node carries a hardcoded figure with a separator. The round 4 review found
 *  '1,024' rendering en-form into ten comma-decimal locales, and this gate's
 *  figure half could not see it because it scans locale TABLE strings only; a
 *  component-hardcoded figure was structurally outside every scan. This half
 *  reads the markup section of every component (script and style blocks
 *  stripped, {expressions} and HTML comments blanked) and flags any digits
 *  beside a separator in rendered text, the exact form that shipped. */
export function scanTemplates(svelteFiles) {
  const out = []
  const FIGURE = /\d[.,]\d/
  for (const p of svelteFiles) {
    let src
    try { src = readFileSync(p, 'utf-8') } catch { continue }
    let tpl = src
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\{[^{}]*\}/g, ' ')      // template expressions render at runtime
    // Text nodes only: what sits between a closing '>' and the next '<'.
    const lines = tpl.split('\n')
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/>([^<>]+)</g)) {
        if (FIGURE.test(m[1])) {
          out.push({
            half: 'template', file: relative(ROOT, p), line: i + 1,
            detail: `hardcoded figure ${JSON.stringify(m[1].trim().slice(0, 40))} in a rendered template text node (route it through toLocaleString)`,
          })
        }
      }
    })
  }
  return out
}

function walkSvelte(dir, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const name of entries) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walkSvelte(p, out)
    else if (name.endsWith('.svelte')) out.push(p)
  }
  return out
}

function report(findings) {
  for (const f of findings) {
    console.error(`  [${f.half}] ${f.detail}${f.file ? ` (${f.file})` : ''}${f.half === 'figure' ? (f.shipped ? ' SHIPPED IN KIT' : ' source only, ships next build') : ''}`)
  }
}

// ── self-test, convention (p): the exact defects, in the forms they occurred ─
if (process.argv.includes('--self-test')) {
  const tmp = join(ROOT, '.kit-basis-selftest')
  rmSync(tmp, { recursive: true, force: true })
  mkdirSync(tmp, { recursive: true })

  // SEED 1, the section K defect itself: the pre-R043 German trigger sentence,
  // inside a minified-bundle-shaped asset, exactly where the discovery grep
  // found it.
  const deTrigger = 'rulesOverdriveTrigger:"3, 4 oder 5 Scatter vergeben 8, 12 oder 16 Freispiele und zahlen sofort 1×, 3× oder 10× des Gesamteinsatzes."'
  writeFileSync(join(tmp, 'index-seeded.js'), `const x={${deTrigger}};export default x;\n`)
  const basisHits = scanBasis(walk(tmp))
  const basisRed = basisHits.some((f) => f.locale === 'de' && f.phrase === 'Gesamteinsatzes')
  console.log(`  ${basisRed ? 'caught ' : 'MISSED '} seeded de Gesamteinsatz in a built asset (section K's own form)`)

  // SEED 2, the section F / section J defect class: an en-form figure inside a
  // comma-decimal locale's table, present in the kit text.
  const seededTables = [{
    de: { rulesMaxWin: 'Der Maximalgewinn ist auf 5,000× deinen Basiseinsatz begrenzt.' },
    fr: { modeOverboostBlurb: 'Double chance : environ 1.6× le taux de déclenchement.' },
  }]
  const seededKit = JSON.stringify(seededTables)
  const figHits = scanFigures(seededTables, seededKit)
  const figRed = figHits.some((f) => f.locale === 'de' && f.key === 'rulesMaxWin' && f.shipped)
    && figHits.some((f) => f.locale === 'fr' && f.key === 'modeOverboostBlurb' && f.shipped)
  console.log(`  ${figRed ? 'caught ' : 'MISSED '} seeded en-form figures (5,000 grouped, 1.6× decimal) in comma-decimal locales`)

  // NEGATIVE CONTROLS: the correct forms must pass both halves.
  writeFileSync(join(tmp, 'index-seeded.js'),
    'const x={rulesOverdriveTrigger:"3, 4 oder 5 Scatter ... 1×, 3× oder 10× des Basiseinsatzes."};\n')
  const cleanBasis = scanBasis(walk(tmp)).length === 0
  console.log(`  ${cleanBasis ? 'clean  ' : 'FALSE+ '} the corrected German basis passes`)
  const cleanTables = [{
    de: { rulesMaxWin: 'Der Maximalgewinn ist auf 5.000× deinen Basiseinsatz begrenzt.', modeOverboostBlurb: 'ca. 1,6× höhere Auslöserate. Zieht 1,25× pro Drehung ab.' },
  }]
  const cleanFig = scanFigures(cleanTables, JSON.stringify(cleanTables)).length === 0
  console.log(`  ${cleanFig ? 'clean  ' : 'FALSE+ '} the corrected comma-decimal forms (5.000×, 1,6×, 1,25×) pass`)

  // SEED 3, the R047 template class: the exact '1,024' form the round 4
  // review found in a rendered text node, beside the two forms that must
  // stay clean (a template expression, and digits inside a style block).
  mkdirSync(tmp, { recursive: true })
  writeFileSync(join(tmp, 'Seeded.svelte'),
    '<script>const n = 1024</script>\n'
    + '<style>.x { margin: 0.5rem; }</style>\n'
    + '<span class="x">1,024</span>\n')
  const tplHits = scanTemplates([join(tmp, 'Seeded.svelte')])
  const tplRed = tplHits.some((f) => f.detail.includes('1,024'))
  console.log(`  ${tplRed ? 'caught ' : 'MISSED '} seeded '1,024' in a rendered template text node (TR-125's own form)`)
  writeFileSync(join(tmp, 'Clean.svelte'),
    '<script>const n = 1024</script>\n'
    + '<style>.x { margin: 0.5rem; }</style>\n'
    + '<span class="x">{(1024).toLocaleString($locale)}</span>\n<svg viewBox="0 0 24.5 24"></svg>\n')
  const tplClean = scanTemplates([join(tmp, 'Clean.svelte')]).length === 0
  console.log(`  ${tplClean ? 'clean  ' : 'FALSE+ '} the localised expression, the style block and the attribute pass`)

  rmSync(tmp, { recursive: true, force: true })
  if (!basisRed || !figRed || !cleanBasis || !cleanFig || !tplRed || !tplClean) {
    console.error('\nKIT BASIS GATE SELF-TEST: FAIL')
    process.exit(1)
  }
  console.log('\nKIT BASIS GATE SELF-TEST: PASS (3 seeded violations caught, 3 negative controls clean)')
  process.exit(0)
}

// ── the real run ─────────────────────────────────────────────────────────────
const distDir = join(ROOT, 'dist')
try { statSync(distDir) } catch {
  console.error('KIT BASIS GATE: no dist/ found. Build first (npm run build).')
  process.exit(1)
}
const kitFiles = walk(distDir)
const kitText = kitFiles.map((p) => { try { return readFileSync(p, 'utf-8') } catch { return '' } }).join('\n')

const { featureI18n, locales, SOCIAL_OVERRIDES } = await import('../src/lib/i18n/translations.ts')
const { proseI18n } = await import('../src/lib/i18n/prose.ts')

const findings = [
  ...scanBasis(kitFiles),
  ...scanFigures([locales, featureI18n, proseI18n], kitText),
  ...scanTemplates(walkSvelte(join(ROOT, 'src'))),
]
// The social table is English; en is not a comma-decimal locale, so the figure
// half does not apply to it. Its basis phrases are covered by scanBasis above.
void SOCIAL_OVERRIDES

const phraseCount = Object.values(SUPERSEDED_BASIS).flat().length
if (findings.length) {
  console.error(`KIT BASIS GATE: FAIL, ${findings.length} finding(s) over ${kitFiles.length} kit files`)
  report(findings)
  process.exit(1)
}
console.log(`KIT BASIS GATE: PASS (${phraseCount} superseded basis phrases absent from ${kitFiles.length} kit files; `
  + `no en-form figure in any comma-decimal locale string)`)
process.exit(0)
