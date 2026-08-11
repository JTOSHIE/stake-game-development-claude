// disclaimer_conformance.test.ts - M02 of reports/qa/session3/MECHANISMS.md.
// Session 4a, 2026-07-29. Run (from frontend/):
//   npx tsx src/lib/i18n/disclaimer_conformance.test.ts --self-test
//   npx tsx src/lib/i18n/disclaimer_conformance.test.ts
//
// SEVEN platform requirements had no proof path and all seven are properties of
// one artefact: the disclaimer prose, in sixteen locales, in both modes.
//
//   REQ-010  a malfunction voids all wins and plays
//   REQ-011  a consistent internet connection is required
//   REQ-012  reload after a disconnection to finish incomplete rounds
//   REQ-013  expected return is a long-run figure
//   REQ-014  the display is illustrative and models no physical machine
//   REQ-015  the RGS response, not the frontend, settles winnings
//   REQ-038  in social mode, never render "currency"; use "token"
//
// REQ-016 is NOT held here and is deliberately left parked. It asks whether the
// platform template's closing line ("TM and (c) 2026 Stake Engine.") is itself
// mandatory or is merely part of a template a studio may replace under R1-19.
// NO_PROOF_SET.tsv records it as UNKNOWN and says in terms that it "should be
// ruled". It also sits directly against this project's own no-Stake-branding
// rule. A gate cannot resolve that; an authority has to. Asserting either
// answer here would be inventing a ruling, which is the wrongly-solved failure
// convention (l.6) names. What IS asserted below is the half that is a
// property rather than a question: no Stake branding reaches the disclaimer.
//
// ── WHY THESE ASSERTIONS AND NOT A TRANSLATION CHECK ────────────────────────
//
// The obvious design is to check each locale conveys each of the six meanings.
// Nothing mechanical can do that across sixteen languages, and a gate that
// pretends otherwise is worse than none. So the gate asserts the STRUCTURAL
// invariants that the real defect breaks, and those are language independent:
//
//   1. SENTENCE COUNT. The disclaimer is six required statements and is written
//      as six sentences. A clause dropped in translation drops the count. This
//      is the form the defect actually takes: a translator shortens, merges or
//      omits a sentence and no reviewer reads sixteen languages to notice.
//      Measured on the clean tree: all sixteen locales are exactly 6, from zh
//      at 190 characters to es at 649. The invariant is real, not hopeful.
//
//   2. THE "Remote Game Server" ANCHOR. Every locale carries that exact Latin
//      string, including ja, ko, zh, ar, hi and ru, because it is the platform
//      component's proper name and is kept untranslated beside the localised
//      gloss. It is REQ-015's anchor and it is checkable in any script.
//
//   3. ENGLISH CONCEPT COVERAGE against the PLATFORM'S OWN TEMPLATE, read from
//      the dated mirror at runtime rather than remembered. The platform permits
//      our own wording "so long as the same message is clearly conveyed", so
//      the English side is matched by concept and the mirror side by verbatim
//      quotation, per convention (l.7). If the platform rewrites its template,
//      this goes red and a human re-reads the requirement, which is the
//      correct outcome rather than a gate quietly checking a stale memory.
//
// ── WHAT MAKES IT GO RED ────────────────────────────────────────────────────
//
// Convention (p) is not "write a test for the gate", it is plant the defect in
// the form it really occurs and prove the gate goes red. The self-test below
// plants, for each of the seven requirements, the defect that requirement
// exists to prevent, in the shape the tree would really carry it: a dropped
// sentence in a non-English locale, a merged pair, the anchor localised away,
// an English clause deleted, a platform template that has moved, and the social
// disclaimer carrying real-money vocabulary.
//
// Every negative control is PAIRED with a positive seed exercising the same
// code path. Session 3's scope work is the reason: three of its controls passed
// because nothing was being scanned rather than because the exclusion worked,
// and only a paired positive exposed it. A control with no paired positive
// proves the gate is silent, not that it is correct.

import { readFileSync } from 'node:fs'
import { proseI18n, PROSE_SOCIAL, en as proseEn } from './prose.ts'
import { LOCALE_CODES } from './translations.ts'
import { scanProhibited } from './vocabulary.ts'

// ── The six statements ───────────────────────────────────────────────────────
//
// `platform` is quoted VERBATIM from docs/stake-engine-live/general-disclaimer.md
// (fetched 2026-07-04), per convention (l.7): compliance text is quoted, never
// paraphrased. `conveys` matches OUR wording, which the platform expressly
// permits to differ. Mode-tolerant, because social mode substitutes the
// real-money vocabulary and the statement survives the substitution:
// "voids all wins" becomes "voids all prizes" and must still match.

type Statement = {
  req: string
  what: string
  platform: string
  conveys: RegExp
}

export const STATEMENTS: Statement[] = [
  {
    req: 'REQ-010',
    what: 'a malfunction voids all wins and plays',
    platform: 'Malfunction voids all wins and plays.',
    conveys: /malfunction voids all (wins|prizes) and plays/i,
  },
  {
    req: 'REQ-011',
    what: 'a consistent internet connection is required',
    platform: 'A consistent internet connection is required.',
    conveys: /(stable|consistent) internet connection is required/i,
  },
  {
    req: 'REQ-012',
    what: 'reload after a disconnection to finish incomplete rounds',
    platform: 'In the event of a disconnection, reload the game to finish any uncompleted rounds.',
    conveys: /reload the game to finish any uncompleted round/i,
  },
  {
    req: 'REQ-013',
    what: 'expected return is a long-run figure',
    platform: 'The expected return is calculated over many plays.',
    conveys: /(theoretical return to player|expected return) is calculated over many/i,
  },
  {
    req: 'REQ-014',
    what: 'the display is illustrative and models no physical machine',
    platform: 'The game display is not representative of any physical device and is for illustrative purposes only.',
    conveys: /for illustrative purposes only and does not represent a physical device/i,
  },
  {
    req: 'REQ-015',
    what: 'the RGS response, not the frontend, settles winnings',
    platform: 'Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser.',
    conveys: /(winnings|prizes) are settled according to the result returned by the Remote Game Server/i,
  },
]

/** The platform component's proper name, kept untranslated in every locale. */
const RGS_ANCHOR = 'Remote Game Server'

/** One sentence terminator per required statement. Latin, CJK and Devanagari. */
const TERMINATOR = /[.。।]/g

const countSentences = (s: string) => (s.match(TERMINATOR) || []).length

// ── The predicate, extracted so the self-test can seed it directly ───────────
//
// It takes the tables as arguments rather than reading the modules, which is
// the only way a seeded defect can be planted without writing to the source
// tree. doc_currency_gate.mjs is the worked example of the same shape.

export type Finding = { req: string; locale: string; klass: string; detail: string }

export function auditDisclaimers(
  bodies: Record<string, string>,
  socialBody: string,
  mirrorText: string,
): Finding[] {
  const out: Finding[] = []
  const expected = STATEMENTS.length

  // 1. The platform template still says what we transcribed it as saying.
  for (const st of STATEMENTS) {
    if (!mirrorText.includes(st.platform)) {
      out.push({
        req: st.req, locale: 'platform', klass: 'MIRROR_MOVED',
        detail: `the dated mirror no longer carries the template sentence for ${st.what}`,
      })
    }
  }

  // 2. English carries all six statements. This is the only place meaning is
  //    checked, and it is checked in the one language that can be.
  const en = bodies.en ?? ''
  for (const st of STATEMENTS) {
    if (!st.conveys.test(en)) {
      out.push({
        req: st.req, locale: 'en', klass: 'STATEMENT_MISSING',
        detail: `the English disclaimer no longer conveys ${st.what}`,
      })
    }
  }

  // 3. Every locale is structurally complete. A dropped clause is the real
  //    defect and this is what sees it in a language nobody here reads.
  for (const loc of Object.keys(bodies)) {
    const body = bodies[loc] ?? ''
    if (!body.trim()) {
      out.push({ req: 'REQ-010..015', locale: loc, klass: 'ABSENT', detail: 'no disclaimer body' })
      continue
    }
    const n = countSentences(body)
    if (n !== expected) {
      out.push({
        req: 'REQ-010..015', locale: loc, klass: 'SENTENCE_COUNT',
        detail: `${n} sentences, expected ${expected}; a required statement has been dropped or merged`,
      })
    }
    if (!body.includes(RGS_ANCHOR)) {
      out.push({
        req: 'REQ-015', locale: loc, klass: 'ANCHOR_MISSING',
        detail: `the untranslated "${RGS_ANCHOR}" anchor is absent, so the settling authority is unidentifiable`,
      })
    }
  }

  // 4. Social mode. Structurally identical, and carrying none of the
  //    real-money vocabulary. includeNeverRewrite is ON deliberately: it is
  //    what puts "currency" and "stake" back in scope, and REQ-038 is exactly
  //    the claim that "currency" never reaches a player-visible string.
  //    NOT_SUBSTITUTED asserts that as a justification; this tests it.
  if (!socialBody.trim()) {
    out.push({ req: 'REQ-038', locale: 'social', klass: 'ABSENT', detail: 'no social disclaimer body' })
  } else {
    const n = countSentences(socialBody)
    if (n !== expected) {
      out.push({
        req: 'REQ-038', locale: 'social', klass: 'SENTENCE_COUNT',
        detail: `${n} sentences, expected ${expected}`,
      })
    }
    for (const hit of scanProhibited(socialBody, { includeNeverRewrite: true })) {
      out.push({
        req: 'REQ-038', locale: 'social', klass: 'PROHIBITED_TERM',
        detail: `the social disclaimer renders the restricted term "${hit}"`,
      })
    }
  }

  // 5. No Stake branding in the real-money disclaimer either. CLAUDE.md's
  //    compliance section forbids it in shipped text. This is the checkable
  //    half of REQ-016; the other half is a ruling, not a property.
  for (const loc of Object.keys(bodies)) {
    if (/\bstake\b/i.test(bodies[loc] ?? '')) {
      out.push({
        req: 'REQ-016', locale: loc, klass: 'BRANDING',
        detail: 'the disclaimer carries Stake branding, which CLAUDE.md forbids in shipped text',
      })
    }
  }

  return out
}

// ── Live tables ──────────────────────────────────────────────────────────────

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

// ── Convention (p): the seeded self-test ─────────────────────────────────────

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

  console.log('\nSEEDS, each the defect its requirement exists to prevent')

  // SEED 1. REQ-012's clause deleted from German. This is the real form: a
  // translator drops the reload instruction and every other locale is fine, so
  // no reviewer comparing two files would see it.
  run('SEED 1  a dropped reload clause in de is caught by sentence count', 1, () => {
    const b = copy()
    b.de = b.de.replace(
      'Wenn deine Verbindung während einer Runde abbricht, lade das Spiel neu, um eine nicht abgeschlossene Runde zu beenden. ',
      '',
    )
    return [b, cleanSocial, mirror]
  })

  // SEED 2. Two sentences MERGED rather than deleted, in Japanese. Same
  // information loss, different shape, and a length check would not see it.
  run('SEED 2  two merged sentences in ja are caught, though the text is still long', 1, () => {
    const b = copy()
    b.ja = b.ja.replace('必要です。ラウンド中に', '必要であり、ラウンド中に')
    return [b, cleanSocial, mirror]
  })

  // SEED 3. The anchor "localised away" in Korean. The gloss survives, so the
  // sentence count is untouched and only the anchor check sees it.
  run('SEED 3  the RGS anchor translated away in ko is caught', 1, () => {
    const b = copy()
    b.ko = b.ko.replace('원격 게임 서버(Remote Game Server)', '원격 게임 서버')
    return [b, cleanSocial, mirror]
  })

  // SEED 4. The English REQ-015 statement rewritten to blame the browser, which
  // is the exact inversion the requirement exists to prevent.
  run('SEED 4  English no longer conveying the RGS settles winnings is caught', 1, () => {
    const b = copy()
    b.en = b.en.replace(
      'Winnings are settled according to the result returned by the Remote Game Server, not from events shown in the web browser.',
      'Winnings are settled from the events shown in the web browser.',
    )
    return [b, cleanSocial, mirror]
  })

  // SEED 5. REQ-013 deleted from English entirely.
  run('SEED 5  a missing long-run return statement in English is caught', 1, () => {
    const b = copy()
    b.en = b.en.replace(
      'The theoretical return to player is calculated over many thousands of plays and does not guarantee any result in a single session. ',
      '',
    )
    return [b, cleanSocial, mirror]
  })

  // SEED 6. REQ-038, in the form it really takes: the social disclaimer written
  // from the real-money one without the vocabulary substitution applied.
  run('SEED 6  a social disclaimer carrying real-money vocabulary is caught', 1, () => {
    const b = copy()
    return [
      b,
      cleanSocial.replace('Prizes are settled', 'Winnings in your currency are paid'),
      mirror,
    ]
  })

  // SEED 7. REQ-038 again, the single word the requirement names.
  run('SEED 7  the word "currency" reaching the social disclaimer is caught', 1, () =>
    [copy(), cleanSocial.replace('a single session', 'a single session of this currency'), mirror])

  // SEED 8. The platform moved its template. Nothing of ours changed, and that
  // is the point: the requirement is now stated differently and a human has to
  // read it rather than a gate silently checking a four-week-old memory.
  run('SEED 8  a platform template that has moved is caught', 1, () =>
    [copy(), cleanSocial, mirror.replace('Malfunction voids all wins and plays.', 'Malfunction voids nothing.')])

  // SEED 9. Stake branding in the shipped disclaimer.
  run('SEED 9  Stake branding in a shipped disclaimer is caught', 1, () => {
    const b = copy()
    b.fr = b.fr + ' TM et (c) 2026 Stake Engine.'
    return [b, cleanSocial, mirror]
  })

  // SEED 10. A locale emptied. The absent case is separate from the malformed
  // one, because an empty string trivially satisfies "no prohibited term".
  run('SEED 10 an empty locale disclaimer is caught', 1, () => {
    const b = copy()
    b.zh = ''
    return [b, cleanSocial, mirror]
  })

  console.log('\nNEGATIVE CONTROLS, each PAIRED with a seed above')

  // CONTROL 1, paired with SEEDS 1, 2, 3 and 10. The clean tree passes. Without
  // this, every seed above could be satisfied by a gate that flags everything.
  run('CONTROL 1  the clean tree, all sixteen locales, is NOT flagged', 0,
    () => [copy(), cleanSocial, mirror])

  // CONTROL 2, paired with SEEDS 4 and 5. Our English wording DIFFERS from the
  // platform's template and must still pass: the platform says "consistent",
  // ours says "stable"; the platform says "expected return", ours says
  // "theoretical return to player". The platform permits its own template to be
  // replaced "so long as the same message is clearly conveyed", so a gate
  // demanding the literal template text would be wrong about the requirement.
  run('CONTROL 2  our own wording, which differs from the template, PASSES', 0, () => {
    const b = copy()
    if (!/stable internet connection/i.test(b.en)) throw new Error('control 2 no longer exercises the wording difference')
    return [b, cleanSocial, mirror]
  })

  // CONTROL 3, paired with SEEDS 6 and 7. The REAL-money disclaimer says
  // "Winnings" and "wins", which ARE on the prohibited table. It must NOT be
  // flagged, because the table binds social mode only. A gate that scanned both
  // modes would be red on the clean tree, which is the M05 failure Session 3's
  // panel found: a gate that cannot be green cannot go red on a defect.
  run('CONTROL 3  real-money vocabulary in the REAL-money disclaimer PASSES', 0, () => {
    const b = copy()
    if (!/\bwins\b/i.test(b.en)) throw new Error('control 3 no longer exercises the real-money vocabulary')
    return [b, cleanSocial, mirror]
  })

  // CONTROL 4, paired with SEED 9. "Remote Game Server" contains no branding
  // and every locale carries it. A branding check matching too loosely would
  // fail all sixteen.
  run('CONTROL 4  the RGS anchor is not mistaken for branding', 0, () => {
    const b = copy()
    if (!b.ru.includes(RGS_ANCHOR)) throw new Error('control 4 no longer exercises the anchor')
    return [b, cleanSocial, mirror]
  })

  // CONTROL 5, paired with SEED 8. The mirror check reads the CURRENT file, so
  // it must pass against the file as committed. If this fails, the mirror has
  // genuinely moved and SEED 8's premise is stale.
  run('CONTROL 5  the committed mirror satisfies all six template sentences', 0,
    () => [copy(), cleanSocial, mirror])

  if (failures) { console.error(`\nDISCLAIMER CONFORMANCE SELF-TEST: FAIL (${failures})`); process.exit(1) }
  console.log('\nDISCLAIMER CONFORMANCE SELF-TEST: PASS (10 seeds, 5 paired controls)')
}

// ── Entry ────────────────────────────────────────────────────────────────────

if (process.argv.includes('--self-test')) {
  selfTest()
} else {
  const mirror = readFileSync(MIRROR_PATH, 'utf8')
  const findings = auditDisclaimers(liveBodies(), liveSocial(), mirror)

  console.log(`\nDISCLAIMER CONFORMANCE, ${LOCALE_CODES.length} locales, ${STATEMENTS.length} required statements`)
  console.log(`  mirror: docs/stake-engine-live/general-disclaimer.md`)
  for (const st of STATEMENTS) console.log(`  ${st.req}  ${st.what}`)

  if (findings.length) {
    console.error(`\n${findings.length} finding(s):`)
    for (const f of findings) console.error(`  ${f.req} ${f.locale} ${f.klass}: ${f.detail}`)
    console.error('\nDISCLAIMER CONFORMANCE: FAIL')
    process.exit(1)
  }
  console.log('\nDISCLAIMER CONFORMANCE: PASS')
}
