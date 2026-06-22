# Future Spinner, Base-Only Bundle Finalisation

**Game:** Future Spinner
**Studio:** We Roll Spinners (Joshua Thompson, JTOSHIE)
**Platform:** Stake Engine (Carrot RGS)
**Date:** 22 June 2026
**Branch:** `claude/math-sdk-replay-disclaimer-5l617m`

## 1. Path taken

**Base-only publishing was possible without any change to the locked config (Step 2a).**

The index.json is built by the SDK's `make_index_config`, which iterates `gamestate.config.bet_modes`; likewise `create_books` iterates the same list. The locked `game_config.py` defines two bet modes (base and bonus), and both `run.py` and `game_config.py` are locked. Rather than edit either, a separate sandbox runner (`/tmp/fs_bundle/run_base_only.py`, not under the locked game directory) was used. It builds the config, then filters the in-memory `config.bet_modes` list to base only before running, so the SDK's own publish steps emit base only. No locked file was modified and the manifest was not hand-edited; the index.json keeps the SDK's exact format.

Method, exactly:
- `config = GameConfig()`, then `config.bet_modes = [bm for bm in config.bet_modes if bm.get_name() == "base"]` (confirmed in the log: `['base', 'bonus']` to `['base']`).
- `create_books` with `num_sim_args = {"base": 100_000}`.
- `generate_configs` (emits be_config, math_config, and index.json, all base only).
- `OptimizationExecution().run_all_modes(config, ["base"], 20)`, then `generate_configs` again to refresh hashes.
- Analytics restricted to base. All under Python 3.12.3 in the sandbox venv.

## 2. Bundle contents, hashes, and verification (Step 2a)

`/tmp/fs_bundle/games/future_spinner/library/publish_files/` after the base-only run contained exactly three files (no bonus files):

| File | Bytes | SHA-256 |
|------|------:|---------|
| `index.json` | 191 | `c5c3280cdd97e59a17bc3d6d8730d3259c263a680296258314836e71cfa52b9d` |
| `lookUpTable_base_0.csv` | 1,993,487 | `a68426637b963864207a4557723ae49c1a5d452c01af125e421a4de968ed2c53` |
| `books_base.jsonl.zst` | 9,397,430 | `a646825de53c53144e6451265cec045108d4a0155d3780b4cd390f1b15bbacf7` |

Verification:
- **index.json lists base only.** Content: one mode object `{name: "base", cost: 1.0, events: "books_base.jsonl.zst", weights: "lookUpTable_base_0.csv"}`. Both referenced files exist. This SDK manifest format lists file names (not embedded per-file hashes), so internal consistency means the references resolve, which they do.
- **RTP = 96.3500% exactly** (method: probability-weighted mean of payouts with exact integer arithmetic, `Sum(weight*payout)/(Sum(weight)*100)*100`). Hit rate 33.5724%. Maximum 5,000.00x.
- **Payouts identical to the committed lookup table**, positionally and as a sorted multiset (deterministic simulation).
- **Books match the lookup table**: 100,000 rounds (id 0 to 99,999), payouts agree positionally by id and as a multiset; maximum 5,000.00x; no round exceeds the cap.
- **Metadata is base-only**: `game_metadata.json` lists `modes: ["base"]`, now consistent with the base-only index (the pipeline does not generate the metadata, so the repo's hand-authored file is used).

## 3. What is staged, and where

Staging directory: `~/Desktop/FutureSpinner_SubmissionBundle/` (not mirrored into the repo).

```
FutureSpinner_SubmissionBundle/
  math/                         (base-only, no bonus files)
    index.json                  c5c3280cdd97e59a17bc3d6d8730d3259c263a680296258314836e71cfa52b9d
    lookUpTable_base_0.csv       a68426637b963864207a4557723ae49c1a5d452c01af125e421a4de968ed2c53
    books_base.jsonl.zst         a646825de53c53144e6451265cec045108d4a0155d3780b4cd390f1b15bbacf7
    game_metadata.json           b1a8e47a80e6a5dd704b2ca84626fc0945e2cc969aeb45b85955a17beab1f6dc
  frontend/                      built production dist (985 files; index references index-Ce1aw98F.js)
  MANIFEST.sha256                full SHA-256 manifest of math/ and frontend/, regenerated to match
```

The manifest matches the staged files exactly. The frontend dist was freshly rebuilt (theme selector dev-only, only Future Spinner ships).

## 4. Residual items to raise with the Stake reviewer (both paths)

These are confirmations, not defects:

1. **Optimiser-weight metric variance versus the original PAR sheet.** The simulation payouts are deterministic, so RTP (96.3500%), hit rate (33.5724%), and the 5,000x cap are exact and identical across runs. The optimiser assigns slightly different weights each run, so the weighted sub-metrics differ from the PAR figures (which describe the original committed run):

   | Metric | PAR sheet | This base-only bundle | Difference |
   |--------|----------:|----------------------:|-----------:|
   | RTP | 96.3500% | 96.3500% | 0 (exact) |
   | Hit rate | 33.57% | 33.5724% | match |
   | Maximum win | 5,000x | 5,000.00x | match |
   | Volatility (weighted SD) | 16.26x | 16.3052x | +0.045x |
   | Scatter trigger rate | 6.21% | 6.2593% | +0.049 pp |
   | Scatter average win | 95.1x | 90.82x | -4.28x |

   The scatter average is the most sensitive (it is the weighted mean over only about 6,478 scatter rounds), and it swings run to run purely from the optimiser weighting (observed 95.07, 95.86, 93.19, 90.82 across runs, all at an exact 96.3500% RTP). Recommend confirming with the reviewer that the PAR sub-metrics are representative within optimiser variance, or, if exact PAR agreement is required, regenerating the PAR from the bundle that ships (a separately sanctioned locked change).

2. **PAR section 11 documents a bonus buy that is not in the shipped bundle.** The game ships base-only (metadata, index, and frontend all base-only). The locked PAR sheet section 11 still describes a 100x bonus buy. The PAR is locked; either accept the documented-but-unshipped bonus, or have the PAR's bonus section removed in a separately sanctioned change.

## 5. Verdict

**Ready to upload as staged.** The base-only bundle is produced through the SDK's own publish mechanism (no locked change, no hand-edited manifest), is internally consistent, lists base only in both the index and the metadata, verifies at exactly 96.3500% RTP with payouts identical to the committed table and a confirmed 5,000x cap, and is staged with a matching manifest alongside the freshly built frontend. The two residual items in Section 4 are reviewer-side confirmations about the PAR sheet (optimiser variance and the unshipped bonus section), not blockers in the bundle. The remaining external step is the live RGS endpoint test (authenticate, play, end-round) on staging.

## 6. Repo safety

- Committed `lookUpTable_base_0.csv` SHA-256 unchanged: `04c027b7fad49b5156c3a4dd95285adc441983ceff1fed2bbbb2502c58439470`.
- `git diff games/future_spinner/`: empty; the repo's `publish_files` still holds only its original three files.
- All generated artifacts are in `/tmp/fs_bundle/` (sandbox) or `~/Desktop/FutureSpinner_SubmissionBundle/` (staging). Nothing was written into the repo.
