FS_TRUE_FIXDOWN_Prompt.md. Save this verbatim to reports/briefs/ and commit it with the work. Fresh Opus Ultra session on main, drafted per reports/briefs/_TEMPLATE.md, container orchestration only, explicit paths, no em or en dashes. No lock exceptions: three findings touch locked paths and every one of them parks with a named sanction request.

WHY THIS SESSION EXISTS. Session 2 produced 118 upheld findings. Session 3 re-derived the causes of 27 of them and fixed none. **Nothing has been fixed since.** This is the fixdown, with its premise corrected: earlier briefs described it against numbers that were wrong, and the numbers below were recounted from the ledgers rather than carried.

BOOT: CLAUDE.md (protocol rules 4, 10, 15, 16, conventions (e), (h.1), (l.5), (l.8), (p)); docs/records/WAYS_OF_WORKING.md; docs/records/ROLE_HEAD_OF_ENGINEERING.md; docs/skills/AGENT_BUDGET_AND_SCHEDULING.md 4.3 and 4.4; docs/skills/FULL_AUDIT_METHOD.md 2.2 and 2.7; reports/qa/session3/UPHELD_118.tsv; reports/qa/session3/JOB4_CAUSE_REDERIVATION.md; reports/qa/stream_test/CLUSTERS.md; reports/qa/stream_test/KNOWN_OPEN.md.

BUDGET: 14.5M usable, 4.5h. Reserve 1.5M. Main loop 6.0M. Agents 7.0M.
SCALE: analyst-class squads for cause re-derivation, 15 to 22 artefacts each. Fixing is main-loop work. Re-proof is a capture run plus verification. Sight gate applies to any image work, and image squads price on the MEASURE equation. Post the Plan of Record before the first wave.

STOP LINES: no new waves at 4.0M left; no new agents at 2.5M left; close at 1.5M left.

DEGRADATION ORDER: cluster, then cause re-derivation, then STREAM fixes, then HIGH fixes, then the rest. **Re-derivation of a tier comes before fixes of that tier, and no fix is applied to a cause nobody has checked.** A fix without its re-proof does not count and is reverted rather than left half-proven.

DONE MEANS: every fix applied carries a re-proof from freshly captured evidence and a green gate run; every finding not fixed carries a disposition naming why; the 118 is smaller by exactly the fixes proven; and nothing is newly half-done.

PREMISE PROVENANCE, per rule 16. Every figure below was recounted on 2026-07-30 by the command shown, not carried from a prior brief:

- **VERIFIED**, `awk -F'\t' 'NR>1 && $1 ~ /^S2-C/'` over `reports/qa/session3/UPHELD_118.tsv`: **118 rows**, split **78 UPHELD**, **27 UPHELD CAUSE UNSOUND**, **13 UPHELD ENUMERATION INCOMPLETE**.
- **VERIFIED**, `awk -F'\t' 'NR>1 && $1 ~ /^S2-C/ {s[$2]++} END{for(k in s) print s[k], k}'` over the same file: **20 STREAM, 68 HIGH, 27 MEDIUM, 3 LOW**.
- **VERIFIED**, same file, path column: **47 rows sit in unlocked `frontend/src` code**. The other 71 are documents, CI configuration, locked paths or carry no file. **The code-fixable set is 47, not 118**, and sizing this session against 118 would be sizing against the wrong number.
- **VERIFIED**, same file: **three rows touch locked paths**, S2-C060 and S2-C115 at `frontend/src/lib/services/rgsService.ts`, S2-C062 at `frontend/src/lib/stores/gameStore.ts`. **All three park with a named sanction request. This session carries no lock exception.**
- **VERIFIED**, `grep -c` over both components: **MID-01 is still two clocks.** `WinBanner.svelte` and `HudOverlay.svelte` each still carry their own count-up constants and their own animation frame loop.
- **REPORTED, read the source rather than any summary of it**: 27 causes were re-derived and the outcomes are at `reports/qa/session3/JOB4_CAUSE_REDERIVATION.md`. **Do not trust a restatement of its verdicts, including this brief's.** Read the file.

**THE INVERSION THAT SHOULD SHAPE THE PLAN, and it is the single most useful thing here.** The obvious reading is that the 27 marked CAUSE UNSOUND are the problem rows and the 78 plain UPHELD are safe. **It is the other way round.** The 27 have had their causes re-derived and are the best understood rows in the set. The 13 know their enumeration is short and say so. **The 78 are the rows nobody has questioned**, and they came out of the same discovery process that Session 1 measured at **19 per cent diagnosis soundness**. Treat a plain UPHELD as an unexamined cause, not a verified one.

JOB 1, CLUSTER ACROSS ALL SEVERITY TIERS FIRST, then filter by severity, per `AGENT_BUDGET_AND_SCHEDULING.md` 4.4. Clustering one tier at a time hid genuine corroboration twice before, because squads tier the same defect differently. **A corroboration count from grep-level clustering is a hypothesis, not evidence**, and the same file records that roughly a quarter of such clusters carried a fault: unrelated defects fused, one image read twice counted as two instances, and a signed retraction counted as a corroboration. State the cluster count and the method in the Plan of Record.

JOB 2, RE-DERIVE THE CAUSES THAT NOBODY HAS CHECKED. Squads take the clustered 78 and derive the cause from source, per convention (l.1): go to the specification and the code first, cite `file:line`, and state the closed form before measuring. **UNKNOWN is a complete answer and is often the correct one.** Emit causes as HYPOTHESES per `FULL_AUDIT_METHOD.md` 2.7; only reproduction or source derivation promotes one. **A fix aimed at a wrong line does not fail loudly, it lands as a failed fix**, which is why this job precedes any fixing.

For the **13 ENUMERATION INCOMPLETE** rows, the enumeration is completed before the fix: a fix applied to a short list leaves the class open and closes the row, which is the exact shape of charter row Q-26 and of the Q-12 sweep before it.

JOB 3, THE FIX BATCH, in severity order, unlocked frontend only.
- **MID-01 leads, and it is RULED.** Fable's ruling: banner and WIN pod driven from **one shared count-up source, with frame-level equality asserted**. Two independent clocks currently animate one figure over 1400 ms and 528 ms with identical easing, so they display different dollar amounts at once and the HUD reveals the number the celebration exists to reveal. The equality assertion is a gate, seeded per convention (p): a deliberately desynchronised pair must go RED.
- Each fix re-proven from **freshly captured frames**, never from the old ledger, per `FULL_AUDIT_METHOD.md` 2.2. `frontend/scripts/stream_test_capture.mjs --only <slug>` captures one session in about five minutes and refuses to overwrite committed evidence.
- Gates green, and any gate changed is seeded per convention (p) in the form the defect really takes.
- **Anything larger than small parks with a one-line owner decision.** Larger than small is a real disposition; guessing at a design call is not.
- **Anything needing a locked path parks with a named sanction request**, naming the exact deny lines and the exact one-line change. The three known rows are named above; if a fourth appears, it parks the same way.

JOB 4, THE LEDGER, so the next session inherits truth. Every one of the 118 carries a disposition: FIXED with its proof path, PARKED with its reason, or STRUCK with the re-derivation that killed it. **"Minor" is not a disposition**, per the standing mandate. Update `CLUSTERS.md` and `KNOWN_OPEN.md` with the new counts, and state the before and after plainly.

JOB 5, close per rule 10 with the run link, Plan of Record graded, `npm run owner:preview` from `frontend/` per rule 12 with its printed line quoted, and FOR THE NEXT SESSION naming what remains with counts re-verified from the ledgers rather than carried from here.

WHAT THIS SESSION MUST NOT DO: no lock exception, for any reason, including a fix that looks trivial. Do not fix a cause nobody re-derived. Do not fix a row marked ENUMERATION INCOMPLETE without completing the enumeration. Do not touch the currency table or its gate, which shipped whole in the serial session. Do not start the four-gaps discovery, which is a later session.
