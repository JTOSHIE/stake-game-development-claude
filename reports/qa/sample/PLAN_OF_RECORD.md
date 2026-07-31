# THE MEASURED SAMPLE: PLAN OF RECORD

**Posted before the first expensive spend, per protocol rule 15.** Brief at
`reports/briefs/FS_SAMPLE_Prompt.md`. Opus 5 on `main`, container orchestration per
convention (q) and `docs/skills/FULL_AUDIT_METHOD.md` 4.1. Resolved against HEAD
`59c1056`, 2026-07-31.

Australian English, no em dashes or en dashes.

---

## PREMISES RECOUNTED, per rule 16 and the pre-flight checklist

The brief marks three premises VERIFIED. A VERIFIED premise still gets recounted against
the repository, because the pre-flight checklist requires every factual citation to be
checked against the repository rather than against narration. All three recount exactly.

| Premise as briefed | Recount method | Result |
|---|---|---|
| 71 rows PARKED, `src` begins `wave-a:`, non-empty `derived` | node filter over `reports/qa/session4b/waveA_raw.json` | **71.** Confirmed |
| Eleven squads, sized 13, 10, 10, 8, 5, 5, 5, 5, 5, 3, 2 | same script, grouped on `src` | **Eleven, exactly those sizes.** Confirmed |
| Severity 11 STREAM, 45 HIGH, 13 MEDIUM, 2 LOW | same script | **Exactly.** Confirmed |

The fourth premise, the roughly 19 per cent diagnosis rate against 94 per cent observation
rate, is marked REPORTED in the brief and is treated as a question. It is not used as an
input anywhere in this plan and no result is compared against it until the rate is
computed independently.

---

## TWO DESIGN FACTS THE BRIEF COULD NOT HAVE KNOWN, resolved here rather than silently

### 1. There is no symptom field. The symptom text has to come from somewhere else.

JOB 2 says each agent is given "the symptom text inline". **`waveA_raw.json` has no such
field.** Its `symptom` column holds `YES` or `PARTIAL`, three to seven characters, which is
a reproduction flag and not a description. Its `why` column holds disposition rationale
("CAUSE DERIVED ... NOT APPLIED"). Its `derived` column is a single unbroken paragraph
that blends the specification quote, the observation and the cause together, so it cannot
be handed to a derivation agent at all.

**The symptom text used is the `finding` column of `reports/qa/session3/UPHELD_118.tsv`**,
joined on the cluster id, together with that row's `file` and `path`. This is the correct
source on the project's own terms: `FULL_AUDIT_METHOD.md` 2.7 splits an OBSERVATION from a
DIAGNOSIS permanently, and `UPHELD_118.tsv` is the observation layer. All 71 rows are
present in it. A probe for causal language (`because`, `cause`, `due to`, `the reason`)
across the 71 findings hits **one row, S2-C046**, which is recorded here and flagged in
`SAMPLE.tsv` rather than quietly cleaned.

**The limitation, stated rather than hidden: `finding` is hard-truncated at 240
characters.** 83 of the 118 rows sit exactly at 240 and 79 of those end mid-token. The
full text exists only under `reports/qa/session2_audit/`, which the brief forbids. So each
derivation agent receives a truncated observation plus the exact `file:line` locations, and
derives by reading the source itself. **This is closer to what `FULL_AUDIT_METHOD.md` 1.3
actually recommends than a fuller symptom paragraph would be:** 1.3 says independence comes
from "reproduction rather than agreement", requiring the finding to be reproduced from a
stated procedure. A truncated observation plus exact line numbers forces the agent to read
source. A complete prose symptom would invite agreement with prose.

### 2. The main loop must read the ledger the agents are forbidden

The brief forbids `waveA_raw.json`, `DISPOSITIONS.tsv` and `LEDGER.md`, and it also
requires JOB 1 to stratify by squad and JOB 3 to compare against the recorded cause. Both
of those live in `waveA_raw.json`. Read literally the session cannot start.

**The prohibition is read as scoped to the derivation agents**, which is where the three
blinding measures sit in the brief's own structure, and the brief's own premise block
establishes precedent by resolving its counts "by a script over
`reports/qa/session4b/waveA_raw.json`".

**How it is honoured in practice, which is stricter than the brief asks:**

- The main loop touches the ledger only through scripts. **The `derived` field is never
  read into main-loop context at any point.** It is piped from the JSON straight into the
  comparison shards on disk, and only the comparison agents ever see it.
- Derivation agents are forbidden **the whole of `reports/`**, not just the four named
  paths. The named paths are not the only trail: `UPHELD_118.tsv` carries the observation
  text an agent could grep, and it links onward to `session2_audit/` where the causes are.
  Forbidding the directory closes the trail rather than four doors along it.
- The tree is not modified. No deletions, no stashing, no exclusions.

### 3. One sampled row is contaminated before it starts, and it is named now

`S2-C045` is the single row of the 71 that also appears in
`reports/qa/session3/job4_rederivation.json`, session 3's JOB 4 re-derivation of the 27
unsound causes. **It therefore already carries a committed second derivation.** If the
stated selection rule draws it, it is kept rather than swapped out, because swapping a row
after seeing something about it is how a sample becomes a story. It is expected to return
CONTAMINATED and is flagged in `SAMPLE.tsv` in advance.

---

## THE SAMPLE DESIGN

Stratified, not random, per JOB 1. One row from each of the eleven squads, then four more
from the four largest.

| Squad key | `src` squad | Population | Sampled |
|---|---|---|---|
| NOQR | `wave-a:NOQR` | 13 | **2** |
| SHARD_J | `wave-a:SHARD_J` | 10 | **2** |
| SQUAD_M | `wave-a:Squad M` | 10 | **2** |
| SHARD_L | `wave-a:SHARD_L` | 8 | **2** |
| DEI | `wave-a:DEI` | 5 | 1 |
| SHARD_B | `wave-a:SHARD_B` | 5 | 1 |
| FG | `wave-a:FG` | 5 | 1 |
| SHARD_H | `wave-a:SHARD_H` | 5 | 1 |
| PK | `wave-a:PK` | 5 | 1 |
| A1 | `wave-a:A1` | 3 | 1 |
| A2 | `wave-a:A2` | 2 | 1 |
| | | **71** | **15** |

**Selection rule within a squad, stated by the brief so the session does not invent one:**
highest severity first (STREAM, then HIGH, then MEDIUM, then LOW), ties broken by lowest
row id. Where a squad contributes two rows, the top two under that same ordering.

---

## THE ARITHMETIC

```
PLAN OF RECORD
  binding line       : MAIN LOOP CONTEXT, 200k of ~740k, per AGENT_BUDGET 4.5
  waves planned      : 2 x 15 agents, container-orchestrated, one row each
  discovery cost     : 15 x 120k (measured band 97k to 143k)   = 1.80M
  comparison cost    : 15 x 80k  (lighter, two texts and a rule) = 1.20M
  agent line TOTAL   : 3.00M against the brief's nominal 1.8M
  main loop          : sample construction, marshalling, RATE.md, close
  VERDICT            : FITS on the binding line. The agent line runs over the
                       brief's nominal figure, and the brief states in terms
                       that the agent line "is NOT the constraint and is not
                       rationed". Context is what is rationed, and the design
                       spends agents precisely to protect it.
  if context binds   : DEGRADATION ORDER is JOB 1, 2, 3, 4. Cut the sample
                       size, never the comparison. Ten compared rows beat
                       fifteen uncompared ones.
```

**Why the agent line is deliberately double the nominal figure.** The brief prices "a
comparison pass" without a count. Running the comparison as fifteen shared-nothing agents,
one per row, rather than as one agent over fifteen rows, costs about 1.2M instead of about
0.15M. It buys two things the cheap form cannot: no comparison sees another row's verdict,
so the per-squad breakdown is not produced by one agent settling into a habit; and a lost
comparison costs one row rather than the measurement. Convention (l.4) is the reason: fifteen
verdicts from one context share that context, and shared inputs share their flaws.

**Main loop context is protected by four rules**, per `_TEMPLATE.md` MAIN LOOP DISCIPLINE:
the `derived` field never enters it; shards are written by agents to disk and marshalled with
`grep`, never read in full; every read is bounded; documents go out through Write and do not
come back.

---

## HOW THIS SESSION CAN FAIL, named in advance

- **The measurement is laundered.** Agents find the committed cause and agree with it, and
  the session reports a high rate that measures the repository's own memory. Mitigated by
  the contamination question, by forbidding `reports/` outright, and by excluding
  contaminated rows from the rate rather than discounting them.
- **UNDERIVABLE is scored as failure.** It is not, and it is counted as its own category.
- **The fresh derivation is assumed to win a disagreement.** JOB 3 requires the comparison
  to say which side the cited source actually supports. A DIFFERENT verdict where the
  ORIGINAL is better supported is a result about this session's method, not about wave A.
- **A per-squad cell of one row is read as a rate.** Seven of the eleven squads contribute
  exactly one row. `RATE.md` states which cells are too thin to act on.

## THE STOP LINES

No new agents below 300k main-loop context. Close at 200k. No clock stop.

## WHAT THIS SESSION DOES NOT DO

No fixes of any kind. No disposition changes. Nothing moves from PARKED. No ledger edits.
No locked paths, no money-path work, no sanction. The tree is not modified to improve
blinding.
