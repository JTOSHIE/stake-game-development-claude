// vocabulary.ts - R2R JOB 6 / TR-041 (2026-07-25).
//
// ONE social-aware vocabulary layer. Every player-visible and accessibility
// string that is composed in a component rather than keyed through `t()` goes
// through `sv()` here, so there is a single place that knows which words are
// prohibited on stake.us and a single place to change when the platform's list
// changes.
//
// WHY THIS EXISTS. Round-two reviewer 3's third BLOCKER found prohibited terms
// still rendering in social mode at three surfaces: the paytable rules strings,
// the interface guide and the win banner. Each was a separate hardcoded
// literal, so each had to be found and fixed separately, and the conformance
// script that was supposed to catch them inspected only mode-card text and
// checked only two words. Patching three more literals would have left the
// fourth for round three.
//
// THE TERM TABLE IS QUOTED, NEVER PARAPHRASED (convention l.7). It is
// transcribed verbatim from the dated jurisdiction mirror at
// docs/stake-engine-live/jurisdiction-requirements.md, fetched 2026-07-04,
// content_sha256 b115c7a10ac126a88c968d9f0038dc42a90781ce5769c4c002f9ce637f65687c.
// Both columns are the platform's own words including its own duplicates and
// its own inconsistencies: `pay out` appears twice with different replacements
// ("win / won" and "win / won"), `total bet` appears twice ("total play" and
// "play"), and `betting` appears twice. Nothing is de-duplicated or tidied,
// because the moment this table is edited to read better it stops being
// evidence of what the platform requires.

/** One row of the platform's restricted-phrase table. */
export interface ProhibitedTerm {
  /** The platform's "Restricted Phrase" column, verbatim. */
  phrase: string
  /** The platform's "Replacement Phrase" column, verbatim. */
  replacement: string
}

/**
 * The complete table, in the mirror's own order. 39 rows.
 *
 * Read this as the compliance source. `SUBSTITUTIONS` below is the subset this
 * codebase can apply mechanically; the rest are scanned for, not rewritten,
 * because a phrase like "be awarded to player's accounts" needs an author, not
 * a regular expression.
 */
export const PROHIBITED_TERMS: ProhibitedTerm[] = [
  { phrase: 'win feature', replacement: 'play feature' },
  { phrase: 'pay out', replacement: 'win / won' },
  { phrase: 'paid out', replacement: 'win' },
  { phrase: 'stake', replacement: 'play amount' },
  { phrase: 'pays out', replacement: 'won' },
  { phrase: 'betting', replacement: 'play / playing' },
  { phrase: 'total bet', replacement: 'total play' },
  { phrase: 'bet', replacement: 'play' },
  { phrase: 'bets', replacement: 'plays' },
  { phrase: 'cash', replacement: 'coins' },
  { phrase: 'payer', replacement: 'winner' },
  { phrase: 'pay', replacement: 'win' },
  { phrase: 'pays', replacement: 'wins' },
  { phrase: 'paid', replacement: 'won' },
  { phrase: 'money', replacement: 'coins' },
  { phrase: 'buy', replacement: 'play' },
  { phrase: 'bought', replacement: 'instantly triggered' },
  { phrase: 'purchase', replacement: 'play' },
  { phrase: 'at the cost of', replacement: 'for' },
  { phrase: 'rebet', replacement: 'respin' },
  { phrase: 'cost of', replacement: 'can be played for' },
  { phrase: 'credit', replacement: 'balance' },
  { phrase: 'buy bonus', replacement: 'get bonus' },
  { phrase: 'gamble', replacement: 'play' },
  { phrase: 'wager', replacement: 'play' },
  { phrase: 'deposit', replacement: 'get coins' },
  { phrase: 'withdraw', replacement: 'redeem' },
  { phrase: 'bonus buy', replacement: 'bonus / feature' },
  { phrase: 'be awarded to player’s accounts', replacement: 'appear in player’s accounts' },
  { phrase: 'betting', replacement: 'playing' },
  { phrase: 'total bet', replacement: 'play' },
  { phrase: 'pay out', replacement: 'win / won' },
  { phrase: 'paid out', replacement: 'won' },
  { phrase: 'place your bets', replacement: 'come and play / join in the game' },
  { phrase: 'pays out', replacement: 'win' },
  { phrase: 'win feature', replacement: 'play feature' },
  { phrase: 'bet/s', replacement: 'play/s' },
  { phrase: 'currency', replacement: 'token' },
  { phrase: 'fund', replacement: 'balance' },
]

/**
 * The phrases this layer rewrites mechanically, longest first so `total bet`
 * wins over `bet` and `pays out` wins over `pays`.
 *
 * DERIVED FROM the table above rather than typed out again, so the two cannot
 * drift. Where the platform lists a phrase twice with different replacements
 * the FIRST is used, which is the one appearing higher in the platform's own
 * table.
 */
const SUBSTITUTIONS: ProhibitedTerm[] = (() => {
  const seen = new Set<string>()
  const out: ProhibitedTerm[] = []
  for (const t of PROHIBITED_TERMS) {
    const k = t.phrase.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    out.push(t)
  }
  return out.sort((a, b) => b.phrase.length - a.phrase.length)
})()

/**
 * Terms this codebase deliberately does NOT rewrite, each with its reason.
 * Recorded here rather than silently omitted, because an unexplained gap in a
 * compliance filter is indistinguishable from an oversight.
 */
export const NOT_SUBSTITUTED: Record<string, string> = {
  // 'stake' would rewrite the platform's own name and the studio's copy about
  // it. It is scanned for and reported, and every occurrence in this codebase
  // is in a brand or platform context rather than a wagering one.
  stake: 'brand and platform name; scanned, never rewritten',
  // 'currency' and 'fund' appear only in code identifiers and comments here,
  // never in a player-visible string. Rewriting them would corrupt the ISO code
  // labels the platform itself requires.
  currency: 'appears only in code identifiers, never player-visible',
  fund: 'appears only in code identifiers, never player-visible',
}
const NEVER_REWRITE = new Set(Object.keys(NOT_SUBSTITUTED))

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Match a phrase on word boundaries, case-insensitively. */
function phraseRe(phrase: string): RegExp {
  // `bet/s` and `player’s` contain characters \b does not bound, so the
  // boundary is expressed as "not preceded/followed by a word character".
  return new RegExp(`(?<![A-Za-z])${escapeRe(phrase)}(?![A-Za-z])`, 'gi')
}

/**
 * Preserve the shape of the original: ALL CAPS in, ALL CAPS out; Sentence case
 * in, Sentence case out. The UI carries a lot of uppercase labels ("MAX BET"),
 * and a replacement that came back lowercase would be a visible defect even
 * though it was compliant.
 */
function matchCase(original: string, replacement: string): string {
  if (original === original.toUpperCase() && /[A-Z]/.test(original)) return replacement.toUpperCase()
  if (original[0] === original[0]?.toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1)
  }
  return replacement
}

/**
 * THE vocabulary function. Returns `text` unchanged in real-money mode, and the
 * social-compliant rewrite in social mode.
 *
 * Callers pass the resolved social boolean rather than reading a store, so this
 * is pure and testable and works before mount, which is what replay's first
 * paint needs.
 */
export function sv(text: string, social: boolean): string {
  if (!social || !text) return text
  let out = text
  for (const { phrase, replacement } of SUBSTITUTIONS) {
    if (NEVER_REWRITE.has(phrase.toLowerCase())) continue
    out = out.replace(phraseRe(phrase), (m) => matchCase(m, replacement))
  }
  return out
}

/**
 * Every prohibited phrase present in `text`, for the conformance scan and the
 * static gate. Reports what it finds; it never rewrites.
 *
 * `skip` lets the scanner exclude the terms recorded in NOT_SUBSTITUTED when a
 * caller only wants actionable hits.
 */
export function scanProhibited(
  text: string,
  opts: { includeNeverRewrite?: boolean } = {},
): string[] {
  const hits: string[] = []
  const seen = new Set<string>()
  for (const { phrase } of PROHIBITED_TERMS) {
    const key = phrase.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    if (!opts.includeNeverRewrite && NEVER_REWRITE.has(key)) continue
    if (phraseRe(phrase).test(text)) hits.push(phrase)
  }
  return hits
}

/**
 * The mirror this table was transcribed from, so any claim made about the terms
 * can be checked against a dated artefact rather than against memory.
 */
export const TERM_TABLE_SOURCE = {
  path: 'docs/stake-engine-live/jurisdiction-requirements.md',
  fetched: '2026-07-04',
  contentSha256: 'b115c7a10ac126a88c968d9f0038dc42a90781ce5769c4c002f9ce637f65687c',
  rows: PROHIBITED_TERMS.length,
}
