# JOB 1: THE RECONCILED COUNT, and it is not the one the brief expected

**Session 7, `reports/briefs/FS_SELF_VERIFYING_Prompt.md`.** Resolved against HEAD
`563c695`, 2026-08-04. The brief was written against `df04d8c`; `563c695` is that commit
plus this session's own brief and resume ledger, neither of which touches any candidate row.

Row-level detail at `reports/qa/session7/RECONCILED.tsv`. Per-agent evidence at
`reports/qa/session7/shards/`.

Australian English, no em dashes or en dashes.

---

## THE HEADLINE

**Of the 57 candidate rows, 50 are STILL OPEN at HEAD and 7 are ALREADY CLOSED.**

| verdict | count |
|---|---|
| STILL OPEN | 50 |
| ALREADY CLOSED | 7 |
| UNKNOWN | 0 |
| LOST | 0 |

**The backlog was inflated by seven rows, not by the large unknown amount the brief
feared.** The brief's premise was that "the backlog everyone has been sizing against is
inflated by an unknown amount, and fixing before counting would spend the session
re-fixing closed rows". The count was worth taking, because it converted an unknown into
a measured figure and that was the owner's stated first priority. But it did not find a
large hidden surplus, and this document does not dress seven rows up as one.

**Sizing consequence, stated plainly so the next session does not repeat the error:** the
remaining work is 50 rows, not 57 and not some much smaller number. Any plan that assumed
the candidate set would collapse under reconciliation should be rebuilt on 50.

## WHICH SEVEN CLOSED

`S2-C006`, `S2-C017`, `S2-C067`, `S2-C073`, `S2-C074`, `S2-C087`, `S2-C092`.

**Six of the eight rows the brief suspected were confirmed closed against source.** The
two that were not, `S2-C009` and `S2-C012`, came back STILL OPEN. **Those are exactly the
two the brief itself flagged**, in its own words, as rows where the closure had been
"verified by inference from a commit message rather than from source". The pass
independently reproduced the brief's stated weakness in the place the brief predicted it,
which is a stronger validity signal than agreement would have been.

One row closed that nobody suspected: `S2-C087`.

## METHOD, and what it deliberately withheld

Twelve shared-nothing agents, container-orchestrated per convention (q), four to five rows
each. Each agent was given the row id, the recorded defect location, the recorded fix
location, and what the row asks for.

**Each agent was NOT given the recorded cause.** The `derived` field of
`reports/qa/session4b/waveA_raw.json` carries the causal narrative, and it was withheld
from every prompt, as were the ledger files that record each row's PARKED status. The
brief asked that agents be TOLD not to re-litigate causes. They were told, and the
narrative was also kept out of the room, because `docs/skills/FULL_AUDIT_METHOD.md` 1.3b
records that the previous pass was weakened by FILE LAYOUT rather than by any instruction:
"keep the answer out of the room, not merely out of the prompt".

## TWO CAVEATS A FUTURE SESSION MUST NOT SKIP

**1. The `self_verifying` column is over-permissive and did not authorise anything.**

Fifty-six of 57 rows carry `self_verifying=YES`. That near-unanimity is a prompt artefact,
not a property of the rows. The first ten shards were asked the question loosely and
returned YES on all 49 rows they covered. The last two shards were asked a strict form of
the same question, naming the failure mode ("a code change whose only evidence is that the
source now reads differently proves the edit happened, not that the defect is fixed"), and
one of the eight rows immediately came back NO (`S2-C035`). **The same question, asked
strictly, discriminates.**

So the column records what the agents said and is kept for that reason. **It was not used
to decide what this session touched.** Scope came from the brief's tiers instead:
documentation rows, where a claim resolves against HEAD or it does not, and gate rows,
where convention (p) supplies a seeded red. Both are self-verifying by construction. **A
session that reads this column as a licence to act on the code rows will be acting on an
artefact of prompt wording.**

**2. Zero UNKNOWN was expected here, and 1.3b does not apply unmodified.**

`docs/skills/FULL_AUDIT_METHOD.md` 1.3b says to read a zero UNKNOWN rate as a contamination
signal. That calibration was taken from blind CAUSE DERIVATION, which is genuinely hard and
should fail on some rows. **The question asked here was different and much more answerable:
does this defect exist at HEAD.** Four ALREADY CLOSED verdicts were independently
spot-checked from the main loop before the count was believed, against
`SUBMISSION_DOSSIER.md`, `BOOKS_MANIFEST.md`, `frontend/src/app.css` and
`scripts/kit_build.mjs`, and all four matched the agents' quoted evidence exactly. Zero
UNKNOWN is recorded here as expected rather than alarming, and the reasoning is written
down so a later reader can disagree with it rather than having to guess.

## DELIVERY NOTE

The wave ran twice. The first run lost two shards to API errors and was RESUMED per
convention (q) before anything else was done; the resume then hit a weekly usage limit and
lost a third shard whose results were already safely on disk from the first run. The final
two shards were completed as direct agents, which is lawful because two agents is below
convention (q)'s four-agent threshold for the workflow container. No row was dropped: the
marshaller writes LOST explicitly for any row without a returned verdict, and the final run
reported zero.
