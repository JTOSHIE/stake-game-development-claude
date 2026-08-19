WE ROLL SPINNERS: SESSION REPORT REVERT AND ARCHIVE REPAIR

Branch: track/standback-2026-08-15, the PR #123 branch. Do NOT branch fresh.
Australian English. No em dashes or en dashes anywhere, including in committed
documents. Commits stage explicit paths only, never git add -A, never commit -a.
Locked paths untouched: rgsService.ts, gameStore.ts, games/future_spinner/,
.claude/settings.json.

CONTEXT
PR #123 replaced reports/SESSION_REPORT.md with a 109 line per-session report,
a diffstat of 81 over minus 13,602. The analysis pass then proved the archive
does not cover it: of three ADDENDUM sections in the replaced file, the
2026-07-29 parked-fix-batch addendum is archived, and the two rule 10 addenda
are not. Fable independently confirmed this by probing run ids 30447461123 and
30514717576 against all 244 archive files, zero hits, and by reading
reports/archive/2026-07-30_true-fixdown.md which ends on its numbered items 6
and 7, stopping immediately before its own addendum. 50 line citations elsewhere
in the repository point above line 109.

TASK 1: revert the truncation
Restore reports/SESSION_REPORT.md to its state at main 90f21280, then append the
stand-back session's own report as a new dated section at the position the file's
existing ordering dictates. Do not delete any pre-existing section. After this
task the file must contain every heading present at 90f21280 plus the stand-back
section. Verify by extracting all headings at 90f21280 and asserting each is
present in the new file; commit that assertion output to
reports/qa/standback-2026-08-15/REPORT_RESTORE_PROOF.md.

TASK 2: repair the archive for the two absent addenda
Append the missing addendum sections verbatim to their archive siblings:
  reports/archive/2026-07-30_true-fixdown.md
  and the archive sibling of the 2026-07-29 session that carries the
  "ADDENDUM: REMOTE CI AND OWNER PREVIEW, per rule 10 and rule 12" section,
  which you must identify by content match rather than by filename guess.
Mark each appended block with a one line note stating it was appended on
2026-08-15 to repair an archive that was written before its addendum existed.
Then re-run the probe from CONTEXT and prove both run ids now appear in the
archive. Commit the proof to the same REPORT_RESTORE_PROOF.md.

TASK 3: close the mechanism, do not just patch the instances
Sweep every file under reports/archive/ against its corresponding section in the
restored reports/SESSION_REPORT.md and report any other section present in the
report but absent from its archive sibling. This is a REPORT ONLY step for
anything beyond the two addenda above: list what you find, repair nothing else,
and write the list to reports/qa/standback-2026-08-15/ARCHIVE_COVERAGE_SWEEP.md.

TASK 4: the track scope manifest
Commit the scope manifest the static gates job requires for a track/ branch, so
that failure clears. Scope it to exactly the paths this branch touches. Do not
widen it.

TASK 5: diagnose, do not fix
Diagnose the browser: max-win hold failure on run 31815432853 and state in one
paragraph whether it is caused by the canSpin to canAffordSpin change or by the
gate asserting on the old store's identity rather than on the button's rendered
disabled state. Write the diagnosis to
reports/qa/standback-2026-08-15/MAXWIN_HOLD_DIAGNOSIS.md. DO NOT change the gate
and DO NOT change the component. If the fix is obvious, say what it is and stop.

STOP LINE: close after these five tasks. Do not touch any other finding from the
analysis pass, do not change any tracker status cell, do not alter any player
facing string, and do not wire any gate.

COMMIT
Stage explicit paths only:
  reports/SESSION_REPORT.md
  reports/archive/2026-07-30_true-fixdown.md
  <the identified 2026-07-29 archive sibling>
  reports/qa/standback-2026-08-15/REPORT_RESTORE_PROOF.md
  reports/qa/standback-2026-08-15/ARCHIVE_COVERAGE_SWEEP.md
  reports/qa/standback-2026-08-15/MAXWIN_HOLD_DIAGNOSIS.md
  <the track scope manifest at its required path>
  reports/briefs/FS_REPORT_REVERT_2026-08-15_Prompt.md (this brief, verbatim)
Message first line: session report restored, archive repaired, track scope added
Run scripts/qa/locked_paths_gate.mjs and doc_currency_gate.mjs; both must pass.
Push to the PR #123 branch, which produces a CI run because #123 is open, and
record it per rule 10. End with a FOR THE NEXT SESSION block.
