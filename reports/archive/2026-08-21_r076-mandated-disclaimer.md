# Session Report - R076 THE MANDATED DISCLAIMER, VERBATIM (2026-08-21)

Brief saved verbatim: `reports/briefs/FS_FABLE_R076_DISCLAIMER_Prompt.md`, the sole live
brief, owner-caught at the Start Approval form (Step 1 of 4). Branch: `main`, as
integrator, per multi-track rule 1. Locked paths untouched; `locked_paths_gate.mjs` PASS.

## Summary

**The disclaimer now ships as the platform's mandated text VERBATIM**, untranslated,
byte-exact including its closing line, followed by exactly one appended sentence
retaining our marks, identical in all sixteen locales and both modes, single-sourced,
pinned at source and at kit, and framed rendering in en, de and social. TR-175 carries
the find and the substance-versus-letter lesson (the brief addressed the row as TR-174,
which R075 had already assigned; surfaced rather than silently renumbered).

## TASK 1, the replacement

The source was verified BEFORE any edit, per (l.1) and (l.7): the mandated block sits
byte-identically at docs/stake-engine-live/general-disclaimer.md line 18, the 2026-07-29
dated capture line 22, and the 2026-08-20 dated capture line 14, and the brief's own
text was byte-compared against all three.

The mechanics: a new single source, `frontend/src/lib/i18n/disclaimer.ts` (its own
module because prose.ts imports prose.locales.ts, so the locale table cannot import
back without a cycle), referenced by the en table and all fifteen locale sites; the
PROSE_SOCIAL override DELETED per that table's own rule that identical strings are
absent rather than repeated, so social falls through to the same bytes.

**The render site was the second half of the find.** PaytableModal composed
disclaimerBody PLUS two more hardcoded trademark sentences at the script level, where
no markup gate can see, so the new body would have rendered with our marks doubled in
two different forms. Both appends are removed; the disclaimer body IS the whole
disclaimer, and the rendered text was asserted byte-equal to the constant in all three
framed variants (544 characters each).

## TASK 2, social, and why no scanner changed

Per (n), recorded in TR-175 rather than decided quietly: the mandated wording outranks
the vocabulary table within its own block and nowhere else. No scanner EDIT was needed
to make that true. scanProhibited carries no win-words (they belong to the substitution
layer, not the prohibited table, which this session verified by running it);
social_dom_conformance already reports-not-fails the never-rewrite trio, and its walk
recorded exactly one informational stake hit, the rendered mandated block itself, which
is also live proof the social fallthrough renders the new text; and the rewritten
conformance test strips exactly the mandated block from its own scan, so any FUTURE
social override is scanned in full the moment it diverges. Both social gates ran green
unmodified.

## TASK 3, the pins and the frames

`disclaimer_conformance.test.ts` is rebuilt on byte-identity: every locale equals the
constant, the mirror is re-read at every run so a platform rewrite rusts the pin
loudly, the branding rule is scoped to hold everywhere OUTSIDE the mandated block
(REQ-016's long-parked question is resolved by the ruling), and the self-test runs 9
seeds led by the SHIPPED paraphrase verbatim per (p), en and de, with 4 paired
controls.

`kit_basis_gate.mjs` gains half 5: the built kit must carry the mandated block and the
trademark sentence each as a byte-exact literal, and none of the seventeen-fragment
superseded paraphrase family (sixteen locales plus the old social override) anywhere in
kit or prose sources. **The red run was genuine**: against the still-shipped pre-R076
dist the gate failed naming the superseded family and the absent mandated text, and the
rebuild took it green. Its first draft demanded the JOINED string and went red over a
correct kit, because disclaimer.ts joins the two literals at runtime; the lesson is
recorded in the gate beside the fix.

The dash scan raised no conflict with the mandated punctuation, so no exemption exists
there, stated per the brief's if-any-conflict clause.

Frames at `reports/screens/r076-disclaimer/`: the DISCLAIMER section of the rules
overlay in en, de and social, each frame's DOM text asserted byte-equal to the joined
constant before the shot.

## Verification

Local at the code tip, all PASS: disclaimer_conformance self-test (9 seeds, 4
controls) and real run; kit_basis self-test (5 seeded, 4 controls) and real run against
the rebuilt dist, with the genuine red against the pre-R076 dist recorded above;
typecheck baseline; dash and machine-tell over source and dist; the hardcoded-string
gate; paytable card fill at every shipped locale; both social conformance gates;
doc_currency at 272 frozen, 0 new. Explicit paths staged; every gate invocation chained
with `&&` per (u.1).

**One session process slip is recorded rather than smoothed over**: a scratch edit
script truncated `kit_basis_gate.mjs` to zero bytes mid-session (a malformed
conditional wrote None over an opened file). The file was restored from HEAD and the
half re-applied through the ordinary edit path; nothing reached any commit, and the
committed gate is the re-applied version whose self-test and real runs are quoted
above.

## The remote runs, recorded per rule 10, INCLUDING A RED RESOLVED

**Run 32391062354 on `b4eface9` went RED**, one job: browser: locale prose
conformance. Its English-leak detector correctly read fifteen en-identical
disclaimers as leaks and its clean-tree control broke on them; the leg was not in
this session's local affected-set re-run, which is exactly the gap rule 10 exists to
catch. Resolved within the hour by `5947987f`: disclaimerBody enters the gate's
IDENTICAL_OK table for the fifteen non-en locales, because byte-identity to English
is the REQUIREMENT for this one key since R076, with the ruling recorded in place
and nothing else widened; self-test 8 of 8 and the full local run green. The
resolution push's FULL matrix was watched green before this close committed, and the
result is recorded in the comms entry beside this report. The close commit carries
the usual one-commit lag.

## The owner preview, per rule 12

Refreshed before this report, line quoted as evidence:

OWNER PREVIEW  |  v10 line, main  |  commit b4eface9  |  built 2026-08-21T02:16:16+10:00  |  http://192.168.4.92:5173/

Run once more as the last action of the close. The rebuilt dist stamp for the owner's
final sync prints in the comms entry and the chat close, built at the final tip.

## FOR THE NEXT SESSION

Nothing. The owner's loop, the rules-screen glance beside the frames, and Start
Approval on the owner's word alone. Model and effort: Fable, judgement tier, one short
session, integrator on `main` throughout.
