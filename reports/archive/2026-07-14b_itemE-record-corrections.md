# Session Report: ITEM E, record corrections

- **Date:** 2026-07-14
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/record-corrections-itemE` (off `main`, independent of
  ITEMS A/B/C/D).
- **Source:** `FS_FollowUpWorkOrder_2026-07-14b_Prompt.md`, ITEM E - Fable's
  ruling on ITEM 0's flagged LUFS discrepancy, plus a standing-instructions
  correction on the optimiser non-determinism this arc's sanctioned locked
  pass found.

## LUFS correction (record only, no audio re-touched)

ITEM 0 (2026-07-14) independently re-measured the shipped bed loudness via
`ffmpeg -af ebur128` and got **-18.2 LUFS**, not the -21.8 the original work
order asked to document as "corrected" - flagged as a genuine discrepancy
between the two figures rather than silently accepting either.

**Now confirmed by Fable's ruling**: the bed loudness is **-18.0 LUFS
stereo** (matching this session's own -18.2 measurement and the pipeline's
own `BED_LUFS_TARGET` almost exactly - the small residual delta is ordinary
lossy-encoding variance, already noted in ITEM 0's report). **The earlier
-21.8 figure was a mono-downmix measurement error** - measuring a stereo
file after collapsing it to mono without correct level compensation reads
quieter than the file's actual stereo loudness, which is consistent with
-21.8 being roughly 3-4 LU below the correct -18.0/-18.2 reading in the same
direction this session's own investigation already suspected (ITEM 0's
report floated exactly this "measured at a reduced effective level"
possibility without being able to confirm the mechanism). No audio was
re-touched this pass - the shipped `bgm_loop`/`bgm_tension` files are
unchanged from ITEM 0; this is a documentation correction closing out the
discrepancy ITEM 0 flagged, not a new mastering pass.

## CLAUDE.md correction

Added one paragraph to the "Lock-exception mechanism" section, immediately
after the existing lift/restore procedure (the most relevant location, since
this is exactly the kind of thing anyone running a future sanctioned
`games/future_spinner/**` pass needs to know before they start):

> **The optimiser stage is not bit-reproducible.** Confirmed 2026-07-14: the
> raw simulation stage (`create_books`) is perfectly deterministic (seeded,
> reproduces byte-identical books across runs), but the separate
> weight-fitting optimiser is not - re-running it produces a
> statistically-equivalent but byte-different `lookUpTable_*.csv`. Published
> lookup tables are frozen truth: they are never regenerated outside an
> owner-sanctioned pass, and even then only to fill a genuinely missing
> file, never to "refresh" one that already exists and is already correct.

This records the real finding the sanctioned books-regeneration pass made
earlier this arc (`reports/archive/2026-07-14_sanctioned-books-regen.md`):
regenerating `books_super.jsonl.zst` via `run.py` also incidentally
recomputed `lookUpTable_cruise_0.csv`/`lookUpTable_antelite_0.csv`/
`lookUpTable_super_0.csv` and `index.json` with 100,000+ line diffs against
the already-published, already-correct versions, despite matching RTP
statistically - that pass reverted the incidental churn rather than
committing it. This CLAUDE.md line is the standing-instructions record of
why that reversion was correct, so a future session doesn't rediscover the
same surprise cold.

## Verification

- Grepped `CLAUDE.md`'s new paragraph for em/en dashes: zero matches.
- Cross-referenced the LUFS correction against ITEM 0's own report
  (`reports/archive/2026-07-14_item0-audio-seam-warmup.md`) to confirm the
  new figure is consistent with, not contradicting, this session's own
  independent measurement, rather than just accepting Fable's ruling on
  faith.
- Locked files confirmed untouched (`CLAUDE.md` is not a locked file, but
  checked anyway per habit):
  `git diff --stat -- frontend/src/lib/services/rgsService.ts frontend/src/lib/stores/gameStore.ts games/future_spinner/ .claude/settings.json`
  is empty.

## Not done this pass (flagged, not silent)

- No audio files were re-mastered or re-encoded - this is purely a
  record/documentation correction. If a future pass wants the shipped beds
  to measure exactly -18.0 rather than -18.2, that would be a new,
  separately-scoped mastering pass, not part of this correction.

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** placed
  the CLAUDE.md correction in the lock-exception mechanism section
  specifically (not a new section) since it's operationally relevant right
  where a future session would be reading before attempting another
  sanctioned `games/future_spinner/**` pass - the goal was to prevent the
  exact same surprise from recurring, not just to log that it happened once.
- **Alternatives rejected:** re-mastering the beds to force an exact -18.0
  reading (rejected - not requested; the brief asks to record the
  correction, not chase a fractional LUFS difference that's already within
  normal lossy-encoding variance).
- **Files touched:** `CLAUDE.md` (one new paragraph), this report + its
  dated archive copy. Locked files untouched.
- **Open threads:** this closes the entire 2026-07-14b follow-up work order
  (PRs 67-72 merged, ITEMS A-E all landed). Next: start the dev server and
  confirm it's ready for the owner's play-test, per the work order's closing
  instruction.
