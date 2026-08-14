# Report restore proof

TASK 1 and TASK 2 of `reports/briefs/FS_REPORT_REVERT_2026-08-15_Prompt.md`, run
2026-08-15 on branch `track/standback-2026-08-15`. Australian English, no em dashes or
en dashes.

---

## 1. What was restored, and how

`reports/SESSION_REPORT.md` was replaced by this branch's own 109 line report. It is now
the file as it stood at `main` `90f21280`, with the stand-back session's report appended
as a new dated section at the end, which is where this file's ordering puts the newest
session. **No pre-existing section was deleted, edited or reordered.**

The append point is the end because the file is chronological and appends newest last:
the section immediately above the stand-back block is the R070 addendum of the same day.

## 2. The assertion

Every heading present at `90f21280` is asserted present in the restored file, by exact
text, by OCCURRENCE COUNT and by ORDER. The count check matters because 86 of the 412
headings are repeats (`## FOR THE NEXT SESSION` alone occurs 36 times at `90f21280`), so
a presence-only test would pass while a whole section had been dropped.

```
THE ASSERTION, run 2026-08-15 on the restored file

headings at 90f21280            : 412 (326 distinct)
headings in the restored file   : 421 (331 distinct)

headings present at 90f21280 and ABSENT from the restored file : 0
headings whose OCCURRENCE COUNT fell : 0

headings NEW in the restored file (the stand-back section) : 5
   NEW # Session Report - stand-back project audit (2026-08-15)
   NEW ## Plan of record (posted before the first expensive spend)
   NEW ## Owner attention
   NEW ## Surfaces not swept
   NEW ## Self-audit
   COUNT ROSE 8 -> 9  ## Verification
   COUNT ROSE 36 -> 37  ## FOR THE NEXT SESSION
   COUNT ROSE 2 -> 3  ## What ran
   COUNT ROSE 1 -> 2  ## What changed

ORDER CHECK: the 90f21280 heading sequence is a PREFIX of the restored sequence: True

VERDICT: PASS, every heading at 90f21280 survives, in order, and the stand-back section is appended after them

line counts: 90f21280 13630, PR head 59c4c88e 109, restored 13742
```

## 3. TASK 2, the two absent addenda

The two sections the analysis pass and Fable independently found missing from the archive
were appended verbatim to their archive siblings, each under a one line note recording
that it was appended on 2026-08-15 to repair an archive written before its addendum
existed.

**The 2026-07-29 sibling was identified by CONTENT, not by filename.** Every distinctive
line of the enclosing session block (the 219 lines of at least 30 characters between the
block's own H1 and the addendum heading) was searched for across all archive markdown
files:

| Candidate | Distinctive lines matched |
|---|---|
| `reports/archive/2026-07-29d_session3_remediation.md` | **219 of 219, 100 per cent** |
| `reports/archive/2026-07-29_session2_audit_register_and_proof_coverage.md` | 7 of 219, 3.2 per cent |
| every other archive file | 1 or 0 |

The same test on the true fixdown block returned
`reports/archive/2026-07-30_true-fixdown.md` at 189 of 189, 100 per cent, with the
runner-up at 1. Both identifications are unambiguous rather than inferred from a date in
a filename.

## 4. The probe, re-run after the repair

```
THE PROBE, re-run 2026-08-15 after the repair

run id 30447461123: 1 archive file(s) contain it
    reports/archive/2026-07-29d_session3_remediation.md
run id 30514717576: 1 archive file(s) contain it
    reports/archive/2026-07-30_true-fixdown.md

VERBATIM CHECK: the appended block against the section in the restored report

reports/archive/2026-07-29d_session3_remediation.md
   section  : "ADDENDUM: REMOTE CI AND OWNER PREVIEW, per rule 10 and rule 12"
   report   : lines 8580 to 8616, 37 lines, 1547 chars
   appended : block present verbatim in the archive file: True
   run id 30447461123 now in that file: True

reports/archive/2026-07-30_true-fixdown.md
   section  : "ADDENDUM: the close, and a fourth thing that went wrong"
   report   : lines 9500 to 9546, 47 lines, 2653 chars
   appended : block present verbatim in the archive file: True
   run id 30514717576 now in that file: True

archive file count (all types): 245
```

Before the repair both probes returned zero hits across the whole archive, which is the
finding this task exists to close. They now return one file each, and each appended block
is present in its archive file **byte for byte** against the section in the restored
report.

## 5. What this does NOT claim

- It does not claim the archive is complete in every other respect. That question is
  TASK 3, and its answer is at `reports/qa/standback-2026-08-15/ARCHIVE_COVERAGE_SWEEP.md`.
- It does not claim the 50 line citations that point into the session report are correct.
  They resolve again because the file is its old length once more, and nothing in this
  pass re-checked them one by one.
