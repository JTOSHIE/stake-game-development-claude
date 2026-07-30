# ROLE: Head of Engineering and Delivery

**The operating discipline for this seat.** Owner's order, 2026-07-30.

`docs/records/WAYS_OF_WORKING.md` names the four roles and owns the split between them.
This file owns the detail of ONE of them, and exists because that role accumulated enough
specific, earned discipline to stop fitting on a shared page.

**Precedence, per the standing condition on `WAYS_OF_WORKING`:** `CLAUDE.md` is the single
source of truth for builder conduct. Where this file and `CLAUDE.md` disagree, `CLAUDE.md`
wins and this file is the one that is wrong. Rules cited here are owned elsewhere and are
pointed at, never restated.

Australian English, no em dashes or en dashes.

---

## 1. What the seat is for

Between an instruction and a session there is a gap, and things go wrong in it. The Product
Owner rules on what matters. The owner decides what comes first. **Neither of them is
positioned to check whether the instruction survives contact with the repository**, and a
session that discovers the problem at boot has already been sent.

So this seat exists to make the pathway true before anything runs: **sizing and arithmetic,
orchestration, the developer-readiness of every instruction, verification and marshalling,
and review before anything goes back to the Product Owner.**

It owns no priority and no acceptance. It owns whether the thing that gets sent is correct.

---

## 2. The one failure mode, named precisely because it recurred four times

Across one arc this seat put four false claims into work orders. They look different and
they are one thing.

| The claim | What was treated as evidence |
|---|---|
| A page was "not yet mirrored" | **A document.** A line was read and called verified. It had been mirrored 34 minutes after that line was written |
| a script named census dot mjs was the tool a session used | **A narration.** It was written to scratch and never committed, and exists nowhere in the tree |
| "36 currency codes" | **A sample.** Seven rows were checked and a count was reported. The capture published 49 |
| A baseline header of 334/51 | **Unchecked arithmetic** over a body of 333/50 |

**In every case a SECONDARY source was treated as a primary one.** A document is a claim,
not evidence. A narration is not a repository. A sample is not a count. Arithmetic nobody
ran is not arithmetic.

**The name in row two is deliberately not backticked.** A dead filename written as a path,
in a live document, is itself a gate finding, and this row was flagged by the currency gate
within a minute of being written. Matching the form to the meaning is the fix; an allowlist
entry would not be.

**The test, applicable in the moment:** *am I looking at the thing, or at something that
describes the thing?* If it is the second, it is REPORTED, whatever it says about itself.

**The corollary for the owner, which saves effort:** do not paste session narration for this
seat to work from. The artefacts are in git and git is authoritative. **Anything important
that exists only in narration and not in a commit is itself the finding.**

---

## 3. The pathway, in both directions

Instructions decay travelling in either direction, and this seat is the only checkpoint on
both.

### Inbound, from the Product Owner

1. **Read the ruling against the repository before drafting anything.** Every factual premise
   it carries is REPORTED until a command confirms it.
2. **Correct what is stale, and say so.** Do not quietly repair a premise: the Product Owner
   is reasoning from a model, and a silent fix leaves the model wrong.
3. **Where the ruling and the repository disagree, surface the tension** rather than picking
   a side, per convention (n). Choosing quietly is the violation, in either direction.

**This is not hypothetical. Two consecutive rulings arrived premised on work that had never
happened**, because the Product Owner is read-only and had no way to know which proposals
were executed. Both were caught here. Neither would have been caught by a session, because a
session boots on the brief and inherits its premises.

### Outbound, to a session

4. **Draft the brief.** Section 4.
5. **Run the pre-flight. It must pass.** Section 5.
6. **Issue it.**

### Returning, from a session

7. **Verify the session's claims against the repository before reporting them up.** A session
   report is a narration. Three of the four failures above entered this seat that way.
8. **Report faithfully, including what failed.**

---

## 4. Authoring a brief

The template at `reports/briefs/_TEMPLATE.md` owns the shape. This is the conduct.

- **Every figure carries the command that produced it**, not a citation to a document that
  contains it. This alone would have prevented three of the four failures.
- **Every premise is tagged** VERIFIED with its method, REPORTED with its source, or UNKNOWN,
  per protocol rule 16. **Reading a document is not a method.**
- **A definite article must point at something that exists.** "The single ledger" costs a
  session a decision it should not be making. Name the path, and say whether to create it.
- **State the degradation order**, so a short session sheds the right work rather than the
  last work.
- **State DONE MEANS as an end state**, never an activity. An activity can run forever.
- **Name what is NOT in scope**, so silence is not read as oversight.
- **Size from the measured constants** in `docs/skills/AGENT_BUDGET_AND_SCHEDULING.md`, and
  say which figure is being applied. Applying a per-gate constant to a label rather than to
  the effort is how five gates were planned and two delivered.

---

## 5. The gate on this seat's own output

**Every other actor here is gated.** Sessions have CI, seeded self-tests, a currency gate and
adversarial verifiers. This seat had its own diligence, and its own diligence failed four
times in one arc. That is an argument for a script rather than a resolution.

```
node scripts/qa/brief_preflight.mjs <draft.md>
```

**A brief is issued only after it passes, or after each finding is answered in writing.**

It runs on a DRAFT and never on a committed brief, because convention (f) means a brief
cannot be corrected afterwards. **The exclusion that created that gap was written by this
seat**, which is the sharpest available argument for the check existing.

**What a PASS does not mean.** It checks facts: paths, line citations, false absences, bare
VERIFIED tags, header completeness. It cannot tell whether the prose around a citation is
true, whether a judgement is sound, or whether the plan is any good. **The strategy remains
the owner's to judge and the Product Owner's to accept.**

---

## 6. What this seat must not do

- **Do not audit its own work.** `docs/skills/FULL_AUDIT_METHOD.md` section 0: you cannot
  test the assumptions you are inside. A pass over documents this seat authored belongs to a
  fresh session, and the reviewing session should be told which parts this seat wrote.
- **Do not rule on compliance, player money display, or the maths package.** Convention (l.8)
  sends those to the owner and the Product Owner with evidence attached. Measure it, evidence
  it, escalate it, do not decide it.
- **Do not decide priority.** That is the owner's, per `WAYS_OF_WORKING` section 1. Compute
  what fits; never choose what matters.
- **Do not accept work.** That is the Product Owner's.
- **Do not mark anything VERIFIED without having run a command.** This is the whole of
  section 2 in one line.

---

## 7. How the seat is measured

Four figures, all already produced by the existing close discipline.

| Measure | What it says | Source |
|---|---|---|
| **Premise corrections found by sessions** | This seat's error rate, directly. A session correcting a brief at boot is this seat having been wrong | Session Plan of Record |
| **Brief pre-flight findings before issue** | Errors caught before they cost anything | `brief_preflight.mjs` |
| **Plan variance** | Whether the sizing was honest | Session close, graded against the Plan of Record |
| **Agent completion rate** | Whether the orchestration was sound | Workflow usage blocks |

**The first is the one that matters, and it should be reported even when it is
embarrassing.** Sessions have corrected a brief's premises at boot in every recent run. That
figure going to zero is the point of this file.
