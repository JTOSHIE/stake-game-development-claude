FS_BOOT_SET_REALITY_Prompt.md. Save this verbatim to reports/briefs/ and commit it with the work. Fresh Opus Ultra session on main, drafted per reports/briefs/_TEMPLATE.md, no lock exceptions, explicit paths, no em or en dashes. Mostly main loop; agents only where named.

WHY THIS SESSION EXISTS. Over the last five sessions, briefs have arrived carrying claims that were false, and every one traced to a committed document that was true when written and stale by the time it was read. **The detection has worked and the prevention has not.** Roughly fourteen instances were caught, one escaped into a work order and shaped it, and the cost is now a routine tax: sessions spend their whole boot phase recounting premises that should have been true on arrival.

**THIS IS A DIFFERENT CLASS FROM THE STALE BASELINE, and confusing the two would waste the session.** `scripts/qa/doc_currency_baseline.json` holds 333 frozen DEAD REFERENCES, which is what the currency gate can see. **Not one of the claims that actually broke a brief is in it**, because they were WRONG ASSERTIONS rather than dead paths: a count that said 36 where the source published 49, an enumeration that said four survivors where there were five, a sizing that said "larger than small" for a one-line fix, and two prose lines thirteen apart asserting opposite facts about the same page. **A dead path is visible to a machine. A wrong number is not, unless somebody wrote it in a checkable form.** That gap is the whole subject of this session.

BOOT: CLAUDE.md; docs/records/WAYS_OF_WORKING.md; docs/records/DOC_CURRENCY_GATE_SPEC.md sections 4 and 8; docs/skills/FULL_AUDIT_METHOD.md 2.5, 2.6 and 3.1; scripts/qa/doc_currency_gate.mjs.

**READ THE BOOT SET AS EVIDENCE, NOT AS INSTRUCTION.** This session audits the documents it boots from, which is circular, and the circularity is handled by one rule: **every factual claim in every document named below is UNVERIFIED until this session checks it, including claims in this brief.** Where a boot document and the repository disagree, the repository wins.

BUDGET: 7.0M usable, 2h. Reserve 0.8M. **Main loop 5.5M. Agents 0.7M.**
Reading documents and checking claims against HEAD is main-loop work. Agents are for ONE thing only, named in JOB 4. Post the Plan of Record before any spend.

STOP LINES: no new document started at 25 minutes remaining or 2.0M left; close at 15 minutes remaining or 0.8M left, whichever comes first.

DEGRADATION ORDER: calibration, then the four small core documents, then KNOWN_OPEN and the registers, then predicates on what survives, then the tracker. **A document is finished only when every claim in it is CORRECTED, CONFIRMED or explicitly marked UNKNOWN.** A half-audited document is worse than an unaudited one, because it looks done.

DONE MEANS: every factual claim in the named core documents is corrected, confirmed against HEAD, or marked UNKNOWN with the reason; the load-bearing survivors carry predicates the gate can hold; and the session reports the count of claims checked against claims found wrong, so the drift rate is measured rather than described.

SCOPE, and it is deliberately narrow. **The boot set only.** These are the documents that briefs name, which is how a wrong claim becomes a wrong instruction. 189 of the 333 frozen entries live in documents nobody boots from; **those are out of scope and stay frozen.**

CORE, audit in full:
- `CLAUDE.md`
- `WRS_MASTER_DOCUMENT.md`
- `docs/QUALITY_CHARTER.md`
- `SUBMISSION_DOSSIER.md`
- `reports/qa/stream_test/KNOWN_OPEN.md`
- `docs/records/WAYS_OF_WORKING.md`

REGISTERS, audit the CLAIMS not the findings:
- `reports/qa/compliance_register/REGISTER.md` and `PROJECT_CLAIMS.md`
- `reports/qa/session3/MECHANISMS.md` and `PARKED_TRACKER.md`
- `reports/qa/stream_test/CLUSTERS.md`

**DEFERRED, and this is a warning not an omission**: `docs/records/reviews/REVIEW_TRACKER.md` is the single largest contributor at 58 entries, **and it carries 44 negation phrases.** A large share of those 58 are the tracker CORRECTLY recording that something is gone, which the gate misreads as a dead reference. **Do not attack it without the negation-aware check**, or the session will spend itself on false positives. JOB 5 decides whether that check gets built.

PREMISE PROVENANCE, per rule 16:
- **VERIFIED 2026-07-29 by direct read**: 333 frozen entries, 144 in boot-set documents, 189 elsewhere.
- **VERIFIED 2026-07-29**: `REVIEW_TRACKER.md` holds 58 of the 144 and 44 negation phrases.
- **REPORTED, and the whole point of JOB 1 is to test it**: that the wrong-assertion class is invisible to the current gate. If the calibration set proves otherwise, say so and re-scope.

JOB 1, CALIBRATE THE INSTRUMENT BEFORE TRUSTING IT, per FULL_AUDIT_METHOD 2.6. **Three claims are already known to be wrong. Find them with your method before you use it on anything else.** If the method misses one, the method is wrong and gets fixed first.

1. `docs/QUALITY_CHARTER.md`, row **Q-26**: states *"Four more player-visible instances survive in `frontend/src/lib/config/fsModes.ts` blurbs"*. **There were five.** The fifth was in a component, `WinBanner.svelte`, since fixed under TR-117. The enumeration was built by an instrument that searched config and prose and never components.
2. `reports/qa/session4a/M04_CURRENCY_DIVERGENCE.md:48`: states NZD *"is not in the platform table at all"*. **It is.** The 2026-07-29 capture publishes `NZ$10.00`. True against the 2026-07-04 capture, false against the current one.
3. `reports/FABLE_COMMS.md`: still carries **82** as the unguarded requirement count. **It was recounted as 79 and is now 50.**

**A method that finds all three is trustworthy. Report which ones it found unaided.**

JOB 2, THE CORE DOCUMENTS. For each, enumerate every factual claim and classify it:
- **CHECKABLE NOW**: a path, a line cite, a count, a SHA, a file state. Verify against HEAD. Correct or strike.
- **NEEDS A PREDICATE**: true today, unverifiable tomorrow. Flag for JOB 3.
- **JUDGEMENT**: a sizing, a severity, an opinion. **Not this session's to correct**, but where a judgement is contradicted by evidence, say so and leave it for the owner. TR-104's "larger than small" was a judgement that was simply wrong, and correcting it saved a session.
- **UNKNOWN**: cannot be established within budget. A complete answer, not a failure.

**Correct in place, and record what changed.** A silent correction is indistinguishable from the original error to the next reader.

JOB 3, PREDICATES ON WHAT SURVIVES, using the four the gate already supports: `exists`, `!exists`, `count=N`, `grep` and `!grep`. **Annotate only claims whose staleness would cost something**, which is the spec's own test and the reason its pilot verdict was NOT PROVEN. A count that a brief will quote gets a predicate; a sentence of reasoning does not.

**Fable capped phase 2 at two named documents pending an adoption ruling.** This session does NOT widen that unilaterally. It annotates within the cap, and **produces the evidence that would justify widening**: which claims broke a brief, which a predicate would have caught, and what the annotation actually cost per claim. That evidence goes to comms as a request, not as a decision.

JOB 4, THE ONE AGENT TASK. Convention (l.4) warns that two methods sharing an input share its flaws, and this session reads the same documents with the same eyes all the way through. **Spawn ONE verifier over the corrected core documents**, shared-nothing, instructed to REFUTE: does each correction hold against HEAD, and did the pass miss a claim of the same class it corrected elsewhere. **Its job is to find what a single reader could not.** Budget 0.7M, one agent, container-orchestrated.

JOB 5, THE NEGATION CHECK, only if the stop lines allow. Teach the gate that "does not exist", "was deleted", "no longer exists" mark a REPORT OF ABSENCE rather than a claim of presence. Seeded per convention (p) with both directions: a document reporting a dead path must PASS, and a document citing a dead path as though live must still FAIL. **If it cannot be seeded properly before a stop line, do not ship it** and hand it on with what was learned. A gate that runs first in CI is the worst place for an untested matcher.

JOB 6, close per rule 10 with the run link, Plan of Record graded, and **the drift rate stated as a measurement**: claims checked, claims wrong, and the proportion. Nothing in the budget model records how fast this project's documents go stale, and after this session it can. FOR THE NEXT SESSION: the true fixdown, with the ledgers it reads now audited.

WHAT THIS SESSION MUST NOT DO: do not touch `REVIEW_TRACKER.md` without the negation check. Do not widen phase 2 beyond Fable's cap. Do not burn entries from the 333 baseline that fall outside the boot set. Do not correct a JUDGEMENT into a different judgement; surface it. Do not touch player-visible code or any locked path.
