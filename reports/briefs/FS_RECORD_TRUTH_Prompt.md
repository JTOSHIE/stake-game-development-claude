FS_RECORD_TRUTH_Prompt.md. Save this verbatim to reports/briefs/ and commit it with the work. Fresh Opus session on main, drafted per reports/briefs/_TEMPLATE.md, explicit paths, no em or en dashes. NO LOCK EXCEPTIONS and NO MONEY-PATH EDITS.

THIS SESSION RUNS UNATTENDED. The owner starts it and goes to sleep. Nobody will answer a question, unblock a stop, or notice a red main for several hours. Every rule below exists because of that.

WHY THIS SESSION EXISTS, and why it is NOT the session that was nearly written. The obvious subject was the blocker the round-three reviewers named: money-display integrity and localisation completeness. Three independent reviews of that scope rejected it, and the reasons are recorded here so nobody re-proposes it:

- **The owner has a standing ruling against it.** `reports/FABLE_COMMS.md:1283`, entry 026 ruling 1: *"The sequencing amendment. Remediation before discovery."*
- **Money display is the one band where nothing can be acted on.** Every finding escalates to the owner and the Product Owner under convention (l.8). A sweep would add to the blocked queue, which is already the bottleneck.
- **It would produce the most dangerous artefact this project can generate.** Sized honestly the sweep is about 13.6M against a 13.7M agent line, so discovery would run and verification would not, and the session would commit a findings list that reads authoritative and is not.

So the SHAPE is kept and the PURPOSE is changed. Agents do every read; the main loop only decides, dispatches and applies small diffs. The subject is making the record true against HEAD, plus the one row that is both named on a reviewer's path and fully unblocked.

BUDGET: context is the binding line, not tokens and not the clock.
  window about 1,000k; less boot about 60k; less close reserve about 200k.
  WORKING BUDGET about 740k. Agents are cheap and the token line is not the constraint: delegate every read.

STOP LINES: no new wave below 300k working context. No new agents below 250k. Close at 200k. There is no clock stop: the owner has ruled ready when it is right, no date at all. **If the stop line is reached mid-job, stop at the last commit boundary and write the resume line. A half-applied document is worse than an untouched one.**

DEGRADATION ORDER: JOB 0, then 1, then 2, then 3, then 4. Anything not reached is PARKED with its resume line and never half-attempted.

DONE MEANS: every document JOB 2 touches agrees with HEAD or carries a dated note saying why it does not; TR-111 is either closed with its gate proven red on a planted defect, or explicitly skipped with a surgical brief written; and every commit is pushed with its remote CI result read and recorded.

---

## THE UNATTENDED RULES. These outrank every job below.

**1. PORT 5173 BELONGS TO THE OWNER AND IT IS RUNNING RIGHT NOW.** The gitignored runtime pidfile under .owner-preview, which is untracked by design and so is written here without backticks, records pid 24548, `vite dev --host 0.0.0.0 --port 5173`, started 2026-07-30. **Do not bind it, probe it, restart it or kill it.** Fourteen scripts hardcode that port. **`pkill` is in the allowlist and must never be used**, on vite or anything else. Any browser work uses a script that starts its own server on its own port.

**2. FIVE GATES WRITE STRAIGHT INTO COMMITTED EVIDENCE, and a read-only instruction does not stop them.** Convention (h.1) records this happening. **Reading a gate as TEXT is encouraged and is usually what you actually want.** To EXECUTE one, either use its `--self-test` flag where it exits before writing, or copy it to a scratch path outside the repository first. **After any full gate run, immediately check `git status --porcelain` and restore any committed evidence file it touched, per path and by name.**

**3. A DIRTY TREE BLOCKS THE CLOSE.** `scripts/owner_preview.mjs` refuses to run against one, and rule 12 requires the preview refresh at close. Unattended, a dirtied tree at 3am means the session cannot close properly. Check `git status --porcelain` before every commit.

**4. NEVER `git checkout -- .`, NEVER `git clean`, NEVER `rm -rf` a repository path.** `reports/screens/` holds 1,398 committed files. The clean-up instinct is more destructive than the accident. Restoration is per path and named. Deletion is renaming aside, per `docs/skills/FULL_AUDIT_METHOD.md` 4.2.

**5. `.claude/settings.json` IS UNTOUCHABLE BY ANY ROUTE**, including Bash, sed, cp and python. No deny line is named in this brief, so no lock lift is authorised. Verify `git diff --exit-code .claude/settings.json` before every commit.

**6. NEVER RUN `node scripts/kit_build.mjs` WITHOUT `--check` OR `--self-test`.** A full run writes to the owner's Desktop. An agent has already done this once.

**7. PUSH EARLY AND READ THE RESULT. `main` HAS NO BRANCH PROTECTION.** Verified: the protection API returns 404. A red main with nobody awake stops the line under rule 10. So: push the first commit inside the first hour, read its remote result with `gh run list` and `gh run view`, and record the run link. **If a push goes red, STOP ALL OTHER WORK, fix forward or revert that commit, and get main green before continuing.** Do not batch pushes to the end.

**8. WRITE ONLY TO THE REPOSITORY WORKING TREE AND TO SCRATCH.** Convention (g) pre-authorises Desktop writes and convention (c) names one permitted Desktop file, but this session has no reason to write there and must not.

**9. WHEN A JOB FINISHES EARLY, DO NOT INVENT WORK.** Everything tempting is forbidden: unparking Q-16, fixing the mini-player clip, wiring the currency metadata, inserting tracker rows nobody ruled on. **Go to the next job, or close early and say so.** Closing early with a clean record is a good outcome.

---

READ FIRST

- `CLAUDE.md`: protocol rules 10, 12, 13, 15, 16; conventions (b), (e), (f), (g), (h.1), (k), (p), (q), (s).
- `docs/skills/AGENT_BUDGET_AND_SCHEDULING.md` section 4.5: main loop context as a budget line.
- `docs/skills/FULL_AUDIT_METHOD.md` sections 2.7 and 4.1: observations versus diagnoses, and the durability layer.
- `docs/records/ROLE_HEAD_OF_ENGINEERING.md` section 2.
- `reports/qa/PREFLIGHT_FS_MONEY_SERIAL_2.md`: what is blocked, so this session does not stray into it.

ARTEFACTS, with their paths:
- `reports/qa/session6/RESUME.md`: **CREATE IT.** One line per commit.
- `reports/qa/session6/RECORD_DELTA.tsv`: **CREATE IT.** One row per claim corrected.
- `reports/qa/session6/shards/`: **CREATE IT.** One agent shard per document.

---

PREMISE PROVENANCE, per rule 16. Resolved against HEAD `9749813` on 2026-07-31 by the command shown.

- **VERIFIED**, `grep -n "Remediation before discovery" reports/FABLE_COMMS.md`: line 1283, entry 026 ruling 1.
- **VERIFIED**, `sed -n '46,47p;206p' frontend/scripts/build_diet_verify.mjs`: `startPreview()` returns `_server`, `killPreview()` exists and is called by nothing, and `:206` calls `preview.kill()`, which is not a method on that object. **The gate throws before its assertion is ever reached.** `grep -c build_diet_verify .github/workflows/checks.yml` returns 1 and that hit is a COMMENT. **The script is dead AND unwired, and the submission dossier cites its output as compliance evidence.**
- **VERIFIED**, `sed -n '312p' docs/records/reviews/REVIEW_TRACKER.md`: TR-059 still reads `OPEN, mapped to JOB 2`. Commit `1494bdf` keyed that prose across sixteen locales on 2026-07-28. **The tracker understates the work by three days.**
- **VERIFIED**, `lsof -nP -iTCP:5173 -sTCP:LISTEN`: the owner's dev server is LISTENING on port 5173 right now, pid 24548. Corroborated by the gitignored runtime pidfile under .owner-preview, which is untracked by design and so is named here without backticks.
- **CORRECTED, and this is a premise an earlier draft of this brief got wrong.** The number of answers owed by the Product Owner is **TWELVE, not seven**. Seven asks are in `reports/FABLE_COMMS.md` entry 031; entry 034 adds five more. **Do not restate seven anywhere.**
- **REPORTED, and JOB 0 must settle it before any wave**: whether this session has container orchestration or only chat-spawned agents. `docs/skills/FULL_AUDIT_METHOD.md` 4.1 requires the container for any wave above about four agents, because a chat fan-out leaves no run id and nothing to resume. **If only chat-spawn is available, cap every wave at four agents and say so in the Plan of Record.**

---

## THE JOBS

### JOB 0: safety boot and the Plan of Record

- **Deliverable**: `reports/qa/session6/BOOT.md`, which this session CREATES, committed before anything else.
- **Agents**: none. Main loop, about 20 minutes.
- Record, each as a pasted command result: `git status --porcelain` is empty; `git rev-parse HEAD`; `gh run list --limit 1` is green; `git diff --exit-code .claude/settings.json` is clean. Confirm which orchestration exists and set the wave cap.
- Then post the PLAN OF RECORD with the verification cost computed at launch and a FITS or DOES NOT FIT verdict, per rule 15.

### JOB 1: TR-111, repair the dead network-hygiene gate

- **Deliverable**: a commit to `frontend/scripts/build_diet_verify.mjs`, its seeded self-test, and its CI wiring in `.github/workflows/checks.yml`.
- **Why first**: it is named on a reviewer's own path to three stars, it is fully unblocked, and it is the one row a sleeping session can genuinely close. **It also proves the commit, push, CI and preview loop works while there are hours left to repair a red main.**
- The one-word fix is `preview.kill()` becoming a call to the existing `killPreview()`. **The self-test is the real cost**: plant a genuine external network request in a scratch copy of `dist` and prove the gate goes RED, with a paired negative control, per convention (p).
- **TIME-BOXED at 75 minutes.** If the seeded self-test cannot be finished inside it, **ship nothing**, write a surgical brief to `reports/briefs/` per multi-track rule 6, and move to JOB 2. A gate wired without a proven red is worse than no gate.
- **Cost**: about 60k main loop, one agent to reproduce the throw.

### JOB 2: make the record true against HEAD

- **Deliverable**: one agent shard per document under `reports/qa/session6/shards/` and a consolidated `RECORD_DELTA.tsv`, both of which this session CREATES, and **one commit per document**.
- **This is the highest-yield thing a sleeping session can do**, because a stale register is what corrupts every work order written after it, including this seat's.
- **Agents: SEVEN, one per document, each returning a DIFF PROPOSAL and never an edit.** Documents: `docs/records/reviews/REVIEW_TRACKER.md`, `SUBMISSION_DOSSIER.md`, `GAME_FACTS.md`, `BOOKS_MANIFEST.md`, `COMPLIANCE_WATCH.md`, `docs/QUALITY_CHARTER.md`, `reports/qa/stream_test/KNOWN_OPEN.md`.
- Each agent recounts **that document's own claims** against HEAD and returns: the claim, its line, whether it holds, and the exact replacement text. **An agent that cannot settle a claim returns UNKNOWN.** Do not let one guess.
- **Start with TR-059**, which is verified stale above, so the first shard has a known answer to calibrate against.
- **Convention (s) applies to every correction**: do not write a moving value into an instruction. History gets dates and names; instructions do not.
- **The main loop applies diffs and never reads a transcript.** Marshal the shards by grep.
- **Cost**: seven agents, roughly 0.9M. Main loop about 150k for the applications.

### JOB 3: prove the localisation half is closed, and do NOT wire the prose gate as it stands

- **Deliverable**: a shard at `reports/qa/session6/shards/LOCALISATION.md`, which this session CREATES, and tracker corrections if it confirms them.
- Two reviewers named hardcoded English as a path item. **Most of it is already fixed and the tracker does not say so**: `WinBanner.svelte`'s tier words and `PaytableModal.svelte`'s prose are keyed at HEAD.
- **Agents: two.** One confirms the reviewers' specific citations are closed at HEAD. One enumerates what English literals genuinely survive, with `file:line`, **as OBSERVATIONS only**. Per `FULL_AUDIT_METHOD.md` 2.7, observations verified at 94 per cent and diagnoses at 19 per cent, so **no agent proposes a cause or a fix**.
- **`frontend/scripts/locale_prose_conformance.mjs` is NOT wired into CI, and this session must not wire it.** It detects a LEAK, meaning a string byte-identical to English, not an ABSENCE, meaning a literal never keyed at all. Wiring it as the answer to the reviewers' ask would ship false assurance. **Record that distinction; leave the decision to a ruling.**
- **It also writes into `reports/qa/` on a full run.** Rule 2 above applies.

### JOB 4: close per rule 10

Run link recorded for every push, Plan of Record graded, `npm run owner:preview` from `frontend/` per rule 12 with its printed line quoted, session report per convention (a), handover per convention (i). **State the context used at each commit**, so the next brief sizes from a measurement.

---

WHAT THIS SESSION MUST NOT DO

- **No money-path work of any kind**, including measuring one to propose a fix. TR-086, TR-109, TR-115 and everything in the twelve owed answers are out of scope. **A session reading "money display" as a subject will start fixing; this brief is not that session.**
- **No lock exceptions.** No named deny line, so none is authorised.
- **Do not wire `locale_prose_conformance.mjs`.** JOB 3.
- **Do not run the money-display sweep** that was scoped and rejected. The reasons are at the top; do not re-derive them.
- **Do not touch `frontend/src/lib/services/rgsService.ts`, `frontend/src/lib/stores/gameStore.ts` or `games/future_spinner/`.**
- **Do not add tracker rows for findings nobody has ruled on.** Record them in the shard and hand them forward.

FOR THE NEXT SESSION: the twelve answers owed, the money-display band once they arrive, TR-086 as reviewer 2's named blocker, and the never-swept areas the quality charter records.
