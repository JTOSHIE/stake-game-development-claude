# THE PROOF-MECHANISM REGISTER

**JOB 2 of `reports/briefs/FS_SESSION3_REMEDIATION_Prompt.md`.** The 79 requirements with no
proof path, grouped by THE PROOF that would cover them rather than by requirement text.

Australian English, no em dashes or en dashes.

---

## THE ANSWER, and it is the number the session's shape turns on

**21 mechanisms.** Twenty are gates. One is a tracker-row family that is a park correctly
labelled rather than an instrument. Six requirements are genuinely unreachable by any
mechanical proof.

| | Count |
|---|---|
| Requirements with no proof path | **79** |
| Raw mechanisms proposed by 7 disjoint survey squads | 40 |
| After the panel's 8 duplicate-set merges | 36 |
| **After the panel's 20 missed-merge findings applied** | **21** |
| of which real GATES | **20** |
| of which tracker-row families (a park, not an instrument) | 1 |
| Requirements owner-parked as genuinely unreachable | 6 |

**Every one of the 79 appears exactly once**, checked mechanically: 0 missing, 0
double-counted, 0 outside the set. That check earned itself twice, below.

**The hypothesis the brief carried was RIGHT in direction and WRONG in size.** The brief
reported, as a hypothesis to be measured, that the 79 would cluster into far fewer mechanisms,
and pointed at replay as the likely example. Replay is exactly that: **eleven requirements
collapse to one driven session**, the largest single collapse in the set. But the tail does not
behave like the head. **Ten of the 21 mechanisms cover exactly one requirement each**, and no
merge argument reaches them, because they read different artefacts by different methods. So the
79 do collapse, from 40 proposals to 21, and 21 is still three times what the budget buys.

---

## THE VERDICT: DOES NOT FIT, and the arithmetic is what says so

The squads priced their own mechanisms at **2.32M total**, which would fit inside JOB 3's 3.0M
allocation. **That figure should not be believed, and the Plan of Record does not use it.**

**The only measured cost of a seeded gate this project holds is the currency gate**, at
`DOC_CURRENCY_GATE_SPEC.md` section 7: **0.4M** for the checker plus its seeded self-test, plus
**0.3M** for the first real run, its triage and the frozen baseline. **0.7M delivered end to
end**, and that estimate was borne out by the session that built it.

The squads' average is **116,000 per gate**. That is between **3.4x and 6x optimistic** against
the one number this project has actually measured.

| Basis | Cost of all 20 gates | Against 3.0M | Verdict |
|---|---|---|---|
| The squads' own estimates | 2.32M | fits | not believed |
| **The measured floor, 0.4M per gate** | **8.0M** | **2.7x over** | **DOES NOT FIT** |
| The measured full cost, 0.7M per gate | 14.0M | 4.7x over | DOES NOT FIT |

**And the panel's findings say the measured floor is the right basis rather than the optimistic
one.** Across 40 proposals it returned **5 FATAL and 21 NEEDS_REDESIGN**. A mechanism that needs
redesigning before it can be built does not cost its estimate; the redesign is where the money
goes, and the squads costed the build they imagined rather than the one the tree permits.

**So the degradation order decides, exactly as the brief said it would.** Gates are built in
coverage order, highest first, until the allocation is spent. Everything below the line gets an
owner-parked tracker row naming why, which the brief states plainly is a complete answer and
not a failure.

---

## COVERAGE ORDER, which is the build order

Ranked by requirements covered, ties broken by worst severity. `cum` is cumulative coverage of
the 79.

| Rank | Covers | Cum | Worst sev | Id | Mechanism | Kind |
|---|---|---|---|---|---|---|
| 1 | **11** | 11 | STREAM | M01 | replay contract, one driven session | WIRE EXISTING |
| 2 | **8** | 19 | STREAM | M02 | disclaimer and social vocabulary conformance | EXTEND |
| 3 | **8** | 27 | HIGH | M03 | delivery set and kit payload conformance | NEW |
| 4 | 5 | 32 | STREAM | M04 | currency display table conformance | EXTEND |
| 5 | 5 | 37 | HIGH | M05 | money readout and wager bounds, live | EXTEND |
| 6 | 5 | 42 | HIGH | M09 | doc claim predicate annotations | EXTEND, **BLOCKED** |
| 7 | 4 | 46 | STREAM | M07 | shipped asset provenance manifest | NEW |
| 8 | 3 | 49 | HIGH | M08 | paytable and maths parity | EXTEND |
| 9 | 2 | 51 | STREAM | M13 | prohibited content lexicon | EXTEND |
| 10 | 2 | 53 | HIGH | M10 | shipped artefact external origin | EXTEND |
| 11 | 2 | 55 | HIGH | M11 | dependency licence and advisory | NEW |
| 12 | 2 | 57 | HIGH | M12 | entry eligibility clock | NEW |
| 13 | 1 | 58 | HIGH | M14 | prohibited mechanic control inventory | NEW |
| 14 | 1 | 59 | HIGH | M15 | autoplay single confirmed start path | NEW |
| 15 | 1 | 60 | HIGH | M16 | cross-OS and cross-browser matrix | EXTEND |
| 16 | 1 | 61 | HIGH | M19 | submitted version pair binding | EXTEND |
| 17 | 1 | 62 | HIGH | M20 | guidelines 58 clearance | NEW |
| 18 | 1 | 63 | MEDIUM | M17 | books publish cap blocker | EXTEND |
| 19 | 1 | 64 | MEDIUM | M18 | non-zero payout count in evidence | WIRE EXISTING |
| 20 | 1 | 65 | MEDIUM | M21 | relative emitted reference shape | EXTEND |
| n/a | 8 | 73 | MEDIUM | M06 | commercial obligation tracker rows (a park) | TRACKER ROWS |
| n/a | 6 | 79 | HIGH | PARK | genuinely unreachable | OWNER PARKED |

**M09 is BLOCKED and is not built**, whatever its rank. It is a phase 2 widening of the
document currency gate, and **Fable's ruling 5 caps phase 2 at two named documents**. The brief
forbids widening phase 2 without a fresh ruling. Its five requirements are parked with that
reason, and the ruling is requested rather than assumed.

---

## WHAT THE ADVERSARIAL PANEL FOUND, because it changed the answer rather than confirming it

Three shared-nothing seats, one lens each, instructed to refute. All three read the repository
rather than the proposals.

| | Count |
|---|---|
| Duplicate sets, one instrument proposed under several names | 8 |
| **Missed merges across surfaces** | **20** |
| Mechanisms rejected FATAL | 5 |
| Mechanisms rejected NEEDS_REDESIGN | 21 |
| Coverage challenges, a claimed requirement the gate would not detect a break in | 45 |
| Requirements wrongly parked as unreachable | 9 claims |

### The catch that justifies the panel on its own

**REQ-040 was assigned to nothing at all.** Seven squads covered 78 of 79 requirements and no
squad held REQ-040, so it appeared in no `covers` list and in no `unreachable` list. It is
**HIGH severity and player visible**: the max win figure printed in the game rules must equal
the maths package max win, per mode. The duplication seat found it by counting, and named the
consequence precisely: *an unassigned requirement is worse than a parked one, because nothing
records that it was dropped.*

It is folded into M08, where the panel showed it belongs: `bet_level_compliance.py:147,158`
already computes `max_x` per mode from the tracked lookup tables, against
`fsModes.ts:139`'s `FS_MAX_WIN_LABEL`. Same two sides, same host, zero extra instrument.

**And the same check caught two more of mine.** Transcribing the panel's merges into families
by hand dropped **REQ-147 and REQ-190**. The mechanical every-requirement-exactly-once check
found both immediately. Recorded because it is the third time in this session that a count has
caught what reading did not, and because the marshal is the layer
`WAYS_OF_WORKING.md` section 3 says the failures actually live in.

### The five FATAL findings, which are the expensive ones

1. **`finished-build-refusals-wired` (REQ-151, REQ-179).** Both refusals in `kit_build.mjs` are
   structurally incapable of firing inside GitHub Actions. The dirty-tree refusal reads
   `git status --porcelain`, and a CI checkout is a fresh clone and always clean. The
   head-on-remote refusal reads `git branch -r --contains HEAD`, and on a pull request the
   checked-out ref is a synthetic merge commit contained in no remote branch, so the step would
   refuse on **every** pull request regardless of the tree. Wiring it produces a script that
   prints PASS, which is the exact thing convention (p) exists to prevent. **Both requirements
   move to the park.**
2. **`book-event-order-playback` (REQ-132).** The existing script drives `npx vite` DEV and
   depends on two dev-only page hooks, so it cannot run against the shipped bundle. Folded into
   M01, which drives the built bundle.
3. **`submittable-wager-bounds` (REQ-041).** The negative control is wrong by a factor of one
   thousand: `bet_selector_gate.mjs`'s own `ODD_LADDER` tops out at 90,000 units, and
   90,000 x 400 for the SUPER mode is 36,000,000, so the assertion **fails on the host fixture**.
   A gate that cannot be green on a healthy tree cannot go from green to red on a defect.
4. **`small-denomination-ladder-floor` (REQ-124).** It binds the wrong artefact and a green
   result would be false. The ladder the game **offers** is `game_config.py:106` and the
   published `game_metadata.json`; widening the frontend fallback turns the gate green while
   the submitted package still declares a $0.10 floor.
5. **`submitted-version-pair-binding` (REQ-149), on the commit half.** Circular:
   `vite.config.ts` derives the build stamp from `git rev-parse HEAD` at build time, so the
   artefact cannot disagree with itself and the check can never fail.

### The pattern across all five, worth keeping

**Four of the five are gates that could not go red**, each for a different structural reason: a
CI environment that cannot observe the condition, a fixture that is already failing, an
artefact that is not the one the requirement binds, and a value derived from the thing it is
checked against. **None would have been caught by writing a self-test that passes.** They are
caught by asking what makes the gate go RED and then trying to make it, which is convention (p)
read as an engineering instruction rather than as a box to tick.

---

## THE SIX GENUINELY UNREACHABLE, plus two demoted into them

Parked with a reason, per the brief: a requirement no mechanism reaches gets an owner-parked
tracker row stating why a proof is genuinely impossible, **which is a complete answer and is not
a failure.**

| REQ | Sev | Why no mechanical proof exists |
|---|---|---|
| REQ-001 | HIGH | Reviewer inspection of whether the game is "functional, clear, communicative". No artefact could go red. |
| REQ-043 | MEDIUM | The 2-star creativity and originality band. A judgement, not a property. |
| REQ-044 | MEDIUM | Gameplay depth measured by player behaviour, and `terms.md:666` forbids the studio holding the data that would measure it. **The requirement and the privacy clause are in direct tension**, which is itself worth the owner knowing. |
| REQ-156 | MEDIUM | The 1-star average across three independent reviewers. The rating does not exist yet: `STAKE_GUIDELINES_SELF_ASSESSMENT.md:155` records "Not started. Requires Start Approval." |
| REQ-151 | MEDIUM | **Demoted from a mechanism.** CI cannot observe a dirty local tree; see FATAL 1. |
| REQ-179 | MEDIUM | **Demoted from a mechanism.** CI cannot observe the refusal; see FATAL 1. |

The panel checked all six against the tree and confirmed four as correctly parked, saying so
plainly rather than manufacturing objections: *inventing a proxy for any of them would be the
wrongly-solved failure convention (l.6) names.*

---

## MEASURED COST OF THE SURVEY, for the budget model

Nothing in `AGENT_BUDGET_AND_SCHEDULING.md` records what a proof-mechanism survey costs. It
does now.

| | |
|---|---|
| Agents | 10, all COMPLETED, 0 LOST |
| Shape | 7 disjoint survey squads, then a 3-seat adversarial panel over the whole proposed set |
| Subagent tokens | **1,625,500** |
| Tool calls | 454 |
| Wall clock | 32 minutes |
| Planned | 1.25M |
| **Variance** | **plus 30 per cent** |

**Where the variance came from, since that is the useful half.** The panel cost far more than
planned: the three verifier seats spent 631,000 tokens between them against about 400,000
planned, because each was told to read the repository rather than reason from the JSON, and all
three did. The duplication seat alone made 35 tool calls. That was the right instruction and it
bought the REQ-040 catch and all five FATALs, so **the overspend is a purchase rather than a
leak** and the next survey should budget for it rather than trim it.

**A barrier was correct here and is recorded as such**, against the standing default of
pipelining: the panel's main job was finding cross-surface duplicates, which no per-item view
can see. It had to meet the whole proposed set at once.
