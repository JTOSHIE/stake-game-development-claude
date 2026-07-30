# WAYS OF WORKING

**How this project is run. One page, deliberately.** Owner's order, 2026-07-29, after the
Session 1 stream close made the shape of it obvious.

This is a hybrid of a normal Scrum and SAFe delivery structure, stripped to what actually
does work here. It is not a framework and it is not aspirational: every rule below is
something that has already either saved a session or cost one.

Australian English, no em dashes or en dashes.

**PRECEDENCE, and it is a condition of this document's acceptance.** Fable accepted this
document on 2026-07-29 on the standing condition that it CROSS-REFERENCES `CLAUDE.md`
rather than duplicating it, and that **any conflict resolves to `CLAUDE.md`**, which
remains the single source of truth for builder conduct. That condition is discharged here
and binds every future edit: if a rule belongs in `CLAUDE.md`, this document points at it
and does not restate it. Where this document and `CLAUDE.md` disagree, `CLAUDE.md` wins
and this document is the one that is wrong.

**CONDITION CONFIRMED DISCHARGED, 2026-07-29, by Session 3 (`reports/briefs/FS_SESSION3_REMEDIATION_Prompt.md`,
JOB 1).** Fable's acceptance was conditional and the condition was checked rather than
assumed: every rule this document cites is checked to be OWNED elsewhere and pointed at
rather than restated, and the precedence line above resolves any conflict to `CLAUDE.md`.
The check found one thing to correct, which is the point of running it: the pointer below
read "rules 1 to 15" and `CLAUDE.md` now carries a rule 16, so the pointer was stale within
the same day it was written. It is corrected below and the correction is recorded rather
than made silently, because a cross-reference that quietly drifts is the failure this
condition exists to prevent.

Rules cited here and OWNED elsewhere, so nobody edits the copy instead of the original:
protocol rules 1 to 16 and conventions (a) to (r) live in `CLAUDE.md`; the cost model lives
in `docs/skills/AGENT_BUDGET_AND_SCHEDULING.md`; audit method lives in
`docs/skills/FULL_AUDIT_METHOD.md`. **This document owns only the role split, the three
ceremonies, Definition of Ready and Done, and the transcription step.** Everything else in
it is a pointer.

Companion documents. This one owns WHO does what and WHEN.
`docs/skills/AGENT_BUDGET_AND_SCHEDULING.md` owns what it costs.
`docs/skills/FULL_AUDIT_METHOD.md` owns how an audit is done.
`reports/briefs/_TEMPLATE.md` is the work order shape.

---

## 1. The roles

Four, not five. The Technical Lead and System Architect box is collapsed into Head of
Engineering, because in this setup both are the same actor and a handoff with nobody on
either side of it is where information dies.

| Role | Who | Owns |
|---|---|---|
| **Business Owner and Scrum Master** (hybrid) | The owner | Priority, budget, the degradation order, acceptance of the whole. Removes impediments. Decides what gets dropped first. |
| **Product Owner** | Fable | Requirements, rulings, business and quality acceptance. **Read-only against this repository**, which has a consequence: see section 6. |
| **Head of Engineering and Delivery** | The session (Claude) | Sizing and arithmetic, orchestration, the developer-readiness of every instruction, verification and marshalling, review before anything goes back to the Product Owner. |
| **The fleet** | Subagents | Execution. Discovery squads, verifier panels, fix agents. |

**The division that matters most, already standing as protocol rule 15:** priority belongs
to the owner, arithmetic belongs to the session. They do not compute the same sum. Two
calculations from shared inputs are not independent corroboration, they share the inputs.
The owner's check is whether the right thing is being dropped first, never whether the
multiplication is correct.

---

## 2. The one place this is NOT Scrum, and it changes everything downstream

**The development team is not a team. It is a fleet with no memory.**

In Scrum, developers persist. They accumulate context, learn the codebase and get faster,
so investment in the team compounds. **Here every agent starts at zero, every time.** There
is no tribal knowledge, nobody to ask, and the onboarding cost is paid on every single
agent (about 15,000 tokens of fixed overhead each).

The consequence is the single most useful thing in this document:

> **The documentation IS the team's competence.** `CLAUDE.md`, the method documents,
> `KNOWN_OPEN.md`, the cluster maps and above all the squad preamble are not notes about
> the work. They are the developers' skill, loaded fresh each time.

When 28 squads ran with zero losses, that was not because the agents were good. It was
because the preamble was. So **Definition of Ready is not hygiene here, it is the delivery
mechanism**, and it is where nearly all of the Scrum Master's leverage sits.

---

## 3. Where the failure point actually is

Worth stating plainly, because it decides where process attention should point.

Across the whole stream test arc, **80 of 80 agents completed in the final runs, zero
lost.** Every significant failure was in the coordinating layer:

- squads sized at 52 frames, which exhausted their context and lost three agents
- a parameter that silently did not arrive, running three duplicate waves
- grep clustering that counted a signed retraction as a corroboration
- a UTC date that resolved to the very directory it was written to protect

A Scrum Master normally aims impediment removal at the team. **Here it aims at the lead.**
The Plan of Record and the Product Owner's rulings are checks on the Head of Engineering,
not on the fleet, and they should be read that way. Be suspicious when the session says
something is fine without showing the arithmetic.

### 3.1 The Head of Engineering's own provenance rule, earned twice

Fable's PREMISE PROVENANCE rule binds every brief. It binds the briefs the Head of
Engineering WRITES most of all, and the pattern is recorded because it has now happened
twice with the same shape:

- **The payments line.** A stale claim in `COMPLIANCE_WATCH.md` was read, treated as
  evidence, and written into a work order as an instruction.
- **A script named in a session's NARRATION** was cited in the next brief as the tool that
  had done the work. It had been written to scratch and never committed, so it does not
  exist. The currency gate found it in the brief that commissioned the currency gate. The
  name is left unbackticked here on purpose, because a backticked dead filename in a live
  document is itself a gate finding, which is the blind spot recorded below:

```
the script:  census.mjs   (never committed, exists nowhere in the tree)
```

  **That is not evasion, it is the form matching the meaning.** A fenced illustrative
  example is exactly what the gate excludes and exactly what this is. **But note the wider
  problem it exposes**, because it is not confined to this paragraph: any live document that
  REPORTS a dead reference trips the DEAD_PATH class, since the gate checks whether a cited
  path exists and never what the surrounding sentence says about it. Ledgers, dispositions
  and the review tracker are full of exactly that shape. A negation-aware check (treating
  "does not exist", "was deleted", "no longer exists" as a report of absence rather than a
  claim of presence) is the structural fix and is recorded as follow-up rather than bolted
  on at the end of a window.

**The common cause is not carelessness, it is a category error: treating what a session
SAID as equivalent to what the repository HOLDS.** A session's narration is REPORTED. Only
the repository is VERIFIED.

So the standing rule for this role: **every factual citation in a brief is checked against
the repository before the brief is issued, and a citation that came from narration rather
than from a file is REPORTED until checked.** The check is a `ls` or a `grep`. It costs
seconds. Both failures above would have died on one command.

The corollary for the owner, and it saves effort: **do not paste session narration for the
Head of Engineering to work from.** The artefacts are in git and git is authoritative. If
something important exists only in narration and not in a commit, that absence is itself
the finding.

### 3.2 The pre-flight, because the Head of Engineering had no gate on its own output

Every other actor in this system is gated. Sessions have CI, seeded self-tests, a currency
gate and adversarial verifiers. **The Head of Engineering had its own diligence, and its own
diligence failed four times in one arc.**

`scripts/qa/brief_preflight.mjs` closes that. It runs on a DRAFT brief before it is issued,
never on a committed one, because convention (f) means a brief cannot be corrected after the
fact. **A document that can never be fixed afterwards is the one that most needs checking
before it lands**, and the exclusion that created the gap was written by the same role it
now guards.

```
node scripts/qa/brief_preflight.mjs <draft.md>
```

**This is a required step, not a courtesy.** A brief goes out only after it passes, or after
each finding is answered in writing. It is seeded with the four real failures per convention
(p), and it found a fifth in a real brief on its first run.

**What it cannot check, so nobody mistakes a PASS for a warrant:** whether the prose around a
citation is true, whether a judgement is sound, and whether the PLAN is any good. It checks
facts. **The strategy is still the owner's to judge and the Product Owner's to accept.**

---

## 4. The three ceremonies

One session is one sprint. The allowance window enforces the boundary, so no separate
cadence is needed.

| Ceremony | What it is | Why it survives |
|---|---|---|
| **Planning** | The work order, then the session's Plan of Record posted back before its first expensive spend | The only moment arithmetic can still prevent waste |
| **Boundary check** | A one line spend and clock report at each wave boundary | Batch A's number is what parked the JOB 4 fix batch instead of overrunning |
| **Review and retrospective** | The session report, plus any method amendment it earned | Every convention this project has came out of one |

**Deliberately not held:** stand-ups (boundary reports cover it), refinement as a separate
event (that is the brief), estimation poker (there are equations), velocity ceremonies
(the meter is the burndown).

---

## 5. Definition of Ready, and Definition of Done

### Ready, owned by the Business Owner, drafted with the Head of Engineering

- [ ] Budget header present: budget, scale, tool inventory, stop lines, degradation order
- [ ] **DONE MEANS stated as an END STATE, not an activity.** "Audit the frames" can run
      forever; "every STREAM cluster dispositioned" can be finished
- [ ] Degradation order stated, so a short session sheds the right work rather than the last
- [ ] Every path the brief names either exists, or the brief says to create it
- [ ] Premises marked VERIFIED or UNVERIFIED. A diagnosis stated as a fact costs real time
- [ ] No external document is cited that is not physically in the repository, per
      convention (m)

**On buffers, decided 2026-07-29.** Hold the reserve, drop the estimate haircut. The
project previously carried both a 10 per cent reserve and a proposed 10 per cent reduction
in the planning numbers. That prices the same risk twice, and the haircut is the weaker
instrument because it is a guess while the reserve is an enforced stop line. Plan against
real numbers. **The meter is the burndown and it is authoritative over any derived
figure**, including the session's own: Session 1's internal accounting was pessimistic
enough to have parked deliverable work that the meter showed was affordable.

### Done, owned by the Head of Engineering, accepted by the Product Owner

- [ ] Every finding has a disposition, and "minor" is not one of them
- [ ] Every claim carries a `file:line`, a frame path, a command, or "not known"
- [ ] Surfaces NOT swept are named explicitly
- [ ] Every agent accounted for as COMPLETED or LOST, never omitted
- [ ] Any changed gate has a seeded self-test in the real defect form, proven to go red
- [ ] Fixes re-proven from FRESHLY captured evidence, never from the old ledger
- [ ] Remote CI result CHECKED, not assumed, with the run link recorded
- [ ] `git status` clean, no committed evidence rewritten

---

## 6. The transcription step, which is load-bearing and easy to miss

**The Product Owner is read-only by design.** Fable fetches files and rules; it never
writes. So unusually, **the Product Owner cannot write to the backlog**, and a ruling only
enters the record when a session transcribes it.

If nobody transcribes, rulings evaporate. This has already happened once: a session
correctly reported "no ruling exists in the repository" while four rulings existed, because
the mechanism was undocumented rather than because the input was missing.

**So the transcription is a required step of the flow, not an afterthought:**

1. Decision questions batch into one numbered `reports/FABLE_COMMS.md` entry
2. The owner takes it to Fable and returns the rulings
3. **The session transcribes them into `FABLE_COMMS.md` with attribution and date, updates
   the affected tracker rows to RULED, and applies anything the ruling changes**
4. Where the session receives only a summary and not the longhand, **it transcribes what it
   was given and says so.** Convention (l.7) forbids paraphrasing an authority's text; it
   equally forbids composing one

---

## 7. The flow

```
OWNER      priority, budget, degradation order
   |
HEAD OF ENG  size it, make the brief developer-ready, post the Plan of Record
   |
FLEET        execute                        <-- boundary checks
   |
HEAD OF ENG  verify, marshal, REVIEW BEFORE IT GOES UP
   |
FABLE        rule and accept
   |
HEAD OF ENG  transcribe rulings into the repository
   |
HEAD OF ENG  retrospective into the method documents
```

**Verification is a PASS, not a role.** QA cannot be a separate person here, but the agents
that verify a finding must be different from the agents that found it, shared-nothing and
instructed to refute. That separation is what produced the value: of 26 clusters, 16
returned a real symptom on an unsound cause and one was refuted outright.

---

## 8. The measures

Four, all computed from real runs rather than invented for this document.

| Measure | What it tells you | Session 1 |
|---|---|---|
| **Agent completion rate** | Is the orchestration sound | **80 of 80, 100 per cent** |
| **Waste ratio**, tokens producing nothing | Was anything done twice | **about 0 per cent** (the prior session: 58 per cent) |
| **Plan variance** against the Plan of Record | Is the sizing honest | **plus 3.8 per cent on agents** |
| **Diagnosis soundness**, clusters whose cause survived a hostile read | Is the output actually actionable | **5 of 26, 19 per cent** |

The last one is the uncomfortable and most useful figure, and it is the argument for
keeping verification mandatory. Finding a defect is cheap and mostly reliable; explaining
it correctly is neither.

---

## 9. What was deliberately stripped out, and why

Recorded so nobody re-adds it in good faith.

| Left out | Because |
|---|---|
| Stand-ups | Boundary reports already carry spend, clock and next gate |
| Separate Technical Lead / Architect | Same actor as Head of Engineering. The box only adds a handoff |
| Sprint refinement as an event | The work order is the refined item |
| Story points and estimation | There are measured equations. Points would be a worse instrument |
| Velocity tracking | The meter is the burndown, in real units, live |
| A persistent QA role | QA is a mandatory pass by different agents, not a person |
| A 10 per cent planning haircut | The reserve already prices that risk, and it is enforced rather than assumed |
