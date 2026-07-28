# Session Report - SESSION 1, THE STREAM CLOSE: SIGHT GATE, CLUSTERS AND PANELS (2026-07-29)

Briefs saved verbatim: `reports/briefs/FS_SESSION1_STREAM_CLOSE_Prompt.md` and
`reports/briefs/FS_SESSION1_ADDENDUM_Prompt.md`. Branch `main`, sole writer, container
orchestration only, no lock exceptions, explicit paths. First work order drafted against
`reports/briefs/_TEMPLATE.md`.

## Graded against the Plan of Record, per rule 15

| Line | Planned | Actual |
|---|---|---|
| JOB 1 sight gate | 2.70M, 20 shards | **6.50M**, 28 squads, 20 shards' coverage |
| JOB 2 marshal | 0.30M | ~0.15M |
| JOB 3 verification | 4.60M | **4.92M**, 52 verifiers |
| JOB 4 fix batch | 1.66M | **0.00M, PARKED** |
| JOB 5 close | 0.40M | ~0.40M |
| **Agents** | **11.0M** | **11.42M**, 3.8 per cent over |
| **Total** | 14.5M usable | **~12.4M**, reserve untouched |
| Agents run | ~90 | **80, zero lost** |

**The plan was badly wrong about JOB 1 and the session still closed inside budget.** JOB 1
came in 77 per cent over its estimate. The stop lines and the degradation order absorbed
it: JOB 3 ran in two batches with a spend check between them, and JOB 4 was parked when
the no-new-agents line was crossed at 2.5M remaining. That is rule 15 working as intended
on its first outing, and it is the argument for the rule.

## The three corrections made at intake, before spending

1. **No Fable ruling existed in the repository.** Resolved by the addendum, which also
   supplied the reason: **Fable operates READ-ONLY by design and rulings enter the record
   solely by a session transcribing them.** Entry 022 was not unanswered, it was unwritten.
   The previous session named it a missing input under convention (m); the input was not
   missing, the mechanism was undocumented. It is documented now, in `FABLE_COMMS` 022 and
   here, so comms silence is never again read as absence.
2. **The brief's "six mobile squads" undercounted; there are fifteen.** The error
   originated in this builder's own prior handover and was inherited by the brief.
3. **popout-s is the frame set worst affected by the sight gate and is not a mobile
   session.** 90,000 pixels against mobile-s at 181,760 and desktop at 810,000. The re-run
   was widened to twenty shards on that evidence, with popout-l and mobile-l left at about
   470 image tokens and that stated rather than silent.

## JOB 1: the sight gate justified itself twice over

28 squads, 499 frames at 1600px, zero lost. 261 findings, **172 of them NEW AT 1600PX**:
two thirds of the wave was invisible at thumbnail scale on frames an earlier pass had
signed coverage over.

**The reconciliation was the other half, and it is why the re-run was not only additive.**
249 CONFIRMED, 96 REFINED, 42 REFUTED. Three refutations would each have cost real work: a
signed absence that did not survive (a two native pixel overrun under the spin control), a
"two font families" claim that was simply wrong (there is one, Orbitron), and a finding
that was UNDER-rated rather than over-rated (Chrome's own `-webkit-focus-ring-color` at
`app.css:160-162`, stock browser blue on a cyan and magenta game, sitting on the
last-touched control through spin, win and COLLECT).

## JOB 3: 52 adversarial seats over 26 clusters

CONFIRMED 5, PARTIAL 16, **REFUTED 1**, SPLIT 4, REOPENED 7. Zero verifiers lost.

**C-20 was refuted outright by both seats and is CLOSED as not a defect**: a
STREAM-severity claim about the balance readout, removed before anyone acted on it.

**Sixteen of twenty six returned PARTIAL: the defects are real, the DIAGNOSES are mostly
wrong.** C-01 is the worked example. Twelve squads saw the reel window go transparent and
it is real and worse than measured. But instance A explained why the hole is see-through
without asking why there is a hole (the cause is `DROP_H = 520` at `GameGrid.svelte:499`,
leaving 76 per cent of the reel window bare by construction on every drop); instance B's
cause is refuted by the source **and its proposed fix is a no-op**; and instance A's fix
converts a see-through band into a dead-black one.

## The self-caught error: six of twenty six clusters carried a marshalling fault

**All six are mine, from the JOB 2 grep-level clustering, and the panels found every one.**
Two clusters fused unrelated defects that grep matched on shared words; one counted two
squads reading a single image as two instances; one **counted a signed `WITHDRAWN DRAFT
CLAIM` as a corroboration**, so one squad reporting and one squad denying was recorded as
two squads agreeing; and two had genuine corroboration **hidden** because clustering ran
one severity tier at a time and squads tier independently.

That last pair is a method fault rather than a slip, and it is now recorded at
`docs/skills/AGENT_BUDGET_AND_SCHEDULING.md` 4.4 with the fix: **cluster across all tiers
first, filter by severity afterwards.** Fable's RULING 2 safeguards caught this at a rate
of 23 per cent of clusters, which is the whole argument for attaching them.

## Why no fix was applied, stated as a decision rather than a shortfall

**Sixteen clusters returned PARTIAL.** Applying the shards' proposals would have shipped a
no-op, a fix that converts one visible defect into another, and one that **does not
compile** (C-12's key cannot be staged ahead of its copy, because `ProseStrings` is a total
`Record` and every locale object fails typecheck the moment the key enters the union).
**The most valuable thing this pass did was stop those from being applied.**

MID-01, MID-02 and TR-104's remaining half were verified first-hand rather than by panel
and remain fix-ready and unaffected. They are parked with resume state per the degradation
order, not abandoned.

## Two calibration lessons, both measured

- **4.3, the MEASURE multiplier.** An agent told to measure costs about 1.8x one told to
  look, because measuring needs more tool calls, not because measuring is dear. Verification
  is inherently a measure task. **A call cap cost nothing in quality**: capped verifiers ran
  at 95k and 17.6 calls, against 232k uncapped, and still overturned six clusters.
- **4.4, grep clustering is provisional.** Its corroboration counts are a hypothesis, not
  evidence, and should be labelled as one.

## Rule 12, the owner preview

Refreshed after this report's own commit, because the report edit necessarily dirties the
tree and the script correctly refuses a dirty checkout. The printed line is recorded in
the rule 10 closing below, and the preview is run once more as the last action of the
close per the one-commit-lag clause.

## FOR THE NEXT SESSION: Session 2's parameters

**Fable's map was named in the brief but does not exist in the repository.** Per convention
(m) it is named as missing rather than reconstructed. The parameters below are this
session's own handover and should be read as such until the map lands.

- **Model and effort used**: Opus 5, ultra effort. 80 agents across three workflow runs,
  zero lost.
- **Approach**: intake corrections before spending; sight gate re-run first per the
  degradation order; grep-level marshal; two-batch verification with a spend check between
  batches; park rather than rush the fix batch at the stop line.
- **Alternatives tried and rejected**: halves rather than thirds for the re-run squads
  (rejected, 26 upscaled frames is 48k of image context, between the 28k that survived and
  the 71k that killed three agents last session); running both verification batches at once
  (rejected, the spend check between them is what kept JOB 4's parking a decision rather
  than an overrun); applying the three pre-verified fixes anyway (rejected, the degradation
  order puts them below verification and a half-applied fix at a stop line is the worst
  outcome available).
- **Files touched**: the two briefs, `reports/FABLE_COMMS.md`,
  `docs/records/reviews/REVIEW_TRACKER.md` (TR-116, TR-117), `CLAUDE.md` (rule 15),
  `WRS_MASTER_DOCUMENT.md` (3e mirror), `reports/qa/stream_test/` (LEDGER, CLUSTERS,
  SHARD_INDEX, 28 new shards, 20 superseded moved aside),
  `docs/skills/AGENT_BUDGET_AND_SCHEDULING.md` (4.3, 4.4), this report and its archive.
  **No file under `frontend/src/`, `games/future_spinner/` or any locked path was
  modified.**

### What Session 2 picks up, in order

1. **The seven REOPENED clusters** (C-03, C-10, C-11, C-14, C-23, C-25, C-26). Six carry a
   known marshalling fault with the fault named; re-cluster those correctly rather than
   re-verifying them as they stand. **Re-cluster across ALL severity tiers first**, per
   4.4, because two of the seven exist only because the tier filter hid their corroboration.
2. **The fix batch, with C-01's corrected diagnosis.** The sound fix is `GameGrid.svelte:499`
   `DROP_H` to at most 208, or widen `STRIP`, with an opaque `.symbol-col` fill as backstop.
   Note before touching it: at 0.88 alpha (`:1259`) even a fully painted board passes 12 per
   cent of the scene through every cell, so an opaque fill changes the look and that is an
   art call.
3. **MID-01, MID-02 and TR-104's remaining half**, all fix-ready, all verified first-hand,
   all one line or close to it. MID-01 is RULED: one shared count-up source, frame-level
   equality asserted, seeded per convention (p).
4. **C-12's fix must land key and copy together.** It cannot be staged.
5. **The HIGH, MEDIUM and LOW tiers**: 183, 242 and 81 findings, unclustered and unverified.
   Budget them on the measure equation, not the look one.
6. **The remaining audit waves**, never swept: audio, social-mode capture, accessibility,
   animation timing.

### Suggested Session 2 header

```
BUDGET: 14.5M usable, 4.2h. Reserve 1.5M. Main loop 2.0M. Agents 11.0M.
SCALE:  re-cluster across ALL tiers first. Verifiers CAPPED at 25 tool calls.
        Price measure agents at 15,000 + artefacts x 8,500.
DEGRADE: reopened clusters, then the fix batch, then re-proof, then HIGH tier.
DONE MEANS: every STREAM cluster dispositioned with a verified diagnosis, and
        every applied fix re-proven from fresh frames.
```

## Rule 10 closing, filled

The session's report push (`57fb01e`) ran remote CI as run **30393688459** and it is
**green**:
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30393688459

Green chain this session, every one verified rather than assumed: `df7bf50` run
30392219665, `57fb01e` run 30393688459. Run 30393549410 on `95026c6` reads `cancelled`
and is NOT a red: it was superseded by the next push before it finished, under the
workflow's concurrency group. Recorded because rule 10 only works if a red means
something, so a non-green result that is not a failure is worth one line now rather than
an investigation later. No expected-fail runs were declared or needed, per rule 9.

The owner preview was refreshed after the report commit and its line is:

```
OWNER PREVIEW  |  v10 line, main  |  commit 57fb01e  |  built 2026-07-29T05:50:29+10:00  |  started 2026-07-28T19:50:49.612Z  |  http://192.168.4.92:5173
```

It refused once first, correctly, on the dirty tree the report edit itself creates. It is
run once more as the last action of the close, after this closing's push, per the
one-commit-lag clause.

## Self-audit before reporting, per convention (l.5)

Re-derived and checked before this report was written, not after:

- **Every agent accounted for**: 28 + 22 + 30 = 80, zero LOST, zero errors, confirmed
  against each workflow's own usage block.
- **Locked paths untouched**: no file under `frontend/src/`, `games/future_spinner/` or
  `.claude/settings.json` was modified this session. `git status` clean at close.
- **Committed evidence never written to**: the 207 upscaled frames were written to the
  gitignored `.evidence-scratch/`, and `git status reports/screens/` returned zero
  throughout, checked at launch and at close.
- **The measure multiplier is derived from this session's own two runs**, 232k per squad
  against 131k predicted and 95k per capped verifier, and is not carried from elsewhere.
- **The six marshalling faults were counted from the panels' own returns**, not estimated.
- **Fable's rulings were transcribed, not composed.** This session did not receive Fable's
  longhand and did not invent it; the record says so at the transcription.

## ADDENDUM, 2026-07-29: the parked fix batch, partly unparked

The owner reported the session allowance at 69 per cent used with 1 hour 9 minutes
remaining, materially more headroom than this session's conservative accounting against
the brief's 14.5M had assumed. The gap is worth naming for future planning: **the brief's
budget was a figure the owner set, and the account meter is the truth.** A session should
reconcile the two rather than trust its own derived number, which here was pessimistic by
enough to have parked deliverable work.

Two of the three first-hand findings were applied and re-proven:

- **MID-02**, the ASCII `x` on the multiplier, now U+00D7.
- **TR-104's remaining half**, the unit now routed through `t($locale, 'bet', ...)`.

Both at `WinBanner.svelte`, both one line, both re-proven from **freshly captured frames**
rather than from the old ledger: `16x BET` becomes `16× BET` on English, and
`GROSSER GEWINN` + `16x BET` becomes `GROSSER GEWINN` + `16× EINSATZ` on German. Proof at
`reports/screens/winbanner-fix-2026-07-29/`. Tracker TR-117 FIXED. `npm run check` 0
errors, dash gate PASS.

**MID-01 stays parked**, and deliberately: the shared count-up clock is a refactor across
two components plus a frame-level equality assertion and its convention (p) seeded
self-test. Starting that inside the closing window would have risked the half-applied fix
this session twice argued against.

### The harness defect found on the way, which matters more than the fix

`stream_test_capture.mjs` had `DATE` hardcoded to `'2026-07-28'`, so **any re-run wrote
into the committed evidence directory and overwrote all 519 frames.** That is exactly the
failure convention (h.1) is written against.

**It was found the hard way, and the honest account is that this session caused it before
catching it.** The first fix used `toISOString()`, which is UTC; at 06:03 AEST the UTC date
is still the previous day, so it resolved to the very directory it was written to protect
and overwrote 53 frames. They were restored from HEAD immediately, verified byte identical
at 519 files with an empty diff, and nothing was lost.

The lesson is the one `FULL_AUDIT_METHOD.md` 2.3 already states and this session had to
learn again: **a prompt is a request; a path is a guarantee.** A date is a guess about
where output lands, and it was wrong twice in one file. The script now asks git whether
anything at the destination is tracked and refuses if so, requiring an explicit
`--regenerate`. Seeded per convention (p): run against the real defect form, the actual
directory with the actual hardcoded date, it goes RED and names the 521 tracked files. The
negative control is the capture that produced the proof frames.
