R087: ANIMFIX. Restore the per-symbol idles, convert excursions to
percentages, gate the class. Review lane. Sonnet, high effort; escalate
one tier if gates fail twice. Sole live brief. Unattended. Save and
commit this brief verbatim per convention (c).

THE FENCE, UNCHANGED: the eight placeholder rasters in the working tree
are deliberate; leave them exactly as they are and never stage any
raster (.png .jpg .jpeg .webp .gif). output/ is read-only. No
generation, no API calls, no kit packaging. The owner's dev server on
port 5173 stays untouched; run your own preview on another port. Locked
paths are not involved in this work and stay untouched.

PRECONDITIONS
1. git fetch origin. The approved PR #127 head is c7dd318. Resolve
   state: if c7dd318 is an ancestor of origin/main, checkout main and
   pull. If origin/main lacks it but LOCAL main contains it, the owner
   merged locally: push main, then proceed. If neither contains it,
   STOP and report "PR #127 not merged" without changing anything.
2. Confirm arc2-baseline still resolves to 618b711e.
3. Expect exactly eight modified rasters in the working tree; report
   their count and proceed with them in place.

CONTEXT, VERIFIED AT R086 AND BY FABLE IN SOURCE, DO NOT REDISCOVER
GameGrid.svelte applies idle classes only via classList.add at line
575; the ten rules at lines 1488 to 1533 are plain scoped selectors;
Svelte prunes selectors it cannot see in markup, so nine rules are
absent from the built CSS and only idle-breathe (literal at line 1197)
survives. The proven working pattern is line 1617:
.symbol-img:global(.win-flash). Excursions are absolute CSS px against
render-scaled art: idle-coil translateY(-3px), idle-pump
translateY(-7px), and the L3 crown clears by +0.43px at 430px wide,
negative narrower.

TASK 1: RESTORE THE RULES
Convert all ten per-symbol idle rules in GameGrid.svelte to the
.symbol-img:global(.idle-name) form, including idle-breathe so one
pattern governs the set. Then sweep GameGrid.svelte for every other
string-literal class applied via classList.add, remove or toggle and
verify each has a surviving rule in a fresh production build's CSS; fix
any additional pruned ones found in GameGrid the same way and list
them. Other components: scan and REPORT findings only, no fixes this
brief.

TASK 2: PERCENTAGE EXCURSIONS
Transform percentages resolve against the element's own box, which is
what makes the art-space contract scale. Convert: idle-coil
translateY(-3px) to translateY(-1.25%); idle-pump translateY(-7px) to
translateY(-2.9167%). Audit every remaining idle keyframe for px
translates on symbol images and convert each with the same divisor of
240, listing every conversion in the report; rotations, scales and
opacities are untouched. Update the SY-08 and SY-12 note fields in
docs/art/art_manifest_arc2.csv to state the percentage with its
art-space equivalence (1.25% = 3px of 240; 2.9167% = 7px of 240),
touching only those two rows and preserving LF endings; the owner's
paste of this brief ratifies the wording sync.

TASK 3: THE GATE, SEEDED PER CONVENTION (p)
New scripts/qa/css_liveness_gate.mjs: collect every string-literal
class name passed to classList.add, remove or toggle across
frontend/src; for each that has a rule in component source, assert a
matching rule exists in the built CSS; report any class with no source
rule at all as informational. Self-test mode: compile a fixture
component through the project's own Svelte compiler in which a scoped
.seeded-prune rule exists only in the style block while the class is
applied only via classList.add in script; assert the compiled CSS
DROPS the rule and the gate goes RED on it; then a :global fixture
compiles and passes green. The RED must actually be observed and its
output quoted in the report before the PASS counts. Wire the gate into
the close chain and CI with && as a direct operand per (o).

TASK 4: PROOF ON THE RUNNING GAME
Own preview server on port 4173. After a real paint (post-spin, not
the dev-seeded at-rest board, outside a win so loser-dim cannot kill
the animation), with prefers-reduced-motion pinned to no-preference:
(a) computed animationName for one symbol of each of the ten classes
resolves to its keyframes, none of them none; (b) for M2 (idle-coil)
and L3 (idle-pump), sample the transform over at least one full cycle
at TWO viewport widths, 1280 and 390: report minimum translateY in px,
the element box height, and the achieved percentage against 1.25% and
2.9167% within a tenth of a percentage point; (c) recompute L3 crown
clearance at both widths using the shipped art's solid-crown bound
(row 31 of 240) and show positive margin at both. Captures and harness
stay in .scratch; nothing depicting placeholder art is committed.

TASK 5: RECORDS AND CLOSE
Comms entry 086, folded (t): the fix, the conversions, the gate's
RED-then-green, the ten animationNames, the two-width excursion table,
and the owner look-pass verdicts recorded as OWNER EYE, REPORTED (wild
outclasses the remaining old set; H1 registered in static view; single
sane needle on the feature screen; no breakage observed).
SESSION_REPORT.md plus dated archive; brief committed verbatim;
explicit paths (k). Review lane: branch, PR, CI verified with full
SHAs, then hold for Fable and the owner.

FOR THE NEXT SESSION
R088 pack ships on the owner's REISSUE (style register, secret-scanning
gate, Gemini terms capture, arc-2 living handover). Backgrounds ruling
WORKSHOP or TESTCELL pending. With idle-rays restored, a non-radial
scatter placeholder may visibly tumble; that is expected, judged by
eye, and fixed in regeneration, not in code.
