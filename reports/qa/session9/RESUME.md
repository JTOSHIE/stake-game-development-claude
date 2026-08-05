# SESSION 9 RESUME LEDGER

One line per commit, appended as each lands. Protocol rule 13 makes an honest stop lawful
only at a boundary, and a gate session has no waves, so the commit is the boundary. A
session picking this up mid-flight reads the last line and continues from there.

Session: FS_GATE_TIER_2, `reports/briefs/FS_GATE_TIER_2_Prompt.md`.
Base HEAD: `a14d409`, main, 2026-08-05.

Scope: the **eight** rows of tier `gate_or_ci`, verdict `STILL_OPEN`, in
`reports/qa/session7/RECONCILED.tsv` that Session 8 left untouched, namely S2-C010,
S2-C024, S2-C025, S2-C058, S2-C059, S2-C069, S2-C075 and S2-C122; plus ONE
owner-authorised fix outside the row set, `scripts/owner_preview.mjs` (JOB 1). Fixed
before the session began and not extended.

Format: `<sha>  <row ids or scope>  <what landed>  <proof>  <main loop context at commit>`

---

## PLAN OF RECORD, posted before the first expensive spend, per rule 15

```
PLAN OF RECORD
  budget seen        : main loop about 500k of a roughly 740k working budget;
                       agents about 4, and the agent line is NOT the constraint
  context at posting : about 75k main loop
  waves planned      : 1 x 4 reconnaissance agents at 2 rows each (JOB 2)
  discovery cost     : 4 x about 130k = about 0.5M on the AGENT line
                       main loop cost of marshalling them: about 25k
  expected findings  : 8 row verdicts; on Session 8's measured rate
                       (4 of 19 canPredicateSeeDefect=YES) expect about 2 to 3
                       clean YES, the rest refused or redesigned
  verification cost  : not applicable in the audit sense. This tier's proof is the
                       SEEDED RED, observed in the main loop and not delegable.
                       Priced per row below rather than by the audit formula.
  fixes and re-proof : JOB 1 owner preview            about  45k main loop
                       JOB 3 park proposals           about  25k main loop
                       JOB 4 S2-C024 + S2-C025        about  70k main loop
                       JOB 4 S2-C058                  about  60k main loop
                       JOB 4 S2-C059                  about  40k main loop
                       JOB 4 S2-C069                  about  35k main loop
                       JOB 4 S2-C075                  about  45k main loop
                       JOB 4 S2-C122                  about  50k main loop
                       JOB 5 S2-C010                  about 200k main loop
  main loop          : 75k held + 25k marshal + 570k of job work = about 670k
  TOTAL              : about 670k of main loop against a 500k line
  VERDICT            : DOES NOT FIT
  if DOES NOT FIT    : JOB 5 (S2-C010) is abandoned outright, per the brief's own
                       degradation order. That returns the total to about 470k,
                       which FITS with the close inside the 500k line.
                       If recon refuses rows, each refusal is cheaper than its fix,
                       so the remaining slack goes to JOB 4 rows in severity order.
                       JOB 1 and JOB 3 are never cut.
```

**The one judgement in that block worth stating plainly.** JOB 5 is abandoned at the
planning stage rather than attempted and half-built, because the brief measures it at about
0.75M as a session's work on its own and forbids starting it below 300k. Deciding it now
rather than discovering it at 300k is the whole point of posting the plan before the spend.

---

`37f9f46`  session setup  Brief saved verbatim to `reports/briefs/FS_GATE_TIER_2_Prompt.md`; this ledger and the PLAN OF RECORD opened.  Proof: the eight untouched rows re-counted independently, by awk over `reports/qa/session7/RECONCILED.tsv` for tier `gate_or_ci` and verdict `STILL_OPEN` (19 rows) cross-checked against `git log 8e2bd1a..HEAD` (Session 8 closed eleven), leaving exactly S2-C010, S2-C024, S2-C025, S2-C058, S2-C059, S2-C069, S2-C075, S2-C122. Plan of record VERDICT: DOES NOT FIT at about 670k against a 500k line, so JOB 5 is abandoned at planning time.  Main loop about 75k.

`637026f`  JOB 1, owner preview (NOT one of the eight rows, separately owner-authorised)  `scripts/owner_preview.mjs`: the LAN address is derived from `os.networkInterfaces()` at print time, PROBED with a real fetch before it is printed, and a line that could not be reached is REFUSED with every interface and URL it tried.  Proof: the defect measured against the live server, `192.168.4.92:5173 -> NO ANSWER (TypeError)` against `192.168.4.95:5173 -> 200 REACHABLE`, so the line rule 12 exists to produce pointed at a dead address while a healthy server was up. Convention (p): `OWNER PREVIEW SELF-TEST: PASS (7/7, 3 seeds, 4 paired controls)`, seeds driving the REAL resolver, SEED 1 on RFC 5737 TEST-NET-1 with a real network probe, SEED 3 planting the line that actually shipped. **Observation boundary stated in the commit**: the main-path branch cannot be source-hoisted because the dirty-tree guard refuses before the address probe; the green path is proven at close.  Main loop about 105k.

`d010b9c`  JOB 3, the four refused halves  New `reports/qa/session9/OWNER_PARK_PROPOSALS.md`. Session 8's four refusals proposed as explicit OWNER-PARKs, class `unreachable`, none closed, all awaiting signature.  Proof: measurements QUOTED from `reports/SESSION_REPORT.md:10384-10404`, the repository's own record, not from the brief's narration of it, per rule 16. Park classes reused from `reports/qa/session3/PARKED_TRACKER.md` rather than invented. PROPOSAL 4 (S2-C051) is flagged in its own heading as NOT assigned by the brief, per convention (n).  Main loop about 125k.

`(no commit)`  JOB 2, all eight rows  Four shared-nothing reconnaissance agents, container-orchestrated per convention (q), two rows each, read-only, notes under a scratch path and not committed. 8 of 8 notes on disk, 0 LOST.  Proof: **not one of the eight rows returned canPredicateSeeDefect = YES**, and every one of the eight recorded remainders came back PARTLY_WRONG or worse. Two agents independently detected the primary checkout advancing under them mid-run, touched nothing and reported it per multi-track rule 11, then re-verified with `git diff --name-only a14d409 37f9f46` that none of their quoted files had moved.  Main loop about 140k.

`b43f903`  S2-C024 + S2-C025 (JOB 4, coordinated)  `layout_fit_gate.mjs` records missing and hidden readouts instead of two bare `continue`s, asserts all three at every preset, and gains the `--self-test` it never had; `max_win_hold_gate.mjs` keeps the `'<absent>'` sentinel with a 2s timeout and asserts a currency-shaped precondition at t+0.  Proof: `LAYOUT FIT GATE SELF-TEST: PASS (6/6, 3 seeds, 3 paired controls)` with BUILD-LEVEL seeds into a scratch copy of real dist, `SEED a renamed testid is CAUGHT as not mounted`; the seeded line reads `readouts=2/3 MISSING 1` with `offscreen=0 clipped=0`, which were the only signals the old code asserted on, so the old gate would have printed PASS on that exact build. `max_win_hold`: one run shows `FAIL the WIN readout is present ("<absent>")` beside `ok WIN unchanged across the hold ("<absent>" then "<absent>")`, the vacuous pass visible in the output, plus a paired control that the NEW precondition caught it. Plain runs green: 7 presets at readouts=3/3, and the hold gate PASS. **Row prescriptions refuted in three places**: C024's scope was too weak, C025's hard throw would crash instead of reporting, and C024's whole currency clause is refused on four grounds. **The brief's (h.1) premise for `layout_fit_gate.mjs` is STALE**: it writes via `evidenceDir()` to gitignored `.evidence-scratch/` since `6f4ca77`.  Main loop about 250k.

`42ed6c9`  S2-C058  Origin assertion added to `build_diet_verify.mjs`, not to `platform_conformance_item2.mjs`; leg renamed back to `browser: build diet, network hygiene and budget`.  Proof: seeded `fonts.googleapis.com` stylesheet observed at **`"status": 200` with `notFound: 0` and `failed: 0`**, so every pre-existing check was clean on a bundle pulling an external font; `SELF-TEST origin control: RED, and attributed to the off-origin assertion naming https://fonts.googleapis.com`, and the clean bundle measures `offOriginRequests: 0` across 52 requests. **The brief sent this to the wrong file**: `requests.push({url,status})` runs BEFORE `rel` is computed, so the instrument always saw off-origin URLs and only the predicate discarded them.  Main loop about 290k.

`7a1b336`  S2-C059  **CHEAP option taken and the commit says so.** Verdict re-worded in the GENERATOR's literals and in the record, stating it is a head-to-head ranking with no absolute legibility claim; CHECK anchor added to `provider_mark/README.md`.  Proof: seeded an absolute ceiling into the vote rule and observed `DOC CURRENCY GATE: FAIL, a document makes a claim that is not true of HEAD` / `STALE_CLAIM design-system/brand/provider_mark/README.md:180`; restored, gate PASS. **Mechanism NOT made rigorous**: an admissibility check needs a ceiling nothing measured derives, so it is an owner question. The row's "re-word :7 and :95" is wrong as written because `:451` regenerates the record in full; the anchor is deliberately NOT in that record because it would measure itself.  Main loop about 320k.

`b5d8e33`  S2-C075  New `scripts/qa/publish_bundle_gate.mjs` parses `index.json` and requires every `events` and `weights` path present and non-empty; wired into `publish-stake-engine.yml`.  Proof: `PUBLISH BUNDLE GATE SELF-TEST: PASS (8/8, 6 seeds, 2 paired controls)`; against the RUNNER's real inventory rebuilt from `git ls-files`, `OLD CHECK (test -f index.json) => exit 0, would print: math bundle OK` against `gate exit on runner inventory = 1` naming all five missing books files. **The row's "separate owner question" is the PRECONDITION**, parked as PROPOSAL 5 with four costed options.  Main loop about 350k.

`7a17842`  S2-C122  `MAX_EVENTS_PER_MODE` and `MAX_EVENTS_FILE_BYTES` added to `validate_math.py` with the limits quoted verbatim from two dated mirrors; `publish_limit_findings()` extracted so seeds drive the real predicate.  Proof: `VALIDATE MATH SELF-TEST: PASS (7/7, 4 seeds, 4 paired controls)` including both at-the-cap controls, since the platform's wording is "more than". Real run unchanged. **Three parts of the prescription refused**, the important one being the doc rewrite, which would replace an evidence-backed figure with an unsourced reinterpretation. Definition ambiguity parked as PROPOSAL 6, with the two strict-reading figures marked REPORTED and NOT recounted.  Main loop about 380k.

`a6309d3`  S2-C069  **PARKED, BUDGET.** No code changed. Divergence re-measured; both options the row names proven impossible by direct read of `scripts/assets/build.py:270-274` (drop is a no-op since the default is 256, raise is impossible since PIL caps at 256), and the export cannot safely be re-run because `main()` rewrites 83 tracked assets. The cheap option was available and NOT taken because `manifest.json` is JSON and cannot carry a CHECK anchor, so it would not have closed the row. Surviving option specified and sized as PROPOSAL 7.  Main loop about 400k.

`(close)`  JOB 6, rule 10 and rule 12  Session report per convention (a), archived to `reports/archive/2026-08-05b_gate_tier_2.md`, handover per convention (i).  Proof: **checks run `30970938613` on the final tip `1fc6d0d`: success, 15 of 15 jobs, zero non-success, THIRTEEN browser legs named individually in the report**, including `browser: layout fit` (which this session changed from a bare run to `--self-test && <gate>`) and `browser: build diet, network hygiene and budget` (renamed by this session once the assertion behind the name existed). `Validate math` run `30970938687` also success, exercising `validate_math.py` on a runner carrying no books files. Earlier run `30970170607` on `b43f903` success 15 of 15, the run that covered the two browser-gate changes. Rule 12 line quoted in the report, with the derived and probed address `http://192.168.4.95:5173/`.  Main loop about 430k.

`57a4eef`  final push, rule 10 completion  Session report, archive and close ledger.  Proof: run `30971249301` on `57a4eef` **success**, `what changed` success, `static gates` success, `matrix.gate.name` **skipped** because the push is documentation-only. The skip is lawful to close on here, unlike Session 8's, because every gate change this session made was already proven on a COMPLETED 15 of 15 matrix with 13 named browser legs at `1fc6d0d`. Owner preview re-run as the last action per the one-commit-lag clause.  Main loop about 450k.
