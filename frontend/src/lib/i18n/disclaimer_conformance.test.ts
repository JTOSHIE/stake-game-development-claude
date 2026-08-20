// disclaimer_conformance.test.ts - M02 of reports/qa/session3/MECHANISMS.md.
// Session 4a, 2026-07-29; rewritten by R076 and REVERSED by R077, both
// 2026-08-21. Run (from frontend/):
//   npx tsx src/lib/i18n/disclaimer_conformance.test.ts --self-test
//   npx tsx src/lib/i18n/disclaimer_conformance.test.ts
//
// ── WHAT THIS ASSERTS, AND THE TWO RULINGS BEHIND IT ────────────────────────
//
// R077, the owner's reversal on PRODUCTION EVIDENCE: every locale and both
// modes carry the platform's mandated text and NOTHING ELSE, ending exactly at
// its own closing line. Valkyrie's live disclaimer ships the mandated
// paragraph bare, the owner ruled on that capture, and the one trademark
// sentence R076 appended is gone from live code.
//
// R076, earlier the same day, is what R077 reverses in one respect and
// confirms in every other. From 2026-07-29 until then this gate held a
// PARAPHRASE: the platform's page permits "our template disclaimer, or your
// own, so long as the same message is clearly conveyed", the estate shipped
// its own wording in sixteen translations, and this gate asserted the
// structural invariants a translated paraphrase can break (sentence count, the
// RGS anchor, English concept coverage). The owner met the Start Approval form
// (Step 1 of 4) and the ruling was the LETTER. R077 takes it to the letter and
// nothing besides. Per convention (n) the later, better-informed instrument
// governs; R076's reasoning is kept here rather than erased, and its append is
// recorded as the overruled ruling in TR-176.
//
// Byte-identity subsumes the old invariants: a dropped clause, a merged
// sentence, a localised-away anchor and a missing concept are all one klass
// now, VERBATIM_DRIFT, caught at the first differing byte. The sentence-count
// and conveys machinery is therefore retired with the paraphrase it guarded.
//
// TRAILING_CONTENT IS ITS OWN KLASS, because it is the R077 defect exactly. A
// body carrying the mandated block correctly and then adding to it is not a
// drift; it is the thing the owner overruled. The finding says so and quotes
// what followed, rather than printing a length mismatch and leaving the reader
// to work out which end moved.
//
// REQ-016 IS RESOLVED, and R077 sharpens it. The old header parked it: is the
// template's closing line ("TM and © 2026 Stake Engine.") mandatory, and how
// does it sit against this project's own no-Stake-branding rule? The closing
// line SHIPS, verbatim, as part of the mandated block, and under R077 it is
// also the LAST thing the disclaimer says. The no-Stake-branding rule holds
// everywhere OUTSIDE that block, which is how the branding check below is
// scoped, and the tension is recorded here rather than decided quietly.
//
// WHAT IS STILL READ AT RUNTIME: the dated mirror. The mandated constant in
// disclaimer.ts must appear byte-exact in
// docs/stake-engine-live/general-disclaimer.md on every run, so a platform
// rewrite of the template rusts this gate loudly rather than a stale memory
// passing quietly, exactly as the old design intended.
//
// Every negative control is PAIRED with a seed exercising the same code path,
// and every seed names the KLASS it must produce, so a seed can never pass by
// tripping some other detector. Unchanged discipline from Session 3, tightened
// by R077 because two of its seeds now fire on more than one class at once.

import { readFileSync } from 'node:fs'
import { proseI18n, PROSE_SOCIAL } from './prose.ts'
import { LOCALE_CODES } from './translations.ts'
import { scanProhibited } from './vocabulary.ts'
import { DISCLAIMER_MANDATED } from './disclaimer.ts'

// ── The platform's template sentences, for granular mirror diagnostics ──────
// Each is a verbatim substring of DISCLAIMER_MANDATED; the whole-block check
// is the pin, these name WHICH sentence moved when it does.

const TEMPLATE_SENTENCES: Array<[string, string]> = [
  ['REQ-010', 'Malfunction voids all wins and plays.'],
  ['REQ-011', 'A consistent internet connection is required.'],
  ['REQ-012', 'In the event of a disconnection, reload the game to finish any uncompleted rounds.'],
  ['REQ-013', 'The expected return is calculated over many plays.'],
  ['REQ-014', 'The game display is not representative of any physical device and is for illustrative purposes only.'],
  ['REQ-015', 'Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser.'],
  ['REQ-016', 'TM and © 2026 Stake Engine.'],
]

// ── The predicate, extracted so the self-test can seed it directly ──────────

export type Finding = { req: string; locale: string; klass: string; detail: string }

const firstDiff = (a: string, b: string): string => {
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return `first diff at char ${i}: ${JSON.stringify(a.slice(i, i + 24))} vs ${JSON.stringify(b.slice(i, i + 24))}`
  }
  return `length ${a.length} vs ${b.length}`
}

/**
 * The R077 klass. A body that OPENS with the mandated block and then carries
 * on is the exact defect the owner overruled, so it is named and its tail is
 * quoted rather than being reported as a length mismatch.
 *
 * Returns null when the body is not of that shape, so the caller falls through
 * to the ordinary first-differing-byte diagnostic.
 */
const trailingFinding = (locale: string, body: string): Finding | null =>
  body.startsWith(DISCLAIMER_MANDATED) && body.length > DISCLAIMER_MANDATED.length
    ? {
        req: 'REQ-010..016', locale, klass: 'TRAILING_CONTENT',
        detail: `the mandated block is correct and ${JSON.stringify(body.slice(DISCLAIMER_MANDATED.length))} follows it; `
          + 'the shipped disclaimer ends at the mandated closing line and nothing may be appended',
      }
    : null

export function auditDisclaimers(
  bodies: Record<string, string>,
  socialBody: string,
  mirrorText: string,
): Finding[] {
  const out: Finding[] = []

  // 1. The platform still publishes the text we pinned. Whole block first,
  //    then per sentence for diagnostics.
  if (!mirrorText.includes(DISCLAIMER_MANDATED)) {
    out.push({
      req: 'REQ-010..016', locale: 'platform', klass: 'MIRROR_MOVED',
      detail: 'the dated mirror no longer carries the mandated block byte-exact; re-read the platform page before touching the constant',
    })
    for (const [req, sentence] of TEMPLATE_SENTENCES) {
      if (!mirrorText.includes(sentence)) {
        out.push({ req, locale: 'platform', klass: 'MIRROR_MOVED', detail: `the template sentence has moved: ${JSON.stringify(sentence)}` })
      }
    }
  }

  // 2. Every locale ships the mandated block byte-exact AND NOTHING ELSE: the
  //    body ends at the mandated closing line. A body that carries the block
  //    correctly and then adds to it gets its own klass, because that is the
  //    R077 defect rather than a drift; everything else reports at the first
  //    differing byte.
  for (const loc of Object.keys(bodies)) {
    const body = bodies[loc] ?? ''
    if (!body.trim()) {
      out.push({ req: 'REQ-010..016', locale: loc, klass: 'ABSENT', detail: 'no disclaimer body' })
    } else if (body !== DISCLAIMER_MANDATED) {
      out.push(trailingFinding(loc, body) ?? {
        req: 'REQ-010..016', locale: loc, klass: 'VERBATIM_DRIFT',
        detail: firstDiff(body, DISCLAIMER_MANDATED),
      })
    }
  }

  // 3. Social. The override is deliberately ABSENT (identical strings are
  //    absent rather than repeated), so empty is the expected state and a
  //    non-empty override must be byte-identical too. The prohibited-term
  //    scan then covers any future override AFTER the mandated block is
  //    stripped: THE EXEMPTION IS SCOPED TO THE EXACT MANDATED STRING AND
  //    NOTHING ELSE, per convention (n): the platform's own mandated wording
  //    outranks the vocabulary table within its own block ("wins",
  //    "Winnings" and the closing line included), and has no force one
  //    character outside it.
  if (socialBody.trim() && socialBody !== DISCLAIMER_MANDATED) {
    const trailing = trailingFinding('social', socialBody)
    out.push(trailing
      ? { ...trailing, req: 'REQ-038' }
      : {
          req: 'REQ-038', locale: 'social', klass: 'SOCIAL_DIVERGED',
          detail: firstDiff(socialBody, DISCLAIMER_MANDATED),
        })
  }
  const socialResidue = socialBody.split(DISCLAIMER_MANDATED).join(' ')
  for (const hit of scanProhibited(socialResidue, { includeNeverRewrite: true })) {
    out.push({
      req: 'REQ-038', locale: 'social', klass: 'PROHIBITED_TERM',
      detail: `the social disclaimer renders the restricted term ${JSON.stringify(hit)} outside the mandated block`,
    })
  }

  // 4. No Stake branding OUTSIDE the mandated block. The mandated closing
  //    line is the one sanctioned occurrence in shipped text (REQ-016,
  //    resolved by R076); anything beyond it is the defect the compliance
  //    rule exists for.
  //
  //    STATED SO NOBODY SIMPLIFIES IT AWAY: since R077 this can only fire on a
  //    body that has already failed check 2, because a passing body equals the
  //    block exactly and leaves no residue. It is kept as the diagnostic that
  //    names WHY a particular drift is a compliance defect rather than a typo.
  for (const loc of Object.keys(bodies)) {
    const residue = (bodies[loc] ?? '').split(DISCLAIMER_MANDATED).join(' ')
    if (/\bstake\b/i.test(residue)) {
      out.push({
        req: 'REQ-016', locale: loc, klass: 'BRANDING',
        detail: 'Stake branding outside the mandated block, which CLAUDE.md forbids in shipped text',
      })
    }
  }

  return out
}

// ── Live tables ─────────────────────────────────────────────────────────────

const MIRROR_PATH = '../docs/stake-engine-live/general-disclaimer.md'

function liveBodies(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const loc of LOCALE_CODES) {
    out[loc] = (proseI18n as Record<string, Record<string, string>>)[loc]?.disclaimerBody ?? ''
  }
  return out
}

const liveSocial = () =>
  (PROSE_SOCIAL as Record<string, string>).disclaimerBody ?? ''

// ── Convention (p): the seeded self-test ────────────────────────────────────
//
// The briefs' own words: what SHIPPED becomes the seeded violation. There are
// now two superseded families and both are planted byte for byte, which is the
// form the defect really occurred in each time.
//
//   Seeds 1, 2 and 6 plant the exact strings this repository shipped from
//   2026-07-29 until R076: the en paraphrase, its de translation, the social
//   override.
//   Seeds 3 and 4 plant the exact string it shipped from R076 until R077: the
//   mandated block with our trademark sentence appended, in a locale table and
//   as a social override.
//
// The R076 append is held as a LOCAL literal below and never imported. Its
// constants were deleted by R077, and a seed that imports the thing it exists
// to detect disappears the moment that thing is removed, which is how a gate
// quietly stops guarding a class it still claims to guard.

const OLD_EN_PARAPHRASE =
  'Malfunction voids all wins and plays. A stable internet connection is required to play. If your connection drops during a round, reload the game to finish any uncompleted round. The theoretical return to player is calculated over many thousands of plays and does not guarantee any result in a single session. This game display is for illustrative purposes only and does not represent a physical device. Winnings are settled according to the result returned by the Remote Game Server, not from events shown in the web browser.'

const OLD_DE_TRANSLATION =
  'Eine Fehlfunktion macht alle Gewinne und Spiele ungültig. Für das Spielen ist eine stabile Internetverbindung erforderlich. Wenn deine Verbindung während einer Runde abbricht, lade das Spiel neu, um eine nicht abgeschlossene Runde zu beenden. Die theoretische Auszahlungsquote an den Spieler wird über viele Tausend Spiele hinweg berechnet und garantiert kein Ergebnis in einer einzelnen Sitzung. Diese Spieldarstellung dient nur zur Veranschaulichung und stellt kein physisches Gerät dar. Gewinne werden gemäß dem Ergebnis abgerechnet, das vom Remote Game Server zurückgegeben wird, und nicht anhand der im Webbrowser angezeigten Ereignisse.'

const OLD_SOCIAL_PARAPHRASE =
  'Malfunction voids all prizes and plays. A stable internet connection is required to play. If your connection drops during a round, reload the game to finish any uncompleted round. The theoretical return to player is calculated over many thousands of plays and does not guarantee any result in a single session. This game display is for illustrative purposes only and does not represent a physical device. Prizes are settled according to the result returned by the Remote Game Server, not from events shown in the web browser.'

// R077's own superseded family: the sentence R076 appended, and the joined
// string that shipped between the two rulings. Local literals on purpose, per
// the note above.
const R076_APPENDED_MARKS =
  'Future Spinner and We Roll Spinners are trademarks of We Roll Spinners.'

const R076_APPENDED = `${DISCLAIMER_MANDATED} ${R076_APPENDED_MARKS}`

function selfTest(): void {
  let failures = 0
  const mirror = readFileSync(MIRROR_PATH, 'utf8')
  const clean = liveBodies()
  const cleanSocial = liveSocial()

  // R077 tightens this: a seed now names the KLASS its own detector must
  // produce, not merely a count. Two seeds legitimately fire on more than one
  // class at once (an append carrying prohibited vocabulary, a branding
  // sentence that is also trailing content), so a bare count would let a seed
  // pass on somebody else's finding while its own detector sat broken. That is
  // the convention (p) failure mode in its subtlest form: a green seed that
  // proves nothing about the thing it was written for.
  const run = (
    name: string,
    expectFindings: number,
    build: () => [Record<string, string>, string, string],
    expectKlass?: string,
  ) => {
    const [b, s, m] = build()
    const found = auditDisclaimers(b, s, m)
    const countOk = expectFindings === 0 ? found.length === 0 : found.length >= expectFindings
    const klassOk = !expectKlass || found.some((f) => f.klass === expectKlass)
    if (countOk && klassOk) console.log(`  ok   ${name}`)
    else {
      failures++
      console.error(`  FAIL ${name}\n    expected ${expectFindings ? '>= ' + expectFindings : '0'} findings`
        + `${expectKlass ? ` including klass ${expectKlass}` : ''}, got ${found.length}`)
      for (const f of found) console.error(`      ${f.req} ${f.locale} ${f.klass}: ${f.detail}`)
    }
  }

  const copy = () => JSON.parse(JSON.stringify(clean)) as Record<string, string>

  console.log('\nSEEDS, what actually shipped first, per the R076 and R077 briefs')

  run('SEED 1  the OLD SHIPPED en paraphrase, planted verbatim, is caught', 1, () => {
    const b = copy()
    b.en = OLD_EN_PARAPHRASE
    return [b, cleanSocial, mirror]
  }, 'VERBATIM_DRIFT')

  run('SEED 2  the OLD SHIPPED de translation, planted verbatim, is caught', 1, () => {
    const b = copy()
    b.de = OLD_DE_TRANSLATION
    return [b, cleanSocial, mirror]
  }, 'VERBATIM_DRIFT')

  // ── R077's own seed, and the reason this gate exists in its new shape ──────
  // The exact string this repository shipped between R076 and R077: the
  // mandated block, one space, our trademark sentence. Nothing about it is
  // synthetic. It reports at the byte after the mandated closing line, which
  // is where the append begins.
  run('SEED 3  the R076 APPENDED trademark sentence, planted verbatim, is caught as trailing content', 1, () => {
    const b = copy()
    b.ja = R076_APPENDED
    return [b, cleanSocial, mirror]
  }, 'TRAILING_CONTENT')

  // The same defect by its other route. Social has no override today, so this
  // is how the append could return on the mode nobody is looking at.
  run('SEED 4  the R076 APPENDED form reintroduced as a SOCIAL override is caught', 1, () =>
    [copy(), R076_APPENDED, mirror], 'TRAILING_CONTENT')

  run('SEED 5  a single-character drift in the mandated portion is caught', 1, () => {
    const b = copy()
    b.fr = b.fr.replace('any uncompleted rounds', 'any uncompleted round')
    return [b, cleanSocial, mirror]
  }, 'VERBATIM_DRIFT')

  // The old social paraphrase was written social-SAFE ("prizes", "plays"), so
  // it diverges without tripping the vocabulary scan: one finding, and the
  // seed says so rather than expecting a hit the text cannot produce. It does
  // NOT open with the mandated block, so SOCIAL_DIVERGED is its klass, which
  // is also what distinguishes it from SEED 4.
  run('SEED 6  the OLD social prizes paraphrase reintroduced as an override is caught as divergence', 1, () =>
    [copy(), OLD_SOCIAL_PARAPHRASE, mirror], 'SOCIAL_DIVERGED')

  // A sentence APPENDED to the mandated block carrying genuinely prohibited
  // vocabulary ("bet" and "currency" are on the platform's table; win-words
  // are the SUBSTITUTION layer's business, not this scan's). Two findings from
  // two different detectors, and the klass named here is the SCAN's, because
  // the trailing half is already proven by SEED 4: what this seed exists to
  // prove is that the exemption strip leaves appended text in scope.
  run('SEED 7  prohibited vocabulary APPENDED to the mandated block fires trailing content AND the scan', 2, () =>
    [copy(), DISCLAIMER_MANDATED + ' Bet in your currency.', mirror], 'PROHIBITED_TERM')

  run('SEED 8  Stake branding OUTSIDE the mandated block is caught', 1, () => {
    const b = copy()
    b.ru = b.ru + ' Powered by Stake.'
    return [b, cleanSocial, mirror]
  }, 'BRANDING')

  run('SEED 9  a platform template that has moved is caught', 1, () =>
    [copy(), cleanSocial, mirror.replace('Malfunction voids all wins and plays.', 'Malfunction voids nothing.')],
    'MIRROR_MOVED')

  run('SEED 10 an empty locale disclaimer is caught', 1, () => {
    const b = copy()
    b.zh = ''
    return [b, cleanSocial, mirror]
  }, 'ABSENT')

  console.log('\nNEGATIVE CONTROLS, each PAIRED with a seed above')

  // Paired with SEED 3, and the pairing matters more than usual now. Until
  // R077 a seed asserted that DROPPING the trademark sentence was a defect;
  // that seed inverted, because the dropped form IS the shipped form. So the
  // R077 direction is pinned by the live tables themselves: the clean tree is
  // sixteen bare mandated blocks, and this control is what says so.
  run('CONTROL 1  the clean tree, sixteen bare mandated blocks, social absent, PASSES', 0,
    () => [copy(), cleanSocial, mirror])

  // Paired with SEEDS 4 and 7: the exemption's own control. An override
  // carrying EXACTLY the mandated block must pass the prohibited scan although
  // the block says "wins" and "Winnings", because the exemption is scoped to
  // the block; and it must read as neither divergence nor trailing content,
  // because it is byte-identical with nothing after it.
  run('CONTROL 2  a social override of exactly the mandated block PASSES the scan', 0,
    () => [copy(), DISCLAIMER_MANDATED, mirror])

  // Paired with SEED 8: the mandated closing line's own "Stake Engine" is
  // sanctioned and must NOT flag, or the gate would be red on the clean tree.
  run('CONTROL 3  the mandated closing line is not mistaken for branding', 0, () => {
    const b = copy()
    if (!/Stake Engine\.$/.test(b.en)) throw new Error('control 3 no longer exercises the closing line as the LAST thing the body says')
    return [b, cleanSocial, mirror]
  })

  // Paired with SEED 9: the committed mirror satisfies the whole-block pin.
  run('CONTROL 4  the committed mirror carries the mandated block byte-exact', 0,
    () => [copy(), cleanSocial, mirror])

  if (failures) { console.error(`\nDISCLAIMER CONFORMANCE SELF-TEST: FAIL (${failures})`); process.exit(1) }
  console.log('\nDISCLAIMER CONFORMANCE SELF-TEST: PASS (10 seeds, 4 paired controls)')
}

// ── Entry ───────────────────────────────────────────────────────────────────

if (process.argv.includes('--self-test')) {
  selfTest()
} else {
  const mirror = readFileSync(MIRROR_PATH, 'utf8')
  const findings = auditDisclaimers(liveBodies(), liveSocial(), mirror)

  console.log(`\nDISCLAIMER CONFORMANCE, ${LOCALE_CODES.length} locales, mandated block verbatim and nothing appended (R077)`)
  console.log(`  mirror: docs/stake-engine-live/general-disclaimer.md`)
  console.log(`  pinned: ${DISCLAIMER_MANDATED.length} characters, ending ${JSON.stringify(DISCLAIMER_MANDATED.slice(-28))}`)

  if (findings.length) {
    console.error(`\n${findings.length} finding(s):`)
    for (const f of findings) console.error(`  ${f.req} ${f.locale} ${f.klass}: ${f.detail}`)
    console.error('\nDISCLAIMER CONFORMANCE: FAIL')
    process.exit(1)
  }
  console.log('\nDISCLAIMER CONFORMANCE: PASS')
}
