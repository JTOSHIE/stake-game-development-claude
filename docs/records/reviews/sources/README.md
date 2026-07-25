# External review sources

Verbatim ingests of the external reviews, one file per review, never edited after
ingest. `REVIEW_TRACKER.md` one directory up is the working document; these are the
immutable originals it cites.

## Round one (ingested 2026-07-27, commit `2d3b8f1`)

| File | Review | SHA-256 | Status |
|---|---|---|---|
| `review1_claude.md` | Review 1 (Claude) | `6fac7e8218571e34bbb5f3c17aeb8fdf3569e90f44906119a6d8744207848b23` | Ingested |
| `review2.md` | Review 2 | `97b6a339bcf2f8d3583d9ab8c6f1e82e3a7dc3cf229d7b8d638c0da283c54dc0` | Ingested |
| `review3_openai.md` | Review 3 (OpenAI) | `69c5b1700317013044506c2ff515d055d80011ce0ac2f4905a75a99b2621abd0` | Ingested |

The paragraphs that previously stood here, recording all three round one files as
**AWAITING SOURCE TEXT**, were stale: the sources were supplied and ingested in `2d3b8f1`
and this README was not updated at the time. Corrected 2026-07-25 during the round two
ingest, with the hashes above computed from the committed files.

## Round two (ingested 2026-07-25, JOB 1 of `reports/briefs/FS_ROUND2_INGEST_AND_REMEDIATION_Prompt.md`)

| File | Review | Score | SHA-256 |
|---|---|---|---|
| `round2_review1.md` | Reviewer 1 | 2.00 / 3.00 | `9d1afe1eb405e89cec8388603c6525eae3668abe42cc6c7270b33f9e74f6c3ed` |
| `round2_review2.md` | Reviewer 2 | 1.67 / 3.00 | `69846329683ce08dc69253ff5ccf46cb136107f5496ba33f79d812f9a75ca933` |
| `round2_review3.md` | Reviewer 3 | 0.67 / 3.00 | `4b7cdab1b66fd43b88b03160bbcf7b7b5b729b214494c2e722c524e9a134c95e` |

All three reviewed HEAD `78d02cc`. Reviewer 3's file begins with the owner's own
separator line `Reviewer 3` and then the review's own title,
`**Future Spinner — Round-Two Approval Review**`, exactly as the source document carries
them.

### Provenance of the round two ingest

- **Source document:** `FUTURE SPINNER reviews round two. .docx`, 83,010 bytes,
  SHA-256 `7b00128f04eb78188d8a14f66463eaa5f75596e310b2f0cae64237a5315cf417`.
- **Path discrepancy, recorded rather than smoothed over.** The brief states the document
  is at `/Users/jt/Desktop/FUTURE_SPINNER_reviews_round_two__.docx`. No file exists at
  that path. The document was found at
  `/Users/jt/Downloads/FUTURE SPINNER reviews round two. .docx` (a Word lock file,
  `~$TURE SPINNER reviews round two. .docx`, sits beside it, so the document was open in
  Word when the brief was written). Same title, same round, and its contents match the
  brief's description of all three reviews and their scores exactly, including reviewer
  3's opening line and the reviewed HEAD. Recorded here because convention (m) requires
  the physical location of an external document to be stated, and because a brief and a
  filesystem disagreeing is itself worth keeping.
- **Extraction:** `pandoc -f docx -t gfm --wrap=none`. `pandoc` 
  (`/opt/homebrew/bin/pandoc`) was chosen over `textutil` because it preserves the
  document's tables, links and emphasis as markdown; `python-docx` is not installed on
  this machine. A `textutil -convert txt` extraction was taken alongside it and agrees on
  every boundary and score.
- **Split, proved lossless.** The extraction is 561 lines. Review 1 is lines 1 to 260,
  review 2 is lines 261 to 272, review 3 is lines 273 to 561. The three files
  concatenated in order are byte-identical to the single extraction
  (`cat round2_review1.md round2_review2.md round2_review3.md | cmp - full.md`, exit 0),
  so nothing was dropped, reordered or edited at the split. The split points are the
  owner's own separator lines `Reviewer 2, second review` and `Reviewer 3`, each of which
  begins the file it introduces.

### A note on reviewer 2's file

`round2_review2.md` is 12 lines and 31,822 bytes: the source document carries that entire
review as a handful of very long unbroken paragraphs with no sentence spacing at several
section joins (`...for modern high-volatility mathematics.Verification of
Book-to-Lookup Equality Script...`). That is how it arrived and it is preserved exactly.
It is not a truncated or corrupted ingest. Fable's disposition (a) on this review is
recorded in `REVIEW_TRACKER.md`.

## Convention

Paste each review's full text into its file, unedited, preserving the reviewers' own
numbering (round one review 3's `F3`, `F5`, `F7`, `F8`, `F10` are cited by that numbering
in the tracker, so it must be preserved to resolve those rows). Record the SHA-256 here at
ingest so any later claim about what a reviewer said can be checked against the file the
tracker was built from.
