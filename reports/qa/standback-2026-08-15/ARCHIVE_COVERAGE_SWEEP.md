# Archive coverage sweep

TASK 3 of `reports/briefs/FS_REPORT_REVERT_2026-08-15_Prompt.md`, run 2026-08-15.
**REPORT ONLY.** Nothing in this document was repaired. The only repairs this session made
are the two addenda named in TASK 2. Australian English, no em dashes or en dashes.

---

## 1. The question, and the test

After TASK 2, is any other part of `reports/SESSION_REPORT.md` held nowhere under
`reports/archive/`?

Every heading section of the restored report was taken in turn, and every distinctive line
in it (30 characters or more, so headings, blank lines and short list fragments cannot
inflate a match) was searched for across **all 236 archive markdown files at once**. A
section carried by a DIFFERENT archive file than its own block sibling counts as covered:
the question is whether the material survives anywhere in the archive, not whether it sits
in the file a filename would suggest.

**That correction matters and is recorded because a narrower test gave a wrong answer
first.** Matching each section only against its own block's best-matching file reported
seven partly covered blocks and about twenty absent sections. Almost all of them were
sections whose archive copy is a SEPARATE dated file, for example
`## 2026-07-26f: V3 FRESH SESSION, JOB 3 remainder through JOB 5`, which the report keeps
inside an earlier block while the archive keeps it in its own file. Searching the whole
corpus removed every one of those false positives.

## 2. The result

```
ARCHIVE COVERAGE SWEEP, 2026-08-15
Subject: the RESTORED reports/SESSION_REPORT.md, every heading section.
Test: is each distinctive line (30 characters or more) present ANYWHERE under
reports/archive/ ? A section carried by a different archive file counts as covered.

sections judged            : 421
archive markdown files     : 236

== SECTIONS WHOLLY OR MOSTLY ABSENT FROM THE ARCHIVE (under 50 per cent carried): 0
   NONE. After TASK 2 there is no section of the report that the archive does not hold.

== SECTIONS CARRIED BUT DRIFTED, some lines added after the archive copy: 6

   report line 4419: # 2026-07-27b: FS VISUAL FIXPACK, four owner-reported visual defects
      1 of 20 distinctive lines are in no archive file (95.0% carried)
         4419: # 2026-07-27b: FS VISUAL FIXPACK, four owner-reported visual defects

   report line 4891: # 2026-07-27c: ROUND-THREE PREP, the two unrun tracks executed on main
      1 of 8 distinctive lines are in no archive file (87.5% carried)
         4891: # 2026-07-27c: ROUND-THREE PREP, the two unrun tracks executed on main

   report line 5187: # 2026-07-28: THE LOCALE AND TYPE PASS, Fable rulings 1 to 3
      1 of 4 distinctive lines are in no archive file (75.0% carried)
         5187: # 2026-07-28: THE LOCALE AND TYPE PASS, Fable rulings 1 to 3

   report line 5344: # 2026-07-28b: BASELINE AND METHOD, rulings 4 and 5 plus the CI and kit work
      1 of 4 distinctive lines are in no archive file (75.0% carried)
         5344: # 2026-07-28b: BASELINE AND METHOD, rulings 4 and 5 plus the CI and kit work

   report line 7321: ## FOR THE NEXT SESSION: Session 2's parameters
      16 of 66 distinctive lines are in no archive file (75.8% carried)
         7360: re-verifying them as they stand.
         7362: > **CORRECTION, 2026-08-05, S2-C089. "Six" is wrong here, and it is FIVE.** Added
         7363: > additively, in the idiom of the dated note above, because this section is a record of
         7364: > what was planned and a silent edit would destroy the evidence of what was actually
         7367: > Derived from `reports/qa/stream_test/CLUSTERS.md`, whose marshalling-fault table names
         7368: > the six as **C-03, C-10, C-11, C-12, C-23 and C-26**. Intersect that with the seven
         7369: > reopened clusters listed above and **five** are in both: C-03, C-10, C-11, C-23, C-26.
         7370: > **C-14 and C-25 were reopened carrying NO marshalling fault**, and **C-12 carries the
         ... and 8 more

   report line 10305: ## FOR THE NEXT SESSION
      6 of 42 distinctive lines are in no archive file (85.7% carried)
         10349: **FINAL PUSH VERIFIED, per rule 10 and the one-commit-lag clause.** Run
         10350: `30889554608` on `53f5f2d`: **success**, "what changed" and "static gates" green,
         10351: browser matrix `skipped`. The qualification above still stands and is the point: this
         10352: green does not speak for the browser matrix, which has not been seen fully green since
         10353: run `30600681036` on `3d068eb`. This recording commit is itself the lag rule 12 names,
         10354: and the owner preview is refreshed once more after it.

TOTAL: 26 distinctive lines of 10081 in the report are in no archive file (0.26%).
```

## 3. Reading the six drifted sections

**Four of the six are not content gaps at all.** The only line the archive lacks is the
section's own H1, because the archive file re-titles it: the report says
`# 2026-07-28: THE LOCALE AND TYPE PASS, Fable rulings 1 to 3` and the archive file opens
with its own heading. Nothing under the heading is missing.

**Two are the same class as the addenda TASK 2 repaired, at PARAGRAPH granularity rather
than section granularity**, and that is the finding worth carrying forward:

1. **Report line 7362, sixteen lines.** A block opening
   `> **CORRECTION, 2026-08-05, S2-C089. "Six" is wrong here, and it is FIVE.**` was added
   to a 2026-07-29 section on 2026-08-05, additively and deliberately, after that
   session's archive copy had been taken. The correction is in the report and in no
   archive file.
2. **Report line 10349, six lines.** A rule 10 final-push verification block recording run
   `30889554608` was appended to a 2026-08-04 section after its archive copy was taken.

**Total exposure: 26 distinctive lines of 10,081, or 0.26 per cent.** Twenty of those are
the four re-titled headings and their immediate neighbours; the two blocks above are the
real content.

## 4. The mechanism, stated once

The archive copy is taken at close, and anything appended to the session report AFTER that
moment never reaches it. That is true of a whole addendum, which is what TASK 2 repaired,
and it is equally true of a two line correction, which is what remains. **A section level
sweep would not have caught the paragraph level case**; this one did only because it
compares line by line.

Nothing here is repaired, per the brief. A remediation pass decides whether to append the
two blocks, or to change the mechanism so that a later edit to an archived section cannot
go unmirrored.
