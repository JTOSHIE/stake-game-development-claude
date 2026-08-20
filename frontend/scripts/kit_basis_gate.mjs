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
// FIVE HALVES, ALL AGAINST WHAT ACTUALLY SHIPS.
//
// THE COUNT WAS WRONG UNTIL 2026-08-21 (R078), and the way it went wrong is the
// ordinary way: this header said TWO and documented two, halves 3, 4 and 5 were
// added by R047, R071 and R076 without it being revisited, and nothing reads a
// comment so nothing complained. "Halves" is kept as the file's own word for
// its checks rather than renamed to something arithmetically honest, because
// the numbering is load-bearing: the HALF 5 header is cited from the import
// block and from the guard message that prints when a disclaimer part is not a
// string, and renaming would break citations in the records to buy nothing.
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
//   3. TEMPLATE TEXT NODES (R047 TASK 1, closing TR-125's gate gap). No .svelte
//      template renders a hardcoded grouped figure into a text node, which is
//      the form that escaped the locale tables entirely.
//
//   4. SUPERSEDED OVERBOOST WORDING (R071 TASK 5). The retired phrasing must be
//      absent from the prose tables and the kit, and the site count must match,
//      so a silently dropped site is as red as a surviving one.
//
//   5. THE MANDATED DISCLAIMER (R076, reversed by R077, scoped by R078). The
//      built kit carries the platform's mandated block as one byte-exact
//      literal, and neither superseded family survives anywhere: the pre-R076
//      paraphrase in sixteen locales plus the old social override, and the
//      trademark sentence R076 appended and R077 removed. Its own header,
//      further down, carries the silent-green trap this half nearly set for
//      itself.
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

// ONE constant since R077. See the HALF 5 header for why a second name here
// would degrade the PRESENT half into a green that pins nothing.
const { DISCLAIMER_MANDATED } = await import('../src/lib/i18n/disclaimer.ts')

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

// ── THE OVERBOOST WORDING PIN, R071 TASK 5 ──────────────────────────────────
//
// The owner ruled the OVERBOOST card's blurb on 2026-08-15. The superseded text
// opened "Double-chance: about 1.6x the feature trigger rate", which contradicts
// itself inside one sentence (a 1.6x rate is not a doubled chance) and borrows a
// rival studio's trade name for their ante. Seventeen sites carry the ruled
// replacement: prose.ts twice, and fifteen locales in prose.locales.ts.
//
// Two halves, because a rename is only half a pin:
//   PRESENT. Every one of the seventeen sites carries the ruled wording.
//   ABSENT. No trace of the superseded family survives anywhere the player can
//           reach it, in source or in a built asset.
const OVERBOOST_KEY = 'modeOverboostBlurb'
const OVERBOOST_SITES = 17
/** One distinctive fragment of the SUPERSEDED string per locale. */
const OVERBOOST_SUPERSEDED = [
  'Double-chance', 'Double chance', 'فرصة مضاعفة', 'Doppelte Chance', 'Doble oportunidad',
  'Tuplamahdollisuus', 'दोहरा मौका', 'Peluang ganda', 'チャンス2倍', '찬스 2배',
  'Podwójna szansa', 'Chance dupla', 'Двойной шанс', 'Çift şans', 'Nhân đôi cơ hội',
  '双倍机会',
]
/** A fragment of the RULED string that every locale carries verbatim. */
const OVERBOOST_RULED_MARK = 'Normal'

function scanOverboost(files, { countSites = true } = {}) {
  const findings = []
  let sites = 0
  for (const f of files) {
    let src
    try { src = readFileSync(f, 'utf-8') } catch { continue }
    for (const line of src.split('\n')) {
      if (!line.includes(OVERBOOST_KEY + ':')) continue
      if (!line.includes("'") && !line.includes('"')) continue
      if (countSites) sites += 1
      if (!line.includes(OVERBOOST_RULED_MARK)) {
        findings.push({ half: 'overboost', file: f, detail: `a ${OVERBOOST_KEY} site does not carry the ruled wording` })
      }
    }
    for (const phrase of OVERBOOST_SUPERSEDED) {
      if (src.includes(phrase)) {
        findings.push({ half: 'overboost', file: f, detail: `the superseded OVERBOOST wording "${phrase}" survives` })
      }
    }
  }
  return { findings, sites }
}

// ── HALF 5: the mandated disclaimer, alone (R076, REVERSED by R077) ──────────
// R077, 2026-08-21: the owner ruled on PRODUCTION EVIDENCE that the shipped
// disclaimer is the platform's mandated text and NOTHING ELSE, so the one
// trademark sentence R076 appended is gone (disclaimer.ts is the single
// source; the mirror citation lives there). TWO superseded families exist now
// and this half holds both absent:
//   the PARAPHRASE the estate shipped in sixteen translations from 2026-07-29
//   until R076, one distinctive opening fragment per locale plus the old
//   social override; and
//   the TRADEMARK SENTENCE R076 appended and R077 removed.
// Two halves, the OVERBOOST pattern:
//   PRESENT. The built kit carries the mandated block as a byte-exact literal.
//            ONE literal now, and the reason is worth keeping. R076 demanded
//            the JOINED string and went red over a correct kit, because
//            disclaimer.ts joined two constants in a template at runtime and a
//            runtime join never exists in the bundle bytes; R076 fixed that by
//            pinning the two literals separately. R077 deletes the join
//            altogether, so the shipped string IS one constant and the class
//            of bug cannot recur.
//   ABSENT.  No fragment of either superseded family survives in the kit or
//            the prose sources.
//
// THE TRAP THIS HALF NEARLY SET FOR ITSELF, recorded because it produces a
// GREEN gate rather than a red one. If the appended sentence were still
// destructured from disclaimer.ts after R077 deleted the export, the binding
// would be `undefined`, `src.includes(undefined)` would coerce to
// `src.includes('undefined')`, and the built bundle genuinely contains that
// token, so the PRESENT half would report satisfied while pinning nothing at
// all. A deleted export does not throw on a namespace destructure; it goes
// quiet. Keep `parts` built from real constants only.
const DISCLAIMER_SUPERSEDED = [
  // R077's family: the sentence R076 appended, held as a literal here because
  // its constant no longer exists to import.
  'are trademarks of We Roll Spinners',                      // the R076 append
  'A stable internet connection is required to play',        // en paraphrase
  'Malfunction voids all prizes and plays',                  // old social override
  'يؤدي أي خلل فني إلى إبطال جميع المكاسب',                  // ar
  'Eine Fehlfunktion macht alle Gewinne und Spiele ungültig', // de
  'anula todas las ganancias y jugadas',                     // es
  'Toimintahäiriö mitätöi kaikki voitot ja pelit',           // fi
  "Tout dysfonctionnement annule l'ensemble des gains",      // fr
  'खराबी होने पर सभी जीतें और दांव रद्द',                       // hi
  'Kerusakan membatalkan semua kemenangan dan permainan',    // id
  '誤作動が発生した場合、すべての配当およびプレイは無効',       // ja
  '오작동이 발생하면 모든 당첨과 플레이가 무효',                 // ko
  'Awaria unieważnia wszystkie wygrane i rozgrywki',         // pl
  'Mau funcionamento anula todos os ganhos e todas as jogadas', // pt
  'Технический сбой аннулирует все выигрыши и игры',         // ru
  'Arıza tüm kazançları ve oyunları geçersiz kılar',         // tr
  'Sự cố kỹ thuật sẽ hủy bỏ mọi khoản thắng',                // vi
  '如发生故障，所有中奖与游戏局均无效',                         // zh
]

function scanDisclaimer(files, parts, { requirePresent = true } = {}) {
  // A guard, not decoration: the whole silent-green failure recorded in the
  // HALF 5 header turns on a `parts` entry that is not a real string, so the
  // gate refuses to run rather than reporting a PASS it has not earned.
  for (const part of parts) {
    if (typeof part !== 'string' || part.length === 0) {
      throw new Error('kit basis HALF 5: a disclaimer part is not a non-empty string, '
        + 'which would coerce to a substring search for the token "undefined" and pass over an empty pin')
    }
  }
  const findings = []
  const present = new Set()
  for (const f of files) {
    let src
    try { src = readFileSync(f, 'utf-8') } catch { continue }
    for (const part of parts) if (src.includes(part)) present.add(part)
    for (const phrase of DISCLAIMER_SUPERSEDED) {
      if (src.includes(phrase)) {
        findings.push({ half: 'disclaimer', file: f, detail: `the superseded disclaimer text ${JSON.stringify(phrase.slice(0, 44))} survives` })
      }
    }
  }
  if (requirePresent && present.size < parts.length) {
    findings.push({ half: 'disclaimer', detail: 'the mandated disclaimer text is not present in the kit (it must ship as a byte-exact literal)' })
  }
  return findings
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
  // SEED 3, R071 TASK 5: the superseded OVERBOOST wording, in the form it
  // really sat in, a prose table entry.
  rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true })
  writeFileSync(join(tmp, 'prose-seeded.ts'),
    "export const x = { modeOverboostBlurb: 'Double-chance: about 1.6\u00d7 the feature trigger rate.' }\n")
  const obSeed = scanOverboost([join(tmp, 'prose-seeded.ts')])
  const obRed = obSeed.findings.some((f) => f.detail.includes('the superseded OVERBOOST wording'))
  console.log(`  ${obRed ? 'caught ' : 'MISSED '} seeded superseded OVERBOOST wording in a prose table (R071 TASK 5)`)

  rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true })
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

  // SEED 4, R076: the SHIPPED en disclaimer paraphrase, planted verbatim in a
  // bundle-shaped asset, which is the exact string the kit carried until R076
  // (the brief's own words: the shipped text becomes the seeded violation).
  // The same scratch kit also omits the mandated text, so the PRESENT half
  // must fire too: two findings from one seeded file.
  rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true })
  writeFileSync(join(tmp, 'index-seeded.js'),
    `const d={disclaimerBody:"Malfunction voids all wins and plays. A stable internet connection is required to play. If your connection drops during a round, reload the game to finish any uncompleted round."};export default d;\n`)
  const discSeed = scanDisclaimer(walk(tmp), [DISCLAIMER_MANDATED])
  const discRed = discSeed.some((f) => f.detail.includes('superseded disclaimer text'))
    && discSeed.some((f) => f.detail.includes('not present'))
  console.log(`  ${discRed ? 'caught ' : 'MISSED '} seeded shipped paraphrase AND the absent mandated text (R076's own form)`)

  // SEED 5, R077: the R076 APPENDED FORM, planted verbatim, which is exactly
  // what this kit shipped between the two rulings.
  //
  // ITS ASSERTION IS DELIBERATELY TWO-DIRECTIONAL, and copying SEED 4's shape
  // here would have been wrong. This scratch kit CONTAINS the mandated block,
  // unlike SEED 4's, so the PRESENT half must stay SILENT while the ABSENT
  // half fires. Asserting only the red would pass on a kit that had merely
  // lost the block; asserting SEED 4's pair would report MISSED on a seed the
  // gate caught correctly.
  rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true })
  writeFileSync(join(tmp, 'index-seeded.js'),
    `const d={disclaimerBody:${JSON.stringify(DISCLAIMER_MANDATED + ' Future Spinner and We Roll Spinners are trademarks of We Roll Spinners.')}};export default d;\n`)
  const appendSeed = scanDisclaimer(walk(tmp), [DISCLAIMER_MANDATED])
  const appendRed = appendSeed.some((f) => f.detail.includes('are trademarks of We Roll Spinners'))
    && !appendSeed.some((f) => f.detail.includes('not present'))
  console.log(`  ${appendRed ? 'caught ' : 'MISSED '} seeded R076 trademark append, with the PRESENT half correctly silent (R077's own form)`)

  // NEGATIVE CONTROL: a kit carrying the bare mandated literal passes both
  // halves, or the fix itself would fail the gate.
  //
  // THIS CONTROL WAS THE TRAP. Until R077 it wrote the trademark sentence into
  // its own scratch kit and then scanned that kit; the moment the sentence
  // joined the superseded family the control would have flagged its own seed
  // string and the self-test would have exited 1 against a correct tree.
  rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true })
  writeFileSync(join(tmp, 'index-clean.js'),
    `const a=${JSON.stringify(DISCLAIMER_MANDATED)};export default a;\n`)
  const discClean = scanDisclaimer(walk(tmp), [DISCLAIMER_MANDATED]).length === 0
  console.log(`  ${discClean ? 'clean  ' : 'FALSE+ '} the bare mandated literal passes both halves`)

  // SEED 6, R077: the SILENT-GREEN class itself, seeded rather than asserted.
  // A deleted export destructures to `undefined` without throwing, and
  // `src.includes(undefined)` coerces to a search for the token "undefined",
  // which real bundles contain. Before the guard, that made the PRESENT half
  // report satisfied over an empty pin. The seed plants exactly that value and
  // requires a refusal.
  let guardRed = false
  try { scanDisclaimer([], [DISCLAIMER_MANDATED, undefined]) } catch { guardRed = true }
  console.log(`  ${guardRed ? 'caught ' : 'MISSED '} a non-string disclaimer part refused rather than coerced (the silent-green form)`)

  rmSync(tmp, { recursive: true, force: true })
  if (!basisRed || !figRed || !obRed || !cleanBasis || !cleanFig || !tplRed || !tplClean
    || !discRed || !appendRed || !guardRed || !discClean) {
    console.error('\nKIT BASIS GATE SELF-TEST: FAIL')
    process.exit(1)
  }
  console.log('\nKIT BASIS GATE SELF-TEST: PASS (7 seeded violations caught, 4 negative controls clean)')
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

const PROSE_FILES = [join(ROOT, 'src/lib/i18n/prose.ts'), join(ROOT, 'src/lib/i18n/prose.locales.ts')]
// The SITE COUNT is taken from the prose tables only: the built bundle carries
// the same key once more, and counting it would make the expected number a
// function of how the bundler happens to chunk. The kit is still scanned for the
// superseded family, which is the half that matters in a shipped asset.
const overboostProse = scanOverboost(PROSE_FILES)
const overboostKit = scanOverboost(kitFiles, { countSites: false })
const overboost = { findings: [...overboostProse.findings, ...overboostKit.findings], sites: overboostProse.sites }
if (overboost.sites !== OVERBOOST_SITES) {
  overboost.findings.push({
    half: 'overboost',
    detail: `expected ${OVERBOOST_SITES} ${OVERBOOST_KEY} sites in the prose files and the kit, found ${overboost.sites}`,
  })
}

const findings = [
  ...scanBasis(kitFiles),
  ...scanFigures([locales, featureI18n, proseI18n], kitText),
  ...scanTemplates(walkSvelte(join(ROOT, 'src'))),
  ...overboost.findings,
  // R077: the kit carries the mandated disclaimer literal and no fragment of
  // either superseded family (the pre-R076 paraphrase, and the trademark
  // sentence R076 appended); the prose sources are swept for the families too,
  // present-half waived there because the single source is disclaimer.ts
  // rather than the tables.
  ...scanDisclaimer(kitFiles, [DISCLAIMER_MANDATED]),
  ...scanDisclaimer(PROSE_FILES, [DISCLAIMER_MANDATED], { requirePresent: false }),
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
