// disclaimer.ts, the ONE source of the shipped disclaimer text.
//
// R077 (2026-08-21), the owner's reversal on PRODUCTION EVIDENCE: the shipped
// disclaimer is the platform's mandated text and NOTHING ELSE. Valkyrie's live
// disclaimer ships the mandated paragraph with nothing appended, the owner
// ruled on that capture, and the one trademark sentence R076 had appended is
// REMOVED. The body now ends exactly where the platform's own block ends.
//
// R076 (2026-08-21, earlier the same day), which this supersedes in one
// respect and confirms in every other: the owner met the Start Approval form
// (Step 1 of 4) and ruled that the mandated text ships VERBATIM, untranslated,
// byte-exact, identical in all sixteen locales and both modes. That still
// holds. The platform's template permits paraphrase in its prose ("You are
// able to use our template disclaimer, or your own, so long as the same
// message is clearly conveyed") and the estate shipped one from 2026-07-29
// until R076; the form is where letter beat substance. R077 takes the letter
// one step further, to the letter and nothing besides. Per convention (n) the
// later, better-informed instrument governs, and R076's append is recorded as
// the overruled ruling in TR-176 rather than quietly erased.
//
// SOURCE, quoted never paraphrased per convention (l.7):
// docs/stake-engine-live/general-disclaimer.md line 18, which is the LAST line
// of the platform's disclaimer block, held byte-identically in all five dated
// captures (approval_guidelines_general_disclaimer.md at 2026-07-29 line 22,
// 2026-08-10 line 23, 2026-08-11 line 14, 2026-08-15 line 14 and 2026-08-20
// line 14, each with nothing following it).
// disclaimer_conformance.test.ts re-reads the mirror at every run, so a
// platform rewrite rusts this constant loudly rather than silently.
//
// This module exists because prose.ts imports prose.locales.ts, so the locale
// table cannot import the constant back from prose.ts without a cycle; both
// import it from here, and there is exactly one copy of the string in the
// source tree.
//
// ONE constant, deliberately. R076 exported three: the mandated block, our
// appended sentence, and a template JOIN of the two. The join is what sent
// kit_basis half 5's first draft red over a correct kit, because a runtime
// join never exists in the bundle bytes. With the append gone the shipped
// string IS the mandated block, so it ships as one literal, every consumer
// names the same constant, and the class of bug cannot recur.

/**
 * The platform's mandated text, byte-exact including its closing line, and the
 * WHOLE of what the disclaimer says: nothing precedes it and nothing follows.
 */
export const DISCLAIMER_MANDATED =
  'Malfunction voids all wins and plays. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many plays. The game display is not representative of any physical device and is for illustrative purposes only. Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser. TM and © 2026 Stake Engine.'
