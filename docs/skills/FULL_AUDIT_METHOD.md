# THE FULL AUDIT METHOD

**The standard pre-submission analysis for every We Roll Spinners title.** Owner-ordered
2026-07-28, written from the pass that ran it on Future Spinner between 2026-07-27 and
2026-07-28.

Australian English, metric, no em dashes or en dashes.

Cross-referenced from `WRS_MASTER_DOCUMENT.md` section 7b, which owns the ORDER of a next
title. This document owns the CONTENT of one thing that order does not currently name: the
stand-back audit that runs before submission, after the build is complete.

---

## 0. Why this is a separate job from building

**Building a thing and auditing a thing cannot be done at the same time, because mid-build
you are inside the assumptions you are trying to test.**

A title assembled across many sessions accumulates defects no individual session could have
caught, because each session was locally correct. Scaffold defaults that survived. Two
implementations of one concept that drifted apart. A gate printing PASS over a live defect.
Documentation that was true when written. Every one of those is invisible from inside a task
and obvious from outside one.

**The evidence that this pays, from the Future Spinner run**, so the next title's owner can
size the decision rather than take it on faith:

| | Found |
|---|---|
| The build pass (six briefed jobs) | 22 findings |
| **Auditing that pass** | **12 more, one of them a regression the build pass introduced** |

The second number is the argument. The pass that found the emoji, the scaffold browser-tab
title and the mixed French apostrophes felt like the productive one. The pass that CHECKED it
was cheaper and caught things no amount of re-reading would have, including a font fix that
was correct while its own justification was false.

---

## 1. The two layers

An audit has exactly two layers and they must not be collapsed into one.

### 1.1 DISCOVERY: many read-only agents, one lens each

Give each agent ONE class to hunt and a strict output schema. Distinct lenses find distinct
things; five agents with the same brief return the same list five times.

Lenses that repeatedly earned their place:

| Lens | Hunts | Yield on Future Spinner |
|---|---|---|
| **Scaffold residue** | Starter defaults that survived | The Vite package name as the browser tab title |
| **Duplicated concept** | One idea implemented twice and drifted | **The highest-yield lens by far.** Nineteen hardcoded strings, six of them a distribution blocker |
| **Committed versus shipped** | What is in the artefact but not the source | 35 symbol glyphs shipping in `dist`, 31 player-visible |
| **Inventory** | Directory by directory: what is this, does it ship, how is it made, what re-proves it | The whole engine-versus-skin boundary |
| **Document drift** | Every claim in the project's own docs against the code | A submission-facing document denying art it ships |
| **Disposition audit** | Every tracker row: is its stated status true right now | Three rows reading OPEN over their own fix evidence |
| **Harness reconnaissance** | How do I even drive this to see it | Do this BEFORE you need it |

### 1.2 VERIFICATION: one adversarial agent per finding, told to REFUTE

Default to refuted when uncertain. A finding that survives a hostile reading is worth acting
on; one that has only ever been asserted is not.

**A verifier that only ever confirms is not verifying.** On the Future Spinner run one
verifier refuted its finding outright, correctly, **and then found a real defect of the same
class a few lines away that nothing had recorded**. Budget for refutations and read them: the
ground around a false positive is where the true one hides.

---

## 2. The rules that stop an audit producing confident wrong answers

Each exists because breaking it produced one.

### 2.1 Derive before measuring

Go to the specification first, state the closed-form answer, cite the exact `file:line`.
Measurement CONFIRMS; it never discovers.

**The worked example.** Asked whether the icons were inconsistent, the answer came from
reading the shipped font file FIRST: the brand face carries 183 codepoints and does not carry
U+2715, U+2192, U+2605, U+2713 or U+221E. That turned "these look inconsistent", which is
arguable, into "these five characters are absent from the brand face so they fall back per
character, here is the list", which is not. Every fix followed from one measurement taken
before any string was judged.

### 2.2 Verify the FIXES, not the findings, once the tree has moved

**The epoch trap, and it is subtle enough to have nearly shipped.** If you fix findings and
then re-run or resume the verification, the verifiers read a repository where the defects are
gone. "The text is not there" becomes the EXPECTED result of a correct fix, not evidence the
finding was bogus. A verifier prompt written for epoch A returns actively misleading output
against epoch B, and a resume silently concatenates the two epochs into one report.

Either verify before fixing, or rewrite the verifier to ask the four questions that matter
after a fix:

1. **Was it real** at the old HEAD? Quote the old blob.
2. **Is it fixed** now? Quote what is there instead.
3. **Is the fix COMPLETE?** Search the whole tree for the class, not just the file. An
   incomplete sweep is the likeliest failure and the verifier is best placed to catch it.
4. **Did the fix break anything?** A test asserting something untrue, a selector that no
   longer matches, a proof expecting the old glyph.

Add a fifth for maturity: **is the claim written ABOUT it accurate?** Two rows of the Future
Spinner charter were found to overstate their own case by verifiers reading it.

### 2.3 "Read only" does not constrain what a script does

**This one generalises past this studio and it is the least obvious rule here.**

A fan-out of agents under an emphatic read-only instruction rewrote five committed evidence
files. Every agent honoured the instruction: **none used an editing tool.** One RAN A PROJECT
SCRIPT, and the script did the writing.

An instruction constrains the agent's own tools. It does not constrain the side effects of
software the agent invokes, and a mature repository is full of scripts that write:
screenshot harnesses, conformance runners, report generators, anything ending `_proof` or
`_gate`. So the instruction needs a second clause and the audit needs a check:

> Do not run any project script that writes. Reading those scripts as TEXT is encouraged and
> is usually what you actually want. If you must execute one, copy it to a scratch directory
> outside the repository and run it there, and say so in your answer.
> Run `git status --porcelain` at the END of your work and report the result.

Put `tree_clean_after` in the agent's output schema so the check is structural rather than
hoped for. After that clause was added, the next pass came back clean on all four agents,
confirmed independently against the real tree.

**The durable fix is upstream of the prompt: the SCRIPTS should be incapable of dirtying
committed evidence.** Route their output through a scratch-path helper. A prompt is a
request; a path is a guarantee.

### 2.4 Evidence scratch discipline

Committed evidence directories are **write-once outside a job whose brief says it is
regenerating evidence**. Proof and gate scripts write to scratch paths.

Evidence that a casual re-run can overwrite is not evidence. On Future Spinner this was
recorded once after a proof script silently modified four committed PNGs, seven scripts were
migrated to a scratch-path helper, and **two were missed** and later tripped by 2.3 above. If
a project has this convention, check the migration is complete before trusting it.

### 2.5 Self-audit BEFORE reporting

Re-derive each claim, check it against the measurement, and ask **what instrument you used to
establish it**.

**The failure this catches, verbatim from the run.** A scaffold package name was claimed to
be the permanent browser tab title, on the strength of `grep -rn "document.title"` returning
nothing. The framework set the title through `<svelte:head>`, which never mentions
`document.title`. The finding was real; the severity was wrong. **The grep was the wrong
instrument.** When a search returns nothing, ask whether it could have returned something.

**And it happened AGAIN, in the session that wrote this document, which is the strongest
argument for the rule.** Before deleting nine directories, a reference check searched **three
of the nine names** and reported clean. The deletion went ahead. A wider check completing
afterwards found **six developer utilities whose example defaults named the other six**, four
of them executable defaults that would have failed on first run. Nothing shipped was
affected, and the fix was small, but the deletion had been called safe on a search that could
not have found the answer.

**Two rules follow, and the second is the cheap one.** For a DESTRUCTIVE action, enumerate the
full set of names first and search for **every one of them**, not a representative sample. And
**let the slow check finish before acting**, rather than acting on a faster narrower one: the
wide search was already running when the narrow one was used to justify the deletion.

### 2.6 Test your instrument before parking a class

If you cannot fix a class now and intend to PARK it, the park is only honest if its
enumeration is. **Test the instrument against a case you know it should catch, and state the
shapes it cannot see.**

On Future Spinner both the project's own gate and the audit's scanner had the same blind
spot from different directions: neither could see a literal written inside an interpolation.
The resulting parked list called itself "the complete list" and was not.

---

## 3. Two patterns worth reusing by name

### 3.1 The frozen-debt ratchet

When a widened gate finds more than one session can fix, do not weaken the gate and do not
leave main red. **Freeze the existing findings and let the gate go live.**

- Key the freeze by **file AND text**, not text alone, so a new instance elsewhere still
  fails. A bare text allowlist excuses tomorrow's defect.
- **Print the frozen count on every run.** A gate quietly excusing twenty strings reads,
  to anyone scanning CI, exactly like a gate with nothing to excuse.
- Check the list in **both directions**: an entry matching nothing means a fix landed without
  its entry being removed, and a ratchet that can rust is not a ratchet.
- **Burn each entry in the same commit as its fix**, so the count in the log is the count in
  the gate and the list visibly empties: 19, 15, 13, 10, 0.

The both-directions check earned itself immediately: when two frozen entries turned out to be
Svelte block conditions rather than rendered text, **the check went red the moment the gate
stopped reporting them**. Freezing a false positive is worse than missing a real one, because
it makes the debt list lie about its own size.

### 3.2 Seeded self-tests are the price of a gate's PASS

**A gate that has never been seen to fail is not evidence. It is a script that prints PASS.**

Plant the exact defect the gate exists to catch, **in the form it really occurs**, and prove
the gate goes red. Plus negative controls, because a gate that fails on clean input is
useless in a different way.

Three refinements the Future Spinner run paid for:

- **Seed the form that actually shipped.** A seed in a form the gate happens to handle, while
  the real defect occurs in another, teaches nothing.
- **Run the seed through the SHIPPED code path**, not a restatement of one regex. A control
  that reimplements the rule it is checking proves nothing about the rule.
- **Expect the gate's first real run to correct the gate.** Both times it produced false
  positives they were design flaws, not exceptions: test files were being scanned, and the
  canonical money formatter was flagged for doing its job. **Do not allowlist a false
  positive you can fix structurally.**

The strongest form of all: make the seed **the component as it shipped before the fix**. The
win count-up gate renders the same markup with the fix absent and requires the defect to
reproduce, so if it ever stops reproducing the gate fails rather than passing quietly.

---

## 4. Sizing and scheduling

**Convention (r): an audit is sized and scheduled like a job, not squeezed into what is
left.** Measured figures from the Future Spinner run, so the next one is planned:

| | Cost |
|---|---|
| Discovery fan-out, 10 agents | about 1.5M subagent tokens, 23 minutes wall-clock |
| Adversarial verification, 41 agents | about 3.1M subagent tokens |
| **Whole session** including fixes, a new CI gate, three production builds and a 91-frame capture pass | **about one third of a five-hour allowance** |

**Do not start a thorough audit on the last quarter of a budget.** Not because audits are
expensive, but because **a partial audit produces an unverified findings list, which is the
most dangerous artefact a project can generate.**

**Convention (q): a workflow that reports partial failure is RESUMED before anything else is
done.** Completed agents replay from cache; only the failed ones re-run. This is the single
highest-value habit in the method.

The cost of ignoring it was measured rather than imagined. A usage limit killed 28 of 51
agents; all 28 were verifiers and all 10 discovery agents had completed, so the audit was
judged survivable and the session pressed on. It WAS survivable. But **the one over-claim
that reached a committed document was precisely the finding whose verifier had died**, and it
survived six commits. Resume is same-session only, so the decision cannot be deferred.

### 4.1 A mass agent wave runs in the workflow CONTAINER, with per-agent retry. Chat-spawned
squads are for small counts only.

**Added 2026-07-28 by the stream test, and paid for twice in one arc.**

Convention (q) says a partial workflow is resumed. That rule assumes there is something to
resume, and **a chat-spawned fan-out gives you nothing to resume.** Agents launched from the
conversation carry no run id, no persisted script, and no per-agent cache. When the wave dies
the work is gone, and the only recovery is to re-run every agent including the ones that had
already finished.

The stream test measured the difference. Wave 1 (capture) ran in the container and survived.
The Wave 2 discovery fan-out was chat-spawned; the session hit its allowance mid-wave, and
**of the squads deployed, exactly one shard reached disk.** Everything the others had read was
unrecoverable, because there was no cache to replay and no script to resume from. The next
session began by inventorying wreckage rather than by resuming, which is precisely the cost
convention (q) exists to prevent.

So the rule is now structural rather than a matter of care:

- **Any wave of more than about four agents runs through the workflow container.** It persists
  the script, returns a run id, and caches each completed agent, so a partial failure costs
  only the agents that actually failed.
- **Each agent carries its own retry.** Wrap the call so a transient failure is retried a
  small fixed number of times before the squad is given up on. This is the cheap half and it
  is what stops a wave being decided by one flaky call.
- **A lost agent is reported as LOST, never omitted.** This is the half that matters most.
  A squad that dies silently and a squad that swept its surface and found nothing produce the
  same output, which is no output, and the marshal cannot tell them apart. An audit that
  cannot distinguish "clean" from "never ran" is producing a coverage claim it has not earned.
  Return an explicit lost marker and carry it into the index.
- **Chat-spawned agents remain correct for small counts**, where the whole wave can be
  re-issued for less than the cost of authoring a script.

The general form, for any project: **the container is not a performance optimisation, it is
the durability layer.** A fan-out whose intermediate results cannot outlive the conversation
is a fan-out that has to succeed on the first attempt.

### 4.2 A session renames its own regeneratable scratch aside, it does not delete it

**Added 2026-07-28 by the stream test.**

Sessions accumulate regeneratable scratch: preview state, evidence scratch, a stale capture
directory being replaced by a fresh one. The instinct is to `rm` it, and that instinct is
wrong twice over.

- **A delete is irreversible, so the safety layer has to stop and ask.** That interrupt lands
  in the middle of a long autonomous run, which is exactly where it is least useful, and it
  spends an owner's attention on a decision that did not need one.
- **A delete is also the action that section 2.5 warns about**, where a destructive step was
  taken on a reference check that could not have found the answer. The cost of being wrong
  about "this is regeneratable" is total.

**Rename it aside instead.** `mv <path> <path>.superseded-<context>` is reversible, needs no
confirmation because nothing is destroyed, and leaves the evidence in place if the judgement
turns out to have been wrong. The tidy-up is then a separate, cheap, deliberate act rather
than a risk taken mid-flight.

This is the same principle as the frozen-debt ratchet in 3.1 and as convention (h.1): **prefer
the reversible operation, and make the irreversible one a decision somebody takes on purpose.**

---

## 5. The waves, and where this title stands

An audit is not one sweep. It is waves, each sized as its own job.

**Wave 1, COMPLETE for Future Spinner: the machine-tell sweep.** Dash typography, quote
consistency, double spaces, capitalisation drift, decimal and currency formats, orphaned
placeholders, button casing, iconography families, default-font leakage. Recorded in
`docs/QUALITY_CHARTER.md` with a live CI gate.

**Waves 2 to 5, NOT YET RUN for Future Spinner.** Named here as the template's next waves,
and listed at `docs/QUALITY_CHARTER.md` 5.3 so silence is not read as coverage:

| Wave | Why it matters | Status |
|---|---|---|
| **Audio** | Twelve shipped rows, every one model-generated, against a platform page that warns by name about over-reliance on generic AI-generated assets. Loudness consistency between rows, tails, the bed swap heard in context. **A scored axis with zero coverage.** | Never swept |
| **Social-mode capture** | It forces English and swaps the whole vocabulary layer. A distribution target has been BLOCKED on prohibited-term strings once already. | Never captured |
| **Accessibility** | Only the prohibited-terms gate exists. No focus order, no keyboard-only walk, no screen-reader pass, and contrast is gated on one label class rather than all text. Screen-reader text is player-facing text: that lesson already cost 14 mislabelled controls. | Never examined |
| **Animation quality and timing** | One of the three axes reviewers most often deduct on, and nothing gates it. Frame RATE is gated, which is a different question. | Never examined |

**The maths package is deliberately out of scope of this document.** It is locked, and it
wants its own audit pass with its own sanction.

---

## 6. The closing checklist

- [ ] Every finding has a disposition, and "minor" is not one of them
- [ ] Every claim carries a `file:line`, a command, or "not known"
- [ ] Load-bearing agent claims were spot-verified first-hand, and the report says so
- [ ] Every new or changed gate has a seeded self-test in the real defect form, run through
      the shipped path, plus negative controls
- [ ] Self-audit done BEFORE writing up, and any claim it corrected is RECORDED, not erased
- [ ] Surfaces NOT swept are named explicitly
- [ ] Every agent in every wave is accounted for as COMPLETED or LOST, and no squad's silence
      was read as a clean sweep
- [ ] Parked items are enumerated completely enough to need no rediscovery, and the
      instrument that enumerated them was tested
- [ ] `git status` clean, and no committed evidence was rewritten
- [ ] The remote CI result of the final push was CHECKED, not assumed
