# Session Report - R078 THE BRANDING CARVE-OUT AND FOUR RIDERS (2026-08-21)

Brief saved verbatim: `reports/briefs/FS_FABLE_R078_BRANDING_CARVEOUT_Prompt.md`, the sole
live brief, and a RULING as well as a brief. Branch: `main`, as integrator, per multi-track
rule 1. Locked paths untouched; `locked_paths_gate.mjs` PASS.

## Summary

**The branding rule now has its one scoped exception and says so everywhere it lives.** The
platform-mandated General Disclaimer block is REQUIRED shipped text and carries the
platform's own mark by mandate; the studio-marks-only rule governs all other shipped text
and assets, unchanged. The E1 contradiction R077 escalated is closed, and closed with a
gate rather than only with better wording. TR-177, TR-178 and TR-179 carry the three tasks.

Two things went wider than the brief and both are surfaced per convention (n) rather than
decided quietly: the rule lives in NINE live documents rather than the three named, and the
RTL sentence-isolation defect is four selectors wide rather than one.

## THE RULING, and why nine documents rather than three

The brief named CLAUDE.md, COMPLIANCE_WATCH.md and README.md, and then said the rule is to
be stated "wherever the rule lives", which made the named list a floor. A read-only sweep
found nine live statements. An independent verifier re-ran it at HEAD over the whole tree
and confirmed there is no tenth, which is the claim worth having checked, since a rule
restated in eight places and left false in a ninth is the same defect in a smaller font.

The six the brief did not name: `GAME_FACTS.md`, whose claim cited COMPLIANCE_WATCH.md, so
the fact and its evidence corroborated each other into the same error; `SUBMISSION_DOSSIER.md`
section 4, which is handed to the platform at submission; `WRS_MASTER_DOCUMENT.md` twice;
`docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md` row 6; and the register's
REQ-004, scoped to point at REQ-016.

**Two consequence corrections came out of the sweep rather than the brief**, and they are
the reason a sweep beats a list. COMPLIANCE_WATCH's rebrand watch concluded that a
platform-side rebrand "does not create work for us". That was true while every mark we
shipped was our own and became backwards at R076: a rebrand rewrites the wording we ship
byte-exact, the constant must be re-captured, and the conformance gate re-reads the dated
mirror every run so it goes red until that happens. A rebrand is a build item now. And the
self-assessment's row 6 is a PASS the owner TRANSCRIBES onto the platform's own tick-list,
so the stale sentence would have been re-asserted on the platform's surface rather than
only in our repository.

**REQ-016 is re-reasoned to the ordered conclusion**, quoting the platform verbatim per
(l.7) from the 2026-07-29 capture, every quotation verified against the file before it was
written. What the entry now says plainly is that the earlier reasoning was SOUND on the
corpus available and lost to two surfaces the corpus does not contain: the Start Approval
form, which is where the requirement is enforced, and a live title in production. The
method stands and the conclusion does not.

**The dist hygiene scope note** records that `Stake Engine` inside the mandated block is
expected, that everything else remains a violation, and, stated so nobody helpfully fixes
it later, that widening the patterns to catch the mandated line would make the gate demand
we breach the platform's own requirement. The check's name now says "outside the mandated
disclaimer".

## THE REPAIR IS MACHINE-HELD, which is the part that outlives this session

CLAUDE.md and COMPLIANCE_WATCH.md carry a document-currency CHECK anchor of the grep form,
binding the carve-out to the mandated constant itself. **Proven able to fail**: mutating
the constant turns the gate red at the exact line with klass STALE_CLAIM, restored
byte-identically after. That matters because the flat claim went false at R076 and NOTHING
could say so. The bundle scanner matches Stake.com, Stake.us, Stake Originals and Powered
by Stake but not this line, and is right not to; the document gate checks whether citations
RESOLVE and never what prose CLAIMS. **A green document-currency run is not evidence the
documents are true**, and that is the general lesson rather than a remark about this row.

## TASK 2, THE RENDER RIDER, four selectors wide rather than one

The brief ordered `.fs-disc` added to the unicode-bidi plaintext list "so the mandated
English block renders correctly inside the Arabic layout". **Measurement corrected the
rationale in a useful direction.** The English block already rendered correctly: R068's
`direction: ltr` stage pin handles Latin text, and the change is provably a no-op for it,
firstX 0 and lastX 887.3 with and without. The real defect was the paragraph SHARING the
class, the translated responsible-play body, whose sentence-final punctuation sat at the
wrong end.

Enumerating the surface then found the class was not one selector but four. Measured at
`lang=ar` before the fix: **13 of 32 Arabic sentence leaves in the rules modal read at the
wrong end**, across `.fs-disc`, `.fs-mode-blurb`, `.fs-mode-footnote` and `.fs-guide-desc`.
R068 swept the sentence classes it knew about and missed all four.

**The widening is the owner's to reverse in one line, and the case for taking it** is that
it is measured zero-risk for the fifteen Latin-script locales, a strict repair for ar, one
selector list, and this is the build being submitted with the rules screen the surface a
reviewer opens first. The STANDING MANDATE's "fixed or explicitly owner-parked, no
minor-defer" pointed the same way. Deleting three selectors returns it to exactly what the
brief ordered.

**The gate is general, and that is the durable part.** `direction_parity_gate.mjs` gains
check D in two halves: behavioural on the named paragraphs, and a general half asserting
that EVERY Arabic sentence leaf in the modal is bidi-isolated, found by property rather
than against a class list. An enumerated list is exactly how R068 missed four classes and
how this brief would have missed three of them. Seeded per (p) by LIFTING THE CLASS, with a
scope control asserting the English block does not move that sits OUTSIDE the expected-red
collection, so a lift reaching wider than the class under test cannot hide inside its own
red. The seed was itself proven load-bearing by pointing it at a class that does not exist
and watching the self-test fail with the expect-red check.

## TWO OF MY OWN ORACLES WERE WRONG FIRST, and both are recorded

**The box-midpoint oracle reported the opposite of the truth.** It compared the trailing
punctuation to the paragraph's box midpoint, which conflates where the text RUN sits with
where the punctuation sits inside it, so it called the fixed state broken and the broken
state fixed. Per (l.2) a measurement that disagrees with the specification is a broken
measurement until proven otherwise. The oracle now compares LAST character to FIRST, which
no alignment can fool.

**The general check's first draft flagged a label.** `.fs-rtp-lbl` is a stat-plate label
with no terminal punctuation, where the measure reports which way the run is ALIGNED in its
cell rather than whether anything reads wrongly. R068's rule governs sentence elements, so
the oracle now requires terminal punctuation and a label is correctly not a finding. Both
corrections are written into the gate beside the checks they constrain.

**And one process slip of mine, recorded rather than smoothed over.** My first attempt to
inject the proposed rule for a before-and-after measurement silently failed to patch the
probe: the replacement target did not match and I did not assert on it, so two runs both
measured the unseeded state and AGREED. Agreement between two runs of the same thing is not
corroboration, which is convention (l.4) exactly. It was caught only because the numbers
were suspiciously identical.

## TASK 3, comment truth only, no behaviour change

The Gate 6c comment block described the PARAPHRASE design retired at R076: six sentences
per locale, an untranslated anchor, meaning checked in English only, REQ-016 "deliberately
NOT held", and seed and control counts that were never right again. It now describes
byte-identity, names the seven klasses the gate emits, records that REQ-016 IS held and
how, and quotes counts read from the current file rather than from any earlier report.

The kit basis gate's header opened "TWO HALVES" and there are five, halves 3, 4 and 5
having been added by R047, R071 and R076 without it being revisited. The word "halves" is
KEPT rather than renamed to something arithmetically honest, and the header says why: the
numbering is load-bearing, HALF 5 is cited from the import block and from a runtime guard
message, and renaming would break citations in the records to buy nothing.

## Verification

Local at the code tip, all PASS: the static battery run verbatim from checks.yml, 46 steps
plus the books verifier and the dist hygiene gate, 48 in all. Nine browser legs run locally,
being every leg that renders the paytable or reads the disclaimer key: direction parity
(self-test and real run), paytable card fill, layout fit, contrast, scrim coverage, money
fit, popout conformance, locale prose conformance and both social conformance gates.

Direction parity: self-test 58 checks with three seeds and a negative control, real run 156
assertions. Frames at `reports/screens/r078-rtl-disclaimer/`, written to their OWN directory
rather than joining the R068 set, because an evidence-mode run regenerates every frame it
writes with timing variance and pointing new evidence at a dated set would churn seven R068
frames to add three. The R068 set was restored byte-identical after the evidence run, per
(h.1).

**A correction to R077's own report, made here rather than by editing a dated record**, the
same practice R077 used for R068: R077 reported the static battery as "47 steps". It is 46.
The count included the shell function's own definition line in my harness. The harness is
corrected and now also runs the two repository-root gates from the repository root, which it
had been silently misrouting and reporting as failures for two sessions.

Explicit paths staged per (k); gates chained with `&&` per (u.1); document currency run over
the close-state tree before each push.

**THE GATE CAUGHT MY OWN PROSE, and it is worth recording.** The first push was blocked by
BAD_PREDICATE: the TR-177 row described the new anchor by quoting the literal CHECK marker,
and the gate parsed the description as a real, malformed predicate. That is its CONTROL 6
behaviour working as designed, a malformed predicate REPORTED rather than skipped. The row
now names the form without spelling the marker.

## A lane note, surfaced per convention (n) rather than decided quietly

Convention (t) keeps CLAUDE.md in review lane, and this session edited it directly on
`main`. The sanction is the ruling's own text, which names the edit explicitly ("Update
CLAUDE.md:521, COMPLIANCE_WATCH.md:32 and README.md:102"). That is the same shape as
convention (t.1)'s own transcription note: an explicit later instrument naming exactly this
edit. Recorded so the lane decision is visible rather than assumed.

## The remote runs, recorded per rule 10

**Run 32413212046 on `38cd2257`: SUCCESS, the FULL matrix, 30 of 30 jobs, zero failures.**
Static gates green, and all 29 browser legs green including direction parity carrying the
new check D and locale prose conformance, the leg that reddened R076.

## The rebuild at the tip, and this is the build the owner ships

Rebuilt from a clean tree at `38cd2257`:

    v10  |  commit 38cd2257  |  cleanTree true  |  93 files  |  12,455,660 bytes

Verified against the branding gates on that exact build: dist hygiene PASS, kit basis PASS,
disclaimer conformance PASS, and exactly ONE shipped file carries a Stake mark, the mandated
block, by mandate and by ruling.

## The owner preview, per rule 12

Refreshed before this report, line quoted as evidence:

OWNER PREVIEW  |  v10 line, main  |  commit 38cd2257  |  built 2026-08-21T06:15:38+10:00  |  http://192.168.4.92:5173/

Run once more as the last action of the close. The close commit carries the usual
one-commit lag.

## ESCALATIONS, observed and not actioned

**E1 (R078). `mkdocs.yml` carries two inherited Stake-token artefacts**, a logo reference
and `styles/stake.css`, in the documentation site rather than in shipped game assets. No
brand gate walks it: `brand_token_gate.mjs`'s roots are dist, the frontend source and the
brand design system. Not shipped to a player and not covered by today's ruling, which is
about SHIPPED text and assets. It wants one owner decision, and both artefacts belong in the
same one.

**E2 (R078), stated so it is a seen decision.** The general half of check D covers the rules
modal only. The same sentence-isolation question applies to any other surface with
translated prose, and the components that already carry the rule (`SessionPanel`,
`ResumeOffer`, `BuyBonus`, `ReplayMode`, `App`'s banners) were not re-swept by this pass with
the property-based oracle. Nothing is known to be wrong there; it has simply not been
measured the way the rules modal now has.

TR-148's four escalations and the R074 bundle stand where they were.

## FOR THE NEXT SESSION

Nothing is queued for the build. The owner's loop, the glances, and Start Approval on the
owner's word alone.

Model and effort: Fable, judgement tier, one short session, integrator on `main` throughout.
Approach: a read-only mapping fan-out over the branding surface, the bidi mechanism and the
two comment riders before any edit, four mapping agents and two adversarial verifiers, then
the edits by hand with every mechanism measured rather than inferred. The fan-out earned its
cost twice: it proved the branding sweep complete at nine sites, and it flagged the wider
bidi class that the brief's single named selector would have left shipping. Alternatives
rejected: fixing only `.fs-disc` as literally ordered, which measurement showed would have
left 13 of 32 Arabic sentences reading at the wrong end on the submission build; and editing
the dated R068 and R077 report sections to correct them, which the conventions forbid, so the
corrections ride this report instead.
