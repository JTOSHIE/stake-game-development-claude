# Future Spinner, Submission Bundle Assembly and Verification

**Game:** Future Spinner
**Studio:** We Roll Spinners (Joshua Thompson, JTOSHIE)
**Platform:** Stake Engine (Carrot RGS)
**Date:** 22 June 2026
**Branch:** `claude/math-sdk-replay-disclaimer-5l617m`

## 1. Inventory and case

`games/future_spinner/library/publish_files/` contained only three files at the start:

| File | Bytes | SHA-256 |
|------|------:|---------|
| `game_metadata.json` | 500 | `b1a8e47a80e6a5dd704b2ca84626fc0945e2cc969aeb45b85955a17beab1f6dc` |
| `lookUpTable_base_0.csv` (committed) | 1,996,051 | `04c027b7fad49b5156c3a4dd95285adc441983ceff1fed2bbbb2502c58439470` |
| `lookUpTable_bonus_0.csv` | 989 | `2da35dda8a0df4beda762ef626180fccdad09da21ec5244bf4568f3cf7c32aa2` |

No `books_*.jsonl.zst` and no `index.json` are present. **Case B applies (incomplete bundle).** The complete bundle was regenerated in a sandbox under Python 3.12.

## 2. Regeneration and verification (Case B)

The SDK and game were copied to `/tmp/fs_bundle/`, a Python 3.12.3 virtual environment was created (the SDK utility `get_file_hash.py` uses a 3.12-only nested-quote f-string, confirmed parsing under 3.12 with no patch), and the full publish pipeline (`run.py`, PRODUCTION) ran to completion: create books, generate configs, run the Rust optimiser, analytics. It produced the complete bundle in the sandbox: `books_base.jsonl.zst`, `books_bonus.jsonl.zst`, `index.json`, `lookUpTable_base_0.csv`, `lookUpTable_bonus_0.csv`. Nothing was written into the repo.

### RTP verification (method)

RTP computed from the fresh lookup table as the exact probability-weighted mean of payouts, using Python integer arithmetic and a final `fractions.Fraction` division: `RTP = Sum(weight_i * payout_i) / (Sum(weight_i) * 100) * 100`.

**Fresh base lookup table RTP = 96.3500%** (exact, zero deviation from target).

### Payout-identity check

The fresh per-round payouts are **byte-for-byte identical to the committed lookup table**, positionally and as a sorted multiset (the simulation is deterministic, fixed per-sim seed). The optimiser weights differ (the optimiser builds random initial distributions each run).

### Books consistency

`books_base.jsonl.zst` decompressed to 100,000 rounds (id 0 to 99,999). The book `payoutMultiplier` values **match the fresh lookup table exactly**, positionally by id and as a sorted multiset. Maximum book payout is 500,000 centibets (5,000.00x); no round exceeds the cap. `index.json` is internally consistent: it lists the base mode (cost 1.0) and bonus mode (cost 100.0) and references files that all exist. (This index format lists file names, not embedded hashes, so there are no in-index hashes to match.)

### Metric comparison to the committed table and the PAR sheet

| Metric | PAR sheet | Committed LUT | Fresh LUT | Fresh vs PAR |
|--------|----------:|--------------:|----------:|-------------:|
| RTP | 96.3500% | 96.3500% | 96.3500% | 0.0000 (match) |
| Hit rate | 33.57% | 33.5724% | 33.5724% | match |
| Maximum win | 5,000x | 5,000.00x | 5,000.00x | match |
| Volatility (weighted SD) | 16.26x | 16.2599x | 16.3449x | +0.085x |
| Scatter trigger rate | 6.21% | 6.2125% | 6.3251% | +0.115 pp |
| Scatter average win | 95.1x | 95.073x | 93.192x | -1.88x |
| Total LUT weight | 1,125,899,906,782,849 | 1,125,899,906,782,849 | 1,125,899,906,781,427 | differs |

The RTP, hit rate, and maximum win are identical. Volatility and the two scatter figures differ slightly because they are weighted by the optimiser weights, which differ from run to run. The deterministic, weight-independent evidence matches exactly (identical payouts, identical raw scatter count of 6,478).

### The decision to make before upload (do not let this slip)

The repo holds the committed `lookUpTable_base_0.csv` that the PAR sheet was computed from, but it has no books, so it cannot form a complete bundle on its own. The only complete, internally consistent bundle available is the freshly generated one, whose lookup table (`5bc78a4d...`) is **not** the committed lookup table (`04c027b7...`); they share identical payouts but differ in optimiser weights. The PAR metrics above were computed from the committed weights.

Three options, with the numbers in the table above:
- **(a) Submit the fresh consistent bundle** and confirm with the Stake reviewer that the PAR metrics are representative within optimiser variance (RTP, hit rate, and max are exact; volatility and scatter figures differ by roughly 0.1 to 2 in the third significant figure). Lowest effort.
- **(b) Source the original validated bundle** (the books that go with the committed lookup table) so the upload matches the PAR exactly. Requires locating the original publish run's books, which are not in this repo.
- **(c) Regenerate the PAR sheet** to describe the fresh bundle. This is a change to a locked file and must be separately sanctioned.

I am not choosing for the owner. My read: option (a) is sound for submission because the served distribution still yields exactly 96.3500% with the same payouts and the same 5,000x cap, and the differences are pure optimiser sampling variance, but it does require the staged bundle to ship with the fresh lookup table rather than the committed one.

## 3. What was staged

Staging directory: `~/Desktop/FutureSpinner_SubmissionBundle/` (not mirrored into the repo, to keep the repo untouched and avoid committing large binaries).

```
FutureSpinner_SubmissionBundle/
  math/
    index.json                 63c64048508a35940aa5fc5124489ceb9d1c774737411b3bd726779babb85107
    lookUpTable_base_0.csv      5bc78a4dc8a6d833dae5fbff547390ebff9b0b599c9f1636ab7b138d0b47949d   (fresh)
    lookUpTable_bonus_0.csv     4c07a2f4d82926298d9bb0f666dda22343e89b523339aa892bef6a028262c614   (fresh)
    books_base.jsonl.zst        a646825de53c53144e6451265cec045108d4a0155d3780b4cd390f1b15bbacf7
    books_bonus.jsonl.zst       625fef1602ef97b0b758cbda54d7fd5494b67402b5ec2304ab8c5a1ba238f34f
    game_metadata.json          b1a8e47a80e6a5dd704b2ca84626fc0945e2cc969aeb45b85955a17beab1f6dc   (from repo; pipeline does not generate it)
  frontend/                     built production dist (985 files), index references index-Ce1aw98F.js
  MANIFEST.sha256               full SHA-256 manifest of math/ and frontend/
```

Notes:
- The math bundle is the fresh, internally consistent set (Case B). `game_metadata.json` is the repo's hand-authored file, since the pipeline does not generate it.
- `game_metadata.json` lists `modes: ["base"]`, while `index.json` lists base and bonus. This is the same base-only versus bonus question raised in the finalisation report (the bonus mode does not ship in the frontend). Decide whether the bonus mode and its files should be in the uploaded bundle at all, or removed for a clean base-only submission.
- The frontend dist is the production build (theme selector dev-only, only Future Spinner ships).

## 4. Verdict

**A decision is needed before upload, then it is ready.** The bundle is complete, internally consistent, and verified at exactly 96.3500% RTP with identical payouts to the committed table and a confirmed 5,000x cap. The one thing to settle first is the optimiser-weight difference between the fresh bundle and the committed lookup table that the PAR sheet describes (Section 2, options a/b/c), plus the base-only versus bonus inclusion (Section 3). Once Josh picks option (a), (b), or (c) and confirms base-only, the staged set in `~/Desktop/FutureSpinner_SubmissionBundle/` is ready to upload, alongside the live RGS endpoint test (authenticate, play, end-round) on staging.

## 5. Repo safety

- Committed `lookUpTable_base_0.csv` SHA-256 unchanged: `04c027b7fad49b5156c3a4dd95285adc441983ceff1fed2bbbb2502c58439470`.
- `git diff games/future_spinner/`: empty. `git status` under the game directory: no changes.
- All generated artifacts are in `/tmp/fs_bundle/` (sandbox) or `~/Desktop/FutureSpinner_SubmissionBundle/` (staging). Nothing was written into the repo's `publish_files`.
