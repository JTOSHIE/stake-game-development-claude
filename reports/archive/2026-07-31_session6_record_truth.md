# Session Report - SESSION 6, MAKING THE RECORD TRUE AGAINST HEAD (2026-07-31)

Brief saved verbatim: `reports/briefs/FS_RECORD_TRUTH_Prompt.md`, per conventions (b) and (f).
Branch: `main`; this session held the INTEGRATOR role. Model Opus 5. Unattended, owner asleep.
Start `9749813`, end `e89065d` plus this report.
`.claude/settings.json` diff verified empty at every commit. No lock exception taken or authorised.

## Summary

| Job | Outcome |
|---|---|
| JOB 0, safety boot and Plan of Record | **DONE** |
| JOB 1, TR-111, the dead network-hygiene gate | **DONE**, closed with a proven red |
| JOB 2, make the record true against HEAD | **DISCOVERY DONE, APPLICATION PARTIAL**: 1 of 7 documents applied, 6 parked with resume lines |
| JOB 3, the localisation half | **DONE**, and the prose gate deliberately NOT wired |
| JOB 4, close per rule 10 | **DONE** |

Eight commits, every one pushed and every remote result read, per the brief's unattended rule 7.

| # | Commit | Remote run | Result |
|---|---|---|---|
| 1 | `1bc6b5c` | 30572358384 | **RED**, fixed forward |
| 2 | `b8d8012` | 30572609221 | green |
| 3 | `de2fa23` | 30573360277 | green, and the new gate leg passed |
| 4 | `ba4ce67` | 30573931019 | green |
| 5 | `e16bee0` | superseded within minutes by 6 | |
| 6 | `9bb88c6` | 30575807242 | green |
| 7 | `9164183` | 30576110947 | green |
| 8 | `e89065d` | recorded in the close below | |

## The red on the first commit, kept rather than buried

Commit 1 failed CI. `scripts/qa/doc_currency_gate.mjs` flagged `BOOT.md:207` as a
`DEAD_DOCREF`: the boot document cited `reports/qa/session6/RESUME.md` before that file
existed. Fixed forward by creating the file, not by reverting.

**This session exists to find documents whose claims have drifted from HEAD, and it shipped
one in its own first commit.** The gate caught it in sixty seconds, and only because the brief
required pushing early rather than batching pushes to the end. That is unattended rule 7
stated as a measurement rather than as a principle.

## JOB 1: TR-111, the gate the submission dossier cites

**Reproduced by running it, not by reading it.** The gate died with
`TypeError: preview.kill is not a function`, printing no summary and no verdict of any kind.
The TR-101 migration to an in-process server changed the handle's type: `startStaticServer`
resolves `{ url, port, close }`, and `killPreview()` already existed with zero call sites.

**Two properties are why it survived ten days, and both shaped the fix.**

1. **The exit code was 1**, which is exactly what a working gate returns when it fails. It came
   from the top-level catch, not from the assertions. Anything watching exit status saw a gate
   that ran and failed.
2. **A throw from a `finally` replaces the exception already leaving the `try`**, so one line
   both broke the gate and hid whatever was underneath it. Nothing was, as it turned out.

**The self-test was the real work.** It seeds a live reference to a pruned asset in a
throwaway copy of `dist` under the OS temp directory. That is the form TR-047 actually
shipped, and `previewServer.mjs` answers it at status 200 as a single-page app must, so it is
invisible to every 404 check and visible only to the pruned-prefix assertion. Seeding a 404
would have proved a different assertion and learned nothing, which is the substitution
convention (p) was written about.

**Neither control accepts an exit code as evidence, and that is the whole design.** Under the
defect every run exited 1, so an exit-status assertion would have been satisfied by the broken
gate. The negative control demands the real PASS line and is what catches a gate that throws.
**Proven, not asserted**: the defect was temporarily reintroduced, both controls failed, and
the negative one reported it as a gate defect rather than a bundle defect. The fix was then
restored and verified by diff.

Wired into the **browser** matrix, never the static job, since it launches chromium and that
mistake is what reddened runs 117 to 120. 18.4 seconds for all three runs, measured by `time`.

The gate now returns a real verdict for the first time in its life: 52 requests, zero 404s,
zero pruned-path hits, zero console errors, 14.99MB against the 25MB budget.

## JOB 2 and JOB 3

Seven agents recounted one register document each in the workflow container, run id
`wf_7f395b29-515`, which is what `FULL_AUDIT_METHOD.md` 4.1 requires above about four agents.
Two agents lost their structured return after writing complete shards. That is reported as a
lost RETURN and not a lost agent, and both shards were verified complete before the
distinction was drawn, because 4.1's whole point is that a marshal must be able to tell a
swept-clean surface from one that never ran.

**TR-059, the most-cited finding of round three, was wrong in both directions at once.** Its
disposition understated the progress, reading OPEN as though no keying had happened three days
after it did. Its note overstated the remaining problem in the present tense, describing work
that had landed. **And the brief's own premise was too optimistic in the other direction**: it
stated `PaytableModal.svelte`'s prose is keyed at HEAD, and it is only partly. Protocol rule
16 says a REPORTED premise says what to CHECK and never what is true; it earned its keep here.

Three of the reviewers' own cited strings survive un-keyed, all inside reviewer 3's ranges:
the `Scatters` table heading, the responsible-play body paragraph, and the `volatility` values.
The row is **narrowed, not closed**.

**The load-bearing finding concerns the gate meant to answer the reviewers.**
`locale_prose_conformance.mjs` is not wired into CI, and **would not have caught any of the
three even if it were**: it detects a LEAK, a rendered string byte-identical to an existing
English keyed value, not an ABSENCE, a literal never keyed at all. Wiring it as the answer to
the reviewers' ask would have shipped false assurance against a requirement it does not test.
The brief forbade wiring it; the recount established why that instruction was right.

## Needing owner attention

1. **The network-hygiene gate does not detect a SUCCESSFUL external request.** `if (rel)` in
   its response handler is a same-origin filter, so an off-origin 200 is exempt from every
   URL-based check it has; it goes red only when an external request FAILS. **Two external
   reviews graded a "no external resource loading" requirement PASS on this gate's output
   file.** Escalated under convention (l.8) as a submission claim, evidence in
   `reports/qa/session6/shards/JOB1_TR111.md` section 5. Deliberately not fixed unattended.
2. **Whether to wire `locale_prose_conformance.mjs`**, given the LEAK versus ABSENCE
   distinction. It also writes into `reports/qa/` without the `evidenceDir` helper, so a plain
   run dirties committed evidence: a live instance of the convention (h.1) class already
   recorded as open work.
3. **A doc currency gate whose findings depend on which OTHER documents exist.** Adding seven
   unrelated shards made two untouched rows begin failing, verified in a pristine worktree at
   each commit. The documents were already correct; the fix matched their form to their
   meaning per `ROLE_HEAD_OF_ENGINEERING.md` section 2, and was explicitly not an allowlist
   entry. **The mechanism is not explained and was deliberately not guessed at.**
4. **Six documents parked with their reading done.** `reports/qa/session6/RESUME.md` carries a
   resume line for each.

## The Plan of Record, graded per rule 15

The plan predicted 20 to 55 corrections at about 1.5k main loop tokens each, so 30k to 83k of
verification inside a 180k JOB 2 allocation, verdict **FITS**.

**The verification arithmetic held; the application arithmetic did not.** Verification was as
cheap as predicted, for the structural reason the plan gave: these are OBSERVATIONS, settled
by opening a file. What the plan under-costed was the main loop cost of APPLYING a correction
to rows running to several thousand characters, plus the marshal itself. It also budgeted
nothing for a CI failure investigation, which cost real context and was the right thing to
spend it on.

The plan named the failure mode correctly in advance: *"if `REVIEW_TRACKER.md` alone returns
more than about 25 corrections, JOB 2's main loop allocation is the line that goes first."*
That is what happened, and the response was the one written down before the fact.

**Grade: right about which constraint would bind, optimistic about how far it would stretch.**
A next brief should assume roughly one document applied per 60k of main loop, not the 25k this
plan implied.

## Verification and safety

- `git status --porcelain` empty at every commit boundary; `git diff --exit-code
  .claude/settings.json` clean before every commit.
- **No locked path written.** `rgsService.ts`, `gameStore.ts` and `games/future_spinner/` were
  read where a claim required it. Eight player-facing error strings found inside
  `rgsService.ts` are recorded and handed forward, not changed.
- **No money-path work**, including no measurement of one.
- **Port 5173 never bound, probed or killed by this session**; the only change is the rule 12
  close, performed by the sanctioned script through its own pidfile. `pkill` never used.
- `node scripts/kit_build.mjs` never run.
- Gates read as text by default. `build_diet_verify.mjs` was executed only after confirming it
  defaults to gitignored scratch; `doc_currency_gate.mjs` confirmed read-only. `git status`
  checked immediately after every gate run.
- One temporary worktree created to test the gate against a pristine HEAD, then removed.
  Nothing deleted; the one scratch directory moved aside was renamed, per 4.2.

## Owner preview, per rule 12

Run from `frontend/` BEFORE this report, so the line is evidence rather than intention:

```
OWNER PREVIEW  |  v10 line, main  |  commit e89065d  |  built 2026-07-31T05:47:00+10:00  |  started 2026-07-30T19:47:20.018Z  |  http://192.168.4.92:5173
```

**The address was curled rather than trusted**, per the rule's own warning that printing a URL
is not evidence it works: `HTTP 200 in 0.042s`, listener pid 52417. The one-commit lag is the
design: the preview is refreshed once more as the last action of the close.

## FOR THE NEXT SESSION

**Model and effort**: Opus 5, unattended, single session on `main` as integrator.

**Approach**: agents did every read; the main loop decided, dispatched and applied small diffs.
Ten agents, about 1.4M agent tokens. The token line was never the constraint and main loop
context always was, exactly as `AGENT_BUDGET_AND_SCHEDULING.md` 4.5 predicts for a session
that marshals and constructs rather than delegating wholesale.

**Alternatives tried and rejected**:

- *Following the brief's literal self-test instruction* to seed an external network request.
  Rejected once the code was traced: the gate does not detect a successful external request, so
  that seed would have gone green and failed its own assertion, or gone red for the wrong
  reason on blocked egress and thereby falsely certified a capability the gate lacks. Seeded
  the pruned-path form instead, which is what the gate actually asserts and what really
  shipped, and escalated the external gap under convention (l.8).
- *Resuming the workflow* after 2 of 7 agents errored. Rejected: both had written complete
  shards, so nothing was missing, and convention (q)'s epoch warning applies since the tree had
  moved underneath the run.
- *Allowlisting the doc currency gate finding.* Rejected explicitly: the baseline's own header
  and `ROLE_HEAD_OF_ENGINEERING.md` section 2 both say that is not a fix.
- *Applying all seven documents.* Rejected at the stop line in favour of parking six with their
  reading done, per the brief's rule that a half-applied document is worse than an untouched
  one.

**Files touched**: `frontend/scripts/build_diet_verify.mjs`, `.github/workflows/checks.yml`,
`docs/records/reviews/REVIEW_TRACKER.md`, `reports/qa/session2_audit/DISPOSITIONS.md`,
`reports/qa/session2_audit/LEDGER.md`, `reports/briefs/FS_RECORD_TRUTH_Prompt.md`, and
everything under `reports/qa/session6/`.

**Open threads**, in the order they should be picked up:

1. The six parked documents. `reports/qa/session6/RESUME.md` has a resume line for each;
   `SUBMISSION_DOSSIER.md` is the highest consequence because it is what a reviewer reads.
2. The three escalations above, which are questions for the owner and Fable rather than work.
3. **The twelve answers owed by the Product Owner**, seven in `reports/FABLE_COMMS.md` entry
   031 and five more in entry 034. Twelve, not seven; entry 034 says so in its own words.
4. The money-display band once those answers arrive, with TR-086 as reviewer 2's named blocker.
   **Untouched by this session by instruction.**
5. TR-111's evidence-currency half, not closed here: the committed capture pack still describes
   an older build than HEAD.
