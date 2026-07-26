# track/quality-sweep: the brief

Paste the fenced block below into a **fresh session**. It is complete: it names
its own boot list, its manifest and its limits.

**Suggested model: Sonnet at High**, per the protocol's rule 5. The sweep itself
is mechanical and suite work across a large surface. **Escalate to Opus** if the
charter's authoring turns out to need judgement calls the mandate does not
already settle, and record the escalation in the session report. The twice-failed
rule stands: if a gate fails twice, escalate one tier.

**This brief is already committed at this path.** Convention (f) is satisfied by
the file you are reading, so the session does NOT re-save it to
`reports/briefs/`, which is outside its manifest and would fail the scope gate.

---

```
track/quality-sweep. You are Claude Code, working ONE TRACK of a multi-track
programme for We Roll Spinners' Future Spinner, in a FRESH context.

BOOT by reading, in order:
  1. CLAUDE.md in full. THE STANDING MANDATE is the whole point of this track and
     it binds you: whatever is found gets fixed now, not later; before submission
     there is no minor-defer category, only FIXED or explicitly OWNER-PARKED with
     reasons. Read THE MULTI-TRACK PROTOCOL below it, convention (p) on seeded
     self-tests, convention (l), and the locked files section.
  2. reports/SESSION_REPORT.md, at least the last three dated sections. The
     2026-07-26f section matters most: it records five gates that reported PASS
     while the defect they existed to catch was shipping, and the pattern behind
     all five.
  3. reports/briefs/FS_V3_CONTINUATION_Prompt.md. Your work is its JOB 9, and
     nothing in this brief supersedes it.
  4. docs/records/tracks/quality-sweep.manifest, which is your scope.
  5. docs/records/reviews/REVIEW_TRACKER.md rows TR-059, TR-060, TR-063 and
     TR-072. They are four instances of the same failure and the sweep exists
     because of them.

YOU ARE NOT THE INTEGRATOR. main is single-writer and you do not hold that role.

  - Work on a branch named exactly `track/quality-sweep`, created from main.
  - NEVER push main. NEVER merge to main. Deliver by pull request only.
  - Every path you touch must match a glob in
    docs/records/tracks/quality-sweep.manifest. CI fails otherwise. If you
    believe it needs widening, say so in the PR and STOP rather than widening it
    yourself: it was proved disjoint against track/docs-reskin's manifest and
    widening it can silently end that property.
  - NO LOCK EXCEPTIONS. `frontend/src/**` is in your manifest and it MATCHES two
    locked files, `frontend/src/lib/stores/gameStore.ts` and
    `frontend/src/lib/services/rgsService.ts`. Scope and locks are separate
    questions and both are asked: the same CI gate still fails a commit touching
    either without an owner-sanction token, and you do not have one. The four em
    dashes in gameStore.ts comments STAY PARKED, as recorded in
    LOCKED_FILE_DEBTS. They are comments, they never reach dist, and they are not
    yours to fix.
  - A BULK OPERATION OF ANY KIND EXCLUDES THE FOUR LOCKED PATHS UP FRONT, per the
    recorded near-miss. This is the single most likely way this track goes wrong,
    because a sweep is bulk work by nature and the last bulk rewrite over src/
    wrote to a locked file before its own verification caught it.
  - Explicit paths on every commit, never `git add -A`. No em or en dashes.

YOUR SCOPE, exactly:
  frontend/src/**
  frontend/scripts/**
  .github/workflows/**
  docs/QUALITY_CHARTER.md
  docs/records/tracks/quality-sweep.manifest
  reports/qa/**
  reports/screens/quality-sweep/**
  reports/tracks/quality-sweep/

JOB A, THE CHARTER. Write docs/QUALITY_CHARTER.md. CLAUDE.md's STANDING MANDATE
already points at this path and the file DOES NOT EXIST, so the mandate currently
cites a document that is not there. It carries three things:

  1. The standing mandate itself, quoted verbatim from CLAUDE.md.
  2. The benchmark: Valkyrie-class layout and finish. State what that means in
     checkable terms rather than as an adjective.
  3. The sweep list of machine-tells and unprofessional-finish markers: dash
     typography, straight-versus-curly quote inconsistency, double spaces,
     inconsistent capitalisation across surfaces, mixed decimal or currency
     formats, orphaned placeholder strings, inconsistent button casing,
     mismatched iconography, default-font leakage.

JOB B, THE SWEEP. Run it across every player-visible string and committed
surface, SOURCE AND DIST. Fix everything found, in this pass, per the mandate.

  Known material, already located and deliberately left for you:
    - TR-059's sentence-case English prose, which is the biggest single item.
      `locale_completeness_check.mjs` scans ALL-CAPS literals only, so
      sentence-case prose is invisible to it. Known instances include
      MaxWinCelebration.svelte's "Press COLLECT or hit Enter to continue" and
      ReplayMode.svelte's "Replaying round...". TR-059 estimates roughly thirty
      keys times sixteen locales. If that estimate is wrong, say so with a count.
    - Whether the ALL-CAPS-only limit in that gate should be lifted at all is a
      judgement call: sentence-case prose in markup is much harder to
      distinguish from interpolated content, and a gate that cries wolf gets
      ignored, which that file's own comments already record happening once.
      Decide, and record the reasoning either way.

  Anything you find that is genuinely NOT a defect gets one line of reasoning
  recorded rather than a silent pass, and anything you cannot fix inside your
  scope is PARKED with options per convention (l.6) rather than half-done.

JOB C, THE GATE. Commit a repeatable script for the sweepable subset and add it
to CI. Convention (p) is not optional here and it is the whole lesson of the four
rows you read at boot: PLANT THE EXACT DEFECT THE GATE EXISTS TO CATCH, IN THE
FORM IT REALLY OCCURS, AND PROVE THE GATE GOES RED. A seed in a form the gate
happens to handle, while the real defect occurs in another form, teaches nothing:
that is exactly how the dash gate passed twice over strings it could not see, and
how the locale gate passed over four literals written in the house style. Include
a negative control, because a gate that fails on clean input is useless in a
different way.

  Study `frontend/scripts/dash_gate.mjs` and the repaired
  `frontend/scripts/locale_completeness_check.mjs` first. Both carry seeded
  self-tests in the correct shape, and the second one's comments explain the
  exact regex mistake that made its predecessor blind.

GATES. Before the PR: `npm run check` at 0 errors and the committed 36-warning
baseline; every static gate green; and the browser gates that your changes could
plausibly affect re-run rather than assumed. If a gate needs a build, build first.

CLOSE. Write reports/tracks/quality-sweep/SESSION_REPORT.md as a section that is
BOTH dated AND track-tagged, per protocol rule 8, and include the sweep's
FINDINGS LEDGER: every item found, its disposition (FIXED or OWNER-PARKED with a
reason), and where it was. Do NOT write to reports/SESSION_REPORT.md: the
integrator concatenates track reports into it, and that file is outside your
manifest. End with a FOR THE NEXT SESSION block per convention (i). Then open a
pull request from track/quality-sweep and STOP. Fable verifies before merge; the
integrator merges.
```
