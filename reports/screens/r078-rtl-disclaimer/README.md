# R078 RTL disclaimer frames (2026-08-21)

The rules screen at `lang=ar`, desktop, mobile-s and popout-s, on the R078 tree.
Captured by check D of `frontend/scripts/direction_parity_gate.mjs` in evidence
mode, after the assertions below passed on the same load.

## What changed, and it is not quite what the brief expected

The brief asked for `.fs-disc` to join the unicode-bidi plaintext isolation list
"so the mandated English block renders correctly inside the Arabic layout". The
mandated English block already rendered correctly: R068 pinned `direction: ltr`
at the stage roots, and Latin text in an ltr container needs no isolation. This
was measured rather than assumed, and the measurement is the reason the change
is worth more than the brief claimed.

`.fs-disc` carries TWO paragraphs: the responsible-play body, which is genuinely
translated, and the mandated disclaimer, which has been English in all sixteen
locales since R076. R068 swept the sentence classes it knew about and missed
this one, so the ARABIC paragraph has been shipping with its sentence-final
punctuation at the wrong end for as long as the R068 pin has been in.

Measured at `lang=ar`, comparing each paragraph's last character against its
first, which is direction-invariant:

| paragraph | before | after |
|---|---|---|
| responsible play, Arabic | last char RIGHT of first, the wrong end | last char LEFT of first, correct RTL reading |
| mandated disclaimer, English | last char RIGHT of first | unchanged, firstX 0 and lastX 887.3 both ways |

So the fix repairs a live Arabic defect in the neighbouring paragraph and is
provably a no-op for the block the brief named.

## The oracle, and the one that was wrong first

The first oracle drafted for this compared the trailing punctuation to the
paragraph BOX midpoint. It reported the opposite of the truth, because with
plaintext isolation the whole text run re-aligns inside its box, so a midpoint
test measures where the run sits rather than where the punctuation sits inside
it. Per convention (l.2) a measurement that disagrees with the specification is
a broken measurement until proven otherwise, and it was. The oracle in the gate
compares LAST character against FIRST character and does not depend on
alignment.

## Proven able to fail

Seeded per convention (p) by LIFTING THE CLASS: seed `bidi-lifted-disc` restores
the pre-R078 computed value and check D goes red on the Arabic paragraph. A
scope control asserts in the same seed that the English block did NOT move, and
it sits outside the expected-red collection deliberately, so a lift reaching
wider than the class under test cannot hide inside its own red.

The seed was itself verified load-bearing: pointing it at a class that does not
exist makes the self-test fail with the expect-red check, rather than passing
quietly.

## Held permanently

`frontend/scripts/direction_parity_gate.mjs` check D, on the browser matrix:
both paragraphs carry plaintext isolation, the Arabic one reads at the RTL end,
the mandated English block is unaffected, at all three viewports.
