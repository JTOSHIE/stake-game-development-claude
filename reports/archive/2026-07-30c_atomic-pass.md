# Session Report - SESSION 5, THE ATOMIC PASS (2026-07-30)

Brief saved verbatim: `reports/briefs/FS_ATOMIC_PASS_Prompt.md`, committed with the work per
convention (f). Opened on `main` at `a2e2509`, closed at `0c397e1`. Seven commits, one per row,
each with its resume line appended to `reports/qa/session5/RESUME.md` before the next began.

**Owner preview, per rule 12 and quoted before this report was written:**

```
OWNER PREVIEW  |  v10 line, main  |  commit 0c397e1  |  built 2026-07-30T22:56:26+10:00  |  started 2026-07-30T12:57:02.008Z  |  http://192.168.4.92:5173
```

The address was CURLED rather than believed: `HTTP 200 in 0.002541s`, serving real HTML. Rule 12
is explicit that printing a URL is not evidence the URL works, and that requirement was earned on
the rule's own first run.

---

## 1. WHAT LANDED

| # | Job | Commit | Outcome |
|---|---|---|---|
| 1 | Eight ruling-blocked rows into one comms entry | `f60ac3c` | Entry 034, newest first |
| 2 | The seed-scoring hole in the replay gate | `0dc7eca` | UNAPPLIED is now a third scoring class |
| 3 | S2-C006, the replay figures persist past ready | `d1cd0c3` | Hoisted, held by two assertions and a seed, 12 frames |
| 4 | S2-C009, the social leg on the replay gate | `df78a31` | Both directions of the label swap asserted |
| 5 | S2-C017, the focus ring fired on mouse focus | `4e8cfb5` | One of the nine STREAM rows |
| 6 | S2-C092, the kit dropped the composed tile | `2219f77` | Branding set read, not listed |
| 7 | Prose corrections and two record closures | `0c397e1` | Five corrections, TR-104 closed, two strikes |
| 8 | Guidelines self-assessment | NOT STARTED | **PARKED ENTIRELY**, per the brief's own stop line |

**Graded against the Plan of Record, per rule 15.** The plan predicted 395k against a 740k
working budget and a verdict of FITS, with two declared risks: that JOB 3 would run over, and
that JOB 8 must not start below 250k. **Both risks materialised exactly as declared.** JOB 3 cost
roughly 150k against its 120k estimate, and JOB 8 parked. Eight of the nine JOB 5 rows were not
attempted, which the brief predicted in its own words: *do not plan for nine*.

**The resource that ran out was CONTEXT**, as the brief said it would be, and not tokens or
clock. That is the honest answer rule 13 asks a stopping session for.

---

## 2. THE THREE FINDINGS THAT MATTER MORE THAN THE FIXES

### 2.1 A gate was scoring a class it could not measure

`replay_contract_gate.mjs` answered HTTP 500 when a seed's target string was absent. A 500 stops
the app booting, so every assertion in the run fails, so the seed scored **CAUGHT**. A seed that
never applied was indistinguishable from a seed that worked, and the gate read a full house
either way.

This was live, not theoretical: any bundle rename or markup edit under a seeded target would have
blinded the gate while it printed 6/6. **It is convention (p)'s own failure mode occurring inside
the mechanism built to enforce convention (p).** The control added with the fix proves the point
rather than asserting it: it demonstrates the probe run WOULD have scored CAUGHT under the old
rule.

**Landing this BEFORE touching ReplayMode was the brief's call and it was correct.** JOB 3 edits
the exact markup two seeds target.

### 2.2 A fix that regressed a compliance surface, caught before it landed

The JOB 3 hoist added a row, and measuring all eight required viewports showed it pushing the
**replay compliance disclaimer off the TOP of the viewport**, where `scrollTop` cannot reach it.
That is worse than the defect being fixed. The container was `height: 100vh` with
`justify-content: center`, so overflow spilled both ways.

Changed to `min-height: 100vh` and re-measured: nothing regressed at any preset in either phase,
three combinations improved outright, and all bottom overflow became scroll-reachable with real
slack where **five combinations previously needed more scroll than existed**.

**The lesson is that the layout fit gate passed throughout.** It measures the main game surface,
not the replay route, so it would have reported PASS over the regression. A gate's green is only
as wide as what it measures.

### 2.3 The replay compliance disclaimer is unreachable at six of eight presets, and it is nobody's fix yet

**THIS IS THE MOST VALUABLE THING THIS SESSION FOUND AND IT IS NOT FIXED.** The cause is not in
ReplayMode. `frontend/src/app.css:125` is `place-items: center` on a flex `body`, the create-vite
scaffold default, which centres `#app` and splits any overflow equally so the top half sits above
`scrollTop: 0`. Verified by direct read.

Fixing it changes the main game surface too and needs its own measurement pass at all presets, so
it was deliberately not attempted here: two jobs colliding on one line is how a fix lands twice.
Sized and scheduled for the next session in section 5.

---

## 3. PREMISES THAT DID NOT SURVIVE THE RECOUNT, per rule 16

The brief marked its anchors VERIFIED at `d459c42`. HEAD was `a2e2509`, one commit further on, so
every anchor was re-resolved. Four premises changed what the work was.

- **`COMPLIANCE_WATCH.md:148-149` was wrong in TWO ways, not one.** The brief said the count was
  wrong. The file it named FIRST, the ControlBar component, was also deleted on 2026-07-08. A
  session correcting only the count would have left a dead filename presented as a live path.
- **S2-C012 is NOT a one-line CSS change.** The brief grouped it with S2-C017 as one-liners. The
  record specifies replacing `#app`'s whole rule, dropping `max-width` and `padding`, which is a
  real layout change touching four browser gates. It was NOT attempted on that basis.
- **S2-C010's central premise is FALSE at HEAD.** Its derivation says nothing scans for brand
  tokens. `frontend/scripts/dist_hygiene_gate.mjs:230-248` already does, with a seeded self-test,
  wired at `checks.yml:725`. Most of that row is redundant work.
- **TR-104's closure was verified at SOURCE, not from TR-117's own claim.** TR-117 covers the
  multiplier unit; TR-104 covers the tier label AND the unit. A successor fixing one half would
  have closed an OPEN HIGH defect with nothing behind it. `WinBanner.svelte:214` and `:235` both
  route through the locale layer, so the closure is real.

**And the document currency gate taught the role charter's own lesson back.** The first draft of
the COMPLIANCE_WATCH correction wrote the deleted component as a backticked path, and the gate
flagged it within a minute, which is exactly what `ROLE_HEAD_OF_ENGINEERING.md` section 2 records
about its own row two. The form was matched to the meaning rather than allowlisted.

---

## 4. VERIFICATION

| Gate | Result |
|---|---|
| `replay_contract_gate.mjs --self-test` | **SEEDS: 8/8 caught, 0 missed, 0 unapplied.** 10/10 assertions, exit 0 |
| `replay_contract_gate.mjs` | 19/19 assertions, PASS (11 requirements held), exit 0 |
| `kit_build.mjs --self-test` | PASS, exit 0, six new branding cases |
| `doc_currency_gate.mjs` | 333 frozen, **0 new**, PASS |
| `dash_gate.mjs` | PASS, source and dist |
| `machine_tell_gate.mjs` | PASS, source and dist |
| `locale_completeness_check.mjs` | PASS, 0 unexplained literals |
| `layout_fit_gate.mjs` | PASS, seven presets |
| `brief_preflight.mjs` on this brief | PASS, no findings |

**Remote CI, per rule 10: run 30544720646.** Result recorded in the appendix below.

**The kit build was NEVER run without a flag.** Only `--self-test`. A full run writes to the
owner's Desktop.

**Convention (h.1) was proven, not assumed.** A 1396-file checksum manifest taken before and
after two runs of the new capture script diffs empty, so it writes nothing under committed
evidence.

**What no gate holds, stated plainly rather than implied by the greens above:** the JOB 7 prose
corrections (the currency gate checks that paths resolve; it cannot read arithmetic), and the
S2-C017 focus ring (no gate covers that class, so nothing would catch a regression).

---

## 5. FOR THE NEXT SESSION

**Model and effort.** Opus 5, high effort, single main-loop session on `main`, no worktrees.

**Approach taken.** Delegation-first, because the brief correctly identified context rather than
tokens as the binding resource. Nine agents carried roughly 750k of reading and browser work that
never entered the main loop: ledger extraction, comms orientation, every chromium gate run, every
capture, and the viewport measurement. Chat-spawned rather than containerised, which
`FULL_AUDIT_METHOD.md` 4.1 permits for small counts and which was correct here: no wave exceeded
two agents, so there was nothing to resume.

**Alternatives tried and rejected.** (a) Merging the replay figures into the currency line to cost
zero height, rejected because it would wrap at 320px and cost the height anyway. (b) Fixing
`app.css:125` inside JOB 3, rejected for blast radius. (c) Attempting S2-C012, rejected once its
one-line premise was refuted.

**Files touched.** `frontend/src/lib/components/ReplayMode.svelte`, `frontend/src/app.css`,
`frontend/scripts/replay_contract_gate.mjs`, `frontend/scripts/replay_figures_proof.mjs` (new),
`scripts/kit_build.mjs`, `SUBMISSION_DOSSIER.md`, `BOOKS_MANIFEST.md`, `COMPLIANCE_WATCH.md`,
`docs/records/reviews/REVIEW_TRACKER.md`, `reports/FABLE_COMMS.md`, `reports/SESSION_REPORT.md`,
`reports/archive/2026-07-29b_session1-stream-close.md`, `reports/screens/EVIDENCE_INVENTORY.md`,
`reports/screens/replay-figures/` (new, 12 frames), `reports/screens/focus-ring-s2c017/` (new, 2
frames), `reports/qa/session5/RESUME.md` (new).

### Open threads, in the order they are worth taking

1. **`frontend/src/app.css:125`, the scaffold centring.** Section 2.3. The replay compliance
   disclaimer is unreachable at six of eight presets. Needs its own measurement pass across BOTH
   the game and replay surfaces at all presets, because the fix moves the main game too. Sized at
   its own session, not squeezed into what is left, per convention (r).
2. **JOB 8, the guidelines self-assessment**, parked entirely with its resume line. All or
   nothing: 58 rows and the Summary in one sitting. **Item 50 now has a real answer to record**:
   it passes in the ready phase AND in the playing and complete phases, because `d1cd0c3` landed.
   Item 53 stays DO NOT TICK.
3. **The eight rows of entry 034 need one ruling block.** Three are already inside entry 031's
   seven asks, so the true count of open questions is TWELVE, not fifteen.
4. **The eight JOB 5 rows not attempted**, with their sizing now honest rather than assumed:
   S2-C012 is a layout change touching four browser gates and NOT a one-liner; S2-C010 is mostly
   redundant against `dist_hygiene_gate.mjs`; S2-C008 needs a seeded self-test and is larger than
   it looks; S2-C013 is small but strictly two files atomically, and
   `frontend/scripts/dead_wiring_scan.mjs` WILL fail if the export lands without its reader;
   S2-C005 is small but `frontend/scripts/audio_verify.mjs` is unverified against it.
5. **Carried forward unchanged from the brief**: the reviewers' own named blocker, which is money
   display integrity and localisation completeness; TR-086 and TR-114, both HIGH and both on
   mandatory approval surfaces; the missing seeded self-tests for the owner-preview
   refuse-unpushed guard and for `frontend/scripts/dist_hygiene_gate.mjs`; and the mirror brief's
   docs no-delta fix.
6. **`frontend/scripts/build_diet_verify.mjs` is dead AND unwired.** Line 46 is
   `function startPreview() { return _server }` and `:75` awaits it; the only mention in
   `checks.yml` is a comment at `:698` describing the breakage. Carried in the brief's premise
   block but belonging to no job in it, so it is recorded here rather than lost.

**A measurement for the next brief to size from.** This session's per-commit context estimates are
in `reports/qa/session5/RESUME.md`. They are ESTIMATES from the transcript, not instrument
readings, because a session cannot read its own context meter. Size from their shape, not their
precision. The useful ratio: a construction session that delegates every read still spent its
context on the seven commits themselves, and JOB 3 alone, one component and one gate, took a fifth
of the working budget.

---

## APPENDIX: REMOTE CI, THE RULE 10 VERIFICATION

**Run 30544720646, conclusion SUCCESS**, covering commit `0c397e1` and every code change this
session made.

https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30544720646

The BROWSER MATRIX RAN rather than being skipped, which is the correct outcome and was checked
rather than assumed: the `changes` job gates the matrix on whether a push touched rendering,
shipping or gate code, and this push touched all three. A documents-only push would legitimately
have skipped it, and a session that saw a skip and called it a pass would be reading a filter as
a result.

`static gates` and `what changed` both succeeded, and all twelve browser legs succeeded,
including `browser: replay contract`, which is the leg carrying this session's new assertions and
seeds, and `browser: layout fit`, which is the leg that would move if the JOB 3 container change
had disturbed the main game surface.

**ALL 14 JOBS GREEN, zero failures and zero skips**, including all twelve browser legs.
`browser: replay contract` succeeded in 4m 02s and is the job most directly covering this
session's new assertions and seeds. Local HEAD `0c397e1` matches the run's headSha, so the run
gated exactly this commit rather than a neighbouring one.

**A MEASURED DEVIATION, recorded as knowledge rather than left to alarm the next session.**
`CLAUDE.md` rule 10 carries a measured browser wall-clock of 2.9 to 4.6 minutes. This run took
**9m 35s**. The cause is one job rather than a general slowdown: `browser: paytable card fill`
took **7m 18s** while every other browser leg had finished by 13:03:12. Rule 10's table exists so
that a slow run is knowledge rather than alarm, and the honest reading here is that the table's
figure no longer describes the slowest leg. It named `browser: scrim coverage` at about 276
seconds as the wall-clock setter; on this run the setter was paytable card fill at 438 seconds.
Worth a recount before the next brief quotes the old figure.

**THE ONE-COMMIT LAG IS NAMED, per rule 12.** This report is itself a commit, so the run above
covers the code and the report's own push triggers a further documents-only run. That is the
design rather than a gap: the code this session shipped is verified green on the remote, and the
report commit changes no code. The owner preview was refreshed once before this report was
written, so its quoted line is real evidence, and once more after the final push so the owner's
machine ends on the true tip.
