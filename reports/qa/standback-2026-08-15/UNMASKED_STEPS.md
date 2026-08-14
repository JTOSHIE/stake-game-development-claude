# The unmasked steps

TASK 4 of `reports/briefs/FS_RED_CLEARANCE_2026-08-15_Prompt.md`, 2026-08-15.
**REPORT ONLY. Nothing here was fixed.** Australian English, no em dashes or en dashes.

---

## 1. Why these steps were invisible

The `static gates` job runs its steps in sequence and stops at the first failure. On this
branch the job has failed early twice, and each time every later step was reported
`skipped` rather than run:

| Run | Aborted at | Later steps skipped |
|---|---|---|
| 31815432853 | step 3, `locked paths and track scope`, no track manifest | about 66 |
| 31836692899 and 31837837541 | step 5, `track manifests are disjoint` | about 65 |

**So the branch has never once been told what the other 65 steps think of it.** TASK 1
clears the disjoint failure, which lets them run.

## 2. THE FINDING, recorded as the brief asks

**A failing early step masks every step after it, and this is the second time it has
hidden information on this branch.** The analysis pass recorded the first instance and
this pass recorded the second one step later. It is not a defect in any gate: it is
`fail-fast` doing what it says. What it costs is that a red at step 3 and a red at step 65
are indistinguishable from outside, and a session reading only the job's conclusion learns
one bit where 69 are available.

**Not reordered and not changed in this pass**, per the stop line. Two shapes a
remediation pass could weigh: `continue-on-error` on the cheap read-only scans so the job
reports everything and still fails; or splitting the manifest and lock checks into their
own job so a scope problem cannot mask a content problem.

## 3. What the steps actually say

**The 69 static steps were run locally against this exact tree**, in workflow order, with
`Install frontend dependencies` skipped because the local install already exists. The
remote run is recorded in section 4 and is the authoritative reading.

```
PASS        0.9s  locked paths and track scope, self-test
PASS        0.0s  track manifests are disjoint
PASS        0.1s  locked paths and track scope
PASS        1.9s  document currency, seeded-violation self-test
PASS        0.0s  kit build, seeded-violation self-test
PASS       44.8s  document currency scan
SKIP  Install frontend dependencies  (npm ci, not re-run locally)
PASS       10.9s  supply chain, seeded-violation self-test
PASS        4.5s  supply chain, licences, install hooks, integrity and advisories
PASS        3.1s  svelte-check (no new type errors)
PASS        0.0s  dead wiring scan, seeded-violation self-test
PASS        0.2s  dead wiring scan
PASS        0.0s  wallet float scan
PASS        0.0s  currency scale drift
PASS        4.6s  fsModes / index.json drift
PASS        5.0s  paytable parity, seeded-violation self-test
PASS        4.6s  paytable parity against the shipped maths
PASS        0.0s  locale completeness
PASS        0.0s  a11y social terms
PASS        4.6s  social vocabulary
PASS        4.5s  disclaimer conformance, seeded-violation self-test
PASS        4.6s  disclaimer conformance, sixteen locales
PASS        0.0s  dash gate, seeded-violation self-test
PASS        0.0s  dash gate, source scan
PASS        0.0s  multiplication sign gate, seeded-violation self-test
PASS        0.0s  multiplication sign gate, prose scan
PASS        0.0s  machine tell gate, seeded-violation self-test
PASS        0.1s  machine tell gate, source scan
PASS        4.6s  bet ladder model
PASS        4.7s  responsible gambling enforcement
PASS        4.5s  modal guard and buy affordability
PASS        4.7s  live guard
PASS        4.6s  session recovery
PASS        4.6s  feature resume, checkpoint model
PASS        4.6s  feature resume, recovery flow
PASS        4.6s  scatter anticipation
PASS        4.7s  launch params
PASS        4.6s  rgs parse alignment
PASS        4.7s  wallet contract
PASS        4.6s  currency static assertions
PASS        0.0s  round logic currency, seeded-violation self-test
PASS        0.0s  round-shaping logic never reads currency
PASS        0.3s  currency table, seeded-violation self-test
PASS        0.1s  currency table against the platform mirror
PASS        0.0s  bet ladder declaration drift, seeded-violation self-test
PASS        0.0s  bet ladder declaration drift
PASS        4.6s  social mode forces English
PASS        4.6s  replay rounds
PASS        4.6s  replay locale, social English only
PASS        4.5s  win precision, sub-cent payouts
PASS        0.1s  hardcoded player-facing strings
PASS        2.9s  npm run check (svelte-check AND tsc)
PASS        2.5s  production build
PASS        0.0s  dash gate, dist scan
PASS        0.1s  machine tell gate, dist scan
PASS        4.6s  kit basis gate, seeded-violation self-test
PASS        4.6s  kit basis gate, superseded basis words and en-form figures
PASS        0.0s  asset references, seeded-violation self-test
PASS        0.0s  asset references resolve in dist
FAIL(1)     0.0s  dist hygiene, no documentation ships
PASS        0.0s  brand tokens in file names, seeded-violation self-test
PASS        0.0s  no Stake brand token in any shipped or source file name
PASS        0.0s  embedded stake marks, seeded-violation self-test
PASS        0.2s  no Stake mark embedded in any shipped asset
PASS        0.0s  prohibited mechanics, seeded-violation self-test
PASS        0.0s  no prohibited mechanic ships
PASS        1.0s  delivery set, seeded-violation self-test
PASS        0.2s  delivery set conformance
PASS        0.2s  books verifier self-test
```

**67 pass. One fails. One was skipped as an install step.**

## 4. The one failure, and why it is not a defect

```
DIST HYGIENE: FAIL (1)
  - the build stamp is THIS commit, built from a clean tree: cleanTree: stamp says false, expected true
```

**This is a local artefact and cannot occur in CI.** The step runs after `production
build`, and the build stamps `dist/build-info.json` with whether the working tree was
clean when it ran. This local sequence built while the pass's own uncommitted work was in
the tree, so the stamp truthfully recorded `cleanTree: false` and the gate truthfully
refused it. CI checks out a clean tree, builds there, and the stamp reads true.

Every one of the gate's own seeded self-tests passed in the same invocation, including
both negative controls, so the gate is working exactly as designed.

**Verdict: another gate asserting on something that moved, in the mildest sense.** It is
asserting on the state of the tree the build ran in, which is a real property worth
asserting, and the local run simply did not satisfy it. It is not a defect in the shipped
artefact and nothing was changed on its account.

## 5. The remote reading

The remote runner is a different machine and rule 10 does not accept a local green in
its place, so the authoritative reading is here.

**RUN 31841069497 ON `6b9a443b`: SUCCESS, and it is the first time this branch has
seen its own static suite.**

| Reading | Value |
|---|---|
| jobs in the run | **29, all success** |
| steps in `static gates` | **75** |
| steps that succeeded | **75** |
| steps skipped | **0** |
| steps failed | **0** |

**Every step that the two earlier runs masked ran, and every one passed**, including
`dist hygiene, no documentation ships`, which confirms the local red in section 4 was
the dirty-tree build stamp and nothing else. The count is 75 rather than the 69 run
locally because the remote job also runs its checkout, Node and install steps.

**PR #123 is green.** Both reds the previous pass documented are cleared: the disjoint
failure by TASK 1, and `browser: max-win hold` by TASK 2.

