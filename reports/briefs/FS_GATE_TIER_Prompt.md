FS_GATE_TIER_Prompt.md. Save this verbatim to reports/briefs/ and commit it with the work. Fresh Opus session on main, drafted per reports/briefs/_TEMPLATE.md, explicit paths, no em or en dashes. NO LOCK EXCEPTIONS, NO MONEY-PATH EDITS.

WHY THIS SESSION EXISTS. Session 7 reconciled all 57 candidate rows and fixed three. **JOB 3, the gate and CI tier, was never started, and its 19 rows are the whole of this session.** They carry the three remaining STREAM rows and they are the rows where convention (p) supplies the proof directly, which is the self-verifying shape the owner authorised.

**A COSTING CLAIM MADE TO THE OWNER WAS TOO STRONG AND IS CORRECTED HERE, because acting on it would misplan this session.** He was told the gate tier is the cheapest per row, on the evidence that its 19 rows cluster into 10 files with 12 in three. **The CLUSTERING is real; the CHEAPNESS does not follow.** Session 7 closed documentation rows at roughly 40k of main loop each. A gate row that BUILDS AND WIRES A NEW INSTRUMENT was measured at about 0.75M, and a row needing a browser leg at about 1.0M, against a working budget near 740k. **So a single new-instrument row can consume a whole session, and the tier is a mix of cheap and unaffordable rather than uniformly cheap.** The job order below is built on that split, not on the file clustering.

BUDGET: context is the binding line.
  Main loop about 550k of a roughly 740k working budget. **Gate work is main-loop heavy because the seeded red must be OBSERVED, and observing is not delegable.**
  Agents: about 6 reconnaissance agents. **Reading a gate to find its exact insertion point IS delegable and must be delegated**; making the edit and watching it go red is not. That split is the only thing that makes this tier affordable.

STOP LINES: no new agents below 400k main-loop context. No new gate started below 300k. Close at 200k. No clock stop.

DEGRADATION ORDER: JOB 1, then 2, then 3, then 4, then 5, then 6. **Within every job, a row with a proven red beats two rows edited without one.** If short, cut rows, never cut the seed.

DONE MEANS: every row this session touches is committed with a seeded red observed and quoted, or it is left untouched and recorded as not started. **A gate edited without a proven red is reverted before commit rather than left half-proven.**

---

## THE RULE THAT DEFINES THIS SESSION

**Convention (p) is not a test for the gate. It is the plant-the-real-defect-and-watch-it-go-red step, and it is the only proof this tier accepts.**

`CLAUDE.md` records this project producing the same failure four separate times with a green gate sitting over it, and records the dash gate being widened, declared closed, and **still being wrong**, because it read single-quoted literals while the real defect was markup prose. **Seed the form that actually shipped, not the form the gate happens to handle.**

**THE WORKED FAILURE THIS SESSION MUST NOT REPEAT, because it was this seat's own and it cost a session.** A brief instructed a session to seed an external network request to make `frontend/scripts/build_diet_verify.mjs` go red. **That gate cannot detect a successful external request**: it filters to same-origin before it counts, so the seed was impossible and the session was right to refuse. **A SEED INSTRUCTION ASSERTS WHAT THE GATE MEASURES, SO IT IS A PREMISE.** Before writing any seed, read the gate and confirm the predicate can see the defect. Where it cannot, say so and pick the instrument that can.

---

## THE THREE RULES CARRIED FORWARD, because each cost a session before

**CONVENTION (h.1), AND ONE ROW WALKS STRAIGHT INTO IT.** `frontend/scripts/layout_fit_gate.mjs` and `frontend/scripts/contrast_gate.mjs` rewrite committed evidence on every plain run. **S2-C024 edits `layout_fit_gate.mjs`.** Run it to a scratch path or via a self-test that exits before writing, and run `git status --porcelain` after every full gate run.

**BOUNDED READS ONLY.** `reports/SESSION_REPORT.md`, `docs/records/reviews/REVIEW_TRACKER.md` and `reports/qa/session4b/waveA_raw.json` are together about forty per cent of the working budget if opened whole. Read with ranges. **`reports/qa/session7/RECONCILED.tsv` is 77KB; read it with awk over the columns you need, never whole.**

**COMMIT PER ROW OR PER CLUSTER, AND A RESUME LINE AFTER EACH**, appended to `reports/qa/session8/RESUME.md`, which this session CREATES. Rule 13 makes an honest stop lawful only at a boundary, and a gate session has no waves, so the commit is the boundary.

---

READ FIRST

- `CLAUDE.md`: protocol rules 10, 12, 13, 15, 16; conventions (h.1), (k), (p), (q), (s).
- `docs/skills/AGENT_BUDGET_AND_SCHEDULING.md` section 4.5: why construction sessions bind on main loop.
- `reports/briefs/FS_SELF_VERIFYING_Prompt.md`: the brief this one continues.
- `reports/qa/session7/RESUME.md`: what landed and what was parked.

ARTEFACTS:
- `reports/qa/session8/RESUME.md`: **CREATE IT.** One line per commit.
- `frontend/scripts/brand_token_gate.mjs`: **CREATE IT**, in JOB 5 only, and only if the budget reaches it.

---

PREMISE PROVENANCE, per rule 16. Resolved against HEAD `8e2bd1a` on 2026-08-04.

- **VERIFIED** by `awk` over `reports/qa/session7/RECONCILED.tsv`: **19 rows** are tier `gate_or_ci` and verdict `STILL_OPEN`. Three are STREAM, thirteen HIGH, three MEDIUM.
- **VERIFIED**, same method, grouping on the fix location: they span **ten files**, with **twelve of the nineteen in three**: `.github/workflows/checks.yml` five, `frontend/scripts/dist_hygiene_gate.mjs` four, `frontend/scripts/replay_contract_gate.mjs` three.
- **VERIFIED** by grep over the same nineteen fix locations: **zero touch a locked path.** No sanction is needed and none is granted.
- **VERIFIED** by direct read: `frontend/scripts/dist_hygiene_gate.mjs` already carries `uriSeeded` and `brandSeeded` seed arrays. **Extend the existing pattern; do not invent a second one.**
- **VERIFIED** by `gh run view`: the last run whose FULL browser matrix went green is `30600681036`, commit `3d068eb`, 15 of 15 jobs. The last commit touching a matrix path, `6092335`, had run `30607097365` **CANCELLED at 3 of 15**. Every main run since is a 3-job documentation-only run. **The browser matrix has not been seen green since `3d068eb`.**
- **VERIFIED** by direct read of `frontend/scripts/build_diet_verify.mjs`: it filters to same-origin before counting, so it cannot observe a successful external request. **S2-C058's own recorded remainder already names the alternative instrument, `frontend/scripts/platform_conformance_item2.mjs`, which compares `new URL(u).origin` properly.**
- **REPORTED, by Session 7 and not re-measured here**: the `self_verifying` column of `RECONCILED.tsv` reads YES on 56 of 57 rows and is a prompt artefact. **Do not use that column for anything.** Scope comes from this brief.

---

## THE JOBS

### JOB 1: reconnaissance, delegated, before any edit

- **Deliverable**: one note per cluster on disk under a scratch path, not committed.
- **Agents**: about 6, container-orchestrated per convention (q), one cluster each, shared-nothing.
- **Each agent reads its gate and returns**: the exact insertion point, the predicate as it actually is, **whether the predicate can SEE the defect the row names**, and what the seed must look like in the form the defect really occurs.
- **An agent that finds the gate cannot see the defect says so, and that row moves to a redesign rather than an edit.** That is the `build_diet_verify.mjs` lesson applied ahead of time instead of after.
- **The agents do not edit anything.** Reconnaissance only.

### JOB 2: the two cheap STREAM rows

- **S2-C008**, `frontend/scripts/replay_contract_gate.mjs`: add `await page.keyboard.press('Space')` and `await page.keyboard.press('Enter')` with a settle wait after the `.start-replay` click in `driveReplay`, let the existing AUTHED_ROUTE assertion run over the resulting full request log, and add the convention (p) seed.
- **S2-C009**, `frontend/src/lib/i18n/vocabulary.ts`: correct the claim so it states that `currency` IS player-visible on the replay surface in real-money mode, and that the social-mode case is proved by the replay contract gate, naming that gate. **Keep `currency` in NOT_SUBSTITUTED.**
- **These two are cheap and they are STREAM, so they go first.** The standing mandate makes severity decide order, and nothing here argues with it.

### JOB 3: the supply-chain cluster, which is ONE mechanism and not three rows

- **S2-C048, S2-C049 and S2-C051 fold into a single instrument**, and the rows say so themselves: a dependency scan step in the static job after `.github/workflows/checks.yml:297`, running against the resolved lockfile, plus a committed dated artefact under `reports/qa/` that a reviewer can open.
- **S2-C048** additionally wants the `"scan": "npm audit --omit=dev --audit-level=high"` script in `frontend/package.json` and an anti-malware pass over `frontend/dist` after the production build.
- **S2-C051** additionally wants a licence inventory committed dated under `reports/qa/`, an allowlist-enforcing step, and the LICENCE text fetched at its pinned commit with the hash recorded beside the inventory **rather than trusting the `package.json` field**.
- **One commit, three rows closed.** This is the best value in the tier and it is why JOB 3 sits above the cheaper singletons.

### JOB 4: the dist_hygiene cluster, four rows on an existing gate

All four land in `frontend/scripts/dist_hygiene_gate.mjs`, which already has the seed arrays.

- **S2-C044**: add `info.commit === execSync('git rev-parse HEAD')` and `info.cleanTree === true` beside the existing checks, and seed both, **including the stale-commit negative control**.
- **S2-C118**: assert that every src and href attribute in the BUILT index.html, under the gitignored frontend dist directory, begins with a relative dot-slash prefix, naming the offending attribute on failure. The seed **builds with an absolute Vite base, a real build output rather than a patched HTML string.**
- **S2-C080**: replace the `generated: '2026-07-26'` literal with a run-derived value and add a sibling `measuredAt` field so two committed copies are distinguishable. **This is convention (s) in its purest form and it couples to S2-C079 and to the outstanding part (b) of S2-C077, both documentation rows.** Note the coupling in the commit; do not silently fix the documentation rows here.
- **S2-C052**: scan `frontend/dist/assets/*.js` for `setTelemetrySink`, `__telemetry` and any absolute http or https origin that is not the RGS host. Seed by hoisting the `setTelemetrySink` call out of its `import.meta.env.DEV` guard.

### JOB 5: what is left, in severity order, as far as the budget reaches

- **S2-C024 with S2-C025**, which the rows say must be coordinated: both touch `frontend/scripts/layout_fit_gate.mjs:190`. **Convention (h.1) applies here and nowhere else in this session.** S2-C025 also replaces a `.catch(() => '<absent>')` in `frontend/scripts/max_win_hold_gate.mjs` with a hard throw.
- **S2-C058**, the browser-matrix row. **Use `platform_conformance_item2.mjs`, not `build_diet_verify.mjs`**, for the reason recorded in the provenance above. The seed patches the SERVED bundle with an external font or CDN request and proves RED.
- **S2-C010**, the only new instrument: `frontend/scripts/brand_token_gate.mjs`, which this session CREATES, plus two convention (p) steps in `.github/workflows/checks.yml`. **Measured at about 0.75M, so it is a session's work on its own and it is LAST for that reason rather than because it is unimportant.** Starting it below 300k is forbidden by the stop lines.
- **The singletons if reached**: S2-C059, S2-C069, S2-C075, S2-C113, S2-C122.
- **S2-C069 and S2-C075 have owner-facing halves.** S2-C069's preferred option re-runs an export; S2-C075 carries an explicitly separate owner question about how the five books files reach the runner. **Park the owner half, fix the mechanical half, and say which is which.**

### JOB 6: close per rule 10

Run link recorded for every push, Plan of Record graded, `npm run owner:preview` from `frontend/` per rule 12 with its printed line quoted, session report per convention (a), handover per convention (i). **State the context used at each commit.**

**AND THIS SESSION'S CI GREEN WILL MEAN SOMETHING, unlike the last three.** Gate files are matrix-triggering paths, so this session's pushes re-exercise the twelve browser legs that have not been seen green since `3d068eb`. **Report the leg count actually observed.** If the matrix runs and fails, rule 10 stops the line and that failure is the most valuable thing the session produced.

---

WHAT THIS SESSION MUST NOT DO

- **Do not commit a gate without a proven red.** Revert instead. A gate that has never been seen to fail is a script that prints PASS.
- **Do not write a seed before reading the gate's predicate.** The impossible-seed failure is recorded above and it is this seat's own.
- **Do not run `layout_fit_gate.mjs` or `contrast_gate.mjs` in a way that writes committed evidence.**
- **Do not use the `self_verifying` column.** It is a prompt artefact.
- **No locked paths**, and zero of the nineteen need one. **No money-path work.**
- **Do not extend the row set.** Nineteen rows, fixed before the session began.
- **Do not fix the coupled documentation rows** S2-C077 part (b) and S2-C079 in passing. Note the coupling and leave them to the documentation tier.

FOR THE NEXT SESSION: the 19 remaining documentation rows, one of which, S2-C056, is parked awaiting the owner's confirmation of the `future-spinner-3` destination; the 6 component and 3 other rows, which no brief has yet assigned a job; the reviewers' named blocker, money-display integrity and localisation completeness; and the ten questions of entry 038.
