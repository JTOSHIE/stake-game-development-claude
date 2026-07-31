FS_SAMPLE_Prompt.md. Save this verbatim to reports/briefs/ and commit it with the work. Fresh Opus session on main, drafted per reports/briefs/_TEMPLATE.md, explicit paths, no em or en dashes. NO LOCK EXCEPTIONS, NO MONEY-PATH EDITS, NO FIXES OF ANY KIND.

WHY THIS SESSION EXISTS. The owner has ruled option (b) on the backlog question, recorded at `reports/FABLE_COMMS.md` entry 039: buy a measured sample before deciding whether to re-ground 71 unreproduced causes. **This session buys that measurement and nothing else.**

**WHAT IS BEING MEASURED, stated precisely, because getting this wrong wastes the whole session.** Not whether the 71 findings are real. Not whether they should be fixed. **The accuracy of the CAUSE DERIVATIONS attached to them.** A wave-A agent read some source and wrote down why a symptom occurs. This session establishes how often that reasoning was right, by deriving the same causes again, independently, and comparing.

**THE OUTPUT IS A RATE AND A PER-SQUAD BREAKDOWN.** If the rate is uniformly high the remaining 56 can be trusted. If it is low the owner buys the full re-grounding. **If it varies by squad, which is the outcome nobody has considered, some squads' work is trustworthy and some is not, and that is a different and better answer than either.**

BUDGET: context is the binding line.
  Main loop about 200k of a roughly 740k working budget. This is a DISCOVERY session and the main loop must stay light: it dispatches, collects structured verdicts, and computes a rate.
  Agents: 15 derivation agents plus a comparison pass. **At this project's measured 97k to 143k per text agent, budget about 1.8M on the agent line.** That line is NOT the constraint and is not rationed.

STOP LINES: no new agents below 300k main-loop context. Close at 200k. No clock stop: the owner has ruled ready when it is right.

DEGRADATION ORDER: JOB 1, then 2, then 3, then 4. **A sample of ten with a stated rate beats a sample of fifteen that never got compared.** If short, cut the sample size, never the comparison.

DONE MEANS: every sampled row carries an INDEPENDENT derivation, a verdict against the recorded one, and a contamination flag; and the rate file this session CREATES at `reports/qa/sample/RATE.md` states the rate overall and per squad, with the sample size and what it excludes.

---

## THE DESIGN PROBLEM, AND IT IS THE WHOLE DIFFICULTY

**The recorded causes are committed to this repository.** An agent asked to re-derive a cause will find the original by searching, agree with it, and return a false confirmation. `docs/skills/FULL_AUDIT_METHOD.md` section 1.3 records this exact failure: a blind control cannot exist where the answer is committed, because finding relevant material is what an agent is for.

**So the blinding is imperfect and this brief does not pretend otherwise.** Three measures, and the third is the one that makes the result honest:

1. **Each derivation agent is given the SYMPTOM ONLY, inline, with no row id and no recorded cause.** It is not told a prior derivation exists. It derives from source per convention (l.1).
2. **The ledger files are forbidden**: `reports/qa/session4b/waveA_raw.json`, `DISPOSITIONS.tsv`, `LEDGER.md`, and everything under `reports/qa/session2_audit/`. Naming them here is how the session knows what to exclude.
3. **CONTAMINATION IS MEASURED RATHER THAN ASSUMED AWAY.** Every derivation agent is asked, as its last question: *did you encounter any pre-existing statement of this symptom's cause, anywhere?* If yes, it names where. **Those rows are marked CONTAMINATED and excluded from the rate, and the count of them is reported.** A sample of eleven clean rows with a stated exclusion is worth more than fifteen where four secretly read the answer.

**Do not attempt to defeat contamination by cleverness.** No temporary deletions, no stashing, no altering the tree. The tree is not modified by this session at all.

---

READ FIRST

- `CLAUDE.md`: protocol rules 13, 15, 16; conventions (l.1), (l.2), (l.4), (l.6), (p), (q).
- `docs/skills/FULL_AUDIT_METHOD.md` sections 1.3, 2.7 and 4.1: blind controls, observations against diagnoses, and the durability layer.
- `docs/skills/AGENT_BUDGET_AND_SCHEDULING.md` section 4.5.
- `reports/FABLE_COMMS.md` entry 039: the owner's ruling that authorises this.

ARTEFACTS, which this session CREATES:
- `reports/qa/sample/SAMPLE.tsv`: **CREATE IT.** The fifteen chosen rows and why each was chosen.
- `reports/qa/sample/shards/`: **CREATE IT.** One shard per derivation agent.
- `reports/qa/sample/RATE.md`: **CREATE IT.** The measurement.

---

PREMISE PROVENANCE, per rule 16. Resolved against HEAD `59c1056` on 2026-07-31.

- **VERIFIED** by a script over `reports/qa/session4b/waveA_raw.json`: **71 rows** are PARKED, carry a `src` beginning `wave-a:`, and have a non-empty `derived` field.
- **VERIFIED**, by the same script grouping on the `src` field: they span **eleven squads**, sized 13, 10, 10, 8, 5, 5, 5, 5, 5, 3 and 2. Severity splits 11 STREAM, 45 HIGH, 13 MEDIUM, 2 LOW.
- **VERIFIED** by direct read of `reports/qa/session4b/LEDGER.md`: the ledger's own standing instruction is to treat a wave-A derivation as a HYPOTHESIS until reproduced. **This session tests that instruction rather than assuming it.**
- **REPORTED, and the session must not treat it as settled**: earlier passes measured diagnosis soundness at about 19 per cent against observation soundness at about 94 per cent. **Those figures are from a different pass with a different method. Do not anchor on them**; if this sample lands near them that is corroboration, and if it does not, this measurement is the better one because it was designed to measure exactly this.

---

## THE JOBS

### JOB 1: choose the sample, and record why

- **Deliverable**: `reports/qa/sample/SAMPLE.tsv`, which this session CREATES, committed BEFORE any agent runs.
- **Agents**: none. Main loop, about 20 minutes.
- **STRATIFY BY SQUAD, one row from each of the eleven, then four more from the largest squads.** Not random. The actionable question is whether quality VARIES by squad, and a random draw of fifteen from a skewed population can miss squads entirely.
- **Within a squad, choose by a stated rule and record it**, so the choice is auditable and not a preference. Highest severity first, ties broken by lowest row id, is sufficient and is stated here so the session does not invent one.
- **Commit this file before running anything.** A sample chosen after seeing results is not a sample.

### JOB 2: fifteen independent derivations

- **Deliverable**: one shard per row under `reports/qa/sample/shards/`, which this session CREATES.
- **Agents**: 15, container-orchestrated per convention (q), one row each, shared-nothing.
- **Each agent is given**: the symptom text inline, the file it was observed in, and nothing else. **No row id. No recorded cause. No mention that a prior derivation exists.**
- **Each agent returns**: the cause it derived with `file:line` citations, the closed form per convention (l.1), or **UNKNOWN, which is a complete and often correct answer**; plus the contamination question answered.
- **An agent that cannot derive a cause from source must say UNKNOWN rather than reason to a plausible one.** A sample polluted by confident guesses measures nothing. Say this in every agent prompt.

### JOB 3: compare, and this is where the measurement is actually made

- **Deliverable**: verdicts appended to the sample file this session CREATES in JOB 1.
- **Agents**: a comparison pass. Each comparison sees the recorded cause and the fresh derivation and rules one of:
  - **SAME**: materially the same mechanism, wording differences only.
  - **PARTIAL**: overlapping but the fresh one is narrower, wider, or names a different primary cause among several.
  - **DIFFERENT**: they contradict, or the fresh derivation refutes the recorded one.
  - **UNDERIVABLE**: the fresh pass returned UNKNOWN, so the recorded cause is neither confirmed nor refuted.
- **UNDERIVABLE IS NOT A FAILURE OF THE RECORDED CAUSE AND MUST NOT BE COUNTED AS ONE.** It measures the difficulty of the row. Report it as its own category.
- **Where they DIFFER, the comparison says which is better supported by the cited source and why.** A disagreement in which the ORIGINAL is right is as important a result as the reverse, and a session that assumes the fresh derivation wins has measured nothing.

### JOB 4: state the rate, and close per rule 10

- **Deliverable**: `reports/qa/sample/RATE.md`, which this session CREATES.
- State: sample size, contaminated and excluded, and the counts of SAME, PARTIAL, DIFFERENT and UNDERIVABLE, **overall and per squad**.
- **State the confidence honestly.** Fifteen rows from 71 is a small sample and a per-squad cell of one row is an anecdote, not a rate. **Say which per-squad figures are too thin to act on.**
- **Recommend, do not decide**: whether the remaining 56 can be trusted, need full re-grounding, or should be split by squad. **The decision is the owner's** and this session states the evidence for it.
- Close per rule 10 with the run link, Plan of Record graded, `npm run owner:preview` from `frontend/` per rule 12.

---

WHAT THIS SESSION MUST NOT DO

- **No fixes. None.** Not a typo, not a one-liner, not a stale line it notices in passing. **A row it finds wrong is a RESULT, not a task.**
- **No disposition changes.** Nothing moves from PARKED. The ledger is not edited.
- **Do not open the forbidden ledger files.** Named above.
- **Do not modify the tree to improve blinding.** No deletions, no stashing.
- **Do not tell a derivation agent what the recorded cause was**, including by paraphrase or by asking a leading question.
- **No locked paths, no money-path work, no sanction.**
- **Do not extend the sample because early results look interesting.** The sample was fixed in JOB 1 and changing it after seeing results is how a measurement becomes a story.

FOR THE NEXT SESSION: the owner's decision on the remaining 56, taken from this rate; and the ten questions of entry 038, of which two are the owner's referrals to the Product Owner and eight await his next check-in.
