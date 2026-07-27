# Session Report: BASELINE AND METHOD, rulings 4 and 5 plus the CI and kit work (2026-07-28b)

Brief saved verbatim: `reports/briefs/FS_BASELINE_AND_METHOD_Prompt.md`. Fresh session on
`main`, integrator role, explicit paths, one commit per job, no lock exceptions taken and
none needed. Five small jobs, justified per rule 4: four are single-artefact changes and the
fifth is the close.

## JOB 1: rulings 4 and 5

**Ruling 4, TR-088.** Nine non-shipping entries removed from `games/`: the six `0_0_*`
upstream samples, `fifty_fifty`, `template` and the empty `games/__init__.py`, 88 files.
`games/future_spinner/` untouched, and the staged deletion was checked against the four
locked paths to prove it rather than assert it.

**Checked before deleting, and it mattered.** Nothing outside `games/` referenced a sample in
code, `tests/` does not import them, and nothing imports `games.*`, so the package init was
not load-bearing; the locked package's `run.py` imports bare and runs standalone. **But one
real dependency existed**: the `Makefile`'s `test_run` iterated `TEST_NAMES`, which was
exactly those six samples. It is REMOVED rather than repointed at `future_spinner`, and the
Makefile records why: **that package is locked and its `run.py` regenerates books and lookup
tables, so a casual `make test_run` would rewrite published, frozen truth.** Repointing it
was the tidy-looking answer and the dangerous one.

**Ruling 5, SA-002 and SA-007: DECLINED**, recorded in both rows.

The record states explicitly that **the verbatim ruling text was not supplied to this
session**, so what is written is not presented as a quotation of Fable. It is the case the
repository's evidence makes, so a reader can see the decision was supported, and it says
plainly that verbatim reasoning supersedes it if supplied. It also records what DECLINED does
NOT mean: the observation stands, the owner-facing page and both document statements stand,
and if a reviewer raises it the answer is already written.

## JOB 2: the CI work, and two wrong assumptions on the way to it

**The brief asked for the browser job to drop from about six minutes toward two, by
caching the Playwright install. The cache works and did not achieve that, and the honest
account of why is worth more than the seconds.**

**Assumption 1, wrong: chromium was the dominant cost.** The cache hits correctly
(`Cache restored from key: ms-playwright-Linux-1.62.0`, 269 MiB) and cuts the install from
about 90 seconds to 12. **The job stayed at 6.4 minutes.** Per-step timings said why: the
gates were 314 seconds of a 380 second job. Caching a 90 second step in a job whose work is
314 seconds was never going to reach two minutes.

**The key is the RESOLVED version, not the range, and that was not theoretical.**
`package.json` says `^1.61.1`; the lockfile already resolves to **1.62.0**. Keying on the
range would have served a chromium build against a different driver from day one, and that
failure mode is a browser which launches and behaves subtly differently.

**Assumption 2, also wrong: splitting the gates one-per-job would give about 2.7 minutes.**
It gave 4.6. **Seven concurrent legs contend for runner resources**, so each runs slower than
it does alone: turbo intensity is 24 seconds of gate work and took 217 seconds wall-clock.
Parallelism on shared runners is not free and does not divide cleanly.

**Measured outcome: 6.4 minutes down to a 2.9 to 4.6 minute range across two runs.** The
spread is runner CONTENTION rather than anything of ours: the same scrim gate took 276
seconds on one run and 173 on the next, so a run is judged against the range and never
against a single remembered number, plus a diagnostic
gain that is arguably worth more than the seconds: a red check now NAMES the gate that
failed without anyone opening a log. Both changes are kept, since the cache is still worth 80
seconds and there are now seven legs paying that saving each.

**The cost is stated rather than hidden**: each leg repeats about 60 seconds of setup, so
total runner minutes go UP while wall-clock goes down. The right trade on a public repository
where runner minutes are free and a person waiting on a push is not.

Durations are recorded **beside rule 10 in `CLAUDE.md`** as well as in the workflow header,
with **both wrong assumptions kept on the record**, because the useful knowledge is which
levers did not work.

## JOB 3: kit V7 and the clean-baseline visit

Built from a fresh clone at `6e9e4739`, frontend only, single use, 110 files, 15,612,453
bytes, all dist gates run IN THE CLONE.

**V7 rather than another V6, a deliberate deviation from the brief's wording.** V6 exists at
`14b6506d` and predates the entire locale pass, the count-up fix and the casing fix.
Rebuilding "V6" with different contents is exactly the stale-artefact confusion TR-062 is
about; kits are versioned because they are single use.

**PART 9f, the clean-baseline visit**, and every earlier part is now marked superseded. What
makes it different: every previous visit ADDED to what the portal held; this one
**RECONCILES**. The owner is told to drag in the FULL kit contents rather than a subset,
because a partial import can only add and replace and can never remove a file that should not
be there. The sync dialog is screenshotted BEFORE confirming, because its four numbers are
the only record of what the portal actually held, and that has surprised us once: the first
upload handed the portal 108 files and it stored 104, dropping four silently.

**And the one capture that is the point of the visit**: after publishing, read the build
commit SHA from the console boot line or `build-info.json` and screenshot it. Front V2 is the
last confirmed publish and five kits have been built since, so **every fix in the last four
sessions is of unknown liveness**. The walkthrough says plainly that ANY SHA closes it: the
value is not matching a particular build, it is that the repository stops inferring.
`OWNER_CHECKLIST.md` carries it as item 1b, named as the highest-value single action.

## JOB 4: the full audit method

`docs/skills/FULL_AUDIT_METHOD.md`, owner-ordered, named from `WRS_MASTER_DOCUMENT.md`
section 7b as the standard pre-submission analysis for every title. Section 7b owns the ORDER
of a next title and had no step for this at all.

It carries the two layers, the six rules that stop an audit producing confident wrong
answers, the two named patterns (the frozen-debt ratchet and seeded self-tests), the measured
sizing figures, and **the failures honestly**, because a method document recording only what
worked teaches nothing: the wrong search instrument that produced an over-claim, the
read-only pass that dirtied five evidence files, the parked list that called itself complete
while its instrument was blind, and the two gate false positives that were design flaws
rather than exceptions.

**It names waves 2 to 5 as NOT YET RUN for this title**: audio, social-mode capture,
accessibility, animation quality, each with why it matters.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort, integrator on `main`.

**The four gap audits run as sized jobs at the start of a fresh allowance**, per convention
(r) and the owner's instruction. Do not start one on the last quarter of a budget: a partial
audit produces an unverified findings list, which is the most dangerous artefact this project
can generate. Suggested order by value: **audio first** (largest wholly unexamined surface,
every row model-generated against a platform page that warns about exactly that), then
**social-mode capture** (a distribution target has been blocked on it once), then
**accessibility**, then **animation quality**.

**Fable's next turn is his, not a session's**: the polish review of
`reports/screens/polish-review-2026-07-27/` and ratification of
`docs/records/reviews/round3_reviewer_prompt_DRAFT.md`, whose section E lists five
sub-decisions.

**Open threads.** TR-090, two proof scripts still writing into committed evidence, is the
last unruled item from the audit and is a one-pass fix. TR-075, the Cruise wallet delta,
remains the only open money item and is an owner action. The sentence-case half of the
hardcoded-string class stays parked at `docs/QUALITY_CHARTER.md` 4.3, whose completeness
claim was corrected.

**Alternatives tried and rejected.**

- *Repointing `make test_run` at `future_spinner`.* Rejected: it regenerates frozen lookup
  tables.
- *Rebuilding the kit as V6.* Rejected: different bytes under a used version name is the
  TR-062 failure.
- *Keying the chromium cache on the `package.json` range.* Rejected on inspection: the
  lockfile already resolves to a different minor.
- *Quoting reasoning for the SA-002 decline that was not supplied.* Rejected under convention
  (l.7) and (m); the repository's own case is given instead and labelled as such.

---

## Rule 10 closing

**Final push, run 30281912392 on `bb8eecc`, GREEN on all eight jobs.**
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30281912392

    static gates                    79s      browser: contrast            84s
    browser: win count-up steady    65s      browser: turbo intensity    100s
    browser: layout fit             92s      browser: paytable card fill 121s
    browser: splash calm           155s      browser: scrim coverage     173s

This is the first run on the new matrix that is also the closing run, so it doubles as the
second measurement of it. **Wall-clock 2.9 minutes against 4.6 on the run before**, same
code, same cache state: the spread is runner contention and nothing of ours. A run is judged
against the range, never against a single remembered number.

**Three earlier runs this session, all accounted for.** 30280020957 on `4ca9654` green, the
cache MISS that populated `ms-playwright-Linux-1.62.0`. 30280722398 on `6639c2d` green, the
first cache HIT, which is the run that proved the cache worked and the assumption behind it
did not. 30281432163 on `09f3cea` green, the first matrix run. No cancellations, no reds.
