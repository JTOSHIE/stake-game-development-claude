# R077 disclaimer frames (2026-08-21)

The rules disclaimer as a player meets it, in en, de and social, on the R077
tree: the platform's mandated text and NOTHING ELSE, ending at its own closing
line, identical in every variant because sixteen locales and both modes share
the single constant in `frontend/src/lib/i18n/disclaimer.ts`.

The R076 frames beside these, at `reports/screens/r076-disclaimer/`, are the
BEFORE: same three variants, 544 characters, the mandated block plus the one
trademark sentence the owner has now overruled on production evidence. Those
frames and their README describe what was captured on the R076 tree and stay
true of those PNGs; they are dated evidence and were not edited.

## What was asserted before each shot

Each frame's paragraph was located by its own DISCLAIMER heading, resolved per
variant from the prose tables rather than by position, because `p.fs-disc` is
used twice in this modal (responsible play, then the disclaimer) and picking
the wrong one would assert the wrong string while looking green. The paytable
was opened the way a player opens it, per TR-028: the FEATURES control, then
its bet-modes info button.

- en: 472 characters, rendered text equals the mandated block exactly, one paragraph in the block, zero nodes after it
- de: 472 characters, rendered text equals the mandated block exactly, one paragraph in the block, zero nodes after it
- social: 472 characters, rendered text equals the mandated block exactly, one paragraph in the block, zero nodes after it

"Nothing after it" is measured rather than assumed: the drive counts the
paragraphs inside the DISCLAIMER block and every non-empty node following the
paragraph, and requires one and zero.

## The assertion was proven able to fail

Per convention (p), against a scratch build carrying a RENDER-SITE append (the
exact sentence, concatenated in the component script, which is the form this
site really shipped from 2026-07-28 until R076): all three variants read 544
characters and the drive exited 1, naming the appended text.

The same seeded tree passed `disclaimer_conformance.test.ts` with exit 0, which
is the point of framing the render at all: a script-side append is invisible to
a source pin, so the two instruments cover different halves of the same
requirement. The seed was removed and the tree rebuilt before these frames were
taken.

## What holds this permanently

- `frontend/src/lib/i18n/disclaimer_conformance.test.ts`: byte-identity against
  the constant in all sixteen locales and both modes, TRAILING_CONTENT as its
  own klass, the dated mirror re-read on every run, 10 seeds and 4 paired
  controls.
- `frontend/scripts/kit_basis_gate.mjs` half 5: the mandated literal present in
  the built kit, and neither superseded family (the pre-R076 paraphrase, the
  R076 trademark append) anywhere in the kit or the prose sources.

These frames are a one-off capture, as the R076 set was. The drive that took
them served the freshly built `dist` in-process per TR-101 and was not
committed; both gates above run in CI on every push.
