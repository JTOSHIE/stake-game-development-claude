# OWNER-PARK PROPOSALS: the refused halves of the gate tier

**JOB 3 of `reports/briefs/FS_GATE_TIER_2_Prompt.md`.** Australian English, no em dashes or
en dashes.

## Why this document exists

THE STANDING MANDATE is explicit and it has no third category:

> before submission there is no minor-defer category, only fixed or explicitly
> owner-parked with reasons.

Session 8 refused four specified fixes on measurement. **Every one of those refusals was
the right engineering call**, and this document does not reopen any of them. But a REFUSED
half is not FIXED and it is not OWNER-PARKED either, so under the mandate it currently sits
in a category that does not exist. **That is a gap in the RECORD, not in the code.** This
document closes it by proposing each refusal as an explicit park and putting it in front of
the owner for signature.

**A park is not closed until the owner signs it.** Until then every item below reads
PROPOSED, and the underlying tracker rows stay open.

## What this document is not

It is not a re-argument. The measurements below are quoted from
`reports/SESSION_REPORT.md:10384-10404`, which is Session 8's own written record, and they
were taken with the code in front of the session that took them. Nothing here re-measures
them and nothing here is a second opinion on them. The brief is explicit: record them,
state the proposed park, mark it awaiting signature.

## The park classes, taken from `reports/qa/session3/PARKED_TRACKER.md`

That tracker already established that the three kinds of park are not the same claim and
are never merged. The same three are used here:

- **PARKED, budget.** The instrument is real and buildable; the session ran out of
  allocation.
- **PARKED, BLOCKED.** An authority has to rule before it can be built.
- **PARKED, unreachable.** No mechanical proof exists, and inventing a proxy would be the
  wrongly-solved failure convention (l.6) names.

**PROPOSALS 1 to 4 are PARKED, unreachable. PROPOSALS 5 and 6 are PARKED, BLOCKED.** None
of the six is short of budget.

The first four are each a case where the specified instrument cannot produce an honest red,
and the common shape is worth stating once because it is the tier's real lesson: **a step
that cannot fail is not a cheap gate, it is a false compliance claim with a green tick on
it.**

The last two are a different animal and were added by this session's own work rather than
inherited from Session 8. In both, the MECHANICAL half is built, seeded and proven; what is
blocked is a decision only the owner can take, and in both cases the row that named it had
called that decision "separate" when the measurement shows it is a precondition.

---

## PROPOSAL 1: S2-C048, the anti-malware pass over `frontend/dist`

**Status: PROPOSED OWNER-PARK, unreachable. Awaiting the owner's signature.**

**What the row asked for.** An anti-malware pass over `frontend/dist` after the production
build, alongside the dependency scan, wired in `.github/workflows/checks.yml`.

**What landed instead.** The rest of the row shipped. `frontend/scripts/supply_chain_gate.mjs`
is real and was proven RED end to end by planting a copyleft licence on the pixi production
dependency, and the `scan` script is in `frontend/package.json`. Only the anti-malware half
is refused.

**The measurement that refuses it**, quoted from `reports/SESSION_REPORT.md:10396-10399`:

> **S2-C048's anti-malware pass has no honest seed.** For a real anti-malware step the seed
> is EICAR observed detected. There is no scanner on the runner, so nothing could detect it,
> and a walk that matches nothing and prints PASS would put a false compliance claim into a
> submission record.

**Why this is a park and not a deferral.** The convention (p) test for this step is
unambiguous: plant EICAR, watch the step go red. With no scanner present the step cannot go
red for any input, so its PASS carries no information. Shipping it would satisfy the row's
letter and violate convention (p) entirely, and it would do so inside a submission record,
which is the worst place for an unbacked claim.

**What would unpark it**, so the owner is choosing between real options rather than being
asked to accept a gap:

1. **Add a scanner to the runner.** ClamAV via `apt-get install clamav` plus `freshclam` in
   the static job. Real, and it makes EICAR a genuine seed. Costs runner minutes on every
   push and a signature database download, and both are ongoing.
2. **Move the scan off CI to the upload boundary**, as a one-time manual step in the kit
   build the owner already runs before upload, with its result recorded in the kit's
   BUILD_INFO. Cheaper, and it sits where the artefact actually leaves the building.
3. **Accept the park and state the compensating control.** The supply-chain gate that DID
   ship checks licences, install hooks, integrity hashes and advisories over the resolved
   lockfile, which is where a malicious dependency would actually arrive. `frontend/dist`
   is built from that same audited tree by our own build on our own runner.

**This seat's recommendation is option 3 plus a line in the submission record**, because the
threat the row names enters through dependencies and that path is now gated, while a scanner
over our own build output mostly rescans what we just compiled. Option 1 remains correct if
the owner wants the belt as well as the braces.

---

## PROPOSAL 2: S2-C052, the `setTelemetrySink` scan

**Status: PROPOSED OWNER-PARK, unreachable. Awaiting the owner's signature.**

**What the row asked for.** Scan `frontend/dist/assets/*.js` for `setTelemetrySink`.

**The measurement that refuses it**, quoted from `reports/SESSION_REPORT.md:10384-10389`:

> **S2-C052's `setTelemetrySink` scan cannot exist.** esbuild renames every bundle-scope
> function identifier. `configureTelemetry` is called unconditionally so it certainly ships,
> and `grep -c` over the shipped bundle returns 0 for it. A scan on that token could never
> fire.

**Why this park is the mildest of the four**, and the owner should read it as close to
already-solved. The row's PURPOSE, which is proving no telemetry hook reaches the shipped
bundle, IS gated. Session 8 shipped a scan for `__telemetry`, a property name, and
`mockCurrency`, a string literal, both of which survive minification for stated reasons, and
proved the red with a REAL BUILD by hoisting the live call out of its `import.meta.env.DEV`
guard. **What is parked is one token in a prescription, not the capability.** The row named a
symbol that minification deletes, and the session found tokens that survive it.

**What would unpark it.** Nothing worth doing. Preserving `setTelemetrySink` through
minification would mean pinning a bundler option purely so a gate can grep for a name, which
makes the shipped artefact worse to satisfy a check. Recorded here so a later reader who
greps for `setTelemetrySink` and finds nothing knows it was decided rather than forgotten.

---

## PROPOSAL 3: S2-C052, the absolute-origin clause

**Status: PROPOSED OWNER-PARK, unreachable AS SPECIFIED. Awaiting the owner's signature.**

**What the row asked for.** Fail on any absolute http or https origin in the shipped bundle
that is not the RGS host.

**The measurement that refuses it**, quoted from `reports/SESSION_REPORT.md:10391-10394`:

> **S2-C052's origin clause would be permanently red.** Twenty absolute origins ship
> legitimately today: Svelte runtime error links, W3C XML namespace identifiers which are
> names rather than destinations, and a pixi shader credit. And there is no RGS host to
> allowlist, because it arrives at runtime from the launch URL.

**The two independent reasons it fails as written**, and both matter because fixing one
leaves the other:

1. **The allowlist has no members.** The clause is "not the RGS host", and the RGS host is
   not knowable at build time. An allowlist whose only entry arrives at runtime is empty at
   scan time, so every origin is a violation.
2. **Twenty legitimate origins ship.** A W3C XML namespace is an identifier that happens to
   look like a URL and is never fetched. A gate cannot tell a name from a destination by
   looking at the string.

**THIS ONE HAS A LIVE SUCCESSOR AND IT IS NOT PARKED.** The capability the row wanted, which
is proving no external request leaves the shipped bundle, is exactly S2-C058, one of this
session's eight rows. The difference is the instrument: a STATIC scan of strings in the
bundle cannot distinguish a name from a destination, while a RUNTIME request log observes
what is actually fetched and needs no allowlist at all, because a request either happened or
it did not. **So the park being proposed here is on the STATIC form specifically**, and the
owner should read it beside this session's S2-C058 outcome rather than on its own.

---

## PROPOSAL 4: S2-C051, the pinned licence text

**Status: PROPOSED OWNER-PARK, unreachable. Awaiting the owner's signature.**

**THIS ONE IS NOT ASSIGNED BY THE BRIEF, and that is stated plainly rather than quietly
included.** `FS_GATE_TIER_2_Prompt.md` names two refused halves for JOB 3, S2-C048's and
S2-C052's, and it forbids extending the row set. S2-C051's refused half is the identical
gap: Session 8 refused it on measurement, so it is neither FIXED nor OWNER-PARKED, and
under the standing mandate it sits in the same non-existent category as the other three.

**It is included because omitting it would leave JOB 3 with precisely the hole JOB 3 exists
to close**, and because the cost is four lines of a document rather than any work. Per
convention (n) the tension is surfaced rather than decided quietly: **if the owner considers
this outside the brief, strike this proposal and it returns to the next session's list.** No
code was touched for it and nothing depends on it.

**The measurement that refuses it**, quoted from `reports/SESSION_REPORT.md:10401-10404`:

> **S2-C051's pinned licence text does not exist.** All four candidate paths 404 at the
> pinned commit, GitHub reports the repository licence as null, and the repo already
> recorded it at `docs/records/tooling/TOOL_VETTING_2026-07.md:15`. The pin is asserted
> instead, which is the defect in the form it can actually occur.

**What would unpark it.** Only the upstream publishing a licence file. The gate cannot fetch
a document that its author never wrote, and fabricating a licence text into a compliance
record would be the reconstruction convention (m) forbids in terms.

---

---

## PROPOSAL 5: S2-C075, how the five books files reach the runner

**Status: PROPOSED OWNER-PARK, BLOCKED on an owner decision with real cost attached.
Awaiting the owner's choice, not merely a signature.**

**This one is different from the four above.** It is not a refusal from Session 8, and it
is not unreachable. The MECHANICAL half shipped in this session:
`scripts/qa/publish_bundle_gate.mjs` parses `index.json` and requires every `events` and
every `weights` path it names to exist and be non-empty, with a seeded self-test at
**8 of 8, 6 seeds and 2 paired controls**. What is parked is the half the row itself
flagged as separate, and the session's own measurement is that it is not separate at all:
it is the PRECONDITION for the mechanical half to be shippable.

**The measurement, taken this session.**

- `.gitignore:9` is `**/library/**`, so the bundle directory is ignored wholesale.
- `git ls-files games/future_spinner/library/publish_files/` returns seven files:
  `index.json`, `game_metadata.json` and the five `lookUpTable_*.csv`. **None of the five
  `books_*.jsonl.zst` is tracked.**
- Against that inventory, reproduced in a scratch directory from `git ls-files` alone:

```
  OLD CHECK (test -f index.json) => exit 0, would print: math bundle OK
  gate exit on runner inventory   = 1
  ::error::math bundle incomplete: 5 file(s) named by index.json are missing
    mode base       events   books_base.jsonl.zst         not found
    mode cruise     events   books_cruise.jsonl.zst       not found
    mode antelite   events   books_antelite.jsonl.zst     not found
    mode bonus      events   books_bonus.jsonl.zst        not found
    mode super      events   books_super.jsonl.zst        not found
```

**So the publish workflow will go RED on the runner until this is answered, and that red
is correct.** It is `workflow_dispatch` only and defaults to `do_upload=false`, so nothing
that runs on a push is blocked. What is blocked is publishing a bundle whose `index.json`
promises five modes it does not ship.

**Why this cannot be settled by the builder.** The five files total **387.4MB**, and
`books_bonus.jsonl.zst` (151.9MB) and `books_super.jsonl.zst` (149.3MB) each exceed
**GitHub's 100MB per-file push limit**, so "commit them" is not available without LFS. The
four options carry real and different costs:

1. **Git LFS.** Bandwidth and storage quota, and every clone pays.
2. **A release-asset download step** in the workflow. Keeps the repository small; adds a
   fetch and a place for the artefacts to drift from the maths package.
3. **A runner-side `create_books` regeneration step.** `create_books` IS deterministic per
   `CLAUDE.md`, so this is genuinely reproducible; but it is minutes of runner time, and
   `CLAUDE.md` also records that the separate weight-fitting optimiser is NOT
   bit-reproducible, so the boundary would need stating carefully.
4. **Accept that this workflow only ever runs from a machine holding the books.** Cheapest,
   and it means the dispatch is not usable from CI at all, which should then be said out
   loud in the workflow rather than discovered.

**No recommendation is offered here**, deliberately. This touches the maths package and a
submission artefact, so per convention (l.8) it goes to the owner and Fable as a question
with the evidence attached rather than being ruled on by the builder.

---

---

## PROPOSAL 6: S2-C122, what the platform's "10,000,000 events" actually counts

**Status: PROPOSED OWNER-PARK, BLOCKED on a definition. Maths-adjacent, so it escalates
to the owner and Fable per convention (l.8) rather than being ruled on by the builder.**

**The limit is quoted, not paraphrased**, per convention (l.7), from
`docs/stake-engine-live/2026-07-25/math-verification.md:19-20`, a capture whose own header
says the body is a verbatim upstream capture, re-captured with identical wording at
`docs/stake-engine-live/2026-07-29/approval_guidelines_math_verification.md:21-22`:

> No single events file (.jsonl.zst) can exceed 4.2GB
> No game mode can contain more than 10,000,000 events

**The ambiguity.** "Events" can mean the per-mode simulation ROW count or a sum of the
event OBJECTS inside those rows, and the two readings differ by about seventy times here.

**The reading this session shipped, and why.** The platform's own FAIR catalogue publishes
a per-mode `events` field, captured at
`docs/stake-engine-live/2026-07-28/fair-catalogue.md:45-49`. Every published value but one
is a round simulation count, and the exception is decisive rather than awkward:
**Scrollkeeper reports an identical irregular 1,410,986 across three modes with different
RTPs and different weight ranges**, which a sum of variable-length event arrays could not
produce. So the field reads as a row count, and `scripts/validate_math.py` now checks
`MAX_EVENTS_PER_MODE` against rows. Under that reading our 100,000 per mode is correct and
the recorded "roughly two orders of magnitude inside the cap" is correct.

**Why it is still parked, and this is the uncomfortable part.**

- **REPORTED**, by this session's reconnaissance agent and **NOT re-measured in the main
  loop**: under the strict event-object reading, **bonus is 6,995,822 and super is
  6,850,638**, which is **69.96% and 68.51% of the 10,000,000 cap**. The method it reports
  is a decompression pass over the books files. It was not recounted here because that is a
  4.04GB pass, and rule 16 requires the status to be stated rather than upgraded: **treat
  these two figures as a question, not as fact, and recount them before anything depends
  on them.**
- If the platform's publish-time check ever counts event objects rather than rows, two of
  our five modes sit within about 1.43x of a hard publish failure, and any increase in
  simulation count or in free-spin length breaches it.
- The recorded position in `WRS_MASTER_DOCUMENT.md:52`, "roughly two orders of magnitude
  inside the cap", is true under the row reading and false under the other.

**THE ROW'S OWN PRESCRIPTION TO "CORRECT" THAT CELL WAS REFUSED**, and the refusal is the
point. It asked to restate the cell as the measured EVENT total. Doing that would replace a
figure the published FAIR evidence supports with an unsourced reinterpretation of a
compliance limit, which is exactly what convention (l.7) forbids. The honest disposition is
to record both readings with their measured figures and park the definition.

**What would unpark it.** The ACP Math Distribution screen reports the platform's own
`events` value at upload. That settles the definition empirically in one observation,
costs nothing, and is the same procedural resolution already used in the same document for
the open CVaR definition. **Recommended: park until the first upload, then read the number
the platform itself prints.**

---

## THE OWNER'S DECISION, in one block

| # | Row | Refused half | Proposed | Signature |
|---|---|---|---|---|
| 1 | S2-C048 | anti-malware pass over `frontend/dist` | PARK, unreachable; recommend the compensating control | |
| 2 | S2-C052 | `setTelemetrySink` token scan | PARK, unreachable; capability already gated by other tokens | |
| 3 | S2-C052 | absolute-origin static clause | PARK the STATIC form; read beside S2-C058 | |
| 4 | S2-C051 | pinned licence text fetch | PARK, unreachable; NOT assigned by the brief, strike if out of scope | |
| 5 | S2-C075 | how the five books files reach the runner | CHOOSE one of four options; the mechanical half already shipped and will go red until then | |
| 6 | S2-C122 | what "10,000,000 events" counts | PARK the definition until the first upload prints the platform's own figure; two modes may sit at about 70 per cent of the cap | |

**Nothing above is closed by this document.** Each row stays open in
`reports/qa/session7/RECONCILED.tsv` until the owner signs, and this file is the record of
what he is being asked to sign and why.
