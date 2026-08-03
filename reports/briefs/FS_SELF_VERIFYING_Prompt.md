FS_SELF_VERIFYING_Prompt.md. Save this verbatim to reports/briefs/ and commit it with the work. Fresh Opus session on main, drafted per reports/briefs/_TEMPLATE.md, explicit paths, no em or en dashes. NO LOCK EXCEPTIONS, NO MONEY-PATH EDITS.

WHY THIS SESSION EXISTS. The owner ruled option (A) after the measured sample established that re-derivation cannot be bought here and would not be worth buying if it could. **The route it authorises is to act on rows whose FIX CARRIES ITS OWN PROOF, without resolving whether the recorded cause is right.** The observations were upheld at 94 per cent; only the causes are doubtful. A fix verified by its own gate does not need the narrative to be sound.

**BUT RECONCILIATION COMES FIRST, AND THIS WAS NOT IN THE PLAN THE OWNER APPROVED.** Spot-checking the candidate set found rows ALREADY FIXED AT HEAD that the ledger still records as PARKED. **Eight were confirmed by direct read before this brief was written and the true number is unknown.** So the backlog everyone has been sizing against is inflated by an unknown amount, and fixing before counting would spend the session re-fixing closed rows.

BUDGET: context is the binding line.
  Main loop about 400k of a roughly 740k working budget. **The fixes are main-loop work and that is what binds**; the reconciliation is delegable and must be delegated.
  Agents: about 12 for JOB 1. At the measured 97k to 143k per text agent, roughly 1.5M on the agent line. That line is NOT the constraint.

STOP LINES: no new agents below 350k main-loop context. No new fix started below 250k. Close at 200k. No clock stop.

DEGRADATION ORDER: JOB 1, then 2, then 3, then 4, then 5. **JOB 1 is never skipped**: a reconciled count is worth more than any number of fixes made without one, because it is the figure three sessions of planning have been wrong about.

DONE MEANS: every one of the 57 candidate rows carries a verdict of ALREADY CLOSED, STILL OPEN or UNKNOWN against HEAD; the ledger records those verdicts; and every row this session fixes is committed with a proof that does not depend on the recorded cause being correct.

---

## THE RULE THAT DEFINES THIS SESSION

**A fix is SELF-VERIFYING when its proof does not require knowing why the defect happened.**

- A document claim either resolves against HEAD or it does not. **Self-verifying.**
- A gate either goes red on a seeded defect or it does not, per convention (p). **Self-verifying.**
- A rendered change proven by a committed frame or a browser assertion. **Self-verifying.**
- **A change justified by "because the cause was X" is NOT**, and does not belong in this session.

**Where a row cannot be fixed self-verifyingly, park it and say so.** That is the whole discipline here, and it is what makes this session affordable when a reproduction pass over the same rows was costed at twenty-plus sessions.

---

## THE TWO RULES CARRIED FORWARD, because they cost sessions before

**BOUNDED READS ONLY.** `reports/SESSION_REPORT.md`, `docs/records/reviews/REVIEW_TRACKER.md` and `reports/qa/session4b/waveA_raw.json` are together about forty per cent of the working budget if opened whole. Read with ranges. Delegate any read whose output you do not need to hold.

**COMMIT PER ROW, AND A RESUME LINE AFTER EACH**, appended to `reports/qa/session7/RESUME.md`, which this session CREATES. Protocol rule 13 makes an honest stop lawful only at a boundary, and a fix session has no waves, so the commit is the boundary.

---

READ FIRST

- `CLAUDE.md`: protocol rules 10, 12, 13, 15, 16; conventions (h), (h.1), (k), (p), (q), (s).
- `docs/skills/FULL_AUDIT_METHOD.md` sections 1.3, 1.3a and 1.3b: why re-derivation was abandoned, measured rather than argued.
- `docs/skills/AGENT_BUDGET_AND_SCHEDULING.md` section 4.5.
- `reports/qa/sample/RATE.md`: the measurement that authorised this route.

ARTEFACTS:
- `reports/qa/session7/RECONCILED.tsv`: **CREATE IT.** One row per candidate, with its verdict.
- `reports/qa/session7/RESUME.md`: **CREATE IT.** One line per commit.

---

PREMISE PROVENANCE, per rule 16. Resolved against HEAD `df04d8c` on 2026-08-03.

- **VERIFIED** by a script over `reports/qa/session4b/waveA_raw.json`: of the 71 PARKED wave-A rows, **57** are unlocked, sized ONE_LINE or SMALL, and carry a concrete fix location. **Only 4 of the 71 touch a locked path.**
- **VERIFIED**, by the same script grouping on each row's primary fix file with `Counter`: the 57 split **26 documentation, 16 gate or CI, 8 component or code, 7 other**.
- **VERIFIED** by direct read of `reports/qa/session4b/DISPOSITIONS.tsv` against HEAD: **S2-C006, S2-C009, S2-C017, S2-C067, S2-C073, S2-C074, S2-C092 and S2-C012 all still read PARKED**, and at least three of them are demonstrably fixed. `grep -c "Twelve files" SUBMISSION_DOSSIER.md` returns 1 and `grep -c "(12 files)" BOOKS_MANIFEST.md` returns 1, which are the exact corrections two of those rows ask for.
- **UNKNOWN, and JOB 1 exists to settle it**: how many of the 57 are already closed. Eight are suspected, the rest are unmeasured. **Do not assume the eight are the whole of it, and do not assume all eight are closed either: two of them were verified by inference from a commit message rather than from source.**

---

## THE JOBS

### JOB 1: reconcile all 57 against HEAD, before fixing anything

- **Deliverable**: `reports/qa/session7/RECONCILED.tsv`, which this session CREATES, one row per candidate, committed before any fix.
- **Agents**: about 12, container-orchestrated per convention (q), roughly five rows each, shared-nothing.
- **Each agent is given the rows' ids, their recorded symptom and their recorded fix location inline**, and returns for each: **ALREADY CLOSED** with the evidence at HEAD, **STILL OPEN** with what remains, or **UNKNOWN** with what it could not settle.
- **The agent is judging the DEFECT, not the cause.** It must not evaluate whether the recorded reasoning is sound; that question was measured and abandoned. **Say so in every agent prompt**, or agents will re-litigate causes and the session will have bought the thing the last one proved worthless.
- **Report the reconciled count loudly in the session report.** Three sessions of planning have sized against a number that is wrong, and the corrected figure is the most useful thing this session can produce.

### JOB 2: the documentation tier

- **Deliverable**: one commit per row, or one per document where several rows share it.
- **26 candidates before reconciliation.** These are the cheapest and the most clearly self-verifying: the claim resolves against HEAD or it does not.
- **Convention (s) governs every correction**: do not write a moving value into a sentence that will be read later. Prefer a stable name over a line number, and a dated record over a present-tense figure. **Three documents were corrected this way in the last week and the pattern is established.**
- **A row whose correction needs a judgement, a ruling or an owner decision is PARKED, not guessed.**

### JOB 3: the gate and CI tier

- **Deliverable**: one commit per gate, each with its seeded self-test.
- **16 candidates before reconciliation**, in `frontend/scripts/`, `scripts/qa/` and the workflow files.
- **Convention (p) is the whole proof here**: plant the defect in the form it really occurs and prove the gate goes RED. **A gate wired without a proven red does not count and is reverted rather than left half-proven.**
- **Watch for gates that write into committed evidence.** Several do. Use `--self-test` where it exits before writing, or a scratch path, and check `git status --porcelain` after every full run.

### JOB 4: make the ledger true

- **Deliverable**: the reconciled verdicts recorded where a future session will read them.
- **Every row this session closed, and every row JOB 1 found already closed, is recorded.** The current state is the failure this session exists to stop repeating: eight closed rows still reading PARKED, in the file every planning session opens.
- **Do not silently rewrite the wave-A text.** Corrections are additive and dated, which is the pattern already established in that ledger.

### JOB 5: close per rule 10

Run link recorded for every push, Plan of Record graded, `npm run owner:preview` from `frontend/` per rule 12 with its printed line quoted, session report per convention (a), handover per convention (i). **State the context used at each commit.**

**AND STATE THE CI CAVEAT HONESTLY.** A documentation-only push skips the twelve browser legs by design. If this session's final push is documentation-only, say which commit last exercised the browser matrix rather than reporting a bare green.

---

WHAT THIS SESSION MUST NOT DO

- **Do not re-derive a cause, or evaluate whether a recorded one is sound.** That was measured on 2026-07-31 and abandoned. `FULL_AUDIT_METHOD.md` 1.3a records why.
- **Do not fix a row whose proof depends on the cause being right.** Park it.
- **No locked paths.** Four of the 71 touch one and none is in this session's set.
- **No money-path work**, and nothing that changes a player-visible money figure.
- **Do not open `reports/qa/session4b/waveA_raw.json` in the main loop.** It is large and every anchor this session needs is either inline above or in the reconciliation shards.
- **Do not extend the candidate set.** 57 rows, fixed before the session began.

FOR THE NEXT SESSION: the reviewers' own named blocker, money-display integrity and localisation completeness, which the owner has ruled comes next and which no session has yet scoped; and the ten questions of entry 038, eight of which await the Product Owner's next check-in.
