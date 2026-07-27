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

## JOB 2: the chromium cache, and what a normal run costs

**The key is the RESOLVED version, not the range, and that was not theoretical.**
`package.json` says `^1.61.1`; `package-lock.json` already resolves to **1.62.0**. Keying on
the range would have served a chromium build against a different driver from day one, and
that failure mode is a browser which launches and behaves subtly differently, far worse than
a slow job.

On a miss the job does exactly what it did before, so the worst case is the old behaviour. On
a hit the binary is restored but the OS libraries are not, because those install into the
system rather than the cached path, which is why the hit path still runs `install-deps`.

**Measured:** the first run after landing it took 6.4 minutes, because a first run is by
definition the miss that POPULATES the cache. The cache saved as
`ms-playwright-Linux-1.62.0`, 269 MiB. The hit is proven on the next run, recorded in the
rule 10 closing below.

Durations are now recorded **beside rule 10 in `CLAUDE.md`** as well as in the workflow
header, because rule 10 asks every session to check its own remote result, so that is where
someone reads them: static about 90 seconds, browser 2 to 7 minutes, **both ends normal**.

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
