// disclaimer.ts, the ONE source of the shipped disclaimer text.
//
// R076 (2026-08-21), owner-caught at the Start Approval form (Step 1 of 4):
// the platform's mandated disclaimer ships VERBATIM, untranslated, byte-exact,
// identical in all sixteen locales and both modes, followed by exactly one
// appended sentence retaining our own marks. The platform's template permits
// paraphrase in its prose ("You are able to use our template disclaimer, or
// your own, so long as the same message is clearly conveyed"), and the estate
// shipped a paraphrase from 2026-07-29 until R076; the Start Approval form is
// where letter beat substance, and the ruling is the letter.
//
// SOURCE, quoted never paraphrased per convention (l.7):
// docs/stake-engine-live/general-disclaimer.md line 18, held byte-identically
// in the 2026-07-29 dated capture (approval_guidelines_general_disclaimer.md
// line 22) and the 2026-08-20 dated capture (same file, line 14).
// disclaimer_conformance.test.ts re-reads the mirror at every run, so a
// platform rewrite rusts this constant loudly rather than silently.
//
// This module exists because prose.ts imports prose.locales.ts, so the locale
// table cannot import the constant back from prose.ts without a cycle; both
// import it from here, and there is exactly one copy of the string in the
// source tree.

/** The platform's mandated text, byte-exact including its closing line. */
export const DISCLAIMER_MANDATED =
  'Malfunction voids all wins and plays. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many plays. The game display is not representative of any physical device and is for illustrative purposes only. Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser. TM and © 2026 Stake Engine.'

/** Our one appended sentence, the only non-platform content in the block. */
export const DISCLAIMER_OUR_MARKS =
  'Future Spinner and We Roll Spinners are trademarks of We Roll Spinners.'

/** What every locale ships, both modes, byte-identical. */
export const DISCLAIMER_VERBATIM = `${DISCLAIMER_MANDATED} ${DISCLAIMER_OUR_MARKS}`
