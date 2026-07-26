---

## 2026-07-26g: MULTI-TRACK PROTOCOL V2, integrator session

Brief saved verbatim: `reports/briefs/FS_MULTITRACK_PROTOCOL_V2_Prompt.md`
(`8771040`). It supersedes `FS_MULTITRACK_PROTOCOL_Prompt.md`, which was never
run and does not exist in this repository, so there was nothing to retire.

**This session held the INTEGRATOR role and ran on `main`.** All five jobs
complete. No lock exception, and no locked path was touched: `rgsService.ts`,
`gameStore.ts`, `games/future_spinner/**` and `.claude/settings.json` all
untouched, verified by the gate itself over the session's own commit range.
Explicit paths on every commit.

### What landed, by job

| Job | Result | Commit |
|---|---|---|
| Brief saved verbatim | DONE | `8771040` |
| 1, record the protocol | **DONE**, CLAUDE.md and WRS_MASTER_DOCUMENT.md 3e | `828c9df` |
| 2, the scope gate | **DONE**, with 6 new seeded cases | `1e9cb69` |
| 3, the owner's second visit, on main | **DONE** | `f863f6a` |
| 4, open two parallel tracks | **DONE**, proved disjoint | `7bc4ecd` |
| 5, the retro mechanism | **DONE**, WRS_MASTER_DOCUMENT.md 3f | `828c9df` |

### JOB 1 and JOB 5

The eight protocol rules are recorded verbatim in intent in CLAUDE.md beside THE
STANDING MANDATE, and mirrored in `WRS_MASTER_DOCUMENT.md` as new section 3e,
with 3f carrying the retro mechanism and a change-log entry.

Rule 5's model policy cites the twice-failed escalation rule to
`CLAUDE_PROJECT_INSTRUCTIONS_v7.md`, where it already exists as "a brief failing
its gates twice escalates one tier", rather than restating it from memory.

The retro mechanism is recorded with its reasoning rather than as a bare
instruction: a single polish pass over everything is how polish becomes uniform
and shallow; **up to** three means fewer than three is a legitimate and stronger
outcome than padding; and each nomination carries the measurement that justified
it, so a redo session starts from a stated deficiency rather than from an
instruction to make something nicer.

### JOB 2, and what "provably" had to mean

The locked-paths gate now carries both rules, because both answer the same
question from the same input: did this change touch something it had no business
touching?

The glob language is deliberately small: an exact path, a trailing slash for a
directory, `**` for any depth and `*` for one segment. A manifest is a scope
declaration a human has to read and agree is disjoint from another one, and
negations and character classes make that judgement harder rather than easier.
Anything it cannot express is a sign the scope wants splitting.

Six new seeded cases, all against a real branch with a real committed manifest
and real commits. The one worth naming is **a directory glob must not match a
same-prefixed sibling**: `docs/records/tracks/` must not also match
`docs/records/tracksX/`. That is the classic off-by-one in prefix matching and
it is the one a hand-written matcher gets wrong.

Two defects found by running it rather than reading it: the branch name arrived
untrimmed, and both gate steps sat before `Set up Node` in the workflow, so they
would have run on whatever Node the runner image happened to ship.

### JOB 3, and two things beyond the letter

PART 9 of the walkthrough, in its established voice, with the four safety facts
restated rather than assumed to be remembered from the first visit.

`math/HASHES.txt` was verified against the owner's own capture 03 rather than
taken from the brief: it is the first Math row, **2.82 KB, in a list of 13**. The
walkthrough names the size, because it is the only unambiguous way to pick it
out when every other Math file is megabytes or a `.json`, and it says twice that
nothing else in Math is touched.

**The FEATURE PRICE step says plainly that the price can exceed the win**, and
that seeing a big green win beside a bigger price is the line working rather than
a bug. That is the exact thing that confused the owner in the first place, and a
confirmation step that did not say so would invite the same report again.

Two additions beyond the letter of the brief, both to stop a foreseeable mistake,
and both flagged here because they are additions:

1. **The tile images are re-provided in the kit as `03_branding/`.** The only
   other copy sits inside `~/Desktop/FS_UPLOAD_KIT/`, which is DEAD and which the
   walkthrough tells the owner to bin. Pointing at a folder we have just told
   them to delete is how the wrong thing gets uploaded. This follows the live
   parent brief's JOB 7 step 4, which said the tile images are re-provided inside
   kit V3; it sits against JOB 5's "only `02_frontend_upload/` and a README", and
   the two are reconciled by the kit README saying twice that `03_branding/` is
   for the tile editor and is never uploaded as Front End.
2. **The walkthrough itself is copied into the kit**, because the owner needs
   Part 9 beside the files rather than in a repository they are not reading at
   the time.

Both are done by `kit_build.mjs` from the CLONE, not by hand, so convention (o)
holds for every byte in the kit rather than only for the bundle. That is also why
the builder was edited at all: the README is generated, so a manual edit would
have been silently undone by the next build.

### JOB 4, and two conflicts in the declared manifests

Both were resolved in the open rather than silently, per the obligation
convention (n) sets.

**1. Both manifests declared `docs/records/tracks/`, the whole directory.** Rule
3 in the same brief says parallel tracks require provably disjoint scopes and
that overlap forces sequence, so as written the two tracks could not have run in
parallel at all. Narrowed to each track's own manifest file. Neither track needs
the directory: both manifests and both briefs are committed on `main` by the
integrator before either track starts.

**2. Neither manifest included `reports/`,** while rule 8 requires track session
reports and convention (a) requires one of every session. A track literally could
not have written its report. Resolved with `reports/tracks/<track>/` rather than
by sharing `reports/SESSION_REPORT.md`: disjoint by construction, and it is what
makes rule 8's "resolve report conflicts by concatenation" mechanical instead of
a merge argument, because two tracks appending to one file collide on every pull
request and the pressure at a collision is always to drop one side.

**The disjointness proof.** `--check-disjoint` proves it over **every file git
tracks, 2,488 of them**, plus a pairwise literal-glob comparison, and re-proves
itself on every CI run so a manifest widened later is caught the day it is
widened rather than at the merge that discovers two tracks edited one file. Its
blind spot is stated rather than hidden: a file that does not exist yet could
match two manifests, which is what the literal comparison is for.

Its first seeded case is not hypothetical. It plants **the brief's own overlap**,
both tracks claiming `docs/records/tracks/`, because that is a real overlap
written by hand in a real brief and it is precisely what the check exists to
catch.

Result on the real tree: **2 manifests, 2,488 tracked files, 0 file collisions,
0 shared globs.**

### Gate results at HEAD

| Gate | Result |
|---|---|
| locked paths, track scope and disjointness self-test | **PASS**, **18 of 18** cases, 0 missed |
| track manifests are disjoint | **PASS**, 2,488 files, 0 collisions |
| locked paths over this session's range | **PASS**, 0 sanctioned, 0 violations |
| kit builder self-test | **PASS**, 5 of 5 |
| `npm run check` | **PASS**, 0 errors at the committed 36-warning baseline |
| typecheck baseline, dead wiring | **PASS** |
| locale completeness plus its seeded self-test | **PASS** |
| dash gate, self-test and source | **PASS** |
| dist hygiene, including the build-stamp reconciliation | **PASS** |
| a11y social terms | **PASS** |

Two new CI steps: **track manifests are disjoint**, and the existing gate 0 step
renamed and given `GITHUB_HEAD_REF` so it can see a pull request's source branch.

### Self-audit against the brief and the conventions

- Brief saved verbatim to `reports/briefs/` and committed first, convention (f).
- Explicit paths on every commit, never `git add -A`, convention (k).
- No em or en dashes authored anywhere, checked per file.
- No lock exception, and the gate independently confirms no locked path was
  touched across `ea334fd..HEAD`.
- Every new check ships a seeded self-test whose seed is the form the defect
  really takes, convention (p). The disjointness seed is the brief's own overlap.
- Two conflicts inside the brief were surfaced and reasoned about rather than
  quietly resolved in one direction, per convention (n)'s stated obligation.
- This was a five-job session, and protocol rule 4 says a multi-job session
  justifies itself in its report. **The justification: JOB 3 was explicitly
  ordered to land on main immediately, and JOBs 1, 2 and 4 are the machinery that
  has to exist before any track can start.** Splitting them would have left the
  tracks unable to open and the owner's portal visit blocked behind a session
  boundary. The tracks themselves are one job each, which is the shape rule 4 is
  actually protecting.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5, high effort, integrator session on `main`.

**Approach.** The protocol was written first and then obeyed, including where it
made the brief's own manifests illegal. Where the brief and its own rules
disagreed, the rule governed and the deviation is recorded above with its
reasoning, rather than the manifests being copied verbatim into a state that
could not pass the gate the same brief commissioned.

**Alternatives tried and rejected.**
- Copying both manifests verbatim, including the shared `docs/records/tracks/`,
  rejected because rule 3 forbids it and the gate would have failed both tracks
  on their first commit.
- Adding `reports/SESSION_REPORT.md` to both manifests, rejected for the same
  reason: it would have made the two tracks overlap on the single file most
  likely to be edited by both.
- Letting the gate carry a hidden always-allowed set of paths so manifests could
  stay literal, rejected because a gate with hidden allowances is a gate that
  lies, and the whole point of a manifest is that it is readable.
- Creating the two track branches before the final commit, rejected because a
  branch created early is behind by the time the session starts, which is the
  same stale-artefact trap as the dead kit. They are cut from final `main`.
- Pointing the walkthrough's tile step at `~/Desktop/FS_UPLOAD_KIT/03_branding/`,
  rejected because the same document tells the owner to bin that folder.
- Editing the kit's README by hand, rejected once it was noticed that
  `kit_build.mjs` generates it and the next build would have silently reverted it.

**Files touched.** Per commit above; explicit paths throughout.

**THE TWO TRACK BRIEFS ARE READY FOR THE OWNER TO PASTE.** Each is a complete
fenced prompt with its own boot list, manifest and limits:

1. **`docs/records/tracks/docs-reskin_BRIEF.md`**, branch `track/docs-reskin`,
   suggested Opus at High. Covers JOB 6 and JOB 10 of the live parent plus
   bringing the fix list up to this session's commits.
2. **`docs/records/tracks/quality-sweep_BRIEF.md`**, branch
   `track/quality-sweep`, suggested Sonnet at High. Covers JOB 9 of the live
   parent: the charter, the sweep, the fixes and the CI gate.

Both branches are cut from this session's final `main` and pushed, so each
session can check out and start without rebasing. **They can run at the same
time**: their scopes are proved disjoint over the whole tracked tree.

**THE INTEGRATOR RETURNS WHEN THEIR PULL REQUESTS ARE UP.** The integrator's job
at that point, in order: Fable verifies each PR; merge them **one at a time**;
and for each, copy that track's `reports/tracks/<track>/SESSION_REPORT.md` into
`reports/SESSION_REPORT.md` as a dated and track-tagged section, **appending,
never rewriting or dropping a section**, plus the archive copy per convention (a).

**THE OWNER'S SECOND PORTAL VISIT IS UNBLOCKED BY NOTHING.**
`~/Desktop/FS_UPLOAD_KIT_V3/` holds the bundle, the tile images, the walkthrough
and the build stamp. Neither track touches it, so the visit and the two tracks
are independent and can happen in any order.

**Then, after that visit:** Fable's benchmark polish review nominates up to three
surfaces for focused redo sessions, one specialist session each on its own track,
per the retro mechanism now recorded at `WRS_MASTER_DOCUMENT.md` 3f. Then round
three of external review.
