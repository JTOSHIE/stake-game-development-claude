// disclaimer_conformance.test.ts - M02 of reports/qa/session3/MECHANISMS.md.
// Session 4a, 2026-07-29; REWRITTEN by R076, 2026-08-21. Run (from frontend/):
//   npx tsx src/lib/i18n/disclaimer_conformance.test.ts --self-test
//   npx tsx src/lib/i18n/disclaimer_conformance.test.ts
//
// ── WHAT CHANGED IN R076, AND WHY THE OLD DESIGN IS GONE ────────────────────
//
// From 2026-07-29 to R076 this gate held a PARAPHRASE: the platform's page
// permits "our template disclaimer, or your own, so long as the same message
// is clearly conveyed", the estate shipped its own wording in sixteen
// translations, and this gate asserted the structural invariants a translated
// paraphrase can break (sentence count, the RGS anchor, English concept
// coverage). The owner then met the Start Approval form (Step 1 of 4), and
// the ruling that came back is the LETTER: the mandated text ships VERBATIM,
// untranslated, byte-exact, identical in all sixteen locales and both modes,
// followed by exactly one appended sentence retaining our marks. The
// substance-versus-letter lesson rides the tracker row.
//
// Byte-identity subsumes the old invariants: a dropped clause, a merged
// sentence, a localised-away anchor and a missing concept are all one klass
// now, VERBATIM_DRIFT, caught at the first differing byte. The sentence-count
// and conveys machinery is therefore retired with the paraphrase it guarded.
//
// REQ-016 IS RESOLVED. The old header parked it: is the template's closing
// line ("TM and © 2026 Stake Engine.") mandatory, and how does it sit against
// this project's own no-Stake-branding rule? The R076 ruling answers both on
// the owner's own find: the closing line SHIPS, verbatim, as part of the
// mandated block, and the no-Stake-branding rule holds everywhere OUTSIDE
// that block. The branding check below is scoped exactly that way, per
// convention (n): the later, better-informed instrument governs, and the
// tension is recorded here rather than decided quietly.
//
// WHAT IS STILL READ AT RUNTIME: the dated mirror. The mandated constant in
// disclaimer.ts must appear byte-exact in
// docs/stake-engine-live/general-disclaimer.md on every run, so a platform
// rewrite of the template rusts this gate loudly rather than a stale memory
// passing quietly, exactly as the old design intended.
//
// Every negative control is PAIRED with a seed exercising the same code path,
// unchanged discipline from Session 3.

import { readFileSync } from 'node:fs'
import { proseI18n, PROSE_SOCIAL } from './prose.ts'
import { LOCALE_CODES } from './translations.ts'
import { scanProhibited } from './vocabulary.ts'
import { DISCLAIMER_MANDATED, DISCLAIMER_VERBATIM } from './disclaimer.ts'

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

  // 2. Every locale ships the mandated block byte-exact, our one appended
  //    sentence included. One klass; the first differing byte is the report.
  for (const loc of Object.keys(bodies)) {
    const body = bodies[loc] ?? ''
    if (!body.trim()) {
      out.push({ req: 'REQ-010..016', locale: loc, klass: 'ABSENT', detail: 'no disclaimer body' })
    } else if (body !== DISCLAIMER_VERBATIM) {
      out.push({ req: 'REQ-010..016', locale: loc, klass: 'VERBATIM_DRIFT', detail: firstDiff(body, DISCLAIMER_VERBATIM) })
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
  if (socialBody.trim() && socialBody !== DISCLAIMER_VERBATIM) {
    out.push({
      req: 'REQ-038', locale: 'social', klass: 'SOCIAL_DIVERGED',
      detail: firstDiff(socialBody, DISCLAIMER_VERBATIM),
    })
  }
  const socialResidue = socialBody.split(DISCLAIMER_VERBATIM).join(' ')
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
// The brief's own words: the shipped paraphrase becomes the seeded violation.
// Seeds 1, 2 and 5 plant the EXACT strings this repository shipped until
// R076, byte for byte, which is the form the defect really occurred in.

const OLD_EN_PARAPHRASE =
  'Malfunction voids all wins and plays. A stable internet connection is required to play. If your connection drops during a round, reload the game to finish any uncompleted round. The theoretical return to player is calculated over many thousands of plays and does not guarantee any result in a single session. This game display is for illustrative purposes only and does not represent a physical device. Winnings are settled according to the result returned by the Remote Game Server, not from events shown in the web browser.'

const OLD_DE_TRANSLATION =
  'Eine Fehlfunktion macht alle Gewinne und Spiele ungültig. Für das Spielen ist eine stabile Internetverbindung erforderlich. Wenn deine Verbindung während einer Runde abbricht, lade das Spiel neu, um eine nicht abgeschlossene Runde zu beenden. Die theoretische Auszahlungsquote an den Spieler wird über viele Tausend Spiele hinweg berechnet und garantiert kein Ergebnis in einer einzelnen Sitzung. Diese Spieldarstellung dient nur zur Veranschaulichung und stellt kein physisches Gerät dar. Gewinne werden gemäß dem Ergebnis abgerechnet, das vom Remote Game Server zurückgegeben wird, und nicht anhand der im Webbrowser angezeigten Ereignisse.'

const OLD_SOCIAL_PARAPHRASE =
  'Malfunction voids all prizes and plays. A stable internet connection is required to play. If your connection drops during a round, reload the game to finish any uncompleted round. The theoretical return to player is calculated over many thousands of plays and does not guarantee any result in a single session. This game display is for illustrative purposes only and does not represent a physical device. Prizes are settled according to the result returned by the Remote Game Server, not from events shown in the web browser.'

function selfTest(): void {
  let failures = 0
  const mirror = readFileSync(MIRROR_PATH, 'utf8')
  const clean = liveBodies()
  const cleanSocial = liveSocial()

  const run = (
    name: string,
    expectFindings: number,
    build: () => [Record<string, string>, string, string],
  ) => {
    const [b, s, m] = build()
    const found = auditDisclaimers(b, s, m)
    const ok = expectFindings === 0 ? found.length === 0 : found.length >= expectFindings
    if (ok) console.log(`  ok   ${name}`)
    else {
      failures++
      console.error(`  FAIL ${name}\n    expected ${expectFindings ? '>= ' + expectFindings : '0'} findings, got ${found.length}`)
      for (const f of found) console.error(`      ${f.req} ${f.locale} ${f.klass}: ${f.detail}`)
    }
  }

  const copy = () => JSON.parse(JSON.stringify(clean)) as Record<string, string>

  console.log('\nSEEDS, the shipped paraphrase first, per the R076 brief')

  run('SEED 1  the OLD SHIPPED en paraphrase, planted verbatim, is caught', 1, () => {
    const b = copy()
    b.en = OLD_EN_PARAPHRASE
    return [b, cleanSocial, mirror]
  })

  run('SEED 2  the OLD SHIPPED de translation, planted verbatim, is caught', 1, () => {
    const b = copy()
    b.de = OLD_DE_TRANSLATION
    return [b, cleanSocial, mirror]
  })

  run('SEED 3  a single-character drift in the mandated portion is caught', 1, () => {
    const b = copy()
    b.fr = b.fr.replace('any uncompleted rounds', 'any uncompleted round')
    return [b, cleanSocial, mirror]
  })

  run('SEED 4  our appended trademark sentence dropped is caught', 1, () => {
    const b = copy()
    b.ja = DISCLAIMER_MANDATED
    return [b, cleanSocial, mirror]
  })

  // The old social paraphrase was written social-SAFE ("prizes", "plays"), so
  // it diverges without tripping the vocabulary scan: one finding, and the
  // seed says so rather than expecting a hit the text cannot produce.
  run('SEED 5  the OLD social prizes paraphrase reintroduced as an override is caught as divergence', 1, () =>
    [copy(), OLD_SOCIAL_PARAPHRASE, mirror])

  // A sentence APPENDED to the mandated block carrying genuinely prohibited
  // vocabulary ("bet" and "currency" are on the platform's table; win-words
  // are the SUBSTITUTION layer's business, not this scan's). This is the
  // realistic future failure: the block itself is pasted correctly and
  // someone adds to it. Divergence AND the scan both fire, which also proves
  // the exemption strip leaves the appended text in scope.
  run('SEED 5b prohibited vocabulary APPENDED to the mandated block fires divergence AND the scan', 2, () =>
    [copy(), DISCLAIMER_VERBATIM + ' Bet in your currency.', mirror])

  run('SEED 6  Stake branding OUTSIDE the mandated block is caught', 1, () => {
    const b = copy()
    b.ru = b.ru + ' Powered by Stake.'
    return [b, cleanSocial, mirror]
  })

  run('SEED 7  a platform template that has moved is caught', 1, () =>
    [copy(), cleanSocial, mirror.replace('Malfunction voids all wins and plays.', 'Malfunction voids nothing.')])

  run('SEED 8  an empty locale disclaimer is caught', 1, () => {
    const b = copy()
    b.zh = ''
    return [b, cleanSocial, mirror]
  })

  console.log('\nNEGATIVE CONTROLS, each PAIRED with a seed above')

  run('CONTROL 1  the clean tree, sixteen byte-identical locales, social absent, PASSES', 0,
    () => [copy(), cleanSocial, mirror])

  // Paired with SEED 5: the exemption's own control. An override carrying
  // EXACTLY the mandated block must pass the prohibited scan although the
  // block says "wins" and "Winnings", because the exemption is scoped to the
  // block; and it must not read as divergence, because it is byte-identical.
  run('CONTROL 2  a social override of exactly the mandated block PASSES the scan', 0,
    () => [copy(), DISCLAIMER_VERBATIM, mirror])

  // Paired with SEED 6: the mandated closing line's own "Stake Engine" is
  // sanctioned and must NOT flag, or the gate would be red on the clean tree.
  run('CONTROL 3  the mandated closing line is not mistaken for branding', 0, () => {
    const b = copy()
    if (!/Stake Engine\./.test(b.en)) throw new Error('control 3 no longer exercises the closing line')
    return [b, cleanSocial, mirror]
  })

  // Paired with SEED 7: the committed mirror satisfies the whole-block pin.
  run('CONTROL 4  the committed mirror carries the mandated block byte-exact', 0,
    () => [copy(), cleanSocial, mirror])

  if (failures) { console.error(`\nDISCLAIMER CONFORMANCE SELF-TEST: FAIL (${failures})`); process.exit(1) }
  console.log('\nDISCLAIMER CONFORMANCE SELF-TEST: PASS (9 seeds, 4 paired controls)')
}

// ── Entry ───────────────────────────────────────────────────────────────────

if (process.argv.includes('--self-test')) {
  selfTest()
} else {
  const mirror = readFileSync(MIRROR_PATH, 'utf8')
  const findings = auditDisclaimers(liveBodies(), liveSocial(), mirror)

  console.log(`\nDISCLAIMER CONFORMANCE, ${LOCALE_CODES.length} locales, mandated block verbatim (R076)`)
  console.log(`  mirror: docs/stake-engine-live/general-disclaimer.md`)

  if (findings.length) {
    console.error(`\n${findings.length} finding(s):`)
    for (const f of findings) console.error(`  ${f.req} ${f.locale} ${f.klass}: ${f.detail}`)
    console.error('\nDISCLAIMER CONFORMANCE: FAIL')
    process.exit(1)
  }
  console.log('\nDISCLAIMER CONFORMANCE: PASS')
}
