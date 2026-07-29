FS_SESSION4A_MECHANISMS_Prompt.md. Save this verbatim to reports/briefs/ and commit it with the work. Fresh Opus Ultra session on main, drafted per reports/briefs/_TEMPLATE.md, no lock exceptions, explicit paths, no em or en dashes.

BOOT: CLAUDE.md (note protocol rule 16, PREMISE PROVENANCE, and convention (p)); docs/records/WAYS_OF_WORKING.md; reports/qa/session3/MECHANISMS.md, which is the build order and the whole plan; reports/qa/session3/PARKED_TRACKER.md; scripts/qa/doc_currency_gate.mjs as the worked example of a seeded gate; .github/workflows/checks.yml as the wiring inventory.

WHY THIS SESSION EXISTS: Session 3 measured the 79 unguarded requirements as 21 proof mechanisms, built 2 of them covering 14 requirements, and parked the rest. **65 requirements are still unguarded.** This session continues that tier, in the coverage order Session 3 already ranked. It is 4a of a two-part split; 4b is the fix-down of the 118 upheld findings and runs after, deliberately, because a gate built here catches a regression from a fix made there. **Build the proof, then fix under it.**

BUDGET: 7.0M usable, 1h20 hard wall. Reserve 0.8M. **Main loop 5.0M. Agents 1.2M.**
**CONSTRUCTION SESSION. The default is near-zero agents.** Session 3 measured a seeded gate at **0.75M static, 1.0M browser**, which is the only real figure this project holds and it came from building two. At 5.0M that is **six to eight gates**, not more. Agents are for verifying a built gate against its requirements, never for writing one. Post the Plan of Record before any spend, and state in it how many gates the arithmetic actually buys.

STOP LINES: no new gate started at 25 minutes remaining or 2.0M left; close at 15 minutes remaining or 0.8M left, whichever comes first. **A gate without its seeded self-test does not ship: if seeds are not red at a stop line, revert that gate rather than wire an unproven one.**

DEGRADATION ORDER: build strictly in the coverage order at MECHANISMS.md, highest first, one complete gate at a time. **A gate is complete only when built, seeded red, negative-controlled, wired and green on the remote runner.** Half a gate is worth nothing and is reverted, never left.

DONE MEANS: every gate built this session is seeded, wired and verified green on the REMOTE runner; every requirement it covers is moved from parked to held with the gate named; MECHANISMS.md and PARKED_TRACKER.md reflect the new counts; and the unguarded number is restated plainly, from 65 to whatever it actually reaches.

PREMISE PROVENANCE, per rule 16:
- **VERIFIED 2026-07-29 by direct read**: `MECHANISMS.md` ranks all 21 by coverage with cumulative totals. M01 (11 reqs) and M08 (3 reqs) are BUILT and wired. **14 of 79 held, 65 outstanding.**
- **VERIFIED 2026-07-29 by direct read**: **M09 is BLOCKED and must not be built**, whatever its rank. It is a phase 2 widening of the currency gate, and Fable capped phase 2 at two named documents pending an adoption ruling. Skip it and take the next in order.
- **VERIFIED 2026-07-29**: the cost figures above are measured from Session 3's two gates, not estimated. Treat them as the planning constant and report the actual against them at close, since two data points is a thin basis and this session doubles or trebles it.
- **NEW CONSTRAINT, VERIFIED 2026-07-29, and it did not exist when Session 3 planned**: **the repository is now PRIVATE, so GitHub Actions minutes are metered.** A push currently costs **24.1 BILLED minutes** across 12 jobs, against 3.3 minutes of wall clock, because each parallel job bills separately. Free tier is 2,000 minutes per month, so about 83 pushes. **Every browser gate added makes this worse.**

JOB 1, THE ARITHMETIC BEFORE THE BUILDING. Recount the held and outstanding figures from `MECHANISMS.md` rather than trusting this brief. State in the Plan of Record: how many gates 5.0M buys at the measured rate, which mechanisms that reaches down the ranked list, and the cumulative coverage it lands on. **If the answer is six gates reaching cumulative 49, say so before building rather than discovering it at the wall.**

JOB 2, BUILD IN COVERAGE ORDER. Next in rank after the two built: M02 disclaimer and social vocabulary conformance (8 reqs, EXTEND), M03 delivery set and kit payload conformance (8, NEW), M04 currency display table conformance (5, EXTEND), M05 money readout and wager bounds live (5, EXTEND, browser), M07 shipped asset provenance manifest (4, NEW), M13 prohibited content lexicon (2, EXTEND), M10 shipped artefact external origin (2, EXTEND), M11 dependency licence and advisory (2, NEW).

Each gate, without exception:
- **Seeded per convention (p), in the form the defect really takes**, plus negative controls. Plant the real defect, prove the gate goes RED, then prove the clean tree passes. `scripts/qa/doc_currency_gate.mjs --self-test` is the worked example: eighteen cases, seeds and controls paired.
- **A paired positive for every negative control.** Session 3's scope work learned this the hard way: three controls passed because nothing was being scanned rather than because the exclusion worked, and only a paired positive seed exposed it. A negative control with no paired positive proves nothing.
- **Wired into `checks.yml` with the self-test as its OWN step BEFORE the scan**, so a gate that has lost the ability to fail is caught by CI rather than by a reviewer four days later.
- **Expect the first real run to correct the gate.** Every gate this project has shipped produced false positives on its first run and every one was a design flaw rather than an exception. Fix structurally; do not allowlist what you can fix.

JOB 3, THE CI COST OF WHAT YOU ADD, which is new and is a first-class constraint now that the repository is private. **Prefer EXTEND over NEW, and prefer a static gate over a browser gate**, on cost as well as on build time. **State each new gate's added BILLED minutes in the session report**, measured from its first remote run rather than estimated. If a mechanism can only be proven in a browser, build it, but say what it costs. A proof nobody can afford to run is not a proof.

JOB 4, UPDATE THE REGISTERS so the next session inherits truth: `MECHANISMS.md` marks what is built, `PARKED_TRACKER.md` moves the newly held requirements out of parked with the gate named against each, and the unguarded count is restated. **A requirement is held only when a gate that would FAIL if it were broken is green in CI.** Anything less stays parked.

JOB 5, close per rule 10 with the run link, Plan of Record graded, the measured cost per gate reported against the 0.75M and 1.0M planning constants, and FOR THE NEXT SESSION handing 4b the fix-down of the 118 with the gates now standing under it.

WHAT THIS SESSION MUST NOT DO: do not build M09, which is blocked. Do not start the fix-down of the 118, which is 4b. Do not widen currency gate phase 2. Do not touch a locked path; anything needing one is parked with a named sanction request. Do not let a gate ship unseeded, which is the one rule here with no exception.
