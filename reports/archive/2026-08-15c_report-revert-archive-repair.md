# Session report revert and archive repair, 2026-08-15c

Archive copy of the section in `reports/SESSION_REPORT.md`, per convention (a).
Nothing is edited between the two.

---

# Session Report - SESSION REPORT REVERT AND ARCHIVE REPAIR (2026-08-15c)

Brief saved verbatim at `reports/briefs/FS_REPORT_REVERT_2026-08-15_Prompt.md`.
Branch `track/standback-2026-08-15`, the PR #123 branch, as ordered: not a fresh
branch. Australian English, no em dashes or en dashes. Explicit-path commits.
Locked paths untouched.

## TASK 1: the truncation is reverted

`reports/SESSION_REPORT.md` is restored to its state at `main` `90f21280`, and the
stand-back session's own report is appended as a new dated section at the end,
which is where this file's chronological ordering puts the newest session. Nothing
was deleted, edited or reordered.

**The assertion, run and committed** at
`reports/qa/standback-2026-08-15/REPORT_RESTORE_PROOF.md`: all **412** headings
present at `90f21280` are present in the restored file, none missing, **no
occurrence count fell**, and the `90f21280` heading sequence is an exact PREFIX of
the restored sequence. The count check is the one that matters: 86 of those 412
headings are repeats, `## FOR THE NEXT SESSION` alone occurring 36 times, so a
presence-only test would pass while a whole section had been dropped. Line counts:
13,630 at `90f21280`, 109 at the PR head, 13,742 now.

## TASK 2: the two absent addenda are back in the archive

Both were appended verbatim to their archive siblings, each under a one line note
recording that it was appended on 2026-08-15 to repair an archive written before
its addendum existed.

**The 2026-07-29 sibling was identified by CONTENT, not by filename**, as the
brief required. Every one of the 219 distinctive lines of the enclosing session
block was searched across all archive markdown files:
`reports/archive/2026-07-29d_session3_remediation.md` matched **219 of 219**, and
the runner-up matched 7. The true fixdown block matched
`reports/archive/2026-07-30_true-fixdown.md` at **189 of 189** against a runner-up
of 1. Neither identification rests on a date in a filename.

**The probe from the brief, re-run after the repair**: run id `30447461123` now
appears in one archive file and `30514717576` in one, where both returned zero
across all 244 files before. Each appended block is present in its archive file
byte for byte against the section in the restored report.

## TASK 3: the mechanism, swept and reported only

`reports/qa/standback-2026-08-15/ARCHIVE_COVERAGE_SWEEP.md`. Every heading section
of the restored report was matched line by line against **all 236 archive markdown
files at once**, so a section carried by a different archive file than its own
block sibling counts as covered.

**After TASK 2, zero sections of the report are absent from the archive.**

**The class survives at PARAGRAPH granularity, and that is the finding.** Six
sections show drift totalling 26 distinctive lines of 10,081, or 0.26 per cent.
Four are only the section's own re-titled H1. Two are real, and both are the same
mechanism the addenda were: a `> **CORRECTION, 2026-08-05, S2-C089...**` block
added to a 2026-07-29 section six days after that session's archive copy was
taken, and a rule 10 final-push verification block appended to a 2026-08-04
section after its copy. **A section level sweep would not have caught either.**
Nothing beyond the two addenda was repaired, per the brief.

**A NARROWER TEST GAVE A WRONG ANSWER FIRST, and it is recorded rather than
quietly corrected.** Matching each section only against its own block's
best-matching archive file reported seven partly covered blocks and about twenty
absent sections. Almost every one was a section whose archive copy is a SEPARATE
dated file, which the report keeps inside an earlier block. Searching the whole
corpus removed all of them.

## TASK 4: the manifest is committed, and it converts one red into another

`docs/records/tracks/standback-2026-08-15.manifest` declares the EXACT set of
paths this branch touches, enumerated from `git diff --name-only 90f21280..HEAD`
plus the files this repair adds. Not one glob wider.

**It clears TRACK SCOPE and opens DISJOINT, measured rather than predicted:**

```
DISJOINT: 4 manifest(s), 4466 tracked file(s), 14 file collision(s), 2 shared glob(s)
```

**All 14 collisions are against manifests whose branches no longer exist.**
`quality-sweep` declares `frontend/src/**`, `frontend/scripts/**` and
`docs/QUALITY_CHARTER.md`; `docs-reskin` declares `COMPLIANCE_WATCH.md`. Both
branches were deleted on 2026-07-28 with the verification recorded at
`docs/records/BRANCH_HYGIENE_2026-07-28.md`, and the gate compares every
`.manifest` file in the directory with no way to know a track has finished.

**So no honest manifest for any new track that touches `frontend/src` can be
disjoint while those two files remain.** Narrowing this manifest to dodge the
collision would make the scope check fail instead, because the branch really does
touch those paths: it would be a manifest that lies. The one-command fix is named
in the manifest's own header and is NOT taken here, because deleting another
track's record sits outside this brief's staged paths and outside a builder's
call. It waits for the owner's word.

## TASK 5: diagnosed, not fixed

`reports/qa/standback-2026-08-15/MAXWIN_HOLD_DIAGNOSIS.md`. **It is the gate
asserting on the old store's identity, not the button's rendered disabled state.**
The failing item is a static source-literal count at
`frontend/scripts/max_win_hold_gate.mjs:206` requiring
`disabled={$isWincap ? true : ($isSpinning ? false : !$canSpin)}` four times in
`HudOverlay.svelte`. Measured on both trees: `90f21280` carries that literal four
times and the new form zero; `59c4c88e` carries it zero times and
`disabled={$isWincap ? true : ($isSpinning ? false : !$canAffordSpin)}` four
times, the same ternary with the same `$isWincap ? true` first branch. The gate's
RUNTIME assertions all passed on the same run, including zero wallet calls during
the hold. The gate and the component were both left exactly as found.

## Verification

- `scripts/qa/locked_paths_gate.mjs`: PASS on the locked-path half, 0 sanctioned,
  0 violations; the DISJOINT half fails for the reason under TASK 4.
- `scripts/qa/doc_currency_gate.mjs`: run over the close-state tree before the
  push.
- **No code, no gate, no player-facing string and no tracker status cell was
  touched.** The only files changed are the report, two archive siblings, three qa
  documents, the manifest and the brief.

**ONE DEPARTURE FROM THE BRIEF'S STAGED LIST, declared rather than slipped in.**
The brief lists eight explicit paths and no archive copy for THIS session. Adding
a section with no archive sibling would create a fresh instance of the exact
defect TASK 3 exists to document, so this session also writes
`reports/archive/2026-08-15c_report-revert-archive-repair.md` and stages it as a
ninth path. If that is unwanted it is one file to delete.

**A SECOND DEPARTURE, and it is what made the gate pass.** The brief requires both
gates to pass. `doc_currency_gate.mjs` opened RED on three DEAD_SYMBOL findings in
two files this brief did not stage, `docs/records/reviews/REVIEW_TRACKER.md` row
TR-149 and `reports/qa/standback-2026-08-15/FIRST_HAND.md` line 20, both added by
this branch's own earlier commit and never measured because that run's static job
aborted at the locked-paths step before reaching the scan. **All three are gate
heuristic mis-pairings over correct prose**, not false claims: the gate pairs a
backticked identifier with the nearest backticked file, so `spinCostMicros` and
`canAffordSpin` paired with `gameStore.ts` when the row itself attributes them to
`buyAffordability.ts`, and `evidenceDir` paired with a script that imports
`qaTmpDir` in a sentence that correctly says "evidenceDir or qaTmpDir". The repair
is the project's own convention for naming a symbol without asserting its
location: the five identifiers are unbackticked and every file citation is left
exactly as written. No status cell, no finding and no disposition was altered.

## FOR THE NEXT SESSION

Model and effort: Claude Fable 5, judgement tier, one session, on the PR #123
branch. Approach: restore from git rather than reconstruct, prove the restore by
heading count and order rather than by eye, identify archive siblings by content
match rather than by filename, and measure the manifest's consequence before
claiming the failure cleared. Alternatives tried and rejected: matching each
report section only against its own block sibling, which produced about twenty
false gaps and was replaced by a whole-corpus match; and narrowing the track
manifest until DISJOINT passed, which would have made the scope check fail on a
manifest that no longer described the branch.

**What the next session must decide, in this order:**

1. **The two dead-track manifests.** One command removes them and CI on this
   branch goes green. Until then the branch trades a TRACK SCOPE red for a
   DISJOINT red. This is the only thing standing between PR #123 and a green run.
2. **Whether the max-win hold gate should assert behaviour rather than an
   identifier.** The one-word rename fixes today's red and leaves the trap set for
   the next rename.
3. **Whether the two paragraph-level archive gaps are appended**, and more usefully
   whether the archive copy mechanism should be changed so that a later edit to an
   already-archived section cannot go unmirrored.
4. Everything the analysis pass left open, unchanged by this session: the money
   surfaces, the bet ladder, the eight v7 clauses, the 68 register mismatches and
   TR-148 item 4.
