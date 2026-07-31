# WORK ORDER TEMPLATE

Copy this file, fill every bracket, delete the guidance lines in italics. A brief that
leaves a bracket unfilled is a brief that will be interpreted, and interpretation is where
sessions diverge from what you wanted.

Recorded 2026-07-29 after the stream test recovery, which spent roughly 58 per cent of its
agent budget on two preventable errors, both traceable to things this header would have
forced into the open. Sizing figures come from
`docs/skills/AGENT_BUDGET_AND_SCHEDULING.md`.

Australian English, no em dashes or en dashes.

---

## THE HEADER, which is not optional

*Rule 14 already requires every brief to state the agent scale and tool inventory. These
five lines are how that requirement is met. A brief without them is out of compliance with
the multi-track protocol, and the session cannot budget itself.*

```
BUDGET:   [18.0M] cap over [4.5] hours.
          Reserve [1.8M]. Main loop [2.5M]. Agents [13.7M].

SCALE:    max [40] squads at [120k / 25 artefacts / 30 min] each,
          per docs/skills/AGENT_BUDGET_AND_SCHEDULING.md section 5.
          Compute the VERIFICATION cost at launch, not after:
          total = A x (185,000 + Y x V x 70,000), Y = findings per agent,
          V = 1.0 per finding, 0.075 per cluster, x3 for a panel.

TOOLS:    [workflow container, Playwright with browsers, the gate family,
           the local RGS harness, tesseract, image tooling, web fetch of the
           platform mirror]

STOP LINES: no new waves at [4.0M] left or T minus [60] min.
          no new agents at [2.5M] left or T minus [45] min.
          close at [1.8M] left or T minus [30] min.

DEGRADATION ORDER: if short, deliver in this order: [A], then [B], then [C].
          Anything below [C] is PARKED with resume state, never attempted.

DONE MEANS: [one sentence describing the END STATE, not the activity]
```

*The two key names were `STOP:` and `DEGRADE:` until 2026-07-31. `scripts/qa/brief_preflight.mjs`
requires `STOP LINES:` and `DEGRADATION ORDER:`, so a brief that copied this template FAITHFULLY
failed the gate that exists to check briefs. Both were written by this seat, three days apart,
and neither was run against the other. `FS_MONEY_SERIAL_2_Prompt.md`'s four THIN_HEADER findings
are that mismatch, not a defect in the brief's author.*

*Why DEGRADATION ORDER is the highest-value line here. The stream test's JOB 4 bundled marshal,
verify, fix and park into one all-or-nothing job, so when the allowance ran short it
became mostly nothing. A stated degradation order converts a cliff into a slope, and it
lets the session shed the right work rather than the last work.*

*Why DONE MEANS matters. "Audit the frames" is an activity and can be done forever.
"Every STREAM finding is verified or parked with an owner line" is an end state and can be
finished. Sessions optimise against whatever you give them.*

---

## READ FIRST

*Per convention (i). List the repository documents that carry this brief's context. Name
paths, never descriptions: "the audit method" costs the session a search, and a definite
article pointing at something that does not exist yet costs it a decision it should not be
making.*

- `[path]` [one line on why]
- `[path]` [one line on why]

**Artefacts this brief expects to EXIST and their exact paths:**

- [`reports/qa/<topic>/LEDGER.md`, create if absent]
- [...]

*If the brief says "consolidate to the single ledger" and no ledger exists, the session
invents a path and the next session cannot find it. Name it, and say whether to create it.*

---

## PREMISES, marked as verified or unverified

*The single most expensive line in the stream test brief was "the state of the failed
220MB push". The push had not failed. The session caught it only because a separate clause
said to report what exists before touching anything. State diagnoses as questions.*

| Premise | Status | How the session should check it |
|---|---|---|
| [claim] | **UNVERIFIED** | [command or file to check] |
| [claim] | **VERIFIED**, [source] | no check needed |

---

## THE JOBS

*Number them. Numbered jobs are trackable, reportable and commit-per-job. For each, state
the deliverable as an artefact at a path, not as an activity.*

### JOB [n]: [imperative title]

- **Deliverable**: [file at path, or commit, or a named end state]
- **Agents**: [count] x [class] at [artefacts] artefacts each, or NONE, main loop only
- **Expected cost**: [N x tokens] = [total]
- **Expected duration**: [ceil(N / in_flight) x artefacts x 80s]
- **Depends on**: [job number, or nothing]
- **If short**: [what the reduced version of this job is, or SKIP]

*The Expected cost and duration lines are not bureaucracy. Writing them is the calculation
that would have caught the stream test's 52-frame squads before they were launched rather
than after three of them died.*

---

## THE PLAN OF RECORD, posted before anything expensive is launched

*The session writes this block, once, after reading the brief and before the first wave.
It is the moment the arithmetic can still prevent waste, and it is the only moment.*

```
PLAN OF RECORD
  budget seen        : [X]M, [H] hours
  waves planned      : [n] x [count] agents at [artefacts] artefacts
  discovery cost     : [N x tokens] = [total]
  expected findings  : [count x Y] = [total]
  verification cost  : [findings x V x 70k] = [total]     <- compute this NOW
  fixes and re-proof : [total]
  main loop          : [total]
  TOTAL              : [sum]  against [budget minus reserve]
  VERDICT            : FITS / DOES NOT FIT
  if DOES NOT FIT    : [which DEGRADE tier is dropped, or which policy changes]
```

**This works whether or not anyone is awake.** If the owner is present they can correct it
in one line. If the session is running unattended it applies the DEGRADE order and
proceeds, and the block is written into the session report as a commitment the close is
graded against. Either way the calculation has happened.

*Why this is not overcomplicating it. The stream test recovery would have printed:
discovery 6.7M, expected findings 540, verification 37.8M, total 44M against a 16M budget,
VERDICT DOES NOT FIT. That is one block, visible in ten seconds, and it would have changed
the whole session. It was never computed, so a wave that could not be verified was launched
anyway.*

**Restate one line of it at every wave boundary**, because that is where drift happens:

```
BOUNDARY [n]: spent [X]M of [Y]M, [Z] min to stop line, next wave costs [W]M, GO / DEGRADE
```

**Division of labour, so this stays a one line handshake and not a meeting.** The owner
owns the PRIORITY: the budget, the deadline and the DEGRADE order, because only the owner
knows what actually matters. The session owns the ARITHMETIC: what fits inside it. Do not
have both parties compute the same sum. Two calculations from the same inputs are not
independent corroboration, they share the inputs, which convention (l.4) already warns
about. The owner's check is "is that the right thing to drop first", not "is that
multiplication correct".

---

## MAIN LOOP DISCIPLINE

*How the session keeps its own context alive across four hours. Measured: the stream test
recovery ran nearly four hours, delegated 93 agents, and finished with roughly two thirds
of its context window still free. Nothing was compressed. These five rules are why.*

1. **An agent is a disposable context, and on a long session that is its PRIMARY value.**
   Parallelism is secondary. The stream test's squads ingested about 570,000 tokens of
   frame images; the main loop opened six frames. The reading happened, the reasoning
   happened, and the context was thrown away. **Whenever a job requires INGESTING a lot of
   material, that is an argument for delegation even when you do not need the speed.**

2. **Never read an agent's output in full.** 540 findings across 47 shards were marshalled
   with `grep -c`, `grep -oE` and one `head -40`. The shards were never read into the main
   loop at all. Findings belong on disk, where they are useful, not in context, where they
   are dead weight the session carries to the end.

3. **Bounded reads, always.** `sed -n '205,225p'`, `grep -n`, `head -c 600`, `ls | grep`.
   Reading a whole file is a decision, not a default. One file was read end to end across
   the entire stream test session, and it was 34 lines long.

4. **Write, do not read back.** Large documents go out through Write and do not come back
   in. The tool confirms the write succeeded; re-reading to check spends context to learn
   nothing.

5. **The main loop's job is decide, dispatch, commit.** The moment it starts doing the
   reading itself, the session acquires a ceiling measured in hours. A session that
   manages can run until the budget ends; a session that does the heavy lifting stops when
   its context does, and that is usually far sooner.

*The corollary for planning: context headroom is not a constraint you have to design
around if you delegate properly. Budget in tokens and hours, not in context.*

---

## PRE-FLIGHT, run before EVERY wave

*Three gates. They cost under two minutes combined and would have saved about 9.6M tokens
on the run that produced this template. They are a hard sequence point, not a judgement
call: do not launch wave B while wave A is unchecked.*

- [ ] **Compute.** Artefacts per agent stated and under [25]. Wave cost computed and
      inside remaining budget minus reserve. Wave duration computed and inside time to cap
      minus close reserve.
- [ ] **Checkpoint clause is in the agent prompt.** Every agent writes its durable artefact
      at about 60 per cent of its life, before the expensive tail, with UNKNOWN allowed in
      the fields it has not reached. *Measured effect: three agents lost before this rule,
      zero lost across 36 after it.*
- [ ] **Retry is wrapped, and a lost agent returns LOST rather than nothing.** A squad that
      died silently and a squad that found nothing produce identical output.
- [ ] **Configuration is baked in as a constant, not passed as a parameter.**
- [ ] **SMOKE TEST.** Wait two minutes after launch, then confirm the running agents carry
      the ids you expect. *This one check would have caught a 3.55M error in under two
      minutes.*
- [ ] **Every factual citation checked against the REPOSITORY, not against narration.**
      A tool, file or figure learned from what a session SAID is REPORTED until an `ls` or
      `grep` confirms it. This has now failed twice: a stale compliance line that reached a
      brief as a VERIFIED premise, and a script named in narration that was never
      committed and does not exist. **Both would have died on one command.** Applies to
      the Head of Engineering's own briefs above all, per `WAYS_OF_WORKING.md` 3.1
- [ ] **Can the model physically SEE it?** For any image work, check the source resolution
      before judging. Upscale small viewports first. *A 320x568 frame is about 240 image
      tokens and fine detail is not resolvable in it; a lens that judges it anyway is
      signing coverage it does not have.*

---

## FAILURE DISCIPLINE

*Added because the alternative was observed. A prior session attributed repeated agent
terminations to the user's internet connection, which is unfalsifiable, unowned and was
not the cause.*

- **No failure is explained by anything outside the transcript until the transcript has
  been opened.** Read the dying agent's last records first. The cause is nearly always
  context exhaustion, concurrency limits, or an unarrived parameter, and all three are
  visible in seconds.
- **Convention (l.3) binds here as everywhere**: a claim with no source path and no
  computation does not get written. That includes claims about why something broke.
- **A repeated failure is a design fault, not bad luck.** Retrying into the same wall
  spends the budget twice. Fix the shape, then resume.

---

## CLOSE

*Per conventions (a) and (i), rule 12 and rule 10, in this order. Do not compress it: the
close is what makes the session's work findable by the next one.*

- [ ] Every finding has a disposition, and "minor" is not one of them
- [ ] Surfaces NOT swept are named explicitly
- [ ] Every agent accounted for as COMPLETED or LOST
- [ ] `npm run owner:preview` from `frontend/`, printed line pasted into the report
- [ ] Session report with FOR THE NEXT SESSION, archived copy, both committed
- [ ] Final push's REMOTE CI result CHECKED, not assumed, run link recorded
- [ ] Owner preview run once more as the last action, per the one-commit-lag clause
- [ ] `git status` clean, no committed evidence rewritten

---

## WHAT THIS TEMPLATE IS FOR

A brief written to this shape can be handed to a session that will run unattended for four
and a half hours, and the session will be able to answer, at any moment, three questions it
otherwise cannot: **how much have I got left, what do I drop first, and am I finished.**

The stream test recovery could answer none of them, which is why it produced excellent
discovery and no verification. It was not short of budget. It was short of a budget it
could see.
