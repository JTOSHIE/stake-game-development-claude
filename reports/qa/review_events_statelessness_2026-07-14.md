# Statelessness re-verification addendum, 2026-07-14 (sanctioned locked pass)

- **Date:** 2026-07-14
- **Script:** `scripts/review_events_stateless_scan.py` (unchanged from the
  2026-07-08 pass, re-run against freshly regenerated books)
- **Raw output:** `reports/qa/review_events_statelessness_scan_result_2026-07-14.json`
- **Purpose:** re-verify statelessness against the books produced by this
  session's sanctioned locked pass (books regeneration and cleanup), since
  `books_super.jsonl.zst` was regenerated fresh to fill a real gap (missing
  from the checkout) and `books_cruise.jsonl.zst`/`books_antelite.jsonl.zst`
  were incidentally regenerated as a side effect of the pipeline's
  three-mode-per-run design (see the session report for the full account).

## Result

```
[cruise]   expected start meter = 1, observed distinct values = [1] -> STATELESS
           6,100/100,000 rounds (6.1%) had at least one free-spin win to sample from
[antelite] expected start meter = 1, observed distinct values = [1] -> STATELESS
           24,249/100,000 rounds (24.25%) had at least one free-spin win to sample from
[super]    expected start meter = 5, observed distinct values = [5] -> STATELESS
           99,998/100,000 rounds (100.0%) had at least one free-spin win to sample from

STATELESSNESS SCAN: ALL PASS
```

Identical verdict to the 2026-07-08 pass (same expected values, same
statelessness result); coverage percentages differ slightly since this run's
books are a fresh Monte Carlo draw (raw simulation stage is seeded and
deterministic - the freshly generated `books_cruise.jsonl.zst`/
`books_antelite.jsonl.zst`/`books_super.jsonl.zst` hash byte-identical to the
prior committed/recorded values, see the session report - but this scan's own
6.1%/24.25%/100.0% coverage figures happen to be measuring the exact same
underlying data as before since the books matched exactly, not an independent
re-roll).

## Verification

- Ran `scripts/review_events_stateless_scan.py` for real against the fresh
  `library/publish_files/` directory (not reused from the 2026-07-08 run).
- Cross-checked: `shasum -a 256` on all three freshly-generated books files
  matches the previously-recorded hashes exactly (see the session report),
  which is *why* this scan's numbers match 2026-07-08's so closely - it's the
  same underlying data, freshly regenerated and hash-confirmed identical, not
  coincidence.
