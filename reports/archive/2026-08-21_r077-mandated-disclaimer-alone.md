# Session Report - R077 THE DISCLAIMER, MANDATED TEXT ALONE (2026-08-21)

Brief saved verbatim: `reports/briefs/FS_FABLE_R077_DISCLAIMER_BARE_Prompt.md`, the sole
live brief, the owner's ruling on a production capture. Branch: `main`, as integrator, per
multi-track rule 1. Locked paths untouched; `locked_paths_gate.mjs` PASS.

## Summary

**The shipped disclaimer is now the platform's mandated text and nothing else**, 472
characters ending at its own closing line, identical in all sixteen locales and both
modes, single-sourced, pinned at source and at kit, and framed rendering in en, de and
social. The trademark sentence R076 appended is gone from live code. TR-176 carries the
reversal with the owner's production capture as the evidence and Fable's R076 append
recorded as the overruled ruling; TR-175 carries a supersession note, its
verbatim-mandated-text half standing unchanged.

**The reversal is evidence beating inference, and that is the lesson worth keeping.** R076
reasoned from the platform's own page that the mandated block was a floor our marks could
sit beside; the owner then looked at what a live title actually ships and found the
paragraph bare. A production capture outranks a reading of the documentation. Two rulings
landing on the same day in opposite directions is the system working rather than churn,
and both are on the record with their reasoning intact.

## TASK 1, the removal

The source was verified BEFORE any edit, per (l.1) and (l.7), and more widely than R076
verified it. The mandated block sits byte-identically at
docs/stake-engine-live/general-disclaimer.md line 18 and in ALL FIVE dated captures
(approval_guidelines_general_disclaimer.md at 2026-07-29 line 22, 2026-08-10 line 23,
2026-08-11 line 14, 2026-08-15 line 14, 2026-08-20 line 14). In every one of the six files
the cited line is the LAST line of the block, so "ending exactly at its own closing line"
is corroborated by the platform's own captures rather than taken from the brief.

The mechanics: the single source exports ONE constant where R076 exported three. The
appended sentence and the template join of the two are deleted, and sixteen consumers move
to the surviving name (the en table plus fifteen locale sites). Social carries no override
and still should not: the disclaimer reads identically in both modes, and that table's own
rule is that identical strings are absent rather than repeated.

**The render site needed no code change and its comment needed rewriting**, which is worth
separating. The reactive statement has been a bare read of the key since R076 removed the
two script-level appends. What was still there was a comment explaining why a trademark
sentence was appended at that site, describing a design that R076 had already dismantled
and R077 abolishes. A comment that explains a thing which no longer exists is the defect
class this project treats as a defect, so it is replaced by a note that says the opposite
and says why the rule is written strongly: a render-site append is invisible to every
source pin, so it is the one form of this defect that could return quietly.

## TASK 2, the pins

`disclaimer_conformance.test.ts` asserts the BARE mandated text in all sixteen locales and
both modes. **TRAILING_CONTENT is its own klass**, because "the block, correct, plus
something after it" is the R077 defect precisely rather than a drift; the finding quotes
what followed instead of printing a length mismatch. The dated mirror is re-read every run.
Ten seeds, four paired controls, and **every seed now names the KLASS it must produce**:
two of them legitimately fire on more than one detector at once, so a bare count would let
a seed pass on somebody else's finding while its own detector sat broken, which is
convention (p)'s failure mode in its subtlest form.

Per (p) the new seeded violation is the R076 APPENDED FORM planted verbatim, by both its
routes: in a locale table, and as a social override, which is how it could return on the
mode nobody is looking at. Nothing about the seed is synthetic; it is the exact string this
repository shipped between the two rulings. It is held as a LOCAL literal and deliberately
not imported, because a seed that imports the thing it exists to detect disappears the
moment that thing is deleted, which is how a gate quietly stops guarding a class it still
claims to guard.

`kit_basis_gate.mjs` half 5 now pins the ONE mandated literal present in the built kit and
BOTH superseded families absent: the pre-R076 paraphrase and the R076 trademark append.
**The red run was genuine**: against the still-shipped pre-R077 dist the gate failed naming
the surviving append in `dist/assets/index-DcFPpF2T.js`, and the rebuild took it green with
the sentence absent from the bundle and the mandated block present.

Frames at `reports/screens/r077-disclaimer/`: 472 characters in each of en, de and social,
the paragraph located by its own heading rather than by position, one paragraph in the
block and zero nodes after it.

## THREE TRAPS CAUGHT BEFORE THEY LANDED, and the worst of them was GREEN

Recorded in full because the mechanisms generalise well beyond this pass.

**1. The silent green.** The kit gate destructured the appended sentence from the single
source at module load. A missing named export resolves to `undefined` without throwing, and
`String.prototype.includes` coerces it, so the search becomes a search for the token
"undefined", which the real bundle genuinely contains. The PRESENT half would have reported
satisfied while pinning nothing at all, and both the gate and its self-test would have
stayed green. Fixed at the source by taking the second name out, and closed structurally:
the half now refuses a non-string part outright, and that refusal is itself seeded.

**2. The seed that inverted.** The old SEED 4 asserted that DROPPING the trademark sentence
was a violation. R077 makes the dropped form the correct one, so the seed would have
returned zero findings and failed the self-test against a correct tree. A seed can go stale;
this one changed sign, which is the more dangerous kind because it reddens the gate against
the very fix it should be proving.

**3. The control that would have flagged its own seed.** The kit gate's clean control wrote
the trademark sentence into its own scratch kit and then scanned that kit. The moment the
sentence joined the superseded family, the control would have found its own seed string and
the self-test would have exited 1 on a correct tree.

## Verification

Local at the code tip, all PASS: the static battery run verbatim from checks.yml, 47 steps,
plus the books verifier self-test and the dist hygiene gate run separately. It includes both
disclaimer steps, both kit basis steps, the dash and machine-tell gates over source and
dist, the hardcoded-string gate, `npm run check`, the stake mark and brand token gates and
the delivery set. Two apparent failures in that run were a driver error of mine and not the
repository's: `delivery_set_gate.mjs` lives at the repository root and my harness ran it
from frontend/. Re-run correctly it is PASS at 13 seeds and 5 paired controls. The same
class of driver error is recorded from R074, where the browser matrix legs carry no
per-step working directory and resolving from the repository root failed all 28 instantly.
It is worth naming twice.

Eight browser legs run locally, chosen because they are every leg that renders the paytable
or reads the disclaimer key: locale prose conformance (the leg that reddened R076), social
DOM conformance, social string conformance, paytable card fill, scrim coverage, layout fit,
money fit and popout conformance. All PASS.

`dist_hygiene_gate.mjs` reports one local finding, the build stamp reading DIRTY, which is
the known local-only class: the stamp is written at build time and this tree had uncommitted
work in it. Its branding half passed.

Explicit paths staged per (k); every gate invocation chained with `&&` per (u.1); doc
currency run over the close-state tree before pushing, PASS at 272 frozen and 0 new.

## ESCALATIONS, observed and deliberately NOT actioned per the brief's scope guard

The brief scoped this session strictly and ordered that anything else observed is escalated
rather than touched. Surfaced here per convention (n) rather than decided quietly.

**E1, and it is the substantial one: three LIVE documents assert that no Stake branding
ships, and that has been false since R076.** The mandated block ends "TM and © 2026 Stake
Engine.", it is in the shipped bundle, and I confirmed it by reading dist directly.
`CLAUDE.md` line 521 states "No Stake branding in shipped assets or text. Original IP only."
COMPLIANCE_WATCH.md line 32 states "No Stake branding: verified. No Stake trademark or
themes in any shipped asset or text." README.md line 102, which is PUBLIC and which a
platform reviewer may well read, states "No Stake branding appears in any shipped asset or
string." A fourth, reports/qa/compliance_register/REGISTER.md REQ-016, reasons at length to
the conclusion that the closing line is not mandated and that the no-Stake-branding rule
"continues to govern", a conclusion R076 overruled.

R076 resolved REQ-016 correctly and scoped the branding rule to hold everywhere OUTSIDE the
mandated block, but it recorded that scoping only inside the conformance test. The four
documents were never brought forward. **No gate can catch this**: `dist_hygiene_gate.mjs`
matches Stake.com, Stake.us, Stake Originals, "Powered by Stake" and Stake Casino/Games/
Studios, none of which "Stake Engine." matches, so it is green and correct to be green; and
the doc currency gate checks whether a citation resolves, never what the prose around it
claims. This is R076 residue, not R077's, and it wants one short ruling: the four documents
restated to say the mandated block's closing line is the one sanctioned occurrence, exactly
as the test already says.

**E2. `.github/workflows/checks.yml` lines 507 to 524 are a stale comment block from before
R076.** They still describe the retired paraphrase design: six sentences per locale, the
untranslated anchor, meaning checked in English only, "REQ-016 is deliberately NOT held"
which the test itself declares resolved, and "ten seeds, five paired controls" against the
figures the test actually prints. R076 rewrote the gate and left its CI description behind.
Nothing runs differently; it is documentation sitting one layer above the thing R077 just
fixed, and it now describes two superseded designs rather than one.

**E3. `kit_basis_gate.mjs` opens "TWO HALVES, BOTH AGAINST WHAT ACTUALLY SHIPS" and there
are five.** Halves 3, 4 and 5 were added without the header being maintained. Its self-test
also carries two separate blocks both labelled SEED 3. R077 numbered its new seeds around
that rather than renumbering, so the existing labels stay valid in the records that cite
them.

**E4. `.fs-disc` is absent from the `unicode-bidi: plaintext` list in PaytableModal.svelte**
while every neighbouring prose class is on it. Harmless while the block is untranslated
English, which is now permanent, so this is an observation rather than a defect; recorded so
a later reader does not mistake it for an oversight R077 introduced.

**E5. One consequence of the ruling, stated so the owner sees it rather than discovers it.**
With the sentence removed, no trademark or copyright notice for We Roll Spinners appears in
any shipped string; the studio's marks now reach a player only through the art, the wordmark
and the splash emblem. That is what the owner's production evidence shows a live title
doing, so it is the intended state and not a gap, but it is a real change to what the game
asserts about its own IP and it should be a seen decision rather than an inferred one.

TR-148's four escalations and the R074 bundle E1 to G9 items stand where they were.

## The remote run, recorded per rule 10

**Run 32404267403 on `1a45ffc7`: SUCCESS, the FULL matrix, 30 of 30 jobs, zero failures.**
Static gates green, which is the job carrying both disclaimer steps and both kit basis
steps, and all 29 browser legs green including locale prose conformance, the leg whose
English-leak detector reddened R076 and which was watched deliberately here.

**One runner incident is recorded so it is not read as a gate getting slower.** The `what
changed` filter job sat in_progress for roughly four minutes with its Check out step
unfinished, while the static job beside it completed normally. Per CLAUDE.md's own rule, a
slow run is a runner or npm incident until the per-step timings say otherwise, and the
per-step timings said exactly that: the checkout, not any gate. It cleared on its own and
the browser matrix ran normally after it.

**The long leg was NOT part of that and is recorded so it is not read as one.** `browser:
replay contract` set the wall clock at about eleven minutes. That is this leg's ordinary
duration rather than a regression: the same leg on the R076 resolution run 32392694251
took 11m11s, measured rather than remembered. CLAUDE.md's own guidance applies, judge a
run against the range and do not expect a particular job to be the setter.

## The rebuild at the tip

Rebuilt from a clean tree at `1a45ffc7`, which is the stamp the owner syncs against:

    v10  |  commit 1a45ffc7  |  cleanTree true  |  93 files  |  12,455,543 bytes

**94 bytes under R076's 12,455,637**, which is the one appended sentence and its join
scaffolding leaving the bundle. For scale, R076 came in 11.9KB under R075 because sixteen
translated paraphrases collapsed into one constant; this is the tail of that same
collapse. Verified against the final bundle directly: the appended sentence occurs ZERO
times and the mandated block occurs once. `dist_hygiene_gate.mjs` is PASS on this build,
its earlier local finding having been only the DIRTY stamp of an uncommitted tree.

## The owner preview, per rule 12

Refreshed before this report, line quoted as evidence:

OWNER PREVIEW  |  v10 line, main  |  commit 1a45ffc7  |  built 2026-08-21T04:36:11+10:00  |  http://192.168.4.92:5173/

Run once more as the last action of the close. The rebuilt dist stamp for the owner's final
sync prints in the comms entry and the chat close, built at the final tip. The close commit
carries the usual one-commit lag.

## FOR THE NEXT SESSION

Nothing is queued for the build. The owner's loop, the rules-screen glance beside the
frames, and Start Approval on the owner's word alone.

Waiting on a ruling, none of it blocking and none of it R077's to decide: escalation E1
above, the three live documents and the compliance register that still say no Stake
branding ships, which R076 made false and which no gate can see. E2 to E5 ride behind it.
TR-148's four escalations and the R074 bundle stand where they were.

Model and effort: Fable, judgement tier, one short session, integrator on `main` throughout.
Approach: a read-only mapping fan-out over the blast radius before any edit, four mapping
agents and two adversarial verifiers, then the edits by hand and the full local battery.
The fan-out earned its cost precisely once and decisively: the silent-green destructure in
the kit gate was found by an agent that reproduced the coercion against the real bundle
rather than reasoning about it, and that trap would have shipped a green gate over an empty
pin. Alternatives rejected: a mechanical rename of the deleted constant across the tree,
which the same mapping proved would have reddened the conformance self-test against a
correct tree and silently hollowed out the kit pin.
