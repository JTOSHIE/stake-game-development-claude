# The publish config's recorded hashes, recounted first-hand at HEAD

R071 TASK 8, 2026-08-15. **This file exists because TR-148 cited its evidence from a
GITIGNORED path**, `games/future_spinner/library/configs/config.json`, which no reviewer
cloning this repository can open. A finding whose evidence cannot be read is a finding
nobody can check, so the finding is recounted here from scratch and TR-148 now cites this
file. **Nothing was changed and nothing was regenerated**: the maths package is locked, the
published lookup tables are frozen truth, and this is a READ.

## Method, so the recount is checkable rather than trusted

Every hash below was computed with `hashlib.sha256` over the file's bytes in 1 MB chunks,
on 2026-08-15, against the working tree at `main`. **The artefact filenames in the table
below are deliberately NOT backticked.** In this repository a backticked path is a claim
that the file exists AT HEAD, and every file in this recount lives inside the gitignored
`library/` tree, which is the entire reason this document had to be written. Backticking
them would make the file assert the opposite of its own subject. The RECORDED column is the value
the publish config states for that file; the COMPUTED column is what the file on disk actually
hashes to. **The two are read from different places on purpose**: the recorded value comes
from the publish config, the computed one from `library/publish_files/`, which is where the
artefacts that would be uploaded actually live. Convention (l.4) is satisfied because the
two sides share nothing but the filename.

**ONE THING THE ORIGINAL FINDING DID NOT SAY, and it matters for anyone re-running this.**
The config names its lookup tables and books as bare filenames, and there is more than one
directory that could hold them. `library/lookup_tables/` holds `lookUpTableSegmented_*.csv`,
a DIFFERENT set with different names, and `library/books/` holds only two stray JSON books.
Resolving the config's filenames against either of those returns "file missing", which is a
different and much more alarming result than "hash differs". **The right resolution is
`library/publish_files/`**, and every figure below is computed against it.

## The recount

| Mode | Artefact | File | Recorded in config.json | Computed at HEAD | Verdict |
|---|---|---|---|---|---|
| cruise | lookup table | lookUpTable_cruise_0.csv | `2526bd6a1e4c6028...` | `da3e45c577866d73...` | **MISMATCH** |
| cruise | books | books_cruise.jsonl.zst | `7b5a1ddcfcdfde76...` | `7b5a1ddcfcdfde76...` | match |
| cruise | force record | force_record_cruise.json | `2dc86f54817403b9...` | `2dc86f54817403b9...` | match |
| antelite | lookup table | lookUpTable_antelite_0.csv | `5ba0d7b2d0d9cc13...` | `150a6d243dcca205...` | **MISMATCH** |
| antelite | books | books_antelite.jsonl.zst | `9e5e8a0ad24f0038...` | `9e5e8a0ad24f0038...` | match |
| antelite | force record | force_record_antelite.json | `a76ae7b309d0d822...` | `a76ae7b309d0d822...` | match |
| super | lookup table | lookUpTable_super_0.csv | `88cd990b2a4e0920...` | `2e94fe04ad0c44a6...` | **MISMATCH** |
| super | books | books_super.jsonl.zst | `c079226d718cab54...` | `c079226d718cab54...` | match |
| super | force record | force_record_super.json | `9589c9b731bce653...` | `9589c9b731bce653...` | match |

## What this reproduces, exactly

**All three of TR-148's claims hold at HEAD, recounted independently 2026-08-15:**

1. **The three recorded LOOKUP TABLE hashes do not match the shipped CSVs.** Not one of
   cruise, antelite or super agrees.
2. **All three books and all three force records DO match**, which is the part that makes
   this a narrow finding rather than a broad one: the artefacts carrying the round outcomes
   are exactly what the config says they are.
3. **The config covers three of the five shipped modes.** `bookShelfConfig` names cruise,
   antelite and super, and carries no entry for base or bonus, while `publish_files` holds
   books for all five.

## The likely cause, offered as an observation and NOT as a conclusion

`CLAUDE.md` records that **the optimiser stage is not bit-reproducible**: the raw simulation
is seeded and reproduces byte-identical books across runs, while the separate weight-fitting
optimiser produces a statistically equivalent but byte-different `lookUpTable_*.csv` each
time it runs. That is precisely the pattern here, with the books matching and only the
optimiser's output diverging, and it would mean the config recorded hashes from a different
optimiser run than the one whose CSVs shipped.

**It is not established here and it is not guessed at.** Whether the divergence is benign
provenance drift or a real packaging defect is a maths-adjacent submission question, which
convention (l.8) sends to the owner and Fable with the evidence attached rather than being
ruled on by the builder. TR-148 keeps it ESCALATED, and this file is the evidence.
