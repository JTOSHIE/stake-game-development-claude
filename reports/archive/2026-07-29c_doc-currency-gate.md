# Session Report - THE DOCUMENT CURRENCY GATE (2026-07-29)

Brief saved verbatim: `reports/briefs/FS_GAP_CURRENCY_GATE_Prompt.md`, per conventions (b)
and (f). Branch: `main`, as the brief directed. No lock exceptions taken;
`git diff .claude/settings.json` never non-empty. No player-visible code touched. No agents
launched. Australian English, no em dashes or en dashes.

Built to `docs/records/DOC_CURRENCY_GATE_SPEC.md`, the approved design, rather than
re-derived.

## Summary

**All six jobs complete, inside 25 of the 105 minutes allowed and with zero agent spend.**

The gate exists, its self-test goes red on eight planted forms and green on six controls, its
first real run is triaged into a frozen baseline of **492 claims keyed by class, file and
text** (485 at the first freeze, plus the 7 this report itself added, explained at the end),
it is wired into CI ahead of the frontend install, and the remote run is green with
the frozen count printing on every run.

**The number the brief asked for plainly: the true first-run count was 11,597 occurrences.**
That is not the repository's debt. It is what an unproven gate reports, and reducing it to
618 took four structural corrections, none of which was an allowlist entry. The settled
figure is **621 occurrences, 485 distinct claims, across 119 of 451 in-scope documents**.

Session 2's sample of 109 findings against this census of 485 distinct claims makes the
sample roughly **22 per cent of the real class**, which is the right order for a sample and
confirms the brief's instruction to size the baseline from the run rather than from the
sample.

**The single most useful thing this session found is one line long.** The gate's first new
finding after its last correction was `census.mjs`, cited in **this session's own
commissioning brief** as the tool Session 2 used to classify the tree. It exists nowhere in
the repository. It is frozen rather than corrected, because convention (f) says a brief is
never tidied. A gate built to catch documents that cite things which are not there caught
the document that ordered it, within minutes of existing.

## The Plan of Record, graded

Posted before the first spend, per protocol rule 15.

| Line | Planned | Actual | Verdict |
|---|---|---|---|
| Waves | zero agent waves, main loop only | zero | **held** |
| Agents | 0 planned, 1.5M released back | 0 launched, 1.5M unspent | **held** |
| Expected findings | "unknown by design, planning for the 300 to 1,500 band" | 485 distinct | **inside the band** |
| Triage method | by class, not by instance; bounded reads only | 6 marshalling commands, no findings file read into context | **held** |
| Triage rounds budgeted | 4 to 6 run/inspect/correct rounds | 5 | **held** |
| JOBS 1 to 6 | about 3.0M against 5.5M main loop | all six delivered | **FITS, confirmed** |
| Wall clock | 105 minutes | about 25 minutes to the close | **well inside** |

**The one thing the plan got wrong, recorded because the misses are the useful part.** The
plan named "the first run correcting the gate" as the session's real risk rather than budget,
and budgeted iteration rounds for it. That was right. What it underestimated was the
MAGNITUDE: the plan implicitly expected a first run in the same order as the final figure,
and the first run was **nineteen times** the settled number. Had the stop lines been tight,
the temptation to freeze 11,597 findings and call it a baseline would have been real, and
that baseline would have been a lie about its own size. **The lesson for the next gate: budget
the correction rounds by the gap between a raw first run and a triaged one, not by the size of
the expected debt.**

## The tension in the brief, surfaced rather than decided quietly

Per convention (n), which requires the tension be named rather than a side picked silently.

JOB 1 said **"do not implement phase 2 predicates in this job."** JOB 2 required seed 1, a
line reading NOT YET MIRRORED about a path that exists, to make the gate go RED, and **that
form is not catchable by any phase 1 class.** The spec itself puts it in phase 2: section 4's
`!exists` example is literally the payments case. Seed 5, `count=519`, is the same.

The reading taken, and the reasoning: JOB 1's prohibition is scoped "in this job", JOB 2 is a
different job and is marked non-negotiable, and the degradation order forbids shipping an
unseeded gate outright. So the five phase 1 classes were built first, the predicate engine was
added where seed 1 forced it, and JOB 5 remained what it says it is: the pilot **annotations**
on the two approved documents plus an adoption verdict. Nothing was widened beyond those two
documents.

## JOB 1 and JOB 2: the checker and its seeded self-test

`scripts/qa/doc_currency_gate.mjs`. Five phase 1 classes over 451 tracked `.md`, excluding
`reports/archive/` and `docs/stake-engine-live/` as sources while keeping both valid as
targets, plus the four phase 2 predicates.

**The UNKNOWN premise resolved before a line was written.** The brief asked whether an
existing gate already covers part of this class and said to extend rather than add if one
fits. Checked: `asset_reference_gate.mjs` reads asset paths out of **code** into **dist**;
`locked_paths_gate.mjs` reads **git commits** against locked paths; `dash_gate.mjs` and
`machine_tell_gate.mjs` scan **frontend source**. **No gate reads a `.md` file and asks
whether its claims are still true.** A new script was warranted.

**The dash-gate premise re-confirmed**, as the brief required before wiring anything that
scans `docs/`: `dash_gate.mjs:174` walks `src/`, `:184` walks `dist/`, and neither touches
`docs/`. Upstream captures carrying en dashes remain outside its reach.

**The self-test, convention (p).** Fourteen cases in a real throwaway git repository with real
commits, running the shipped `scanTree` rather than a restatement of its regexes, because the
plumbing is where a path-matching gate actually goes wrong. Eight seeds red, six controls
green. Seed 1 is the payments case in the form it shipped.

**The self-test was then itself tested, which is the step convention (p) does not name but
implies.** Disabling each finding class in turn drives at least one case to MISSED:

| Class disabled | Self-test cases that go MISSED |
|---|---|
| `DEAD_PATH` | 1 |
| `STALE_LINE` | 1 |
| `DEAD_SYMBOL` | 1 |
| `DEAD_COMMIT` | 1 |
| `STALE_CLAIM` | 2 |
| `DEAD_DOCREF` | 2 |
| `BAD_PREDICATE` | 1 |

Fourteen green on a first run is exactly what a self-test that is not wired to anything looks
like. This is the evidence that it is wired.

**Control 3 deserves naming**: the same five defects inside a fenced code block must NOT be
flagged. Fenced content is the gate's largest declared blind spot, and a declared blind spot is
only honest if it is also tested. If fenced content ever starts producing findings, that
control goes red rather than the change passing quietly.

## JOB 3: the first real run, and the four corrections it forced

The spec predicted the first run would correct the gate, and it did, four times. **Every
correction was structural. Nothing was allowlisted.**

| # | The flaw | Cost on the first run | The structural fix |
|---|---|---|---|
| 1 | **Resolution by full path only.** This repository cites `checks.yml` and `App.svelte`, not their repository paths, and that is the normal register of every document in it. | **5,368 live files read as dead** | Resolution by path-boundary SUFFIX. Ambiguity is not resolved by guessing: a suffix matching two files EXISTS but has no unique target, so line-count and symbol checks are skipped and counted. |
| 2 | **Any dotted token read as a file.** `import.meta.env.DEV`, `round.state`, `authenticate.round` are expressions and field accessors. | about 150 | Extensions DERIVED from the tracked tree, not listed by hand, because a hand-written list goes stale exactly the way this gate exists to prevent. |
| 3 | **Any 7 to 40 character hex read as a SHA.** This project records source and shipped MD5 hashes for every adopted asset by standing convention. | 108 of 121 | Lengths restricted to 7 to 12 or exactly 40, which is what git produces and what a content hash is not, plus a required git context word. |
| 4 | **A word boundary cannot match before a dot**, so every `.github/...` citation arrived having lost one character; and `../LEDGER.md` was never resolved relative to its own document. | **129 findings were the missing dot alone** | Restore a leading dot when the preceding character is one; resolve relative references against the citing document's directory. |

**11,597 to 618.** A fifth correction came later, during JOB 5, and is recorded there.

**Sample verification before freezing anything**, because a baseline of unverified findings is
the most dangerous artefact this project can generate (convention (r)). Checked by hand:
`ControlBar.svelte`, `BalanceDisplay.svelte`, `Counter.svelte`, `PayTable.svelte`,
`OverdriveMeter.svelte` and `player_string_dash_check.mjs` exist **nowhere in the tree**, and
`CLAUDE.md:414` independently records two of them as removed. True positives.

**The ratchet, proved in both directions against the live repository and not only in the
self-test:**

- a planted reference to a non-existent component in `reports/briefs/README.md` produced
  `1 new` and exit 1;
- a ghost entry added to the baseline produced `the frozen baseline has rusted` and exit 1;
- both restored, `git status` clean, gate green.

### The 485 are NOT all repository debt, and saying so is the point

Method 3.1 warns that freezing a false positive is worse than missing a real one, because it
makes the debt list lie about its own size. So the composition is stated rather than left for
Session 3 to discover:

| Category | Occurrences | What it is |
|---|---|---|
| Components and scripts that exist nowhere | **64** | Genuine, verified, high value. `ControlBar.svelte`, `BalanceDisplay.svelte`, `Counter.svelte`, `PayTable.svelte`, `OverdriveMeter.svelte`, `player_string_dash_check.mjs`. |
| Upload-bundle internal layout | **119**, of which 33 sit in `docs/records/upload-kit/00_READ_ME_FIRST.md` | `01_maths_upload/`, `build-info.json`, `math/HASHES.txt`. These describe the **produced artefact's** structure, not repository paths. Dead by the gate's definition, and correctly so, but they will never resolve and the fix is rewording, not restoring a file. |
| Everything else | the remainder | Ordinary drift across 119 documents. |
| `BAD_PREDICATE` | 1 | `DOC_CURRENCY_GATE_SPEC.md:118`, the spec describing `count=519` in prose outside a fence. Frozen rather than edited: the spec is the approved design and is not this session's to amend. |

**Session 3's JOB 4 owns the burn-down.** The recommended order is the 64 first, because they
are unambiguous and each one is a document telling a reader to open a file that is not there.
The 119 upload-bundle entries are a wording decision, not a repair, and are worth one ruling
rather than 119 edits.

## JOB 4: CI wiring

Two steps in `.github/workflows/checks.yml`, in the `static gates` job, immediately after
`locked_paths_gate.mjs` and before the frontend install:

1. `document currency, seeded-violation self-test`
2. `document currency scan`

**The self-test runs first, as its own step, which is the whole point of the ordering.** A gate
that has lost the ability to fail is caught by CI rather than by a reviewer four days later,
which is precisely how the dash gate's second failure was found.

`fetch-depth: 0` was already set on the checkout for the locked-paths gate, and the dead-commit
class needs exactly that: on a shallow clone every cited SHA would read as dead. Verified
present rather than assumed.

## JOB 5: the phase 2 pilot, and the adoption verdict

Four annotations, on `SUBMISSION_DOSSIER.md` and `GAME_FACTS.md` only. Nothing widened.

| Document | Predicate | Why this claim |
|---|---|---|
| `SUBMISSION_DOSSIER.md` 5c | `count=7 games/future_spinner/library/publish_files/*` | This is the claim whose earlier wording said "all eleven now present", true of the build machine and false of this repository. Three external reviewers cloned it, saw seven, and one raised it as a **BLOCKER**. |
| `SUBMISSION_DOSSIER.md` 5c | `count=5 .../lookUpTable_*_0.csv` | The other half of the same inventory. |
| `GAME_FACTS.md` 2 | `grep "_WINCAP = 5000.0" games/future_spinner/game_config.py` | The hard cap, checked against the maths package rather than restated. |
| `GAME_FACTS.md` 2 | `grep "self.num_reels = 5" games/future_spinner/game_config.py` | Annotated ahead of the prettier figures on purpose. The worked example behind convention (l.1) is a scatter count reported from measurement when `num_reels = 5` was one line of specification away. |

**Proved live, not decorative.** Falsifying each turns the gate red: `count=8` and
`_WINCAP = 4000.0` both produce `STALE_CLAIM`. An annotation that cannot fail is decoration.

**A fifth structural correction was found while choosing these targets, and it mattered.**
`library` was in the gate's unresolvable-segment list because `.gitignore` excludes
`**/library/**`. **Nine files under it are tracked anyway, and those nine ARE the submission
artefact set.** That made it the worst place in the entire tree for the gate to be blind. The
segment list is now verified against what git actually tracks rather than copied from
`.gitignore`, and the disagreement between the two is recorded beside it. This correction is
what exposed the `census.mjs` finding in the brief.

### THE ADOPTION VERDICT FOR FABLE: NOT PROVEN, and the split is the useful part

The brief said an honest NOT PROVEN is a complete answer and is more useful than a forced yes.
It is NOT PROVEN, but the failure is not where the spec expected it.

**What IS proven.** The predicates work, they attach cleanly to real load-bearing claims, they
fail when falsified, and they cost about ten minutes for four annotations. The mechanism is
sound.

**What is NOT proven, and cannot be by this session.** The spec's warning is that *a predicate
nobody writes checks nothing*. That is a claim about ADOPTION OVER TIME, and **the session that
built the gate annotating two documents is the weakest possible evidence for it.** I am not a
representative future session: I had the syntax in my head, I had just read the spec, and I was
told to do it. A session three weeks from now, mid-way through an unrelated job, is the real
test and this session cannot stand in for it.

**Two observations worth more than the verdict:**

1. **The cost is in CHOOSING, not in writing.** Selecting four load-bearing claims took longer
   than annotating them. The syntax is not the barrier; knowing which claim would cost
   something if it went stale is. That means training or examples will not drive adoption.
   Naming specific claims in a brief will.

2. **Phase 1 and phase 2 have completely different economics, and the asymmetry should shape
   the policy.** Phase 1 needed no adoption at all and immediately found 485 claims including
   one in its own commissioning brief. Phase 2 finds exactly what someone remembers to
   annotate, forever.

**The recommendation, offered as a question for ruling rather than a decision taken:** keep
phase 2 deliberately small and hard-capped at a named list of high-cost claims, rather than
promoting it as a general convention. A broad convention that decays looks like coverage and is
not, which is the same failure mode as a gate that has never been seen to fail. The four
annotations here are a reasonable permanent size for it.

## Verification

| Check | Result |
|---|---|
| Seeded self-test, local | **14/14**, eight seeds red, six controls green |
| Self-test wired to the gate | proved by mutation, seven classes, each drives a MISSED |
| Gate scan, local | **PASS**, 451 documents, 621 occurrences, 485 frozen, 0 new |
| Ratchet direction 1, new drift | **FAIL as designed**, exit 1, on the live repository |
| Ratchet direction 2, rusted entry | **FAIL as designed**, exit 1, on the live repository |
| Phase 2 predicates falsified | **RED as designed**, both forms |
| Em or en dashes in anything written this session | **0** across script, baseline, workflow, brief, both documents and both commit messages |
| `git diff .claude/settings.json` | empty throughout, no lock exception taken |
| Locked paths touched | none |

**Rule 10, the remote CI result, CHECKED and not assumed.**
Run: https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30429779929
Both new steps green on the runner: `document currency, seeded-violation self-test` **success**,
`document currency scan` **success**.

**Rule 12, the owner preview**, refreshed before this report was written, and curled rather than
believed, per the clause earned on the rule's own first run:

```
OWNER PREVIEW  |  v10 line, main  |  commit 63534f9  |  built 2026-07-29T16:54:55+10:00  |  http://192.168.4.92:5173
```

`curl` returned **HTTP 200**, 1,256 bytes, 0.003s. It is run once more as the LAST action of
this close, after the final push, per the one-commit-lag clause: the line quoted here is the
earlier one, the address is the later one.

## What this session deliberately did NOT do

Stated so the scope boundary is auditable, and every item is from the brief's own list:

- **No finding was fixed.** Not one of the 485. The burn-down is Session 3's JOB 4, and doing it
  here would have left that session an unmeasurable target. The brief allowed striking claims
  that are trivially and verifiably dead; none was struck, because striking any of them would
  have moved the baseline Session 3 is meant to burn down.
- **No player-visible frontend code touched.**
- **MID-01 not implemented.**
- **Phase 2 not widened** beyond `SUBMISSION_DOSSIER.md` and `GAME_FACTS.md`.
- **No agents launched.** The 1.5M agent allowance is returned unspent. The first run's triage
  was six marshalling commands over a TSV on disk; hand triage was never the slower path, and
  delegating deterministic classification would have been the error the brief named.

## FOR THE NEXT SESSION

**Model and effort:** Opus 5, Ultra, main loop only, zero subagents, zero workflows.

**Approach:** write the checker, seed it, run it, let the run correct it, freeze, wire, pilot.
The order mattered: every one of the five structural corrections came from looking at the real
run's output grouped by TEXT FREQUENCY rather than by file. The most common finding text names
the design flaw every time. `awk -F'\t' '$1=="CLASS"{print $3}' run.tsv | sort | uniq -c | sort -rn | head`
was the whole triage method, and it never read a finding into context.

**Alternatives tried and rejected:**
- *Extending an existing gate rather than adding a script*, per the standing preference. Checked
  four candidates and rejected: none reads a `.md` file and asks whether its claims are true.
- *Allowlisting the basename false positives.* Rejected on 3.2's instruction; 5,368 findings were
  one missing resolution rule, and an allowlist would have hidden the design flaw permanently.
- *Scanning fenced code blocks.* Rejected and declared as a blind spot, with a negative control
  pinning it. Fences here hold shell commands and sample markdown, including this gate's own
  syntax as documented in the spec.
- *Freezing the 11,597 raw first run.* Rejected. That baseline would have lied about its size by
  a factor of nineteen.

**Files touched:** `scripts/qa/doc_currency_gate.mjs` (new), `scripts/qa/doc_currency_baseline.json`
(new), `.github/workflows/checks.yml`, `GAME_FACTS.md`, `SUBMISSION_DOSSIER.md`,
`reports/briefs/FS_GAP_CURRENCY_GATE_Prompt.md` (new), this report and its archived copy.

### SESSION 3'S BRIEF STANDS, AND ITS TIER 2 IS COMPLETE

This is the confirmation the brief's JOB 6 asked for.

**The currency gate was tier 2 of Session 3's degradation order. It is done, shipped, seeded,
frozen and green on the remote runner.** Session 3's Plan of Record can move that budget to the
**82 unguarded requirements**, which is the count Fable said it will be watching fall to zero.
Nothing in Session 3's brief needs rewriting; one tier is simply already discharged.

**Session 3's JOB 4 now has a measurable target it did not have this morning:**
**492 frozen claims** in `scripts/qa/doc_currency_baseline.json`, keyed by class, file and text,
with the by-class breakdown in the file's own header. Burn entries in the same commit as their
fix and the count in the log will be the count in the gate.

Three things Session 3 should know before it starts on that list:

1. **Start with the 64 verified-dead component and script references.** They are unambiguous,
   they are concentrated in a handful of documents, and each is a live document telling a reader
   to open a file that is not there.
2. **The 119 upload-bundle-layout entries are ONE ruling, not 119 edits.** They describe the
   produced artefact's internal structure and will never resolve against the repository. Ask
   whether the wording should change or whether the class should be scoped out of the gate, and
   do it once.
3. **Do not add to the baseline to make a run green.** The file says so in its own header. It is
   the debt that existed when the gate went live and it only shrinks.

**One open thread, small and named rather than left to be rediscovered.** The gate's declared
blind spots are in its header and each is deliberate, but two are worth revisiting if the class
ever justifies it: a bare SHA in a table cell with no surrounding git context word is not read as
a SHA, and a directory reference written without its trailing slash is not checked, because it is
indistinguishable from a branch name. Both were traded knowingly against large false-positive
populations. Neither is a bug; both are stated here so a future reader does not have to re-derive
why the gate is quiet about them.

## AN OBSERVATION THIS REPORT PRODUCED BY EXISTING, AND A QUESTION FOR RULING

Committing this report added **14 new occurrences, which deduplicate to 7 distinct claims**, and
every one of them is a
reference this report makes ON PURPOSE: `ControlBar.svelte`, `BalanceDisplay.svelte`,
`Counter.svelte`, `PayTable.svelte`, `OverdriveMeter.svelte`, `player_string_dash_check.mjs`
and `census.mjs`, named here as evidence that they are dead.

**This is not a defect and it has not been worked around.** The gate is behaving exactly to
specification: those are backticked paths that do not exist at HEAD. They are frozen with
the rest, taking the baseline from 485 to its final **492**.

But it is a permanent property worth naming, because it will recur for every session that
reports on this class: **a document whose job is to record that something is dead cannot say
so without tripping a gate that fails on references to dead things.**

**THE TENSION, surfaced rather than decided, per convention (n).**
`docs/records/DOC_CURRENCY_GATE_SPEC.md` disagrees with itself on this point:

- **Section 4** says plainly: *"Do not annotate session reports or archives: they are dated
  records of what was true then, and re-checking them against a moved HEAD is exactly the
  epoch trap."*
- **Section 6** sets the scan scope as *"all tracked `.md` outside `reports/archive/` and
  `docs/stake-engine-live/`"*, which does NOT exclude `reports/SESSION_REPORT.md`, even
  though that file is a concatenation of the same dated session records, each under its own
  `# Session Report - X (date)` heading, that get copied into `reports/archive/` verbatim.

The result is that the identical text is **out of scope in the archive and in scope in the
live file**. `reports/SESSION_REPORT.md` is now the single largest contributor to the
baseline at **41 of 485 entries before this report, and 48 of 492 after it.**

**The scope was NOT widened to resolve this, deliberately.** The brief is the sanction and it
named the exclusions explicitly; convention (n) says the sanction governs, and quietly
widening a gate's exclusion list to make one's own report pass would be the exact move the
frozen-debt ratchet exists to prevent. The question is put rather than answered:

> **Should `reports/SESSION_REPORT.md` be out of scope on the same grounds as
> `reports/archive/`, given that it holds the same dated records and its entries are copied
> there verbatim?**

If the ruling is yes, it is a one-line change to `OUT_OF_SCOPE` in
`scripts/qa/doc_currency_gate.mjs` plus a re-freeze, and it would remove 48 entries
from Session 3's burn-down target as out of scope rather than as fixed. If the ruling is no,
the entries stay and future session reports will keep adding a handful each, which is
survivable but should then be an expected cost rather than a surprise.
