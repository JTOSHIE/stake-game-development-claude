# JOB 1 SHARD: TR-111, the dead network-hygiene gate

Session 6, 2026-07-31. Brief `reports/briefs/FS_RECORD_TRUTH_Prompt.md`, JOB 1.
Everything below is an OBSERVATION unless it is labelled otherwise, per
`docs/skills/FULL_AUDIT_METHOD.md` 2.7.

---

## 1. The defect, reproduced by running it rather than by reading it

The tracker row recorded this defect as "verified in the source rather than by running it".
It has now been run. `node frontend/scripts/build_diet_verify.mjs` at commit `b8d8012`
produced, in full:

```
build_diet_verify: writing to .evidence-scratch/ (convention h.1). Set FS_WRITE_EVIDENCE=1 to regenerate committed evidence.
TypeError: preview.kill is not a function
    at run (file:///Users/jt/math-sdk/frontend/scripts/build_diet_verify.mjs:206:13)
```

Exit code 1. **No summary JSON. No `ALL CHECKS PASS`. No `FAILURES DETECTED`.** The only
stdout line is the one `announceEvidenceMode` prints before `run()` is called at all. The
claim in the tracker row holds exactly: the gate reached none of its assertions and had been
seen neither to pass nor to fail.

**Two properties of this failure are worth keeping, because they are why it survived ten
days.**

1. **The exit code was 1, which is what a working gate returns when it fails.** The 1 came
   from the top-level `run().catch()`, not from the gate's own `process.exit(1)` after its
   assertions. Anything watching exit status alone would have seen a gate that ran and
   failed. This is what makes the self-test's design non-obvious, and section 3 covers it.
2. **A throw from a `finally` block REPLACES any exception already travelling out of the
   `try`.** So this single line both broke the gate and concealed whatever else might have
   been wrong beneath it. The whole browser walkthrough completed in 11 seconds, far less
   than its scripted spins should take, and that discrepancy was invisible in the output.

## 2. The fix

`preview.kill()` becomes `await killPreview()`, the function that already existed in the file
and had zero call sites. `startStaticServer()` in `frontend/scripts/lib/previewServer.mjs`
resolves `{ url, port, close }`; there has never been a `kill` on it. The TR-101 migration to
an in-process `node:net` server changed the handle's type and left one call site behind.

**The gate now produces a verdict, for the first time in its life.** Against the bundle built
at `b8d8012`:

```
BUILD DIET VERIFY: ALL CHECKS PASS (zero 404s, zero pruned-path requests, zero console
errors, dist 14.99MB < 25MB budget, reel-mode toggle absent, reduced-motion CSS present +
spin clean)
```

52 requests, 0 not found, 0 failed, 0 pruned-path hits, 0 console errors. The `try` block
turns out to be sound; nothing was hiding under the `finally`.

Four dead imports were removed in passing because the same edit touched the import block:
`spawn`, `createServer`, `assertNoSurvivors` and `mkdirSync` had no reference anywhere in the
file. This is not scope creep hunting: `spawnSync` and `cpSync` had to be added to that same
line for the self-test, and leaving four names that resolve to nothing beside them would have
been worse than removing them.

## 3. The seeded self-test, per convention (p)

Convention (p) requires the exact defect the gate exists to catch, **in the form it really
occurs**, and proof that the gate goes red on it.

**What is seeded**: a live reference to an asset that `vite.config.ts`'s `pruneLegacyAssets`
strips from `dist`, injected into a throwaway copy of the bundle under the OS temp directory.
That is TR-047's actual history, and it is the form that really occurs.

**Why that form and not a 404**: `previewServer.mjs` answers an unknown path with `index.html`
at status **200**, the way a single-page app must. So a reference into a pruned path is
invisible to every 404 check and visible only to the pruned-prefix assertion. Seeding a 404
would have proved a different assertion and learned nothing about this one, which is the
substitution convention (p) was written about.

**The pairing, and why the two halves assert different things**:

| Control | Bundle | Assertion |
|---|---|---|
| NEGATIVE | unmodified | must print the real `ALL CHECKS PASS` line |
| POSITIVE | seeded | must print the real `FAILURES DETECTED` line, AND name the seeded path, AND attribute it to `request into pruned path` |

**Neither half accepts an exit code as evidence, and that is the whole design.** Under the
TR-111 defect every run exited 1, so an exit-status assertion would have been satisfied by the
broken gate. The negative control is the half that catches a dead gate, because a thrown
TypeError exits 1 and never prints a PASS line.

**PROVEN, not asserted.** The defect was temporarily reintroduced and the self-test re-run.
Both controls failed, with the negative control reporting it as a gate defect rather than a
bundle defect:

```
BUILD DIET VERIFY SELF-TEST: FAILED
  NEGATIVE CONTROL FAILED: the unmodified bundle did not print the PASS line. Exit code 1.
  ...
  POSITIVE CONTROL FAILED: the seeded bundle did not print the FAILURES DETECTED line.
  Exit code 1. Exit status alone is NOT accepted here, because the TR-111 defect exited 1
  on every run without ever asserting anything.
```

The fix was then restored and `git diff` verified against the intended file only.

## 4. CI wiring

Added to the **browser** matrix in `.github/workflows/checks.yml`, as leg 12 of 13, running
`--self-test` first and then the real gate, which is the pattern every other seeded leg uses.

**It goes in the browser job and never the static one.** This gate calls `chromium.launch()`,
and putting a chromium-launching gate in the deliberately browser-free static job is precisely
what made runs 117 to 120 fail on `main`, as recorded in `CLAUDE.md` protocol rule 10.
Verified after the edit: the string `build_diet_verify` does not appear anywhere in the static
job.

Measured at **18.4 seconds** for all three runs together (`--self-test`'s two plus the real
one), by `time` over the exact wired command on the development machine, 2026-07-31. It is not
expected to set the wall clock.

---

## 5. HANDED FORWARD, NOT ACTED ON: the gate does not detect a successful external request

**This is an OBSERVATION about what the code does. No cause is proposed and no fix is
proposed.** It is recorded here and escalated rather than fixed, because convention (l.8)
requires it: it touches a **submission claim**, and the builder does not rule on those.

**The observation.** The script's own header calls it a "network-hygiene gate". Traced line by
line through the `page.on('response')` handler:

- an external response, for example `https://fonts.googleapis.com/...` at status 200, is
  pushed into the `requests` log;
- `rel = url.split(baseUrl + '/')[1]` is `undefined` for any off-origin URL, because `baseUrl`
  is `http://localhost:<port>`;
- `if (rel)` is therefore falsy, and **the entire pruned-prefix and `assets/ui/` block is
  skipped**;
- no other exit condition tests the ORIGIN of a request.

So the gate would print `ALL CHECKS PASS` with that request sitting in the log it just wrote.
`if (rel)` is a same-origin filter, and every off-origin response is exempt from every
URL-based check the gate has.

**The asymmetry**: if the same external request FAILS, for example on blocked egress, the
`requestfailed` handler sets `summary.failed` and the gate does go red. So it is **red when an
external request fails and green when it succeeds**, and the red does not identify the request
as external.

**Why this is escalated rather than filed as a defect.** Two external reviews graded a
requirement PASS on this gate's output file:

- `docs/records/reviews/sources/review3_openai.md:74`, requirement FE1 "Fully static build, no
  external resource loading", graded PASS on *"49 requests, all `localhost:50573`, zero
  third-party domains"*.
- `docs/records/reviews/sources/round2_review1.md:29`, the same requirement, PASS.

And `SUBMISSION_DOSSIER.md:154` cites the gate for zero pruned-path requests and the 25MB
budget. Those two dossier claims are ones the gate genuinely asserts and now genuinely proves.
**A "no external resource loading" claim is not one of them**, and the difference between what
the gate asserts and what a reviewer read it as asserting is a question for the owner and the
Product Owner, not a thing to change unattended at 3am.

**Recorded for the ruling, not as a recommendation**: whether the gate should acquire an
origin assertion, whether the reviewers' FE1 PASS rests on evidence that supports it, and
whether anything else currently proves no external resource loading. The repository does hold
other same-origin evidence, including the `fonts.googleapis.com` grep in `CLAUDE.md`'s
compliance section, and settling which of those is the real proof path is part of the
question rather than something this shard answers.

## 6. Also observed, handed to JOB 2 rather than acted on

`SUBMISSION_DOSSIER.md` records the shipped bundle as **14.80MB, 108 files, 15,515,125
bytes**, attributed to a fresh clone at `7dd83e6a` on 2026-07-26. The build at `b8d8012`
measures **14.99MB, 109 files, 15,721,388 bytes**. The dossier figure is a dated record with
its provenance attached, so it is not stale in the convention (s) sense; but it is introduced
by the words "Current measured size", which is a present-tense claim about a moving value.
Handed to the JOB 2 dossier agent to settle rather than edited here.

`prunedPathHits` in the summary JSON is `failures.length`, which also counts 404s, kept-file
violations under `assets/ui/`, and a runtime fetch of `build-info.json`. The name understates
what it covers. Observation only; nothing is proposed.
