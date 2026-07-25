# External review sources

Verbatim ingests of the external reviews, one file per review, never edited after
ingest. `REVIEW_TRACKER.md` one directory up is the working document; these are the
immutable originals it cites.

| File | Review | Status |
|---|---|---|
| `review1_claude.md` | Review 1 (Claude) | **AWAITING SOURCE TEXT** |
| `review2.md` | Review 2 | **AWAITING SOURCE TEXT** |
| `review3_openai.md` | Review 3 (OpenAI) | **AWAITING SOURCE TEXT** |

## Why these are empty

The CONSOLIDATED REVIEW REMEDIATION PROGRAMME brief (2026-07-27) instructs that all
three reviews be ingested verbatim before the tracker is built. **The review documents
themselves have not been provided to the builder session.** Only Fable's dispositions
on a handful of their findings were relayed, inside the programme brief.

They are therefore recorded as awaited rather than reconstructed. Writing plausible
review text from the dispositions would put fabricated findings into a
compliance-bearing record and make every downstream row unverifiable. That is not a
tradeoff worth making to fill a table.

## What to do

Paste each review's full text into its file, unedited, preserving the reviewers' own
numbering (review 3's `F3`, `F5`, `F7`, `F8`, `F10` are already cited by that numbering
in the tracker, so it must be preserved to resolve those rows).

Once ingested, `REVIEW_TRACKER.md` gains one row per distinct finding, deduplicated
across the three reviews, and the seeded rows below `TR-001` are re-anchored to their
real source IDs.

## What already exists without them

The tracker is live and already carries every disposition that could be established
independently, including three refutations this session verified first-hand rather
than accepting on relay. Those rows are complete and need no further input. The gap is
coverage: without the sources there is no way to know which findings are *missing*
from the tracker.
