
---

# SESSION 2 OF THE AUDIT, 2026-07-29: the requirements register, and 82 requirements with nothing defending them

**Brief:** `reports/briefs/FS_SESSION2_AUDIT_ONE_Prompt.md`, saved verbatim per conventions
(b) and (f). Opus 5, ultra effort, on `main`, container orchestration only, no lock exceptions,
explicit-path commits.

**Head at start** `9496d5b`, clean tree. Australian English, no em dashes or en dashes.

## What ran

**73 agents across four workflow runs. 73 COMPLETED, 0 LOST**, counted from each run's own
usage block, never estimated.

| Run | Agents | Tokens | Per agent | Tool calls | Wall clock |
|---|---|---|---|---|---|
| JOB 1a register | 9 | 876,299 | 97,367 | 94 | 9.6 min |
| JOB 1b compliance walk | 23 | 3,299,104 | 143,439 | 974 | 25.7 min |
| JOBS 2 and 3 census and currency | 18 | 2,299,760 | 127,764 | 701 | 22.5 min |
| Verification, 23 capped seats | 23 | 2,913,181 | 126,660 | 663 | 24.5 min |
| **Total** | **73** | **9,388,344** | | **2,432** | |

## THE DELIVERABLE: a requirements register that did not exist

The brief's central premise was correct. There was no consolidated requirements register in
this repository, and JOB 1b's whole cost scaled from a number nobody had.

**First, the corpus had to be built.** The repository held four PARTIAL captures, 603 prose
lines across 8 files, newest content dated **2026-07-04**. The live docs are reachable from
this machine, but only under a headless browser: a plain fetch returns `Loading...` because the
site is client rendered. **64 pages captured, 64 rendered**, committed at
`docs/stake-engine-live/2026-07-29/`.

Then the count, stated before any squad walked a row:

```
raw requirement rows enumerated : 433   (9 squads, 0 LOST)
  PLATFORM, the authority       : 254
  PROJECT_CLAIM                 : 179
CONSOLIDATED REGISTER           : 232
  ARTEFACT                      : 148
  PROCESS                       :  46
  MATHS   EXCLUDED, locked      :  31
  STUDIO  EXCLUDED, no build    :   7
JOB 1b WALK SET                 : 194   (23 slices, 0 dupes, 0 gaps)
player visible                  : 135
```

**The structural decision, and it was reached only after a first marshal got it wrong.** The
platform docs are the authority; this project's own documents are not. A first marshal tried to
fuse `COMPLIANCE_WATCH.md` and `SUBMISSION_DOSSIER.md` rows into the platform register by text
similarity and returned **zero cross-shard fusions**, which is implausible since those documents
restate platform requirements by construction. Token overlap could not carry it, because a
project document paraphrases in its own vocabulary. Fusing them would have let the project's own
assertion that it complies become evidence that it complies. They are kept separately at
`PROJECT_CLAIMS.md` as claims to be TESTED.

## THE HEADLINE IS THE PROOF COLUMN, NOT THE IMPLEMENTATION COLUMN

All 194 in-scope requirements walked to an implementation path AND a proof path, each **opened
and quoted**. The verdicts account for exactly 194, so coverage is complete rather than asserted.

| Verdict | Count |
|---|---|
| SATISFIED, implementation and a real proof path both quoted | 89 |
| **NO_PROOF**, implemented but nothing would fail if broken | **71** |
| NOT_MET, surface opened and requirement not satisfied | 26 |
| UNKNOWN, honestly unresolved | 7 |
| N_A | 1 |

`proof_kind`: **NONE 65**, CI_GATE 61, EVIDENCE 39, **SCRIPT_UNWIRED 17**, TRACKER_ROW 8.

**82 of 194 requirements have no proof path that would fail if someone broke them** (65 with
nothing at all, 17 defended only by a script not wired into CI). Correct code with nothing
defending it is one careless edit from being incorrect code. This is the single most actionable
number the session produced, and it is a proof-coverage finding rather than a correctness one.

## Verification: 126 clusters, and the panels earned their cost

315 findings from 41 discovery squads, clustered **across all severity tiers before any
severity filter**. 126 clusters verified by 23 capped adversarial seats; every one of the 21
player-visible STREAM clusters read by **three independent seats**.

| Disposition | Clusters |
|---|---|
| UPHELD | 78 |
| **UPHELD, CAUSE UNSOUND** | **27** |
| UPHELD, ENUMERATION INCOMPLETE | 13 |
| STRUCK, refuted | 7 |
| UNRESOLVED | 1 |

- **13 of 21 STREAM panels SPLIT between seats.** `S2-C018` was struck 2 to 1; a single-seat
  verification would have kept it as a live finding. That is the panel paying for itself once,
  measurably.
- **66 NEW findings were found while verifying**, the "ground around a refutation" effect the
  method document predicts.
- The 25-call cap held: median **24** calls, min 18, max 32.

**WHY THE CONFIRMATION RATE IS SO MUCH HIGHER THAN SESSION 1's, and it is not that these squads
were better.** Session 1 measured 5 of 26 clusters, 19 per cent, surviving a hostile read. Here
118 of 126 are upheld. Most findings in this session take the form "this requirement has no
proof path", which is a **checkable fact**; Session 1 was verifying **diagnoses** of visual
defects, which are inferences about cause. **The 27 CONFIRMED_WRONG_CAUSE rows are the control
group that proves it**: they are precisely the findings that did assert a cause, and they failed
at close to Session 1's rate. **A claim-a-path task verifies far better than a
diagnose-a-defect task, and the two should be budgeted and trusted differently.**

## THE METHOD CORRECTION, which contradicts our own method document

`docs/skills/AGENT_BUDGET_AND_SCHEDULING.md` section 4 recommends per-cluster verification as
"the default", on the strength of Session 1 reducing 540 findings to about 40 clusters.

**That 13x reduction came from OVERLAP**: 26 squads read the same 26 frames through different
lenses, so one defect was reported many times and verifying it once settled all of them.

**This session partitioned its 41 squads into DISJOINT scopes by design.** Different
requirements, different directories, different documents. Nothing overlapped, so cross-squad
corroboration is **zero** and 315 findings collapsed to only **311** clusters.

| Policy | Verifiers | Cost |
|---|---|---|
| Per cluster, single vote, as the method recommends | 311 | 29.5M |
| Per cluster, 3-vote on STREAM | 353 | 33.5M |
| **Batched by surface, several clusters per verifier** | **23** | **2.2M** |

Against about 5.0M usable at that moment, the first two **DO NOT FIT**. Caught by computing the
verification cost at launch rather than afterwards, which is exactly what rule 15 exists for.

**So: cluster verification is cheap only when the discovery wave OVERLAPPED. For a partitioned
wave the lever is BATCHING findings per verifier.** Both cut verifier count; they are different
mechanisms and they do not compose. Recommend section 4 be amended.

## Plan of Record, graded

| Line | Planned | Actual | Variance |
|---|---|---|---|
| JOB 1a register | 0.99M | 0.876M | **-12%** |
| JOB 1b walk | 2.53M | 3.299M | **+30%** |
| JOBS 2 and 3 | 1.98M | 2.300M | **+16%** |
| Verification | 2.19M | 2.913M | **+33%** |
| JOB 4 fixes | 0.66M | 0 (main loop) | stop line |
| **Agents** | **8.35M** | **9.388M** | **+12.4%** |

**Reserve intact. Verdict FITS held.** The overruns share one cause and it is a correction to
the sizing equations rather than an orchestration fault.

**MEASURED FIGURES, offered for `AGENT_BUDGET_AND_SCHEDULING.md`.** The brief instructed that
JOBS 1 to 3 are TEXT work and should be priced on the LOOK equation at about 110k per squad.
**That is right for reading and tabulating and wrong for everything else here:**

| Agent shape | Measured | LOOK predicts |
|---|---|---|
| Enumerate: read pages, tabulate rows | **97k** | 110k, good |
| **Claim-a-path: open and quote TWO paths per item** | **143k** | 110k, **30% light** |
| Audit a scope, sample claims against HEAD | **128k** | 110k, 16% light |
| **Capped verifier, 25 calls, batched clusters** | **127k** | 95k, **33% light** |

**The pattern: any instruction to OPEN AND QUOTE behaves like a MEASURE agent, not a LOOK
agent, even when every artefact is text.** The cost is in the corroborating reads, not in the
reading. And the 25-call cap **bounds calls but not spend**: seats held to a median of 24 calls
and still cost 127k against the 95k Session 1 measured.

## Degradation order, and what was NOT done

The brief ordered: compliance sweep first, then file census, then document currency;
verification of each tier before fixes of any tier; below the current tier at a stop line
parked with resume state. **Followed as written.**

The session reached the **no-new-waves stop line (4.0M remaining)** with 9.39M of the 11.0M
agent budget spent. **JOB 4 was therefore done in the main loop without launching agents**,
rather than launched anyway. That is the stop line working.

**Explicitly NOT done, so silence is not read as coverage:**

- **185 MEDIUM and LOW clusters** in census and currency were never verified. Parked with
  resume state at `reports/qa/session2_audit/DISPOSITIONS.md`, including the batching policy and
  the measured cost (about 23 seats, about 2.9M).
- **The 31 MATHS requirements** are excluded per `FULL_AUDIT_METHOD.md` section 5: the maths
  package is locked and wants its own sanctioned pass. Enumerated and captured so that pass does
  not start by re-deriving them.
- **The 66 new findings raised during verification** are recorded in the verifier shards but are
  NOT clustered, tiered or dispositioned.
- Out of scope by the brief and untouched: the stream test ledger's 506 unclustered findings,
  its 7 REOPENED clusters, and MID-01's shared count-up clock.
- The `distribution_optimization.pdf` linked from the docs navigation is a binary and was not
  captured.

## Self-audit before reporting, per convention (l.5)

Re-derived before this report was written, not after:

- **Agent arithmetic re-checked**: 9 + 23 + 18 + 23 = **73**, and 876,299 + 3,299,104 +
  2,299,760 + 2,913,181 = **9,388,344**. **An earlier draft of FABLE_COMMS 024 said "64 agents
  across three workflow runs". Both numbers were wrong and were corrected before the push**,
  which is recorded here rather than quietly fixed.
- **Locked paths untouched**, checked mechanically: `git diff --name-only 9496d5b..HEAD` matches
  no locked path, and nothing under `frontend/src/` or `games/` was modified at all. 194 files
  changed, 192 `.md` plus one `.txt` and one `.json`. `locked_paths_gate.mjs` PASS.
- **No project script ran in any agent.** All 73 shards report `scripts_executed: NONE` and a
  grep across all of them confirms it.
- **Committed evidence not corrupted**, but see the fault below.
- **The coverage claim is structural, not asserted**: 194 walk-set requirements were assigned
  across 23 slices with 0 duplicates and 0 gaps, verified by set comparison, and the 194
  returned verdicts account for exactly 194.

## Three faults of my own, recorded rather than smoothed

**1. My first capture instrument was contaminated, and it nearly produced a platform-wide false
delta.** Reading `document.body.innerText` returned every overlapping page larger by a near
identical **+1020 characters**. That uniformity was the tell: it was the navigation sidebar.
Reading `document.querySelector('main')` returns 872 characters for `general-disclaimer`, **byte
identical to the 2026-07-04 capture**, and eight of ten pages then match on sha256 across two
sessions and two scripts. Had the first instrument been trusted, this report would have claimed
the platform rewrote ten requirement pages and been wrong on all ten.

**2. I committed shards on file APPEARANCE rather than on workflow COMPLETION.** Three committed
shards (D05, D07, D08) showed as modified during verification and all 23 seats correctly
disclaimed them. They were the JOB 3 agents *finishing* shards they had checkpointed at 60 per
cent, after I had committed the 60 per cent version. `AGENT_BUDGET_AND_SCHEDULING.md` 8.3 names
this exactly. Not evidence corruption, but my orchestration error. **Wait for the workflow's own
completion result before staging its shards.**

**3. My own reference scan produced two plausible findings and both died on contact with the
source.** "439 unreferenced files in `frontend/public` and Vite copies `public/` verbatim, so
unused assets ship": refuted, because assets resolve through a runtime-composed `assetBase` the
scan cannot see, and `vite.config.ts` prunes the non-shipping trees. "Two themes point at
directories that do not exist": refuted, both carry `available: false`. Recorded in
`CENSUS_MECHANICAL.md` so the census squads did not re-derive them. **That is the 19-per-cent
diagnosis-soundness figure reproducing itself in the main loop**, and it is the argument for the
open-and-quote rule the squads worked under.

## One load-bearing agent claim, spot-verified first hand

C04 claimed **472 of 472 orphans confirmed**, the largest claim in the session and one that
would drive a large deletion. Its stated mechanism was **wrong**: symbols are loaded by composed
filename at `GameGrid.svelte:116`, which a basename scan cannot see in principle. Its outcome
nonetheless survives on the decisive point: `SYMBOL_BASE` resolves to
`assets/themes/future-spinner/symbols`, and **zero of the 27 live shipping symbols appear in the
candidate list**. The orphaned directory is the separate top-level `public/assets/symbols/`, 30
legacy art-exploration variants. Right answer, wrong reason, and it still went to a panel.

## Needs owner or Fable attention

Filed as `reports/FABLE_COMMS.md` entry **024**, with both items from 023 carried forward rather
than left to lapse.

1. **FOR RULING: the XEC and XSC display contradiction is settled by the platform, in our
   favour.** The `rgs-communication` capture carries both rows as `10.00 SC`, **trailing**, which
   is what we ship under Fable ruling 2 of 2026-07-26. The Discord announcement's leading
   `SC 1,000` is now contradicted by the platform's own current documentation. A third
   independent first-party source. Convention (l.8) leaves a player-money display question with
   the owner and Fable, so nothing was changed unilaterally. **May the contradiction be closed?**
2. **FOR AWARENESS: a new platform limit we had no record of.** No single events file may exceed
   **4.2GB** and no mode may exceed **10,000,000 events**. Compliant with margin, measured:
   largest shipped file **146MB** (about 29x under), every mode **100,000 rows** (100x under).
   3-star Maximum Exposure rose from `$25,000,000` to `$50,000,000`.
3. **The 82 requirements with no proof path** are a programme of work, not a defect list, and
   need an owner decision on appetite before anyone starts building gates.
4. **Still open from 023**: whether 19 per cent diagnosis soundness changes the method (this
   session offers a measured partial answer), and acceptance or amendment of
   `docs/records/WAYS_OF_WORKING.md` sections 6 and 9.

## FOR THE NEXT SESSION

- **Model and effort**: Opus 5, ultra effort. 73 agents across four workflow runs, zero lost.
- **Approach**: verify the brief's premises before spending (this caught a false premise in the
  brief itself); build the corpus before counting it; state the requirement count before sizing
  the walk; compute verification cost at launch and re-plan when it does not fit; cluster across
  all tiers then batch rather than cluster for verification; stop launching agents at the stop
  line and finish JOB 4 in the main loop.
- **Alternatives tried and rejected**: fusing project-document claims into the platform register
  by text similarity (rejected, zero cross-shard fusions and it would let a self-assertion count
  as evidence); per-cluster verification as the method document recommends (rejected on
  arithmetic, 29.5M against 5.0M); splitting the walk into 25 squads including three with one to
  four requirements (rejected, the 15,000-token fixed overhead makes runt agents wasteful, merged
  to 23); launching JOB 4 as an agent wave (rejected, the stop line forbids it and a half-applied
  fix at a stop line is the worst outcome available).
- **Files touched**: 194, all documentation. `reports/briefs/FS_SESSION2_AUDIT_ONE_Prompt.md`;
  `docs/stake-engine-live/2026-07-29/` (66 files); `reports/qa/compliance_register/` (REGISTER,
  PROJECT_CLAIMS, 9 register shards, 23 walk slices, 23 walk shards);
  `reports/qa/session2_audit/` (LEDGER, DISPOSITIONS, 23 verify batches, 23 verify shards);
  `reports/qa/file_census/`; `reports/qa/doc_currency/`; `COMPLIANCE_WATCH.md`;
  `reports/FABLE_COMMS.md`; this report and its archive copy. **No file under `frontend/src/`,
  `games/` or any locked path was modified.**

### What Session 3 picks up, in order

1. **The four never-swept waves**, which are Session 3's named remit: **audio** (twelve shipped
   rows, every one model-generated, against a platform page that warns by name about
   over-reliance on generic AI-generated assets, and a scored axis with zero coverage);
   **social-mode capture** (forces English and swaps the whole vocabulary layer; a distribution
   target has been blocked on prohibited-term strings once already); **accessibility** (no focus
   order, no keyboard-only walk, no screen-reader pass, contrast gated on one label class);
   **animation quality and timing** (one of the three axes reviewers most often deduct on, and
   frame RATE is gated, which is a different question).
2. **Price these on the MEASURE equation, not LOOK.** Audio and animation need probing;
   accessibility needs a driven browser. Use **8,500 per artefact**, and note this session's
   measured correction that any open-and-quote instruction behaves like MEASURE even on text.
3. **The sight gate applies to all four** where an image or a frame is judged: no squad judges
   at a resolution where the defect class is not resolvable.
4. **The 185 parked MEDIUM and LOW clusters**, with resume state and a batching policy already
   written at `reports/qa/session2_audit/DISPOSITIONS.md`. Do not re-run discovery on them.
5. **The 66 new findings raised during verification**, unclustered and untiered, in the verifier
   shards under `reports/qa/session2_audit/verify_shards/`.
6. **The 27 UPHELD-BUT-CAUSE-UNSOUND clusters.** The defects are real and the recorded causes are
   not. **Do not act on the stated cause for any of them.**

### Suggested Session 3 header

```
BUDGET: 14.5M usable, 4.5h. Reserve 1.5M. Main loop 2.0M. Agents 11.0M.
SCALE:  MEASURE equation, 15,000 + artefacts x 8,500. Any open-and-quote
        instruction prices as MEASURE even on text (measured Session 2).
        Verifiers: BATCH 8 clusters per seat, ~127k each. Do not cluster a
        partitioned wave; batching is the lever.
DEGRADE: audio, then accessibility, then animation, then social capture.
        Verification of each tier before fixes of any tier.
DONE MEANS: each of the four gap waves has a swept surface with findings
        tiered, verified and dispositioned, or is explicitly not started.
```
