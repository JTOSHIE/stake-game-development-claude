FS_GATE_TIER_2_Prompt.md. Save this verbatim to reports/briefs/ and commit it with the work. Fresh Opus session on main, drafted per reports/briefs/_TEMPLATE.md, explicit paths, no em or en dashes. NO LOCK EXCEPTIONS, NO MONEY-PATH EDITS.

WHY THIS SESSION EXISTS. Session 8 touched 11 of the gate tier's 19 rows and left **8 untouched**, correctly, at its stop lines. Those 8 are this session's rows. **The owner has additionally authorised one fix OUTSIDE the row set, and it is named in JOB 1 so it cannot be mistaken for scope creep.**

**WHAT SESSION 8 PROVED, AND IT GOVERNS THIS BRIEF'S SHAPE.** Its delegated reconnaissance returned **canPredicateSeeDefect = YES for only 4 of 19 rows**. Four specified fixes were then refused with measurements rather than shipped weak: `setTelemetrySink` is unscannable because esbuild renames it; an origin clause would have been permanently red against 20 legitimate shipping origins; an anti-malware step had no possible seed because no scanner exists; and a pinned licence text does not exist at any of four candidate paths. **Those refusals are the best work in that session.** Expect a similar rate here and budget for it: **a row that cannot carry a proven red is a RESULT, not a failure.**

BUDGET: context is the binding line.
  Main loop about 500k of a roughly 740k working budget. **Gate work is main-loop heavy because the seeded red must be OBSERVED, and observing is not delegable.**
  Agents: about 4 reconnaissance agents. Session 8 measured its six at about 796k on the agent line. **That line is NOT the constraint.**

STOP LINES: no new agents below 400k main-loop context. No new gate started below 300k. Close at 200k. No clock stop.

DEGRADATION ORDER: JOB 1, then 2, then 3, then 4, then 5, then 6. **JOB 1 and JOB 3 are cheap and are never cut.** If short, cut rows from JOB 4 and abandon JOB 5 outright.

DONE MEANS: every row this session touches is committed with a seeded red observed and quoted, or it is recorded as refused with the measurement that refutes it, or it is left untouched and named as not started. **A gate edited without a proven red is reverted before commit rather than left half-proven.**

---

## THE RULE THAT DEFINES THIS SESSION

**Convention (p) is the plant-the-real-defect-and-watch-it-go-red step, and it is the only proof this tier accepts.** Seed the form that actually shipped, not the form the gate happens to handle.

**A SEED INSTRUCTION ASSERTS WHAT THE GATE MEASURES, SO IT IS A PREMISE.** Read the gate and confirm the predicate can see the defect BEFORE writing the seed. Where it cannot, say so with a measurement and move the row to refused.

**AND THE ROW'S OWN PRESCRIPTION IS ALSO ONLY A PREMISE.** Session 8 found four rows whose specified fix was wrong, and one, S2-C008, whose specified SEED was impossible and had to be replaced with an observation-boundary seed. **The recorded remainder text in the ledger is a hypothesis about the fix, not an instruction.**

---

## THE TRAP UNIQUE TO THIS SET, because three of the eight rows carry it

**S2-C059, S2-C069 and S2-C075 each offer a RIGOROUS option and a CHEAP option**, and the cheap option is usually to re-word a document so the claim becomes true rather than to make the mechanism honest.

**Taking the cheap option is legitimate, and it is sometimes correct.** But it is only legitimate under two conditions, and both are required:

1. **The new wording is TRUE at HEAD**, checked rather than asserted.
2. **The new wording is GATED**, with a CHECK anchor or an equivalent, so it cannot rot back. A re-wording that nothing watches is a claim waiting to go stale again, which is the exact failure convention (s) exists to stop.

**Where the cheap option is taken, the commit says plainly that the mechanism was NOT made rigorous and why.** A row closed by re-wording, recorded as though the instrument were fixed, is worse than an open row.

---

## THE THREE RULES CARRIED FORWARD, because each cost a session before

**CONVENTION (h.1), AND ONE ROW WALKS STRAIGHT INTO IT.** `frontend/scripts/layout_fit_gate.mjs` and `frontend/scripts/contrast_gate.mjs` rewrite committed evidence on every plain run. **S2-C024 edits `layout_fit_gate.mjs`.** Use a scratch path or a self-test that exits before writing, and run `git status --porcelain` after every full gate run.

**BOUNDED READS ONLY.** `reports/SESSION_REPORT.md` and `docs/records/reviews/REVIEW_TRACKER.md` are large. Read with ranges. **`reports/qa/session7/RECONCILED.tsv` is 77KB; read it with awk over the columns you need, never whole.**

**COMMIT PER ROW, AND A RESUME LINE AFTER EACH**, appended to `reports/qa/session9/RESUME.md`, which this session CREATES. Rule 13 makes an honest stop lawful only at a boundary, and a gate session has no waves, so the commit is the boundary.

---

READ FIRST

- `CLAUDE.md`: protocol rules 10, 12, 13, 15, 16; conventions (h.1), (k), (p), (q), (s); and THE STANDING MANDATE, which JOB 3 turns on.
- `reports/briefs/FS_GATE_TIER_Prompt.md`: the brief this one continues.
- `reports/qa/session8/RESUME.md`: what landed, what was refused and with what measurement.
- `docs/skills/AGENT_BUDGET_AND_SCHEDULING.md` section 4.5.

ARTEFACTS:
- `reports/qa/session9/RESUME.md`: **CREATE IT.** One line per commit.
- `frontend/scripts/brand_token_gate.mjs`: **CREATE IT**, in JOB 5 only, and only if the budget reaches it.

---

PREMISE PROVENANCE, per rule 16. Resolved against HEAD `a14d409` on 2026-08-05.

- **VERIFIED** by `awk` over `reports/qa/session7/RECONCILED.tsv` cross-checked against `git log 8e2bd1a..HEAD`: exactly **eight** gate rows remain untouched: **S2-C010 (STREAM), S2-C024, S2-C025, S2-C058, S2-C059, S2-C069, S2-C075 (all HIGH) and S2-C122 (MEDIUM)**. Session 8 touched the other eleven.
- **VERIFIED** by grep over those eight fix locations: **zero touch a locked path.** No sanction is needed and none is granted.
- **VERIFIED** by `gh run view`: run `30965873231` was re-run on 2026-08-05 and returned **success, 15 of 15 jobs, with the `browser: replay contract` leg GREEN**. Gate paths were confirmed byte-identical between that commit and the tip before the re-run was treated as evidence. **The browser matrix is currently green and a red now means something.**
- **VERIFIED** by direct read of `scripts/owner_preview.mjs`: line 238 builds the status line with the literal `http://192.168.4.92`, the host machine answers on **192.168.4.95**, and **the file imports no `os` module**, so nothing derives the address today.
- **VERIFIED** by direct read of `frontend/scripts/build_diet_verify.mjs`: it filters to same-origin before counting, so it cannot observe a successful external request. **S2-C058's recorded remainder names `frontend/scripts/platform_conformance_item2.mjs` as the instrument that compares origins properly.**
- **REPORTED, by Session 8's reconnaissance and not re-measured here**: only 4 of 19 rows returned a predicate that could see its defect. **Treat this as the expected rate, not as a target.**
- **REPORTED, by Session 8**: two refused halves await a disposition, S2-C048's anti-malware pass and S2-C052's origin clause and `setTelemetrySink` scan. **JOB 3 settles their status; it does not re-litigate the measurements.**

---

## THE JOBS

### JOB 1: the owner preview line, which is NOT one of the rows and is authorised separately

- **Deliverable**: one commit against `scripts/owner_preview.mjs`.
- **The owner has authorised this explicitly**, so it is in scope; nothing else outside the eight rows is.
- **The defect**: the status line prints a hardcoded LAN address that is now wrong. The server is fine and answers on loopback; only the printed line lies. **This is convention (s) inside the very script that serves rule 12's evidence.**
- **The fix has two halves and the second is the one that matters**: derive the address from `os.networkInterfaces()` at print time rather than storing it, **and have the script CURL the derived address and refuse to print a line it could not reach.** Rule 12 already records that printing a URL is not evidence the URL works; this makes the script obey the rule it exists to serve.
- **Prove it per convention (p)**: force the derivation to a known-bad address and confirm the script refuses rather than printing. **A preview line that has never been seen to fail is the same class of unevidenced claim as a gate that has never gone red.**

### JOB 2: reconnaissance on all eight, delegated, before any edit

- **Deliverable**: one note per row on disk under a scratch path, not committed.
- **Agents**: about 4, container-orchestrated per convention (q), two rows each, shared-nothing.
- **Each agent returns**: the exact insertion point, the predicate as it actually is, **whether that predicate can SEE the defect the row names**, what the seed must look like in the real defect form, and for S2-C059, S2-C069 and S2-C075 **which of the two options the source actually supports.**
- **The agents do not edit anything.** Reconnaissance only.

### JOB 3: settle the two refused halves, because the standing mandate leaves them nowhere

- **Deliverable**: one documentation commit, and an owner-facing item in the session report.
- **The standing mandate is explicit: before submission there is no minor-defer category, only FIXED or explicitly OWNER-PARKED with reasons.** Session 8 refused two halves on measurement, which was the right engineering call, but **a refused half is currently neither**, and that is a gap in the record rather than in the code.
- **Write them up as OWNER-PARK PROPOSALS with the measurements attached**: S2-C048's anti-malware pass, refused because no scanner exists so no honest seed is possible and the step would print PASS without evidence; and S2-C052's origin clause, refused because 20 legitimate absolute origins ship and the RGS host arrives at runtime so there is nothing to allowlist, together with the `setTelemetrySink` scan refused because esbuild renames the symbol.
- **Do not re-argue the measurements.** Record them, state the proposed park, and mark it as awaiting the owner's signature. **The park is not closed until he signs it.**

### JOB 4: the rows recon says are real, in severity order

- **S2-C024 with S2-C025, coordinated, because both touch `frontend/scripts/layout_fit_gate.mjs:190`.** S2-C024 converts that line to a recorded missing-marker with a caller-side failure scoped to at least one of the three mounted per profile. S2-C025 replaces the `.catch(() => '<absent>')` at `frontend/scripts/max_win_hold_gate.mjs:310` with a hard throw and adds a non-empty currency-shaped precondition before the equality checks. **Convention (h.1) applies here and nowhere else in this session.**
- **S2-C058**, the origin assertion. **Use `frontend/scripts/platform_conformance_item2.mjs`, not `frontend/scripts/build_diet_verify.mjs`**, for the reason in the provenance above. The seed patches the SERVED bundle with an external font or CDN request and proves RED. **The matrix is green right now, so this row's leg can be judged honestly.**
- **S2-C059, S2-C069, S2-C075 and S2-C122**, each carrying the either-or trap named above. S2-C069 and S2-C075 additionally have an owner half: S2-C069's preferred option re-runs an asset export, and S2-C075 carries an explicitly separate owner question about how the five books files reach the runner. **Fix the mechanical half, park the owner half, and say which is which.**

### JOB 5: S2-C010, the only new instrument, and only if the budget reaches it

- `frontend/scripts/brand_token_gate.mjs`, which this session CREATES, plus two convention (p) steps in `.github/workflows/checks.yml`, plus the rewrite of the compliance-watch claim so it carries a date, an assessor and the gate name.
- **This is the last STREAM row and it was measured at about 0.75M, so it is a session's work on its own.** Starting it below 300k is forbidden by the stop lines. **Leaving it untouched and named is a lawful outcome; half-building it is not.**

### JOB 6: close per rule 10

Run link recorded for every push, Plan of Record graded, `npm run owner:preview` from `frontend/` per rule 12 **with the line the repaired script prints**, session report per convention (a), handover per convention (i). **State the context used at each commit.**

**AND READ THE MATRIX RESULT, NOT JUST THE RUN CONCLUSION.** Session 8 closed green while the leg exercising the file it had changed had been CANCELLED in both runs that carried the change, and its final push was documentation-only so the matrix skipped. **Report the leg count observed and name the legs, and if a push that changes a gate does not produce a completed matrix, say so and re-run it rather than closing on a green that did not cover the change.**

---

WHAT THIS SESSION MUST NOT DO

- **Do not commit a gate without a proven red.** Revert instead.
- **Do not treat the row's recorded remainder as an instruction.** It is a hypothesis about the fix.
- **Do not close a row by re-wording a document unless the new wording is true at HEAD AND gated**, and say plainly that the mechanism was not made rigorous.
- **Do not re-litigate Session 8's four refusals.** They were measured. JOB 3 records them; it does not reopen them.
- **Do not run `layout_fit_gate.mjs` or `contrast_gate.mjs` in a way that writes committed evidence.**
- **No locked paths**, and zero of the eight need one. **No money-path work.**
- **Do not extend the row set.** Eight rows plus the owner-authorised preview fix, and nothing else.

FOR THE NEXT SESSION: the 19 open documentation rows, one of which, S2-C056, is parked awaiting the owner's confirmation of the `future-spinner-3` destination; the 6 component and 3 other rows, which no brief has yet assigned a job; the reviewers' named blocker, money-display integrity and localisation completeness; and the ten questions of entry 038.
