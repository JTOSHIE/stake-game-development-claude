# SESSION 9 RESUME LEDGER

One line per commit, appended as each lands. Protocol rule 13 makes an honest stop lawful
only at a boundary, and a gate session has no waves, so the commit is the boundary. A
session picking this up mid-flight reads the last line and continues from there.

Session: FS_GATE_TIER_2, `reports/briefs/FS_GATE_TIER_2_Prompt.md`.
Base HEAD: `a14d409`, main, 2026-08-05.

Scope: the **eight** rows of tier `gate_or_ci`, verdict `STILL_OPEN`, in
`reports/qa/session7/RECONCILED.tsv` that Session 8 left untouched, namely S2-C010,
S2-C024, S2-C025, S2-C058, S2-C059, S2-C069, S2-C075 and S2-C122; plus ONE
owner-authorised fix outside the row set, `scripts/owner_preview.mjs` (JOB 1). Fixed
before the session began and not extended.

Format: `<sha>  <row ids or scope>  <what landed>  <proof>  <main loop context at commit>`

---

## PLAN OF RECORD, posted before the first expensive spend, per rule 15

```
PLAN OF RECORD
  budget seen        : main loop about 500k of a roughly 740k working budget;
                       agents about 4, and the agent line is NOT the constraint
  context at posting : about 75k main loop
  waves planned      : 1 x 4 reconnaissance agents at 2 rows each (JOB 2)
  discovery cost     : 4 x about 130k = about 0.5M on the AGENT line
                       main loop cost of marshalling them: about 25k
  expected findings  : 8 row verdicts; on Session 8's measured rate
                       (4 of 19 canPredicateSeeDefect=YES) expect about 2 to 3
                       clean YES, the rest refused or redesigned
  verification cost  : not applicable in the audit sense. This tier's proof is the
                       SEEDED RED, observed in the main loop and not delegable.
                       Priced per row below rather than by the audit formula.
  fixes and re-proof : JOB 1 owner preview            about  45k main loop
                       JOB 3 park proposals           about  25k main loop
                       JOB 4 S2-C024 + S2-C025        about  70k main loop
                       JOB 4 S2-C058                  about  60k main loop
                       JOB 4 S2-C059                  about  40k main loop
                       JOB 4 S2-C069                  about  35k main loop
                       JOB 4 S2-C075                  about  45k main loop
                       JOB 4 S2-C122                  about  50k main loop
                       JOB 5 S2-C010                  about 200k main loop
  main loop          : 75k held + 25k marshal + 570k of job work = about 670k
  TOTAL              : about 670k of main loop against a 500k line
  VERDICT            : DOES NOT FIT
  if DOES NOT FIT    : JOB 5 (S2-C010) is abandoned outright, per the brief's own
                       degradation order. That returns the total to about 470k,
                       which FITS with the close inside the 500k line.
                       If recon refuses rows, each refusal is cheaper than its fix,
                       so the remaining slack goes to JOB 4 rows in severity order.
                       JOB 1 and JOB 3 are never cut.
```

**The one judgement in that block worth stating plainly.** JOB 5 is abandoned at the
planning stage rather than attempted and half-built, because the brief measures it at about
0.75M as a session's work on its own and forbids starting it below 300k. Deciding it now
rather than discovering it at 300k is the whole point of posting the plan before the spend.

---
