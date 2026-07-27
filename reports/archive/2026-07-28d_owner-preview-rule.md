# 2026-07-28d: THE OWNER PREVIEW RULE

**Brief:** `reports/briefs/FS_OWNER_PREVIEW_RULE_Prompt.md`, saved verbatim and committed with
JOB 1 per conventions (b) and (f).

**Posture:** on `main`, integrator, explicit paths, no lock exceptions taken and none needed.

**The owner's order, in his own words:** *whenever main changes, the owner's local copy is
already fresh, never stale, never his job to refresh.*

## The printed version line, which is the proof the mechanism works

```
OWNER PREVIEW  |  Front V8 line, main  |  commit dde20e8  |  built 2026-07-28T08:11:51+10:00  |  started 2026-07-27T22:12:37.652Z  |  http://192.168.4.92:5173
```

Verified rather than asserted, because a script that prints a URL has not proved the URL
works: `http://192.168.4.92:5173/` answers **HTTP 200** with `<title>Future Spinner</title>`,
`/src/main.ts` answers 200 from this checkout's own module graph, and exactly one vite process
is running.

## JOB 1: the canonical owner preview

`scripts/owner_preview.mjs` plus `npm run owner:preview`. Stops the previous instance,
hard-syncs the primary checkout to `origin/main`, installs only if the lockfile moved, starts
the dev server on the LAN at the port the owner already uses, waits for ready, prints one line.

**Four refusals, each verified rather than asserted.**

- **It will not kill a process it did not start.** The pidfile carries the pid AND the process
  start time as the kernel reported it, and both must match before anything is signalled.
  Tested by adopting a decoy, falsifying the recorded start time, and confirming **the decoy
  survived** and the stale record was discarded instead. Pids are recycled; a script that
  guesses at processes eventually kills someone else's.
- **It will not touch a dirty tree.** Tested with a probe file: refused, printed every path,
  changed nothing. It then refused a second time for real, on my own uncommitted fix, which is
  the best kind of test because nobody arranged it.
- **It will not run in a worktree**, checked by comparing `--git-dir` against
  `--git-common-dir` rather than by a path allowlist, so it stays true if the repository moves.
- **It will not leave anything half-started.** A failure after the server spawns reaps it and
  clears the pidfile before exiting non-zero.

**Idempotent, and that is the whole promise.** Two runs back to back: the second stopped pid
720, started 1043, and left exactly one vite and a live address.

## THE FIRST RUN FAILED, AND THAT IS THE PART WORTH KEEPING

The server came up, answered the readiness probe, printed its version line, and then **died
the moment the script exited**. The owner would have opened the address and found nothing,
with a green log saying it had worked. Two causes:

- **stdio was a pipe to the parent.** A detached child whose stdout is a pipe gets that pipe
  closed when the parent exits, and the next write kills it. It writes to a log file fd it
  owns outright now.
- **it was spawned through `npm run dev`**, making `npm` the tracked pid with the real server
  underneath it. **That is precisely the wrapper-orphans-the-child shape TR-101 was about,
  reintroduced within hours of removing it.** Vite is spawned directly now, so the pid in the
  pidfile IS the server.

The lesson is not the two bugs, it is that **printing a URL is not evidence the URL works**.
The check that caught it was curling the owner's actual address, which is now part of the
close rather than something I happened to do.

## JOB 2: rule 12

Appended to the MULTI-TRACK PROTOCOL in `CLAUDE.md`, mirrored in `WRS_MASTER_DOCUMENT.md`
section 3e as row 12, and added to convention (a)'s session-close text.

A session that lands on `main` runs `owner:preview` **before** the session report and pastes
the printed line into it. Before, not after, because the line is evidence and a report written
first is describing an intention. Track sessions never touch it. If it cannot be refreshed,
the report says so in its own line, because **a preview nobody has said is stale is worse than
no preview: the owner trusts it.**

## JOB 3: the ancestor folded in

The `vite --host` dev server that had been running since the background-test session, pid
24622 and 1 day 9 hours old, was adopted through `--adopt` so the normal stop path retired it,
rather than killed behind the script's back. That is the rule's own discipline applied to the
one process that predated the rule.

`OWNER_CHECKLIST.md` gains **item zero**, which is a promise rather than a task: the preview
is always latest main after any session closes, and a SHA disagreeing with the newest session
report is ours to fix rather than his to debug.

## Self-audit against the brief

| The brief asked | Done |
|---|---|
| Brief saved verbatim to `reports/briefs/` and committed | Yes, with JOB 1 |
| On main, explicit paths, no em or en dashes, no lock exceptions | Yes, verified zero dashes in every file written |
| Primary checkout only, never a worktree | Yes, by git-dir inspection |
| Stops only its own previous instance, by pidfile, never guessing | Yes, and the recycled-pid guard is tested |
| Refuses a dirty tree, reports rather than discards | Yes, twice, once unplanned |
| Installs only if the lockfile changed | Yes |
| LAN host, fixed port 5173, waits for ready | Yes, and the address is curled to prove it |
| One trustworthy line: version, SHA, build date, URL | Yes, quoted above |
| Rule 12 in CLAUDE.md, mirrored, and in the close checklist | Yes |
| Ancestor folded in via the adoption path | Yes, pid 24622 |
| Two lines in OWNER_CHECKLIST item zero area | Yes, as item 0 |

**One judgement recorded:** the version label reads `Front V8 line, main`. It is derived from
the walkthrough's live PART heading, which `kit_build.mjs` already keeps current per kit
(TR-100). It names the kit GENERATION, not a claim that this exact commit was kitted; the SHA
on the same line is the exact identity and is the field item zero asks the owner to compare.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort, integrator on `main`.

**Rule 12 now binds every session that lands on main.** Run `npm run owner:preview` before
writing the report and paste the printed line into it. It takes about fifteen seconds when the
lockfile has not moved.

**Open threads unchanged from the player-experience pass:** TR-096 (the infinite-autoplay
option failing open under a jurisdiction cap, pre-existing, escalated per convention (l.8)),
TR-097 (two more scripts writing into committed evidence), TR-098 (the layout fit gate's
silent element fallback), TR-093 (one sentence in the quality charter). Kit V8 is built and
waiting on the owner's PART 9g visit, whose LOOK half is the live confirmation TR-099 needs.

**Alternatives tried and rejected.**

- *Killing the old dev server directly.* Rejected: the brief asked for the adoption path, and
  it is the better answer anyway, because it exercises the mechanism that will retire every
  future instance instead of making this one a special case.
- *Keeping `npm run dev` and tracking the npm pid.* Rejected after it failed: it recreates the
  wrapper-orphans-the-child problem TR-101 had just removed.
- *A version label naming a specific kit.* Rejected: the preview tracks `main`, which moves
  ahead of the last kit, so a label claiming `Front V8` would go quietly wrong. It names the
  generation and the SHA carries the identity.
